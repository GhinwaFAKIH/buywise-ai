export const runtime = "nodejs";
export const maxDuration = 60;

const endpoints = new Set(["extract", "analyze", "waitlist", "signup", "login", "account", "logout", "checkout", "portal"]);

export async function POST(request, { params }) {
  const { endpoint } = await params;
  if (!endpoints.has(endpoint)) {
    return Response.json({ detail: "Unknown endpoint." }, { status: 404 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ detail: "Invalid JSON request." }, { status: 400 });
  }

  const baseUrl = (
    process.env.API_URL || "https://buywise-ai-api.onrender.com"
  ).replace(/\/+$/, "");

  try {
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": request.headers.get("cookie") || "" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(55000),
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { detail: "The analysis service is unavailable. Please try again shortly." },
        { status: 502 }
      );
    }
    const headers = {};
    const cookie = response.headers.get("set-cookie");
    if (cookie) headers["Set-Cookie"] = cookie;
    return Response.json(data, { status: response.status, headers });
  } catch {
    return Response.json(
      { detail: "The analysis service is starting up or unavailable. Wait a minute and try again." },
      { status: 503 }
    );
  }
}
