# Chuẩn giao diện NhTBank

Nguồn: tài liệu người dùng cung cấp ngày 26/10/2026, phiên bản 1.0. Đây là chuẩn trung tâm cho mọi thay đổi UI/UX của NhTBank.

> Đối chiếu số lượng: tài liệu gốc ghi tổng 43, P0 là 30; danh sách chi tiết thực tế có 45 mã, gồm 32 P0, 12 P1 và 1 P2. Áp dụng toàn bộ danh sách chi tiết, không loại bỏ mã nào. Tệp Word gốc được giữ nguyên.

BỘ TIÊU CHÍ NGHIỆM THU GIAO DIỆN NHTBANK

Phiên bản: 1.0

Ngày lập: 26/10/2026

Đối tượng: Ứng dụng ngân hàng mô phỏng NhTBank

Phạm vi: Giao diện người dùng (UI), trải nghiệm người dùng (UX), hiệu ứng đồ họa, khả năng tương thích và tính ổn định.

## Nguyên tắc nghiệm thu

1. Chỉ được thay đổi những thành phần thuộc phạm vi thiết kế đã thống nhất.

2. Không tự ý xóa, sửa hoặc bổ sung chức năng nghiệp vụ ngoài yêu cầu.

3. Giữ nguyên cấu trúc dữ liệu và luồng xử lý hiện có, trừ khi có thay đổi được phê duyệt.

4. Giao diện phải có nhận diện riêng của NhTBank, không sao chép nguyên mẫu MB Bank.

5. Tất cả tiêu chí phải được kiểm tra thực tế, không kết luận đạt chỉ dựa trên mã nguồn.

6. NhTBank phải thể hiện rõ đây là ứng dụng mô phỏng, không phải dịch vụ ngân hàng thật.

Bảng tiêu chí nghiệm thu chi tiết

## Nhóm A. Màu sắc và nhận diện thương hiệu

| Mã  | Tiêu chí      | Điều kiện đạt                                                 | Ưu tiên |
| --- | ------------- | ------------------------------------------------------------- | ------- |
| A01 | Màu chủ đạo   | Sử dụng xanh dương, trắng và xanh nhạt nhất quán              | P0      |
| A02 | Gradient      | Chuyển màu mượt, không phân tầng màu bất thường               | P1      |
| A03 | Độ tương phản | Chữ thông thường đạt tối thiểu 4,5:1; chữ lớn đạt 3:1         | P0      |
| A04 | Logo          | Logo NhTBank hiển thị rõ nét, đúng tỷ lệ, không méo           | P0      |
| A05 | Tính đồng bộ  | Màu sắc, phông chữ và biểu tượng thống nhất giữa các màn hình | P0      |

## Nhóm B. Bố cục trang chủ

| Mã  | Tiêu chí          | Điều kiện đạt                                                   | Ưu tiên |
| --- | ----------------- | --------------------------------------------------------------- | ------- |
| B01 | Khu vực đầu trang | Có logo, tên người dùng, ảnh đại diện và biểu tượng thông báo   | P0      |
| B02 | Thẻ tài khoản     | Hiển thị số dư và số tài khoản mô phỏng rõ ràng                 | P0      |
| B03 | Ẩn/hiện số dư     | Nút hoạt động đúng, không làm thay đổi giá trị số dư            | P0      |
| B04 | Chức năng chính   | Các mục chuyển tiền, nhận tiền, QR, lịch sử và tài khoản dễ tìm | P0      |
| B05 | Bố cục linh hoạt  | Không tràn chữ, chồng lớp hoặc mất nút trên màn hình thử nghiệm | P0      |
| B06 | Khoảng cách       | Các thành phần có khoảng cách đồng đều, dễ đọc                  | P1      |

## Nhóm C. Nút bấm và biểu tượng

| Mã  | Tiêu chí               | Điều kiện đạt                                                     | Ưu tiên |
| --- | ---------------------- | ----------------------------------------------------------------- | ------- |
| C01 | Kích thước vùng chạm   | Tối thiểu 44 × 44 CSS px cho các nút thao tác chính               | P0      |
| C02 | Trạng thái tương tác   | Nút có phản hồi rõ khi được chạm hoặc kích hoạt                   | P0      |
| C03 | Biểu tượng             | Đúng ý nghĩa chức năng và đồng nhất về phong cách                 | P1      |
| C04 | Góc bo tròn            | Đồng bộ theo hệ thống thiết kế                                    | P1      |
| C05 | Phản hồi thao tác      | Thao tác được xác nhận trực quan, không gây nhấn lặp ngoài ý muốn | P0      |
| C06 | Trạng thái vô hiệu hóa | Nút không khả dụng phải có dấu hiệu và không thực hiện hành động  | P0      |

## Nhóm D. Hiệu ứng 3D và chuyển động

| Mã  | Tiêu chí              | Điều kiện đạt                                           | Ưu tiên |
| --- | --------------------- | ------------------------------------------------------- | ------- |
| D01 | Thẻ 3D                | Có bóng đổ và chiều sâu nhẹ, không ảnh hưởng nội dung   | P1      |
| D02 | Glassmorphism         | Có thể dùng kính mờ tại vị trí phù hợp, chữ vẫn dễ đọc  | P2      |
| D03 | Hiệu ứng chuyển trang | Không giật khung hình rõ rệt hoặc chớp trắng bất thường | P1      |
| D04 | Chuyển động của nút   | Có phản hồi khi tương tác, không gây chậm thao tác      | P1      |
| D05 | Giảm chuyển động      | Tôn trọng tùy chọn giảm chuyển động của thiết bị        | P0      |
| D06 | Giới hạn hiệu ứng     | Không cản thao tác, che nút hoặc làm mất nội dung       | P0      |

## Nhóm E. Thanh điều hướng

| Mã  | Tiêu chí            | Điều kiện đạt                                          | Ưu tiên |
| --- | ------------------- | ------------------------------------------------------ | ------- |
| E01 | Cấu trúc            | Có 5 mục: Trang chủ, Giao dịch, QR, Lịch sử, Cá nhân   | P0      |
| E02 | Điều hướng          | Từng mục mở đúng màn hình tương ứng                    | P0      |
| E03 | Trạng thái lựa chọn | Mục đang mở được làm nổi bật rõ ràng                   | P0      |
| E04 | Vị trí              | Thanh điều hướng cố định, không che nội dung           | P0      |
| E05 | Vùng an toàn        | Không bị che bởi thanh điều hướng hệ thống Android/iOS | P0      |

## Nhóm F. Khả năng tương thích

| Mã  | Tiêu chí      | Điều kiện đạt                                                | Ưu tiên |
| --- | ------------- | ------------------------------------------------------------ | ------- |
| F01 | Android       | Hoạt động trên trình duyệt Android thuộc danh sách hỗ trợ    | P0      |
| F02 | iPhone        | Hoạt động trên Safari iOS thuộc danh sách hỗ trợ             | P0      |
| F03 | Responsive    | Không bị tràn ngang ở chiều rộng 320, 360, 390 và 430 CSS px | P0      |
| F04 | Xoay màn hình | Giao diện không mất nội dung hoặc chức năng khi đổi hướng    | P1      |
| F05 | Bàn phím ảo   | Ô nhập và nút xác nhận không bị che khi bàn phím xuất hiện   | P0      |

## Nhóm G. Hiệu suất và ổn định

| Mã  | Tiêu chí           | Điều kiện đạt                                                           | Ưu tiên |
| --- | ------------------ | ----------------------------------------------------------------------- | ------- |
| G01 | Hiển thị trang đầu | LCP không quá 2,5 giây trong môi trường thử nghiệm đã thống nhất        | P1      |
| G02 | Phản hồi tương tác | INP không quá 200 ms khi có đủ dữ liệu đo                               | P1      |
| G03 | Độ ổn định bố cục  | CLS không quá 0,1                                                       | P1      |
| G04 | Bộ nhớ             | Không có dấu hiệu rò rỉ bộ nhớ đáng kể trong thử nghiệm lặp             | P0      |
| G05 | Tính ổn định       | Không xuất hiện lỗi JavaScript chưa xử lý trong các kịch bản nghiệm thu | P0      |
| G06 | Tối ưu hiệu ứng    | Không gây treo hoặc mất chức năng trên thiết bị thử nghiệm              | P0      |

Các ngưỡng hiệu suất được đánh giá trên cấu hình thiết bị, trình duyệt và điều kiện mạng ghi trong biên bản. Không được coi kết quả một thiết bị là đại diện cho mọi thiết bị.

## Nhóm H. Chức năng và an toàn mô phỏng

| Mã  | Tiêu chí           | Điều kiện đạt                                                                   | Ưu tiên |
| --- | ------------------ | ------------------------------------------------------------------------------- | ------- |
| H01 | Bảo toàn chức năng | Các chức năng sẵn có trước khi sửa giao diện vẫn hoạt động đúng                 | P0      |
| H02 | Bảo toàn dữ liệu   | Không có thay đổi ngoài yêu cầu đối với dữ liệu mô phỏng                        | P0      |
| H03 | Luồng thao tác     | Không phát sinh bước dư thừa làm cản trở các chức năng chính                    | P1      |
| H04 | Thông báo mô phỏng | Người dùng dễ nhận biết ứng dụng và giao dịch chỉ mang tính mô phỏng            | P0      |
| H05 | Thông tin nhạy cảm | Không hiển thị khóa bí mật, mật khẩu hoặc thông tin xác thực trong mã giao diện | P0      |
| H06 | QR và chuyển tiền  | Các chức năng mô phỏng không tự thực hiện giao dịch tài chính thật              | P0      |

## Quy trình kiểm thử nghiệm thu

Bước 1. Kiểm tra trạng thái ban đầu

Ghi nhận phiên bản mã nguồn, nhánh Git, commit và danh sách chức năng hiện có. Lưu ảnh giao diện trước khi chỉnh sửa để đối chiếu.

Bước 2. Kiểm tra giao diện trực quan

Đối chiếu màu sắc, bố cục, khoảng cách, kích thước chữ, biểu tượng và hiệu ứng với các tiêu chí nhóm A đến E.

Bước 3. Kiểm tra trên thiết bị

Thử nghiệm các màn hình với kích thước được yêu cầu. Kiểm tra cuộn trang, bàn phím, điều hướng và chế độ dọc/ngang.

Bước 4. Kiểm tra chức năng

Thực hiện lại các thao tác chính trước và sau khi chỉnh sửa, bảo đảm không phát sinh lỗi hồi quy.

Bước 5. Kiểm tra hiệu suất

Sử dụng công cụ đo phù hợp để kiểm tra LCP, INP, CLS và lỗi JavaScript. Ghi rõ kết quả thực đo, không điền số liệu ước lượng.

Bước 6. Sửa lỗi và kiểm tra lại

Mỗi lỗi phải có mô tả, cách tái hiện, mức ảnh hưởng, tệp liên quan và kết quả kiểm tra sau sửa.

## Quy định mức ưu tiên

- P0 – Bắt buộc: Không được nghiệm thu chính thức nếu còn tiêu chí P0 không đạt.

- P1 – Quan trọng: Phải đạt hoặc có ngoại lệ được phê duyệt bằng văn bản.

- P2 – Cải tiến: Có thể đưa vào phiên bản tiếp theo khi được chấp thuận.

Các trạng thái trên là trạng thái khởi tạo của bộ tiêu chí, không phải kết quả kiểm thử mã nguồn NhTBank.

## Điều kiện nghiệm thu cuối cùng

Ứng dụng chỉ được công nhận đạt nghiệm thu khi:

1. Toàn bộ tiêu chí P0 đều đạt.

2. Các tiêu chí P1 đạt hoặc có ngoại lệ được phê duyệt.

3. Không còn lỗi nghiêm trọng ảnh hưởng đến sử dụng hoặc làm sai lệch bản chất mô phỏng.

4. Có bằng chứng kiểm thử gồm ảnh chụp, kết quả đo hoặc biên bản chạy thử.

5. Các tính năng và cấu hình ngoài phạm vi chỉnh sửa được giữ nguyên.

6. Phiên bản nghiệm thu được gắn với commit cụ thể trên GitHub.

Kết quả mong muốn: NhTBank có giao diện hiện đại, nhất quán, đẹp về mặt thị giác, sử dụng thuận tiện, hiệu ứng mượt mà, hoạt động ổn định và có đầy đủ bằng chứng để kiểm tra chất lượng trước khi phát hành bản mô phỏng.

Quy tắc bắt buộc: Sau mỗi lần chỉnh sửa, phải kiểm tra lại các tiêu chí bị ảnh hưởng, ghi nhận trạng thái mới nhất và không tự ý thay đổi các thành phần ngoài phạm vi yêu cầu.
