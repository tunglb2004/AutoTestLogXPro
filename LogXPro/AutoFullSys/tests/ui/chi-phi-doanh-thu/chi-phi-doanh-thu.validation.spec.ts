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
  test("UI-PNL-008 Tỷ giá nhập tay bằng 0", { tag: ["@ui", "@chi-phi-doanh-thu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);const before=stable(await pnl(testRun,o.id));
    await withOps(browser,roles,'cc',async page=>{await openPnl(page,o.code,o.id);const d=await fxDialog(page);await input(d,'USD → VND').fill('0');await action(d,'Áp dụng').click();await expect(d.getByText('Vui lòng nhập tỷ giá USD → VND lớn hơn 0.',{exact:true})).toBeVisible();await expect(d).toBeVisible();});
    expect(stable(await pnl(testRun,o.id))).toEqual(before);
  });

  test("UI-PNL-009 Tỷ giá 0,01 hợp lệ, 3 số lẻ bị chặn", { tag: ["@ui", "@chi-phi-doanh-thu", "@p3"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'cc',async page=>{await openPnl(page,o.code,o.id);let d=await fxDialog(page);await input(d,'USD → VND').fill('0.01');let pending=uiApi(page,'PUT',/\/pnl\/fx-rate$/);await action(d,'Áp dụng').click();expectStatusIn(await pending,'200/204');await expect(d).toBeHidden();
    const fx=await must(await http.call('GET /api/service-orders/{id}/pnl/fx-rate',{token:tok('cc'),params:{id:o.id}}),'đọc tỷ giá 0,01');expect(fx.usdRate).toBe(0.01);
    const before=stable(await pnl(testRun,o.id));d=await fxDialog(page);await input(d,'USD → VND').fill('25000.123');await action(d,'Áp dụng').click();await expect(d.getByText(/2 (chữ số|số).*lẻ|tối đa 2.*thập phân|2.*thập phân/i).first()).toBeVisible();await expect(d).toBeVisible();expect(stable(await pnl(testRun,o.id))).toEqual(before);
    });
  });

  test("UI-PNL-004 Khoảng Từ lớn hơn Đến", { tag: ["@ui", "@chi-phi-doanh-thu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    await withOps(browser,roles,'cc',async page=>{await page.goto('/cost-revenue'); const d=await openFilter(page,'Bộ lọc'); const fields=await rangeInputs(d,'Doanh thu (VND)','10000000','1000000');
    const calls:string[]=[]; page.on('request',r=>{if(/\/api\/cost-revenue\/orders$/.test(new URL(r.url()).pathname))calls.push(r.url());}); await action(d,'Áp dụng').click();
    await expect(d.getByText("Giá trị 'Từ' không được lớn hơn giá trị 'Đến'.",{exact:true})).toBeVisible(); await expect(d).toBeVisible();
    for(const f of await fields.all()) expect(await f.getAttribute('class'),'Ô khoảng sai có viền đỏ').toMatch(/red|error|danger/);
    expect(calls,'Không áp dụng bộ lọc sai').toEqual([]);
    });
  });

  test("UI-PNL-015 Lỗi tải danh sách", { tag: ["@ui", "@chi-phi-doanh-thu", "@p3"] }, async ({ browser, roles, http, testRun, tok }) => {
    await withOps(browser,roles,'cc',async page=>{let hits=0;await page.route('**/api/cost-revenue/orders?*',async route=>{hits++;await route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({success:false,message:'Lỗi hệ thống',errorCode:'INTERNAL_ERROR',data:null})});});await page.goto('/cost-revenue');await expect(page.getByText('Không thể tải dữ liệu. Vui lòng thử lại.',{exact:true})).toBeVisible();const retry=action(page,'Thử lại');await expect(retry).toBeEnabled();expect(hits).toBeGreaterThan(0);await retry.click();await expect.poll(()=>hits).toBeGreaterThan(1);await expect(retry).toBeEnabled();});
  });
});
