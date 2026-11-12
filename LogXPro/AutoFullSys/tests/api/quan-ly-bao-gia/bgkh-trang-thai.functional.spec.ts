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
  test("RC-076 Khách hàng đồng ý báo giá", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const C = env.ref('CUSTOMER_C_ID');
    const made: string[] = [];
    await exclusive('kh-c', async () => {
      try {
        const x = await pending({ customerId: C });
        made.push(x.cq.id);
        const res = await CONFIRM(x.cq.id);
        expectStatusIn(res, '200/204');
        const d = await CQ(x.cq.id);
        expect(d.status).toBe('ACTIVE');
        expect(d.canBeEdited, 'Khóa giá').toBe(false);
        expect(d.isDefault, 'RC đầu tiên Đang hiệu lực của khách → mặc định').toBe(true);
        expect(String((await iqOf(x.rfq.id)).result ?? ''), 'BGNB Kết quả Thành công').toMatch(/WON|SUCCESS|Thành công/i);
      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_C về trạng thái chưa có báo giá hiệu lực'); }
      }
    });

  });

  test("RC-077 Toàn bộ biểu giá Disable", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const own = await buildP0(testRun, `C77${TEST_RUN_ID}`, { quote: false });

    const x = await pending({ base: own });
    for (const it of P0_ITEMS.filter((i) => i.inQuote)) await setSelling(testRun, own.ssp[it.key]!, it.ssp! + 100_000);
    expect(((await CQ(x.cq.id)).sourceSheets ?? []).every((s: any) => s.disabled), 'Tiền điều kiện: mọi biểu giá Disable').toBe(true);
    const res = await CONFIRM(x.cq.id);
    expectStatusIn(res, '400/409/422');
    expect((await CQ(x.cq.id)).status).toBe('PENDING_CONFIRMATION');

  });

  test("RC-078 Đồng ý bản bổ sung tự gộp vào RC gốc", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    /** Bản bổ sung -vN Chờ xác nhận của RC gốc `rc` (YCBG bổ sung → BGNB → BGKH), từ bộ giá `b`. */
    const supplement = async (rc: any, b?: any) => pending({ customerId: rc.customerId, sourceQuotationId: rc.id, base: b });

        const root = await active({ customerId: E });
        made.push(root.cq.id);
        await must(await DEFAULT(root.cq.id), 'RC gốc mặc định');
        const s = await supplement(root.cq);
        const res = await CONFIRM(s.cq.id);
        expectStatusIn(res, '200/204');
        const r = await CQ(root.cq.id);
        expect(r.status, 'RC gốc giữ ACTIVE').toBe('ACTIVE');
        expect(r.isDefault, 'Giữ mặc định').toBe(true);
        expect(String(r.version), 'version 2.0').toMatch(/^2(\.0)?$/);
        expect((await CQ(s.cq.id)).status, '-v1 → MERGED').toBe('MERGED');
        expect(Number(r.fxRate), 'Tỷ giá theo RC gốc').toBe(Number(root.cq.fxRate));
      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_E về trạng thái chưa có báo giá mặc định'); }
      }
    });

  });

  test("RC-079 RC gốc hết hiệu lực khi bản bổ sung còn chờ", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    /** Bản bổ sung -vN Chờ xác nhận của RC gốc `rc` (YCBG bổ sung → BGNB → BGKH), từ bộ giá `b`. */
    const supplement = async (rc: any, b?: any) => pending({ customerId: rc.customerId, sourceQuotationId: rc.id, base: b });

    const root = await active();
    const s = await supplement(root.cq);
    await must(await DEACT(root.cq.id, 'Khách ngừng hợp tác tuyến'), 'RC gốc hết hiệu lực');
    const res = await CONFIRM(s.cq.id);
    expectStatusIn(res, '400/409/422');
    expect((await CQ(s.cq.id)).status, 'Không được đồng ý').not.toBe('MERGED');

  });

  test("RC-080 Đồng ý RC Thất bại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    await must(await REJECT(x.cq.id, 'Giá cao'), 'từ chối');
    const res = await CONFIRM(x.cq.id);
    expectStatusIn(res, '400/409/422');
    expect((await CQ(x.cq.id)).status, 'Không đổi').toBe('FAILED');

  });

  test("RC-087 Khách hàng từ chối", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await REJECT(x.cq.id, 'Giá cao');
    expectStatusIn(res, '200/204');
    expect((await CQ(x.cq.id)).status).toBe('FAILED');
    expect(String((await iqOf(x.rfq.id)).result ?? ''), 'BGNB Kết quả Thất bại').toMatch(/LOST|FAIL|Thất bại/i);
    expect((await data(await http.call('GET /api/quotation-requests/{id}', { token: tok('k1'), params: { id: x.rfq.id } }))).canCreateCustomerQuotation, 'YCBG hiện lại nút Tạo BGKH').toBe(true);

  });

  test("RC-088 Bỏ trống lý do", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await REJECT(x.cq.id, '');
    expectStatusIn(res, '400/422');
    expect((await CQ(x.cq.id)).status).toBe('PENDING_CONFIRMATION');

  });

  test("RC-089 Từ chối RC Đang hiệu lực", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await REJECT(x.cq.id, 'Giá cao');
    expectStatusIn(res, '400/409/422');
    expect((await CQ(x.cq.id)).status).toBe('ACTIVE');

  });

  test("RC-097 Ngưng hoạt động RC đang hiệu lực", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    /** Bản bổ sung -vN Chờ xác nhận của RC gốc `rc` (YCBG bổ sung → BGNB → BGKH), từ bộ giá `b`. */
    const supplement = async (rc: any, b?: any) => pending({ customerId: rc.customerId, sourceQuotationId: rc.id, base: b });

        const root = await active({ customerId: E });
        made.push(root.cq.id);
        await must(await DEFAULT(root.cq.id), 'RC mặc định');
        const s = await supplement(root.cq);
        const order = await createOrder(testRun, { rcId: root.cq.id, customerId: E }, { submit: true });

        const res = await DEACT(root.cq.id, 'Khách ngừng hợp tác tuyến');
        expectStatusIn(res, '200/204');
        const r = await CQ(root.cq.id);
        expect(r.status, 'RC Hết hiệu lực').toBe('EXPIRED');
        expect(r.isDefault).toBe(false);
        expect((await CQ(s.cq.id)).status, 'Bản -v1 Hết hiệu lực').toBe('EXPIRED');
        expect(r.deactivateReason).toBe('Khách ngừng hợp tác tuyến');
        void order;
      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_E về trạng thái chưa có báo giá mặc định'); }
      }
    });

  });

  test("RC-098 Đang hiệu lực → Hết hiệu lực kèm bản bổ sung", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    /** Bản bổ sung -vN Chờ xác nhận của RC gốc `rc` (YCBG bổ sung → BGNB → BGKH), từ bộ giá `b`. */
    const supplement = async (rc: any, b?: any) => pending({ customerId: rc.customerId, sourceQuotationId: rc.id, base: b });

        const root = await active({ customerId: E });
        made.push(root.cq.id);
        await must(await DEFAULT(root.cq.id), 'RC mặc định');
        const s = await supplement(root.cq);
        const order = await createOrder(testRun, { rcId: root.cq.id, customerId: E }, { submit: true });

        const res = await DEACT(root.cq.id, 'Khách ngừng hợp tác tuyến');
        expectStatusIn(res, '200/204');
        expect((await CQ(root.cq.id)).status).toBe('EXPIRED');
        expect((await CQ(root.cq.id)).isDefault).toBe(false);
        expect((await CQ(s.cq.id)).status).toBe('EXPIRED');
        expectStatusIn(await CONFIRM(root.cq.id), '400/409/422', 'Không hoàn tác');
        void order;
      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_E về trạng thái chưa có báo giá mặc định'); }
      }
    });

  });

  test("RC-099 Ngưng RC không Đang hiệu lực", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await DEACT(x.cq.id, 'Khách ngừng hợp tác tuyến');
    expectStatusIn(res, '400/409/422');
    expect((await CQ(x.cq.id)).status).toBe('PENDING_CONFIRMATION');

  });

  test("RC-100 Khách không còn RC hiệu lực thì không lập phiếu được", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const C = env.ref('CUSTOMER_C_ID');
    const made: string[] = [];
    await exclusive('kh-c', async () => {
      try {
        const x = await active({ customerId: C });
        made.push(x.cq.id);
        const res = await DEACT(x.cq.id, 'Khách ngừng hợp tác tuyến');
        expectStatusIn(res, '200/204');
        const list0 = items(await data(await http.call('GET /api/service-orders/selectable-customers', { token: tok('k1'), query: { perPage: 200 } })));
        expect(list0.some((c: any) => (c.id ?? c.customerId) === C), 'KH_C không còn trong danh sách lập phiếu').toBe(false);
      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_C về trạng thái chưa có báo giá hiệu lực'); }
      }
    });

  });

  test("RC-108 Đặt RC làm mặc định", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

        const res = await DEFAULT(rc2.cq.id);
        expectStatusIn(res, '200/204');
        expect((await CQ(rc2.cq.id)).isDefault, 'RC2 mặc định').toBe(true);
        expect((await CQ(rc1.cq.id)).isDefault, 'RC1 bỏ cờ').toBe(false);
        const rows = items(await data(await http.call('GET /api/customer-quotations', { token: tok('k1'), query: { customerId: E, status: ['ACTIVE'], perPage: 100 } })));
        expect(rows.filter((r: any) => r.isDefault), 'Đúng 1 RC mặc định').toHaveLength(1);
      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_E về trạng thái chưa có báo giá mặc định'); }
      }
    });

  });

  test("RC-109 RC không Đang hiệu lực", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await DEFAULT(x.cq.id);
    expectStatusIn(res, '400/409/422');
    expect((await CQ(x.cq.id)).isDefault).toBe(false);

  });

  test("RC-110 Phiếu mới tự chọn RC mặc định", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

        expectStatusIn(await DEFAULT(rc2.cq.id), '200/204', 'RC2 mặc định');
        const res = await http.call('GET /api/service-orders/selectable-customers', { token: tok('k1'), query: { perPage: 200 } });
        expectStatusIn(res, '200/204');
        const c = items(await data(res)).find((x: any) => (x.id ?? x.customerId) === E);
        expect(JSON.stringify(c ?? {}), 'KH_E kèm báo giá mặc định = RC2').toContain(rc2.cq.id);
      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_E về trạng thái chưa có báo giá mặc định'); }
      }
    });

  });

  test("RC-082 Biểu giá Disable của bản bổ sung không gộp", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    /** Bản bổ sung -vN Chờ xác nhận của RC gốc `rc` (YCBG bổ sung → BGNB → BGKH), từ bộ giá `b`. */
    const supplement = async (rc: any, b?: any) => pending({ customerId: rc.customerId, sourceQuotationId: rc.id, base: b });

    const own = await buildP0(testRun, `C82${TEST_RUN_ID}`, { quote: false });

    const root = await active({ base: own });
    const s = await supplement(root.cq, own);
    await setSelling(testRun, own.ssp.storage!, 700_000);
    const sCur = await CQ(s.cq.id);
    const disabledIds = (sCur.sourceSheets ?? []).filter((x: any) => x.disabled).map((x: any) => x.id);
    expect(disabledIds.length, 'Tiền điều kiện: bản -v1 có biểu giá Disable').toBeGreaterThan(0);
    const res = await CONFIRM(s.cq.id);
    expectStatusIn(res, '200/204');
    const r = await CQ(root.cq.id);
    expect((r.sourceSheets ?? []).some((x: any) => disabledIds.includes(x.id)), 'Chỉ biểu giá Hoạt động được gộp').toBe(false);

  });

  test("RC-091 Kết quả BGNB", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await REJECT(x.cq.id, 'Giá cao');
    expectStatusIn(res, '200/204');
    expect(String((await iqOf(x.rfq.id)).result ?? ''), 'result = Thất bại').toMatch(/LOST|FAIL|Thất bại/i);

  });

  test("RC-102 Phiếu dịch vụ đã có giữ doanh thu", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const order = await createOrder(testRun, { rcId: x.cq.id, customerId: x.cq.customerId }, { submit: true });
    const rev0 = stable(await revenueOf(testRun, order.id));
    expect(rev0.length, 'Phiếu có doanh thu trước khi ngưng hiệu lực BGKH').toBeGreaterThan(0);
    const res = await DEACT(x.cq.id, 'Khách ngừng hợp tác tuyến');
    expectStatusIn(res, '200/204');
    expect(stable(await revenueOf(testRun, order.id)), 'Doanh thu P không đổi').toEqual(rev0);

  });

  test("RC-112 Phiếu cũ không đổi báo giá", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

        const order = await createOrder(testRun, { rcId: rc1.cq.id, customerId: E }, { submit: true });
        expectStatusIn(await DEFAULT(rc2.cq.id), '200/204', 'RC2 mặc định');
        const o = await data(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: order.id } }));
        expect(o.customerQuotationId, 'P vẫn RC1').toBe(rc1.cq.id);
      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_E về trạng thái chưa có báo giá mặc định'); }
      }
    });

  });
});
