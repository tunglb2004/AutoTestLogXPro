import { TestRun, tagged } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import { P0, P0_ITEMS, ServiceKey } from '../../core/data/p0-price-set';
import { CallOptions, data, items, must } from '../../core/base.client';
import { P0Base, p0Base, createOrder, revenueOf } from '../../phieu-dich-vu/data/phieu-dich-vu.factory';
import { rfqBody, createRfq } from './ycbg.factory';
import { SspMap, internalQuoteBody, createInternalQuote, issueInternalQuote } from './bgnb.factory';
import { createCustomerQuotation, getCustomerQuotation, setQuotationSettings, setQuotationPrices, confirmQuotation } from './bgkh.factory';
import { acceptOrder, confirmLegs } from '../../thap-dieu-phoi/data/phieu-cc.factory';
import { coordinate, startService, costItem, addCost } from '../../thap-dieu-phoi/data/dich-vu-con.factory';
import { env } from '../../core/env';

/** Fixtures only for newly implemented quote cases; each scenario owns a fresh RFQ/IPS/RC. */
export class QuoteScenario {
  constructor(readonly run: TestRun) {}
  call(api: string, role: RoleKey = 'k1', options: CallOptions = {}) {
    return this.run.http.call(api, { ...options, token: this.run.token(role) });
  }
  async read(api: string, id: string, role: RoleKey = 'k1') {
    return must(await this.call(api, role, { params: { id } }), api);
  }
  rfq(id: string, role: RoleKey = 'k1') { return this.read('GET /api/quotation-requests/{id}', id, role); }
  iq(id: string) { return this.read('GET /api/internal-quotes/{id}', id, 'cc'); }
  cq(id: string) { return getCustomerQuotation(this.run, id); }
  async history(id: string, entity: 'quotation-requests' | 'internal-quotes' | 'customer-quotations' = 'quotation-requests', role: RoleKey = 'k1') {
    return items(await must(await this.call(`GET /api/${entity}/{id}/history`, role, { params: { id }, query: { page: 1, perPage: 100 } }), 'đọc lịch sử'));
  }
  async notifications(id: string, role: RoleKey = 'cc') {
    return items(await must(await this.call('GET /api/notifications', role, { query: { limit: 100 } }), 'đọc thông báo')).filter((n: any) => n.subjectId === id);
  }
  async newRfq(submit = false, extra: Record<string, unknown> = {}, services?: ServiceKey[]) {
    const r = await createRfq(this.run, { submit, body: await rfqBody(this.run, extra, services) });
    this.run.track(`quote RFQ ${r.id}`, async () => {
      const d = await this.rfq(r.id);
      if (d.status === 'DRAFT') return this.call('DELETE /api/quotation-requests/{id}', 'k1', { params: { id: r.id } });
      if (['AWAITING_PRICING', 'PRICING_IN_PROGRESS', 'PRICING_DECLINED'].includes(d.status)) return this.call('POST /api/quotation-requests/{id}/cancel', 'k1', { params: { id: r.id }, json: { reason: 'Dọn YCBG của flow báo giá' } });
    });
    return r;
  }
  async pricing(extra: Record<string, unknown> = {}) {
    const r = await this.newRfq(true, extra);
    await must(await this.call('POST /api/quotation-requests/{id}/accept', 'cc', { params: { id: r.id } }), 'tiếp nhận RFQ mới');
    return this.rfq(r.id);
  }
  map(base: P0Base): SspMap {
    return Object.fromEntries(P0_ITEMS.filter(i => i.inQuote).map(i => [i.key, { itemId: base.items[i.key].id, sspId: base.ssp[i.key]!, price: i.ssp! }]));
  }
  async draft(options: { base?: P0Base; customerId?: string; includeSeal?: boolean } = {}) {
    const base = options.base ?? await p0Base(this.run);
    const rfq = await this.pricing(options.customerId ? { customerId: options.customerId } : {});
    const payload: any = await internalQuoteBody(this.run, rfq.id, this.map(base), { name: tagged('AT BGNB flow') });
    if (options.includeSeal) {
      const refs = await this.run.p0Refs();
      // Phí kẹp chì có giá bán định mức nên BGNB đã tự thêm dòng (đơn giá 0); case cần dòng này có giá 200.000.
      const lines = payload.tables.find((t: any) => t.serviceTypeCode === refs.services.HQGS).lines;
      const seal = lines.find((l: any) => l.priceConfigurationItemId === base.items.seal.id);
      if (seal) Object.assign(seal, { standardSellingPriceId: base.ssp.seal!, unitPrice: 200_000 });
      else lines.push({ priceConfigurationItemId: base.items.seal.id, standardSellingPriceId: base.ssp.seal!, unitPrice: 200_000 });
    }
    const iq = await createInternalQuote(this.run, rfq.id, this.map(base), 'cc', payload);
    return { base, rfq, iq: await this.iq(iq.id), payload };
  }
  async issued(options: { base?: P0Base; customerId?: string; includeSeal?: boolean } = {}) {
    const x = await this.draft(options);
    await issueInternalQuote(this.run, x.iq.id);
    return { ...x, iq: await this.iq(x.iq.id) };
  }
  async pending(options: { base?: P0Base; customerId?: string; includeSeal?: boolean } = {}) {
    const x = await this.issued(options);
    const cq = await createCustomerQuotation(this.run, x.rfq.id);
    await setQuotationSettings(this.run, cq, { vatBand: P0.vatBand });
    return { ...x, cq: await this.cq(cq.id) };
  }
  async active(options: { base?: P0Base; customerId?: string; includeSeal?: boolean } = {}) {
    const x = await this.pending(options);
    await setQuotationPrices(this.run, x.cq, { [x.base.items.customsFee.name]: P0.customsFeeAgreed });
    await confirmQuotation(this.run, x.cq.id);
    return { ...x, cq: await this.cq(x.cq.id) };
  }
  async versions(id: string) { return items(await this.read('GET /api/customer-quotations/{id}/versions', id)); }
  async khqOrder(base: P0Base, rcId: string) {
    const refs = await this.run.p0Refs();
    const o = await createOrder(this.run, { rcId, customerId: base.customerId }, { submit: true, services: ['KHQ'] });
    await acceptOrder(this.run, o.id);
    await confirmLegs(this.run, o.id);
    const s = { id: o.id, type: refs.services.KHQ };
    const contractorId = env.ref('CONTRACTOR_A_ID');
    await coordinate(this.run, s, [{ priceConfigurationItemId: base.items.customsFee.id, contractorId, unitCode: refs.units.customsFee }]);
    await startService(this.run, s);
    const ot = await costItem(this.run, s, contractorId, base.items.overtime.id);
    await addCost(this.run, s, { contractorId, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, priceConfigurationItemId: base.items.overtime.id, unitCode: refs.units.overtime, quantity: 1, amount: 300_000, currency: 'VND' });
    return { order: o, revenue: await revenueOf(this.run, o.id), serviceCode: refs.services.KHQ };
  }
}

export const auditText = (h: any) => `${h.action ?? ''} ${h.event ?? ''} ${h.eventLabel ?? ''} ${h.summary ?? ''}`;
