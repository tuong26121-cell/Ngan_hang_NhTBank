# ARCHITECTURE – NhTBank (bản phác thảo)

> **BẢN NHÁP – 2026-11-01**  
> **Phạm vi khi lập bản nháp 2026-11-01:** chỉ phân tích. **Quyền hiện hành từ 2026-11-06:** được sửa trực tiếp GitHub/`main`, chạy SQL/test/build/CI và deploy theo nhiệm vụ và preflight. Xem [quy chế](quy-che-thuc-thi.md).  
> Quy ước: **KNOWN-HISTORICAL** = thông tin ghi nhận từ công việc trước, chưa xác minh lại; **PROPOSED** = đề xuất; **NOT RUN** = chưa chạy; **BLOCKED** = chờ điều kiện/bằng chứng; **VERIFIED** chỉ khi có bằng chứng hiện thời.

## Thành phần và luồng đề xuất

```mermaid
flowchart TD
  U[Người dùng] --> W[Website]
  U --> M[Android App / iOS tương lai]
  W --> API[Backend API]
  M --> API
  API --> AUTH[Identity/AuthZ Boundary]
  API --> TR[Transfer engine sandbox]
  API --> AI[AI assistant read-only MVP]
  API --> DB[(PostgreSQL / Supabase development)]
  TR --> DB
  API --> WH[Webhook inbox / SePay Test Mode chỉ khi xác minh]
  WH --> DB
  ADMIN[Admin dashboard] --> API
  QA[QA độc lập] -. kiểm tra .-> API
  QA -. kiểm tra .-> DB
```

## Hợp đồng chưa chốt

1. Identity: xác minh principal đáng tin ở backend; front-end không tự quyết định phân quyền.
2. Giao dịch: sandbox VND; atomic mutation; idempotency bằng `(principal_key, operation_scope, idempotency_key)` và canonical request hash.
3. Dữ liệu: service_role quyền tối thiểu; schema `private` không exposed; RLS và ACL cần kiểm chứng; không ghi secrets/OTP trong audit.
4. Webhook: xác thực nguồn, chống trùng và retry; chỉ dùng API/Test Mode thực tế đã xác minh.
5. AI: đọc dữ liệu được cấp quyền; không có quyền sửa số dư hay chuyển tiền.
6. Trải nghiệm: web/mobile dùng chung design tokens, nhưng có các luồng bảo mật riêng theo nền tảng.

## Phụ thuộc cần khóa

- Nhóm 10 → 02 (business scope → API).
- Nhóm 02 + 06 + 07 → 08 (contract + auth + schema → transfer engine).
- Nhóm 03 + 02 + 06 → 04/05 (design + API + security → UI).
- Nhóm 06 + 07 + 08 → 13 (threat model + schema + transfer → security testing).
- Nhóm 13 → 14 (gates → CI/release policy).

## Mở rộng phạm vi có kiểm soát

Được triển khai, build APK và chuẩn bị Production khi nhiệm vụ và điều kiện kỹ thuật đầy đủ. Giao dịch ngân hàng thật vẫn cần hệ thống hợp lệ, chi tiết giao dịch và xác nhận cho từng lệnh; không biến transfer sandbox thành tiền thật. Reversal phải có workflow riêng; không dùng runner v3 cho SQL v2. Tham chiếu [quy chế](quy-che-thuc-thi.md).

## Phụ lục điều phối v2 (2026-11-05, PROPOSED)

- Nguồn phụ thuộc chi tiết là `MASTER-STATUS.md` v2, mục 2; sơ đồ trong tài liệu này chỉ thể hiện ràng buộc chính.
- Cặp 07 (DB) và 08 (Backend) trao đổi schema draft ↔ transaction/idempotency contract hai vòng; 06 và 13 phản biện.
- Gate: ARCH-01, SEC-01, DB-01, TX-01, UX-01. Chưa có gate nào được xác minh là PASS.