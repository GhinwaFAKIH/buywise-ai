# BuyWise AI database security — review before public launch

Status (2026-10-21): Supabase Security Advisor reports five public tables with RLS disabled and the `anon`/`authenticated` PostgREST roles have wide grants. This exposes sensitive authentication and customer data through Supabase's Data API. **No database permissions have been changed by this document.**

The BuyWise backend connects through PostgreSQL using the `postgres` role and manages account access and tokens on the server, not via the Supabase browser client.

Proposed database isolation SQL (for review/approval only):

```sql
BEGIN;
REVOKE ALL ON TABLE public.bw_users, public.bw_sessions, public.bw_auth_attempts, public.bw_waitlist, public.bw_usage FROM anon, authenticated;
ALTER TABLE public.bw_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bw_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bw_auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bw_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bw_usage ENABLE ROW LEVEL SECURITY;
COMMIT;
```

This proposal intentionally creates no permissive policies for public Supabase roles; the direct backend connection is intended to retain access as table owner. Before any execution, verify the actual database role in Render, back up schema/data, assess other integrations and explicitly approve the change. After applying: test registration, login, paid checkout, and backend usage; run Supabase security advisors again. In production consider moving these tables into a dedicated non-exposed schema.

Supabase guidance: https://supabase.com/docs/guides/database/row-level-security
