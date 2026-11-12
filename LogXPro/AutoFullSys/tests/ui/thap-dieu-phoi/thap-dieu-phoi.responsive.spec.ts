import { withOps, action, tab, input, select, pickOption, vnd, openOrder, servicePanel, labelsVisible, headersVisible, dataRow, expectAmounts, numberFromUi, openFilter, editedP0, costEditor } from '../../../src/phieu-dich-vu/data/operations-ui';
import { p0Base, p0Order, createOrder, buildP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { startService, saveActuals, actualsBody, uploadActualDoc, completeService, costLines, costs } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { changeLinePrice } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { SERVICE_KEYS, SERVICES } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
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

test.describe("Tháp điều phối", () => {
  test("UI-K3-013 Chi tiết phiếu trên màn tablet", { tag: ["@ui", "@thap-dieu-phoi", "@p3"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'dp',async page=>{await page.setViewportSize({width:768,height:1024});await openOrder(page,o.code,o.id,true);await tab(page,'Thông tin dịch vụ').click();for(const name of Object.values(SERVICES)){await tab(page,name).click();await tab(page,'Thông tin').click();await expect(tab(page,name)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Không cuộn ngang toàn trang trên tablet').toBe(true);await tab(page,'Chi phí').click();await expect(page.getByText('Thông tin chi phí',{exact:true}).first()).toBeVisible();}});
  });
});
