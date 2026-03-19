-- FitQuest 100: Initial Schema
-- MVP tables: profiles, check_ins, meals, weight_records

-- ============================================================
-- 1. Profiles (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nickname text not null,
  avatar_url text,
  gender text check (gender in ('male', 'female', 'other')),
  weight_kg decimal,
  daily_calorie_goal int not null default 2000,
  timezone text not null default 'Asia/Taipei',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nickname)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. Check-ins (daily exercise log)
-- ============================================================
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_type text not null,
  duration_minutes int not null check (duration_minutes >= 1),
  calories_burned int not null default 0,
  notes text,
  is_offline_sync boolean not null default false,
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_check_ins_user_date on public.check_ins (user_id, checked_in_at);

alter table public.check_ins enable row level security;

create policy "Users can view own check-ins"
  on public.check_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert own check-ins"
  on public.check_ins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own check-ins"
  on public.check_ins for update
  using (auth.uid() = user_id);

create policy "Users can delete own check-ins"
  on public.check_ins for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. Meals (diet tracking)
-- ============================================================
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  calories int not null default 0,
  protein_g decimal,
  carbs_g decimal,
  fat_g decimal,
  photo_url text,
  is_ai_recognized boolean not null default false,
  eaten_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_meals_user_date on public.meals (user_id, eaten_at);

alter table public.meals enable row level security;

create policy "Users can view own meals"
  on public.meals for select
  using (auth.uid() = user_id);

create policy "Users can insert own meals"
  on public.meals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meals"
  on public.meals for update
  using (auth.uid() = user_id);

create policy "Users can delete own meals"
  on public.meals for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. Weight Records
-- ============================================================
create table public.weight_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  weight_kg decimal not null check (weight_kg > 0),
  body_fat_pct decimal check (body_fat_pct >= 0 and body_fat_pct <= 100),
  recorded_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_weight_records_user_date on public.weight_records (user_id, recorded_at);

alter table public.weight_records enable row level security;

create policy "Users can view own weight records"
  on public.weight_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own weight records"
  on public.weight_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weight records"
  on public.weight_records for update
  using (auth.uid() = user_id);

create policy "Users can delete own weight records"
  on public.weight_records for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. Updated-at trigger (reusable)
-- ============================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
