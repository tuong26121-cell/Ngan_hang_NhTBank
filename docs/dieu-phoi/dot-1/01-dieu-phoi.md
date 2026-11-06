# Nhom 01 — Phieu dieu phoi dot 1

> Phân loại: BAN NHAP THIET KE/REVIEW. Tai lieu duoc viet dua tren source GitHub main ngay 2026-11-06. Khong coi la code da tich hop, test da PASS, hay 14 nhom AI da nhan viec. Quyen thuc thi theo ../quy-che-thuc-thi.md.

## Thu tu va pham vi
1. 01 (#32) → 10 (#41) → 02 (#33) → 06 (#37) → 07 (#38) ↔ 08 (#39) → 13 (#44).
2. 03 (#34), 14 (#45) nghien cuu song song va co the thuc hien phan doc lap.
3. 04 (#35), 05 (#36), 09 (#40), 11 (#42), 12 (#43) chi nghien cuu/kiem ke so bo cho den khi co contract.

## Nguon va bang chung
- Repo: `tuong26121-cell/Ngan_hang_NhTBank`; main HEAD tai luc kiem tra: `ce3fb3e101742f77205d9258708661d1e3658486` (khong su dung SHA nay lam cam ket HEAD mai mai).
- 14 GitHub Issues #32–45 la hang doi cong viec; khong la agent duoc khoi dong.
- Hai file SQL v2 trong `docs/sql-drafts/archive/v2/` co SHA core `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`, assertions `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`.

## Ket qua dieu phoi dot nay
- Tao 9 tai lieu nhom tu nguyen tac va source; trang thai hien vat: `DRAFT PREPARED`; gate chuyen nghiep: `AWAITING CROSS-REVIEW`.
- Phieu nhan viec: 01 dang dieu phoi trong chat hien tai; 02–14 chua co acknowledgement tu agent/chat hay GitHub assignee.
- Bang phu thuoc hai vong: 07 giao schema cho 08; 08 giao idempotency state machine cho 07; 06 review AuthZ; 13 review tests.

## Nguy co va yeu cau ban giao
- `handoff` chi hoan tat khi co artifact URL, role nhan, commit/hash, ket qua review, va blockers.
- GATE `COORD-01, ARCH-01, SEC-01, DB-01, TX-01, QA-01, UX-01, OPS-01` chua PASS boi viec tao tai lieu.
- Sau dot 1 doi chieu cac phu thuoc, tao backlog va dieu kien dot 2 trong `../de-xuat-dot-2.md`.
