# HANDOFF-LOG – NhTBank

> **BẢN NHÁP – 2026-11-01**  
> **Lịch sử 2026-11-01:** chỉ lập handoff. **Hiện hành 2026-11-06:** cho phép trực tiếp sửa `main`/Issues, chạy SQL/test/Actions/APK/E2E/merge/deploy theo nhiệm vụ khi đủ preflight; xem [quy chế](quy-che-thuc-thi.md).  
> Quy ước: **KNOWN-HISTORICAL** = thông tin ghi nhận từ công việc trước, chưa xác minh lại; **PROPOSED** = đề xuất; **NOT RUN** = chưa chạy; **BLOCKED** = chờ điều kiện/bằng chứng; **VERIFIED** chỉ khi có bằng chứng hiện thời.

## Phiếu bàn giao mẫu

```text
Handoff-ID: NB-HO-YYYYMMDD-001
Từ nhóm: 07
Đến nhóm: 13
Tiêu đề: Review độc lập SQL v2.1 A3.6
Nguồn: repository/branch/path/commit-SHA (xác minh lại)
Phạm vi: thiết kế/review, thực thi thay đổi và test liên quan nếu đã đáp ứng điều kiện của nhiệm vụ và quy chế
Artifact: liên kết/nội dung diff và GATE matrix
Điều đã xác minh: (bằng chứng)
Điều chỉ đề xuất: (thiết kế, giả định)
Rủi ro / blocker: ...
Yêu cầu nhận: xác nhận tiếp nhận và phản biện từng hunk
Trạng thái: PROPOSED
```

## Bàn giao khởi tạo (dự kiến, chưa gửi)

| ID | Từ → Đến | Nội dung | Tình trạng |
|---|---|---|---|
| NB-HO-001 | 01 → 02 | Đặc tả kiến trúc & API contract | PROPOSED / chưa gửi |
| NB-HO-002 | 10 → 08 | Chốt business rules transfer sandbox | PROPOSED / chưa gửi |
| NB-HO-003 | 07 → 13 | Review diff v2.1 sau A3.6 | BLOCKED – A3.6 chưa hoàn tất |
| NB-HO-004 | 06 → 07 | Threat model + permission rules | PROPOSED / chưa gửi |
| NB-HO-005 | 13 → 14 | QA gates trước CI | BLOCKED – test plan chưa chốt |

**Lưu ý:** Việc ghi một phiếu vào file này không tự động gửi thông báo hoặc đồng bộ các cuộc trò chuyện khác.

## Quy tắc bàn giao v2 (đang áp dụng cho điều phối)

Khi gửi nhiệm vụ cần có `Gate-ID`, tiêu chí nghiệm thu, version artifact, bằng chứng, trạng thái và nhóm nhận. Mẫu đầy đủ xem `MASTER-STATUS.md` v2 mục 8. Các dòng handoff khởi tạo ở trên **chưa được gửi**, không tạo ra nhiệm vụ tự động.

## Ghi nhan phan cong tren GitHub – 2026-11-06

- Da tao 14 GitHub Issues (#32–#45) tuong ung 14 nhom; xem [huong-dan-phan-cong.md](huong-dan-phan-cong.md).
- Chua gui tu dong phieu ban giao vao cuoc tro chuyen ChatGPT nao; cac handoff du kien van chua duoc tiep nhan.
- Viec nhan viec can phieu HANDOFF co bang chung, chu khong phai suy dien tu Issue da tao.


## Dot phan cong 2026-11-06 – chua co phieu tiep nhan

- [Bang giao viec](bang-giao-viec-20261106.md) phan 9 nhom du dieu kien bat dau thiet ke/kiem ke va 5 nhom chi chuan bi.
- 14/14 Issues #32–#45 dang OPEN, khong assignee, khong binh luan xac nhan nhan viec tai thoi diem doi chieu.
- Nhom 01 dang dieu phoi trong chat; khong dung thong tin nay lam bang chung cac nhom 02–14 da nhan viec.
- **Dieu kien chuyen CHUA XAC NHAN -> DA TIEP NHAN:** co phan hoi tu nhom/agent/nguoi duoc giao, dinh kem issue, artifact, pham vi va thoi diem. Neu khong, giu PROPOSED.
- Khong tu dong cap nhat GitHub Issues sau khi nhan ket qua o mot cuoc tro chuyen khac; can thao tac co quyen rieng.

## Tình trạng nhận việc sau khi kiểm tra Issues – 2026-11-06

- Nhóm 01 đã cập nhật điều phối và bảng giao việc trên nhánh tài liệu; đây là hoạt động trong cuộc trò chuyện hiện tại.
- GitHub Issues #32–#45 đã được cập nhật về mức độ sẵn sàng; chưa có xác nhận 13 nhóm còn lại đã nhận việc hoặc bắt đầu triển khai.
- **Sẵn sàng thiết kế:** 01, 02, 03, 06, 07, 08, 10, 13, 14.
- **Chờ contract trước tích hợp:** 04, 05, 09, 11, 12.
- Chi tiết, phụ thuộc và việc đầu tiên: [bang-giao-viec-20261106.md](bang-giao-viec-20261106.md).
- Chưa được coi là bàn giao hợp lệ nếu không có xác nhận tiếp nhận, artifact, bằng chứng và `Handoff-ID`. Không tự gửi tin nhắn sang các cuộc trò chuyện khác.


> **Quyền đang áp dụng 2026-11-06:** Tài liệu này tuân thủ [quy chế thực thi](quy-che-thuc-thi.md): được trực tiếp sửa GitHub/`main`, chạy Actions/CI/APK/E2E và deploy theo nhiệm vụ; SQL cần xác minh môi trường và migration; giao dịch tiền thật cần xác nhận riêng từng giao dịch. Phần lịch sử không thay thế bằng chứng thực tế.

## Hang doi handoff Dot 1 -> Dot 2 (2026-11-06)

| ID | Tu -> Den | Noi dung | Trang thai |
|---|---|---|---|
| HO-2-10-02 | 10 -> 02 | PRD MVP va validation transfer -> OpenAPI | PROPOSED / chua ACK |
| HO-2-02-06 | 02 -> 06 | Auth/session boundary -> threat/RBAC | PROPOSED / chua ACK |
| HO-2-02-07-08 | 02 -> 07/08 | API+schema+atomic transfer two-pass | PROPOSED / chua ACK |
| HO-2-07-13 | 07 -> 13 | Unified diff A3.6 khi co -> SQL static review | BLOCKED / chua co final diff |
| HO-2-08-13 | 08 -> 13 | Idempotency + concurrency scenarios | PROPOSED / chua ACK |
| HO-2-03-04-05 | 03 -> 04/05 | Design tokens va UI states | PROPOSED / chua ACK |
| HO-2-13-14 | 13 -> 14 | QA release gates -> CI | PROPOSED / chua ACK |

9 bản chuyên môn trong [dot-1/](dot-1/) là artifact nguồn do nhóm điều phối soạn. Handoff chỉ xác nhận khi có người nhận, artifact/version, kết quả review; tạo Issue không làm chatbot khác tự khởi chạy. Xem [đề xuất Đợt 2](de-xuat-dot-2.md).
