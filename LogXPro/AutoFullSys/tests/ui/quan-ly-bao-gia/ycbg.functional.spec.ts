import * as QU from '../../../src/quan-ly-bao-gia/data/quote-ui.scenario';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
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

test.describe("Yêu cầu báo giá", () => {
  test("UI-RFQ-003 Lọc và Bộ lọc nâng cao", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const refs=await testRun.p0Refs(); const r=await createRfq(testRun,{submit:true,services:['VT']}); const d=await q.rfq(r.id);
    const customer=await must(await http.call('GET /api/customers/{id}',{token:tok('k1'),params:{id:d.customerId}}),'KH bộ lọc');
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await page.goto('/quotations'); await QU.qButton(page,'Khách hàng').click(); await QU.qButton(page,d.customerName).last().click();
     await page.getByText('Dịch vụ',{exact:true}).click(); await page.getByText('Vận tải',{exact:true}).last().click(); await page.keyboard.press('Escape');
     await page.getByText('Tất cả trạng thái',{exact:true}).click(); await page.getByText('Chờ báo giá',{exact:true}).last().click();
     await QU.qButton(page,'Bộ lọc nâng cao').click(); const panel=QU.dialog(page); const code=QU.inputByLabel(panel,'Mã khách hàng'); await expect(code).toBeVisible(); await code.fill(customer.code);
     await panel.getByRole('button',{name:'Áp dụng',exact:true}).click(); await expect(QU.quoteRow(page,r.code)).toBeVisible();
     const rows=page.locator('main tbody tr'); for(const row of await rows.all()) { await expect(row).toContainText(d.customerName); await expect(row).toContainText('Chờ báo giá'); await expect(row).toContainText(/Vận tải/); }
    });
  });

  test("UI-RFQ-004 Form tạo YCBG", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun }) => {

    await withQuotePage(browser, roles, 'k1', async page => {
      await page.goto('/quotations');
      await page.getByRole('button', { name: 'Thêm mới', exact: true }).click();
      await expect(page).toHaveURL(/\/quotations\/requests\/new/);
      for (const name of ['Lưu nháp', 'Gửi sang Pricing']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
      for (const label of ['Yêu cầu mới', 'Yêu cầu bổ sung', 'Khách hàng', 'Hợp đồng áp dụng', 'Thời gian gửi báo giá', 'Đơn vị tiền tệ', 'Ghi chú chung', 'Cửa khẩu', 'Loại hình XNK', 'Nhóm hàng', 'Phương thức vận tải', 'Đặc tính hàng hóa', 'Quy cách đóng gói sơ bộ', 'Loại xe yêu cầu', 'Số lượng dự kiến/tháng', 'Khai báo hải quan', 'Hải quan giám sát', 'Vận tải', 'Sang tải', 'Kho bãi']) {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        await expect(page.getByText(new RegExp('^' + escaped + '\\s*\\*?$')).first(), label).toBeVisible();
      }
      // Required markers are part of the rendered labels, rather than inferred from API schemas.
      for (const label of ['Khách hàng', 'Hợp đồng áp dụng', 'Đơn vị tiền tệ', 'Cửa khẩu', 'Loại hình XNK', 'Nhóm hàng', 'Phương thức vận tải', 'Đặc tính hàng hóa', 'Quy cách đóng gói sơ bộ', 'Loại xe yêu cầu', 'Số lượng dự kiến/tháng']) {
        await expect(page.getByText(new RegExp('^' + label + '\\s*\\*$')).first(), `Dấu bắt buộc ${label}`).toBeVisible();
      }
    });

  });

  test("UI-RFQ-005 Trường chi tiết từng dịch vụ", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await page.goto('/quotations/requests/new');
     const fields:Record<string,string[]>={'Khai báo hải quan':['Địa điểm làm TTHQ','File đính kèm','Ghi chú'],'Hải quan giám sát':['Chi cục hải quan','File đính kèm','Ghi chú'],'Vận tải':['Quốc gia','Tỉnh thành','Phường/Xã','Địa chỉ cụ thể','File đính kèm','Ghi chú'],'Sang tải':['Địa điểm sang tải','Loại hình sang tải','Loại hàng','Ghi chú'],'Kho bãi':['Địa điểm kho','Loại hình kho','Đơn vị tính lưu kho','Số lượng lưu kho','Ngày lưu kho','Dịch vụ gia tăng (VAS)','Ghi chú']};
     for(const [service,labels] of Object.entries(fields)) {
      await QU.enableRfqService(page,service); for(const label of labels) await expect(page.locator('main label').filter({hasText:new RegExp('^'+QU.escape(label)+'\\s*\\*?$')}).first(),`${service}: ${label}`).toBeVisible();
      if(['Khai báo hải quan','Hải quan giám sát','Vận tải'].includes(service)) { await expect(page.locator('input[type=file]').last()).toHaveAttribute('accept',/\.pdf.*\.docx/); await expect(page.getByText('Hỗ trợ PDF, DOCX tối đa 20MB',{exact:true})).toBeVisible(); }
      if(service==='Vận tải') { for(const label of ['Sao chép','Xóa','Thêm cặp điểm vận tải']) await expect(QU.qButton(page,label)).toBeVisible(); await expect(page.getByRole('radio',{name:'Địa chỉ',exact:true}).first()).toBeVisible(); await expect(page.getByRole('radio',{name:'Cửa khẩu',exact:true}).first()).toBeVisible(); }
     }
    });
  });

  test("UI-RFQ-007 Tạo YCBG đủ 5 dịch vụ và gửi", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    test.setTimeout(600000); const q=new QuoteScenario(testRun);
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await QU.fillRfqBasics(page,testRun); await QU.fillRfqServices(page,testRun,['KHQ','HQGS','VT','ST','KB']);
     const response=QU.apiFromUi(page,'POST',/\/quotation-requests(?:\/[^/]+\/submit)?$/); await QU.qButton(page,'Gửi sang Pricing').click();
     await expect(QU.dialog(page).getByText(/Gửi yêu cầu.*sang bộ phận Định giá/)).toBeVisible(); await QU.dialog(page).getByRole('button',{name:/^(Xác nhận|Gửi sang Pricing|Gửi yêu cầu)$/}).click(); QU.expectUiStatus(await response,[200,201,204]);
     await expect(page.getByText('Đã gửi yêu cầu sang Pricing',{exact:true})).toBeVisible(); await expect(page).toHaveURL(/\/quotations\/requests\/[0-9a-f-]{36}$/i);
     const id=page.url().split('/').pop()!; await expect.poll(async()=> (await q.rfq(id)).status).toBe('AWAITING_PRICING'); const d=await q.rfq(id); const refs=await testRun.p0Refs(); expect(d.services.map((s:any)=>s.serviceTypeCode).sort()).toEqual(Object.values(refs.services).sort());
     await expect(page.getByText('Chờ báo giá',{exact:true}).first()).toBeVisible();
    });
  });

  test("UI-RFQ-008 Lưu nháp", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const seed=await q.newRfq(); const customer=(await q.rfq(seed.id)).customerName;
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await page.goto('/quotations/requests/new'); await QU.choose(page,'Khách hàng',customer); await QU.enableRfqService(page,'Khai báo hải quan');
     await expect(QU.inputByLabel(page,'Số lượng dự kiến/tháng')).toHaveValue('');
     const response=QU.apiFromUi(page,'POST',/\/quotation-requests$/); await QU.qButton(page,'Lưu nháp').click(); QU.expectUiStatus(await response,[200,201]);
     await expect(page.getByText('Đã lưu nháp yêu cầu báo giá',{exact:true})).toBeVisible(); await expect(page).toHaveURL(/\/quotations\/requests\/[0-9a-f-]{36}$/i);
     const d=await q.rfq(page.url().split('/').pop()!); expect(d.status).toBe('DRAFT'); expect(d.code).toMatch(/^RFQ\d{6}-\d{3,}$/); expect(d.services).toHaveLength(1); await expect(page.getByText('Nháp',{exact:true}).first()).toBeVisible();
    });
  });

  test("UI-RFQ-011 Yêu cầu bổ sung khóa khách hàng, hợp đồng, tiền tệ", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const x=await q.active(); const pending=await q.pending();
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await page.goto('/quotations/requests/new'); await QU.qButton(page,'Yêu cầu bổ sung').click(); await page.getByText('Chọn báo giá khách hàng',{exact:true}).click();
     await expect(page.getByText(pending.cq.code,{exact:false})).toHaveCount(0); await page.getByText(new RegExp(QU.escape(x.cq.code))).last().click();
     await expect(QU.quoteControl(page,'Khách hàng')).toBeDisabled();
     for(const name of ['Hợp đồng áp dụng','Đơn vị tiền tệ']) await expect(QU.quoteControl(page,name)).toHaveClass(/Disabled|disabled/);
     await expect(QU.fieldRoot(page,'Khách hàng')).toContainText(x.cq.customerName); await expect(QU.fieldRoot(page,'Đơn vị tiền tệ')).toContainText(/Đồng Việt Nam|VND|VNĐ/);
     await expect(page.getByText(/lấy theo báo giá gốc/i).first()).toBeVisible();
    });
  });

  test("UI-RFQ-012 File đính kèm 20MB và 21MB", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const pdf20=REAL.pdf20(),pdf21=REAL.pdf21(); expect(pdf20.buffer.length).toBe(20*1024*1024); expect(pdf21.buffer.length).toBe(21*1024*1024);
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await page.goto('/quotations/requests/new'); await QU.enableRfqService(page,'Khai báo hải quan'); const input=page.locator('input[type=file]').last(); await expect(input).toHaveAttribute('accept',/\.pdf.*\.docx/);
     await input.setInputFiles(pdf20); await expect(page.getByText(pdf20.name,{exact:false}).first()).toBeVisible();
     await input.setInputFiles(pdf21); await expect(page.getByText(/20\s*MB|vượt.*dung lượng/i).last()).toBeVisible(); await expect(page.getByText(pdf21.name,{exact:true})).toHaveCount(0); await expect(page.getByText(pdf20.name,{exact:false}).first()).toBeVisible();
    });
  });

  test("UI-RFQ-013 Lấy tự động BGNB khi thiếu giá bán định mức", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    blockedUnless(['RFQ_NO_PRICE_ID']);
    const id=process.env.RFQ_NO_PRICE_ID!.trim();
    const q=new QuoteScenario(testRun); const before=stable(await q.rfq(id)); expect((before as any).status).toBe('DRAFT'); expect((before as any).internalQuoteId??(before as any).internalQuote?.id??null).toBeNull();
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await page.goto(`/quotations/requests/${id}`); await QU.qButton(page,'Lấy tự động BGNB').click(); const response=QU.apiFromUi(page,'POST',/\/quotation-requests\/[^/]+\/auto-internal-quote$/); await QU.dialog(page).getByRole('button',{name:/^(Xác nhận|Lấy tự động BGNB)$/}).click(); QU.expectUiStatus(await response,[400,409,422]);
     await expect(page.getByText('Không đủ dữ liệu giá bán định mức để tạo báo giá tự động. Vui lòng gửi yêu cầu sang Pricing',{exact:true})).toBeVisible();
    }); expect(stable(await q.rfq(id))).toEqual(before);
  });

  test("UI-RFQ-001 Danh sách YCBG của K1", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, testRun }) => {

    const q = new QuoteScenario(testRun);
    const r = await q.newRfq();
    const d = await q.rfq(r.id);
    await withQuotePage(browser, roles, 'k1', async page => {
      await page.goto('/quotations');
      await expect(page.getByRole('heading', { name: 'Quản lý báo giá', exact: true })).toBeVisible();
      await expect(quoteTab(page, 'Yêu cầu báo giá')).toBeVisible();
      await expect(quoteTab(page, 'Báo giá khách hàng')).toBeVisible();
      await expect(page.getByRole('button', { name: /Bộ lọc nâng cao/i })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Thêm mới', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /^(Tất cả )?khách hàng$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^(Tất cả )?dịch vụ$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Tất cả trạng thái', exact: true })).toBeVisible();
      const search = page.getByPlaceholder('Tìm kiếm...', { exact: true });
      await expect(search).toBeVisible(); await search.fill(r.code);
      const table = new DataTableComponent(page);
      await expect(table.row(r.code)).toBeVisible();
      expect(await table.headerTexts()).toEqual(expect.arrayContaining([/^STT$/i, /Mã RFQ/i, /^Khách hàng$/i, /^Dịch vụ$/i, /Pricing phụ trách/i, /^Trạng thái$/i, /^Người tạo$/i, /^Ngày tạo$/i]));
      const row = table.row(r.code);
      await expect(row).toContainText(d.customerName); await expect(row).toContainText('Nháp');
      await expect(row).toContainText('-/-'); await expect(row).toContainText(d.createdByName);
      await expect(row.locator('td').last()).toContainText(/\d{2}:\d{2}/);
      await expect(row.locator('td').last()).toContainText(/\d{2}\/\d{2}\/\d{4}/);
    });

  });

  test("UI-RFQ-016 Thêm, sao chép, xóa cặp điểm vận tải", { tag: ["@ui", "@quan-ly-bao-gia", "@p3"] }, async ({ browser, roles, http, testRun, tok }) => {
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await page.goto('/quotations/requests/new'); await QU.enableRfqService(page,'Vận tải'); await QU.fillRoute(page,testRun);
     const snapshot=async(pair:any)=>({inputs:await pair.locator('input').evaluateAll((els:HTMLInputElement[])=>els.map(el=>({type:el.type,value:el.value,checked:el.checked}))),selects:await pair.locator('div[tabindex="0"]').allInnerTexts()});
     const original=await snapshot(QU.routePair(page,1)); await QU.qButton(page,'Thêm cặp điểm vận tải').click(); await expect(page.getByText('Cặp điểm vận tải #2',{exact:true})).toBeVisible(); expect(await snapshot(QU.routePair(page,1))).toEqual(original);
     await QU.routePair(page,1).getByRole('button',{name:'Sao chép',exact:true}).click(); await expect(page.getByText('Cặp điểm vận tải #3',{exact:true})).toBeVisible(); expect(await snapshot(QU.routePair(page,3))).toEqual(original);
     await QU.routePair(page,2).getByRole('button',{name:'Xóa',exact:true}).click(); await expect(page.getByText('Cặp điểm vận tải #3',{exact:true})).toHaveCount(0); expect(await snapshot(QU.routePair(page,1))).toEqual(original); expect(await snapshot(QU.routePair(page,2))).toEqual(original);
    });
  });
});
