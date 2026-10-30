# PR #19 — điều tra nút bấm, ngày 30/10/2026

## Kết luận

Chưa tái hiện phản ánh mọi nút không hoạt động trên GitHub Pages; chưa xác định nguyên nhân gốc trên thiết bị báo lỗi. Không có bằng chứng để sửa handler, thêm touch handler trùng click, đổi z-index hoặc thay đổi nghiệp vụ. PR giữ draft, không được ghi là đã khắc phục hay nghiệm thu chính thức.

## Nguồn và phiên bản

- PR: https://github.com/tuong26121-cell/Ngan_hang_NhTBank/pull/19
- Head đã đọc: 87c32ac44eef3e5084f4aac60d69ca44234f85a1; base: 4689d54ce72ba8a8f3c3336021b230d8ab900de5.
- CI: https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/40995212414
- Job log: https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/40995212414/job/123866634569
- CI chạy synthetic merge 71dc446983d42635b39edb9c0b4f137bfa03d629: 31 unit/component PASS; Pages-path production build PASS; 14 E2E PASS, 4 SKIP. SKIP là 4 chiều rộng chỉ chạy ở project desktop, không phải lỗi.
- Review submissions và review threads đều trống tại lúc kiểm tra.
- Run “Deploy NhTBank to GitHub Pages” trên PR chỉ build; job deploy bị điều kiện pull_request loại bỏ. Không coi tên workflow là bằng chứng đã deploy PR.

## Khoanh vùng có bằng chứng

| Nhóm                   | Quan sát                                                                                                                              | Kết luận                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Handler và hit testing | E2E hiện có click/tap hai query view; local chạy lại cùng kết quả CI                                                                  | Không thấy lỗi chung của mọi nút trong môi trường này                                             |
| Android thực tế        | Project mobile cũ dùng iPhone 13 + Chromium                                                                                           | Thiếu cấu hình Android; bổ sung Pixel 7, vẫn chỉ là mô phỏng                                      |
| Bản Pages trực tuyến   | Browser Chrome mở được cả hai URL; Android: PIN 123456, Chuyển tiền, QR hoạt động; Windows: PIN và Lịch sử hoạt động                  | Smoke PASS cho các nút nêu trên; không đại diện mọi nút hay thiết bị thật                         |
| Phiên bản đang phục vụ | DOM Pages Android trỏ /Ngan_hang_NhTBank/assets/index-DzaeH_7N.js; build nguồn head cũng sinh index-DzaeH_7N.js                       | Tên bundle khớp, không phải xác minh hash nội dung tải về                                         |
| Chức năng giới thiệu   | Dashboard: Cửa hàng, Thẻ điện tử, Bảo vệ thẻ, Ưu đãi, Vé dịch vụ, Quà tặng mở dialog; Tiền gửi/Vay nhanh là ProductPage bản xem trước | Đây là giới hạn chức năng được ghi trong mã, không chứng minh nguyên nhân phản ánh “mọi nút hỏng” |

Người dùng xác nhận bề mặt lỗi là link GitHub Pages. Giả thuyết cache cũ, trình duyệt trong ứng dụng, JavaScript bị chặn hoặc asset tải lỗi chưa có bằng chứng trên thiết bị báo lỗi; không gán làm nguyên nhân đã chứng minh.

## Thay đổi trong lần điều tra này

- Thêm project Android Pixel 7; giữ desktop và iPhone Chromium hiện có.
- Test nút chọn tap dựa trên hasTouch, không phụ thuộc tên project.
- Test hỗ trợ vào Cá nhân trên mọi project isMobile để tránh locator trùng hai nút trên desktop.
- Xác nhận data-display đúng android/windows.
- Ghi nhận script/stylesheet tải thất bại hoặc HTTP >= 400, ngoài pageerror.
- Đính kèm URL, UA, viewport, maxTouchPoints và script URLs vào kết quả từng test nút; xuất HTML report để CI upload.
- Không thay đổi frontend, bank.js, dữ liệu mẫu, backend, QR payload hoặc triển khai.

## Cách kiểm thử

Kết quả local sau cập nhật: **31 unit/component PASS; production build Pages-path PASS; 19 E2E PASS, 8 SKIP; format các tệp test/config/báo cáo đã sửa PASS**. 8 SKIP là 4 chiều rộng được chạy duy nhất ở desktop, bỏ bản lặp ở iPhone và Pixel 7. CI trên commit cập nhật cần kiểm tra riêng sau push. Không có bản sửa frontend trong lần này.

```sh
npm ci
npm test
npm run build -- --base /Ngan_hang_NhTBank/
npx playwright install --with-deps chromium
npm run preview -- --port 4173 --strictPort --base /Ngan_hang_NhTBank/
# Trong terminal thứ hai:
NHT_TEST_URL=http://127.0.0.1:4173/Ngan_hang_NhTBank/ npm run test:e2e
```

Chạy kiểm tra riêng nút ở bản Pages (test này không chuyển tiền, tạo QR thanh toán hay lưu giao dịch):

```sh
NHT_TEST_URL=https://tuong26121-cell.github.io/Ngan_hang_NhTBank/ npm run test:e2e -- e2e/buttons.spec.js
```

Local runtime: Node 24.22.1, Linux. Chromium qua gói @sparticuz/chromium dùng tạm với NHT_CHROMIUM_PATH; không thêm dependency này vào package.json/lock. Bộ cài browser Playwright chuẩn tại local gặp archive tải về không hợp lệ; lần E2E đầu tiên gặp connection refused do preview khác phiên tiến trình, sau đó chạy preview và tests trong cùng phiên. Hai lỗi môi trường này không phải lỗi ứng dụng. CI tiếp tục dùng browser Playwright chuẩn. Chưa chạy trên Android/Windows thật.

## Điều kiện đạt và thứ tự xử lý

| Mức                    | Điều kiện                                                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0 – xác định đúng lỗi | Ghi được nút cụ thể, URL cuối, trình duyệt/phiên bản và các bước từ reload trên thiết bị bị lỗi; trace/log cho biết request asset thất bại, lỗi JS hoặc phần tử che chạm nếu có. Hiện NOT VERIFIED |
| P0 – sửa nguyên nhân   | Có test FAIL trên phiên bản lỗi và PASS với bản sửa tối thiểu; không thêm cả onTouch và onClick gây kích hoạt hai lần. Hiện NOT RUN vì chưa tái hiện                                               |
| P0 – hồi quy           | Unit/build Pages-path và E2E desktop + Android mô phỏng PASS; mỗi bố cục có click và tap; điều hướng, dialog, PIN sai/đúng, validation, chuyển demo, QR, logout/reset không lỗi JS                 |
| P0 – thiết bị          | Xác nhận lại chính nút báo lỗi trên Android thật và Chrome/Edge Windows thật, đúng bản triển khai; không nhầm mô phỏng viewport với thiết bị. Hiện NOT RUN                                         |
| P0 – an toàn phạm vi   | Không đổi giao dịch thật; dữ liệu demo/QR giữ nguyên; chỉ dữ liệu trong bộ nhớ của browser test được tạo/đặt lại                                                                                   |
| P1                     | CI mới PASS trên head cập nhật; review độc lập; kiểm tra các nút khác và trình duyệt trong ứng dụng nếu có                                                                                         |
| P1                     | Sau merge/deploy được cho phép, xác minh bundle và lặp test trên hai URL Pages; không suy ra deploy từ PR build                                                                                    |
| P2                     | Đo độ trễ tương tác và chuyển động trên thiết bị thật nếu còn cảm giác bấm chậm                                                                                                                    |

Đối chiếu toàn bộ 45 mã A01–A05, B01–B06, C01–C06, D01–D06, E01–E05, F01–F05, G01–G06, H01–H06 theo docs/ui-standard.md: lần này tăng bằng chứng cho B03, C02/C05, E01–E03, G05, H01/H02/H04/H06 trong phạm vi các kịch bản chạy. F01/F02/F05, E05 và các phép đo chưa chạy vẫn chưa xác minh. Các mã còn lại giữ trạng thái nghiệm thu hiện có, không tự nâng lên PASS.
