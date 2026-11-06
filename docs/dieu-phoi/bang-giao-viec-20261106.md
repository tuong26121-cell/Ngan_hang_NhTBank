# NhTBank - Bang giao viec va trang thai tiep nhan (2026-11-06)

> **Bản điều phối được cập nhật trực tiếp trên nhánh tài liệu**. Cơ chế này KHÔNG tự tạo hoặc kích hoạt cuộc trò chuyện ChatGPT. Không có bằng chứng các nhóm logic 02–14 đã nhận việc. Người dùng đang làm việc cùng Nhóm 01 trong cuộc trò chuyện hiện tại.

## Nguồn xác minh
- Repository: `tuong26121-cell/Ngan_hang_NhTBank`.
- Tài liệu nguồn: `docs/dieu-phoi/MASTER-STATUS.md` v2 ở nhánh `docs/dieu-phoi-14-nhom-20261106`.
- Đã kiểm tra trực tiếp GitHub Issues #32–#45: 14/14 OPEN, không có bình luận xác nhận tiếp nhận tại thời điểm đọc; không có GitHub assignee được xác minh cho 14 nhóm.
- Trong một lần đối chiếu hiện tại, nhánh `codex/nhtbank-sql-hardening-20261031` trả `404`; tuy nhiên hai file `docs/sql-drafts/archive/v2/` trong `main` có SHA giữ nguyên như mốc A3.5.
- Mọi test/build/migration/deploy ở bản phân công này đều `NOT RUN` nếu thiếu log thực thi; việc đánh giá readiness chỉ dựa trên khả năng khởi động **thiết kế**, không phải sẵn sàng tích hợp.

## Kết quả phân tầng
- **9/14 nhóm có thể bắt đầu công việc thiết kế/kiểm kê ngay**, gồm 01, 02, 03, 06, 07, 08, 10, 13, 14.
- **5/14 nhóm chờ contract để tích hợp**, gồm 04, 05, 09, 11, 12. Các nhóm này chỉ được phép thực hiện kiểm kê/khảo sát độc lập trong khi chờ.
- **Tiếp nhận:** Nhóm 01 đang điều phối trong cuộc trò chuyện hiện tại; 13 nhóm logic khác `CHUA XAC NHAN TIEP NHAN` (không được gán trạng thái IN PROGRESS).

## Bảng giao việc
| Nhom | GitHub Issue | Uu tien | Kha nang khoi dong | Phu thuoc | Viec tiep theo | Tiep nhan |
|---|---|---|---|---|---|---|
| 01 | [#32](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/32) | P0 | BAT DAU NGAY | Không | Chuẩn hoá bảng giao việc, evidence index, handoff | DANG DIEU PHOI TRONG CHAT HIEN TAI |
| 02 | [#33](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/33) | P0 | BAT DAU NGAY - NHAP | 01; 10 để chốt | Kiểm kê frontend/backend, tạo architecture v1 và API skeleton, đánh dấu các quy tắc chờ Nhóm 10 | CHUA XAC NHAN |
| 03 | [#34](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/34) | P1 | BAT DAU NGAY - NHAP | 02,10 để chốt | Đọc docs/ui-standard.md; lập token và component accessibility draft | CHUA XAC NHAN |
| 04 | [#35](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/35) | P1 | CHO CONTRACT DE TICH HOP | 02,03,06,08 | Chỉ kiểm kê trang/giao diện hiện có, sitemap và lỗi UX; hoãn tích hợp API | CHUA XAC NHAN |
| 05 | [#36](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/36) | P1 | CHO CONTRACT DE TICH HOP | 02,03,06,08 | Chỉ kiểm kê màn hình/APK workflow, lập screen map; hoãn build tích hợp | CHUA XAC NHAN |
| 06 | [#37](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/37) | P0 | BAT DAU NGAY - NHAP | 02,10 để chốt | Lập threat model và RBAC draft theo mô phỏng; yêu cầu phản biện nhóm 13 | CHUA XAC NHAN |
| 07 | [#38](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/38) | P0 | BAT DAU NGAY - THIET KE | 02,06,08 hai vòng | Tiếp A3.6 với hai file archive/v2 từ main có SHA khớp; nhánh codex cũ không còn; KHÔNG chạy SQL | CHUA XAC NHAN |
| 08 | [#39](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/39) | P0 | BAT DAU NGAY - NHAP | 02,06,07,10 | Viết atomic transfer + idempotency state machine dự thảo; trao đổi schema với 07 | CHUA XAC NHAN |
| 09 | [#40](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/40) | P2 | CHO CONTRACT DE TICH HOP | 06,07,08 | Có thể đọc tài liệu Test Mode; chưa kết nối webhook hoặc thanh toán | CHUA XAC NHAN |
| 10 | [#41](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/41) | P1 | BAT DAU NGAY | 01 | Chốt bản PRD MVP sandbox, rules và acceptance của transfer; bàn giao 02/06/08 | CHUA XAC NHAN |
| 11 | [#42](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/42) | P2 | CHO CONTRACT DE TICH HOP | 03,06,08 | Có thể dựng sitemap nháp; chưa chốt RBAC hoặc API quản trị | CHUA XAC NHAN |
| 12 | [#43](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/43) | P2 | CHO CONTRACT DE TICH HOP | 06,08,10 | Có thể viết intent catalog read-only; hoãn tool execution và data connection | CHUA XAC NHAN |
| 13 | [#44](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/44) | P0 | BAT DAU NGAY - NHAP | 02,06,07,08 bản nháp | Xây test matrix từ yêu cầu, GATE-01..10 và PASS/FAIL/BLOCKED/NOT RUN; chưa chạy test | CHUA XAC NHAN |
| 14 | [#45](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/45) | P1 | BAT DAU NGAY - KIEM KE | 02,05,13 để chốt | Chỉ đọc workflows, trigger và branch; viết CI/CD matrix, không chạy Actions | CHUA XAC NHAN |

## Quy tắc nhận việc và chặn tích hợp
1. `BAT DAU NGAY` = đủ nguồn để thiết kế/kiểm kê; không có nghĩa đã có thực thi, test hoặc hoàn thiện gate.
2. `CHO CONTRACT DE TICH HOP` = không được tích hợp/gọi API/deploy khi các contract phụ thuộc chưa được review. Được phép nghiên cứu hiện trạng, wireframe hay viết checklist.
3. Mọi nhóm mở Issue được giao, đọc phiên bản tài liệu và gửi phiếu `Handoff-ID` về Nhóm 01. Chỉ khi có phản hồi xác nhận và artifact mới chuyển `CHUA XAC NHAN` thành `DA TIEP NHAN`.
4. Nhóm 07 và Nhóm 08 thiết kế song song vòng 1, đối chiếu vòng 2, Nhóm 06 và 13 review độc lập.
5. Nhóm 07 phải dừng trước khi patch hoặc chạy SQL. Nhánh nguồn cũ không tìm thấy, nhưng SHA hai file v2 trên `main` vẫn khớp; chỉ dùng các file này làm tham chiếu được kiểm chứng ở lượt này.
6. Không giao việc AI qua GitHub Issue như thể Issue có khả năng gửi tự động tới các cuộc trò chuyện. Không tự ý gán GitHub assignee của người dùng cho nhóm logic.

## Bằng chứng và GATE
- `COORD-01`, `ARCH-01`, `SEC-01`, `DB-01`, `TX-01`, `UX-01`, `QA-01`, `OPS-01` đều **CHUA NGHIEM THU**.
- SQL tests, concurrency, Android build, E2E, CI và Production deploy: **NOT RUN trong công việc điều phối này**.
- Chỉ đánh dấu `VERIFIED` khi có đầu ra, source SHA/commit, review hoặc log thực sự đáp ứng tiêu chí tương ứng.

## Nguồn SQL v2 đối chiếu (chỉ đọc)
- Core: [archive/v2/20261031_000001](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/blob/main/docs/sql-drafts/archive/v2/20261031_000001_nhtbank_core_schema.draft.sql) — `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`.
- Assertions: [archive/v2/20261031_000002](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/blob/main/docs/sql-drafts/archive/v2/20261031_000002_nhtbank_security_assertions.draft.sql) — `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`.

## Phạm vi quyền
- Chỉ cập nhật tài liệu và GitHub Issues theo yêu cầu mới nhất của người dùng, trên nhánh tài liệu; không thay đổi `main`.
- Không chạy SQL, GitHub Actions, CI, APK build, E2E, merge, deploy hoặc giao dịch ngân hàng thật.
