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
| 01 | [#32](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/32) | [01-dieu-phoi.md](dot-1/01-dieu-phoi.md) | DRAFT / chưa có tiếp nhận |
| 10 | [#41](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/41) | [10-nghiep-vu-mvp.md](dot-1/10-nghiep-vu-mvp.md) | DRAFT / chưa có tiếp nhận |
| 02 | [#33](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/33) | [02-kien-truc-api-v1.md](dot-1/02-kien-truc-api-v1.md) | DRAFT / chưa có tiếp nhận |
| 06 | [#37](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/37) | [06-bao-mat-rbac.md](dot-1/06-bao-mat-rbac.md) | DRAFT / chưa có tiếp nhận |
| 07 | [#38](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/38) | [07-sql-v21-a36.md](dot-1/07-sql-v21-a36.md) | DRAFT / chưa có tiếp nhận |
| 08 | [#39](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/39) | [08-transfer-idempotency.md](dot-1/08-transfer-idempotency.md) | DRAFT / chưa có tiếp nhận |
| 13 | [#44](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/44) | [13-qa-test-matrix.md](dot-1/13-qa-test-matrix.md) | DRAFT / chưa có tiếp nhận |
| 03 | [#34](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/34) | [03-design-system.md](dot-1/03-design-system.md) | DRAFT / chưa có tiếp nhận |
| 14 | [#45](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/45) | [14-ci-inventory.md](dot-1/14-ci-inventory.md) | DRAFT / chưa có tiếp nhận |

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
