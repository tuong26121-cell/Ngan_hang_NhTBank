# NhTBank - Bang giao viec va trang thai tiep nhan (2026-11-06)

> **Bản điều phối hiện lưu trên `main`; được phép tiếp tục cập nhật trực tiếp trên GitHub theo [quy chế](quy-che-thuc-thi.md).** Cơ chế này KHÔNG tự tạo hoặc kích hoạt cuộc trò chuyện ChatGPT. Không có bằng chứng các nhóm logic 02–14 đã nhận việc. Người dùng đang làm việc cùng Nhóm 01 trong cuộc trò chuyện hiện tại.

## Nguồn xác minh
- Repository: `tuong26121-cell/Ngan_hang_NhTBank`.
- Tài liệu nguồn: `docs/dieu-phoi/MASTER-STATUS.md` trên `main` (tài liệu nhánh cũ chỉ là lịch sử).
- Đã kiểm tra trực tiếp GitHub Issues #32–#45: 14/14 OPEN, không có bình luận xác nhận tiếp nhận tại thời điểm đọc; không có GitHub assignee được xác minh cho 14 nhóm.
- Trong một lần đối chiếu hiện tại, nhánh `codex/nhtbank-sql-hardening-20261031` trả `404`; tuy nhiên hai file `docs/sql-drafts/archive/v2/` trong `main` có SHA giữ nguyên như mốc A3.5.
- Mọi test/build/migration/deploy ở bản phân công này đều `NOT RUN` nếu thiếu log thực thi; việc đánh giá readiness chỉ dựa trên khả năng khởi động **thiết kế**, không phải sẵn sàng tích hợp.

## Kết quả phân tầng
- **9/14 nhóm có thể bắt đầu công việc thiết kế/kiểm kê ngay**, gồm 01, 02, 03, 06, 07, 08, 10, 13, 14.
- **5/14 nhóm chờ contract để tích hợp**, gồm 04, 05, 09, 11, 12. Các nhóm có thể sửa phần độc lập, thử nghiệm local và cập nhật `main`; chưa được coi là tích hợp đạt cho đến khi contract phụ thuộc được nghiệm thu.
- **Tiếp nhận:** Nhóm 01 đang điều phối trong cuộc trò chuyện hiện tại; 13 nhóm logic khác `CHUA XAC NHAN TIEP NHAN` (không được gán trạng thái IN PROGRESS).

## Bảng giao việc
| Nhom | GitHub Issue | Uu tien | Kha nang khoi dong | Phu thuoc | Viec tiep theo | Tiep nhan |
|---|---|---|---|---|---|---|
| 01 | [#32](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/32) | P0 | BAT DAU NGAY | Không | Chuẩn hoá bảng giao việc, evidence index, handoff | DANG DIEU PHOI TRONG CHAT HIEN TAI |
| 02 | [#33](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/33) | P0 | BAT DAU NGAY - NHAP | 01; 10 để chốt | Kiểm kê frontend/backend, tạo architecture v1 và API skeleton, đánh dấu các quy tắc chờ Nhóm 10 | CHUA XAC NHAN |
| 03 | [#34](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/34) | P1 | BAT DAU NGAY - NHAP | 02,10 để chốt | Đọc docs/ui-standard.md; lập token và component accessibility draft | CHUA XAC NHAN |
| 04 | [#35](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/35) | P1 | CHO CONTRACT DE TICH HOP | 02,03,06,08 | Kiểm kê và sửa UI hiện có, sitemap, lỗi UX trực tiếp `main`; API chưa chốt thì mock hợp đồng | CHUA XAC NHAN |
| 05 | [#36](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/36) | P1 | CHO CONTRACT DE TICH HOP | 02,03,06,08 | Kiểm kê/sửa màn hình và APK workflow, được chạy build phù hợp; chưa chốt API thì dùng mock | CHUA XAC NHAN |
| 06 | [#37](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/37) | P0 | BAT DAU NGAY - NHAP | 02,10 để chốt | Lập threat model và RBAC draft theo mô phỏng; yêu cầu phản biện nhóm 13 | CHUA XAC NHAN |
| 07 | [#38](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/38) | P0 | BAT DAU NGAY - THIET KE | 02,06,08 hai vòng | Tiếp A3.6 từ archive/v2 trên main; được sửa migration và chạy SQL trên target local đã được xác minh sau review, không tự áp draft chưa đạt GATE | CHUA XAC NHAN |
| 08 | [#39](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/39) | P0 | BAT DAU NGAY - NHAP | 02,06,07,10 | Viết atomic transfer + idempotency state machine dự thảo; trao đổi schema với 07 | CHUA XAC NHAN |
| 09 | [#40](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/40) | P2 | CHO CONTRACT DE TICH HOP | 06,07,08 | Có thể đọc tài liệu Test Mode; chưa kết nối webhook hoặc thanh toán | CHUA XAC NHAN |
| 10 | [#41](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/41) | P1 | BAT DAU NGAY | 01 | Chốt bản PRD MVP sandbox, rules và acceptance của transfer; bàn giao 02/06/08 | CHUA XAC NHAN |
| 11 | [#42](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/42) | P2 | CHO CONTRACT DE TICH HOP | 03,06,08 | Có thể dựng sitemap nháp; chưa chốt RBAC hoặc API quản trị | CHUA XAC NHAN |
| 12 | [#43](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/43) | P2 | CHO CONTRACT DE TICH HOP | 06,08,10 | Có thể viết intent catalog read-only; hoãn tool execution và data connection | CHUA XAC NHAN |
| 13 | [#44](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/44) | P0 | BAT DAU NGAY - NHAP | 02,06,07,08 bản nháp | Xây test matrix từ yêu cầu, GATE-01..10 và PASS/FAIL/BLOCKED/NOT RUN; chưa chạy test | CHUA XAC NHAN |
| 14 | [#45](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/45) | P1 | BAT DAU NGAY - KIEM KE | 02,05,13 để chốt | Kiểm tra và trực tiếp sửa workflows trên main, chạy Actions/CI liên quan sau khi xác minh trigger và tác động | CHUA XAC NHAN |

## Quy tắc nhận việc và chặn tích hợp
1. `BAT DAU NGAY` = đủ nguồn để thiết kế/kiểm kê; không có nghĩa đã có thực thi, test hoặc hoàn thiện gate.
2. `CHO CONTRACT DE TICH HOP` = contract phụ thuộc chưa đủ điều kiện nghiệm thu tích hợp. Nhóm vẫn được sửa mã, UI, test, CI và cập nhật `main` phần độc lập theo quy chế; tích hợp thực cần xác minh API, phân quyền và môi trường.
3. Mọi nhóm mở Issue được giao, đọc phiên bản tài liệu và gửi phiếu `Handoff-ID` về Nhóm 01. Chỉ khi có phản hồi xác nhận và artifact mới chuyển `CHUA XAC NHAN` thành `DA TIEP NHAN`.
4. Nhóm 07 và Nhóm 08 thiết kế song song vòng 1, đối chiếu vòng 2, Nhóm 06 và 13 review độc lập.
5. Nhóm 07 được sửa code/SQL và thực thi migration theo nhiệm vụ sau khi xác minh target, bản SQL, backup và preflight; nhánh nguồn cũ không tìm thấy, hai file v2 trong `main` có SHA lịch sử khớp nhưng vẫn là draft cần review.
6. Không giao việc AI qua GitHub Issue như thể Issue có khả năng gửi tự động tới các cuộc trò chuyện. Không tự ý gán GitHub assignee của người dùng cho nhóm logic.

## Bằng chứng và GATE
- `COORD-01`, `ARCH-01`, `SEC-01`, `DB-01`, `TX-01`, `UX-01`, `QA-01`, `OPS-01` đều **CHUA NGHIEM THU**.
- SQL tests, concurrency, Android build, E2E, CI và Production deploy: **NOT RUN trong công việc điều phối này**.
- Chỉ đánh dấu `VERIFIED` khi có đầu ra, source SHA/commit, review hoặc log thực sự đáp ứng tiêu chí tương ứng.

## Nguồn SQL v2 đối chiếu (chỉ đọc)
- Core: [archive/v2/20261031_000001](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/blob/main/docs/sql-drafts/archive/v2/20261031_000001_nhtbank_core_schema.draft.sql) — `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`.
- Assertions: [archive/v2/20261031_000002](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/blob/main/docs/sql-drafts/archive/v2/20261031_000002_nhtbank_security_assertions.draft.sql) — `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`.

## Phạm vi quyền hiện hành
- Chủ repository đã cho phép trực tiếp chỉnh sửa `main`, GitHub Issues, mã nguồn và tài liệu; chạy SQL, GitHub Actions, CI, APK build, E2E, merge và deploy khi có nhiệm vụ, môi trường và preflight phù hợp. Không cần xin lại quyền GitHub cho mỗi thao tác.
- Giao dịch tiền thật đòi hỏi tích hợp hợp lệ, thông tin giao dịch cụ thể và xác nhận cho giao dịch đó; giới hạn chi phí và bảo mật vẫn áp dụng. Xem [quy chế thực thi](quy-che-thuc-thi.md).


## Thu tu dieu phoi hanh dong (de xuat)

**Dot 1 – Bat dau nghien cuu/thiet ke ngay:** 01 (#32) → 10 (#41) → 02 (#33) → 06 (#37) → 07 (#38) ↔ 08 (#39) → 13 (#44). Co the thiet ke ban nhap song song, khong doi toan bo gate PASS.

**Song song – triển khai phần độc lập:** 03 (#34), 14 (#45), UI tokens, workflow/CI inventory và sửa đổi phù hợp; được kích hoạt CI/test khi có nhiệm vụ và preflight.

**Cho contract – Chi nghien cuu so bo:** 04 (#35), 05 (#36), 09 (#40), 11 (#42), 12 (#43).

**Tiep nhan:** 14/14 Issues #32–#45 khong GitHub assignee, khong comment tiep nhan tai thoi diem doi chieu. Khong nham kha nang bat dau voi da nhan viec.

**Nguon SQL v2:** main HEAD tai luc doi chieu fb5a2f231c0d1ec210a7b2368cc41268695a0508. File core archive/v2 SHA 48ed0ab6adec0ffa3091e081924d051e2a6a2bda; assertions archive/v2 SHA ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379. Khong tu dong chay SQL hoac dung testing-v3 cho v2.


> **Quyền đang áp dụng 2026-11-06:** Tài liệu này tuân thủ [quy chế thực thi](quy-che-thuc-thi.md): được trực tiếp sửa GitHub/`main`, chạy Actions/CI/APK/E2E và deploy theo nhiệm vụ; SQL cần xác minh môi trường và migration; giao dịch tiền thật cần xác nhận riêng từng giao dịch. Phần lịch sử không thay thế bằng chứng thực tế.

## Cập nhật Đợt 1 và Đợt 2 — 2026-11-06
- Đợt 1 đã có [9 đặc tả, kiểm kê](dot-1/), chưa có xác nhận tiếp nhận bởi các cuộc trò chuyện riêng.
- 01 → 10 → 02 → 06 → 07 ↔ 08 → 13: kết quả ban đầu ở mức DRAFT PREPARED; 03/14 làm song song ở mức bản nháp.
- Nhóm 07 A3.6 chưa chốt unified diff; không tự chạy SQL v2 archive hoặc runner v3; các hợp đồng Backend và RBAC cần review.
- [Đề xuất Đợt 2 chi tiết](de-xuat-dot-2.md) có danh sách ưu tiên, đầu vào, điều kiện gate và phân phối 14 nhóm.
- 04/05/09/11/12 vẫn có thể kiểm kê và sửa độc lập theo quyền ủy quyền, nhưng chưa đủ điều kiện tuyên bố tích hợp với API/provider.
