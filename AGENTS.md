# NhTBank — hướng dẫn làm việc và quyền thực thi

> **Quy chế hiện hành từ 2026-11-06**, thay thế các quy định chỉ-đọc hoặc cấm ghi `main` trong tài liệu điều phối cũ. Áp dụng cho các nhiệm vụ NhTBank theo yêu cầu của chủ repository. Không thay đổi sự thật lịch sử, trạng thái kiểm thử hoặc quyền thực tế của công cụ.

## Quyền đã được chủ repository cho phép

- **Được trực tiếp tạo, chỉnh sửa, cập nhật và sửa lỗi** mã nguồn, tài liệu, cấu hình, GitHub Issues và workflow trong `tuong26121-cell/Ngan_hang_NhTBank` theo nhiệm vụ được giao.
- **Được commit/push trực tiếp lên nhánh mặc định `main`** khi thay đổi đã được kiểm tra về phạm vi và mức độ ảnh hưởng; không cần xin lại quyền ghi hoặc bắt buộc tạo PR/nhánh tính năng cho mỗi lần thay đổi. Có thể chọn PR/nhánh riêng cho thay đổi lớn hoặc rủi ro cao để dễ review.
- **Được chạy** lint, unit test, E2E, GitHub Actions, CI, build APK/IPA, kiểm tra artifact, môi trường local/development và các bước deploy hợp lệ theo công việc cụ thể; ghi nhận workflow/run/commit/log thực tế. Không được tuyên bố PASS khi chưa có bằng chứng.
- **Được tạo và cập nhật GitHub Issues**, điều phối công việc giữa 14 nhóm và chỉnh trực tiếp tài liệu trạng thái. GitHub Issue không tự khởi động hay gửi lệnh sang cuộc trò chuyện ChatGPT khác.
- **Được chuẩn bị và thực thi SQL/migration** khi đã xác minh đầy đủ kết nối mục tiêu, bản migration, backup/rollback, rủi ro dữ liệu và tiêu chí nghiệm thu; không chạy một bản `draft` chưa được duyệt kỹ thuật chỉ vì có quyền thực thi chung.
- **Được nghiên cứu và triển khai các giai đoạn tích hợp/dịch vụ thực** theo yêu cầu, sau khi xác minh quyền sở hữu, bảo mật, điều kiện nhà cung cấp, chi phí và môi trường. Không suy diễn rằng một sandbox, PIN demo hoặc QR mô phỏng là hệ thống giao dịch thật.

Quyền trên là **ủy quyền thao tác GitHub và quy trình phát triển**, không phải lệnh chạy tất cả workflow, SQL, deploy hoặc chuyển tiền ngay lập tức. Mỗi hành động phải gắn với một nhiệm vụ cụ thể, có preflight và báo cáo kết quả. Nếu GitHub, nhà cung cấp hoặc nền tảng chặn thao tác, báo đúng lỗi; không vượt qua bảo vệ.

## Các kiểm soát luôn áp dụng

- **Giao dịch ngân hàng thật:** không thực hiện lệnh chuyển tiền/chi trả khi chưa có người thụ hưởng, số tiền, tài khoản, mục đích và xác nhận cụ thể của người dùng cho chính giao dịch đó. Cần kết nối nhà cung cấp và quyền hợp lệ, không bao giờ dùng PIN demo làm xác thực tiền thật.
- **Production và dữ liệu thật:** xác minh endpoint, môi trường, chủ sở hữu và phạm vi; sao lưu/rollback trước thao tác có thể gây mất dữ liệu; tuyệt đối không đưa secrets, OTP, mật khẩu hay dữ liệu tài khoản thật lên GitHub hoặc log công khai.
- **Chi phí:** kiểm tra hạn mức trước khi kích hoạt tài nguyên có phí; thao tác thanh toán hoặc cam kết chi phí cần được chủ tài khoản cho phép với mức cụ thể.
- **Tính minh bạch:** phân biệt `PROPOSED`, `IN PROGRESS`, `NOT RUN`, `FAIL`, `BLOCKED`, `VERIFIED`; cung cấp commit SHA, workflow run và artifact hoặc log phù hợp.
- **Thay đổi trên `main`:** đánh giá tác động đến GitHub Pages/Actions (push lên `main` có thể tự kích hoạt kiểm thử và deploy), chạy các kiểm tra cần thiết và công khai kết quả. Không force-push/ghi đè lịch sử nếu không có yêu cầu tường minh.
- **Quy tắc đặt tên:** tên mới của nhánh, thư mục, tệp, mục workflow và gói tải về dùng tiếng Việt không dấu, đường dẫn chữ thường và dấu gạch nối; giữ các tên công nghệ và đường dẫn bắt buộc.

## Kiến trúc và trạng thái sản phẩm

- Phiên bản đang có là ứng dụng NhTBank mô phỏng; không tự nhận là ngân hàng được cấp phép hay dịch vụ giao dịch thật.
- Frontend hiện dùng React 18, TailwindCSS, Framer Motion; các component đặt trong `frontend/src/components`, logic nghiệp vụ trong `frontend/src/lib`.
- Mã `backend/` liên quan SePay Test Mode cần được review và harden trước khi triển khai; không mở loopback gateway công khai mà chưa có auth/HTTPS/validation.
- Giao dịch demo dùng VNĐ nguyên; lưu cục bộ/trong phiên theo implementation hiện hành. Mọi thay đổi sang persistence thật cần thiết kế permission, audit, rollback và migration.
- QR demo phải ghi nhãn Sandbox; không lẫn QR demo với mã thanh toán thực. PIN `123456` chỉ dùng mô phỏng và không đáp ứng bảo mật production.

## Quy trình thực hiện và nghiệm thu

1. Xác minh nhiệm vụ, nguồn hiện tại, `main` HEAD, các Issue liên quan và phụ thuộc.
2. Chọn thao tác trực tiếp `main` hoặc nhánh/PR review phù hợp; chủ repository đã cho phép cả hai.
3. Triển khai thay đổi trong phạm vi. Kiểm tra trước/sau: `npm test`, `npm run build`, `npm run test:e2e` khi phù hợp; E2E có thể cần `npx playwright install chromium`.
4. Nếu cần SQL, Actions, CI, build APK, E2E hoặc deploy, thực hiện khi đủ điều kiện an toàn và phạm vi nhiệm vụ; không tự chạy các hệ thống không liên quan.
5. Ghi kết quả thực tế (commit, run, artifact, lỗi và blocker) vào báo cáo. Không gán hoàn thành cho thiết bị thật, bàn phím ảo hay chỉ số chưa kiểm chứng.

## Chuẩn giao diện bắt buộc

- Dùng `docs/ui-standard.md` làm chuẩn cho sửa đổi UI/UX; đối chiếu 45 mã A01–H06.
- Cập nhật `docs/ui-acceptance.md` sau thay đổi, có commit/bằng chứng và mục chưa kiểm tra.
- Duy trì hỗ trợ điện thoại, bàn phím, focus rõ ràng và `prefers-reduced-motion`. Không nghiệm thu nếu còn blocker P0 chưa xử lý.

## Điều phối 14 nhóm

Nguồn hiện hành: [quy chế thực thi](docs/dieu-phoi/quy-che-thuc-thi.md), [MASTER-STATUS](docs/dieu-phoi/MASTER-STATUS.md), [bảng giao việc](docs/dieu-phoi/bang-giao-viec-20261106.md) và GitHub Issues #32–45. Các đoạn giới hạn ở phiên bản tài liệu cũ chỉ còn giá trị lịch sử; quy chế này quyết định quyền thao tác hiện hành.
