import { runRemainingIps } from '../../../src/quan-ly-bao-gia/data/remaining-quote-api.scenario';
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
  test("IPS-069 Phát hành BGNB", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await ISSUE(x.iq.id);
    expectStatusIn(res, '200/204');
    const iq = await IQ(x.iq.id);
    expect(isIssued(iq), 'Đã phát hành').toBe(true);
    expect(iq.issuedBy && iq.issuedAt, 'Ghi người/thời điểm phát hành').toBeTruthy();
    expect((await RFQ(x.rfq.id)).status, 'YCBG → PRICED').toBe('PRICED');
    expect((await notesFor('k1', [x.iq.id, x.rfq.id])).length, 'K1 nhận thông báo').toBeGreaterThan(0);

  });

  test("IPS-070 Còn bảng có dòng Hết hạn", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const own = await buildP0(testRun, `I70${TEST_RUN_ID}`, { quote: false });
    const x = await draftIQ(own);
    await setSelling(testRun, own.ssp.customsFee!, 1_300_000);
    await PUTIQ(x.iq.id, putBody(x.iq));
    expect(expiredLine(lineOf(await IQ(x.iq.id), own.items.customsFee.id)), 'Tiền điều kiện: dòng Hết hạn').toBe(true);
    const res = await ISSUE(x.iq.id);
    expectStatusIn(res, '400/409/422');
    expect(isDraft(await IQ(x.iq.id)), 'Bị chặn').toBe(true);

  });

  test("IPS-071 BGNB không có dòng nào", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const r = await rfqInPricing(testRun, 'cc');
    const created = await data(await http.call('POST /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: r.id } }));
    const res = await ISSUE(created.id);
    expectStatusIn(res, '400/409/422');
    expect((await RFQ(r.id, 'cc')).status, 'YCBG giữ Đang báo giá').toBe('PRICING_IN_PROGRESS');

  });

  test("IPS-072 Phát hành lại sau thu hồi", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await withdrawnIQ();
    await must(await PUTIQ(x.iq.id, putBody(x.iq, { terms: 'Điều khoản cập nhật sau thu hồi' })), 'sửa sau thu hồi');
    const res = await ISSUE(x.iq.id);
    expectStatusIn(res, '200/204');
    expect(isIssued(await IQ(x.iq.id)), 'Đã phát hành').toBe(true);
    expect((await RFQ(x.rfq.id)).status).toBe('PRICED');

  });

  test("IPS-073 K1 thấy BGNB trên YCBG", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    await must(await ISSUE(x.iq.id), 'phát hành');
    const res = await http.call('GET /api/quotation-requests/{id}', { token: tok('k1'), params: { id: x.rfq.id } });
    expectStatusIn(res, '200/204');
    const iq = (await data(res)).internalQuote;
    expect(iq?.id, 'K1 thấy khối Báo giá nội bộ').toBe(x.iq.id);
    const keys = Object.keys(iq.lines?.[0] ?? {});
    for (const k of ['serviceTypeName', 'revenueItemName', 'unitName', 'unitPrice']) expect(keys, `Cột ${k}`).toContain(k);
    expect(keys.some((k) => /buying|profit/i.test(k)), 'Không lộ giá mua/lợi nhuận').toBe(false);

  });

  test("IPS-078 Thu hồi BGNB chưa có BGKH", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await issuedIQ();
    const res = await WITHDRAW(x.iq.id, 'Cập nhật giá mới');
    expectStatusIn(res, '200/204');
    expect(isWithdrawn(await IQ(x.iq.id)), 'Thu hồi').toBe(true);
    const rfq = await RFQ(x.rfq.id);
    expect(rfq.status, 'YCBG về PRICING_IN_PROGRESS').toBe('PRICING_IN_PROGRESS');
    expect(rfq.internalQuote ?? null, 'Ẩn khỏi YCBG (K1)').toBeNull();
    expect((await data(await byRfq(x.rfq.id))).id, 'Giữ liên kết 1-1').toBe(x.iq.id);

  });

  test("IPS-079 Đã có BGKH thì không thu hồi được", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await issuedIQ();
    await createCustomerQuotation(testRun, x.rfq.id, 'k1');
    const res = await WITHDRAW(x.iq.id, 'Cập nhật giá mới');
    expectStatusIn(res, '400/409/422');
    expect(isIssued(await IQ(x.iq.id)), 'Giữ Đã phát hành').toBe(true);

  });

  test("IPS-080 Thu hồi BGNB Nháp", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await WITHDRAW(x.iq.id, 'Cập nhật giá mới');
    expectStatusIn(res, '400/409/422');
    expect(isDraft(await IQ(x.iq.id))).toBe(true);

  });

  test("IPS-081 Không giải phóng YCBG", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await withdrawnIQ();
    const res = await http.call('GET /api/internal-quotes/selectable-requests', { token: tok('cc'), query: { search: x.rfq.code } });
    expectStatusIn(res, '200/204');
    expect(items(await data(res)).some((r: any) => r.id === x.rfq.id), 'YCBG không xuất hiện').toBe(false);

  });

  test("IPS-087 Đồng bộ giá định mức cho BGNB tự động", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    await p0Base(testRun);
    const own = await buildP0(testRun, `I87${TEST_RUN_ID}`, { quote: false });
    const x = await autoIQ();
    const total0 = Number(x.iq.total);

    await setSelling(testRun, own.ssp.customsFee!, 1_300_000);
    expect(expiredLine(lineOf(await IQ(x.iq.id), own.items.customsFee.id)), 'Tiền điều kiện: dòng KHQ Hết hạn').toBe(true);
    const status0 = (await IQ(x.iq.id)).status;
    const res = await SYNC(x.iq.id);
    expectStatusIn(res, '200/204');
    const iq = await IQ(x.iq.id);
    const l = lineOf(iq, own.items.customsFee.id);
    expectMoney(l.unitPrice, 1_300_000, 'Dòng KHQ lấy lại SSP mới');
    expect(expiredLine(l), 'Đang hiệu lực').toBe(false);
    expect(tableOf(iq, 'KHQ')?.disabled, 'Bảng mở lại').toBe(false);
    expectMoney(iq.total, total0 + 100_000, 'Tổng tính lại (+100.000)');
    expect(iq.status, 'Trạng thái BGNB không đổi').toBe(status0);

  });

  test("IPS-088 BGNB thủ công không có chức năng đồng bộ", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await issuedIQ();
    const res = await SYNC(x.iq.id);
    expectStatusIn(res, '403/409');

  });

  test("IPS-089 YCBG đã có BGKH", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    await p0Base(testRun);
    const own = await buildP0(testRun, `I89${TEST_RUN_ID}`, { quote: false });
    const x = await autoIQ();
    const total0 = Number(x.iq.total);

    await createCustomerQuotation(testRun, x.rfq.id, 'k1');
    await setSelling(testRun, own.ssp.customsFee!, 1_300_000);
    const res = await SYNC(x.iq.id);
    expectStatusIn(res, '400/409/422');

  });

  test("IPS-090 SSP đã bị xóa thì dò dòng khác", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ testRun }) => {
    await expect(runRemainingIps("IPS-090", testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("IPS-091 Không còn bảng khả dụng thì không áp dụng kết quả", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ testRun }) => {
    await expect(runRemainingIps("IPS-091", testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
