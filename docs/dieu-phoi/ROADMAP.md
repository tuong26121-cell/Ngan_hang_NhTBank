# ROADMAP – NhTBank

> **BẢN NHÁP – 2026-11-01**  
> Phạm vi: phân tích và điều phối; chưa kiểm tra GitHub trực tiếp trong lượt này; không chạy SQL, không ghi repository, không merge/deploy.  
> Quy ước: **KNOWN-HISTORICAL** = thông tin ghi nhận từ công việc trước, chưa xác minh lại; **PROPOSED** = đề xuất; **NOT RUN** = chưa chạy; **BLOCKED** = chờ điều kiện/bằng chứng; **VERIFIED** chỉ khi có bằng chứng hiện thời.

## Giai đoạn 0 – Quản trị và kiểm kê (P0)
- Nhóm 01 lập nguồn tiến độ thống nhất; nhóm 02 inventory kiến trúc; nhóm 14 kiểm tra repository read-only khi được yêu cầu.
- Gate: có bảng scope, owner, dependency và source/version được kiểm chứng.

## Giai đoạn 1 – Khóa an toàn nền tảng (P0)
- Nhóm 06 xây dựng threat model / RBAC.
- Nhóm 07 hoàn thiện thiết kế SQL v2.1 A3.6; nhóm 13 phản biện độc lập; **không chạy SQL** theo ràng buộc hiện hành.
- Nhóm 08 xác định transfer atomic/idempotency contract; nhóm 02 khóa API v1 dự thảo.
- Gate: specs không mâu thuẫn, blocker được liệt kê, mọi test còn `NOT RUN` nếu chưa thực thi.

## Giai đoạn 2 – MVP sản phẩm và giao diện (P1)
- Nhóm 10 khóa sản phẩm MVP; nhóm 03 design tokens.
- Nhóm 04 Website và nhóm 05 Android xây screen maps và prototypes.
- Gate: screens ↔ API contract ↔ nghiệp vụ nhất quán, không đánh tráo mock thành dữ liệu thật.

## Giai đoạn 3 – Tích hợp development (P1–P2, chỉ sau phê duyệt)
- Nhóm 08 tích hợp Backend, nhóm 09 khảo sát SePay Test Mode, nhóm 11 Admin, nhóm 12 AI read-only.
- Nhóm 13 định nghĩa và sau này thực thi test khi được cho phép; nhóm 14 tổ chức CI/Preview không Production.
- Gate: có bằng chứng build/test thực tế, không có P0 blocker, chi phí được kiểm soát.

## Giai đoạn 4 – Nghiệm thu và quyết định triển khai (tương lai)
- Security review, release checklist, recovery plan, approvals riêng cho từng môi trường.
- **Không tự kích hoạt giai đoạn này.**

## Thứ tự ưu tiên tuần làm việc tiếp theo (không có lịch tự động)
1. 01: phê duyệt/hiệu chỉnh danh mục 14 nhóm và quy tắc trạng thái.
2. 02 + 10: chốt MVP scope và API contract nháp.
3. 06 + 07: rà GATE SQL v2.1 và phản biện ACL/transaction.
4. 08: đặc tả idempotency/concurrency dựa trên contract.
5. 13: kế hoạch kiểm thử độc lập, tất cả tests NOT RUN.

## Đồng bộ thứ tự phụ thuộc v2 (2026-11-05)

- **Đợt 1:** 01/02/10 – điều phối, scope MVP, contract nền tảng.
- **Đợt 2:** 06/07/08/13 – bảo mật, SQL A3.6, transfer/idempotency, QA độc lập. Nhóm 07 và 08 trao đổi hai vòng.
- **Đợt 3:** 03/04/05/14 – Design System, Website, Android, CI/CD design; có thể khởi động thiết kế sớm nhưng không tích hợp khi thiếu contract.
- **Đợt 4:** 09/11/12 – SePay Sandbox, Admin, AI Assistant.

**Gate điều phối:** COORD-01, ARCH-01, SEC-01, DB-01, TX-01, UX-01, QA-01, OPS-01. Toàn bộ đang ở mức thiết kế/đề xuất; không có test được chạy trong lượt cập nhật. Chi tiết điều kiện nằm tại `MASTER-STATUS.md` v2 mục 5.