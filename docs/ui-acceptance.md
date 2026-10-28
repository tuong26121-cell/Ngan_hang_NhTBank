# Đối chiếu giao diện NhTBank ngày 26/10/2026

Đây là bản cải tiến theo chuẩn người dùng cung cấp, chưa phải nghiệm thu chính thức. Chuẩn trung tâm: [ui-standard.md](ui-standard.md). Đủ 45 mã (32 P0, 12 P1, 1 P2), khác số cộng 43/30 trong bảng tổng hợp Word gốc.

## Phiên bản và phạm vi

- Website trước sửa: Site commit `3c0ff8a5315e03df47925684fe57a04cae97b6b2`, khớp mã nguồn ứng dụng bảo mật ở GitHub `e5c0891` (PR #3).
- Bản sửa: commit chứa báo cáo này, xác định đầy đủ bằng `git log -1 --format=%H -- docs/ui-acceptance.md`; PR và phiên bản Sites gắn commit riêng cho từng kho.
- Chỉ UI/UX, truy cập và kiểm thử; giữ backend, dependencies, cấu trúc giao dịch, PIN demo, số dư và QR cục bộ.
- Chuẩn nền và trạng thái mới nhất được lưu trong repository; AGENTS yêu cầu mỗi sửa đổi tiếp theo cập nhật đối chiếu tiêu chí bị ảnh hưởng.

## Bằng chứng kiểm tra

- `npm test`: 31/31 unit/component đạt.
- E2E Chromium 153 Linux: 6 hành trình desktop/mobile và 4 ca responsive; 4 ca trùng lặp được chủ động bỏ qua ở project mobile vì bốn chiều rộng đã chạy ở project desktop. Không phải kiểm thử Safari hoặc Android thật.
- `npm run build` và `git diff --check`: phải đạt trước commit/phát hành.
- Ảnh chụp bốn kích thước trong `docs/screenshots/ui-320.png`, `ui-360.png`, `ui-390.png`, `ui-430.png`. Hình toàn trang ghi thanh cố định tại vị trí viewport gốc; nội dung phía dưới cuộn qua thanh này bình thường.
- Hồi quy E2E: PIN sai/đúng, thiếu số dư, chuyển tiền ba bước, PIN xác nhận sai/đúng, cập nhật số dư/lịch sử, lọc/tìm, decode QR, không gửi request ngoài khi QR, sản phẩm xem trước, hỗ trợ và đăng xuất xóa dữ liệu không reload.

## Đối chiếu 45 tiêu chí

“Đạt trong bản thử” chỉ áp dụng môi trường ghi trên. Các mục cần thiết bị thật, đo hiệu suất, profiling hoặc rà tương phản toàn diện được giữ ở trạng thái chưa hoàn tất.

| Mã  | Ưu tiên | Nội dung               | Trạng thái                  | Bằng chứng hoặc việc còn thiếu                                                                   |
| --- | ------- | ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------------ |
| A01 | P0      | Màu chủ đạo            | Đạt trong bản thử           | Ảnh Chromium desktop và bốn viewport; xanh dương/trắng/xanh nhạt.                                |
| A02 | P1      | Gradient               | Đã xem trực quan            | Thẻ số dư chuyển màu xanh đậm, ảnh chụp; cần đối chiếu thêm màn hình thật.                       |
| A03 | P0      | Độ tương phản          | Kiểm tra một phần           | Chữ phụ đổi #52627c; bảng màu nền sáng được tính tỷ lệ. Chưa đo mọi cặp màu/gradient/trạng thái. |
| A04 | P0      | Logo                   | Đạt trong bản thử           | Logo SVG cùng viewBox, kiểm tra ở desktop và mobile.                                             |
| A05 | P0      | Tính đồng bộ           | Đạt trong bản thử           | Dùng chung Brand, Button, CSS và biểu tượng Lucide trên các màn.                                 |
| B01 | P0      | Khu vực đầu trang      | Đạt trong bản thử           | Ảnh chụp: logo, tên Nhựt Tường, đại diện NT và thông báo.                                        |
| B02 | P0      | Thẻ tài khoản          | Đạt trong bản thử           | Số dư 4.056.000, STK 0788 818 374; không thay dữ liệu nền.                                       |
| B03 | P0      | Ẩn/hiện số dư          | Đạt trong bản thử           | E2E ẩn/hiện xác nhận số dư vẫn 4.056.000.                                                        |
| B04 | P0      | Chức năng chính        | Đạt trong bản thử           | Các lối tắt và 5 tab dẫn đến màn hiện có, không thêm nghiệp vụ.                                  |
| B05 | P0      | Bố cục linh hoạt       | Đạt trong bản thử           | E2E 5 màn ở 320/360/390/430 không tràn ngang, xem ảnh.                                           |
| B06 | P1      | Khoảng cách            | Đã xem trực quan            | Ảnh chụp, thẻ/nút/khoảng cách; cần ý kiến thẩm mỹ của chủ ứng dụng.                              |
| C01 | P0      | Kích thước vùng chạm   | Đạt trong bản thử           | E2E đo DOM mọi nút hiển thị ở 5 màn/4 chiều rộng đều ít nhất 44×44 CSS px.                       |
| C02 | P0      | Trạng thái tương tác   | Đạt trong bản thử           | Hover/active/ripple và aria-current; ảnh/chạy thử Chromium.                                      |
| C03 | P1      | Biểu tượng             | Đạt trong bản thử           | Biểu tượng Lucide đồng bộ, tên truy cập cho tab cả khi thu gọn.                                  |
| C04 | P1      | Góc bo tròn            | Đã xem trực quan            | Bo góc đồng bộ nhóm nút, thẻ và vùng nhập.                                                       |
| C05 | P0      | Phản hồi thao tác      | Đạt trong bản thử           | Luồng ba bước và biên nhận; unit chặn xác nhận lặp; hồi quy E2E.                                 |
| C06 | P0      | Trạng thái vô hiệu hóa | Đạt trong bản thử           | Nút disabled dùng thuộc tính native; unit ca PIN/QR/số tiền sai.                                 |
| D01 | P1      | Thẻ 3D                 | Đã xem trực quan            | Bóng đổ và phối cảnh thẻ; trang trí mobile chiếm vùng riêng để tránh đè chữ.                     |
| D02 | P2      | Glassmorphism          | Đã xem trực quan            | Kính mờ nhẹ giữ ở thẻ trang chào/nút; thanh mobile nền đặc dễ đọc.                               |
| D03 | P1      | Hiệu ứng chuyển trang  | Chưa xác minh đầy đủ        | Chuyển trang chạy được; chưa đo frame rate trên thiết bị mục tiêu.                               |
| D04 | P1      | Chuyển động của nút    | Đạt trong bản thử           | Nút có active/ripple, E2E hoàn thành thao tác.                                                   |
| D05 | P0      | Giảm chuyển động       | Đạt trong bản thử           | Page bỏ dịch chuyển/fade khi giảm chuyển động; MotionConfig, CSS và E2E reduce.                  |
| D06 | P0      | Giới hạn hiệu ứng      | Đạt trong bản thử           | Ảnh + hành trình không che nút; trang trí không nhận pointer trên mobile.                        |
| E01 | P0      | Cấu trúc               | Đạt trong bản thử           | E2E đúng thứ tự Trang chủ, Giao dịch, QR, Lịch sử, Cá nhân.                                      |
| E02 | P0      | Điều hướng             | Đạt trong bản thử           | E2E bấm từng tab và xác nhận tiêu đề màn đích.                                                   |
| E03 | P0      | Trạng thái lựa chọn    | Đạt trong bản thử           | E2E aria-current=page; nền xanh và viền chỉ báo tab chọn.                                        |
| E04 | P0      | Vị trí                 | Đạt trong bản thử           | Thanh cố định, đệm cuối trang và cuộn nội dung trong Chromium.                                   |
| E05 | P0      | Vùng an toàn           | Chưa xác minh thiết bị thật | Đã thêm viewport-fit=cover và safe-area; cần thử Android/iOS có vùng hệ thống.                   |
| F01 | P0      | Android                | Chưa xác minh thiết bị thật | Chromium desktop giả lập mobile không thay cho Chrome Android trên ZTE.                          |
| F02 | P0      | iPhone                 | Chưa xác minh thiết bị thật | Chưa có Safari iOS 16.7.11 thật; không coi viewport iPhone là Safari.                            |
| F03 | P0      | Responsive             | Đạt trong bản thử           | E2E không tràn ngang ở đủ 4 chiều rộng trên 5 màn.                                               |
| F04 | P1      | Xoay màn hình          | Đạt trong bản thử           | E2E xoay sang 844×320/360/390/430, không tràn ngang và vẫn mở màn giao dịch.                     |
| F05 | P0      | Bàn phím ảo            | Chưa xác minh thiết bị thật | Cỡ chữ nhập 16px, scroll-margin; cần bật bàn phím thật, thử cuộn và nút xác nhận.                |
| G01 | P1      | Hiển thị trang đầu     | Chưa đo                     | Chưa thống nhất cấu hình/mạng cho LCP 2,5s. Không điền số ước lượng.                             |
| G02 | P1      | Phản hồi tương tác     | Chưa đo                     | Chưa có đủ dữ liệu đo INP 200ms.                                                                 |
| G03 | P1      | Độ ổn định bố cục      | Chưa đo                     | Chưa đo CLS 0,1 trên điều kiện nghiệm thu đã thống nhất.                                         |
| G04 | P0      | Bộ nhớ                 | Chưa đo                     | Timer/animation có cleanup trong mã; chưa profiling heap và thử lặp đủ dài.                      |
| G05 | P0      | Tính ổn định           | Đạt trong bản thử           | Hành trình E2E kiểm tra pageerror/console.error, không ghi nhận lỗi.                             |
| G06 | P0      | Tối ưu hiệu ứng        | Chưa xác minh thiết bị thật | Chạy thử Chromium đạt; cần thử độ ổn định/hiệu ứng trên iPhone 8 và ZTE.                         |
| H01 | P0      | Bảo toàn chức năng     | Đạt trong bản thử           | 31 unit/component + hành trình chuyển tiền, QR, lịch sử, hỗ trợ, đăng xuất.                      |
| H02 | P0      | Bảo toàn dữ liệu       | Đạt trong bản thử           | Diff không đổi lib/bank.js; dữ liệu số dư, chủ tài khoản, STK giữ nguyên.                        |
| H03 | P1      | Luồng thao tác         | Đạt trong bản thử           | Không đổi các bước chuyển tiền; QR dùng màn có sẵn.                                              |
| H04 | P0      | Thông báo mô phỏng     | Đạt trong bản thử           | Banner mô phỏng luôn thấy sau đăng nhập; nhãn Sandbox và QR demo còn nguyên.                     |
| H05 | P0      | Thông tin nhạy cảm     | Kiểm tra trong phạm vi sửa  | Không thêm secret/credentials; PIN công khai 123456 là dữ liệu demo đã nêu trong README.         |
| H06 | P0      | QR và chuyển tiền      | Đạt trong bản thử           | E2E giải mã payload NHTBANK_SANDBOX, không request ngoài khi tạo QR; không thêm API.             |

## Các lỗi phát hiện và sửa lại trong vòng kiểm tra

- Tab chỉ có 4 mục: thêm liên kết QR đến màn hiện có, đổi nhãn đúng 5 mục theo E01. Không thêm chức năng tài chính.
- Nút ẩn số dư 24px, thông báo 36px: tăng nền chung lên ít nhất 44px; E2E đo kích thước thực.
- Thu gọn thanh bên khi xoay làm mất tên truy cập do chữ bị ẩn: thêm aria-label độc lập cho từng tab; kiểm tra lại sau xoay.
- Trang trí tiền gửi đè vùng chữ mobile: đưa trang trí vào luồng bố cục, giữ chiều sâu 3D, không bắt sự kiện chạm.
- Màn 320px: xếp dòng tiền thành một cột, tránh ép chữ/số; thẻ tài khoản cho phép xuống dòng.
- Chữ phụ nhạt: chỉnh bảng màu, đặc biệt cảnh báo mô phỏng; chưa tuyên bố đạt toàn bộ A03 khi chưa đo mọi trạng thái.
- Ngày cố định dễ bị hiểu là ngày hiện tại: ghi rõ “Dữ liệu mẫu · Tháng 10/2026”.

## Điều kiện còn lại trước nghiệm thu chính thức

Cần kiểm tra Chrome Android trên ZTE và Safari iOS 16.7.11 trên iPhone 8 (dọc/ngang, vùng hệ thống, bàn phím, cuộn, focus). Cần chốt thiết bị và mạng để đo LCP/INP/CLS; profiling bộ nhớ sau thao tác lặp; rà tương phản đầy đủ cả gradient, hover, focus và lỗi. Không kết luận “hoàn hảo” hay đạt tất cả P0 trước khi có bằng chứng này.

## Tỷ lệ tương phản bảng màu

Tính từ sRGB của các màu đặc; không thay thế phép đo nền gradient thực tế hoặc mọi trạng thái.

| Chữ       | Nền       | Tỷ lệ  |
| --------- | --------- | ------ |
| `#52627c` | `#ffffff` | 6.18:1 |
| `#52627c` | `#f4f7fc` | 5.76:1 |
| `#52627c` | `#edf3ff` | 5.55:1 |
| `#edf3ff` | `#2354ad` | 6.41:1 |
| `#08725b` | `#ffffff` | 5.89:1 |

## Tiếp tục sau PR #5 — giảm chuyển động (26/10/2026)

- Nền mới nhất khi bắt đầu: `3a9cdab03a432299a7de59e2940750a14148e2b0` trên main. Bản cục bộ `c1bd856` không được ghi đè lên phiên bản đã gộp. Bản sửa tiếp theo nằm trên nhánh `codex/ui-motion-followup-20261026`; commit xác định bằng `git log -1 --format=%H -- frontend/src/components/Login.jsx frontend/src/components/Transfer.jsx`.
- D05: tắt fade khởi tạo của vùng nhập PIN/vùng chờ đăng nhập và tắt fade/dịch chuyển giữa các bước chuyển tiền khi `prefers-reduced-motion: reduce`. Khi không bật giảm chuyển động, giữ hiệu ứng mặc định trước đó. Không đổi thời gian xử lý PIN, dữ liệu hoặc nghiệp vụ.
- H01/H02/H06: chạy lại 31 unit/component (đạt), build production (đạt), và E2E bằng cấu hình chính thức với `NHT_CHROMIUM_PATH` trỏ Chromium 153 Linux: 10 đạt, 4 bỏ qua có chủ đích do ma trận responsive chỉ chạy ở project desktop. Hai project vẫn chạy hành trình chính; không phải thử Android hoặc Safari thật.
- Rà soát React: hook gọi ở cấp component, không thay thứ tự hook hoặc thêm effect/listener; không thêm phụ thuộc. `git diff --check` đạt. Các mục thiết bị thật, tương phản toàn diện và hiệu suất chưa có bằng chứng mới giữ nguyên trạng thái. Không coi việc đẩy nhánh/PR là đã cập nhật website.

## Nâng cấp nền tảng giao dịch — 29/10/2026

Nền mới nhất lúc bắt đầu là `db6b58e`, nhánh làm việc `codex/transaction-platform-20261029`. Khác với các lần sửa UI trước, người dùng lần này yêu cầu thay đổi toàn bộ cấu trúc mã và luồng A–M; backend/lõi giao dịch được bổ sung có chủ đích. Giữ nhận diện hiện có, năm tab, số dư mở đầu, dữ liệu minh họa cũ và các bản xem trước native. Không ghi đè prototype MagicPath hoặc tự triển khai backend công khai.

### Đối chiếu lại đủ 45 mã

Các dòng dưới đây bổ sung trạng thái mới, không biến các giới hạn thiết bị thật/hiệu suất của báo cáo trước thành đạt.

| Mã                 | Kết quả trong phạm vi nâng cấp                                                                                | Bằng chứng / giới hạn                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| A01, A02, A04, A05 | Giữ nhận diện xanh dương, Brand/SVG và Lucide; màn vận hành dùng cùng hệ màu                                  | Xem hai ảnh platform-mobile/desktop; không tự đổi logo                                  |
| A03                | Kiểm tra tự động màn vận hành tại 390/1440; chưa kết luận toàn ứng dụng đạt WCAG                              | Axe không phát hiện vi phạm trong phạm vi mới; trạng thái cũ/chuyên biệt vẫn cần rà     |
| B01, B02, B03, B04 | Hồi quy header, số dư mở đầu, ẩn/hiện và lối tắt                                                              | Hành trình khách hàng desktop/mobile, dữ liệu seed giữ nguyên                           |
| B05, B06           | Vận hành một cột trên điện thoại, nhiều cột trên máy tính; bảng có vùng cuộn riêng                            | Viewport 320/360/390/412/768/1366/1440/1920, đo sau khi layout responsive ổn định       |
| C01                | Vùng chạm của nút/summary vận hành hiển thị ít nhất 44×44 CSS px                                              | Đo DOM trên tám kích thước; không phải đo phần cứng                                     |
| C02, C03, C04      | Nút/biểu tượng, viền, khoảng cách và trạng thái nhất quán trong màn mới                                       | Xem render và thao tác thực tế trên Chromium                                            |
| C05, C06           | Có trạng thái chờ/lỗi; không hiện thành công khi mất phản hồi; nút quyền khác bị vô hiệu hoặc không xuất hiện | Kiểm thử UI mất phản hồi sau commit, gửi lại cùng key và phê duyệt khác vai trò         |
| D01, D02           | Không thay thẻ 3D/kính mờ của bản nền                                                                         | Luồng khách hàng hiện có được hồi quy                                                   |
| D03                | Chưa đo frame rate hoặc hiệu suất chuyển trang trên thiết bị thật                                             | Giữ giới hạn cũ                                                                         |
| D04, D05, D06      | Giữ phản hồi nút, reduced motion và không thêm hiệu ứng cản thao tác tài chính                                | E2E giảm chuyển động; workspace không chạy hiệu ứng số tiền                             |
| E01, E02, E03, E04 | Giữ 5 tab; Vận hành là trang con Cá nhân, đánh dấu khu vực bằng aria-current=location                         | E2E tab cũ và luồng vào/ra vận hành; không thêm tab thứ sáu                             |
| E05                | Chưa xác minh vùng an toàn trên máy thật                                                                      | Không thay bằng kết quả viewport                                                        |
| F01, F02           | Chưa thử Android/Safari iPhone phần cứng                                                                      | Giữ trạng thái chưa xác minh                                                            |
| F03, F04           | Hồi quy responsive và xoay của bản nền; bổ sung các cỡ mới cho vận hành                                       | Các ca UI cũ và platform mới trong E2E                                                  |
| F05                | Input/textarea vận hành 16px và focus rõ; chưa thử bàn phím ảo thật                                           | Tab/Escape/khôi phục focus đã thử trên Chromium                                         |
| G01, G02, G03, G04 | Chưa đo LCP, INP, CLS hoặc heap đủ điều kiện nghiệm thu                                                       | Không điền số ước lượng                                                                 |
| G05                | Hồi quy luồng cũ và luồng mới; lỗi mạng thử nghiệm được xử lý có thông báo                                    | Không gọi lỗi mạng được tiêm có chủ đích là lỗi JS chưa xử lý                           |
| G06                | Chưa xác minh tải dài/độ ổn định trên điện thoại mục tiêu                                                     | Giữ giới hạn cũ                                                                         |
| H01, H02           | Giữ chức năng cũ, chủ tài khoản, số dư đầu kỳ và QR; phân biệt lịch sử minh họa với sổ mới                    | 31 unit/component và hồi quy khách hàng; backend giữ dữ liệu theo mode mới được yêu cầu |
| H03                | Khách hàng vẫn nhập → kiểm tra → PIN → kết quả; vận hành có luồng riêng                                       | Không chèn phê duyệt thủ công vào mọi chuyển tiền khách hàng                            |
| H04, H05, H06      | Nhãn mô phỏng, PIN public có giải thích, không nhúng bí mật/API ngân hàng thật                                | QR cục bộ cũ giữ nguyên; API mới là API Sandbox cùng nguồn                              |

### Bằng chứng và kết luận

Xem `docs/platform-validation.md` cho lệnh chạy và phạm vi. Hai ảnh mới nằm ở `docs/screenshots/platform-mobile.png` và `platform-desktop.png`; không thay ảnh baseline cũ. Đã kiểm tra Tab/Escape và focus khôi phục cho hộp đổi vai trò. Không nghiệm thu chính thức toàn bộ P0 khi thiết bị thật, bàn phím ảo, hiệu suất và rà tương phản toàn diện chưa có bằng chứng.

## Hệ thống v2 — mất mạng khi chuyển tiền, 29/10/2026

Nền `cf8cc38`, nhánh `codex/resilient-transfers-v2-20261029`. Commit nguồn xác định bằng `git log -1 --format=%H -- frontend/src/lib/transfer-recovery.js packages/banking-core`. Người dùng yêu cầu đổi luồng nghiệp vụ; bản cập nhật giữ nhận diện và năm tab, thêm phục hồi mã qua tải lại, nội bộ/đảo có duyệt và kiểm mốc backup.

| Mã đối chiếu (đủ 45)         | Kết quả trong phạm vi v2                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01, A02, A04, A05           | Giữ màu xanh dương, logo, font và Lucide; ảnh phục hồi mobile/desktop đã xem. Không thiết kế lại thương hiệu.                                                                       |
| A03                          | axe không phát hiện vi phạm trên vùng `.transfer-recovery` ở 390/1440 px. Chưa rà tương phản toàn bộ mọi màn/trạng thái; giữ giới hạn nghiệm thu cũ.                                |
| B01, B02, B03, B04           | Luồng trang chủ, số dư/ẩn hiện và thao tác chính qua hồi quy E2E; giao dịch chưa rõ kết quả có lối mở lại, không đổi giá trị tiền từ trạng thái UI.                                 |
| B05, B06                     | Màn phục hồi không tràn ngang ở 8 độ rộng 320–1920; key UUID tự xuống dòng, các nhóm cách rõ. Bảng vận hành cuộn ngang có nhãn khi cần.                                             |
| C01, C02, C03, C04, C05, C06 | Nút phục hồi đo ≥44 × 44; busy/khóa gửi; có focus rõ và Enter; kiểm tra/nhập PIN/gửi lại là hành động thật. Đồng bộ bo góc/kiểu nút cũ.                                             |
| D01, D02, D03, D04, D05, D06 | Giữ hiệu ứng cũ và reduced-motion; biên nhận focus đầu, không cuộn xuống ô nhập. Giao dịch server không dùng hiệu ứng để suy diễn thành công. Chưa đo FPS trên thiết bị thật.       |
| E01, E02, E03, E04, E05      | Giữ 5 tab/trạng thái chọn/thanh cố định và đệm cũ, hồi quy E2E đạt. Vùng an toàn hệ thống Android/iPhone thật vẫn chưa xác minh.                                                    |
| F01, F02, F03, F04, F05      | Chromium viewport mobile/desktop và đổi độ rộng đạt; có 320/360/390/430 và ma trận bổ sung. Android/Safari thật, xoay thiết bị thật và bàn phím ảo chưa kiểm.                       |
| G01, G02, G03, G04           | Chưa có phép đo mới về LCP, INP, CLS, heap; không nâng thành đạt.                                                                                                                   |
| G05, G06                     | 37 frontend + 46 lõi/API + 20 E2E đạt; kiểm bổ sung phục hồi không có pageerror chưa xử lý. Lỗi mạng chủ ý có thông báo. Chưa suy rộng sang mọi thiết bị/điều kiện mạng.            |
| H01, H02                     | Hồi quy chức năng giữ hoạt động; số dư đầu kỳ/lịch sử mẫu/QR giữ nguyên. Thêm receipt, tài khoản nội bộ 0 đồng, bút toán bù và schema v2 theo yêu cầu, có kiểm migration giữ sổ cũ. |
| H03                          | Đường bình thường vẫn nhập → kiểm tra → PIN → biên nhận. Chỉ đường chưa rõ kết quả mới cần tra cứu/đăng nhập lại/resend đúng mã; không bắt tạo lại nội dung.                        |
| H04, H05, H06                | Có nhãn minh họa/không tiền thật; key và lệnh mẫu có lưu localStorage, PIN/cookie/CSRF không được lưu vào hồ sơ. Không thêm API ngân hàng hoặc payload QR thanh toán thật.          |

Bằng chứng chi tiết: [system-v2-validation](system-v2-validation.md). Các tiêu chí P0 chưa xác minh vẫn chưa đủ điều kiện nghiệm thu chính thức; không gọi đây là ứng dụng ngân hàng sản xuất.
