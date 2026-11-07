# Đối chiếu giao diện NhTBank · cập nhật 29/10/2026

Bản cập nhật mới nhất tích hợp giao diện NhTBank 1.1; xem mục ngày 29/10/2026 phía dưới. Đây là bản cải tiến theo chuẩn người dùng cung cấp, chưa phải nghiệm thu chính thức. Chuẩn trung tâm: [tieu-chuan-giao-dien.md](tieu-chuan-giao-dien.md). Đủ 45 mã (32 P0, 12 P1, 1 P2), khác số cộng 43/30 trong bảng tổng hợp Word gốc.

## Phiên bản và phạm vi

- Website trước sửa: Site commit `3c0ff8a5315e03df47925684fe57a04cae97b6b2`, khớp mã nguồn ứng dụng bảo mật ở GitHub `e5c0891` (PR #3).
- Bản sửa: commit chứa báo cáo này, xác định đầy đủ bằng `git log -1 --format=%H -- docs/nghiem-thu-giao-dien.md`; PR và phiên bản Sites gắn commit riêng cho từng kho.
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

- Nền trước sửa: `6131260c0ea3c0c4dcbd73b3a7eff233aabb6c16`; nhánh tính năng `codex/nhtbank-v11-interface`. Commit bản bàn giao là commit chứa mục này, lấy bằng `git log -1 --format=%H -- docs/nghiem-thu-giao-dien.md`.
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

Xem [báo cáo nút bấm](dieu-tra-loi-nut-bam-2026-10-30.md). Nguồn kiểm tra: head `87c32ac44eef3e5084f4aac60d69ca44234f85a1`; commit bổ sung được nhận diện bằng lịch sử PR #19. Bổ sung project Pixel 7 và bằng chứng tải script/CSS; giữ dữ liệu và ứng dụng hiện có. Chưa tái hiện lỗi người dùng trên thiết bị thật, chưa xác định nguyên nhân gốc, chưa nghiệm thu P0 và không kết luận đã sửa xong. Đối chiếu đủ 45 mã trong báo cáo; không thay trạng thái các phép đo chưa thực hiện.

## PR #19 — sửa thao tác chuyển giao diện (30/10/2026)

- **Phát hiện từ mã nguồn:** `DisplaySwitcher` trước bản sửa dùng `<a href="?view=...">`, tạo điều hướng toàn trang. NhTBank giữ `authenticated`, số dư mô phỏng, lịch sử phát sinh trong React `useState`; tải lại làm mất toàn bộ phiên. Đường chuyển chế độ chỉ thay đổi CSS `html[data-display]`, không đòi hỏi reload.
- **Sửa trong mã ứng dụng:** `frontend/src/components/ReferenceArt.jsx`, dùng `history.pushState` kết hợp cập nhật `document.documentElement.dataset.display` và `useState`; lắng nghe `popstate` để điều hướng Back đồng bộ. Giữ hành vi mở tab mới khi bấm phím bổ trợ.
- **Kiểm thử hồi quy:** `e2e/buttons.spec.js` thêm hai trường hợp từ Android/Windows, trên cả dự án mobile (tap) và desktop (click): nhập PIN demo, chuyển bố cục, xác nhận không quay về PIN, URL và CSS đúng, nút vẫn hoạt động, back vẫn duy trì phiên, không có `pageerror`. **Test này sẽ thất bại trước sửa** vì điều hướng đầy đủ khiến React reset phiên.
- **Bằng chứng trước sửa:** run `40995212414` có 31 unit tests đạt và 14 E2E đạt/4 skipped; run Pages `40995212753` build và upload thành công nhưng deploy job bị **skipped**. Bài thử trình duyệt bên ngoài thấy URL Pages truy cập được và điều hướng Android hoạt động; một lần thử Windows nhập PIN không thành công do công cụ click nhầm nút, không đủ chứng minh lỗi ở ứng dụng Windows. Chưa có bằng chứng về lớp phủ chặn thao tác trong các nút khác.
- **Trạng thái:** đã sửa mã và bổ sung E2E tại commit `73ea0420a551928e4e193dbb31c9bc36e9cc289c`; **chưa xác nhận** unit/build/E2E sau commit và chưa nghiệm thu P0 trên thiết bị Android/Windows thật. Chờ kết quả CI mới, không tự đánh dấu đạt.
- Không thay đổi luồng giao dịch hoặc số dư demo.

## Bổ sung NhTBank QR Studio · 30/10/2026 (nhánh tính năng)

- Tách riêng ô tạo VietQR qua dịch vụ bên ngoài khỏi QR Sandbox. Không chỉnh sửa dòng tiền và số dư demo.
- Các tiêu chí UI liên quan: C01 (các nút tạo/copy/tải), C02 (focus), C05 (feedback), A01 (khả dụng trên Android/Windows), B (bố cục), E (riêng tư). **Chưa nghiệm thu thiết bị thật**.
- Bổ sung kiểm thử Vitest và E2E với phản hồi ảnh bên ngoài được giả lập, tránh phụ thuộc mạng. Kết quả CI sẽ được ghi nhận ở PR; chưa nhận định đạt khi chưa có bằng chứng.
- Tài liệu chi tiết: [thiet-ke-vietqr.md](thiet-ke-vietqr.md). Không ảnh hưởng đến 45 tiêu chí nghiệm thu hiện hành của mô phỏng cho tới khi PR được kiểm tra và gộp.

## Bổ sung quét mã QR và thẻ biên nhận v2 · 30/10/2026

- Nút QR nổi giữa thanh điều hướng (Android)/QR trong sidebar (Windows) chuyển đến màn quét camera; đường dẫn tạo QR qua Nạp tiền trên dashboard hoặc nút ở màn quét.
- Thẻ nhận tiền của NhTBank có bố cục riêng: header gradient, thẻ biên nhận, trường người nhận và các nút hành động. Ảnh VietQR nguyên bản không bị phủ logo hay thay ma trận QR.
- Bổ sung kiểm thử unit parser TLV/CRC và Playwright ảnh QR tải lên trên hai bố cục; chạy CI PR để lưu bằng chứng, **chưa xác nhận camera thiết bị thật, deep-link native, hay giao dịch thật**.
- A01/A03/B01/C01/C02/C05: cần rà thao tác máy thật, focus, tương phản, kích thước nút và thanh điều hướng; chưa đánh dấu nghiệm thu P0 khi chưa có bằng chứng trực tiếp.
- Không thay đổi giao dịch Sandbox, không dùng PIN demo để truy cập ngân hàng và không mở API giao dịch thật.

## Bổ sung 30/10/2026 — Logo NT, 20 biểu tượng màu và màn xác thực một trang

- Nguồn icon: hai ảnh chủ ứng dụng gửi trực tiếp. Logo **NT** riêng từ ảnh nền xanh lam/vàng; bỏ logo **V xanh lá** trong mockup. Bộ 20 biểu tượng chức năng được cắt giữ tỷ lệ và gom vào atlas WebP 5×4, ánh xạ trong `ReferenceArt.jsx`.
- Mở ứng dụng có logo NT trong 0,5 giây (giảm chuyển động vẫn hiện tĩnh) rồi chuyển sang màn login độc lập cố định theo viewport.
- Đăng nhập: tên + mật khẩu, đăng ký tài khoản demo, lưu tên đăng nhập, khôi phục bằng mã dự phòng, đổi mật khẩu trong trang Cài đặt. Không lưu mật khẩu rõ vào localStorage. Không có backend xác thực.
- A04/A05/C03 (logo và icon), B01/B05 (bố cục), C01/C02/C05 (nút, phản hồi), D và E (thông báo bảo mật/riêng tư) phải được rà soát trên thiết bị thật. **Không tự đánh dấu đạt toàn bộ 45 tiêu chí.**
- Tài nguyên ảnh đính kèm đi theo `import.meta.env.BASE_URL` để tương thích đường dẫn GitHub Pages khi build production. Cần kiểm tra riêng khi xuất HTML standalone.
- Bằng chứng E2E/CI và ảnh nghiệm thu chỉ được đánh dấu đạt sau khi GitHub Actions trên commit cuối thành công. Camera thật, bàn phím ảo, các thiết bị nhỏ vẫn chưa được kiểm tra trực tiếp.

## Logo launcher va nhan phien ban — 03/11/2026

- Nhanh `cap-nhat/logo-va-phien-ban-apk`, nen `1e8732525ef041a39b25c036836951ca93cde339`.
- Dung anh NT chu ung dung gui; chi cat le trang, giu ty le va tao cac kich thuoc Android. Legacy icon va adaptive icon (vung an toan trung tam), cung logo trong giao dien.
- Phien ban 1.0.1; versionCode Android va nhan ban dung trong giao dien cung lay tu `scripts/thong-tin-phien-ban.mjs`. Chua cai APK tren dien thoai that.
- Local: 70/70 unit tests dat; build web dat (canh bao bundle >500 kB co san); bai kiem thu cau hinh Android dat. E2E local bi chan vi tai Chromium nhan ZIP loi; khong coi la E2E dat. Workflow APK se chay lai E2E tren runner GitHub va kiem tra version thuc trong APK bang aapt.
- Doi chieu 45 ma A01–H06: A04/A05/B01/B05/F03 bi anh huong truc tiep, can doi chieu anh va E2E; chua nghiem thu may that. A01–A03, B02–B04/B06, C01–C06, D01–D06, E01–E05, F01/F02/F04/F05, G01–G06, H01–H06 giu pham vi hien co, khong nang trang thai nghiem thu chi dua vao thay logo.
- Chua ket luan dat toan bo 45 tieu chi, camera, ban phim ao hoac chi so hieu nang. Khong sua luong giao dich, khong deploy website, khong Release.

- Run GitHub `41499928650` (commit `7acc6836fb7a411dcd046d4c2fa4e293c3f18cc2`): unit dat, build web dat, E2E 43 dat / 8 skipped; loi npm 10.9.9 `Cannot read properties of null (reading edgesOut)` khi cai bo sung Capacitor sau npm ci. Chuyen Capacitor thanh devDependencies co phien ban co dinh va lockfile de chi cai bang npm ci; can run moi xac nhan APK.

## Kiểm chứng Đợt2B — 06/11/2026

Không thay CSS/component trong lượt này. WorkflowAPK được sửa để E2E dùng productionrootdist thaydevserver.43ca đạt,8ca viewport desktop bỏ qua trong2mobileprojects (51tổng); indexHTTPkhớpdist và asset khôngđổi tronglầnchạy. [Log](dieu-phoi/bang-chung-tiep-quan-20261106/production-e2e.log). Đây là Chromiumemulation trênLinux, không chấm45tiêu chí hoặc máy thật đãnghiệmthu. P0máy thật/safearea/keyboard/contrasttoàndiện vẫn còn mở.

## Đợt 2B — Nhóm 03, UX-01 — 06/11/2026

Nguồn main trước sửa `7192af6`; commit thực thi xác định bằng `git log -1 --format=%H -- frontend/src/he-thiet-ke.css`. Đặc tả bàn giao: [he-thiet-ke.md](he-thiet-ke.md). Bộ bằng chứng: [dot-2b](bang-chung/dot-2b/). Baseline 4/4 viewport đạt; ảnh trước/sau 390 px. Không sửa backend/lib, dữ liệu, nhãn Sandbox hoặc luồng giao dịch.

Các trạng thái dưới đây chỉ áp dụng phạm vi Chromium Linux và source đã kiểm tra; **UX-01 CHƯA NGHIỆM THU TOÀN BỘ**. P0 thiết bị thật và bộ nhớ còn cần xác minh. Tài liệu Đợt 1/PRD/API vẫn là bản nháp; không chốt tích hợp cho nhóm 04/05/11.

| Mã  | Kết quả rà soát Đợt 2B / bằng chứng                                                      |
| --- | ---------------------------------------------------------------------------------------- |
| A01 | Nền sáng, navy/cyan; tokens và ảnh sau sửa                                               |
| A02 | Gradient navy/cyan, ảnh Chromium; chưa kiểm tra phân tầng trên máy thật                  |
| A03 | Test tỷ lệ 5 cặp token chữ; chưa audit toàn bộ pixel minh họa/glass trên thiết bị        |
| A04 | Logo giữ tỷ lệ qua object-fit; ảnh 390 px                                                |
| A05 | Nguồn token cuối cascade, Be Vietnam Pro nội bộ; CSS chuyên biệt cũ còn giữ cho minh họa |
| B01 | Header logo, avatar, thông báo hiện hữu; ảnh và E2E                                      |
| B02 | Số dư/tài khoản mô phỏng không đổi; E2E                                                  |
| B03 | Ẩn/hiện giữ giá trị; acceptance và test bàn phím                                         |
| B04 | Chức năng chính giữ nguyên, E2E navigation                                               |
| B05 | DOM overflow/vùng chạm kiểm tra ở 4 chiều rộng                                           |
| B06 | Thang spacing 4/8/12/16/24/32; card hiện có và ảnh                                       |
| C01 | Button ≥44 px; thêm test auth 320×480, 4 viewport màn chính                              |
| C02 | Hover/active/focus theo contract; E2E nút                                                |
| C03 | Giữ SVG/Lucide và icon 3D nguồn; không thay ý nghĩa                                      |
| C04 | Token bo góc control/card/pill; minh họa có bo riêng                                     |
| C05 | Hồi quy luồng mô phỏng E2E; không thay cơ chế chống nhấn lặp                             |
| C06 | Native disabled giữ nguyên; style disabled rõ; test flows hiện có                        |
| D01 | Bóng và highlight nhẹ, ảnh đối chiếu                                                     |
| D02 | Glass trắng 94%, fallback nền; ảnh Chromium                                              |
| D03 | Chưa đo frame pacing trên thiết bị thật                                                  |
| D04 | Active 1 px, duration 160 ms; reduced-motion không dịch                                  |
| D05 | Test computed transition=0s; MotionConfig/useReducedMotion giữ nguyên                    |
| D06 | E2E tương tác/QR/điều hướng; chưa kiểm tra GPU yếu                                       |
| E01 | 5 mục giữ nguyên, acceptance kiểm tra tên                                                |
| E02 | Acceptance mở từng màn đúng heading                                                      |
| E03 | aria-current và selected có nền/viền                                                     |
| E04 | Thanh cố định giữ nguyên; cuộn nội dung, cần xác minh máy thật                           |
| E05 | Giữ env safe-area; chưa nghiệm thu thanh hệ thống Android/iOS thật                       |
| F01 | Chromium giả lập Pixel 7; Android thật chưa kiểm tra                                     |
| F02 | Viewport iPhone dùng Chromium; Safari iOS chưa kiểm tra                                  |
| F03 | 320/360/390/430 px có assertions overflow và target                                      |
| F04 | Đổi viewport ngang 844×width trong acceptance; cảm biến thật chưa kiểm tra               |
| F05 | Auth được cuộn trên 320×480; bàn phím ảo thật chưa kiểm tra                              |
| G01 | LCP chưa đo theo cấu hình nghiệm thu thống nhất                                          |
| G02 | INP chưa đo                                                                              |
| G03 | CLS chưa đo                                                                              |
| G04 | Chưa profile heap/lặp dài; không đánh dấu đạt                                            |
| G05 | Các hành trình hiện có bắt pageerror; kết quả chi tiết tại e2e.log                       |
| G06 | Chưa đo trên thiết bị GPU yếu                                                            |
| H01 | Bộ hồi quy unit/E2E; xem log kết quả cuối                                                |
| H02 | Diff không đổi lib/backend hoặc dữ liệu mô phỏng                                         |
| H03 | Không thêm bước nghiệp vụ; E2E hành trình hiện hữu                                       |
| H04 | Sandbox, banner và cảnh báo QR giữ nguyên, ảnh/test                                      |
| H05 | Không thêm secret/dependency/network integration; diff review                            |
| H06 | Giữ QR cục bộ và chuyển tiền demo; E2E QR/luồng Sandbox                                  |

Không coi build hoặc token contrast là bằng chứng toàn bộ 45 tiêu chí đạt. Nhóm 13 tiếp nhận ma trận này để xác minh các mục còn thiếu trước đóng gate.

### Kết quả chạy cuối và bàn giao

Chốt báo cáo ngày 07/11/2026 (Asia/Saigon); các log của phiên chạy ghi ngày máy UTC 06/11.

- Unit: **70/70 đạt**, 7 tệp test; `bang-chung/dot-2b/unit.log`.
- Build production: **đạt**, cảnh báo bundle JS >500 kB; `build.log`.
- E2E toàn bộ hiện có: **42 đạt, 1 timeout, 8 bỏ qua có chủ đích** (viewport đã chạy ở desktop); `e2e.log`. Ca hành trình Android timeout 60 giây, chụp ở màn Lịch sử; giữ bằng chứng `android-timeout.md`. Chạy riêng lại **1/1 đạt trong 33,4 giây**, giữ nguyên timeout và assertions; `android-chay-lai.log`. Chưa kết luận chắc chắn nguyên nhân timeout, không gọi lần chạy toàn bộ là PASS.
- Kiểm tra UI cuối: **5/5 đạt**, gồm 320/360/390/430 px, form 320×480, keyboard/focus, token contrast và reduced-motion; `ui-cuoi.log`.
- Năm cặp token chữ đạt ngưỡng 4,5:1; số đo tại `tuong-phan.md`. Không đại diện audit mọi màu hiển thị.
- Ảnh trước/sau và cả bốn viewport cuối được lưu trong `bang-chung/dot-2b/`. Kiểm tra trực quan ảnh 390 px đã sửa nhãn phiên bản trắng trên header navy; thẻ tài khoản navy/cyan, nhãn Sandbox giữ nguyên.
- Prettier các tệp code mới và `git diff --check` đạt. Không đổi `frontend/src/lib`, backend, package hoặc lockfile.

**UX-01: IMPLEMENTED / PARTIALLY VERIFIED, chưa PASS nghiệm thu toàn bộ.** Artifact bàn giao Nhóm 04/05/11/13 AVAILABLE; ACK PENDING. Còn thiết bị thật, bàn phím ảo, Safari, hiệu năng, heap và kiểm chứng lại độ ổn định ca Android. Main commit dùng nhãn `[khong-trien-khai-web]` để các workflow kiểm tra có thể chạy mà không tự xuất bản Pages trong đợt bàn giao này.

## Hậu kiểm chủ động UX-01 — 07/11/2026

Xem [báo cáo và bằng chứng](bang-chung/hau-kiem-ux-20261107/README.md). CI đúng SHA1894c45: Verify/Pages workflow/APK success; Pages deploy skipped. Đã chạy21 audit axe ở320/390/1440px; sửa3 nhãn ARIA generic bằng output/group, sửa tương phản chữ hero QR≈3,42:1 bằng gradient navy/primary. Sau sửa0 violation tự động; contrast glass/gradient vẫn cần review thủ công, không coi toàn bộ A03 đạt.

Bàn phím/focus/Escape/reduced-motion:4/4 đạt. Android production chạy lặp5/5,44–52s, giữ timeout/assertions; chưa tái hiện timeout, chưa chứng minh nguyên nhân gốc. LCP372–508ms, CLS0,020–0,084, INP64–104ms (15 tương tác/viewport, lượt lab riêng); giữ phép đo trước INP424ms khi có tải đồng thời. Heap sau GC tăng0,156MiB từ chu kỳ10→40 (1,43%); chưa thấy tăng lớn trong thử ngắn, chưa xác nhận không leak dài hạn. Unit70/70 và build đạt.

Cập nhật bằng chứng A03/C03/D05/G01/G02/G03/G04/G05/H01 trong phạm vi lab; **UX-01 vẫn PARTIALLY VERIFIED**, chưa nghiệm thu toàn bộ45 tiêu chí. Thiết bị thật, keyboard ảo, Safari, safe-area, screen reader, field performance, contrast đầy đủ và ACK bên nhận còn chờ. Patch không đổi nghiệp vụ; commit dùng `[khong-trien-khai-web]`.

Đối chiếu pixel cuối:303 dòng mẫu ở390px,0 cờ sau cuộn tránh overlay; ghi chú camera11,37:1, chữ giới thiệu QR sau sửa10,18:1. Giữ dữ liệu trước/sau cuộn. Hồi quy responsive320/360/390/430 và scanner cuối5/5 đạt. Không thay phạm vi giới hạn nghiệm thu nêu trên.

## Đợt 2B — Website / Issue #35 — 06/11/2026

### Nguồn, phạm vi và trạng thái API

- Source nền: `7192af6`, đã đồng bộ `main` đến `6cce289` và đọc cập nhật contract/design/PRD; commit bàn giao: `git log -1 --format=%H -- frontend/src/App.jsx`. Các bằng chứng cũ phía trên là lịch sử, không thay cho kết quả đợt này.
- Đã đọc trực tiếp source Website, `docs/dieu-phoi/dot-1/03-he-thiet-ke.md` (blob `a5c474b455744c5eeaf510721617d8d03fecc8bb`), `02-kien-truc-api-v1.md` (`3cc803fef8bdae87d58aeb5fb16d6538fd9a96a3`), `06-bao-mat-rbac.md` (`bf6fb79de729d5d7efb6204dfb8b32fb18bd84f9`), PRD Nhóm 10 và `tieu-chuan-giao-dien.md`.
- Các endpoint `/v1/me`, accounts, transactions, transfers vẫn **PROPOSED**; chưa có contract field-level, Auth server và ledger backend được nghiệm thu. Không tích hợp API, gateway SePay hay dữ liệu thật. ARCH-01/SEC-01/TX-01/DB-01 không được nâng PASS.
- Giữ token hiện hữu theo mapping Nhóm 03; không dùng bảng màu nháp để thay nhận diện. Không thêm dependency hoặc provider.

### Màn hình và thay đổi

| Màn                              | Kết quả trong phạm vi demo Website                                                                                                                                                                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trang chủ / dashboard / số dư    | Giữ dashboard, ẩn/hiện số dư và lối tắt; sửa “tháng này” thành “trong phiên” vì tổng bao gồm dữ liệu mẫu tháng 10 và giao dịch mới.                                                                                                                                        |
| Đăng nhập / đăng ký / khôi phục  | Giữ auth cục bộ, thông báo lỗi/đang xử lý và fallback storage; không cho đổi chế độ khi đang gửi; input 16px/44px, cho cuộn ở màn thấp; cảnh báo không dùng mật khẩu thật luôn hiển thị.                                                                                   |
| Chuyển khoản sandbox / biên nhận | Giữ kiểm tra số tiền VNĐ nguyên, số dư, PIN demo và khóa gửi trùng; số dư/lịch sử cập nhật cùng phiên. Không coi chống double-click là idempotency backend.                                                                                                                |
| Lịch sử                          | Lọc tiền vào/ra, tìm kiếm và ngày bao gồm hai đầu theo giờ Việt Nam; báo khoảng ngày đảo; đếm kết quả với live region, empty state và xóa bộ lọc. Bộ lọc được xóa khi đăng xuất. Tất cả giao dịch của mô hình hiện tại đều hoàn tất mô phỏng, không giả trạng thái server. |
| Hồ sơ / bảo mật                  | Hiển thị username đăng nhập demo riêng với chủ tài khoản mẫu dùng chung; PIN chỉ xác nhận giao dịch demo. Sửa hướng dẫn hỗ trợ cũ nhầm PIN là đăng nhập.                                                                                                                   |
| Tiết kiệm / vay                  | Màn **BẢN XEM TRƯỚC · DEMO**, có đường về tổng quan; chưa mở sổ, tính lãi, nhận tiền hoặc nhận hồ sơ vay theo PRD hiện hành.                                                                                                                                               |
| Nạp demo / quét QR / tiện ích    | Giữ luồng hiện có; cảnh báo sandbox và permission/error states. Không kích hoạt dịch vụ thanh toán.                                                                                                                                                                        |
| Bàn phím                         | Skip link đến main; chuyển màn đưa focus đến h1 mới. Giữ dialog/Escape và reduced motion.                                                                                                                                                                                  |

Không tạo trạng thái “đang gọi API”/“hết phiên server” giả cho dữ liệu bộ nhớ đồng bộ. Lỗi API và expired-session thật còn chờ contract; không có phiên server để mô phỏng như đang vận hành.

### Kiểm chứng đợt này

Kết quả local cuối ngày 07/11/2026 (Asia/Saigon), source đồng bộ `6cce289` + bản sửa Website:

- `npm test`: **70/70 đạt**, [log](bang-chung/website-dot-2b/unit.txt).
- `npm run test:backend`: **25/25 đạt**, gồm bộ kiểm thử nền tảng mới trên main, [log](bang-chung/website-dot-2b/backend.txt).
- `npm run build -- --base /Ngan_hang_NhTBank/`: **đạt**, [log](bang-chung/website-dot-2b/build.txt). Cảnh báo bundle JS 514 kB còn tồn tại; chưa coi đây là đo hiệu suất.
- `NHT_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`: **49 đạt, 8 bỏ qua, 0 lỗi**, [log](bang-chung/website-dot-2b/e2e.txt). 8 ca viewport được bỏ qua có chủ đích trên mobile/android vì đã chạy đủ 4 chiều rộng trên desktop. 6 ca Website mới đều đạt trên ba cấu hình.
- `npm run lint`: **không chạy được — thiếu script**, [log](bang-chung/website-dot-2b/lint.txt). Không bổ sung linter/dependency ngoài phạm vi. Prettier các tệp sửa và `git diff --check` đạt; [log định dạng](bang-chung/website-dot-2b/dinh-dang.txt).
- Đã xem ảnh [trang chủ 320px](bang-chung/website-dot-2b/trang-chu-320.png) và [tiết kiệm desktop](bang-chung/website-dot-2b/tiet-kiem-desktop.png). Thanh điều hướng cố định trong ảnh toàn trang ở vị trí viewport gốc; nội dung cuộn được.
- Review độc lập không còn blocker; fixture request test đã sửa trước run cuối. Bằng chứng Actions được bổ sung tại Issue #35 sau push, không suy từ local thành CI PASS.

Môi trường: Linux, Node 24.19.0, Chromium 154.0.8037.57; mobile/iPhone 13/Pixel 7 trong Playwright là cấu hình giả lập, không phải thiết bị thật. Không có ESLint/lint script trong repo; kiểm tra Prettier tệp thay đổi và `git diff --check` được ghi riêng, không gọi đó là lint ngữ nghĩa.

### Đối chiếu 45 mã của Đợt 2B

| Mã                  | Bằng chứng / giới hạn của đợt này                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| A01,A02,A04,A05     | Giữ hệ màu/logo và shared controls; không thay token nền.                                                   |
| A03                 | Chưa rà tương phản toàn diện; nút auth chuyển nền đặc #0c3699/chữ trắng. Không nghiệm thu toàn bộ contrast. |
| B01,B02,B03,B04     | Giữ header, số dư mẫu và lối tắt; hồi quy hành trình/ẩn hiện số dư.                                         |
| B05,B06             | E2E responsive; spacing cần review thẩm mỹ/thiết bị thật riêng.                                             |
| C01                 | E2E đo vùng chạm các màn chính; auth được đặt input/nút ≥44px.                                              |
| C02,C03,C04,C05,C06 | Shared states/icons; aria-current/pressed; unit gửi trùng và disabled, auth không chuyển mode khi busy.     |
| D01,D02,D04,D06     | Giữ motif/trang trí; không thêm animation/overlay chặn nội dung.                                            |
| D03                 | Chưa đo frame rate.                                                                                         |
| D05                 | Giữ reduced-motion; E2E bật reduce.                                                                         |
| E01,E02,E03,E04     | Giữ năm tab; E2E điều hướng và focus nội dung mới; skip link.                                               |
| E05                 | Safe area có CSS, chưa thử thiết bị thật.                                                                   |
| F01,F02             | Android/iOS thật chưa xác minh; không dùng Chromium giả lập để kết luận.                                    |
| F03,F04             | E2E các viewport 320/360/390/430 và xoay; auth thêm 320×480.                                                |
| F05                 | Font input 16px và cuộn; bàn phím ảo thật và text zoom chưa xác minh.                                       |
| G01,G02,G03,G04     | Chưa đo LCP/INP/CLS/heap dài hạn.                                                                           |
| G05,G06             | Hành trình E2E kiểm lỗi JS; hiệu suất thiết bị thật chưa xác minh.                                          |
| H01,H02,H03         | Hồi quy unit/E2E; giữ dữ liệu mẫu, transfer/QR, thêm bộ lọc không thêm bước chuyển tiền.                    |
| H04,H05,H06         | Nhãn demo/preview rõ, không thêm secret/API; QR và tiền chỉ mô phỏng.                                       |

Chưa nghiệm thu chính thức UX-01: P0 thiết bị thật, rà contrast toàn diện và bộ nhớ dài hạn còn chưa xác minh. Phần nghiệm thu backend nằm ngoài kết quả Website demo này.

### Đồng bộ liên nhóm trước push — 07/11/2026

Push đầu bị từ chối do main tiến đến `d61e714`; đã rebase, giữ nguyên phần nghiệm thu của Nhóm 03 và cập nhật CI của Nhóm 14. Đã đọc `docs/he-thiet-ke.md`, CSS token cuối cascade `he-thiet-ke.css`, contract máy đọc `hop-dong-api-v1.json` (draft.1) và `mo-khoa-auth-20261107.md`. Contract hiện có field-level draft và module JWT/authorization local, nhưng chưa có route v1, trust config development, ledger/confirmation và integration gate. Vì vậy vẫn không nối API. Các nhận định “chưa có field-level contract/Auth” ở phần nguồn trước đó mô tả snapshot 7192af6/6cce289; không thay thế hiện trạng mới này.

CSS auth bổ sung cục bộ được bỏ khi hợp nhất vì Design System Nhóm 03 hiện đã cung cấp cuộn dọc, input 16px/44px, nút 44px và cảnh báo hiển thị. Website dùng CSS token chung được nhập cuối thay vì tạo hệ override song song. Giữ thay đổi busy/state trong AuthGate. Kết quả local của snapshot trước giữ nguyên tính lịch sử; kiểm thử bản hợp nhất được ghi bổ sung dưới đây.

### Kết quả bản hợp nhất cuối trước push

- Nền `0a363c3`: thay đổi sau `d61e714` chỉ bổ sung tài liệu và hai ca backend, không đổi runtime Website. Không ghi đè cập nhật từ nhóm khác.
- **70/70 unit**, **75/75 backend**, **5/5 contract**, **41/41 API fixtures** và **build subpath đạt**. Log tương ứng: [unit](bang-chung/website-dot-2b/unit-hop-nhat.txt), [backend](bang-chung/website-dot-2b/backend-hop-nhat.txt), [contract](bang-chung/website-dot-2b/contract-hop-nhat.txt), [fixtures](bang-chung/website-dot-2b/api-hop-nhat.txt), [build](bang-chung/website-dot-2b/build-hop-nhat.txt).
- **53 E2E đạt, 10 bỏ qua có chủ đích, 0 lỗi**; [log](bang-chung/website-dot-2b/e2e-hop-nhat.txt). 8 ca viewport và 2 ca computed-token trùng được bỏ qua trên cấu hình mobile/android, đã chạy ở desktop. Ca điều hướng nhanh của Nhóm 14 và 6 ca Website mới đều đạt. Các fixtures API là kiểm tra schema, không là gọi API server.
- Prettier tệp thay đổi và `git diff --check` đạt. Lint vẫn thiếu script, không báo PASS.
- Ảnh bản hợp nhất: [trang chủ 320px](bang-chung/website-dot-2b/trang-chu-320-hop-nhat.png), [tiết kiệm desktop](bang-chung/website-dot-2b/tiet-kiem-desktop-hop-nhat.png).
- Theo preflight CI Nhóm 14 trong `docs/dieu-phoi/dot-2b/van-hanh-01.md`, upload artifact/budget chưa được xác minh. Commit dùng `[khong-luu-artifact] [khong-trien-khai-web]`: giữ toàn bộ test/build/checksum, bỏ upload và deploy Pages. Không coi mã trên main là website công khai đã cập nhật. Kết quả workflow đúng SHA được ghi ở Issue #35 sau push; không sửa workflow để che lỗi test.

Giới hạn còn nguyên: API chưa đủ gate tích hợp, tiết kiệm/vay chỉ preview, thiết bị thật/Safari/bàn phím ảo/text zoom và hiệu suất dài hạn chưa nghiệm thu. Giữ Issue #35 mở cho phần phụ thuộc.
