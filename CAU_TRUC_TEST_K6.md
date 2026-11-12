# Cấu trúc project test k6 — LogXPro: Lead, Khách hàng, Hợp đồng khách hàng

_Tạo lúc 2026-10-31 09:31 từ SRS `SRS_LogXPro__Lead-Hợp đồng-Khách hàng.md` (06/10/2026) và Swagger `https://logx-api-dev.sonthanh.net.vn/swagger-ui/index.html`. Tổng 62 API trong phạm vi SRS (Swagger đầy đủ có 441 API, 379 API còn lại thuộc module khác nên không đưa vào)._

## 1. Tóm tắt

Chia project thành ba lớp: dữ liệu chuẩn bị chạy một lần (`setup/`), năm luồng đại diện cộng năm luồng phụ trong `flows/`, và các bài test trong `tests/` ghép luồng thành tải theo vai trò. Có 4 API P0 (tạo Lead, upload HĐ đầu tiên, tái ký, gia hạn), 10 API P1, 21 API P2 và 27 API P3. Điểm rủi ro lớn nhất là tranh chấp dữ liệu (MST trùng, upload đôi, hai HĐ cùng hiệu lực, chuyển người phụ trách đồng thời) nên có bốn bài stress riêng thay vì chỉ load. Nên làm trước: bộ `lib/` và `lib/auth.js`, rồi flow `lead-to-customer` kèm smoke, vì mọi flow khác đều dựng khách hàng từ đó. Thiết kế dựa trên tài liệu, chưa đo bằng tải thật, và k6 phải chạy trên máy truy cập được máy chủ dev.

## 2. Dữ liệu chuẩn bị

Phần vận hành chạy một lần, không đưa vào đo tải. Cần có sẵn: tài khoản NVKD và DVKH (tạo bằng module quản trị, ngoài phạm vi báo cáo này), tối thiểu hai ngành hàng đang dùng (tạo bằng API quản trị danh mục).

| Việc chuẩn bị | API dùng | Ghi chú |
| --- | --- | --- |
| Kiểm tra đăng nhập từng vai trò | `POST /api/auth/login`, `GET /api/auth/me` | Mỗi vai trò một tài khoản riêng, token giữ trong `setup()` |
| Lấy ngành hàng đang dùng | `GET /api/catalogues/industries` | Rỗng nghĩa là chưa cấu hình, phải nhờ quản trị tạo |
| Lấy danh sách người nhận Lead và người phụ trách khách hàng | `GET /api/leads/assignable-owners`, `GET /api/customers/assignable-managers` | Dùng để chia slot NVKD và DVKH |
| Nạp 10.000 Lead cho bài đo ngưỡng 2 giây | `POST /api/leads/import` | File `.xlsx` sinh bằng `tools/gen-import-xlsx.js`, tiêu đề đúng 13 cột của file mẫu |
| Nạp một phần khách hàng có HĐ | `POST /api/leads`, `POST /api/contracts` | Qua `setup/seed-volume.js` |

Tạo Lead, đầu mối, HĐ trong từng flow nằm trong phép đo vì đây là thao tác nghiệp vụ thường xuyên, không phải cấu hình.

## 3. Luồng đại diện

| Flow | Đường đi | Mục đích | Ưu tiên |
| --- | --- | --- | --- |
| `lead-to-customer` | `POST /api/auth/login` (NVKD) → `GET /api/catalogues/industries` → `GET /api/leads/assignable-owners` → `POST /api/leads` → `GET /api/leads/{id}` → `GET /api/contracts/uploadable-customers` → `GET /api/customers/assignable-managers` → `POST /api/contracts` → `GET /api/leads/{id}` → `POST /api/auth/login` (DVKH) → `GET /api/customers` → `GET /api/customers/{id}` → `GET /api/contracts/{id}` | Luồng lõi của SRS: Lead thành khách hàng và bàn giao sang DVKH; kiểm tra Lead thành `CONVERTED`, sinh `CUS-XXXX` và `CTCYYMM-XXX` | P0 |
| `contract-extend-edit` | Dựng khách hàng có HĐ đã hết hạn (upload với kỳ hạn đã qua nhận `EXPIRED` ngay) → `POST /api/contracts/{id}/extensions` (`EXPIRED` → `ACTIVE`) → `GET /api/customers/{id}` → `PUT /api/contracts/{id}` → `POST /api/contracts/{id}/annexes` → `PUT /api/contracts/{id}/annexes/{annexId}` → `DELETE /api/contracts/{id}/annexes/{annexId}` → `GET /api/contracts/{id}/file` → `GET /api/contracts/{id}/history` | Duy trì hợp đồng đang chạy bởi DVKH: gia hạn muộn, sửa điều khoản, quản lý phụ lục; kiểm tra khách hàng trở lại `ACTIVE` | P0 |
| `contract-resign-end` | Dựng khách hàng có HĐ `ACTIVE` → nhánh A: `POST /api/contracts/{id}/resign` (lần đầu 409 `confirmation-required`, gửi lại với `confirmReplacement: true`) → `GET /api/contracts/{id}` (HĐ cũ `SUSPENDED`) → `GET /api/customers/{id}`; nhánh B: `POST /api/contracts/{id}/resign` với ngày hiệu lực sau ngày hết hạn HĐ cũ (HĐ mới `PENDING`) → `POST /api/contracts/{id}/cancel` → `POST /api/contracts/{id}/suspend` → `GET /api/customers/{id}` | Đổi và kết thúc hiệu lực: tái ký có và không chồng kỳ, hủy HĐ chờ, dừng khai thác; kiểm tra trạng thái khách hàng suy ra từ HĐ hiện hành | P0 |
| `customer-handover` | `GET /api/customers/{id}` → `PUT /api/customers/{id}` → `PUT /api/customers/{id}/tier` → `PUT /api/customers/{id}/credit-limit` → `POST /api/customers/{id}/contacts` → `PUT /api/customers/{id}/contacts/{contactId}` → `POST /api/customers/{id}/contacts/{contactId}/primary` → `DELETE /api/customers/{id}/contacts/{contactId}` → `POST /api/customers/{id}/transfer-account-manager` → (token DVKH mới) `GET /api/customers/{id}` → `GET /api/notifications` | Chăm sóc và bàn giao khách hàng: người cũ mất quyền, người mới nhận quyền và thông báo, HĐ `PENDING`/`ACTIVE` đổi người phụ trách | P1 |
| `lead-maintain` | `POST /api/leads` → `POST /api/leads/{id}/contacts` → `POST /api/leads/{id}/documents` → `PUT /api/leads/{id}` → `POST /api/leads/{id}/deactivate` → `POST /api/leads/{id}/reactivate` → `POST /api/leads/{id}/transfer-owner` → (token NVKD mới) `GET /api/notifications` → `POST /api/notifications/{id}/read` → `GET /api/leads/{id}/history` | Khai thác Lead trước khi ký: sửa, ngưng và kích hoạt lại, bàn giao Lead cho NVKD khác | P1 |

| Flow phụ | Nên test thế nào |
| --- | --- |
| `browse-search` | Đọc thuần: `GET /api/leads`, `GET /api/customers`, `GET /api/contracts` với bộ lọc và `search` thay đổi, mở `GET /api/leads/stats`, `GET /api/contracts/stats`, chi tiết và `/history`. Chạy trên dữ liệu 10.000 bản ghi, think time 3–8 giây |
| `notifications-poll` | Mỗi VU đang đăng nhập gọi `GET /api/notifications/unread-count` mỗi 30 giây (giả định), thỉnh thoảng `GET /api/notifications`; dùng chung cho đo độ trễ thông báo của hai flow chuyển người phụ trách |
| `file-io` | Xuất Excel `GET /api/leads/export`, `GET /api/customers/export`, `GET /api/contracts/export` theo bộ lọc nhỏ và lớn, tải file `GET /api/contracts/{id}/annexes/{annexId}/file`, `GET /api/leads/{id}/documents/{documentId}`; tần suất thấp |
| Phiên đăng nhập | `POST /api/auth/refresh`, `GET /api/auth/me` nằm trong `lib/auth.js`; `POST /api/auth/logout`, `POST /api/auth/password` chỉ ở smoke, xem mục Không tạo tải trực tiếp |
| Batch 00:00 | Không có API gọi trực tiếp. `soak-mix` chạy qua 00:00 giờ Việt Nam, dựng sẵn HĐ `PENDING` tới ngày hiệu lực và HĐ `ACTIVE` quá hạn, rồi đọc `GET /api/contracts/{id}/history` tìm `CONTRACT_ACTIVATED`, `CONTRACT_EXPIRED` với `actorName` là `Hệ thống` |

## 4. Vai trò và tải

Hai cách chạy: smoke dùng một VU lần lượt đổi token NVKD và DVKH trong cùng iteration để xác nhận API trước mở khóa API sau. Load và soak chạy mỗi vai trò một scenario đồng thời. VU của k6 không chia sẻ bộ nhớ nên việc chuyển giữa NVKD và DVKH đi qua dữ liệu: tên doanh nghiệp có tiền tố `K6-<runId>-<slot>-<seq>`, DVKH của slot đó đọc `GET /api/customers` với `search` đúng tiền tố slot. Mỗi slot chỉ một VU DVKH nên không hai VU nhận cùng một việc.

| Scenario | Vai trò | Việc làm | Lấy việc từ đâu | Tốc độ | Nguồn số liệu |
| --- | --- | --- | --- | --- | --- |
| `sales_create_customer` | NVKD | Flow `lead-to-customer` | Tự tạo Lead mới; tên doanh nghiệp mang tiền tố `K6-<runId>-<slot>-<seq>` để DVKH cùng slot nhận việc | 12 lượt/phút | Giả định |
| `cs_receive_customer` | DVKH | Bước nhận khách của `lead-to-customer` rồi gộp `customer-handover` | `GET /api/customers` với `search=K6-<runId>-<slot>-` (mỗi VU một slot nên không tranh việc nhau) | 4 lượt/phút | Giả định |
| `cs_contract_maintain` | DVKH | Flow `contract-extend-edit` | Tự dựng khách hàng và HĐ `EXPIRED` bằng token NVKD của cùng slot rồi xử lý bằng token DVKH | 6 lượt/phút | Giả định |
| `cs_contract_replace_end` | DVKH | Flow `contract-resign-end` | Như trên, dựng HĐ `ACTIVE` | 4 lượt/phút | Giả định |
| `sales_lead_care` | NVKD | Flow `lead-maintain` | Tạo Lead riêng mỗi lượt; người nhận chuyển Lead là NVKD thứ hai cùng slot | 12 lượt/phút | Giả định |
| `browse_all` | NVKD và DVKH | Flow `browse-search` | Dữ liệu seed 10.000 bản ghi, không tiêu thụ việc | Tăng dần 0 → 20 VU, think time 3–8 giây | Giả định; ngưỡng thời gian lấy từ SRS |
| `bell_poll` | NVKD và DVKH | Flow `notifications-poll` | Không lấy việc; đọc thông báo của chính tài khoản | 30 VU, 1 lần mỗi 30 giây mỗi VU | Giả định |
| `file_io` | NVKD và DVKH | Flow `file-io` | Dùng khách hàng, HĐ, Lead từ `seed-fixtures` | 2 lượt/phút | Giả định |

SRS không có số người dùng hay tần suất, nên mọi tốc độ ở trên là `Giả định` và nằm trong mục 12.

## 5. Ưu tiên API

| Ưu tiên | Nhóm nghiệp vụ | API | Vì sao | Bài test |
| --- | --- | --- | --- | --- |
| P0 | Chuyển Lead thành khách hàng | `POST /api/leads`, `POST /api/contracts` | Điểm khởi đầu của vòng đời; sinh mã `LED`, `CUS`, `CTC` theo bộ đếm toàn hệ thống; chặn trùng MST; upload file; có race khi hai người cùng tạo một MST hoặc cùng upload cho một Lead | Smoke, load (flow `lead-to-customer`), stress race MST và upload đôi |
| P0 | Đổi hiệu lực hợp đồng | `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/extensions` | Đổi trạng thái hợp đồng và kéo theo trạng thái khách hàng (suy ra); giữ luật một khách hàng một HĐ hiệu lực, không chồng kỳ; tái ký có cổng xác nhận hai bước; hỏng thì khách tạm ngưng, không đăng ký được dịch vụ | Smoke, load (flow `contract-extend-edit`, `contract-resign-end`), stress race trạng thái hợp đồng |
| P1 | Đăng nhập | `POST /api/auth/login` | Mọi vai trò phải qua đây; băm mật khẩu tốn CPU; dồn vào đầu ca | Smoke, spike đầu ca, token dùng lại trong `setup()` |
| P1 | Danh sách và tìm kiếm | `GET /api/leads`, `GET /api/customers`, `GET /api/contracts` | Đọc nhiều nhất; SRS đòi dưới 2 giây với 10.000 bản ghi; tìm khách hàng khớp một phần trên cả mã hợp đồng và ngành hàng nên query nặng | Load (flow `browse-search`), stress tăng dần số người xem trên dữ liệu 10.000 bản ghi |
| P1 | Chuyển trạng thái hợp đồng khác | `PUT /api/contracts/{id}`, `POST /api/contracts/{id}/suspend`, `POST /api/contracts/{id}/cancel` | Đổi trạng thái hợp đồng hoặc điều khoản và kéo theo trạng thái khách hàng; sửa HĐ chờ có cổng xác nhận kích hoạt | Smoke, load (flow `contract-extend-edit`, `contract-resign-end`), stress race trạng thái hợp đồng |
| P1 | Chuyển người phụ trách | `POST /api/leads/{id}/transfer-owner`, `POST /api/customers/{id}/transfer-account-manager` | Đổi quyền truy cập (người cũ mất quyền); chuyển khách hàng cập nhật đồng loạt các HĐ `PENDING`/`ACTIVE`; gửi thông báo qua hàng đợi bất đồng bộ | Smoke, load (flow `lead-maintain`, `customer-handover`), stress race chuyển người phụ trách, đo độ trễ chuông |
| P1 | Import Lead hàng loạt | `POST /api/leads/import` | File đến 20MB; kiểm tra trùng MST từng dòng (SRS: dưới 1 giây với 10.000 bản ghi); hai file chồng MST nhập đồng thời | Smoke, stress import đồng thời và file lớn |
| P2 | Làm mới token và thông tin phiên | `POST /api/auth/refresh`, `GET /api/auth/me` | Gọi theo chu kỳ của mọi người dùng, chi phí thấp hơn đăng nhập | Traffic mix |
| P2 | Xem chi tiết | `GET /api/leads/{id}`, `GET /api/customers/{id}`, `GET /api/contracts/{id}` | Có mặt trong mọi flow dưới dạng bước kiểm tra trạng thái; SRS đòi dưới 2 giây; chi tiết hợp đồng gom nhiều khối | Traffic mix, bước kiểm tra trạng thái trong mọi flow |
| P2 | Ô số liệu và giám sát kỳ hạn | `GET /api/leads/stats`, `GET /api/contracts/stats` | Đếm trên toàn bộ phạm vi người gọi, gọi mỗi lần mở màn hình | Traffic mix |
| P2 | Lịch sử thao tác | `GET /api/leads/{id}/history`, `GET /api/customers/{id}/history`, `GET /api/contracts/{id}/history` | Lịch sử lưu vĩnh viễn nên lớn dần; lịch sử khách hàng gộp cả giai đoạn Lead; có bộ lọc và phân trang | Traffic mix, đo lại sau soak |
| P2 | Thông báo chuông | `GET /api/notifications`, `GET /api/notifications/unread-count` | Mọi người dùng đang mở ứng dụng thăm dò định kỳ nên là loại request nhiều nhất về số lượng | Traffic mix, đo độ trễ thông báo |
| P2 | Xuất Excel | `GET /api/leads/export`, `GET /api/customers/export`, `GET /api/contracts/export` | Tối đa 10.000 dòng một lần xuất, sinh file tốn bộ nhớ và DB | Load tần suất thấp, stress nhiều lượt xuất đồng thời |
| P2 | Sửa thông tin Lead và khách hàng | `PUT /api/leads/{id}`, `PUT /api/customers/{id}` | Kiểm tra MST trùng toàn hệ thống mỗi lần sửa; ghi lịch sử giá trị cũ → mới | Load (flow `lead-maintain`, `customer-handover`), stress race MST |
| P2 | Ngưng và kích hoạt lại Lead | `POST /api/leads/{id}/deactivate`, `POST /api/leads/{id}/reactivate` | Đổi trạng thái Lead, chi phí thấp | Load (flow `lead-maintain`) |
| P2 | Phụ lục có file | `POST /api/contracts/{id}/annexes` | Upload file lên dịch vụ lưu trữ, sinh mã `PLC` theo bộ đếm | Load (flow `contract-extend-edit`) |
| P2 | Nguồn chọn khi upload hợp đồng | `GET /api/contracts/uploadable-customers` | Đọc danh sách Lead của chính người gọi mỗi lần mở form upload, không phải upload file | Load (flow `lead-to-customer`) |
| P3 | Đầu mối liên hệ | `POST /api/leads/{id}/contacts`, `PUT /api/leads/{id}/contacts/{contactId}`, `DELETE /api/leads/{id}/contacts/{contactId}`, `POST /api/leads/{id}/contacts/{contactId}/primary`, `POST /api/customers/{id}/contacts`, `PUT /api/customers/{id}/contacts/{contactId}`, `DELETE /api/customers/{id}/contacts/{contactId}`, `POST /api/customers/{id}/contacts/{contactId}/primary` | Ghi nhỏ, tần suất thấp; luật nghiệp vụ (không xóa người cuối, đầu mối chính) thuộc bộ API functional | Smoke, một lượt trong flow `lead-maintain` và `customer-handover` |
| P3 | Phân loại và hạn mức khách hàng | `PUT /api/customers/{id}/tier`, `PUT /api/customers/{id}/credit-limit` | Ghi một trường, hiếm khi đổi; hạn mức hiện chỉ ghi nhận | Smoke, một lượt trong flow `customer-handover` |
| P3 | Tài liệu thô của Lead | `POST /api/leads/{id}/documents`, `GET /api/leads/{id}/documents/{documentId}`, `DELETE /api/leads/{id}/documents/{documentId}`, `GET /api/customers/{id}/documents/{documentId}` | File nhỏ, hiếm dùng | Smoke, một lượt trong flow `lead-maintain` |
| P3 | Sửa, xóa, tải phụ lục và file hợp đồng | `PUT /api/contracts/{id}/annexes/{annexId}`, `DELETE /api/contracts/{id}/annexes/{annexId}`, `GET /api/contracts/{id}/annexes/{annexId}/file`, `GET /api/contracts/{id}/file`, `GET /api/contracts/{id}/extensions/{sequence}/file` | Hiếm dùng; chỉ đọc hoặc ghi nhỏ trên file đã có | Smoke, một lượt trong flow `contract-extend-edit` và `file-io` |
| P3 | Danh sách chọn và cấu hình | `GET /api/leads/assignable-owners`, `GET /api/customers/assignable-managers`, `GET /api/contracts/assignable-managers`, `GET /api/catalogues/industries`, `GET /api/leads/import-template` | Dữ liệu nhỏ, ít đổi, đọc khi mở form | Smoke, gọi một lần mỗi iteration trong flow |
| P3 | Đánh dấu thông báo đã đọc | `POST /api/notifications/{id}/read` | Ghi một cờ, tần suất thấp | Smoke, một lượt trong flow `lead-maintain` |

### Điều chỉnh ưu tiên

Điểm tự động chấm theo từ khóa trong tên API, không hiểu nghiệp vụ nên cho 0 API P0. Bảng dưới là các API đã đổi mức hoặc đổi cách xử lý sau khi đọc SRS.

| API | Điểm tự động | Mức chốt | Lý do |
| --- | --- | --- | --- |
| `POST /api/leads` | 1 | P0 | Nâng lên P0: điểm khởi đầu, sinh mã `LED`, chặn trùng MST, có race |
| `POST /api/contracts` | 2 | P0 | Nâng lên P0: chuyển Lead thành khách hàng, sinh mã, có race upload đôi |
| `POST /api/contracts/{id}/resign` | 1 | P0 | Nâng lên P0: đổi hiệu lực hợp đồng và trạng thái khách hàng, cổng xác nhận hai bước |
| `POST /api/contracts/{id}/extensions` | 1 | P0 | Nâng lên P0: gia hạn HĐ hết hạn đưa khách hàng về hoạt động |
| `GET /api/leads` | 0 | P1 | Nâng lên P1: đọc nhiều nhất, SRS đòi dưới 2 giây với 10.000 bản ghi |
| `GET /api/customers` | 0 | P1 | Nâng lên P1: tìm nhiều trường, SRS đòi dưới 2 giây với 10.000 bản ghi |
| `GET /api/contracts` | 0 | P1 | Nâng lên P1: đọc nhiều, lọc theo nhiều tham số |
| `PUT /api/contracts/{id}` | 1 | P1 | Nâng lên P1: sửa điều khoản, có cổng xác nhận kích hoạt |
| `POST /api/contracts/{id}/suspend` | 1 | P1 | Nâng lên P1: đổi trạng thái hợp đồng và khách hàng |
| `POST /api/leads/{id}/transfer-owner` | 1 | P1 | Nâng lên P1: đổi quyền truy cập, thông báo bất đồng bộ, có race |
| `POST /api/customers/{id}/transfer-account-manager` | 1 | P1 | Nâng lên P1: cập nhật đồng loạt nhiều hợp đồng, có race |
| `POST /api/leads/import` | 2 | P1 | Nâng lên P1: file đến 20MB, kiểm tra trùng MST từng dòng |
| `POST /api/auth/refresh` | 4 | P2 | Gọi theo chu kỳ token, không băm mật khẩu nên nhẹ hơn đăng nhập |
| `GET /api/leads/{id}` | 0 | P2 | Nâng lên P2: là bước kiểm tra trạng thái trong mọi flow, SRS đòi dưới 2 giây |
| `GET /api/customers/{id}` | 0 | P2 | Nâng lên P2: là bước kiểm tra trạng thái trong mọi flow, SRS đòi dưới 2 giây |
| `GET /api/contracts/{id}` | 0 | P2 | Nâng lên P2: là bước kiểm tra trạng thái trong mọi flow, SRS đòi dưới 2 giây |
| `GET /api/contracts/stats` | 0 | P2 | Nâng lên P2: đếm theo phạm vi, gọi mỗi lần mở màn |
| `GET /api/leads/{id}/history` | 0 | P2 | Nâng lên P2: lịch sử lưu vĩnh viễn nên lớn dần, có lọc và phân trang |
| `GET /api/customers/{id}/history` | 0 | P2 | Nâng lên P2: lịch sử lưu vĩnh viễn nên lớn dần, có lọc và phân trang |
| `GET /api/contracts/{id}/history` | 0 | P2 | Nâng lên P2: lịch sử lưu vĩnh viễn nên lớn dần, có lọc và phân trang |
| `GET /api/notifications` | 0 | P2 | Nâng lên P2: thăm dò định kỳ bởi mọi người dùng |
| `GET /api/notifications/unread-count` | 0 | P2 | Nâng lên P2: thăm dò định kỳ bởi mọi người dùng |
| `PUT /api/leads/{id}` | 1 | P2 | Nâng lên P2: kiểm tra MST trùng toàn hệ thống mỗi lần sửa |
| `PUT /api/customers/{id}` | 1 | P2 | Nâng lên P2: kiểm tra MST trùng toàn hệ thống mỗi lần sửa |
| `POST /api/leads/{id}/deactivate` | 1 | P2 | Nâng lên P2: đổi trạng thái Lead, nằm trong flow `lead-maintain` |
| `POST /api/leads/{id}/reactivate` | 1 | P2 | Nâng lên P2: đổi trạng thái Lead, nằm trong flow `lead-maintain` |
| `POST /api/contracts/{id}/annexes` | 1 | P2 | Nâng lên P2: upload file lên dịch vụ lưu trữ |
| `GET /api/contracts/uploadable-customers` | 2 | P2 | Điểm tự động loại khỏi tải vì từ khóa `upload`, nhưng đây chỉ là danh sách Lead đọc từ DB |

### Không tạo tải trực tiếp

| API | Lý do | Phương án |
| --- | --- | --- |
| `POST /api/auth/password` | Đổi mật khẩu và kết thúc mọi phiên khác của tài khoản; chạy dưới tải sẽ làm hỏng token của các VU đang dùng chung tài khoản | Chỉ smoke 1 lượt với tài khoản riêng chỉ dùng cho việc này, đổi lại mật khẩu cũ sau đó; không đưa vào load |
| `POST /api/auth/logout` | Thu hồi refresh token; nếu dùng chung phiên với VU khác sẽ làm các VU đó mất phiên | Chỉ smoke 1 lượt trên phiên đăng nhập riêng; cuối test mỗi VU có thể đăng xuất phiên của chính nó |

## 6. Bài test riêng

| Nhóm API | Rủi ro | Bài test | Điều cần phát hiện |
| --- | --- | --- | --- |
| `POST /api/leads`, `PUT /api/leads/{id}`, `POST /api/leads/import` | Hai người cùng nhập một MST: không có ràng buộc duy nhất ở DB thì sinh hai Lead cùng MST hoặc trùng mã `LED` | `stress-lead-mst-race.js`: 20–50 VU gửi cùng một MST vào cùng thời điểm; thêm biến thể một VU import chứa MST đó | Số response 201 khác 1; Lead cùng MST tồn tại đồng thời; mã `LED` trùng hoặc nhảy; 500 hoặc deadlock thay vì 409 |
| `POST /api/contracts` | Cùng một Lead upload hai lần đồng thời, hoặc nhiều HĐ cùng tháng tranh bộ đếm `CTCYYMM-XXX` | `stress-contract-upload-race.js`: nhiều VU upload cho cùng `customerId`; biến thể nhiều Lead khác nhau cùng lúc | Hai HĐ cho một Lead; hai mã `CUS`; Lead chuyển đổi hai lần; mã `CTC` trùng; file mồ côi |
| `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/extensions`, `PUT /api/contracts/{id}`, `POST /api/contracts/{id}/suspend`, `POST /api/contracts/{id}/cancel` | Hai thao tác cùng đổi một HĐ: vi phạm một khách hàng một HĐ hiệu lực, chồng kỳ, cổng xác nhận bị lách | `stress-contract-state-race.js`: nhiều VU gọi tái ký có `confirmReplacement: true` cùng lúc trên một HĐ `ACTIVE`; trộn gia hạn và dừng khai thác | Hai HĐ cùng `ACTIVE`; HĐ cũ không về `SUSPENDED`; gia hạn chồng HĐ chờ; trạng thái khách hàng lệch so với HĐ hiện hành |
| `POST /api/leads/{id}/transfer-owner`, `POST /api/customers/{id}/transfer-account-manager` | Chuyển đồng thời cho hai người khác nhau: người phụ trách cuối không xác định, thông báo thiếu hoặc trùng, HĐ lệch người | `stress-transfer-race.js`: nhiều VU chuyển cùng một đối tượng cho các người nhận khác nhau; đọc lại bằng token mọi người | Hai người cùng thấy đối tượng; HĐ `ACTIVE` khác người phụ trách với khách hàng; thông báo gửi sai người; độ trễ chuông vượt ngưỡng |
| `POST /api/leads/import`, `GET /api/leads/export`, `GET /api/customers/export`, `GET /api/contracts/export` | File lớn và nhiều lượt cùng lúc: hết bộ nhớ, timeout, import trùng chéo giữa các file | `stress-import-export.js`: file 10.000 dòng, nhiều file chồng MST, xuất 10.000 dòng song song | Thời gian vượt ngưỡng; `created` cộng dồn lớn hơn số MST duy nhất; xuất lỗi 500 khi gần mức 10.000 dòng |
| `GET /api/leads`, `GET /api/customers`, `GET /api/contracts` | Truy vấn tìm kiếm nặng trên 10.000 bản ghi làm chậm DB cho mọi vai trò | `stress-browse-volume.js`: tăng dần VU, tìm theo `search` rộng và hẹp, lọc nhiều tham số | Điểm số VU mà p95 vượt 2 giây; truy vấn tìm theo mã hợp đồng của khách hàng chậm hơn các trường khác |
| `POST /api/auth/login` | Băm mật khẩu tốn CPU khi nhiều người đăng nhập đầu ca | `spike-login.js`: tăng vọt số lượt đăng nhập, dùng nhiều tài khoản | Thời gian đăng nhập tăng kéo theo timeout; chặn tần suất làm đăng nhập hợp lệ bị từ chối |

Các ca sâu như sai quyền, dữ liệu không hợp lệ, xóa đầu mối cuối cùng, sai thứ tự ngày thuộc bộ API functional; k6 chỉ giữ validation quan trọng nhất khi tạo tải và các ca cần tính đồng thời.

## 7. Kiểm tra trạng thái

Mỗi bước chỉ chạy tiếp khi bước trước trả đúng trạng thái. Trạng thái khách hàng không có trong response của API hợp đồng nên phải gọi thêm API đọc.

| Bước | API | Trạng thái mong đợi | Cách kiểm tra |
| --- | --- | --- | --- |
| Tạo Lead | `POST /api/leads` | Lead `ACTIVE`, mã `LED-XXXX` | Đọc `data.status` ở response; nếu tạo hộ (201 không body) thì gọi `GET /api/leads/{id}` theo header `Location` |
| Upload HĐ đầu tiên | `POST /api/contracts` | HĐ `PENDING`, `ACTIVE` hoặc `EXPIRED` đúng theo ngày; mã `CTCYYMM-XXX`; Lead `CONVERTED` | Đọc `data.status` của HĐ, rồi `GET /api/leads/{id}` kiểm `status` và `customerCode` |
| Khách hàng sau upload | `GET /api/customers/{id}` | `ACTIVE` nếu HĐ `ACTIVE`; `SUSPENDED` với `PENDING_CONTRACT` nếu HĐ `PENDING`; `SUSPENDED` với `NO_ACTIVE_CONTRACT` nếu HĐ `EXPIRED` | Response upload không có trạng thái khách hàng nên phải gọi thêm API đọc |
| Gia hạn HĐ hết hạn | `POST /api/contracts/{id}/extensions` | HĐ `EXPIRED` → `ACTIVE`; `expiry` mới đúng `newExpiry` | Đọc `data.status`; `GET /api/customers/{id}` kiểm `ACTIVE` và `suspendReason` bằng `null` |
| Tái ký có cổng xác nhận | `POST /api/contracts/{id}/resign` | Lần đầu 409 với `errorCode` `confirmation-required`, `data.mustAcknowledge[0].code` là `contract-replace-active`; lần hai 201, HĐ cũ `SUSPENDED`, HĐ mới `PENDING` hoặc `ACTIVE` | Kiểm mã 409 ở lần đầu; sau lần hai `GET /api/contracts/{id}` của HĐ cũ |
| Dừng khai thác | `POST /api/contracts/{id}/suspend` | HĐ `SUSPENDED`; khách hàng `SUSPENDED` với `CONTRACT_SUSPENDED` nếu đây là HĐ hiện hành | Đọc `data.status`; `GET /api/customers/{id}` |
| Hủy HĐ chờ | `POST /api/contracts/{id}/cancel` | HĐ `PENDING` → `CANCELLED` | Đọc `data.status`; HĐ khác `PENDING` phải 409 (chỉ kiểm ở smoke) |
| Sửa HĐ chờ thành hiệu lực | `PUT /api/contracts/{id}` | Lần đầu 409 với mã `contract-becomes-active`, lần hai lưu và HĐ thành `ACTIVE` | Kiểm mã 409 lần đầu, gửi lại với `confirmActivation: true`, đọc `data.status` |
| Ngưng và kích hoạt Lead | `POST /api/leads/{id}/deactivate`, `POST /api/leads/{id}/reactivate` | `INACTIVE` rồi `ACTIVE` | Đọc `data.status` và `deactivationReason` |
| Chuyển người phụ trách Lead | `POST /api/leads/{id}/transfer-owner` | 204; người cũ gọi lại nhận 404, người mới nhận 200; người mới có thông báo `LEAD_TRANSFERRED` | `GET /api/leads/{id}` bằng cả hai token; thăm dò `GET /api/notifications` đến khi có, đo độ trễ |
| Chuyển người phụ trách khách hàng | `POST /api/customers/{id}/transfer-account-manager` | 204; HĐ `PENDING`/`ACTIVE` đổi `accountManagerName`; người mới có thông báo `CUSTOMER_TRANSFERRED` | `GET /api/customers/{id}` và `GET /api/contracts/{id}` bằng token mới; thăm dò thông báo |
| Đổi phân loại | `PUT /api/customers/{id}/tier` | `tier` khách hàng đổi, HĐ giữ `customerTier` cũ | `GET /api/customers/{id}` và `GET /api/contracts/{id}` |
| Import Lead | `POST /api/leads/import` | `totalRows` = `created` + `skippedDuplicate` + `skippedInvalid` | Kiểm hằng đẳng thức ở response; `GET /api/leads` với `search` theo tên một dòng đã tạo |
| Batch 00:00 | `GET /api/contracts/{id}/history` | `PENDING` → `ACTIVE`, `ACTIVE` → `EXPIRED` đúng ngày | Đọc `eventCode` với `actorName` là `Hệ thống` sau 00:00; chỉ trong soak |

## 8. Cấu trúc thư mục

```text
performance-tests/
├─ config/
│  ├─ env.js                    địa chỉ API, tenantCode, runId, đọc biến môi trường
│  └─ thresholds.js             ngưỡng p95, tỷ lệ lỗi, check theo API
├─ data/                        fixture và tỷ lệ tải, không chứa mật khẩu
│  ├─ load-profile.json
│  ├─ accounts.example.json     tên biến môi trường theo vai trò, không có mật khẩu
│  └─ files/                    sample-contract.pdf, sample-annex.pdf, lead-doc.pdf, import-small.xlsx
├─ lib/
│  ├─ http.js                   bọc request: header, tag theo API, kiểm envelope, cổng xác nhận 409
│  ├─ auth.js                   đăng nhập từng vai trò, làm mới token
│  ├─ factory.js                tạo MST, tên doanh nghiệp, số hợp đồng, ngày theo runId
│  ├─ files.js                  dựng multipart, part JSON có Content-Type application/json
│  ├─ assertions.js             kiểm trạng thái, không chỉ HTTP 200
│  ├─ leads.js                  API nhóm Lead
│  ├─ customers.js              API nhóm khách hàng
│  ├─ contracts.js              API nhóm hợp đồng, hàm dựng khách hàng có HĐ theo trạng thái
│  └─ notifications.js          API chuông, hàm đo độ trễ thông báo
├─ setup/
│  ├─ seed-fixtures.js          chạy một lần: tài khoản, ngành hàng, nhóm slot
│  └─ seed-volume.js            nạp dữ liệu 10.000 Lead và khách hàng mẫu
├─ flows/
│  ├─ lead-to-customer.js
│  ├─ contract-extend-edit.js
│  ├─ contract-resign-end.js
│  ├─ customer-handover.js
│  ├─ lead-maintain.js
│  ├─ browse-search.js
│  ├─ notifications-poll.js
│  └─ file-io.js
├─ tests/
│  ├─ smoke-all.js
│  ├─ load-mix.js
│  ├─ stress-lead-mst-race.js
│  ├─ stress-contract-upload-race.js
│  ├─ stress-contract-state-race.js
│  ├─ stress-transfer-race.js
│  ├─ stress-import-export.js
│  ├─ stress-browse-volume.js
│  ├─ spike-login.js
│  └─ soak-mix.js
└─ tools/
   └─ gen-import-xlsx.js        chạy bằng Node, ngoài k6, sinh file .xlsx import đúng 13 cột
```

## 9. Bảng file

| Thứ tự | File | Test/làm gì | API chính | Ưu tiên | Phụ thuộc |
| --- | --- | --- | --- | --- | --- |
| 1 | `config/env.js` | Gom cấu hình: địa chỉ API, `tenantCode`, `runId`, số slot, đường dẫn file mẫu | — | P0 | — |
| 2 | `config/thresholds.js` | Ngưỡng chung: p95 dưới 2 giây cho đọc, dưới 3 giây cho `POST /api/contracts`, lỗi dưới 1% | — | P0 | env.js |
| 3 | `lib/http.js` | Hàm gọi API, gắn tag theo `METHOD /path` để tách số đo, kiểm envelope `success`, xử lý 409 `confirmation-required` | tất cả | P0 | env.js |
| 4 | `lib/auth.js` | Đăng nhập NVKD và DVKH, giữ token trong `setup()`, làm mới khi hết hạn | `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me` | P1 | http.js |
| 5 | `lib/factory.js` | Sinh MST 10 số không trùng, tên `K6-<runId>-<slot>-<seq>`, số hợp đồng, ngày ký, hiệu lực, hết hạn theo trạng thái muốn dựng | — | P0 | env.js |
| 6 | `lib/files.js` | Mở file mẫu dạng nhị phân, dựng multipart, part JSON có `Content-Type: application/json` | `POST /api/contracts`, `POST /api/contracts/{id}/annexes`, `POST /api/leads/import` | P0 | env.js |
| 7 | `lib/assertions.js` | Kiểm trạng thái mong đợi, mã lỗi 409 có `errorCode`, hằng đẳng thức import | — | P0 | http.js |
| 8 | `tools/gen-import-xlsx.js` | Sinh file `.xlsx` import đúng 13 cột và tiêu đề như file mẫu, kể cả bản 10.000 dòng | `GET /api/leads/import-template` | P1 | — |
| 9 | `lib/leads.js` | Hàm gọi nhóm Lead: tạo, sửa, đầu mối, tài liệu, ngưng, kích hoạt, chuyển, import, xuất, lịch sử | `POST /api/leads`, `GET /api/leads`, `GET /api/leads/{id}` | P0 | http.js, files.js |
| 10 | `lib/contracts.js` | Hàm gọi nhóm hợp đồng và hàm `createCustomerWithContract(status)` dựng khách hàng có HĐ `PENDING`, `ACTIVE` hoặc `EXPIRED` | `POST /api/contracts`, `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/extensions` | P0 | leads.js, factory.js |
| 11 | `lib/customers.js` | Hàm gọi nhóm khách hàng: danh sách, chi tiết, sửa, phân loại, hạn mức, đầu mối, chuyển người phụ trách | `GET /api/customers`, `POST /api/customers/{id}/transfer-account-manager` | P1 | http.js |
| 12 | `lib/notifications.js` | Thăm dò chuông và đo độ trễ từ lúc chuyển đến lúc thông báo xuất hiện (metric `notification_delay`) | `GET /api/notifications`, `GET /api/notifications/unread-count` | P2 | http.js |
| 13 | `setup/seed-fixtures.js` | Chạy một lần: kiểm tài khoản từng vai trò đăng nhập được, lấy ngành hàng và người phụ trách, chia slot, ghi `fixtures.json` | `GET /api/catalogues/industries`, `GET /api/leads/assignable-owners`, `GET /api/customers/assignable-managers` | P0 | auth.js |
| 14 | `flows/lead-to-customer.js` | Luồng lõi từ Lead đến khách hàng, có bước kiểm trạng thái sau upload | `POST /api/leads`, `POST /api/contracts` | P0 | leads.js, contracts.js, customers.js, assertions.js |
| 15 | `tests/smoke-all.js` | 1 VU chạy 1–3 lượt mỗi flow, kiểm trạng thái, gồm các API chỉ smoke (đổi mật khẩu, đăng xuất, import-template) | toàn bộ phạm vi | P0 | flows/lead-to-customer.js, sau đó thêm dần từng flow |
| 16 | `flows/contract-extend-edit.js` | Gia hạn HĐ `EXPIRED`, sửa điều khoản, thêm sửa xóa phụ lục, tải file | `POST /api/contracts/{id}/extensions`, `PUT /api/contracts/{id}`, `POST /api/contracts/{id}/annexes` | P0 | contracts.js, assertions.js |
| 17 | `flows/contract-resign-end.js` | Tái ký có và không chồng kỳ, hủy HĐ chờ, dừng khai thác | `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/cancel`, `POST /api/contracts/{id}/suspend` | P0 | contracts.js, customers.js |
| 18 | `flows/customer-handover.js` | Sửa khách hàng, phân loại, hạn mức, đầu mối, chuyển người phụ trách, đo độ trễ chuông | `POST /api/customers/{id}/transfer-account-manager`, `PUT /api/customers/{id}/tier` | P1 | customers.js, notifications.js |
| 19 | `flows/lead-maintain.js` | Đầu mối, tài liệu, sửa, ngưng, kích hoạt lại, chuyển Lead, đọc chuông | `POST /api/leads/{id}/transfer-owner`, `POST /api/leads/{id}/deactivate` | P1 | leads.js, notifications.js |
| 20 | `flows/browse-search.js` | Danh sách, tìm kiếm, lọc, chi tiết, ô số liệu, lịch sử trên dữ liệu lớn | `GET /api/leads`, `GET /api/customers`, `GET /api/contracts` | P1 | leads.js, customers.js, contracts.js |
| 21 | `flows/notifications-poll.js` | Thăm dò chuông định kỳ mỗi VU | `GET /api/notifications/unread-count` | P2 | notifications.js |
| 22 | `flows/file-io.js` | Xuất Excel và tải file hợp đồng, phụ lục, tài liệu thô | `GET /api/leads/export`, `GET /api/customers/export`, `GET /api/contracts/export` | P2 | leads.js, customers.js, contracts.js |
| 23 | `setup/seed-volume.js` | Nạp 10.000 Lead (import) và một phần chuyển thành khách hàng có HĐ để đo ngưỡng 2 giây | `POST /api/leads/import`, `POST /api/contracts` | P1 | gen-import-xlsx.js, contracts.js |
| 24 | `tests/load-mix.js` | Chạy đồng thời các scenario ở mục 4 với tỷ lệ trong `load-profile.json`, gắn ngưỡng | tất cả flow | P1 | toàn bộ flows, seed-volume.js, thresholds.js |
| 25 | `tests/stress-lead-mst-race.js` | Nhiều VU cùng tạo, sửa và import một MST; đúng một lượt thành công, còn lại 409 | `POST /api/leads`, `PUT /api/leads/{id}`, `POST /api/leads/import` | P0 | leads.js |
| 26 | `tests/stress-contract-upload-race.js` | Nhiều VU cùng upload HĐ đầu tiên cho một Lead; đúng một HĐ, một mã khách hàng | `POST /api/contracts` | P0 | contracts.js |
| 27 | `tests/stress-contract-state-race.js` | Nhiều VU cùng tái ký, gia hạn, dừng khai thác, hủy một HĐ; không có hai HĐ cùng `ACTIVE` | `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/extensions`, `PUT /api/contracts/{id}` | P0 | contracts.js |
| 28 | `tests/stress-transfer-race.js` | Nhiều VU cùng chuyển người phụ trách một Lead hoặc một khách hàng | `POST /api/leads/{id}/transfer-owner`, `POST /api/customers/{id}/transfer-account-manager` | P1 | leads.js, customers.js, notifications.js |
| 29 | `tests/stress-import-export.js` | Import file lớn và nhiều file đồng thời, xuất 10.000 dòng nhiều lượt | `POST /api/leads/import`, `GET /api/leads/export`, `GET /api/customers/export`, `GET /api/contracts/export` | P1 | leads.js, files.js, gen-import-xlsx.js |
| 30 | `tests/stress-browse-volume.js` | Tăng dần số người xem danh sách và tìm kiếm trên 10.000 bản ghi để tìm điểm gãy ngưỡng 2 giây | `GET /api/leads`, `GET /api/customers`, `GET /api/contracts` | P1 | browse-search.js, seed-volume.js |
| 31 | `tests/spike-login.js` | Tăng đột ngột số lượt đăng nhập đầu ca | `POST /api/auth/login`, `POST /api/auth/refresh` | P1 | auth.js |
| 32 | `tests/soak-mix.js` | Chạy dài một nửa tải mix, qua 00:00 để thấy batch đổi trạng thái; theo dõi bộ nhớ, kết nối, độ trễ thông báo | tất cả flow, `GET /api/contracts/{id}/history` | P2 | load-mix.js |

## 10. Dữ liệu test

- **Tài khoản theo vai trò:** NVKD ×2 và DVKH ×2 trở lên, mỗi VU hoặc slot dùng tài khoản riêng của vai trò. Email và mật khẩu đưa vào biến môi trường (`K6_NVKD_1_EMAIL`, `K6_NVKD_1_PASSWORD`, `K6_DVKH_1_EMAIL`, …), `data/accounts.example.json` chỉ ghi tên biến, không ghi mật khẩu.
- **Fixture:** ngành hàng, người phụ trách lấy từ API lúc `setup()`; `seed-volume.js` tạo 10.000 Lead (`Giả định` đúng mốc SRS dùng cho ngưỡng 2 giây).
- **`testRunId`:** `runId` dạng `yyMMddHHmm` gắn vào tên doanh nghiệp, ví dụ `K6-2610311000-3-0007`, dùng để lọc bằng `search` và để BE dọn.
- **MST:** chuỗi 10 số bắt đầu bằng `99`, 8 số còn lại ghép từ `runId`, VU và iteration; nhận 409 thì tăng bộ đếm và thử lại tối đa 3 lần. Riêng bài race MST dùng cố ý một MST chung.
- **File mẫu:** PDF dưới 200KB cho HĐ và phụ lục, một file tài liệu thô, `import-small.xlsx` 50 dòng. k6 không chạy được thư viện Excel nên file import sinh trước bằng Node rồi nạp bằng `open(..., 'b')`.
- **Trạng thái HĐ theo ý muốn:** chọn ngày hiệu lực và hết hạn lúc upload (tương lai cho `PENDING`, đang chạy cho `ACTIVE`, đã qua cho `EXPIRED` nhận ngay), không phải chờ batch 00:00.
- **Mock hoặc sandbox:** phạm vi này không gọi cổng thanh toán, email, SMS. Dịch vụ lưu file và hàng đợi thông báo dùng thật trên dev; cảnh báo Admin của batch không được kích hoạt.
- **Dọn dữ liệu:** không có API xóa. Lead chỉ ngưng hoạt động (MST vẫn bị giữ), HĐ chỉ hủy được khi `PENDING`, phụ lục và tài liệu thô xóa được. Dọn thật cần BE xóa theo tiền tố `K6-`.

## 11. Thứ tự triển khai

| Giai đoạn | Việc làm | Đầu ra chạy được |
| --- | --- | --- |
| 1. Nền | Viết `config/`, `lib/http.js`, `lib/auth.js`, `lib/factory.js`, `lib/files.js`, `lib/assertions.js` | `k6 run` đăng nhập 1 VU bằng cả hai vai trò và in ra tên tài khoản |
| 2. Dữ liệu chuẩn bị | Viết `tools/gen-import-xlsx.js`, `lib/leads.js`, `lib/contracts.js`, `lib/customers.js`, `lib/notifications.js`, `setup/seed-fixtures.js` | File `fixtures.json` có ngành hàng, người phụ trách, slot; một Lead và một HĐ mẫu tạo được bằng k6 |
| 3. Flow chính và smoke | Viết `flows/lead-to-customer.js` và `tests/smoke-all.js` gọi flow đó | Smoke 1 VU đi hết Lead → HĐ → khách hàng và qua bước kiểm trạng thái |
| 4. Các flow còn lại | Viết bốn flow nghiệp vụ còn lại, `browse-search`, `notifications-poll`, `file-io`; thêm vào smoke | Smoke chạy hết mọi API trong phạm vi một lượt, trừ batch 00:00 |
| 5. Dữ liệu lớn và load mix | Viết `setup/seed-volume.js`, `tests/load-mix.js`, cấu hình `load-profile.json` | Load mix chạy 10–15 phút với 10.000 bản ghi, ra báo cáo theo từng API |
| 6. Stress P0 và P1 | Viết năm bài `stress-*` theo thứ tự: MST, upload đôi, trạng thái hợp đồng, chuyển người phụ trách, import xuất, duyệt dữ liệu lớn | Mỗi bài cho kết luận đạt hoặc lỗi cụ thể về tranh chấp dữ liệu |
| 7. Spike và soak | Viết `tests/spike-login.js`, `tests/soak-mix.js` | Soak chạy qua 00:00 và ghi lại việc batch đổi trạng thái |

## 12. Điểm cần xác nhận

| Nội dung | Giả định hiện tại | Hỏi ai |
| --- | --- | --- |
| Số người dùng đồng thời và tốc độ từng vai trò | Giả định ở mục 4 (12 lượt/phút tạo Lead, 20 VU đọc, 30 VU thăm dò chuông) | PO hoặc BA, hoặc số liệu thật từ log vận hành |
| Số tài khoản test theo vai trò | Cần ít nhất 2 tài khoản NVKD và 2 DVKH (một để thao tác, một để nhận chuyển và kiểm tra 404); thêm tài khoản để chia slot | Quản trị hệ thống hoặc QA lead |
| Máy chạy k6 truy cập được môi trường dev | Chạy k6 trên máy của bạn hoặc máy trong mạng được phép; môi trường cloud của phiên này bị chặn tới `logx-api-dev.sonthanh.net.vn` (403) | DevOps, người quản lý môi trường dev |
| Cho phép nạp 10.000 Lead và tạo nhiều HĐ trên dev | Cho phép; dữ liệu mang tiền tố `K6-` | Lead BE, DevOps |
| Cách dọn dữ liệu test | Không có API xóa: Lead chỉ ngưng hoạt động (vẫn giữ MST), HĐ chỉ hủy được khi `PENDING`; giả định BE dọn bằng SQL theo tiền tố `K6-` | Lead BE |
| Dịch vụ lưu trữ file trên dev | Giả định là kho thật của môi trường dev, dùng file mẫu dưới 200KB để tránh đầy | Lead BE, DevOps |
| Ngưỡng thời gian | Lấy từ SRS: dưới 2 giây cho đọc, tìm kiếm, chi tiết; dưới 3 giây cho lưu HĐ; dưới 1 giây cho kiểm tra trùng MST. Các API khác `Giả định` p95 dưới 2 giây | PO hoặc BA |
| Kiểm thử batch 00:00 với 10.000 HĐ dưới 5 phút (BR-CTR-14) | Không đo được bằng k6 vì không có API kích hoạt; cần BE chạy batch trên dữ liệu seed hoặc chốt cách gọi | Lead BE |
| MST trùng với Lead đang ngưng | Hiện trả 409 như mọi trường hợp trùng (theo tài liệu API); bài race MST kỳ vọng đúng một 201 và còn lại 409 | BA |
| Thời hạn của access token và cơ chế khóa tài khoản khi đăng nhập sai | Giả định token đủ dài cho một lượt chạy; `lib/auth.js` làm mới khi gặp 401 | Lead BE |
| Tên tham số lọc lịch sử (`query`, `event`, `eventCode`) | Dùng `eventCode` và `page`, `perPage` như tài liệu API; chưa gọi lọc phức tạp | Lead BE |
| Màn upload HĐ gọi API nào để lấy DVKH nhận bàn giao | Dùng `GET /api/customers/assignable-managers`; chuyển sang `GET /api/contracts/assignable-managers` nếu BE xác nhận | Lead BE |
| File scan hợp đồng nhận PDF hay cả DOCX | Dùng PDF vì cả SRS và tài liệu API đều chấp nhận | BA |
