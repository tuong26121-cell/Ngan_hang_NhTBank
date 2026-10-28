# Mẫu nguồn do người dùng cung cấp

Hai gói bên trong `NhTBank 1.1.zip` đã được kiểm tra. Thư mục này giữ đầy đủ mã nguồn gốc để đối chiếu; các hướng dẫn nằm trong mẫu là tài liệu của mẫu, không phải yêu cầu thay đổi dự án React.

- `source/`: toàn bộ `NhTBank-source.zip`, gồm app.js, bank-model.js, CSS, font, thư viện QR, kiểm thử và tài liệu gốc; không chỉnh sửa nội dung.
- `NhTBank-Android-original.html`: tệp HTML độc lập bổ sung trong `App NhTBank v1. 1.zip`; không chỉnh sửa nội dung.

Giao diện ứng dụng đang sử dụng nằm ở `frontend/`, không chạy từ thư mục tham khảo này. Đã tích hợp nền xanh lam–tím, vòng torus CSS, bề mặt biểu tượng, bố cục tiện ích, thanh QR nổi và phông Be Vietnam Pro. Các ký tự biểu tượng dễ bị lỗi phông của mẫu Android được dựng lại thành SVG có cùng ý nghĩa.

Giữ dữ liệu, đăng nhập PIN demo, luồng xác nhận và QR Sandbox của React. Không ghép bộ lưu localStorage, camera quét QR hay các nghiệp vụ khác của ứng dụng JavaScript mẫu vào luồng hiện tại. Tiện ích chỉ có thiết kế được ghi rõ là bản xem trước.

Phông chữ sử dụng theo SIL Open Font License, được giữ tại `frontend/public/fonts/OFL.txt` và `source/fonts/OFL.txt`. Giấy phép thư viện của mẫu giữ tại `source/vendor/`.
