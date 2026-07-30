-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 005: Fix admin visibility of user_roles
-- Adds admin read policy and SECURITY DEFINER RPCs for role management.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Admin read policy on user_roles ──────────────────────────────────────
drop policy if exists "admins_read_all_roles" on user_roles;
create policy "admins_read_all_roles"
  on user_roles for select
  using (
    auth.uid() = user_id
    or has_role(auth.uid(), 'admin'::app_role)
  );

-- ─── 2. SECURITY DEFINER function: fetch all roles ────────────────────────────
create or replace function admin_get_all_roles()
returns table(user_id uuid, role text)
language sql
security definer
stable
as $$
  select user_id, role::text from user_roles;
$$;

-- ─── 3. SECURITY DEFINER function: atomically replace a user's role ───────────
create or replace function admin_set_user_role(_user_id uuid, _new_role text)
returns void
language plpgsql
security definer
as $$
begin
  if not has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Access denied: admin role required';
  end if;

  delete from user_roles where user_id = _user_id;

  if _new_role <> 'user' then
    insert into user_roles (user_id, role)
    values (_user_id, _new_role::app_role);
  end if;
end;
$$;