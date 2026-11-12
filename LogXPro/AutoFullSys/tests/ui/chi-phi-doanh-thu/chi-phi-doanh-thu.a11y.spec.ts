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
  test("UI-PNL-014 Âm/dương không chỉ phân biệt bằng màu", { tag: ["@ui", "@chi-phi-doanh-thu", "@p3"] }, async ({ browser, roles, http, testRun, tok }) => {
    const gain=await editedP0(testRun);const loss=await editedP0(testRun);await setOrderFx(testRun,loss.id,40_000);
    await withOps(browser,roles,'cc',async page=>{for(const [o,sign] of [[gain,'+'],[loss,'-']] as const){await page.goto('/cost-revenue');await clearFilters(page);await page.getByPlaceholder('Tìm theo mã phiếu dịch vụ...',{exact:true}).fill(o.code);const row=dataRow(page,o.code);await expect(row).toBeVisible();if(sign==='-')await expect(row).toContainText(/-\s*25[,.]79\s*%/);else await expect(row).toContainText(/11[,.]95\s*%/);await openPnl(page,o.code,o.id);expect(await amountCard(page,'Tổng lợi nhuận gộp')).toContain(sign);}});
  });
});
