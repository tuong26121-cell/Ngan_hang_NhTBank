# HANDOFF-LOG – NhTBank

> **BẢN NHÁP – 2026-11-01**  
> Phạm vi: phân tích và điều phối; chưa kiểm tra GitHub trực tiếp trong lượt này; không chạy SQL, không ghi repository, không merge/deploy.  
> Quy ước: **KNOWN-HISTORICAL** = thông tin ghi nhận từ công việc trước, chưa xác minh lại; **PROPOSED** = đề xuất; **NOT RUN** = chưa chạy; **BLOCKED** = chờ điều kiện/bằng chứng; **VERIFIED** chỉ khi có bằng chứng hiện thời.

## Phiếu bàn giao mẫu

```text
Handoff-ID: NB-HO-YYYYMMDD-001
Từ nhóm: 07
Đến nhóm: 13
Tiêu đề: Review độc lập SQL v2.1 A3.6
Nguồn: repository/branch/path/commit-SHA (xác minh lại)
Phạm vi: chỉ thiết kế, review; không thực thi
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

## Quy tắc bàn giao v2 (đề xuất)

Khi gửi nhiệm vụ cần có `Gate-ID`, tiêu chí nghiệm thu, version artifact, bằng chứng, trạng thái và nhóm nhận. Mẫu đầy đủ xem `MASTER-STATUS.md` v2 mục 8. Các dòng handoff khởi tạo ở trên **chưa được gửi**, không tạo ra nhiệm vụ tự động.

## Ghi nhan phan cong tren GitHub – 2026-11-06

- Da tao 14 GitHub Issues (#32–#45) tuong ung 14 nhom; xem [huong-dan-phan-cong.md](huong-dan-phan-cong.md).
- Chua gui tu dong phieu ban giao vao cuoc tro chuyen ChatGPT nao; cac handoff du kien van chua duoc tiep nhan.
- Viec nhan viec can phieu HANDOFF co bang chung, chu khong phai suy dien tu Issue da tao.
