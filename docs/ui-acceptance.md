# Đối chiếu giao diện NhTBank · cập nhật 29/10/2026

Bản cập nhật mới nhất tích hợp giao diện NhTBank 1.1; xem mục ngày 29/10/2026 phía dưới. Đây là bản cải tiến theo chuẩn người dùng cung cấp, chưa phải nghiệm thu chính thức. Chuẩn trung tâm: [ui-standard.md](ui-standard.md). Đủ 45 mã (32 P0, 12 P1, 1 P2), khác số cộng 43/30 trong bảng tổng hợp Word gốc.

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

## Tích hợp mẫu NhTBank 1.1 — 29/10/2026

- Nền trước sửa: `6131260c0ea3c0c4dcbd73b3a7eff233aabb6c16`; nhánh tính năng `codex/nhtbank-v11-interface`. Commit bản bàn giao là commit chứa mục này, lấy bằng `git log -1 --format=%H -- docs/ui-acceptance.md`.
- Ảnh trước sửa đã lưu trong `docs/screenshots/dashboard-mobile.png` và `dashboard-desktop.png`. Ảnh mới mang tiền tố `v11-`.
- Mẫu trực quan chính: tệp `NhTBank-Android.html` trong gói `App NhTBank v1. 1.zip`. Mã mẫu JavaScript đầy đủ và HTML độc lập được giữ nguyên ở `references/nhtbank-v11/`; đã đối chiếu từng byte của 29 tệp nguồn gốc. Không thực hiện các hướng dẫn xuất bản trong tài liệu đính kèm.
- Tích hợp: CSS xanh lam–tím, torus, thẻ tài khoản, nút biểu tượng nổi, tám tiện ích và QR nổi. Dựng lại biểu tượng Unicode lỗi phông thành SVG. Tận dụng phông Be Vietnam Pro nội bộ, giữ giấy phép. Giao diện React giữ dữ liệu và nghiệp vụ sẵn có; các tiện ích mới chỉ điều hướng đến màn hiện có hoặc mở giải thích bản xem trước.
- Thêm hai điểm mở `?view=android` / `?view=windows`, liên kết đổi bố cục và trình xuất HTML độc lập từ production bundle. Không thêm dependency, backend, camera hoặc cơ chế lưu dữ liệu của mẫu JavaScript.
- Kiểm tra: **31/31 unit/component đạt**, build production đạt. Bộ E2E chính thức Chromium Linux: **10 đạt, 4 bỏ qua có chủ đích** vì bốn viewport được chạy một lần trong project desktop; hành trình chính vẫn chạy cả desktop/mobile. Bao gồm PIN sai/đúng, chuyển tiền, lỗi số dư/PIN xác nhận, cập nhật số dư/lịch sử, bộ lọc/tìm, giải mã QR và không request ngoài, sản phẩm xem trước, hỗ trợ/focus/Escape, đăng xuất và đặt lại dữ liệu.
- Rà React theo kỹ năng react-best-practices: hooks cấp component; giá trị thu/chi suy ra từ giao dịch; danh sách tĩnh ngoài component; SVG trang trí có aria-hidden và nút có tên; dialog dùng thành phần focus có sẵn; không thêm effect/listener trong dashboard.

### Đối chiếu toàn bộ 45 mã cho bản 1.1

Các bằng chứng phía trên thay thế mô tả giao diện cũ khi khác nhau. Các trạng thái chưa đo hoặc cần thiết bị thật được giữ nguyên.

| Mã  | Trạng thái hiện tại    | Bằng chứng / giới hạn                                                            |
| --- | ---------------------- | -------------------------------------------------------------------------------- |
| A01 | Đạt trong Chromium     | Ảnh mới: xanh dương, trắng và xanh nhạt; tím chỉ làm màu nhấn theo mẫu.          |
| A02 | Đã xem trực quan       | Nền và thẻ chuyển màu theo mẫu Android; không khẳng định trên mọi màn hình thật. |
| A03 | Kiểm tra một phần      | Chọn nền thẻ đậm hơn mẫu và icon xanh đậm; chưa đo toàn bộ gradient/trạng thái.  |
| A04 | Đạt trong Chromium     | Giữ hình SVG logo NhTBank và viewBox; ảnh màn hẹp/rộng.                          |
| A05 | Đạt trong Chromium     | Dùng chung font, ReferenceIcon, ReferenceMotif, Button và theme trên các màn.    |
| B01 | Đạt trong Chromium     | Logo, tên chủ tài khoản, NT và nút thông báo còn đầy đủ.                         |
| B02 | Đạt trong Chromium     | Số dư 4.056.000 và số tài khoản 0788 818 374 giữ nguyên.                         |
| B03 | Đạt trong Chromium     | E2E ẩn/hiện số dư và kiểm tra sau chuyển tiền.                                   |
| B04 | Đạt trong Chromium     | Bốn lối tắt và năm mục điều hướng đến màn hiện có.                               |
| B05 | Đạt trong Chromium     | E2E năm màn tại 320/360/390/430, không tràn ngang.                               |
| B06 | Đã xem trực quan       | Padding, bo góc, khoảng cách icon theo mẫu; ảnh mới.                             |
| C01 | Đạt trong Chromium     | E2E đo mọi nút hiển thị ≥44×44 CSS px tại bốn chiều rộng.                        |
| C02 | Đạt trong Chromium     | Hover/active/ripple, trạng thái chọn và aria-current.                            |
| C03 | Đạt trong Chromium     | SVG thay ký tự Unicode lỗi phông, cùng nét bo tròn; tám dịch vụ đủ nghĩa.        |
| C04 | Đã xem trực quan       | Bề mặt icon tròn/bo góc theo nhóm, dùng CSS chung.                               |
| C05 | Đạt trong Chromium     | Giữ các bước xác nhận và chống gửi lặp; hồi quy E2E.                             |
| C06 | Đạt trong Chromium     | Native disabled giữ nguyên; unit ca PIN/QR/số tiền sai.                          |
| D01 | Đã xem trực quan       | Torus CSS, thẻ nghiêng nhẹ và nút có highlight/đổ bóng.                          |
| D02 | Đã xem trực quan       | Thanh điều hướng nổi và bề mặt mờ nhẹ; nội dung rõ.                              |
| D03 | Chưa xác minh đầy đủ   | Chuyển màn dùng Page cũ; chưa đo frame rate trên thiết bị thật.                  |
| D04 | Đạt trong Chromium     | Phản hồi active/ripple và hover trên các nút.                                    |
| D05 | Đạt trong Chromium     | Tắt animation motif khi reduce; MotionConfig/Page giữ nguyên, E2E reduce.        |
| D06 | Đạt trong Chromium     | Torus không nhận pointer; nội dung cuộn qua thanh cố định, có đệm cuối trang.    |
| E01 | Đạt trong Chromium     | Đúng năm mục Trang chủ/Giao dịch/QR/Lịch sử/Cá nhân.                             |
| E02 | Đạt trong Chromium     | E2E mở từng màn và xác nhận tiêu đề.                                             |
| E03 | Đạt trong Chromium     | aria-current và màu chọn; QR có hình nổi, chữ vẫn hiển thị.                      |
| E04 | Đạt trong Chromium     | Thanh điện thoại cố định, có đệm cuối trang, hỗ trợ cuộn.                        |
| E05 | Chưa thử thiết bị thật | Dùng env(safe-area-inset-bottom); chưa có bằng chứng Android/iOS thật.           |
| F01 | Chưa thử thiết bị thật | Chromium Linux mô phỏng không thay Chrome Android trên ZTE.                      |
| F02 | Chưa thử thiết bị thật | Chưa thử Safari iOS 16.7.11 trên iPhone 8.                                       |
| F03 | Đạt trong Chromium     | E2E bốn viewport 320/360/390/430 trên năm màn.                                   |
| F04 | Đạt trong Chromium     | E2E xoay sang 844×320/360/390/430, vẫn mở được màn giao dịch.                    |
| F05 | Chưa thử thiết bị thật | Input 16px, scroll-margin còn nguyên; chưa thử bàn phím ảo thật.                 |
| G01 | Chưa đo                | Chưa thống nhất điều kiện LCP; không dùng số ước lượng.                          |
| G02 | Chưa đo                | Chưa có dữ liệu INP đủ tin cậy.                                                  |
| G03 | Chưa đo                | Chưa đo CLS trong điều kiện nghiệm thu thống nhất.                               |
| G04 | Chưa đo                | Chưa profiling heap/thử lặp dài; không kết luận không rò bộ nhớ.                 |
| G05 | Đạt trong Chromium     | E2E không có pageerror/console.error trong hành trình chính.                     |
| G06 | Chưa thử thiết bị thật | Chạy Chromium được; chưa kết luận cho thiết bị thật.                             |
| H01 | Đạt trong Chromium     | 31 unit/component và 10 E2E đạt, giữ luồng chính.                                |
| H02 | Đạt trong phạm vi sửa  | Không thay frontend/src/lib/bank.js, Transfer.jsx hoặc Deposit.jsx.              |
| H03 | Đạt trong Chromium     | Không thêm bước vào chuyển tiền, QR hay lịch sử.                                 |
| H04 | Đạt trong Chromium     | Banner, Sandbox và nhãn bản xem trước hiện rõ.                                   |
| H05 | Đã rà phạm vi sửa      | Không thêm secret/API key, PIN 123456 công khai chỉ là demo.                     |
| H06 | Đạt trong Chromium     | Giữ QR NHTBANK_SANDBOX tạo cục bộ và cảnh báo trong ảnh gốc.                     |

Chưa nghiệm thu chính thức: các P0 cần thiết bị thật, rà tương phản toàn diện và profiling bộ nhớ vẫn chưa xác minh. Bản HTML là web độc lập, không phải gói cài Android/Windows; website production không được coi đã cập nhật chỉ vì sửa mã nguồn.

### Kiểm tra bổ sung và bản HTML bàn giao

- Kiểm tra năm màn chính, sáu hộp thoại tiện ích, Escape/focus, ẩn/hiện số dư, kích thước nút và tràn ngang ở 360×800, 412×915, 768×1024, 1366×768, 1920×1080; kiểm tra thêm chế độ Android ép một cột khi viewport 1440×1000. Các vòng kiểm tra giao diện này đạt; ảnh tại `docs/screenshots/v11-android.png`, `v11-tablet.png`, `v11-windows.png`.
- Phát hiện liên kết Máy tính ở màn đăng nhập Android xem từ desktop bị thông báo mô phỏng chặn vùng bấm. Đã đưa thông báo về luồng bố cục bình thường; kiểm tra lại đổi bố cục hai chiều bằng thao tác click đạt. Chạy lại riêng E2E đăng nhập bàn phím desktop/mobile sau sửa: 2/2 đạt.
- Hai HTML trong `exports/` xuất từ cùng production bundle đã build thành công. Kiểm tra chính các HTML qua HTTP cục bộ: đăng nhập, dialog và khôi phục focus, chuyển 100.000 VNĐ demo, số dư còn 3.956.000, QR hợp lệ và lỗi số tiền 0; không có lỗi JavaScript và không có request nào ngoài request mở chính HTML (font/JS/CSS nhúng sẵn). Chính sách Chromium của môi trường chặn điều hướng `file://`, nên chưa xác minh trực tiếp thao tác mở tệp từ trình quản lý tệp trên Android/Windows thật.
- `git diff --check` và kiểm tra Prettier cho các tệp đã chỉnh đều đạt. Mã mẫu gốc được giữ nguyên, không đưa vào phạm vi định dạng lại hoặc thực thi hướng dẫn.

# Điều tra bổ sung PR #19 — 30/10/2026

Xem [báo cáo nút bấm](button-investigation-2026-10-30.md). Nguồn kiểm tra: head `87c32ac44eef3e5084f4aac60d69ca44234f85a1`; commit bổ sung được nhận diện bằng lịch sử PR #19. Bổ sung project Pixel 7 và bằng chứng tải script/CSS; giữ dữ liệu và ứng dụng hiện có. Chưa tái hiện lỗi người dùng trên thiết bị thật, chưa xác định nguyên nhân gốc, chưa nghiệm thu P0 và không kết luận đã sửa xong. Đối chiếu đủ 45 mã trong báo cáo; không thay trạng thái các phép đo chưa thực hiện.

