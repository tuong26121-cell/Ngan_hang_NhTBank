# API nền tảng Sandbox v1

Địa chỉ cục bộ mặc định `http://127.0.0.1:3001/api/v1`. Không phải API ngân hàng hoặc dịch vụ SePay. API cùng nguồn, không bật CORS; Vite dùng proxy `/api`. Các ghi dữ liệu cần `Origin` nằm trong danh sách được phép và `X-CSRF-Token` của phiên. Body JSON tối đa 16 KiB.

| Phương thức | Tuyến                               | Quyền / kết quả                                                                                   |
| ----------- | ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| GET         | `/health`                           | Trạng thái tiến trình Sandbox; không có bí mật                                                    |
| POST        | `/session`                          | `{identity: customer/operator/approver, pin: 123456}`; cookie HttpOnly/SameSite và `{actor,csrf}` |
| GET         | `/session`                          | Khôi phục actor/CSRF của cookie còn hiệu lực                                                      |
| DELETE      | `/session`                          | Hủy phiên, không xóa DB                                                                           |
| GET         | `/snapshot`                         | Khách hàng chỉ dữ liệu tài khoản mình; vận hành/phê duyệt xem dữ liệu nền tảng                    |
| GET         | `/transfer-requests/:key`           | Khách hàng, cùng chủ thể; trả not_found/accepted/posted/rejected; GET không tạo giao dịch         |
| POST        | `/transfers/:id/reversal-proposals` | Vận hành, `{reason}`; đề xuất bút toán bù toàn phần                                               |
| POST        | `/transfers`                        | Khách hàng; header `Idempotency-Key`, body lệnh + `pin`; trả kết quả đã chốt hoặc lỗi nghiệp vụ   |
| POST        | `/reconciliations`                  | Vận hành; chạy và lưu đối soát, cô lập nếu lệch                                                   |
| POST        | `/outbox/dispatch`                  | Vận hành; xử lý một sự kiện đến hạn                                                               |
| POST        | `/incidents/:id/proposals`          | Vận hành; `{reason}`                                                                              |
| POST        | `/proposals/:id/approve`            | Phê duyệt; `{reason}`, người khác người lập                                                       |
| POST        | `/proposals/:id/reject`             | Phê duyệt; `{reason}`                                                                             |
| POST        | `/backups`                          | Vận hành; tạo bản sao SQLite và manifest                                                          |
| POST        | `/backups/:id/drill`                | Vận hành; kiểm tra bản khôi phục cách ly                                                          |
| POST        | `/lab/projection-drift`             | Vận hành + lab được bật; chỉ thử sai lệch trên bộ dữ liệu Sandbox                                 |

Phản hồi lỗi dạng `{error:{code,message}}`; không gửi stack hoặc PIN. Cookie được hash trước khi làm khóa Map trên server; token gốc chỉ ở cookie, CSRF ở bộ nhớ client. Phiên hết hạn sau 30 phút, không tự cấp lại quyền từ body `actor/role`.

Ví dụ lệnh dữ liệu mẫu:

```json
{
  "accountId": "customer-vnd",
  "bank": "MB Bank",
  "account": "123456789",
  "recipient": "Người nhận mẫu",
  "amount": "100000",
  "note": "Thử nghiệm sổ kép",
  "pin": "123456"
}
```

Kết quả có `id`, `status: posted`, `mode: sandbox`, số tiền có dấu âm, ngày UTC, người nhận, ngân hàng và tài khoản mẫu. Trong bảng `transfers` giá trị amount là độ lớn dương; dấu ghi nợ/ghi có nằm ở `ledger`. Không có xác nhận người nhận thật hoặc tiền ra ngân hàng.

UI lưu key/lệnh trước khi gửi và tra cứu khi tải lại. Nếu mất key do xóa bộ nhớ/đổi thiết bị, xem lịch sử/sổ và nhờ vận hành trước khi tạo lệnh mới. Không coi mọi HTTP 500/timeout là giao dịch đã rollback. Xem [hợp đồng](transaction-contract.md).

## Tra cứu kết quả

HTTP 200 có `{key,status}`; chưa tìm thấy trả `status: not_found`, không phải lỗi 404. `accepted` có `acceptedAt`; `posted` thêm `result`; `rejected` thêm `error:{code,message,status}`. Mã chỉ được tìm trong phạm vi `actorId:key`; phiên hết hạn trả 401. Không dùng GET để tự gửi lại hoặc chốt lệnh.

`POST /transfers` lưu receipt trước rồi chốt đồng bộ; worker tiếp tục receipt đã nhận chưa có kết quả. Lỗi kỹ thuật/timeout có thể đã commit; tra cứu mã cũ. Duyệt `/proposals/:id/approve` áp dụng theo loại: rebuild-projection giữ nguyên sổ, reverse-transfer tạo bút toán bù liên kết gốc.

Kết quả drill thêm `recovery:{readyToOpen,issues,aroundCut,missingResults,missingPostings,eventsToReview,snapshotVersion,liveVersion}`. `status: investigation-required` nghĩa là DB bản sao còn thiếu dữ liệu/yêu cầu so với mốc hiện tại; không được xem như đã mở lại hệ thống.
