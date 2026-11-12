import { fillNewOrder, serviceForm } from '../../../src/phieu-dich-vu/data/order-create-ui';
import { withOps, action, tab, input, select, pickOption, vnd, openOrder, servicePanel, labelsVisible, headersVisible, dataRow, expectAmounts, numberFromUi, openFilter, editedP0, revenueUi, cellByHeader, revenuePrice } from '../../../src/phieu-dich-vu/data/operations-ui';
import { p0Base, p0Order, getOrder, revenueOf, revenueTable, buildP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
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
  test("UI-ORD-014 Phiếu chuyển Đã thực hiện thì ẩn nút Chỉnh sửa doanh thu ở mọi dịch vụ con", { tag: ["@ui", "@phieu-dich-vu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await p0Order(testRun,'CHANG1_DONE');const refs=await testRun.p0Refs();await saveActuals(testRun,o.svc.VT,actualsBody(refs,'VT'));await uploadActualDoc(testRun,o.svc.VT);
    await withOps(browser,roles,'k1',async page=>{await openOrder(page,o.code,o.id);await servicePanel(page,'KHQ','Doanh thu');await expect(action(page,'Chỉnh sửa doanh thu')).toHaveCount(0);await servicePanel(page,'VT','Doanh thu');await expect(action(page,'Chỉnh sửa doanh thu')).toBeVisible();await completeService(testRun,o.svc.VT);await page.reload();await expect(page.getByText('Đã thực hiện',{exact:true}).first()).toBeVisible();for(const service of SERVICE_KEYS){await servicePanel(page,service,'Doanh thu');await expect(action(page,'Chỉnh sửa doanh thu')).toHaveCount(0);await expect(revenueUi(page).locator('input:not([readonly]):not([disabled]),select:not([disabled])')).toHaveCount(0);}});
  });

  test("UI-ORD-015 Chỉnh sửa doanh thu: SL 0, đơn giá âm, ĐVT trống (mỗi lần 1 lỗi)", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await p0Order(testRun,'KHQ_COSTS');const before=stable(await revenueOf(testRun,o.id));
    await withOps(browser,roles,'k1',async page=>{for(const [field,value,error] of [['Số lượng','0','Số lượng phải lớn hơn 0.'],['Đơn giá','-1','Đơn giá không hợp lệ.'],['Đơn vị tính','','Vui lòng chọn đơn vị tính.']]){await openOrder(page,o.code,o.id);await servicePanel(page,'KHQ','Doanh thu');await action(page,'Chỉnh sửa doanh thu').click();const table=revenueUi(page);const row=table.locator('tbody tr').filter({hasText:o.varianceItemName!}).first();const cell=await cellByHeader(table,row,field);if(field==='Đơn vị tính'){const native=cell.locator('select');if(await native.count())await native.selectOption('');else await cell.getByRole('button',{name:/xóa|bỏ chọn|clear/i}).click();}else await cell.locator('input').fill(value);await action(page,'Lưu').click();await expect(page.getByText(error,{exact:true})).toBeVisible();await expect(action(page,'Lưu')).toBeVisible();expect(stable(await revenueOf(testRun,o.id))).toEqual(before);await action(page,'Hủy').click();}});
  });

  test("UI-ORD-007 Gửi phiếu thiếu trường của dịch vụ", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const base=await p0Base(testRun);
    await withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets/new');const arrival=await fillNewOrder(page,testRun,base,true);await serviceForm(page,'VT');const submits:string[]=[];page.on('request',r=>{if(r.method()==='POST'&&/\/api\/service-orders$/.test(new URL(r.url()).pathname))submits.push(r.url());});await action(page,'Gửi phiếu').click();await expect(page.getByText(/(vui lòng|bắt buộc|chưa).*thời gian dự kiến đến|thời gian dự kiến đến.*(bắt buộc|không được để trống)/i).first()).toBeVisible();expect(submits,'Không gửi phiếu thiếu thời gian của Vận tải').toEqual([]);expect(await arrival.getAttribute('aria-invalid')==='true'||/red|error|danger/.test((await arrival.getAttribute('class')??'')+' '+(await arrival.locator('xpath=..').getAttribute('class')??'')),'Viền đỏ đúng ô thiếu').toBe(true);await expect(page.getByText(/vui lòng.*(khách hàng|hợp đồng|báo giá|tên hàng hóa)/i)).toHaveCount(0);const pending=uiApi(page,'POST',/\/api\/service-orders$/);await action(page,'Lưu nháp').click();const res=await pending;expectStatusIn(res,'200/201');const o=(await res.json()).data;expect(o.id).toBeTruthy();expect((await getOrder(testRun,o.id)).status).toBe('DRAFT');await expect(page).toHaveURL(new RegExp('/service-tickets/'+o.id+'$'));testRun.track(`UI nháp ${o.code}`,()=>http.call('DELETE /api/service-orders/{id}',{token:tok('k1'),params:{id:o.id}}));});
  });

  test("UI-ORD-020 Phiếu chưa Đang thực hiện hoặc đã Hoàn thành thì không có nút Chỉnh sửa doanh thu", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    for(const stage of ['SUBMITTED','KHQ_COORDINATED','COMPLETED'] as const){const o=await editedP0(testRun,stage);await withOps(browser,roles,'k1',async page=>{await openOrder(page,o.code,o.id);await servicePanel(page,'KHQ','Doanh thu');await expect(action(page,'Chỉnh sửa doanh thu')).toHaveCount(0);await expect(revenueUi(page).locator('input:not([readonly]):not([disabled]),select:not([disabled])')).toHaveCount(0);});}
  });
});
