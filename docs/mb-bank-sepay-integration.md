# Kết nối MB Bank cá nhân với NhTBank — chuẩn bị Sandbox (29/10/2026)

**Trạng thái:** thiết kế + bộ chuyển đổi dữ liệu và unit test; CHƯA kết nối tài khoản MB/SePay, CHƯA có backend chạy và CHƯA đưa dữ liệu thật lên giao diện. Không dùng PIN demo để bảo vệ dữ liệu thật.

## Mục tiêu và ranh giới

- Ưu tiên: đọc **lịch sử giao dịch** được ngân hàng cho phép, lọc/tìm kiếm trong NhTBank.
- **Số dư hiện tại:** không suy luận từ giao dịch hoặc trường `accumulated` (nếu có). Chỉ hiển thị số dư thực khi có API cung cấp và được xác thực rõ ràng; nếu không, hiện "Chưa hỗ trợ".
- **Chuyển tiền:** không triển khai khi chưa có API thanh toán/chuyển tiền được ngân hàng cấp phép và quy trình xác thực người dùng phù hợp.
- Ưu tiên khảo sát kênh MB Bank chính thức cho tài khoản **cá nhân**. Nếu chưa được MB cấp API phù hợp, dùng SePay làm trung gian đọc giao dịch sau khi chủ tài khoản chấp thuận; không giả định MB có API cá nhân mở công khai.
- NhTBank hiện là GitHub Pages SPA, toàn bộ dữ liệu mẫu nằm trong bộ nhớ trình duyệt. **Không** đặt API token, HMAC secret hoặc dữ liệu ngân hàng thật vào frontend hay GitHub Pages công khai.

## SePay: dữ liệu và hai môi trường

- API v2 Production: `https://userapi.sepay.vn/v2/transactions`
- API v2 Sandbox: `https://userapi-sandbox.sepay.vn/v2/transactions` (dữ liệu mô phỏng cách ly, không cần tài khoản ngân hàng thật).
- Request dùng `Authorization: Bearer <token>` **chỉ trên máy chủ**. Token Test mode khác Production và được cấp trong Dashboard SePay; theo tài liệu, token API chưa có phân quyền chi tiết, vì vậy cần bảo vệ như bí mật có quyền cao.
- Dữ liệu điển hình: `id` UUID, `transfer_type` (in/out), `amount_in`, `amount_out` (số nguyên VNĐ), `transaction_date`, `transaction_content`, `reference_number`, `bank_account_id`. Sự có mặt của giao dịch tiền ra phụ thuộc ngân hàng, loại tài khoản và phương thức kết nối; cần thử nghiệm thực tế.
- `frontend/src/lib/sepayAdapter.js` là bộ chuyển đổi dữ liệu **thuần túy** sang schema hiển thị của NhTBank, có kiểm tra đầu vào và bỏ trùng theo UUID. Chưa được gọi trong ứng dụng đang hoạt động.

## Kiến trúc dự kiến, chưa triển khai

1. Chủ tài khoản chủ động chấp thuận kết nối MB với nhà cung cấp được phép; không nhập OTP, mật khẩu hoặc CCCD vào NhTBank.
2. Máy chủ riêng có đăng nhập thực và phân quyền theo người dùng, giữ token SePay trong secret manager, gọi API Sandbox để đọc lịch sử.
3. Máy chủ xác thực dữ liệu, giới hạn bản ghi theo tài khoản đã cấp quyền, loại bỏ trùng theo UUID rồi cung cấp API **chỉ đọc** cho frontend. Không chuyển token về trình duyệt.
4. Với giao dịch gần thời gian thực, tạo HTTPS webhook được SePay hỗ trợ: HMAC-SHA256 trên **raw request body**, header `X-SePay-Timestamp` và `X-SePay-Signature`, từ chối sai chữ ký hoặc quá 5 phút; ghi nhận idempotency theo ID giao dịch.
5. Đối soát định kỳ bằng API v2, xử lý ngắt mạng/429, giám sát webhook, bảo vệ log và dữ liệu, hạn chế lưu giữ theo mục đích.
6. Chỉ hiển thị dữ liệu thật ở **chế độ đã kết nối** riêng, có nhãn ngân hàng và thời điểm đồng bộ; chế độ Sandbox vẫn độc lập, không trộn vào số dư mẫu.
7. Trước khi bật Production: rà soát an toàn thông tin, chính sách đồng ý/thu hồi, quản trị dữ liệu, kiểm thử trên Android và Windows, xác thực danh tính phù hợp và chấp thuận của nhà cung cấp.

## Điều kiện còn thiếu

- [x] Xác định mã nguồn hiện có là demo, chưa có backend.
- [x] Xác nhận SePay API v2 có Sandbox và endpoint truy vấn giao dịch.
- [x] Chuẩn bị bộ chuẩn hóa giao dịch thuần dữ liệu và test mẫu.
- [ ] Chốt kênh kết nối MB trực tiếp có cấp quyền chính thức cho cá nhân hay dùng SePay.
- [ ] Thiết kế và duyệt máy chủ bảo mật, lưu trữ và chính sách dữ liệu (không tự ý đưa backend vào bản demo).
- [ ] Tạo tài khoản Test mode và API token **trong hệ thống của chủ tài khoản**, không chia sẻ trong chat.
- [ ] Thử API Sandbox có xác thực token trên máy chủ rồi chạy kiểm thử webhook và đối soát.
- [ ] Kiểm tra điều kiện gói SePay và hỗ trợ thực tế cho tiền vào/tiền ra MB cá nhân.
- [ ] Chỉ sau đó mới cân nhắc liên kết MB thật và mở chức năng đọc dữ liệu.

## Tài liệu nhà cung cấp đã đối chiếu

- [SePay API v2](https://developer.sepay.vn/vi/sepay-api/v2/gioi-thieu)
- [Truy vấn giao dịch v2](https://developer.sepay.vn/vi/sepay-api/v2/giao-dich/danh-sach)
- [SePay Test mode](https://developer.sepay.vn/vi/tien-ich-khac/test-mode)
- [Tạo API token v2](https://developer.sepay.vn/vi/sepay-api/v2/tao-api-token)
- [Webhook HMAC](https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc)
- [Hướng dẫn MB qua SePay](https://docs.sepay.vn/ket-noi-mb-api.html)
