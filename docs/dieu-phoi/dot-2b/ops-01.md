# OPS-01 — Nhóm 14, Đợt 2B

Cập nhật 07/11/2026 (Asia/Saigon), nhiệm vụ Issue #45. Đã tiếp quản và nhận QA Nhóm 13; giữ Issue OPEN khi còn blocker nghiệm thu. Baseline rollback của bản vá: `756a342f2daafd483ec9a205ea6396e1c1f082b1`. Đã đồng bộ các thay đổi đồng thời của Nhóm 03/02/06; giữ nguyên hệ thiết kế, test hợp đồng API và JWT/AuthZ.

**Trạng thái: PASS cho kiểm chứng CI compute trên nguồn hợp nhất; OPS-01 toàn bộ vẫn BLOCKED** vì branch protection chưa đọc được, artifact mới chưa đủ preflight dung lượng/ngân sách, chưa nghiệm thu thiết bị thật hoặc backend/database.

## Kiểm kê và bản vá

Đã đọc 260 run lưu giữ qua 3 trang REST, jobs/steps/logs của các run đại diện và tải artifact. [Snapshot trước bản vá](lich-su-ci.json). Không dùng API fetch_commit_workflow_runs chỉ lọc pull_request để suy luận thiếu CI push.

| Workflow | Trigger sau bản vá | Jobs/runner/timeout | Artifacts và quyền |
| --- | --- | --- | --- |
| verify-main-integration.yml | push main, PR main, thêm dispatch | integration / Ubuntu 24.04 / 20 phút | Playwright 7 ngày; contents:read |
| deploy-pages.yml | push main, PR main, dispatch | build 20 phút → deploy 10 phút / Ubuntu | Website + Chromium 1 ngày; build pages:read; chỉ deploy pages:write/id-token:write, environment github-pages |
| check-buttons.yml | PR main, bỏ NhTBank đã xóa | interactions / Ubuntu / 15 phút | Playwright 7 ngày; read |
| xay-dung-apk-android.yml | dispatch; push main/nhánh logo theo paths; thêm PR main cùng paths | android / Ubuntu / 35 phút | APK debug + metadata + SHA256 14 ngày; Chromium 1 ngày; read |
| build-ios-unsigned-ipa.yml | dispatch, PR main theo paths; bỏ push nhánh feature đã xóa | unsigned / macOS / 40 phút | IPA 14 ngày; read |
| build-ios-signed-ipa.yml | dispatch | signed / macOS / 45 phút | IPA 14 ngày; read; encrypted signing secrets, cleanup always |

- Giữ tên workflow/job để tránh đổi required checks. Không có pull_request_target, test continue-on-error hoặc xóa assertion bảo mật. Action refs khóa theo version release, chưa pin commit SHA.
- Unit vẫn chạy trong sáu workflow; thêm backend `.test.mjs` riêng ở Pages/buttons/APK/iOS, giữ integration. Vitest không tự bao gồm nhóm `.test.mjs`.
- Pages thêm backend security và Chromium E2E **ngay trong job build trước upload/deploy**; preview và build cùng Pages base_path. Deploy needs build, không dùng always() cho deploy.
- APK giữ production preview root, kiểm tra cổng/server/readiness/cmp index từ upstream mới; thêm backend security, PR main và paths backend/e2e/config/tests. Giữ hợp đồng API, wrapper validation, compile, ZIP/aapt/version/SHA256. Thêm cấu hình APK test vào integration.
- iOS thêm backend security, không chạy iOS/native signing trong nhiệm vụ này. iOS chưa có Chromium gate trong job; không nghiệm thu iOS từ Web/APK.
- Artifact steps có thể dùng always() để lưu lỗi; không chuyển test FAIL thành PASS và không cho phép đóng gói/deploy sau lỗi.

## Điều tra và sửa E2E

Lần đầu trên baseline ba22b0d: 35 passed, 1 failed Android journey, 1 interrupted, 4 skipped, 10 did not run. Tại e2e/bank.spec.js:113, không thấy profile sau click Cá nhân; error context còn ở Vay nhanh. [Log gốc](bang-chung/e2e.log), [context](bang-chung/e2e-loi-android.md). Trace ZIP/ảnh giữ ở `/workspace/nhtbank-dot-2b-evidence/`.

Chạy riêng Android đạt; hai lần kiểm tra chuỗi chuyển trang lặp cũng đạt, nên không nhận đã chứng minh lỗi frontend deterministic. Phát hiện bài test chờ chung `BẢN XEM TRƯỚC` ở cả Tiền gửi/Vay nhanh, có thể khớp màn hình đang exit trong AnimatePresence mode wait. Bản sửa **đồng bộ kiểm thử với đúng màn hình**, thêm chờ heading Tiền gửi, dashboard và Vay nhanh; giữ tất cả assertion nghiệp vụ/cảnh báo/console. Không tăng timeout, không retry/skip để làm xanh.

Thêm `e2e/dieu-huong-nhanh.spec.js`: 6 vòng dashboard → Tiền gửi → dashboard → Vay nhanh → Cá nhân ở mỗi profile desktop/mobile/Android, kiểm tra aria-current và heading profile. Không sửa frontend hoặc CSS để che lỗi; regression này là bằng chứng độ ổn định trong phạm vi đã chạy, không chứng minh hết mọi race trên máy thật.

## Kiểm tra cục bộ cuối trên e940a9c cộng bản vá

| Phạm vi | Kết quả |
| --- | --- |
| npm ci từ lockfile hiện hành | PASS; cache cục bộ đặt trong workspace |
| Unit | PASS 70/70 |
| Backend security/JWT/AuthZ/contract primitives | PASS 73/73; không suy thành middleware/DB đã triển khai |
| Hợp đồng OpenAPI và fixture | PASS 5/5 |
| Cấu hình APK | PASS 1/1 file Node test |
| Website production build | PASS; cảnh báo bundle >500 kB còn tồn tại |
| 6 workflow YAML, bash -n, permissions, timeout | PASS |
| actionlint 1.7.7 | PASS, không shellcheck; bash đã kiểm tra riêng |
| Chromium E2E cuối | PASS 47/57; 10 skip có chủ đích (desktop-only viewport/UI contract) |
| Native APK local / iOS / SQL | NOT RUN |

[Log tự chạy](bang-chung/). Lần E2E đang chạy khi đồng bộ main/dependencies đã hủy/superseded, không dùng làm PASS hoặc đánh giá code cuối. Lần kiểm chứng cuối khởi động lại từ npm ci + production build đúng baseline mới.

## Preflight chi phí và chế độ CI không lưu trữ

- Repo public, chỉ chạy ba workflow Ubuntu 24.04 tiêu chuẩn; [GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) xác nhận standard runner public repo miễn phí compute. Không larger runner, không tạo tài nguyên/dịch vụ trả phí hoặc chỉnh ngân sách.
- Kết nối không đọc được billing dashboard/allowance/cache budget. CLI API bị chặn; connector không có billing endpoint; không có browser control tool trong phiên. Không kết luận allowance còn đủ.
- Giải pháp chạy an toàn: commit CI có `[khong-luu-artifact] [khong-trien-khai-web]`. Sáu workflow hỗ trợ marker đầu: setup-node không dùng cache npm, mọi upload-artifact/upload-pages-artifact bị bỏ qua; Pages deploy bị chặn. **Không áp marker lên bất kỳ step test/build/security/checksum nào**. Không dùng skip ci trong commit mã này.
- Do đó preflight **PASS cho compute kiểm thử không lưu trữ mới**, còn upload artifact **BLOCKED / NOT RUN** đến khi đủ bằng chứng allowance/budget. SHA/checksum/badging APK vẫn phải được kiểm tra và xuất trong run logs/summary. Không tự xóa artifact/cache cũ.
- Chế độ này áp dụng cho push có head_commit; PR/dispatch không có payload này và vẫn phải có preflight storage riêng. Khi bỏ marker để upload/deploy ở nhiệm vụ sau, phải kiểm tra quota và ngân sách. Retention cũ 7/14 ngày; bằng chứng Chromium mới 1 ngày không tự bảo đảm miễn phí.

## Bằng chứng run và artifact lịch sử

- Verify [42303579263](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42303579263), ba22b0d, job 128187215219: PASS unit70/backend25/build/Chromium43; 8 skip viewport desktop-only có chủ đích.
- Pages [42303579266](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42303579266), ba22b0d: build job128187293889 PASS; deploy128187464864 NOT RUN/skipped. Không gọi đây là deploy thành công.
- Pages [42303497042](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42303497042), 8e347f1: CANCELLED, jobs rỗng lúc đọc; không suy nguyên nhân.
- iOS [41962770440](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/41962770440), c01073c, job127032749956: FAIL `Set up Capacitor for iOS`, npm `Cannot read properties of null (reading 'edgesOut')`; compile/package/upload NOT RUN. Lỗi native lịch sử chưa được sửa/chạy nghiệm thu trong nhiệm vụ này.
- APK [41962787638](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/41962787638), fb5a2f2, job127032806313: artifact13385559371 tải và kiểm tra ZIP/APK/SHA256 PASS; debug vn.nhtbank.demo 1.0.1/code1009. [Metadata](kiem-tra-apk-lich-su.json). Không phải APK mới hoặc bằng chứng cài thiết bị thật/signature độc lập/backend/database.
- Chromium artifact13545396523 từ Verify ba22b0d: tải 11,020,448 bytes, ZIP CRC PASS, 13 ảnh + report HTML. [Danh mục](kiem-tra-artifact-ci.json). Không dùng làm PASS cho source bản vá.
- Signed iOS: NOT RUN trong 260 run lưu giữ đã đọc, không suy rằng chưa từng chạy nếu lịch sử bị xóa.

## Run của bản vá và nguồn hợp nhất đã xác minh

Đã push bản vá mã/workflow `d61e7141b04d3a255f4142f74c6b7c503fa254bb` lên main. Sau đó nhóm09 cập nhật main thành `0a363c36b8733bc5b1020ae245582e2844a74586`, giữ nguyên bản vá và thêm 2 security tests SePay. Không thay kết quả của source này bằng source kia.

| Source | Workflow/run | Kết quả thực tế |
| --- | --- | --- |
| d61e714 | Verify [42327278585](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42327278585), job128265361554 | PASS: unit70/backend73/contract5/config1/build, Chromium47 pass/10 skip |
| d61e714 | Pages [42327278680](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42327278680), build128265362353 | PASS build và các gate; deploy NOT RUN/skipped |
| d61e714 | APK [42327278606](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42327278606), job128265362387 | CANCELLED khi push mới vào cùng concurrency main; không nhận native PASS |
| 0a363c3 | Verify [42327541861](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42327541861), job128266211226 | PASS: unit70/backend75/contract5/config1/build, Chromium47 pass/10 skip |
| 0a363c3 | Pages [42327541807](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42327541807), build128266323838 | PASS build và các gate; deploy128267356397 NOT RUN/skipped |
| 0a363c3 | APK [42327541855](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42327541855), job128266267796 | PASS unit70/backend75/contract5/config1, production-root Chromium47/10, Capacitor, wrapper validation, Gradle compile, ZIP, aapt version và SHA256 |

[Jobs/steps/artifacts source d61e714](ci-d61e714.json), [source0a363c3](ci-0a363c3.json), [trích log d61e714](bang-chung/ci-d61e714.txt), [trích log nguồn hợp nhất](bang-chung/ci-0a363c3.txt). Đã đọc logs của từng job thành công và log APK bị hủy. Log bị hủy có 1 ERR_CONNECTION_REFUSED trong lúc runner dừng, 1 interrupted và trường hợp chưa chạy; kết luận GitHub là CANCELLED, không sử dụng như PASS hoặc chẩn đoán lỗi ứng dụng độc lập.

APK nguồn0a: run_number15, version1.0.1/versionCode1015 được kiểm tra bởi aapt + script phiên bản, BUILD SUCCESSFUL, ZIP không lỗi. SHA256 ghi bởi runner: `5de3f9ba1e995b8db0c2880eb086e063265859d83f44d6d520e5944ce3c99da8`. Package theo cấu hình Capacitor vn.nhtbank.demo; chưa có kiểm chứng signature/cài máy thật. Không gọi đây là bản phát hành.

Đã truy vấn artifact list của cả 6 run: đều rỗng; từng upload step SKIPPED đúng marker. **Upload APK/Website/Playwright NOT RUN, storage preflight BLOCKED**; không có APK mới để tải từ Actions trong lần này. SHA256 của APK mới chỉ có bằng chứng tính trong log runner, chưa thể tải artifact để kiểm tra độc lập. Bằng chứng ZIP/APK đã tải ở mục lịch sử chỉ thuộc fb5a2f2.

Commit bàn giao bằng chứng tiếp theo chỉ thay tài liệu/log, dùng `[skip ci] [khong-luu-artifact] [khong-trien-khai-web]`; CI commit tài liệu NOT RUN, không nhận đây là source mới đã chạy test. Mã/workflow được nghiệm chứng ở các SHA trong bảng trên.

## Gate và rollback

Đọc branch protection trả 403 Resource not accessible by integration: BLOCKED xác minh, không kết luận thiếu protection hoặc vượt required checks. OPS-01 release vẫn BLOCKED; production backend/database/SQL/RLS/ledger/concurrency/thiết bị thật chưa nghiệm thu. Không tag/version/release mới và không deploy public website trong đợt này.

Rollback: revert riêng commit CI sau khi đối chiếu HEAD và preflight; không force-push/reset toàn main, không ghi đè thay đổi nhóm khác. Sau kiểm thử đầy đủ trên e940a9c, đã rebase lên 756a342 (bổ sung accessibility của Nhóm03), chạy lại unit/build; CI exact-SHA sẽ kiểm tra E2E nguồn hợp nhất. Mốc nguồn trước bản vá là 756a342; nếu có main mới, ghi lại parent thực trước push.
