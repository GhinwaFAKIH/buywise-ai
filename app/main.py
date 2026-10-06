import os

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.extractor import ProductExtractionError, extract_product_from_url
from app.models import ProductInput, ProductAnalysis
from app.scoring import analyze_product
from app.ai_report import explain_product
from app.research import research_product, retrieve_reviews
from app import accounts, billing
from app.url_models import ExtractedProduct, ProductUrlInput, WaitlistInput

app = FastAPI(
    title="BuyWise AI API",
    description="Evidence-aware product scoring for smarter shopping decisions.",
    version="0.2.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "BuyWise AI",
        "message": "Paste a product URL or product data to start an analysis.",
        "version": "0.2.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/extract", response_model=ExtractedProduct)
def extract(payload: ProductUrlInput):
    try:
        data = extract_product_from_url(str(payload.url))
        return ExtractedProduct(**data)
    except ProductExtractionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/analyze", response_model=ProductAnalysis)
def analyze(product: ProductInput, request: Request):
    reservation = accounts.reserve_analysis(request.cookies.get(accounts.COOKIE))
    try:
        sources, status = research_product(product)
        reviews = retrieve_reviews(product, sources)
        enriched = product
        if reviews and product.rating is None and product.review_count is None:
            enriched = product.model_copy(update={"rating": reviews["rating"], "review_count": reviews["review_count"]})
        analysis = analyze_product(enriched)
        analysis.research_sources = sources
        analysis.research_status = status
        analysis.retrieved_reviews = reviews
        analysis.ai_report, analysis.ai_status = explain_product(product, analysis)
        return analysis
    except Exception:
        accounts.refund_analysis(reservation)
        raise


def set_session(response, token):
    response.set_cookie(accounts.COOKIE, token, max_age=30*86400, httponly=True, secure=True, samesite="lax", path="/")


@app.post("/signup")
def signup(payload: accounts.Credentials, response: Response):
    token, user = accounts.register(payload)
    set_session(response, token)
    return user


@app.post("/login")
def login(payload: accounts.Credentials, response: Response):
    token, user = accounts.login(payload)
    set_session(response, token)
    return user


@app.post("/account")
def account(request: Request):
    result = {"accounts_enabled": accounts.configured(), "billing_enabled": billing.enabled(), "billing_mode": "test" if os.getenv("STRIPE_SECRET_KEY", "").startswith("sk_test_") else "live", "user": None}
    if accounts.configured() and request.cookies.get(accounts.COOKIE):
        try: result["user"] = accounts.account(request.cookies.get(accounts.COOKIE))
        except HTTPException as exc:
            if exc.status_code != 401: raise
    return result


@app.post("/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get(accounts.COOKIE)
    if accounts.configured() and token:
        import hashlib
        with accounts.database() as conn: conn.execute("DELETE FROM bw_sessions WHERE token=%s",(hashlib.sha256(token.encode()).hexdigest(),))
    response.delete_cookie(accounts.COOKIE, path="/", secure=True, httponly=True, samesite="lax")
    return {"ok": True}


@app.post("/checkout")
def checkout(payload: billing.CheckoutInput, request: Request):
    return billing.checkout(request.cookies.get(accounts.COOKIE),payload.plan)


@app.post("/portal")
def portal(request: Request):
    return billing.portal(request.cookies.get(accounts.COOKIE))


@app.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    event = billing.validate_event(await request.body(),request.headers.get("stripe-signature"))
    from starlette.concurrency import run_in_threadpool
    return await run_in_threadpool(billing.process_event, event)


@app.post("/waitlist")
def join_waitlist(payload: WaitlistInput):
    webhook_url = os.getenv("WAITLIST_WEBHOOK_URL")
    forwarded = False

    if webhook_url:
        try:
            import requests
            response = requests.post(
                webhook_url,
                json={"email": payload.email},
                timeout=10,
            )
            response.raise_for_status()
            forwarded = True
        except requests.RequestException:
            forwarded = False

    saved = False
    if accounts.configured():
        with accounts.database() as conn:
            conn.execute("INSERT INTO bw_waitlist(email,created) VALUES (%s,%s) ON CONFLICT(email) DO NOTHING", (accounts.credentials_email(payload.email), int(__import__('time').time())))
        saved = True
    if not forwarded and not saved:
        raise HTTPException(503, "Launch notifications are not connected yet. Please check back soon.")
    return {"ok": True, "message": "Thanks — you're on the BuyWise early-access list.", "forwarded": forwarded}
