# DECISIONS – NhTBank

> **BẢN NHÁP – 2026-11-01**  
> Phạm vi: phân tích và điều phối; chưa kiểm tra GitHub trực tiếp trong lượt này; không chạy SQL, không ghi repository, không merge/deploy.  
> Quy ước: **KNOWN-HISTORICAL** = thông tin ghi nhận từ công việc trước, chưa xác minh lại; **PROPOSED** = đề xuất; **NOT RUN** = chưa chạy; **BLOCKED** = chờ điều kiện/bằng chứng; **VERIFIED** chỉ khi có bằng chứng hiện thời.

| ID | Quyết định / giả định | Loại | Lý do | Thời điểm rà lại |
|---|---|---|---|---|
| ADR-001 | Website + Mobile App, Android-first | Hướng dự án đã nêu | Chung Backend, tránh chia tách dữ liệu | Khi lựa chọn mobile framework |
| ADR-002 | Futuristic 3D, sáng và tương phản cao | Hướng UI đã nêu | Đồng bộ nhận diện | Khi khóa design system |
| ADR-003 | Sandbox/local/development là mặc định | Ràng buộc | Ngăn giao dịch thật và giảm chi phí | Trước bất kỳ deployment nào |
| ADR-004 | Không chạy SQL/ghi GitHub khi chưa có phê duyệt | Ràng buộc | Ngăn thay đổi ngoài phạm vi | Trước từng thao tác ghi/thực thi |
| ADR-005 | SQL v2.1 là bản thiết kế, A3.5 chưa test | Trạng thái lịch sử | Chưa có log runtime | Trước A3.6 / khi lấy bằng chứng mới |
| ADR-006 | Phạm vi transfer; không thêm reversed | Ràng buộc hiện thời | Chưa có reversal workflow | Khi có thiết kế reversal riêng |
| ADR-007 | Kiểm toán độc lập không do tác giả tự công nhận PASS | Quy chế đề xuất | Giảm xác nhận thiên lệch | Khi định nghĩa gate nhóm 13 |
| ADR-008 | Dùng MASTER-STATUS + HANDOFF-LOG làm nguồn điều phối | Quy chế đề xuất | Giảm lệch giữa các cuộc trò chuyện | Khi người dùng chấp thuận cơ chế |
| ADR-009 | Khóa API/schema/permission trước tích hợp UI | Quy tắc phụ thuộc đề xuất | Giảm rework, tăng an toàn | Khi MVP contract sẵn sàng |
| ADR-010 | Mọi status DONE cần log/source/version | Quy chế đề xuất | Không thổi phồng tiến độ | Mỗi kỳ báo cáo |

## Quy trình thay đổi quyết định

Ghi yêu cầu → phân tích ảnh hưởng các nhóm → owner phản biện → người dùng phê duyệt nếu tác động mã/chi phí/hệ thống → cập nhật quyết định và ghi vào HANDOFF-LOG.

## Bổ sung quyết định điều phối v2 (đề xuất, chưa phê duyệt riêng)

| ID | Quy tắc | Trạng thái |
|---|---|---|
| ADR-011 | 14 nhóm được phân vào bốn đợt; một số phần thiết kế được phép chạy song song | PROPOSED |
| ADR-012 | 07 ↔ 08 trao đổi schema/API qua hai vòng, có phản biện 06 và 13 | PROPOSED |
| ADR-013 | Phân biệt gate thiết kế và gate chạy test/build/deploy; không suy diễn VERIFIED | PROPOSED |
| ADR-014 | `MASTER-STATUS.md` v2 là bảng phụ thuộc/backlog bản nháp; không đồng bộ tự động sang các cuộc trò chuyện | PROPOSED |