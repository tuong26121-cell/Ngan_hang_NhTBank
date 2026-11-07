# Cập nhật bảo mật NhTBank Sandbox — 26/10/2026

Liên quan [issue #2 — Bao-mat](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/2). Bản nền đã đối chiếu: `396276ca2853b721ce0fc188e0f45482d619d11e` trên `main`, gồm các thay đổi thông tin hiển thị và workflow APK mới nhất. Không dùng lại bản rà soát cũ làm bản nền.

## Thay đổi

- QR demo được tạo hoàn toàn cục bộ bằng `qrcode` 1.5.4, giữ cập nhật trễ 400 ms và ẩn mã cũ khi sửa đầu vào. Không còn gửi số tiền/nội dung tới dịch vụ ảnh ngoài. Payload có tiền tố `NHTBANK_SANDBOX:` và JSON số tiền/nội dung; không có tài khoản, URL thanh toán hay định dạng EMV/VietQR.
- Nhãn DEMO nằm trong chính SVG, ngoài vùng QR và quiet zone. Chỉ tọa độ ma trận số nguyên được chèn vào XML; văn bản nhập được mã hóa trong QR, không chèn vào markup.
- Đăng xuất xóa giao dịch vừa nhập, đặt lại số dư/giao dịch mẫu và bộ lọc/tìm kiếm. Kiểm tra đăng nhập lại trong cùng trang, không tải lại để che mất lỗi.
- Bỏ cách diễn đạt khẳng định an toàn trên giao diện, giữ cảnh báo mô phỏng và không nhập thông tin ngân hàng thật. Giữ nguyên tên, số tài khoản hiển thị và số dư mẫu 4.056.000 VNĐ của bản nền.
- Nâng Vite 6.4.5, PostCSS 8.5.31, Vitest 5.0.5. Override `postcss-selector-parser` 7.1.6 sửa cảnh báo phụ thuộc của Tailwind/PostCSS Nested mà không chuyển Tailwind sang phiên bản 4. Bản CSS sau build giống từng byte với bản nền đã build.
- Dev/preview mặc định chỉ nghe trên `127.0.0.1`. README có lệnh mở LAN khi cần, không hướng dẫn công khai dev server.
- Workflow APK chỉ tự chạy khi push vào `main`; bước xuất bản release cũng yêu cầu `main`, tránh mã ở nhánh tính năng ghi đè APK đã công bố.

Không bổ sung backend, cơ sở dữ liệu, xác thực thật hoặc thanh toán thật. PIN công khai 123456 vẫn chỉ là thao tác demo.

## Kiểm chứng

Môi trường: Linux, Node.js 24.22.1, npm 11.9.0.

| Kiểm tra                     | Kết quả                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `npm test`                   | 31/31 đạt: 25 ca logic/QR và 6 ca tương tác, gồm đăng xuất không reload, QR dữ liệu tiếng Việt và dữ liệu giống XML |
| `npm run build`              | Đạt                                                                                                                 |
| `npm audit --json`           | 0 cảnh báo tại thời điểm kiểm tra, gồm cả phụ thuộc phát triển                                                      |
| CSS sau build so với bản nền | Giống từng byte                                                                                                     |
| E2E desktop và mobile        | 6/6 đạt trên Chromium 153.0.8010.0 bằng cấu hình tạm chỉ trỏ executable; không tắt web security                     |

Lệnh E2E mặc định ban đầu không chạy vì môi trường thiếu Chromium 149 của Playwright; tải chuẩn bị lỗi. Đã chạy cùng bộ 6 ca với Chromium 153 tương thích bằng cấu hình tạm (không đưa binary/cấu hình môi trường này vào repository). Không kiểm tra Safari hoặc thiết bị Android thật.

`jsqr` 1.4.0 là phụ thuộc chỉ cho kiểm thử giải mã độc lập. Các ca logic dựng lại ảnh nhị phân từ SVG đã xuất rồi giải mã. E2E bổ sung giải mã ảnh thật trong canvas trình duyệt, kiểm tra không có yêu cầu ra ngoài khi tạo/sửa QR, và đăng xuất/đăng nhập lại không reload.

## Còn phải xác minh trước khi đóng issue

- Kiểm tra HTTPS và các header CSP, chống nhúng trang, Referrer-Policy tại URL triển khai thực tế. Mã nguồn không xác nhận được cấu hình của nhà cung cấp hosting.
- Chạy lại bộ E2E trên Chromium chuẩn do Playwright cài trong CI; phân biệt với Chromium tương thích dùng trong môi trường kiểm tra hiện tại.
- Không dùng kết quả audit 0 hoặc các kiểm thử demo để kết luận ứng dụng đủ điều kiện bảo mật ngân hàng thật. Không tự động đóng issue #2 bằng cập nhật này.


## Cập nhật 30/10/2026 — tài khoản demo cục bộ và thay nhận diện

- Màn đăng nhập mới là **khung UI mô phỏng**, không phải sản phẩm xác thực ngân hàng thật. Người dùng tự đăng ký tên/mật khẩu; hàm băm PBKDF2-SHA256 150.000 vòng và salt ngẫu nhiên; mã khôi phục riêng được băm, xoay sau khi sử dụng.
- Ghi nhớ tên tài khoản tùy chọn, không ghi mật khẩu rõ. Không auto-login khi tải trang; dữ liệu phiên ứng dụng vẫn reset theo hiện trạng.
- Không có máy chủ, tài khoản liên thiết bị, đăng ký điện thoại/email, OTP thật, cookie phiên bảo mật hoặc bảo vệ chống tấn công toàn hệ thống. Truy cập localStorage, mất thiết bị hoặc xóa bộ nhớ vẫn là giới hạn. **Không được dùng tài khoản thật, OTP hoặc thông tin ngân hàng để đăng nhập demo.**
- PIN `123456` vẫn là xác nhận **chuyển tiền mô phỏng**, không phải mật khẩu đăng nhập mới. Tạo VietQR bên ngoài và quét VietQR không có xác minh giao dịch thật.
- Logo NT và 20 biểu tượng người dùng cung cấp chỉ là tài nguyên đồ họa, không chứng nhận mức độ bảo mật. Không nối backend SePay/MB thật hoặc thay đổi dữ liệu giao dịch.
