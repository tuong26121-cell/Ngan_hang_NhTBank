# Mô hình an toàn của bản thử

## Bảo vệ đã có trong phạm vi mô phỏng

- Máy chủ kiểm tra phiên và quyền từ session phía server, không tin role/actor gửi trong lệnh.
- Cookie HttpOnly/SameSite=Strict, tùy chọn Secure cho HTTPS; phiên token ngẫu nhiên và hash khóa lưu trong RAM, hết hạn 30 phút, thu hồi khi đăng xuất/đổi danh tính.
- Origin allowlist và CSRF token cho thao tác ghi, không mở CORS, giới hạn JSON 16 KiB; lỗi không lộ stack/SQL.
- Sau 5 PIN sai trong một phút, tạm chặn địa chỉ đó. Không ghi PIN vào log, audit, DB hoặc backup.
- Quyền chủ tài khoản, số nguyên VNĐ, số dư và hạn mức kiểm tra lại trong transaction; tài khoản cô lập không được ghi nợ.
- Khóa chống lặp có phạm vi chủ thể + nội dung, SQL transaction và ràng buộc duy nhất; trigger bất biến cùng kiểm tra append-only của repository.
- Bằng chứng phê duyệt phải khớp, người duyệt khác người lập; đối soát lại trước bỏ cô lập.
- API chỉ bind loopback theo lệnh chạy mặc định. Bản web được phục vụ với CSP cơ bản; khóa/credential ngoài không được nhúng vào trình duyệt.

## Những điều không được suy diễn

PIN 123456 công khai và ai cũng có thể chọn tài khoản thử nghiệm. Đây **không phải** xác thực, RBAC hay MFA đủ cho sản phẩm thật. Chế độ bộ nhớ có thể sửa bằng công cụ trình duyệt; không gọi đó là kiểm soát bảo mật máy chủ. Cookie tốt không biến danh tính demo thành tài khoản thật.

SQLite/audit chỉ được bảo vệ trong quyền ứng dụng và schema hiện có. Người quản trị máy hoặc người có toàn quyền DB vẫn có thể bỏ trigger/sửa dữ liệu. Chưa có WORM, chữ ký/HSM, KMS, luân chuyển bí mật, mã hóa backup, kiểm thử xâm nhập hoặc chứng nhận tuân thủ.

Bản sao cùng máy không phải chống mất máy. Chưa có HA, phân vùng mạng, replica/quorum, chống DDoS hoặc chứng minh exactly-once cho kênh thông báo ngoài. Đối soát độc lập về thuật toán, chưa có đối soát với sao kê ngân hàng thật.

Lab cố ý tạo số dư bộ đệm sai để kiểm tra cơ chế chặn; mặc định server tắt. Không thêm endpoint đặt số dư tùy ý, xóa lịch sử hoặc bỏ qua phê duyệt. Không công khai phiên bản này để nhận dữ liệu nhạy cảm.

Các yêu cầu triển khai thật cần một dự án kiểm soát riêng: danh tính mạnh, phân quyền quản trị, bảo vệ dữ liệu, giới hạn vận hành, quản trị khóa, đối soát ngoài, khôi phục mất vùng và đánh giá chuyên môn. Bản hiện tại không nhận hoặc chuyển tiền thật.

## Hồ sơ phục hồi yêu cầu trong trình duyệt

Chế độ server lưu mã và nội dung chuyển tiền mẫu vào localStorage để nối lại qua tải lại/đăng nhập lại, không lưu PIN, token phiên hoặc CSRF. Dữ liệu này cùng nguồn trang có thể đọc, chưa mã hóa; chỉ dùng dữ liệu mẫu. Web Locks tuần tự hóa các tab; máy chủ vẫn kiểm quyền, fingerprint và key, không tin localStorage làm bằng chứng giao dịch.

Không tự xóa hồ sơ chưa rõ kết quả. Xóa storage, đổi thiết bị/origin, cố ý chọn mã khác hoặc khôi phục máy chủ mất receipt mới hơn nằm ngoài bảo đảm chống lặp của cùng ý định. Thiếu Web Locks/storage thì chặn gửi mới. Giữ receipt và kết quả không có thời hạn xóa tự động trong Sandbox này.

Receipt đã tiếp nhận là quyền xử lý đúng lệnh được xác nhận tại thời điểm nhận; hết phiên không hủy quyền đó. Worker chỉ đọc receipt bất biến từ DB. Phê duyệt đảo không sửa lịch sử gốc, phải kiểm sổ, số dư đích và khác người lập. Recovery chỉ diễn tập và báo chặn nếu thiếu dữ liệu; không có API thay DB đang phục vụ.
