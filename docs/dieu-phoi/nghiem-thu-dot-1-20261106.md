# Báo cáo nghiệm thu Đợt 1 — NhTBank Nhóm 01

Ngày 2026-11-06; repository `tuong26121-cell/Ngan_hang_NhTBank`; nguồn đọc trực tiếp main `7192af6c28b51b56806b0b9c6827d2d0604bbc8a`. Bản sửa và báo cáo thuộc commit chứa tệp này, tra SHA tại lịch sử GitHub. Chỉ sửa tài liệu/bằng chứng; không đổi SQL/runtime.

## Kết luận

**Hoàn tất lượt rà soát, sửa tài liệu và chuẩn bị bàn giao Đợt 1; chưa nghiệm thu thiết kế hoặc tích hợp backend/DB.** Không tự gán gate PASS. Phản biện tài liệu ở phiên trước chưa thay quyết định nghiệm thu trên đủ artifact/version.

Đã đọc body và toàn bộ comments 14 Issues #32–45; toàn bộ 10 tệp trong dot-1 (9 bản nhóm + bản sơ bộ), SQL v2, nguồn runtime/UI/workflow liên quan. Snapshot trước cập nhật:14 OPEN, không assignee/comments. Nhóm01 đang thực hiện yêu cầu trong chat;02–14 chưa có bằng chứng ACK riêng. Không tạo agent phụ hoặc gửi nhiệm vụ sang chat khác trong lượt này.

Chuỗi: **01 → 10 → 02 → 06 → 07 ↔ 08 → 13**;03/14 độc lập song song. Vòng1:07 giao schema/ACL,08 giao transaction/state; vòng2 đối chiếu rồi06/13 review.04/05/09/11/12 giữ nghiên cứu sơ bộ, chờ contract trước tích hợp.

## Đối chiếu 9 nhóm

| Nhóm / Issue | Kết quả có căn cứ | Chưa đủ nghiệm thu |
| --- | --- | --- |
| 01 / #32 | Snapshot hiện hành, source/version/blocker/handoff; sửa đánh số mục MASTER bị trùng | COORD owner review, ACK nhóm nhận |
| 10 / #41 | PRD demo/validation/acceptance có sẵn; phân biệt seed mẫu với ledger | PRD owner approval, fee/min-max API/self-transfer/account state/retention |
| 02 / #33 | Kiến trúc SPA/Capacitor→trusted backend→private DB là đề xuất; routes v1 chưa tồn tại | OpenAPI field-level/auth/confirmation/paging/fixtures |
| 06 / #37 | RBAC tách customer/app role/service_role; auditor chưa mapping, mặc định từ chối | Session/JWT ứng dụng và quyền từng endpoint/resource |
| 07 / #38 | Blob SQL v2 khớp; hunk A3.6 mới là kế hoạch | Final diff/reviewer, canonical gate-definition, PG17 disposable/runtime |
| 08 / #39 | Unique principal/scope/key có trong SQL; atomic/replay/crash là thiết kế | Ledger/balance persistence, transfer endpoint, hash/wait/failure/TTL |
| 13 / #44 | TEST:QA-01..12 tách GATE:QA-01; có cross-user/concurrency/crash cases | SQL/AuthZ/10 connection/crash runtime và quyết định review |
| 03 / #34 | Token mapping đúng CSS/import order;45 mã A01–H06:32P0/12P1/1P2 | Computed contrast/UX review/thiết bị; C05 không chứng minh idempotency |
| 14 / #45 | Integration đã có test:backend; Pages marker; APK paths và E2E dev server | Release/rollback/chi phí/artifact bytes/nativeAPK/thiết bị |

## Sai sót đủ điều kiện đã sửa

- **08:** bỏ kiểm balance ở bước trước replay; retry receipt đã commit phải được xét trước số dư cho yêu cầu mới.
- **02:** đồng bộ đề xuất tiền chuỗi nguyên/BIGINT với08; tách response gateway hiện có khỏi envelope v1 đề xuất. Giới hạn và normalization vẫn chờ review.
- **10:** tách validation frontend và seed mẫu khỏi field contract API/ledger tương lai; không tự chốt fee/TTL/chính sách nghiệp vụ.
- **03:** diễn giải C05 đúng là phản hồi thao tác, không phải bảo đảm backend idempotency.
- **MASTER-STATUS/HANDOFF-LOG/ROADMAP/đề xuất Đợt2:** snapshot ở đầu, đánh số duy nhất, source/version/ACK/review và điều kiện đóng blocker thống nhất.
- **Issues:** cập nhật trạng thái/việc tiếp theo bằng liên kết báo cáo và commit; giữ OPEN, không tự gán assignee hay ACK. Kết quả ghi phải đọc lại sau commit.

Không áp patch SQL chưa review vào archive hoặc triển khai backend vượt contract. Không thay UI/CSS nên không đổi ui-acceptance.

## Blocker P0 trước tích hợp hoặc nghiệm thu backend/DB

P0 ở đây là điều kiện bắt buộc chặn tích hợp nền tảng, **không phải khẳng định sự cố Production đang khai thác**. Bằng chứng là nguồn tĩnh; chưa có target Production/DB để kết luận runtime.

| ID | Bằng chứng / tác động | Nhóm / Issue | Điều kiện đóng |
| --- | --- | --- | --- |
| D1-P0-01 | 02 chỉ bảng route;06 chỉ RBAC nháp;demoAuth là browser demo. Chưa đủ principal/session/owner authorization và field contract | 10/02/06 #41/#33/#37, QA #44 | PRD owner review; OpenAPI versioned, permission/session/revocation; reviewer và test IDOR/cross-role trước mở tích hợp |
| D1-P0-02 | v2 chỉ sandbox_accounts/provider import sandbox_transactions; không ledger/balance nội bộ.08 chưa transfer engine/hash/retention/wait policy | 07↔08 #38/#39,13 #44 | Ledger riêng có conservation/locking/isolation/retry; hash fixtures/persisted receipt; review hai vòng rồi10 connection+crash/replay chứng minh không double debit |
| D1-P0-03 | Chưa final A3.6; audit actor FK ON DELETE SET NULL xung đột mutation guard; assertions thiếu exact ACL/MAINTAIN/columns/default/effective roles | 07/06/13 #38/#37/#44 | Unified diff hai tệp, review hunk; gate-definition provenance/version hoặc ID mới được review; PG17 disposable/preflight/rollback và SQL logs |
| D1-P0-04 | TEST:QA-01..09 SQL/AuthZ/concurrency còn NOT RUN; CI demo không thay bằng chứng transaction mới | 13/14/06/07/08 #44/#45 | Runner đúng v2, không testing-v3; trace DB/API/commit/rollback trên đúng source, review kết quả và ghi mọi skipped/blocker |

Fee/min-max/retention/completeness là quyết định thiết kế mở, không tự gọi là lỗ hổng runtime. Thiếu định nghĩa gate lịch sử là blocker truy nguyên, không phải SQL FAIL.

## SQL v2.1 A3.6

- Core `docs/sql-drafts/archive/v2/20261031_000001_nhtbank_core_schema.draft.sql`: Git blob `48ed0ab6adec0ffa3091e081924d051e2a6a2bda`.
- Assertions `docs/sql-drafts/archive/v2/20261031_000002_nhtbank_security_assertions.draft.sql`: Git blob `ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379`.
- Đây là Git blob SHA, không phải SHA256. Nhãn v2.1 A3.6 chưa biến bytes v2 thành migration hoàn tất.
- Cần review current_user/DDL owner, schema CREATE, exact table/column/sequence/function ACL, MAINTAIN PG17, role SET/inheritance/grant options/global defaults, audit FK/guard.
- Core COMMIT/assertions ROLLBACK là hai transaction riêng; rollback probe không hoàn trả sequence. Chưa final diff hoặc SQL/parser run. Không dùng runner testing-v3 để xác nhận v2.

## Kiểm thử và bằng chứng

[Snapshot Issues, manifest62 tệp và kết quả máy đọc được](bang-chung-nghiem-thu-dot-1-20261106/doi-chieu.json); [trích log CI nguồn](bang-chung-nghiem-thu-dot-1-20261106/trich-log-ci-nguon.log).

Checkout local cũ hơn main; git fetch lỗi proxy. Đã đối chiếu **62 tệp runtime/frontend/backend/scripts/E2E/config/package/lock với Git blob nguồn, không sai khác** trước khi dùng test. Workflow integration local khác main nên đọc bản mới qua GitHub; không coi checkout là main mới. Dùng node_modules sẵn có, Node24.19.0/npm11.9.0; không phải clean-install reproduction của CI Node22.

| Kiểm chứng | Kết quả | Phạm vi |
| --- | --- | --- |
| Local npm test mặc định | exit1;59 đạt,11 lỗi/11 unhandled listen EPERM | Sandbox cấm loopback; không tự kết luận lỗi sản phẩm hay PASS |
| Local test:backend ban đầu | exit1; chẩn đoán no-isolation:3 đạt/12 lỗi EPERM | Lỗi listen127.0.0.1 |
| Local backend sau escalation được duyệt | exit0;15 đạt/0 lỗi/0 skipped | Mock provider + loopback, không ngân hàng thật |
| Local APK config test | exit0;1 đạt | Chưa build APK |
| Local build Pages | exit0; JS512,12kB, cảnh báo500kB | Chưa tối ưu chunk |
| Vitest escalation | NOT EXECUTED / BLOCKED | Auto-review hết usage, không phải kết luận unsafe |
| Local E2E | NOT RUN | Cần loopback/browser ngoài giới hạn hiện tại |
| SQL/parser/concurrency/nativeAPK/thiết bị | NOT RUN | Chưa đủ contract/review/preflight |

**CI nguồn7192af6 đã đọc run/job/log**, không phải log tự chạy mới trong phiên:

- [Integration42194370164](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42194370164), job127813822396: completed/success; unit70,backend15 đạt; production Pages build; E2E **43 đạt,8 skipped**, không gọi toàn bộ51 đạt.
- [Pages42194370353](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/actions/runs/42194370353): build success, **deploy skipped**. Run success không có nghĩa website vừa deploy.
- Artifact main-integration-playwright ID13491108276 chưa expired tại lần đọc; API digest `sha256:f142b990219cfc9aa0b25643e4b6efb9b18eb72aed4ebd52c6dbba1d1d11becd`. Chỉ metadata/log upload được xác minh; chưa tải ZIP để tự đối chiếu.
- main không protected tại lần đọc; không tự đổi rules. Không dispatch workflow thủ công/macOS/DB/provider trả phí.
- CI của commit báo cáo mới phải đọc SHA riêng sau ghi; không dùng run nguồn để gọi commit mới PASS.

## Trạng thái gate

| Gate | Thiết kế | Runtime |
| --- | --- | --- |
| COORD-01 | REVIEW PENDING — PRD/owner/handoff | Không tự nhận nhóm khác |
| ARCH-01 | REVIEW PENDING — OpenAPI | v1 NOT IMPLEMENTED |
| SEC-01 | REVIEW PENDING — matrix/session | AuthZ ứng dụng NOT RUN |
| DB-01 | BLOCKED — diff/provenance | SQL NOT RUN |
| TX-01 | BLOCKED — ledger/state/hash/retention | Concurrency/crash NOT RUN |
| QA-01 | REVIEW PENDING — matrix/reviewer | CI demo có bằng chứng riêng, backend mới NOT RUN |
| UX-01 | REVIEW PENDING — token/45 tiêu chí | E2E không thay review/thiết bị |
| OPS-01 | REVIEW PENDING — release/rollback | CI nguồn success, chưa APK/release |

## Việc chuyển Đợt 2A

Giữ D2-01..06 trong [đề xuất Đợt2](de-xuat-dot-2.md), không tạo lại bản nháp:

1. **D2-01 /01+10:** PRD owner review, fee/min-max/self-transfer/account state/retention/replay horizon và acceptance.
2. **D2-02 /02:** OpenAPI v1 máy đọc được, DTO/errors/paging/auth/confirmation/request ID/tiền chính xác/fixtures, nhãn proposed/implemented.
3. **D2-03 /06:** JWT/session/revocation, principal/app role/DB credential, permission endpoint/resource và test IDOR/cross-role.
4. **D2-04 /07:** final A3.6 diff/gate-definition/exact ACL/owner/defaults/audit; ledger riêng khỏi archive hardening.
5. **D2-05 /08↔07:** ledger conservation, atomic claim/commit/replay trước balance, hash canonicalization/conflict/wait/failure/retention/crash, review hai vòng.
6. **D2-06 /13:** review độc lập version/hunk/gate, runner v2/PG17 disposable preflight rồi SQL/AuthZ/10 connection/fault injection/log.

03/14 review UI tokens/CI song song;04/05/09/11/12 chờ contract trước tích hợp. Handoff NB-NT-D1-20261106 trong [HANDOFF-LOG](HANDOFF-LOG.md) là ARTIFACT READY / ACK PENDING; tài liệu không tự gửi nhận việc.

## Lựa chọn tiếp tục

- **A — Khuyến nghị:** bắt đầu2A D2-01→02→03, chuẩn bị contract cho07↔08 và QA.
- **B:** ưu tiên review final diff/provenance SQL A3.6 như phần độc lập; giữ tích hợp khóa tới khi API/AuthZ/ledger chốt.

Chưa tự thực hiện Đợt2A chỉ vì đã ghi lựa chọn.
