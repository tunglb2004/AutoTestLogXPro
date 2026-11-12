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

test.describe("Yêu cầu báo giá (YCBG/RFQ)", () => {
  test("RFQ-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/quotation-requests", "POST /api/quotation-requests", "GET /api/quotation-requests/statuses", "GET /api/quotation-requests/internal-quote-stats", "GET /api/quotation-requests/{id}", "PUT /api/quotation-requests/{id}", "DELETE /api/quotation-requests/{id}", "POST /api/quotation-requests/{id}/submit", "POST /api/quotation-requests/{id}/accept", "POST /api/quotation-requests/{id}/auto-internal-quote", "POST /api/quotation-requests/{id}/cancel", "GET /api/quotation-requests/{id}/documents/{documentId}", "DELETE /api/quotation-requests/{id}/documents/{documentId}", "GET /api/quotation-requests/{id}/history", "POST /api/quotation-requests/{id}/restore", "POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents"];
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

  test("RFQ-003 K1 không thấy YCBG khách người khác", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const b = await mk({ role: 'k1b', body: await rfqBody(testRun, { customerId: env.ref('CUSTOMER_B_ID') }) });
    const res = await http.call('GET /api/quotation-requests', { token: tok('k1'), query: { search: b.code } });
    expectStatusIn(res, '200');
    expect(items(await data(res)), 'Danh sách rỗng').toHaveLength(0);

  });

  test("RFQ-015 Tạo YCBG cho khách không phụ trách", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const res = await http.call('POST /api/quotation-requests', { token: tok('k1b'), query: { submit: false }, json: await fullBody() });
    expectStatusIn(res, '400/403');
    await expectApiError(res);

  });

  test("RFQ-017 Ghi chú chứa script", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const note = '<script>alert(1)</script>';
    const r = await mk({ body: await fullBody({ generalNote: note }) });
    expect((await GET(r.id)).generalNote, 'Trả nguyên văn dạng text').toBe(note);

  });

  test("RFQ-033 Mở YCBG khách người khác bằng id", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/quotation-requests/{id}', { token: tok('k1b'), params: { id: r.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("RFQ-040 K1B sửa YCBG của KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const before = stable(await GET(r.id));
    const res = await PUT(r.id, await fullBody({ generalNote: 'K1B sửa' }), 'k1b');
    expectStatusIn(res, '403/404');
    expect(stable(await GET(r.id)), 'Không đổi').toEqual(before);

  });

  test("RFQ-052 K1B xóa YCBG KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await DEL(r.id, 'k1b');
    expectStatusIn(res, '403/404');
    expect((await GET(r.id)).id, 'YCBG còn').toBe(r.id);

  });

  test("RFQ-060 K1B gửi YCBG KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await SUBMIT(r.id, 'k1b');
    expectStatusIn(res, '403/404');
    expect((await GET(r.id)).status, 'Giữ DRAFT').toBe('DRAFT');

  });

  test("RFQ-081 K1B lấy tự động cho YCBG KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await AUTO(r.id, 'k1b');
    expectStatusIn(res, '403/404');
    expect((await GET(r.id)).internalQuote ?? null, 'Không tạo').toBeNull();

  });

  test("RFQ-090 K1B hủy YCBG KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await CANCEL(r.id, 'K1B hủy', 'k1b');
    expectStatusIn(res, '403/404');
    expect((await GET(r.id)).status, 'Giữ trạng thái').toBe('AWAITING_PRICING');

  });

  test("RFQ-099 `documentId` của YCBG khác", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const other = await mk();
    const res = await DOC(other.id, doc.id);
    expectStatusIn(res, '403/404');
    expect((res.headers()['content-type'] ?? '').includes('pdf'), 'Không trả file').toBe(false);

  });

  test("RFQ-105 K1B gỡ chứng từ YCBG KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const res = await DELDOC(r.id, doc.id, 'k1b');
    expectStatusIn(res, '403/404');
    expect((await docsOf(r.id)).some((d: any) => d.id === doc.id), 'Chứng từ còn').toBe(true);

  });

  test("RFQ-111 K1B đọc lịch sử YCBG KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await http.call('GET /api/quotation-requests/{id}/history', { token: tok('k1b'), params: { id: r.id }, query: { page: 1 } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("RFQ-120 K1B khôi phục YCBG KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await RESTORE(r.id, 'k1b');
    expectStatusIn(res, '403/404');
    expect((await GET(r.id)).status, 'Giữ trạng thái').toBe('PRICING_DECLINED');

  });

  test("RFQ-131 K1B tải lên YCBG KH_A", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await UPLOAD(r.id, samplePdf('k1b.pdf'), 'KHQ', 'k1b');
    expectStatusIn(res, '403/404');
    expect(await docsOf(r.id), 'Không lưu').toHaveLength(0);

  });
});
