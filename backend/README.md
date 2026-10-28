# Backend NhTBank Sandbox

Backend Node 24+ dùng `node:http`, `node:crypto`, `node:sqlite` và thư viện chuẩn, không thêm phụ thuộc. Được bổ sung theo yêu cầu nâng cấp luồng A–M ngày 29/10/2026. Không kết nối ngân hàng thật.

```sh
npm ci
npm run build
npm run platform:serve
```

Mở `http://127.0.0.1:3001/?runtime=server`, PIN 123456. Vào Cá nhân → Không gian vận hành để xem sổ, đối soát, sự cố, đổi vai trò demo, sao lưu và diễn tập. Sổ nằm trong `backend/.data/ledger.sqlite`, được giữ khi tải lại/đăng xuất/khởi động lại. Phiên không bền qua khởi động lại.

`npm run test:platform` chạy kiểm thử driver/lõi/HTTP. Mặc định `npm run dev` vẫn là bản bộ nhớ không cần server. Dùng `?runtime=server` trên Vite khi backend đang chạy để gọi proxy cục bộ; đổi port Vite cần cập nhật nguồn được phép.

Xem [kiến trúc](../docs/architecture.md), [API](../docs/platform-api.md), [vận hành](../docs/operations-runbook.md) và [giới hạn an toàn](../docs/sandbox-security.md). Không chỉnh file DB bằng tay; không đưa DB/backup vào Git. Không gọi cấu hình này là backend ngân hàng sản xuất.

Schema hiện tại: 2. Khởi động tự migration DB v1 trong transaction, giữ sổ và kết quả cũ, bổ sung bảng receipt. Không xóa `.data` để nâng schema. Backup v1 không được mở trực tiếp như v2; chưa có công cụ chuyển backup cũ.

Worker mỗi giây tiếp tục một receipt accepted chưa có kết quả, rồi xử lý outbox độc lập. Xem [system v2](../docs/design/system-v2.md) về tra cứu sau tải lại, bút toán bù và kiểm mốc phục hồi. Không có endpoint restore ghi đè DB.
