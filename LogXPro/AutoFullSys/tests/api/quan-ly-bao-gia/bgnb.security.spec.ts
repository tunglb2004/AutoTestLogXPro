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

test.describe("Báo giá nội bộ (BGNB) và lập báo giá theo YCBG", () => {
  test("IPS-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/internal-quotes", "POST /api/internal-quotes", "GET /api/internal-quotes/benchmark-lines", "GET /api/internal-quotes/selectable-requests", "GET /api/internal-quotes/sheet-options", "GET /api/internal-quotes/stats", "GET /api/internal-quotes/{id}", "PUT /api/internal-quotes/{id}", "DELETE /api/internal-quotes/{id}", "GET /api/internal-quotes/{id}/history", "POST /api/internal-quotes/{id}/issue", "POST /api/internal-quotes/{id}/withdraw", "POST /api/internal-quotes/{id}/sync-standard-prices", "GET /api/quotation-requests/{id}/internal-quote", "POST /api/quotation-requests/{id}/internal-quote", "PUT /api/quotation-requests/{id}/internal-quote", "POST /api/quotation-requests/{id}/internal-quote/decline", "POST /api/quotation-requests/{id}/internal-quote/issue"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "dp");
      const before = await testRun.snapshot(api, p.params ?? {}, "dp");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.dp)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "dp"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("IPS-004 K1 xem danh sách BGNB", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, tok }) => {

    const res = await http.call('GET /api/internal-quotes', { token: tok('k1') });
    expectStatusIn(res, '403');
    await expectNoData(res);

  });

  test("IPS-016 YCBG chưa tiếp nhận hoặc của Định giá khác", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const st = (x: any) => String(x?.status ?? '');
    const isDraft = (x: any) => /DRAFT|Nháp/i.test(st(x));
    const isIssued = (x: any) => /ISSUED|PUBLISHED|Đã phát hành/i.test(st(x));
    const isWithdrawn = (x: any) => /WITHDRAWN|RECALL|Thu hồi/i.test(st(x));
    const expiredLine = (l: any) => /EXPIRED|Hết hạn/i.test(String(l?.lineStatus ?? ''));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    const IQ = async (id: string, role: Who = 'cc') => data(await http.call('GET /api/internal-quotes/{id}', { token: tok(role), params: { id } }));
    const byRfq = (rfqId: string, role: Who = 'cc') => http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: rfqId } });
    const RFQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    const POSTIQ = (json: Record<string, unknown>, role: Who = 'cc') => http.call('POST /api/internal-quotes', { token: tok(role), json });
    const PUTIQ = (id: string, json: Record<string, unknown>, role: Who = 'cc') => http.call('PUT /api/internal-quotes/{id}', { token: tok(role), params: { id }, json });
    const ISSUE = (id: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/issue', { token: tok(role), params: { id } });
    const WITHDRAW = (id: string, reason: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/withdraw', { token: tok(role), params: { id }, json: { reason } });
    const SYNC = (id: string, role: Who = 'k1') => http.call('POST /api/internal-quotes/{id}/sync-standard-prices', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/internal-quotes/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.actorName ?? ''}`;
    const notesFor = async (role: Who, subjectIds: string[]) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => subjectIds.includes(x.subjectId)); };
    const lineOf = (iq: any, itemId: string) => (iq.tables ?? []).flatMap((t: any) => t.lines ?? []).find((l: any) => l.itemId === itemId);
    const tableOf = (iq: any, k: ServiceKey) => (iq.tables ?? []).find((t: any) => t.serviceTypeCode === refs.services[k]);
    /** BGNB thủ công Nháp từ bộ giá `b` (mặc định bộ P0 dùng chung) cho YCBG mới đã tiếp nhận. */
    const draftIQ = async (b?: any, o: Record<string, unknown> = {}) => {
      const base = b ?? (await p0Base(testRun));
      const rfq = await rfqInPricing(testRun, 'cc');
      const q = await createInternalQuote(testRun, rfq.id, mapOf(base), 'cc', o);
      testRun.track(`BGNB ${q.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: q.id } }));
      return { rfq, base, iq: await IQ(q.id) };
    };
    const issuedIQ = async (b?: any) => { const x = await draftIQ(b); await must(await ISSUE(x.iq.id), 'phát hành BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    const withdrawnIQ = async (b?: any) => { const x = await issuedIQ(b); await must(await WITHDRAW(x.iq.id, 'Cập nhật giá mới'), 'thu hồi BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    /** Body PUT giữ nguyên BGNB hiện tại (bảng và dòng theo chi tiết). */
    const putBody = (iq: any, o: Record<string, unknown> = {}) => ({
      quotationRequestId: iq.quotationRequestId, name: iq.name, validFrom: iq.validFrom, validTo: iq.validTo, currency: iq.currency, terms: iq.terms ?? '',
      tables: (iq.tables ?? []).map((t: any) => ({
        serviceTypeCode: t.serviceTypeCode, name: t.name,
        attributes: Object.fromEntries(Object.entries(t.attributes ?? {}).filter(([, v]: any) => v?.code).map(([k, v]: any) => [`${k}Code`, v.code])),
        lines: (t.lines ?? []).map((l: any) => ({ priceConfigurationItemId: l.itemId, standardSellingPriceId: l.standardSellingPriceId, unitPrice: l.unitPrice })),
      })),
      ...o,
    });
    /** BGNB tự động (K1 lấy tự động trên YCBG Nháp) → Đã phát hành. */
    const autoIQ = async () => {
      const r = await createRfq(testRun, {});
      const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
      return { rfq: r, iq: await IQ(a.internalQuoteId) };
    };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const base = await p0Base(testRun);
    const r = await createRfq(testRun, { submit: true });
    const res = await POSTIQ(await internalQuoteBody(testRun, r.id, mapOf(base)));
    expectStatusIn(res, '400/409/422');
    expect((await byRfq(r.id)).ok(), 'Không tạo').toBe(false);

  });

  test("IPS-097 K1 xem BGNB Nháp", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const st = (x: any) => String(x?.status ?? '');
    const isDraft = (x: any) => /DRAFT|Nháp/i.test(st(x));
    const isIssued = (x: any) => /ISSUED|PUBLISHED|Đã phát hành/i.test(st(x));
    const isWithdrawn = (x: any) => /WITHDRAWN|RECALL|Thu hồi/i.test(st(x));
    const expiredLine = (l: any) => /EXPIRED|Hết hạn/i.test(String(l?.lineStatus ?? ''));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    const IQ = async (id: string, role: Who = 'cc') => data(await http.call('GET /api/internal-quotes/{id}', { token: tok(role), params: { id } }));
    const byRfq = (rfqId: string, role: Who = 'cc') => http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: rfqId } });
    const RFQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    const POSTIQ = (json: Record<string, unknown>, role: Who = 'cc') => http.call('POST /api/internal-quotes', { token: tok(role), json });
    const PUTIQ = (id: string, json: Record<string, unknown>, role: Who = 'cc') => http.call('PUT /api/internal-quotes/{id}', { token: tok(role), params: { id }, json });
    const ISSUE = (id: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/issue', { token: tok(role), params: { id } });
    const WITHDRAW = (id: string, reason: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/withdraw', { token: tok(role), params: { id }, json: { reason } });
    const SYNC = (id: string, role: Who = 'k1') => http.call('POST /api/internal-quotes/{id}/sync-standard-prices', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/internal-quotes/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.actorName ?? ''}`;
    const notesFor = async (role: Who, subjectIds: string[]) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => subjectIds.includes(x.subjectId)); };
    const lineOf = (iq: any, itemId: string) => (iq.tables ?? []).flatMap((t: any) => t.lines ?? []).find((l: any) => l.itemId === itemId);
    const tableOf = (iq: any, k: ServiceKey) => (iq.tables ?? []).find((t: any) => t.serviceTypeCode === refs.services[k]);
    /** BGNB thủ công Nháp từ bộ giá `b` (mặc định bộ P0 dùng chung) cho YCBG mới đã tiếp nhận. */
    const draftIQ = async (b?: any, o: Record<string, unknown> = {}) => {
      const base = b ?? (await p0Base(testRun));
      const rfq = await rfqInPricing(testRun, 'cc');
      const q = await createInternalQuote(testRun, rfq.id, mapOf(base), 'cc', o);
      testRun.track(`BGNB ${q.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: q.id } }));
      return { rfq, base, iq: await IQ(q.id) };
    };
    const issuedIQ = async (b?: any) => { const x = await draftIQ(b); await must(await ISSUE(x.iq.id), 'phát hành BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    const withdrawnIQ = async (b?: any) => { const x = await issuedIQ(b); await must(await WITHDRAW(x.iq.id, 'Cập nhật giá mới'), 'thu hồi BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    /** Body PUT giữ nguyên BGNB hiện tại (bảng và dòng theo chi tiết). */
    const putBody = (iq: any, o: Record<string, unknown> = {}) => ({
      quotationRequestId: iq.quotationRequestId, name: iq.name, validFrom: iq.validFrom, validTo: iq.validTo, currency: iq.currency, terms: iq.terms ?? '',
      tables: (iq.tables ?? []).map((t: any) => ({
        serviceTypeCode: t.serviceTypeCode, name: t.name,
        attributes: Object.fromEntries(Object.entries(t.attributes ?? {}).filter(([, v]: any) => v?.code).map(([k, v]: any) => [`${k}Code`, v.code])),
        lines: (t.lines ?? []).map((l: any) => ({ priceConfigurationItemId: l.itemId, standardSellingPriceId: l.standardSellingPriceId, unitPrice: l.unitPrice })),
      })),
      ...o,
    });
    /** BGNB tự động (K1 lấy tự động trên YCBG Nháp) → Đã phát hành. */
    const autoIQ = async () => {
      const r = await createRfq(testRun, {});
      const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
      return { rfq: r, iq: await IQ(a.internalQuoteId) };
    };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await draftIQ();
    const res = await byRfq(x.rfq.id, 'k1');
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("IPS-103 K1 lập BGNB", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const st = (x: any) => String(x?.status ?? '');
    const isDraft = (x: any) => /DRAFT|Nháp/i.test(st(x));
    const isIssued = (x: any) => /ISSUED|PUBLISHED|Đã phát hành/i.test(st(x));
    const isWithdrawn = (x: any) => /WITHDRAWN|RECALL|Thu hồi/i.test(st(x));
    const expiredLine = (l: any) => /EXPIRED|Hết hạn/i.test(String(l?.lineStatus ?? ''));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    const IQ = async (id: string, role: Who = 'cc') => data(await http.call('GET /api/internal-quotes/{id}', { token: tok(role), params: { id } }));
    const byRfq = (rfqId: string, role: Who = 'cc') => http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: rfqId } });
    const RFQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    const POSTIQ = (json: Record<string, unknown>, role: Who = 'cc') => http.call('POST /api/internal-quotes', { token: tok(role), json });
    const PUTIQ = (id: string, json: Record<string, unknown>, role: Who = 'cc') => http.call('PUT /api/internal-quotes/{id}', { token: tok(role), params: { id }, json });
    const ISSUE = (id: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/issue', { token: tok(role), params: { id } });
    const WITHDRAW = (id: string, reason: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/withdraw', { token: tok(role), params: { id }, json: { reason } });
    const SYNC = (id: string, role: Who = 'k1') => http.call('POST /api/internal-quotes/{id}/sync-standard-prices', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/internal-quotes/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.actorName ?? ''}`;
    const notesFor = async (role: Who, subjectIds: string[]) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => subjectIds.includes(x.subjectId)); };
    const lineOf = (iq: any, itemId: string) => (iq.tables ?? []).flatMap((t: any) => t.lines ?? []).find((l: any) => l.itemId === itemId);
    const tableOf = (iq: any, k: ServiceKey) => (iq.tables ?? []).find((t: any) => t.serviceTypeCode === refs.services[k]);
    /** BGNB thủ công Nháp từ bộ giá `b` (mặc định bộ P0 dùng chung) cho YCBG mới đã tiếp nhận. */
    const draftIQ = async (b?: any, o: Record<string, unknown> = {}) => {
      const base = b ?? (await p0Base(testRun));
      const rfq = await rfqInPricing(testRun, 'cc');
      const q = await createInternalQuote(testRun, rfq.id, mapOf(base), 'cc', o);
      testRun.track(`BGNB ${q.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: q.id } }));
      return { rfq, base, iq: await IQ(q.id) };
    };
    const issuedIQ = async (b?: any) => { const x = await draftIQ(b); await must(await ISSUE(x.iq.id), 'phát hành BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    const withdrawnIQ = async (b?: any) => { const x = await issuedIQ(b); await must(await WITHDRAW(x.iq.id, 'Cập nhật giá mới'), 'thu hồi BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    /** Body PUT giữ nguyên BGNB hiện tại (bảng và dòng theo chi tiết). */
    const putBody = (iq: any, o: Record<string, unknown> = {}) => ({
      quotationRequestId: iq.quotationRequestId, name: iq.name, validFrom: iq.validFrom, validTo: iq.validTo, currency: iq.currency, terms: iq.terms ?? '',
      tables: (iq.tables ?? []).map((t: any) => ({
        serviceTypeCode: t.serviceTypeCode, name: t.name,
        attributes: Object.fromEntries(Object.entries(t.attributes ?? {}).filter(([, v]: any) => v?.code).map(([k, v]: any) => [`${k}Code`, v.code])),
        lines: (t.lines ?? []).map((l: any) => ({ priceConfigurationItemId: l.itemId, standardSellingPriceId: l.standardSellingPriceId, unitPrice: l.unitPrice })),
      })),
      ...o,
    });
    /** BGNB tự động (K1 lấy tự động trên YCBG Nháp) → Đã phát hành. */
    const autoIQ = async () => {
      const r = await createRfq(testRun, {});
      const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
      return { rfq: r, iq: await IQ(a.internalQuoteId) };
    };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const base = await p0Base(testRun);
    const r = await rfqInPricing(testRun, 'cc');
    const CREATE = (role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: r.id } });

    const res = await CREATE('k1');
    expectStatusIn(res, '403/404');
    expect((await byRfq(r.id)).ok(), 'Không tạo').toBe(false);
    void base;

  });

  test("IPS-112 K1 nhập đơn giá", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const st = (x: any) => String(x?.status ?? '');
    const isDraft = (x: any) => /DRAFT|Nháp/i.test(st(x));
    const isIssued = (x: any) => /ISSUED|PUBLISHED|Đã phát hành/i.test(st(x));
    const isWithdrawn = (x: any) => /WITHDRAWN|RECALL|Thu hồi/i.test(st(x));
    const expiredLine = (l: any) => /EXPIRED|Hết hạn/i.test(String(l?.lineStatus ?? ''));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    const IQ = async (id: string, role: Who = 'cc') => data(await http.call('GET /api/internal-quotes/{id}', { token: tok(role), params: { id } }));
    const byRfq = (rfqId: string, role: Who = 'cc') => http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: rfqId } });
    const RFQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    const POSTIQ = (json: Record<string, unknown>, role: Who = 'cc') => http.call('POST /api/internal-quotes', { token: tok(role), json });
    const PUTIQ = (id: string, json: Record<string, unknown>, role: Who = 'cc') => http.call('PUT /api/internal-quotes/{id}', { token: tok(role), params: { id }, json });
    const ISSUE = (id: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/issue', { token: tok(role), params: { id } });
    const WITHDRAW = (id: string, reason: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/withdraw', { token: tok(role), params: { id }, json: { reason } });
    const SYNC = (id: string, role: Who = 'k1') => http.call('POST /api/internal-quotes/{id}/sync-standard-prices', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/internal-quotes/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.actorName ?? ''}`;
    const notesFor = async (role: Who, subjectIds: string[]) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => subjectIds.includes(x.subjectId)); };
    const lineOf = (iq: any, itemId: string) => (iq.tables ?? []).flatMap((t: any) => t.lines ?? []).find((l: any) => l.itemId === itemId);
    const tableOf = (iq: any, k: ServiceKey) => (iq.tables ?? []).find((t: any) => t.serviceTypeCode === refs.services[k]);
    /** BGNB thủ công Nháp từ bộ giá `b` (mặc định bộ P0 dùng chung) cho YCBG mới đã tiếp nhận. */
    const draftIQ = async (b?: any, o: Record<string, unknown> = {}) => {
      const base = b ?? (await p0Base(testRun));
      const rfq = await rfqInPricing(testRun, 'cc');
      const q = await createInternalQuote(testRun, rfq.id, mapOf(base), 'cc', o);
      testRun.track(`BGNB ${q.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: q.id } }));
      return { rfq, base, iq: await IQ(q.id) };
    };
    const issuedIQ = async (b?: any) => { const x = await draftIQ(b); await must(await ISSUE(x.iq.id), 'phát hành BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    const withdrawnIQ = async (b?: any) => { const x = await issuedIQ(b); await must(await WITHDRAW(x.iq.id, 'Cập nhật giá mới'), 'thu hồi BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    /** Body PUT giữ nguyên BGNB hiện tại (bảng và dòng theo chi tiết). */
    const putBody = (iq: any, o: Record<string, unknown> = {}) => ({
      quotationRequestId: iq.quotationRequestId, name: iq.name, validFrom: iq.validFrom, validTo: iq.validTo, currency: iq.currency, terms: iq.terms ?? '',
      tables: (iq.tables ?? []).map((t: any) => ({
        serviceTypeCode: t.serviceTypeCode, name: t.name,
        attributes: Object.fromEntries(Object.entries(t.attributes ?? {}).filter(([, v]: any) => v?.code).map(([k, v]: any) => [`${k}Code`, v.code])),
        lines: (t.lines ?? []).map((l: any) => ({ priceConfigurationItemId: l.itemId, standardSellingPriceId: l.standardSellingPriceId, unitPrice: l.unitPrice })),
      })),
      ...o,
    });
    /** BGNB tự động (K1 lấy tự động trên YCBG Nháp) → Đã phát hành. */
    const autoIQ = async () => {
      const r = await createRfq(testRun, {});
      const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
      return { rfq: r, iq: await IQ(a.internalQuoteId) };
    };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const base = await p0Base(testRun);
    const r = await rfqInPricing(testRun, 'cc');
    const CREATE = (role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: r.id } });

    const d0 = await must(await CREATE(), 'lập BGNB từ YCBG');
    testRun.track(`BGNB ${d0.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: d0.id } }));
    const priceOf = (id: string) => P0_ITEMS.find((i) => i.inQuote && base.items[i.key].id === id)?.ssp;
    const p0Lines = (d0.lines ?? []).filter((l: any) => priceOf(l.revenueItemId) !== undefined).map((l: any) => ({ revenueItemId: l.revenueItemId, unitPrice: priceOf(l.revenueItemId)! }));
    const PUTRQ = (json: Record<string, unknown>, role: Who = 'cc') => http.call('PUT /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: r.id }, json });
    const validBody = { validFrom: today(), validTo: today(30), lines: p0Lines };

    const before = stable(await data(await byRfq(r.id)));
    const res = await PUTRQ(validBody, 'k1');
    expectStatusIn(res, '403/404');
    expect(stable(await data(await byRfq(r.id))), 'Không đổi').toEqual(before);

  });

  test("IPS-121 K1 tự từ chối", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const st = (x: any) => String(x?.status ?? '');
    const isDraft = (x: any) => /DRAFT|Nháp/i.test(st(x));
    const isIssued = (x: any) => /ISSUED|PUBLISHED|Đã phát hành/i.test(st(x));
    const isWithdrawn = (x: any) => /WITHDRAWN|RECALL|Thu hồi/i.test(st(x));
    const expiredLine = (l: any) => /EXPIRED|Hết hạn/i.test(String(l?.lineStatus ?? ''));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    const IQ = async (id: string, role: Who = 'cc') => data(await http.call('GET /api/internal-quotes/{id}', { token: tok(role), params: { id } }));
    const byRfq = (rfqId: string, role: Who = 'cc') => http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: rfqId } });
    const RFQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    const POSTIQ = (json: Record<string, unknown>, role: Who = 'cc') => http.call('POST /api/internal-quotes', { token: tok(role), json });
    const PUTIQ = (id: string, json: Record<string, unknown>, role: Who = 'cc') => http.call('PUT /api/internal-quotes/{id}', { token: tok(role), params: { id }, json });
    const ISSUE = (id: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/issue', { token: tok(role), params: { id } });
    const WITHDRAW = (id: string, reason: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/withdraw', { token: tok(role), params: { id }, json: { reason } });
    const SYNC = (id: string, role: Who = 'k1') => http.call('POST /api/internal-quotes/{id}/sync-standard-prices', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/internal-quotes/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.actorName ?? ''}`;
    const notesFor = async (role: Who, subjectIds: string[]) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => subjectIds.includes(x.subjectId)); };
    const lineOf = (iq: any, itemId: string) => (iq.tables ?? []).flatMap((t: any) => t.lines ?? []).find((l: any) => l.itemId === itemId);
    const tableOf = (iq: any, k: ServiceKey) => (iq.tables ?? []).find((t: any) => t.serviceTypeCode === refs.services[k]);
    /** BGNB thủ công Nháp từ bộ giá `b` (mặc định bộ P0 dùng chung) cho YCBG mới đã tiếp nhận. */
    const draftIQ = async (b?: any, o: Record<string, unknown> = {}) => {
      const base = b ?? (await p0Base(testRun));
      const rfq = await rfqInPricing(testRun, 'cc');
      const q = await createInternalQuote(testRun, rfq.id, mapOf(base), 'cc', o);
      testRun.track(`BGNB ${q.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: q.id } }));
      return { rfq, base, iq: await IQ(q.id) };
    };
    const issuedIQ = async (b?: any) => { const x = await draftIQ(b); await must(await ISSUE(x.iq.id), 'phát hành BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    const withdrawnIQ = async (b?: any) => { const x = await issuedIQ(b); await must(await WITHDRAW(x.iq.id, 'Cập nhật giá mới'), 'thu hồi BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    /** Body PUT giữ nguyên BGNB hiện tại (bảng và dòng theo chi tiết). */
    const putBody = (iq: any, o: Record<string, unknown> = {}) => ({
      quotationRequestId: iq.quotationRequestId, name: iq.name, validFrom: iq.validFrom, validTo: iq.validTo, currency: iq.currency, terms: iq.terms ?? '',
      tables: (iq.tables ?? []).map((t: any) => ({
        serviceTypeCode: t.serviceTypeCode, name: t.name,
        attributes: Object.fromEntries(Object.entries(t.attributes ?? {}).filter(([, v]: any) => v?.code).map(([k, v]: any) => [`${k}Code`, v.code])),
        lines: (t.lines ?? []).map((l: any) => ({ priceConfigurationItemId: l.itemId, standardSellingPriceId: l.standardSellingPriceId, unitPrice: l.unitPrice })),
      })),
      ...o,
    });
    /** BGNB tự động (K1 lấy tự động trên YCBG Nháp) → Đã phát hành. */
    const autoIQ = async () => {
      const r = await createRfq(testRun, {});
      const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
      return { rfq: r, iq: await IQ(a.internalQuoteId) };
    };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const DECLINE = (id: string, reason: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok(role), params: { id }, json: { reason } });

    const r = await createRfq(testRun, { submit: true });
    const res = await DECLINE(r.id, 'K1 tự từ chối', 'k1');
    expectStatusIn(res, '403/404');
    expect((await RFQ(r.id)).status, 'Giữ trạng thái').toBe('AWAITING_PRICING');

  });

  test("IPS-131 K1 phát hành", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const st = (x: any) => String(x?.status ?? '');
    const isDraft = (x: any) => /DRAFT|Nháp/i.test(st(x));
    const isIssued = (x: any) => /ISSUED|PUBLISHED|Đã phát hành/i.test(st(x));
    const isWithdrawn = (x: any) => /WITHDRAWN|RECALL|Thu hồi/i.test(st(x));
    const expiredLine = (l: any) => /EXPIRED|Hết hạn/i.test(String(l?.lineStatus ?? ''));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    const IQ = async (id: string, role: Who = 'cc') => data(await http.call('GET /api/internal-quotes/{id}', { token: tok(role), params: { id } }));
    const byRfq = (rfqId: string, role: Who = 'cc') => http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: rfqId } });
    const RFQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    const POSTIQ = (json: Record<string, unknown>, role: Who = 'cc') => http.call('POST /api/internal-quotes', { token: tok(role), json });
    const PUTIQ = (id: string, json: Record<string, unknown>, role: Who = 'cc') => http.call('PUT /api/internal-quotes/{id}', { token: tok(role), params: { id }, json });
    const ISSUE = (id: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/issue', { token: tok(role), params: { id } });
    const WITHDRAW = (id: string, reason: string, role: Who = 'cc') => http.call('POST /api/internal-quotes/{id}/withdraw', { token: tok(role), params: { id }, json: { reason } });
    const SYNC = (id: string, role: Who = 'k1') => http.call('POST /api/internal-quotes/{id}/sync-standard-prices', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/internal-quotes/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.actorName ?? ''}`;
    const notesFor = async (role: Who, subjectIds: string[]) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => subjectIds.includes(x.subjectId)); };
    const lineOf = (iq: any, itemId: string) => (iq.tables ?? []).flatMap((t: any) => t.lines ?? []).find((l: any) => l.itemId === itemId);
    const tableOf = (iq: any, k: ServiceKey) => (iq.tables ?? []).find((t: any) => t.serviceTypeCode === refs.services[k]);
    /** BGNB thủ công Nháp từ bộ giá `b` (mặc định bộ P0 dùng chung) cho YCBG mới đã tiếp nhận. */
    const draftIQ = async (b?: any, o: Record<string, unknown> = {}) => {
      const base = b ?? (await p0Base(testRun));
      const rfq = await rfqInPricing(testRun, 'cc');
      const q = await createInternalQuote(testRun, rfq.id, mapOf(base), 'cc', o);
      testRun.track(`BGNB ${q.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: q.id } }));
      return { rfq, base, iq: await IQ(q.id) };
    };
    const issuedIQ = async (b?: any) => { const x = await draftIQ(b); await must(await ISSUE(x.iq.id), 'phát hành BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    const withdrawnIQ = async (b?: any) => { const x = await issuedIQ(b); await must(await WITHDRAW(x.iq.id, 'Cập nhật giá mới'), 'thu hồi BGNB'); return { ...x, iq: await IQ(x.iq.id) }; };
    /** Body PUT giữ nguyên BGNB hiện tại (bảng và dòng theo chi tiết). */
    const putBody = (iq: any, o: Record<string, unknown> = {}) => ({
      quotationRequestId: iq.quotationRequestId, name: iq.name, validFrom: iq.validFrom, validTo: iq.validTo, currency: iq.currency, terms: iq.terms ?? '',
      tables: (iq.tables ?? []).map((t: any) => ({
        serviceTypeCode: t.serviceTypeCode, name: t.name,
        attributes: Object.fromEntries(Object.entries(t.attributes ?? {}).filter(([, v]: any) => v?.code).map(([k, v]: any) => [`${k}Code`, v.code])),
        lines: (t.lines ?? []).map((l: any) => ({ priceConfigurationItemId: l.itemId, standardSellingPriceId: l.standardSellingPriceId, unitPrice: l.unitPrice })),
      })),
      ...o,
    });
    /** BGNB tự động (K1 lấy tự động trên YCBG Nháp) → Đã phát hành. */
    const autoIQ = async () => {
      const r = await createRfq(testRun, {});
      const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
      return { rfq: r, iq: await IQ(a.internalQuoteId) };
    };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const base = await p0Base(testRun);
    const r = await rfqInPricing(testRun, 'cc');
    const CREATE = (role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: r.id } });

    const d0 = await must(await CREATE(), 'lập BGNB từ YCBG');
    testRun.track(`BGNB ${d0.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: d0.id } }));
    const priceOf = (id: string) => P0_ITEMS.find((i) => i.inQuote && base.items[i.key].id === id)?.ssp;
    const p0Lines = (d0.lines ?? []).filter((l: any) => priceOf(l.revenueItemId) !== undefined).map((l: any) => ({ revenueItemId: l.revenueItemId, unitPrice: priceOf(l.revenueItemId)! }));
    const PUTRQ = (json: Record<string, unknown>, role: Who = 'cc') => http.call('PUT /api/quotation-requests/{id}/internal-quote', { token: tok(role), params: { id: r.id }, json });
    const validBody = { validFrom: today(), validTo: today(30), lines: p0Lines };

    await must(await PUTRQ(validBody), 'nhập đơn giá');
    const ISSUERQ = (role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/internal-quote/issue', { token: tok(role), params: { id: r.id } });

    const res = await ISSUERQ('k1');
    expectStatusIn(res, '403/404');
    expect((await RFQ(r.id, 'cc')).status, 'Không đổi').toBe('PRICING_IN_PROGRESS');

  });
});
