-- XP System foundational tables (retry without IF NOT EXISTS on policies)

-- Tables
create table if not exists public.user_xp_levels (
  user_id uuid primary key,
  current_xp integer not null default 0,
  current_level integer not null default 1,
  total_xp_earned integer not null default 0,
  level_up_count integer not null default 0,
  last_xp_earned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  activity_type text not null,
  xp_earned integer not null,
  description text,
  created_at timestamptz not null default now()
);

-- Trigger function and trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql security definer set search_path = public;

create trigger trg_user_xp_levels_updated_at
before update on public.user_xp_levels
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.user_xp_levels enable row level security;
alter table public.xp_activity_log enable row level security;

-- Policies: ensure idempotency by dropping if they exist
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='user_xp_levels' and policyname='Users can view own xp') then
    execute 'drop policy "Users can view own xp" on public.user_xp_levels';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='user_xp_levels' and policyname='Users can insert own xp row') then
    execute 'drop policy "Users can insert own xp row" on public.user_xp_levels';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='user_xp_levels' and policyname='Users can update own xp') then
    execute 'drop policy "Users can update own xp" on public.user_xp_levels';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='xp_activity_log' and policyname='Users can view own xp activity') then
    execute 'drop policy "Users can view own xp activity" on public.xp_activity_log';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='xp_activity_log' and policyname='Users can insert own xp activity') then
    execute 'drop policy "Users can insert own xp activity" on public.xp_activity_log';
  end if;
end $$;

create policy "Users can view own xp" on public.user_xp_levels
for select to authenticated using (auth.uid() = user_id);

create policy "Users can insert own xp row" on public.user_xp_levels
for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update own xp" on public.user_xp_levels
for update to authenticated using (auth.uid() = user_id);

create policy "Users can view own xp activity" on public.xp_activity_log
for select to authenticated using (auth.uid() = user_id);

create policy "Users can insert own xp activity" on public.xp_activity_log
for insert to authenticated with check (auth.uid() = user_id);

-- Indexes
create index if not exists idx_user_xp_levels_user on public.user_xp_levels(user_id);
create index if not exists idx_xp_activity_user_created on public.xp_activity_log(user_id, created_at desc);
