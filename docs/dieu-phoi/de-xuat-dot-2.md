# NhTBank - De xuat Dot 2 (sau tai lieu Dot 1)

> Cap nhat 2026-11-06. **BAN DE XUAT** cho trung tam dieu phoi. Dot 1 da co 9 tai lieu nghien cuu/thiet ke tren `main`; khong suy dien 9 nhom AI da tu nhan viec, API da ton tai, SQL da chay hay gate da PASS.

## 1. Dau vao duoc doi chieu

- Source ung dung: React 18/Vite SPA; demo balance/transaction trong React memory, PIN demo chi la mo phong.
- Backend: SePay Test Mode gateway (noi bo/read-only), webhook dung 503 khi chua co persistence; chua co server transfer/ledger duoc chung minh.
- SQL v2: `docs/sql-drafts/archive/v2` tren `main`, core SHA `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`, assertion SHA `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`. A3.6 moi co hunk plan, chua co unified diff cuoi, SQL NOT RUN.
- 14 Issues #32-45 OPEN, 0 GitHub assignee, 0 comment nhan viec o lan doi chieu truoc. Khong doi sang IN PROGRESS/VERIFIED vi tao ban nhap.
- CI co run thanh cong trong lich su cho commit `ce3fb3e`; khong thay the SQL/concurrency/APK E2E tren thiet bi.

## 2. Dau ra Dot 1 (9 ban nhap)

| Nhom | Issue | Tai lieu tren main | Tiep nhan |
|---|---|---|---|
| 01 | [#32](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/32) | [01-dieu-phoi.md](dot-1/01-dieu-phoi.md) | DRAFT / Nhóm 01 đang điều phối trong chat; không đại diện ACK nhóm khác |
| 10 | [#41](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/41) | [10-nghiep-vu-phien-ban-dau.md](dot-1/10-nghiep-vu-phien-ban-dau.md) | DRAFT / chưa có tiếp nhận |
| 02 | [#33](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/33) | [02-kien-truc-api-v1.md](dot-1/02-kien-truc-api-v1.md) | DRAFT / chưa có tiếp nhận |
| 06 | [#37](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/37) | [06-bao-mat-rbac.md](dot-1/06-bao-mat-rbac.md) | DRAFT / chưa có tiếp nhận |
| 07 | [#38](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/38) | [07-sql-v21-a36.md](dot-1/07-sql-v21-a36.md) | DRAFT / chưa có tiếp nhận |
| 08 | [#39](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/39) | [08-chong-trung-chuyen-tien.md](dot-1/08-chong-trung-chuyen-tien.md) | DRAFT / chưa có tiếp nhận |
| 13 | [#44](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/44) | [13-ma-tran-kiem-thu.md](dot-1/13-ma-tran-kiem-thu.md) | DRAFT / chưa có tiếp nhận |
| 03 | [#34](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/34) | [03-he-thiet-ke.md](dot-1/03-he-thiet-ke.md) | DRAFT / chưa có tiếp nhận |
| 14 | [#45](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/45) | [14-kiem-ke-quy-trinh-kiem-thu.md](dot-1/14-kiem-ke-quy-trinh-kiem-thu.md) | DRAFT / chưa có tiếp nhận |

## 3. Dot 2A - Chot hop dong nen tang P0

| Thu tu | Nhom | Cong viec giao tiep theo | Phu thuoc | Tieu chi nghiem thu thiet ke |
|---|---|---|---|---|
| 1 | 01 + 10 | Chot scope MVP va quy tac transfer sandbox, retention, fee demo, preview status | Draft Nhom 10 | PRD v1 co owner review + COORD-01 |
| 2 | 02 | OpenAPI v1 va versioned field/error/auth contract; phan biet endpoints proposed va implemented | PRD 10 + inventory repo | ARCH-01 co backend + QA review |
| 3 | 06 | AuthN/AuthZ, session, RBAC app va principal trust boundary, service_role separation | 02 API + 10 rules | SEC-01 threat matrix, 13 review |
| 4 | 07 <-> 08 | Vong 1: schema/ACL + atomic transfer/idempotency; Vong 2: doi chieu ledger state, audit, retry/concurrency, khong de 2 ben cho nhau | 02/06 + 07 SQL v2 | DB-01 final diff reviewed va TX-01 backend contract reviewed |
| 5 | 13 | Phan bien doc lap SQL/PG17 MAINTAIN/column ACL/default ACL, AuthZ va concurrency; xac dinh runner local an toan | 06/07/08 ban du thao | QA-01 test matrix + evidence criteria, test NOT RUN neu chua chay |

**Cac quyet dinh bat buoc truoc khi code backend:** (a) ai la trusted principal, (b) database ledger so du va atomicity, (c) idempotency key scope/hash and replay storage, (d) session/role server-side, (e) TTL/cleanup, (f) rollback/backup va isolated development DB.

## 4. Dot 2B - Giao dien & kiem thu/build song song

| Nhom | Duoc lam ngay | Chi mo tich hop/release khi | Ban giao |
|---|---|---|---|
| 03 (#34) | Hoan thien CSS token mapping tu source, 45 tieu chi UI, focus/motion/mobile states | UX-01 review, test responsive/a11y co bang chung | 04, 05, 11, 13 |
| 14 (#45) | Kiem ke triggers: verify-main-integration, deploy-pages, APK path filter; doc logs va phan biet Vitest vs test backend rieng | QA-01 va environment/rollback checklist | 05, 13, 01 |
| 04 (#35) | Kiem ke UI Website, sitemap va mock component states | ARCH-01, SEC-01, UX-01; API contract duoc chot | 13 |
| 05 (#36) | Android screen flow, demo version/logo spec va APK workflow audit | ARCH-01/SEC-01, QA CI; artifact SHA/version verified neu build | 13, 14 |

## 5. Dot 2C - Nhom cho contract va tich hop mo rong

- 09 (#40): SePay TEST MODE docs/webhook schema; khong su dung Live. Chi tich hop sau khi 06/07/08 chot source authentication, durable inbox, replay, idempotency, errors; phan biet sandbox and real payments.
- 11 (#42): Admin site map + RBAC mock truoc, backend integration sau 03 design tokens + 06 rights + 08 protected admin API.
- 12 (#43): AI read-only intents/help + eval plan truoc, data/tool access sau khi 06 permissions, 08 API, 10 business rules duoc review; khong cap AI quyen chuyen tien.
- 04/05/09/11/12 khong bi cam nghien cuu, chi CHO CONTRACT TRUOC TICH HOP. Khong duoc coi UI prototype la service da van hanh.

## 6. Release gates va phuong an kiem chung

1. **COORD-01:** PRD MVP co owner; handoff ID va source version.
2. **ARCH-01:** API contract versioned, error status, authentication va data isolation duoc review.
3. **SEC-01:** RBAC, threat model, principal spoof/IDOR, secret redaction co reviewer doc lap.
4. **DB-01:** final A3.6 unified diff 2 file, PostgreSQL 17 MAINTAIN, column/sequence/function/default ACL, RLS, audit, SET ROLE; khong dung v3 runner cho v2.
5. **TX-01:** backend atomic ledger + request replay co test scenarios hash conflict, 10 simultaneous requests, crash/retry. Schema imported TEST data v2 khong duoc xem la internal transfer ledger.
6. **QA-01:** test matrix PASS/FAIL/BLOCKED/NOT RUN va source log; khong tu chuyen gate PASS khi chua co run.
7. **UX-01:** 45 tieu chi UI/UX + Android focus/keyboard/motion; khong tu khai da kiem tra tren thiet bi.
8. **OPS-01:** workflow trigger, environment/secret guard, artifact SHA256/version/icon va rollback, budget; Pages/Actions auto-trigger tu push main duoc theo doi.

## 7. Quy tac thuc thi va khong vuot gate

- Theo [quy-che-thuc-thi.md](quy-che-thuc-thi.md) co the sua `main`, GitHub Issues, CI/test/APK/E2E, deploy theo nhiem vu va preflight; khong can xin lai moi thao tac thuong quy.
- Viec cap quyen khong bien SQL v2.1 con la draft thanh migration duoc phe duyet. Truoc SQL: xac minh local disposable/DB identity, backup, review va plan recovery.
- Tien that: khong co lenh giao dich cu the/beneficiary/amount/xac nhan; khong thuc hien. Khong dua credentials that len repo cong khai.
- Phan cong GitHub Issues khong gui truc tiep tin nhan sang 14 cuoc tro chuyen. Trang thai DA TIEP NHAN chi co khi co assent co bang chung.

## 8. Handoff Dot 2

- HO-2-10-02: PRD MVP -> API v1; HO-2-02-06: Auth boundary -> threat review;
- HO-2-02-07-08: API/schema/transfer v1; HO-2-07-13: diff A3.6 -> SQL QA;
- HO-2-08-13: idempotency/concurrency contract -> QA; HO-2-03-04-05: design tokens -> Web/Mobile;
- HO-2-13-14: release gates -> CI; HO-2-14-01: CI/build/artifact evidence -> MASTER-STATUS.

**Chot de xuat:** bat dau 2A theo chuoi 10 -> 02 -> 06 -> 07 <-> 08 -> 13; duy tri 03/14 song song; 04/05/09/11/12 chuan bi trong khi cho gate. Trang thai DOT 2: PROPOSED, chua chay SQL/concurrency/APK trong dot dieu phoi nay.

## 9. Cap nhat khi thuc hien Dot 1 va CI tren main — 2026-11-06

- Cac tai lieu Dot 1 da duoc luu trong `docs/dieu-phoi/dot-1/`; day la ban nhap duoc tao tai GitHub, chua co xac nhan 14 AI agent hoat dong.
- **Thay doi CI da thuc hien:** [commit 7f14b3e](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/commit/7f14b3ead1a84e209886a72ae5f4f4b75501492f) them buoc `npm run test:backend` vao `verify-main-integration.yml`. Source `package.json` da co script `node --test backend/tests/*.test.mjs`.
- **Evidence cho Dot 2B:** [GitHub Actions run 42192443494](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42192443494), chua danh dau PASS cho backend test cho den khi run hoan thanh va kiem tra steps/log.
- **Dot 2A van bi chan:** SQL draft v2.1 chua co unified diff reviewed va local SQL preflight; Auth server va transfer backend chua duoc trien khai; khong duoc dao nguoc gate.
- **Nhan viec:** Nhom 01 dieu phoi, Issues #32–45 de theo doi; trang thai DA TIEP NHAN phai co nguoi/agent va ack/commit artifact cu the. Doc file nay khong tu dong kich hoat cac cuoc tro chuyen.

## 10. Cập nhật sau thực hiện và phản biện Đợt 1 — 06/11/2026

Đợt 1 đã có9 bản thảo trước phiên này. Lượt này kiểm chứng lại14 Issues (OPEN, assignee rỗng, timeline không có phản hồi),2 blob SQL v2, kiểm kê token/CSS và workflow, bổ sung5 nhóm sơ bộ tại [bản nghiên cứu](dot-1/so-bo-nhom-cho-contract.md). Agent phụ đã thực hiện phản biện thiết kế và kiểm kê CI trong phiên hiện tại; **không phải14 nhóm logic đã tiếp nhận Issue**. [Báo cáo thực hiện](ket-qua-dot-1-20261106.md) và [log](bang-chung-20261106/) là nguồn kết quả.

### 2A — Việc cần chốt sau phản biện

| ID | Việc tiếp theo / bên phụ trách đề xuất | Đã làm ở Đợt1 | Điều kiện đóng / trạng thái |
| --- | --- | --- | --- |
| D2-01 | 01/10: PRD v1, fee/retention/replay horizon | Đối chiếu MVP demo và acceptance | Owner review; các giá trị còn thiếu chưa tự đặt → CHƯA CHỐT |
| D2-02 | 02/08/13: error/field-level OpenAPI v1 | Thống nhất bản nháp409 `IDEMPOTENCY_KEY_REUSED`; ghi phạm vi hash/amount VNĐ ở08 | Schema máy đọc được +fixtures lỗi, pagination, session/confirmation và QA review → CÒN MỞ |
| D2-03 | 06/07/11: role/permission mapping | Tách customer/user alias, auditor chưa có enum và service_role hạ tầng | Ma trận deny-by-default từng endpoint, source claim và reviewer → CÒN MỞ |
| D2-04 | 07↔08: schema transfer và replay | Tách PROCESSING/started, COMPLETED/completed; làm rõ v2 import không là ledger; retry đọc receipt trước balance mới | Hai vòng:07 schema draft →08 ledger/lock/hash/replay →06/13 review; failed/TTL/cleanup còn mở |
| D2-05 | 07/13: A3.6 và truy nguyên GATE | Blob v2 khớp; đánh dấu GATE01–10 là mapping đề xuất chưa có definition gốc | Final unified diff, provenance gate/version và runner v2 an toàn; DB-01 BỊ CHẶN nghiệm thu, SQL CHƯA CHẠY |
| D2-06 | 13/14: evidence gates |86 local tests đạt, build Pages đạt,6 YAML/34shell blocks syntax đạt | Không thay SQL/concurrency/E2E runtime; trace mới gắn đúng SHA/run/môi trường |

### 2B — Phần độc lập được tiếp tục

- 03: mapping token nguồn đã ghi; bước sau hợp nhất từng token có task UI và acceptance riêng, không đổi hệ màu theo bảng nháp chưa review.
- 14: đã sửa inventory cũ; backend security test **đã có trên main**, không áp lại. Chỉ sửa workflow khi có lỗi/task cụ thể. APK production-assets E2E là cải tiến đề xuất, chưa chạy build mới.
- 04/05: bản sơ bộ sitemap/screen states sẵn để review; phạm vi hiện tại vẫn chỉ sơ bộ theo yêu cầu này. Mở tích hợp sau ARCH/SEC/UX có acceptance, không đợi mọi gate để nghiên cứu.

### 2C — Contract trước tích hợp mở rộng

09 Test Mode/durable ACK;11 admin scoped RBAC;12 AI read-only intents: có skeleton nghiên cứu tại bản sơ bộ, chưa có server/provider tích hợp. Không chọn thông số phí/retention/nhà cung cấp thay chủ sản phẩm. Không cấp quyền chuyển tiền thật hay kích hoạt dịch vụ có phí.

**Trạng thái hiện hành:** Đợt1 nghiên cứu và local verification đã thực hiện trong phạm vi trên; Đợt2 là đề xuất cụ thể chờ chốt contract, không tuyên bố các gate runtime đã đạt.

## 11. Đầu vào nghiệm thu để bắt đầu 2A — 2026-11-06

[Báo cáo nghiệm thu Đợt 1](nghiem-thu-dot-1-20261106.md) thay snapshot cũ làm điểm tra cứu hiện hành. D2-01..06 tiếp tục là danh sách công việc; không tạo lại bản nháp và không coi cập nhật Issues là nhóm đã nhận.

- D1-P0-01 → D2-01..03: review PRD/OpenAPI/permission/session trước tích hợp API.
- D1-P0-02 → D2-04..05: ledger riêng, canonical hash, replay trước balance mới, crash/atomicity/retention; import SQL v2 không là ledger.
- D1-P0-03 → D2-04 + D2-06: final A3.6 diff, nguồn định nghĩa gate, reviewer và target PostgreSQL17 disposable.
- D1-P0-04 → D2-06: log SQL/AuthZ/10 connection/crash/retry trên đúng version; CI ứng dụng hiện có không thay bằng chứng này.

Nguồn ứng dụng `7192af6` có CI unit70/backend15/E2E43 đạt,8 skipped; chưa phải gate thiết kế PASS. Các tệp sửa trong nghiệm thu vẫn là bản nháp cần review. Các lựa chọn tiếp tục: **A** chốt contract D2-01..03 trước (khuyến nghị); **B** rà final diff A3.6 độc lập, giữ tích hợp khóa cho đến khi các contract đủ.
