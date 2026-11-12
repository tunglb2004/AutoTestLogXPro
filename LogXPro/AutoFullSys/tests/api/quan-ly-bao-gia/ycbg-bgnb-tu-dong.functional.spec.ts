import { runBackgroundRace, runEqualSpecificity, runThresholdCase } from '../../../src/quan-ly-bao-gia/data/remaining-quote-api.scenario';
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
import { createRfq, rfqBody, serviceEntry, getRfq, rfqInPricing, legOf } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import { p0Items } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';

import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Yêu cầu báo giá (YCBG/RFQ)", () => {
  test("RFQ-075 K1 lấy tự động BGNB từ giá bán định mức", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    await p0Base(testRun);
    const r = await mk();
    const res = await AUTO(r.id);
    expectStatusIn(res, '200/201');
    const a = await data(res);
    expect(a.mode, 'Trả ngay').toBe('SYNC');
    expect(a.internalQuoteCode, 'Có BGNB').toBeTruthy();
    const d = await GET(r.id);
    expect(d.status, 'YCBG → PRICED').toBe('PRICED');
    expect(String(d.internalQuote?.source ?? ''), 'Nguồn tạo = Tự động').toMatch(/AUTO|Tự động/i);
    expect(String(d.internalQuote?.issuedBy ?? ''), 'Người phát hành = Hệ thống').toMatch(/Hệ thống/i);
    expect(d.internalQuote?.validity, 'Đã phát hành').toBe('ACTIVE');

  });

  test("RFQ-076 51–200 tổ hợp chạy nền", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ testRun }) => {
    await expect(runThresholdCase("RFQ-076", testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("RFQ-077 Trên 200 tổ hợp bị chặn", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ testRun }) => {
    await expect(runThresholdCase("RFQ-077", testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("RFQ-078 Thiếu giá bán định mức toàn bộ", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const far = await testRun.pick('GET /api/catalogues/provinces', /Cà Mau/i, { countryCode: 'VN' });
    const vt = { ...serviceEntry(refs, 'VT'), routes: [{ pickup: { ...refs.origin }, delivery: { pointType: 'ADDRESS', countryCode: 'VN', provinceCode: far.code, placeName: 'Cảng Năm Căn' } }] };
    const r = await mk({ body: await rfqBody(testRun, { services: [vt] }, ['VT']) });
    const res = await AUTO(r.id);
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    const d = await GET(r.id);
    expect(d.internalQuote ?? null, 'Không tạo BGNB dở').toBeNull();
    expect(d.status).toBe('DRAFT');

  });

  test("RFQ-079 Một dịch vụ thiếu giá thì bảng đó disable", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    await p0Base(testRun);
    const it = await p0Items(testRun, `Q79${TEST_RUN_ID}`, 'k1', ['storage']);
    await ensureContractorLines(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [priceLine(refs, it, 'storage', 500_000)], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
    const r = await mk();
    const res = await AUTO(r.id);
    expectStatusIn(res, '200/201');
    const iq = (await GET(r.id)).internalQuote;
    const kb = (iq.sheets ?? []).filter((s: any) => s.serviceTypeCode === refs.services.KB);
    expect(kb.length, 'Có bảng KB').toBeGreaterThan(0);
    expect(kb.every((s: any) => s.disabled), 'Bảng KB disable').toBe(true);
    expect((iq.lines ?? []).some((l: any) => l.serviceTypeCode === refs.services.KB && (l.unitPrice == null || /Chưa có giá/i.test(String(l.priceGap?.label ?? '')))), 'Dòng "Chưa có giá định mức"').toBe(true);
    const enabled = new Set((iq.sheets ?? []).filter((s: any) => !s.disabled).map((s: any) => s.code));
    expect((iq.sheets ?? []).some((s: any) => s.serviceTypeCode !== refs.services.KB && !s.disabled), 'Các bảng khác khả dụng').toBe(true);
    const sum = (iq.lines ?? []).filter((l: any) => enabled.has(l.sheetCode)).reduce((s: number, l: any) => s + Number(l.unitPrice ?? 0), 0);
    expectMoney(iq.total, sum, 'Bảng KB không vào tổng');

  });

  test("RFQ-080 Gọi khi YCBG Đang báo giá", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await AUTO(r.id);
    expectStatusIn(res, '400/409/422');
    expect((await GET(r.id)).status).toBe('PRICING_IN_PROGRESS');

  });

  test("RFQ-137 Ngưỡng tổ hợp sau khử trùng: 49, 50, 51", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ testRun }) => {
    await expect(runThresholdCase("RFQ-137", testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("RFQ-138 Ngưỡng tổ hợp 199, 200, 201", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ testRun }) => {
    await expect(runThresholdCase("RFQ-138", testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("RFQ-139 Chọn dòng cụ thể trước \"Tất cả\", bỏ dòng SSP null", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    test.setTimeout(600_000);
    await p0Base(testRun);
    const tpl = await PF.allTransportTemplate(testRun);
    const it = await p0Items(testRun, `Q139${TEST_RUN_ID}`, 'k1', ['freight']);
    const other = (await testRun.catalog('GET /api/catalogues/transport-points')).find((x: any) => x.active !== false && x.code !== refs.originPoint && x.code !== refs.destinationPoint)?.code;
    if (!other) throw new Error('Chuẩn bị dữ liệu thất bại: danh mục cần thêm 1 điểm vận tải khác');
    const specific = priceLine(refs, it, 'freight', 9_500_000);
    const all = { priceConfigurationItemId: it.freight.id, unitCode: refs.units.freight, unitPrice: 9_000_000, destinationPointCodes: [refs.destinationPoint], vehicleTypeCodes: [refs.vehicleType], allAttributes: tpl.allAttributes };
    const nul = priceLine(refs, it, 'freight', 9_400_000, { originPointCodes: [other] });
    await ensureContractorLines(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [specific, all, nul], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
    const otherName = String((await testRun.catalog('GET /api/catalogues/transport-points')).find((x: any) => x.code === other)?.name ?? '#');
    const sbp = await sbpLines(testRun, it.freight.id);
    const isAll = (x: any) => /^Tất cả$/i.test(String(x.originPointName ?? ''));
    const sbpAll = sbp.find(isAll);
    const sbpSpec = sbp.find((x: any) => !isAll(x) && String(x.originPointName ?? '') !== otherName);
    if (!sbpSpec || !sbpAll) throw new Error('Chuẩn bị dữ liệu thất bại: chưa sinh đủ SBP cụ thể và "Tất cả"');
    await setBenchmark(testRun, sbpSpec.id, 9_500_000);
    await setBenchmark(testRun, sbpAll.id, 9_000_000);
    const sspSpec = (await sspLines(testRun, it.freight.id)).find((x: any) => x.standardBuyingPriceId === sbpSpec.id);
    const sspAll = (await sspLines(testRun, it.freight.id)).find((x: any) => x.standardBuyingPriceId === sbpAll.id);
    await setSelling(testRun, sspSpec.id, 11_000_000);
    await setSelling(testRun, sspAll.id, 10_500_000);
    const r = await mk({ services: ['VT'] });
    const res = await AUTO(r.id);
    expectStatusIn(res, '200/201');
    const iq = await data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(res)).internalQuoteId } }));
    const line = (iq.tables ?? []).flatMap((t: any) => t.lines ?? []).find((l: any) => l.itemId === it.freight.id);
    expect(line, 'Có dòng Cước vận tải riêng của case').toBeTruthy();
    expect(line.standardSellingPriceId, 'Gắn SSP Điểm đi = Hữu Nghị (độ đặc hiệu cao hơn)').toBe(sspSpec.id);
    expectMoney(line.unitPrice, 11_000_000, 'Đơn giá 11.000.000');

  });

  test("RFQ-140 Hai dòng cùng độ đặc hiệu", { tag: ["@api", "@quan-ly-bao-gia", "@p3", "@cho-xac-nhan"] }, async ({ testRun }) => {
    await expect(runEqualSpecificity(testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("RFQ-141 YCBG bị sửa/hủy khi job nền đang chạy", { tag: ["@api", "@quan-ly-bao-gia", "@p2", "@cho-xac-nhan"] }, async ({ testRun }) => {
    await expect(runBackgroundRace(testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("RFQ-142 Tạo tự động giữ cặp tuyến, không sinh tổ hợp chéo", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    await p0Base(testRun);
    const ttGate = await testRun.pick('GET /api/catalogues/border-gates', /Tân Thanh/i);
    const ttPoint = await testRun.pick('GET /api/catalogues/transport-points', /Tân Thanh/i);
    const bnPoint = await testRun.pick('GET /api/catalogues/transport-points', /Bắc Ninh|Quế Võ/i);
    const addressOf = (point: any) => {
      const ward = (point.wards ?? []).find((item: any) => item.active !== false && item.code);
      expect(point.province?.code, `Điểm vận tải ${point.name} có tỉnh`).toBeTruthy();
      expect(ward?.code, `Điểm vận tải ${point.name} có xã/phường`).toBeTruthy();
      return { pointType: 'ADDRESS', countryCode: point.country?.code ?? 'VN', provinceCode: point.province.code, wardCode: ward.code, placeName: point.name };
    };
    const legOfPoints = (origin: any, destination: any) => {
      const address = (point: any) => {
        const place = addressOf(point);
        const ward = (point.wards ?? []).find((item: any) => item.code === place.wardCode);
        return { countryCode: place.countryCode, countryName: point.country?.name ?? 'Việt Nam', provinceCode: place.provinceCode, provinceName: point.province.name, wardCode: place.wardCode, wardName: ward.name };
      };
      return { originKind: 'ADDRESS', originAddress: address(origin), destinationKind: 'ADDRESS', destinationAddress: address(destination) };
    };
    const vt = { ...serviceEntry(refs, 'VT'), routes: [{ pickup: { ...refs.origin }, delivery: { ...refs.destination } }, { pickup: addressOf(ttPoint), delivery: addressOf(bnPoint) }] };
    const r = await mk({ body: await rfqBody(testRun, {
      services: [vt],
      borderGateCodes: [refs.borderGate, ttGate.code],
      transportLegs: [legOf(refs), legOfPoints(ttPoint, bnPoint)],
    }, ['VT']) });
    const res = await AUTO(r.id);
    expectStatusIn(res, '200/201');
    const sheets = ((await GET(r.id)).internalQuote?.sheets ?? []).filter((s: any) => s.serviceTypeCode === refs.services.VT);
    const pair = (s: any) => `${s.attributes?.originPoint?.name ?? ''} → ${s.attributes?.destinationPoint?.name ?? ''}`;
    const pairs = sheets.map(pair);
    expect(sheets, `Đúng 2 bảng VT (${pairs.join(' | ')})`).toHaveLength(2);
    expect(pairs.some((p: string) => /Hữu Nghị.*→.*Bắc Ninh/i.test(p)), 'Không có Hữu Nghị → Bắc Ninh').toBe(false);
    expect(pairs.some((p: string) => /Tân Thanh.*→.*Hà Nội/i.test(p)), 'Không có Tân Thanh → Hà Nội').toBe(false);

  });

  test("RFQ-082 Đơn giá = SSP, lợi nhuận đúng công thức", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const r = await mk();
    const res = await AUTO(r.id);
    expectStatusIn(res, '200/201');
    const link = (await GET(r.id)).internalQuote;
    const iq = await must(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: link.id } }), 'đọc chi tiết BGNB tự động');
    const lines = iq.tables.filter((t: any) => t.disabled === false).flatMap((t: any) => t.lines);
    for (const p of P0_ITEMS.filter((i) => i.inQuote)) {
      const l = lines.find((x: any) => x.itemId === base.items[p.key].id);
      expect(l, `Có dòng ${p.name}`).toBeTruthy();
      expectMoney(l.unitPrice, p.ssp!, `${p.name}: Đơn giá = SSP`);
    }
    const expected = await expectedQuotePrices(testRun, lines.map((line: any) => ({ standardSellingPriceId: line.standardSellingPriceId })));
    for (const line of lines) {
      expectMoney(line.unitPrice, expected.prices.get(line.standardSellingPriceId)!.sellingPrice, `${line.itemName}: Đơn giá = SSP`);
    }
    expectMoney(iq.total, expected.sell, 'Tổng đơn giá');
    expectPercent(iq.expectedProfitPercent, expected.profitPercent, 2, 'Lợi nhuận dự kiến');

  });
});
