# Kiểm toán tĩnh SQL v2 và đề xuất hardening A3.6

Ngày: **06/11/2026**. Nguồn điều phối đầu phiên `main` **7192af6c28b51b56806b0b9c6827d2d0604bbc8a**. Thực hiện trong vai trò chuyên môn Nhóm07/13 theo phân công của Nhóm01; không tự nhận GitHub assignee hay xác nhận tiếp nhận bởi các cuộc trò chuyện khác.

## Kết quả và ranh giới bằng chứng

- **VERIFIED ở mức đọc nguồn:** đã đọc toàn bộ hai tệp archive/v2, đối chiếu blob SHA và rà diff đề xuất. Không thay đổi archive/v2.
- **VERIFIED về áp văn bản:** `git apply --check docs/dieu-phoi/dot-2a/de-xuat-sql-v2.patch` trả exit0 trên nguồn hiện tại. Lệnh chỉ kiểm tra vị trí áp diff, **không áp diff, không phân tích cú pháp PostgreSQL và không thực thi SQL**.
- **BLOCKED ở nghiệm thu DB-01/A3.6:** thiếu nguồn định nghĩa GATE gốc, PostgreSQL17 catalog/runtime evidence, review migration độc lập và target disposable đã định danh. Patch chưa phải unified diff cuối được nghiệm thu.
- **NOT RUN:** PostgreSQL parser, SQL, migration/seed, kết nối DB/Supabase, runner v2/v3, truy vấn catalog, test backend/concurrency và backup/rollback thực tế. Không có SQL PASS hoặc SQL runtime FAIL trong lượt này.
- Chỉ đọc review v3 để so sánh ý tưởng hardening. Không dùng runner `docs/sql-drafts/testing/`, không lấy kết quả hoặc cú pháp v3 làm chứng nhận v2.

## Nguồn bất biến

| Nguồn | Git blob đã xác minh | Số dòng nguồn |
| --- | --- | --- |
| `docs/sql-drafts/archive/v2/20261031_000001_nhtbank_core_schema.draft.sql` | `48ed0ab6adec0ffa3091e081924d051e2a6a2bda` |226|
| `docs/sql-drafts/archive/v2/20261031_000002_nhtbank_security_assertions.draft.sql` | `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379` |216|

Các số dòng ở bảng phát hiện là dòng của blob nguồn trên, không phải vị trí sau patch. Hai SHA là Git blob, không phải checksum SHA256. Số dòng thực đọc là226/216; tài liệu hunk cũ ghi227/217 do tính thêm dòng rỗng sau EOF, không thể dùng khác biệt cách đếm này làm bằng chứng đổi SQL.

## Bảng phát hiện và phần đã tiến từ hunk plan sang patch

Mức P0 dưới đây nghĩa là **điểm khóa nghiệm thu/tích hợp**; không phải bằng chứng một hệ thống Production đang bị khai thác.

| ID / mức | Bằng chứng nguồn | Phát hiện | Đề xuất cụ thể trong patch | Điều kiện nghiệm thu / còn thiếu |
| --- | --- | --- | --- | --- |
| SQL-01 / P0 | Core10–12; assertions28–30 | Core chưa kiểm `current_user` trước DDL; assertions chỉ kiểm sau core đã COMMIT | Thêm fail-fast role `postgres` và giới hạn PostgreSQL17 ngay sau BEGIN của core; cả assertions kiểm PG17 | Target/session/effective role/migration creator được xác minh; chạy ca sai role/version trên disposable, chứng minh không có DDL commit |
| SQL-02 / P0 | Core29–30; assertions40–43 | Grant CREATE cũ của service_role trên schema có thể sống sót; assertion chưa kiểm CREATE | Revoke cả service_role rồi chỉ USAGE; assert CREATE bị từ chối cho client/service, USAGE service còn có | Direct ACL PUBLIC + effective privileges + role memberships/SET ROLE và owner grant option phải review thêm |
| SQL-03 / P0 | Core34–39,212–220 | Per-schema default REVOKE không trừ global default grants; chưa explicit revoke từng object đang tạo | Revoke table ACL trên đúng7 bảng và sequence audit trước regrant matrix; không dùng ALL TABLES/SEQUENCES để tránh đụng object ngoài scope | Còn thiếu inventory global/per-schema `pg_default_acl`, probe object mới và chứng minh future-object discipline. Không tự sửa global defaults ngoài phạm vi |
| SQL-04 / P0 | Assertions22–24,70–97 | Chưa kiểm MAINTAIN PG17; chỉ kiểm một phần grants, không exact toàn7 bảng | Thêm MAINTAIN; loop matrix SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER/MAINTAIN và deny grant option service | Cần PG17 chạy ca quyền thiếu/thừa, inherited grants và PUBLIC grants; owner postgres không bị coi là vi phạm grant option |
| SQL-05 / P0 | Assertions70–97 | Không đọc column ACL; table REVOKE không phải column REVOKE | Kiểm `pg_attribute.attacl` + aclexplode cho7 bảng: không có grant column tường minh cho non-owner | Không dùng riêng has_any_column_privilege vì gồm quyền table hợp lệ; còn test inherited/SET ROLE và quyết định remediation nếu pre-existing column grants có thật |
| SQL-06 / P0 | Core220; assertions99–103 | Assertion mới kiểm service USAGE, chưa SELECT/UPDATE/grant option/owner | Matrix sequence USAGE+SELECT có, UPDATE không; client không USAGE/SELECT/UPDATE; owner postgres; service không grant option | Runtime PG17 + PUBLIC/direct ACL và membership tests còn thiếu |
| SQL-07 / P0 | Core49–60,181–192; assertions105–118 | CREATE OR REPLACE không bảo đảm normal hóa owner; chưa kiểm owner/search_path/EXECUTE hiệu lực của2 function | Explicit owner postgres; assertion invoker, zero-arg signature, stored search_path, EXECUTE client/service bị từ chối; PUBLIC probe chỉ scope2 function v2 | Phải kiểm `pg_proc.proconfig` thực tếPG17 (`search_path=""` là giả định kiểm tra trong candidate), grantoption/SETROLE và exact function identity sau apply |
| SQL-08 / P0 | Core160,171–172,194–200 | FK actor_user_id ON DELETE SET NULL mâu thuẫn append-only UPDATE guard | Bỏ FK trong định nghĩa draft, giữ UUID snapshot; assert không còn FK audit→auth.users | Candidate cho fresh schema, **không phải ALTER migration nâng cấp DB cũ**. Cần test xóa auth user, audit giữ nguyên snapshot, retention/privacy policy và guard SQLSTATE55000 |
| SQL-09 / P0 | Assertions132–169,216 | Assertion rollback không hoàn tác sequence increments; core COMMIT và assertion rollback là2 transaction khác nhau | Giữ cấu trúc nguồn; notice thu hẹp phạm vi PASS, không nhận defaultACL/SETROLE/backend đã kiểm | Chỉ disposable target; dump/recreate recovery và acceptance separation cần tài liệu/log; không dùng rollback assertions làm recovery core |
| SQL-10 / P0 | Core135–154; assertions171–193 | Unique key không enforce request hash/replay/atomic ledger | Không đưa logic backend vào SQL patch | Principal/scope/key/hash; persisted resource;10 connections; crash trước/sau commit; TTL/cleanup phải được Nhóm08/13 thiết kế và chạy riêng |
| SQL-11 / P0 | Core76–108,224–226 | sandbox_accounts/transactions là metadata và import Test Mode, chưa có balance/double-entry ledger | Không thêm ledger ngẫu hứng vào archive hardening | Ledger schema và source of truth phải được review riêng; không chứng nhận internal transfer từ bảng import |
| SQL-12 / P0 | Core6–8,202–210; assertions120–130 | RLS enable trên7 bảng và không policy là thiết kế server-only; service_role bypass RLS; API exposed schema ngoài phạm vi SQL | Giữ nguyên RLS/policy design, không thêm client grants | Xác minh Supabase Exposed schemas không có private; server AuthN/AuthZ theo resource; policy/membership/IDOR tests có bằng chứng |

## Patch đề xuất có thể review

Hiện vật: [de-xuat-sql-v2.patch](de-xuat-sql-v2.patch). Đây là **candidate hardening**, gồm hai diff cho đúng hai blob archive/v2; chưa áp lên mã nguồn hoặc database. Các hunk đã cụ thể hóa role/version guard, schema revoke, owner function, audit actor snapshot, explicit object ACL cleanup và assertions exact matrix/sequence/column/function.

Patch này **chưa bao phủ đầy đủ A3.6**: chưa có accepted GATE definition, catalog/default ACL probe mới và role SET khả dụng; chưa test PG17 semantics; chưa giải quyết data migration nâng cấp hay backend replay/ledger. Không dùng từ “migration đã nghiệm thu”, “SQL hợp lệ” hoặc “A3.6 hoàn thành” để mô tả candidate.

Giới hạn phạm vi có chủ ý: object ACL revoke chỉ7 bảng và sequence đã biết, không revoke hàng loạt toàn private schema; không thêm grant client, không thêm trạng thái `reversed`, không thêm cleanup/TTL chưa được quyết định và không tái dùng v3 runner.

## GATE-01–10 — chưa xác minh định nghĩa gốc

Bảng này chỉ ghi truy nguyên theo **mapping đề xuất của dot-1/07**, không xác nhận numbering A3.5 canonical. Không có nhãn GATE-ID trong hai blob SQL nguồn. Mọi GATE runtime bên dưới là **NOT RUN**, nghiệm thu tổng thể là **BLOCKED** cho đến khi có definition/version được review.

| GATE đề xuất | Phạm vi mapping hiện tại | Liên hệ phát hiện | Bằng chứng còn cần |
| --- | --- | --- | --- |
|01| Audit actor FK |SQL-08| Delete auth user + unchanged audit snapshot + DML guard log |
|02| Exact table/column ACL, MAINTAIN |SQL-04/05| PG17 catalog direct/effective/owner/grant option + negative fixtures |
|03| Sequence USAGE+SELECT |SQL-06| Exact3 privileges/owner/role proof |
|04| Global default ACL |SQL-03| `pg_default_acl` inventory + disposable future-object probes |
|05| DDL creator postgres |SQL-01| DB identity, effective/session role, wrong-role failure before DDL |
|06| Function EXECUTE/search_path |SQL-07| PG17 proconfig/owner/direct/effective ACL and invoker logs |
|07| Persisted replay |SQL-10| Server resource/result version + same-key/hash trace |
|08| Atomic concurrency |SQL-10/11|10 independent connections, one committed transfer, crash/retry evidence |
|09| Disposable preflight |SQL-09/12| Local DB identity from both transport and DB; no hosted target, backup/recreate |
|10| Core/assertion acceptance separation |SQL-09| Core commit vs assertion rollback; no false all-or-nothing recovery claim |

## Handoff và việc có thể làm tiếp

1. Nhóm07/13 review candidate diff như tài liệu, đặc biệt MAINTAIN, column ACL, grant-option, proconfig và scope function. Review độc lập có thể bắt đầu ngay; không cần chờ DB để đọc diff.
2. Nhóm01 thu nhận artifact GATE-definition gốc hoặc phê duyệt bộ gate mới có version riêng; không tự gán numbering cũ như đã khớp.
3. Nhóm06/08 chốt danh tính server, ledger/resource replay và retention/cleanup; role user/app khác PostgreSQL service_role.
4. Chỉ lập runner v2 sau khi bản SQL/definition/test expectations được nghiệm thu. Chỉ thực thi khi xác minh target, owner, network, backup/recreate và phạm vi dữ liệu; không tự chạy do có quyền chung.
5. Cập nhật Issue#38/#44 bằng đúng mức “candidate diff + static review available; DB-01 BLOCKED, SQL NOT RUN”. Không đóng Issue hoặc nghiệm thu P0.

## Lệnh và bằng chứng local

| Lệnh | Exit | Điều đã chứng minh |
| --- | --- | --- |
| `git hash-object docs/sql-drafts/archive/v2/20261031_000001_nhtbank_core_schema.draft.sql docs/sql-drafts/archive/v2/20261031_000002_nhtbank_security_assertions.draft.sql` |0| Hai blob vẫn đúng48ed0ab6…/ad49155c… |
| `git apply --check docs/dieu-phoi/dot-2a/de-xuat-sql-v2.patch` |0| Diff áp được về mặt văn bản trên đúng nguồn, chưa áp |

Không tạo/cài dependency, không subprocess psql, không parser runtime, không kết nối mạng/DB/provider; không commit/push hoặc sửa tài liệu thuộc nhóm khác.

SHA256 của patch để đối chiếu artifact: `73675695bb3ce7b458267f4e27c5172ffa30b375662cafed6cdd64a1fe0a08e6`.
