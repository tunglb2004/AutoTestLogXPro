import { runBuyingUi } from '../../../src/gia-mua-dinh-muc/data/standard-price-ui.scenario';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua định mức", () => {
  test("UI-SBP-007 Modal cập nhật để trống hoặc 0", { tag: ["@ui", "@gia-mua-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-007", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-008 Nhập hàng loạt: ô giá nhận chữ, âm, 0, 0,01", { tag: ["@ui", "@gia-mua-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-008", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
