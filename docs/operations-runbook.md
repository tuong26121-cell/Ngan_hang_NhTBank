# Vận hành và diễn tập NhTBank Sandbox

## Bắt đầu

Node 24+, `npm ci`, `npm run build`, `npm run platform:serve`. Mở `http://127.0.0.1:3001/?runtime=server`, PIN **123456**, rồi vào **Cá nhân → Không gian vận hành**. Giao diện cũ không cần backend khi không dùng `runtime=server`.

Tại Không gian vận hành có **Đổi vai trò thử nghiệm**. Cả khách hàng, vận hành và phê duyệt đều là danh tính mẫu dùng PIN 123456. Đổi vai trò giữ dữ liệu; đăng xuất chỉ đặt lại dữ liệu trong chế độ bộ nhớ. SQLite giữ sổ qua đăng xuất, tải lại và khởi động lại server; session server không bền qua khởi động lại.

## Diễn tập trọn luồng sai lệch

1. Ở chế độ bộ nhớ, chọn vai trò **Nhân viên vận hành thử nghiệm**.
2. Mở **Phòng thử lỗi có kiểm soát**, bấm **Tạo sai lệch thử nghiệm**. Hành động có audit, cộng lệch bộ đệm 1.000 VNĐ và không thay sổ gốc.
3. **Chạy đối soát**: kiểm tra expected/actual, tài khoản bị cô lập và sự cố đang mở. Ghi nợ mới bị chặn cả trước khi đối soát nếu phát hiện sổ không khớp.
4. **Đề xuất xây lại số dư**, ghi lý do/bằng chứng 10–500 ký tự.
5. Đổi sang **Người phê duyệt thử nghiệm**. Vai trò vận hành không có nút tự duyệt; lõi còn chặn cùng ID dù đổi quyền.
6. Mỗi sự cố chỉ có một đề xuất chờ; gửi lại cùng lý do/người lập trả đề xuất cũ. Nếu bằng chứng đổi, người phê duyệt từ chối bản chờ rồi vận hành lập lại. **Phê duyệt xử lý** và ghi nhận xét. Hệ thống so lại bằng chứng, xây bộ đệm, đối soát lại, lưu kết quả và audit rồi mới bỏ cô lập. Sổ gốc giữ nguyên.
7. Thử **Từ chối đề xuất** hoặc thay đổi bằng chứng trong test: tài khoản vẫn bị cô lập. Không sửa tiền thủ công.

Lab trên máy chủ mặc định **tắt**. Muốn diễn tập trên DB Sandbox riêng: chạy với `NHT_LAB_ENABLED=1`, `NHT_DATABASE` và `NHT_BACKUP_DIR` trỏ tới thư mục thử riêng. Không bật lab cho dữ liệu cần giữ.

## Thông báo

Sau chuyển tiền, sự kiện nằm ở outbox. Worker trong backend kiểm tra mỗi giây; UI vận hành có nút xử lý thủ công một sự kiện đến hạn. Chế độ trình duyệt không có worker nền, cần bấm nút vận hành. Kiểm tra pending/processing/delivered/dead-letter và audit; không thay số dư để “gửi lại”. Bản thử chỉ có thông báo nội bộ, không gửi SMS/email/push thiết bị.

Nếu tiến trình dừng giữa claim và ack, khi khởi động lại chờ lease hết hạn rồi xử lý lại. Hộp nhận dùng khóa sự kiện để chống trùng. Chưa có cảnh báo trực ca hay kênh thông báo ngoài hệ thống.

## Sao lưu và khôi phục thử

- SQLite: **Tạo bản sao thử nghiệm** dùng API online backup, kiểm tra integrity và đối soát, lưu `.sqlite` + manifest SHA-256 vào thư mục backup. DB đang có sai lệch sẽ bị từ chối sao lưu xác nhận.
- **Diễn tập khôi phục** kiểm tra checksum với bản ghi đã lưu, chép sang tệp riêng, mở readonly, kiểm tra integrity/schema và tính lại sổ. Xóa tệp diễn tập sau kiểm tra. Không có endpoint ghi đè DB đang chạy.
- Bộ nhớ: chỉ chụp JSON trong Map của phiên và đọc lại bản cách ly. Tải lại làm mất bản chụp. UI nói rõ đây không phải sao lưu máy chủ.
- DB/backup tạo với quyền tệp 0600, thư mục 0700 trên hệ thống hỗ trợ. Không đưa chúng vào Git. Phiên đăng nhập không nằm trong bản sao.

Đây là bản sao **cùng máy**, chưa có ngoài vùng/ngoài máy hoặc mã hóa backup. Checksum phát hiện hỏng ngoài ý muốn, không chống người có toàn quyền máy sửa cả manifest/DB. Chưa đo hoặc cam kết RPO/RTO. Khôi phục sản xuất, chọn thời điểm, chuyển lưu lượng và diễn tập mất máy chưa có trong bản này.

## Cấu hình cục bộ không bí mật

| Biến                   | Mặc định / ý nghĩa                                                     |
| ---------------------- | ---------------------------------------------------------------------- |
| `NHT_PORT`             | 3001, bind 127.0.0.1                                                   |
| `NHT_DATABASE`         | `backend/.data/ledger.sqlite`                                          |
| `NHT_BACKUP_DIR`       | `backend/.data/backups`                                                |
| `NHT_LAB_ENABLED`      | tắt; `1` chỉ cho lab DB thử                                            |
| `NHT_FRONTEND_ORIGINS` | hai nguồn Vite localhost:5173; danh sách tách dấu phẩy, không wildcard |
| `NHT_BACKEND_URL`      | Vite proxy, mặc định `http://127.0.0.1:3001`                           |
| `NHT_COOKIE_SECURE`    | `1` khi chạy sau HTTPS phù hợp; không bật trên HTTP localhost          |

Giữ nguyên proxy/TLS của môi trường chạy. GitHub Pages chỉ chạy bản bộ nhớ, không chạy Node/SQLite. Không bỏ quy tắc bảo vệ nhánh để xuất bản.

## Diễn tập mất mạng v2

1. Mở `?runtime=server`, đăng nhập, chọn chuyển nội bộ → **Dùng tài khoản nội bộ mẫu**, nhập 100.000 VNĐ, kiểm tra và PIN.
2. DevTools có thể chặn POST trước gửi hoặc làm rơi phản hồi sau khi máy chủ commit. Hai tình huống đều phải giữ nguyên hồ sơ/mã trên thiết bị, không báo thất bại chỉ vì mất kết nối.
3. Tải lại. Ứng dụng tra cứu mã cũ. Nếu posted: mở biên nhận ngay, không POST lại. Nếu not_found: nhập PIN vào **Gửi lại cùng mã yêu cầu**. Nếu accepted: chờ tối đa 3 kiểm tra tự động rồi kiểm tra thủ công.
4. Phiên hết hạn: đăng nhập lại để tra cứu; không xóa localStorage, sửa lệnh hoặc tạo mã khác. Nếu mất hồ sơ, đối chiếu lịch sử và nhờ vận hành trước khi tạo ý định mới.
5. Sau khi đã xác nhận posted/rejected, đóng kết quả để bắt đầu ý định mới. Hồ sơ chỉ bị xóa theo thao tác đóng kết quả, không xóa khi đăng xuất. Web Locks yêu cầu HTTPS/localhost hỗ trợ API này.

## Bút toán bù

Vào vận hành bằng operator → chọn giao dịch → **Đề xuất đảo giao dịch**, nhập lý do. Đổi sang approver khác → xem loại đề xuất/giao dịch gốc → phê duyệt hoặc từ chối. Bên nhận phải đủ số dư để bù, sổ và tài khoản không bị cô lập. Giao dịch gốc giữ nguyên, lịch sử thêm bút toán bù. Chưa có đảo một phần hoặc bù từ tiền thật.

## Kiểm tra yêu cầu quanh mốc sao lưu

Sau tạo bản sao, nếu có giao dịch/receipt mới rồi diễn tập bản sao cũ, giao diện phải ghi **Cần điều tra mốc khôi phục**. Đọc danh sách accepted-at-cut, yêu cầu ngoài snapshot và kết quả/bút toán thiếu, sự kiện/inbox thay đổi sau mốc và tình trạng cô lập của nguồn hiện tại. Không lấy checksum đúng hoặc số dư khớp riêng bản sao để mở lại hệ thống.

Báo cáo `readyToOpen: true` chỉ xác nhận diễn tập ở thời điểm nguồn đối chiếu còn sẵn. Khi mất máy thật, nguồn đối chiếu này cũng có thể mất; cần nguồn độc lập ngoài máy, kế hoạch hồi phục và kiểm tra thủ công trước triển khai. Bản này không tự ghi đè/replay DB phục hồi. Bản sao v1 cần chuyển đổi riêng trước khi kiểm bằng code v2; chưa có công cụ tự chuyển backup cũ.
