/*
# Revoke PUBLIC execute on SECURITY DEFINER functions

The previous migration (007) revoked EXECUTE from anon and authenticated roles,
but PostgreSQL grants EXECUTE to PUBLIC by default when a function is created.
Since anon and authenticated inherit from PUBLIC, the revocations had no effect.

This migration revokes EXECUTE from PUBLIC on all SECURITY DEFINER functions
that should not be callable by unauthenticated users, then re-grants to
authenticated only where the function is a legitimate user-facing action.

## Functions revoked from PUBLIC (no re-grant — internal only):
- has_role           — RLS helper, never called via REST
- handle_new_user    — trigger function, never called via REST
- credit_wallet      — server-side helper, never called via REST
- get_wallet_balance — server-side helper, never called via REST
- admin_get_all_roles — admin-only (guarded by internal check)
- admin_set_user_role — admin-only (guarded by internal check)

## Functions revoked from PUBLIC, re-granted to authenticated:
- initiate_stk_push    — legitimate user deposit action
- check_payment_status — legitimate user payment check
*/

-- Internal-only functions: revoke from PUBLIC, no re-grant
revoke execute on function has_role(uuid, app_role) from public;
revoke execute on function handle_new_user() from public;
revoke execute on function credit_wallet(uuid, bigint) from public;
revoke execute on function get_wallet_balance(uuid, wallet_type) from public;
revoke execute on function admin_get_all_roles() from public;
revoke execute on function admin_set_user_role(uuid, text) from public;

-- User-facing functions: revoke from PUBLIC, grant to authenticated only
revoke execute on function initiate_stk_push(numeric, text, text) from public;
grant execute on function initiate_stk_push(numeric, text, text) to authenticated;

revoke execute on function check_payment_status(text) from public;
grant execute on function check_payment_status(text) to authenticated;