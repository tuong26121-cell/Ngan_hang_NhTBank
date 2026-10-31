# NhTBank SQL draft pack

**Status: hardened review draft only. Not a canonical migration. Not executed.**

## Versioning and preservation

- This hardening pass is maintained on branch codex/nhtbank-sql-hardening-20261031.
- The original three files are preserved unchanged under docs/sql-drafts/archive/v1/.
- The original working branch codex/nhtbank-backend-supabase-design-20261031 is unchanged.
- The active files in this directory are revised v2 review drafts.

## Files

- 20261031_000001_nhtbank_core_schema.draft.sql — private-schema core objects, server-only grants, RLS, webhook inbox, idempotency and append-only audit controls.
- 20261031_000002_nhtbank_security_assertions.draft.sql — transactional assertions for client isolation, role grants, default function ACLs, ownership, RLS and audit mutation guards.

## Cost and environment

- Documentation and SQL text only; stored on a separate Git branch.
- No Supabase Development Branch, database, compute, or paid resource created.
- No SQL executed locally or remotely during this revision.
- No Supabase Production object, data, migration history, or setting changed.
- No merge, pull request, or deployment performed.

## Security model and assumptions

1. Application tables live in schema private. Confirm that private is NOT listed in Supabase API > Exposed schemas. A schema name alone does not make it unreachable through PostgREST if an operator exposes it.
2. Browser/mobile clients receive no USAGE on private and no table or sequence grants.
3. A trusted backend is the only intended database caller. Its service_role secret is server-side only, never shipped to browser/mobile bundles, logs, or Git.
4. service_role bypasses RLS. The backend must authenticate and authorize every request before using it; RLS is not a substitute for backend authorization.
5. DDL is expected to run under the Supabase postgres owner role. Table/sequence default privileges are role-specific. Per-schema function default ACLs cannot revoke a global PUBLIC EXECUTE grant; each function must therefore have an explicit REVOKE from PUBLIC and application roles.
6. Table ownership must remain with a trusted migration/database owner, never anon, authenticated, or service_role.
7. No client policies are created because direct client database access is intentionally prohibited in this design.
8. Sandbox records are constrained to provider sepay, environment sandbox, and VND only. This is not a real-money ledger or payment execution system.
9. Audit metadata is redacted, JSON-object-only, and size-limited. Do not place credentials, OTPs, full account numbers, raw webhook bodies, or payment secrets in it.
10. Audit triggers reject UPDATE, DELETE, and TRUNCATE, but a superuser/table owner can alter or disable controls. Export security-critical audit records to an independently controlled sink before relying on them for compliance.

## Changes in this hardening pass

- Explicitly revoke function EXECUTE from PUBLIC on every function created in this schema. Per-schema default ACLs cannot override a global PUBLIC EXECUTE default, so every future function must carry its own explicit REVOKE and be covered by assertions.
- Verify existing private schema ownership rather than trusting IF NOT EXISTS.
- Narrow server grants: no routine profile/account deletion, no role UPDATE, no transaction mutation, and no audit mutation.
- Add a TRUNCATE guard to audit events and revoke TRUNCATE through the role grant matrix.
- Namespace idempotency keys by a server-generated principal key (for example user:<uuid> or system:<service>).
- Add webhook status/timestamp consistency constraints and non-empty provider identifiers.
- Add audit metadata type/size checks and profile timestamp maintenance.
- Expand assertions to check elevated table privileges, function ACLs, RLS, object ownership, and audit UPDATE/DELETE/TRUNCATE rejection.

## Local review workflow (not performed by this revision)

1. Review all v2 drafts and compare them with archive/v1/.
2. Use a disposable local Supabase/PostgreSQL 17 environment only; never point test commands at the hosted NhTBank project.
3. Apply the core draft as the postgres owner role.
4. Run the assertions script inside a disposable database. It wraps its audit-trigger probes in a transaction and rolls them back.
5. Add application integration tests for two users, same idempotency key/different principals, same key/different request hash, webhook duplicate delivery, concurrent processing, and backend authorization.
6. Confirm Supabase API Exposed schemas excludes private, and inspect role ownership/ACLs in the local environment.
7. Only after review and successful local tests, create a canonical migration. Applying anything to hosted Supabase requires a separate explicit approval.

**Do not execute these files against the hosted NhTBank Supabase project. This revision has not been parsed or executed by PostgreSQL.**
