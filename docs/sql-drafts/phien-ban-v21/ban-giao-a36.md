# Nhóm 07 — Đợt 2A, SQL v2.1 / A3.6

Handoff-ID: **NHTBANK-07-2A-A36-20261106-r1**. Tiếp quản Issue #38 theo yêu cầu trực tiếp của chủ repository. Đích bàn giao: Nhóm 08/06 và Nhóm 13. Trạng thái: **CÓ DIFF VÀ ASSERTIONS; SQL NOT RUN; DB-01 BỊ CHẶN**. Đây là bản nháp review, chưa phải migration được nghiệm thu.

## Nguồn và cách dùng gói

Đã đọc trực tiếp qua GitHub connector trên `main`, sau đó đọc lại theo commit `7192af6c28b51b56806b0b9c6827d2d0604bbc8a`; nội dung giống nhau. Git blob SHA được tính lại bằng công thức Git trên bytes nguồn, không nhầm với SHA-256 của file:

| File trong `docs/sql-drafts/archive/v2/` | Git blob SHA |
| --- | --- |
| `20261031_000001_nhtbank_core_schema.draft.sql` | `48ed0ab6adec0ffa3091e081924d051e2a6a2bda` |
| `20261031_000002_nhtbank_security_assertions.draft.sql` | `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379` |

GitHub `search_branches` trả `branches: []` cho `codex/nhtbank-sql-hardening-20261031`; không dùng nhánh này làm nguồn. Checkout cục bộ ban đầu là `work` tại `fb5a2f231c0d1ec210a7b2368cc41268695a0508`, không phải main hiện hành. Chỉ tái dùng hai file local sau khi bytes/Git blob khớp nguồn đã đọc trên main; không push lịch sử checkout cũ đè main.

Trong khi làm, main chuyển sang `8b9c3ba629fb6db217f0cd720d7b1d3639ca775a` (nghiệm thu Đợt 1). Đã đọc lại hai nguồn tại commit mới và xác nhận cùng bytes/SHA; gói này bổ sung artifact trên cây main mới, giữ nguyên tài liệu nghiệm thu của Nhóm 01. Commit dùng nhãn `[khong-trien-khai-web]` theo workflow Pages đã đối chiếu; CI có thể tự chạy build/test, không suy kết quả SQL từ CI này.

- [sql-v21.diff](sql-v21.diff): unified diff đúng hai đường dẫn nguồn archive/v2, không gồm v3 hay tài liệu. Áp dụng vào bản sao hai file v2 sẽ thu được đúng bytes hai file dưới đây.
- [luoc-do.sql](luoc-do.sql), [kiem-dinh.sql](kiem-dinh.sql): kết quả v2.1 để review/thực thi có điều kiện. Giữ nguyên archive/v2 trên repository để bảo toàn neo nguồn. Không áp patch lên archive của repository rồi đồng thời chạy cả hai bộ file.
- [kiem-tra-tinh.py](kiem-tra-tinh.py): chỉ đọc, tính SHA, dựng lại diff và thử `git apply` trong thư mục tạm. Không gọi driver DB, không thực thi SQL, không dùng `testing/` hay testing-v3.
- [bang-chung-tinh.txt](bang-chung-tinh.txt): lệnh, exit code và toàn bộ output kiểm tra tĩnh; có Git blob và SHA-256 kết quả.

Phạm vi thực hiện: sửa văn bản SQL/tài liệu, kiểm tra patch cục bộ, cập nhật main qua connector với expected head. Không tạo database, không migration, không Supabase API, không chạy SQL hoặc ứng dụng có thể ghi DB. Không thêm trạng thái `reversed`.

## Kế hoạch và review từng hunk

Kế hoạch thực hiện trong phiên: xác minh nguồn → sửa core → bổ sung assertions → kiểm chứng diff/round-trip → bàn giao review. Người dùng đã yêu cầu thực hiện trực tiếp; không cần xin lại quyền sửa main. Những bước DB chưa đủ điều kiện được giữ BỊ CHẶN.

| Hunk (`old → new`, xem header trong diff) | Review và quyết định |
| --- | --- |
| Core `-1,4 +1,4` | Đổi nhãn v2.1; vẫn review-only, không canonical migration. |
| Core `-8,6 +8,28` | Chặn sai session/current creator, sai PG17, global/schema table/sequence defaults ngoài owner. Không tự sửa default ACL toàn database. |
| Core `-20,13 +42,18` | Schema phải đúng owner và rỗng; service_role bị REVOKE rồi chỉ GRANT USAGE. Từ chối reapply/migration tại chỗ. |
| Core `-46,7 +73,7` | CREATE function thay vì OR REPLACE để tránh thay nội dung object hiện hữu. |
| Core `-157,7 +184,7` | Bỏ FK actor; UUID là snapshot lịch sử. Không dùng CASCADE hay ngoại lệ trigger để né append-only. |
| Core `-168,8 +195,8` | Sửa mô tả xóa user; backend phải xác thực actor khi INSERT. |
| Core `-178,7 +205,7` | CREATE cho function guard, cùng quy tắc không ghi đè. |
| Core `-209,6 +236,16` | REVOKE đúng bảy bảng và identity sequence, có MAINTAIN qua ALL PG17, rồi GRANT lại ma trận. Không ALL TABLES IN SCHEMA. |
| Core `-219,6 +256,195` | Chèn catalog gates trước COMMIT, cùng bytes block với assertions. Nếu catalog sai thì core chưa được COMMIT; caller phải ON_ERROR_STOP và rollback/đóng connection lỗi. |
| Assertions `-1,10 +1,216` | Creator/version; owner/RLS; schema/table/column/direct/effective ACL và grant options; membership; sequence; function; defaults và probes disposable. |
| Assertions `-20,7 +226,7` | Bổ sung MAINTAIN cho danh sách forbidden của probe kế thừa. |
| Assertions `-209,8 +415,41` | Bỏ thông báo PASS bao trùm; thêm snapshot actor, metadata không là object, duplicate webhook và timestamp/status âm. ROLLBACK cuối file. |

Review hunk là rà soát văn bản, chưa là PostgreSQL parse/compile hoặc behavioral PASS. Khi sửa SQL phải dựng lại diff, cập nhật bảng hunk nếu header đổi, chạy lại checker và lưu log mới.

## Phát hiện và phần đã khắc phục trong bản nháp

| ID / mức | Bằng chứng nguồn v2 | Tác động, xử lý và hồi quy |
| --- | --- | --- |
| A36-01 / P0 | Core `actor_user_id ... ON DELETE SET NULL` và trigger chặn UPDATE | Xóa auth user có audit gây SQLSTATE 55000, rollback thao tác xóa. Bỏ FK, giữ UUID snapshot. Assert không có FK trên cột, trigger đúng OID/type/enabled; probe UPDATE/DELETE/TRUNCATE phải 55000. Test xóa auth user thật trong fixture disposable vẫn CHƯA CHẠY. |
| A36-02 / P0 | Assertions cũ thiếu MAINTAIN, attacl, full matrix, membership | Grant bảng không bao phủ grant cột; quyền kế thừa/SET ROLE vượt ACL trực tiếp. V2.1 so đủ 8 quyền, grant options, attacl và schema CREATE; cấm role ứng dụng có role khác reachable qua USAGE/SET. Cần negative injection trên PG17. |
| A36-03 / P1 | Default ACL theo schema không trừ global grants | Không tự REVOKE global vì ảnh hưởng schema khác. Chặn grant ngoài owner cho table/sequence; function cho phép duy nhất global PUBLIC EXECUTE mặc định và bắt buộc explicit REVOKE từng function. Probe object tương lai chạy rồi rollback. |
| A36-04 / P1 | Owner cũ chỉ loại ba app roles, function chưa kiểm owner/search_path | Bắt chính xác postgres cho schema, từng table/sequence/function; function invoker, zero args, trigger return, `proconfig` chứa đúng `search_path=""`. Owner ACL/grant option hợp lệ được loại khỏi kiểm cấm, không báo false positive owner. |
| A36-05 / P0 | Core COMMIT riêng, assertions rollback riêng; chưa có ledger | Catalog gates chạy trước COMMIT. Assertions hành vi vẫn không rollback core đã commit. Dùng database dùng một lần và phục hồi snapshot/recreate; không tuyên bố atomic transfer từ unique key. |

ACL dự kiến service_role: profiles/accounts/webhook/idempotency `SELECT,INSERT,UPDATE`; user_roles `SELECT,INSERT,DELETE`; sandbox_transactions/audit_events `SELECT,INSERT`; sequence audit `USAGE,SELECT`, không UPDATE. anon/authenticated/PUBLIC không có quyền trên private. Không app role nào có grant option. Không cho thực thi trực tiếp hai trigger functions. ACL bên thứ ba làm gate fail thay vì bị tự xóa.

Role membership baseline cố ý nghiêm: bất kỳ role khác reachable qua `pg_has_role(...,'USAGE')` hoặc `'SET'` đều bị chặn, kể cả predefined roles; role chỉ có MEMBER mà không inherit/SET không được coi là effective access. Không sửa membership toàn cluster. Nhóm 06 cần xác nhận baseline trước khi nới; có grant gián tiếp khác phải bị phát hiện. `service_role` phải BYPASSRLS, các client không BYPASSRLS/superuser/CREATEROLE/CREATEDB/REPLICATION. RLS bật, không policy; backend tự AuthZ vì service_role bypasses RLS. API exposed schemas phải kiểm chứng bên ngoài SQL.

## Checklist GATE-01..10 — A3.6-2A-r1

Đây là **định nghĩa đề xuất có version riêng**, dựa trên ánh xạ Đợt 1; chưa có artifact bộ A3.5 gốc để chứng minh tương đương. Tên đầy đủ mỗi gate là `A3.6-2A-r1/GATE-xx`. Không dùng kết quả này thay gate lịch sử; Nhóm 13 cần review/chấp nhận định nghĩa và expected SQLSTATE.

| Gate | Điều kiện nghiệm thu / bằng chứng cần thu | Hiện tại |
| --- | --- | --- |
| GATE-01 | Actor không FK; audit UUID tồn tại sau xóa auth user; UPDATE/DELETE/TRUNCATE → 55000; metadata array → 23514; trigger enabled đúng function/type. | Đã viết assertions; SQL CHƯA CHẠY; xóa auth user fixture còn thiếu. |
| GATE-02 | Đúng ma trận table/schema/effective/direct/column ACL, gồm MAINTAIN, không grant option, không owner/role escalation. Inject PUBLIC, third-party, column grant, pg_maintain và SET ROLE path phải làm gate fail. | Có catalog assertions; positive/negative PG17 CHƯA CHẠY. |
| GATE-03 | Identity audit đúng sequence/owner; service chỉ USAGE+SELECT, client không có quyền, UPDATE/grant option fail; ghi nhận nextval không transactional. | Có assertions; CHƯA CHẠY. |
| GATE-04 | Global + schema defaults của creator postgres; table/sequence probe không grant ngoài owner; function probe explicit revoke; inject global grants không được bị schema revoke che mất. | Có catalog/probes; CHƯA CHẠY. |
| GATE-05 | session_user=current_user=postgres; owner chính xác; mọi bảng RLS bật và không policy; private không exposed; core chỉ tạo mới. | SQL/cấu hình môi trường CHƯA CHẠY. |
| GATE-06 | Function owner/invoker/search_path/ACL/EXECUTE; verify biểu diễn PG17 `search_path=""`; negative owner/search_path/function grant. | Có assertions; parser/catalog PG17 CHƯA CHẠY. |
| GATE-07 | Namespace unique idempotency → 23505; webhook duplicate → 23505, status/timestamp sai → 23514; retry hash khác → 409; replay resource đã commit, không revalidate balance cho retry. | Có probes DB một phần; backend replay/hash/ACK/TTL chưa triển khai/chốt. |
| GATE-08 | 10 connection cùng key/hash → 1 transfer/9 replay cùng receipt; khác hash → conflict; hai principal/scope độc lập; debit cạnh tranh không âm; crash trước/sau commit không partial/double posting. | BỊ CHẶN: ledger/transfer contract với Nhóm 08 chưa được review. |
| GATE-09 | Định danh database disposable, PG17, owner/session, endpoint local không hosted, không dữ liệu thật; backup/snapshot có restore proof; command/log/exit code và negative tests. | BỊ CHẶN: chưa có đích DB; không kết nối để dò tìm. |
| GATE-10 | Core DDL/catalog gate trong 1 transaction; lỗi trước COMMIT rollback toàn bộ; behavioral assertions transaction riêng; reapply bị chặn an toàn; review 06/08/13, không biến thành migration Production. | Đã kiểm cấu trúc văn bản/patch; runtime và review độc lập CHƯA CÓ. |

Đối với probe bất biến, SQLSTATE assertion tự phát khi không đạt là P0001. Với grant trực tiếp bị cấm, phép thử dưới role client phải nhận 42501, không chỉ dựa vào việc DO block chạy dưới postgres. Cần negative tests riêng trên database disposable mới cho từng biến thể; không nới gate chỉ vì fixture vắng role Supabase.

## Transaction, idempotency và webhook — bàn giao Nhóm 08

Đã đọc `docs/dieu-phoi/dot-1/08-transfer-idempotency.md` blob `472221e2a8442c8537f3d659968c8f8f5fc8ccf9` và Nhóm 06 blob `bf6fb79de729d5d7efb6204dfb8b32fb18bd84f9` trên main. Đây là đối chiếu đầu vào tài liệu, không giả định nhóm khác đã phản hồi.

Vòng 1: v2.1 cung cấp unique namespace `(principal_key, operation_scope, idempotency_key)`, request hash 32 bytes, status `started/completed/failed`, `resource_id` và `expires_at`. Unique không tự kiểm payload mismatch, không tự lưu receipt, không tự enforce state machine. `expires_at` không xóa uniqueness; không thêm TTL cleanup hay tự tái sử dụng key. `resource_id` hiện không FK/typed resource vì ledger chưa thiết kế; không ép nó trỏ vào provider-import table.

Vòng 2 yêu cầu Nhóm 08 trả lời bằng contract/version và code/test evidence:

1. Derive principal từ token đã verify, server kiểm owner. Canonical hash có version/scope/source/destination/amount VND integer/currency/description; chốt Unicode/whitespace/null/omitted bằng fixtures. Không hash JWT, retry timestamp, request ID.
2. Một connection/transaction: claim unique key → lock/read record → so hash → replay committed resource trước kiểm balance mới. `ON CONFLICT DO NOTHING` phải SELECT lại ở statement kế tiếp tại READ COMMITTED, xử lý snapshot/retry tại isolation khác. Không precommit key claim rồi ghi tiền trong transaction khác.
3. Chỉ yêu cầu mới khóa account theo thứ tự ID ổn định, kiểm balance dưới lock, ghi business record + debit/credit cân bằng + audit + status/resource_id rồi commit cùng nhau. Lock timeout/deadlock/serialization (40P01/40001) phải rollback/retry bounded với cùng key; không ACK thành công trước commit.
4. Crash trước commit: zero partial postings. Sau commit trước HTTP: retry ra cùng persisted receipt. Chốt wait/timeout khi claim còn xử lý, replay terminal failure, retention và tie resource/principal; không bịa HTTP behavior đã implemented.
5. `sandbox_transactions` chỉ nhập TEST MODE; không có balance/double-entry ledger. Thiết kế ledger/transfer riêng cần 07/08/06 review. Không thêm reversal enum khi chưa có reversal workflow.

Webhook: unique `(provider,provider_event_id)` chống trùng ID trong đúng một sandbox namespace; `processed` tương đương `processed_at IS NOT NULL`, các status khác phải NULL. Schema chưa ngăn sửa provider_event_id/hash/account_ref bằng UPDATE, chưa kiểm transition hợp lệ, chưa có lease/worker token/recovery cho `processing`. Giữ grant cũ trong đợt hardening; Nhóm 08/09 phải chọn column ACL/RPC/worker claim contract trước ingest. Nếu thêm tenant/environment/provider mới phải review uniqueness namespace.

Inbox chỉ giữ digest, không raw body: xử lý async không thể tái dựng payload từ SHA-256. Chọn xử lý đồng bộ đã verify chữ ký và commit inbox+business+audit cùng transaction, hoặc durable redacted normalized payload/outbox có schema/retention được review riêng. Không trả ACK thành công khi chỉ giữ digest mà chưa có khả năng xử lý/recovery. Duplicate cùng ID khác digest phải conflict/quarantine, không silently replay; partial failure không được để `processed` khi business chưa commit. Hai worker dùng row lock/SKIP LOCKED chỉ là phương án, chưa là implementation chứng minh exactly-once effects.

## Preflight và phục hồi trước mọi lần chạy SQL

- [ ] Người vận hành xác nhận tên/ID/host/port/database đúng development dùng một lần; chứng minh endpoint local/container, không hosted NhTBank, không tiền/dữ liệu thật. Không đưa DSN/password vào issue/log.
- [ ] Lưu source commit + target SHA-256 từ log, PG17 server version, current_database/session_user/current_user, owner, role attributes/membership và inventory private. `private` phải chưa tồn tại hoặc đúng owner/rỗng. Không dùng runner v3.
- [ ] Ghi command kết nối có lựa chọn endpoint tường minh, vô hiệu hóa psql startup (`-X`), `-v ON_ERROR_STOP=1`; không dùng mặc định PGHOST/PGDATABASE chưa kiểm chứng. Cấu hình local timeout phù hợp và ghi giá trị; không chạy trong psql `--single-transaction` quanh file có BEGIN/COMMIT riêng.
- [ ] Trước core: snapshot disposable cluster/backup database và roles/default ACL liên quan; ghi ID, checksum, retention; restore thử vào database disposable khác và ghi kết quả. Nếu fixture hoàn toàn trống, lưu manifest tạo fixture + vai trò và chứng minh recreate/teardown chỉ trỏ đúng disposable target. Không ghi tự động DROP SCHEMA CASCADE lên đích mơ hồ.
- [ ] Chạy core đã review → kiểm exit/log; lỗi làm dừng, rollback/đóng connection, không chạy assertions trên partial setup. Core mới tạo object, không phải rerunnable/idempotent migration. Reapply phải fail mà không đổi object đã có.
- [ ] Chạy assertions riêng, lưu toàn bộ output/exit. ROLLBACK chỉ xóa test rows/probe objects; nextval vẫn tăng. Không setval/reset sequence của DB chia sẻ để giấu gap. Nếu behavioral fail sau core commit: restore snapshot/recreate database disposable, không giả định assertions rollback core.
- [ ] Chạy negative ACL/default/owner/function fixtures, audit auth-user delete và tests concurrency độc lập. Nhóm 13 review bằng chứng đúng target/version trước khi đánh giá DB-01.

Hiện không có database được định danh, không có backup/restore proof và không có PostgreSQL/parser cục bộ. Không cài dependency hoặc chạy SQL để tự tạo kết luận. Lệnh Git network cục bộ thất bại do proxy không kết nối; nguồn/ghi GitHub dùng connector, không bypass proxy. Static checks không thay compiler PL/pgSQL, PostgreSQL catalog semantics hay isolation/concurrency.

## Bàn giao và nghiệm thu

Nhóm 13: review từng hunk và bộ gate version này, chạy lại checker, sau đó chỉ chạy PG17 khi GATE-09 đủ evidence; lưu positive + negative/runtime/concurrency logs. Nhóm 06: review role graph, BYPASSRLS, quyền service backend và API exposed schemas. Nhóm 08: trả lời năm quyết định vòng 2 và webhook recovery, bổ sung schema ledger trước GATE-08. Bàn giao qua Issues #39 và #44 là thông báo công việc, không kích hoạt hay chứng minh cuộc trò chuyện/agent khác đã tiếp nhận.

Không đóng Issue #38; không gán assignee thay nhóm logic; không kết luận DB-01 PASS. Chỉ có SHA/diff/round-trip được xác minh ở mức tĩnh. SQL runtime, full ACL negative tests, deletion fixture, backup/restore, backend atomic/concurrency và independent acceptance vẫn chưa có bằng chứng.
