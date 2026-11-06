# Nhom 06 — Threat model va RBAC nhap

> Phân loại: BAN NHAP THIET KE/REVIEW. Tai lieu duoc viet dua tren source GitHub main ngay 2026-11-06. Khong coi la code da tich hop, test da PASS, hay 14 nhom AI da nhan viec. Quyen thuc thi theo ../quy-che-thuc-thi.md.

## Dau vao duoc doi chieu
- `frontend/src/lib/demoAuth.js` luu tai khoan demo trong browser storage; khong phai Auth backend.
- `frontend/src/lib/bank.js` co `DEMO_PIN=123456`; khong duoc dung lam xac thuc tien that.
- `backend/sepay-sandbox-server.mjs` validate HMAC timestamp / signature Test Mode; webhook chua ACK vi chua co durability.
- SQL v2 `private` schema co RLS enable nhung `service_role` bypass RLS; backend can tu enforce authZ.

## Tai san / tac nhan / ranh gioi
| Tai san | Doi thu/tinh huong | Dieu kien kiem soat | Owner |
|---|---|---|---|
| Balance/transfer sandbox | User A gui request vao account cua B | JWT server + owner check + resource ID bind + 403 | 08 |
| service_role secret | Browser/APK/cac log bi lo | Khong embed, credential server-only, audit secrets scan | 06/14 |
| Webhook TEST | Spoof/replay/duplicate event | HMAC raw body, timestamp, durable unique inbox, idempotency | 09/08 |
| Audit events | Owner/superuser sua log | Trigger guard; export independent sink truoc compliance | 07/13 |
| RBAC | User metadata tu sua quyen | Server-managed role source, test cross-user | 06/08 |
| Idempotency | Concurrent double debit | Unique principal/scope/key + transaction atomic + retries | 07/08 |

## RBAC nhap (khong phai grants hien co)
| Role | Own profile/accounts | Own transfer | All users | Admin audit | Provider ingest |
|---|---|---|---|---|---|
| user | Read/update safe profile | Submit/read own | No | No | No |
| support | Scoped read via trusted API | No monetary write | No bulk access | Redacted scoped | No |
| auditor | No profile write | Read redacted authorized | No modify | Read permitted | No |
| admin | Via approved API | No automatic transfer | Controlled only | Read + review | No |
| service backend | Only trusted operations | Server-authenticated and authorized | Least privilege | Append audit | Controlled |

## P0 gates
- Identiy principal derived from server-validated token; no trust account_id/role from editable client field.
- No direct grants to `anon`/`authenticated` on private tables, including column privilege.
- Explicitly check `CREATE` schema, table/sequence/function grants, `MAINTAIN`, role inheritance and `SET ROLE`.
- Rate-limit auth/transfer, stable request ID, redact sensitive payloads, no data bank that into tests.
- Reject same idempotency key with different hash, no out-of-band transaction duplication.

**Doi chieu doc lap:** Nhom 13. **SEC-01:** CHUA PASS; threat model / RBAC chi la draft phan tich tinh, chua pentest hay integration test.

## Đối chiếu vai trò với SQL v2 — 06/11/2026

SQL nguồn `user_roles` dùng `customer`, `support`, `operations`, `risk_analyst`, `admin` (core v2 dòng 66–72). Ma trận `user/auditor/service backend` ở trên là vai trò sản phẩm đề xuất, không phải enum/grant hiện hữu.

| Vai trò đề xuất | Đối chiếu SQL | Quyết định bản nháp |
| --- | --- | --- |
| user | customer | Alias ở tài liệu; token phải dùng role từ nguồn server tin cậy, không tự đổi SQL |
| support | support | Quyền scoped read phải được backend bảo vệ, không có monetary write |
| auditor | chưa có enum tương ứng | Không suy diễn `risk_analyst` là auditor; chờ Nhóm 06/07/11 chốt permission matrix |
| operations / risk_analyst | đã có trong enum | Chưa có permission API; mặc định từ chối endpoint chưa được cấp rõ |
| admin | admin | Không suy ra quyền chuyển tiền hoặc service_role từ tên admin |
| service backend | PostgreSQL service_role | Danh tính hạ tầng, không là app role/user token; không trao cho client |

Reviewer phải xét scope tài nguyên và quyền từng hành động thay vì chỉ kiểm tra tên vai trò. Chưa nghiệm thu SEC-01 và chưa tạo bất kỳ grant/tài khoản nào.
