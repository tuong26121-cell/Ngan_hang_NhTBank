# Nghiên cứu sơ bộ các nhóm chờ contract

Ngày06/11/2026; nguồn runtime `b6499a3`, đối chiếu main tiếp theo `3d05f6e` chỉ đổi tài liệu. Bản nháp do phiên điều phối tổng hợp, không phải nhóm logic đã ACK nhận Issue. Không tích hợp, tạo credential/admin hay gọi provider.

| Nhóm / Issue | Hiện vật sơ bộ | Điều kiện chốt/tích hợp | Không suy diễn |
| --- | --- | --- | --- |
| 04 / #35 | Sitemap: đăng nhập/đăng ký/khôi phục → tổng quan → chuyển demo/QR/lịch sử/hồ sơ; loading/empty/error/expired-session ở từng màn; mock states dùng cùng trường contract dự thảo | ARCH-01 endpoint/schema/error, SEC-01 owner check và UX-01 component states | Form demo không phải server authentication |
| 05 / #36 | Android: Auth → tabs → xác nhận demo → receipt; Back, xoay, keyboard, offline, quyền camera; checklist version/package/icon/checksum/update-install | API/session contract02/06/08 và QA13/CI14; build nếu có task/preflight riêng | Browser giả lập không là máy thật; artifact phải tồn tại mới báo có APK |
| 09 / #40 | Dòng dữ liệu Test Mode: raw body → HMAC/timestamp → durable inbox unique event → worker/idempotency → trạng thái persisted → ACK. Hiện gateway trả503 khi thiếu durability | 06 xác minh source trust; 07/08 chốt inbox/transaction/retry/replay; tài liệu provider chính thức còn cần kiểm lại | Không Live; không ACK200 chỉ vì signature hợp lệ nếu dữ liệu chưa lưu |
| 11 / #42 | Sitemap admin nháp: tra cứu scoped/redacted, audit read, incident queue; thao tác nhạy cảm tách khỏi read view; support/auditor chưa có đầy đủ mapping role | 03 tokens +06 permission matrix +08 protected endpoints | Không tạo tài khoản admin, không đưa service_role vào UI, không cấp quyền monetary write theo tên role |
| 12 / #43 | Intent chỉ đọc: giải thích demo/PIN, hướng dẫn UI, mô tả giao dịch của chính chủ sau authorization. Safety cases: yêu cầu chuyển tiền, prompt injection, dữ liệu user khác, đưa secret vào chat | 06 data/tool permissions +08 API scope +10 business rules; budget/nhà cung cấp khi có task thật | Không kích hoạt model API có phí, không tool chuyển tiền, không dữ liệu thật |

Các bản nháp này không làm COORD/ARCH/SEC/DB/TX/UX/QA/OPS tự đạt. Mỗi nhóm cần người/agent nhận có bằng chứng riêng, source version, reviewer và Handoff-ID.
