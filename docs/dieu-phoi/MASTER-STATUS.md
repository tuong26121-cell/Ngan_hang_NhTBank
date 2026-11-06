# MASTER-STATUS – NhTBank, 14 nhóm (v2)

> **BẢN NHÁP v2 – 2026-11-05**  
> Cập nhật từ bản nháp trước và ma trận phụ thuộc Nhóm 01 đã thống nhất ở mức đề xuất. Không kiểm tra GitHub trực tiếp trong lượt cập nhật, không chạy SQL, không sửa repository, không merge/deploy.

## 1. Nguyên tắc và trạng thái

- **Nguồn điều phối:** tài liệu bản nháp trong môi trường làm việc; không đồng bộ tự động qua các cuộc trò chuyện.
- **Định hướng:** Website + Mobile App Android-first; backend/API chung, PostgreSQL/Supabase development, giao dịch mô phỏng; giao diện Futuristic 3D nền sáng, rõ chữ.
- **Quyền mặc định:** chỉ đọc, phân tích, thiết kế, phản biện. Việc ghi repository, chạy SQL/test, merge/deploy, kết nối ngân hàng thật hoặc phát sinh chi phí đều phải được phép riêng.
- **Nhóm 01:** đã lập và cập nhật tài liệu điều phối; **không** có nghĩa 13 nhóm kia đã được kích hoạt tự động.
- **Mốc lịch sử Nhóm 07:** A3.5 sửa thiết kế SQL v2.1; A3.6 chưa được kiểm chứng hoàn thành. Core SHA lịch sử `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`, Assertions SHA `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`; cần xác minh lại nguồn tại `codex/nhtbank-sql-hardening-20261031` trước khi lập diff.
- **Không áp dụng:** `testing-v3` cho v2, `reversed` trước khi có reversal workflow, kết luận idempotency/concurrency PASS khi chưa có log.

**Trạng thái:** `PROPOSED` (đề xuất), `IN PROGRESS` (có hoạt động có bằng chứng), `BLOCKED` (thiếu điều kiện), `NOT RUN` (chưa thực thi kiểm thử), `FAIL` (có bằng chứng không đạt), `VERIFIED` (được xác minh bằng chứng trực tiếp), `KNOWN-HISTORICAL` (điểm neo lịch sử chưa tái kiểm). Việc tạo tài liệu bản nháp **không** tự đổi backlog sang VERIFIED.

## 2. Ma trận phụ thuộc 14 nhóm và tiêu chí nghiệm thu thiết kế

| Nhóm | Chủ trì | Ưu tiên | Đầu vào phụ thuộc | Đầu ra/tiêu chí nghiệm thu thiết kế | Gate | Trạng thái backlog |
|---|---|---|---|---|---|---|
| 01 | Trung tâm điều phối | P0 | Không | MASTER-STATUS v2, quyết định, bàn giao, backlog | COORD-01 | PROPOSED |
| 02 | Kiến trúc & API Contract | P0 | 01, 10 | Sơ đồ kiến trúc, API contract v1 nháp, ranh giới dữ liệu | ARCH-01 | PROPOSED |
| 03 | UI/UX & Design System | P1 | 10, 02 | Design tokens, component specification, accessibility | UX-01 | PROPOSED |
| 04 | Website | P1 | 02, 03, 06, 08 | Sitemap, user flows, API integration matrix | UX-01 / ARCH-01 | PROPOSED |
| 05 | Mobile App | P1 | 02, 03, 06, 08 | Android architecture, screen map, build plan | UX-01 / ARCH-01 | PROPOSED |
| 06 | Identity & Security | P0 | 02, 10 | Threat model, RBAC, session & AuthZ boundary | SEC-01 | PROPOSED |
| 07 | Database & Supabase | P0 | 02, 06, 08 (vòng trao đổi) | Diff SQL v2.1 thiết kế; GATE-01..10, ACL, transaction | DB-01 | PROPOSED |
| 08 | Backend & Transfer | P0 | 02, 06, 07 (vòng trao đổi), 10 | OpenAPI, atomic transfer, idempotency & retry contract | TX-01 | PROPOSED |
| 09 | SePay & Webhook | P2 | 06, 07, 08 | Webhook contract, chống replay, rủi ro tích hợp | SEC-01 / TX-01 | PROPOSED |
| 10 | Sản phẩm tài chính | P1 | 01 | PRD/MVP, business rules, acceptance criteria | COORD-01 | PROPOSED |
| 11 | Admin Dashboard | P2 | 03, 06, 08 | Admin sitemap, RBAC, incident/audit flow | SEC-01 / UX-01 | PROPOSED |
| 12 | AI Assistant | P2 | 06, 08, 10 | AI read-only architecture, tool permissions, safety tests | SEC-01 | PROPOSED |
| 13 | QA & Kiểm toán | P0 | 02, 06, 07, 08 (nhận nháp sớm) | Test matrix, independent review, PASS/FAIL criteria | QA-01 | PROPOSED |
| 14 | GitHub & DevOps | P1 | 02, 05, 13 | CI/CD design, môi trường, artifact và rollback plan | OPS-01 | PROPOSED |

**Xử lý phụ thuộc hai chiều 07 ↔ 08:** Vòng 1 Nhóm 07 cung cấp schema draft, Nhóm 08 cung cấp transaction/idempotency contract; vòng 2 đối chiếu các giả định, Nhóm 06 đánh giá bảo mật và Nhóm 13 phản biện độc lập. Không bắt cả hai nhóm chờ nhau hoàn tất toàn bộ.

**Nhóm 13 được khởi động QA design sớm:** có thể viết test matrix từ nháp; chỉ nghiệm thu kiểm thử sau khi có log chạy thật và được phép thực thi.

## 3. Backlog ưu tiên 14 hạng mục

| ID | P | Chủ trì | Phụ thuộc | Công việc | Điều kiện hoàn tất ở mức thiết kế | Trạng thái |
|---|---|---|---|---|---|---|
| NB-P0-01 | P0 | 01 | Không | Chuẩn hóa status, handoff, decision log | MASTER-STATUS v2; nhật ký và checklist thống nhất | PROPOSED |
| NB-P0-02 | P0 | 02 | 01, 10 | Kiến trúc và API v1 | Sơ đồ đầy đủ và contract có version, lỗi, authorization | PROPOSED |
| NB-P0-03 | P0 | 06 | 02, 10 | Threat model/RBAC | Ma trận roles, principals, session, threat cases | PROPOSED |
| NB-P0-04 | P0 | 07 | 02, 06, 08 | Thiết kế A3.6 SQL v2.1 | Unified diff hai file + review GATE-01..10; NOT RUN | PROPOSED |
| NB-P0-05 | P0 | 08 | 02, 06, 07, 10 | Transfer/idempotency | Atomic sequence, replay/hash/race/recovery contract | PROPOSED |
| NB-P0-06 | P0 | 13 | 02, 06, 07, 08 | Kiểm toán độc lập | Test matrix, gate evidence rules, test vẫn NOT RUN | PROPOSED |
| NB-P1-01 | P1 | 10 | 01 | PRD/MVP sandbox | Phạm vi MVP, story, business rules, acceptance | PROPOSED |
| NB-P1-02 | P1 | 03 | 02, 10 | Design system | Tokens + component states + a11y | PROPOSED |
| NB-P1-03 | P1 | 04 | 02, 03, 06, 08 | Website MVP | Sitemap, flows, error states, API mapping | PROPOSED |
| NB-P1-04 | P1 | 05 | 02, 03, 06, 08 | Android MVP | Screen map, security UX, build plan | PROPOSED |
| NB-P1-05 | P1 | 14 | 02, 05, 13 | CI/CD draft | Repo/workflow inventory, environment gates, rollback | PROPOSED |
| NB-P2-01 | P2 | 09 | 06, 07, 08 | SePay Sandbox | Official-doc evidence, webhook protocol and risks | PROPOSED |
| NB-P2-02 | P2 | 11 | 03, 06, 08 | Admin dashboard | Admin permission matrix and incident workflow | PROPOSED |
| NB-P2-03 | P2 | 12 | 06, 08, 10 | AI assistant | Read-only MVP, tool permission, eval cases | PROPOSED |

## 4. Thứ tự thực hiện và điểm khóa

1. **Đợt 1 – Điều phối và hợp đồng nền tảng (01, 02, 10):** scope MVP, kiến trúc, API draft và version control tài liệu. Các nhóm an toàn có thể phản biện sơ bộ đồng thời.
2. **Đợt 2 – Bảo mật, dữ liệu và chuyển khoản (06, 07, 08, 13):** threat model, SQL v2.1 A3.6, atomic transfer/idempotency, test matrix. Nhóm 07/08 trao đổi hai vòng; QA không được tự chứng nhận test PASS.
3. **Đợt 3 – Giao diện và chuẩn bị quy trình build (03, 04, 05, 14):** design system, web/mobile MVP plans, CI/CD design. Phần thiết kế có thể thực hiện song song với đợt 2, nhưng tích hợp phải chờ contract cần thiết.
4. **Đợt 4 – Mở rộng (09, 11, 12):** SePay Sandbox, Admin, AI read-only; không mở kết nối Production.

## 5. Gate điều phối (đều là cổng nghiệm thu thiết kế, không phải kết quả build/test)

| Gate | Chịu trách nhiệm | Điều kiện thiết kế | Trạng thái |
|---|---|---|---|
| COORD-01 | 01 + 10 | MVP scope, phân công, các phiên bản tài liệu và handoff rõ | Đề xuất / chưa nghiệm thu |
| ARCH-01 | 02 | API contract v1, dataflow, authorization boundary có phản biện | Đề xuất / chưa nghiệm thu |
| SEC-01 | 06 + 13 | Threat model và RBAC có bằng chứng review | Đề xuất / chưa nghiệm thu |
| DB-01 | 07 + 13 | Unified diff v2.1 + ma trận ACL + GATE-01..10 được review, chưa chạy SQL | Đề xuất / NOT RUN |
| TX-01 | 08 + 13 | Atomic transfer, replay và concurrency contract có test cases | Đề xuất / NOT RUN |
| UX-01 | 03 | Design system tương thích app/web, accessibility review | Đề xuất / chưa nghiệm thu |
| QA-01 | 13 | Test matrix, PASS/FAIL/BLOCKED và tiêu chuẩn evidence | Đề xuất / test NOT RUN |
| OPS-01 | 14 | CI/CD, tách môi trường, rollback, chi phí; không deploy | Đề xuất / NOT RUN |

## 6. Checklist nghiệm thu áp dụng cho mọi nhóm

- [ ] Đầu ra đúng phạm vi sở hữu, có version và người/nhóm chủ trì.
- [ ] Có nguồn, nhánh, commit hoặc SHA khi sử dụng mã nguồn; ghi rõ có kiểm chứng trong lượt hay không.
- [ ] Có đầu vào phụ thuộc và nhóm nhận bàn giao.
- [ ] Có rủi ro, giả định và đề xuất giảm thiểu.
- [ ] Có acceptance criteria cụ thể, kiểm chứng được.
- [ ] Không nhận PASS/VERIFIED nếu thiếu bằng chứng tương ứng.
- [ ] Không vượt quyền ghi repository, chạy SQL/test, merge hoặc deploy.
- [ ] Có handoff ID và cập nhật vào HANDOFF-LOG khi thật sự bàn giao.

## 7. Evidence và quy tắc chuyển trạng thái

- **Thiết kế đã viết xong:** có thể đánh dấu tài liệu `DRAFT COMPLETE` ở cấp hiện vật, không tự động đánh dấu backlog `VERIFIED`.
- **IN PROGRESS:** phải chỉ ra hoạt động, ngày, người/nhóm, đầu ra đang làm.
- **BLOCKED:** ghi blocker-ID, lý do, owner xử lý, điều kiện mở khóa.
- **VERIFIED:** ghi tài liệu hoặc log gốc, SHA/commit nếu liên quan, điều kiện kiểm tra, thời điểm; tách rõ chứng minh bản thiết kế với chứng minh chạy được.
- **NOT RUN:** bắt buộc với test SQL, API, concurrency, build, APK nếu chưa có log thực thi.

## 8. Phiếu bàn giao tối thiểu

`Handoff-ID | Nhóm gửi → nhóm nhận | Phiên bản tài liệu | Repo/branch/SHA đã xác minh hoặc historical | Đầu ra | Bằng chứng | Giả định/rủi ro | Tiêu chí nhận | Trạng thái | Việc tiếp theo`

## 9. Chưa thực hiện

- Chưa kiểm tra trực tiếp HEAD/PR/workflow GitHub trong lượt cập nhật này.
- Chưa chạy SQL, kiểm thử, build APK hoặc deployment.
- Chưa gửi phiếu bàn giao đến các cuộc trò chuyện khác; các nhóm chưa tự hoạt động.
- Chưa có bằng chứng để tuyên bố bất kỳ gate kỹ thuật nào PASS.