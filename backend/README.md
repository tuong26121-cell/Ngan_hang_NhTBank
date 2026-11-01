# NhTBank – máy chủ trung gian an toàn (chỉ SePay Test mode)

**29/10/2026 – Giai đoạn thử nghiệm.** Có mã Node.js để chạy tại `backend/sepay-sandbox-server.mjs`; **chưa có máy chủ công khai được xác nhận đang chạy, chưa có cơ sở dữ liệu và chưa nối tài khoản MB thật**. Giao diện Android/Windows ở GitHub Pages không bị thay đổi.

## Sơ đồ ranh giới

```
SePay Test mode (dữ liệu mô phỏng)
   │ HTTPS + token bí mật ở phía server
   ▼
NhTBank Sandbox Gateway (Node.js)
   ├─ GET /healthz (trạng thái không nhạy cảm)
   ├─ GET /api/transactions (chỉ server gọi server, bắt buộc token 32+ ký tự)
   │     └─ lọc bank_account_id Test mode cố định; 20 giao dịch; không trả số dư
   └─ POST /api/webhooks/sepay (xác thực HMAC + timestamp)
         └─ HTTP 503 ngay cả khi chữ ký hợp lệ: CHƯA có lưu trữ bền vững
   × KHÔNG kết nối trình duyệt công khai/MB Live/chuyển tiền thật
```

## Cách chạy và kiểm thử

Yêu cầu Node.js 22+, npm trong thư mục gốc dự án:

```sh
npm ci
npm test
npm run build
node backend/sepay-sandbox-server.mjs
```

Mặc định chỉ lắng nghe trên `127.0.0.1:8787`, không mở Internet. Mở `http://127.0.0.1:8787/healthz` sẽ nhận trạng thái, chưa cần token. Nếu chưa cấu hình, API dữ liệu từ chối truy cập, không lấy giao dịch thật.

**Cấu hình bảo mật bằng biến môi trường của máy chủ**, không commit mã nguồn, không gửi trong chat:
- `NHT_INTERNAL_ACCESS_TOKEN`: chuỗi ngẫu nhiên ít nhất 32 ký tự, dùng **chỉ giữa các máy chủ**. Không sử dụng PIN demo hoặc nhúng token vào HTML, Android, Windows.
- `SEPAY_SANDBOX_TOKEN`: token của **SePay Test mode**, lưu bằng secret store và chỉ tạo trong tài khoản do chủ sở hữu quản lý. Không dùng token Live.
- `NHT_SANDBOX_BANK_ACCOUNT_ID`: UUID tài khoản ngân hàng **mô phỏng** trong Test mode. Máy chủ cố định bộ lọc tài khoản và từ chối kết quả trái phạm vi.
- `SEPAY_WEBHOOK_SECRET` (chưa dùng để nhận dữ liệu): bí mật HMAC 32+ ký tự để xác thực chữ ký.
- `NHT_HOST`, `NHT_PORT`: địa chỉ và cổng chỉ dành cho vận hành; mặc định loopback.

Gọi dữ liệu (chỉ từ dịch vụ nội bộ đáng tin cậy): `GET /api/transactions`, header `Authorization: Bearer <NHT_INTERNAL_ACCESS_TOKEN>`. Máy chủ tự gọi endpoint cố định `https://userapi-sandbox.sepay.vn/v2/transactions`, gửi token Test mode, bắt buộc phản hồi đúng `bank_account_id`, chuyển sang định dạng giao dịch đã kiểm thử và xóa các trường nhạy cảm khỏi phản hồi. Lỗi trả thông báo chung, không lộ token/chi tiết ngân hàng.

## Kiểm thử bảo mật Backend/Webhook

Bộ kiểm thử không cần thư viện bên thứ ba, dùng `node:test` và HTTP server loopback trên cổng ngẫu nhiên:
```sh
npm run test:backend
```

Các bài kiểm thử nằm tại `backend/tests/sepay-sandbox-security.test.mjs`. Chúng dùng token/secret giả chỉ tồn tại trong test, mock SePay sandbox upstream, và không gọi mạng tới SePay. Coverage gồm:
- HMAC trên raw body, chữ ký sai, body bị sửa, timestamp sai/quá hạn/quá tương lai, secret không hợp lệ.
- Internal bearer auth, cấu hình thiếu, route/method không hợp lệ.
- URL upstream cố định, token chỉ gửi ở server-side, giới hạn page size, redirect bị chặn, account scope mismatch, payload lỗi.
- Webhook không ACK khi chưa có durable storage; JSON media type nghiêm ngặt; body vượt 64 KiB bị từ chối.
- Security response headers và giới hạn timeout/header của HTTP server.

Các test này không chứng minh khả năng chống replay xuyên nhiều instance, dedupe webhook bền vững, xử lý đồng thời, rate limiting, xác thực người dùng thật, TLS/proxy hoặc tích hợp với SePay thực. Những phần đó vẫn NOT RUN / chưa triển khai. Chỉ chạy test trên máy local với Node.js 22+; không đặt secrets thật vào test.

## Chưa được phép đưa vào production

1. Chưa tích hợp **đăng nhập người dùng thật**, phiên đăng nhập an toàn, phân quyền và rate limiting; token nội bộ **không phải** cơ chế xác thực cho frontend công khai.
2. Chưa có cơ sở dữ liệu bền vững để lưu giao dịch/webhook, chống trùng xuyên nhiều máy và đối soát định kỳ. Webhook có chữ ký đúng vẫn trả 503 thay vì ACK sai.
3. Chưa có triển khai HTTPS, cấu hình proxy/TLS, lưu giữ/xóa dữ liệu, giám sát, cảnh báo, audit và rà soát bảo mật độc lập.
4. Chưa cấp token Test mode, chưa gọi thử SePay thực tế, chưa kiểm tra E2E Android/Windows với backend.
5. **Không dùng API này để chuyển tiền, hiển thị số dư thật hoặc lấy giao dịch MB Live.** Mọi giao dịch thực cần cơ chế cấp quyền và kiểm soát pháp lý/phương thức tích hợp chính thức.

Nguồn: [SePay API v2](https://developer.sepay.vn/vi/sepay-api/v2/giao-dich/danh-sach),
[Test mode](https://developer.sepay.vn/vi/tien-ich-khac/test-mode),
[HMAC webhook](https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc).
