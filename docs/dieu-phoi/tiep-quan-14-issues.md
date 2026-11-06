# Bảng tiếp quản 14 Issues — Nhóm01

Nguồn main đầu phiên `7192af6c28b51b56806b0b9c6827d2d0604bbc8a`, đối chiếu14 issue trực tiếp trước khi thực hiện. Chủ repository giao Nhóm01 tiếp quản toàn scope; không cần14assignee/chat để được làm. GitHubIssues vẫn chưa sửa do REST Forbidden, không tuyên bố đã ACK trênGitHub. Chi tiết [báo cáo](bao-cao-tiep-quan-20261106.md).

| Nhóm/Issue | Giai đoạn | Hiện vật/kiểm tra đã xác minh | Còn thiếu để đóng issue |
| --- | --- | --- | --- |
| 01/[#32](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/32) | Đợt 1/điều phối | VERIFIED: kế hoạch, snapshot14 issue và evidence | BLOCKED: ghi Issues qua REST Forbidden |
| 02/[#33](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/33) | Đợt 2A | VERIFIED: OpenAPI+41 fixture+5tests | BLOCKED: approval contract,issuer/confirmation và server API |
| 03/[#34](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/34) | Đợt 2B | VERIFIED: inventory token đã có trên7192 | NOT RUN: nghiệm thu45 tiêu chí/thiết bị; không thay UI trong phiên |
| 04/[#35](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/35) | Đợt 2B | VERIFIED: E2E production43đạt/8 skip | BLOCKED: tích hợpAPI/auth/ledger |
| 05/[#36](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/36) | Đợt 2B | VERIFIED: workflow test production root assets | NOT RUN: APKnative mới/thiết bị; chờ run/artifact |
| 06/[#37](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/37) | Đợt 2A | VERIFIED: ma trận quyền deny-by-default dạngcontract | BLOCKED: JWTissuer/session/confirmation triển khai+review |
| 07/[#38](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/38) | Đợt 2A | VERIFIED: nguồnblob và draftdiff áp văn bản | BLOCKED: gateprovenance,reviewPG17,target/migration chưa nghiệmthu |
| 08/[#39](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/39) | Đợt 2A | VERIFIED: utilityshape/canonicalhash23 tests | BLOCKED: ledger atomic/durableidempotency/authbackend |
| 09/[#40](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/40) | Đợt 2C | VERIFIED:15test gatewaymock và contractdurableACK | BLOCKED: durableinbox/workerproviderintegration |
| 10/[#41](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/41) | Đợt 2A | VERIFIED: PRD/acceptance hiện hữu được giữ | BLOCKED: ownerchốt fee/retention/replayhorizon |
| 11/[#42](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/42) | Đợt 2C | VERIFIED: sitemap/permission/incident contract | BLOCKED: role/session/protected API; NOT RUN adminruntime |
| 12/[#43](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/43) | Đợt 2C | VERIFIED: catalogchỉđọc/safetycases dạngthiếtkế | BLOCKED: permissions/API/provider/budget; NOT RUN AIeval |
| 13/[#44](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/44) | Đợt 3/4 | VERIFIED:114 tests+41 fixtures,43E2E/8 skip và kiểmtrađầu-ra | BLOCKED: SQL/concurrency/physicaldevice/releasegates |
| 14/[#45](https://github.com/tuong26121-cell/Ngan_hang_NhTBank/issues/45) | Đợt 2B | VERIFIED:6YAML/35 shell blocks; CI contract và APK productionE2E | NOT RUN: kếtquảremotecommitmới,artifact/rollbackproduction |

## Nhiệm vụ tiếp theo theo phụ thuộc

1. Review hợp đồng và patchSQL; không phải yêu cầu chạy SQL.
2. Khi có issuer/session/confirmation và môi trườngDB+reviewmigration: triển khai backend ledger/ownercheck/replay, rồi tests10connections/crash; chỉ mở clientintegration khi có APIverified.
3. Song song: CI/APKevidence và UX/thiếtbịthật có thể tiếp tục khi có task/môi trường.
4. SePaydurableACK/Admin/AI chỉ tích hợp sau contract/quyền/dữliệu; không dùng mock để lấpP0.
5. Đợt 4/Production BLOCKED đến khi SEC/DB/TX và cácP0 khác nghiệmthu. Không phát hành khi chỉ testschema/utility/E2Edemo đạt.
