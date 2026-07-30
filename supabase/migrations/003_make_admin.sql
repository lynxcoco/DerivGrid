-- ═══════════════════════════════════════════════════════════════════════════════
-- DerivGrid — GRANT ADMIN ROLE
-- Run this after 20260724121731_001_full_schema.sql to promote a user to admin.
--
-- Steps:
--   1. Register at /auth
--   2. Go to: Supabase Dashboard → Authentication → Users → copy your UUID
--   3. Replace YOUR_USER_ID_HERE below with that UUID
--   4. Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- Replace this UUID with your actual user ID from Supabase Auth → Users
do $$
declare
  v_user_id uuid := 'YOUR_USER_ID_HERE';
begin
  if v_user_id::text = 'YOUR_USER_ID_HERE' then
    raise exception 'Please replace YOUR_USER_ID_HERE with your actual user UUID before running this script.';
  end if;

  insert into user_roles (user_id, role)
  values (v_user_id, 'admin')
  on conflict (user_id, role) do nothing;

  -- Upgrade from plain 'user' if needed
  update user_roles set role = 'admin'
  where user_id = v_user_id and role = 'user';

  raise notice 'Admin role granted to user %', v_user_id;
end $$;

-- Verify:
select ur.user_id, ur.role, p.full_name
from user_roles ur
left join profiles p on p.id = ur.user_id
where ur.role = 'admin';
