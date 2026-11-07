# Nhóm 13 — kiểm thử nền tảng r2, 07/11/2026

Handoff: **HO-2A-13-R2-01-14**, Issue #44 vẫn OPEN. Đây là kết quả kiểm tra độc lập tiếp theo [mốc r1](13-kiem-thu-nen-tang.md), không phải nghiệm thu release.

## Nguồn và thay đổi đủ điều kiện kiểm thử

- Nhóm 07 bàn giao `NHTBANK-07-2A-A36-20261106-r1`, commit `6cce289a324fca0617d348739517ed78eac03df0`: đã đọc diff, từng hunk, hai tệp kết quả và định nghĩa riêng `A3.6-2A-r1`. Chấp nhận namespace này cho kiểm thử mới; không nhận là bộ GATE A3.5 lịch sử.
- Source SQL chạy: `1894c453775ebb48a28c6111dba737199542bb1c`. Trong lúc thực hiện đã đồng bộ main `b1c367f95308cfc3f3a270b0b9dc454466fb3c65`, đọc lại AGENTS.md, kiểm hai tệp SQL không đổi bytes. Không trộn với `de-xuat-sql-v2.patch`, archive/v2 hoặc runner v3.
- Source ứng dụng kiểm cuối: `b1c367f95308cfc3f3a270b0b9dc454466fb3c65` + các test QA mới trong commit chứa báo cáo này. Backend có thêm `xac-thuc-api.mjs` và key canonicalizer; vẫn chưa có HTTP v1/ledger/persistent transfer.
- Đã đọc Issues #33/#37/#38/#39 và phản hồi #32/#45. Nhóm 01/14 ACK nhận hiện vật; không có ACK chấp thuận release. Nhóm 02 đang chuẩn bị contract, không coi comments/proposed routes là implementation.
- Không dùng log của Nhóm 07 hay lời báo PASS của nhóm viết mã làm kết quả SQL. QA đã tự chạy checker patch, đọc SQL, thực thi PostgreSQL và tự kiểm negative probes.

## Preflight SQL đã đạt cho fixture local riêng

Runner [sql-v21-doc-lap.py](../../../scripts/kiem-thu/sql-v21-doc-lap.py) không nhận DSN hoặc endpoint tùy ý; yêu cầu `--thuc-hien`, dùng duy nhất Docker socket local `/var/run/docker.sock`. Docker daemon local đã xác minh khi được cấp quyền thực thi ngoài sandbox.

| Điều kiện | Bằng chứng / giới hạn |
| --- | --- |
| Môi trường dùng một lần | Container ID, label riêng từng lượt; network `none`, không published port, không bind mount/volume; PGDATA trên tmpfs. Identity manifests trong thư mục log. |
| PostgreSQL | Binary version và server `PostgreSQL 17.11 (Debian 17.11-1.pgdg12+2)`; image ID/digest đã pin trong metadata. |
| Quyền và DB identity | current_user=session_user=postgres, rolsuper=true, database postgres, Unix socket; system_identifier lưu trước DDL. Không có private schema trước core. |
| Bootstrap | Chỉ role anon/authenticated/service_role và `auth.users(id uuid primary key)` tổng hợp. Không phải full Supabase Local; không xác minh API exposed schemas/Auth provider. |
| Rollback/recovery | Trước core: tạo fixture → hủy đúng container label → tạo cluster mới → kiểm identity và baseline sạch → tái tạo fixture. Đây là bằng chứng recreate cho dữ liệu bỏ được, không phải backup/restore dữ liệu thật. |
| Dừng khi lỗi | psql -X, ON_ERROR_STOP=1, VERBOSITY=verbose, statement_timeout=10s, lock_timeout=2s; mỗi probe kết nối riêng. Lỗi trong transaction đóng connection để rollback. |
| Cleanup | Runner xác minh label trước khi xóa; các container dùng trong lượt đã được gỡ và tmpfs bị hủy. Giữ image cache để tái lập. Không DB hosted, không giao dịch thật, không tài nguyên có phí. |

Lệnh đã chạy:

```sh
python docs/sql-drafts/phien-ban-v21/kiem-tra-tinh.py
python scripts/kiem-thu/sql-v21-doc-lap.py --thuc-hien \
  --dau-ra docs/dieu-phoi/dot-2a/bang-chung-nhom-13-r2
```

## Ma trận kết quả SQL độc lập

**31/31 bước kiểm chứng đạt**, bao gồm preflight/setup/recovery và các probes; không gọi đây là 31 test chuyển khoản. [Kết quả từng bước, exit code, PID](bang-chung-nhom-13-r2/ket-qua-sql.json); [source/runner/file SHA256](bang-chung-nhom-13-r2/phien-ban-nguon.json).

| GATE có version A3.6-2A-r1 | Kết quả thực thi | Điều kiện và phạm vi nhận |
| --- | --- | --- |
| GATE-01 | PASS PostgreSQL fixture | Actor UUID snapshot tồn tại sau xóa auth actor tổng hợp; audit UPDATE/DELETE/TRUNCATE guard 55000; service_role DML trái phép 42501; metadata array 23514. |
| GATE-02 | PASS PostgreSQL fixture | Exact/effective/direct/column ACL và role attributes; inject MAINTAIN, column SELECT, PUBLIC SELECT, schema CREATE, grant option và SET ROLE đều bị catalog gate từ chối. |
| GATE-03 | PASS PostgreSQL fixture | Sequence owner/identity/USAGE+SELECT kiểm trong assertions; inject UPDATE bị từ chối. Không coi sequence increment là transactional. |
| GATE-04 | PASS PostgreSQL fixture | Global/schema defaults và object probes; inject global table SELECT bị từ chối. |
| GATE-05 | PASS local; NOT RUN API config | Owner/RLS/no policy được thực thi; anon/authenticated nhận 42501; khi cấp tạm schema/table SELECT trong transaction, authenticated vẫn thấy 0 row nhờ RLS. Supabase exposed schemas chưa kiểm. |
| GATE-06 | PASS PostgreSQL fixture | Function owner/invoker/search_path/EXECUTE; inject function EXECUTE hoặc search_path=public bị từ chối. Biểu diễn proconfig đã được PG17 thực tế kiểm. |
| GATE-07 | PASS constraint subset; BLOCKED replay API | Assertion duplicate namespace/webhook 23505, state/timestamp 23514 đạt. Chưa chứng minh payload conflict 409, persisted receipt hoặc durable ACK. |
| GATE-08 | BLOCKED transfer | Đã kiểm primitive 10 DB connections, không có ledger/backend để kiểm chuyển khoản đồng thời hoặc crash trước/sau business COMMIT. |
| GATE-09 | PASS fixture local | Identity/version/quyền/recreate đã kiểm trước core. Không mở gate môi trường Supabase hoặc production. |
| GATE-10 | PASS bootstrap/rollback subset | Core lỗi catalog trước COMMIT không để lại private schema; core đúng chạy được; reapply bị chặn; assertions chạy lại vẫn đạt. Không phải migration nâng cấp tại chỗ hoặc production restore drill. |

**10 kết nối primitive:** trace lưu `14-connection-0.log` đến `14-connection-9.log`, 10 backend PID khác nhau; cùng principal/scope/key/hash có đúng 1 INSERT COMMIT thành công, 9 SQLSTATE 23505; đọc lại DB đếm đúng 1 row. Không có debit/credit, không gọi đây là 1 transfer/9 receipt replay. Dữ liệu dùng `user:qa13`, `primitive-only`, `ten-connections`; bị hủy cùng DB.

Các negative probes trả exit 3 như kỳ vọng là **PASS của kiểm thử phủ định**, không phải lỗi hệ thống chưa xử lý. Không thay SQL/ACL để làm kiểm thử xanh; hai tệp v2.1 giữ nguyên bytes của Nhóm 07.

## Auth, RBAC và canonical hash

- Thêm [golden fixtures](../../../backend/tests/du-lieu-hash-doc-lap.json) và [suite hash độc lập](../../../backend/tests/hash-chuyen-tien-doc-lap.test.mjs). Ba SHA256 được tính bằng Python hashlib từ chuỗi UTF-8 tường minh, không lấy expected từ canonicalizer production. Bao phủ NFC, description thiếu/rỗng/null, giới hạn raw codepoint trước trim/NFC và amount cận safe integer.
- Thêm [suite Auth/RBAC độc lập](../../../backend/tests/xac-thuc-doc-lap.test.mjs): khóa/JWT ES256 sinh cục bộ; roles từ backend thắng claim trong JWT; support/operations/risk_analyst/admin không mặc nhiên chuyển tiền; sai issuer, tài nguyên người khác và context giả bị từ chối. Không gọi issuer/JWKS qua mạng.
- Đã đọc và chạy lại tests của module JWT cho chữ ký, issuer/audience/exp/iat, alg/kid, trusted role lookup, expiry, lỗi lookup và context không thể tự tạo. Module này là điểm tích hợp nội bộ, chưa được nối vào HTTP v1 và không cấp/thu hồi session. Không nhận authentication/RBAC toàn ứng dụng PASS.
- Mutation trên bản sao /tmp: đổi nguồn role thành customer, bỏ ownership check và đổi operation scope trong fingerprint đều bị suite QA bắt (3/3). Nguồn sản phẩm không bị sửa.
- Fingerprint/key utility không phải idempotency storage. Conflict cùng key/khác hash, replay receipt sau hết số dư, retention/terminal failure và binding principal→resource vẫn cần backend/contract.

## Kiểm thử ứng dụng và CI

| Lượt / source | Kết quả | Log |
| --- | --- | --- |
| 1894c45 + 5 test hash QA | backend 53/53; unit 70/70; contract 5/5; build exit 0; production E2E 44 PASS/10 skip chủ ý | backend.log, unit.log, contract.log, build.log, e2e-production.log |
| b1c367f + 11 test QA hash/Auth mới | backend 89/89; unit 70/70; contract 5/5; build exit 0; production E2E 53 PASS/10 skip chủ ý | backend-main-moi.log, unit-main-moi.log, contract-main-moi.log, build-main-moi.log, e2e-main-moi.log |

10 E2E skip chủ ý là 4 UI-width tests và 1 design-system test không lặp trên từng project mobile/android; desktop vẫn chạy. Đây là Chromium emulation trên production bundle local, không là thiết bị thật. Không có runtime FAIL mới được xác nhận; lỗi cache npm đã được sửa ở cách gọi công cụ, không đổi assertion để che lỗi. File kiem-tra-tinh.log có dòng SQL NOT RUN do checker chỉ làm kiểm tra tĩnh; kết quả SQL thực thi riêng được lưu trong ket-qua-sql.json và log từng probe.

Log trong [bang-chung-nhom-13-r2/](bang-chung-nhom-13-r2/). Lần npm ci đầu gặp cache /home/agent/.npm read-only, sau đó npm ci --cache /tmp/nhtbank-qa13-npm-cache đạt; giữ cả log lỗi môi trường và lần sửa. Build cảnh báo chunk >500 kB; chưa sửa tối ưu bundle ngoài phạm vi QA.

CI nguồn b1c367f đã đọc job/log độc lập: [run 42335433776](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42335433776), job 128291176344, Node 22.23.4, unit 70/backend 78/contract 5/APK config 1 đạt, production Chromium 53 PASS/10 skip. [Trích log gốc](bang-chung-nhom-13-r2/ci-nguon.txt). Số backend 78 là source trước 11 tests QA, không gán 89 cho CI này. CI commit QA mới cần kiểm riêng sau push.

## GATE tổng thể và bàn giao

| GATE | Trạng thái | Phần đã mở / phần chưa đủ |
| --- | --- | --- |
| ARCH-01 | BLOCKED nghiệm thu runtime | Có contract fixtures/utility; endpoint HTTP v1 vẫn chưa implemented. |
| SEC-01 | BLOCKED tổng thể | JWT/AuthZ module subset PASS; session issuance/revocation/confirmation, trust provider và HTTP authorization chưa đủ. |
| DB-01 | BLOCKED nghiệm thu tích hợp | 31 bước PG17 fixture PASS, diff đã review độc lập. Chưa full Supabase bootstrap/membership/API exposed schemas; không ledger contract/migration tích hợp. |
| TX-01 | BLOCKED | Unique namespace 10 connections PASS; transfer ledger/crash/durable receipt NOT RUN. |
| QA-01 | BLOCKED tổng thể | Đã có SQL runtime, golden hash và Auth/RBAC subset; còn các test P0 runtime bị chặn. |
| OPS-01 | BLOCKED release | Có local recreate/cleanup proof; không thay recovery/rollback deployment hoặc thiết bị/APK acceptance. |
| Native APK/device/production | NOT RUN bởi Nhóm 13 trong r2 | Không dùng workflow compile hoặc emulator thay kiểm thiết bị/signature/artifact integrity. |

**Blocker cập nhật:** B01 mở cho PostgreSQL fixture local, còn môi trường tích hợp Supabase. B03 mở phần artifact/diff và independent PostgreSQL review; không còn ghi “chưa có diff/chưa chạy SQL” cho gói v2.1 này. B02 thu hẹp: đã có AuthN/AuthZ module, thiếu tích hợp HTTP/session lifecycle. B04 ledger/replay/retention vẫn mở.

Nhóm 01 nhận quyết định scope/GATE; Nhóm 14 nhận runner local + preflight/recreate + logs để tái lập; Nhóm 07 nhận ACK review v2.1 và constraint subset; Nhóm 06/08 nhận Auth/hash/10-connection primitive evidence. Cần tiếp tục full Supabase baseline, HTTP AuthN/AuthZ, ledger atomic, persisted receipt, fault hooks/crash và durable webhook. Giữ #44 OPEN, không tự nhận ACK bên nhận hoặc release được chấp thuận.

Commit QA dùng `[khong-trien-khai-web] [khong-luu-artifact]` theo guard hiện có: CI có thể test/build, Pages deploy và upload/cache bị tắt theo cấu hình. Không tự dispatch workflow khác. Rollback mã bằng revert commit QA; không force-push. Không còn DB test sống cần rollback, image cache là tài nguyên local duy nhất giữ lại.
