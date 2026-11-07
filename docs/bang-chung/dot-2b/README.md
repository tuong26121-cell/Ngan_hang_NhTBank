# Bằng chứng UX-01 — Đợt 2B

Nguồn main trước sửa: 7192af6. Kiểm thử local Linux, Chromium `/usr/bin/chromium`; Pixel 7 và iPhone 13 là profile giả lập Chromium, không phải Android/iOS thật.

- `truoc-sua.log`: baseline 4/4 responsive trước sửa; `truoc-390.png`.
- `unit.log`: lần chạy cuối được cấp quyền socket/worker, 70/70 đạt. Lần thử ban đầu trong sandbox bị chặn listen của gateway; không dùng làm kết quả cuối.
- `build.log`: production build; cảnh báo bundle JS >500 kB hiện hữu.
- `he-thiet-ke.log`: test contract đạt. Đã sửa phép đo màu hex rút gọn và dùng Tab thật để kiểm tra focus-visible; lỗi ban đầu là lỗi bộ kiểm thử.
- `e2e.log`: bộ hồi quy hiện có, 3 profile desktop/mobile/android; 4 viewport chỉ chạy một lần trên desktop.
- `ui-cuoi.log`: chạy lại 4 viewport và contract sau chỉnh tương phản nhãn phiên bản/header và thẻ tài khoản.
- Ảnh `sau-*.png`: ảnh cuối từ acceptance, full-page; thanh điều hướng cố định nằm ở vị trí viewport lúc chụp.

Không đo LCP/INP/CLS/heap, bàn phím ảo thật, Safari hoặc native APK trong đợt này. UX-01 chưa nghiệm thu toàn bộ. Đối chiếu từng mã tại ../../nghiem-thu-giao-dien.md. Không dùng ảnh/test làm chứng cứ xác nhận tiền thật.

Kết quả cuối: unit 70/70; build đạt; E2E toàn bộ 42 đạt / 1 timeout Android / 8 skipped. Ca Android chạy riêng lại 1/1 đạt trong 33,4 giây, không thay assertions/timeout. UI cuối 5/5 đạt. Giữ nguyên bằng chứng lần lỗi, chưa kết luận nguyên nhân timeout. Mốc chốt báo cáo 07/11/2026 Asia/Saigon.
