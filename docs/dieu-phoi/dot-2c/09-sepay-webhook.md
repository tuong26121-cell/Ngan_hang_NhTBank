# Nhóm 09 — Đợt 2C: SePay và Webhook

Mốc nghiên cứu/test ban đầu 2026-11-06 UTC · bàn giao 07/11/2026 (Asia/Saigon) · Issue #40 · phiên bản thiết kế 0.1 · **ĐÃ TIẾP NHẬN; TÍCH HỢP BLOCKED**.

## Nguồn và phạm vi

- Repo `tuong26121-cell/Ngan_hang_NhTBank`, nhánh làm việc `work`, baseline ban đầu `7192af6c28b51b56806b0b9c6827d2d0604bbc8a`, đồng bộ tiếp `origin/main` tại `ba22b0dc5de7b14553036a19b240390025713c52`. Runtime gateway không đổi so với checkout ban đầu `fb5a2f2`. Đợt này chỉ thêm test và tài liệu; chưa triển khai inbox/worker, chạy SQL hoặc kết nối provider.
- Đã đọc Issue #40, #37–39, MASTER-STATUS, quy chế thực thi, đề xuất Đợt 2, backend README, gateway, security test plan và schema inbox archive/v2.
- Git blob contract Nhóm 06: `bf6fb79de729d5d7efb6204dfb8b32fb18bd84f9`; Nhóm 07: `f636504dd6a2a9c786ba801bda1daca2d33f034e`; Nhóm 08 lúc nghiên cứu: `472221e2a8442c8537f3d659968c8f8f5fc8ccf9`, tại baseline cuối: `c3579220671dc4940041a6605acf4b91fe90d583` (sửa thứ tự replay trước kiểm tra số dư, vẫn draft). Đây là blob SHA, không phải commit hay bằng chứng runtime PASS.
- SQL core v2 blob `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`, assertions `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`. Không dùng runner v3 để nghiệm thu v2.

## Tài liệu SePay đối chiếu trực tiếp ngày 06/11/2026

1. [Xác thực](https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc): HMAC-SHA256 ký timestamp giây, dấu chấm và raw bytes; hai header X-SePay-Timestamp/X-SePay-Signature; cửa sổ ±300 giây. Gateway hiện phù hợp công thức, dùng timingSafeEqual. Không parse rồi serialize để xác minh.
2. [Test mode](https://developer.sepay.vn/vi/tien-ich-khac/test-mode): môi trường và credential tách Live, tài nguyên mô phỏng có quota. Trang tổng quan có chỗ nói 5 kiểu xác thực trong khi trang xác thực liệt kê 4; cấu hình HMAC thực tế phải được kiểm lại trong Dashboard Test Mode. Không suy từ tài liệu thành kết nối đã chạy.
3. [Tích hợp](https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook): payload dùng camelCase và ID số nguyên ổn định; khác API v2 snake_case/UUID. ACK hợp lệ là 200/201 cùng JSON success=true, trước 30 giây; 202 không đủ. Thiết kế NhTBank yêu cầu COMMIT trước ACK.
4. [Xử lý lỗi](https://developer.sepay.vn/vi/sepay-webhooks/xu-ly-loi): khi bật tự gửi lại, lịch công bố gồm lần đầu và 7 lần retry, khoảng chờ 1/1/2/3/5/8/13 phút. Có replay thủ công và sự kiện không đảm bảo thứ tự. Trang này mô tả retry theo non-2xx, trang tích hợp còn yêu cầu body thành công; cần kiểm thực tế retry khi sai body/202, không dựa vào chúng. 503 là lựa chọn hiện tại.

Đối chiếu bổ sung khi bàn giao 07/11/2026 (Asia/Saigon): [API giao dịch v2](https://developer.sepay.vn/vi/sepay-api/v2/giao-dich/danh-sach) có phân trang và since_id (UUID); polling cần thứ tự asc và đọc hết trang trước tiến cursor. [API token](https://developer.sepay.vn/vi/sepay-api/v2/tao-api-token) xác nhận token Test Mode chỉ dùng sandbox origin và API chưa có quyền chi tiết; phải bảo vệ server-side và thu hẹp egress ở ứng dụng.

## Contract đầu vào và điều kiện mở khóa

| ID | Chủ trì | Bằng chứng hiện tại | Cần bàn giao trước tích hợp |
| --- | --- | --- | --- |
| B09-06 | 06/13 | Threat model/RBAC draft, SEC-01 chưa đạt | Danh tính provider connection, mapping tenant/account server-side, least privilege ingest/worker, secret rotation, log/retention policy đã review |
| B09-07 | 07/13 | A3.6 hunk plan; DB-01 blocked | Inbox/work schema versioned và reviewed; UNIQUE scope, dữ liệu phục hồi, lease/fencing, atomic transaction, retention/tombstone; DB runner hợp lệ |
| B09-08 | 08/13 | Transfer/idempotency draft, TX-01 chưa đạt | Error/hash fixtures, receipt/replay, transaction boundary, retry classification, worker recovery và API-v2/webhook ID mapping |
| B09-ENV | 14/chủ môi trường | Không có secret/runtime binding hoặc identity SePay; miền SePay không thuộc allowlist | Credential Test Mode được cài server-side, xác minh tài nguyên mô phỏng, quyền mạng/HTTPS endpoint test, quota và rollback |

Không tự coi draft là contract được chốt. Issue giữ OPEN; SEC-01/DB-01/TX-01 chưa nghiệm thu.

## Event contract đề xuất (chưa thực thi)

Endpoint giữ `POST /api/webhooks/sepay`, JSON, tối đa 65,536 raw bytes. Connection/environment do cấu hình server xác định, không tin nhãn environment từ payload. Chỉ chấp nhận accountNumber/gateway/subAccount thuộc mapping Test Mode đã được backend cấp quyền.

| Trường provider | Quy tắc đề xuất |
| --- | --- |
| id | Số nguyên dương an toàn; chuyển sang chuỗi thập phân làm provider_event_id. Số ngoài safe integer phải từ chối, không làm tròn |
| gateway/accountNumber | Chuỗi không rỗng, so mapping server; không log accountNumber |
| transactionDate | Ngày giờ lịch hợp lệ, diễn giải Asia/Ho_Chi_Minh; không dùng làm timestamp chữ ký |
| transferType/transferAmount | in hoặc out; số nguyên VNĐ dương an toàn; không chấp nhận chuỗi tiền/số thực/âm |
| subAccount/description/referenceCode | Chuỗi, có thể rỗng; giới hạn độ dài cụ thể chờ contract 08 |
| code/content | code nullable string; content string; giữ null khác chuỗi rỗng; không coi nội dung là lệnh |
| accumulated | Metadata không dùng tính số dư hoặc ghi ledger |

Chưa dùng mapSePayV2Transactions cho webhook. Không giả định integer webhook ID có thể tra API v2 bằng UUID; fixture mapping/reconciliation là blocker. Envelope nội bộ dự kiến gồm version, trusted connection/environment/account ref, event ID, event type suy từ transferType, raw SHA256, semantic hash, received_at, normalized work reference và status. Đây là yêu cầu thiết kế, chưa là schema chốt hay migration.

## Durable inbox, replay và idempotency

Lựa chọn đề xuất: database transaction chứa inbox và công việc đã chuẩn hóa; worker lấy từ DB. So với queue ngoài DB, cách này giảm rủi ro dual-write; nếu dùng broker thì cần transactional outbox. Lưu ID/hash đơn thuần như SQL v2 hiện tại không đủ tái tạo công việc. Không tự thêm raw payload vào SQL: source v2 cấm lưu raw body. Nhóm 07/08 phải chốt các trường normalized tối thiểu trong vùng server-only, hoặc chứng minh cơ chế refetch đầy đủ và ổn định trước ACK.

Luồng đề xuất:

```text
raw bytes -> HMAC/timestamp -> parse/validate/scope -> atomic inbox + work COMMIT
                                                        -> 200 {success:true}
received -> processing (lease + fencing) -> processed (cùng transaction với kết quả)
                  | transient failure -> failed/retry due -> processing
                  | permanent failure -> failed/quarantine + alert
                  | crash/lease expiry -> reclaim bằng fencing mới
```

- Mất kết nối DB, commit thất bại hoặc chưa rõ kết quả: 503, không success; lần gửi lại phải đọc receipt đã commit trước khi tạo việc mới. Không dùng RAM hoặc chữ ký làm dedupe key.
- Unique key cần phân biệt provider/environment/company connection namespace và event ID. Hai webhook cùng nguồn giao dịch phải hội tụ cùng key; không dùng ID cấu hình webhook để vô tình nhân đôi. SQL v2 unique(provider, provider_event_id) chưa thể hiện namespace; cần review trước nhiều công ty/môi trường.
- Raw hash phục vụ toàn vẹn/evidence; semantic hash có version cho trường nghiệp vụ đã chuẩn hóa, không chứa timestamp/chữ ký/lần retry. Cùng key/hash trả receipt durable, không chạy tác động lại; khác hash → 409/quarantine, giữ bản cũ và cảnh báo. Fixtures null/Unicode/thứ tự khóa/whitespace phải được chốt trước khi viết canonicalizer.
- Timestamp chỉ giảm replay cũ. Replay trong cửa sổ hoặc payload được ký lại vẫn cần unique record bền vững xuyên instance/restart. Retention/tombstone phải bao phủ cả replay thủ công, không xóa key sau 5 phút hoặc sau lịch retry. TTL chưa được chủ sản phẩm chốt.
- Worker claim atomic, tăng attempt_count, lease có fencing token chống worker cũ ghi sau reclaim. Side effect và processed/receipt commit cùng transaction; nếu gọi dịch vụ ngoài cần outbox + downstream idempotency. Không cam kết exactly-once khi chỉ có lease.
- Không ghi nợ/ghi có transfer nội bộ từ sự kiện nhập SePay. Không suy số dư từ accumulated hoặc thứ tự nhận. Retry nội bộ có backoff/jitter, giới hạn và dead letter; số lần/thời hạn cần owner 08 chốt. Sau provider retry cạn, đối soát cursor có overlap và dedupe, không chỉ lấy trang 1 của gateway hiện tại.

## Rà soát bảo mật và phục hồi

| ID/mức | Bằng chứng/tác động | Xử lý/điều kiện xác minh |
| --- | --- | --- |
| R09-01/P1, xác nhận tĩnh | Inbox v2 chỉ ID/hash, không có work data/lease; nếu ACK sớm có thể mất việc sau crash | Giữ 503; contract 07/08 và test crash trước/sau commit, phục hồi backup |
| R09-02/P1, xác nhận tĩnh | Gateway chưa persistent dedupe, account scope/schema validation cho webhook; timestamp không chặn replay trong 5 phút | Không mở endpoint; schema validation + unique/hash atomic, 10 kết nối DB đồng thời, multi-instance và restart |
| R09-03/P2, xác nhận tĩnh | Clock NaN/Infinity trong hàm verify có thể vượt kiểm tra cửa sổ vì so sánh NaN; injected clock hiện dành test | Hardening Number.isFinite và fixture trước tích hợp; HMAC vẫn bắt buộc, không tuyên bố khai thác từ xa trong cấu hình mặc định |
| R09-04/P2, xác nhận tĩnh | HTTP upstream chỉ có timeout; gateway chưa có rate limit hoặc ceiling bytes phản hồi; poll chỉ trang đầu | Bounded streaming/parser, retry 429/5xx có budget, pagination/cursor và abuse limits trước deploy |
| R09-05/P2, giới hạn evidence | Source không log body/header; lỗi trả mã chung. Chưa có logging/audit pipeline runtime | Log allowlist: request ID do server tạo, code, latency, attempt/status; không secret/token/signature/raw body/account/content/exception stack. HMAC định danh nếu cần correlation; scrub proxy/APM/broker/DLQ/export/backup và kiểm canary riêng |

Response redaction được test với dữ liệu tổng hợp; không gọi đó là kiểm chứng toàn bộ log redaction. Raw body dùng trong RAM để xác minh, không đưa vào audit/log. Secrets chỉ secret store, có key ID và overlap rotation hữu hạn được 06 duyệt. Health hiện connected=false, không chứng minh inbox/worker readiness. Giám sát backlog age, retry/dead letter, DB errors, HMAC rejection và clock drift cần 14/13 kiểm thực tế.

## Test evidence và giới hạn

Node v24.19.0; repo yêu cầu >=22. [Thư mục log](bang-chung-09/) chứa output và exit code. Mã gateway, adapter, frontend và dependency không đổi khi fast-forward baseline. Test mới chỉ thêm trong backend/tests/sepay-sandbox-security.test.mjs.

- Backend trước bổ sung: 15/15, exit 0; sau bổ sung: **18/18, exit 0**, `backend-bo-sung.log`. Sau đồng bộ Nhóm 13, bỏ test concurrent bị trùng; giữ hai test mới về retry ký mới qua instance mới vẫn 503 và lỗi không echo payload/secret/chữ ký tổng hợp. Tổng backend cuối **27/27, exit 0**, `backend-cuoi.log`, gồm 25 bài nền tảng hiện hành và 2 bài bổ sung. Suite Nhóm 13 đã kiểm 10 replay đồng thời. Không chứng minh durable dedupe hay process-kill recovery.
- `npm test`: **70/70**, exit 0, `unit-mo-quyen.log`.
- `npm run build`: exit 0, `build-mo-quyen.log`; cảnh báo chunk >500 kB có sẵn.
- `npm run test:e2e`: exit 1, **51 không chạy được browser** do thiếu Chromium (`e2e-mo-quyen.log`). Cài Chromium bị HTTP 403 Domain forbidden từ CDN; đây không phải 51 lỗi nghiệp vụ được chứng minh. Sau đọc bàn giao Nhóm 13, dùng `/usr/bin/chromium` chạy lại: **42 PASS, 8 skipped, 1 FAIL**, exit 1, `e2e-chromium-he-thong.log`. Lỗi Android tại e2e/bank.spec.js:113, sau bấm Cá nhân không tìm thấy heading tên người dùng; snapshot đang ở Vay nhanh. Chưa xác định nguyên nhân, không sửa UI hoặc nới assertion trong nhiệm vụ webhook. Rerun riêng cùng bài Android đạt **1/1, exit 0** (`e2e-android-xac-minh.log`): lỗi có tính không ổn định, nguyên nhân chưa xác định. Không xóa kết quả FAIL toàn suite, không coi rerun một bài là full-suite PASS.
- Runner sandbox đầu tiên bị EPERM loopback, backend exit 1; unit hết thời gian chờ HTTP (11 lỗi/59 đạt, exit 1), tiến trình điều phối đã dừng trước build/E2E. Rerun local với quyền subprocess/loopback được cấp mới tạo các kết quả PASS trên; không có từ chối auto-review.
- Test Mode provider, SQL, concurrency database, fault injection DB/backup restore, rotation và proxy/APM redaction: **NOT RUN/BLOCKED**. Không dùng Live token, tài khoản ngân hàng thật hoặc giao dịch thật.

## Bàn giao và điều kiện nâng cấp

Handoff-ID `HO-2C-09-06070813-20261106`: 09 → 01/06/07/08/13, artifact bản 0.1 tại đây; trạng thái DRAFT PREPARED, runtime integration BLOCKED. Không gửi lệnh sang cuộc trò chuyện khác.

Mở tích hợp Test Mode sau khi B09-06/07/08 được chốt có version/SHA/reviewer; thêm validator/normalized mapping, durable work, receipt/hash, lease/fencing và test database thực trong môi trường disposable. Chỉ kết nối SePay sau B09-ENV, xác nhận URL/credential Test Mode và quota; kiểm nhận mẫu HMAC, duplicate, retry, sai account, clock drift, 429 và đối soát. Chỉ đổi 503 thành ACK khi durable commit + dedupe + recovery đã có evidence. Không ACK chỉ vì HMAC hợp lệ.

Trước nâng cấp tương lai cần acceptance độc lập 06/13, API/DB/OPS gates, HTTPS/proxy/rate limit, vận hành và retention/restore drill, budget và owner. Live là nhiệm vụ riêng cần quyền và điều kiện riêng; thay token hoặc đổi nhãn môi trường không đủ. Rollback giai đoạn hiện tại: revert commit test/tài liệu; không có migration hay provider configuration để hoàn nguyên.


## Đồng bộ trước push

`main` tiến tới `1894c453775ebb48a28c6111dba737199542bb1c` trong khi chạy kiểm thử. Đã rebase, giữ cả các handoff/trạng thái mới của nhóm khác. Đọc thêm `dot-2c/contract-sepay-admin-ai.md`, `dot-2a/phan-quyen-va-giao-dich.md`, `docs/sql-drafts/phien-ban-v21/ban-giao-a36.md`: đã có thêm contract review và SQL v2.1 hardening tĩnh, nhưng source vẫn ghi SEC/DB/TX BLOCKED; chưa chốt durable work/lease/namespace/retention hoặc có DB runtime. Vì vậy chưa mở tích hợp. SHA/contract draft trước đó được giữ làm lịch sử, không đại diện nguồn mới.

E2E ở trên thuộc baseline ba22b0d + test Nhóm 09, trước CSS/UX Đợt 2B; không coi là nghiệm thu UI mới tại 1894c45. Sau đồng bộ chỉ chạy lại backend/unit/build liên quan và lưu kết quả riêng; không sửa hoặc gán kết quả của các nhóm khác thành bằng chứng phiên này.
