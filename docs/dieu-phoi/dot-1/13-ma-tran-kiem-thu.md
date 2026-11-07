# Nhom 13 — Doc lap QA, bao mat va evidence matrix

> Phân loại: BAN NHAP THIET KE/REVIEW. Tai lieu duoc viet dua tren source GitHub main ngay 2026-11-06. Khong coi la code da tich hop, test da PASS, hay 14 nhom AI da nhan viec. Quyen thuc thi theo ../quy-che-thuc-thi.md.

| Test ID | Yeu cau | Kieu | Ky vong | Evidence can co | Status |
|---|---|---|---|---|---|
| QA-01 | 7 tables RLS enabled; private non-exposed | PostgreSQL local + settings | anon/authenticated no direct table grant | pg_catalog result + env identity | NOT RUN |
| QA-02 | Service_role grants exact, MAINTAIN denied | PostgreSQL local | Exact matrix theo schema | query output and role memberships | NOT RUN |
| QA-03 | Column ACL, grant option, SET ROLE | PostgreSQL local | client roles khong vuot RBAC | `pg_attribute.attacl`, `pg_has_role` logs | NOT RUN |
| QA-04 | Functions owner/search_path/PUBLIC EXECUTE | PostgreSQL local | least privilege | pg_proc ACL/proconfig evidence | NOT RUN |
| QA-05 | Audit UPDATE/DELETE/TRUNCATE guard | local disposable | DML denied, no mutation | SQLSTATE + committed/rolled back check | NOT RUN |
| QA-06 | User A truy cap account B | Backend integration | 403/404 safe, no data disclosure | API traces redacted | NOT RUN |
| QA-07 | 10 workers same idem key/hash | Concurrent backend | 1 business transfer, stable replay | 10 connection trace + SQL persisted rows | NOT RUN |
| QA-08 | Same key different hash | Concurrent backend | Conflict, no duplicate transfer | logs + business count | NOT RUN |
| QA-09 | Crash before/after COMMIT | Fault injection | rollback/replay exactly once | trace + durable rows | NOT RUN |
| QA-10 | SePay webhook HMAC/replay/timeout | Backend integration | durable inbox before ACK | mock provider log, no real transactions | NOT RUN |
| QA-11 | Android and web UI a11y | Playwright/device | no broken CTA, focus and reduced motion | screenshot and job URL | NOT RUN FOR PHASE-1 |
| QA-12 | APK artifact integrity | CI + artifact | package/version icon + sha256 valid | workflow run and artifact hash | NOT RUN FOR PHASE-1 |

## Test runner safety
1. Check DB host/network identity plus database-side identifier; URL text alone is insufficient to prove local/disposable.
2. Do not run SQL v2 draft until schema/ACL/transaction design reviewed; never use testing-v3 runner for v2.
3. Keep credentials/secrets out of logs, no true banking account; test on local sandbox and restore/rollback documented.
4. Distinguish design acceptance vs actual execution. Existing CI runs on earlier commits are not proof new database/transfer implementation passed.

## Review outcome
- Phan bien: current SQL assertions do NOT check MAINTAIN, column ACL, full service_role grants, role SET, backend idempotency/concurrency.
- QA-01..12 tests listed as NOT RUN for proposed new backend/SQL. `QA-01` coordination design gate: REVIEW PENDING; not PASS.

**Ban giao:** 01 (risk), 07 (SQL blockers), 08 (integration matrix), 14 (release gates).

## Điều kiện phản biện bổ sung — 06/11/2026

- `QA-01` trong bảng test là test SQL; gate điều phối `QA-01` là nghiệm thu test matrix. Khi báo cáo phải ghi namespace `TEST:QA-01` hoặc `GATE:QA-01` để tránh nhầm. Cả hai chưa đạt nghiệm thu runtime.
- `GATE-01`–`GATE-10` ở tài liệu Nhóm 07 mới là mapping đề xuất. Thiếu gate-definition artifact gốc là blocker truy nguyên, không phải SQL runtime FAIL.
- Bổ sung regression replay: dùng hết số dư bằng lần chuyển đầu, retry cùng key/hash vẫn trả persisted receipt, không kiểm tra lại như giao dịch mới. Thử conflict khi trạng thái còn processing; hai principal cùng key; hash với amount lớn/Unicode/null/omitted.
- Không dùng mock đơn luồng/unit frontend để chứng minh 10 connection độc lập hoặc atomic ledger; trace phải cho thấy commit/rollback và business record đếm từ DB disposable đã định danh.
- Review thiết kế bởi agent phụ trong cùng phiên là bằng chứng phản biện tài liệu, không phải xác nhận tiếp nhận từ các cuộc trò chuyện của 14 nhóm hay pentest độc lập tổ chức.
