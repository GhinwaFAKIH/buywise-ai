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

   `NEXT_PUBLIC_API_URL=https://YOUR-RENDER-URL.onrender.com`

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

Open the Vercel URL and paste a Sephora France product link.

Also verify:

- Backend health: `https://YOUR-RENDER-URL.onrender.com/health`
- API docs: `https://YOUR-RENDER-URL.onrender.com/docs`

## Notes

Some retailer sites block automated requests from cloud servers. If a URL cannot be extracted, BuyWise will fall back to the editable product form. Retailer-specific integrations can be added over time.
