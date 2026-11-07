# Nhom 10 — PRD MVP ngan hang mo phong

> Phân loại: BAN NHAP THIET KE/REVIEW. Tai lieu duoc viet dua tren source GitHub main ngay 2026-11-06. Khong coi la code da tich hop, test da PASS, hay 14 nhom AI da nhan viec. Quyen thuc thi theo ../quy-che-thuc-thi.md.

## Hien trang duoc doi chieu
- `frontend/src/App.jsx`: dang nhap demo; man tong quan, chuyen tien, nap demo, QR, lich su, ho so; so du va giao dich la `useState`.
- `frontend/src/lib/bank.js`: so tien so nguyen VND, toi thieu 1.000 VND, so tai khoan 6–19 chu so, nguoi nhan 2–80 ky tu, noi dung toi da 120 ky tu; PIN demo `123456`.
- `docs/kien-truc-he-thong.md`: tien gui va vay nhanh la preview, QR demo `NHTBANK_SANDBOX:`, khong xac nhan tien ve.

## MVP bat buoc (P0)
| Ma | Tinh nang | Quy tac nghiep vu | Ket qua nghiem thu thiet ke |
|---|---|---|---|
| MVP-01 | Tai khoan demo | Tai khoan/thong tin dang nhap khong duoc xem la xac thuc ngan hang that | Luong dang nhap, dang xuat, khoi phuc co phan biet demo/server |
| MVP-02 | So du/lich su | So du va giao dich cung nguon, phan biet du lieu gia lap/du lieu ben vung | Hien thi so nguyen VND, trang thai tai du lieu, sai so va loi |
| MVP-03 | Transfer sandbox | Xac thuc principal, kiem tra chu so huu, so du, tien le, ngan gui trung | State machine + acceptance cases same-key replay/different-hash reject |
| MVP-04 | Bao cao giao dich | Read-only theo nguoi dung, loc theo ngay/trang thai, che thong tin nhay cam | Khong xem du lieu cua user khac |
| MVP-05 | Audit | Log su kien giao dich/loi theo request ID, khong dua OTP/secret vao log | Kiem thu read role + audit integrity |

## Ngoai MVP
- Vay, tiet kiem, the ao, Admin, AI, SePay: chi preview/sandbox cho den khi quy tac API va authorization duoc chot.
- Chuyen khoan that, ket noi tai khoan ngan hang that, ky ket vay that: khong phai MVP.

## Acceptance/edge cases can ban giao
1. So tien duong, VND nguyen, safe integer/DB BIGINT, khong tran so, khong thieu so du.
2. Form invalid -> khong tao giao dich, khong giam so du.
3. Hai yeu cau trung `principal+operation_scope+idempotency_key` va cung request hash -> tra ket qua da commit, chi mot giao dich.
4. Cung key khac hash -> tu choi co ma loi on dinh; hai principal khac nhau co the dung cung key.
5. Loi giua ghi idempotency va ghi business transfer -> rollback nguyen tu; loi sau commit truoc HTTP response -> replay an toan.
6. Khong thay `PIN demo` bang xac thuc tien that; UI sandbox co canh bao ro.

**Ban giao:** 02 (API), 06 (RBAC), 07 (DB), 08 (transfer), 13 (tests). **Trang thai:** PRD ban nhap, chua duoc phe duyet nghiep vu; khong co test runtime.

## Phân biệt hiện trạng và tiêu chí tương lai

- Validation tối thiểu 1.000 VNĐ, tên người nhận 2–80 ký tự và tài khoản 6–19 chữ số ở trên là hành vi frontend hiện có. Không suy diễn đó là field contract đã chốt cho transfer nội bộ qua API v1.
- Phương án API dùng chuỗi số nguyên VNĐ phải giữ chính xác BIGINT; demo Number chỉ nhận safe integer. Fee, min/max API, tự chuyển cùng tài khoản, trạng thái tài khoản, retention và replay horizon vẫn cần quyết định nghiệp vụ có reviewer.
- MVP-02 “cùng nguồn” là yêu cầu cho hệ thống bền vững tương lai. Dữ liệu seed hiện tại là mẫu hiển thị cùng số dư khởi tạo, không phải ledger có thể cộng lịch sử để đối soát.
- Chuyển các quyết định này sang D2-01 trong [Đợt 2](../de-xuat-dot-2.md); chưa phê duyệt PRD hoặc COORD-01.
