-- University as a degree plan, not only a list of deadlines.
--
-- A course now says where it sits in the plan (code, ECTS, year, semester,
-- kind), where it is in the student's life (pending, planned, enrolled,
-- passed, and in which academic year) and what is still unconfirmed.
-- Everything is nullable or has a default: rows that existed keep working.
--
-- The degree itself (total ECTS, elective ECTS, ECTS passed according to the
-- official transcript) is a row of its own. The share of the degree completed
-- is only ever computed from `passed_ects`, which is copied from the
-- transcript by hand; it is never inferred from the courses typed here.

alter table public.courses
  add column if not exists code text check (code is null or char_length(code) between 1 and 20),
  add column if not exists ects numeric(4, 1) check (ects is null or ects between 0.5 and 60),
  add column if not exists plan_year smallint check (plan_year is null or plan_year between 1 and 6),
  add column if not exists semester text check (semester is null or semester in ('first', 'second', 'annual')),
  add column if not exists category text not null default 'core'
    check (category in ('core', 'elective', 'thesis', 'internship')),
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'planned', 'enrolled', 'passed')),
  add column if not exists academic_year text
    check (academic_year is null or academic_year ~ '^[0-9]{4}-[0-9]{4}$'),
  add column if not exists grade numeric(4, 2) check (grade is null or grade between 0 and 10),
  add column if not exists to_confirm text check (to_confirm is null or char_length(to_confirm) <= 200);

-- A course item can be paperwork: an internship application, a document.
alter table public.course_items drop constraint if exists course_items_kind_check;
alter table public.course_items add constraint course_items_kind_check
  check (kind in ('assignment', 'exam', 'practice', 'admin', 'other'));

create table if not exists public.degrees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  university text check (university is null or char_length(university) <= 160),
  total_ects numeric(5, 1) not null check (total_ects between 1 and 600),
  elective_ects numeric(5, 1) check (elective_ects is null or elective_ects between 0 and 600),
  passed_ects numeric(5, 1) check (passed_ects is null or passed_ects between 0 and 600),
  passed_ects_as_of date,
  url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger degrees_updated_at before update on public.degrees
  for each row execute function public.set_updated_at();

alter table public.degrees enable row level security;
revoke all on public.degrees from anon;
grant select, insert, update, delete on public.degrees to authenticated;
create policy degrees_select_own on public.degrees for select to authenticated
  using ((select auth.uid()) = user_id);
create policy degrees_insert_own on public.degrees for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy degrees_update_own on public.degrees for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy degrees_delete_own on public.degrees for delete to authenticated
  using ((select auth.uid()) = user_id);
