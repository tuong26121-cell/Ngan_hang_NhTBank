# Nhom 14 — GitHub workflow / CI inventory

> Phân loại: BAN NHAP THIET KE/REVIEW. Tai lieu duoc viet dua tren source GitHub main ngay 2026-11-06. Khong coi la code da tich hop, test da PASS, hay 14 nhom AI da nhan viec. Quyen thuc thi theo ../quy-che-thuc-thi.md.

## Da kiem tra tren main
- `package.json`: scripts `npm test` (vitest), `npm run build` (Vite), `npm run test:e2e` (Playwright), `npm run test:backend` (node --test).
- `.github/workflows/verify-main-integration.yml`: `push/pull_request` main, npm ci → npm test → build → Chromium → E2E; artifact `main-integration-playwright`.
- `.github/workflows/deploy-pages.yml`: `push` main triggers build; deploy skipped when head commit contains `[khong-trien-khai-web]` (test still runs).
- `.github/workflows/xay-dung-apk-android.yml`: push main only when frontend/scripts/APK related paths change; manual `workflow_dispatch`; npm test + E2E + Gradle APK + sha256/metadata/version; artifact retention 14 days.
- `.github/workflows/build-ios-unsigned-ipa.yml`: PR triggers, Android-first priority.

## CI policy va preflight de dot 1
1. Đây là thay đổi tài liệu, không đổi frontend/API, vì vậy commit đính kèm `[khong-trien-khai-web]` để tránh public deployment không cần thiết; workflow `verify-main-integration` vẫn tự chạy.
2. Khi CI chạy, đợi job completion, đọc commit SHA/step logs, không gán PASS cho job còn in_progress.
3. Nếu build APK được yêu cầu ở Đợt 2, kiểm tra workflow artifact integrity và hạn mức trước manual run; không mặc định đã sinh APK.
4. Hậu kiểm: PR/branch protection, cache, test timeouts, artifact retention, source provenance và rollback URL.

## Risks/limit
- `npm test` hiện có không chứng minh backend idempotency hoặc SQL v2 runtime; cần QA-07..10.
- `verify-main-integration` có thể không bao gồm `npm run test:backend` độc lập; review coverage trước khi kết luận toàn bộ gateway bảo mật đã test.
- Chưa chạy lệnh mới trong máy local; CI tự kích hoạt sau commit có thể cung cấp bằng chứng mới.

**Ban giao:** 01, 05, 13. **OPS-01:** inventory draft complete; CI release gate not verified.
