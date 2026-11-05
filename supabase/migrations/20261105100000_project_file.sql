-- The project file ("ficha"): accounts, documents and accesses can belong to
-- a project, so its page can gather them in tabs.
--
-- Accesses record WHERE a login lives (user, URL, which password manager),
-- never the password itself. A password in a table is one leak away from
-- every service it opens; the manager already keeps it encrypted.

alter table public.accounts add column if not exists project_id uuid;
alter table public.accounts
  add constraint accounts_project_fk foreign key (project_id, user_id)
  references public.projects (id, user_id) on delete set null (project_id);
create index if not exists accounts_project_idx on public.accounts (project_id);

alter table public.vault_items add column if not exists project_id uuid;
alter table public.vault_items
  add constraint vault_items_project_fk foreign key (project_id, user_id)
  references public.projects (id, user_id) on delete set null (project_id);
create index if not exists vault_items_project_idx on public.vault_items (project_id);

create table if not exists public.access_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  url text,
  username text,
  stored_in text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);
create index if not exists access_items_project_idx on public.access_items (project_id);
create trigger access_items_updated_at before update on public.access_items
  for each row execute function public.set_updated_at();

alter table public.access_items enable row level security;
revoke all on public.access_items from anon;
grant select, insert, update, delete on public.access_items to authenticated;
create policy access_items_select_own on public.access_items for select to authenticated
  using ((select auth.uid()) = user_id);
create policy access_items_insert_own on public.access_items for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy access_items_update_own on public.access_items for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy access_items_delete_own on public.access_items for delete to authenticated
  using ((select auth.uid()) = user_id);

-- The project logo, same as 20261105090000, so one paste covers both.
alter table public.projects
  add column if not exists logo text
  check (logo is null or (logo like 'data:image/%' and length(logo) <= 200000));
