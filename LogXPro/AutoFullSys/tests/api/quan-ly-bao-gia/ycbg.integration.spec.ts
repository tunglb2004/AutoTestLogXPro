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
  test("RFQ-127 File 20MB qua, 21MB bị chặn", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    expectStatusIn(await UPLOAD(r.id, REAL.pdf20()), '200/201', '20MB');
    expectStatusIn(await UPLOAD(r.id, REAL.pdf21()), '400/413/422', '21MB');
    expect(await docsOf(r.id), 'Chỉ file 20MB được lưu').toHaveLength(1);

  });

  test("RFQ-128 Sai định dạng", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    for (const f of [REAL.other('exe'), REAL.other('mp4'), REAL.xlsx10()]) expectStatusIn(await UPLOAD(r.id, f), '400/415/422', f.name);
    expect(await docsOf(r.id), 'Chỉ nhận PDF, DOCX').toHaveLength(0);

  });

  test("RFQ-129 File 0 byte và file exe đổi đuôi pdf", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const exe = REAL.other('exe');
    expectStatusIn(await UPLOAD(r.id, { name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) }), '400/422', 'file 0 byte');
    expectStatusIn(await UPLOAD(r.id, { name: 'b.pdf', mimeType: 'application/pdf', buffer: exe.buffer }), '400/422', 'exe đổi đuôi pdf');
    expect(await docsOf(r.id), 'Bị chặn theo nội dung').toHaveLength(0);

  });

  test("RFQ-098 Nội dung file trùng khớp", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    expect(sha256(await res.body()), 'Hash trùng file gốc').toBe(sha256(file.buffer));
    expect(res.headers()['content-type'] ?? '').toMatch(/application\/pdf/);

  });

  test("RFQ-148 Chứng từ YCBG đúng 20MB − 1 byte, 20MB, 20MB + 1 byte", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const MB20 = 20_971_520;
    for (const [n, set] of [[MB20 - 1, '200/201'], [MB20, '200/201'], [MB20 + 1, '400/413/422']] as [number, string][]) expectStatusIn(await UPLOAD(r.id, fileOfSize(`chung-tu-${n}.pdf`, n)), set, `${n} byte`);
    expect(await docsOf(r.id), 'Chỉ file vượt 1 byte bị chặn').toHaveLength(2);

  });
});
