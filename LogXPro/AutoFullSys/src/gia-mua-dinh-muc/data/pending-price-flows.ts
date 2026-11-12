import { expect } from '@playwright/test';
import { TestRun } from '../../core/fixtures/test-run.fixture';
import { data, items } from '../../core/base.client';
import { expectMoney, expectPercent, stable } from '../../core/assertions';
import { P0ItemKey } from '../../core/data/p0-price-set';
import { env } from '../../core/env';
import { sbpLines } from './gia-mua-dinh-muc.factory';
import { sspLines } from '../../gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { p0Order, revenueOf } from '../../phieu-dich-vu/data/phieu-dich-vu.factory';
import { ensureContractorLines, priceLine, sheetLine } from '../../gia-mua-dau-vao/data/bang-gia-mua.factory';
import { buying, changeBenchmark, changeSelling, cqView, expired, flowBase, histories, iqView, lineFor, ok, quote, read, rejected, selling, setHead } from '../../gia-mua-dau-vao/data/price-flow.fixture';

/** Full assertions for FLOW-CHG-SBP cases which previously only declared test.fixme. */
export async function runPendingBuyingFlow(id: string, run: TestRun): Promise<void> {
  const base = await flowBase(run, id);
  const sbpHistory = 'GET /api/standard-buying-prices/{id}/history';
  const q0 = { rfqId: base.rfqId, iqId: base.internalQuoteId, rcId: base.rcId, keys: [], payload: {} };
  if (id === 'FLOW-CHG-SBP-001') {
    const s = await buying(run, base, 'customsFee');
    const before = await histories(run, sbpHistory, s.id);
    await changeBenchmark(run, base, 'customsFee', 1_050_000);
    const after = await selling(run, base, 'customsFee');
    expectMoney(after.sellingPrice, 1_200_000);
    expectPercent(after.profitPercent, 14.29, 2);
    expect(after.needsAttention).toBe(true);
    const history = await histories(run, sbpHistory, s.id);
    expect(history).toHaveLength(before.length + 1);
    expect(JSON.stringify(history[0])).toMatch(/1000000/);
    expect(JSON.stringify(history[0])).toMatch(/1050000/);
    return;
  }
  if (id === 'FLOW-CHG-SBP-002') {
    const draft = await quote(run, base, { issue: false });
    const order = await p0Order(run, 'KHQ_COORDINATED', { base });
    const beforeIq = await read(run, 'GET /api/internal-quotes/{id}', { id: draft.iqId });
    const beforeCq = await cqView(run, q0);
    const beforeRevenue = await revenueOf(run, order.id);
    const snap = beforeIq.tables.flatMap((t: any) => t.lines).find((l: any) => l.itemId === base.items.customsFee.id);
    expect(snap, 'Draft contains customs fee purchase snapshot').toBeTruthy();
    expect(snap.benchmarkBuyingPrice).toBe(1_000_000);
    await changeBenchmark(run, base, 'customsFee', 1_050_000);
    expect(stable(await read(run, 'GET /api/internal-quotes/{id}', { id: draft.iqId })), 'Draft quote retains its purchase snapshot').toEqual(stable(beforeIq));
    expect(stable(await cqView(run, q0)), 'Active quote unchanged').toEqual(stable(beforeCq));
    expect(stable(await revenueOf(run, order.id)), 'Revenue already recorded is unchanged').toEqual(stable(beforeRevenue));
    return;
  }
  if (id === 'FLOW-CHG-SBP-003' || id === 'FLOW-CHG-SBP-004') {
    const manual = await quote(run, base);
    await changeBenchmark(run, base, 'customsFee', 1_050_000);
    const s = await selling(run, base, 'customsFee');
    expect(s.needsAttention, 'Precondition: an unresolved benchmark change').toBe(true);
    const iqBefore = await iqView(run, manual);
    const cqBefore = await cqView(run, q0);
    if (id.endsWith('003')) {
      await ok(run, 'POST /api/standard-selling-prices/{id}/acknowledgement', { id: s.id });
      const after = await selling(run, base, 'customsFee');
      expect(after.needsAttention).toBe(false);
      expectMoney(after.sellingPrice, 1_200_000);
      expect(stable(await iqView(run, manual))).toEqual(stable(iqBefore));
      expect(stable(await cqView(run, q0))).toEqual(stable(cqBefore));
    } else {
      await changeSelling(run, base, 'customsFee', 1_260_000);
      const after = await selling(run, base, 'customsFee');
      expectMoney(after.sellingPrice, 1_260_000);
      expectPercent(after.profitPercent, 20, 2);
      expect(after.needsAttention).toBe(false);
      await expired(run, () => iqView(run, manual), base, 'customsFee');
      await expired(run, () => cqView(run, q0), base, 'customsFee');
    }
    return;
  }
  if (id === 'FLOW-CHG-SBP-005') {
    const keys: P0ItemKey[] = ['customsFee', 'overtime', 'supervision'];
    const prices = [1_050_000, 300_000, 800_000];
    const rows = await Promise.all(keys.map(k => buying(run, base, k)));
    for (const key of keys) expect((await selling(run, base, key)).needsAttention, 'No warning before the batch').toBe(false);
    await ok(run, 'PUT /api/standard-buying-prices/benchmarks', {}, { items: rows.map((r, i) => ({ id: r.id, sellingPrice: prices[i] })) });
    expect(await Promise.all(keys.map(async k => (await selling(run, base, k)).needsAttention))).toEqual([true, false, false]);
    expect(await Promise.all(keys.map(async k => Number((await buying(run, base, k)).benchmarkPrice)))).toEqual(prices);
    return;
  }
  if (id === 'FLOW-CHG-SBP-006') {
    const line = await sheetLine(run, base.sheetA, base.items.customsFee.id);
    const sbp = await buying(run, base, 'customsFee');
    const ssp = await selling(run, base, 'customsFee');
    const h0 = await histories(run, sbpHistory, sbp.id);
    await setHead(run, base, 'customsFee', false);
    try {
      await rejected(run, 'PUT /api/purchase-prices/{id}/items/{itemId}', { id: base.sheetA, itemId: line.id }, { unitCode: line.unitCode, unitPrice: 1_100_000 }, 'k1', '400/404/409');
      await rejected(run, 'PUT /api/standard-buying-prices/{id}/benchmark', { id: sbp.id }, { benchmarkPrice: 1_050_000 }, 'cc', '400/404/409');
      await rejected(run, 'PUT /api/standard-selling-prices/{id}/selling-price', { id: ssp.id }, { sellingPrice: 1_300_000 }, 'cc', '400/404/409');
    } finally { await setHead(run, base, 'customsFee', true); }
    expectMoney((await sheetLine(run, base.sheetA, base.items.customsFee.id)).unitPrice, 1_000_000);
    expectMoney((await buying(run, base, 'customsFee')).benchmarkPrice, 1_000_000);
    expectMoney((await selling(run, base, 'customsFee')).sellingPrice, 1_200_000);
    expect(await histories(run, sbpHistory, sbp.id)).toHaveLength(h0.length);
    return;
  }
  if (id === 'FLOW-CHG-SBP-007') {
    const refs = await run.p0Refs();
    await ensureContractorLines(run, env.ref('CONTRACTOR_B_ID'), 'USD', [priceLine(refs, base.items, 'customsFee', 40)], `AT warning source ${run.id}`);
    await changeBenchmark(run, base, 'customsFee', 1_050_000);
    expect((await buying(run, base, 'customsFee')).needsAttention).toBe(true);
    expect((await selling(run, base, 'customsFee')).needsAttention).toBe(true);
    await setHead(run, base, 'customsFee', false);
    expect(await sbpLines(run, base.items.customsFee.id)).toHaveLength(0);
    expect(await sspLines(run, base.items.customsFee.id)).toHaveLength(0);
    await setHead(run, base, 'customsFee', true);
    expect((await buying(run, base, 'customsFee')).needsAttention, 'Source warning survives hiding').toBe(true);
    expect((await selling(run, base, 'customsFee')).needsAttention, 'Benchmark warning survives hiding').toBe(true);
    return;
  }
  throw new Error(`Unsupported buying flow ${id}`);
}
