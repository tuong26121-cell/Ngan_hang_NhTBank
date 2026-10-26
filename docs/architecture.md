# Kiến trúc NhTBank Sandbox

- `frontend/src/App.jsx`: phiên đăng nhập, điều hướng, số dư và sổ giao dịch trong bộ nhớ.
- `frontend/src/components/`: Login, Dashboard, Transfer, Deposit và các thành phần giao diện dùng chung.
- `frontend/src/lib/bank.js`: dữ liệu mẫu, định dạng VNĐ, kiểm tra đầu vào và tạo ảnh QR demo cục bộ.
- `backend/`: vị trí dự phòng, không có server trong phiên bản này.

## Luồng chuyển tiền

1. Kiểm tra ngân hàng, số tài khoản mẫu, tên người nhận, số tiền nguyên >= 1.000 và không vượt số dư.
2. Người dùng kiểm tra thông tin và phí 0 VNĐ.
3. Xác nhận PIN demo. Chỉ ghi nhận một lần, cập nhật số dư và lịch sử trong bộ nhớ, rồi hiển thị biên nhận và confetti.

Đăng xuất xóa giao dịch vừa nhập, khôi phục số dư/giao dịch mẫu, xóa bộ lọc và tìm kiếm. Đăng nhập lại không khôi phục dữ liệu vừa xóa. Tải lại trang cũng đặt lại hoàn toàn. Không dùng localStorage, cookie hay dịch vụ ngân hàng.

## QR mô phỏng cục bộ

Màn Nạp tiền tạo QR ngay trên thiết bị sau khi ngừng nhập 400 ms; không gửi yêu cầu ảnh ra ngoài. Timer cũ được hủy khi sửa tiếp hoặc rời màn hình. QR cũ và nút sao chép được ẩn ngay khi đầu vào thay đổi. Chỉ số tiền nguyên từ 1.000 đến 500.000.000 VNĐ và nội dung tối đa 60 ký tự được tạo mã; nút tạo mã cho phép cập nhật ngay.

`qrcode` mã hóa chuỗi `NHTBANK_SANDBOX:` nối với JSON gồm số tiền và nội dung. Đây không phải EMV/VietQR, không chứa tài khoản ngân hàng hoặc URL thanh toán. Ảnh SVG dạng data URL được tạo từ tọa độ ma trận số nguyên, không chèn văn bản người dùng vào XML. Nhãn DEMO nằm trong chính ảnh gốc và không che vùng mã/quiet zone. Không có dịch vụ xác nhận tiền về hoặc tăng số dư bằng QR. Sao chép chỉ được thực hiện sau thao tác người dùng.

## Phạm vi

Tiền gửi và Vay nhanh là màn hình xem trước, chưa thực hiện nghiệp vụ hay tính lãi. PIN nằm trong mã nguồn và không thể bảo vệ dữ liệu thật. Không có mục tiêu tuân thủ/bảo mật cho ứng dụng ngân hàng sản xuất.

## Chuyển động

Framer Motion chuyển màn theo opacity/translate và nghiêng thẻ bằng transform; bộ đếm dùng requestAnimationFrame qua `animate`. CSS tạo kính mờ, phản quang, đồng xu và ripple. Tôn trọng `prefers-reduced-motion`. Mục tiêu chuyển động mượt; tốc độ thực tế phụ thuộc thiết bị, không cam kết đo được 60fps trên mọi máy.
