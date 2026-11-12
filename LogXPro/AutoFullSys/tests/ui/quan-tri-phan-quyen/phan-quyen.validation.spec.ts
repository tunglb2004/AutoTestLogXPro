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
  test("UI-ADM-004 Tên bộ phận trống", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-004', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-005 Trùng tên bộ phận", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-005', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-009 Email đã được dùng", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-009', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-010 Số điện thoại 9 số", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-010', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-011 Số điện thoại 12 số", { tag: ["@ui", "@quan-tri-phan-quyen", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-011', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ADM-015 Vai trò mặc định không sửa được", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(adminUiCase('UI-ADM-015', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
