# Không gian mã và trách nhiệm

```text
frontend/src/
  App.jsx                         Phiên UI, điều hướng, đọc snapshot
  components/Transfer.jsx         Nhập → kiểm tra → PIN → kết quả đã chốt
  components/PlatformWorkspace.jsx Quan sát, đối soát, sự cố, phê duyệt, sao lưu
  lib/transfer-recovery.js        Hồ sơ bền trước gửi, Web Locks, tra cứu và retry đúng mã
  lib/platform-client.js          Adapter bộ nhớ / HTTP; không import driver DB
  lib/bank.js                     Dữ liệu minh họa cũ, định dạng và QR cục bộ
  platform.css                   Giao diện vận hành, bảng cuộn có chủ đích
packages/banking-core/
  model.js                       Vai trò, quyền, seed và repository bộ nhớ
  platform.js                    Bộ điều phối và các lệnh vận hành
  commands.js                    Chuẩn hóa nội dung và kiểm mã dùng chung
  reversals.js                   Đề xuất và duyệt bút toán bù nguyên tử
  recovery.js                    Kiểm lịch sử và yêu cầu quanh mốc sao lưu
  reconciliation.js              Tính lại từ sổ; không tin số dư bộ đệm
  snapshots.js                   Bản chụp JSON tạm của chế độ trình duyệt
backend/
  migrations/002-requests.sql     Schema v2; migration giữ sổ cũ, thêm receipt
  migrations/001-ledger.sql       Schema v1, khóa ngoại và index sổ
  src/sqlite-store.js             Transaction, bất biến và driver SQLite
  src/server.js                   HTTP, phiên, Origin/CSRF, worker nội bộ
  src/backups.js                  Tệp backup, checksum và diễn tập cách ly
  tests/platform.test.js         Cùng hợp đồng cho memory và SQLite
  tests/http.test.js             Quyền, CSRF, gửi đồng thời và phê duyệt
  .data/                         Chỉ khi chạy cục bộ; không đưa lên Git
e2e/
  bank.spec.js                   Hồi quy luồng khách hàng hiện có
  ui-acceptance.spec.js          Chuẩn 5 tab và responsive hiện có
  platform.spec.js               Vận hành và SQLite qua trình duyệt
docs/
  architecture.md               Luồng A–M và ranh giới thực thi
  transaction-contract.md       Idempotency, bất biến và lỗi
  operations-runbook.md          Thử sự cố, worker và khôi phục
  platform-api.md                Hợp đồng HTTP cục bộ
  sandbox-security.md            Những bảo vệ có / chưa có
  design/system-v2.md             Máy trạng thái, luồng mất mạng, 9 sơ đồ và nguồn
  system-v2-validation.md         Bằng chứng kiểm tra nâng cấp v2
  platform-validation.md         Kết quả chạy và giới hạn
```

## Quy tắc thay đổi

1. Quy tắc giao dịch ở lõi; không viết phiên bản kiểm tra khác chỉ trong UI/API.
2. Mọi thay đổi tài chính đi qua unit of work. Đừng sửa trực tiếp bảng DB hoặc state React để “chữa” số dư.
3. UI có thể kiểm tra sớm để hỗ trợ nhập liệu; backend và lõi vẫn kiểm tra lại lúc chốt.
4. Thêm adapter không đổi ý nghĩa lệnh. Kiểm thử hợp đồng phải chạy trên cả hai repository.
5. Sổ đã chốt không được cập nhật/xóa. Đảo dùng giao dịch bù mới có reversesId, đề xuất và người duyệt riêng; giữ nguyên bản gốc.
6. Migration mới phải giữ dữ liệu; không dùng xóa DB để nâng schema. Driver hiện từ chối phiên bản schema chưa biết.
7. Mọi thay đổi UI đối chiếu 45 mục ở `ui-standard.md`; không nâng trạng thái thiết bị thật chỉ dựa vào viewport.
8. Thông tin phiên, DB, WAL và backup cục bộ không vào Git. Chỉ đưa dữ liệu seed và cấu hình mẫu không bí mật vào mã.

## Điểm chạy

- `npm run dev`: giao diện mô phỏng mặc định.
- `npm run build` rồi `npm run platform:serve`: bản web và API SQLite tại `http://127.0.0.1:3001/?runtime=server`.
- `npm run test:platform`: kiểm thử lõi, DB và HTTP; Node 24 trở lên.
- `npm test`, `npm run build`, `npm run test:e2e`: hồi quy toàn dự án.

Các bản xem trước Capacitor/MagicPath đã có vẫn ở cấu trúc cũ, không bị ghi đè. Chúng chưa được xem là app Android/iOS đã kiểm thử cùng backend mới.
