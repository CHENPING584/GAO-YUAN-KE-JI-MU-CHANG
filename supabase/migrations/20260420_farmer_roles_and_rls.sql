create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'app_role'
  ) then
    create type public.app_role as enum ('user', 'pending_farmer', 'farmer');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'application_status'
  ) then
    create type public.application_status as enum ('pending', 'approved', 'rejected');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  phone text,
  wechat_qr_url text,
  ranch_location text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create table if not exists public.farmer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  real_name text not null,
  id_card text not null,
  ranch_proof_video text not null,
  status public.application_status not null default 'pending',
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists farmer_applications_one_pending_per_user
on public.farmer_applications (user_id)
where status = 'pending';

drop trigger if exists set_farmer_applications_updated_at on public.farmer_applications;
create trigger set_farmer_applications_updated_at
before update on public.farmer_applications
for each row execute procedure public.set_updated_at();

create or replace function public.sync_profile_role_from_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles
    set
      role = 'pending_farmer',
      updated_at = timezone('utc', now())
    where id = new.user_id
      and role = 'user';

    return new;
  end if;

  if new.status = 'approved' then
    update public.profiles
    set
      role = 'farmer',
      updated_at = timezone('utc', now())
    where id = new.user_id;
  elsif new.status = 'rejected' then
    update public.profiles
    set
      role = 'user',
      updated_at = timezone('utc', now())
    where id = new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists farmer_application_after_insert on public.farmer_applications;
create trigger farmer_application_after_insert
after insert on public.farmer_applications
for each row execute procedure public.sync_profile_role_from_application();

drop trigger if exists farmer_application_after_update on public.farmer_applications;
create trigger farmer_application_after_update
after update of status on public.farmer_applications
for each row execute procedure public.sync_profile_role_from_application();

create or replace function public.is_farmer(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = target_user_id
      and role = 'farmer'
  );
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  description text,
  price numeric(10, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.farmer_applications enable row level security;
alter table public.products enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "farmer_applications_insert_own" on public.farmer_applications;
create policy "farmer_applications_insert_own"
on public.farmer_applications
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "farmer_applications_select_own" on public.farmer_applications;
create policy "farmer_applications_select_own"
on public.farmer_applications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "farmers_can_insert_products" on public.products;
create policy "farmers_can_insert_products"
on public.products
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and public.is_farmer(auth.uid())
);

drop policy if exists "farmers_can_update_own_products" on public.products;
create policy "farmers_can_update_own_products"
on public.products
for update
to authenticated
using (
  auth.uid() = owner_id
  and public.is_farmer(auth.uid())
)
with check (
  auth.uid() = owner_id
  and public.is_farmer(auth.uid())
);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
on public.products
for select
to anon, authenticated
using (true);
