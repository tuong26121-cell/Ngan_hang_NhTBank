# NhTBank SQL v3 — deep static security review

**Review type:** source-level static review of v3 drafts and local test harness.
**Status:** remediation edits committed; PostgreSQL execution and parser validation remain NOT RUN.
**Scope:** this branch only. No hosted Supabase connection, SQL execution, merge, deployment, or paid resource.

## Files reviewed

- `docs/sql-drafts/README.md`
- `docs/sql-drafts/20261031_000001_nhtbank_core_schema.draft.sql`
- `docs/sql-drafts/20261031_000002_nhtbank_security_assertions.draft.sql`
- `docs/sql-drafts/testing/README.md`
- `docs/sql-drafts/testing/TEST_MATRIX.md`
- `docs/sql-drafts/testing/run-local.sh`

## Findings remediated in this review

### HIGH — stale schema CREATE grant could survive

**Finding:** the schema ACL cleanup revoked PUBLIC/anon/authenticated, but did not revoke a pre-existing CREATE grant from service_role if private already existed.

**Remediation:** core draft now revokes ALL schema privileges from PUBLIC, anon, authenticated and service_role, then grants only USAGE to service_role. Assertions check that service_role, anon and authenticated do not have CREATE, and PUBLIC has no CREATE ACL.

### MEDIUM — CREATE OR REPLACE does not normalize function ownership

**Finding:** replacing a pre-existing function does not necessarily change its owner. A function in private owned by an unexpected role could remain outside the intended ownership boundary.

**Remediation:** explicitly ALTER OWNER TO postgres for all three defined functions before setting function ACLs. Assertions verify private functions are postgres-owned and service_role can execute only the bounded cleanup function.

### MEDIUM — local URI query options could override the apparent target

**Finding:** the test runner accepted arbitrary URI query parameters. Libpq URI options can affect connection behavior; an allow-list should not accept arbitrary query options.

**Remediation:** runner now accepts only an exact local URI with no query string, fixed loopback hostname, port 54322 and database postgres. It also unsets PGHOST, PGHOSTADDR, PGPORT, PGDATABASE, PGSERVICE and PGSERVICEFILE before each psql invocation to reduce environment-based target overrides.

### Additional assertion hardening

- Check exact client/backend schema CREATE restrictions.
- Check sequence ownership and client privilege absence for USAGE/SELECT/UPDATE.
- Check service_role cannot execute any private function other than the bounded cleanup function.
- Expand matrix and documentation with data-retention and authorization assumptions.

## Important residual risks / design decisions

1. **service_role bypasses RLS.** Backend authentication and per-user authorization must be enforced before every query. Never ship the secret to web/mobile.
2. **user_roles is privileged data.** Only trusted authorization code may assign admin/support/operations/risk roles. Never trust user-editable user_metadata for authorization.
3. **Idempotency hash comparison is not enforced by SQL.** Backend must compare request_sha256 and reject mismatches before returning/replaying a prior result. Concurrency and retry behavior need integration tests.
4. **Idempotency cleanup can reopen replay risk after retention.** Define TTL longer than provider/client retry and dispute windows before enabling cleanup. Once a key is purged, a late retry may be treated as new.
5. **Started idempotency records are not purged.** A recovery/reconciliation policy is required so abandoned records do not accumulate indefinitely.
6. **sandbox_accounts uses ON DELETE RESTRICT to auth.users.** User deletion is blocked until a reviewed archival/deletion workflow handles those rows.
7. **Webhook SQL constraints do not validate authenticity.** Backend must implement signature verification, timestamp/replay protection, secret rotation, duplicate delivery handling and concurrency controls.
8. **Audit triggers are not immutable against owners/superusers.** Export security-critical events to an independently controlled sink and define retention/privacy controls for historical actor UUIDs.
9. **private must remain outside Supabase API Exposed schemas.** This setting is not provable by these SQL assertions.
10. **Future objects need ACL discipline.** Explicitly revoke default/public function execution and apply exact grants for every future table, sequence and function.
11. **No real-money ledger exists.** These tables are sandbox-only and are not sufficient for production financial accounting or payment execution.

## Verification status

| Check | Status | Evidence |
|---|---|---|
| Read all six active source/test files | PASS | GitHub fetch succeeded; contents reviewed |
| Identify and remediate static ACL/design findings | PASS | v3 files updated on this branch |
| PostgreSQL parser validation | NOT RUN | No psql/parser tool available in current environment |
| Apply core SQL on local Supabase/PostgreSQL 17 | NOT RUN | No local stack available |
| Run transactional assertions | NOT RUN | Requires local Supabase bootstrap |
| Backend concurrency/webhook integration tests | NOT RUN | Not implemented or executed |
| Hosted Supabase Production changes | NOT RUN | Explicitly out of scope; none performed |

## Conclusion

The v3 draft is materially hardened at source level after the findings above, but it is **not certified as PostgreSQL-valid or runtime-secure** until the local PostgreSQL 17/Supabase Local test pack runs successfully and backend integration tests are completed. Do not apply it to any hosted project.
