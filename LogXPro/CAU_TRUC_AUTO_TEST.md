# Cấu trúc project auto test Playwright — LogXPro (Lead, Khách hàng, HĐ khách hàng, Nhà thầu, HĐ nhà thầu)

_Tạo lúc 2026-11-05 16:26 từ bộ case `TEST_CASE_AUTO.md`, báo cáo API `BAO_CAO_API_PHAM_VI_TEST.md`. 1021 case (1015 auto, 6 thủ công), 226 file._

## 1. Tóm tắt

- Project TypeScript `auto-tests/`, tách `src/` (cách gọi API và thao tác màn hình) khỏi `tests/` (kiểm tra gì).
- 148 file spec API chia theo 5 thư mục nghiệp vụ (`leads`, `customer-contracts`, `customers`, `contractors`, `contractor-contracts`), trong mỗi thư mục chia theo đối tượng (chính, đầu mối, tài liệu, phụ lục, file, vòng đời, lịch sử) và loại kiểm tra (functional, contract, validation, security, concurrency, integration). File quá 50 case được tách tiếp theo API.
- 3 file luồng trong `tests/flows/` và 20 file spec UI trong 8 thư mục màn hình `tests/ui/`.
- Phủ 1015/1015 case auto, mỗi case nằm đúng một file; 6 case thủ công (CTR-131, CTV-122, CTV-123, CTV-124, CTV-125, CTV-140) không có file, cần tác vụ 0:00 hoặc dữ liệu HĐ hết hạn.
- Giá mua đầu vào chỉ có 1 case `UI-VDRD-005` trong `tests/ui/contractor-detail/contractor-detail.functional.spec.ts`, dùng `src/pages/purchase-price-form.page.ts`.
- Làm trước: cấu hình và đăng nhập theo role, client và factory, rồi case `@p1` của API tạo dữ liệu chính.

## 2. Cấu trúc thư mục

```text
auto-tests/
├─ src/
│  ├─ api/
│  │  ├─ schemas/
│  │  │  ├─ common.schema.ts
│  │  │  ├─ contract.schema.ts
│  │  │  ├─ contractor-contract.schema.ts
│  │  │  ├─ contractor.schema.ts
│  │  │  ├─ customer.schema.ts
│  │  │  └─ lead.schema.ts
│  │  ├─ auth.client.ts
│  │  ├─ contract.client.ts
│  │  ├─ contractor-contract.client.ts
│  │  ├─ contractor.client.ts
│  │  ├─ customer.client.ts
│  │  ├─ http.client.ts
│  │  └─ lead.client.ts
│  ├─ data/
│  │  ├─ contract.factory.ts
│  │  ├─ contractor-contract.factory.ts
│  │  ├─ contractor.factory.ts
│  │  ├─ customer.factory.ts
│  │  ├─ file.factory.ts
│  │  ├─ lead.factory.ts
│  │  ├─ payloads.ts
│  │  └─ purchase-price.factory.ts
│  ├─ fixtures/
│  │  ├─ api.fixture.ts
│  │  ├─ auth.fixture.ts
│  │  ├─ page.fixture.ts
│  │  └─ seed.fixture.ts
│  ├─ mocks/
│  │  └─ server-error.mock.ts
│  ├─ pages/
│  │  ├─ components/
│  │  │  ├─ data-table.component.ts
│  │  │  ├─ file-upload.component.ts
│  │  │  ├─ filter-bar.component.ts
│  │  │  ├─ modal.component.ts
│  │  │  └─ toast.component.ts
│  │  ├─ contract-detail.page.ts
│  │  ├─ contract-upload.page.ts
│  │  ├─ contractor-contract-detail.page.ts
│  │  ├─ contractor-contract-form.page.ts
│  │  ├─ contractor-detail.page.ts
│  │  ├─ contractor-form.page.ts
│  │  ├─ contractor-list.page.ts
│  │  ├─ customer-detail.page.ts
│  │  ├─ customer-list.page.ts
│  │  ├─ lead-detail.page.ts
│  │  ├─ lead-form.page.ts
│  │  ├─ lead-list.page.ts
│  │  ├─ login.page.ts
│  │  └─ purchase-price-form.page.ts
│  └─ utils/
│     ├─ cleanup.ts
│     ├─ dates.ts
│     ├─ file-check.ts
│     └─ test-run.ts
├─ tests/
│  ├─ api/
│  │  ├─ contractor-contracts/
│  │  │  ├─ contractor-contract-annexes.concurrency.spec.ts
│  │  │  ├─ contractor-contract-annexes.contract.spec.ts
│  │  │  ├─ contractor-contract-annexes.functional.spec.ts
│  │  │  ├─ contractor-contract-annexes.integration.spec.ts
│  │  │  ├─ contractor-contract-annexes.security.spec.ts
│  │  │  ├─ contractor-contract-annexes.validation.spec.ts
│  │  │  ├─ contractor-contract-files.contract.spec.ts
│  │  │  ├─ contractor-contract-files.functional.spec.ts
│  │  │  ├─ contractor-contract-files.integration.spec.ts
│  │  │  ├─ contractor-contract-files.security.spec.ts
│  │  │  ├─ contractor-contract-files.validation.spec.ts
│  │  │  ├─ contractor-contract-history.contract.spec.ts
│  │  │  ├─ contractor-contract-history.functional.spec.ts
│  │  │  ├─ contractor-contract-history.security.spec.ts
│  │  │  ├─ contractor-contract-history.validation.spec.ts
│  │  │  ├─ contractor-contract-lifecycle.concurrency.spec.ts
│  │  │  ├─ contractor-contract-lifecycle.contract.spec.ts
│  │  │  ├─ contractor-contract-lifecycle.functional.spec.ts
│  │  │  ├─ contractor-contract-lifecycle.integration.spec.ts
│  │  │  ├─ contractor-contract-lifecycle.security.spec.ts
│  │  │  ├─ contractor-contract-lifecycle.validation.spec.ts
│  │  │  ├─ contractor-contract.concurrency.spec.ts
│  │  │  ├─ contractor-contract.contract.spec.ts
│  │  │  ├─ contractor-contract.functional.spec.ts
│  │  │  ├─ contractor-contract.integration.spec.ts
│  │  │  ├─ contractor-contract.security.spec.ts
│  │  │  └─ contractor-contract.validation.spec.ts
│  │  ├─ contractors/
│  │  │  ├─ contractor-contacts.concurrency.spec.ts
│  │  │  ├─ contractor-contacts.contract.spec.ts
│  │  │  ├─ contractor-contacts.functional.spec.ts
│  │  │  ├─ contractor-contacts.security.spec.ts
│  │  │  ├─ contractor-contacts.validation.spec.ts
│  │  │  ├─ contractor-documents.concurrency.spec.ts
│  │  │  ├─ contractor-documents.contract.spec.ts
│  │  │  ├─ contractor-documents.functional.spec.ts
│  │  │  ├─ contractor-documents.integration.spec.ts
│  │  │  ├─ contractor-documents.security.spec.ts
│  │  │  ├─ contractor-documents.validation.spec.ts
│  │  │  ├─ contractor-export.contract.spec.ts
│  │  │  ├─ contractor-export.functional.spec.ts
│  │  │  ├─ contractor-export.integration.spec.ts
│  │  │  ├─ contractor-export.security.spec.ts
│  │  │  ├─ contractor-export.validation.spec.ts
│  │  │  ├─ contractor-history.contract.spec.ts
│  │  │  ├─ contractor-history.functional.spec.ts
│  │  │  ├─ contractor-history.security.spec.ts
│  │  │  ├─ contractor-history.validation.spec.ts
│  │  │  ├─ contractor-lifecycle.concurrency.spec.ts
│  │  │  ├─ contractor-lifecycle.contract.spec.ts
│  │  │  ├─ contractor-lifecycle.functional.spec.ts
│  │  │  ├─ contractor-lifecycle.security.spec.ts
│  │  │  ├─ contractor-lifecycle.validation.spec.ts
│  │  │  ├─ contractor.concurrency.spec.ts
│  │  │  ├─ contractor.contract.spec.ts
│  │  │  ├─ contractor.functional.spec.ts
│  │  │  ├─ contractor.security.spec.ts
│  │  │  └─ contractor.validation.spec.ts
│  │  ├─ customer-contracts/
│  │  │  ├─ contract-annexes.concurrency.spec.ts
│  │  │  ├─ contract-annexes.contract.spec.ts
│  │  │  ├─ contract-annexes.functional.spec.ts
│  │  │  ├─ contract-annexes.integration.spec.ts
│  │  │  ├─ contract-annexes.security.spec.ts
│  │  │  ├─ contract-annexes.validation.spec.ts
│  │  │  ├─ contract-export.contract.spec.ts
│  │  │  ├─ contract-export.functional.spec.ts
│  │  │  ├─ contract-export.integration.spec.ts
│  │  │  ├─ contract-export.security.spec.ts
│  │  │  ├─ contract-export.validation.spec.ts
│  │  │  ├─ contract-files.contract.spec.ts
│  │  │  ├─ contract-files.functional.spec.ts
│  │  │  ├─ contract-files.integration.spec.ts
│  │  │  ├─ contract-files.security.spec.ts
│  │  │  ├─ contract-files.validation.spec.ts
│  │  │  ├─ contract-history.contract.spec.ts
│  │  │  ├─ contract-history.functional.spec.ts
│  │  │  ├─ contract-history.security.spec.ts
│  │  │  ├─ contract-history.validation.spec.ts
│  │  │  ├─ contract-lifecycle.concurrency.spec.ts
│  │  │  ├─ contract-lifecycle.contract.spec.ts
│  │  │  ├─ contract-lifecycle.functional.spec.ts
│  │  │  ├─ contract-lifecycle.integration.spec.ts
│  │  │  ├─ contract-lifecycle.security.spec.ts
│  │  │  ├─ contract-lifecycle.validation.spec.ts
│  │  │  ├─ contract.concurrency.spec.ts
│  │  │  ├─ contract.contract.spec.ts
│  │  │  ├─ contract.functional.spec.ts
│  │  │  ├─ contract.integration.spec.ts
│  │  │  ├─ contract.security.spec.ts
│  │  │  └─ contract.validation.spec.ts
│  │  ├─ customers/
│  │  │  ├─ customer-account.concurrency.spec.ts
│  │  │  ├─ customer-account.contract.spec.ts
│  │  │  ├─ customer-account.functional.spec.ts
│  │  │  ├─ customer-account.security.spec.ts
│  │  │  ├─ customer-account.validation.spec.ts
│  │  │  ├─ customer-contacts.concurrency.spec.ts
│  │  │  ├─ customer-contacts.contract.spec.ts
│  │  │  ├─ customer-contacts.functional.spec.ts
│  │  │  ├─ customer-contacts.security.spec.ts
│  │  │  ├─ customer-contacts.validation.spec.ts
│  │  │  ├─ customer-documents.contract.spec.ts
│  │  │  ├─ customer-documents.functional.spec.ts
│  │  │  ├─ customer-documents.integration.spec.ts
│  │  │  ├─ customer-documents.security.spec.ts
│  │  │  ├─ customer-documents.validation.spec.ts
│  │  │  ├─ customer-export.contract.spec.ts
│  │  │  ├─ customer-export.functional.spec.ts
│  │  │  ├─ customer-export.integration.spec.ts
│  │  │  ├─ customer-export.security.spec.ts
│  │  │  ├─ customer-export.validation.spec.ts
│  │  │  ├─ customer-history.contract.spec.ts
│  │  │  ├─ customer-history.functional.spec.ts
│  │  │  ├─ customer-history.security.spec.ts
│  │  │  ├─ customer-history.validation.spec.ts
│  │  │  ├─ customer.contract.spec.ts
│  │  │  ├─ customer.functional.spec.ts
│  │  │  ├─ customer.security.spec.ts
│  │  │  └─ customer.validation.spec.ts
│  │  └─ leads/
│  │     ├─ lead-contacts.concurrency.spec.ts
│  │     ├─ lead-contacts.contract.spec.ts
│  │     ├─ lead-contacts.functional.spec.ts
│  │     ├─ lead-contacts.security.spec.ts
│  │     ├─ lead-contacts.validation.spec.ts
│  │     ├─ lead-documents.concurrency.spec.ts
│  │     ├─ lead-documents.contract.spec.ts
│  │     ├─ lead-documents.functional.spec.ts
│  │     ├─ lead-documents.integration.spec.ts
│  │     ├─ lead-documents.security.spec.ts
│  │     ├─ lead-documents.validation.spec.ts
│  │     ├─ lead-history.contract.spec.ts
│  │     ├─ lead-history.functional.spec.ts
│  │     ├─ lead-history.security.spec.ts
│  │     ├─ lead-history.validation.spec.ts
│  │     ├─ lead-import-export.concurrency.spec.ts
│  │     ├─ lead-import-export.contract.spec.ts
│  │     ├─ lead-import-export.functional.spec.ts
│  │     ├─ lead-import-export.integration.spec.ts
│  │     ├─ lead-import-export.security.spec.ts
│  │     ├─ lead-import-export.validation.spec.ts
│  │     ├─ lead-lifecycle.concurrency.spec.ts
│  │     ├─ lead-lifecycle.contract.spec.ts
│  │     ├─ lead-lifecycle.functional.spec.ts
│  │     ├─ lead-lifecycle.security.spec.ts
│  │     ├─ lead-lifecycle.validation.spec.ts
│  │     ├─ lead.concurrency.spec.ts
│  │     ├─ lead.contract.spec.ts
│  │     ├─ lead.functional.spec.ts
│  │     ├─ lead.security.spec.ts
│  │     └─ lead.validation.spec.ts
│  ├─ flows/
│  │  ├─ contractor-lifecycle.flow.spec.ts
│  │  ├─ customer-contract-lifecycle.flow.spec.ts
│  │  └─ lead-to-customer.flow.spec.ts
│  ├─ setup/
│  │  └─ auth.setup.ts
│  └─ ui/
│     ├─ common/
│     │  ├─ common.access.spec.ts
│     │  └─ common.functional.spec.ts
│     ├─ contractor-contract/
│     │  ├─ contractor-contract.functional.spec.ts
│     │  └─ contractor-contract.validation.spec.ts
│     ├─ contractor-detail/
│     │  ├─ contractor-detail.functional.spec.ts
│     │  └─ contractor-detail.validation.spec.ts
│     ├─ contractor-list/
│     │  ├─ contractor-list.functional.spec.ts
│     │  └─ contractor-list.validation.spec.ts
│     ├─ customer-contract/
│     │  ├─ customer-contract.functional.spec.ts
│     │  └─ customer-contract.validation.spec.ts
│     ├─ customers/
│     │  ├─ customers.access.spec.ts
│     │  ├─ customers.functional.spec.ts
│     │  └─ customers.validation.spec.ts
│     ├─ lead-form/
│     │  ├─ lead-form.functional.spec.ts
│     │  └─ lead-form.validation.spec.ts
│     └─ lead-list/
│        ├─ lead-list.a11y.spec.ts
│        ├─ lead-list.access.spec.ts
│        ├─ lead-list.functional.spec.ts
│        ├─ lead-list.responsive.spec.ts
│        └─ lead-list.visual.spec.ts
├─ .env.example
├─ README.md
├─ package.json
├─ playwright.config.ts
└─ tsconfig.json
```

## 3. Mô tả từng file

| File | Loại | Dùng để làm gì | Case quản lý | API chính | Phụ thuộc |
| --- | --- | --- | --- | --- | --- |
| `playwright.config.ts` | config | Khai báo project `setup`, `api`, `ui`, `responsive`, `visual`; baseURL web và API đọc từ biến môi trường; reporter html, junit; trace và video khi lỗi; `fullyParallel` | Tất cả | - | - |
| `package.json` | config | Phụ thuộc `@playwright/test`, `zod`, `@axe-core/playwright`, `exceljs`, `dotenv`; script `test:api`, `test:ui`, `test:smoke` (tag `@p1`) | Tất cả | - | - |
| `tsconfig.json` | config | Cấu hình TypeScript strict, alias `@src/*` | Tất cả | - | - |
| `.env.example` | config | Tên biến: `API_BASE_URL`, `WEB_BASE_URL`, `TENANT_CODE`, email và mật khẩu từng role (NVKD A/B/C, DVKH A/B/C, QLNT, tài khoản khóa); không có giá trị thật | Tất cả | - | - |
| `README.md` | doc | Nội dung bắt buộc của `.gitignore` (bỏ qua `.env`, `.auth/` chứa token, `test-results/`, `playwright-report/`); cách cài đặt, biến môi trường, lệnh chạy theo project, tag, một case theo ID; bảng ánh xạ thư mục với mục trong TEST_CASE_AUTO.md | Tất cả | - | - |
| `src/api/http.client.ts` | client | Lớp gọi HTTP chung: gắn Bearer token, đọc wrapper `success/message/errorCode/data`, trả status và body thô cho test kiểm tra | Tất cả case API và luồng | - | - |
| `src/api/auth.client.ts` | client | Đăng nhập lấy access token và refresh token theo role; không dùng làm đối tượng test | Tất cả case API và luồng | POST /api/auth/login | src/api/http.client.ts |
| `src/api/lead.client.ts` | client | Một hàm cho mỗi API Lead trong báo cáo; multipart cho API có file | Case `tests/api/leads/`, các file luồng và chuẩn bị dữ liệu UI | 20 API của Lead | src/api/http.client.ts |
| `src/api/schemas/lead.schema.ts` | schema | Schema zod cho response của API Lead theo Swagger (`StatusView`, `meta.pagination`) | Case Response contract của `tests/api/leads/` | - | zod |
| `src/api/contract.client.ts` | client | Một hàm cho mỗi API Hợp đồng khách hàng trong báo cáo; multipart cho API có file | Case `tests/api/customer-contracts/`, các file luồng và chuẩn bị dữ liệu UI | 19 API của Hợp đồng khách hàng | src/api/http.client.ts |
| `src/api/schemas/contract.schema.ts` | schema | Schema zod cho response của API Hợp đồng khách hàng theo Swagger (`StatusView`, `meta.pagination`) | Case Response contract của `tests/api/customer-contracts/` | - | zod |
| `src/api/customer.client.ts` | client | Một hàm cho mỗi API Khách hàng trong báo cáo; multipart cho API có file | Case `tests/api/customers/`, các file luồng và chuẩn bị dữ liệu UI | 14 API của Khách hàng | src/api/http.client.ts |
| `src/api/schemas/customer.schema.ts` | schema | Schema zod cho response của API Khách hàng theo Swagger (`StatusView`, `meta.pagination`) | Case Response contract của `tests/api/customers/` | - | zod |
| `src/api/contractor.client.ts` | client | Một hàm cho mỗi API Nhà thầu trong báo cáo; multipart cho API có file | Case `tests/api/contractors/`, các file luồng và chuẩn bị dữ liệu UI | 17 API của Nhà thầu | src/api/http.client.ts |
| `src/api/schemas/contractor.schema.ts` | schema | Schema zod cho response của API Nhà thầu theo Swagger (`StatusView`, `meta.pagination`) | Case Response contract của `tests/api/contractors/` | - | zod |
| `src/api/contractor-contract.client.ts` | client | Một hàm cho mỗi API Hợp đồng nhà thầu trong báo cáo; multipart cho API có file | Case `tests/api/contractor-contracts/`, các file luồng và chuẩn bị dữ liệu UI | 18 API của Hợp đồng nhà thầu | src/api/http.client.ts |
| `src/api/schemas/contractor-contract.schema.ts` | schema | Schema zod cho response của API Hợp đồng nhà thầu theo Swagger (`StatusView`, `meta.pagination`) | Case Response contract của `tests/api/contractor-contracts/` | - | zod |
| `src/api/schemas/common.schema.ts` | schema | Schema wrapper thành công, `ApiError`, `StatusView`, `meta.pagination` dùng chung | Tất cả case Response contract và Error handling | - | zod |
| `src/pages/login.page.ts` | page | Màn đăng nhập web; dùng ở setup và case Session | Case trong tests/ui/common, tests/ui/contractor-contract, tests/ui/contractor-detail, tests/ui/contractor-list, tests/ui/customer-contract, tests/ui/customers, tests/ui/lead-form, tests/ui/lead-list | - | src/pages/components/ |
| `src/pages/lead-list.page.ts` | page | Danh sách Lead: ô số liệu, tìm kiếm, bộ lọc, bảng, import, xuất Excel | Case trong tests/ui/lead-list | - | src/pages/components/ |
| `src/pages/lead-form.page.ts` | page | Form thêm và sửa Lead, popup đầu mối, ngành Khác | Case trong tests/ui/lead-form | - | src/pages/components/ |
| `src/pages/lead-detail.page.ts` | page | Chi tiết Lead: nút theo trạng thái, ngưng, kích hoạt, chuyển người phụ trách, tài liệu | Case trong tests/ui/lead-form | - | src/pages/components/ |
| `src/pages/contract-upload.page.ts` | page | Form upload HĐ đầu tiên: chọn Lead, ngày, điều khoản, file scan, phụ lục | Case trong tests/ui/customer-contract | - | src/pages/components/ |
| `src/pages/contract-detail.page.ts` | page | Chi tiết và danh sách HĐ khách hàng: nút theo `availableActions`, popup sửa, gia hạn, tái ký, hủy, dừng, phụ lục, badge kỳ hạn | Case trong tests/ui/customer-contract | - | src/pages/components/ |
| `src/pages/customer-list.page.ts` | page | Danh sách khách hàng: tìm, lọc, bảng | Case trong tests/ui/customers | - | src/pages/components/ |
| `src/pages/customer-detail.page.ts` | page | Chi tiết khách hàng: sửa hồ sơ, đầu mối, hạn mức, đổi hạng, chuyển người phụ trách, HĐ hiện hành | Case trong tests/ui/customers | - | src/pages/components/ |
| `src/pages/contractor-list.page.ts` | page | Danh sách nhà thầu: ô số liệu, bộ lọc, bảng, xuất Excel | Case trong tests/ui/contractor-list | - | src/pages/components/ |
| `src/pages/contractor-form.page.ts` | page | Form thêm và sửa nhà thầu, tài liệu ở form tạo | Case trong tests/ui/contractor-list | - | src/pages/components/ |
| `src/pages/contractor-detail.page.ts` | page | Chi tiết nhà thầu: các tab Thông tin, Hợp đồng, Bảng giá dịch vụ, Lịch sử; popup đầu mối, đổi hạng, dừng hợp tác, kích hoạt lại, xóa | Case trong tests/ui/contractor-detail | - | src/pages/components/ |
| `src/pages/purchase-price-form.page.ts` | page | Form Thêm mới bảng giá mua, chỉ dùng cho case UI-VDRD-005 | Case trong tests/ui/contractor-detail | - | src/pages/components/ |
| `src/pages/contractor-contract-form.page.ts` | page | Form thêm và tái ký HĐ nhà thầu: chế độ, ô chọn nhà thầu, ngày, file, chu kỳ gia hạn | Case trong tests/ui/contractor-contract | - | src/pages/components/ |
| `src/pages/contractor-contract-detail.page.ts` | page | Chi tiết HĐ nhà thầu: nút theo `availableActions`, phụ lục, xem PDF, popup gia hạn, tái ký, hủy, dừng, cấu hình gia hạn, badge kỳ hạn | Case trong tests/ui/contractor-contract | - | src/pages/components/ |
| `src/pages/components/data-table.component.ts` | page | Bảng dữ liệu dùng chung: đọc dòng, phân trang, đổi số dòng mỗi trang | Case trong tests/ui/common, tests/ui/contractor-contract, tests/ui/contractor-detail, tests/ui/contractor-list, tests/ui/customer-contract, tests/ui/customers, tests/ui/lead-form, tests/ui/lead-list | - | - |
| `src/pages/components/filter-bar.component.ts` | page | Ô tìm kiếm và bộ lọc dùng chung, gồm khoảng ngày và nút Reset | Case trong tests/ui/common, tests/ui/contractor-contract, tests/ui/contractor-detail, tests/ui/contractor-list, tests/ui/customer-contract, tests/ui/customers, tests/ui/lead-form, tests/ui/lead-list | - | - |
| `src/pages/components/modal.component.ts` | page | Popup xác nhận, nhập lý do, Đồng ý và Hủy | Case trong tests/ui/common, tests/ui/contractor-contract, tests/ui/contractor-detail, tests/ui/contractor-list, tests/ui/customer-contract, tests/ui/customers, tests/ui/lead-form, tests/ui/lead-list | - | - |
| `src/pages/components/toast.component.ts` | page | Đọc thông báo thành công và lỗi | Case trong tests/ui/common, tests/ui/contractor-contract, tests/ui/contractor-detail, tests/ui/contractor-list, tests/ui/customer-contract, tests/ui/customers, tests/ui/lead-form, tests/ui/lead-list | - | - |
| `src/pages/components/file-upload.component.ts` | page | Ô chọn file, đọc lỗi định dạng và dung lượng | Case trong tests/ui/common, tests/ui/contractor-contract, tests/ui/contractor-detail, tests/ui/contractor-list, tests/ui/customer-contract, tests/ui/customers, tests/ui/lead-form, tests/ui/lead-list | - | - |
| `src/fixtures/auth.fixture.ts` | fixture | Đọc storageState và token theo role: `nvkdA`, `nvkdB`, `dvkhA`, `dvkhB`, `qlnt`; token hỏng, hết hạn, refresh token cho case Authentication | Tất cả | - | src/api/auth.client.ts |
| `src/fixtures/api.fixture.ts` | fixture | Khởi tạo 5 client theo role cho test API và luồng (`leadApi`, `contractApi`, `customerApi`, `contractorApi`, `contractorContractApi`) | Tất cả case API và luồng | - | src/fixtures/auth.fixture.ts |
| `src/fixtures/page.fixture.ts` | fixture | Khởi tạo Page Object theo role đã đăng nhập cho test UI | Tất cả case UI | - | src/fixtures/auth.fixture.ts |
| `src/fixtures/seed.fixture.ts` | fixture | Dựng dữ liệu nền qua API trước từng test: Lead A/I, KH K, HĐ A/P, nhà thầu N/H/D, HĐ V/P; trả id cho test | Tất cả | - | src/data/ |
| `src/data/lead.factory.ts` | data | Lead hợp lệ, MST 10/13 số ngẫu nhiên không trùng, đầu mối, file import xlsx | Case dùng đối tượng này | - | src/utils/test-run.ts |
| `src/data/contract.factory.ts` | data | Body upload và tái ký HĐ khách hàng, bộ ngày theo hôm nay | Case dùng đối tượng này | - | src/utils/test-run.ts |
| `src/data/customer.factory.ts` | data | Body sửa KH, đầu mối, hạn mức | Case dùng đối tượng này | - | src/utils/test-run.ts |
| `src/data/contractor.factory.ts` | data | Nhà thầu hợp lệ, MST ngẫu nhiên, đầu mối | Case dùng đối tượng này | - | src/utils/test-run.ts |
| `src/data/contractor-contract.factory.ts` | data | Body thêm, tái ký, gia hạn HĐ nhà thầu, cấu hình gia hạn | Case dùng đối tượng này | - | src/utils/test-run.ts |
| `src/data/purchase-price.factory.ts` | data | Dữ liệu bảng giá mua cho case UI-VDRD-005 (tên kèm testRunId, 1 dòng giá) | UI-VDRD-005 | - | src/utils/test-run.ts |
| `src/data/file.factory.ts` | data | File mẫu: PDF 1MB, đúng biên 5/10/20MB và vượt 1 byte, DOCX, XLSX, PNG, JPG, ZIP, `.exe`, file đổi đuôi, 0 byte | Case dùng đối tượng này | - | src/utils/test-run.ts |
| `src/data/payloads.ts` | data | Chuỗi `xssPayload`, SQL injection, tên file chứa đường dẫn cho case Input security | Case Input security | - | - |
| `src/mocks/server-error.mock.ts` | mock | `page.route` trả 500 cho case UI lỗi máy chủ | UI-LEADF-007 | - | - |
| `src/utils/test-run.ts` | util | Sinh `testRunId`, gắn vào tên công ty, nhà thầu, HĐ, bảng giá; cung cấp cho cleanup | Tất cả | - | - |
| `src/utils/dates.ts` | util | Ngày nghiệp vụ: hôm nay, ± N ngày, ± N tháng, ngày biên kỳ hạn 7/8/30/31/60/61 | Tất cả | - | - |
| `src/utils/file-check.ts` | util | Đọc header file tải, checksum, mở xlsx đếm dòng | Case File API, Upload/download | - | exceljs |
| `src/utils/cleanup.ts` | util | Dọn dữ liệu có `testRunId` bằng API xóa có sẵn (đầu mối, tài liệu, phụ lục, nhà thầu Tạo mới); chỉ chạy khi `ALLOW_CLEANUP=true` | Tất cả | - | src/api/ |
| `tests/setup/auth.setup.ts` | config | Đăng nhập từng role qua web, lưu storageState vào `.auth/`; các project khác phụ thuộc | - | POST /api/auth/login | src/pages/login.page.ts |
| `tests/api/leads/lead.functional.spec.ts` | test | Lead, đối tượng `lead`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | LEAD-001..LEAD-005, LEAD-014..LEAD-015, LEAD-022..LEAD-027, LEAD-035, LEAD-037..LEAD-041, LEAD-075..LEAD-077, LEAD-081..LEAD-083, LEAD-089..LEAD-090, LEAD-093..LEAD-095, LEAD-097, LEAD-101..LEAD-105, LEAD-219 | `GET /api/leads`, `POST /api/leads`, `GET /api/leads/assignable-owners`, `GET /api/leads/stats`, `GET /api/leads/{id}`, `PUT /api/leads/{id}` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead.validation.spec.ts` | test | Lead, đối tượng `lead`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | LEAD-006..LEAD-007, LEAD-013, LEAD-016..LEAD-021, LEAD-034, LEAD-036, LEAD-044, LEAD-080, LEAD-085, LEAD-088, LEAD-091..LEAD-092, LEAD-100 | `GET /api/leads`, `POST /api/leads`, `GET /api/leads/assignable-owners`, `GET /api/leads/stats`, `GET /api/leads/{id}`, `PUT /api/leads/{id}` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead.contract.spec.ts` | test | Lead, đối tượng `lead`: So response với schema Swagger (zod) | LEAD-008, LEAD-031, LEAD-042, LEAD-078, LEAD-086, LEAD-098 | `GET /api/leads`, `POST /api/leads`, `GET /api/leads/assignable-owners`, `GET /api/leads/stats`, `GET /api/leads/{id}`, `PUT /api/leads/{id}` | src/api/lead.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/lead.schema.ts |
| `tests/api/leads/lead.security.spec.ts` | test | Lead, đối tượng `lead`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | LEAD-009..LEAD-012, LEAD-030, LEAD-032..LEAD-033, LEAD-043, LEAD-079, LEAD-084, LEAD-087, LEAD-096, LEAD-099 | `GET /api/leads`, `POST /api/leads`, `GET /api/leads/assignable-owners`, `GET /api/leads/stats`, `GET /api/leads/{id}`, `PUT /api/leads/{id}` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead.concurrency.spec.ts` | test | Lead, đối tượng `lead`: Gọi lặp và gọi đồng thời | LEAD-028..LEAD-029 | `POST /api/leads` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-import-export.functional.spec.ts` | test | Lead, đối tượng `lead-import-export`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | LEAD-045, LEAD-047..LEAD-049, LEAD-055..LEAD-058, LEAD-062, LEAD-068..LEAD-069 | `GET /api/leads/export`, `POST /api/leads/import`, `GET /api/leads/import-template` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-import-export.integration.spec.ts` | test | Lead, đối tượng `lead-import-export`: Upload, tải và xuất file | LEAD-046, LEAD-059, LEAD-070..LEAD-071 | `GET /api/leads/export`, `POST /api/leads/import`, `GET /api/leads/import-template` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-import-export.validation.spec.ts` | test | Lead, đối tượng `lead-import-export`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | LEAD-050..LEAD-051, LEAD-054, LEAD-060..LEAD-061, LEAD-065, LEAD-074 | `GET /api/leads/export`, `POST /api/leads/import`, `GET /api/leads/import-template` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-import-export.contract.spec.ts` | test | Lead, đối tượng `lead-import-export`: So response với schema Swagger (zod) | LEAD-052, LEAD-066, LEAD-072 | `GET /api/leads/export`, `POST /api/leads/import`, `GET /api/leads/import-template` | src/api/lead.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/lead.schema.ts |
| `tests/api/leads/lead-import-export.security.spec.ts` | test | Lead, đối tượng `lead-import-export`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | LEAD-053, LEAD-064, LEAD-067, LEAD-073 | `GET /api/leads/export`, `POST /api/leads/import`, `GET /api/leads/import-template` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-import-export.concurrency.spec.ts` | test | Lead, đối tượng `lead-import-export`: Gọi lặp và gọi đồng thời | LEAD-063 | `POST /api/leads/import` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-contacts.functional.spec.ts` | test | Lead, đối tượng `lead-contacts`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | LEAD-106, LEAD-109..LEAD-110, LEAD-112, LEAD-117..LEAD-118, LEAD-121..LEAD-122, LEAD-124, LEAD-129..LEAD-131, LEAD-134, LEAD-139..LEAD-140, LEAD-143 | `POST /api/leads/{id}/contacts`, `PUT /api/leads/{id}/contacts/{contactId}`, `DELETE /api/leads/{id}/contacts/{contactId}`, `POST /api/leads/{id}/contacts/{contactId}/primary` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-contacts.validation.spec.ts` | test | Lead, đối tượng `lead-contacts`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | LEAD-107..LEAD-108, LEAD-116, LEAD-119..LEAD-120, LEAD-125, LEAD-128, LEAD-132, LEAD-135, LEAD-138, LEAD-144, LEAD-147 | `POST /api/leads/{id}/contacts`, `PUT /api/leads/{id}/contacts/{contactId}`, `DELETE /api/leads/{id}/contacts/{contactId}`, `POST /api/leads/{id}/contacts/{contactId}/primary` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-contacts.security.spec.ts` | test | Lead, đối tượng `lead-contacts`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | LEAD-111, LEAD-115, LEAD-123, LEAD-127, LEAD-133, LEAD-137, LEAD-142, LEAD-146 | `POST /api/leads/{id}/contacts`, `PUT /api/leads/{id}/contacts/{contactId}`, `DELETE /api/leads/{id}/contacts/{contactId}`, `POST /api/leads/{id}/contacts/{contactId}/primary` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-contacts.concurrency.spec.ts` | test | Lead, đối tượng `lead-contacts`: Gọi lặp và gọi đồng thời | LEAD-113, LEAD-141 | `POST /api/leads/{id}/contacts`, `POST /api/leads/{id}/contacts/{contactId}/primary` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-contacts.contract.spec.ts` | test | Lead, đối tượng `lead-contacts`: So response với schema Swagger (zod) | LEAD-114, LEAD-126, LEAD-136, LEAD-145 | `POST /api/leads/{id}/contacts`, `PUT /api/leads/{id}/contacts/{contactId}`, `DELETE /api/leads/{id}/contacts/{contactId}`, `POST /api/leads/{id}/contacts/{contactId}/primary` | src/api/lead.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/lead.schema.ts |
| `tests/api/leads/lead-lifecycle.functional.spec.ts` | test | Lead, đối tượng `lead-lifecycle`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | LEAD-148..LEAD-149, LEAD-152, LEAD-155, LEAD-195..LEAD-197, LEAD-200, LEAD-205..LEAD-206, LEAD-209..LEAD-211, LEAD-213 | `POST /api/leads/{id}/deactivate`, `POST /api/leads/{id}/reactivate`, `POST /api/leads/{id}/transfer-owner` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-lifecycle.validation.spec.ts` | test | Lead, đối tượng `lead-lifecycle`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | LEAD-150..LEAD-151, LEAD-158, LEAD-201, LEAD-204, LEAD-207..LEAD-208, LEAD-218 | `POST /api/leads/{id}/deactivate`, `POST /api/leads/{id}/reactivate`, `POST /api/leads/{id}/transfer-owner` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-lifecycle.concurrency.spec.ts` | test | Lead, đối tượng `lead-lifecycle`: Gọi lặp và gọi đồng thời | LEAD-153, LEAD-198, LEAD-214..LEAD-215 | `POST /api/leads/{id}/deactivate`, `POST /api/leads/{id}/reactivate`, `POST /api/leads/{id}/transfer-owner` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-lifecycle.security.spec.ts` | test | Lead, đối tượng `lead-lifecycle`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | LEAD-154, LEAD-157, LEAD-199, LEAD-203, LEAD-212, LEAD-217 | `POST /api/leads/{id}/deactivate`, `POST /api/leads/{id}/reactivate`, `POST /api/leads/{id}/transfer-owner` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-lifecycle.contract.spec.ts` | test | Lead, đối tượng `lead-lifecycle`: So response với schema Swagger (zod) | LEAD-156, LEAD-202, LEAD-216 | `POST /api/leads/{id}/deactivate`, `POST /api/leads/{id}/reactivate`, `POST /api/leads/{id}/transfer-owner` | src/api/lead.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/lead.schema.ts |
| `tests/api/leads/lead-documents.functional.spec.ts` | test | Lead, đối tượng `lead-documents`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | LEAD-159, LEAD-164, LEAD-166, LEAD-172, LEAD-179..LEAD-180, LEAD-182 | `POST /api/leads/{id}/documents`, `GET /api/leads/{id}/documents/{documentId}`, `DELETE /api/leads/{id}/documents/{documentId}` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-documents.integration.spec.ts` | test | Lead, đối tượng `lead-documents`: Upload, tải và xuất file | LEAD-160..LEAD-161, LEAD-173 | `POST /api/leads/{id}/documents`, `GET /api/leads/{id}/documents/{documentId}` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-documents.validation.spec.ts` | test | Lead, đối tượng `lead-documents`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | LEAD-162..LEAD-163, LEAD-171, LEAD-176, LEAD-178, LEAD-183, LEAD-186 | `POST /api/leads/{id}/documents`, `GET /api/leads/{id}/documents/{documentId}`, `DELETE /api/leads/{id}/documents/{documentId}` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-documents.security.spec.ts` | test | Lead, đối tượng `lead-documents`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | LEAD-165, LEAD-168, LEAD-170, LEAD-174, LEAD-177, LEAD-181, LEAD-185 | `POST /api/leads/{id}/documents`, `GET /api/leads/{id}/documents/{documentId}`, `DELETE /api/leads/{id}/documents/{documentId}` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-documents.concurrency.spec.ts` | test | Lead, đối tượng `lead-documents`: Gọi lặp và gọi đồng thời | LEAD-167 | `POST /api/leads/{id}/documents` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-documents.contract.spec.ts` | test | Lead, đối tượng `lead-documents`: So response với schema Swagger (zod) | LEAD-169, LEAD-175, LEAD-184 | `POST /api/leads/{id}/documents`, `GET /api/leads/{id}/documents/{documentId}`, `DELETE /api/leads/{id}/documents/{documentId}` | src/api/lead.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/lead.schema.ts |
| `tests/api/leads/lead-history.functional.spec.ts` | test | Lead, đối tượng `lead-history`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | LEAD-187..LEAD-188 | `GET /api/leads/{id}/history` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-history.validation.spec.ts` | test | Lead, đối tượng `lead-history`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | LEAD-189..LEAD-190, LEAD-194 | `GET /api/leads/{id}/history` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-history.security.spec.ts` | test | Lead, đối tượng `lead-history`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | LEAD-191, LEAD-193 | `GET /api/leads/{id}/history` | src/api/lead.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/leads/lead-history.contract.spec.ts` | test | Lead, đối tượng `lead-history`: So response với schema Swagger (zod) | LEAD-192 | `GET /api/leads/{id}/history` | src/api/lead.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/lead.schema.ts |
| `tests/api/customer-contracts/contract.functional.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTR-001..CTR-006, CTR-014..CTR-015, CTR-021..CTR-025, CTR-033..CTR-034, CTR-048, CTR-050, CTR-054..CTR-056, CTR-062..CTR-063, CTR-069..CTR-072, CTR-076, CTR-192..CTR-193 | `GET /api/contracts`, `POST /api/contracts`, `GET /api/contracts/assignable-managers`, `GET /api/contracts/stats`, `GET /api/contracts/uploadable-customers`, `GET /api/contracts/{id}`, `PUT /api/contracts/{id}` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract.validation.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTR-007..CTR-008, CTR-013, CTR-016..CTR-020, CTR-032, CTR-037, CTR-049, CTR-053, CTR-057..CTR-058, CTR-061, CTR-065, CTR-068, CTR-073..CTR-074, CTR-079 | `GET /api/contracts`, `POST /api/contracts`, `GET /api/contracts/assignable-managers`, `GET /api/contracts/stats`, `GET /api/contracts/uploadable-customers`, `GET /api/contracts/{id}`, `PUT /api/contracts/{id}` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract.contract.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract`: So response với schema Swagger (zod) | CTR-009, CTR-030, CTR-035, CTR-051, CTR-059, CTR-066, CTR-077 | `GET /api/contracts`, `POST /api/contracts`, `GET /api/contracts/assignable-managers`, `GET /api/contracts/stats`, `GET /api/contracts/uploadable-customers`, `GET /api/contracts/{id}`, `PUT /api/contracts/{id}` | src/api/contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contract.schema.ts |
| `tests/api/customer-contracts/contract.security.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTR-010..CTR-012, CTR-029, CTR-031, CTR-036, CTR-052, CTR-060, CTR-064, CTR-067, CTR-075, CTR-078 | `GET /api/contracts`, `POST /api/contracts`, `GET /api/contracts/assignable-managers`, `GET /api/contracts/stats`, `GET /api/contracts/uploadable-customers`, `GET /api/contracts/{id}`, `PUT /api/contracts/{id}` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract.concurrency.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract`: Gọi lặp và gọi đồng thời | CTR-026..CTR-027 | `POST /api/contracts` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract.integration.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract`: Upload, tải và xuất file | CTR-028 | `POST /api/contracts` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-export.functional.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-export`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTR-038, CTR-040..CTR-042 | `GET /api/contracts/export` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-export.integration.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-export`: Upload, tải và xuất file | CTR-039 | `GET /api/contracts/export` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-export.validation.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-export`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTR-043..CTR-044, CTR-047 | `GET /api/contracts/export` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-export.contract.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-export`: So response với schema Swagger (zod) | CTR-045 | `GET /api/contracts/export` | src/api/contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contract.schema.ts |
| `tests/api/customer-contracts/contract-export.security.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-export`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTR-046 | `GET /api/contracts/export` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-annexes`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTR-080, CTR-084, CTR-086, CTR-091..CTR-093, CTR-097, CTR-102..CTR-104, CTR-106, CTR-111 | `POST /api/contracts/{id}/annexes`, `PUT /api/contracts/{id}/annexes/{annexId}`, `DELETE /api/contracts/{id}/annexes/{annexId}`, `GET /api/contracts/{id}/annexes/{annexId}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-annexes`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTR-081..CTR-082, CTR-090, CTR-094..CTR-095, CTR-098, CTR-101, CTR-107, CTR-110, CTR-115, CTR-117 | `POST /api/contracts/{id}/annexes`, `PUT /api/contracts/{id}/annexes/{annexId}`, `DELETE /api/contracts/{id}/annexes/{annexId}`, `GET /api/contracts/{id}/annexes/{annexId}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-annexes.integration.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-annexes`: Upload, tải và xuất file | CTR-083, CTR-112 | `POST /api/contracts/{id}/annexes`, `GET /api/contracts/{id}/annexes/{annexId}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-annexes.security.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-annexes`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTR-085, CTR-089, CTR-096, CTR-100, CTR-105, CTR-109, CTR-113, CTR-116 | `POST /api/contracts/{id}/annexes`, `PUT /api/contracts/{id}/annexes/{annexId}`, `DELETE /api/contracts/{id}/annexes/{annexId}`, `GET /api/contracts/{id}/annexes/{annexId}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-annexes.concurrency.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-annexes`: Gọi lặp và gọi đồng thời | CTR-087 | `POST /api/contracts/{id}/annexes` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-annexes.contract.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-annexes`: So response với schema Swagger (zod) | CTR-088, CTR-099, CTR-108, CTR-114 | `POST /api/contracts/{id}/annexes`, `PUT /api/contracts/{id}/annexes/{annexId}`, `DELETE /api/contracts/{id}/annexes/{annexId}`, `GET /api/contracts/{id}/annexes/{annexId}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contract.schema.ts |
| `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-lifecycle`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTR-118..CTR-121, CTR-126, CTR-130, CTR-132..CTR-134, CTR-140, CTR-166..CTR-171, CTR-176, CTR-181..CTR-182, CTR-185, CTR-188 | `POST /api/contracts/{id}/cancel`, `POST /api/contracts/{id}/extensions`, `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/suspend` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-lifecycle`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTR-122..CTR-123, CTR-129, CTR-135..CTR-136, CTR-143, CTR-172..CTR-173, CTR-180, CTR-183..CTR-184, CTR-191 | `POST /api/contracts/{id}/cancel`, `POST /api/contracts/{id}/extensions`, `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/suspend` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-lifecycle`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTR-124, CTR-128, CTR-138, CTR-142, CTR-174, CTR-179, CTR-186, CTR-190 | `POST /api/contracts/{id}/cancel`, `POST /api/contracts/{id}/extensions`, `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/suspend` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-lifecycle`: Gọi lặp và gọi đồng thời | CTR-125, CTR-139, CTR-175, CTR-187 | `POST /api/contracts/{id}/cancel`, `POST /api/contracts/{id}/extensions`, `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/suspend` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-lifecycle`: So response với schema Swagger (zod) | CTR-127, CTR-141, CTR-178, CTR-189 | `POST /api/contracts/{id}/cancel`, `POST /api/contracts/{id}/extensions`, `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/suspend` | src/api/contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contract.schema.ts |
| `tests/api/customer-contracts/contract-lifecycle.integration.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-lifecycle`: Upload, tải và xuất file | CTR-137, CTR-177 | `POST /api/contracts/{id}/extensions`, `POST /api/contracts/{id}/resign` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-files.functional.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-files`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTR-144, CTR-151 | `GET /api/contracts/{id}/extensions/{sequence}/file`, `GET /api/contracts/{id}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-files.integration.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-files`: Upload, tải và xuất file | CTR-145, CTR-152 | `GET /api/contracts/{id}/extensions/{sequence}/file`, `GET /api/contracts/{id}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-files.security.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-files`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTR-146, CTR-149, CTR-153, CTR-156 | `GET /api/contracts/{id}/extensions/{sequence}/file`, `GET /api/contracts/{id}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-files.contract.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-files`: So response với schema Swagger (zod) | CTR-147, CTR-154 | `GET /api/contracts/{id}/extensions/{sequence}/file`, `GET /api/contracts/{id}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contract.schema.ts |
| `tests/api/customer-contracts/contract-files.validation.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-files`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTR-148, CTR-150, CTR-155, CTR-157 | `GET /api/contracts/{id}/extensions/{sequence}/file`, `GET /api/contracts/{id}/file` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-history.functional.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-history`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTR-158..CTR-159 | `GET /api/contracts/{id}/history` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-history.validation.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-history`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTR-160..CTR-161, CTR-165 | `GET /api/contracts/{id}/history` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-history.security.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-history`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTR-162, CTR-164 | `GET /api/contracts/{id}/history` | src/api/contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customer-contracts/contract-history.contract.spec.ts` | test | Hợp đồng khách hàng, đối tượng `contract-history`: So response với schema Swagger (zod) | CTR-163 | `GET /api/contracts/{id}/history` | src/api/contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contract.schema.ts |
| `tests/api/customers/customer.functional.spec.ts` | test | Khách hàng, đối tượng `customer`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CUS-001..CUS-005, CUS-014..CUS-015, CUS-028..CUS-029, CUS-035..CUS-041, CUS-045 | `GET /api/customers`, `GET /api/customers/assignable-managers`, `GET /api/customers/{id}`, `PUT /api/customers/{id}` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer.validation.spec.ts` | test | Khách hàng, đối tượng `customer`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CUS-006..CUS-007, CUS-013, CUS-018, CUS-031, CUS-034, CUS-042..CUS-043, CUS-048 | `GET /api/customers`, `GET /api/customers/assignable-managers`, `GET /api/customers/{id}`, `PUT /api/customers/{id}` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer.contract.spec.ts` | test | Khách hàng, đối tượng `customer`: So response với schema Swagger (zod) | CUS-008, CUS-016, CUS-032, CUS-046 | `GET /api/customers`, `GET /api/customers/assignable-managers`, `GET /api/customers/{id}`, `PUT /api/customers/{id}` | src/api/customer.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/customer.schema.ts |
| `tests/api/customers/customer.security.spec.ts` | test | Khách hàng, đối tượng `customer`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CUS-009..CUS-012, CUS-017, CUS-030, CUS-033, CUS-044, CUS-047 | `GET /api/customers`, `GET /api/customers/assignable-managers`, `GET /api/customers/{id}`, `PUT /api/customers/{id}` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-export.functional.spec.ts` | test | Khách hàng, đối tượng `customer-export`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CUS-019, CUS-021..CUS-022 | `GET /api/customers/export` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-export.integration.spec.ts` | test | Khách hàng, đối tượng `customer-export`: Upload, tải và xuất file | CUS-020 | `GET /api/customers/export` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-export.validation.spec.ts` | test | Khách hàng, đối tượng `customer-export`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CUS-023..CUS-024, CUS-027 | `GET /api/customers/export` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-export.contract.spec.ts` | test | Khách hàng, đối tượng `customer-export`: So response với schema Swagger (zod) | CUS-025 | `GET /api/customers/export` | src/api/customer.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/customer.schema.ts |
| `tests/api/customers/customer-export.security.spec.ts` | test | Khách hàng, đối tượng `customer-export`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CUS-026 | `GET /api/customers/export` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-contacts.functional.spec.ts` | test | Khách hàng, đối tượng `customer-contacts`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CUS-049..CUS-050, CUS-054, CUS-059..CUS-061, CUS-065, CUS-070..CUS-072, CUS-075, CUS-080..CUS-081, CUS-084 | `POST /api/customers/{id}/contacts`, `PUT /api/customers/{id}/contacts/{contactId}`, `DELETE /api/customers/{id}/contacts/{contactId}`, `POST /api/customers/{id}/contacts/{contactId}/primary` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-contacts.validation.spec.ts` | test | Khách hàng, đối tượng `customer-contacts`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CUS-051..CUS-052, CUS-058, CUS-062..CUS-063, CUS-066, CUS-069, CUS-073, CUS-076, CUS-079, CUS-085, CUS-088 | `POST /api/customers/{id}/contacts`, `PUT /api/customers/{id}/contacts/{contactId}`, `DELETE /api/customers/{id}/contacts/{contactId}`, `POST /api/customers/{id}/contacts/{contactId}/primary` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-contacts.security.spec.ts` | test | Khách hàng, đối tượng `customer-contacts`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CUS-053, CUS-057, CUS-064, CUS-068, CUS-074, CUS-078, CUS-083, CUS-087 | `POST /api/customers/{id}/contacts`, `PUT /api/customers/{id}/contacts/{contactId}`, `DELETE /api/customers/{id}/contacts/{contactId}`, `POST /api/customers/{id}/contacts/{contactId}/primary` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-contacts.concurrency.spec.ts` | test | Khách hàng, đối tượng `customer-contacts`: Gọi lặp và gọi đồng thời | CUS-055, CUS-082 | `POST /api/customers/{id}/contacts`, `POST /api/customers/{id}/contacts/{contactId}/primary` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-contacts.contract.spec.ts` | test | Khách hàng, đối tượng `customer-contacts`: So response với schema Swagger (zod) | CUS-056, CUS-067, CUS-077, CUS-086 | `POST /api/customers/{id}/contacts`, `PUT /api/customers/{id}/contacts/{contactId}`, `DELETE /api/customers/{id}/contacts/{contactId}`, `POST /api/customers/{id}/contacts/{contactId}/primary` | src/api/customer.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/customer.schema.ts |
| `tests/api/customers/customer-account.functional.spec.ts` | test | Khách hàng, đối tượng `customer-account`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CUS-089, CUS-092, CUS-094, CUS-113..CUS-114, CUS-118, CUS-122..CUS-124, CUS-128, CUS-134 | `PUT /api/customers/{id}/credit-limit`, `PUT /api/customers/{id}/tier`, `POST /api/customers/{id}/transfer-account-manager` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-account.validation.spec.ts` | test | Khách hàng, đối tượng `customer-account`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CUS-090..CUS-091, CUS-097, CUS-115..CUS-116, CUS-121, CUS-125..CUS-126, CUS-133 | `PUT /api/customers/{id}/credit-limit`, `PUT /api/customers/{id}/tier`, `POST /api/customers/{id}/transfer-account-manager` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-account.security.spec.ts` | test | Khách hàng, đối tượng `customer-account`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CUS-093, CUS-096, CUS-117, CUS-120, CUS-127, CUS-132, CUS-135 | `PUT /api/customers/{id}/credit-limit`, `PUT /api/customers/{id}/tier`, `POST /api/customers/{id}/transfer-account-manager` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-account.contract.spec.ts` | test | Khách hàng, đối tượng `customer-account`: So response với schema Swagger (zod) | CUS-095, CUS-119, CUS-131 | `PUT /api/customers/{id}/credit-limit`, `PUT /api/customers/{id}/tier`, `POST /api/customers/{id}/transfer-account-manager` | src/api/customer.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/customer.schema.ts |
| `tests/api/customers/customer-documents.functional.spec.ts` | test | Khách hàng, đối tượng `customer-documents`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CUS-098 | `GET /api/customers/{id}/documents/{documentId}` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-documents.integration.spec.ts` | test | Khách hàng, đối tượng `customer-documents`: Upload, tải và xuất file | CUS-099 | `GET /api/customers/{id}/documents/{documentId}` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-documents.security.spec.ts` | test | Khách hàng, đối tượng `customer-documents`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CUS-100, CUS-103 | `GET /api/customers/{id}/documents/{documentId}` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-documents.contract.spec.ts` | test | Khách hàng, đối tượng `customer-documents`: So response với schema Swagger (zod) | CUS-101 | `GET /api/customers/{id}/documents/{documentId}` | src/api/customer.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/customer.schema.ts |
| `tests/api/customers/customer-documents.validation.spec.ts` | test | Khách hàng, đối tượng `customer-documents`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CUS-102, CUS-104 | `GET /api/customers/{id}/documents/{documentId}` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-history.functional.spec.ts` | test | Khách hàng, đối tượng `customer-history`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CUS-105..CUS-106 | `GET /api/customers/{id}/history` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-history.validation.spec.ts` | test | Khách hàng, đối tượng `customer-history`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CUS-107..CUS-108, CUS-112 | `GET /api/customers/{id}/history` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-history.security.spec.ts` | test | Khách hàng, đối tượng `customer-history`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CUS-109, CUS-111 | `GET /api/customers/{id}/history` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/customers/customer-history.contract.spec.ts` | test | Khách hàng, đối tượng `customer-history`: So response với schema Swagger (zod) | CUS-110 | `GET /api/customers/{id}/history` | src/api/customer.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/customer.schema.ts |
| `tests/api/customers/customer-account.concurrency.spec.ts` | test | Khách hàng, đối tượng `customer-account`: Gọi lặp và gọi đồng thời | CUS-129..CUS-130 | `POST /api/customers/{id}/transfer-account-manager` | src/api/customer.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor.functional.spec.ts` | test | Nhà thầu, đối tượng `contractor`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | VDR-001..VDR-004, VDR-013..VDR-014, VDR-020..VDR-023, VDR-031, VDR-041..VDR-043, VDR-047..VDR-048, VDR-054..VDR-057, VDR-061, VDR-065..VDR-067, VDR-069..VDR-070, VDR-180 | `GET /api/contractors`, `POST /api/contractors`, `GET /api/contractors/stats`, `GET /api/contractors/{id}`, `PUT /api/contractors/{id}`, `DELETE /api/contractors/{id}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor.validation.spec.ts` | test | Nhà thầu, đối tượng `contractor`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | VDR-005..VDR-006, VDR-012, VDR-015..VDR-019, VDR-030, VDR-046, VDR-050, VDR-053, VDR-058..VDR-059, VDR-064, VDR-071, VDR-074 | `GET /api/contractors`, `POST /api/contractors`, `GET /api/contractors/stats`, `GET /api/contractors/{id}`, `PUT /api/contractors/{id}`, `DELETE /api/contractors/{id}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor.contract.spec.ts` | test | Nhà thầu, đối tượng `contractor`: So response với schema Swagger (zod) | VDR-007, VDR-028, VDR-044, VDR-051, VDR-062, VDR-072 | `GET /api/contractors`, `POST /api/contractors`, `GET /api/contractors/stats`, `GET /api/contractors/{id}`, `PUT /api/contractors/{id}`, `DELETE /api/contractors/{id}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor.schema.ts |
| `tests/api/contractors/contractor.security.spec.ts` | test | Nhà thầu, đối tượng `contractor`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | VDR-008..VDR-011, VDR-026..VDR-027, VDR-029, VDR-045, VDR-049, VDR-052, VDR-060, VDR-063, VDR-068, VDR-073 | `GET /api/contractors`, `POST /api/contractors`, `GET /api/contractors/stats`, `GET /api/contractors/{id}`, `PUT /api/contractors/{id}`, `DELETE /api/contractors/{id}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor.concurrency.spec.ts` | test | Nhà thầu, đối tượng `contractor`: Gọi lặp và gọi đồng thời | VDR-024..VDR-025 | `POST /api/contractors` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-export.functional.spec.ts` | test | Nhà thầu, đối tượng `contractor-export`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | VDR-032, VDR-034..VDR-035 | `GET /api/contractors/export` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-export.integration.spec.ts` | test | Nhà thầu, đối tượng `contractor-export`: Upload, tải và xuất file | VDR-033 | `GET /api/contractors/export` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-export.validation.spec.ts` | test | Nhà thầu, đối tượng `contractor-export`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | VDR-036..VDR-037, VDR-040 | `GET /api/contractors/export` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-export.contract.spec.ts` | test | Nhà thầu, đối tượng `contractor-export`: So response với schema Swagger (zod) | VDR-038 | `GET /api/contractors/export` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor.schema.ts |
| `tests/api/contractors/contractor-export.security.spec.ts` | test | Nhà thầu, đối tượng `contractor-export`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | VDR-039 | `GET /api/contractors/export` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-contacts.functional.spec.ts` | test | Nhà thầu, đối tượng `contractor-contacts`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | VDR-075..VDR-077, VDR-081, VDR-086..VDR-087, VDR-091, VDR-096..VDR-097, VDR-100 | `POST /api/contractors/{id}/contacts`, `PUT /api/contractors/{id}/contacts/{contactId}`, `DELETE /api/contractors/{id}/contacts/{contactId}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-contacts.validation.spec.ts` | test | Nhà thầu, đối tượng `contractor-contacts`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | VDR-078..VDR-079, VDR-085, VDR-088..VDR-089, VDR-092, VDR-095, VDR-098, VDR-101, VDR-104 | `POST /api/contractors/{id}/contacts`, `PUT /api/contractors/{id}/contacts/{contactId}`, `DELETE /api/contractors/{id}/contacts/{contactId}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-contacts.security.spec.ts` | test | Nhà thầu, đối tượng `contractor-contacts`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | VDR-080, VDR-084, VDR-090, VDR-094, VDR-099, VDR-103 | `POST /api/contractors/{id}/contacts`, `PUT /api/contractors/{id}/contacts/{contactId}`, `DELETE /api/contractors/{id}/contacts/{contactId}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-contacts.concurrency.spec.ts` | test | Nhà thầu, đối tượng `contractor-contacts`: Gọi lặp và gọi đồng thời | VDR-082 | `POST /api/contractors/{id}/contacts` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-contacts.contract.spec.ts` | test | Nhà thầu, đối tượng `contractor-contacts`: So response với schema Swagger (zod) | VDR-083, VDR-093, VDR-102 | `POST /api/contractors/{id}/contacts`, `PUT /api/contractors/{id}/contacts/{contactId}`, `DELETE /api/contractors/{id}/contacts/{contactId}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor.schema.ts |
| `tests/api/contractors/contractor-documents.functional.spec.ts` | test | Nhà thầu, đối tượng `contractor-documents`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | VDR-105, VDR-110, VDR-112, VDR-118, VDR-125..VDR-126, VDR-128 | `POST /api/contractors/{id}/documents`, `GET /api/contractors/{id}/documents/{documentId}`, `DELETE /api/contractors/{id}/documents/{documentId}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-documents.integration.spec.ts` | test | Nhà thầu, đối tượng `contractor-documents`: Upload, tải và xuất file | VDR-106..VDR-107, VDR-119 | `POST /api/contractors/{id}/documents`, `GET /api/contractors/{id}/documents/{documentId}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-documents.validation.spec.ts` | test | Nhà thầu, đối tượng `contractor-documents`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | VDR-108..VDR-109, VDR-117, VDR-122, VDR-124, VDR-129, VDR-132 | `POST /api/contractors/{id}/documents`, `GET /api/contractors/{id}/documents/{documentId}`, `DELETE /api/contractors/{id}/documents/{documentId}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-documents.security.spec.ts` | test | Nhà thầu, đối tượng `contractor-documents`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | VDR-111, VDR-114, VDR-116, VDR-120, VDR-123, VDR-127, VDR-131 | `POST /api/contractors/{id}/documents`, `GET /api/contractors/{id}/documents/{documentId}`, `DELETE /api/contractors/{id}/documents/{documentId}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-documents.concurrency.spec.ts` | test | Nhà thầu, đối tượng `contractor-documents`: Gọi lặp và gọi đồng thời | VDR-113 | `POST /api/contractors/{id}/documents` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-documents.contract.spec.ts` | test | Nhà thầu, đối tượng `contractor-documents`: So response với schema Swagger (zod) | VDR-115, VDR-121, VDR-130 | `POST /api/contractors/{id}/documents`, `GET /api/contractors/{id}/documents/{documentId}`, `DELETE /api/contractors/{id}/documents/{documentId}` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor.schema.ts |
| `tests/api/contractors/contractor-history.functional.spec.ts` | test | Nhà thầu, đối tượng `contractor-history`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | VDR-133..VDR-134, VDR-141 | `GET /api/contractors/{id}/history` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-history.validation.spec.ts` | test | Nhà thầu, đối tượng `contractor-history`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | VDR-135..VDR-136, VDR-140 | `GET /api/contractors/{id}/history` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-history.security.spec.ts` | test | Nhà thầu, đối tượng `contractor-history`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | VDR-137, VDR-139 | `GET /api/contractors/{id}/history` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-history.contract.spec.ts` | test | Nhà thầu, đối tượng `contractor-history`: So response với schema Swagger (zod) | VDR-138 | `GET /api/contractors/{id}/history` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor.schema.ts |
| `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | test | Nhà thầu, đối tượng `contractor-lifecycle`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | VDR-142..VDR-144, VDR-149, VDR-153..VDR-159, VDR-164, VDR-168..VDR-172, VDR-176 | `POST /api/contractors/{id}/reactivate`, `POST /api/contractors/{id}/terminate`, `PUT /api/contractors/{id}/tier` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | test | Nhà thầu, đối tượng `contractor-lifecycle`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | VDR-145..VDR-146, VDR-152, VDR-160..VDR-161, VDR-167, VDR-173..VDR-174, VDR-179 | `POST /api/contractors/{id}/reactivate`, `POST /api/contractors/{id}/terminate`, `PUT /api/contractors/{id}/tier` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-lifecycle.security.spec.ts` | test | Nhà thầu, đối tượng `contractor-lifecycle`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | VDR-147, VDR-151, VDR-162, VDR-166, VDR-175, VDR-178 | `POST /api/contractors/{id}/reactivate`, `POST /api/contractors/{id}/terminate`, `PUT /api/contractors/{id}/tier` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-lifecycle.concurrency.spec.ts` | test | Nhà thầu, đối tượng `contractor-lifecycle`: Gọi lặp và gọi đồng thời | VDR-148, VDR-163 | `POST /api/contractors/{id}/reactivate`, `POST /api/contractors/{id}/terminate` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractors/contractor-lifecycle.contract.spec.ts` | test | Nhà thầu, đối tượng `contractor-lifecycle`: So response với schema Swagger (zod) | VDR-150, VDR-165, VDR-177 | `POST /api/contractors/{id}/reactivate`, `POST /api/contractors/{id}/terminate`, `PUT /api/contractors/{id}/tier` | src/api/contractor.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor.schema.ts |
| `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTV-001..CTV-004, CTV-013..CTV-014, CTV-019..CTV-021, CTV-029..CTV-031, CTV-033, CTV-038, CTV-040, CTV-044..CTV-046, CTV-052..CTV-056, CTV-060, CTV-196 | `GET /api/contractor-contracts`, `POST /api/contractor-contracts`, `GET /api/contractor-contracts/contractor-options`, `GET /api/contractor-contracts/stats`, `GET /api/contractor-contracts/{id}`, `PUT /api/contractor-contracts/{id}` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTV-005..CTV-006, CTV-012, CTV-015..CTV-018, CTV-028, CTV-032, CTV-034, CTV-037, CTV-039, CTV-043, CTV-048, CTV-051, CTV-057..CTV-058, CTV-063 | `GET /api/contractor-contracts`, `POST /api/contractor-contracts`, `GET /api/contractor-contracts/contractor-options`, `GET /api/contractor-contracts/stats`, `GET /api/contractor-contracts/{id}`, `PUT /api/contractor-contracts/{id}` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract`: So response với schema Swagger (zod) | CTV-007, CTV-026, CTV-035, CTV-041, CTV-049, CTV-061 | `GET /api/contractor-contracts`, `POST /api/contractor-contracts`, `GET /api/contractor-contracts/contractor-options`, `GET /api/contractor-contracts/stats`, `GET /api/contractor-contracts/{id}`, `PUT /api/contractor-contracts/{id}` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor-contract.schema.ts |
| `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTV-008..CTV-011, CTV-025, CTV-027, CTV-036, CTV-042, CTV-047, CTV-050, CTV-059, CTV-062 | `GET /api/contractor-contracts`, `POST /api/contractor-contracts`, `GET /api/contractor-contracts/contractor-options`, `GET /api/contractor-contracts/stats`, `GET /api/contractor-contracts/{id}`, `PUT /api/contractor-contracts/{id}` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract`: Gọi lặp và gọi đồng thời | CTV-022..CTV-023 | `POST /api/contractor-contracts` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract.integration.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract`: Upload, tải và xuất file | CTV-024 | `POST /api/contractor-contracts` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-annexes`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTV-064, CTV-068, CTV-070, CTV-075..CTV-078, CTV-082, CTV-087..CTV-088, CTV-090, CTV-095, CTV-102..CTV-103, CTV-105 | `POST /api/contractor-contracts/{id}/annexes`, `PUT /api/contractor-contracts/{id}/annexes/{annexId}`, `DELETE /api/contractor-contracts/{id}/annexes/{annexId}`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/file`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-annexes`: Upload, tải và xuất file | CTV-065, CTV-096, CTV-104 | `POST /api/contractor-contracts/{id}/annexes`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/file`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-annexes`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTV-066..CTV-067, CTV-074, CTV-079..CTV-080, CTV-083, CTV-086, CTV-091, CTV-094, CTV-099, CTV-101, CTV-108, CTV-110 | `POST /api/contractor-contracts/{id}/annexes`, `PUT /api/contractor-contracts/{id}/annexes/{annexId}`, `DELETE /api/contractor-contracts/{id}/annexes/{annexId}`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/file`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-annexes`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTV-069, CTV-073, CTV-081, CTV-085, CTV-089, CTV-093, CTV-097, CTV-100, CTV-106, CTV-109 | `POST /api/contractor-contracts/{id}/annexes`, `PUT /api/contractor-contracts/{id}/annexes/{annexId}`, `DELETE /api/contractor-contracts/{id}/annexes/{annexId}`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/file`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-annexes.concurrency.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-annexes`: Gọi lặp và gọi đồng thời | CTV-071 | `POST /api/contractor-contracts/{id}/annexes` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-annexes`: So response với schema Swagger (zod) | CTV-072, CTV-084, CTV-092, CTV-098, CTV-107 | `POST /api/contractor-contracts/{id}/annexes`, `PUT /api/contractor-contracts/{id}/annexes/{annexId}`, `DELETE /api/contractor-contracts/{id}/annexes/{annexId}`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/file`, `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor-contract.schema.ts |
| `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-lifecycle`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTV-111..CTV-112, CTV-115..CTV-116, CTV-118, CTV-126..CTV-130, CTV-135, CTV-139, CTV-141..CTV-143, CTV-149, CTV-169..CTV-174, CTV-179, CTV-184..CTV-187, CTV-192 | `PUT /api/contractor-contracts/{id}/auto-renewal`, `POST /api/contractor-contracts/{id}/cancel`, `POST /api/contractor-contracts/{id}/extensions`, `POST /api/contractor-contracts/{id}/resign`, `POST /api/contractor-contracts/{id}/suspend` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-lifecycle`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTV-113..CTV-114, CTV-121, CTV-131..CTV-132, CTV-138, CTV-144..CTV-145, CTV-152, CTV-175..CTV-176, CTV-183, CTV-188..CTV-189, CTV-195 | `PUT /api/contractor-contracts/{id}/auto-renewal`, `POST /api/contractor-contracts/{id}/cancel`, `POST /api/contractor-contracts/{id}/extensions`, `POST /api/contractor-contracts/{id}/resign`, `POST /api/contractor-contracts/{id}/suspend` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-lifecycle`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTV-117, CTV-120, CTV-133, CTV-137, CTV-147, CTV-151, CTV-177, CTV-182, CTV-190, CTV-194 | `PUT /api/contractor-contracts/{id}/auto-renewal`, `POST /api/contractor-contracts/{id}/cancel`, `POST /api/contractor-contracts/{id}/extensions`, `POST /api/contractor-contracts/{id}/resign`, `POST /api/contractor-contracts/{id}/suspend` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-lifecycle`: So response với schema Swagger (zod) | CTV-119, CTV-136, CTV-150, CTV-181, CTV-193 | `PUT /api/contractor-contracts/{id}/auto-renewal`, `POST /api/contractor-contracts/{id}/cancel`, `POST /api/contractor-contracts/{id}/extensions`, `POST /api/contractor-contracts/{id}/resign`, `POST /api/contractor-contracts/{id}/suspend` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor-contract.schema.ts |
| `tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-lifecycle`: Gọi lặp và gọi đồng thời | CTV-134, CTV-148, CTV-178, CTV-191 | `POST /api/contractor-contracts/{id}/cancel`, `POST /api/contractor-contracts/{id}/extensions`, `POST /api/contractor-contracts/{id}/resign`, `POST /api/contractor-contracts/{id}/suspend` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-lifecycle`: Upload, tải và xuất file | CTV-146, CTV-180 | `POST /api/contractor-contracts/{id}/extensions`, `POST /api/contractor-contracts/{id}/resign` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-files`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTV-153, CTV-160 | `GET /api/contractor-contracts/{id}/file` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-files.integration.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-files`: Upload, tải và xuất file | CTV-154 | `GET /api/contractor-contracts/{id}/file` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-files.security.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-files`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTV-155, CTV-158 | `GET /api/contractor-contracts/{id}/file` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-files.contract.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-files`: So response với schema Swagger (zod) | CTV-156 | `GET /api/contractor-contracts/{id}/file` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor-contract.schema.ts |
| `tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-files`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTV-157, CTV-159 | `GET /api/contractor-contracts/{id}/file` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-history`: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | CTV-161..CTV-162 | `GET /api/contractor-contracts/{id}/history` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-history`: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | CTV-163..CTV-164, CTV-168 | `GET /api/contractor-contracts/{id}/history` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-history.security.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-history`: Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công | CTV-165, CTV-167 | `GET /api/contractor-contracts/{id}/history` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts |
| `tests/api/contractor-contracts/contractor-contract-history.contract.spec.ts` | test | Hợp đồng nhà thầu, đối tượng `contractor-contract-history`: So response với schema Swagger (zod) | CTV-166 | `GET /api/contractor-contracts/{id}/history` | src/api/contractor-contract.client.ts, src/fixtures/api.fixture.ts, src/api/schemas/contractor-contract.schema.ts |
| `tests/flows/lead-to-customer.flow.spec.ts` | test | Luồng API: Lead → Hợp đồng đầu tiên → Khách hàng chính thức. Mỗi case gọi nhiều API theo thứ tự, dữ liệu bước sau lấy từ response bước trước | FLOW-LEAD-001..FLOW-LEAD-007 | `GET /api/leads/assignable-owners`, `POST /api/leads`, `POST /api/leads/import`, `GET /api/leads`, `PUT /api/leads/{id}`, `POST /api/leads/{id}/contacts`, `POST /api/leads/{id}/documents`, `POST /api/leads/{id}/deactivate`, `POST /api/leads/{id}/reactivate`, `POST /api/leads/{id}/transfer-owner`, `GET /api/contracts/uploadable-customers`, `GET /api/contracts/assignable-managers`, `POST /api/contracts`, `GET /api/customers/{id}`, `PUT /api/customers/{id}`, `PUT /api/customers/{id}/tier`, `PUT /api/customers/{id}/credit-limit`, `GET /api/customers/assignable-managers`, `POST /api/customers/{id}/transfer-account-manager`, `GET /api/contracts/{id}`, `PUT /api/contracts/{id}`, `POST /api/contracts/{id}/extensions` | src/fixtures/api.fixture.ts, src/fixtures/seed.fixture.ts |
| `tests/flows/customer-contract-lifecycle.flow.spec.ts` | test | Luồng API: Vòng đời hợp đồng khách hàng. Mỗi case gọi nhiều API theo thứ tự, dữ liệu bước sau lấy từ response bước trước | FLOW-CTR-001..FLOW-CTR-006 | `GET /api/contracts/{id}`, `PUT /api/contracts/{id}`, `POST /api/contracts/{id}/annexes`, `PUT /api/contracts/{id}/annexes/{annexId}`, `DELETE /api/contracts/{id}/annexes/{annexId}`, `POST /api/contracts/{id}/extensions`, `POST /api/contracts/{id}/resign`, `POST /api/contracts/{id}/cancel`, `POST /api/contracts/{id}/suspend`, `GET /api/customers/{id}` | src/fixtures/api.fixture.ts, src/fixtures/seed.fixture.ts |
| `tests/flows/contractor-lifecycle.flow.spec.ts` | test | Luồng API: Nhà thầu → Hợp đồng nhà thầu. Mỗi case gọi nhiều API theo thứ tự, dữ liệu bước sau lấy từ response bước trước | FLOW-VDR-001..FLOW-VDR-007 | `POST /api/contractors`, `POST /api/contractors/{id}/documents`, `PUT /api/contractors/{id}`, `POST /api/contractors/{id}/contacts`, `PUT /api/contractors/{id}/tier`, `DELETE /api/contractors/{id}`, `GET /api/contractors/{id}`, `GET /api/contractor-contracts/contractor-options`, `POST /api/contractor-contracts`, `GET /api/contractor-contracts/{id}`, `PUT /api/contractor-contracts/{id}/auto-renewal`, `POST /api/contractor-contracts/{id}/extensions`, `POST /api/contractor-contracts/{id}/resign`, `POST /api/contractor-contracts/{id}/cancel`, `POST /api/contractor-contracts/{id}/suspend`, `POST /api/contractors/{id}/terminate`, `POST /api/contractors/{id}/reactivate`, `PUT /api/contractor-contracts/{id}`, `POST /api/contractor-contracts/{id}/annexes`, `GET /api/contractor-contracts/{id}/file` | src/fixtures/api.fixture.ts, src/fixtures/seed.fixture.ts |
| `tests/ui/lead-list/lead-list.functional.spec.ts` | test | UI Danh sách Lead: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | UI-LEAD-001..UI-LEAD-004 | `GET /api/leads`, `GET /api/leads/stats` | src/pages/lead-list.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/lead-list/lead-list.access.spec.ts` | test | UI Danh sách Lead: Phân quyền hiển thị và phiên đăng nhập | UI-LEAD-005..UI-LEAD-006 | - | src/pages/lead-list.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/lead-list/lead-list.responsive.spec.ts` | test | UI Danh sách Lead: Hiển thị theo kích thước màn hình | UI-LEAD-007 | - | src/pages/lead-list.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/lead-list/lead-list.a11y.spec.ts` | test | UI Danh sách Lead: Kiểm tra trợ năng bằng axe và bàn phím | UI-LEAD-008 | - | src/pages/lead-list.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/lead-list/lead-list.visual.spec.ts` | test | UI Danh sách Lead: So ảnh chụp màn hình với ảnh chuẩn | UI-LEAD-009 | - | src/pages/lead-list.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/lead-form/lead-form.validation.spec.ts` | test | UI Thêm mới và chi tiết Lead: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | UI-LEADF-001..UI-LEADF-002, UI-LEADF-005, UI-LEADF-008, UI-LEADF-010..UI-LEADF-013, UI-LEADF-015 | - | src/pages/lead-form.page.ts, src/pages/lead-detail.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/lead-form/lead-form.functional.spec.ts` | test | UI Thêm mới và chi tiết Lead: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | UI-LEADF-003..UI-LEADF-004, UI-LEADF-006..UI-LEADF-007, UI-LEADF-009, UI-LEADF-014, UI-LEADF-016 | - | src/pages/lead-form.page.ts, src/pages/lead-detail.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/customer-contract/customer-contract.functional.spec.ts` | test | UI Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | UI-CTR-001, UI-CTR-003..UI-CTR-004, UI-CTR-006..UI-CTR-008, UI-CTR-011, UI-CTR-013 | `GET /api/contracts/uploadable-customers` | src/pages/contract-upload.page.ts, src/pages/contract-detail.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/customer-contract/customer-contract.validation.spec.ts` | test | UI Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | UI-CTR-002, UI-CTR-005, UI-CTR-009..UI-CTR-010, UI-CTR-012 | `GET /api/contracts/{id}` | src/pages/contract-upload.page.ts, src/pages/contract-detail.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/customers/customers.functional.spec.ts` | test | UI Danh sách và chi tiết khách hàng: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | UI-CUS-001..UI-CUS-003, UI-CUS-009..UI-CUS-010 | `GET /api/customers` | src/pages/customer-list.page.ts, src/pages/customer-detail.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/customers/customers.access.spec.ts` | test | UI Danh sách và chi tiết khách hàng: Phân quyền hiển thị và phiên đăng nhập | UI-CUS-004 | - | src/pages/customer-list.page.ts, src/pages/customer-detail.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/customers/customers.validation.spec.ts` | test | UI Danh sách và chi tiết khách hàng: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | UI-CUS-005..UI-CUS-008 | - | src/pages/customer-list.page.ts, src/pages/customer-detail.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/contractor-list/contractor-list.functional.spec.ts` | test | UI Danh sách và thêm mới nhà thầu: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | UI-VDR-001..UI-VDR-002, UI-VDR-004..UI-VDR-006, UI-VDR-008 | `GET /api/contractors` | src/pages/contractor-list.page.ts, src/pages/contractor-form.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/contractor-list/contractor-list.validation.spec.ts` | test | UI Danh sách và thêm mới nhà thầu: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | UI-VDR-003, UI-VDR-007 | - | src/pages/contractor-list.page.ts, src/pages/contractor-form.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/contractor-detail/contractor-detail.functional.spec.ts` | test | UI Chi tiết nhà thầu: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | UI-VDRD-001, UI-VDRD-004..UI-VDRD-005, UI-VDRD-007 | `GET /api/contractors/{id}`, `POST /api/contractors`, `POST /api/contractor-contracts` | src/pages/contractor-detail.page.ts, src/pages/purchase-price-form.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/contractor-detail/contractor-detail.validation.spec.ts` | test | UI Chi tiết nhà thầu: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | UI-VDRD-002..UI-VDRD-003, UI-VDRD-006, UI-VDRD-008 | - | src/pages/contractor-detail.page.ts, src/pages/purchase-price-form.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | test | UI Thêm và chi tiết hợp đồng nhà thầu: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | UI-CTV-001, UI-CTV-003..UI-CTV-004, UI-CTV-007..UI-CTV-008, UI-CTV-010 | `GET /api/contractor-contracts/contractor-options` | src/pages/contractor-contract-form.page.ts, src/pages/contractor-contract-detail.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/contractor-contract/contractor-contract.validation.spec.ts` | test | UI Thêm và chi tiết hợp đồng nhà thầu: Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi | UI-CTV-002, UI-CTV-005..UI-CTV-006, UI-CTV-009 | `GET /api/contractor-contracts/{id}` | src/pages/contractor-contract-form.page.ts, src/pages/contractor-contract-detail.page.ts, src/fixtures/page.fixture.ts |
| `tests/ui/common/common.functional.spec.ts` | test | UI Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module: Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang | UI-COM-001..UI-COM-003 | - | src/pages/components/data-table.component.ts, src/pages/components/filter-bar.component.ts, src/fixtures/page.fixture.ts |
| `tests/ui/common/common.access.spec.ts` | test | UI Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module: Phân quyền hiển thị và phiên đăng nhập | UI-COM-004 | - | src/pages/components/data-table.component.ts, src/pages/components/filter-bar.component.ts, src/fixtures/page.fixture.ts |

## 4. Ma trận case và file

Script tự dựng từ bộ case và mục 3, không sửa bằng tay.

| Case | Nhóm test | Mục | Ưu tiên | File chạy | Lệnh chạy |
| --- | --- | --- | --- | --- | --- |
| LEAD-001 | Happy path | API: Danh sách, tìm kiếm, lọc Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-001"` |
| LEAD-002 | Business rule | API: Danh sách, tìm kiếm, lọc Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-002"` |
| LEAD-003 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-003"` |
| LEAD-004 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-004"` |
| LEAD-005 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-005"` |
| LEAD-006 | Boundary | API: Danh sách, tìm kiếm, lọc Lead | P2 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-006"` |
| LEAD-007 | Request validation | API: Danh sách, tìm kiếm, lọc Lead | P3 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-007"` |
| LEAD-008 | Response contract | API: Danh sách, tìm kiếm, lọc Lead | P2 | `tests/api/leads/lead.contract.spec.ts` | `npx playwright test tests/api/leads/lead.contract.spec.ts -g "LEAD-008"` |
| LEAD-009 | Authentication | API: Danh sách, tìm kiếm, lọc Lead | P1 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-009"` |
| LEAD-010 | Authentication | API: Danh sách, tìm kiếm, lọc Lead | P1 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-010"` |
| LEAD-011 | Input security | API: Danh sách, tìm kiếm, lọc Lead | P2 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-011"` |
| LEAD-012 | Authorization | API: Danh sách, tìm kiếm, lọc Lead | P2 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-012"` |
| LEAD-013 | Error handling | API: Danh sách, tìm kiếm, lọc Lead | P3 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-013"` |
| LEAD-014 | Happy path | API: Tạo Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-014"` |
| LEAD-015 | State transition | API: Tạo Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-015"` |
| LEAD-016 | Request validation | API: Tạo Lead | P1 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-016"` |
| LEAD-017 | Request validation | API: Tạo Lead | P2 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-017"` |
| LEAD-018 | Request validation | API: Tạo Lead | P2 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-018"` |
| LEAD-019 | Boundary | API: Tạo Lead | P1 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-019"` |
| LEAD-020 | Boundary | API: Tạo Lead | P2 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-020"` |
| LEAD-021 | Boundary | API: Tạo Lead | P2 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-021"` |
| LEAD-022 | Business rule | API: Tạo Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-022"` |
| LEAD-023 | Business rule | API: Tạo Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-023"` |
| LEAD-024 | Business rule | API: Tạo Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-024"` |
| LEAD-025 | Business rule | API: Tạo Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-025"` |
| LEAD-026 | Business rule | API: Tạo Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-026"` |
| LEAD-027 | Data integrity | API: Tạo Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-027"` |
| LEAD-028 | Idempotency | API: Tạo Lead | P2 | `tests/api/leads/lead.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead.concurrency.spec.ts -g "LEAD-028"` |
| LEAD-029 | Concurrency | API: Tạo Lead | P2 | `tests/api/leads/lead.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead.concurrency.spec.ts -g "LEAD-029"` |
| LEAD-030 | Input security | API: Tạo Lead | P2 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-030"` |
| LEAD-031 | Response contract | API: Tạo Lead | P2 | `tests/api/leads/lead.contract.spec.ts` | `npx playwright test tests/api/leads/lead.contract.spec.ts -g "LEAD-031"` |
| LEAD-032 | Authentication | API: Tạo Lead | P1 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-032"` |
| LEAD-033 | Authorization | API: Tạo Lead | P2 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-033"` |
| LEAD-034 | Error handling | API: Tạo Lead | P3 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-034"` |
| LEAD-035 | Business rule | API: Tạo Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-035"` |
| LEAD-036 | Boundary | API: Tạo Lead | P3 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-036"` |
| LEAD-037 | Business rule | API: Tạo Lead | P3 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-037"` |
| LEAD-038 | Business rule | API: Tạo Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-038"` |
| LEAD-039 | Business rule | API: Tạo Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-039"` |
| LEAD-040 | Happy path | API: Danh sách người phụ trách Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-040"` |
| LEAD-041 | Business rule | API: Danh sách người phụ trách Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-041"` |
| LEAD-042 | Response contract | API: Danh sách người phụ trách Lead | P2 | `tests/api/leads/lead.contract.spec.ts` | `npx playwright test tests/api/leads/lead.contract.spec.ts -g "LEAD-042"` |
| LEAD-043 | Authentication | API: Danh sách người phụ trách Lead | P2 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-043"` |
| LEAD-044 | Error handling | API: Danh sách người phụ trách Lead | P3 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-044"` |
| LEAD-045 | Happy path | API: Xuất danh sách Lead ra Excel | P2 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-045"` |
| LEAD-046 | File API | API: Xuất danh sách Lead ra Excel | P2 | `tests/api/leads/lead-import-export.integration.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.integration.spec.ts -g "LEAD-046"` |
| LEAD-047 | Business rule | API: Xuất danh sách Lead ra Excel | P1 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-047"` |
| LEAD-048 | Business rule | API: Xuất danh sách Lead ra Excel | P2 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-048"` |
| LEAD-049 | Pagination/filter/sort | API: Xuất danh sách Lead ra Excel | P3 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-049"` |
| LEAD-050 | Boundary | API: Xuất danh sách Lead ra Excel | P3 | `tests/api/leads/lead-import-export.validation.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-050"` |
| LEAD-051 | Request validation | API: Xuất danh sách Lead ra Excel | P3 | `tests/api/leads/lead-import-export.validation.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-051"` |
| LEAD-052 | Response contract | API: Xuất danh sách Lead ra Excel | P3 | `tests/api/leads/lead-import-export.contract.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.contract.spec.ts -g "LEAD-052"` |
| LEAD-053 | Authentication | API: Xuất danh sách Lead ra Excel | P2 | `tests/api/leads/lead-import-export.security.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.security.spec.ts -g "LEAD-053"` |
| LEAD-054 | Error handling | API: Xuất danh sách Lead ra Excel | P3 | `tests/api/leads/lead-import-export.validation.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-054"` |
| LEAD-055 | Happy path | API: Import Lead từ Excel | P1 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-055"` |
| LEAD-056 | State transition | API: Import Lead từ Excel | P2 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-056"` |
| LEAD-057 | Business rule | API: Import Lead từ Excel | P1 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-057"` |
| LEAD-058 | Business rule | API: Import Lead từ Excel | P2 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-058"` |
| LEAD-059 | File API | API: Import Lead từ Excel | P2 | `tests/api/leads/lead-import-export.integration.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.integration.spec.ts -g "LEAD-059"` |
| LEAD-060 | Boundary | API: Import Lead từ Excel | P3 | `tests/api/leads/lead-import-export.validation.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-060"` |
| LEAD-061 | Request validation | API: Import Lead từ Excel | P2 | `tests/api/leads/lead-import-export.validation.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-061"` |
| LEAD-062 | Data integrity | API: Import Lead từ Excel | P1 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-062"` |
| LEAD-063 | Idempotency | API: Import Lead từ Excel | P2 | `tests/api/leads/lead-import-export.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.concurrency.spec.ts -g "LEAD-063"` |
| LEAD-064 | Input security | API: Import Lead từ Excel | P3 | `tests/api/leads/lead-import-export.security.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.security.spec.ts -g "LEAD-064"` |
| LEAD-065 | Error handling | API: Import Lead từ Excel | P3 | `tests/api/leads/lead-import-export.validation.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-065"` |
| LEAD-066 | Response contract | API: Import Lead từ Excel | P2 | `tests/api/leads/lead-import-export.contract.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.contract.spec.ts -g "LEAD-066"` |
| LEAD-067 | Authentication | API: Import Lead từ Excel | P2 | `tests/api/leads/lead-import-export.security.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.security.spec.ts -g "LEAD-067"` |
| LEAD-068 | Business rule | API: Import Lead từ Excel | P1 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-068"` |
| LEAD-069 | Happy path | API: Tải file mẫu import Lead | P3 | `tests/api/leads/lead-import-export.functional.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-069"` |
| LEAD-070 | File API | API: Tải file mẫu import Lead | P3 | `tests/api/leads/lead-import-export.integration.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.integration.spec.ts -g "LEAD-070"` |
| LEAD-071 | File API | API: Tải file mẫu import Lead | P2 | `tests/api/leads/lead-import-export.integration.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.integration.spec.ts -g "LEAD-071"` |
| LEAD-072 | Response contract | API: Tải file mẫu import Lead | P3 | `tests/api/leads/lead-import-export.contract.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.contract.spec.ts -g "LEAD-072"` |
| LEAD-073 | Authentication | API: Tải file mẫu import Lead | P3 | `tests/api/leads/lead-import-export.security.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.security.spec.ts -g "LEAD-073"` |
| LEAD-074 | Error handling | API: Tải file mẫu import Lead | P3 | `tests/api/leads/lead-import-export.validation.spec.ts` | `npx playwright test tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-074"` |
| LEAD-075 | Happy path | API: Số liệu tổng quan Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-075"` |
| LEAD-076 | Business rule | API: Số liệu tổng quan Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-076"` |
| LEAD-077 | Business rule | API: Số liệu tổng quan Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-077"` |
| LEAD-078 | Response contract | API: Số liệu tổng quan Lead | P2 | `tests/api/leads/lead.contract.spec.ts` | `npx playwright test tests/api/leads/lead.contract.spec.ts -g "LEAD-078"` |
| LEAD-079 | Authentication | API: Số liệu tổng quan Lead | P3 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-079"` |
| LEAD-080 | Error handling | API: Số liệu tổng quan Lead | P3 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-080"` |
| LEAD-081 | Happy path | API: Chi tiết Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-081"` |
| LEAD-082 | Business rule | API: Chi tiết Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-082"` |
| LEAD-083 | Business rule | API: Chi tiết Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-083"` |
| LEAD-084 | Ownership/IDOR | API: Chi tiết Lead | P1 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-084"` |
| LEAD-085 | Request validation | API: Chi tiết Lead | P3 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-085"` |
| LEAD-086 | Response contract | API: Chi tiết Lead | P2 | `tests/api/leads/lead.contract.spec.ts` | `npx playwright test tests/api/leads/lead.contract.spec.ts -g "LEAD-086"` |
| LEAD-087 | Authentication | API: Chi tiết Lead | P1 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-087"` |
| LEAD-088 | Error handling | API: Chi tiết Lead | P2 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-088"` |
| LEAD-089 | Happy path | API: Sửa thông tin Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-089"` |
| LEAD-090 | State transition | API: Sửa thông tin Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-090"` |
| LEAD-091 | Request validation | API: Sửa thông tin Lead | P2 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-091"` |
| LEAD-092 | Boundary | API: Sửa thông tin Lead | P3 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-092"` |
| LEAD-093 | Business rule | API: Sửa thông tin Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-093"` |
| LEAD-094 | Business rule | API: Sửa thông tin Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-094"` |
| LEAD-095 | Business rule | API: Sửa thông tin Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-095"` |
| LEAD-096 | Ownership/IDOR | API: Sửa thông tin Lead | P1 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-096"` |
| LEAD-097 | Data integrity | API: Sửa thông tin Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-097"` |
| LEAD-098 | Response contract | API: Sửa thông tin Lead | P2 | `tests/api/leads/lead.contract.spec.ts` | `npx playwright test tests/api/leads/lead.contract.spec.ts -g "LEAD-098"` |
| LEAD-099 | Authentication | API: Sửa thông tin Lead | P1 | `tests/api/leads/lead.security.spec.ts` | `npx playwright test tests/api/leads/lead.security.spec.ts -g "LEAD-099"` |
| LEAD-100 | Error handling | API: Sửa thông tin Lead | P2 | `tests/api/leads/lead.validation.spec.ts` | `npx playwright test tests/api/leads/lead.validation.spec.ts -g "LEAD-100"` |
| LEAD-101 | Business rule | API: Sửa thông tin Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-101"` |
| LEAD-102 | Business rule | API: Sửa thông tin Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-102"` |
| LEAD-103 | Business rule | API: Sửa thông tin Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-103"` |
| LEAD-104 | Business rule | API: Sửa thông tin Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-104"` |
| LEAD-105 | Business rule | API: Sửa thông tin Lead | P2 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-105"` |
| LEAD-106 | Happy path | API: Thêm đầu mối liên hệ Lead | P1 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-106"` |
| LEAD-107 | Request validation | API: Thêm đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-107"` |
| LEAD-108 | Boundary | API: Thêm đầu mối liên hệ Lead | P3 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-108"` |
| LEAD-109 | Business rule | API: Thêm đầu mối liên hệ Lead | P1 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-109"` |
| LEAD-110 | Business rule | API: Thêm đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-110"` |
| LEAD-111 | Ownership/IDOR | API: Thêm đầu mối liên hệ Lead | P1 | `tests/api/leads/lead-contacts.security.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-111"` |
| LEAD-112 | Data integrity | API: Thêm đầu mối liên hệ Lead | P3 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-112"` |
| LEAD-113 | Idempotency | API: Thêm đầu mối liên hệ Lead | P3 | `tests/api/leads/lead-contacts.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.concurrency.spec.ts -g "LEAD-113"` |
| LEAD-114 | Response contract | API: Thêm đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.contract.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.contract.spec.ts -g "LEAD-114"` |
| LEAD-115 | Authentication | API: Thêm đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.security.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-115"` |
| LEAD-116 | Error handling | API: Thêm đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-116"` |
| LEAD-117 | CRUD | API: Thêm đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-117"` |
| LEAD-118 | Happy path | API: Sửa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-118"` |
| LEAD-119 | Request validation | API: Sửa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-119"` |
| LEAD-120 | Boundary | API: Sửa đầu mối liên hệ Lead | P3 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-120"` |
| LEAD-121 | Business rule | API: Sửa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-121"` |
| LEAD-122 | Business rule | API: Sửa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-122"` |
| LEAD-123 | Ownership/IDOR | API: Sửa đầu mối liên hệ Lead | P1 | `tests/api/leads/lead-contacts.security.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-123"` |
| LEAD-124 | Data integrity | API: Sửa đầu mối liên hệ Lead | P3 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-124"` |
| LEAD-125 | Request validation | API: Sửa đầu mối liên hệ Lead | P3 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-125"` |
| LEAD-126 | Response contract | API: Sửa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.contract.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.contract.spec.ts -g "LEAD-126"` |
| LEAD-127 | Authentication | API: Sửa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.security.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-127"` |
| LEAD-128 | Error handling | API: Sửa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-128"` |
| LEAD-129 | Happy path | API: Xóa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-129"` |
| LEAD-130 | Business rule | API: Xóa đầu mối liên hệ Lead | P1 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-130"` |
| LEAD-131 | Business rule | API: Xóa đầu mối liên hệ Lead | P1 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-131"` |
| LEAD-132 | Boundary | API: Xóa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-132"` |
| LEAD-133 | Ownership/IDOR | API: Xóa đầu mối liên hệ Lead | P1 | `tests/api/leads/lead-contacts.security.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-133"` |
| LEAD-134 | Data integrity | API: Xóa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-134"` |
| LEAD-135 | Request validation | API: Xóa đầu mối liên hệ Lead | P3 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-135"` |
| LEAD-136 | Response contract | API: Xóa đầu mối liên hệ Lead | P3 | `tests/api/leads/lead-contacts.contract.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.contract.spec.ts -g "LEAD-136"` |
| LEAD-137 | Authentication | API: Xóa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.security.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-137"` |
| LEAD-138 | Error handling | API: Xóa đầu mối liên hệ Lead | P2 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-138"` |
| LEAD-139 | Happy path | API: Đặt đầu mối chính của Lead | P2 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-139"` |
| LEAD-140 | Business rule | API: Đặt đầu mối chính của Lead | P3 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-140"` |
| LEAD-141 | Idempotency | API: Đặt đầu mối chính của Lead | P3 | `tests/api/leads/lead-contacts.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.concurrency.spec.ts -g "LEAD-141"` |
| LEAD-142 | Ownership/IDOR | API: Đặt đầu mối chính của Lead | P1 | `tests/api/leads/lead-contacts.security.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-142"` |
| LEAD-143 | Data integrity | API: Đặt đầu mối chính của Lead | P2 | `tests/api/leads/lead-contacts.functional.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-143"` |
| LEAD-144 | Request validation | API: Đặt đầu mối chính của Lead | P3 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-144"` |
| LEAD-145 | Response contract | API: Đặt đầu mối chính của Lead | P2 | `tests/api/leads/lead-contacts.contract.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.contract.spec.ts -g "LEAD-145"` |
| LEAD-146 | Authentication | API: Đặt đầu mối chính của Lead | P2 | `tests/api/leads/lead-contacts.security.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-146"` |
| LEAD-147 | Error handling | API: Đặt đầu mối chính của Lead | P2 | `tests/api/leads/lead-contacts.validation.spec.ts` | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-147"` |
| LEAD-148 | Happy path | API: Ngưng hoạt động Lead | P1 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-148"` |
| LEAD-149 | State transition | API: Ngưng hoạt động Lead | P1 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-149"` |
| LEAD-150 | Request validation | API: Ngưng hoạt động Lead | P1 | `tests/api/leads/lead-lifecycle.validation.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-150"` |
| LEAD-151 | Boundary | API: Ngưng hoạt động Lead | P3 | `tests/api/leads/lead-lifecycle.validation.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-151"` |
| LEAD-152 | Business rule | API: Ngưng hoạt động Lead | P1 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-152"` |
| LEAD-153 | Idempotency | API: Ngưng hoạt động Lead | P2 | `tests/api/leads/lead-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.concurrency.spec.ts -g "LEAD-153"` |
| LEAD-154 | Ownership/IDOR | API: Ngưng hoạt động Lead | P1 | `tests/api/leads/lead-lifecycle.security.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-154"` |
| LEAD-155 | Data integrity | API: Ngưng hoạt động Lead | P2 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-155"` |
| LEAD-156 | Response contract | API: Ngưng hoạt động Lead | P2 | `tests/api/leads/lead-lifecycle.contract.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.contract.spec.ts -g "LEAD-156"` |
| LEAD-157 | Authentication | API: Ngưng hoạt động Lead | P1 | `tests/api/leads/lead-lifecycle.security.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-157"` |
| LEAD-158 | Error handling | API: Ngưng hoạt động Lead | P2 | `tests/api/leads/lead-lifecycle.validation.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-158"` |
| LEAD-159 | Happy path | API: Đính kèm tài liệu Lead | P2 | `tests/api/leads/lead-documents.functional.spec.ts` | `npx playwright test tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-159"` |
| LEAD-160 | File API | API: Đính kèm tài liệu Lead | P2 | `tests/api/leads/lead-documents.integration.spec.ts` | `npx playwright test tests/api/leads/lead-documents.integration.spec.ts -g "LEAD-160"` |
| LEAD-161 | File API | API: Đính kèm tài liệu Lead | P2 | `tests/api/leads/lead-documents.integration.spec.ts` | `npx playwright test tests/api/leads/lead-documents.integration.spec.ts -g "LEAD-161"` |
| LEAD-162 | Boundary | API: Đính kèm tài liệu Lead | P2 | `tests/api/leads/lead-documents.validation.spec.ts` | `npx playwright test tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-162"` |
| LEAD-163 | Request validation | API: Đính kèm tài liệu Lead | P3 | `tests/api/leads/lead-documents.validation.spec.ts` | `npx playwright test tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-163"` |
| LEAD-164 | Business rule | API: Đính kèm tài liệu Lead | P3 | `tests/api/leads/lead-documents.functional.spec.ts` | `npx playwright test tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-164"` |
| LEAD-165 | Ownership/IDOR | API: Đính kèm tài liệu Lead | P1 | `tests/api/leads/lead-documents.security.spec.ts` | `npx playwright test tests/api/leads/lead-documents.security.spec.ts -g "LEAD-165"` |
| LEAD-166 | Data integrity | API: Đính kèm tài liệu Lead | P2 | `tests/api/leads/lead-documents.functional.spec.ts` | `npx playwright test tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-166"` |
| LEAD-167 | Idempotency | API: Đính kèm tài liệu Lead | P3 | `tests/api/leads/lead-documents.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead-documents.concurrency.spec.ts -g "LEAD-167"` |
| LEAD-168 | Input security | API: Đính kèm tài liệu Lead | P2 | `tests/api/leads/lead-documents.security.spec.ts` | `npx playwright test tests/api/leads/lead-documents.security.spec.ts -g "LEAD-168"` |
| LEAD-169 | Response contract | API: Đính kèm tài liệu Lead | P3 | `tests/api/leads/lead-documents.contract.spec.ts` | `npx playwright test tests/api/leads/lead-documents.contract.spec.ts -g "LEAD-169"` |
| LEAD-170 | Authentication | API: Đính kèm tài liệu Lead | P2 | `tests/api/leads/lead-documents.security.spec.ts` | `npx playwright test tests/api/leads/lead-documents.security.spec.ts -g "LEAD-170"` |
| LEAD-171 | Error handling | API: Đính kèm tài liệu Lead | P2 | `tests/api/leads/lead-documents.validation.spec.ts` | `npx playwright test tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-171"` |
| LEAD-172 | Happy path | API: Tải tài liệu Lead | P2 | `tests/api/leads/lead-documents.functional.spec.ts` | `npx playwright test tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-172"` |
| LEAD-173 | File API | API: Tải tài liệu Lead | P2 | `tests/api/leads/lead-documents.integration.spec.ts` | `npx playwright test tests/api/leads/lead-documents.integration.spec.ts -g "LEAD-173"` |
| LEAD-174 | Ownership/IDOR | API: Tải tài liệu Lead | P1 | `tests/api/leads/lead-documents.security.spec.ts` | `npx playwright test tests/api/leads/lead-documents.security.spec.ts -g "LEAD-174"` |
| LEAD-175 | Response contract | API: Tải tài liệu Lead | P3 | `tests/api/leads/lead-documents.contract.spec.ts` | `npx playwright test tests/api/leads/lead-documents.contract.spec.ts -g "LEAD-175"` |
| LEAD-176 | Request validation | API: Tải tài liệu Lead | P3 | `tests/api/leads/lead-documents.validation.spec.ts` | `npx playwright test tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-176"` |
| LEAD-177 | Authentication | API: Tải tài liệu Lead | P2 | `tests/api/leads/lead-documents.security.spec.ts` | `npx playwright test tests/api/leads/lead-documents.security.spec.ts -g "LEAD-177"` |
| LEAD-178 | Error handling | API: Tải tài liệu Lead | P2 | `tests/api/leads/lead-documents.validation.spec.ts` | `npx playwright test tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-178"` |
| LEAD-179 | Happy path | API: Gỡ tài liệu Lead | P2 | `tests/api/leads/lead-documents.functional.spec.ts` | `npx playwright test tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-179"` |
| LEAD-180 | Business rule | API: Gỡ tài liệu Lead | P2 | `tests/api/leads/lead-documents.functional.spec.ts` | `npx playwright test tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-180"` |
| LEAD-181 | Ownership/IDOR | API: Gỡ tài liệu Lead | P1 | `tests/api/leads/lead-documents.security.spec.ts` | `npx playwright test tests/api/leads/lead-documents.security.spec.ts -g "LEAD-181"` |
| LEAD-182 | Data integrity | API: Gỡ tài liệu Lead | P2 | `tests/api/leads/lead-documents.functional.spec.ts` | `npx playwright test tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-182"` |
| LEAD-183 | Request validation | API: Gỡ tài liệu Lead | P3 | `tests/api/leads/lead-documents.validation.spec.ts` | `npx playwright test tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-183"` |
| LEAD-184 | Response contract | API: Gỡ tài liệu Lead | P3 | `tests/api/leads/lead-documents.contract.spec.ts` | `npx playwright test tests/api/leads/lead-documents.contract.spec.ts -g "LEAD-184"` |
| LEAD-185 | Authentication | API: Gỡ tài liệu Lead | P2 | `tests/api/leads/lead-documents.security.spec.ts` | `npx playwright test tests/api/leads/lead-documents.security.spec.ts -g "LEAD-185"` |
| LEAD-186 | Error handling | API: Gỡ tài liệu Lead | P2 | `tests/api/leads/lead-documents.validation.spec.ts` | `npx playwright test tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-186"` |
| LEAD-187 | Happy path | API: Lịch sử thao tác Lead | P2 | `tests/api/leads/lead-history.functional.spec.ts` | `npx playwright test tests/api/leads/lead-history.functional.spec.ts -g "LEAD-187"` |
| LEAD-188 | Pagination/filter/sort | API: Lịch sử thao tác Lead | P3 | `tests/api/leads/lead-history.functional.spec.ts` | `npx playwright test tests/api/leads/lead-history.functional.spec.ts -g "LEAD-188"` |
| LEAD-189 | Boundary | API: Lịch sử thao tác Lead | P2 | `tests/api/leads/lead-history.validation.spec.ts` | `npx playwright test tests/api/leads/lead-history.validation.spec.ts -g "LEAD-189"` |
| LEAD-190 | Request validation | API: Lịch sử thao tác Lead | P3 | `tests/api/leads/lead-history.validation.spec.ts` | `npx playwright test tests/api/leads/lead-history.validation.spec.ts -g "LEAD-190"` |
| LEAD-191 | Ownership/IDOR | API: Lịch sử thao tác Lead | P1 | `tests/api/leads/lead-history.security.spec.ts` | `npx playwright test tests/api/leads/lead-history.security.spec.ts -g "LEAD-191"` |
| LEAD-192 | Response contract | API: Lịch sử thao tác Lead | P2 | `tests/api/leads/lead-history.contract.spec.ts` | `npx playwright test tests/api/leads/lead-history.contract.spec.ts -g "LEAD-192"` |
| LEAD-193 | Authentication | API: Lịch sử thao tác Lead | P2 | `tests/api/leads/lead-history.security.spec.ts` | `npx playwright test tests/api/leads/lead-history.security.spec.ts -g "LEAD-193"` |
| LEAD-194 | Error handling | API: Lịch sử thao tác Lead | P2 | `tests/api/leads/lead-history.validation.spec.ts` | `npx playwright test tests/api/leads/lead-history.validation.spec.ts -g "LEAD-194"` |
| LEAD-195 | Happy path | API: Kích hoạt lại Lead | P1 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-195"` |
| LEAD-196 | State transition | API: Kích hoạt lại Lead | P1 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-196"` |
| LEAD-197 | Business rule | API: Kích hoạt lại Lead | P2 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-197"` |
| LEAD-198 | Idempotency | API: Kích hoạt lại Lead | P2 | `tests/api/leads/lead-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.concurrency.spec.ts -g "LEAD-198"` |
| LEAD-199 | Ownership/IDOR | API: Kích hoạt lại Lead | P1 | `tests/api/leads/lead-lifecycle.security.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-199"` |
| LEAD-200 | Data integrity | API: Kích hoạt lại Lead | P3 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-200"` |
| LEAD-201 | Request validation | API: Kích hoạt lại Lead | P3 | `tests/api/leads/lead-lifecycle.validation.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-201"` |
| LEAD-202 | Response contract | API: Kích hoạt lại Lead | P2 | `tests/api/leads/lead-lifecycle.contract.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.contract.spec.ts -g "LEAD-202"` |
| LEAD-203 | Authentication | API: Kích hoạt lại Lead | P1 | `tests/api/leads/lead-lifecycle.security.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-203"` |
| LEAD-204 | Error handling | API: Kích hoạt lại Lead | P2 | `tests/api/leads/lead-lifecycle.validation.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-204"` |
| LEAD-205 | Happy path | API: Chuyển người phụ trách Lead | P1 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-205"` |
| LEAD-206 | State transition | API: Chuyển người phụ trách Lead | P2 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-206"` |
| LEAD-207 | Request validation | API: Chuyển người phụ trách Lead | P1 | `tests/api/leads/lead-lifecycle.validation.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-207"` |
| LEAD-208 | Boundary | API: Chuyển người phụ trách Lead | P3 | `tests/api/leads/lead-lifecycle.validation.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-208"` |
| LEAD-209 | Business rule | API: Chuyển người phụ trách Lead | P2 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-209"` |
| LEAD-210 | Business rule | API: Chuyển người phụ trách Lead | P2 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-210"` |
| LEAD-211 | Business rule | API: Chuyển người phụ trách Lead | P2 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-211"` |
| LEAD-212 | Ownership/IDOR | API: Chuyển người phụ trách Lead | P1 | `tests/api/leads/lead-lifecycle.security.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-212"` |
| LEAD-213 | Data integrity | API: Chuyển người phụ trách Lead | P1 | `tests/api/leads/lead-lifecycle.functional.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-213"` |
| LEAD-214 | Idempotency | API: Chuyển người phụ trách Lead | P2 | `tests/api/leads/lead-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.concurrency.spec.ts -g "LEAD-214"` |
| LEAD-215 | Concurrency | API: Chuyển người phụ trách Lead | P3 | `tests/api/leads/lead-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.concurrency.spec.ts -g "LEAD-215"` |
| LEAD-216 | Response contract | API: Chuyển người phụ trách Lead | P3 | `tests/api/leads/lead-lifecycle.contract.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.contract.spec.ts -g "LEAD-216"` |
| LEAD-217 | Authentication | API: Chuyển người phụ trách Lead | P1 | `tests/api/leads/lead-lifecycle.security.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-217"` |
| LEAD-218 | Error handling | API: Chuyển người phụ trách Lead | P2 | `tests/api/leads/lead-lifecycle.validation.spec.ts` | `npx playwright test tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-218"` |
| LEAD-219 | Business rule | API: Mã tự sinh của Lead | P1 | `tests/api/leads/lead.functional.spec.ts` | `npx playwright test tests/api/leads/lead.functional.spec.ts -g "LEAD-219"` |
| CTR-001 | Happy path | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-001"` |
| CTR-002 | Business rule | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-002"` |
| CTR-003 | Business rule | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-003"` |
| CTR-004 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-004"` |
| CTR-005 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-005"` |
| CTR-006 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-006"` |
| CTR-007 | Boundary | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-007"` |
| CTR-008 | Request validation | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-008"` |
| CTR-009 | Response contract | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-009"` |
| CTR-010 | Authentication | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-010"` |
| CTR-011 | Authentication | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-011"` |
| CTR-012 | Input security | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-012"` |
| CTR-013 | Error handling | API: Danh sách, tìm kiếm, lọc hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-013"` |
| CTR-014 | Happy path | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-014"` |
| CTR-015 | State transition | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-015"` |
| CTR-016 | Request validation | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-016"` |
| CTR-017 | Request validation | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-017"` |
| CTR-018 | Request validation | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-018"` |
| CTR-019 | Boundary | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P2 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-019"` |
| CTR-020 | Boundary | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P2 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-020"` |
| CTR-021 | Business rule | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-021"` |
| CTR-022 | Business rule | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-022"` |
| CTR-023 | Business rule | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P2 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-023"` |
| CTR-024 | Data integrity | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-024"` |
| CTR-025 | Data integrity | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-025"` |
| CTR-026 | Idempotency | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.concurrency.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.concurrency.spec.ts -g "CTR-026"` |
| CTR-027 | Concurrency | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P2 | `tests/api/customer-contracts/contract.concurrency.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.concurrency.spec.ts -g "CTR-027"` |
| CTR-028 | File API | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P2 | `tests/api/customer-contracts/contract.integration.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.integration.spec.ts -g "CTR-028"` |
| CTR-029 | Authorization | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P2 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-029"` |
| CTR-030 | Response contract | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P2 | `tests/api/customer-contracts/contract.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-030"` |
| CTR-031 | Authentication | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P1 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-031"` |
| CTR-032 | Error handling | API: Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng) | P2 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-032"` |
| CTR-033 | Happy path | API: Danh sách DVKH chọn khi upload HĐ | P2 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-033"` |
| CTR-034 | Business rule | API: Danh sách DVKH chọn khi upload HĐ | P2 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-034"` |
| CTR-035 | Response contract | API: Danh sách DVKH chọn khi upload HĐ | P2 | `tests/api/customer-contracts/contract.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-035"` |
| CTR-036 | Authentication | API: Danh sách DVKH chọn khi upload HĐ | P3 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-036"` |
| CTR-037 | Error handling | API: Danh sách DVKH chọn khi upload HĐ | P3 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-037"` |
| CTR-038 | Happy path | API: Xuất danh sách hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-export.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.functional.spec.ts -g "CTR-038"` |
| CTR-039 | File API | API: Xuất danh sách hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-export.integration.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.integration.spec.ts -g "CTR-039"` |
| CTR-040 | Business rule | API: Xuất danh sách hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-export.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.functional.spec.ts -g "CTR-040"` |
| CTR-041 | Business rule | API: Xuất danh sách hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-export.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.functional.spec.ts -g "CTR-041"` |
| CTR-042 | Pagination/filter/sort | API: Xuất danh sách hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-export.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.functional.spec.ts -g "CTR-042"` |
| CTR-043 | Boundary | API: Xuất danh sách hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-export.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.validation.spec.ts -g "CTR-043"` |
| CTR-044 | Request validation | API: Xuất danh sách hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-export.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.validation.spec.ts -g "CTR-044"` |
| CTR-045 | Response contract | API: Xuất danh sách hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-export.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.contract.spec.ts -g "CTR-045"` |
| CTR-046 | Authentication | API: Xuất danh sách hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-export.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.security.spec.ts -g "CTR-046"` |
| CTR-047 | Error handling | API: Xuất danh sách hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-export.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-export.validation.spec.ts -g "CTR-047"` |
| CTR-048 | Happy path | API: Khối giám sát kỳ hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-048"` |
| CTR-049 | Boundary | API: Khối giám sát kỳ hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-049"` |
| CTR-050 | Business rule | API: Khối giám sát kỳ hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-050"` |
| CTR-051 | Response contract | API: Khối giám sát kỳ hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-051"` |
| CTR-052 | Authentication | API: Khối giám sát kỳ hạn hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-052"` |
| CTR-053 | Error handling | API: Khối giám sát kỳ hạn hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-053"` |
| CTR-054 | Happy path | API: Lead đủ điều kiện upload hợp đồng đầu tiên | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-054"` |
| CTR-055 | Business rule | API: Lead đủ điều kiện upload hợp đồng đầu tiên | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-055"` |
| CTR-056 | Pagination/filter/sort | API: Lead đủ điều kiện upload hợp đồng đầu tiên | P3 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-056"` |
| CTR-057 | Boundary | API: Lead đủ điều kiện upload hợp đồng đầu tiên | P3 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-057"` |
| CTR-058 | Request validation | API: Lead đủ điều kiện upload hợp đồng đầu tiên | P3 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-058"` |
| CTR-059 | Response contract | API: Lead đủ điều kiện upload hợp đồng đầu tiên | P2 | `tests/api/customer-contracts/contract.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-059"` |
| CTR-060 | Authentication | API: Lead đủ điều kiện upload hợp đồng đầu tiên | P2 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-060"` |
| CTR-061 | Error handling | API: Lead đủ điều kiện upload hợp đồng đầu tiên | P3 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-061"` |
| CTR-062 | Happy path | API: Chi tiết hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-062"` |
| CTR-063 | Business rule | API: Chi tiết hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-063"` |
| CTR-064 | Ownership/IDOR | API: Chi tiết hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-064"` |
| CTR-065 | Request validation | API: Chi tiết hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-065"` |
| CTR-066 | Response contract | API: Chi tiết hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-066"` |
| CTR-067 | Authentication | API: Chi tiết hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-067"` |
| CTR-068 | Error handling | API: Chi tiết hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-068"` |
| CTR-069 | Happy path | API: Sửa hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-069"` |
| CTR-070 | Business rule | API: Sửa hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-070"` |
| CTR-071 | State transition | API: Sửa hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-071"` |
| CTR-072 | Business rule | API: Sửa hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-072"` |
| CTR-073 | Request validation | API: Sửa hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-073"` |
| CTR-074 | Boundary | API: Sửa hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-074"` |
| CTR-075 | Ownership/IDOR | API: Sửa hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-075"` |
| CTR-076 | Data integrity | API: Sửa hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-076"` |
| CTR-077 | Response contract | API: Sửa hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-077"` |
| CTR-078 | Authentication | API: Sửa hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts -g "CTR-078"` |
| CTR-079 | Error handling | API: Sửa hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-079"` |
| CTR-080 | Happy path | API: Thêm phụ lục hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-080"` |
| CTR-081 | Request validation | API: Thêm phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-081"` |
| CTR-082 | Boundary | API: Thêm phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-082"` |
| CTR-083 | File API | API: Thêm phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.integration.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.integration.spec.ts -g "CTR-083"` |
| CTR-084 | Business rule | API: Thêm phụ lục hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-084"` |
| CTR-085 | Ownership/IDOR | API: Thêm phụ lục hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-085"` |
| CTR-086 | Data integrity | API: Thêm phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-086"` |
| CTR-087 | Idempotency | API: Thêm phụ lục hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-annexes.concurrency.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.concurrency.spec.ts -g "CTR-087"` |
| CTR-088 | Response contract | API: Thêm phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.contract.spec.ts -g "CTR-088"` |
| CTR-089 | Authentication | API: Thêm phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-089"` |
| CTR-090 | Error handling | API: Thêm phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-090"` |
| CTR-091 | CRUD | API: Thêm phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-091"` |
| CTR-092 | Happy path | API: Sửa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-092"` |
| CTR-093 | Business rule | API: Sửa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-093"` |
| CTR-094 | Request validation | API: Sửa phụ lục hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-094"` |
| CTR-095 | Boundary | API: Sửa phụ lục hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-095"` |
| CTR-096 | Ownership/IDOR | API: Sửa phụ lục hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-096"` |
| CTR-097 | Data integrity | API: Sửa phụ lục hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-097"` |
| CTR-098 | Request validation | API: Sửa phụ lục hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-098"` |
| CTR-099 | Response contract | API: Sửa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.contract.spec.ts -g "CTR-099"` |
| CTR-100 | Authentication | API: Sửa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-100"` |
| CTR-101 | Error handling | API: Sửa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-101"` |
| CTR-102 | Business rule | API: Sửa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-102"` |
| CTR-103 | Happy path | API: Xóa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-103"` |
| CTR-104 | Business rule | API: Xóa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-104"` |
| CTR-105 | Ownership/IDOR | API: Xóa phụ lục hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-105"` |
| CTR-106 | Data integrity | API: Xóa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-106"` |
| CTR-107 | Request validation | API: Xóa phụ lục hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-107"` |
| CTR-108 | Response contract | API: Xóa phụ lục hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-annexes.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.contract.spec.ts -g "CTR-108"` |
| CTR-109 | Authentication | API: Xóa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-109"` |
| CTR-110 | Error handling | API: Xóa phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-110"` |
| CTR-111 | Happy path | API: Tải file phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-111"` |
| CTR-112 | File API | API: Tải file phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.integration.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.integration.spec.ts -g "CTR-112"` |
| CTR-113 | Ownership/IDOR | API: Tải file phụ lục hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-113"` |
| CTR-114 | Response contract | API: Tải file phụ lục hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-annexes.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.contract.spec.ts -g "CTR-114"` |
| CTR-115 | Request validation | API: Tải file phụ lục hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-115"` |
| CTR-116 | Authentication | API: Tải file phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-116"` |
| CTR-117 | Error handling | API: Tải file phụ lục hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-117"` |
| CTR-118 | Happy path | API: Hủy hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-118"` |
| CTR-119 | State transition | API: Hủy hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-119"` |
| CTR-120 | Business rule | API: Hủy hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-120"` |
| CTR-121 | Business rule | API: Hủy hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-121"` |
| CTR-122 | Request validation | API: Hủy hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-122"` |
| CTR-123 | Boundary | API: Hủy hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-123"` |
| CTR-124 | Ownership/IDOR | API: Hủy hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-124"` |
| CTR-125 | Idempotency | API: Hủy hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts -g "CTR-125"` |
| CTR-126 | Data integrity | API: Hủy hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-126"` |
| CTR-127 | Response contract | API: Hủy hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.contract.spec.ts -g "CTR-127"` |
| CTR-128 | Authentication | API: Hủy hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-128"` |
| CTR-129 | Error handling | API: Hủy hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-129"` |
| CTR-130 | Happy path | API: Gia hạn hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-130"` |
| CTR-131 | State transition | API: Gia hạn hợp đồng khách hàng | P1 | Thủ công | - |
| CTR-132 | Business rule | API: Gia hạn hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-132"` |
| CTR-133 | Business rule | API: Gia hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-133"` |
| CTR-134 | Business rule | API: Gia hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-134"` |
| CTR-135 | Boundary | API: Gia hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-135"` |
| CTR-136 | Request validation | API: Gia hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-136"` |
| CTR-137 | File API | API: Gia hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.integration.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.integration.spec.ts -g "CTR-137"` |
| CTR-138 | Ownership/IDOR | API: Gia hạn hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-138"` |
| CTR-139 | Idempotency | API: Gia hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts -g "CTR-139"` |
| CTR-140 | Data integrity | API: Gia hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-140"` |
| CTR-141 | Response contract | API: Gia hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.contract.spec.ts -g "CTR-141"` |
| CTR-142 | Authentication | API: Gia hạn hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-142"` |
| CTR-143 | Error handling | API: Gia hạn hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-143"` |
| CTR-144 | Happy path | API: Tải file của lần gia hạn | P2 | `tests/api/customer-contracts/contract-files.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.functional.spec.ts -g "CTR-144"` |
| CTR-145 | File API | API: Tải file của lần gia hạn | P2 | `tests/api/customer-contracts/contract-files.integration.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.integration.spec.ts -g "CTR-145"` |
| CTR-146 | Ownership/IDOR | API: Tải file của lần gia hạn | P1 | `tests/api/customer-contracts/contract-files.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.security.spec.ts -g "CTR-146"` |
| CTR-147 | Response contract | API: Tải file của lần gia hạn | P3 | `tests/api/customer-contracts/contract-files.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.contract.spec.ts -g "CTR-147"` |
| CTR-148 | Request validation | API: Tải file của lần gia hạn | P3 | `tests/api/customer-contracts/contract-files.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.validation.spec.ts -g "CTR-148"` |
| CTR-149 | Authentication | API: Tải file của lần gia hạn | P2 | `tests/api/customer-contracts/contract-files.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.security.spec.ts -g "CTR-149"` |
| CTR-150 | Error handling | API: Tải file của lần gia hạn | P2 | `tests/api/customer-contracts/contract-files.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.validation.spec.ts -g "CTR-150"` |
| CTR-151 | Happy path | API: Tải file scan hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-files.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.functional.spec.ts -g "CTR-151"` |
| CTR-152 | File API | API: Tải file scan hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-files.integration.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.integration.spec.ts -g "CTR-152"` |
| CTR-153 | Ownership/IDOR | API: Tải file scan hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-files.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.security.spec.ts -g "CTR-153"` |
| CTR-154 | Response contract | API: Tải file scan hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-files.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.contract.spec.ts -g "CTR-154"` |
| CTR-155 | Request validation | API: Tải file scan hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-files.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.validation.spec.ts -g "CTR-155"` |
| CTR-156 | Authentication | API: Tải file scan hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-files.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.security.spec.ts -g "CTR-156"` |
| CTR-157 | Error handling | API: Tải file scan hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-files.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-files.validation.spec.ts -g "CTR-157"` |
| CTR-158 | Happy path | API: Lịch sử thao tác hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-history.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-history.functional.spec.ts -g "CTR-158"` |
| CTR-159 | Pagination/filter/sort | API: Lịch sử thao tác hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-history.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-history.functional.spec.ts -g "CTR-159"` |
| CTR-160 | Boundary | API: Lịch sử thao tác hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-history.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-history.validation.spec.ts -g "CTR-160"` |
| CTR-161 | Request validation | API: Lịch sử thao tác hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-history.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-history.validation.spec.ts -g "CTR-161"` |
| CTR-162 | Ownership/IDOR | API: Lịch sử thao tác hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-history.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-history.security.spec.ts -g "CTR-162"` |
| CTR-163 | Response contract | API: Lịch sử thao tác hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-history.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-history.contract.spec.ts -g "CTR-163"` |
| CTR-164 | Authentication | API: Lịch sử thao tác hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-history.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-history.security.spec.ts -g "CTR-164"` |
| CTR-165 | Error handling | API: Lịch sử thao tác hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-history.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-history.validation.spec.ts -g "CTR-165"` |
| CTR-166 | Happy path | API: Tái ký hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-166"` |
| CTR-167 | State transition | API: Tái ký hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-167"` |
| CTR-168 | Business rule | API: Tái ký hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-168"` |
| CTR-169 | Business rule | API: Tái ký hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-169"` |
| CTR-170 | Business rule | API: Tái ký hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-170"` |
| CTR-171 | Business rule | API: Tái ký hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-171"` |
| CTR-172 | Request validation | API: Tái ký hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-172"` |
| CTR-173 | Boundary | API: Tái ký hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-173"` |
| CTR-174 | Ownership/IDOR | API: Tái ký hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-174"` |
| CTR-175 | Idempotency | API: Tái ký hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts -g "CTR-175"` |
| CTR-176 | Data integrity | API: Tái ký hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-176"` |
| CTR-177 | File API | API: Tái ký hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-lifecycle.integration.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.integration.spec.ts -g "CTR-177"` |
| CTR-178 | Response contract | API: Tái ký hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.contract.spec.ts -g "CTR-178"` |
| CTR-179 | Authentication | API: Tái ký hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-179"` |
| CTR-180 | Error handling | API: Tái ký hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-180"` |
| CTR-181 | Happy path | API: Dừng khai thác hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-181"` |
| CTR-182 | State transition | API: Dừng khai thác hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-182"` |
| CTR-183 | Request validation | API: Dừng khai thác hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-183"` |
| CTR-184 | Boundary | API: Dừng khai thác hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-184"` |
| CTR-185 | Business rule | API: Dừng khai thác hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-185"` |
| CTR-186 | Ownership/IDOR | API: Dừng khai thác hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-186"` |
| CTR-187 | Idempotency | API: Dừng khai thác hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts -g "CTR-187"` |
| CTR-188 | Data integrity | API: Dừng khai thác hợp đồng khách hàng | P3 | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-188"` |
| CTR-189 | Response contract | API: Dừng khai thác hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.contract.spec.ts -g "CTR-189"` |
| CTR-190 | Authentication | API: Dừng khai thác hợp đồng khách hàng | P1 | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-190"` |
| CTR-191 | Error handling | API: Dừng khai thác hợp đồng khách hàng | P2 | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-191"` |
| CTR-192 | Business rule | API: Mã tự sinh của hợp đồng khách hàng và khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-192"` |
| CTR-193 | Business rule | API: Mã tự sinh của hợp đồng khách hàng và khách hàng | P1 | `tests/api/customer-contracts/contract.functional.spec.ts` | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-193"` |
| CUS-001 | Happy path | API: Danh sách, tìm kiếm, lọc khách hàng | P1 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-001"` |
| CUS-002 | Business rule | API: Danh sách, tìm kiếm, lọc khách hàng | P2 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-002"` |
| CUS-003 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc khách hàng | P2 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-003"` |
| CUS-004 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc khách hàng | P2 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-004"` |
| CUS-005 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc khách hàng | P3 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-005"` |
| CUS-006 | Boundary | API: Danh sách, tìm kiếm, lọc khách hàng | P2 | `tests/api/customers/customer.validation.spec.ts` | `npx playwright test tests/api/customers/customer.validation.spec.ts -g "CUS-006"` |
| CUS-007 | Request validation | API: Danh sách, tìm kiếm, lọc khách hàng | P3 | `tests/api/customers/customer.validation.spec.ts` | `npx playwright test tests/api/customers/customer.validation.spec.ts -g "CUS-007"` |
| CUS-008 | Response contract | API: Danh sách, tìm kiếm, lọc khách hàng | P2 | `tests/api/customers/customer.contract.spec.ts` | `npx playwright test tests/api/customers/customer.contract.spec.ts -g "CUS-008"` |
| CUS-009 | Authentication | API: Danh sách, tìm kiếm, lọc khách hàng | P1 | `tests/api/customers/customer.security.spec.ts` | `npx playwright test tests/api/customers/customer.security.spec.ts -g "CUS-009"` |
| CUS-010 | Authentication | API: Danh sách, tìm kiếm, lọc khách hàng | P1 | `tests/api/customers/customer.security.spec.ts` | `npx playwright test tests/api/customers/customer.security.spec.ts -g "CUS-010"` |
| CUS-011 | Authorization | API: Danh sách, tìm kiếm, lọc khách hàng | P3 | `tests/api/customers/customer.security.spec.ts` | `npx playwright test tests/api/customers/customer.security.spec.ts -g "CUS-011"` |
| CUS-012 | Input security | API: Danh sách, tìm kiếm, lọc khách hàng | P3 | `tests/api/customers/customer.security.spec.ts` | `npx playwright test tests/api/customers/customer.security.spec.ts -g "CUS-012"` |
| CUS-013 | Error handling | API: Danh sách, tìm kiếm, lọc khách hàng | P3 | `tests/api/customers/customer.validation.spec.ts` | `npx playwright test tests/api/customers/customer.validation.spec.ts -g "CUS-013"` |
| CUS-014 | Happy path | API: Danh sách DVKH để chuyển người phụ trách khách hàng | P2 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-014"` |
| CUS-015 | Business rule | API: Danh sách DVKH để chuyển người phụ trách khách hàng | P2 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-015"` |
| CUS-016 | Response contract | API: Danh sách DVKH để chuyển người phụ trách khách hàng | P2 | `tests/api/customers/customer.contract.spec.ts` | `npx playwright test tests/api/customers/customer.contract.spec.ts -g "CUS-016"` |
| CUS-017 | Authentication | API: Danh sách DVKH để chuyển người phụ trách khách hàng | P3 | `tests/api/customers/customer.security.spec.ts` | `npx playwright test tests/api/customers/customer.security.spec.ts -g "CUS-017"` |
| CUS-018 | Error handling | API: Danh sách DVKH để chuyển người phụ trách khách hàng | P3 | `tests/api/customers/customer.validation.spec.ts` | `npx playwright test tests/api/customers/customer.validation.spec.ts -g "CUS-018"` |
| CUS-019 | Happy path | API: Xuất danh sách khách hàng | P2 | `tests/api/customers/customer-export.functional.spec.ts` | `npx playwright test tests/api/customers/customer-export.functional.spec.ts -g "CUS-019"` |
| CUS-020 | File API | API: Xuất danh sách khách hàng | P2 | `tests/api/customers/customer-export.integration.spec.ts` | `npx playwright test tests/api/customers/customer-export.integration.spec.ts -g "CUS-020"` |
| CUS-021 | Business rule | API: Xuất danh sách khách hàng | P2 | `tests/api/customers/customer-export.functional.spec.ts` | `npx playwright test tests/api/customers/customer-export.functional.spec.ts -g "CUS-021"` |
| CUS-022 | Pagination/filter/sort | API: Xuất danh sách khách hàng | P3 | `tests/api/customers/customer-export.functional.spec.ts` | `npx playwright test tests/api/customers/customer-export.functional.spec.ts -g "CUS-022"` |
| CUS-023 | Boundary | API: Xuất danh sách khách hàng | P3 | `tests/api/customers/customer-export.validation.spec.ts` | `npx playwright test tests/api/customers/customer-export.validation.spec.ts -g "CUS-023"` |
| CUS-024 | Request validation | API: Xuất danh sách khách hàng | P3 | `tests/api/customers/customer-export.validation.spec.ts` | `npx playwright test tests/api/customers/customer-export.validation.spec.ts -g "CUS-024"` |
| CUS-025 | Response contract | API: Xuất danh sách khách hàng | P3 | `tests/api/customers/customer-export.contract.spec.ts` | `npx playwright test tests/api/customers/customer-export.contract.spec.ts -g "CUS-025"` |
| CUS-026 | Authentication | API: Xuất danh sách khách hàng | P2 | `tests/api/customers/customer-export.security.spec.ts` | `npx playwright test tests/api/customers/customer-export.security.spec.ts -g "CUS-026"` |
| CUS-027 | Error handling | API: Xuất danh sách khách hàng | P3 | `tests/api/customers/customer-export.validation.spec.ts` | `npx playwright test tests/api/customers/customer-export.validation.spec.ts -g "CUS-027"` |
| CUS-028 | Happy path | API: Chi tiết khách hàng | P1 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-028"` |
| CUS-029 | Business rule | API: Chi tiết khách hàng | P1 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-029"` |
| CUS-030 | Ownership/IDOR | API: Chi tiết khách hàng | P1 | `tests/api/customers/customer.security.spec.ts` | `npx playwright test tests/api/customers/customer.security.spec.ts -g "CUS-030"` |
| CUS-031 | Request validation | API: Chi tiết khách hàng | P3 | `tests/api/customers/customer.validation.spec.ts` | `npx playwright test tests/api/customers/customer.validation.spec.ts -g "CUS-031"` |
| CUS-032 | Response contract | API: Chi tiết khách hàng | P2 | `tests/api/customers/customer.contract.spec.ts` | `npx playwright test tests/api/customers/customer.contract.spec.ts -g "CUS-032"` |
| CUS-033 | Authentication | API: Chi tiết khách hàng | P1 | `tests/api/customers/customer.security.spec.ts` | `npx playwright test tests/api/customers/customer.security.spec.ts -g "CUS-033"` |
| CUS-034 | Error handling | API: Chi tiết khách hàng | P2 | `tests/api/customers/customer.validation.spec.ts` | `npx playwright test tests/api/customers/customer.validation.spec.ts -g "CUS-034"` |
| CUS-035 | Business rule | API: Chi tiết khách hàng | P1 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-035"` |
| CUS-036 | Business rule | API: Chi tiết khách hàng | P1 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-036"` |
| CUS-037 | Business rule | API: Chi tiết khách hàng | P2 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-037"` |
| CUS-038 | Happy path | API: Sửa thông tin khách hàng | P1 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-038"` |
| CUS-039 | Business rule | API: Sửa thông tin khách hàng | P2 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-039"` |
| CUS-040 | Business rule | API: Sửa thông tin khách hàng | P1 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-040"` |
| CUS-041 | Business rule | API: Sửa thông tin khách hàng | P3 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-041"` |
| CUS-042 | Request validation | API: Sửa thông tin khách hàng | P2 | `tests/api/customers/customer.validation.spec.ts` | `npx playwright test tests/api/customers/customer.validation.spec.ts -g "CUS-042"` |
| CUS-043 | Boundary | API: Sửa thông tin khách hàng | P3 | `tests/api/customers/customer.validation.spec.ts` | `npx playwright test tests/api/customers/customer.validation.spec.ts -g "CUS-043"` |
| CUS-044 | Ownership/IDOR | API: Sửa thông tin khách hàng | P1 | `tests/api/customers/customer.security.spec.ts` | `npx playwright test tests/api/customers/customer.security.spec.ts -g "CUS-044"` |
| CUS-045 | Data integrity | API: Sửa thông tin khách hàng | P2 | `tests/api/customers/customer.functional.spec.ts` | `npx playwright test tests/api/customers/customer.functional.spec.ts -g "CUS-045"` |
| CUS-046 | Response contract | API: Sửa thông tin khách hàng | P2 | `tests/api/customers/customer.contract.spec.ts` | `npx playwright test tests/api/customers/customer.contract.spec.ts -g "CUS-046"` |
| CUS-047 | Authentication | API: Sửa thông tin khách hàng | P1 | `tests/api/customers/customer.security.spec.ts` | `npx playwright test tests/api/customers/customer.security.spec.ts -g "CUS-047"` |
| CUS-048 | Error handling | API: Sửa thông tin khách hàng | P2 | `tests/api/customers/customer.validation.spec.ts` | `npx playwright test tests/api/customers/customer.validation.spec.ts -g "CUS-048"` |
| CUS-049 | Happy path | API: Thêm đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-049"` |
| CUS-050 | Business rule | API: Thêm đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-050"` |
| CUS-051 | Request validation | API: Thêm đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-051"` |
| CUS-052 | Boundary | API: Thêm đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-052"` |
| CUS-053 | Ownership/IDOR | API: Thêm đầu mối khách hàng | P1 | `tests/api/customers/customer-contacts.security.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.security.spec.ts -g "CUS-053"` |
| CUS-054 | Data integrity | API: Thêm đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-054"` |
| CUS-055 | Idempotency | API: Thêm đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.concurrency.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.concurrency.spec.ts -g "CUS-055"` |
| CUS-056 | Response contract | API: Thêm đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.contract.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.contract.spec.ts -g "CUS-056"` |
| CUS-057 | Authentication | API: Thêm đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.security.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.security.spec.ts -g "CUS-057"` |
| CUS-058 | Error handling | API: Thêm đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-058"` |
| CUS-059 | CRUD | API: Thêm đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-059"` |
| CUS-060 | Happy path | API: Sửa đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-060"` |
| CUS-061 | Business rule | API: Sửa đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-061"` |
| CUS-062 | Request validation | API: Sửa đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-062"` |
| CUS-063 | Boundary | API: Sửa đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-063"` |
| CUS-064 | Ownership/IDOR | API: Sửa đầu mối khách hàng | P1 | `tests/api/customers/customer-contacts.security.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.security.spec.ts -g "CUS-064"` |
| CUS-065 | Data integrity | API: Sửa đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-065"` |
| CUS-066 | Request validation | API: Sửa đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-066"` |
| CUS-067 | Response contract | API: Sửa đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.contract.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.contract.spec.ts -g "CUS-067"` |
| CUS-068 | Authentication | API: Sửa đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.security.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.security.spec.ts -g "CUS-068"` |
| CUS-069 | Error handling | API: Sửa đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-069"` |
| CUS-070 | Happy path | API: Xóa đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-070"` |
| CUS-071 | Business rule | API: Xóa đầu mối khách hàng | P1 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-071"` |
| CUS-072 | Business rule | API: Xóa đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-072"` |
| CUS-073 | Boundary | API: Xóa đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-073"` |
| CUS-074 | Ownership/IDOR | API: Xóa đầu mối khách hàng | P1 | `tests/api/customers/customer-contacts.security.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.security.spec.ts -g "CUS-074"` |
| CUS-075 | Data integrity | API: Xóa đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-075"` |
| CUS-076 | Request validation | API: Xóa đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-076"` |
| CUS-077 | Response contract | API: Xóa đầu mối khách hàng | P3 | `tests/api/customers/customer-contacts.contract.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.contract.spec.ts -g "CUS-077"` |
| CUS-078 | Authentication | API: Xóa đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.security.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.security.spec.ts -g "CUS-078"` |
| CUS-079 | Error handling | API: Xóa đầu mối khách hàng | P2 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-079"` |
| CUS-080 | Happy path | API: Đặt đầu mối chính của khách hàng | P2 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-080"` |
| CUS-081 | Business rule | API: Đặt đầu mối chính của khách hàng | P3 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-081"` |
| CUS-082 | Idempotency | API: Đặt đầu mối chính của khách hàng | P3 | `tests/api/customers/customer-contacts.concurrency.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.concurrency.spec.ts -g "CUS-082"` |
| CUS-083 | Ownership/IDOR | API: Đặt đầu mối chính của khách hàng | P1 | `tests/api/customers/customer-contacts.security.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.security.spec.ts -g "CUS-083"` |
| CUS-084 | Data integrity | API: Đặt đầu mối chính của khách hàng | P3 | `tests/api/customers/customer-contacts.functional.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-084"` |
| CUS-085 | Request validation | API: Đặt đầu mối chính của khách hàng | P3 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-085"` |
| CUS-086 | Response contract | API: Đặt đầu mối chính của khách hàng | P2 | `tests/api/customers/customer-contacts.contract.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.contract.spec.ts -g "CUS-086"` |
| CUS-087 | Authentication | API: Đặt đầu mối chính của khách hàng | P2 | `tests/api/customers/customer-contacts.security.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.security.spec.ts -g "CUS-087"` |
| CUS-088 | Error handling | API: Đặt đầu mối chính của khách hàng | P2 | `tests/api/customers/customer-contacts.validation.spec.ts` | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-088"` |
| CUS-089 | Happy path | API: Đặt hạn mức tín dụng khách hàng | P2 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-089"` |
| CUS-090 | Boundary | API: Đặt hạn mức tín dụng khách hàng | P2 | `tests/api/customers/customer-account.validation.spec.ts` | `npx playwright test tests/api/customers/customer-account.validation.spec.ts -g "CUS-090"` |
| CUS-091 | Request validation | API: Đặt hạn mức tín dụng khách hàng | P3 | `tests/api/customers/customer-account.validation.spec.ts` | `npx playwright test tests/api/customers/customer-account.validation.spec.ts -g "CUS-091"` |
| CUS-092 | Business rule | API: Đặt hạn mức tín dụng khách hàng | P3 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-092"` |
| CUS-093 | Ownership/IDOR | API: Đặt hạn mức tín dụng khách hàng | P1 | `tests/api/customers/customer-account.security.spec.ts` | `npx playwright test tests/api/customers/customer-account.security.spec.ts -g "CUS-093"` |
| CUS-094 | Data integrity | API: Đặt hạn mức tín dụng khách hàng | P3 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-094"` |
| CUS-095 | Response contract | API: Đặt hạn mức tín dụng khách hàng | P2 | `tests/api/customers/customer-account.contract.spec.ts` | `npx playwright test tests/api/customers/customer-account.contract.spec.ts -g "CUS-095"` |
| CUS-096 | Authentication | API: Đặt hạn mức tín dụng khách hàng | P2 | `tests/api/customers/customer-account.security.spec.ts` | `npx playwright test tests/api/customers/customer-account.security.spec.ts -g "CUS-096"` |
| CUS-097 | Error handling | API: Đặt hạn mức tín dụng khách hàng | P2 | `tests/api/customers/customer-account.validation.spec.ts` | `npx playwright test tests/api/customers/customer-account.validation.spec.ts -g "CUS-097"` |
| CUS-098 | Happy path | API: Tải tài liệu khách hàng (từ giai đoạn Lead) | P2 | `tests/api/customers/customer-documents.functional.spec.ts` | `npx playwright test tests/api/customers/customer-documents.functional.spec.ts -g "CUS-098"` |
| CUS-099 | File API | API: Tải tài liệu khách hàng (từ giai đoạn Lead) | P2 | `tests/api/customers/customer-documents.integration.spec.ts` | `npx playwright test tests/api/customers/customer-documents.integration.spec.ts -g "CUS-099"` |
| CUS-100 | Ownership/IDOR | API: Tải tài liệu khách hàng (từ giai đoạn Lead) | P1 | `tests/api/customers/customer-documents.security.spec.ts` | `npx playwright test tests/api/customers/customer-documents.security.spec.ts -g "CUS-100"` |
| CUS-101 | Response contract | API: Tải tài liệu khách hàng (từ giai đoạn Lead) | P3 | `tests/api/customers/customer-documents.contract.spec.ts` | `npx playwright test tests/api/customers/customer-documents.contract.spec.ts -g "CUS-101"` |
| CUS-102 | Request validation | API: Tải tài liệu khách hàng (từ giai đoạn Lead) | P3 | `tests/api/customers/customer-documents.validation.spec.ts` | `npx playwright test tests/api/customers/customer-documents.validation.spec.ts -g "CUS-102"` |
| CUS-103 | Authentication | API: Tải tài liệu khách hàng (từ giai đoạn Lead) | P2 | `tests/api/customers/customer-documents.security.spec.ts` | `npx playwright test tests/api/customers/customer-documents.security.spec.ts -g "CUS-103"` |
| CUS-104 | Error handling | API: Tải tài liệu khách hàng (từ giai đoạn Lead) | P2 | `tests/api/customers/customer-documents.validation.spec.ts` | `npx playwright test tests/api/customers/customer-documents.validation.spec.ts -g "CUS-104"` |
| CUS-105 | Happy path | API: Lịch sử thao tác khách hàng | P2 | `tests/api/customers/customer-history.functional.spec.ts` | `npx playwright test tests/api/customers/customer-history.functional.spec.ts -g "CUS-105"` |
| CUS-106 | Pagination/filter/sort | API: Lịch sử thao tác khách hàng | P3 | `tests/api/customers/customer-history.functional.spec.ts` | `npx playwright test tests/api/customers/customer-history.functional.spec.ts -g "CUS-106"` |
| CUS-107 | Boundary | API: Lịch sử thao tác khách hàng | P2 | `tests/api/customers/customer-history.validation.spec.ts` | `npx playwright test tests/api/customers/customer-history.validation.spec.ts -g "CUS-107"` |
| CUS-108 | Request validation | API: Lịch sử thao tác khách hàng | P3 | `tests/api/customers/customer-history.validation.spec.ts` | `npx playwright test tests/api/customers/customer-history.validation.spec.ts -g "CUS-108"` |
| CUS-109 | Ownership/IDOR | API: Lịch sử thao tác khách hàng | P1 | `tests/api/customers/customer-history.security.spec.ts` | `npx playwright test tests/api/customers/customer-history.security.spec.ts -g "CUS-109"` |
| CUS-110 | Response contract | API: Lịch sử thao tác khách hàng | P2 | `tests/api/customers/customer-history.contract.spec.ts` | `npx playwright test tests/api/customers/customer-history.contract.spec.ts -g "CUS-110"` |
| CUS-111 | Authentication | API: Lịch sử thao tác khách hàng | P2 | `tests/api/customers/customer-history.security.spec.ts` | `npx playwright test tests/api/customers/customer-history.security.spec.ts -g "CUS-111"` |
| CUS-112 | Error handling | API: Lịch sử thao tác khách hàng | P2 | `tests/api/customers/customer-history.validation.spec.ts` | `npx playwright test tests/api/customers/customer-history.validation.spec.ts -g "CUS-112"` |
| CUS-113 | Happy path | API: Cập nhật phân hạng khách hàng | P1 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-113"` |
| CUS-114 | Business rule | API: Cập nhật phân hạng khách hàng | P2 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-114"` |
| CUS-115 | Request validation | API: Cập nhật phân hạng khách hàng | P2 | `tests/api/customers/customer-account.validation.spec.ts` | `npx playwright test tests/api/customers/customer-account.validation.spec.ts -g "CUS-115"` |
| CUS-116 | Boundary | API: Cập nhật phân hạng khách hàng | P3 | `tests/api/customers/customer-account.validation.spec.ts` | `npx playwright test tests/api/customers/customer-account.validation.spec.ts -g "CUS-116"` |
| CUS-117 | Ownership/IDOR | API: Cập nhật phân hạng khách hàng | P1 | `tests/api/customers/customer-account.security.spec.ts` | `npx playwright test tests/api/customers/customer-account.security.spec.ts -g "CUS-117"` |
| CUS-118 | Data integrity | API: Cập nhật phân hạng khách hàng | P3 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-118"` |
| CUS-119 | Response contract | API: Cập nhật phân hạng khách hàng | P2 | `tests/api/customers/customer-account.contract.spec.ts` | `npx playwright test tests/api/customers/customer-account.contract.spec.ts -g "CUS-119"` |
| CUS-120 | Authentication | API: Cập nhật phân hạng khách hàng | P2 | `tests/api/customers/customer-account.security.spec.ts` | `npx playwright test tests/api/customers/customer-account.security.spec.ts -g "CUS-120"` |
| CUS-121 | Error handling | API: Cập nhật phân hạng khách hàng | P2 | `tests/api/customers/customer-account.validation.spec.ts` | `npx playwright test tests/api/customers/customer-account.validation.spec.ts -g "CUS-121"` |
| CUS-122 | Happy path | API: Chuyển người phụ trách khách hàng | P1 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-122"` |
| CUS-123 | Business rule | API: Chuyển người phụ trách khách hàng | P1 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-123"` |
| CUS-124 | Business rule | API: Chuyển người phụ trách khách hàng | P2 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-124"` |
| CUS-125 | Request validation | API: Chuyển người phụ trách khách hàng | P1 | `tests/api/customers/customer-account.validation.spec.ts` | `npx playwright test tests/api/customers/customer-account.validation.spec.ts -g "CUS-125"` |
| CUS-126 | Boundary | API: Chuyển người phụ trách khách hàng | P3 | `tests/api/customers/customer-account.validation.spec.ts` | `npx playwright test tests/api/customers/customer-account.validation.spec.ts -g "CUS-126"` |
| CUS-127 | Ownership/IDOR | API: Chuyển người phụ trách khách hàng | P1 | `tests/api/customers/customer-account.security.spec.ts` | `npx playwright test tests/api/customers/customer-account.security.spec.ts -g "CUS-127"` |
| CUS-128 | Data integrity | API: Chuyển người phụ trách khách hàng | P1 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-128"` |
| CUS-129 | Idempotency | API: Chuyển người phụ trách khách hàng | P2 | `tests/api/customers/customer-account.concurrency.spec.ts` | `npx playwright test tests/api/customers/customer-account.concurrency.spec.ts -g "CUS-129"` |
| CUS-130 | Concurrency | API: Chuyển người phụ trách khách hàng | P3 | `tests/api/customers/customer-account.concurrency.spec.ts` | `npx playwright test tests/api/customers/customer-account.concurrency.spec.ts -g "CUS-130"` |
| CUS-131 | Response contract | API: Chuyển người phụ trách khách hàng | P3 | `tests/api/customers/customer-account.contract.spec.ts` | `npx playwright test tests/api/customers/customer-account.contract.spec.ts -g "CUS-131"` |
| CUS-132 | Authentication | API: Chuyển người phụ trách khách hàng | P1 | `tests/api/customers/customer-account.security.spec.ts` | `npx playwright test tests/api/customers/customer-account.security.spec.ts -g "CUS-132"` |
| CUS-133 | Error handling | API: Chuyển người phụ trách khách hàng | P2 | `tests/api/customers/customer-account.validation.spec.ts` | `npx playwright test tests/api/customers/customer-account.validation.spec.ts -g "CUS-133"` |
| CUS-134 | Data integrity | API: Chuyển người phụ trách khách hàng | P1 | `tests/api/customers/customer-account.functional.spec.ts` | `npx playwright test tests/api/customers/customer-account.functional.spec.ts -g "CUS-134"` |
| CUS-135 | Ownership/IDOR | API: Chuyển người phụ trách khách hàng | P1 | `tests/api/customers/customer-account.security.spec.ts` | `npx playwright test tests/api/customers/customer-account.security.spec.ts -g "CUS-135"` |
| VDR-001 | Happy path | API: Danh sách, tìm kiếm, lọc nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-001"` |
| VDR-002 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-002"` |
| VDR-003 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-003"` |
| VDR-004 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc nhà thầu | P3 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-004"` |
| VDR-005 | Boundary | API: Danh sách, tìm kiếm, lọc nhà thầu | P2 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-005"` |
| VDR-006 | Request validation | API: Danh sách, tìm kiếm, lọc nhà thầu | P3 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-006"` |
| VDR-007 | Response contract | API: Danh sách, tìm kiếm, lọc nhà thầu | P2 | `tests/api/contractors/contractor.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor.contract.spec.ts -g "VDR-007"` |
| VDR-008 | Authentication | API: Danh sách, tìm kiếm, lọc nhà thầu | P1 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-008"` |
| VDR-009 | Authentication | API: Danh sách, tìm kiếm, lọc nhà thầu | P1 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-009"` |
| VDR-010 | Authorization | API: Danh sách, tìm kiếm, lọc nhà thầu | P2 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-010"` |
| VDR-011 | Input security | API: Danh sách, tìm kiếm, lọc nhà thầu | P3 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-011"` |
| VDR-012 | Error handling | API: Danh sách, tìm kiếm, lọc nhà thầu | P3 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-012"` |
| VDR-013 | Happy path | API: Tạo nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-013"` |
| VDR-014 | State transition | API: Tạo nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-014"` |
| VDR-015 | Request validation | API: Tạo nhà thầu | P1 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-015"` |
| VDR-016 | Request validation | API: Tạo nhà thầu | P2 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-016"` |
| VDR-017 | Boundary | API: Tạo nhà thầu | P1 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-017"` |
| VDR-018 | Boundary | API: Tạo nhà thầu | P2 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-018"` |
| VDR-019 | Boundary | API: Tạo nhà thầu | P3 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-019"` |
| VDR-020 | Business rule | API: Tạo nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-020"` |
| VDR-021 | Business rule | API: Tạo nhà thầu | P3 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-021"` |
| VDR-022 | Business rule | API: Tạo nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-022"` |
| VDR-023 | Data integrity | API: Tạo nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-023"` |
| VDR-024 | Idempotency | API: Tạo nhà thầu | P2 | `tests/api/contractors/contractor.concurrency.spec.ts` | `npx playwright test tests/api/contractors/contractor.concurrency.spec.ts -g "VDR-024"` |
| VDR-025 | Concurrency | API: Tạo nhà thầu | P2 | `tests/api/contractors/contractor.concurrency.spec.ts` | `npx playwright test tests/api/contractors/contractor.concurrency.spec.ts -g "VDR-025"` |
| VDR-026 | Input security | API: Tạo nhà thầu | P2 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-026"` |
| VDR-027 | Authorization | API: Tạo nhà thầu | P1 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-027"` |
| VDR-028 | Response contract | API: Tạo nhà thầu | P2 | `tests/api/contractors/contractor.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor.contract.spec.ts -g "VDR-028"` |
| VDR-029 | Authentication | API: Tạo nhà thầu | P1 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-029"` |
| VDR-030 | Error handling | API: Tạo nhà thầu | P3 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-030"` |
| VDR-031 | CRUD | API: Tạo nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-031"` |
| VDR-032 | Happy path | API: Xuất danh sách nhà thầu | P2 | `tests/api/contractors/contractor-export.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-export.functional.spec.ts -g "VDR-032"` |
| VDR-033 | File API | API: Xuất danh sách nhà thầu | P2 | `tests/api/contractors/contractor-export.integration.spec.ts` | `npx playwright test tests/api/contractors/contractor-export.integration.spec.ts -g "VDR-033"` |
| VDR-034 | Business rule | API: Xuất danh sách nhà thầu | P2 | `tests/api/contractors/contractor-export.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-export.functional.spec.ts -g "VDR-034"` |
| VDR-035 | Pagination/filter/sort | API: Xuất danh sách nhà thầu | P3 | `tests/api/contractors/contractor-export.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-export.functional.spec.ts -g "VDR-035"` |
| VDR-036 | Boundary | API: Xuất danh sách nhà thầu | P3 | `tests/api/contractors/contractor-export.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-export.validation.spec.ts -g "VDR-036"` |
| VDR-037 | Request validation | API: Xuất danh sách nhà thầu | P3 | `tests/api/contractors/contractor-export.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-export.validation.spec.ts -g "VDR-037"` |
| VDR-038 | Response contract | API: Xuất danh sách nhà thầu | P3 | `tests/api/contractors/contractor-export.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-export.contract.spec.ts -g "VDR-038"` |
| VDR-039 | Authentication | API: Xuất danh sách nhà thầu | P2 | `tests/api/contractors/contractor-export.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-export.security.spec.ts -g "VDR-039"` |
| VDR-040 | Error handling | API: Xuất danh sách nhà thầu | P3 | `tests/api/contractors/contractor-export.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-export.validation.spec.ts -g "VDR-040"` |
| VDR-041 | Happy path | API: Số liệu tổng quan nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-041"` |
| VDR-042 | Business rule | API: Số liệu tổng quan nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-042"` |
| VDR-043 | Business rule | API: Số liệu tổng quan nhà thầu | P3 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-043"` |
| VDR-044 | Response contract | API: Số liệu tổng quan nhà thầu | P2 | `tests/api/contractors/contractor.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor.contract.spec.ts -g "VDR-044"` |
| VDR-045 | Authentication | API: Số liệu tổng quan nhà thầu | P3 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-045"` |
| VDR-046 | Error handling | API: Số liệu tổng quan nhà thầu | P3 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-046"` |
| VDR-047 | Happy path | API: Chi tiết nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-047"` |
| VDR-048 | Business rule | API: Chi tiết nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-048"` |
| VDR-049 | Ownership/IDOR | API: Chi tiết nhà thầu | P2 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-049"` |
| VDR-050 | Request validation | API: Chi tiết nhà thầu | P3 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-050"` |
| VDR-051 | Response contract | API: Chi tiết nhà thầu | P2 | `tests/api/contractors/contractor.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor.contract.spec.ts -g "VDR-051"` |
| VDR-052 | Authentication | API: Chi tiết nhà thầu | P1 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-052"` |
| VDR-053 | Error handling | API: Chi tiết nhà thầu | P2 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-053"` |
| VDR-054 | Happy path | API: Sửa hồ sơ nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-054"` |
| VDR-055 | Business rule | API: Sửa hồ sơ nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-055"` |
| VDR-056 | Business rule | API: Sửa hồ sơ nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-056"` |
| VDR-057 | Business rule | API: Sửa hồ sơ nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-057"` |
| VDR-058 | Request validation | API: Sửa hồ sơ nhà thầu | P2 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-058"` |
| VDR-059 | Boundary | API: Sửa hồ sơ nhà thầu | P3 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-059"` |
| VDR-060 | Ownership/IDOR | API: Sửa hồ sơ nhà thầu | P2 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-060"` |
| VDR-061 | Data integrity | API: Sửa hồ sơ nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-061"` |
| VDR-062 | Response contract | API: Sửa hồ sơ nhà thầu | P2 | `tests/api/contractors/contractor.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor.contract.spec.ts -g "VDR-062"` |
| VDR-063 | Authentication | API: Sửa hồ sơ nhà thầu | P1 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-063"` |
| VDR-064 | Error handling | API: Sửa hồ sơ nhà thầu | P2 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-064"` |
| VDR-065 | Happy path | API: Xóa nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-065"` |
| VDR-066 | Business rule | API: Xóa nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-066"` |
| VDR-067 | Business rule | API: Xóa nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-067"` |
| VDR-068 | Ownership/IDOR | API: Xóa nhà thầu | P2 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-068"` |
| VDR-069 | Data integrity | API: Xóa nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-069"` |
| VDR-070 | Data integrity | API: Xóa nhà thầu | P2 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-070"` |
| VDR-071 | Request validation | API: Xóa nhà thầu | P3 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-071"` |
| VDR-072 | Response contract | API: Xóa nhà thầu | P3 | `tests/api/contractors/contractor.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor.contract.spec.ts -g "VDR-072"` |
| VDR-073 | Authentication | API: Xóa nhà thầu | P1 | `tests/api/contractors/contractor.security.spec.ts` | `npx playwright test tests/api/contractors/contractor.security.spec.ts -g "VDR-073"` |
| VDR-074 | Error handling | API: Xóa nhà thầu | P2 | `tests/api/contractors/contractor.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor.validation.spec.ts -g "VDR-074"` |
| VDR-075 | Happy path | API: Thêm đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-075"` |
| VDR-076 | Business rule | API: Thêm đầu mối nhà thầu | P1 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-076"` |
| VDR-077 | Business rule | API: Thêm đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-077"` |
| VDR-078 | Request validation | API: Thêm đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-078"` |
| VDR-079 | Boundary | API: Thêm đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-079"` |
| VDR-080 | Ownership/IDOR | API: Thêm đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-080"` |
| VDR-081 | Data integrity | API: Thêm đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-081"` |
| VDR-082 | Idempotency | API: Thêm đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.concurrency.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.concurrency.spec.ts -g "VDR-082"` |
| VDR-083 | Response contract | API: Thêm đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.contract.spec.ts -g "VDR-083"` |
| VDR-084 | Authentication | API: Thêm đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-084"` |
| VDR-085 | Error handling | API: Thêm đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-085"` |
| VDR-086 | Happy path | API: Sửa đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-086"` |
| VDR-087 | Business rule | API: Sửa đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-087"` |
| VDR-088 | Request validation | API: Sửa đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-088"` |
| VDR-089 | Boundary | API: Sửa đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-089"` |
| VDR-090 | Ownership/IDOR | API: Sửa đầu mối nhà thầu | P1 | `tests/api/contractors/contractor-contacts.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-090"` |
| VDR-091 | Data integrity | API: Sửa đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-091"` |
| VDR-092 | Request validation | API: Sửa đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-092"` |
| VDR-093 | Response contract | API: Sửa đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.contract.spec.ts -g "VDR-093"` |
| VDR-094 | Authentication | API: Sửa đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-094"` |
| VDR-095 | Error handling | API: Sửa đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-095"` |
| VDR-096 | Happy path | API: Xóa đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-096"` |
| VDR-097 | Business rule | API: Xóa đầu mối nhà thầu | P1 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-097"` |
| VDR-098 | Boundary | API: Xóa đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-098"` |
| VDR-099 | Ownership/IDOR | API: Xóa đầu mối nhà thầu | P1 | `tests/api/contractors/contractor-contacts.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-099"` |
| VDR-100 | Data integrity | API: Xóa đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-100"` |
| VDR-101 | Request validation | API: Xóa đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-101"` |
| VDR-102 | Response contract | API: Xóa đầu mối nhà thầu | P3 | `tests/api/contractors/contractor-contacts.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.contract.spec.ts -g "VDR-102"` |
| VDR-103 | Authentication | API: Xóa đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-103"` |
| VDR-104 | Error handling | API: Xóa đầu mối nhà thầu | P2 | `tests/api/contractors/contractor-contacts.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-104"` |
| VDR-105 | Happy path | API: Đính kèm tài liệu pháp lý nhà thầu | P2 | `tests/api/contractors/contractor-documents.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-105"` |
| VDR-106 | File API | API: Đính kèm tài liệu pháp lý nhà thầu | P2 | `tests/api/contractors/contractor-documents.integration.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.integration.spec.ts -g "VDR-106"` |
| VDR-107 | File API | API: Đính kèm tài liệu pháp lý nhà thầu | P2 | `tests/api/contractors/contractor-documents.integration.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.integration.spec.ts -g "VDR-107"` |
| VDR-108 | Boundary | API: Đính kèm tài liệu pháp lý nhà thầu | P2 | `tests/api/contractors/contractor-documents.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-108"` |
| VDR-109 | Request validation | API: Đính kèm tài liệu pháp lý nhà thầu | P3 | `tests/api/contractors/contractor-documents.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-109"` |
| VDR-110 | Business rule | API: Đính kèm tài liệu pháp lý nhà thầu | P2 | `tests/api/contractors/contractor-documents.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-110"` |
| VDR-111 | Ownership/IDOR | API: Đính kèm tài liệu pháp lý nhà thầu | P2 | `tests/api/contractors/contractor-documents.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-111"` |
| VDR-112 | Data integrity | API: Đính kèm tài liệu pháp lý nhà thầu | P2 | `tests/api/contractors/contractor-documents.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-112"` |
| VDR-113 | Idempotency | API: Đính kèm tài liệu pháp lý nhà thầu | P3 | `tests/api/contractors/contractor-documents.concurrency.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.concurrency.spec.ts -g "VDR-113"` |
| VDR-114 | Input security | API: Đính kèm tài liệu pháp lý nhà thầu | P3 | `tests/api/contractors/contractor-documents.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-114"` |
| VDR-115 | Response contract | API: Đính kèm tài liệu pháp lý nhà thầu | P3 | `tests/api/contractors/contractor-documents.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.contract.spec.ts -g "VDR-115"` |
| VDR-116 | Authentication | API: Đính kèm tài liệu pháp lý nhà thầu | P2 | `tests/api/contractors/contractor-documents.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-116"` |
| VDR-117 | Error handling | API: Đính kèm tài liệu pháp lý nhà thầu | P2 | `tests/api/contractors/contractor-documents.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-117"` |
| VDR-118 | Happy path | API: Tải tài liệu nhà thầu | P2 | `tests/api/contractors/contractor-documents.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-118"` |
| VDR-119 | File API | API: Tải tài liệu nhà thầu | P2 | `tests/api/contractors/contractor-documents.integration.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.integration.spec.ts -g "VDR-119"` |
| VDR-120 | Ownership/IDOR | API: Tải tài liệu nhà thầu | P1 | `tests/api/contractors/contractor-documents.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-120"` |
| VDR-121 | Response contract | API: Tải tài liệu nhà thầu | P3 | `tests/api/contractors/contractor-documents.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.contract.spec.ts -g "VDR-121"` |
| VDR-122 | Request validation | API: Tải tài liệu nhà thầu | P3 | `tests/api/contractors/contractor-documents.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-122"` |
| VDR-123 | Authentication | API: Tải tài liệu nhà thầu | P2 | `tests/api/contractors/contractor-documents.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-123"` |
| VDR-124 | Error handling | API: Tải tài liệu nhà thầu | P2 | `tests/api/contractors/contractor-documents.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-124"` |
| VDR-125 | Happy path | API: Gỡ tài liệu nhà thầu | P2 | `tests/api/contractors/contractor-documents.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-125"` |
| VDR-126 | Business rule | API: Gỡ tài liệu nhà thầu | P2 | `tests/api/contractors/contractor-documents.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-126"` |
| VDR-127 | Ownership/IDOR | API: Gỡ tài liệu nhà thầu | P1 | `tests/api/contractors/contractor-documents.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-127"` |
| VDR-128 | Data integrity | API: Gỡ tài liệu nhà thầu | P2 | `tests/api/contractors/contractor-documents.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-128"` |
| VDR-129 | Request validation | API: Gỡ tài liệu nhà thầu | P3 | `tests/api/contractors/contractor-documents.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-129"` |
| VDR-130 | Response contract | API: Gỡ tài liệu nhà thầu | P3 | `tests/api/contractors/contractor-documents.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.contract.spec.ts -g "VDR-130"` |
| VDR-131 | Authentication | API: Gỡ tài liệu nhà thầu | P2 | `tests/api/contractors/contractor-documents.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-131"` |
| VDR-132 | Error handling | API: Gỡ tài liệu nhà thầu | P2 | `tests/api/contractors/contractor-documents.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-132"` |
| VDR-133 | Happy path | API: Lịch sử thao tác nhà thầu | P2 | `tests/api/contractors/contractor-history.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-history.functional.spec.ts -g "VDR-133"` |
| VDR-134 | Pagination/filter/sort | API: Lịch sử thao tác nhà thầu | P3 | `tests/api/contractors/contractor-history.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-history.functional.spec.ts -g "VDR-134"` |
| VDR-135 | Boundary | API: Lịch sử thao tác nhà thầu | P2 | `tests/api/contractors/contractor-history.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-history.validation.spec.ts -g "VDR-135"` |
| VDR-136 | Request validation | API: Lịch sử thao tác nhà thầu | P3 | `tests/api/contractors/contractor-history.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-history.validation.spec.ts -g "VDR-136"` |
| VDR-137 | Ownership/IDOR | API: Lịch sử thao tác nhà thầu | P1 | `tests/api/contractors/contractor-history.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-history.security.spec.ts -g "VDR-137"` |
| VDR-138 | Response contract | API: Lịch sử thao tác nhà thầu | P2 | `tests/api/contractors/contractor-history.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-history.contract.spec.ts -g "VDR-138"` |
| VDR-139 | Authentication | API: Lịch sử thao tác nhà thầu | P2 | `tests/api/contractors/contractor-history.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-history.security.spec.ts -g "VDR-139"` |
| VDR-140 | Error handling | API: Lịch sử thao tác nhà thầu | P2 | `tests/api/contractors/contractor-history.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-history.validation.spec.ts -g "VDR-140"` |
| VDR-141 | Business rule | API: Lịch sử thao tác nhà thầu | P2 | `tests/api/contractors/contractor-history.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-history.functional.spec.ts -g "VDR-141"` |
| VDR-142 | Happy path | API: Kích hoạt lại nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-142"` |
| VDR-143 | State transition | API: Kích hoạt lại nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-143"` |
| VDR-144 | Business rule | API: Kích hoạt lại nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-144"` |
| VDR-145 | Request validation | API: Kích hoạt lại nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-145"` |
| VDR-146 | Boundary | API: Kích hoạt lại nhà thầu | P3 | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-146"` |
| VDR-147 | Ownership/IDOR | API: Kích hoạt lại nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-147"` |
| VDR-148 | Idempotency | API: Kích hoạt lại nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.concurrency.spec.ts -g "VDR-148"` |
| VDR-149 | Data integrity | API: Kích hoạt lại nhà thầu | P3 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-149"` |
| VDR-150 | Response contract | API: Kích hoạt lại nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.contract.spec.ts -g "VDR-150"` |
| VDR-151 | Authentication | API: Kích hoạt lại nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-151"` |
| VDR-152 | Error handling | API: Kích hoạt lại nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-152"` |
| VDR-153 | Data integrity | API: Kích hoạt lại nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-153"` |
| VDR-154 | Business rule | API: Kích hoạt lại nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-154"` |
| VDR-155 | Happy path | API: Dừng hợp tác nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-155"` |
| VDR-156 | Business rule | API: Dừng hợp tác nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-156"` |
| VDR-157 | Business rule | API: Dừng hợp tác nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-157"` |
| VDR-158 | State transition | API: Dừng hợp tác nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-158"` |
| VDR-159 | State transition | API: Dừng hợp tác nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-159"` |
| VDR-160 | Request validation | API: Dừng hợp tác nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-160"` |
| VDR-161 | Boundary | API: Dừng hợp tác nhà thầu | P3 | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-161"` |
| VDR-162 | Ownership/IDOR | API: Dừng hợp tác nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-162"` |
| VDR-163 | Idempotency | API: Dừng hợp tác nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.concurrency.spec.ts -g "VDR-163"` |
| VDR-164 | Data integrity | API: Dừng hợp tác nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-164"` |
| VDR-165 | Response contract | API: Dừng hợp tác nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.contract.spec.ts -g "VDR-165"` |
| VDR-166 | Authentication | API: Dừng hợp tác nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-166"` |
| VDR-167 | Error handling | API: Dừng hợp tác nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-167"` |
| VDR-168 | Data integrity | API: Dừng hợp tác nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-168"` |
| VDR-169 | Business rule | API: Dừng hợp tác nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-169"` |
| VDR-170 | Happy path | API: Cập nhật phân hạng nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-170"` |
| VDR-171 | Business rule | API: Cập nhật phân hạng nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-171"` |
| VDR-172 | Business rule | API: Cập nhật phân hạng nhà thầu | P1 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-172"` |
| VDR-173 | Request validation | API: Cập nhật phân hạng nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-173"` |
| VDR-174 | Boundary | API: Cập nhật phân hạng nhà thầu | P3 | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-174"` |
| VDR-175 | Ownership/IDOR | API: Cập nhật phân hạng nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-175"` |
| VDR-176 | Data integrity | API: Cập nhật phân hạng nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-176"` |
| VDR-177 | Response contract | API: Cập nhật phân hạng nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.contract.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.contract.spec.ts -g "VDR-177"` |
| VDR-178 | Authentication | API: Cập nhật phân hạng nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-178"` |
| VDR-179 | Error handling | API: Cập nhật phân hạng nhà thầu | P2 | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-179"` |
| VDR-180 | Business rule | API: Mã tự sinh của nhà thầu | P1 | `tests/api/contractors/contractor.functional.spec.ts` | `npx playwright test tests/api/contractors/contractor.functional.spec.ts -g "VDR-180"` |
| CTV-001 | Happy path | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-001"` |
| CTV-002 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-002"` |
| CTV-003 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-003"` |
| CTV-004 | Pagination/filter/sort | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-004"` |
| CTV-005 | Boundary | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-005"` |
| CTV-006 | Request validation | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-006"` |
| CTV-007 | Response contract | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-007"` |
| CTV-008 | Authentication | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-008"` |
| CTV-009 | Authentication | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-009"` |
| CTV-010 | Authorization | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-010"` |
| CTV-011 | Input security | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-011"` |
| CTV-012 | Error handling | API: Danh sách, tìm kiếm, lọc hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-012"` |
| CTV-013 | Happy path | API: Thêm hợp đồng nhà thầu đầu tiên | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-013"` |
| CTV-014 | State transition | API: Thêm hợp đồng nhà thầu đầu tiên | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-014"` |
| CTV-015 | Request validation | API: Thêm hợp đồng nhà thầu đầu tiên | P1 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-015"` |
| CTV-016 | Request validation | API: Thêm hợp đồng nhà thầu đầu tiên | P1 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-016"` |
| CTV-017 | Boundary | API: Thêm hợp đồng nhà thầu đầu tiên | P2 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-017"` |
| CTV-018 | Boundary | API: Thêm hợp đồng nhà thầu đầu tiên | P2 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-018"` |
| CTV-019 | Business rule | API: Thêm hợp đồng nhà thầu đầu tiên | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-019"` |
| CTV-020 | Business rule | API: Thêm hợp đồng nhà thầu đầu tiên | P2 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-020"` |
| CTV-021 | Data integrity | API: Thêm hợp đồng nhà thầu đầu tiên | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-021"` |
| CTV-022 | Idempotency | API: Thêm hợp đồng nhà thầu đầu tiên | P1 | `tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts -g "CTV-022"` |
| CTV-023 | Concurrency | API: Thêm hợp đồng nhà thầu đầu tiên | P2 | `tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts -g "CTV-023"` |
| CTV-024 | File API | API: Thêm hợp đồng nhà thầu đầu tiên | P2 | `tests/api/contractor-contracts/contractor-contract.integration.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.integration.spec.ts -g "CTV-024"` |
| CTV-025 | Authorization | API: Thêm hợp đồng nhà thầu đầu tiên | P2 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-025"` |
| CTV-026 | Response contract | API: Thêm hợp đồng nhà thầu đầu tiên | P2 | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-026"` |
| CTV-027 | Authentication | API: Thêm hợp đồng nhà thầu đầu tiên | P1 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-027"` |
| CTV-028 | Error handling | API: Thêm hợp đồng nhà thầu đầu tiên | P2 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-028"` |
| CTV-029 | Happy path | API: Nhà thầu cho ô chọn Thêm hợp đồng | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-029"` |
| CTV-030 | Business rule | API: Nhà thầu cho ô chọn Thêm hợp đồng | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-030"` |
| CTV-031 | Business rule | API: Nhà thầu cho ô chọn Thêm hợp đồng | P2 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-031"` |
| CTV-032 | Request validation | API: Nhà thầu cho ô chọn Thêm hợp đồng | P2 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-032"` |
| CTV-033 | Pagination/filter/sort | API: Nhà thầu cho ô chọn Thêm hợp đồng | P3 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-033"` |
| CTV-034 | Boundary | API: Nhà thầu cho ô chọn Thêm hợp đồng | P3 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-034"` |
| CTV-035 | Response contract | API: Nhà thầu cho ô chọn Thêm hợp đồng | P2 | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-035"` |
| CTV-036 | Authentication | API: Nhà thầu cho ô chọn Thêm hợp đồng | P2 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-036"` |
| CTV-037 | Error handling | API: Nhà thầu cho ô chọn Thêm hợp đồng | P3 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-037"` |
| CTV-038 | Happy path | API: Số liệu hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-038"` |
| CTV-039 | Boundary | API: Số liệu hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-039"` |
| CTV-040 | Business rule | API: Số liệu hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-040"` |
| CTV-041 | Response contract | API: Số liệu hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-041"` |
| CTV-042 | Authentication | API: Số liệu hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-042"` |
| CTV-043 | Error handling | API: Số liệu hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-043"` |
| CTV-044 | Happy path | API: Chi tiết hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-044"` |
| CTV-045 | Business rule | API: Chi tiết hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-045"` |
| CTV-046 | Business rule | API: Chi tiết hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-046"` |
| CTV-047 | Ownership/IDOR | API: Chi tiết hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-047"` |
| CTV-048 | Request validation | API: Chi tiết hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-048"` |
| CTV-049 | Response contract | API: Chi tiết hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-049"` |
| CTV-050 | Authentication | API: Chi tiết hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-050"` |
| CTV-051 | Error handling | API: Chi tiết hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-051"` |
| CTV-052 | Happy path | API: Sửa hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-052"` |
| CTV-053 | Business rule | API: Sửa hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-053"` |
| CTV-054 | Business rule | API: Sửa hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-054"` |
| CTV-055 | Business rule | API: Sửa hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-055"` |
| CTV-056 | State transition | API: Sửa hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-056"` |
| CTV-057 | Request validation | API: Sửa hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-057"` |
| CTV-058 | Boundary | API: Sửa hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-058"` |
| CTV-059 | Ownership/IDOR | API: Sửa hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-059"` |
| CTV-060 | Data integrity | API: Sửa hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-060"` |
| CTV-061 | Response contract | API: Sửa hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-061"` |
| CTV-062 | Authentication | API: Sửa hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-062"` |
| CTV-063 | Error handling | API: Sửa hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-063"` |
| CTV-064 | Happy path | API: Thêm phụ lục hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-064"` |
| CTV-065 | File API | API: Thêm phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts -g "CTV-065"` |
| CTV-066 | Boundary | API: Thêm phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-066"` |
| CTV-067 | Request validation | API: Thêm phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-067"` |
| CTV-068 | Business rule | API: Thêm phụ lục hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-068"` |
| CTV-069 | Ownership/IDOR | API: Thêm phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-069"` |
| CTV-070 | Data integrity | API: Thêm phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-070"` |
| CTV-071 | Idempotency | API: Thêm phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.concurrency.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.concurrency.spec.ts -g "CTV-071"` |
| CTV-072 | Response contract | API: Thêm phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-072"` |
| CTV-073 | Authentication | API: Thêm phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-073"` |
| CTV-074 | Error handling | API: Thêm phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-074"` |
| CTV-075 | CRUD | API: Thêm phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-075"` |
| CTV-076 | Happy path | API: Sửa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-076"` |
| CTV-077 | Business rule | API: Sửa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-077"` |
| CTV-078 | Business rule | API: Sửa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-078"` |
| CTV-079 | Request validation | API: Sửa phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-079"` |
| CTV-080 | Boundary | API: Sửa phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-080"` |
| CTV-081 | Ownership/IDOR | API: Sửa phụ lục hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-081"` |
| CTV-082 | Data integrity | API: Sửa phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-082"` |
| CTV-083 | Request validation | API: Sửa phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-083"` |
| CTV-084 | Response contract | API: Sửa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-084"` |
| CTV-085 | Authentication | API: Sửa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-085"` |
| CTV-086 | Error handling | API: Sửa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-086"` |
| CTV-087 | Happy path | API: Xóa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-087"` |
| CTV-088 | Business rule | API: Xóa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-088"` |
| CTV-089 | Ownership/IDOR | API: Xóa phụ lục hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-089"` |
| CTV-090 | Data integrity | API: Xóa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-090"` |
| CTV-091 | Request validation | API: Xóa phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-091"` |
| CTV-092 | Response contract | API: Xóa phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-092"` |
| CTV-093 | Authentication | API: Xóa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-093"` |
| CTV-094 | Error handling | API: Xóa phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-094"` |
| CTV-095 | Happy path | API: Tải phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-095"` |
| CTV-096 | File API | API: Tải phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts -g "CTV-096"` |
| CTV-097 | Ownership/IDOR | API: Tải phụ lục hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-097"` |
| CTV-098 | Response contract | API: Tải phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-098"` |
| CTV-099 | Request validation | API: Tải phụ lục hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-099"` |
| CTV-100 | Authentication | API: Tải phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-100"` |
| CTV-101 | Error handling | API: Tải phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-101"` |
| CTV-102 | Business rule | API: Tải phụ lục hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-102"` |
| CTV-103 | Happy path | API: Xem phụ lục PDF trong trình xem | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-103"` |
| CTV-104 | File API | API: Xem phụ lục PDF trong trình xem | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts -g "CTV-104"` |
| CTV-105 | Business rule | API: Xem phụ lục PDF trong trình xem | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-105"` |
| CTV-106 | Ownership/IDOR | API: Xem phụ lục PDF trong trình xem | P1 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-106"` |
| CTV-107 | Response contract | API: Xem phụ lục PDF trong trình xem | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-107"` |
| CTV-108 | Request validation | API: Xem phụ lục PDF trong trình xem | P3 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-108"` |
| CTV-109 | Authentication | API: Xem phụ lục PDF trong trình xem | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-109"` |
| CTV-110 | Error handling | API: Xem phụ lục PDF trong trình xem | P2 | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-110"` |
| CTV-111 | Happy path | API: Cấu hình tự động gia hạn | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-111"` |
| CTV-112 | Business rule | API: Cấu hình tự động gia hạn | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-112"` |
| CTV-113 | Boundary | API: Cấu hình tự động gia hạn | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-113"` |
| CTV-114 | Request validation | API: Cấu hình tự động gia hạn | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-114"` |
| CTV-115 | Business rule | API: Cấu hình tự động gia hạn | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-115"` |
| CTV-116 | State transition | API: Cấu hình tự động gia hạn | P3 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-116"` |
| CTV-117 | Ownership/IDOR | API: Cấu hình tự động gia hạn | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-117"` |
| CTV-118 | Data integrity | API: Cấu hình tự động gia hạn | P3 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-118"` |
| CTV-119 | Response contract | API: Cấu hình tự động gia hạn | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-119"` |
| CTV-120 | Authentication | API: Cấu hình tự động gia hạn | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-120"` |
| CTV-121 | Error handling | API: Cấu hình tự động gia hạn | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-121"` |
| CTV-122 | Business rule | API: Cấu hình tự động gia hạn | P1 | Thủ công | - |
| CTV-123 | Business rule | API: Cấu hình tự động gia hạn | P2 | Thủ công | - |
| CTV-124 | Idempotency | API: Cấu hình tự động gia hạn | P1 | Thủ công | - |
| CTV-125 | Business rule | API: Cấu hình tự động gia hạn | P2 | Thủ công | - |
| CTV-126 | Business rule | API: Cấu hình tự động gia hạn | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-126"` |
| CTV-127 | Business rule | API: Cấu hình tự động gia hạn | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-127"` |
| CTV-128 | Happy path | API: Hủy hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-128"` |
| CTV-129 | State transition | API: Hủy hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-129"` |
| CTV-130 | Business rule | API: Hủy hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-130"` |
| CTV-131 | Request validation | API: Hủy hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-131"` |
| CTV-132 | Boundary | API: Hủy hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-132"` |
| CTV-133 | Ownership/IDOR | API: Hủy hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-133"` |
| CTV-134 | Idempotency | API: Hủy hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts -g "CTV-134"` |
| CTV-135 | Data integrity | API: Hủy hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-135"` |
| CTV-136 | Response contract | API: Hủy hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-136"` |
| CTV-137 | Authentication | API: Hủy hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-137"` |
| CTV-138 | Error handling | API: Hủy hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-138"` |
| CTV-139 | Happy path | API: Gia hạn hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-139"` |
| CTV-140 | State transition | API: Gia hạn hợp đồng nhà thầu | P1 | Thủ công | - |
| CTV-141 | Business rule | API: Gia hạn hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-141"` |
| CTV-142 | Business rule | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-142"` |
| CTV-143 | Business rule | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-143"` |
| CTV-144 | Boundary | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-144"` |
| CTV-145 | Request validation | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-145"` |
| CTV-146 | File API | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts -g "CTV-146"` |
| CTV-147 | Ownership/IDOR | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-147"` |
| CTV-148 | Idempotency | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts -g "CTV-148"` |
| CTV-149 | Data integrity | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-149"` |
| CTV-150 | Response contract | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-150"` |
| CTV-151 | Authentication | API: Gia hạn hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-151"` |
| CTV-152 | Error handling | API: Gia hạn hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-152"` |
| CTV-153 | Happy path | API: Tải file scan hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts -g "CTV-153"` |
| CTV-154 | File API | API: Tải file scan hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-files.integration.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.integration.spec.ts -g "CTV-154"` |
| CTV-155 | Ownership/IDOR | API: Tải file scan hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-files.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.security.spec.ts -g "CTV-155"` |
| CTV-156 | Response contract | API: Tải file scan hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-files.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.contract.spec.ts -g "CTV-156"` |
| CTV-157 | Request validation | API: Tải file scan hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts -g "CTV-157"` |
| CTV-158 | Authentication | API: Tải file scan hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-files.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.security.spec.ts -g "CTV-158"` |
| CTV-159 | Error handling | API: Tải file scan hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts -g "CTV-159"` |
| CTV-160 | Business rule | API: Tải file scan hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts -g "CTV-160"` |
| CTV-161 | Happy path | API: Lịch sử thao tác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts -g "CTV-161"` |
| CTV-162 | Pagination/filter/sort | API: Lịch sử thao tác hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts -g "CTV-162"` |
| CTV-163 | Boundary | API: Lịch sử thao tác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts -g "CTV-163"` |
| CTV-164 | Request validation | API: Lịch sử thao tác hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts -g "CTV-164"` |
| CTV-165 | Ownership/IDOR | API: Lịch sử thao tác hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-history.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.security.spec.ts -g "CTV-165"` |
| CTV-166 | Response contract | API: Lịch sử thao tác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-history.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.contract.spec.ts -g "CTV-166"` |
| CTV-167 | Authentication | API: Lịch sử thao tác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-history.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.security.spec.ts -g "CTV-167"` |
| CTV-168 | Error handling | API: Lịch sử thao tác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts -g "CTV-168"` |
| CTV-169 | Happy path | API: Tái ký hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-169"` |
| CTV-170 | Business rule | API: Tái ký hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-170"` |
| CTV-171 | State transition | API: Tái ký hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-171"` |
| CTV-172 | Business rule | API: Tái ký hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-172"` |
| CTV-173 | Business rule | API: Tái ký hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-173"` |
| CTV-174 | Business rule | API: Tái ký hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-174"` |
| CTV-175 | Request validation | API: Tái ký hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-175"` |
| CTV-176 | Boundary | API: Tái ký hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-176"` |
| CTV-177 | Ownership/IDOR | API: Tái ký hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-177"` |
| CTV-178 | Idempotency | API: Tái ký hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts -g "CTV-178"` |
| CTV-179 | Data integrity | API: Tái ký hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-179"` |
| CTV-180 | File API | API: Tái ký hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts -g "CTV-180"` |
| CTV-181 | Response contract | API: Tái ký hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-181"` |
| CTV-182 | Authentication | API: Tái ký hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-182"` |
| CTV-183 | Error handling | API: Tái ký hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-183"` |
| CTV-184 | Happy path | API: Dừng khai thác hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-184"` |
| CTV-185 | Business rule | API: Dừng khai thác hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-185"` |
| CTV-186 | State transition | API: Dừng khai thác hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-186"` |
| CTV-187 | Business rule | API: Dừng khai thác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-187"` |
| CTV-188 | Request validation | API: Dừng khai thác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-188"` |
| CTV-189 | Boundary | API: Dừng khai thác hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-189"` |
| CTV-190 | Ownership/IDOR | API: Dừng khai thác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-190"` |
| CTV-191 | Idempotency | API: Dừng khai thác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts -g "CTV-191"` |
| CTV-192 | Data integrity | API: Dừng khai thác hợp đồng nhà thầu | P3 | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-192"` |
| CTV-193 | Response contract | API: Dừng khai thác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-193"` |
| CTV-194 | Authentication | API: Dừng khai thác hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-194"` |
| CTV-195 | Error handling | API: Dừng khai thác hợp đồng nhà thầu | P2 | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-195"` |
| CTV-196 | Business rule | API: Mã tự sinh của hợp đồng nhà thầu | P1 | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-196"` |
| FLOW-LEAD-001 | Flow/end-to-end API | Luồng API: Lead → Hợp đồng đầu tiên → Khách hàng chính thức | P1 | `tests/flows/lead-to-customer.flow.spec.ts` | `npx playwright test tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-001"` |
| FLOW-LEAD-002 | Flow/end-to-end API | Luồng API: Lead → Hợp đồng đầu tiên → Khách hàng chính thức | P1 | `tests/flows/lead-to-customer.flow.spec.ts` | `npx playwright test tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-002"` |
| FLOW-LEAD-003 | Flow/end-to-end API | Luồng API: Lead → Hợp đồng đầu tiên → Khách hàng chính thức | P1 | `tests/flows/lead-to-customer.flow.spec.ts` | `npx playwright test tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-003"` |
| FLOW-LEAD-004 | Flow/end-to-end API | Luồng API: Lead → Hợp đồng đầu tiên → Khách hàng chính thức | P2 | `tests/flows/lead-to-customer.flow.spec.ts` | `npx playwright test tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-004"` |
| FLOW-LEAD-005 | Flow/end-to-end API | Luồng API: Lead → Hợp đồng đầu tiên → Khách hàng chính thức | P1 | `tests/flows/lead-to-customer.flow.spec.ts` | `npx playwright test tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-005"` |
| FLOW-LEAD-006 | Flow/end-to-end API | Luồng API: Lead → Hợp đồng đầu tiên → Khách hàng chính thức | P1 | `tests/flows/lead-to-customer.flow.spec.ts` | `npx playwright test tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-006"` |
| FLOW-LEAD-007 | Flow/end-to-end API | Luồng API: Lead → Hợp đồng đầu tiên → Khách hàng chính thức | P2 | `tests/flows/lead-to-customer.flow.spec.ts` | `npx playwright test tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-007"` |
| FLOW-CTR-001 | Flow/end-to-end API | Luồng API: Vòng đời hợp đồng khách hàng | P1 | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-001"` |
| FLOW-CTR-002 | Flow/end-to-end API | Luồng API: Vòng đời hợp đồng khách hàng | P1 | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-002"` |
| FLOW-CTR-003 | Flow/end-to-end API | Luồng API: Vòng đời hợp đồng khách hàng | P1 | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-003"` |
| FLOW-CTR-004 | Flow/end-to-end API | Luồng API: Vòng đời hợp đồng khách hàng | P1 | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-004"` |
| FLOW-CTR-005 | Flow/end-to-end API | Luồng API: Vòng đời hợp đồng khách hàng | P1 | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-005"` |
| FLOW-CTR-006 | Flow/end-to-end API | Luồng API: Vòng đời hợp đồng khách hàng | P2 | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-006"` |
| FLOW-VDR-001 | Flow/end-to-end API | Luồng API: Nhà thầu → Hợp đồng nhà thầu | P1 | `tests/flows/contractor-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-001"` |
| FLOW-VDR-002 | Flow/end-to-end API | Luồng API: Nhà thầu → Hợp đồng nhà thầu | P2 | `tests/flows/contractor-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-002"` |
| FLOW-VDR-003 | Flow/end-to-end API | Luồng API: Nhà thầu → Hợp đồng nhà thầu | P1 | `tests/flows/contractor-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-003"` |
| FLOW-VDR-004 | Flow/end-to-end API | Luồng API: Nhà thầu → Hợp đồng nhà thầu | P1 | `tests/flows/contractor-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-004"` |
| FLOW-VDR-005 | Flow/end-to-end API | Luồng API: Nhà thầu → Hợp đồng nhà thầu | P1 | `tests/flows/contractor-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-005"` |
| FLOW-VDR-006 | Flow/end-to-end API | Luồng API: Nhà thầu → Hợp đồng nhà thầu | P1 | `tests/flows/contractor-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-006"` |
| FLOW-VDR-007 | Flow/end-to-end API | Luồng API: Nhà thầu → Hợp đồng nhà thầu | P1 | `tests/flows/contractor-lifecycle.flow.spec.ts` | `npx playwright test tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-007"` |
| UI-LEAD-001 | Hiển thị trang | UI: Danh sách Lead | P1 | `tests/ui/lead-list/lead-list.functional.spec.ts` | `npx playwright test tests/ui/lead-list/lead-list.functional.spec.ts -g "UI-LEAD-001"` |
| UI-LEAD-002 | Bảng danh sách | UI: Danh sách Lead | P1 | `tests/ui/lead-list/lead-list.functional.spec.ts` | `npx playwright test tests/ui/lead-list/lead-list.functional.spec.ts -g "UI-LEAD-002"` |
| UI-LEAD-003 | Hiển thị dữ liệu | UI: Danh sách Lead | P2 | `tests/ui/lead-list/lead-list.functional.spec.ts` | `npx playwright test tests/ui/lead-list/lead-list.functional.spec.ts -g "UI-LEAD-003"` |
| UI-LEAD-004 | Upload/download | UI: Danh sách Lead | P2 | `tests/ui/lead-list/lead-list.functional.spec.ts` | `npx playwright test tests/ui/lead-list/lead-list.functional.spec.ts -g "UI-LEAD-004"` |
| UI-LEAD-005 | Phân quyền UI | UI: Danh sách Lead | P2 | `tests/ui/lead-list/lead-list.access.spec.ts` | `npx playwright test tests/ui/lead-list/lead-list.access.spec.ts -g "UI-LEAD-005"` |
| UI-LEAD-006 | Session | UI: Danh sách Lead | P1 | `tests/ui/lead-list/lead-list.access.spec.ts` | `npx playwright test tests/ui/lead-list/lead-list.access.spec.ts -g "UI-LEAD-006"` |
| UI-LEAD-007 | Responsive | UI: Danh sách Lead | P3 | `tests/ui/lead-list/lead-list.responsive.spec.ts` | `npx playwright test tests/ui/lead-list/lead-list.responsive.spec.ts -g "UI-LEAD-007"` |
| UI-LEAD-008 | Accessibility | UI: Danh sách Lead | P3 | `tests/ui/lead-list/lead-list.a11y.spec.ts` | `npx playwright test tests/ui/lead-list/lead-list.a11y.spec.ts -g "UI-LEAD-008"` |
| UI-LEAD-009 | Visual regression | UI: Danh sách Lead | P3 | `tests/ui/lead-list/lead-list.visual.spec.ts` | `npx playwright test tests/ui/lead-list/lead-list.visual.spec.ts -g "UI-LEAD-009"` |
| UI-LEADF-001 | Form validation | UI: Thêm mới và chi tiết Lead | P1 | `tests/ui/lead-form/lead-form.validation.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-001"` |
| UI-LEADF-002 | Form validation | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.validation.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-002"` |
| UI-LEADF-003 | Thao tác form | UI: Thêm mới và chi tiết Lead | P1 | `tests/ui/lead-form/lead-form.functional.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-003"` |
| UI-LEADF-004 | Thông báo | UI: Thêm mới và chi tiết Lead | P1 | `tests/ui/lead-form/lead-form.functional.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-004"` |
| UI-LEADF-005 | Trạng thái UI | UI: Thêm mới và chi tiết Lead | P1 | `tests/ui/lead-form/lead-form.validation.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-005"` |
| UI-LEADF-006 | Thao tác form | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.functional.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-006"` |
| UI-LEADF-007 | Thao tác form | UI: Thêm mới và chi tiết Lead | P1 | `tests/ui/lead-form/lead-form.functional.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-007"` |
| UI-LEADF-008 | Error handling | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.validation.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-008"` |
| UI-LEADF-009 | Upload/download | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.functional.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-009"` |
| UI-LEADF-010 | Form validation | UI: Thêm mới và chi tiết Lead | P1 | `tests/ui/lead-form/lead-form.validation.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-010"` |
| UI-LEADF-011 | Form validation | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.validation.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-011"` |
| UI-LEADF-012 | Form validation | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.validation.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-012"` |
| UI-LEADF-013 | Form validation | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.validation.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-013"` |
| UI-LEADF-014 | Thao tác form | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.functional.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-014"` |
| UI-LEADF-015 | Form validation | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.validation.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-015"` |
| UI-LEADF-016 | Upload/download | UI: Thêm mới và chi tiết Lead | P2 | `tests/ui/lead-form/lead-form.functional.spec.ts` | `npx playwright test tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-016"` |
| UI-CTR-001 | Thao tác form | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P1 | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-001"` |
| UI-CTR-002 | Form validation | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P1 | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-002"` |
| UI-CTR-003 | Upload/download | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P2 | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-003"` |
| UI-CTR-004 | Thông báo | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P1 | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-004"` |
| UI-CTR-005 | Trạng thái UI | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P1 | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-005"` |
| UI-CTR-006 | Thông báo | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P2 | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-006"` |
| UI-CTR-007 | Hiển thị dữ liệu | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P3 | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-007"` |
| UI-CTR-008 | Điều hướng | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P3 | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-008"` |
| UI-CTR-009 | Form validation | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P1 | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-009"` |
| UI-CTR-010 | Form validation | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P2 | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-010"` |
| UI-CTR-011 | Upload/download | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P2 | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-011"` |
| UI-CTR-012 | Form validation | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P2 | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-012"` |
| UI-CTR-013 | Hiển thị dữ liệu | UI: Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng | P2 | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | `npx playwright test tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-013"` |
| UI-CUS-001 | Bảng danh sách | UI: Danh sách và chi tiết khách hàng | P2 | `tests/ui/customers/customers.functional.spec.ts` | `npx playwright test tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-001"` |
| UI-CUS-002 | Hiển thị dữ liệu | UI: Danh sách và chi tiết khách hàng | P2 | `tests/ui/customers/customers.functional.spec.ts` | `npx playwright test tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-002"` |
| UI-CUS-003 | Thao tác form | UI: Danh sách và chi tiết khách hàng | P1 | `tests/ui/customers/customers.functional.spec.ts` | `npx playwright test tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-003"` |
| UI-CUS-004 | Phân quyền UI | UI: Danh sách và chi tiết khách hàng | P1 | `tests/ui/customers/customers.access.spec.ts` | `npx playwright test tests/ui/customers/customers.access.spec.ts -g "UI-CUS-004"` |
| UI-CUS-005 | Form validation | UI: Danh sách và chi tiết khách hàng | P3 | `tests/ui/customers/customers.validation.spec.ts` | `npx playwright test tests/ui/customers/customers.validation.spec.ts -g "UI-CUS-005"` |
| UI-CUS-006 | Form validation | UI: Danh sách và chi tiết khách hàng | P1 | `tests/ui/customers/customers.validation.spec.ts` | `npx playwright test tests/ui/customers/customers.validation.spec.ts -g "UI-CUS-006"` |
| UI-CUS-007 | Form validation | UI: Danh sách và chi tiết khách hàng | P2 | `tests/ui/customers/customers.validation.spec.ts` | `npx playwright test tests/ui/customers/customers.validation.spec.ts -g "UI-CUS-007"` |
| UI-CUS-008 | Form validation | UI: Danh sách và chi tiết khách hàng | P2 | `tests/ui/customers/customers.validation.spec.ts` | `npx playwright test tests/ui/customers/customers.validation.spec.ts -g "UI-CUS-008"` |
| UI-CUS-009 | Thao tác form | UI: Danh sách và chi tiết khách hàng | P2 | `tests/ui/customers/customers.functional.spec.ts` | `npx playwright test tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-009"` |
| UI-CUS-010 | Hiển thị dữ liệu | UI: Danh sách và chi tiết khách hàng | P1 | `tests/ui/customers/customers.functional.spec.ts` | `npx playwright test tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-010"` |
| UI-VDR-001 | Hiển thị trang | UI: Danh sách và thêm mới nhà thầu | P1 | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | `npx playwright test tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-001"` |
| UI-VDR-002 | Bảng danh sách | UI: Danh sách và thêm mới nhà thầu | P2 | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | `npx playwright test tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-002"` |
| UI-VDR-003 | Form validation | UI: Danh sách và thêm mới nhà thầu | P1 | `tests/ui/contractor-list/contractor-list.validation.spec.ts` | `npx playwright test tests/ui/contractor-list/contractor-list.validation.spec.ts -g "UI-VDR-003"` |
| UI-VDR-004 | Thao tác form | UI: Danh sách và thêm mới nhà thầu | P1 | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | `npx playwright test tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-004"` |
| UI-VDR-005 | Thông báo | UI: Danh sách và thêm mới nhà thầu | P2 | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | `npx playwright test tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-005"` |
| UI-VDR-006 | Upload/download | UI: Danh sách và thêm mới nhà thầu | P3 | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | `npx playwright test tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-006"` |
| UI-VDR-007 | Form validation | UI: Danh sách và thêm mới nhà thầu | P1 | `tests/ui/contractor-list/contractor-list.validation.spec.ts` | `npx playwright test tests/ui/contractor-list/contractor-list.validation.spec.ts -g "UI-VDR-007"` |
| UI-VDR-008 | Upload/download | UI: Danh sách và thêm mới nhà thầu | P2 | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | `npx playwright test tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-008"` |
| UI-VDRD-001 | Hiển thị dữ liệu | UI: Chi tiết nhà thầu | P1 | `tests/ui/contractor-detail/contractor-detail.functional.spec.ts` | `npx playwright test tests/ui/contractor-detail/contractor-detail.functional.spec.ts -g "UI-VDRD-001"` |
| UI-VDRD-002 | Trạng thái UI | UI: Chi tiết nhà thầu | P1 | `tests/ui/contractor-detail/contractor-detail.validation.spec.ts` | `npx playwright test tests/ui/contractor-detail/contractor-detail.validation.spec.ts -g "UI-VDRD-002"` |
| UI-VDRD-003 | Trạng thái UI | UI: Chi tiết nhà thầu | P2 | `tests/ui/contractor-detail/contractor-detail.validation.spec.ts` | `npx playwright test tests/ui/contractor-detail/contractor-detail.validation.spec.ts -g "UI-VDRD-003"` |
| UI-VDRD-004 | Điều hướng | UI: Chi tiết nhà thầu | P3 | `tests/ui/contractor-detail/contractor-detail.functional.spec.ts` | `npx playwright test tests/ui/contractor-detail/contractor-detail.functional.spec.ts -g "UI-VDRD-004"` |
| UI-VDRD-005 | Hiển thị dữ liệu | UI: Chi tiết nhà thầu | P1 | `tests/ui/contractor-detail/contractor-detail.functional.spec.ts` | `npx playwright test tests/ui/contractor-detail/contractor-detail.functional.spec.ts -g "UI-VDRD-005"` |
| UI-VDRD-006 | Form validation | UI: Chi tiết nhà thầu | P2 | `tests/ui/contractor-detail/contractor-detail.validation.spec.ts` | `npx playwright test tests/ui/contractor-detail/contractor-detail.validation.spec.ts -g "UI-VDRD-006"` |
| UI-VDRD-007 | Thao tác form | UI: Chi tiết nhà thầu | P1 | `tests/ui/contractor-detail/contractor-detail.functional.spec.ts` | `npx playwright test tests/ui/contractor-detail/contractor-detail.functional.spec.ts -g "UI-VDRD-007"` |
| UI-VDRD-008 | Trạng thái UI | UI: Chi tiết nhà thầu | P2 | `tests/ui/contractor-detail/contractor-detail.validation.spec.ts` | `npx playwright test tests/ui/contractor-detail/contractor-detail.validation.spec.ts -g "UI-VDRD-008"` |
| UI-CTV-001 | Thao tác form | UI: Thêm và chi tiết hợp đồng nhà thầu | P1 | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-001"` |
| UI-CTV-002 | Form validation | UI: Thêm và chi tiết hợp đồng nhà thầu | P1 | `tests/ui/contractor-contract/contractor-contract.validation.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.validation.spec.ts -g "UI-CTV-002"` |
| UI-CTV-003 | Upload/download | UI: Thêm và chi tiết hợp đồng nhà thầu | P2 | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-003"` |
| UI-CTV-004 | Thông báo | UI: Thêm và chi tiết hợp đồng nhà thầu | P1 | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-004"` |
| UI-CTV-005 | Trạng thái UI | UI: Thêm và chi tiết hợp đồng nhà thầu | P1 | `tests/ui/contractor-contract/contractor-contract.validation.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.validation.spec.ts -g "UI-CTV-005"` |
| UI-CTV-006 | Form validation | UI: Thêm và chi tiết hợp đồng nhà thầu | P1 | `tests/ui/contractor-contract/contractor-contract.validation.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.validation.spec.ts -g "UI-CTV-006"` |
| UI-CTV-007 | Upload/download | UI: Thêm và chi tiết hợp đồng nhà thầu | P2 | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-007"` |
| UI-CTV-008 | Thao tác form | UI: Thêm và chi tiết hợp đồng nhà thầu | P2 | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-008"` |
| UI-CTV-009 | Form validation | UI: Thêm và chi tiết hợp đồng nhà thầu | P2 | `tests/ui/contractor-contract/contractor-contract.validation.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.validation.spec.ts -g "UI-CTV-009"` |
| UI-CTV-010 | Hiển thị dữ liệu | UI: Thêm và chi tiết hợp đồng nhà thầu | P2 | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | `npx playwright test tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-010"` |
| UI-COM-001 | Bảng danh sách | UI: Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module | P2 | `tests/ui/common/common.functional.spec.ts` | `npx playwright test tests/ui/common/common.functional.spec.ts -g "UI-COM-001"` |
| UI-COM-002 | Bảng danh sách | UI: Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module | P2 | `tests/ui/common/common.functional.spec.ts` | `npx playwright test tests/ui/common/common.functional.spec.ts -g "UI-COM-002"` |
| UI-COM-003 | Upload/download | UI: Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module | P2 | `tests/ui/common/common.functional.spec.ts` | `npx playwright test tests/ui/common/common.functional.spec.ts -g "UI-COM-003"` |
| UI-COM-004 | Phân quyền UI | UI: Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module | P1 | `tests/ui/common/common.access.spec.ts` | `npx playwright test tests/ui/common/common.access.spec.ts -g "UI-COM-004"` |

## 5. Chi tiết file test

### tests/api/leads/lead.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | LEAD-001..LEAD-005, LEAD-014..LEAD-015, LEAD-022..LEAD-027, LEAD-035, LEAD-037..LEAD-041, LEAD-075..LEAD-077, LEAD-081..LEAD-083, LEAD-089..LEAD-090, LEAD-093..LEAD-095, LEAD-097, LEAD-101..LEAD-105, LEAD-219 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead.functional.spec.ts` |

### tests/api/leads/lead.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | LEAD-006..LEAD-007, LEAD-013, LEAD-016..LEAD-021, LEAD-034, LEAD-036, LEAD-044, LEAD-080, LEAD-085, LEAD-088, LEAD-091..LEAD-092, LEAD-100 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead.validation.spec.ts` |

### tests/api/leads/lead.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | LEAD-008, LEAD-031, LEAD-042, LEAD-078, LEAD-086, LEAD-098 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead.contract.spec.ts` |

### tests/api/leads/lead.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | LEAD-009..LEAD-012, LEAD-030, LEAD-032..LEAD-033, LEAD-043, LEAD-079, LEAD-084, LEAD-087, LEAD-096, LEAD-099 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead.security.spec.ts` |

### tests/api/leads/lead.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | LEAD-028..LEAD-029 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead.concurrency.spec.ts` |

### tests/api/leads/lead-import-export.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | LEAD-045, LEAD-047..LEAD-049, LEAD-055..LEAD-058, LEAD-062, LEAD-068..LEAD-069 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-import-export.functional.spec.ts` |

### tests/api/leads/lead-import-export.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | LEAD-046, LEAD-059, LEAD-070..LEAD-071 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-import-export.integration.spec.ts` |

### tests/api/leads/lead-import-export.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | LEAD-050..LEAD-051, LEAD-054, LEAD-060..LEAD-061, LEAD-065, LEAD-074 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-import-export.validation.spec.ts` |

### tests/api/leads/lead-import-export.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | LEAD-052, LEAD-066, LEAD-072 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-import-export.contract.spec.ts` |

### tests/api/leads/lead-import-export.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | LEAD-053, LEAD-064, LEAD-067, LEAD-073 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-import-export.security.spec.ts` |

### tests/api/leads/lead-import-export.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | LEAD-063 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-import-export.concurrency.spec.ts` |

### tests/api/leads/lead-contacts.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | LEAD-106, LEAD-109..LEAD-110, LEAD-112, LEAD-117..LEAD-118, LEAD-121..LEAD-122, LEAD-124, LEAD-129..LEAD-131, LEAD-134, LEAD-139..LEAD-140, LEAD-143 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-contacts.functional.spec.ts` |

### tests/api/leads/lead-contacts.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | LEAD-107..LEAD-108, LEAD-116, LEAD-119..LEAD-120, LEAD-125, LEAD-128, LEAD-132, LEAD-135, LEAD-138, LEAD-144, LEAD-147 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-contacts.validation.spec.ts` |

### tests/api/leads/lead-contacts.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | LEAD-111, LEAD-115, LEAD-123, LEAD-127, LEAD-133, LEAD-137, LEAD-142, LEAD-146 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-contacts.security.spec.ts` |

### tests/api/leads/lead-contacts.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | LEAD-113, LEAD-141 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-contacts.concurrency.spec.ts` |

### tests/api/leads/lead-contacts.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | LEAD-114, LEAD-126, LEAD-136, LEAD-145 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-contacts.contract.spec.ts` |

### tests/api/leads/lead-lifecycle.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | LEAD-148..LEAD-149, LEAD-152, LEAD-155, LEAD-195..LEAD-197, LEAD-200, LEAD-205..LEAD-206, LEAD-209..LEAD-211, LEAD-213 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-lifecycle.functional.spec.ts` |

### tests/api/leads/lead-lifecycle.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | LEAD-150..LEAD-151, LEAD-158, LEAD-201, LEAD-204, LEAD-207..LEAD-208, LEAD-218 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-lifecycle.validation.spec.ts` |

### tests/api/leads/lead-lifecycle.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | LEAD-153, LEAD-198, LEAD-214..LEAD-215 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-lifecycle.concurrency.spec.ts` |

### tests/api/leads/lead-lifecycle.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | LEAD-154, LEAD-157, LEAD-199, LEAD-203, LEAD-212, LEAD-217 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-lifecycle.security.spec.ts` |

### tests/api/leads/lead-lifecycle.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | LEAD-156, LEAD-202, LEAD-216 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-lifecycle.contract.spec.ts` |

### tests/api/leads/lead-documents.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | LEAD-159, LEAD-164, LEAD-166, LEAD-172, LEAD-179..LEAD-180, LEAD-182 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-documents.functional.spec.ts` |

### tests/api/leads/lead-documents.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | LEAD-160..LEAD-161, LEAD-173 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-documents.integration.spec.ts` |

### tests/api/leads/lead-documents.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | LEAD-162..LEAD-163, LEAD-171, LEAD-176, LEAD-178, LEAD-183, LEAD-186 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-documents.validation.spec.ts` |

### tests/api/leads/lead-documents.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | LEAD-165, LEAD-168, LEAD-170, LEAD-174, LEAD-177, LEAD-181, LEAD-185 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-documents.security.spec.ts` |

### tests/api/leads/lead-documents.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | LEAD-167 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-documents.concurrency.spec.ts` |

### tests/api/leads/lead-documents.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | LEAD-169, LEAD-175, LEAD-184 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-documents.contract.spec.ts` |

### tests/api/leads/lead-history.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | LEAD-187..LEAD-188 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-history.functional.spec.ts` |

### tests/api/leads/lead-history.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | LEAD-189..LEAD-190, LEAD-194 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-history.validation.spec.ts` |

### tests/api/leads/lead-history.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | LEAD-191, LEAD-193 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-history.security.spec.ts` |

### tests/api/leads/lead-history.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | LEAD-192 |
| Project chạy | `api` |
| Tag | `@api`, `@leads`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Lead A, Lead I, Lead CONVERTED, MST ngẫu nhiên |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/leads/lead-history.contract.spec.ts` |

### tests/api/customer-contracts/contract.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTR-001..CTR-006, CTR-014..CTR-015, CTR-021..CTR-025, CTR-033..CTR-034, CTR-048, CTR-050, CTR-054..CTR-056, CTR-062..CTR-063, CTR-069..CTR-072, CTR-076, CTR-192..CTR-193 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract.functional.spec.ts` |

### tests/api/customer-contracts/contract.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTR-007..CTR-008, CTR-013, CTR-016..CTR-020, CTR-032, CTR-037, CTR-049, CTR-053, CTR-057..CTR-058, CTR-061, CTR-065, CTR-068, CTR-073..CTR-074, CTR-079 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract.validation.spec.ts` |

### tests/api/customer-contracts/contract.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTR-009, CTR-030, CTR-035, CTR-051, CTR-059, CTR-066, CTR-077 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract.contract.spec.ts` |

### tests/api/customer-contracts/contract.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTR-010..CTR-012, CTR-029, CTR-031, CTR-036, CTR-052, CTR-060, CTR-064, CTR-067, CTR-075, CTR-078 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract.security.spec.ts` |

### tests/api/customer-contracts/contract.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | CTR-026..CTR-027 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract.concurrency.spec.ts` |

### tests/api/customer-contracts/contract.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CTR-028 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract.integration.spec.ts` |

### tests/api/customer-contracts/contract-export.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTR-038, CTR-040..CTR-042 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-export.functional.spec.ts` |

### tests/api/customer-contracts/contract-export.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CTR-039 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-export.integration.spec.ts` |

### tests/api/customer-contracts/contract-export.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTR-043..CTR-044, CTR-047 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-export.validation.spec.ts` |

### tests/api/customer-contracts/contract-export.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTR-045 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-export.contract.spec.ts` |

### tests/api/customer-contracts/contract-export.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTR-046 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-export.security.spec.ts` |

### tests/api/customer-contracts/contract-annexes.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTR-080, CTR-084, CTR-086, CTR-091..CTR-093, CTR-097, CTR-102..CTR-104, CTR-106, CTR-111 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-annexes.functional.spec.ts` |

### tests/api/customer-contracts/contract-annexes.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTR-081..CTR-082, CTR-090, CTR-094..CTR-095, CTR-098, CTR-101, CTR-107, CTR-110, CTR-115, CTR-117 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-annexes.validation.spec.ts` |

### tests/api/customer-contracts/contract-annexes.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CTR-083, CTR-112 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-annexes.integration.spec.ts` |

### tests/api/customer-contracts/contract-annexes.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTR-085, CTR-089, CTR-096, CTR-100, CTR-105, CTR-109, CTR-113, CTR-116 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-annexes.security.spec.ts` |

### tests/api/customer-contracts/contract-annexes.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | CTR-087 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-annexes.concurrency.spec.ts` |

### tests/api/customer-contracts/contract-annexes.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTR-088, CTR-099, CTR-108, CTR-114 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-annexes.contract.spec.ts` |

### tests/api/customer-contracts/contract-lifecycle.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTR-118..CTR-121, CTR-126, CTR-130, CTR-132..CTR-134, CTR-140, CTR-166..CTR-171, CTR-176, CTR-181..CTR-182, CTR-185, CTR-188 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` |

### tests/api/customer-contracts/contract-lifecycle.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTR-122..CTR-123, CTR-129, CTR-135..CTR-136, CTR-143, CTR-172..CTR-173, CTR-180, CTR-183..CTR-184, CTR-191 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` |

### tests/api/customer-contracts/contract-lifecycle.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTR-124, CTR-128, CTR-138, CTR-142, CTR-174, CTR-179, CTR-186, CTR-190 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-lifecycle.security.spec.ts` |

### tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | CTR-125, CTR-139, CTR-175, CTR-187 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` |

### tests/api/customer-contracts/contract-lifecycle.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTR-127, CTR-141, CTR-178, CTR-189 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` |

### tests/api/customer-contracts/contract-lifecycle.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CTR-137, CTR-177 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-lifecycle.integration.spec.ts` |

### tests/api/customer-contracts/contract-files.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTR-144, CTR-151 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-files.functional.spec.ts` |

### tests/api/customer-contracts/contract-files.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CTR-145, CTR-152 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-files.integration.spec.ts` |

### tests/api/customer-contracts/contract-files.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTR-146, CTR-149, CTR-153, CTR-156 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-files.security.spec.ts` |

### tests/api/customer-contracts/contract-files.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTR-147, CTR-154 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-files.contract.spec.ts` |

### tests/api/customer-contracts/contract-files.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTR-148, CTR-150, CTR-155, CTR-157 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-files.validation.spec.ts` |

### tests/api/customer-contracts/contract-history.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTR-158..CTR-159 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-history.functional.spec.ts` |

### tests/api/customer-contracts/contract-history.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTR-160..CTR-161, CTR-165 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-history.validation.spec.ts` |

### tests/api/customer-contracts/contract-history.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTR-162, CTR-164 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-history.security.spec.ts` |

### tests/api/customer-contracts/contract-history.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTR-163 |
| Project chạy | `api` |
| Tag | `@api`, `@customer-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K, HĐ A ACTIVE, HĐ P PENDING, HĐ CANCELLED, file PDF |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customer-contracts/contract-history.contract.spec.ts` |

### tests/api/customers/customer.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CUS-001..CUS-005, CUS-014..CUS-015, CUS-028..CUS-029, CUS-035..CUS-041, CUS-045 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer.functional.spec.ts` |

### tests/api/customers/customer.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CUS-006..CUS-007, CUS-013, CUS-018, CUS-031, CUS-034, CUS-042..CUS-043, CUS-048 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer.validation.spec.ts` |

### tests/api/customers/customer.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CUS-008, CUS-016, CUS-032, CUS-046 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer.contract.spec.ts` |

### tests/api/customers/customer.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CUS-009..CUS-012, CUS-017, CUS-030, CUS-033, CUS-044, CUS-047 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer.security.spec.ts` |

### tests/api/customers/customer-export.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CUS-019, CUS-021..CUS-022 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-export.functional.spec.ts` |

### tests/api/customers/customer-export.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CUS-020 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-export.integration.spec.ts` |

### tests/api/customers/customer-export.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CUS-023..CUS-024, CUS-027 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-export.validation.spec.ts` |

### tests/api/customers/customer-export.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CUS-025 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-export.contract.spec.ts` |

### tests/api/customers/customer-export.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CUS-026 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-export.security.spec.ts` |

### tests/api/customers/customer-contacts.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CUS-049..CUS-050, CUS-054, CUS-059..CUS-061, CUS-065, CUS-070..CUS-072, CUS-075, CUS-080..CUS-081, CUS-084 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-contacts.functional.spec.ts` |

### tests/api/customers/customer-contacts.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CUS-051..CUS-052, CUS-058, CUS-062..CUS-063, CUS-066, CUS-069, CUS-073, CUS-076, CUS-079, CUS-085, CUS-088 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-contacts.validation.spec.ts` |

### tests/api/customers/customer-contacts.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CUS-053, CUS-057, CUS-064, CUS-068, CUS-074, CUS-078, CUS-083, CUS-087 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-contacts.security.spec.ts` |

### tests/api/customers/customer-contacts.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | CUS-055, CUS-082 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-contacts.concurrency.spec.ts` |

### tests/api/customers/customer-contacts.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CUS-056, CUS-067, CUS-077, CUS-086 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-contacts.contract.spec.ts` |

### tests/api/customers/customer-account.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CUS-089, CUS-092, CUS-094, CUS-113..CUS-114, CUS-118, CUS-122..CUS-124, CUS-128, CUS-134 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-account.functional.spec.ts` |

### tests/api/customers/customer-account.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CUS-090..CUS-091, CUS-097, CUS-115..CUS-116, CUS-121, CUS-125..CUS-126, CUS-133 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-account.validation.spec.ts` |

### tests/api/customers/customer-account.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CUS-093, CUS-096, CUS-117, CUS-120, CUS-127, CUS-132, CUS-135 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-account.security.spec.ts` |

### tests/api/customers/customer-account.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CUS-095, CUS-119, CUS-131 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-account.contract.spec.ts` |

### tests/api/customers/customer-documents.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CUS-098 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-documents.functional.spec.ts` |

### tests/api/customers/customer-documents.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CUS-099 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-documents.integration.spec.ts` |

### tests/api/customers/customer-documents.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CUS-100, CUS-103 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-documents.security.spec.ts` |

### tests/api/customers/customer-documents.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CUS-101 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-documents.contract.spec.ts` |

### tests/api/customers/customer-documents.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CUS-102, CUS-104 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-documents.validation.spec.ts` |

### tests/api/customers/customer-history.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CUS-105..CUS-106 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-history.functional.spec.ts` |

### tests/api/customers/customer-history.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CUS-107..CUS-108, CUS-112 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-history.validation.spec.ts` |

### tests/api/customers/customer-history.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CUS-109, CUS-111 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-history.security.spec.ts` |

### tests/api/customers/customer-history.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CUS-110 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-history.contract.spec.ts` |

### tests/api/customers/customer-account.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | CUS-129..CUS-130 |
| Project chạy | `api` |
| Tag | `@api`, `@customers`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | KH K có HĐ ACTIVE, đầu mối C1/C2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/customers/customer-account.concurrency.spec.ts` |

### tests/api/contractors/contractor.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | VDR-001..VDR-004, VDR-013..VDR-014, VDR-020..VDR-023, VDR-031, VDR-041..VDR-043, VDR-047..VDR-048, VDR-054..VDR-057, VDR-061, VDR-065..VDR-067, VDR-069..VDR-070, VDR-180 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor.functional.spec.ts` |

### tests/api/contractors/contractor.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | VDR-005..VDR-006, VDR-012, VDR-015..VDR-019, VDR-030, VDR-046, VDR-050, VDR-053, VDR-058..VDR-059, VDR-064, VDR-071, VDR-074 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor.validation.spec.ts` |

### tests/api/contractors/contractor.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | VDR-007, VDR-028, VDR-044, VDR-051, VDR-062, VDR-072 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor.contract.spec.ts` |

### tests/api/contractors/contractor.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | VDR-008..VDR-011, VDR-026..VDR-027, VDR-029, VDR-045, VDR-049, VDR-052, VDR-060, VDR-063, VDR-068, VDR-073 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor.security.spec.ts` |

### tests/api/contractors/contractor.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | VDR-024..VDR-025 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor.concurrency.spec.ts` |

### tests/api/contractors/contractor-export.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | VDR-032, VDR-034..VDR-035 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-export.functional.spec.ts` |

### tests/api/contractors/contractor-export.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | VDR-033 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-export.integration.spec.ts` |

### tests/api/contractors/contractor-export.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | VDR-036..VDR-037, VDR-040 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-export.validation.spec.ts` |

### tests/api/contractors/contractor-export.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | VDR-038 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-export.contract.spec.ts` |

### tests/api/contractors/contractor-export.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | VDR-039 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-export.security.spec.ts` |

### tests/api/contractors/contractor-contacts.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | VDR-075..VDR-077, VDR-081, VDR-086..VDR-087, VDR-091, VDR-096..VDR-097, VDR-100 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-contacts.functional.spec.ts` |

### tests/api/contractors/contractor-contacts.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | VDR-078..VDR-079, VDR-085, VDR-088..VDR-089, VDR-092, VDR-095, VDR-098, VDR-101, VDR-104 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-contacts.validation.spec.ts` |

### tests/api/contractors/contractor-contacts.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | VDR-080, VDR-084, VDR-090, VDR-094, VDR-099, VDR-103 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-contacts.security.spec.ts` |

### tests/api/contractors/contractor-contacts.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | VDR-082 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-contacts.concurrency.spec.ts` |

### tests/api/contractors/contractor-contacts.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | VDR-083, VDR-093, VDR-102 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-contacts.contract.spec.ts` |

### tests/api/contractors/contractor-documents.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | VDR-105, VDR-110, VDR-112, VDR-118, VDR-125..VDR-126, VDR-128 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-documents.functional.spec.ts` |

### tests/api/contractors/contractor-documents.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | VDR-106..VDR-107, VDR-119 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-documents.integration.spec.ts` |

### tests/api/contractors/contractor-documents.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | VDR-108..VDR-109, VDR-117, VDR-122, VDR-124, VDR-129, VDR-132 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-documents.validation.spec.ts` |

### tests/api/contractors/contractor-documents.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | VDR-111, VDR-114, VDR-116, VDR-120, VDR-123, VDR-127, VDR-131 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-documents.security.spec.ts` |

### tests/api/contractors/contractor-documents.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | VDR-113 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-documents.concurrency.spec.ts` |

### tests/api/contractors/contractor-documents.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | VDR-115, VDR-121, VDR-130 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-documents.contract.spec.ts` |

### tests/api/contractors/contractor-history.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | VDR-133..VDR-134, VDR-141 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-history.functional.spec.ts` |

### tests/api/contractors/contractor-history.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | VDR-135..VDR-136, VDR-140 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-history.validation.spec.ts` |

### tests/api/contractors/contractor-history.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | VDR-137, VDR-139 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-history.security.spec.ts` |

### tests/api/contractors/contractor-history.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | VDR-138 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-history.contract.spec.ts` |

### tests/api/contractors/contractor-lifecycle.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | VDR-142..VDR-144, VDR-149, VDR-153..VDR-159, VDR-164, VDR-168..VDR-172, VDR-176 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-lifecycle.functional.spec.ts` |

### tests/api/contractors/contractor-lifecycle.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | VDR-145..VDR-146, VDR-152, VDR-160..VDR-161, VDR-167, VDR-173..VDR-174, VDR-179 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-lifecycle.validation.spec.ts` |

### tests/api/contractors/contractor-lifecycle.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | VDR-147, VDR-151, VDR-162, VDR-166, VDR-175, VDR-178 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-lifecycle.security.spec.ts` |

### tests/api/contractors/contractor-lifecycle.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | VDR-148, VDR-163 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-lifecycle.concurrency.spec.ts` |

### tests/api/contractors/contractor-lifecycle.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | VDR-150, VDR-165, VDR-177 |
| Project chạy | `api` |
| Tag | `@api`, `@contractors`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, D, tài liệu mẫu |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractors/contractor-lifecycle.contract.spec.ts` |

### tests/api/contractor-contracts/contractor-contract.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTV-001..CTV-004, CTV-013..CTV-014, CTV-019..CTV-021, CTV-029..CTV-031, CTV-033, CTV-038, CTV-040, CTV-044..CTV-046, CTV-052..CTV-056, CTV-060, CTV-196 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract.functional.spec.ts` |

### tests/api/contractor-contracts/contractor-contract.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTV-005..CTV-006, CTV-012, CTV-015..CTV-018, CTV-028, CTV-032, CTV-034, CTV-037, CTV-039, CTV-043, CTV-048, CTV-051, CTV-057..CTV-058, CTV-063 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract.validation.spec.ts` |

### tests/api/contractor-contracts/contractor-contract.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTV-007, CTV-026, CTV-035, CTV-041, CTV-049, CTV-061 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract.contract.spec.ts` |

### tests/api/contractor-contracts/contractor-contract.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTV-008..CTV-011, CTV-025, CTV-027, CTV-036, CTV-042, CTV-047, CTV-050, CTV-059, CTV-062 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract.security.spec.ts` |

### tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | CTV-022..CTV-023 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts` |

### tests/api/contractor-contracts/contractor-contract.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CTV-024 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract.integration.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTV-064, CTV-068, CTV-070, CTV-075..CTV-078, CTV-082, CTV-087..CTV-088, CTV-090, CTV-095, CTV-102..CTV-103, CTV-105 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CTV-065, CTV-096, CTV-104 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTV-066..CTV-067, CTV-074, CTV-079..CTV-080, CTV-083, CTV-086, CTV-091, CTV-094, CTV-099, CTV-101, CTV-108, CTV-110 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTV-069, CTV-073, CTV-081, CTV-085, CTV-089, CTV-093, CTV-097, CTV-100, CTV-106, CTV-109 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-annexes.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | CTV-071 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.concurrency.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTV-072, CTV-084, CTV-092, CTV-098, CTV-107 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTV-111..CTV-112, CTV-115..CTV-116, CTV-118, CTV-126..CTV-130, CTV-135, CTV-139, CTV-141..CTV-143, CTV-149, CTV-169..CTV-174, CTV-179, CTV-184..CTV-187, CTV-192 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTV-113..CTV-114, CTV-121, CTV-131..CTV-132, CTV-138, CTV-144..CTV-145, CTV-152, CTV-175..CTV-176, CTV-183, CTV-188..CTV-189, CTV-195 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTV-117, CTV-120, CTV-133, CTV-137, CTV-147, CTV-151, CTV-177, CTV-182, CTV-190, CTV-194 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTV-119, CTV-136, CTV-150, CTV-181, CTV-193 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Gọi lặp và gọi đồng thời. Case Concurrency gửi `Promise.all` trên dữ liệu riêng của case. |
| Case quản lý | CTV-134, CTV-148, CTV-178, CTV-191 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@concurrency`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CTV-146, CTV-180 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTV-153, CTV-160 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-files.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Upload, tải và xuất file. |
| Case quản lý | CTV-154 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@integration`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.integration.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-files.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTV-155, CTV-158 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.security.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-files.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTV-156 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.contract.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTV-157, CTV-159 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | CTV-161..CTV-162 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@functional`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | CTV-163..CTV-164, CTV-168 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@validation`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-history.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Không token, sai token, sai role, truy cập dữ liệu ngoài phạm vi, chuỗi tấn công. |
| Case quản lý | CTV-165, CTV-167 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@security`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` (token hỏng, refresh token) |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.security.spec.ts` |

### tests/api/contractor-contracts/contractor-contract-history.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So response với schema Swagger (zod). |
| Case quản lý | CTV-166 |
| Project chạy | `api` |
| Tag | `@api`, `@contractor-contracts`, `@contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture` |
| Dữ liệu cần có | Nhà thầu N, H, N2, D với HĐ V, P, V9, phụ lục Y1/Y2 |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/api/contractor-contracts/contractor-contract-history.contract.spec.ts` |

### tests/flows/lead-to-customer.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng nghiệp vụ nhiều API. Các bước trong một case chạy tuần tự; các case độc lập với nhau. |
| Case quản lý | FLOW-LEAD-001..FLOW-LEAD-007 |
| Project chạy | `api` |
| Tag | `@flow`, `@p1`/`@p2` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` |
| Dữ liệu cần có | Tài khoản NVKD A/B, DVKH A/B, QLNT; dữ liệu tạo mới trong từng case |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/flows/lead-to-customer.flow.spec.ts` |

### tests/flows/customer-contract-lifecycle.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng nghiệp vụ nhiều API. Các bước trong một case chạy tuần tự; các case độc lập với nhau. |
| Case quản lý | FLOW-CTR-001..FLOW-CTR-006 |
| Project chạy | `api` |
| Tag | `@flow`, `@p1`/`@p2` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` |
| Dữ liệu cần có | Tài khoản NVKD A/B, DVKH A/B, QLNT; dữ liệu tạo mới trong từng case |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/flows/customer-contract-lifecycle.flow.spec.ts` |

### tests/flows/contractor-lifecycle.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng nghiệp vụ nhiều API. Các bước trong một case chạy tuần tự; các case độc lập với nhau. |
| Case quản lý | FLOW-VDR-001..FLOW-VDR-007 |
| Project chạy | `api` |
| Tag | `@flow`, `@p1`/`@p2` theo case |
| Fixture dùng | `api.fixture`, `seed.fixture`, `auth.fixture` |
| Dữ liệu cần có | Tài khoản NVKD A/B, DVKH A/B, QLNT; dữ liệu tạo mới trong từng case |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/flows/contractor-lifecycle.flow.spec.ts` |

### tests/ui/lead-list/lead-list.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | UI-LEAD-001..UI-LEAD-004 |
| Project chạy | `ui` |
| Tag | `@ui`, `@lead-list`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/lead-list/lead-list.functional.spec.ts` |

### tests/ui/lead-list/lead-list.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Phân quyền hiển thị và phiên đăng nhập. |
| Case quản lý | UI-LEAD-005..UI-LEAD-006 |
| Project chạy | `ui` |
| Tag | `@ui`, `@lead-list`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/lead-list/lead-list.access.spec.ts` |

### tests/ui/lead-list/lead-list.responsive.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Hiển thị theo kích thước màn hình. |
| Case quản lý | UI-LEAD-007 |
| Project chạy | `responsive` |
| Tag | `@ui`, `@lead-list`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/lead-list/lead-list.responsive.spec.ts` |

### tests/ui/lead-list/lead-list.a11y.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Kiểm tra trợ năng bằng axe và bàn phím. |
| Case quản lý | UI-LEAD-008 |
| Project chạy | `ui` |
| Tag | `@ui`, `@lead-list`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/lead-list/lead-list.a11y.spec.ts` |

### tests/ui/lead-list/lead-list.visual.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | So ảnh chụp màn hình với ảnh chuẩn. |
| Case quản lý | UI-LEAD-009 |
| Project chạy | `visual` |
| Tag | `@ui`, `@lead-list`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/lead-list/lead-list.visual.spec.ts` |

### tests/ui/lead-form/lead-form.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | UI-LEADF-001..UI-LEADF-002, UI-LEADF-005, UI-LEADF-008, UI-LEADF-010..UI-LEADF-013, UI-LEADF-015 |
| Project chạy | `ui` |
| Tag | `@ui`, `@lead-form`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/lead-form/lead-form.validation.spec.ts` |

### tests/ui/lead-form/lead-form.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | UI-LEADF-003..UI-LEADF-004, UI-LEADF-006..UI-LEADF-007, UI-LEADF-009, UI-LEADF-014, UI-LEADF-016 |
| Project chạy | `ui` |
| Tag | `@ui`, `@lead-form`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/lead-form/lead-form.functional.spec.ts` |

### tests/ui/customer-contract/customer-contract.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | UI-CTR-001, UI-CTR-003..UI-CTR-004, UI-CTR-006..UI-CTR-008, UI-CTR-011, UI-CTR-013 |
| Project chạy | `ui` |
| Tag | `@ui`, `@customer-contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/customer-contract/customer-contract.functional.spec.ts` |

### tests/ui/customer-contract/customer-contract.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | UI-CTR-002, UI-CTR-005, UI-CTR-009..UI-CTR-010, UI-CTR-012 |
| Project chạy | `ui` |
| Tag | `@ui`, `@customer-contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/customer-contract/customer-contract.validation.spec.ts` |

### tests/ui/customers/customers.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | UI-CUS-001..UI-CUS-003, UI-CUS-009..UI-CUS-010 |
| Project chạy | `ui` |
| Tag | `@ui`, `@customers`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/customers/customers.functional.spec.ts` |

### tests/ui/customers/customers.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Phân quyền hiển thị và phiên đăng nhập. |
| Case quản lý | UI-CUS-004 |
| Project chạy | `ui` |
| Tag | `@ui`, `@customers`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/customers/customers.access.spec.ts` |

### tests/ui/customers/customers.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | UI-CUS-005..UI-CUS-008 |
| Project chạy | `ui` |
| Tag | `@ui`, `@customers`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/customers/customers.validation.spec.ts` |

### tests/ui/contractor-list/contractor-list.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | UI-VDR-001..UI-VDR-002, UI-VDR-004..UI-VDR-006, UI-VDR-008 |
| Project chạy | `ui` |
| Tag | `@ui`, `@contractor-list`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/contractor-list/contractor-list.functional.spec.ts` |

### tests/ui/contractor-list/contractor-list.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | UI-VDR-003, UI-VDR-007 |
| Project chạy | `ui` |
| Tag | `@ui`, `@contractor-list`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/contractor-list/contractor-list.validation.spec.ts` |

### tests/ui/contractor-detail/contractor-detail.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | UI-VDRD-001, UI-VDRD-004..UI-VDRD-005, UI-VDRD-007 |
| Project chạy | `ui` |
| Tag | `@ui`, `@contractor-detail`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test. Cần 1 đầu mục giá Cố định đang hoạt động |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/contractor-detail/contractor-detail.functional.spec.ts` |

### tests/ui/contractor-detail/contractor-detail.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | UI-VDRD-002..UI-VDRD-003, UI-VDRD-006, UI-VDRD-008 |
| Project chạy | `ui` |
| Tag | `@ui`, `@contractor-detail`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/contractor-detail/contractor-detail.validation.spec.ts` |

### tests/ui/contractor-contract/contractor-contract.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | UI-CTV-001, UI-CTV-003..UI-CTV-004, UI-CTV-007..UI-CTV-008, UI-CTV-010 |
| Project chạy | `ui` |
| Tag | `@ui`, `@contractor-contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/contractor-contract/contractor-contract.functional.spec.ts` |

### tests/ui/contractor-contract/contractor-contract.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Dữ liệu sai, thiếu, giá trị biên và xử lý lỗi. |
| Case quản lý | UI-CTV-002, UI-CTV-005..UI-CTV-006, UI-CTV-009 |
| Project chạy | `ui` |
| Tag | `@ui`, `@contractor-contract`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/contractor-contract/contractor-contract.validation.spec.ts` |

### tests/ui/common/common.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng chạy đúng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu, lọc và phân trang. |
| Case quản lý | UI-COM-001..UI-COM-003 |
| Project chạy | `ui` |
| Tag | `@ui`, `@common`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/common/common.functional.spec.ts` |

### tests/ui/common/common.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Phân quyền hiển thị và phiên đăng nhập. |
| Case quản lý | UI-COM-004 |
| Project chạy | `ui` |
| Tag | `@ui`, `@common`, `@p1`/`@p2`/`@p3` theo case |
| Fixture dùng | `page.fixture`, `seed.fixture` |
| Dữ liệu cần có | Dữ liệu nền dựng bằng API qua `seed.fixture`; chỉ đi qua giao diện phần đang test |
| Dọn dữ liệu | Dữ liệu gắn `testRunId`; `cleanup.ts` xóa những gì có API xóa, phần còn lại dùng MST và số HĐ mới mỗi lần chạy |
| Lệnh chạy | `npx playwright test tests/ui/common/common.access.spec.ts` |

## 6. Dữ liệu và môi trường

- **Môi trường:** chỉ chạy trên dev `https://logx-api-dev.sonthanh.net.vn` và `https://logx-dev.sonthanh.net.vn`; không có URL production làm giá trị mặc định.
- **Tài khoản theo role** (đọc từ `.env`): NVKD A, B, C; DVKH A, B, C; QLNT; 1 NVKD và 1 DVKH bị khóa; `TENANT_CODE`. Hai tài khoản hiện có chỉ dùng khi `GET /api/auth/me` xác nhận đúng role.
- **storageState:** `tests/setup/auth.setup.ts` lưu vào `.auth/<role>.json`, đã đưa vào `.gitignore`.
- **Dữ liệu:** mỗi test tự dựng dữ liệu qua `seed.fixture` và factory, gắn `testRunId`; MST sinh ngẫu nhiên 10 số; không dùng chung bản ghi giữa test để chạy song song.
- **Dữ liệu cần seed sẵn:** HĐ khách hàng `EXPIRED`, HĐ nhà thầu Hết hiệu lực (case thủ công), đầu mục giá Cố định đang hoạt động (UI-VDRD-005).
- **Mock:** chỉ giả lập lỗi 500 phía giao diện bằng `page.route`; không có dịch vụ ngoài.
- **Dọn dữ liệu:** `cleanup.ts` chỉ xóa bản ghi có `testRunId` và chỉ khi `ALLOW_CLEANUP=true`. Lead, KH, HĐ không có API xóa nên để lại trên dev.

## 7. Báo cáo và CI

- Reporter `html` và `junit`; `trace: 'retain-on-failure'`, ảnh khi lỗi, video `retain-on-failure` cho project UI.
- Mỗi lần build: `npx playwright test --grep @p1` (smoke) trên project `api` và `ui`.
- Hằng đêm: toàn bộ project `api`, `ui`; hằng tuần: `responsive`, `visual`, `a11y`.
- Ảnh chuẩn visual cập nhật bằng `--update-snapshots` sau khi được duyệt.

## 8. Thứ tự triển khai

| Giai đoạn | File cần viết | Case chạy được | Đầu ra |
| --- | --- | --- | --- |
| 1 | `playwright.config.ts`, `package.json`, `.env.example`, `tests/setup/auth.setup.ts`, `src/fixtures/auth.fixture.ts`, `src/api/http.client.ts`, `src/api/auth.client.ts` | Không | Đăng nhập được 5 role, có storageState |
| 2 | 5 client, `src/data/*.factory.ts`, `src/fixtures/api.fixture.ts`, `src/fixtures/seed.fixture.ts` | Case `@p1` của `lead.functional`, `contract.functional`, `contractor.functional`, `contractor-contract.functional` | Tạo được dữ liệu lõi |
| 3 | Các file `.security` và `.validation` của 5 thư mục API, schema và `.contract` | Case security, validation, contract | Chặn lỗi phân quyền và validate |
| 4 | 3 file `tests/flows/` | FLOW-LEAD, FLOW-CTR, FLOW-VDR | Kiểm nối giữa các module |
| 5 | Page Object, `page.fixture.ts`, case UI `@p1` (gồm `UI-VDRD-005`) | Case UI P1 | Smoke giao diện |
| 6 | Các file API và UI còn lại, `concurrency`, `integration` | Phần còn lại | Phủ đủ case auto |
| 7 | `.responsive`, `.a11y`, `.visual`, CI | Responsive, Accessibility, Visual | Chạy định kỳ |

## 9. Điểm cần xác nhận

| Nội dung | Giả định hiện tại | Hỏi ai |
| --- | --- | --- |
| `tenantCode` và tài khoản theo role | Có đủ role như mục 6 | Người dùng / Admin |
| 6 case thủ công (CTR-131, CTV-122, CTV-123, CTV-124, CTV-125, CTV-140) | Không có file; tự động được khi có hook chạy tác vụ 0:00 và seed HĐ hết hạn | Backend / DevOps |
| Locator UI | Dùng `getByRole`, `getByLabel`; cần `data-testid` cho bảng và popup nếu nhãn không ổn định | Frontend |
| Nguồn dữ liệu tab Bảng giá dịch vụ (UI-VDRD-005) | Tab gọi API danh sách bảng giá mua lọc theo nhà thầu | Frontend |
| Các biến thể UI chờ chốt giới hạn (ghi chú Lead, dung lượng file từng màn) | Mỗi biến thể là một `test` trong cùng dòng case, ID + trường + giá trị trong tiêu đề | BA / Frontend |
| Case Concurrency chạy song song với test khác | Dùng dữ liệu riêng của case nên không cần `serial` | Tester |
