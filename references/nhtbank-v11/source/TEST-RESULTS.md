# Kiểm thử NhTBank theo bản mô tả — 25/10/2026

## Kết quả đã chạy

- `node --test tests/model.cjs`: 11/11 đạt. VND nguyên/định dạng/bằng chữ,
  chuyển tiền và số dư, validation, migration, mục tiêu/nhật ký không đổi số dư,
  thông báo theo tùy chọn, thống kê tháng, tìm kiếm và QR chỉ cho dữ liệu mô phỏng.
- `tests/demo.cjs`: cả bản web tĩnh và HTML một tệp đều đạt. Chào/điều hướng,
  ẩn số dư, lỗi và focus biểu mẫu, kiểm tra/chỉnh sửa/xác nhận một lần, TXT biên
  nhận UTC+7 có dấu MÔ PHỎNG, CSV theo bộ lọc và ngăn công thức CSV, sửa danh mục,
  ghi/điều chỉnh/xóa tiến độ giữ nguyên số dư và giao dịch ngân hàng mẫu.
- QR tạo cục bộ, tải PNG, tải lại chính PNG để đọc bằng jsQR và kiểm tra dữ liệu
  tiếng Việt/số tiền; mô phỏng camera bị từ chối và yêu cầu camera đang chờ rồi
  bị hủy/rời trang. Không có yêu cầu tới dịch vụ ngoài trong các luồng.
- Ẩn toàn ứng dụng che tiền ở tổng quan/lịch sử; thẻ mô phỏng và thông báo;
  cảnh báo rời biểu mẫu; tải lại giữ dữ liệu; offline vẫn dùng mô phỏng; reset.
- Các trang chính kiểm tra tại 320, 360, 390, 768 và 1280 px, không tràn ngang.
- `tests/accessibility.cjs` với axe-core cục bộ: không có vi phạm tự động phát
  hiện trong phạm vi welcome, 5 trang chính và biểu mẫu chuyển tiền đã kiểm tra.
  Đã sửa lỗi tương phản phát hiện ở điều hướng/tab. Tăng font 200% tại desktop
  cho 5 trang không tràn ngang. Có focus quay lại từ hộp thoại bằng Escape.

## Giới hạn

Không có API/ngân hàng thật, giao dịch thật hoặc người nhận đã xác minh.
Không có website công khai mới được triển khai. Thử nghiệm trình duyệt dùng
Chromium headless; chưa kiểm tra phần cứng điện thoại, camera thực, VoiceOver/
TalkBack/NVDA hoặc người dùng mới. Không xem kết quả axe là chứng nhận WCAG AA.

## Kiểm tra khi tích hợp tệp người dùng gửi — 25/10/2026

- Mã ứng dụng trong ZIP nguồn khớp ZIP web; HTML build lại khớp tệp HTML người dùng gửi.
- Đã chạy lại 11/11 kiểm thử model, bộ demo trên cả hai bản phân phối và axe-core: đều đạt.
- Kiểm tra cú pháp JavaScript và `git diff --check` đạt.
- Giữ nguyên README.md và .gitignore của nhánh; hướng dẫn mới được lưu trong HUONG-DAN-BAN-MOI.md.
- Bản cập nhật này lưu mã trên GitHub, chưa cập nhật website Sites. Chưa kiểm tra điện thoại/camera thật.

## Tinh chỉnh bố cục theo đánh giá giao diện

- Sửa focus biên nhận về tiêu đề và cuộn về đầu; xác nhận mobile toàn màn hình với nút cuối cố định.
- Tổng quan 390 × 844: thẻ tài khoản khoảng 246 px; bốn thao tác nhanh kết thúc ở 553 px, phía trên điều hướng tại 756 px.
- Danh sách giao dịch có tìm nhanh, chọn dòng tiền, bộ lọc ngày/trạng thái trong bảng mở riêng và nhóm theo ngày.
- QR mặc định, phần tùy chỉnh thu gọn; hồ sơ mở khi sửa; công tắc và điều hướng có kích thước ổn định.
- Bộ demo web/HTML, kiểm thử model và axe tự động đã đạt. Kiểm tra không tràn ngang ở 320, 360, 390, 768, 1440 px; điều hướng ổn định ở 320/390 px.
- Giữ nguyên README.md và .gitignore. Chưa kiểm tra bàn phím ảo, camera, vùng an toàn và trình đọc màn hình trên Android vật lý.
