# Auto test LogXPro — Lead, Khách hàng, Hợp đồng khách hàng, Nhà thầu, Hợp đồng nhà thầu

Project Playwright (TypeScript) kiểm tra 88 API của 5 module và các màn hình liên quan trên môi trường DEV của LogXPro. Căn cứ:

- Bộ case: `../TEST_CASE_AUTO.md` (1016 case: 1010 auto, 6 thủ công).
- Bản cấu trúc: `../CAU_TRUC_AUTO_TEST.md` (171 file test, 55 file hỗ trợ).
- Báo cáo API: `../BAO_CAO_API_PHAM_VI_TEST.md`; tên field lấy từ Swagger `../API.txt`.

Dữ liệu test sinh ngẫu nhiên: các trường số (mã số thuế, số điện thoại, hạn mức, số ngày thanh toán, điểm năng lực) dùng hàm random trong `src/utils/test-run.ts`; tên công ty, tên người, địa chỉ, lý do, tên hợp đồng dùng chuỗi tiếng Việt có nghĩa trong `src/data/*.factory.ts`, kèm `testRunId` để nhận diện.

## Bảng case và file

Script `verify_code.py` ghi bảng này, không sửa bằng tay.

| Case | Nhóm test | File | Trạng thái | Lệnh chạy |
|---|---|---|---|---|
| LEAD-001 | Happy path | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-001"` |
| LEAD-002 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-002"` |
| LEAD-003 | Pagination/filter/sort | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-003"` |
| LEAD-004 | Pagination/filter/sort | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-004"` |
| LEAD-005 | Pagination/filter/sort | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-005"` |
| LEAD-006 | Boundary | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-006"` |
| LEAD-007 | Request validation | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-007"` |
| LEAD-008 | Response contract | `tests/api/leads/lead.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.contract.spec.ts -g "LEAD-008"` |
| LEAD-009 | Authentication | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-009"` |
| LEAD-010 | Authentication | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-010"` |
| LEAD-011 | Input security | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-011"` |
| LEAD-012 | Authorization | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-012"` |
| LEAD-013 | Error handling | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-013"` |
| LEAD-014 | Happy path | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-014"` |
| LEAD-015 | State transition | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-015"` |
| LEAD-016 | Request validation | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-016"` |
| LEAD-017 | Request validation | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-017"` |
| LEAD-018 | Request validation | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-018"` |
| LEAD-019 | Boundary | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-019"` |
| LEAD-020 | Boundary | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-020"` |
| LEAD-021 | Boundary | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-021"` |
| LEAD-022 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-022"` |
| LEAD-023 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-023"` |
| LEAD-024 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-024"` |
| LEAD-025 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-025"` |
| LEAD-026 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-026"` |
| LEAD-027 | Data integrity | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-027"` |
| LEAD-028 | Idempotency | `tests/api/leads/lead.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.concurrency.spec.ts -g "LEAD-028"` |
| LEAD-029 | Concurrency | `tests/api/leads/lead.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.concurrency.spec.ts -g "LEAD-029"` |
| LEAD-030 | Input security | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-030"` |
| LEAD-031 | Response contract | `tests/api/leads/lead.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.contract.spec.ts -g "LEAD-031"` |
| LEAD-032 | Authentication | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-032"` |
| LEAD-033 | Authorization | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-033"` |
| LEAD-034 | Error handling | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-034"` |
| LEAD-035 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-035"` |
| LEAD-036 | Boundary | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-036"` |
| LEAD-037 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-037"` |
| LEAD-038 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-038"` |
| LEAD-039 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-039"` |
| LEAD-040 | Happy path | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-040"` |
| LEAD-041 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-041"` |
| LEAD-042 | Response contract | `tests/api/leads/lead.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.contract.spec.ts -g "LEAD-042"` |
| LEAD-043 | Authentication | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-043"` |
| LEAD-044 | Error handling | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-044"` |
| LEAD-045 | Happy path | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-045"` |
| LEAD-046 | File API | `tests/api/leads/lead-import-export.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.integration.spec.ts -g "LEAD-046"` |
| LEAD-047 | Business rule | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-047"` |
| LEAD-048 | Business rule | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-048"` |
| LEAD-049 | Pagination/filter/sort | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-049"` |
| LEAD-050 | Boundary | `tests/api/leads/lead-import-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-050"` |
| LEAD-051 | Request validation | `tests/api/leads/lead-import-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-051"` |
| LEAD-052 | Response contract | `tests/api/leads/lead-import-export.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.contract.spec.ts -g "LEAD-052"` |
| LEAD-053 | Authentication | `tests/api/leads/lead-import-export.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.security.spec.ts -g "LEAD-053"` |
| LEAD-054 | Error handling | `tests/api/leads/lead-import-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-054"` |
| LEAD-055 | Happy path | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-055"` |
| LEAD-056 | State transition | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-056"` |
| LEAD-057 | Business rule | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-057"` |
| LEAD-058 | Business rule | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-058"` |
| LEAD-059 | File API | `tests/api/leads/lead-import-export.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.integration.spec.ts -g "LEAD-059"` |
| LEAD-060 | Boundary | `tests/api/leads/lead-import-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-060"` |
| LEAD-061 | Request validation | `tests/api/leads/lead-import-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-061"` |
| LEAD-062 | Data integrity | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-062"` |
| LEAD-063 | Idempotency | `tests/api/leads/lead-import-export.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.concurrency.spec.ts -g "LEAD-063"` |
| LEAD-064 | Input security | `tests/api/leads/lead-import-export.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.security.spec.ts -g "LEAD-064"` |
| LEAD-065 | Error handling | `tests/api/leads/lead-import-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-065"` |
| LEAD-066 | Response contract | `tests/api/leads/lead-import-export.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.contract.spec.ts -g "LEAD-066"` |
| LEAD-067 | Authentication | `tests/api/leads/lead-import-export.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.security.spec.ts -g "LEAD-067"` |
| LEAD-068 | Business rule | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-068"` |
| LEAD-069 | Happy path | `tests/api/leads/lead-import-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.functional.spec.ts -g "LEAD-069"` |
| LEAD-070 | File API | `tests/api/leads/lead-import-export.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.integration.spec.ts -g "LEAD-070"` |
| LEAD-071 | File API | `tests/api/leads/lead-import-export.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.integration.spec.ts -g "LEAD-071"` |
| LEAD-072 | Response contract | `tests/api/leads/lead-import-export.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.contract.spec.ts -g "LEAD-072"` |
| LEAD-073 | Authentication | `tests/api/leads/lead-import-export.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.security.spec.ts -g "LEAD-073"` |
| LEAD-074 | Error handling | `tests/api/leads/lead-import-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-import-export.validation.spec.ts -g "LEAD-074"` |
| LEAD-075 | Happy path | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-075"` |
| LEAD-076 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-076"` |
| LEAD-077 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-077"` |
| LEAD-078 | Response contract | `tests/api/leads/lead.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.contract.spec.ts -g "LEAD-078"` |
| LEAD-079 | Authentication | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-079"` |
| LEAD-080 | Error handling | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-080"` |
| LEAD-081 | Happy path | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-081"` |
| LEAD-082 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-082"` |
| LEAD-083 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-083"` |
| LEAD-084 | Ownership/IDOR | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-084"` |
| LEAD-085 | Request validation | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-085"` |
| LEAD-086 | Response contract | `tests/api/leads/lead.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.contract.spec.ts -g "LEAD-086"` |
| LEAD-087 | Authentication | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-087"` |
| LEAD-088 | Error handling | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-088"` |
| LEAD-089 | Happy path | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-089"` |
| LEAD-090 | State transition | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-090"` |
| LEAD-091 | Request validation | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-091"` |
| LEAD-092 | Boundary | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-092"` |
| LEAD-093 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-093"` |
| LEAD-094 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-094"` |
| LEAD-095 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-095"` |
| LEAD-096 | Ownership/IDOR | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-096"` |
| LEAD-097 | Data integrity | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-097"` |
| LEAD-098 | Response contract | `tests/api/leads/lead.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.contract.spec.ts -g "LEAD-098"` |
| LEAD-099 | Authentication | `tests/api/leads/lead.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.security.spec.ts -g "LEAD-099"` |
| LEAD-100 | Error handling | `tests/api/leads/lead.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.validation.spec.ts -g "LEAD-100"` |
| LEAD-101 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-101"` |
| LEAD-102 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-102"` |
| LEAD-103 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-103"` |
| LEAD-104 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-104"` |
| LEAD-105 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-105"` |
| LEAD-106 | Happy path | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-106"` |
| LEAD-107 | Request validation | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-107"` |
| LEAD-108 | Boundary | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-108"` |
| LEAD-109 | Business rule | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-109"` |
| LEAD-110 | Business rule | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-110"` |
| LEAD-111 | Ownership/IDOR | `tests/api/leads/lead-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-111"` |
| LEAD-112 | Data integrity | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-112"` |
| LEAD-113 | Idempotency | `tests/api/leads/lead-contacts.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.concurrency.spec.ts -g "LEAD-113"` |
| LEAD-114 | Response contract | `tests/api/leads/lead-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.contract.spec.ts -g "LEAD-114"` |
| LEAD-115 | Authentication | `tests/api/leads/lead-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-115"` |
| LEAD-116 | Error handling | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-116"` |
| LEAD-117 | CRUD | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-117"` |
| LEAD-118 | Happy path | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-118"` |
| LEAD-119 | Request validation | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-119"` |
| LEAD-120 | Boundary | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-120"` |
| LEAD-121 | Business rule | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-121"` |
| LEAD-122 | Business rule | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-122"` |
| LEAD-123 | Ownership/IDOR | `tests/api/leads/lead-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-123"` |
| LEAD-124 | Data integrity | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-124"` |
| LEAD-125 | Request validation | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-125"` |
| LEAD-126 | Response contract | `tests/api/leads/lead-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.contract.spec.ts -g "LEAD-126"` |
| LEAD-127 | Authentication | `tests/api/leads/lead-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-127"` |
| LEAD-128 | Error handling | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-128"` |
| LEAD-129 | Happy path | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-129"` |
| LEAD-130 | Business rule | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-130"` |
| LEAD-131 | Business rule | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-131"` |
| LEAD-132 | Boundary | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-132"` |
| LEAD-133 | Ownership/IDOR | `tests/api/leads/lead-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-133"` |
| LEAD-134 | Data integrity | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-134"` |
| LEAD-135 | Request validation | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-135"` |
| LEAD-136 | Response contract | `tests/api/leads/lead-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.contract.spec.ts -g "LEAD-136"` |
| LEAD-137 | Authentication | `tests/api/leads/lead-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-137"` |
| LEAD-138 | Error handling | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-138"` |
| LEAD-139 | Happy path | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-139"` |
| LEAD-140 | Business rule | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-140"` |
| LEAD-141 | Idempotency | `tests/api/leads/lead-contacts.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.concurrency.spec.ts -g "LEAD-141"` |
| LEAD-142 | Ownership/IDOR | `tests/api/leads/lead-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-142"` |
| LEAD-143 | Data integrity | `tests/api/leads/lead-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.functional.spec.ts -g "LEAD-143"` |
| LEAD-144 | Request validation | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-144"` |
| LEAD-145 | Response contract | `tests/api/leads/lead-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.contract.spec.ts -g "LEAD-145"` |
| LEAD-146 | Authentication | `tests/api/leads/lead-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.security.spec.ts -g "LEAD-146"` |
| LEAD-147 | Error handling | `tests/api/leads/lead-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-contacts.validation.spec.ts -g "LEAD-147"` |
| LEAD-148 | Happy path | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-148"` |
| LEAD-149 | State transition | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-149"` |
| LEAD-150 | Request validation | `tests/api/leads/lead-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-150"` |
| LEAD-151 | Boundary | `tests/api/leads/lead-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-151"` |
| LEAD-152 | Business rule | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-152"` |
| LEAD-153 | Idempotency | `tests/api/leads/lead-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.concurrency.spec.ts -g "LEAD-153"` |
| LEAD-154 | Ownership/IDOR | `tests/api/leads/lead-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-154"` |
| LEAD-155 | Data integrity | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-155"` |
| LEAD-156 | Response contract | `tests/api/leads/lead-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.contract.spec.ts -g "LEAD-156"` |
| LEAD-157 | Authentication | `tests/api/leads/lead-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-157"` |
| LEAD-158 | Error handling | `tests/api/leads/lead-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-158"` |
| LEAD-159 | Happy path | `tests/api/leads/lead-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-159"` |
| LEAD-160 | File API | `tests/api/leads/lead-documents.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.integration.spec.ts -g "LEAD-160"` |
| LEAD-161 | File API | `tests/api/leads/lead-documents.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.integration.spec.ts -g "LEAD-161"` |
| LEAD-162 | Boundary | `tests/api/leads/lead-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-162"` |
| LEAD-163 | Request validation | `tests/api/leads/lead-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-163"` |
| LEAD-164 | Business rule | `tests/api/leads/lead-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-164"` |
| LEAD-165 | Ownership/IDOR | `tests/api/leads/lead-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.security.spec.ts -g "LEAD-165"` |
| LEAD-166 | Data integrity | `tests/api/leads/lead-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-166"` |
| LEAD-167 | Idempotency | `tests/api/leads/lead-documents.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.concurrency.spec.ts -g "LEAD-167"` |
| LEAD-168 | Input security | `tests/api/leads/lead-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.security.spec.ts -g "LEAD-168"` |
| LEAD-169 | Response contract | `tests/api/leads/lead-documents.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.contract.spec.ts -g "LEAD-169"` |
| LEAD-170 | Authentication | `tests/api/leads/lead-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.security.spec.ts -g "LEAD-170"` |
| LEAD-171 | Error handling | `tests/api/leads/lead-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-171"` |
| LEAD-172 | Happy path | `tests/api/leads/lead-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-172"` |
| LEAD-173 | File API | `tests/api/leads/lead-documents.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.integration.spec.ts -g "LEAD-173"` |
| LEAD-174 | Ownership/IDOR | `tests/api/leads/lead-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.security.spec.ts -g "LEAD-174"` |
| LEAD-175 | Response contract | `tests/api/leads/lead-documents.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.contract.spec.ts -g "LEAD-175"` |
| LEAD-176 | Request validation | `tests/api/leads/lead-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-176"` |
| LEAD-177 | Authentication | `tests/api/leads/lead-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.security.spec.ts -g "LEAD-177"` |
| LEAD-178 | Error handling | `tests/api/leads/lead-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-178"` |
| LEAD-179 | Happy path | `tests/api/leads/lead-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-179"` |
| LEAD-180 | Business rule | `tests/api/leads/lead-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-180"` |
| LEAD-181 | Ownership/IDOR | `tests/api/leads/lead-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.security.spec.ts -g "LEAD-181"` |
| LEAD-182 | Data integrity | `tests/api/leads/lead-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.functional.spec.ts -g "LEAD-182"` |
| LEAD-183 | Request validation | `tests/api/leads/lead-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-183"` |
| LEAD-184 | Response contract | `tests/api/leads/lead-documents.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.contract.spec.ts -g "LEAD-184"` |
| LEAD-185 | Authentication | `tests/api/leads/lead-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.security.spec.ts -g "LEAD-185"` |
| LEAD-186 | Error handling | `tests/api/leads/lead-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-documents.validation.spec.ts -g "LEAD-186"` |
| LEAD-187 | Happy path | `tests/api/leads/lead-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-history.functional.spec.ts -g "LEAD-187"` |
| LEAD-188 | Pagination/filter/sort | `tests/api/leads/lead-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-history.functional.spec.ts -g "LEAD-188"` |
| LEAD-189 | Boundary | `tests/api/leads/lead-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-history.validation.spec.ts -g "LEAD-189"` |
| LEAD-190 | Request validation | `tests/api/leads/lead-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-history.validation.spec.ts -g "LEAD-190"` |
| LEAD-191 | Ownership/IDOR | `tests/api/leads/lead-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-history.security.spec.ts -g "LEAD-191"` |
| LEAD-192 | Response contract | `tests/api/leads/lead-history.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-history.contract.spec.ts -g "LEAD-192"` |
| LEAD-193 | Authentication | `tests/api/leads/lead-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-history.security.spec.ts -g "LEAD-193"` |
| LEAD-194 | Error handling | `tests/api/leads/lead-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-history.validation.spec.ts -g "LEAD-194"` |
| LEAD-195 | Happy path | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-195"` |
| LEAD-196 | State transition | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-196"` |
| LEAD-197 | Business rule | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-197"` |
| LEAD-198 | Idempotency | `tests/api/leads/lead-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.concurrency.spec.ts -g "LEAD-198"` |
| LEAD-199 | Ownership/IDOR | `tests/api/leads/lead-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-199"` |
| LEAD-200 | Data integrity | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-200"` |
| LEAD-201 | Request validation | `tests/api/leads/lead-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-201"` |
| LEAD-202 | Response contract | `tests/api/leads/lead-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.contract.spec.ts -g "LEAD-202"` |
| LEAD-203 | Authentication | `tests/api/leads/lead-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-203"` |
| LEAD-204 | Error handling | `tests/api/leads/lead-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-204"` |
| LEAD-205 | Happy path | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-205"` |
| LEAD-206 | State transition | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-206"` |
| LEAD-207 | Request validation | `tests/api/leads/lead-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-207"` |
| LEAD-208 | Boundary | `tests/api/leads/lead-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-208"` |
| LEAD-209 | Business rule | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-209"` |
| LEAD-210 | Business rule | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-210"` |
| LEAD-211 | Business rule | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-211"` |
| LEAD-212 | Ownership/IDOR | `tests/api/leads/lead-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-212"` |
| LEAD-213 | Data integrity | `tests/api/leads/lead-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.functional.spec.ts -g "LEAD-213"` |
| LEAD-214 | Idempotency | `tests/api/leads/lead-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.concurrency.spec.ts -g "LEAD-214"` |
| LEAD-215 | Concurrency | `tests/api/leads/lead-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.concurrency.spec.ts -g "LEAD-215"` |
| LEAD-216 | Response contract | `tests/api/leads/lead-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.contract.spec.ts -g "LEAD-216"` |
| LEAD-217 | Authentication | `tests/api/leads/lead-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.security.spec.ts -g "LEAD-217"` |
| LEAD-218 | Error handling | `tests/api/leads/lead-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead-lifecycle.validation.spec.ts -g "LEAD-218"` |
| LEAD-219 | Business rule | `tests/api/leads/lead.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-219"` |
| CTR-001 | Happy path | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-001"` |
| CTR-002 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-002"` |
| CTR-003 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-003"` |
| CTR-004 | Pagination/filter/sort | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-004"` |
| CTR-005 | Pagination/filter/sort | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-005"` |
| CTR-006 | Pagination/filter/sort | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-006"` |
| CTR-007 | Boundary | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-007"` |
| CTR-008 | Request validation | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-008"` |
| CTR-009 | Response contract | `tests/api/customer-contracts/contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-009"` |
| CTR-010 | Authentication | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-010"` |
| CTR-011 | Authentication | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-011"` |
| CTR-012 | Input security | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-012"` |
| CTR-013 | Error handling | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-013"` |
| CTR-014 | Happy path | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-014"` |
| CTR-015 | State transition | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-015"` |
| CTR-016 | Request validation | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-016"` |
| CTR-017 | Request validation | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-017"` |
| CTR-018 | Request validation | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-018"` |
| CTR-019 | Boundary | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-019"` |
| CTR-020 | Boundary | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-020"` |
| CTR-021 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-021"` |
| CTR-022 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-022"` |
| CTR-023 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-023"` |
| CTR-024 | Data integrity | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-024"` |
| CTR-025 | Data integrity | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-025"` |
| CTR-026 | Idempotency | `tests/api/customer-contracts/contract.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.concurrency.spec.ts -g "CTR-026"` |
| CTR-027 | Concurrency | `tests/api/customer-contracts/contract.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.concurrency.spec.ts -g "CTR-027"` |
| CTR-028 | File API | `tests/api/customer-contracts/contract.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.integration.spec.ts -g "CTR-028"` |
| CTR-029 | Authorization | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-029"` |
| CTR-030 | Response contract | `tests/api/customer-contracts/contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-030"` |
| CTR-031 | Authentication | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-031"` |
| CTR-032 | Error handling | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-032"` |
| CTR-033 | Happy path | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-033"` |
| CTR-034 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-034"` |
| CTR-035 | Response contract | `tests/api/customer-contracts/contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-035"` |
| CTR-036 | Authentication | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-036"` |
| CTR-037 | Error handling | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-037"` |
| CTR-038 | Happy path | `tests/api/customer-contracts/contract-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.functional.spec.ts -g "CTR-038"` |
| CTR-039 | File API | `tests/api/customer-contracts/contract-export.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.integration.spec.ts -g "CTR-039"` |
| CTR-040 | Business rule | `tests/api/customer-contracts/contract-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.functional.spec.ts -g "CTR-040"` |
| CTR-041 | Business rule | `tests/api/customer-contracts/contract-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.functional.spec.ts -g "CTR-041"` |
| CTR-042 | Pagination/filter/sort | `tests/api/customer-contracts/contract-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.functional.spec.ts -g "CTR-042"` |
| CTR-043 | Boundary | `tests/api/customer-contracts/contract-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.validation.spec.ts -g "CTR-043"` |
| CTR-044 | Request validation | `tests/api/customer-contracts/contract-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.validation.spec.ts -g "CTR-044"` |
| CTR-045 | Response contract | `tests/api/customer-contracts/contract-export.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.contract.spec.ts -g "CTR-045"` |
| CTR-046 | Authentication | `tests/api/customer-contracts/contract-export.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.security.spec.ts -g "CTR-046"` |
| CTR-047 | Error handling | `tests/api/customer-contracts/contract-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-export.validation.spec.ts -g "CTR-047"` |
| CTR-048 | Happy path | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-048"` |
| CTR-049 | Boundary | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-049"` |
| CTR-050 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-050"` |
| CTR-051 | Response contract | `tests/api/customer-contracts/contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-051"` |
| CTR-052 | Authentication | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-052"` |
| CTR-053 | Error handling | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-053"` |
| CTR-054 | Happy path | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-054"` |
| CTR-055 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-055"` |
| CTR-056 | Pagination/filter/sort | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-056"` |
| CTR-057 | Boundary | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-057"` |
| CTR-058 | Request validation | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-058"` |
| CTR-059 | Response contract | `tests/api/customer-contracts/contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-059"` |
| CTR-060 | Authentication | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-060"` |
| CTR-061 | Error handling | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-061"` |
| CTR-062 | Happy path | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-062"` |
| CTR-063 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-063"` |
| CTR-064 | Ownership/IDOR | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-064"` |
| CTR-065 | Request validation | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-065"` |
| CTR-066 | Response contract | `tests/api/customer-contracts/contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-066"` |
| CTR-067 | Authentication | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-067"` |
| CTR-068 | Error handling | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-068"` |
| CTR-069 | Happy path | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-069"` |
| CTR-070 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-070"` |
| CTR-071 | State transition | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-071"` |
| CTR-072 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-072"` |
| CTR-073 | Request validation | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-073"` |
| CTR-074 | Boundary | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-074"` |
| CTR-075 | Ownership/IDOR | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-075"` |
| CTR-076 | Data integrity | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-076"` |
| CTR-077 | Response contract | `tests/api/customer-contracts/contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.contract.spec.ts -g "CTR-077"` |
| CTR-078 | Authentication | `tests/api/customer-contracts/contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.security.spec.ts -g "CTR-078"` |
| CTR-079 | Error handling | `tests/api/customer-contracts/contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.validation.spec.ts -g "CTR-079"` |
| CTR-080 | Happy path | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-080"` |
| CTR-081 | Request validation | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-081"` |
| CTR-082 | Boundary | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-082"` |
| CTR-083 | File API | `tests/api/customer-contracts/contract-annexes.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.integration.spec.ts -g "CTR-083"` |
| CTR-084 | Business rule | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-084"` |
| CTR-085 | Ownership/IDOR | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-085"` |
| CTR-086 | Data integrity | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-086"` |
| CTR-087 | Idempotency | `tests/api/customer-contracts/contract-annexes.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.concurrency.spec.ts -g "CTR-087"` |
| CTR-088 | Response contract | `tests/api/customer-contracts/contract-annexes.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.contract.spec.ts -g "CTR-088"` |
| CTR-089 | Authentication | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-089"` |
| CTR-090 | Error handling | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-090"` |
| CTR-091 | CRUD | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-091"` |
| CTR-092 | Happy path | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-092"` |
| CTR-093 | Business rule | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-093"` |
| CTR-094 | Request validation | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-094"` |
| CTR-095 | Boundary | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-095"` |
| CTR-096 | Ownership/IDOR | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-096"` |
| CTR-097 | Data integrity | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-097"` |
| CTR-098 | Request validation | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-098"` |
| CTR-099 | Response contract | `tests/api/customer-contracts/contract-annexes.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.contract.spec.ts -g "CTR-099"` |
| CTR-100 | Authentication | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-100"` |
| CTR-101 | Error handling | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-101"` |
| CTR-102 | Business rule | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-102"` |
| CTR-103 | Happy path | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-103"` |
| CTR-104 | Business rule | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-104"` |
| CTR-105 | Ownership/IDOR | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-105"` |
| CTR-106 | Data integrity | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-106"` |
| CTR-107 | Request validation | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-107"` |
| CTR-108 | Response contract | `tests/api/customer-contracts/contract-annexes.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.contract.spec.ts -g "CTR-108"` |
| CTR-109 | Authentication | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-109"` |
| CTR-110 | Error handling | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-110"` |
| CTR-111 | Happy path | `tests/api/customer-contracts/contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.functional.spec.ts -g "CTR-111"` |
| CTR-112 | File API | `tests/api/customer-contracts/contract-annexes.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.integration.spec.ts -g "CTR-112"` |
| CTR-113 | Ownership/IDOR | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-113"` |
| CTR-114 | Response contract | `tests/api/customer-contracts/contract-annexes.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.contract.spec.ts -g "CTR-114"` |
| CTR-115 | Request validation | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-115"` |
| CTR-116 | Authentication | `tests/api/customer-contracts/contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.security.spec.ts -g "CTR-116"` |
| CTR-117 | Error handling | `tests/api/customer-contracts/contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-annexes.validation.spec.ts -g "CTR-117"` |
| CTR-118 | Happy path | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-118"` |
| CTR-119 | State transition | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-119"` |
| CTR-120 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-120"` |
| CTR-121 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-121"` |
| CTR-122 | Request validation | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-122"` |
| CTR-123 | Boundary | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-123"` |
| CTR-124 | Ownership/IDOR | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-124"` |
| CTR-125 | Idempotency | `tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts -g "CTR-125"` |
| CTR-126 | Data integrity | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-126"` |
| CTR-127 | Response contract | `tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.contract.spec.ts -g "CTR-127"` |
| CTR-128 | Authentication | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-128"` |
| CTR-129 | Error handling | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-129"` |
| CTR-130 | Happy path | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-130"` |
| CTR-131 | State transition | Thủ công | Không tự động | - |
| CTR-132 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-132"` |
| CTR-133 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-133"` |
| CTR-134 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-134"` |
| CTR-135 | Boundary | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-135"` |
| CTR-136 | Request validation | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-136"` |
| CTR-137 | File API | `tests/api/customer-contracts/contract-lifecycle.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.integration.spec.ts -g "CTR-137"` |
| CTR-138 | Ownership/IDOR | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-138"` |
| CTR-139 | Idempotency | `tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts -g "CTR-139"` |
| CTR-140 | Data integrity | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-140"` |
| CTR-141 | Response contract | `tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.contract.spec.ts -g "CTR-141"` |
| CTR-142 | Authentication | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-142"` |
| CTR-143 | Error handling | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-143"` |
| CTR-144 | Happy path | `tests/api/customer-contracts/contract-files.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.functional.spec.ts -g "CTR-144"` |
| CTR-145 | File API | `tests/api/customer-contracts/contract-files.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.integration.spec.ts -g "CTR-145"` |
| CTR-146 | Ownership/IDOR | `tests/api/customer-contracts/contract-files.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.security.spec.ts -g "CTR-146"` |
| CTR-147 | Response contract | `tests/api/customer-contracts/contract-files.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.contract.spec.ts -g "CTR-147"` |
| CTR-148 | Request validation | `tests/api/customer-contracts/contract-files.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.validation.spec.ts -g "CTR-148"` |
| CTR-149 | Authentication | `tests/api/customer-contracts/contract-files.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.security.spec.ts -g "CTR-149"` |
| CTR-150 | Error handling | `tests/api/customer-contracts/contract-files.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.validation.spec.ts -g "CTR-150"` |
| CTR-151 | Happy path | `tests/api/customer-contracts/contract-files.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.functional.spec.ts -g "CTR-151"` |
| CTR-152 | File API | `tests/api/customer-contracts/contract-files.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.integration.spec.ts -g "CTR-152"` |
| CTR-153 | Ownership/IDOR | `tests/api/customer-contracts/contract-files.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.security.spec.ts -g "CTR-153"` |
| CTR-154 | Response contract | `tests/api/customer-contracts/contract-files.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.contract.spec.ts -g "CTR-154"` |
| CTR-155 | Request validation | `tests/api/customer-contracts/contract-files.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.validation.spec.ts -g "CTR-155"` |
| CTR-156 | Authentication | `tests/api/customer-contracts/contract-files.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.security.spec.ts -g "CTR-156"` |
| CTR-157 | Error handling | `tests/api/customer-contracts/contract-files.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-files.validation.spec.ts -g "CTR-157"` |
| CTR-158 | Happy path | `tests/api/customer-contracts/contract-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-history.functional.spec.ts -g "CTR-158"` |
| CTR-159 | Pagination/filter/sort | `tests/api/customer-contracts/contract-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-history.functional.spec.ts -g "CTR-159"` |
| CTR-160 | Boundary | `tests/api/customer-contracts/contract-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-history.validation.spec.ts -g "CTR-160"` |
| CTR-161 | Request validation | `tests/api/customer-contracts/contract-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-history.validation.spec.ts -g "CTR-161"` |
| CTR-162 | Ownership/IDOR | `tests/api/customer-contracts/contract-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-history.security.spec.ts -g "CTR-162"` |
| CTR-163 | Response contract | `tests/api/customer-contracts/contract-history.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-history.contract.spec.ts -g "CTR-163"` |
| CTR-164 | Authentication | `tests/api/customer-contracts/contract-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-history.security.spec.ts -g "CTR-164"` |
| CTR-165 | Error handling | `tests/api/customer-contracts/contract-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-history.validation.spec.ts -g "CTR-165"` |
| CTR-166 | Happy path | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-166"` |
| CTR-167 | State transition | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-167"` |
| CTR-168 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-168"` |
| CTR-169 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-169"` |
| CTR-170 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-170"` |
| CTR-171 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-171"` |
| CTR-172 | Request validation | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-172"` |
| CTR-173 | Boundary | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-173"` |
| CTR-174 | Ownership/IDOR | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-174"` |
| CTR-175 | Idempotency | `tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts -g "CTR-175"` |
| CTR-176 | Data integrity | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-176"` |
| CTR-177 | File API | `tests/api/customer-contracts/contract-lifecycle.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.integration.spec.ts -g "CTR-177"` |
| CTR-178 | Response contract | `tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.contract.spec.ts -g "CTR-178"` |
| CTR-179 | Authentication | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-179"` |
| CTR-180 | Error handling | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-180"` |
| CTR-181 | Happy path | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-181"` |
| CTR-182 | State transition | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-182"` |
| CTR-183 | Request validation | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-183"` |
| CTR-184 | Boundary | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-184"` |
| CTR-185 | Business rule | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-185"` |
| CTR-186 | Ownership/IDOR | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-186"` |
| CTR-187 | Idempotency | `tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.concurrency.spec.ts -g "CTR-187"` |
| CTR-188 | Data integrity | `tests/api/customer-contracts/contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.functional.spec.ts -g "CTR-188"` |
| CTR-189 | Response contract | `tests/api/customer-contracts/contract-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.contract.spec.ts -g "CTR-189"` |
| CTR-190 | Authentication | `tests/api/customer-contracts/contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.security.spec.ts -g "CTR-190"` |
| CTR-191 | Error handling | `tests/api/customer-contracts/contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract-lifecycle.validation.spec.ts -g "CTR-191"` |
| CTR-192 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-192"` |
| CTR-193 | Business rule | `tests/api/customer-contracts/contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customer-contracts/contract.functional.spec.ts -g "CTR-193"` |
| CUS-001 | Happy path | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-001"` |
| CUS-002 | Business rule | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-002"` |
| CUS-003 | Pagination/filter/sort | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-003"` |
| CUS-004 | Pagination/filter/sort | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-004"` |
| CUS-005 | Pagination/filter/sort | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-005"` |
| CUS-006 | Boundary | `tests/api/customers/customer.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.validation.spec.ts -g "CUS-006"` |
| CUS-007 | Request validation | `tests/api/customers/customer.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.validation.spec.ts -g "CUS-007"` |
| CUS-008 | Response contract | `tests/api/customers/customer.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.contract.spec.ts -g "CUS-008"` |
| CUS-009 | Authentication | `tests/api/customers/customer.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.security.spec.ts -g "CUS-009"` |
| CUS-010 | Authentication | `tests/api/customers/customer.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.security.spec.ts -g "CUS-010"` |
| CUS-011 | Authorization | `tests/api/customers/customer.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.security.spec.ts -g "CUS-011"` |
| CUS-012 | Input security | `tests/api/customers/customer.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.security.spec.ts -g "CUS-012"` |
| CUS-013 | Error handling | `tests/api/customers/customer.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.validation.spec.ts -g "CUS-013"` |
| CUS-014 | Happy path | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-014"` |
| CUS-015 | Business rule | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-015"` |
| CUS-016 | Response contract | `tests/api/customers/customer.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.contract.spec.ts -g "CUS-016"` |
| CUS-017 | Authentication | `tests/api/customers/customer.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.security.spec.ts -g "CUS-017"` |
| CUS-018 | Error handling | `tests/api/customers/customer.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.validation.spec.ts -g "CUS-018"` |
| CUS-019 | Happy path | `tests/api/customers/customer-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-export.functional.spec.ts -g "CUS-019"` |
| CUS-020 | File API | `tests/api/customers/customer-export.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-export.integration.spec.ts -g "CUS-020"` |
| CUS-021 | Business rule | `tests/api/customers/customer-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-export.functional.spec.ts -g "CUS-021"` |
| CUS-022 | Pagination/filter/sort | `tests/api/customers/customer-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-export.functional.spec.ts -g "CUS-022"` |
| CUS-023 | Boundary | `tests/api/customers/customer-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-export.validation.spec.ts -g "CUS-023"` |
| CUS-024 | Request validation | `tests/api/customers/customer-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-export.validation.spec.ts -g "CUS-024"` |
| CUS-025 | Response contract | `tests/api/customers/customer-export.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-export.contract.spec.ts -g "CUS-025"` |
| CUS-026 | Authentication | `tests/api/customers/customer-export.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-export.security.spec.ts -g "CUS-026"` |
| CUS-027 | Error handling | `tests/api/customers/customer-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-export.validation.spec.ts -g "CUS-027"` |
| CUS-028 | Happy path | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-028"` |
| CUS-029 | Business rule | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-029"` |
| CUS-030 | Ownership/IDOR | `tests/api/customers/customer.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.security.spec.ts -g "CUS-030"` |
| CUS-031 | Request validation | `tests/api/customers/customer.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.validation.spec.ts -g "CUS-031"` |
| CUS-032 | Response contract | `tests/api/customers/customer.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.contract.spec.ts -g "CUS-032"` |
| CUS-033 | Authentication | `tests/api/customers/customer.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.security.spec.ts -g "CUS-033"` |
| CUS-034 | Error handling | `tests/api/customers/customer.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.validation.spec.ts -g "CUS-034"` |
| CUS-035 | Business rule | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-035"` |
| CUS-036 | Business rule | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-036"` |
| CUS-037 | Business rule | `tests/api/customers/customer.functional.spec.ts` | Chờ làm | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-037"` |
| CUS-038 | Happy path | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-038"` |
| CUS-039 | Business rule | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-039"` |
| CUS-040 | Business rule | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-040"` |
| CUS-041 | Business rule | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-041"` |
| CUS-042 | Request validation | `tests/api/customers/customer.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.validation.spec.ts -g "CUS-042"` |
| CUS-043 | Boundary | `tests/api/customers/customer.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.validation.spec.ts -g "CUS-043"` |
| CUS-044 | Ownership/IDOR | `tests/api/customers/customer.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.security.spec.ts -g "CUS-044"` |
| CUS-045 | Data integrity | `tests/api/customers/customer.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.functional.spec.ts -g "CUS-045"` |
| CUS-046 | Response contract | `tests/api/customers/customer.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.contract.spec.ts -g "CUS-046"` |
| CUS-047 | Authentication | `tests/api/customers/customer.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.security.spec.ts -g "CUS-047"` |
| CUS-048 | Error handling | `tests/api/customers/customer.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer.validation.spec.ts -g "CUS-048"` |
| CUS-049 | Happy path | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-049"` |
| CUS-050 | Business rule | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-050"` |
| CUS-051 | Request validation | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-051"` |
| CUS-052 | Boundary | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-052"` |
| CUS-053 | Ownership/IDOR | `tests/api/customers/customer-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.security.spec.ts -g "CUS-053"` |
| CUS-054 | Data integrity | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-054"` |
| CUS-055 | Idempotency | `tests/api/customers/customer-contacts.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.concurrency.spec.ts -g "CUS-055"` |
| CUS-056 | Response contract | `tests/api/customers/customer-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.contract.spec.ts -g "CUS-056"` |
| CUS-057 | Authentication | `tests/api/customers/customer-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.security.spec.ts -g "CUS-057"` |
| CUS-058 | Error handling | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-058"` |
| CUS-059 | CRUD | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-059"` |
| CUS-060 | Happy path | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-060"` |
| CUS-061 | Business rule | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-061"` |
| CUS-062 | Request validation | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-062"` |
| CUS-063 | Boundary | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-063"` |
| CUS-064 | Ownership/IDOR | `tests/api/customers/customer-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.security.spec.ts -g "CUS-064"` |
| CUS-065 | Data integrity | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-065"` |
| CUS-066 | Request validation | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-066"` |
| CUS-067 | Response contract | `tests/api/customers/customer-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.contract.spec.ts -g "CUS-067"` |
| CUS-068 | Authentication | `tests/api/customers/customer-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.security.spec.ts -g "CUS-068"` |
| CUS-069 | Error handling | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-069"` |
| CUS-070 | Happy path | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-070"` |
| CUS-071 | Business rule | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-071"` |
| CUS-072 | Business rule | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-072"` |
| CUS-073 | Boundary | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-073"` |
| CUS-074 | Ownership/IDOR | `tests/api/customers/customer-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.security.spec.ts -g "CUS-074"` |
| CUS-075 | Data integrity | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-075"` |
| CUS-076 | Request validation | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-076"` |
| CUS-077 | Response contract | `tests/api/customers/customer-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.contract.spec.ts -g "CUS-077"` |
| CUS-078 | Authentication | `tests/api/customers/customer-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.security.spec.ts -g "CUS-078"` |
| CUS-079 | Error handling | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-079"` |
| CUS-080 | Happy path | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-080"` |
| CUS-081 | Business rule | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-081"` |
| CUS-082 | Idempotency | `tests/api/customers/customer-contacts.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.concurrency.spec.ts -g "CUS-082"` |
| CUS-083 | Ownership/IDOR | `tests/api/customers/customer-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.security.spec.ts -g "CUS-083"` |
| CUS-084 | Data integrity | `tests/api/customers/customer-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.functional.spec.ts -g "CUS-084"` |
| CUS-085 | Request validation | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-085"` |
| CUS-086 | Response contract | `tests/api/customers/customer-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.contract.spec.ts -g "CUS-086"` |
| CUS-087 | Authentication | `tests/api/customers/customer-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.security.spec.ts -g "CUS-087"` |
| CUS-088 | Error handling | `tests/api/customers/customer-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-contacts.validation.spec.ts -g "CUS-088"` |
| CUS-089 | Happy path | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-089"` |
| CUS-090 | Boundary | `tests/api/customers/customer-account.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.validation.spec.ts -g "CUS-090"` |
| CUS-091 | Request validation | `tests/api/customers/customer-account.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.validation.spec.ts -g "CUS-091"` |
| CUS-092 | Business rule | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-092"` |
| CUS-093 | Ownership/IDOR | `tests/api/customers/customer-account.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.security.spec.ts -g "CUS-093"` |
| CUS-094 | Data integrity | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-094"` |
| CUS-095 | Response contract | `tests/api/customers/customer-account.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.contract.spec.ts -g "CUS-095"` |
| CUS-096 | Authentication | `tests/api/customers/customer-account.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.security.spec.ts -g "CUS-096"` |
| CUS-097 | Error handling | `tests/api/customers/customer-account.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.validation.spec.ts -g "CUS-097"` |
| CUS-098 | Happy path | `tests/api/customers/customer-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-documents.functional.spec.ts -g "CUS-098"` |
| CUS-099 | File API | `tests/api/customers/customer-documents.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-documents.integration.spec.ts -g "CUS-099"` |
| CUS-100 | Ownership/IDOR | `tests/api/customers/customer-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-documents.security.spec.ts -g "CUS-100"` |
| CUS-101 | Response contract | `tests/api/customers/customer-documents.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-documents.contract.spec.ts -g "CUS-101"` |
| CUS-102 | Request validation | `tests/api/customers/customer-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-documents.validation.spec.ts -g "CUS-102"` |
| CUS-103 | Authentication | `tests/api/customers/customer-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-documents.security.spec.ts -g "CUS-103"` |
| CUS-104 | Error handling | `tests/api/customers/customer-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-documents.validation.spec.ts -g "CUS-104"` |
| CUS-105 | Happy path | `tests/api/customers/customer-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-history.functional.spec.ts -g "CUS-105"` |
| CUS-106 | Pagination/filter/sort | `tests/api/customers/customer-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-history.functional.spec.ts -g "CUS-106"` |
| CUS-107 | Boundary | `tests/api/customers/customer-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-history.validation.spec.ts -g "CUS-107"` |
| CUS-108 | Request validation | `tests/api/customers/customer-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-history.validation.spec.ts -g "CUS-108"` |
| CUS-109 | Ownership/IDOR | `tests/api/customers/customer-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-history.security.spec.ts -g "CUS-109"` |
| CUS-110 | Response contract | `tests/api/customers/customer-history.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-history.contract.spec.ts -g "CUS-110"` |
| CUS-111 | Authentication | `tests/api/customers/customer-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-history.security.spec.ts -g "CUS-111"` |
| CUS-112 | Error handling | `tests/api/customers/customer-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-history.validation.spec.ts -g "CUS-112"` |
| CUS-113 | Happy path | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-113"` |
| CUS-114 | Business rule | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-114"` |
| CUS-115 | Request validation | `tests/api/customers/customer-account.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.validation.spec.ts -g "CUS-115"` |
| CUS-116 | Boundary | `tests/api/customers/customer-account.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.validation.spec.ts -g "CUS-116"` |
| CUS-117 | Ownership/IDOR | `tests/api/customers/customer-account.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.security.spec.ts -g "CUS-117"` |
| CUS-118 | Data integrity | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-118"` |
| CUS-119 | Response contract | `tests/api/customers/customer-account.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.contract.spec.ts -g "CUS-119"` |
| CUS-120 | Authentication | `tests/api/customers/customer-account.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.security.spec.ts -g "CUS-120"` |
| CUS-121 | Error handling | `tests/api/customers/customer-account.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.validation.spec.ts -g "CUS-121"` |
| CUS-122 | Happy path | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-122"` |
| CUS-123 | Business rule | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-123"` |
| CUS-124 | Business rule | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-124"` |
| CUS-125 | Request validation | `tests/api/customers/customer-account.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.validation.spec.ts -g "CUS-125"` |
| CUS-126 | Boundary | `tests/api/customers/customer-account.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.validation.spec.ts -g "CUS-126"` |
| CUS-127 | Ownership/IDOR | `tests/api/customers/customer-account.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.security.spec.ts -g "CUS-127"` |
| CUS-128 | Data integrity | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-128"` |
| CUS-129 | Idempotency | `tests/api/customers/customer-account.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.concurrency.spec.ts -g "CUS-129"` |
| CUS-130 | Concurrency | `tests/api/customers/customer-account.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.concurrency.spec.ts -g "CUS-130"` |
| CUS-131 | Response contract | `tests/api/customers/customer-account.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.contract.spec.ts -g "CUS-131"` |
| CUS-132 | Authentication | `tests/api/customers/customer-account.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.security.spec.ts -g "CUS-132"` |
| CUS-133 | Error handling | `tests/api/customers/customer-account.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.validation.spec.ts -g "CUS-133"` |
| CUS-134 | Data integrity | `tests/api/customers/customer-account.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.functional.spec.ts -g "CUS-134"` |
| CUS-135 | Ownership/IDOR | `tests/api/customers/customer-account.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/customers/customer-account.security.spec.ts -g "CUS-135"` |
| VDR-001 | Happy path | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-001"` |
| VDR-002 | Pagination/filter/sort | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-002"` |
| VDR-003 | Pagination/filter/sort | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-003"` |
| VDR-004 | Pagination/filter/sort | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-004"` |
| VDR-005 | Boundary | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-005"` |
| VDR-006 | Request validation | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-006"` |
| VDR-007 | Response contract | `tests/api/contractors/contractor.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.contract.spec.ts -g "VDR-007"` |
| VDR-008 | Authentication | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-008"` |
| VDR-009 | Authentication | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-009"` |
| VDR-010 | Authorization | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-010"` |
| VDR-011 | Input security | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-011"` |
| VDR-012 | Error handling | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-012"` |
| VDR-013 | Happy path | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-013"` |
| VDR-014 | State transition | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-014"` |
| VDR-015 | Request validation | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-015"` |
| VDR-016 | Request validation | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-016"` |
| VDR-017 | Boundary | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-017"` |
| VDR-018 | Boundary | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-018"` |
| VDR-019 | Boundary | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-019"` |
| VDR-020 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-020"` |
| VDR-021 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-021"` |
| VDR-022 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-022"` |
| VDR-023 | Data integrity | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-023"` |
| VDR-024 | Idempotency | `tests/api/contractors/contractor.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.concurrency.spec.ts -g "VDR-024"` |
| VDR-025 | Concurrency | `tests/api/contractors/contractor.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.concurrency.spec.ts -g "VDR-025"` |
| VDR-026 | Input security | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-026"` |
| VDR-027 | Authorization | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-027"` |
| VDR-028 | Response contract | `tests/api/contractors/contractor.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.contract.spec.ts -g "VDR-028"` |
| VDR-029 | Authentication | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-029"` |
| VDR-030 | Error handling | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-030"` |
| VDR-031 | CRUD | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-031"` |
| VDR-032 | Happy path | `tests/api/contractors/contractor-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-export.functional.spec.ts -g "VDR-032"` |
| VDR-033 | File API | `tests/api/contractors/contractor-export.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-export.integration.spec.ts -g "VDR-033"` |
| VDR-034 | Business rule | `tests/api/contractors/contractor-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-export.functional.spec.ts -g "VDR-034"` |
| VDR-035 | Pagination/filter/sort | `tests/api/contractors/contractor-export.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-export.functional.spec.ts -g "VDR-035"` |
| VDR-036 | Boundary | `tests/api/contractors/contractor-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-export.validation.spec.ts -g "VDR-036"` |
| VDR-037 | Request validation | `tests/api/contractors/contractor-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-export.validation.spec.ts -g "VDR-037"` |
| VDR-038 | Response contract | `tests/api/contractors/contractor-export.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-export.contract.spec.ts -g "VDR-038"` |
| VDR-039 | Authentication | `tests/api/contractors/contractor-export.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-export.security.spec.ts -g "VDR-039"` |
| VDR-040 | Error handling | `tests/api/contractors/contractor-export.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-export.validation.spec.ts -g "VDR-040"` |
| VDR-041 | Happy path | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-041"` |
| VDR-042 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-042"` |
| VDR-043 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-043"` |
| VDR-044 | Response contract | `tests/api/contractors/contractor.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.contract.spec.ts -g "VDR-044"` |
| VDR-045 | Authentication | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-045"` |
| VDR-046 | Error handling | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-046"` |
| VDR-047 | Happy path | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-047"` |
| VDR-048 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-048"` |
| VDR-049 | Ownership/IDOR | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-049"` |
| VDR-050 | Request validation | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-050"` |
| VDR-051 | Response contract | `tests/api/contractors/contractor.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.contract.spec.ts -g "VDR-051"` |
| VDR-052 | Authentication | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-052"` |
| VDR-053 | Error handling | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-053"` |
| VDR-054 | Happy path | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-054"` |
| VDR-055 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-055"` |
| VDR-056 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-056"` |
| VDR-057 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-057"` |
| VDR-058 | Request validation | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-058"` |
| VDR-059 | Boundary | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-059"` |
| VDR-060 | Ownership/IDOR | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-060"` |
| VDR-061 | Data integrity | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-061"` |
| VDR-062 | Response contract | `tests/api/contractors/contractor.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.contract.spec.ts -g "VDR-062"` |
| VDR-063 | Authentication | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-063"` |
| VDR-064 | Error handling | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-064"` |
| VDR-065 | Happy path | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-065"` |
| VDR-066 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-066"` |
| VDR-067 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-067"` |
| VDR-068 | Ownership/IDOR | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-068"` |
| VDR-069 | Data integrity | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-069"` |
| VDR-070 | Data integrity | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-070"` |
| VDR-071 | Request validation | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-071"` |
| VDR-072 | Response contract | `tests/api/contractors/contractor.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.contract.spec.ts -g "VDR-072"` |
| VDR-073 | Authentication | `tests/api/contractors/contractor.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.security.spec.ts -g "VDR-073"` |
| VDR-074 | Error handling | `tests/api/contractors/contractor.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.validation.spec.ts -g "VDR-074"` |
| VDR-075 | Happy path | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-075"` |
| VDR-076 | Business rule | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-076"` |
| VDR-077 | Business rule | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-077"` |
| VDR-078 | Request validation | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-078"` |
| VDR-079 | Boundary | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-079"` |
| VDR-080 | Ownership/IDOR | `tests/api/contractors/contractor-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-080"` |
| VDR-081 | Data integrity | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-081"` |
| VDR-082 | Idempotency | `tests/api/contractors/contractor-contacts.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.concurrency.spec.ts -g "VDR-082"` |
| VDR-083 | Response contract | `tests/api/contractors/contractor-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.contract.spec.ts -g "VDR-083"` |
| VDR-084 | Authentication | `tests/api/contractors/contractor-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-084"` |
| VDR-085 | Error handling | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-085"` |
| VDR-086 | Happy path | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-086"` |
| VDR-087 | Business rule | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-087"` |
| VDR-088 | Request validation | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-088"` |
| VDR-089 | Boundary | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-089"` |
| VDR-090 | Ownership/IDOR | `tests/api/contractors/contractor-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-090"` |
| VDR-091 | Data integrity | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-091"` |
| VDR-092 | Request validation | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-092"` |
| VDR-093 | Response contract | `tests/api/contractors/contractor-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.contract.spec.ts -g "VDR-093"` |
| VDR-094 | Authentication | `tests/api/contractors/contractor-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-094"` |
| VDR-095 | Error handling | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-095"` |
| VDR-096 | Happy path | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-096"` |
| VDR-097 | Business rule | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-097"` |
| VDR-098 | Boundary | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-098"` |
| VDR-099 | Ownership/IDOR | `tests/api/contractors/contractor-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-099"` |
| VDR-100 | Data integrity | `tests/api/contractors/contractor-contacts.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.functional.spec.ts -g "VDR-100"` |
| VDR-101 | Request validation | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-101"` |
| VDR-102 | Response contract | `tests/api/contractors/contractor-contacts.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.contract.spec.ts -g "VDR-102"` |
| VDR-103 | Authentication | `tests/api/contractors/contractor-contacts.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.security.spec.ts -g "VDR-103"` |
| VDR-104 | Error handling | `tests/api/contractors/contractor-contacts.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-contacts.validation.spec.ts -g "VDR-104"` |
| VDR-105 | Happy path | `tests/api/contractors/contractor-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-105"` |
| VDR-106 | File API | `tests/api/contractors/contractor-documents.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.integration.spec.ts -g "VDR-106"` |
| VDR-107 | File API | `tests/api/contractors/contractor-documents.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.integration.spec.ts -g "VDR-107"` |
| VDR-108 | Boundary | `tests/api/contractors/contractor-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-108"` |
| VDR-109 | Request validation | `tests/api/contractors/contractor-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-109"` |
| VDR-110 | Business rule | `tests/api/contractors/contractor-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-110"` |
| VDR-111 | Ownership/IDOR | `tests/api/contractors/contractor-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-111"` |
| VDR-112 | Data integrity | `tests/api/contractors/contractor-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-112"` |
| VDR-113 | Idempotency | `tests/api/contractors/contractor-documents.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.concurrency.spec.ts -g "VDR-113"` |
| VDR-114 | Input security | `tests/api/contractors/contractor-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-114"` |
| VDR-115 | Response contract | `tests/api/contractors/contractor-documents.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.contract.spec.ts -g "VDR-115"` |
| VDR-116 | Authentication | `tests/api/contractors/contractor-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-116"` |
| VDR-117 | Error handling | `tests/api/contractors/contractor-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-117"` |
| VDR-118 | Happy path | `tests/api/contractors/contractor-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-118"` |
| VDR-119 | File API | `tests/api/contractors/contractor-documents.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.integration.spec.ts -g "VDR-119"` |
| VDR-120 | Ownership/IDOR | `tests/api/contractors/contractor-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-120"` |
| VDR-121 | Response contract | `tests/api/contractors/contractor-documents.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.contract.spec.ts -g "VDR-121"` |
| VDR-122 | Request validation | `tests/api/contractors/contractor-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-122"` |
| VDR-123 | Authentication | `tests/api/contractors/contractor-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-123"` |
| VDR-124 | Error handling | `tests/api/contractors/contractor-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-124"` |
| VDR-125 | Happy path | `tests/api/contractors/contractor-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-125"` |
| VDR-126 | Business rule | `tests/api/contractors/contractor-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-126"` |
| VDR-127 | Ownership/IDOR | `tests/api/contractors/contractor-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-127"` |
| VDR-128 | Data integrity | `tests/api/contractors/contractor-documents.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.functional.spec.ts -g "VDR-128"` |
| VDR-129 | Request validation | `tests/api/contractors/contractor-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-129"` |
| VDR-130 | Response contract | `tests/api/contractors/contractor-documents.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.contract.spec.ts -g "VDR-130"` |
| VDR-131 | Authentication | `tests/api/contractors/contractor-documents.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.security.spec.ts -g "VDR-131"` |
| VDR-132 | Error handling | `tests/api/contractors/contractor-documents.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-documents.validation.spec.ts -g "VDR-132"` |
| VDR-133 | Happy path | `tests/api/contractors/contractor-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-history.functional.spec.ts -g "VDR-133"` |
| VDR-134 | Pagination/filter/sort | `tests/api/contractors/contractor-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-history.functional.spec.ts -g "VDR-134"` |
| VDR-135 | Boundary | `tests/api/contractors/contractor-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-history.validation.spec.ts -g "VDR-135"` |
| VDR-136 | Request validation | `tests/api/contractors/contractor-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-history.validation.spec.ts -g "VDR-136"` |
| VDR-137 | Ownership/IDOR | `tests/api/contractors/contractor-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-history.security.spec.ts -g "VDR-137"` |
| VDR-138 | Response contract | `tests/api/contractors/contractor-history.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-history.contract.spec.ts -g "VDR-138"` |
| VDR-139 | Authentication | `tests/api/contractors/contractor-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-history.security.spec.ts -g "VDR-139"` |
| VDR-140 | Error handling | `tests/api/contractors/contractor-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-history.validation.spec.ts -g "VDR-140"` |
| VDR-141 | Business rule | `tests/api/contractors/contractor-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-history.functional.spec.ts -g "VDR-141"` |
| VDR-142 | Happy path | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-142"` |
| VDR-143 | State transition | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-143"` |
| VDR-144 | Business rule | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-144"` |
| VDR-145 | Request validation | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-145"` |
| VDR-146 | Boundary | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-146"` |
| VDR-147 | Ownership/IDOR | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-147"` |
| VDR-148 | Idempotency | `tests/api/contractors/contractor-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.concurrency.spec.ts -g "VDR-148"` |
| VDR-149 | Data integrity | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-149"` |
| VDR-150 | Response contract | `tests/api/contractors/contractor-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.contract.spec.ts -g "VDR-150"` |
| VDR-151 | Authentication | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-151"` |
| VDR-152 | Error handling | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-152"` |
| VDR-153 | Data integrity | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-153"` |
| VDR-154 | Business rule | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-154"` |
| VDR-155 | Happy path | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-155"` |
| VDR-156 | Business rule | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-156"` |
| VDR-157 | Business rule | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-157"` |
| VDR-158 | State transition | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-158"` |
| VDR-159 | State transition | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-159"` |
| VDR-160 | Request validation | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-160"` |
| VDR-161 | Boundary | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-161"` |
| VDR-162 | Ownership/IDOR | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-162"` |
| VDR-163 | Idempotency | `tests/api/contractors/contractor-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.concurrency.spec.ts -g "VDR-163"` |
| VDR-164 | Data integrity | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-164"` |
| VDR-165 | Response contract | `tests/api/contractors/contractor-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.contract.spec.ts -g "VDR-165"` |
| VDR-166 | Authentication | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-166"` |
| VDR-167 | Error handling | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-167"` |
| VDR-168 | Data integrity | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-168"` |
| VDR-169 | Business rule | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-169"` |
| VDR-170 | Happy path | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-170"` |
| VDR-171 | Business rule | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-171"` |
| VDR-172 | Business rule | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-172"` |
| VDR-173 | Request validation | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-173"` |
| VDR-174 | Boundary | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-174"` |
| VDR-175 | Ownership/IDOR | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-175"` |
| VDR-176 | Data integrity | `tests/api/contractors/contractor-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.functional.spec.ts -g "VDR-176"` |
| VDR-177 | Response contract | `tests/api/contractors/contractor-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.contract.spec.ts -g "VDR-177"` |
| VDR-178 | Authentication | `tests/api/contractors/contractor-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.security.spec.ts -g "VDR-178"` |
| VDR-179 | Error handling | `tests/api/contractors/contractor-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor-lifecycle.validation.spec.ts -g "VDR-179"` |
| VDR-180 | Business rule | `tests/api/contractors/contractor.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractors/contractor.functional.spec.ts -g "VDR-180"` |
| CTV-001 | Happy path | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-001"` |
| CTV-002 | Pagination/filter/sort | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-002"` |
| CTV-003 | Pagination/filter/sort | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-003"` |
| CTV-004 | Pagination/filter/sort | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-004"` |
| CTV-005 | Boundary | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-005"` |
| CTV-006 | Request validation | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-006"` |
| CTV-007 | Response contract | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-007"` |
| CTV-008 | Authentication | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-008"` |
| CTV-009 | Authentication | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-009"` |
| CTV-010 | Authorization | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-010"` |
| CTV-011 | Input security | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-011"` |
| CTV-012 | Error handling | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-012"` |
| CTV-013 | Happy path | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-013"` |
| CTV-014 | State transition | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-014"` |
| CTV-015 | Request validation | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-015"` |
| CTV-016 | Request validation | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-016"` |
| CTV-017 | Boundary | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-017"` |
| CTV-018 | Boundary | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-018"` |
| CTV-019 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-019"` |
| CTV-020 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-020"` |
| CTV-021 | Data integrity | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-021"` |
| CTV-022 | Idempotency | `tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts -g "CTV-022"` |
| CTV-023 | Concurrency | `tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.concurrency.spec.ts -g "CTV-023"` |
| CTV-024 | File API | `tests/api/contractor-contracts/contractor-contract.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.integration.spec.ts -g "CTV-024"` |
| CTV-025 | Authorization | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-025"` |
| CTV-026 | Response contract | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-026"` |
| CTV-027 | Authentication | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-027"` |
| CTV-028 | Error handling | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-028"` |
| CTV-029 | Happy path | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-029"` |
| CTV-030 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-030"` |
| CTV-031 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-031"` |
| CTV-032 | Request validation | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-032"` |
| CTV-033 | Pagination/filter/sort | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-033"` |
| CTV-034 | Boundary | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-034"` |
| CTV-035 | Response contract | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-035"` |
| CTV-036 | Authentication | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-036"` |
| CTV-037 | Error handling | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-037"` |
| CTV-038 | Happy path | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-038"` |
| CTV-039 | Boundary | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-039"` |
| CTV-040 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-040"` |
| CTV-041 | Response contract | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-041"` |
| CTV-042 | Authentication | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-042"` |
| CTV-043 | Error handling | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-043"` |
| CTV-044 | Happy path | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-044"` |
| CTV-045 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-045"` |
| CTV-046 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-046"` |
| CTV-047 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-047"` |
| CTV-048 | Request validation | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-048"` |
| CTV-049 | Response contract | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-049"` |
| CTV-050 | Authentication | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-050"` |
| CTV-051 | Error handling | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-051"` |
| CTV-052 | Happy path | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-052"` |
| CTV-053 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-053"` |
| CTV-054 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-054"` |
| CTV-055 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-055"` |
| CTV-056 | State transition | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-056"` |
| CTV-057 | Request validation | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-057"` |
| CTV-058 | Boundary | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-058"` |
| CTV-059 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-059"` |
| CTV-060 | Data integrity | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-060"` |
| CTV-061 | Response contract | `tests/api/contractor-contracts/contractor-contract.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.contract.spec.ts -g "CTV-061"` |
| CTV-062 | Authentication | `tests/api/contractor-contracts/contractor-contract.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.security.spec.ts -g "CTV-062"` |
| CTV-063 | Error handling | `tests/api/contractor-contracts/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.validation.spec.ts -g "CTV-063"` |
| CTV-064 | Happy path | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-064"` |
| CTV-065 | File API | `tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts -g "CTV-065"` |
| CTV-066 | Boundary | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-066"` |
| CTV-067 | Request validation | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-067"` |
| CTV-068 | Business rule | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-068"` |
| CTV-069 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-069"` |
| CTV-070 | Data integrity | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-070"` |
| CTV-071 | Idempotency | `tests/api/contractor-contracts/contractor-contract-annexes.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.concurrency.spec.ts -g "CTV-071"` |
| CTV-072 | Response contract | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-072"` |
| CTV-073 | Authentication | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-073"` |
| CTV-074 | Error handling | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-074"` |
| CTV-075 | CRUD | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-075"` |
| CTV-076 | Happy path | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-076"` |
| CTV-077 | Business rule | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-077"` |
| CTV-078 | Business rule | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-078"` |
| CTV-079 | Request validation | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-079"` |
| CTV-080 | Boundary | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-080"` |
| CTV-081 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-081"` |
| CTV-082 | Data integrity | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-082"` |
| CTV-083 | Request validation | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-083"` |
| CTV-084 | Response contract | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-084"` |
| CTV-085 | Authentication | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-085"` |
| CTV-086 | Error handling | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-086"` |
| CTV-087 | Happy path | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-087"` |
| CTV-088 | Business rule | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-088"` |
| CTV-089 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-089"` |
| CTV-090 | Data integrity | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-090"` |
| CTV-091 | Request validation | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-091"` |
| CTV-092 | Response contract | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-092"` |
| CTV-093 | Authentication | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-093"` |
| CTV-094 | Error handling | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-094"` |
| CTV-095 | Happy path | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-095"` |
| CTV-096 | File API | `tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts -g "CTV-096"` |
| CTV-097 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-097"` |
| CTV-098 | Response contract | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-098"` |
| CTV-099 | Request validation | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-099"` |
| CTV-100 | Authentication | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-100"` |
| CTV-101 | Error handling | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-101"` |
| CTV-102 | Business rule | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-102"` |
| CTV-103 | Happy path | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-103"` |
| CTV-104 | File API | `tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.integration.spec.ts -g "CTV-104"` |
| CTV-105 | Business rule | `tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.functional.spec.ts -g "CTV-105"` |
| CTV-106 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-106"` |
| CTV-107 | Response contract | `tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.contract.spec.ts -g "CTV-107"` |
| CTV-108 | Request validation | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-108"` |
| CTV-109 | Authentication | `tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.security.spec.ts -g "CTV-109"` |
| CTV-110 | Error handling | `tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-annexes.validation.spec.ts -g "CTV-110"` |
| CTV-111 | Happy path | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-111"` |
| CTV-112 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-112"` |
| CTV-113 | Boundary | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-113"` |
| CTV-114 | Request validation | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-114"` |
| CTV-115 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-115"` |
| CTV-116 | State transition | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-116"` |
| CTV-117 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-117"` |
| CTV-118 | Data integrity | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-118"` |
| CTV-119 | Response contract | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-119"` |
| CTV-120 | Authentication | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-120"` |
| CTV-121 | Error handling | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-121"` |
| CTV-122 | Business rule | Thủ công | Không tự động | - |
| CTV-123 | Business rule | Thủ công | Không tự động | - |
| CTV-124 | Idempotency | Thủ công | Không tự động | - |
| CTV-125 | Business rule | Thủ công | Không tự động | - |
| CTV-126 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-126"` |
| CTV-127 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-127"` |
| CTV-128 | Happy path | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-128"` |
| CTV-129 | State transition | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-129"` |
| CTV-130 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-130"` |
| CTV-131 | Request validation | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-131"` |
| CTV-132 | Boundary | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-132"` |
| CTV-133 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-133"` |
| CTV-134 | Idempotency | `tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts -g "CTV-134"` |
| CTV-135 | Data integrity | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-135"` |
| CTV-136 | Response contract | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-136"` |
| CTV-137 | Authentication | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-137"` |
| CTV-138 | Error handling | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-138"` |
| CTV-139 | Happy path | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-139"` |
| CTV-140 | State transition | Thủ công | Không tự động | - |
| CTV-141 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-141"` |
| CTV-142 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-142"` |
| CTV-143 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-143"` |
| CTV-144 | Boundary | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-144"` |
| CTV-145 | Request validation | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-145"` |
| CTV-146 | File API | `tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts -g "CTV-146"` |
| CTV-147 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-147"` |
| CTV-148 | Idempotency | `tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts -g "CTV-148"` |
| CTV-149 | Data integrity | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-149"` |
| CTV-150 | Response contract | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-150"` |
| CTV-151 | Authentication | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-151"` |
| CTV-152 | Error handling | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-152"` |
| CTV-153 | Happy path | `tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts -g "CTV-153"` |
| CTV-154 | File API | `tests/api/contractor-contracts/contractor-contract-files.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-files.integration.spec.ts -g "CTV-154"` |
| CTV-155 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-files.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-files.security.spec.ts -g "CTV-155"` |
| CTV-156 | Response contract | `tests/api/contractor-contracts/contractor-contract-files.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-files.contract.spec.ts -g "CTV-156"` |
| CTV-157 | Request validation | `tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts -g "CTV-157"` |
| CTV-158 | Authentication | `tests/api/contractor-contracts/contractor-contract-files.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-files.security.spec.ts -g "CTV-158"` |
| CTV-159 | Error handling | `tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-files.validation.spec.ts -g "CTV-159"` |
| CTV-160 | Business rule | `tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-files.functional.spec.ts -g "CTV-160"` |
| CTV-161 | Happy path | `tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts -g "CTV-161"` |
| CTV-162 | Pagination/filter/sort | `tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-history.functional.spec.ts -g "CTV-162"` |
| CTV-163 | Boundary | `tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts -g "CTV-163"` |
| CTV-164 | Request validation | `tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts -g "CTV-164"` |
| CTV-165 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-history.security.spec.ts -g "CTV-165"` |
| CTV-166 | Response contract | `tests/api/contractor-contracts/contractor-contract-history.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-history.contract.spec.ts -g "CTV-166"` |
| CTV-167 | Authentication | `tests/api/contractor-contracts/contractor-contract-history.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-history.security.spec.ts -g "CTV-167"` |
| CTV-168 | Error handling | `tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-history.validation.spec.ts -g "CTV-168"` |
| CTV-169 | Happy path | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-169"` |
| CTV-170 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-170"` |
| CTV-171 | State transition | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-171"` |
| CTV-172 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-172"` |
| CTV-173 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-173"` |
| CTV-174 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-174"` |
| CTV-175 | Request validation | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-175"` |
| CTV-176 | Boundary | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-176"` |
| CTV-177 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-177"` |
| CTV-178 | Idempotency | `tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts -g "CTV-178"` |
| CTV-179 | Data integrity | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-179"` |
| CTV-180 | File API | `tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.integration.spec.ts -g "CTV-180"` |
| CTV-181 | Response contract | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-181"` |
| CTV-182 | Authentication | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-182"` |
| CTV-183 | Error handling | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-183"` |
| CTV-184 | Happy path | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-184"` |
| CTV-185 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-185"` |
| CTV-186 | State transition | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-186"` |
| CTV-187 | Business rule | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-187"` |
| CTV-188 | Request validation | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-188"` |
| CTV-189 | Boundary | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-189"` |
| CTV-190 | Ownership/IDOR | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-190"` |
| CTV-191 | Idempotency | `tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.concurrency.spec.ts -g "CTV-191"` |
| CTV-192 | Data integrity | `tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.functional.spec.ts -g "CTV-192"` |
| CTV-193 | Response contract | `tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.contract.spec.ts -g "CTV-193"` |
| CTV-194 | Authentication | `tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.security.spec.ts -g "CTV-194"` |
| CTV-195 | Error handling | `tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract-lifecycle.validation.spec.ts -g "CTV-195"` |
| CTV-196 | Business rule | `tests/api/contractor-contracts/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/api/contractor-contracts/contractor-contract.functional.spec.ts -g "CTV-196"` |
| FLOW-LEAD-001 | Flow/end-to-end API | `tests/flows/lead-to-customer.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-001"` |
| FLOW-LEAD-002 | Flow/end-to-end API | `tests/flows/lead-to-customer.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-002"` |
| FLOW-LEAD-003 | Flow/end-to-end API | `tests/flows/lead-to-customer.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-003"` |
| FLOW-LEAD-004 | Flow/end-to-end API | `tests/flows/lead-to-customer.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-004"` |
| FLOW-LEAD-005 | Flow/end-to-end API | `tests/flows/lead-to-customer.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-005"` |
| FLOW-LEAD-006 | Flow/end-to-end API | `tests/flows/lead-to-customer.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-006"` |
| FLOW-LEAD-007 | Flow/end-to-end API | `tests/flows/lead-to-customer.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/lead-to-customer.flow.spec.ts -g "FLOW-LEAD-007"` |
| FLOW-CTR-001 | Flow/end-to-end API | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-001"` |
| FLOW-CTR-002 | Flow/end-to-end API | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-002"` |
| FLOW-CTR-003 | Flow/end-to-end API | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-003"` |
| FLOW-CTR-004 | Flow/end-to-end API | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-004"` |
| FLOW-CTR-005 | Flow/end-to-end API | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-005"` |
| FLOW-CTR-006 | Flow/end-to-end API | `tests/flows/customer-contract-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/customer-contract-lifecycle.flow.spec.ts -g "FLOW-CTR-006"` |
| FLOW-VDR-001 | Flow/end-to-end API | `tests/flows/contractor-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-001"` |
| FLOW-VDR-002 | Flow/end-to-end API | `tests/flows/contractor-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-002"` |
| FLOW-VDR-003 | Flow/end-to-end API | `tests/flows/contractor-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-003"` |
| FLOW-VDR-004 | Flow/end-to-end API | `tests/flows/contractor-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-004"` |
| FLOW-VDR-005 | Flow/end-to-end API | `tests/flows/contractor-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-005"` |
| FLOW-VDR-006 | Flow/end-to-end API | `tests/flows/contractor-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-006"` |
| FLOW-VDR-007 | Flow/end-to-end API | `tests/flows/contractor-lifecycle.flow.spec.ts` | Đã code | `node tools/run-test.mjs tests/flows/contractor-lifecycle.flow.spec.ts -g "FLOW-VDR-007"` |
| UI-LEAD-001 | Hiển thị trang | `tests/ui/lead-list/lead-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-list/lead-list.functional.spec.ts -g "UI-LEAD-001"` |
| UI-LEAD-002 | Bảng danh sách | `tests/ui/lead-list/lead-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-list/lead-list.functional.spec.ts -g "UI-LEAD-002"` |
| UI-LEAD-003 | Hiển thị dữ liệu | `tests/ui/lead-list/lead-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-list/lead-list.functional.spec.ts -g "UI-LEAD-003"` |
| UI-LEAD-004 | Upload/download | `tests/ui/lead-list/lead-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-list/lead-list.functional.spec.ts -g "UI-LEAD-004"` |
| UI-LEAD-005 | Phân quyền UI | `tests/ui/lead-list/lead-list.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-list/lead-list.access.spec.ts -g "UI-LEAD-005"` |
| UI-LEAD-006 | Session | `tests/ui/lead-list/lead-list.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-list/lead-list.access.spec.ts -g "UI-LEAD-006"` |
| UI-LEAD-007 | Responsive | `tests/ui/lead-list/lead-list.responsive.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-list/lead-list.responsive.spec.ts -g "UI-LEAD-007"` |
| UI-LEAD-008 | Accessibility | `tests/ui/lead-list/lead-list.a11y.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-list/lead-list.a11y.spec.ts -g "UI-LEAD-008"` |
| UI-LEAD-009 | Visual regression | `tests/ui/lead-list/lead-list.visual.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-list/lead-list.visual.spec.ts -g "UI-LEAD-009"` |
| UI-LEADF-001 | Form validation | `tests/ui/lead-form/lead-form.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-001"` |
| UI-LEADF-002 | Form validation | `tests/ui/lead-form/lead-form.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-002"` |
| UI-LEADF-003 | Thao tác form | `tests/ui/lead-form/lead-form.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-003"` |
| UI-LEADF-004 | Thông báo | `tests/ui/lead-form/lead-form.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-004"` |
| UI-LEADF-005 | Trạng thái UI | `tests/ui/lead-form/lead-form.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-005"` |
| UI-LEADF-006 | Thao tác form | `tests/ui/lead-form/lead-form.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-006"` |
| UI-LEADF-007 | Thao tác form | `tests/ui/lead-form/lead-form.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-007"` |
| UI-LEADF-008 | Error handling | `tests/ui/lead-form/lead-form.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-008"` |
| UI-LEADF-009 | Upload/download | `tests/ui/lead-form/lead-form.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-009"` |
| UI-LEADF-010 | Form validation | `tests/ui/lead-form/lead-form.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-010"` |
| UI-LEADF-011 | Form validation | `tests/ui/lead-form/lead-form.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-011"` |
| UI-LEADF-012 | Form validation | `tests/ui/lead-form/lead-form.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-012"` |
| UI-LEADF-013 | Form validation | `tests/ui/lead-form/lead-form.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-013"` |
| UI-LEADF-014 | Thao tác form | `tests/ui/lead-form/lead-form.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-014"` |
| UI-LEADF-015 | Form validation | `tests/ui/lead-form/lead-form.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.validation.spec.ts -g "UI-LEADF-015"` |
| UI-LEADF-016 | Upload/download | `tests/ui/lead-form/lead-form.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/lead-form/lead-form.functional.spec.ts -g "UI-LEADF-016"` |
| UI-CTR-001 | Thao tác form | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-001"` |
| UI-CTR-002 | Form validation | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-002"` |
| UI-CTR-003 | Upload/download | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-003"` |
| UI-CTR-004 | Thông báo | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-004"` |
| UI-CTR-005 | Trạng thái UI | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-005"` |
| UI-CTR-006 | Thông báo | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-006"` |
| UI-CTR-007 | Hiển thị dữ liệu | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-007"` |
| UI-CTR-008 | Điều hướng | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-008"` |
| UI-CTR-009 | Form validation | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-009"` |
| UI-CTR-010 | Form validation | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-010"` |
| UI-CTR-011 | Upload/download | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-011"` |
| UI-CTR-012 | Form validation | `tests/ui/customer-contract/customer-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.validation.spec.ts -g "UI-CTR-012"` |
| UI-CTR-013 | Hiển thị dữ liệu | `tests/ui/customer-contract/customer-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customer-contract/customer-contract.functional.spec.ts -g "UI-CTR-013"` |
| UI-CUS-001 | Bảng danh sách | `tests/ui/customers/customers.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-001"` |
| UI-CUS-002 | Hiển thị dữ liệu | `tests/ui/customers/customers.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-002"` |
| UI-CUS-003 | Thao tác form | `tests/ui/customers/customers.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-003"` |
| UI-CUS-004 | Phân quyền UI | `tests/ui/customers/customers.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.access.spec.ts -g "UI-CUS-004"` |
| UI-CUS-005 | Form validation | `tests/ui/customers/customers.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.validation.spec.ts -g "UI-CUS-005"` |
| UI-CUS-006 | Form validation | `tests/ui/customers/customers.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.validation.spec.ts -g "UI-CUS-006"` |
| UI-CUS-007 | Form validation | `tests/ui/customers/customers.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.validation.spec.ts -g "UI-CUS-007"` |
| UI-CUS-008 | Form validation | `tests/ui/customers/customers.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.validation.spec.ts -g "UI-CUS-008"` |
| UI-CUS-009 | Thao tác form | `tests/ui/customers/customers.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-009"` |
| UI-CUS-010 | Hiển thị dữ liệu | `tests/ui/customers/customers.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/customers/customers.functional.spec.ts -g "UI-CUS-010"` |
| UI-VDR-001 | Hiển thị trang | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-001"` |
| UI-VDR-002 | Bảng danh sách | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-002"` |
| UI-VDR-003 | Form validation | `tests/ui/contractor-list/contractor-list.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-list/contractor-list.validation.spec.ts -g "UI-VDR-003"` |
| UI-VDR-004 | Thao tác form | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-004"` |
| UI-VDR-005 | Thông báo | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-005"` |
| UI-VDR-006 | Upload/download | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-006"` |
| UI-VDR-007 | Form validation | `tests/ui/contractor-list/contractor-list.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-list/contractor-list.validation.spec.ts -g "UI-VDR-007"` |
| UI-VDR-008 | Upload/download | `tests/ui/contractor-list/contractor-list.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-list/contractor-list.functional.spec.ts -g "UI-VDR-008"` |
| UI-VDRD-001 | Hiển thị dữ liệu | `tests/ui/contractor-detail/contractor-detail.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-detail/contractor-detail.functional.spec.ts -g "UI-VDRD-001"` |
| UI-VDRD-002 | Trạng thái UI | `tests/ui/contractor-detail/contractor-detail.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-detail/contractor-detail.validation.spec.ts -g "UI-VDRD-002"` |
| UI-VDRD-003 | Trạng thái UI | `tests/ui/contractor-detail/contractor-detail.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-detail/contractor-detail.validation.spec.ts -g "UI-VDRD-003"` |
| UI-VDRD-004 | Điều hướng | `tests/ui/contractor-detail/contractor-detail.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-detail/contractor-detail.functional.spec.ts -g "UI-VDRD-004"` |
| UI-VDRD-005 | Hiển thị dữ liệu | `tests/ui/contractor-detail/contractor-detail.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-detail/contractor-detail.functional.spec.ts -g "UI-VDRD-005"` |
| UI-VDRD-006 | Form validation | `tests/ui/contractor-detail/contractor-detail.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-detail/contractor-detail.validation.spec.ts -g "UI-VDRD-006"` |
| UI-VDRD-007 | Thao tác form | `tests/ui/contractor-detail/contractor-detail.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-detail/contractor-detail.functional.spec.ts -g "UI-VDRD-007"` |
| UI-VDRD-008 | Trạng thái UI | `tests/ui/contractor-detail/contractor-detail.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-detail/contractor-detail.validation.spec.ts -g "UI-VDRD-008"` |
| UI-CTV-001 | Thao tác form | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-001"` |
| UI-CTV-002 | Form validation | `tests/ui/contractor-contract/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.validation.spec.ts -g "UI-CTV-002"` |
| UI-CTV-003 | Upload/download | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-003"` |
| UI-CTV-004 | Thông báo | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-004"` |
| UI-CTV-005 | Trạng thái UI | `tests/ui/contractor-contract/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.validation.spec.ts -g "UI-CTV-005"` |
| UI-CTV-006 | Form validation | `tests/ui/contractor-contract/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.validation.spec.ts -g "UI-CTV-006"` |
| UI-CTV-007 | Upload/download | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-007"` |
| UI-CTV-008 | Thao tác form | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-008"` |
| UI-CTV-009 | Form validation | `tests/ui/contractor-contract/contractor-contract.validation.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.validation.spec.ts -g "UI-CTV-009"` |
| UI-CTV-010 | Hiển thị dữ liệu | `tests/ui/contractor-contract/contractor-contract.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/contractor-contract/contractor-contract.functional.spec.ts -g "UI-CTV-010"` |
| UI-COM-001 | Bảng danh sách | `tests/ui/common/common.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/common/common.functional.spec.ts -g "UI-COM-001"` |
| UI-COM-002 | Bảng danh sách | `tests/ui/common/common.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/common/common.functional.spec.ts -g "UI-COM-002"` |
| UI-COM-003 | Upload/download | `tests/ui/common/common.functional.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/common/common.functional.spec.ts -g "UI-COM-003"` |
| UI-COM-004 | Phân quyền UI | `tests/ui/common/common.access.spec.ts` | Đã code | `node tools/run-test.mjs tests/ui/common/common.access.spec.ts -g "UI-COM-004"` |

## Biến môi trường

**Đổi tài khoản đăng nhập:** mở file `.env`, sửa email và mật khẩu trong mục đầu tiên "ĐỔI TÀI KHOẢN ĐĂNG NHẬP Ở ĐÂY", rồi chạy lại. Không phải sửa code. Bước setup đọc lại `.env` và đăng nhập bằng tài khoản mới ở mỗi lần chạy.

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| API_BASE_URL | Có | Địa chỉ API DEV, ví dụ `https://logx-api-dev.sonthanh.net.vn` |
| WEB_BASE_URL | Có | Địa chỉ web DEV, ví dụ `https://logx-dev.sonthanh.net.vn` (setup đăng nhập qua web) |
| TENANT_CODE | Có | Mã tenant dùng khi đăng nhập (DEV: `CONGTYA`) |
| NVKD_A_EMAIL, NVKD_A_PASSWORD | Có | Tài khoản Lead (Nhân viên kinh doanh) |
| DVKH_A_EMAIL, DVKH_A_PASSWORD | Có | Tài khoản Khách hàng (Dịch vụ khách hàng) |
| QLNT_EMAIL, QLNT_PASSWORD | Không | Tài khoản Nhà thầu (Quản lý nhà thầu); để trống thì dùng chung tài khoản Khách hàng |
| NVKD_B_EMAIL, NVKD_B_PASSWORD | Không | Nhân viên kinh doanh B (case truy cập ngoài phạm vi, chuyển người phụ trách) |
| DVKH_B_EMAIL, DVKH_B_PASSWORD | Không | Dịch vụ khách hàng B |
| NVKD_C_*, DVKH_C_* | Không | Người nhận thứ 3 cho case chuyển đồng thời |
| LOCKED_NVKD_USER_ID, LOCKED_DVKH_USER_ID | Không | userId tài khoản bị khóa (người nhận không hợp lệ) |
| CONTRACTOR_TIER_A, CONTRACTOR_TIER_B | Có (case nhà thầu) | Mã hạng nhà thầu; Swagger để chuỗi tự do nên phải lấy từ backend |
| ROUTE_LEAD_LIST, ROUTE_CONTRACTOR_DETAIL, ... | Không | Đường dẫn màn hình cho Page Object (`ROUTE_` + tên file page viết hoa) |
| ALLOW_CLEANUP | Không | `true` thì cho phép xóa dữ liệu test có API xóa; mặc định `false` |
| UPLOAD_FILES_DIR | Có (case upload) | Thư mục file thật để upload: `upload_test_10mb/11mb.*` (pdf, docx, jpg, png, xlsx, zip) và `other-formats-1mb/` (exe, mp4, txt, csv...). Mặc định `G:/upload-test-files` |
| SIZE_FILES_DIR | Có (case upload, xem file) | Thư mục file 20MB / 21MB (pdf, docx, doc) có trang nội dung, dùng cho mốc 20MB và các case xem file. Mặc định `G:/test-size-files` |
| IMPORT_TEMPLATE_FILE | Không | File mẫu import Lead (sheet Lead 13 cột + sheet Danh mục). Để trống thì dùng `test-data/Mau_Nhap_Lead.xlsx` (bản người dùng cung cấp 2026-11-06); không có file thì tải mẫu từ API |
| WORKERS | Không | Số worker chạy song song |

## Thứ tự chạy lệnh

Chạy từ trên xuống, tại thư mục `auto-tests`.

### 1. Cài đặt

```bash
npm install
```

```bash
npx playwright install chromium
```

Chromium cần cho cả test API vì setup đăng nhập qua giao diện web.

### 2. Cấu hình

Project đã có sẵn `.env` với tài khoản DEV. **Không chép đè** `.env.example` lên `.env`, vì sẽ xóa tài khoản đã điền. Chỉ khi chưa có `.env` mới tạo từ file mẫu (lệnh dưới không ghi đè file có sẵn) rồi điền tenant, tài khoản từng role, mã hạng nhà thầu. Không dùng môi trường production.

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

### 3. Chuẩn bị dữ liệu

Không cần seed thủ công: project `setup` đăng nhập từng role và lưu token vào `.auth/tokens.json`, mỗi test tự tạo dữ liệu qua API. Cần sẵn trên môi trường: danh mục ngành hàng (có ngành "Khác"), danh mục loại hình dịch vụ, và ít nhất 1 đầu mục giá Cố định đang hoạt động (case `UI-VDRD-005`). Kiểm tra code khớp kiểu trước khi chạy:

```bash
npm run typecheck
```

### 4. Chạy test

Chạy từng phần theo thứ tự, phần nào lỗi thì dừng lại xem trước khi chạy tiếp. Trong PowerShell phải đặt tag trong dấu nháy (`"@p1"`), vì `@p1` không có nháy bị PowerShell hiểu là biến và Playwright báo "No tests found":

```bash
node tools/run-test.mjs --grep "@p1" --name smoke
```

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

Chạy một case theo ID:

```bash
node tools/run-test.mjs tests/api/leads/lead.functional.spec.ts -g "LEAD-001"
```

### 5. Xem kết quả và dọn dữ liệu

Mở thư mục `results/`. Dữ liệu test mang `testRunId` trong tên; Lead, khách hàng, hợp đồng không có API xóa nên được để lại trên DEV. Nhà thầu Tạo mới chỉ bị xóa khi đặt `ALLOW_CLEANUP=true`.

## Kết quả sau mỗi lần chạy

**Xem trực tiếp khi đang chạy:** terminal in từng case ngay khi xong (`ok`, `x`, `-`) kèm thời gian, và file `results/<tên> (lần N).txt` được ghi song song nên có thể mở xem trong lúc chạy. File `- message API.md` cũng được ghi thêm sau mỗi case. Báo cáo HTML, file JSON và file tổng kết chỉ có sau khi chạy xong.

`tools/run-test.mjs` tự đánh số lần chạy theo tên và không ghi đè kết quả cũ:

| Trong `results/` | Nội dung |
|---|---|
| `toan-bo (lần 1).txt` | Log khi chạy |
| `toan-bo (lần 1).json` | Kết quả chi tiết dạng JSON |
| `toan-bo (lần 1) - tổng kết.md` | Số đạt, lỗi, bỏ qua và kết quả từng case |
| `toan-bo (lần 1) - html/` | Báo cáo HTML, có trace và ảnh của case lỗi |
| `toan-bo (lần 1) - message API.md` | Mã HTTP, errorCode, message của từng request trong mỗi case để tự đánh giá message |
| `LICH_SU_CHAY.md` | Danh sách mọi lần chạy |

Tên mặc định là `toan-bo`, hoặc lấy theo đường dẫn được chạy. Đặt tên riêng bằng `--name`.

Evidence của từng case lưu ở `evidence/<ID case>/`, mỗi lần chạy thêm file mới có hậu tố `(lần N)` đánh số riêng theo case, không xóa evidence cũ:

| Trong `evidence/<ID>/` | Nội dung |
|---|---|
| `<ID> (lần N) - ket-qua.md` | Kết quả, lần chạy, thời gian, lỗi đầy đủ |
| `<ID> (lần N) - evidence-api.json` | Request (URL, body đã che token, mật khẩu) và response (mã HTTP, errorCode, message, một phần body) của từng lời gọi API trong case |
| `<ID> (lần N) - screenshot.png` | Ảnh màn hình cuối case UI (mọi case UI) |
| `<ID> (lần N) - video.webm`, `trace.zip` | Video và trace khi case UI lỗi (mở trace bằng `npx playwright show-trace "<đường dẫn trace.zip>"`) |

Ví dụ chạy `LEAD-001` ba lần sẽ có `evidence/LEAD-001/LEAD-001 (lần 1) - ...`, `(lần 2)`, `(lần 3)`. Case `test.fixme` và bước setup không sinh evidence. Request chuẩn bị dữ liệu (seed) không nằm trong evidence API, chỉ có lời gọi của chính case.

## Đối chiếu tài liệu

| Tài liệu | Phiên bản hoặc ngày | Trạng thái |
|---|---|---|
| Bộ case `TEST_CASE_AUTO.md` | 2026-11-05 | Mọi case auto đã có `test()` đúng file; một phần đang `test.fixme` (xem Điểm cần xác nhận) |
| Bản cấu trúc `CAU_TRUC_AUTO_TEST.md` | 2026-11-05 | Đúng cấu trúc, đủ file |
| Báo cáo API `BAO_CAO_API_PHAM_VI_TEST.md` | 2026-11-04 | 88 API có client và schema |

## Điểm cần xác nhận

- **File import Lead dùng file mẫu người dùng cung cấp (2026-11-06):** `test-data/Mau_Nhap_Lead.xlsx`; mỗi dòng điền đủ 13 cột theo sheet Danh mục (Ngành hàng, Tuyến, Nguồn). Excel khác cấu trúc vẫn được dùng riêng cho case "sai cấu trúc".
- **File upload dùng file thật (2026-11-06):** case upload đọc file từ `UPLOAD_FILES_DIR` / `SIZE_FILES_DIR` (hàm `realFile`, bộ `REAL` trong `src/data/file.factory.ts`). Mốc đúng 10MB / 11MB / 20MB / 21MB và định dạng không hỗ trợ (exe, mp4, txt, csv, doc) lấy từ bộ file này. Chỉ các mốc lệch 1 byte (10MB − 1, 10MB + 1, 20MB + 1, đúng 5MB) và file 0 byte còn tự sinh vì bộ file không có; file PDF / DOCX tự sinh giờ có trang chữ mở được. `upload_test_10mb/11mb.pdf` là PDF 0 trang nên chỉ dùng thử dung lượng; case xem file dùng file 20MB có nội dung.
- **Ô chọn Lead form Upload HĐ (UI-CTR-001):** trả tối đa 100 Lead là đúng (user chốt 2026-11-06), Lead khác tìm bằng ô tìm kiếm. API `uploadable-customers?search=` tìm được, nhưng ô chọn trên web chưa có ô tìm kiếm (gõ chữ không lọc) nên case báo Fail ở bước tìm trên web.

- **Đã chạy smoke P1 API + luồng trên DEV (2026-11-05, `results/smoke-p1-api (lần 1)`):** 262 case chạy, 200 đạt, 62 lỗi: 51 lỗi do chưa có tài khoản thứ 2 cùng role (NVKD B, DVKH B), 11 lỗi là lệch hệ thống so với tài liệu (liệt kê bên dưới). Case P2, P3 chưa chạy. Khi chạy, case fail cần được xem là lỗi nghi ngờ của hệ thống hoặc điểm tài liệu cần chốt, không sửa kỳ vọng cho khớp.
- **Tài khoản (từ 2026-11-05):** `tunglead2@gmail.com` cho Lead; `tungkh2@gmail.com` cho Khách hàng và Nhà thầu (`QLNT_EMAIL` để trống nên dùng chung); `binh.tran@logxpro.test` là DVKH B. Role của 2 tài khoản mới chưa được xác nhận: setup kiểm role khi chạy và báo lỗi nếu không có role phù hợp (`QL_LEAD`; `QL_KH` hoặc `DVKH...`; `QL_NHA_THAU`). Kết quả các lần chạy trước dùng `tunglead`, `tungkh`. `tenantCode` là `CONGTYA` (web gửi cố định). Mã hạng nhà thầu `STRATEGIC`/`PREFERRED`/`BACKUP` và mã trạng thái `NEW`/`ACTIVE`/`SUSPENDED`/`TERMINATED` lấy từ code giao diện web.
- **Mỗi tài khoản chỉ giữ 1 phiên:** đăng nhập lại (kể cả đăng nhập web bằng cùng tài khoản trong lúc chạy test) làm token cũ bị từ chối `401 session-superseded`. Setup chỉ đăng nhập mỗi email 1 lần; không đăng nhập web bằng tài khoản test khi đang chạy.
- **Thiếu tài khoản thứ 2 cùng role:** chưa có NVKD B, DVKH B nên các case truy cập dữ liệu của người khác, chuyển người phụ trách (khoảng 36 test đã code và các test dùng dữ liệu chuẩn bị có người nhận) sẽ báo lỗi "Thiếu tài khoản role" cho tới khi điền `NVKD_B_*`, `DVKH_B_*` trong `.env`.
- **Chỉ assert mã HTTP:** theo yêu cầu người dùng, test API không assert `errorCode` và message; mọi request trong test được ghi vào `results/<tên> (lần N) - message API.md` (case, kết quả test, API, HTTP, errorCode, message) để người dùng tự đánh giá. Request chuẩn bị dữ liệu không được ghi.
- **Mã tự sinh:** không xem được DB nên kiểm thứ tự bằng 2 bản ghi tạo liên tiếp (bản sau có số lớn hơn) cho Lead, HĐ khách hàng, mã khách hàng, nhà thầu, HĐ nhà thầu (`LEAD-219`, `CTR-192`, `CTR-193`, `VDR-180`, `CTV-196`).
- **78 case UI đã code (2026-11-05):** locator dò trực tiếp trên web DEV bằng tunglead2 / tungkh2 (popup không có `role=dialog`, ô chọn là `[class*=selectTrigger]` + `[class*=_option_]`, ô ngày là lịch tùy biến có nút "Tháng sau/Tháng trước", nhãn không gắn `for` nên ô nhập lấy theo placeholder). Kỳ vọng vẫn lấy từ `TEST_CASE_AUTO.md`, không chỉnh theo web. Case nhiều biến thể dùng `expect.soft` để chạy hết biến thể rồi mới báo lỗi, mỗi lỗi có nhãn biến thể.
- **Điểm web đang lệch tài liệu, thấy khi dò (test sẽ báo Fail đúng chỗ):**
  - UI-LEAD-003: màn Lead chỉ có 2 ô số liệu (Tổng số lead, Đang hoạt động), tài liệu yêu cầu 4.
  - UI-LEADF-007: nút Xác nhận ở popup chuyển người phụ trách không bị vô hiệu khi chưa chọn người/chưa nhập lý do (web chỉ báo lỗi sau khi bấm).
  - UI-VDRD-003/008: nút Xoá nhà thầu chỉ có ở dòng danh sách, màn chi tiết không có.
  - UI-VDRD-004: tab chi tiết nhà thầu là Thông tin nhà thầu / Hồ sơ pháp lí / Bảng giá dịch vụ, Lịch sử là popup; URL không đổi theo tab nên F5 có thể về tab đầu.
  - UI-VDRD-005: tab Bảng giá dịch vụ hiển thị các dòng giá (ID dạng `<mã bảng giá>-0001`, chi cục, loại hình, đơn giá...) chứ không hiển thị dòng bảng giá (tên, ngày hiệu lực, mã HĐ, trạng thái); các cột này có ở khối "Bảng giá mua" của màn chi tiết HĐ nhà thầu.
  - UI-VDRD-006: chi tiết nhà thầu chỉ có "Chỉnh sửa người liên hệ", không có thêm, xoá, đặt đầu mối chính.
  - UI-CTR-007/013, UI-CTV-010: danh sách HĐ chỉ hiện "(Còn N ngày)" cạnh ngày hết hạn, không thấy nhãn Khẩn cấp / Lưu ý / Theo dõi và khối "Giám sát kỳ hạn".
  - UI-CTR-008: tên khách hàng trên chi tiết HĐ không phải link.
- **UI-LEAD-006 đăng nhập lại tài khoản NVKD A:** phiên cũ bị thay thế; test ghi token mới vào `.auth/tokens.json` (`publishSession`) để worker khác dùng tiếp thay vì đăng nhập chồng.
- **UI-LEAD-009 (visual):** lần chạy đầu Playwright tạo ảnh chuẩn và báo Fail "missing snapshot"; cần người duyệt ảnh chuẩn, các lần sau mới so sánh. Ngưỡng `VISUAL_MAX_DIFF` (mặc định 0.02).
- **Mốc chờ chốt không kết luận:** ngày bắt đầu = ngày kết thúc HĐ, tái ký đúng ngày hết hạn gốc, mốc 20MB file import, quy tắc bỏ trống hạn mức (UI-CUS-008 chỉ ghi annotation).
- **`CUS-037` còn `test.fixme`:** cần khách hàng có HĐ `EXPIRED`, chỉ tác vụ 0:00 tạo ra được.
- **Setup đăng nhập qua trình duyệt:** mỗi tài khoản đăng nhập 1 lần qua web, cookie `access_token` dùng chung cho test API và UI để không đá phiên nhau; setup kiểm role mong đợi (`QL_LEAD`, `QL_KH`, `QL_NHA_THAU`) và A/B là hai người khác nhau. Cần `npx playwright install chromium`.
- **Token hết hạn:** không tự tạo được token hết hạn có chữ ký hợp lệ; case Authentication chỉ kiểm token sai chữ ký và refresh token, ghi annotation "Chưa kiểm token hết hạn" trừ khi đặt `EXPIRED_ACCESS_TOKEN`.
- **Tự lấy lại token:** mỗi tài khoản chỉ giữ 1 phiên. Khi request dùng token của tài khoản test bị `401` (phiên bị reset, đăng nhập nơi khác), bộ test đăng nhập lại 1 lần qua API, ghi token mới vào `.auth/tokens.json` cho mọi worker (có khóa file để không đăng nhập chồng) rồi gửi lại request. Token giả trong case Authentication không được gửi lại.
- **Dữ liệu biên độ dài:** chuỗi test không bắt đầu hay kết thúc bằng dấu cách, vì hệ thống cắt khoảng trắng hai đầu khi lưu (đã gây `LEAD-036` lưu 254/255 ký tự). Dấu cách ở giữa vẫn tính là 1 ký tự. Tái hiện lại ngày 2026-11-05: 255 ký tự lưu đủ, 256 bị chặn `400`.
- **`LEAD-061`:** tái hiện ngày 2026-11-05 với phiên đăng nhập mới (không có `401`), import không kèm file vẫn trả `500 internal-error`; lỗi không do token mà do hệ thống không bắt trường hợp thiếu file (giống `CTR-017`, `CTV-015`).
- **`LEAD-109`:** trên web, form "Thêm đầu mối" không có ô "đầu mối chính"; web thêm đầu mối (`POST /api/leads/{id}/contacts` chỉ gửi họ tên, SĐT) rồi bấm "Đặt làm liên hệ chính" → hộp xác nhận → `POST /api/leads/{id}/contacts/{contactId}/primary`. Luồng web này chạy đúng. Người dùng chốt ngày 2026-11-05: đổi `LEAD-109` theo luồng web (thêm đầu mối, rồi đặt làm đầu mối chính bằng API riêng); bộ case `TEST_CASE_AUTO.md` và code đã cập nhật. Việc hệ thống bỏ qua trường `primary` lúc thêm (Swagger có trường này) không còn được kiểm.
- **`LEAD-025` (người dùng xác nhận 2026-11-05):** API tạo Lead giao cho người khác trả `201` với `data: null` là chấp nhận được; test chỉ kiểm mã HTTP và đọc lại Lead theo MST bằng tài khoản người phụ trách mới.
- **`LEAD-215` dùng `binh.tran` làm NVKD C theo yêu cầu người dùng:** tài khoản này có role `DVKH_MASTER_DATA`, không phải role Lead, nên setup ghi "Cảnh báo role tài khoản phụ". Nếu hệ thống từ chối chuyển Lead cho tài khoản không phải NVKD thì case có thể đạt vì quyền của người nhận chứ không phải vì xử lý đồng thời; xem `evidence/LEAD-215/... - evidence-api.json` để biết yêu cầu nào bị từ chối và lý do.
- **Lệch hệ thống so với tài liệu, phát hiện khi chạy smoke P1 ngày 2026-11-05** (test giữ kỳ vọng theo tài liệu, cần dev/BA xác nhận):
  - `CTR-017`, `CTV-015`: gửi request upload HĐ thiếu phần `file` → hệ thống trả **500 internal-error** (lỗi nghi ngờ của hệ thống).
  - `CTR-025`, `CTR-176`, `CTV-021`, `CTV-179`: file scan 0 byte → **409** `domain-rule-violation`, tài liệu kỳ vọng **400**.
  - `VDR-020`, `VDR-056`: MST nhà thầu trùng → **400**, tài liệu kỳ vọng **409**.
  - `LEAD-109`: thêm đầu mối với `primary`=true nhưng đầu mối chính vẫn là người cũ (BR-LEAD-08).
  - `LEAD-055`: Lead import lấy nguồn theo cột trong file (ví dụ `REFERRAL`), tài liệu ghi nguồn phải là `IMPORT`.
  - `CUS-124`: chuyển người phụ trách khách hàng sang tài khoản NVKD (`tunglead`, role `QL_LEAD`) vẫn thành công **204**; theo BR-CUST-16 chỉ DVKH đang hoạt động mới được nhận (lỗi nghi ngờ của hệ thống, phát hiện ngày 2026-11-05 khi chạy với `binh.tran` làm DVKH B).
  - `CTR-001`: tài khoản `tungkh` có role `FULL_QUYEN_K1` nên thấy HĐ của DVKH khác; case cần tài khoản DVKH thuần để kiểm phạm vi xem (BR-CTR-18).
- **Dữ liệu chuẩn bị:** HĐ đang hiệu lực được tạo với ngày hiệu lực 30 ngày trước, để các case tái ký "hiệu lực hôm nay" hợp lệ (ngày hiệu lực HĐ mới phải sau HĐ gốc). API tái ký HĐ nhà thầu bắt buộc trường `confirmReplacement`.
- **Tham số lịch sử:** Swagger khai báo object `query`; code truyền phẳng `eventCode`, `actorUserId`, `from`, `page`, `perPage`. Tên trường trong dòng lịch sử (`eventCode`, `occurredAt`, `actorUserId`) đọc linh hoạt vì Swagger không ghi rõ.
- **Mã HTTP:** theo bộ case (`400/409` cho vi phạm nghiệp vụ, `409` + `confirmation-required` cho bước xác nhận) — cần backend xác nhận.
- **File import Lead:** cột được ghi theo tiêu đề của file mẫu tải từ `GET /api/leads/import-template`, tên cột dò theo từ khóa tiếng Việt.
- **6 case thủ công** (`CTR-130`, `CTV-134` và 4 case tác vụ 0:00) không có code, cần hook chạy tác vụ hoặc dữ liệu HĐ hết hạn.
