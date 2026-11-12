import * as QU from '../../../src/quan-ly-bao-gia/data/quote-ui.scenario';
import * as CQF from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as PFUI from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import { env } from '../../../src/core/env';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, blockedUnless, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import { withQuotePage, quoteTab } from '../../../src/quan-ly-bao-gia/data/quote-ui.fixture';
import { DataTableComponent } from '../../../src/core/pages/components/data-table.component';
import { QuoteScenario } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';
import { p0Base } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';

import { uiApi } from '../../../src/core/assertions';
import { pickOption, selectByLabel } from '../../../src/core/pages/components/data-table.component';
import { Page } from '@playwright/test';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
test.describe("Báo giá khách hàng", () => {
  test("UI-RC-001 Danh sách BGKH", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, testRun }) => {

    const q = new QuoteScenario(testRun);
    const base = await p0Base(testRun);
    const c = await q.cq(base.rcId);
    expect(c.isDefault).toBe(true);
    await withQuotePage(browser, roles, 'k1', async page => {
      await page.goto('/quotations'); await quoteTab(page, 'Báo giá khách hàng').click();
      await expect(page.getByRole('button', { name: /^(Tất cả )?khách hàng$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Tất cả trạng thái', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Bộ lọc nâng cao/i })).toBeVisible();
      const search = page.getByPlaceholder('Tìm kiếm...', { exact: true }); await expect(search).toBeVisible(); await search.fill(c.code);
      const table = new DataTableComponent(page); await expect(table.row(c.code)).toBeVisible();
      expect(await table.headerTexts()).toEqual(expect.arrayContaining([/^STT$/i, /^Mã bảng giá$/i, /^Khách hàng$/i, /^Dịch vụ$/i, /^Hiệu lực$/i, /^Báo giá$/i, /^Trạng thái$/i]));
      await expect(table.row(c.code)).toContainText(c.customerName); await expect(table.row(c.code)).toContainText('Đang hiệu lực');
      await expect(table.row(c.code)).toContainText('Mặc định');
    });

  });

  test("UI-RC-002 Bộ lọc nâng cao", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, roles, tok, browser }) => {

  const base = await ORD.p0Base(testRun);
  const q = new QuoteScenario(testRun);
  const c = await q.cq(base.rcId);
  const refs = await testRun.p0Refs();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + '01';
  await withQuotePage(browser, roles, 'k1', async web => {
    await web.goto('/quotations?tab=rate-card');
    const table = web.locator('main table:visible').first();
    await expect(table.locator('tbody tr').first()).toBeVisible();
    const advanced = web.locator('main button:visible', { hasText: 'Bộ lọc nâng cao' });
    const panel = web.getByRole('dialog').filter({ hasText: 'Bộ lọc nâng cao' }).last();
    // (1) Mở bộ lọc
    await advanced.click();
    for (const label of ['Mã khách hàng', 'Loại dịch vụ', 'Khoảng ngày hiệu lực', 'Khoảng số tiền (VND)']) await expect(panel.locator('label').filter({ hasText: label }), label).toBeVisible();
    await expect(panel).toContainText('thẻ phải có đủ tất cả dịch vụ đã chọn');
    await expect(panel).toContainText('giao với khoảng ngày này');
    await expect(panel).toContainText('VND quy đổi từ đơn giá gốc');
    for (const b of ['Đặt lại', 'Áp dụng']) await expect(panel.getByRole('button', { name: b, exact: true })).toBeVisible();
    // (2)-(5) Nhập điều kiện
    await panel.getByPlaceholder('Dán ID khách hàng nếu đã biết').fill(base.customerId);
    const services = selectByLabel(panel, 'Loại dịch vụ');
    await services.click();
    for (const s of ['Vận tải', 'Kho bãi']) await web.getByRole('button', { name: s, exact: true }).last().click();
    await services.click();
    await expect(services).toContainText('Vận tải');
    await expect(services).toContainText('Kho bãi');
    await panel.getByText('Chọn khoảng ngày hiệu lực', { exact: true }).click();
    await web.getByRole('button', { name: 'Tháng này', exact: true }).click();
    await expect(panel).toContainText(/\d{2}\/\d{2}\/\d{4} ~ \d{2}\/\d{2}\/\d{4}/);
    await panel.getByPlaceholder('Từ', { exact: true }).fill('16000000');
    await panel.getByPlaceholder('Đến', { exact: true }).fill('17000000');
    // (6) Áp dụng
    const filtered = uiApi(web, 'GET', /\/api\/customer-quotations/);
    await panel.getByRole('button', { name: 'Áp dụng', exact: true }).click();
    expectStatusIn(await filtered, '200', 'Áp dụng bộ lọc nâng cao');
    await expect(table.locator('tbody tr').filter({ hasText: c.code }), 'RC P0 của KH_A khớp điều kiện').toBeVisible();
    const own = items(await data(await http.call('GET /api/customer-quotations', { token: tok('k1'), query: { customerId: base.customerId, perPage: 100 } })));
    const codes = (await table.locator('tbody tr td:nth-child(2)').allInnerTexts()).map(t => t.trim().split(/\s+/)[0]).filter(Boolean);
    for (const code of codes) {
      const rc = own.find((x: any) => x.code === code);
      expect(rc, `${code} thuộc KH_A`).toBeTruthy();
      expect(rc.serviceTypeCodes, `${code} có đủ Vận tải + Kho bãi`).toEqual(expect.arrayContaining([refs.services.VT, refs.services.KB]));
      expect(String(rc.validFrom).slice(0, 10) <= today && String(rc.validTo).slice(0, 10) >= monthStart, `${code} hiệu lực giao với tháng này`).toBe(true);
      if (rc.currency === 'VND') expect(Number(rc.total) >= 16_000_000 && Number(rc.total) <= 17_000_000, `${code} trong khoảng 16–17 triệu`).toBe(true);
    }
    // (7) Đặt lại xóa hết điều kiện
    if (!(await panel.isVisible())) await advanced.click();
    await panel.getByRole('button', { name: 'Đặt lại', exact: true }).click();
    await expect(panel.getByPlaceholder('Dán ID khách hàng nếu đã biết')).toHaveValue('');
    await expect(selectByLabel(panel, 'Loại dịch vụ')).toHaveText(/Tất cả dịch vụ/);
    await expect(panel.getByText('Chọn khoảng ngày hiệu lực', { exact: true })).toBeVisible();
    await expect(panel.getByPlaceholder('Từ', { exact: true })).toHaveValue('');
    await expect(panel.getByPlaceholder('Đến', { exact: true })).toHaveValue('');
  });

  });

  test("UI-RC-003 Chi tiết BGKH tab Thông tin chung", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q = new QuoteScenario(testRun); const x = await q.active();
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await page.goto(`/quotations/rate-cards/${x.cq.id}`);
      await expect(page.getByText(new RegExp('Chi tiết báo giá khách hàng:.*'+x.cq.code))).toBeVisible();
      await expect(page.getByText('Đang hiệu lực',{exact:true}).first()).toBeVisible();
      for(const name of ['Đặt làm mặc định','Xuất báo giá','Ngưng hoạt động','Lịch sử thao tác','Thông tin chung','Dịch vụ yêu cầu','Báo giá']) await expect(QU.qButton(page,name)).toBeVisible();
      for(const label of ['Ngày tạo','Người tạo','Khách hàng','Hợp đồng áp dụng','Đơn vị tiền tệ','Thời gian gửi báo giá','Yêu cầu báo giá gốc','Ghi chú chung','Đặc tính hàng hóa','Phương thức vận tải','Quy cách đóng gói sơ bộ','Sản lượng dự kiến/tháng','Loại hình XNK','Nhóm hàng','Cửa khẩu','Loại xe yêu cầu','Ghi chú / Thỏa thuận bổ sung']) await expect(page.getByText(new RegExp('^'+QU.escape(label)+'\\s*:?$')).first(),label).toBeVisible();
      await expect(page.getByText(x.cq.customerName,{exact:true}).first()).toBeVisible(); await expect(page.getByText(x.rfq.code,{exact:false}).first()).toBeVisible();
    });
  });

  test("UI-RC-004 Tab Báo giá và số tiền", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const x=await q.pending(); await CQF.setQuotationPrices(testRun,x.cq,{'Phí khai báo':1150000});
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await QU.rcQuoteTab(page,x.cq.id);
      for(const name of ['Reset báo giá','Thiết lập tỷ giá & VAT','Gộp đầu mục','Điều chỉnh giá chốt']) await expect(QU.qButton(page,name)).toBeVisible();
      for(const label of ['Đơn vị tiền tệ áp dụng','Tỷ giá áp dụng','Thuế suất VAT','Hiệu lực giá']) await expect(page.getByText(label,{exact:false}).first()).toBeVisible();
      await QU.qButton(page,'Tất cả').click();
      for(const header of ['STT','Đầu mục doanh thu','Phân loại','Đơn vị','Đơn giá','Điều chỉnh','Thành tiền sau điều chỉnh','Thành tiền quy đổi']) await expect(page.getByRole('columnheader',{name:new RegExp(QU.escape(header),'i')}).first()).toBeVisible();
      for(const amount of [15650000,1252000,16902000]) await expect(page.getByText(new RegExp(QU.escape(QU.vnd(amount)))).first(),String(amount)).toBeVisible();
      for(const service of ['Khai báo hải quan','Hải quan giám sát','Vận tải','Sang tải','Kho bãi']) { await QU.qButton(page,service).last().click(); await expect(page.locator('main table').first()).toBeVisible(); }
    });
  });

  test("UI-RC-005 Điều chỉnh giá chốt có nhãn GIẢM SÂU", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const x=await q.pending();
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await QU.rcQuoteTab(page,x.cq.id); await QU.enterPrice(page,x.base.items.customsFee.name,'1150000'); await QU.savePrices(page);
      await expect(QU.quoteRow(page,x.base.items.customsFee.name)).toContainText(/[−-]4[.,]17\s*%/);
      await expect(QU.quoteRow(page,x.base.items.customsFee.name)).toContainText('GIẢM SÂU');
      await expect(page.getByText(/PHÁT HIỆN DÒNG ĐIỀU CHỈNH VƯỢT QUÁ 2%|có dòng giảm sâu/i).first()).toBeVisible();
      await expect(page.getByText('Đã lưu điều chỉnh giá chốt',{exact:true})).toBeVisible();
    }); const d=await q.cq(x.cq.id); expectMoney(CQF.lineByName(d,x.base.items.customsFee.name).sellPrice,1150000);
  });

  test("UI-RC-006 Gộp đầu mục khác dịch vụ bị khóa", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const x=await q.pending();
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await QU.rcQuoteTab(page,x.cq.id); await QU.beginMerge(page,x.base.items.customsFee.name);
      await expect(QU.qButton(page,'Gộp 1 đầu mục')).toBeDisabled();
      const other=QU.quoteRow(page,x.base.items.freight.name).getByRole('checkbox'); await expect(other).toBeDisabled();
      await expect(page.getByText('Chỉ được gộp các đầu mục thuộc cùng một loại dịch vụ',{exact:true}).or(page.locator('[title="Chỉ được gộp các đầu mục thuộc cùng một loại dịch vụ"]')).first()).toBeAttached();
      await QU.quoteRow(page,x.base.items.overtime.name).getByRole('checkbox').check(); await expect(QU.qButton(page,'Gộp 2 đầu mục')).toBeEnabled();
    }); expect((await q.cq(x.cq.id)).mergedGroups).toHaveLength(0);
  });

  test("UI-RC-008 Popup tỷ giá và VAT với VND", { tag: ["@ui", "@quan-ly-bao-gia", "@p3"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const x=await q.pending(); expect(x.cq.currency).toBe('VND');
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await QU.rcQuoteTab(page,x.cq.id); await QU.qButton(page,'Thiết lập tỷ giá & VAT').click(); const d=QU.dialog(page);
      await expect(d.getByText(/VNĐ luôn có tỷ giá 1/)).toBeVisible();
      for(const name of ['Tỷ giá mặc định VCB','Nhập thủ công']) await expect(d.getByRole('radio',{name})).toBeDisabled();
      await expect(d.getByText('Tổng thanh toán',{exact:false})).toBeVisible();
      for(const name of ['Hủy','Lưu thay đổi']) await expect(d.getByRole('button',{name,exact:true})).toBeVisible();
      await d.getByRole('button',{name:'Hủy',exact:true}).click();
    });
  });

  test("UI-RC-009 Biểu giá Disable", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const base=await PFUI.flowBase(testRun,'UIRC009',false); const x=await PFUI.quote(testRun,base,{customer:'pending'});
    await PFUI.ok(testRun,'PUT /api/standard-selling-prices/{id}/selling-price',{id:base.ssp.customsFee!},{sellingPrice:1300000});
    await PFUI.expired(testRun,()=>PFUI.cqView(testRun,x),base,'customsFee');
    const d=await PFUI.cqView(testRun,x); const expected=d.total;
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await QU.rcQuoteTab(page,x.rcId!); await expect(page.getByText('Disable',{exact:true}).first()).toBeVisible();
      const row=QU.quoteRow(page,base.items.customsFee.name); await expect(row).toContainText('Hết hạn');
      const sheet=row.locator('xpath=ancestor::section[1]'); await expect(sheet).toHaveClass(/opacity|disabled/i);
      await expect(page.getByText(new RegExp(QU.escape(QU.vnd(Number(expected))))).first()).toBeVisible();
      const khq=d.sourceSheets.find((s:any)=>(s.lines??[]).some((l:any)=>l.revenueItemId===base.items.customsFee.id)); expect(khq.disabled).toBe(true); expect(khq.total).toBeNull();
    });
  });

  test("UI-RC-010 Xuất PDF và Excel", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    test.setTimeout(600000); const base=await PFUI.flowBase(testRun,'UIRC010',false); const q=new QuoteScenario(testRun); const x=await q.pending({base});
    const groupName=tagged('Trọn gói khai báo xuất UI'); const refs=await testRun.p0Refs();
    await must(await q.call('POST /api/customer-quotations/{id}/merges','k1',{params:{id:x.cq.id},json:{displayName:groupName,unitCode:refs.units.customsFee,lineIds:[CQF.lineByName(x.cq,base.items.customsFee.name).id,CQF.lineByName(x.cq,base.items.overtime.name).id]}}),'gộp tiền điều kiện');
    await CQF.confirmQuotation(testRun,x.cq.id);
    await PFUI.ok(testRun,'PUT /api/standard-selling-prices/{id}/selling-price',{id:base.ssp.supervision!},{sellingPrice:1100000});
    await PFUI.expired(testRun,()=>q.cq(x.cq.id),base,'supervision');
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await QU.rcQuoteTab(page,x.cq.id);
      for(const [label,kind] of [['Xuất PDF','pdf'],['Xuất Excel','xlsx']] as const) {
        await QU.qButton(page,'Xuất báo giá').click(); const pending=page.waitForEvent('download'); await page.getByText(label,{exact:true}).click(); const download=await pending;
        expect(await download.failure()).toBeNull(); expect(download.suggestedFilename().toLowerCase()).toMatch(kind==='pdf'?/\.pdf$/:/\.xlsx$/);
        const path=await download.path(); expect(path).toBeTruthy(); const text=await QU.downloadedText(path!,kind);
        expect(text).toContain(groupName); for(const name of [base.items.customsFee.name,base.items.overtime.name,base.items.supervision.name]) expect(text).not.toContain(name);
        await test.info().attach(`bao-gia.${kind}`,{path:path!,contentType:kind==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      }
    });
  });

  test("UI-RC-011 Khách hàng đồng ý báo giá", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    blockedUnless(['FIRST_QUOTE_CUSTOMER_ID']);
    const customerId=process.env.FIRST_QUOTE_CUSTOMER_ID!.trim();
    const before=items(await must(await http.call('GET /api/customer-quotations',{token:tok('k1'),query:{customerId,pagination:false,perPage:100}}),'kiểm tiền điều kiện RC đầu tiên'));
    expect(before,'Khách hàng chưa có BGKH').toHaveLength(0);
    const q=new QuoteScenario(testRun); const x=await q.pending({customerId});
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await page.goto(`/quotations/rate-cards/${x.cq.id}`); await QU.qButton(page,'Đồng ý').click();
      const response=QU.apiFromUi(page,'POST',/\/customer-quotations\/[^/]+\/confirm$/); await QU.dialog(page).getByRole('button',{name:/Xác nhận|Đồng ý/}).click(); QU.expectUiStatus(await response,[200,204]);
      await expect(page.getByText('Đã xác nhận khách hàng đồng ý báo giá',{exact:true})).toBeVisible();
      await expect(page.getByText('Đang hiệu lực',{exact:true}).first()).toBeVisible(); await expect(page.getByText('Mặc định',{exact:true}).first()).toBeVisible();
      for(const name of ['Đồng ý','Từ chối']) await expect(QU.qButton(page,name)).toHaveCount(0);
    }); const d=await q.cq(x.cq.id); expect(d.status).toBe('ACTIVE'); expect(d.isDefault).toBe(true);
  });

  test("UI-RC-013 Ngưng hoạt động RC", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const x=await q.active(); await CQF.makeDefault(testRun,x.cq.id);
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await page.goto(`/quotations/rate-cards/${x.cq.id}`); await QU.qButton(page,'Ngưng hoạt động').click();
      await QU.inputByLabel(QU.dialog(page),'Lý do ngưng hoạt động').fill('Khách ngừng tuyến');
      const response=QU.apiFromUi(page,'POST',/\/customer-quotations\/[^/]+\/deactivate$/); await QU.dialog(page).getByRole('button',{name:'Xác nhận ngưng',exact:true}).click(); QU.expectUiStatus(await response,[200,204]);
      await expect(page.getByText('Hết hiệu lực',{exact:true}).first()).toBeVisible(); await expect(page.getByText('Mặc định',{exact:true})).toHaveCount(0);
      await QU.qButton(page,'Báo giá').click(); for(const name of ['Gộp đầu mục','Điều chỉnh giá chốt','Thiết lập tỷ giá & VAT','Ngưng hoạt động']) await expect(QU.qButton(page,name)).toHaveCount(0);
    }); const d=await q.cq(x.cq.id); expect(d.status).toBe('EXPIRED'); expect(d.isDefault).toBe(false);
  });

  test("UI-RC-014 Đặt làm mặc định", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const customerId=env.ref('CUSTOMER_A_ID'); const before=items(await must(await http.call('GET /api/customer-quotations',{token:tok('k1'),query:{customerId,status:'ACTIVE',pagination:false,perPage:100}}),'RC mặc định trước test')); const old=before.find((c:any)=>c.isDefault);
    const first=await q.active(); const second=await q.active(); await CQF.makeDefault(testRun,first.cq.id);
    try {
     await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await page.goto(`/quotations/rate-cards/${second.cq.id}`); const response=QU.apiFromUi(page,'POST',/\/customer-quotations\/[^/]+\/default$/); await QU.qButton(page,'Đặt làm mặc định').click(); QU.expectUiStatus(await response,[200,204]);
      await expect(page.getByText('Mặc định',{exact:true}).first()).toBeVisible(); await page.goto('/quotations'); await QU.qButton(page,'Báo giá khách hàng').click();
      const search=page.getByPlaceholder('Tìm kiếm...',{exact:true}); await search.fill(second.cq.code); await expect(QU.quoteRow(page,second.cq.code)).toContainText('Mặc định'); await search.fill(first.cq.code); await expect(QU.quoteRow(page,first.cq.code)).not.toContainText('Mặc định');
     }); expect((await q.cq(second.cq.id)).isDefault).toBe(true); expect((await q.cq(first.cq.id)).isDefault).toBe(false);
    } finally { if(old) await CQF.makeDefault(testRun,old.id); }
  });
});
