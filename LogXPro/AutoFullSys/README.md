# AutoFullSys — Auto test Playwright LogXPro toàn hệ thống

Auto test API, luồng và UI cho LogXPro (môi trường dev), phạm vi mọi module trong thư mục SRS trừ Lead, Khách hàng, HĐ khách hàng, Nhà thầu, HĐ nhà thầu, Danh mục. Project tách riêng khỏi `auto-tests/` (bộ Lead/KH/HĐ/Nhà thầu cũ), không dùng chung file.

Căn cứ:

- Bộ case: `../TestcaseFullSys.md` (quyết định kiểm tra gì).
- Bản cấu trúc: `../StructFullSys.md` (quyết định code nằm ở đâu; mỗi module có thư mục cùng tên ở `src/`, `tests/api/`, `tests/flows/`, `tests/ui/`).
- Báo cáo API: `../BAO_CAO_API_PHAM_VI_FULLSYS.md` (224 API).
- Swagger: `../API.txt`, chép vào `test-data/openapi.json` để client, schema, factory và hàm tìm id thật dùng đúng tên field và đường dẫn.

**Phạm vi chạy hiện tại.** Các spec Cấu hình đầu mục giá và `FLOW-PRICE-001` nằm ngoài phạm vi. Các fixture chỉ đọc đầu mục đã có. Thao tác ghi vào API cấu hình đầu mục giá bị chặn. Nếu case cần tạo đầu mục hoặc thiếu đầu mục thử nghiệm phù hợp, kết quả là `Blocked`. Với `FLOW-PRICE-002` đến `006`, chỉ khai hậu tố trong `.env` khi bộ đầu mục riêng đã có sẵn và chưa có giá định mức. Xem `FLOW_PRICE_*_ITEM_SUFFIX` trong `.env.example`.

## Bảng case và file

Script `verify_code.py` ghi bảng này, không sửa bằng tay.

| Case | Nhóm test | File | Trạng thái | Lệnh chạy |
|---|---|---|---|---|
| FLOW-ADM-001 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-001"` |
| FLOW-ADM-002 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-002"` |
| FLOW-ADM-003 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-003"` |
| FLOW-ADM-004 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-004"` |
| FLOW-ADM-005 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-005"` |
| FLOW-ADM-006 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-006"` |
| FLOW-ADM-007 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-007"` |
| FLOW-ADM-008 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-008"` |
| FLOW-ADM-009 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/tai-khoan-dieu-phoi.flow.spec.ts -g "FLOW-ADM-009"` |
| FLOW-LEG-001 | Flow/end-to-end API | `tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts -g "FLOW-LEG-001"` |
| FLOW-LEG-002 | Flow/end-to-end API | `tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts -g "FLOW-LEG-002"` |
| FLOW-LEG-003 | Flow/end-to-end API | `tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts -g "FLOW-LEG-003"` |
| FLOW-LEG-004 | Flow/end-to-end API | `tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-chang/chang-tren-phieu.flow.spec.ts -g "FLOW-LEG-004"` |
| FLOW-PRICE-001 | Flow/end-to-end API | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-001"` |
| FLOW-PRICE-002 | Flow/end-to-end API | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-002"` |
| FLOW-PRICE-003 | Flow/end-to-end API | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-003"` |
| FLOW-PRICE-004 | Flow/end-to-end API | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-004"` |
| FLOW-PRICE-005 | Flow/end-to-end API | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-005"` |
| FLOW-PRICE-006 | Flow/end-to-end API | `tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/thiet-lap-gia.flow.spec.ts -g "FLOW-PRICE-006"` |
| FLOW-QUOTE-001 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-001"` |
| FLOW-QUOTE-002 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-002"` |
| FLOW-QUOTE-003 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-003"` |
| FLOW-QUOTE-004 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-004"` |
| FLOW-QUOTE-005 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-005"` |
| FLOW-QUOTE-006 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-006"` |
| FLOW-QUOTE-007 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-007"` |
| FLOW-QUOTE-008 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-008"` |
| FLOW-QUOTE-009 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-009"` |
| FLOW-QUOTE-010 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-010"` |
| FLOW-QUOTE-011 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/bao-gia.flow.spec.ts -g "FLOW-QUOTE-011"` |
| FLOW-E2E-001 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-001"` |
| FLOW-E2E-002 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-002"` |
| FLOW-E2E-003 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-003"` |
| FLOW-E2E-004 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-004"` |
| FLOW-E2E-005 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-005"` |
| FLOW-E2E-006 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-006"` |
| FLOW-E2E-007 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-007"` |
| FLOW-E2E-008 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-008"` |
| FLOW-E2E-009 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-009"` |
| FLOW-E2E-010 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-010"` |
| FLOW-E2E-011 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-011"` |
| FLOW-E2E-012 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-012"` |
| FLOW-E2E-013 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-013"` |
| FLOW-E2E-014 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-014"` |
| FLOW-E2E-015 | Flow/end-to-end API | `tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/xuyen-module/phieu-du-5-dich-vu.flow.spec.ts -g "FLOW-E2E-015"` |
| FLOW-REV-001 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-001"` |
| FLOW-REV-002 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-002"` |
| FLOW-REV-003 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-003"` |
| FLOW-REV-004 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-004"` |
| FLOW-REV-005 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-005"` |
| FLOW-REV-006 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-006"` |
| FLOW-REV-007 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-007"` |
| FLOW-REV-008 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-008"` |
| FLOW-REV-009 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-009"` |
| FLOW-REV-010 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-010"` |
| FLOW-REV-011 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-011"` |
| FLOW-REV-012 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-012"` |
| FLOW-REV-013 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-013"` |
| FLOW-REV-014 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ghi-nhan-doanh-thu.flow.spec.ts -g "FLOW-REV-014"` |
| FLOW-CHG-BGM-001 | Flow/end-to-end API | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-001"` |
| FLOW-CHG-BGM-002 | Flow/end-to-end API | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-002"` |
| FLOW-CHG-BGM-003 | Flow/end-to-end API | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-003"` |
| FLOW-CHG-BGM-004 | Flow/end-to-end API | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-004"` |
| FLOW-CHG-BGM-005 | Flow/end-to-end API | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-005"` |
| FLOW-CHG-BGM-006 | Flow/end-to-end API | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-006"` |
| FLOW-CHG-BGM-007 | Flow/end-to-end API | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-007"` |
| FLOW-CHG-BGM-008 | Flow/end-to-end API | `tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dau-vao/doi-gia-mua-dau-vao.flow.spec.ts -g "FLOW-CHG-BGM-008"` |
| FLOW-CHG-SBP-001 | Flow/end-to-end API | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-001"` |
| FLOW-CHG-SBP-002 | Flow/end-to-end API | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-002"` |
| FLOW-CHG-SBP-003 | Flow/end-to-end API | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-003"` |
| FLOW-CHG-SBP-004 | Flow/end-to-end API | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-004"` |
| FLOW-CHG-SBP-005 | Flow/end-to-end API | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-005"` |
| FLOW-CHG-SBP-006 | Flow/end-to-end API | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-006"` |
| FLOW-CHG-SBP-007 | Flow/end-to-end API | `tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-mua-dinh-muc/doi-gia-mua-dinh-muc.flow.spec.ts -g "FLOW-CHG-SBP-007"` |
| FLOW-CHG-SSP-001 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-001"` |
| FLOW-CHG-SSP-002 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-002"` |
| FLOW-CHG-SSP-003 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-003"` |
| FLOW-CHG-SSP-004 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-004"` |
| FLOW-CHG-SSP-005 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-005"` |
| FLOW-CHG-SSP-006 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-006"` |
| FLOW-CHG-SSP-007 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-007"` |
| FLOW-CHG-SSP-008 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-008"` |
| FLOW-CHG-SSP-009 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-009"` |
| FLOW-CHG-SSP-010 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-010"` |
| FLOW-CHG-SSP-011 | Flow/end-to-end API | `tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/gia-ban-dinh-muc/doi-gia-ban-dinh-muc.flow.spec.ts -g "FLOW-CHG-SSP-011"` |
| FLOW-DEACT-001 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-001"` |
| FLOW-DEACT-002 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-002"` |
| FLOW-DEACT-003 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-003"` |
| FLOW-DEACT-004 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-004"` |
| FLOW-DEACT-005 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-005"` |
| FLOW-DEACT-006 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-006"` |
| FLOW-DEACT-007 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-007"` |
| FLOW-DEACT-008 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-008"` |
| FLOW-DEACT-009 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-009"` |
| FLOW-DEACT-010 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-010"` |
| FLOW-DEACT-011 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-011"` |
| FLOW-DEACT-012 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-012"` |
| FLOW-DEACT-013 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-013"` |
| FLOW-DEACT-014 | Flow/end-to-end API | `tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/cau-hinh-dau-muc-gia/tat-kich-hoat-dau-muc.flow.spec.ts -g "FLOW-DEACT-014"` |
| FLOW-DEACT-015 | Flow/end-to-end API | Thủ công | Không tự động | - |
| FLOW-MERGE-001 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts -g "FLOW-MERGE-001"` |
| FLOW-MERGE-002 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts -g "FLOW-MERGE-002"` |
| FLOW-MERGE-003 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts -g "FLOW-MERGE-003"` |
| FLOW-MERGE-004 | Flow/end-to-end API | `tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-ly-bao-gia/gop-dau-muc.flow.spec.ts -g "FLOW-MERGE-004"` |
| FLOW-EXC-001 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-001"` |
| FLOW-EXC-002 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-002"` |
| FLOW-EXC-003 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-003"` |
| FLOW-EXC-005 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-005"` |
| FLOW-EXC-006 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-006"` |
| FLOW-EXC-007 | Flow/end-to-end API | `tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/phieu-dich-vu/ngoai-le-phieu.flow.spec.ts -g "FLOW-EXC-007"` |
| FLOW-PNL-001 | Flow/end-to-end API | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-001"` |
| FLOW-PNL-002 | Flow/end-to-end API | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-002"` |
| FLOW-PNL-003 | Flow/end-to-end API | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-003"` |
| FLOW-PNL-004 | Flow/end-to-end API | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-004"` |
| FLOW-PNL-005 | Flow/end-to-end API | `tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/chi-phi-doanh-thu/ty-gia-pnl-bao-cao.flow.spec.ts -g "FLOW-PNL-005"` |
| FLOW-HIST-001 | Flow/end-to-end API | `tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts -g "FLOW-HIST-001"` |
| FLOW-HIST-002 | Flow/end-to-end API | `tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts -g "FLOW-HIST-002"` |
| FLOW-HIST-003 | Flow/end-to-end API | `tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts -g "FLOW-HIST-003"` |
| FLOW-HIST-004 | Flow/end-to-end API | `tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lich-su-thong-bao/lich-su-thong-bao.flow.spec.ts -g "FLOW-HIST-004"` |
| FLOW-PERM-001 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-001"` |
| FLOW-PERM-002 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-002"` |
| FLOW-PERM-003 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-003"` |
| FLOW-PERM-004 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-004"` |
| FLOW-PERM-005 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-005"` |
| FLOW-PERM-006 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/phan-quyen-hanh-dong.flow.spec.ts -g "FLOW-PERM-006"` |
| FLOW-TEN-001 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts -g "FLOW-TEN-001"` |
| FLOW-TEN-002 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts -g "FLOW-TEN-002"` |
| FLOW-TEN-003 | Flow/end-to-end API | `tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/quan-tri-phan-quyen/cach-ly-tenant.flow.spec.ts -g "FLOW-TEN-003"` |
| AUTH-001 | Authentication | `tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts -g "AUTH-001"` |
| AUTH-002 | Happy path | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-002"` |
| AUTH-003 | Business rule | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-003"` |
| AUTH-004 | Business rule | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-004"` |
| AUTH-005 | Business rule | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-005"` |
| AUTH-006 | Business rule | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-006"` |
| AUTH-007 | Request validation | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-007"` |
| AUTH-008 | Input security | `tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts -g "AUTH-008"` |
| AUTH-009 | Concurrency | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-009"` |
| AUTH-010 | Boundary | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-010"` |
| AUTH-011 | Response contract | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-011"` |
| AUTH-012 | Error handling | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-012"` |
| AUTH-013 | Idempotency | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-013"` |
| AUTH-014 | Happy path | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-014"` |
| AUTH-015 | Business rule | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-015"` |
| AUTH-016 | Data integrity | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-016"` |
| AUTH-017 | Request validation | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-017"` |
| AUTH-018 | Boundary | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-018"` |
| AUTH-019 | Response contract | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-019"` |
| AUTH-020 | Error handling | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-020"` |
| AUTH-021 | Idempotency | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-021"` |
| AUTH-022 | Happy path | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-022"` |
| AUTH-023 | Business rule | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-023"` |
| AUTH-024 | Response contract | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-024"` |
| AUTH-025 | Error handling | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-025"` |
| AUTH-026 | Happy path | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-026"` |
| AUTH-027 | Business rule | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-027"` |
| AUTH-028 | Business rule | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-028"` |
| AUTH-029 | Data integrity | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-029"` |
| AUTH-030 | Input security | `tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.security.spec.ts -g "AUTH-030"` |
| AUTH-031 | Request validation | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-031"` |
| AUTH-032 | Boundary | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-032"` |
| AUTH-033 | Response contract | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-033"` |
| AUTH-034 | Error handling | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-034"` |
| AUTH-035 | Idempotency | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-035"` |
| AUTH-036 | Happy path | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-036"` |
| AUTH-037 | Business rule | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-037"` |
| AUTH-038 | Data integrity | `tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.functional.spec.ts -g "AUTH-038"` |
| AUTH-039 | Request validation | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-039"` |
| AUTH-040 | Boundary | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-040"` |
| AUTH-041 | Response contract | `tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.contract.spec.ts -g "AUTH-041"` |
| AUTH-042 | Error handling | `tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.validation.spec.ts -g "AUTH-042"` |
| AUTH-043 | Idempotency | `tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/xac-thuc.concurrency.spec.ts -g "AUTH-043"` |
| ADM-DEP-001 | Authentication | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-001"` |
| ADM-DEP-002 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-002"` |
| ADM-DEP-003 | Pagination/filter/sort | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-003"` |
| ADM-DEP-004 | Authorization | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-004"` |
| ADM-DEP-005 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-005"` |
| ADM-DEP-006 | Boundary | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-006"` |
| ADM-DEP-007 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-007"` |
| ADM-DEP-008 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-008"` |
| ADM-DEP-009 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-009"` |
| ADM-DEP-010 | Business rule | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-010"` |
| ADM-DEP-011 | Data integrity | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-011"` |
| ADM-DEP-012 | Authorization | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-012"` |
| ADM-DEP-013 | Input security | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-013"` |
| ADM-DEP-014 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-014"` |
| ADM-DEP-015 | Boundary | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-015"` |
| ADM-DEP-016 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-016"` |
| ADM-DEP-017 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-017"` |
| ADM-DEP-018 | Idempotency | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-018"` |
| ADM-DEP-019 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-019"` |
| ADM-DEP-020 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-020"` |
| ADM-DEP-021 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-021"` |
| ADM-DEP-022 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-022"` |
| ADM-DEP-023 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-023"` |
| ADM-DEP-024 | Business rule | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-024"` |
| ADM-DEP-025 | Data integrity | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-025"` |
| ADM-DEP-026 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-026"` |
| ADM-DEP-027 | Boundary | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-027"` |
| ADM-DEP-028 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-028"` |
| ADM-DEP-029 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-029"` |
| ADM-DEP-030 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-030"` |
| ADM-DEP-031 | CRUD | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-031"` |
| ADM-DEP-032 | Business rule | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-032"` |
| ADM-DEP-033 | Data integrity | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-033"` |
| ADM-DEP-034 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-034"` |
| ADM-DEP-035 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-035"` |
| ADM-DEP-036 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-036"` |
| ADM-DEP-037 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-037"` |
| ADM-DEP-038 | Business rule | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-038"` |
| ADM-DEP-039 | Data integrity | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-039"` |
| ADM-DEP-040 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-040"` |
| ADM-DEP-041 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-041"` |
| ADM-DEP-042 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-042"` |
| ADM-DEP-043 | Idempotency | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-043"` |
| ADM-DEP-044 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-044"` |
| ADM-DEP-045 | Business rule | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-045"` |
| ADM-DEP-046 | Data integrity | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-046"` |
| ADM-DEP-047 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-047"` |
| ADM-DEP-048 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-048"` |
| ADM-DEP-049 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-049"` |
| ADM-DEP-050 | Idempotency | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-050"` |
| ADM-DEP-051 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-051"` |
| ADM-DEP-052 | Business rule | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-052"` |
| ADM-DEP-053 | Data integrity | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-053"` |
| ADM-DEP-054 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-054"` |
| ADM-DEP-055 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-055"` |
| ADM-DEP-056 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-056"` |
| ADM-DEP-057 | Idempotency | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-057"` |
| ADM-DEP-058 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-058"` |
| ADM-DEP-059 | Ownership/IDOR | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-059"` |
| ADM-DEP-060 | Business rule | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-060"` |
| ADM-DEP-061 | Data integrity | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-061"` |
| ADM-DEP-062 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-062"` |
| ADM-DEP-063 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-063"` |
| ADM-DEP-064 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-064"` |
| ADM-DEP-065 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-065"` |
| ADM-DEP-066 | Business rule | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-066"` |
| ADM-DEP-067 | Data integrity | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-067"` |
| ADM-DEP-068 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-068"` |
| ADM-DEP-069 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-069"` |
| ADM-DEP-070 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-070"` |
| ADM-DEP-071 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-071"` |
| ADM-DEP-072 | Idempotency | `tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.concurrency.spec.ts -g "ADM-DEP-072"` |
| ADM-DEP-073 | Happy path | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-073"` |
| ADM-DEP-074 | Ownership/IDOR | `tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.security.spec.ts -g "ADM-DEP-074"` |
| ADM-DEP-075 | Business rule | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-075"` |
| ADM-DEP-076 | Data integrity | `tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.functional.spec.ts -g "ADM-DEP-076"` |
| ADM-DEP-077 | Request validation | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-077"` |
| ADM-DEP-078 | Response contract | `tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.contract.spec.ts -g "ADM-DEP-078"` |
| ADM-DEP-079 | Error handling | `tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/bo-phan.validation.spec.ts -g "ADM-DEP-079"` |
| ADM-USR-001 | Authentication | `tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts -g "ADM-USR-001"` |
| ADM-USR-002 | Happy path | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-002"` |
| ADM-USR-003 | Pagination/filter/sort | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-003"` |
| ADM-USR-004 | Pagination/filter/sort | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-004"` |
| ADM-USR-005 | Authorization | `tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts -g "ADM-USR-005"` |
| ADM-USR-006 | Request validation | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-006"` |
| ADM-USR-007 | Boundary | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-007"` |
| ADM-USR-008 | Response contract | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-008"` |
| ADM-USR-009 | Error handling | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-009"` |
| ADM-USR-010 | Happy path | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-010"` |
| ADM-USR-011 | Business rule | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-011"` |
| ADM-USR-012 | Business rule | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-012"` |
| ADM-USR-013 | State transition | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-013"` |
| ADM-USR-014 | Data integrity | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-014"` |
| ADM-USR-015 | Input security | `tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.security.spec.ts -g "ADM-USR-015"` |
| ADM-USR-016 | Request validation | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-016"` |
| ADM-USR-017 | Boundary | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-017"` |
| ADM-USR-018 | Response contract | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-018"` |
| ADM-USR-019 | Error handling | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-019"` |
| ADM-USR-020 | Idempotency | `tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts -g "ADM-USR-020"` |
| ADM-USR-021 | Happy path | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-021"` |
| ADM-USR-022 | Request validation | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-022"` |
| ADM-USR-023 | Response contract | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-023"` |
| ADM-USR-024 | Error handling | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-024"` |
| ADM-USR-025 | Happy path | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-025"` |
| ADM-USR-026 | Business rule | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-026"` |
| ADM-USR-027 | Business rule | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-027"` |
| ADM-USR-028 | Data integrity | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-028"` |
| ADM-USR-029 | Request validation | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-029"` |
| ADM-USR-030 | Boundary | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-030"` |
| ADM-USR-031 | Response contract | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-031"` |
| ADM-USR-032 | Error handling | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-032"` |
| ADM-USR-033 | Happy path | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-033"` |
| ADM-USR-034 | Business rule | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-034"` |
| ADM-USR-035 | Business rule | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-035"` |
| ADM-USR-036 | State transition | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-036"` |
| ADM-USR-037 | Data integrity | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-037"` |
| ADM-USR-038 | Request validation | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-038"` |
| ADM-USR-039 | Response contract | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-039"` |
| ADM-USR-040 | Error handling | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-040"` |
| ADM-USR-041 | Idempotency | `tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts -g "ADM-USR-041"` |
| ADM-USR-042 | Happy path | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-042"` |
| ADM-USR-043 | Business rule | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-043"` |
| ADM-USR-044 | State transition | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-044"` |
| ADM-USR-045 | Data integrity | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-045"` |
| ADM-USR-046 | Request validation | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-046"` |
| ADM-USR-047 | Response contract | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-047"` |
| ADM-USR-048 | Error handling | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-048"` |
| ADM-USR-049 | Idempotency | `tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts -g "ADM-USR-049"` |
| ADM-USR-050 | Happy path | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-050"` |
| ADM-USR-051 | Business rule | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-051"` |
| ADM-USR-052 | Data integrity | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-052"` |
| ADM-USR-053 | Request validation | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-053"` |
| ADM-USR-054 | Response contract | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-054"` |
| ADM-USR-055 | Error handling | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-055"` |
| ADM-USR-056 | Idempotency | `tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.concurrency.spec.ts -g "ADM-USR-056"` |
| ADM-USR-057 | Happy path | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-057"` |
| ADM-USR-058 | Request validation | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-058"` |
| ADM-USR-059 | Response contract | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-059"` |
| ADM-USR-060 | Error handling | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-060"` |
| ADM-USR-061 | Happy path | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-061"` |
| ADM-USR-062 | File API | `tests/api/quan-tri-phan-quyen/nguoi-dung.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.integration.spec.ts -g "ADM-USR-062"` |
| ADM-USR-063 | Business rule | `tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.functional.spec.ts -g "ADM-USR-063"` |
| ADM-USR-064 | Request validation | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-064"` |
| ADM-USR-065 | Response contract | `tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.contract.spec.ts -g "ADM-USR-065"` |
| ADM-USR-066 | Error handling | `tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/nguoi-dung.validation.spec.ts -g "ADM-USR-066"` |
| ADM-ROLE-001 | Authentication | `tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts -g "ADM-ROLE-001"` |
| ADM-ROLE-002 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-002"` |
| ADM-ROLE-003 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-003"` |
| ADM-ROLE-004 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-004"` |
| ADM-ROLE-005 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-005"` |
| ADM-ROLE-006 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-006"` |
| ADM-ROLE-007 | Pagination/filter/sort | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-007"` |
| ADM-ROLE-008 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-008"` |
| ADM-ROLE-009 | Boundary | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-009"` |
| ADM-ROLE-010 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-010"` |
| ADM-ROLE-011 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-011"` |
| ADM-ROLE-012 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-012"` |
| ADM-ROLE-013 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-013"` |
| ADM-ROLE-014 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-014"` |
| ADM-ROLE-015 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-015"` |
| ADM-ROLE-016 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-016"` |
| ADM-ROLE-017 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-017"` |
| ADM-ROLE-018 | Boundary | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-018"` |
| ADM-ROLE-019 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-019"` |
| ADM-ROLE-020 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-020"` |
| ADM-ROLE-021 | Idempotency | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-021"` |
| ADM-ROLE-022 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-022"` |
| ADM-ROLE-023 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-023"` |
| ADM-ROLE-024 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-024"` |
| ADM-ROLE-025 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-025"` |
| ADM-ROLE-026 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-026"` |
| ADM-ROLE-027 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-027"` |
| ADM-ROLE-028 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-028"` |
| ADM-ROLE-029 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-029"` |
| ADM-ROLE-030 | Boundary | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-030"` |
| ADM-ROLE-031 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-031"` |
| ADM-ROLE-032 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-032"` |
| ADM-ROLE-033 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-033"` |
| ADM-ROLE-034 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-034"` |
| ADM-ROLE-035 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-035"` |
| ADM-ROLE-036 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-036"` |
| ADM-ROLE-037 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-037"` |
| ADM-ROLE-038 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-038"` |
| ADM-ROLE-039 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-039"` |
| ADM-ROLE-040 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-040"` |
| ADM-ROLE-041 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-041"` |
| ADM-ROLE-042 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-042"` |
| ADM-ROLE-043 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-043"` |
| ADM-ROLE-044 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-044"` |
| ADM-ROLE-045 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-045"` |
| ADM-ROLE-046 | Idempotency | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-046"` |
| ADM-ROLE-047 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-047"` |
| ADM-ROLE-048 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-048"` |
| ADM-ROLE-049 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-049"` |
| ADM-ROLE-050 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-050"` |
| ADM-ROLE-051 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-051"` |
| ADM-ROLE-052 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-052"` |
| ADM-ROLE-053 | Idempotency | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-053"` |
| ADM-ROLE-054 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-054"` |
| ADM-ROLE-055 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-055"` |
| ADM-ROLE-056 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-056"` |
| ADM-ROLE-057 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-057"` |
| ADM-ROLE-058 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-058"` |
| ADM-ROLE-059 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-059"` |
| ADM-ROLE-060 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-060"` |
| ADM-ROLE-061 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-061"` |
| ADM-ROLE-062 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-062"` |
| ADM-ROLE-063 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-063"` |
| ADM-ROLE-064 | Idempotency | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-064"` |
| ADM-ROLE-065 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-065"` |
| ADM-ROLE-066 | Ownership/IDOR | `tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts -g "ADM-ROLE-066"` |
| ADM-ROLE-067 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-067"` |
| ADM-ROLE-068 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-068"` |
| ADM-ROLE-069 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-069"` |
| ADM-ROLE-070 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-070"` |
| ADM-ROLE-071 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-071"` |
| ADM-ROLE-072 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-072"` |
| ADM-ROLE-073 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-073"` |
| ADM-ROLE-074 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-074"` |
| ADM-ROLE-075 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-075"` |
| ADM-ROLE-076 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-076"` |
| ADM-ROLE-077 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-077"` |
| ADM-ROLE-078 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-078"` |
| ADM-ROLE-079 | Idempotency | `tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.concurrency.spec.ts -g "ADM-ROLE-079"` |
| ADM-ROLE-080 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-080"` |
| ADM-ROLE-081 | Ownership/IDOR | `tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts -g "ADM-ROLE-081"` |
| ADM-ROLE-082 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-082"` |
| ADM-ROLE-083 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-083"` |
| ADM-ROLE-084 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-084"` |
| ADM-ROLE-085 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-085"` |
| ADM-ROLE-086 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-086"` |
| ADM-ROLE-087 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-087"` |
| ADM-ROLE-088 | Pagination/filter/sort | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-088"` |
| ADM-ROLE-089 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-089"` |
| ADM-ROLE-090 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-090"` |
| ADM-ROLE-091 | Boundary | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-091"` |
| ADM-ROLE-092 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-092"` |
| ADM-ROLE-093 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-093"` |
| ADM-ROLE-094 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-094"` |
| ADM-ROLE-095 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-095"` |
| ADM-ROLE-096 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-096"` |
| ADM-ROLE-097 | Happy path | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-097"` |
| ADM-ROLE-098 | State transition | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-098"` |
| ADM-ROLE-099 | Business rule | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-099"` |
| ADM-ROLE-100 | Data integrity | `tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.functional.spec.ts -g "ADM-ROLE-100"` |
| ADM-ROLE-101 | Authorization | `tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.security.spec.ts -g "ADM-ROLE-101"` |
| ADM-ROLE-102 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-102"` |
| ADM-ROLE-103 | Request validation | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-103"` |
| ADM-ROLE-104 | Response contract | `tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.contract.spec.ts -g "ADM-ROLE-104"` |
| ADM-ROLE-105 | Error handling | `tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-tri-phan-quyen/vai-tro.validation.spec.ts -g "ADM-ROLE-105"` |
| LEG-001 | Authentication | `tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts -g "LEG-001"` |
| LEG-002 | Happy path | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-002"` |
| LEG-003 | Pagination/filter/sort | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-003"` |
| LEG-004 | Pagination/filter/sort | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-004"` |
| LEG-005 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-005"` |
| LEG-006 | Boundary | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-006"` |
| LEG-007 | Response contract | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-007"` |
| LEG-008 | Error handling | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-008"` |
| LEG-009 | Happy path | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-009"` |
| LEG-010 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-010"` |
| LEG-011 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-011"` |
| LEG-012 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-012"` |
| LEG-013 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-013"` |
| LEG-014 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-014"` |
| LEG-015 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-015"` |
| LEG-016 | State transition | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-016"` |
| LEG-017 | Data integrity | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-017"` |
| LEG-018 | Input security | `tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.security.spec.ts -g "LEG-018"` |
| LEG-019 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-019"` |
| LEG-020 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-020"` |
| LEG-021 | Boundary | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-021"` |
| LEG-022 | Response contract | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-022"` |
| LEG-023 | Error handling | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-023"` |
| LEG-024 | Idempotency | `tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts -g "LEG-024"` |
| LEG-025 | Happy path | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-025"` |
| LEG-026 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-026"` |
| LEG-027 | Response contract | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-027"` |
| LEG-028 | Error handling | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-028"` |
| LEG-029 | Happy path | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-029"` |
| LEG-030 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-030"` |
| LEG-031 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-031"` |
| LEG-032 | Data integrity | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-032"` |
| LEG-033 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-033"` |
| LEG-034 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-034"` |
| LEG-035 | Boundary | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-035"` |
| LEG-036 | Response contract | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-036"` |
| LEG-037 | Error handling | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-037"` |
| LEG-038 | Happy path | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-038"` |
| LEG-039 | CRUD | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-039"` |
| LEG-040 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-040"` |
| LEG-041 | Data integrity | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-041"` |
| LEG-042 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-042"` |
| LEG-043 | Response contract | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-043"` |
| LEG-044 | Error handling | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-044"` |
| LEG-045 | Happy path | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-045"` |
| LEG-046 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-046"` |
| LEG-047 | Boundary | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-047"` |
| LEG-048 | Response contract | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-048"` |
| LEG-049 | Error handling | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-049"` |
| LEG-050 | Pagination/filter/sort | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-050"` |
| LEG-051 | Happy path | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-051"` |
| LEG-052 | State transition | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-052"` |
| LEG-053 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-053"` |
| LEG-054 | Data integrity | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-054"` |
| LEG-055 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-055"` |
| LEG-056 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-056"` |
| LEG-057 | Response contract | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-057"` |
| LEG-058 | Error handling | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-058"` |
| LEG-059 | Idempotency | `tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts -g "LEG-059"` |
| LEG-060 | Happy path | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-060"` |
| LEG-061 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-061"` |
| LEG-062 | Business rule | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-062"` |
| LEG-063 | Data integrity | `tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.functional.spec.ts -g "LEG-063"` |
| LEG-064 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-064"` |
| LEG-065 | Boundary | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-065"` |
| LEG-066 | Response contract | `tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.contract.spec.ts -g "LEG-066"` |
| LEG-067 | Error handling | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-067"` |
| LEG-068 | Idempotency | `tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.concurrency.spec.ts -g "LEG-068"` |
| LEG-069 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-069"` |
| LEG-070 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-070"` |
| LEG-071 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-071"` |
| LEG-072 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-072"` |
| LEG-073 | Request validation | `tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-chang/quy-tac-chang.validation.spec.ts -g "LEG-073"` |
| CFG-001 | Authentication | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-001"` |
| CFG-002 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-002"` |
| CFG-003 | Authorization | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-003"` |
| CFG-004 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-004"` |
| CFG-005 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-005"` |
| CFG-006 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-006"` |
| CFG-007 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-007"` |
| CFG-008 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-008"` |
| CFG-009 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-009"` |
| CFG-010 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-010"` |
| CFG-011 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-011"` |
| CFG-012 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-012"` |
| CFG-013 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-013"` |
| CFG-014 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-014"` |
| CFG-015 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-015"` |
| CFG-016 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-016"` |
| CFG-017 | Boundary | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-017"` |
| CFG-018 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-018"` |
| CFG-019 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-019"` |
| CFG-020 | Pagination/filter/sort | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-020"` |
| CFG-021 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-021"` |
| CFG-022 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-022"` |
| CFG-023 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-023"` |
| CFG-024 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-024"` |
| CFG-025 | State transition | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-025"` |
| CFG-026 | Data integrity | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-026"` |
| CFG-027 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-027"` |
| CFG-028 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-028"` |
| CFG-029 | Boundary | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-029"` |
| CFG-030 | Boundary | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-030"` |
| CFG-031 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-031"` |
| CFG-032 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-032"` |
| CFG-033 | Idempotency | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts -g "CFG-033"` |
| CFG-034 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-034"` |
| CFG-035 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-035"` |
| CFG-036 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-036"` |
| CFG-037 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-037"` |
| CFG-038 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-038"` |
| CFG-039 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-039"` |
| CFG-040 | State transition | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-040"` |
| CFG-041 | Data integrity | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-041"` |
| CFG-042 | Concurrency | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.concurrency.spec.ts -g "CFG-042"` |
| CFG-043 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-043"` |
| CFG-044 | Boundary | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-044"` |
| CFG-045 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-045"` |
| CFG-046 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-046"` |
| CFG-047 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-047"` |
| CFG-048 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-048"` |
| CFG-049 | State transition | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-049"` |
| CFG-050 | Ownership/IDOR | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-050"` |
| CFG-051 | Data integrity | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-051"` |
| CFG-052 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-052"` |
| CFG-053 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-053"` |
| CFG-054 | Boundary | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-054"` |
| CFG-055 | Boundary | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-055"` |
| CFG-056 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-056"` |
| CFG-057 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-057"` |
| CFG-058 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-058"` |
| CFG-059 | CRUD | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-059"` |
| CFG-060 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-060"` |
| CFG-061 | Ownership/IDOR | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-061"` |
| CFG-062 | Data integrity | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-062"` |
| CFG-063 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-063"` |
| CFG-064 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-064"` |
| CFG-065 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-065"` |
| CFG-066 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-066"` |
| CFG-067 | Business rule | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-067"` |
| CFG-068 | Ownership/IDOR | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-068"` |
| CFG-069 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-069"` |
| CFG-070 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-070"` |
| CFG-071 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-071"` |
| CFG-072 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-072"` |
| CFG-073 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-073"` |
| CFG-074 | Boundary | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-074"` |
| CFG-075 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-075"` |
| CFG-076 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-076"` |
| CFG-077 | Pagination/filter/sort | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-077"` |
| CFG-078 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-078"` |
| CFG-079 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-079"` |
| CFG-080 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-080"` |
| CFG-081 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-081"` |
| CFG-082 | Happy path | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "CFG-082"` |
| CFG-083 | Ownership/IDOR | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.security.spec.ts -g "CFG-083"` |
| CFG-084 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-084"` |
| CFG-085 | Response contract | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.contract.spec.ts -g "CFG-085"` |
| CFG-086 | Error handling | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-086"` |
| CFG-087 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-087"` |
| CFG-088 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-088"` |
| CFG-089 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-089"` |
| CFG-090 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-090"` |
| CFG-091 | Request validation | `tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "CFG-091"` |
| COM-001 | Authentication | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts -g "COM-001"` |
| COM-002 | Happy path | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-002"` |
| COM-003 | Business rule | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-003"` |
| COM-004 | Integration | Thủ công | Không tự động | - |
| COM-005 | Request validation | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-005"` |
| COM-006 | Response contract | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts -g "COM-006"` |
| COM-007 | Error handling | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-007"` |
| COM-008 | Happy path | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-008"` |
| COM-009 | Pagination/filter/sort | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-009"` |
| COM-010 | Request validation | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-010"` |
| COM-011 | Response contract | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts -g "COM-011"` |
| COM-012 | Error handling | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-012"` |
| COM-013 | Happy path | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-013"` |
| COM-014 | Response contract | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts -g "COM-014"` |
| COM-015 | Error handling | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-015"` |
| COM-016 | Happy path | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-016"` |
| COM-017 | Ownership/IDOR | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.security.spec.ts -g "COM-017"` |
| COM-018 | Business rule | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-018"` |
| COM-019 | Data integrity | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.functional.spec.ts -g "COM-019"` |
| COM-020 | Request validation | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-020"` |
| COM-021 | Response contract | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.contract.spec.ts -g "COM-021"` |
| COM-022 | Error handling | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.validation.spec.ts -g "COM-022"` |
| COM-023 | Idempotency | `tests/api/lich-su-thong-bao/ty-gia-thong-bao.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/lich-su-thong-bao/ty-gia-thong-bao.concurrency.spec.ts -g "COM-023"` |
| BGM-001 | Authentication | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-001"` |
| BGM-002 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-002"` |
| BGM-003 | Pagination/filter/sort | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-003"` |
| BGM-004 | Authorization | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-004"` |
| BGM-005 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-005"` |
| BGM-006 | Boundary | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-006"` |
| BGM-007 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-007"` |
| BGM-008 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-008"` |
| BGM-009 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-009"` |
| BGM-010 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-010"` |
| BGM-011 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-011"` |
| BGM-012 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-012"` |
| BGM-013 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-013"` |
| BGM-014 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-014"` |
| BGM-015 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-015"` |
| BGM-016 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-016"` |
| BGM-017 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-017"` |
| BGM-018 | Boundary | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-018"` |
| BGM-019 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-019"` |
| BGM-020 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-020"` |
| BGM-021 | Idempotency | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-021"` |
| BGM-022 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-022"` |
| BGM-023 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-023"` |
| BGM-024 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-024"` |
| BGM-025 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-025"` |
| BGM-026 | Pagination/filter/sort | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-026"` |
| BGM-027 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-027"` |
| BGM-028 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-028"` |
| BGM-029 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-029"` |
| BGM-030 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-030"` |
| BGM-031 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-031"` |
| BGM-032 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-032"` |
| BGM-033 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-033"` |
| BGM-034 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-034"` |
| BGM-035 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-035"` |
| BGM-036 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-036"` |
| BGM-037 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-037"` |
| BGM-038 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-038"` |
| BGM-039 | Boundary | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-039"` |
| BGM-040 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-040"` |
| BGM-041 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-041"` |
| BGM-042 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-042"` |
| BGM-043 | CRUD | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-043"` |
| BGM-044 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-044"` |
| BGM-045 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-045"` |
| BGM-046 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-046"` |
| BGM-047 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-047"` |
| BGM-048 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-048"` |
| BGM-049 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-049"` |
| BGM-050 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-050"` |
| BGM-051 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-051"` |
| BGM-052 | State transition | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-052"` |
| BGM-053 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-053"` |
| BGM-054 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-054"` |
| BGM-055 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-055"` |
| BGM-056 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-056"` |
| BGM-057 | Idempotency | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-057"` |
| BGM-058 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-058"` |
| BGM-059 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-059"` |
| BGM-060 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-060"` |
| BGM-061 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-061"` |
| BGM-062 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-062"` |
| BGM-063 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-063"` |
| BGM-064 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-064"` |
| BGM-065 | State transition | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-065"` |
| BGM-066 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-kich-hoat.functional.spec.ts -g "BGM-066"` |
| BGM-067 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-067"` |
| BGM-068 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-068"` |
| BGM-069 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-069"` |
| BGM-070 | Idempotency | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-070"` |
| BGM-071 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-071"` |
| BGM-072 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-072"` |
| BGM-073 | Boundary | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-073"` |
| BGM-074 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-074"` |
| BGM-075 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-075"` |
| BGM-076 | Pagination/filter/sort | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-076"` |
| BGM-077 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-077"` |
| BGM-078 | Pagination/filter/sort | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-078"` |
| BGM-079 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-079"` |
| BGM-080 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-080"` |
| BGM-081 | Boundary | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-081"` |
| BGM-082 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-082"` |
| BGM-083 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-083"` |
| BGM-084 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-084"` |
| BGM-085 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-085"` |
| BGM-086 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-086"` |
| BGM-087 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-087"` |
| BGM-088 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-088"` |
| BGM-089 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-089"` |
| BGM-090 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-090"` |
| BGM-091 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-091"` |
| BGM-092 | Idempotency | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-092"` |
| BGM-093 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-093"` |
| BGM-094 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-094"` |
| BGM-095 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-095"` |
| BGM-096 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-096"` |
| BGM-097 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-097"` |
| BGM-098 | Concurrency | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-098"` |
| BGM-099 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-099"` |
| BGM-100 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-100"` |
| BGM-101 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-101"` |
| BGM-102 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-102"` |
| BGM-103 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-103"` |
| BGM-104 | Ownership/IDOR | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-104"` |
| BGM-105 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-105"` |
| BGM-106 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-106"` |
| BGM-107 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-107"` |
| BGM-108 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-108"` |
| BGM-109 | Idempotency | `tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.concurrency.spec.ts -g "BGM-109"` |
| BGM-110 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-110"` |
| BGM-111 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-111"` |
| BGM-112 | Ownership/IDOR | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-112"` |
| BGM-113 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-113"` |
| BGM-114 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-114"` |
| BGM-115 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-115"` |
| BGM-116 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-116"` |
| BGM-117 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-117"` |
| BGM-118 | Business rule | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-118"` |
| BGM-119 | Ownership/IDOR | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-119"` |
| BGM-120 | Data integrity | `tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-dong-gia.functional.spec.ts -g "BGM-120"` |
| BGM-121 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-121"` |
| BGM-122 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-122"` |
| BGM-123 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-123"` |
| BGM-124 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-124"` |
| BGM-125 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-125"` |
| BGM-126 | Boundary | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-126"` |
| BGM-127 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-127"` |
| BGM-128 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-128"` |
| BGM-129 | Pagination/filter/sort | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-129"` |
| BGM-130 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-130"` |
| BGM-131 | Ownership/IDOR | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-131"` |
| BGM-132 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-132"` |
| BGM-133 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-133"` |
| BGM-134 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-134"` |
| BGM-135 | Happy path | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-135"` |
| BGM-136 | Ownership/IDOR | `tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.security.spec.ts -g "BGM-136"` |
| BGM-137 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-137"` |
| BGM-138 | Boundary | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-138"` |
| BGM-139 | Response contract | `tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.contract.spec.ts -g "BGM-139"` |
| BGM-140 | Error handling | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-140"` |
| BGM-141 | Pagination/filter/sort | `tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua-bang-gia.functional.spec.ts -g "BGM-141"` |
| BGM-142 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-142"` |
| BGM-143 | Request validation | `tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dau-vao/bang-gia-mua.validation.spec.ts -g "BGM-143"` |
| SBP-001 | Authentication | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.security.spec.ts -g "SBP-001"` |
| SBP-002 | Happy path | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-002"` |
| SBP-003 | Pagination/filter/sort | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-003"` |
| SBP-004 | Request validation | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-004"` |
| SBP-005 | Response contract | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-005"` |
| SBP-006 | Error handling | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-006"` |
| SBP-007 | Happy path | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-007"` |
| SBP-008 | Pagination/filter/sort | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-008"` |
| SBP-009 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-009"` |
| SBP-010 | Request validation | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-010"` |
| SBP-011 | Boundary | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-011"` |
| SBP-012 | Response contract | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-012"` |
| SBP-013 | Error handling | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-013"` |
| SBP-014 | Happy path | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-014"` |
| SBP-015 | Request validation | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-015"` |
| SBP-016 | Response contract | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-016"` |
| SBP-017 | Error handling | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-017"` |
| SBP-018 | Happy path | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-018"` |
| SBP-019 | Boundary | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-019"` |
| SBP-020 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-020"` |
| SBP-021 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-021"` |
| SBP-022 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-022"` |
| SBP-023 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-023"` |
| SBP-024 | Data integrity | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-024"` |
| SBP-025 | Request validation | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-025"` |
| SBP-026 | Response contract | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-026"` |
| SBP-027 | Error handling | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-027"` |
| SBP-028 | Happy path | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-028"` |
| SBP-029 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-029"` |
| SBP-030 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-030"` |
| SBP-031 | Data integrity | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-031"` |
| SBP-032 | Request validation | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-032"` |
| SBP-033 | Boundary | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-033"` |
| SBP-034 | Response contract | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-034"` |
| SBP-035 | Error handling | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-035"` |
| SBP-036 | Happy path | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-036"` |
| SBP-037 | Request validation | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-037"` |
| SBP-038 | Response contract | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-038"` |
| SBP-039 | Error handling | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-039"` |
| SBP-040 | Happy path | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-040"` |
| SBP-041 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-041"` |
| SBP-042 | Data integrity | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-042"` |
| SBP-043 | Request validation | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-043"` |
| SBP-044 | Response contract | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-044"` |
| SBP-045 | Error handling | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-045"` |
| SBP-046 | Happy path | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-046"` |
| SBP-047 | Request validation | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-047"` |
| SBP-048 | Boundary | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-048"` |
| SBP-049 | Response contract | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.contract.spec.ts -g "SBP-049"` |
| SBP-050 | Error handling | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "SBP-050"` |
| SBP-051 | Pagination/filter/sort | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-051"` |
| SBP-052 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-052"` |
| SBP-053 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-053"` |
| SBP-054 | Business rule | `tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "SBP-054"` |
| SSP-001 | Authentication | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.security.spec.ts -g "SSP-001"` |
| SSP-002 | Happy path | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-002"` |
| SSP-003 | Request validation | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-003"` |
| SSP-004 | Response contract | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-004"` |
| SSP-005 | Error handling | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-005"` |
| SSP-006 | Happy path | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-006"` |
| SSP-007 | Pagination/filter/sort | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-007"` |
| SSP-008 | Pagination/filter/sort | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-008"` |
| SSP-009 | Request validation | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-009"` |
| SSP-010 | Boundary | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-010"` |
| SSP-011 | Response contract | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-011"` |
| SSP-012 | Error handling | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-012"` |
| SSP-013 | Happy path | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-013"` |
| SSP-014 | Request validation | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-014"` |
| SSP-015 | Response contract | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-015"` |
| SSP-016 | Error handling | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-016"` |
| SSP-017 | Happy path | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-017"` |
| SSP-018 | Business rule | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-018"` |
| SSP-019 | Business rule | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-019"` |
| SSP-020 | Business rule | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-020"` |
| SSP-021 | Business rule | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-021"` |
| SSP-022 | Business rule | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-022"` |
| SSP-023 | Data integrity | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-023"` |
| SSP-024 | Request validation | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-024"` |
| SSP-025 | Boundary | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-025"` |
| SSP-026 | Response contract | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-026"` |
| SSP-027 | Error handling | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-027"` |
| SSP-028 | Happy path | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-028"` |
| SSP-029 | Business rule | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-029"` |
| SSP-030 | Business rule | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-030"` |
| SSP-031 | Data integrity | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-031"` |
| SSP-032 | Request validation | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-032"` |
| SSP-033 | Boundary | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-033"` |
| SSP-034 | Response contract | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-034"` |
| SSP-035 | Error handling | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-035"` |
| SSP-036 | Happy path | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-036"` |
| SSP-037 | Business rule | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-037"` |
| SSP-038 | Data integrity | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-038"` |
| SSP-039 | Request validation | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-039"` |
| SSP-040 | Response contract | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-040"` |
| SSP-041 | Error handling | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-041"` |
| SSP-042 | Idempotency | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.concurrency.spec.ts -g "SSP-042"` |
| SSP-043 | Happy path | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-043"` |
| SSP-044 | Request validation | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-044"` |
| SSP-045 | Boundary | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-045"` |
| SSP-046 | Response contract | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.contract.spec.ts -g "SSP-046"` |
| SSP-047 | Error handling | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "SSP-047"` |
| SSP-048 | Pagination/filter/sort | `tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "SSP-048"` |
| RFQ-001 | Authentication | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-001"` |
| RFQ-002 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-002"` |
| RFQ-003 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-003"` |
| RFQ-004 | Pagination/filter/sort | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-004"` |
| RFQ-005 | Business rule | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-005"` |
| RFQ-006 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-006"` |
| RFQ-007 | Boundary | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-007"` |
| RFQ-008 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-008"` |
| RFQ-009 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-009"` |
| RFQ-010 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-010"` |
| RFQ-011 | State transition | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-011"` |
| RFQ-012 | Business rule | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-012"` |
| RFQ-013 | Business rule | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-013"` |
| RFQ-014 | Business rule | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-014"` |
| RFQ-015 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-015"` |
| RFQ-016 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-016"` |
| RFQ-017 | Input security | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-017"` |
| RFQ-018 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-018"` |
| RFQ-019 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-019"` |
| RFQ-020 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-020"` |
| RFQ-021 | Boundary | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-021"` |
| RFQ-022 | Boundary | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-022"` |
| RFQ-023 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-023"` |
| RFQ-024 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-024"` |
| RFQ-025 | Idempotency | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-025"` |
| RFQ-026 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-026"` |
| RFQ-027 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-027"` |
| RFQ-028 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-028"` |
| RFQ-029 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-029"` |
| RFQ-030 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-030"` |
| RFQ-031 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-031"` |
| RFQ-032 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-032"` |
| RFQ-033 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-033"` |
| RFQ-034 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-034"` |
| RFQ-035 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-035"` |
| RFQ-036 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-036"` |
| RFQ-037 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-037"` |
| RFQ-038 | Business rule | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-038"` |
| RFQ-039 | Business rule | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-039"` |
| RFQ-040 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-040"` |
| RFQ-041 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-041"` |
| RFQ-042 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-042"` |
| RFQ-043 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-043"` |
| RFQ-044 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-044"` |
| RFQ-045 | Boundary | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-045"` |
| RFQ-046 | Boundary | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-046"` |
| RFQ-047 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-047"` |
| RFQ-048 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-048"` |
| RFQ-049 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-049"` |
| RFQ-050 | CRUD | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-050"` |
| RFQ-051 | Business rule | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-051"` |
| RFQ-052 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-052"` |
| RFQ-053 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-053"` |
| RFQ-054 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-054"` |
| RFQ-055 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-055"` |
| RFQ-056 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-056"` |
| RFQ-057 | Happy path | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-057"` |
| RFQ-058 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-058"` |
| RFQ-059 | State transition | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-059"` |
| RFQ-060 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-060"` |
| RFQ-061 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-061"` |
| RFQ-062 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-062"` |
| RFQ-063 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-063"` |
| RFQ-064 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-064"` |
| RFQ-065 | Idempotency | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-065"` |
| RFQ-066 | Happy path | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-066"` |
| RFQ-067 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-067"` |
| RFQ-068 | State transition | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-068"` |
| RFQ-069 | Concurrency | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-069"` |
| RFQ-070 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-070"` |
| RFQ-071 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-071"` |
| RFQ-072 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-072"` |
| RFQ-073 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-073"` |
| RFQ-074 | Idempotency | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-074"` |
| RFQ-075 | Happy path | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-075"` |
| RFQ-076 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-076"` |
| RFQ-077 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-077"` |
| RFQ-078 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-078"` |
| RFQ-079 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-079"` |
| RFQ-080 | State transition | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-080"` |
| RFQ-081 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-081"` |
| RFQ-082 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-082"` |
| RFQ-083 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-083"` |
| RFQ-084 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-084"` |
| RFQ-085 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-085"` |
| RFQ-086 | Idempotency | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-086"` |
| RFQ-087 | Happy path | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-087"` |
| RFQ-088 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-088"` |
| RFQ-089 | State transition | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-089"` |
| RFQ-090 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-090"` |
| RFQ-091 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-091"` |
| RFQ-092 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-092"` |
| RFQ-093 | Boundary | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-093"` |
| RFQ-094 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-094"` |
| RFQ-095 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-095"` |
| RFQ-096 | Idempotency | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-096"` |
| RFQ-097 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-097"` |
| RFQ-098 | File API | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-098"` |
| RFQ-099 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-099"` |
| RFQ-100 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-100"` |
| RFQ-101 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-101"` |
| RFQ-102 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-102"` |
| RFQ-103 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-103"` |
| RFQ-104 | Business rule | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-104"` |
| RFQ-105 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-105"` |
| RFQ-106 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-106"` |
| RFQ-107 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-107"` |
| RFQ-108 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-108"` |
| RFQ-109 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-109"` |
| RFQ-110 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-110"` |
| RFQ-111 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-111"` |
| RFQ-112 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-112"` |
| RFQ-113 | Boundary | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-113"` |
| RFQ-114 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-114"` |
| RFQ-115 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-115"` |
| RFQ-116 | Pagination/filter/sort | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-116"` |
| RFQ-117 | Happy path | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-117"` |
| RFQ-118 | State transition | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-118"` |
| RFQ-119 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-119"` |
| RFQ-120 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-120"` |
| RFQ-121 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-trang-thai.functional.spec.ts -g "RFQ-121"` |
| RFQ-122 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-122"` |
| RFQ-123 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-123"` |
| RFQ-124 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-124"` |
| RFQ-125 | Idempotency | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-125"` |
| RFQ-126 | Happy path | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-126"` |
| RFQ-127 | File API | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-127"` |
| RFQ-128 | File API | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-128"` |
| RFQ-129 | File API | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-129"` |
| RFQ-130 | Business rule | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-130"` |
| RFQ-131 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/ycbg.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.security.spec.ts -g "RFQ-131"` |
| RFQ-132 | Data integrity | `tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.functional.spec.ts -g "RFQ-132"` |
| RFQ-133 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-133"` |
| RFQ-134 | Response contract | `tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.contract.spec.ts -g "RFQ-134"` |
| RFQ-135 | Error handling | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-135"` |
| RFQ-136 | Idempotency | `tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.concurrency.spec.ts -g "RFQ-136"` |
| RFQ-137 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-137"` |
| RFQ-138 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-138"` |
| RFQ-139 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-139"` |
| RFQ-140 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-140"` |
| RFQ-141 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-141"` |
| RFQ-142 | Business rule | `tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg-bgnb-tu-dong.functional.spec.ts -g "RFQ-142"` |
| RFQ-143 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-143"` |
| RFQ-144 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-144"` |
| RFQ-145 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-145"` |
| RFQ-146 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-146"` |
| RFQ-147 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-147"` |
| RFQ-148 | File API | `tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.integration.spec.ts -g "RFQ-148"` |
| RFQ-149 | Request validation | `tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/ycbg.validation.spec.ts -g "RFQ-149"` |
| IPS-001 | Authentication | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-001"` |
| IPS-002 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-002"` |
| IPS-003 | Pagination/filter/sort | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-003"` |
| IPS-004 | Authorization | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-004"` |
| IPS-005 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-005"` |
| IPS-006 | Boundary | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-006"` |
| IPS-007 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-007"` |
| IPS-008 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-008"` |
| IPS-009 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-009"` |
| IPS-010 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-010"` |
| IPS-011 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-011"` |
| IPS-012 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-012"` |
| IPS-013 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-013"` |
| IPS-014 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-014"` |
| IPS-015 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-015"` |
| IPS-016 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-016"` |
| IPS-017 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-017"` |
| IPS-018 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-018"` |
| IPS-019 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-019"` |
| IPS-020 | Boundary | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-020"` |
| IPS-021 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-021"` |
| IPS-022 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-022"` |
| IPS-023 | Idempotency | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-023"` |
| IPS-024 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-024"` |
| IPS-025 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-025"` |
| IPS-026 | Pagination/filter/sort | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-026"` |
| IPS-027 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-027"` |
| IPS-028 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-028"` |
| IPS-029 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-029"` |
| IPS-030 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-030"` |
| IPS-031 | Pagination/filter/sort | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-031"` |
| IPS-032 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-032"` |
| IPS-033 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-033"` |
| IPS-034 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-034"` |
| IPS-035 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-035"` |
| IPS-036 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-036"` |
| IPS-037 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-037"` |
| IPS-038 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-038"` |
| IPS-039 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-039"` |
| IPS-040 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-040"` |
| IPS-041 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-041"` |
| IPS-042 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-042"` |
| IPS-043 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-043"` |
| IPS-044 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-044"` |
| IPS-045 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-045"` |
| IPS-046 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-046"` |
| IPS-047 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-047"` |
| IPS-048 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-048"` |
| IPS-049 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-049"` |
| IPS-050 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-050"` |
| IPS-051 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-051"` |
| IPS-052 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-052"` |
| IPS-053 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-053"` |
| IPS-054 | Boundary | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-054"` |
| IPS-055 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-055"` |
| IPS-056 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-056"` |
| IPS-057 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-057"` |
| IPS-058 | Business rule | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-058"` |
| IPS-059 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-059"` |
| IPS-060 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-060"` |
| IPS-061 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-061"` |
| IPS-062 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-062"` |
| IPS-063 | Happy path | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-063"` |
| IPS-064 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-064"` |
| IPS-065 | Boundary | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-065"` |
| IPS-066 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-066"` |
| IPS-067 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-067"` |
| IPS-068 | Pagination/filter/sort | `tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.functional.spec.ts -g "IPS-068"` |
| IPS-069 | Happy path | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-069"` |
| IPS-070 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-070"` |
| IPS-071 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-071"` |
| IPS-072 | State transition | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-072"` |
| IPS-073 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-073"` |
| IPS-074 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-074"` |
| IPS-075 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-075"` |
| IPS-076 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-076"` |
| IPS-077 | Idempotency | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-077"` |
| IPS-078 | Happy path | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-078"` |
| IPS-079 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-079"` |
| IPS-080 | State transition | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-080"` |
| IPS-081 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-081"` |
| IPS-082 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-082"` |
| IPS-083 | Boundary | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-083"` |
| IPS-084 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-084"` |
| IPS-085 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-085"` |
| IPS-086 | Idempotency | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-086"` |
| IPS-087 | Happy path | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-087"` |
| IPS-088 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-088"` |
| IPS-089 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-089"` |
| IPS-090 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-090"` |
| IPS-091 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-phat-hanh.functional.spec.ts -g "IPS-091"` |
| IPS-092 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-092"` |
| IPS-093 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-093"` |
| IPS-094 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-094"` |
| IPS-095 | Idempotency | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-095"` |
| IPS-096 | Happy path | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-096"` |
| IPS-097 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-097"` |
| IPS-098 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-098"` |
| IPS-099 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-099"` |
| IPS-100 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-100"` |
| IPS-101 | Happy path | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-101"` |
| IPS-102 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-102"` |
| IPS-103 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-103"` |
| IPS-104 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-104"` |
| IPS-105 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-105"` |
| IPS-106 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-106"` |
| IPS-107 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-107"` |
| IPS-108 | Idempotency | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-108"` |
| IPS-109 | Happy path | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-109"` |
| IPS-110 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-110"` |
| IPS-111 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-111"` |
| IPS-112 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-112"` |
| IPS-113 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-113"` |
| IPS-114 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-114"` |
| IPS-115 | Boundary | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-115"` |
| IPS-116 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-116"` |
| IPS-117 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-117"` |
| IPS-118 | Happy path | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-118"` |
| IPS-119 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-119"` |
| IPS-120 | State transition | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-120"` |
| IPS-121 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-121"` |
| IPS-122 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-122"` |
| IPS-123 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-123"` |
| IPS-124 | Boundary | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-124"` |
| IPS-125 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-125"` |
| IPS-126 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-126"` |
| IPS-127 | Idempotency | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-127"` |
| IPS-128 | Happy path | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-128"` |
| IPS-129 | Business rule | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-129"` |
| IPS-130 | State transition | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-130"` |
| IPS-131 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgnb.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.security.spec.ts -g "IPS-131"` |
| IPS-132 | Data integrity | `tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb-lap-theo-ycbg.functional.spec.ts -g "IPS-132"` |
| IPS-133 | Request validation | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-133"` |
| IPS-134 | Response contract | `tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.contract.spec.ts -g "IPS-134"` |
| IPS-135 | Error handling | `tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.validation.spec.ts -g "IPS-135"` |
| IPS-136 | Idempotency | `tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgnb.concurrency.spec.ts -g "IPS-136"` |
| RC-001 | Authentication | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-001"` |
| RC-002 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-002"` |
| RC-003 | Business rule | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-003"` |
| RC-004 | Business rule | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-004"` |
| RC-005 | State transition | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-005"` |
| RC-006 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-006"` |
| RC-007 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-007"` |
| RC-008 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-008"` |
| RC-009 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-009"` |
| RC-010 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-010"` |
| RC-011 | Idempotency | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-011"` |
| RC-012 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-012"` |
| RC-013 | Pagination/filter/sort | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-013"` |
| RC-014 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-014"` |
| RC-015 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-015"` |
| RC-016 | Boundary | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-016"` |
| RC-017 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-017"` |
| RC-018 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-018"` |
| RC-019 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-019"` |
| RC-020 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-020"` |
| RC-021 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-021"` |
| RC-022 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-022"` |
| RC-023 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-023"` |
| RC-024 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-024"` |
| RC-025 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-025"` |
| RC-026 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-026"` |
| RC-027 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-027"` |
| RC-028 | Boundary | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-028"` |
| RC-029 | Business rule | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-029"` |
| RC-030 | Business rule | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-030"` |
| RC-031 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-031"` |
| RC-032 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-032"` |
| RC-033 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-033"` |
| RC-034 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-034"` |
| RC-035 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-035"` |
| RC-036 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-036"` |
| RC-037 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-037"` |
| RC-038 | Business rule | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-038"` |
| RC-039 | Business rule | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-039"` |
| RC-040 | Business rule | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-040"` |
| RC-041 | Business rule | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-041"` |
| RC-042 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-042"` |
| RC-043 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-043"` |
| RC-044 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-044"` |
| RC-045 | Boundary | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-045"` |
| RC-046 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-046"` |
| RC-047 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-047"` |
| RC-048 | Happy path | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-048"` |
| RC-049 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-049"` |
| RC-050 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-050"` |
| RC-051 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-051"` |
| RC-052 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-052"` |
| RC-053 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-053"` |
| RC-054 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-054"` |
| RC-055 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-055"` |
| RC-056 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-056"` |
| RC-057 | Boundary | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-057"` |
| RC-058 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-058"` |
| RC-059 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-059"` |
| RC-060 | Idempotency | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-060"` |
| RC-061 | Happy path | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-061"` |
| RC-062 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-062"` |
| RC-063 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-063"` |
| RC-064 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-064"` |
| RC-065 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-065"` |
| RC-066 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-066"` |
| RC-067 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-067"` |
| RC-068 | Happy path | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-068"` |
| RC-069 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-069"` |
| RC-070 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-070"` |
| RC-071 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-gop-dau-muc.functional.spec.ts -g "RC-071"` |
| RC-072 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-072"` |
| RC-073 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-073"` |
| RC-074 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-074"` |
| RC-075 | Idempotency | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-075"` |
| RC-076 | Happy path | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-076"` |
| RC-077 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-077"` |
| RC-078 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-078"` |
| RC-079 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-079"` |
| RC-080 | State transition | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-080"` |
| RC-081 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-081"` |
| RC-082 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-082"` |
| RC-083 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-083"` |
| RC-084 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-084"` |
| RC-085 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-085"` |
| RC-086 | Idempotency | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-086"` |
| RC-087 | Happy path | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-087"` |
| RC-088 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-088"` |
| RC-089 | State transition | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-089"` |
| RC-090 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-090"` |
| RC-091 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-091"` |
| RC-092 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-092"` |
| RC-093 | Boundary | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-093"` |
| RC-094 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-094"` |
| RC-095 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-095"` |
| RC-096 | Idempotency | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-096"` |
| RC-097 | Happy path | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-097"` |
| RC-098 | State transition | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-098"` |
| RC-099 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-099"` |
| RC-100 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-100"` |
| RC-101 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-101"` |
| RC-102 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-102"` |
| RC-103 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-103"` |
| RC-104 | Boundary | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-104"` |
| RC-105 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-105"` |
| RC-106 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-106"` |
| RC-107 | Idempotency | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-107"` |
| RC-108 | Happy path | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-108"` |
| RC-109 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-109"` |
| RC-110 | Business rule | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-110"` |
| RC-111 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-111"` |
| RC-112 | Data integrity | `tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh-trang-thai.functional.spec.ts -g "RC-112"` |
| RC-113 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-113"` |
| RC-114 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-114"` |
| RC-115 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-115"` |
| RC-116 | Idempotency | `tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.concurrency.spec.ts -g "RC-116"` |
| RC-117 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-117"` |
| RC-118 | File API | `tests/api/quan-ly-bao-gia/bgkh.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.integration.spec.ts -g "RC-118"` |
| RC-119 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-119"` |
| RC-120 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-120"` |
| RC-121 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-121"` |
| RC-122 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-122"` |
| RC-123 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-123"` |
| RC-124 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-124"` |
| RC-125 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-125"` |
| RC-126 | Boundary | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-126"` |
| RC-127 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-127"` |
| RC-128 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-128"` |
| RC-129 | Pagination/filter/sort | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-129"` |
| RC-130 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-130"` |
| RC-131 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-131"` |
| RC-132 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-132"` |
| RC-133 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-133"` |
| RC-134 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-134"` |
| RC-135 | Happy path | `tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.functional.spec.ts -g "RC-135"` |
| RC-136 | Ownership/IDOR | `tests/api/quan-ly-bao-gia/bgkh.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.security.spec.ts -g "RC-136"` |
| RC-137 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-137"` |
| RC-138 | Response contract | `tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.contract.spec.ts -g "RC-138"` |
| RC-139 | Error handling | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-139"` |
| RC-140 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-140"` |
| RC-141 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-141"` |
| RC-142 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-142"` |
| RC-143 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-143"` |
| RC-144 | Request validation | `tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/quan-ly-bao-gia/bgkh.validation.spec.ts -g "RC-144"` |
| ORD-001 | Authentication | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-001"` |
| ORD-002 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-002"` |
| ORD-003 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-003"` |
| ORD-004 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-004"` |
| ORD-005 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-005"` |
| ORD-006 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-006"` |
| ORD-007 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-007"` |
| ORD-008 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-008"` |
| ORD-009 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-009"` |
| ORD-010 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-010"` |
| ORD-011 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-011"` |
| ORD-012 | Pagination/filter/sort | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-012"` |
| ORD-013 | Pagination/filter/sort | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-013"` |
| ORD-014 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-014"` |
| ORD-015 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-015"` |
| ORD-016 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-016"` |
| ORD-017 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-017"` |
| ORD-018 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-018"` |
| ORD-019 | State transition | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-019"` |
| ORD-020 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-020"` |
| ORD-021 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-021"` |
| ORD-022 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-022"` |
| ORD-023 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-023"` |
| ORD-024 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-024"` |
| ORD-025 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-025"` |
| ORD-026 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-026"` |
| ORD-027 | Input security | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-027"` |
| ORD-028 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-028"` |
| ORD-029 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-029"` |
| ORD-030 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-030"` |
| ORD-031 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-031"` |
| ORD-032 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-032"` |
| ORD-033 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-033"` |
| ORD-034 | Idempotency | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-034"` |
| ORD-035 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-035"` |
| ORD-036 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-036"` |
| ORD-037 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-037"` |
| ORD-038 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-038"` |
| ORD-039 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-039"` |
| ORD-040 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-040"` |
| ORD-041 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-041"` |
| ORD-042 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-042"` |
| ORD-043 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-043"` |
| ORD-044 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-044"` |
| ORD-045 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-045"` |
| ORD-046 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-046"` |
| ORD-047 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-047"` |
| ORD-048 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-048"` |
| ORD-049 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-049"` |
| ORD-050 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-050"` |
| ORD-051 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-051"` |
| ORD-052 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-052"` |
| ORD-053 | CRUD | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-053"` |
| ORD-054 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-054"` |
| ORD-055 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-055"` |
| ORD-056 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-056"` |
| ORD-057 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-057"` |
| ORD-058 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-058"` |
| ORD-059 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-059"` |
| ORD-060 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-060"` |
| ORD-061 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-061"` |
| ORD-062 | State transition | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-062"` |
| ORD-063 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-063"` |
| ORD-064 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-064"` |
| ORD-065 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-065"` |
| ORD-066 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-066"` |
| ORD-067 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-067"` |
| ORD-068 | Idempotency | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-068"` |
| ORD-069 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-069"` |
| ORD-070 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-070"` |
| ORD-071 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-071"` |
| ORD-072 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-072"` |
| ORD-073 | State transition | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-073"` |
| ORD-074 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-074"` |
| ORD-075 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-075"` |
| ORD-076 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-076"` |
| ORD-077 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-077"` |
| ORD-078 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-078"` |
| ORD-079 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-079"` |
| ORD-080 | Idempotency | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-080"` |
| ORD-081 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-081"` |
| ORD-082 | State transition | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-082"` |
| ORD-083 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-083"` |
| ORD-084 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-084"` |
| ORD-085 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.functional.spec.ts -g "ORD-085"` |
| ORD-086 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-086"` |
| ORD-087 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-087"` |
| ORD-088 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-088"` |
| ORD-089 | Idempotency | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-089"` |
| ORD-090 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-090"` |
| ORD-091 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-091"` |
| ORD-092 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-092"` |
| ORD-093 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-093"` |
| ORD-094 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-094"` |
| ORD-095 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-095"` |
| ORD-096 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-096"` |
| ORD-097 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-097"` |
| ORD-098 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-098"` |
| ORD-099 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-099"` |
| ORD-100 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-100"` |
| ORD-101 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-101"` |
| ORD-102 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-102"` |
| ORD-103 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-103"` |
| ORD-104 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-104"` |
| ORD-105 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-105"` |
| ORD-106 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-106"` |
| ORD-107 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-107"` |
| ORD-108 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-108"` |
| ORD-109 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-109"` |
| ORD-110 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-110"` |
| ORD-111 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-111"` |
| ORD-112 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-112"` |
| ORD-113 | State transition | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-113"` |
| ORD-114 | State transition | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-114"` |
| ORD-115 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-115"` |
| ORD-116 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-116"` |
| ORD-117 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-117"` |
| ORD-118 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-118"` |
| ORD-119 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-119"` |
| ORD-120 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-120"` |
| ORD-121 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-121"` |
| ORD-122 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-122"` |
| ORD-123 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-123"` |
| ORD-124 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-124"` |
| ORD-125 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-125"` |
| ORD-126 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-126"` |
| ORD-127 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-127"` |
| ORD-128 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-128"` |
| ORD-129 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-129"` |
| ORD-130 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-130"` |
| ORD-131 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-131"` |
| ORD-132 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-132"` |
| ORD-133 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-133"` |
| ORD-134 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-134"` |
| ORD-135 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-135"` |
| ORD-136 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-136"` |
| ORD-137 | State transition | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-137"` |
| ORD-138 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-138"` |
| ORD-139 | Concurrency | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-139"` |
| ORD-140 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-140"` |
| ORD-141 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-141"` |
| ORD-142 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-142"` |
| ORD-143 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.validation.spec.ts -g "ORD-143"` |
| ORD-144 | Idempotency | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-144"` |
| ORD-145 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-145"` |
| ORD-146 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-146"` |
| ORD-147 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-147"` |
| ORD-148 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-148"` |
| ORD-149 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-149"` |
| ORD-150 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-150"` |
| ORD-151 | Pagination/filter/sort | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-151"` |
| ORD-152 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-152"` |
| ORD-153 | File API | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-153"` |
| ORD-154 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-154"` |
| ORD-155 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-155"` |
| ORD-156 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-156"` |
| ORD-157 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-157"` |
| ORD-158 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-158"` |
| ORD-159 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-159"` |
| ORD-160 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-160"` |
| ORD-161 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-161"` |
| ORD-162 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-162"` |
| ORD-163 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-163"` |
| ORD-164 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-164"` |
| ORD-165 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-165"` |
| ORD-166 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-166"` |
| ORD-167 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-167"` |
| ORD-168 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-168"` |
| ORD-169 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-169"` |
| ORD-170 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-170"` |
| ORD-171 | File API | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-171"` |
| ORD-172 | File API | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-172"` |
| ORD-173 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-173"` |
| ORD-174 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-174"` |
| ORD-175 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-175"` |
| ORD-176 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-176"` |
| ORD-177 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-177"` |
| ORD-178 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-178"` |
| ORD-179 | Idempotency | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-179"` |
| ORD-180 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-180"` |
| ORD-181 | File API | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-181"` |
| ORD-182 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-182"` |
| ORD-183 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-183"` |
| ORD-184 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-184"` |
| ORD-185 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-185"` |
| ORD-186 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-186"` |
| ORD-187 | File API | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-187"` |
| ORD-188 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-188"` |
| ORD-189 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-189"` |
| ORD-190 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-190"` |
| ORD-191 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-191"` |
| ORD-192 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-192"` |
| ORD-193 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-193"` |
| ORD-194 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-194"` |
| ORD-195 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-195"` |
| ORD-196 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-196"` |
| ORD-197 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-197"` |
| ORD-198 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-198"` |
| ORD-199 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-199"` |
| ORD-200 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-200"` |
| ORD-201 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-201"` |
| ORD-202 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-202"` |
| ORD-203 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-203"` |
| ORD-204 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-204"` |
| ORD-205 | File API | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-205"` |
| ORD-206 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-206"` |
| ORD-207 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-207"` |
| ORD-208 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.functional.spec.ts -g "ORD-208"` |
| ORD-209 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-209"` |
| ORD-210 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-210"` |
| ORD-211 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-chung-tu-xe.validation.spec.ts -g "ORD-211"` |
| ORD-212 | Idempotency | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-212"` |
| ORD-213 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-213"` |
| ORD-214 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-214"` |
| ORD-215 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-215"` |
| ORD-216 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-216"` |
| ORD-217 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-217"` |
| ORD-218 | Happy path | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-218"` |
| ORD-219 | Business rule | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-219"` |
| ORD-220 | Ownership/IDOR | `tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-220"` |
| ORD-221 | Data integrity | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.functional.spec.ts -g "ORD-221"` |
| ORD-222 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-222"` |
| ORD-223 | Boundary | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-223"` |
| ORD-224 | Response contract | `tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.contract.spec.ts -g "ORD-224"` |
| ORD-225 | Error handling | `tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-phieu.validation.spec.ts -g "ORD-225"` |
| ORD-226 | Idempotency | `tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.concurrency.spec.ts -g "ORD-226"` |
| ORD-227 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-227"` |
| ORD-228 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-228"` |
| ORD-229 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-229"` |
| ORD-230 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-230"` |
| ORD-231 | Request validation | `tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-trang-thai.validation.spec.ts -g "ORD-231"` |
| ORD-232 | File API | `tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.integration.spec.ts -g "ORD-232"` |
| ORD-233 | State transition | `tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu-doanh-thu.functional.spec.ts -g "ORD-233"` |
| PNL-001 | Authentication | `tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts -g "PNL-001"` |
| PNL-002 | Happy path | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-002"` |
| PNL-003 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-003"` |
| PNL-004 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-004"` |
| PNL-005 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-005"` |
| PNL-006 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-006"` |
| PNL-007 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-007"` |
| PNL-008 | Ownership/IDOR | `tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts -g "PNL-008"` |
| PNL-009 | Request validation | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-009"` |
| PNL-010 | Response contract | `tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts -g "PNL-010"` |
| PNL-011 | Error handling | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-011"` |
| PNL-012 | Happy path | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-012"` |
| PNL-013 | File API | `tests/api/chi-phi-doanh-thu/pnl-phieu.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.integration.spec.ts -g "PNL-013"` |
| PNL-014 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-014"` |
| PNL-015 | Ownership/IDOR | `tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts -g "PNL-015"` |
| PNL-016 | Request validation | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-016"` |
| PNL-017 | Response contract | `tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts -g "PNL-017"` |
| PNL-018 | Error handling | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-018"` |
| PNL-019 | Happy path | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-019"` |
| PNL-020 | Request validation | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-020"` |
| PNL-021 | Response contract | `tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts -g "PNL-021"` |
| PNL-022 | Error handling | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-022"` |
| PNL-023 | Happy path | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-023"` |
| PNL-024 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-024"` |
| PNL-025 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-025"` |
| PNL-026 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-026"` |
| PNL-027 | Business rule | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-027"` |
| PNL-028 | Ownership/IDOR | `tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.security.spec.ts -g "PNL-028"` |
| PNL-029 | Data integrity | `tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.functional.spec.ts -g "PNL-029"` |
| PNL-030 | Request validation | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-030"` |
| PNL-031 | Request validation | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-031"` |
| PNL-032 | Boundary | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-032"` |
| PNL-033 | Response contract | `tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.contract.spec.ts -g "PNL-033"` |
| PNL-034 | Error handling | `tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/pnl-phieu.validation.spec.ts -g "PNL-034"` |
| CR-001 | Authentication | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts -g "CR-001"` |
| CR-002 | Happy path | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-002"` |
| CR-003 | Pagination/filter/sort | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-003"` |
| CR-004 | Pagination/filter/sort | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-004"` |
| CR-005 | Pagination/filter/sort | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-005"` |
| CR-006 | Pagination/filter/sort | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-006"` |
| CR-007 | Authorization | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.security.spec.ts -g "CR-007"` |
| CR-008 | Request validation | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-008"` |
| CR-009 | Boundary | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-009"` |
| CR-010 | Response contract | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-010"` |
| CR-011 | Error handling | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-011"` |
| CR-012 | Happy path | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-012"` |
| CR-013 | Business rule | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-013"` |
| CR-014 | Pagination/filter/sort | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-014"` |
| CR-015 | Request validation | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-015"` |
| CR-016 | Response contract | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-016"` |
| CR-017 | Error handling | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-017"` |
| CR-018 | Happy path | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-018"` |
| CR-019 | Response contract | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-019"` |
| CR-020 | Error handling | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-020"` |
| CR-021 | Happy path | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-021"` |
| CR-022 | Response contract | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-022"` |
| CR-023 | Error handling | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-023"` |
| CR-024 | Happy path | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-024"` |
| CR-025 | File API | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.integration.spec.ts -g "CR-025"` |
| CR-026 | Business rule | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-026"` |
| CR-027 | Business rule | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-027"` |
| CR-028 | Business rule | Thủ công | Không tự động | - |
| CR-029 | Business rule | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-029"` |
| CR-030 | Data integrity | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-030"` |
| CR-031 | Response contract | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-031"` |
| CR-032 | Error handling | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-032"` |
| CR-033 | Idempotency | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.concurrency.spec.ts -g "CR-033"` |
| CR-034 | Happy path | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-034"` |
| CR-035 | Ownership/IDOR | Thủ công | Không tự động | - |
| CR-036 | File API | Thủ công | Không tự động | - |
| CR-037 | Request validation | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-037"` |
| CR-038 | Response contract | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-038"` |
| CR-039 | Error handling | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-039"` |
| CR-040 | Happy path | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.functional.spec.ts -g "CR-040"` |
| CR-041 | File API | Thủ công | Không tự động | - |
| CR-042 | Ownership/IDOR | Thủ công | Không tự động | - |
| CR-043 | Request validation | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-043"` |
| CR-044 | Response contract | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.contract.spec.ts -g "CR-044"` |
| CR-045 | Error handling | `tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/chi-phi-doanh-thu/bao-cao-chi-phi-doanh-thu.validation.spec.ts -g "CR-045"` |
| K3O-001 | Authentication | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-001"` |
| K3O-002 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-002"` |
| K3O-003 | Ownership/IDOR | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-003"` |
| K3O-004 | Pagination/filter/sort | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-004"` |
| K3O-005 | Pagination/filter/sort | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-005"` |
| K3O-006 | Request validation | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-006"` |
| K3O-007 | Boundary | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-007"` |
| K3O-008 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-008"` |
| K3O-009 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-009"` |
| K3O-010 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-010"` |
| K3O-011 | Pagination/filter/sort | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-011"` |
| K3O-012 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-012"` |
| K3O-013 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-013"` |
| K3O-014 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-014"` |
| K3O-015 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-015"` |
| K3O-016 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-016"` |
| K3O-017 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-017"` |
| K3O-018 | Ownership/IDOR | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-018"` |
| K3O-019 | Business rule | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-019"` |
| K3O-020 | Request validation | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-020"` |
| K3O-021 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-021"` |
| K3O-022 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-022"` |
| K3O-023 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-023"` |
| K3O-024 | Business rule | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-024"` |
| K3O-025 | State transition | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-025"` |
| K3O-026 | Data integrity | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-026"` |
| K3O-027 | Request validation | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-027"` |
| K3O-028 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-028"` |
| K3O-029 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-029"` |
| K3O-030 | Idempotency | `tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts -g "K3O-030"` |
| K3O-031 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-031"` |
| K3O-032 | Business rule | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-032"` |
| K3O-033 | State transition | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-033"` |
| K3O-034 | Data integrity | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-034"` |
| K3O-035 | Request validation | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-035"` |
| K3O-036 | Boundary | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-036"` |
| K3O-037 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-037"` |
| K3O-038 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-038"` |
| K3O-039 | Idempotency | `tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts -g "K3O-039"` |
| K3O-040 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-040"` |
| K3O-041 | Request validation | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-041"` |
| K3O-042 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-042"` |
| K3O-043 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-043"` |
| K3O-044 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-044"` |
| K3O-045 | Business rule | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-045"` |
| K3O-046 | Business rule | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-046"` |
| K3O-047 | State transition | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-047"` |
| K3O-048 | Business rule | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-048"` |
| K3O-049 | Data integrity | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-049"` |
| K3O-050 | Request validation | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-050"` |
| K3O-051 | Boundary | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-051"` |
| K3O-052 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-052"` |
| K3O-053 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-053"` |
| K3O-054 | Idempotency | `tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.concurrency.spec.ts -g "K3O-054"` |
| K3O-055 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-055"` |
| K3O-056 | Request validation | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-056"` |
| K3O-057 | Boundary | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-057"` |
| K3O-058 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-058"` |
| K3O-059 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-059"` |
| K3O-060 | Pagination/filter/sort | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-060"` |
| K3O-061 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-061"` |
| K3O-062 | File API | `tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts -g "K3O-062"` |
| K3O-063 | Ownership/IDOR | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-063"` |
| K3O-064 | Request validation | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-064"` |
| K3O-065 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-065"` |
| K3O-066 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-066"` |
| K3O-067 | Happy path | `tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.functional.spec.ts -g "K3O-067"` |
| K3O-068 | File API | `tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.integration.spec.ts -g "K3O-068"` |
| K3O-069 | Ownership/IDOR | `tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.security.spec.ts -g "K3O-069"` |
| K3O-070 | Request validation | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-070"` |
| K3O-071 | Response contract | `tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.contract.spec.ts -g "K3O-071"` |
| K3O-072 | Error handling | `tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/phieu-cc.validation.spec.ts -g "K3O-072"` |
| K3S-001 | Authentication | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-001"` |
| K3S-002 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-002"` |
| K3S-003 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-003"` |
| K3S-004 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-004"` |
| K3S-005 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-005"` |
| K3S-006 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-006"` |
| K3S-007 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-007"` |
| K3S-008 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-008"` |
| K3S-009 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-009"` |
| K3S-010 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-010"` |
| K3S-011 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-011"` |
| K3S-012 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-012"` |
| K3S-013 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-013"` |
| K3S-014 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-014"` |
| K3S-015 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-015"` |
| K3S-016 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-016"` |
| K3S-017 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-017"` |
| K3S-018 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-018"` |
| K3S-019 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-019"` |
| K3S-020 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-020"` |
| K3S-021 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-021"` |
| K3S-022 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-022"` |
| K3S-023 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-023"` |
| K3S-024 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-024"` |
| K3S-025 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-025"` |
| K3S-026 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-026"` |
| K3S-027 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-027"` |
| K3S-028 | State transition | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-028"` |
| K3S-029 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-029"` |
| K3S-030 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-030"` |
| K3S-031 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-031"` |
| K3S-032 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-032"` |
| K3S-033 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-033"` |
| K3S-034 | Idempotency | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-034"` |
| K3S-035 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-035"` |
| K3S-036 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-036"` |
| K3S-037 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-037"` |
| K3S-038 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-038"` |
| K3S-039 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-039"` |
| K3S-040 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-040"` |
| K3S-041 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-041"` |
| K3S-042 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-042"` |
| K3S-043 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-043"` |
| K3S-044 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-044"` |
| K3S-045 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-045"` |
| K3S-046 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-046"` |
| K3S-047 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-047"` |
| K3S-048 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-048"` |
| K3S-049 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-049"` |
| K3S-050 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-050"` |
| K3S-051 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-051"` |
| K3S-052 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-052"` |
| K3S-053 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-053"` |
| K3S-054 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-054"` |
| K3S-055 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-055"` |
| K3S-056 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-056"` |
| K3S-057 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-057"` |
| K3S-058 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-058"` |
| K3S-059 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-059"` |
| K3S-060 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-060"` |
| K3S-061 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-061"` |
| K3S-062 | Boundary | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-062"` |
| K3S-063 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-063"` |
| K3S-064 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-064"` |
| K3S-065 | Idempotency | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-065"` |
| K3S-066 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-066"` |
| K3S-067 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-067"` |
| K3S-068 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-068"` |
| K3S-069 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-069"` |
| K3S-070 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-070"` |
| K3S-071 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-071"` |
| K3S-072 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-072"` |
| K3S-073 | Boundary | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-073"` |
| K3S-074 | Boundary | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-074"` |
| K3S-075 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-075"` |
| K3S-076 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-076"` |
| K3S-077 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-077"` |
| K3S-078 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-078"` |
| K3S-080 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-080"` |
| K3S-081 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-081"` |
| K3S-082 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-082"` |
| K3S-083 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-083"` |
| K3S-084 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-084"` |
| K3S-085 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-dieu-phoi.functional.spec.ts -g "K3S-085"` |
| K3S-086 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-086"` |
| K3S-087 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-087"` |
| K3S-088 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-088"` |
| K3S-089 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-089"` |
| K3S-090 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-090"` |
| K3S-091 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-091"` |
| K3S-092 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-092"` |
| K3S-093 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-093"` |
| K3S-094 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-094"` |
| K3S-095 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-095"` |
| K3S-096 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-096"` |
| K3S-097 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-097"` |
| K3S-098 | Boundary | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-098"` |
| K3S-099 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-099"` |
| K3S-100 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-100"` |
| K3S-101 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-101"` |
| K3S-102 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-102"` |
| K3S-103 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-103"` |
| K3S-104 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-104"` |
| K3S-105 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-105"` |
| K3S-106 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-106"` |
| K3S-107 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-107"` |
| K3S-108 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-108"` |
| K3S-109 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-109"` |
| K3S-110 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-110"` |
| K3S-111 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-111"` |
| K3S-112 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-112"` |
| K3S-113 | Input security | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-113"` |
| K3S-114 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-114"` |
| K3S-115 | Boundary | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-115"` |
| K3S-116 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-116"` |
| K3S-117 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-117"` |
| K3S-118 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-118"` |
| K3S-119 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-119"` |
| K3S-120 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-120"` |
| K3S-121 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-121"` |
| K3S-122 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-122"` |
| K3S-123 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-123"` |
| K3S-124 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-124"` |
| K3S-125 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-125"` |
| K3S-126 | State transition | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-126"` |
| K3S-127 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-127"` |
| K3S-128 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-128"` |
| K3S-129 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-129"` |
| K3S-130 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-130"` |
| K3S-131 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-131"` |
| K3S-132 | Idempotency | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-132"` |
| K3S-133 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-133"` |
| K3S-134 | Pagination/filter/sort | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-134"` |
| K3S-135 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-135"` |
| K3S-136 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-136"` |
| K3S-137 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-137"` |
| K3S-138 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-138"` |
| K3S-139 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-139"` |
| K3S-140 | File API | `tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts -g "K3S-140"` |
| K3S-141 | File API | `tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts -g "K3S-141"` |
| K3S-142 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-142"` |
| K3S-143 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-143"` |
| K3S-144 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-144"` |
| K3S-145 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-145"` |
| K3S-146 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-146"` |
| K3S-147 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-147"` |
| K3S-148 | Idempotency | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-148"` |
| K3S-149 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-149"` |
| K3S-150 | File API | `tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts -g "K3S-150"` |
| K3S-151 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-151"` |
| K3S-152 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-152"` |
| K3S-153 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-153"` |
| K3S-154 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-154"` |
| K3S-155 | Happy path | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-155"` |
| K3S-156 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-156"` |
| K3S-157 | Ownership/IDOR | `tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.security.spec.ts -g "K3S-157"` |
| K3S-158 | Data integrity | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-158"` |
| K3S-159 | Request validation | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-159"` |
| K3S-160 | Response contract | `tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.contract.spec.ts -g "K3S-160"` |
| K3S-161 | Error handling | `tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.validation.spec.ts -g "K3S-161"` |
| K3S-162 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-162"` |
| K3S-163 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-163"` |
| K3S-164 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-164"` |
| K3S-165 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-165"` |
| K3S-166 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-166"` |
| K3S-167 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-167"` |
| K3S-168 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-168"` |
| K3S-169 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-169"` |
| K3S-170 | Business rule | `tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-thuc-te-hoan-thanh.functional.spec.ts -g "K3S-170"` |
| K3S-171 | Concurrency | `tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.concurrency.spec.ts -g "K3S-171"` |
| K3S-172 | File API | `tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con.integration.spec.ts -g "K3S-172"` |
| K3S-173 | State transition | `tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/dich-vu-con-chi-phi.functional.spec.ts -g "K3S-173"` |
| K3X-001 | Authentication | `tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts -g "K3X-001"` |
| K3X-032 | Happy path | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-032"` |
| K3X-033 | Request validation | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-033"` |
| K3X-034 | Response contract | `tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts -g "K3X-034"` |
| K3X-035 | Error handling | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-035"` |
| K3X-036 | Happy path | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-036"` |
| K3X-037 | Business rule | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-037"` |
| K3X-038 | Ownership/IDOR | `tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts -g "K3X-038"` |
| K3X-039 | Data integrity | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-039"` |
| K3X-040 | Request validation | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-040"` |
| K3X-041 | Request validation | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-041"` |
| K3X-042 | Boundary | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-042"` |
| K3X-043 | Response contract | `tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts -g "K3X-043"` |
| K3X-044 | Error handling | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-044"` |
| K3X-045 | Idempotency | `tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts -g "K3X-045"` |
| K3X-046 | Happy path | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-046"` |
| K3X-047 | Business rule | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-047"` |
| K3X-048 | Business rule | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-048"` |
| K3X-049 | Ownership/IDOR | `tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.security.spec.ts -g "K3X-049"` |
| K3X-050 | Data integrity | `tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.functional.spec.ts -g "K3X-050"` |
| K3X-051 | Request validation | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-051"` |
| K3X-052 | Boundary | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-052"` |
| K3X-053 | Boundary | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-053"` |
| K3X-054 | Response contract | `tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.contract.spec.ts -g "K3X-054"` |
| K3X-055 | Error handling | `tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.validation.spec.ts -g "K3X-055"` |
| K3X-056 | Idempotency | `tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/thap-dieu-phoi/ngoai-le.concurrency.spec.ts -g "K3X-056"` |
| UI-LOGIN-001 | Hiển thị trang | `tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts -g "UI-LOGIN-001"` |
| UI-LOGIN-002 | Thao tác form | `tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts -g "UI-LOGIN-002"` |
| UI-LOGIN-003 | Form validation | `tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts -g "UI-LOGIN-003"` |
| UI-LOGIN-004 | Form validation | `tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts -g "UI-LOGIN-004"` |
| UI-LOGIN-005 | Thông báo | `tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.functional.spec.ts -g "UI-LOGIN-005"` |
| UI-LOGIN-006 | Session | `tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts -g "UI-LOGIN-006"` |
| UI-LOGIN-007 | Session | `tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts -g "UI-LOGIN-007"` |
| UI-LOGIN-008 | Session | `tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts -g "UI-LOGIN-008"` |
| UI-LOGIN-009 | Phân quyền UI | `tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.access.spec.ts -g "UI-LOGIN-009"` |
| UI-LOGIN-010 | Accessibility | `tests/ui/quan-tri-phan-quyen/dang-nhap.a11y.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.a11y.spec.ts -g "UI-LOGIN-010"` |
| UI-LOGIN-011 | Error handling | `tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/dang-nhap.validation.spec.ts -g "UI-LOGIN-011"` |
| UI-ADM-001 | Hiển thị trang | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-001"` |
| UI-ADM-002 | Bảng danh sách | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-002"` |
| UI-ADM-003 | Thao tác form | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-003"` |
| UI-ADM-004 | Form validation | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-004"` |
| UI-ADM-005 | Form validation | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-005"` |
| UI-ADM-006 | Thông báo | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-006"` |
| UI-ADM-007 | Bảng danh sách | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-007"` |
| UI-ADM-008 | Thao tác form | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-008"` |
| UI-ADM-009 | Form validation | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-009"` |
| UI-ADM-010 | Form validation | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-010"` |
| UI-ADM-011 | Form validation | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-011"` |
| UI-ADM-012 | Thao tác form | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-012"` |
| UI-ADM-013 | Thông báo | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-013"` |
| UI-ADM-014 | Upload/download | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-014"` |
| UI-ADM-015 | Trạng thái UI | `tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.validation.spec.ts -g "UI-ADM-015"` |
| UI-ADM-016 | Thao tác form | `tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.functional.spec.ts -g "UI-ADM-016"` |
| UI-ADM-017 | Phân quyền UI | `tests/ui/quan-tri-phan-quyen/phan-quyen.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-tri-phan-quyen/phan-quyen.access.spec.ts -g "UI-ADM-017"` |
| UI-LEG-001 | Hiển thị trang | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-001"` |
| UI-LEG-002 | Bảng danh sách | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-002"` |
| UI-LEG-003 | Bảng danh sách | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-003"` |
| UI-LEG-004 | Hiển thị trang | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-004"` |
| UI-LEG-005 | Form validation | `tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts -g "UI-LEG-005"` |
| UI-LEG-006 | Trạng thái UI | `tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts -g "UI-LEG-006"` |
| UI-LEG-007 | Thao tác form | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-007"` |
| UI-LEG-008 | Thông báo | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-008"` |
| UI-LEG-009 | Điều hướng | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-009"` |
| UI-LEG-010 | Thao tác form | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-010"` |
| UI-LEG-011 | Thao tác form | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-011"` |
| UI-LEG-012 | Thông báo | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-012"` |
| UI-LEG-013 | Form validation | `tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts -g "UI-LEG-013"` |
| UI-LEG-014 | Thao tác form | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-014"` |
| UI-LEG-015 | Thao tác form | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-015"` |
| UI-LEG-016 | Trạng thái UI | `tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.validation.spec.ts -g "UI-LEG-016"` |
| UI-LEG-017 | Hiển thị dữ liệu | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-017"` |
| UI-LEG-018 | Hiển thị dữ liệu | `tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-chang/cau-hinh-chang.functional.spec.ts -g "UI-LEG-018"` |
| UI-CFG-001 | Hiển thị trang | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-001"` |
| UI-CFG-002 | Hiển thị dữ liệu | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-002"` |
| UI-CFG-003 | Điều hướng | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-003"` |
| UI-CFG-004 | Hiển thị dữ liệu | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-004"` |
| UI-CFG-005 | Thao tác form | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-005"` |
| UI-CFG-006 | Thao tác form | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-006"` |
| UI-CFG-007 | Thông báo | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-007"` |
| UI-CFG-008 | Thông báo | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-008"` |
| UI-CFG-009 | Trạng thái UI | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "UI-CFG-009"` |
| UI-CFG-010 | Form validation | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "UI-CFG-010"` |
| UI-CFG-011 | Form validation | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "UI-CFG-011"` |
| UI-CFG-012 | Form validation | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.validation.spec.ts -g "UI-CFG-012"` |
| UI-CFG-013 | Hiển thị dữ liệu | `tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/cau-hinh-dau-muc-gia/dau-muc-gia.functional.spec.ts -g "UI-CFG-013"` |
| UI-BGM-001 | Hiển thị trang | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-001"` |
| UI-BGM-002 | Hiển thị dữ liệu | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-002"` |
| UI-BGM-003 | Bảng danh sách | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-003"` |
| UI-BGM-004 | Upload/download | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-004"` |
| UI-BGM-005 | Thao tác form | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-005"` |
| UI-BGM-006 | Thông báo | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-006"` |
| UI-BGM-007 | Hiển thị trang | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-007"` |
| UI-BGM-008 | Trạng thái UI | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts -g "UI-BGM-008"` |
| UI-BGM-009 | Thao tác form | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-009"` |
| UI-BGM-010 | Hiển thị dữ liệu | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-010"` |
| UI-BGM-011 | Thao tác form | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-011"` |
| UI-BGM-012 | Form validation | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts -g "UI-BGM-012"` |
| UI-BGM-013 | Hiển thị dữ liệu | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-013"` |
| UI-BGM-014 | Bảng danh sách | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-014"` |
| UI-BGM-015 | Thao tác form | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-015"` |
| UI-BGM-016 | Thao tác form | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-016"` |
| UI-BGM-017 | Hiển thị dữ liệu | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-017"` |
| UI-BGM-018 | Thao tác form | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-018"` |
| UI-BGM-019 | Thông báo | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-019"` |
| UI-BGM-020 | Thao tác form | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-020"` |
| UI-BGM-021 | Hiển thị dữ liệu | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.functional.spec.ts -g "UI-BGM-021"` |
| UI-BGM-022 | Trạng thái UI | `tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dau-vao/gia-mua-dau-vao.validation.spec.ts -g "UI-BGM-022"` |
| UI-SBP-001 | Hiển thị trang | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-001"` |
| UI-SBP-002 | Bảng danh sách | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-002"` |
| UI-SBP-003 | Hiển thị dữ liệu | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-003"` |
| UI-SBP-004 | Điều hướng | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-004"` |
| UI-SBP-005 | Thao tác form | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-005"` |
| UI-SBP-006 | Thao tác form | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-006"` |
| UI-SBP-007 | Form validation | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "UI-SBP-007"` |
| UI-SBP-008 | Form validation | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.validation.spec.ts -g "UI-SBP-008"` |
| UI-SBP-009 | Thao tác form | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-009"` |
| UI-SBP-010 | Thông báo | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-010"` |
| UI-SBP-011 | Thông báo | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-011"` |
| UI-SBP-012 | Thao tác form | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-012"` |
| UI-SBP-013 | Session | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.access.spec.ts -g "UI-SBP-013"` |
| UI-SBP-014 | Thông báo | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-014"` |
| UI-SBP-015 | Thông báo | `tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-mua-dinh-muc/gia-mua-dinh-muc.functional.spec.ts -g "UI-SBP-015"` |
| UI-SSP-001 | Hiển thị trang | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-001"` |
| UI-SSP-002 | Bảng danh sách | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-002"` |
| UI-SSP-003 | Trạng thái UI | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "UI-SSP-003"` |
| UI-SSP-004 | Điều hướng | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-004"` |
| UI-SSP-005 | Thao tác form | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-005"` |
| UI-SSP-006 | Thông báo | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-006"` |
| UI-SSP-007 | Thao tác form | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-007"` |
| UI-SSP-008 | Form validation | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "UI-SSP-008"` |
| UI-SSP-009 | Form validation | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.validation.spec.ts -g "UI-SSP-009"` |
| UI-SSP-010 | Thao tác form | `tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/gia-ban-dinh-muc/gia-ban-dinh-muc.functional.spec.ts -g "UI-SSP-010"` |
| UI-RFQ-001 | Hiển thị trang | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-001"` |
| UI-RFQ-002 | Phân quyền UI | `tests/ui/quan-ly-bao-gia/ycbg.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.access.spec.ts -g "UI-RFQ-002"` |
| UI-RFQ-003 | Bảng danh sách | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-003"` |
| UI-RFQ-004 | Hiển thị trang | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-004"` |
| UI-RFQ-005 | Hiển thị dữ liệu | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-005"` |
| UI-RFQ-006 | Form validation | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-006"` |
| UI-RFQ-007 | Thao tác form | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-007"` |
| UI-RFQ-008 | Thao tác form | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-008"` |
| UI-RFQ-009 | Trạng thái UI | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-009"` |
| UI-RFQ-010 | Form validation | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-010"` |
| UI-RFQ-011 | Điều hướng | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-011"` |
| UI-RFQ-012 | Upload/download | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-012"` |
| UI-RFQ-013 | Thông báo | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-013"` |
| UI-RFQ-014 | Form validation | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-014"` |
| UI-RFQ-015 | Form validation | `tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.validation.spec.ts -g "UI-RFQ-015"` |
| UI-RFQ-016 | Thao tác form | `tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/ycbg.functional.spec.ts -g "UI-RFQ-016"` |
| UI-IPS-001 | Hiển thị trang | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-001"` |
| UI-IPS-002 | Bảng danh sách | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-002"` |
| UI-IPS-003 | Hiển thị trang | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-003"` |
| UI-IPS-004 | Thao tác form | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-004"` |
| UI-IPS-005 | Thao tác form | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-005"` |
| UI-IPS-006 | Hiển thị dữ liệu | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-006"` |
| UI-IPS-007 | Form validation | `tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts -g "UI-IPS-007"` |
| UI-IPS-008 | Form validation | `tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.validation.spec.ts -g "UI-IPS-008"` |
| UI-IPS-009 | Hiển thị dữ liệu | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-009"` |
| UI-IPS-010 | Hiển thị dữ liệu | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-010"` |
| UI-IPS-011 | Hiển thị dữ liệu | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-011"` |
| UI-IPS-012 | Thông báo | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-012"` |
| UI-IPS-013 | Thao tác form | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-013"` |
| UI-IPS-014 | Thao tác form | `tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgnb.functional.spec.ts -g "UI-IPS-014"` |
| UI-RC-001 | Hiển thị trang | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-001"` |
| UI-RC-002 | Bảng danh sách | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-002"` |
| UI-RC-003 | Hiển thị dữ liệu | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-003"` |
| UI-RC-004 | Hiển thị dữ liệu | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-004"` |
| UI-RC-005 | Thao tác form | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-005"` |
| UI-RC-006 | Thao tác form | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-006"` |
| UI-RC-007 | Form validation | `tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts -g "UI-RC-007"` |
| UI-RC-008 | Hiển thị dữ liệu | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-008"` |
| UI-RC-009 | Hiển thị dữ liệu | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-009"` |
| UI-RC-010 | Upload/download | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-010"` |
| UI-RC-011 | Thao tác form | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-011"` |
| UI-RC-012 | Form validation | `tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts -g "UI-RC-012"` |
| UI-RC-013 | Thao tác form | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-013"` |
| UI-RC-014 | Thao tác form | `tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.functional.spec.ts -g "UI-RC-014"` |
| UI-RC-015 | Form validation | `tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts -g "UI-RC-015"` |
| UI-RC-016 | Form validation | `tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.validation.spec.ts -g "UI-RC-016"` |
| UI-RC-017 | Visual regression | `tests/ui/quan-ly-bao-gia/bgkh.visual.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/quan-ly-bao-gia/bgkh.visual.spec.ts -g "UI-RC-017"` |
| UI-ORD-001 | Hiển thị trang | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-001"` |
| UI-ORD-002 | Bảng danh sách | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-002"` |
| UI-ORD-003 | Hiển thị dữ liệu | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-003"` |
| UI-ORD-004 | Hiển thị trang | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-004"` |
| UI-ORD-005 | Hiển thị dữ liệu | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-005"` |
| UI-ORD-006 | Thao tác form | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-006"` |
| UI-ORD-007 | Form validation | `tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts -g "UI-ORD-007"` |
| UI-ORD-008 | Thao tác form | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-008"` |
| UI-ORD-009 | Hiển thị dữ liệu | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-009"` |
| UI-ORD-010 | Hiển thị dữ liệu | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-010"` |
| UI-ORD-011 | Hiển thị dữ liệu | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-011"` |
| UI-ORD-012 | Hiển thị dữ liệu | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-012"` |
| UI-ORD-013 | Thao tác form | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-013"` |
| UI-ORD-014 | Trạng thái UI | `tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts -g "UI-ORD-014"` |
| UI-ORD-015 | Form validation | `tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts -g "UI-ORD-015"` |
| UI-ORD-016 | Phân quyền UI | `tests/ui/phieu-dich-vu/phieu-dich-vu.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.access.spec.ts -g "UI-ORD-016"` |
| UI-ORD-017 | Hiển thị dữ liệu | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-017"` |
| UI-ORD-018 | Thông báo | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-018"` |
| UI-ORD-019 | Điều hướng | `tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.functional.spec.ts -g "UI-ORD-019"` |
| UI-ORD-020 | Trạng thái UI | `tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/phieu-dich-vu/phieu-dich-vu.validation.spec.ts -g "UI-ORD-020"` |
| UI-K3-001 | Hiển thị trang | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-001"` |
| UI-K3-002 | Bảng danh sách | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-002"` |
| UI-K3-003 | Phân quyền UI | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts -g "UI-K3-003"` |
| UI-K3-004 | Thao tác form | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-004"` |
| UI-K3-005 | Thao tác form | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-005"` |
| UI-K3-006 | Hiển thị dữ liệu | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-006"` |
| UI-K3-007 | Hiển thị dữ liệu | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-007"` |
| UI-K3-008 | Hiển thị dữ liệu | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-008"` |
| UI-K3-009 | Thông báo | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-009"` |
| UI-K3-010 | Thao tác form | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-010"` |
| UI-K3-011 | Trạng thái UI | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts -g "UI-K3-011"` |
| UI-K3-012 | Upload/download | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.functional.spec.ts -g "UI-K3-012"` |
| UI-K3-013 | Responsive | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.responsive.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.responsive.spec.ts -g "UI-K3-013"` |
| UI-K3-014 | Form validation | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.validation.spec.ts -g "UI-K3-014"` |
| UI-K3-015 | Session | `tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/thap-dieu-phoi/thap-dieu-phoi.access.spec.ts -g "UI-K3-015"` |
| UI-PNL-001 | Hiển thị trang | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-001"` |
| UI-PNL-002 | Bảng danh sách | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-002"` |
| UI-PNL-003 | Bảng danh sách | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-003"` |
| UI-PNL-004 | Form validation | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts -g "UI-PNL-004"` |
| UI-PNL-005 | Bảng danh sách | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-005"` |
| UI-PNL-006 | Hiển thị dữ liệu | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-006"` |
| UI-PNL-007 | Hiển thị dữ liệu | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-007"` |
| UI-PNL-008 | Form validation | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts -g "UI-PNL-008"` |
| UI-PNL-009 | Form validation | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts -g "UI-PNL-009"` |
| UI-PNL-010 | Thao tác form | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-010"` |
| UI-PNL-011 | Thông báo | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-011"` |
| UI-PNL-012 | Upload/download | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-012"` |
| UI-PNL-013 | Upload/download | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.functional.spec.ts -g "UI-PNL-013"` |
| UI-PNL-014 | Accessibility | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.a11y.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.a11y.spec.ts -g "UI-PNL-014"` |
| UI-PNL-015 | Error handling | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.validation.spec.ts -g "UI-PNL-015"` |
| UI-PNL-016 | Phân quyền UI | `tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/chi-phi-doanh-thu/chi-phi-doanh-thu.access.spec.ts -g "UI-PNL-016"` |
| UI-NTF-001 | Hiển thị dữ liệu | `tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts -g "UI-NTF-001"` |
| UI-NTF-002 | Điều hướng | `tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lich-su-thong-bao/thong-bao.functional.spec.ts -g "UI-NTF-002"` |
| UI-NTF-003 | Visual regression | `tests/ui/lich-su-thong-bao/thong-bao.visual.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lich-su-thong-bao/thong-bao.visual.spec.ts -g "UI-NTF-003"` |

## Biến môi trường

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| API_URL | Có | Địa chỉ API dev, ví dụ `https://logx-api-dev.sonthanh.net.vn` |
| WEB_URL | Có | Địa chỉ web dev, ví dụ `https://logx-dev.sonthanh.net.vn` |
| TENANT_CODE | Có | Mã tenant web gửi khi đăng nhập (`CONGTYA`) |
| ALLOWED_HOSTS | Không | Host được phép chạy, mặc định chỉ 2 host dev; host khác bị chặn |
| ADMIN_EMAIL, ADMIN_PASSWORD | Có | ADMIN (phân quyền, cấu hình chặng) |
| CC_K5_EMAIL, CC_K5_PASSWORD | Có | Trưởng điều phối, K5 xác nhận doanh thu, giá định mức |
| DP_K2_EMAIL, DP_K2_PASSWORD | Có | Định giá, điều phối mọi dịch vụ |
| K1_EMAIL, K1_PASSWORD | Có | K1 phụ trách KH_A |
| K1B_EMAIL, K1B_PASSWORD | Có | K1 thứ hai, không phụ trách KH_A (case truy cập chéo) |
| SALE_EMAIL, SALE_PASSWORD | Có | Tài khoản không có quyền module (case 403) |
| SALE2_EMAIL, SALE2_PASSWORD | Không | Tài khoản không quyền thứ hai |
| DP_KHQ…DP_KB, K4, K5_ONLY, VIEW_GIA, NO_ROLE `_EMAIL`, `_PASSWORD` | Không | Tài khoản tạo thêm bởi FLOW-ADM; case cần tới báo thiếu nếu để trống |
| NEW_USER_PASSWORD | Có cho case xác thực/quản trị | Mật khẩu ban đầu (đủ độ mạnh) cho tài khoản ADMIN tạo mới trong case đăng nhập, phiên, mật khẩu, phân quyền |
| TENANT_B_CODE, TENANT_B_EMAIL, TENANT_B_PASSWORD | Không | Tenant thứ hai cho FLOW-TEN |
| TENANT_B_PURCHASE_PRICE_ID, TENANT_B_RC_ID, TENANT_B_ORDER_ID, TENANT_B_DOCUMENT_ID, TENANT_B_SSP_ID, TENANT_B_COMPLETED_ORDER_IDS | Không | Id dữ liệu của tenant B cho FLOW-TEN-001/002 (thiếu thì case Blocked) |
| CC_ASYNC_EXPORT_ID | Không | Lượt xuất chạy nền READY của CC_K5 cho FLOW-TEN-003 (thiếu thì case Blocked) |
| EXPIRED_ACCESS_TOKEN | Không | Token thật đã hết hạn để kiểm thêm ở case Authentication |
| CUSTOMER_A_ID, CUSTOMER_B_ID | Có cho case nghiệp vụ | Khách hàng KH_A (K1 phụ trách, HĐ hiệu lực) và KH_B (K1B phụ trách) |
| CONTRACTOR_A_ID, CONTRACTOR_B_ID | Có cho case nghiệp vụ | Nhà thầu NT_A (VND) và NT_B (USD), đang hoạt động, HĐ hiệu lực |
| CUSTOMER_C_ID, CUSTOMER_D_ID, CUSTOMER_E_ID | Có cho case báo giá/phiếu | KH_C có HĐ, chưa có BGKH hiệu lực; KH_D HĐ hết hiệu lực còn BGKH; KH_E 2 BGKH hiệu lực chưa mặc định (K1 phụ trách) |
| CONTRACTOR_C_ID | Có cho case chặn | NT_C: nhà thầu Ngưng hoạt động |
| CONTRACTOR_D_ID, CONTRACTOR_E_ID | Có cho case kích hoạt/ngừng bảng giá | NT_D (VND), NT_E (USD): đang hoạt động, HĐ hiệu lực, chỉ dùng cho case tạo/kích hoạt/ngừng cả bảng giá mua và FLOW-PRICE |
| CONTRACTOR_STOPPED_ID | Có cho BGM-143 | Nhà thầu Dừng hợp tác |
| ALLOW_CLEANUP | Không | `true` mới dọn dữ liệu có testRunId sau mỗi case |
| UPLOAD_FILES_DIR, SIZE_FILES_DIR | Không | Thư mục file thật để upload |
| WORKERS | Không | Số worker Playwright |

## Thứ tự chạy lệnh

Chạy từ trên xuống, tại thư mục `AutoFullSys`.

### 1. Cài đặt

```bash
npm install
```

```bash
npx playwright install chromium
```

### 2. Cấu hình

Chép `.env.example` thành `.env` rồi điền tài khoản và id dữ liệu nền của môi trường dev.

```bash
cp .env.example .env
```

### 3. Chuẩn bị dữ liệu

Bước setup (đăng nhập từng vai trò 1 lần qua web, lưu phiên vào `.auth/`) tự chạy trước mọi lệnh bên dưới. Chạy luồng xuyên module trước để có dữ liệu nền bộ giá P0 và phiếu đủ 5 dịch vụ:

```bash
node tools/run-test.mjs tests/flows/xuyen-module --name xuyen-module
```

### 4. Chạy test

Chạy từng phần theo thứ tự, phần nào lỗi thì dừng lại xem trước khi chạy tiếp:

```bash
node tools/run-test.mjs tests/api --name api
```

```bash
node tools/run-test.mjs tests/flows --name flows
```

```bash
node tools/run-test.mjs tests/ui --name ui
```

Hoặc chạy toàn bộ một lần:

```bash
node tools/run-test.mjs
```

Chỉ chạy bộ smoke:

```bash
node tools/run-test.mjs --grep "@p1" --name smoke
```

Chạy riêng một module (ví dụ phiếu dịch vụ):

```bash
node tools/run-test.mjs tests/api/phieu-dich-vu tests/flows/phieu-dich-vu tests/ui/phieu-dich-vu --name phieu-dich-vu
```

Chạy một case:

```bash
node tools/run-test.mjs tests/api/phieu-dich-vu/phieu-dich-vu.security.spec.ts -g "ORD-001"
```

### 5. Xem kết quả và dọn dữ liệu

Mở thư mục `results/` (log, JSON, tổng kết, báo cáo HTML) và `evidence/<ID case>/`. Dữ liệu tạo trong case có tiền tố mã lần chạy (`at...`); đặt `ALLOW_CLEANUP=true` trước khi chạy để case tự dọn bản ghi của mình.

## Kết quả sau mỗi lần chạy

`tools/run-test.mjs` tự đánh số lần chạy theo tên và không ghi đè kết quả cũ:

| Trong `results/` | Nội dung |
|---|---|
| `toan-bo (lần 1).txt` | Log khi chạy |
| `toan-bo (lần 1).json` | Kết quả chi tiết dạng JSON |
| `toan-bo (lần 1) - tổng kết.md` | Số đạt, lỗi, bỏ qua và kết quả từng case |
| `toan-bo (lần 1) - html/` | Báo cáo HTML, có trace và ảnh của case lỗi |
| `LICH_SU_CHAY.md` | Danh sách mọi lần chạy |

Tên mặc định là `toan-bo`, hoặc lấy theo đường dẫn được chạy. Đặt tên riêng bằng `--name`.

Evidence của từng case lưu ở `evidence/<ID case>/`, mỗi lần chạy thêm file mới có hậu tố `(lần N)`, không xóa evidence cũ:

| Trong `evidence/<ID>/` | Nội dung |
|---|---|
| `<ID> (lần N) - ket-qua.md` | Kết quả, lần chạy, thời gian, lỗi đầy đủ |
| `<ID> (lần N) - evidence-api.json` | Request và response của từng lời gọi API trong case (token, mật khẩu đã che) |
| `<ID> (lần N) - screenshot.png` | Ảnh màn hình cuối case UI |
| `<ID> (lần N) - video.webm`, `trace.zip` | Video và trace khi case lỗi (mở trace bằng `npx playwright show-trace`) |

Case `test.fixme` không sinh evidence.

## Đối chiếu tài liệu

| Tài liệu | Phiên bản hoặc ngày | Trạng thái |
|---|---|---|
| Bộ case `TestcaseFullSys.md` | 08/11/2026 (2.071 case, 224 API) | Đang code: xem bảng case và file |
| Bản cấu trúc `StructFullSys.md` | 08/11/2026 (262 file) | Đúng cấu trúc |
| Báo cáo API `BAO_CAO_API_PHAM_VI_FULLSYS.md` | 08/11/2026 (224 API) | Client sinh đủ API |

## Điểm cần xác nhận

- **Chưa chạy lên hệ thống:** mọi kiểm tra mới là kiểm tra tĩnh (`tsc --noEmit`, `verify_code.py`, `playwright test --list`, đọc lại code).
- **Tình trạng code (08/11/2026, sau lượt hợp nhất với phần người dùng tự code):** 1.861/2.064 case auto đã code, 203 case `test.fixme`:
  - 186 case UI: cần locator trên web dev (đã có 21 case UI do người dùng code dựa trên giao diện thật);
  - 3 case FLOW-TEN: cần tenant thứ hai;
  - 14 case API/luồng có lý do ghi ngay trong code: PNL-003/007 (Swagger không có số liệu theo dịch vụ trong P&L), PNL-004 (cần nhà thầu báo CNY chưa có tỷ giá), CFG-015 (chưa rõ thao tác tự động nào ghi "Hệ thống" ở lịch sử cấu hình), IPS-090 (cần SSP Kho bãi "Tất cả"), IPS-091 (phải xóa SSP của bộ P0 dùng chung), IPS-129 (BGNB hết hạn phải chờ qua ngày), RFQ-076/077/137/138/141 (chưa rõ công thức đếm tổ hợp BR-36), RFQ-140 (tầng 3 của BR-39), FLOW-DEACT-011 (2 tổ hợp Phí kẹp chì trong 1 nhóm gộp).
- **Hợp nhất với code người dùng:** các khối `test.fixme` còn lại được thay đúng từng khối, không sinh lại cả file; file helper người dùng thêm trong `src/` (leg-sandbox, price-flow.fixture, pending-*, quote-*, admin-pending, login-scenario) đã khai báo bổ sung vào `StructFullSys.md`. 25 test gọi helper được bọc `await expect(helper(...)).resolves.toBeUndefined()` để script kiểm tra thấy assertion; hành vi không đổi (mọi `expect` vẫn nằm trong helper).
- **Mã HTTP theo tập mã:** test kiểm mã nằm trong tập mã ở cột Kết quả HTTP của case (vd `400/409/422`), không nới thêm mã.
- **Câu thông báo:** không so nguyên văn. Test kiểm body lỗi đủ `success=false`, `errorCode`, `message` khác rỗng; nội dung message lưu trong `evidence-api.json` để người dùng tự đánh giá (giữ cách làm đã thống nhất ở project cũ).
- **Lỗi đúng trường:** case thiếu trường/enum sai đọc tên trường lỗi trong `data.errors` (Swagger ApiError: "errors for the fields that failed validation"). Nếu hệ thống trả cấu trúc khác (không có `data.errors`) thì các case này fail và cần xác nhận định dạng lỗi.
- **Id thật cho case mẫu chung:** `testRun.prepare()` lấy id của bản ghi đang có trên môi trường (bản ghi đầu tiên của danh sách cùng nhánh), chỉ dùng cho case không sửa dữ liệu (401, id sai định dạng, id không tồn tại, sai phương thức, thiếu trường, cấu trúc phản hồi của API đọc). Môi trường trống thì case báo "Không tìm được dữ liệu thật…", cần chạy luồng `xuyen-module` trước.
- **"Không tạo bản ghi" ở API tạo mới:** kiểm bằng chuỗi đánh dấu duy nhất gắn vào body (không đếm tổng danh sách vì test chạy song song). Body không có trường chuỗi để đánh dấu thì ghi annotation "Không đọc lại".
- **Case `perPage` = 101:** theo cột Kết quả HTTP (`400/422`); cột Kiểm tra ghi "bị chặn hoặc ép về 100", đang chờ xác nhận ở bộ case.
- **Mã dịch vụ:** bộ case viết tắt KHQ/HQGS/VT/ST/KB; mã thật tra theo tên trong danh mục `GET /api/catalogues/service-types`.
- **Token hết hạn:** chỉ kiểm khi đặt `EXPIRED_ACCESS_TOKEN`; nếu không, case Authentication kiểm 3 trường hợp (không header, token sửa chữ ký, refresh token) và ghi annotation "Chưa kiểm token hết hạn".
- **Bảng giá NT_A/NT_B dùng chung:** mỗi nhà thầu chỉ có 1 bảng Đang hoạt động (BR39). Bộ giá riêng của case chỉ THÊM dòng vào bảng đang hoạt động của NT_A/NT_B; case phải kích hoạt/ngừng cả bảng dùng NT_D/NT_E và chạy tuần tự qua khóa file `nt-d`. Bộ P0 dùng chung tự dựng lại khi RC không còn mặc định hoặc bảng NT_A/NT_B bị ngừng.
- **Khóa file giữa các worker:** `nt-d` (bảng giá NT_D), `kh-c`/`kh-e` (RC của KH_C/KH_E, ngưng lại cuối case để khách về trạng thái ban đầu), `sod-mode` (thiết lập kiểm soát kiêm nhiệm, luôn trả giá trị cũ), `leg-sandbox` (quy tắc chặng, của người dùng).
- **Phiếu P0 "theo luồng xuyên suốt":** `p0Order(..., { editShift: true })` thêm bước K1 sửa doanh thu Phí lưu ca 250.000 (doanh thu phiếu 15.900.000). Phiếu dùng chung `performedP0`/`completedP0` đổi khóa cache sang `-v2` để không dùng lại phiếu cũ thiếu bước này.
- **Quy tắc chặng cho phiếu nội địa:** LEG-031/040/054 và FLOW-LEG-003 dùng quy tắc riêng "AT Quy tắc chặng Nội địa VN có phiếu dùng" (Nội địa VN → Nội địa VN), giữ lại giữa các lần chạy vì đã có phiếu dùng thì không xóa được; không sửa/xóa quy tắc seed của tuyến P0. Cần tổ hợp này còn trống ở lần đầu.
- **Tham số `query` của API lịch sử/audit:** Swagger khai báo 1 tham số object bắt buộc tên `query`. Code của tôi gửi các trường phẳng (`page`, `perPage`, `from`, `to`, `actorUserId`, `search`); helper `ADM.audit` của người dùng gửi `query=<JSON>`. Cần xem kết quả chạy để thống nhất một cách.
- **Mô phỏng chặng:** Swagger `POST /api/leg-rules/simulate` dùng trường `kind` (ADDRESS/BORDER_GATE) cho điểm đi/đến; `LegSandbox.simulationInput()` đang truyền `p0Refs().origin` (dùng `pointType`). Nếu LEG-060/061 báo lỗi 400 thì cần đổi sang `kind`.
- **Case lấy tự động BGNB (RFQ-075/082, FLOW-QUOTE-007/008/011, IPS-087…):** chỉ cho tổng đúng bộ P0 khi môi trường không còn đầu mục đang bật nào khác cùng tổ hợp P0 mà thiếu giá bán định mức (đầu mục "AT" riêng của các case khác cũng tính). Nên chạy nhóm này riêng hoặc tắt các đầu mục AT thừa trước.
- **FLOW-ADM-005:** khóa tạm K1B và chuyển KH_B sang K1 rồi trả lại; nên chạy riêng (`--workers=1`) để không làm rớt phiên K1B của case khác. ADM-USR-034/035 có bước mở khóa lại ngay nếu hệ thống khóa nhầm K1/K1B.
- **Case đăng nhập/phiên/mật khẩu (AUTH):** dùng tài khoản ADMIN tạo mới trong case thay cho K1 (1 tài khoản 1 phiên).
- **Cấu trúc phản hồi:** CFG-045, BGM-090, BGM-107 nêu `data.meta` nhưng Swagger của các API này không có `meta`; test kiểm theo Swagger và ghi annotation.
- **Case UI theo giao diện thật (khảo sát web dev 08/11/2026, chỉ xem/gõ thử rồi Hủy):** Page Object `dau-muc-gia`, `gia-mua-dau-vao`, `gia-mua-dinh-muc`, `gia-ban-dinh-muc` viết tay theo locator thật; helper chung ở `data-table.component.ts` (`selectByLabel`, `inputByLabel`, `pickOption` cho ô chọn tùy biến `div[tabindex=0]` có danh sách gắn cuối body, `cardNumber`, `moneyOf`, `vnd`). Mã HTTP của case UI kiểm bằng `uiApi(page, method, đường dẫn)` (chờ phản hồi API mà thao tác UI gọi). Case UI dùng phiên có sẵn của setup (`withQuotePage`), không đăng nhập lại.
- **Lệch tài liệu ở giao diện (viết case theo giao diện):** UI-CFG-009 web dev khóa sẵn ô tên/loại giá/nút xóa kèm tooltip "Đầu mục đã có giá gắn vào nên không đổi được tên, loại giá hoặc xóa — hãy tắt kích hoạt nếu muốn ngừng dùng" (không có bước "cố lưu" để thấy thông báo). Modal giá mua/bán định mức: ô trống hoặc 0 thì nút Lưu bị khóa, không hiện chữ báo lỗi; ô giá chỉ nhận chữ số (chữ và dấu "-" bị bỏ, "0,01" thành 1); nhập hàng loạt chưa đổi gì thì khóa Lưu; hộp thoại hủy là "Hủy nhập hàng loạt / Hủy N dòng đã thay đổi?"; lợi nhuận hiển thị "+20%".
- **UI-CFG-002/006 đếm số đầu mục:** case khác chạy song song có thể thêm đầu mục "AT" giữa lúc đếm; số lệch do song song thì chạy riêng (`--grep "UI-CFG-00(2|6)" --workers=1`). UI-CFG-010/011/012 chấp nhận kiểm tra trùng/thiếu ở trình duyệt (không gọi API); nếu có gọi API thì phải là 4xx.
- **Chỉnh để qua `verify_code.py` (không đổi ý case):** 98 test chỉ gọi 1 helper (`runPurchaseUi`, `runBuyingUi`, `runSellingUi`, `legUiCase`, `adminUiCase`, `notificationUiCase`, `runRemainingIps`…) được bọc `await expect(helper(...)).resolves.toBeUndefined()` (helper trả `Promise<void>`, assertion nằm trong helper). UI-ORD-008 đổi vòng lặp `waitForTimeout(500)` thành `expect.poll` (3 lần đọc liên tiếp đều không có thông báo). UI-K3-015 đổi `waitForTimeout(301_000)` thành `toPass` (thử lại mỗi 20 giây, tối đa 5 phút 30 giây) và kiểm tra khóa không mất trước 4 phút; timeout case nâng lên 480 giây. 4 ảnh `.ui-reference-*.png` ở gốc project chuyển vào `snapshots/ui-reference/`. 10 file người dùng mới thêm (`*-ui.scenario.ts`, `operations-ui.ts`, `order-create-ui.ts`, `remaining-quote-api.scenario.ts`, `tenant-scenario.ts`) đã ghi vào StructFullSys.md.
- **UI Báo giá nội bộ và Bộ lọc nâng cao BGKH (UI-IPS-002, 004–011, UI-RC-002):** code theo giao diện thật (khảo sát 08/11/2026 bằng CC_K5 và K1). Lệch tài liệu: ô "Tên báo giá" có `maxlength=200` (tài liệu 255) nên UI-IPS-008 giữ kỳ vọng tài liệu và sẽ fail ở 254/255 ký tự cho tới khi xác nhận; UI-IPS-008 chỉ kiểm ô tên (không tạo BGNB thật). Lợi nhuận trong form hiển thị dạng "15.8%" nên UI-IPS-005 chấp nhận 15,79% hoặc 15.8%. UI-IPS-010 cần môi trường có ít nhất 1 đầu mục chưa có giá bán định mức (BGNB tự động sẽ có bảng thiếu giá). UI-RC-002 dùng khoảng ngày "Tháng này" và khoảng tiền 16–17 triệu theo bộ case; tổng RC P0 (trước/sau VAT) cần xác nhận rơi vào khoảng này.
- **FLOW-TEN-001/002/003 đang Blocked (thiếu môi trường), chờ dữ liệu:** web và Swagger không có chỗ tạo tenant (người dùng tạo ở Phân quyền luôn thuộc `CONGTYA`); lượt xuất Excel chạy nền chỉ sinh khi > 5.000 phiếu (web dev hiện có 17). Mỗi case gọi `blockedUnless([...])` ở đầu: thiếu biến thì ghi annotation `Blocked` kèm tên biến và dừng, báo cáo `tools/run-test.mjs` đếm ở cột **Blocked** (không tính Lỗi, không tính Bỏ qua). Điền vào `.env` để chạy: FLOW-TEN-001 cần `TENANT_B_CODE`, `TENANT_B_EMAIL`, `TENANT_B_PASSWORD`, `TENANT_B_PURCHASE_PRICE_ID`, `TENANT_B_RC_ID`, `TENANT_B_ORDER_ID`, `TENANT_B_DOCUMENT_ID`, `TENANT_B_SSP_ID`; FLOW-TEN-002 cần 3 biến đăng nhập tenant B + `TENANT_B_COMPLETED_ORDER_IDS` (JSON 3 id); FLOW-TEN-003 chỉ cần `CC_ASYNC_EXPORT_ID` (không cần tenant B).
- **Tài khoản tạo thêm (08/11/2026, đã điền `.env`):** `at.dp_khq`, `at.dp_hqgs`, `at.dp_vt`, `at.dp_st`, `at.dp_kb`, `at.k5_only`, `at.view_gia`, `at.no_role` (@logxpro.test), tạo bằng ADMIN với mật khẩu ban đầu Logxpro@2026 rồi đổi lần đầu sang mật khẩu chung của tài khoản test. Vai trò cố định: "Điều phối {dịch vụ} – tài khoản test" (nhóm Dịch vụ {X} + Xem danh sách/chi tiết Phiếu dịch vụ Master), "Xác nhận doanh thu K5" (4 quyền K5 của Phiếu dịch vụ + Xem tổng hợp/chi tiết Chi phí - Doanh thu), "Chỉ xem giá – tài khoản test" (Xem danh sách/chi tiết 4 module giá); NO_ROLE không có vai trò. K4 để trống vì chưa có case dùng. Lưu ý: đăng nhập sai liên tiếp ~7 lần sẽ bị tạm khóa 15 phút (429).
- **Sửa lỗi code test perPage (08/11/2026):** API giới hạn `perPage` ≤ 100 (gửi lớn hơn trả 400). `TestRun.catalog()` (trước gửi 1000), `sheetItems()` và helper `LINES` trong 80 spec (trước gửi 200 cho `GET /api/purchase-prices/{id}/items`) đổi sang đọc từng trang 100 dòng tới hết; danh mục loại xe đổi 200 → 100. Các API không khai báo `perPage` trong Swagger (ô chọn nhà thầu, khách chọn được khi lập phiếu, cost-items, groups) giữ nguyên.
- **Bộ P0 đổi theo danh mục hiện có (người dùng chốt 08/11/2026: không thêm giá trị danh mục):** đơn vị "Lần" → "Khoản" (Phí ngoài giờ KHQ, Phí kẹp chì HQGS), "Lô" → "Lô hàng" (Phí giám sát HQGS, Phí lưu kho KB); nhóm hàng "Hàng tổng hợp" → "Linh kiện điện tử"; đặc tính "Hàng khô" → "Hàng thường"; điểm vận tải "Hà Nội" → "Hai Bà Trưng" (tỉnh vẫn Thành phố Hà Nội). Sửa ở `src/core/data/p0-price-set.ts`; chỗ nào bộ case ghi tên cũ thì hiểu theo tên mới.
- **Sửa code dựng dữ liệu cho khớp hệ thống thật (08/11/2026, phát hiện khi chạy dựng KH_E):** (1) `POST /api/price-configurations/{id}/items` và `POST /api/purchase-prices/{id}/items` bị 403 với mọi vai trò (rổ quyền chỉ có "Chỉnh sửa") → `createItem` dùng `PUT .../items` lưu toàn bộ danh sách (có khóa file theo phân hệ, gửi lại nguyên vẹn đầu mục cũ, kiểm tra không mất đầu mục), `addLines` dùng `PUT .../items` với `added`; (2) bảng giá mua có ngày hiệu lực hôm nay tự Đang hoạt động ngay khi tạo → chỉ kích hoạt khi còn Tạo mới; (3) YCBG bắt buộc `volumeUnitCode` đi cùng `monthlyVolume` và `contractRef` = mã hợp đồng hiện hành của khách; (4) khối dịch vụ YCBG dùng mảng `customsOfficeCodes`, `transloadPointCodes` + `cargoLoadTypeCode`, `storageUnitCode` (Swagger còn khai dạng đơn). Các case API kiểm `POST .../items` vẫn giữ nguyên kỳ vọng tài liệu (sẽ fail 403 nếu hệ thống giữ quyền như hiện tại).
- **Chặn bởi dữ liệu môi trường — chưa dựng được bộ P0:** BGNB bắt buộc mỗi bảng dịch vụ chọn dòng giá cho TẤT CẢ đầu mục của dịch vụ (SRS BGNB US_QUO_04 AC8). Phân hệ Khai báo hải quan trên web dev còn 6 đầu mục cũ (CD-010…CD-015) không có giá bán định mức khớp tuyến P0 (CD-010 chỉ có SSP-5896 "Tất cả" chưa có giá) → mọi BGNB có bảng KHQ bị 409. Vì vậy các case dựng bộ P0, KH_E và case đơn vị tính chưa chạy được cho tới khi xử lý dữ liệu này.
