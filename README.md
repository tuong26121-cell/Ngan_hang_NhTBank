# NhTBank 1.1 · Tài chính trong tầm tay

**NhTBank 1.1** là ứng dụng ngân hàng số **mô phỏng** dành cho Nguyễn Nhựt Tường. Trải nghiệm trên điện thoại và máy tính với tài khoản demo cục bộ, chuyển tiền mô phỏng, QR tạo cục bộ và lịch sử giao dịch. Xây dựng bằng React 18, TailwindCSS và Framer Motion.

> Không kết nối cổng thanh toán, không chuyển hay nhận tiền thật. Không nhập thông tin ngân hàng thật. PIN demo được công khai, không dùng để bảo vệ dữ liệu nhạy cảm.

## Website trực tuyến

| Bố cục             | Mở trực tiếp                                                                           |
| ------------------ | -------------------------------------------------------------------------------------- |
| Điện thoại Android | [Mở bản điện thoại](https://tuong26121-cell.github.io/Ngan_hang_NhTBank/?view=android) |
| Máy tính Windows   | [Mở bản máy tính](https://tuong26121-cell.github.io/Ngan_hang_NhTBank/?view=windows)   |

**Đăng nhập:** chọn Đăng ký tài khoản, tạo tên đăng nhập và mật khẩu từ 10 ký tự. Lưu mã khôi phục hiển thị một lần. Mã PIN `123456` chỉ dùng ở bước xác nhận **chuyển tiền Sandbox**, không dùng đăng nhập. Chủ tài khoản mẫu: **Nguyễn Nhựt Tường** · Số tài khoản mẫu: **0788818374** · Số dư ban đầu: **4.056.000 VNĐ**.

Nhánh phát hành thống nhất: [`main`](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/tree/main) · [Trạng thái build và triển khai](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/workflows/deploy-pages.yml).

Ứng dụng chỉ dùng dữ liệu mẫu và dữ liệu của phiên hiện tại. Đăng xuất hoặc tải lại trang sẽ đặt lại dữ liệu. Chưa có backend, cơ sở dữ liệu hoặc kết nối ngân hàng thật.

GitHub Pages dùng workflow `Deploy NhTBank to GitHub Pages`: cài npm, chạy kiểm thử và build React/Vite vào `dist/`, rồi triển khai từ nhánh `main`. Bản build lấy đúng đường dẫn con từ cấu hình Pages để JavaScript, CSS và font tải được tại `https://tuong26121-cell.github.io/Ngan_hang_NhTBank/`. Environment `github-pages` cần cho phép nhánh `main`; bộ lọc nhánh trong workflow và quy tắc environment là hai cấu hình riêng.

## Chạy cục bộ

Yêu cầu Node.js 22.12+ (đã kiểm tra với Node 24) và npm.

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite in trong terminal (`127.0.0.1`, chỉ trên thiết bị đang chạy). Muốn thử từ thiết bị khác trong cùng Wi-Fi, chạy `npm run dev -- --host 0.0.0.0` trong mạng tin cậy; không công khai Vite ra Internet. Tạo tài khoản demo bằng tên đăng nhập/mật khẩu; không nhập thông tin ngân hàng thật. Số dư ban đầu: **4.056.000 VNĐ**. Tải lại trang để khôi phục dữ liệu mẫu.

```sh
npm test                 # kiểm thử logic và tương tác
npm run build           # bản production trong dist/
npm run preview         # xem bản đã build
npx playwright install chromium
npm run test:e2e        # kiểm thử trình duyệt desktop + mobile
```

Linux tối giản có thể cần thư viện hệ thống Chromium: `npx playwright install-deps chromium` (cần quyền quản trị). E2E tự khởi động Vite trên cổng 4173; QR được tạo và giải mã cục bộ, không phụ thuộc dịch vụ ảnh hoặc thanh toán bên ngoài. Có thể dùng Chromium đã cài với biến `NHT_CHROMIUM_PATH=/usr/bin/chromium`.

## Chức năng và trạng thái

- Màn mở logo NT 0,5 giây; trang đăng nhập cố định theo viewport với tên đăng nhập/mật khẩu, đăng ký, quên mật khẩu bằng mã khôi phục offline, ghi nhớ tên đăng nhập (không lưu mật khẩu), cài đặt đổi mật khẩu. Dữ liệu xác thực demo lưu cục bộ trên thiết bị, không có phiên máy chủ.
- Dashboard: ẩn/hiện số dư, bộ đếm, bốn lối tắt, chín ô tiện ích theo mẫu và giao dịch gần đây.
- Chuyển tiền: thông tin → kiểm tra → xác nhận PIN → biên nhận, confetti và cập nhật lịch sử. Kiểm tra số dư, số tiền và chống xác nhận lặp.
- Nạp tiền: mở bằng nút **Nạp tiền** trên bảng điều khiển hoặc từ màn Quét QR; QR demo tạo ngay trên thiết bị, tự cập nhật sau khi ngừng nhập 400 ms. Không gửi dữ liệu demo ra mạng. QR chỉ chứa chuỗi `NHTBANK_SANDBOX:` và dữ liệu demo, **không phải VietQR thanh toán**. Nhãn DEMO gắn trong ảnh gốc; không có xác nhận tiền về.
- NhTBank QR Studio (tùy chọn, tách biệt Sandbox): tạo ảnh VietQR nhận tiền qua dịch vụ bên thứ ba `vietqr.app/img`. Chỉ gửi dữ liệu tài khoản/ngân hàng/số tiền/nội dung/tên nếu người dùng tự điền, đánh dấu đồng ý và nhấn tạo. QR này có thể được dùng cho **chuyển khoản ngân hàng thật bên ngoài NhTBank**; không kết nối tài khoản, không xác minh chủ tài khoản hoặc thanh toán, không ghi giao dịch hay cập nhật số dư demo. Hỗ trợ mẫu compact/qronly/standee, liên kết tải ảnh và sao chép URL; phải tự đối chiếu thông tin người thụ hưởng trong ứng dụng ngân hàng. Không gửi PIN, OTP hay mật khẩu.
- Quét QR: nút QR nổi giữa thanh điều hướng mở camera sau khi đăng nhập; xin quyền khi người dùng mở trang, đọc VietQR NAPAS trực tiếp ở thiết bị bằng jsQR, hỗ trợ chọn ảnh và dán payload khi không có camera. Kiểm tra CRC chỉ kiểm tra mã, không xác minh chủ tài khoản. Không tự gửi mã đi hoặc thực hiện chuyển tiền. Có nút chọn ngân hàng gửi tiền và mở trang chính thức (không tự mở deep-link giao dịch); vào ứng dụng ngân hàng thật để quét/chuyển/xác nhận.
- Giao diện QR nhận tiền: thẻ biên nhận mang thương hiệu NhTBank với nền gradient, thông tin nhận tiền tách ô, có nút tải ảnh, sao chép và điều hướng ngân hàng; giữ ảnh VietQR nguyên vẹn để quét được.
- Lịch sử: lọc Thu/Chi và tìm kiếm. Cá nhân: thông tin chủ tài khoản và đăng xuất. Đăng xuất xóa giao dịch vừa nhập, bộ lọc/tìm kiếm và khôi phục số dư mẫu, kể cả khi đăng nhập lại mà không tải lại trang.
- Tiền gửi, Vay nhanh: màn xem trước, chưa có nghiệp vụ. Không có backend hay cơ sở dữ liệu.

Các mục Hóa đơn, Thẻ điện tử, Bảo vệ thẻ, Ưu đãi, Thanh toán và Quà tặng hiện mở thông tin **bản xem trước**. Ví của tôi dẫn tới Cá nhân; Mục tiêu dẫn tới phần Tiền gửi đang xem trước. Việc giữ đầy đủ mã mẫu gốc không có nghĩa tất cả chức năng của mẫu đã được tích hợp vào ứng dụng React.


## Nhận diện và xác thực mới (nhánh tính năng 30/10/2026)

- Logo chính là ảnh NT xanh lam–vàng do người dùng cung cấp, không dùng logo chữ V xanh lá từ bộ mockup. Tệp `frontend/public/branding/nt-logo.webp` được tối ưu dung lượng từ ảnh gốc.
- `frontend/public/branding/icons-20.webp` là atlas 5×4 của **20 biểu tượng màu nguyên mẫu**, không chứa logo cũ; `ReferenceIcon` ánh xạ tới nút chức năng đúng ngữ cảnh (trang chủ, quét, chuyển tiền, tài khoản, cài đặt...).
- Mã đăng nhập demo dùng PBKDF2-SHA256 với salt ngẫu nhiên và mã khôi phục riêng có thể xoay vòng; chỉ là **minh họa trên localStorage**. Không có máy chủ xác minh, email/OTP thực, quản lý thiết bị, MFA, giới hạn tần suất toàn hệ thống hoặc session ngân hàng. Dữ liệu demo không bảo vệ tiền thật.
- `Ghi nhớ` chỉ giữ tên đăng nhập, không lưu mật khẩu và không tự đăng nhập lại khi mở ứng dụng. Mỗi lần tải trang cần nhập mật khẩu.
- Tài khoản demo chỉ tồn tại trong dữ liệu trình duyệt hiện tại; xóa dữ liệu trình duyệt có thể xóa tài khoản và mã khôi phục không thể phục hồi nếu không giữ bản sao.
- Kiểm thử phần cứng Android và Windows, màn hình thấp và xem xét toàn bộ 45 mã nghiệm thu vẫn cần thực hiện trước khi kết luận đã sẵn sàng production.

## Trạng thái hợp nhất ba nhánh (30/10/2026)

`main` chứa UI/demo hiện có từ `NhTBank`, bao gồm PR #19; mã gateway SePay Sandbox PR #18 chỉ là nguồn thử nghiệm, không chạy tự động trên GitHub Pages, không kết nối MB thật. Trước khi triển khai cần database chống trùng, HTTPS, xác thực/phân quyền, rate limits, giám sát và nghiệm thu an toàn. Không dùng PIN demo làm xác thực backend.

## Giao diện theo mẫu NhTBank 1.1

Đã ghép mẫu Android trong `NhTBank 1.1.zip` vào ứng dụng React hiện có: nền xanh lam–tím, vòng 3D bằng CSS, thẻ tài khoản, nút tròn, tám ô tiện ích, bộ biểu tượng màu lấy từ ảnh do chủ ứng dụng cung cấp và nút QR nổi giữa thanh điều hướng điện thoại. Phông Be Vietnam Pro tải từ tệp nội bộ, giữ kèm giấy phép OFL. Chế độ giảm chuyển động vẫn được tôn trọng.

- Bản điện thoại: mở `/?view=android` trên máy chủ đang chạy; bố cục một cột ngay cả khi xem trên máy tính.
- Bản máy tính: mở `/?view=windows`; tự co lại khi màn hình hẹp.
- Có liên kết đổi bố cục ở màn đăng nhập và cuối trang. Chuyển Android/Windows bằng URL history, không tải lại và không xóa phiên hiện tại.
- Các ô tiện ích được đối chiếu với mẫu; Ví của tôi và Mục tiêu dẫn đến các màn có sẵn. Các mục chưa có nghiệp vụ mở hộp thoại ghi rõ **bản xem trước**, không thực hiện dịch vụ.
- Toàn bộ mã mẫu gốc nằm trong [references/nhtbank-v11](references/nhtbank-v11/README.md). Các chức năng của ứng dụng JavaScript mẫu không ghi đè dữ liệu và luồng xử lý React.

Xuất hai tệp HTML độc lập từ đúng bản build React, gồm cả CSS, JavaScript và phông chữ:

```sh
npm run build
node scripts/export-standalone.mjs
```

Kết quả tại `dist/standalone/NhTBank-Android.html` và `dist/standalone/NhTBank-Windows.html`. Tải tệp rồi mở bằng Chromium/Chrome/Edge hiện đại; đăng ký tài khoản demo mới trước khi đăng nhập. PIN **123456** chỉ để xác nhận chuyển tiền mô phỏng. QR vẫn được tạo cục bộ. Đây là tệp web, không phải gói cài Android hoặc Windows. Bản bàn giao đã xuất sẵn ở `exports/`.

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

[Đối chiếu 45 tiêu chí giao diện](docs/ui-acceptance.md) · [Biên bản kiểm tra](docs/validation.md) · [Giao diện điện thoại 1.1](docs/screenshots/v11-android.png) · [Giao diện máy tính 1.1](docs/screenshots/v11-windows.png).

Các kết quả Chromium và viewport mô phỏng được ghi trong biên bản; chưa thay thế việc thử trên thiết bị Android/iOS thật.

## Cập nhật bảo mật

Xem [ghi chép cập nhật cho issue #2](docs/security-update.md). Các công cụ phát triển được nâng phiên bản; `postcss-selector-parser` được khóa ở 7.1.6 qua npm override để giữ Tailwind 3 và hạn chế thay đổi giao diện. QR cục bộ dùng `qrcode`; `jsqr` chỉ dùng kiểm thử giải mã. PIN công khai vẫn chỉ là thao tác trải nghiệm demo.
