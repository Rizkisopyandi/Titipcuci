begin;

create type public.user_role as enum ('OWNER', 'ADMIN', 'CUSTOMER');
create type public.profile_status as enum ('ACTIVE', 'DISABLED');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete restrict,
  role public.user_role not null default 'CUSTOMER',
  full_name text check (full_name is null or char_length(trim(full_name)) between 2 and 100),
  phone text check (phone is null or char_length(trim(phone)) between 8 and 20),
  status public.profile_status not null default 'ACTIVE',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.profiles is
  'Application profile linked one-to-one to Supabase Auth. Role is never accepted from public registration.';

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create function public.set_profile_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function public.set_profile_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_profile_updated_at();

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, status)
  values (
    new.id,
    'CUSTOMER'::public.user_role,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    'ACTIVE'::public.profile_status
  );
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

commit;
