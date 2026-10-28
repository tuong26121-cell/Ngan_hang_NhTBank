# Đối chiếu bản mô tả NhTBank

Bản triển khai này là **bản minh họa**, không phải ngân hàng hoặc dịch vụ tiền
thật. Tài liệu gốc được đọc làm yêu cầu; không đưa nguyên văn tệp người dùng gửi
vào kho mã. Mỗi mục dưới đây mô tả sản phẩm đã có, không phải tuyên bố kết nối thật.

| Nhóm yêu cầu | Kết quả triển khai |
| --- | --- |
| Nhận diện | Logo N nét liên kết, tên NhTBank, thông điệp Tài chính trong tầm tay; Be Vietnam Pro cục bộ; xanh #075E50, nền #F5F7F4, nhấn #DDF47A |
| Màn hình chào | Trải nghiệm bản minh họa, giải thích chưa có dịch vụ thật, không nhận OTP hoặc thông tin ngân hàng |
| Điều hướng | Tổng quan · Giao dịch · QR · Mục tiêu · Cá nhân; cùng thứ tự trên desktop; bước chuyển tiền nằm riêng |
| Tổng quan | Tài khoản che một phần, nguồn/cập nhật cuối, hiện/ẩn/sao chép; 4 thao tác nhanh; dòng tiền tháng; giao dịch gần đây 3/5 mục; mục tiêu nổi bật |
| Chuyển tiền | 3 bước, tên chưa xác minh, người nhận mẫu, lỗi từng trường, giữ dữ liệu, focus lỗi đầu; phí/nguồn/tổng trừ; số tiền bằng chữ; xác nhận một lần |
| Kết quả | Trạng thái hoàn tất chỉ cho mô phỏng cục bộ; biên nhận đủ ngày UTC+7, mã, nguồn/đối ứng, tiền/phí/tổng, dấu MÔ PHỎNG; xuất TXT |
| QR | Tạo và tải PNG minh họa; sao chép/chia sẻ khi hỗ trợ; đọc QR riêng của NhTBank từ ảnh/camera; mã lạ không mở URL; dừng camera khi rời trang hoặc ẩn tab |
| Lịch sử | Tìm tên/nội dung/mã; khoảng ngày, tiền vào/ra, trạng thái; số kết quả, xóa từng điều kiện; giữ lọc và scroll; xuất CSV theo bộ lọc có dấu minh họa |
| Phân tích | Theo tài khoản và tháng UTC+7; số liệu bằng chữ và thanh tỷ lệ; sửa danh mục; loại chuyển giữa tài khoản/chuyển tiền khỏi chi tiêu; tiến độ thủ công không vào dòng tiền |
| Mục tiêu | Tạo/sửa/xóa, ngày tùy chọn, màu/biểu tượng, ghi thêm/điều chỉnh/xóa tiến độ với nhật ký; quá hạn/hoàn tất; gợi ý kế hoạch theo tháng; không đổi số dư |
| Thẻ | Chỉ mở chủ động từ Cá nhân; thẻ mẫu che số, khóa/mở có xác nhận; không có đơn vị phát hành thật hoặc hạn mức giả |
| Cá nhân | Hồ sơ, hai tùy chọn ẩn, thông báo trong app, nhóm/đã đọc/lối mở chi tiết, trợ giúp, dữ liệu, rời bản minh họa |
| Xuất dữ liệu | Xem phạm vi trước xuất, cảnh báo tiền đầy đủ khi đang ẩn; TXT/CSV/PNG có dấu minh họa; không tuyên bố hỗ trợ PDF |
| Dữ liệu | Lưu cục bộ riêng, migration bản v2 hợp lệ, báo lỗi lưu/dữ liệu hỏng; offline/cập nhật cuối; reset có xác nhận và liệt kê phạm vi |
| Kết nối thật | Chưa bật chuyển tiền, nhận tiền, xác minh, API, tài khoản thật, OTP, thẻ thật hoặc quản lý phiên ngân hàng; luôn giải thích điều kiện |

## Kết quả xác minh

Xem TEST-RESULTS.md. Có kiểm thử mô hình, kiểm thử Playwright cả bản web và HTML
một tệp, xuất/đọc lại QR, kiểm tra tự động axe và tăng chữ 200% tại desktop.
Điện thoại được mô phỏng theo kích thước, không phải thử thiết bị vật lý.

Chưa xác minh trực tiếp NVDA/VoiceOver/TalkBack, camera phần cứng, bảng chia sẻ
của hệ điều hành hoặc thử nghiệm người dùng mới. Không tuyên bố chứng nhận WCAG
2.2 AA; các kiểm tra tự động chỉ bao phủ được một phần tiêu chí.

## Phạm vi bàn giao

Mã nguồn, bản build tĩnh, HTML một tệp, hướng dẫn sử dụng/cấu hình, giấy phép
thư viện/font, bảng đối chiếu này và kết quả kiểm thử. Chưa có URL website công
khai mới được cấp trong tác vụ. Nhánh GitHub thử nghiệm từng bị từ chối quyền
push (403); việc xuất bản hoặc đẩy nhánh cần quyền hợp lệ từ nền tảng.
