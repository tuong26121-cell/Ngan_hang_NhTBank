# NhTBank — ứng dụng và lõi giao dịch Sandbox

Ứng dụng mô phỏng bằng React 18 + Vite, có giao diện điện thoại/máy tính và nền tảng giao dịch theo luồng **phiên/quyền → chống gửi lặp → kiểm tra → ghi sổ nguyên tử → thông báo → đối soát → xử lý có phê duyệt → sao lưu/diễn tập**.

**Không giao dịch tiền thật.** PIN 123456 và ba danh tính đều công khai để thử nghiệm. Không nhập dữ liệu ngân hàng thật. QR giữ payload `NHTBANK_SANDBOX:`, không phải VietQR thanh toán và không xác nhận tiền về.

**Mới trong v2:** chống gửi lặp qua tải lại ở chế độ server, tra cứu mã yêu cầu cũ, chuyển nội bộ nguyên tử, bút toán bù có người duyệt riêng và kiểm tra yêu cầu quanh mốc sao lưu. Xem [thiết kế hệ thống v2 và 9 sơ đồ chỉnh sửa được](docs/design/system-v2.md).

## Mở và chạy

Node.js **24+**; dùng `.nvmrc` hoặc devcontainer đã chỉ định Node 24.

```sh
npm ci
npm run dev
```

Mặc định là **bộ nhớ trình duyệt**, không cần backend. Mở địa chỉ Vite in trong terminal, PIN **123456**. Số dư đầu kỳ mẫu **4.056.000 VNĐ**. Tải lại hoặc đăng xuất đặt lại dữ liệu.

Để dùng sổ bền vững trên máy chủ cục bộ:

```sh
npm run build
npm run platform:serve
```

Mở `http://127.0.0.1:3001/?runtime=server`. Server phục vụ web production và API cùng nguồn, bind loopback. Vào **Cá nhân → Không gian vận hành**. SQLite giữ sổ khi tải lại, đăng xuất và khởi động lại server; phiên đăng nhập cần tạo lại khi server khởi động lại.

Có thể mở trực tiếp không gian vận hành bằng `?workspace=operations` hoặc `?runtime=server&workspace=operations`. Đây là cùng ứng dụng responsive; không phải hai gói cài Android/Windows. Bản xem trước native hiện có vẫn được giữ trong repo, chưa build lại trong tác vụ này.

## Các phần hoạt động

- Luồng khách hàng hiện có: PIN, tổng quan/ẩn số dư, chuyển tiền, QR cục bộ, lịch sử/tìm/lọc, hồ sơ, trợ giúp, đăng xuất; năm tab giữ nguyên.
- Chuyển tiền đi qua lõi dùng chung, không tự trừ tiền trong React. Receipt tiếp nhận lưu trước; hai bút toán, giao dịch, kết quả idempotency, audit và outbox chốt trong một transaction. Gửi lại cùng mã/nội dung trả kết quả cũ.
- Kiểm tra quyền chủ tài khoản, tiền nguyên VNĐ, số dư và hạn mức mẫu **2 triệu/lần, 3 triệu/ngày UTC+7**. Người nhận chỉ được kiểm tra định dạng Sandbox, chưa xác minh ngân hàng.
- Thông báo sau commit: lease/token, retry/backoff, hàng đợi lỗi và hộp nhận theo ID. Backend có worker mỗi giây; chế độ bộ nhớ có nút diễn tập xử lý hàng đợi. Không gửi SMS/email/push thật.
- Đối soát thuật toán riêng từ bút toán gốc, lưu kết quả, cô lập sai lệch. Tài khoản lệch cũng bị chặn ngay trước ghi nợ.
- Xử lý sự cố: vận hành lập đề xuất, tài khoản phê duyệt khác kiểm tra bằng chứng; chỉ xây lại bộ đệm và đối soát lại, không sửa sổ gốc hoặc tự bù tiền.
- SQLite online backup, checksum, integrity/foreign-key check và khôi phục thử sang bản cách ly. Bản bộ nhớ chỉ chụp JSON tạm trong phiên, có nhãn rõ.

Bốn mục lịch sử cũ vẫn là dữ liệu giao diện minh họa ngoài số dư mở đầu, không được ghi vào sổ mới lần nữa. Tiền gửi và Vay nhanh vẫn là màn xem trước, chưa có nghiệp vụ.

## Vai trò thử nghiệm

Trong Không gian vận hành chọn **Đổi vai trò thử nghiệm**: Khách hàng, Nhân viên vận hành hoặc Người phê duyệt. PIN cho cả ba là **123456**. Đổi vai trò giữ dữ liệu để diễn tập; không coi đây là xác thực/phân quyền đủ cho tiền thật.

Lab tạo lệch bộ đệm chỉ có trong bản bộ nhớ; server mặc định tắt. Xem runbook để bật trên DB thử riêng. Không có nút sửa bút toán gốc hoặc endpoint ghi đè DB đang chạy.

## Kiểm thử và tài liệu

```sh
npm test
npm run test:platform
npm run build
npx playwright install chromium
npm run test:e2e
npm run format:check
```

E2E cần build trước vì một số ca chạy cả backend và web production. Có thể dùng Chromium hệ thống bằng `NHT_CHROMIUM_PATH`. Kiểm tra viewport không phải thử điện thoại/Safari thật.

- [Kiến trúc A–M](docs/architecture.md) và [bản đồ không gian mã](docs/workspace-map.md).
- [Hợp đồng giao dịch](docs/transaction-contract.md), [API cục bộ](docs/platform-api.md), [vận hành/khôi phục](docs/operations-runbook.md).
- [Giới hạn an toàn](docs/sandbox-security.md), [kết quả nền tảng](docs/platform-validation.md), [nghiệm thu UI](docs/ui-acceptance.md).
- [Bản xem trước di động hiện có](docs/mobile-preview.md), [lịch sử cập nhật bảo mật](docs/security-update.md).

Không thêm phụ thuộc runtime cho backend: dùng thư viện chuẩn Node. DB, WAL, backup và phiên không vào Git. Không có dịch vụ ngân hàng, webhook nhận tiền thật, HA, sao lưu ngoài máy hoặc chứng nhận tuân thủ. GitHub Pages chỉ chạy bản bộ nhớ; backend Node/SQLite cần môi trường máy chủ riêng. Không thay đổi quy tắc bảo vệ môi trường xuất bản.
