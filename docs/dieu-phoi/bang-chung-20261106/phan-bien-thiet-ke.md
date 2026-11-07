# Phản biện độc lập bản nháp Đợt 1 và điều kiện Đợt 2

Ngày đối chiếu: 06/11/2026. Checkout: `/workspace/nhtbank-dieu-phoi-20261106`; HEAD đọc tại thời điểm rà soát `b6499a3afc2533eb3564c58c50675c4fde9a3cb6`. Đây là phản biện thiết kế tĩnh bởi agent con `ra_soat_thiet_ke`, không phải tiếp nhận GitHub Issue cho 14 nhóm và không phải kết quả SQL/runtime. Không sửa repository, không SQL, không DB, không CI.

## Kết luận

Bộ Đợt 1 đã có 9 tài liệu và đề xuất 2A–2C. Không cần tạo lại các tài liệu. Có thể bắt đầu nghiên cứu ngay; chưa đủ contract để chốt ARCH-01/SEC-01/DB-01/TX-01. Việc cấp quyền không làm các gate tự đạt.

## Các thiếu sót cần chuyển thành công việc Đợt 2A

| Mã | Mức ảnh hưởng | Bằng chứng | Hướng xử lý và điều kiện đóng |
| --- | --- | --- | --- |
| TK-01 | P1 contract trước tích hợp | `dot-1/02-kien-truc-api-v1.md:32` dùng `IDEMPOTENCY_KEY_REUSED`; `dot-1/08-chong-trung-chuyen-tien.md:34` dùng `IDEMPOTENCY_CONFLICT` cho cùng trường hợp 409 | Chọn một tên canonical trong OpenAPI; cập nhật tài liệu02/08 và test matrix cùng lần; chưa cần sửa runtime vì endpoint `/v1/sandbox/transfers` chưa tồn tại. Đóng khi schema/examples và QA cùng một code. |
| TK-02 | P1 phân quyền trước backend/SQL | `dot-1/06-bao-mat-rbac.md:21` liệt kê `user/support/auditor/admin/service backend`; SQL v2 core:66–72 dùng `customer/support/operations/risk_analyst/admin`; `service_role` là database role, không phải role người dùng | Nhóm06/07/08 chốt ma trận ánh xạ app role ↔ claim server ↔ `user_roles` ↔ DB credential. Không tự map `auditor` thành `risk_analyst` hoặc user thành admin. Quyền không biết phải deny-by-default; QA có cross-role/IDOR cases. |
| TK-03 | P1 dữ liệu và replay trước triển khai | `dot-1/08-chong-trung-chuyen-tien.md:18` dùng `PROCESSING/COMPLETED`; core v2:138–150 có `started/completed/failed`, UUID `resource_id` không FK tới business resource | Chốt ánh xạ trạng thái, loại resource, schema/version của response được replay, giới hạn TTL/cleanup và lỗi final/retryable. Định nghĩa same-key/new hash ở trạng thái thất bại và xử lý rollback/retry đồng thời. Đóng khi API/schema/state machine và test agree. |
| TK-04 | P1 kiến trúc, không coi schema import là ledger | SQL v2 core:75–109 chỉ có sandbox account metadata và giao dịch nhập SePay Test Mode, không có balance hay ledger nội bộ; tài liệu08:14 dự kiến lock account rows + double entries | Tách thiết kế ledger/transfer persistence mới khỏi A3.6 chỉ harden SQL v2. Chốt source of truth/balance, entries/conservation, ownership, khóa tài khoản theo thứ tự, isolation/retry và audit trong một transaction. Không thêm cột/DDL ngẫu hứng vào archive/v2. |
| TK-05 | P1 traceability, chưa phải lỗi SQL runtime | `dot-1/07-sql-v21-a36.md:25–26` định nghĩa GATE-01..10 trong một dòng; archive v2 không chứa các ID đó; QA01..12 là tập test khác | Mở bảng từng GATE-ID với mục tiêu, nguồn A3.5/A3.6 gốc, file/blob, hunk/query/test riêng, owner, reviewer, preflight và log. Hiện chỉ gọi đây là mapping đề xuất, chưa xác nhận canonical GATE numbering. Nếu chưa có nguồn gốc thì giữ cột provenance CHƯA XÁC MINH; không ghi gate PASS. |
| TK-06 | P2 độ đầy đủ OpenAPI | `dot-1/02-kien-truc-api-v1.md:21–37` mới có bảng route/error, chưa schema trường, paging, request examples, token claims/cơ chế confirmation | Chuẩn bị OpenAPI v1 máy đọc được ở Đợt2A: amount VND integer + giới hạn JS/DB, currency, source/recipient, description bounds, validation, request ID, key length/scope, auth/security, pagination và error examples. Gắn rõ endpoint PROPOSED/IMPLEMENTED. |
| TK-07 | P2 điều phối và trạng thái | `tong-quan-trang-thai.md:117/128` trùng số mục11, `:145/153` trùng số13; `nhat-ky-ban-giao.md` có phiếu proposed/ACK pending nhưng thiếu mọi source/version cụ thể trong bảng | Chuẩn hóa đánh số và đặt snapshot hiện hành đầu tài liệu; giữ các đoạn cũ là lịch sử. Mỗi handoff dùng exact blob/commit của artifact, review và ACK riêng. Không tự gán assignee/nhận việc cho nhóm logic từ agent review này. |

Các mức trên áp dụng cho việc chốt/tích hợp hợp đồng tương lai, không phải kết luận đã phát hiện sự cố production.

## SQL v2 được đối chiếu

- `git hash-object docs/sql-drafts/archive/v2/20261031_000001_nhtbank_core_schema.draft.sql`: `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`.
- `git hash-object docs/sql-drafts/archive/v2/20261031_000002_nhtbank_security_assertions.draft.sql`: `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`.
- Đây là Git blob SHA, không phải SHA256 checksum của tập tin. Hai blob khớp điểm neo người dùng.
- `archive/v2/README.md:3` ghi rõ review draft, không canonical migration, chưa thực thi. Nhãn SQL v2.1 trong điều phối chưa thay bytes SQL của v2.
- Core:29 chưa revoke schema grant cũ của service_role; core:160 có FK audit actor `ON DELETE SET NULL`; các điểm đã được tài liệu07 lên hunk plan, chưa phải patch đã hoàn thành.
- Assertions:22–24 chưa có MAINTAIN, :70–97 chưa exact toàn bộ ma trận/column ACL, :99–102 mới kiểm USAGE của audit sequence; không chứng minh SELECT/grant option/effective inheritance đã đạt.
- Không có nguồn/log đủ để đánh dấu GATE-01..10 PASS. Không dùng `docs/sql-drafts/testing` (v3) làm runner v2. Không chạy hay đề xuất tự chạy SQL trong lượt review này.

## Bổ sung thực dụng cho 2A–2C

### 2A — Chốt contract

1. 01+10 chốt MVP sandbox và acceptance có owner review; các thông số fee/retention/horizon còn mở phải có quyết định ghi ADR, không tự đoán.
2. 02+06+07+08 nhận TK-01..06 thành danh sách quyết định dùng chung; OpenAPI/schema phải chốt cùng một version.
3. 07 gửi unified diff A3.6 kèm inventory chỉ scope v2; 08 gửi design ledger riêng và state/retry contract; không để hai bên đợi nhau hoàn tất toàn bộ.
4. 13 phản biện bằng matrix từng gate có source/blob, kiểm tra MAINTAIN/column/global defaults/owner grant option/SET ROLE, xác định safety preflight runner v2 trước runtime.
5. Nghiệm thu thiết kế và nghiệm thu runtime tách cột; test chưa chạy giữ NOT RUN kể cả khi doc review sạch.

### 2B — Phần độc lập

- 03 có thể map tokens vào CSS hiện hành, thay từng nhóm nhỏ và kiểm regression UI, không chờ DB gate để sửa focus/tap/contrast. Tích hợp API vẫn chờ contract.
- 14 kiểm kê đúng trigger/path filter/permissions/environment guard và ngân sách từng workflow. Được chạy local test phù hợp sau preflight; CI thực tế phải có run/SHA/log, không copy trạng thái xanh từ commit khác.
- Nhóm04/05 giữ sitemap/wireframe/mock states khi chờ contract; chỉ tích hợp khi ARCH/SEC/UX đủ và có ownership thực tế.

### 2C — Sơ bộ trong khi chờ

- 09: contract Test Mode, source authentication, durable inbox và ACK/retry; không nối Live.
- 11: admin sitemap, role matrix và incident flow dưới giả định RBAC chưa chốt; không tạo tài khoản admin thật.
- 12: intent read-only và safety/evaluation cases; không cấp quyền chuyển tiền cho AI.
- Các nhóm này không cần đợi toàn bộ gate để nghiên cứu; cũng không được coi mock UI là sản phẩm tích hợp đã nghiệm thu.

## Đầu ra để parent dùng

Nên bổ sung ngay bảng TK-01..07 vào `de-xuat-dot-2.md`, chuẩn hóa bảng GATE trong tài liệu07/13, và ghi kết quả review là **CẦN CHỐT CONTRACT / CHƯA KIỂM THỬ**. Agent con này chỉ tham gia phản biện thiết kế theo phân công có bằng chứng; không đại diện nhận Issues #33/#37/#38/#39/#44, không xác nhận các handoff ACK.
