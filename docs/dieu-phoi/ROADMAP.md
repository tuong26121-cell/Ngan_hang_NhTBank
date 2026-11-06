# ROADMAP – NhTBank

## Tiếp quản toàn bộ14Issues — phiên thực thi mới 06/11/2026

Nguồn đầu phiên main7192af6. Chủrepository đã giao Nhóm01 thực hiện tự động; trạng thái chi tiết ở [bảng tiếp quản](tiep-quan-14-issues.md) và [báo cáo](bao-cao-tiep-quan-20261106.md). Không coi các ghi nhận cũ bên dưới là trạng thái mới.

- Đợt1 đã có bằng chứng, không tạo lại. Đợt2A đã tạo OpenAPI/41fixtures, utilityshape/hash23tests, permission/ledgercontract và candidateSQLdiff; v1server/auth/DB vẫn chưa triển khai/kiểmchứng.
- Local114tests đạt/0lỗi/0skip;41fixture đúng kỳ vọng; productionrootE2E43đạt/8skip; Pagesbuild đạt;6YAML/35shellblocks syntax đạt. [Log/exit/source](bang-chung-tiep-quan-20261106/).
- Đợt2B workflowAPK kiểm productiondist; chưa có kết luận artifactnative mới. Đợt2C có contractSePay/Admin/AI; chưa tích hợp provider/API.
- GhiIssues **BLOCKED: RESTForbidden**;14nội dung đã soạn tại [cap-nhat-issues/](cap-nhat-issues/), chưa gửi. Không giả định assignee/ACK hoặc14agent.
- SEC/DB/TX vàP0release còn BLOCKED; SQL/GATE/concurrency/thiếtbịthật/Production NOTRUN. Không dùng41fixtures hoặcE2Edemo làm kết quảSQL.


## Mốc hiện hành sau nghiệm thu Đợt 1 — 2026-11-06

[Báo cáo nghiệm thu](nghiem-thu-dot-1-20261106.md) ghi kết quả có điều kiện: hoàn tất rà soát/sửa tài liệu, chưa chấp thuận gate. Các phân đợt cũ dưới đây là lịch sử kế hoạch; thứ tự dùng tiếp theo là 01→10→02→06→07↔08→13, 03/14 song song.

1. **2A / D2-01:** 01/10 chốt chính sách MVP còn mở, owner review PRD; không tự chọn fee/TTL.
2. **2A / D2-02..03:** 02/06 hoàn thiện OpenAPI field-level và AuthN/AuthZ/session/permission matrix, QA phản biện.
3. **2A / D2-04..05:** 07↔08 hai vòng: tách ledger khỏi SQL import v2; final diff A3.6, canonical hash, replay/retention và atomicity.
4. **2A / D2-06:** 13 review từng gate/version/hunk; chỉ chạy SQL/concurrency khi bản vá đã review và disposable target được định danh. Điều kiện đóng D1-P0-01..04 trong báo cáo.
5. **Song song 03/14:** review token/UI và CI/evidence; 04/05/09/11/12 tiếp tục sơ bộ, tích hợp phụ thuộc vẫn khóa.

CI nguồn 7192af6 đã đọc log: unit70/backend15/E2E43 đạt,8 skipped; Pages deploy skipped. Đây không phải nghiệm thu A3.6, nativeAPK hay thiết bị thật. Quyết định tiếp tục 2A là bước tiếp theo, không tự coi đề xuất này đã được thực hiện.


> **BẢN NHÁP – 2026-11-01**  
> **Lịch sử 2026-11-01:** chỉ lập kế hoạch. **Quy chế hiện hành 2026-11-06:** được trực tiếp cập nhật `main`, sửa Issues, chạy SQL/Actions/CI/APK/E2E/merge/deploy khi đủ điều kiện nhiệm vụ. [Chi tiết](quy-che-thuc-thi.md).  
> Quy ước: **KNOWN-HISTORICAL** = thông tin ghi nhận từ công việc trước, chưa xác minh lại; **PROPOSED** = đề xuất; **NOT RUN** = chưa chạy; **BLOCKED** = chờ điều kiện/bằng chứng; **VERIFIED** chỉ khi có bằng chứng hiện thời.

## Giai đoạn 0 – Quản trị và kiểm kê (P0)
- Nhóm 01 lập nguồn tiến độ thống nhất; nhóm 02 inventory kiến trúc; nhóm 14 kiểm kê và chủ động sửa workflow/Issues/mã khi cần theo nhiệm vụ, được ghi trực tiếp `main`.
- Gate: có bảng scope, owner, dependency và source/version được kiểm chứng.

## Giai đoạn 1 – Khóa an toàn nền tảng (P0)
- Nhóm 06 xây dựng threat model / RBAC.
- Nhóm 07 hoàn thiện thiết kế SQL v2.1 A3.6; nhóm 13 phản biện độc lập; được chạy SQL local kiểm chứng sau khi có migration đã review, target và phương án rollback được xác minh.
- Nhóm 08 xác định transfer atomic/idempotency contract; nhóm 02 khóa API v1 dự thảo.
- Gate: specs không mâu thuẫn, blocker được liệt kê, mọi test còn `NOT RUN` nếu chưa thực thi.

## Giai đoạn 2 – MVP sản phẩm và giao diện (P1)
- Nhóm 10 khóa sản phẩm MVP; nhóm 03 design tokens.
- Nhóm 04 Website và nhóm 05 Android xây screen maps và prototypes.
- Gate: screens ↔ API contract ↔ nghiệp vụ nhất quán, không đánh tráo mock thành dữ liệu thật.

## Giai đoạn 3 – Tích hợp development (P1–P2, theo nhiệm vụ và điều kiện kỹ thuật)
- Nhóm 08 tích hợp Backend, nhóm 09 khảo sát SePay Test Mode, nhóm 11 Admin, nhóm 12 AI read-only.
- Nhóm 13 định nghĩa và thực thi test liên quan; nhóm 14 tổ chức CI, APK build, Preview và Production deployment theo nhiệm vụ có preflight và rollback.
- Gate: có bằng chứng build/test thực tế, không có P0 blocker, chi phí được kiểm soát.

## Giai đoạn 4 – Nghiệm thu và quyết định triển khai (tương lai)
- Security review, release checklist, recovery plan, approvals riêng cho từng môi trường.
- **Được triển khai khi có nhiệm vụ cụ thể và preflight đạt:** quyết định môi trường, đánh giá P0, backup/rollback, truy cập và chi phí; không lấy demo làm Production an toàn.

## Thứ tự ưu tiên tuần làm việc tiếp theo (không có lịch tự động)
1. 01: phê duyệt/hiệu chỉnh danh mục 14 nhóm và quy tắc trạng thái.
2. 02 + 10: chốt MVP scope và API contract nháp.
3. 06 + 07: rà GATE SQL v2.1 và phản biện ACL/transaction.
4. 08: đặc tả idempotency/concurrency dựa trên contract.
5. 13: kế hoạch kiểm thử độc lập, tất cả tests NOT RUN.

## Đồng bộ thứ tự phụ thuộc v2 (2026-11-05)

- **Đợt 1:** 01/02/10 – điều phối, scope MVP, contract nền tảng.
- **Đợt 2:** 06/07/08/13 – bảo mật, SQL A3.6, transfer/idempotency, QA độc lập. Nhóm 07 và 08 trao đổi hai vòng.
- **Đợt 3:** 03/04/05/14 – Design System, Website, Android, CI/CD; có thể viết mã, chạy build/CI và cập nhật `main` ngay khi phạm vi rõ; chỉ mở tích hợp có phụ thuộc khi contract và security gate phù hợp.
- **Đợt 4:** 09/11/12 – SePay Sandbox, Admin, AI Assistant.

**Gate điều phối:** COORD-01, ARCH-01, SEC-01, DB-01, TX-01, UX-01, QA-01, OPS-01. Toàn bộ đang ở mức thiết kế/đề xuất; không có test được chạy trong lượt cập nhật. Chi tiết điều kiện nằm tại `MASTER-STATUS.md` v2 mục 5.

> **Quyền đang áp dụng 2026-11-06:** Tài liệu này tuân thủ [quy chế thực thi](quy-che-thuc-thi.md): được trực tiếp sửa GitHub/`main`, chạy Actions/CI/APK/E2E và deploy theo nhiệm vụ; SQL cần xác minh môi trường và migration; giao dịch tiền thật cần xác nhận riêng từng giao dịch. Phần lịch sử không thay thế bằng chứng thực tế.

## Chuyen Dot 1 sang Dot 2 – 2026-11-06

- Đợt 1 đã tạo 9 tài liệu nghiên cứu/thiết kế trong [dot-1/](dot-1/); dựa trên mã nguồn hiện tại, chưa có review nghiệm thu hoặc nhận việc tự động.
- **Đợt 2A:** 10 chốt PRD -> 02 API v1 -> 06 threat/RBAC -> 07/08 vòng 1/vòng 2 schema+idempotency -> 13 độc lập QA.
- **Song song 2B:** 03 hoàn thiện tokens/45 UI requirements, 14 kiểm kê CI/run; nhóm 04 Website và 05 Android chỉ tích hợp khi ARCH/SEC/UX contract đầy đủ.
- **Chuẩn bị 2C:** 09 SePay Test Mode, 11 Admin, 12 AI read-only; chưa tích hợp thật cho đến khi có gate.
- Xem [de-xuat-dot-2.md](de-xuat-dot-2.md) để biết đường găng, tiêu chí nghiệm thu và phiếu bàn giao; không tự gắn PASS cho gate.

## Đợt 2 sau kết quả Đợt 1 — đề xuất 2026-11-06
1. 10/01 review nghiệp vụ MVP và acceptance; 02/06 chốt API v1/authorization.
2. 07↔08 khóa schema/transaction/idempotency contract hai vòng; 13 phản biện độc lập SQL và concurrency.
3. 03 chốt UI tokens; 04/05 được triển khai phần giao diện độc lập/sandbox mock; 14 review CI/Android APK và release evidence.
4. 09/11/12 nghiên cứu SePay Test Mode, Admin/AI read-only, chờ contract trước tích hợp.
Toàn bộ điều kiện, nguồn, blocker và gate: [Đề xuất Đợt 2](de-xuat-dot-2.md).

## Cap nhat thuc te Dot 1 va de xuat Dot 2 — 2026-11-06

- Da co 9 ban nhap Dot 1 tren `main/docs/dieu-phoi/dot-1/`. Cau truc: 01→10→02→06→07↔08→13, 03/14 song song. Day la output thiet ke, khong phai gate PASS hoac agent tiep nhan.
- Tien trinh Dot 2 duoc chia [2A/2B/2C](de-xuat-dot-2.md). **2A**: chot nghiep vu/API/AuthZ, review DB/Transfer hai vong va QA. **2B**: UI Web/Android, CI/backend tests. **2C**: SePay Test Mode, Admin, AI read-only sau contract.
- CI main duoc bo sung buoc `npm run test:backend` tai commit [7f14b3e](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/commit/7f14b3ead1a84e209886a72ae5f4f4b75501492f); can doi chieu [run 42192443494](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42192443494) truoc khi danh dau QA/OPS PASS.
- Nhan viec: Issues 32–45 van la hang doi tren GitHub; chua co he thong auto-dispatch sang 14 ChatGPT threads.

## Sau kiểm chứng thực tế Đợt1 — 06/11/2026

[Báo cáo thực hiện](ket-qua-dot-1-20261106.md):86 test local đạt, Pages build/syntax đạt; SQL/GATE/concurrency/nativeAPK/E2E trong phiên chưa chạy. [Đợt2 mục10](de-xuat-dot-2.md) thay kế hoạch chung bằng6 đầu việc chốt contract,03/14 độc lập và5 nhóm nghiên cứu sơ bộ. Không tạo lại bản nháp đã có, không coi kiểm kê là nghiệm thu tích hợp.


## Đợt 4 — rà soát tiếp ngày 07/11/2026 (Asia/Saigon)

PARTIAL: bàn giao tài liệu; Website/APK mới BLOCKED. Đã nhận [kết quả Nhóm 13 Đợt 2A](dot-2a/13-kiem-thu-nen-tang.md): unit 70/70, backend 25/25, build đạt, E2E 43 đạt/8 skip; đây là kết quả được ghi trong báo cáo QA, không phải nghiệm thu release cuối. ARCH-01/SEC-01/DB-01/TX-01/QA-01/OPS-01 còn BLOCKED; native APK NOT RUN. Tiếp theo: 13 chốt nghiệm thu đúng phạm vi/SHA; 01/14 thống nhất version/changelog; 14 xác minh CI, môi trường và baseline rollback; 05/14 build và kiểm chữ ký/package/logo/version, thiết bị thật. [Bàn giao và recovery plan](ban-giao-dot-4-20261106.md). Không phát hành dịch vụ ngân hàng thật hoặc giao dịch tiền thật.
