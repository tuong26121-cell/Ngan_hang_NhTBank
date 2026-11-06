# MASTER-STATUS – NhTBank, 14 nhóm (v3: kiểm tra GitHub 2026-11-06)

## Đợt 3 — Tích hợp tổng thể, cập nhật 07/11/2026 (Asia/Saigon)

**BLOCKED — chưa hoàn thành.** Nguồn kiểm chứng `ba22b0dc5de7b14553036a19b240390025713c52`. Đã ACK nhận QA HO-2A-13-01/14, không chấp thuận release. [Báo cáo tám gate và từng thành phần](ket-qua-dot-3-20261107.md) là nguồn trạng thái Đợt 3 mới; các bảng PROPOSED/không ACK phía dưới giữ giá trị lịch sử.

- CI SHA295eff3: đã đọc job127822542994/run42196968950: unit70/backend25/build đạt; E2E43 đạt/8 skipped. Chỉ docs khác main snapshot; [bằng chứng](dot-3/bang-chung-20261107/kiem-chung.json). Local phiên trước: unit70/backend15/build/E2E43 đạt,8 skipped.
- COORD-01 IN PROGRESS, chưa PASS; ARCH-01/SEC-01/DB-01/TX-01/UX-01/QA-01/OPS-01 BLOCKED nghiệm thu tích hợp.
- Supabase NhTBank tồn tại; public/private tables và migrations inventory rỗng; chưa được nghiệm thu development. Không chạy SQL/seed/deploy/giao dịch thật.
- D3-01..09 đã xác định owner/Issue/điều kiện mở khóa; không dùng UI demo/Pages build làm bằng chứng backend+DB hoặc APK native.
- Nhận bàn giao Đợt4 tài liệu PARTIAL không thay thế nghiệm thu Đợt3. Issue OPEN, không tự coi các nhóm logic đều đang chạy.


## Snapshot nghiệm thu hiện hành — 2026-11-06

- Nguồn đọc trực tiếp: main `7192af6c28b51b56806b0b9c6827d2d0604bbc8a`, 14 Issues #32–45 và toàn bộ 10 tệp trong `dot-1/` (9 bản nhóm và 1 bản sơ bộ). [Báo cáo nghiệm thu](nghiem-thu-dot-1-20261106.md) là điểm tra cứu hiện hành; các snapshot bên dưới giữ theo thời điểm lịch sử.
- **Kết luận:** hoàn tất lượt rà soát và sửa tài liệu; **chưa nghiệm thu gate thiết kế hoặc tích hợp**. COORD/ARCH/SEC/DB/TX/QA/UX/OPS đều REVIEW PENDING/BLOCKED, không tự PASS.
- Chuỗi: **01 → 10 → 02 → 06 → 07 ↔ 08 → 13**; 03/14 có phần độc lập song song; 04/05/09/11/12 chờ contract trước tích hợp.
- P0 chặn tích hợp backend/DB: D1-P0-01 API/AuthZ; D1-P0-02 ledger/idempotency; D1-P0-03 final diff A3.6 + provenance gate + môi trường; D1-P0-04 QA runtime. Đây là blocker nghiệm thu, không phải khẳng định sự cố Production.
- CI nguồn `7192af6`: [run 42194370164](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42194370164) success, log unit70/backend15/E2E43 đạt +8 skipped. Pages [42194370353](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42194370353): build success, deploy skipped. Không dùng chúng thay kết quả SQL/concurrency hoặc CI của commit nghiệm thu mới.
- Kiểm tra local trong lượt này: 62 tệp runtime/config/test/lock khớp blob nguồn; build exit0; backend15 và APK config1 đạt. Vitest mặc định exit1 (59 đạt/11 lỗi do loopback EPERM); chạy lại ngoài sandbox chưa thực thi vì auto-review hết hạn mức. E2E local chưa chạy. [Bằng chứng máy đọc được](bang-chung-nghiem-thu-dot-1-20261106/doi-chieu.json).
- Nhóm 01 đang thực hiện yêu cầu trong chat này. Issues còn OPEN; 02–14 chưa có bằng chứng ACK riêng. Việc cập nhật Issue/tạo tài liệu không khởi động AI khác.
- Bàn giao Đợt 2A theo D2-01..06 có sẵn, bổ sung [điều kiện đóng P0](nghiem-thu-dot-1-20261106.md); chưa tự bắt đầu Đợt 2A.


## Lịch sử kiểm chứng ở phiên trước — giữ nguyên phạm vi bằng chứng

- Nguồn đầu phiên main `b6499a3afc2533eb3564c58c50675c4fde9a3cb6`; đã đồng bộ fast-forward `3d05f6e` khi main có thêm liên kết tài liệu. Giữ các ghi nhận SHA/trạng thái cũ bên dưới ở giá trị lịch sử.
- Đã nghiên cứu chuỗi01→10→02→06→07↔08→13;03/14 kiểm kê song song;04/05/09/11/12 có bản sơ bộ, chưa tích hợp.
- Kết quả thực thi local: **86 đạt/0 lỗi/0 skipped** (70 Vitest,15 backend,1 cấu hình APK), build Pages đạt,6 YAML/34shell blocks syntax đạt. [Log và exit code](bang-chung-20261106/); không chứng minh SQL/GATE/E2E/thiết bị thật.
-14/14 Issues còn OPEN, không assignee; snapshot timeline trống tại lần đọc trong [issues.json](bang-chung-20261106/issues.json). Hai agent phụ của phiên đã phản biện/kiểm kê, không thay thế tiếp nhận bởi14 nhóm GitHub.
- Các mâu thuẫn error/RBAC/state được làm rõ ở mức nháp; GATE01–10 chưa có provenance canonical. SQL/parser/concurrency/nativeAPK/E2E chưa chạy trong phiên này.
- [Báo cáo thực hiện](ket-qua-dot-1-20261106.md) và [đề xuất Đợt2 cập nhật ngay tại đây](de-xuat-dot-2.md#10-cập-nhật-sau-thực-hiện-và-phản-biện-đợt-1--06112026). Các gate thiết kế/runtime vẫn chưa nghiệm thu; không đổi backlog sang VERIFIED.


> **BẢN NHÁP v3 – 2026-11-06 (v2 lưu ở các mục lịch sử)**  
> Ghi nhận lịch sử: bản đầu là bản phân tích. Từ 2026-11-06 quy chế mới cho phép cập nhật trực tiếp `main`, GitHub Issues, SQL/test/CI/APK/E2E và deploy trong phạm vi nhiệm vụ có kiểm soát; xem [quy-che-thuc-thi.md](quy-che-thuc-thi.md).

## 1. Nguyên tắc và trạng thái

- **Nguồn điều phối:** tài liệu trên GitHub `main`, GitHub Issues #32–45 và [quy chế thực thi hiện hành](quy-che-thuc-thi.md); cuộc trò chuyện không tự nhận việc từ Issue nếu chưa có cơ chế gửi.
- **Định hướng:** Website + Mobile App Android-first; backend/API chung, PostgreSQL/Supabase development, giao dịch mô phỏng; giao diện Futuristic 3D nền sáng, rõ chữ.
- **Quyền hiện hành (2026-11-06):** chủ repository đã cho phép trực tiếp sửa mã/tài liệu/Issues trên GitHub, commit `main`, chạy SQL/test/Actions/CI/APK/E2E, merge và deploy khi nhiệm vụ cụ thể, preflight và bằng chứng đầy đủ; không cần xin lại quyền ghi mỗi lần. Giao dịch thật/chi phí cần điều kiện và xác nhận riêng cho hành động tài chính cụ thể. Xem [quy chế](quy-che-thuc-thi.md).
- **Nhóm 01:** đã lập và cập nhật tài liệu điều phối; **không** có nghĩa 13 nhóm kia đã được kích hoạt tự động.
- **Mốc lịch sử Nhóm 07:** A3.5 sửa thiết kế SQL v2.1; A3.6 chưa được kiểm chứng hoàn thành. Core SHA lịch sử `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`, Assertions SHA `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`; nhánh `codex/nhtbank-sql-hardening-20261031` đã trả 404 khi đọc; dùng hai file `docs/sql-drafts/archive/v2/` trên `main` có SHA khớp để tham chiếu, xác minh lại khi thao tác.
- **Không áp dụng:** `testing-v3` cho v2, `reversed` trước khi có reversal workflow, kết luận idempotency/concurrency PASS khi chưa có log.

**Trạng thái:** `PROPOSED` (đề xuất), `IN PROGRESS` (có hoạt động có bằng chứng), `BLOCKED` (thiếu điều kiện), `NOT RUN` (chưa thực thi kiểm thử), `FAIL` (có bằng chứng không đạt), `VERIFIED` (được xác minh bằng chứng trực tiếp), `KNOWN-HISTORICAL` (điểm neo lịch sử chưa tái kiểm). Việc tạo tài liệu bản nháp **không** tự đổi backlog sang VERIFIED.

## 2. Ma trận phụ thuộc 14 nhóm và tiêu chí nghiệm thu thiết kế

| Nhóm | Chủ trì | Ưu tiên | Đầu vào phụ thuộc | Đầu ra/tiêu chí nghiệm thu thiết kế | Gate | Trạng thái backlog |
|---|---|---|---|---|---|---|
| 01 | Trung tâm điều phối | P0 | Không | MASTER-STATUS v2, quyết định, bàn giao, backlog | COORD-01 | PROPOSED |
| 02 | Kiến trúc & API Contract | P0 | 01, 10 | Sơ đồ kiến trúc, API contract v1 nháp, ranh giới dữ liệu | ARCH-01 | PROPOSED |
| 03 | UI/UX & Design System | P1 | 10, 02 | Design tokens, component specification, accessibility | UX-01 | PROPOSED |
| 04 | Website | P1 | 02, 03, 06, 08 | Sitemap, user flows, API integration matrix | UX-01 / ARCH-01 | PROPOSED |
| 05 | Mobile App | P1 | 02, 03, 06, 08 | Android architecture, screen map, build plan | UX-01 / ARCH-01 | PROPOSED |
| 06 | Identity & Security | P0 | 02, 10 | Threat model, RBAC, session & AuthZ boundary | SEC-01 | PROPOSED |
| 07 | Database & Supabase | P0 | 02, 06, 08 (vòng trao đổi) | Diff SQL v2.1 thiết kế; GATE-01..10, ACL, transaction | DB-01 | PROPOSED |
| 08 | Backend & Transfer | P0 | 02, 06, 07 (vòng trao đổi), 10 | OpenAPI, atomic transfer, idempotency & retry contract | TX-01 | PROPOSED |
| 09 | SePay & Webhook | P2 | 06, 07, 08 | Webhook contract, chống replay, rủi ro tích hợp | SEC-01 / TX-01 | PROPOSED |
| 10 | Sản phẩm tài chính | P1 | 01 | PRD/MVP, business rules, acceptance criteria | COORD-01 | PROPOSED |
| 11 | Admin Dashboard | P2 | 03, 06, 08 | Admin sitemap, RBAC, incident/audit flow | SEC-01 / UX-01 | PROPOSED |
| 12 | AI Assistant | P2 | 06, 08, 10 | AI read-only architecture, tool permissions, safety tests | SEC-01 | PROPOSED |
| 13 | QA & Kiểm toán | P0 | 02, 06, 07, 08 (nhận nháp sớm) | Test matrix, independent review, PASS/FAIL criteria | QA-01 | PROPOSED |
| 14 | GitHub & DevOps | P1 | 02, 05, 13 | CI/CD design, môi trường, artifact và rollback plan | OPS-01 | PROPOSED |

**Xử lý phụ thuộc hai chiều 07 ↔ 08:** Vòng 1 Nhóm 07 cung cấp schema draft, Nhóm 08 cung cấp transaction/idempotency contract; vòng 2 đối chiếu các giả định, Nhóm 06 đánh giá bảo mật và Nhóm 13 phản biện độc lập. Không bắt cả hai nhóm chờ nhau hoàn tất toàn bộ.

**Nhóm 13 được khởi động QA design sớm:** có thể viết test matrix từ nháp; được quyền chạy kiểm thử phù hợp khi đủ điều kiện; chỉ nghiệm thu sau khi có log chạy thật.

## 3. Backlog ưu tiên 14 hạng mục

| ID | P | Chủ trì | Phụ thuộc | Công việc | Điều kiện hoàn tất ở mức thiết kế | Trạng thái |
|---|---|---|---|---|---|---|
| NB-P0-01 | P0 | 01 | Không | Chuẩn hóa status, handoff, decision log | MASTER-STATUS v2; nhật ký và checklist thống nhất | PROPOSED |
| NB-P0-02 | P0 | 02 | 01, 10 | Kiến trúc và API v1 | Sơ đồ đầy đủ và contract có version, lỗi, authorization | PROPOSED |
| NB-P0-03 | P0 | 06 | 02, 10 | Threat model/RBAC | Ma trận roles, principals, session, threat cases | PROPOSED |
| NB-P0-04 | P0 | 07 | 02, 06, 08 | Thiết kế A3.6 SQL v2.1 | Unified diff hai file + review GATE-01..10; NOT RUN | PROPOSED |
| NB-P0-05 | P0 | 08 | 02, 06, 07, 10 | Transfer/idempotency | Atomic sequence, replay/hash/race/recovery contract | PROPOSED |
| NB-P0-06 | P0 | 13 | 02, 06, 07, 08 | Kiểm toán độc lập | Test matrix, gate evidence rules, test vẫn NOT RUN | PROPOSED |
| NB-P1-01 | P1 | 10 | 01 | PRD/MVP sandbox | Phạm vi MVP, story, business rules, acceptance | PROPOSED |
| NB-P1-02 | P1 | 03 | 02, 10 | Design system | Tokens + component states + a11y | PROPOSED |
| NB-P1-03 | P1 | 04 | 02, 03, 06, 08 | Website MVP | Sitemap, flows, error states, API mapping | PROPOSED |
| NB-P1-04 | P1 | 05 | 02, 03, 06, 08 | Android MVP | Screen map, security UX, build plan | PROPOSED |
| NB-P1-05 | P1 | 14 | 02, 05, 13 | CI/CD draft | Repo/workflow inventory, environment gates, rollback | PROPOSED |
| NB-P2-01 | P2 | 09 | 06, 07, 08 | SePay Sandbox | Official-doc evidence, webhook protocol and risks | PROPOSED |
| NB-P2-02 | P2 | 11 | 03, 06, 08 | Admin dashboard | Admin permission matrix and incident workflow | PROPOSED |
| NB-P2-03 | P2 | 12 | 06, 08, 10 | AI assistant | Read-only MVP, tool permission, eval cases | PROPOSED |

## 4. Thứ tự thực hiện và điểm khóa

1. **Đợt 1 – Điều phối và hợp đồng nền tảng (01, 02, 10):** scope MVP, kiến trúc, API draft và version control tài liệu. Các nhóm an toàn có thể phản biện sơ bộ đồng thời.
2. **Đợt 2 – Bảo mật, dữ liệu và chuyển khoản (06, 07, 08, 13):** threat model, SQL v2.1 A3.6, atomic transfer/idempotency, test matrix. Nhóm 07/08 trao đổi hai vòng; QA không được tự chứng nhận test PASS.
3. **Đợt 3 – Giao diện và chuẩn bị quy trình build (03, 04, 05, 14):** design system, web/mobile MVP plans, CI/CD design. Phần thiết kế có thể thực hiện song song với đợt 2, nhưng tích hợp phải chờ contract cần thiết.
4. **Đợt 4 – Mở rộng (09, 11, 12):** SePay Sandbox, Admin, AI read-only; Production chỉ được triển khai khi có môi trường, quyền và kiểm soát kỹ thuật được xác minh.

## 5. Gate điều phối (đều là cổng nghiệm thu thiết kế, không phải kết quả build/test)

| Gate | Chịu trách nhiệm | Điều kiện thiết kế | Trạng thái |
|---|---|---|---|
| COORD-01 | 01 + 10 | MVP scope, phân công, các phiên bản tài liệu và handoff rõ | Đề xuất / chưa nghiệm thu |
| ARCH-01 | 02 | API contract v1, dataflow, authorization boundary có phản biện | Đề xuất / chưa nghiệm thu |
| SEC-01 | 06 + 13 | Threat model và RBAC có bằng chứng review | Đề xuất / chưa nghiệm thu |
| DB-01 | 07 + 13 | Unified diff v2.1 + ma trận ACL + GATE-01..10 được review; SQL chỉ thực thi khi bản migration và môi trường đã xác minh | Đề xuất / NOT RUN |
| TX-01 | 08 + 13 | Atomic transfer, replay và concurrency contract có test cases | Đề xuất / NOT RUN |
| UX-01 | 03 | Design system tương thích app/web, accessibility review | Đề xuất / chưa nghiệm thu |
| QA-01 | 13 | Test matrix, PASS/FAIL/BLOCKED và tiêu chuẩn evidence | Đề xuất / test NOT RUN |
| OPS-01 | 14 | CI/CD, tách môi trường, rollback, chi phí; được deploy theo nhiệm vụ đủ điều kiện | Đề xuất / NOT RUN |

## 6. Checklist nghiệm thu áp dụng cho mọi nhóm

- [ ] Đầu ra đúng phạm vi sở hữu, có version và người/nhóm chủ trì.
- [ ] Có nguồn, nhánh, commit hoặc SHA khi sử dụng mã nguồn; ghi rõ có kiểm chứng trong lượt hay không.
- [ ] Có đầu vào phụ thuộc và nhóm nhận bàn giao.
- [ ] Có rủi ro, giả định và đề xuất giảm thiểu.
- [ ] Có acceptance criteria cụ thể, kiểm chứng được.
- [ ] Không nhận PASS/VERIFIED nếu thiếu bằng chứng tương ứng.
- [ ] Thực hiện quyền GitHub/main và kiểm thử đã được cấp; riêng SQL, Production và thao tác tài chính phải có preflight/giới hạn hành động rõ ràng.
- [ ] Có handoff ID và cập nhật vào HANDOFF-LOG khi thật sự bàn giao.

## 7. Evidence và quy tắc chuyển trạng thái

- **Thiết kế đã viết xong:** có thể đánh dấu tài liệu `DRAFT COMPLETE` ở cấp hiện vật, không tự động đánh dấu backlog `VERIFIED`.
- **IN PROGRESS:** phải chỉ ra hoạt động, ngày, người/nhóm, đầu ra đang làm.
- **BLOCKED:** ghi blocker-ID, lý do, owner xử lý, điều kiện mở khóa.
- **VERIFIED:** ghi tài liệu hoặc log gốc, SHA/commit nếu liên quan, điều kiện kiểm tra, thời điểm; tách rõ chứng minh bản thiết kế với chứng minh chạy được.
- **NOT RUN:** bắt buộc với test SQL, API, concurrency, build, APK nếu chưa có log thực thi.

## 8. Phiếu bàn giao tối thiểu

`Handoff-ID | Nhóm gửi → nhóm nhận | Phiên bản tài liệu | Repo/branch/SHA đã xác minh hoặc historical | Đầu ra | Bằng chứng | Giả định/rủi ro | Tiêu chí nhận | Trạng thái | Việc tiếp theo`

## 9. Chưa thực hiện theo mốc v2 (trước khi đồng bộ)

- Chưa kiểm tra trực tiếp HEAD/PR/workflow GitHub trong lượt cập nhật này.
- Chưa chạy SQL, kiểm thử, build APK hoặc deployment.
- Chưa gửi phiếu bàn giao đến các cuộc trò chuyện khác; các nhóm chưa tự hoạt động.
- Chưa có bằng chứng để tuyên bố bất kỳ gate kỹ thuật nào PASS.

## 10. Dong bo GitHub – 2026-11-06

- Nguoi dung cho phep day 5 tai lieu quan ly 14 nhom len nhanh tinh nang docs/dieu-phoi-14-nhom-20261106. Khong ghi vao main.
- Da tao 14 GitHub Issues tu #32 den #45. Danh sach va huong dan o [huong-dan-phan-cong.md](huong-dan-phan-cong.md).
- Issues la hang doi nhiem vu, khong phai thong bao da gui vao ChatGPT hoac bang chung 14 agent dang lam viec.
- Tat ca backlog van PROPOSED. SQL/test/build van NOT RUN neu khong co bang chung thuc thi.


## 11. Trang thai dieu phoi sau kiem tra truc tiep 2026-11-06

- Da doi chieu GitHub Issues #32–#45: **14/14 OPEN**, **0/14 GitHub assignee**, **0/14 binh luan tiep nhan** tai thoi diem kiem tra.
- **9/14 nhom co the bat dau cong viec thiet ke/kiem ke so bo**: 01, 02, 03, 06, 07, 08, 10, 13, 14. Khong co nghia da nhan viec.
- **5/14 nhom chi chuan bi trong khi cho contract de tich hop**: 04, 05, 09, 11, 12. Khong mo tich hop, deploy hay goi API that.
- **Trang thai tiep nhan:** CHUA XAC NHAN cho 14/14 GitHub Issues; Nhom 01 dang dieu phoi trong cuoc tro chuyen nay nhung khong co GitHub assignee/hand-off ack.
- Dang giu PROPOSED, gate chua PASS; SQL, test, CI, APK va E2E chua duoc chay trong luot dieu phoi.
- Xem [Bang giao viec 14 nhom](bang-giao-viec-20261106.md) va [huong dan nhan viec](huong-dan-phan-cong.md). Issue da duoc bo sung phan loai khoi dong va trang thai tiep nhan; khong gui tin nhan tu dong den ChatGPT threads.
- Nguon nhat ky: [Issue #32](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/32) den [Issue #45](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/45).
- **Quy chế hiện hành:** mọi nhóm có thể sửa trực tiếp `main` và kích hoạt quy trình test/build/CI/deploy cần thiết cho nhiệm vụ khi đã kiểm tra ảnh hưởng; tuân thủ [quy-che-thuc-thi.md](quy-che-thuc-thi.md). Ghi nhận ở đoạn lịch sử trên chỉ mô tả đợt cũ.

## 12. Kết quả đánh giá khả năng khởi động – 2026-11-06

- Đã đọc trực tiếp 14 GitHub Issues #32–#45 và kiểm tra MASTER-STATUS v2.
- **9/14 nhóm có thể bắt đầu thiết kế/kiểm kê ngay:** 01, 02, 03, 06, 07, 08, 10, 13, 14.
- **5/14 nhóm chờ contract trước khi tích hợp:** 04, 05, 09, 11, 12. Có thể khảo sát hiện trạng/wireframe, không tự tích hợp.
- Nhóm 01 đang điều phối trong cuộc trò chuyện hiện tại, nhưng không có GitHub assignee. Nhóm 02–14 chưa có xác nhận tiếp nhận công việc; các Issue vẫn OPEN.
- Nguồn chi tiết: [bang-giao-viec-20261106.md](bang-giao-viec-20261106.md); điều kiện bắt đầu đã được ghi trực tiếp trên 14 GitHub Issues.
- Kiểm chứng lại SQL: nhánh `codex/nhtbank-sql-hardening-20261031` trả 404; hai file trong `main/docs/sql-drafts/archive/v2/` vẫn có SHA core `48ed0ab6adec0ffa3091e081924d051e2a6a2bda` và assertions `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`.
- **Không đổi trạng thái backlog PROPOSED thành VERIFIED** vì mới xác định khả năng khởi động, chưa có artifact bàn giao/kiểm thử.
- Tại thời điểm đợt đánh giá readiness trước đó, chưa chạy SQL, build, test, Actions, merge hay deploy; từ 2026-11-06 các bước này đã được cho phép theo quy chế hiện hành.

## 13. Quyền và trạng thái mới từ 2026-11-06

- Chủ repository cho phép các nhóm trực tiếp chỉnh sửa mã/tài liệu/Issues, cập nhật `main`, chạy CI/Actions/APK/E2E/merge/deploy phù hợp yêu cầu; xem [quy chế](quy-che-thuc-thi.md).
- Đã có một commit tài liệu điều phối lên `main` vào 2026-11-06; nguồn là lịch sử GitHub, không phải chứng cứ cho các gate SQL/Backend.
- Cấm đoán blanket trong bản nháp cũ bị thay thế. Vẫn yêu cầu preflight cho SQL, hệ thống thật, Production, chi phí và bằng chứng PASS.

## 14. Dot 1 da co artifact; de xuat Dot 2 – 2026-11-06

- Đã ghi 9 bản nghiên cứu/thiết kế vòng đầu cho Nhóm 01/10/02/06/07/08/13 và 03/14 vào [`dot-1/`](dot-1/). Đây là tài liệu do trung tâm điều phối tổng hợp, **không phải** bằng chứng 9 AI agents đã nhận việc.
- [Đề xuất Đợt 2](de-xuat-dot-2.md): 2A 10 -> 02 -> 06 -> 07 <-> 08 -> 13; 2B 03/14 + UI 04/05 khi đủ contract; 2C 09/11/12 theo gate.
- SQL source v2 đã đọc trên main: SHA core `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`; assertions `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`. A3.6 mới có *hunk plan*, chưa có unified diff chốt; SQL NOT RUN.
- **Tài liệu DRAFT CREATED; gate/chấp thuận**: COORD-01/ARCH-01/SEC-01/DB-01/TX-01/UX-01/QA-01/OPS-01 chưa được xác nhận PASS. GitHub Issues vẫn OPEN và chưa có xác nhận các nhóm logic đã tiếp nhận.
- Quyền thực hiện kỹ thuật theo [quy-che-thuc-thi.md](quy-che-thuc-thi.md); không nhầm quyền thực thi với bài test/giao dịch đã chạy.

## 15. Kết quả Đợt 1 và hướng Đợt 2 — 2026-11-06
- Đã tạo 9 tài liệu thiết kế/kiểm kê tại [dot-1/](dot-1/) cho 01,10,02,06,07,08,13 và 03/14 song song.
- Trạng thái tài liệu: DRAFT PREPARED; không coi là 9 agent đã nhận việc; toàn bộ gate cần review độc lập.
- Nhóm 07 mới có danh sách hunk SQL A3.6, chưa có unified diff cuối hoặc kiểm thử; Nhóm 08 mới có idempotency design, chưa code persistent transfer.
- Nhóm 13 mới thiết kế 12 test case, chưa chạy SQL/backend concurrency. Nhóm 03/14 chưa đổi CSS hoặc workflow trong đợt 1.
- [Đề xuất Đợt 2](de-xuat-dot-2.md) đặt thứ tự 10→02→06→07↔08→13, đồng thời 03/14; chờ contract cho 04/05/09/11/12.
- Bằng chứng CI của commit tài liệu là tách biệt; không biến CI unit PASS thành SQL/concurrency PASS.

## 16. Dot 1 (9 hien vat thiet ke) va de xuat Dot 2 — 2026-11-06

- **Da tao tren main:** 9 file dac ta/thiet ke trong [dot-1/](dot-1/) theo thu tu 01 (#32) → 10 (#41) → 02 (#33) → 06 (#37) → 07 (#38) ↔ 08 (#39) → 13 (#44), song song 03 (#34) va 14 (#45).
- **De xuat Dot 2:** xem [de-xuat-dot-2.md](de-xuat-dot-2.md) gom 2A chot MVP/API/AuthZ/SQL/Transfer/QA; 2B giao dien/CI; 2C SePay Test Mode/Admin/AI; chua chap thuan gate ky thuat.
- **CI bo sung:** commit [7f14b3e](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/commit/7f14b3ead1a84e209886a72ae5f4f4b75501492f) them `npm run test:backend` vao workflow verify-main. Link [run 42192443494](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42192443494); chi ghi PASS neu run hoan thanh success.
- **Trang thai nhan viec:** 9 tai lieu la output dieu phoi duoc tao tren GitHub, khong co nghia 9 cuoc tro chuyen AI da nhan viec; 14 Issues van la hang doi.
- **SQL v2.1 A3.6:** co ke hoach hunk, **chua co unified diff cuoi/khong chay migration**. Tranh `testing-v3` cho v2; pending GATE-01..10.
- **Dot 2 tich hop:** nhom 04/05/09/11/12 van cho contract; duoc nghien cuu/mock UI doc lap.

## Nhóm 13 — kết quả Đợt 2A ngày 2026-11-06

Đã tiếp quản #44 và kiểm tra độc lập baseline `7192af6c28b51b56806b0b9c6827d2d0604bbc8a`. [Báo cáo hiện hành](dot-2a/13-kiem-thu-nen-tang.md) thay cho trạng thái chưa tiếp nhận của Nhóm 13 ở các đoạn lịch sử. Đã thêm 10 HTTP tests, backend 25/25 và unit 70/70 PASS, build PASS, E2E 43 PASS/8 skip chủ ý; có log tự chạy. SQL NOT RUN; không chấp nhận runtime Auth/RBAC/ledger/concurrency/crash khi chưa implementation/preflight. GATE ARCH-01/SEC-01/DB-01/TX-01/QA-01/OPS-01 vẫn BLOCKED cho nghiệm thu nền tảng. Handoff 01/14 có matrix/log/criteria; ACK nhận PENDING. Issue #44 OPEN.


## Cập nhật xác minh ngày 07/11/2026 (Asia/Saigon)

Đã đọc [báo cáo Nhóm 13 Đợt 2A](dot-2a/13-kiem-thu-nen-tang.md): unit 70/70, backend 25/25, build PASS, E2E 43 PASS/8 skip; SQL và native APK NOT RUN. Đây là số liệu trong báo cáo QA đã nhận, không phải test chạy lại của Nhóm 14. ARCH-01/SEC-01/DB-01/TX-01/QA-01/OPS-01 vẫn BLOCKED theo quyết định QA. ACK nhận hiện vật HO-2A-13-14: đã đọc; ACK này không chấp thuận release.

Đính chính giới hạn truy vấn CI ở bản đầu: fetch_commit_workflow_runs chỉ lọc run do pull_request, nên kết quả rỗng không chứng minh thiếu CI push. Truy vấn REST actions/runs theo head_sha đã xác minh main 295eff3811bc5654aaf6677a226eba7b4d0dd4d7 có Verify success [42196968950](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42196968950) và Pages workflow success [42196968799](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42196968799). Baseline 7192af6 cũng có Verify success 42194370164 và Pages workflow success 42194370353. Workflow success không tự chứng minh deploy job chạy hoặc gate bảo mật/thiết bị thật đạt.

Quyết định Đợt 4 vẫn PARTIAL: tài liệu được cập nhật; ứng dụng mới BLOCKED. Không tạo tag/version, APK, checksum hoặc URL phát hành mới. Giữ package 1.0.1; artifact lịch sử không được nhận làm release mới. Tiếp theo: owner 13 cung cấp nghiệm thu cuối đúng phạm vi; 01/14 khóa version/changelog; 14 baseline rollback và environment; 05/14 artifact/signature/icon/package/version/device. Tham chiếu [bàn giao chi tiết](ban-giao-dot-4-20261106.md).
