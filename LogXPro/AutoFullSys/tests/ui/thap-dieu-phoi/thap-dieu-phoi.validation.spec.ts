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
  test("UI-K3-011 Dịch vụ Đã thực hiện bị khóa", { tag: ["@ui", "@thap-dieu-phoi", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await p0Order(testRun,'KHQ_DONE');
    await withOps(browser,roles,'dp',async page=>{await openOrder(page,o.code,o.id,true);for(const pane of ['Chi phí','Thông tin'] as const){await servicePanel(page,'KHQ',pane);for(const name of ['Điều phối nhà thầu','Bắt đầu thực hiện','Chỉnh sửa chi phí','Hoàn thành dịch vụ','Lưu thông tin'])await expect(action(page,name)).toHaveCount(0);await expect(page.locator('main input:not([readonly]):not([disabled]),main textarea:not([readonly]):not([disabled])')).toHaveCount(0);}});
  });

  test("UI-K3-014 Ngày thực tế tương lai và cặp thời gian ngược", { tag: ["@ui", "@thap-dieu-phoi", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await p0Order(testRun,'CHANG1_DONE');const refs=await testRun.p0Refs();await saveActuals(testRun,o.svc.VT,actualsBody(refs,'VT'));const before=stable(await must(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals',{token:tok('dp'),params:{id:o.id,type:refs.services.VT}}),'thông tin thực tế trước sửa'));
    await withOps(browser,roles,'dp',async page=>{await openOrder(page,o.code,o.id,true);await servicePanel(page,'VT','Thông tin');await page.getByRole('button',{name:/^Chỉnh sửa( thông tin)?( thực tế)?$/}).last().click();const picked=input(page,'Thời gian lấy hàng thực tế');const delivered=input(page,'Thời gian giao hàng thực tế');const max=await delivered.getAttribute('max');if(max){expect(max.slice(0,10)).toBe(today());}else{await delivered.fill(today(1)+'T10:00');await action(page,'Lưu thông tin').click();await expect(page.getByText('Mốc thời gian thực tế không được chọn ngày trong tương lai.',{exact:true})).toBeVisible();}
    await picked.fill(today(-1)+'T14:00');await delivered.fill(today(-1)+'T10:00');await action(page,'Lưu thông tin').click();await expect(page.getByText(/không được nhỏ hơn|giao.*trước.*lấy|lấy.*sau.*giao/i).first()).toBeVisible();expect(await delivered.getAttribute('aria-invalid')==='true'||/red|error|danger/.test(await delivered.getAttribute('class')??''),'Lỗi ở ô thời gian giao').toBe(true);});expect(stable(await must(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals',{token:tok('dp'),params:{id:o.id,type:refs.services.VT}}),'thông tin thực tế sau lỗi'))).toEqual(before);
  });
});
