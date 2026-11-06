# HANDOFF-LOG – NhTBank

> **BẢN NHÁP – 2026-11-01**  
> **Lịch sử 2026-11-01:** chỉ lập handoff. **Hiện hành 2026-11-06:** cho phép trực tiếp sửa `main`/Issues, chạy SQL/test/Actions/APK/E2E/merge/deploy theo nhiệm vụ khi đủ preflight; xem [quy chế](quy-che-thuc-thi.md).  
> Quy ước: **KNOWN-HISTORICAL** = thông tin ghi nhận từ công việc trước, chưa xác minh lại; **PROPOSED** = đề xuất; **NOT RUN** = chưa chạy; **BLOCKED** = chờ điều kiện/bằng chứng; **VERIFIED** chỉ khi có bằng chứng hiện thời.

## Phiếu bàn giao mẫu

```text
Handoff-ID: NB-HO-YYYYMMDD-001
Từ nhóm: 07
Đến nhóm: 13
Tiêu đề: Review độc lập SQL v2.1 A3.6
Nguồn: repository/branch/path/commit-SHA (xác minh lại)
Phạm vi: thiết kế/review, thực thi thay đổi và test liên quan nếu đã đáp ứng điều kiện của nhiệm vụ và quy chế
Artifact: liên kết/nội dung diff và GATE matrix
Điều đã xác minh: (bằng chứng)
Điều chỉ đề xuất: (thiết kế, giả định)
Rủi ro / blocker: ...
Yêu cầu nhận: xác nhận tiếp nhận và phản biện từng hunk
Trạng thái: PROPOSED
```

## Bàn giao khởi tạo (dự kiến, chưa gửi)

| ID | Từ → Đến | Nội dung | Tình trạng |
|---|---|---|---|
| NB-HO-001 | 01 → 02 | Đặc tả kiến trúc & API contract | PROPOSED / chưa gửi |
| NB-HO-002 | 10 → 08 | Chốt business rules transfer sandbox | PROPOSED / chưa gửi |
| NB-HO-003 | 07 → 13 | Review diff v2.1 sau A3.6 | BLOCKED – A3.6 chưa hoàn tất |
| NB-HO-004 | 06 → 07 | Threat model + permission rules | PROPOSED / chưa gửi |
| NB-HO-005 | 13 → 14 | QA gates trước CI | BLOCKED – test plan chưa chốt |

**Lưu ý:** Việc ghi một phiếu vào file này không tự động gửi thông báo hoặc đồng bộ các cuộc trò chuyện khác.

## Quy tắc bàn giao v2 (đang áp dụng cho điều phối)

Khi gửi nhiệm vụ cần có `Gate-ID`, tiêu chí nghiệm thu, version artifact, bằng chứng, trạng thái và nhóm nhận. Mẫu đầy đủ xem `MASTER-STATUS.md` v2 mục 8. Các dòng handoff khởi tạo ở trên **chưa được gửi**, không tạo ra nhiệm vụ tự động.

## Ghi nhan phan cong tren GitHub – 2026-11-06

- Da tao 14 GitHub Issues (#32–#45) tuong ung 14 nhom; xem [huong-dan-phan-cong.md](huong-dan-phan-cong.md).
- Chua gui tu dong phieu ban giao vao cuoc tro chuyen ChatGPT nao; cac handoff du kien van chua duoc tiep nhan.
- Viec nhan viec can phieu HANDOFF co bang chung, chu khong phai suy dien tu Issue da tao.


## Dot phan cong 2026-11-06 – chua co phieu tiep nhan

- [Bang giao viec](bang-giao-viec-20261106.md) phan 9 nhom du dieu kien bat dau thiet ke/kiem ke va 5 nhom chi chuan bi.
- 14/14 Issues #32–#45 dang OPEN, khong assignee, khong binh luan xac nhan nhan viec tai thoi diem doi chieu.
- Nhom 01 dang dieu phoi trong chat; khong dung thong tin nay lam bang chung cac nhom 02–14 da nhan viec.
- **Dieu kien chuyen CHUA XAC NHAN -> DA TIEP NHAN:** co phan hoi tu nhom/agent/nguoi duoc giao, dinh kem issue, artifact, pham vi va thoi diem. Neu khong, giu PROPOSED.
- Khong tu dong cap nhat GitHub Issues sau khi nhan ket qua o mot cuoc tro chuyen khac; can thao tac co quyen rieng.

## Tình trạng nhận việc sau khi kiểm tra Issues – 2026-11-06

- Nhóm 01 đã cập nhật điều phối và bảng giao việc trên nhánh tài liệu; đây là hoạt động trong cuộc trò chuyện hiện tại.
- GitHub Issues #32–#45 đã được cập nhật về mức độ sẵn sàng; chưa có xác nhận 13 nhóm còn lại đã nhận việc hoặc bắt đầu triển khai.
- **Sẵn sàng thiết kế:** 01, 02, 03, 06, 07, 08, 10, 13, 14.
- **Chờ contract trước tích hợp:** 04, 05, 09, 11, 12.
- Chi tiết, phụ thuộc và việc đầu tiên: [bang-giao-viec-20261106.md](bang-giao-viec-20261106.md).
- Chưa được coi là bàn giao hợp lệ nếu không có xác nhận tiếp nhận, artifact, bằng chứng và `Handoff-ID`. Không tự gửi tin nhắn sang các cuộc trò chuyện khác.


> **Quyền đang áp dụng 2026-11-06:** Tài liệu này tuân thủ [quy chế thực thi](quy-che-thuc-thi.md): được trực tiếp sửa GitHub/`main`, chạy Actions/CI/APK/E2E và deploy theo nhiệm vụ; SQL cần xác minh môi trường và migration; giao dịch tiền thật cần xác nhận riêng từng giao dịch. Phần lịch sử không thay thế bằng chứng thực tế.

## Hang doi handoff Dot 1 -> Dot 2 (2026-11-06)

| ID | Tu -> Den | Noi dung | Trang thai |
|---|---|---|---|
| HO-2-10-02 | 10 -> 02 | PRD MVP va validation transfer -> OpenAPI | PROPOSED / chua ACK |
| HO-2-02-06 | 02 -> 06 | Auth/session boundary -> threat/RBAC | PROPOSED / chua ACK |
| HO-2-02-07-08 | 02 -> 07/08 | API+schema+atomic transfer two-pass | PROPOSED / chua ACK |
| HO-2-07-13 | 07 -> 13 | Unified diff A3.6 khi co -> SQL static review | BLOCKED / chua co final diff |
| HO-2-08-13 | 08 -> 13 | Idempotency + concurrency scenarios | PROPOSED / chua ACK |
| HO-2-03-04-05 | 03 -> 04/05 | Design tokens va UI states | PROPOSED / chua ACK |
| HO-2-13-14 | 13 -> 14 | QA release gates -> CI | PROPOSED / chua ACK |

9 bản chuyên môn trong [dot-1/](dot-1/) là artifact nguồn do nhóm điều phối soạn. Handoff chỉ xác nhận khi có người nhận, artifact/version, kết quả review; tạo Issue không làm chatbot khác tự khởi chạy. Xem [đề xuất Đợt 2](de-xuat-dot-2.md).

## Phiếu bàn giao dự thảo Đợt 1 — 2026-11-06
| ID | Bên gửi → nhận | Tài liệu | Tiếp nhận |
|---|---|---|---|
| NB-D1-01 | 01→10/02 | [Điều phối](dot-1/01-dieu-phoi.md) | ACK PENDING |
| NB-D1-02 | 10→02/06/08 | [MVP](dot-1/10-nghiep-vu-mvp.md) | ACK PENDING |
| NB-D1-03 | 02→06/07/08 | [API](dot-1/02-kien-truc-api-v1.md) | ACK PENDING |
| NB-D1-04 | 06→07/08/13 | [RBAC](dot-1/06-bao-mat-rbac.md) | ACK PENDING |
| NB-D1-05 | 07→08/13 | [SQL A3.6](dot-1/07-sql-v21-a36.md) | ACK PENDING; diff chưa hoàn tất |
| NB-D1-06 | 08→07/13 | [Idempotency](dot-1/08-transfer-idempotency.md) | ACK PENDING |
| NB-D1-07 | 13→07/08/14 | [QA](dot-1/13-qa-test-matrix.md) | ACK PENDING, tests NOT RUN |
| NB-D1-08 | 03→04/05 | [UI](dot-1/03-design-system.md) | ACK PENDING |
| NB-D1-09 | 14→01/05/13 | [CI](dot-1/14-ci-inventory.md) | ACK PENDING |
Đây là phiếu chuyển giao do Nhóm 01 đề xuất, không phải đã có xác nhận của nhóm nhận; xem [Đợt 2](de-xuat-dot-2.md).

## HO-D1-R2-20261106 — phản biện và kiểm chứng thực tế trong phiên

- Bên thực hiện: agent chính điều phối; hai agent phụ `ra_soat_thiet_ke` và `kiem_ke_ci` nhận task cụ thể trong phiên, có báo cáo trả về. Đây không phải ACK của các nhóm logic02–14 trên GitHub.
- Nguồn: runtime/workflow `b6499a3afc2533eb3564c58c50675c4fde9a3cb6`; tiếp main `3d05f6e` chỉ thêm24 dòng tài liệu. Artifact: [kết quả](ket-qua-dot-1-20261106.md), [phản biện độc lập](bang-chung-20261106/phan-bien-thiet-ke.md), [mã thoát](bang-chung-20261106/test-status.json).
- Kiểm chứng:86 test local đạt, build Pages đạt; không có SQL/concurrency/E2E/nativeAPK/Production trong phiên. Không gọi gate PASS từ số test này.
- Gửi theo tài liệu: đề xuất02/06/07/08/13 nhận D2-01..06 và03/14 nhận phần độc lập,04/05/09/11/12 chỉ bản sơ bộ. **ACK nhóm nhận vẫn PENDING**, không tự gửi tin nhắn sang các cuộc trò chuyện khác.
- Điều kiện nhận: source version, artifact, reviewer, quyết định contract, blocker và gate tương ứng. Sự có mặt của tài liệu trên main không đồng nghĩa đã tiếp nhận/đã vận hành.

## HO-TAKEOVER-20261106 — chủrepository giao Nhóm01 tiếp quản14Issues

- Đầu vào: main7192af6; yêu cầu trực tiếp tự động theo4đợt trong phiên. Nhóm01 nhận scope điều phối/triển khai, không suy ra14GitHubassignee đã nhận.
- Artifact: [bảng tiếp quản](tiep-quan-14-issues.md), [báo cáo](bao-cao-tiep-quan-20261106.md), OpenAPI/fixture/candidateSQL/permissioncontract tại dot-2a, nghiêncứu09/11/12 tại dot-2c.
- Kiểm chứng:114localtests/41fixtures,43productionE2E/8skip, Pagesbuild vàsyntax; [sourcechecksum/log](bang-chung-tiep-quan-20261106/).
- Tiếp nhận GitHub: BLOCKED RESTForbidden;14update draft đã tạo, chưa ghiIssues. Auth/DB/ledger/GATEprovenance và nghiệmthurelease còn thiếu.
- KhôngSQL/migration/provider/giao dịch thật/deploy. Không giữ trạng thái dự án PROPOSED như thể chưa làm gì, cũng không chuyển toànscope thành VERIFIED từ các artifact đã có.


## NB-NT-D1-20261106 — bàn giao nghiệm thu có phiên bản

- **Bên lập:** Nhóm 01 trong cuộc trò chuyện hiện tại; **bên nhận dự kiến:** 10/02/06/07/08/13, song song 03/14.
- **Nguồn kiểm tra:** `7192af6c28b51b56806b0b9c6827d2d0604bbc8a` trên main; 14 Issues đọc trực tiếp gồm body và toàn bộ comments (đều rỗng tại snapshot trước cập nhật). Không có assignee; không suy diễn ACK từ hoạt động của Nhóm 01.
- **Artifact:** [báo cáo nghiệm thu](nghiem-thu-dot-1-20261106.md), [snapshot và runtime manifest](bang-chung-nghiem-thu-dot-1-20261106/doi-chieu.json); bản sửa nằm trong cùng commit chứa phiếu này.
- **Đã xác minh:** source/blob SQL v2; 62 tệp local khớp runtime nguồn; local build/backend15/APK config1; log CI của nguồn có unit70/backend15/E2E43 đạt,8 skipped.
- **Chưa xác minh:** gate thiết kế, SQL A3.6, ledger/concurrency, E2E local, thiết bị/APK native. Vitest local lỗi loopback; lượt xin chạy lại không được thực thi do auto-review hết hạn mức.
- **Trạng thái:** ARTIFACT READY / ACK PENDING / REVIEW PENDING. Các phiếu dưới đây là hàng đợi bàn giao, không phải thông báo đã gửi hoặc nhóm đã nhận.

| Handoff-ID | Từ → nhận dự kiến | Artifact đầu vào tại source commit ở trên | Việc / điều kiện nhận |
| --- | --- | --- | --- |
| NB-NT-D1-10 | 01→10/02 | dot-1/10-nghiep-vu-mvp.md | D2-01, owner review scope/fee/min-max/retention |
| NB-NT-D1-02 | 10→02/06 | dot-1/02-kien-truc-api-v1.md | D2-02, field/error/auth contract có version |
| NB-NT-D1-06 | 02→06/07/08/13 | dot-1/06-bao-mat-rbac.md | D2-03, principal/session/endpoint permission review |
| NB-NT-D1-07 | 06→07/08/13 | dot-1/07-sql-v21-a36.md | D2-04, final unified diff + gate-definition provenance |
| NB-NT-D1-08 | 07↔08→13 | dot-1/08-transfer-idempotency.md | D2-05, ledger/hash/replay/rollback hai vòng |
| NB-NT-D1-13 | 07/08→13/14 | dot-1/13-qa-test-matrix.md | D2-06, review độc lập + runner/preflight/evidence |
| NB-NT-D1-03 | 03→04/05/13 | dot-1/03-design-system.md | Token mapping/45 tiêu chí, UX review riêng |
| NB-NT-D1-14 | 14→01/13 | dot-1/14-ci-inventory.md | Run/SHA/log/artifact; không suy gate từ CI xanh |

**Đóng handoff:** người/agent nhận ACK có danh tính, phạm vi, source version và thời điểm; reviewer ghi kết quả trên đúng artifact. Sửa Issue trong lượt nghiệm thu chỉ cập nhật hồ sơ, không đại diện nhóm nhận ACK.
## HO-2A-13-01 / HO-2A-13-14 — 2026-11-06

Nhóm 13 đã tiếp quản Issue #44 theo lệnh người dùng. Bàn giao 01 (#32) và 14 (#45): [matrix, GATE, blockers và criteria](dot-2a/13-kiem-thu-nen-tang.md), [metadata/log](dot-2a/bang-chung-nhom-13/ket-qua.json), suite `backend/tests/nen-tang-doc-lap.test.mjs`. Baseline main `7192af6c28b51b56806b0b9c6827d2d0604bbc8a`; commit chứa phiếu này là version bàn giao, link SHA cụ thể gửi trong Issues sau push. Backend 25/25; unit 70/70; build exit 0; E2E 43 PASS/8 skip chủ ý sau sửa đường dẫn browser local. SQL/ledger concurrency/crash recovery NOT RUN; ARCH-01/SEC-01/DB-01/TX-01/QA-01/OPS-01 BLOCKED nghiệm thu nền tảng. B01 môi trường, B02 thiếu runtime, B03 thiếu SQL reviewed, B04 ledger/contract mở. ACK nhóm nhận PENDING; Issue giữ OPEN. Không tuyên bố gửi vào cuộc trò chuyện ChatGPT khác.


## Cập nhật xác minh ngày 07/11/2026 (Asia/Saigon)

Đã đọc [báo cáo Nhóm 13 Đợt 2A](dot-2a/13-kiem-thu-nen-tang.md): unit 70/70, backend 25/25, build PASS, E2E 43 PASS/8 skip; SQL và native APK NOT RUN. Đây là số liệu trong báo cáo QA đã nhận, không phải test chạy lại của Nhóm 14. ARCH-01/SEC-01/DB-01/TX-01/QA-01/OPS-01 vẫn BLOCKED theo quyết định QA. ACK nhận hiện vật HO-2A-13-14: đã đọc; ACK này không chấp thuận release.

Đính chính giới hạn truy vấn CI ở bản đầu: fetch_commit_workflow_runs chỉ lọc run do pull_request, nên kết quả rỗng không chứng minh thiếu CI push. Truy vấn REST actions/runs theo head_sha đã xác minh main 295eff3811bc5654aaf6677a226eba7b4d0dd4d7 có Verify success [42196968950](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42196968950) và Pages workflow success [42196968799](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42196968799). Baseline 7192af6 cũng có Verify success 42194370164 và Pages workflow success 42194370353. Workflow success không tự chứng minh deploy job chạy hoặc gate bảo mật/thiết bị thật đạt.

Quyết định Đợt 4 vẫn PARTIAL: tài liệu được cập nhật; ứng dụng mới BLOCKED. Không tạo tag/version, APK, checksum hoặc URL phát hành mới. Giữ package 1.0.1; artifact lịch sử không được nhận làm release mới. Tiếp theo: owner 13 cung cấp nghiệm thu cuối đúng phạm vi; 01/14 khóa version/changelog; 14 baseline rollback và environment; 05/14 artifact/signature/icon/package/version/device. Tham chiếu [bàn giao chi tiết](ban-giao-dot-4-20261106.md).

## HO-TAKEOVER-MERGE-20261107 — giữ kết quả đồng thời

Đã đọc và tiếp nhận hiện vật HO-2A-13-01/14 (69f2d46) và báo cáo Đợt4 trênmainba22b0d. Giữ10HTTPtests mới và trạng thái releaseBLOCKED. Merge ởf72ca1b không ghi đè main. Backend48/48 và contract5/5 sau merge; tổng124localtests,41fixture; log có namespace riêng. Tiếp nhận hiện vật không là phê duyệt SQL hoặc release. SnapshotIssues hiện có comment32/35/44/45,14assignee vẫn rỗng; APIghi của phiên nàyForbidden. [Báo cáo](bao-cao-tiep-quan-20261106.md).



## HO-D3-01-20261107 — kiểm chứng tích hợp tổng thể

Nhóm01 ACK đã đọc/nhận HO-2A-13-01 và HO-2A-13-14; không chấp thuận release. Nguồn `main@ba22b0dc5de7b14553036a19b240390025713c52`; [báo cáo](ket-qua-dot-3-20261107.md) có tám gate,11 thành phần, D3-01..09, owner/Issue, acceptance và bằng chứng. CI SHA295eff3 xác minh unit70/backend25/build/E2E43 đạt,8 skipped; SQL/Auth app/ledger/concurrency/APK tích hợp vẫn chưa nghiệm thu. Đợt3 BLOCKED. Gửi công việc qua Issues #32–45; ACK riêng của bên nhận còn chờ, không gửi lệnh sang các cuộc trò chuyện khác. Quyền ghi main và chạy kiểm thử theo yêu cầu hiện hành; không chạy migration chưa review hoặc giao dịch thật.
## NB-D2B-03 — 06/11/2026 — Nhóm 03 → 04/05/11/13

Tiếp quản Issue #34 theo yêu cầu trực tiếp trong phiên. Nguồn main `7192af6`, phiên bản triển khai truy bằng `git log -1 --format=%H -- frontend/src/he-thiet-ke.css`. Artifact: [tokens/component specification](../he-thiet-ke.md), [45 tiêu chí](../ui-acceptance.md), [bằng chứng](../bang-chung/dot-2b/). Đã chuẩn bị CSS dùng chung và test contract, giữ nghiệp vụ mô phỏng. Trạng thái nhận: ACK PENDING; không gửi tin nhắn/khẳng định các nhóm đã nhận. UX-01 chưa nghiệm thu toàn bộ: thiết bị thật, bàn phím ảo, hiệu năng và heap cần Nhóm 13 xác minh; API/PRD vẫn cần nhóm 02/10 chốt trước tích hợp.

Kết quả NB-D2B-03 chốt 07/11/2026 Asia/Saigon: unit70/70; build đạt; E2E42 đạt/1 timeout/8 bỏ qua, ca Android chạy riêng lại1/1 đạt; UI cuối5/5. UX-01 IMPLEMENTED / PARTIALLY VERIFIED, chưa PASS toàn bộ. Chi tiết và giới hạn theo ui-acceptance; không xác nhận ACK thay bên nhận.
