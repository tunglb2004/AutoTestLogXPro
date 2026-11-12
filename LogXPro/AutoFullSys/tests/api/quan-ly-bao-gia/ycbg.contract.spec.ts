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
import * as R_quan_ly_bao_gia_ycbg from '../../../src/quan-ly-bao-gia/api/schemas/ycbg.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Yêu cầu báo giá (YCBG/RFQ)", () => {
  test("RFQ-008 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/quotation-requests";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_ycbg.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "supplementary", "customerId", "customerName", "status", "pricingOwnerName", "quoteDueAt", "serviceTypeCodes", "createdByName", "createdByRoleCodes", "createdAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("RFQ-023 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const b = await body(res);
    testRun.track(`YCBG ${b.data.code}`, () => DEL(b.data.id));
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'sourceQuotation', 'customerId', 'customerName', 'contractRef', 'contractId', 'quoteDueAt', 'currency', 'generalNote', 'borderGateCodes', 'transportMode', 'monthlyVolume', 'volumeUnitCode', 'serviceInfo', 'status', 'services']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RFQ-027 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/quotation-requests/statuses";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_ycbg.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["code", "name"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("RFQ-030 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/quotation-requests/internal-quote-stats";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_ycbg.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["total", "issued", "won", "winRate"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("RFQ-035 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/quotation-requests/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_ycbg.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "code", "supplementary", "sourceQuotation", "customerId", "customerName", "contractRef", "contractId", "quoteDueAt", "currency", "generalNote", "borderGateCodes", "transportMode", "monthlyVolume", "volumeUnitCode", "serviceInfo"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("RFQ-047 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await PUT(r.id, await twoRoutes());
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'sourceQuotation', 'customerId', 'customerName', 'contractRef', 'contractId', 'quoteDueAt', 'currency', 'generalNote', 'borderGateCodes', 'transportMode', 'monthlyVolume', 'volumeUnitCode', 'serviceInfo', 'status', 'services']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RFQ-055 Phản hồi thành công không có body", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("RFQ-063 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await SUBMIT(r.id);
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'sourceQuotation', 'customerId', 'customerName', 'contractRef', 'contractId', 'quoteDueAt', 'currency', 'generalNote', 'borderGateCodes', 'transportMode', 'monthlyVolume', 'volumeUnitCode', 'serviceInfo', 'status', 'services']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RFQ-072 Phản hồi thành công không có body", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await ACCEPT(r.id);
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("RFQ-084 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['mode', 'internalQuoteId', 'internalQuoteCode', 'message']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RFQ-094 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await CANCEL(r.id, 'Khách đổi kế hoạch');
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'sourceQuotation', 'customerId', 'customerName', 'contractRef', 'contractId', 'quoteDueAt', 'currency', 'generalNote', 'borderGateCodes', 'transportMode', 'monthlyVolume', 'volumeUnitCode', 'serviceInfo', 'status', 'services']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RFQ-101 Đúng loại phản hồi và nội dung", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    expect(res.headers()['content-type'] ?? '').toMatch(/pdf|octet-stream/);
    expect(res.headers()['content-disposition'] ?? '').toMatch(/filename/i);
    const buf = await res.body();
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 1).toString(), 'Không bọc JSON').not.toBe('{');
    expect(sha256(buf)).toBe(sha256(file.buffer));

  });

  test("RFQ-108 Phản hồi thành công không có body", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("RFQ-114 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/quotation-requests/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_ycbg.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "at", "actorUserId", "actorEmail", "actorName", "actorEmployeeCode", "action", "summary", "targetEntity", "targetId", "oldValue", "newValue", "event", "eventLabel"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("RFQ-123 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await RESTORE(r.id);
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'sourceQuotation', 'customerId', 'customerName', 'contractRef', 'contractId', 'quoteDueAt', 'currency', 'generalNote', 'borderGateCodes', 'transportMode', 'monthlyVolume', 'volumeUnitCode', 'serviceInfo', 'status', 'services']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RFQ-134 Cấu trúc phản hồi thành công", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await UPLOAD(r.id, REAL.pdf10());
    expectStatusIn(res, '200/201');
    const text = await res.text();
    expect(hasNoStacktrace(text)).toBe(true);
    const b = JSON.parse(text || '{}');
    expect(b.success).toBe(true);
    expect(b).toHaveProperty('message');
    expect(b.errorCode ?? null).toBeNull();
    expect(b).toHaveProperty('data');

  });
});
