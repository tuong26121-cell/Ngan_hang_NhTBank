# Huong dan phan cong NhTBank – 14 nhom

> DRAFT / ngay 2026-11-06. 14 GitHub Issues da duoc tao. Khong co cuoc tro chuyen ChatGPT nao tu dong nhan tin nhan hay chay viec do Issue.

## Nguon
- Repo: tuong26121-cell/Ngan_hang_NhTBank.
- Nguồn tài liệu hiện hành: nhánh `main`, thư mục `docs/dieu-phoi/` (nhánh tài liệu cũ chỉ giữ lịch sử).
- Tai lieu: MASTER-STATUS.md v2, ARCHITECTURE.md, DECISIONS.md, HANDOFF-LOG.md, ROADMAP.md.
- Trang thai nhiem vu: PROPOSED. Test, SQL, APK build: NOT RUN neu khong co log.

## Hang doi cong viec
| Nhom | Ten | Uu tien | Issue |
|---|---|---|---|
| 01 | Trung tam dieu phoi | P0 | [#32](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/32) |
| 02 | Kien truc va API | P0 | [#33](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/33) |
| 03 | UI UX Design System | P1 | [#34](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/34) |
| 04 | Website | P1 | [#35](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/35) |
| 05 | Mobile Android | P1 | [#36](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/36) |
| 06 | Danh tinh va bao mat | P0 | [#37](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/37) |
| 07 | Database Supabase | P0 | [#38](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/38) |
| 08 | Backend Transfer | P0 | [#39](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/39) |
| 09 | SePay Webhook | P2 | [#40](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/40) |
| 10 | Nghiep vu tai chinh | P1 | [#41](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/41) |
| 11 | Admin Dashboard | P2 | [#42](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/42) |
| 12 | AI Assistant | P2 | [#43](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/43) |
| 13 | QA Kiem toan | P0 | [#44](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/44) |
| 14 | GitHub DevOps | P1 | [#45](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/45) |

## Cach su dung tren ChatGPT
1. Tao/mở cuoc tro chuyen cua nhom trong Project NhTBank.
2. Ket noi GitHub neu can, cho nhom doc Issue cua minh va MASTER-STATUS v2.
3. Dan cau lenh mau va thay XX bang ma nhom, NN bang so Issue.
4. Nhom phai xac minh nguon va nop phieu HANDOFF; nhom 01 kiem chung truoc khi thay doi trang thai.

### Cau lenh tiep nhan mau
"Tiep quan nhiem vu NHTBANK-XX tai https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/NN. Doc MASTER-STATUS hien hanh tren main; kiem tra phu thuoc, pham vi, bang chung; duoc sua code, tai lieu, GitHub Issues, cap nhat main va chay SQL/CI/build/E2E/deploy trong pham vi nhiem vu khi da kiem tra an toan va moi truong. Giao dich tien that can xac nhan cu the moi giao dich. Xuat ket qua va phieu ban giao cho nhom 01."

## Quyen thuc thi va kiem soat quan trong
- Issue la noi luu danh sach viec, khong phai GitHub assignee la AI hay chuoi chat.
- Chua co chat nao duoc tao hoac tu dong duoc gui tin tu nhung Issue nay.
- Muon chay dinh ky/tu dong can su dung Automation/Dots/workflow da duoc cau hinh rieng; dot nay chua thiet lap.
- Da duoc chu repository cho phep cap nhat truc tiep `main`, sua issues, chay SQL/test/build/Actions/E2E/merge/deploy khi co nhiem vu ro rang va preflight. Xem [quy-che-thuc-thi.md](quy-che-thuc-thi.md).
- Moi HANDOFF can ID, dau vao va version, evidence, blocker, Gate-ID, nhom gui/nhan, trang thai.
- Nhom 07 va 08 trao doi hai vong; nhom 06 va 13 phan bien doc lap.


## Ket qua phan luong doc GitHub (2026-11-06)

- **SAN SANG BAT DAU THIET KE:** 01 (#32), 10 (#41), 02 (#33), 06 (#37), 07 (#38), 08 (#39), 13 (#44), 03 (#34), 14 (#45).
- **CHI CHUAN BI / CHO CONTRACT TICH HOP:** 04 (#35), 05 (#36), 09 (#40), 11 (#42), 12 (#43).
- **Tiep nhan:** CHUA XAC NHAN cho 14/14. Khong co assignee hay phan hoi nhan viec.
- Bang cong viec chi tiet: [bang-giao-viec-20261106.md](bang-giao-viec-20261106.md).
- GitHub Issues khong tu tao agent/chat. Cac nhom/AI co the duoc giao va thuc thi code thong qua cong cu duoc ket noi, theo quy che, nhung can he thong dieu phoi rieng de tu dong nhan viec.

## Trạng thái sẵn sàng đã rà soát – 2026-11-06

- Bảng phân loại READY/WAIT và trạng thái nhận việc thực tế: [bang-giao-viec-20261106.md](bang-giao-viec-20261106.md).
- Đã cập nhật trực tiếp 14 GitHub Issues. Không có nhóm AI nào tự nhận việc chỉ nhờ Issue được chỉnh sửa.


> **Quyền đang áp dụng 2026-11-06:** Tài liệu này tuân thủ [quy chế thực thi](quy-che-thuc-thi.md): được trực tiếp sửa GitHub/`main`, chạy Actions/CI/APK/E2E và deploy theo nhiệm vụ; SQL cần xác minh môi trường và migration; giao dịch tiền thật cần xác nhận riêng từng giao dịch. Phần lịch sử không thay thế bằng chứng thực tế.
