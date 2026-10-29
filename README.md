# NhTBank 1.1 · Tài chính trong tầm tay

Ứng dụng ngân hàng số **mô phỏng**, dành cho Nguyễn Nhựt Tường. React 18 + TailwindCSS + Framer Motion, bố cục desktop và điện thoại.

> Không kết nối cổng thanh toán, không chuyển hay nhận tiền thật. Không nhập thông tin ngân hàng thật. PIN demo được công khai, không dùng để bảo vệ dữ liệu nhạy cảm.

## Website trực tuyến

Bản website mô phỏng tại **https://nhtbank-web-tuong.vercel.app/**. Kho mã nguồn hiện dùng nhánh mặc định `NhTBank`. Mã PIN demo: `123456`. Dữ liệu mẫu hiện tại: **Nguyễn Nhựt Tường**, tài khoản mô phỏng **0788818374**, số dư khởi tạo **4.056.000 VNĐ**.

Đây là ứng dụng trình diễn giao diện, **không phải tài khoản ngân hàng thực tế**, không nhận/chuyển tiền thật. Nếu cập nhật mã nguồn nhưng website vẫn là bản cũ, cần kiểm tra deployment mới trên Vercel; việc commit lên GitHub không tự xác nhận rằng website đã xuất bản.

GitHub Pages dùng workflow `Deploy NhTBank to GitHub Pages`: cài npm, chạy kiểm thử và build React/Vite vào `dist/`, rồi triển khai từ nhánh `NhTBank`. Bản build lấy đúng đường dẫn con từ cấu hình Pages để JavaScript, CSS và font tải được tại `https://tuong26121-cell.github.io/Ngan_hang_NhTBank/`. Environment `github-pages` cần cho phép nhánh `NhTBank`; bộ lọc nhánh trong workflow và quy tắc environment là hai cấu hình riêng.

## Chạy cục bộ

Yêu cầu Node.js 22.12+ (đã kiểm tra với Node 24) và npm.

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite in trong terminal (`127.0.0.1`, chỉ trên thiết bị đang chạy). Muốn thử từ thiết bị khác trong cùng Wi-Fi, chạy `npm run dev -- --host 0.0.0.0` trong mạng tin cậy; không công khai Vite ra Internet. Nhập PIN **123456** bằng bàn phím hoặc bàn phím số trên màn hình. Số dư ban đầu: **4.056.000 VNĐ**. Tải lại trang để khôi phục dữ liệu mẫu.

```sh
npm test                 # kiểm thử logic và tương tác
npm run build           # bản production trong dist/
npm run preview         # xem bản đã build
npx playwright install chromium
npm run test:e2e        # kiểm thử trình duyệt desktop + mobile
```

Linux tối giản có thể cần thư viện hệ thống Chromium: `npx playwright install-deps chromium` (cần quyền quản trị). E2E tự khởi động Vite trên cổng 4173; QR được tạo và giải mã cục bộ, không phụ thuộc dịch vụ ảnh hoặc thanh toán bên ngoài. Có thể dùng Chromium đã cài với biến `NHT_CHROMIUM_PATH=/usr/bin/chromium`.

## Trải nghiệm

- Đăng nhập PIN, bàn phím phát sáng và màn chờ khối 3D.
- Dashboard: ẩn/hiện số dư, bộ đếm, bốn lối tắt, tám ô tiện ích theo mẫu và giao dịch gần đây.
- Chuyển tiền: thông tin → kiểm tra → xác nhận PIN → biên nhận, confetti và cập nhật lịch sử. Kiểm tra số dư, số tiền và chống xác nhận lặp.
- Nạp tiền: QR demo tạo ngay trên thiết bị, tự cập nhật sau khi ngừng nhập 400 ms. Không gọi dịch vụ ảnh ngoài, không gửi số tiền/nội dung ra mạng. QR chỉ chứa chuỗi `NHTBANK_SANDBOX:` và dữ liệu demo, **không phải VietQR thanh toán**. Nhãn DEMO gắn trong ảnh gốc; không có xác nhận tiền về.
- Lịch sử: lọc Thu/Chi và tìm kiếm. Cá nhân: thông tin chủ tài khoản và đăng xuất. Đăng xuất xóa giao dịch vừa nhập, bộ lọc/tìm kiếm và khôi phục số dư mẫu, kể cả khi đăng nhập lại mà không tải lại trang.
- Tiền gửi, Vay nhanh: màn xem trước, chưa có nghiệp vụ. Không có backend hay cơ sở dữ liệu.

## Giao diện theo mẫu NhTBank 1.1

Đã ghép mẫu Android trong `NhTBank 1.1.zip` vào ứng dụng React hiện có: nền xanh lam–tím, vòng 3D bằng CSS, thẻ tài khoản, nút tròn, tám ô tiện ích, biểu tượng SVG và nút QR nổi giữa thanh điều hướng điện thoại. Phông Be Vietnam Pro tải từ tệp nội bộ, giữ kèm giấy phép OFL. Chế độ giảm chuyển động vẫn được tôn trọng.

- Bản điện thoại: mở `/?view=android` trên máy chủ đang chạy; bố cục một cột ngay cả khi xem trên máy tính.
- Bản máy tính: mở `/?view=windows`; tự co lại khi màn hình hẹp.
- Có liên kết đổi bố cục ở màn đăng nhập và cuối trang. Chuyển bố cục mở lại phiên demo.
- Tám ô tiện ích được đối chiếu với mẫu; Ví của tôi và Mục tiêu dẫn đến các màn có sẵn. Các mục chưa có nghiệp vụ mở hộp thoại ghi rõ **bản xem trước**, không thực hiện dịch vụ.
- Toàn bộ mã mẫu gốc nằm trong [references/nhtbank-v11](references/nhtbank-v11/README.md). Các chức năng của ứng dụng JavaScript mẫu không ghi đè dữ liệu và luồng xử lý React.

Xuất hai tệp HTML độc lập từ đúng bản build React, gồm cả CSS, JavaScript và phông chữ:

```sh
npm run build
node scripts/export-standalone.mjs
```

Kết quả tại `dist/standalone/NhTBank-Android.html` và `dist/standalone/NhTBank-Windows.html`. Tải tệp rồi mở bằng Chromium/Chrome/Edge hiện đại; PIN demo **123456**. QR vẫn được tạo cục bộ. Đây là tệp web, không phải gói cài Android hoặc Windows. Bản bàn giao đã xuất sẵn ở `exports/`.

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

## Cập nhật bảo mật

Xem [ghi chép cập nhật cho issue #2](docs/security-update.md). Các công cụ phát triển được nâng phiên bản; `postcss-selector-parser` được khóa ở 7.1.6 qua npm override để giữ Tailwind 3 và hạn chế thay đổi giao diện. QR cục bộ dùng `qrcode`; `jsqr` chỉ dùng kiểm thử giải mã. PIN công khai vẫn chỉ là thao tác trải nghiệm demo.
