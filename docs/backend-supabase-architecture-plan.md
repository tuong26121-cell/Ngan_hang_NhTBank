# NhTBank — Backend & Supabase Architecture Plan

**Status:** design only; no database schema or production service changed.
**Prepared:** 2026-10-31
**Git base:** `main` at `9b4fdabea9b4e31ea1df52cc6c3d7b7b72aba38f`
**Working branch:** `codex/nhtbank-backend-supabase-design-20261031`
**Supabase project:** `swyrvrpnvygaxxxumyyk` (NhTBank, ap-southeast-1, PostgreSQL 17.11)

## 1. Verified current state

- Supabase project is `ACTIVE_HEALTHY`.
- PostgreSQL 17.11.0.003.
- `public` has zero tables and zero public functions.
- Supabase migration history is empty.
- No Edge Functions or Supabase development branches exist.
- Security and performance advisors returned no findings at inspection time.
- GitHub repository is a React 18 + Vite SPA. Demo auth is device-local; transfer balance and history are in React memory.
- `backend/sepay-sandbox-server.mjs` is a read-only SePay TEST MODE gateway. It deliberately does not acknowledge webhooks until durable persistence and idempotency exist.
- Existing documentation explicitly says no real bank account, payments, or production backend are connected.

## 2. Target architecture (proposed)

1. **Web and Mobile clients:** React/Vite + Capacitor. Use only a Supabase publishable key in public clients. Never embed a Supabase secret/service-role key, SePay token, webhook secret, or bank credential.
2. **Identity:** Supabase Auth issues user sessions. A trusted backend validates JWTs and enforces application authorization. Do not use editable `user_metadata` for authorization; use server-controlled claims/app metadata or a server-side role mapping.
3. **Backend API:** Node.js service for business workflows, provider adapters, authorization, rate limits, idempotency and audit events. It owns all provider secrets and all privileged database writes.
4. **PostgreSQL:** canonical source for application records. Use integer VND amounts (BIGINT), explicit currency, immutable ledger postings, and database constraints. Never infer a real bank balance from transaction history.
5. **Provider integration:** keep SePay TEST MODE isolated from any future production provider. Read-only transaction sync first. Webhooks must validate HMAC over the raw body, timestamp window, account scope and idempotency before durable acknowledgement.
6. **Admin:** separate server-authorized administrative APIs and audit trail. Client-side UI role flags are not authorization.
7. **Observability:** structured redacted logs, request IDs, provider sync status, webhook processing status, alerts and backup/restore procedures.

## 3. Proposed database domains

| Domain | Proposed objects | Notes |
|---|---|---|
| Identity | `profiles`, server-managed role mapping | Profile id references `auth.users(id)`; never trust user-editable metadata for roles |
| Banking sandbox | `sandbox_accounts`, `sandbox_transactions` | Strictly labelled TEST/SANDBOX; isolated from real account records |
| Accounts | `accounts`, `account_owners` | Introduce only after legal/provider scope is clear; do not model demo balance as a real account |
| Ledger | `ledger_transactions`, `ledger_entries` | Immutable, balanced double-entry postings; integer minor units/VND and currency; append corrections, do not overwrite history |
| Provider sync | `provider_connections`, `provider_sync_cursors`, `provider_transactions` | Secrets remain outside ordinary tables (secret manager/Vault); per-user/account scope |
| Webhooks | `webhook_inbox` | Unique provider event/idempotency key; store processing state and redacted metadata; ACK only after durable commit |
| Security | `audit_events`, `idempotency_keys` | Append-only audit events; unique operation keys; avoid storing credentials, OTPs or full sensitive payloads |

These are a design inventory, not a migration. Final names, constraints and retention periods require review before implementation.

## 4. Schema and API exposure policy

- Keep internal/provider/ledger tables out of broadly exposed schemas where possible; consider a non-exposed `private` schema for internal data and a deliberately narrow `api` schema for approved RPC/views.
- If `public` is used, enable RLS on every exposed table and grant only the minimum privileges explicitly.
- Current Supabase platform behavior changed: newly created public tables are not automatically exposed to the Data API by default (enforced across projects from 2026-10-30). Do not assume table creation implies REST access; verify Data API exposure settings and grants.
- RLS policies must include ownership/tenant predicates, not merely `TO authenticated`.
- UPDATE policies need both `USING` and `WITH CHECK`.
- Use `security_invoker = true` for views on PostgreSQL 15+ where appropriate.
- Avoid `SECURITY DEFINER`; if genuinely required, keep it in a non-exposed schema, check `auth.uid()`, restrict EXECUTE and run advisors.
- Never expose a service-role/secret key in browser, mobile bundle, repository, logs or chat.
- Do not put authorization decisions in `user_metadata`; role claims must be server-controlled and refreshed/validated.

## 5. Core invariants for financial-style records

1. Amounts are integer VND; reject floats and overflow.
2. Every posted ledger transaction balances debits and credits.
3. Posted ledger rows are immutable; corrections are compensating entries.
4. A unique idempotency key prevents duplicate processing across retries and restarts.
5. Provider event ID and provider account scope are unique/validated.
6. Webhook HMAC is checked against the raw request body and a bounded timestamp; reject replay/out-of-window events.
7. Never acknowledge a provider webhook before the event is durably stored and idempotently queued.
8. Provider sync is not proof of account ownership or permission; require explicit account-holder consent and provider-approved access.
9. Sandbox and real-provider data have separate environments, labels, storage and access policies.
10. No real transfers, deposits, withdrawals, lending or balances are enabled in this phase.

## 6. Suggested delivery sequence

- **2A — Design approval:** confirm product scope, identity model, backend hosting and data retention.
- **2B — Isolated development environment:** create Supabase development branch after cost approval; no production data is copied to the branch.
- **2C — First migration:** create private schemas, profile/role mapping, sandbox transaction tables, constraints, RLS and minimal grants.
- **2D — Backend skeleton:** health, JWT validation, request IDs, rate limits, provider adapter interface and secret handling.
- **2E — Sandbox persistence:** webhook inbox + idempotency + transaction sync, with replay and failure tests.
- **2F — Client integration:** replace device-local demo auth only after server auth is implemented; preserve the existing Sandbox UX as a separate mode.
- **2G — Review:** advisors, RLS tests for anon/authenticated/owner/admin, migration review, E2E and restore drill.

## 7. Explicitly out of scope

- No production migration, SQL DDL, data writes or Edge Function deployment has been performed.
- No Supabase development branch has been created yet; the provider quoted **USD 0.01344/hour**. User approval is required before provisioning this billable resource.
- No real bank credentials, OTP, account statements or payment tokens are requested or stored.
- No production payments, real balance, card issuing, lending or deposit products.
- No deployment to GitHub Pages, Vercel or a public API host.

## 8. Verification checklist before first migration

- [ ] User approves Supabase development-branch hourly cost.
- [ ] Confirm backend runtime/hosting and environment secret manager.
- [ ] Approve identity and role model.
- [ ] Approve table inventory, data minimization and retention.
- [ ] Review all RLS policies using owner/non-owner/anon/admin test identities.
- [ ] Confirm explicit Data API exposure and grants.
- [ ] Confirm backups, restore process, monitoring and incident response.
- [ ] Run Supabase security/performance advisors after DDL.
- [ ] Verify no secret appears in Git history or frontend build.

## 9. Additional project-specific security finding

A read-only catalog query on the existing Supabase project found explicit default privileges on new `public` objects for `anon` and `authenticated`:

- New tables: default ACL includes read/write privileges for `anon`, `authenticated` and `service_role`.
- New functions: default ACL includes EXECUTE for `anon`, `authenticated` and `service_role`.
- These are defaults for future objects; there are currently zero public tables/functions, so no existing application table was exposed by this finding.
- Before creating any table/function in `public`, the first migration must revoke broad default privileges and add narrowly scoped explicit grants alongside RLS. Prefer keeping internal ledger/provider/webhook objects in a non-exposed schema.

This is a project-specific finding from `pg_catalog.pg_default_acl`, not an assumption based only on the general Supabase platform changelog.
