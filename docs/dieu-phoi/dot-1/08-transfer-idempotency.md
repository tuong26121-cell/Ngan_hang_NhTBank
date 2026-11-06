# Nhom 08 — Hop dong atomic transfer va idempotency

> Phân loại: BAN NHAP THIET KE/REVIEW. Tai lieu duoc viet dua tren source GitHub main ngay 2026-11-06. Khong coi la code da tich hop, test da PASS, hay 14 nhom AI da nhan viec. Quyen thuc thi theo ../quy-che-thuc-thi.md.

## Hien trang
- `frontend/src/App.jsx` tao record, cap nhat `setBalance` va `setTransactions` ngay trong React, khong co durable transaction.
- SQL v2 co `idempotency_keys` unique (principal_key, operation_scope, idempotency_key) va `request_sha256`; schema khong tu enforcement request hash mismatch o backend.
- SePay gateway khong ACK webhook truoc durable storage; chua co transfer engine san sang.

## Flow nhap cua POST /v1/sandbox/transfers (chua implemented)
1. Backend verify JWT, principal, account ownership, transaction_type=transfer, VND integer, balance va request validation.
2. Canonicalize request fields va tinh SHA256; idempotency namespace = principal+operation scope+key.
3. Trong DB transaction, claim unique key; neu da co, lock/load persisted record, compare hash. Hash khac → conflict; hash giong da committed → replay persisted result.
4. Lock account rows theo thu tu on dinh, validate available balance, ghi double entries/business record, persisted idempotency status/resource_id trong **cung transaction**; commit nguyen tu.
5. Neu retry sau commit HTTP response bi that lac, reconstruct ket qua tu resource_id/business record; khong ghi them transaction.
6. Retryable failure truoc commit rollback; khong phan phoi cung idempotency response cho request khac principal.

## State machine (de xuat)
```text
NEW --atomic claim--> PROCESSING --commit transfer + result--> COMPLETED
  \--- concurrent key/hash ---------------------------> REPLAY(COMPLETED)
  \--- same key/different hash -----------------------> REJECT(409)
  \--- exception before commit -----------------------> ROLLBACK/RETRY
```

## Concurrency contract
- 10 worker independent connections same key + same hash => exactly 1 transfer; other 9 replay/wait then same result.
- Same key diff hash concurrent => only request owner committed, others 409; failure before transaction commit => safe retry.
- Same string key across two principals/scopes independently allowed.
- Crash after DB commit before HTTP response => stable replay; crash mid-transaction => zero partial ledger postings.
- Key expiration policy: `expires_at` does not remove unique constraint; agree retention/cleanup and replay horizon before implementing.

## API error and test handoff
`400 VALIDATION_ERROR`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `409 IDEMPOTENCY_CONFLICT`; `409 INSUFFICIENT_BALANCE`; `503 RETRYABLE_UNAVAILABLE` are proposed, not implemented.

**Ban giao:** 07 SQL schema primitives, 06 auth/role checks, 13 integration stress tests. **TX-01:** draft complete only; no backend code written and concurrency NOT RUN.
