# NhTBank Backend & Webhook Security Test Plan

**Scope:** sandbox gateway source and its security behavior only.
**Test harness:** Node.js built-in `node:test`; no third-party test dependency.
**Execution status at creation:** NOT RUN in the current execution environment.
**Network policy:** tests use loopback HTTP and a mocked upstream fetch. No SePay endpoint, hosted Supabase, Production or real bank service is called.

## Run

From repository root with Node.js 22+:

```sh
npm run test:backend
```

No secret values are required. The test suite uses synthetic constants that are not valid credentials.

## Implemented test coverage

| ID | Control | Test expectation |
|---|---|---|
| HMAC-01 | Raw-body HMAC | Exact timestamp + raw bytes signature accepted |
| HMAC-02 | Tamper detection | Modified body and wrong secret rejected |
| HMAC-03 | Timestamp window | Malformed, stale and future timestamps rejected |
| HMAC-04 | Header validation | Malformed signature/timestamp and short secret rejected |
| HTTP-01 | Health endpoint | Only non-sensitive sandbox status; no-store and defensive headers |
| HTTP-02 | Routing | Unknown route 404; unsupported methods rejected |
| AUTH-01 | Internal API auth | Missing/malformed bearer token rejected |
| AUTH-02 | Fail-closed config | Missing sandbox credentials/account UUID returns 503 |
| UP-01 | Provider egress | Fixed SePay sandbox origin/path, bounded query, redirect error |
| UP-02 | Account isolation | Any record outside configured sandbox account rejected |
| UP-03 | Provider failures | Upstream errors and invalid payloads return generic errors |
| WH-01 | No false ACK | Valid HMAC still returns 503 until durable storage exists |
| WH-02 | Signature rejection | Invalid signature returns 401 |
| WH-03 | Media type | Only application/json (optionally with parameters) accepted |
| WH-04 | Payload ceiling | Raw body above 65,536 bytes returns 413 |
| WH-05 | Method | Non-POST webhook request rejected |
| HTTP-03 | Server limits | Request/header/keep-alive timeouts and header count are bounded |

## Explicitly not covered / not implemented

1. Persistent webhook inbox, unique provider-event key, transactional deduplication and replay state.
2. Replay protection across processes/instances. The timestamp window alone is not durable replay prevention.
3. Concurrent delivery races and exactly-once business side effects.
4. HMAC header compatibility against an actual SePay test webhook sample; no external provider call is made.
5. Secret rotation and key versioning.
6. Authenticated user sessions, per-user authorization, CSRF protections for browser sessions, rate limiting and abuse controls.
7. Production TLS termination, reverse proxy trust boundaries, IP allow-listing and deployment configuration.
8. Durable idempotency request-hash comparison and business transaction atomicity.
9. Database-backed audit logging, retention, alerting and incident response.
10. Dependency audit, SAST, DAST, fuzzing and independent penetration testing.

## Safety boundaries

- Do not configure real bank, SePay Live or production credentials in test environment.
- Do not run tests against a deployed URL; tests start a local server on 127.0.0.1 with an ephemeral port.
- Mock fetch replaces the only upstream network call for test cases.
- Do not change webhook response to 2xx until durable persistence, dedupe, retry/reconciliation and integration tests are implemented.
- A passing unit suite is not authorization to deploy or accept real payments.

## Result recording

Record Node version, command, exit code, test count, failures and commit SHA. A test is PASS only after execution with captured output. Source review alone remains NOT RUN.
