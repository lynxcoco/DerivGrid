/*
# Revoke PUBLIC execute on internal SECURITY DEFINER functions
Uses IF EXISTS to be safe on fresh databases.
*/

-- Internal-only: revoke from public entirely
do $$ begin
  revoke execute on function has_role(uuid, app_role) from public;
exception when undefined_function or undefined_object then null; end $$;

do $$ begin
  revoke execute on function handle_new_user() from public;
exception when undefined_function or undefined_object then null; end $$;

do $$ begin
  revoke execute on function credit_wallet(uuid, bigint) from public;
exception when undefined_function or undefined_object then null; end $$;

do $$ begin
  revoke execute on function get_wallet_balance(uuid, wallet_type) from public;
exception when undefined_function or undefined_object then null; end $$;

do $$ begin
  revoke execute on function admin_get_all_roles() from public;
exception when undefined_function or undefined_object then null; end $$;

do $$ begin
  revoke execute on function admin_set_user_role(uuid, text) from public;
exception when undefined_function or undefined_object then null; end $$;

-- User-facing: revoke from public, re-grant to authenticated only
do $$ begin
  revoke execute on function initiate_stk_push(numeric, text, text) from public;
  grant  execute on function initiate_stk_push(numeric, text, text) to authenticated;
exception when undefined_function or undefined_object then null; end $$;

do $$ begin
  revoke execute on function check_payment_status(text) from public;
  grant  execute on function check_payment_status(text) to authenticated;
exception when undefined_function or undefined_object then null; end $$;
