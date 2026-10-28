# NhTBank — Tài chính trong tầm tay

Ứng dụng HTML/CSS/JavaScript ưu tiên điện thoại, triển khai bản minh họa theo
bản mô tả sản phẩm được cung cấp. Nhãn xuyên suốt:
**Bản minh họa · Không giao dịch tiền thật**.

Không yêu cầu API Key, mật khẩu ngân hàng hoặc OTP. Không có dịch vụ ngân hàng,
tra cứu người nhận, chuyển tiền hay phát hành thẻ thật được kết nối. QR chỉ là
QR nhận diện mô phỏng, không phải VietQR thanh toán.

## Mở app

```sh
python3 build_static.py
```

Mở `dist/NhTBank.html` để dùng bản một tệp. Hoặc chạy `python3 serve.py` rồi mở
máy chủ cục bộ cổng 8080. Bấm **Trải nghiệm bản minh họa** ở màn hình chào.

Đưa nội dung `dist` lên hosting tĩnh HTTPS để sử dụng như website. Hosting không
cần Python. Build không tự triển khai hoặc tạo URL công khai. QR, font và mã
đọc ảnh đều có sẵn trong gói, không gọi dịch vụ ngoài. HTTPS/localhost và quyền
trình duyệt là điều kiện mở camera; chọn ảnh vẫn hoạt động khi camera không có.

## Chức năng đã xây dựng

- **Tổng quan:** tài khoản che một phần, số dư, cập nhật cuối, ẩn/hiện, sao chép;
  4 thao tác nhanh; dòng tiền theo tháng UTC+7; 3 giao dịch gần đây trên điện
  thoại, tối đa 5 ở màn hình rộng; mục tiêu nổi bật.
- **Chuyển tiền:** 3 bước nhập–kiểm tra–kết quả; giữ dữ liệu lỗi, focus tới lỗi
  đầu tiên; người nhận luôn được ghi chưa xác minh. Phí mô phỏng 0 ₫ đã xác định;
  kiểm tra số tiền nguyên, tổng trừ và số dư; số tiền bằng chữ; chống ghi lặp ở
  luồng xác nhận. Biên nhận có nguồn, đối ứng, ngày UTC+7, phí/tổng trừ và TXT
  đánh dấu **MÔ PHỎNG — Không phải chứng từ thanh toán**.
- **Giao dịch:** tìm tên/nội dung/mã; lọc ngày, tiền vào/ra, trạng thái; giữ bộ
  lọc/scroll khi quay lại; xóa từng điều kiện; xem biên nhận và sửa danh mục;
  xuất CSV theo bộ lọc, kèm thời gian/phạm vi/chế độ, ngăn công thức CSV từ
  trường văn bản. Chỉ có trạng thái hoàn tất mô phỏng trong tập dữ liệu hiện tại.
- **QR:** số tiền tùy chọn, nội dung, tạo QR cục bộ, tải PNG có nhãn; sao chép
  thông tin và chia sẻ ảnh nếu thiết bị hỗ trợ. Đọc QR NhTBank từ ảnh/camera,
  xem lại dữ liệu trước khi chuyển sang biểu mẫu. Mã lạ không mở URL hoặc chuyển
  tiền. Camera dừng khi rời màn hình, ẩn tab, bấm dừng hoặc đọc được mã hợp lệ.
- **Mục tiêu:** tạo/sửa/xóa tên, số tiền, thời hạn, biểu tượng/màu; ghi thêm hoặc
  điều chỉnh tổng tiến độ; xóa tiến độ có lưu lần điều chỉnh; lịch sử cập nhật;
  quá hạn/hoàn tất và gợi ý kế hoạch theo tháng. **Không đổi số dư tài khoản,
  không tạo giao dịch ngân hàng và không cộng thành tài sản mới.**
- **Cá nhân:** hồ sơ minh họa, ẩn riêng số dư hoặc ẩn toàn bộ số tiền, thông báo
  trong ứng dụng có nhóm/đã đọc/lối mở chi tiết, trợ giúp, dữ liệu và đăng xuất.
  Thẻ chỉ là minh họa có khóa/mở với xác nhận, không có thẻ phát hành thật.
- **Dữ liệu:** đặt lại có xác nhận và liệt kê phạm vi; ngoại tuyến có nhãn và
  cập nhật cuối; báo lỗi lưu; hộp thoại giữ focus và xử lý biểu mẫu chưa lưu.

Ẩn toàn ứng dụng cũng che số tiền, chữ mô tả số tiền và tiến độ/biểu đồ. Không
hiển thị QR chứa số tiền trong chế độ này. Xuất CSV/TXT luôn có bước xác nhận
phạm vi và thông báo tệp sẽ chứa số tiền đầy đủ dù đang bật ẩn.

## Dữ liệu và giới hạn

Bản website đang mở vẫn dùng được các thao tác cục bộ khi mất mạng. Chưa có
Service Worker/PWA để bảo đảm tải lại URL khi ngoại tuyến; bản HTML tải về dùng
được độc lập nếu trình duyệt cho chạy JavaScript.

Dữ liệu mới lưu tại `nhtbank-spec-v3`. Lần đầu có thể đọc/mở rộng dữ liệu hợp lệ
của bản `nhtbank-studio-v2`, nhưng không sửa khóa cũ. Dữ liệu chỉ thuộc trình
duyệt/địa chỉ hiện tại; xóa dữ liệu trình duyệt có thể làm mất dữ liệu. Nếu bị
chặn lưu (đặc biệt khi mở tệp), app dùng phiên bộ nhớ và báo rõ.

Giới hạn cục bộ: 1.000 giao dịch mẫu, 50 mục tiêu, 1.000 cập nhật/mục tiêu,
200 thông báo. VND dùng số nguyên an toàn. Dữ liệu cũ lỗi được từ chối, không
xóa bản gốc hoặc tự giả làm dữ liệu kết nối thật.

Luồng thật, đăng nhập thật, OTP, xác minh người nhận, phí/hạn mức thật, tự động
nhận tiền, quản lý thiết bị/phiên ngân hàng và hỗ trợ ngân hàng không được bật.
Không thể suy ra những quyền này từ API đọc số dư/giao dịch.

## Kiểm thử

```sh
node --test tests/model.cjs
python3 build_static.py
python3 serve.py
# Terminal khác, cần Playwright và Chromium:
node tests/demo.cjs
```

`DEMO_URL` đổi cổng máy chủ; `CHROMIUM_PATH` đổi trình duyệt. Bộ test chạy cả
bản tĩnh và HTML một tệp, gồm kiểm tra xuất TXT/CSV/PNG và đọc lại QR.
`tests/accessibility.cjs` dùng một bản axe-core cục bộ qua `AXE_PATH` để chạy
kiểm tra tự động. Xem TEST-RESULTS.md và ACCEPTANCE.md để biết phạm vi thực tế;
không coi kiểm tra tự động là chứng nhận WCAG hoặc thử nghiệm thiết bị vật lý.

## Tài nguyên bên thứ ba

Be Vietnam Pro được lưu cục bộ theo SIL OFL (fonts/OFL.txt).
qrcode-generator 2.0.4 và jsQR 1.4.0 theo MIT, có giấy phép trong vendor/.
Xem THIRD-PARTY.md. Không cần cài npm hoặc gọi CDN khi sử dụng ứng dụng.
