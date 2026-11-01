# NhTBank SQL draft pack

**Status: review-only draft. Not a Supabase migration and not applied anywhere.**

## Files

- `20261031_000001_nhtbank_core_schema.draft.sql` — first-pass private schema, profiles/roles, sandbox transaction data, webhook inbox, idempotency and append-only audit events.
- `20261031_000002_nhtbank_security_assertions.draft.sql` — SQL assertions for schema isolation, client grants, RLS and required server grants.

## Cost and environment

- Prepared on the Git branch `codex/nhtbank-backend-supabase-design-20261031`.
- No Supabase Development Branch created.
- No paid database or compute provisioned.
- No SQL executed against Supabase Production.
- No migration history, table, function, data, or Edge Function changed.

## Security choices

1. Application objects are placed in the non-exposed `private` schema.
2. `anon` and `authenticated` receive no schema/table privileges.
3. RLS is enabled on all seven application tables; no client policies are created because clients do not access these tables directly.
4. A trusted backend is the only intended caller and uses `service_role` strictly server-side.
5. Audit events reject UPDATE/DELETE.
6. Provider webhook raw bodies and secrets are not stored in these tables.
7. Sandbox account rows are explicitly constrained to `environment = 'sandbox'`.
8. Ledger/account tables are deferred until accounting rules and product/legal scope are reviewed.

## Important limitations

- This draft has not been run through PostgreSQL or pgTAP; it is not yet a verified migration.
- A database-level double-entry ledger and balance enforcement are intentionally not included in this first draft.
- The project-specific default privileges finding was observed in `public`; this draft uses a separate schema and explicit per-object grants. Any future functions must have EXECUTE privileges reviewed and explicitly revoked from `PUBLIC` where appropriate.
- The backend's `service_role` credential must never be sent to a browser/mobile client or committed to Git.
- Service-role access bypasses RLS. Authorization must therefore be enforced by the trusted backend before every operation.

## Review / promotion workflow

1. Review this draft and approve table scope, role names, data retention, and sandbox model.
2. Validate against a disposable local Supabase stack/PostgreSQL 17.
3. Run the security assertion script and add owner/non-owner/anon/admin integration tests.
4. Fix SQL and test failures.
5. Only then create a canonical migration using `supabase migration new <descriptive_name>` and copy the reviewed SQL into that generated file.
6. Apply only to a local disposable database first. Applying to the hosted project requires a separate explicit approval.

**Never execute these files in the hosted NhTBank Supabase project as part of this phase.**
