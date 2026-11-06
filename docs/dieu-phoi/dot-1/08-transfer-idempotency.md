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
`400 VALIDATION_ERROR`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `409 IDEMPOTENCY_KEY_REUSED`; `409 INSUFFICIENT_BALANCE`; `503 RETRYABLE_UNAVAILABLE` are proposed, not implemented.

**Ban giao:** 07 SQL schema primitives, 06 auth/role checks, 13 integration stress tests. **TX-01:** draft complete only; no backend code written and concurrency NOT RUN.

## Đối chiếu hợp đồng vòng 2 — 06/11/2026

- Mã lỗi bản nháp thống nhất với Nhóm 02: `409 IDEMPOTENCY_KEY_REUSED`; nghĩa là cùng namespace/key nhưng khác request hash. Đây là quyết định tài liệu để review, chưa có endpoint thực thi.
- Trạng thái API `PROCESSING` chỉ là nhãn trình bày đề xuất tương ứng DB `started`; `COMPLETED` tương ứng `completed`; DB `failed` chưa có chính sách replay lỗi được chốt. Không đổi enum SQL để khớp tên sơ đồ.
- Với transaction một pha: kiểm tra token/shape/ownership trước; claim key rồi so hash/replay trước khi kiểm tra số dư hiện tại cho yêu cầu mới. Retry giao dịch đã commit vẫn phải trả receipt cũ khi số dư sau lần trước không còn đủ. Hash khác phải conflict kể cả giao dịch cũ còn xử lý. Cần đặc tả mã chờ/timeout khi claim chưa kết thúc.
- SQL v2 `private.sandbox_transactions` là nguồn giao dịch Test Mode, chưa có account balance/ledger nội bộ. Không dùng bản ghi nhập từ provider làm posting ghi nợ. Cần schema ledger riêng được Nhóm 07/08 review trước backend transfer.
- Tiền qua API/DB: đề xuất chuỗi số nguyên VNĐ để không mất độ chính xác BIGINT; frontend chỉ chuyển sang Number sau kiểm tra safe integer. Canonical hash bao gồm version, scope, tài khoản nguồn/đích, amount, currency, nội dung đã chuẩn hóa; không bao gồm JWT, timestamp retry hay request ID. Unicode/whitespace/null/omitted còn phải khóa bằng fixture trước tích hợp.
- Retention, replay của terminal failure và chính sách dọn `started` vẫn **CHƯA CHỐT**. Không bịa TTL, không thêm cleanup job trong đợt nghiên cứu.
