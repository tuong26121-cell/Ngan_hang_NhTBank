# NhTBank ✦ Chạm đến điều tốt đẹp

Ứng dụng ngân hàng số **mô phỏng**, dành cho Nguyễn Nhựt Tường. React 18 + TailwindCSS + Framer Motion, bố cục desktop và điện thoại.

> Không kết nối cổng thanh toán, không chuyển hay nhận tiền thật. Không nhập thông tin ngân hàng thật. PIN demo được công khai, không dùng để bảo vệ dữ liệu nhạy cảm.

## Chạy cục bộ

Yêu cầu Node.js 22.12+ (đã kiểm tra với Node 24) và npm.

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite in trong terminal. Nhập PIN **123456** bằng bàn phím hoặc bàn phím số trên màn hình. Số dư ban đầu: **7.829.890 VNĐ**. Tải lại trang để khôi phục dữ liệu mẫu.

```sh
npm test                 # kiểm thử logic và tương tác
npm run build           # bản production trong dist/
npm run preview         # xem bản đã build
npx playwright install chromium
npm run test:e2e        # kiểm thử trình duyệt desktop + mobile
```

Linux tối giản có thể cần thư viện hệ thống Chromium: `npx playwright install-deps chromium` (cần quyền quản trị). E2E tự khởi động Vite trên cổng 4173 và mô phỏng phản hồi VietQR để kiểm thử không phụ thuộc dịch vụ ngoài.

## Trải nghiệm

- Đăng nhập PIN, bàn phím phát sáng và màn chờ khối 3D.
- Dashboard: ẩn/hiện số dư, bộ đếm từ 0, bốn tiện ích và giao dịch gần đây.
- Chuyển tiền: thông tin → kiểm tra → xác nhận PIN → biên nhận, confetti và cập nhật lịch sử. Kiểm tra số dư, số tiền và chống xác nhận lặp.
- Nạp tiền: tạo ảnh VietQR động từ `img.vietqr.io`, số tiền và nội dung tùy chọn; tài khoản mẫu **0000000000**, nhãn **DEMO**. Cần Internet cho ảnh QR, không cần API key. Không dùng QR để thanh toán thật; không có xác nhận tiền về.
- Lịch sử: lọc Thu/Chi và tìm kiếm. Cá nhân: thông tin chủ tài khoản và đăng xuất.
- Tiền gửi, Vay nhanh: màn xem trước, chưa có nghiệp vụ. Không có backend hay cơ sở dữ liệu.

## Những “phép thuật” giao diện

Sắc xanh hoàng gia **#0C3699** trên nền **#F4F7FC**, bề mặt kính mờ và phản quang nhiều lớp. Thẻ số dư nghiêng theo chuột bằng lò xo Framer Motion; ripple theo vị trí bấm; đồng xu nổi và thẻ chào chuyển động bằng CSS. Các màn xuất hiện nhẹ nhàng; chế độ giảm chuyển động được tôn trọng. Toàn bộ đồ họa trang trí tạo bằng CSS/SVG icon, không cần tải ảnh ngoài.

## Cấu trúc

```text
frontend/         React app
  src/components/ Giao diện và luồng tương tác
  src/lib/        Dữ liệu và logic mô phỏng
  src/test/       Kiểm thử component
backend/          Ranh giới kiến trúc dự phòng (chưa có server)
docs/             Kiến trúc, phạm vi Sandbox
e2e/              Playwright desktop + mobile
AGENTS.md         Quy tắc cho các lần phát triển sau
```

Chi tiết: [Kiến trúc và phạm vi](docs/architecture.md). Dữ liệu phiên chỉ giữ trong bộ nhớ; không lưu vào trình duyệt, không yêu cầu biến môi trường hoặc thông tin bí mật.

## Kiểm tra và ảnh giao diện

[Biên bản kiểm tra](docs/validation.md) · [Dashboard desktop](docs/screenshots/dashboard-desktop.png) · [Dashboard điện thoại](docs/screenshots/dashboard-mobile.png).
