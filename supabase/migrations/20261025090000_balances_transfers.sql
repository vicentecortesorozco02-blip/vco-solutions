-- Saldos por cuenta, movimientos internos e ingresos con cuenta de destino.
--
-- Tres huecos que impedían usar el panel para controlar el dinero de verdad:
--
--  1. Una cuenta no tenía saldo, así que «cuánto tengo disponible» no se podía
--     responder. Ahora lo tiene, con su fecha y su confianza: un saldo es una
--     foto de un día, no un dato permanente.
--  2. Un traspaso entre cuentas propias no tenía dónde caer. Importado desde
--     dos extractos aparecía dos veces, y encima inflaba ingresos y gastos a
--     la vez. Ahora es un tipo de cargo con su cuenta de contrapartida, y se
--     queda fuera de los totales de gasto.
--  3. Un ingreso no sabía en qué cuenta entraba.
--
-- Solo añade. No borra ni reescribe ninguna fila.

-- ---------------------------------------------------------------------------
-- 1. Cuentas: saldo y las cuatro últimas cifras
-- ---------------------------------------------------------------------------

alter table public.accounts
  -- Las cuatro últimas cifras bastan para reconocer la cuenta en un extracto.
  -- El IBAN completo no se guarda aquí a propósito.
  add column if not exists iban_last4 text,
  -- Null es «no lo sé», nunca 0 €. Un 0 € declarado es un dato, y lo dice su
  -- confianza; un hueco no se rellena con un cero.
  add column if not exists balance numeric(12, 2),
  add column if not exists balance_as_of date,
  add column if not exists balance_status text not null default 'unknown';

alter table public.accounts
  drop constraint if exists accounts_iban_last4_check,
  drop constraint if exists accounts_balance_status_check,
  drop constraint if exists accounts_balance_known;

alter table public.accounts
  add constraint accounts_iban_last4_check
    check (iban_last4 is null or iban_last4 ~ '^[0-9]{4}$'),
  add constraint accounts_balance_status_check
    check (balance_status in ('confirmed', 'observed', 'communicated', 'approximate', 'unknown')),
  -- Lo que no se sabe es nulo y lo nulo es «sin confirmar», igual que en
  -- suscripciones y dominios.
  add constraint accounts_balance_known
    check ((balance is null) = (balance_status = 'unknown'));

-- ---------------------------------------------------------------------------
-- 2. Cargos: el traspaso entre cuentas propias
-- ---------------------------------------------------------------------------

alter table public.charges
  -- La otra punta del traspaso: de dónde sale si `account_id` es donde entra.
  add column if not exists counterpart_account_id uuid;

alter table public.charges
  drop constraint if exists charges_counterpart_account_fk;

alter table public.charges
  add constraint charges_counterpart_account_fk
    foreign key (counterpart_account_id, user_id)
    references public.accounts (id, user_id)
    on delete set null;

alter table public.charges drop constraint if exists charges_kind_check;
alter table public.charges
  add constraint charges_kind_check
    check (kind in ('payment', 'bank_fee', 'invoice', 'transfer'));

-- Un traspaso sin contrapartida no es un traspaso: es un cargo sin identificar.
alter table public.charges drop constraint if exists charges_transfer_has_counterpart;
alter table public.charges
  add constraint charges_transfer_has_counterpart
    check (kind <> 'transfer' or counterpart_account_id is not null);

create index if not exists charges_counterpart_account_idx
  on public.charges (user_id, counterpart_account_id);

-- ---------------------------------------------------------------------------
-- 3. Movimientos: en qué cuenta entra o de cuál sale
-- ---------------------------------------------------------------------------

alter table public.transactions
  add column if not exists account_id uuid,
  add column if not exists source text;

alter table public.transactions
  drop constraint if exists transactions_account_fk;

alter table public.transactions
  add constraint transactions_account_fk
    foreign key (account_id, user_id)
    references public.accounts (id, user_id)
    on delete set null;

create index if not exists transactions_account_idx
  on public.transactions (user_id, account_id);
