# NhTBank QR Studio — thiết kế tách biệt Sandbox (30/10/2026)

## Phạm vi đã triển khai trên nhánh tính năng

- Dùng URL ảnh `https://vietqr.app/img` và các tham số theo tài liệu do người dùng cung cấp: `acc`, `bank`, `amount`, `des`, `template`, `showinfo`, `fullacc`, `holder`, `store` và `download`.
- Danh sách ngân hàng chọn lọc theo `https://vietqr.app/banks.json` (MB, Vietcombank, Techcombank, KienlongBank, Agribank, ...), không mặc nhận mọi mã đều được hỗ trợ. API/độ sẵn sàng của dịch vụ ngoài không do NhTBank bảo đảm.
- Chỉ dựng URL và gắn `img.src` sau khi người dùng nhập dữ liệu, đánh dấu đồng ý và chủ động nhấn tạo. Không tự gọi dịch vụ khi mở màn, thay đổi trường hoặc dùng QR mô phỏng.
- Chuyển sang dữ liệu mới sẽ ẩn ảnh QR cũ ngay. Có thể sao chép đường dẫn, mở ảnh gốc hoặc tải ảnh bằng `download=true`.
- Dữ liệu gửi qua HTTPS trong query URL đến dịch vụ bên ngoài; URL có thể hiện trong lịch sử trình duyệt, log dịch vụ hoặc nơi chia sẻ. Không dùng cho bí mật; tuyệt đối không gửi PIN, OTP hoặc mật khẩu.
- VietQR có thể được dùng chuyển tiền qua ứng dụng ngân hàng riêng của người quét. NhTBank **không thực hiện giao dịch, không xác minh chủ tài khoản, không đánh dấu đã nhận tiền, không thay đổi số dư/lịch sử mô phỏng**. QR Sandbox `NHTBANK_SANDBOX:` và ảnh có nhãn DEMO giữ nguyên.

## Kiểm thử và điều kiện đạt

1. `npm test`: hàm dựng URL encode ký tự đặc biệt, loại input sai, bỏ tham số tùy chọn; UI yêu cầu đồng ý trước khi tạo và ẩn ảnh khi chỉnh sửa.
2. `npm run build -- --base /Ngan_hang_NhTBank/`: build React/Vite tương thích đường dẫn Pages.
3. `npm run test:e2e`: ở hai dự án Playwright Android/Windows, route ảnh VietQR giả lập, xác nhận không có request trước khi click, có request đúng sau click, và QR demo không thay đổi.
4. `npm run format:check` nếu CI yêu cầu.
5. Chỉ nghiệm thu phát hành sau khi CI và kiểm thử trực quan/trên thiết bị thực, xác minh QR bằng ứng dụng ngân hàng trong môi trường được người dùng cho phép.

## Đối chiếu tiêu chí UI

- P0 C01/C02/C05: nút tạo, sao chép, tải ảnh và điều kiện đồng ý có nhãn/feedback. Cần nghiệm thu cảm ứng và bàn phím trên thiết bị thật.
- P0 về riêng tư/phân tách trạng thái: không gửi dữ liệu qua mạng trước hành động chủ động; không lấy PIN demo làm xác thực ngân hàng.
- Các tiêu chí A–H khác trong `docs/ui-standard.md`: chưa nghiệm thu đầy đủ; xem `docs/ui-acceptance.md`.

## Cảnh báo

Sử dụng tham số `holder` chỉ là điền tên hiển thị vào ảnh; không chứng minh tên đã được ngân hàng xác minh. Tên người thụ hưởng do ứng dụng ngân hàng xác nhận mới là thông tin cần đối chiếu. Dịch vụ `vietqr.app` không phải backend của NhTBank.

## Nâng cấp giao diện nhận tiền và quét QR v2

- Thẻ VietQR được bao bởi giao diện NhTBank (gradient, biên nhận với viền đứt, dữ liệu nhận tiền); bitmap của bên cung cấp không được thay đổi. Có thêm chọn ngân hàng gửi tiền và chuyển sang trang chính thức của MB, VCB, TCB, KLB, Agribank. **Đây không phải deep link mở màn chuyển tiền**, không đính kèm thông tin giao dịch để tránh truyền bên ngoài khi chưa có tích hợp cấp phép.
- Nút QR giữa thanh điều hướng mở màn camera (`QrScanner.jsx`) sau khi đăng nhập. `getUserMedia` chỉ chạy trong HTTPS sau khi mở màn, yêu cầu trình duyệt cấp quyền. Bộ giải mã `jsqr` chạy cục bộ cho camera và ảnh thư viện, không upload. Các trường VietQR TLV mã 38/NAPAS, tiền VND và CRC được kiểm tra cục bộ trong `scanVietQr.js`.
- CRC là xác nhận toàn vẹn dữ liệu, **không phải xác thực người nhận**. Tên ngân hàng BIN chỉ hiển thị mã; ứng dụng ngân hàng thật phải đối soát tên và xác nhận trước giao dịch.
- Khi thiết bị không có camera/không cấp quyền, có chọn ảnh từ thư viện hoặc dán payload để phân tích; khi rời trang hoặc quét xong thì dừng stream.
- E2E mới dùng file PNG VietQR tạo cục bộ, không gửi tiền, không gọi nhà cung cấp ngoài. Cần kiểm tra camera Android thật và Windows thật trước khi nghiệm thu đầy đủ.
