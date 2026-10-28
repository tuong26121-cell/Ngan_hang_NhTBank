# NhTBank — hệ thống v2: giao dịch khi mất mạng

Cập nhật 29/10/2026. Phạm vi: Sandbox hiện có, Node 24 + SQLite và React. Mọi giá trị là mô phỏng; không có tiền thật hoặc API ngân hàng. Các sơ đồ phản ánh mã trong nhánh v2, không phải chứng nhận vận hành sản xuất.

## Quy tắc quan trọng nhất

**Không nhận được phản hồi không đồng nghĩa giao dịch thất bại.** Một ý định đã xác nhận có một mã yêu cầu và một nội dung bất biến. Chỉ tra cứu hoặc gửi lại đúng mã/nội dung đó. Không tạo mã mới chỉ vì timeout, HTTP 500, hết phiên, đóng tab hoặc tải lại trang.

- Chế độ `?runtime=server`: lưu hồ sơ lên `localStorage` **trước** POST, khóa Web Locks theo nguồn trang + chủ tài khoản, kiểm tra ghi thành công rồi mới gửi. Không lưu PIN, cookie hoặc CSRF vào hồ sơ này.
- Máy chủ commit receipt tiếp nhận riêng, rồi ghi sổ trong transaction khác. Mã chống lặp luôn có phạm vi `actorId:key` và fingerprint của lệnh chuẩn hóa. Ghi sổ thành công hoặc từ chối nghiệp vụ đều thành kết quả bất biến.
- Mất trang: phiên còn hạn được khôi phục; nếu cần, đăng nhập lại rồi tra cứu mã đã lưu. Không tự POST khi tải lại. Chỉ khi tra cứu trả `not_found`, người dùng nhập PIN và chủ động gửi lại nội dung đã lưu.
- `accepted` được kiểm tra tự động tối đa **3 lần** (1, 2, 4 giây); sau đó chỉ kiểm tra thủ công. API có timeout 12 giây. Worker tiếp tục các receipt đã nhận nhưng chưa có kết quả.
- `posted`: hiển thị biên nhận và focus tiêu đề; lỗi tải số dư hoặc lỗi thông báo không đổi kết quả đã chốt. `rejected`: ghi rõ máy chủ không thực hiện. Chỉ đóng hồ sơ cuối cùng khi người dùng chọn đóng kết quả/đi từ biên nhận.
- Hồ sơ chưa rõ kết quả không được bỏ để sửa nội dung hoặc tạo mã khác. Khóa giữa các tab ngăn tạo đồng thời; retry từ tab cũ phải khớp mã đang lưu, kể cả khi tab khác đã đóng kết quả.

## Hai máy trạng thái độc lập

| Trạng thái màn hình               | Ý nghĩa dữ liệu máy chủ                                   |
| --------------------------------- | --------------------------------------------------------- |
| Đang gửi / chưa rõ / đang tra cứu | Có thể chưa nhận, đã tiếp nhận, đã ghi sổ hoặc đã từ chối |
| Đang chờ                          | Đã nhận receipt, chưa có kết quả cuối                     |
| Biên nhận                         | Chỉ từ kết quả `posted` máy chủ xác nhận                  |
| Không thực hiện                   | Kết quả `rejected` được tra cứu xác nhận                  |

Trạng thái máy chủ: `not_found → accepted → posted/rejected`. `not_found` là quan sát tại thời điểm tra cứu, không phải bằng chứng một yêu cầu đang trên đường sẽ không đến. Vì vậy resend vẫn phải cùng mã. Lỗi kỹ thuật sau acceptance để receipt ở `accepted`; transaction ghi sổ rollback sạch và worker có thể tiếp tục. Phiên hết hạn không hủy lệnh đã được tiếp nhận hợp lệ. Worker chỉ xử lý chính xác receipt đã lưu; không nhận lệnh tùy ý từ trình duyệt.

## Ghi sổ và chuyển nội bộ

Lệnh gồm `accountId`, `bank`, `account`, `recipient`, `amount`, `note`. Dùng số nguyên VNĐ an toàn; kiểm tra hạn mức theo UTC+7 trong transaction ghi sổ. Receipt lưu JSON chuẩn hóa và fingerprint, không chứa PIN.

- Liên ngân hàng mô phỏng: giảm bên gửi, tăng `sandbox-clearing`. Tên người nhận chỉ kiểm định dạng, chưa được ngân hàng xác minh.
- Nội bộ `NhTBank Sandbox`: tra số tài khoản trong bộ dữ liệu, kiểm tên, loại tiền, khác nguồn và trạng thái active; giảm nguồn và tăng đúng đích trong **một transaction**. Tài khoản mẫu nhận `0900000002` — `Trần Minh Anh`, số dư đầu 0. Đây không phải tài khoản ngân hàng thật.
- Cùng transaction ghi sổ: 2 số dư, 2 bút toán có dấu, 1 giao dịch, 1 kết quả idempotency, audit, 1 sự kiện outbox. Lỗi bất kỳ sau khi bắt đầu ghi nợ rollback tất cả các phần này. Receipt tiếp nhận trước đó vẫn còn.
- Worker outbox hoạt động sau commit; lease/fencing, retry và inbox chống trùng tiếp tục độc lập. Không tuyên bố vận chuyển exactly-once.

## Đảo giao dịch

Operator đề xuất đảo **toàn phần** với lý do; approver khác người lập phải duyệt. Kiểm giao dịch gốc, chưa đảo, bằng chứng, sổ khớp, tài khoản active, số dư bên nhận đủ bù và giới hạn số nguyên.

Khi duyệt: cập nhật hai số dư + thêm hai bút toán ngược dấu + kết quả bù + audit + outbox + quyết định trong một transaction. Giao dịch mới có `kind: reversal`, `reversesId`, `proposalId`; bản gốc vẫn `posted`, không sửa/xóa. Duyệt lại cùng quyết định trả kết quả cũ, không thêm bút toán. Không có đảo một phần hoặc gọi hoàn tiền ngân hàng. Đảo không làm giảm doanh số hạn mức chuyển trong ngày.

## Đối soát và khôi phục

Đối soát tính lại số dư từ bút toán bằng BigInt, kiểm **đúng độ lớn, dấu, tài khoản nguồn/đích và quan hệ** receipt → kết quả → giao dịch → 2 bút toán → event, thêm phê duyệt và liên kết bù cho đảo. Hai bút toán cân tổng nhưng sai người/sai số tiền vẫn bị phát hiện. Sai sổ gốc cần điều tra; chỉ sai projection mới được đề xuất xây lại bộ đệm với người duyệt riêng.

Sao lưu ghi checksum, schema v2, version và số receipt/kết quả/bút toán ở snapshot đã chụp. Diễn tập sang DB cách ly, kiểm integrity + FK + schema + sổ và so sánh lịch sử bất biến với nguồn hiện tại. Báo cáo liệt kê receipt `accepted` tại mốc, receipt xuất hiện sau mốc, kết quả/bút toán thiếu và sự kiện/hộp nhận đã thay đổi sau mốc. Nguồn hiện tại chưa khớp sổ hoặc còn bị cô lập cũng chặn kết luận sẵn sàng.

Nếu còn yêu cầu chưa chốt hoặc thiếu dữ liệu sau mốc, đánh dấu `investigation-required`, `readyToOpen: false`; bản sao cân số dư vẫn **chưa đủ điều kiện mở lại giao dịch**. Báo cáo khớp chỉ là kết quả diễn tập tại thời điểm đó. Không có endpoint ghi đè DB đang chạy, tự replay lệnh sau sao lưu hay tự đưa DB phục hồi vào phục vụ. Khôi phục mất toàn bộ máy cần nguồn bền độc lập, kế hoạch replay/đối chiếu và phê duyệt; bản này chưa có nguồn đó.

## Dữ liệu và nâng schema

Schema **2** thêm bảng `requests` bất biến. Migration v1 → v2 giữ nguyên sổ, kết quả, audit đã chốt; bổ sung receipt từ fingerprint cũ để tra cứu lệnh lịch sử và thêm tài khoản nội bộ 0 đồng. Migration chạy trong SQL transaction, không xóa DB. Bản sao schema v1 không tự được mở như schema v2: cần quy trình chuyển đổi bản sao riêng rồi kiểm lại; chưa có công cụ tự chuyển backup cũ.

| Bản ghi                    | Quan hệ và chính sách                                                     |
| -------------------------- | ------------------------------------------------------------------------- |
| `requests`                 | ID `actor:key`, fingerprint + command, append-only; 0..1 kết quả          |
| `operations`               | ID bằng request; posted hoặc rejected, append-only                        |
| `transfers`                | Giao dịch posted, nguồn/đích/amount; reversal tham chiếu gốc, append-only |
| `ledger`                   | 2 bút toán/giao dịch; FK tài khoản + giao dịch, append-only               |
| `accounts`                 | Số dư projection và trạng thái; thay đổi qua unit of work                 |
| `outbox` / `notifications` | Sự kiện sau commit; inbox dùng ID sự kiện chống trùng                     |
| `proposals`                | Loại rebuild-projection hoặc reverse-transfer; maker khác checker         |
| `backups`                  | Checksum, mốc snapshot, báo cáo các yêu cầu quanh mốc                     |

## Sơ đồ và nguồn chỉnh sửa

Mermaid `.mmd` và Graphviz `.dot` được sinh từ cùng định nghĩa trong [render-diagrams.py](render-diagrams.py). SVG/PNG là xuất bằng Graphviz; khác cách bố trí Mermaid, cùng nội dung luồng. Chạy `python3 docs/design/render-diagrams.py` (cần `dot`) để cập nhật đồng thời các nguồn và ảnh. Đây là tệp chỉnh sửa trong repo; không tuyên bố đã tạo tài liệu trong MagicPath/Sites/Canva.

### Mất mạng khi chuyển tiền

[SVG](diagrams/01-network-loss.svg) · [PNG](diagrams/01-network-loss.png) · [Mermaid](diagrams/01-network-loss.mmd) · [DOT](diagrams/01-network-loss.dot)

```mermaid
flowchart TD
    A["Xác nhận nội dung; lưu mã trên thiết bị"]
    B["Gửi đúng mã và nội dung"]
    C{"Nhận được kết quả?"}
    D["Hiển thị trạng thái máy chủ xác nhận"]
    E["Chưa rõ kết quả"]
    F["Tra cứu mã cũ sau tải lại / đăng nhập lại"]
    G{"Trạng thái máy chủ"}
    H["Đã ghi sổ: hiển thị biên nhận"]
    I["Đã từ chối: không thực hiện"]
    J["Đã tiếp nhận: tối đa 3 lần kiểm tra tự động"]
    K["Chưa thấy: nhập PIN; gửi lại mã và nội dung cũ"]
    L["Hết lượt: người dùng kiểm tra thủ công"]
    A --> B
    B --> C
    C -->|Có| D
    C -->|Không| E
    E --> F
    F --> G
    G -->|posted| H
    G -->|rejected| I
    G -->|accepted| J
    J -->|Còn lượt| F
    J -->|Đủ 3 lần| L
    L -->|Thủ công| F
    G -->|not_found| K
    K -->|Cùng mã| B
    F -->|Vẫn mất mạng| E
```

### Đăng nhập và hết phiên

[SVG](diagrams/02-session.svg) · [PNG](diagrams/02-session.png) · [Mermaid](diagrams/02-session.mmd) · [DOT](diagrams/02-session.dot)

```mermaid
flowchart TD
    A["Mở ứng dụng"]
    B["GET session"]
    C{"Phiên còn hạn?"}
    D["Nạp đúng tài khoản và quyền"]
    E["Nhập PIN thử nghiệm"]
    F["Máy chủ tạo cookie HttpOnly + CSRF"]
    G{"Có yêu cầu đã lưu?"}
    H["Tra cứu mã cũ; giữ nguyên nội dung"]
    I["Mở tổng quan"]
    J["API trả SESSION_EXPIRED"]
    K["Giữ hồ sơ; đăng nhập lại"]
    A --> B
    B --> C
    C -->|Có| D
    C -->|Không| E
    E -->|Hợp lệ| F
    F --> D
    D --> G
    G -->|Có| H
    G -->|Không| I
    H -->|Hết phiên| J
    J --> K
    K -->|Không tạo mã khác| E
```

### Máy trạng thái màn hình

[SVG](diagrams/03-screen-state.svg) · [PNG](diagrams/03-screen-state.png) · [Mermaid](diagrams/03-screen-state.mmd) · [DOT](diagrams/03-screen-state.dot)

```mermaid
flowchart LR
    A["Nhập thông tin"]
    B["Kiểm tra"]
    C["PIN"]
    D["Đang gửi"]
    E["Chưa rõ kết quả"]
    F["Đang tra cứu"]
    G["Đang chờ / đã tiếp nhận"]
    H["Chưa tìm thấy"]
    I["Biên nhận đã ghi sổ"]
    J["Kết quả bị từ chối"]
    K["Đóng kết quả"]
    A -->|Hợp lệ| B
    B -->|Xác nhận| C
    C -->|Lưu mã trước gửi| D
    D -->|Mất phản hồi| E
    E -->|Kiểm tra / tải lại| F
    F -->|accepted| G
    G -->|Tối đa 3 lần| F
    F -->|not_found| H
    H -->|Cùng mã + nội dung| D
    F -->|posted| I
    F -->|rejected| J
    D -->|posted| I
    D -->|rejected đã tra cứu| J
    I -->|Chủ động đóng| K
    J -->|Chủ động đóng| K
    K -->|Ý định mới| A
```

### Máy trạng thái giao dịch máy chủ

[SVG](diagrams/04-transaction-state.svg) · [PNG](diagrams/04-transaction-state.png) · [Mermaid](diagrams/04-transaction-state.mmd) · [DOT](diagrams/04-transaction-state.dot)

```mermaid
flowchart LR
    A["not_found: chưa có receipt"]
    B["accepted: receipt bất biến đã commit"]
    C["Kiểm tra trong transaction ghi sổ"]
    D["posted: kết quả bất biến"]
    E["rejected: kết quả bất biến"]
    F["accepted còn nguyên; không ghi nợ dở"]
    G["Worker tiếp tục đúng lệnh"]
    H["Đảo bằng giao dịch bù riêng"]
    A -->|Đúng phiên / quyền / mã| B
    B -->|API hoặc worker| C
    C -->|COMMIT toàn bộ| D
    C -->|Từ chối nghiệp vụ| E
    C -->|Rollback lỗi kỹ thuật| F
    F -->|Khởi động lại| G
    G --> C
    D -->|Gửi lại cùng mã| D
    E -->|Gửi lại cùng mã| E
    D -->|Gốc vẫn posted| H
```

### Ghi sổ nguyên tử và thông báo

[SVG](diagrams/05-ledger.svg) · [PNG](diagrams/05-ledger.png) · [Mermaid](diagrams/05-ledger.mmd) · [DOT](diagrams/05-ledger.dot)

```mermaid
flowchart TD
    A["Receipt đã tiếp nhận"]
    B["BEGIN IMMEDIATE"]
    C["Đọc kết quả cũ theo mã"]
    D["Kiểm tra tài khoản / số dư / hạn mức / sổ"]
    E["Giảm gửi và tăng nhận nội bộ hoặc clearing"]
    F["Thêm 2 bút toán + kết quả + audit + outbox"]
    G["COMMIT"]
    H["Trả biên nhận"]
    I["Worker thông báo sau commit"]
    J["Inbox chống trùng theo ID sự kiện"]
    K["Retry có giới hạn / dead-letter"]
    L["ROLLBACK toàn bộ ghi sổ"]
    A --> B
    B --> C
    C -->|Đã có kết quả| H
    C -->|Chưa có| D
    D -->|Đạt| E
    E --> F
    F --> G
    G --> H
    G --> I
    I -->|Đã nhận| J
    I -->|Lỗi thông báo| K
    E -->|Lỗi kỹ thuật| L
    F -->|Lỗi kỹ thuật| L
```

### Đảo giao dịch có dấu vết

[SVG](diagrams/06-reversal.svg) · [PNG](diagrams/06-reversal.png) · [Mermaid](diagrams/06-reversal.mmd) · [DOT](diagrams/06-reversal.dot)

```mermaid
flowchart TD
    A["Chọn giao dịch gốc posted"]
    B["Operator lập đề xuất + lý do"]
    C["Người duyệt khác kiểm tra"]
    D["Từ chối; giữ nguyên sổ"]
    E["Đối soát; chưa đảo; tài khoản active; bên nhận đủ tiền"]
    F["BEGIN: đảo dấu 2 bút toán; cập nhật 2 số dư"]
    G["Thêm kết quả bù + audit + outbox + quyết định"]
    H["COMMIT; liên kết reversesId"]
    I["Giao dịch gốc và lịch sử vẫn giữ nguyên"]
    J["Không đủ bằng chứng / số dư: chưa áp dụng"]
    A --> B
    B --> C
    C -->|Không duyệt| D
    C -->|Duyệt| E
    E -->|Đạt| F
    E -->|Không đạt| J
    F -->|Cùng transaction| G
    G --> H
    H --> I
```

### Đối soát và cô lập

[SVG](diagrams/07-reconciliation.svg) · [PNG](diagrams/07-reconciliation.png) · [Mermaid](diagrams/07-reconciliation.mmd) · [DOT](diagrams/07-reconciliation.dot)

```mermaid
flowchart TD
    A["Đọc snapshot nhất quán"]
    B["Tính lại số dư bằng BigInt"]
    C["Kiểm số tiền, dấu, tài khoản, giao dịch / receipt / kết quả / event"]
    D{"Có sai lệch?"}
    E["Lưu kết quả khớp"]
    F["Cô lập phạm vi; lưu sự cố và audit"]
    G{"Chỉ sai bộ đệm?"}
    H["Đề xuất xây lại bộ đệm"]
    I["Người khác duyệt bằng chứng không đổi"]
    J["Đối soát lại; bỏ cô lập nếu đạt"]
    K["Điều tra sổ gốc; không tự bù"]
    A --> B
    B --> C
    C --> D
    D -->|Không| E
    D -->|Có| F
    F --> G
    G -->|Có| H
    G -->|Không| K
    H --> I
    I -->|Đạt| J
```

### Kiểm tra mốc khôi phục

[SVG](diagrams/08-recovery.svg) · [PNG](diagrams/08-recovery.png) · [Mermaid](diagrams/08-recovery.mmd) · [DOT](diagrams/08-recovery.dot)

```mermaid
flowchart TD
    A["Bản sao SQLite + checksum + version"]
    B["Chép sang DB cách ly, chỉ đọc"]
    C["Kiểm integrity / schema / sổ / quan hệ"]
    D["So sánh lịch sử bất biến với nguồn hiện tại"]
    E["Đối chiếu receipt và kết quả quanh mốc"]
    F{"Còn accepted hoặc dữ liệu ngoài bản sao?"}
    G["Đánh dấu cần điều tra; chưa được mở giao dịch"]
    H["Lưu báo cáo diễn tập đạt tại mốc này"]
    I["Đối chiếu nguồn độc lập và duyệt kế hoạch phục hồi"]
    J["Không có endpoint tự ghi đè hoặc mở DB phục hồi"]
    A --> B
    B --> C
    C -->|Đạt| D
    C -->|Không đạt| G
    D --> E
    E --> F
    F -->|Có| G
    F -->|Không| H
    G --> I
    I -->|Cần công cụ riêng| J
    H -->|Diễn tập không triển khai| J
```

### Quan hệ dữ liệu

[SVG](diagrams/09-data-relations.svg) · [PNG](diagrams/09-data-relations.png) · [Mermaid](diagrams/09-data-relations.mmd) · [DOT](diagrams/09-data-relations.dot)

```mermaid
flowchart LR
    A["Phiên RAM: actor + quyền"]
    B["Tài khoản: owner / số dư đệm / trạng thái"]
    C["Receipt: actor + key + fingerprint bất biến"]
    D["Kết quả: posted hoặc rejected bất biến"]
    E["Giao dịch: nguồn / đích / amount / reversesId"]
    F["Bút toán: transactionId / accountId / signed amount"]
    G["Outbox: eventId / transactionId / lease"]
    H["Inbox: eventId duy nhất"]
    I["Audit append-only"]
    J["Đối soát / sự cố"]
    K["Đề xuất / người lập / người duyệt"]
    L["Backup / checksum / mốc yêu cầu"]
    A -->|Sở hữu| B
    A -->|Tạo| C
    C -->|0..1 kết quả| D
    D -->|posted → 1| E
    E -->|2 bút toán| F
    F -->|Tài khoản| B
    E -->|1 sự kiện| G
    G -->|0..1 mục nhận| H
    C -->|Dấu vết| I
    E -->|Dấu vết| I
    F -->|Đối chiếu| J
    J -->|Đề xuất xử lý| K
    K -->|Đảo → giao dịch mới| E
    C -->|Mốc tiếp nhận| L
    E -->|Mốc ghi sổ| L
```

## Cách kiểm tra và giới hạn

Xem [kết quả kiểm tra v2](../system-v2-validation.md), [API](../platform-api.md), [hợp đồng giao dịch](../transaction-contract.md) và [runbook](../operations-runbook.md).

Chống gửi lặp qua tải lại áp dụng cho chế độ server, cùng origin và cùng chủ thể với hồ sơ trình duyệt còn nguyên. Bản memory vẫn mất sổ khi tải lại và không giả lập dữ liệu bền. Nếu xóa storage, đổi origin/thiết bị, máy chủ bị khôi phục mất các receipt mới hơn hoặc cố tình tạo mã khác, không có bảo đảm nối lại ý định tự động. Kiểm tra lịch sử/nhờ vận hành trước khi tạo lệnh mới. Chưa có offline-shell/PWA; cần kết nối để tải web và khôi phục phiên sau khi mở lại. Cần HTTPS/localhost hỗ trợ Web Locks; thiếu bộ nhớ hoặc khóa thì chặn gửi mới. Hồ sơ chứa thông tin chuyển tiền mẫu, chưa mã hóa; không đưa dữ liệu thật vào Sandbox.

Phiên và các danh tính/PIN public chỉ để thử; chưa có MFA, kiểm soát quản trị sản xuất, HSM/WORM, sao lưu ngoài máy, RPO/RTO đo đạc, cluster HA hoặc chứng nhận ngân hàng. Chưa kiểm tra thiết bị Android/iPhone thật, bàn phím ảo hay hiệu năng thực địa.
