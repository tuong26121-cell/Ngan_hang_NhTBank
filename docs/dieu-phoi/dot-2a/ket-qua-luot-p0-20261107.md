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

## Bổ sung Nhóm 02/08/13 - kiểm tra đối chiếu OpenAPI và code

- Trước khi sửa, đã đọc lại `main@2cbde19d088c09c9a381513a0bf3931b39bc42c9`, `package.json`, `scripts/kiem-tra-hop-dong-api.mjs`, OpenAPI v1 draft và bộ test `backend/tests/hop-dong-chuyen-tien.test.mjs`.
- Đã thêm kiểm thử đối chiếu cấu trúc OpenAPI `/v1/sandbox/transfers` → `Idempotency-Key` header → schema với `canonicalizeIdempotencyKey()`. Kiểm tra `required=true`, `1..128`, pattern ASCII, key phân biệt chữ hoa/thường, giá trị từ chối; giữ rõ endpoint là `PROPOSED`. [Commit kiểm thử `ea6b2da48af9ffa248816f7d7c03e1f9d53dfce3`](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/commit/ea6b2da48af9ffa248816f7d7c03e1f9d53dfce3).
- **Bằng chứng CI trước bổ sung:** [Verify `42331060236`](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42331060236) tại source `8e1c91b75bf86d84a9f5080d0b5d150d55720906` = **SUCCESS**, các bước unit, OpenAPI/fixtures, backend security, build, Chromium E2E đều success; đây là bằng chứng cho commit **trước** test mới. APK `42331060230` và Pages `42331060292` = **CANCELLED**, không tuyên bố đã phát hành.
- **Bằng chứng CI test mới:** [Verify `42331345217`](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42331345217), [APK `42331345281`](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42331345281), [Pages `42331345235`](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42331345235) đều **IN_PROGRESS tại thời điểm đối chiếu**; chưa được ghi PASS cho commit `ea6b2da`. Không có log kiểm thử local nguyên repository do `git ls-remote` bị DNS `Could not resolve host: github.com`.
- Chỉ bổ sung kiểm thử ở lớp hợp đồng, không sửa OpenAPI/schema SQL, không gắn HTTP route, không gọi provider, không động tới tiền hoặc database. Nhóm 10/02/06 vẫn cần quyết định có reviewer; 07↔08 cần ledger/recovery/SQL preflight; 13 chỉ nâng trạng thái sau kiểm tra kết luận CI đúng SHA.

**Trạng thái gate không đổi:** COORD-01 đang review; ARCH-01 / SEC-01 / DB-01 / TX-01 / QA-01 ở mức **BLOCKED hoặc PARTIAL** theo phạm vi. SQL **NOT RUN**.
