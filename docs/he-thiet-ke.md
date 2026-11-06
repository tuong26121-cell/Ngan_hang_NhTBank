# Hệ thiết kế NhTBank — Đợt 2B

Ngày 06/11/2026 · Nhóm 03 · Issue #34 · nhận 04/05/11/13.
Nguồn trước sửa: main `7192af6`; đọc ui-standard, ui-acceptance, Đợt 1 nhóm 03/02/10 và quy chế thực thi. PRD/API còn là bản nháp; đặc tả này chốt trình bày cho ứng dụng mô phỏng hiện có, không chốt flow tích hợp backend.

## Quyết định triển khai

Giữ React, Lucide/SVG và hình 3D hiện hữu; thêm nguồn token cuối cascade `frontend/src/he-thiet-ke.css`, nhập sau reference-theme. Không thay luồng, dữ liệu hay thêm dependency. Cách này giới hạn hồi quy so với viết lại toàn bộ stylesheet; CSS cũ vẫn giữ các quy tắc bố cục và minh họa chuyên biệt. Những màu trong minh họa không phải token chữ tương tác. Cyan dùng trang trí; chữ trắng đặt trên navy/primary. Glass trắng 94% và nền đặc dự phòng; không đặt nội dung phụ thuộc vào blur.

## Tokens dùng chung

| Nhóm        | Token `--nht-`                             | Giá trị                                        |
| ----------- | ------------------------------------------ | ---------------------------------------------- |
| Thương hiệu | primary / navy / cyan                      | #0c3699 / #102b45 / #16c6df                    |
| Chữ         | ink / muted                                | #17233d / #52627c                              |
| Nền         | page / surface / glass / blue-wash         | #f5faff / #fff / trắng 94% / #edf3ff           |
| Ngữ nghĩa   | success / error / error-wash               | #08725b / #a42332 / #fff1f4                    |
| Viền, focus | border / focus                             | #8ba4bd / #075ba7                              |
| Khoảng cách | space-1/2/3/4/6/8                          | 4/8/12/16/24/32 px                             |
| Bo góc      | radius-control / radius-card / radius-pill | 12/24/999 px                                   |
| Typography  | font / text-small / text-body / text-input | Be Vietnam Pro nội bộ, system-ui / 12/14/16 px |
| Chuyển động | duration                                   | 160 ms; reduce tắt animation/transition        |
| Chiều sâu   | shadow-card / shadow-raised                | bóng navy mờ, highlight trắng / bóng primary   |

Không tải phông hay icon từ dịch vụ ngoài. Icon thao tác dùng Lucide/SVG hiện có, 20–24 px; vùng chạm độc lập tối thiểu 44 px. Hình trang trí không mang thông tin trạng thái duy nhất.

## Đặc tả component

| Component             | Mặc định / hover / active                                 | Disabled / loading / error / selected                                                                                                               |
| --------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary, auth-primary | nền primary chữ trắng; hover navy; active dịch 1 px       | disabled nền xám/chữ muted, không bóng; dùng native disabled để chặn thao tác; loading có nhãn đang xử lý, aria-busy và disabled do bên gọi quản lý |
| Secondary, chip       | trắng, viền border, chữ primary; phản hồi hover hiện có   | disabled như trên; lựa chọn cần aria-pressed khi là toggle                                                                                          |
| Icon button           | icon hiện có, vùng 44×44 trở lên, accessible name         | giữ aria-label động ẩn/hiện số dư; keyboard Enter/Space native                                                                                      |
| Input, select         | chữ 16 px, cao ≥44, viền border, focus 3 px               | aria-invalid + mô tả lỗi nối aria-describedby khi thêm trường; không dùng màu làm dấu lỗi duy nhất                                                  |
| Error / notice        | lỗi có chữ, nền error-wash, viền trái; notice màu success | dùng role=alert/status của flow hiện có; không tự thêm trạng thái server chưa có                                                                    |
| Card / dialog         | glass, viền rõ, bo 24, bóng nhẹ                           | dialog native giữ focus, Escape và phục hồi focus hiện có; empty state giữ lời giải thích                                                           |
| Navigation            | giữ 5 mục và safe-area hiện có                            | selected có nền, viền và aria-current=page; không chỉ đổi màu icon                                                                                  |
| Sandbox / QR          | giữ nguyên nhãn và cảnh báo mô phỏng                      | không dùng nhãn DEMO để xác nhận giao dịch thật                                                                                                     |

Focus dùng outline xanh đậm 3 px và nền đệm trắng để thấy trên nền navy. Reduced-motion tắt CSS animation/transition; MotionConfig và useReducedMotion hiện có quản lý Framer Motion. Form đăng nhập có thể cuộn khi chiều cao thấp thay vì cắt nút/thu nhỏ input.

## Bàn giao và tích hợp

- Nhóm 04: dùng các lớp button/primary/secondary/panel và token; giữ label, lỗi, input 16 px. Chỉ nối API khi contract được chốt.
- Nhóm 05: dùng cùng CSS trong WebView, giữ safe-area; kiểm tra thật Android/browser, xoay màn hình và bàn phím ảo.
- Nhóm 11: dùng tokens/state cho màn hình mới; loading/error/empty cần accessible name và trạng thái bằng chữ; không suy diễn backend đã có.
- Nhóm 13: chạy bộ E2E hiện có và `he-thiet-ke.spec.js`; nghiệm thu đủ 45 mã tại ui-acceptance. Đo thiết bị thật và hiệu năng trước đóng UX-01.

Phiếu `NB-D2B-03`: ARTIFACT AVAILABLE, ACK PENDING. Không coi ghi tài liệu là nhóm nhận đã xác nhận. UX-01 chưa nghiệm thu toàn bộ nếu còn P0 thiết bị/chỉ số chưa xác minh. Xem `docs/bang-chung/dot-2b/` và ui-acceptance.

Rollback: revert commit Đợt 2B; không có thay đổi DB, dependency hay nghiệp vụ.
