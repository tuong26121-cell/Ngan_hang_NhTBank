# Đợt 2A – Báo cáo thực hiện luồng lõi P0 ngày 07/11/2026

> Điều phối Nhóm 01. Thứ tự: 10 → 02 → 06 → 07 ↔ 08 → 13. Dữ liệu và giao dịch đều ở mức demo/sandbox. **Không thực hiện giao dịch thật, không chạy migration, không ghi database.**

## Xác minh nguồn trước sửa

- Baseline `main`: [81a1554713329dff688b37bc58b3a6aea1939827](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/commit/81a1554713329dff688b37bc58b3a6aea1939827).
- Đọc trực tiếp OpenAPI draft (`docs/dieu-phoi/dot-2a/hop-dong-api-v1.json`), quyền/ledger draft (`phan-quyen-va-giao-dich.md`), `backend/lib/hop-dong-chuyen-tien.mjs`, `backend/lib/xac-thuc-api.mjs`, bộ kiểm thử backend, gói SQL v2.1/A3.6 và báo cáo QA Nhóm 13.
- Không nhân bản lại module JWT/AuthZ, utility fingerprint, hợp đồng API hoặc gói SQL hiện đã tồn tại.
- Môi trường cục bộ không truy cập GitHub bằng git clone (lỗi DNS `Could not resolve host: github.com`); **không có bằng chứng test local mới**. Ghi mã và test qua GitHub connector, quan sát GitHub Actions đúng commit.

## Tiến độ theo thứ tự nhóm

| Nhóm | Thực hiện trong lượt này | Còn chặn / tiêu chí mở khóa | Trạng thái |
| --- | --- | --- | --- |
| 10 (#41) | Đối chiếu PRD và `x-open-decisions`; không tự ấn định phí, retention, TTL/replay hoặc confirmation | Chủ sản phẩm/reviewer chốt phạm vi chuyển khoản demo, chính sách fee/retention và replay horizon | REVIEW PENDING |
| 02 (#33) | Xác minh OpenAPI `1.0.0-draft.1`, mô tả Idempotency-Key ASCII 1–128, endpoint `/v1` vẫn PROPOSED | Chốt error/session/confirmation/cursor, review với 06/08/13, triển khai API có server AuthZ | ARCH-01 BLOCKED |
| 06 (#37) | Xác minh `backend/lib/xac-thuc-api.mjs` đã có JWT verifier + ownership guard, chưa nối route | Trusted issuer/audience/JWKS/role source, session revocation và integration/negative tests; không giả PIN demo thành token server | SEC-01 BLOCKED |
| 07 (#38) | Xác minh gói `docs/sql-drafts/phien-ban-v21/` có diff/sql/assertions và bằng chứng tĩnh | DB disposable identity, backup/recovery, provenance GATE-01..10, PG17 ACL/RLS, reviewer; **SQL NOT RUN** | DB-01 BLOCKED |
| 08 (#39) | Thêm pure utility `canonicalizeIdempotencyKey()` tại [commit e62c217](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/commit/e62c217bf7c7232d583619cd63e1624fc0d32d54); không trim/lowercase key, chấp nhận ASCII `[A-Za-z0-9_-]` 1–128 ký tự và từ chối sai shape. Đây chỉ là kiểm tra header theo hợp đồng, không xác thực hay xử lý chuyển tiền. | Ledger atomic, durable namespace principal+scope+key/hash, persisted receipt, retry/crash và 10 DB connection tests chưa có | TX-01 BLOCKED |
| 13 (#44) | Thêm hai ca kiểm thử pure utility tại [commit 8e1c91b](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/commit/8e1c91b75bf86d84a9f5080d0b5d150d55720906); theo dõi workflow nguồn mới | Chỉ xác nhận test PASS sau khi đúng SHA run hoàn thành; SQL/concurrency/auth route vẫn BLOCKED | QA-01 PARTIAL |

## GitHub Actions – nguồn và giới hạn

- Source SHA chứa mã + test: [8e1c91b75bf86d84a9f5080d0b5d150d55720906](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/commit/8e1c91b75bf86d84a9f5080d0b5d150d55720906).
- [Verify run #42331060236](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42331060236): **IN_PROGRESS tại lần đọc**, chưa có PASS/FAIL cuối.
- [APK run #42331060230](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42331060230): **IN_PROGRESS tại lần đọc**, không suy có APK tải được.
- [Pages run #42331060292](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42331060292): **PENDING tại lần đọc**.
- Run history ở commit `3fc3d7c` thành công không được dùng làm bằng chứng test code mới; workflow sau ghi báo cáo tài liệu có thể bị `[skip ci]`/guard bỏ qua.
- Kết quả điều phối chưa đóng ARCH/SEC/DB/TX/QA gate, dù code đã được ghi lên main.

## Hành động tiếp theo và điều kiện đóng

1. Nhóm 10/02 chốt các quyết định P0 với người duyệt, version hợp đồng; không tự đoán phí, TTL hay issuer.
2. Nhóm 06 kiểm thử server authentication/authorization qua route thực khi có cấu hình tin cậy; kiểm tra quyền cross-user, 401/403/404.
3. Nhóm 07/08 review riêng ledger schema và SQL A3.6; chuẩn bị disposable PG17, rollback và approvals **trước khi chạy SQL**.
4. Nhóm 08 đưa idempotency key vào request handler cùng persisted receipt/ledger atomic khi API/DB đã đủ gate; tuyệt đối không coi key validator là durable dedupe.
5. Nhóm 13 đọc kết luận CI đúng SHA mới, bổ sung các tests P0 độc lập; update gate chỉ theo log thực.

**Quy tắc:** ACK/PRD/spec/CI không thay thế nghiệm thu DB, durable transfer, release hoặc giao dịch thật.
