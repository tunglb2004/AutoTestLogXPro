import { expect } from '@playwright/test';
import { TestRun, TEST_RUN_ID } from '../../core/fixtures/test-run.fixture';
import { P0ItemKey } from '../../core/data/p0-price-set';
import { env } from '../../core/env';
import { expectMoney, stable } from '../../core/assertions';
import { p0Items } from '../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { p0Order } from '../../phieu-dich-vu/data/phieu-dich-vu.factory';
import { coordinate, costLines } from '../../thap-dieu-phoi/data/dich-vu-con.factory';
import { sbpLines } from '../../gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { sspLines } from '../../gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { activateSheet, createSheet, exclusive, priceLine, sheetLine, changeLinePrice } from './bang-gia-mua.factory';
import { buying, cqView, expired, flowBase, iqView, ok, quote, read, rejected, selling, sourceDelete, sourceUpdate, stateCode } from './price-flow.fixture';

export async function runPendingPurchaseFlow(id: string, run: TestRun): Promise<void> {
  const refs = await run.p0Refs();
  const A = env.ref('CONTRACTOR_A_ID');
  if (id === 'FLOW-CHG-BGM-008') {
    const heads = await p0Items(run, `FB8${TEST_RUN_ID}`, 'k1', ['customsFee']);
    const sheet = await createSheet(run, A, 'VND', [priceLine(refs, heads, 'customsFee', 1_000_000)], `AT draft edit ${run.id}`);
    const before = await sheetLine(run, sheet.id, heads.customsFee.id);
    expect(stateCode(before.status)).toBe('APPROVED');
    await changeLinePrice(run, sheet.id, heads.customsFee.id, 1_050_000, false);
    const after = await sheetLine(run, sheet.id, heads.customsFee.id);
    expectMoney(after.unitPrice, 1_050_000);
    expect(stateCode(after.status), 'An unreferenced draft source remains approved').toBe('APPROVED');
    expect(await sbpLines(run, heads.customsFee.id)).toHaveLength(0);
    return;
  }
  const base = await flowBase(run, id, id !== 'FLOW-CHG-BGM-001');
  if (id === 'FLOW-CHG-BGM-001') {
    const manual = await quote(run, base);
    const pending = await quote(run, base, { customer: 'pending' });
    await sourceUpdate(run, base, 'customsFee', 1_100_000);
    expect(await sbpLines(run, base.items.customsFee.id), 'Last eligible source disappears').toHaveLength(0);
    expect(await sspLines(run, base.items.customsFee.id)).toHaveLength(0);
    await expired(run, () => iqView(run, manual), base, 'customsFee');
    await expired(run, () => cqView(run, pending), base, 'customsFee');
    return;
  }
  if (id === 'FLOW-CHG-BGM-002') {
    const q = { rfqId: base.rfqId, iqId: base.internalQuoteId, rcId: base.rcId, keys: [], payload: {} };
    const before = await cqView(run, q);
    const ssp0 = await selling(run, base, 'freight');
    await sourceUpdate(run, base, 'freight', 9_800_000);
    const sbp = await buying(run, base, 'freight');
    expectMoney(sbp.benchmarkPrice, 9_500_000);
    const contractors = (await read(run, 'GET /api/standard-buying-prices/{id}/contractors', { id: sbp.id })).contractors;
    expect(contractors, 'Only the other approved source remains').toHaveLength(1);
    expect(contractors[0].contractorId).toBe(env.ref('CONTRACTOR_B_ID'));
    expectMoney((await selling(run, base, 'freight')).sellingPrice, 11_000_000);
    expect(stable(await selling(run, base, 'freight'))).toEqual(stable(ssp0));
    expect(stable(await cqView(run, q)), 'No quote line expires while another eligible source remains').toEqual(stable(before));
    return;
  }
  if (id === 'FLOW-CHG-BGM-003' || id === 'FLOW-CHG-BGM-005') {
    const order = await p0Order(run, 'IN_PROGRESS', { base });
    const costs0 = await costLines(run, order.svc.KHQ);
    const fee = costs0.find(l => l.priceConfigurationItemId === base.items.customsFee.id || l.unitCode === refs.units.customsFee);
    expect(fee).toBeTruthy();
    expectMoney(fee.unitPrice, 1_000_000);
    if (id.endsWith('003')) await sourceUpdate(run, base, 'customsFee', 1_100_000);
    else await sourceDelete(run, base, 'customsFee');
    const err = await rejected(run, 'GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { id: order.id, type: refs.services.KHQ, costLineId: fee.costLineId }, undefined, 'dp', '400/409/422');
    expect(JSON.stringify(err), 'Invalid source business rule').toMatch(/ERR[-_]K3[-_]BR[-_]05|nguồn.*không.*hợp lệ|không.*phê duyệt/i);
    expect(stable(await costLines(run, order.svc.KHQ)), 'Existing coordinated snapshot is retained').toEqual(stable(costs0));
    return;
  }
  if (id === 'FLOW-CHG-BGM-004') {
    const order = await p0Order(run, 'ACCEPTED', { base });
    const line = await sourceUpdate(run, base, 'customsFee', 1_100_000);
    const options = await read(run, 'GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { id: order.id, type: refs.services.KHQ }, 'dp');
    expect(Array.isArray(options.contractors)).toBe(true);
    expect(options.contractors.some((c: any) => c.costCode === line.code), 'Pending source is not an eligible coordination price').toBe(false);
    const before = await costLines(run, order.svc.KHQ);
    await rejected(run, 'PUT /api/k3/service-orders/{id}/services/{type}/coordination', { id: order.id, type: refs.services.KHQ }, { assignments: [{ priceConfigurationItemId: base.items.customsFee.id, contractorId: A, unitCode: refs.units.customsFee }] }, 'dp', '400/409/422');
    expect(stable(await costLines(run, order.svc.KHQ))).toEqual(stable(before));
    return;
  }
  if (id === 'FLOW-CHG-BGM-006') {
    await exclusive('nt-d', async () => {
      const D = env.ref('CONTRACTOR_D_ID');
      const sheet = await createSheet(run, D, 'VND', [priceLine(refs, base.items, 'customsFee', 1_000_000)], `AT stopped source ${run.id}`);
      await activateSheet(run, sheet.id);
      const source = await sheetLine(run, sheet.id, base.items.customsFee.id);
      const oldOrder = await p0Order(run, 'ACCEPTED', { base });
      await coordinate(run, oldOrder.svc.KHQ, [{ priceConfigurationItemId: base.items.customsFee.id, contractorId: D, unitCode: refs.units.customsFee }]);
      const oldCosts = await costLines(run, oldOrder.svc.KHQ);
      const fee = oldCosts.find(l => l.contractorId === D && l.unitCode === refs.units.customsFee);
      expect(fee).toBeTruthy();
      const newOrder = await p0Order(run, 'ACCEPTED', { base });
      await ok(run, 'POST /api/purchase-prices/{id}/deactivate', { id: sheet.id }, undefined, 'k1');
      const options = await read(run, 'GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { id: newOrder.id, type: refs.services.KHQ }, 'dp');
      expect(Array.isArray(options.contractors)).toBe(true);
      expect(options.contractors.some((c: any) => c.costCode === source.code)).toBe(false);
      await rejected(run, 'GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { id: oldOrder.id, type: refs.services.KHQ, costLineId: fee.costLineId }, undefined, 'dp', '400/409/422');
      expect(stable(await costLines(run, oldOrder.svc.KHQ))).toEqual(stable(oldCosts));
    });
    return;
  }
  throw new Error(`Unsupported purchase flow ${id}`);
}
