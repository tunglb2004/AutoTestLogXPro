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
import { QuoteScenario } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';
import { p0Items } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Yêu cầu báo giá (YCBG/RFQ)", () => {
  test("RFQ-004 Tìm theo mã RFQ hoặc tên khách hàng", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const a = await mk();
    const res = await http.call('GET /api/quotation-requests', { token: tok('k1'), query: { search: String(a.customerName).toLowerCase(), perPage: 100 } });
    expectStatusIn(res, '200');
    expect(items(await data(res)).some((x: any) => x.id === a.id), 'Trả YCBG của KH_A').toBe(true);

  });

  test("RFQ-005 Định giá thấy YCBG đã gửi của mọi khách", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const a = await awaiting();
    const b = await awaiting({ role: 'k1b', body: await rfqBody(testRun, { customerId: env.ref('CUSTOMER_B_ID') }) });
    const d = await mk();
    const res = await http.call('GET /api/quotation-requests', { token: tok('cc') });
    expectStatusIn(res, '200');
    expect((await list({ search: a.code }, 'cc')).some((x: any) => x.id === a.id), 'Có YCBG KH_A').toBe(true);
    expect((await list({ search: b.code }, 'cc')).some((x: any) => x.id === b.id), 'Có YCBG KH_B').toBe(true);
    expect((await list({ search: d.code }, 'cc')).some((x: any) => x.id === d.id), 'Không thấy YCBG DRAFT').toBe(false);
    expect(items(await data(res)).every((x: any) => x.status !== 'DRAFT'), 'Danh sách Định giá không có DRAFT').toBe(true);

  });

  test("RFQ-010 Tạo YCBG đủ 5 dịch vụ, lưu nháp", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const res = await http.call('POST /api/quotation-requests', { token: tok('k1'), query: { submit: false }, json: await fullBody() });
    expectStatusIn(res, '200/201');
    const d = await data(res);
    testRun.track(`YCBG ${d.code}`, () => DEL(d.id));
    expect(String(d.code), 'Mã RFQYYMMDD-XXX').toMatch(/^RFQ\d{6}-\w{3,}$/);
    expect(d.status).toBe('DRAFT');
    expect(await notesFor('cc', d.id), 'Không báo Định giá').toHaveLength(0);

  });

  test("RFQ-011 Tạo và gửi ngay", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const res = await http.call('POST /api/quotation-requests', { token: tok('k1'), query: { submit: true }, json: await fullBody() });
    expectStatusIn(res, '200/201');
    const d = await data(res);
    testRun.track(`YCBG ${d.code}`, () => CANCEL(d.id, 'Dọn dữ liệu kiểm thử tự động'));
    expect(d.status).toBe('AWAITING_PRICING');
    expect((await notesFor('cc', d.id)).length, 'Định giá nhận thông báo').toBeGreaterThan(0);

  });

  test("RFQ-012 Ít nhất 1 dịch vụ", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const total = async () => Number((await data(await http.call('GET /api/quotation-requests', { token: tok('k1'), query: { customerId: env.ref('CUSTOMER_A_ID'), perPage: 1 } }))).meta.pagination.total);
    const before = await total();
    const res = await http.call('POST /api/quotation-requests', { token: tok('k1'), query: { submit: true }, json: await fullBody({ services: [] }) });
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expect(await total(), 'Không sinh mã').toBe(before);

  });

  test("RFQ-013 Yêu cầu bổ sung kế thừa khách, HĐ, tiền tệ của báo giá gốc", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const base = await p0Base(testRun);
    const res = await http.call('POST /api/quotation-requests', { token: tok('k1'), query: { submit: false }, json: await fullBody({ sourceQuotationId: base.rcId, customerId: env.ref('CUSTOMER_B_ID'), currency: 'USD' }) });
    expectStatusIn(res, '200/400');
    if (res.status() === 200 || res.status() === 201) {
      const d = await data(res);
      testRun.track(`YCBG ${d.code}`, () => DEL(d.id));
      expect(d.customerId, 'Khách theo RC gốc').toBe(base.customerId);
      expect(d.currency, 'Tiền tệ theo RC gốc').toBe('VND');
      expect(d.supplementary, 'Nhãn BỔ SUNG').toBe(true);
    } else await expectApiError(res);

  });

  test("RFQ-014 Báo giá gốc không Đang hiệu lực", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.active();
    await must(await q.call('POST /api/customer-quotations/{id}/deactivate', 'k1', { params: { id: x.cq.id }, json: { reason: 'Báo giá hết hiệu lực để kiểm điều kiện tạo bổ sung' } }), 'ngưng RC riêng của RFQ-014');
    expect((await q.cq(x.cq.id)).status).toBe('EXPIRED');
    const before = await q.history(x.cq.id, 'customer-quotations');
    const marker = tagged('AT RFQ014 không được tạo');
    const res = await q.call('POST /api/quotation-requests', 'k1', { query: { submit: false }, json: await rfqBody(testRun, { sourceQuotationId: x.cq.id, generalNote: marker }) });
    expectStatusIn(res, '400/409/422'); await expectApiError(res);
    expect(await testRun.listContains('GET /api/quotation-requests', marker, 'k1')).toBe(false);
    expect((await q.cq(x.cq.id)).status).toBe('EXPIRED');
    expect(await q.history(x.cq.id, 'customer-quotations')).toEqual(before);

  });

  test("RFQ-037 Sửa YCBG Nháp hoặc Chờ báo giá", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const bn = await testRun.pick('GET /api/catalogues/provinces', /Bắc Ninh/i, { countryCode: 'VN' });
    const twoRoutes = async () => {
      const b0 = await fullBody();
      const vt = { ...serviceEntry(refs, 'VT'), routes: [{ pickup: { ...refs.origin }, delivery: { ...refs.destination } }, { pickup: { ...refs.origin }, delivery: { pointType: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, placeName: 'KCN Quế Võ, Bắc Ninh' } }] };
      return { ...b0, services: [...(b0.services as any[]).filter((s: any) => s.serviceTypeCode !== refs.services.VT), vt] };
    };

    const r = await awaiting();
    const h0 = (await HIST(r.id)).length;
    const res = await PUT(r.id, await twoRoutes());
    expectStatusIn(res, '200/204');
    const d = await GET(r.id);
    expect(d.status, 'Giữ AWAITING_PRICING').toBe('AWAITING_PRICING');
    expect((d.transportLegs ?? []).length, 'Có cặp Hữu Nghị → Bắc Ninh').toBe(2);
    expect((await HIST(r.id)).length, 'Ghi lịch sử').toBeGreaterThan(h0);
    expect(((await GET(r.id, 'cc')).transportLegs ?? []).length, 'Định giá thấy dữ liệu mới').toBe(2);

  });

  test("RFQ-038 Sửa khi Đang báo giá", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await inPricing();
    const before = stable(await GET(r.id));
    const res = await PUT(r.id, await fullBody({ generalNote: 'Sửa khi đang báo giá' }));
    expectStatusIn(res, '400/409/422');
    expect(stable(await GET(r.id)), 'Không đổi').toEqual(before);

  });

  test("RFQ-039 Sửa khi Từ chối báo giá để khôi phục", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await declined();
    const res = await PUT(r.id, await fullBody({ generalNote: 'Bổ sung chi cục và loại xe theo lý do từ chối' }));
    expectStatusIn(res, '200/204');
    expect((await GET(r.id)).generalNote).toBe('Bổ sung chi cục và loại xe theo lý do từ chối');

  });

  test("RFQ-049 Xóa vĩnh viễn YCBG Nháp", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await createRfq(testRun, {});
    const res = await DEL(r.id);
    expectStatusIn(res, '200/204');
    expectStatusIn(await http.call('GET /api/quotation-requests/{id}', { token: tok('k1'), params: { id: r.id } }), '404', 'Xóa vĩnh viễn');

  });

  test("RFQ-050 Vòng đời tạo nháp → sửa → xóa YCBG", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const c = await http.call('POST /api/quotation-requests', { token: tok('k1'), query: { submit: false }, json: await rfqBody(testRun, {}, ['VT']) });
    expectStatusIn(c, '200/201/204', 'tạo nháp');
    const r = await data(c);
    expectStatusIn(await PUT(r.id, await rfqBody(testRun, {}, ['VT', 'KHQ'])), '200/201/204', 'sửa');
    const g = await http.call('GET /api/quotation-requests/{id}', { token: tok('k1'), params: { id: r.id } });
    expectStatusIn(g, '200/201/204', 'đọc');
    expect((await data(g)).services, 'Sau sửa có 2 dịch vụ').toHaveLength(2);
    expectStatusIn(await DEL(r.id), '200/201/204', 'xóa');
    expectStatusIn(await http.call('GET /api/quotation-requests/{id}', { token: tok('k1'), params: { id: r.id } }), '404', 'sau xóa không còn');

  });

  test("RFQ-051 Xóa YCBG đã gửi", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await awaiting();
    const res = await DEL(r.id);
    expectStatusIn(res, '400/409/422');
    expect((await GET(r.id)).status, 'Còn nguyên').toBe('AWAITING_PRICING');

  });

  test("RFQ-103 Gỡ chứng từ", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await mk();
    const file = REAL.pdf10();
    await must(await UPLOAD(r.id, file), 'đính chứng từ KHQ');
    const doc = (await docsOf(r.id))[0];

    const res = await DELDOC(r.id, doc.id);
    expectStatusIn(res, '200/204');
    expect((await docsOf(r.id)).some((d: any) => d.id === doc.id), 'Chứng từ bị gỡ').toBe(false);

  });

  test("RFQ-104 Gỡ khi YCBG đã khóa sửa", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await mk();
    const file = REAL.pdf10();
    await must(await UPLOAD(r.id, file), 'đính chứng từ KHQ');
    const doc = (await docsOf(r.id))[0];

    await must(await SUBMIT(r.id), 'gửi');
    await must(await ACCEPT(r.id), 'tiếp nhận');
    const res = await DELDOC(r.id, doc.id);
    expectStatusIn(res, '400/409/422');
    expect((await docsOf(r.id)).some((d: any) => d.id === doc.id), 'Không gỡ được').toBe(true);

  });

  test("RFQ-002 Danh sách YCBG của khách mình phụ trách", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const a = await mk({ services: ['VT'] });
    const b = await mk({ role: 'k1b', services: ['VT'], body: await rfqBody(testRun, { customerId: env.ref('CUSTOMER_B_ID') }, ['VT']) });
    const res = await http.call('GET /api/quotation-requests', { token: tok('k1'), query: { status: ['DRAFT', 'AWAITING_PRICING'], serviceTypeCode: [refs.services.VT], page: 1, perPage: 100 } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    expect(rows.some((x: any) => x.id === a.id), 'Có YCBG KH_A của K1').toBe(true);
    expect(rows.some((x: any) => x.id === b.id), 'Không có YCBG khách K1B').toBe(false);
    expect(rows.every((x: any) => ['DRAFT', 'AWAITING_PRICING'].includes(x.status)), 'Khớp trạng thái HOẶC').toBe(true);
    expect(rows.every((x: any) => (x.serviceTypeCodes ?? []).includes(refs.services.VT)), 'Khớp dịch vụ').toBe(true);
    const at = rows.map((x: any) => Date.parse(x.createdAt));
    expect(at, 'Mới tạo trước').toEqual([...at].sort((p, q) => q - p));
    expect(rows.find((x: any) => x.id === a.id)?.pricingOwnerName ?? null, 'Chưa tiếp nhận: Pricing phụ trách trống').toBeFalsy();

  });

  test("RFQ-016 Lưu đủ cấu trúc dịch vụ để khớp giá", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const bn = await testRun.pick('GET /api/catalogues/provinces', /Bắc Ninh/i, { countryCode: 'VN' });
    const vt = { ...serviceEntry(refs, 'VT'), routes: [{ pickup: { ...refs.origin }, delivery: { ...refs.destination } }, { pickup: { ...refs.origin }, delivery: { pointType: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, placeName: 'KCN Quế Võ, Bắc Ninh' } }] };
    const body0 = await fullBody();
    const r = await mk({ body: { ...body0, services: [...(body0.services as any[]).filter((s: any) => s.serviceTypeCode !== refs.services.VT), vt] } });
    const res = await http.call('GET /api/quotation-requests/{id}', { token: tok('k1'), params: { id: r.id } });
    expectStatusIn(res, '200/201');
    const d = await data(res);
    expect((d.services ?? []).map((s: any) => s.serviceTypeCode).sort(), '5 dịch vụ').toEqual(Object.values(refs.services).sort());
    const svc = (k: ServiceKey) => d.services.find((s: any) => s.serviceTypeCode === refs.services[k]);
    expect(svc('KHQ').customsOfficeCodes ?? [], 'KHQ giữ chi cục').toContain(refs.customsOffice);
    expect(svc('ST').transloadPointCodes ?? [], 'ST giữ bãi').toContain(refs.transloadPoint);
    expect(svc('KB').warehouseCode, 'KB giữ kho').toBe(refs.warehouse);
    const legs = [...(d.transportLegs ?? [])].sort((a: any, b: any) => a.position - b.position);
    expect(legs, '2 cặp điểm').toHaveLength(2);
    expect(JSON.stringify(legs[1]), 'Cặp điểm giữ nguyên thứ tự').toContain(bn.code);

  });

  test("RFQ-026 Danh sách trạng thái kèm nhãn", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, tok }) => {

    const res = await http.call('GET /api/quotation-requests/statuses', { token: tok('k1') });
    expectStatusIn(res, '200');
    const st = items(await data(res));
    expect(st.map((s: any) => s.code).sort(), 'Đủ 6 trạng thái').toEqual(['AWAITING_PRICING', 'CANCELLED', 'DRAFT', 'PRICED', 'PRICING_DECLINED', 'PRICING_IN_PROGRESS']);
    for (const s of st) expect(String(s.name ?? ''), `Nhãn tiếng Việt của ${s.code}`).toMatch(/[\p{L}]/u);

  });

  test("RFQ-029 Thẻ tổng hợp báo giá nội bộ", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    await priced();
    const res = await http.call('GET /api/quotation-requests/internal-quote-stats', { token: tok('cc') });
    expectStatusIn(res, '200');
    const s = await data(res);
    expect(Number(s.total)).toBeGreaterThanOrEqual(Number(s.issued));
    expect(Number(s.issued)).toBeGreaterThanOrEqual(Number(s.won));
    const rate = Number(s.issued) > 0 ? Number(s.won) / Number(s.issued) : 0;
    expect(Math.abs(Number(s.winRate) - rate * 100) < 0.01 || Math.abs(Number(s.winRate) - rate) < 0.0001, `Tỷ lệ chốt = thành công / (Đã phát hành + Hết hiệu lực): ${s.winRate}`).toBe(true);

  });

  test("RFQ-032 Chi tiết YCBG", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await priced();
    const res = await http.call('GET /api/quotation-requests/{id}', { token: tok('k1'), params: { id: r.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    for (const k of ['code', 'customerName', 'currency', 'status', 'services']) expect(d, `Thông tin chung: ${k}`).toHaveProperty(k);
    expect(d.internalQuote?.id, 'Khối báo giá nội bộ khi đã phát hành').toBeTruthy();
    for (const k of ['canBeEdited', 'canBeSubmitted', 'canBeDeleted', 'canBeCancelled', 'canBeRestored', 'canCreateCustomerQuotation']) expect(typeof d[k], `Nút theo trạng thái: ${k}`).toBe('boolean');
    expect(d.canCreateCustomerQuotation, 'Đã có báo giá: được tạo BGKH').toBe(true);

  });

  test("RFQ-041 Đổi khách hàng của YCBG bổ sung", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const base = await p0Base(testRun);
    const r = await mk({ body: await fullBody({ sourceQuotationId: base.rcId }) });
    const res = await PUT(r.id, await fullBody({ sourceQuotationId: base.rcId, customerId: env.ref('CUSTOMER_B_ID') }));
    expectStatusIn(res, '400/422');
    const d = await GET(r.id);
    expect(d.customerId, 'Khách khóa theo báo giá gốc').toBe(base.customerId);
    expect(d.currency, 'Tiền tệ khóa theo báo giá gốc').toBe('VND');

  });

  test("RFQ-053 Mã RFQ không tái sử dụng", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await createRfq(testRun, {});
    expectStatusIn(await DEL(r.id), '200/201/204', 'xóa');
    const res = await http.call('POST /api/quotation-requests', { token: tok('k1'), query: { submit: false }, json: await fullBody() });
    expectStatusIn(res, '200/201/204', 'tạo mới');
    const d = await data(res);
    testRun.track(`YCBG ${d.code}`, () => DEL(d.id));
    expect(d.code, 'Mã mới khác mã đã xóa').not.toBe(r.code);

  });

  test("RFQ-097 Tải chứng từ YCBG", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await mk();
    const file = REAL.pdf10();
    await must(await UPLOAD(r.id, file), 'đính chứng từ KHQ');
    const doc = (await docsOf(r.id))[0];

    const res = await DOC(r.id, doc.id);
    expectStatusIn(res, '200');
    const buf = await res.body();
    expect(buf.length, 'Đúng dung lượng').toBe(file.buffer.length);
    expect(res.headers()['content-disposition'] ?? '', 'Đúng tên').toContain(doc.filename);
    expect(sha256(buf)).toBe(sha256(file.buffer));

  });

  test("RFQ-106 Gỡ không ảnh hưởng chứng từ khác", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await mk();
    await must(await UPLOAD(r.id, samplePdf('chung-tu-1.pdf')), 'chứng từ 1');
    await must(await UPLOAD(r.id, samplePdf('chung-tu-2.pdf')), 'chứng từ 2');
    const [d1] = await docsOf(r.id);
    const res = await DELDOC(r.id, d1.id);
    expectStatusIn(res, '200/204');
    expect(await docsOf(r.id), 'Còn 1').toHaveLength(1);

  });

  test("RFQ-110 Lịch sử YCBG", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await inPricing();
    const res = await http.call('GET /api/quotation-requests/{id}/history', { token: tok('k1'), params: { id: r.id }, query: { page: 1 } });
    expectStatusIn(res, '200');
    const list0 = items(await data(res));
    const at = list0.map((h: any) => Date.parse(h.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((p, q) => q - p));
    const txt = list0.map(htext);
    const iAcc = txt.findIndex((t: string) => /Tiếp nhận|ACCEPT/i.test(t));
    const iSub = txt.findIndex((t: string) => /Gửi|SUBMIT/i.test(t));
    const iNew = txt.findIndex((t: string) => /Tạo|CREATE/i.test(t));
    expect(iAcc, `Có Tiếp nhận (${txt.join(' | ')})`).toBeGreaterThanOrEqual(0);
    expect(iSub, 'Có Gửi sau Tiếp nhận trong danh sách').toBeGreaterThan(iAcc);
    expect(iNew, 'Có Tạo mới').toBeGreaterThan(iSub);
    expect(list0.every((h: any) => h.actorName), 'Kèm người thực hiện').toBe(true);

  });

  test("RFQ-116 Lọc lịch sử theo thời gian, người thực hiện và phân trang", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await inPricing();
    const myId = await meId('k1');
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const from = start.toISOString();
    const to = new Date(Date.now() + 60_000).toISOString();
    const res = await http.call('GET /api/quotation-requests/{id}/history', { token: tok('k1'), params: { id: r.id }, query: { from, to, actorUserId: myId, page: 1, perPage: 2 } });
    expectStatusIn(res, '200');
    const list0 = items(await data(res));
    expect(list0.length).toBeGreaterThan(0);
    expect(list0.length, 'Tối đa 2 bản ghi').toBeLessThanOrEqual(2);
    expect(list0.every((h: any) => h.actorUserId === myId), 'Chỉ bản ghi của người đó').toBe(true);
    expect(list0.every((h: any) => Date.parse(h.at) >= Date.parse(from) && Date.parse(h.at) <= Date.parse(to)), 'Trong khoảng').toBe(true);
    const at = list0.map((h: any) => Date.parse(h.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((p, q) => q - p));

  });

  test("RFQ-126 Đính kèm chứng từ cho dịch vụ KHQ", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await mk();
    const file = REAL.pdf10();
    const res = await UPLOAD(r.id, file);
    expectStatusIn(res, '200/201');
    const docs = await docsOf(r.id);
    expect(docs, 'Lưu chứng từ').toHaveLength(1);
    expect(docs[0].id, 'Trả id').toBeTruthy();
    expect(sha256(await (await DOC(r.id, docs[0].id)).body()), 'Tải lại đúng file').toBe(sha256(file.buffer));

  });

  test("RFQ-130 Dịch vụ không có trong YCBG", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await mk({ services: ['VT'] });
    const res = await UPLOAD(r.id, samplePdf('kho-bai.pdf'), 'KB');
    expectStatusIn(res, '400/404');
    expect(((await GET(r.id)).services ?? []).flatMap((s: any) => s.documents ?? []), 'Không lưu').toHaveLength(0);

  });

  test("RFQ-132 Thiếu file", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc' | 'dp';
    const GET = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/quotation-requests/{id}', { token: tok(role), params: { id } }));
    /** YCBG mới (dọn khi bật ALLOW_CLEANUP: Nháp thì xóa, còn lại thì hủy). */
    const mk = async (opts: { submit?: boolean; body?: Record<string, unknown>; role?: 'k1' | 'k1b'; services?: ServiceKey[] } = {}) => {
      const r = await createRfq(testRun, opts);
      testRun.track(`YCBG ${r.code}`, async () => {
        const d = await GET(r.id, opts.role ?? 'k1');
        return d?.status === 'DRAFT'
          ? http.call('DELETE /api/quotation-requests/{id}', { token: tok(opts.role ?? 'k1'), params: { id: r.id } })
          : http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(opts.role ?? 'k1'), params: { id: r.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } });
      });
      return r;
    };
    const SUBMIT = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/submit', { token: tok(role), params: { id } });
    const ACCEPT = (id: string, role: Who = 'cc') => http.call('POST /api/quotation-requests/{id}/accept', { token: tok(role), params: { id } });
    const CANCEL = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/cancel', { token: tok(role), params: { id }, json: { reason } });
    const RESTORE = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/restore', { token: tok(role), params: { id } });
    const DEL = (id: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}', { token: tok(role), params: { id } });
    const PUT = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/quotation-requests/{id}', { token: tok(role), params: { id }, json });
    const AUTO = (id: string, role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''} ${h.description ?? ''}`;
    const notesFor = async (role: Who, subjectId: string) => { const n = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return (Array.isArray(n) ? n : items(n)).filter((x: any) => x.subjectId === subjectId); };
    const list = async (query: Record<string, unknown>, role: Who = 'k1') => items(await data(await http.call('GET /api/quotation-requests', { token: tok(role), query: { page: 1, perPage: 100, ...query } })));
    const awaiting = async (o: { role?: 'k1' | 'k1b'; services?: ServiceKey[]; body?: Record<string, unknown> } = {}) => mk({ ...o, submit: true });
    const inPricing = async () => { const r = await awaiting(); await must(await ACCEPT(r.id), 'Định giá tiếp nhận YCBG'); return GET(r.id); };
    /** YCBG bị Định giá từ chối (PRICING_DECLINED). */
    const declined = async () => {
      const r = await inPricing();
      await must(await http.call('POST /api/quotation-requests/{id}/internal-quote/decline', { token: tok('cc'), params: { id: r.id }, json: { reason: 'Thiếu thông tin chi cục và loại xe' } }), 'Định giá từ chối báo giá');
      const d = await GET(r.id);
      if (d.status !== 'PRICING_DECLINED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau từ chối ở ${d.status}`);
      return d;
    };
    /** YCBG Đã có báo giá (BGNB P0 đã phát hành). */
    const priced = async () => {
      const base = await p0Base(testRun);
      const r = await inPricing();
      const map: SspMap = {};
      for (const it of P0_ITEMS.filter((i) => i.inQuote)) map[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
      const iq = await createInternalQuote(testRun, r.id, map, 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      const d = await GET(r.id);
      if (d.status !== 'PRICED') throw new Error(`Chuẩn bị dữ liệu thất bại: YCBG sau phát hành BGNB ở ${d.status}`);
      return d;
    };
    const docsOf = async (id: string, svc: ServiceKey = 'KHQ', role: Who = 'k1') => ((await GET(id, role)).services ?? []).find((s: any) => s.serviceTypeCode === refs.services[svc])?.documents ?? [];
    const UPLOAD = (id: string, file: any, svc: ServiceKey = 'KHQ', role: Who = 'k1') => http.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', { token: tok(role), params: { id, serviceTypeCode: refs.services[svc] }, multipart: file === undefined ? {} : { file } });
    const DOC = (id: string, documentId: string, role: Who = 'k1') => http.call('GET /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const DELDOC = (id: string, documentId: string, role: Who = 'k1') => http.call('DELETE /api/quotation-requests/{id}/documents/{documentId}', { token: tok(role), params: { id, documentId } });
    const fullBody = async (o: Record<string, unknown> = {}) => rfqBody(testRun, o);
    const meName = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return [me?.fullName, me?.name, me?.displayName, me?.email].filter(Boolean).map(String); };
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const r = await mk();
    const res = await UPLOAD(r.id, undefined);
    expectStatusIn(res, '400/422');
    expect(res.status(), 'Không 5xx').toBeLessThan(500);
    expect(await docsOf(r.id), 'Không tạo bản ghi rỗng').toHaveLength(0);

  });
});
