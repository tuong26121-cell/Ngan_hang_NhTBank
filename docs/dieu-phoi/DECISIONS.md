# DECISIONS – NhTBank

> **BẢN NHÁP – 2026-11-01**  
> **Mốc bản nháp 2026-11-01** chỉ phân tích. **Quy chế hiện hành 2026-11-06:** cho phép trực tiếp sửa GitHub/`main` và chạy SQL, CI, build, E2E, merge, deploy khi đủ điều kiện; xem [quy chế](quy-che-thuc-thi.md).  
> Quy ước: **KNOWN-HISTORICAL** = thông tin ghi nhận từ công việc trước, chưa xác minh lại; **PROPOSED** = đề xuất; **NOT RUN** = chưa chạy; **BLOCKED** = chờ điều kiện/bằng chứng; **VERIFIED** chỉ khi có bằng chứng hiện thời.

| ID | Quyết định / giả định | Loại | Lý do | Thời điểm rà lại |
|---|---|---|---|---|
| ADR-001 | Website + Mobile App, Android-first | Hướng dự án đã nêu | Chung Backend, tránh chia tách dữ liệu | Khi lựa chọn mobile framework |
| ADR-002 | Futuristic 3D, sáng và tương phản cao | Hướng UI đã nêu | Đồng bộ nhận diện | Khi khóa design system |
| ADR-003 | Sandbox/local/development là mặc định khi chưa có môi trường thực đã thẩm định; tích hợp thực được nghiên cứu/triển khai theo nhiệm vụ đủ điều kiện | Ràng buộc an toàn hiện hành | Tách tiền thật khỏi dữ liệu mẫu, quản trị chi phí | Trước kết nối/triển khai môi trường thực |
| ADR-004 | Chủ repository đã ủy quyền trực tiếp ghi `main`, sửa GitHub Issues, chạy SQL/CI/build/E2E và deploy theo nhiệm vụ; không cần xin lại quyền ghi mỗi lần | Quyền hiện hành từ 2026-11-06 | Tăng tốc triển khai có kiểm soát và bằng chứng | Trước hành động rủi ro phải xác minh đích, khả năng rollback, chi phí |
| ADR-005 | SQL v2.1 là bản thiết kế, A3.5 chưa test | Trạng thái lịch sử | Chưa có log runtime | Trước A3.6 / khi lấy bằng chứng mới |
| ADR-006 | Phạm vi transfer; không thêm reversed | Ràng buộc hiện thời | Chưa có reversal workflow | Khi có thiết kế reversal riêng |
| ADR-007 | Kiểm toán độc lập không do tác giả tự công nhận PASS | Quy chế đề xuất | Giảm xác nhận thiên lệch | Khi định nghĩa gate nhóm 13 |
| ADR-008 | Dùng MASTER-STATUS + HANDOFF-LOG làm nguồn điều phối | Quy chế đề xuất | Giảm lệch giữa các cuộc trò chuyện | Khi người dùng chấp thuận cơ chế |
| ADR-009 | Khóa API/schema/permission trước tích hợp UI | Quy tắc phụ thuộc đề xuất | Giảm rework, tăng an toàn | Khi MVP contract sẵn sàng |
| ADR-010 | Mọi status DONE cần log/source/version | Quy chế đề xuất | Không thổi phồng tiến độ | Mỗi kỳ báo cáo |

## Quy trình thay đổi quyết định

Ghi yêu cầu → phân tích ảnh hưởng, quyền và môi trường → thực hiện trên `main` hoặc nhánh review theo rủi ro (đã có ủy quyền ghi mã/tài liệu) → chạy kiểm thử phù hợp → cập nhật quyết định và HANDOFF-LOG. Giao dịch tiền thật cần xác nhận cụ thể từng giao dịch; chi phí và thay đổi phá hủy dữ liệu cần kiểm soát riêng.

## Bổ sung quyết định điều phối v2 (đề xuất, chưa phê duyệt riêng)

| ID | Quy tắc | Trạng thái |
|---|---|---|
| ADR-011 | 14 nhóm được phân vào bốn đợt; một số phần thiết kế được phép chạy song song | PROPOSED |
| ADR-012 | 07 ↔ 08 trao đổi schema/API qua hai vòng, có phản biện 06 và 13 | PROPOSED |
| ADR-013 | Phân biệt gate thiết kế và gate chạy test/build/deploy; không suy diễn VERIFIED | PROPOSED |
| ADR-014 | `MASTER-STATUS.md` v2 là bảng phụ thuộc/backlog bản nháp; không đồng bộ tự động sang các cuộc trò chuyện | PROPOSED |

## Quyết định mới – 2026-11-06

| ID | Quyết định | Trạng thái |
|---|---|---|
| ADR-015 | Đợt đồng bộ đầu đưa tài liệu lên nhánh riêng; sau đó tài liệu đã được chuyển vào `main`. | Lịch sử đã hoàn tất |
| ADR-016 | Dùng 14 GitHub Issues làm nơi tiếp nhận nhiệm vụ; không coi Issues là tự gửi sang các cuộc trò chuyện ChatGPT. | Đã tạo Issues; chưa kích hoạt nhóm chat |


## ADR-017 – Phan luong khoi dong 14 nhom (2026-11-06)

- Quyet dinh: 9 nhom co the bat dau thiet ke/kiem ke, 5 nhom chi chuan bi truoc khi contract duoc chot. Du kien, chua phai tien do da hoan thanh.
- Thu thap bang chung: 14/14 Issues OPEN; 0 assignee; 0 binh luan nhan viec tai thoi diem doi chieu.
- Nhom 01 cap nhat [bang-giao-viec-20261106.md](bang-giao-viec-20261106.md), thong tin duoc xem la trang thai dieu phoi, khong la ket qua test/compile/deploy.
- Ghi nhận lịch sử lúc khảo sát: chưa merge main/chạy SQL/CI. Quyền hiện hành cho phép cập nhật `main` và thực hiện tác vụ kỹ thuật theo [quy chế](quy-che-thuc-thi.md). Không gán AI ảo làm GitHub assignee.

## ADR-018 — Quyền thực thi trực tiếp trên GitHub (2026-11-06)

- **Đã được chủ repository phê duyệt:** cập nhật `main`, GitHub Issues và tài liệu trực tiếp; chạy SQL/Actions/CI/APK/E2E/merge/deploy theo nhiệm vụ khi đủ preflight.
- Hủy hiệu lực các hạn chế quy trình trước đó ở dạng cấm ghi/chỉ đọc; các ghi nhận lịch sử và gate nghiệm thu vẫn giữ nguyên.
- Không tự chuyển tiền thật, thanh toán chi phí hay chạy migration chưa định danh. Xem [quy chế thực thi](quy-che-thuc-thi.md).

## ADR-020 – De xuat Dot 2 duoc lap tu Dot 1 (2026-11-06)

- Chấp nhận **thứ tự đề xuất** 01 -> 10 -> 02 -> 06 -> 07 <-> 08 -> 13; 03/14 song song và 04/05/09/11/12 chuẩn bị trong khi chờ contract.
- Nhóm 01 đã tổng hợp 9 bản thảo trong [dot-1/](dot-1/). [de-xuat-dot-2.md](de-xuat-dot-2.md) xác định 2A/2B/2C và gate. Điều này không chuyển trạng thái Issues sang VERIFIED hoặc xác nhận agent tự nhận nhiệm vụ.
- SQL v2 A3.6 chưa có final unified diff/test runtime; dòng lịch sử và SHA nguồn giữ nguyên. Quyền thay đổi `main` theo quy chế, kiểm soát gate/Production/giao dịch thật vẫn áp dụng.

## ADR-021 — Đối chiếu vòng2 và căn cứ cho Đợt2 (06/11/2026)

- Không áp lại9 bản nháp đã có hoặc bản vá CI backend đã có ở7f14b3e. Chỉ bổ sung mâu thuẫn/thiếu sót có chứng cứ.
- Error409 đề xuất dùng `IDEMPOTENCY_KEY_REUSED` nhất quán; role mapping và state API/DB phân biệt rõ, không đổi SQL hoặc viết backend chưa chốt contract.
- `GATE-01`–`GATE-10` ở tài liệu07 là mapping đề xuất chưa xác minh định nghĩa gốc; giữ trạng thái CHƯA KIỂM CHỨNG, không lấy runtime v3 thay v2.
-86 test local và build/syntax đã kiểm chứng riêng; các gate SQL/atomic concurrency/thiết bị/production chưa đạt nghiệm thu. Chi tiết [báo cáo](ket-qua-dot-1-20261106.md).
- Đợt2A chốt các quyết định D2-01..06;2B làm03/14 độc lập;2C giữ nghiên cứu sơ bộ04/05/09/11/12. Agent review trong phiên không tạo GitHub assignee hoặc ACK hộ nhóm logic.
