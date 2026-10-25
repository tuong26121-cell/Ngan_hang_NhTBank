# Kết quả kiểm tra

Kiểm tra trong môi trường Linux, Node.js 24.19.0, npm 11.9.0 và Chromium 149 (Playwright).

- `npm test`: **24 đạt**, gồm 19 ca logic ngân hàng và 5 ca tương tác component.
- `npm run test:e2e`: **6 đạt**, không bỏ qua ca nào. Chạy trên desktop 1440×1000 và viewport iPhone 13 bằng Chromium (không phải Safari thật).
- `npm run build`: đạt, tạo bản production trong `dist/`.
- `npm run format:check` và `git diff --check`: đạt.

Luồng trình duyệt kiểm tra PIN đúng/sai, ẩn/hiện số dư, số dư không đủ, chuyển tiền đủ ba bước, PIN xác nhận sai, biên nhận, cập nhật số dư và lịch sử, lọc Thu/Chi, tìm kiếm, QR tự xuất hiện và tự cập nhật số tiền/nội dung, các màn sản phẩm xem trước, hồ sơ, đăng xuất, khôi phục phiên bằng tải lại, reduced motion và giữ/khôi phục focus hộp hỗ trợ. Hai ca hành trình đầy đủ bắt cả `pageerror` và console error; không ghi nhận lỗi. Các ca component kiểm tra xác nhận lặp không trừ tiền hai lần, xử lý lỗi ảnh QR, ẩn QR cũ khi sửa liên tiếp và không cung cấp QR/sao chép khi số tiền không hợp lệ.

VietQR trong E2E dùng phản hồi hình ảnh giả lập để chạy ổn định, không cần Internet. Kiểm tra độc lập endpoint thật bằng HTTPS có xác minh TLS: ảnh tài khoản mẫu với số tiền 250.000 VNĐ trả về **HTTP 200, image/svg+xml** sau chuyển hướng từ `.png` sang `.svg` (49.399 byte). Đây không phải kiểm thử thanh toán hoặc xác nhận tài khoản ngân hàng.

Ảnh chụp từ hành trình Playwright: [desktop](screenshots/dashboard-desktop.png), [mobile](screenshots/dashboard-mobile.png). Ảnh mobile toàn trang hiển thị thanh điều hướng cố định ở vị trí tương ứng viewport lúc chụp.

Không có kiểm thử giao dịch thật, backend hay cơ sở dữ liệu vì chúng không thuộc ứng dụng này. Mục tiêu chuyển động mượt chưa được đo frame rate trên thiết bị thật.
