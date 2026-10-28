# Kiểm chứng nền tảng giao dịch

Ngày 29/10/2026, nền `main` **db6b58e**, nhánh `codex/transaction-platform-20261029`. Node 24.19.0, Linux, SQLite tích hợp Node, Chromium hệ thống. Commit bàn giao xác định bằng `git log -1 --format=%H -- packages/banking-core backend frontend/src/components/PlatformWorkspace.jsx`.

## Phạm vi đã kiểm tra

- Hai repository cùng hợp đồng: bộ nhớ và SQLite.
- Ghi sổ cân bằng, mã lệnh chống trùng/xung đột và kết quả từ chối được giữ nguyên.
- Rollback tại điểm sau ghi nợ/trước commit; lỗi foreign key sau câu SQL cập nhật tài khoản thực tế không làm giữ nợ một nửa.
- Bốn tiến trình SQLite cùng dùng một key chỉ có một kết quả và một lần trừ tiền.
- Phiên/quyền chủ tài khoản, tiền nguyên, số dư, hạn mức đơn/ngày UTC+7.
- Worker retry/dead-letter, chết sau giao nhưng trước ack, khôi phục lease và hộp nhận một ID; worker HTTP tự động sau posting.
- Đối soát tính lại, chặn số dư lệch trước ghi nợ, cô lập, người duyệt khác người lập, từ chối và bằng chứng thay đổi; sổ gốc giữ nguyên.
- Khởi động lại DB giữ kết quả idempotency; backup thật, khôi phục bản cách ly, từ chối file hỏng và không đổi sổ đang chạy.
- HTTP Origin/CSRF/quyền, tám request cùng key, PIN sai bị giới hạn, JSON lỗi và body lớn bị từ chối.
- Trình duyệt mất phản hồi sau khi server đã chốt: chưa báo thành công; gửi lại cùng form/key lấy đúng kết quả và không trừ tiền lần nữa. Tải lại giữ sổ và khôi phục phiên còn hạn.
- Luồng vận hành qua UI: đổi vai trò, tạo lỗi có nhãn, đối soát, đề xuất, vai trò khác duyệt, sao lưu/diễn tập. Bảng rộng có vùng cuộn ngang riêng.

## Kết quả lệnh

| Lệnh / kiểm tra                                        | Kết quả                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `npm test`                                             | 31/31 unit/component đạt                                                    |
| `npm run test:platform`                                | 25/25 lõi, SQLite và HTTP đạt                                               |
| `npm run build`                                        | Đạt, bản production trong dist                                              |
| `NHT_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e` | 14 đạt; 4 ca viewport trùng project mobile được bỏ qua theo cấu hình có sẵn |
| Axe-core 4.14.0, màn vận hành 390/1440                 | Không phát hiện vi phạm tự động trong phạm vi đã chọn                       |
| Đo DOM nút/summary vận hành                            | Đạt ít nhất 44×44 CSS px trên tám chiều rộng                                |
| Tab/Escape/modal title/khôi phục focus                 | Đạt trên Chromium                                                           |

Kiểm tra bảng responsive chờ layout ổn định sau đổi kích thước; bảng bút toán rộng dùng vùng cuộn riêng. Ảnh render thật của bản production được lưu ở `docs/screenshots/platform-mobile.png` và `platform-desktop.png`. Lượt rà trực quan phát hiện thiếu padding panel desktop; đã chỉnh padding 24px/20px và kiểm tra lại. Không coi các kết quả này là bằng chứng đã triển khai website, đã chạy CI từ xa hay đã thử native.

## Giới hạn

Không chạy APK/iOS mới hoặc thử thiết bị/bàn phím phần cứng, VoiceOver/TalkBack/NVDA. Chưa đo LCP/INP/CLS, heap/RPO/RTO hoặc rà tương phản toàn bộ trạng thái mới. Không phải kiểm thử ngân hàng, xác thực thật, chuyển tiền thật hoặc đối soát với sao kê ngoài. Không có chứng nhận WCAG/tuân thủ hoặc website công khai mới trong tác vụ này.
