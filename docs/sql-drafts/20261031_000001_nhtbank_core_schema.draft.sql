-- NhTBank core database draft
-- STATUS: REVIEW ONLY. DO NOT APPLY TO ANY CONNECTED SUPABASE PROJECT.
-- Target: PostgreSQL 17 / Supabase. Prepared 2026-10-31.
-- This is intentionally stored under docs/sql-drafts/, not supabase/migrations/.
-- Promote only after review and local validation with the Supabase CLI.
--
-- Security model:
--   * All application tables live in non-exposed schema private.
--   * No anon/authenticated grants and no client-side database access.
--   * Trusted backend uses a server-side service_role credential only.
--   * RLS is enabled as defense in depth; service_role bypasses RLS.
--   * No production bank accounts, payment execution, or real balances.

begin;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

-- Prevent future objects created by postgres in this schema from inheriting
-- project-specific broad grants. Explicit grants are added below per object.
alter default privileges for role postgres in schema private
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema private
  revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema private
  revoke execute on functions from anon, authenticated, service_role;

create table private.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_name text not null
    check (role_name in ('customer', 'support', 'operations', 'risk_analyst', 'admin')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role_name)
);

-- Explicitly sandbox-only. No real bank account records in this first draft.
create table private.sandbox_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  provider text not null check (provider = 'sepay'),
  environment text not null default 'sandbox' check (environment = 'sandbox'),
  provider_account_ref text,
  account_label varchar(80) not null,
  currency char(3) not null default 'VND' check (currency = 'VND'),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index sandbox_accounts_provider_ref_uidx
  on private.sandbox_accounts(provider, provider_account_ref)
  where provider_account_ref is not null;

create index sandbox_accounts_owner_idx
  on private.sandbox_accounts(owner_user_id, created_at desc);

-- Imported TEST MODE transactions only; amounts are integer VND minor units.
-- Raw provider payloads and credentials must not be stored in this table.
create table private.sandbox_transactions (
  id uuid primary key default gen_random_uuid(),
  sandbox_account_id uuid not null
    references private.sandbox_accounts(id) on delete restrict,
  provider_transaction_id text not null,
  direction text not null check (direction in ('credit', 'debit')),
  amount_vnd bigint not null check (amount_vnd > 0),
  currency char(3) not null default 'VND' check (currency = 'VND'),
  description varchar(500),
  occurred_at timestamptz not null,
  imported_at timestamptz not null default now(),
  unique (sandbox_account_id, provider_transaction_id)
);

create index sandbox_transactions_account_time_idx
  on private.sandbox_transactions(sandbox_account_id, occurred_at desc);

-- Webhook inbox stores identifiers and a payload hash, not the raw payload.
-- ACK must remain disabled until durable persistence + idempotent processing
-- are implemented and tested in the backend.
create table private.webhook_inbox (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'sepay'),
  provider_event_id text not null,
  provider_account_ref text,
  event_type varchar(100) not null,
  payload_sha256 bytea not null check (octet_length(payload_sha256) = 32),
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processing', 'processed', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error_code varchar(80),
  unique (provider, provider_event_id)
);

create index webhook_inbox_status_time_idx
  on private.webhook_inbox(processing_status, received_at);

create table private.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  operation_scope varchar(120) not null,
  idempotency_key varchar(200) not null,
  request_sha256 bytea not null check (octet_length(request_sha256) = 32),
  processing_status text not null default 'started'
    check (processing_status in ('started', 'completed', 'failed')),
  resource_id uuid,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (operation_scope, idempotency_key),
  check (expires_at > created_at)
);

create index idempotency_keys_expiry_idx
  on private.idempotency_keys(expires_at);

-- Append-only, redacted audit metadata. Never put passwords, OTPs, tokens,
-- full account numbers, or raw webhook bodies in metadata.
create table private.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('user', 'admin', 'system', 'provider')),
  action varchar(120) not null,
  entity_type varchar(120) not null,
  entity_id varchar(200),
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_actor_time_idx
  on private.audit_events(actor_user_id, created_at desc);
create index audit_events_entity_idx
  on private.audit_events(entity_type, entity_id, created_at desc);

-- Append-only enforcement for audit history. No SECURITY DEFINER.
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

revoke all on function private.reject_audit_mutation()
  from public, anon, authenticated, service_role;

create trigger audit_events_no_update
before update or delete on private.audit_events
for each row execute function private.reject_audit_mutation();

-- Enable RLS on every application table. No client policies are created because
-- browser/mobile clients are not granted schema or table access in this design.
alter table private.profiles enable row level security;
alter table private.user_roles enable row level security;
alter table private.sandbox_accounts enable row level security;
alter table private.sandbox_transactions enable row level security;
alter table private.webhook_inbox enable row level security;
alter table private.idempotency_keys enable row level security;
alter table private.audit_events enable row level security;

-- Narrow server-only grants. service_role is privileged and must remain server-side.
grant select, insert, update, delete on
  private.profiles, private.user_roles, private.sandbox_accounts
  to service_role;

grant select, insert on private.sandbox_transactions to service_role;
grant select, insert, update on
  private.webhook_inbox, private.idempotency_keys
  to service_role;
grant select, insert on private.audit_events to service_role;
grant usage, select on sequence private.audit_events_id_seq to service_role;

commit;

-- Deferred by design:
--   * accounts / account_owners and double-entry ledger tables
--   * ledger posting/balance constraints and reversal workflows
--   * provider credentials / Vault integration
--   * user-facing API views or RPCs
-- These require separate product, legal, operational and threat-model review.
