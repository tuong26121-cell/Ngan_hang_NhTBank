# Nhom 14 — GitHub workflow / CI inventory

> Phân loại: BAN NHAP THIET KE/REVIEW. Tai lieu duoc viet dua tren source GitHub main ngay 2026-11-06. Khong coi la code da tich hop, test da PASS, hay 14 nhom AI da nhan viec. Quyen thuc thi theo ../quy-che-thuc-thi.md.

## Da kiem tra tren main
- `package.json`: scripts `npm test` (vitest), `npm run build` (Vite), `npm run test:e2e` (Playwright), `npm run test:backend` (node --test).
- `.github/workflows/verify-main-integration.yml`: `push/pull_request` main, npm ci → npm test → npm run test:backend → build → Chromium → E2E; artifact `main-integration-playwright`.
- `.github/workflows/deploy-pages.yml`: `push` main triggers build; deploy skipped when head commit contains `[khong-trien-khai-web]` (test still runs).
- `.github/workflows/xay-dung-apk-android.yml`: push main hoặc cap-nhat/logo-va-phien-ban-apk khi frontend/assets/scripts/APK related paths change; manual `workflow_dispatch`; npm test + E2E + Gradle APK + sha256/metadata/version; artifact `NhTBank-APK-ThuNghiem-${{ github.run_number }}`, retention 14 days.
- `.github/workflows/build-ios-unsigned-ipa.yml`: PR triggers, Android-first priority.

## CI policy va preflight de dot 1
1. Đây là thay đổi tài liệu, không đổi frontend/API, vì vậy commit đính kèm `[khong-trien-khai-web]` để tránh public deployment không cần thiết; workflow `verify-main-integration` vẫn tự chạy.
2. Khi CI chạy, đợi job completion, đọc commit SHA/step logs, không gán PASS cho job còn in_progress.
3. Nếu build APK được yêu cầu ở Đợt 2, kiểm tra workflow artifact integrity và hạn mức trước manual run; không mặc định đã sinh APK.
4. Hậu kiểm: PR/branch protection, cache, test timeouts, artifact retention, source provenance và rollback URL.

## Risks/limit
- `npm test` hiện có không chứng minh backend idempotency hoặc SQL v2 runtime; cần QA-07..10.
- `verify-main-integration` đã có `npm run test:backend` ở commit `7f14b3e`; không áp lại bản vá hoặc suy ra mọi security gate đã đạt.
- Kiểm kê ban đầu chưa chạy local; lần kiểm chứng bổ sung bên dưới ghi bằng chứng mới, không thay đổi lịch sử.

**Ban giao:** 01, 05, 13. **OPS-01:** inventory draft complete; CI release gate not verified.

## Kiểm chứng bổ sung — 06/11/2026

Nguồn runtime/workflow `b6499a3afc2533eb3564c58c50675c4fde9a3cb6`; main kế tiếp `3d05f6e` chỉ đổi ba tài liệu điều phối, không đổi các đầu vào chạy test/build này.

- `npm ci --no-audit --no-fund`: exit0, không thay lockfile.
- `npm test`:70 đạt; `npm run test:backend`:15 đạt; `node --test scripts/kiem-thu/cau-hinh-apk.test.mjs`:1 đạt. Tổng86 đạt/0 lỗi/0 skipped.
- Production build `npm run build -- --base /Ngan_hang_NhTBank/`: exit0; cảnh báo chunk JS512,12kB còn mở. YAML6/6 và34 bash blocks kiểm tra cú pháp đạt.
- Log/mã thoát lưu ở [bằng chứng](../bang-chung-20261106/). Đây là local Linux, không chứng minh SQL, GATE-01–10, E2E hoặc thiết bị thật.
- Integration đã cover backend, Pages tập trung frontend. Không cần nhân bản test vào mọi workflow chỉ để có thay đổi. APK E2E đang dùng dev server; muốn chứng minh đúng bytes trong APK cần kiểm production root-base dist và checksum ở nhiệm vụ build riêng.
- Preflight lần push tài liệu: chỉ `docs/dieu-phoi/**`; marker `[khong-trien-khai-web]` bỏ job Pages deploy, integration/Pages build vẫn có thể tự chạy, APK/iOS không khớp paths. Không dispatch workflow trả phí/macOS, không gọi API ngân hàng/DB. Hạn mức và branch protection chưa được API xác minh; nếu nền tảng từ chối phải báo, không vượt qua.
