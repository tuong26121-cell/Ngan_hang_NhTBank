# Kế hoạch Website Đợt 2B — Issue #35

Nguồn: main `7192af6`; yêu cầu thực thi trực tiếp của chủ repo ngày 06/11/2026.

## Phạm vi và quyết định

Giữ React/Vite và giao diện hiện có. Dùng mapping token nguồn của Nhóm 03, không áp bảng màu đề xuất chưa duyệt. Nhóm 02 xác nhận các route /v1 còn proposed; Nhóm 06 chưa nghiệm thu SEC-01. Không nối gateway SePay, không thêm API giả hoặc mô phỏng lỗi server như dữ liệu thật. Balance/ledger vẫn trong bộ nhớ và reset khi đăng xuất/reload. Tài khoản demo lưu trên thiết bị là cơ chế riêng.

Tiết kiệm/vay ngoài MVP nghiệp vụ theo Nhóm 10: hoàn thiện màn xem trước, không tạo sổ, tính lãi hay nhận tiền. Không mở rộng nghiệp vụ chỉ vì có quyền sửa main.

## Các bước và kiểm chứng

- [x] Viết ca hồi quy Website: đăng nhập demo → tổng quan → lịch sử lọc ngày/kết quả rỗng/reset → hồ sơ phân biệt tài khoản đăng nhập với chủ tài khoản mẫu → tiết kiệm preview; kiểm tra focus sau điều hướng, responsive và không gọi API ngoài.
- [x] Sửa App, Dashboard, AuthGate và CSS trong cấu trúc hiện hữu: skip link, focus nội dung mới; lịch sử có giới hạn ngày và thông báo số kết quả, lỗi khoảng ngày; hồ sơ hiển thị username demo; tổng thu/chi đúng phạm vi phiên, nhãn preview rõ ràng.
- [x] Chạy unit, backend, build subpath, E2E toàn bộ; kiểm tra định dạng các tệp sửa (repo chưa có ESLint). Chỉ thêm lint nếu có kiểm tra mã thực, không đặt alias format là lint.
- [ ] Đọc diff, cập nhật ui-acceptance với 45 mã/giới hạn; commit/push main, theo dõi Actions đúng SHA, sửa lỗi thuộc phạm vi và cập nhật Issue #35.

## Điểm cần review

Ngày theo múi giờ Việt Nam; khoảng ngày đảo phải có lỗi và không hiển thị kết quả gây nhầm. Focus sau animation phải đến nội dung mới. Không gán profile mẫu cho người đăng nhập thật. Không gọi tổng của nhiều tháng là tháng hiện tại. Không coi Chromium giả lập là iOS/Android thật.

## Tiến độ

Đã đọc trực tiếp tài liệu 02/03/06/10 trên main và source Website. Các gate ARCH/SEC/TX/DB chưa PASS; chỉ hoàn thiện demo Website. Push main sẽ kích hoạt Pages/CI theo workflow; không chủ động dispatch APK/SQL hay backend deployment; workflow APK có path filter frontend và có thể tự chạy khi push main.

Tiếp tục ngày 07/11/2026 (Asia/Saigon): môi trường khởi động lại làm mất log /tmp, nên chạy lại và lưu log trong workspace. Đồng bộ main 6cce289 không thay runtime Website, thêm backend tests; backend hiện 25/25. Review độc lập đã hoàn tất, không còn blocker; đã sửa fixture baseURL trong E2E và đổi tên ca kiểm thử để không nhận đã đo zoom.

Bản hợp nhất 0a363c3: đã đọc Design System mới và contract/auth module mới; bỏ CSS auth trùng. Local: unit70, backend75, contract5, fixtures41, E2E53 đạt/10skip, build đạt. Commit theo chế độ không lưu artifact/không deploy vì preflight lưu trữ Nhóm14 chưa mở. CI kết quả cuối theo Issue35.
