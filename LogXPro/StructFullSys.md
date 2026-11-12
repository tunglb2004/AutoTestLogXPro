# Cấu trúc project auto test Playwright — LogXPro toàn hệ thống

_Tạo lúc 2026-11-08 00:34 từ bộ case `TestcaseFullSys.md`, báo cáo API `BAO_CAO_API_PHAM_VI_FULLSYS.md`. 2071 case, 262 file._

## 1. Tóm tắt

- Project TypeScript + Playwright đặt trong thư mục gốc `AutoFullSys/`. Mỗi module có package (thư mục) cùng tên ở từng lớp: `src/<module>/`, `tests/api/<module>/`, `tests/flows/<module>/`, `tests/ui/<module>/`; phần dùng chung ở `src/core/`. 12 module: `quan-tri-phan-quyen`, `cau-hinh-chang`, `cau-hinh-dau-muc-gia`, `gia-mua-dau-vao`, `gia-mua-dinh-muc`, `gia-ban-dinh-muc`, `quan-ly-bao-gia`, `phieu-dich-vu`, `thap-dieu-phoi`, `chi-phi-doanh-thu`, `lich-su-thong-bao`, `xuyen-module`.
- 172 file spec: 117 file API, 16 file luồng, 39 file UI; chia theo loại kiểm tra (`.functional`, `.validation`, `.security`, `.contract`, `.concurrency`, `.integration`; UI thêm `.access`, `.responsive`, `.a11y`, `.visual`). File lớn nhất 50 case; nhóm vượt 50 case được tách theo đối tượng (vd `phieu-dich-vu-doanh-thu`).
- Phủ 2064/2064 case Auto = Có, mỗi case nằm ở đúng 1 file (mục 4); 7 case thủ công không vào file nào: FLOW-DEACT-015, COM-004, CR-028, CR-035, CR-036, CR-041, CR-042.
- Chạy theo module: `npx playwright test tests/api/phieu-dich-vu tests/flows/phieu-dich-vu tests/ui/phieu-dich-vu` hoặc theo tag `--grep @phieu-dich-vu`.
- Làm trước: khung `src/core` + `tests/setup`, rồi luồng `xuyen-module` (FLOW-PRICE → FLOW-E2E) vì tạo dữ liệu P0 cho mọi module.

## 2. Cấu trúc thư mục

```text
AutoFullSys/
├─ src/
│  ├─ cau-hinh-chang/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  └─ quy-tac-chang.schema.ts   schema response
│  │  │  └─ quy-tac-chang.client.ts   gọi API
│  │  ├─ data/
│  │  │  ├─ leg-sandbox.ts   fixture quy tắc chặng riêng (bổ sung)
│  │  │  ├─ leg-ui.scenario.ts   kịch bản UI cấu hình chặng (bổ sung)
│  │  │  └─ quy-tac-chang.factory.ts   dữ liệu mẫu
│  │  └─ pages/
│  │     └─ cau-hinh-chang.page.ts   Page Object
│  ├─ cau-hinh-dau-muc-gia/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  └─ dau-muc-gia.schema.ts   schema response
│  │  │  └─ dau-muc-gia.client.ts   gọi API
│  │  ├─ data/
│  │  │  └─ dau-muc-gia.factory.ts   dữ liệu mẫu
│  │  └─ pages/
│  │     └─ dau-muc-gia.page.ts   Page Object
│  ├─ chi-phi-doanh-thu/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  ├─ bao-cao-chi-phi-doanh-thu.schema.ts   schema response
│  │  │  │  └─ pnl-phieu.schema.ts   schema response
│  │  │  ├─ bao-cao-chi-phi-doanh-thu.client.ts   gọi API
│  │  │  └─ pnl-phieu.client.ts   gọi API
│  │  ├─ data/
│  │  │  ├─ bao-cao-chi-phi-doanh-thu.factory.ts   dữ liệu mẫu
│  │  │  └─ pnl-phieu.factory.ts   dữ liệu mẫu
│  │  └─ pages/
│  │     └─ chi-phi-doanh-thu.page.ts   Page Object
│  ├─ core/
│  │  ├─ data/
│  │  │  ├─ accounts.ts   dữ liệu mẫu
│  │  │  └─ p0-price-set.ts   dữ liệu mẫu
│  │  ├─ fixtures/
│  │  │  ├─ auth.fixture.ts   fixture
│  │  │  └─ test-run.fixture.ts   fixture
│  │  ├─ mocks/
│  │  │  └─ vcb-rate.mock.ts   giả lập
│  │  ├─ pages/
│  │  │  └─ components/
│  │  │     ├─ data-table.component.ts   Page Object
│  │  │     ├─ modal.component.ts   Page Object
│  │  │     ├─ sidebar-menu.component.ts   Page Object
│  │  │     └─ toast.component.ts   Page Object
│  │  ├─ assertions.ts   tiện ích
│  │  ├─ auth.client.ts   gọi API
│  │  ├─ base.client.ts   gọi API
│  │  ├─ env.ts   tiện ích
│  │  └─ money.ts   tiện ích
│  ├─ gia-ban-dinh-muc/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  └─ gia-ban-dinh-muc.schema.ts   schema response
│  │  │  └─ gia-ban-dinh-muc.client.ts   gọi API
│  │  ├─ data/
│  │  │  └─ gia-ban-dinh-muc.factory.ts   dữ liệu mẫu
│  │  └─ pages/
│  │     └─ gia-ban-dinh-muc.page.ts   Page Object
│  ├─ gia-mua-dau-vao/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  └─ bang-gia-mua.schema.ts   schema response
│  │  │  └─ bang-gia-mua.client.ts   gọi API
│  │  ├─ data/
│  │  │  ├─ bang-gia-mua.factory.ts   dữ liệu mẫu
│  │  │  ├─ pending-api-cases.ts   kịch bản API trạng thái đặc biệt (bổ sung)
│  │  │  ├─ pending-price-flows.ts   kịch bản luồng đổi giá mua (bổ sung)
│  │  │  ├─ price-flow.fixture.ts   helper luồng giá (bổ sung)
│  │  │  └─ purchase-price-ui.scenario.ts   kịch bản UI giá mua đầu vào (bổ sung)
│  │  └─ pages/
│  │     └─ gia-mua-dau-vao.page.ts   Page Object
│  ├─ gia-mua-dinh-muc/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  └─ gia-mua-dinh-muc.schema.ts   schema response
│  │  │  └─ gia-mua-dinh-muc.client.ts   gọi API
│  │  ├─ data/
│  │  │  ├─ gia-mua-dinh-muc.factory.ts   dữ liệu mẫu
│  │  │  ├─ pending-price-flows.ts   kịch bản luồng đổi giá mua định mức (bổ sung)
│  │  │  └─ standard-price-ui.scenario.ts   kịch bản UI giá mua/bán định mức (bổ sung)
│  │  └─ pages/
│  │     └─ gia-mua-dinh-muc.page.ts   Page Object
│  ├─ lich-su-thong-bao/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  └─ ty-gia-thong-bao.schema.ts   schema response
│  │  │  └─ ty-gia-thong-bao.client.ts   gọi API
│  │  ├─ data/
│  │  │  ├─ notification-ui.scenario.ts   kịch bản UI thông báo (bổ sung)
│  │  │  └─ ty-gia-thong-bao.factory.ts   dữ liệu mẫu
│  │  └─ pages/
│  │     └─ thong-bao.page.ts   Page Object
│  ├─ phieu-dich-vu/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  └─ phieu-dich-vu.schema.ts   schema response
│  │  │  └─ phieu-dich-vu.client.ts   gọi API
│  │  ├─ data/
│  │  │  ├─ operations-ui.ts   helper UI vận hành phiếu (bổ sung)
│  │  │  ├─ order-create-ui.ts   helper UI tạo phiếu (bổ sung)
│  │  │  └─ phieu-dich-vu.factory.ts   dữ liệu mẫu
│  │  └─ pages/
│  │     └─ phieu-dich-vu.page.ts   Page Object
│  ├─ quan-ly-bao-gia/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  ├─ bgkh.schema.ts   schema response
│  │  │  │  ├─ bgnb.schema.ts   schema response
│  │  │  │  └─ ycbg.schema.ts   schema response
│  │  │  ├─ bgkh.client.ts   gọi API
│  │  │  ├─ bgnb.client.ts   gọi API
│  │  │  └─ ycbg.client.ts   gọi API
│  │  ├─ data/
│  │  │  ├─ bgkh.factory.ts   dữ liệu mẫu
│  │  │  ├─ bgnb.factory.ts   dữ liệu mẫu
│  │  │  ├─ quote-scenario.factory.ts   kịch bản báo giá (bổ sung)
│  │  │  ├─ quote-ui.fixture.ts   fixture trang báo giá (bổ sung)
│  │  │  ├─ quote-ui.scenario.ts   kịch bản UI YCBG/BGKH (bổ sung)
│  │  │  ├─ remaining-quote-api.scenario.ts   kịch bản API báo giá còn lại (bổ sung)
│  │  │  └─ ycbg.factory.ts   dữ liệu mẫu
│  │  └─ pages/
│  │     ├─ bgkh.page.ts   Page Object
│  │     ├─ bgnb.page.ts   Page Object
│  │     └─ ycbg.page.ts   Page Object
│  ├─ quan-tri-phan-quyen/
│  │  ├─ api/
│  │  │  ├─ schemas/
│  │  │  │  ├─ bo-phan.schema.ts   schema response
│  │  │  │  ├─ nguoi-dung.schema.ts   schema response
│  │  │  │  ├─ vai-tro.schema.ts   schema response
│  │  │  │  └─ xac-thuc.schema.ts   schema response
│  │  │  ├─ bo-phan.client.ts   gọi API
│  │  │  ├─ nguoi-dung.client.ts   gọi API
│  │  │  ├─ vai-tro.client.ts   gọi API
│  │  │  └─ xac-thuc.client.ts   gọi API
│  │  ├─ data/
│  │  │  ├─ admin-pending.factory.ts   helper quản trị (bổ sung)
│  │  │  ├─ admin-ui.scenario.ts   kịch bản UI phân quyền (bổ sung)
│  │  │  ├─ bo-phan.factory.ts   dữ liệu mẫu
│  │  │  ├─ login-scenario.ts   tài khoản UI riêng (bổ sung)
│  │  │  ├─ nguoi-dung.factory.ts   dữ liệu mẫu
│  │  │  ├─ tenant-scenario.ts   kịch bản cách ly tenant (bổ sung)
│  │  │  └─ vai-tro.factory.ts   dữ liệu mẫu
│  │  └─ pages/
│  │     ├─ dang-nhap.page.ts   Page Object
│  │     └─ phan-quyen.page.ts   Page Object
│  └─ thap-dieu-phoi/
│     ├─ api/
│     │  ├─ schemas/
│     │  │  ├─ dich-vu-con.schema.ts   schema response
│     │  │  ├─ ngoai-le.schema.ts   schema response
│     │  │  └─ phieu-cc.schema.ts   schema response
│     │  ├─ dich-vu-con.client.ts   gọi API
│     │  ├─ ngoai-le.client.ts   gọi API
│     │  └─ phieu-cc.client.ts   gọi API
│     ├─ data/
│     │  ├─ dich-vu-con.factory.ts   dữ liệu mẫu
│     │  ├─ ngoai-le.factory.ts   dữ liệu mẫu
│     │  └─ phieu-cc.factory.ts   dữ liệu mẫu
│     └─ pages/
│        └─ thap-dieu-phoi.page.ts   Page Object
├─ tests/
│  ├─ api/
│  │  ├─ cau-hinh-chang/
│  │  │  ├─ quy-tac-chang.concurrency.spec.ts   3 case
│  │  │  ├─ quy-tac-chang.contract.spec.ts   8 case
│  │  │  ├─ quy-tac-chang.functional.spec.ts   31 case
│  │  │  ├─ quy-tac-chang.security.spec.ts   2 case
│  │  │  └─ quy-tac-chang.validation.spec.ts   29 case
│  │  ├─ cau-hinh-dau-muc-gia/
│  │  │  ├─ dau-muc-gia.concurrency.spec.ts   2 case
│  │  │  ├─ dau-muc-gia.contract.spec.ts   12 case
│  │  │  ├─ dau-muc-gia.functional.spec.ts   35 case
│  │  │  ├─ dau-muc-gia.security.spec.ts   6 case
│  │  │  └─ dau-muc-gia.validation.spec.ts   36 case
│  │  ├─ chi-phi-doanh-thu/
│  │  │  ├─ bao-cao-chi-phi-doanh-thu.concurrency.spec.ts   1 case
│  │  │  ├─ bao-cao-chi-phi-doanh-thu.contract.spec.ts   7 case
│  │  │  ├─ bao-cao-chi-phi-doanh-thu.functional.spec.ts   17 case
│  │  │  ├─ bao-cao-chi-phi-doanh-thu.integration.spec.ts   1 case
│  │  │  ├─ bao-cao-chi-phi-doanh-thu.security.spec.ts   2 case
│  │  │  ├─ bao-cao-chi-phi-doanh-thu.validation.spec.ts   12 case
│  │  │  ├─ pnl-phieu.contract.spec.ts   4 case
│  │  │  ├─ pnl-phieu.functional.spec.ts   15 case
│  │  │  ├─ pnl-phieu.integration.spec.ts   1 case
│  │  │  ├─ pnl-phieu.security.spec.ts   4 case
│  │  │  └─ pnl-phieu.validation.spec.ts   10 case
│  │  ├─ gia-ban-dinh-muc/
│  │  │  ├─ gia-ban-dinh-muc.concurrency.spec.ts   1 case
│  │  │  ├─ gia-ban-dinh-muc.contract.spec.ts   7 case
│  │  │  ├─ gia-ban-dinh-muc.functional.spec.ts   21 case
│  │  │  ├─ gia-ban-dinh-muc.security.spec.ts   1 case
│  │  │  └─ gia-ban-dinh-muc.validation.spec.ts   18 case
│  │  ├─ gia-mua-dau-vao/
│  │  │  ├─ bang-gia-mua-bang-gia.functional.spec.ts   28 case
│  │  │  ├─ bang-gia-mua-dong-gia.functional.spec.ts   21 case
│  │  │  ├─ bang-gia-mua-kich-hoat.functional.spec.ts   11 case
│  │  │  ├─ bang-gia-mua.concurrency.spec.ts   6 case
│  │  │  ├─ bang-gia-mua.contract.spec.ts   20 case
│  │  │  ├─ bang-gia-mua.security.spec.ts   7 case
│  │  │  └─ bang-gia-mua.validation.spec.ts   50 case
│  │  ├─ gia-mua-dinh-muc/
│  │  │  ├─ gia-mua-dinh-muc.contract.spec.ts   8 case
│  │  │  ├─ gia-mua-dinh-muc.functional.spec.ts   25 case
│  │  │  ├─ gia-mua-dinh-muc.security.spec.ts   1 case
│  │  │  └─ gia-mua-dinh-muc.validation.spec.ts   20 case
│  │  ├─ lich-su-thong-bao/
│  │  │  ├─ ty-gia-thong-bao.concurrency.spec.ts   1 case
│  │  │  ├─ ty-gia-thong-bao.contract.spec.ts   4 case
│  │  │  ├─ ty-gia-thong-bao.functional.spec.ts   8 case
│  │  │  ├─ ty-gia-thong-bao.security.spec.ts   2 case
│  │  │  └─ ty-gia-thong-bao.validation.spec.ts   7 case
│  │  ├─ phieu-dich-vu/
│  │  │  ├─ phieu-dich-vu-chung-tu-xe.functional.spec.ts   17 case
│  │  │  ├─ phieu-dich-vu-chung-tu-xe.validation.spec.ts   18 case
│  │  │  ├─ phieu-dich-vu-doanh-thu.functional.spec.ts   28 case
│  │  │  ├─ phieu-dich-vu-doanh-thu.validation.spec.ts   14 case
│  │  │  ├─ phieu-dich-vu-phieu.functional.spec.ts   31 case
│  │  │  ├─ phieu-dich-vu-phieu.validation.spec.ts   27 case
│  │  │  ├─ phieu-dich-vu-trang-thai.functional.spec.ts   14 case
│  │  │  ├─ phieu-dich-vu-trang-thai.validation.spec.ts   12 case
│  │  │  ├─ phieu-dich-vu.concurrency.spec.ts   9 case
│  │  │  ├─ phieu-dich-vu.contract.spec.ts   28 case
│  │  │  ├─ phieu-dich-vu.integration.spec.ts   7 case
│  │  │  └─ phieu-dich-vu.security.spec.ts   28 case
│  │  ├─ quan-ly-bao-gia/
│  │  │  ├─ bgkh-gop-dau-muc.functional.spec.ts   13 case
│  │  │  ├─ bgkh-trang-thai.functional.spec.ts   19 case
│  │  │  ├─ bgkh.concurrency.spec.ts   7 case
│  │  │  ├─ bgkh.contract.spec.ts   17 case
│  │  │  ├─ bgkh.functional.spec.ts   24 case
│  │  │  ├─ bgkh.integration.spec.ts   1 case
│  │  │  ├─ bgkh.security.spec.ts   17 case
│  │  │  ├─ bgkh.validation.spec.ts   46 case
│  │  │  ├─ bgnb-lap-theo-ycbg.functional.spec.ts   16 case
│  │  │  ├─ bgnb-phat-hanh.functional.spec.ts   14 case
│  │  │  ├─ bgnb.concurrency.spec.ts   7 case
│  │  │  ├─ bgnb.contract.spec.ts   18 case
│  │  │  ├─ bgnb.functional.spec.ts   27 case
│  │  │  ├─ bgnb.security.spec.ts   8 case
│  │  │  ├─ bgnb.validation.spec.ts   46 case
│  │  │  ├─ ycbg-bgnb-tu-dong.functional.spec.ts   13 case
│  │  │  ├─ ycbg-trang-thai.functional.spec.ts   16 case
│  │  │  ├─ ycbg.concurrency.spec.ts   8 case
│  │  │  ├─ ycbg.contract.spec.ts   16 case
│  │  │  ├─ ycbg.functional.spec.ts   29 case
│  │  │  ├─ ycbg.integration.spec.ts   5 case
│  │  │  ├─ ycbg.security.spec.ts   15 case
│  │  │  └─ ycbg.validation.spec.ts   47 case
│  │  ├─ quan-tri-phan-quyen/
│  │  │  ├─ bo-phan.concurrency.spec.ts   5 case
│  │  │  ├─ bo-phan.contract.spec.ts   11 case
│  │  │  ├─ bo-phan.functional.spec.ts   31 case
│  │  │  ├─ bo-phan.security.spec.ts   6 case
│  │  │  ├─ bo-phan.validation.spec.ts   26 case
│  │  │  ├─ nguoi-dung.concurrency.spec.ts   4 case
│  │  │  ├─ nguoi-dung.contract.spec.ts   9 case
│  │  │  ├─ nguoi-dung.functional.spec.ts   28 case
│  │  │  ├─ nguoi-dung.integration.spec.ts   1 case
│  │  │  ├─ nguoi-dung.security.spec.ts   3 case
│  │  │  ├─ nguoi-dung.validation.spec.ts   21 case
│  │  │  ├─ vai-tro.concurrency.spec.ts   5 case
│  │  │  ├─ vai-tro.contract.spec.ts   16 case
│  │  │  ├─ vai-tro.functional.spec.ts   44 case
│  │  │  ├─ vai-tro.security.spec.ts   4 case
│  │  │  ├─ vai-tro.validation.spec.ts   36 case
│  │  │  ├─ xac-thuc.concurrency.spec.ts   5 case
│  │  │  ├─ xac-thuc.contract.spec.ts   5 case
│  │  │  ├─ xac-thuc.functional.spec.ts   17 case
│  │  │  ├─ xac-thuc.security.spec.ts   3 case
│  │  │  └─ xac-thuc.validation.spec.ts   13 case
│  │  └─ thap-dieu-phoi/
│  │     ├─ dich-vu-con-chi-phi.functional.spec.ts   22 case
│  │     ├─ dich-vu-con-dieu-phoi.functional.spec.ts   19 case
│  │     ├─ dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts   36 case
│  │     ├─ dich-vu-con.concurrency.spec.ts   5 case
│  │     ├─ dich-vu-con.contract.spec.ts   20 case
│  │     ├─ dich-vu-con.integration.spec.ts   4 case
│  │     ├─ dich-vu-con.security.spec.ts   19 case
│  │     ├─ dich-vu-con.validation.spec.ts   47 case
│  │     ├─ ngoai-le.concurrency.spec.ts   2 case
│  │     ├─ ngoai-le.contract.spec.ts   3 case
│  │     ├─ ngoai-le.functional.spec.ts   8 case
│  │     ├─ ngoai-le.security.spec.ts   3 case
│  │     ├─ ngoai-le.validation.spec.ts   10 case
│  │     ├─ phieu-cc.concurrency.spec.ts   3 case
│  │     ├─ phieu-cc.contract.spec.ts   11 case
│  │     ├─ phieu-cc.functional.spec.ts   27 case
│  │     ├─ phieu-cc.integration.spec.ts   2 case
│  │     ├─ phieu-cc.security.spec.ts   5 case
│  │     └─ phieu-cc.validation.spec.ts   24 case
│  ├─ flows/
│  │  ├─ cau-hinh-chang/
│  │  │  └─ chang-tren-phieu.flow.spec.ts   4 case
│  │  ├─ cau-hinh-dau-muc-gia/
│  │  │  └─ tat-kich-hoat-dau-muc.flow.spec.ts   14 case
│  │  ├─ chi-phi-doanh-thu/
│  │  │  └─ ty-gia-pnl-bao-cao.flow.spec.ts   5 case
│  │  ├─ gia-ban-dinh-muc/
│  │  │  └─ doi-gia-ban-dinh-muc.flow.spec.ts   11 case
│  │  ├─ gia-mua-dau-vao/
│  │  │  └─ doi-gia-mua-dau-vao.flow.spec.ts   8 case
│  │  ├─ gia-mua-dinh-muc/
│  │  │  └─ doi-gia-mua-dinh-muc.flow.spec.ts   7 case
│  │  ├─ lich-su-thong-bao/
│  │  │  └─ lich-su-thong-bao.flow.spec.ts   4 case
│  │  ├─ phieu-dich-vu/
│  │  │  ├─ ghi-nhan-doanh-thu.flow.spec.ts   14 case
│  │  │  └─ ngoai-le-phieu.flow.spec.ts   6 case
│  │  ├─ quan-ly-bao-gia/
│  │  │  ├─ bao-gia.flow.spec.ts   11 case
│  │  │  └─ gop-dau-muc.flow.spec.ts   4 case
│  │  ├─ quan-tri-phan-quyen/
│  │  │  ├─ cach-ly-tenant.flow.spec.ts   3 case
│  │  │  ├─ phan-quyen-hanh-dong.flow.spec.ts   6 case
│  │  │  └─ tai-khoan-dieu-phoi.flow.spec.ts   9 case
│  │  └─ xuyen-module/
│  │     ├─ phieu-du-5-dich-vu.flow.spec.ts   15 case
│  │     └─ thiet-lap-gia.flow.spec.ts   6 case
│  ├─ setup/
│  │  └─ auth.setup.ts   fixture
│  └─ ui/
│     ├─ cau-hinh-chang/
│     │  ├─ cau-hinh-chang.functional.spec.ts   14 case
│     │  └─ cau-hinh-chang.validation.spec.ts   4 case
│     ├─ cau-hinh-dau-muc-gia/
│     │  ├─ dau-muc-gia.functional.spec.ts   9 case
│     │  └─ dau-muc-gia.validation.spec.ts   4 case
│     ├─ chi-phi-doanh-thu/
│     │  ├─ chi-phi-doanh-thu.a11y.spec.ts   1 case
│     │  ├─ chi-phi-doanh-thu.access.spec.ts   1 case
│     │  ├─ chi-phi-doanh-thu.functional.spec.ts   10 case
│     │  └─ chi-phi-doanh-thu.validation.spec.ts   4 case
│     ├─ gia-ban-dinh-muc/
│     │  ├─ gia-ban-dinh-muc.functional.spec.ts   7 case
│     │  └─ gia-ban-dinh-muc.validation.spec.ts   3 case
│     ├─ gia-mua-dau-vao/
│     │  ├─ gia-mua-dau-vao.functional.spec.ts   19 case
│     │  └─ gia-mua-dau-vao.validation.spec.ts   3 case
│     ├─ gia-mua-dinh-muc/
│     │  ├─ gia-mua-dinh-muc.access.spec.ts   1 case
│     │  ├─ gia-mua-dinh-muc.functional.spec.ts   12 case
│     │  └─ gia-mua-dinh-muc.validation.spec.ts   2 case
│     ├─ lich-su-thong-bao/
│     │  ├─ thong-bao.functional.spec.ts   2 case
│     │  └─ thong-bao.visual.spec.ts   1 case
│     ├─ phieu-dich-vu/
│     │  ├─ phieu-dich-vu.access.spec.ts   1 case
│     │  ├─ phieu-dich-vu.functional.spec.ts   15 case
│     │  └─ phieu-dich-vu.validation.spec.ts   4 case
│     ├─ quan-ly-bao-gia/
│     │  ├─ bgkh.functional.spec.ts   12 case
│     │  ├─ bgkh.validation.spec.ts   4 case
│     │  ├─ bgkh.visual.spec.ts   1 case
│     │  ├─ bgnb.functional.spec.ts   12 case
│     │  ├─ bgnb.validation.spec.ts   2 case
│     │  ├─ ycbg.access.spec.ts   1 case
│     │  ├─ ycbg.functional.spec.ts   10 case
│     │  └─ ycbg.validation.spec.ts   5 case
│     ├─ quan-tri-phan-quyen/
│     │  ├─ dang-nhap.a11y.spec.ts   1 case
│     │  ├─ dang-nhap.access.spec.ts   4 case
│     │  ├─ dang-nhap.functional.spec.ts   3 case
│     │  ├─ dang-nhap.validation.spec.ts   3 case
│     │  ├─ phan-quyen.access.spec.ts   1 case
│     │  ├─ phan-quyen.functional.spec.ts   10 case
│     │  └─ phan-quyen.validation.spec.ts   6 case
│     └─ thap-dieu-phoi/
│        ├─ thap-dieu-phoi.access.spec.ts   2 case
│        ├─ thap-dieu-phoi.functional.spec.ts   10 case
│        ├─ thap-dieu-phoi.responsive.spec.ts   1 case
│        └─ thap-dieu-phoi.validation.spec.ts   2 case
├─ .env.example   cấu hình
├─ README.md   hướng dẫn
├─ package.json   cấu hình
├─ playwright.config.ts   cấu hình
└─ tsconfig.json   cấu hình
```

## 3. Mô tả từng file

| File | Loại | Dùng để làm gì | Case quản lý | API chính | Phụ thuộc |
| --- | --- | --- | --- | --- | --- |
| `playwright.config.ts` | config | Khai báo project setup, api, ui, responsive, visual; reporter html + json; trace/ảnh/video khi lỗi; baseURL đọc từ biến môi trường | Tất cả | - | `.env.example` |
| `package.json` | config | Gói @playwright/test, typescript, dotenv, zod, @axe-core/playwright; script chạy theo module và theo tag | Tất cả | - | - |
| `tsconfig.json` | config | Cấu hình TypeScript, alias `@core/*` và `@<module>/*` trỏ vào `src/` | Tất cả | - | - |
| `.env.example` | config | Tên biến: WEB_URL, API_URL, TENANT_CODE, tài khoản và mật khẩu theo vai trò, TENANT_B; không có giá trị thật | Tất cả | - | - |
| `README.md` | doc | Cách cài, cấu hình biến, chạy theo module/tag, bảng case và file | Tất cả | - | - |
| `src/core/env.ts` | util | Đọc và kiểm tra biến môi trường; chặn chạy nếu URL không phải môi trường dev được phép | Tất cả | - | `.env.example` |
| `src/core/base.client.ts` | client | Lớp gọi API chung: gắn Bearer token, tenant, đọc vỏ phản hồi `success`/`message`/`errorCode`, ghi request vào báo cáo khi lỗi | Tất cả | - | `src/core/env.ts` |
| `src/core/auth.client.ts` | client | Đăng nhập, làm mới token, đọc `GET /api/auth/me` | Tất cả | `POST /api/auth/login`, `GET /api/auth/me` | `src/core/base.client.ts` |
| `src/core/assertions.ts` | util | Hàm kiểm tra dùng chung: mã HTTP thuộc tập mã cho phép (vd `400/409/422`), so số tiền đến đồng, so % theo số chữ số lẻ | Tất cả | - | - |
| `src/core/money.ts` | util | Tính VAT, quy đổi tỷ giá, lợi nhuận %, margin P&L theo quy tắc làm tròn của hệ thống | Tất cả case số liệu doanh thu, chi phí, P&L | - | - |
| `src/core/fixtures/auth.fixture.ts` | fixture | test.extend: client API theo vai trò (adminApi, ccApi, dpApi, k1Api, k1bApi, saleApi) và page đã đăng nhập theo storageState | Tất cả | - | `src/core/auth.client.ts`, `src/core/data/accounts.ts` |
| `src/core/fixtures/test-run.fixture.ts` | fixture | Sinh testRunId cho mỗi lượt chạy, gom bản ghi đã tạo để dọn sau khi chạy | Tất cả | - | `src/core/env.ts` |
| `src/core/data/accounts.ts` | data | Ánh xạ vai trò → biến môi trường tài khoản (ADMIN, CC_K5, DP_K2, K1, K1B, SALE, SALE2, tài khoản tạo thêm) | Tất cả | - | `src/core/env.ts` |
| `src/core/data/p0-price-set.ts` | data | Bộ giá P0 và số kỳ vọng dùng chung: giá mua/bán 5 dịch vụ, BGNB 15.700.000, BGKH 16.902.000 sau VAT, phiếu doanh thu 15.900.000, chi phí 14.000.000 | Case luồng và case số liệu | - | - |
| `src/core/mocks/vcb-rate.mock.ts` | mock | Giả lập nguồn tỷ giá Vietcombank không truy cập được cho case UI cảnh báo tỷ giá | Case tỷ giá VCB lỗi (UI) | - | - |
| `src/core/pages/components/data-table.component.ts` | page | Bảng danh sách dùng chung: đọc cột, lọc, phân trang, chọn dòng | Tất cả case UI có bảng | - | - |
| `src/core/pages/components/modal.component.ts` | page | Hộp thoại xác nhận, nhập lý do | Tất cả case UI có hộp thoại | - | - |
| `src/core/pages/components/toast.component.ts` | page | Đọc thông báo thành công/lỗi | Tất cả case UI | - | - |
| `src/core/pages/components/sidebar-menu.component.ts` | page | Menu trái theo quyền | Case UI điều hướng, phân quyền | - | - |
| `tests/setup/auth.setup.ts` | fixture | Project setup: đăng nhập từng vai trò một lần, lưu storageState vào `.auth/` (đã gitignore) | Tất cả | `POST /api/auth/login` | `src/core/fixtures/auth.fixture.ts` |
| `src/quan-tri-phan-quyen/api/xac-thuc.client.ts` | client | Gọi các API của mục "Xác thực và phiên đăng nhập"; chỉ thao tác, không assert | AUTH-001..AUTH-043 và case luồng gọi tới | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/password` (+1 API) | `src/core/base.client.ts` |
| `src/quan-tri-phan-quyen/api/bo-phan.client.ts` | client | Gọi các API của mục "Quản trị bộ phận"; chỉ thao tác, không assert | ADM-DEP-001..ADM-DEP-079 và case luồng gọi tới | `GET /api/admin/departments`, `POST /api/admin/departments`, `GET /api/admin/departments/{id}`, `PUT /api/admin/departments/{id}` (+7 API) | `src/core/base.client.ts` |
| `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` | client | Gọi các API của mục "Quản trị người dùng"; chỉ thao tác, không assert | ADM-USR-001..ADM-USR-066 và case luồng gọi tới | `GET /api/admin/users`, `POST /api/admin/users`, `GET /api/admin/users/{id}`, `PUT /api/admin/users/{id}` (+5 API) | `src/core/base.client.ts` |
| `src/quan-tri-phan-quyen/api/vai-tro.client.ts` | client | Gọi các API của mục "Quản trị vai trò, nhật ký và thiết lập"; chỉ thao tác, không assert | ADM-ROLE-001..ADM-ROLE-105 và case luồng gọi tới | `GET /api/admin/permissions`, `GET /api/admin/roles`, `POST /api/admin/roles`, `GET /api/admin/roles/{id}` (+12 API) | `src/core/base.client.ts` |
| `src/cau-hinh-chang/api/quy-tac-chang.client.ts` | client | Gọi các API của mục "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)"; chỉ thao tác, không assert | LEG-001..LEG-073 và case luồng gọi tới | `GET /api/leg-rules`, `POST /api/leg-rules`, `GET /api/leg-rules/{code}`, `PUT /api/leg-rules/{code}` (+4 API) | `src/core/base.client.ts` |
| `src/cau-hinh-dau-muc-gia/api/dau-muc-gia.client.ts` | client | Gọi các API của mục "Cấu hình đầu mục giá"; chỉ thao tác, không assert | CFG-001..CFG-091 và case luồng gọi tới | `GET /api/price-configurations`, `GET /api/price-configurations/stats`, `GET /api/price-configurations/{id}`, `GET /api/price-configurations/{id}/history` (+8 API) | `src/core/base.client.ts` |
| `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts` | client | Gọi các API của mục "Tỷ giá Vietcombank và thông báo"; chỉ thao tác, không assert | COM-001..COM-003, COM-005..COM-023 và case luồng gọi tới | `GET /api/exchange-rates/{currency}`, `GET /api/notifications`, `GET /api/notifications/unread-count`, `POST /api/notifications/{id}/read` | `src/core/base.client.ts` |
| `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts` | client | Gọi các API của mục "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)"; chỉ thao tác, không assert | BGM-001..BGM-143 và case luồng gọi tới | `GET /api/purchase-prices`, `POST /api/purchase-prices`, `GET /api/purchase-prices/contractors`, `GET /api/purchase-prices/stats` (+16 API) | `src/core/base.client.ts` |
| `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts` | client | Gọi các API của mục "Giá mua định mức (SBP)"; chỉ thao tác, không assert | SBP-001..SBP-054 và case luồng gọi tới | `GET /api/standard-buying-prices/groups`, `GET /api/standard-buying-prices`, `GET /api/standard-buying-prices/{id}`, `PUT /api/standard-buying-prices/{id}/benchmark` (+4 API) | `src/core/base.client.ts` |
| `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts` | client | Gọi các API của mục "Giá bán định mức (SSP)"; chỉ thao tác, không assert | SSP-001..SSP-048 và case luồng gọi tới | `GET /api/standard-selling-prices/groups`, `GET /api/standard-selling-prices`, `GET /api/standard-selling-prices/{id}`, `PUT /api/standard-selling-prices/{id}/selling-price` (+3 API) | `src/core/base.client.ts` |
| `src/quan-ly-bao-gia/api/ycbg.client.ts` | client | Gọi các API của mục "Yêu cầu báo giá (YCBG/RFQ)"; chỉ thao tác, không assert | RFQ-001..RFQ-149 và case luồng gọi tới | `GET /api/quotation-requests`, `POST /api/quotation-requests`, `GET /api/quotation-requests/statuses`, `GET /api/quotation-requests/internal-quote-stats` (+12 API) | `src/core/base.client.ts` |
| `src/quan-ly-bao-gia/api/bgnb.client.ts` | client | Gọi các API của mục "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG"; chỉ thao tác, không assert | IPS-001..IPS-136 và case luồng gọi tới | `GET /api/internal-quotes`, `POST /api/internal-quotes`, `GET /api/internal-quotes/benchmark-lines`, `GET /api/internal-quotes/selectable-requests` (+14 API) | `src/core/base.client.ts` |
| `src/quan-ly-bao-gia/api/bgkh.client.ts` | client | Gọi các API của mục "Báo giá khách hàng (BGKH/RC)"; chỉ thao tác, không assert | RC-001..RC-144 và case luồng gọi tới | `POST /api/quotation-requests/{id}/customer-quotation`, `GET /api/customer-quotations`, `GET /api/customer-quotations/statuses`, `GET /api/customer-quotations/{id}` (+13 API) | `src/core/base.client.ts` |
| `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` | client | Gọi các API của mục "Phiếu dịch vụ (Khối 1)"; chỉ thao tác, không assert | ORD-001..ORD-233 và case luồng gọi tới | `GET /api/service-orders/selectable-customers`, `GET /api/service-orders/statuses`, `GET /api/service-orders`, `POST /api/service-orders` (+24 API) | `src/core/base.client.ts` |
| `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts` | client | Gọi các API của mục "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu"; chỉ thao tác, không assert | PNL-001..PNL-034 và case luồng gọi tới | `GET /api/service-orders/{id}/pnl`, `GET /api/service-orders/{id}/pnl/export`, `GET /api/service-orders/{id}/pnl/fx-rate`, `PUT /api/service-orders/{id}/pnl/fx-rate` | `src/core/base.client.ts` |
| `src/chi-phi-doanh-thu/api/bao-cao-chi-phi-doanh-thu.client.ts` | client | Gọi các API của mục "Màn Chi phí – Doanh thu (báo cáo quản trị)"; chỉ thao tác, không assert | CR-001..CR-027, CR-029..CR-034, CR-037..CR-040, CR-043..CR-045 và case luồng gọi tới | `GET /api/cost-revenue/orders`, `GET /api/cost-revenue/orders/stats`, `GET /api/cost-revenue/customer-options`, `GET /api/cost-revenue/creator-options` (+3 API) | `src/core/base.client.ts` |
| `src/thap-dieu-phoi/api/phieu-cc.client.ts` | client | Gọi các API của mục "Tháp điều phối — phiếu dịch vụ (CC)"; chỉ thao tác, không assert | K3O-001..K3O-072 và case luồng gọi tới | `GET /api/k3/service-orders`, `GET /api/k3/service-orders/counts`, `GET /api/k3/service-orders/statuses`, `GET /api/k3/service-orders/{id}` (+7 API) | `src/core/base.client.ts` |
| `src/thap-dieu-phoi/api/dich-vu-con.client.ts` | client | Gọi các API của mục "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)"; chỉ thao tác, không assert | K3S-001..K3S-078, K3S-080..K3S-173 và case luồng gọi tới | `GET /api/k3/service-orders/{id}/services/{type}/coordination-options`, `PUT /api/k3/service-orders/{id}/services/{type}/coordination`, `GET /api/k3/service-orders/{id}/services/{type}/contractors`, `POST /api/k3/service-orders/{id}/services/{type}/start` (+16 API) | `src/core/base.client.ts` |
| `src/thap-dieu-phoi/api/ngoai-le.client.ts` | client | Gọi các API của mục "Tháp điều phối — thao tác ngoại lệ"; chỉ thao tác, không assert | K3X-001, K3X-032..K3X-056 và case luồng gọi tới | `GET /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/vehicle-changes` | `src/core/base.client.ts` |
| `src/quan-tri-phan-quyen/api/schemas/xac-thuc.schema.ts` | schema | Schema zod của response các API mục "Xác thực và phiên đăng nhập" (theo Swagger) cho case Response contract | AUTH-011, AUTH-019, AUTH-024, AUTH-033, AUTH-041 | - | - |
| `src/quan-tri-phan-quyen/api/schemas/bo-phan.schema.ts` | schema | Schema zod của response các API mục "Quản trị bộ phận" (theo Swagger) cho case Response contract | ADM-DEP-007, ADM-DEP-016, ADM-DEP-021, ADM-DEP-028, ADM-DEP-035, ADM-DEP-041, ADM-DEP-048, ADM-DEP-055, ADM-DEP-063, ADM-DEP-070, ADM-DEP-078 | - | - |
| `src/quan-tri-phan-quyen/api/schemas/nguoi-dung.schema.ts` | schema | Schema zod của response các API mục "Quản trị người dùng" (theo Swagger) cho case Response contract | ADM-USR-008, ADM-USR-018, ADM-USR-023, ADM-USR-031, ADM-USR-039, ADM-USR-047, ADM-USR-054, ADM-USR-059, ADM-USR-065 | - | - |
| `src/quan-tri-phan-quyen/api/schemas/vai-tro.schema.ts` | schema | Schema zod của response các API mục "Quản trị vai trò, nhật ký và thiết lập" (theo Swagger) cho case Response contract | ADM-ROLE-004, ADM-ROLE-010, ADM-ROLE-019, ADM-ROLE-024, ADM-ROLE-031, ADM-ROLE-038, ADM-ROLE-044, ADM-ROLE-051, ADM-ROLE-056, ADM-ROLE-062, ADM-ROLE-070, ADM-ROLE-077, ADM-ROLE-085, ADM-ROLE-092, ADM-ROLE-095, ADM-ROLE-104 | - | - |
| `src/cau-hinh-chang/api/schemas/quy-tac-chang.schema.ts` | schema | Schema zod của response các API mục "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)" (theo Swagger) cho case Response contract | LEG-007, LEG-022, LEG-027, LEG-036, LEG-043, LEG-048, LEG-057, LEG-066 | - | - |
| `src/cau-hinh-dau-muc-gia/api/schemas/dau-muc-gia.schema.ts` | schema | Schema zod của response các API mục "Cấu hình đầu mục giá" (theo Swagger) cho case Response contract | CFG-004, CFG-008, CFG-012, CFG-018, CFG-031, CFG-045, CFG-056, CFG-064, CFG-070, CFG-075, CFG-080, CFG-085 | - | - |
| `src/lich-su-thong-bao/api/schemas/ty-gia-thong-bao.schema.ts` | schema | Schema zod của response các API mục "Tỷ giá Vietcombank và thông báo" (theo Swagger) cho case Response contract | COM-006, COM-011, COM-014, COM-021 | - | - |
| `src/gia-mua-dau-vao/api/schemas/bang-gia-mua.schema.ts` | schema | Schema zod của response các API mục "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)" (theo Swagger) cho case Response contract | BGM-007, BGM-019, BGM-023, BGM-027, BGM-031, BGM-040, BGM-047, BGM-055, BGM-060, BGM-068, BGM-074, BGM-082, BGM-090, BGM-100, BGM-107, BGM-115, BGM-122, BGM-127, BGM-133, BGM-139 | - | - |
| `src/gia-mua-dinh-muc/api/schemas/gia-mua-dinh-muc.schema.ts` | schema | Schema zod của response các API mục "Giá mua định mức (SBP)" (theo Swagger) cho case Response contract | SBP-005, SBP-012, SBP-016, SBP-026, SBP-034, SBP-038, SBP-044, SBP-049 | - | - |
| `src/gia-ban-dinh-muc/api/schemas/gia-ban-dinh-muc.schema.ts` | schema | Schema zod của response các API mục "Giá bán định mức (SSP)" (theo Swagger) cho case Response contract | SSP-004, SSP-011, SSP-015, SSP-026, SSP-034, SSP-040, SSP-046 | - | - |
| `src/quan-ly-bao-gia/api/schemas/ycbg.schema.ts` | schema | Schema zod của response các API mục "Yêu cầu báo giá (YCBG/RFQ)" (theo Swagger) cho case Response contract | RFQ-008, RFQ-023, RFQ-027, RFQ-030, RFQ-035, RFQ-047, RFQ-055, RFQ-063, RFQ-072, RFQ-084, RFQ-094, RFQ-101, RFQ-108, RFQ-114, RFQ-123, RFQ-134 | - | - |
| `src/quan-ly-bao-gia/api/schemas/bgnb.schema.ts` | schema | Schema zod của response các API mục "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG" (theo Swagger) cho case Response contract | IPS-007, IPS-021, IPS-028, IPS-033, IPS-037, IPS-040, IPS-044, IPS-055, IPS-061, IPS-066, IPS-075, IPS-084, IPS-093, IPS-099, IPS-106, IPS-116, IPS-125, IPS-134 | - | - |
| `src/quan-ly-bao-gia/api/schemas/bgkh.schema.ts` | schema | Schema zod của response các API mục "Báo giá khách hàng (BGKH/RC)" (theo Swagger) cho case Response contract | RC-009, RC-017, RC-020, RC-025, RC-035, RC-046, RC-058, RC-066, RC-073, RC-084, RC-094, RC-105, RC-114, RC-121, RC-127, RC-133, RC-138 | - | - |
| `src/phieu-dich-vu/api/schemas/phieu-dich-vu.schema.ts` | schema | Schema zod của response các API mục "Phiếu dịch vụ (Khối 1)" (theo Swagger) cho case Response contract | ORD-005, ORD-008, ORD-016, ORD-032, ORD-039, ORD-050, ORD-058, ORD-066, ORD-078, ORD-087, ORD-097, ORD-107, ORD-119, ORD-126, ORD-133, ORD-142, ORD-149, ORD-156, ORD-163, ORD-168, ORD-177, ORD-184, ORD-190, ORD-197, ORD-202, ORD-210, ORD-216, ORD-224 | - | - |
| `src/chi-phi-doanh-thu/api/schemas/pnl-phieu.schema.ts` | schema | Schema zod của response các API mục "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu" (theo Swagger) cho case Response contract | PNL-010, PNL-017, PNL-021, PNL-033 | - | - |
| `src/chi-phi-doanh-thu/api/schemas/bao-cao-chi-phi-doanh-thu.schema.ts` | schema | Schema zod của response các API mục "Màn Chi phí – Doanh thu (báo cáo quản trị)" (theo Swagger) cho case Response contract | CR-010, CR-016, CR-019, CR-022, CR-031, CR-038, CR-044 | - | - |
| `src/thap-dieu-phoi/api/schemas/phieu-cc.schema.ts` | schema | Schema zod của response các API mục "Tháp điều phối — phiếu dịch vụ (CC)" (theo Swagger) cho case Response contract | K3O-008, K3O-012, K3O-015, K3O-021, K3O-028, K3O-037, K3O-042, K3O-052, K3O-058, K3O-065, K3O-071 | - | - |
| `src/thap-dieu-phoi/api/schemas/dich-vu-con.schema.ts` | schema | Schema zod của response các API mục "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)" (theo Swagger) cho case Response contract | K3S-006, K3S-017, K3S-022, K3S-032, K3S-039, K3S-045, K3S-050, K3S-063, K3S-075, K3S-083, K3S-091, K3S-099, K3S-103, K3S-116, K3S-120, K3S-130, K3S-137, K3S-146, K3S-153, K3S-160 | - | - |
| `src/thap-dieu-phoi/api/schemas/ngoai-le.schema.ts` | schema | Schema zod của response các API mục "Tháp điều phối — thao tác ngoại lệ" (theo Swagger) cho case Response contract | K3X-034, K3X-043, K3X-054 | - | - |
| `src/quan-tri-phan-quyen/data/bo-phan.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Quản trị bộ phận": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | ADM-DEP-001..ADM-DEP-079 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-tri-phan-quyen/data/nguoi-dung.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Quản trị người dùng": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | ADM-USR-001..ADM-USR-066 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-tri-phan-quyen/data/vai-tro.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Quản trị vai trò, nhật ký và thiết lập": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | ADM-ROLE-001..ADM-ROLE-105 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-tri-phan-quyen/data/admin-pending.factory.ts` | data | Helper quản trị (người dùng bổ sung): vai trò/bộ phận/người dùng riêng của case, audit, quyền hiệu lực | ADM-*, FLOW-ADM-*, FLOW-PERM-* | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-tri-phan-quyen/data/login-scenario.ts` | data | Tài khoản UI riêng cùng vai trò tài khoản mẫu (người dùng bổ sung) | UI-LOGIN-* | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-tri-phan-quyen/data/admin-ui.scenario.ts` | data | Kịch bản UI Phân quyền (người dùng bổ sung): bộ phận, vai trò, người dùng, menu theo quyền | UI-ADM-001..UI-ADM-017, UI-LOGIN-* | - | `src/quan-tri-phan-quyen/data/admin-pending.factory.ts` |
| `src/quan-tri-phan-quyen/data/tenant-scenario.ts` | data | Kịch bản cách ly dữ liệu giữa tenant (người dùng bổ sung) | FLOW-TEN-001..FLOW-TEN-003 | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/cau-hinh-chang/data/quy-tac-chang.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | LEG-001..LEG-073 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/cau-hinh-chang/data/leg-sandbox.ts` | data | Fixture quy tắc chặng riêng (người dùng bổ sung): chỉ dùng tổ hợp 5 trường còn trống, khóa file giữa các worker, tự dọn quy tắc đã tạo | LEG-*, FLOW-LEG-*, FLOW-PERM-005 | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/cau-hinh-chang/data/leg-ui.scenario.ts` | data | Kịch bản UI Cấu hình chặng (người dùng bổ sung): form quy tắc, mô phỏng, chi tiết, dùng quy tắc riêng của leg-sandbox | UI-LEG-001..UI-LEG-018 | - | `src/cau-hinh-chang/data/leg-sandbox.ts`, `src/core/pages/components/data-table.component.ts` |
| `src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Cấu hình đầu mục giá": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | CFG-001..CFG-091 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/lich-su-thong-bao/data/ty-gia-thong-bao.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Tỷ giá Vietcombank và thông báo": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | COM-001..COM-003, COM-005..COM-023 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/lich-su-thong-bao/data/notification-ui.scenario.ts` | data | Kịch bản UI Lịch sử thông báo (người dùng bổ sung): hộp thư CC mới để thao tác đọc không đổi thông báo của tài khoản dùng chung | UI-NTF-001..UI-NTF-003 | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/gia-mua-dau-vao/data/bang-gia-mua.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | BGM-001..BGM-143 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/gia-mua-dau-vao/data/pending-api-cases.ts` | data | Kịch bản API cần trạng thái đặc biệt (người dùng bổ sung): nhà thầu ngưng, bảng hết hiệu lực, dòng giá "Tất cả", khóa chỉnh sửa | BGM-035/050/052/077/085/096, CFG-039, SBP-009 | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/gia-mua-dau-vao/data/pending-price-flows.ts` | data | Kịch bản luồng đổi giá mua đầu vào (người dùng bổ sung) | FLOW-CHG-BGM-* | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/gia-mua-dau-vao/data/price-flow.fixture.ts` | data | Helper luồng giá (người dùng bổ sung): bộ giá riêng, báo giá, hết hạn, đổi SBP/SSP, mẫu dòng "Tất cả" | FLOW-CHG-*, FLOW-REV-*, FLOW-DEACT-*, FLOW-HIST-*, RFQ-139 | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/gia-mua-dau-vao/data/purchase-price-ui.scenario.ts` | data | Kịch bản UI Giá mua đầu vào (người dùng bổ sung): danh sách, thêm mới, chi tiết, nhân bản, kích hoạt | UI-BGM-001..UI-BGM-022 | - | `src/gia-mua-dau-vao/pages/gia-mua-dau-vao.page.ts` |
| `src/gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Giá mua định mức (SBP)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | SBP-001..SBP-054 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/gia-mua-dinh-muc/data/pending-price-flows.ts` | data | Kịch bản luồng đổi giá mua định mức (người dùng bổ sung) | FLOW-CHG-SBP-* | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/gia-mua-dinh-muc/data/standard-price-ui.scenario.ts` | data | Kịch bản UI Giá mua định mức và Giá bán định mức (người dùng bổ sung): danh sách, chi tiết, cập nhật, nhập hàng loạt | UI-SBP-001..UI-SBP-015, UI-SSP-001..UI-SSP-010 | - | `src/gia-mua-dinh-muc/pages/gia-mua-dinh-muc.page.ts`, `src/gia-ban-dinh-muc/pages/gia-ban-dinh-muc.page.ts` |
| `src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Giá bán định mức (SSP)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | SSP-001..SSP-048 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-ly-bao-gia/data/ycbg.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Yêu cầu báo giá (YCBG/RFQ)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | RFQ-001..RFQ-149 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-ly-bao-gia/data/bgnb.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | IPS-001..IPS-136 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-ly-bao-gia/data/bgkh.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Báo giá khách hàng (BGKH/RC)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | RC-001..RC-144 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-ly-bao-gia/data/quote-scenario.factory.ts` | data | Kịch bản báo giá dùng lại (người dùng bổ sung) | FLOW-QUOTE-*, UI-RFQ/IPS/RC-* | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-ly-bao-gia/data/quote-ui.fixture.ts` | data | Fixture trang báo giá dùng phiên đã đăng nhập (người dùng bổ sung) | UI-RFQ/IPS/RC-* | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-ly-bao-gia/data/quote-ui.scenario.ts` | data | Kịch bản UI Yêu cầu báo giá và Báo giá khách hàng (người dùng bổ sung) | UI-RFQ-*, UI-RC-* | - | `src/quan-ly-bao-gia/data/quote-ui.fixture.ts`, `src/quan-ly-bao-gia/data/quote-scenario.factory.ts` |
| `src/quan-ly-bao-gia/data/remaining-quote-api.scenario.ts` | data | Kịch bản API báo giá còn lại (người dùng bổ sung): BGNB tự động, ngưỡng, tranh chấp nền, lịch sử tắt đầu mục do hệ thống | IPS-*, RFQ-*, CFG-015, FLOW-DEACT-011 | - | `src/quan-ly-bao-gia/data/quote-scenario.factory.ts` |
| `src/phieu-dich-vu/data/phieu-dich-vu.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Phiếu dịch vụ (Khối 1)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | ORD-001..ORD-233 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/phieu-dich-vu/data/operations-ui.ts` | data | Helper UI vận hành (người dùng bổ sung): mở phiếu ở K1/Tháp điều phối, panel dịch vụ, sửa chi phí/doanh thu, chụp màn hình | UI-ORD-*, UI-K3-*, UI-PNL-*, PNL-* | - | `src/quan-ly-bao-gia/data/quote-ui.fixture.ts` |
| `src/phieu-dich-vu/data/order-create-ui.ts` | data | Helper UI tạo phiếu dịch vụ (người dùng bổ sung): chọn khách hàng, form chi tiết từng dịch vụ | UI-ORD-* | - | `src/phieu-dich-vu/data/operations-ui.ts` |
| `src/chi-phi-doanh-thu/data/pnl-phieu.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | PNL-001..PNL-034 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/chi-phi-doanh-thu/data/bao-cao-chi-phi-doanh-thu.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Màn Chi phí – Doanh thu (báo cáo quản trị)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | CR-001..CR-027, CR-029..CR-034, CR-037..CR-040, CR-043..CR-045 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/thap-dieu-phoi/data/phieu-cc.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Tháp điều phối — phiếu dịch vụ (CC)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | K3O-001..K3O-072 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/thap-dieu-phoi/data/dich-vu-con.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | K3S-001..K3S-078, K3S-080..K3S-173 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/thap-dieu-phoi/data/ngoai-le.factory.ts` | data | Sinh dữ liệu hợp lệ cho mục "Tháp điều phối — thao tác ngoại lệ": số ngẫu nhiên, tên tiếng Việt có nghĩa, gắn testRunId | K3X-001, K3X-032..K3X-056 và case luồng gọi tới | - | `src/core/fixtures/test-run.fixture.ts` |
| `src/quan-tri-phan-quyen/pages/dang-nhap.page.ts` | page | Page Object màn "Đăng nhập và phiên làm việc" (/login và menu trái sau đăng nhập): locator theo nhãn đang có trên web dev | UI-LOGIN-001..UI-LOGIN-011 | - | `src/core/pages/components/data-table.component.ts` |
| `src/quan-tri-phan-quyen/pages/phan-quyen.page.ts` | page | Page Object màn "Phân quyền (Bộ phận, Vai trò, Người dùng)" (Menu "Phân quyền" (/roles), 3 tab Bộ phận / Vai trò / Người dùng): locator theo nhãn đang có trên web dev | UI-ADM-001..UI-ADM-017 | - | `src/core/pages/components/data-table.component.ts` |
| `src/cau-hinh-chang/pages/cau-hinh-chang.page.ts` | page | Page Object màn "Cấu hình chặng" (Menu "Cấu hình chặng" (/route-configs): tab Quy tắc chặng hành trình, tab Mô phỏng, trang chi tiết /route-configs/{mã}): locator theo nhãn đang có trên web dev | UI-LEG-001..UI-LEG-018 | - | `src/core/pages/components/data-table.component.ts` |
| `src/cau-hinh-dau-muc-gia/pages/dau-muc-gia.page.ts` | page | Page Object màn "Cấu hình đầu mục giá" (Menu "Cấu hình đầu mục giá" (/price-configs) và chi tiết /price-configs/{id}): locator theo nhãn đang có trên web dev | UI-CFG-001..UI-CFG-013 | - | `src/core/pages/components/data-table.component.ts` |
| `src/gia-mua-dau-vao/pages/gia-mua-dau-vao.page.ts` | page | Page Object màn "Giá mua đầu vào" (Menu "Giá mua đầu vào" (/purchase-prices), trang thêm mới /purchase-prices/add, chi tiết /purchase-prices/{id}): locator theo nhãn đang có trên web dev | UI-BGM-001..UI-BGM-022 | - | `src/core/pages/components/data-table.component.ts` |
| `src/gia-mua-dinh-muc/pages/gia-mua-dinh-muc.page.ts` | page | Page Object màn "Giá mua định mức" (Menu "Giá mua định mức" (/standard-prices) và chi tiết /standard-prices/{id}): locator theo nhãn đang có trên web dev | UI-SBP-001..UI-SBP-015 | - | `src/core/pages/components/data-table.component.ts` |
| `src/gia-ban-dinh-muc/pages/gia-ban-dinh-muc.page.ts` | page | Page Object màn "Giá bán định mức" (Menu "Giá bán định mức" (/standard-selling-prices) và chi tiết): locator theo nhãn đang có trên web dev | UI-SSP-001..UI-SSP-010 | - | `src/core/pages/components/data-table.component.ts` |
| `src/quan-ly-bao-gia/pages/ycbg.page.ts` | page | Page Object màn "Yêu cầu báo giá" (Menu "Quản lý báo giá" (/quotations) tab "Yêu cầu báo giá", form /quotations/requests/new, chi tiết YCBG): locator theo nhãn đang có trên web dev | UI-RFQ-001..UI-RFQ-016 | - | `src/core/pages/components/data-table.component.ts` |
| `src/quan-ly-bao-gia/pages/bgnb.page.ts` | page | Page Object màn "Báo giá nội bộ" (Tab "Báo giá nội bộ" của Quản lý báo giá, form /quotations/internal-quotes/new, chi tiết /quotations/internal-quotes/{id}): locator theo nhãn đang có trên web dev | UI-IPS-001..UI-IPS-014 | - | `src/core/pages/components/data-table.component.ts` |
| `src/quan-ly-bao-gia/pages/bgkh.page.ts` | page | Page Object màn "Báo giá khách hàng" (Tab "Báo giá khách hàng" của Quản lý báo giá và chi tiết /quotations/rate-cards/{id}): locator theo nhãn đang có trên web dev | UI-RC-001..UI-RC-017 | - | `src/core/pages/components/data-table.component.ts` |
| `src/phieu-dich-vu/pages/phieu-dich-vu.page.ts` | page | Page Object màn "Phiếu dịch vụ (Khối 1)" (Menu "Quản lý Dịch vụ" (/service-tickets), form /service-tickets/new, chi tiết /service-tickets/{id}): locator theo nhãn đang có trên web dev | UI-ORD-001..UI-ORD-020 | - | `src/core/pages/components/data-table.component.ts` |
| `src/thap-dieu-phoi/pages/thap-dieu-phoi.page.ts` | page | Page Object màn "Tháp điều phối" (Menu Trung tâm điều phối → "Quản lý dịch vụ" (/control-tower/service-orders) và chi tiết phiếu): locator theo nhãn đang có trên web dev | UI-K3-001..UI-K3-015 | - | `src/core/pages/components/data-table.component.ts` |
| `src/chi-phi-doanh-thu/pages/chi-phi-doanh-thu.page.ts` | page | Page Object màn "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu" (Menu "Chi phí - Doanh thu" (/cost-revenue) và tab "Chi phí - Doanh thu" ở chi tiết phiếu): locator theo nhãn đang có trên web dev | UI-PNL-001..UI-PNL-016 | - | `src/core/pages/components/data-table.component.ts` |
| `src/lich-su-thong-bao/pages/thong-bao.page.ts` | page | Page Object màn "Thông báo trong hệ thống" (Chuông thông báo trên thanh trên cùng): locator theo nhãn đang có trên web dev | UI-NTF-001..UI-NTF-003 | - | `src/core/pages/components/data-table.component.ts` |
| `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | test | Luồng API "Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-ADM-001..FLOW-ADM-009 | `POST /api/auth/login`, `POST /api/admin/roles`, `POST /api/admin/users`, `GET /api/admin/users/{id}/permissions`, `GET /api/k3/service-orders`, `PUT /api/k3/service-orders/{id}/services/{type}/coordination` (+17 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/xac-thuc.client.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, (+3) |
| `tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` | test | Luồng API "Cấu hình chặng → mô phỏng → xác nhận chặng trên phiếu": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-LEG-001..FLOW-LEG-004 | `POST /api/leg-rules`, `GET /api/leg-rules/{code}`, `POST /api/leg-rules/simulate`, `PATCH /api/leg-rules/{code}/status`, `GET /api/leg-rules/{code}/history`, `GET /api/k3/service-orders/{id}/legs/preview` (+4 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-chang/api/quy-tac-chang.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/core/data/p0-price-set.ts` |
| `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | test | Luồng API "Thiết lập giá: Đầu mục → Giá mua đầu vào → Giá mua định mức → Giá bán định mức": mỗi case chuẩn bị đầu mục và bảng giá riêng cho bước cần kiểm; case sau tiếp tục thực thi nếu case trước lỗi | FLOW-PRICE-001..FLOW-PRICE-006 | `PUT /api/price-configurations/{id}/items`, `GET /api/price-configurations/{id}`, `GET /api/purchase-prices/contractors`, `POST /api/purchase-prices`, `GET /api/standard-buying-prices`, `GET /api/purchase-prices/{id}/activation-check` (+13 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-dau-muc-gia/api/dau-muc-gia.client.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/core/data/p0-price-set.ts` |
| `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | test | Luồng API "Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động)": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-QUOTE-001..FLOW-QUOTE-011 | `POST /api/quotation-requests`, `POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents`, `POST /api/quotation-requests/{id}/submit`, `GET /api/notifications`, `POST /api/quotation-requests/{id}/accept`, `GET /api/quotation-requests/{id}` (+21 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, (+1) |
| `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | test | Luồng API "Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu": mỗi case dựng phiếu riêng đến trạng thái tiền điều kiện từ bộ giá P0; case sau tiếp tục thực thi nếu case trước lỗi | FLOW-E2E-001..FLOW-E2E-015 | `GET /api/service-orders/selectable-customers`, `POST /api/service-orders`, `GET /api/service-orders/{id}`, `GET /api/service-orders/{id}/revenue`, `GET /api/notifications`, `GET /api/k3/service-orders` (+29 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts`, (+2) |
| `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | test | Luồng API "Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-REV-001..FLOW-REV-014 | `PUT /api/k3/service-orders/{id}/services/{type}/coordination`, `GET /api/service-orders/{id}/revenue`, `GET /api/k3/service-orders/{id}/services/{type}/costs`, `POST /api/k3/service-orders/{id}/services/{type}/costs`, `GET /api/service-orders/{id}/pnl`, `POST /api/k3/service-orders/{id}/services/{type}/complete` (+21 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, (+5) |
| `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | test | Luồng API "Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-CHG-BGM-001..FLOW-CHG-BGM-008 | `PUT /api/purchase-prices/{id}/items`, `GET /api/purchase-prices/{id}/items`, `GET /api/standard-buying-prices`, `GET /api/standard-selling-prices`, `GET /api/internal-quotes/{id}`, `GET /api/customer-quotations/{id}` (+14 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, (+5) |
| `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | test | Luồng API "Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-CHG-SBP-001..FLOW-CHG-SBP-007 | `PUT /api/standard-buying-prices/{id}/benchmark`, `GET /api/standard-selling-prices`, `GET /api/standard-selling-prices/{id}`, `GET /api/standard-buying-prices/{id}/history`, `GET /api/internal-quotes/{id}`, `GET /api/customer-quotations/{id}` (+8 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, (+3) |
| `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | test | Luồng API "Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-CHG-SSP-001..FLOW-CHG-SSP-011 | `PUT /api/standard-selling-prices/{id}/selling-price`, `GET /api/internal-quotes/{id}`, `GET /api/internal-quotes/{id}/history`, `POST /api/quotation-requests/{id}/customer-quotation`, `POST /api/internal-quotes/{id}/withdraw`, `PUT /api/internal-quotes/{id}` (+20 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, (+5) |
| `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | test | Luồng API "Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt)": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-DEACT-001..FLOW-DEACT-014 | `GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact`, `PUT /api/price-configurations/{id}/items`, `GET /api/price-configurations/{id}`, `GET /api/k3/service-orders/{id}/services/{type}/costs`, `GET /api/service-orders/{id}/revenue`, `GET /api/service-orders/{id}/pnl` (+14 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-dau-muc-gia/api/dau-muc-gia.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, (+5) |
| `tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` | test | Luồng API "Gộp đầu mục trên BGKH và doanh thu phiếu dịch vụ": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-MERGE-001..FLOW-MERGE-004 | `POST /api/customer-quotations/{id}/merges`, `GET /api/customer-quotations/{id}`, `PUT /api/customer-quotations/{id}/prices`, `POST /api/customer-quotations/{id}/confirm`, `POST /api/service-orders`, `POST /api/k3/service-orders/{id}/accept` (+6 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/core/data/p0-price-set.ts` |
| `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | test | Luồng API "Ngoại lệ phiếu dịch vụ: từ chối, khôi phục, hủy, chi phí phát sinh do K3 tạo, đề xuất phạm vi, đổi xe": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-EXC-001..FLOW-EXC-003, FLOW-EXC-005..FLOW-EXC-007 | `POST /api/k3/service-orders/{id}/reject`, `GET /api/service-orders/{id}`, `PUT /api/service-orders/{id}`, `POST /api/service-orders/{id}/restore`, `POST /api/k3/service-orders/{id}/accept`, `POST /api/service-orders/{id}/cancel` (+14 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/thap-dieu-phoi/api/ngoai-le.client.ts`, (+2) |
| `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | test | Luồng API "Tỷ giá, P&L và báo cáo Chi phí – Doanh thu nhất quán": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-PNL-001..FLOW-PNL-005 | `PUT /api/service-orders/{id}/pnl/fx-rate`, `GET /api/service-orders/{id}/pnl`, `GET /api/cost-revenue/orders`, `GET /api/exchange-rates/{currency}`, `GET /api/service-orders/{id}/pnl/fx-rate`, `GET /api/cost-revenue/orders/stats` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts`, `src/chi-phi-doanh-thu/api/bao-cao-chi-phi-doanh-thu.client.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts`, `src/core/data/p0-price-set.ts` |
| `tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` | test | Luồng API "Lịch sử hoạt động và thông báo xuyên module": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-HIST-001..FLOW-HIST-004 | `PUT /api/purchase-prices/{id}/items`, `GET /api/standard-buying-prices/{id}/history`, `GET /api/standard-selling-prices/{id}/history`, `GET /api/quotation-requests/{id}/history`, `GET /api/internal-quotes/{id}/history`, `GET /api/customer-quotations/{id}/history` (+7 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, (+6) |
| `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | test | Luồng API "Phân quyền theo hành động (Xem / Cập nhật / Kích hoạt / Duyệt)": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-PERM-001..FLOW-PERM-006 | `GET /api/purchase-prices/{id}`, `PUT /api/purchase-prices/{id}/items`, `PUT /api/purchase-prices/{id}/items/{itemId}`, `POST /api/purchase-prices/{id}/activate`, `PUT /api/standard-buying-prices/{id}/benchmark`, `PUT /api/standard-buying-prices/benchmarks` (+17 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/cau-hinh-dau-muc-gia/api/dau-muc-gia.client.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, (+4) |
| `tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts` | test | Luồng API "Cách ly tenant và tài nguyên con": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) | FLOW-TEN-001..FLOW-TEN-003 | `GET /api/purchase-prices/{id}`, `GET /api/customer-quotations/{id}`, `GET /api/service-orders/{id}`, `GET /api/service-orders/{id}/documents/{documentId}`, `PUT /api/standard-selling-prices/{id}/selling-price`, `GET /api/cost-revenue/orders` (+7 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/chi-phi-doanh-thu/api/bao-cao-chi-phi-doanh-thu.client.ts`, (+2) |
| `tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts` | test | API "Xác thực và phiên đăng nhập": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | AUTH-001, AUTH-008, AUTH-030 | `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/password`, `POST /api/auth/login`, `GET /api/admin/audit-log` | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/xac-thuc.client.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts` |
| `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | test | API "Xác thực và phiên đăng nhập": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | AUTH-002..AUTH-006, AUTH-014..AUTH-016, AUTH-022..AUTH-023, AUTH-026..AUTH-029, AUTH-036..AUTH-038 | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/admin/users/{id}/lock`, `POST /api/auth/logout`, `DELETE /api/admin/users/{userId}/roles/{roleId}`, `POST /api/auth/password` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/xac-thuc.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts` |
| `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | test | API "Xác thực và phiên đăng nhập": dữ liệu vào sai, giá trị biên, xử lý lỗi | AUTH-007, AUTH-010, AUTH-012, AUTH-017..AUTH-018, AUTH-020, AUTH-025, AUTH-031..AUTH-032, AUTH-034, AUTH-039..AUTH-040, AUTH-042 | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/password`, `POST /api/auth/refresh` | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/xac-thuc.client.ts` |
| `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | test | API "Xác thực và phiên đăng nhập": gửi trùng, gửi đồng thời | AUTH-009, AUTH-013, AUTH-021, AUTH-035, AUTH-043 | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/password`, `POST /api/auth/refresh` | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/xac-thuc.client.ts` |
| `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | test | API "Xác thực và phiên đăng nhập": cấu trúc phản hồi so với schema Swagger | AUTH-011, AUTH-019, AUTH-024, AUTH-033, AUTH-041 | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/password`, `POST /api/auth/refresh` | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/xac-thuc.client.ts`, `src/quan-tri-phan-quyen/api/schemas/xac-thuc.schema.ts` |
| `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | test | API "Quản trị bộ phận": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | ADM-DEP-001, ADM-DEP-004, ADM-DEP-012..ADM-DEP-013, ADM-DEP-059, ADM-DEP-074 | `GET /api/admin/departments`, `POST /api/admin/departments`, `GET /api/admin/departments/{id}`, `PUT /api/admin/departments/{id}`, `DELETE /api/admin/departments/{id}`, `POST /api/admin/departments/{id}/activate` (+6 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/bo-phan.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | test | API "Quản trị bộ phận": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | ADM-DEP-002..ADM-DEP-003, ADM-DEP-009..ADM-DEP-011, ADM-DEP-019, ADM-DEP-023..ADM-DEP-025, ADM-DEP-030..ADM-DEP-033, ADM-DEP-037..ADM-DEP-039, ADM-DEP-044..ADM-DEP-046, ADM-DEP-051..ADM-DEP-053, ADM-DEP-058, ADM-DEP-060..ADM-DEP-061, ADM-DEP-065..ADM-DEP-067, ADM-DEP-073, ADM-DEP-075..ADM-DEP-076 | `GET /api/admin/departments`, `POST /api/admin/departments`, `GET /api/admin/users/{id}/permissions`, `GET /api/admin/departments/{id}`, `PUT /api/admin/departments/{id}`, `DELETE /api/admin/departments/{id}` (+8 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/bo-phan.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | test | API "Quản trị bộ phận": dữ liệu vào sai, giá trị biên, xử lý lỗi | ADM-DEP-005..ADM-DEP-006, ADM-DEP-008, ADM-DEP-014..ADM-DEP-015, ADM-DEP-017, ADM-DEP-020, ADM-DEP-022, ADM-DEP-026..ADM-DEP-027, ADM-DEP-029, ADM-DEP-034, ADM-DEP-036, ADM-DEP-040, ADM-DEP-042, ADM-DEP-047, ADM-DEP-049, ADM-DEP-054, ADM-DEP-056, ADM-DEP-062, ADM-DEP-064, ADM-DEP-068..ADM-DEP-069, ADM-DEP-071, ADM-DEP-077, ADM-DEP-079 | `GET /api/admin/departments`, `POST /api/admin/departments`, `GET /api/admin/departments/{id}`, `PUT /api/admin/departments/{id}`, `DELETE /api/admin/departments/{id}`, `POST /api/admin/departments/{id}/activate` (+6 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/bo-phan.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | test | API "Quản trị bộ phận": cấu trúc phản hồi so với schema Swagger | ADM-DEP-007, ADM-DEP-016, ADM-DEP-021, ADM-DEP-028, ADM-DEP-035, ADM-DEP-041, ADM-DEP-048, ADM-DEP-055, ADM-DEP-063, ADM-DEP-070, ADM-DEP-078 | `GET /api/admin/departments`, `POST /api/admin/departments`, `GET /api/admin/departments/{id}`, `PUT /api/admin/departments/{id}`, `DELETE /api/admin/departments/{id}`, `POST /api/admin/departments/{id}/activate` (+5 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/bo-phan.client.ts`, `src/quan-tri-phan-quyen/api/schemas/bo-phan.schema.ts` |
| `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | test | API "Quản trị bộ phận": gửi trùng, gửi đồng thời | ADM-DEP-018, ADM-DEP-043, ADM-DEP-050, ADM-DEP-057, ADM-DEP-072 | `POST /api/admin/departments`, `GET /api/admin/departments`, `POST /api/admin/departments/{id}/activate`, `GET /api/admin/departments/{id}`, `POST /api/admin/departments/{id}/deactivate`, `POST /api/admin/departments/{id}/roles` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/bo-phan.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts` | test | API "Quản trị người dùng": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | ADM-USR-001, ADM-USR-005, ADM-USR-015 | `GET /api/admin/users`, `POST /api/admin/users`, `GET /api/admin/users/{id}`, `PUT /api/admin/users/{id}`, `POST /api/admin/users/{id}/lock`, `POST /api/admin/users/{id}/unlock` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | test | API "Quản trị người dùng": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | ADM-USR-002..ADM-USR-004, ADM-USR-010..ADM-USR-014, ADM-USR-021, ADM-USR-025..ADM-USR-028, ADM-USR-033..ADM-USR-037, ADM-USR-042..ADM-USR-045, ADM-USR-050..ADM-USR-052, ADM-USR-057, ADM-USR-061, ADM-USR-063 | `GET /api/admin/users`, `POST /api/admin/users`, `GET /api/admin/users/{id}`, `GET /api/admin/users/{id}/permissions`, `PUT /api/admin/users/{id}`, `GET /api/k3/service-orders` (+6 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/quan-tri-phan-quyen/api/xac-thuc.client.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts` |
| `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | test | API "Quản trị người dùng": dữ liệu vào sai, giá trị biên, xử lý lỗi | ADM-USR-006..ADM-USR-007, ADM-USR-009, ADM-USR-016..ADM-USR-017, ADM-USR-019, ADM-USR-022, ADM-USR-024, ADM-USR-029..ADM-USR-030, ADM-USR-032, ADM-USR-038, ADM-USR-040, ADM-USR-046, ADM-USR-048, ADM-USR-053, ADM-USR-055, ADM-USR-058, ADM-USR-060, ADM-USR-064, ADM-USR-066 | `GET /api/admin/users`, `POST /api/admin/users`, `GET /api/admin/users/{id}`, `PUT /api/admin/users/{id}`, `POST /api/admin/users/{id}/lock`, `POST /api/admin/users/{id}/unlock` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | test | API "Quản trị người dùng": cấu trúc phản hồi so với schema Swagger | ADM-USR-008, ADM-USR-018, ADM-USR-023, ADM-USR-031, ADM-USR-039, ADM-USR-047, ADM-USR-054, ADM-USR-059, ADM-USR-065 | `GET /api/admin/users`, `POST /api/admin/users`, `GET /api/admin/users/{id}`, `PUT /api/admin/users/{id}`, `POST /api/admin/users/{id}/lock`, `POST /api/admin/users/{id}/unlock` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts`, `src/quan-tri-phan-quyen/api/schemas/nguoi-dung.schema.ts` |
| `tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` | test | API "Quản trị người dùng": gửi trùng, gửi đồng thời | ADM-USR-020, ADM-USR-041, ADM-USR-049, ADM-USR-056 | `POST /api/admin/users`, `GET /api/admin/users`, `POST /api/admin/users/{id}/lock`, `GET /api/admin/users/{id}`, `POST /api/admin/users/{id}/unlock`, `POST /api/admin/users/{id}/password/reset` | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/quan-tri-phan-quyen/nguoi-dung.integration.spec.ts` | test | API "Quản trị người dùng": tải lên/tải về file, tích hợp dịch vụ ngoài | ADM-USR-062 | `GET /api/admin/users/{id}/permissions/export` | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` | test | API "Quản trị vai trò, nhật ký và thiết lập": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | ADM-ROLE-001, ADM-ROLE-066, ADM-ROLE-081, ADM-ROLE-101 | `GET /api/admin/permissions`, `GET /api/admin/roles`, `POST /api/admin/roles`, `GET /api/admin/roles/{id}`, `PUT /api/admin/roles/{id}`, `DELETE /api/admin/roles/{id}` (+11 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | test | API "Quản trị vai trò, nhật ký và thiết lập": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | ADM-ROLE-002..ADM-ROLE-003, ADM-ROLE-006..ADM-ROLE-007, ADM-ROLE-012..ADM-ROLE-016, ADM-ROLE-022, ADM-ROLE-026..ADM-ROLE-028, ADM-ROLE-033..ADM-ROLE-036, ADM-ROLE-040..ADM-ROLE-042, ADM-ROLE-047..ADM-ROLE-049, ADM-ROLE-054, ADM-ROLE-058..ADM-ROLE-060, ADM-ROLE-065, ADM-ROLE-067..ADM-ROLE-068, ADM-ROLE-072..ADM-ROLE-074, ADM-ROLE-080, ADM-ROLE-082..ADM-ROLE-083, ADM-ROLE-087..ADM-ROLE-089, ADM-ROLE-094, ADM-ROLE-097..ADM-ROLE-100 | `GET /api/admin/permissions`, `GET /api/admin/roles`, `POST /api/admin/roles`, `PUT /api/admin/settings`, `GET /api/admin/roles/{id}/users`, `GET /api/admin/roles/{id}` (+14 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/quan-tri-phan-quyen/api/xac-thuc.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | test | API "Quản trị vai trò, nhật ký và thiết lập": cấu trúc phản hồi so với schema Swagger | ADM-ROLE-004, ADM-ROLE-010, ADM-ROLE-019, ADM-ROLE-024, ADM-ROLE-031, ADM-ROLE-038, ADM-ROLE-044, ADM-ROLE-051, ADM-ROLE-056, ADM-ROLE-062, ADM-ROLE-070, ADM-ROLE-077, ADM-ROLE-085, ADM-ROLE-092, ADM-ROLE-095, ADM-ROLE-104 | `GET /api/admin/permissions`, `GET /api/admin/roles`, `POST /api/admin/roles`, `GET /api/admin/roles/{id}`, `PUT /api/admin/roles/{id}`, `DELETE /api/admin/roles/{id}` (+10 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts`, `src/quan-tri-phan-quyen/api/schemas/vai-tro.schema.ts` |
| `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | test | API "Quản trị vai trò, nhật ký và thiết lập": dữ liệu vào sai, giá trị biên, xử lý lỗi | ADM-ROLE-005, ADM-ROLE-008..ADM-ROLE-009, ADM-ROLE-011, ADM-ROLE-017..ADM-ROLE-018, ADM-ROLE-020, ADM-ROLE-023, ADM-ROLE-025, ADM-ROLE-029..ADM-ROLE-030, ADM-ROLE-032, ADM-ROLE-037, ADM-ROLE-039, ADM-ROLE-043, ADM-ROLE-045, ADM-ROLE-050, ADM-ROLE-052, ADM-ROLE-055, ADM-ROLE-057, ADM-ROLE-061, ADM-ROLE-063, ADM-ROLE-069, ADM-ROLE-071, ADM-ROLE-075..ADM-ROLE-076, ADM-ROLE-078, ADM-ROLE-084, ADM-ROLE-086, ADM-ROLE-090..ADM-ROLE-091, ADM-ROLE-093, ADM-ROLE-096, ADM-ROLE-102..ADM-ROLE-103, ADM-ROLE-105 | `GET /api/admin/permissions`, `GET /api/admin/roles`, `POST /api/admin/roles`, `GET /api/admin/roles/{id}`, `PUT /api/admin/roles/{id}`, `DELETE /api/admin/roles/{id}` (+11 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | test | API "Quản trị vai trò, nhật ký và thiết lập": gửi trùng, gửi đồng thời | ADM-ROLE-021, ADM-ROLE-046, ADM-ROLE-053, ADM-ROLE-064, ADM-ROLE-079 | `POST /api/admin/roles`, `GET /api/admin/roles`, `POST /api/admin/roles/{id}/activate`, `GET /api/admin/roles/{id}`, `POST /api/admin/roles/{id}/deactivate`, `POST /api/admin/roles/{id}/users` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts`, `src/quan-tri-phan-quyen/api/nguoi-dung.client.ts` |
| `tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts` | test | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | LEG-001, LEG-018 | `GET /api/leg-rules`, `POST /api/leg-rules`, `GET /api/leg-rules/{code}`, `PUT /api/leg-rules/{code}`, `DELETE /api/leg-rules/{code}`, `GET /api/leg-rules/{code}/history` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-chang/api/quy-tac-chang.client.ts` |
| `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | test | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | LEG-002..LEG-004, LEG-009..LEG-017, LEG-025, LEG-029..LEG-032, LEG-038..LEG-041, LEG-045, LEG-050..LEG-054, LEG-060..LEG-063 | `GET /api/leg-rules`, `POST /api/leg-rules`, `GET /api/leg-rules/{code}`, `PUT /api/leg-rules/{code}`, `GET /api/k3/service-orders/{id}`, `DELETE /api/leg-rules/{code}` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-chang/api/quy-tac-chang.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | test | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": dữ liệu vào sai, giá trị biên, xử lý lỗi | LEG-005..LEG-006, LEG-008, LEG-019..LEG-021, LEG-023, LEG-026, LEG-028, LEG-033..LEG-035, LEG-037, LEG-042, LEG-044, LEG-046..LEG-047, LEG-049, LEG-055..LEG-056, LEG-058, LEG-064..LEG-065, LEG-067, LEG-069..LEG-073 | `GET /api/leg-rules`, `POST /api/leg-rules`, `GET /api/leg-rules/{code}`, `PUT /api/leg-rules/{code}`, `DELETE /api/leg-rules/{code}`, `GET /api/leg-rules/{code}/history` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-chang/api/quy-tac-chang.client.ts` |
| `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | test | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": cấu trúc phản hồi so với schema Swagger | LEG-007, LEG-022, LEG-027, LEG-036, LEG-043, LEG-048, LEG-057, LEG-066 | `GET /api/leg-rules`, `POST /api/leg-rules`, `GET /api/leg-rules/{code}`, `PUT /api/leg-rules/{code}`, `DELETE /api/leg-rules/{code}`, `GET /api/leg-rules/{code}/history` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-chang/api/quy-tac-chang.client.ts`, `src/cau-hinh-chang/api/schemas/quy-tac-chang.schema.ts` |
| `tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts` | test | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": gửi trùng, gửi đồng thời | LEG-024, LEG-059, LEG-068 | `POST /api/leg-rules`, `GET /api/leg-rules`, `PATCH /api/leg-rules/{code}/status`, `GET /api/leg-rules/{code}`, `POST /api/leg-rules/simulate` | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-chang/api/quy-tac-chang.client.ts` |
| `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | test | API "Cấu hình đầu mục giá": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | CFG-001, CFG-003, CFG-050, CFG-061, CFG-068, CFG-083 | `GET /api/price-configurations`, `GET /api/price-configurations/stats`, `GET /api/price-configurations/{id}`, `GET /api/price-configurations/{id}/history`, `POST /api/price-configurations/{id}/items`, `PUT /api/price-configurations/{id}/items` (+6 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-dau-muc-gia/api/dau-muc-gia.client.ts` |
| `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | test | API "Cấu hình đầu mục giá": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | CFG-002, CFG-006..CFG-007, CFG-010, CFG-014..CFG-015, CFG-020..CFG-026, CFG-034..CFG-041, CFG-047..CFG-049, CFG-051, CFG-058..CFG-060, CFG-062, CFG-066..CFG-067, CFG-072, CFG-077..CFG-078, CFG-082 | `GET /api/price-configurations`, `GET /api/price-configurations/stats`, `PUT /api/price-configurations/{id}/items/{itemId}`, `GET /api/price-configurations/{id}`, `GET /api/price-configurations/{id}/history`, `POST /api/price-configurations/{id}/items` (+8 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-dau-muc-gia/api/dau-muc-gia.client.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts` |
| `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | test | API "Cấu hình đầu mục giá": cấu trúc phản hồi so với schema Swagger | CFG-004, CFG-008, CFG-012, CFG-018, CFG-031, CFG-045, CFG-056, CFG-064, CFG-070, CFG-075, CFG-080, CFG-085 | `GET /api/price-configurations`, `GET /api/price-configurations/stats`, `GET /api/price-configurations/{id}`, `GET /api/price-configurations/{id}/history`, `POST /api/price-configurations/{id}/items`, `PUT /api/price-configurations/{id}/items` (+6 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-dau-muc-gia/api/dau-muc-gia.client.ts`, `src/cau-hinh-dau-muc-gia/api/schemas/dau-muc-gia.schema.ts` |
| `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | test | API "Cấu hình đầu mục giá": dữ liệu vào sai, giá trị biên, xử lý lỗi | CFG-005, CFG-009, CFG-011, CFG-013, CFG-016..CFG-017, CFG-019, CFG-027..CFG-030, CFG-032, CFG-043..CFG-044, CFG-046, CFG-052..CFG-055, CFG-057, CFG-063, CFG-065, CFG-069, CFG-071, CFG-073..CFG-074, CFG-076, CFG-079, CFG-081, CFG-084, CFG-086..CFG-091 | `GET /api/price-configurations`, `GET /api/price-configurations/stats`, `GET /api/price-configurations/{id}`, `GET /api/price-configurations/{id}/history`, `POST /api/price-configurations/{id}/items`, `PUT /api/price-configurations/{id}/items` (+6 API) | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-dau-muc-gia/api/dau-muc-gia.client.ts` |
| `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts` | test | API "Cấu hình đầu mục giá": gửi trùng, gửi đồng thời | CFG-033, CFG-042 | `POST /api/price-configurations/{id}/items`, `GET /api/price-configurations/{id}`, `PUT /api/price-configurations/{id}/items` | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-dau-muc-gia/api/dau-muc-gia.client.ts` |
| `tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts` | test | API "Tỷ giá Vietcombank và thông báo": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | COM-001, COM-017 | `GET /api/exchange-rates/{currency}`, `GET /api/notifications`, `GET /api/notifications/unread-count`, `POST /api/notifications/{id}/read` | `src/core/fixtures/auth.fixture.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts` |
| `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | test | API "Tỷ giá Vietcombank và thông báo": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | COM-002..COM-003, COM-008..COM-009, COM-013, COM-016, COM-018..COM-019 | `GET /api/exchange-rates/{currency}`, `GET /api/notifications`, `GET /api/notifications/unread-count`, `POST /api/notifications/{id}/read` | `src/core/fixtures/auth.fixture.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts` |
| `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | test | API "Tỷ giá Vietcombank và thông báo": dữ liệu vào sai, giá trị biên, xử lý lỗi | COM-005, COM-007, COM-010, COM-012, COM-015, COM-020, COM-022 | `GET /api/exchange-rates/{currency}`, `GET /api/notifications`, `GET /api/notifications/unread-count`, `POST /api/notifications/{id}/read` | `src/core/fixtures/auth.fixture.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts` |
| `tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` | test | API "Tỷ giá Vietcombank và thông báo": cấu trúc phản hồi so với schema Swagger | COM-006, COM-011, COM-014, COM-021 | `GET /api/exchange-rates/{currency}`, `GET /api/notifications`, `GET /api/notifications/unread-count`, `POST /api/notifications/{id}/read` | `src/core/fixtures/auth.fixture.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts`, `src/lich-su-thong-bao/api/schemas/ty-gia-thong-bao.schema.ts` |
| `tests/api/lich-su-thong-bao/ty-gia-thong-bao.concurrency.spec.ts` | test | API "Tỷ giá Vietcombank và thông báo": gửi trùng, gửi đồng thời | COM-023 | `POST /api/notifications/{id}/read`, `GET /api/notifications` | `src/core/fixtures/auth.fixture.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts` |
| `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | test | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | BGM-001, BGM-004, BGM-104, BGM-112, BGM-119, BGM-131, BGM-136 | `GET /api/purchase-prices`, `POST /api/purchase-prices`, `GET /api/purchase-prices/contractors`, `GET /api/purchase-prices/stats`, `GET /api/purchase-prices/{id}`, `PUT /api/purchase-prices/{id}` (+14 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts` |
| `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | test | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)" (phần bảng giá): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | BGM-002..BGM-003, BGM-009..BGM-015, BGM-022, BGM-025..BGM-026, BGM-029, BGM-033..BGM-036, BGM-042..BGM-045, BGM-071, BGM-076, BGM-124, BGM-129..BGM-130, BGM-135, BGM-141 | `GET /api/purchase-prices`, `POST /api/purchase-prices`, `GET /api/standard-buying-prices`, `GET /api/purchase-prices/contractors`, `GET /api/purchase-prices/stats`, `GET /api/purchase-prices/{id}` (+7 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts` |
| `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | test | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)" (phần dòng giá): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | BGM-077..BGM-079, BGM-084..BGM-087, BGM-093..BGM-097, BGM-102..BGM-103, BGM-105, BGM-110..BGM-111, BGM-113, BGM-117..BGM-118, BGM-120 | `GET /api/purchase-prices/{id}/items`, `POST /api/purchase-prices/{id}/items`, `GET /api/standard-buying-prices`, `PUT /api/purchase-prices/{id}/items`, `GET /api/k3/service-orders/{id}/services/{type}/costs`, `POST /api/purchase-prices/{id}/items/approve` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts` |
| `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | test | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)" (phần kích hoạt / ngừng): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | BGM-049..BGM-053, BGM-058, BGM-062..BGM-066 | `POST /api/purchase-prices/{id}/activate`, `GET /api/purchase-prices/{id}`, `GET /api/standard-buying-prices`, `GET /api/purchase-prices/{id}/activation-check`, `POST /api/purchase-prices/{id}/deactivate`, `GET /api/k3/service-orders/{id}/services/{type}/coordination-options` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts` |
| `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | test | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": dữ liệu vào sai, giá trị biên, xử lý lỗi | BGM-005..BGM-006, BGM-008, BGM-016..BGM-018, BGM-020, BGM-024, BGM-028, BGM-030, BGM-032, BGM-037..BGM-039, BGM-041, BGM-046, BGM-048, BGM-054, BGM-056, BGM-059, BGM-061, BGM-067, BGM-069, BGM-072..BGM-073, BGM-075, BGM-080..BGM-081, BGM-083, BGM-088..BGM-089, BGM-091, BGM-099, BGM-101, BGM-106, BGM-108, BGM-114, BGM-116, BGM-121, BGM-123, BGM-125..BGM-126, BGM-128, BGM-132, BGM-134, BGM-137..BGM-138, BGM-140, BGM-142..BGM-143 | `GET /api/purchase-prices`, `POST /api/purchase-prices`, `GET /api/purchase-prices/contractors`, `GET /api/purchase-prices/stats`, `GET /api/purchase-prices/{id}`, `PUT /api/purchase-prices/{id}` (+14 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts` |
| `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | test | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": cấu trúc phản hồi so với schema Swagger | BGM-007, BGM-019, BGM-023, BGM-027, BGM-031, BGM-040, BGM-047, BGM-055, BGM-060, BGM-068, BGM-074, BGM-082, BGM-090, BGM-100, BGM-107, BGM-115, BGM-122, BGM-127, BGM-133, BGM-139 | `GET /api/purchase-prices`, `POST /api/purchase-prices`, `GET /api/purchase-prices/contractors`, `GET /api/purchase-prices/stats`, `GET /api/purchase-prices/{id}`, `PUT /api/purchase-prices/{id}` (+14 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/gia-mua-dau-vao/api/schemas/bang-gia-mua.schema.ts` |
| `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | test | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": gửi trùng, gửi đồng thời | BGM-021, BGM-057, BGM-070, BGM-092, BGM-098, BGM-109 | `POST /api/purchase-prices`, `GET /api/purchase-prices`, `POST /api/purchase-prices/{id}/activate`, `GET /api/purchase-prices/{id}`, `POST /api/purchase-prices/{id}/deactivate`, `POST /api/purchase-prices/{id}/items` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts` |
| `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.security.spec.ts` | test | API "Giá mua định mức (SBP)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | SBP-001 | `GET /api/standard-buying-prices/groups`, `GET /api/standard-buying-prices`, `GET /api/standard-buying-prices/{id}`, `PUT /api/standard-buying-prices/{id}/benchmark`, `PUT /api/standard-buying-prices/benchmarks`, `GET /api/standard-buying-prices/{id}/contractors` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts` |
| `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | test | API "Giá mua định mức (SBP)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | SBP-002..SBP-003, SBP-007..SBP-009, SBP-014, SBP-018, SBP-020..SBP-024, SBP-028..SBP-031, SBP-036, SBP-040..SBP-042, SBP-046, SBP-051..SBP-054 | `GET /api/standard-buying-prices/groups`, `GET /api/standard-buying-prices`, `GET /api/standard-buying-prices/{id}`, `PUT /api/standard-buying-prices/{id}/benchmark`, `GET /api/standard-selling-prices`, `PUT /api/standard-buying-prices/benchmarks` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts` |
| `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | test | API "Giá mua định mức (SBP)": dữ liệu vào sai, giá trị biên, xử lý lỗi | SBP-004, SBP-006, SBP-010..SBP-011, SBP-013, SBP-015, SBP-017, SBP-019, SBP-025, SBP-027, SBP-032..SBP-033, SBP-035, SBP-037, SBP-039, SBP-043, SBP-045, SBP-047..SBP-048, SBP-050 | `GET /api/standard-buying-prices/groups`, `GET /api/standard-buying-prices`, `GET /api/standard-buying-prices/{id}`, `PUT /api/standard-buying-prices/{id}/benchmark`, `PUT /api/standard-buying-prices/benchmarks`, `GET /api/standard-buying-prices/{id}/contractors` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts` |
| `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | test | API "Giá mua định mức (SBP)": cấu trúc phản hồi so với schema Swagger | SBP-005, SBP-012, SBP-016, SBP-026, SBP-034, SBP-038, SBP-044, SBP-049 | `GET /api/standard-buying-prices/groups`, `GET /api/standard-buying-prices`, `GET /api/standard-buying-prices/{id}`, `PUT /api/standard-buying-prices/{id}/benchmark`, `PUT /api/standard-buying-prices/benchmarks`, `GET /api/standard-buying-prices/{id}/contractors` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts`, `src/gia-mua-dinh-muc/api/schemas/gia-mua-dinh-muc.schema.ts` |
| `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.security.spec.ts` | test | API "Giá bán định mức (SSP)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | SSP-001 | `GET /api/standard-selling-prices/groups`, `GET /api/standard-selling-prices`, `GET /api/standard-selling-prices/{id}`, `PUT /api/standard-selling-prices/{id}/selling-price`, `PUT /api/standard-selling-prices/selling-prices`, `POST /api/standard-selling-prices/{id}/acknowledgement` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts` |
| `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | test | API "Giá bán định mức (SSP)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | SSP-002, SSP-006..SSP-008, SSP-013, SSP-017..SSP-023, SSP-028..SSP-031, SSP-036..SSP-038, SSP-043, SSP-048 | `GET /api/standard-selling-prices/groups`, `GET /api/standard-selling-prices`, `GET /api/standard-selling-prices/{id}`, `PUT /api/standard-selling-prices/{id}/selling-price`, `GET /api/internal-quotes/{id}`, `GET /api/customer-quotations/{id}` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts` |
| `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | test | API "Giá bán định mức (SSP)": dữ liệu vào sai, giá trị biên, xử lý lỗi | SSP-003, SSP-005, SSP-009..SSP-010, SSP-012, SSP-014, SSP-016, SSP-024..SSP-025, SSP-027, SSP-032..SSP-033, SSP-035, SSP-039, SSP-041, SSP-044..SSP-045, SSP-047 | `GET /api/standard-selling-prices/groups`, `GET /api/standard-selling-prices`, `GET /api/standard-selling-prices/{id}`, `PUT /api/standard-selling-prices/{id}/selling-price`, `PUT /api/standard-selling-prices/selling-prices`, `POST /api/standard-selling-prices/{id}/acknowledgement` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts` |
| `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | test | API "Giá bán định mức (SSP)": cấu trúc phản hồi so với schema Swagger | SSP-004, SSP-011, SSP-015, SSP-026, SSP-034, SSP-040, SSP-046 | `GET /api/standard-selling-prices/groups`, `GET /api/standard-selling-prices`, `GET /api/standard-selling-prices/{id}`, `PUT /api/standard-selling-prices/{id}/selling-price`, `PUT /api/standard-selling-prices/selling-prices`, `POST /api/standard-selling-prices/{id}/acknowledgement` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts`, `src/gia-ban-dinh-muc/api/schemas/gia-ban-dinh-muc.schema.ts` |
| `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.concurrency.spec.ts` | test | API "Giá bán định mức (SSP)": gửi trùng, gửi đồng thời | SSP-042 | `POST /api/standard-selling-prices/{id}/acknowledgement`, `GET /api/standard-selling-prices/{id}` | `src/core/fixtures/auth.fixture.ts`, `src/gia-ban-dinh-muc/api/gia-ban-dinh-muc.client.ts` |
| `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | test | API "Yêu cầu báo giá (YCBG/RFQ)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | RFQ-001, RFQ-003, RFQ-015, RFQ-017, RFQ-033, RFQ-040, RFQ-052, RFQ-060, RFQ-081, RFQ-090, RFQ-099, RFQ-105, RFQ-111, RFQ-120, RFQ-131 | `GET /api/quotation-requests`, `POST /api/quotation-requests`, `GET /api/quotation-requests/statuses`, `GET /api/quotation-requests/internal-quote-stats`, `GET /api/quotation-requests/{id}`, `PUT /api/quotation-requests/{id}` (+10 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts` |
| `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | test | API "Yêu cầu báo giá (YCBG/RFQ)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | RFQ-002, RFQ-004..RFQ-005, RFQ-010..RFQ-014, RFQ-016, RFQ-026, RFQ-029, RFQ-032, RFQ-037..RFQ-039, RFQ-041, RFQ-049..RFQ-051, RFQ-053, RFQ-097, RFQ-103..RFQ-104, RFQ-106, RFQ-110, RFQ-116, RFQ-126, RFQ-130, RFQ-132 | `GET /api/quotation-requests`, `POST /api/quotation-requests`, `GET /api/quotation-requests/{id}`, `GET /api/quotation-requests/statuses`, `GET /api/quotation-requests/internal-quote-stats`, `PUT /api/quotation-requests/{id}` (+5 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts` |
| `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | test | API "Yêu cầu báo giá (YCBG/RFQ)" (phần chuyển trạng thái): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | RFQ-057..RFQ-059, RFQ-061, RFQ-066..RFQ-068, RFQ-070, RFQ-087..RFQ-089, RFQ-091, RFQ-117..RFQ-119, RFQ-121 | `POST /api/quotation-requests/{id}/submit`, `GET /api/quotation-requests/{id}`, `GET /api/quotation-requests/{id}/history`, `GET /api/notifications`, `POST /api/quotation-requests/{id}/accept`, `GET /api/quotation-requests` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts` |
| `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | test | API "Yêu cầu báo giá (YCBG/RFQ)" (phần BGNB tự động): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | RFQ-075..RFQ-080, RFQ-082, RFQ-137..RFQ-142 | `POST /api/quotation-requests/{id}/auto-internal-quote`, `GET /api/quotation-requests/{id}`, `GET /api/internal-quotes/{id}`, `PUT /api/quotation-requests/{id}`, `POST /api/quotation-requests/{id}/cancel` | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts` |
| `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | test | API "Yêu cầu báo giá (YCBG/RFQ)": dữ liệu vào sai, giá trị biên, xử lý lỗi | RFQ-006..RFQ-007, RFQ-009, RFQ-018..RFQ-022, RFQ-024, RFQ-028, RFQ-031, RFQ-034, RFQ-036, RFQ-042..RFQ-046, RFQ-048, RFQ-054, RFQ-056, RFQ-062, RFQ-064, RFQ-071, RFQ-073, RFQ-083, RFQ-085, RFQ-092..RFQ-093, RFQ-095, RFQ-100, RFQ-102, RFQ-107, RFQ-109, RFQ-112..RFQ-113, RFQ-115, RFQ-122, RFQ-124, RFQ-133, RFQ-135, RFQ-143..RFQ-147, RFQ-149 | `GET /api/quotation-requests`, `POST /api/quotation-requests`, `GET /api/quotation-requests/statuses`, `GET /api/quotation-requests/internal-quote-stats`, `GET /api/quotation-requests/{id}`, `PUT /api/quotation-requests/{id}` (+10 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts` |
| `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | test | API "Yêu cầu báo giá (YCBG/RFQ)": cấu trúc phản hồi so với schema Swagger | RFQ-008, RFQ-023, RFQ-027, RFQ-030, RFQ-035, RFQ-047, RFQ-055, RFQ-063, RFQ-072, RFQ-084, RFQ-094, RFQ-101, RFQ-108, RFQ-114, RFQ-123, RFQ-134 | `GET /api/quotation-requests`, `POST /api/quotation-requests`, `GET /api/quotation-requests/statuses`, `GET /api/quotation-requests/internal-quote-stats`, `GET /api/quotation-requests/{id}`, `PUT /api/quotation-requests/{id}` (+10 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts`, `src/quan-ly-bao-gia/api/schemas/ycbg.schema.ts` |
| `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | test | API "Yêu cầu báo giá (YCBG/RFQ)": gửi trùng, gửi đồng thời | RFQ-025, RFQ-065, RFQ-069, RFQ-074, RFQ-086, RFQ-096, RFQ-125, RFQ-136 | `POST /api/quotation-requests`, `GET /api/quotation-requests`, `POST /api/quotation-requests/{id}/submit`, `GET /api/quotation-requests/{id}`, `POST /api/quotation-requests/{id}/accept`, `POST /api/quotation-requests/{id}/auto-internal-quote` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts` |
| `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | test | API "Yêu cầu báo giá (YCBG/RFQ)": tải lên/tải về file, tích hợp dịch vụ ngoài | RFQ-098, RFQ-127..RFQ-129, RFQ-148 | `GET /api/quotation-requests/{id}/documents/{documentId}`, `POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents`, `GET /api/quotation-requests/{id}` | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts` |
| `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | test | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | IPS-001, IPS-004, IPS-016, IPS-097, IPS-103, IPS-112, IPS-121, IPS-131 | `GET /api/internal-quotes`, `POST /api/internal-quotes`, `GET /api/internal-quotes/benchmark-lines`, `GET /api/internal-quotes/selectable-requests`, `GET /api/internal-quotes/sheet-options`, `GET /api/internal-quotes/stats` (+12 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts` |
| `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | test | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | IPS-002..IPS-003, IPS-009..IPS-015, IPS-024..IPS-026, IPS-030..IPS-031, IPS-035, IPS-039, IPS-042, IPS-046..IPS-050, IPS-057..IPS-059, IPS-063, IPS-068 | `GET /api/internal-quotes`, `POST /api/internal-quotes`, `PUT /api/standard-buying-prices/{id}/benchmark`, `GET /api/internal-quotes/{id}`, `GET /api/internal-quotes/benchmark-lines`, `GET /api/internal-quotes/selectable-requests` (+5 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/gia-mua-dinh-muc/api/gia-mua-dinh-muc.client.ts` |
| `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | test | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG" (phần phát hành / thu hồi / đồng bộ giá): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | IPS-069..IPS-073, IPS-078..IPS-081, IPS-087..IPS-091 | `POST /api/internal-quotes/{id}/issue`, `GET /api/internal-quotes/{id}`, `GET /api/quotation-requests/{id}`, `POST /api/internal-quotes/{id}/withdraw`, `GET /api/internal-quotes/selectable-requests`, `POST /api/internal-quotes/{id}/sync-standard-prices` | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts` |
| `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | test | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG" (phần lập BGNB theo YCBG): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | IPS-096, IPS-101..IPS-102, IPS-104, IPS-109..IPS-111, IPS-113, IPS-118..IPS-120, IPS-122, IPS-128..IPS-130, IPS-132 | `GET /api/quotation-requests/{id}/internal-quote`, `POST /api/quotation-requests/{id}/internal-quote`, `PUT /api/quotation-requests/{id}/internal-quote`, `POST /api/quotation-requests/{id}/internal-quote/decline`, `GET /api/quotation-requests`, `POST /api/quotation-requests/{id}/internal-quote/issue` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts` |
| `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | test | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": dữ liệu vào sai, giá trị biên, xử lý lỗi | IPS-005..IPS-006, IPS-008, IPS-017..IPS-020, IPS-022, IPS-027, IPS-029, IPS-032, IPS-034, IPS-036, IPS-038, IPS-041, IPS-043, IPS-045, IPS-051..IPS-054, IPS-056, IPS-060, IPS-062, IPS-064..IPS-065, IPS-067, IPS-074, IPS-076, IPS-082..IPS-083, IPS-085, IPS-092, IPS-094, IPS-098, IPS-100, IPS-105, IPS-107, IPS-114..IPS-115, IPS-117, IPS-123..IPS-124, IPS-126, IPS-133, IPS-135 | `GET /api/internal-quotes`, `POST /api/internal-quotes`, `GET /api/internal-quotes/benchmark-lines`, `GET /api/internal-quotes/selectable-requests`, `GET /api/internal-quotes/sheet-options`, `GET /api/internal-quotes/stats` (+12 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts` |
| `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | test | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": cấu trúc phản hồi so với schema Swagger | IPS-007, IPS-021, IPS-028, IPS-033, IPS-037, IPS-040, IPS-044, IPS-055, IPS-061, IPS-066, IPS-075, IPS-084, IPS-093, IPS-099, IPS-106, IPS-116, IPS-125, IPS-134 | `GET /api/internal-quotes`, `POST /api/internal-quotes`, `GET /api/internal-quotes/benchmark-lines`, `GET /api/internal-quotes/selectable-requests`, `GET /api/internal-quotes/sheet-options`, `GET /api/internal-quotes/stats` (+12 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/quan-ly-bao-gia/api/schemas/bgnb.schema.ts` |
| `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | test | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": gửi trùng, gửi đồng thời | IPS-023, IPS-077, IPS-086, IPS-095, IPS-108, IPS-127, IPS-136 | `POST /api/internal-quotes`, `GET /api/internal-quotes`, `POST /api/internal-quotes/{id}/issue`, `GET /api/internal-quotes/{id}`, `POST /api/internal-quotes/{id}/withdraw`, `POST /api/internal-quotes/{id}/sync-standard-prices` (+4 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts` |
| `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | test | API "Báo giá khách hàng (BGKH/RC)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | RC-001, RC-006, RC-014, RC-023, RC-031, RC-042, RC-054, RC-062, RC-070, RC-081, RC-090, RC-101, RC-111, RC-119, RC-124, RC-131, RC-136 | `POST /api/quotation-requests/{id}/customer-quotation`, `GET /api/customer-quotations`, `GET /api/customer-quotations/statuses`, `GET /api/customer-quotations/{id}`, `PUT /api/customer-quotations/{id}/settings`, `PUT /api/customer-quotations/{id}/prices` (+12 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts` |
| `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | test | API "Báo giá khách hàng (BGKH/RC)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | RC-002..RC-005, RC-007, RC-012..RC-013, RC-019, RC-022, RC-027, RC-029..RC-030, RC-032, RC-037..RC-041, RC-043, RC-117, RC-123, RC-129..RC-130, RC-135 | `POST /api/quotation-requests/{id}/customer-quotation`, `GET /api/quotation-requests/{id}`, `POST /api/internal-quotes/{id}/withdraw`, `GET /api/customer-quotations`, `GET /api/customer-quotations/statuses`, `GET /api/customer-quotations/{id}` (+6 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts` |
| `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | test | API "Báo giá khách hàng (BGKH/RC)" (phần gộp đầu mục): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | RC-048..RC-053, RC-055, RC-061, RC-063..RC-064, RC-068..RC-069, RC-071 | `POST /api/customer-quotations/{id}/merges`, `GET /api/customer-quotations/{id}`, `DELETE /api/customer-quotations/{id}/merges/{groupId}`, `GET /api/customer-quotations/{id}/versions`, `POST /api/customer-quotations/{id}/reset` | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts` |
| `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | test | API "Báo giá khách hàng (BGKH/RC)" (phần chuyển trạng thái): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | RC-076..RC-080, RC-082, RC-087..RC-089, RC-091, RC-097..RC-100, RC-102, RC-108..RC-110, RC-112 | `POST /api/customer-quotations/{id}/confirm`, `GET /api/customer-quotations/{id}`, `POST /api/customer-quotations/{id}/reject`, `GET /api/internal-quotes/{id}`, `POST /api/customer-quotations/{id}/deactivate`, `GET /api/service-orders/selectable-customers` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/quan-ly-bao-gia/api/bgnb.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | test | API "Báo giá khách hàng (BGKH/RC)": dữ liệu vào sai, giá trị biên, xử lý lỗi | RC-008, RC-010, RC-015..RC-016, RC-018, RC-021, RC-024, RC-026, RC-028, RC-033..RC-034, RC-036, RC-044..RC-045, RC-047, RC-056..RC-057, RC-059, RC-065, RC-067, RC-072, RC-074, RC-083, RC-085, RC-092..RC-093, RC-095, RC-103..RC-104, RC-106, RC-113, RC-115, RC-120, RC-122, RC-125..RC-126, RC-128, RC-132, RC-134, RC-137, RC-139..RC-144 | `POST /api/quotation-requests/{id}/customer-quotation`, `GET /api/quotation-requests/{id}`, `GET /api/customer-quotations`, `GET /api/customer-quotations/statuses`, `GET /api/customer-quotations/{id}`, `PUT /api/customer-quotations/{id}/settings` (+12 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts` |
| `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | test | API "Báo giá khách hàng (BGKH/RC)": cấu trúc phản hồi so với schema Swagger | RC-009, RC-017, RC-020, RC-025, RC-035, RC-046, RC-058, RC-066, RC-073, RC-084, RC-094, RC-105, RC-114, RC-121, RC-127, RC-133, RC-138 | `POST /api/quotation-requests/{id}/customer-quotation`, `GET /api/customer-quotations`, `GET /api/customer-quotations/statuses`, `GET /api/customer-quotations/{id}`, `PUT /api/customer-quotations/{id}/settings`, `PUT /api/customer-quotations/{id}/prices` (+11 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/quan-ly-bao-gia/api/schemas/bgkh.schema.ts` |
| `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | test | API "Báo giá khách hàng (BGKH/RC)": gửi trùng, gửi đồng thời | RC-011, RC-060, RC-075, RC-086, RC-096, RC-107, RC-116 | `POST /api/quotation-requests/{id}/customer-quotation`, `GET /api/quotation-requests/{id}`, `POST /api/customer-quotations/{id}/merges`, `GET /api/customer-quotations/{id}`, `POST /api/customer-quotations/{id}/reset`, `POST /api/customer-quotations/{id}/confirm` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/quan-ly-bao-gia/api/ycbg.client.ts` |
| `tests/api/quan-ly-bao-gia/bgkh.integration.spec.ts` | test | API "Báo giá khách hàng (BGKH/RC)": tải lên/tải về file, tích hợp dịch vụ ngoài | RC-118 | `GET /api/customer-quotations/{id}/export` | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | ORD-001, ORD-011, ORD-025, ORD-027, ORD-036, ORD-044, ORD-055, ORD-063, ORD-074, ORD-084, ORD-095, ORD-103, ORD-115, ORD-124, ORD-131, ORD-140, ORD-146, ORD-154, ORD-160, ORD-166, ORD-174, ORD-182, ORD-188, ORD-194, ORD-200, ORD-207, ORD-214, ORD-220 | `GET /api/service-orders/selectable-customers`, `GET /api/service-orders/statuses`, `GET /api/service-orders`, `POST /api/service-orders`, `GET /api/service-orders/{id}`, `PUT /api/service-orders/{id}` (+22 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)" (phần phiếu): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | ORD-002..ORD-004, ORD-007, ORD-010, ORD-012..ORD-013, ORD-018..ORD-024, ORD-026, ORD-035, ORD-037, ORD-041..ORD-043, ORD-045, ORD-052..ORD-054, ORD-056, ORD-145, ORD-151, ORD-213, ORD-218..ORD-219, ORD-221 | `GET /api/service-orders/selectable-customers`, `GET /api/service-orders/statuses`, `GET /api/service-orders`, `POST /api/service-orders`, `GET /api/service-orders/{id}/revenue`, `GET /api/customer-quotations/{id}` (+7 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/quan-ly-bao-gia/api/bgkh.client.ts`, `src/thap-dieu-phoi/api/ngoai-le.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)" (phần chuyển trạng thái): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | ORD-060..ORD-062, ORD-064, ORD-069..ORD-073, ORD-075, ORD-081..ORD-083, ORD-085 | `POST /api/service-orders/{id}/submit`, `GET /api/service-orders/{id}`, `GET /api/notifications`, `POST /api/service-orders/{id}/cancel`, `POST /api/k3/service-orders/{id}/services/{type}/costs`, `POST /api/service-orders/{id}/restore` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/lich-su-thong-bao/api/ty-gia-thong-bao.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)" (phần doanh thu, xác nhận doanh thu): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | ORD-090..ORD-094, ORD-099..ORD-102, ORD-104, ORD-109..ORD-114, ORD-116, ORD-121..ORD-123, ORD-128..ORD-130, ORD-135..ORD-138, ORD-233 | `GET /api/service-orders/{id}/revenue`, `PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}`, `PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines`, `PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}`, `GET /api/k3/service-orders/{id}/services/{type}/costs`, `GET /api/service-orders/{id}/pnl` (+4 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)" (phần chứng từ và xe): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | ORD-152, ORD-158..ORD-159, ORD-161, ORD-165, ORD-170, ORD-173, ORD-175, ORD-180, ORD-186, ORD-192..ORD-193, ORD-195, ORD-199, ORD-204, ORD-206, ORD-208 | `GET /api/service-orders/{id}/documents/{documentId}`, `DELETE /api/service-orders/{id}/documents/{documentId}`, `GET /api/service-orders/{id}/services/{serviceTypeCode}/documents`, `POST /api/service-orders/{id}/services/{serviceTypeCode}/documents`, `GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}`, `GET /api/service-orders/{id}/vehicle-documents/{documentId}` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)": cấu trúc phản hồi so với schema Swagger | ORD-005, ORD-008, ORD-016, ORD-032, ORD-039, ORD-050, ORD-058, ORD-066, ORD-078, ORD-087, ORD-097, ORD-107, ORD-119, ORD-126, ORD-133, ORD-142, ORD-149, ORD-156, ORD-163, ORD-168, ORD-177, ORD-184, ORD-190, ORD-197, ORD-202, ORD-210, ORD-216, ORD-224 | `GET /api/service-orders/selectable-customers`, `GET /api/service-orders/statuses`, `GET /api/service-orders`, `POST /api/service-orders`, `GET /api/service-orders/{id}`, `PUT /api/service-orders/{id}` (+22 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/phieu-dich-vu/api/schemas/phieu-dich-vu.schema.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)" (phần phiếu): dữ liệu vào sai, giá trị biên, xử lý lỗi | ORD-006, ORD-009, ORD-014..ORD-015, ORD-017, ORD-028..ORD-031, ORD-033, ORD-038, ORD-040, ORD-046..ORD-049, ORD-051, ORD-057, ORD-059, ORD-147..ORD-148, ORD-150, ORD-215, ORD-217, ORD-222..ORD-223, ORD-225 | `GET /api/service-orders/selectable-customers`, `GET /api/service-orders/statuses`, `GET /api/service-orders`, `POST /api/service-orders`, `GET /api/service-orders/{id}`, `PUT /api/service-orders/{id}` (+4 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)" (phần chuyển trạng thái): dữ liệu vào sai, giá trị biên, xử lý lỗi | ORD-065, ORD-067, ORD-076..ORD-077, ORD-079, ORD-086, ORD-088, ORD-227..ORD-231 | `POST /api/service-orders/{id}/submit`, `GET /api/service-orders/{id}`, `POST /api/service-orders/{id}/cancel`, `POST /api/service-orders/{id}/restore` | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)" (phần doanh thu, xác nhận doanh thu): dữ liệu vào sai, giá trị biên, xử lý lỗi | ORD-096, ORD-098, ORD-105..ORD-106, ORD-108, ORD-117..ORD-118, ORD-120, ORD-125, ORD-127, ORD-132, ORD-134, ORD-141, ORD-143 | `GET /api/service-orders/{id}/revenue`, `PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}`, `PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines`, `GET /api/service-orders/{id}/cost-revenue-summary`, `GET /api/service-orders/{id}/revenue-confirmation`, `POST /api/service-orders/{id}/revenue-confirmation` | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)" (phần chứng từ và xe): dữ liệu vào sai, giá trị biên, xử lý lỗi | ORD-155, ORD-157, ORD-162, ORD-164, ORD-167, ORD-169, ORD-176, ORD-178, ORD-183, ORD-185, ORD-189, ORD-191, ORD-196, ORD-198, ORD-201, ORD-203, ORD-209, ORD-211 | `GET /api/service-orders/{id}/documents/{documentId}`, `DELETE /api/service-orders/{id}/documents/{documentId}`, `GET /api/service-orders/{id}/services/{serviceTypeCode}/documents`, `POST /api/service-orders/{id}/services/{serviceTypeCode}/documents`, `GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}`, `GET /api/service-orders/{id}/vehicle-documents/{documentId}` (+3 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)": gửi trùng, gửi đồng thời | ORD-034, ORD-068, ORD-080, ORD-089, ORD-139, ORD-144, ORD-179, ORD-212, ORD-226 | `POST /api/service-orders`, `GET /api/service-orders`, `POST /api/service-orders/{id}/submit`, `GET /api/service-orders/{id}`, `POST /api/service-orders/{id}/cancel`, `POST /api/service-orders/{id}/restore` (+8 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | test | API "Phiếu dịch vụ (Khối 1)": tải lên/tải về file, tích hợp dịch vụ ngoài | ORD-153, ORD-171..ORD-172, ORD-181, ORD-187, ORD-205, ORD-232 | `GET /api/service-orders/{id}/documents/{documentId}`, `POST /api/service-orders/{id}/services/{serviceTypeCode}/documents`, `GET /api/service-orders/{id}/services/{serviceTypeCode}/documents`, `GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}`, `GET /api/service-orders/{id}/vehicle-documents/{documentId}`, `POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` | test | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | PNL-001, PNL-008, PNL-015, PNL-028 | `GET /api/service-orders/{id}/pnl`, `GET /api/service-orders/{id}/pnl/export`, `GET /api/service-orders/{id}/pnl/fx-rate`, `PUT /api/service-orders/{id}/pnl/fx-rate` | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts` |
| `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | test | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | PNL-002..PNL-007, PNL-012, PNL-014, PNL-019, PNL-023..PNL-027, PNL-029 | `GET /api/service-orders/{id}/pnl`, `GET /api/service-orders/{id}/pnl/export`, `GET /api/service-orders/{id}/pnl/fx-rate`, `PUT /api/service-orders/{id}/pnl/fx-rate` | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts` |
| `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | test | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": dữ liệu vào sai, giá trị biên, xử lý lỗi | PNL-009, PNL-011, PNL-016, PNL-018, PNL-020, PNL-022, PNL-030..PNL-032, PNL-034 | `GET /api/service-orders/{id}/pnl`, `GET /api/service-orders/{id}/pnl/export`, `GET /api/service-orders/{id}/pnl/fx-rate`, `PUT /api/service-orders/{id}/pnl/fx-rate` | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts` |
| `tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` | test | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": cấu trúc phản hồi so với schema Swagger | PNL-010, PNL-017, PNL-021, PNL-033 | `GET /api/service-orders/{id}/pnl`, `GET /api/service-orders/{id}/pnl/export`, `GET /api/service-orders/{id}/pnl/fx-rate`, `PUT /api/service-orders/{id}/pnl/fx-rate` | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts`, `src/chi-phi-doanh-thu/api/schemas/pnl-phieu.schema.ts` |
| `tests/api/chi-phi-doanh-thu/pnl-phieu.integration.spec.ts` | test | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": tải lên/tải về file, tích hợp dịch vụ ngoài | PNL-013 | `GET /api/service-orders/{id}/pnl/export` | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts` |
| `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts` | test | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | CR-001, CR-007 | `GET /api/cost-revenue/orders`, `GET /api/cost-revenue/orders/stats`, `GET /api/cost-revenue/customer-options`, `GET /api/cost-revenue/creator-options`, `POST /api/cost-revenue/exports`, `GET /api/cost-revenue/exports/{id}` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/bao-cao-chi-phi-doanh-thu.client.ts` |
| `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | test | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | CR-002..CR-006, CR-012..CR-014, CR-018, CR-021, CR-024, CR-026..CR-027, CR-029..CR-030, CR-034, CR-040 | `GET /api/cost-revenue/orders`, `GET /api/cost-revenue/orders/stats`, `GET /api/cost-revenue/customer-options`, `GET /api/cost-revenue/creator-options`, `POST /api/cost-revenue/exports`, `GET /api/cost-revenue/exports/{id}` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/bao-cao-chi-phi-doanh-thu.client.ts` |
| `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | test | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": dữ liệu vào sai, giá trị biên, xử lý lỗi | CR-008..CR-009, CR-011, CR-015, CR-017, CR-020, CR-023, CR-032, CR-037, CR-039, CR-043, CR-045 | `GET /api/cost-revenue/orders`, `GET /api/cost-revenue/orders/stats`, `GET /api/cost-revenue/customer-options`, `GET /api/cost-revenue/creator-options`, `POST /api/cost-revenue/exports`, `GET /api/cost-revenue/exports/{id}` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/bao-cao-chi-phi-doanh-thu.client.ts` |
| `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | test | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": cấu trúc phản hồi so với schema Swagger | CR-010, CR-016, CR-019, CR-022, CR-031, CR-038, CR-044 | `GET /api/cost-revenue/orders`, `GET /api/cost-revenue/orders/stats`, `GET /api/cost-revenue/customer-options`, `GET /api/cost-revenue/creator-options`, `POST /api/cost-revenue/exports`, `GET /api/cost-revenue/exports/{id}` (+1 API) | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/bao-cao-chi-phi-doanh-thu.client.ts`, `src/chi-phi-doanh-thu/api/schemas/bao-cao-chi-phi-doanh-thu.schema.ts` |
| `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.integration.spec.ts` | test | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": tải lên/tải về file, tích hợp dịch vụ ngoài | CR-025 | `POST /api/cost-revenue/exports` | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/bao-cao-chi-phi-doanh-thu.client.ts` |
| `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.concurrency.spec.ts` | test | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": gửi trùng, gửi đồng thời | CR-033 | `POST /api/cost-revenue/exports` | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/api/bao-cao-chi-phi-doanh-thu.client.ts` |
| `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | test | API "Tháp điều phối — phiếu dịch vụ (CC)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | K3O-001, K3O-003, K3O-018, K3O-063, K3O-069 | `GET /api/k3/service-orders`, `GET /api/k3/service-orders/counts`, `GET /api/k3/service-orders/statuses`, `GET /api/k3/service-orders/{id}`, `POST /api/k3/service-orders/{id}/accept`, `POST /api/k3/service-orders/{id}/reject` (+5 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | test | API "Tháp điều phối — phiếu dịch vụ (CC)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | K3O-002, K3O-004..K3O-005, K3O-010..K3O-011, K3O-014, K3O-017, K3O-019, K3O-023..K3O-026, K3O-031..K3O-034, K3O-040, K3O-044..K3O-049, K3O-055, K3O-060..K3O-061, K3O-067 | `GET /api/k3/service-orders`, `GET /api/k3/service-orders/counts`, `GET /api/k3/service-orders/statuses`, `GET /api/k3/service-orders/{id}`, `POST /api/k3/service-orders/{id}/accept`, `PUT /api/service-orders/{id}` (+6 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | test | API "Tháp điều phối — phiếu dịch vụ (CC)": dữ liệu vào sai, giá trị biên, xử lý lỗi | K3O-006..K3O-007, K3O-009, K3O-013, K3O-016, K3O-020, K3O-022, K3O-027, K3O-029, K3O-035..K3O-036, K3O-038, K3O-041, K3O-043, K3O-050..K3O-051, K3O-053, K3O-056..K3O-057, K3O-059, K3O-064, K3O-066, K3O-070, K3O-072 | `GET /api/k3/service-orders`, `GET /api/k3/service-orders/counts`, `GET /api/k3/service-orders/statuses`, `GET /api/k3/service-orders/{id}`, `POST /api/k3/service-orders/{id}/accept`, `POST /api/k3/service-orders/{id}/reject` (+5 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | test | API "Tháp điều phối — phiếu dịch vụ (CC)": cấu trúc phản hồi so với schema Swagger | K3O-008, K3O-012, K3O-015, K3O-021, K3O-028, K3O-037, K3O-042, K3O-052, K3O-058, K3O-065, K3O-071 | `GET /api/k3/service-orders`, `GET /api/k3/service-orders/counts`, `GET /api/k3/service-orders/statuses`, `GET /api/k3/service-orders/{id}`, `POST /api/k3/service-orders/{id}/accept`, `POST /api/k3/service-orders/{id}/reject` (+5 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/thap-dieu-phoi/api/schemas/phieu-cc.schema.ts` |
| `tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts` | test | API "Tháp điều phối — phiếu dịch vụ (CC)": gửi trùng, gửi đồng thời | K3O-030, K3O-039, K3O-054 | `POST /api/k3/service-orders/{id}/accept`, `GET /api/k3/service-orders/{id}`, `POST /api/k3/service-orders/{id}/reject`, `POST /api/k3/service-orders/{id}/legs/confirm` | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts` | test | API "Tháp điều phối — phiếu dịch vụ (CC)": tải lên/tải về file, tích hợp dịch vụ ngoài | K3O-062, K3O-068 | `GET /api/k3/service-orders/{id}/documents/{documentId}`, `GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}` | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | test | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | K3S-001, K3S-004, K3S-014, K3S-029, K3S-037, K3S-043, K3S-048, K3S-057, K3S-070, K3S-080, K3S-089, K3S-095, K3S-111, K3S-113, K3S-127, K3S-135, K3S-143, K3S-151, K3S-157 | `GET /api/k3/service-orders/{id}/services/{type}/coordination-options`, `PUT /api/k3/service-orders/{id}/services/{type}/coordination`, `GET /api/k3/service-orders/{id}/services/{type}/contractors`, `POST /api/k3/service-orders/{id}/services/{type}/start`, `GET /api/k3/service-orders/{id}/services/{type}/costs`, `GET /api/k3/service-orders/{id}/services/{type}/cost-items` (+15 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | test | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)" (phần điều phối nhà thầu): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | K3S-002..K3S-003, K3S-008..K3S-013, K3S-015, K3S-019..K3S-020, K3S-024..K3S-028, K3S-030, K3S-066, K3S-085 | `GET /api/k3/service-orders/{id}/services/{type}/coordination-options`, `PUT /api/k3/service-orders/{id}/services/{type}/coordination`, `GET /api/k3/service-orders/{id}`, `GET /api/k3/service-orders/{id}/services/{type}/costs`, `POST /api/purchase-prices/{id}/items/approve`, `GET /api/service-orders/{id}/revenue` (+5 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/gia-mua-dau-vao/api/bang-gia-mua.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts` |
| `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | test | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)" (phần chi phí dịch vụ): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | K3S-035..K3S-036, K3S-041..K3S-042, K3S-047, K3S-052..K3S-056, K3S-058, K3S-067..K3S-069, K3S-071, K3S-077..K3S-078, K3S-081, K3S-086..K3S-088, K3S-173 | `GET /api/k3/service-orders/{id}/services/{type}/costs`, `GET /api/k3/service-orders/{id}/services/{type}/cost-items`, `GET /api/k3/service-orders/{id}/services/{type}/variance-items`, `POST /api/k3/service-orders/{id}/services/{type}/costs`, `GET /api/service-orders/{id}/revenue`, `GET /api/service-orders/{id}/pnl` (+4 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts` |
| `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | test | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)" (phần thông tin thực tế, hoàn thành, chứng từ): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | K3S-093..K3S-094, K3S-096, K3S-101, K3S-105..K3S-110, K3S-112, K3S-118, K3S-122..K3S-126, K3S-128, K3S-133..K3S-134, K3S-139, K3S-142, K3S-144, K3S-149, K3S-155..K3S-156, K3S-158, K3S-162..K3S-170 | `PUT /api/k3/service-orders/{id}/services/{type}/declaration`, `GET /api/k3/service-orders/{id}`, `GET /api/k3/service-orders/{id}/services/{type}/actuals`, `PUT /api/k3/service-orders/{id}/services/{type}/actuals`, `GET /api/k3/service-orders/{id}/services/{type}/completion-check`, `POST /api/k3/service-orders/{id}/services/{type}/complete` (+7 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/chi-phi-doanh-thu/api/pnl-phieu.client.ts`, `src/quan-tri-phan-quyen/api/vai-tro.client.ts` |
| `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | test | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": dữ liệu vào sai, giá trị biên, xử lý lỗi | K3S-005, K3S-007, K3S-016, K3S-018, K3S-021, K3S-023, K3S-031, K3S-033, K3S-038, K3S-040, K3S-044, K3S-046, K3S-049, K3S-051, K3S-059..K3S-062, K3S-064, K3S-072..K3S-074, K3S-076, K3S-082, K3S-084, K3S-090, K3S-092, K3S-097..K3S-098, K3S-100, K3S-102, K3S-104, K3S-114..K3S-115, K3S-117, K3S-119, K3S-121, K3S-129, K3S-131, K3S-136, K3S-138, K3S-145, K3S-147, K3S-152, K3S-154, K3S-159, K3S-161 | `GET /api/k3/service-orders/{id}/services/{type}/coordination-options`, `PUT /api/k3/service-orders/{id}/services/{type}/coordination`, `GET /api/k3/service-orders/{id}`, `GET /api/k3/service-orders/{id}/services/{type}/contractors`, `POST /api/k3/service-orders/{id}/services/{type}/start`, `GET /api/k3/service-orders/{id}/services/{type}/costs` (+15 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | test | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": cấu trúc phản hồi so với schema Swagger | K3S-006, K3S-017, K3S-022, K3S-032, K3S-039, K3S-045, K3S-050, K3S-063, K3S-075, K3S-083, K3S-091, K3S-099, K3S-103, K3S-116, K3S-120, K3S-130, K3S-137, K3S-146, K3S-153, K3S-160 | `GET /api/k3/service-orders/{id}/services/{type}/coordination-options`, `PUT /api/k3/service-orders/{id}/services/{type}/coordination`, `GET /api/k3/service-orders/{id}/services/{type}/contractors`, `POST /api/k3/service-orders/{id}/services/{type}/start`, `GET /api/k3/service-orders/{id}/services/{type}/costs`, `GET /api/k3/service-orders/{id}/services/{type}/cost-items` (+14 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/thap-dieu-phoi/api/schemas/dich-vu-con.schema.ts` |
| `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | test | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": gửi trùng, gửi đồng thời | K3S-034, K3S-065, K3S-132, K3S-148, K3S-171 | `POST /api/k3/service-orders/{id}/services/{type}/start`, `GET /api/k3/service-orders/{id}`, `POST /api/k3/service-orders/{id}/services/{type}/costs`, `GET /api/k3/service-orders/{id}/services/{type}/costs`, `POST /api/k3/service-orders/{id}/services/{type}/complete`, `POST /api/k3/service-orders/{id}/services/{type}/documents` (+2 API) | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` | test | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": tải lên/tải về file, tích hợp dịch vụ ngoài | K3S-140..K3S-141, K3S-150, K3S-172 | `POST /api/k3/service-orders/{id}/services/{type}/documents`, `GET /api/k3/service-orders/{id}/services/{type}/documents`, `GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}` | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/dich-vu-con.client.ts` |
| `tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts` | test | API "Tháp điều phối — thao tác ngoại lệ": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại | K3X-001, K3X-038, K3X-049 | `GET /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/vehicle-changes`, `GET /api/k3/service-orders/{id}` | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/ngoai-le.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | test | API "Tháp điều phối — thao tác ngoại lệ": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | K3X-032, K3X-036..K3X-037, K3X-039, K3X-046..K3X-048, K3X-050 | `GET /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/scope-requests`, `GET /api/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/vehicle-changes`, `GET /api/k3/service-orders/{id}` | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/ngoai-le.client.ts`, `src/phieu-dich-vu/api/phieu-dich-vu.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | test | API "Tháp điều phối — thao tác ngoại lệ": dữ liệu vào sai, giá trị biên, xử lý lỗi | K3X-033, K3X-035, K3X-040..K3X-042, K3X-044, K3X-051..K3X-053, K3X-055 | `GET /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/vehicle-changes`, `GET /api/k3/service-orders/{id}` | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/ngoai-le.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts` | test | API "Tháp điều phối — thao tác ngoại lệ": cấu trúc phản hồi so với schema Swagger | K3X-034, K3X-043, K3X-054 | `GET /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/vehicle-changes` | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/ngoai-le.client.ts`, `src/thap-dieu-phoi/api/schemas/ngoai-le.schema.ts` |
| `tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts` | test | API "Tháp điều phối — thao tác ngoại lệ": gửi trùng, gửi đồng thời | K3X-045, K3X-056 | `POST /api/k3/service-orders/{id}/scope-requests`, `GET /api/k3/service-orders/{id}/scope-requests`, `POST /api/k3/service-orders/{id}/vehicle-changes`, `GET /api/k3/service-orders/{id}` | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/api/ngoai-le.client.ts`, `src/thap-dieu-phoi/api/phieu-cc.client.ts` |
| `tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts` | test | Màn hình "Đăng nhập và phiên làm việc": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-LOGIN-001..UI-LOGIN-002, UI-LOGIN-005 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/pages/dang-nhap.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts` | test | Màn hình "Đăng nhập và phiên làm việc": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-LOGIN-003..UI-LOGIN-004, UI-LOGIN-011 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/pages/dang-nhap.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` | test | Màn hình "Đăng nhập và phiên làm việc": phân quyền giao diện và phiên | UI-LOGIN-006..UI-LOGIN-009 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/pages/dang-nhap.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-tri-phan-quyen/dang-nhap.a11y.spec.ts` | test | Màn hình "Đăng nhập và phiên làm việc": khả năng truy cập (axe) | UI-LOGIN-010 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/pages/dang-nhap.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | test | Màn hình "Phân quyền (Bộ phận, Vai trò, Người dùng)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-ADM-001..UI-ADM-003, UI-ADM-006..UI-ADM-008, UI-ADM-012..UI-ADM-014, UI-ADM-016 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/pages/phan-quyen.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | test | Màn hình "Phân quyền (Bộ phận, Vai trò, Người dùng)": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-ADM-004..UI-ADM-005, UI-ADM-009..UI-ADM-011, UI-ADM-015 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/pages/phan-quyen.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-tri-phan-quyen/phan-quyen.access.spec.ts` | test | Màn hình "Phân quyền (Bộ phận, Vai trò, Người dùng)": phân quyền giao diện và phiên | UI-ADM-017 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-tri-phan-quyen/pages/phan-quyen.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | test | Màn hình "Cấu hình chặng": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-LEG-001..UI-LEG-004, UI-LEG-007..UI-LEG-012, UI-LEG-014..UI-LEG-015, UI-LEG-017..UI-LEG-018 | - | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-chang/pages/cau-hinh-chang.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` | test | Màn hình "Cấu hình chặng": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-LEG-005..UI-LEG-006, UI-LEG-013, UI-LEG-016 | - | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-chang/pages/cau-hinh-chang.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | test | Màn hình "Cấu hình đầu mục giá": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-CFG-001..UI-CFG-008, UI-CFG-013 | - | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-dau-muc-gia/pages/dau-muc-gia.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | test | Màn hình "Cấu hình đầu mục giá": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-CFG-009..UI-CFG-012 | - | `src/core/fixtures/auth.fixture.ts`, `src/cau-hinh-dau-muc-gia/pages/dau-muc-gia.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | test | Màn hình "Giá mua đầu vào": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-BGM-001..UI-BGM-007, UI-BGM-009..UI-BGM-011, UI-BGM-013..UI-BGM-021 | - | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/pages/gia-mua-dau-vao.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts` | test | Màn hình "Giá mua đầu vào": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-BGM-008, UI-BGM-012, UI-BGM-022 | - | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dau-vao/pages/gia-mua-dau-vao.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | test | Màn hình "Giá mua định mức": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-SBP-001..UI-SBP-006, UI-SBP-009..UI-SBP-012, UI-SBP-014..UI-SBP-015 | - | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dinh-muc/pages/gia-mua-dinh-muc.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | test | Màn hình "Giá mua định mức": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-SBP-007..UI-SBP-008 | - | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dinh-muc/pages/gia-mua-dinh-muc.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.access.spec.ts` | test | Màn hình "Giá mua định mức": phân quyền giao diện và phiên | UI-SBP-013 | - | `src/core/fixtures/auth.fixture.ts`, `src/gia-mua-dinh-muc/pages/gia-mua-dinh-muc.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | test | Màn hình "Giá bán định mức": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-SSP-001..UI-SSP-002, UI-SSP-004..UI-SSP-007, UI-SSP-010 | - | `src/core/fixtures/auth.fixture.ts`, `src/gia-ban-dinh-muc/pages/gia-ban-dinh-muc.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | test | Màn hình "Giá bán định mức": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-SSP-003, UI-SSP-008..UI-SSP-009 | - | `src/core/fixtures/auth.fixture.ts`, `src/gia-ban-dinh-muc/pages/gia-ban-dinh-muc.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | test | Màn hình "Yêu cầu báo giá": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-RFQ-001, UI-RFQ-003..UI-RFQ-005, UI-RFQ-007..UI-RFQ-008, UI-RFQ-011..UI-RFQ-013, UI-RFQ-016 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/pages/ycbg.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-ly-bao-gia/ycbg.access.spec.ts` | test | Màn hình "Yêu cầu báo giá": phân quyền giao diện và phiên | UI-RFQ-002 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/pages/ycbg.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | test | Màn hình "Yêu cầu báo giá": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-RFQ-006, UI-RFQ-009..UI-RFQ-010, UI-RFQ-014..UI-RFQ-015 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/pages/ycbg.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | test | Màn hình "Báo giá nội bộ": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-IPS-001..UI-IPS-006, UI-IPS-009..UI-IPS-014 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/pages/bgnb.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts` | test | Màn hình "Báo giá nội bộ": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-IPS-007..UI-IPS-008 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/pages/bgnb.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | test | Màn hình "Báo giá khách hàng": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-RC-001..UI-RC-006, UI-RC-008..UI-RC-011, UI-RC-013..UI-RC-014 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/pages/bgkh.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` | test | Màn hình "Báo giá khách hàng": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-RC-007, UI-RC-012, UI-RC-015..UI-RC-016 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/pages/bgkh.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/quan-ly-bao-gia/bgkh.visual.spec.ts` | test | Màn hình "Báo giá khách hàng": so sánh ảnh giao diện | UI-RC-017 | - | `src/core/fixtures/auth.fixture.ts`, `src/quan-ly-bao-gia/pages/bgkh.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | test | Màn hình "Phiếu dịch vụ (Khối 1)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-ORD-001..UI-ORD-006, UI-ORD-008..UI-ORD-013, UI-ORD-017..UI-ORD-019 | - | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/pages/phieu-dich-vu.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` | test | Màn hình "Phiếu dịch vụ (Khối 1)": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-ORD-007, UI-ORD-014..UI-ORD-015, UI-ORD-020 | - | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/pages/phieu-dich-vu.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/phieu-dich-vu/phieu-dich-vu.access.spec.ts` | test | Màn hình "Phiếu dịch vụ (Khối 1)": phân quyền giao diện và phiên | UI-ORD-016 | - | `src/core/fixtures/auth.fixture.ts`, `src/phieu-dich-vu/pages/phieu-dich-vu.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | test | Màn hình "Tháp điều phối": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-K3-001..UI-K3-002, UI-K3-004..UI-K3-010, UI-K3-012 | - | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/pages/thap-dieu-phoi.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts` | test | Màn hình "Tháp điều phối": phân quyền giao diện và phiên | UI-K3-003, UI-K3-015 | - | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/pages/thap-dieu-phoi.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts` | test | Màn hình "Tháp điều phối": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-K3-011, UI-K3-014 | - | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/pages/thap-dieu-phoi.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/thap-dieu-phoi/thap-dieu-phoi.responsive.spec.ts` | test | Màn hình "Tháp điều phối": hiển thị trên tablet/di động | UI-K3-013 | - | `src/core/fixtures/auth.fixture.ts`, `src/thap-dieu-phoi/pages/thap-dieu-phoi.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | test | Màn hình "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-PNL-001..UI-PNL-003, UI-PNL-005..UI-PNL-007, UI-PNL-010..UI-PNL-013 | - | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/pages/chi-phi-doanh-thu.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` | test | Màn hình "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu": dữ liệu vào sai, giá trị biên, xử lý lỗi | UI-PNL-004, UI-PNL-008..UI-PNL-009, UI-PNL-015 | - | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/pages/chi-phi-doanh-thu.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.a11y.spec.ts` | test | Màn hình "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu": khả năng truy cập (axe) | UI-PNL-014 | - | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/pages/chi-phi-doanh-thu.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.access.spec.ts` | test | Màn hình "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu": phân quyền giao diện và phiên | UI-PNL-016 | - | `src/core/fixtures/auth.fixture.ts`, `src/chi-phi-doanh-thu/pages/chi-phi-doanh-thu.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts` | test | Màn hình "Thông báo trong hệ thống": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu | UI-NTF-001..UI-NTF-002 | - | `src/core/fixtures/auth.fixture.ts`, `src/lich-su-thong-bao/pages/thong-bao.page.ts`, `src/core/pages/components/data-table.component.ts` |
| `tests/ui/lich-su-thong-bao/thong-bao.visual.spec.ts` | test | Màn hình "Thông báo trong hệ thống": so sánh ảnh giao diện | UI-NTF-003 | - | `src/core/fixtures/auth.fixture.ts`, `src/lich-su-thong-bao/pages/thong-bao.page.ts`, `src/core/pages/components/data-table.component.ts` |

## 4. Ma trận case và file

Script tự dựng từ bộ case và mục 3, không sửa bằng tay.

| Case | Nhóm test | Mục | Ưu tiên | File chạy | Lệnh chạy |
| --- | --- | --- | --- | --- | --- |
| FLOW-ADM-001 | Flow/end-to-end API | Luồng API: Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì | P1 | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-001"` |
| FLOW-ADM-002 | Flow/end-to-end API | Luồng API: Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì | P1 | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-002"` |
| FLOW-ADM-003 | Flow/end-to-end API | Luồng API: Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì | P1 | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-003"` |
| FLOW-ADM-004 | Flow/end-to-end API | Luồng API: Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì | P2 | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-004"` |
| FLOW-ADM-005 | Flow/end-to-end API | Luồng API: Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì | P2 | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-005"` |
| FLOW-ADM-006 | Flow/end-to-end API | Luồng API: Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì | P2 | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-006"` |
| FLOW-ADM-007 | Flow/end-to-end API | Luồng API: Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì | P3 | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-007"` |
| FLOW-ADM-008 | Flow/end-to-end API | Luồng API: Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì | P1 | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-008"` |
| FLOW-ADM-009 | Flow/end-to-end API | Luồng API: Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì | P2 | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-009"` |
| FLOW-LEG-001 | Flow/end-to-end API | Luồng API: Cấu hình chặng → mô phỏng → xác nhận chặng trên phiếu | P1 | `tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts -g "FLOW-LEG-001"` |
| FLOW-LEG-002 | Flow/end-to-end API | Luồng API: Cấu hình chặng → mô phỏng → xác nhận chặng trên phiếu | P1 | `tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts -g "FLOW-LEG-002"` |
| FLOW-LEG-003 | Flow/end-to-end API | Luồng API: Cấu hình chặng → mô phỏng → xác nhận chặng trên phiếu | P1 | `tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts -g "FLOW-LEG-003"` |
| FLOW-LEG-004 | Flow/end-to-end API | Luồng API: Cấu hình chặng → mô phỏng → xác nhận chặng trên phiếu | P2 | `tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts -g "FLOW-LEG-004"` |
| FLOW-PRICE-001 | Flow/end-to-end API | Luồng API: Thiết lập giá: Đầu mục → Giá mua đầu vào → Giá mua định mức → Giá bán định mức | P1 | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-001"` |
| FLOW-PRICE-002 | Flow/end-to-end API | Luồng API: Thiết lập giá: Đầu mục → Giá mua đầu vào → Giá mua định mức → Giá bán định mức | P1 | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-002"` |
| FLOW-PRICE-003 | Flow/end-to-end API | Luồng API: Thiết lập giá: Đầu mục → Giá mua đầu vào → Giá mua định mức → Giá bán định mức | P1 | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-003"` |
| FLOW-PRICE-004 | Flow/end-to-end API | Luồng API: Thiết lập giá: Đầu mục → Giá mua đầu vào → Giá mua định mức → Giá bán định mức | P1 | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-004"` |
| FLOW-PRICE-005 | Flow/end-to-end API | Luồng API: Thiết lập giá: Đầu mục → Giá mua đầu vào → Giá mua định mức → Giá bán định mức | P1 | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-005"` |
| FLOW-PRICE-006 | Flow/end-to-end API | Luồng API: Thiết lập giá: Đầu mục → Giá mua đầu vào → Giá mua định mức → Giá bán định mức | P2 | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-006"` |
| FLOW-QUOTE-001 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P1 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-001"` |
| FLOW-QUOTE-002 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P1 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-002"` |
| FLOW-QUOTE-003 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P1 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-003"` |
| FLOW-QUOTE-004 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P1 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-004"` |
| FLOW-QUOTE-005 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P2 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-005"` |
| FLOW-QUOTE-006 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P2 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-006"` |
| FLOW-QUOTE-007 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P1 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-007"` |
| FLOW-QUOTE-008 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P2 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-008"` |
| FLOW-QUOTE-009 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P3 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-009"` |
| FLOW-QUOTE-010 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P1 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-010"` |
| FLOW-QUOTE-011 | Flow/end-to-end API | Luồng API: Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động) | P2 | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-011"` |
| FLOW-E2E-001 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-001"` |
| FLOW-E2E-002 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-002"` |
| FLOW-E2E-003 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-003"` |
| FLOW-E2E-004 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-004"` |
| FLOW-E2E-005 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-005"` |
| FLOW-E2E-006 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-006"` |
| FLOW-E2E-007 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-007"` |
| FLOW-E2E-008 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-008"` |
| FLOW-E2E-009 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-009"` |
| FLOW-E2E-010 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-010"` |
| FLOW-E2E-011 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-011"` |
| FLOW-E2E-012 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-012"` |
| FLOW-E2E-013 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-013"` |
| FLOW-E2E-014 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-014"` |
| FLOW-E2E-015 | Flow/end-to-end API | Luồng API: Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu | P1 | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-015"` |
| FLOW-REV-001 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-001"` |
| FLOW-REV-002 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-002"` |
| FLOW-REV-003 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-003"` |
| FLOW-REV-004 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-004"` |
| FLOW-REV-005 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-005"` |
| FLOW-REV-006 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-006"` |
| FLOW-REV-007 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P2 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-007"` |
| FLOW-REV-008 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-008"` |
| FLOW-REV-009 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P2 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-009"` |
| FLOW-REV-010 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P2 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-010"` |
| FLOW-REV-011 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-011"` |
| FLOW-REV-012 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-012"` |
| FLOW-REV-013 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P1 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-013"` |
| FLOW-REV-014 | Flow/end-to-end API | Luồng API: Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá | P2 | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-014"` |
| FLOW-CHG-BGM-001 | Flow/end-to-end API | Luồng API: Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu | P1 | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-001"` |
| FLOW-CHG-BGM-002 | Flow/end-to-end API | Luồng API: Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu | P1 | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-002"` |
| FLOW-CHG-BGM-003 | Flow/end-to-end API | Luồng API: Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu | P1 | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-003"` |
| FLOW-CHG-BGM-004 | Flow/end-to-end API | Luồng API: Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu | P1 | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-004"` |
| FLOW-CHG-BGM-005 | Flow/end-to-end API | Luồng API: Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu | P2 | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-005"` |
| FLOW-CHG-BGM-006 | Flow/end-to-end API | Luồng API: Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu | P2 | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-006"` |
| FLOW-CHG-BGM-007 | Flow/end-to-end API | Luồng API: Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu | P1 | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-007"` |
| FLOW-CHG-BGM-008 | Flow/end-to-end API | Luồng API: Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu | P2 | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-008"` |
| FLOW-CHG-SBP-001 | Flow/end-to-end API | Luồng API: Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu | P1 | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-001"` |
| FLOW-CHG-SBP-002 | Flow/end-to-end API | Luồng API: Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu | P1 | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-002"` |
| FLOW-CHG-SBP-003 | Flow/end-to-end API | Luồng API: Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu | P1 | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-003"` |
| FLOW-CHG-SBP-004 | Flow/end-to-end API | Luồng API: Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu | P1 | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-004"` |
| FLOW-CHG-SBP-005 | Flow/end-to-end API | Luồng API: Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu | P2 | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-005"` |
| FLOW-CHG-SBP-006 | Flow/end-to-end API | Luồng API: Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu | P2 | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-006"` |
| FLOW-CHG-SBP-007 | Flow/end-to-end API | Luồng API: Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu | P2 | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-007"` |
| FLOW-CHG-SSP-001 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P1 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-001"` |
| FLOW-CHG-SSP-002 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P1 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-002"` |
| FLOW-CHG-SSP-003 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P1 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-003"` |
| FLOW-CHG-SSP-004 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P1 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-004"` |
| FLOW-CHG-SSP-005 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P1 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-005"` |
| FLOW-CHG-SSP-006 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P1 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-006"` |
| FLOW-CHG-SSP-007 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P2 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-007"` |
| FLOW-CHG-SSP-008 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P1 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-008"` |
| FLOW-CHG-SSP-009 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P1 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-009"` |
| FLOW-CHG-SSP-010 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P2 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-010"` |
| FLOW-CHG-SSP-011 | Flow/end-to-end API | Luồng API: Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực | P2 | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-011"` |
| FLOW-DEACT-001 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-001"` |
| FLOW-DEACT-002 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-002"` |
| FLOW-DEACT-003 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-003"` |
| FLOW-DEACT-004 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-004"` |
| FLOW-DEACT-005 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-005"` |
| FLOW-DEACT-006 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-006"` |
| FLOW-DEACT-007 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-007"` |
| FLOW-DEACT-008 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-008"` |
| FLOW-DEACT-009 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-009"` |
| FLOW-DEACT-010 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P2 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-010"` |
| FLOW-DEACT-011 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-011"` |
| FLOW-DEACT-012 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-012"` |
| FLOW-DEACT-013 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P1 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-013"` |
| FLOW-DEACT-014 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P2 | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-014"` |
| FLOW-DEACT-015 | Flow/end-to-end API | Luồng API: Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt) | P3 | Thủ công | - |
| FLOW-MERGE-001 | Flow/end-to-end API | Luồng API: Gộp đầu mục trên BGKH và doanh thu phiếu dịch vụ | P1 | `tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts -g "FLOW-MERGE-001"` |
| FLOW-MERGE-002 | Flow/end-to-end API | Luồng API: Gộp đầu mục trên BGKH và doanh thu phiếu dịch vụ | P1 | `tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts -g "FLOW-MERGE-002"` |
| FLOW-MERGE-003 | Flow/end-to-end API | Luồng API: Gộp đầu mục trên BGKH và doanh thu phiếu dịch vụ | P2 | `tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts -g "FLOW-MERGE-003"` |
| FLOW-MERGE-004 | Flow/end-to-end API | Luồng API: Gộp đầu mục trên BGKH và doanh thu phiếu dịch vụ | P2 | `tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` | `npx playwright test tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts -g "FLOW-MERGE-004"` |
| FLOW-EXC-001 | Flow/end-to-end API | Luồng API: Ngoại lệ phiếu dịch vụ: từ chối, khôi phục, hủy, chi phí phát sinh do K3 tạo, đề xuất phạm vi, đổi xe | P1 | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-001"` |
| FLOW-EXC-002 | Flow/end-to-end API | Luồng API: Ngoại lệ phiếu dịch vụ: từ chối, khôi phục, hủy, chi phí phát sinh do K3 tạo, đề xuất phạm vi, đổi xe | P2 | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-002"` |
| FLOW-EXC-003 | Flow/end-to-end API | Luồng API: Ngoại lệ phiếu dịch vụ: từ chối, khôi phục, hủy, chi phí phát sinh do K3 tạo, đề xuất phạm vi, đổi xe | P1 | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-003"` |
| FLOW-EXC-005 | Flow/end-to-end API | Luồng API: Ngoại lệ phiếu dịch vụ: từ chối, khôi phục, hủy, chi phí phát sinh do K3 tạo, đề xuất phạm vi, đổi xe | P2 | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-005"` |
| FLOW-EXC-006 | Flow/end-to-end API | Luồng API: Ngoại lệ phiếu dịch vụ: từ chối, khôi phục, hủy, chi phí phát sinh do K3 tạo, đề xuất phạm vi, đổi xe | P3 | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-006"` |
| FLOW-EXC-007 | Flow/end-to-end API | Luồng API: Ngoại lệ phiếu dịch vụ: từ chối, khôi phục, hủy, chi phí phát sinh do K3 tạo, đề xuất phạm vi, đổi xe | P2 | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | `npx playwright test tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-007"` |
| FLOW-PNL-001 | Flow/end-to-end API | Luồng API: Tỷ giá, P&L và báo cáo Chi phí – Doanh thu nhất quán | P1 | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | `npx playwright test tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-001"` |
| FLOW-PNL-002 | Flow/end-to-end API | Luồng API: Tỷ giá, P&L và báo cáo Chi phí – Doanh thu nhất quán | P2 | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | `npx playwright test tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-002"` |
| FLOW-PNL-003 | Flow/end-to-end API | Luồng API: Tỷ giá, P&L và báo cáo Chi phí – Doanh thu nhất quán | P1 | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | `npx playwright test tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-003"` |
| FLOW-PNL-004 | Flow/end-to-end API | Luồng API: Tỷ giá, P&L và báo cáo Chi phí – Doanh thu nhất quán | P3 | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | `npx playwright test tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-004"` |
| FLOW-PNL-005 | Flow/end-to-end API | Luồng API: Tỷ giá, P&L và báo cáo Chi phí – Doanh thu nhất quán | P2 | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | `npx playwright test tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-005"` |
| FLOW-HIST-001 | Flow/end-to-end API | Luồng API: Lịch sử hoạt động và thông báo xuyên module | P1 | `tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` | `npx playwright test tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts -g "FLOW-HIST-001"` |
| FLOW-HIST-002 | Flow/end-to-end API | Luồng API: Lịch sử hoạt động và thông báo xuyên module | P1 | `tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` | `npx playwright test tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts -g "FLOW-HIST-002"` |
| FLOW-HIST-003 | Flow/end-to-end API | Luồng API: Lịch sử hoạt động và thông báo xuyên module | P2 | `tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` | `npx playwright test tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts -g "FLOW-HIST-003"` |
| FLOW-HIST-004 | Flow/end-to-end API | Luồng API: Lịch sử hoạt động và thông báo xuyên module | P2 | `tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` | `npx playwright test tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts -g "FLOW-HIST-004"` |
| FLOW-PERM-001 | Flow/end-to-end API | Luồng API: Phân quyền theo hành động (Xem / Cập nhật / Kích hoạt / Duyệt) | P1 | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-001"` |
| FLOW-PERM-002 | Flow/end-to-end API | Luồng API: Phân quyền theo hành động (Xem / Cập nhật / Kích hoạt / Duyệt) | P1 | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-002"` |
| FLOW-PERM-003 | Flow/end-to-end API | Luồng API: Phân quyền theo hành động (Xem / Cập nhật / Kích hoạt / Duyệt) | P1 | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-003"` |
| FLOW-PERM-004 | Flow/end-to-end API | Luồng API: Phân quyền theo hành động (Xem / Cập nhật / Kích hoạt / Duyệt) | P1 | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-004"` |
| FLOW-PERM-005 | Flow/end-to-end API | Luồng API: Phân quyền theo hành động (Xem / Cập nhật / Kích hoạt / Duyệt) | P1 | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-005"` |
| FLOW-PERM-006 | Flow/end-to-end API | Luồng API: Phân quyền theo hành động (Xem / Cập nhật / Kích hoạt / Duyệt) | P1 | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-006"` |
| FLOW-TEN-001 | Flow/end-to-end API | Luồng API: Cách ly tenant và tài nguyên con | P1 | `tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts -g "FLOW-TEN-001"` |
| FLOW-TEN-002 | Flow/end-to-end API | Luồng API: Cách ly tenant và tài nguyên con | P1 | `tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts -g "FLOW-TEN-002"` |
| FLOW-TEN-003 | Flow/end-to-end API | Luồng API: Cách ly tenant và tài nguyên con | P1 | `tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts` | `npx playwright test tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts -g "FLOW-TEN-003"` |
| AUTH-001 | Authentication | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts -g "AUTH-001"` |
| AUTH-002 | Happy path | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-002"` |
| AUTH-003 | Business rule | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-003"` |
| AUTH-004 | Business rule | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-004"` |
| AUTH-005 | Business rule | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-005"` |
| AUTH-006 | Business rule | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-006"` |
| AUTH-007 | Request validation | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-007"` |
| AUTH-008 | Input security | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts -g "AUTH-008"` |
| AUTH-009 | Concurrency | API: Xác thực và phiên đăng nhập | P3 | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-009"` |
| AUTH-010 | Boundary | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-010"` |
| AUTH-011 | Response contract | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-011"` |
| AUTH-012 | Error handling | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-012"` |
| AUTH-013 | Idempotency | API: Xác thực và phiên đăng nhập | P3 | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-013"` |
| AUTH-014 | Happy path | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-014"` |
| AUTH-015 | Business rule | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-015"` |
| AUTH-016 | Data integrity | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-016"` |
| AUTH-017 | Request validation | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-017"` |
| AUTH-018 | Boundary | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-018"` |
| AUTH-019 | Response contract | API: Xác thực và phiên đăng nhập | P3 | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-019"` |
| AUTH-020 | Error handling | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-020"` |
| AUTH-021 | Idempotency | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-021"` |
| AUTH-022 | Happy path | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-022"` |
| AUTH-023 | Business rule | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-023"` |
| AUTH-024 | Response contract | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-024"` |
| AUTH-025 | Error handling | API: Xác thực và phiên đăng nhập | P3 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-025"` |
| AUTH-026 | Happy path | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-026"` |
| AUTH-027 | Business rule | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-027"` |
| AUTH-028 | Business rule | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-028"` |
| AUTH-029 | Data integrity | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-029"` |
| AUTH-030 | Input security | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts -g "AUTH-030"` |
| AUTH-031 | Request validation | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-031"` |
| AUTH-032 | Boundary | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-032"` |
| AUTH-033 | Response contract | API: Xác thực và phiên đăng nhập | P3 | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-033"` |
| AUTH-034 | Error handling | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-034"` |
| AUTH-035 | Idempotency | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-035"` |
| AUTH-036 | Happy path | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-036"` |
| AUTH-037 | Business rule | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-037"` |
| AUTH-038 | Data integrity | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-038"` |
| AUTH-039 | Request validation | API: Xác thực và phiên đăng nhập | P1 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-039"` |
| AUTH-040 | Boundary | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-040"` |
| AUTH-041 | Response contract | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-041"` |
| AUTH-042 | Error handling | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-042"` |
| AUTH-043 | Idempotency | API: Xác thực và phiên đăng nhập | P2 | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-043"` |
| ADM-DEP-001 | Authentication | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-001"` |
| ADM-DEP-002 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-002"` |
| ADM-DEP-003 | Pagination/filter/sort | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-003"` |
| ADM-DEP-004 | Authorization | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-004"` |
| ADM-DEP-005 | Request validation | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-005"` |
| ADM-DEP-006 | Boundary | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-006"` |
| ADM-DEP-007 | Response contract | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-007"` |
| ADM-DEP-008 | Error handling | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-008"` |
| ADM-DEP-009 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-009"` |
| ADM-DEP-010 | Business rule | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-010"` |
| ADM-DEP-011 | Data integrity | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-011"` |
| ADM-DEP-012 | Authorization | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-012"` |
| ADM-DEP-013 | Input security | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-013"` |
| ADM-DEP-014 | Request validation | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-014"` |
| ADM-DEP-015 | Boundary | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-015"` |
| ADM-DEP-016 | Response contract | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-016"` |
| ADM-DEP-017 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-017"` |
| ADM-DEP-018 | Idempotency | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-018"` |
| ADM-DEP-019 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-019"` |
| ADM-DEP-020 | Request validation | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-020"` |
| ADM-DEP-021 | Response contract | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-021"` |
| ADM-DEP-022 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-022"` |
| ADM-DEP-023 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-023"` |
| ADM-DEP-024 | Business rule | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-024"` |
| ADM-DEP-025 | Data integrity | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-025"` |
| ADM-DEP-026 | Request validation | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-026"` |
| ADM-DEP-027 | Boundary | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-027"` |
| ADM-DEP-028 | Response contract | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-028"` |
| ADM-DEP-029 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-029"` |
| ADM-DEP-030 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-030"` |
| ADM-DEP-031 | CRUD | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-031"` |
| ADM-DEP-032 | Business rule | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-032"` |
| ADM-DEP-033 | Data integrity | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-033"` |
| ADM-DEP-034 | Request validation | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-034"` |
| ADM-DEP-035 | Response contract | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-035"` |
| ADM-DEP-036 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-036"` |
| ADM-DEP-037 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-037"` |
| ADM-DEP-038 | Business rule | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-038"` |
| ADM-DEP-039 | Data integrity | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-039"` |
| ADM-DEP-040 | Request validation | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-040"` |
| ADM-DEP-041 | Response contract | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-041"` |
| ADM-DEP-042 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-042"` |
| ADM-DEP-043 | Idempotency | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-043"` |
| ADM-DEP-044 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-044"` |
| ADM-DEP-045 | Business rule | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-045"` |
| ADM-DEP-046 | Data integrity | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-046"` |
| ADM-DEP-047 | Request validation | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-047"` |
| ADM-DEP-048 | Response contract | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-048"` |
| ADM-DEP-049 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-049"` |
| ADM-DEP-050 | Idempotency | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-050"` |
| ADM-DEP-051 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-051"` |
| ADM-DEP-052 | Business rule | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-052"` |
| ADM-DEP-053 | Data integrity | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-053"` |
| ADM-DEP-054 | Request validation | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-054"` |
| ADM-DEP-055 | Response contract | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-055"` |
| ADM-DEP-056 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-056"` |
| ADM-DEP-057 | Idempotency | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-057"` |
| ADM-DEP-058 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-058"` |
| ADM-DEP-059 | Ownership/IDOR | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-059"` |
| ADM-DEP-060 | Business rule | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-060"` |
| ADM-DEP-061 | Data integrity | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-061"` |
| ADM-DEP-062 | Request validation | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-062"` |
| ADM-DEP-063 | Response contract | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-063"` |
| ADM-DEP-064 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-064"` |
| ADM-DEP-065 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-065"` |
| ADM-DEP-066 | Business rule | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-066"` |
| ADM-DEP-067 | Data integrity | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-067"` |
| ADM-DEP-068 | Request validation | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-068"` |
| ADM-DEP-069 | Request validation | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-069"` |
| ADM-DEP-070 | Response contract | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-070"` |
| ADM-DEP-071 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-071"` |
| ADM-DEP-072 | Idempotency | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-072"` |
| ADM-DEP-073 | Happy path | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-073"` |
| ADM-DEP-074 | Ownership/IDOR | API: Quản trị bộ phận | P1 | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-074"` |
| ADM-DEP-075 | Business rule | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-075"` |
| ADM-DEP-076 | Data integrity | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-076"` |
| ADM-DEP-077 | Request validation | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-077"` |
| ADM-DEP-078 | Response contract | API: Quản trị bộ phận | P3 | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-078"` |
| ADM-DEP-079 | Error handling | API: Quản trị bộ phận | P2 | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-079"` |
| ADM-USR-001 | Authentication | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts -g "ADM-USR-001"` |
| ADM-USR-002 | Happy path | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-002"` |
| ADM-USR-003 | Pagination/filter/sort | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-003"` |
| ADM-USR-004 | Pagination/filter/sort | API: Quản trị người dùng | P3 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-004"` |
| ADM-USR-005 | Authorization | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts -g "ADM-USR-005"` |
| ADM-USR-006 | Request validation | API: Quản trị người dùng | P3 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-006"` |
| ADM-USR-007 | Boundary | API: Quản trị người dùng | P3 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-007"` |
| ADM-USR-008 | Response contract | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-008"` |
| ADM-USR-009 | Error handling | API: Quản trị người dùng | P3 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-009"` |
| ADM-USR-010 | Happy path | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-010"` |
| ADM-USR-011 | Business rule | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-011"` |
| ADM-USR-012 | Business rule | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-012"` |
| ADM-USR-013 | State transition | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-013"` |
| ADM-USR-014 | Data integrity | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-014"` |
| ADM-USR-015 | Input security | API: Quản trị người dùng | P3 | `tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts -g "ADM-USR-015"` |
| ADM-USR-016 | Request validation | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-016"` |
| ADM-USR-017 | Boundary | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-017"` |
| ADM-USR-018 | Response contract | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-018"` |
| ADM-USR-019 | Error handling | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-019"` |
| ADM-USR-020 | Idempotency | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts -g "ADM-USR-020"` |
| ADM-USR-021 | Happy path | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-021"` |
| ADM-USR-022 | Request validation | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-022"` |
| ADM-USR-023 | Response contract | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-023"` |
| ADM-USR-024 | Error handling | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-024"` |
| ADM-USR-025 | Happy path | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-025"` |
| ADM-USR-026 | Business rule | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-026"` |
| ADM-USR-027 | Business rule | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-027"` |
| ADM-USR-028 | Data integrity | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-028"` |
| ADM-USR-029 | Request validation | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-029"` |
| ADM-USR-030 | Boundary | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-030"` |
| ADM-USR-031 | Response contract | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-031"` |
| ADM-USR-032 | Error handling | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-032"` |
| ADM-USR-033 | Happy path | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-033"` |
| ADM-USR-034 | Business rule | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-034"` |
| ADM-USR-035 | Business rule | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-035"` |
| ADM-USR-036 | State transition | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-036"` |
| ADM-USR-037 | Data integrity | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-037"` |
| ADM-USR-038 | Request validation | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-038"` |
| ADM-USR-039 | Response contract | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-039"` |
| ADM-USR-040 | Error handling | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-040"` |
| ADM-USR-041 | Idempotency | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts -g "ADM-USR-041"` |
| ADM-USR-042 | Happy path | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-042"` |
| ADM-USR-043 | Business rule | API: Quản trị người dùng | P3 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-043"` |
| ADM-USR-044 | State transition | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-044"` |
| ADM-USR-045 | Data integrity | API: Quản trị người dùng | P3 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-045"` |
| ADM-USR-046 | Request validation | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-046"` |
| ADM-USR-047 | Response contract | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-047"` |
| ADM-USR-048 | Error handling | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-048"` |
| ADM-USR-049 | Idempotency | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts -g "ADM-USR-049"` |
| ADM-USR-050 | Happy path | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-050"` |
| ADM-USR-051 | Business rule | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-051"` |
| ADM-USR-052 | Data integrity | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-052"` |
| ADM-USR-053 | Request validation | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-053"` |
| ADM-USR-054 | Response contract | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-054"` |
| ADM-USR-055 | Error handling | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-055"` |
| ADM-USR-056 | Idempotency | API: Quản trị người dùng | P3 | `tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts -g "ADM-USR-056"` |
| ADM-USR-057 | Happy path | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-057"` |
| ADM-USR-058 | Request validation | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-058"` |
| ADM-USR-059 | Response contract | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-059"` |
| ADM-USR-060 | Error handling | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-060"` |
| ADM-USR-061 | Happy path | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-061"` |
| ADM-USR-062 | File API | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.integration.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.integration.spec.ts -g "ADM-USR-062"` |
| ADM-USR-063 | Business rule | API: Quản trị người dùng | P1 | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-063"` |
| ADM-USR-064 | Request validation | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-064"` |
| ADM-USR-065 | Response contract | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-065"` |
| ADM-USR-066 | Error handling | API: Quản trị người dùng | P2 | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-066"` |
| ADM-ROLE-001 | Authentication | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts -g "ADM-ROLE-001"` |
| ADM-ROLE-002 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-002"` |
| ADM-ROLE-003 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-003"` |
| ADM-ROLE-004 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-004"` |
| ADM-ROLE-005 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-005"` |
| ADM-ROLE-006 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-006"` |
| ADM-ROLE-007 | Pagination/filter/sort | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-007"` |
| ADM-ROLE-008 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-008"` |
| ADM-ROLE-009 | Boundary | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-009"` |
| ADM-ROLE-010 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-010"` |
| ADM-ROLE-011 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-011"` |
| ADM-ROLE-012 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-012"` |
| ADM-ROLE-013 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-013"` |
| ADM-ROLE-014 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-014"` |
| ADM-ROLE-015 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-015"` |
| ADM-ROLE-016 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-016"` |
| ADM-ROLE-017 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-017"` |
| ADM-ROLE-018 | Boundary | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-018"` |
| ADM-ROLE-019 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-019"` |
| ADM-ROLE-020 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-020"` |
| ADM-ROLE-021 | Idempotency | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-021"` |
| ADM-ROLE-022 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-022"` |
| ADM-ROLE-023 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-023"` |
| ADM-ROLE-024 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-024"` |
| ADM-ROLE-025 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-025"` |
| ADM-ROLE-026 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-026"` |
| ADM-ROLE-027 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-027"` |
| ADM-ROLE-028 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-028"` |
| ADM-ROLE-029 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-029"` |
| ADM-ROLE-030 | Boundary | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-030"` |
| ADM-ROLE-031 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-031"` |
| ADM-ROLE-032 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-032"` |
| ADM-ROLE-033 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-033"` |
| ADM-ROLE-034 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-034"` |
| ADM-ROLE-035 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-035"` |
| ADM-ROLE-036 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-036"` |
| ADM-ROLE-037 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-037"` |
| ADM-ROLE-038 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-038"` |
| ADM-ROLE-039 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-039"` |
| ADM-ROLE-040 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-040"` |
| ADM-ROLE-041 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-041"` |
| ADM-ROLE-042 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-042"` |
| ADM-ROLE-043 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-043"` |
| ADM-ROLE-044 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-044"` |
| ADM-ROLE-045 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-045"` |
| ADM-ROLE-046 | Idempotency | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-046"` |
| ADM-ROLE-047 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-047"` |
| ADM-ROLE-048 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-048"` |
| ADM-ROLE-049 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-049"` |
| ADM-ROLE-050 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-050"` |
| ADM-ROLE-051 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-051"` |
| ADM-ROLE-052 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-052"` |
| ADM-ROLE-053 | Idempotency | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-053"` |
| ADM-ROLE-054 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-054"` |
| ADM-ROLE-055 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-055"` |
| ADM-ROLE-056 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-056"` |
| ADM-ROLE-057 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-057"` |
| ADM-ROLE-058 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-058"` |
| ADM-ROLE-059 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-059"` |
| ADM-ROLE-060 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-060"` |
| ADM-ROLE-061 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-061"` |
| ADM-ROLE-062 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-062"` |
| ADM-ROLE-063 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-063"` |
| ADM-ROLE-064 | Idempotency | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-064"` |
| ADM-ROLE-065 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-065"` |
| ADM-ROLE-066 | Ownership/IDOR | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts -g "ADM-ROLE-066"` |
| ADM-ROLE-067 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-067"` |
| ADM-ROLE-068 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-068"` |
| ADM-ROLE-069 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-069"` |
| ADM-ROLE-070 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-070"` |
| ADM-ROLE-071 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-071"` |
| ADM-ROLE-072 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-072"` |
| ADM-ROLE-073 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-073"` |
| ADM-ROLE-074 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-074"` |
| ADM-ROLE-075 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-075"` |
| ADM-ROLE-076 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-076"` |
| ADM-ROLE-077 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-077"` |
| ADM-ROLE-078 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-078"` |
| ADM-ROLE-079 | Idempotency | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-079"` |
| ADM-ROLE-080 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-080"` |
| ADM-ROLE-081 | Ownership/IDOR | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts -g "ADM-ROLE-081"` |
| ADM-ROLE-082 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-082"` |
| ADM-ROLE-083 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-083"` |
| ADM-ROLE-084 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-084"` |
| ADM-ROLE-085 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-085"` |
| ADM-ROLE-086 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-086"` |
| ADM-ROLE-087 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-087"` |
| ADM-ROLE-088 | Pagination/filter/sort | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-088"` |
| ADM-ROLE-089 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-089"` |
| ADM-ROLE-090 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-090"` |
| ADM-ROLE-091 | Boundary | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-091"` |
| ADM-ROLE-092 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-092"` |
| ADM-ROLE-093 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-093"` |
| ADM-ROLE-094 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-094"` |
| ADM-ROLE-095 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-095"` |
| ADM-ROLE-096 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-096"` |
| ADM-ROLE-097 | Happy path | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-097"` |
| ADM-ROLE-098 | State transition | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-098"` |
| ADM-ROLE-099 | Business rule | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-099"` |
| ADM-ROLE-100 | Data integrity | API: Quản trị vai trò, nhật ký và thiết lập | P3 | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-100"` |
| ADM-ROLE-101 | Authorization | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts -g "ADM-ROLE-101"` |
| ADM-ROLE-102 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P1 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-102"` |
| ADM-ROLE-103 | Request validation | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-103"` |
| ADM-ROLE-104 | Response contract | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-104"` |
| ADM-ROLE-105 | Error handling | API: Quản trị vai trò, nhật ký và thiết lập | P2 | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-105"` |
| LEG-001 | Authentication | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts -g "LEG-001"` |
| LEG-002 | Happy path | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-002"` |
| LEG-003 | Pagination/filter/sort | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-003"` |
| LEG-004 | Pagination/filter/sort | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-004"` |
| LEG-005 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-005"` |
| LEG-006 | Boundary | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-006"` |
| LEG-007 | Response contract | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-007"` |
| LEG-008 | Error handling | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-008"` |
| LEG-009 | Happy path | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-009"` |
| LEG-010 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-010"` |
| LEG-011 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-011"` |
| LEG-012 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-012"` |
| LEG-013 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-013"` |
| LEG-014 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-014"` |
| LEG-015 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-015"` |
| LEG-016 | State transition | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-016"` |
| LEG-017 | Data integrity | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-017"` |
| LEG-018 | Input security | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts -g "LEG-018"` |
| LEG-019 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-019"` |
| LEG-020 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-020"` |
| LEG-021 | Boundary | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-021"` |
| LEG-022 | Response contract | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-022"` |
| LEG-023 | Error handling | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-023"` |
| LEG-024 | Idempotency | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts -g "LEG-024"` |
| LEG-025 | Happy path | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-025"` |
| LEG-026 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-026"` |
| LEG-027 | Response contract | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-027"` |
| LEG-028 | Error handling | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-028"` |
| LEG-029 | Happy path | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-029"` |
| LEG-030 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-030"` |
| LEG-031 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-031"` |
| LEG-032 | Data integrity | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-032"` |
| LEG-033 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-033"` |
| LEG-034 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-034"` |
| LEG-035 | Boundary | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-035"` |
| LEG-036 | Response contract | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-036"` |
| LEG-037 | Error handling | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-037"` |
| LEG-038 | Happy path | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-038"` |
| LEG-039 | CRUD | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-039"` |
| LEG-040 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-040"` |
| LEG-041 | Data integrity | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-041"` |
| LEG-042 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-042"` |
| LEG-043 | Response contract | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-043"` |
| LEG-044 | Error handling | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-044"` |
| LEG-045 | Happy path | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-045"` |
| LEG-046 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-046"` |
| LEG-047 | Boundary | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-047"` |
| LEG-048 | Response contract | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-048"` |
| LEG-049 | Error handling | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-049"` |
| LEG-050 | Pagination/filter/sort | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-050"` |
| LEG-051 | Happy path | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-051"` |
| LEG-052 | State transition | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-052"` |
| LEG-053 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-053"` |
| LEG-054 | Data integrity | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-054"` |
| LEG-055 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-055"` |
| LEG-056 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-056"` |
| LEG-057 | Response contract | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-057"` |
| LEG-058 | Error handling | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-058"` |
| LEG-059 | Idempotency | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts -g "LEG-059"` |
| LEG-060 | Happy path | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-060"` |
| LEG-061 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-061"` |
| LEG-062 | Business rule | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-062"` |
| LEG-063 | Data integrity | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-063"` |
| LEG-064 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P1 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-064"` |
| LEG-065 | Boundary | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-065"` |
| LEG-066 | Response contract | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-066"` |
| LEG-067 | Error handling | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-067"` |
| LEG-068 | Idempotency | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts -g "LEG-068"` |
| LEG-069 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-069"` |
| LEG-070 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-070"` |
| LEG-071 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-071"` |
| LEG-072 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P2 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-072"` |
| LEG-073 | Request validation | API: Cấu hình chặng (quy tắc chặng hành trình, mô phỏng) | P3 | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-073"` |
| CFG-001 | Authentication | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-001"` |
| CFG-002 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-002"` |
| CFG-003 | Authorization | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-003"` |
| CFG-004 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-004"` |
| CFG-005 | Error handling | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-005"` |
| CFG-006 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-006"` |
| CFG-007 | Business rule | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-007"` |
| CFG-008 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-008"` |
| CFG-009 | Error handling | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-009"` |
| CFG-010 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-010"` |
| CFG-011 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-011"` |
| CFG-012 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-012"` |
| CFG-013 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-013"` |
| CFG-014 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-014"` |
| CFG-015 | Business rule | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-015"` |
| CFG-016 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-016"` |
| CFG-017 | Boundary | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-017"` |
| CFG-018 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-018"` |
| CFG-019 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-019"` |
| CFG-020 | Pagination/filter/sort | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-020"` |
| CFG-021 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-021"` |
| CFG-022 | Business rule | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-022"` |
| CFG-023 | Business rule | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-023"` |
| CFG-024 | Business rule | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-024"` |
| CFG-025 | State transition | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-025"` |
| CFG-026 | Data integrity | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-026"` |
| CFG-027 | Request validation | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-027"` |
| CFG-028 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-028"` |
| CFG-029 | Boundary | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-029"` |
| CFG-030 | Boundary | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-030"` |
| CFG-031 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-031"` |
| CFG-032 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-032"` |
| CFG-033 | Idempotency | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts -g "CFG-033"` |
| CFG-034 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-034"` |
| CFG-035 | Business rule | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-035"` |
| CFG-036 | Business rule | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-036"` |
| CFG-037 | Business rule | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-037"` |
| CFG-038 | Business rule | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-038"` |
| CFG-039 | Business rule | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-039"` |
| CFG-040 | State transition | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-040"` |
| CFG-041 | Data integrity | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-041"` |
| CFG-042 | Concurrency | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts -g "CFG-042"` |
| CFG-043 | Request validation | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-043"` |
| CFG-044 | Boundary | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-044"` |
| CFG-045 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-045"` |
| CFG-046 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-046"` |
| CFG-047 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-047"` |
| CFG-048 | Business rule | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-048"` |
| CFG-049 | State transition | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-049"` |
| CFG-050 | Ownership/IDOR | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-050"` |
| CFG-051 | Data integrity | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-051"` |
| CFG-052 | Request validation | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-052"` |
| CFG-053 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-053"` |
| CFG-054 | Boundary | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-054"` |
| CFG-055 | Boundary | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-055"` |
| CFG-056 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-056"` |
| CFG-057 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-057"` |
| CFG-058 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-058"` |
| CFG-059 | CRUD | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-059"` |
| CFG-060 | Business rule | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-060"` |
| CFG-061 | Ownership/IDOR | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-061"` |
| CFG-062 | Data integrity | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-062"` |
| CFG-063 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-063"` |
| CFG-064 | Response contract | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-064"` |
| CFG-065 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-065"` |
| CFG-066 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-066"` |
| CFG-067 | Business rule | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-067"` |
| CFG-068 | Ownership/IDOR | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-068"` |
| CFG-069 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-069"` |
| CFG-070 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-070"` |
| CFG-071 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-071"` |
| CFG-072 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-072"` |
| CFG-073 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-073"` |
| CFG-074 | Boundary | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-074"` |
| CFG-075 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-075"` |
| CFG-076 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-076"` |
| CFG-077 | Pagination/filter/sort | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-077"` |
| CFG-078 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-078"` |
| CFG-079 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-079"` |
| CFG-080 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-080"` |
| CFG-081 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-081"` |
| CFG-082 | Happy path | API: Cấu hình đầu mục giá | P1 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-082"` |
| CFG-083 | Ownership/IDOR | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-083"` |
| CFG-084 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-084"` |
| CFG-085 | Response contract | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-085"` |
| CFG-086 | Error handling | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-086"` |
| CFG-087 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-087"` |
| CFG-088 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-088"` |
| CFG-089 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-089"` |
| CFG-090 | Request validation | API: Cấu hình đầu mục giá | P2 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-090"` |
| CFG-091 | Request validation | API: Cấu hình đầu mục giá | P3 | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-091"` |
| COM-001 | Authentication | API: Tỷ giá Vietcombank và thông báo | P1 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts -g "COM-001"` |
| COM-002 | Happy path | API: Tỷ giá Vietcombank và thông báo | P1 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-002"` |
| COM-003 | Business rule | API: Tỷ giá Vietcombank và thông báo | P3 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-003"` |
| COM-004 | Integration | API: Tỷ giá Vietcombank và thông báo | P2 | Thủ công | - |
| COM-005 | Request validation | API: Tỷ giá Vietcombank và thông báo | P2 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-005"` |
| COM-006 | Response contract | API: Tỷ giá Vietcombank và thông báo | P2 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts -g "COM-006"` |
| COM-007 | Error handling | API: Tỷ giá Vietcombank và thông báo | P2 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-007"` |
| COM-008 | Happy path | API: Tỷ giá Vietcombank và thông báo | P1 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-008"` |
| COM-009 | Pagination/filter/sort | API: Tỷ giá Vietcombank và thông báo | P3 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-009"` |
| COM-010 | Request validation | API: Tỷ giá Vietcombank và thông báo | P3 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-010"` |
| COM-011 | Response contract | API: Tỷ giá Vietcombank và thông báo | P2 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts -g "COM-011"` |
| COM-012 | Error handling | API: Tỷ giá Vietcombank và thông báo | P3 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-012"` |
| COM-013 | Happy path | API: Tỷ giá Vietcombank và thông báo | P1 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-013"` |
| COM-014 | Response contract | API: Tỷ giá Vietcombank và thông báo | P2 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts -g "COM-014"` |
| COM-015 | Error handling | API: Tỷ giá Vietcombank và thông báo | P3 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-015"` |
| COM-016 | Happy path | API: Tỷ giá Vietcombank và thông báo | P1 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-016"` |
| COM-017 | Ownership/IDOR | API: Tỷ giá Vietcombank và thông báo | P1 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts -g "COM-017"` |
| COM-018 | Business rule | API: Tỷ giá Vietcombank và thông báo | P3 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-018"` |
| COM-019 | Data integrity | API: Tỷ giá Vietcombank và thông báo | P3 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-019"` |
| COM-020 | Request validation | API: Tỷ giá Vietcombank và thông báo | P2 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-020"` |
| COM-021 | Response contract | API: Tỷ giá Vietcombank và thông báo | P3 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts -g "COM-021"` |
| COM-022 | Error handling | API: Tỷ giá Vietcombank và thông báo | P2 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-022"` |
| COM-023 | Idempotency | API: Tỷ giá Vietcombank và thông báo | P2 | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.concurrency.spec.ts` | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.concurrency.spec.ts -g "COM-023"` |
| BGM-001 | Authentication | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-001"` |
| BGM-002 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-002"` |
| BGM-003 | Pagination/filter/sort | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-003"` |
| BGM-004 | Authorization | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-004"` |
| BGM-005 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-005"` |
| BGM-006 | Boundary | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-006"` |
| BGM-007 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-007"` |
| BGM-008 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-008"` |
| BGM-009 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-009"` |
| BGM-010 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-010"` |
| BGM-011 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-011"` |
| BGM-012 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-012"` |
| BGM-013 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-013"` |
| BGM-014 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-014"` |
| BGM-015 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-015"` |
| BGM-016 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-016"` |
| BGM-017 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-017"` |
| BGM-018 | Boundary | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-018"` |
| BGM-019 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-019"` |
| BGM-020 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-020"` |
| BGM-021 | Idempotency | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-021"` |
| BGM-022 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-022"` |
| BGM-023 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-023"` |
| BGM-024 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-024"` |
| BGM-025 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-025"` |
| BGM-026 | Pagination/filter/sort | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-026"` |
| BGM-027 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-027"` |
| BGM-028 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-028"` |
| BGM-029 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-029"` |
| BGM-030 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-030"` |
| BGM-031 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-031"` |
| BGM-032 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-032"` |
| BGM-033 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-033"` |
| BGM-034 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-034"` |
| BGM-035 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-035"` |
| BGM-036 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-036"` |
| BGM-037 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-037"` |
| BGM-038 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-038"` |
| BGM-039 | Boundary | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-039"` |
| BGM-040 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-040"` |
| BGM-041 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-041"` |
| BGM-042 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-042"` |
| BGM-043 | CRUD | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-043"` |
| BGM-044 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-044"` |
| BGM-045 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-045"` |
| BGM-046 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-046"` |
| BGM-047 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-047"` |
| BGM-048 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-048"` |
| BGM-049 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-049"` |
| BGM-050 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-050"` |
| BGM-051 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-051"` |
| BGM-052 | State transition | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-052"` |
| BGM-053 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-053"` |
| BGM-054 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-054"` |
| BGM-055 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-055"` |
| BGM-056 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-056"` |
| BGM-057 | Idempotency | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-057"` |
| BGM-058 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-058"` |
| BGM-059 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-059"` |
| BGM-060 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-060"` |
| BGM-061 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-061"` |
| BGM-062 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-062"` |
| BGM-063 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-063"` |
| BGM-064 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-064"` |
| BGM-065 | State transition | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-065"` |
| BGM-066 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-066"` |
| BGM-067 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-067"` |
| BGM-068 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-068"` |
| BGM-069 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-069"` |
| BGM-070 | Idempotency | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-070"` |
| BGM-071 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-071"` |
| BGM-072 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-072"` |
| BGM-073 | Boundary | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-073"` |
| BGM-074 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-074"` |
| BGM-075 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-075"` |
| BGM-076 | Pagination/filter/sort | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-076"` |
| BGM-077 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-077"` |
| BGM-078 | Pagination/filter/sort | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-078"` |
| BGM-079 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-079"` |
| BGM-080 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-080"` |
| BGM-081 | Boundary | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-081"` |
| BGM-082 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-082"` |
| BGM-083 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-083"` |
| BGM-084 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-084"` |
| BGM-085 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-085"` |
| BGM-086 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-086"` |
| BGM-087 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-087"` |
| BGM-088 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-088"` |
| BGM-089 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-089"` |
| BGM-090 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-090"` |
| BGM-091 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-091"` |
| BGM-092 | Idempotency | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-092"` |
| BGM-093 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-093"` |
| BGM-094 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-094"` |
| BGM-095 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-095"` |
| BGM-096 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-096"` |
| BGM-097 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-097"` |
| BGM-098 | Concurrency | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-098"` |
| BGM-099 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-099"` |
| BGM-100 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-100"` |
| BGM-101 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-101"` |
| BGM-102 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-102"` |
| BGM-103 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-103"` |
| BGM-104 | Ownership/IDOR | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-104"` |
| BGM-105 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-105"` |
| BGM-106 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-106"` |
| BGM-107 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-107"` |
| BGM-108 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-108"` |
| BGM-109 | Idempotency | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-109"` |
| BGM-110 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-110"` |
| BGM-111 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-111"` |
| BGM-112 | Ownership/IDOR | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-112"` |
| BGM-113 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-113"` |
| BGM-114 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-114"` |
| BGM-115 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-115"` |
| BGM-116 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-116"` |
| BGM-117 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-117"` |
| BGM-118 | Business rule | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-118"` |
| BGM-119 | Ownership/IDOR | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-119"` |
| BGM-120 | Data integrity | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-120"` |
| BGM-121 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-121"` |
| BGM-122 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-122"` |
| BGM-123 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-123"` |
| BGM-124 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-124"` |
| BGM-125 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-125"` |
| BGM-126 | Boundary | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-126"` |
| BGM-127 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-127"` |
| BGM-128 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-128"` |
| BGM-129 | Pagination/filter/sort | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-129"` |
| BGM-130 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-130"` |
| BGM-131 | Ownership/IDOR | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-131"` |
| BGM-132 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-132"` |
| BGM-133 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-133"` |
| BGM-134 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-134"` |
| BGM-135 | Happy path | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-135"` |
| BGM-136 | Ownership/IDOR | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-136"` |
| BGM-137 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-137"` |
| BGM-138 | Boundary | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-138"` |
| BGM-139 | Response contract | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-139"` |
| BGM-140 | Error handling | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P2 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-140"` |
| BGM-141 | Pagination/filter/sort | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P3 | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-141"` |
| BGM-142 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-142"` |
| BGM-143 | Request validation | API: Giá mua đầu vào (bảng giá dịch vụ của nhà thầu) | P1 | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-143"` |
| SBP-001 | Authentication | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.security.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.security.spec.ts -g "SBP-001"` |
| SBP-002 | Happy path | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-002"` |
| SBP-003 | Pagination/filter/sort | API: Giá mua định mức (SBP) | P3 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-003"` |
| SBP-004 | Request validation | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-004"` |
| SBP-005 | Response contract | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-005"` |
| SBP-006 | Error handling | API: Giá mua định mức (SBP) | P3 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-006"` |
| SBP-007 | Happy path | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-007"` |
| SBP-008 | Pagination/filter/sort | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-008"` |
| SBP-009 | Business rule | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-009"` |
| SBP-010 | Request validation | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-010"` |
| SBP-011 | Boundary | API: Giá mua định mức (SBP) | P3 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-011"` |
| SBP-012 | Response contract | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-012"` |
| SBP-013 | Error handling | API: Giá mua định mức (SBP) | P3 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-013"` |
| SBP-014 | Happy path | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-014"` |
| SBP-015 | Request validation | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-015"` |
| SBP-016 | Response contract | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-016"` |
| SBP-017 | Error handling | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-017"` |
| SBP-018 | Happy path | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-018"` |
| SBP-019 | Boundary | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-019"` |
| SBP-020 | Business rule | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-020"` |
| SBP-021 | Business rule | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-021"` |
| SBP-022 | Business rule | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-022"` |
| SBP-023 | Business rule | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-023"` |
| SBP-024 | Data integrity | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-024"` |
| SBP-025 | Request validation | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-025"` |
| SBP-026 | Response contract | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-026"` |
| SBP-027 | Error handling | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-027"` |
| SBP-028 | Happy path | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-028"` |
| SBP-029 | Business rule | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-029"` |
| SBP-030 | Business rule | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-030"` |
| SBP-031 | Data integrity | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-031"` |
| SBP-032 | Request validation | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-032"` |
| SBP-033 | Boundary | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-033"` |
| SBP-034 | Response contract | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-034"` |
| SBP-035 | Error handling | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-035"` |
| SBP-036 | Happy path | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-036"` |
| SBP-037 | Request validation | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-037"` |
| SBP-038 | Response contract | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-038"` |
| SBP-039 | Error handling | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-039"` |
| SBP-040 | Happy path | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-040"` |
| SBP-041 | Business rule | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-041"` |
| SBP-042 | Data integrity | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-042"` |
| SBP-043 | Request validation | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-043"` |
| SBP-044 | Response contract | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-044"` |
| SBP-045 | Error handling | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-045"` |
| SBP-046 | Happy path | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-046"` |
| SBP-047 | Request validation | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-047"` |
| SBP-048 | Boundary | API: Giá mua định mức (SBP) | P3 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-048"` |
| SBP-049 | Response contract | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-049"` |
| SBP-050 | Error handling | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-050"` |
| SBP-051 | Pagination/filter/sort | API: Giá mua định mức (SBP) | P3 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-051"` |
| SBP-052 | Business rule | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-052"` |
| SBP-053 | Business rule | API: Giá mua định mức (SBP) | P1 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-053"` |
| SBP-054 | Business rule | API: Giá mua định mức (SBP) | P2 | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-054"` |
| SSP-001 | Authentication | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.security.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.security.spec.ts -g "SSP-001"` |
| SSP-002 | Happy path | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-002"` |
| SSP-003 | Request validation | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-003"` |
| SSP-004 | Response contract | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-004"` |
| SSP-005 | Error handling | API: Giá bán định mức (SSP) | P3 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-005"` |
| SSP-006 | Happy path | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-006"` |
| SSP-007 | Pagination/filter/sort | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-007"` |
| SSP-008 | Pagination/filter/sort | API: Giá bán định mức (SSP) | P3 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-008"` |
| SSP-009 | Request validation | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-009"` |
| SSP-010 | Boundary | API: Giá bán định mức (SSP) | P3 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-010"` |
| SSP-011 | Response contract | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-011"` |
| SSP-012 | Error handling | API: Giá bán định mức (SSP) | P3 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-012"` |
| SSP-013 | Happy path | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-013"` |
| SSP-014 | Request validation | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-014"` |
| SSP-015 | Response contract | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-015"` |
| SSP-016 | Error handling | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-016"` |
| SSP-017 | Happy path | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-017"` |
| SSP-018 | Business rule | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-018"` |
| SSP-019 | Business rule | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-019"` |
| SSP-020 | Business rule | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-020"` |
| SSP-021 | Business rule | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-021"` |
| SSP-022 | Business rule | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-022"` |
| SSP-023 | Data integrity | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-023"` |
| SSP-024 | Request validation | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-024"` |
| SSP-025 | Boundary | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-025"` |
| SSP-026 | Response contract | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-026"` |
| SSP-027 | Error handling | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-027"` |
| SSP-028 | Happy path | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-028"` |
| SSP-029 | Business rule | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-029"` |
| SSP-030 | Business rule | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-030"` |
| SSP-031 | Data integrity | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-031"` |
| SSP-032 | Request validation | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-032"` |
| SSP-033 | Boundary | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-033"` |
| SSP-034 | Response contract | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-034"` |
| SSP-035 | Error handling | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-035"` |
| SSP-036 | Happy path | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-036"` |
| SSP-037 | Business rule | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-037"` |
| SSP-038 | Data integrity | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-038"` |
| SSP-039 | Request validation | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-039"` |
| SSP-040 | Response contract | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-040"` |
| SSP-041 | Error handling | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-041"` |
| SSP-042 | Idempotency | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.concurrency.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.concurrency.spec.ts -g "SSP-042"` |
| SSP-043 | Happy path | API: Giá bán định mức (SSP) | P1 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-043"` |
| SSP-044 | Request validation | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-044"` |
| SSP-045 | Boundary | API: Giá bán định mức (SSP) | P3 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-045"` |
| SSP-046 | Response contract | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-046"` |
| SSP-047 | Error handling | API: Giá bán định mức (SSP) | P2 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-047"` |
| SSP-048 | Pagination/filter/sort | API: Giá bán định mức (SSP) | P3 | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-048"` |
| RFQ-001 | Authentication | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-001"` |
| RFQ-002 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-002"` |
| RFQ-003 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-003"` |
| RFQ-004 | Pagination/filter/sort | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-004"` |
| RFQ-005 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-005"` |
| RFQ-006 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-006"` |
| RFQ-007 | Boundary | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-007"` |
| RFQ-008 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-008"` |
| RFQ-009 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-009"` |
| RFQ-010 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-010"` |
| RFQ-011 | State transition | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-011"` |
| RFQ-012 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-012"` |
| RFQ-013 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-013"` |
| RFQ-014 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-014"` |
| RFQ-015 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-015"` |
| RFQ-016 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-016"` |
| RFQ-017 | Input security | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-017"` |
| RFQ-018 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-018"` |
| RFQ-019 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-019"` |
| RFQ-020 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-020"` |
| RFQ-021 | Boundary | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-021"` |
| RFQ-022 | Boundary | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-022"` |
| RFQ-023 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-023"` |
| RFQ-024 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-024"` |
| RFQ-025 | Idempotency | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-025"` |
| RFQ-026 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-026"` |
| RFQ-027 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-027"` |
| RFQ-028 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-028"` |
| RFQ-029 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-029"` |
| RFQ-030 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-030"` |
| RFQ-031 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-031"` |
| RFQ-032 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-032"` |
| RFQ-033 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-033"` |
| RFQ-034 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-034"` |
| RFQ-035 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-035"` |
| RFQ-036 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-036"` |
| RFQ-037 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-037"` |
| RFQ-038 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-038"` |
| RFQ-039 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-039"` |
| RFQ-040 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-040"` |
| RFQ-041 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-041"` |
| RFQ-042 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-042"` |
| RFQ-043 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-043"` |
| RFQ-044 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-044"` |
| RFQ-045 | Boundary | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-045"` |
| RFQ-046 | Boundary | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-046"` |
| RFQ-047 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-047"` |
| RFQ-048 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-048"` |
| RFQ-049 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-049"` |
| RFQ-050 | CRUD | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-050"` |
| RFQ-051 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-051"` |
| RFQ-052 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-052"` |
| RFQ-053 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-053"` |
| RFQ-054 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-054"` |
| RFQ-055 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-055"` |
| RFQ-056 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-056"` |
| RFQ-057 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-057"` |
| RFQ-058 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-058"` |
| RFQ-059 | State transition | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-059"` |
| RFQ-060 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-060"` |
| RFQ-061 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-061"` |
| RFQ-062 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-062"` |
| RFQ-063 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-063"` |
| RFQ-064 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-064"` |
| RFQ-065 | Idempotency | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-065"` |
| RFQ-066 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-066"` |
| RFQ-067 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-067"` |
| RFQ-068 | State transition | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-068"` |
| RFQ-069 | Concurrency | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-069"` |
| RFQ-070 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-070"` |
| RFQ-071 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-071"` |
| RFQ-072 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-072"` |
| RFQ-073 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-073"` |
| RFQ-074 | Idempotency | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-074"` |
| RFQ-075 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-075"` |
| RFQ-076 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-076"` |
| RFQ-077 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-077"` |
| RFQ-078 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-078"` |
| RFQ-079 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-079"` |
| RFQ-080 | State transition | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-080"` |
| RFQ-081 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-081"` |
| RFQ-082 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-082"` |
| RFQ-083 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-083"` |
| RFQ-084 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-084"` |
| RFQ-085 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-085"` |
| RFQ-086 | Idempotency | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-086"` |
| RFQ-087 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-087"` |
| RFQ-088 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-088"` |
| RFQ-089 | State transition | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-089"` |
| RFQ-090 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-090"` |
| RFQ-091 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-091"` |
| RFQ-092 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-092"` |
| RFQ-093 | Boundary | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-093"` |
| RFQ-094 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-094"` |
| RFQ-095 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-095"` |
| RFQ-096 | Idempotency | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-096"` |
| RFQ-097 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-097"` |
| RFQ-098 | File API | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-098"` |
| RFQ-099 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-099"` |
| RFQ-100 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-100"` |
| RFQ-101 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-101"` |
| RFQ-102 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-102"` |
| RFQ-103 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-103"` |
| RFQ-104 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-104"` |
| RFQ-105 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-105"` |
| RFQ-106 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-106"` |
| RFQ-107 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-107"` |
| RFQ-108 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-108"` |
| RFQ-109 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-109"` |
| RFQ-110 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-110"` |
| RFQ-111 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-111"` |
| RFQ-112 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-112"` |
| RFQ-113 | Boundary | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-113"` |
| RFQ-114 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-114"` |
| RFQ-115 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-115"` |
| RFQ-116 | Pagination/filter/sort | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-116"` |
| RFQ-117 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-117"` |
| RFQ-118 | State transition | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-118"` |
| RFQ-119 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-119"` |
| RFQ-120 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-120"` |
| RFQ-121 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-121"` |
| RFQ-122 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-122"` |
| RFQ-123 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-123"` |
| RFQ-124 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-124"` |
| RFQ-125 | Idempotency | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-125"` |
| RFQ-126 | Happy path | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-126"` |
| RFQ-127 | File API | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-127"` |
| RFQ-128 | File API | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-128"` |
| RFQ-129 | File API | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-129"` |
| RFQ-130 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-130"` |
| RFQ-131 | Ownership/IDOR | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-131"` |
| RFQ-132 | Data integrity | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-132"` |
| RFQ-133 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-133"` |
| RFQ-134 | Response contract | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-134"` |
| RFQ-135 | Error handling | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-135"` |
| RFQ-136 | Idempotency | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-136"` |
| RFQ-137 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-137"` |
| RFQ-138 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-138"` |
| RFQ-139 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-139"` |
| RFQ-140 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-140"` |
| RFQ-141 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-141"` |
| RFQ-142 | Business rule | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-142"` |
| RFQ-143 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-143"` |
| RFQ-144 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-144"` |
| RFQ-145 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-145"` |
| RFQ-146 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-146"` |
| RFQ-147 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P3 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-147"` |
| RFQ-148 | File API | API: Yêu cầu báo giá (YCBG/RFQ) | P1 | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-148"` |
| RFQ-149 | Request validation | API: Yêu cầu báo giá (YCBG/RFQ) | P2 | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-149"` |
| IPS-001 | Authentication | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-001"` |
| IPS-002 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-002"` |
| IPS-003 | Pagination/filter/sort | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-003"` |
| IPS-004 | Authorization | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-004"` |
| IPS-005 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-005"` |
| IPS-006 | Boundary | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-006"` |
| IPS-007 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-007"` |
| IPS-008 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-008"` |
| IPS-009 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-009"` |
| IPS-010 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-010"` |
| IPS-011 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-011"` |
| IPS-012 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-012"` |
| IPS-013 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-013"` |
| IPS-014 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-014"` |
| IPS-015 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-015"` |
| IPS-016 | Ownership/IDOR | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-016"` |
| IPS-017 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-017"` |
| IPS-018 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-018"` |
| IPS-019 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-019"` |
| IPS-020 | Boundary | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-020"` |
| IPS-021 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-021"` |
| IPS-022 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-022"` |
| IPS-023 | Idempotency | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-023"` |
| IPS-024 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-024"` |
| IPS-025 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-025"` |
| IPS-026 | Pagination/filter/sort | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-026"` |
| IPS-027 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-027"` |
| IPS-028 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-028"` |
| IPS-029 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-029"` |
| IPS-030 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-030"` |
| IPS-031 | Pagination/filter/sort | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-031"` |
| IPS-032 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-032"` |
| IPS-033 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-033"` |
| IPS-034 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-034"` |
| IPS-035 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-035"` |
| IPS-036 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-036"` |
| IPS-037 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-037"` |
| IPS-038 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-038"` |
| IPS-039 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-039"` |
| IPS-040 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-040"` |
| IPS-041 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-041"` |
| IPS-042 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-042"` |
| IPS-043 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-043"` |
| IPS-044 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-044"` |
| IPS-045 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-045"` |
| IPS-046 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-046"` |
| IPS-047 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-047"` |
| IPS-048 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-048"` |
| IPS-049 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-049"` |
| IPS-050 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-050"` |
| IPS-051 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-051"` |
| IPS-052 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-052"` |
| IPS-053 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-053"` |
| IPS-054 | Boundary | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-054"` |
| IPS-055 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-055"` |
| IPS-056 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-056"` |
| IPS-057 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-057"` |
| IPS-058 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-058"` |
| IPS-059 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-059"` |
| IPS-060 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-060"` |
| IPS-061 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-061"` |
| IPS-062 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-062"` |
| IPS-063 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-063"` |
| IPS-064 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-064"` |
| IPS-065 | Boundary | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-065"` |
| IPS-066 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-066"` |
| IPS-067 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-067"` |
| IPS-068 | Pagination/filter/sort | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-068"` |
| IPS-069 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-069"` |
| IPS-070 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-070"` |
| IPS-071 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-071"` |
| IPS-072 | State transition | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-072"` |
| IPS-073 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-073"` |
| IPS-074 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-074"` |
| IPS-075 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-075"` |
| IPS-076 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-076"` |
| IPS-077 | Idempotency | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-077"` |
| IPS-078 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-078"` |
| IPS-079 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-079"` |
| IPS-080 | State transition | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-080"` |
| IPS-081 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-081"` |
| IPS-082 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-082"` |
| IPS-083 | Boundary | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-083"` |
| IPS-084 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-084"` |
| IPS-085 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-085"` |
| IPS-086 | Idempotency | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-086"` |
| IPS-087 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-087"` |
| IPS-088 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-088"` |
| IPS-089 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-089"` |
| IPS-090 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-090"` |
| IPS-091 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-091"` |
| IPS-092 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-092"` |
| IPS-093 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-093"` |
| IPS-094 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-094"` |
| IPS-095 | Idempotency | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-095"` |
| IPS-096 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-096"` |
| IPS-097 | Ownership/IDOR | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-097"` |
| IPS-098 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-098"` |
| IPS-099 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-099"` |
| IPS-100 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-100"` |
| IPS-101 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-101"` |
| IPS-102 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-102"` |
| IPS-103 | Ownership/IDOR | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-103"` |
| IPS-104 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-104"` |
| IPS-105 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-105"` |
| IPS-106 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-106"` |
| IPS-107 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-107"` |
| IPS-108 | Idempotency | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-108"` |
| IPS-109 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-109"` |
| IPS-110 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-110"` |
| IPS-111 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-111"` |
| IPS-112 | Ownership/IDOR | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-112"` |
| IPS-113 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-113"` |
| IPS-114 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-114"` |
| IPS-115 | Boundary | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-115"` |
| IPS-116 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-116"` |
| IPS-117 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-117"` |
| IPS-118 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-118"` |
| IPS-119 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-119"` |
| IPS-120 | State transition | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-120"` |
| IPS-121 | Ownership/IDOR | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-121"` |
| IPS-122 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-122"` |
| IPS-123 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-123"` |
| IPS-124 | Boundary | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-124"` |
| IPS-125 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-125"` |
| IPS-126 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-126"` |
| IPS-127 | Idempotency | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-127"` |
| IPS-128 | Happy path | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-128"` |
| IPS-129 | Business rule | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-129"` |
| IPS-130 | State transition | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P1 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-130"` |
| IPS-131 | Ownership/IDOR | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-131"` |
| IPS-132 | Data integrity | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P3 | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-132"` |
| IPS-133 | Request validation | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-133"` |
| IPS-134 | Response contract | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-134"` |
| IPS-135 | Error handling | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-135"` |
| IPS-136 | Idempotency | API: Báo giá nội bộ (BGNB) và lập báo giá theo YCBG | P2 | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-136"` |
| RC-001 | Authentication | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-001"` |
| RC-002 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-002"` |
| RC-003 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-003"` |
| RC-004 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-004"` |
| RC-005 | State transition | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-005"` |
| RC-006 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-006"` |
| RC-007 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-007"` |
| RC-008 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-008"` |
| RC-009 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-009"` |
| RC-010 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-010"` |
| RC-011 | Idempotency | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-011"` |
| RC-012 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-012"` |
| RC-013 | Pagination/filter/sort | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-013"` |
| RC-014 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-014"` |
| RC-015 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-015"` |
| RC-016 | Boundary | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-016"` |
| RC-017 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-017"` |
| RC-018 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-018"` |
| RC-019 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-019"` |
| RC-020 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-020"` |
| RC-021 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-021"` |
| RC-022 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-022"` |
| RC-023 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-023"` |
| RC-024 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-024"` |
| RC-025 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-025"` |
| RC-026 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-026"` |
| RC-027 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-027"` |
| RC-028 | Boundary | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-028"` |
| RC-029 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-029"` |
| RC-030 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-030"` |
| RC-031 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-031"` |
| RC-032 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-032"` |
| RC-033 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-033"` |
| RC-034 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-034"` |
| RC-035 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-035"` |
| RC-036 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-036"` |
| RC-037 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-037"` |
| RC-038 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-038"` |
| RC-039 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-039"` |
| RC-040 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-040"` |
| RC-041 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-041"` |
| RC-042 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-042"` |
| RC-043 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-043"` |
| RC-044 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-044"` |
| RC-045 | Boundary | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-045"` |
| RC-046 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-046"` |
| RC-047 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-047"` |
| RC-048 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-048"` |
| RC-049 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-049"` |
| RC-050 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-050"` |
| RC-051 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-051"` |
| RC-052 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-052"` |
| RC-053 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-053"` |
| RC-054 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-054"` |
| RC-055 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-055"` |
| RC-056 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-056"` |
| RC-057 | Boundary | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-057"` |
| RC-058 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-058"` |
| RC-059 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-059"` |
| RC-060 | Idempotency | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-060"` |
| RC-061 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-061"` |
| RC-062 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-062"` |
| RC-063 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-063"` |
| RC-064 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-064"` |
| RC-065 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-065"` |
| RC-066 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-066"` |
| RC-067 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-067"` |
| RC-068 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-068"` |
| RC-069 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-069"` |
| RC-070 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-070"` |
| RC-071 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-071"` |
| RC-072 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-072"` |
| RC-073 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-073"` |
| RC-074 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-074"` |
| RC-075 | Idempotency | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-075"` |
| RC-076 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-076"` |
| RC-077 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-077"` |
| RC-078 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-078"` |
| RC-079 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-079"` |
| RC-080 | State transition | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-080"` |
| RC-081 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-081"` |
| RC-082 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-082"` |
| RC-083 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-083"` |
| RC-084 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-084"` |
| RC-085 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-085"` |
| RC-086 | Idempotency | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-086"` |
| RC-087 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-087"` |
| RC-088 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-088"` |
| RC-089 | State transition | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-089"` |
| RC-090 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-090"` |
| RC-091 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-091"` |
| RC-092 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-092"` |
| RC-093 | Boundary | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-093"` |
| RC-094 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-094"` |
| RC-095 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-095"` |
| RC-096 | Idempotency | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-096"` |
| RC-097 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-097"` |
| RC-098 | State transition | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-098"` |
| RC-099 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-099"` |
| RC-100 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-100"` |
| RC-101 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-101"` |
| RC-102 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-102"` |
| RC-103 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-103"` |
| RC-104 | Boundary | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-104"` |
| RC-105 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-105"` |
| RC-106 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-106"` |
| RC-107 | Idempotency | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-107"` |
| RC-108 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-108"` |
| RC-109 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-109"` |
| RC-110 | Business rule | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-110"` |
| RC-111 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-111"` |
| RC-112 | Data integrity | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-112"` |
| RC-113 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-113"` |
| RC-114 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-114"` |
| RC-115 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-115"` |
| RC-116 | Idempotency | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-116"` |
| RC-117 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-117"` |
| RC-118 | File API | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.integration.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.integration.spec.ts -g "RC-118"` |
| RC-119 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-119"` |
| RC-120 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-120"` |
| RC-121 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-121"` |
| RC-122 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-122"` |
| RC-123 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-123"` |
| RC-124 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-124"` |
| RC-125 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-125"` |
| RC-126 | Boundary | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-126"` |
| RC-127 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-127"` |
| RC-128 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-128"` |
| RC-129 | Pagination/filter/sort | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-129"` |
| RC-130 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-130"` |
| RC-131 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-131"` |
| RC-132 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-132"` |
| RC-133 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-133"` |
| RC-134 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-134"` |
| RC-135 | Happy path | API: Báo giá khách hàng (BGKH/RC) | P1 | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-135"` |
| RC-136 | Ownership/IDOR | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-136"` |
| RC-137 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-137"` |
| RC-138 | Response contract | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-138"` |
| RC-139 | Error handling | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-139"` |
| RC-140 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-140"` |
| RC-141 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-141"` |
| RC-142 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-142"` |
| RC-143 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P2 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-143"` |
| RC-144 | Request validation | API: Báo giá khách hàng (BGKH/RC) | P3 | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-144"` |
| ORD-001 | Authentication | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-001"` |
| ORD-002 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-002"` |
| ORD-003 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-003"` |
| ORD-004 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-004"` |
| ORD-005 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-005"` |
| ORD-006 | Error handling | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-006"` |
| ORD-007 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-007"` |
| ORD-008 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-008"` |
| ORD-009 | Error handling | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-009"` |
| ORD-010 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-010"` |
| ORD-011 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-011"` |
| ORD-012 | Pagination/filter/sort | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-012"` |
| ORD-013 | Pagination/filter/sort | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-013"` |
| ORD-014 | Request validation | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-014"` |
| ORD-015 | Boundary | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-015"` |
| ORD-016 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-016"` |
| ORD-017 | Error handling | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-017"` |
| ORD-018 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-018"` |
| ORD-019 | State transition | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-019"` |
| ORD-020 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-020"` |
| ORD-021 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-021"` |
| ORD-022 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-022"` |
| ORD-023 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-023"` |
| ORD-024 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-024"` |
| ORD-025 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-025"` |
| ORD-026 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-026"` |
| ORD-027 | Input security | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-027"` |
| ORD-028 | Request validation | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-028"` |
| ORD-029 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-029"` |
| ORD-030 | Boundary | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-030"` |
| ORD-031 | Boundary | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-031"` |
| ORD-032 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-032"` |
| ORD-033 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-033"` |
| ORD-034 | Idempotency | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-034"` |
| ORD-035 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-035"` |
| ORD-036 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-036"` |
| ORD-037 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-037"` |
| ORD-038 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-038"` |
| ORD-039 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-039"` |
| ORD-040 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-040"` |
| ORD-041 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-041"` |
| ORD-042 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-042"` |
| ORD-043 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-043"` |
| ORD-044 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-044"` |
| ORD-045 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-045"` |
| ORD-046 | Request validation | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-046"` |
| ORD-047 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-047"` |
| ORD-048 | Boundary | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-048"` |
| ORD-049 | Boundary | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-049"` |
| ORD-050 | Response contract | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-050"` |
| ORD-051 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-051"` |
| ORD-052 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-052"` |
| ORD-053 | CRUD | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-053"` |
| ORD-054 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-054"` |
| ORD-055 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-055"` |
| ORD-056 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-056"` |
| ORD-057 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-057"` |
| ORD-058 | Response contract | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-058"` |
| ORD-059 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-059"` |
| ORD-060 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-060"` |
| ORD-061 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-061"` |
| ORD-062 | State transition | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-062"` |
| ORD-063 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-063"` |
| ORD-064 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-064"` |
| ORD-065 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-065"` |
| ORD-066 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-066"` |
| ORD-067 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-067"` |
| ORD-068 | Idempotency | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-068"` |
| ORD-069 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-069"` |
| ORD-070 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-070"` |
| ORD-071 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-071"` |
| ORD-072 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-072"` |
| ORD-073 | State transition | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-073"` |
| ORD-074 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-074"` |
| ORD-075 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-075"` |
| ORD-076 | Request validation | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-076"` |
| ORD-077 | Boundary | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-077"` |
| ORD-078 | Response contract | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-078"` |
| ORD-079 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-079"` |
| ORD-080 | Idempotency | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-080"` |
| ORD-081 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-081"` |
| ORD-082 | State transition | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-082"` |
| ORD-083 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-083"` |
| ORD-084 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-084"` |
| ORD-085 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-085"` |
| ORD-086 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-086"` |
| ORD-087 | Response contract | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-087"` |
| ORD-088 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-088"` |
| ORD-089 | Idempotency | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-089"` |
| ORD-090 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-090"` |
| ORD-091 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-091"` |
| ORD-092 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-092"` |
| ORD-093 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-093"` |
| ORD-094 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-094"` |
| ORD-095 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-095"` |
| ORD-096 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-096"` |
| ORD-097 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-097"` |
| ORD-098 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-098"` |
| ORD-099 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-099"` |
| ORD-100 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-100"` |
| ORD-101 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-101"` |
| ORD-102 | Business rule | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-102"` |
| ORD-103 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-103"` |
| ORD-104 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-104"` |
| ORD-105 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-105"` |
| ORD-106 | Boundary | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-106"` |
| ORD-107 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-107"` |
| ORD-108 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-108"` |
| ORD-109 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-109"` |
| ORD-110 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-110"` |
| ORD-111 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-111"` |
| ORD-112 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-112"` |
| ORD-113 | State transition | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-113"` |
| ORD-114 | State transition | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-114"` |
| ORD-115 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-115"` |
| ORD-116 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-116"` |
| ORD-117 | Request validation | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-117"` |
| ORD-118 | Boundary | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-118"` |
| ORD-119 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-119"` |
| ORD-120 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-120"` |
| ORD-121 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-121"` |
| ORD-122 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-122"` |
| ORD-123 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-123"` |
| ORD-124 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-124"` |
| ORD-125 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-125"` |
| ORD-126 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-126"` |
| ORD-127 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-127"` |
| ORD-128 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-128"` |
| ORD-129 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-129"` |
| ORD-130 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-130"` |
| ORD-131 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-131"` |
| ORD-132 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-132"` |
| ORD-133 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-133"` |
| ORD-134 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-134"` |
| ORD-135 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-135"` |
| ORD-136 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-136"` |
| ORD-137 | State transition | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-137"` |
| ORD-138 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-138"` |
| ORD-139 | Concurrency | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-139"` |
| ORD-140 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-140"` |
| ORD-141 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-141"` |
| ORD-142 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-142"` |
| ORD-143 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-143"` |
| ORD-144 | Idempotency | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-144"` |
| ORD-145 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-145"` |
| ORD-146 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-146"` |
| ORD-147 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-147"` |
| ORD-148 | Boundary | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-148"` |
| ORD-149 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-149"` |
| ORD-150 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-150"` |
| ORD-151 | Pagination/filter/sort | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-151"` |
| ORD-152 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-152"` |
| ORD-153 | File API | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-153"` |
| ORD-154 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-154"` |
| ORD-155 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-155"` |
| ORD-156 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-156"` |
| ORD-157 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-157"` |
| ORD-158 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-158"` |
| ORD-159 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-159"` |
| ORD-160 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-160"` |
| ORD-161 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-161"` |
| ORD-162 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-162"` |
| ORD-163 | Response contract | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-163"` |
| ORD-164 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-164"` |
| ORD-165 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-165"` |
| ORD-166 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-166"` |
| ORD-167 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-167"` |
| ORD-168 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-168"` |
| ORD-169 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-169"` |
| ORD-170 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-170"` |
| ORD-171 | File API | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-171"` |
| ORD-172 | File API | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-172"` |
| ORD-173 | Business rule | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-173"` |
| ORD-174 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-174"` |
| ORD-175 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-175"` |
| ORD-176 | Request validation | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-176"` |
| ORD-177 | Response contract | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-177"` |
| ORD-178 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-178"` |
| ORD-179 | Idempotency | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-179"` |
| ORD-180 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-180"` |
| ORD-181 | File API | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-181"` |
| ORD-182 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-182"` |
| ORD-183 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-183"` |
| ORD-184 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-184"` |
| ORD-185 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-185"` |
| ORD-186 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-186"` |
| ORD-187 | File API | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-187"` |
| ORD-188 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-188"` |
| ORD-189 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-189"` |
| ORD-190 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-190"` |
| ORD-191 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-191"` |
| ORD-192 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-192"` |
| ORD-193 | Business rule | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-193"` |
| ORD-194 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-194"` |
| ORD-195 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-195"` |
| ORD-196 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-196"` |
| ORD-197 | Response contract | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-197"` |
| ORD-198 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-198"` |
| ORD-199 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-199"` |
| ORD-200 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-200"` |
| ORD-201 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-201"` |
| ORD-202 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-202"` |
| ORD-203 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-203"` |
| ORD-204 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-204"` |
| ORD-205 | File API | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-205"` |
| ORD-206 | Business rule | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-206"` |
| ORD-207 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-207"` |
| ORD-208 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-208"` |
| ORD-209 | Request validation | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-209"` |
| ORD-210 | Response contract | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-210"` |
| ORD-211 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-211"` |
| ORD-212 | Idempotency | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-212"` |
| ORD-213 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-213"` |
| ORD-214 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-214"` |
| ORD-215 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-215"` |
| ORD-216 | Response contract | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-216"` |
| ORD-217 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-217"` |
| ORD-218 | Happy path | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-218"` |
| ORD-219 | Business rule | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-219"` |
| ORD-220 | Ownership/IDOR | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-220"` |
| ORD-221 | Data integrity | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-221"` |
| ORD-222 | Request validation | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-222"` |
| ORD-223 | Boundary | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-223"` |
| ORD-224 | Response contract | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-224"` |
| ORD-225 | Error handling | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-225"` |
| ORD-226 | Idempotency | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-226"` |
| ORD-227 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-227"` |
| ORD-228 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-228"` |
| ORD-229 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-229"` |
| ORD-230 | Request validation | API: Phiếu dịch vụ (Khối 1) | P2 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-230"` |
| ORD-231 | Request validation | API: Phiếu dịch vụ (Khối 1) | P3 | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-231"` |
| ORD-232 | File API | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-232"` |
| ORD-233 | State transition | API: Phiếu dịch vụ (Khối 1) | P1 | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-233"` |
| PNL-001 | Authentication | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts -g "PNL-001"` |
| PNL-002 | Happy path | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-002"` |
| PNL-003 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-003"` |
| PNL-004 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-004"` |
| PNL-005 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-005"` |
| PNL-006 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-006"` |
| PNL-007 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P3 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-007"` |
| PNL-008 | Ownership/IDOR | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts -g "PNL-008"` |
| PNL-009 | Request validation | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-009"` |
| PNL-010 | Response contract | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts -g "PNL-010"` |
| PNL-011 | Error handling | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-011"` |
| PNL-012 | Happy path | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-012"` |
| PNL-013 | File API | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.integration.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.integration.spec.ts -g "PNL-013"` |
| PNL-014 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-014"` |
| PNL-015 | Ownership/IDOR | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P3 | `tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts -g "PNL-015"` |
| PNL-016 | Request validation | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-016"` |
| PNL-017 | Response contract | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts -g "PNL-017"` |
| PNL-018 | Error handling | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-018"` |
| PNL-019 | Happy path | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-019"` |
| PNL-020 | Request validation | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-020"` |
| PNL-021 | Response contract | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts -g "PNL-021"` |
| PNL-022 | Error handling | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-022"` |
| PNL-023 | Happy path | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-023"` |
| PNL-024 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-024"` |
| PNL-025 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P3 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-025"` |
| PNL-026 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-026"` |
| PNL-027 | Business rule | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-027"` |
| PNL-028 | Ownership/IDOR | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts -g "PNL-028"` |
| PNL-029 | Data integrity | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-029"` |
| PNL-030 | Request validation | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P1 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-030"` |
| PNL-031 | Request validation | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-031"` |
| PNL-032 | Boundary | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-032"` |
| PNL-033 | Response contract | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts -g "PNL-033"` |
| PNL-034 | Error handling | API: Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu | P2 | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-034"` |
| CR-001 | Authentication | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts -g "CR-001"` |
| CR-002 | Happy path | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-002"` |
| CR-003 | Pagination/filter/sort | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-003"` |
| CR-004 | Pagination/filter/sort | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-004"` |
| CR-005 | Pagination/filter/sort | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-005"` |
| CR-006 | Pagination/filter/sort | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-006"` |
| CR-007 | Authorization | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts -g "CR-007"` |
| CR-008 | Request validation | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-008"` |
| CR-009 | Boundary | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-009"` |
| CR-010 | Response contract | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-010"` |
| CR-011 | Error handling | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-011"` |
| CR-012 | Happy path | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-012"` |
| CR-013 | Business rule | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-013"` |
| CR-014 | Pagination/filter/sort | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-014"` |
| CR-015 | Request validation | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-015"` |
| CR-016 | Response contract | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-016"` |
| CR-017 | Error handling | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-017"` |
| CR-018 | Happy path | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-018"` |
| CR-019 | Response contract | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-019"` |
| CR-020 | Error handling | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-020"` |
| CR-021 | Happy path | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-021"` |
| CR-022 | Response contract | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-022"` |
| CR-023 | Error handling | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-023"` |
| CR-024 | Happy path | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-024"` |
| CR-025 | File API | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.integration.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.integration.spec.ts -g "CR-025"` |
| CR-026 | Business rule | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-026"` |
| CR-027 | Business rule | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-027"` |
| CR-028 | Business rule | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | Thủ công | - |
| CR-029 | Business rule | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-029"` |
| CR-030 | Data integrity | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-030"` |
| CR-031 | Response contract | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-031"` |
| CR-032 | Error handling | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-032"` |
| CR-033 | Idempotency | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.concurrency.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.concurrency.spec.ts -g "CR-033"` |
| CR-034 | Happy path | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P1 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-034"` |
| CR-035 | Ownership/IDOR | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | Thủ công | - |
| CR-036 | File API | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | Thủ công | - |
| CR-037 | Request validation | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-037"` |
| CR-038 | Response contract | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-038"` |
| CR-039 | Error handling | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-039"` |
| CR-040 | Happy path | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-040"` |
| CR-041 | File API | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | Thủ công | - |
| CR-042 | Ownership/IDOR | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P3 | Thủ công | - |
| CR-043 | Request validation | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-043"` |
| CR-044 | Response contract | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-044"` |
| CR-045 | Error handling | API: Màn Chi phí – Doanh thu (báo cáo quản trị) | P2 | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-045"` |
| K3O-001 | Authentication | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-001"` |
| K3O-002 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-002"` |
| K3O-003 | Ownership/IDOR | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-003"` |
| K3O-004 | Pagination/filter/sort | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-004"` |
| K3O-005 | Pagination/filter/sort | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-005"` |
| K3O-006 | Request validation | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-006"` |
| K3O-007 | Boundary | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-007"` |
| K3O-008 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-008"` |
| K3O-009 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-009"` |
| K3O-010 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-010"` |
| K3O-011 | Pagination/filter/sort | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-011"` |
| K3O-012 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-012"` |
| K3O-013 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-013"` |
| K3O-014 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-014"` |
| K3O-015 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-015"` |
| K3O-016 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-016"` |
| K3O-017 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-017"` |
| K3O-018 | Ownership/IDOR | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-018"` |
| K3O-019 | Business rule | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-019"` |
| K3O-020 | Request validation | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-020"` |
| K3O-021 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-021"` |
| K3O-022 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-022"` |
| K3O-023 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-023"` |
| K3O-024 | Business rule | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-024"` |
| K3O-025 | State transition | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-025"` |
| K3O-026 | Data integrity | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-026"` |
| K3O-027 | Request validation | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-027"` |
| K3O-028 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-028"` |
| K3O-029 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-029"` |
| K3O-030 | Idempotency | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts -g "K3O-030"` |
| K3O-031 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-031"` |
| K3O-032 | Business rule | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-032"` |
| K3O-033 | State transition | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-033"` |
| K3O-034 | Data integrity | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-034"` |
| K3O-035 | Request validation | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-035"` |
| K3O-036 | Boundary | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-036"` |
| K3O-037 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-037"` |
| K3O-038 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-038"` |
| K3O-039 | Idempotency | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts -g "K3O-039"` |
| K3O-040 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-040"` |
| K3O-041 | Request validation | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-041"` |
| K3O-042 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-042"` |
| K3O-043 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-043"` |
| K3O-044 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-044"` |
| K3O-045 | Business rule | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-045"` |
| K3O-046 | Business rule | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-046"` |
| K3O-047 | State transition | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-047"` |
| K3O-048 | Business rule | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-048"` |
| K3O-049 | Data integrity | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-049"` |
| K3O-050 | Request validation | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-050"` |
| K3O-051 | Boundary | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-051"` |
| K3O-052 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-052"` |
| K3O-053 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-053"` |
| K3O-054 | Idempotency | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts -g "K3O-054"` |
| K3O-055 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-055"` |
| K3O-056 | Request validation | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-056"` |
| K3O-057 | Boundary | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-057"` |
| K3O-058 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-058"` |
| K3O-059 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-059"` |
| K3O-060 | Pagination/filter/sort | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-060"` |
| K3O-061 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-061"` |
| K3O-062 | File API | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts -g "K3O-062"` |
| K3O-063 | Ownership/IDOR | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-063"` |
| K3O-064 | Request validation | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-064"` |
| K3O-065 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-065"` |
| K3O-066 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-066"` |
| K3O-067 | Happy path | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-067"` |
| K3O-068 | File API | API: Tháp điều phối — phiếu dịch vụ (CC) | P1 | `tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts -g "K3O-068"` |
| K3O-069 | Ownership/IDOR | API: Tháp điều phối — phiếu dịch vụ (CC) | P3 | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-069"` |
| K3O-070 | Request validation | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-070"` |
| K3O-071 | Response contract | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-071"` |
| K3O-072 | Error handling | API: Tháp điều phối — phiếu dịch vụ (CC) | P2 | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-072"` |
| K3S-001 | Authentication | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-001"` |
| K3S-002 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-002"` |
| K3S-003 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-003"` |
| K3S-004 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-004"` |
| K3S-005 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-005"` |
| K3S-006 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-006"` |
| K3S-007 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-007"` |
| K3S-008 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-008"` |
| K3S-009 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-009"` |
| K3S-010 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-010"` |
| K3S-011 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-011"` |
| K3S-012 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-012"` |
| K3S-013 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-013"` |
| K3S-014 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-014"` |
| K3S-015 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-015"` |
| K3S-016 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-016"` |
| K3S-017 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-017"` |
| K3S-018 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-018"` |
| K3S-019 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-019"` |
| K3S-020 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-020"` |
| K3S-021 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-021"` |
| K3S-022 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-022"` |
| K3S-023 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-023"` |
| K3S-024 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-024"` |
| K3S-025 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-025"` |
| K3S-026 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-026"` |
| K3S-027 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-027"` |
| K3S-028 | State transition | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-028"` |
| K3S-029 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-029"` |
| K3S-030 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-030"` |
| K3S-031 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-031"` |
| K3S-032 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-032"` |
| K3S-033 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-033"` |
| K3S-034 | Idempotency | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-034"` |
| K3S-035 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-035"` |
| K3S-036 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-036"` |
| K3S-037 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-037"` |
| K3S-038 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-038"` |
| K3S-039 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-039"` |
| K3S-040 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-040"` |
| K3S-041 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-041"` |
| K3S-042 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-042"` |
| K3S-043 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-043"` |
| K3S-044 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-044"` |
| K3S-045 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-045"` |
| K3S-046 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-046"` |
| K3S-047 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-047"` |
| K3S-048 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-048"` |
| K3S-049 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-049"` |
| K3S-050 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-050"` |
| K3S-051 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-051"` |
| K3S-052 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-052"` |
| K3S-053 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-053"` |
| K3S-054 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-054"` |
| K3S-055 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-055"` |
| K3S-056 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-056"` |
| K3S-057 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-057"` |
| K3S-058 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-058"` |
| K3S-059 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-059"` |
| K3S-060 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-060"` |
| K3S-061 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-061"` |
| K3S-062 | Boundary | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-062"` |
| K3S-063 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-063"` |
| K3S-064 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-064"` |
| K3S-065 | Idempotency | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-065"` |
| K3S-066 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-066"` |
| K3S-067 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-067"` |
| K3S-068 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-068"` |
| K3S-069 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-069"` |
| K3S-070 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-070"` |
| K3S-071 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-071"` |
| K3S-072 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-072"` |
| K3S-073 | Boundary | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-073"` |
| K3S-074 | Boundary | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-074"` |
| K3S-075 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-075"` |
| K3S-076 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-076"` |
| K3S-077 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-077"` |
| K3S-078 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-078"` |
| K3S-080 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-080"` |
| K3S-081 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-081"` |
| K3S-082 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-082"` |
| K3S-083 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-083"` |
| K3S-084 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-084"` |
| K3S-085 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-085"` |
| K3S-086 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-086"` |
| K3S-087 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-087"` |
| K3S-088 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-088"` |
| K3S-089 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-089"` |
| K3S-090 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-090"` |
| K3S-091 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-091"` |
| K3S-092 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-092"` |
| K3S-093 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-093"` |
| K3S-094 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-094"` |
| K3S-095 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-095"` |
| K3S-096 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-096"` |
| K3S-097 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-097"` |
| K3S-098 | Boundary | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-098"` |
| K3S-099 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-099"` |
| K3S-100 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-100"` |
| K3S-101 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-101"` |
| K3S-102 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-102"` |
| K3S-103 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-103"` |
| K3S-104 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-104"` |
| K3S-105 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-105"` |
| K3S-106 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-106"` |
| K3S-107 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-107"` |
| K3S-108 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-108"` |
| K3S-109 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-109"` |
| K3S-110 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-110"` |
| K3S-111 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-111"` |
| K3S-112 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-112"` |
| K3S-113 | Input security | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-113"` |
| K3S-114 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-114"` |
| K3S-115 | Boundary | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-115"` |
| K3S-116 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-116"` |
| K3S-117 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-117"` |
| K3S-118 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-118"` |
| K3S-119 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-119"` |
| K3S-120 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-120"` |
| K3S-121 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-121"` |
| K3S-122 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-122"` |
| K3S-123 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-123"` |
| K3S-124 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-124"` |
| K3S-125 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-125"` |
| K3S-126 | State transition | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-126"` |
| K3S-127 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-127"` |
| K3S-128 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-128"` |
| K3S-129 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-129"` |
| K3S-130 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-130"` |
| K3S-131 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-131"` |
| K3S-132 | Idempotency | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-132"` |
| K3S-133 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-133"` |
| K3S-134 | Pagination/filter/sort | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-134"` |
| K3S-135 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-135"` |
| K3S-136 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-136"` |
| K3S-137 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-137"` |
| K3S-138 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-138"` |
| K3S-139 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-139"` |
| K3S-140 | File API | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts -g "K3S-140"` |
| K3S-141 | File API | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts -g "K3S-141"` |
| K3S-142 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-142"` |
| K3S-143 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-143"` |
| K3S-144 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-144"` |
| K3S-145 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-145"` |
| K3S-146 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-146"` |
| K3S-147 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-147"` |
| K3S-148 | Idempotency | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-148"` |
| K3S-149 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-149"` |
| K3S-150 | File API | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts -g "K3S-150"` |
| K3S-151 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-151"` |
| K3S-152 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-152"` |
| K3S-153 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-153"` |
| K3S-154 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-154"` |
| K3S-155 | Happy path | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-155"` |
| K3S-156 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-156"` |
| K3S-157 | Ownership/IDOR | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-157"` |
| K3S-158 | Data integrity | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-158"` |
| K3S-159 | Request validation | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-159"` |
| K3S-160 | Response contract | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-160"` |
| K3S-161 | Error handling | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-161"` |
| K3S-162 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-162"` |
| K3S-163 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-163"` |
| K3S-164 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-164"` |
| K3S-165 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-165"` |
| K3S-166 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-166"` |
| K3S-167 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-167"` |
| K3S-168 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-168"` |
| K3S-169 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-169"` |
| K3S-170 | Business rule | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P3 | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-170"` |
| K3S-171 | Concurrency | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-171"` |
| K3S-172 | File API | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P1 | `tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts -g "K3S-172"` |
| K3S-173 | State transition | API: Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế) | P2 | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-173"` |
| K3X-001 | Authentication | API: Tháp điều phối — thao tác ngoại lệ | P1 | `tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts -g "K3X-001"` |
| K3X-032 | Happy path | API: Tháp điều phối — thao tác ngoại lệ | P1 | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-032"` |
| K3X-033 | Request validation | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-033"` |
| K3X-034 | Response contract | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts -g "K3X-034"` |
| K3X-035 | Error handling | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-035"` |
| K3X-036 | Happy path | API: Tháp điều phối — thao tác ngoại lệ | P1 | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-036"` |
| K3X-037 | Business rule | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-037"` |
| K3X-038 | Ownership/IDOR | API: Tháp điều phối — thao tác ngoại lệ | P3 | `tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts -g "K3X-038"` |
| K3X-039 | Data integrity | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-039"` |
| K3X-040 | Request validation | API: Tháp điều phối — thao tác ngoại lệ | P1 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-040"` |
| K3X-041 | Request validation | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-041"` |
| K3X-042 | Boundary | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-042"` |
| K3X-043 | Response contract | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts -g "K3X-043"` |
| K3X-044 | Error handling | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-044"` |
| K3X-045 | Idempotency | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts -g "K3X-045"` |
| K3X-046 | Happy path | API: Tháp điều phối — thao tác ngoại lệ | P1 | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-046"` |
| K3X-047 | Business rule | API: Tháp điều phối — thao tác ngoại lệ | P1 | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-047"` |
| K3X-048 | Business rule | API: Tháp điều phối — thao tác ngoại lệ | P3 | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-048"` |
| K3X-049 | Ownership/IDOR | API: Tháp điều phối — thao tác ngoại lệ | P3 | `tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts -g "K3X-049"` |
| K3X-050 | Data integrity | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-050"` |
| K3X-051 | Request validation | API: Tháp điều phối — thao tác ngoại lệ | P1 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-051"` |
| K3X-052 | Boundary | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-052"` |
| K3X-053 | Boundary | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-053"` |
| K3X-054 | Response contract | API: Tháp điều phối — thao tác ngoại lệ | P3 | `tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts -g "K3X-054"` |
| K3X-055 | Error handling | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-055"` |
| K3X-056 | Idempotency | API: Tháp điều phối — thao tác ngoại lệ | P2 | `tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts` | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts -g "K3X-056"` |
| UI-LOGIN-001 | Hiển thị trang | UI: Đăng nhập và phiên làm việc | P3 | `tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts -g "UI-LOGIN-001"` |
| UI-LOGIN-002 | Thao tác form | UI: Đăng nhập và phiên làm việc | P1 | `tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts -g "UI-LOGIN-002"` |
| UI-LOGIN-003 | Form validation | UI: Đăng nhập và phiên làm việc | P2 | `tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts -g "UI-LOGIN-003"` |
| UI-LOGIN-004 | Form validation | UI: Đăng nhập và phiên làm việc | P3 | `tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts -g "UI-LOGIN-004"` |
| UI-LOGIN-005 | Thông báo | UI: Đăng nhập và phiên làm việc | P1 | `tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts -g "UI-LOGIN-005"` |
| UI-LOGIN-006 | Session | UI: Đăng nhập và phiên làm việc | P1 | `tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts -g "UI-LOGIN-006"` |
| UI-LOGIN-007 | Session | UI: Đăng nhập và phiên làm việc | P2 | `tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts -g "UI-LOGIN-007"` |
| UI-LOGIN-008 | Session | UI: Đăng nhập và phiên làm việc | P2 | `tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts -g "UI-LOGIN-008"` |
| UI-LOGIN-009 | Phân quyền UI | UI: Đăng nhập và phiên làm việc | P1 | `tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts -g "UI-LOGIN-009"` |
| UI-LOGIN-010 | Accessibility | UI: Đăng nhập và phiên làm việc | P3 | `tests/ui/quan-tri-phan-quyen/dang-nhap.a11y.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.a11y.spec.ts -g "UI-LOGIN-010"` |
| UI-LOGIN-011 | Error handling | UI: Đăng nhập và phiên làm việc | P3 | `tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts -g "UI-LOGIN-011"` |
| UI-ADM-001 | Hiển thị trang | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-001"` |
| UI-ADM-002 | Bảng danh sách | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P3 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-002"` |
| UI-ADM-003 | Thao tác form | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-003"` |
| UI-ADM-004 | Form validation | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-004"` |
| UI-ADM-005 | Form validation | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-005"` |
| UI-ADM-006 | Thông báo | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P3 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-006"` |
| UI-ADM-007 | Bảng danh sách | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-007"` |
| UI-ADM-008 | Thao tác form | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P1 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-008"` |
| UI-ADM-009 | Form validation | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-009"` |
| UI-ADM-010 | Form validation | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-010"` |
| UI-ADM-011 | Form validation | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P3 | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-011"` |
| UI-ADM-012 | Thao tác form | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P1 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-012"` |
| UI-ADM-013 | Thông báo | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-013"` |
| UI-ADM-014 | Upload/download | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P3 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-014"` |
| UI-ADM-015 | Trạng thái UI | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-015"` |
| UI-ADM-016 | Thao tác form | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P2 | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-016"` |
| UI-ADM-017 | Phân quyền UI | UI: Phân quyền (Bộ phận, Vai trò, Người dùng) | P1 | `tests/ui/quan-tri-phan-quyen/phan-quyen.access.spec.ts` | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.access.spec.ts -g "UI-ADM-017"` |
| UI-LEG-001 | Hiển thị trang | UI: Cấu hình chặng | P2 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-001"` |
| UI-LEG-002 | Bảng danh sách | UI: Cấu hình chặng | P3 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-002"` |
| UI-LEG-003 | Bảng danh sách | UI: Cấu hình chặng | P3 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-003"` |
| UI-LEG-004 | Hiển thị trang | UI: Cấu hình chặng | P2 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-004"` |
| UI-LEG-005 | Form validation | UI: Cấu hình chặng | P2 | `tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts -g "UI-LEG-005"` |
| UI-LEG-006 | Trạng thái UI | UI: Cấu hình chặng | P3 | `tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts -g "UI-LEG-006"` |
| UI-LEG-007 | Thao tác form | UI: Cấu hình chặng | P1 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-007"` |
| UI-LEG-008 | Thông báo | UI: Cấu hình chặng | P2 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-008"` |
| UI-LEG-009 | Điều hướng | UI: Cấu hình chặng | P2 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-009"` |
| UI-LEG-010 | Thao tác form | UI: Cấu hình chặng | P2 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-010"` |
| UI-LEG-011 | Thao tác form | UI: Cấu hình chặng | P2 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-011"` |
| UI-LEG-012 | Thông báo | UI: Cấu hình chặng | P2 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-012"` |
| UI-LEG-013 | Form validation | UI: Cấu hình chặng | P2 | `tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts -g "UI-LEG-013"` |
| UI-LEG-014 | Thao tác form | UI: Cấu hình chặng | P3 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-014"` |
| UI-LEG-015 | Thao tác form | UI: Cấu hình chặng | P3 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-015"` |
| UI-LEG-016 | Trạng thái UI | UI: Cấu hình chặng | P3 | `tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts -g "UI-LEG-016"` |
| UI-LEG-017 | Hiển thị dữ liệu | UI: Cấu hình chặng | P1 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-017"` |
| UI-LEG-018 | Hiển thị dữ liệu | UI: Cấu hình chặng | P3 | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-018"` |
| UI-CFG-001 | Hiển thị trang | UI: Cấu hình đầu mục giá | P2 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-001"` |
| UI-CFG-002 | Hiển thị dữ liệu | UI: Cấu hình đầu mục giá | P2 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-002"` |
| UI-CFG-003 | Điều hướng | UI: Cấu hình đầu mục giá | P2 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-003"` |
| UI-CFG-004 | Hiển thị dữ liệu | UI: Cấu hình đầu mục giá | P2 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-004"` |
| UI-CFG-005 | Thao tác form | UI: Cấu hình đầu mục giá | P2 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-005"` |
| UI-CFG-006 | Thao tác form | UI: Cấu hình đầu mục giá | P1 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-006"` |
| UI-CFG-007 | Thông báo | UI: Cấu hình đầu mục giá | P1 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-007"` |
| UI-CFG-008 | Thông báo | UI: Cấu hình đầu mục giá | P1 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-008"` |
| UI-CFG-009 | Trạng thái UI | UI: Cấu hình đầu mục giá | P2 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "UI-CFG-009"` |
| UI-CFG-010 | Form validation | UI: Cấu hình đầu mục giá | P2 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "UI-CFG-010"` |
| UI-CFG-011 | Form validation | UI: Cấu hình đầu mục giá | P2 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "UI-CFG-011"` |
| UI-CFG-012 | Form validation | UI: Cấu hình đầu mục giá | P2 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "UI-CFG-012"` |
| UI-CFG-013 | Hiển thị dữ liệu | UI: Cấu hình đầu mục giá | P3 | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-013"` |
| UI-BGM-001 | Hiển thị trang | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-001"` |
| UI-BGM-002 | Hiển thị dữ liệu | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-002"` |
| UI-BGM-003 | Bảng danh sách | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-003"` |
| UI-BGM-004 | Upload/download | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-004"` |
| UI-BGM-005 | Thao tác form | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-005"` |
| UI-BGM-006 | Thông báo | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-006"` |
| UI-BGM-007 | Hiển thị trang | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-007"` |
| UI-BGM-008 | Trạng thái UI | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts -g "UI-BGM-008"` |
| UI-BGM-009 | Thao tác form | UI: Giá mua đầu vào | P1 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-009"` |
| UI-BGM-010 | Hiển thị dữ liệu | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-010"` |
| UI-BGM-011 | Thao tác form | UI: Giá mua đầu vào | P1 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-011"` |
| UI-BGM-012 | Form validation | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts -g "UI-BGM-012"` |
| UI-BGM-013 | Hiển thị dữ liệu | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-013"` |
| UI-BGM-014 | Bảng danh sách | UI: Giá mua đầu vào | P3 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-014"` |
| UI-BGM-015 | Thao tác form | UI: Giá mua đầu vào | P1 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-015"` |
| UI-BGM-016 | Thao tác form | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-016"` |
| UI-BGM-017 | Hiển thị dữ liệu | UI: Giá mua đầu vào | P3 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-017"` |
| UI-BGM-018 | Thao tác form | UI: Giá mua đầu vào | P1 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-018"` |
| UI-BGM-019 | Thông báo | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-019"` |
| UI-BGM-020 | Thao tác form | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-020"` |
| UI-BGM-021 | Hiển thị dữ liệu | UI: Giá mua đầu vào | P2 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-021"` |
| UI-BGM-022 | Trạng thái UI | UI: Giá mua đầu vào | P3 | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts` | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts -g "UI-BGM-022"` |
| UI-SBP-001 | Hiển thị trang | UI: Giá mua định mức | P2 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-001"` |
| UI-SBP-002 | Bảng danh sách | UI: Giá mua định mức | P2 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-002"` |
| UI-SBP-003 | Hiển thị dữ liệu | UI: Giá mua định mức | P1 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-003"` |
| UI-SBP-004 | Điều hướng | UI: Giá mua định mức | P2 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-004"` |
| UI-SBP-005 | Thao tác form | UI: Giá mua định mức | P2 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-005"` |
| UI-SBP-006 | Thao tác form | UI: Giá mua định mức | P1 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-006"` |
| UI-SBP-007 | Form validation | UI: Giá mua định mức | P2 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "UI-SBP-007"` |
| UI-SBP-008 | Form validation | UI: Giá mua định mức | P2 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "UI-SBP-008"` |
| UI-SBP-009 | Thao tác form | UI: Giá mua định mức | P2 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-009"` |
| UI-SBP-010 | Thông báo | UI: Giá mua định mức | P2 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-010"` |
| UI-SBP-011 | Thông báo | UI: Giá mua định mức | P3 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-011"` |
| UI-SBP-012 | Thao tác form | UI: Giá mua định mức | P1 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-012"` |
| UI-SBP-013 | Session | UI: Giá mua định mức | P1 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.access.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.access.spec.ts -g "UI-SBP-013"` |
| UI-SBP-014 | Thông báo | UI: Giá mua định mức | P1 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-014"` |
| UI-SBP-015 | Thông báo | UI: Giá mua định mức | P2 | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-015"` |
| UI-SSP-001 | Hiển thị trang | UI: Giá bán định mức | P2 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-001"` |
| UI-SSP-002 | Bảng danh sách | UI: Giá bán định mức | P2 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-002"` |
| UI-SSP-003 | Trạng thái UI | UI: Giá bán định mức | P1 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "UI-SSP-003"` |
| UI-SSP-004 | Điều hướng | UI: Giá bán định mức | P2 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-004"` |
| UI-SSP-005 | Thao tác form | UI: Giá bán định mức | P1 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-005"` |
| UI-SSP-006 | Thông báo | UI: Giá bán định mức | P1 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-006"` |
| UI-SSP-007 | Thao tác form | UI: Giá bán định mức | P2 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-007"` |
| UI-SSP-008 | Form validation | UI: Giá bán định mức | P3 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "UI-SSP-008"` |
| UI-SSP-009 | Form validation | UI: Giá bán định mức | P3 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "UI-SSP-009"` |
| UI-SSP-010 | Thao tác form | UI: Giá bán định mức | P1 | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-010"` |
| UI-RFQ-001 | Hiển thị trang | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-001"` |
| UI-RFQ-002 | Phân quyền UI | UI: Yêu cầu báo giá | P1 | `tests/ui/quan-ly-bao-gia/ycbg.access.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.access.spec.ts -g "UI-RFQ-002"` |
| UI-RFQ-003 | Bảng danh sách | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-003"` |
| UI-RFQ-004 | Hiển thị trang | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-004"` |
| UI-RFQ-005 | Hiển thị dữ liệu | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-005"` |
| UI-RFQ-006 | Form validation | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-006"` |
| UI-RFQ-007 | Thao tác form | UI: Yêu cầu báo giá | P1 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-007"` |
| UI-RFQ-008 | Thao tác form | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-008"` |
| UI-RFQ-009 | Trạng thái UI | UI: Yêu cầu báo giá | P1 | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-009"` |
| UI-RFQ-010 | Form validation | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-010"` |
| UI-RFQ-011 | Điều hướng | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-011"` |
| UI-RFQ-012 | Upload/download | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-012"` |
| UI-RFQ-013 | Thông báo | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-013"` |
| UI-RFQ-014 | Form validation | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-014"` |
| UI-RFQ-015 | Form validation | UI: Yêu cầu báo giá | P2 | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-015"` |
| UI-RFQ-016 | Thao tác form | UI: Yêu cầu báo giá | P3 | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-016"` |
| UI-IPS-001 | Hiển thị trang | UI: Báo giá nội bộ | P2 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-001"` |
| UI-IPS-002 | Bảng danh sách | UI: Báo giá nội bộ | P3 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-002"` |
| UI-IPS-003 | Hiển thị trang | UI: Báo giá nội bộ | P2 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-003"` |
| UI-IPS-004 | Thao tác form | UI: Báo giá nội bộ | P1 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-004"` |
| UI-IPS-005 | Thao tác form | UI: Báo giá nội bộ | P1 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-005"` |
| UI-IPS-006 | Hiển thị dữ liệu | UI: Báo giá nội bộ | P2 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-006"` |
| UI-IPS-007 | Form validation | UI: Báo giá nội bộ | P2 | `tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts -g "UI-IPS-007"` |
| UI-IPS-008 | Form validation | UI: Báo giá nội bộ | P2 | `tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts -g "UI-IPS-008"` |
| UI-IPS-009 | Hiển thị dữ liệu | UI: Báo giá nội bộ | P2 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-009"` |
| UI-IPS-010 | Hiển thị dữ liệu | UI: Báo giá nội bộ | P2 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-010"` |
| UI-IPS-011 | Hiển thị dữ liệu | UI: Báo giá nội bộ | P1 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-011"` |
| UI-IPS-012 | Thông báo | UI: Báo giá nội bộ | P2 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-012"` |
| UI-IPS-013 | Thao tác form | UI: Báo giá nội bộ | P2 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-013"` |
| UI-IPS-014 | Thao tác form | UI: Báo giá nội bộ | P1 | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-014"` |
| UI-RC-001 | Hiển thị trang | UI: Báo giá khách hàng | P2 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-001"` |
| UI-RC-002 | Bảng danh sách | UI: Báo giá khách hàng | P2 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-002"` |
| UI-RC-003 | Hiển thị dữ liệu | UI: Báo giá khách hàng | P2 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-003"` |
| UI-RC-004 | Hiển thị dữ liệu | UI: Báo giá khách hàng | P1 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-004"` |
| UI-RC-005 | Thao tác form | UI: Báo giá khách hàng | P1 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-005"` |
| UI-RC-006 | Thao tác form | UI: Báo giá khách hàng | P1 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-006"` |
| UI-RC-007 | Form validation | UI: Báo giá khách hàng | P2 | `tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts -g "UI-RC-007"` |
| UI-RC-008 | Hiển thị dữ liệu | UI: Báo giá khách hàng | P3 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-008"` |
| UI-RC-009 | Hiển thị dữ liệu | UI: Báo giá khách hàng | P1 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-009"` |
| UI-RC-010 | Upload/download | UI: Báo giá khách hàng | P2 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-010"` |
| UI-RC-011 | Thao tác form | UI: Báo giá khách hàng | P1 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-011"` |
| UI-RC-012 | Form validation | UI: Báo giá khách hàng | P2 | `tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts -g "UI-RC-012"` |
| UI-RC-013 | Thao tác form | UI: Báo giá khách hàng | P2 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-013"` |
| UI-RC-014 | Thao tác form | UI: Báo giá khách hàng | P2 | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-014"` |
| UI-RC-015 | Form validation | UI: Báo giá khách hàng | P2 | `tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts -g "UI-RC-015"` |
| UI-RC-016 | Form validation | UI: Báo giá khách hàng | P3 | `tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts -g "UI-RC-016"` |
| UI-RC-017 | Visual regression | UI: Báo giá khách hàng | P3 | `tests/ui/quan-ly-bao-gia/bgkh.visual.spec.ts` | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.visual.spec.ts -g "UI-RC-017"` |
| UI-ORD-001 | Hiển thị trang | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-001"` |
| UI-ORD-002 | Bảng danh sách | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-002"` |
| UI-ORD-003 | Hiển thị dữ liệu | UI: Phiếu dịch vụ (Khối 1) | P1 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-003"` |
| UI-ORD-004 | Hiển thị trang | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-004"` |
| UI-ORD-005 | Hiển thị dữ liệu | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-005"` |
| UI-ORD-006 | Thao tác form | UI: Phiếu dịch vụ (Khối 1) | P1 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-006"` |
| UI-ORD-007 | Form validation | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts -g "UI-ORD-007"` |
| UI-ORD-008 | Thao tác form | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-008"` |
| UI-ORD-009 | Hiển thị dữ liệu | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-009"` |
| UI-ORD-010 | Hiển thị dữ liệu | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-010"` |
| UI-ORD-011 | Hiển thị dữ liệu | UI: Phiếu dịch vụ (Khối 1) | P1 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-011"` |
| UI-ORD-012 | Hiển thị dữ liệu | UI: Phiếu dịch vụ (Khối 1) | P1 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-012"` |
| UI-ORD-013 | Thao tác form | UI: Phiếu dịch vụ (Khối 1) | P1 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-013"` |
| UI-ORD-014 | Trạng thái UI | UI: Phiếu dịch vụ (Khối 1) | P1 | `tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts -g "UI-ORD-014"` |
| UI-ORD-015 | Form validation | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts -g "UI-ORD-015"` |
| UI-ORD-016 | Phân quyền UI | UI: Phiếu dịch vụ (Khối 1) | P1 | `tests/ui/phieu-dich-vu/phieu-dich-vu.access.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.access.spec.ts -g "UI-ORD-016"` |
| UI-ORD-017 | Hiển thị dữ liệu | UI: Phiếu dịch vụ (Khối 1) | P1 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-017"` |
| UI-ORD-018 | Thông báo | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-018"` |
| UI-ORD-019 | Điều hướng | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-019"` |
| UI-ORD-020 | Trạng thái UI | UI: Phiếu dịch vụ (Khối 1) | P2 | `tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts -g "UI-ORD-020"` |
| UI-K3-001 | Hiển thị trang | UI: Tháp điều phối | P2 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-001"` |
| UI-K3-002 | Bảng danh sách | UI: Tháp điều phối | P3 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-002"` |
| UI-K3-003 | Phân quyền UI | UI: Tháp điều phối | P1 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts -g "UI-K3-003"` |
| UI-K3-004 | Thao tác form | UI: Tháp điều phối | P1 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-004"` |
| UI-K3-005 | Thao tác form | UI: Tháp điều phối | P2 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-005"` |
| UI-K3-006 | Hiển thị dữ liệu | UI: Tháp điều phối | P2 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-006"` |
| UI-K3-007 | Hiển thị dữ liệu | UI: Tháp điều phối | P2 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-007"` |
| UI-K3-008 | Hiển thị dữ liệu | UI: Tháp điều phối | P1 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-008"` |
| UI-K3-009 | Thông báo | UI: Tháp điều phối | P1 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-009"` |
| UI-K3-010 | Thao tác form | UI: Tháp điều phối | P2 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-010"` |
| UI-K3-011 | Trạng thái UI | UI: Tháp điều phối | P2 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts -g "UI-K3-011"` |
| UI-K3-012 | Upload/download | UI: Tháp điều phối | P3 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-012"` |
| UI-K3-013 | Responsive | UI: Tháp điều phối | P3 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.responsive.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.responsive.spec.ts -g "UI-K3-013"` |
| UI-K3-014 | Form validation | UI: Tháp điều phối | P2 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts -g "UI-K3-014"` |
| UI-K3-015 | Session | UI: Tháp điều phối | P2 | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts` | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts -g "UI-K3-015"` |
| UI-PNL-001 | Hiển thị trang | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P2 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-001"` |
| UI-PNL-002 | Bảng danh sách | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P1 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-002"` |
| UI-PNL-003 | Bảng danh sách | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P2 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-003"` |
| UI-PNL-004 | Form validation | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P2 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts -g "UI-PNL-004"` |
| UI-PNL-005 | Bảng danh sách | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P3 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-005"` |
| UI-PNL-006 | Hiển thị dữ liệu | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P1 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-006"` |
| UI-PNL-007 | Hiển thị dữ liệu | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P2 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-007"` |
| UI-PNL-008 | Form validation | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P2 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts -g "UI-PNL-008"` |
| UI-PNL-009 | Form validation | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P3 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts -g "UI-PNL-009"` |
| UI-PNL-010 | Thao tác form | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P1 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-010"` |
| UI-PNL-011 | Thông báo | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P1 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-011"` |
| UI-PNL-012 | Upload/download | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P2 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-012"` |
| UI-PNL-013 | Upload/download | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P2 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-013"` |
| UI-PNL-014 | Accessibility | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P3 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.a11y.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.a11y.spec.ts -g "UI-PNL-014"` |
| UI-PNL-015 | Error handling | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P3 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts -g "UI-PNL-015"` |
| UI-PNL-016 | Phân quyền UI | UI: Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu | P1 | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.access.spec.ts` | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.access.spec.ts -g "UI-PNL-016"` |
| UI-NTF-001 | Hiển thị dữ liệu | UI: Thông báo trong hệ thống | P2 | `tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts` | `npx playwright test tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts -g "UI-NTF-001"` |
| UI-NTF-002 | Điều hướng | UI: Thông báo trong hệ thống | P2 | `tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts` | `npx playwright test tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts -g "UI-NTF-002"` |
| UI-NTF-003 | Visual regression | UI: Thông báo trong hệ thống | P3 | `tests/ui/lich-su-thong-bao/thong-bao.visual.spec.ts` | `npx playwright test tests/ui/lich-su-thong-bao/thong-bao.visual.spec.ts -g "UI-NTF-003"` |

## 5. Chi tiết file test

### tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-ADM-001..FLOW-ADM-009 |
| Project chạy | `api` |
| Tag | `@flow`, `@quan-tri-phan-quyen`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` |

### tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Cấu hình chặng → mô phỏng → xác nhận chặng trên phiếu": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-LEG-001..FLOW-LEG-004 |
| Project chạy | `api` |
| Tag | `@flow`, `@cau-hinh-chang`, `@p1`, `@p2` |
| Fixture dùng | `adminApi`, `ccApi`, `testRun` |
| Dữ liệu cần có | Quy tắc chặng tạo mới tiền tố "AT-{testRunId}"; phiếu mẫu để mô phỏng |
| Dọn dữ liệu | Vô hiệu rồi xóa quy tắc của lượt chạy |
| Lệnh chạy | `npx playwright test tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` |

### tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Thiết lập giá: Đầu mục → Giá mua đầu vào → Giá mua định mức → Giá bán định mức": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-PRICE-001..FLOW-PRICE-006 |
| Project chạy | `api` |
| Tag | `@flow`, `@xuyen-module`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Môi trường dev sạch dữ liệu tiền tố "AT"; chạy FLOW-PRICE rồi FLOW-E2E theo thứ tự |
| Dọn dữ liệu | Giữ dữ liệu luồng để đối soát; dọn bằng script cleanup theo testRunId |
| Lệnh chạy | `npx playwright test tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` |

### tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động)": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial). Case gắn [Chờ xác nhận]: FLOW-QUOTE-010..FLOW-QUOTE-011 |
| Case quản lý | FLOW-QUOTE-001..FLOW-QUOTE-011 |
| Project chạy | `api` |
| Tag | `@flow`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` |

### tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-E2E-001..FLOW-E2E-015 |
| Project chạy | `api` |
| Tag | `@flow`, `@xuyen-module`, `@p1` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Môi trường dev sạch dữ liệu tiền tố "AT"; chạy FLOW-PRICE rồi FLOW-E2E theo thứ tự |
| Dọn dữ liệu | Giữ dữ liệu luồng để đối soát; dọn bằng script cleanup theo testRunId |
| Lệnh chạy | `npx playwright test tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` |

### tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial). Case gắn [Chờ xác nhận]: FLOW-REV-009 |
| Case quản lý | FLOW-REV-001..FLOW-REV-014 |
| Project chạy | `api` |
| Tag | `@flow`, `@phieu-dich-vu`, `@p1`, `@p2`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` |

### tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial). Case gắn [Chờ xác nhận]: FLOW-CHG-BGM-007 |
| Case quản lý | FLOW-CHG-BGM-001..FLOW-CHG-BGM-008 |
| Project chạy | `api` |
| Tag | `@flow`, `@gia-mua-dau-vao`, `@p1`, `@p2`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` |

### tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-CHG-SBP-001..FLOW-CHG-SBP-007 |
| Project chạy | `api` |
| Tag | `@flow`, `@gia-mua-dinh-muc`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Định mức sinh từ bảng giá NT_A/NT_B đã kích hoạt (bộ giá P0) |
| Dọn dữ liệu | Không xóa được định mức; trả giá về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` |

### tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial). Case gắn [Chờ xác nhận]: FLOW-CHG-SSP-002 |
| Case quản lý | FLOW-CHG-SSP-001..FLOW-CHG-SSP-011 |
| Project chạy | `api` |
| Tag | `@flow`, `@gia-ban-dinh-muc`, `@p1`, `@p2`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Giá mua định mức P0 đã có; giá bán P0 |
| Dọn dữ liệu | Trả giá bán về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` |

### tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt)": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-DEACT-001..FLOW-DEACT-014 |
| Project chạy | `api` |
| Tag | `@flow`, `@cau-hinh-dau-muc-gia`, `@p1`, `@p2` |
| Fixture dùng | `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Đầu mục giá tiền tố "AT" cho 5 dịch vụ (FLOW-PRICE-001); nhà thầu NT_A, NT_B có sẵn |
| Dọn dữ liệu | Tắt kích hoạt đầu mục của lượt chạy khi không còn tham chiếu |
| Lệnh chạy | `npx playwright test tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` |

### tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Gộp đầu mục trên BGKH và doanh thu phiếu dịch vụ": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-MERGE-001..FLOW-MERGE-004 |
| Project chạy | `api` |
| Tag | `@flow`, `@quan-ly-bao-gia`, `@p1`, `@p2` |
| Fixture dùng | `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` |

### tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Ngoại lệ phiếu dịch vụ: từ chối, khôi phục, hủy, chi phí phát sinh do K3 tạo, đề xuất phạm vi, đổi xe": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-EXC-001..FLOW-EXC-003, FLOW-EXC-005..FLOW-EXC-007 |
| Project chạy | `api` |
| Tag | `@flow`, `@phieu-dich-vu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` |

### tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Tỷ giá, P&L và báo cáo Chi phí – Doanh thu nhất quán": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-PNL-001..FLOW-PNL-005 |
| Project chạy | `api` |
| Tag | `@flow`, `@chi-phi-doanh-thu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` |

### tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Lịch sử hoạt động và thông báo xuyên module": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-HIST-001..FLOW-HIST-004 |
| Project chạy | `api` |
| Tag | `@flow`, `@lich-su-thong-bao`, `@p1`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Thao tác vừa thực hiện ở các module khác để sinh lịch sử, thông báo |
| Dọn dữ liệu | Đánh dấu đã đọc thông báo của lượt chạy |
| Lệnh chạy | `npx playwright test tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` |

### tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Phân quyền theo hành động (Xem / Cập nhật / Kích hoạt / Duyệt)": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial) |
| Case quản lý | FLOW-PERM-001..FLOW-PERM-006 |
| Project chạy | `api` |
| Tag | `@flow`, `@quan-tri-phan-quyen`, `@p1` |
| Fixture dùng | `ccApi`, `dpApi`, `saleApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` |

### tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Luồng API "Cách ly tenant và tài nguyên con": các bước nối nhau trong 1 case, dữ liệu bước sau lấy từ bước trước; chạy tuần tự (serial). Cần tenant thứ hai (TENANT_B): chưa có thì để test.fixme |
| Case quản lý | FLOW-TEN-001..FLOW-TEN-003 |
| Project chạy | `api` |
| Tag | `@flow`, `@quan-tri-phan-quyen`, `@p1` |
| Fixture dùng | `adminApi`, `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts` |

### tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Xác thực và phiên đăng nhập": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | AUTH-001, AUTH-008, AUTH-030 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts` |

### tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Xác thực và phiên đăng nhập": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | AUTH-002..AUTH-006, AUTH-014..AUTH-016, AUTH-022..AUTH-023, AUTH-026..AUTH-029, AUTH-036..AUTH-038 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` |

### tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Xác thực và phiên đăng nhập": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | AUTH-007, AUTH-010, AUTH-012, AUTH-017..AUTH-018, AUTH-020, AUTH-025, AUTH-031..AUTH-032, AUTH-034, AUTH-039..AUTH-040, AUTH-042 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` |

### tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Xác thực và phiên đăng nhập": gửi trùng, gửi đồng thời |
| Case quản lý | AUTH-009, AUTH-013, AUTH-021, AUTH-035, AUTH-043 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` |

### tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Xác thực và phiên đăng nhập": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | AUTH-011, AUTH-019, AUTH-024, AUTH-033, AUTH-041 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` |

### tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị bộ phận": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | ADM-DEP-001, ADM-DEP-004, ADM-DEP-012..ADM-DEP-013, ADM-DEP-059, ADM-DEP-074 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` |

### tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị bộ phận": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: ADM-DEP-066 |
| Case quản lý | ADM-DEP-002..ADM-DEP-003, ADM-DEP-009..ADM-DEP-011, ADM-DEP-019, ADM-DEP-023..ADM-DEP-025, ADM-DEP-030..ADM-DEP-033, ADM-DEP-037..ADM-DEP-039, ADM-DEP-044..ADM-DEP-046, ADM-DEP-051..ADM-DEP-053, ADM-DEP-058, ADM-DEP-060..ADM-DEP-061, ADM-DEP-065..ADM-DEP-067, ADM-DEP-073, ADM-DEP-075..ADM-DEP-076 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` |

### tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị bộ phận": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | ADM-DEP-005..ADM-DEP-006, ADM-DEP-008, ADM-DEP-014..ADM-DEP-015, ADM-DEP-017, ADM-DEP-020, ADM-DEP-022, ADM-DEP-026..ADM-DEP-027, ADM-DEP-029, ADM-DEP-034, ADM-DEP-036, ADM-DEP-040, ADM-DEP-042, ADM-DEP-047, ADM-DEP-049, ADM-DEP-054, ADM-DEP-056, ADM-DEP-062, ADM-DEP-064, ADM-DEP-068..ADM-DEP-069, ADM-DEP-071, ADM-DEP-077, ADM-DEP-079 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` |

### tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị bộ phận": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | ADM-DEP-007, ADM-DEP-016, ADM-DEP-021, ADM-DEP-028, ADM-DEP-035, ADM-DEP-041, ADM-DEP-048, ADM-DEP-055, ADM-DEP-063, ADM-DEP-070, ADM-DEP-078 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` |

### tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị bộ phận": gửi trùng, gửi đồng thời |
| Case quản lý | ADM-DEP-018, ADM-DEP-043, ADM-DEP-050, ADM-DEP-057, ADM-DEP-072 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p2` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` |

### tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị người dùng": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | ADM-USR-001, ADM-USR-005, ADM-USR-015 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts` |

### tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị người dùng": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | ADM-USR-002..ADM-USR-004, ADM-USR-010..ADM-USR-014, ADM-USR-021, ADM-USR-025..ADM-USR-028, ADM-USR-033..ADM-USR-037, ADM-USR-042..ADM-USR-045, ADM-USR-050..ADM-USR-052, ADM-USR-057, ADM-USR-061, ADM-USR-063 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` |

### tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị người dùng": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | ADM-USR-006..ADM-USR-007, ADM-USR-009, ADM-USR-016..ADM-USR-017, ADM-USR-019, ADM-USR-022, ADM-USR-024, ADM-USR-029..ADM-USR-030, ADM-USR-032, ADM-USR-038, ADM-USR-040, ADM-USR-046, ADM-USR-048, ADM-USR-053, ADM-USR-055, ADM-USR-058, ADM-USR-060, ADM-USR-064, ADM-USR-066 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` |

### tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị người dùng": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | ADM-USR-008, ADM-USR-018, ADM-USR-023, ADM-USR-031, ADM-USR-039, ADM-USR-047, ADM-USR-054, ADM-USR-059, ADM-USR-065 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p2` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` |

### tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị người dùng": gửi trùng, gửi đồng thời |
| Case quản lý | ADM-USR-020, ADM-USR-041, ADM-USR-049, ADM-USR-056 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` |

### tests/api/quan-tri-phan-quyen/nguoi-dung.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị người dùng": tải lên/tải về file, tích hợp dịch vụ ngoài |
| Case quản lý | ADM-USR-062 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/nguoi-dung.integration.spec.ts` |

### tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị vai trò, nhật ký và thiết lập": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | ADM-ROLE-001, ADM-ROLE-066, ADM-ROLE-081, ADM-ROLE-101 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` |

### tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị vai trò, nhật ký và thiết lập": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: ADM-ROLE-059 |
| Case quản lý | ADM-ROLE-002..ADM-ROLE-003, ADM-ROLE-006..ADM-ROLE-007, ADM-ROLE-012..ADM-ROLE-016, ADM-ROLE-022, ADM-ROLE-026..ADM-ROLE-028, ADM-ROLE-033..ADM-ROLE-036, ADM-ROLE-040..ADM-ROLE-042, ADM-ROLE-047..ADM-ROLE-049, ADM-ROLE-054, ADM-ROLE-058..ADM-ROLE-060, ADM-ROLE-065, ADM-ROLE-067..ADM-ROLE-068, ADM-ROLE-072..ADM-ROLE-074, ADM-ROLE-080, ADM-ROLE-082..ADM-ROLE-083, ADM-ROLE-087..ADM-ROLE-089, ADM-ROLE-094, ADM-ROLE-097..ADM-ROLE-100 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` |

### tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị vai trò, nhật ký và thiết lập": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | ADM-ROLE-004, ADM-ROLE-010, ADM-ROLE-019, ADM-ROLE-024, ADM-ROLE-031, ADM-ROLE-038, ADM-ROLE-044, ADM-ROLE-051, ADM-ROLE-056, ADM-ROLE-062, ADM-ROLE-070, ADM-ROLE-077, ADM-ROLE-085, ADM-ROLE-092, ADM-ROLE-095, ADM-ROLE-104 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` |

### tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị vai trò, nhật ký và thiết lập": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | ADM-ROLE-005, ADM-ROLE-008..ADM-ROLE-009, ADM-ROLE-011, ADM-ROLE-017..ADM-ROLE-018, ADM-ROLE-020, ADM-ROLE-023, ADM-ROLE-025, ADM-ROLE-029..ADM-ROLE-030, ADM-ROLE-032, ADM-ROLE-037, ADM-ROLE-039, ADM-ROLE-043, ADM-ROLE-045, ADM-ROLE-050, ADM-ROLE-052, ADM-ROLE-055, ADM-ROLE-057, ADM-ROLE-061, ADM-ROLE-063, ADM-ROLE-069, ADM-ROLE-071, ADM-ROLE-075..ADM-ROLE-076, ADM-ROLE-078, ADM-ROLE-084, ADM-ROLE-086, ADM-ROLE-090..ADM-ROLE-091, ADM-ROLE-093, ADM-ROLE-096, ADM-ROLE-102..ADM-ROLE-103, ADM-ROLE-105 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` |

### tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Quản trị vai trò, nhật ký và thiết lập": gửi trùng, gửi đồng thời |
| Case quản lý | ADM-ROLE-021, ADM-ROLE-046, ADM-ROLE-053, ADM-ROLE-064, ADM-ROLE-079 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-tri-phan-quyen`, `@p2` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` |

### tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | LEG-001, LEG-018 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-chang`, `@p1`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Quy tắc chặng tạo mới tiền tố "AT-{testRunId}"; phiếu mẫu để mô phỏng |
| Dọn dữ liệu | Vô hiệu rồi xóa quy tắc của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts` |

### tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | LEG-002..LEG-004, LEG-009..LEG-017, LEG-025, LEG-029..LEG-032, LEG-038..LEG-041, LEG-045, LEG-050..LEG-054, LEG-060..LEG-063 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-chang`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Quy tắc chặng tạo mới tiền tố "AT-{testRunId}"; phiếu mẫu để mô phỏng |
| Dọn dữ liệu | Vô hiệu rồi xóa quy tắc của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` |

### tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | LEG-005..LEG-006, LEG-008, LEG-019..LEG-021, LEG-023, LEG-026, LEG-028, LEG-033..LEG-035, LEG-037, LEG-042, LEG-044, LEG-046..LEG-047, LEG-049, LEG-055..LEG-056, LEG-058, LEG-064..LEG-065, LEG-067, LEG-069..LEG-073 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-chang`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Quy tắc chặng tạo mới tiền tố "AT-{testRunId}"; phiếu mẫu để mô phỏng |
| Dọn dữ liệu | Vô hiệu rồi xóa quy tắc của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` |

### tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | LEG-007, LEG-022, LEG-027, LEG-036, LEG-043, LEG-048, LEG-057, LEG-066 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-chang`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Quy tắc chặng tạo mới tiền tố "AT-{testRunId}"; phiếu mẫu để mô phỏng |
| Dọn dữ liệu | Vô hiệu rồi xóa quy tắc của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` |

### tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": gửi trùng, gửi đồng thời |
| Case quản lý | LEG-024, LEG-059, LEG-068 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-chang`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `testRun` |
| Dữ liệu cần có | Quy tắc chặng tạo mới tiền tố "AT-{testRunId}"; phiếu mẫu để mô phỏng |
| Dọn dữ liệu | Vô hiệu rồi xóa quy tắc của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts` |

### tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình đầu mục giá": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | CFG-001, CFG-003, CFG-050, CFG-061, CFG-068, CFG-083 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-dau-muc-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Đầu mục giá tiền tố "AT" cho 5 dịch vụ (FLOW-PRICE-001); nhà thầu NT_A, NT_B có sẵn |
| Dọn dữ liệu | Tắt kích hoạt đầu mục của lượt chạy khi không còn tham chiếu |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` |

### tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình đầu mục giá": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | CFG-002, CFG-006..CFG-007, CFG-010, CFG-014..CFG-015, CFG-020..CFG-026, CFG-034..CFG-041, CFG-047..CFG-049, CFG-051, CFG-058..CFG-060, CFG-062, CFG-066..CFG-067, CFG-072, CFG-077..CFG-078, CFG-082 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-dau-muc-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Đầu mục giá tiền tố "AT" cho 5 dịch vụ (FLOW-PRICE-001); nhà thầu NT_A, NT_B có sẵn |
| Dọn dữ liệu | Tắt kích hoạt đầu mục của lượt chạy khi không còn tham chiếu |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` |

### tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình đầu mục giá": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | CFG-004, CFG-008, CFG-012, CFG-018, CFG-031, CFG-045, CFG-056, CFG-064, CFG-070, CFG-075, CFG-080, CFG-085 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-dau-muc-gia`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Đầu mục giá tiền tố "AT" cho 5 dịch vụ (FLOW-PRICE-001); nhà thầu NT_A, NT_B có sẵn |
| Dọn dữ liệu | Tắt kích hoạt đầu mục của lượt chạy khi không còn tham chiếu |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` |

### tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình đầu mục giá": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | CFG-005, CFG-009, CFG-011, CFG-013, CFG-016..CFG-017, CFG-019, CFG-027..CFG-030, CFG-032, CFG-043..CFG-044, CFG-046, CFG-052..CFG-055, CFG-057, CFG-063, CFG-065, CFG-069, CFG-071, CFG-073..CFG-074, CFG-076, CFG-079, CFG-081, CFG-084, CFG-086..CFG-091 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-dau-muc-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Đầu mục giá tiền tố "AT" cho 5 dịch vụ (FLOW-PRICE-001); nhà thầu NT_A, NT_B có sẵn |
| Dọn dữ liệu | Tắt kích hoạt đầu mục của lượt chạy khi không còn tham chiếu |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` |

### tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Cấu hình đầu mục giá": gửi trùng, gửi đồng thời |
| Case quản lý | CFG-033, CFG-042 |
| Project chạy | `api` |
| Tag | `@api`, `@cau-hinh-dau-muc-gia`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Đầu mục giá tiền tố "AT" cho 5 dịch vụ (FLOW-PRICE-001); nhà thầu NT_A, NT_B có sẵn |
| Dọn dữ liệu | Tắt kích hoạt đầu mục của lượt chạy khi không còn tham chiếu |
| Lệnh chạy | `npx playwright test tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts` |

### tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tỷ giá Vietcombank và thông báo": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | COM-001, COM-017 |
| Project chạy | `api` |
| Tag | `@api`, `@lich-su-thong-bao`, `@p1` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Thao tác vừa thực hiện ở các module khác để sinh lịch sử, thông báo |
| Dọn dữ liệu | Đánh dấu đã đọc thông báo của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts` |

### tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tỷ giá Vietcombank và thông báo": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | COM-002..COM-003, COM-008..COM-009, COM-013, COM-016, COM-018..COM-019 |
| Project chạy | `api` |
| Tag | `@api`, `@lich-su-thong-bao`, `@p1`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Thao tác vừa thực hiện ở các module khác để sinh lịch sử, thông báo |
| Dọn dữ liệu | Đánh dấu đã đọc thông báo của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` |

### tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tỷ giá Vietcombank và thông báo": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | COM-005, COM-007, COM-010, COM-012, COM-015, COM-020, COM-022 |
| Project chạy | `api` |
| Tag | `@api`, `@lich-su-thong-bao`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Thao tác vừa thực hiện ở các module khác để sinh lịch sử, thông báo |
| Dọn dữ liệu | Đánh dấu đã đọc thông báo của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` |

### tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tỷ giá Vietcombank và thông báo": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | COM-006, COM-011, COM-014, COM-021 |
| Project chạy | `api` |
| Tag | `@api`, `@lich-su-thong-bao`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Thao tác vừa thực hiện ở các module khác để sinh lịch sử, thông báo |
| Dọn dữ liệu | Đánh dấu đã đọc thông báo của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` |

### tests/api/lich-su-thong-bao/ty-gia-thong-bao.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tỷ giá Vietcombank và thông báo": gửi trùng, gửi đồng thời |
| Case quản lý | COM-023 |
| Project chạy | `api` |
| Tag | `@api`, `@lich-su-thong-bao`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Thao tác vừa thực hiện ở các module khác để sinh lịch sử, thông báo |
| Dọn dữ liệu | Đánh dấu đã đọc thông báo của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/lich-su-thong-bao/ty-gia-thong-bao.concurrency.spec.ts` |

### tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | BGM-001, BGM-004, BGM-104, BGM-112, BGM-119, BGM-131, BGM-136 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dau-vao`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` |

### tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)" (phần bảng giá): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | BGM-002..BGM-003, BGM-009..BGM-015, BGM-022, BGM-025..BGM-026, BGM-029, BGM-033..BGM-036, BGM-042..BGM-045, BGM-071, BGM-076, BGM-124, BGM-129..BGM-130, BGM-135, BGM-141 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dau-vao`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` |

### tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)" (phần dòng giá): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: BGM-103 |
| Case quản lý | BGM-077..BGM-079, BGM-084..BGM-087, BGM-093..BGM-097, BGM-102..BGM-103, BGM-105, BGM-110..BGM-111, BGM-113, BGM-117..BGM-118, BGM-120 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dau-vao`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` |

### tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)" (phần kích hoạt / ngừng): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | BGM-049..BGM-053, BGM-058, BGM-062..BGM-066 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dau-vao`, `@p1`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` |

### tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | BGM-005..BGM-006, BGM-008, BGM-016..BGM-018, BGM-020, BGM-024, BGM-028, BGM-030, BGM-032, BGM-037..BGM-039, BGM-041, BGM-046, BGM-048, BGM-054, BGM-056, BGM-059, BGM-061, BGM-067, BGM-069, BGM-072..BGM-073, BGM-075, BGM-080..BGM-081, BGM-083, BGM-088..BGM-089, BGM-091, BGM-099, BGM-101, BGM-106, BGM-108, BGM-114, BGM-116, BGM-121, BGM-123, BGM-125..BGM-126, BGM-128, BGM-132, BGM-134, BGM-137..BGM-138, BGM-140, BGM-142..BGM-143 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dau-vao`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` |

### tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | BGM-007, BGM-019, BGM-023, BGM-027, BGM-031, BGM-040, BGM-047, BGM-055, BGM-060, BGM-068, BGM-074, BGM-082, BGM-090, BGM-100, BGM-107, BGM-115, BGM-122, BGM-127, BGM-133, BGM-139 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dau-vao`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` |

### tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": gửi trùng, gửi đồng thời |
| Case quản lý | BGM-021, BGM-057, BGM-070, BGM-092, BGM-098, BGM-109 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dau-vao`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` |

### tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua định mức (SBP)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | SBP-001 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dinh-muc`, `@p1` |
| Fixture dùng | `ccApi`, `dpApi`, `testRun` |
| Dữ liệu cần có | Định mức sinh từ bảng giá NT_A/NT_B đã kích hoạt (bộ giá P0) |
| Dọn dữ liệu | Không xóa được định mức; trả giá về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.security.spec.ts` |

### tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua định mức (SBP)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: SBP-031 |
| Case quản lý | SBP-002..SBP-003, SBP-007..SBP-009, SBP-014, SBP-018, SBP-020..SBP-024, SBP-028..SBP-031, SBP-036, SBP-040..SBP-042, SBP-046, SBP-051..SBP-054 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dinh-muc`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `dpApi`, `testRun` |
| Dữ liệu cần có | Định mức sinh từ bảng giá NT_A/NT_B đã kích hoạt (bộ giá P0) |
| Dọn dữ liệu | Không xóa được định mức; trả giá về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` |

### tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua định mức (SBP)": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | SBP-004, SBP-006, SBP-010..SBP-011, SBP-013, SBP-015, SBP-017, SBP-019, SBP-025, SBP-027, SBP-032..SBP-033, SBP-035, SBP-037, SBP-039, SBP-043, SBP-045, SBP-047..SBP-048, SBP-050 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dinh-muc`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `testRun` |
| Dữ liệu cần có | Định mức sinh từ bảng giá NT_A/NT_B đã kích hoạt (bộ giá P0) |
| Dọn dữ liệu | Không xóa được định mức; trả giá về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` |

### tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá mua định mức (SBP)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | SBP-005, SBP-012, SBP-016, SBP-026, SBP-034, SBP-038, SBP-044, SBP-049 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-mua-dinh-muc`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `testRun` |
| Dữ liệu cần có | Định mức sinh từ bảng giá NT_A/NT_B đã kích hoạt (bộ giá P0) |
| Dọn dữ liệu | Không xóa được định mức; trả giá về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` |

### tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá bán định mức (SSP)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | SSP-001 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-ban-dinh-muc`, `@p1` |
| Fixture dùng | `ccApi`, `dpApi`, `testRun` |
| Dữ liệu cần có | Giá mua định mức P0 đã có; giá bán P0 |
| Dọn dữ liệu | Trả giá bán về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.security.spec.ts` |

### tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá bán định mức (SSP)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | SSP-002, SSP-006..SSP-008, SSP-013, SSP-017..SSP-023, SSP-028..SSP-031, SSP-036..SSP-038, SSP-043, SSP-048 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-ban-dinh-muc`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `testRun` |
| Dữ liệu cần có | Giá mua định mức P0 đã có; giá bán P0 |
| Dọn dữ liệu | Trả giá bán về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` |

### tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá bán định mức (SSP)": dữ liệu vào sai, giá trị biên, xử lý lỗi. Case gắn [Chờ xác nhận]: SSP-025, SSP-033 |
| Case quản lý | SSP-003, SSP-005, SSP-009..SSP-010, SSP-012, SSP-014, SSP-016, SSP-024..SSP-025, SSP-027, SSP-032..SSP-033, SSP-035, SSP-039, SSP-041, SSP-044..SSP-045, SSP-047 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-ban-dinh-muc`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `dpApi`, `testRun` |
| Dữ liệu cần có | Giá mua định mức P0 đã có; giá bán P0 |
| Dọn dữ liệu | Trả giá bán về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` |

### tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá bán định mức (SSP)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | SSP-004, SSP-011, SSP-015, SSP-026, SSP-034, SSP-040, SSP-046 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-ban-dinh-muc`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `testRun` |
| Dữ liệu cần có | Giá mua định mức P0 đã có; giá bán P0 |
| Dọn dữ liệu | Trả giá bán về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` |

### tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Giá bán định mức (SSP)": gửi trùng, gửi đồng thời |
| Case quản lý | SSP-042 |
| Project chạy | `api` |
| Tag | `@api`, `@gia-ban-dinh-muc`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `testRun` |
| Dữ liệu cần có | Giá mua định mức P0 đã có; giá bán P0 |
| Dọn dữ liệu | Trả giá bán về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.concurrency.spec.ts` |

### tests/api/quan-ly-bao-gia/ycbg.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Yêu cầu báo giá (YCBG/RFQ)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | RFQ-001, RFQ-003, RFQ-015, RFQ-017, RFQ-033, RFQ-040, RFQ-052, RFQ-060, RFQ-081, RFQ-090, RFQ-099, RFQ-105, RFQ-111, RFQ-120, RFQ-131 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1bApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` |

### tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Yêu cầu báo giá (YCBG/RFQ)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | RFQ-002, RFQ-004..RFQ-005, RFQ-010..RFQ-014, RFQ-016, RFQ-026, RFQ-029, RFQ-032, RFQ-037..RFQ-039, RFQ-041, RFQ-049..RFQ-051, RFQ-053, RFQ-097, RFQ-103..RFQ-104, RFQ-106, RFQ-110, RFQ-116, RFQ-126, RFQ-130, RFQ-132 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` |

### tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Yêu cầu báo giá (YCBG/RFQ)" (phần chuyển trạng thái): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | RFQ-057..RFQ-059, RFQ-061, RFQ-066..RFQ-068, RFQ-070, RFQ-087..RFQ-089, RFQ-091, RFQ-117..RFQ-119, RFQ-121 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` |

### tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Yêu cầu báo giá (YCBG/RFQ)" (phần BGNB tự động): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: RFQ-140..RFQ-141 |
| Case quản lý | RFQ-075..RFQ-080, RFQ-082, RFQ-137..RFQ-142 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` |

### tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Yêu cầu báo giá (YCBG/RFQ)": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | RFQ-006..RFQ-007, RFQ-009, RFQ-018..RFQ-022, RFQ-024, RFQ-028, RFQ-031, RFQ-034, RFQ-036, RFQ-042..RFQ-046, RFQ-048, RFQ-054, RFQ-056, RFQ-062, RFQ-064, RFQ-071, RFQ-073, RFQ-083, RFQ-085, RFQ-092..RFQ-093, RFQ-095, RFQ-100, RFQ-102, RFQ-107, RFQ-109, RFQ-112..RFQ-113, RFQ-115, RFQ-122, RFQ-124, RFQ-133, RFQ-135, RFQ-143..RFQ-147, RFQ-149 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` |

### tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Yêu cầu báo giá (YCBG/RFQ)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | RFQ-008, RFQ-023, RFQ-027, RFQ-030, RFQ-035, RFQ-047, RFQ-055, RFQ-063, RFQ-072, RFQ-084, RFQ-094, RFQ-101, RFQ-108, RFQ-114, RFQ-123, RFQ-134 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` |

### tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Yêu cầu báo giá (YCBG/RFQ)": gửi trùng, gửi đồng thời |
| Case quản lý | RFQ-025, RFQ-065, RFQ-069, RFQ-074, RFQ-086, RFQ-096, RFQ-125, RFQ-136 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` |

### tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Yêu cầu báo giá (YCBG/RFQ)": tải lên/tải về file, tích hợp dịch vụ ngoài |
| Case quản lý | RFQ-098, RFQ-127..RFQ-129, RFQ-148 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` |

### tests/api/quan-ly-bao-gia/bgnb.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | IPS-001, IPS-004, IPS-016, IPS-097, IPS-103, IPS-112, IPS-121, IPS-131 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` |

### tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: IPS-049 |
| Case quản lý | IPS-002..IPS-003, IPS-009..IPS-015, IPS-024..IPS-026, IPS-030..IPS-031, IPS-035, IPS-039, IPS-042, IPS-046..IPS-050, IPS-057..IPS-059, IPS-063, IPS-068 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` |

### tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG" (phần phát hành / thu hồi / đồng bộ giá): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | IPS-069..IPS-073, IPS-078..IPS-081, IPS-087..IPS-091 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` |

### tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG" (phần lập BGNB theo YCBG): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | IPS-096, IPS-101..IPS-102, IPS-104, IPS-109..IPS-111, IPS-113, IPS-118..IPS-120, IPS-122, IPS-128..IPS-130, IPS-132 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` |

### tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | IPS-005..IPS-006, IPS-008, IPS-017..IPS-020, IPS-022, IPS-027, IPS-029, IPS-032, IPS-034, IPS-036, IPS-038, IPS-041, IPS-043, IPS-045, IPS-051..IPS-054, IPS-056, IPS-060, IPS-062, IPS-064..IPS-065, IPS-067, IPS-074, IPS-076, IPS-082..IPS-083, IPS-085, IPS-092, IPS-094, IPS-098, IPS-100, IPS-105, IPS-107, IPS-114..IPS-115, IPS-117, IPS-123..IPS-124, IPS-126, IPS-133, IPS-135 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` |

### tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | IPS-007, IPS-021, IPS-028, IPS-033, IPS-037, IPS-040, IPS-044, IPS-055, IPS-061, IPS-066, IPS-075, IPS-084, IPS-093, IPS-099, IPS-106, IPS-116, IPS-125, IPS-134 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` |

### tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": gửi trùng, gửi đồng thời |
| Case quản lý | IPS-023, IPS-077, IPS-086, IPS-095, IPS-108, IPS-127, IPS-136 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` |

### tests/api/quan-ly-bao-gia/bgkh.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá khách hàng (BGKH/RC)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | RC-001, RC-006, RC-014, RC-023, RC-031, RC-042, RC-054, RC-062, RC-070, RC-081, RC-090, RC-101, RC-111, RC-119, RC-124, RC-131, RC-136 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1bApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` |

### tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá khách hàng (BGKH/RC)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: RC-029 |
| Case quản lý | RC-002..RC-005, RC-007, RC-012..RC-013, RC-019, RC-022, RC-027, RC-029..RC-030, RC-032, RC-037..RC-041, RC-043, RC-117, RC-123, RC-129..RC-130, RC-135 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` |

### tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá khách hàng (BGKH/RC)" (phần gộp đầu mục): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | RC-048..RC-053, RC-055, RC-061, RC-063..RC-064, RC-068..RC-069, RC-071 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` |

### tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá khách hàng (BGKH/RC)" (phần chuyển trạng thái): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | RC-076..RC-080, RC-082, RC-087..RC-089, RC-091, RC-097..RC-100, RC-102, RC-108..RC-110, RC-112 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` |

### tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá khách hàng (BGKH/RC)": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | RC-008, RC-010, RC-015..RC-016, RC-018, RC-021, RC-024, RC-026, RC-028, RC-033..RC-034, RC-036, RC-044..RC-045, RC-047, RC-056..RC-057, RC-059, RC-065, RC-067, RC-072, RC-074, RC-083, RC-085, RC-092..RC-093, RC-095, RC-103..RC-104, RC-106, RC-113, RC-115, RC-120, RC-122, RC-125..RC-126, RC-128, RC-132, RC-134, RC-137, RC-139..RC-144 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` |

### tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá khách hàng (BGKH/RC)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | RC-009, RC-017, RC-020, RC-025, RC-035, RC-046, RC-058, RC-066, RC-073, RC-084, RC-094, RC-105, RC-114, RC-121, RC-127, RC-133, RC-138 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` |

### tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá khách hàng (BGKH/RC)": gửi trùng, gửi đồng thời |
| Case quản lý | RC-011, RC-060, RC-075, RC-086, RC-096, RC-107, RC-116 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` |

### tests/api/quan-ly-bao-gia/bgkh.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Báo giá khách hàng (BGKH/RC)": tải lên/tải về file, tích hợp dịch vụ ngoài |
| Case quản lý | RC-118 |
| Project chạy | `api` |
| Tag | `@api`, `@quan-ly-bao-gia`, `@p1` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/quan-ly-bao-gia/bgkh.integration.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | ORD-001, ORD-011, ORD-025, ORD-027, ORD-036, ORD-044, ORD-055, ORD-063, ORD-074, ORD-084, ORD-095, ORD-103, ORD-115, ORD-124, ORD-131, ORD-140, ORD-146, ORD-154, ORD-160, ORD-166, ORD-174, ORD-182, ORD-188, ORD-194, ORD-200, ORD-207, ORD-214, ORD-220 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1bApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)" (phần phiếu): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | ORD-002..ORD-004, ORD-007, ORD-010, ORD-012..ORD-013, ORD-018..ORD-024, ORD-026, ORD-035, ORD-037, ORD-041..ORD-043, ORD-045, ORD-052..ORD-054, ORD-056, ORD-145, ORD-151, ORD-213, ORD-218..ORD-219, ORD-221 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)" (phần chuyển trạng thái): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | ORD-060..ORD-062, ORD-064, ORD-069..ORD-073, ORD-075, ORD-081..ORD-083, ORD-085 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)" (phần doanh thu, xác nhận doanh thu): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: ORD-130 |
| Case quản lý | ORD-090..ORD-094, ORD-099..ORD-102, ORD-104, ORD-109..ORD-114, ORD-116, ORD-121..ORD-123, ORD-128..ORD-130, ORD-135..ORD-138, ORD-233 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)" (phần chứng từ và xe): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | ORD-152, ORD-158..ORD-159, ORD-161, ORD-165, ORD-170, ORD-173, ORD-175, ORD-180, ORD-186, ORD-192..ORD-193, ORD-195, ORD-199, ORD-204, ORD-206, ORD-208 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | ORD-005, ORD-008, ORD-016, ORD-032, ORD-039, ORD-050, ORD-058, ORD-066, ORD-078, ORD-087, ORD-097, ORD-107, ORD-119, ORD-126, ORD-133, ORD-142, ORD-149, ORD-156, ORD-163, ORD-168, ORD-177, ORD-184, ORD-190, ORD-197, ORD-202, ORD-210, ORD-216, ORD-224 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)" (phần phiếu): dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | ORD-006, ORD-009, ORD-014..ORD-015, ORD-017, ORD-028..ORD-031, ORD-033, ORD-038, ORD-040, ORD-046..ORD-049, ORD-051, ORD-057, ORD-059, ORD-147..ORD-148, ORD-150, ORD-215, ORD-217, ORD-222..ORD-223, ORD-225 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)" (phần chuyển trạng thái): dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | ORD-065, ORD-067, ORD-076..ORD-077, ORD-079, ORD-086, ORD-088, ORD-227..ORD-231 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)" (phần doanh thu, xác nhận doanh thu): dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | ORD-096, ORD-098, ORD-105..ORD-106, ORD-108, ORD-117..ORD-118, ORD-120, ORD-125, ORD-127, ORD-132, ORD-134, ORD-141, ORD-143 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)" (phần chứng từ và xe): dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | ORD-155, ORD-157, ORD-162, ORD-164, ORD-167, ORD-169, ORD-176, ORD-178, ORD-183, ORD-185, ORD-189, ORD-191, ORD-196, ORD-198, ORD-201, ORD-203, ORD-209, ORD-211 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)": gửi trùng, gửi đồng thời |
| Case quản lý | ORD-034, ORD-068, ORD-080, ORD-089, ORD-139, ORD-144, ORD-179, ORD-212, ORD-226 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p2` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` |

### tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Phiếu dịch vụ (Khối 1)": tải lên/tải về file, tích hợp dịch vụ ngoài |
| Case quản lý | ORD-153, ORD-171..ORD-172, ORD-181, ORD-187, ORD-205, ORD-232 |
| Project chạy | `api` |
| Tag | `@api`, `@phieu-dich-vu`, `@p1` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` |

### tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | PNL-001, PNL-008, PNL-015, PNL-028 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1bApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` |

### tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: PNL-003 |
| Case quản lý | PNL-002..PNL-007, PNL-012, PNL-014, PNL-019, PNL-023..PNL-027, PNL-029 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `ccApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` |

### tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | PNL-009, PNL-011, PNL-016, PNL-018, PNL-020, PNL-022, PNL-030..PNL-032, PNL-034 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` |

### tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | PNL-010, PNL-017, PNL-021, PNL-033 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p2` |
| Fixture dùng | `ccApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` |

### tests/api/chi-phi-doanh-thu/pnl-phieu.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": tải lên/tải về file, tích hợp dịch vụ ngoài |
| Case quản lý | PNL-013 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p1` |
| Fixture dùng | `ccApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/pnl-phieu.integration.spec.ts` |

### tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | CR-001, CR-007 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p1` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts` |

### tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | CR-002..CR-006, CR-012..CR-014, CR-018, CR-021, CR-024, CR-026..CR-027, CR-029..CR-030, CR-034, CR-040 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` |

### tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | CR-008..CR-009, CR-011, CR-015, CR-017, CR-020, CR-023, CR-032, CR-037, CR-039, CR-043, CR-045 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` |

### tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | CR-010, CR-016, CR-019, CR-022, CR-031, CR-038, CR-044 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` |

### tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": tải lên/tải về file, tích hợp dịch vụ ngoài |
| Case quản lý | CR-025 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p1` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.integration.spec.ts` |

### tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Màn Chi phí – Doanh thu (báo cáo quản trị)": gửi trùng, gửi đồng thời |
| Case quản lý | CR-033 |
| Project chạy | `api` |
| Tag | `@api`, `@chi-phi-doanh-thu`, `@p2` |
| Fixture dùng | `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.concurrency.spec.ts` |

### tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — phiếu dịch vụ (CC)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | K3O-001, K3O-003, K3O-018, K3O-063, K3O-069 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p3` |
| Fixture dùng | `ccApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` |

### tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — phiếu dịch vụ (CC)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | K3O-002, K3O-004..K3O-005, K3O-010..K3O-011, K3O-014, K3O-017, K3O-019, K3O-023..K3O-026, K3O-031..K3O-034, K3O-040, K3O-044..K3O-049, K3O-055, K3O-060..K3O-061, K3O-067 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` |

### tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — phiếu dịch vụ (CC)": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | K3O-006..K3O-007, K3O-009, K3O-013, K3O-016, K3O-020, K3O-022, K3O-027, K3O-029, K3O-035..K3O-036, K3O-038, K3O-041, K3O-043, K3O-050..K3O-051, K3O-053, K3O-056..K3O-057, K3O-059, K3O-064, K3O-066, K3O-070, K3O-072 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` |

### tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — phiếu dịch vụ (CC)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | K3O-008, K3O-012, K3O-015, K3O-021, K3O-028, K3O-037, K3O-042, K3O-052, K3O-058, K3O-065, K3O-071 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` |

### tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — phiếu dịch vụ (CC)": gửi trùng, gửi đồng thời |
| Case quản lý | K3O-030, K3O-039, K3O-054 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p2` |
| Fixture dùng | `ccApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts` |

### tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — phiếu dịch vụ (CC)": tải lên/tải về file, tích hợp dịch vụ ngoài |
| Case quản lý | K3O-062, K3O-068 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1` |
| Fixture dùng | `ccApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts` |

### tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | K3S-001, K3S-004, K3S-014, K3S-029, K3S-037, K3S-043, K3S-048, K3S-057, K3S-070, K3S-080, K3S-089, K3S-095, K3S-111, K3S-113, K3S-127, K3S-135, K3S-143, K3S-151, K3S-157 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` |

### tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)" (phần điều phối nhà thầu): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: K3S-012, K3S-066, K3S-085 |
| Case quản lý | K3S-002..K3S-003, K3S-008..K3S-013, K3S-015, K3S-019..K3S-020, K3S-024..K3S-028, K3S-030, K3S-066, K3S-085 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p2`, `@cho-xac-nhan` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` |

### tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)" (phần chi phí dịch vụ): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu. Case gắn [Chờ xác nhận]: K3S-081 |
| Case quản lý | K3S-035..K3S-036, K3S-041..K3S-042, K3S-047, K3S-052..K3S-056, K3S-058, K3S-067..K3S-069, K3S-071, K3S-077..K3S-078, K3S-081, K3S-086..K3S-088, K3S-173 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p2`, `@p3`, `@cho-xac-nhan` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` |

### tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)" (phần thông tin thực tế, hoàn thành, chứng từ): chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | K3S-093..K3S-094, K3S-096, K3S-101, K3S-105..K3S-110, K3S-112, K3S-118, K3S-122..K3S-126, K3S-128, K3S-133..K3S-134, K3S-139, K3S-142, K3S-144, K3S-149, K3S-155..K3S-156, K3S-158, K3S-162..K3S-170 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` |

### tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": dữ liệu vào sai, giá trị biên, xử lý lỗi. Case gắn [Chờ xác nhận]: K3S-074 |
| Case quản lý | K3S-005, K3S-007, K3S-016, K3S-018, K3S-021, K3S-023, K3S-031, K3S-033, K3S-038, K3S-040, K3S-044, K3S-046, K3S-049, K3S-051, K3S-059..K3S-062, K3S-064, K3S-072..K3S-074, K3S-076, K3S-082, K3S-084, K3S-090, K3S-092, K3S-097..K3S-098, K3S-100, K3S-102, K3S-104, K3S-114..K3S-115, K3S-117, K3S-119, K3S-121, K3S-129, K3S-131, K3S-136, K3S-138, K3S-145, K3S-147, K3S-152, K3S-154, K3S-159, K3S-161 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p2`, `@cho-xac-nhan` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` |

### tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | K3S-006, K3S-017, K3S-022, K3S-032, K3S-039, K3S-045, K3S-050, K3S-063, K3S-075, K3S-083, K3S-091, K3S-099, K3S-103, K3S-116, K3S-120, K3S-130, K3S-137, K3S-146, K3S-153, K3S-160 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p2`, `@p3` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` |

### tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": gửi trùng, gửi đồng thời |
| Case quản lý | K3S-034, K3S-065, K3S-132, K3S-148, K3S-171 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p2` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` |

### tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": tải lên/tải về file, tích hợp dịch vụ ngoài |
| Case quản lý | K3S-140..K3S-141, K3S-150, K3S-172 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` |

### tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — thao tác ngoại lệ": xác thực, phân quyền, truy cập chéo (IDOR), dữ liệu độc hại |
| Case quản lý | K3X-001, K3X-038, K3X-049 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p3` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts` |

### tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — thao tác ngoại lệ": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | K3X-032, K3X-036..K3X-037, K3X-039, K3X-046..K3X-048, K3X-050 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `dpApi`, `k1Api`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` |

### tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — thao tác ngoại lệ": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | K3X-033, K3X-035, K3X-040..K3X-042, K3X-044, K3X-051..K3X-053, K3X-055 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p1`, `@p2` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` |

### tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — thao tác ngoại lệ": cấu trúc phản hồi so với schema Swagger |
| Case quản lý | K3X-034, K3X-043, K3X-054 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p2`, `@p3` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts` |

### tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | API "Tháp điều phối — thao tác ngoại lệ": gửi trùng, gửi đồng thời. Case gắn [Chờ xác nhận]: K3X-045 |
| Case quản lý | K3X-045, K3X-056 |
| Project chạy | `api` |
| Tag | `@api`, `@thap-dieu-phoi`, `@p2`, `@cho-xac-nhan` |
| Fixture dùng | `dpApi`, `testRun` |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts` |

### tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Đăng nhập và phiên làm việc": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-LOGIN-001..UI-LOGIN-002, UI-LOGIN-005 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-tri-phan-quyen`, `@p1`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts` |

### tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Đăng nhập và phiên làm việc": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-LOGIN-003..UI-LOGIN-004, UI-LOGIN-011 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-tri-phan-quyen`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts` |

### tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Đăng nhập và phiên làm việc": phân quyền giao diện và phiên |
| Case quản lý | UI-LOGIN-006..UI-LOGIN-009 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-tri-phan-quyen`, `@p1`, `@p2` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` |

### tests/ui/quan-tri-phan-quyen/dang-nhap.a11y.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Đăng nhập và phiên làm việc": khả năng truy cập (axe) |
| Case quản lý | UI-LOGIN-010 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-tri-phan-quyen`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-tri-phan-quyen/dang-nhap.a11y.spec.ts` |

### tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Phân quyền (Bộ phận, Vai trò, Người dùng)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-ADM-001..UI-ADM-003, UI-ADM-006..UI-ADM-008, UI-ADM-012..UI-ADM-014, UI-ADM-016 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-tri-phan-quyen`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` |

### tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Phân quyền (Bộ phận, Vai trò, Người dùng)": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-ADM-004..UI-ADM-005, UI-ADM-009..UI-ADM-011, UI-ADM-015 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-tri-phan-quyen`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` |

### tests/ui/quan-tri-phan-quyen/phan-quyen.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Phân quyền (Bộ phận, Vai trò, Người dùng)": phân quyền giao diện và phiên |
| Case quản lý | UI-ADM-017 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-tri-phan-quyen`, `@p1` |
| Fixture dùng | `adminApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Tài khoản ADMIN; bộ phận, vai trò, người dùng tạo mới có tiền tố "AT-{testRunId}" |
| Dọn dữ liệu | Xóa/vô hiệu vai trò, bộ phận, người dùng có tiền tố của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-tri-phan-quyen/phan-quyen.access.spec.ts` |

### tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Cấu hình chặng": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-LEG-001..UI-LEG-004, UI-LEG-007..UI-LEG-012, UI-LEG-014..UI-LEG-015, UI-LEG-017..UI-LEG-018 |
| Project chạy | `ui` |
| Tag | `@ui`, `@cau-hinh-chang`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `ccApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Quy tắc chặng tạo mới tiền tố "AT-{testRunId}"; phiếu mẫu để mô phỏng |
| Dọn dữ liệu | Vô hiệu rồi xóa quy tắc của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` |

### tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Cấu hình chặng": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-LEG-005..UI-LEG-006, UI-LEG-013, UI-LEG-016 |
| Project chạy | `ui` |
| Tag | `@ui`, `@cau-hinh-chang`, `@p2`, `@p3` |
| Fixture dùng | `adminApi`, `ccApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Quy tắc chặng tạo mới tiền tố "AT-{testRunId}"; phiếu mẫu để mô phỏng |
| Dọn dữ liệu | Vô hiệu rồi xóa quy tắc của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` |

### tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Cấu hình đầu mục giá": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-CFG-001..UI-CFG-008, UI-CFG-013 |
| Project chạy | `ui` |
| Tag | `@ui`, `@cau-hinh-dau-muc-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Đầu mục giá tiền tố "AT" cho 5 dịch vụ (FLOW-PRICE-001); nhà thầu NT_A, NT_B có sẵn |
| Dọn dữ liệu | Tắt kích hoạt đầu mục của lượt chạy khi không còn tham chiếu |
| Lệnh chạy | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` |

### tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Cấu hình đầu mục giá": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-CFG-009..UI-CFG-012 |
| Project chạy | `ui` |
| Tag | `@ui`, `@cau-hinh-dau-muc-gia`, `@p2` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Đầu mục giá tiền tố "AT" cho 5 dịch vụ (FLOW-PRICE-001); nhà thầu NT_A, NT_B có sẵn |
| Dọn dữ liệu | Tắt kích hoạt đầu mục của lượt chạy khi không còn tham chiếu |
| Lệnh chạy | `npx playwright test tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` |

### tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Giá mua đầu vào": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-BGM-001..UI-BGM-007, UI-BGM-009..UI-BGM-011, UI-BGM-013..UI-BGM-021 |
| Project chạy | `ui` |
| Tag | `@ui`, `@gia-mua-dau-vao`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` |

### tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Giá mua đầu vào": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-BGM-008, UI-BGM-012, UI-BGM-022 |
| Project chạy | `ui` |
| Tag | `@ui`, `@gia-mua-dau-vao`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | NT_A (VND), NT_B (USD) Đang hoạt động, HĐ hiệu lực; bảng giá theo bộ giá P0 |
| Dọn dữ liệu | Ngừng hoạt động bảng giá của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts` |

### tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Giá mua định mức": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-SBP-001..UI-SBP-006, UI-SBP-009..UI-SBP-012, UI-SBP-014..UI-SBP-015 |
| Project chạy | `ui` |
| Tag | `@ui`, `@gia-mua-dinh-muc`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Định mức sinh từ bảng giá NT_A/NT_B đã kích hoạt (bộ giá P0) |
| Dọn dữ liệu | Không xóa được định mức; trả giá về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` |

### tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Giá mua định mức": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-SBP-007..UI-SBP-008 |
| Project chạy | `ui` |
| Tag | `@ui`, `@gia-mua-dinh-muc`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Định mức sinh từ bảng giá NT_A/NT_B đã kích hoạt (bộ giá P0) |
| Dọn dữ liệu | Không xóa được định mức; trả giá về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` |

### tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Giá mua định mức": phân quyền giao diện và phiên |
| Case quản lý | UI-SBP-013 |
| Project chạy | `ui` |
| Tag | `@ui`, `@gia-mua-dinh-muc`, `@p1` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Định mức sinh từ bảng giá NT_A/NT_B đã kích hoạt (bộ giá P0) |
| Dọn dữ liệu | Không xóa được định mức; trả giá về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.access.spec.ts` |

### tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Giá bán định mức": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-SSP-001..UI-SSP-002, UI-SSP-004..UI-SSP-007, UI-SSP-010 |
| Project chạy | `ui` |
| Tag | `@ui`, `@gia-ban-dinh-muc`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Giá mua định mức P0 đã có; giá bán P0 |
| Dọn dữ liệu | Trả giá bán về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` |

### tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Giá bán định mức": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-SSP-003, UI-SSP-008..UI-SSP-009 |
| Project chạy | `ui` |
| Tag | `@ui`, `@gia-ban-dinh-muc`, `@p1`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Giá mua định mức P0 đã có; giá bán P0 |
| Dọn dữ liệu | Trả giá bán về giá trị P0 sau case đổi giá |
| Lệnh chạy | `npx playwright test tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` |

### tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Yêu cầu báo giá": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-RFQ-001, UI-RFQ-003..UI-RFQ-005, UI-RFQ-007..UI-RFQ-008, UI-RFQ-011..UI-RFQ-013, UI-RFQ-016 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` |

### tests/ui/quan-ly-bao-gia/ycbg.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Yêu cầu báo giá": phân quyền giao diện và phiên |
| Case quản lý | UI-RFQ-002 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-ly-bao-gia`, `@p1` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.access.spec.ts` |

### tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Yêu cầu báo giá": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-RFQ-006, UI-RFQ-009..UI-RFQ-010, UI-RFQ-014..UI-RFQ-015 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-ly-bao-gia`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` |

### tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Báo giá nội bộ": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-IPS-001..UI-IPS-006, UI-IPS-009..UI-IPS-014 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` |

### tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Báo giá nội bộ": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-IPS-007..UI-IPS-008 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-ly-bao-gia`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts` |

### tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Báo giá khách hàng": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-RC-001..UI-RC-006, UI-RC-008..UI-RC-011, UI-RC-013..UI-RC-014 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-ly-bao-gia`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` |

### tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Báo giá khách hàng": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-RC-007, UI-RC-012, UI-RC-015..UI-RC-016 |
| Project chạy | `ui` |
| Tag | `@ui`, `@quan-ly-bao-gia`, `@p2`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` |

### tests/ui/quan-ly-bao-gia/bgkh.visual.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Báo giá khách hàng": so sánh ảnh giao diện |
| Case quản lý | UI-RC-017 |
| Project chạy | `visual` |
| Tag | `@ui`, `@quan-ly-bao-gia`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | KH_A có HĐ hiệu lực; YCBG, BGNB, BGKH tạo theo bộ giá P0 (BGNB 15.700.000; BGKH 15.650.000 + VAT 8%) |
| Dọn dữ liệu | Hủy YCBG, thu hồi BGNB, ngưng BGKH của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/quan-ly-bao-gia/bgkh.visual.spec.ts` |

### tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Phiếu dịch vụ (Khối 1)": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-ORD-001..UI-ORD-006, UI-ORD-008..UI-ORD-013, UI-ORD-017..UI-ORD-019 |
| Project chạy | `ui` |
| Tag | `@ui`, `@phieu-dich-vu`, `@p1`, `@p2` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` |

### tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Phiếu dịch vụ (Khối 1)": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-ORD-007, UI-ORD-014..UI-ORD-015, UI-ORD-020 |
| Project chạy | `ui` |
| Tag | `@ui`, `@phieu-dich-vu`, `@p1`, `@p2` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` |

### tests/ui/phieu-dich-vu/phieu-dich-vu.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Phiếu dịch vụ (Khối 1)": phân quyền giao diện và phiên |
| Case quản lý | UI-ORD-016 |
| Project chạy | `ui` |
| Tag | `@ui`, `@phieu-dich-vu`, `@p1` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | RC Đang hiệu lực mặc định của KH_A; phiếu đủ 5 dịch vụ (P0); K1 phụ trách KH_A, K1B không phụ trách |
| Dọn dữ liệu | Hủy phiếu chưa bắt đầu; phiếu đã chạy giữ lại, gắn testRunId để lọc |
| Lệnh chạy | `npx playwright test tests/ui/phieu-dich-vu/phieu-dich-vu.access.spec.ts` |

### tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Tháp điều phối": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-K3-001..UI-K3-002, UI-K3-004..UI-K3-010, UI-K3-012 |
| Project chạy | `ui` |
| Tag | `@ui`, `@thap-dieu-phoi`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` |

### tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Tháp điều phối": phân quyền giao diện và phiên |
| Case quản lý | UI-K3-003, UI-K3-015 |
| Project chạy | `ui` |
| Tag | `@ui`, `@thap-dieu-phoi`, `@p1`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts` |

### tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Tháp điều phối": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-K3-011, UI-K3-014 |
| Project chạy | `ui` |
| Tag | `@ui`, `@thap-dieu-phoi`, `@p2` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts` |

### tests/ui/thap-dieu-phoi/thap-dieu-phoi.responsive.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Tháp điều phối": hiển thị trên tablet/di động |
| Case quản lý | UI-K3-013 |
| Project chạy | `responsive` |
| Tag | `@ui`, `@thap-dieu-phoi`, `@p3` |
| Fixture dùng | `ccApi`, `dpApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Phiếu P0 đã gửi; tài khoản CC_K5 và DP_K2 (hoặc DP theo từng dịch vụ); chứng từ mẫu `REAL.pdf10` |
| Dọn dữ liệu | Không xóa phiếu đã điều phối; chỉ xóa chi phí phụ phí/phát sinh của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/thap-dieu-phoi/thap-dieu-phoi.responsive.spec.ts` |

### tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-PNL-001..UI-PNL-003, UI-PNL-005..UI-PNL-007, UI-PNL-010..UI-PNL-013 |
| Project chạy | `ui` |
| Tag | `@ui`, `@chi-phi-doanh-thu`, `@p1`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` |

### tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu": dữ liệu vào sai, giá trị biên, xử lý lỗi |
| Case quản lý | UI-PNL-004, UI-PNL-008..UI-PNL-009, UI-PNL-015 |
| Project chạy | `ui` |
| Tag | `@ui`, `@chi-phi-doanh-thu`, `@p2`, `@p3` |
| Fixture dùng | `ccApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` |

### tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.a11y.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu": khả năng truy cập (axe) |
| Case quản lý | UI-PNL-014 |
| Project chạy | `ui` |
| Tag | `@ui`, `@chi-phi-doanh-thu`, `@p3` |
| Fixture dùng | `ccApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.a11y.spec.ts` |

### tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.access.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu": phân quyền giao diện và phiên |
| Case quản lý | UI-PNL-016 |
| Project chạy | `ui` |
| Tag | `@ui`, `@chi-phi-doanh-thu`, `@p1` |
| Fixture dùng | `ccApi`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Phiếu P0 Đã thực hiện (doanh thu 15.900.000, chi phí 14.000.000, tỷ giá 25.000); P1 để lọc/xuất |
| Dọn dữ liệu | Không ghi dữ liệu nền; file xuất lưu ở thư mục kết quả |
| Lệnh chạy | `npx playwright test tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.access.spec.ts` |

### tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Thông báo trong hệ thống": chức năng, quy tắc nghiệp vụ, chuyển trạng thái, toàn vẹn dữ liệu |
| Case quản lý | UI-NTF-001..UI-NTF-002 |
| Project chạy | `ui` |
| Tag | `@ui`, `@lich-su-thong-bao`, `@p2` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Thao tác vừa thực hiện ở các module khác để sinh lịch sử, thông báo |
| Dọn dữ liệu | Đánh dấu đã đọc thông báo của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts` |

### tests/ui/lich-su-thong-bao/thong-bao.visual.spec.ts

| Trường | Nội dung |
| --- | --- |
| Mục đích | Màn hình "Thông báo trong hệ thống": so sánh ảnh giao diện |
| Case quản lý | UI-NTF-003 |
| Project chạy | `visual` |
| Tag | `@ui`, `@lich-su-thong-bao`, `@p3` |
| Fixture dùng | `k1Api`, `page` (storageState theo vai trò) |
| Dữ liệu cần có | Thao tác vừa thực hiện ở các module khác để sinh lịch sử, thông báo |
| Dọn dữ liệu | Đánh dấu đã đọc thông báo của lượt chạy |
| Lệnh chạy | `npx playwright test tests/ui/lich-su-thong-bao/thong-bao.visual.spec.ts` |

## 6. Dữ liệu và môi trường

- **Môi trường:** chỉ chạy trên dev `https://logx-dev.sonthanh.net.vn` (web) và `https://logx-api-dev.sonthanh.net.vn` (API). `src/core/env.ts` chặn URL khác; không có URL production làm mặc định.
- **Tài khoản (mật khẩu đọc từ `.env`, không ghi trong code):** ADMIN `tung.luu.dvkh_master_data@logxpro.test`; CC_K5 `tungqlcc@gmail.com`; DP_K2 `tungqldp@gmail.com`; K1 `tungkh@gmail.com`; K1B `tungkh2@gmail.com`; SALE `tunglead@gmail.com`; SALE2 `tunglead2@gmail.com`; tài khoản tạo thêm bởi FLOW-ADM (DP_KHQ…DP_KB, K4, K5_ONLY, VIEW_GIA, NO_ROLE).
- **Biến môi trường:** `WEB_URL`, `API_URL`, `TENANT_CODE`, `<VAI_TRO>_EMAIL`, `<VAI_TRO>_PASSWORD`, `TENANT_B_*` (cho FLOW-TEN), `ALLOW_CLEANUP`.
- **Một phiên mỗi tài khoản:** hệ thống chỉ giữ 1 phiên/tài khoản, nên đăng nhập 1 lần ở project `setup` rồi dùng lại storageState/token; không chạy bộ test khi đang dùng cùng tài khoản trên trình duyệt.
- **Dữ liệu:** dữ liệu nền theo bộ giá P0 (`src/core/data/p0-price-set.ts`) do luồng `xuyen-module` tạo; case còn lại tự tạo dữ liệu qua factory, tên có tiền tố `AT-{testRunId}`, số ngẫu nhiên, chuỗi tên tiếng Việt có nghĩa.
- **Chạy song song:** bật `fullyParallel` cho file API và UI. File luồng dùng `test.describe.configure({ mode: 'serial' })` vì các bước nối nhau và dùng chung phiếu P0; case đổi giá định mức (FLOW-CHG-*) chạy 1 worker vì đổi giá dùng chung toàn tenant.
- **Dọn dữ liệu:** chỉ dọn bản ghi có testRunId và khi `ALLOW_CLEANUP=true`; phiếu đã điều phối không xóa được thì để lại, lọc theo tiền tố.
- **Mock:** chỉ giả lập tỷ giá VCB lỗi ở UI (`page.route`); API không mock.
- **`.gitignore`:** bỏ qua `.env`, `.auth/`, `test-results/`, `playwright-report/`.

## 7. Báo cáo và CI

- Reporter `html` + `json` (lưu kết quả mỗi lần chạy), `list` khi chạy tay; `trace: retain-on-failure`, ảnh và video khi lỗi.
- Mỗi lần build: tag `@p1` của project `api` (smoke) và luồng `xuyen-module`.
- Hằng đêm: toàn bộ `api`, `ui`; hằng tuần thêm `responsive`, `visual`, a11y.
- Case tag `@cho-xac-nhan` vẫn chạy nhưng báo riêng, chưa tính là lỗi hệ thống cho tới khi BA trả lời.

## 8. Thứ tự triển khai

| Giai đoạn | File cần viết | Case chạy được | Đầu ra |
| --- | --- | --- | --- |
| 1 | `playwright.config.ts`, `package.json`, `tsconfig.json`, `.env.example`, `src/core/*`, `tests/setup/auth.setup.ts` | AUTH (xác thực) | Đăng nhập được mọi vai trò, lưu storageState |
| 2 | Client + factory module `cau-hinh-dau-muc-gia`, `gia-mua-dau-vao`, `gia-mua-dinh-muc`, `gia-ban-dinh-muc`, `quan-ly-bao-gia`, `phieu-dich-vu`, `thap-dieu-phoi`; `tests/flows/xuyen-module/*` | FLOW-PRICE, FLOW-E2E | Có dữ liệu P0 và phiếu đủ 5 dịch vụ tới báo cáo |
| 3 | Các file `.functional` API của từng module, ưu tiên `phieu-dich-vu`, `thap-dieu-phoi`, `chi-phi-doanh-thu` | Case P1 API | Smoke chạy được ở mỗi lần build |
| 4 | Các file `.security`, `.validation`, `.contract`, `.concurrency`, `.integration` API | Case API còn lại | Đủ 18 nhóm API |
| 5 | Luồng của từng module (`tests/flows/<module>/*`) | FLOW-REV, FLOW-CHG-*, FLOW-DEACT, FLOW-MERGE, FLOW-EXC, FLOW-PNL, FLOW-HIST, FLOW-PERM, FLOW-ADM, FLOW-LEG, FLOW-QUOTE | Kiểm số liệu doanh thu/chi phí/P&L xuyên module |
| 6 | Page Object và file UI `.functional`, `.validation`, `.access` | Case UI | Đủ màn hình |
| 7 | `.responsive`, `.a11y`, `.visual`, tích hợp CI | Case UI còn lại | Lịch chạy định kỳ |

## 9. Điểm cần xác nhận

| Nội dung | Giả định hiện tại | Hỏi ai |
| --- | --- | --- |
| Tên module dùng tiếng Việt không dấu (`phieu-dich-vu`) thay vì tiếng Anh như quy ước mặc định | Giữ tiếng Việt cho dễ quản lý theo SRS | Người dùng |
| Luồng dùng nhiều module (FLOW-PRICE, FLOW-E2E) để ở package `xuyen-module` | Không nhân bản vào từng module | Người dùng |
| TENANT_B cho FLOW-TEN-001..FLOW-TEN-003 | Chưa có: code bằng `test.fixme` | Người dùng |
| 23 case [Chờ xác nhận] | Vẫn code, gắn tag `@cho-xac-nhan` | BA |
| Locator UI | Viết theo nhãn đang có trên web dev (getByRole/getByLabel); thiếu thì cần mã nguồn frontend hoặc data-testid | Dev frontend |
| Hệ thống chỉ giữ 1 phiên/tài khoản | Đăng nhập 1 lần ở setup; nếu token bị đá do người khác đăng nhập thì case lỗi 401 hàng loạt | Người dùng |
| Case đổi giá định mức và tắt kích hoạt đầu mục ảnh hưởng dữ liệu dùng chung | Chạy 1 worker, trả giá về P0 sau khi chạy | Người dùng |
