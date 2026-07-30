/*
# Fix SECURITY DEFINER function security issues

## Problem
Supabase security advisor flagged three categories of issues across several
SECURITY DEFINER functions:

1. **Mutable search_path** — `has_role`, `admin_get_all_roles`, `admin_set_user_role`
   (and also `credit_wallet`, `get_wallet_balance` which have the same issue)
   are SECURITY DEFINER without a pinned `search_path`, making them vulnerable
   to search_path hijacking.

2. **Public (anon) can execute SECURITY DEFINER functions** — By default PostgreSQL
   grants EXECUTE to PUBLIC. Six functions were callable by unauthenticated users
   via the REST API.

3. **Any authenticated user can execute admin-only SECURITY DEFINER functions** —
   `admin_get_all_roles` and `admin_set_user_role` were callable by any signed-in
   user, not just admins.

## Changes

### Search path hardening (5 functions)
- `has_role`           — add `set search_path = public`
- `credit_wallet`      — add `set search_path = public`
- `get_wallet_balance` — add `set search_path = public`
- `admin_get_all_roles` — add `set search_path = public`
- `admin_set_user_role` — add `set search_path = public`

### Execute permission revocation
- `has_role`           — revoke from anon + authenticated (internal RLS helper, never called via REST)
- `handle_new_user`    — revoke from anon + authenticated (trigger function, never called via REST)
- `admin_get_all_roles` — revoke from anon (authenticated kept — guarded by internal admin check)
- `admin_set_user_role` — revoke from anon (authenticated kept — already has internal admin check)
- `initiate_stk_push`  — revoke from anon (authenticated kept — legitimate user action)
- `check_payment_status` — revoke from anon (authenticated kept — legitimate user action)

### Internal admin authorization check
- `admin_get_all_roles` — converted to plpgsql with `has_role(auth.uid(), 'admin')` guard
  so non-admin authenticated users get an error instead of seeing all user roles.

## Security impact
- Unauthenticated users can no longer call any SECURITY DEFINER function via REST.
- Non-admin signed-in users can no longer call admin role-management functions.
- Internal helper/trigger functions are no longer exposed via the REST API at all.
- All SECURITY DEFINER functions now have a pinned search_path, preventing
  search_path hijacking attacks.
*/