import { expect } from '@playwright/test';
import { TestRun, TEST_RUN_ID, today } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import { data, items, must } from '../../core/base.client';
import { expectStatusIn, expectApiError, stable } from '../../core/assertions';
import { P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../core/data/p0-price-set';
import { env } from '../../core/env';
import { P0Base, buildP0 } from '../../phieu-dich-vu/data/phieu-dich-vu.factory';
import { tableAttributes } from '../../quan-ly-bao-gia/data/bgnb.factory';
import { rfqInPricing } from '../../quan-ly-bao-gia/data/ycbg.factory';
import { getCustomerQuotation, createCustomerQuotation, confirmQuotation, setQuotationSettings } from '../../quan-ly-bao-gia/data/bgkh.factory';
import { sbpLines, setBenchmark } from '../../gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { sspLines, setSelling } from '../../gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { configOf, setItemStatus } from '../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { sheetItems, sheetLine, changeLinePrice } from './bang-gia-mua.factory';

/** Helpers for the previously pending price flows. Every scenario uses its own AT heads. */
export const quotedKeys = P0_ITEMS.filter(i => i.inQuote).map(i => i.key);
export const priceItem = (key: P0ItemKey) => P0_ITEMS.find(i => i.key === key)!;
export const flowBase = (run: TestRun, id: string, quote = true) => buildP0(run, `${id.replace(/-/g, '')}${TEST_RUN_ID}`, { quote });
export const stateCode = (v: any): string => String(v?.code ?? v?.status?.code ?? v?.status ?? v ?? '');

export async function read(run: TestRun, api: string, params: Record<string, string> = {}, role: RoleKey = 'cc', query: Record<string, unknown> = {}): Promise<any> {
  return must(await run.http.call(api, { token: run.token(role), params, query }), api);
}
export async function rows(run: TestRun, api: string, params: Record<string, string> = {}, role: RoleKey = 'cc', query: Record<string, unknown> = {}): Promise<any[]> {
  return items(await read(run, api, params, role, { perPage: 100, ...query }));
}
export async function ok(run: TestRun, api: string, params: Record<string, string>, json?: Record<string, unknown>, role: RoleKey = 'cc'): Promise<any> {
  const res = await run.http.call(api, { token: run.token(role), params, ...(json === undefined ? {} : { json }) });
  expectStatusIn(res, '200/201/204', api);
  return data(res);
}
export async function rejected(run: TestRun, api: string, params: Record<string, string>, json?: Record<string, unknown>, role: RoleKey = 'cc', statuses = '400/404/409/422'): Promise<any> {
  const res = await run.http.call(api, { token: run.token(role), params, ...(json === undefined ? {} : { json }) });
  expectStatusIn(res, statuses, api);
  return expectApiError(res);
}
export const histories = (run: TestRun, api: string, id: string, role: RoleKey = 'cc') => rows(run, api, { id }, role, { page: 1 });
export const buying = async (run: TestRun, base: P0Base, key: P0ItemKey) => {
  const list = await sbpLines(run, base.items[key].id);
  expect(list, `${key}: exactly one benchmark combination`).toHaveLength(1);
  return list[0];
};
export const selling = async (run: TestRun, base: P0Base, key: P0ItemKey) => {
  const list = await sspLines(run, base.items[key].id);
  expect(list, `${key}: exactly one selling combination`).toHaveLength(1);
  return list[0];
};

export async function setHead(run: TestRun, base: P0Base, key: P0ItemKey, active: boolean) {
  const res = await setItemStatus(run, base.items[key], active ? 'ACTIVE' : 'INACTIVE');
  expectStatusIn(res, '200/204', `${active ? 'enable' : 'disable'} ${key}`);
  const cfg = await configOf(run, priceItem(key).service);
  const head = cfg.items.find((i: any) => i.id === base.items[key].id);
  expect(head, 'Head remains in configuration').toBeTruthy();
  expect(stateCode(head.status)).toBe(active ? 'ACTIVE' : 'INACTIVE');
}
export async function sourceUpdate(run: TestRun, base: P0Base, key: P0ItemKey, amount: number, approve = false) {
  const original = await sheetLine(run, base.sheetA, base.items[key].id);
  await changeLinePrice(run, base.sheetA, base.items[key].id, amount, approve);
  const after = (await sheetItems(run, base.sheetA)).find(l => l.id === original.id);
  expect(after, 'Updated source still exists').toBeTruthy();
  expect(Number(after.unitPrice)).toBe(amount);
  if (!approve) expect(`${stateCode(after.status)} ${after.status?.name ?? ''}`).toMatch(/PENDING|Chờ phê duyệt/i);
  return after;
}
export async function sourceDelete(run: TestRun, base: P0Base, key: P0ItemKey) {
  const line = await sheetLine(run, base.sheetA, base.items[key].id);
  await ok(run, 'DELETE /api/purchase-prices/{id}/items/{itemId}', { id: base.sheetA, itemId: line.id }, undefined, 'k1');
  expect((await sheetItems(run, base.sheetA)).some(l => l.id === line.id)).toBe(false);
}

export type FlowQuote = { rfqId: string; iqId: string; rcId?: string; keys: P0ItemKey[]; payload: Record<string, any> };
export async function quote(run: TestRun, base: P0Base, options: { keys?: P0ItemKey[]; issue?: boolean; customer?: 'pending' | 'active'; sourceQuotationId?: string; currency?: 'VND' | 'USD'; vatBand?: string; fxRate?: number } = {}): Promise<FlowQuote> {
  const keys = options.keys ?? quotedKeys;
  const services = SERVICE_KEYS.filter(s => keys.some(k => priceItem(k).service === s));
  const refs = await run.p0Refs();
  let rfq: any;
  if (options.sourceQuotationId) {
    const { createRfq, rfqBody } = await import('../../quan-ly-bao-gia/data/ycbg.factory');
    rfq = await createRfq(run, { submit: true, body: await rfqBody(run, { sourceQuotationId: options.sourceQuotationId, currency: options.currency ?? 'VND' }, services), services });
    await ok(run, 'POST /api/quotation-requests/{id}/accept', { id: rfq.id });
  } else rfq = await rfqInPricing(run, 'cc', services);
  const tables = await Promise.all(services.map(async s => ({
    serviceTypeCode: refs.services[s], name: `AT ${s} ${run.id}`, attributes: tableAttributes(refs, s),
    lines: await Promise.all(keys.filter(k => priceItem(k).service === s).map(async k => ({ priceConfigurationItemId: base.items[k].id, standardSellingPriceId: (await selling(run, base, k)).id, unitPrice: Number((await selling(run, base, k)).sellingPrice) }))),
  })));
  const payload = { quotationRequestId: rfq.id, name: `AT flow ${run.id}`, validFrom: today(), validTo: today(60), currency: options.currency ?? 'VND', tables };
  await ok(run, 'POST /api/internal-quotes', {}, payload);
  const iq = await read(run, 'GET /api/quotation-requests/{id}/internal-quote', { id: rfq.id });
  expect(iq.lines, 'Quote fixture contains exactly the requested heads').toHaveLength(keys.length);
  const result: FlowQuote = { rfqId: rfq.id, iqId: iq.id, keys, payload };
  if (options.issue !== false) await ok(run, 'POST /api/internal-quotes/{id}/issue', { id: iq.id });
  if (options.customer) {
    let cq = await createCustomerQuotation(run, rfq.id);
    cq = await setQuotationSettings(run, cq, { currency: options.currency ?? 'VND', vatBand: options.vatBand ?? 'VAT_8', ...(options.fxRate ? { fxRate: options.fxRate } : {}) });
    if (options.customer === 'active') await confirmQuotation(run, cq.id);
    result.rcId = cq.id;
  }
  return result;
}
export const iqView = (run: TestRun, q: FlowQuote) => read(run, 'GET /api/quotation-requests/{id}/internal-quote', { id: q.rfqId });
export const cqView = (run: TestRun, q: FlowQuote) => {
  expect(q.rcId, 'Fixture must have a customer quotation').toBeTruthy();
  return getCustomerQuotation(run, q.rcId!);
};
export function lineFor(q: any, base: P0Base, key: P0ItemKey) {
  expect(Array.isArray(q.lines), 'Quote lines must be present').toBe(true);
  const line = q.lines.find((l: any) => l.priceConfigurationItemId === base.items[key].id || l.revenueItemId === base.items[key].id || String(l.revenueItemName ?? l.priceConfigurationItemName ?? '').includes(base.items[key].name));
  expect(line, `Quote contains ${base.items[key].name}`).toBeTruthy();
  return line;
}
export async function expired(run: TestRun, getQuote: () => Promise<any>, base: P0Base, key: P0ItemKey, value = true) {
  await expect.poll(async () => Boolean(lineFor(await getQuote(), base, key).expired), { timeout: 30_000, message: `${key} expiration propagates` }).toBe(value);
  return getQuote();
}
export async function changeBenchmark(run: TestRun, base: P0Base, key: P0ItemKey, amount: number) {
  return setBenchmark(run, (await buying(run, base, key)).id, amount);
}
export async function changeSelling(run: TestRun, base: P0Base, key: P0ItemKey, amount: number) {
  return setSelling(run, (await selling(run, base, key)).id, amount);
}
export async function costSource(run: TestRun, order: { id: string; svc: any }, key: ServiceKey = 'KHQ') {
  const { costLines } = await import('../../thap-dieu-phoi/data/dich-vu-con.factory');
  const list = await costLines(run, order.svc[key]);
  const line = list.find((l: any) => l.priceConfigurationItemId === order.svc[key].itemId) ?? list.find((l: any) => l.contractorId === env.ref('CONTRACTOR_A_ID'));
  expect(line, 'Coordinated source cost exists').toBeTruthy();
  return line;
}
export async function noQuoteChanges(run: TestRun, q: FlowQuote, before: { iq: any; cq: any }) {
  expect(stable(await iqView(run, q))).toEqual(stable(before.iq));
  expect(stable(await cqView(run, q))).toEqual(stable(before.cq));
}

/** Reuse an actual ALL discriminator returned by the app rather than guessing its undocumented enum. */
export async function allTransportTemplate(run: TestRun): Promise<any> {
  for (let page = 1; page <= 20; page++) {
    const sheets = await rows(run, 'GET /api/purchase-prices', {}, 'k1', { page });
    if (!sheets.length) break;
    for (const sheet of sheets) {
      const lines = await rows(run, 'GET /api/purchase-prices/{id}/items', { id: sheet.id }, 'k1', { serviceTypeCode: (await run.p0Refs()).services.VT });
      const all = lines.find(l => /^Tất cả$/i.test(String(l.originPointName ?? '')) && l.allAttributes?.length);
      if (all) return all;
    }
  }
  throw new Error('Fixture missing: an existing transport source with Origin = Tất cả and server-returned allAttributes is required; the API does not document the discriminator values.');
}
