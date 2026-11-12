import { runPurchaseUi } from '../../../src/gia-mua-dau-vao/data/purchase-price-ui.scenario';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua đầu vào", () => {
  test("UI-BGM-008 Trạng thái áp dụng cố định Tạo mới", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-008", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-012 Thiếu trường bắt buộc và ngày ngược", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-012", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-022 Chỉ mở 1 khung nhập dòng, đóng mở không mất dữ liệu", { tag: ["@ui", "@gia-mua-dau-vao", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-022", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
