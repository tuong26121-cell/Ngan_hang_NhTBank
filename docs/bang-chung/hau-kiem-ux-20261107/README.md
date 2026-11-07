# Hậu kiểm UX-01 — 07/11/2026 (Asia/Saigon)

Nguồn audit `main@e940a9c` (UI vẫn từ 1894c45), kèm patch accessibility của phiên này; commit patch xác định bằng `git log -1 --format=%H -- frontend/src/components/ui.jsx`. Linux, Chromium154 headless, Node24.19.0, Playwright1.61.1, axe-core4.14.0, web-vitals6.2.3. Production build qua preview loopback, không throttle mạng/CPU, reduced-motion=reduce. Đây là đo lab cục bộ, không phải percentile field hay Android/iOS thật.

## CI đúng commit 1894c45

`ci.json`: Pages workflow42304399067, APK42304399051, Verify42304399122 đều completed/success. Đã đọc jobs Pages: build success, deploy skipped. Không suy diễn success workflow thành phát hành website/kiểm thử điện thoại. Lệnh gh ban đầu bị Forbidden; dùng connector GitHub để kiểm chứng thành công.

## Accessibility và lỗi đã sửa

- `audit.json`/`audit-sau.json`: 21 lần quét (login, register, Trang chủ, Giao dịch, QR, Lịch sử, Cá nhân tại320/390/1440). Axe không phát hiện violation tự động; trước sửa có incomplete aria-prohibited-attr ở nhãn generic, sau sửa chỉ còn incomplete color-contrast do glass/gradient.
- Sửa số dư từ span generic sang output có accessible name, aria-live=off để tránh đọc từng frame animation. Hai nhóm tiện ích và bộ lọc được role=group. Không đổi dữ liệu/luồng.
- `tuong-phan-pixel.json`:303 dòng chữ lấy mẫu nền render ở390px, 15 điểm/dòng sau ẩn glyph bằng text-fill transparent. Phát hiện chữ giới thiệu QR≈3,42:1; đã sửa gradient hero thành navy/primary. Lần cuối còn một cờ tại ghi chú camera nằm dưới nút QR nổi trong ảnh full-page, không phải nền card thực. Giữ cờ và review thay vì tự xóa khỏi kết quả. Chữ #b7d7ed trên card #0c1b37; cần đối chiếu tiếp khi nghiệm thu máy thật.
- Sampling không bao quát mọi pixel/viewport, icon, error/loading động, zoom/font scaling hoặc screen reader thật. Không đánh dấu A03/accessibility toàn bộ PASS vì axe có0 violation.
- `keyboard.log`:4/4 đạt — keyboard, focus visible, Enter ẩn/hiện số dư, reduced-motion, dialog trap/restore focus/Escape và hành trình Sandbox.

## Hiệu năng và bộ nhớ

`hieu-nang.json`: đo riêng sau khi audit/Android loop kết thúc, mỗi width có15 interaction, reportAllChanges. LCP là trang navigation ban đầu (splash/auth), không phải phép đo riêng mọi route SPA.

| Width | LCP ms | CLS | INP ms |
| --- | --- | --- | --- |
|320|508|0.053151|80|
|390|376|0.084006|64|
|1440|372|0.019843|104|

Cả ba đáp ứng ngưỡng lab2,5s/0,1/200ms trong lượt này. Chỉ một lượt/viewport, không đại diện p75 người dùng. Giữ `hieu-nang-co-tai-dong-thoi.json`: ở390px từng đo INP424ms khi còn tải đồng thời; không che số liệu này. `audit.json.metrics` rỗng vì thứ tự init script cũ; không dùng làm phép đo, đã khắc phục script bằng khởi tạo thư viện và callback chung.

`audit.json.heap`: Chromium CDP collectGarbage sau10/20/30/40 chu kỳ Trang chủ→Lịch sử: usedSize11392316/11457772/11503004/11555592 bytes; tăng163276bytes≈0,156MiB(1,43%) từ10→40. Backing storage≈1,17MB ổn định; embedder heap giảm. Không thấy tăng lớn trong thử nghiệm ngắn, nhưng không chứng minh không rò rỉ dài hạn. Heap có axe instrumentation và không phải đo RSS toàn trình duyệt.

## Android timeout

`android-lap.log`:5/5 đạt,44,3/47,2/48,4/52,2/47,1s,2 workers, giữ timeout60s/assertions, profile Pixel7 Chromium trên production preview. Timeout trước không tái hiện trong5 lượt; tải đồng thời là khả năng phù hợp với timing, chưa có trace/profiling chứng minh nguyên nhân gốc. Không tăng timeout hoặc bỏ assertions để đạt.

## Xác minh và giới hạn

Unit70/70; build đạt (cảnh báo JS>500kB vẫn còn). Xem `unit.log`, `build.log`, `keyboard.log`, `responsive-qr.log`. Script audit/metrics/pixel đi kèm; tool deps cài ở `/tmp/nht-audit` bằng `npm install --prefix /tmp/nht-audit axe-core@4.14.0 web-vitals@6.2.3`, không đổi package dự án. Các đường dẫn /workspace trong script ghi đúng môi trường chạy bằng chứng; chỉnh đường dẫn nếu chạy ở checkout khác.

UX-01 PARTIALLY VERIFIED trong phạm vi lab. Còn thiết bị thật/Safari/bàn phím ảo/safe-area, review contrast thủ công đầy đủ, screen reader, hiệu năng field và memory soak dài; ACK04/05/11/13 vẫn PENDING. Nhãn SANDBOX/DEMO, QR cục bộ, PIN demo và nghiệp vụ giữ nguyên.

Đối chiếu cờ còn lại: đã cuộn ghi chú camera vào vùng không bị nút QR nổi che (`audit-qr-cuon.json`, `kiem-tra-qr-cuon.mjs`). `tuong-phan-pixel-sau-cuon.json`:303 dòng mẫu,0 cờ; hai dòng ghi chú11,37:1. Chữ giới thiệu QR sau sửa10,18:1. Giữ raw cờ trước cuộn để tái kiểm tra phương pháp. Hồi quy cuối responsive/scanner5/5 đạt; keyboard4/4 đạt; unit70/70. Không biến sampling0 cờ thành nghiệm thu toàn bộ accessibility.
