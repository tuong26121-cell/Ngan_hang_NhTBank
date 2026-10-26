# Hướng dẫn IPA đã ký của NhTBank

Đây là ứng dụng ngân hàng **mô phỏng**, không chuyển/nhận tiền thật.

## Cách dùng
Workflow `.github/workflows/build-ios-signed-ipa.yml` chạy macOS để xuất `NhTBank-iOS-signed.ipa` cho **iPhone đã đăng ký trong Ad Hoc provisioning profile**.

Để dùng cần tài khoản Apple Developer và chứng chỉ ký phân phối của team được cấp quyền. Cấu hình các **GitHub Actions repository secrets** (Settings → Secrets and variables → Actions). **Không dán chứng chỉ, khóa, mật khẩu hoặc Apple ID vào chat/issue/source code**:

- `IOS_CERTIFICATE_P12_BASE64`: nội dung Base64 của chứng chỉ **Apple Distribution .p12** và khóa riêng do chủ sở hữu tạo.
- `IOS_CERTIFICATE_PASSWORD`: mật khẩu mở p12.
- `IOS_ADHOC_PROFILE_BASE64`: Base64 của Ad Hoc provisioning profile được Apple cấp, phải bao gồm UDID của iPhone muốn cài.
- `IOS_APPLE_TEAM_ID`: team ID được phép ký app.
- `IOS_PROFILE_NAME`: tên chính xác của Ad Hoc profile cho bundle ID `vn.nhtbank.demo`.
- `IOS_KEYCHAIN_PASSWORD`: không bắt buộc; nếu để trống sẽ tự tạo ngẫu nhiên trên GitHub runner.

**Quan trọng:** Đăng ký iPhone vào profile bằng phương thức hợp lệ do Apple Developer hỗ trợ. Không có chứng chỉ/profile thì workflow chủ động báo thiếu cấu hình chứ không giả vờ đã tạo IPA. Dù có IPA đã ký, hệ thống iOS vẫn kiểm tra quyền cài đặt theo thiết bị/profile.

## Xuất file
Sau khi workflow có trên nhánh mặc định và secrets hợp lệ, vào Actions → **Build signed NhTBank iPhone IPA (Ad Hoc)** → **Run workflow**. Khi job thành công, tải artifact `NhTBank-iOS-signed-IPA`.

Bản này không tải trực tiếp lên TestFlight. Dùng Xcode/Apple Configurator để cài trên iPhone đăng ký trong profile; xem hướng dẫn Apple: https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices.

## Bảo mật & nghiệm thu
- Giữ các bí mật trong GitHub Actions encrypted secrets; không commit chúng vào repo.
- Cần review workflow vì nó sử dụng tài nguyên ký phân phối.
- App vẫn mô phỏng, PIN demo công khai, không nhận dữ liệu ngân hàng thật.
- Chỉ báo đã có IPA khi GitHub Actions kết thúc thành công và có artifact.
- Kiểm thử iPhone vật lý trước khi dùng, đặc biệt QR demo, bàn phím, safe area, tính năng đăng nhập và giao dịch mô phỏng.
