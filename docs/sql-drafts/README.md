# NhTBank SQL draft pack

**Status: hardened v3 review draft only. Not a canonical migration. Not executed.**

## Versioning and preservation

- Active files in this directory are v3 review drafts.
- The exact v2 files were preserved unchanged under docs/sql-drafts/archive/v2/.
- The original v1 files remain preserved under docs/sql-drafts/archive/v1/.
- Work remains isolated on branch codex/nhtbank-sql-hardening-20261031.
- The earlier architecture branch codex/nhtbank-backend-supabase-design-20261031 is not modified by this work.

## Files

- 20261031_000001_nhtbank_core_schema.draft.sql — private-schema core objects, explicit object ACL cleanup, RLS, sandbox records, webhook inbox, idempotency and append-only audit controls.
- 20261031_000002_nhtbank_security_assertions.draft.sql — transactional assertions for client isolation, exact role grants, ownership, RLS, function ACLs, idempotency expiry cleanup, webhook state and audit mutation guards.

## Cost and environment

- Documentation and SQL text only, stored on a separate Git branch.
- No Supabase Development Branch, database, compute, or paid resource created.
- No SQL executed locally or remotely during this revision.
- No Supabase Production object, data, migration history, or setting changed.
- No merge, pull request, or deployment performed.

## Security model and assumptions

1. Application tables live in schema private. Confirm that private is NOT listed in Supabase API > Exposed schemas. The SQL assertions cannot inspect the hosted API configuration.
2. Browser/mobile clients receive no USAGE on private and no table or sequence grants.
3. A trusted backend is the only intended database caller. Its service_role secret is server-side only, never shipped to browser/mobile bundles, logs, or Git.
4. service_role bypasses RLS. The backend must authenticate and authorize every request before using it; RLS is not a substitute for backend authorization.
5. DDL is expected to run as the Supabase postgres owner role. Default privileges are role-specific. Schema-level default ACL revokes do not subtract global default grants, so v3 also explicitly revokes privileges on all current tables and sequences after creation, then grants the intended minimum. Future objects must repeat this explicit ACL discipline.
6. Table and function ownership must remain with a trusted migration/database owner, never anon, authenticated, or service_role.
7. No client policies are created because direct client database access is intentionally prohibited in this design.
8. Sandbox records are constrained to provider sepay, environment sandbox, and VND only. This is not a real-money ledger or payment execution system.
9. Audit metadata is JSON-object-only and size-limited. Do not place credentials, OTPs, full account numbers, raw webhook bodies, or payment secrets in it.
10. Audit actor_user_id is a historical UUID snapshot without a foreign key to auth.users. This deliberately avoids ON DELETE SET NULL issuing an UPDATE that conflicts with the append-only audit trigger. Apply a documented retention/privacy policy to historical identifiers.
11. Audit triggers reject UPDATE, DELETE, and TRUNCATE, but a superuser/table owner can alter or disable controls. Export security-critical audit records to an independently controlled sink before relying on them for compliance.
12. The idempotency cleanup function is SECURITY DEFINER, owned by postgres, and can delete only expired completed/failed rows in bounded batches. It cannot delete started rows. Schedule calls from a trusted backend/maintenance process; no scheduler or paid service is provisioned by this draft.
13. Request-hash mismatch detection remains an application/backend responsibility. The unique constraint prevents duplicate principal/scope/key rows but cannot by itself compare and reject a different request hash.

## v3 corrections

- Preserve exact v2 files under archive/v2 before changing the active draft.
- Explicitly revoke all current table and sequence ACLs from PUBLIC, anon, authenticated, and service_role before reapplying the narrow server grant matrix. This neutralizes unexpected global default ACL grants on the objects already created.
- Keep role-specific default-privilege revokes for future objects and document that they do not override global defaults.
- Remove the audit actor foreign key so deleting auth.users does not attempt a forbidden UPDATE on the append-only audit table; retain actor UUID as historical data.
- Add a bounded SECURITY DEFINER cleanup function for expired terminal idempotency records. Started records are never purged by this function.
- Expand assertions to check exact service_role table privileges, PUBLIC/client ACLs, sequence ACLs, function ACLs and ownership, audit actor FK absence, cleanup behavior, webhook state in both directions, and audit UPDATE/DELETE/TRUNCATE rejection.

## Local review workflow (not performed)

1. Review active v3 against archive/v2 and archive/v1.
2. Use a disposable local Supabase/PostgreSQL 17 environment only; never point test commands at the hosted NhTBank project.
3. Apply the core draft as the postgres owner role.
4. Run the assertions script inside a disposable database. It rolls back its test data.
5. Add application integration tests for two users, same idempotency key/different principals, same key/different request hash, duplicate webhook delivery, concurrent processing, backend authorization and cleanup concurrency.
6. Confirm Supabase API Exposed schemas excludes private, and inspect role ownership/ACLs in the local environment.
7. Only after review and successful local tests, create a canonical migration. Applying anything to hosted Supabase requires a separate explicit approval.

**Do not execute these files against the hosted NhTBank Supabase project. v3 has not been parsed or executed by PostgreSQL.**
