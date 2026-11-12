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
  test("RC-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["POST /api/quotation-requests/{id}/customer-quotation", "GET /api/customer-quotations", "GET /api/customer-quotations/statuses", "GET /api/customer-quotations/{id}", "PUT /api/customer-quotations/{id}/settings", "PUT /api/customer-quotations/{id}/prices", "POST /api/customer-quotations/{id}/merges", "DELETE /api/customer-quotations/{id}/merges/{groupId}", "POST /api/customer-quotations/{id}/reset", "POST /api/customer-quotations/{id}/confirm", "POST /api/customer-quotations/{id}/reject", "POST /api/customer-quotations/{id}/deactivate", "POST /api/customer-quotations/{id}/default", "GET /api/customer-quotations/{id}/export", "GET /api/customer-quotations/{id}/history", "GET /api/customer-quotations/{id}/versions", "GET /api/customer-quotations/{id}/versions/{version}"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "k1");
      const before = await testRun.snapshot(api, p.params ?? {}, "k1");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.k1)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "k1"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("RC-006 K1B tạo BGKH cho YCBG KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await pricedRfq();
    const res = await http.call('POST /api/quotation-requests/{id}/customer-quotation', { token: tok('k1b'), params: { id: x.rfq.id } });
    expectStatusIn(res, '403/404');
    expect((await data(await http.call('GET /api/quotation-requests/{id}', { token: tok('k1'), params: { id: x.rfq.id } }))).customerQuotation ?? null, 'Không tạo').toBeNull();

  });

  test("RC-014 K1B không thấy RC của KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await p0Base(testRun);
    const res = await http.call('GET /api/customer-quotations', { token: tok('k1b'), query: { perPage: 100, search: (await CQ(base.rcId)).code } });
    expectStatusIn(res, '200');
    expect(items(await data(res)).some((r: any) => r.customerId === base.customerId), 'Không có RC KH_A').toBe(false);

  });

  test("RC-023 K1B mở RC của KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/customer-quotations/{id}', { token: tok('k1b'), params: { id: x.cq.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("RC-031 K1B thiết lập", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const before = stable(await CQ(x.cq.id));
    const res = await SETTINGS(x.cq.id, { currency: 'VND', vatBand: 'VAT_10' }, 'k1b');
    expectStatusIn(res, '403/404');
    expect(stable(await CQ(x.cq.id)), 'Không đổi').toEqual(before);

  });

  test("RC-042 K1B điều chỉnh", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const before = stable(await CQ(x.cq.id));
    const res = await PRICES(x.cq.id, { lines: [{ lineId: line(x.cq, 'Phí khai báo').id, sellPrice: 1_150_000 }] }, 'k1b');
    expectStatusIn(res, '403/404');
    expect(stable(await CQ(x.cq.id)), 'Không đổi').toEqual(before);

  });

  test("RC-054 K1B gộp", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const before = stable(await CQ(x.cq.id));
    const res = await MERGE(x.cq.id, khqMerge(x.cq), 'k1b');
    expectStatusIn(res, '403/404');
    expect(stable(await CQ(x.cq.id)), 'Không đổi').toEqual(before);

  });

  test("RC-062 `groupId` thuộc RC khác", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const y = await pending();
    await must(await MERGE(y.cq.id, khqMerge(y.cq)), 'gộp ở RC khác');
    const g = (await CQ(y.cq.id)).mergedGroups[0];
    const res = await UNMERGE(x.cq.id, g.id);
    expectStatusIn(res, '403/404');
    expect((await CQ(y.cq.id)).mergedGroups, 'Không đổi').toHaveLength(1);

  });

  test("RC-070 K1B reset", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const res = await RESET(x.cq.id, 'k1b');
    expectStatusIn(res, '403/404');
    expect(stable(await CQ(x.cq.id)), 'Không đổi').toEqual(stable(cur));

  });

  test("RC-081 K1B đồng ý", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await CONFIRM(x.cq.id, 'k1b');
    expectStatusIn(res, '403/404');
    expect((await CQ(x.cq.id)).status, 'Không đổi').toBe('PENDING_CONFIRMATION');

  });

  test("RC-090 K1B từ chối", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await REJECT(x.cq.id, 'Giá cao', 'k1b');
    expectStatusIn(res, '403/404');
    expect((await CQ(x.cq.id)).status, 'Không đổi').toBe('PENDING_CONFIRMATION');

  });

  test("RC-101 K1B ngưng", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await active();
    const res = await DEACT(x.cq.id, 'K1B ngưng', 'k1b');
    expectStatusIn(res, '403/404');
    expect((await CQ(x.cq.id)).status, 'Không đổi').toBe('ACTIVE');

  });

  test("RC-111 K1B đặt mặc định", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    test.setTimeout(900_000);
    const E = env.ref('CUSTOMER_E_ID');
    const made: string[] = [];
    await exclusive('kh-e', async () => {
      try {
        const rc1 = await active({ customerId: E });
        const rc2 = await active({ customerId: E });
        made.push(rc1.cq.id, rc2.cq.id);
        await must(await DEFAULT(rc1.cq.id), 'RC1 mặc định');

        const res = await DEFAULT(rc2.cq.id, 'k1b');
        expectStatusIn(res, '403/404');
        expect((await CQ(rc1.cq.id)).isDefault, 'Không đổi').toBe(true);
      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_E về trạng thái chưa có báo giá mặc định'); }
      }
    });

  });

  test("RC-119 K1B xuất RC KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await active();
    const res = await http.call('GET /api/customer-quotations/{id}/export', { token: tok('k1b'), params: { id: x.cq.id }, query: { format: 'PDF' } });
    expectStatusIn(res, '403/404');
    expect((await res.body()).subarray(0, 4).toString(), 'Không trả file').not.toBe('%PDF');

  });

  test("RC-124 K1B đọc lịch sử RC KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/customer-quotations/{id}/history', { token: tok('k1b'), params: { id: x.cq.id }, query: { page: 1 } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("RC-131 K1B đọc phiên bản RC KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await active();
    const res = await http.call('GET /api/customer-quotations/{id}/versions', { token: tok('k1b'), params: { id: x.cq.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("RC-136 Version là số trong phạm vi từng RC; truy cập RC ngoài phạm vi", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const a = await active();
    const b = await active({ customerId: env.ref('CUSTOMER_B_ID') }).catch(() => undefined);
    const r1 = await http.call('GET /api/customer-quotations/{id}/versions/{version}', { token: tok('k1'), params: { id: a.cq.id, version: 1 } });
    expectStatusIn(r1, '200', 'K1 đọc RC_A version 1');
    const snap = JSON.stringify(await data(r1));
    expect(snap, 'Snapshot của RC_A').toContain(a.cq.code);
    if (b) expect(snap, 'Không lẫn RC_B').not.toContain(b.cq.code);
    const r2 = await http.call('GET /api/customer-quotations/{id}/versions/{version}', { token: tok('k1b'), params: { id: a.cq.id, version: 1 } });
    expectStatusIn(r2, '403/404', 'K1B đọc RC_A version 1');

  });
});
