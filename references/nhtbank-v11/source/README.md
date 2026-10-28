# NhTBank — bản demo chạy trên trình duyệt

Giao diện tiếng Việt dùng HTML, CSS và JavaScript. Không cần API Key, dịch vụ
SePay, máy chủ nghiệp vụ hoặc kết nối ngân hàng. Mọi tài khoản, số dư và giao
dịch đều là dữ liệu mô phỏng; không có tiền thật được chuyển.

## Chạy và dùng thử

- Chạy `python3 serve.py` rồi mở máy chủ cục bộ cổng 8080.
- Hoặc chạy `python3 build_static.py`, mở tệp `dist/NhTBank.html` trên trình
  duyệt. Nếu trình duyệt không cho lưu dữ liệu khi mở tệp, dữ liệu chỉ có trong
  phiên; dùng bản website HTTPS để lưu ổn định theo từng địa chỉ website.
- Đăng nhập mẫu: `demo` / `demo123`. Đây là màn hình thử nghiệm, không phải xác
  thực bảo mật của ngân hàng.

## Những chức năng giữ lại

- Trang chủ, số dư mẫu và ẩn/hiện số dư.
- Chuyển tiền mô phỏng: nhập người nhận, kiểm tra số dư, xem lại và xác nhận.
- Lịch sử, bộ lọc tiền vào/ra, lưu dữ liệu trên trình duyệt, đặt lại và đăng xuất.
- Tài khoản và VA mẫu: tạo, quản lý VA, bật/tắt, xóa và mô phỏng tiền vào/ra.
- Hai vùng dữ liệu demo được lưu riêng; dữ liệu cũ vẫn được đọc, không tự xóa.

Đã bỏ màn hình đọc VA qua API, đăng nhập quản trị backend, Token, webhook và
QR gọi dịch vụ bên ngoài. Không có chức năng chuyển tiền hay nhận thanh toán thật.

## Đưa lên hosting tĩnh

Chạy `python3 build_static.py`, tải nội dung thư mục `dist` lên hosting tĩnh như
Netlify Drop. `index.html` là trang vào. Không cần Python trên hosting, biến
môi trường hoặc backend. Bản tải lên cần giữ các tệp CSS/JavaScript đi kèm.
Việc tạo bản build không tự xuất bản website hay tạo URL công khai.

## Kiểm thử

```sh
node --test tests/sandbox-model.cjs
python3 serve.py
# Trong terminal khác, cần Playwright và Chromium:
node tests/demo.cjs
node tests/sandbox.cjs
```

Kiểm thử mô phỏng trên Chromium không thay thế kiểm tra trên điện thoại thật.
Xem `TEST-RESULTS.md` và `DEMO.md` để biết kết quả và giới hạn hiện tại.
