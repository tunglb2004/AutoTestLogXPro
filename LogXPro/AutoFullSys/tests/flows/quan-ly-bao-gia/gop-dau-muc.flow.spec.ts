/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import { QuoteScenario } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';
import { P0_ITEMS } from '../../../src/core/data/p0-price-set';
import { lineByName, setQuotationPrices } from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import { revenueOf } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { readXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';

test.describe("Gộp đầu mục trên BGKH và doanh thu phiếu dịch vụ", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-MERGE-001 Gộp KHQ, điều chỉnh dòng gộp rồi đồng ý", { tag: ["@flow", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.pending();
    await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': 1_150_000 });
    const before = await q.cq(x.cq.id);
    const refs = await testRun.p0Refs();
    const version = (await q.versions(x.cq.id)).map(v => v.version);
    expectStatusIn(await q.call('POST /api/customer-quotations/{id}/merges', 'k1', { params: { id: x.cq.id }, json: { displayName: 'Trọn gói KHQ', unitCode: refs.units.supervision, lineIds: [lineByName(before, 'Phí khai báo').id, lineByName(before, 'Phí ngoài giờ').id] } }), '200/201/204');
    const merged = await q.cq(x.cq.id);
    const group = merged.mergedGroups.find((g: any) => g.displayName === 'Trọn gói KHQ');
    expect(group).toBeTruthy(); expect(group.priceTypeName).toMatch(/Cố định/i);
    expectMoney(group.baseUnitPrice, 1_600_000); expectMoney(group.sellPrice, 1_550_000);
    expectMoney(merged.subtotal, before.subtotal);
    expectStatusIn(await q.call('PUT /api/customer-quotations/{id}/prices', 'k1', { params: { id: x.cq.id }, json: { lines: [{ lineId: lineByName(merged, 'Phí lưu kho').id, sellPrice: 600_000 }], groups: [{ groupId: group.id, sellPrice: 1_500_000 }] } }), '200/201/204');
    const changed = await q.cq(x.cq.id);
    const g = changed.mergedGroups.find((g: any) => g.id === group.id);
    expectMoney(g.baseUnitPrice, 1_600_000); expectMoney(g.sellPrice, 1_500_000); expectPercent(g.adjustmentPercent, -6.25, 2);
    expectStatusIn(await q.call('POST /api/customer-quotations/{id}/confirm', 'k1', { params: { id: x.cq.id } }), '200/201/204');
    expect((await q.cq(x.cq.id)).status).toBe('ACTIVE');
    expect((await q.versions(x.cq.id)).map(v => v.version)).toEqual(version);

  });

  test("FLOW-MERGE-002 Phiếu tạo sau khi gộp dùng dòng gộp làm doanh thu", { tag: ["@flow", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.pending();
    const refs = await testRun.p0Refs();
    await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': 1_150_000 });
    const initial = await q.cq(x.cq.id);
    await must(await q.call('POST /api/customer-quotations/{id}/merges', 'k1', { params: { id: x.cq.id }, json: { displayName: 'Trọn gói KHQ', unitCode: refs.units.supervision, lineIds: [lineByName(initial, 'Phí khai báo').id, lineByName(initial, 'Phí ngoài giờ').id] } }), 'gộp KHQ');
    const group = (await q.cq(x.cq.id)).mergedGroups[0];
    await must(await q.call('PUT /api/customer-quotations/{id}/prices', 'k1', { params: { id: x.cq.id }, json: { lines: [{ lineId: lineByName(initial, 'Phí lưu kho').id, sellPrice: 600_000 }], groups: [{ groupId: group.id, sellPrice: 1_500_000 }] } }), 'giá nhóm 1.500.000');
    await must(await q.call('POST /api/customer-quotations/{id}/confirm', 'k1', { params: { id: x.cq.id } }), 'đồng ý RC');
    const o = await q.khqOrder(x.base, x.cq.id);
    const rows = o.revenue.find((t: any) => t.serviceTypeCode === o.serviceCode)?.lines;
    expect(rows, 'Đã phát sinh doanh thu khi có chi phí của hai dòng con').toHaveLength(1);
    expect(rows[0].itemName).toBe('Trọn gói KHQ'); expect(rows[0].unitCode).toBe(refs.units.supervision);
    expectMoney(rows[0].unitPrice, 1_500_000); expectMoney(rows[0].amount, 1_500_000);
    expect(rows[0].mergedItemNames).toEqual(expect.arrayContaining([lineByName(initial, 'Phí khai báo').revenueItemName, lineByName(initial, 'Phí ngoài giờ').revenueItemName]));
    expect(rows[0].mergedItemNames).toHaveLength(2);

  });

  test("FLOW-MERGE-003 Phiếu tạo trước khi đổi gộp giữ cấu trúc cũ", { tag: ["@flow", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.active();
    const o = await q.khqOrder(x.base, x.cq.id);
    const before = o.revenue.find((t: any) => t.serviceTypeCode === o.serviceCode)?.lines;
    expect(before, 'Tiền điều kiện: hai dòng doanh thu đã ghi nhận trước gộp').toHaveLength(2);
    expect(before.map((l: any) => l.itemName)).toEqual(expect.arrayContaining([lineByName(x.cq, 'Phí khai báo').revenueItemName, lineByName(x.cq, 'Phí ngoài giờ').revenueItemName]));
    const refs = await testRun.p0Refs();
    expectStatusIn(await q.call('POST /api/customer-quotations/{id}/merges', 'k1', { params: { id: x.cq.id }, json: { displayName: 'Trọn gói sau khi lập phiếu', unitCode: refs.units.supervision, lineIds: [lineByName(x.cq, 'Phí khai báo').id, lineByName(x.cq, 'Phí ngoài giờ').id] } }), '200/201/204');
    const after = (await revenueOf(testRun, o.order.id)).find((t: any) => t.serviceTypeCode === o.serviceCode)?.lines;
    expect(stable(after), 'Phiếu cũ giữ hai dòng và toàn bộ đơn giá trước gộp').toEqual(stable(before));
    expect(after).toHaveLength(2);
    expect((await q.cq(x.cq.id)).mergedGroups.some((g: any) => g.displayName === 'Trọn gói sau khi lập phiếu')).toBe(true);

  });

  test("FLOW-MERGE-004 Hủy gộp và reset", { tag: ["@flow", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.pending({ includeSeal: true });
    const refs = await testRun.p0Refs();
    await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': 1_150_000 });
    const c = await q.cq(x.cq.id);
    for (const [name, names] of [['Trọn gói KHQ', ['Phí khai báo', 'Phí ngoài giờ']], ['Trọn gói HQGS', ['Phí giám sát', 'Phí kẹp chì']]] as [string, string[]][]) {
      await must(await q.call('POST /api/customer-quotations/{id}/merges', 'k1', { params: { id: c.id }, json: { displayName: name, unitCode: refs.units.supervision, lineIds: names.map(n => lineByName(c, n).id) } }), `gộp ${name}`);
    }
    const grouped = await q.cq(c.id);
    expect(grouped.mergedGroups).toHaveLength(2);
    const removed = grouped.mergedGroups.find((g: any) => g.displayName === 'Trọn gói KHQ');
    const retained = grouped.mergedGroups.find((g: any) => g.displayName === 'Trọn gói HQGS');
    expectStatusIn(await q.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', 'k1', { params: { id: c.id, groupId: removed.id } }), '200/201/204');
    const ungrouped = await q.cq(c.id);
    expect(ungrouped.mergedGroups).toHaveLength(1); expect(stable(ungrouped.mergedGroups[0])).toEqual(stable(retained));
    expectStatusIn(await q.call('POST /api/customer-quotations/{id}/reset', 'k1', { params: { id: c.id } }), '200/201/204');
    const reset = await q.cq(c.id);
    expect(reset.mergedGroups).toHaveLength(0);
    for (const p of P0_ITEMS.filter(p => p.inQuote || p.key === 'seal')) expectMoney(lineByName(reset, p.name).sellPrice, p.ssp!);
    expect([reset.currency, reset.fxRate, reset.vatBand]).toEqual([grouped.currency, grouped.fxRate, grouped.vatBand]);
    const pdf = await q.call('GET /api/customer-quotations/{id}/export', 'k1', { params: { id: c.id }, query: { format: 'PDF' } });
    expectStatusIn(pdf, '200/201/204'); const bytes = await pdf.body();
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-'); expect(bytes.length).toBeGreaterThan(100);
    const excel = await q.call('GET /api/customer-quotations/{id}/export', 'k1', { params: { id: c.id }, query: { format: 'EXCEL' } });
    expectStatusIn(excel, '200/201/204');
    const text = JSON.stringify((await readXlsx(await excel.body())).rows);
    expect(text).not.toMatch(/Trọn gói KHQ|Trọn gói HQGS/);
    for (const p of P0_ITEMS.filter(p => p.inQuote || p.key === 'seal')) expect(text).toContain(lineByName(reset, p.name).revenueItemName);

  });
});
