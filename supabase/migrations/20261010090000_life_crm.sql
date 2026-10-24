-- Life CRM: the private panel under /panel.
--
-- Every row belongs to one user. Row Level Security is the only gate that
-- matters: each table allows a signed-in user to read and write their own
-- rows and nothing else. The anon role gets no access at all.
--
-- Cross-table links (a task's project, a domain's project...) use composite
-- foreign keys on (id, user_id), so a row can only point at a parent that
-- belongs to the same user, even if someone guesses another user's id.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  timezone text not null default 'Europe/Madrid',
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Projects and courses (parents of other rows)
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  status text not null default 'active' check (status in ('idea', 'active', 'paused', 'done')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  progress smallint not null default 0 check (progress between 0 and 100),
  start_date date,
  target_date date,
  url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  teacher text,
  schedule text,
  room text,
  url text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- ---------------------------------------------------------------------------
-- Work items
-- ---------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  due_date date,
  due_time time,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'postponed')),
  category text,
  project_id uuid,
  course_id uuid,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id),
  foreign key (course_id, user_id) references public.courses (id, user_id) on delete set null (course_id)
);

create table public.course_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id uuid not null,
  kind text not null default 'assignment' check (kind in ('assignment', 'exam', 'practice', 'other')),
  title text not null check (char_length(title) between 1 and 200),
  due_date date,
  due_time time,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'postponed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  grade numeric(5, 2),
  description text,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (course_id, user_id) references public.courses (id, user_id) on delete cascade
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  date date not null,
  end_date date,
  start_time time,
  end_time time,
  category text not null default 'personal' check (category in (
    'personal', 'university', 'work', 'meeting', 'payment', 'renewal',
    'birthday', 'travel', 'appointment', 'sport', 'other'
  )),
  location text,
  notes text,
  recurrence text not null default 'none' check (recurrence in ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  recurrence_interval smallint not null default 1 check (recurrence_interval between 1 and 365),
  recurrence_until date,
  reminder_minutes integer check (reminder_minutes between 0 and 43200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= date)
);

-- ---------------------------------------------------------------------------
-- Money
-- ---------------------------------------------------------------------------

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  company text,
  category text not null default 'software' check (category in (
    'software', 'hosting', 'domains', 'email', 'ai', 'tools', 'gym',
    'phone', 'insurance', 'media', 'other'
  )),
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  frequency text not null default 'monthly' check (frequency in (
    'weekly', 'every_4_weeks', 'monthly', 'quarterly', 'semiannual', 'annual', 'custom'
  )),
  custom_days smallint check (custom_days between 1 and 3650),
  next_charge_date date not null,
  payment_method text,
  project_id uuid,
  url text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (frequency <> 'custom' or custom_days is not null),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null default 'expense' check (kind in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  date date not null,
  category text not null default 'other' check (category in (
    'housing', 'food', 'transport', 'university', 'business', 'software',
    'leisure', 'travel', 'shopping', 'income', 'other'
  )),
  description text,
  -- A planned payment: known, dated, not paid yet.
  planned boolean not null default false,
  project_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  domain text not null check (char_length(domain) between 3 and 253),
  project_id uuid,
  provider text,
  purchased_on date,
  renews_on date,
  cost numeric(10, 2) check (cost >= 0),
  auto_renew boolean not null default false,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);

-- ---------------------------------------------------------------------------
-- People, references and capture
-- ---------------------------------------------------------------------------

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  phone text,
  email text,
  company text,
  relationship text,
  birthday date,
  notes text,
  last_interaction date,
  next_action text,
  next_action_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  category text not null default 'other' check (category in (
    'contracts', 'university', 'companies', 'personal', 'insurance',
    'domains', 'invoices', 'notes', 'other'
  )),
  notes text,
  url text,
  date date,
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  category text,
  date date,
  -- Set when the item was turned into something else or dismissed.
  processed_at timestamptz,
  converted_to text check (converted_to in ('task', 'event', 'payment', 'project', 'note', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes: every query filters by user, most also by a date.
-- ---------------------------------------------------------------------------

create index projects_user_idx on public.projects (user_id, status);
create index courses_user_idx on public.courses (user_id);
create index tasks_user_due_idx on public.tasks (user_id, status, due_date);
create index tasks_project_idx on public.tasks (project_id);
create index tasks_course_idx on public.tasks (course_id);
create index course_items_user_due_idx on public.course_items (user_id, due_date);
create index course_items_course_idx on public.course_items (course_id);
create index events_user_date_idx on public.events (user_id, date);
create index subscriptions_user_idx on public.subscriptions (user_id, active, next_charge_date);
create index subscriptions_project_idx on public.subscriptions (project_id);
create index transactions_user_date_idx on public.transactions (user_id, date);
create index transactions_project_idx on public.transactions (project_id);
create index domains_user_renew_idx on public.domains (user_id, renews_on);
create index domains_project_idx on public.domains (project_id);
create index contacts_user_idx on public.contacts (user_id);
create index vault_user_idx on public.vault_items (user_id, expires_on);
create index inbox_user_idx on public.inbox_items (user_id, processed_at);

-- ---------------------------------------------------------------------------
-- updated_at triggers, RLS and policies, applied to every table alike.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
  owner_col text;
begin
  foreach t in array array[
    'profiles', 'projects', 'courses', 'tasks', 'course_items', 'events',
    'subscriptions', 'transactions', 'domains', 'contacts', 'vault_items',
    'inbox_items'
  ]
  loop
    owner_col := 'user_id';

    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_updated_at', t
    );

    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);

    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = %I)',
      t || '_select_own', t, owner_col
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = %I)',
      t || '_insert_own', t, owner_col
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = %I) with check ((select auth.uid()) = %I)',
      t || '_update_own', t, owner_col, owner_col
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = %I)',
      t || '_delete_own', t, owner_col
    );
  end loop;
end;
$$;

revoke execute on function public.set_updated_at() from anon, authenticated, public;
