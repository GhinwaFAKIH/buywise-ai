# Deploy BuyWise AI

The app has two parts:

- **Frontend:** Next.js in `frontend/`
- **Backend:** FastAPI at the repository root

## 1. Deploy the FastAPI backend on Render

1. Sign in to Render and choose **New + → Blueprint**.
2. Connect the GitHub repository `GhinwaFAKIH/buywise-ai`.
3. Render will detect `render.yaml`.
4. Create the service.
5. Copy the public backend URL, for example:
   `https://buywise-ai-api.onrender.com`

Do not worry about `ALLOWED_ORIGINS` yet. Set it after the frontend is deployed.

## 2. Deploy the frontend on Vercel

1. Sign in to Vercel and import the GitHub repository.
2. Set **Root Directory** to:
   `frontend`
3. Add this environment variable:

   `API_URL=https://YOUR-RENDER-URL.onrender.com`

4. Deploy.
5. Copy the Vercel frontend URL.

## 3. Allow the frontend in the backend

Return to Render → your BuyWise API service → **Environment**.

Set:

`ALLOWED_ORIGINS=https://YOUR-VERCEL-URL.vercel.app`

If you later add a custom domain, separate origins with commas.

Example:

`https://buywise-ai.vercel.app,https://buywise.ai`

Save the environment variable and let Render redeploy.

## 4. Test

Open the Vercel URL and use **Try an example**, then analyze the product.

Also verify:

- Backend health: `https://YOUR-RENDER-URL.onrender.com/health`
- API docs: `https://YOUR-RENDER-URL.onrender.com/docs`

## Notes

Some retailer sites block automated requests from cloud servers. If a URL cannot be extracted, BuyWise will fall back to the editable product form. Retailer-specific integrations can be added over time.

## Hosted AI explanations (Ollama Cloud)

In Render → service → Environment, add:

- `OLLAMA_API_KEY`: your Ollama Cloud key, kept on the backend only.
- `OLLAMA_MODEL`: `gpt-oss:20b`, or a model available to your account.

Save and deploy the latest commit. Never put the key in a NEXT_PUBLIC variable or GitHub. Model access and credits depend on your Ollama account; check pricing and usage limits. Product details are sent to Ollama when enabled. Without a key, or if the provider fails, rule-based analysis remains available. Research also searches product pages, available reviews and PubMed/PMC ingredient studies, with source links. Retrieval may be blocked or incomplete.

## Accounts and affordable subscriptions

Plans: Free = 3 analyses total per account, Starter = €2.99/month for 20,
Plus = €5.99/month for 60. Paid allowances reset with the Stripe billing
period and do not roll over. Failed server-side analyses refund the allowance.

In Render → Environment, set:

- `DATABASE_URL`: a persistent PostgreSQL connection string. Never use Render's ephemeral local filesystem for live accounts.
- `STRIPE_SECRET_KEY`: begin with a Stripe test key (`sk_test_…`).
- `STRIPE_WEBHOOK_SECRET`: the signing secret for the webhook below.
- `PUBLIC_APP_URL`: the stable HTTPS frontend URL, with no trailing path.

In Stripe, add webhook endpoint:
`https://buywise-ai-api.onrender.com/stripe-webhook`

Subscribe to `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, `customer.subscription.deleted`,
`invoice.paid`, and `invoice.payment_failed`.

Enable Stripe's customer portal for payment method updates and cancellation.
Do not enable portal plan changes: these inline prices have plan metadata tied
to the original checkout. A user can cancel the existing plan and subscribe to
another after cancellation completes.

Deploy the latest backend commit. Tables are initialized on first use. Sign up,
run three analyses and verify the fourth is blocked. In test mode, complete
checkout with a Stripe test card, verify the signed webhook activates the
allowance, test cancellation and payment failure. Test mode is displayed in
the UI. After verifying, replace the secret and webhook settings with live-mode
values to collect real payments; configure the live webhook and portal too.
Never put secret keys in frontend variables or commit them.

Without `DATABASE_URL`, the public preview remains available and quotas are
not enforced. With a database but without Stripe configuration, accounts and
three free checks work; paid plans are marked as opening soon. Launch emails
are saved in PostgreSQL or forwarded to `WAITLIST_WEBHOOK_URL`; otherwise the
form explains that notifications are not connected.

Account email verification and password recovery are not implemented yet.
For local automated tests only, use `BUYWISE_DEV_DATABASE_PATH` pointing to a
temporary SQLite file; this option is ignored on Render.
