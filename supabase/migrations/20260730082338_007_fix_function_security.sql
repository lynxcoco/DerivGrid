/*
# Fix SECURITY DEFINER function security — pin search_path + admin guards
*/

-- ── has_role: pin search_path ─────────────────────────────────────────────────
create or replace function has_role(_user_id uuid, _role app_role)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from user_roles where user_id = _user_id and role = _role
  );
$$;

-- ── credit_wallet: pin search_path ────────────────────────────────────────────
create or replace function credit_wallet(_wallet_id uuid, _amount_cents bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update wallets
  set balance_cents = balance_cents + _amount_cents,
      updated_at    = now()
  where id = _wallet_id;
$$;

-- ── get_wallet_balance: pin search_path ───────────────────────────────────────
create or replace function get_wallet_balance(_user_id uuid, _wallet_type wallet_type)
returns bigint
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(balance_cents, 0)
  from wallets
  where user_id = _user_id and wallet_type = _wallet_type
  limit 1;
$$;

-- ── admin_get_all_roles: pin search_path + add admin guard ────────────────────
create or replace function admin_get_all_roles()
returns table(user_id uuid, role text)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not has_role(auth.uid(), 'admin') then
    raise exception 'Access denied: admin role required';
  end if;
  return query select ur.user_id, ur.role::text from user_roles ur;
end;
$$;

-- ── admin_set_user_role: pin search_path ──────────────────────────────────────
create or replace function admin_set_user_role(_user_id uuid, _new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not has_role(auth.uid(), 'admin') then
    raise exception 'Access denied: admin role required';
  end if;
  delete from user_roles where user_id = _user_id;
  if _new_role <> 'user' then
    insert into user_roles (user_id, role)
    values (_user_id, _new_role::app_role);
  end if;
end;
$$;

-- ── handle_new_user: pin search_path ─────────────────────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.wallets (user_id, wallet_type, currency)
  values
    (new.id, 'main',    'KES'),
    (new.id, 'trading', 'KES');

  insert into public.user_roles (user_id, role) values (new.id, 'user');

  insert into public.candle_players (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notifications (user_id, title, body, type)
  values (new.id,
    'Welcome to DerivGrid!',
    'Your account is set up and ready. Make your first deposit to start trading.',
    'info');

  return new;
end;
$$;
