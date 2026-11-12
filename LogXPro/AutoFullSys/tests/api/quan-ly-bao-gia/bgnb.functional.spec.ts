/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, ServiceKey } from '../../../src/core/data/p0-price-set';
import { internalQuoteBody, SspMap, createInternalQuote, issueInternalQuote, expectedQuotePrices } from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
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
  test("IPS-002 Danh sách BGNB", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/internal-quotes', { token: tok('cc'), query: { status: x.iq.status, customerId: x.iq.customerId, perPage: 100 } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    const row = rows.find((r: any) => r.id === x.iq.id);
    expect(row, 'Trả BGNB khớp').toBeTruthy();
    expect(rows.every((r: any) => r.customerId === x.iq.customerId && r.status === x.iq.status), 'Khớp bộ lọc').toBe(true);
    const sum = (x.iq.tables ?? []).filter((t: any) => !t.disabled).reduce((s: number, t: any) => s + Number(t.total ?? 0), 0);
    expectMoney(row.total, sum, 'Tổng đơn giá = Σ bảng giá khả dụng');

  });

  test("IPS-003 Lọc theo hạng khách và thời hạn", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/internal-quotes', { token: tok('cc'), query: { customerTier: x.iq.customerTier, validFrom: x.iq.validFrom, validTo: x.iq.validTo, perPage: 100 } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    expect(rows.some((r: any) => r.id === x.iq.id), `Có BGNB khách hạng ${x.iq.customerTier}`).toBe(true);
    expect(rows.every((r: any) => !r.validTo || r.validTo <= x.iq.validTo), 'Chỉ BGNB khớp thời hạn').toBe(true);
    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: `Lọc theo hạng của KH_A (${x.iq.customerTier}); case nêu hạng Chiến lược` });

  });

  test("IPS-009 Tạo BGNB thủ công 5 bảng giá", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const rfq = await rfqInPricing(testRun, 'cc');
    const body0 = await internalQuoteBody(testRun, rfq.id, mapOf(base), { name: `AT BGNB ${TEST_RUN_ID}`, validTo: today(30) });
    const created = async () => { const r = await byRfq(rfq.id); return r.ok() ? data(r) : null; };

    const expected = await expectedQuotePrices(testRun, body0.tables.flatMap(t => t.lines));
    const res = await POSTIQ(body0);
    expectStatusIn(res, '200/201');
    const v = await created();
    const iq = await IQ(v.id);
    testRun.track(`BGNB ${iq.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: iq.id } }));
    expect(String(iq.code), 'Mã IPSYYMMDD-XXX').toMatch(/^IPS\d{6}-\w{3,}$/);
    expect(isDraft(iq), 'Nháp').toBe(true);
    expect(iq.tables, '5 bảng giá').toHaveLength(5);
    for (const t of iq.tables) expect(String(t.code), 'Bảng giá IQYYMM-XXX').toMatch(/^IQ\d{4}-\w{3,}$/);
    expectMoney(iq.total, P0.internalQuoteTotal, 'Tổng đơn giá');
    expectPercent(iq.expectedProfitPercent, expected.profitPercent, 2, 'Lợi nhuận dự kiến');
    for (const l of iq.tables.flatMap((t: any) => t.lines)) {
      const source = expected.prices.get(l.standardSellingPriceId);
      expect(source, `Giá nguồn của ${l.itemName}`).toBeDefined();
      expectMoney(l.benchmarkBuyingPrice, source!.benchmarkPrice, `${l.itemName}: giá mua định mức`);
      expectPercent(l.profitPercent, (l.unitPrice - source!.benchmarkPrice) / source!.benchmarkPrice * 100, 2, `${l.itemName}: lợi nhuận`);
    }

  });

  test("IPS-010 Thiếu dòng giá cho 1 đầu mục", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const rfq = await rfqInPricing(testRun, 'cc');
    const body0 = await internalQuoteBody(testRun, rfq.id, mapOf(base), { name: `AT BGNB ${TEST_RUN_ID}`, validTo: today(30) });
    const created = async () => { const r = await byRfq(rfq.id); return r.ok() ? data(r) : null; };

    const tables = (body0.tables as any[]).map((t: any) => (t.serviceTypeCode === refs.services.KHQ ? { ...t, lines: t.lines.filter((l: any) => l.priceConfigurationItemId !== base.items.overtime.id) } : t));
    const res = await POSTIQ({ ...body0, tables });
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expect(await created(), 'Không tạo').toBeNull();

  });

  test("IPS-011 2 bảng trùng bộ thuộc tính", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const rfq = await rfqInPricing(testRun, 'cc');
    const body0 = await internalQuoteBody(testRun, rfq.id, mapOf(base), { name: `AT BGNB ${TEST_RUN_ID}`, validTo: today(30) });
    const created = async () => { const r = await byRfq(rfq.id); return r.ok() ? data(r) : null; };

    const vt = (body0.tables as any[]).find((t: any) => t.serviceTypeCode === refs.services.VT);
    const res = await POSTIQ({ ...body0, tables: [...(body0.tables as any[]), { ...vt, name: `${vt.name} bản 2` }] });
    expectStatusIn(res, '400/422');
    expect(await created(), 'Không tạo').toBeNull();

  });

  test("IPS-012 Đơn giá thấp hơn giá mua vẫn lưu, lợi nhuận âm", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const rfq = await rfqInPricing(testRun, 'cc');
    const body0 = await internalQuoteBody(testRun, rfq.id, mapOf(base), { name: `AT BGNB ${TEST_RUN_ID}`, validTo: today(30) });
    const created = async () => { const r = await byRfq(rfq.id); return r.ok() ? data(r) : null; };

    const tables = (body0.tables as any[]).map((t: any) => ({ ...t, lines: t.lines.map((l: any) => (l.priceConfigurationItemId === base.items.transload.id ? { ...l, unitPrice: 1_000_000 } : l)) }));
    const expected = await expectedQuotePrices(testRun, tables.flatMap(t => t.lines));
    const res = await POSTIQ({ ...body0, tables });
    expectStatusIn(res, '200/201');
    const iq = await IQ((await created()).id);
    testRun.track(`BGNB ${iq.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: iq.id } }));
    expectPercent(lineOf(iq, base.items.transload.id).profitPercent, -16.67, 2, 'Lợi nhuận Phí sang tải');
    const total = P0.internalQuoteTotal - 500_000;
    expectMoney(iq.total, total, 'Tổng');
    expectPercent(iq.expectedProfitPercent, expected.profitPercent, 2, 'Tổng lợi nhuận tính lại');

  });

  test("IPS-013 Thiếu bảng cho dịch vụ YCBG yêu cầu", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const rfq = await rfqInPricing(testRun, 'cc');
    const body0 = await internalQuoteBody(testRun, rfq.id, mapOf(base), { name: `AT BGNB ${TEST_RUN_ID}`, validTo: today(30) });
    const created = async () => { const r = await byRfq(rfq.id); return r.ok() ? data(r) : null; };

    const res = await POSTIQ({ ...body0, tables: (body0.tables as any[]).filter((t: any) => t.serviceTypeCode !== refs.services.KB) });
    expectStatusIn(res, '200/201');
    const iq = await IQ((await created()).id);
    testRun.track(`BGNB ${iq.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: iq.id } }));
    expect(iq.unquotedServiceTypeCodes, 'Cảnh báo mềm thiếu KB').toEqual([refs.services.KB]);

  });

  test("IPS-014 Đầu mục Phát sinh không vào bảng", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const rfq = await rfqInPricing(testRun, 'cc');
    const body0 = await internalQuoteBody(testRun, rfq.id, mapOf(base), { name: `AT BGNB ${TEST_RUN_ID}`, validTo: today(30) });
    const created = async () => { const r = await byRfq(rfq.id); return r.ok() ? data(r) : null; };

    const tables = (body0.tables as any[]).map((t: any) => (t.serviceTypeCode === refs.services.KHQ ? { ...t, lines: [...t.lines, { priceConfigurationItemId: base.items.shiftStorage.id, standardSellingPriceId: base.ssp.customsFee, unitPrice: 200_000 }] } : t));
    const res = await POSTIQ({ ...body0, tables });
    expectStatusIn(res, '400/422');
    expect(await created(), 'Không tạo').toBeNull();

  });

  test("IPS-015 Snapshot giá mua/bán tại lúc nạp", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const own = await buildP0(testRun, `I15${TEST_RUN_ID}`, { quote: false });
    const x = await draftIQ(own);
    await setBenchmark(testRun, own.sbp.customsFee!, 1_050_000);
    const l = lineOf(await IQ(x.iq.id), own.items.customsFee.id);
    expectMoney(l.benchmarkBuyingPrice, 1_000_000, 'Giữ giá mua lúc nạp');
    expectPercent(l.profitPercent, 20, 2, 'Lợi nhuận cũ');

  });

  test("IPS-024 Dòng giá bán định mức khớp đầu mục và thuộc tính", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/internal-quotes/benchmark-lines', { token: tok('cc'), query: { priceConfigurationItemId: base.items.freight.id, originPointCode: refs.originPoint, destinationPointCode: refs.destinationPoint, vehicleTypeCode: refs.vehicleType } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    expect(rows.length, 'Trả dòng khớp').toBeGreaterThan(0);
    expect(rows.some((r: any) => r.id === base.ssp.freight), 'Có SSP Cước vận tải P0').toBe(true);
    for (const r of rows) {
      expect(r.code, 'Kèm mã SSP').toBeTruthy();
      expect(r.sellingPrice, 'Dòng SSP null bị loại').not.toBeNull();
      expect(r).toHaveProperty('buyingPrice');
    }

  });

  test("IPS-025 Không có dòng khớp", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const veh2 = (await testRun.catalog('GET /api/catalogues/vehicle-types')).find((v: any) => v.active !== false && v.code !== refs.vehicleType)?.code;
    if (!veh2) throw new Error('Chuẩn bị dữ liệu thất bại: danh mục cần loại xe thứ 2 đang hoạt động');
    const res = await http.call('GET /api/internal-quotes/benchmark-lines', { token: tok('cc'), query: { priceConfigurationItemId: base.items.freight.id, vehicleTypeCode: veh2 } });
    expectStatusIn(res, '200');
    expect(items(await data(res)), 'Mảng rỗng').toHaveLength(0);

  });

  test("IPS-026 Giới hạn số dòng", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const all = items(await data(await http.call('GET /api/internal-quotes/benchmark-lines', { token: tok('cc'), query: { priceConfigurationItemId: base.items.customsFee.id } })));
    const res = await http.call('GET /api/internal-quotes/benchmark-lines', { token: tok('cc'), query: { priceConfigurationItemId: base.items.customsFee.id, limit: 1 } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    expect(rows, 'Trả 1 dòng').toHaveLength(1);
    expect(rows[0].id, 'Dòng có độ đặc hiệu cao nhất (đầu danh sách đầy đủ)').toBe(all[0]?.id);

  });

  test("IPS-030 YCBG chọn được khi tạo BGNB", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const free = await rfqInPricing(testRun, 'cc');
    const x = await draftIQ();
    const res = await http.call('GET /api/internal-quotes/selectable-requests', { token: tok('cc'), query: { search: 'RFQ', limit: 500 } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    expect(rows.some((r: any) => r.id === free.id), 'Có YCBG Đang báo giá chưa gắn BGNB').toBe(true);
    expect(rows.some((r: any) => r.id === x.rfq.id), 'Không có YCBG đã gắn BGNB').toBe(false);

  });

  test("IPS-031 Loại trừ YCBG đang chọn", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/internal-quotes/selectable-requests', { token: tok('cc'), query: { excluding: r.id, search: r.code } });
    expectStatusIn(res, '200');
    expect(items(await data(res)).some((x: any) => x.id === r.id), 'Không có X').toBe(false);

  });

  test("IPS-046 Chỉnh sửa BGNB Nháp/Thu hồi", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const b = putBody(x.iq);
    for (const t of b.tables as any[]) for (const l of t.lines) if (l.priceConfigurationItemId === x.base.items.freight.id) l.unitPrice = 11_500_000;
    const res = await PUTIQ(x.iq.id, b);
    expectStatusIn(res, '200/204');
    const iq = await IQ(x.iq.id);
    expectPercent(lineOf(iq, x.base.items.freight.id).profitPercent, 21.05, 2, 'Lợi nhuận VT');
    expectMoney(iq.total, 16_200_000, 'Tổng tính lại');

  });

  test("IPS-047 Sửa BGNB Đã phát hành", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const before = stable(await IQ(x.iq.id));
    const res = await PUTIQ(x.iq.id, putBody(x.iq, { name: `${x.iq.name} sửa` }));
    expectStatusIn(res, '400/409/422');
    expect(stable(await IQ(x.iq.id)), 'Không đổi').toEqual(before);

  });

  test("IPS-048 Lưu thì đối chiếu lại SSP, dòng đổi giá thành Hết hạn", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const own = await buildP0(testRun, `I48${TEST_RUN_ID}`, { quote: false });
    const x = await draftIQ(own);
    await setSelling(testRun, own.ssp.customsFee!, 1_300_000);
    const res = await PUTIQ(x.iq.id, putBody(x.iq));
    expectStatusIn(res, '200/204');
    expect(expiredLine(lineOf(await IQ(x.iq.id), own.items.customsFee.id)), 'Dòng Phí khai báo chuyển Hết hạn').toBe(true);
    test.info().annotations.push({ type: 'Ghi nhận', description: `Thông báo khi lưu: ${(await body(res))?.message ?? ''}` });

  });

  test("IPS-049 Thêm bảng cùng bộ thuộc tính ghi đè bảng disable", { tag: ["@api", "@quan-ly-bao-gia", "@p1", "@cho-xac-nhan"] }, async ({ http, testRun, tok, page }) => {

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

    const own = await buildP0(testRun, `I49${TEST_RUN_ID}`, { quote: false });
    const x = await issuedIQ(own);
    await setSelling(testRun, own.ssp.customsFee!, 1_300_000);
    await must(await WITHDRAW(x.iq.id, 'Cập nhật giá mới'), 'thu hồi');
    const cur = await IQ(x.iq.id);
    expect(tableOf(cur, 'KHQ')?.disabled, 'Tiền điều kiện: bảng KHQ disable do Hết hạn').toBe(true);
    const b = putBody(cur);
    const khq = (b.tables as any[]).find((t: any) => t.serviceTypeCode === refs.services.KHQ);
    (b.tables as any[]).push({ ...khq, name: `${khq.name} mới`, lines: khq.lines.map((l: any) => (l.priceConfigurationItemId === own.items.customsFee.id ? { ...l, unitPrice: 1_300_000 } : l)) });
    const res = await PUTIQ(x.iq.id, b);
    expectStatusIn(res, '200/204');
    const iq = await IQ(x.iq.id);
    const khqs = (iq.tables ?? []).filter((t: any) => t.serviceTypeCode === refs.services.KHQ);
    test.info().annotations.push({ type: 'Chờ xác nhận', description: 'Bảng mới thay bảng disable (BR-58c, BR-59b)' });
    expect(khqs, 'Bảng mới thay bảng disable').toHaveLength(1);
    expect(khqs[0].disabled, 'Bảng khả dụng').toBe(false);
    expect((khqs[0].lines ?? []).some(expiredLine), 'Dòng Đang hiệu lực').toBe(false);

  });

  test("IPS-050 Đổi YCBG xóa toàn bộ bảng giá", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const other = await rfqInPricing(testRun, 'cc', ['VT']);
    const res = await PUTIQ(x.iq.id, putBody(x.iq, { quotationRequestId: other.id }));
    expectStatusIn(res, '200/400');
    const iq = await IQ(x.iq.id);
    if (res.ok()) {
      expect(iq.quotationRequestId).toBe(other.id);
      expect((iq.tables ?? []).every((t: any) => t.serviceTypeCode === refs.services.VT), 'Không giữ bảng lệch YCBG').toBe(true);
    } else expect(iq.quotationRequestId, 'Giữ YCBG cũ').toBe(x.rfq.id);

  });

  test("IPS-057 Xóa BGNB Nháp", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: x.iq.id } });
    expectStatusIn(res, '200/204');
    expect((await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: x.iq.id } })).ok(), 'Đã xóa').toBe(false);
    expect((await byRfq(x.rfq.id)).ok(), 'YCBG được giải phóng').toBe(false);

  });

  test("IPS-058 Xóa BGNB Đã phát hành", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: x.iq.id } });
    expectStatusIn(res, '400/409/422');
    expect(isIssued(await IQ(x.iq.id)), 'Còn nguyên').toBe(true);

  });

  test("IPS-059 YCBG quay lại danh sách chọn", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    await must(await http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: x.iq.id } }), 'xóa BGNB');
    const res = await http.call('GET /api/internal-quotes/selectable-requests', { token: tok('cc'), query: { search: x.rfq.code } });
    expectStatusIn(res, '200/204');
    expect(items(await data(res)).some((r: any) => r.id === x.rfq.id), 'YCBG xuất hiện lại').toBe(true);

  });

  test("IPS-035 Phạm vi giá trị cho bảng giá thủ công theo YCBG", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/internal-quotes/sheet-options', { token: tok('cc'), query: { quotationRequestId: r.id } });
    expectStatusIn(res, '200');
    const opts = items(await data(res));
    const svc = (k: ServiceKey) => opts.find((o: any) => o.serviceTypeCode === refs.services[k]);
    const values = (k: ServiceKey, rx: RegExp) => JSON.stringify((svc(k)?.attributes ?? []).find((a: any) => rx.test(String(a.field)))?.values ?? []);
    expect(opts.map((o: any) => o.serviceTypeCode).sort(), '5 dịch vụ').toEqual(Object.values(refs.services).sort());
    expect(values('KHQ', /customsOffice/i), 'Chi cục ← Địa điểm TTHQ').toContain(refs.customsOffice);
    expect(values('KHQ', /vehicleType/i), 'Loại xe ← Loại xe yêu cầu').toContain(refs.vehicleType);
    expect(values('VT', /originPoint/i), 'Điểm đi trong tập điểm YCBG').toContain(refs.originPoint);
    expect(values('VT', /destinationPoint/i), 'Điểm đến trong tập điểm YCBG').toContain(refs.destinationPoint);

  });

  test("IPS-039 Bốn thẻ chỉ số BGNB", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    await issuedIQ();
    const res = await http.call('GET /api/internal-quotes/stats', { token: tok('cc') });
    expectStatusIn(res, '200');
    const s = await data(res);
    const total = Number((await data(await http.call('GET /api/internal-quotes', { token: tok('cc'), query: { perPage: 1 } }))).meta.pagination.total);
    expect(Number(s.total), 'Tổng khớp danh sách').toBe(total);
    expect(Number(s.pendingException ?? 0), 'Chờ duyệt ngoại lệ = 0').toBe(0);
    expect(Number(s.issued)).toBeLessThanOrEqual(Number(s.total));

  });

  test("IPS-042 Chi tiết BGNB", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: x.iq.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    for (const k of ['code', 'name', 'validFrom', 'validTo', 'currency', 'total', 'expectedProfitPercent', 'tables']) expect(d, `Thông tin chung/tổng hợp: ${k}`).toHaveProperty(k);
    expect(d.tables, 'Bảng giá').toHaveLength(5);
    expect(d.canBeEdited, 'Nháp: sửa được').toBe(true);
    expect(d.canBePublished, 'Nháp: phát hành được').toBe(true);
    expect(d.standardPriceSyncable, 'Thủ công: không đồng bộ giá').toBe(false);

  });

  test("IPS-063 Lịch sử BGNB", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/internal-quotes/{id}/history', { token: tok('cc'), params: { id: x.iq.id }, query: { page: 1 } });
    expectStatusIn(res, '200');
    const txt = items(await data(res)).map(htext).join(' | ');
    expect(txt, 'Có Tạo mới').toMatch(/Tạo|CREATE/i);
    expect(txt, 'Có Phát hành').toMatch(/Phát hành|ISSUE|PUBLISH/i);
    expect(txt, 'Có Thu hồi').toMatch(/Thu hồi|WITHDRAW/i);
    expect(JSON.stringify(items(await data(res))), 'Kèm lý do thu hồi').toContain('Cập nhật giá mới');

  });

  test("IPS-068 Lọc lịch sử theo thời gian, người thực hiện và phân trang", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const myId = await meId('cc');
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const from = start.toISOString();
    const to = new Date(Date.now() + 60_000).toISOString();
    const res = await http.call('GET /api/internal-quotes/{id}/history', { token: tok('cc'), params: { id: x.iq.id }, query: { from, to, actorUserId: myId, page: 1, perPage: 2 } });
    expectStatusIn(res, '200');
    const list0 = items(await data(res));
    expect(list0.length).toBeGreaterThan(0);
    expect(list0.length, 'Tối đa 2 bản ghi').toBeLessThanOrEqual(2);
    expect(list0.every((h: any) => h.actorUserId === myId), 'Chỉ bản ghi của người đó').toBe(true);
    expect(list0.every((h: any) => Date.parse(h.at) >= Date.parse(from) && Date.parse(h.at) <= Date.parse(to)), 'Trong khoảng').toBe(true);
    const at = list0.map((h: any) => Date.parse(h.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((p, q) => q - p));

  });
});
