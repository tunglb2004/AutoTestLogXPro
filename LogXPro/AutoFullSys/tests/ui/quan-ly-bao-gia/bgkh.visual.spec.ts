import * as QU from '../../../src/quan-ly-bao-gia/data/quote-ui.scenario';
import * as CQF from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as PFUI from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import { env } from '../../../src/core/env';
import { QuoteScenario } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';
import { requireVisualBaseline } from '../../../src/core/fixtures/test-run.fixture';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Báo giá khách hàng", () => {
  test("UI-RC-017 Ảnh chụp tab Báo giá", { tag: ["@ui", "@quan-ly-bao-gia", "@p3"] }, async ({ browser, roles, http, testRun, tok }) => {
    requireVisualBaseline('UI-RC-017.png');
    const q=new QuoteScenario(testRun); const x=await q.active();
    await QU.quoteUiCase(browser,roles,'k1',async page=>{ await QU.rcQuoteTab(page,x.cq.id); await expect(page.locator('main')).toHaveScreenshot('UI-RC-017.png',{animations:'disabled',mask:[page.getByText(/\d{2}:\d{2}|\d{2}\/\d{2}\/\d{4}/),page.getByText(x.cq.code,{exact:false})]}); });
  });
});
