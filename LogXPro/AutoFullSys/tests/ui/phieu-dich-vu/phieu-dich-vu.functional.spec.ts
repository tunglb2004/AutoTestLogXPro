import { fillNewOrder, selectCustomer, serviceForm } from '../../../src/phieu-dich-vu/data/order-create-ui';
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
  test("UI-ORD-001 Danh sách phiếu", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    await withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets');await expect(page.getByPlaceholder('Tìm kiếm...',{exact:true})).toBeVisible();for(const name of ['Bộ lọc nâng cao','Thêm mới'])await expect(action(page,name)).toBeVisible();await headersVisible(page,['STT','Mã phiếu dịch vụ','Khách hàng','Dịch vụ','Xe nhận hàng','Xe giao hàng','Trạng thái','Ngày tạo','Tổng chi phí','Tổng doanh thu','Thao tác']);await expect(page.locator('[class*="pagination"],nav[aria-label*="pagination" i]').first()).toBeVisible();});
  });

  test("UI-ORD-002 Bộ lọc nâng cao", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await p0Order(testRun,'CHANG1_DONE');
    await withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets');const d=await openFilter(page);await labelsVisible(d,['Khách hàng','Loại dịch vụ','Trạng thái','BSX Xe giao','BSX Xe nhận','Ngày tạo']);for(const name of ['Đặt lại','Áp dụng'])await expect(action(d,name)).toBeVisible();
    for(const name of ['Vận tải','Kho bãi'])await pickOption(page,select(d,'Loại dịch vụ'),name);for(const name of ['Tạo mới','Đang thực hiện'])await pickOption(page,select(d,'Trạng thái'),name);await input(d,'BSX Xe nhận').fill('29C-123.45');const pending=uiApi(page,'GET',/\/api\/service-orders$/);await action(d,'Áp dụng').click();expectStatusIn(await pending,'200');await expect(dataRow(page,o.code)).toBeVisible();
    for(const row of await page.locator('main tbody tr').all()){await expect(row).toContainText('Vận tải');await expect(row).toContainText('Kho bãi');await expect(row).toContainText(/Tạo mới|Đang thực hiện/);await expect(row).toContainText('29C-123.45');}
    });
  });

  test("UI-ORD-003 Tổng chi phí và Tổng doanh thu ở danh sách khớp tổng hợp", { tag: ["@ui", "@phieu-dich-vu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets');await page.getByPlaceholder('Tìm kiếm...',{exact:true}).fill(o.code);const row=dataRow(page,o.code);await expect(row).toBeVisible();const table=page.locator('main table').first();const cost=numberFromUi(await(await cellByHeader(table,row,'Tổng chi phí')).innerText());const revenue=numberFromUi(await(await cellByHeader(table,row,'Tổng doanh thu')).innerText());expect(cost).toBe(14_000_000);expect(revenue).toBe(17_172_000);await row.getByText(o.code,{exact:true}).click();await action(page,'Tổng hợp doanh thu').click();const d=page.getByRole('dialog').last();await expectAmounts(d,[cost,revenue]);});
  });

  test("UI-ORD-004 Form tạo phiếu", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    await withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets');await action(page,'Thêm mới').click();await expect(page).toHaveURL(/\/service-tickets\/new/);for(const name of ['Quay lại danh sách','Hủy','Lưu nháp','Gửi phiếu'])await expect(action(page,name)).toBeVisible();
    await labelsVisible(page,['Khách hàng','Hợp đồng áp dụng','Báo giá áp dụng','Mã tham chiếu','Loại hình XNK','Cửa khẩu','Phương thức vận tải','Loại hình vận tải','Ngày yêu cầu SDDV','Ghi chú chung','Tên hàng hóa','Nhóm hàng','Đặc tính hàng hóa','Thể tích','Tổng trọng lượng','Quy cách đóng gói','Biển số xe','Tải trọng xe','Số mooc','Số cont','Tên tài xế','Số điện thoại','CCCD','Sổ thông hành']);
    for(const name of ['Khách hàng','Hợp đồng áp dụng','Báo giá áp dụng','Loại hình XNK','Cửa khẩu','Phương thức vận tải','Loại hình vận tải','Ngày yêu cầu SDDV','Tên hàng hóa','Nhóm hàng','Đặc tính hàng hóa','Thể tích','Tổng trọng lượng','Quy cách đóng gói'])await expect(page.locator('label').filter({hasText:new RegExp('^'+esc(name)+'\s*\*$')}).first(),`${name} bắt buộc`).toBeVisible();
    await expect(page.getByText('Chọn từ thiết bị',{exact:true}).first()).toBeVisible();for(const name of Object.values(SERVICES))await expect(tab(page,name)).toBeVisible();
    });
  });

  test("UI-ORD-005 Trường chi tiết từng dịch vụ trên form phiếu", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    await expect(withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets/new');const fields:Record<string,string[]>={'Khai báo hải quan':['Địa điểm làm thủ tục HQ','Số lượng tờ khai','Ghi chú','Chứng từ lô hàng'],'Hải quan giám sát':['Đơn vị giám sát hải quan','Số tờ khai liên quan','Chứng từ giám sát hải quan','Ghi chú'],'Vận tải':['Phường/xã','Liên hệ lấy hàng','Thời gian dự kiến đến','Yêu cầu bốc xếp tại điểm lấy','Liên hệ giao hàng','Yêu cầu bốc xếp tại điểm giao','Ghi chú (Vận tải)'],'Sang tải':['Địa điểm sang tải','Phương thức sang tải','Loại hình sang tải','Ghi chú'],'Kho bãi':['Tên kho','Số ngày lưu kho dự kiến','Loại hình lưu kho','Đơn vị tính sản lượng','Số lượng lưu kho dự kiến','Chứng từ lô hàng','Ghi chú']};for(const [name,labels] of Object.entries(fields)){const key=SERVICE_KEYS.find(k=>SERVICES[k]===name)!;await serviceForm(page,key);await labelsVisible(page,labels);}}), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-ORD-006 Tạo phiếu đủ 5 dịch vụ và gửi", { tag: ["@ui", "@phieu-dich-vu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const base=await p0Base(testRun);
    await withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets');await action(page,'Thêm mới').click();await fillNewOrder(page,testRun,base);const pending=uiApi(page,'POST',/\/api\/service-orders$/);await action(page,'Gửi phiếu').click();const res=await pending;expectStatusIn(res,'200/201');const created=(await res.json()).data;expect(created.id).toBeTruthy();expect(created.code).toMatch(/^ORD\d{6}-\d+$/);testRun.track(`UI phiếu ${created.code}`,()=>http.call('POST /api/service-orders/{id}/cancel',{token:tok('k1'),params:{id:created.id},json:{reason:'Dọn phiếu UI tạo mới'}}));await expect(page).toHaveURL(new RegExp('/service-tickets/'+created.id+'$'));await expect(page.getByRole('heading').filter({hasText:created.code})).toBeVisible();await expect(page.getByText('Tạo mới',{exact:true}).first()).toBeVisible();for(const name of ['Tạo mới','Đã tiếp nhận','Đang thực hiện','Đã thực hiện','Hoàn thành'])await expect(page.getByText(name,{exact:true}).first()).toBeVisible();const detail=await getOrder(testRun,created.id);expect(detail.status).toBe('SUBMITTED');const refs=await testRun.p0Refs();expect(detail.services.map((s:any)=>s.serviceTypeCode).sort()).toEqual(SERVICE_KEYS.map(k=>refs.services[k]).sort());expect(detail.customerId).toBe(base.customerId);expect(detail.customerQuotationId).toBe(base.rcId);});
  });

  test("UI-ORD-008 Lưu nháp không báo điều phối", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const base=await p0Base(testRun);
    await withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets/new');await selectCustomer(page,testRun,base);for(const name of Object.values(SERVICES))await page.getByRole('checkbox',{name,exact:true}).uncheck();await serviceForm(page,'KHQ');const pending=uiApi(page,'POST',/\/api\/service-orders$/);await action(page,'Lưu nháp').click();const res=await pending;expectStatusIn(res,'200/201');const o=(await res.json()).data;expect(o.code).toMatch(/^ORD\d{6}-\d+$/);const d=await getOrder(testRun,o.id);expect(d.status).toBe('DRAFT');expect(d.services).toHaveLength(1);await expect(page.getByText('Nháp',{exact:true}).first()).toBeVisible();testRun.track(`UI nháp ${o.code}`,()=>http.call('DELETE /api/service-orders/{id}',{token:tok('k1'),params:{id:o.id}}));let samples=0;let leaked:any[]=[];await expect.poll(async()=>{const notes=await must(await http.call('GET /api/notifications',{token:tok('cc'),query:{limit:200}}),'Thông báo trưởng điều phối');const list=Array.isArray(notes)?notes:items(notes);const hits=list.filter((n:any)=>n.subjectId===o.id);if(hits.length)leaked=hits;samples++;return leaked.length?-1:samples;},{message:'Nháp không báo trưởng điều phối (3 lần đọc liên tiếp đều rỗng)',intervals:[500],timeout:10_000}).toBe(3);expect(leaked,'Nháp không báo trưởng điều phối').toEqual([]);});
  });

  test("UI-ORD-009 Chi tiết phiếu tab Thông tin chung & xe", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'k1',async page=>{await page.goto('/service-tickets');await page.getByPlaceholder('Tìm kiếm...',{exact:true}).fill(o.code);await dataRow(page,o.code).getByText(o.code,{exact:true}).click();await expect(page.getByRole('heading',{name:new RegExp('Chi tiết phiếu dịch vụ:.*'+esc(o.code))})).toBeVisible();await expect(page.getByText('Đã thực hiện',{exact:true}).first()).toBeVisible();await labelsVisible(page,['Ngày tạo','Người tạo']);await expect(action(page,'Tổng hợp doanh thu')).toBeVisible();await expect(page.locator('[title="Nhật ký điều phối"],[aria-label="Nhật ký điều phối"]').first()).toBeVisible();
    for(const name of ['Tạo mới','Đã tiếp nhận','Đang thực hiện','Đã thực hiện','Hoàn thành'])await expect(page.getByText(name,{exact:true}).first()).toBeVisible();await tab(page,'Thông tin chung & xe').click();
    await labelsVisible(page,['Khách hàng','Hợp đồng áp dụng','Báo giá áp dụng','Mã tham chiếu','Loại hình XNK','Cửa khẩu','Phương thức vận tải','Loại hình vận tải','Ngày yêu cầu SDDV','Ghi chú','Lộ trình lô hàng','Điểm đi','Điểm đến','Thông tin hàng hóa','Đặc tính','Nhóm hàng','Thể tích m³','Trọng lượng Tấn','Quy cách','Thông tin xe','XE GIAO HÀNG','XE NHẬN HÀNG']);await expect(page.getByText(/Xe giao 01.*Đã chốt/).first()).toBeVisible();await expect(page.getByText('15C-111.11',{exact:true}).first()).toBeVisible();
    });
  });

  test("UI-ORD-010 Tab Thông tin dịch vụ → Thông tin", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'k1',async page=>{await openOrder(page,o.code,o.id);await servicePanel(page,'KHQ','Thông tin');await labelsVisible(page,['Thông tin khai báo','Thông tin thực tế','Mã tờ khai HQ thực tế','Kết quả phân luồng','Ngày thông quan thực tế','Số lượng tờ khai','Biển số xe','Tải trọng','Số cont','Số mooc','Tài xế','Số điện thoại','CCCD','Chứng từ kèm theo xe','Ghi chú','Chứng từ lô hàng']);await expect(action(page,'Xem file').first()).toBeVisible();await expect(page.getByText('15C-111.11',{exact:true}).first()).toBeVisible();});
  });

  test("UI-ORD-011 Tab Doanh thu của dịch vụ", { tag: ["@ui", "@phieu-dich-vu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await p0Order(testRun,'KHQ_COSTS');
    await withOps(browser,roles,'k1',async page=>{await openOrder(page,o.code,o.id);await servicePanel(page,'KHQ','Doanh thu');await labelsVisible(page,['Báo cáo doanh thu','Loại tiền','Thuế','Tỷ giá (VCB)']);await expect(page.getByText(/Biểu giá áp dụng:/).first()).toBeVisible();await headersVisible(revenueUi(page),['Đầu mục doanh thu','Đơn vị tính','Số lượng','Đơn giá','Thành tiền','Thành tiền quy đổi']);for(const kind of ['Cố định','Phụ phí','Phát sinh'])await expect(page.getByText(kind,{exact:true}).first()).toBeVisible();await expectAmounts(page,[1_750_000,140_000,1_890_000]);await labelsVisible(page,['TỔNG DOANH THU TRƯỚC VAT','THUẾ VAT (8%)','TỔNG DOANH THU SAU VAT']);});
  });

  test("UI-ORD-012 Dòng Hết hạn báo giá", { tag: ["@ui", "@phieu-dich-vu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const base=await buildP0(testRun,`UIORD12-${uuid()}`,{setDefault:false});for(const key of ['customsFee','overtime'] as const)await setSelling(testRun,base.ssp[key]!,key==='customsFee'?1_300_000:500_000);const rc=await getCustomerQuotation(testRun,base.rcId);const refs=await testRun.p0Refs();const sheet=(rc.sourceSheets??rc.sheets??[]).find((x:any)=>x.serviceTypeCode===refs.services.KHQ);expect(sheet?.disabled,'Tiền điều kiện: biểu giá KHQ bị vô hiệu').toBe(true);const o=await p0Order(testRun,'KHQ_COSTS',{base});
    await withOps(browser,roles,'k1',async page=>{await openOrder(page,o.code,o.id);await servicePanel(page,'KHQ','Doanh thu');const table=revenueUi(page);const row=table.locator('tbody tr').filter({hasText:'Phí khai báo'}).first();await expect(row).toContainText('Hết hạn báo giá');for(const h of ['Đơn giá','Thành tiền','Thành tiền quy đổi'])await expect(await cellByHeader(table,row,h)).toHaveText('—');const lines=revenueTable(await revenueOf(testRun,o.id),refs.services.KHQ);const invalid=(lines.lines??[]).find((x:any)=>x.costLineId===o.shiftLineId);expect(lines.lines.some((x:any)=>x.expired||x.matchStatus==='EXPIRED')).toBe(true);const total=lines.totalBeforeVat??lines.total;expect(total,'Dòng vô hiệu không cộng vào tổng').toBe(200_000);await expectAmounts(page,[200_000,16_000,216_000]);});
  });

  test("UI-ORD-013 K3 vừa tạo chi phí phát sinh: K1 thấy ngay dòng doanh thu và chỉnh sửa được", { tag: ["@ui", "@phieu-dich-vu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await p0Order(testRun,'KHQ_COSTS');const refs=await testRun.p0Refs();
    await withOps(browser,roles,'k1',async page=>{await openOrder(page,o.code,o.id);await servicePanel(page,'KHQ','Doanh thu');const table=revenueUi(page);const row=table.locator('tbody tr').filter({hasText:o.varianceItemName!}).first();await expect(row).toContainText('Phát sinh');await expectAmounts(row,[200_000]);await action(page,'Chỉnh sửa doanh thu').click();
    for(const h of ['Số lượng','Đơn giá'])await expect((await cellByHeader(table,row,h)).locator('input')).toBeEditable();expect(numberFromUi(await(await cellByHeader(table,row,'Số lượng')).locator('input').inputValue())).toBe(1);expect(numberFromUi(await(await cellByHeader(table,row,'Đơn giá')).locator('input').inputValue())).toBe(200_000);
    for(const name of ['Phí khai báo','Phí ngoài giờ']){const fixed=table.locator('tbody tr').filter({hasText:name}).first();await expect(fixed.locator('input:not([readonly]):not([disabled]),select:not([disabled])')).toHaveCount(0);}
    await revenuePrice(page,o.varianceItemName!,'250000');const pending=uiApi(page,'PUT',/\/revenue\/[^/]+\/lines$/);await action(page,'Lưu').click();expectStatusIn(await pending,'200/204');await expect(page.getByText('Cập nhật doanh thu thành công',{exact:true})).toBeVisible();await page.reload();await servicePanel(page,'KHQ','Doanh thu');await expectAmounts(dataRow(page,o.varianceItemName!),[250_000]);await expectAmounts(page,[1_800_000,144_000,1_944_000]);
    await tab(page,'Lịch sử hoạt động').click();await expect(page.getByText(/200[.]000.*250[.]000/).first()).toBeVisible();await expect(page.getByText(roles.k1.email,{exact:false}).first()).toBeVisible();
    });const tables=await revenueOf(testRun,o.id);const line=(revenueTable(tables,refs.services.KHQ).lines??[]).find((x:any)=>x.costLineId===o.shiftLineId);expect(line.unitPrice).toBe(250_000);
  });

  test("UI-ORD-017 Popup Tổng hợp doanh thu", { tag: ["@ui", "@phieu-dich-vu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'k1',async page=>{await openOrder(page,o.code,o.id);await action(page,'Tổng hợp doanh thu').click();const d=page.getByRole('dialog').last();await expectAmounts(d,[14_000_000,17_172_000]);await headersVisible(d,['Tổng chi phí','Tổng doanh thu','Lãi gộp']);for(const service of SERVICE_KEYS){const row=d.locator('tbody tr').filter({hasText:SERVICES[service]}).first();const gross=Math.round(P0.serviceRevenue[service]*1.08);await expectAmounts(row,[P0.serviceCost[service],gross,gross-P0.serviceCost[service]]);const profit=await cellByHeader(d.locator('table').first(),row,'Lãi gộp');expect(await profit.innerText()).not.toMatch(/-/);const colored=(await profit.locator('span').count())?profit.locator('span').last():profit;const color=await colored.evaluate(e=>getComputedStyle(e).color);const rgb=color.match(/\d+/g)!.map(Number);expect(rgb[1],'Lãi gộp dương có màu xanh').toBeGreaterThan(rgb[0]);}await action(d,'Đóng').click();await expect(d).toBeHidden();});
  });

  test("UI-ORD-018 Hủy phiếu Tạo mới và ẩn nút khi có dịch vụ đang thực hiện", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const a=await p0Order(testRun,'SUBMITTED');const b=await p0Order(testRun,'IN_PROGRESS');
    await withOps(browser,roles,'k1',async page=>{await openOrder(page,a.code,a.id);await action(page,'Hủy phiếu').click();const d=page.getByRole('dialog').filter({hasText:'Hủy dịch vụ'}).last();const reason=d.locator('textarea');await expect(reason).toHaveAttribute('maxlength','500');await reason.fill('Khách hủy lô hàng');const pending=uiApi(page,'POST',/\/service-orders\/[^/]+\/cancel$/);await action(d,'Hủy dịch vụ').click();expectStatusIn(await pending,'200/204');await expect(page.getByText('Đã hủy',{exact:true}).first()).toBeVisible();await openOrder(page,b.code,b.id);await expect(action(page,'Hủy phiếu')).toHaveCount(0);});expect((await getOrder(testRun,a.id)).status).toBe('CANCELLED');
  });

  test("UI-ORD-019 Chỉnh sửa phiếu Tạo mới", { tag: ["@ui", "@phieu-dich-vu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await p0Order(testRun,'SUBMITTED');const before=await getOrder(testRun,o.id);const note=tagged('AT Ghi chú chỉnh sửa qua UI');
    await withOps(browser,roles,'k1',async page=>{await openOrder(page,o.code,o.id);await action(page,'Chỉnh sửa').click();await expect(page.getByRole('heading').filter({hasText:new RegExp('Chỉnh sửa dịch vụ.*'+esc(o.code))})).toBeVisible();
    for(const label of ['Khách hàng','Hợp đồng áp dụng','Báo giá áp dụng']){const block=page.locator('label').filter({hasText:new RegExp('^'+esc(label)+'\s*\*?$')}).first().locator('xpath=..');const controls=block.locator('input,select,[role="combobox"],[tabindex="0"]');for(const c of await controls.all())expect(await c.evaluate(e=>(e as HTMLInputElement).readOnly||(e as HTMLInputElement).disabled||e.getAttribute('aria-disabled')==='true'||getComputedStyle(e).pointerEvents==='none'),`${label} cố định`).toBe(true);}
    await input(page,'Ghi chú chung').fill(note);const pending=uiApi(page,'PUT',/\/api\/service-orders\/[^/]+$/);await action(page,'Lưu thông tin').click();expectStatusIn(await pending,'200/204');await expect(page).toHaveURL(new RegExp('/service-tickets/'+o.id+'$'));await expect(page.getByText(note,{exact:true})).toBeVisible();});const after=await getOrder(testRun,o.id);expect(after.generalNote).toBe(note);for(const key of ['customerId','customerContractId','customerQuotationId']){expect(before[key],`Tiền điều kiện có ${key}`).toBeTruthy();expect(after[key]).toBe(before[key]);}
  });
});
