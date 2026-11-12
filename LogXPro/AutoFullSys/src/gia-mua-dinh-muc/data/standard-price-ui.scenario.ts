import { Browser, Locator, Page, expect, test } from '@playwright/test';
import { Roles } from '../../core/fixtures/auth.fixture';
import { TestRun, TEST_RUN_ID } from '../../core/fixtures/test-run.fixture';
import { data, items, must } from '../../core/base.client';
import { P0_ITEMS, P0_LINES, P0ItemKey, SERVICES } from '../../core/data/p0-price-set';
import { env } from '../../core/env';
import { stable, uiApi } from '../../core/assertions';
import { pickOption, selectByLabel, vnd, moneyOf } from '../../core/pages/components/data-table.component';
import { withQuotePage } from '../../quan-ly-bao-gia/data/quote-ui.fixture';
import { p0Items } from '../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { setItemStatus } from '../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { P0Base } from '../../phieu-dich-vu/data/phieu-dich-vu.factory';
import { p0SheetA, p0SheetB, priceLine, ensureContractorLines } from '../../gia-mua-dau-vao/data/bang-gia-mua.factory';
import { buying, selling, histories, flowBase, sourceDelete, allTransportTemplate } from '../../gia-mua-dau-vao/data/price-flow.fixture';
import { sbpLines, setBenchmark } from './gia-mua-dinh-muc.factory';
import { sspLines, setSelling } from '../../gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { GiaMuaDinhMucPage } from '../pages/gia-mua-dinh-muc.page';
import { GiaBanDinhMucPage } from '../../gia-ban-dinh-muc/pages/gia-ban-dinh-muc.page';

const HISTORY_B = 'GET /api/standard-buying-prices/{id}/history';
const HISTORY_S = 'GET /api/standard-selling-prices/{id}/history';
const rowCode = (r: any) => { expect(r.code, 'API trả mã dòng dùng trên UI').toMatch(/^(SBP|SSP)-\d+$/); return String(r.code); };
const successful = (res: { status(): number }) => expect([200, 204]).toContain(res.status());
const caption = (k: P0ItemKey) => SERVICES[P0_ITEMS.find(i => i.key === k)!.service];
const group = (page: Page, name: string) => page.locator('main h4').filter({ hasText: name }).first().locator('xpath=ancestor::*[.//table][1]');

async function fixture(run: TestRun, id: string, benchmark = true, sell = true, secondVendor = true): Promise<P0Base> {
  const created = await p0Items(run, `${id.replace(/-/g, '')}${TEST_RUN_ID}${Math.random().toString(36).slice(2, 6)}`);
  const a = await p0SheetA(run, created, `AT UI ${id} ${run.id}`);
  const b = secondVendor ? await p0SheetB(run, created, `AT UI NT_B ${id} ${run.id}`) : undefined;
  const sbp: P0Base['sbp'] = {}, ssp: P0Base['ssp'] = {};
  for (const i of P0_LINES) {
    const buy = (await sbpLines(run, created[i.key].id))[0];
    const sale = (await sspLines(run, created[i.key].id))[0];
    expect(buy, `${i.key} có SBP`).toBeTruthy(); expect(sale, `${i.key} có SSP`).toBeTruthy();
    sbp[i.key] = buy.id; ssp[i.key] = sale.id;
    if (benchmark) await setBenchmark(run, buy.id, i.sbp!);
    if (sell) { expect(benchmark).toBe(true); await setSelling(run, sale.id, i.ssp!); }
  }
  return { items: created, sheetA: a.id, sheetB: b?.id ?? '', sbp, ssp, rfqId: '', internalQuoteId: '', rcId: '', customerId: env.ref('CUSTOMER_A_ID') };
}
async function openBuying(page: Page, run: TestRun, base: P0Base, key: P0ItemKey = 'customsFee', detail = false) {
  const r = await buying(run, base, key); const view = new GiaMuaDinhMucPage(page);
  await view.goto(); await view.tab(caption(key)).click(); const row = await view.find(rowCode(r)); await expect(row).toBeVisible();
  if (detail) { await view.viewLink(row).click(); await expect(view.detailHeading).toBeVisible(); }
  return { view, row, r };
}
async function openSelling(page: Page, run: TestRun, base: P0Base, key: P0ItemKey = 'customsFee', detail = false) {
  const r = await selling(run, base, key); const view = new GiaBanDinhMucPage(page);
  await view.goto(); await view.tab(caption(key)).click(); const row = await view.find(rowCode(r)); await expect(row).toBeVisible();
  if (detail) { await view.viewLink(row).click(); await expect(view.detailHeading).toBeVisible(); }
  return { view, row, r };
}
async function confirmSave(page: Page) {
  const modal = page.getByRole('dialog').filter({ hasText: /xác nhận|cập nhật.*dòng|lưu.*dòng|hết hạn/i }).last();
  await expect(modal, 'Có bước xác nhận trước lưu').toBeVisible();
  await modal.getByRole('button', { name: /^(Xác nhận|Tiếp tục|Đồng ý|Lưu|Cập nhật|Lưu tất cả)$/i }).last().click();
}
async function cancelBuying(view: GiaMuaDinhMucPage) {
  if (await view.bulkMode.isVisible()) {
    await view.bulkCancel.click();
    if (await view.cancelDialog.isVisible()) await view.cancelDialog.getByRole('button', { name: 'Hủy thay đổi', exact: true }).click();
    await expect(view.bulkMode).toHaveCount(0);
  }
}
async function fillBuying(page: Page, run: TestRun, base: P0Base, keys: P0ItemKey[], amounts: number[]) {
  const view = new GiaMuaDinhMucPage(page);
  for (let i = 0; i < keys.length; i++) {
    await view.tab(caption(keys[i])).click(); await view.search.fill(rowCode(await buying(run, base, keys[i])));
    await view.bulkInput(rowCode(await buying(run, base, keys[i]))).fill(String(amounts[i]));
    await expect(view.bulkCounter).toHaveText(`${i + 1} dòng đã thay đổi`);
  }
  return view;
}
async function multiRows(run: TestRun, base: P0Base) {
  const refs = await run.p0Refs();
  const offices = (await run.catalog('GET /api/catalogues/customs-offices')).filter((x: any) => x.active !== false).slice(0, 3);
  const vehicles = (await run.catalog('GET /api/catalogues/vehicle-types')).filter((x: any) => x.active !== false).slice(0, 4);
  expect(offices.length * vehicles.length, 'Cần ít nhất 11 tổ hợp để kiểm bộ đệm phân trang').toBeGreaterThan(10);
  await ensureContractorLines(run, env.ref('CONTRACTOR_A_ID'), 'VND', [priceLine(refs, base.items, 'customsFee', 1_000_000, { customsOfficeCodes: offices.map((x: any) => x.code), vehicleTypeCodes: vehicles.map((x: any) => x.code) })], `AT UI phân trang ${run.id}`);
  const rows = await sbpLines(run, base.items.customsFee.id); expect(rows.length).toBeGreaterThan(10);
  for (let i = 0; i < rows.length; i++) await setBenchmark(run, rows[i].id, 900_000 + i * 10_000);
  return rows;
}

/** Every branch performs browser actions plus UI assertions and reads back the affected record. */
export async function runBuyingUi(id: string, run: TestRun, browser: Browser, roles: Roles): Promise<void> {
  test.info().setTimeout(300_000);
  const unpriced = ['UI-SBP-006', 'UI-SBP-012'].includes(id);
  const base = await fixture(run, id, !unpriced, !unpriced, id !== 'UI-SBP-003');
  if (id === 'UI-SBP-013') {
    await withQuotePage(browser, roles, 'cc', async a => {
      const x = await openBuying(a, run, base, 'freight'); await x.view.search.fill(''); await x.view.bulkButton.click(); await expect(x.view.bulkMode).toBeVisible();
      try {
        await withQuotePage(browser, roles, 'dp', async b => {
          const y = await openBuying(b, run, base, 'freight'); await y.view.search.fill('');
          const denied = b.waitForResponse(res => new URL(res.url()).pathname.includes('/standard-buying-prices') && [409, 423].includes(res.status())); await y.view.bulkButton.click();
          expect([409, 423]).toContain((await denied).status()); await expect(b.getByText(/đang được.*cập nhật|người khác.*nhập|đang.*khóa/i).first()).toBeVisible();
          await expect(y.view.bulkMode).toHaveCount(0); await cancelBuying(x.view);
          await y.view.bulkButton.click(); await expect(y.view.bulkMode).toBeVisible(); await cancelBuying(y.view);
        });
      } finally { await cancelBuying(x.view); }
    }); return;
  }
  if (['UI-SBP-009','UI-SBP-010','UI-SBP-014','UI-SBP-015'].includes(id) && id === 'UI-SBP-009') await multiRows(run, base);
  await withQuotePage(browser, roles, 'cc', async page => {
    if (id === 'UI-SBP-001') {
      const { view, row } = await openBuying(page, run, base);
      await expect(view.heading).toBeVisible(); for (const s of GiaMuaDinhMucPage.SERVICES) await expect(view.tab(s)).toBeVisible();
      await expect(view.filterButton).toBeVisible(); await expect(view.bulkButton).toBeVisible(); await expect(view.search).toBeVisible();
      await expect(page.getByText(base.items.customsFee.name, { exact: true }).first()).toBeVisible(); await expect(row).toContainText(/SBP-\d+/);
      for (const label of [/ID/, /ĐƠN VỊ TÍNH/i, /GIÁ MUA ĐỊNH MỨC/i, /THAO TÁC/i]) await expect(row.locator('xpath=ancestor::table[1]').locator('thead')).toContainText(label);
      await expect(view.viewLink(row)).toBeVisible(); await expect(view.updateButton(row)).toBeVisible(); return;
    }
    if (id === 'UI-SBP-002') {
      await multiRows(run, base); const { view, r } = await openBuying(page, run, base);
      await expect(view.row(rowCode(r))).toBeVisible(); await expect(view.rows.filter({ hasText: rowCode(r) })).toHaveCount(1); await view.search.fill('');
      const g = group(page, base.items.customsFee.name); const index = await view.tables.evaluateAll((tables, name) => tables.findIndex(t => t.closest('section,article,div')?.textContent?.includes(String(name))), base.items.customsFee.name);
      const table = g.locator('table').first(); const sort = table.locator('thead button[title^="Sắp xếp"]').first();
      const priceValues = async () => { const hs = (await table.locator('thead th').allInnerTexts()).map(t => t.trim()); const col = hs.findIndex(t => /GIÁ MUA ĐỊNH MỨC/.test(t)); return (await table.locator(`tbody tr td:nth-child(${col+1})`).allInnerTexts()).map(moneyOf); };
      await sort.click(); let values = await priceValues(); expect(values.length).toBeGreaterThan(1); expect(values).toEqual([...values].sort((a,b)=>a-b));
      await sort.click(); values = await priceValues(); expect(values).toEqual([...values].sort((a,b)=>b-a));
      await view.tab('Vận tải').click(); const all = await allTransportTemplate(run);
      const oldRows = items(await must(await run.http.call('GET /api/standard-buying-prices',{token:run.token('cc'),query:{serviceTypeCode:(await run.p0Refs()).services.VT, perPage:100}}),'SBP tất cả'));
      const any = oldRows.find(x=>x.originPointName==='Tất cả'); expect(any,'Có SBP dùng giá trị Tất cả').toBeTruthy();
      await view.search.fill(rowCode(any)); await view.filterButton.click();
      const refs = await run.p0Refs(); const point = (await run.catalog('GET /api/catalogues/transport-points')).find((x:any)=>x.code===refs.originPoint);
      await pickOption(page,view.filterSelect('Điểm đi'), point?.name ?? String((await buying(run,base,'freight')).originPointName)); await view.applyFilter.click();
      await expect(view.row(rowCode(any)), 'Dòng Tất cả vẫn qua bộ lọc cụ thể').toBeVisible();
      await view.tab('Khai báo hải quan').click(); await view.search.fill(rowCode(r)); await expect(view.row(rowCode(r))).toBeVisible(); void index; void all; return;
    }
    if (id === 'UI-SBP-003') {
      const r = await buying(run,base,'freight'); await must(await run.http.call('GET /api/standard-buying-prices/{id}',{token:run.token('cc'),params:{id:r.id}}),'đọc xóa cảnh báo cũ');
      await p0SheetB(run,base.items,`AT Thêm NT_B ${id} ${run.id}`);
      const {view,row}=await openBuying(page,run,base,'freight'); await expect(view.warningIcon(row)).toBeVisible(); await view.viewLink(row).click(); await expect(view.detailHeading).toBeVisible();
      const c = await must(await run.http.call('GET /api/standard-buying-prices/{id}/contractors',{token:run.token('cc'),params:{id:r.id}}),'bảng nhà thầu');
      const b = c.contractors.find((x:any)=>x.contractorId===env.ref('CONTRACTOR_B_ID')); expect(b).toBeTruthy(); const changed=view.contractorRow(b.contractorName); await expect(changed).toBeVisible();
      const tone=await changed.evaluate(el=>[el,...el.querySelectorAll('td')].map(e=>getComputedStyle(e).backgroundColor).join('|'));
      const a=c.contractors.find((x:any)=>x.contractorId===env.ref('CONTRACTOR_A_ID')); const normal=await view.contractorRow(a.contractorName).evaluate(el=>[el,...el.querySelectorAll('td')].map(e=>getComputedStyle(e).backgroundColor).join('|'));
      expect(tone,'Nhà thầu mới được tô nổi').not.toBe(normal); await view.goto(); await view.tab('Vận tải').click(); await view.search.fill(rowCode(r)); await expect(view.warningIcon(view.row(rowCode(r)))).toHaveCount(0); expect((await buying(run,base,'freight')).needsAttention).toBe(false); return;
    }
    if (id === 'UI-SBP-004' || id === 'UI-SBP-005') {
      const {view,r}=await openBuying(page,run,base,'freight',true);
      if(id.endsWith('004')) {
        for(const label of ['Lịch sử thao tác','Loại dịch vụ','Đầu mục giá','Loại giá','Cơ cấu giá mua định mức','Đơn vị tính','Tiền tệ','Giá mua định mức','Bảng giá mua theo nhà thầu','Chức năng quy đổi tiền tệ','Nguồn tỉ giá']) await expect(page.getByText(label,{exact:true}).first(),label).toBeVisible();
        await expect(view.editBenchmark).toBeVisible(); await expect(page.locator('main')).toContainText(rowCode(r));
        for(const h of ['ID','Tên nhà thầu','Hạng nhà thầu','Đơn giá gốc','Quy đổi tiền tệ','So với định mức','Trạng thái giá','Hạn mức sản lượng khuyến nghị']) await expect(view.contractorBlock.locator('thead')).toContainText(new RegExp(h,'i'));
      } else {
        await pickOption(page,view.rateSource,/nhập tay|thủ công/i); await view.rateInput(0).fill('25000');
        const response=uiApi(page,'PUT',/\/conversion$/); await page.getByRole('button',{name:/^(Cập nhật|Xác nhận|Lưu thông tin)$/}).last().click(); successful(await response);
        const c=await must(await run.http.call('GET /api/standard-buying-prices/{id}/contractors',{token:run.token('cc'),params:{id:r.id}}),'đọc quy đổi'); const b=c.contractors.find((x:any)=>x.contractorId===env.ref('CONTRACTOR_B_ID')); expect(b.converted).toBe(10_000_000); expect(b.againstBenchmark).toBe(500_000);
        const row=view.contractorRow(b.contractorName); await expect(row).toContainText(vnd(10_000_000)); await expect(row).toContainText(new RegExp('\\+?'+vnd(500_000).replace(/\./g,'\\.')));
        const diff=row.getByText(/\+?500[.,]000/).first(); const color=await diff.evaluate(el=>getComputedStyle(el).color); expect(color,'Chênh lệch dương có màu đỏ').toMatch(/rgb\((2\d\d|1[5-9]\d),\s*([0-9]|[1-9]\d),/);
        expect((await buying(run,base,'freight')).benchmarkPrice).toBe(9_500_000);
      } return;
    }
    if (id === 'UI-SBP-006' || id === 'UI-SBP-007') {
      const {view,row,r}=await openBuying(page,run,base); const before=stable(await buying(run,base,'customsFee')); const h0=await histories(run,HISTORY_B,r.id);
      await view.updateButton(row).click(); await expect(view.updateDialog).toBeVisible(); await expect(view.updateDialog.locator('input:not([readonly]):not([disabled])')).toHaveCount(1);
      if(id.endsWith('006')) {
        await view.priceInput.fill('1000000'); const response=uiApi(page,'PUT',/\/benchmark$/); await view.dialogSave.click(); successful(await response); await expect(view.updateDialog).toHaveCount(0);
        await expect(view.row(rowCode(r))).toContainText(vnd(1_000_000)); expect((await buying(run,base,'customsFee')).benchmarkPrice).toBe(1_000_000); const history=await histories(run,HISTORY_B,r.id); expect(history).toHaveLength(h0.length+1); expect(JSON.stringify(history[0])).toContain('1000000'); expect((await selling(run,base,'customsFee')).needsAttention).toBe(true);
      } else {
        for(const value of ['', '0']) { await view.priceInput.fill(value); await view.priceInput.press('Tab'); if(await view.dialogSave.isEnabled()) await view.dialogSave.click(); await expect(view.updateDialog.getByText(value===''?/vui lòng nhập giá mua định mức/i:/lớn hơn 0|>\s*0/i).first()).toBeVisible(); expect(stable(await buying(run,base,'customsFee'))).toEqual(before); }
        await view.dialogCancel.click(); expect(await histories(run,HISTORY_B,r.id)).toEqual(h0);
      } return;
    }
    if(id==='UI-SBP-009') {
      const view=new GiaMuaDinhMucPage(page); await view.goto(); await view.tab('Khai báo hải quan').click(); const g=group(page,base.items.customsFee.name); await g.locator('select').last().selectOption('10'); await view.bulkButton.click(); await expect(view.bulkMode).toBeVisible();
      try { const inputs=g.getByRole('textbox',{name:/^Giá mua định mức dòng /}); const codes:string[]=[]; const values=['1010000','1020000','1030000']; for(let i=0;i<3;i++){const input=inputs.nth(i);codes.push((await input.getAttribute('aria-label'))!.replace('Giá mua định mức dòng ',''));await input.fill(values[i]);} await expect(view.bulkCounter).toHaveText('3 dòng đã thay đổi');
        await g.getByRole('button',{name:'2',exact:true}).click(); await g.locator('thead button[title^="Sắp xếp"]').first().click(); await g.getByRole('button',{name:'1',exact:true}).click();
        for(let i=0;i<3;i++){await view.search.fill(codes[i]);await expect(view.bulkInput(codes[i])).toHaveValue(new RegExp(values[i].split('').join('[.,]?')));} await expect(view.bulkCounter).toHaveText('3 dòng đã thay đổi');
      } finally {await cancelBuying(view);} return;
    }
    const keys:P0ItemKey[]=id==='UI-SBP-015'?['customsFee','overtime','storage']:['customsFee','overtime','supervision'];
    const view=new GiaMuaDinhMucPage(page); await view.goto(); await view.tab('Khai báo hải quan').click(); await view.bulkButton.click(); await expect(view.bulkMode).toBeVisible();
    try {
      if(id==='UI-SBP-008') { const r=await buying(run,base,'customsFee'); await view.search.fill(rowCode(r)); const input=view.bulkInput(rowCode(r)); const before=stable(r);
        for(const value of ['abc','-1','0']) {await input.fill('');await input.pressSequentially(value);await input.press('Tab');await expect(input).toHaveClass(/red|error|invalid/);await input.hover();await expect(page.getByText(/giá mua định mức phải là số lớn hơn 0|vui lòng nhập giá mua định mức/i).first()).toBeVisible();await expect(view.bulkSave).toBeDisabled();expect(stable(await buying(run,base,'customsFee'))).toEqual(before);}
        await input.fill('0,01');await input.press('Tab');await expect(input).not.toHaveClass(/red|error|invalid/);await expect(view.bulkSave).toBeEnabled();return;
      }
      if(id==='UI-SBP-011') {await view.bulkSave.click();await expect(page.getByText('Chưa có dòng giá nào được thay đổi',{exact:true})).toBeVisible();await expect(view.bulkMode).toBeVisible();return;}
      if(id==='UI-SBP-012') {
        const h0=new Map<string,any[]>();for(const k of P0_LINES.map(i=>i.key))h0.set(k,await histories(run,HISTORY_B,base.sbp[k]!));
        await fillBuying(page,run,base,P0_LINES.map(i=>i.key),P0_LINES.map(i=>i.sbp!));await view.bulkSave.click();const response=uiApi(page,'PUT',/\/benchmarks$/);await confirmSave(page);successful(await response);await expect(page.getByText('Đã cập nhật giá mua định mức cho 6 dòng',{exact:true})).toBeVisible();
        for(const i of P0_LINES){expect((await buying(run,base,i.key)).benchmarkPrice).toBe(i.sbp);expect((await buying(run,base,i.key)).benchmarkMissing).toBe(false);expect(await histories(run,HISTORY_B,base.sbp[i.key]!)).toHaveLength(h0.get(i.key)!.length+1);}return;
      }
      const before=await Promise.all(keys.map(k=>buying(run,base,k)));await fillBuying(page,run,base,keys,[1_010_000,310_000,810_000]);
      if(id==='UI-SBP-010'){await view.bulkCancel.click();await expect(view.cancelDialog).toContainText('Có 3 dòng chưa lưu, bạn có chắc muốn thoát?');await view.cancelDialog.getByRole('button',{name:'Huỷ',exact:true}).click();await expect(view.bulkMode).toBeVisible();await expect(view.bulkCounter).toHaveText('3 dòng đã thay đổi');await view.bulkCancel.click();await view.cancelDialog.getByRole('button',{name:'Hủy thay đổi',exact:true}).click();await expect(view.bulkMode).toHaveCount(0);expect(stable(await Promise.all(keys.map(k=>buying(run,base,k))))).toEqual(stable(before));return;}
      if(id==='UI-SBP-014') {
        successful(await setItemStatus(run,base.items.supervision,'INACTIVE'));
        try {await view.bulkSave.click();const modal=page.getByRole('dialog').last();await expect(modal).toContainText(base.items.supervision.name);await expect(modal).toContainText(rowCode(before[2]));await modal.getByRole('button',{name:/^Hủy$|^Huỷ$/}).click();await expect(view.bulkMode).toBeVisible();expect((await buying(run,base,'customsFee')).benchmarkPrice).toBe(before[0].benchmarkPrice);expect((await buying(run,base,'overtime')).benchmarkPrice).toBe(before[1].benchmarkPrice);await view.bulkSave.click();const response=uiApi(page,'PUT',/\/benchmarks$/);await confirmSave(page);successful(await response);expect((await buying(run,base,'customsFee')).benchmarkPrice).toBe(1_010_000);expect((await buying(run,base,'overtime')).benchmarkPrice).toBe(310_000);}
        finally {successful(await setItemStatus(run,base.items.supervision,'ACTIVE'));} expect((await buying(run,base,'supervision')).benchmarkPrice).toBe(before[2].benchmarkPrice);return;
      }
      if(id==='UI-SBP-015'){await sourceDelete(run,base,'storage');expect(await sbpLines(run,base.items.storage.id)).toHaveLength(0);await view.bulkSave.click();const response=uiApi(page,'PUT',/\/benchmarks$/);await confirmSave(page);successful(await response);await expect(page.getByText('Đã cập nhật 2 dòng. 1 dòng không còn tồn tại do dữ liệu đã được đồng bộ lại',{exact:true})).toBeVisible();expect((await buying(run,base,'customsFee')).benchmarkPrice).toBe(1_010_000);expect((await buying(run,base,'overtime')).benchmarkPrice).toBe(310_000);return;}
      throw new Error(`Chưa có kịch bản UI cho ${id}`);
    } finally {await cancelBuying(view);}
  });
}

export async function runSellingUi(id: string, run: TestRun, browser: Browser, roles: Roles): Promise<void> {
  test.info().setTimeout(300_000);
  const base=id==='UI-SSP-006'?await flowBase(run,id):await fixture(run,id,id!=='UI-SSP-003',!['UI-SSP-003','UI-SSP-005','UI-SSP-010'].includes(id));
  if(id==='UI-SSP-007')await setBenchmark(run,base.sbp.customsFee!,1_050_000);
  await withQuotePage(browser,roles,'cc',async page=>{
    const {view,row,r}=await openSelling(page,run,base,'customsFee',['UI-SSP-003','UI-SSP-004','UI-SSP-005','UI-SSP-006','UI-SSP-008','UI-SSP-009'].includes(id));
    if(id==='UI-SSP-001'){for(const s of GiaBanDinhMucPage.SERVICES)await expect(view.tab(s)).toBeVisible();await expect(view.heading).toBeVisible();await expect(view.filterButton).toBeVisible();await expect(view.bulkButton).toBeVisible();await expect(view.search).toBeVisible();for(const h of ['ID','Đơn vị tính','Giá mua định mức','Lợi nhuận','Giá bán định mức','Thao tác'])await expect(row.locator('xpath=ancestor::table[1]').locator('thead')).toContainText(new RegExp(h,'i'));await expect(view.updateButton(row)).toBeVisible();await expect(view.viewLink(row)).toBeVisible();
      const g=group(page,base.items.customsFee.name);expect(await g.locator('thead button[title^="Sắp xếp"]').count(),'Có sắp xếp giá mua và giá bán').toBeGreaterThanOrEqual(2);return;}
    if(id==='UI-SSP-002'){await view.filterButton.click();for(const label of ['Đầu mục giá','Trạng thái giá bán','Chi cục Hải Quan / Cửa khẩu','Loại hình XNK','Nhóm hàng','Loại xe','Đơn vị tính'])await expect(view.filterPanel.getByText(label,{exact:true}).first()).toBeVisible();await pickOption(page,view.filterSelect('Trạng thái giá bán'),'Đã thiết lập');await pickOption(page,view.filterSelect('Đầu mục giá'),base.items.customsFee.name);await view.applyFilter.click();await expect(view.row(rowCode(r))).toBeVisible();expect(r.sellingPriceSet).toBe(true);
      await view.filterButton.click();await pickOption(page,view.filterSelect('Trạng thái giá bán'),'Chưa thiết lập');await view.applyFilter.click();await expect(view.row(rowCode(r))).toHaveCount(0);await view.tab('Kho bãi').click();await view.search.fill(rowCode(await selling(run,base,'storage')));await expect(view.row(rowCode(await selling(run,base,'storage')))).toBeVisible();return;}
    if(id==='UI-SSP-003'){const text='Chưa có giá mua định mức, người dùng không thể nhập giá bán định mức';await expect(view.editSelling).toHaveCount(0);await expect(page.getByText(text,{exact:true})).toBeVisible();await view.goto();await view.tab('Khai báo hải quan').click();await view.search.fill(rowCode(r));const locked=view.updateButton(view.row(rowCode(r)));await expect(locked).toBeDisabled();await locked.hover({force:true});await expect(page.getByText(text,{exact:true}).or(page.locator(`[title="${text}"]`)).first()).toBeVisible();return;}
    if(id==='UI-SSP-004'){for(const label of ['Lịch sử thao tác','Loại dịch vụ','Đầu mục giá','Loại giá','Cơ cấu giá bán định mức','Đơn vị tính','Tiền tệ','Giá mua định mức','Giá bán định mức','Lợi nhuận'])await expect(page.getByText(label,{exact:true}).first()).toBeVisible();await expect(view.editSelling).toBeVisible();await expect(page.locator('main')).toContainText(rowCode(r));await expect(page.locator('main')).toContainText(`ID mua: ${r.standardBuyingPriceCode}`);await expect(page.locator('main')).toContainText(/\+20[,.]00%/);return;}
    if(id==='UI-SSP-007'){const before=await selling(run,base,'customsFee');expect(before.needsAttention).toBe(true);await expect(view.warningIcon(row)).toBeVisible();await view.warningIcon(row).hover();const response=uiApi(page,'POST',/\/acknowledgement$/);await page.getByRole('button',{name:'Đã giải quyết',exact:true}).click();successful(await response);await expect(view.warningIcon(view.row(rowCode(r)))).toHaveCount(0);const after=await selling(run,base,'customsFee');expect(after.needsAttention).toBe(false);expect(after.sellingPrice).toBe(before.sellingPrice);return;}
    if(id==='UI-SSP-010'){await view.search.fill('');await view.bulkButton.click();await expect(view.bulkMode).toBeVisible();const before=new Map<string,any[]>();for(let i=0;i<P0_LINES.length;i++){const x=P0_LINES[i];const sale=await selling(run,base,x.key);before.set(x.key,await histories(run,HISTORY_S,sale.id));await view.tab(caption(x.key)).click();await view.search.fill(rowCode(sale));await view.bulkInput(rowCode(sale)).fill(String(x.ssp));await expect(view.bulkCounter).toHaveText(`${i+1} dòng đã thay đổi`);}
      await view.tab('Hải quan giám sát').click();const extra=(await sspLines(run,base.items.seal.id))[0];expect(extra.benchmarkPrice).toBeNull();await view.search.fill(rowCode(extra));await expect(view.bulkInput(rowCode(extra))).toBeDisabled();await view.bulkSave.click();const response=uiApi(page,'PUT',/\/selling-prices$/);await confirmSave(page);successful(await response);await expect(page.getByText(/đã cập nhật.*6 dòng/i)).toBeVisible();for(const x of P0_LINES){const sale=await selling(run,base,x.key);expect(sale.sellingPrice).toBe(x.ssp);expect(await histories(run,HISTORY_S,sale.id)).toHaveLength(before.get(x.key)!.length+1);}return;}
    const before=stable(await selling(run,base,'customsFee'));const h0=await histories(run,HISTORY_S,r.id);await view.editSelling.click();await expect(view.updateDialog).toBeVisible();
    if(id==='UI-SSP-005'){await view.priceInput.fill('1200000');await expect(view.expectedProfit).toContainText(/\+?20[,.]00%/);await expect(view.updateDialog.locator('input:not([readonly]):not([disabled])')).toHaveCount(1);const response=uiApi(page,'PUT',/\/selling-price$/);await view.dialogSave.click();successful(await response);await expect(page.locator('main')).toContainText(/\+20[,.]00%/);const sale=await selling(run,base,'customsFee');expect(sale.sellingPrice).toBe(1_200_000);expect(Number(sale.profitPercent)).toBe(20);const history=await histories(run,HISTORY_S,r.id);expect(history).toHaveLength(h0.length+1);expect(JSON.stringify(history[0])).toContain('1200000');return;}
    if(id==='UI-SSP-006'){await view.priceInput.fill('1300000');await view.dialogSave.click();const modal=page.getByRole('dialog').filter({hasText:/hết hạn/i}).last();await expect(modal).toBeVisible();expect((await selling(run,base,'customsFee')).sellingPrice).toBe(before.sellingPrice);await modal.getByRole('button',{name:/^Hủy$|^Huỷ$/}).click();expect((await selling(run,base,'customsFee')).sellingPrice).toBe(before.sellingPrice);await view.dialogSave.click();const response=uiApi(page,'PUT',/\/selling-price$/);await confirmSave(page);successful(await response);expect((await selling(run,base,'customsFee')).sellingPrice).toBe(1_300_000);const cq=await must(await run.http.call('GET /api/customer-quotations/{id}',{token:run.token('k1'),params:{id:base.rcId}}),'BGKH sau thay giá');expect(cq.lines.find((l:any)=>l.revenueItemId===base.items.customsFee.id||l.priceConfigurationItemId===base.items.customsFee.id).expired).toBe(true);return;}
    if(id==='UI-SSP-008'||id==='UI-SSP-009'){for(const value of id.endsWith('008')?['']:['-1','abc']){await view.priceInput.fill('');await view.priceInput.pressSequentially(value);await view.priceInput.press('Tab');if(await view.dialogSave.isEnabled())await view.dialogSave.click();await expect(view.updateDialog.getByText(value===''?/vui lòng nhập giá bán định mức/i:/giá.*(hợp lệ|lớn hơn|không được âm|không âm)|phải là số/i).first()).toBeVisible();expect(stable(await selling(run,base,'customsFee'))).toEqual(before);}await view.dialogCancel.click();expect(await histories(run,HISTORY_S,r.id)).toEqual(h0);return;}
    throw new Error(`Chưa có kịch bản UI cho ${id}`);
  });
}
