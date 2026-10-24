-- Solicitudes de diagnóstico que llegan desde la web pública.
--
-- Es la única tabla que escribe alguien sin sesión, así que se protege por
-- tres sitios: la ruta de la API valida y limita por IP, la tabla acota
-- longitudes con restricciones, y RLS deja insertar sin leer. Quien lee es
-- solo el dueño del panel, identificado en `panel_owners`.

create table if not exists public.panel_owners (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.panel_owners enable row level security;

-- Nadie la lee desde la API: existe para que las políticas puedan preguntar.
drop policy if exists panel_owners_select_self on public.panel_owners;
create policy panel_owners_select_self on public.panel_owners
  for select to authenticated
  using (user_id = auth.uid());

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  company text not null check (char_length(company) between 2 and 120),
  sector text not null check (char_length(sector) between 2 and 40),
  email text not null check (char_length(email) between 5 and 160 and position('@' in email) > 1),
  phone text check (phone is null or char_length(phone) <= 30),
  goal text not null check (char_length(goal) between 2 and 40),
  context text check (context is null or char_length(context) <= 2000),
  /** Página desde la que se envió. Atribución, no identidad. */
  source text check (source is null or char_length(source) <= 300),
  /** Cuándo se contestó. Null = pendiente. */
  processed_at timestamptz,
  notes text
);

alter table public.leads enable row level security;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_pending_idx on public.leads (processed_at) where processed_at is null;

-- Cualquiera puede dejar una solicitud.
drop policy if exists leads_insert_public on public.leads;
create policy leads_insert_public on public.leads
  for insert to anon, authenticated
  with check (true);

-- Solo el dueño del panel las ve, las marca como atendidas o las borra.
drop policy if exists leads_select_owner on public.leads;
create policy leads_select_owner on public.leads
  for select to authenticated
  using (exists (select 1 from public.panel_owners where user_id = auth.uid()));

drop policy if exists leads_update_owner on public.leads;
create policy leads_update_owner on public.leads
  for update to authenticated
  using (exists (select 1 from public.panel_owners where user_id = auth.uid()))
  with check (exists (select 1 from public.panel_owners where user_id = auth.uid()));

drop policy if exists leads_delete_owner on public.leads;
create policy leads_delete_owner on public.leads
  for delete to authenticated
  using (exists (select 1 from public.panel_owners where user_id = auth.uid()));
