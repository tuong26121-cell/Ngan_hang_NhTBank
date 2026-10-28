# Kiểm chứng hệ thống v2 — 29/10/2026

Nhánh `codex/resilient-transfers-v2-20261029`, nền `cf8cc38`. Thực thi trên Linux, Node 24.19.0, SQLite tích hợp và Chromium hệ thống. Commit của bản này xác định bằng `git log -1 --format=%H -- packages/banking-core frontend/src/lib/transfer-recovery.js backend/tests/system-v2.test.js`; final bàn giao ghi commit tương ứng.

## Kết quả thực chạy

| Kiểm tra                                               | Kết quả                                                                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                             | **37/37 đạt**, gồm 6 ca hồ sơ yêu cầu bền, khóa giữa các tab và chặn retry cũ                                                     |
| `npm run test:platform`                                | **46/46 đạt**, memory + SQLite + HTTP                                                                                             |
| `npm run build`                                        | Đạt, production `dist/`                                                                                                           |
| `NHT_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e` | **20 đạt, 4 bỏ qua**; 4 ca responsive lặp được bỏ qua có chủ đích ở project mobile, vẫn chạy đủ 320/360/390/430 ở project desktop |
| `npm run format:check`, `git diff --check`             | Đạt; format mở rộng cả tài liệu trong `docs/design`                                                                               |
| `python3 docs/design/render-diagrams.py`               | Sinh 9 bộ Mermaid/DOT/SVG/PNG; đã xem ảnh luồng mất mạng                                                                          |
| Kiểm tra bổ sung bản production                        | Focus tiêu đề → Tab đến nút kiểm tra → Enter tra cứu, vùng chạm và responsive đạt trong phạm vi dưới đây                          |
| axe-core 4.14.0 trên `.transfer-recovery`              | Không phát hiện vi phạm ở 390 và 1440 px; không phải chứng nhận WCAG toàn ứng dụng                                                |

CI được cấu hình chạy trên nhánh v2; chưa dùng kết quả CI từ xa làm bằng chứng cho bảng này. Không triển khai website công khai hoặc tạo gói native trong tác vụ.

## Các tình huống đã thử

- **Máy chủ ghi sổ nhưng mất phản hồi:** UI không báo thất bại, giữ mã; tải lại dùng GET tra cứu, mở biên nhận và focus đúng; sổ chỉ có 2 bút toán cho giao dịch, không POST thêm.
- **POST chưa tới máy chủ:** hồ sơ lưu trước gửi; tải lại tìm `not_found`; hết phiên vẫn giữ hồ sơ; đăng nhập lại, nhập PIN rồi gửi đúng key/body cũ. Đích nội bộ nhận 100.000, nguồn giảm 100.000, clearing không đổi.
- **Đã tiếp nhận rồi dừng:** receipt còn `accepted`, chưa có bút toán. UI kiểm tra tự động đúng 3 lần rồi dừng. Worker xử lý receipt, tra cứu lấy `posted` mà không gửi lại. Có ca đóng kết nối SQLite rồi mở lại trước khi tiếp tục.
- **Hai tab trình duyệt thực:** cùng xác nhận một nội dung, Web Locks dùng chung; 1 POST, 1 receipt, 1 giao dịch và cùng mã biên nhận. Unit còn kiểm retry từ tab cũ sau khi kết quả đã đóng không tạo ý định mới.
- **Từ chối và quyền:** cùng mã giữ kết quả từ chối, phiên mới tra cứu được; hết phiên không lấy dữ liệu, operator không lấy kết quả khách hàng qua key. Origin/CSRF, giới hạn PIN/body và giả mạo role vẫn bị chặn.
- **Nguyên tử:** sau debit/trước commit, lỗi SQL/FK hoặc đảo đang ghi dở không giữ lại một nửa số dư/bút toán/kết quả/outbox. Với giao dịch mới, chỉ receipt + audit tiếp nhận đã chốt trước đó được giữ.
- **Bù toàn phần:** operator đề xuất, người khác duyệt; original immutable, ledger thêm 2 bút toán ngược dấu; từ chối tự duyệt, thiếu số dư bên nhận, đảo lặp; retry phê duyệt không thêm sổ. Có kiểm qua UI và HTTP.
- **Thông báo:** retry/dead-letter, crash giữa nhận và ack, hết lease, inbox chống trùng; không đổi kết quả ghi sổ hoặc ghi nợ thêm.
- **Đối soát:** cân tổng nhưng sai amount/đích vẫn bị phát hiện; kết quả/event/receipt không khớp được chặn; kiểm đủ nguồn, đích, dấu và phê duyệt bù.
- **Khôi phục:** backup thật + checksum, file hỏng bị từ chối, DB live không đổi. Bản sao cân bằng nhưng thiếu receipt/kết quả/bút toán sau mốc, accepted tại mốc, sự kiện/inbox thay đổi sau mốc, lịch sử đảo vị trí hoặc nguồn còn sai lệch đều không được gán sẵn sàng mở giao dịch.
- **Migration v1 → v2:** sổ và kết quả cũ giống nguyên bản, receipt được backfill để tra cứu; không xóa dữ liệu.
- **Hồi quy:** 5 tab, đăng nhập, số dư, QR cục bộ, lịch sử, hỗ trợ, logout, vận hành đối soát/cô lập/duyệt/backup giữ hoạt động.

## Giao diện và ảnh bằng chứng

Luồng phục hồi và vận hành kiểm không tràn ngang tại **320, 360, 390, 412, 768, 1366, 1440, 1920 CSS px** (responsive hiện có còn thử 430 px). Nút trong `.transfer-recovery` đo ít nhất 44 × 44 CSS px. Kiểm bổ sung không ghi nhận `pageerror` chưa xử lý; lỗi mạng cố ý được hiển thị trong giao diện.

- [Phục hồi yêu cầu — điện thoại](screenshots/recovery-mobile.png).
- [Phục hồi yêu cầu — máy tính](screenshots/recovery-desktop.png).
- [Thiết kế v2 và các nguồn sơ đồ](design/system-v2.md).

Đây là Chromium mô phỏng viewport. Chưa kiểm Chrome Android/Safari iPhone thật, bàn phím ảo, vùng hệ thống thực, LCP/INP/CLS, profiling bộ nhớ, RPO/RTO hoặc diễn tập mất máy hoàn toàn. Chưa có offline-shell/PWA; cần mạng để tải ứng dụng và khôi phục phiên. Không kết luận đạt toàn bộ P0 của `ui-standard.md`.

Chống lặp qua tải lại áp dụng khi hồ sơ cùng origin/chủ thể còn nguyên và DB không bị khôi phục mất các receipt mới hơn. Không hứa nối lại tự động khi xóa storage, đổi thiết bị/origin hoặc cố tình tạo mã khác. Backup còn cùng máy; chỉ diễn tập cách ly, chưa có endpoint ghi đè/mở DB phục hồi. Toàn bộ là Sandbox, PIN/danh tính công khai, không ngân hàng thật.
