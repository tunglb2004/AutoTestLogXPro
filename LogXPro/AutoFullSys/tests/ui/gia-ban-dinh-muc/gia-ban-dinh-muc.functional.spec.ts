import { runSellingUi } from '../../../src/gia-mua-dinh-muc/data/standard-price-ui.scenario';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá bán định mức", () => {
  test("UI-SSP-001 Danh sách giá bán định mức", { tag: ["@ui", "@gia-ban-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runSellingUi("UI-SSP-001", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SSP-002 Bộ lọc", { tag: ["@ui", "@gia-ban-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runSellingUi("UI-SSP-002", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SSP-004 Trang chi tiết dòng giá bán định mức", { tag: ["@ui", "@gia-ban-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runSellingUi("UI-SSP-004", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SSP-005 Cập nhật giá bán, lợi nhuận tự tính", { tag: ["@ui", "@gia-ban-dinh-muc", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runSellingUi("UI-SSP-005", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SSP-006 Đổi giá dòng đang dùng trong báo giá", { tag: ["@ui", "@gia-ban-dinh-muc", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runSellingUi("UI-SSP-006", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SSP-007 Đã giải quyết cảnh báo giá mua đổi", { tag: ["@ui", "@gia-ban-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runSellingUi("UI-SSP-007", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SSP-010 Nhập hàng loạt giá bán định mức", { tag: ["@ui", "@gia-ban-dinh-muc", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runSellingUi("UI-SSP-010", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
