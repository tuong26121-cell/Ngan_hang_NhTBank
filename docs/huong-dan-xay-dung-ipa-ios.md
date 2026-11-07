# NhTBank iOS — tạo bản IPA chưa ký

> NhTBank chỉ là ứng dụng ngân hàng **mô phỏng**, không giao dịch tài chính thật.

## Xuất IPA trong GitHub Actions

Workflow: `.github/workflows/build-ios-unsigned-ipa.yml`.

Chạy tự động trên pull request cập nhật workflow, hoặc chọn **Actions → Build NhTBank iOS unsigned IPA → Run workflow** (khi workflow có trên nhánh mặc định). Job dùng macOS, biên dịch ứng dụng React qua Vite, tạo dự án Capacitor iOS 7, biên dịch iOS device arm64 với `CODE_SIGNING_ALLOWED=NO`, đóng gói `Payload/App.app` thành `NhTBank-iOS-unsigned.ipa`, kiểm tra cấu trúc ZIP rồi tải lên artifact.

**Điều kiện để báo hoàn thành:** workflow thành công và artifact thực sự tồn tại. Trước đó, tệp IPA chỉ là đầu ra dự kiến, không được tuyên bố đã tạo.

## Có cài ngay trên iPhone được không?

**Không.** IPA này được biên dịch cho phần cứng iPhone nhưng chưa có chữ ký Apple hoặc provisioning profile. Đổi đuôi ZIP thành IPA không làm tệp có khả năng cài trực tiếp. Để chạy trên iPhone thật cần chữ ký/provisioning hợp lệ cho thiết bị hoặc qua TestFlight/App Store. Không tự đưa Apple ID, mật khẩu, khóa ký, chứng chỉ riêng vào kho GitHub.

### Để xuất IPA đã ký (chính thức)
1. Dùng Xcode trên macOS và tài khoản Apple Developer phù hợp.
2. Tạo iOS project: `npm ci && npm run build && npm install --no-save --package-lock=false @capacitor/core@7 @capacitor/cli@7 @capacitor/ios@7 && npx cap add ios && npx cap sync ios`.
3. Mở `ios/App/App.xcworkspace`; chọn Apple Team trong Signing & Capabilities; cấu hình bundle ID, provisioning.
4. Chọn Product → Archive → Distribute App và export IPA hoặc TestFlight.
5. Kiểm thử giao dịch demo, QR, an toàn vùng màn hình, điều hướng, bàn phím ảo, đăng nhập trước khi phát hành.

Bản build này không thay đổi logic mô phỏng và không biến NhTBank thành ngân hàng thực.
