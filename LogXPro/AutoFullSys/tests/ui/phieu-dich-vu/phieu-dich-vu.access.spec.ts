import { withOps, action, tab, input, select, pickOption, vnd, openOrder, servicePanel, labelsVisible, headersVisible, dataRow, expectAmounts, numberFromUi, openFilter, editedP0, revenueUi, cellByHeader, revenuePrice } from '../../../src/phieu-dich-vu/data/operations-ui';
import { p0Order, getOrder, revenueOf, revenueTable, buildP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { startService, saveActuals, actualsBody, uploadActualDoc, completeService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { getCustomerQuotation } from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import { setSelling } from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { SERVICE_KEYS, SERVICES } from '../../../src/core/data/p0-price-set';
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

test.describe("Phiếu dịch vụ (Khối 1)", () => {
  test("UI-ORD-016 Nút và tab theo quyền", { tag: ["@ui", "@phieu-dich-vu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'k1',async page=>{await openOrder(page,o.code,o.id);await expect(action(page,'Xác nhận doanh thu')).toBeVisible();await expect(tab(page,'Chi phí - Doanh thu')).toHaveCount(0);});
    await withOps(browser,roles,'k1b',async page=>{await page.goto(`/service-tickets/${o.id}`);await expect(page.getByText(/không có quyền|không tìm thấy|không được phép/i).first()).toBeVisible();await expect(page.getByRole('heading').filter({hasText:o.code})).toHaveCount(0);});
    await withOps(browser,roles,'cc',async page=>{await openOrder(page,o.code,o.id,true);await expect(tab(page,'Chi phí - Doanh thu')).toBeVisible();});
  });
});
