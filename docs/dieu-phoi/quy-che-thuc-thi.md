# Quy chế thực thi NhTBank

> **Hiệu lực: 2026-11-06** · **Đã được chủ repository cho phép** · Tài liệu nguồn áp dụng cho 14 GitHub Issues #32–45 và các nhiệm vụ NhTBank tiếp theo. Các giới hạn cũ trong bản nháp điều phối được thay thế kể từ ngày này; kết quả, lịch sử và bằng chứng của các giai đoạn trước vẫn giữ nguyên.

## 1. Quyền thao tác được ủy quyền

- Trực tiếp tạo, cập nhật, sửa chữa tài liệu, mã nguồn, cấu hình và GitHub Issues.
- Được làm việc ngay trên nhánh `main` và push/merge theo nhiệm vụ; không mặc định bắt buộc nhánh tính năng/PR hoặc hỏi lại quyền ghi mỗi lần. Với thay đổi rủi ro cao, có thể chủ động dùng nhánh/PR để kiểm soát.
- Được chạy SQL, test, GitHub Actions, CI, build APK, E2E, kiểm tra artifact và deploy khi nhiệm vụ cụ thể và điều kiện môi trường đủ rõ ràng. Ghi log và bằng chứng.
- Được tự sửa lỗi phát hiện trong phạm vi nhiệm vụ, cập nhật status/đầu vào/phụ thuộc, báo cáo kết quả và phần chưa chứng minh.
- Có thể chuẩn bị tích hợp ngân hàng thật khi có nhà cung cấp, cơ chế xác thực hợp lệ và đặc tả rõ ràng; **không biến sandbox thành giao dịch thật chỉ bằng việc đổi nhãn**.

## 2. Các điều kiện kỹ thuật và an toàn không thể bỏ qua

- **Thao tác chưa xác định đích:** Không chạy SQL, di trú dữ liệu, xóa dữ liệu hoặc deploy lên môi trường chưa định danh. Phải đọc nguồn, xác minh đích, loại thay đổi, kiểm soát backup/rollback và quyền kết nối trước.
- **Giao dịch tiền thật:** Không chuyển/chi tiền nếu thiếu người thụ hưởng, tài khoản, số tiền và xác nhận cụ thể cho từng giao dịch. Không sử dụng PIN demo, OTP hay bí mật người dùng trong mã hoặc log.
- **Production:** Giữ tách biệt môi trường; không biến bản nháp chưa review thành migration Production; hạn chế thay đổi không thể đảo ngược nếu chưa có phương án phục hồi.
- **Dịch vụ trả phí:** Kiểm tra và chỉ chấp nhận mức chi phí đã được chủ tài khoản cho phép.
- **Quyền của nền tảng:** Không vượt branch protection, hạn mức, chính sách hoặc quyền thực tế của GitHub, ngân hàng hay dịch vụ khác.
- **Xác nhận kết quả:** Chỉ báo `PASS`/`VERIFIED` khi có bằng chứng (commit/run/log/artifact); test chưa chạy ghi `NOT RUN`. Sự cho phép không có nghĩa mọi việc đã tự chạy.
- **ChatGPT và GitHub:** Issue là hàng đợi trên GitHub. Nó không gửi lệnh vào các cuộc trò chuyện khác hoặc kích hoạt AI agent nếu chưa có hệ thống phối hợp được thiết lập.
- **Bảo vệ thông tin:** Không đưa credential, dữ liệu ngân hàng thực, OTP, token, số tài khoản nhạy cảm lên repo public hoặc output không an toàn.

## 3. Quy trình chuẩn cho một nhiệm vụ

1. Đọc Issue/đặc tả và kiểm tra phiên bản `main`, SHA, tài liệu phụ thuộc.
2. Phân tích ảnh hưởng tới code, người dùng, database, chi phí và workflow.
3. Thực hiện thay đổi trực tiếp trên `main` nếu phù hợp; sử dụng nhánh review khi có rủi ro cao hoặc cần chia giai đoạn.
4. Chạy các kiểm thử, lint, build, CI/E2E liên quan theo phạm vi; với SQL, kiểm tra môi trường và backup trước khi thực thi.
5. Kiểm tra GitHub Actions tự kích hoạt khi push `main`, bao gồm Pages deployment nếu có.
6. Ghi lại commit SHA, tên workflow/run, test evidence, lỗi, trạng thái và rủi ro. Cập nhật Issues/tài liệu bàn giao.
7. Với giao dịch thật hoặc hành động bên ngoài có hậu quả tài chính: chỉ thực hiện sau khi đủ thông tin và xác nhận giao dịch cụ thể.

## 4. Quyền ghi đè tài liệu cũ

Các câu mang tính **quy định hoạt động** trong các bản nháp trước như “chỉ đọc”, “không ghi GitHub”, “không được sửa `main`”, “chỉ nhánh tài liệu”, “không được chạy SQL/Actions/CI/APK/E2E/merge/deploy” đã được **thay thế** bởi quy chế này.

Các câu mang tính **ghi nhận lịch sử** như “trong đợt ngày X chưa chạy test” vẫn đúng với mốc thời gian đó và không bị sửa thành đã chạy. Các gate kỹ thuật, bảo mật và sự thật về kiến trúc vẫn được đánh giá bằng chứng độc lập.

## 5. Đầu mối

- [Hướng dẫn root AGENTS](../../AGENTS.md)
- [MASTER-STATUS](tong-quan-trang-thai.md)
- [Bảng giao việc](bang-giao-viec-20261106.md)
- [Hướng dẫn phân công](huong-dan-phan-cong.md)
- [Quyết định](quyet-dinh-du-an.md)
- GitHub Issues [#32–#45](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues)
