# API Quản lý Lead, Khách hàng, Hợp đồng khách hàng — tài liệu cho QA

| | |
|---|---|
| Phạm vi | SRS "Lead-Hợp đồng-Khách hàng": mục 3.1 Lead (UC-LEAD-01…09), 3.3 Khách hàng (UC-CUST-01…06), 3.2 Hợp đồng (UC-CTR-01…10) |
| Cập nhật | 29/09/2026 |
| Áp dụng | Bản build có migration **V174, V175, V176**. Server chưa chạy các migration này thì các endpoint mới trả 404 |
| Swagger | `https://logx-api-dev.sonthanh.net.vn/swagger-ui.html` — tên field và kiểu dữ liệu chính xác nhất |
| Tài khoản test | [`../tai-khoan-test-qa.md`](../tai-khoan-test-qa.md) |

---

## 0. Quy ước chung

### Đăng nhập và header

```http
POST /api/auth/login
{ "tenantCode": "CONGTYA", "email": "...", "password": "..." }
```

Mọi request sau đó gửi `Authorization: Bearer <data.accessToken>`.

### Hình dạng phản hồi

```jsonc
// Thành công
{ "success": true, "message": "", "errorCode": null, "data": { ... } }
// Thất bại
{ "success": false, "message": "Mã số thuế đã được sử dụng", "errorCode": "domain-rule-violation", "data": null }
```

Danh sách có phân trang trả `data` dạng:

```json
{ "items": [ ... ], "meta": { "pagination": { "total": 42, "perPage": 20, "currentPage": 1, "totalPages": 3 } } }
```

Tham số phân trang: `page` (mặc định 1), `perPage` (mặc định 20, tối đa 100). Tham số nhiều giá trị: **lặp lại tên tham số**, ví dụ `?status=ACTIVE&status=INACTIVE`.

### Mã lỗi hay gặp

| HTTP | `errorCode` | Khi nào |
|---|---|---|
| 400 | `validation-failed` | Thiếu / sai định dạng. `data.errors` = `{ tênField: lý do }` |
| 400 | `invalid-request` | Giá trị không dùng được (file import sai, không có dữ liệu để xuất…) |
| 403 | `access-denied` | Token thiếu **quyền** |
| 404 | `resource-not-found` | Không có, **hoặc** bản ghi ngoài phạm vi người gọi (cố ý không trả 403) |
| 409 | `domain-rule-violation` | Vi phạm luật nghiệp vụ; `message` là câu hiển thị |
| 409 | `confirmation-required` | Cần xác nhận rồi gửi lại. `data.mustAcknowledge[0].code` là mã xác nhận, `message` là câu hỏi |

### Request multipart (upload file)

Phần JSON gửi dưới dạng một **part có `Content-Type: application/json`**, file là part riêng. Postman: chọn *form-data*, part JSON đặt kiểu `application/json`.

### Quyền

| Quyền | Dùng cho |
|---|---|
| `k1.lead.read` / `create` / `update` | Xem / tạo, import / sửa, đầu mối, tài liệu, ngưng–kích hoạt Lead |
| `k1.lead.transfer` *(mới)* | Chuyển người phụ trách Lead |
| `k1.customer.read` / `update` / `transfer` *(mới)* | Xem, lọc, xuất, lịch sử / sửa, đầu mối, phân loại / chuyển người phụ trách khách hàng |
| `k1.customer_contract.read` / `create` / `update` *(mới)* / `download` / `cancel` / `suspend` | Xem / upload, gia hạn, tái ký / sửa HĐ, phụ lục / tải file / hủy / dừng khai thác |

> Migration cấp sẵn quyền mới cho vai trò đang có quyền tương ứng: `k1.lead.transfer` ← `k1.lead.update`; `k1.customer.read` ← `k1.customer_contract.read`; `k1.customer.update`, `k1.customer.transfer`, `k1.customer_contract.update` ← `k1.customer_contract.create`.

### Phạm vi dữ liệu — cần **2 tài khoản** để test đúng

| Module | Ai thấy | Ai thao tác |
|---|---|---|
| Lead | Chỉ **người phụ trách Lead** (`ownerUserId`) | Người phụ trách Lead |
| Khách hàng | **Sale phụ trách Lead** hoặc **người phụ trách khách hàng** (`accountManagerId`) | Chỉ **người phụ trách khách hàng** |
| Hợp đồng | Sale **đã upload HĐ đó** (chỉ xem) hoặc **người phụ trách khách hàng** (xem mọi HĐ của KH) | Chỉ **người phụ trách khách hàng** |

Ngoài phạm vi → **404**. Nhìn thấy nhưng không phải người phụ trách → **409** `"Chỉ Người phụ trách khách hàng mới thực hiện được thao tác này"`.

---

## 1. Quản lý Lead — `/api/leads`

### Giá trị enum

| Field | Giá trị |
|---|---|
| `status` | `ACTIVE` (Đang hoạt động), `INACTIVE` (Ngưng hoạt động), `CONVERTED` (Đã chuyển đổi) |
| `route` | `DOMESTIC` (Nội địa), `VIETNAM_CHINA` (Việt - Trung), `DOMESTIC_AND_VIETNAM_CHINA` |
| `source` | `INDUSTRY_EVENT` (Sự kiện ngành), `REFERRAL` (Giới thiệu), `COLD_OUTREACH` (Tiếp cận chủ động), `INDUSTRY_RESEARCH` (Nghiên cứu ngành), `IMPORT`, `OTHER` (Khác) |

### Danh sách endpoint

| # | Method | Đường dẫn | Quyền | UC |
|---|---|---|---|---|
| 1 | POST | `/api/leads` | create | 01 Tạo Lead |
| 2 | GET | `/api/leads` | read | 02, 08 Danh sách, tìm/lọc |
| 3 | GET | `/api/leads/stats` | read | 02 Ô số liệu |
| 4 | GET | `/api/leads/assignable-owners` | read | 01, 07 Dropdown người phụ trách |
| 5 | GET | `/api/leads/{id}` | read | 02 Chi tiết |
| 6 | PUT | `/api/leads/{id}` | update | 03 Sửa |
| 7 | POST | `/api/leads/{id}/contacts` | update | 03 Thêm đầu mối |
| 8 | PUT | `/api/leads/{id}/contacts/{contactId}` | update | 03 Sửa đầu mối |
| 9 | POST | `/api/leads/{id}/contacts/{contactId}/primary` | update | 03 Đặt liên hệ chính |
| 10 | DELETE | `/api/leads/{id}/contacts/{contactId}` | update | 03 Xoá đầu mối |
| 11 | POST | `/api/leads/{id}/documents` | update | 01 Tài liệu thô |
| 12 | GET | `/api/leads/{id}/documents/{documentId}` | read | Tải tài liệu |
| 13 | DELETE | `/api/leads/{id}/documents/{documentId}` | update | Xoá tài liệu |
| 14 | POST | `/api/leads/{id}/deactivate` | update | 04 Ngưng hoạt động |
| 15 | POST | `/api/leads/{id}/reactivate` | update | 04 Kích hoạt lại |
| 16 | POST | `/api/leads/{id}/transfer-owner` | transfer | 07 Chuyển người phụ trách |
| 17 | GET | `/api/leads/import-template` | create | 05 Tải file mẫu |
| 18 | POST | `/api/leads/import` | create | 05 Import |
| 19 | GET | `/api/leads/export` | read | 06 Xuất Excel |
| 20 | GET | `/api/leads/{id}/history` | read | 09 Lịch sử |

### 1.1 Tạo Lead — `POST /api/leads`

```json
{
  "companyName": "Công ty TNHH Vận tải Biên Giới",
  "taxCode": "0101234567",
  "headOfficeAddress": "12 Láng Hạ, Hà Nội",
  "industryIds": ["<uuid ngành hàng>"],
  "industryOther": null,
  "route": "VIETNAM_CHINA",
  "source": "REFERRAL",
  "website": "https://bien-gioi.vn",
  "initialNote": "Cần vận tải 20 cont/tháng",
  "ownerUserId": "<uuid người phụ trách>",
  "contacts": [
    { "fullName": "Trần Thị B", "jobTitle": "Giám đốc", "phone": "0912345678", "email": "b@bien-gioi.vn", "primary": true },
    { "fullName": "Lê Văn C", "jobTitle": "Kế toán", "phone": "+84987654321", "email": "c@bien-gioi.vn" }
  ]
}
```

| Field | Luật |
|---|---|
| `companyName`* | ≤255 |
| `taxCode`* | đúng 10 hoặc 13 chữ số |
| `headOfficeAddress` | ≤500 |
| `industryIds`* | ≥1 id từ `GET /api/catalogues/industries` |
| `industryOther` | ≤255; **bắt buộc** khi chọn ngành tên "Khác", bị bỏ nếu không chọn |
| `website` | ≤255, đúng dạng URL (`abc.vn`, `https://abc.vn/` đều được) |
| `initialNote` | ≤1000 |
| `ownerUserId`* | khi **tạo hộ** người khác: phải có trong `assignable-owners` |
| `contacts`* | ≥1. `fullName`*, `jobTitle`* ≤100; `phone`* bắt đầu `0` hoặc `+84`, 10–11 số; `email`* ≤100. `primary`: tối đa 1 người `true`; không ai `true` → người đầu tiên |

**Phản hồi:**
- **201** kèm `LeadDetail` (xem 1.4).
- Nếu tạo hộ người khác: **201 không có body**, chỉ có header `Location`. Người được giao nhận chuông `LEAD_ASSIGNED`.

**Lỗi:**
- 409 `"Mã số thuế đã được sử dụng"`: trùng với **bất kỳ** Lead nào, kể cả đang ngưng hoặc đã chuyển đổi.
- 409 ngành hàng đã ngừng dùng (message nêu tên ngành).
- 400 `data.errors.industryOther` / `ownerUserId` / `contacts`.

### 1.2 Danh sách — `GET /api/leads`

Tham số: `search` (khớp một phần trên tên DN, mã Lead, MST, **tên đầu mối**), `status`\* (nhiều), `active` (true/false), `route`, `industryId`\* (nhiều), `source`\* (nhiều), `ownerUserId`, `createdFrom`, `createdTo` (`yyyy-MM-dd`), `page`, `perPage`. Sắp xếp theo ngày tạo, mới nhất trước.

```json
{ "items": [ {
    "id": "7c1e…", "code": "LED-0001", "companyName": "Công ty TNHH Vận tải Biên Giới", "taxCode": "0101234567",
    "industries": [ { "id": "…", "name": "Logistics" } ],
    "route": "VIETNAM_CHINA", "source": "REFERRAL", "ownerName": "Nguyễn Văn A",
    "status": "ACTIVE", "active": true, "customerCode": null,
    "primaryContactName": "Trần Thị B", "primaryContactPhone": "0912345678",
    "createdAt": "2026-09-29T02:15:00Z" } ],
  "meta": { "pagination": { "total": 1, "perPage": 20, "currentPage": 1, "totalPages": 1 } } }
```

Lead `CONVERTED` có `primaryContactName` và `primaryContactPhone` bằng `null`.

### 1.3 Ô số liệu — `GET /api/leads/stats`

```json
{ "total": 12, "active": 8, "inactive": 3, "converted": 1 }
```

Tính trên **toàn bộ** Lead của người gọi, không theo bộ lọc đang áp.

### 1.4 Chi tiết — `GET /api/leads/{id}` → `LeadDetail`

```json
{
  "id": "7c1e…", "code": "LED-0001", "companyName": "…", "taxCode": "0101234567",
  "headOfficeAddress": "12 Láng Hạ, Hà Nội",
  "industries": [ { "id": "…", "name": "Logistics" } ], "industryOther": null,
  "route": "VIETNAM_CHINA", "source": "REFERRAL", "website": "https://bien-gioi.vn", "initialNote": "…",
  "ownerUserId": "…", "ownerName": "Nguyễn Văn A",
  "status": "ACTIVE", "active": true, "deactivationReason": null,
  "customerCode": null, "becameCustomerAt": null,
  "createdBy": "…", "createdByName": "Nguyễn Văn A",
  "createdAt": "2026-09-29T02:15:00Z", "updatedAt": "2026-09-29T02:15:00Z",
  "contacts": [ { "id": "…", "fullName": "Trần Thị B", "jobTitle": "Giám đốc", "phone": "0912345678", "email": "b@bien-gioi.vn", "primary": true } ],
  "documents": [ { "id": "…", "filename": "brochure.pdf", "contentType": "application/pdf", "byteSize": 10240, "uploadedAt": "…" } ]
}
```

Lead `CONVERTED` luôn có `contacts: []`.

### 1.5 Sửa — `PUT /api/leads/{id}`

Body giống lúc tạo nhưng **không có** `taxCode`, `ownerUserId`, `contacts` (gửi lên thì bị bỏ qua). Trả `LeadDetail`.

Lỗi:
- 409 nếu Lead `INACTIVE` ("… hãy kích hoạt lại trước khi chỉnh sửa") hoặc `CONVERTED` ("… thông tin chỉ được xem").

### 1.6 Đầu mối (#7–#10)

Body `ContactCommand`: `{ "fullName", "jobTitle", "phone", "email" }` (khi thêm hoặc sửa thì `primary` không có tác dụng). Tất cả trả `LeadDetail`; riêng thêm mới trả **201**.

- Xoá đầu mối cuối cùng → 409 `"Không thể xóa Đầu mối liên hệ, Lead cần tối thiểu một Đầu mối liên hệ"`.
- Xoá đầu mối chính → người được nhập sớm nhất còn lại thành đầu mối chính.
- Lead `INACTIVE` hoặc `CONVERTED` → 409.

### 1.7 Tài liệu thô (#11–#13)

- Upload: multipart part `file`, nhận **PDF, DOCX, XLSX, PNG, JPG**, tối đa **10MB**, mỗi lần 1 file.
- Trả **201** `LeadDetail`.
- Sai loại hoặc quá cỡ → 409.
- Tải về: nhận bytes, tên file nằm trong `Content-Disposition`.

### 1.8 Ngưng / Kích hoạt lại (#14, #15)

- Ngưng: `{ "reason": "Khách chọn nhà thầu khác" }`. `reason` bắt buộc, tối đa 500 ký tự.
- Kích hoạt lại: không có body.
- Cả hai trả `LeadDetail`.
- Lead `CONVERTED` → 409; ngưng Lead đã ngưng → 409; kích hoạt Lead đang hoạt động → 409.

### 1.9 Chuyển người phụ trách — `POST /api/leads/{id}/transfer-owner`

```json
{ "newOwnerUserId": "<uuid>", "reason": "Tái phân bổ vùng" }
```

→ **204**. Sau đó người cũ gọi lại Lead này sẽ nhận **404**. Người mới nhận chuông `LEAD_TRANSFERRED`.

Lỗi:
- 400 thiếu người mới hoặc lý do.
- 400 `"Người phụ trách mới phải khác Người phụ trách hiện tại"`.
- 400 `data.errors.newOwnerUserId` (người không hợp lệ).
- 409 Lead không `ACTIVE`.
- 403 thiếu `k1.lead.transfer`.

### 1.10 Dropdown người phụ trách — `GET /api/leads/assignable-owners`

```json
{ "items": [ { "id": "…", "displayName": "Nguyễn Văn A", "email": "a@congtya.test" } ], "meta": { … } }
```

### 1.11 Import — `GET /api/leads/import-template`, `POST /api/leads/import`

- File mẫu `.xlsx` gồm sheet **Lead** (13 cột, định dạng text) và sheet **Danh mục** (ngành hàng, tuyến, nguồn).
- Upload: multipart part `file`, **chỉ `.xlsx`**, tối đa **20MB**.

Thứ tự cột:

| Cột | Tiêu đề |
|---|---|
| 1 | Tên doanh nghiệp * |
| 2 | Mã số thuế * |
| 3 | Địa chỉ trụ sở chính |
| 4 | Ngành hàng * (nhiều ngành cách nhau bởi dấu phẩy) |
| 5 | Ngành hàng khác (bắt buộc khi chọn Khác) |
| 6 | Tuyến * |
| 7 | Nguồn |
| 8 | Website |
| 9 | Ghi chú |
| 10 | Người liên hệ — Họ tên * |
| 11 | Người liên hệ — Chức danh * |
| 12 | Người liên hệ — SĐT * |
| 13 | Người liên hệ — Email * |

**Phản hồi 200** (luôn 200 khi file đọc được, kể cả khi mọi dòng đều lỗi):

```json
{ "totalRows": 3, "created": 1, "skippedDuplicate": 1, "skippedInvalid": 1,
  "failures": [
    { "row": 3, "companyName": "", "kind": "INVALID", "duplicateLeadCode": null,
      "errors": ["Thiếu Tên doanh nghiệp (Bắt buộc)", "Người liên hệ — SĐT không đúng định dạng (12345)"] },
    { "row": 4, "companyName": "Cty ABC", "kind": "DUPLICATE_TAX_CODE", "duplicateLeadCode": "LED-0001",
      "errors": ["Mã số thuế 0101234567 trùng với Lead LED-0001"] } ] }
```

- `row` là số dòng trên Excel, dòng tiêu đề là dòng 1.
- Trùng với một dòng trước đó trong cùng file: `kind` là `DUPLICATE_TAX_CODE`, `duplicateLeadCode` bằng `null`.
- Cột `Nguồn` để trống thì nhận giá trị `IMPORT`.
- Mọi Lead import vào đều thuộc người upload.

**400 cấp file** (không dòng nào được nhập):
- Không phải `.xlsx`.
- Quá 20MB.
- Không mở được file.
- **Tiêu đề cột khác file mẫu**: `"Sai cấu trúc cột so với file mẫu: cột N phải là …"`. Khi so tiêu đề, hệ thống bỏ qua dấu `*` và không phân biệt hoa/thường.

### 1.12 Xuất Excel — `GET /api/leads/export`

- Tham số giống hệt danh sách (1.2), không có `page`.
- Trả file `.xlsx`; header **`X-Total-Count`** là số dòng.
- Không có dữ liệu → **400** `"Không có dữ liệu để xuất"`. Quá 10.000 dòng → 400.

### 1.13 Lịch sử — `GET /api/leads/{id}/history?eventCode=&page=&perPage=`

```json
{ "items": [ {
    "id": "…", "at": "2026-09-29T03:00:00Z", "actorUserId": "…", "actorName": "Nguyễn Văn A",
    "eventCode": "LEAD_UPDATED", "eventLabel": "Sửa thông tin", "subject": null,
    "changes": [ { "field": "Tên doanh nghiệp", "from": "Cty cũ", "to": "Cty mới" } ],
    "reason": null } ], "meta": { … } }
```

`eventCode`:
- `LEAD_CREATED`, `LEAD_IMPORTED`, `LEAD_UPDATED`.
- `CONTACT_ADDED`, `CONTACT_UPDATED`, `CONTACT_REMOVED`, `PRIMARY_CONTACT_CHANGED`.
- `DOCUMENT_ADDED`, `DOCUMENT_REMOVED`.
- `LEAD_DEACTIVATED`, `LEAD_REACTIVATED`.
- `OWNER_TRANSFERRED`.
- `LEAD_CONVERTED`, `CUSTOMER_TIER_CHANGED`, `ACCOUNT_MANAGER_TRANSFERRED`.

Tác vụ tự động có `actorName` là `"Hệ thống"`. Với thao tác tạo và xoá, `changes` rỗng.

---

## 2. Quản lý Khách hàng — `/api/customers`

Khách hàng = **Lead đã upload hợp đồng đầu tiên**, dùng chung bản ghi, nên `{id}` chính là id của Lead.

### Giá trị enum

| Field | Giá trị |
|---|---|
| `status` | `ACTIVE` (Đang hoạt động), `SUSPENDED` (Tạm ngưng) |
| `suspendReason` | `PENDING_CONTRACT` (Chờ hiệu lực HĐ), `NO_ACTIVE_CONTRACT` (Chưa có HĐ hiệu lực), `CONTRACT_SUSPENDED` (Dừng khai thác); `null` khi `ACTIVE` |
| `tier` | `REGULAR` (Khách hàng thường), `STRATEGIC` (Khách hàng chiến lược) |
| `contractStatus` | `PENDING`, `ACTIVE`, `EXPIRED`, `SUSPENDED`, `CANCELLED` |

**Trạng thái KH lấy theo hợp đồng hiện hành.** Hợp đồng hiện hành được chọn theo thứ tự ưu tiên:
1. Hợp đồng Đang hiệu lực.
2. Nếu không có: hợp đồng Chưa hiệu lực sớm nhất.
3. Nếu không có nữa: hợp đồng có ngày kết thúc gần nhất.

Suy ra trạng thái KH:

| HĐ hiện hành | Trạng thái KH | `suspendReason` |
|---|---|---|
| `ACTIVE` | `ACTIVE` | `null` |
| `PENDING` | `SUSPENDED` | `PENDING_CONTRACT` |
| `SUSPENDED` | `SUSPENDED` | `CONTRACT_SUSPENDED` |
| `EXPIRED`, `CANCELLED` | `SUSPENDED` | `NO_ACTIVE_CONTRACT` |

### Danh sách endpoint

| # | Method | Đường dẫn | Quyền | UC |
|---|---|---|---|---|
| 1 | GET | `/api/customers` | read | 01, 05 Danh sách, tìm/lọc |
| 2 | GET | `/api/customers/{id}` | read | 01 Chi tiết |
| 3 | PUT | `/api/customers/{id}` | update | 02 Sửa thông tin |
| 4 | PUT | `/api/customers/{id}/tier` | update | 02 Đổi phân loại |
| 5 | POST | `/api/customers/{id}/contacts` | update | 02 Thêm đầu mối |
| 6 | PUT | `/api/customers/{id}/contacts/{contactId}` | update | 02 Sửa đầu mối |
| 7 | POST | `/api/customers/{id}/contacts/{contactId}/primary` | update | 02 Đặt liên hệ chính |
| 8 | DELETE | `/api/customers/{id}/contacts/{contactId}` | update | 02 Xoá đầu mối |
| 9 | GET | `/api/customers/{id}/documents/{documentId}` | read | Tải tài liệu thô (chỉ xem) |
| 10 | GET | `/api/customers/export` | read | 03 Xuất Excel |
| 11 | GET | `/api/customers/assignable-managers` | read | 04 Dropdown người phụ trách |
| 12 | POST | `/api/customers/{id}/transfer-account-manager` | transfer | 04 Chuyển người phụ trách |
| 13 | GET | `/api/customers/{id}/history` | read | 06 Lịch sử |

### 2.1 Danh sách — `GET /api/customers`

Tham số:
- `search`: khớp một phần trên tên DN, mã KH, MST, **mã hợp đồng bất kỳ** của khách, tên ngành.
- `industryId` (nhiều giá trị), `route`.
- `contractStatus` (nhiều giá trị): lọc theo **hợp đồng hiện hành**.
- `status` (nhiều giá trị), `tier` (nhiều giá trị).
- `page`, `perPage`.

Sắp xếp theo ngày trở thành khách hàng, mới nhất trước.

```json
{ "items": [ {
    "id": "7c1e…", "customerCode": "CUS-0001", "leadCode": "LED-0001",
    "companyName": "…", "taxCode": "0101234567", "industries": [ { "id": "…", "name": "Logistics" } ],
    "route": "VIETNAM_CHINA", "tier": "REGULAR", "status": "ACTIVE", "suspendReason": null,
    "currentContract": { "id": "…", "code": "CTC2609-001", "status": "ACTIVE",
                         "effectiveFrom": "2026-09-01", "effectiveTo": "2027-08-31", "creditLimit": 500000000.00 },
    "accountManagerId": "…", "accountManagerName": "Trần Thị DVKH", "ownerName": "Nguyễn Văn A",
    "primaryContactName": "Trần Thị B", "primaryContactPhone": "0912345678",
    "becameCustomerAt": "2026-09-29T03:00:00Z" } ], "meta": { … } }
```

### 2.2 Chi tiết — `GET /api/customers/{id}` → `CustomerDetail`

Gồm mọi field của dòng danh sách (trừ `primaryContact*`), cộng thêm:
- `headOfficeAddress`, `industryOther`, `source`, `website`, `initialNote`, `ownerUserId`.
- **`managedByMe`**: người gọi có phải người phụ trách KH không. Nút Sửa, Đầu mối, Phân loại chỉ hiện khi `true`.
- **`canTransfer`**: người gọi là người phụ trách **và** khách còn hợp đồng `PENDING` hoặc `ACTIVE`.
- `contacts[]`: như ở Lead.
- `documents[]`: như ở Lead, chỉ xem và tải.

### 2.3 Sửa thông tin — `PUT /api/customers/{id}`

- Body giống sửa Lead (1.5); trả `CustomerDetail`.
- Mã Lead, mã KH, MST không sửa được.
- Người gọi không phải người phụ trách KH → 409.
- `PUT /api/leads/{id}` với Lead đã chuyển đổi **vẫn bị chặn** → 409.

### 2.4 Đổi phân loại — `PUT /api/customers/{id}/tier`

```json
{ "tier": "STRATEGIC" }
```

- Trả `CustomerDetail`.
- **Chỉ đổi trên khách hàng.** Các hợp đồng giữ phân loại tại thời điểm ký.
- Lịch sử ghi `CUSTOMER_TIER_CHANGED`.

### 2.5 Đầu mối (#5–#8)

Giống Lead (1.6), nhưng trả `CustomerDetail`, và chỉ người phụ trách KH được thao tác.

### 2.6 Chuyển người phụ trách — `POST /api/customers/{id}/transfer-account-manager`

```json
{ "newAccountManagerId": "<uuid>", "reason": "Tái phân bổ khách hàng" }
```

→ **204**. Đổi người phụ trách trên khách hàng **và** trên mọi hợp đồng `PENDING` hoặc `ACTIVE`; hợp đồng đã kết thúc giữ người cũ.

- Người mới nhận chuông `CUSTOMER_TRANSFERRED`.
- Người cũ sau đó gọi lại → 404 (trừ khi họ cũng là sale phụ trách Lead).

Lỗi:
- 400 `"Người phụ trách mới phải khác người hiện tại"`.
- 400 `data.errors.newAccountManagerId`: người đó không có `k1.customer.read`.
- 409 khách không còn hợp đồng `PENDING`/`ACTIVE`.
- 409 người gọi không phải người phụ trách.

### 2.7 Xuất — `GET /api/customers/export`

- Tham số như 2.1, không có `page`.
- Trả `.xlsx` + header `X-Total-Count`.
- Rỗng → 400 `"Không có dữ liệu để xuất"`.

### 2.8 Lịch sử — `GET /api/customers/{id}/history`

Giống 1.13, trả **toàn bộ chuỗi, gồm cả giai đoạn Lead**.

---

## 3. Quản lý Hợp đồng khách hàng — `/api/contracts`

### Giá trị enum

| Field | Giá trị |
|---|---|
| `status` | `PENDING` (Chưa hiệu lực), `ACTIVE` (Đang hiệu lực), `EXPIRED` (Hết hiệu lực), `SUSPENDED` (Dừng khai thác), `CANCELLED` (Đã hủy) |
| `alertLevel` / `alert` | `URGENT` (≤7 ngày), `NOTICE` (8–30), `WATCH` (31–60), `NONE` |
| `customerTier` | `REGULAR`, `STRATEGIC` |
| `billingCycle` | `WEEKLY` (Hàng tuần), `MONTHLY` (Hàng tháng), `PER_SHIPMENT` (Theo lô), `OTHER` (Khác); `QUARTERLY` chỉ có ở HĐ cũ |
| `paymentMethod` | `TRANSFER` (Chuyển khoản), `CASH` (Tiền mặt) |
| `availableActions` | `EDIT`, `EXTEND`, `RESIGN`, `CANCEL`, `SUSPEND`, `MANAGE_ANNEXES` |

**Mã hợp đồng:**
- HĐ mới: `CTCYYMM-XXX` (vd `CTC2609-001`), bộ đếm XXX chạy lại từ 001 mỗi tháng.
- Phụ lục: `PLCYYMM-XXX`.
- HĐ tạo trước bản này giữ mã cũ `Hợp đồng-2026-0001`.

### Nút theo trạng thái (chỉ **người phụ trách KH** có; sale luôn nhận `availableActions: []`)

| Trạng thái | EDIT | EXTEND | RESIGN | CANCEL | SUSPEND | MANAGE_ANNEXES |
|---|---|---|---|---|---|---|
| `PENDING` | ✓ | | | ✓ | | ✓ |
| `ACTIVE` | ✓ | ✓ | ✓ | | ✓ | ✓ |
| `EXPIRED` | | ✓ | ✓ | | | ✓ |
| `SUSPENDED` | | | ✓ | | | ✓ |
| `CANCELLED` | | | ✓ | | | ✓ |

### Danh sách endpoint

| # | Method | Đường dẫn | Quyền | UC |
|---|---|---|---|---|
| 1 | GET | `/api/contracts/uploadable-customers` | create | 01 Dropdown Lead để upload |
| 2 | POST | `/api/contracts` | create | 01 Upload HĐ đầu tiên |
| 3 | GET | `/api/contracts` | read | 02, 09 Danh sách, tìm/lọc |
| 4 | GET | `/api/contracts/stats` | read | 02 Ô Giám sát kỳ hạn |
| 5 | GET | `/api/contracts/{id}` | read | 02 Chi tiết |
| 6 | GET | `/api/contracts/{id}/file` | download | 02 Tải file scan |
| 7 | GET | `/api/contracts/{id}/extensions/{sequence}/file` | download | File gia hạn (HĐ cũ) |
| 8 | POST | `/api/contracts/{id}/extensions` | create | 03 Gia hạn |
| 9 | POST | `/api/contracts/{id}/resign` | create | 04 Tái ký |
| 10 | POST | `/api/contracts/{id}/cancel` | cancel | 05 Hủy |
| 11 | POST | `/api/contracts/{id}/suspend` | suspend | 06 Dừng khai thác |
| 12 | PUT | `/api/contracts/{id}` | update | 07 Sửa |
| 13 | POST | `/api/contracts/{id}/annexes` | update | 08 Thêm phụ lục |
| 14 | PUT | `/api/contracts/{id}/annexes/{annexId}` | update | 08 Sửa phụ lục |
| 15 | DELETE | `/api/contracts/{id}/annexes/{annexId}` | update | 08 Xoá phụ lục |
| 16 | GET | `/api/contracts/{id}/annexes/{annexId}/file` | download | 08 Tải phụ lục |
| 17 | GET | `/api/contracts/export` | read | Xuất Excel |
| 18 | GET | `/api/contracts/{id}/history` | read | 10 Lịch sử |

### 3.0 Khối điều khoản (dùng chung cho Upload, Tái ký, Sửa)

```json
"signedOn": "2026-09-01", "effectiveFrom": "2026-09-01", "effectiveTo": "2027-08-31",
"creditLimit": 500000000,
"slaPickupOnTimePercent": 95, "slaDeliveryOnTimePercent": 98.5, "slaPodReturnDays": 3, "slaIncidentResponseHours": 4,
"slaOrderConfirmHours": 2, "slaVehicleDispatchHours": 12, "slaBorderClearanceDays": 1,
"lateDeliveryCompensation": "0.5% giá trị lô hàng/ngày, tối đa 5%",
"lossOrDamageCompensation": "Theo giá trị HĐ thương mại, tối đa 500 triệu/lô",
"annualLiabilityCapMillion": null,
"billingCycle": "MONTHLY", "paymentTermDays": 30,
"paymentDueNote": "Ngày xác nhận bảng kê", "paymentMethod": "TRANSFER"
```

| Field | Luật |
|---|---|
| `signedOn`*, `effectiveFrom`*, `effectiveTo`* | Ngày ký ≤ Ngày hiệu lực < Ngày hết hạn |
| `creditLimit`* | ≥0 (VNĐ) |
| `slaPickupOnTimePercent`*, `slaDeliveryOnTimePercent`* | 0–100 |
| `slaPodReturnDays`*, `slaIncidentResponseHours`* | ≥0 |
| `slaOrderConfirmHours`, `slaVehicleDispatchHours`, `slaBorderClearanceDays` | tuỳ chọn, ≥0 |
| `lateDeliveryCompensation`, `lossOrDamageCompensation` | ≤500 |
| `billingCycle`*, `paymentMethod`* | enum ở trên |
| `paymentTermDays`* | 0–365 |
| `paymentDueNote`* | chữ tự do ≤500 |

**File scan / phụ lục:** chỉ **PDF, DOCX**, tối đa **20MB**. Sai → 409 `"File không hợp lệ. Chỉ chấp nhận PDF, DOCX, tối đa 20MB"`.

### 3.1 Upload HĐ đầu tiên — `POST /api/contracts` (multipart)

| Part | Nội dung |
|---|---|
| `contract` (JSON) | `{ "customerId", "accountManagerId", "customerTier", …khối điều khoản 3.0 }` |
| `file` | File scan (bắt buộc) |

- `customerId` lấy từ `GET /api/contracts/uploadable-customers?search=`, trả `{ items: [{ id, leadCode, companyName, taxCode }] }`: gồm các Lead **của người gọi**, đang hoạt động, chưa từng có HĐ.
- `accountManagerId` lấy từ `GET /api/customers/assignable-managers`.

**201** kèm `ContractDetail`. Kết quả:
- Trạng thái HĐ theo ngày: `PENDING`, `ACTIVE`, hoặc `EXPIRED` nếu kỳ hạn đã qua.
- Lead chuyển thành khách hàng: sinh `CUS-XXXX`, trạng thái Lead thành `CONVERTED`.
- Đầu mối của khách hàng được **chép** sang HĐ.

Lỗi:
- 409 upload cho Lead đã có HĐ, Lead của người khác, hoặc Lead đang ngưng (`"… Hợp đồng về sau dùng Gia hạn hoặc Tái ký"`).
- 400 `data.errors.accountManagerId`.
- 400 sai thứ tự ngày (`"Ngày ký phải trước hoặc bằng Ngày bắt đầu hiệu lực"`, `"Ngày kết thúc hiệu lực phải sau Ngày bắt đầu hiệu lực"`).
- 409 trùng kỳ với HĐ `PENDING`/`ACTIVE` khác của cùng khách.

### 3.2 Danh sách — `GET /api/contracts`

Tham số:
- `search`: mã HĐ, tên KH, MST, tên người phụ trách.
- `status`, `customerTier`, `accountManagerId`, `customerId`.
- `signedFrom`, `signedTo`, `expiryFrom`, `expiryTo`.
- `alert`, `page`, `perPage`.

Sắp xếp theo ngày ký, mới nhất trước.

```json
{ "items": [ {
    "id": "…", "code": "CTC2609-001", "customerId": "…", "customerName": "…", "customerTaxCode": "0101234567",
    "customerTier": "REGULAR", "accountManagerName": "Trần Thị DVKH",
    "signedOn": "2026-09-01", "effectiveFrom": "2026-09-01", "effectiveTo": "2027-08-31",
    "status": "ACTIVE", "daysToExpiry": 336, "alertLevel": "NONE", "extensionCount": 0,
    "availableActions": ["EDIT", "EXTEND", "RESIGN", "SUSPEND", "MANAGE_ANNEXES"] } ], "meta": { … } }
```

### 3.3 Ô Giám sát kỳ hạn — `GET /api/contracts/stats`

```json
{ "urgent": 1, "notice": 3, "watch": 5 }
```

Chỉ đếm HĐ `ACTIVE` trong phạm vi người gọi.

### 3.4 Chi tiết — `GET /api/contracts/{id}` → `ContractDetail`

```json
{
  "id": "…", "code": "CTC2609-001", "customerId": "…", "customerName": "…", "customerTaxCode": "0101234567",
  "customerCode": "CUS-0001", "customerTier": "REGULAR", "accountManagerId": "…", "accountManagerName": "Trần Thị DVKH",
  "signedOn": "2026-09-01", "effectiveFrom": "2026-09-01", "effectiveTo": "2027-08-31",
  "status": "ACTIVE", "daysToExpiry": 336, "alertLevel": "NONE",
  "creditLimit": 500000000.00,
  "slaPickupOnTimePercent": 95.00, "slaDeliveryOnTimePercent": 98.50, "slaPodReturnDays": 3, "slaIncidentResponseHours": 4,
  "slaOrderConfirmHours": null, "slaVehicleDispatchHours": null, "slaBorderClearanceDays": null,
  "lateDeliveryCompensation": "…", "lossOrDamageCompensation": null, "annualLiabilityCapMillion": null,
  "billingCycle": "MONTHLY", "paymentTermDays": 30, "paymentDueNote": "Ngày xác nhận bảng kê", "paymentMethod": "TRANSFER",
  "cancelReason": null, "suspendReason": null, "fileName": "hop-dong.pdf",
  "extensions": [ { "id": "…", "sequence": 1, "previousExpiry": "2027-08-31", "newExpiry": "2028-08-31",
                    "note": "…", "performedBy": "Trần Thị DVKH", "performedAt": "…", "hasFile": true, "annexCode": "PLC2609-001" } ],
  "annexes": [ { "id": "…", "code": "PLC2609-001", "name": "Phụ lục gia hạn lần 1", "description": null, "source": "EXTENSION",
                 "filename": "phu-luc.pdf", "contentType": "application/pdf", "byteSize": 20480,
                 "createdByName": "Trần Thị DVKH", "createdAt": "…", "updatedByName": null, "updatedAt": null } ],
  "contacts": [ { "id": "…", "fullName": "Trần Thị B", "jobTitle": "Giám đốc", "phone": "0912345678", "email": "b@…" } ],
  "availableActions": ["EDIT", "EXTEND", "RESIGN", "SUSPEND", "MANAGE_ANNEXES"],
  "createdById": "…", "createdBy": "Nguyễn Văn A", "createdAt": "…"
}
```

`annexes[].source` nhận một trong ba giá trị:
- `MANUAL`: thêm qua nút "Thêm phụ lục".
- `EXTENSION`: sinh tự động khi gia hạn kèm file.
- `RESIGN`: sinh tự động khi tái ký kèm phụ lục.

### 3.5 Gia hạn — `POST /api/contracts/{id}/extensions` (multipart)

| Part | Nội dung |
|---|---|
| `extension` (JSON) | `{ "newExpiry": "2028-08-31", "note": "Gia hạn theo thỏa thuận" }` (`note` ≤500) |
| `file` | tuỳ chọn; có file → tạo phụ lục `PLC…` tên "Phụ lục gia hạn lần N" |

- Áp dụng cho HĐ `ACTIVE` hoặc `EXPIRED`. Gia hạn HĐ `EXPIRED` đưa nó về `ACTIVE`.
- Trả `ContractDetail`.

Lỗi:
- 400 `"Ngày hết hạn mới phải lớn hơn Ngày hết hạn cũ và lớn hơn ngày hiện tại"`.
- 409 HĐ ở trạng thái khác.

### 3.6 Tái ký — `POST /api/contracts/{id}/resign` (multipart)

| Part | Nội dung |
|---|---|
| `contract` (JSON) | Khối điều khoản 3.0 + `accountManagerId` (tuỳ chọn; bỏ trống = người phụ trách KH hiện tại) + `confirmReplacement` (bool) + `replacementReason` (tuỳ chọn, ≤500) |
| `file` | File scan HĐ mới (bắt buộc) |
| `annexFile` | Phụ lục kèm theo (tuỳ chọn) |

- Được tái ký từ HĐ `ACTIVE`, `EXPIRED`, `SUSPENDED`, `CANCELLED`. HĐ `PENDING` → 409.
- **201** kèm `ContractDetail` của **HĐ mới** (mã `CTC` mới).
- Phân loại lấy từ khách hàng; đầu mối chép từ HĐ cũ.

**Luồng xác nhận:** áp dụng khi HĐ cũ đang `ACTIVE` và ngày hiệu lực HĐ mới **≤** ngày hết hạn HĐ cũ.
1. Lần gửi đầu trả **409 `confirmation-required`**, với `data.mustAcknowledge[0].code = "contract-replace-active"`, `message` = `"Hợp đồng cũ [Mã] đang hiệu lực đến [dd/MM/yyyy]. … Xác nhận tái ký?"`.
2. Gửi lại với `"confirmReplacement": true`. HĐ cũ chuyển `SUSPENDED` với lý do `"Được thay thế bởi Hợp đồng tái ký [Mã mới]"` (hoặc `replacementReason` nếu có gửi).

### 3.7 Hủy / Dừng khai thác

- `POST /api/contracts/{id}/cancel`, body `{ "reason": "Upload nhầm" }`: **chỉ HĐ `PENDING`**. HĐ khác → 409.
- `POST /api/contracts/{id}/suspend`, body `{ "reason": "…" }`: **chỉ HĐ `ACTIVE`**.
- `reason` bắt buộc, tối đa 500 ký tự; thiếu → 400. Cả hai trả `ContractDetail`.

### 3.8 Sửa HĐ — `PUT /api/contracts/{id}` (multipart)

| Part | Nội dung |
|---|---|
| `contract` (JSON) | Khối điều khoản 3.0 (**gửi đủ cả form**) + `contacts`* (danh sách đầu mối vận hành, **thay toàn bộ**) + `reason`* (≤500) + `confirmActivation` (bool) |
| `file` | File scan thay thế (tuỳ chọn, **chỉ HĐ `PENDING`**) |

```json
{ …khối điều khoản…,
  "contacts": [ { "fullName": "Điều Phối B", "jobTitle": "Điều phối", "phone": "0912345679", "email": "b@t.vn" } ],
  "reason": "Điều chỉnh theo phụ lục PLC2609-002", "confirmActivation": false }
```

- **HĐ `PENDING`:** sửa được mọi thứ, kể cả 3 mốc ngày và file scan (file cũ vẫn được lưu).
  - Nếu ngày hiệu lực mới làm HĐ thành `ACTIVE`: lần gửi đầu trả 409 `confirmation-required`, mã `"contract-becomes-active"`.
  - Gửi lại với `confirmActivation: true` thì lưu.
- **HĐ `ACTIVE`:** sửa điều khoản và đầu mối. **Gửi mốc ngày khác giá trị hiện tại, hoặc gửi file → 409.** Vẫn phải gửi đủ 3 mốc ngày với giá trị hiện tại.
- HĐ `EXPIRED`, `SUSPENDED`, `CANCELLED` → 409.
- Thiếu `reason` → 400.
- Trả `ContractDetail`.

### 3.9 Phụ lục (#13–#16)

**Thêm** — `POST /api/contracts/{id}/annexes` (multipart):

| Part | Nội dung |
|---|---|
| `annex` (JSON) | `{ "name": "Phụ lục điều chỉnh giá", "description": "Quý 4" }` (`name`* ≤255, `description` ≤1000) |
| `file` | bắt buộc |

→ **201** `ContractDetail`, phụ lục mới có mã `PLC…`.

**Sửa** — `PUT /api/contracts/{id}/annexes/{annexId}` (multipart): part `annex` như trên; part `file` tuỳ chọn (thay file). Mã phụ lục không đổi.

**Xoá** — `DELETE …/annexes/{annexId}`: trả `ContractDetail`.

**Tải** — `GET …/annexes/{annexId}/file`: được ghi vào lịch sử.

Lỗi:
- 409 thiếu file (`"Vui lòng đính kèm file phụ lục"`).
- 400 thiếu `name`.
- 409 người gọi không phải người phụ trách KH.
- Được thao tác phụ lục ở **mọi** trạng thái HĐ.

### 3.10 Xuất — `GET /api/contracts/export`

- Tham số như 3.2, không có `page`.
- Trả `.xlsx` + header `X-Total-Count`.
- Rỗng → 400 `"Không có dữ liệu để xuất"`.

Cột trong file: Mã HĐ, Khách hàng, MST, Phân loại, Người phụ trách, Ngày ký, Ngày hiệu lực, Ngày hết hạn, Số ngày còn lại, Trạng thái, Số lần gia hạn, Hạn mức tín dụng.

### 3.11 Lịch sử — `GET /api/contracts/{id}/history`

Hình dạng giống 1.13. `eventCode`:
- `CONTRACT_UPLOADED`, `CONTRACT_RESIGNED` (`subject` = "Thay thế hợp đồng [mã cũ]").
- `CONTRACT_EXTENDED` (`subject` = "Phụ lục lần N").
- `CONTRACT_UPDATED` (`reason` = lý do sửa).
- `CONTRACT_CANCELLED`, `CONTRACT_SUSPENDED`.
- `CONTRACT_ACTIVATED`, `CONTRACT_EXPIRED`: batch chạy lúc 00:00, `actorName` là "Hệ thống".
- `ANNEX_ADDED`, `ANNEX_UPDATED`, `ANNEX_REMOVED`.
- `FILE_DOWNLOADED` (`subject` = tên file).
- `ACCOUNT_MANAGER_TRANSFERRED`.

### 3.12 Tự động theo ngày

Batch chạy lúc **00:00 giờ Việt Nam**, không chạy lúc đọc:
- `PENDING` lên `ACTIVE` khi tới ngày hiệu lực.
- `ACTIVE` xuống `EXPIRED` khi quá ngày hết hạn.

Muốn thấy HĐ đổi trạng thái thì phải chờ qua 00:00. Riêng HĐ upload với kỳ hạn đã qua thì nhận `EXPIRED` **ngay** lúc upload.

---

## 4. Thông báo (chuông) sinh ra từ ba module

Xem qua `GET /api/notifications`. Thông báo **xuất hiện sau vài giây** vì đi qua hàng đợi.

| `kind` | Khi nào | Ai nhận | `subjectType` |
|---|---|---|---|
| `LEAD_ASSIGNED` | Người khác tạo Lead và chọn bạn làm người phụ trách | người được giao | `lead` |
| `LEAD_TRANSFERRED` | Lead được chuyển cho bạn (kèm lý do) | người phụ trách mới | `lead` |
| `CUSTOMER_TRANSFERRED` | Khách hàng được chuyển cho bạn (kèm lý do) | người phụ trách KH mới | `customer` |

---

## 5. Chưa có trong đợt này (không phải lỗi)

- Hạn mức **khả dụng**, chặn gửi phiếu khi vượt hạn mức, cảnh báo hạn mức ≤10% (BR-CUST-10…14): phiếu dịch vụ chưa có giá trị. Hệ quả: trạng thái KH chưa có lý do "Vượt hạn mức"; sửa HĐ không chặn việc hạ hạn mức.
- Trùng MST với Lead **đang ngưng**: SRS cho kích hoạt lại, nhưng đợt này **chặn** giống mọi trường hợp trùng. Đang chờ BA chốt.
- Dừng khai thác **không** đòi điều kiện "đang có dịch vụ phát sinh". Cố ý bỏ, để HĐ đang chạy mà chưa có phiếu không bị kẹt.
- Quản lý nhà thầu và hợp đồng nhà thầu: chờ SRS.
