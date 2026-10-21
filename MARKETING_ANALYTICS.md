# BuyWise AI: analytics setup

A minimal, opt-in Plausible Analytics integration is present in `frontend/app/layout.js`.

## Activate
1. Set up a site in Plausible Analytics with your actual production domain.
2. In Vercel project Environment Variables, add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` containing only that hostname (not a URL).
3. Redeploy the frontend. Visits to the homepage and Beauty Guides will then be visible in Plausible.
4. Verify using a normal browser visit and the Plausible realtime dashboard. Until this variable is provided, **no external analytics script loads**.

This integration avoids sending user emails, search terms or form contents to Plausible and does not install cookies from BuyWise application code. Check your public privacy notice and applicable local requirements before deployment.

## Useful weekly metrics
- Search Console: total search impressions, clicks, CTR, indexed pages.
- Plausible: visitors, referral sources, top landing pages, guide -> homepage flow.
- BuyWise backend (aggregates only): new free signups and paid plans activated after valid webhook confirmations.

Avoid analytics events containing ingredients, personally identifying data, payments, emails or query strings.
