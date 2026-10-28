# NhTBank — hướng dẫn làm việc

- Đây là ứng dụng ngân hàng **mô phỏng**. Không kết nối dịch vụ chuyển tiền, thanh toán thật, xác thực ngân hàng thật hoặc thu thập thông tin nhạy cảm.
- Làm việc trên nhánh tính năng, không ghi trực tiếp vào `main`. Dùng checkout hiện tại; không tạo worktree nếu người dùng chưa yêu cầu.
- Frontend: React 18, TailwindCSS, Framer Motion; component ở `frontend/src/components`, adapter/QR/định dạng ở `frontend/src/lib`, lõi nghiệp vụ dùng chung ở `packages/banking-core`.
- Kiến trúc giao dịch được người dùng yêu cầu ngày 29/10/2026: lõi dùng chung ở `packages/banking-core`, backend Sandbox Node 24 + SQLite ở `backend/`. Không thêm dịch vụ ngân hàng thật, cơ sở dữ liệu ngoài hoặc thay đổi triển khai công khai khi chưa có yêu cầu.
- Giữ nhãn Sandbox và cảnh báo QR rõ ràng, kể cả trong ảnh gốc. QR demo phải được tạo cục bộ, không chứa payload thanh toán hay gửi nội dung ra dịch vụ ngoài. PIN `123456` chỉ để demo, không phải cơ chế bảo mật dùng trong sản phẩm thật.
- Số tiền là số nguyên VNĐ an toàn. Mặc định lưu bộ nhớ và đặt lại khi tải lại/đăng xuất; `?runtime=server` lưu SQLite. Giao dịch phải qua bộ điều phối: phiên/quyền → lưu receipt tiếp nhận → idempotency/kiểm tra → ghi sổ kép/kết quả/audit/outbox cùng transaction. UI server lưu key/lệnh trước POST, tra cứu khi tải lại, không đổi key vì timeout; không lưu PIN/cookie/CSRF vào hồ sơ. Không cập nhật số dư trực tiếp từ component.
- Bút toán, kết quả và audit đã chốt chỉ thêm, không sửa/xóa. Sự cố phải được đối soát, cô lập và phê duyệt bởi người khác; không tự bù tiền. Đảo toàn phần chỉ bằng giao dịch bù mới được người khác duyệt; bản gốc bất biến. Đối soát phải kiểm cả số tiền/tài khoản/liên kết, recovery phải kiểm yêu cầu quanh mốc, không tự mở lại DB phục hồi. Sao lưu/diễn tập không được ghi đè DB đang chạy. PIN và vai trò public chỉ là Sandbox, không phải xác thực sản phẩm thật.
- Kiểm tra trước bàn giao: `npm test`, `npm run test:platform`, `npm run build`, `npm run test:e2e`. E2E cần `npx playwright install chromium` và các thư viện hệ thống của Chromium.
- Duy trì hỗ trợ điện thoại, bàn phím, focus hiển thị và `prefers-reduced-motion`. Không tuyên bố đã chạy kiểm thử khi chưa chạy.

## Chuẩn giao diện bắt buộc

- Dùng `docs/ui-standard.md` làm chuẩn trung tâm cho mọi sửa đổi UI/UX; đối chiếu đủ 45 mã A01–H06.
- Cập nhật `docs/ui-acceptance.md` sau mỗi lần thay đổi; ghi bằng chứng, commit và mục còn chưa kiểm tra. Không gán đạt cho thiết bị thật, bàn phím ảo hoặc chỉ số chưa đo.
- Chưa nghiệm thu chính thức khi còn P0 chưa đạt hoặc chưa xác minh. Giữ nguyên dữ liệu, luồng mô phỏng và các chức năng ngoài phạm vi UI/UX.

- Thiết kế hệ thống mới nhất: `docs/design/system-v2.md`. Schema v2 tự migration giữ nguyên dữ liệu v1. Giữ đồng bộ Mermaid/DOT/SVG/PNG qua `python3 docs/design/render-diagrams.py` khi sửa sơ đồ.
