# Hợp đồng giao dịch và tính nhất quán

## Lệnh và khóa chống lặp

Một lệnh gồm `accountId`, `bank`, `account`, `recipient`, `amount`, `note`. Transport bổ sung PIN mô phỏng và header `Idempotency-Key` dài 16–100 ký tự chữ/số/gạch ngang/gạch dưới. Khóa thực tế gồm ID chủ thể + mã lệnh; dấu vân tay là JSON đã chuẩn hóa của nội dung lệnh, không gồm PIN.

- Cùng chủ thể, cùng khóa và cùng nội dung: trả lại kết quả trước đó, không tạo thêm bút toán/audit ghi sổ/sự kiện.
- Cùng khóa, nội dung khác: `KEY_CONFLICT`, HTTP 409.
- Lỗi nghiệp vụ trước ghi sổ được lưu thành kết quả từ chối cùng audit. Gửi lại khóa đó vẫn bị từ chối như cũ. Sửa lệnh phải tạo khóa mới.
- Lỗi trong/sau quá trình bắt đầu ghi sổ làm rollback toàn bộ, kể cả lỗi driver SQL sau khi một câu lệnh đã ghi tài khoản.
- Phiên và quyền được kiểm tra trước tra kết quả; không cho phiên hết hạn dùng mã lệnh để lấy dữ liệu.

UI giữ khóa khi gửi lại cùng biểu mẫu sau lỗi kết nối. Mất phản hồi không được coi là thất bại giao dịch hoặc tự sinh khóa khác. Khóa hiện được giữ trong component, không được lưu bền qua tải lại; sau khi rời biểu mẫu/tải lại, cần xem sổ/lịch sử trước khi lập lệnh khác. Bản này chưa có trung tâm tra cứu lệnh chưa rõ kết quả qua nhiều thiết bị.

## Kiểm tra trước khi chốt

1. Vai trò khách hàng, phiên còn hiệu lực và đúng chủ tài khoản.
2. Tài khoản đang hoạt động; tình trạng sổ khớp. Sai lệch có thể cô lập ngay trước ghi nợ.
3. Ngân hàng nằm trong danh sách mô phỏng; tài khoản 6–19 chữ số; không chuyển vào tài khoản mẫu của chính mình. Tên 2–80 ký tự, ghi chú tối đa 120.
4. Số tiền nguyên an toàn, tối thiểu 1.000 VNĐ và không vượt số dư.
5. Hạn mức mẫu 2.000.000 VNĐ/lần, 3.000.000 VNĐ/ngày theo UTC+7. Cộng hạn mức và kiểm tra số dư trong transaction.

Tên/số tài khoản chỉ được kiểm tra định dạng trong Sandbox, **không được ngân hàng xác minh**. Không có phí thật, chuyển liên ngân hàng hoặc kết quả thanh toán thật.

## Đơn vị ghi sổ

Trong cùng transaction: cập nhật hai số dư bộ đệm, thêm hai bút toán, thêm kết quả, thêm mã lệnh, thêm audit và thêm một sự kiện outbox. SQLite dùng `BEGIN IMMEDIATE`, `WAL`, `synchronous=FULL` và busy timeout. Ràng buộc khóa/trigger được kiểm tra trước commit; lỗi làm rollback. Driver memory clone trước rồi chỉ công bố sau khi toàn bộ callback và kiểm tra bất biến đạt.

| Tập dữ liệu                                         | Chính sách                                               |
| --------------------------------------------------- | -------------------------------------------------------- |
| Sổ, kết quả, mã lệnh, audit, hộp nhận, lần đối soát | Chỉ thêm; không sửa/xóa                                  |
| Số dư bộ đệm, trạng thái tài khoản                  | Chỉ qua lệnh hợp lệ                                      |
| Outbox                                              | pending → processing → delivered; retry hoặc dead-letter |
| Sự cố                                               | open → resolved sau phê duyệt/đối soát lại               |
| Đề xuất                                             | pending → applied hoặc rejected                          |
| Bản sao                                             | created → verified sau diễn tập                          |

## Sau commit

Worker claim một sự kiện đến hạn, đặt lease 30 giây và token riêng. Gửi ngoài transaction ghi sổ, sau đó ghi hộp nhận theo ID sự kiện và xác nhận giao hàng. Worker chết sau giao nhưng trước xác nhận có thể giao lại; hộp nhận chỉ có một mục cho một ID. Không tuyên bố vận chuyển exactly-once. Callback ngoài hệ thống cũng phải chấp nhận ID chống trùng của bên nhận.

Lỗi gửi không làm mất bút toán, không trừ tiền lần nữa và không hoàn tác giao dịch. Backoff là `1000 × 2^attempts` ms, tối đa 5 lần/cycle rồi dead-letter. Token lease ngăn worker cũ ghi đè trạng thái claim mới. Chưa có giao diện phát lại dead-letter; phải điều tra trước khi bổ sung lệnh phát lại.

## Lỗi tiêu biểu

- 401: `SESSION_EXPIRED`, `INVALID_PIN`.
- 403: `FORBIDDEN`, `ACCOUNT_FORBIDDEN`, `SELF_APPROVAL`, `ORIGIN_REJECTED`, `CSRF_REJECTED`, `LAB_DISABLED`.
- 409: `KEY_CONFLICT`, `INSUFFICIENT_FUNDS`, `LIMIT_EXCEEDED`, `EVIDENCE_CHANGED`.
- 423: `ACCOUNT_QUARANTINED`, `RECONCILIATION_REQUIRED`.
- 429: giới hạn thử PIN sai; 413: body lớn hơn 16 KiB.

Không trả stack/SQL hoặc giá trị cookie/CSRF trong lỗi. Sự kiện và audit chỉ chứa thông tin mẫu cần cho vận hành, không ghi PIN.

Một sự cố chỉ có một đề xuất chờ. Gửi lại cùng người lập/lý do trả bản cũ; nội dung khác bị từ chối cho đến khi bản đang chờ được quyết định. Đây là chống trùng đề xuất, không phải tạo thêm giao dịch tài chính.
