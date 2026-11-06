# Đợt 4 — phát hành và bàn giao, 2026-11-06

Handoff-ID: NB-D4-20261106-01. Nhóm 01/14. Trạng thái: PARTIAL — bàn giao tài liệu; Website và APK Đợt 4 BLOCKED.
Nguồn kiểm tra: main 7192af6c28b51b56806b0b9c6827d2d0604bbc8a. Phiên bản package.json: 1.0.1. Không tạo version/tag phát hành mới.

## Quyết định và release gates

| Gate | Kết quả thực tế | Điều kiện mở khóa / owner |
|---|---|---|
| Main/source | Đã đọc HEAD qua GitHub connector. Checkout local fb5a2f2 khác HEAD; git fetch lỗi kết nối proxy:8080 | 14 đồng bộ đúng SHA trước build |
| Tag/version/changelog | package 1.0.1; README còn tiêu đề 1.1; các Release cũ mang 1.2; root không có CHANGELOG. Chưa xác minh tag phát hành gắn HEAD | 01/14 khóa version và changelog duy nhất trước tag |
| COORD-01 / ARCH-01 | MASTER-STATUS còn đề xuất/chưa nghiệm thu; contract nháp | 01/02/10 chốt scope và contract |
| SEC-01 | Chưa có sign-off cuối. PIN công khai, xác thực local demo không phải bảo mật ngân hàng | 06/13 nghiệm thu đúng phạm vi demo |
| DB-01 / TX-01 | SQL A3.6 final diff/GATE provenance và persistent transfer/concurrency chưa nghiệm thu; NOT RUN | 07/08/13 cung cấp log môi trường disposable và review |
| UX-01 | Chưa có nghiệm thu cuối toàn bộ tiêu chí/thiết bị thật | 03/04/05/13 cung cấp evidence |
| QA-01 | Issue #44 mới xác nhận đang làm Đợt 2A; 13-qa-test-matrix.md là bản nháp, TEST:QA-01..12 NOT RUN cho phạm vi mới; không tìm thấy nghiệm thu cuối trong nguồn điều phối đã đọc | 13 bàn giao báo cáo cuối đúng SHA, scope và blocker |
| CI/E2E | Connector fetch_commit_workflow_runs(HEAD) trả []; combined status trả []; chưa chứng minh CI HEAD đạt. Run 42192443494 job 127807488858 success, kể cả unit/backend/build/E2E, là bằng chứng lịch sử riêng | 14/13 CI và E2E thành công đúng release SHA; đọc artifact/log |
| OPS-01 / Website | BLOCKED; github-pages là đích ghi trong workflow nhưng chưa có deployment mới được nghiệm thu và rollback target được xác minh | 14 xác minh environment, quyền, baseline và smoke test trước phát hành |
| APK | BLOCKED; không build/phát hành mới khi QA còn thiếu và source local không khớp. Thiếu aapt/apksigner/adb trong PATH | 05/14 build đúng SHA, xác minh package/version/icon/signature, thiết bị thật |
| Artifact/download | Chưa có artifact Đợt 4 hoặc checksum mới. Không dùng artifact cũ thay thế | 14 kiểm tra tải lại, SHA256, chữ ký, manifest và provenance |
| Recovery | Kế hoạch dưới đây đã soạn, chưa diễn tập | 14 diễn tập trên sandbox trước release |

Không diễn giải danh sách status/run trống thành test FAIL hay PASS; connector workflow query có giới hạn. Không chạy lại test trên checkout cũ rồi gán kết quả cho main mới.

## Kiểm kê artifact và URL

- Website ghi trong README: https://tuong26121-cell.github.io/Ngan_hang_NhTBank/ — KNOWN-HISTORICAL; chưa xác minh HTTP, nội dung, commit hoặc smoke test live trong lượt này. Không phải URL deployment mới Đợt 4.
- Release lịch sử: https://github.com/tuong26121-cell/Ngan_hang_NhTBank/releases/tag/demo-apk-latest
- Tag demo-apk-latest được resolve qua GitHub tới 08b40d34f6bb17826767190b8032c5a825ed2c4c, khác HEAD.
- Asset lịch sử: NhTBank-Demo.apk; URL https://github.com/tuong26121-cell/Ngan_hang_NhTBank/releases/download/demo-apk-latest/NhTBank-Demo.apk
- SHA256 do API GitHub công bố: cc80511d06f9e14f58b0f73f872d83a3c442b441a2b545ad880a8e26816c1328. Chưa tải lại bytes để tính độc lập; không xác nhận integrity/chữ ký/package/logo/version của asset này. Không khuyến nghị cài như bản Đợt 4.
- Các Release NhTBank_1.2, NhTBank1.2, NhTBank_1.1 không có assets tại lần đọc. Source ZIP không phải APK.
- capacitor.config.json: appId vn.nhtbank.demo, appName NhTBank Demo. Đây là cấu hình nguồn, chưa phải manifest APK đã kiểm chứng.
- Workflow Android hiện assembleDebug; versionCode = 1000 + github.run_number; versionName từ package.json. Debug key có thể khác giữa runner; chưa có khóa release ổn định. Artifact workflow lưu 14 ngày, cần đăng nhập GitHub.
- Logo NT được README mô tả và cấu hình nguồn; hình icon đóng gói và launcher trên điện thoại chưa được nghiệm thu trong lượt này.

## Hướng dẫn bàn giao có điều kiện

Chỉ cài APK sau khi 13/14 cung cấp artifact đủ gate: kiểm tra commit/version/package và SHA256 từ manifest phát hành qua nguồn tin cậy; chạy sha256sum -c ma-kiem-tra-sha256.txt, apksigner verify --verbose --print-certs, và aapt dump badging. Checksum không thay thế xác minh chữ ký. Đối chiếu logo NT launcher với tài nguyên đã duyệt; kiểm tra versionName/versionCode, vn.nhtbank.demo và debug/release đúng phạm vi.
Tải ZIP từ run thành công, giải nén APK trên máy tin cậy; Android cho phép nguồn cài của trình duyệt/quản lý tệp chỉ khi cần, cài trên thiết bị thử nghiệm và tắt quyền đó sau cài. Không tắt Play Protect. Nếu khác chữ ký, không ghi đè hoặc xóa dữ liệu vội: xác minh nguồn; gỡ bản demo chỉ khi chấp nhận mất tài khoản demo cục bộ. Không nhập dữ liệu ngân hàng thật.
Chạy smoke test: mở app, logo/version, đăng ký demo, đăng nhập, chuyển tiền Sandbox và biên nhận, đăng xuất, mở lại; camera chỉ cấp khi thử QR. Ghi thiết bị/Android/build SHA/kết quả; chưa thực hiện các bước này trong lượt này.

Website: sau khi có deployment đủ gate, mở URL được chứng minh trong release manifest; tạo tên/mật khẩu demo riêng, lưu mã khôi phục offline; PIN 123456 chỉ cho chuyển tiền mô phỏng. Thử Android ?view=android và Windows ?view=windows, đăng xuất sau dùng. Không dùng QR Studio để tạo/chuyển tiền thật trong nghiệm thu; không gọi provider thật. Không coi URL README là bằng chứng phiên bản đang chạy.

## Rollback và recovery plan

Trước deploy: 14 ghi deployment ID/run/source SHA của bản đang phục vụ, lưu artifact và hash ở nơi được phép; kiểm chứng có thể dựng lại baseline, tách dữ liệu/demo khỏi hệ thống thật, xác minh quyền và chi phí. Chưa có baseline deployment ID được xác minh nên chưa sẵn sàng rollback thực thi.
Nếu lỗi smoke, mất nhãn demo, lộ dữ liệu hoặc signature/hash sai: dừng phát hành và thu hồi link mới trong kênh bàn giao; không đổi tag cũ hoặc xóa evidence. Với Pages, triển khai lại artifact/baseline SHA đã nghiệm thu bằng workflow có kiểm soát; không git reset/force-push main. Không chọn commit lịch sử chưa được nghiệm thu làm rollback mặc định.
APK: dừng phân phối, ghi hash/signing certificate của bản lỗi; chỉ đưa bản trước đã xác minh. Android thường chặn downgrade/version/signature; ưu tiên bản sửa có versionCode cao hơn cùng khóa, không hứa hạ cấp tại chỗ. Nếu buộc gỡ/cài lại, báo mất dữ liệu demo trước.
Recovery: rebuild đúng lockfile/Node/Java/SDK, đối chiếu provenance và hash, chạy lại CI/E2E/device smoke, QA ký lại trước mở tải. Không có migration/DB/backend deploy trong Đợt 4 này; không chạy SQL phục hồi trên môi trường chưa định danh. RTO/RPO chưa đo; không cam kết số liệu.

## Tính năng và giới hạn

Theo mã/tài liệu hiện có: UI React demo, đăng ký/đăng nhập cục bộ, dashboard, chuyển tiền Sandbox, QR demo cục bộ, lịch sử phiên, bố cục Android/Windows; đã có workflow web/Android và test. Đây là kiểm kê, không phải nghiệm thu runtime mới.
Chưa hoàn thành/nghiệm thu: auth/session server và MFA, ledger/persistent transfer atomic, DB ACL/RLS/concurrency, backend production, release signing Android và thiết bị thật, nghiệm thu cuối Nhóm 13, rollback drill. Tiền gửi/vay/thẻ/hóa đơn và nhiều tiện ích vẫn preview; Admin/AI/SePay còn phụ thuộc contract/gate.
Dữ liệu auth demo ở localStorage; xóa dữ liệu trình duyệt có thể mất tài khoản. Giao dịch phiên không đại diện số dư thật. QR Studio tùy chọn có ranh giới bên thứ ba/QR có thể dùng bên ngoài; cần review riêng trước công bố scope.
Không phát hành demo như ngân hàng được cấp phép. Không có giao dịch tiền thật, không triển khai backend hoặc SQL. Phạm vi được bàn giao đợt này: tài liệu, kiểm kê bằng chứng và danh sách blocker; không có bản ứng dụng mới được phát hành.

Nguồn: Issue #44/comment 6681799103; MASTER-STATUS; HANDOFF-LOG; dot-1/13-qa-test-matrix.md; workflow deploy-pages/xay-dung-apk-android/verify-main-integration; package/config tại SHA nêu trên. Owner mở khóa: 13 QA cuối; 01 scope/version; 14 CI/deploy/artifact/recovery; 05 Android; 06/07/08 security/data/transfer.


## Cập nhật xác minh ngày 07/11/2026 (Asia/Saigon)

Đã đọc [báo cáo Nhóm 13 Đợt 2A](dot-2a/13-kiem-thu-nen-tang.md): unit 70/70, backend 25/25, build PASS, E2E 43 PASS/8 skip; SQL và native APK NOT RUN. Đây là số liệu trong báo cáo QA đã nhận, không phải test chạy lại của Nhóm 14. ARCH-01/SEC-01/DB-01/TX-01/QA-01/OPS-01 vẫn BLOCKED theo quyết định QA. ACK nhận hiện vật HO-2A-13-14: đã đọc; ACK này không chấp thuận release.

Đính chính giới hạn truy vấn CI ở bản đầu: fetch_commit_workflow_runs chỉ lọc run do pull_request, nên kết quả rỗng không chứng minh thiếu CI push. Truy vấn REST actions/runs theo head_sha đã xác minh main 295eff3811bc5654aaf6677a226eba7b4d0dd4d7 có Verify success [42196968950](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42196968950) và Pages workflow success [42196968799](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42196968799). Baseline 7192af6 cũng có Verify success 42194370164 và Pages workflow success 42194370353. Workflow success không tự chứng minh deploy job chạy hoặc gate bảo mật/thiết bị thật đạt.

Quyết định Đợt 4 vẫn PARTIAL: tài liệu được cập nhật; ứng dụng mới BLOCKED. Không tạo tag/version, APK, checksum hoặc URL phát hành mới. Giữ package 1.0.1; artifact lịch sử không được nhận làm release mới. Tiếp theo: owner 13 cung cấp nghiệm thu cuối đúng phạm vi; 01/14 khóa version/changelog; 14 baseline rollback và environment; 05/14 artifact/signature/icon/package/version/device. Tham chiếu [bàn giao chi tiết](ban-giao-dot-4-20261106.md).
