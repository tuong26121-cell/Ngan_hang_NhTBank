# NhTBank SQL v3 — test matrix

Use this as the run record. Initial status for every row is NOT RUN.

| ID | Area | Test | Expected result | Current status |
|---|---|---|---|---|
| PRE-01 | Environment | Runner accepts localhost/127.0.0.1 only, port 54322, database postgres | Other host/port/database rejected before SQL | NOT RUN |
| PRE-02 | Environment | PostgreSQL version and Supabase auth/roles preflight | PostgreSQL 17+; auth.users and required roles exist | NOT RUN |
| ACL-01 | Schema | private owner and grants | Owner postgres; service_role USAGE only; no PUBLIC/client USAGE and no service_role CREATE | NOT RUN |
| ACL-02 | Tables | RLS on all seven application tables | RLS enabled everywhere | NOT RUN |
| ACL-03 | Tables | anon/authenticated table privileges | No direct table privileges | NOT RUN |
| ACL-04 | Tables | service_role privilege matrix | Exactly the documented SELECT/INSERT/UPDATE/DELETE rights; no TRUNCATE/REFERENCES/TRIGGER/MAINTAIN | NOT RUN |
| ACL-05 | Sequences | audit identity sequence privileges | postgres owner; service_role USAGE/SELECT only; no PUBLIC/client USAGE/SELECT/UPDATE | NOT RUN |
| ACL-06 | Functions | ownership and EXECUTE ACLs | postgres owns functions; clients/PUBLIC cannot execute; service_role can execute only bounded cleanup function | NOT RUN |
| RLS-01 | RLS | policy inventory | No client policies in private schema | NOT RUN |
| AUD-01 | Audit | UPDATE probe | Rejected with SQLSTATE 55000 | NOT RUN |
| AUD-02 | Audit | DELETE probe | Rejected with SQLSTATE 55000 | NOT RUN |
| AUD-03 | Audit | TRUNCATE probe | Rejected with SQLSTATE 55000 | NOT RUN |
| AUD-04 | Audit | actor_user_id foreign key inventory | No FK on audit_events; actor UUID remains historical snapshot | NOT RUN |
| IDEM-01 | Idempotency | same principal/scope/key duplicate | Unique violation | NOT RUN |
| IDEM-02 | Idempotency | same key under two principals | Both rows accepted | NOT RUN |
| IDEM-03 | Idempotency | expired completed record cleanup | Removed by bounded cleanup | NOT RUN |
| IDEM-04 | Idempotency | expired started record cleanup | Retained | NOT RUN |
| WEB-01 | Webhook | duplicate provider/event ID | Unique violation | NOT RUN |
| WEB-02 | Webhook | processed with null processed_at | Check violation | NOT RUN |
| WEB-03 | Webhook | non-processed with non-null processed_at | Check violation | NOT RUN |

## Tests not covered by the SQL assertion script

These must remain NOT RUN until implemented as backend integration tests in an isolated test environment:

1. Two concurrent requests with the same idempotency key produce exactly one business operation.
2. Same principal/scope/key with a different request hash is rejected by the backend and does not replay a prior response.
3. Idempotency state transitions cannot be forged by an untrusted client.
4. Cleanup racing with a request/retry cannot delete an in-flight record or permit duplicate business execution.
5. Webhook HMAC signature validation, timestamp/replay protection, secret rotation and constant-time comparison.
6. Duplicate webhook deliveries under concurrency result in one business effect.
7. Backend authorization prevents one user from reading/updating another user's sandbox account or transactions despite service_role bypassing RLS.
8. No service_role key, provider secret, OTP, or bank credential appears in frontend bundles, logs, errors, or Git history.
9. Application-level audit metadata redaction and retention policy.
10. Supabase API Exposed schemas configuration excludes `private`; this is a dashboard/project configuration check and cannot be proven by these SQL scripts.
11. Owner/superuser threat model, backup integrity, external immutable audit export, disaster recovery and compliance review.
12. User deletion behavior: sandbox_accounts ON DELETE RESTRICT needs a reviewed archive/deletion workflow.
13. Role-management authorization: only trusted backend code may assign privileged user_roles; never trust user-editable user_metadata.
14. Idempotency retention/replay window: verify TTL exceeds retry/dispute windows before cleanup is enabled.

## Run record template

- Branch:
- Commit:
- Date/time and timezone:
- OS:
- Supabase CLI version:
- PostgreSQL server version:
- Local stack only confirmed: YES / NO
- PRE-01..PRE-02:
- ACL-01..ACL-06:
- RLS-01:
- AUD-01..AUD-04:
- IDEM-01..IDEM-04:
- WEB-01..WEB-03:
- Integration tests:
- Failure output / issue links:
- Reviewer:
- Final assessment: PASS / FAIL / INCOMPLETE

Never mark a test PASS based only on reading the SQL source. PASS requires an actual run and captured evidence.
