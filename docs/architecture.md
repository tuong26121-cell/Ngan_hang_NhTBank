# Kiến trúc NhTBank Sandbox

- `frontend/src/App.jsx`: phiên đăng nhập, điều hướng, số dư và sổ giao dịch trong bộ nhớ.
- `frontend/src/components/`: Login, Dashboard, Transfer, Deposit và các thành phần giao diện dùng chung.
- `frontend/src/lib/bank.js`: dữ liệu mẫu, định dạng VNĐ, kiểm tra đầu vào và tạo URL VietQR.
- `backend/`: vị trí dự phòng, không có server trong phiên bản này.

## Luồng chuyển tiền

1. Kiểm tra ngân hàng, số tài khoản mẫu, tên người nhận, số tiền nguyên >= 1.000 và không vượt số dư.
2. Người dùng kiểm tra thông tin và phí 0 VNĐ.
3. Xác nhận PIN demo. Chỉ ghi nhận một lần, cập nhật số dư và lịch sử trong bộ nhớ, rồi hiển thị biên nhận và confetti.

Đăng xuất khóa lại giao diện nhưng giữ sổ giao dịch trong phiên. Tải lại trang đặt lại hoàn toàn. Không dùng localStorage, cookie hay dịch vụ ngân hàng.

## VietQR

Chỉ gọi img.vietqr.io khi người dùng chọn tạo mã. Dùng MB Bank BIN 970422 và tài khoản mẫu `0000000000`; nội dung luôn có tiền tố `MO PHONG KHONG CHUYEN TIEN`. Nội dung và số tiền được dịch vụ hình ảnh bên ngoài nhận qua URL, không nhập dữ liệu nhạy cảm. Mã được phủ nhãn DEMO; tuyệt đối không quét bằng ứng dụng ngân hàng thật. Không có cơ chế xác nhận tiền về hoặc tăng số dư bằng QR. Nếu dịch vụ lỗi, giao diện cho phép tải lại và vẫn hiển thị thông tin mẫu.

## Phạm vi

Tiền gửi và Vay nhanh là màn hình xem trước, chưa thực hiện nghiệp vụ hay tính lãi. PIN nằm trong mã nguồn và không thể bảo vệ dữ liệu thật. Không có mục tiêu tuân thủ/bảo mật cho ứng dụng ngân hàng sản xuất.

## Chuyển động

Framer Motion chuyển màn theo opacity/translate và nghiêng thẻ bằng transform; bộ đếm dùng requestAnimationFrame qua `animate`. CSS tạo kính mờ, phản quang, đồng xu và ripple. Tôn trọng `prefers-reduced-motion`. Mục tiêu chuyển động mượt; tốc độ thực tế phụ thuộc thiết bị, không cam kết đo được 60fps trên mọi máy.
