# Hợp đồng phân quyền, ledger và replay — bản review Đợt2A

Nguồn triển khai: main7192af6 và `hop-dong-api-v1.json` phiên bản1.0.0-draft.1. Đây là contract để review; **chưa có JWT verifier/server session, endpoint v1, ledger hoặc DB runtime**. Không lấy utility kiểm dữ liệu/hash làm backend hoàn chỉnh.

## Danh tính và quyền từng endpoint

Nguyên tắc: principal chỉ lấy từ token đã xác minh server-side (issuer/audience/algorithm/JWKS/expiry/revocation chưa cấu hình), role từ nguồn quản trị tin cậy. UUID hợp lệ chỉ là định dạng, không chứng minh người dùng đã xác thực. Client không gửi principal_id, role hay hash trong TransferRequest. service_role chỉ là credential backend, không phải app role.

| Endpoint đề xuất | Quyền cần có | Scope tài nguyên | Phản hồi khi không đủ quyền |
| --- | --- | --- | --- |
| GET /v1/me | Phiên hợp lệ, app role được biết | Chỉ chính principal |401 nếu token sai/hết hạn; role chưa biết deny403 |
| GET /v1/sandbox/accounts | customer | Chỉ tài khoản do principal sở hữu | Không trả danh sách của principal khác |
| GET /v1/sandbox/transactions | customer | Chỉ giao dịch của tài khoản chính chủ; cursor bind principal+filter | Không nhận user_id từ query để mở rộng scope |
| POST /v1/sandbox/transfers | customer + confirmation server hợp lệ | Source account chính chủ, recipient được xác minh trong transaction |403 quyền thiếu;404 tài nguyên không truy cập được; không lộ chi tiết tài khoản khác |
| GET /v1/sandbox/transfers/{id} | customer | Transfer gắn source principal |404 chung cho thiếu/quyền tài nguyên để tránh enumeration |
| /healthz | Public | Chỉ trạng thái gateway ít thông tin | Không trả credential/provider balance |

`support`, `operations`, `risk_analyst`, `admin` không có quyền chuyển tiền chỉ nhờ tên role. Các role này cần endpoint/quyền riêng được review, mặc định từ chối. Nếu principal cũng có customer thì vẫn phải qua kiểm ownership/confirmation; admin không bypass. `auditor` chưa là enum SQL, không tự ánh xạ thành risk_analyst. 11 Admin chưa được nối API.

## Utility đã triển khai và giới hạn

`backend/lib/hop-dong-chuyen-tien.mjs` chỉ export `canonicalizeTransferRequest(request)` và `createTransferFingerprint(principalId, request)`. Không I/O, JWT, token, DB, debit/credit hay durable storage.

-5 trường:source_account_id/recipient_account_id UUID, amount chuỗi1000..9007199254740991, currency VND, description optional120 Unicode codepoints.
- Reject unknown fields (kể cả role/principal/hash/key), tự chuyển, amount số/decimal/exponent/leading zero/tràn cận. Không ép amount qua Number.
- Canonicalization: UUID lowercase; description raw tối đa120 codepoints, NFC rồi trim và kiểm lại tối đa120; thiếu description tương đương rỗng.
- Fingerprint: UTF8 JSON với thứ tự cố định `{version:1,principal_id,operation_scope:'sandbox.transfer.v1',payload}`. SHA256; key/token/request_id/timestamp không nằm trong hash. Namespace lưu trữ tương lai vẫn principal+scope+key. Hash không phải MAC hoặc chữ ký xác thực.
- Utility có test độc lập, nhưng **không** chứng minh chống gửi trùng, concurrency, idempotency hoặc thanh toán đã chạy.

## Contract ledger/transaction — chưa triển khai

1. Xác thực/authorize principal trước lookup; kiểm shape và normalize payload.
2. Trong cùng DB transaction: claim unique namespace key; nếu có thì lock/wait với timeout có giới hạn, compare hash; khác hash409 IDEMPOTENCY_KEY_REUSED, giống hash+completed thì đọc persisted receipt trước kiểm số dư mới.
3. Request mới: lock hai account theo thứ tự UUID, xác minh ownership/trạng thái/available balance, tạo transfer và hai ledger entries bằng amount integer. Tổng postings bằng0; debit không làm balance âm; không dùng bảng import SePay làm ledger.
4. Ghi receipt/resource/version và audit cùng transaction với business rows; rollback khi lỗi trước commit. HTTP response sau commit không được tạo giao dịch thứ hai nếu retry.
5. Ten independent DB connections same key/hash phải cho đúng1transfer; crash trước/giữa commit, sau commit/trước response phải có trace/durable rowcounts. Unit utility không thay các test đó.

## Quyết định còn thiếu và blocker

- AUTH-ISSUER/TRANSFER-CONFIRMATION: chưa có môi trường và trust config; không tạo verifier chấp nhận token giả để vượt gate.
- LEDGER-STORAGE: chưa có schema/migration được nghiệm thu; SQL v2 là import Test Mode, không tự thêm balance/ledger vào archive.
- RETENTION-REPLAY: owner chưa chốt horizon/TTL/terminal failure/cleanupstarted; chưa cài scheduler. Không lấy key expired làm quyền thực hiện lại tùy ý.
- PRODUCT-FEE: chưa chốt phí/lãi; demo không được suy thành sản phẩm tài chính thực.
- DB-01/TX-01/SEC-01 vẫn BLOCKED ở nghiệm thu tích hợp; phần utility/contract chỉ VERIFIED theo đúng kiểm tra trong log.
