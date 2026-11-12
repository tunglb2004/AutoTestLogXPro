import { withOps, action, tab, input, select, pickOption, vnd, openOrder, openPnl, labelsVisible, headersVisible, dataRow, expectAmounts, numberFromUi, amountCard, openFilter, rangeInputs, clearFilters, fxDialog, downloadBytes, editedP0 } from '../../../src/phieu-dich-vu/data/operations-ui';
import { getOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { setOrderFx, pnl, readXlsx, numbersIn, isXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { uiApi } from '../../../src/core/assertions';
import { esc } from '../../../src/core/pages/components/data-table.component';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu", () => {
  test("UI-PNL-016 Không có quyền thì không thấy menu và tab", { tag: ["@ui", "@chi-phi-doanh-thu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets');await expect(page.locator('aside,nav').getByText('Chi phí - Doanh thu',{exact:true})).toHaveCount(0);await page.goto('/cost-revenue');await expect(page.getByText(/không có quyền|không được phép|truy cập bị từ chối/i).first()).toBeVisible();await expect(page.getByRole('columnheader',{name:/Doanh thu/i})).toHaveCount(0);await openOrder(page,o.code,o.id);await expect(tab(page,'Chi phí - Doanh thu')).toHaveCount(0);});
  });
});
