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
  test("UI-PNL-001 Màn Chi phí - doanh thu", { tag: ["@ui", "@chi-phi-doanh-thu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    await withOps(browser,roles,'cc',async page=>{
    await page.goto('/cost-revenue'); await expect(page.getByRole('heading',{name:'Chi phí - doanh thu',exact:true})).toBeVisible();
    await expect(page.getByText('Quản lý chi phí - doanh thu của toàn bộ dịch vụ',{exact:true})).toBeVisible();
    await expect(action(page,'Xuất dữ liệu Excel')).toBeVisible(); await expect(action(page,'Bộ lọc')).toBeVisible();
    await labelsVisible(page,['Tổng doanh thu','Tổng chi phí','Tổng lợi nhuận gộp (VND)','Biên lợi nhuận']);
    await expect(page.getByText(/Ngày kết thúc thực hiện:/).first()).toContainText(/hôm nay/i); await expect(action(page,'Xóa tất cả')).toBeVisible();
    await headersVisible(page,['Mã phiếu dịch vụ','Khách hàng','Trạng thái','Doanh thu (VND)','Chi phí (VND)','Lợi nhuận','Kết thúc thực hiện','Ngày hoàn thành','Người tạo']);
    await expect(page.getByRole('checkbox').first()).toBeVisible();
    const res=await http.call('GET /api/cost-revenue/orders',{token:tok('cc'),query:{page:1,perPage:20,performedFrom:today(),performedTo:today()}});
    expectStatusIn(res,'200'); const d=await data(res); if(!items(d).length) await expect(page.getByText('Không tìm thấy phiếu dịch vụ phù hợp. Xóa bộ lọc',{exact:true})).toBeVisible();
    });
  });

  test("UI-PNL-002 Xóa bộ lọc thấy phiếu P0", { tag: ["@ui", "@chi-phi-doanh-thu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun,'COMPLETED');
    await withOps(browser,roles,'cc',async page=>{await page.goto('/cost-revenue'); await clearFilters(page); await page.getByPlaceholder('Tìm theo mã phiếu dịch vụ...',{exact:true}).fill(o.code);
    const row=dataRow(page,o.code); await expect(row).toBeVisible(); await expectAmounts(row,[15_900_000,14_000_000]); await expect(row).toContainText(/11[,.]95\s*%/);
    const profit=row.locator('td').filter({hasText:/11[,.]95\s*%/}); await expect(profit).toHaveCSS('color',/rgb\([^)]*\)/); expect(await profit.getAttribute('class'),'Lãi có chỉ báo màu xanh').toMatch(/green|emerald|success/);
    });
  });

  test("UI-PNL-003 Bộ lọc nâng cao", { tag: ["@ui", "@chi-phi-doanh-thu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun,'COMPLETED'); const detail=await getOrder(testRun,o.id);
    await withOps(browser,roles,'cc',async page=>{await page.goto('/cost-revenue'); await clearFilters(page); const d=await openFilter(page,'Bộ lọc');
    await labelsVisible(d,['Khách hàng','Trạng thái','Doanh thu (VND)','Chi phí (VND)','Lợi nhuận (%)','Ngày kết thúc thực hiện','Ngày hoàn thành','Người tạo']);
    await expect(action(d,'Đặt lại')).toBeVisible(); await expect(action(d,'Áp dụng')).toBeVisible();
    await pickOption(page,select(d,'Khách hàng'),detail.customerName); await rangeInputs(d,'Doanh thu (VND)','15000000','16000000'); await rangeInputs(d,'Lợi nhuận (%)','10','15');
    const pending=uiApi(page,'GET',/\/api\/cost-revenue\/orders$/); await action(d,'Áp dụng').click(); expectStatusIn(await pending,'200');
    await expect(d).toBeHidden(); await expect(page.getByText(detail.customerName,{exact:true}).first()).toBeVisible();
    const rows=page.locator('main tbody tr'); await expect(dataRow(page,o.code)).toBeVisible();
    for(const row of await rows.all()){const texts=await row.locator('td').allInnerTexts(); const all=texts.join(' '); expect(all).toContain(detail.customerName); const heads=await page.locator('main thead th').allInnerTexts(); const rev=numberFromUi(texts[heads.findIndex(h=>/Doanh thu/i.test(h))]); const margin=numberFromUi(texts[heads.findIndex(h=>/Lợi nhuận/i.test(h))]); expect(rev).toBeGreaterThanOrEqual(15_000_000);expect(rev).toBeLessThanOrEqual(16_000_000);expect(margin).toBeGreaterThanOrEqual(10);expect(margin).toBeLessThanOrEqual(15);}
    });
  });

  test("UI-PNL-005 Sắp xếp cột số liệu", { tag: ["@ui", "@chi-phi-doanh-thu", "@p3"] }, async ({ browser, roles, http, testRun, tok }) => {
    test.setTimeout(360_000); for(const shift of [250_000,350_000,450_000])await editedP0(testRun,'COMPLETED',shift);
    await withOps(browser,roles,'cc',async page=>{await page.goto('/cost-revenue');await clearFilters(page);await expect(page.locator('main tbody tr').nth(2)).toBeVisible();
    for(const label of ['Doanh thu (VND)','Chi phí (VND)','Lợi nhuận','Kết thúc thực hiện','Ngày hoàn thành']){
     const header=page.getByRole('columnheader',{name:new RegExp(esc(label),'i')}).first(); const heads=await page.locator('main thead th').allInnerTexts();const index=heads.findIndex(h=>h.includes(label));expect(index).toBeGreaterThanOrEqual(0);
     for(const direction of ['asc','desc']){const pending=uiApi(page,'GET',/\/api\/cost-revenue\/orders$/);await header.click();expectStatusIn(await pending,'200');const texts=await page.locator(`main tbody tr td:nth-child(${index+1})`).allInnerTexts();
     const values=texts.map(t=>{if(/^\s*[—–-]?\s*$/.test(t))return null;if(/thực hiện|hoàn thành/i.test(label)){const m=t.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);expect(m,'Ngày hiển thị hợp lệ').not.toBeNull();return new Date(Number(m![3]),Number(m![2])-1,Number(m![1]),Number(m![4]??0),Number(m![5]??0)).getTime();}return numberFromUi(t);});
     const present=values.filter((v):v is number=>v!==null);expect(values).toEqual([...present.sort((a,b)=>direction==='asc'?a-b:b-a),...values.filter(v=>v===null)]);
     }
    }
    });
  });

  test("UI-PNL-006 Tab Chi phí - Doanh thu của phiếu", { tag: ["@ui", "@chi-phi-doanh-thu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'cc',async page=>{await openPnl(page,o.code,o.id);await action(page,'Mở tất cả').click();
    for(const label of ['Làm mới','Xuất dữ liệu','Mở tất cả','Thu gọn'])await expect(action(page,label)).toBeVisible();
    expect(numberFromUi(await amountCard(page,'Tổng doanh thu quy đổi'))).toBe(15_900_000);expect(numberFromUi(await amountCard(page,'Tổng chi phí quy đổi'))).toBe(14_000_000);expect(await amountCard(page,'Tổng lợi nhuận gộp')).toContain('+1.900.000');
    await labelsVisible(page,['Tỷ giá quy đổi','Nguồn tỷ giá','USD → VND','CNY → VND','Người cập nhật','Thời điểm cập nhật cuối','Xác nhận doanh thu','Trạng thái','Người xác nhận','Thời gian xác nhận']);await expect(action(page,'Thay đổi tỷ giá')).toBeVisible();
    await headersVisible(page,['Chặng / Dịch vụ / Đầu mục giá','Nhà thầu thực hiện','Doanh thu','Chi phí gốc','Chi phí quy đổi (VND)','Lợi nhuận (VND)','Ghi chú']);
    await expect(page.getByText(/25[.]000/).first()).toBeVisible();
    });
  });

  test("UI-PNL-007 Ghi chú lỗ ở dòng dịch vụ", { tag: ["@ui", "@chi-phi-doanh-thu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);await setOrderFx(testRun,o.id,40_000);const k=(await pnl(testRun,o.id)).kpi;expect(Number(k.profit)).toBeLessThan(0);
    await withOps(browser,roles,'cc',async page=>{await openPnl(page,o.code,o.id);await action(page,'Mở tất cả').click();const row=dataRow(page,'Vận tải');await expect(row).toContainText(/Lỗ\s+[\d.]+/);await expectAmounts(row,[5_000_000]);expect(await amountCard(page,'Tổng lợi nhuận gộp')).toMatch(/-\s*4[.]100[.]000/);});
  });

  test("UI-PNL-010 Đổi tỷ giá thủ công tính lại số liệu", { tag: ["@ui", "@chi-phi-doanh-thu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'cc',async page=>{await openPnl(page,o.code,o.id);const d=await fxDialog(page);await input(d,'USD → VND').fill('26000');const pending=uiApi(page,'PUT',/\/pnl\/fx-rate$/);await action(d,'Áp dụng').click();expectStatusIn(await pending,'200/204');await expect(page.getByText('Đã cập nhật tỷ giá và tính lại số liệu quy đổi.',{exact:true})).toBeVisible();
    expect(numberFromUi(await amountCard(page,'Tổng chi phí quy đổi'))).toBe(14_400_000);expect(await amountCard(page,'Tổng lợi nhuận gộp')).toContain('+1.500.000');
    const fx=await must(await http.call('GET /api/service-orders/{id}/pnl/fx-rate',{token:tok('cc'),params:{id:o.id}}),'đọc tỷ giá mới');expect(fx.usdRate).toBe(26_000);expect(fx.updatedBy,'Có người cập nhật tỷ giá').toBeTruthy();await expect(page.getByText(fx.updatedBy,{exact:true}).first()).toBeVisible();
    });
  });

  test("UI-PNL-011 Xác nhận doanh thu khóa vĩnh viễn", { tag: ["@ui", "@chi-phi-doanh-thu", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'cc',async page=>{await openPnl(page,o.code,o.id);await action(page,'Xác nhận doanh thu').click();const d=page.getByRole('dialog').last();await expect(d).toContainText(/Hoàn thành/);await expect(d).toContainText(/khóa vĩnh viễn/i);const pending=uiApi(page,'POST',/\/revenue-confirmation$/);await action(d,'Xác nhận hoàn thành').click();expectStatusIn(await pending,'200/204');
    await expect(page.getByText('Phiếu dịch vụ đã xác nhận doanh thu. Tỷ giá và số liệu quy đổi đã được chốt.',{exact:true})).toBeVisible();await expect(page.getByText('Đã xác nhận',{exact:true}).first()).toBeVisible();await expect(action(page,'Thay đổi tỷ giá')).toHaveCount(0);await expect(action(page,'Xác nhận doanh thu')).toHaveCount(0);
    const p=await pnl(testRun,o.id);expect(p.fxRate.locked).toBe(true);const order=await getOrder(testRun,o.id);expect(order.status).toBe('COMPLETED');expect(p.revenueConfirmed).toBe(true);expect(p.confirmedBy).toBeTruthy();expect(Number.isFinite(Date.parse(p.confirmedAt))).toBe(true);await expect(page.getByText(p.confirmedBy,{exact:true}).first()).toBeVisible();
    });
  });

  test("UI-PNL-012 Xuất Excel khi chưa chọn phiếu", { tag: ["@ui", "@chi-phi-doanh-thu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    test.setTimeout(360_000);const shift=700_000_000+randInt(1000,9999)*10;const orders: Awaited<ReturnType<typeof editedP0>>[]=[];for(let i=0;i<3;i++)orders.push(await editedP0(testRun,'COMPLETED',shift+i));
    await withOps(browser,roles,'cc',async page=>{await page.goto('/cost-revenue');await clearFilters(page);const d=await openFilter(page,'Bộ lọc');await rangeInputs(d,'Doanh thu (VND)',String(15_650_000+shift),String(15_650_002+shift));const pending=uiApi(page,'GET',/\/api\/cost-revenue\/orders$/);await action(d,'Áp dụng').click();const res=await pending;expectStatusIn(res,'200');const b=await res.json();expect(b.data.meta.pagination.total).toBe(3);
    for(const o of orders)await expect(dataRow(page,o.code)).toBeVisible();for(const checkbox of await page.locator('main tbody').getByRole('checkbox').all())await expect(checkbox).not.toBeChecked();
    await action(page,'Xuất dữ liệu Excel').click();const confirm=page.getByRole('dialog').last();await expect(confirm).toContainText('Bạn chưa chọn phiếu nào. Hệ thống sẽ xuất toàn bộ 3 phiếu theo bộ lọc hiện tại. Tiếp tục?');const download=page.waitForEvent('download');await action(confirm,'Đồng ý').click();const file=await download;expect(file.suggestedFilename()).toMatch(/\.xlsx$/i);const bytes=await downloadBytes(file);expect(isXlsx(bytes)).toBe(true);const {rows}=await readXlsx(bytes);const dataRows=rows.filter(r=>r.some(v=>/^ORD\d/.test(String(v))));expect(dataRows).toHaveLength(3);for(const o of orders)expect(JSON.stringify(dataRows)).toContain(o.code);
    });
  });

  test("UI-PNL-013 Xuất dữ liệu ở tab của phiếu", { tag: ["@ui", "@chi-phi-doanh-thu", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const o=await editedP0(testRun);
    await withOps(browser,roles,'cc',async page=>{await openPnl(page,o.code,o.id);const totals=await Promise.all(['Tổng doanh thu quy đổi','Tổng chi phí quy đổi','Tổng lợi nhuận gộp'].map(async label=>numberFromUi(await amountCard(page,label))));const pending=page.waitForEvent('download');await action(page,'Xuất dữ liệu').click();const file=await pending;expect(file.suggestedFilename()).toMatch(/\.xlsx$/i);const bytes=await downloadBytes(file);expect(isXlsx(bytes)).toBe(true);const parsed=await readXlsx(bytes);expect(parsed.rows.length).toBeGreaterThan(1);const nums=numbersIn(parsed.rows);for(const n of totals)expect(nums,`File khớp tổng UI ${n}`).toContain(n);expect(JSON.stringify(parsed.rows)).toContain(o.code);
    });
  });
});
