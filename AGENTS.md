# NhTBank — hướng dẫn làm việc

- Đây là ứng dụng ngân hàng **mô phỏng**. Không kết nối dịch vụ chuyển tiền, thanh toán thật, xác thực ngân hàng thật hoặc thu thập thông tin nhạy cảm.
- Làm việc trên nhánh tính năng, không ghi trực tiếp vào nhánh mặc định `NhTBank`. Dùng checkout hiện tại; không tạo worktree nếu người dùng chưa yêu cầu.
- Frontend: React 18, TailwindCSS, Framer Motion; các component đặt trong `frontend/src/components`, logic nghiệp vụ trong `frontend/src/lib`.
- `backend/` là ranh giới kiến trúc cho tương lai, chưa có dịch vụ đang chạy. Không tự ý thêm backend hay cơ sở dữ liệu.
- Giữ nhãn Sandbox và cảnh báo QR rõ ràng, kể cả trong ảnh gốc. QR demo phải được tạo cục bộ, không chứa payload thanh toán hay gửi nội dung ra dịch vụ ngoài. PIN `123456` chỉ để demo, không phải cơ chế bảo mật dùng trong sản phẩm thật.
- Số tiền là số nguyên VNĐ. Giao dịch chỉ lưu trong bộ nhớ; tải lại trang khôi phục dữ liệu mẫu.
- Kiểm tra trước bàn giao: `npm test`, `npm run build`, `npm run test:e2e`. E2E cần `npx playwright install chromium` và các thư viện hệ thống của Chromium.
- Duy trì hỗ trợ điện thoại, bàn phím, focus hiển thị và `prefers-reduced-motion`. Không tuyên bố đã chạy kiểm thử khi chưa chạy.

## Chuẩn giao diện bắt buộc

- Dùng `docs/ui-standard.md` làm chuẩn trung tâm cho mọi sửa đổi UI/UX; đối chiếu đủ 45 mã A01–H06.
- Cập nhật `docs/ui-acceptance.md` sau mỗi lần thay đổi; ghi bằng chứng, commit và mục còn chưa kiểm tra. Không gán đạt cho thiết bị thật, bàn phím ảo hoặc chỉ số chưa đo.
- Chưa nghiệm thu chính thức khi còn P0 chưa đạt hoặc chưa xác minh. Giữ nguyên dữ liệu, luồng mô phỏng và các chức năng ngoài phạm vi UI/UX.
