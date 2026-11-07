# Kế hoạch Đợt 2B — GitHub và CI/CD

Nguồn: Issue #45, main `7192af6c28b51b56806b0b9c6827d2d0604bbc8a`.
Thực hiện trực tiếp theo ủy quyền hiện hành; không triển khai backend/database.

- [x] Kiểm kê sáu workflow, trigger, nhánh, quyền, timeout, artifact và run gần nhất.
- [x] Chặn Pages/APK nếu unit, backend security, build hoặc Chromium E2E thất bại; E2E dùng đúng production bundle.
- [x] Sửa workflow nút nhắm nhánh cũ; bảo toàn tên check hiện hành. Bổ sung kiểm thử cấu hình APK vào CI tích hợp.
- [x] Kiểm tra YAML, shell, unit, backend, APK config, build và E2E cục bộ.
- [x] Chỉ push kích hoạt CI khi preflight chi phí đạt; đọc đúng SHA/run/job/step/log/artifact, không suy diễn từ Pages.
- [x] Cập nhật OPS-01, MASTER-STATUS, HANDOFF-LOG và Issue #45; giữ OPEN nếu còn blocker.

Rà soát: thất bại security phải dừng trước upload/deploy; server preview không sẵn sàng phải lỗi; artifact gắn SHA; cancelled/skipped khác PASS; quyền branch protection và billing thiếu phải ghi BLOCKED.
Rollback: revert riêng commit CI sau khi kiểm tra HEAD hiện hành; không force-push hoặc xóa artifact lịch sử.

Bản vá đã push d61e714; Verify/Pages PASS, APK CANCELLED. Nguồn hợp nhất0a363c3 có đủ Verify/Pages/APK PASS, backend75, E2E47/10. Không upload/cache/deploy khi chưa preflight storage; không chấp thuận release. Chi tiết ở van-hanh-01.md.
