# Ghi chú bằng chứng Nhóm 09

Log ban đầu được giữ để truy nguyên lỗi môi trường. Không cộng dồn các lượt chạy thành số test duy nhất.

- backend.log / unit.log / ket-qua.json: sandbox EPERM và timeout; backend/unit exit 1.
- backend-mo-quyen.log: 15/15 trước bổ sung; unit-mo-quyen.log: 70/70; build-mo-quyen.log: exit 0.
- backend-bo-sung.log: lượt 18/18 trước đồng bộ Nhóm 13; một test duplicate được bỏ khi Nhóm 13 đã cung cấp coverage tương đương.
- backend-cuoi.log: 27/27 trên baseline ba22b0d + hai test Nhóm 09.
- e2e-mo-quyen.log: thiếu executable Chromium; 51 lỗi launch, không phải bằng chứng 51 lỗi nghiệp vụ.
- e2e-chromium-he-thong.log: Chromium hệ thống, 42 đạt/8 skip/1 lỗi Android.
- ket-qua-cuoi.json: metadata baseline, SHA256 test source và kết quả cuối; e2e-android-xac-minh.log ghi rerun riêng bài lỗi khi có.

Chỉ mock gateway trên loopback và E2E frontend demo. Không SePay Test Mode thật, DB hay Live. Không bằng chứng durable persistence/concurrency/restore.
