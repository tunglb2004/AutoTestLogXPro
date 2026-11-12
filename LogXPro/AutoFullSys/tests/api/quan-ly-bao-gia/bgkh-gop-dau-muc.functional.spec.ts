/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, ServiceKey } from '../../../src/core/data/p0-price-set';
import { internalQuoteBody, SspMap, createInternalQuote, issueInternalQuote } from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
import { createCustomerQuotation, setQuotationSettings, setQuotationPrices, confirmQuotation, getCustomerQuotation, lineByName } from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import { setBenchmark, sbpLines } from '../../../src/gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { setSelling, sspLines } from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { exclusive, ensureContractorLines, priceLine } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { createOrder, revenueOf, p0Base, buildP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { readXlsx, numbersIn } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { env } from '../../../src/core/env';
import { createRfq, rfqBody, serviceEntry, getRfq, rfqInPricing } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import { p0Items } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Báo giá khách hàng (BGKH/RC)", () => {
  test("RC-048 Gộp 2 đầu mục cùng dịch vụ", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
    const cur = await CQ(x.cq.id);
    const v0 = (await VERS(x.cq.id)).length;
    const res = await MERGE(x.cq.id, khqMerge(cur));
    expectStatusIn(res, '200/201');
    const d = await CQ(x.cq.id);
    const g = (d.mergedGroups ?? []).find((m: any) => m.displayName === 'Trọn gói khai báo hải quan');
    expect(g?.priceTypeName, 'Phân loại Cố định').toMatch(/Cố định/i);
    expectMoney(g.sellPrice, 1_550_000, 'Đơn giá = 1.150.000 + 400.000');
    expectMoney(d.subtotal, Number(cur.subtotal), 'Tổng tiền không đổi');
    expect((await VERS(x.cq.id)).length, 'Không tăng version').toBe(v0);

  });

  test("RC-049 Chỉ 1 dòng", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    const res = await MERGE(x.cq.id, { displayName: 'Một dòng', unitCode: refs.units.supervision, lineIds: [line(x.cq, 'Phí khai báo').id] });
    expectStatusIn(res, '400/422');
    expect((await CQ(x.cq.id)).mergedGroups ?? [], 'Không gộp').toHaveLength(0);

  });

  test("RC-050 Khác loại dịch vụ", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    const res = await MERGE(x.cq.id, { displayName: 'Khác dịch vụ', unitCode: refs.units.supervision, lineIds: [line(x.cq, 'Phí khai báo').id, line(x.cq, 'Cước vận tải').id] });
    expectStatusIn(res, '400/422');
    await expectApiError(res);

  });

  test("RC-051 Thiếu ĐVT hoặc tên", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    const ids = [line(x.cq, 'Phí khai báo').id, line(x.cq, 'Phí ngoài giờ').id];
    expectStatusIn(await MERGE(x.cq.id, { displayName: 'Trọn gói', unitCode: '', lineIds: ids }), '400/422', 'thiếu ĐVT');
    expectStatusIn(await MERGE(x.cq.id, { displayName: '', unitCode: refs.units.supervision, lineIds: ids }), '400/422', 'thiếu tên');
    expect((await CQ(x.cq.id)).mergedGroups ?? [], 'Không gộp').toHaveLength(0);

  });

  test("RC-052 Gộp ở RC Thất bại/Hết hiệu lực", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    await must(await REJECT(x.cq.id, 'Giá cao'), 'khách từ chối');
    const res = await MERGE(x.cq.id, khqMerge(x.cq));
    expectStatusIn(res, '400/409/422');

  });

  test("RC-053 Toàn phụ phí → Phụ phí", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const own = await buildP0(testRun, `C53${TEST_RUN_ID}`, { quote: false });
    const extra = await p0Items(testRun, `C53B${TEST_RUN_ID}`, 'k1', ['overtime']);
    await ensureContractorLines(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [priceLine(refs, extra, 'overtime', 300_000)], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
    const s2 = (await sspLines(testRun, extra.overtime.id))[0];
    await setBenchmark(testRun, (await sbpLines(testRun, extra.overtime.id))[0].id, 300_000);
    await setSelling(testRun, s2.id, 450_000);
    const rfq = await createRfq(testRun, { submit: true });
    await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'tiếp nhận');
    const map: any = { ...mapOf(own) };
    const iq0 = await createInternalQuote(testRun, rfq.id, map, 'cc');
    const iqd = await data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: iq0.id } }));
    const tables = (iqd.tables ?? []).map((t: any) => ({ serviceTypeCode: t.serviceTypeCode, name: t.name, attributes: Object.fromEntries(Object.entries(t.attributes ?? {}).filter(([, v]: any) => v?.code).map(([k, v]: any) => [`${k}Code`, v.code])), lines: [...(t.lines ?? []).map((l: any) => ({ priceConfigurationItemId: l.itemId, standardSellingPriceId: l.standardSellingPriceId, unitPrice: l.unitPrice })), ...(t.serviceTypeCode === refs.services.KHQ ? [{ priceConfigurationItemId: extra.overtime.id, standardSellingPriceId: s2.id, unitPrice: 450_000 }] : [])] }));
    await must(await http.call('PUT /api/internal-quotes/{id}', { token: tok('cc'), params: { id: iq0.id }, json: { quotationRequestId: rfq.id, name: iqd.name, validFrom: iqd.validFrom, validTo: iqd.validTo, currency: iqd.currency, terms: iqd.terms ?? '', tables } }), 'thêm dòng Phụ phí thứ 2');
    await issueInternalQuote(testRun, iq0.id, 'cc');
    const cq = await CQ((await createCustomerQuotation(testRun, rfq.id, 'k1')).id);
    const sur = (cq.lines ?? []).filter((l: any) => l.serviceTypeCode === refs.services.KHQ && /Phụ phí/i.test(String(l.priceTypeName)));
    expect(sur.length, 'Tiền điều kiện: 2 dòng Phụ phí cùng dịch vụ').toBeGreaterThanOrEqual(2);
    const res = await MERGE(cq.id, { displayName: 'Phụ phí ngoài giờ gộp', unitCode: refs.units.overtime, lineIds: sur.slice(0, 2).map((l: any) => l.id) });
    expectStatusIn(res, '200/201');
    const g = ((await CQ(cq.id)).mergedGroups ?? []).find((m: any) => m.displayName === 'Phụ phí ngoài giờ gộp');
    expect(g?.priceTypeName, 'Dòng gộp Phân loại Phụ phí').toMatch(/Phụ phí/i);

  });

  test("RC-063 Bỏ gộp ở RC Hết hiệu lực", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    await must(await MERGE(x.cq.id, khqMerge(x.cq)), 'gộp');
    await confirmQuotation(testRun, x.cq.id);
    await must(await DEACT(x.cq.id, 'Khách ngừng hợp tác tuyến'), 'ngưng RC');
    const g = (await CQ(x.cq.id)).mergedGroups[0];
    const res = await UNMERGE(x.cq.id, g.id);
    expectStatusIn(res, '400/409/422');
    expect((await CQ(x.cq.id)).mergedGroups, 'Chỉ xem').toHaveLength(1);

  });

  test("RC-064 Không tăng version", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    await must(await MERGE(x.cq.id, khqMerge(x.cq)), 'gộp');
    const v0 = (await VERS(x.cq.id)).length;
    const g = (await CQ(x.cq.id)).mergedGroups[0];
    const res = await UNMERGE(x.cq.id, g.id);
    expectStatusIn(res, '200/204');
    expect((await VERS(x.cq.id)).length, 'Vẫn 1 phiên bản').toBe(v0);

  });

  test("RC-068 Reset về giá Định giá phát hành", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const base = await buildP0(testRun, `RC068-${TEST_RUN_ID}`, { quote: false });
    const x = await pending({ base });
    await setQuotationSettings(testRun, x.cq, { currency: 'USD', fxRate: 25_000, vatBand: P0.vatBand });
    const issued = await getCustomerQuotation(testRun, x.cq.id);
    const fee = line(issued, base.items.customsFee.name);
    expect(Number(fee.sellPrice)).toBeGreaterThan(1);
    await setQuotationPrices(testRun, issued, { [base.items.customsFee.name]: Number(fee.sellPrice) - 1 });
    const c0 = await getCustomerQuotation(testRun, x.cq.id);
    await must(await MERGE(x.cq.id, { ...khqMerge(c0), lineIds: [line(c0, base.items.customsFee.name).id, line(c0, base.items.overtime.name).id] }), 'gộp nhóm KHQ');
    await must(await MERGE(x.cq.id, { displayName: 'Trọn gói Hải quan giám sát', unitCode: refs.units.supervision, lineIds: [line(c0, base.items.supervision.name).id, line(c0, base.items.seal.name).id] }), 'gộp nhóm HQGS');

    const storage = line(issued, base.items.storage.name);
    const originalSsp = P0_ITEMS.find((item) => item.key === 'storage')!.ssp!;
    await setSelling(testRun, base.ssp.storage!, originalSsp + 1);
    const sheetOf = (cq: any) => cq.sourceSheets.find((sheet: any) => sheet.id === storage.sourceTableId);
    await expect.poll(async () => sheetOf(await getCustomerQuotation(testRun, x.cq.id))?.disabled).toBe(true);
    const cur = await getCustomerQuotation(testRun, x.cq.id);
    expect(cur.mergedGroups).toHaveLength(2);
    expectMoney(cur.fxRate, 25_000, 'Tỷ giá trước khi đặt lại');
    const disabledLines = (cq: any) => cq.lines.filter((l: any) => l.sourceTableId === storage.sourceTableId);

    const res = await RESET(x.cq.id);
    expectStatusIn(res, '200/204');
    const d = await getCustomerQuotation(testRun, x.cq.id);
    expect(d.mergedGroups, 'Hủy mọi nhóm gộp').toHaveLength(0);
    for (const row of issued.lines.filter((l: any) => l.sourceTableId !== storage.sourceTableId)) {
      const restored = d.lines.find((l: any) => l.revenueItemId === row.revenueItemId && l.sourceTableId === row.sourceTableId);
      expect(restored, `Khôi phục dòng ${row.revenueItemName}`).toBeTruthy();
      expectMoney(restored.sellPrice, Number(row.sellPrice), `${row.revenueItemName} về giá phát hành`);
    }
    expect([d.currency, d.fxRate, d.vatBand], 'Giữ nguyên tiền tệ, tỷ giá và VAT').toEqual([cur.currency, cur.fxRate, cur.vatBand]);
    expect(stable(sheetOf(d))).toEqual(stable(sheetOf(cur)));
    expect(stable(disabledLines(d))).toEqual(stable(disabledLines(cur)));

  });

  test("RC-069 Reset không đổi VAT", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
    const c0 = await CQ(x.cq.id);
    await must(await MERGE(x.cq.id, khqMerge(c0)), 'gộp nhóm KHQ');
    await must(await MERGE(x.cq.id, { displayName: 'Trọn gói Hải quan giám sát', unitCode: refs.units.supervision, lineIds: [line(c0, x.base.items.supervision.name).id, line(c0, x.base.items.seal.name).id] }), 'gộp nhóm HQGS');
    const cur = await CQ(x.cq.id);
    expect(cur.mergedGroups).toHaveLength(2);
    const gKhq = cur.mergedGroups.find((g: any) => g.displayName === 'Trọn gói khai báo hải quan');

    const res = await RESET(x.cq.id);
    expectStatusIn(res, '200/204');
    expect((await CQ(x.cq.id)).vatBand, 'Giữ VAT_8').toBe('VAT_8');

  });

  test("RC-055 Lưu mapping dòng con", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    const res = await MERGE(x.cq.id, khqMerge(x.cq));
    expectStatusIn(res, '200/201');
    const d = await CQ(x.cq.id);
    const g = (d.mergedGroups ?? [])[0];
    expect(g.displayName).toBe('Trọn gói khai báo hải quan');
    expect(g.unitCode).toBe(refs.units.supervision);
    const kids = (d.lines ?? []).filter((l: any) => l.groupId === g.id);
    expect(kids, 'Danh sách dòng con').toHaveLength(2);
    for (const k of kids) for (const f of ['revenueItemId', 'priceTypeName', 'unitCode', 'baseUnitPrice']) expect(k, `Dòng con có ${f}`).toHaveProperty(f);

  });

  test("RC-061 Bỏ gộp một nhóm", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
    const c0 = await CQ(x.cq.id);
    await must(await MERGE(x.cq.id, khqMerge(c0)), 'gộp nhóm KHQ');
    await must(await MERGE(x.cq.id, { displayName: 'Trọn gói Hải quan giám sát và Kho bãi', unitCode: refs.units.supervision, lineIds: [line(c0, 'Phí giám sát').id, line(c0, 'Phí lưu kho').id] }), 'gộp nhóm thứ 2');
    const cur = await CQ(x.cq.id);
    const gKhq = cur.mergedGroups.find((g: any) => g.displayName === 'Trọn gói khai báo hải quan');

    const other = cur.mergedGroups.find((g: any) => g.id !== gKhq.id);
    const res = await UNMERGE(x.cq.id, gKhq.id);
    expectStatusIn(res, '200/204');
    const d = await CQ(x.cq.id);
    expectMoney(line(d, 'Phí khai báo').sellPrice, P0.customsFeeAgreed, 'Dòng con trở lại giá trước khi gộp');
    expectMoney(line(d, 'Phí ngoài giờ').sellPrice, 400_000, 'Dòng con trở lại giá trước khi gộp');
    expect(stable(d.mergedGroups.find((g: any) => g.id === other.id)), 'Nhóm còn lại không đổi').toEqual(stable(other));
    expectMoney(d.subtotal, Number(cur.subtotal), 'Footer tính lại (tổng giữ nguyên)');

  });

  test("RC-071 Tổng về 15.700.000 trước VAT", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await pending();
    await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
    const res = await RESET(x.cq.id);
    expectStatusIn(res, '200/204');
    expectMoney((await CQ(x.cq.id)).subtotal, P0.internalQuoteTotal, 'subtotal = 15.700.000');

  });
});
