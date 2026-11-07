# Mở khóa Đợt2A: xác minh JWT và quyền tài nguyên

Nguồn: mainc48e3d2; D2-03 và AUTH-ISSUER vẫn chưa triển khai. Chủ repository đã yêu cầu tự động làm phần đủ điều kiện, không hỏi lại thao tác thường quy.

1. Viết test dùng khóa ES256 sinh cục bộ và JWT tổng hợp: token hợp lệ/sai chữ ký/issuer/audience/expired/thiếu exp/alg sai, nguồn role tin cậy, cross-user và failclosed khi lookup lỗi.
2. Thêm jose ghim phiên bản làm thư viện chuẩn; không tự viết thuật toán chữ ký.
3. Module backend/lib/xac-thuc-api.mjs nhận issuer,audience,algorithms,maxTokenAgeSeconds,publicJWKS và lookupPrincipal do backend cung cấp. Không có giá trị trust mặc định, không lấy role/user_metadata trong token làm quyền; không fetch jku/x5u của client.
4. Trả principal bất biến trong context nội bộ; kiểm own-resource/customer trước transfer. Đây là seam backend, không mở route/network và không chấp nhận principal từ body.
5. Chạy test âm/dương, toàn bộ backend/unit/contract và build liên quan; lưu log. Cập nhật MASTER/ROADMAP/Issue draft, push có marker không deployweb, kiểm CI đúng SHA.

Module/test được kiểm chứng không thay sign-off SEC-01. API/session issuance/revocation/confirmation, môi trường thật, auth-provider trust và policy retention vẫn cần đầu vào và review. Không SQL, migration, ledger, giao dịch thật hoặc deploy.
