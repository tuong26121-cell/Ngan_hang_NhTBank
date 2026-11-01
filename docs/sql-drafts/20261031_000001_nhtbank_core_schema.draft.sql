-- NhTBank core database draft v3 (security hardening)
-- STATUS: REVIEW ONLY. DO NOT APPLY TO ANY HOSTED SUPABASE PROJECT.
-- Target: PostgreSQL 17 / Supabase. Expected DDL owner: postgres.
-- This file is intentionally under docs/sql-drafts/, not supabase/migrations/.
--
-- Important: service_role bypasses RLS. Keep its secret server-side and
-- enforce user/business authorization in the trusted backend.
-- Confirm schema "private" is not in Supabase API > Exposed schemas.

begin;

create schema if not exists private authorization postgres;

do $$
declare
  actual_owner text;
begin
  select r.rolname into actual_owner
  from pg_catalog.pg_namespace n
  join pg_catalog.pg_roles r on r.oid = n.nspowner
  where n.nspname = 'private';

  if actual_owner is distinct from 'postgres' then
    raise exception 'Unexpected owner for schema private: %. Expected postgres; review ownership before continuing.', actual_owner;
  end if;
end;
$$;

-- Clear inherited/pre-existing schema ACLs, including stale CREATE grants.
revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to service_role;

-- Default privileges are scoped to the object-creating role. DDL is expected
-- to run as postgres; if another owner is used, reproduce these rules for it.
alter default privileges for role postgres in schema private
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema private
  revoke all on sequences from public, anon, authenticated, service_role;
-- Per-schema default ACLs cannot revoke a global PUBLIC function grant.
-- Every function created below therefore has an explicit REVOKE; repeat that
-- explicit REVOKE for each future function added to this schema.

create table private.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(120),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

alter function private.set_updated_at() owner to postgres;
revoke all on function private.set_updated_at() from public, anon, authenticated, service_role;

create trigger profiles_set_updated_at
before update on private.profiles
for each row execute function private.set_updated_at();

create table private.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_name text not null
    check (role_name in ('customer', 'support', 'operations', 'risk_analyst', 'admin')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default pg_catalog.now(),
  primary key (user_id, role_name)
);

create table private.sandbox_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  provider text not null check (provider = 'sepay' and length(btrim(provider)) > 0),
  environment text not null default 'sandbox' check (environment = 'sandbox'),
  provider_account_ref text check (provider_account_ref is null or length(btrim(provider_account_ref)) > 0),
  account_label varchar(80) not null check (length(btrim(account_label)) > 0),
  currency char(3) not null default 'VND' check (currency = 'VND'),
  is_active boolean not null default true,
  created_at timestamptz not null default pg_catalog.now()
);

create unique index sandbox_accounts_provider_ref_uidx
  on private.sandbox_accounts(provider, provider_account_ref)
  where provider_account_ref is not null;

create index sandbox_accounts_owner_idx
  on private.sandbox_accounts(owner_user_id, created_at desc);

-- Imported TEST MODE transactions only; amount is an integer number of VND.
create table private.sandbox_transactions (
  id uuid primary key default gen_random_uuid(),
  sandbox_account_id uuid not null
    references private.sandbox_accounts(id) on delete restrict,
  provider_transaction_id text not null
    check (length(btrim(provider_transaction_id)) > 0),
  direction text not null check (direction in ('credit', 'debit')),
  amount_vnd bigint not null check (amount_vnd > 0),
  currency char(3) not null default 'VND' check (currency = 'VND'),
  description varchar(500),
  occurred_at timestamptz not null,
  imported_at timestamptz not null default pg_catalog.now(),
  unique (sandbox_account_id, provider_transaction_id)
);

create index sandbox_transactions_account_time_idx
  on private.sandbox_transactions(sandbox_account_id, occurred_at desc);

-- Store event identifiers and a SHA-256 digest only, never raw webhook bodies.
create table private.webhook_inbox (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'sepay'),
  provider_event_id text not null check (length(btrim(provider_event_id)) > 0),
  provider_account_ref text check (provider_account_ref is null or length(btrim(provider_account_ref)) > 0),
  event_type varchar(100) not null check (length(btrim(event_type)) > 0),
  payload_sha256 bytea not null check (octet_length(payload_sha256) = 32),
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processing', 'processed', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  received_at timestamptz not null default pg_catalog.now(),
  processed_at timestamptz,
  last_error_code varchar(80),
  unique (provider, provider_event_id),
  check ((processing_status = 'processed') = (processed_at is not null))
);

create index webhook_inbox_status_time_idx
  on private.webhook_inbox(processing_status, received_at);

-- principal_key is generated by the trusted backend, never accepted as an
-- authoritative client identity. Examples: user:<uuid>, system:<service>.
-- A repeated key with a different request hash must be rejected by the backend.
create table private.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  principal_key varchar(120) not null check (length(btrim(principal_key)) > 0),
  operation_scope varchar(120) not null check (length(btrim(operation_scope)) > 0),
  idempotency_key varchar(200) not null check (length(btrim(idempotency_key)) > 0),
  request_sha256 bytea not null check (octet_length(request_sha256) = 32),
  processing_status text not null default 'started'
    check (processing_status in ('started', 'completed', 'failed')),
  resource_id uuid,
  created_at timestamptz not null default pg_catalog.now(),
  expires_at timestamptz not null,
  unique (principal_key, operation_scope, idempotency_key),
  check (expires_at > created_at)
);

create index idempotency_keys_expiry_idx
  on private.idempotency_keys(expires_at);

-- Bounded cleanup: only expired terminal rows can be removed. In-flight
-- "started" rows are retained for explicit recovery/reconciliation.
-- SECURITY DEFINER is tightly scoped, owned by postgres, and executable only
-- by service_role. The trusted backend must call it with a bounded batch size.
create or replace function private.purge_expired_idempotency_keys(p_batch_size integer default 500)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  if p_batch_size is null or p_batch_size < 1 or p_batch_size > 5000 then
    raise exception 'p_batch_size must be between 1 and 5000'
      using errcode = '22023';
  end if;

  with candidates as (
    select k.id
    from private.idempotency_keys as k
    where k.expires_at <= pg_catalog.now()
      and k.processing_status in ('completed', 'failed')
    order by k.expires_at, k.id
    limit p_batch_size
    for update skip locked
  )
  delete from private.idempotency_keys as target
  using candidates
  where target.id = candidates.id;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

alter function private.purge_expired_idempotency_keys(integer) owner to postgres;
revoke all on function private.purge_expired_idempotency_keys(integer)
  from public, anon, authenticated, service_role;
grant execute on function private.purge_expired_idempotency_keys(integer)
  to service_role;

-- Append-only audit metadata. actor_user_id is a historical UUID snapshot,
-- deliberately without an auth.users FK: ON DELETE SET NULL would issue an
-- UPDATE that conflicts with the append-only trigger below.
create table private.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid,
  actor_type text not null check (actor_type in ('user', 'admin', 'system', 'provider')),
  action varchar(120) not null check (length(btrim(action)) > 0),
  entity_type varchar(120) not null check (length(btrim(entity_type)) > 0),
  entity_id varchar(200),
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb
    check (pg_catalog.jsonb_typeof(metadata) = 'object')
    check (pg_catalog.pg_column_size(metadata) <= 8192),
  created_at timestamptz not null default pg_catalog.now()
);

create index audit_events_actor_time_idx
  on private.audit_events(actor_user_id, created_at desc);
create index audit_events_entity_idx
  on private.audit_events(entity_type, entity_id, created_at desc);

-- Reject row mutation and TRUNCATE. This is defense in depth, not protection
-- against a superuser or trusted table owner disabling triggers.
create or replace function private.reject_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_events is append-only'
    using errcode = '55000';
end;
$$;

alter function private.reject_audit_mutation() owner to postgres;
revoke all on function private.reject_audit_mutation() from public, anon, authenticated, service_role;

create trigger audit_events_no_update_delete
before update or delete on private.audit_events
for each row execute function private.reject_audit_mutation();

create trigger audit_events_no_truncate
before truncate on private.audit_events
for each statement execute function private.reject_audit_mutation();

-- RLS is enabled on every application table. There are intentionally no
-- client policies because browser/mobile direct database access is prohibited.
alter table private.profiles enable row level security;
alter table private.user_roles enable row level security;
alter table private.sandbox_accounts enable row level security;
alter table private.sandbox_transactions enable row level security;
alter table private.webhook_inbox enable row level security;
alter table private.idempotency_keys enable row level security;
alter table private.audit_events enable row level security;

-- Explicitly neutralize unexpected GLOBAL default ACL grants on all current
-- objects, then grant the exact minimum. Default-privilege REVOKE scoped to
-- this schema alone cannot remove grants inherited from global defaults.
revoke all on all tables in schema private
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema private
  from public, anon, authenticated, service_role;

-- Narrow backend grants. service_role bypasses RLS and must never reach clients.
grant select, insert, update on private.profiles to service_role;
grant select, insert, delete on private.user_roles to service_role;
grant select, insert, update on private.sandbox_accounts to service_role;
grant select, insert on private.sandbox_transactions to service_role;
grant select, insert, update on private.webhook_inbox to service_role;
grant select, insert, update on private.idempotency_keys to service_role;
grant select, insert on private.audit_events to service_role;
grant usage, select on sequence private.audit_events_id_seq to service_role;

commit;

-- Deferred pending separate design/review:
-- accounts/account_owners, double-entry ledger and balance invariants,
-- provider credentials/Vault, user-facing RPC/views, retention/partitioning.
