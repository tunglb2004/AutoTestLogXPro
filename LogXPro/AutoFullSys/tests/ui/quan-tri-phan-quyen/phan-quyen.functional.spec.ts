import { adminUiCase, loginRoleRevoked } from '../../../src/quan-tri-phan-quyen/data/admin-ui.scenario';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Phân quyền (Bộ phận, Vai trò, Người dùng)", () => {
  test("UI-ADM-001 Màn Phân quyền", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-001', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-002 Dữ liệu tab Bộ phận", { tag: ["@ui", "@quan-tri-phan-quyen", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-002', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-003 Thêm bộ phận", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-003', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-006 Xóa bộ phận còn vai trò", { tag: ["@ui", "@quan-tri-phan-quyen", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-006', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-007 Tab Người dùng dạng danh sách và khung chi tiết", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-007', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-008 Thêm người dùng có vai trò", { tag: ["@ui", "@quan-tri-phan-quyen", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-008', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-012 Vô hiệu hoá người dùng không còn việc dở", { tag: ["@ui", "@quan-tri-phan-quyen", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-012', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-013 Vô hiệu hoá người còn việc dở", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-013', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-014 Xuất quyền hiệu lực", { tag: ["@ui", "@quan-tri-phan-quyen", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-014', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-016 Tạo vai trò và chọn quyền", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-016', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
