-- Life CRM: partners, shared expenses, colours, a task board and domain costs.
--
--  partners / project_partners   who else is in a project, and with what share
--  charges.paid_by_partner_id    who actually paid a charge (null = yo)
--  charge_shares                 how one charge splits between people
--  charges.domain_id             a domain renewal is a charge like any other
--  projects.color                a colour per project, chosen from the palette
--  tasks.position                order inside a board column, for dragging
--
-- A share is a percentage of the charge, so "quién ha pagado" and "quién debe
-- qué" are two different questions with two different answers.

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  email text,
  phone text,
  company text,
  notes text,
  source text,
  import_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.project_partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid not null,
  partner_id uuid not null,
  -- Percentage of the project's shared costs. Null means "to be agreed".
  share numeric(5, 2) check (share >= 0 and share <= 100),
  role text,
  notes text,
  import_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, partner_id),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade,
  foreign key (partner_id, user_id) references public.partners (id, user_id) on delete cascade
);

create table public.charge_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  charge_id uuid not null,
  -- Null means the owner's own share.
  partner_id uuid,
  share numeric(5, 2) check (share >= 0 and share <= 100),
  amount numeric(12, 2) check (amount >= 0),
  settled boolean not null default false,
  notes text,
  import_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (charge_id, user_id) references public.charges (id, user_id) on delete cascade,
  foreign key (partner_id, user_id) references public.partners (id, user_id) on delete cascade
);

alter table public.charges
  add column paid_by_partner_id uuid,
  add column shared boolean not null default false,
  add column domain_id uuid,
  add foreign key (paid_by_partner_id, user_id) references public.partners (id, user_id) on delete set null (paid_by_partner_id),
  add foreign key (domain_id, user_id) references public.domains (id, user_id) on delete set null (domain_id);

alter table public.domains add constraint domains_id_user_key unique (id, user_id);

-- A colour from the panel palette, so a project is recognisable at a glance.
-- Never the only carrier of meaning: the name is always next to it.
alter table public.projects
  add column color text not null default 'slate'
    check (color in ('slate', 'mint', 'sky', 'violet', 'amber', 'rose', 'teal', 'sand'));

-- Order inside a board column. Dragging rewrites it.
alter table public.tasks add column position numeric not null default 0;

create index partners_user_idx on public.partners (user_id);
create index project_partners_project_idx on public.project_partners (project_id);
create index project_partners_partner_idx on public.project_partners (partner_id);
create index charge_shares_charge_idx on public.charge_shares (charge_id);
create index charge_shares_partner_idx on public.charge_shares (partner_id);
create index charges_paid_by_idx on public.charges (paid_by_partner_id);
create index charges_domain_idx on public.charges (domain_id);
create index tasks_board_idx on public.tasks (user_id, status, position);

do $$
declare
  t text;
begin
  foreach t in array array['partners', 'project_partners', 'charge_shares']
  loop
    execute format(
      'create unique index %I on public.%I (user_id, import_key) where import_key is not null',
      t || '_import_key_idx', t
    );
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_updated_at', t
    );
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      t || '_select_own', t
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      t || '_insert_own', t
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      t || '_update_own', t
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      t || '_delete_own', t
    );
  end loop;
end;
$$;
