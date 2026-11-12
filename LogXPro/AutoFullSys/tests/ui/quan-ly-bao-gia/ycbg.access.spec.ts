/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import { withQuotePage, quoteTab } from '../../../src/quan-ly-bao-gia/data/quote-ui.fixture';

test.describe("Yêu cầu báo giá", () => {
  test("UI-RFQ-002 Tab theo vai trò", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ browser, roles, testRun }) => {

    for (const role of ['k1', 'cc'] as const) {
      await withQuotePage(browser, roles, role, async page => {
        await page.goto('/quotations');
        await expect(quoteTab(page, 'Yêu cầu báo giá')).toBeVisible();
        if (role === 'k1') {
          await expect(quoteTab(page, 'Báo giá khách hàng')).toBeVisible();
          await expect(quoteTab(page, 'Báo giá nội bộ')).toHaveCount(0);
        } else {
          await expect(quoteTab(page, 'Báo giá nội bộ')).toBeVisible();
          await expect(quoteTab(page, 'Báo giá khách hàng')).toHaveCount(0);
        }
      });
    }

  });
});
