# AUTO TEST CASE — LogXPro: Nhà thầu, Hợp đồng nhà thầu, Lead, Khách hàng, Hợp đồng khách hàng

_Tạo lúc 2026-11-05 16:26 từ báo cáo API `BAO_CAO_API_PHAM_VI_TEST.md` (trích từ `BAO_CAO_API.md`) và SRS `SRS_LogXPro_ Lead-Hợp đồng-Khách hàng.md`, `SRS_LogXPro_Quản lý nhà thầu .md`, `SRS_LogXPro_Hợp đồng nhà thầu.md`; tham khảo `mới update/SRS_LogXPro_Giá mua đầu vào.md`, `mới update/SRS_LogXPro_Cấu Hình Đầu Mục Giá.md` cho đúng 1 case bảng giá dịch vụ._

## Tóm tắt

- Tổng **1021 case**: 943 case API (gồm 20 case luồng) và 78 case UI.
- Phạm vi: 88 API của 5 module, mỗi API có ít nhất 1 case Happy path. Đăng nhập chỉ dùng để lấy token, không test riêng.
- Giá mua đầu vào và Cấu hình đầu mục giá: chỉ có **1 case** `UI-VDRD-005` (tạo bảng giá mua cho nhà thầu vừa tạo rồi kiểm tra tab Bảng giá dịch vụ ở chi tiết nhà thầu). Không test riêng các API của 2 module này.
- Số case theo module: `CTR` 193, `CTV` 196, `CUS` 135, `FLOW-CTR` 6, `FLOW-LEAD` 7, `FLOW-VDR` 7, `LEAD` 219, `UI-COM` 4, `UI-CTR` 13, `UI-CTV` 10, `UI-CUS` 10, `UI-LEAD` 9, `UI-LEADF` 16, `UI-VDR` 8, `UI-VDRD` 8, `VDR` 180.
- Số case theo nhóm: Business rule 153, Authentication 93, Request validation 91, Error handling 89, Happy path 88, Response contract 88, Boundary 67, Ownership/IDOR 65, Data integrity 55, Idempotency 29, File API 28, Pagination/filter/sort 26, State transition 23, Form validation 21, Flow/end-to-end API 20, Thao tác form 11, Input security 10, Upload/download 10, Authorization 8, Hiển thị dữ liệu 8, Concurrency 6, Trạng thái UI 6, CRUD 5, Bảng danh sách 5, Thông báo 5, Phân quyền UI 3, Hiển thị trang 2, Điều hướng 2, Session 1, Responsive 1, Accessibility 1, Visual regression 1.
- 8 mục UI: Danh sách Lead; Thêm mới và chi tiết Lead; Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng; Danh sách và chi tiết khách hàng; Danh sách và thêm mới nhà thầu; Chi tiết nhà thầu; Thêm và chi tiết hợp đồng nhà thầu; Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module. Các case UI biên và phân vùng tương đương (gộp từ bản bổ sung UI ngày 2026-11-05) ghi mỗi dòng là một nhóm biến thể; khi đưa vào bộ chạy, mỗi biến thể là một lần chạy riêng theo ID + trường + giá trị, giữ các trường khác hợp lệ.
- Ký hiệu dữ liệu (`tokenNVKD`, Lead A, HĐ P...) giải thích ở mục **Dữ liệu cần chuẩn bị**. Mã HTTP dạng `400/409` nghĩa là chấp nhận một trong các mã, điều kiện quyết định là `errorCode` và dữ liệu sau khi gọi.

## API: Danh sách, tìm kiếm, lọc Lead

**API chính:** `GET /api/leads`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Chỉ trả Lead user phụ trách, mới nhất trước, tìm và lọc đúng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-001 | Happy path | NVKD xem danh sách Lead của mình | `tokenNVKD`; NVKD A có 3 Lead tạo lần lượt | `page=1`, `perPage=20` | Gọi `GET /api/leads` | `200` | Trả đủ 3 Lead; Lead tạo sau đứng trước (BR-LEAD-14); `ownerUserId` của mọi dòng là NVKD A | P1 | Có |
| LEAD-002 | Business rule | Không thấy Lead của NVKD khác | `tokenNVKD`; NVKD B có Lead B | Không lọc | NVKD A gọi `GET /api/leads` → tìm theo mã Lead B | `200` | Không có Lead B trong kết quả (BR-LEAD-13); tổng `meta.pagination` không tính Lead B | P1 | Có |
| LEAD-003 | Pagination/filter/sort | Tìm khớp một phần theo tên, mã, MST, tên đầu mối | `tokenNVKD`; Lead A tên `Công ty Test Alpha`, đầu mối `Nguyễn Văn Test` | Lần lượt `search`=`Alpha`, 4 số cuối mã, 5 số đầu MST, `Văn Test` | Gọi `GET /api/leads` với từng từ khóa | `200` | Cả 4 lần đều trả Lead A (BR-LEAD-15); từ khóa không khớp trả danh sách rỗng, không lỗi | P2 | Có |
| LEAD-004 | Pagination/filter/sort | Lọc nhiều giá trị `status`, `source`, `industryId`, `route`, khoảng ngày tạo | `tokenNVKD`; có Lead `ACTIVE`, `INACTIVE`, `CONVERTED`, nhiều nguồn | `status=ACTIVE&status=INACTIVE`; `source=REFERRAL`; `createdFrom`=`createdTo`=hôm nay | Gọi `GET /api/leads` với từng bộ lọc rồi kết hợp | `200` | Chỉ trả Lead khớp mọi điều kiện; lọc 2 trạng thái trả hợp của 2 trạng thái; Lead `CONVERTED` không lẫn vào | P2 | Có |
| LEAD-005 | Pagination/filter/sort | Phân trang không trùng, không sót | `tokenNVKD`; NVKD A có 25 Lead | `perPage=10`, `page`=1, 2, 3 | Gọi `GET /api/leads` 3 lần | `200` | Trang 1, 2 có 10 dòng, trang 3 có 5; không có id lặp giữa các trang; `meta.pagination.total`=25 | P2 | Có |
| LEAD-006 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenNVKD` | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/leads` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| LEAD-007 | Request validation | Giá trị lọc sai kiểu | `tokenNVKD` | Lần lượt `status=ABC`; `industryId=abc`; `createdFrom=2026-13-01` | Gọi `GET /api/leads` | `400` | errorCode `validation-failed`; không trả `5xx` | P3 | Có |
| LEAD-008 | Response contract | Response đúng schema Swagger | `tokenNVKD` | Request hợp lệ | Gọi `GET /api/leads` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng Lead (`id`, `code` dạng `LED-XXXX`, `companyName`, `taxCode`, `status`, người phụ trách, ngày tạo) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-009 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `GET /api/leads` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| LEAD-010 | Authentication | Token sai chữ ký, hết hạn hoặc là refresh token | `tokenNVKD` | 3 lần gọi: token sửa 1 ký tự; token hết hạn; `Bearer` + refresh token hợp lệ | Gọi `GET /api/leads` lần lượt với 3 token | `401` | Cả 3 lần trả errorCode `authentication-failed` hoặc `authentication-required`; không trả dữ liệu | P1 | Có |
| LEAD-011 | Input security | Chuỗi tấn công trong `search` | `tokenNVKD` | `search` = `' OR 1=1 --` rồi `%` | Gọi `GET /api/leads` | `200/400` | Không trả Lead ngoài phạm vi NVKD A; không trả `5xx`; không lộ câu lệnh SQL | P2 | Có |
| LEAD-012 | Authorization | Role không thuộc kinh doanh xem danh sách Lead | `tokenQLNT` | Không lọc | QLNT gọi `GET /api/leads` | `403` | errorCode `access-denied`; không trả Lead (giả định role, xem Điểm cần xác nhận) | P2 | Có |
| LEAD-013 | Error handling | Gửi sai phương thức HTTP | `tokenNVKD` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/leads` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Tạo Lead

**API chính:** `POST /api/leads`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Tạo Lead `ACTIVE` mã LED-XXXX, đủ validate, chặn trùng MST.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-014 | Happy path | Tạo Lead đủ trường bắt buộc | `tokenNVKD` | `companyName`, `taxCode` 10 số mới, `industryIds` 1 ngành, `route`=`DOMESTIC`, `source`=`REFERRAL`, `ownerUserId`=NVKD A, `contacts` 1 người (`fullName`, `phone`=`0912345678`) | Gọi `POST /api/leads` → `GET /api/leads/{id}` | `200/201` | `code` khớp `^LED-\d{4}$`; trạng thái `ACTIVE`; đầu mối duy nhất là đầu mối chính (BR-LEAD-03); dữ liệu GET khớp body | P1 | Có |
| LEAD-015 | State transition | Lead mới luôn ở trạng thái Đang hoạt động | `tokenNVKD` | `companyName`, `taxCode` 10 số mới, `industryIds` 1 ngành, `route`=`DOMESTIC`, `source`=`REFERRAL`, `ownerUserId`=NVKD A, `contacts` 1 người (`fullName`, `phone`=`0912345678`); thêm `status`=`INACTIVE` vào body | Gọi `POST /api/leads` | `200/201` | Lead tạo ra `ACTIVE`, field `status` gửi kèm bị bỏ qua | P1 | Có |
| LEAD-016 | Request validation | Thiếu từng trường bắt buộc | `tokenNVKD` | Mỗi lần bỏ 1 trường: `companyName`, `taxCode`, `industryIds`, `route`, `source`, `ownerUserId`, `contacts` | Gọi `POST /api/leads` 7 lần | `400` | Mỗi lần errorCode `validation-failed` và chỉ ra đúng trường thiếu; không tạo Lead | P1 | Có |
| LEAD-017 | Request validation | Sai định dạng MST, SĐT, email, website, enum | `tokenNVKD` | Lần lượt `taxCode`=`12345abcde`; `phone`=`12345`; `email`=`abc@`; `website`=`abc`; `route`=`SEA` | Gọi `POST /api/leads` 5 lần | `400` | errorCode `validation-failed` đúng trường; không tạo Lead | P2 | Có |
| LEAD-018 | Request validation | `contacts` rỗng, `industryIds` rỗng | `tokenNVKD` | `contacts`=[]; sau đó `industryIds`=[] | Gọi `POST /api/leads` 2 lần | `400` | errorCode `validation-failed`; Lead phải có ít nhất 1 đầu mối và 1 ngành hàng | P2 | Có |
| LEAD-019 | Boundary | MST 10 và 13 số hợp lệ; 9, 11, 14 số bị chặn | `tokenNVKD` | `taxCode` dài 9, 10, 11, 13, 14 số (MST mới) | Gọi `POST /api/leads` 5 lần | `200/201/400` | 10 và 13 số tạo được; 9, 11, 14 số trả `400` | P1 | Có |
| LEAD-020 | Boundary | Độ dài `companyName` 255/256, `initialNote` 500/501, `fullName` 100/101 | `tokenNVKD` | Chuỗi đúng độ dài biên | Gọi `POST /api/leads` 6 lần | `200/201/400` | Đúng max tạo được và lưu đủ ký tự; vượt 1 ký tự trả `400` | P2 | Có |
| LEAD-021 | Boundary | SĐT đầu mối ở biên pattern Swagger (0 hoặc +84 rồi 9–10 chữ số) | `tokenNVKD` | `0` + 9 số; `0` + 10 số; `+84` + 9 số; `0` + 8 số; `0` + 11 số | Gọi `POST /api/leads` 5 lần | `200/201/400` | 3 giá trị đầu hợp lệ; 2 giá trị sau trả `400` | P2 | Có |
| LEAD-022 | Business rule | MST đã thuộc Lead khác | `tokenNVKD`; Lead X có MST `M1` | Body hợp lệ với `taxCode`=`M1` | Gọi `POST /api/leads` | `409` | errorCode `domain-rule-violation` hoặc lỗi trùng; không tạo Lead mới | P1 | Có |
| LEAD-023 | Business rule | MST đã thuộc khách hàng chính thức | `tokenNVKD`; KH có MST `M2` (Lead đã chuyển đổi) | `taxCode`=`M2` | Gọi `POST /api/leads` | `409` | Bị chặn; không tạo Lead | P1 | Có |
| LEAD-024 | Business rule | Gửi 2 đầu mối cùng `primary`=true | `tokenNVKD` | `contacts` 2 người đều `primary`=true | Gọi `POST /api/leads` → `GET /api/leads/{id}` | `200/201/400` | Nếu tạo được thì đúng 1 đầu mối chính (BR-LEAD-03); không bao giờ có 2 đầu mối chính | P2 | Có |
| LEAD-025 | Business rule | Giao người phụ trách khác người tạo | `tokenNVKD`; NVKD B đang hoạt động | `companyName`, `taxCode` 10 số mới, `industryIds` 1 ngành, `route`=`DOMESTIC`, `source`=`REFERRAL`, `ownerUserId`=NVKD B, `contacts` 1 người (`fullName`, `phone`=`0912345678`) | NVKD A gọi `POST /api/leads` → NVKD B xem thông báo | `200/201` | Lead thuộc NVKD B; NVKD B nhận notification (BR-LEAD-02); NVKD A không thấy Lead trong danh sách của mình | P2 | Có |
| LEAD-026 | Business rule | `ownerUserId` không phải NVKD đang hoạt động | `tokenNVKD`; tài khoản NVKD bị khóa; tài khoản DVKH | `ownerUserId` lần lượt = tài khoản khóa, tài khoản DVKH | Gọi `POST /api/leads` 2 lần | `400/409` | Bị chặn (BR-LEAD-24); không tạo Lead | P2 | Có |
| LEAD-027 | Data integrity | Request lỗi không để lại dữ liệu | `tokenNVKD` | Body có `phone` sai ở đầu mối thứ 2 | Gọi `POST /api/leads` → gọi lại với body đúng cùng MST | `400` rồi `200/201` | Lần 1 không tạo Lead hay đầu mối nào; lần 2 tạo được với cùng MST | P1 | Có |
| LEAD-028 | Idempotency | Gửi lại cùng request | `tokenNVKD` | `companyName`, `taxCode` 10 số mới, `industryIds` 1 ngành, `route`=`DOMESTIC`, `source`=`REFERRAL`, `ownerUserId`=NVKD A, `contacts` 1 người (`fullName`, `phone`=`0912345678`) | Gọi `POST /api/leads` 2 lần liên tiếp | `200/201` rồi `409` | Chỉ 1 Lead với MST đó | P2 | Có |
| LEAD-029 | Concurrency | 2 request cùng MST gửi đồng thời | `tokenNVKD` | 2 body giống nhau, cùng MST mới | Gọi `POST /api/leads` song song 2 luồng | `200/201` và `409` | Đúng 1 Lead được tạo; không có 2 Lead trùng MST | P2 | Có |
| LEAD-030 | Input security | Payload XSS trong tên công ty | `tokenNVKD` | `companyName` = chuỗi thẻ script `xssPayload` | Gọi `POST /api/leads` → `GET /api/leads/{id}` | `200/201/400` | Nếu lưu thì trả về nguyên văn dạng text; màn hình hiển thị đã escape, không chạy script | P2 | Có |
| LEAD-031 | Response contract | Response đúng schema Swagger | `tokenNVKD` | Request hợp lệ | Gọi `POST /api/leads` → so response với schema Swagger | `200/201` | Wrapper `success`=true, `errorCode` rỗng; `data` có `id`, `code`, `companyName`, `taxCode`, `status`, người phụ trách, `contacts` (có `primary`); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-032 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `POST /api/leads` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| LEAD-033 | Authorization | Role không phải NVKD tạo Lead | `tokenQLNT` | `companyName`, `taxCode` 10 số mới, `industryIds` 1 ngành, `route`=`DOMESTIC`, `source`=`REFERRAL`, `ownerUserId`=NVKD A, `contacts` 1 người (`fullName`, `phone`=`0912345678`) | QLNT gọi `POST /api/leads` | `403` | errorCode `access-denied`; không tạo Lead (giả định role) | P2 | Có |
| LEAD-034 | Error handling | Body JSON sai cú pháp | `tokenNVKD` | Body `{"name": ` (thiếu dấu đóng) | Gọi `POST /api/leads` với body hỏng | `400` | errorCode `malformed-request`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không ghi dữ liệu | P3 | Có |
| LEAD-035 | Business rule | Chọn ngành Khác bắt buộc nhập tên ngành | `tokenNVKD` | `companyName`, `taxCode` 10 số mới, `industryIds` = [id ngành Khác], `route`=`DOMESTIC`, `source`=`REFERRAL`, `ownerUserId`=NVKD A, `contacts` 1 người (`fullName`, `phone`=`0912345678`); lần 1 không có `industryOther`; lần 2 `industryOther`=`Gốm sứ` | Gọi `POST /api/leads` 2 lần → `GET /api/leads/{id}` | `400` rồi `200/201` | Lần 1 bị chặn ở `industryOther`; lần 2 lưu ngành Khác kèm `Gốm sứ` | P1 | Có |
| LEAD-036 | Boundary | `industryOther` 255/256 ký tự khi chọn Khác | `tokenNVKD` | `industryIds` = [ngành Khác], `industryOther` dài 255 rồi 256 | Gọi `POST /api/leads` 2 lần | `200/201/400` | 255 lưu đủ; 256 trả `400` | P3 | Có |
| LEAD-037 | Business rule | Gửi `industryOther` khi không chọn Khác | `tokenNVKD` | `companyName`, `taxCode` 10 số mới, `industryIds` 1 ngành, `route`=`DOMESTIC`, `source`=`REFERRAL`, `ownerUserId`=NVKD A, `contacts` 1 người (`fullName`, `phone`=`0912345678`); `industryOther`=`Gốm sứ` | Gọi `POST /api/leads` → `GET /api/leads/{id}` | `200/201/400` | Không lưu `industryOther` hoặc bị chặn; không hiển thị ngành Khác khi chưa chọn | P3 | Có |
| LEAD-038 | Business rule | MST trùng Lead đang Ngưng hoạt động | `tokenNVKD`; Lead Y `INACTIVE` của NVKD B có MST `M3` | `companyName`, `taxCode` 10 số mới, `industryIds` 1 ngành, `route`=`DOMESTIC`, `source`=`REFERRAL`, `ownerUserId`=NVKD A, `contacts` 1 người (`fullName`, `phone`=`0912345678`); `taxCode`=`M3` | NVKD A gọi `POST /api/leads` → `GET /api/leads/{id}` (Lead Y) | `409` | Bị chặn vì MST không được trùng ở bất kỳ trạng thái nào (đã xác nhận với người dùng 2026-11-04); không tạo Lead mới; Lead Y vẫn `INACTIVE`, người phụ trách vẫn NVKD B | P1 | Có |
| LEAD-039 | Business rule | MST trùng Lead đã chuyển đổi hoặc Lead đang hoạt động của người khác | `tokenNVKD`; Lead `CONVERTED` có MST `M4`; Lead `ACTIVE` của NVKD B có MST `M5` | `companyName`, `taxCode` 10 số mới, `industryIds` 1 ngành, `route`=`DOMESTIC`, `source`=`REFERRAL`, `ownerUserId`=NVKD A, `contacts` 1 người (`fullName`, `phone`=`0912345678`); `taxCode` lần lượt `M4`, `M5` | NVKD A gọi `POST /api/leads` 2 lần | `409` | Cả 2 lần bị chặn; không tạo Lead; Lead cũ không đổi người phụ trách | P1 | Có |

## API: Danh sách người phụ trách Lead

**API chính:** `GET /api/leads/assignable-owners`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Chỉ trả NVKD đang hoạt động.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-040 | Happy path | Lấy danh sách người phụ trách | `tokenNVKD` | Không tham số | Gọi `GET /api/leads/assignable-owners` | `200` | Có NVKD A và NVKD B; mỗi dòng có id, họ tên, email | P2 | Có |
| LEAD-041 | Business rule | Loại tài khoản khóa và role khác | `tokenNVKD`; 1 NVKD bị khóa; 1 tài khoản DVKH | Không tham số | Gọi `GET /api/leads/assignable-owners` | `200` | Không có tài khoản bị khóa (BR-LEAD-24) và không có tài khoản DVKH | P2 | Có |
| LEAD-042 | Response contract | Response đúng schema Swagger | `tokenNVKD` | Request hợp lệ | Gọi `GET /api/leads/assignable-owners` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng người dùng (`id`, họ tên, email); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-043 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `GET /api/leads/assignable-owners` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| LEAD-044 | Error handling | Gửi sai phương thức HTTP | `tokenNVKD` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/leads/assignable-owners` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Xuất danh sách Lead ra Excel

**API chính:** `GET /api/leads/export`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** File Excel đúng dữ liệu đang lọc và chỉ Lead của mình.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-045 | Happy path | Xuất Excel theo bộ lọc | `tokenNVKD`; NVKD A có 3 Lead `ACTIVE`, 1 `INACTIVE` | `status=ACTIVE` | Gọi `GET /api/leads/export` → mở file | `200` | File có đúng 3 dòng dữ liệu `ACTIVE`, khớp kết quả `GET /api/leads` cùng bộ lọc | P2 | Có |
| LEAD-046 | File API | Định dạng file xuất | `tokenNVKD`; có dữ liệu | Không lọc | Gọi `GET /api/leads/export` → đọc header và mở file | `200` | `Content-Type` là spreadsheetml; tên file đuôi `.xlsx`; mở được, có dòng tiêu đề cột | P2 | Có |
| LEAD-047 | Business rule | Không xuất Lead của NVKD khác | `tokenNVKD`; NVKD B có Lead B | Không lọc | NVKD A gọi `GET /api/leads/export` | `200` | File không có Lead B (BR-LEAD-18) | P1 | Có |
| LEAD-048 | Business rule | Bộ lọc không có dữ liệu | `tokenNVKD` | `search`=`khong-ton-tai-xyz` | Gọi `GET /api/leads/export` | `400` | Trả lỗi không có dữ liệu để xuất; không trả file rỗng | P2 | Có |
| LEAD-049 | Pagination/filter/sort | Xuất kết hợp nhiều bộ lọc | `tokenNVKD` | `status=ACTIVE&source=REFERRAL&createdFrom=...&createdTo=...` | Gọi `GET /api/leads/export` | `200` | File chỉ có Lead khớp mọi điều kiện, không giới hạn theo trang | P3 | Có |
| LEAD-050 | Boundary | Khoảng ngày tạo một ngày | `tokenNVKD`; Lead tạo hôm nay | `createdFrom`=`createdTo`=hôm nay | Gọi `GET /api/leads/export` | `200` | File có Lead tạo hôm nay (khoảng ngày tính cả 2 đầu) | P3 | Có |
| LEAD-051 | Request validation | Tham số lọc sai | `tokenNVKD` | `status=ABC` | Gọi `GET /api/leads/export` | `400` | errorCode `validation-failed` | P3 | Có |
| LEAD-052 | Response contract | Response đúng schema Swagger | `tokenNVKD` | Request hợp lệ | Gọi `GET /api/leads/export` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân xlsx (không bọc wrapper JSON); khi lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| LEAD-053 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `GET /api/leads/export` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| LEAD-054 | Error handling | Gửi sai phương thức HTTP | `tokenNVKD` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/leads/export` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Import Lead từ Excel

**API chính:** `POST /api/leads/import`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Nhập dòng hợp lệ, bỏ dòng lỗi và báo kết quả từng dòng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-055 | Happy path | Import file 3 dòng hợp lệ | `tokenNVKD` | File `.xlsx` theo template, 3 dòng MST mới | Gọi `POST /api/leads/import` → `GET /api/leads` | `200` | Kết quả báo 3 thành công; 3 Lead mới, người phụ trách là user import (BR-LEAD-17), nguồn `IMPORT` | P1 | Có |
| LEAD-056 | State transition | Lead import ở trạng thái Đang hoạt động | `tokenNVKD` | File 1 dòng hợp lệ | Gọi `POST /api/leads/import` → xem Lead vừa nhập | `200` | Lead `ACTIVE`, `source`=`IMPORT` | P2 | Có |
| LEAD-057 | Business rule | Bỏ qua dòng lỗi và dòng trùng MST | `tokenNVKD`; MST `M1` đã có Lead | File 4 dòng: 2 hợp lệ, 1 trùng `M1`, 1 thiếu tên công ty | Gọi `POST /api/leads/import` | `200` | Nhập 2 dòng; 2 dòng còn lại báo lỗi kèm số dòng và lý do (BR-LEAD-16) | P1 | Có |
| LEAD-058 | Business rule | Hai dòng trùng MST trong cùng file | `tokenNVKD` | File 2 dòng cùng MST mới | Gọi `POST /api/leads/import` | `200` | Chỉ 1 dòng được nhập, dòng còn lại báo trùng | P2 | Có |
| LEAD-059 | File API | File sai định dạng hoặc sai cấu trúc cột | `tokenNVKD` | Lần lượt file `.csv`; file `.pdf`; `.xlsx` thiếu cột MST | Gọi `POST /api/leads/import` 3 lần | `400` | Lỗi cấp file, không nhập dòng nào | P2 | Có |
| LEAD-060 | Boundary | File chỉ có dòng tiêu đề và file 1 dòng | `tokenNVKD` | File 0 dòng dữ liệu; file 1 dòng | Gọi `POST /api/leads/import` 2 lần | `200/400` | File 0 dòng báo không có dữ liệu, không tạo Lead; file 1 dòng tạo 1 Lead | P3 | Có |
| LEAD-061 | Request validation | Không gửi file | `tokenNVKD` | Multipart không có `file` | Gọi `POST /api/leads/import` | `400` | errorCode `validation-failed` hoặc `malformed-request` | P2 | Có |
| LEAD-062 | Data integrity | Lỗi cấp file không nhập dòng nào | `tokenNVKD` | `.xlsx` sai template nhưng có 2 dòng nhìn như hợp lệ | Gọi `POST /api/leads/import` → `GET /api/leads` | `400` | Số Lead không đổi | P1 | Có |
| LEAD-063 | Idempotency | Import lại cùng file | `tokenNVKD`; đã import thành công file F | File F | Gọi `POST /api/leads/import` lần 2 | `200` | Mọi dòng báo trùng MST; không tạo thêm Lead | P2 | Có |
| LEAD-064 | Input security | Ô Excel chứa công thức hoặc script | `tokenNVKD` | Tên công ty = `=HYPERLINK(...)` và chuỗi `xssPayload` | Gọi `POST /api/leads/import` → xem Lead | `200` | Lưu dạng text thuần; file xuất sau đó không chạy công thức | P3 | Có |
| LEAD-065 | Error handling | File hỏng đổi đuôi `.xlsx` | `tokenNVKD` | File text đổi tên thành `.xlsx` | Gọi `POST /api/leads/import` | `400` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |
| LEAD-066 | Response contract | Response đúng schema Swagger | `tokenNVKD` | Request hợp lệ | Gọi `POST /api/leads/import` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có số dòng thành công/lỗi và danh sách kết quả từng dòng (số dòng, trạng thái, lý do); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-067 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `POST /api/leads/import` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| LEAD-068 | Business rule | Toàn bộ dòng trong file đều lỗi | `tokenNVKD`; MST `M1` đã có Lead | File đúng template, 3 dòng: thiếu tên công ty; MST 9 số; MST `M1` | Gọi `POST /api/leads/import` → `GET /api/leads` | `200/400` | Kết quả báo 0 thành công, 3 lỗi kèm số dòng và lý do; số Lead không đổi; không ghi Lead nửa vời | P1 | Có |

## API: Tải file mẫu import Lead

**API chính:** `GET /api/leads/import-template`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Trả file mẫu đúng cấu trúc import.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-069 | Happy path | Tải file mẫu | `tokenNVKD` | Không tham số | Gọi `GET /api/leads/import-template` | `200` | Trả file mẫu có đúng các cột mà API import yêu cầu | P3 | Có |
| LEAD-070 | File API | File mẫu là xlsx có sheet danh mục | `tokenNVKD` | Không tham số | Gọi `GET /api/leads/import-template` → mở file | `200` | Đuôi `.xlsx`, `Content-Type` spreadsheetml; có sheet danh mục ngành hàng, tuyến, nguồn | P3 | Có |
| LEAD-071 | File API | File mẫu import ngược lại được | `tokenNVKD` | File mẫu điền 1 dòng hợp lệ | Gọi `GET /api/leads/import-template` → điền dữ liệu → `POST /api/leads/import` | `200` | Import thành công 1 dòng | P2 | Có |
| LEAD-072 | Response contract | Response đúng schema Swagger | `tokenNVKD` | Request hợp lệ | Gọi `GET /api/leads/import-template` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân xlsx, không bọc wrapper JSON; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| LEAD-073 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `GET /api/leads/import-template` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P3 | Có |
| LEAD-074 | Error handling | Gửi sai phương thức HTTP | `tokenNVKD` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/leads/import-template` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Số liệu tổng quan Lead

**API chính:** `GET /api/leads/stats`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Số liệu khớp danh sách Lead của user.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-075 | Happy path | Xem số liệu tổng quan | `tokenNVKD` | Không tham số | Gọi `GET /api/leads/stats` | `200` | Có tổng, Đang hoạt động, Ngưng hoạt động, Đã chuyển đổi; tổng = 3 số còn lại cộng lại | P2 | Có |
| LEAD-076 | Business rule | Số liệu đổi theo thao tác | `tokenNVKD` | Ghi nhận số liệu ban đầu | Gọi `GET /api/leads/stats` → tạo 1 Lead → ngưng 1 Lead → gọi lại `GET /api/leads/stats` | `200` | Tổng +1; Ngưng hoạt động +1; Đang hoạt động không đổi (+1 −1) | P2 | Có |
| LEAD-077 | Business rule | Chỉ tính Lead trong phạm vi user | `tokenNVKD`; NVKD B có Lead | Không tham số | So `GET /api/leads/stats` với tổng của `GET /api/leads` | `200` | Tổng bằng `meta.pagination.total` của danh sách NVKD A | P2 | Có |
| LEAD-078 | Response contract | Response đúng schema Swagger | `tokenNVKD` | Request hợp lệ | Gọi `GET /api/leads/stats` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có 4 số đếm kiểu số nguyên không âm; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-079 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `GET /api/leads/stats` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P3 | Có |
| LEAD-080 | Error handling | Gửi sai phương thức HTTP | `tokenNVKD` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/leads/stats` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Chi tiết Lead

**API chính:** `GET /api/leads/{id}`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Trả đúng chi tiết theo trạng thái, không lộ Lead ngoài phạm vi.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-081 | Happy path | Xem chi tiết Lead đang hoạt động | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | id Lead A | Gọi `GET /api/leads/{id}` | `200` | Có thông tin công ty, ngành hàng, đầu mối, tài liệu; trạng thái `ACTIVE` | P1 | Có |
| LEAD-082 | Business rule | Lead Ngưng hoạt động có lý do | `tokenNVKD`; Lead đã ngưng với lý do `R1` | id Lead đó | Gọi `GET /api/leads/{id}` | `200` | Trạng thái `INACTIVE`, trả lý do `R1` | P2 | Có |
| LEAD-083 | Business rule | Lead đã chuyển đổi chỉ đọc | `tokenNVKD`; Lead đã `CONVERTED` | id Lead đó | Gọi `GET /api/leads/{id}` | `200` | Trạng thái `CONVERTED`; không trả đầu mối (BR-LEAD-06); không có thao tác sửa | P2 | Có |
| LEAD-084 | Ownership/IDOR | NVKD khác xem Lead A | `tokenNVKD_B` (NVKD khác, không phụ trách Lead A) | id Lead A | Gọi `GET /api/leads/{id}` | `403/404` | Không trả dữ liệu Lead A | P1 | Có |
| LEAD-085 | Request validation | `id` sai định dạng UUID | `tokenNVKD` | `id` = `abc` | Gọi `GET /api/leads/{id}` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| LEAD-086 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `GET /api/leads/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có `id`, `code`, thông tin công ty, `industryIds`, `route`, `source`, `status`, `contacts`, `documents`, người phụ trách; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-087 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `GET /api/leads/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| LEAD-088 | Error handling | Lead không tồn tại | `tokenNVKD` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/leads/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Sửa thông tin Lead

**API chính:** `PUT /api/leads/{id}`  
**Role hợp lệ:** NVKD (người phụ trách Lead)  
**Mục tiêu:** Chỉ người phụ trách sửa Lead đang hoạt động, có ghi lịch sử.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-089 | Happy path | Sửa tên công ty và địa chỉ | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `companyName` mới, `industryIds`, `route`, `source`, `headOfficeAddress` mới | Gọi `PUT /api/leads/{id}` → `GET /api/leads/{id}` | `200` | Dữ liệu GET khớp giá trị mới; các trường không gửi giữ nguyên | P1 | Có |
| LEAD-090 | State transition | Sửa không đổi trạng thái | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `companyName` mới, `industryIds`, `route`, `source` | Gọi `PUT /api/leads/{id}` | `200` | Lead vẫn `ACTIVE` | P2 | Có |
| LEAD-091 | Request validation | Thiếu trường bắt buộc, sai định dạng | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Lần lượt bỏ `companyName`; `industryIds`=[]; `website`=`abc`; `taxCode`=`123` | Gọi `PUT /api/leads/{id}` 4 lần | `400` | errorCode `validation-failed`; Lead không đổi | P2 | Có |
| LEAD-092 | Boundary | `companyName` 255/256, `headOfficeAddress` 500/501 | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Chuỗi đúng độ dài biên | Gọi `PUT /api/leads/{id}` 4 lần | `200/400` | Đúng max lưu đủ; vượt 1 ký tự trả `400` | P3 | Có |
| LEAD-093 | Business rule | Sửa Lead Ngưng hoạt động hoặc Đã chuyển đổi | `tokenNVKD`; Lead `INACTIVE`; Lead `CONVERTED` | `companyName` mới, `industryIds`, `route`, `source` | Gọi `PUT /api/leads/{id}` cho từng Lead | `400/409` | errorCode `domain-rule-violation` (BR-LEAD-10, BR-LEAD-06); dữ liệu không đổi | P1 | Có |
| LEAD-094 | Business rule | Đổi MST trùng Lead hoặc KH khác | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; Lead X có MST `M1` | `companyName` mới, `industryIds`, `route`, `source`, `taxCode`=`M1` | Gọi `PUT /api/leads/{id}` | `409` | Bị chặn; MST Lead A giữ nguyên | P1 | Có |
| LEAD-095 | Business rule | Không đổi người phụ trách qua API sửa | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `companyName` mới, `industryIds`, `route`, `source`, thêm `ownerUserId`=NVKD B | Gọi `PUT /api/leads/{id}` → `GET /api/leads/{id}` | `200/400` | Người phụ trách vẫn là NVKD A | P2 | Có |
| LEAD-096 | Ownership/IDOR | NVKD khác sửa Lead A | `tokenNVKD_B` (NVKD khác, không phụ trách Lead A) | `companyName` mới, `industryIds`, `route`, `source` | Gọi `PUT /api/leads/{id}` với id Lead A | `403/404` | Lead A không đổi | P1 | Có |
| LEAD-097 | Data integrity | Ghi lịch sử giá trị cũ và mới | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Đổi `companyName` từ `X` sang `Y` | Gọi `PUT /api/leads/{id}` → `GET /api/leads/{id}/history` | `200` | Có 1 dòng sửa ghi `X` → `Y`, người sửa NVKD A | P2 | Có |
| LEAD-098 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `PUT /api/leads/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có Lead sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-099 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `PUT /api/leads/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| LEAD-100 | Error handling | Lead không tồn tại | `tokenNVKD` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/leads/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| LEAD-101 | Business rule | Giữ nguyên MST của chính Lead khi sửa | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `companyName` mới, `industryIds`, `route`, `source`, `taxCode` = MST hiện tại của Lead A | Gọi `PUT /api/leads/{id}` | `200` | Không báo trùng vì loại trừ chính bản ghi đang sửa (BR-LEAD-01) | P1 | Có |
| LEAD-102 | Business rule | Đổi MST trùng Lead Ngưng hoạt động | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; Lead Y `INACTIVE` có MST `M3` | `companyName` mới, `industryIds`, `route`, `source`, `taxCode`=`M3` | Gọi `PUT /api/leads/{id}` | `409` | Bị chặn vì khi sửa MST kiểm trùng Lead mọi trạng thái; MST Lead A giữ nguyên | P1 | Có |
| LEAD-103 | Business rule | Đổi MST trùng khách hàng chính thức | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; KH có MST `M2` | `companyName` mới, `industryIds`, `route`, `source`, `taxCode`=`M2` | Gọi `PUT /api/leads/{id}` | `409` | Bị chặn; MST Lead A giữ nguyên | P1 | Có |
| LEAD-104 | Business rule | Đổi MST sang giá trị mới hợp lệ | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `companyName` mới, `industryIds`, `route`, `source`, `taxCode` 13 số chưa tồn tại | Gọi `PUT /api/leads/{id}` → `POST /api/leads` với MST cũ của Lead A | `200` rồi `200/201` | MST mới được lưu; MST cũ được giải phóng nên tạo Lead mới với MST cũ thành công | P2 | Có |
| LEAD-105 | Business rule | Sửa ngành sang Khác thiếu tên ngành | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `companyName` mới, `industryIds` = [ngành Khác], `route`, `source`, không có `industryOther` | Gọi `PUT /api/leads/{id}` | `400` | Bị chặn ở `industryOther`; ngành hàng giữ nguyên | P2 | Có |

## API: Thêm đầu mối liên hệ Lead

**API chính:** `POST /api/leads/{id}/contacts`  
**Role hợp lệ:** NVKD (người phụ trách Lead)  
**Mục tiêu:** Thêm đầu mối hợp lệ và giữ đúng 1 đầu mối chính.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-106 | Happy path | Thêm đầu mối mới | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `fullName`=`Đầu mối 2`, `phone`=`0987654321`, `email`=`dm2@test.vn` | Gọi `POST /api/leads/{id}/contacts` → `GET /api/leads/{id}` | `201` | Lead có thêm đầu mối; đầu mối chính cũ giữ nguyên | P1 | Có |
| LEAD-107 | Request validation | Thiếu tên, SĐT sai, email sai | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Lần lượt bỏ `fullName`; `phone`=`123`; `email`=`abc` | Gọi `POST /api/leads/{id}/contacts` 3 lần | `400` | errorCode `validation-failed`; không thêm đầu mối | P2 | Có |
| LEAD-108 | Boundary | `fullName` 100/101, `email` 100/101 ký tự | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Chuỗi đúng độ dài biên | Gọi `POST /api/leads/{id}/contacts` 4 lần | `201/400` | Đúng max thêm được; vượt 1 ký tự trả `400` | P3 | Có |
| LEAD-109 | Business rule | Thêm đầu mối rồi đặt làm đầu mối chính (theo luồng web) | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `fullName`=`Đầu mối 2`, `phone`=`0987654321`, `email`=`dm2@test.vn` (form thêm không có ô đầu mối chính) | Gọi `POST /api/leads/{id}/contacts` → `POST /api/leads/{id}/contacts/{contactId}/primary` cho đầu mối vừa thêm → `GET /api/leads/{id}` | `201` rồi `200` | Đầu mối mới là chính, đầu mối cũ bỏ đánh dấu; đúng 1 đầu mối chính (BR-LEAD-08). Người dùng chốt 2026-11-05: đặt đầu mối chính bằng thao tác riêng như trên web | P1 | Có |
| LEAD-110 | Business rule | Thêm đầu mối cho Lead không hoạt động | `tokenNVKD`; Lead `INACTIVE` | `fullName`=`Đầu mối 2`, `phone`=`0987654321`, `email`=`dm2@test.vn` | Gọi `POST /api/leads/{id}/contacts` | `400/409` | errorCode `domain-rule-violation`; không thêm | P2 | Có |
| LEAD-111 | Ownership/IDOR | NVKD khác thêm đầu mối | `tokenNVKD_B` (NVKD khác, không phụ trách Lead A) | `fullName`=`Đầu mối 2`, `phone`=`0987654321`, `email`=`dm2@test.vn` | Gọi `POST /api/leads/{id}/contacts` với id Lead A | `403/404` | Lead A không có đầu mối mới | P1 | Có |
| LEAD-112 | Data integrity | Ghi lịch sử thêm đầu mối | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `fullName`=`Đầu mối 2`, `phone`=`0987654321`, `email`=`dm2@test.vn` | Gọi `POST /api/leads/{id}/contacts` → `GET /api/leads/{id}/history` | `200` | Có dòng lịch sử thêm đầu mối | P3 | Có |
| LEAD-113 | Idempotency | Gửi lại cùng đầu mối | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `fullName`=`Đầu mối 2`, `phone`=`0987654321`, `email`=`dm2@test.vn` | Gọi `POST /api/leads/{id}/contacts` 2 lần | `201` | Ghi nhận hành vi thực tế (2 bản ghi hay chặn trùng SĐT) và đối chiếu Điểm cần xác nhận; không lỗi `5xx` | P3 | Có |
| LEAD-114 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `POST /api/leads/{id}/contacts` → so response với schema Swagger | `201` | Wrapper `success`=true, `errorCode` rỗng; `data` có đầu mối vừa tạo (`id`, `fullName`, `phone`, `email`, `primary`); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-115 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `POST /api/leads/{id}/contacts` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| LEAD-116 | Error handling | Lead không tồn tại | `tokenNVKD` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/leads/{id}/contacts` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| LEAD-117 | CRUD | Vòng đời đầu mối: thêm, xem, sửa, xóa | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `fullName`=`Đầu mối 2`, `phone`=`0987654321`, `email`=`dm2@test.vn` | Gọi `POST /api/leads/{id}/contacts` → `GET /api/leads/{id}` → `PUT /api/leads/{id}/contacts/{contactId}` → `DELETE /api/leads/{id}/contacts/{contactId}` → `GET /api/leads/{id}` | `201`, `200`, `200`, `200/204`, `200` | Mỗi bước GET phản ánh đúng thay đổi; cuối cùng đầu mối không còn, các đầu mối khác không đổi | P2 | Có |

## API: Sửa đầu mối liên hệ Lead

**API chính:** `PUT /api/leads/{id}/contacts/{contactId}`  
**Role hợp lệ:** NVKD (người phụ trách Lead)  
**Mục tiêu:** Sửa đúng đầu mối thuộc Lead.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-118 | Happy path | Sửa SĐT và chức vụ | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đầu mối C1 | `fullName`, `phone`=`0911111111`, `jobTitle`=`Trưởng phòng` | Gọi `PUT /api/leads/{id}/contacts/{contactId}` | `200` | GET Lead trả giá trị mới của C1 | P2 | Có |
| LEAD-119 | Request validation | SĐT sai định dạng | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đầu mối C1 | `phone`=`abc` | Gọi `PUT /api/leads/{id}/contacts/{contactId}` | `400` | errorCode `validation-failed`; C1 không đổi | P2 | Có |
| LEAD-120 | Boundary | `jobTitle` 100/101 ký tự | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đầu mối C1 | Chuỗi 100 rồi 101 ký tự | Gọi `PUT /api/leads/{id}/contacts/{contactId}` 2 lần | `200/400` | 100 lưu được; 101 trả `400` | P3 | Có |
| LEAD-121 | Business rule | Bỏ đánh dấu chính của đầu mối chính duy nhất | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C1 là đầu mối chính duy nhất | `primary`=false | Gọi `PUT /api/leads/{id}/contacts/{contactId}` → GET Lead | `200/400` | Lead vẫn có đúng 1 đầu mối chính (BR-LEAD-08) | P2 | Có |
| LEAD-122 | Business rule | Sửa đầu mối của Lead đã chuyển đổi | `tokenNVKD`; Lead `CONVERTED` | Body hợp lệ | Gọi `PUT /api/leads/{id}/contacts/{contactId}` | `400/409` | Bị chặn; dữ liệu không đổi | P2 | Có |
| LEAD-123 | Ownership/IDOR | `contactId` thuộc Lead khác | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C9 thuộc Lead khác của NVKD A | `id`=Lead A, `contactId`=C9 | Gọi `PUT /api/leads/{id}/contacts/{contactId}` | `404` | C9 không đổi | P1 | Có |
| LEAD-124 | Data integrity | Ghi lịch sử sửa đầu mối | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đầu mối C1 | Đổi `phone` | Gọi `PUT /api/leads/{id}/contacts/{contactId}` → `GET /api/leads/{id}/history` | `200` | Có dòng sửa đầu mối với giá trị cũ, mới | P3 | Có |
| LEAD-125 | Request validation | `contactId` sai định dạng UUID | `tokenNVKD` | `contactId` = `abc` | Gọi `PUT /api/leads/{id}/contacts/{contactId}` với `contactId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| LEAD-126 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `PUT /api/leads/{id}/contacts/{contactId}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có đầu mối sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-127 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `PUT /api/leads/{id}/contacts/{contactId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| LEAD-128 | Error handling | Đầu mối không tồn tại | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/leads/{id}/contacts/{contactId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Xóa đầu mối liên hệ Lead

**API chính:** `DELETE /api/leads/{id}/contacts/{contactId}`  
**Role hợp lệ:** NVKD (người phụ trách Lead)  
**Mục tiêu:** Không xóa được đầu mối cuối, luôn còn đúng 1 đầu mối chính.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-129 | Happy path | Xóa đầu mối phụ | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C1 chính, C2 phụ | `contactId`=C2 | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` → GET Lead | `200/204` | Còn C1, vẫn là chính | P2 | Có |
| LEAD-130 | Business rule | Xóa đầu mối cuối cùng | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; chỉ còn C1 | `contactId`=C1 | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` | `400/409` | Bị chặn (BR-LEAD-09); C1 còn nguyên | P1 | Có |
| LEAD-131 | Business rule | Xóa đầu mối chính | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C1 chính, C2, C3 phụ | `contactId`=C1 | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` → GET Lead | `200/204` | Đầu mối còn lại đầu tiên (C2) thành chính (BR-LEAD-08) | P1 | Có |
| LEAD-132 | Boundary | Lead còn đúng 2 đầu mối | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C1, C2 | Xóa C2 rồi xóa C1 | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` 2 lần | `200/204` rồi `400/409` | Lần 1 thành công; lần 2 bị chặn vì C1 là đầu mối cuối | P2 | Có |
| LEAD-133 | Ownership/IDOR | Xóa đầu mối của Lead khác | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C9 thuộc Lead khác | `id`=Lead A, `contactId`=C9 | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` | `404` | C9 không bị xóa | P1 | Có |
| LEAD-134 | Data integrity | Xóa lỗi không mất dữ liệu | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; chỉ còn C1 | `contactId`=C1 | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` → GET Lead | `400/409` | C1 vẫn còn và vẫn là chính; không có dòng lịch sử xóa | P2 | Có |
| LEAD-135 | Request validation | `contactId` sai định dạng UUID | `tokenNVKD` | `contactId` = `abc` | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` với `contactId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| LEAD-136 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` → so response với schema Swagger | `200/204` | Wrapper `success`=true, `errorCode` rỗng; `data` có kết quả xóa (body rỗng hoặc wrapper thành công); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| LEAD-137 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| LEAD-138 | Error handling | Đầu mối không tồn tại | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `DELETE /api/leads/{id}/contacts/{contactId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Đặt đầu mối chính của Lead

**API chính:** `POST /api/leads/{id}/contacts/{contactId}/primary`  
**Role hợp lệ:** NVKD (người phụ trách Lead)  
**Mục tiêu:** Luôn đúng 1 đầu mối chính.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-139 | Happy path | Đặt đầu mối phụ thành chính | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C1 chính, C2 phụ | `contactId`=C2 | Gọi `POST /api/leads/{id}/contacts/{contactId}/primary` → GET Lead | `200` | C2 chính, C1 phụ | P2 | Có |
| LEAD-140 | Business rule | Đặt chính khi Lead không hoạt động | `tokenNVKD`; Lead `INACTIVE` có C1, C2 | `contactId`=C2 | Gọi `POST /api/leads/{id}/contacts/{contactId}/primary` | `400/409` | Bị chặn; đầu mối chính không đổi | P3 | Có |
| LEAD-141 | Idempotency | Đặt chính 2 lần cho cùng đầu mối | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C2 phụ | `contactId`=C2 | Gọi `POST /api/leads/{id}/contacts/{contactId}/primary` 2 lần | `200` | Cả 2 lần thành công hoặc lần 2 báo đã là chính; vẫn đúng 1 đầu mối chính | P3 | Có |
| LEAD-142 | Ownership/IDOR | Đặt chính đầu mối của Lead khác | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C9 thuộc Lead khác | `id`=Lead A, `contactId`=C9 | Gọi `POST /api/leads/{id}/contacts/{contactId}/primary` | `404` | Đầu mối chính của cả 2 Lead không đổi | P1 | Có |
| LEAD-143 | Data integrity | Không có trạng thái 2 đầu mối chính | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; C1, C2, C3 | Lần lượt đặt C2 rồi C3 | Gọi `POST /api/leads/{id}/contacts/{contactId}/primary` 2 lần → GET Lead | `200` | Sau mỗi lần chỉ 1 đầu mối có `primary`=true | P2 | Có |
| LEAD-144 | Request validation | `contactId` sai định dạng UUID | `tokenNVKD` | `contactId` = `abc` | Gọi `POST /api/leads/{id}/contacts/{contactId}/primary` với `contactId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| LEAD-145 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `POST /api/leads/{id}/contacts/{contactId}/primary` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có đầu mối chính mới hoặc Lead sau khi đổi; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-146 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `POST /api/leads/{id}/contacts/{contactId}/primary` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| LEAD-147 | Error handling | Đầu mối không tồn tại | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/leads/{id}/contacts/{contactId}/primary` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Ngưng hoạt động Lead

**API chính:** `POST /api/leads/{id}/deactivate`  
**Role hợp lệ:** NVKD (người phụ trách Lead)  
**Mục tiêu:** Chuyển `ACTIVE` → `INACTIVE` kèm lý do, không xóa bản ghi.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-148 | Happy path | Ngưng Lead có lý do | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `reason`=`Khách không còn nhu cầu` | Gọi `POST /api/leads/{id}/deactivate` → GET Lead | `200` | Trạng thái `INACTIVE`, lưu lý do | P1 | Có |
| LEAD-149 | State transition | Ngưng không xóa bản ghi | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `reason` hợp lệ | Gọi `POST /api/leads/{id}/deactivate` → `GET /api/leads/{id}` → `GET /api/leads?status=INACTIVE` | `200` | Lead vẫn GET được (BR-LEAD-12) và có trong danh sách lọc `INACTIVE` | P1 | Có |
| LEAD-150 | Request validation | Thiếu lý do hoặc lý do rỗng | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Lần lượt bỏ `reason`; `reason`=``; `reason`=3 khoảng trắng | Gọi `POST /api/leads/{id}/deactivate` 3 lần | `400` | errorCode `validation-failed` (BR-LEAD-20); Lead vẫn `ACTIVE` | P1 | Có |
| LEAD-151 | Boundary | `reason` 500/501 ký tự | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Chuỗi 500 rồi 501 ký tự | Gọi `POST /api/leads/{id}/deactivate` (Lead khác cho mỗi lần) | `200/400` | 500 thành công; 501 trả `400` | P3 | Có |
| LEAD-152 | Business rule | Ngưng Lead đã chuyển đổi | `tokenNVKD`; Lead `CONVERTED` | `reason` hợp lệ | Gọi `POST /api/leads/{id}/deactivate` | `400/409` | errorCode `domain-rule-violation`; vẫn `CONVERTED` | P1 | Có |
| LEAD-153 | Idempotency | Ngưng lần thứ 2 | `tokenNVKD`; Lead vừa ngưng | `reason` hợp lệ | Gọi `POST /api/leads/{id}/deactivate` lần 2 | `400/409` | Bị chặn; lịch sử chỉ có 1 dòng ngưng | P2 | Có |
| LEAD-154 | Ownership/IDOR | NVKD khác ngưng Lead A | `tokenNVKD_B` (NVKD khác, không phụ trách Lead A) | `reason` hợp lệ | Gọi `POST /api/leads/{id}/deactivate` với id Lead A | `403/404` | Lead A vẫn `ACTIVE` | P1 | Có |
| LEAD-155 | Data integrity | Ghi lịch sử kèm lý do | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `reason`=`R-test` | Gọi `POST /api/leads/{id}/deactivate` → `GET /api/leads/{id}/history` | `200` | Có dòng ngưng hoạt động chứa `R-test` | P2 | Có |
| LEAD-156 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `POST /api/leads/{id}/deactivate` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có Lead sau khi ngưng; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-157 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `POST /api/leads/{id}/deactivate` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| LEAD-158 | Error handling | Lead không tồn tại | `tokenNVKD` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/leads/{id}/deactivate` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Đính kèm tài liệu Lead

**API chính:** `POST /api/leads/{id}/documents`  
**Role hợp lệ:** NVKD (người phụ trách Lead)  
**Mục tiêu:** Chỉ nhận định dạng cho phép, tối đa 10MB.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-159 | Happy path | Upload file PDF 1MB | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `file`=`hd.pdf` 1MB | Gọi `POST /api/leads/{id}/documents` → GET Lead | `201` | Lead có tài liệu mới với tên file gốc | P2 | Có |
| LEAD-160 | File API | Các định dạng được phép | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Lần lượt PDF, DOCX, XLSX, PNG, JPG | Gọi `POST /api/leads/{id}/documents` 5 lần | `201` | Cả 5 file được lưu | P2 | Có |
| LEAD-161 | File API | Định dạng không cho phép và file đổi đuôi | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Lần lượt `.exe`; `.zip`; file exe đổi đuôi `.pdf` | Gọi `POST /api/leads/{id}/documents` 3 lần | `400` | Bị chặn; không thêm tài liệu | P2 | Có |
| LEAD-162 | Boundary | Dung lượng 10MB và 10MB + 1 byte | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | File PDF đúng 10MB; PDF 10MB + 1 byte | Gọi `POST /api/leads/{id}/documents` 2 lần | `201/400/413` | 10MB thành công; vượt 1 byte trả errorCode `file-too-large` | P2 | Có |
| LEAD-163 | Request validation | Không gửi file | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Multipart không có `file` | Gọi `POST /api/leads/{id}/documents` | `400` | errorCode `validation-failed` hoặc `malformed-request` | P3 | Có |
| LEAD-164 | Business rule | Upload cho Lead đã chuyển đổi | `tokenNVKD`; Lead `CONVERTED` | PDF 1MB | Gọi `POST /api/leads/{id}/documents` | `400/409` | Bị chặn vì Lead chỉ đọc (BR-LEAD-06) | P3 | Có |
| LEAD-165 | Ownership/IDOR | NVKD khác upload vào Lead A | `tokenNVKD_B` (NVKD khác, không phụ trách Lead A) | PDF 1MB | Gọi `POST /api/leads/{id}/documents` với id Lead A | `403/404` | Lead A không có tài liệu mới | P1 | Có |
| LEAD-166 | Data integrity | Upload lỗi không tạo bản ghi tài liệu | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | File 11MB | Gọi `POST /api/leads/{id}/documents` → GET Lead | `400/413` | Số tài liệu của Lead không đổi | P2 | Có |
| LEAD-167 | Idempotency | Upload cùng file 2 lần | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `hd.pdf` | Gọi `POST /api/leads/{id}/documents` 2 lần | `201` | 2 tài liệu với id khác nhau, hoặc lần 2 bị chặn trùng; không lỗi `5xx` | P3 | Có |
| LEAD-168 | Input security | Tên file chứa đường dẫn | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Tên file `../../etc/passwd.pdf` | Gọi `POST /api/leads/{id}/documents` | `201/400` | Tên lưu đã được làm sạch, không ghi file ra ngoài thư mục lưu trữ | P2 | Có |
| LEAD-169 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `POST /api/leads/{id}/documents` → so response với schema Swagger | `201` | Wrapper `success`=true, `errorCode` rỗng; `data` có tài liệu vừa tạo (`id`, tên file, dung lượng, ngày tải); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| LEAD-170 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `POST /api/leads/{id}/documents` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| LEAD-171 | Error handling | Lead không tồn tại | `tokenNVKD` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/leads/{id}/documents` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Tải tài liệu Lead

**API chính:** `GET /api/leads/{id}/documents/{documentId}`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Trả đúng file thuộc Lead trong phạm vi.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-172 | Happy path | Tải tài liệu Lead | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; Lead A có tài liệu D1 (PDF) | id của file đã upload ở bước chuẩn bị | Gọi `GET /api/leads/{id}/documents/{documentId}` | `200` | Nội dung tải về trùng từng byte với file đã upload (so checksum) | P2 | Có |
| LEAD-173 | File API | Header của tài liệu Lead | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; Lead A có tài liệu D1 (PDF) | Như case Happy path | Gọi `GET /api/leads/{id}/documents/{documentId}` → đọc header | `200` | `Content-Type` đúng loại file đã upload; `Content-Disposition` có tên file gốc; `Content-Length` > 0 | P2 | Có |
| LEAD-174 | Ownership/IDOR | Tải tài liệu Lead ngoài phạm vi | `tokenNVKD_B` (NVKD khác, không phụ trách Lead A); hoặc `documentId` thuộc Lead khác | id Lead A + D1; hoặc Lead A + D9 | Gọi `GET /api/leads/{id}/documents/{documentId}` | `403/404` | Không trả nội dung file | P1 | Có |
| LEAD-175 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; Lead A có tài liệu D1 (PDF) | Request hợp lệ | Gọi `GET /api/leads/{id}/documents/{documentId}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân, không bọc wrapper JSON; khi lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| LEAD-176 | Request validation | `id` sai định dạng UUID | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; Lead A có tài liệu D1 (PDF) | `id` = `abc` | Gọi `GET /api/leads/{id}/documents/{documentId}` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| LEAD-177 | Authentication | Gọi không có token | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; Lead A có tài liệu D1 (PDF) | Không gửi header `Authorization` | Gọi `GET /api/leads/{id}/documents/{documentId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| LEAD-178 | Error handling | Tài liệu lead không tồn tại | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; Lead A có tài liệu D1 (PDF) | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/leads/{id}/documents/{documentId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Gỡ tài liệu Lead

**API chính:** `DELETE /api/leads/{id}/documents/{documentId}`  
**Role hợp lệ:** NVKD (người phụ trách Lead)  
**Mục tiêu:** Gỡ đúng tài liệu thuộc Lead.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-179 | Happy path | Gỡ tài liệu | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; tài liệu D1 | `documentId`=D1 | Gọi `DELETE /api/leads/{id}/documents/{documentId}` → GET Lead | `200/204` | Lead không còn D1 | P2 | Có |
| LEAD-180 | Business rule | Gỡ tài liệu của Lead đã chuyển đổi | `tokenNVKD`; Lead `CONVERTED` có tài liệu | `documentId` của Lead đó | Gọi `DELETE /api/leads/{id}/documents/{documentId}` | `400/409` | Bị chặn; tài liệu còn (tài liệu chuyển sang KH) | P2 | Có |
| LEAD-181 | Ownership/IDOR | Gỡ tài liệu của Lead khác | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; tài liệu D1; D9 thuộc Lead khác | `id`=Lead A, `documentId`=D9 | Gọi `DELETE /api/leads/{id}/documents/{documentId}` | `404` | D9 còn nguyên | P1 | Có |
| LEAD-182 | Data integrity | Sau khi gỡ không tải được | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; tài liệu D1 | `documentId`=D1 | Gọi `DELETE /api/leads/{id}/documents/{documentId}` → `GET /api/leads/{id}/documents/{documentId}` | `200/204` rồi `404` | File không còn tải được | P2 | Có |
| LEAD-183 | Request validation | `documentId` sai định dạng UUID | `tokenNVKD` | `documentId` = `abc` | Gọi `DELETE /api/leads/{id}/documents/{documentId}` với `documentId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| LEAD-184 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; tài liệu D1 | Request hợp lệ | Gọi `DELETE /api/leads/{id}/documents/{documentId}` → so response với schema Swagger | `200/204` | Wrapper `success`=true, `errorCode` rỗng; `data` có kết quả xóa (body rỗng hoặc wrapper thành công); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| LEAD-185 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `DELETE /api/leads/{id}/documents/{documentId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| LEAD-186 | Error handling | Tài liệu không tồn tại | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `DELETE /api/leads/{id}/documents/{documentId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Lịch sử thao tác Lead

**API chính:** `GET /api/leads/{id}/history`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Lịch sử đủ, mới nhất trước, lọc đúng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-187 | Happy path | Xem lịch sử thao tác Lead | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đã sửa, thêm đầu mối, ngưng rồi kích hoạt lại | Không lọc; `page=1`, `perPage=20` | Gọi `GET /api/leads/{id}/history` | `200` | Có đủ các thao tác đã làm trong tiền điều kiện; sắp xếp mới nhất trước; mỗi dòng có hành động, người thực hiện, thời gian | P2 | Có |
| LEAD-188 | Pagination/filter/sort | Lọc lịch sử theo hành động, người thực hiện, khoảng thời gian, từ khóa | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đã sửa, thêm đầu mối, ngưng rồi kích hoạt lại | Lần lượt: `eventCode`=1 mã hành động; `actorUserId`=user test; `from`/`to` bao quanh thời điểm tạo; `search`=từ khóa trong lý do | Gọi `GET /api/leads/{id}/history` với từng bộ lọc | `200` | Mỗi lần chỉ trả dòng khớp bộ lọc; tổng trong `meta.pagination` khớp số dòng; không lọc thì đủ mọi dòng | P3 | Có |
| LEAD-189 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đã sửa, thêm đầu mối, ngưng rồi kích hoạt lại | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/leads/{id}/history` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| LEAD-190 | Request validation | Tham số thời gian sai định dạng | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đã sửa, thêm đầu mối, ngưng rồi kích hoạt lại | `from` = `2026-13-45` | Gọi `GET /api/leads/{id}/history` | `400` | errorCode `validation-failed`; không trả `5xx` | P3 | Có |
| LEAD-191 | Ownership/IDOR | Xem lịch sử Lead ngoài phạm vi | `tokenNVKD_B` (NVKD khác, không phụ trách Lead A) | id Lead A | Gọi `GET /api/leads/{id}/history` | `403/404` | Không trả dòng lịch sử nào của bản ghi | P1 | Có |
| LEAD-192 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đã sửa, thêm đầu mối, ngưng rồi kích hoạt lại | Request hợp lệ | Gọi `GET /api/leads/{id}/history` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có danh sách dòng lịch sử (hành động, người thực hiện, thời gian, giá trị cũ/mới) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-193 | Authentication | Gọi không có token | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đã sửa, thêm đầu mối, ngưng rồi kích hoạt lại | Không gửi header `Authorization` | Gọi `GET /api/leads/{id}/history` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| LEAD-194 | Error handling | Lead không tồn tại | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; đã sửa, thêm đầu mối, ngưng rồi kích hoạt lại | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/leads/{id}/history` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Kích hoạt lại Lead

**API chính:** `POST /api/leads/{id}/reactivate`  
**Role hợp lệ:** NVKD (người phụ trách Lead)  
**Mục tiêu:** Chuyển `INACTIVE` → `ACTIVE`, không cần lý do.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-195 | Happy path | Kích hoạt lại Lead đã ngưng | `tokenNVKD`; Lead I `INACTIVE` do NVKD A phụ trách | Không body | Gọi `POST /api/leads/{id}/reactivate` → GET Lead | `200` | Trạng thái `ACTIVE` | P1 | Có |
| LEAD-196 | State transition | Chỉ kích hoạt từ Ngưng hoạt động | `tokenNVKD`; Lead `ACTIVE`; Lead `CONVERTED` | Không body | Gọi `POST /api/leads/{id}/reactivate` cho từng Lead | `400/409` | errorCode `domain-rule-violation`; trạng thái giữ nguyên | P1 | Có |
| LEAD-197 | Business rule | Không bắt buộc lý do | `tokenNVKD`; Lead I `INACTIVE` do NVKD A phụ trách | Body rỗng | Gọi `POST /api/leads/{id}/reactivate` | `200` | Thành công không cần `reason` (BR-LEAD-20) | P2 | Có |
| LEAD-198 | Idempotency | Kích hoạt lần thứ 2 | `tokenNVKD`; Lead vừa kích hoạt lại | Không body | Gọi `POST /api/leads/{id}/reactivate` lần 2 | `400/409` | Bị chặn; lịch sử chỉ 1 dòng kích hoạt | P2 | Có |
| LEAD-199 | Ownership/IDOR | NVKD khác kích hoạt Lead I | `tokenNVKD_B` (NVKD khác, không phụ trách Lead A) | id Lead I | Gọi `POST /api/leads/{id}/reactivate` | `403/404` | Lead I vẫn `INACTIVE` | P1 | Có |
| LEAD-200 | Data integrity | Ghi lịch sử kích hoạt | `tokenNVKD`; Lead I `INACTIVE` do NVKD A phụ trách | Không body | Gọi `POST /api/leads/{id}/reactivate` → `GET /api/leads/{id}/history` | `200` | Có dòng kích hoạt lại, người thực hiện NVKD A | P3 | Có |
| LEAD-201 | Request validation | `id` sai định dạng UUID | `tokenNVKD` | `id` = `abc` | Gọi `POST /api/leads/{id}/reactivate` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| LEAD-202 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead I `INACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `POST /api/leads/{id}/reactivate` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có Lead sau khi kích hoạt; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| LEAD-203 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `POST /api/leads/{id}/reactivate` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| LEAD-204 | Error handling | Lead không tồn tại | `tokenNVKD` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/leads/{id}/reactivate` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Chuyển người phụ trách Lead

**API chính:** `POST /api/leads/{id}/transfer-owner`  
**Role hợp lệ:** NVKD (người phụ trách hiện tại)  
**Mục tiêu:** Đổi người phụ trách kèm lý do, người cũ mất quyền.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-205 | Happy path | Chuyển Lead cho NVKD B | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `newOwnerUserId`=NVKD B, `reason`=`Phân lại địa bàn` | Gọi `POST /api/leads/{id}/transfer-owner` → NVKD B gọi `GET /api/leads/{id}` | `204` | Người phụ trách là NVKD B; NVKD B nhận notification kèm lý do | P1 | Có |
| LEAD-206 | State transition | Chuyển không đổi trạng thái | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `newOwnerUserId`=NVKD B, `reason`=`Phân lại địa bàn` | Gọi `POST /api/leads/{id}/transfer-owner` | `204` | Lead vẫn `ACTIVE` | P2 | Có |
| LEAD-207 | Request validation | Thiếu người mới hoặc lý do | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Lần lượt bỏ `newOwnerUserId`; bỏ `reason`; `newOwnerUserId`=`abc` | Gọi `POST /api/leads/{id}/transfer-owner` 3 lần | `400` | errorCode `validation-failed` (BR-LEAD-21); người phụ trách không đổi | P1 | Có |
| LEAD-208 | Boundary | `reason` 500/501 ký tự | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Chuỗi 500 rồi 501 ký tự | Gọi `POST /api/leads/{id}/transfer-owner` | `204/400` | 500 thành công; 501 trả `400` | P3 | Có |
| LEAD-209 | Business rule | Chuyển cho chính người đang phụ trách | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `newOwnerUserId`=NVKD A | Gọi `POST /api/leads/{id}/transfer-owner` | `400/409` | Bị chặn; không gửi notification | P2 | Có |
| LEAD-210 | Business rule | Người nhận không hợp lệ | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `newOwnerUserId` lần lượt = NVKD bị khóa, tài khoản DVKH | Gọi `POST /api/leads/{id}/transfer-owner` 2 lần | `400/409` | Bị chặn (BR-LEAD-24) | P2 | Có |
| LEAD-211 | Business rule | Chuyển Lead không hoạt động hoặc đã chuyển đổi | `tokenNVKD`; Lead `INACTIVE`; Lead `CONVERTED` | `newOwnerUserId`=NVKD B, `reason`=`Phân lại địa bàn` | Gọi `POST /api/leads/{id}/transfer-owner` cho từng Lead | `400/409` | Bị chặn; người phụ trách không đổi | P2 | Có |
| LEAD-212 | Ownership/IDOR | NVKD khác chuyển Lead A | `tokenNVKD_B` (NVKD khác, không phụ trách Lead A) | `newOwnerUserId`=NVKD B | Gọi `POST /api/leads/{id}/transfer-owner` với id Lead A | `403/404` | Lead A vẫn thuộc NVKD A | P1 | Có |
| LEAD-213 | Data integrity | Lead rời danh sách người cũ, vào danh sách người mới | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | `newOwnerUserId`=NVKD B, `reason`=`Phân lại địa bàn` | Gọi `POST /api/leads/{id}/transfer-owner` → NVKD A và NVKD B gọi `GET /api/leads` | `204` rồi `200` | Lead không còn trong danh sách NVKD A, có trong danh sách NVKD B; lịch sử có lý do | P1 | Có |
| LEAD-214 | Idempotency | Người cũ gửi lại yêu cầu chuyển | `tokenNVKD`; Lead vừa chuyển sang NVKD B | `newOwnerUserId`=NVKD B, `reason`=`Phân lại địa bàn` | NVKD A gọi `POST /api/leads/{id}/transfer-owner` lần 2 | `403/404` | Bị chặn vì NVKD A không còn quyền | P2 | Có |
| LEAD-215 | Concurrency | 2 yêu cầu chuyển cho 2 người cùng lúc | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách; NVKD B, NVKD C | Body 1 người mới = B; body 2 người mới = C | Gọi `POST /api/leads/{id}/transfer-owner` song song | `204` và `403/404/409` | Chỉ 1 yêu cầu thành công; người phụ trách cuối cùng khớp lịch sử | P3 | Có |
| LEAD-216 | Response contract | Response 204 không có body | `tokenNVKD`; Lead A `ACTIVE` do NVKD A phụ trách | Request hợp lệ | Gọi `POST /api/leads/{id}/transfer-owner` → đọc status, header và body | `204` | Body rỗng, không có wrapper JSON; không có `Content-Type` JSON bắt buộc; client không parse JSON khi nhận 204 | P3 | Có |
| LEAD-217 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `POST /api/leads/{id}/transfer-owner` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| LEAD-218 | Error handling | Lead không tồn tại | `tokenNVKD` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/leads/{id}/transfer-owner` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Mã tự sinh của Lead

**API chính:** `POST /api/leads`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Mã Lead do hệ thống tự sinh theo thứ tự tạo.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| LEAD-219 | Business rule | Mã Lead tự sinh tăng dần theo thứ tự tạo | `tokenNVKD` | 2 body Lead hợp lệ, MST ngẫu nhiên khác nhau | Gọi `POST /api/leads` lần 1 → gọi `POST /api/leads` lần 2 → so phần số của 2 mã | `200/201` | Cả 2 mã khớp `LED-XXXX`; phần số của Lead tạo sau lớn hơn Lead tạo trước (không xem được DB nên kiểm bằng 2 bản ghi liên tiếp) | P1 | Có |

## API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng

**API chính:** `GET /api/contracts`  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** Trả HĐ đúng phạm vi từng role, tìm và lọc đúng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-001 | Happy path | DVKH xem danh sách HĐ | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `page=1`, `perPage=20` | Gọi `GET /api/contracts` | `200` | Có HĐ A; mọi HĐ thuộc KH do DVKH A phụ trách (BR-CTR-18) | P1 | Có |
| CTR-002 | Business rule | NVKD chỉ thấy HĐ mình upload | `tokenNVKD`; NVKD A upload HĐ 1, NVKD B upload HĐ 2 | Không lọc | NVKD A gọi `GET /api/contracts` | `200` | Có HĐ 1, không có HĐ 2 | P1 | Có |
| CTR-003 | Business rule | DVKH không thấy HĐ của KH người khác | `tokenDVKH`; KH M do DVKH B phụ trách | Không lọc | DVKH A gọi `GET /api/contracts` | `200` | Không có HĐ của KH M | P1 | Có |
| CTR-004 | Pagination/filter/sort | Tìm theo mã HĐ, số HĐ, tên KH, MST | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Lần lượt mã `CTC...`, `contractNumber`, một phần tên KH, MST | Gọi `GET /api/contracts` với từng `search` | `200` | Cả 4 lần trả HĐ A | P2 | Có |
| CTR-005 | Pagination/filter/sort | Lọc `status`, `customerTier`, `customerId`, `alert`, khoảng ngày ký/hết hạn | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `status=ACTIVE`; `customerId`=K; `alert=URGENT`; `expiryFrom`/`expiryTo` | Gọi `GET /api/contracts` với từng bộ lọc | `200` | Chỉ trả HĐ khớp; lọc `customerId` dùng cho ô chọn HĐ áp dụng chỉ trả HĐ của K | P2 | Có |
| CTR-006 | Pagination/filter/sort | Phân trang không trùng, không sót | `tokenDVKH`; 25 HĐ trong phạm vi | `perPage=10`, `page`=1, 2, 3 | Gọi `GET /api/contracts` 3 lần | `200` | 10, 10, 5 dòng; không id lặp; `total`=25 | P3 | Có |
| CTR-007 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenDVKH` | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/contracts` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| CTR-008 | Request validation | Giá trị enum, UUID, ngày sai | `tokenDVKH` | `status=OPEN`; `customerId=abc`; `signedFrom=2026-02-30` | Gọi `GET /api/contracts` 3 lần | `400` | errorCode `validation-failed` | P3 | Có |
| CTR-009 | Response contract | Response đúng schema Swagger | `tokenDVKH` | Request hợp lệ | Gọi `GET /api/contracts` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng HĐ (`id`, `code` dạng `CTCYYMM-XXX`, `contractNumber`, KH, 3 mốc ngày, `status`, `alertLevel`) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-010 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `GET /api/contracts` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| CTR-011 | Authentication | Token sai chữ ký, hết hạn hoặc là refresh token | `tokenDVKH` | 3 lần gọi: token sửa 1 ký tự; token hết hạn; `Bearer` + refresh token hợp lệ | Gọi `GET /api/contracts` lần lượt với 3 token | `401` | Cả 3 lần trả errorCode `authentication-failed` hoặc `authentication-required`; không trả dữ liệu | P1 | Có |
| CTR-012 | Input security | Chuỗi tấn công trong `search` | `tokenDVKH` | `search`=`'; DROP TABLE contracts; --` | Gọi `GET /api/contracts` | `200/400` | Không lỗi `5xx`; không trả HĐ ngoài phạm vi | P3 | Có |
| CTR-013 | Error handling | Gửi sai phương thức HTTP | `tokenDVKH` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contracts` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng)

**API chính:** `POST /api/contracts`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Tạo HĐ đầu tiên, chuyển Lead thành KH và bàn giao cho DVKH.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-014 | Happy path | Upload HĐ hiệu lực từ hôm nay | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | multipart `contract`: `customerId`=Lead L, `accountManagerId`=DVKH A, `customerTier`=`REGULAR`, `contractNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm, `billingCycle`=`MONTHLY`, `paymentTermDays`=30, `paymentDueNote`, `paymentMethod`=`TRANSFER`; `file`=scan PDF | Gọi `POST /api/contracts` → `GET /api/contracts/{id}` → `GET /api/customers/{id}` | `200/201` | HĐ mã khớp `^CTC\d{4}-\d{3}$`, trạng thái `ACTIVE`; Lead → `CONVERTED`; KH có mã KH, `ACTIVE`, phân hạng `REGULAR`, người phụ trách DVKH A | P1 | Có |
| CTR-015 | State transition | Upload HĐ hiệu lực tương lai | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | multipart `contract`: `customerId`=Lead L, `accountManagerId`=DVKH A, `customerTier`=`REGULAR`, `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`=+10 ngày, `effectiveTo`=+1 năm, `billingCycle`=`MONTHLY`, `paymentTermDays`=30, `paymentDueNote`, `paymentMethod`=`TRANSFER`; `file`=scan PDF | Gọi `POST /api/contracts` → xem HĐ và KH | `200/201` | HĐ `PENDING`; Lead `CONVERTED`; KH `SUSPENDED` với lý do `PENDING_CONTRACT` | P1 | Có |
| CTR-016 | Request validation | Thiếu từng trường bắt buộc | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | Mỗi lần bỏ 1 trong: `customerId`, `accountManagerId`, `customerTier`, `contractNumber`, 3 mốc ngày, `billingCycle`, `paymentTermDays`, `paymentDueNote`, `paymentMethod` | Gọi `POST /api/contracts` cho từng trường | `400` | errorCode `validation-failed` đúng trường; Lead vẫn `ACTIVE` | P1 | Có |
| CTR-017 | Request validation | Thiếu file scan | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | Body đúng nhưng không có `file` | Gọi `POST /api/contracts` | `400` | Bị chặn; không tạo HĐ | P1 | Có |
| CTR-018 | Request validation | Thứ tự ngày sai | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | Lần lượt `signedOn` > `effectiveFrom`; `effectiveFrom` > `effectiveTo` | Gọi `POST /api/contracts` 2 lần | `400` | Bị chặn (BR-CTR-03) | P1 | Có |
| CTR-019 | Boundary | Ba mốc ngày bằng nhau; `paymentTermDays` 0/365/366 | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | `signedOn`=`effectiveFrom`=`effectiveTo`=hôm nay; `paymentTermDays` 0, 365, 366 | Gọi `POST /api/contracts` (Lead khác cho mỗi lần thành công) | `200/201/400` | Ngày bằng nhau hợp lệ; 0 và 365 hợp lệ; 366 trả `400` | P2 | Có |
| CTR-020 | Boundary | Số phụ lục kèm theo 5 và 6 | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | multipart `contract`: `customerId`=Lead L, `accountManagerId`=DVKH A, `customerTier`=`REGULAR`, `contractNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm, `billingCycle`=`MONTHLY`, `paymentTermDays`=30, `paymentDueNote`, `paymentMethod`=`TRANSFER`; `file`=scan PDF; `annexFiles` 5 file rồi 6 file | Gọi `POST /api/contracts` 2 lần | `200/201/400` | 5 phụ lục thành công; 6 bị chặn | P2 | Có |
| CTR-021 | Business rule | Lead đã có HĐ hoặc không hoạt động | `tokenNVKD`; Lead đã `CONVERTED`; Lead `INACTIVE` | multipart `contract`: `customerId`=Lead L, `accountManagerId`=DVKH A, `customerTier`=`REGULAR`, `contractNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm, `billingCycle`=`MONTHLY`, `paymentTermDays`=30, `paymentDueNote`, `paymentMethod`=`TRANSFER`; `file`=scan PDF | Gọi `POST /api/contracts` cho từng Lead | `400/409` | errorCode `domain-rule-violation` (BR-CTR-19) | P1 | Có |
| CTR-022 | Business rule | Lead của NVKD khác | `tokenNVKD`; Lead M của NVKD B | multipart `contract`: `customerId`=Lead M, `accountManagerId`=DVKH A, `customerTier`=`REGULAR`, `contractNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm, `billingCycle`=`MONTHLY`, `paymentTermDays`=30, `paymentDueNote`, `paymentMethod`=`TRANSFER`; `file`=scan PDF | NVKD A gọi `POST /api/contracts` | `403/404/409` | Bị chặn; Lead M không đổi | P1 | Có |
| CTR-023 | Business rule | `accountManagerId` không phải DVKH đang hoạt động | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | `accountManagerId` lần lượt = NVKD B, DVKH bị khóa | Gọi `POST /api/contracts` 2 lần | `400/409` | Bị chặn (BR-CUST-17) | P2 | Có |
| CTR-024 | Data integrity | Đồng bộ phân hạng và người phụ trách sang KH | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | multipart `contract`: `customerId`=Lead L, `accountManagerId`=DVKH A, `customerTier`=`STRATEGIC`, `contractNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm, `billingCycle`=`MONTHLY`, `paymentTermDays`=30, `paymentDueNote`, `paymentMethod`=`TRANSFER`; `file`=scan PDF | Gọi `POST /api/contracts` → `GET /api/customers/{id}` | `200/201` | KH `tier`=`STRATEGIC`, người phụ trách DVKH A (BR-CTR-06); lịch sử KH gồm cả giai đoạn Lead | P1 | Có |
| CTR-025 | Data integrity | Lỗi giữa chừng không chuyển đổi Lead | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | Body hợp lệ nhưng file scan 0 byte | Gọi `POST /api/contracts` → `GET /api/leads/{id}` | `400` | Không có HĐ; Lead vẫn `ACTIVE`, không sinh KH | P1 | Có |
| CTR-026 | Idempotency | Gửi lại cùng request | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | multipart `contract`: `customerId`=Lead L, `accountManagerId`=DVKH A, `customerTier`=`REGULAR`, `contractNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm, `billingCycle`=`MONTHLY`, `paymentTermDays`=30, `paymentDueNote`, `paymentMethod`=`TRANSFER`; `file`=scan PDF | Gọi `POST /api/contracts` 2 lần | `200/201` rồi `400/409` | Chỉ 1 HĐ; lần 2 bị chặn vì Lead đã chuyển đổi | P1 | Có |
| CTR-027 | Concurrency | 2 request upload cho cùng Lead đồng thời | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | 2 body, `contractNumber` khác nhau | Gọi `POST /api/contracts` song song | `200/201` và `400/409` | Đúng 1 HĐ, đúng 1 KH | P2 | Có |
| CTR-028 | File API | Định dạng và dung lượng file scan | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | Lần lượt `.exe`; PDF vượt giới hạn upload | Gọi `POST /api/contracts` 2 lần | `400/413` | Bị chặn; không tạo HĐ | P2 | Có |
| CTR-029 | Authorization | DVKH upload HĐ đầu tiên | `tokenDVKH` | multipart `contract`: `customerId`=Lead L, `accountManagerId`=DVKH A, `customerTier`=`REGULAR`, `contractNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm, `billingCycle`=`MONTHLY`, `paymentTermDays`=30, `paymentDueNote`, `paymentMethod`=`TRANSFER`; `file`=scan PDF | DVKH gọi `POST /api/contracts` | `403` | errorCode `access-denied` (giả định chỉ NVKD); Lead không đổi | P2 | Có |
| CTR-030 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | Request hợp lệ | Gọi `POST /api/contracts` → so response với schema Swagger | `200/201` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ vừa tạo (`id`, `code`, `status`, KH, người phụ trách, `availableActions`); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-031 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `POST /api/contracts` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTR-032 | Error handling | Multipart thiếu phần `contract` hoặc JSON trong `contract` hỏng | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | Lần lượt chỉ gửi `file`; phần `contract` là chuỗi JSON thiếu dấu đóng | Gọi `POST /api/contracts` 2 lần | `400` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; errorCode `malformed-request` hoặc `validation-failed`; không tạo HĐ | P2 | Có |

## API: Danh sách DVKH chọn khi upload HĐ

**API chính:** `GET /api/contracts/assignable-managers`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Chỉ trả DVKH đang hoạt động.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-033 | Happy path | Lấy danh sách DVKH | `tokenNVKD` | Không tham số | Gọi `GET /api/contracts/assignable-managers` | `200` | Có DVKH A, DVKH B | P2 | Có |
| CTR-034 | Business rule | Loại tài khoản khóa và role khác | `tokenNVKD`; DVKH bị khóa; NVKD | Không tham số | Gọi `GET /api/contracts/assignable-managers` | `200` | Không có DVKH bị khóa và không có NVKD (BR-CUST-17) | P2 | Có |
| CTR-035 | Response contract | Response đúng schema Swagger | `tokenNVKD` | Request hợp lệ | Gọi `GET /api/contracts/assignable-managers` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng người dùng (`id`, họ tên, email); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-036 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `GET /api/contracts/assignable-managers` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P3 | Có |
| CTR-037 | Error handling | Gửi sai phương thức HTTP | `tokenNVKD` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contracts/assignable-managers` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Xuất danh sách hợp đồng khách hàng

**API chính:** `GET /api/contracts/export`  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** File Excel đúng bộ lọc và phạm vi.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-038 | Happy path | Xuất theo trạng thái | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `status=ACTIVE` | Gọi `GET /api/contracts/export` → mở file | `200` | Số dòng khớp `GET /api/contracts?status=ACTIVE` | P2 | Có |
| CTR-039 | File API | Định dạng file | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Không lọc | Gọi `GET /api/contracts/export` | `200` | `.xlsx`, `Content-Type` spreadsheetml, có dòng tiêu đề | P2 | Có |
| CTR-040 | Business rule | Không có dữ liệu | `tokenDVKH` | `search`=`khong-ton-tai` | Gọi `GET /api/contracts/export` | `400` | Lỗi không có dữ liệu để xuất | P2 | Có |
| CTR-041 | Business rule | Không xuất HĐ ngoài phạm vi | `tokenDVKH`; KH M do DVKH B phụ trách | Không lọc | DVKH A gọi `GET /api/contracts/export` | `200` | File không có HĐ của KH M | P1 | Có |
| CTR-042 | Pagination/filter/sort | Kết hợp bộ lọc | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `customerTier=STRATEGIC&alert=WATCH` | Gọi `GET /api/contracts/export` | `200/400` | File chỉ có HĐ khớp; không có dữ liệu thì `400` | P3 | Có |
| CTR-043 | Boundary | Khoảng ngày hết hạn 1 ngày | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `expiryFrom`=`expiryTo`=Ngày hết hạn HĐ A | Gọi `GET /api/contracts/export` | `200` | File có HĐ A | P3 | Có |
| CTR-044 | Request validation | Enum sai | `tokenDVKH` | `alert=HIGH` | Gọi `GET /api/contracts/export` | `400` | errorCode `validation-failed` | P3 | Có |
| CTR-045 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Request hợp lệ | Gọi `GET /api/contracts/export` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân xlsx; lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CTR-046 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `GET /api/contracts/export` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTR-047 | Error handling | Gửi sai phương thức HTTP | `tokenDVKH` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contracts/export` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Khối giám sát kỳ hạn hợp đồng khách hàng

**API chính:** `GET /api/contracts/stats`  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** Đếm đúng HĐ `ACTIVE` theo 3 mức còn hạn.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-048 | Happy path | Xem số liệu kỳ hạn | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Không tham số | Gọi `GET /api/contracts/stats` | `200` | Có 3 số: còn ≤ 7, 8–30, 31–60 ngày | P2 | Có |
| CTR-049 | Boundary | HĐ ở mép 7/8, 30/31, 60/61 ngày | `tokenDVKH`; HĐ `ACTIVE` hết hạn sau 7, 8, 30, 31, 60, 61 ngày | Không tham số | Gọi `GET /api/contracts/stats` | `200` | 7 vào nhóm ≤ 7; 8 và 30 vào 8–30; 31 và 60 vào 31–60; 61 không được đếm (BR-CTR-08) | P2 | Có |
| CTR-050 | Business rule | Chỉ đếm HĐ `ACTIVE` trong phạm vi | `tokenDVKH`; HĐ `PENDING` hết hạn sau 5 ngày; HĐ của DVKH B | Không tham số | Gọi `GET /api/contracts/stats` | `200` | Không đếm HĐ `PENDING` và HĐ ngoài phạm vi | P2 | Có |
| CTR-051 | Response contract | Response đúng schema Swagger | `tokenDVKH` | Request hợp lệ | Gọi `GET /api/contracts/stats` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có 3 số đếm nguyên không âm; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-052 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `GET /api/contracts/stats` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P3 | Có |
| CTR-053 | Error handling | Gửi sai phương thức HTTP | `tokenDVKH` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contracts/stats` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Lead đủ điều kiện upload hợp đồng đầu tiên

**API chính:** `GET /api/contracts/uploadable-customers`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Chỉ trả Lead của mình, đang hoạt động, chưa có HĐ.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-054 | Happy path | Lấy Lead đủ điều kiện | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | Không tham số | Gọi `GET /api/contracts/uploadable-customers` | `200` | Có Lead L | P1 | Có |
| CTR-055 | Business rule | Loại Lead không đủ điều kiện | `tokenNVKD`; Lead `INACTIVE`; Lead `CONVERTED`; Lead của NVKD B | Không tham số | Gọi `GET /api/contracts/uploadable-customers` | `200` | Không có 3 Lead đó (BR-CTR-19) | P1 | Có |
| CTR-056 | Pagination/filter/sort | Tìm theo `search` | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | `search` = một phần tên Lead L | Gọi `GET /api/contracts/uploadable-customers` | `200` | Trả Lead L; từ khóa không khớp trả rỗng | P3 | Có |
| CTR-057 | Boundary | `search` rỗng và rất dài | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | `search`=``; `search` 1000 ký tự | Gọi `GET /api/contracts/uploadable-customers` 2 lần | `200/400` | Rỗng trả như không lọc; chuỗi dài không gây `5xx` | P3 | Có |
| CTR-058 | Request validation | Tham số lạ | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | `search` chứa ký tự `%` và `_` | Gọi `GET /api/contracts/uploadable-customers` | `200` | Ký tự đặc biệt được hiểu là chữ thường, không thành ký tự đại diện | P3 | Có |
| CTR-059 | Response contract | Response đúng schema Swagger | `tokenNVKD`; Lead L `ACTIVE` của NVKD A, chưa có HĐ | Request hợp lệ | Gọi `GET /api/contracts/uploadable-customers` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng Lead (`id`, mã, tên công ty, MST); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-060 | Authentication | Gọi không có token | `tokenNVKD` | Không gửi header `Authorization` | Gọi `GET /api/contracts/uploadable-customers` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTR-061 | Error handling | Gửi sai phương thức HTTP | `tokenNVKD` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contracts/uploadable-customers` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Chi tiết hợp đồng khách hàng

**API chính:** `GET /api/contracts/{id}`  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** Trả đủ chi tiết và nút được phép theo trạng thái.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-062 | Happy path | Xem chi tiết HĐ đang hiệu lực | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | id HĐ A | Gọi `GET /api/contracts/{id}` | `200` | Có điều khoản, phụ lục, đầu mối, lịch sử gia hạn, `alertLevel` | P1 | Có |
| CTR-063 | Business rule | `availableActions` theo trạng thái | `tokenDVKH`; HĐ `PENDING`, `ACTIVE`, `CANCELLED` | id từng HĐ | Gọi `GET /api/contracts/{id}` 3 lần | `200` | `PENDING` có Sửa, Hủy; `ACTIVE` có Sửa, Gia hạn, Dừng khai thác; `CANCELLED` không có Sửa, Gia hạn, Hủy, Dừng khai thác nhưng vẫn có Thêm, Sửa, Xóa phụ lục (UC-CTR-08 áp dụng mọi trạng thái); Tái ký chỉ có khi là HĐ được tái ký theo BR-CTR-10 (BR-CTR-16) | P1 | Có |
| CTR-064 | Ownership/IDOR | DVKH khác xem HĐ A | `tokenDVKH_B` (DVKH không phụ trách KH K) | id HĐ A | Gọi `GET /api/contracts/{id}` | `403/404` | Không trả dữ liệu HĐ A | P1 | Có |
| CTR-065 | Request validation | `id` sai định dạng UUID | `tokenDVKH` | `id` = `abc` | Gọi `GET /api/contracts/{id}` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTR-066 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Request hợp lệ | Gọi `GET /api/contracts/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có `id`, `code`, `contractNumber`, 3 mốc ngày, `status`, `annexes`, `contacts`, `extensions`, `alertLevel`, `availableActions`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-067 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `GET /api/contracts/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| CTR-068 | Error handling | Hợp đồng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contracts/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Sửa hợp đồng khách hàng

**API chính:** `PUT /api/contracts/{id}`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Sửa theo đúng phạm vi trạng thái, có lý do và lịch sử.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-069 | Happy path | Sửa điều khoản thanh toán HĐ `ACTIVE` | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `reason`=`Cập nhật điều khoản`, `contacts` 1 người, 3 mốc ngày, `billingCycle`, `paymentTermDays`=45, `paymentDueNote`, `paymentMethod`; giữ nguyên 3 mốc ngày | Gọi `PUT /api/contracts/{id}` → GET HĐ | `200` | `paymentTermDays`=45; NVKD upload nhận notification | P1 | Có |
| CTR-070 | Business rule | HĐ `ACTIVE` khóa 3 mốc ngày | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `reason`=`Cập nhật điều khoản`, `contacts` 1 người, 3 mốc ngày, `billingCycle`, `paymentTermDays`, `paymentDueNote`, `paymentMethod`; đổi `effectiveTo` | Gọi `PUT /api/contracts/{id}` | `400/409` | Bị chặn (BR-CTR-15); ngày không đổi | P1 | Có |
| CTR-071 | State transition | Sửa ngày hiệu lực HĐ `PENDING` về hôm nay cần xác nhận | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ P `PENDING` (Ngày hiệu lực > hôm nay) | `reason`=`Cập nhật điều khoản`, `contacts` 1 người, 3 mốc ngày, `billingCycle`, `paymentTermDays`, `paymentDueNote`, `paymentMethod`; `effectiveFrom`=hôm nay; lần 1 không có `confirmActivation`, lần 2 `confirmActivation`=true | Gọi `PUT /api/contracts/{id}` 2 lần → GET HĐ | `409` rồi `200` | Lần 1 errorCode `confirmation-required`, HĐ vẫn `PENDING`; lần 2 HĐ `ACTIVE`, KH `ACTIVE` | P1 | Có |
| CTR-072 | Business rule | Sửa HĐ ở trạng thái đóng | `tokenDVKH`; HĐ `CANCELLED`; HĐ `EXPIRED` | `reason`=`Cập nhật điều khoản`, `contacts` 1 người, 3 mốc ngày, `billingCycle`, `paymentTermDays`, `paymentDueNote`, `paymentMethod` | Gọi `PUT /api/contracts/{id}` cho từng HĐ | `400/409` | errorCode `domain-rule-violation` | P1 | Có |
| CTR-073 | Request validation | Thiếu lý do, đầu mối hoặc enum sai | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Lần lượt bỏ `reason`; `contacts`=[]; `paymentMethod`=`CARD` | Gọi `PUT /api/contracts/{id}` 3 lần | `400` | errorCode `validation-failed`; HĐ không đổi | P2 | Có |
| CTR-074 | Boundary | `reason` 500/501; `paymentTermDays` 365/366; SLA 100/100.01 | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Giá trị đúng biên và vượt biên | Gọi `PUT /api/contracts/{id}` 6 lần | `200/400` | Giá trị biên lưu được; vượt biên trả `400` | P3 | Có |
| CTR-075 | Ownership/IDOR | DVKH khác sửa HĐ A | `tokenDVKH_B` (DVKH không phụ trách KH K) | `reason`=`Cập nhật điều khoản`, `contacts` 1 người, 3 mốc ngày, `billingCycle`, `paymentTermDays`, `paymentDueNote`, `paymentMethod` | Gọi `PUT /api/contracts/{id}` | `403/404` | HĐ A không đổi | P1 | Có |
| CTR-076 | Data integrity | Ghi lịch sử kèm lý do | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `reason`=`Cập nhật điều khoản`, `contacts` 1 người, 3 mốc ngày, `billingCycle`, `paymentTermDays`, `paymentDueNote`, `paymentMethod` | Gọi `PUT /api/contracts/{id}` → `GET /api/contracts/{id}/history` | `200` | Có dòng sửa với lý do và giá trị cũ/mới | P2 | Có |
| CTR-077 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Request hợp lệ | Gọi `PUT /api/contracts/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-078 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `PUT /api/contracts/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTR-079 | Error handling | Hợp đồng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/contracts/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Thêm phụ lục hợp đồng khách hàng

**API chính:** `POST /api/contracts/{id}/annexes`  
**Role hợp lệ:** DVKH, NVKD  
**Mục tiêu:** Tạo phụ lục PLCYYMM-XXX, không đổi trạng thái HĐ.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-080 | Happy path | Thêm phụ lục PDF | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `annex`: `name`=`Phụ lục 1`; `file`=PDF 1MB | Gọi `POST /api/contracts/{id}/annexes` → GET HĐ | `200/201` | Phụ lục mã khớp `^PLC\d{4}-\d{3}$`; HĐ vẫn `ACTIVE` (BR-CTR-17) | P1 | Có |
| CTR-081 | Request validation | Thiếu tên hoặc file | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Lần lượt bỏ `annex.name`; bỏ `file` | Gọi `POST /api/contracts/{id}/annexes` 2 lần | `400` | Bị chặn; không tạo phụ lục | P2 | Có |
| CTR-082 | Boundary | File 5MB và 5MB + 1 byte; tên 255/256 | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | PDF 5MB; PDF 5MB + 1 byte; tên 255 và 256 ký tự | Gọi `POST /api/contracts/{id}/annexes` 4 lần | `200/201/400/413` | Giá trị biên thành công; vượt biên bị chặn | P2 | Có |
| CTR-083 | File API | File không phải PDF | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `file` = DOCX | Gọi `POST /api/contracts/{id}/annexes` | `400` | Bị chặn vì phụ lục HĐ KH chỉ nhận PDF | P2 | Có |
| CTR-084 | Business rule | Thêm phụ lục cho HĐ ở trạng thái đóng | `tokenDVKH`; HĐ `CANCELLED`; HĐ `EXPIRED`; HĐ `SUSPENDED` (cùng KH K) | multipart `annex`: `name`=`Phụ lục 1`; `file`=PDF 1MB | Gọi `POST /api/contracts/{id}/annexes` cho từng HĐ → GET HĐ | `200/201` | Cả 3 lần tạo được phụ lục vì UC-CTR-08 cho phép HĐ ở bất kỳ trạng thái nào; trạng thái HĐ giữ nguyên (BR-CTR-17) | P1 | Có |
| CTR-085 | Ownership/IDOR | DVKH khác thêm phụ lục | `tokenDVKH_B` (DVKH không phụ trách KH K) | multipart `annex`: `name`=`Phụ lục 1`; `file`=PDF 1MB | Gọi `POST /api/contracts/{id}/annexes` với id HĐ A | `403/404` | HĐ A không có phụ lục mới | P1 | Có |
| CTR-086 | Data integrity | Không đổi trạng thái HĐ và có lịch sử | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `annex`: `name`=`Phụ lục 1`; `file`=PDF 1MB | Gọi `POST /api/contracts/{id}/annexes` → `GET /api/contracts/{id}/history` | `200` | HĐ giữ trạng thái; lịch sử có dòng thêm phụ lục | P2 | Có |
| CTR-087 | Idempotency | Gửi lại cùng phụ lục | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `annex`: `name`=`Phụ lục 1`; `file`=PDF 1MB | Gọi `POST /api/contracts/{id}/annexes` 2 lần | `200/201` | 2 phụ lục với 2 mã khác nhau, mã tăng dần; không trùng mã | P3 | Có |
| CTR-088 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Request hợp lệ | Gọi `POST /api/contracts/{id}/annexes` → so response với schema Swagger | `200/201` | Wrapper `success`=true, `errorCode` rỗng; `data` có phụ lục (`id`, `code`, `name`, tên file); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-089 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `POST /api/contracts/{id}/annexes` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CTR-090 | Error handling | Hợp đồng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contracts/{id}/annexes` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| CTR-091 | CRUD | Vòng đời phụ lục: thêm, xem, sửa, xóa | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `annex`: `name`=`Phụ lục 1`; `file`=PDF 1MB | Gọi `POST /api/contracts/{id}/annexes` → `GET /api/contracts/{id}` → `PUT /api/contracts/{id}/annexes/{annexId}` → `DELETE /api/contracts/{id}/annexes/{annexId}` | `200/201`, `200`, `200`, `200/204` | Phụ lục xuất hiện, đổi tên, rồi biến mất khỏi chi tiết HĐ | P2 | Có |

## API: Sửa phụ lục hợp đồng khách hàng

**API chính:** `PUT /api/contracts/{id}/annexes/{annexId}`  
**Role hợp lệ:** DVKH, NVKD  
**Mục tiêu:** Sửa tên, mô tả, file; mã không đổi.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-092 | Happy path | Sửa tên và mô tả | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | `name`=`Phụ lục sửa`, `description`=`Mô tả mới` | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` → GET HĐ | `200` | Tên, mô tả mới; mã X1 giữ nguyên | P2 | Có |
| CTR-093 | Business rule | Thay file phụ lục | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | multipart `annex` + `file` PDF mới | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` → `GET /api/contracts/{id}/annexes/{annexId}/file` | `200` | File tải về là file mới; mã không đổi | P2 | Có |
| CTR-094 | Request validation | Tên rỗng | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | `name`=`` | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` | `400` | errorCode `validation-failed` | P3 | Có |
| CTR-095 | Boundary | `description` 1000/1001 ký tự | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | Chuỗi 1000 rồi 1001 ký tự | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` 2 lần | `200/400` | 1000 lưu được; 1001 trả `400` | P3 | Có |
| CTR-096 | Ownership/IDOR | `annexId` thuộc HĐ khác | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1; phụ lục X9 của HĐ khác | `id`=HĐ A, `annexId`=X9 | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` | `404` | X9 không đổi | P1 | Có |
| CTR-097 | Data integrity | Ghi lịch sử sửa phụ lục | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | Đổi tên | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` → `GET /api/contracts/{id}/history` | `200` | Có dòng sửa phụ lục | P3 | Có |
| CTR-098 | Request validation | `annexId` sai định dạng UUID | `tokenDVKH` | `annexId` = `abc` | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` với `annexId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTR-099 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | Request hợp lệ | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có phụ lục sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-100 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CTR-101 | Error handling | Phụ lục không tồn tại | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| CTR-102 | Business rule | Sửa phụ lục của HĐ đã hủy | `tokenDVKH`; HĐ `CANCELLED` có phụ lục X5 | `name`=`Phụ lục sửa` | Gọi `PUT /api/contracts/{id}/annexes/{annexId}` → GET HĐ | `200` | Sửa được (UC-CTR-08 áp dụng mọi trạng thái); HĐ vẫn `CANCELLED` | P2 | Có |

## API: Xóa phụ lục hợp đồng khách hàng

**API chính:** `DELETE /api/contracts/{id}/annexes/{annexId}`  
**Role hợp lệ:** DVKH, NVKD  
**Mục tiêu:** Xóa đúng phụ lục thuộc HĐ, có lịch sử.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-103 | Happy path | Xóa phụ lục | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | `annexId`=X1 | Gọi `DELETE /api/contracts/{id}/annexes/{annexId}` → GET HĐ | `200/204` | HĐ không còn X1; trạng thái HĐ giữ nguyên | P2 | Có |
| CTR-104 | Business rule | Xóa phụ lục của HĐ đã hủy | `tokenDVKH`; HĐ `CANCELLED` có phụ lục | `annexId` của HĐ đó | Gọi `DELETE /api/contracts/{id}/annexes/{annexId}` → GET HĐ | `200/204` | Xóa được (UC-CTR-08 áp dụng mọi trạng thái); HĐ vẫn `CANCELLED`; lịch sử có dòng xóa | P2 | Có |
| CTR-105 | Ownership/IDOR | Xóa phụ lục của HĐ khác | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1; X9 thuộc HĐ khác | `id`=HĐ A, `annexId`=X9 | Gọi `DELETE /api/contracts/{id}/annexes/{annexId}` | `404` | X9 còn | P1 | Có |
| CTR-106 | Data integrity | Sau khi xóa không tải được file | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | `annexId`=X1 | Gọi `DELETE /api/contracts/{id}/annexes/{annexId}` → `GET /api/contracts/{id}/annexes/{annexId}/file` | `200/204` rồi `404` | File không còn; lịch sử có dòng xóa | P2 | Có |
| CTR-107 | Request validation | `annexId` sai định dạng UUID | `tokenDVKH` | `annexId` = `abc` | Gọi `DELETE /api/contracts/{id}/annexes/{annexId}` với `annexId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTR-108 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | Request hợp lệ | Gọi `DELETE /api/contracts/{id}/annexes/{annexId}` → so response với schema Swagger | `200/204` | Wrapper `success`=true, `errorCode` rỗng; `data` có kết quả xóa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CTR-109 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `DELETE /api/contracts/{id}/annexes/{annexId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CTR-110 | Error handling | Phụ lục không tồn tại | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `DELETE /api/contracts/{id}/annexes/{annexId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Tải file phụ lục hợp đồng khách hàng

**API chính:** `GET /api/contracts/{id}/annexes/{annexId}/file`  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** Trả đúng file phụ lục trong phạm vi xem.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-111 | Happy path | Tải file phụ lục | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | id của file đã upload ở bước chuẩn bị | Gọi `GET /api/contracts/{id}/annexes/{annexId}/file` | `200` | Nội dung tải về trùng từng byte với file đã upload (so checksum) | P2 | Có |
| CTR-112 | File API | Header của file phụ lục | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | Như case Happy path | Gọi `GET /api/contracts/{id}/annexes/{annexId}/file` → đọc header | `200` | `Content-Type` đúng loại file đã upload; `Content-Disposition` có tên file gốc; `Content-Length` > 0 | P2 | Có |
| CTR-113 | Ownership/IDOR | Tải file phụ lục ngoài phạm vi | `tokenDVKH_B` (DVKH không phụ trách KH K); hoặc `annexId` thuộc HĐ khác | id HĐ A + X1; hoặc HĐ A + X9 | Gọi `GET /api/contracts/{id}/annexes/{annexId}/file` | `403/404` | Không trả nội dung file | P1 | Có |
| CTR-114 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | Request hợp lệ | Gọi `GET /api/contracts/{id}/annexes/{annexId}/file` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân, không bọc wrapper JSON; khi lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CTR-115 | Request validation | `id` sai định dạng UUID | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | `id` = `abc` | Gọi `GET /api/contracts/{id}/annexes/{annexId}/file` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTR-116 | Authentication | Gọi không có token | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | Không gửi header `Authorization` | Gọi `GET /api/contracts/{id}/annexes/{annexId}/file` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTR-117 | Error handling | File phụ lục không tồn tại | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; phụ lục X1 | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contracts/{id}/annexes/{annexId}/file` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Hủy hợp đồng khách hàng

**API chính:** `POST /api/contracts/{id}/cancel`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Chỉ hủy HĐ `PENDING`, có lý do, cập nhật trạng thái KH.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-118 | Happy path | Hủy HĐ chưa hiệu lực | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ P `PENDING` (Ngày hiệu lực > hôm nay) | `reason`=`Khách đổi ý` | Gọi `POST /api/contracts/{id}/cancel` → GET HĐ | `200` | HĐ `CANCELLED`, lưu lý do; bản ghi vẫn GET được (BR-CTR-11) | P1 | Có |
| CTR-119 | State transition | Hủy HĐ không phải `PENDING` | `tokenDVKH`; HĐ `ACTIVE`; HĐ `EXPIRED`; HĐ `CANCELLED` | `reason` hợp lệ | Gọi `POST /api/contracts/{id}/cancel` cho từng HĐ | `400/409` | errorCode `domain-rule-violation`; trạng thái giữ nguyên | P1 | Có |
| CTR-120 | Business rule | KH không còn HĐ hiện hành sau khi hủy | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ P `PENDING` (Ngày hiệu lực > hôm nay); KH K chỉ có HĐ P | `reason` hợp lệ | Gọi `POST /api/contracts/{id}/cancel` → `GET /api/customers/{id}` | `200` | KH `SUSPENDED`, lý do `NO_ACTIVE_CONTRACT` (BR-CTR-04) | P1 | Có |
| CTR-121 | Business rule | KH còn HĐ hiện hành khác | `tokenDVKH`; KH K có HĐ A `ACTIVE` và HĐ tái ký P `PENDING` | `reason` hợp lệ | Hủy HĐ P qua `POST /api/contracts/{id}/cancel` → GET KH | `200` | KH vẫn `ACTIVE` | P2 | Có |
| CTR-122 | Request validation | Thiếu lý do | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ P `PENDING` (Ngày hiệu lực > hôm nay) | Bỏ `reason`; `reason`=`` | Gọi `POST /api/contracts/{id}/cancel` 2 lần | `400` | Bị chặn (BR-CTR-12); HĐ vẫn `PENDING` | P1 | Có |
| CTR-123 | Boundary | `reason` 500/501 ký tự | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ P `PENDING` (Ngày hiệu lực > hôm nay) | Chuỗi 500 rồi 501 ký tự | Gọi `POST /api/contracts/{id}/cancel` | `200/400` | 500 thành công; 501 trả `400` | P3 | Có |
| CTR-124 | Ownership/IDOR | DVKH khác hủy HĐ P | `tokenDVKH_B` (DVKH không phụ trách KH K) | `reason` hợp lệ | Gọi `POST /api/contracts/{id}/cancel` với id HĐ P | `403/404` | HĐ P vẫn `PENDING` | P1 | Có |
| CTR-125 | Idempotency | Hủy lần 2 | `tokenDVKH`; HĐ vừa hủy | `reason` hợp lệ | Gọi `POST /api/contracts/{id}/cancel` lần 2 | `400/409` | Bị chặn; lịch sử chỉ 1 dòng hủy | P2 | Có |
| CTR-126 | Data integrity | Ghi lịch sử hủy | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ P `PENDING` (Ngày hiệu lực > hôm nay) | `reason`=`R-cancel` | Gọi `POST /api/contracts/{id}/cancel` → `GET /api/contracts/{id}/history` | `200` | Có dòng hủy kèm `R-cancel` | P3 | Có |
| CTR-127 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ P `PENDING` (Ngày hiệu lực > hôm nay) | Request hợp lệ | Gọi `POST /api/contracts/{id}/cancel` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ sau khi hủy; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-128 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `POST /api/contracts/{id}/cancel` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTR-129 | Error handling | Hợp đồng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contracts/{id}/cancel` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Gia hạn hợp đồng khách hàng

**API chính:** `POST /api/contracts/{id}/extensions`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Kéo dài Ngày hết hạn, giữ mã HĐ, mở lại HĐ hết hạn.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-130 | Happy path | Gia hạn HĐ `ACTIVE` | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `newExpiry` = Ngày hết hạn cũ + 6 tháng | Gọi `POST /api/contracts/{id}/extensions` → GET HĐ | `200` | Ngày hết hạn mới; mã HĐ không đổi; vẫn `ACTIVE`; lịch sử gia hạn thêm 1 lần | P1 | Có |
| CTR-131 | State transition | Gia hạn HĐ `EXPIRED` | `tokenDVKH`; HĐ E `EXPIRED` là HĐ mới nhất của KH, KH `SUSPENDED` | `newExpiry` = hôm nay + 3 tháng | Gọi `POST /api/contracts/{id}/extensions` → GET HĐ → `GET /api/customers/{id}` | `200` | HĐ `ACTIVE`; KH `ACTIVE` | P1 | Không |
| CTR-132 | Business rule | Ngày hết hạn mới không hợp lệ | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `newExpiry` lần lượt = Ngày hết hạn cũ; trước ngày cũ | Gọi `POST /api/contracts/{id}/extensions` 2 lần | `400/409` | Bị chặn; ngày không đổi | P1 | Có |
| CTR-133 | Business rule | Có HĐ tái ký đang chờ | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; HĐ tái ký `PENDING` hiệu lực từ ngày D | `newExpiry` = D và D + 1 | Gọi `POST /api/contracts/{id}/extensions` 2 lần | `400/409` | Bị chặn vì phải nhỏ hơn D (BR-CTR-09) | P2 | Có |
| CTR-134 | Business rule | Gia hạn HĐ không phải mới nhất hoặc sai trạng thái | `tokenDVKH`; HĐ `PENDING`; HĐ `CANCELLED` | `newExpiry` hợp lệ | Gọi `POST /api/contracts/{id}/extensions` cho từng HĐ | `400/409` | Bị chặn | P2 | Có |
| CTR-135 | Boundary | `newExpiry` = Ngày hết hạn cũ + 1 ngày | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Ngày cũ + 1 | Gọi `POST /api/contracts/{id}/extensions` | `200` | Thành công | P2 | Có |
| CTR-136 | Request validation | Thiếu hoặc sai `newExpiry` | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Bỏ `newExpiry`; `newExpiry`=`2026-02-30` | Gọi `POST /api/contracts/{id}/extensions` 2 lần | `400` | errorCode `validation-failed` | P2 | Có |
| CTR-137 | File API | Gia hạn kèm file phụ lục | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `extension` + `file` PDF | Gọi `POST /api/contracts/{id}/extensions` → GET HĐ | `200` | Tạo phụ lục tự động mã PLC; file tải được | P2 | Có |
| CTR-138 | Ownership/IDOR | DVKH khác gia hạn | `tokenDVKH_B` (DVKH không phụ trách KH K) | `newExpiry` hợp lệ | Gọi `POST /api/contracts/{id}/extensions` với id HĐ A | `403/404` | Ngày hết hạn không đổi | P1 | Có |
| CTR-139 | Idempotency | Gửi lại cùng `newExpiry` | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Cùng `newExpiry` 2 lần | Gọi `POST /api/contracts/{id}/extensions` 2 lần | `200` rồi `400/409` | Lần 2 bị chặn vì không lớn hơn ngày hiện tại; chỉ 1 lần gia hạn | P2 | Có |
| CTR-140 | Data integrity | Gỡ cảnh báo kỳ hạn | `tokenDVKH`; HĐ `ACTIVE` còn 5 ngày, `alertLevel`=`URGENT` | `newExpiry` = +1 năm | Gọi `POST /api/contracts/{id}/extensions` → GET HĐ | `200` | `alertLevel` về `NONE` | P2 | Có |
| CTR-141 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Request hợp lệ | Gọi `POST /api/contracts/{id}/extensions` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ sau khi gia hạn (Ngày hết hạn mới, danh sách gia hạn); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-142 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `POST /api/contracts/{id}/extensions` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTR-143 | Error handling | Hợp đồng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contracts/{id}/extensions` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Tải file của lần gia hạn

**API chính:** `GET /api/contracts/{id}/extensions/{sequence}/file`  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** Trả đúng file của lần gia hạn thứ `sequence`.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-144 | Happy path | Tải file lần gia hạn | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; lần gia hạn 1 có file | id của file đã upload ở bước chuẩn bị | Gọi `GET /api/contracts/{id}/extensions/{sequence}/file` | `200` | Nội dung tải về trùng từng byte với file đã upload (so checksum) | P2 | Có |
| CTR-145 | File API | Header của file lần gia hạn | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; lần gia hạn 1 có file | Như case Happy path | Gọi `GET /api/contracts/{id}/extensions/{sequence}/file` → đọc header | `200` | `Content-Type` đúng loại file đã upload; `Content-Disposition` có tên file gốc; `Content-Length` > 0 | P2 | Có |
| CTR-146 | Ownership/IDOR | Tải file lần gia hạn ngoài phạm vi | `tokenDVKH_B` (DVKH không phụ trách KH K); hoặc `sequence` không có file | id HĐ A, `sequence`=1; hoặc `sequence` của lần gia hạn không kèm file | Gọi `GET /api/contracts/{id}/extensions/{sequence}/file` | `403/404` | Không trả nội dung file | P1 | Có |
| CTR-147 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; lần gia hạn 1 có file | Request hợp lệ | Gọi `GET /api/contracts/{id}/extensions/{sequence}/file` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân, không bọc wrapper JSON; khi lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CTR-148 | Request validation | `id` sai định dạng UUID | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; lần gia hạn 1 có file | `id` = `abc` | Gọi `GET /api/contracts/{id}/extensions/{sequence}/file` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTR-149 | Authentication | Gọi không có token | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; lần gia hạn 1 có file | Không gửi header `Authorization` | Gọi `GET /api/contracts/{id}/extensions/{sequence}/file` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTR-150 | Error handling | File lần gia hạn không tồn tại | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; lần gia hạn 1 có file | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contracts/{id}/extensions/{sequence}/file` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Tải file scan hợp đồng khách hàng

**API chính:** `GET /api/contracts/{id}/file`  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** Trả đúng file scan hiện hành.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-151 | Happy path | Tải file scan HĐ | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | id của file đã upload ở bước chuẩn bị | Gọi `GET /api/contracts/{id}/file` | `200` | Nội dung tải về trùng từng byte với file đã upload (so checksum) | P2 | Có |
| CTR-152 | File API | Header của file scan HĐ | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Như case Happy path | Gọi `GET /api/contracts/{id}/file` → đọc header | `200` | `Content-Type` đúng loại file đã upload; `Content-Disposition` có tên file gốc; `Content-Length` > 0 | P2 | Có |
| CTR-153 | Ownership/IDOR | Tải file scan HĐ ngoài phạm vi | `tokenDVKH_B` (DVKH không phụ trách KH K) | id HĐ A | Gọi `GET /api/contracts/{id}/file` | `403/404` | Không trả nội dung file | P1 | Có |
| CTR-154 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Request hợp lệ | Gọi `GET /api/contracts/{id}/file` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân, không bọc wrapper JSON; khi lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CTR-155 | Request validation | `id` sai định dạng UUID | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `id` = `abc` | Gọi `GET /api/contracts/{id}/file` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTR-156 | Authentication | Gọi không có token | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Không gửi header `Authorization` | Gọi `GET /api/contracts/{id}/file` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTR-157 | Error handling | File scan hđ không tồn tại | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contracts/{id}/file` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Lịch sử thao tác hợp đồng khách hàng

**API chính:** `GET /api/contracts/{id}/history`  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** Lịch sử đủ, mới nhất trước, lọc đúng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-158 | Happy path | Xem lịch sử thao tác hợp đồng | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; đã sửa, thêm phụ lục, gia hạn | Không lọc; `page=1`, `perPage=20` | Gọi `GET /api/contracts/{id}/history` | `200` | Có đủ các thao tác đã làm trong tiền điều kiện; sắp xếp mới nhất trước; mỗi dòng có hành động, người thực hiện, thời gian | P2 | Có |
| CTR-159 | Pagination/filter/sort | Lọc lịch sử theo hành động, người thực hiện, khoảng thời gian, từ khóa | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; đã sửa, thêm phụ lục, gia hạn | Lần lượt: `eventCode`=1 mã hành động; `actorUserId`=user test; `from`/`to` bao quanh thời điểm tạo; `search`=từ khóa trong lý do | Gọi `GET /api/contracts/{id}/history` với từng bộ lọc | `200` | Mỗi lần chỉ trả dòng khớp bộ lọc; tổng trong `meta.pagination` khớp số dòng; không lọc thì đủ mọi dòng | P3 | Có |
| CTR-160 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; đã sửa, thêm phụ lục, gia hạn | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/contracts/{id}/history` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| CTR-161 | Request validation | Tham số thời gian sai định dạng | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; đã sửa, thêm phụ lục, gia hạn | `from` = `2026-13-45` | Gọi `GET /api/contracts/{id}/history` | `400` | errorCode `validation-failed`; không trả `5xx` | P3 | Có |
| CTR-162 | Ownership/IDOR | Xem lịch sử hợp đồng ngoài phạm vi | `tokenDVKH_B` (DVKH không phụ trách KH K) | id HĐ A | Gọi `GET /api/contracts/{id}/history` | `403/404` | Không trả dòng lịch sử nào của bản ghi | P1 | Có |
| CTR-163 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; đã sửa, thêm phụ lục, gia hạn | Request hợp lệ | Gọi `GET /api/contracts/{id}/history` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có danh sách dòng lịch sử (hành động, người thực hiện, thời gian, giá trị cũ/mới) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-164 | Authentication | Gọi không có token | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; đã sửa, thêm phụ lục, gia hạn | Không gửi header `Authorization` | Gọi `GET /api/contracts/{id}/history` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTR-165 | Error handling | Hợp đồng không tồn tại | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; đã sửa, thêm phụ lục, gia hạn | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contracts/{id}/history` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Tái ký hợp đồng khách hàng

**API chính:** `POST /api/contracts/{id}/resign`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Tạo HĐ mới có liên kết tái ký, xử lý đúng HĐ gốc.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-166 | Happy path | Tái ký nối tiếp sau ngày hết hạn gốc | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `contract`: `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`, điều khoản thanh toán; `file` scan PDF; `effectiveFrom` = Ngày hết hạn HĐ A + 1 | Gọi `POST /api/contracts/{id}/resign` → GET HĐ mới → GET HĐ A | `200/201` | HĐ mới mã CTC, `PENDING`, có liên kết Tái ký từ HĐ A (BR-CTR-21); HĐ A giữ `ACTIVE` | P1 | Có |
| CTR-167 | State transition | Tái ký thay thế HĐ đang hiệu lực | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `contract`: `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`, điều khoản thanh toán; `file` scan PDF; `effectiveFrom`=hôm nay; lần 1 không `confirmReplacement`, lần 2 `confirmReplacement`=true | Gọi `POST /api/contracts/{id}/resign` 2 lần → GET HĐ A | `409` rồi `200/201` | Lần 1 errorCode `confirmation-required`, không tạo HĐ; lần 2 HĐ mới `ACTIVE`, HĐ A `SUSPENDED` | P1 | Có |
| CTR-168 | Business rule | KH đã có HĐ `PENDING` | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE`; KH K đã có HĐ tái ký `PENDING` | multipart `contract`: `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`, điều khoản thanh toán; `file` scan PDF | Gọi `POST /api/contracts/{id}/resign` | `400/409` | Bị chặn; không tạo HĐ thứ 2 chờ hiệu lực | P1 | Có |
| CTR-169 | Business rule | Ngày hiệu lực không hợp lệ | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `effectiveFrom` lần lượt = hôm qua; ≤ Ngày hiệu lực HĐ A | Gọi `POST /api/contracts/{id}/resign` 2 lần | `400/409` | Bị chặn | P1 | Có |
| CTR-170 | Business rule | Tái ký từ HĐ gốc đã hủy | `tokenDVKH`; HĐ gốc `CANCELLED` là HĐ được tái ký theo BR-CTR-10 | multipart `contract`: `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`, điều khoản thanh toán; `file` scan PDF; `effectiveFrom`=hôm nay | Gọi `POST /api/contracts/{id}/resign` | `200/201` | Cho phép, không so với Ngày hiệu lực gốc; HĐ gốc giữ `CANCELLED` | P2 | Có |
| CTR-171 | Business rule | Số HĐ trùng trong cùng KH | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `contract`: `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`, điều khoản thanh toán; `file` scan PDF; `contractNumber` = số của HĐ A | Gọi `POST /api/contracts/{id}/resign` | `409` | Bị chặn (BR-CTR-20) | P2 | Có |
| CTR-172 | Request validation | Thiếu file scan hoặc trường bắt buộc | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Bỏ `file`; bỏ `contractNumber`; bỏ `paymentMethod` | Gọi `POST /api/contracts/{id}/resign` 3 lần | `400` | Bị chặn; không tạo HĐ | P2 | Có |
| CTR-173 | Boundary | `effectiveFrom` = hôm nay và `effectiveFrom` = Ngày hiệu lực gốc + 1 | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Hai bộ ngày biên | Gọi `POST /api/contracts/{id}/resign` (dữ liệu riêng cho mỗi lần) | `200/201/409` | Cả 2 hợp lệ về ngày (lần thay thế cần xác nhận) | P3 | Có |
| CTR-174 | Ownership/IDOR | DVKH khác tái ký | `tokenDVKH_B` (DVKH không phụ trách KH K) | multipart `contract`: `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`, điều khoản thanh toán; `file` scan PDF | Gọi `POST /api/contracts/{id}/resign` với id HĐ A | `403/404` | Không tạo HĐ | P1 | Có |
| CTR-175 | Idempotency | Gửi lại cùng request tái ký | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `contract`: `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`, điều khoản thanh toán; `file` scan PDF | Gọi `POST /api/contracts/{id}/resign` 2 lần | `200/201` rồi `400/409` | Chỉ 1 HĐ mới | P2 | Có |
| CTR-176 | Data integrity | Lỗi không đổi HĐ gốc | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `contract`: `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`, điều khoản thanh toán; `file` scan PDF; file scan 0 byte; `confirmReplacement`=true | Gọi `POST /api/contracts/{id}/resign` → GET HĐ A | `400` | HĐ A giữ `ACTIVE` | P1 | Có |
| CTR-177 | File API | File phụ lục kèm tái ký | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | multipart `contract`: `contractNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`, điều khoản thanh toán; `file` scan PDF; `annexFile` PDF | Gọi `POST /api/contracts/{id}/resign` | `200/201` | HĐ mới có phụ lục kèm file | P3 | Có |
| CTR-178 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Request hợp lệ | Gọi `POST /api/contracts/{id}/resign` → so response với schema Swagger | `200/201` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ mới (`id`, `code`, `status`, liên kết HĐ gốc); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-179 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `POST /api/contracts/{id}/resign` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTR-180 | Error handling | Hợp đồng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contracts/{id}/resign` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Dừng khai thác hợp đồng khách hàng

**API chính:** `POST /api/contracts/{id}/suspend`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Chỉ dừng HĐ `ACTIVE`, có lý do, KH chuyển `SUSPENDED`.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-181 | Happy path | Dừng khai thác HĐ đang hiệu lực | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `reason`=`Vi phạm thanh toán` | Gọi `POST /api/contracts/{id}/suspend` → GET HĐ → `GET /api/customers/{id}` | `200` | HĐ `SUSPENDED`; KH `SUSPENDED` lý do `CONTRACT_SUSPENDED` | P1 | Có |
| CTR-182 | State transition | Dừng HĐ không phải `ACTIVE` | `tokenDVKH`; HĐ `PENDING`; `EXPIRED`; `SUSPENDED` | `reason` hợp lệ | Gọi `POST /api/contracts/{id}/suspend` cho từng HĐ | `400/409` | Bị chặn; trạng thái giữ nguyên | P1 | Có |
| CTR-183 | Request validation | Thiếu lý do | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Bỏ `reason` | Gọi `POST /api/contracts/{id}/suspend` | `400` | Bị chặn (BR-CTR-13) | P1 | Có |
| CTR-184 | Boundary | `reason` 500/501 ký tự | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Chuỗi 500 rồi 501 ký tự | Gọi `POST /api/contracts/{id}/suspend` | `200/400` | 500 thành công; 501 trả `400` | P3 | Có |
| CTR-185 | Business rule | HĐ dừng khai thác không còn được sửa hay gia hạn | `tokenDVKH`; HĐ vừa dừng | Body hợp lệ cho sửa và gia hạn | Gọi `POST /api/contracts/{id}/suspend` → `PUT /api/contracts/{id}` → `POST /api/contracts/{id}/extensions` | `400/409` | Cả 2 thao tác sau bị chặn | P2 | Có |
| CTR-186 | Ownership/IDOR | DVKH khác dừng HĐ A | `tokenDVKH_B` (DVKH không phụ trách KH K) | `reason` hợp lệ | Gọi `POST /api/contracts/{id}/suspend` với id HĐ A | `403/404` | HĐ A vẫn `ACTIVE` | P1 | Có |
| CTR-187 | Idempotency | Dừng lần 2 | `tokenDVKH`; HĐ vừa dừng | `reason` hợp lệ | Gọi `POST /api/contracts/{id}/suspend` lần 2 | `400/409` | Bị chặn; lịch sử chỉ 1 dòng | P2 | Có |
| CTR-188 | Data integrity | Ghi lịch sử kèm lý do | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | `reason`=`R-suspend` | Gọi `POST /api/contracts/{id}/suspend` → `GET /api/contracts/{id}/history` | `200` | Có dòng dừng khai thác kèm lý do | P3 | Có |
| CTR-189 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K do DVKH A phụ trách, HĐ A `ACTIVE` | Request hợp lệ | Gọi `POST /api/contracts/{id}/suspend` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ sau khi dừng; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTR-190 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `POST /api/contracts/{id}/suspend` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTR-191 | Error handling | Hợp đồng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contracts/{id}/suspend` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Mã tự sinh của hợp đồng khách hàng và khách hàng

**API chính:** `POST /api/contracts`  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Mã HĐ và mã khách hàng do hệ thống tự sinh theo thứ tự tạo.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTR-192 | Business rule | Mã HĐ khách hàng tự sinh tăng dần theo thứ tự tạo | `tokenNVKD`; 2 Lead `ACTIVE` chưa có HĐ | 2 request upload HĐ hợp lệ cho 2 Lead | Gọi `POST /api/contracts` cho Lead 1 → gọi `POST /api/contracts` cho Lead 2 → so 2 mã HĐ | `200/201` | Cả 2 mã khớp `CTCYYMM-XXX`; mã HĐ tạo sau lớn hơn mã HĐ tạo trước | P1 | Có |
| CTR-193 | Business rule | Mã khách hàng tự sinh tăng dần theo thứ tự chuyển đổi | `tokenNVKD`; 2 Lead `ACTIVE` chưa có HĐ | 2 request upload HĐ hợp lệ cho 2 Lead | Gọi `POST /api/contracts` cho Lead 1 → gọi `POST /api/contracts` cho Lead 2 → `GET /api/customers/{id}` cho 2 khách hàng → so 2 mã khách hàng | `200/201` | Cả 2 khách hàng có mã; phần số mã khách hàng chuyển đổi sau lớn hơn khách hàng chuyển đổi trước | P1 | Có |

## API: Danh sách, tìm kiếm, lọc khách hàng

**API chính:** `GET /api/customers`  
**Role hợp lệ:** DVKH  
**Mục tiêu:** Trả KH chính thức, tìm và lọc đúng, trạng thái HĐ real-time.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-001 | Happy path | Xem danh sách khách hàng | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `page=1`, `perPage=20` | Gọi `GET /api/customers` | `200` | Có KH K; sắp xếp theo ngày trở thành KH mới nhất trước; không có Lead chưa chuyển đổi | P1 | Có |
| CUS-002 | Business rule | Trạng thái HĐ lấy real-time | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; HĐ vừa bị dừng khai thác | Không lọc | Dừng HĐ → gọi `GET /api/customers` | `200` | Dòng KH K hiển thị trạng thái HĐ mới và KH `SUSPENDED` ngay (BR-CUST-04) | P2 | Có |
| CUS-003 | Pagination/filter/sort | Tìm theo tên, mã KH, MST, mã HĐ, ngành hàng | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Lần lượt từng từ khóa của KH K | Gọi `GET /api/customers` với từng `search` | `200` | Cả 5 lần trả KH K (BR-CUST-05) | P2 | Có |
| CUS-004 | Pagination/filter/sort | Lọc nhiều giá trị `status`, `tier`, `contractStatus`, `industryId` | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `status=ACTIVE&status=SUSPENDED`; `tier=STRATEGIC`; `contractStatus=PENDING` | Gọi `GET /api/customers` với từng bộ lọc | `200` | Chỉ trả KH khớp mọi điều kiện | P2 | Có |
| CUS-005 | Pagination/filter/sort | Phân trang không trùng, không sót | `tokenDVKH`; 25 KH | `perPage=10`, `page`=1, 2, 3 | Gọi `GET /api/customers` 3 lần | `200` | 10, 10, 5 dòng; không id lặp | P3 | Có |
| CUS-006 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenDVKH` | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/customers` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| CUS-007 | Request validation | Enum và UUID sai | `tokenDVKH` | `tier=VIP`; `accountManagerId=abc` | Gọi `GET /api/customers` 2 lần | `400` | errorCode `validation-failed` | P3 | Có |
| CUS-008 | Response contract | Response đúng schema Swagger | `tokenDVKH` | Request hợp lệ | Gọi `GET /api/customers` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng KH (`id`, mã KH, tên, MST, `status`, `suspendReason`, `tier`, trạng thái HĐ, người phụ trách) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-009 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `GET /api/customers` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| CUS-010 | Authentication | Token sai chữ ký, hết hạn hoặc là refresh token | `tokenDVKH` | 3 lần gọi: token sửa 1 ký tự; token hết hạn; `Bearer` + refresh token hợp lệ | Gọi `GET /api/customers` lần lượt với 3 token | `401` | Cả 3 lần trả errorCode `authentication-failed` hoặc `authentication-required`; không trả dữ liệu | P1 | Có |
| CUS-011 | Authorization | NVKD xem danh sách khách hàng | `tokenNVKD` | Không lọc | NVKD gọi `GET /api/customers` | `403` | Bị từ chối nếu module KH chỉ dành cho DVKH (giả định, xem Điểm cần xác nhận) | P3 | Có |
| CUS-012 | Input security | Chuỗi tấn công trong `search` | `tokenDVKH` | `search`=`' OR '1'='1` | Gọi `GET /api/customers` | `200/400` | Không `5xx`; không trả thêm KH | P3 | Có |
| CUS-013 | Error handling | Gửi sai phương thức HTTP | `tokenDVKH` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/customers` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Danh sách DVKH để chuyển người phụ trách khách hàng

**API chính:** `GET /api/customers/assignable-managers`  
**Role hợp lệ:** DVKH  
**Mục tiêu:** Chỉ trả DVKH đang hoạt động.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-014 | Happy path | Lấy danh sách DVKH | `tokenDVKH` | Không tham số | Gọi `GET /api/customers/assignable-managers` | `200` | Có DVKH B | P2 | Có |
| CUS-015 | Business rule | Loại tài khoản khóa và role khác | `tokenDVKH`; DVKH bị khóa; NVKD | Không tham số | Gọi `GET /api/customers/assignable-managers` | `200` | Không có tài khoản khóa, không có NVKD (BR-CUST-17) | P2 | Có |
| CUS-016 | Response contract | Response đúng schema Swagger | `tokenDVKH` | Request hợp lệ | Gọi `GET /api/customers/assignable-managers` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng người dùng (`id`, họ tên, email); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-017 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `GET /api/customers/assignable-managers` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P3 | Có |
| CUS-018 | Error handling | Gửi sai phương thức HTTP | `tokenDVKH` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/customers/assignable-managers` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Xuất danh sách khách hàng

**API chính:** `GET /api/customers/export`  
**Role hợp lệ:** DVKH  
**Mục tiêu:** File Excel đúng bộ lọc.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-019 | Happy path | Xuất theo phân hạng | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `tier=REGULAR` | Gọi `GET /api/customers/export` → mở file | `200` | Số dòng khớp `GET /api/customers?tier=REGULAR` (BR-CUST-06) | P2 | Có |
| CUS-020 | File API | Định dạng file | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Không lọc | Gọi `GET /api/customers/export` | `200` | `.xlsx`, `Content-Type` spreadsheetml, có dòng tiêu đề | P2 | Có |
| CUS-021 | Business rule | Không có dữ liệu | `tokenDVKH` | `search`=`khong-ton-tai` | Gọi `GET /api/customers/export` | `400` | Lỗi không có dữ liệu để xuất | P2 | Có |
| CUS-022 | Pagination/filter/sort | Kết hợp bộ lọc | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `status=SUSPENDED&contractStatus=EXPIRED` | Gọi `GET /api/customers/export` | `200/400` | Chỉ KH khớp | P3 | Có |
| CUS-023 | Boundary | Khoảng ngày tạo 1 ngày | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `createdFrom`=`createdTo`=ngày KH K thành KH | Gọi `GET /api/customers/export` | `200` | File có KH K | P3 | Có |
| CUS-024 | Request validation | Ngày sai định dạng | `tokenDVKH` | `createdFrom=04/11/2026` | Gọi `GET /api/customers/export` | `400` | errorCode `validation-failed` | P3 | Có |
| CUS-025 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Request hợp lệ | Gọi `GET /api/customers/export` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân xlsx; lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CUS-026 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `GET /api/customers/export` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CUS-027 | Error handling | Gửi sai phương thức HTTP | `tokenDVKH` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/customers/export` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Chi tiết khách hàng

**API chính:** `GET /api/customers/{id}`  
**Role hợp lệ:** DVKH  
**Mục tiêu:** Trả đủ thông tin KH, HĐ hiện hành, trạng thái và lý do tạm ngưng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-028 | Happy path | Xem chi tiết KH | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | id KH K | Gọi `GET /api/customers/{id}` | `200` | Có mã KH, thông tin công ty, HĐ hiện hành, đầu mối, tài liệu, `tier`, người phụ trách | P1 | Có |
| CUS-029 | Business rule | KH tạm ngưng có lý do | `tokenDVKH`; KH có HĐ duy nhất `PENDING`; KH có HĐ bị dừng | id từng KH | Gọi `GET /api/customers/{id}` 2 lần | `200` | `status`=`SUSPENDED`, `suspendReason` lần lượt `PENDING_CONTRACT`, `CONTRACT_SUSPENDED` | P1 | Có |
| CUS-030 | Ownership/IDOR | DVKH khác xem KH K | `tokenDVKH_B` (DVKH không phụ trách KH K) | id KH K | Gọi `GET /api/customers/{id}` | `403/404` | Không trả dữ liệu KH K (nếu phạm vi theo người phụ trách) | P1 | Có |
| CUS-031 | Request validation | `id` sai định dạng UUID | `tokenDVKH` | `id` = `abc` | Gọi `GET /api/customers/{id}` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CUS-032 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Request hợp lệ | Gọi `GET /api/customers/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có `id`, mã KH, thông tin công ty, `status`, `suspendReason`, `tier`, `creditLimit`, HĐ hiện hành, `contacts`, `documents`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-033 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `GET /api/customers/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| CUS-034 | Error handling | Khách hàng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/customers/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |
| CUS-035 | Business rule | HĐ hiện hành khi KH có nhiều HĐ | `tokenDVKH`; KH K có HĐ `ACTIVE`, HĐ tái ký `PENDING` nối tiếp, 1 HĐ `EXPIRED` cũ, 1 HĐ `CANCELLED` | id KH K | Gọi `GET /api/customers/{id}` → so với `GET /api/contracts?customerId=...` | `200` | HĐ hiện hành là HĐ `ACTIVE`; trạng thái KH `ACTIVE`; HĐ `PENDING`, `EXPIRED`, `CANCELLED` không được chọn làm hiện hành | P1 | Có |
| CUS-036 | Business rule | HĐ hiện hành khi không còn HĐ đang hiệu lực | `tokenDVKH`; KH chỉ còn HĐ `PENDING` và HĐ `EXPIRED` | id KH | Gọi `GET /api/customers/{id}` | `200` | HĐ hiện hành là HĐ `PENDING`; KH `SUSPENDED` lý do `PENDING_CONTRACT` (BR-CUST-09) | P1 | Có |
| CUS-037 | Business rule | HĐ hiện hành khi chỉ còn HĐ đã đóng | `tokenDVKH`; KH có HĐ `EXPIRED` (hiệu lực sau) và HĐ `CANCELLED` | id KH | Gọi `GET /api/customers/{id}` | `200` | KH `SUSPENDED` lý do `NO_ACTIVE_CONTRACT`; HĐ hiện hành là HĐ `EXPIRED` có ngày hiệu lực lớn nhất (thứ tự ưu tiên đã xác nhận với người dùng) | P2 | Có |

## API: Sửa thông tin khách hàng

**API chính:** `PUT /api/customers/{id}`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Sửa thông tin, mã KH cố định, chặn trùng MST.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-038 | Happy path | Sửa tên và địa chỉ | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `companyName` mới, `industryIds`, `route`, `source`, `headOfficeAddress` | Gọi `PUT /api/customers/{id}` → GET KH | `200` | Giá trị mới; mã KH không đổi | P1 | Có |
| CUS-039 | Business rule | Không sửa được mã KH | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `companyName` mới, `industryIds`, `route`, `source`; thêm field mã KH khác | Gọi `PUT /api/customers/{id}` → GET KH | `200/400` | Mã KH giữ nguyên | P2 | Có |
| CUS-040 | Business rule | MST trùng KH hoặc Lead khác | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; KH M có MST `M1` | `companyName` mới, `industryIds`, `route`, `source`, `taxCode`=`M1` | Gọi `PUT /api/customers/{id}` | `409` | Thông báo chung, không lộ tên KH M (BR-CUST-16); MST giữ nguyên | P1 | Có |
| CUS-041 | Business rule | Dữ liệu dùng chung với Lead gốc | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Đổi `companyName` | Gọi `PUT /api/customers/{id}` → `GET /api/customers/{id}/history` | `200` | Lịch sử KH nối tiếp lịch sử Lead và có dòng sửa (BR-CUST-02) | P3 | Có |
| CUS-042 | Request validation | Thiếu trường bắt buộc, MST sai định dạng | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Bỏ `companyName`; `industryIds`=[]; `taxCode`=`12ab` | Gọi `PUT /api/customers/{id}` 3 lần | `400` | errorCode `validation-failed` | P2 | Có |
| CUS-043 | Boundary | `companyName` 255/256; MST 10/13/12 số | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Giá trị biên | Gọi `PUT /api/customers/{id}` 5 lần | `200/400` | 255, MST 10 và 13 số hợp lệ; 256 và MST 12 số trả `400` | P3 | Có |
| CUS-044 | Ownership/IDOR | DVKH khác sửa KH K | `tokenDVKH_B` (DVKH không phụ trách KH K) | `companyName` mới, `industryIds`, `route`, `source` | Gọi `PUT /api/customers/{id}` với id KH K | `403/404` | KH K không đổi | P1 | Có |
| CUS-045 | Data integrity | Ghi lịch sử giá trị cũ, mới | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Đổi `companyName` `X` → `Y` | Gọi `PUT /api/customers/{id}` → `GET /api/customers/{id}/history` | `200` | Có dòng `X` → `Y` | P2 | Có |
| CUS-046 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Request hợp lệ | Gọi `PUT /api/customers/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có KH sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-047 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `PUT /api/customers/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CUS-048 | Error handling | Khách hàng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/customers/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Thêm đầu mối khách hàng

**API chính:** `POST /api/customers/{id}/contacts`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Thêm đầu mối hợp lệ, giữ đúng 1 đầu mối chính.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-049 | Happy path | Thêm đầu mối | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `fullName`=`Đầu mối KH 2`, `phone`=`0987000111` | Gọi `POST /api/customers/{id}/contacts` → GET KH | `201` | KH có thêm đầu mối | P2 | Có |
| CUS-050 | Business rule | Thêm với `primary`=true | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `fullName`=`Đầu mối KH 2`, `phone`=`0987000111`, `primary`=true | Gọi `POST /api/customers/{id}/contacts` → GET KH | `201` | Đầu mối mới là chính, đúng 1 đầu mối chính | P2 | Có |
| CUS-051 | Request validation | Thiếu tên, SĐT sai | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Bỏ `fullName`; `phone`=`84123` | Gọi `POST /api/customers/{id}/contacts` 2 lần | `400` | errorCode `validation-failed` | P2 | Có |
| CUS-052 | Boundary | `fullName` 100/101 ký tự | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Chuỗi biên | Gọi `POST /api/customers/{id}/contacts` 2 lần | `201/400` | 100 thành công; 101 trả `400` | P3 | Có |
| CUS-053 | Ownership/IDOR | DVKH khác thêm đầu mối | `tokenDVKH_B` (DVKH không phụ trách KH K) | `fullName`=`Đầu mối KH 2`, `phone`=`0987000111` | Gọi `POST /api/customers/{id}/contacts` với id KH K | `403/404` | KH K không có đầu mối mới | P1 | Có |
| CUS-054 | Data integrity | Ghi lịch sử | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `fullName`=`Đầu mối KH 2`, `phone`=`0987000111` | Gọi `POST /api/customers/{id}/contacts` → `GET /api/customers/{id}/history` | `200` | Có dòng thêm đầu mối (BR-CUST-15) | P3 | Có |
| CUS-055 | Idempotency | Gửi lại cùng đầu mối | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `fullName`=`Đầu mối KH 2`, `phone`=`0987000111` | Gọi `POST /api/customers/{id}/contacts` 2 lần | `201` | Ghi nhận hành vi thực tế, đối chiếu Điểm cần xác nhận; không `5xx` | P3 | Có |
| CUS-056 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Request hợp lệ | Gọi `POST /api/customers/{id}/contacts` → so response với schema Swagger | `201` | Wrapper `success`=true, `errorCode` rỗng; `data` có đầu mối vừa tạo; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-057 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `POST /api/customers/{id}/contacts` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CUS-058 | Error handling | Khách hàng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/customers/{id}/contacts` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| CUS-059 | CRUD | Vòng đời đầu mối KH: thêm, xem, sửa, xóa | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `fullName`=`Đầu mối KH 2`, `phone`=`0987000111` | Gọi `POST /api/customers/{id}/contacts` → `GET /api/customers/{id}` → `PUT /api/customers/{id}/contacts/{contactId}` → `DELETE /api/customers/{id}/contacts/{contactId}` | `201`, `200`, `200`, `200/204` | GET sau mỗi bước khớp thay đổi; cuối cùng đầu mối không còn | P3 | Có |

## API: Sửa đầu mối khách hàng

**API chính:** `PUT /api/customers/{id}/contacts/{contactId}`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Sửa đúng đầu mối thuộc KH.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-060 | Happy path | Sửa SĐT | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; đầu mối C1 | `fullName`, `phone`=`0909000111` | Gọi `PUT /api/customers/{id}/contacts/{contactId}` | `200` | GET KH trả SĐT mới | P2 | Có |
| CUS-061 | Business rule | Bỏ đánh dấu chính của đầu mối chính duy nhất | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; đầu mối C1 là chính duy nhất | `primary`=false | Gọi `PUT /api/customers/{id}/contacts/{contactId}` → GET KH | `200/400` | KH vẫn có đúng 1 đầu mối chính | P3 | Có |
| CUS-062 | Request validation | Email sai | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; đầu mối C1 | `email`=`x@` | Gọi `PUT /api/customers/{id}/contacts/{contactId}` | `400` | errorCode `validation-failed` | P3 | Có |
| CUS-063 | Boundary | `email` 100/101 ký tự | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; đầu mối C1 | Chuỗi biên | Gọi `PUT /api/customers/{id}/contacts/{contactId}` 2 lần | `200/400` | 100 lưu được; 101 trả `400` | P3 | Có |
| CUS-064 | Ownership/IDOR | `contactId` thuộc KH khác | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; đầu mối C1; C9 thuộc KH khác | `id`=KH K, `contactId`=C9 | Gọi `PUT /api/customers/{id}/contacts/{contactId}` | `404` | C9 không đổi | P1 | Có |
| CUS-065 | Data integrity | Ghi lịch sử | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; đầu mối C1 | Đổi `phone` | Gọi `PUT /api/customers/{id}/contacts/{contactId}` → `GET /api/customers/{id}/history` | `200` | Có dòng sửa đầu mối | P3 | Có |
| CUS-066 | Request validation | `contactId` sai định dạng UUID | `tokenDVKH` | `contactId` = `abc` | Gọi `PUT /api/customers/{id}/contacts/{contactId}` với `contactId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CUS-067 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; đầu mối C1 | Request hợp lệ | Gọi `PUT /api/customers/{id}/contacts/{contactId}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có đầu mối sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-068 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `PUT /api/customers/{id}/contacts/{contactId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CUS-069 | Error handling | Đầu mối không tồn tại | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/customers/{id}/contacts/{contactId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Xóa đầu mối khách hàng

**API chính:** `DELETE /api/customers/{id}/contacts/{contactId}`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Không xóa đầu mối cuối cùng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-070 | Happy path | Xóa đầu mối phụ | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; C1 chính, C2 phụ | `contactId`=C2 | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` | `200/204` | Còn C1 | P2 | Có |
| CUS-071 | Business rule | Xóa đầu mối cuối cùng | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; chỉ còn C1 | `contactId`=C1 | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` | `400/409` | Bị chặn; C1 còn | P1 | Có |
| CUS-072 | Business rule | Xóa đầu mối chính | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; C1 chính, C2 phụ | `contactId`=C1 | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` → GET KH | `200/204` | C2 thành chính | P2 | Có |
| CUS-073 | Boundary | KH còn đúng 2 đầu mối | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; C1, C2 | Xóa C2 rồi C1 | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` 2 lần | `200/204` rồi `400/409` | Lần 2 bị chặn | P3 | Có |
| CUS-074 | Ownership/IDOR | Xóa đầu mối của KH khác | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; C9 thuộc KH khác | `id`=KH K, `contactId`=C9 | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` | `404` | C9 còn | P1 | Có |
| CUS-075 | Data integrity | Xóa lỗi không mất dữ liệu | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; chỉ còn C1 | `contactId`=C1 | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` → GET KH | `400/409` | C1 còn, vẫn là chính | P2 | Có |
| CUS-076 | Request validation | `contactId` sai định dạng UUID | `tokenDVKH` | `contactId` = `abc` | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` với `contactId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CUS-077 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Request hợp lệ | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` → so response với schema Swagger | `200/204` | Wrapper `success`=true, `errorCode` rỗng; `data` có kết quả xóa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CUS-078 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CUS-079 | Error handling | Đầu mối không tồn tại | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `DELETE /api/customers/{id}/contacts/{contactId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Đặt đầu mối chính của khách hàng

**API chính:** `POST /api/customers/{id}/contacts/{contactId}/primary`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Luôn đúng 1 đầu mối chính.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-080 | Happy path | Đặt đầu mối phụ thành chính | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; C1 chính, C2 phụ | `contactId`=C2 | Gọi `POST /api/customers/{id}/contacts/{contactId}/primary` → GET KH | `200` | C2 chính, C1 phụ | P2 | Có |
| CUS-081 | Business rule | Đặt chính cho đầu mối đã là chính | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; C1 chính | `contactId`=C1 | Gọi `POST /api/customers/{id}/contacts/{contactId}/primary` | `200/400` | Không phát sinh 2 đầu mối chính | P3 | Có |
| CUS-082 | Idempotency | Gọi 2 lần cùng đầu mối | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; C2 phụ | `contactId`=C2 | Gọi `POST /api/customers/{id}/contacts/{contactId}/primary` 2 lần | `200` | Vẫn đúng 1 đầu mối chính là C2 | P3 | Có |
| CUS-083 | Ownership/IDOR | Đầu mối của KH khác | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; C9 thuộc KH khác | `id`=KH K, `contactId`=C9 | Gọi `POST /api/customers/{id}/contacts/{contactId}/primary` | `404` | Không đổi đầu mối chính của cả 2 KH | P1 | Có |
| CUS-084 | Data integrity | Ghi lịch sử đổi đầu mối chính | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; C2 phụ | `contactId`=C2 | Gọi `POST /api/customers/{id}/contacts/{contactId}/primary` → `GET /api/customers/{id}/history` | `200` | Có dòng đổi đầu mối chính | P3 | Có |
| CUS-085 | Request validation | `contactId` sai định dạng UUID | `tokenDVKH` | `contactId` = `abc` | Gọi `POST /api/customers/{id}/contacts/{contactId}/primary` với `contactId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CUS-086 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Request hợp lệ | Gọi `POST /api/customers/{id}/contacts/{contactId}/primary` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có đầu mối chính mới hoặc KH sau khi đổi; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-087 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `POST /api/customers/{id}/contacts/{contactId}/primary` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CUS-088 | Error handling | Đầu mối không tồn tại | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/customers/{id}/contacts/{contactId}/primary` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Đặt hạn mức tín dụng khách hàng

**API chính:** `PUT /api/customers/{id}/credit-limit`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Lưu hạn mức ≥ 0, không đổi trạng thái KH.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-089 | Happy path | Đặt hạn mức 500.000.000 | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `creditLimit`=500000000 | Gọi `PUT /api/customers/{id}/credit-limit` → GET KH | `200` | `creditLimit`=500000000; trạng thái KH không đổi (BR-CUST-18) | P2 | Có |
| CUS-090 | Boundary | Hạn mức 0, -0.01, số rất lớn | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `creditLimit` = 0; -0.01; 999999999999999 | Gọi `PUT /api/customers/{id}/credit-limit` 3 lần | `200/400` | 0 hợp lệ; số âm trả `400`; số lớn lưu đúng hoặc báo lỗi rõ, không `5xx` | P2 | Có |
| CUS-091 | Request validation | Thiếu hoặc sai kiểu | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Body rỗng; `creditLimit`=`abc` | Gọi `PUT /api/customers/{id}/credit-limit` 2 lần | `400` | errorCode `validation-failed` hoặc `malformed-request` | P3 | Có |
| CUS-092 | Business rule | Hạn mức không ràng buộc trạng thái | `tokenDVKH`; KH `SUSPENDED` | `creditLimit`=0 | Gọi `PUT /api/customers/{id}/credit-limit` → GET KH | `200` | Lưu được; KH vẫn `SUSPENDED` | P3 | Có |
| CUS-093 | Ownership/IDOR | DVKH khác đặt hạn mức | `tokenDVKH_B` (DVKH không phụ trách KH K) | `creditLimit`=1 | Gọi `PUT /api/customers/{id}/credit-limit` với id KH K | `403/404` | Hạn mức KH K không đổi | P1 | Có |
| CUS-094 | Data integrity | Ghi lịch sử | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | 100 → 200 | Gọi `PUT /api/customers/{id}/credit-limit` → `GET /api/customers/{id}/history` | `200` | Có dòng giá trị cũ 100, mới 200 | P3 | Có |
| CUS-095 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Request hợp lệ | Gọi `PUT /api/customers/{id}/credit-limit` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có KH hoặc hạn mức sau khi cập nhật; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-096 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `PUT /api/customers/{id}/credit-limit` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CUS-097 | Error handling | Khách hàng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/customers/{id}/credit-limit` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Tải tài liệu khách hàng (từ giai đoạn Lead)

**API chính:** `GET /api/customers/{id}/documents/{documentId}`  
**Role hợp lệ:** DVKH  
**Mục tiêu:** Tài liệu của Lead đi theo KH và tải được.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-098 | Happy path | Tải tài liệu KH | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc có tài liệu D1 trước khi chuyển đổi | id của file đã upload ở bước chuẩn bị | Gọi `GET /api/customers/{id}/documents/{documentId}` | `200` | Nội dung tải về trùng từng byte với file đã upload (so checksum) | P2 | Có |
| CUS-099 | File API | Header của tài liệu KH | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc có tài liệu D1 trước khi chuyển đổi | Như case Happy path | Gọi `GET /api/customers/{id}/documents/{documentId}` → đọc header | `200` | `Content-Type` đúng loại file đã upload; `Content-Disposition` có tên file gốc; `Content-Length` > 0 | P2 | Có |
| CUS-100 | Ownership/IDOR | Tải tài liệu KH ngoài phạm vi | `tokenDVKH_B` (DVKH không phụ trách KH K); hoặc `documentId` thuộc KH khác | id KH K + D1; hoặc KH K + D9 | Gọi `GET /api/customers/{id}/documents/{documentId}` | `403/404` | Không trả nội dung file | P1 | Có |
| CUS-101 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc có tài liệu D1 trước khi chuyển đổi | Request hợp lệ | Gọi `GET /api/customers/{id}/documents/{documentId}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân, không bọc wrapper JSON; khi lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CUS-102 | Request validation | `id` sai định dạng UUID | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc có tài liệu D1 trước khi chuyển đổi | `id` = `abc` | Gọi `GET /api/customers/{id}/documents/{documentId}` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CUS-103 | Authentication | Gọi không có token | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc có tài liệu D1 trước khi chuyển đổi | Không gửi header `Authorization` | Gọi `GET /api/customers/{id}/documents/{documentId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CUS-104 | Error handling | Tài liệu kh không tồn tại | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc có tài liệu D1 trước khi chuyển đổi | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/customers/{id}/documents/{documentId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Lịch sử thao tác khách hàng

**API chính:** `GET /api/customers/{id}/history`  
**Role hợp lệ:** DVKH  
**Mục tiêu:** Lịch sử gồm cả giai đoạn Lead, mới nhất trước.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-105 | Happy path | Xem lịch sử thao tác khách hàng | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc đã được sửa trước khi chuyển đổi; KH đã sửa, đổi hạng | Không lọc; `page=1`, `perPage=20` | Gọi `GET /api/customers/{id}/history` | `200` | Có đủ các thao tác đã làm trong tiền điều kiện; sắp xếp mới nhất trước; mỗi dòng có hành động, người thực hiện, thời gian | P2 | Có |
| CUS-106 | Pagination/filter/sort | Lọc lịch sử theo hành động, người thực hiện, khoảng thời gian, từ khóa | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc đã được sửa trước khi chuyển đổi; KH đã sửa, đổi hạng | Lần lượt: `eventCode`=1 mã hành động; `actorUserId`=user test; `from`/`to` bao quanh thời điểm tạo; `search`=từ khóa trong lý do | Gọi `GET /api/customers/{id}/history` với từng bộ lọc | `200` | Mỗi lần chỉ trả dòng khớp bộ lọc; tổng trong `meta.pagination` khớp số dòng; không lọc thì đủ mọi dòng | P3 | Có |
| CUS-107 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc đã được sửa trước khi chuyển đổi; KH đã sửa, đổi hạng | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/customers/{id}/history` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| CUS-108 | Request validation | Tham số thời gian sai định dạng | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc đã được sửa trước khi chuyển đổi; KH đã sửa, đổi hạng | `from` = `2026-13-45` | Gọi `GET /api/customers/{id}/history` | `400` | errorCode `validation-failed`; không trả `5xx` | P3 | Có |
| CUS-109 | Ownership/IDOR | Xem lịch sử khách hàng ngoài phạm vi | `tokenDVKH_B` (DVKH không phụ trách KH K) | id KH K | Gọi `GET /api/customers/{id}/history` | `403/404` | Không trả dòng lịch sử nào của bản ghi | P1 | Có |
| CUS-110 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc đã được sửa trước khi chuyển đổi; KH đã sửa, đổi hạng | Request hợp lệ | Gọi `GET /api/customers/{id}/history` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có danh sách dòng lịch sử (hành động, người thực hiện, thời gian, giá trị cũ/mới) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-111 | Authentication | Gọi không có token | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc đã được sửa trước khi chuyển đổi; KH đã sửa, đổi hạng | Không gửi header `Authorization` | Gọi `GET /api/customers/{id}/history` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CUS-112 | Error handling | Khách hàng không tồn tại | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; Lead gốc đã được sửa trước khi chuyển đổi; KH đã sửa, đổi hạng | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/customers/{id}/history` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Cập nhật phân hạng khách hàng

**API chính:** `PUT /api/customers/{id}/tier`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Đổi hạng KH, HĐ giữ nguyên.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-113 | Happy path | Đổi từ Thường sang Chiến lược | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; `tier`=`REGULAR` | `tier`=`STRATEGIC` | Gọi `PUT /api/customers/{id}/tier` → GET KH | `200` | `tier`=`STRATEGIC`; `customerTier` trên HĐ cũ giữ nguyên | P1 | Có |
| CUS-114 | Business rule | Đổi sang đúng hạng hiện tại | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; `tier`=`REGULAR` | `tier`=`REGULAR` | Gọi `PUT /api/customers/{id}/tier` | `400/409` | Bị chặn vì hạng mới phải khác hạng hiện tại | P2 | Có |
| CUS-115 | Request validation | Hạng không hợp lệ | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `tier`=`GOLD`; bỏ `tier` | Gọi `PUT /api/customers/{id}/tier` 2 lần | `400` | errorCode `validation-failed` | P2 | Có |
| CUS-116 | Boundary | Hai giá trị enum duy nhất | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Đổi `REGULAR` → `STRATEGIC` → `REGULAR` | Gọi `PUT /api/customers/{id}/tier` 2 lần | `200` | Cả 2 lần thành công | P3 | Có |
| CUS-117 | Ownership/IDOR | DVKH khác đổi hạng | `tokenDVKH_B` (DVKH không phụ trách KH K) | `tier`=`STRATEGIC` | Gọi `PUT /api/customers/{id}/tier` với id KH K | `403/404` | Hạng không đổi | P1 | Có |
| CUS-118 | Data integrity | Ghi lịch sử hạng cũ, mới | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Đổi hạng | Gọi `PUT /api/customers/{id}/tier` → `GET /api/customers/{id}/history` | `200` | Có dòng hạng cũ → mới (Swagger không có lý do, SRS yêu cầu lý do: xem Điểm cần xác nhận) | P3 | Có |
| CUS-119 | Response contract | Response đúng schema Swagger | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Request hợp lệ | Gọi `PUT /api/customers/{id}/tier` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có KH sau khi đổi hạng; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CUS-120 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `PUT /api/customers/{id}/tier` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CUS-121 | Error handling | Khách hàng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/customers/{id}/tier` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Chuyển người phụ trách khách hàng

**API chính:** `POST /api/customers/{id}/transfer-account-manager`  
**Role hợp lệ:** DVKH (người phụ trách hiện tại)  
**Mục tiêu:** Đổi người phụ trách trên KH và HĐ còn hiệu lực, người cũ mất quyền.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CUS-122 | Happy path | Chuyển KH cho DVKH B | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; có thêm HĐ `PENDING` và 1 HĐ `EXPIRED` | `newAccountManagerId`=DVKH B, `reason`=`Phân lại danh mục` | Gọi `POST /api/customers/{id}/transfer-account-manager` → DVKH B gọi `GET /api/customers/{id}` | `204` | KH và HĐ `ACTIVE`, `PENDING` đổi sang DVKH B; HĐ `EXPIRED` giữ DVKH A (BR-CUST-07) | P1 | Có |
| CUS-123 | Business rule | KH không còn HĐ chưa hết hiệu lực | `tokenDVKH`; KH chỉ có HĐ `EXPIRED` | `newAccountManagerId`=DVKH B, `reason`=`Phân lại danh mục` | Gọi `POST /api/customers/{id}/transfer-account-manager` | `400/409` | Bị chặn (BR-CUST-08) | P1 | Có |
| CUS-124 | Business rule | Người mới trùng người cũ hoặc không hợp lệ | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `newAccountManagerId` = DVKH A; = DVKH bị khóa; = NVKD | Gọi `POST /api/customers/{id}/transfer-account-manager` 3 lần | `400/409` | Bị chặn | P2 | Có |
| CUS-125 | Request validation | Thiếu lý do hoặc người mới | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Bỏ `reason`; bỏ `newAccountManagerId` | Gọi `POST /api/customers/{id}/transfer-account-manager` 2 lần | `400` | errorCode `validation-failed` | P1 | Có |
| CUS-126 | Boundary | `reason` 500/501 ký tự | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Chuỗi biên | Gọi `POST /api/customers/{id}/transfer-account-manager` | `204/400` | 500 thành công; 501 trả `400` | P3 | Có |
| CUS-127 | Ownership/IDOR | DVKH không phụ trách chuyển KH K | `tokenDVKH_B` (DVKH không phụ trách KH K) | `newAccountManagerId`=DVKH C, `reason`=`Phân lại danh mục` | Gọi `POST /api/customers/{id}/transfer-account-manager` với id KH K | `403/404` | Người phụ trách không đổi | P1 | Có |
| CUS-128 | Data integrity | Người cũ mất quyền | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | `newAccountManagerId`=DVKH B, `reason`=`Phân lại danh mục` | Gọi `POST /api/customers/{id}/transfer-account-manager` → DVKH A gọi `GET /api/customers/{id}` | `204` rồi `403/404` | DVKH A không còn xem, sửa KH K | P1 | Có |
| CUS-129 | Idempotency | Người cũ gửi lại yêu cầu | `tokenDVKH`; KH vừa chuyển sang DVKH B | `newAccountManagerId`=DVKH B, `reason`=`Phân lại danh mục` | DVKH A gọi `POST /api/customers/{id}/transfer-account-manager` lần 2 | `403/404` | Bị chặn | P2 | Có |
| CUS-130 | Concurrency | Chuyển song song cho 2 người | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; DVKH B, DVKH C | 2 body khác người mới | Gọi `POST /api/customers/{id}/transfer-account-manager` song song | `204` và `403/404/409` | Chỉ 1 thành công; KH và HĐ cùng 1 người phụ trách | P3 | Có |
| CUS-131 | Response contract | Response 204 không có body | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE` | Request hợp lệ | Gọi `POST /api/customers/{id}/transfer-account-manager` → đọc status, header và body | `204` | Body rỗng, không có wrapper JSON; không có `Content-Type` JSON bắt buộc; client không parse JSON khi nhận 204 | P3 | Có |
| CUS-132 | Authentication | Gọi không có token | `tokenDVKH` | Không gửi header `Authorization` | Gọi `POST /api/customers/{id}/transfer-account-manager` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CUS-133 | Error handling | Khách hàng không tồn tại | `tokenDVKH` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/customers/{id}/transfer-account-manager` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| CUS-134 | Data integrity | Đọc lại từng HĐ sau khi chuyển | `tokenDVKH`; KH K `ACTIVE` do DVKH A phụ trách, có HĐ `ACTIVE`; KH có HĐ `ACTIVE`, `PENDING`, `EXPIRED`, `SUSPENDED`, `CANCELLED` | `newAccountManagerId`=DVKH B, `reason`=`Phân lại danh mục` | Gọi `POST /api/customers/{id}/transfer-account-manager` → `GET /api/contracts/{id}` cho từng HĐ | `204` rồi `200` | HĐ `ACTIVE` và `PENDING` có người phụ trách DVKH B; HĐ `EXPIRED`, `SUSPENDED`, `CANCELLED` giữ DVKH A (BR-CUST-07); lịch sử từng HĐ đổi có dòng chuyển | P1 | Có |
| CUS-135 | Ownership/IDOR | Người cũ thử thao tác ghi sau khi chuyển | `tokenDVKH`; KH K vừa chuyển sang DVKH B | Body hợp lệ cho từng API | DVKH A gọi `PUT /api/customers/{id}` → `PUT /api/customers/{id}/tier` → `PUT /api/contracts/{id}` → `POST /api/contracts/{id}/extensions` → `POST /api/contracts/{id}/suspend` | `403/404` | Cả 5 lần bị chặn; KH và HĐ không đổi; không sinh dòng lịch sử nào | P1 | Có |

## API: Danh sách, tìm kiếm, lọc nhà thầu

**API chính:** `GET /api/contractors`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Trả nhà thầu mới nhất trước, tìm và lọc đúng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-001 | Happy path | Xem danh sách nhà thầu | `tokenQLNT`; có 3 nhà thầu tạo lần lượt | `page=1`, `perPage=20` | Gọi `GET /api/contractors` | `200` | Nhà thầu tạo sau đứng trước | P1 | Có |
| VDR-002 | Pagination/filter/sort | Tìm theo mã, tên, MST | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Lần lượt mã `VDR-...`, một phần tên, MST | Gọi `GET /api/contractors` với từng `search` | `200` | Cả 3 lần trả nhà thầu N | P2 | Có |
| VDR-003 | Pagination/filter/sort | Lọc trạng thái, hạng, nhiều loại hình dịch vụ, khoảng ngày tạo | `tokenQLNT`; nhà thầu ở 4 trạng thái | `status`=Tạo mới; `tier`; `serviceType` 2 giá trị; `createdFrom`/`createdTo` | Gọi `GET /api/contractors` với từng bộ lọc | `200` | Chỉ trả nhà thầu khớp; `serviceType` 2 giá trị trả hợp | P2 | Có |
| VDR-004 | Pagination/filter/sort | Phân trang không trùng, không sót | `tokenQLNT`; 25 nhà thầu | `perPage=10`, `page`=1, 2, 3 | Gọi `GET /api/contractors` 3 lần | `200` | 10, 10, 5 dòng; không id lặp | P3 | Có |
| VDR-005 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenQLNT` | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/contractors` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| VDR-006 | Request validation | Ngày sai định dạng, trạng thái lạ | `tokenQLNT` | `createdFrom=2026-02-30`; `status=XYZ` | Gọi `GET /api/contractors` 2 lần | `400` | errorCode `validation-failed` (giá trị `status` hợp lệ: xem Điểm cần xác nhận) | P3 | Có |
| VDR-007 | Response contract | Response đúng schema Swagger | `tokenQLNT` | Request hợp lệ | Gọi `GET /api/contractors` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng nhà thầu (`id`, `code` dạng `VDR-XXXX`, `name`, `taxCode`, `status`, `tier`, `serviceTypes`) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-008 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `GET /api/contractors` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| VDR-009 | Authentication | Token sai chữ ký, hết hạn hoặc là refresh token | `tokenQLNT` | 3 lần gọi: token sửa 1 ký tự; token hết hạn; `Bearer` + refresh token hợp lệ | Gọi `GET /api/contractors` lần lượt với 3 token | `401` | Cả 3 lần trả errorCode `authentication-failed` hoặc `authentication-required`; không trả dữ liệu | P1 | Có |
| VDR-010 | Authorization | Role kinh doanh xem danh sách nhà thầu | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | Không lọc | Gọi `GET /api/contractors` | `403` | errorCode `access-denied` (giả định role) | P2 | Có |
| VDR-011 | Input security | Chuỗi tấn công trong `search` | `tokenQLNT` | `search`=`' OR 1=1 --` | Gọi `GET /api/contractors` | `200/400` | Không `5xx`; không lộ SQL | P3 | Có |
| VDR-012 | Error handling | Gửi sai phương thức HTTP | `tokenQLNT` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contractors` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Tạo nhà thầu

**API chính:** `POST /api/contractors`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Tạo nhà thầu Tạo mới, mã VDR-XXXX, chặn trùng MST.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-013 | Happy path | Tạo nhà thầu đủ trường bắt buộc | `tokenQLNT` | `name`, `taxCode` 10 số mới, `serviceTypes` 1 loại, `tier` hợp lệ, `recommendedCapacity`, `capabilityDescription`, `performanceScore`=4, `contacts` 1 người (`fullName`, `phone`=`0912000111`) | Gọi `POST /api/contractors` → `GET /api/contractors/{id}` | `201` | `code` khớp `^VDR-\d{4}$`; trạng thái Tạo mới; dữ liệu GET khớp body | P1 | Có |
| VDR-014 | State transition | Nhà thầu mới luôn ở Tạo mới | `tokenQLNT` | `name`, `taxCode` 10 số mới, `serviceTypes` 1 loại, `tier` hợp lệ, `recommendedCapacity`, `capabilityDescription`, `performanceScore`=4, `contacts` 1 người (`fullName`, `phone`=`0912000111`); thêm `status` = Đang hoạt động | Gọi `POST /api/contractors` | `201` | Trạng thái Tạo mới; field gửi kèm bị bỏ qua | P1 | Có |
| VDR-015 | Request validation | Thiếu từng trường bắt buộc | `tokenQLNT` | Mỗi lần bỏ 1 trong: `name`, `taxCode`, `serviceTypes`, `tier`, `recommendedCapacity`, `capabilityDescription`, `performanceScore`, `contacts` | Gọi `POST /api/contractors` 8 lần | `400` | errorCode `validation-failed` đúng trường; không tạo | P1 | Có |
| VDR-016 | Request validation | Sai định dạng MST, SĐT, email, `backupContractorId` | `tokenQLNT` | `taxCode`=`12ab`; `phone`=`123`; `email`=`a@`; `backupContractorId`=`abc` | Gọi `POST /api/contractors` 4 lần | `400` | errorCode `validation-failed` | P2 | Có |
| VDR-017 | Boundary | MST 9/10/11/13/14 số | `tokenQLNT` | MST mới đủ độ dài | Gọi `POST /api/contractors` 5 lần | `201/400` | 10 và 13 số tạo được; còn lại `400` | P1 | Có |
| VDR-018 | Boundary | `performanceScore` 0, 5, 5.01, -0.01 | `tokenQLNT` | 4 giá trị | Gọi `POST /api/contractors` 4 lần | `201/400` | 0 và 5 hợp lệ; 5.01 và -0.01 trả `400` | P2 | Có |
| VDR-019 | Boundary | `name` 255/256, `operationalNote` 2000/2001 | `tokenQLNT` | Chuỗi biên | Gọi `POST /api/contractors` 4 lần | `201/400` | Đúng max tạo được; vượt 1 ký tự trả `400` | P3 | Có |
| VDR-020 | Business rule | MST đã tồn tại | `tokenQLNT`; nhà thầu X có MST `M1` | `name`, `taxCode` 10 số mới, `serviceTypes` 1 loại, `tier` hợp lệ, `recommendedCapacity`, `capabilityDescription`, `performanceScore`=4, `contacts` 1 người (`fullName`, `phone`=`0912000111`), `taxCode`=`M1` | Gọi `POST /api/contractors` | `409` | Lỗi kèm mã nhà thầu cũ; không tạo | P1 | Có |
| VDR-021 | Business rule | Nhà thầu dự phòng không hợp lệ | `tokenQLNT` | `backupContractorId` = nhà thầu Dừng hợp tác; = UUID không tồn tại | Gọi `POST /api/contractors` 2 lần | `400/404/409` | Bị chặn hoặc ghi rõ hành vi trong Điểm cần xác nhận | P3 | Có |
| VDR-022 | Business rule | 2 đầu mối cùng là chính | `tokenQLNT` | `contacts` 2 người `primary`=true | Gọi `POST /api/contractors` → GET nhà thầu | `201/400` | Không có 2 đầu mối chính (BR-VD-12) | P2 | Có |
| VDR-023 | Data integrity | Request lỗi không để lại dữ liệu | `tokenQLNT` | Body có đầu mối thứ 2 sai SĐT | Gọi `POST /api/contractors` → gọi lại body đúng cùng MST | `400` rồi `201` | Lần 1 không tạo gì; lần 2 tạo được | P1 | Có |
| VDR-024 | Idempotency | Gửi lại cùng request | `tokenQLNT` | `name`, `taxCode` 10 số mới, `serviceTypes` 1 loại, `tier` hợp lệ, `recommendedCapacity`, `capabilityDescription`, `performanceScore`=4, `contacts` 1 người (`fullName`, `phone`=`0912000111`) | Gọi `POST /api/contractors` 2 lần | `201` rồi `409` | Chỉ 1 nhà thầu | P2 | Có |
| VDR-025 | Concurrency | 2 request cùng MST đồng thời | `tokenQLNT` | 2 body cùng MST mới | Gọi `POST /api/contractors` song song | `201` và `409` | Đúng 1 nhà thầu được tạo | P2 | Có |
| VDR-026 | Input security | Payload XSS trong tên nhà thầu | `tokenQLNT` | `name` = `xssPayload` | Gọi `POST /api/contractors` → GET | `201/400` | Lưu dạng text; UI hiển thị đã escape | P2 | Có |
| VDR-027 | Authorization | Role kinh doanh tạo nhà thầu | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `name`, `taxCode` 10 số mới, `serviceTypes` 1 loại, `tier` hợp lệ, `recommendedCapacity`, `capabilityDescription`, `performanceScore`=4, `contacts` 1 người (`fullName`, `phone`=`0912000111`) | Gọi `POST /api/contractors` | `403` | errorCode `access-denied`; không tạo (giả định role) | P1 | Có |
| VDR-028 | Response contract | Response đúng schema Swagger | `tokenQLNT` | Request hợp lệ | Gọi `POST /api/contractors` → so response với schema Swagger | `201` | Wrapper `success`=true, `errorCode` rỗng; `data` có `id`, `code`, `name`, `taxCode`, `status`, `tier`, `serviceTypes`, `contacts`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-029 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractors` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| VDR-030 | Error handling | Body JSON sai cú pháp | `tokenQLNT` | Body `{"name": ` (thiếu dấu đóng) | Gọi `POST /api/contractors` với body hỏng | `400` | errorCode `malformed-request`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không ghi dữ liệu | P3 | Có |
| VDR-031 | CRUD | Vòng đời nhà thầu: tạo, xem, sửa, xóa | `tokenQLNT` | `name`, `taxCode` 10 số mới, `serviceTypes` 1 loại, `tier` hợp lệ, `recommendedCapacity`, `capabilityDescription`, `performanceScore`=4, `contacts` 1 người (`fullName`, `phone`=`0912000111`) | Gọi `POST /api/contractors` → `GET /api/contractors/{id}` → `PUT /api/contractors/{id}` → `DELETE /api/contractors/{id}` → `GET /api/contractors/{id}` | `201`, `200`, `200`, `204`, `404` | Dữ liệu GET khớp từng bước; sau khi xóa trả `404` | P2 | Có |

## API: Xuất danh sách nhà thầu

**API chính:** `GET /api/contractors/export`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** File Excel đúng bộ lọc, có ghi lịch sử xuất.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-032 | Happy path | Xuất theo trạng thái | `tokenQLNT`; có nhà thầu Tạo mới | `status`=Tạo mới | Gọi `GET /api/contractors/export` → mở file | `200` | Số dòng khớp `GET /api/contractors` cùng bộ lọc | P2 | Có |
| VDR-033 | File API | Định dạng file | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Không lọc | Gọi `GET /api/contractors/export` | `200` | `.xlsx`, `Content-Type` spreadsheetml, có dòng tiêu đề | P2 | Có |
| VDR-034 | Business rule | Không có dữ liệu | `tokenQLNT` | `search`=`khong-ton-tai` | Gọi `GET /api/contractors/export` | `400` | Lỗi không có dữ liệu để xuất | P2 | Có |
| VDR-035 | Pagination/filter/sort | Kết hợp bộ lọc | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `tier` + `serviceType` + khoảng ngày | Gọi `GET /api/contractors/export` | `200/400` | Chỉ nhà thầu khớp | P3 | Có |
| VDR-036 | Boundary | Khoảng ngày tạo 1 ngày | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `createdFrom`=`createdTo`=hôm nay | Gọi `GET /api/contractors/export` | `200` | File có nhà thầu N; giới hạn 50.000 dòng không kiểm được tự động (xem Không áp dụng) | P3 | Có |
| VDR-037 | Request validation | Ngày sai định dạng | `tokenQLNT` | `createdTo=2026-13-01` | Gọi `GET /api/contractors/export` | `400` | errorCode `validation-failed` | P3 | Có |
| VDR-038 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Request hợp lệ | Gọi `GET /api/contractors/export` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân xlsx; lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| VDR-039 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `GET /api/contractors/export` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| VDR-040 | Error handling | Gửi sai phương thức HTTP | `tokenQLNT` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contractors/export` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Số liệu tổng quan nhà thầu

**API chính:** `GET /api/contractors/stats`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Tổng và phân bổ theo trạng thái, hạng, không phụ thuộc bộ lọc.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-041 | Happy path | Xem số liệu | `tokenQLNT` | Không tham số | Gọi `GET /api/contractors/stats` | `200` | Có tổng, phân bổ theo trạng thái và theo hạng; tổng theo trạng thái = tổng chung | P2 | Có |
| VDR-042 | Business rule | Số liệu đổi theo thao tác | `tokenQLNT` | Ghi nhận ban đầu | Gọi `GET /api/contractors/stats` → tạo 1 nhà thầu → gọi lại `GET /api/contractors/stats` | `200` | Tổng +1, Tạo mới +1 | P2 | Có |
| VDR-043 | Business rule | Không phụ thuộc bộ lọc danh sách | `tokenQLNT` | Thêm `status`=Tạo mới vào query | Gọi `GET /api/contractors/stats` có và không có query | `200` | 2 kết quả giống nhau | P3 | Có |
| VDR-044 | Response contract | Response đúng schema Swagger | `tokenQLNT` | Request hợp lệ | Gọi `GET /api/contractors/stats` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có số đếm nguyên không âm theo trạng thái và hạng; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-045 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `GET /api/contractors/stats` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P3 | Có |
| VDR-046 | Error handling | Gửi sai phương thức HTTP | `tokenQLNT` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contractors/stats` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Chi tiết nhà thầu

**API chính:** `GET /api/contractors/{id}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Trả đủ hồ sơ, đầu mối, tài liệu, hợp đồng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-047 | Happy path | Xem chi tiết nhà thầu có hợp đồng | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | id nhà thầu H | Gọi `GET /api/contractors/{id}` | `200` | Có loại hình dịch vụ, đầu mối, tài liệu, danh sách HĐ | P1 | Có |
| VDR-048 | Business rule | Nhà thầu Dừng hợp tác vẫn xem được | `tokenQLNT`; nhà thầu D ở Dừng hợp tác | id nhà thầu D | Gọi `GET /api/contractors/{id}` | `200` | Trả chi tiết, trạng thái Dừng hợp tác; không có thao tác thay đổi | P2 | Có |
| VDR-049 | Ownership/IDOR | Role khác xem chi tiết nhà thầu | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | id nhà thầu H | Gọi `GET /api/contractors/{id}` | `403` | Không trả dữ liệu (giả định role) | P2 | Có |
| VDR-050 | Request validation | `id` sai định dạng UUID | `tokenQLNT` | `id` = `abc` | Gọi `GET /api/contractors/{id}` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| VDR-051 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Request hợp lệ | Gọi `GET /api/contractors/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có `id`, `code`, `name`, `taxCode`, `status`, `tier`, `serviceTypes`, `contacts`, `documents`, HĐ; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-052 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `GET /api/contractors/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| VDR-053 | Error handling | Nhà thầu không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contractors/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Sửa hồ sơ nhà thầu

**API chính:** `PUT /api/contractors/{id}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Sửa hồ sơ khi chưa Dừng hợp tác, không đổi mã và hạng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-054 | Happy path | Sửa tên và năng lực | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | `name` mới, `taxCode` hiện tại, `serviceTypes`, `recommendedCapacity`, `capabilityDescription`, `performanceScore` | Gọi `PUT /api/contractors/{id}` → GET | `200` | Giá trị mới; mã và hạng không đổi | P1 | Có |
| VDR-055 | Business rule | Sửa nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu D ở Dừng hợp tác | `name` mới, `taxCode` hiện tại, `serviceTypes`, `recommendedCapacity`, `capabilityDescription`, `performanceScore` | Gọi `PUT /api/contractors/{id}` | `400/409` | errorCode `domain-rule-violation` (BR-VD-06) | P1 | Có |
| VDR-056 | Business rule | MST mới trùng nhà thầu khác | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; nhà thầu X có MST `M1` | `name` mới, `taxCode`=`M1`, `serviceTypes`, `recommendedCapacity`, `capabilityDescription`, `performanceScore` | Gọi `PUT /api/contractors/{id}` | `409` | Bị chặn (BR-VD-10) | P1 | Có |
| VDR-057 | Business rule | Không đổi hạng qua API sửa | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | `name` mới, `taxCode` hiện tại, `serviceTypes`, `recommendedCapacity`, `capabilityDescription`, `performanceScore`; thêm `tier` khác | Gọi `PUT /api/contractors/{id}` → GET | `200/400` | Hạng giữ nguyên | P2 | Có |
| VDR-058 | Request validation | Thiếu trường bắt buộc | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Bỏ `name`; `serviceTypes`=[]; bỏ `taxCode` | Gọi `PUT /api/contractors/{id}` 3 lần | `400` | errorCode `validation-failed` | P2 | Có |
| VDR-059 | Boundary | `performanceScore` 5/5.01; `address` 500/501 | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Giá trị biên | Gọi `PUT /api/contractors/{id}` 4 lần | `200/400` | Giá trị biên lưu được; vượt biên `400` | P3 | Có |
| VDR-060 | Ownership/IDOR | Role khác sửa nhà thầu | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `name` mới, `taxCode` hiện tại, `serviceTypes`, `recommendedCapacity`, `capabilityDescription`, `performanceScore` | Gọi `PUT /api/contractors/{id}` với id nhà thầu H | `403` | Dữ liệu không đổi | P2 | Có |
| VDR-061 | Data integrity | Ghi lịch sử chi tiết | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Đổi `name` `X` → `Y` | Gọi `PUT /api/contractors/{id}` → `GET /api/contractors/{id}/history` | `200` | Có dòng `X` → `Y` | P2 | Có |
| VDR-062 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Request hợp lệ | Gọi `PUT /api/contractors/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nhà thầu sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-063 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `PUT /api/contractors/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| VDR-064 | Error handling | Nhà thầu không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/contractors/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Xóa nhà thầu

**API chính:** `DELETE /api/contractors/{id}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Chỉ xóa nhà thầu Tạo mới chưa từng có hợp đồng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-065 | Happy path | Xóa nhà thầu tạo nhầm | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | id nhà thầu N | Gọi `DELETE /api/contractors/{id}` → `GET /api/contractors/{id}` | `204` rồi `404` | Nhà thầu không còn | P1 | Có |
| VDR-066 | Business rule | Nhà thầu đã có HĐ, kể cả HĐ đã hủy | `tokenQLNT`; nhà thầu Tạo mới có 1 HĐ Đã hủy | id nhà thầu đó | Gọi `DELETE /api/contractors/{id}` | `400/409` | Bị chặn (BR-VD-15) | P1 | Có |
| VDR-067 | Business rule | Nhà thầu không ở Tạo mới | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; nhà thầu D Dừng hợp tác | id H, id D | Gọi `DELETE /api/contractors/{id}` 2 lần | `400/409` | Bị chặn | P1 | Có |
| VDR-068 | Ownership/IDOR | Role khác xóa nhà thầu | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | id nhà thầu N | Gọi `DELETE /api/contractors/{id}` | `403` | Nhà thầu N còn | P2 | Có |
| VDR-069 | Data integrity | Xóa lỗi không mất dữ liệu | `tokenQLNT`; nhà thầu có HĐ Đã hủy | id nhà thầu đó | Gọi `DELETE /api/contractors/{id}` → GET | `400/409` rồi `200` | Nhà thầu, HĐ và đầu mối còn nguyên | P2 | Có |
| VDR-070 | Data integrity | Xóa xong không còn trong danh sách | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | id nhà thầu N | Gọi `DELETE /api/contractors/{id}` → `GET /api/contractors` | `204` rồi `200` | Không có nhà thầu N; MST của N tạo lại được | P2 | Có |
| VDR-071 | Request validation | `id` sai định dạng UUID | `tokenQLNT` | `id` = `abc` | Gọi `DELETE /api/contractors/{id}` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| VDR-072 | Response contract | Response 204 không có body | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Request hợp lệ | Gọi `DELETE /api/contractors/{id}` → đọc status, header và body | `204` | Body rỗng, không có wrapper JSON; không có `Content-Type` JSON bắt buộc; client không parse JSON khi nhận 204 | P3 | Có |
| VDR-073 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `DELETE /api/contractors/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| VDR-074 | Error handling | Nhà thầu không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `DELETE /api/contractors/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Thêm đầu mối nhà thầu

**API chính:** `POST /api/contractors/{id}/contacts`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Thêm đầu mối, giữ đúng 1 đầu mối chính.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-075 | Happy path | Thêm đầu mối | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | `fullName`=`Đầu mối NT 2`, `phone`=`0977000111` | Gọi `POST /api/contractors/{id}/contacts` → GET | `201` | Có thêm đầu mối | P2 | Có |
| VDR-076 | Business rule | Thêm đầu mối chính mới | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | `fullName`=`Đầu mối NT 2`, `phone`=`0977000111`, `primary`=true | Gọi `POST /api/contractors/{id}/contacts` → GET | `201` | Đầu mối cũ bỏ đánh dấu chính (BR-VD-12) | P1 | Có |
| VDR-077 | Business rule | Nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu D ở Dừng hợp tác | `fullName`=`Đầu mối NT 2`, `phone`=`0977000111` | Gọi `POST /api/contractors/{id}/contacts` | `400/409` | Bị chặn | P2 | Có |
| VDR-078 | Request validation | Thiếu tên, SĐT sai | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Bỏ `fullName`; `phone`=`99` | Gọi `POST /api/contractors/{id}/contacts` 2 lần | `400` | errorCode `validation-failed` | P2 | Có |
| VDR-079 | Boundary | `email` 255/256, `note` 500/501 | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Chuỗi biên | Gọi `POST /api/contractors/{id}/contacts` 4 lần | `201/400` | Giá trị biên thành công; vượt biên `400` | P3 | Có |
| VDR-080 | Ownership/IDOR | Role khác thêm đầu mối | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `fullName`=`Đầu mối NT 2`, `phone`=`0977000111` | Gọi `POST /api/contractors/{id}/contacts` với id nhà thầu H | `403` | Không thêm | P2 | Có |
| VDR-081 | Data integrity | Ghi lịch sử | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | `fullName`=`Đầu mối NT 2`, `phone`=`0977000111` | Gọi `POST /api/contractors/{id}/contacts` → `GET /api/contractors/{id}/history` | `200` | Có dòng thêm đầu mối | P3 | Có |
| VDR-082 | Idempotency | Gửi lại cùng đầu mối | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | `fullName`=`Đầu mối NT 2`, `phone`=`0977000111` | Gọi `POST /api/contractors/{id}/contacts` 2 lần | `201` | Ghi nhận hành vi thực tế, không `5xx` | P3 | Có |
| VDR-083 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Request hợp lệ | Gọi `POST /api/contractors/{id}/contacts` → so response với schema Swagger | `201` | Wrapper `success`=true, `errorCode` rỗng; `data` có đầu mối vừa tạo; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-084 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractors/{id}/contacts` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| VDR-085 | Error handling | Nhà thầu không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contractors/{id}/contacts` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Sửa đầu mối nhà thầu

**API chính:** `PUT /api/contractors/{id}/contacts/{contactId}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Sửa đúng đầu mối thuộc nhà thầu.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-086 | Happy path | Sửa SĐT và ghi chú | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đầu mối C1 | `fullName`, `phone`=`0966000111`, `note` | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` | `200` | GET trả giá trị mới | P2 | Có |
| VDR-087 | Business rule | Sửa đầu mối của nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu D ở Dừng hợp tác; đầu mối C5 | Body hợp lệ | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` | `400/409` | Bị chặn | P2 | Có |
| VDR-088 | Request validation | SĐT sai | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đầu mối C1 | `phone`=`abc` | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` | `400` | errorCode `validation-failed` | P3 | Có |
| VDR-089 | Boundary | `fullName` 100/101 | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đầu mối C1 | Chuỗi biên | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` 2 lần | `200/400` | 100 lưu được; 101 `400` | P3 | Có |
| VDR-090 | Ownership/IDOR | `contactId` thuộc nhà thầu khác | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đầu mối C1; C9 thuộc nhà thầu khác | `id`=H, `contactId`=C9 | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` | `404` | C9 không đổi | P1 | Có |
| VDR-091 | Data integrity | Ghi lịch sử | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đầu mối C1 | Đổi `phone` | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` → `GET /api/contractors/{id}/history` | `200` | Có dòng sửa đầu mối | P3 | Có |
| VDR-092 | Request validation | `contactId` sai định dạng UUID | `tokenQLNT` | `contactId` = `abc` | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` với `contactId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| VDR-093 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đầu mối C1 | Request hợp lệ | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có đầu mối sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-094 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| VDR-095 | Error handling | Đầu mối không tồn tại | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/contractors/{id}/contacts/{contactId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Xóa đầu mối nhà thầu

**API chính:** `DELETE /api/contractors/{id}/contacts/{contactId}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Không xóa đầu mối cuối cùng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-096 | Happy path | Xóa đầu mối phụ | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; C1 chính, C2 phụ | `contactId`=C2 | Gọi `DELETE /api/contractors/{id}/contacts/{contactId}` | `200/204` | Còn C1 | P2 | Có |
| VDR-097 | Business rule | Xóa đầu mối cuối cùng | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; chỉ còn C1 | `contactId`=C1 | Gọi `DELETE /api/contractors/{id}/contacts/{contactId}` | `400/409` | Bị chặn (BR-VD-12) | P1 | Có |
| VDR-098 | Boundary | Nhà thầu còn đúng 2 đầu mối | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; C1, C2 | Xóa C2 rồi C1 | Gọi `DELETE /api/contractors/{id}/contacts/{contactId}` 2 lần | `200/204` rồi `400/409` | Lần 2 bị chặn | P3 | Có |
| VDR-099 | Ownership/IDOR | Xóa đầu mối của nhà thầu khác | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; C9 thuộc nhà thầu khác | `id`=H, `contactId`=C9 | Gọi `DELETE /api/contractors/{id}/contacts/{contactId}` | `404` | C9 còn | P1 | Có |
| VDR-100 | Data integrity | Xóa lỗi không mất dữ liệu | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; chỉ còn C1 | `contactId`=C1 | Gọi `DELETE /api/contractors/{id}/contacts/{contactId}` → GET | `400/409` | C1 còn, vẫn là chính | P2 | Có |
| VDR-101 | Request validation | `contactId` sai định dạng UUID | `tokenQLNT` | `contactId` = `abc` | Gọi `DELETE /api/contractors/{id}/contacts/{contactId}` với `contactId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| VDR-102 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Request hợp lệ | Gọi `DELETE /api/contractors/{id}/contacts/{contactId}` → so response với schema Swagger | `200/204` | Wrapper `success`=true, `errorCode` rỗng; `data` có kết quả xóa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| VDR-103 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `DELETE /api/contractors/{id}/contacts/{contactId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| VDR-104 | Error handling | Đầu mối không tồn tại | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `DELETE /api/contractors/{id}/contacts/{contactId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Đính kèm tài liệu pháp lý nhà thầu

**API chính:** `POST /api/contractors/{id}/documents`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Nhận đúng định dạng, tối đa 10MB.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-105 | Happy path | Upload PDF 1MB | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `file`=`gpkd.pdf` 1MB | Gọi `POST /api/contractors/{id}/documents` → GET | `201` | Nhà thầu có tài liệu mới | P2 | Có |
| VDR-106 | File API | Các định dạng được phép | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | PDF, DOCX, JPG, PNG, XLSX, ZIP | Gọi `POST /api/contractors/{id}/documents` 6 lần | `201` | Cả 6 file được lưu | P2 | Có |
| VDR-107 | File API | Định dạng không cho phép | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `.exe`; `.mp4`; exe đổi đuôi `.pdf` | Gọi `POST /api/contractors/{id}/documents` 3 lần | `400` | Bị chặn | P2 | Có |
| VDR-108 | Boundary | 10MB và 10MB + 1 byte | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | 2 file biên | Gọi `POST /api/contractors/{id}/documents` 2 lần | `201/400/413` | 10MB thành công; vượt trả `file-too-large` | P2 | Có |
| VDR-109 | Request validation | Không gửi file | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Multipart rỗng | Gọi `POST /api/contractors/{id}/documents` | `400` | errorCode `validation-failed` hoặc `malformed-request` | P3 | Có |
| VDR-110 | Business rule | Nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu D ở Dừng hợp tác | PDF 1MB | Gọi `POST /api/contractors/{id}/documents` | `400/409` | Bị chặn vì mọi thao tác bị khóa (BR-VD-06) | P2 | Có |
| VDR-111 | Ownership/IDOR | Role khác upload | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | PDF 1MB | Gọi `POST /api/contractors/{id}/documents` với id nhà thầu N | `403` | Không thêm tài liệu | P2 | Có |
| VDR-112 | Data integrity | Upload lỗi không tạo bản ghi | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | File 11MB | Gọi `POST /api/contractors/{id}/documents` → GET | `400/413` | Số tài liệu không đổi | P2 | Có |
| VDR-113 | Idempotency | Upload cùng file 2 lần | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `gpkd.pdf` | Gọi `POST /api/contractors/{id}/documents` 2 lần | `201` | 2 bản ghi khác id hoặc chặn trùng; không `5xx` | P3 | Có |
| VDR-114 | Input security | Tên file chứa đường dẫn | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Tên `..\..\x.pdf` | Gọi `POST /api/contractors/{id}/documents` | `201/400` | Tên lưu được làm sạch | P3 | Có |
| VDR-115 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Request hợp lệ | Gọi `POST /api/contractors/{id}/documents` → so response với schema Swagger | `201` | Wrapper `success`=true, `errorCode` rỗng; `data` có tài liệu vừa tạo (`id`, tên file, dung lượng); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| VDR-116 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractors/{id}/documents` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| VDR-117 | Error handling | Nhà thầu không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contractors/{id}/documents` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Tải tài liệu nhà thầu

**API chính:** `GET /api/contractors/{id}/documents/{documentId}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Trả đúng file thuộc nhà thầu.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-118 | Happy path | Tải tài liệu nhà thầu | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1 | id của file đã upload ở bước chuẩn bị | Gọi `GET /api/contractors/{id}/documents/{documentId}` | `200` | Nội dung tải về trùng từng byte với file đã upload (so checksum) | P2 | Có |
| VDR-119 | File API | Header của tài liệu nhà thầu | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1 | Như case Happy path | Gọi `GET /api/contractors/{id}/documents/{documentId}` → đọc header | `200` | `Content-Type` đúng loại file đã upload; `Content-Disposition` có tên file gốc; `Content-Length` > 0 | P2 | Có |
| VDR-120 | Ownership/IDOR | Tải tài liệu nhà thầu ngoài phạm vi | `tokenQLNT` với `documentId` thuộc nhà thầu khác; hoặc `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | id N + D9; hoặc id N + D1 | Gọi `GET /api/contractors/{id}/documents/{documentId}` | `403/404` | Không trả nội dung file | P1 | Có |
| VDR-121 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1 | Request hợp lệ | Gọi `GET /api/contractors/{id}/documents/{documentId}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân, không bọc wrapper JSON; khi lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| VDR-122 | Request validation | `id` sai định dạng UUID | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1 | `id` = `abc` | Gọi `GET /api/contractors/{id}/documents/{documentId}` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| VDR-123 | Authentication | Gọi không có token | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1 | Không gửi header `Authorization` | Gọi `GET /api/contractors/{id}/documents/{documentId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| VDR-124 | Error handling | Tài liệu nhà thầu không tồn tại | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1 | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contractors/{id}/documents/{documentId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Gỡ tài liệu nhà thầu

**API chính:** `DELETE /api/contractors/{id}/documents/{documentId}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Gỡ đúng tài liệu thuộc nhà thầu.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-125 | Happy path | Gỡ tài liệu | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1 | `documentId`=D1 | Gọi `DELETE /api/contractors/{id}/documents/{documentId}` → GET | `200/204` | Không còn D1 | P2 | Có |
| VDR-126 | Business rule | Gỡ tài liệu nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu D ở Dừng hợp tác; tài liệu D5 | `documentId`=D5 | Gọi `DELETE /api/contractors/{id}/documents/{documentId}` | `400/409` | Bị chặn; D5 còn | P2 | Có |
| VDR-127 | Ownership/IDOR | Tài liệu của nhà thầu khác | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1; D9 thuộc nhà thầu khác | `id`=N, `documentId`=D9 | Gọi `DELETE /api/contractors/{id}/documents/{documentId}` | `404` | D9 còn | P1 | Có |
| VDR-128 | Data integrity | Sau khi gỡ không tải được | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1 | `documentId`=D1 | Gọi `DELETE /api/contractors/{id}/documents/{documentId}` → `GET /api/contractors/{id}/documents/{documentId}` | `200/204` rồi `404` | File không còn | P2 | Có |
| VDR-129 | Request validation | `documentId` sai định dạng UUID | `tokenQLNT` | `documentId` = `abc` | Gọi `DELETE /api/contractors/{id}/documents/{documentId}` với `documentId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| VDR-130 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; tài liệu D1 | Request hợp lệ | Gọi `DELETE /api/contractors/{id}/documents/{documentId}` → so response với schema Swagger | `200/204` | Wrapper `success`=true, `errorCode` rỗng; `data` có kết quả xóa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| VDR-131 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `DELETE /api/contractors/{id}/documents/{documentId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| VDR-132 | Error handling | Tài liệu không tồn tại | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `DELETE /api/contractors/{id}/documents/{documentId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Lịch sử thao tác nhà thầu

**API chính:** `GET /api/contractors/{id}/history`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Lịch sử đủ, có cả thao tác của Hệ thống.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-133 | Happy path | Xem lịch sử thao tác nhà thầu | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đã sửa, đổi hạng; HĐ đầu tiên tự kích hoạt nhà thầu | Không lọc; `page=1`, `perPage=20` | Gọi `GET /api/contractors/{id}/history` | `200` | Có đủ các thao tác đã làm trong tiền điều kiện; sắp xếp mới nhất trước; mỗi dòng có hành động, người thực hiện, thời gian | P2 | Có |
| VDR-134 | Pagination/filter/sort | Lọc lịch sử theo hành động, người thực hiện, khoảng thời gian, từ khóa | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đã sửa, đổi hạng; HĐ đầu tiên tự kích hoạt nhà thầu | Lần lượt: `eventCode`=1 mã hành động; `actorUserId`=user test; `from`/`to` bao quanh thời điểm tạo; `search`=từ khóa trong lý do | Gọi `GET /api/contractors/{id}/history` với từng bộ lọc | `200` | Mỗi lần chỉ trả dòng khớp bộ lọc; tổng trong `meta.pagination` khớp số dòng; không lọc thì đủ mọi dòng | P3 | Có |
| VDR-135 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đã sửa, đổi hạng; HĐ đầu tiên tự kích hoạt nhà thầu | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/contractors/{id}/history` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| VDR-136 | Request validation | Tham số thời gian sai định dạng | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đã sửa, đổi hạng; HĐ đầu tiên tự kích hoạt nhà thầu | `from` = `2026-13-45` | Gọi `GET /api/contractors/{id}/history` | `400` | errorCode `validation-failed`; không trả `5xx` | P3 | Có |
| VDR-137 | Ownership/IDOR | Xem lịch sử nhà thầu ngoài phạm vi | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | id nhà thầu H | Gọi `GET /api/contractors/{id}/history` | `403/404` | Không trả dòng lịch sử nào của bản ghi | P1 | Có |
| VDR-138 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đã sửa, đổi hạng; HĐ đầu tiên tự kích hoạt nhà thầu | Request hợp lệ | Gọi `GET /api/contractors/{id}/history` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có danh sách dòng lịch sử (hành động, người thực hiện, thời gian, giá trị cũ/mới) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-139 | Authentication | Gọi không có token | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đã sửa, đổi hạng; HĐ đầu tiên tự kích hoạt nhà thầu | Không gửi header `Authorization` | Gọi `GET /api/contractors/{id}/history` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| VDR-140 | Error handling | Nhà thầu không tồn tại | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; đã sửa, đổi hạng; HĐ đầu tiên tự kích hoạt nhà thầu | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contractors/{id}/history` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |
| VDR-141 | Business rule | Có thao tác của Hệ thống | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Không lọc | Gọi `GET /api/contractors/{id}/history` | `200` | Có dòng chuyển Tạo mới → Đang hoạt động với người thực hiện Hệ thống (BR-VD-13) | P2 | Có |

## API: Kích hoạt lại nhà thầu

**API chính:** `POST /api/contractors/{id}/reactivate`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Dừng hợp tác → Ngưng hoạt động, không khôi phục HĐ và bảng giá.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-142 | Happy path | Kích hoạt lại nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu D ở Dừng hợp tác | `reason`=`Hợp tác lại` | Gọi `POST /api/contractors/{id}/reactivate` → GET | `200` | Trạng thái Ngưng hoạt động | P1 | Có |
| VDR-143 | State transition | Chỉ kích hoạt từ Dừng hợp tác | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; nhà thầu H Đang hoạt động | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/reactivate` cho N và H | `400/409` | Bị chặn; trạng thái giữ nguyên | P1 | Có |
| VDR-144 | Business rule | Không khôi phục HĐ cũ | `tokenQLNT`; nhà thầu D ở Dừng hợp tác; HĐ cũ Dừng khai thác và Đã hủy | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/reactivate` → `GET /api/contractors/{id}` | `200` | HĐ cũ giữ Dừng khai thác, Đã hủy; nhà thầu cần tái ký mới hoạt động lại (BR-VD-17) | P1 | Có |
| VDR-145 | Request validation | Không gửi lý do | `tokenQLNT`; nhà thầu D ở Dừng hợp tác | Body rỗng | Gọi `POST /api/contractors/{id}/reactivate` | `400` | errorCode `validation-failed`; trạng thái không đổi. SRS bắt buộc lý do; nếu API trả 2xx thì ghi Fail và báo lệch SRS–Swagger (xem Điểm cần xác nhận) | P2 | Có |
| VDR-146 | Boundary | `reason` 500/501 | `tokenQLNT`; nhà thầu D ở Dừng hợp tác | Chuỗi biên | Gọi `POST /api/contractors/{id}/reactivate` | `200/400` | 500 thành công; 501 `400` | P3 | Có |
| VDR-147 | Ownership/IDOR | Role khác kích hoạt lại | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/reactivate` với id D | `403` | Vẫn Dừng hợp tác | P2 | Có |
| VDR-148 | Idempotency | Kích hoạt lần 2 | `tokenQLNT`; nhà thầu vừa kích hoạt lại | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/reactivate` lần 2 | `400/409` | Bị chặn | P2 | Có |
| VDR-149 | Data integrity | Ghi lịch sử kèm lý do | `tokenQLNT`; nhà thầu D ở Dừng hợp tác | `reason`=`R-react` | Gọi `POST /api/contractors/{id}/reactivate` → `GET /api/contractors/{id}/history` | `200` | Có dòng kích hoạt lại kèm lý do | P3 | Có |
| VDR-150 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu D ở Dừng hợp tác | Request hợp lệ | Gọi `POST /api/contractors/{id}/reactivate` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nhà thầu sau khi kích hoạt lại; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-151 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractors/{id}/reactivate` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| VDR-152 | Error handling | Nhà thầu không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contractors/{id}/reactivate` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| VDR-153 | Data integrity | Đọc lại từng HĐ sau khi kích hoạt lại | `tokenQLNT`; nhà thầu D ở Dừng hợp tác; HĐ V9 Dừng khai thác, HĐ C Đã hủy, HĐ E Hết hiệu lực | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/reactivate` → `GET /api/contractor-contracts/{id}` cho V9, C, E | `200` | Cả 3 HĐ giữ nguyên trạng thái (BR-VD-17); nhà thầu Ngưng hoạt động | P1 | Có |
| VDR-154 | Business rule | Sau kích hoạt lại, các API ghi được mở | `tokenQLNT`; nhà thầu D ở Dừng hợp tác; HĐ V9 Dừng khai thác | Body hợp lệ | Gọi `POST /api/contractors/{id}/reactivate` → `PUT /api/contractors/{id}` → `GET /api/contractor-contracts/contractor-options` (`mode=RESIGN`) → `POST /api/contractor-contracts/{id}/resign` | `200`, `200`, `200/201` | Sửa hồ sơ thành công; nhà thầu có trong danh sách tái ký; tái ký hiệu lực hôm nay đưa nhà thầu về Đang hoạt động | P1 | Có |

## API: Dừng hợp tác nhà thầu

**API chính:** `POST /api/contractors/{id}/terminate`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Chuyển Dừng hợp tác, tự xử lý HĐ và bảng giá, khóa mọi thao tác.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-155 | Happy path | Dừng hợp tác nhà thầu đang hoạt động | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | `reason`=`Vi phạm chất lượng` | Gọi `POST /api/contractors/{id}/terminate` → GET | `200` | Trạng thái Dừng hợp tác; HĐ Đang hiệu lực → Dừng khai thác | P1 | Có |
| VDR-156 | Business rule | HĐ Chưa hiệu lực bị hủy | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; có thêm HĐ tái ký Chưa hiệu lực | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/terminate` → `GET /api/contractor-contracts?contractorId=...` | `200` | HĐ Chưa hiệu lực → Đã hủy; HĐ Đang hiệu lực → Dừng khai thác (BR-VD-06) | P1 | Có |
| VDR-157 | Business rule | Khóa mọi thao tác sau khi dừng | `tokenQLNT`; nhà thầu vừa Dừng hợp tác | Body hợp lệ cho sửa hồ sơ và thêm đầu mối | Gọi `POST /api/contractors/{id}/terminate` → `PUT /api/contractors/{id}` → `POST /api/contractors/{id}/contacts` | `400/409` | Cả 2 thao tác sau bị chặn | P1 | Có |
| VDR-158 | State transition | Dừng hợp tác từ Tạo mới hoặc Dừng hợp tác | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; `tokenQLNT`; nhà thầu D ở Dừng hợp tác | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/terminate` cho N và D | `400/409` | Bị chặn; chỉ Đang hoạt động, Ngưng hoạt động được dừng | P1 | Có |
| VDR-159 | State transition | Dừng hợp tác từ Ngưng hoạt động | `tokenQLNT`; nhà thầu Ngưng hoạt động | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/terminate` | `200` | Trạng thái Dừng hợp tác | P2 | Có |
| VDR-160 | Request validation | Không gửi lý do | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Body rỗng | Gọi `POST /api/contractors/{id}/terminate` | `400` | errorCode `validation-failed`; trạng thái không đổi. SRS bắt buộc lý do; nếu API trả 2xx thì ghi Fail và báo lệch SRS–Swagger (xem Điểm cần xác nhận) | P2 | Có |
| VDR-161 | Boundary | `reason` 500/501 | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Chuỗi biên | Gọi `POST /api/contractors/{id}/terminate` | `200/400` | 500 thành công; 501 `400` | P3 | Có |
| VDR-162 | Ownership/IDOR | Role khác dừng hợp tác | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/terminate` với id H | `403` | Nhà thầu H không đổi | P2 | Có |
| VDR-163 | Idempotency | Dừng hợp tác lần 2 | `tokenQLNT`; nhà thầu vừa Dừng hợp tác | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/terminate` lần 2 | `400/409` | Bị chặn; lịch sử 1 dòng | P2 | Có |
| VDR-164 | Data integrity | HĐ và nhà thầu cập nhật cùng lúc | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/terminate` → GET nhà thầu và các HĐ | `200` | Không có trạng thái lưng chừng (nhà thầu đã dừng nhưng HĐ còn Đang hiệu lực) | P1 | Có |
| VDR-165 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Request hợp lệ | Gọi `POST /api/contractors/{id}/terminate` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nhà thầu sau khi dừng hợp tác; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-166 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractors/{id}/terminate` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| VDR-167 | Error handling | Nhà thầu không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contractors/{id}/terminate` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| VDR-168 | Data integrity | Đọc lại từng HĐ sau khi Dừng hợp tác | `tokenQLNT`; nhà thầu H có HĐ V Đang hiệu lực, HĐ P Chưa hiệu lực, HĐ E Hết hiệu lực, HĐ C Đã hủy | `reason` hợp lệ | Gọi `POST /api/contractors/{id}/terminate` → `GET /api/contractor-contracts/{id}` cho V, P, E, C | `200` | V Dừng khai thác; P Đã hủy; E và C giữ nguyên trạng thái; mỗi HĐ đổi có dòng lịch sử kèm lý do | P1 | Có |
| VDR-169 | Business rule | Gọi trực tiếp các API ghi bị khóa | `tokenQLNT`; nhà thầu vừa Dừng hợp tác, có HĐ V9 | Body hợp lệ cho từng API | Gọi `POST /api/contractors/{id}/terminate` → `PUT /api/contractors/{id}/tier` → `POST /api/contractors/{id}/documents` → `DELETE /api/contractors/{id}/contacts/{contactId}` → `PUT /api/contractor-contracts/{id}` → `POST /api/contractor-contracts/{id}/annexes` → `PUT /api/contractor-contracts/{id}/auto-renewal` → `POST /api/contractor-contracts/{id}/extensions` → `POST /api/contractor-contracts/{id}/resign` | `400/409` | Mọi API ghi bị chặn với `domain-rule-violation` (BR-VD-06, BR-CTV-21); dữ liệu không đổi; `GET /api/contractor-contracts/{id}/file` vẫn tải được | P1 | Có |

## API: Cập nhật phân hạng nhà thầu

**API chính:** `PUT /api/contractors/{id}/tier`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Đổi hạng khi Tạo mới hoặc Đang hoạt động, có lý do.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-170 | Happy path | Đổi hạng Ưu tiên → Chiến lược | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực; hạng Ưu tiên | `tier`=Chiến lược, `reason`=`Năng lực tốt` | Gọi `PUT /api/contractors/{id}/tier` → GET | `200` | Hạng mới | P1 | Có |
| VDR-171 | Business rule | Hạng mới trùng hạng hiện tại | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | `tier` = hạng hiện tại | Gọi `PUT /api/contractors/{id}/tier` | `400/409` | Bị chặn (BR-VD-14) | P2 | Có |
| VDR-172 | Business rule | Đổi hạng nhà thầu Ngưng hoạt động hoặc Dừng hợp tác | `tokenQLNT`; nhà thầu D ở Dừng hợp tác; nhà thầu Ngưng hoạt động | `tier` khác, `reason` | Gọi `PUT /api/contractors/{id}/tier` 2 lần | `400/409` | Bị chặn | P1 | Có |
| VDR-173 | Request validation | Thiếu lý do, hạng lạ | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Bỏ `reason`; `tier`=`VIP` | Gọi `PUT /api/contractors/{id}/tier` 2 lần | `400` | errorCode `validation-failed` | P2 | Có |
| VDR-174 | Boundary | `reason` 500/501 | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Chuỗi biên | Gọi `PUT /api/contractors/{id}/tier` | `200/400` | 500 thành công; 501 `400` | P3 | Có |
| VDR-175 | Ownership/IDOR | Role khác đổi hạng | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `tier`, `reason` | Gọi `PUT /api/contractors/{id}/tier` với id H | `403` | Hạng không đổi | P2 | Có |
| VDR-176 | Data integrity | Ghi lịch sử hạng cũ, mới, lý do | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Đổi hạng | Gọi `PUT /api/contractors/{id}/tier` → `GET /api/contractors/{id}/history` | `200` | Có dòng hạng cũ, hạng mới, lý do | P2 | Có |
| VDR-177 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, có HĐ Đang hiệu lực | Request hợp lệ | Gọi `PUT /api/contractors/{id}/tier` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nhà thầu sau khi đổi hạng; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| VDR-178 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `PUT /api/contractors/{id}/tier` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| VDR-179 | Error handling | Nhà thầu không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/contractors/{id}/tier` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Mã tự sinh của nhà thầu

**API chính:** `POST /api/contractors`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Mã nhà thầu do hệ thống tự sinh theo thứ tự tạo.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| VDR-180 | Business rule | Mã nhà thầu tự sinh tăng dần theo thứ tự tạo | `tokenQLNT` | 2 body nhà thầu hợp lệ, MST ngẫu nhiên khác nhau | Gọi `POST /api/contractors` lần 1 → gọi `POST /api/contractors` lần 2 → so phần số của 2 mã | `201` | Cả 2 mã khớp `VDR-XXXX`; phần số của nhà thầu tạo sau lớn hơn nhà thầu tạo trước | P1 | Có |

## API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu

**API chính:** `GET /api/contractor-contracts`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Tìm và lọc đúng theo trạng thái, ngày, mức cảnh báo.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-001 | Happy path | Xem danh sách HĐ nhà thầu | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `page=1`, `perPage=20` | Gọi `GET /api/contractor-contracts` | `200` | Có HĐ V với mã `CTV...`, nhà thầu H, trạng thái Đang hiệu lực | P1 | Có |
| CTV-002 | Pagination/filter/sort | Tìm theo mã HĐ, tên/mã nhà thầu, MST | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Lần lượt mã HĐ V, tên H, mã `VDR` của H, MST H | Gọi `GET /api/contractor-contracts` với từng `search` | `200` | Cả 4 lần trả HĐ V | P2 | Có |
| CTV-003 | Pagination/filter/sort | Lọc trạng thái nhiều giá trị, `contractorId`, khoảng ngày, `alert` | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `status` 2 giá trị; `contractorId`=H; `expiresFrom`/`expiresTo`; `alert=URGENT&alert=NOTICE` | Gọi `GET /api/contractor-contracts` với từng bộ lọc | `200` | Chỉ trả HĐ khớp; lọc `contractorId` chỉ trả HĐ của H | P2 | Có |
| CTV-004 | Pagination/filter/sort | Phân trang không trùng, không sót | `tokenQLNT`; 25 HĐ | `perPage=10`, `page`=1, 2, 3 | Gọi `GET /api/contractor-contracts` 3 lần | `200` | 10, 10, 5 dòng; không id lặp | P3 | Có |
| CTV-005 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenQLNT` | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/contractor-contracts` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| CTV-006 | Request validation | Enum, UUID, ngày sai | `tokenQLNT` | `alert=HIGH`; `contractorId=abc`; `signedFrom=2026-02-30` | Gọi `GET /api/contractor-contracts` 3 lần | `400` | errorCode `validation-failed` | P3 | Có |
| CTV-007 | Response contract | Response đúng schema Swagger | `tokenQLNT` | Request hợp lệ | Gọi `GET /api/contractor-contracts` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng HĐ (`id`, `code` dạng `CTVYYMM-XXX`, nhà thầu, `legalNumber`, 3 mốc ngày, `status`, mức cảnh báo) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-008 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `GET /api/contractor-contracts` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| CTV-009 | Authentication | Token sai chữ ký, hết hạn hoặc là refresh token | `tokenQLNT` | 3 lần gọi: token sửa 1 ký tự; token hết hạn; `Bearer` + refresh token hợp lệ | Gọi `GET /api/contractor-contracts` lần lượt với 3 token | `401` | Cả 3 lần trả errorCode `authentication-failed` hoặc `authentication-required`; không trả dữ liệu | P1 | Có |
| CTV-010 | Authorization | Role kinh doanh xem HĐ nhà thầu | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | Không lọc | Gọi `GET /api/contractor-contracts` | `403` | errorCode `access-denied` (giả định role) | P2 | Có |
| CTV-011 | Input security | Chuỗi tấn công trong `search` | `tokenQLNT` | `search`=`' OR 1=1 --` | Gọi `GET /api/contractor-contracts` | `200/400` | Không `5xx` | P3 | Có |
| CTV-012 | Error handling | Gửi sai phương thức HTTP | `tokenQLNT` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contractor-contracts` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Thêm hợp đồng nhà thầu đầu tiên

**API chính:** `POST /api/contractor-contracts`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Tạo HĐ đầu tiên, kích hoạt nhà thầu khi HĐ có hiệu lực.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-013 | Happy path | Thêm HĐ hiệu lực từ hôm nay | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | multipart `contract`: `contractorId`=N, `name`=`HĐ vận tải 2026`, `legalNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm; `file`=scan PDF | Gọi `POST /api/contractor-contracts` → `GET /api/contractor-contracts/{id}` → `GET /api/contractors/{id}` | `200/201` | Mã HĐ khớp `^CTV\d{4}-\d{3}$`; HĐ Đang hiệu lực; nhà thầu N Tạo mới → Đang hoạt động (BR-VD-07) | P1 | Có |
| CTV-014 | State transition | Thêm HĐ hiệu lực tương lai | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | multipart `contract`: `contractorId`=N, `name`=`HĐ vận tải 2026`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`=+10 ngày, `effectiveTo`=+1 năm; `file`=scan PDF | Gọi `POST /api/contractor-contracts` → xem HĐ và nhà thầu | `200/201` | HĐ Chưa hiệu lực; nhà thầu vẫn Tạo mới | P1 | Có |
| CTV-015 | Request validation | Thiếu từng trường bắt buộc hoặc file | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Mỗi lần bỏ 1 trong: `contractorId`, `name`, `legalNumber`, `signedOn`, `effectiveFrom`, `effectiveTo`, `file` | Gọi `POST /api/contractor-contracts` 7 lần | `400` | errorCode `validation-failed`; không tạo HĐ | P1 | Có |
| CTV-016 | Request validation | Ngày hiệu lực sau ngày hết hạn | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `effectiveFrom` = `effectiveTo` + 1 | Gọi `POST /api/contractor-contracts` | `400` | Bị chặn | P1 | Có |
| CTV-017 | Boundary | Ngày hiệu lực = ngày hết hạn; 5 và 6 phụ lục | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `effectiveFrom`=`effectiveTo`; `annexFiles` 5 rồi 6 file | Gọi `POST /api/contractor-contracts` (nhà thầu riêng mỗi lần thành công) | `200/201/400` | Ngày bằng nhau hợp lệ; 5 phụ lục hợp lệ, phụ lục mã `PLV...`; 6 bị chặn | P2 | Có |
| CTV-018 | Boundary | `renewalCycleMonths` 3/6/12/24 và 1/36 | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | multipart `contract`: `contractorId`=N, `name`=`HĐ vận tải 2026`, `legalNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm; `file`=scan PDF; `autoRenew`=true với từng chu kỳ | Gọi `POST /api/contractor-contracts` | `200/201/400` | 3, 6, 12, 24 hợp lệ; 1 và 36 trả `400` | P2 | Có |
| CTV-019 | Business rule | Nhà thầu đã có HĐ hoặc không ở Tạo mới | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | multipart `contract`: `contractorId`=H, `name`=`HĐ vận tải 2026`, `legalNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm; `file`=scan PDF | Gọi `POST /api/contractor-contracts` cho H và D | `400/409` | Bị chặn; thêm HĐ cho nhà thầu đã có HĐ phải dùng tái ký | P1 | Có |
| CTV-020 | Business rule | Nhiều hơn 1 file scan | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | multipart `contract`: `contractorId`=N, `name`=`HĐ vận tải 2026`, `legalNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm; `file`=scan PDF; gửi 2 phần `file` | Gọi `POST /api/contractor-contracts` | `400` | Bị chặn vì chỉ nhận 1 file scan | P2 | Có |
| CTV-021 | Data integrity | Lỗi không đổi trạng thái nhà thầu | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | multipart `contract`: `contractorId`=N, `name`=`HĐ vận tải 2026`, `legalNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm; `file`=scan PDF; file scan 0 byte | Gọi `POST /api/contractor-contracts` → `GET /api/contractors/{id}` | `400` | Không có HĐ; nhà thầu vẫn Tạo mới | P1 | Có |
| CTV-022 | Idempotency | Gửi lại cùng request | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | multipart `contract`: `contractorId`=N, `name`=`HĐ vận tải 2026`, `legalNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm; `file`=scan PDF | Gọi `POST /api/contractor-contracts` 2 lần | `200/201` rồi `400/409` | Chỉ 1 HĐ | P1 | Có |
| CTV-023 | Concurrency | 2 request cho cùng nhà thầu đồng thời | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | 2 body `legalNumber` khác nhau | Gọi `POST /api/contractor-contracts` song song | `200/201` và `400/409` | Đúng 1 HĐ đầu tiên | P2 | Có |
| CTV-024 | File API | File scan sai định dạng hoặc quá lớn | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `.exe`; file vượt giới hạn | Gọi `POST /api/contractor-contracts` 2 lần | `400/413` | Bị chặn | P2 | Có |
| CTV-025 | Authorization | Role kinh doanh thêm HĐ nhà thầu | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | multipart `contract`: `contractorId`=N, `name`=`HĐ vận tải 2026`, `legalNumber` mới, `signedOn`=`effectiveFrom`=hôm nay, `effectiveTo`=+1 năm; `file`=scan PDF | Gọi `POST /api/contractor-contracts` | `403` | Không tạo HĐ (giả định role) | P2 | Có |
| CTV-026 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Request hợp lệ | Gọi `POST /api/contractor-contracts` → so response với schema Swagger | `200/201` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ vừa tạo (`id`, `code`, `status`, nhà thầu, `annexes`, cấu hình gia hạn); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-027 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractor-contracts` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTV-028 | Error handling | Multipart thiếu phần `contract` hoặc JSON trong `contract` hỏng | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Lần lượt chỉ gửi `file`; phần `contract` là chuỗi JSON thiếu dấu đóng | Gọi `POST /api/contractor-contracts` 2 lần | `400` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; errorCode `malformed-request` hoặc `validation-failed`; không tạo HĐ | P2 | Có |

## API: Nhà thầu cho ô chọn Thêm hợp đồng

**API chính:** `GET /api/contractor-contracts/contractor-options`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** `NEW` và `RESIGN` trả đúng tập nhà thầu.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-029 | Happy path | Chế độ `NEW` | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ; `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `mode=NEW` | Gọi `GET /api/contractor-contracts/contractor-options` | `200` | Có N; không có H | P1 | Có |
| CTV-030 | Business rule | Chế độ `RESIGN` | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác; `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | `mode=RESIGN` | Gọi `GET /api/contractor-contracts/contractor-options` | `200` | Có H; không có D (Dừng hợp tác) và N2 (đang có HĐ Chưa hiệu lực) | P1 | Có |
| CTV-031 | Business rule | Nhà thầu vừa có HĐ đầu tiên rời chế độ `NEW` | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `mode=NEW` | Gọi `GET /api/contractor-contracts/contractor-options` → `POST /api/contractor-contracts` cho N → gọi lại `GET /api/contractor-contracts/contractor-options` | `200` | Lần 2 không còn N | P2 | Có |
| CTV-032 | Request validation | Thiếu hoặc sai `mode` | `tokenQLNT` | Không gửi `mode`; `mode=EDIT` | Gọi `GET /api/contractor-contracts/contractor-options` 2 lần | `400` | errorCode `validation-failed` | P2 | Có |
| CTV-033 | Pagination/filter/sort | Tìm theo `search` | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `mode=NEW&search`=một phần tên N | Gọi `GET /api/contractor-contracts/contractor-options` | `200` | Trả N; không khớp trả rỗng | P3 | Có |
| CTV-034 | Boundary | `search` rỗng và 1000 ký tự | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | `mode=NEW&search=`; `search` 1000 ký tự | Gọi `GET /api/contractor-contracts/contractor-options` 2 lần | `200/400` | Không `5xx` | P3 | Có |
| CTV-035 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu N ở Tạo mới, chưa có HĐ | Request hợp lệ | Gọi `GET /api/contractor-contracts/contractor-options` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có mảng nhà thầu (`id`, `code`, `name`); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-036 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `GET /api/contractor-contracts/contractor-options` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTV-037 | Error handling | Gửi sai phương thức HTTP | `tokenQLNT` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contractor-contracts/contractor-options` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Số liệu hợp đồng nhà thầu

**API chính:** `GET /api/contractor-contracts/stats`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Đếm đúng theo nhóm trạng thái và sắp hết hạn.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-038 | Happy path | Xem số liệu | `tokenQLNT` | Không tham số | Gọi `GET /api/contractor-contracts/stats` | `200` | Có tổng, đang hiệu lực, sắp hết hạn, hết hiệu lực, dừng/hủy | P2 | Có |
| CTV-039 | Boundary | HĐ hết hạn sau 60 và 61 ngày | `tokenQLNT`; 2 HĐ Đang hiệu lực hết hạn sau 60 và 61 ngày | Không tham số | Gọi `GET /api/contractor-contracts/stats` | `200` | HĐ 60 ngày được đếm vào sắp hết hạn; HĐ 61 ngày không | P2 | Có |
| CTV-040 | Business rule | Số liệu đổi theo thao tác | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | Ghi nhận ban đầu | Gọi `GET /api/contractor-contracts/stats` → hủy HĐ P → gọi lại `GET /api/contractor-contracts/stats` | `200` | Nhóm dừng/hủy +1 | P3 | Có |
| CTV-041 | Response contract | Response đúng schema Swagger | `tokenQLNT` | Request hợp lệ | Gọi `GET /api/contractor-contracts/stats` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có số đếm nguyên không âm; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-042 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `GET /api/contractor-contracts/stats` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P3 | Có |
| CTV-043 | Error handling | Gửi sai phương thức HTTP | `tokenQLNT` | Gửi method DELETE tới cùng đường dẫn của API | Gọi đường dẫn của `GET /api/contractor-contracts/stats` bằng method không hỗ trợ | `405` | body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không trả `5xx` | P3 | Có |

## API: Chi tiết hợp đồng nhà thầu

**API chính:** `GET /api/contractor-contracts/{id}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Trả đủ chi tiết và nút được phép.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-044 | Happy path | Xem chi tiết HĐ | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | id HĐ V | Gọi `GET /api/contractor-contracts/{id}` | `200` | Có đầu mối, cấu hình tự động gia hạn, phụ lục, lịch sử gia hạn, liên kết tái ký | P1 | Có |
| CTV-045 | Business rule | `availableActions` theo trạng thái | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | id V, id P | Gọi `GET /api/contractor-contracts/{id}` 2 lần | `200` | Đang hiệu lực có Gia hạn, Dừng khai thác, Tái ký; Chưa hiệu lực có Sửa, Hủy (BR-CTV-17) | P1 | Có |
| CTV-046 | Business rule | Nhà thầu Dừng hợp tác không có thao tác | `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | id V9 | Gọi `GET /api/contractor-contracts/{id}` | `200` | `availableActions` rỗng | P1 | Có |
| CTV-047 | Ownership/IDOR | Role khác xem HĐ nhà thầu | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | id HĐ V | Gọi `GET /api/contractor-contracts/{id}` | `403` | Không trả dữ liệu | P2 | Có |
| CTV-048 | Request validation | `id` sai định dạng UUID | `tokenQLNT` | `id` = `abc` | Gọi `GET /api/contractor-contracts/{id}` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTV-049 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Request hợp lệ | Gọi `GET /api/contractor-contracts/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có `id`, `code`, `name`, `legalNumber`, 3 mốc ngày, `status`, cấu hình gia hạn, `annexes`, `extensions`, liên kết tái ký, `availableActions`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-050 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `GET /api/contractor-contracts/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P1 | Có |
| CTV-051 | Error handling | Hợp đồng không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contractor-contracts/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Sửa hợp đồng nhà thầu

**API chính:** `PUT /api/contractor-contracts/{id}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Sửa đúng phạm vi theo trạng thái HĐ.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-052 | Happy path | Sửa tên và ngày HĐ Chưa hiệu lực | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | `name` mới, `signedOn`, `effectiveFrom`, `effectiveTo`; `effectiveFrom` lùi thêm 5 ngày | Gọi `PUT /api/contractor-contracts/{id}` → GET | `200` | Giá trị mới; trạng thái Chưa hiệu lực | P1 | Có |
| CTV-053 | Business rule | HĐ Đang hiệu lực chỉ sửa cấu hình gia hạn | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `name` mới, `signedOn`, `effectiveFrom`, `effectiveTo`; đổi `effectiveTo` | Gọi `PUT /api/contractor-contracts/{id}` | `400/409` | Bị chặn (BR-CTV-14); ngày không đổi | P1 | Có |
| CTV-054 | Business rule | HĐ Đang hiệu lực đổi cấu hình gia hạn | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Giữ nguyên tên, ngày; `autoRenew`=true, `renewalCycleMonths`=12 | Gọi `PUT /api/contractor-contracts/{id}` → GET | `200` | Cấu hình gia hạn mới; các trường khác giữ nguyên | P2 | Có |
| CTV-055 | Business rule | Sửa HĐ của nhà thầu Dừng hợp tác hoặc HĐ đã đóng | `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác; HĐ Đã hủy | `name` mới, `signedOn`, `effectiveFrom`, `effectiveTo` | Gọi `PUT /api/contractor-contracts/{id}` 2 lần | `400/409` | Bị chặn | P1 | Có |
| CTV-056 | State transition | Sửa Ngày hiệu lực HĐ Chưa hiệu lực về hôm nay | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | `name` mới, `signedOn`, `effectiveFrom`, `effectiveTo`; `effectiveFrom`=hôm nay | Gọi `PUT /api/contractor-contracts/{id}` → GET HĐ và nhà thầu | `200/400/409` | Ghi nhận hành vi (Báo cáo: chưa xác định); nếu thành công thì HĐ Đang hiệu lực và nhà thầu Đang hoạt động | P2 | Có |
| CTV-057 | Request validation | Thiếu trường, ngày ngược | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | Bỏ `name`; `effectiveFrom` > `effectiveTo` | Gọi `PUT /api/contractor-contracts/{id}` 2 lần | `400` | errorCode `validation-failed` | P2 | Có |
| CTV-058 | Boundary | `name` 255/256; `legalNumber` 100/101 | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | Chuỗi biên | Gọi `PUT /api/contractor-contracts/{id}` 4 lần | `200/400` | Giá trị biên lưu được; vượt biên `400` | P3 | Có |
| CTV-059 | Ownership/IDOR | Role khác sửa HĐ | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `name` mới, `signedOn`, `effectiveFrom`, `effectiveTo` | Gọi `PUT /api/contractor-contracts/{id}` với id P | `403` | HĐ không đổi | P2 | Có |
| CTV-060 | Data integrity | Ghi lịch sử | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | Đổi `name` | Gọi `PUT /api/contractor-contracts/{id}` → `GET /api/contractor-contracts/{id}/history` | `200` | Có dòng sửa với giá trị cũ, mới | P3 | Có |
| CTV-061 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | Request hợp lệ | Gọi `PUT /api/contractor-contracts/{id}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-062 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `PUT /api/contractor-contracts/{id}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTV-063 | Error handling | Hợp đồng không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/contractor-contracts/{id}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Thêm phụ lục hợp đồng nhà thầu

**API chính:** `POST /api/contractor-contracts/{id}/annexes`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Tạo phụ lục PLVYYMM-XXX khi HĐ chưa hủy.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-064 | Happy path | Thêm phụ lục PDF | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `annex`: `name`=`PL giá`; `file`=PDF 1MB | Gọi `POST /api/contractor-contracts/{id}/annexes` → GET HĐ | `200/201` | Phụ lục mã khớp `^PLV\d{4}-\d{3}$`; trạng thái HĐ không đổi | P1 | Có |
| CTV-065 | File API | PDF và DOCX được phép, định dạng khác bị chặn | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | DOCX; XLSX; exe đổi đuôi `.pdf` | Gọi `POST /api/contractor-contracts/{id}/annexes` 3 lần | `200/201/400` | DOCX thành công; 2 file còn lại bị chặn | P2 | Có |
| CTV-066 | Boundary | File 20MB và 20MB + 1 byte | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | 2 file biên | Gọi `POST /api/contractor-contracts/{id}/annexes` 2 lần | `200/201/400/413` | 20MB thành công; vượt bị chặn (theo SRS) | P2 | Có |
| CTV-067 | Request validation | Thiếu tên hoặc file | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Bỏ `annex.name`; bỏ `file` | Gọi `POST /api/contractor-contracts/{id}/annexes` 2 lần | `400` | Bị chặn | P2 | Có |
| CTV-068 | Business rule | HĐ Đã hủy hoặc nhà thầu Dừng hợp tác | HĐ Đã hủy; `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | multipart `annex`: `name`=`PL giá`; `file`=PDF 1MB | Gọi `POST /api/contractor-contracts/{id}/annexes` 2 lần | `400/409` | Bị chặn | P1 | Có |
| CTV-069 | Ownership/IDOR | Role khác thêm phụ lục | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | multipart `annex`: `name`=`PL giá`; `file`=PDF 1MB | Gọi `POST /api/contractor-contracts/{id}/annexes` với id V | `403` | Không thêm | P2 | Có |
| CTV-070 | Data integrity | Ghi lịch sử, không đổi trạng thái | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `annex`: `name`=`PL giá`; `file`=PDF 1MB | Gọi `POST /api/contractor-contracts/{id}/annexes` → `GET /api/contractor-contracts/{id}/history` | `200` | Có dòng thêm phụ lục | P3 | Có |
| CTV-071 | Idempotency | Gửi lại cùng phụ lục | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `annex`: `name`=`PL giá`; `file`=PDF 1MB | Gọi `POST /api/contractor-contracts/{id}/annexes` 2 lần | `200/201` | 2 phụ lục mã khác nhau, không trùng mã | P3 | Có |
| CTV-072 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Request hợp lệ | Gọi `POST /api/contractor-contracts/{id}/annexes` → so response với schema Swagger | `200/201` | Wrapper `success`=true, `errorCode` rỗng; `data` có phụ lục (`id`, `code`, `name`, tên file); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-073 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractor-contracts/{id}/annexes` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CTV-074 | Error handling | Hợp đồng không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contractor-contracts/{id}/annexes` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| CTV-075 | CRUD | Vòng đời phụ lục HĐ nhà thầu: thêm, xem, sửa, xóa | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `annex`: `name`=`PL giá`; `file`=PDF 1MB | Gọi `POST /api/contractor-contracts/{id}/annexes` → `GET /api/contractor-contracts/{id}` → `PUT /api/contractor-contracts/{id}/annexes/{annexId}` → `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` | `200/201`, `200`, `200`, `200/204` | Phụ lục xuất hiện, đổi tên, rồi biến mất | P2 | Có |

## API: Sửa phụ lục hợp đồng nhà thầu

**API chính:** `PUT /api/contractor-contracts/{id}/annexes/{annexId}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Sửa tên, mô tả, file; mã không đổi.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-076 | Happy path | Sửa tên, mô tả | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | `name`=`PL sửa`, `description` | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` | `200` | Giá trị mới; mã Y1 giữ nguyên | P2 | Có |
| CTV-077 | Business rule | Thay file | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | multipart `annex` + `file` mới | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` → `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` | `200` | File tải về là file mới | P2 | Có |
| CTV-078 | Business rule | Nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác; phụ lục Y5 | `name` mới | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` | `400/409` | Bị chặn | P2 | Có |
| CTV-079 | Request validation | Tên rỗng | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | `name`=`` | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` | `400` | errorCode `validation-failed` | P3 | Có |
| CTV-080 | Boundary | `description` 1000/1001 | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | Chuỗi biên | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` 2 lần | `200/400` | 1000 lưu được; 1001 `400` | P3 | Có |
| CTV-081 | Ownership/IDOR | `annexId` thuộc HĐ khác | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1; Y9 thuộc HĐ khác | `id`=V, `annexId`=Y9 | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` | `404` | Y9 không đổi | P1 | Có |
| CTV-082 | Data integrity | Ghi lịch sử | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | Đổi tên | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` → `GET /api/contractor-contracts/{id}/history` | `200` | Có dòng sửa phụ lục | P3 | Có |
| CTV-083 | Request validation | `annexId` sai định dạng UUID | `tokenQLNT` | `annexId` = `abc` | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` với `annexId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTV-084 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | Request hợp lệ | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có phụ lục sau khi sửa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-085 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CTV-086 | Error handling | Phụ lục không tồn tại | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/contractor-contracts/{id}/annexes/{annexId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Xóa phụ lục hợp đồng nhà thầu

**API chính:** `DELETE /api/contractor-contracts/{id}/annexes/{annexId}`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Xóa đúng phụ lục thuộc HĐ.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-087 | Happy path | Xóa phụ lục | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | `annexId`=Y1 | Gọi `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` → GET HĐ | `200/204` | Không còn Y1 | P2 | Có |
| CTV-088 | Business rule | HĐ Đã hủy hoặc nhà thầu Dừng hợp tác | HĐ Đã hủy có phụ lục; `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | `annexId` tương ứng | Gọi `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` 2 lần | `400/409` | Bị chặn; phụ lục còn | P2 | Có |
| CTV-089 | Ownership/IDOR | Phụ lục của HĐ khác | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1; Y9 thuộc HĐ khác | `id`=V, `annexId`=Y9 | Gọi `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` | `404` | Y9 còn | P1 | Có |
| CTV-090 | Data integrity | Sau khi xóa không tải được | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | `annexId`=Y1 | Gọi `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` → `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` | `200/204` rồi `404` | File không còn; lịch sử có dòng xóa | P2 | Có |
| CTV-091 | Request validation | `annexId` sai định dạng UUID | `tokenQLNT` | `annexId` = `abc` | Gọi `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` với `annexId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTV-092 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | Request hợp lệ | Gọi `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` → so response với schema Swagger | `200/204` | Wrapper `success`=true, `errorCode` rỗng; `data` có kết quả xóa; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CTV-093 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CTV-094 | Error handling | Phụ lục không tồn tại | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Tải phụ lục hợp đồng nhà thầu

**API chính:** `GET /api/contractor-contracts/{id}/annexes/{annexId}/file`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Tải được ở mọi trạng thái, có ghi lịch sử tải.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-095 | Happy path | Tải file phụ lục HĐ nhà thầu | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | id của file đã upload ở bước chuẩn bị | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` | `200` | Nội dung tải về trùng từng byte với file đã upload (so checksum) | P2 | Có |
| CTV-096 | File API | Header của file phụ lục HĐ nhà thầu | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | Như case Happy path | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` → đọc header | `200` | `Content-Type` đúng loại file đã upload; `Content-Disposition` có tên file gốc; `Content-Length` > 0 | P2 | Có |
| CTV-097 | Ownership/IDOR | Tải file phụ lục HĐ nhà thầu ngoài phạm vi | `tokenQLNT` với `annexId` thuộc HĐ khác; hoặc `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | id V + Y9; hoặc id V + Y1 | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` | `403/404` | Không trả nội dung file | P1 | Có |
| CTV-098 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | Request hợp lệ | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân, không bọc wrapper JSON; khi lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CTV-099 | Request validation | `id` sai định dạng UUID | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | `id` = `abc` | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTV-100 | Authentication | Gọi không có token | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | Không gửi header `Authorization` | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTV-101 | Error handling | File phụ lục hđ nhà thầu không tồn tại | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |
| CTV-102 | Business rule | Tải được khi nhà thầu Dừng hợp tác và có lịch sử tải | `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác; phụ lục Y5 | id V9 + Y5 | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` → `GET /api/contractor-contracts/{id}/history` | `200` | Tải thành công; lịch sử có dòng tải phụ lục | P2 | Có |

## API: Xem phụ lục PDF trong trình xem

**API chính:** `GET /api/contractor-contracts/{id}/annexes/{annexId}/view`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Trả PDF inline, định dạng khác yêu cầu tải xuống.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-103 | Happy path | Xem phụ lục PDF | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 là PDF | id V + Y1 | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | `200` | Trả nội dung PDF | P2 | Có |
| CTV-104 | File API | Header hiển thị inline | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 là PDF | id V + Y1 | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` → đọc header | `200` | `Content-Type` `application/pdf`; `Content-Disposition` dạng `inline` | P2 | Có |
| CTV-105 | Business rule | Phụ lục DOCX không xem trực tiếp | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y2 là DOCX | id V + Y2 | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | `400/409/415` | Báo cần tải xuống; không trả file như PDF | P2 | Có |
| CTV-106 | Ownership/IDOR | Phụ lục của HĐ khác | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1; Y9 thuộc HĐ khác | id V + Y9 | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | `404` | Không trả nội dung | P1 | Có |
| CTV-107 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); phụ lục Y1 | Request hợp lệ | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung PDF, không bọc wrapper JSON; lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CTV-108 | Request validation | `annexId` sai định dạng UUID | `tokenQLNT` | `annexId` = `abc` | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` với `annexId` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTV-109 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTV-110 | Error handling | Phụ lục không tồn tại | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Cấu hình tự động gia hạn

**API chính:** `PUT /api/contractor-contracts/{id}/auto-renewal`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Bật, tắt, đổi chu kỳ 3/6/12/24 tháng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-111 | Happy path | Bật tự động gia hạn 12 tháng | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `enabled`=true, `cycleMonths`=12 | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` → GET HĐ | `200` | Cấu hình bật, chu kỳ 12 | P1 | Có |
| CTV-112 | Business rule | Tắt tự động gia hạn | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); đang bật | `enabled`=false | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` → GET | `200` | Cấu hình tắt | P2 | Có |
| CTV-113 | Boundary | Chu kỳ 3, 6, 12, 24 hợp lệ; 0, 1, 36 bị chặn | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `enabled`=true với từng chu kỳ | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` 7 lần | `200/400` | 4 giá trị hợp lệ lưu được; 3 giá trị còn lại `400` | P2 | Có |
| CTV-114 | Request validation | Thiếu `enabled`; bật mà không có chu kỳ | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Body rỗng; `enabled`=true không có `cycleMonths` | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` 2 lần | `400` | errorCode `validation-failed` | P2 | Có |
| CTV-115 | Business rule | HĐ đã đóng hoặc nhà thầu Dừng hợp tác | HĐ Hết hiệu lực; HĐ Đã hủy; `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | `enabled`=true, `cycleMonths`=6 | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` 3 lần | `400/409` | Bị chặn | P1 | Có |
| CTV-116 | State transition | Cấu hình không đổi trạng thái HĐ | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | `enabled`=true, `cycleMonths`=3 | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` → GET | `200` | HĐ vẫn Chưa hiệu lực | P3 | Có |
| CTV-117 | Ownership/IDOR | Role khác cấu hình | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `enabled`=true, `cycleMonths`=6 | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` với id V | `403` | Cấu hình không đổi | P2 | Có |
| CTV-118 | Data integrity | Ghi lịch sử | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Bật 6 tháng | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` → `GET /api/contractor-contracts/{id}/history` | `200` | Có dòng đổi cấu hình (BR-CTV-18) | P3 | Có |
| CTV-119 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Request hợp lệ | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ hoặc cấu hình sau khi cập nhật; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-120 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P2 | Có |
| CTV-121 | Error handling | Hợp đồng không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `PUT /api/contractor-contracts/{id}/auto-renewal` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |
| CTV-122 | Business rule | Tác vụ 0:00 tự động gia hạn khi đến hạn | `tokenQLNT`; HĐ V bật tự động gia hạn 6 tháng, Ngày hết hạn = hôm qua | Chạy tác vụ 0:00 (hoặc hook test kích hoạt tác vụ) | Chờ tác vụ → `GET /api/contractor-contracts/{id}` | `200` | Ngày hết hạn mới = ngày cũ + 6 tháng; HĐ vẫn Đang hiệu lực, không bị chuyển Hết hiệu lực; lịch sử gia hạn có dòng người thực hiện Hệ thống; nhà thầu giữ Đang hoạt động | P1 | Không |
| CTV-123 | Business rule | Thông báo cảnh báo trước hạn T−7 và xác nhận sau gia hạn | `tokenQLNT`; HĐ bật tự động gia hạn còn đúng 7 ngày đến hạn; HĐ khác đến hạn hôm qua | Chạy tác vụ 0:00 | Chờ tác vụ → QLNT xem thông báo → `GET /api/contractor-contracts/{id}` | `200` | HĐ còn 7 ngày có thông báo sắp tự động gia hạn; HĐ đến hạn có thông báo đã gia hạn kèm ngày hết hạn mới. Mốc T−7 theo yêu cầu kiểm thử, SRS chỉ ghi gửi cảnh báo trước | P2 | Không |
| CTV-124 | Idempotency | Chạy lại tác vụ trong cùng ngày | `tokenQLNT`; HĐ vừa được tác vụ tự động gia hạn hôm nay | Kích hoạt tác vụ lần 2 cùng ngày | Chạy lại tác vụ → `GET /api/contractor-contracts/{id}` | `200` | Ngày hết hạn không bị cộng lần 2; không có dòng lịch sử hay thông báo trùng (BR-CTV-13: chạy lại không làm sai trạng thái) | P1 | Không |
| CTV-125 | Business rule | Đã tắt tự động gia hạn thì tác vụ cho HĐ hết hiệu lực | `tokenQLNT`; HĐ tắt tự động gia hạn, Ngày hết hạn = hôm qua, là HĐ hiệu lực duy nhất | Chạy tác vụ 0:00 | Chờ tác vụ → `GET /api/contractor-contracts/{id}` | `200` | HĐ Hết hiệu lực; nhà thầu Ngưng hoạt động | P2 | Không |
| CTV-126 | Business rule | Gia hạn thủ công khi đang bật tự động gia hạn | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); bật tự động gia hạn 3 tháng | `newExpiry` = ngày cũ + 1 tháng | Gọi `POST /api/contractor-contracts/{id}/extensions` → `GET /api/contractor-contracts/{id}` | `200` | Ngày hết hạn = ngày thủ công; cấu hình tự động gia hạn vẫn bật; lần tự động kế tiếp tính từ ngày mới (BR-CTV-18) | P2 | Có |
| CTV-127 | Business rule | Hủy HĐ tái ký nối tiếp rồi bật lại tự động gia hạn trên HĐ gốc | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); tái ký nối tiếp tạo HĐ chờ P2 làm V bị tắt tự động gia hạn | `reason` hủy; `enabled`=true, `cycleMonths`=12 | Gọi `POST /api/contractor-contracts/{id}/cancel` (P2) → `PUT /api/contractor-contracts/{id}/auto-renewal` (V) → GET V | `200` | Bật lại được; V có tự động gia hạn 12 tháng (BR-CTV-18) | P2 | Có |

## API: Hủy hợp đồng nhà thầu

**API chính:** `POST /api/contractor-contracts/{id}/cancel`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Chỉ hủy HĐ Chưa hiệu lực.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-128 | Happy path | Hủy HĐ Chưa hiệu lực | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | `reason`=`Nhà thầu rút` | Gọi `POST /api/contractor-contracts/{id}/cancel` → GET HĐ → `GET /api/contractors/{id}` | `200` | HĐ Đã hủy; nhà thầu N2 vẫn Tạo mới | P1 | Có |
| CTV-129 | State transition | Hủy HĐ không phải Chưa hiệu lực | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); HĐ Đã hủy | `reason` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/cancel` 2 lần | `400/409` | Bị chặn; trạng thái giữ nguyên | P1 | Có |
| CTV-130 | Business rule | Nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | `reason` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/cancel` với HĐ của D | `400/409` | Bị chặn | P2 | Có |
| CTV-131 | Request validation | Không gửi lý do | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | Body rỗng | Gọi `POST /api/contractor-contracts/{id}/cancel` | `400` | errorCode `validation-failed`; trạng thái không đổi. SRS bắt buộc lý do; nếu API trả 2xx thì ghi Fail và báo lệch SRS–Swagger (xem Điểm cần xác nhận) | P2 | Có |
| CTV-132 | Boundary | `reason` 500/501 | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | Chuỗi biên | Gọi `POST /api/contractor-contracts/{id}/cancel` | `200/400` | 500 thành công; 501 `400` | P3 | Có |
| CTV-133 | Ownership/IDOR | Role khác hủy HĐ | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `reason` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/cancel` với id P | `403` | HĐ vẫn Chưa hiệu lực | P2 | Có |
| CTV-134 | Idempotency | Hủy lần 2 | `tokenQLNT`; HĐ vừa hủy | `reason` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/cancel` lần 2 | `400/409` | Bị chặn; lịch sử 1 dòng | P2 | Có |
| CTV-135 | Data integrity | Ghi lịch sử kèm lý do | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | `reason`=`R-cancel` | Gọi `POST /api/contractor-contracts/{id}/cancel` → `GET /api/contractor-contracts/{id}/history` | `200` | Có dòng hủy kèm lý do | P3 | Có |
| CTV-136 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay) | Request hợp lệ | Gọi `POST /api/contractor-contracts/{id}/cancel` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ sau khi hủy; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-137 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractor-contracts/{id}/cancel` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTV-138 | Error handling | Hợp đồng không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contractor-contracts/{id}/cancel` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Gia hạn hợp đồng nhà thầu

**API chính:** `POST /api/contractor-contracts/{id}/extensions`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Kéo dài HĐ mới nhất, mở lại HĐ hết hiệu lực.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-139 | Happy path | Gia hạn HĐ Đang hiệu lực | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `newExpiry` = Ngày hết hạn cũ + 6 tháng | Gọi `POST /api/contractor-contracts/{id}/extensions` → GET | `200` | Ngày hết hạn mới; mã HĐ không đổi; vẫn Đang hiệu lực | P1 | Có |
| CTV-140 | State transition | Gia hạn HĐ Hết hiệu lực | `tokenQLNT`; nhà thầu Ngưng hoạt động, HĐ E Hết hiệu lực là HĐ mới nhất | `newExpiry` = hôm nay + 3 tháng | Gọi `POST /api/contractor-contracts/{id}/extensions` → GET HĐ → `GET /api/contractors/{id}` | `200` | HĐ Đang hiệu lực; nhà thầu Đang hoạt động | P1 | Không |
| CTV-141 | Business rule | Ngày hết hạn mới không hợp lệ | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `newExpiry` = ngày cũ; trước ngày cũ | Gọi `POST /api/contractor-contracts/{id}/extensions` 2 lần | `400/409` | Bị chặn | P1 | Có |
| CTV-142 | Business rule | Có HĐ tái ký đang chờ | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); HĐ tái ký Chưa hiệu lực từ ngày D | `newExpiry` = D | Gọi `POST /api/contractor-contracts/{id}/extensions` | `400/409` | Bị chặn (BR-CTV-08) | P2 | Có |
| CTV-143 | Business rule | HĐ không phải mới nhất, sai trạng thái, nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay); `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | `newExpiry` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/extensions` 2 lần | `400/409` | Bị chặn | P2 | Có |
| CTV-144 | Boundary | `newExpiry` = ngày cũ + 1 | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Ngày cũ + 1 | Gọi `POST /api/contractor-contracts/{id}/extensions` | `200` | Thành công | P2 | Có |
| CTV-145 | Request validation | Thiếu hoặc sai `newExpiry` | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Bỏ `newExpiry`; `newExpiry`=`abc` | Gọi `POST /api/contractor-contracts/{id}/extensions` 2 lần | `400` | errorCode `validation-failed` | P2 | Có |
| CTV-146 | File API | Gia hạn kèm file phụ lục | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `extension` (`newExpiry`, `annexName`) + `file` PDF | Gọi `POST /api/contractor-contracts/{id}/extensions` → GET | `200` | Tạo phụ lục mã PLV với tên `annexName` | P2 | Có |
| CTV-147 | Ownership/IDOR | Role khác gia hạn | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `newExpiry` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/extensions` với id V | `403` | Không đổi | P2 | Có |
| CTV-148 | Idempotency | Gửi lại cùng `newExpiry` | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Cùng `newExpiry` 2 lần | Gọi `POST /api/contractor-contracts/{id}/extensions` 2 lần | `200` rồi `400/409` | Chỉ 1 lần gia hạn | P2 | Có |
| CTV-149 | Data integrity | Gỡ cảnh báo kỳ hạn | `tokenQLNT`; HĐ Đang hiệu lực còn 5 ngày, có cảnh báo | `newExpiry` = +1 năm | Gọi `POST /api/contractor-contracts/{id}/extensions` → GET | `200` | Không còn cảnh báo kỳ hạn | P2 | Có |
| CTV-150 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Request hợp lệ | Gọi `POST /api/contractor-contracts/{id}/extensions` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ sau khi gia hạn; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-151 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractor-contracts/{id}/extensions` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTV-152 | Error handling | Hợp đồng không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contractor-contracts/{id}/extensions` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Tải file scan hợp đồng nhà thầu

**API chính:** `GET /api/contractor-contracts/{id}/file`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Tải được ở mọi trạng thái, có ghi lịch sử tải.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-153 | Happy path | Tải file scan HĐ nhà thầu | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | id của file đã upload ở bước chuẩn bị | Gọi `GET /api/contractor-contracts/{id}/file` | `200` | Nội dung tải về trùng từng byte với file đã upload (so checksum) | P2 | Có |
| CTV-154 | File API | Header của file scan HĐ nhà thầu | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Như case Happy path | Gọi `GET /api/contractor-contracts/{id}/file` → đọc header | `200` | `Content-Type` đúng loại file đã upload; `Content-Disposition` có tên file gốc; `Content-Length` > 0 | P2 | Có |
| CTV-155 | Ownership/IDOR | Tải file scan HĐ nhà thầu ngoài phạm vi | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | id HĐ V | Gọi `GET /api/contractor-contracts/{id}/file` | `403/404` | Không trả nội dung file | P1 | Có |
| CTV-156 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Request hợp lệ | Gọi `GET /api/contractor-contracts/{id}/file` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có nội dung nhị phân, không bọc wrapper JSON; khi lỗi trả JSON `ApiError`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P3 | Có |
| CTV-157 | Request validation | `id` sai định dạng UUID | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `id` = `abc` | Gọi `GET /api/contractor-contracts/{id}/file` với `id` sai định dạng | `400` | errorCode `validation-failed` hoặc `malformed-request`; không trả `5xx` | P3 | Có |
| CTV-158 | Authentication | Gọi không có token | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Không gửi header `Authorization` | Gọi `GET /api/contractor-contracts/{id}/file` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTV-159 | Error handling | File scan hđ nhà thầu không tồn tại | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contractor-contracts/{id}/file` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |
| CTV-160 | Business rule | Tải ở mọi trạng thái và có lịch sử | `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | id HĐ V9 | Gọi `GET /api/contractor-contracts/{id}/file` → `GET /api/contractor-contracts/{id}/history` | `200` | Tải thành công; lịch sử có dòng tải file | P2 | Có |

## API: Lịch sử thao tác hợp đồng nhà thầu

**API chính:** `GET /api/contractor-contracts/{id}/history`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Lịch sử đủ, mới nhất trước, lọc đúng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-161 | Happy path | Xem lịch sử thao tác hợp đồng nhà thầu | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); đã thêm phụ lục, bật gia hạn, gia hạn | Không lọc; `page=1`, `perPage=20` | Gọi `GET /api/contractor-contracts/{id}/history` | `200` | Có đủ các thao tác đã làm trong tiền điều kiện; sắp xếp mới nhất trước; mỗi dòng có hành động, người thực hiện, thời gian | P2 | Có |
| CTV-162 | Pagination/filter/sort | Lọc lịch sử theo hành động, người thực hiện, khoảng thời gian, từ khóa | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); đã thêm phụ lục, bật gia hạn, gia hạn | Lần lượt: `eventCode`=1 mã hành động; `actorUserId`=user test; `from`/`to` bao quanh thời điểm tạo; `search`=từ khóa trong lý do | Gọi `GET /api/contractor-contracts/{id}/history` với từng bộ lọc | `200` | Mỗi lần chỉ trả dòng khớp bộ lọc; tổng trong `meta.pagination` khớp số dòng; không lọc thì đủ mọi dòng | P3 | Có |
| CTV-163 | Boundary | `perPage` ở biên 1, 100 và 101; `page` = 0 | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); đã thêm phụ lục, bật gia hạn, gia hạn | 4 lần gọi: `perPage=1`; `perPage=100`; `perPage=101`; `page=0` | Gọi `GET /api/contractor-contracts/{id}/history` lần lượt với 4 bộ tham số | `200/400` | `perPage=1` trả đúng 1 bản ghi; `perPage=100` trả tối đa 100; `perPage=101` và `page=0` trả `400` `validation-failed` | P2 | Có |
| CTV-164 | Request validation | Tham số thời gian sai định dạng | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); đã thêm phụ lục, bật gia hạn, gia hạn | `from` = `2026-13-45` | Gọi `GET /api/contractor-contracts/{id}/history` | `400` | errorCode `validation-failed`; không trả `5xx` | P3 | Có |
| CTV-165 | Ownership/IDOR | Xem lịch sử hợp đồng nhà thầu ngoài phạm vi | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | id HĐ V | Gọi `GET /api/contractor-contracts/{id}/history` | `403/404` | Không trả dòng lịch sử nào của bản ghi | P1 | Có |
| CTV-166 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); đã thêm phụ lục, bật gia hạn, gia hạn | Request hợp lệ | Gọi `GET /api/contractor-contracts/{id}/history` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có danh sách dòng lịch sử (hành động, người thực hiện, thời gian, giá trị cũ/mới) và `meta.pagination`; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-167 | Authentication | Gọi không có token | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); đã thêm phụ lục, bật gia hạn, gia hạn | Không gửi header `Authorization` | Gọi `GET /api/contractor-contracts/{id}/history` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ | P2 | Có |
| CTV-168 | Error handling | Hợp đồng nhà thầu không tồn tại | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); đã thêm phụ lục, bật gia hạn, gia hạn | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `GET /api/contractor-contracts/{id}/history` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace | P2 | Có |

## API: Tái ký hợp đồng nhà thầu

**API chính:** `POST /api/contractor-contracts/{id}/resign`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Tạo HĐ mới có liên kết tái ký, xử lý đúng HĐ gốc và tự gia hạn.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-169 | Happy path | Tái ký nối tiếp sau ngày hết hạn gốc | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF; `effectiveFrom` = Ngày hết hạn V + 1 | Gọi `POST /api/contractor-contracts/{id}/resign` → GET HĐ mới → GET HĐ V | `200/201` | HĐ mới mã CTV, Chưa hiệu lực, liên kết Tái ký từ V (BR-CTV-22); V giữ Đang hiệu lực | P1 | Có |
| CTV-170 | Business rule | Tự tắt tự động gia hạn của HĐ gốc | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); V đang bật tự động gia hạn | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF; `effectiveFrom` = Ngày hết hạn V + 1 | Gọi `POST /api/contractor-contracts/{id}/resign` → GET V | `200/201` | Response `previousAutoRenewalTurnedOff`=true; V không còn tự động gia hạn | P1 | Có |
| CTV-171 | State transition | Tái ký thay thế HĐ đang hiệu lực | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF; `effectiveFrom`=hôm nay; lần 1 không `confirmReplacement`, lần 2 `confirmReplacement`=true | Gọi `POST /api/contractor-contracts/{id}/resign` 2 lần → GET V | `409` rồi `200/201` | Lần 1 errorCode `confirmation-required`, không tạo HĐ; lần 2 HĐ mới Đang hiệu lực, V Dừng khai thác | P1 | Có |
| CTV-172 | Business rule | Nhà thầu đã có HĐ Chưa hiệu lực hoặc Dừng hợp tác | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); H đã có HĐ tái ký Chưa hiệu lực; `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF | Gọi `POST /api/contractor-contracts/{id}/resign` 2 lần | `400/409` | Bị chặn | P1 | Có |
| CTV-173 | Business rule | Ngày hiệu lực không hợp lệ | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `effectiveFrom` = hôm qua; ≤ Ngày hiệu lực V | Gọi `POST /api/contractor-contracts/{id}/resign` 2 lần | `400/409` | Bị chặn | P1 | Có |
| CTV-174 | Business rule | Tái ký từ HĐ gốc Đã hủy | `tokenQLNT`; HĐ gốc Đã hủy là HĐ được tái ký theo BR-CTV-09 | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF; `effectiveFrom`=hôm nay | Gọi `POST /api/contractor-contracts/{id}/resign` | `200/201` | Cho phép; HĐ gốc giữ Đã hủy | P2 | Có |
| CTV-175 | Request validation | Thiếu file scan hoặc trường bắt buộc | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Bỏ `file`; bỏ `legalNumber` | Gọi `POST /api/contractor-contracts/{id}/resign` 2 lần | `400` | Bị chặn | P2 | Có |
| CTV-176 | Boundary | 5 và 6 phụ lục kèm theo | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF; `annexFiles` 5 rồi 6 | Gọi `POST /api/contractor-contracts/{id}/resign` 2 lần | `200/201/400` | 5 thành công; 6 bị chặn | P3 | Có |
| CTV-177 | Ownership/IDOR | Role khác tái ký | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF | Gọi `POST /api/contractor-contracts/{id}/resign` với id V | `403` | Không tạo HĐ | P2 | Có |
| CTV-178 | Idempotency | Gửi lại cùng request | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF | Gọi `POST /api/contractor-contracts/{id}/resign` 2 lần | `200/201` rồi `400/409` | Chỉ 1 HĐ mới | P2 | Có |
| CTV-179 | Data integrity | Lỗi không đổi HĐ gốc | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF; file 0 byte; `confirmReplacement`=true | Gọi `POST /api/contractor-contracts/{id}/resign` → GET V | `400` | V giữ Đang hiệu lực, cấu hình gia hạn không đổi | P1 | Có |
| CTV-180 | File API | File scan sai định dạng | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | multipart `contract`: `name`, `legalNumber` mới, `signedOn`=hôm nay, `effectiveFrom`, `effectiveTo`; `file` scan PDF; `file`=`.exe` | Gọi `POST /api/contractor-contracts/{id}/resign` | `400` | Bị chặn | P3 | Có |
| CTV-181 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Request hợp lệ | Gọi `POST /api/contractor-contracts/{id}/resign` → so response với schema Swagger | `200/201` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ mới (`id`, `code`, `status`, liên kết HĐ gốc, `previousAutoRenewalTurnedOff`); kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-182 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractor-contracts/{id}/resign` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTV-183 | Error handling | Hợp đồng không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contractor-contracts/{id}/resign` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Dừng khai thác hợp đồng nhà thầu

**API chính:** `POST /api/contractor-contracts/{id}/suspend`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Chỉ dừng HĐ Đang hiệu lực; nhà thầu hết HĐ hiệu lực thì Ngưng hoạt động.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-184 | Happy path | Dừng khai thác HĐ Đang hiệu lực | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `reason`=`Vi phạm SLA` | Gọi `POST /api/contractor-contracts/{id}/suspend` → GET HĐ | `200` | HĐ Dừng khai thác | P1 | Có |
| CTV-185 | Business rule | Nhà thầu không còn HĐ hiệu lực thì Ngưng hoạt động | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất); V là HĐ hiệu lực duy nhất | `reason` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/suspend` → `GET /api/contractors/{id}` | `200` | Nhà thầu H Ngưng hoạt động | P1 | Có |
| CTV-186 | State transition | Dừng HĐ không phải Đang hiệu lực | `tokenQLNT`; nhà thầu N2 Tạo mới, HĐ P Chưa hiệu lực (Ngày hiệu lực > hôm nay); HĐ Dừng khai thác | `reason` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/suspend` 2 lần | `400/409` | Bị chặn | P1 | Có |
| CTV-187 | Business rule | Nhà thầu Dừng hợp tác | `tokenQLNT`; nhà thầu D Dừng hợp tác, HĐ V9 Dừng khai thác | `reason` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/suspend` với HĐ của D | `400/409` | Bị chặn | P2 | Có |
| CTV-188 | Request validation | Không gửi lý do | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Body rỗng | Gọi `POST /api/contractor-contracts/{id}/suspend` | `400` | errorCode `validation-failed`; trạng thái không đổi. SRS bắt buộc lý do; nếu API trả 2xx thì ghi Fail và báo lệch SRS–Swagger (xem Điểm cần xác nhận) | P2 | Có |
| CTV-189 | Boundary | `reason` 500/501 | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Chuỗi biên | Gọi `POST /api/contractor-contracts/{id}/suspend` | `200/400` | 500 thành công; 501 `400` | P3 | Có |
| CTV-190 | Ownership/IDOR | Role khác dừng HĐ | `tokenNVKD` (không thuộc bộ phận quản lý nhà thầu) | `reason` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/suspend` với id V | `403` | HĐ không đổi | P2 | Có |
| CTV-191 | Idempotency | Dừng lần 2 | `tokenQLNT`; HĐ vừa dừng | `reason` hợp lệ | Gọi `POST /api/contractor-contracts/{id}/suspend` lần 2 | `400/409` | Bị chặn | P2 | Có |
| CTV-192 | Data integrity | Ghi lịch sử kèm lý do | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | `reason`=`R-susp` | Gọi `POST /api/contractor-contracts/{id}/suspend` → `GET /api/contractor-contracts/{id}/history` | `200` | Có dòng dừng khai thác kèm lý do | P3 | Có |
| CTV-193 | Response contract | Response đúng schema Swagger | `tokenQLNT`; nhà thầu H Đang hoạt động, HĐ V Đang hiệu lực (HĐ mới nhất) | Request hợp lệ | Gọi `POST /api/contractor-contracts/{id}/suspend` → so response với schema Swagger | `200` | Wrapper `success`=true, `errorCode` rỗng; `data` có HĐ sau khi dừng; kiểu dữ liệu, định dạng ngày ISO và trạng thái dạng `StatusView` (`value`, `code`, `name`) đúng Swagger | P2 | Có |
| CTV-194 | Authentication | Gọi không có token | `tokenQLNT` | Không gửi header `Authorization` | Gọi `POST /api/contractor-contracts/{id}/suspend` không kèm token | `401` | errorCode `authentication-required`; không trả dữ liệu nghiệp vụ; không tạo, sửa hay xóa bản ghi nào | P1 | Có |
| CTV-195 | Error handling | Hợp đồng không tồn tại | `tokenQLNT` | id = UUID ngẫu nhiên chưa có trong hệ thống | Gọi `POST /api/contractor-contracts/{id}/suspend` với id ngẫu nhiên | `404` | errorCode `resource-not-found`; body đúng schema `ApiError` (`success`=false, `errorCode`, `message`); không lộ stacktrace; không tạo dữ liệu mới | P2 | Có |

## API: Mã tự sinh của hợp đồng nhà thầu

**API chính:** `POST /api/contractor-contracts`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Mã HĐ nhà thầu do hệ thống tự sinh theo thứ tự tạo.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| CTV-196 | Business rule | Mã HĐ nhà thầu tự sinh tăng dần theo thứ tự tạo | `tokenQLNT`; 2 nhà thầu Tạo mới chưa có HĐ | 2 request thêm HĐ hợp lệ cho 2 nhà thầu | Gọi `POST /api/contractor-contracts` cho nhà thầu 1 → gọi `POST /api/contractor-contracts` cho nhà thầu 2 → so 2 mã HĐ | `200/201` | Cả 2 mã khớp `CTVYYMM-XXX`; mã HĐ tạo sau lớn hơn mã HĐ tạo trước | P1 | Có |

## Luồng API: Lead → Hợp đồng đầu tiên → Khách hàng chính thức

**API chính:** `GET /api/leads/assignable-owners`, `POST /api/leads`, `POST /api/leads/import`, `GET /api/leads`, `PUT /api/leads/{id}`, `POST /api/leads/{id}/contacts`, `POST /api/leads/{id}/documents`, `POST /api/leads/{id}/deactivate`, `POST /api/leads/{id}/reactivate`, `POST /api/leads/{id}/transfer-owner`, `GET /api/contracts/uploadable-customers`, `GET /api/contracts/assignable-managers`, `POST /api/contracts`, `GET /api/customers/{id}`, `PUT /api/customers/{id}`, `PUT /api/customers/{id}/tier`, `PUT /api/customers/{id}/credit-limit`, `GET /api/customers/assignable-managers`, `POST /api/customers/{id}/transfer-account-manager`, `GET /api/contracts/{id}`, `PUT /api/contracts/{id}`, `POST /api/contracts/{id}/extensions`  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** Lead đi hết vòng đời tới KH chính thức, dữ liệu và quyền được bàn giao đúng giữa NVKD và DVKH.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| FLOW-LEAD-001 | Flow/end-to-end API | Tạo Lead, khai thác rồi upload HĐ đầu tiên hiệu lực hôm nay | `tokenNVKD`, `tokenDVKH`; MST mới | Lead hợp lệ; đầu mối thứ 2; file PDF; HĐ `effectiveFrom`=hôm nay | `GET /api/leads/assignable-owners` lấy id NVKD A → `POST /api/leads` → `POST /api/leads/{id}/contacts` → `POST /api/leads/{id}/documents` → `PUT /api/leads/{id}` → `GET /api/contracts/uploadable-customers` có Lead → `GET /api/contracts/assignable-managers` lấy DVKH A → `POST /api/contracts` → DVKH gọi `GET /api/customers/{id}` | `200/201` mỗi bước | Lead `CONVERTED`; KH `ACTIVE` có mã KH, giữ 2 đầu mối, tài liệu Lead và thông tin đã sửa; người phụ trách DVKH A; Lead không còn trong uploadable-customers | P1 | Có |
| FLOW-LEAD-002 | Flow/end-to-end API | Upload HĐ hiệu lực tương lai, KH chờ hiệu lực | `tokenNVKD`, `tokenDVKH`; Lead `ACTIVE` mới | HĐ `effectiveFrom`=+10 ngày | `POST /api/leads` → `POST /api/contracts` → `GET /api/customers/{id}` | `200/201` rồi `200` | HĐ `PENDING`; KH `SUSPENDED` lý do `PENDING_CONTRACT`; KH chuyển `ACTIVE` sau tác vụ 0:00 (không tự động được, xem Không áp dụng) | P1 | Có |
| FLOW-LEAD-003 | Flow/end-to-end API | Lead ngưng hoạt động không upload được HĐ cho tới khi kích hoạt lại | `tokenNVKD`; Lead `ACTIVE` chưa có HĐ | `reason`=`Tạm dừng` | `POST /api/leads/{id}/deactivate` → `GET /api/contracts/uploadable-customers` không có Lead → `POST /api/contracts` bị chặn → `POST /api/leads/{id}/reactivate` → `GET /api/contracts/uploadable-customers` có Lead → `POST /api/contracts` | `200`, `400/409`, `200`, `200/201` | Chỉ tạo được HĐ sau khi Lead `ACTIVE` lại; lịch sử Lead có đủ ngưng, kích hoạt, chuyển đổi | P1 | Có |
| FLOW-LEAD-004 | Flow/end-to-end API | Import Lead rồi chuyển người phụ trách | `tokenNVKD` (A), `tokenNVKD_B` (B) | File import 2 dòng hợp lệ | `POST /api/leads/import` → `GET /api/leads` (A thấy 2 Lead) → `POST /api/leads/{id}/transfer-owner` cho B → A và B gọi `GET /api/leads` | `200`, `204`, `200` | Lead chuyển xuất hiện ở danh sách B, biến mất ở A; B upload được HĐ cho Lead đó, A thì không | P2 | Có |
| FLOW-LEAD-005 | Flow/end-to-end API | DVKH quản lý KH rồi chuyển người phụ trách | `tokenDVKH` (A), `tokenDVKH_B` (B); KH K từ luồng trên | Tên mới; `tier`=`STRATEGIC`; `creditLimit`=100000000; lý do chuyển | `GET /api/customers/{id}` → `PUT /api/customers/{id}` → `PUT /api/customers/{id}/tier` → `PUT /api/customers/{id}/credit-limit` → `GET /api/customers/assignable-managers` lấy B → `POST /api/customers/{id}/transfer-account-manager` → B gọi `GET /api/customers/{id}` | `200` các bước, `204` khi chuyển | B thấy đủ thay đổi của A; HĐ `ACTIVE`/`PENDING` đổi người phụ trách sang B; A không còn quyền sửa KH | P1 | Có |
| FLOW-LEAD-006 | Flow/end-to-end API | Sau chuyển người phụ trách: đọc lại từng HĐ, người cũ bị chặn, người mới thao tác được | `tokenDVKH` (A), `tokenDVKH_B` (B); KH K có HĐ `ACTIVE` và HĐ `EXPIRED` | Lý do chuyển; body sửa HĐ; `newExpiry` hợp lệ | `POST /api/customers/{id}/transfer-account-manager` → `GET /api/contracts/{id}` cho từng HĐ → A gọi `PUT /api/contracts/{id}` → B gọi `PUT /api/contracts/{id}` → B gọi `POST /api/contracts/{id}/extensions` | `204`, `200`, `403/404`, `200`, `200` | HĐ `ACTIVE` thuộc B, HĐ `EXPIRED` giữ A; A bị chặn ghi; B sửa và gia hạn thành công | P1 | Có |
| FLOW-LEAD-007 | Flow/end-to-end API | MST của Lead đã chuyển đổi không tạo lại được Lead | `tokenNVKD`; KH K có MST `M` | Body Lead với `taxCode`=`M` | `POST /api/contracts` (chuyển đổi Lead) → `POST /api/leads` với cùng MST | `200/201` rồi `409` | Không tạo Lead trùng MST với KH chính thức | P2 | Có |

## Luồng API: Vòng đời hợp đồng khách hàng

**API chính:** `GET /api/contracts/{id}`, `PUT /api/contracts/{id}`, `POST /api/contracts/{id}/annexes`, `PUT /api/contracts/{id}/annexes/{annexId}`, `DELETE /api/contracts/{id}/annexes/{annexId}`, `POST /api/contracts/{id}/extensions`, `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/cancel`, `POST /api/contracts/{id}/suspend`, `GET /api/customers/{id}`  
**Role hợp lệ:** DVKH (người phụ trách)  
**Mục tiêu:** Mỗi thao tác trên HĐ đổi đúng trạng thái HĐ và trạng thái KH đi kèm.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| FLOW-CTR-001 | Flow/end-to-end API | Sửa HĐ và quản lý phụ lục không đổi trạng thái | `tokenDVKH`; HĐ A `ACTIVE` | Điều khoản thanh toán mới; phụ lục PDF; tên phụ lục mới | `PUT /api/contracts/{id}` → `POST /api/contracts/{id}/annexes` → `PUT /api/contracts/{id}/annexes/{annexId}` → `DELETE /api/contracts/{id}/annexes/{annexId}` → `GET /api/contracts/{id}` | `200` mỗi bước | HĐ vẫn `ACTIVE`; không còn phụ lục đã xóa; lịch sử có 4 dòng theo đúng thứ tự | P1 | Có |
| FLOW-CTR-002 | Flow/end-to-end API | Kích hoạt HĐ chờ bằng cách sửa ngày | `tokenDVKH`; HĐ P `PENDING`, KH `SUSPENDED` (`PENDING_CONTRACT`) | `effectiveFrom`=hôm nay, `confirmActivation`=true | `PUT /api/contracts/{id}` → `GET /api/contracts/{id}` → `GET /api/customers/{id}` | `200` | HĐ `ACTIVE`; KH `ACTIVE` | P1 | Có |
| FLOW-CTR-003 | Flow/end-to-end API | Hủy HĐ chờ là HĐ duy nhất | `tokenDVKH`; KH chỉ có HĐ P `PENDING` | `reason`=`Khách đổi ý` | `POST /api/contracts/{id}/cancel` → `GET /api/contracts/{id}` → `GET /api/customers/{id}` | `200` | HĐ `CANCELLED`; KH `SUSPENDED` lý do `NO_ACTIVE_CONTRACT`; HĐ không còn nút thay đổi | P1 | Có |
| FLOW-CTR-004 | Flow/end-to-end API | Dừng khai thác rồi tái ký để KH hoạt động lại | `tokenDVKH`; HĐ A `ACTIVE` | `reason`; HĐ tái ký `effectiveFrom`=hôm nay, `confirmReplacement`=true | `POST /api/contracts/{id}/suspend` → `GET /api/customers/{id}` → `POST /api/contracts/{id}/resign` → `GET /api/customers/{id}` | `200`, `200`, `200/201`, `200` | Sau dừng KH `SUSPENDED` (`CONTRACT_SUSPENDED`); sau tái ký có HĐ mới `ACTIVE`, liên kết với HĐ A, KH `ACTIVE` | P1 | Có |
| FLOW-CTR-005 | Flow/end-to-end API | Tái ký thay thế HĐ đang hiệu lực | `tokenDVKH`; HĐ A `ACTIVE` | `effectiveFrom`=hôm nay; lần 1 không xác nhận; lần 2 `confirmReplacement`=true | `POST /api/contracts/{id}/resign` → `POST /api/contracts/{id}/resign` → `GET /api/contracts/{id}` (HĐ A) | `409` rồi `200/201` | HĐ A `SUSPENDED`; HĐ mới `ACTIVE`; KH vẫn `ACTIVE` | P1 | Có |
| FLOW-CTR-006 | Flow/end-to-end API | Gia hạn sau khi có HĐ tái ký chờ | `tokenDVKH`; HĐ A `ACTIVE`; tái ký nối tiếp tạo HĐ chờ từ ngày D | `newExpiry` < D rồi `newExpiry` = D | `POST /api/contracts/{id}/resign` → `POST /api/contracts/{id}/extensions` (< D) → `POST /api/contracts/{id}/extensions` (= D) | `200/201`, `200`, `400/409` | Gia hạn hợp lệ được nhận; gia hạn chạm ngày hiệu lực HĐ chờ bị chặn (BR-CTR-09) | P2 | Có |

## Luồng API: Nhà thầu → Hợp đồng nhà thầu

**API chính:** `POST /api/contractors`, `POST /api/contractors/{id}/documents`, `PUT /api/contractors/{id}`, `POST /api/contractors/{id}/contacts`, `PUT /api/contractors/{id}/tier`, `DELETE /api/contractors/{id}`, `GET /api/contractors/{id}`, `GET /api/contractor-contracts/contractor-options`, `POST /api/contractor-contracts`, `GET /api/contractor-contracts/{id}`, `PUT /api/contractor-contracts/{id}/auto-renewal`, `POST /api/contractor-contracts/{id}/extensions`, `POST /api/contractor-contracts/{id}/resign`, `POST /api/contractor-contracts/{id}/cancel`, `POST /api/contractor-contracts/{id}/suspend`, `POST /api/contractors/{id}/terminate`, `POST /api/contractors/{id}/reactivate`, `PUT /api/contractor-contracts/{id}`, `POST /api/contractor-contracts/{id}/annexes`, `GET /api/contractor-contracts/{id}/file`  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Trạng thái nhà thầu đi đúng theo hợp đồng qua toàn bộ vòng đời.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| FLOW-VDR-001 | Flow/end-to-end API | Tạo nhà thầu, hoàn thiện hồ sơ và thêm HĐ đầu tiên hiệu lực hôm nay | `tokenQLNT`; MST mới | Nhà thầu hợp lệ; PDF; đầu mối 2; hạng mới; HĐ `effectiveFrom`=hôm nay | `POST /api/contractors` → `POST /api/contractors/{id}/documents` → `PUT /api/contractors/{id}` → `POST /api/contractors/{id}/contacts` → `PUT /api/contractors/{id}/tier` → `GET /api/contractor-contracts/contractor-options` (`mode=NEW`) có nhà thầu → `POST /api/contractor-contracts` → `GET /api/contractors/{id}` | `201`, `201`, `200`, `201`, `200`, `200`, `200/201`, `200` | Nhà thầu Đang hoạt động, đủ hồ sơ, hạng mới, có 1 HĐ Đang hiệu lực; không còn trong `mode=NEW` | P1 | Có |
| FLOW-VDR-002 | Flow/end-to-end API | Xóa nhà thầu tạo nhầm | `tokenQLNT` | Nhà thầu hợp lệ | `POST /api/contractors` → `DELETE /api/contractors/{id}` → `GET /api/contractors/{id}` | `201`, `204`, `404` | Nhà thầu không còn; MST tạo lại được | P2 | Có |
| FLOW-VDR-003 | Flow/end-to-end API | HĐ chưa hiệu lực bị hủy, nhà thầu không xóa được nữa | `tokenQLNT`; nhà thầu Tạo mới | HĐ `effectiveFrom`=+10 ngày; bật gia hạn 6 tháng; `reason` hủy | `POST /api/contractor-contracts` → `PUT /api/contractor-contracts/{id}/auto-renewal` → `POST /api/contractor-contracts/{id}/cancel` → `GET /api/contractors/{id}` → `DELETE /api/contractors/{id}` | `200/201`, `200`, `200`, `200`, `400/409` | HĐ Đã hủy; nhà thầu vẫn Tạo mới; xóa bị chặn vì đã từng có HĐ (BR-VD-15) | P1 | Có |
| FLOW-VDR-004 | Flow/end-to-end API | Gia hạn rồi tái ký thay thế | `tokenQLNT`; nhà thầu Đang hoạt động, HĐ V Đang hiệu lực bật tự động gia hạn | `newExpiry` = +6 tháng; HĐ tái ký `effectiveFrom`=hôm nay, `confirmReplacement`=true | `POST /api/contractor-contracts/{id}/extensions` → `GET /api/contractor-contracts/contractor-options` (`mode=RESIGN`) có nhà thầu → `POST /api/contractor-contracts/{id}/resign` → `GET /api/contractor-contracts/{id}` (HĐ V) | `200`, `200`, `200/201`, `200` | V được gia hạn rồi chuyển Dừng khai thác; HĐ mới Đang hiệu lực có liên kết tái ký; nhà thầu vẫn Đang hoạt động | P1 | Có |
| FLOW-VDR-005 | Flow/end-to-end API | Dừng khai thác HĐ duy nhất làm nhà thầu Ngưng hoạt động | `tokenQLNT`; nhà thầu Đang hoạt động, 1 HĐ Đang hiệu lực | `reason`=`Vi phạm` | `POST /api/contractor-contracts/{id}/suspend` → `GET /api/contractors/{id}` → `GET /api/contractor-contracts/contractor-options` (`mode=RESIGN`) | `200` | Nhà thầu Ngưng hoạt động; vẫn có trong danh sách tái ký | P1 | Có |
| FLOW-VDR-006 | Flow/end-to-end API | Dừng hợp tác rồi kích hoạt lại | `tokenQLNT`; nhà thầu Đang hoạt động có HĐ Đang hiệu lực và HĐ tái ký Chưa hiệu lực | `reason` dừng; `reason` kích hoạt | `POST /api/contractors/{id}/terminate` → `GET /api/contractors/{id}` → `PUT /api/contractors/{id}` bị chặn → `POST /api/contractors/{id}/reactivate` → `GET /api/contractors/{id}` | `200`, `200`, `400/409`, `200`, `200` | Sau dừng: HĐ hiệu lực Dừng khai thác, HĐ chờ Đã hủy, mọi thao tác khóa. Sau kích hoạt: nhà thầu Ngưng hoạt động, HĐ cũ không khôi phục | P1 | Có |
| FLOW-VDR-007 | Flow/end-to-end API | Dừng hợp tác: kiểm từng HĐ và gọi trực tiếp API ghi bị khóa, rồi kích hoạt lại | `tokenQLNT`; nhà thầu có HĐ V Đang hiệu lực, HĐ P Chưa hiệu lực, HĐ C Đã hủy | `reason` dừng; body hợp lệ cho từng API ghi; `reason` kích hoạt | `POST /api/contractors/{id}/terminate` → `GET /api/contractor-contracts/{id}` cho V, P, C → `PUT /api/contractor-contracts/{id}` → `POST /api/contractor-contracts/{id}/annexes` → `POST /api/contractor-contracts/{id}/extensions` → `POST /api/contractor-contracts/{id}/suspend` → `GET /api/contractor-contracts/{id}/file` → `POST /api/contractors/{id}/reactivate` → `GET /api/contractor-contracts/{id}` cho V, P, C | `200`, `200`, 4 lần `400/409`, `200`, `200`, `200` | Sau dừng: V Dừng khai thác, P Đã hủy, C giữ Đã hủy; 4 API ghi bị chặn, dữ liệu không đổi; tải file scan vẫn được. Sau kích hoạt: cả 3 HĐ giữ nguyên trạng thái | P1 | Có |

## UI: Danh sách Lead

**Màn hình:** Quản lý Lead → Danh sách  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Màn danh sách hiển thị đúng, tìm lọc, import, export hoạt động.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| UI-LEAD-001 | Hiển thị trang | Mở màn danh sách Lead | NVKD A đăng nhập web | Không | Đăng nhập → vào menu Lead | `200` | Có ô số liệu tổng quan, ô tìm kiếm, bộ lọc, nút Thêm, Import, Xuất Excel, bảng danh sách | P1 | Có |
| UI-LEAD-002 | Bảng danh sách | Tìm kiếm, lọc, phân trang | NVKD A có 25 Lead | Từ khóa tên; lọc trạng thái 2 giá trị; đổi trang | Nhập từ khóa → chọn bộ lọc → chuyển trang 2 | `200` | Bảng khớp kết quả `GET /api/leads` cùng tham số; số trang và tổng đúng; Lead mới nhất ở đầu | P1 | Có |
| UI-LEAD-003 | Hiển thị dữ liệu | Ô số liệu khớp API | NVKD A có Lead ở 3 trạng thái | Không | Mở màn → so với `GET /api/leads/stats` | `200` | 3 ô số liệu theo SRS UC Xem danh sách Lead (Tổng số Lead, Lead Đang hoạt động, Lead Ngưng hoạt động) bằng response API (sửa 2026-11-05: tài liệu cũ ghi 4 ô) | P2 | Có |
| UI-LEAD-004 | Upload/download | Import và xuất Excel | File import 3 dòng (1 dòng lỗi) | File `.xlsx` | Tải file mẫu → Import file → xem kết quả → Xuất Excel | `200` | Màn kết quả báo 2 thành công, 1 lỗi kèm số dòng; file xuất tải về đúng tên `.xlsx` | P2 | Có |
| UI-LEAD-005 | Phân quyền UI | Role khác không thấy menu Lead | Tài khoản QLNT | Không | Đăng nhập QLNT → tìm menu Lead → gõ thẳng URL màn Lead | `403` | Không có menu; vào bằng URL bị chặn hoặc chuyển trang không có quyền | P2 | Có |
| UI-LEAD-006 | Session | Token hết hạn khi đang ở màn | NVKD A đã đăng nhập | Xóa hoặc làm hỏng token trong storage | Thao tác lọc sau khi token hỏng | `401` | Chuyển về trang đăng nhập (user chốt 2026-11-06: ra được màn đăng nhập là đạt); đăng nhập lại vào được hệ thống (trang đích theo role) và mở lại được màn danh sách Lead | P1 | Có |
| UI-LEAD-007 | Responsive | Hiển thị ở 375px, 768px, 1366px | NVKD A đăng nhập | 3 kích thước | Đổi kích thước cửa sổ | `Không áp dụng` | Bảng cuộn ngang được, nút không chồng lên nhau, không mất cột chính | P3 | Có |
| UI-LEAD-008 | Accessibility | Điều khiển bằng bàn phím | NVKD A đăng nhập | Tab, Enter, Esc | Dùng Tab qua ô tìm kiếm, bộ lọc, bảng, nút Thêm | `Không áp dụng` | Mọi nút tới được bằng Tab, có viền focus; Enter mở và Esc đóng popup. Nút icon không bắt buộc có nhãn đọc được, chỉ cần đúng chức năng (user chốt 2026-11-05) | P3 | Có |
| UI-LEAD-009 | Visual regression | So ảnh màn danh sách | Dữ liệu seed cố định | Ảnh chuẩn đã duyệt | Chụp ảnh màn → so ảnh chuẩn | `Không áp dụng` | Sai khác dưới ngưỡng thống nhất | P3 | Có |

## UI: Thêm mới và chi tiết Lead

**Màn hình:** Quản lý Lead → Thêm mới / Chi tiết  
**Role hợp lệ:** NVKD  
**Mục tiêu:** Form tạo, sửa Lead validate đúng và nút theo trạng thái Lead.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| UI-LEADF-001 | Form validation | Bỏ trống trường bắt buộc | NVKD A ở form Thêm mới | Để trống tên công ty, MST, ngành hàng, tuyến, nguồn, đầu mối | Bấm Lưu | `Không áp dụng` | Hiện lỗi dưới từng trường; không gọi API tạo | P1 | Có |
| UI-LEADF-002 | Form validation | MST, SĐT, email sai định dạng | NVKD A ở form Thêm mới | MST 9 số; SĐT `12345`; email `abc@` | Nhập → rời ô → bấm Lưu | `Không áp dụng` | Lỗi định dạng hiện ngay tại ô; không gọi API | P2 | Có |
| UI-LEADF-003 | Thao tác form | Tạo Lead thành công | NVKD A | Dữ liệu hợp lệ, 2 đầu mối | Nhập → thêm đầu mối → chọn đầu mối chính → Lưu | `200/201` | Chuyển sang chi tiết Lead mã LED-XXXX; đúng 1 đầu mối chính | P1 | Có |
| UI-LEADF-004 | Thông báo | Thông báo thành công và lỗi MST trùng | MST `M1` đã có | Lần 1 dữ liệu hợp lệ; lần 2 MST `M1` | Lưu 2 lần | `200/201`, `409` | Lần 1 toast thành công; lần 2 thông báo MST đã tồn tại, form giữ dữ liệu đã nhập | P1 | Có |
| UI-LEADF-005 | Trạng thái UI | Nút theo trạng thái Lead | Lead `ACTIVE`, `INACTIVE`, `CONVERTED` | Không | Mở chi tiết từng Lead | `200` | `ACTIVE`: Sửa, Ngưng, Chuyển người phụ trách; `INACTIVE`: Kích hoạt lại; `CONVERTED`: chỉ đọc, không có nút thay đổi | P1 | Có |
| UI-LEADF-006 | Thao tác form | Ngưng Lead bắt buộc lý do | Lead `ACTIVE` | Lý do rỗng rồi có lý do | Bấm Ngưng → bỏ trống lý do → xác nhận → nhập lý do → xác nhận | `200` | Không cho xác nhận khi thiếu lý do; sau khi ngưng trạng thái hiển thị Ngưng hoạt động | P2 | Có |
| UI-LEADF-007 | Thao tác form | Chuyển người phụ trách Lead | NVKD A phụ trách Lead `ACTIVE`; NVKD B đang hoạt động | Chọn NVKD B, lý do `Phân lại địa bàn` | Mở chi tiết Lead → Chuyển người phụ trách → bấm Xác nhận khi chưa chọn người và chưa nhập lý do → chọn B, nhập lý do → Xác nhận | `204` | Bấm Xác nhận khi thiếu người nhận hoặc lý do: hiện thông báo yêu cầu chọn người phụ trách mới / nhập lý do và không gọi API (nút không cần vô hiệu, user chốt 2026-11-05); ô chọn chỉ có NVKD đang hoạt động, không có NVKD A; sau xác nhận có toast thành công, NVKD A không còn thấy Lead trong danh sách; NVKD B thấy Lead và có thông báo | P1 | Có |
| UI-LEADF-008 | Error handling | Lỗi máy chủ khi lưu | Giả lập API trả `500` | Dữ liệu hợp lệ | Bấm Lưu | `500` | Hiện thông báo lỗi thân thiện, không trắng trang, form giữ dữ liệu | P2 | Có |
| UI-LEADF-009 | Upload/download | Đính kèm tài liệu quá dung lượng | Lead `ACTIVE` | File 11MB (`upload_test_11mb.pdf`) | Chọn file đính kèm | `400/413` | Báo vượt 10MB; danh sách tài liệu không đổi | P2 | Có |
| UI-LEADF-010 | Form validation | Biên và phân vùng MST khi thêm và sửa Lead | NVKD A; Lead `ACTIVE` riêng cho từng biến thể sửa; Lead Đang hoạt động, Ngưng hoạt động và KH đã chuyển đổi có MST đã biết | MST 9, 10, 11, 12, 13, 14 chữ số; chữ xen số; rỗng; MST hợp lệ có số 0 đầu; khi sửa: giữ MST hiện tại; MST trùng Lead Đang hoạt động, Ngưng hoạt động, KH | Mở form Thêm hoặc Sửa → chỉ thay MST, các trường khác hợp lệ → Lưu → mở lại Lead | `200/201/400/409` | 10 và 13 số duy nhất lưu đúng chuỗi, giữ số 0 đầu; sửa giữ MST hiện tại được phép; giá trị sai báo tại ô MST; MST trùng ở mọi trạng thái báo đã tồn tại, dữ liệu cũ giữ nguyên (bổ sung cho LEAD-019, LEAD-101 đến 104) | P1 | Có |
| UI-LEADF-011 | Form validation | Bỏ từng trường bắt buộc và biên độ dài form Lead | NVKD A ở form Thêm và form Sửa | Bỏ riêng từng trường bắt buộc; tên công ty 254/255/256; địa chỉ 499/500/501; website hợp lệ và URL sai; ghi chú ở ngưỡng của màn (chờ chốt: UI 255, API 500) | Nhập từng biến thể, giữ trường khác hợp lệ → Lưu → tải lại | `200/201/400` | Form chỉ rõ đúng trường thiếu hoặc sai; chuỗi trong ngưỡng lưu đủ và hiển thị đúng sau tải lại; gõ hoặc dán quá ngưỡng theo quy tắc của màn (chặn nhập hoặc báo lỗi), giá trị lưu không vượt ngưỡng | P2 | Có |
| UI-LEADF-012 | Form validation | Ngành hàng Khác trên form | NVKD A ở form Thêm và form Sửa | Chọn ngành thường; chọn Khác với mô tả rỗng, toàn dấu cách, 254/255/256 ký tự; điền mô tả rồi bỏ chọn Khác | Chọn ngành theo từng biến thể → Lưu → mở lại Lead | `200/201/400` | Ô Nhập ngành hàng khác chỉ hiện và bắt buộc khi chọn Khác; rỗng và toàn dấu cách bị chặn; 254 và 255 lưu đủ, 256 bị chặn; bỏ chọn Khác thì mô tả cũ không còn được lưu (bổ sung cho LEAD-035 đến 037, LEAD-105) | P2 | Có |
| UI-LEADF-013 | Form validation | Biên đầu mối liên hệ Lead | NVKD A; Lead `ACTIVE` có 1 và 2 đầu mối | Họ tên 99/100/101; email 99/100/101 và bỏ trống; chức danh 99/100/101 và bỏ trống; SĐT `0` và `+84` với phần sau 8, 9, 10, 11 chữ số | Mở popup Thêm hoặc Sửa đầu mối → nhập từng biến thể → Lưu | `201/200/400` | Giá trị trong ngưỡng lưu đúng; trường tùy chọn bỏ trống lưu được; `0` hoặc `+84` kèm 9 và 10 chữ số hợp lệ, 8 và 11 bị chặn tại ô SĐT | P2 | Có |
| UI-LEADF-014 | Thao tác form | Đầu mối chính khi thêm, đổi và xóa trên UI | NVKD A; Lead `ACTIVE` có 1 đầu mối, Lead có 2 đầu mối | Đổi đầu mối chính; xóa đầu mối chính khi còn 2; xóa đầu mối cuối | Thao tác lần lượt trên chi tiết Lead → xác nhận | `200/204/400/409` | Lead luôn có đúng 1 đầu mối chính; xóa đầu mối chính thì đầu mối còn lại thành chính; xóa đầu mối cuối bị chặn và hiển thị lý do | P2 | Có |
| UI-LEADF-015 | Form validation | Biên lý do ngưng hoạt động và chuyển người phụ trách Lead | NVKD A; mỗi biến thể dùng Lead `ACTIVE` riêng | Lý do rỗng, toàn khoảng trắng, 499/500/501 ký tự; người nhận: NVKD hợp lệ, tài khoản khóa, người đang phụ trách; bấm Hủy ở hộp xác nhận | Mở popup Ngưng hoạt động hoặc Chuyển người phụ trách → nhập biến thể → Xác nhận hoặc Hủy | `200/204/400` | Ô chọn không có tài khoản khóa và người đang phụ trách; lý do 499 và 500 lưu được, cập nhật trạng thái hoặc người phụ trách, có lịch sử; lý do rỗng, khoảng trắng, 501 hoặc bấm Hủy giữ nguyên dữ liệu (bổ sung cho LEAD-151, LEAD-208) | P2 | Có |
| UI-LEADF-016 | Upload/download | Phân vùng file import Lead và tài liệu đính kèm | NVKD A; file import dựng từ file mẫu người dùng cung cấp `Mau_Nhap_Lead.xlsx` (sheet Lead 13 cột, sheet Danh mục) | Bộ file thật: `G:/upload-test-files` (10MB/11MB pdf, docx, jpg, png, xlsx, zip; other-formats-1mb) và `G:/test-size-files` (20MB/21MB pdf, docx, doc). Import: `.xlsx` 0 dòng, 1 dòng, trộn hợp lệ–lỗi–trùng, toàn dòng lỗi, sai cấu trúc cột, sai loại file (CSV 1MB). Đính kèm: DOCX/PDF/XLSX/PNG/JPG đúng 10MB, EXE và MP4 (sai loại), 0 byte, 10MB − 1 byte, 11MB PDF/DOCX (vượt) | Import từng file → đọc màn kết quả; đính kèm từng file trên chi tiết Lead → mở lại danh sách tài liệu | `200/201/400/413` | Màn kết quả đếm đúng số dòng nhập, bỏ qua, lỗi; lỗi cấp file không tạo Lead nào; file đính kèm hợp lệ mở lại được đúng nội dung; file sai không xuất hiện trong danh sách | P2 | Có |

## UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng

**Màn hình:** Hợp đồng khách hàng → Upload / Chi tiết  
**Role hợp lệ:** NVKD, DVKH  
**Mục tiêu:** Form upload chỉ cho chọn Lead hợp lệ, chi tiết HĐ hiển thị đúng nút.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| UI-CTR-001 | Thao tác form | Ô chọn Lead chỉ có Lead đủ điều kiện | NVKD A có Lead `ACTIVE`, `INACTIVE`, `CONVERTED` | Không | Mở form Upload → mở ô chọn Lead | `200` | Ô chọn trả tối đa 100 Lead, khớp `GET /api/contracts/uploadable-customers` (user chốt 2026-11-06: giảm tải, Lead khác tìm bằng ô tìm kiếm); không có Lead Ngưng hoạt động hoặc đã chuyển đổi; gõ tên Lead Đang hoạt động chưa có HĐ vào ô chọn thì tìm ra Lead đó | P1 | Có |
| UI-CTR-002 | Form validation | Thứ tự ngày sai và thiếu file scan | Form Upload | Ngày ký > Ngày hiệu lực; không chọn file | Bấm Lưu | `Không áp dụng` | Ngày ký phải ≤ ngày hiệu lực (user chốt 2026-11-06): web khoá ngày hiệu lực trước ngày ký trên lịch hoặc báo lỗi dưới ô ngày; báo lỗi ô file; không gọi API | P1 | Có |
| UI-CTR-003 | Upload/download | Chọn file scan và phụ lục | Form Upload | 1 scan PDF + 6 phụ lục | Chọn file | `Không áp dụng` | Cho chọn tối đa 5 phụ lục; báo lỗi khi thêm file thứ 6 | P2 | Có |
| UI-CTR-004 | Thông báo | Upload thành công | Form Upload dữ liệu hợp lệ | HĐ hiệu lực hôm nay | Bấm Lưu | `200/201` | Toast thành công; mở chi tiết HĐ trạng thái Đang hiệu lực | P1 | Có |
| UI-CTR-005 | Trạng thái UI | Nút theo trạng thái HĐ | HĐ `PENDING`, `ACTIVE`, `CANCELLED` | Không | DVKH mở chi tiết từng HĐ | `200` | Nút khớp `availableActions` của `GET /api/contracts/{id}` | P1 | Có |
| UI-CTR-006 | Thông báo | Hộp xác nhận khi sửa ngày làm HĐ có hiệu lực | HĐ `PENDING` | Ngày hiệu lực = hôm nay | Sửa → Lưu → xem hộp xác nhận → Đồng ý | `409` rồi `200` | Hiện hộp xác nhận kích hoạt; Đồng ý thì HĐ Đang hiệu lực, Hủy thì không đổi | P2 | Có |
| UI-CTR-007 | Hiển thị dữ liệu | Badge cảnh báo kỳ hạn | HĐ `ACTIVE` còn 5, 20, 45 ngày | Không | Mở danh sách HĐ | `200` | Cột Ngày hết hạn hiện "(Còn N ngày)" nền đỏ (≤ 7), cam (8–30); 31–60 nền vàng hoặc cam đều đạt (user chốt 2026-11-06) theo BR-CTR-08 / SRS mục 3.2.2 | P3 | Có |
| UI-CTR-008 | Điều hướng | Từ khách hàng sang hợp đồng | HĐ A của KH K | Không | Mở chi tiết KH K → bấm "Xem hợp đồng" | `Không áp dụng` | Popup "Chi tiết hợp đồng" mở ra, có đúng mã HĐ A; file scan tải về thành công (200) và hiện trong khung xem. SRS không yêu cầu tên KH trên chi tiết HĐ là link nên không kiểm chiều HĐ → KH (user chốt 2026-11-05) | P3 | Có |
| UI-CTR-009 | Form validation | Biên ngày khi upload HĐ đầu tiên | NVKD A; mỗi biến thể dùng Lead `ACTIVE` riêng chưa có HĐ | Bỏ riêng từng trường bắt buộc; ngày ký trước, bằng, sau ngày bắt đầu; ngày bắt đầu trước, bằng, sau ngày kết thúc; ngày bắt đầu hôm nay và ngày mai | Mở form Upload → nhập biến thể, giữ ngày còn lại hợp lệ → Lưu → mở chi tiết HĐ và KH | `200/201/400` | Ngày ký ≤ ngày hiệu lực ≤ ngày kết thúc (user chốt 2026-11-06): ngày ký sau ngày bắt đầu và ngày bắt đầu sau ngày kết thúc bị chặn (khoá trên lịch hoặc báo tại đúng ô), không tạo HĐ; ngày ký trước hoặc bằng ngày bắt đầu và ngày bắt đầu bằng ngày kết thúc lưu được; bắt đầu hôm nay ra Đang hiệu lực và KH Đang hoạt động; ngày mai ra Chưa hiệu lực và KH Tạm ngưng chờ hiệu lực (bổ sung cho CTR-016 đến 019) | P1 | Có |
| UI-CTR-010 | Form validation | Biên điều khoản HĐ trên form upload, sửa, tái ký | DVKH A với form Sửa và Tái ký; NVKD A với form Upload | Số HĐ 99/100/101 ký tự; số HĐ trùng trong cùng KH và trùng ở KH khác; hạn thanh toán -1, 0, 1, 364, 365, 366 và số lẻ; ghi chú ở ngưỡng của form | Nhập từng biến thể trên bộ ngày hợp lệ đã chốt → Lưu | `200/201/400/409` | Giá trị hợp lệ lưu đúng; số HĐ trùng trong cùng KH bị chặn, cùng số ở KH khác lưu được; hạn thanh toán ngoài 0–365 và số lẻ bị chặn tại đúng ô | P2 | Có |
| UI-CTR-011 | Upload/download | Phân vùng file scan và phụ lục HĐ khách hàng | NVKD A ở form Upload; DVKH A ở popup phụ lục | Bộ file thật: `G:/upload-test-files` (10MB/11MB pdf, docx, jpg, png, xlsx, zip; other-formats-1mb) và `G:/test-size-files` (20MB/21MB pdf, docx, doc). File HĐ đã ký (PDF ≤ 20MB): 0 file, DOCX, TXT, 0 byte, 21MB PDF, đúng 20MB PDF; phụ lục (PDF ≤ 5MB): PDF 10MB; phụ lục kèm 0, 5, 6 file; tên phụ lục rỗng, 254, 255, 256 | Upload hoặc mở popup thêm, sửa phụ lục → nhập biến thể → Lưu → tải lại file | `200/201/400/413` | Scan bắt buộc đúng 1 file hợp lệ; 5 phụ lục lưu được, file thứ 6 bị chặn; phụ lục hợp lệ tải về đúng nội dung; lỗi không tạo dòng phụ lục mới | P2 | Có |
| UI-CTR-012 | Form validation | Biên popup gia hạn, tái ký, hủy, dừng khai thác HĐ khách hàng | DVKH A; HĐ `ACTIVE` có và không có HĐ tái ký chờ từ ngày D = ngày hết hạn gốc + 30 (để D − 1 lớn hơn ngày hết hạn cũ); HĐ `EXPIRED`; HĐ `PENDING` | Gia hạn: ngày cũ − 1, bằng, + 1; D − 1, D, D + 1; HĐ hết hạn: hôm qua, hôm nay, ngày mai. Tái ký: ngày bắt đầu trước, bằng, sau ngày hết hạn gốc; Đồng ý và Hủy. Hủy, dừng: lý do rỗng, khoảng trắng, 499/500/501 | Mở từng popup → nhập biến thể → Xác nhận hoặc Hủy → mở lại HĐ | `200/201/400/409` | Gia hạn hợp lệ giữ mã HĐ; chạm hoặc vượt D bị chặn; tái ký hiện cảnh báo thay thế, Đồng ý thì thay đúng HĐ gốc, Hủy thì giữ nguyên; lý do sai không đổi trạng thái; tái ký đúng ngày hết hạn gốc chờ chốt (bổ sung cho CTR-123, 135, 173, 184) | P2 | Có |
| UI-CTR-013 | Hiển thị dữ liệu | Biên badge cảnh báo kỳ hạn HĐ khách hàng | DVKH A; HĐ `ACTIVE` còn 0, 7, 8, 30, 31, 60, 61 ngày theo ngày nghiệp vụ cố định | Không | Mở danh sách, chi tiết HĐ và khối Giám sát kỳ hạn | `200` | Kiểm cả HĐ test vừa tạo và toàn bộ HĐ Đang hiệu lực đã có trước đó (user chốt 2026-11-06): mỗi HĐ còn ≤ 60 ngày hiện "(Còn N ngày)" đúng số ngày, nền đỏ (≤ 7), cam (8–30), vàng hoặc cam (31–60); HĐ > 60 ngày không có badge; số đếm 3 mức tính trên toàn bộ HĐ khớp `GET /api/contracts/stats` và 3 ô Khẩn cấp / Lưu ý / Theo dõi ở màn danh sách HĐ (SRS mục 3.2.2) | P2 | Có |

## UI: Danh sách và chi tiết khách hàng

**Màn hình:** Khách hàng → Danh sách / Chi tiết  
**Role hợp lệ:** DVKH  
**Mục tiêu:** Hiển thị trạng thái KH và cho DVKH phụ trách thao tác.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| UI-CUS-001 | Bảng danh sách | Tìm và lọc khách hàng | DVKH A có 15 KH | Từ khóa mã HĐ; lọc trạng thái `SUSPENDED` | Nhập → lọc | `200` | Bảng khớp `GET /api/customers` cùng tham số | P2 | Có |
| UI-CUS-002 | Hiển thị dữ liệu | Lý do tạm ngưng hiển thị rõ | KH `SUSPENDED` lý do `PENDING_CONTRACT` | Không | Mở chi tiết KH | `200` | Trạng thái Tạm ngưng; lý do tạm ngưng (HĐ chưa hiệu lực) xem trong Lịch sử thao tác của KH (user chốt 2026-11-05) | P2 | Có |
| UI-CUS-003 | Thao tác form | Chuyển người phụ trách | DVKH A phụ trách KH K | Chọn DVKH B, nhập lý do | Bấm Chuyển → chọn → nhập lý do → xác nhận | `204` | Toast thành công; DVKH A không còn nút sửa; người phụ trách hiển thị DVKH B | P1 | Có |
| UI-CUS-004 | Phân quyền UI | DVKH không phụ trách không có nút sửa | DVKH B mở KH K | Không | Mở chi tiết KH K | `200/403/404` | Không có nút sửa, đổi hạng, chuyển người phụ trách; API trả 404 cho người không phụ trách là đúng (user chốt 2026-11-05) | P1 | Có |
| UI-CUS-005 | Form validation | Hạn mức âm | DVKH A | `-1` | Nhập hạn mức → Lưu | `Không áp dụng` | Báo lỗi tại ô; không gọi API | P3 | Có |
| UI-CUS-006 | Form validation | Biên và phân vùng khi sửa hồ sơ khách hàng | DVKH A phụ trách KH K; Lead và KH khác có MST đã biết | Tên 254/255/256; địa chỉ 499/500/501; MST 9 đến 14 chữ số, chữ xen số, MST hiện tại, MST mới hợp lệ, MST trùng Lead hoặc KH khác | Mở form Sửa KH → thay từng trường → Lưu → tải lại chi tiết KH | `200/400/409` | 10 và 13 số hợp lệ lưu được; giữ MST hiện tại được phép; MST sai hoặc trùng bị chặn, mã KH giữ nguyên; dữ liệu hợp lệ hiển thị đúng sau tải lại (bổ sung cho CUS-038 đến 045) | P1 | Có |
| UI-CUS-007 | Form validation | Biên đầu mối khách hàng | DVKH A phụ trách KH K có 1 và 2 đầu mối | Họ tên và email ở ngưỡng 99/100/101; SĐT đúng và sai pattern; trường tùy chọn bỏ trống; đổi đầu mối chính; xóa từ 2 về 1 và từ 1 về 0 | Thao tác trên popup đầu mối → Lưu hoặc xác nhận xóa | `201/200/204/400/409` | Giá trị hợp lệ lưu đúng; luôn đúng 1 đầu mối chính; xóa đầu mối cuối bị chặn và hiển thị lý do | P2 | Có |
| UI-CUS-008 | Form validation | Biên hạn mức tín dụng | DVKH A; KH mới chưa thiết lập hạn mức | -1; 0; 1; 500000000; chữ trong ô số; bỏ trống sau khi đã có hạn mức | Nhập từng giá trị → Lưu → tải lại chi tiết KH | `200/400` | -1 và chữ không lưu; 0 lưu được và hiển thị khác Chưa thiết lập; số dương hiển thị đúng định dạng sau tải lại, có lịch sử, trạng thái KH không đổi; bỏ trống theo quy tắc xóa giá trị đã chốt | P2 | Có |
| UI-CUS-009 | Thao tác form | Đổi phân hạng và chuyển người phụ trách với dữ liệu biên | DVKH A phụ trách KH K có HĐ đang hiệu lực | Đổi Thường sang Chiến lược và ngược lại; chỉ sửa trường khác; lý do chuyển rỗng, 500, 501; người nhận là người hiện tại, tài khoản khóa, DVKH hợp lệ; bấm Hủy | Mở popup Đổi hạng hoặc Chuyển người phụ trách → nhập biến thể → Xác nhận hoặc Hủy | `200/204/400` | Ô hạng chỉ có 2 giá trị; sửa trường khác không đổi hạng; chỉ dữ liệu hợp lệ mới lưu; hạng, người phụ trách KH và HĐ liên quan cập nhật đúng; Hủy giữ nguyên. Kênh lưu lý do đổi hạng chờ chốt vì API chỉ có trường hạng | P2 | Có |
| UI-CUS-010 | Hiển thị dữ liệu | HĐ hiện hành và trạng thái KH theo tổ hợp hợp đồng | DVKH A; KH có HĐ hiệu lực và HĐ chờ; KH chỉ có HĐ chờ; KH chỉ có HĐ dừng khai thác; KH chỉ có HĐ hết hạn và đã hủy, trong đó HĐ có ngày hiệu lực lớn nhất khác HĐ có ngày hết hạn lớn nhất | Không | Mở danh sách và chi tiết từng KH | `200` | HĐ hiện hành chọn theo thứ tự đã xác nhận (Đang hiệu lực, Chưa hiệu lực, HĐ đóng có ngày hiệu lực lớn nhất); trạng thái KH đúng, lý do tạm ngưng xem trong Lịch sử thao tác; KH chỉ còn HĐ đóng vẫn hiện trong danh sách | P1 | Có |

## UI: Danh sách và thêm mới nhà thầu

**Màn hình:** Nhà thầu → Danh sách / Thêm mới  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Tạo nhà thầu hợp lệ và danh sách hiển thị đúng.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| UI-VDR-001 | Hiển thị trang | Mở màn danh sách nhà thầu | QLNT đăng nhập | Không | Vào menu Nhà thầu | `200` | Có ô số liệu, tìm kiếm, bộ lọc, nút Thêm, Xuất Excel, bảng | P1 | Có |
| UI-VDR-002 | Bảng danh sách | Lọc trạng thái, hạng, loại hình dịch vụ | Nhà thầu ở 4 trạng thái | Lọc Tạo mới + 1 loại hình | Chọn bộ lọc | `200` | Bảng khớp `GET /api/contractors` cùng tham số | P2 | Có |
| UI-VDR-003 | Form validation | Bỏ trống trường bắt buộc, điểm năng lực ngoài 0–5 | Form Thêm | Trống tên, MST, loại hình, hạng; điểm 6 | Bấm Lưu | `Không áp dụng` | Lỗi dưới từng trường; không gọi API | P1 | Có |
| UI-VDR-004 | Thao tác form | Tạo nhà thầu thành công | Form Thêm | Dữ liệu hợp lệ, 1 đầu mối | Nhập → Lưu | `201` | Mở chi tiết nhà thầu mã VDR-XXXX, trạng thái Tạo mới | P1 | Có |
| UI-VDR-005 | Thông báo | MST trùng | MST `M1` đã có | MST `M1` | Lưu | `400/409` | Thông báo trùng kèm mã nhà thầu cũ; HTTP 400 hoặc 409 đều đạt (user chốt 2026-11-05: 400 là dữ liệu không hợp lệ) | P2 | Có |
| UI-VDR-006 | Upload/download | Xuất Excel danh sách | Có dữ liệu | Không | Bấm Xuất Excel | `200` | Tải file `.xlsx` đúng số dòng đang lọc | P3 | Có |
| UI-VDR-007 | Form validation | Biên và phân vùng form thêm, sửa nhà thầu | QLNT ở form Thêm và form Sửa | Bỏ riêng từng trường bắt buộc; MST 9 đến 14 chữ số, chữ xen số, trùng, MST hợp lệ có số 0 đầu; điểm năng lực rỗng, -1, 0, 1, 4, 5, 6 (nếu nhận thập phân thêm -0.01 và 5.01); tên 254/255/256; địa chỉ 499/500/501 | Nhập từng biến thể, giữ trường khác hợp lệ → Lưu → tải lại | `201/200/400/409` | 10 và 13 số hợp lệ lưu đúng chuỗi; điểm 0 và 5 lưu được, ngoài 0–5 bị chặn; mỗi trường thiếu hoặc sai có thông báo riêng; sửa MST chỉ ở trạng thái cho phép (bổ sung cho VDR-015, 017 đến 019, 059) | P1 | Có |
| UI-VDR-008 | Upload/download | Phân vùng tài liệu nhà thầu ở form tạo và màn chi tiết | QLNT; nhà thầu Tạo mới | Bộ file thật: `G:/upload-test-files` (10MB/11MB pdf, docx, jpg, png, xlsx, zip; other-formats-1mb) và `G:/test-size-files` (20MB/21MB pdf, docx, doc). PDF, DOCX, JPG, PNG, XLSX, ZIP đúng 10MB; EXE, MP4 (sai loại); đổi đuôi; 0 byte; ngay dưới 10MB; 11MB PDF/ZIP (vượt) | Đính kèm từng file → Lưu → tải lại file | `201/400/413` | File hợp lệ tải lại đúng nội dung; file không hợp lệ được chỉ rõ lý do và không tạo tài liệu (bổ sung cho VDR-105 đến 109) | P2 | Có |

## UI: Chi tiết nhà thầu

**Màn hình:** Nhà thầu → Chi tiết (các tab Thông tin, Hợp đồng, Bảng giá dịch vụ)  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Chi tiết hiển thị đúng hồ sơ, hợp đồng, nút theo trạng thái và bảng giá dịch vụ của nhà thầu.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| UI-VDRD-001 | Hiển thị dữ liệu | Thông tin chung khớp API | Nhà thầu H Đang hoạt động | Không | Mở chi tiết H → so với `GET /api/contractors/{id}` | `200` | Mã, tên, MST, hạng, loại hình, đầu mối, tài liệu, HĐ hiển thị đúng | P1 | Có |
| UI-VDRD-002 | Trạng thái UI | Nhà thầu Dừng hợp tác bị khóa thao tác | Nhà thầu D Dừng hợp tác | Không | Mở chi tiết D | `200` | Không có nút Sửa, Thêm đầu mối, Đổi hạng, Thêm HĐ; chỉ có Kích hoạt lại | P1 | Có |
| UI-VDRD-003 | Trạng thái UI | Nút Xóa chỉ hiện khi Tạo mới chưa có HĐ | Nhà thầu N (Tạo mới), nhà thầu H | Không | Mở danh sách nhà thầu, tìm N và H | `200` | Dòng N trên danh sách có nút Xoá; dòng H không có (user chốt 2026-11-05: nút Xoá nằm ở màn danh sách) | P2 | Có |
| UI-VDRD-004 | Điều hướng | Chuyển giữa các tab | Nhà thầu H | Không | Bấm lần lượt tab Thông tin, Hợp đồng, Bảng giá dịch vụ, Lịch sử | `Không áp dụng` | Mỗi tab tải đúng nội dung, URL giữ id nhà thầu. Không kiểm F5 giữ tab vì SRS không yêu cầu (user chốt 2026-11-05) | P3 | Có |
| UI-VDRD-005 | Hiển thị dữ liệu | Tạo bảng giá mua cho nhà thầu vừa tạo rồi kiểm tra tab Bảng giá dịch vụ | QLNT; nhà thầu vừa tạo qua `POST /api/contractors` và có HĐ Đang hiệu lực qua `POST /api/contractor-contracts` (FLOW-VDR-001); có ít nhất 1 đầu mục giá Cố định đang hoạt động trong Cấu hình đầu mục giá | Bảng giá: tên `BG-autotest-` + `testRunId`, nhà thầu vừa tạo, Ngày hiệu lực = hôm nay, Ngày hết hạn = trước ngày hết hạn HĐ, tiền tệ VND, 1 dòng giá đơn giá 1.000.000 | Vào Giá mua đầu vào → Thêm mới → chọn nhà thầu vừa tạo (ô chọn phải có nhà thầu) → nhập thông tin và 1 dòng giá → Lưu (API tạo bảng giá mua POST /api/purchase-prices) → mở chi tiết nhà thầu đó qua `GET /api/contractors/{id}` → tab Bảng giá dịch vụ | `201` khi lưu bảng giá; `200` khi mở chi tiết | Tab Bảng giá dịch vụ hiện bảng giá mua vừa tạo theo SRS (khối Bảng giá mua đầu vào: bảng giá mua gắn nhà thầu kèm trạng thái hiệu lực, BR-CTV-20): có mã bảng giá vừa sinh và trạng thái; không lẫn bảng giá của nhà thầu khác. Tên, ngày hiệu lực, ngày hết hạn, mã HĐ không bắt buộc vì SRS không nêu cột | P1 | Có |
| UI-VDRD-006 | Form validation | Biên đầu mối nhà thầu | QLNT; nhà thầu Đang hoạt động có 1 và 2 đầu mối | Tên, SĐT, email, ghi chú ở lớp hợp lệ, rỗng, sai và biên hiển thị; đổi đầu mối chính; xóa khi còn 2 và khi còn 1; bấm Hủy ở xác nhận | Mở popup đầu mối → nhập biến thể → Lưu hoặc xác nhận xóa | `201/200/204/400/409` | Giá trị hợp lệ lưu đúng; chỉ 1 đầu mối chính; xóa đầu mối cuối bị chặn; Hủy không đổi dữ liệu | P2 | Có |
| UI-VDRD-007 | Thao tác form | Biên popup đổi hạng, dừng hợp tác, kích hoạt lại | QLNT; nhà thầu Đang hoạt động, Ngưng hoạt động, Dừng hợp tác | Hạng cũ, hạng mới, chưa chọn (luôn kèm lý do hợp lệ); lý do rỗng, khoảng trắng, 499/500/501; Hủy và Xác nhận | Mở từng popup → nhập biến thể → Xác nhận hoặc Hủy → tải lại chi tiết và tab Hợp đồng | `200/400/409` | Chỉ dữ liệu hợp lệ ở trạng thái cho phép được lưu; sau thành công hạng hoặc trạng thái, HĐ bị tác động và lịch sử đúng; Hủy hoặc dữ liệu sai giữ nguyên (bổ sung cho VDR-145, 146, 160, 161, 171, 174) | P1 | Có |
| UI-VDRD-008 | Trạng thái UI | Nút Xóa nhà thầu theo lịch sử hợp đồng | QLNT; 3 nhà thầu Tạo mới: chưa có HĐ; có HĐ Chưa hiệu lực; có HĐ Đã hủy | Không | Ở danh sách nhà thầu, tìm từng nhà thầu → ở nhà thầu được xóa bấm Xoá → Hủy, rồi trên bản ghi riêng bấm Xoá → Xác nhận | `204/404` | Chỉ dòng nhà thầu chưa từng có HĐ có nút Xoá; Hủy giữ nguyên; Xác nhận xong nhà thầu biến mất khỏi danh sách và mở lại không còn bản ghi (bổ sung cho VDR-065 đến 067) | P2 | Có |

## UI: Thêm và chi tiết hợp đồng nhà thầu

**Màn hình:** Hợp đồng nhà thầu → Thêm mới / Tái ký / Chi tiết  
**Role hợp lệ:** QLNT  
**Mục tiêu:** Form thêm, tái ký validate đúng và chi tiết hiện đúng nút.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| UI-CTV-001 | Thao tác form | Ô chọn nhà thầu theo chế độ | Có nhà thầu Tạo mới và nhà thầu Đang hoạt động | Chế độ Thêm mới rồi Tái ký | Mở form → đổi chế độ → mở ô chọn nhà thầu | `200` | Danh sách khớp `GET /api/contractor-contracts/contractor-options` với `mode=NEW` và `mode=RESIGN` | P1 | Có |
| UI-CTV-002 | Form validation | Ngày ngược, thiếu file, chu kỳ gia hạn lạ | Form Thêm | Ngày hiệu lực > Ngày hết hạn; không file; bật gia hạn không chọn chu kỳ | Bấm Lưu | `Không áp dụng` | Bấm Thêm: báo bổ sung các trường thiếu (lỗi dưới ô ngày hoặc thông báo yêu cầu bổ sung, không bắt buộc lỗi riêng dưới ô file, user chốt 2026-11-05); chu kỳ chỉ có 3, 6, 12, 24 tháng; không gọi API | P1 | Có |
| UI-CTV-003 | Upload/download | Tải và xem phụ lục | HĐ V có phụ lục PDF và DOCX 20MB có nội dung (`G:/test-size-files`) | Không | Bấm xem PDF → bấm xem DOCX → bấm tải | `200` | PDF mở trong trình xem; DOCX báo cần tải xuống; tải về đúng file | P2 | Có |
| UI-CTV-004 | Thông báo | Xác nhận thay thế HĐ khi tái ký | HĐ V Đang hiệu lực | Tái ký hiệu lực hôm nay | Lưu → xem hộp xác nhận → Đồng ý | `409` rồi `200/201` | Hộp xác nhận nêu HĐ V sẽ Dừng khai thác; sau Đồng ý toast thành công | P1 | Có |
| UI-CTV-005 | Trạng thái UI | Nút theo trạng thái HĐ | HĐ Chưa hiệu lực, Đang hiệu lực, Đã hủy | Không | Mở chi tiết từng HĐ | `200` | Nút khớp `availableActions` của `GET /api/contractor-contracts/{id}` | P1 | Có |
| UI-CTV-006 | Form validation | Biên và phân vùng form thêm HĐ nhà thầu | QLNT; mỗi lần tạo hợp lệ dùng nhà thầu Tạo mới riêng | Bộ file thật: `G:/upload-test-files` (10MB/11MB pdf, docx, jpg, png, xlsx, zip; other-formats-1mb) và `G:/test-size-files` (20MB/21MB pdf, docx, doc). Bỏ riêng từng trường bắt buộc; tên 254/255/256; số HĐ 99/100/101; ngày bắt đầu trước, bằng, sau ngày kết thúc; bắt đầu hôm nay và ngày mai; file scan EXE, DOC (sai loại), 0 byte, 21MB PDF/DOCX (vượt), đúng 20MB PDF/DOCX (hợp lệ); phụ lục 0, 5, 6 ở form tạo và tái ký | Nhập từng biến thể → Lưu → mở chi tiết HĐ và nhà thầu | `200/201/400/413` | Dữ liệu hợp lệ lưu đúng; hôm nay ra Đang hiệu lực và nhà thầu Đang hoạt động, ngày mai ra Chưa hiệu lực; lỗi báo tại đúng trường; file hoặc phụ lục sai không tạo dữ liệu (bổ sung cho CTV-015 đến 024, 058, 176) | P1 | Có |
| UI-CTV-007 | Upload/download | Biên popup thêm, sửa, xóa phụ lục HĐ nhà thầu | QLNT; HĐ V Đang hiệu lực | Bộ file thật: `G:/upload-test-files` (10MB/11MB pdf, docx, jpg, png, xlsx, zip; other-formats-1mb) và `G:/test-size-files` (20MB/21MB pdf, docx, doc). Tên rỗng, 254, 255, 256; mô tả ở giới hạn UI; EXE, DOC (không hỗ trợ); 21MB PDF (vượt 20MB); xóa với Hủy và Xác nhận | Mở popup → nhập biến thể → Lưu hoặc xác nhận xóa → tải lại phụ lục | `200/201/204/400/413` | Tên và mô tả hợp lệ lưu đúng; file tải về đúng nội dung; xóa đúng bản ghi; giá trị sai hoặc Hủy giữ nguyên dữ liệu | P2 | Có |
| UI-CTV-008 | Thao tác form | Cấu hình tự động gia hạn theo từng chu kỳ và trạng thái | QLNT; HĐ Chưa hiệu lực, Đang hiệu lực, HĐ Đã hủy và HĐ của nhà thầu Dừng hợp tác | Tắt; bật chưa chọn chu kỳ; bật lần lượt 3, 6, 12, 24 tháng | Bấm "Bật gia hạn tự động" (hoặc "Chỉnh sửa" ở khối Tự động gia hạn khi đã bật) → popup Chỉnh sửa hợp đồng → chọn Thủ công / Tự động, chọn chu kỳ → Lưu thay đổi → mở lại từng HĐ | `200/400` | Ô chu kỳ chỉ có 4 giá trị hợp lệ; bật mà thiếu chu kỳ bị chặn; mỗi chu kỳ đọc lại đúng; HĐ ở trạng thái cấm ẩn hoặc khóa thao tác | P2 | Có |
| UI-CTV-009 | Form validation | Biên popup gia hạn, tái ký, hủy, dừng khai thác HĐ nhà thầu | QLNT; HĐ Đang hiệu lực có và không có HĐ nối tiếp từ ngày D = ngày hết hạn gốc + 30; HĐ Chưa hiệu lực | Gia hạn: ngày cũ, ngày cũ + 1, D − 1, D, D + 1. Tái ký: trước, bằng, sau ngày hết hạn gốc; Đồng ý và Hủy. Hủy, dừng: lý do rỗng, khoảng trắng, 499/500/501 | Mở từng popup → nhập biến thể → Xác nhận hoặc Hủy → mở lại HĐ và nhà thầu | `200/201/400/409` | Gia hạn chỉ thay ngày ở nhánh hợp lệ và giữ mã; tái ký hiện đúng cảnh báo, trạng thái HĐ cũ và mới đúng; Hủy xác nhận hoặc dữ liệu sai giữ nguyên HĐ và nhà thầu; tái ký đúng ngày hết hạn gốc chờ chốt | P2 | Có |
| UI-CTV-010 | Hiển thị dữ liệu | Biên badge cảnh báo kỳ hạn HĐ nhà thầu | QLNT; HĐ Đang hiệu lực còn 0, 7, 8, 30, 31, 60, 61 ngày | Không | Mở danh sách, chi tiết HĐ và ô thống kê | `200` | Cột Ngày hết hạn hiện "(Còn N ngày)" nền đỏ (≤ 7), cam (8–30); 31–60 nền vàng hoặc cam đều đạt (user chốt 2026-11-06); 61 ngày không có badge; ô thống kê đúng số liệu (dùng cùng bộ dữ liệu với CTV-039) | P2 | Có |

## UI: Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module

**Màn hình:** Danh sách và chi tiết Lead, Khách hàng, Hợp đồng khách hàng, Nhà thầu, Hợp đồng nhà thầu  
**Role hợp lệ:** NVKD, DVKH, QLNT theo module  
**Mục tiêu:** Biên phân trang, bộ lọc, xuất file và quyền thao tác giống nhau trên mọi màn.

| ID | Nhóm test | Test case | Tiền điều kiện | Test data / Request | Bước thực hiện | Kết quả HTTP mong đợi | Kiểm tra nghiệp vụ/dữ liệu | Ưu tiên | Auto |
|---|---|---|---|---|---|---|---|---|---|
| UI-COM-001 | Bảng danh sách | Biên phân trang danh sách và lịch sử | Mỗi màn có tập bản ghi seed biết trước ID | 0 bản ghi; 1 bản ghi; P − 1, P, P + 1 bản ghi với P là kích thước trang; các mức số dòng mà UI cung cấp (ví dụ 10, 20, 50, 100) | Mở danh sách hoặc tab lịch sử → đổi số dòng mỗi trang → chuyển tới trang cuối → reset bộ lọc | `200` | Đúng tập ID theo seed, đúng số dòng và trang cuối; 0 bản ghi hiện trạng thái rỗng; reset đưa về trang hợp lệ. Kỳ vọng lấy từ dữ liệu seed, không chỉ so với kết quả cùng API | P2 | Có |
| UI-COM-002 | Bảng danh sách | Biên bộ lọc ngày và từ khóa | Bản ghi seed tạo đúng ngày biên | Từ = đến; ngày ngay trước, tại, ngay sau biên; từ > đến nếu nhập được; từ khóa rỗng, khớp một phần, không khớp, ở giới hạn độ dài nếu màn công bố | Nhập từng bộ lọc → Tìm → Reset | `200/400` | Bản ghi tại biên được tính đúng theo đặc tả; khoảng ngày sai bị chặn hoặc không chọn được; Reset hiện lại đúng bản ghi trong phạm vi người dùng | P2 | Có |
| UI-COM-003 | Upload/download | Xuất Excel theo kết quả lọc | Mỗi màn có nút Xuất Excel và dữ liệu seed | Kết quả rỗng; vừa 1 trang; nhiều trang sau khi lọc | Lọc → Xuất Excel → mở file → so với tập ID seed | `200/400` | File mở được, đúng cột, gồm toàn bộ bản ghi được phép theo bộ lọc chứ không chỉ trang đang xem; kết quả rỗng báo phù hợp, không tải file nhầm dữ liệu. Giới hạn số dòng lớn chỉ chạy ở môi trường có dữ liệu phù hợp | P2 | Có |
| UI-COM-004 | Phân quyền UI | Nút và ô nhập theo quyền và trạng thái | Bản ghi ở trạng thái cho phép và không cho phép; người phụ trách; người chỉ xem; người không có quyền | Không | Đăng nhập từng tài khoản → mở chi tiết từng bản ghi | `200/403` | Nút và ô nhập đúng ma trận quyền và trạng thái của SRS; thao tác được phép lưu đúng; request bỏ qua UI được kiểm riêng ở các case API Ownership/IDOR và Authorization | P1 | Có |

## Không áp dụng

| Đối tượng | Nhóm | Lý do |
|---|---|---|
| Toàn hệ thống | Integration | SRS của 5 module không mô tả tích hợp với hệ thống ngoài; notification nội bộ đã kiểm trong các case Business rule |
| `GET /api/leads/stats`, `GET /api/leads/assignable-owners`, `GET /api/leads/import-template`, `GET /api/contracts/assignable-managers`, `GET /api/contracts/stats`, `GET /api/customers/assignable-managers`, `GET /api/contractors/stats`, `GET /api/contractor-contracts/stats` | Request validation | Swagger không khai báo query, path hay body nào, không có dữ liệu vào để kiểm định dạng |
| `GET /api/leads/stats`, `GET /api/leads/assignable-owners`, `GET /api/leads/import-template`, `GET /api/contracts/assignable-managers`, `GET /api/customers/assignable-managers`, `GET /api/contractors/stats` | Boundary | Không có tham số đầu vào; các mốc biên của số liệu `GET /api/contracts/stats` và `GET /api/contractor-contracts/stats` đã có case riêng |
| `GET /api/leads/stats`, `GET /api/leads/assignable-owners`, `GET /api/leads/import-template`, `GET /api/contracts/assignable-managers`, `GET /api/contracts/stats`, `GET /api/customers/assignable-managers`, `GET /api/contractors/stats`, `GET /api/contractor-contracts/stats` | Pagination/filter/sort | Trả một đối tượng số liệu, một file, hoặc danh sách đầy đủ; Swagger không có tham số phân trang, lọc, sắp xếp |
| `GET /api/leads/{id}`, `GET /api/contracts/{id}`, `GET /api/customers/{id}`, `GET /api/contractors/{id}`, `GET /api/contractor-contracts/{id}` | Boundary | Chỉ có path id, không có giá trị biên; id sai định dạng đã ở Request validation, id không tồn tại ở Error handling |
| `GET /api/leads/{id}/documents/{documentId}`, `GET /api/customers/{id}/documents/{documentId}`, `GET /api/contractors/{id}/documents/{documentId}`, `GET /api/contracts/{id}/file`, `GET /api/contracts/{id}/annexes/{annexId}/file`, `GET /api/contracts/{id}/extensions/{sequence}/file`, `GET /api/contractor-contracts/{id}/file`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/file`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | Boundary | Chỉ có path id của file; dung lượng biên của file đã kiểm ở API upload tương ứng |
| `GET /api/contracts/{id}/file`, `GET /api/contracts/{id}/annexes/{annexId}/file`, `GET /api/contracts/{id}/extensions/{sequence}/file`, `GET /api/contractor-contracts/{id}/file`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/file`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | Pagination/filter/sort | Trả 1 file, không phải danh sách |
| `DELETE /api/leads/{id}/documents/{documentId}`, `DELETE /api/contracts/{id}/annexes/{annexId}`, `DELETE /api/contractors/{id}`, `DELETE /api/contractors/{id}/documents/{documentId}`, `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` | Boundary | Không có body, chỉ có path id; biên số lượng (xóa đầu mối cuối) chỉ áp dụng cho API xóa đầu mối và đã có case |
| `POST /api/leads/{id}/contacts/{contactId}/primary`, `POST /api/customers/{id}/contacts/{contactId}/primary`, `POST /api/leads/{id}/reactivate` | Boundary | Không có body, chỉ có path id; không có giá trị biên |
| `GET /api/contracts/uploadable-customers` | File API | Đường dẫn có chữ `upload` nhưng API chỉ trả danh sách Lead, không nhận hay trả file |
| `GET /api/contractors/export` | Boundary | Giới hạn 50.000 dòng của SRS cần seed 50.001 nhà thầu, không phù hợp chạy tự động thường xuyên; chỉ kiểm khoảng ngày biên |

## Ma trận độ phủ

Script tự tính từ các dòng case, không sửa bằng tay.

### Theo nhóm API

| Nhóm test | Số case | Độ phủ |
|---|---:|---|
| Happy path | 88 | 88 API |
| Request validation | 91 | 80 API |
| Boundary | 67 | 60 API |
| Response contract | 88 | 88 API |
| Authentication | 93 | 88 API |
| Authorization | 8 | 8 API |
| Ownership/IDOR | 65 | 64 API |
| CRUD | 5 | 5 API |
| Business rule | 153 | 75 API |
| State transition | 23 | 22 API |
| Idempotency | 29 | 29 API |
| Concurrency | 6 | 6 API |
| Pagination/filter/sort | 26 | 16 API |
| Error handling | 88 | 88 API |
| Integration | 0 | Không áp dụng |
| File API | 28 | 25 API |
| Data integrity | 55 | 50 API |
| Input security | 10 | 10 API |
| Flow/end-to-end API | 20 | 48 API |

### Theo API

| API | Số case | Nhóm đã phủ | Không áp dụng | Thiếu |
|---|---:|---|---|---|
| `POST /api/contractor-contracts` | 19 | Happy path, State transition, Request validation, Boundary, Business rule, Data integrity, Idempotency, Concurrency, File API, Authorization, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/contractor-contracts` | 12 | Happy path, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Authorization, Input security, Error handling | - | - |
| `GET /api/contractor-contracts/contractor-options` | 12 | Happy path, Business rule, Request validation, Pagination/filter/sort, Boundary, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/contractor-contracts/stats` | 6 | Happy path, Boundary, Business rule, Response contract, Authentication, Error handling | Request validation, Pagination/filter/sort | - |
| `GET /api/contractor-contracts/{}` | 10 | Happy path, Business rule, Ownership/IDOR, Request validation, Response contract, Authentication, Error handling, Flow/end-to-end API | Boundary | - |
| `PUT /api/contractor-contracts/{}` | 13 | Happy path, Business rule, State transition, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/contractor-contracts/{}/annexes` | 13 | Happy path, File API, Boundary, Request validation, Business rule, Ownership/IDOR, Data integrity, Idempotency, Response contract, Authentication, Error handling, CRUD, Flow/end-to-end API | - | - |
| `PUT /api/contractor-contracts/{}/annexes/{}` | 11 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling | - | - |
| `DELETE /api/contractor-contracts/{}/annexes/{}` | 8 | Happy path, Business rule, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling | Boundary | - |
| `GET /api/contractor-contracts/{}/annexes/{}/file` | 8 | Happy path, File API, Ownership/IDOR, Response contract, Request validation, Authentication, Error handling, Business rule | Boundary, Pagination/filter/sort | - |
| `GET /api/contractor-contracts/{}/annexes/{}/view` | 8 | Happy path, File API, Business rule, Ownership/IDOR, Response contract, Request validation, Authentication, Error handling | Boundary, Pagination/filter/sort | - |
| `PUT /api/contractor-contracts/{}/auto-renewal` | 18 | Happy path, Business rule, Boundary, Request validation, State transition, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Idempotency, Flow/end-to-end API | - | - |
| `POST /api/contractor-contracts/{}/cancel` | 12 | Happy path, State transition, Business rule, Request validation, Boundary, Ownership/IDOR, Idempotency, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/contractor-contracts/{}/extensions` | 16 | Happy path, State transition, Business rule, Boundary, Request validation, File API, Ownership/IDOR, Idempotency, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/contractor-contracts/{}/file` | 9 | Happy path, File API, Ownership/IDOR, Response contract, Request validation, Authentication, Error handling, Business rule, Flow/end-to-end API | Boundary, Pagination/filter/sort | - |
| `GET /api/contractor-contracts/{}/history` | 8 | Happy path, Pagination/filter/sort, Boundary, Request validation, Ownership/IDOR, Response contract, Authentication, Error handling | - | - |
| `POST /api/contractor-contracts/{}/resign` | 16 | Happy path, Business rule, State transition, Request validation, Boundary, Ownership/IDOR, Idempotency, Data integrity, File API, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/contractor-contracts/{}/suspend` | 14 | Happy path, Business rule, State transition, Request validation, Boundary, Ownership/IDOR, Idempotency, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/contractors` | 22 | Happy path, State transition, Request validation, Boundary, Business rule, Data integrity, Idempotency, Concurrency, Input security, Authorization, Response contract, Authentication, Error handling, CRUD, Flow/end-to-end API | - | - |
| `GET /api/contractors` | 12 | Happy path, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Authorization, Input security, Error handling | - | - |
| `GET /api/contractors/export` | 9 | Happy path, File API, Business rule, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Error handling | - | - |
| `GET /api/contractors/stats` | 6 | Happy path, Business rule, Response contract, Authentication, Error handling | Request validation, Boundary, Pagination/filter/sort | - |
| `PUT /api/contractors/{}` | 13 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `DELETE /api/contractors/{}` | 12 | Happy path, Business rule, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling, Flow/end-to-end API | Boundary | - |
| `GET /api/contractors/{}` | 12 | Happy path, Business rule, Ownership/IDOR, Request validation, Response contract, Authentication, Error handling, Flow/end-to-end API | Boundary | - |
| `POST /api/contractors/{}/contacts` | 12 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Idempotency, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `PUT /api/contractors/{}/contacts/{}` | 10 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling | - | - |
| `DELETE /api/contractors/{}/contacts/{}` | 9 | Happy path, Business rule, Boundary, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling | - | - |
| `POST /api/contractors/{}/documents` | 14 | Happy path, File API, Boundary, Request validation, Business rule, Ownership/IDOR, Data integrity, Idempotency, Input security, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/contractors/{}/documents/{}` | 7 | Happy path, File API, Ownership/IDOR, Response contract, Request validation, Authentication, Error handling | Boundary | - |
| `DELETE /api/contractors/{}/documents/{}` | 8 | Happy path, Business rule, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling | Boundary | - |
| `GET /api/contractors/{}/history` | 9 | Happy path, Pagination/filter/sort, Boundary, Request validation, Ownership/IDOR, Response contract, Authentication, Error handling, Business rule | - | - |
| `POST /api/contractors/{}/reactivate` | 15 | Happy path, State transition, Business rule, Request validation, Boundary, Ownership/IDOR, Idempotency, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/contractors/{}/terminate` | 17 | Happy path, Business rule, State transition, Request validation, Boundary, Ownership/IDOR, Idempotency, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `PUT /api/contractors/{}/tier` | 11 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/contracts` | 25 | Happy path, State transition, Request validation, Boundary, Business rule, Data integrity, Idempotency, Concurrency, File API, Authorization, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/contracts` | 13 | Happy path, Business rule, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Input security, Error handling | - | - |
| `GET /api/contracts/assignable-managers` | 6 | Happy path, Business rule, Response contract, Authentication, Error handling, Flow/end-to-end API | Request validation, Boundary, Pagination/filter/sort | - |
| `GET /api/contracts/export` | 10 | Happy path, File API, Business rule, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Error handling | - | - |
| `GET /api/contracts/stats` | 6 | Happy path, Boundary, Business rule, Response contract, Authentication, Error handling | Request validation, Pagination/filter/sort | - |
| `GET /api/contracts/uploadable-customers` | 10 | Happy path, Business rule, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Error handling, Flow/end-to-end API | File API | - |
| `PUT /api/contracts/{}` | 14 | Happy path, Business rule, State transition, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/contracts/{}` | 12 | Happy path, Business rule, Ownership/IDOR, Request validation, Response contract, Authentication, Error handling, Flow/end-to-end API | Boundary | - |
| `POST /api/contracts/{}/annexes` | 13 | Happy path, Request validation, Boundary, File API, Business rule, Ownership/IDOR, Data integrity, Idempotency, Response contract, Authentication, Error handling, CRUD, Flow/end-to-end API | - | - |
| `PUT /api/contracts/{}/annexes/{}` | 12 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `DELETE /api/contracts/{}/annexes/{}` | 9 | Happy path, Business rule, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling, Flow/end-to-end API | Boundary | - |
| `GET /api/contracts/{}/annexes/{}/file` | 7 | Happy path, File API, Ownership/IDOR, Response contract, Request validation, Authentication, Error handling | Boundary, Pagination/filter/sort | - |
| `POST /api/contracts/{}/cancel` | 13 | Happy path, State transition, Business rule, Request validation, Boundary, Ownership/IDOR, Idempotency, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/contracts/{}/extensions` | 16 | Happy path, State transition, Business rule, Boundary, Request validation, File API, Ownership/IDOR, Idempotency, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/contracts/{}/extensions/{}/file` | 7 | Happy path, File API, Ownership/IDOR, Response contract, Request validation, Authentication, Error handling | Boundary, Pagination/filter/sort | - |
| `GET /api/contracts/{}/file` | 7 | Happy path, File API, Ownership/IDOR, Response contract, Request validation, Authentication, Error handling | Boundary, Pagination/filter/sort | - |
| `GET /api/contracts/{}/history` | 8 | Happy path, Pagination/filter/sort, Boundary, Request validation, Ownership/IDOR, Response contract, Authentication, Error handling | - | - |
| `POST /api/contracts/{}/resign` | 18 | Happy path, State transition, Business rule, Request validation, Boundary, Ownership/IDOR, Idempotency, Data integrity, File API, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/contracts/{}/suspend` | 12 | Happy path, State transition, Request validation, Boundary, Business rule, Ownership/IDOR, Idempotency, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/customers` | 13 | Happy path, Business rule, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Authorization, Input security, Error handling | - | - |
| `GET /api/customers/assignable-managers` | 6 | Happy path, Business rule, Response contract, Authentication, Error handling, Flow/end-to-end API | Request validation, Boundary, Pagination/filter/sort | - |
| `GET /api/customers/export` | 9 | Happy path, File API, Business rule, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Error handling | - | - |
| `GET /api/customers/{}` | 16 | Happy path, Business rule, Ownership/IDOR, Request validation, Response contract, Authentication, Error handling, Flow/end-to-end API | Boundary | - |
| `PUT /api/customers/{}` | 12 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/customers/{}/contacts` | 11 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Idempotency, Response contract, Authentication, Error handling, CRUD | - | - |
| `PUT /api/customers/{}/contacts/{}` | 10 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling | - | - |
| `DELETE /api/customers/{}/contacts/{}` | 10 | Happy path, Business rule, Boundary, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling | - | - |
| `POST /api/customers/{}/contacts/{}/primary` | 9 | Happy path, Business rule, Idempotency, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling | Boundary | - |
| `PUT /api/customers/{}/credit-limit` | 10 | Happy path, Boundary, Request validation, Business rule, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/customers/{}/documents/{}` | 7 | Happy path, File API, Ownership/IDOR, Response contract, Request validation, Authentication, Error handling | Boundary | - |
| `GET /api/customers/{}/history` | 8 | Happy path, Pagination/filter/sort, Boundary, Request validation, Ownership/IDOR, Response contract, Authentication, Error handling | - | - |
| `PUT /api/customers/{}/tier` | 10 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/customers/{}/transfer-account-manager` | 16 | Happy path, Business rule, Request validation, Boundary, Ownership/IDOR, Data integrity, Idempotency, Concurrency, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/leads` | 30 | Happy path, State transition, Request validation, Boundary, Business rule, Data integrity, Idempotency, Concurrency, Input security, Response contract, Authentication, Authorization, Error handling, Flow/end-to-end API | - | - |
| `GET /api/leads` | 14 | Happy path, Business rule, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Input security, Authorization, Error handling, Flow/end-to-end API | - | - |
| `GET /api/leads/assignable-owners` | 6 | Happy path, Business rule, Response contract, Authentication, Error handling, Flow/end-to-end API | Request validation, Boundary, Pagination/filter/sort | - |
| `GET /api/leads/export` | 10 | Happy path, File API, Business rule, Pagination/filter/sort, Boundary, Request validation, Response contract, Authentication, Error handling | - | - |
| `POST /api/leads/import` | 15 | Happy path, State transition, Business rule, File API, Boundary, Request validation, Data integrity, Idempotency, Input security, Error handling, Response contract, Authentication, Flow/end-to-end API | - | - |
| `GET /api/leads/import-template` | 6 | Happy path, File API, Response contract, Authentication, Error handling | Request validation, Boundary, Pagination/filter/sort | - |
| `GET /api/leads/stats` | 6 | Happy path, Business rule, Response contract, Authentication, Error handling | Request validation, Boundary, Pagination/filter/sort | - |
| `PUT /api/leads/{}` | 18 | Happy path, State transition, Request validation, Boundary, Business rule, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/leads/{}` | 8 | Happy path, Business rule, Ownership/IDOR, Request validation, Response contract, Authentication, Error handling | Boundary | - |
| `POST /api/leads/{}/contacts` | 13 | Happy path, Request validation, Boundary, Business rule, Ownership/IDOR, Data integrity, Idempotency, Response contract, Authentication, Error handling, CRUD, Flow/end-to-end API | - | - |
| `PUT /api/leads/{}/contacts/{}` | 11 | Happy path, Request validation, Boundary, Business rule, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling | - | - |
| `DELETE /api/leads/{}/contacts/{}` | 10 | Happy path, Business rule, Boundary, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling | - | - |
| `POST /api/leads/{}/contacts/{}/primary` | 9 | Happy path, Business rule, Idempotency, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling | Boundary | - |
| `POST /api/leads/{}/deactivate` | 12 | Happy path, State transition, Request validation, Boundary, Business rule, Idempotency, Ownership/IDOR, Data integrity, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `POST /api/leads/{}/documents` | 14 | Happy path, File API, Boundary, Request validation, Business rule, Ownership/IDOR, Data integrity, Idempotency, Input security, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |
| `GET /api/leads/{}/documents/{}` | 7 | Happy path, File API, Ownership/IDOR, Response contract, Request validation, Authentication, Error handling | Boundary | - |
| `DELETE /api/leads/{}/documents/{}` | 8 | Happy path, Business rule, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling | Boundary | - |
| `GET /api/leads/{}/history` | 8 | Happy path, Pagination/filter/sort, Boundary, Request validation, Ownership/IDOR, Response contract, Authentication, Error handling | - | - |
| `POST /api/leads/{}/reactivate` | 11 | Happy path, State transition, Business rule, Idempotency, Ownership/IDOR, Data integrity, Request validation, Response contract, Authentication, Error handling, Flow/end-to-end API | Boundary | - |
| `POST /api/leads/{}/transfer-owner` | 15 | Happy path, State transition, Request validation, Boundary, Business rule, Ownership/IDOR, Data integrity, Idempotency, Concurrency, Response contract, Authentication, Error handling, Flow/end-to-end API | - | - |

### Theo nhóm UI

| Nhóm UI test | Số case | Màn hình |
|---|---:|---|
| Hiển thị trang | 2 | UI: Danh sách Lead, UI: Danh sách và thêm mới nhà thầu |
| Điều hướng | 2 | UI: Chi tiết nhà thầu, UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng |
| Form validation | 21 | UI: Chi tiết nhà thầu, UI: Danh sách và chi tiết khách hàng, UI: Danh sách và thêm mới nhà thầu, UI: Thêm mới và chi tiết Lead, UI: Thêm và chi tiết hợp đồng nhà thầu, UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng |
| Thao tác form | 11 | UI: Chi tiết nhà thầu, UI: Danh sách và chi tiết khách hàng, UI: Danh sách và thêm mới nhà thầu, UI: Thêm mới và chi tiết Lead, UI: Thêm và chi tiết hợp đồng nhà thầu, UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng |
| Hiển thị dữ liệu | 8 | UI: Chi tiết nhà thầu, UI: Danh sách Lead, UI: Danh sách và chi tiết khách hàng, UI: Thêm và chi tiết hợp đồng nhà thầu, UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng |
| Trạng thái UI | 6 | UI: Chi tiết nhà thầu, UI: Thêm mới và chi tiết Lead, UI: Thêm và chi tiết hợp đồng nhà thầu, UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng |
| Phân quyền UI | 3 | UI: Danh sách Lead, UI: Danh sách và chi tiết khách hàng, UI: Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module |
| Thông báo | 5 | UI: Danh sách và thêm mới nhà thầu, UI: Thêm mới và chi tiết Lead, UI: Thêm và chi tiết hợp đồng nhà thầu, UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng |
| Bảng danh sách | 5 | UI: Danh sách Lead, UI: Danh sách và chi tiết khách hàng, UI: Danh sách và thêm mới nhà thầu, UI: Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module |
| Upload/download | 10 | UI: Danh sách Lead, UI: Danh sách và thêm mới nhà thầu, UI: Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module, UI: Thêm mới và chi tiết Lead, UI: Thêm và chi tiết hợp đồng nhà thầu, UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng |
| Responsive | 1 | UI: Danh sách Lead |
| Accessibility | 1 | UI: Danh sách Lead |
| Visual regression | 1 | UI: Danh sách Lead |
| Error handling | 1 | UI: Thêm mới và chi tiết Lead |
| Session | 1 | UI: Danh sách Lead |

## Dữ liệu cần chuẩn bị

| Dữ liệu | Yêu cầu |
|---|---|
| Tenant và tài khoản | `tenantCode` của môi trường dev. Tài khoản đang hoạt động: NVKD A, NVKD B, NVKD C, DVKH A, DVKH B, DVKH C, QLNT; thêm 1 NVKD bị khóa và 1 DVKH bị khóa. `tunglead@gmail.com`, `tungkh@gmail.com` chỉ dùng sau khi `GET /api/auth/me` xác nhận đúng role |
| Token | Lấy mới bằng `POST /api/auth/login` trước mỗi lần chạy, đặt tên `tokenNVKD`, `tokenNVKD_B`, `tokenDVKH`, `tokenDVKH_B`, `tokenQLNT`; refresh token và token hết hạn dùng cho case Authentication; không lưu token thật trong source code |
| Lead | Lead A `ACTIVE` của NVKD A (ít nhất 3 đầu mối, 1 tài liệu); Lead I `INACTIVE`; Lead `CONVERTED`; Lead L `ACTIVE` chưa có HĐ (tạo mới mỗi case upload HĐ); Lead của NVKD B. MST sinh ngẫu nhiên 10 số, không trùng |
| Khách hàng và HĐ khách hàng | KH K do DVKH A phụ trách có HĐ A `ACTIVE` (có phụ lục X1, 1 lần gia hạn có file); HĐ P `PENDING`; HĐ `CANCELLED`; HĐ `EXPIRED` là HĐ mới nhất của KH (cần seed, xem Điểm cần xác nhận); KH M do DVKH B phụ trách; HĐ `ACTIVE` hết hạn sau 5, 7, 8, 30, 31, 60, 61 ngày cho case kỳ hạn |
| Nhà thầu và HĐ nhà thầu | Nhà thầu N Tạo mới chưa HĐ; nhà thầu H Đang hoạt động có HĐ V Đang hiệu lực (phụ lục Y1 PDF, Y2 DOCX); nhà thầu N2 Tạo mới có HĐ P Chưa hiệu lực; nhà thầu D Dừng hợp tác có HĐ V9 Dừng khai thác; nhà thầu Ngưng hoạt động có HĐ E Hết hiệu lực (cần seed) |
| Case bảng giá dịch vụ (`UI-VDRD-005`) | Nhà thầu và HĐ Đang hiệu lực tạo mới trong lần chạy; ít nhất 1 đầu mục giá Cố định đang hoạt động trong Cấu hình đầu mục giá; tài khoản có quyền Thêm bảng giá mua |
| File mẫu | PDF 1MB, PDF đúng 5MB, 10MB, 20MB và lớn hơn 1 byte; DOCX, XLSX, PNG, JPG, ZIP; file `.exe` và file `.exe` đổi đuôi `.pdf`; file 0 byte; file import Lead đúng và sai template |
| Payload bảo mật | `xssPayload` là chuỗi thẻ script thử nghiệm đặt trong fixture; chuỗi SQL injection dạng `' OR 1=1 --` |
| Cleanup | Gắn `testRunId` vào tên công ty, tên nhà thầu, tên HĐ, tên bảng giá; chỉ dọn bằng API xóa có sẵn (đầu mối, tài liệu, phụ lục, nhà thầu Tạo mới) trong môi trường dev; Lead, KH, HĐ không có API xóa nên dùng MST và số HĐ mới mỗi lần chạy |

## Đã xác nhận với người dùng (2026-11-04)

- **Mã số thuế Lead không được trùng ở bất kỳ trạng thái nào** (Đang hoạt động, Ngưng hoạt động, Đã chuyển đổi/khách hàng). Tạo hoặc sửa với MST trùng đều bị chặn, không kích hoạt lại Lead cũ. Câu "cho kích hoạt lại Lead cũ" trong BR-LEAD-01 không áp dụng.
- **Hợp đồng hiện hành của khách hàng:** ưu tiên HĐ Đang hiệu lực; không có thì HĐ Chưa hiệu lực; chỉ còn HĐ đã đóng thì lấy HĐ có ngày hiệu lực lớn nhất.
- **Bảng giá mua phụ thuộc nhà thầu:** nhà thầu hết hợp đồng thì bảng giá tạm ngừng.

## Quy tắc pass/fail

- **Pass:** Mã HTTP nằm trong danh sách mong đợi, `errorCode` và nội dung response đúng, dữ liệu kiểm lại bằng API GET (trạng thái, lịch sử, dữ liệu liên quan) đúng như cột Kiểm tra nghiệp vụ/dữ liệu.
- **Fail:** Sai mã HTTP hoặc `errorCode`, sai trạng thái HĐ/KH/nhà thầu, dữ liệu bị tạo hoặc sửa khi request bị chặn, lộ dữ liệu ngoài phạm vi, hoặc có lỗi `5xx`.
- **Blocked:** Thiếu `tenantCode`, tài khoản đúng role, dữ liệu seed (HĐ hết hiệu lực) hoặc chưa chốt điểm trong mục Điểm cần xác nhận mà case phụ thuộc.

## Điểm cần xác nhận

| Nội dung | Giả định đang dùng | Ảnh hưởng nếu sai | Hỏi ai |
|---|---|---|---|
| `tenantCode` và tài khoản theo role | Có đủ NVKD, DVKH, QLNT, tài khoản khóa như mục Dữ liệu | Toàn bộ case bị Blocked | Người dùng / Admin hệ thống |
| Ma trận phân quyền thật | Lead chỉ NVKD; HĐ KH: NVKD upload, DVKH quản lý; nhà thầu và HĐ nhà thầu chỉ QLNT. Swagger không ghi role | Case Authorization và IDOR khác role sai kỳ vọng `403` | BA / Backend |
| Mã HTTP | Swagger ghi `200` cho phần lớn API tạo (Lead, HĐ), `201` cho tạo nhà thầu và đầu mối, `204` cho chuyển người phụ trách và xóa nhà thầu; vi phạm nghiệp vụ trả `400/409` với `domain-rule-violation`; cần xác nhận trả `409` kèm `confirmation-required` | Case phải nới hoặc đổi mã | Backend |
| Truy cập ngoài phạm vi | Trả `403` hoặc `404`, không lộ dữ liệu; DVKH chỉ xem KH mình phụ trách | Case IDOR của khách hàng có thể phải đổi thành `200` | BA |
| Cách truyền tham số lịch sử | Swagger khai báo object `query` bắt buộc; giả định truyền phẳng `search`, `from`, `to`, `actorUserId`, `event`, `page`, `perPage` | Mọi case lịch sử trả `400` | Backend |
| Giá trị `status`, `tier`, `serviceTypes` của nhà thầu | Swagger để chuỗi tự do; cần danh sách mã (Tạo mới, Đang hoạt động, Ngưng hoạt động, Dừng hợp tác; Chiến lược, Ưu tiên, Dự phòng) | Không viết được request lọc và tạo | Backend |
| Lý do khi dừng hợp tác, kích hoạt lại nhà thầu, hủy và dừng khai thác HĐ nhà thầu | SRS bắt buộc, Swagger để `reason` không bắt buộc; kỳ vọng `400` khi thiếu | Case Request validation báo Fail giả | BA / Backend |
| Lý do khi đổi phân hạng khách hàng | SRS yêu cầu, Swagger không có trường lý do | Thiếu case kiểm lý do | BA |
| Đầu mối trùng SĐT | Chưa rõ có chặn; case Idempotency của API thêm đầu mối chỉ ghi nhận hành vi | Có thể thiếu case Business rule | BA |
| Giới hạn dung lượng file scan HĐ và file import Lead | Chưa có số; dùng file lớn hơn giới hạn upload chung | Case File API có thể sai mã | Backend |
| Dữ liệu HĐ `EXPIRED` / Hết hiệu lực | Cần seed sẵn vì chỉ tác vụ 0:00 tạo ra trạng thái này. Case `CTR-` và `CTV-` gia hạn HĐ hết hiệu lực để Auto = Không cho tới khi có seed hoặc API tạo HĐ ngày quá khứ | 2 case không tự động được | Backend / DevOps |
| Tác vụ 0:00 kích hoạt và hết hạn HĐ | Không có API kích hoạt thủ công; không có case tự động chờ qua ngày | Luồng `PENDING` → `ACTIVE` tự động không được kiểm | Backend |
| Sửa Ngày hiệu lực HĐ nhà thầu Chưa hiệu lực về hôm nay | Báo cáo ghi chưa xác định; case chỉ ghi nhận hành vi | Có thể thiếu kiểm tra kích hoạt nhà thầu | BA |
| Định dạng mã | `LED-XXXX`, `CTCYYMM-XXX`, `PLCYYMM-XXX`, `VDR-XXXX`, `CTVYYMM-XXX`, `PLVYYMM-XXX` kiểm bằng regex | Case Happy path Fail giả | BA |
| Case `UI-VDRD-005`: nguồn dữ liệu tab Bảng giá dịch vụ | Tab gọi API danh sách bảng giá mua lọc theo nhà thầu (`contractorId`) vì API chi tiết nhà thầu không trả bảng giá; bảng giá mới ở trạng thái Tạo mới | Case kiểm sai chỗ | Frontend |
| Ngành hàng Khác | `industryIds` là UUID danh mục; cần id của ngành Khác trong tenant test; `industryOther` bắt buộc khi chọn Khác (SRS mục Thêm Lead) | Case ngành Khác không gửi được request | Backend |
| Kích hoạt tác vụ 0:00 khi test (tự động gia hạn, cảnh báo T−7, chạy lại tác vụ) | Cần hook hoặc endpoint nội bộ để chạy tác vụ theo yêu cầu và cách đọc thông báo; SRS ghi có cảnh báo trước và xác nhận sau nhưng không ghi số ngày, T−7 lấy theo yêu cầu kiểm thử. Các case này để Auto = Không | 4 case tác vụ chỉ chạy tay được | Backend / DevOps |
| Giới hạn UI khác giới hạn API (case UI biên) | Ghi chú Lead lúc tạo: UI 255, API 500; mô tả phụ lục HĐ nhà thầu: API và SRS khác nhau; giới hạn file từng màn (scan HĐ KH 5MB hay 20MB, tài liệu nhà thầu 5MB ở form tạo và 10MB ở chi tiết, import Lead 20MB). Cần 1 bảng dữ liệu dùng chung có cột giới hạn API và giới hạn UI | Các biến thể đánh dấu chờ chốt chưa cố định được | BA / Frontend |
| Ngày bắt đầu bằng ngày kết thúc của HĐ khách hàng; tái ký đúng ngày hết hạn HĐ gốc | Tài liệu chưa thống nhất; case biên UI và API tách riêng 2 biến thể này | Kỳ vọng biên ngày có thể sai | BA |
| Cách ly tenant | Case IDOR hiện chỉ kiểm cùng tenant khác người phụ trách; chưa có case 2 tenant vì chỉ có 1 tenant test | Thiếu kiểm rò dữ liệu giữa tenant | Admin hệ thống |
| Ảnh chuẩn cho Visual regression | Cần người duyệt ảnh chuẩn lần đầu | Case Visual regression không có mốc so | Tester / BA |
