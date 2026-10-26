# NhTBank — Bản dựng cho Android, iOS và web

Ứng dụng chỉ là **mô phỏng**, không có hoạt động ngân hàng thật. Không nhập dữ liệu đăng nhập ngân hàng thật.

## Thông tin đã đối chiếu
- Nguồn gốc là kho `Ngan_hang_NhTBank`; ứng dụng React 18 + Vite.
- Chức năng hiện có: đăng nhập PIN **123456** để thử, tổng quan số dư, chuyển tiền mô phỏng, QR **sandbox**, lịch sử, trang cá nhân; tiền gửi/vay là màn giới thiệu.
- Thiết kế được thử nghiệm riêng tại `prototypes/magicpath/` và trên canvas MagicPath. **Chưa thay thế** frontend hiện hành vì phải đảm bảo luồng nghiệp vụ và tránh hồi quy.
- `capacitor.config.json` là cấu hình chung để bọc bản web cho Android/iOS.

## Xuất bản Android APK
Workflow `.github/workflows/build-mobile-previews.yml` được cấu hình cho nhánh này; sau khi chạy thành công, file cài thử nằm trong artifact `NhTBank-Android-debug-apk`.

APK gỡ lỗi dành cho thử nghiệm, không phải bản đã ký phát hành Play Store.

## Xuất bản iOS
Workflow tạo **App.app cho iOS Simulator** trên macOS, có thể tải về trong artifact `NhTBank-iOS-Simulator-App`. File này không phải IPA và **không thể cài trực tiếp lên iPhone thật**.

Để tạo IPA cho iPhone thật: phải có máy Mac/Xcode, Apple Developer team, bundle ID hợp lệ, chứng chỉ ký và provisioning profile phù hợp. Dùng Xcode mở `ios/App/App.xcworkspace`, cấu hình Signing & Capabilities, chọn Generic iOS Device, Product → Archive, sau đó Distribute App → Export (IPA) hoặc TestFlight. Không lưu khóa riêng, mật khẩu hoặc provisioning secrets trong Git.

## Hai giao diện web
- Android: giao diện web đáp ứng điện thoại, chú ý vùng an toàn và thanh điều hướng 5 mục.
- Windows: giao diện web rộng với thanh điều hướng bên trái.
- Cùng một ứng dụng web đáp ứng; hiện chưa tạo hai deployment URL độc lập. Bản web gốc được README khai báo tại https://nhtbank-web-tuong.vercel.app/.

## Nghiệm thu
Theo chuẩn `docs/ui-standard.md` đã có, toàn bộ P0 phải có bằng chứng thử thực tế. Các mục chưa chạy trên máy Android/iPhone, tốc độ thực (LCP/INP/CLS), bàn phím ảo, QR và toàn bộ quy trình gói ứng dụng cần giữ trạng thái **chưa xác minh**. Không đưa bản prototype vào luồng chính trước khi kiểm thử `npm test`, `npm run build`, `npm run test:e2e` và các yêu cầu A01–H06.
