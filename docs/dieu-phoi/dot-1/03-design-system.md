# Nhom 03 — Kiem ke UI tokens va accessibility

> Phân loại: BAN NHAP THIET KE/REVIEW. Tai lieu duoc viet dua tren source GitHub main ngay 2026-11-06. Khong coi la code da tich hop, test da PASS, hay 14 nhom AI da nhan viec. Quyen thuc thi theo ../quy-che-thuc-thi.md.

## Nguon
- `docs/ui-standard.md`: 45 criteria A01–H06; P0 32, P1 12, P2 1 (theo tai lieu).
- `frontend/src/reference-theme.css`: hien co gradient cyan/blue/violet, light-mode; `frontend/src/components/ui.jsx` co shared controls.
- `docs/ui-acceptance.md`: can ghi evidence theo tung code sau khi sua, khong chuyen PASS chi nho CSS.

## Token nhap de thong nhat (khong phai CSS da cap nhat)
| Token | De xuat | Ghi chu |
|---|---|---|
| surface-page | #F5FAFF | light blue neutral |
| surface-card | rgba(255,255,255,.86) | glass + backdrop blur can contrast check |
| brand-primary | #0678C8 | verify contrast text on both light/dark |
| brand-accent | #16C6DF | accent not default text |
| text-primary | #102B45 | readable on light |
| border-soft | #BCD9EC | subdued boundaries |
| focus-ring | 3px visible outline | keyboard and touch accessibility |
| motion-reduce | prefers-reduced-motion | no forced 3D parallax |

## UI gates
- A03 contrast 4.5:1 body, 3:1 large; C01 touch target ≥44x44 CSS px; responsive 320,360,390,430 widths.
- C02 feedback of touch; C05 prevent duplicate transfers; C06 disabled controls inert; focus visible; screen reader announces errors.
- Data/state labels must explicitly say `MO PHONG`, balance PIN demo not represent secured banking.
- Do not introduce image/font assets from external paid provider; reuse approved logo and source assets.

**Phan cong:** audit tokens component states and issue #34; **ket qua:** draft spec, **chua** sua CSS hay chay UI/a11y audit; UX-01 NOT PASS. Ban giao 04/05/11/13.

## Kiểm kê token từ mã hiện tại — 06/11/2026

Chỉ kiểm kê và lập bản nháp mapping, không đổi CSS/runtime trong đợt này. Các màu đề xuất ở bảng trước chưa được chấp thuận thay nhận diện hiện hữu.

| Thành phần | Nguồn đang có | Mapping để Nhóm 03 review |
| --- | --- | --- |
| primary / ink / muted | `styles.css` :root phần acceptance: `--nht-primary:#0c3699`, `--nht-ink:#17233d`, `--nht-muted:#52627c` | Tái sử dụng token đã có; không thêm hệ màu song song |
| surface / wash | `--nht-surface:#fff`, `--nht-blue-wash:#edf3ff` | Phân biệt nền trang và card trước khi hợp nhất |
| theme nền / chữ | `reference-theme.css` :root/body: `#edf6ff` / `#173957` | Override sau styles.css theo thứ tự import main.jsx; cần đo computed style |
| focus | styles.css button/input/select focus-visible; reference-theme.css anchor 3px #1377c9 | Audit màu/độ tương phản mọi nền, chưa chấm đạt nhờ selector |
| vùng chạm | styles.css `.button` min-width/min-height44px; icon-button44px | Kiểm tra kích thước DOM khi responsive trước acceptance |
| motion | MotionConfig reducedMotion=user và media query cả hai CSS | Kiểm thử reduce với component/animation thực tế |

Giữ 45 tiêu chí A01–H06 ở trạng thái nghiệm thu có bằng chứng riêng; việc kiểm kê token không thay `docs/ui-acceptance.md` thành đạt và không tạo thay đổi giao diện cần chạy thiết bị lại.
