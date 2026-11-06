# Nhom 02 — Kien truc va API contract v1 nhap

> Phân loại: BAN NHAP THIET KE/REVIEW. Tai lieu duoc viet dua tren source GitHub main ngay 2026-11-06. Khong coi la code da tich hop, test da PASS, hay 14 nhom AI da nhan viec. Quyen thuc thi theo ../quy-che-thuc-thi.md.

## Hien trang code duoc xac minh
- Frontend `React 18.3.1 / Vite 6.4.5` theo `package.json`; `frontend/src/App.jsx` giu balance/transfers trong React memory.
- `frontend/src/lib/demoAuth.js` dung tai khoan demo thiet bi; `AuthGate.jsx` xu ly dang nhap local.
- `backend/sepay-sandbox-server.mjs` la gateway Test Mode, co GET /healthz, GET /api/transactions va POST /api/webhooks/sepay; webhook co chu ky nhung luu ben vung chua co -> tra 503.
- `docs/backend-supabase-architecture-plan.md` chi la kien truc de xuat, khong la backend production da chay.

## Ranh gioi de xuat
```text
Android Capacitor / Web SPA -> API contract (trusted Node backend) -> private PostgreSQL (Supabase dev/local)
                                            |-> SePay Test Mode adapter (no real transfer)
                                            |-> audit / idempotency / webhook inbox
```
- Client: chi token phien/du lieu xem duoc; khong chua `service_role` hoac SePay secrets.
- Backend: verify JWT, principal authorization per resource, request id, rate limit, DTO validation, idempotency.
- DB: `private` khong expose qua Data API, service_role bypass RLS nen trusted backend phai enforce authorization.

## API nhap de review, CHUA ton tai trong code
| Method | Route du kien | Xac thuc | Dung cho | Idempotency |
|---|---|---|---|---|
| GET | `/v1/me` | session server | Ho so/role server | khong |
| GET | `/v1/sandbox/accounts` | JWT + owner check | So du demo | khong |
| GET | `/v1/sandbox/transactions` | JWT + owner check | Lich su | khong |
| POST | `/v1/sandbox/transfers` | JWT + owner + confirmation | Chuyen noi bo mo phong | header `Idempotency-Key` |
| GET | `/v1/sandbox/transfers/:id` | JWT + owner | Doc trang thai da commit | khong |
| GET | `/healthz` | public low info | Suc khoe dich vu | khong |

## Error contract nhap
- `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 IDEMPOTENCY_KEY_REUSED`, `409 INSUFFICIENT_BALANCE`, `429 RATE_LIMITED`, `503 RETRYABLE_UNAVAILABLE` (de xuat, can thong nhat code backend).
- Moi response: `request_id`, `error.code` khi loi, `data` khi thanh cong; khong lo user/secret cua chu the khac.

## Blockers
- Chua co persistent transaction service, chua co JWT verification backend cho app, chua chot PostgreSQL migration.
- Chua cung cap schema/API field-level contract cuoi; endpoint nam tren la proposed, khong phai verified route.

**Ban giao:** 06, 07, 08, 04, 05, 13. **Gate ARCH-01:** CHUA PASS; can review chuoi user permissions, field names, errors va contract phien ban.
