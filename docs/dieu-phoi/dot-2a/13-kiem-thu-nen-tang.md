# Nhóm 13 — Đợt 2A: kiểm thử nền tảng v1

> Cập nhật 07/11/2026: xem [kết quả r2](13-kiem-thu-nen-tang-r2.md). SQL v2.1 đã có 31 bước kiểm chứng trên PostgreSQL 17.11 disposable, gồm 10 kết nối unique primitive; thêm golden hash và Auth/RBAC module tests. Các kết luận NOT RUN bên dưới là snapshot r1, không phải trạng thái hiện hành của gói v2.1. Nghiệm thu nền tảng tích hợp vẫn BLOCKED.

Ngày: 2026-11-06. Issue [#44](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/44). Tiếp nhận bởi Codex trong phiên người dùng giao nhiệm vụ; không gán GitHub assignee hoặc tự đóng Issue.

## Nguồn và phạm vi bằng chứng

Trong lúc thực hiện, main có thêm commit `8b9c3ba629fb6db217f0cd720d7b1d3639ca775a` (chỉ tài liệu điều phối). Đã đọc diff 02/08, đối chiếu báo cáo nghiệm thu Đợt 1 và hợp nhất giữ cả hai phiếu HANDOFF; mã runtime/SQL/test baseline không đổi. Kết quả runtime vẫn truy nguyên baseline bên dưới; không dùng CI của Nhóm 01 thay log tự chạy. Diff whitespace trong raw logs được giữ nguyên để bảo toàn hash bằng chứng.

- Baseline `main`: `7192af6c28b51b56806b0b9c6827d2d0604bbc8a`; nhánh thực hiện `kiem-thu/nhom-13-dot-2a`. Commit chứa báo cáo và log là commit bàn giao; nguồn gateway không đổi so với baseline.
- Đã đọc lại [02](../dot-1/02-kien-truc-api-v1.md), [06](../dot-1/06-bao-mat-rbac.md), [07](../dot-1/07-sql-v21-a36.md), [08](../dot-1/08-chong-trung-chuyen-tien.md), MASTER-STATUS, quy chế và đề xuất Đợt 2. Comments Issues #33/#37/#38/#39 rỗng tại lần đối chiếu. Tài liệu là draft, không phải kết quả chạy được chấp nhận.
- SQL đúng phiên bản: `archive/v2` core blob `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`, assertion blob `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`; đã đối chiếu `git hash-object`. Không dùng runner v3 cho v2.
- Kiểm toán kỹ thuật độc lập: tự đọc mã và tự chạy lại tests, bổ sung HTTP test riêng; không coi số PASS do nhóm viết mã báo cáo là bằng chứng. Đây không phải chứng nhận của tổ chức kiểm toán bên ngoài.
- PASS chỉ áp dụng cho tiêu chí đã chạy; FAIL là kiểm tra đã chạy và sai kỳ vọng; BLOCKED là thiếu điều kiện; NOT RUN là chưa chạy hoặc ngoài đợt này. Tách GATE điều phối và test ID.

## Kế hoạch và hiện vật

- [x] Định danh Issue, main, quy chế và đầu ra 02/06/07/08.
- [x] Đọc trực tiếp gateway và hai tệp SQL v2, lập matrix theo khả năng thực thi.
- [x] Chạy baseline, thêm [suite độc lập](../../../backend/tests/nen-tang-doc-lap.test.mjs), chạy backend/unit/build và E2E.
- [x] Lưu log, dữ liệu tổng hợp, blocker, tiêu chí nhận và phiếu bàn giao.
- [ ] Chạy SQL/concurrency/crash với ledger thật trên DB disposable: bị chặn bởi B01–B04 bên dưới.

## Ma trận kiểm thử và điều kiện nghiệm thu

Namespace mới `N13-*` v1, không thay thế GATE-01–10 lịch sử chưa truy nguyên. Các dòng BLOCKED có execution NOT RUN; không tạo test giả chỉ để tăng số PASS.

| Test ID | Tình huống / tiêu chí định lượng | Cách kiểm / dữ liệu cần lưu | Trạng thái |
| --- | --- | --- | --- |
| N13-AUTH-01 | Thiếu/sai bearer, tự khai admin/owner không đọc được dữ liệu; provider không được gọi | HTTP loopback, 3 request 401; suite độc lập | PASS |
| N13-SCOPE-01 | Query account/URL không đổi account đích cấu hình | HTTP + provider double, 1 call đúng sandbox/account fixture | PASS |
| N13-AUTH-02 | JWT sai chữ ký/issuer/audience, hết hạn, revoked session không tạo tác động | API traces 401 và DB before/after | BLOCKED B02 |
| N13-AUTH-03 | Session rotation/logout/recovery, rate limit và confirmation server | Token/session fixtures đã chốt, 401/429 theo contract | BLOCKED B02 |
| N13-RBAC-01 | A không đọc/ghi account/transfer B; không tự sửa owner/role/balance | Hai principal A/B; mỗi endpoint × hành động × tài nguyên; 403/404 theo contract; không lộ dữ liệu | BLOCKED B02 |
| N13-RBAC-02 | customer/support/operations/risk_analyst/admin không vượt quyền; service_role không là app role | Ma trận server deny-by-default; kiểm source claim và thuộc tính ghi | BLOCKED B02 |
| N13-SQL-01 | 7 bảng RLS bật, không client policy/grant trực tiếp; private không exposed | Catalog + cấu hình API; thực thi SET LOCAL ROLE anon/authenticated với dữ liệu A/B, không chỉ check catalog | BLOCKED B01/B03 |
| N13-SQL-02 | Exact table ACL gồm MAINTAIN, column ACL, grant option; deny client | aclexplode, pg_attribute.attacl, effective privilege và negative DML; đối chiếu matrix dưới | BLOCKED B01/B03 |
| N13-SQL-03 | Schema CREATE, role inheritance/SET ROLE không vượt ranh giới | pg_namespace ACL, pg_auth_members, pg_has_role trên PG17, thử SET ROLE và CREATE | BLOCKED B01/B03 |
| N13-SQL-04 | Sequence service chỉ USAGE+SELECT; function owner/search_path/EXECUTE chính xác | Catalog + probes; client denied; owner postgres hợp lệ không bị đánh trượt | BLOCKED B01/B03 |
| N13-SQL-05 | Global/per-schema default ACL không cấp quyền dư cho object mới | pg_default_acl; tạo table/sequence/function trong transaction disposable, đối chiếu grants và rollback | BLOCKED B01/B03 |
| N13-AUDIT-01 | UPDATE/DELETE/TRUNCATE không đổi audit | Owner trigger probes SQLSTATE 55000; service_role ACL probes 42501; so snapshot trước/sau | BLOCKED B01/B03 |
| N13-AUDIT-02 | Xóa auth actor không sửa lịch sử audit/không chặn lifecycle được chấp thuận | Actor tổng hợp không có account ràng buộc khác; xóa user, so audit snapshot | BLOCKED B01/B03 |
| N13-IDEM-01 | Cùng principal/scope/key/hash replay receipt cũ, kể cả balance đã hết | 2 requests + 1 business transfer + ledger cân bằng; resource_id/status cố định | BLOCKED B02/B04 |
| N13-IDEM-02 | Cùng key khác hash, kể cả đang processing → 409 IDEMPOTENCY_KEY_REUSED | Parallel trace + persisted result, không thêm debit | BLOCKED B02/B04 |
| N13-IDEM-03 | Hai principal hoặc hai scope dùng cùng key không nhận receipt của nhau | 4 namespace fixtures, quyền đọc độc lập | BLOCKED B02/B04 |
| N13-IDEM-04 | Canonical amount BIGINT/Unicode/whitespace/null/omitted đúng contract | Golden hash fixtures được 02/08 chốt; không tự đặt quy tắc | BLOCKED B04 |
| N13-TX-01 | 10 worker đồng thời cùng key/hash → đúng 1 transfer, 9 replay receipt | 10 kết nối DB độc lập, barrier, connection IDs, commit trace và count DB; Promise.all HTTP webhook không thay thế | BLOCKED B02/B04 |
| N13-TX-02 | Khác key cùng balance không chi quá số dư; opposite-direction lock không treo | Balance A=100000/B=0, 10 lệnh 20000; đúng 5 thành công, không âm, tổng 100000; ledger debit=credit; deadline theo contract | BLOCKED B02/B04 |
| N13-CRASH-01 | Kill worker sau claim/debit trước COMMIT → không partial posting, retry an toàn | Fault hook + SIGKILL worker, kiểm DB từ kết nối mới, retry cùng key | BLOCKED B02/B04 |
| N13-CRASH-02 | Kill sau COMMIT trước response → retry trả đúng receipt, không thêm transfer | Durable state trước/sau restart process + response loss trace | BLOCKED B02/B04 |
| N13-RETRY-02 | Deadlock/serialization/timeout được retry hữu hạn, cùng key và không duplicate | Inject SQLSTATE 40P01/40001, network loss; chính sách retry/deadline đã chốt | BLOCKED B02/B04 |
| N13-HMAC-01 | Timestamp ±300s nhận chữ ký, ±301s từ chối | 4 HTTP tests với clock cố định; 503/401 đúng nhánh | PASS |
| N13-HMAC-02 | Đổi raw bytes dù JSON tương đương phải invalid signature | Thêm whitespace, ký bytes cũ; 401 | PASS |
| N13-WH-01 | 10 webhook replay hợp lệ không ACK khi chưa persistence | 10 HTTP request đồng thời; tất cả 503 durable_webhook_storage_not_configured | PASS |
| N13-WH-02 | Retry sau tạo lại server vẫn không ACK khi chưa persistence | 2 server instances tuần tự, cùng event, cả hai 503 | PASS |
| N13-RETRY-01 | Upstream lỗi trả 502 không lộ lỗi, request sau có thể 200 | Inject provider failure rồi response hợp lệ; HTTP thực, upstream giả lập | PASS |
| N13-WH-03 | Durable inbox unique provider/event; replay/hash conflict/restart không posting kép; ACK sau COMMIT | DB count inbox=1, transfer≤1, crash trước/sau durable commit; payload đổi theo policy chốt | BLOCKED B02/B04 |
| N13-REG-01 | Unit/frontend/gateway hiện có | npm test, 70/70; backend 25/25 (15 cũ + 10 mới) | PASS |
| N13-REG-02 | Build web | npm run build exit 0; có cảnh báo chunk >500 kB | PASS |
| N13-REG-03 | E2E giao diện mô phỏng | Xem kết quả và log bên dưới; không chứng minh Auth backend | PASS 43; NOT RUN 8 skip chủ ý |
| N13-APK-01 | APK/native device/Production | Ngoài phạm vi kiểm thử nền tảng 2A; không có run mới | NOT RUN |

### Oracle ACL cho v2 để Nhóm 07/14 triển khai kiểm thử

| Đối tượng private | service_role table privilege kỳ vọng |
| --- | --- |
| profiles, sandbox_accounts, webhook_inbox, idempotency_keys | SELECT, INSERT, UPDATE |
| user_roles | SELECT, INSERT, DELETE |
| sandbox_transactions, audit_events | SELECT, INSERT |

Không có privilege table khác hoặc grant option; bao gồm kiểm tra phủ định MAINTAIN PG17. anon/authenticated/PUBLIC không được có table/column grant. Schema service_role chỉ USAGE, không CREATE; sequence audit chỉ USAGE/SELECT. Hai function trigger thuộc postgres, search_path rỗng, không cấp EXECUTE cho PUBLIC/client/service_role. Kiểm effective privileges và SET ROLE bên cạnh ACL trực tiếp; owner có quyền vốn có phải được phân biệt đúng. RLS owner/bypass không chứng minh isolation client; API trusted principal phải kiểm riêng.

## Preflight SQL bắt buộc — chưa đạt

1. Định danh local/disposable bằng process/container vừa tạo, port binding loopback, data directory/volume riêng và ID server-side; URL localhost đơn lẻ không đủ. Không nhận hosted/staging/Production.
2. Xác nhận `server_version_num >= 170000`, đúng PG17 mục tiêu; log version thực tế. Hiện không có psql/postgres và chưa đo được server version.
3. Xác nhận current_user/session_user, owner/CREATEROLE/SUPERUSER và role membership cần thiết; auth.users, anon/authenticated/service_role bootstrap đúng. Quyền chạy lệnh shell không là quyền DB.
4. Nhóm 07 cung cấp final unified diff A3.6 và bản được review; pin hash, không chạy archive/v2 chỉ vì có quyền chung. Không áp runner testing/ v3.
5. DB mới hoàn toàn; dữ liệu tổng hợp; ghi kế hoạch khôi phục bằng hủy/recreate đúng volume disposable. Core COMMIT riêng nên assertions ROLLBACK không hoàn tác schema; sequence increment cũng không rollback. Không hứa rollback toàn bộ chỉ vì có BEGIN.
6. Trước thực thi, kiểm cách cleanup bằng ID tài nguyên và xác minh snapshot/backup nếu có dữ liệu cần giữ; dùng ON_ERROR_STOP, timeout, log SQLSTATE, baseline/after snapshot. Không chạy migration nếu chưa đạt các bước trên.

Hiện SQL **NOT RUN**. Không có SQL DDL/DML hoặc probe kết nối nào đã được chạy trong đợt này. Docker CLI có mặt nhưng sandbox từ chối socket; không có DB được định danh. Không cần mở tài nguyên trả phí để vượt blocker thiết kế.

## Phát hiện độc lập và blocker

- **B01 — môi trường SQL chưa xác minh**, owner 14/07: thiếu server PG17 local disposable, quyền DB và recovery đã kiểm tra. Mở khóa bằng preflight đầy đủ và log, không chỉ cài psql.
- **B02 — thiếu runtime AuthN/AuthZ/transfer/inbox**, owner 02/06/08: gateway chỉ có health, read transactions và webhook trả 503; frontend demoAuth là local. Mở khóa bằng endpoint triển khai, server principal, contract và test fixture độc lập. 404 endpoint chưa triển khai không được coi là test chống IDOR PASS.
- **B03 — SQL A3.6 chưa chốt**, owner 07: source v2 vẫn có audit actor FK ON DELETE SET NULL (core dòng 160) trong khi trigger cấm UPDATE (dòng 194–196); xóa actor có audit sẽ cố sửa audit và có thể bị guard chặn. Đây là xung đột thiết kế tĩnh cần regression actor deletion; chưa báo runtime FAIL. Assertions hiện thiếu MAINTAIN, column/default ACL, role SET và exact matrix đầy đủ. Mở khóa bằng final diff/review và PG17 tests, không chỉnh archive để giả làm migration approved.
- **B04 — ledger/replay/retention contract chưa đủ**, owner 07/08/02: v2 chỉ import provider, không có balance/ledger nội bộ. Chưa chốt canonical hash fixtures, failed/started replay/cleanup, wait timeout; không tự phát minh TTL. Mở khóa bằng schema+API versioned và fault hooks để QA có thể kiểm COMMIT độc lập.
- **E01 — cấu hình browser local**, owner 13: lần E2E đầu không khởi động browser vì thiếu Playwright cached executable. Có Chromium hệ thống; chạy lại qua NHT_CHROMIUM_PATH thay vì sửa test assertion. Log đầu giữ nguyên, không coi lỗi launch là lỗi sản phẩm đã xác nhận.

Không phát hiện lỗi runtime sản phẩm trong 25 backend tests đã chạy. Không thay code nghiệp vụ/SQL chưa đủ điều kiện; đã sửa cách gọi kiểm thử browser local sau khi xác định nguyên nhân.

## GATE và bằng chứng

| GATE | Trạng thái | Điều kiện nhận / phần còn thiếu |
| --- | --- | --- |
| ARCH-01 | BLOCKED | API field/error/auth contract vẫn draft; cần OpenAPI versioned + server implementation cho test runtime |
| SEC-01 | BLOCKED | Gateway auth/HMAC subset PASS; JWT/session/RBAC app chưa có runtime |
| DB-01 | BLOCKED | B01/B03; tất cả SQL runtime NOT RUN |
| TX-01 | BLOCKED | B02/B04; idempotency/10 DB workers/crash recovery NOT RUN |
| QA-01 | BLOCKED nghiệm thu tổng thể | Matrix/suite/log đã bàn giao; còn các test P0 bị chặn, không tự chấp thuận release |
| OPS-01 | BLOCKED nghiệm thu nền tảng | Unit/backend/build subset có log; SQL environment/recovery và release runtime còn thiếu |
| UX-01 / COORD-01 | NOT RUN trong nhiệm vụ này | Không tự nghiệm thu UI/PRD hoặc thiết bị thật |

E2E chạy lại exit 0: 43 PASS, 8 skip chủ ý vì ui-acceptance chỉ chạy 4 widths trên project desktop; mobile/android không lặp 4 tests này. Lần đầu exit 1 do 51 browser launch failures, log được giữ. Đây là browser emulation/dev server, không phải thiết bị native hoặc kiểm thử production build. Mutation check trên bản sao /tmp: auth bypass, ACK trước durability và nới timestamp window đều bị suite mới bắt (3/3); không sửa nguồn sản phẩm.

Log tự chạy trong [bang-chung-nhom-13/](bang-chung-nhom-13/), metadata lệnh/exit code tại `ket-qua.json`. Bộ backend mới dùng HTTP server thật trên loopback; chỉ provider transport là test double. Không gọi provider SePay thật.

Fixture trong suite: clock `1800000000000`, account `00000000-0000-4000-8000-000000000013`, event `qa13-replay-1`; bearer/HMAC là chuỗi tổng hợp công khai, không credential môi trường. A/B/balance/amount trong matrix là dữ liệu dự kiến, chưa seed vào DB. Không lưu response chứa thông tin người dùng thật.

Chạy lại: `npm run test:backend`, `npm test`, `npm run build`, `NHT_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e` (hoặc cài Chromium đúng phiên bản Playwright trên máy đích). Node local v24.19.0/npm 11.9.0; CI dùng Node22 nên cần xem CI riêng.

## Bàn giao HO-2A-13-01 và HO-2A-13-14

- Gửi 01 tại Issue #32 và 14 tại Issue #45; Issue #44 giữ OPEN. Link commit cụ thể trong bình luận bàn giao sau push; ACK của bên nhận còn PENDING.
- Nhóm 01 nhận risk/GATE và giao B02–B04 cho 02/06/07/08; không công bố nền tảng được nghiệm thu từ số test frontend.
- Nhóm 14 nhận suite đã được glob `backend/tests/*.test.mjs` của npm run test:backend/CI hiện có thu thập; không cần sửa workflow để lặp việc đã có. Cần chuẩn bị PG17 disposable/preflight/recovery và lưu log SQLSTATE/connection IDs khi B03 được mở.
- Push main dùng thông điệp `[khong-trien-khai-web]` theo guard hiện có, tránh phát hành website cho thay đổi QA. Verify/Pages build vẫn có thể tự chạy; không bật APK hay deploy backend. Rollback Git bằng revert commit QA; không force push; không có DB state cần hoàn tác vì SQL chưa chạy.
