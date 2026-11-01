# NhTBank — Phase 2B database draft

**Status:** Draft for review only. Not a runnable/approved Supabase migration.
**Target Git branch:** `codex/nhtbank-backend-supabase-design-20261031`
**Production impact:** None. No SQL was executed against Supabase.
**Cost:** No Supabase development branch or paid compute was created.

## Files

- `0001_nhtbank_foundation_sandbox.draft.sql` — proposed initial schema for identity metadata, SePay TEST MODE records, webhook inbox, idempotency, and audit events.

## Design boundaries

- Internal objects live in the non-exposed `private` schema.
- No grants are given to `anon` or `authenticated`; RLS is enabled and no client policies are created.
- Only the server-side `service_role` receives explicit table grants. Its key must never enter browser/mobile code, source control, logs, or chat.
- User roles are server-managed; never trust user-editable `user_metadata`.
- Sandbox provider records are constrained to `sepay` + `sandbox`.
- Amounts are positive integer VND (`bigint`); no floating-point money.
- Webhook storage contains event identifiers and a payload hash, not raw bodies or credentials. The backend must verify HMAC against the raw body, timestamp window, and account scope before persistence/acknowledgement.
- Unique provider event IDs and scoped idempotency keys prevent duplicate processing.
- Audit events are append-only by grant design (service_role has SELECT/INSERT only).
- No ledger posting, balance calculation, real bank account, transfer, payment, deposit, or withdrawal is implemented.

## Security notes requiring review

1. The previous read-only catalog audit found broad default ACLs on new `public` objects. The SQL draft revokes defaults for future objects created by the migration owner. Confirm the actual migration role and resulting `pg_default_acl` before applying anywhere.
2. Supabase migrations normally run as `postgres`; the SQL uses `current_user` to scope default-privilege changes. Verify this assumption in a disposable local environment.
3. `private` must remain absent from Supabase Data API exposed schemas. No client grants are intended.
4. A backend using `service_role` bypasses RLS. Every route must independently validate JWT, ownership, role, request limits, and idempotency. Never trust client-supplied owner IDs or role claims from editable user metadata.
5. The database cannot guarantee balanced double-entry ledger postings yet. Ledger tables and posting functions are intentionally deferred until a deferred constraint/atomic posting design and tests are ready.
6. Provider credentials and webhook secrets must be stored in a server secret manager, not these tables.
7. Confirm provider-specific event ID semantics and whether event IDs are unique across accounts before relying on the chosen unique key.

## Required local-only workflow

The connected GitHub/Supabase tools in this session do not provide a local shell to run the Supabase CLI or PostgreSQL parser. Therefore this file is deliberately stored under `docs/database-drafts/`, not `supabase/migrations/`, and has not been represented as syntax-tested.

On a developer machine with Supabase CLI installed:

1. Run `supabase --version` and inspect `supabase migration new --help`.
2. Run `supabase migration new nhtbank_foundation_sandbox`.
3. Copy the reviewed SQL into the generated timestamped file under `supabase/migrations/`.
4. Start a local disposable stack and apply/test migrations locally only.
5. Verify schema, grants, default ACLs, RLS, constraints, replay/idempotency cases, and run Supabase security/performance advisors.
6. Do not run `supabase db push`, `apply_migration`, or any production SQL command without a separate explicit approval.

## Static review checklist

- [x] No SQL execution against Supabase.
- [x] No production branch/database change.
- [x] No Supabase development branch or paid compute.
- [x] No secrets or real account credentials in schema.
- [x] No client grants to `anon` / `authenticated`.
- [x] RLS enabled on every created table.
- [x] Sandbox-only provider constraint.
- [x] Positive integer VND amounts and unique transaction/event keys.
- [ ] Parse and apply on local PostgreSQL/Supabase.
- [ ] Test grants/RLS using anon, authenticated, owner, and backend identities.
- [ ] Verify default ACL changes for the actual migration owner.
- [ ] Implement and test balanced ledger posting in a separate phase.
