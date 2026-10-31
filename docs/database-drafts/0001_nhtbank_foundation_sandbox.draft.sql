-- NhTBank Phase 2B — DRAFT ONLY
-- Review artifact. NOT an approved/numbered Supabase migration.
-- Do not paste into the Production SQL editor.
-- Intended first target: a disposable local PostgreSQL/Supabase environment.
--
-- Scope: identity metadata + SePay TEST MODE persistence + security/audit primitives.
-- Explicitly excluded: real bank accounts, real transfers, balances, ledger posting,
-- payment execution, credentials, OTPs, and raw webhook payload storage.
--
-- Before turning this into a real migration:
--   1) Run `supabase migration new nhtbank_foundation_sandbox` locally.
--   2) Review the generated timestamped file and move this SQL into it.
--   3) Test on local Supabase/PostgreSQL; do not run against production.
--   4) Review grants, RLS, ownership, and advisor output before any deployment.

BEGIN;

-- The project-specific catalog audit found broad default ACLs on future public
-- objects. Revoke defaults for objects created by the migration owner.
-- Supabase migrations normally run as postgres; using current_user avoids
-- hard-coding that assumption into the generated ALTER DEFAULT PRIVILEGES.
DO $$
DECLARE
  migration_owner name := current_user;
BEGIN
  EXECUTE format(
    'ALTER DEFAULT PRIVILEGES FOR ROLE %I REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated',
    migration_owner
  );
  EXECUTE format(
    'ALTER DEFAULT PRIVILEGES FOR ROLE %I REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated',
    migration_owner
  );
  EXECUTE format(
    'ALTER DEFAULT PRIVILEGES FOR ROLE %I REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated',
    migration_owner
  );
END
$$;

-- Internal banking/provider data stays outside exposed schemas.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

-- Future objects created by the migration owner in private remain closed to
-- public/anonymous/authenticated roles by default.
DO $$
DECLARE
  migration_owner name := current_user;
BEGIN
  EXECUTE format(
    'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA private REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated',
    migration_owner
  );
  EXECUTE format(
    'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA private REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated',
    migration_owner
  );
  EXECUTE format(
    'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA private REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated',
    migration_owner
  );
END
$$;

CREATE TABLE private.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name varchar(100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Roles are server-managed. Never derive authorization from user-editable
-- auth.users.raw_user_meta_data / JWT user_metadata.
CREATE TABLE private.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name text NOT NULL CHECK (role_name IN ('customer', 'support', 'admin', 'auditor')),
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_name)
);

-- Only SePay TEST MODE is represented in this first draft.
-- No API tokens, webhook secrets, bank passwords, or OTPs belong here.
CREATE TABLE private.sandbox_provider_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  provider text NOT NULL CHECK (provider = 'sepay'),
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment = 'sandbox'),
  provider_account_ref text NOT NULL,
  bank_code text,
  display_label varchar(100),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'disconnected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, environment, provider_account_ref)
);

CREATE INDEX sandbox_provider_accounts_owner_idx
  ON private.sandbox_provider_accounts (owner_user_id, created_at DESC);

CREATE TABLE private.sandbox_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_account_id uuid NOT NULL
    REFERENCES private.sandbox_provider_accounts(id) ON DELETE RESTRICT,
  provider_transaction_id text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('in', 'out')),
  amount_vnd bigint NOT NULL CHECK (amount_vnd > 0),
  currency char(3) NOT NULL DEFAULT 'VND' CHECK (currency = 'VND'),
  description varchar(500),
  occurred_at timestamptz NOT NULL,
  payload_sha256 char(64),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_account_id, provider_transaction_id)
);

CREATE INDEX sandbox_transactions_account_time_idx
  ON private.sandbox_transactions (provider_account_id, occurred_at DESC);

-- Webhook inbox stores identifiers and hashes, not raw payloads or secrets.
-- Application must verify HMAC over the raw body and account scope BEFORE
-- inserting an event; acknowledge only after this row commits durably.
CREATE TABLE private.webhook_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider = 'sepay'),
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment = 'sandbox'),
  provider_event_id text NOT NULL,
  provider_account_ref text NOT NULL,
  event_timestamp timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  signature_verified boolean NOT NULL DEFAULT false CHECK (signature_verified),
  payload_sha256 char(64) NOT NULL,
  processing_status text NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processed', 'rejected', 'failed')),
  processed_at timestamptz,
  UNIQUE (provider, environment, provider_event_id)
);

CREATE INDEX webhook_inbox_pending_idx
  ON private.webhook_inbox (received_at)
  WHERE processing_status = 'received';

-- Idempotency is scoped by operation and caller. Store hashes/status only;
-- do not persist secrets or sensitive response bodies in this table.
CREATE TABLE private.idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_key varchar(120) NOT NULL,
  idempotency_key varchar(200) NOT NULL,
  request_sha256 char(64) NOT NULL,
  processing_status text NOT NULL DEFAULT 'started'
    CHECK (processing_status IN ('started', 'succeeded', 'failed')),
  response_status integer CHECK (response_status BETWEEN 100 AND 599),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE (scope_key, idempotency_key),
  CHECK (expires_at > created_at)
);

CREATE INDEX idempotency_keys_expiry_idx
  ON private.idempotency_keys (expires_at);

-- Append-only by application contract. Do not put credentials, OTPs, full
-- account numbers, raw webhook bodies, or authentication tokens in metadata.
CREATE TABLE private.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (length(action) BETWEEN 1 AND 120),
  target_type text CHECK (target_type IS NULL OR length(target_type) <= 80),
  target_id text CHECK (target_id IS NULL OR length(target_id) <= 160),
  request_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_actor_time_idx
  ON private.audit_events (actor_user_id, created_at DESC);
CREATE INDEX audit_events_target_idx
  ON private.audit_events (target_type, target_id);

-- Defense in depth: RLS enabled on every table. No policies are created in
-- this draft, so browser roles have no row access. The trusted backend will
-- use a server-only service_role credential and enforce authorization itself.
ALTER TABLE private.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.sandbox_provider_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.sandbox_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.webhook_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.audit_events ENABLE ROW LEVEL SECURITY;

-- Explicit server-side grants. service_role must NEVER be shipped to web/mobile.
GRANT SELECT, INSERT, UPDATE ON private.profiles TO service_role;
GRANT SELECT, INSERT, DELETE ON private.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE ON private.sandbox_provider_accounts TO service_role;
GRANT SELECT, INSERT ON private.sandbox_transactions TO service_role;
GRANT SELECT, INSERT, UPDATE ON private.webhook_inbox TO service_role;
GRANT SELECT, INSERT, UPDATE ON private.idempotency_keys TO service_role;
GRANT SELECT, INSERT ON private.audit_events TO service_role;

-- No grants to anon/authenticated. No public tables, views, RPCs or functions
-- are created by this draft. No ledger postings or real-money operations exist.

COMMIT;
