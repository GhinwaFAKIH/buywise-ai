# BuyWise AI: PWA and mobile plan

## Inspected architecture
Next.js App Router frontend on Vercel; FastAPI API on Render. The browser uses same-origin POST /api/{endpoint}, which forwards cookies to the Python service. Existing account, subscription and analysis workflows remain intact. No PWA existed before this change.

## First implementation
Manifest, standalone display, home screen icons, install guidance, online/offline status and a production service worker. Only public fallback assets are cached; no account, payment, analysis response or authenticated page is cached. Offline navigation displays a reconnect page. This does not provide offline analysis or saved history.

## Release checks
Run npm ci and npm run build in frontend. Deploy the branch to a Vercel preview over HTTPS. Verify manifest and icon responses, service worker scope and no-cache header. On Android Chrome test installation and standalone launch; on iPhone Safari test Share → Add to Home Screen. After one online visit, disable connectivity and reload to verify fallback; reconnect and verify analysis, sign-in, sign-out and billing. Verify updates with a second deployment.

## iOS and Android preparation
Keep FastAPI as the shared service. Before an Expo client, define a versioned API contract and extract product payload validation, result types and HTTP errors into a shared package. The current cookie/proxy flow must be replaced or extended with explicit mobile authentication and secure credential storage; never embed backend secrets. Design camera permission and barcode lookup separately from ingredient-label OCR. Plan user-owned saved analyses and deletion before syncing skin profiles. Native payments and store release requirements must be checked when implementation begins.

## Next product milestones
1. Reliable saved analyses with explicit user control and deletion.
2. Product comparison using consistent unit prices and evidence sources.
3. Optional skin profile with clear limits on personalization.
4. Barcode lookup and ingredient photo extraction with confirmation before analysis.
5. Expo iOS/Android client using the shared service.
