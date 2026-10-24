-- Life CRM · personal finance.
--
-- Adds what a list of subscriptions cannot say on its own:
--
--   accounts             where money is charged from (no numbers, no balances)
--   subscription_prices  every price a service has had, oldest kept
--   charges              what actually happened: paid, failed, authorisations,
--                        invoices and bank fees, with operation, value and
--                        booking dates kept apart
--
-- and, on subscriptions, how sure each figure is. An unknown amount is NULL,
-- never 0. A forecast is computed, never stored: a past forecast without a
-- matching charge is "pendiente de comprobar", not "pagado" and not "impagado".
--
-- import_life_data(payload) merges a JSON payload idempotently: it matches by
-- import_key (or by name the first time), fills only empty fields and turns
-- every disagreement into a review task instead of overwriting.

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  institution text,
  kind text not null default 'bank' check (kind in ('bank', 'paypal', 'store', 'other')),
  has_card boolean not null default false,
  -- The account subscriptions should end up on. A goal, not a fact.
  is_target boolean not null default false,
  notes text,
  source text,
  import_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- ---------------------------------------------------------------------------
-- Subscriptions: status, confidence, accounts, provenance
-- ---------------------------------------------------------------------------

alter table public.subscriptions add constraint subscriptions_id_user_key unique (id, user_id);

alter table public.subscriptions
  alter column amount drop not null,
  alter column next_charge_date drop not null,
  drop constraint subscriptions_frequency_check,
  add constraint subscriptions_frequency_check check (frequency in (
    'weekly', 'every_4_weeks', 'monthly', 'quarterly', 'semiannual', 'annual', 'custom',
    -- Usage-based or not yet known: no forecast is generated.
    'variable', 'unknown'
  )),
  add column status text not null default 'active'
    check (status in ('active', 'review', 'cancel_pending', 'cancelled')),
  add column amount_status text not null default 'unknown'
    check (amount_status in ('confirmed', 'observed', 'communicated', 'approximate', 'unknown')),
  -- The date the current amount applies from. Older prices never replace it.
  add column amount_as_of date,
  add column tax text not null default 'unknown' check (tax in ('included', 'excluded', 'unknown')),
  add column date_status text not null default 'unknown'
    check (date_status in ('confirmed', 'observed', 'communicated', 'approximate', 'unknown')),
  add column scope text not null default 'pending' check (scope in ('personal', 'project', 'pending')),
  -- What the bank or PayPal calls it ("Apple Services"), apart from what it is.
  add column merchant text,
  add column observed_account_id uuid,
  add column target_account_id uuid,
  add column account_change text not null default 'none' check (account_change in ('none', 'pending', 'confirmed')),
  add column commitment text,
  add column commitment_until date,
  add column source text,
  add column import_key text,
  add foreign key (observed_account_id, user_id) references public.accounts (id, user_id) on delete set null (observed_account_id),
  add foreign key (target_account_id, user_id) references public.accounts (id, user_id) on delete set null (target_account_id);

update public.subscriptions set status = case when active then 'active' else 'cancelled' end;
update public.subscriptions set amount_as_of = created_at::date, amount_status = 'confirmed' where amount is not null;
update public.subscriptions set date_status = 'confirmed' where next_charge_date is not null;

-- Unknown is a state of its own, never a zero: no amount means "unknown",
-- and "unknown" means no amount. Same for the date.
alter table public.subscriptions
  add constraint subscriptions_amount_known check ((amount is null) = (amount_status = 'unknown')),
  add constraint subscriptions_date_known check ((next_charge_date is null) = (date_status = 'unknown'));

-- "active" stays for older code paths, but status is the truth: a trigger
-- keeps it in step, whatever a client sends.
create or replace function public.subscriptions_sync_active()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.active := new.status <> 'cancelled';
  return new;
end;
$$;

create trigger subscriptions_sync_active before insert or update on public.subscriptions
for each row execute function public.subscriptions_sync_active();

revoke execute on function public.subscriptions_sync_active() from anon, authenticated, public;

-- ---------------------------------------------------------------------------
-- Price history
-- ---------------------------------------------------------------------------

create table public.subscription_prices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subscription_id uuid not null,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  effective_on date,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'observed', 'communicated', 'approximate')),
  notes text,
  source text,
  import_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (subscription_id, user_id) references public.subscriptions (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Charges: what actually happened
-- ---------------------------------------------------------------------------

create table public.charges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  description text check (char_length(description) <= 200),
  kind text not null default 'payment' check (kind in ('payment', 'bank_fee', 'invoice')),
  -- paid counts as money spent. failed, authorization and cancelled never do.
  status text not null default 'paid'
    check (status in ('paid', 'failed', 'authorization', 'pending', 'refunded', 'cancelled')),
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  operation_date date,
  value_date date,
  booking_date date,
  -- When the user told us, for things that are not bank movements.
  reported_on date,
  -- The instalment or forecast this charge settles ("cuota May 30").
  due_date date,
  period_label text,
  merchant text,
  channel text,
  subscription_id uuid,
  -- A possible match that nobody has confirmed yet.
  candidate_subscription_id uuid,
  identified boolean not null default true,
  -- The same payment seen twice (PayPal and the bank): never summed twice.
  mirror_of_id uuid,
  account_id uuid,
  project_id uuid,
  notes text,
  source text,
  import_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (subscription_id, user_id) references public.subscriptions (id, user_id) on delete set null (subscription_id),
  foreign key (candidate_subscription_id, user_id) references public.subscriptions (id, user_id) on delete set null (candidate_subscription_id),
  foreign key (mirror_of_id, user_id) references public.charges (id, user_id) on delete set null (mirror_of_id),
  foreign key (account_id, user_id) references public.accounts (id, user_id) on delete set null (account_id),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);

-- ---------------------------------------------------------------------------
-- Domains, tasks, projects: provenance and import keys
-- ---------------------------------------------------------------------------

alter table public.domains
  add column renews_status text not null default 'unknown'
    check (renews_status in ('confirmed', 'observed', 'communicated', 'approximate', 'unknown')),
  add column account_id uuid,
  add column source text,
  add column import_key text,
  add foreign key (account_id, user_id) references public.accounts (id, user_id) on delete set null (account_id);

update public.domains set renews_status = 'confirmed' where renews_on is not null;
alter table public.domains
  add constraint domains_renews_known check ((renews_on is null) = (renews_status = 'unknown'));

-- "Local" and bank fees need a home among the subscription categories.
alter table public.subscriptions
  drop constraint subscriptions_category_check,
  add constraint subscriptions_category_check check (category in (
    'software', 'hosting', 'domains', 'email', 'ai', 'tools', 'gym',
    'phone', 'insurance', 'media', 'housing', 'bank', 'other'
  ));

alter table public.tasks add column import_key text;
alter table public.projects add column import_key text;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index subscriptions_user_status_idx on public.subscriptions (user_id, status, next_charge_date);
create index subscriptions_observed_account_idx on public.subscriptions (observed_account_id);
create index subscriptions_target_account_idx on public.subscriptions (target_account_id);
create index accounts_user_idx on public.accounts (user_id);
create index subscription_prices_sub_idx on public.subscription_prices (subscription_id, effective_on);
create index subscription_prices_user_idx on public.subscription_prices (user_id);
create index charges_user_idx on public.charges (user_id, status);
create index charges_subscription_idx on public.charges (subscription_id);
create index charges_candidate_idx on public.charges (candidate_subscription_id);
create index charges_mirror_idx on public.charges (mirror_of_id);
create index charges_account_idx on public.charges (account_id);
create index charges_project_idx on public.charges (project_id);
create index domains_account_idx on public.domains (account_id);

do $$
declare
  t text;
begin
  foreach t in array array['accounts', 'subscriptions', 'subscription_prices', 'charges', 'domains', 'tasks', 'projects']
  loop
    execute format(
      'create unique index %I on public.%I (user_id, import_key) where import_key is not null',
      t || '_import_key_idx', t
    );
  end loop;

  foreach t in array array['accounts', 'subscription_prices', 'charges']
  loop
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

-- ---------------------------------------------------------------------------
-- Idempotent import
-- ---------------------------------------------------------------------------
--
-- payload = {
--   "source": "Extractos revisados hasta el 09/09/2026",
--   "accounts": [{ "key": "ing", "name": "ING", ... }],
--   "projects": [...], "subscriptions": [...], "subscription_prices": [...],
--   "charges": [...], "domains": [...], "tasks": [...]
-- }
--
-- Every item carries a stable "key". References use the other row's key:
-- "project", "subscription", "candidate_subscription", "account",
-- "observed_account", "target_account", "mirror_of".
--
-- Runs as the signed-in user (security invoker): RLS applies to every
-- statement, and auth.uid() decides whose rows are touched.

create or replace function public.import_life_data(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  source_label text := coalesce(payload ->> 'source', 'la importación');
  match_cols jsonb := '{"accounts": "name", "projects": "name", "subscriptions": "name", "domains": "domain", "tasks": "title"}';
  refs jsonb := '{
    "project": ["project_id", "projects"],
    "subscription": ["subscription_id", "subscriptions"],
    "candidate_subscription": ["candidate_subscription_id", "subscriptions"],
    "account": ["account_id", "accounts"],
    "observed_account": ["observed_account_id", "accounts"],
    "target_account": ["target_account_id", "accounts"],
    "mirror_of": ["mirror_of_id", "charges"]
  }';
  -- Free text the user may have rewritten: fill when empty, never flag.
  quiet text[] := array['notes', 'source', 'description', 'import_key'];
  t text;
  item jsonb;
  rec jsonb;
  existing jsonb;
  changes jsonb;
  ref text;
  ref_id uuid;
  item_key text;
  match_col text;
  cols text;
  k text;
  v jsonb;
  conflict_key text;
  label text;
  price record;
  inserted int := 0;
  filled int := 0;
  unchanged int := 0;
  conflicts int := 0;
  prices_applied int := 0;
begin
  if uid is null then
    raise exception 'Hace falta iniciar sesión' using errcode = '42501';
  end if;

  foreach t in array array['accounts', 'projects', 'subscriptions', 'subscription_prices', 'charges', 'domains', 'tasks']
  loop
    for item in select value from jsonb_array_elements(coalesce(payload -> t, '[]'::jsonb))
    loop
      item_key := item ->> 'key';
      if item_key is null then
        raise exception 'Falta "key" en un elemento de %', t;
      end if;
      rec := (item - 'key') || jsonb_build_object('import_key', item_key);

      for ref in select jsonb_object_keys(refs)
      loop
        if rec ? ref then
          ref_id := null;
          if jsonb_typeof(rec -> ref) <> 'null' then
            execute format('select id from public.%I where user_id = $1 and import_key = $2', refs -> ref ->> 1)
              into ref_id using uid, rec ->> ref;
            if ref_id is null then
              raise exception 'Referencia desconocida en %: % = %', t, ref, rec ->> ref;
            end if;
          end if;
          rec := (rec - ref) || jsonb_build_object(refs -> ref ->> 0, ref_id);
        end if;
      end loop;

      execute format('select to_jsonb(x) from public.%I x where x.user_id = $1 and x.import_key = $2', t)
        into existing using uid, item_key;

      match_col := match_cols ->> t;
      if existing is null and match_col is not null and rec ? match_col then
        execute format(
          'select to_jsonb(x) from public.%I x where x.user_id = $1 and x.import_key is null and lower(x.%I) = lower($2) order by x.created_at limit 1',
          t, match_col
        ) into existing using uid, rec ->> match_col;
      end if;

      if existing is null then
        select string_agg(quote_ident(key), ', ') into cols from jsonb_object_keys(rec) as key;
        execute format(
          'insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I, $1)',
          t, cols, cols, t
        ) using rec;
        inserted := inserted + 1;
        continue;
      end if;

      changes := '{}'::jsonb;
      for k, v in select key, value from jsonb_each(rec)
      loop
        if jsonb_typeof(v) = 'null' then
          continue;
        elsif not (existing ? k) or jsonb_typeof(existing -> k) = 'null' then
          changes := changes || jsonb_build_object(k, v);
        elsif existing -> k is distinct from v and not (k = any (quiet)) then
          -- Keep both values: a review task, never an overwrite.
          conflict_key := format('conflict:%s:%s:%s:%s', t, item_key, k, md5(v::text));
          if not exists (select 1 from public.tasks where user_id = uid and import_key = conflict_key) then
            label := coalesce(existing ->> coalesce(match_col, 'description'), item_key);
            insert into public.tasks (title, description, category, priority, import_key)
            values (
              left(format('Revisar dato distinto: %s', label), 200),
              format(
                'Campo «%s». En el CRM: %s. En %s: %s. No se ha sobrescrito: decide cuál es el bueno.',
                k, existing ->> k, source_label, v #>> '{}'
              ),
              'Finanzas',
              'normal',
              conflict_key
            );
            conflicts := conflicts + 1;
          end if;
        end if;
      end loop;

      if changes = '{}'::jsonb then
        unchanged := unchanged + 1;
      else
        select string_agg(quote_ident(key), ', ') into cols from jsonb_object_keys(changes) as key;
        execute format(
          'update public.%I x set (%s) = (select %s from jsonb_populate_record(null::public.%I, $1)) where x.id = $2',
          t, cols, cols, t
        ) using changes, (existing ->> 'id')::uuid;
        filled := filled + 1;
      end if;
    end loop;
  end loop;

  -- The newest price becomes the current amount, unless the subscription
  -- already holds a newer one (typed by the user or imported before).
  for price in
    select s.id as subscription_id, s.amount as current_amount, s.amount_as_of,
           p.amount, p.effective_on, p.status
    from public.subscriptions s
    join lateral (
      select p.amount, p.effective_on, p.status
      from public.subscription_prices p
      where p.subscription_id = s.id and p.user_id = uid
      order by p.effective_on desc nulls last, p.created_at desc
      limit 1
    ) p on true
    where s.user_id = uid
  loop
    if price.current_amount is null
       or (price.effective_on is not null and price.amount_as_of is not null and price.effective_on > price.amount_as_of) then
      update public.subscriptions
      set amount = price.amount, amount_as_of = price.effective_on, amount_status = price.status
      where id = price.subscription_id
        and (amount is distinct from price.amount or amount_as_of is distinct from price.effective_on);
      if found then
        prices_applied := prices_applied + 1;
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'inserted', inserted,
    'filled', filled,
    'unchanged', unchanged,
    'conflicts', conflicts,
    'prices_applied', prices_applied
  );
end;
$$;

revoke execute on function public.import_life_data(jsonb) from anon, public;
grant execute on function public.import_life_data(jsonb) to authenticated;
