# Kế hoạch tiếp quản 14 Issues và thực thi theo phụ thuộc

**Mục tiêu:** tiếp quản điều phối #32–45; triển khai phần đủ điều kiện và ghi blocker theo bằng chứng, không giả định toàn bộ hệ thống đã sẵn sàng.
**Nguồn:** main7192af6; MASTER-STATUS, ROADMAP, de-xuat-dot-2, AGENTS và yêu cầu tự động thực hiện của chủ repository trong phiên này.
**Kiến trúc:** giữ ứng dụng demo hiện hữu; hợp đồng API máy đọc độc lập runtime; SQL v2 archive bất biến; CI kiểm đúng production assets.
**Công nghệ:** React/Vite, Node24, OpenAPI3, Playwright, Capacitor7; không thêm dịch vụ có phí.

## Giới hạn và kiểm tra trọng tâm

- Không SQL/DB/migration nếu chưa xác minh target, review và backup. SQL v2 không dùng runner v3.
- Không lấy mock/frontend local state làm bằng chứng atomic ledger/idempotency bền vững.
- Không gọi browser emulation là thiết bị thật; không phát hành khi P0 còn mở.
- Quyền ghi main/CI/Issues do người dùng cấp; GitHub REST hiện trả Forbidden, việc ghi Issues phải ghi BLOCKED cho đến khi có kênh được phép.
- Bảo toàn checkout cũ và mọi công việc chưa commit; không force-push, không tự triển khai đích chưa định danh.

## Các nhiệm vụ và kiểm tra

1. [x] Đọc main live/14 Issues và xác định phần đã có evidence; đợt1 không lặp.
2. [x] D2-02: tạo docs/dieu-phoi/dot-2a/hop-dong-api-v1.json, schema trường/response/error/auth/pagination và fixture; validate OpenAPI/$refs/fixtures offline, ghi log và điều kiện chưa chốt.
3. [x] D2-03/04: ma trận permission deny-by-default và đặc tả ledger/hash/replay gắn contract; tách acceptance thiết kế khỏi server/runtime còn thiếu.
4. [x] D2-05: rà từng blocker SQL v2, draft diff nếu có thể review độc lập; giữ NOT RUN khi không có target/gate definition.
5. [x] 2B: sửa E2E APK dùng production root assets, local production E2E; audit Android package/version và tình trạng build hiện hành trước native rebuild.
6. [x] 2C: tiếp tục các phần nghiên cứu/kiểm thử độc lập của webhook/admin/AI; không nối provider hoặc dùng secret/tiền thật để lấp blocker.
7. [ ] 3/4: đánh giá điều kiện tích hợp/release; blocked khi auth/DB/ledger chưa verified. Chạy hồi quy cần thiết cho phần thực sự thay đổi.
8. [ ] Sau từng nhóm việc: cập nhật MASTER/ROADMAP/handoff + nội dung cập nhật Issue có thể gửi; ghi VERIFIED/FAIL/BLOCKED/NOT RUN theo đúng mức chứng minh; commit/push có marker không deploy web; theo dõi CI đúng SHA.

## Bàn giao

Các nhóm logic là phạm vi chuyên môn do Nhóm01 tiếp quản, không phải14 tài khoản hay14 agent tự hoạt động. Chọn task tiếp theo từ nguồn phụ thuộc và tiếp tục phần độc lập; chỉ dừng công việc phụ thuộc khi thiếu quyết định/môi trường/quyền. Khung lựa chọn tiếng Việt là tùy chọn, không buộc chờ giữa các task đã được phép.

## Chốt mức độ hoàn thành

Các mục đánh[x] nghĩa phần khảthi đã làm: contract/utility/staticpatch/productionE2E/sơbộ2C. Không phải backend/SQL/nativeAPK đã vận hành. Mục3/4 và6 có blocker tíchhợp theo báo cáo. Mục7/8 tiếp tục theo runtime/access thực tế; không phát hành khiP0còn mở.
