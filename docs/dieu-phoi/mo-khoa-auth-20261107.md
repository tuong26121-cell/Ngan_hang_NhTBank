# Mở khóa Đợt2A — module xác thực API, 07/11/2026

Nguồn main đã đọc: c48e3d2563c5e9e2f2d3fb2ad50e72b68ef6aad6. Chưa có JWT verifier trong backend, nên chọn D2-03 làm bước độc lập tiếp theo. Không lặp OpenAPI/utility/hash đã bàn giao.

## Đã triển khai và kiểm chứng

`backend/lib/xac-thuc-api.mjs` dùng `jose@6.1.3` ghim phiên bản. API: `createApiAuthenticator(config)` trả `authenticate(authorization)` và `authorizeOwnResource(session,resource,action)`.

- Config bắt buộc issuer/audience/algorithms/maxTokenAgeSeconds/publicJWKS/lookupPrincipal. Không có trusted issuer hoặc role mặc định. Chỉ ES256/RS256; không cho private/symmetric keys.
- Kiểm chữ ký, issuer/audience, subUUID, exp/iat, tuổi session; chỉ bộ public keys đã cấu hình, không fetch jku/x5u do token chỉ định. Unknown kid, sai thuật toán/chữ ký, thiếu exp hoặc token quá lớn bị từ chối.
- Principal/roles từ callback backend tin cậy, không từ roles/user_metadata client. Snapshot bất biến và context được mint riêng từng authenticator; context tự chế/khác instance/hết hạn bị từ chối.
- Chặn hết hạn trong thời gian lookup; lookup/clock lỗi trả mã chung AUTH_UNAVAILABLE, không lộ lỗi nội bộ.
- Ownership/customer guard: chỉ read/transfer trên resource chính chủ; người khác404, admin không tự có quyền chuyển tiền. **Guard này chỉ kiểm quyền/ownership, không làm confirmation hoặc thực hiện transfer.** Route tương lai phải kiểm confirmation riêng.
- Không nối DB/provider/HTTP route, không phát token, không thay login/PBKDF2/recovery demo. Khóa/token test sinh trong bộ nhớ, dữ liệu tổng hợp, không lưu credential.

## Kết quả có log

[Log/exitcode](bang-chung-auth-20261107/): auth25/25; toàn backend73/73; Vitest70/70; contract5/5; build Pages subpath exit0. Tổng **148 test đạt,0 lỗi,0 skipped** cho các suite đã chạy; auth25 là subset của backend73, không cộng hai lần. Build còn cảnh báo chunk>500kB. E2E không chạy lại vì không đổi frontend; số liệu E2E ở snapshot trước giữ nguyên phạm vi.

Test âm gồm sai chữ ký/issuer/audience/algorithm/kid, hết hạn/iat tương lai/tuổi session, subject sai, thiếu trust config, role sai, lookup lỗi, context giả/cross-instance/cross-user, expiry trong lookup và RSA/EC đúng bộ khóa. Lần red đầu có lỗi cú pháp test đã sửa; red-edge ghi hai thiếu sót thật (expiry sau lookup và clock/config error); log cuối không có test bị bỏ qua.

## Chưa mở khóa tích hợp / SEC-01 vẫn BLOCKED

- Chưa biết trusted issuer/audience/JWKS của môi trường development, nguồn role server và chính sách session/revocation. Module local không xác minh việc provider thật cấp/thu hồi token.
- Cần Authenticate lại mỗi request; context là phạm vi request, không session lưu lâu. Không refresh/rotation tự động, logout/revocation store hoặc MFA/confirmation server.
- Chưa có middleware/HTTP mapping cho APIv1; chưa có ownership query/ledger DB, concurrency hoặc transfer runtime. Cần review độc lập và integration tests trước activation.
- Không SQL/migration, không cấp grant/role, không giao dịch thật hoặc deploy. Bản nháp SQL mới của Nhóm07 vẫn cần nghiệmthu/môi trường riêng.
- Issue#37/#33/#39/#44 cần cập nhật bằng chứng module; RESTAPI của phiên trước Forbidden, nội dung chờ đồng bộ được lưu trong cap-nhat-issues, không tuyên bố đã gửi.

## Bước tiếp theo

Chốt trust config và policy với owner development; review module/permission contract; sau đó mới nối middleware vào API server, kiểm 401/403/404 và ownership bằng dữ liệu thật của môi trường thử nghiệm. DB/ledger/confirmation vẫn cần gate độc lập. Không phát hành toàn dự án từ bộ test này.

`npm audit --omit=dev --json` exit0,0vulnerabilities được registry báo cáo cho dependency production tại lần kiểm tra; không là chứng nhận bảo mật toàn hệ thống hoặc devtoolchain.
