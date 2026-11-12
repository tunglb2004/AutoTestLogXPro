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
import * as F_quan_ly_bao_gia_bgnb from '../../../src/quan-ly-bao-gia/data/bgnb.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Báo giá nội bộ (BGNB) và lập báo giá theo YCBG", () => {
  test("IPS-005 `page` sai kiểu dữ liệu", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/internal-quotes";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, query: { ...p.query, "page": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("IPS-006 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/internal-quotes";
    const p = await testRun.prepare(API, "cc");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(list.length, "perPage=1 trả đúng 1 phần tử").toBe(1);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("IPS-017 Thiếu trường bắt buộc `quotationRequestId`", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_quan_ly_bao_gia_bgnb.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["name"] = marker;
    delete payload["quotationRequestId"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "quotationRequestId");
    expect(await testRun.listContains("GET /api/internal-quotes", marker, "cc", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("IPS-018 `currency` ngoài danh sách cho phép", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_quan_ly_bao_gia_bgnb.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["name"] = marker;
    payload["currency"] = "XYZ";
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "currency");
    expect(await testRun.listContains("GET /api/internal-quotes", marker, "cc", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("IPS-019 `quotationRequestId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes";
    const p = await testRun.prepare(API, "cc");
    const marker = tagged("AT Không lưu");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_quan_ly_bao_gia_bgnb.bodies[API](), "quotationRequestId": value };
      payload["name"] = marker;
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.listContains("GET /api/internal-quotes", marker, "cc", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("IPS-020 `name` dài 254, 255 và 256 ký tự", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const seed = 'Báo giá nội bộ dịch vụ logistics trọn gói cửa khẩu Hữu Nghị ';
    for (const [n, set] of [[254, '200/201'], [255, '200/201'], [256, '400/422']] as [number, string][]) {
      const rfq = await rfqInPricing(testRun, 'cc');
      const name = textOfLength(n, seed);
      const res = await POSTIQ(await internalQuoteBody(testRun, rfq.id, mapOf(base), { name }));
      expectStatusIn(res, set, `${n} ký tự`);
      const got = await byRfq(rfq.id);
      if (set === '200/201') {
        const iq = await IQ((await data(got)).id);
        testRun.track(`BGNB ${iq.code}`, () => http.call('DELETE /api/internal-quotes/{id}', { token: tok('cc'), params: { id: iq.id } }));
        expect(iq.name, `${n} ký tự đọc lại nguyên văn`).toBe(name);
      } else {
        expectOnlyFieldError(await expectApiError(res), 'name');
        expect(got.ok(), 'Không tạo, YCBG giữ trạng thái cũ').toBe(false);
        expect((await RFQ(rfq.id, 'cc')).status).toBe('PRICING_IN_PROGRESS');
      }
    }

  });

  test("IPS-051 Thiếu trường bắt buộc `quotationRequestId`", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/internal-quotes/{id}";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_quan_ly_bao_gia_bgnb.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["name"] = marker;
    delete payload["quotationRequestId"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "quotationRequestId");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-052 `currency` ngoài danh sách cho phép", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/internal-quotes/{id}";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_quan_ly_bao_gia_bgnb.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["name"] = marker;
    payload["currency"] = "XYZ";
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "currency");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-053 `quotationRequestId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/internal-quotes/{id}";
    const p = await testRun.prepare(API, "cc");
    const marker = tagged("AT Không lưu");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_quan_ly_bao_gia_bgnb.bodies[API](), "quotationRequestId": value };
      payload["name"] = marker;
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-054 `name` dài 254, 255 và 256 ký tự", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const seed = 'Báo giá nội bộ tuyến Hữu Nghị Hà Nội cho khách hàng chiến lược ';
    let last = x.iq.name;
    for (const [n, set] of [[254, '200/204'], [255, '200/204'], [256, '400/422']] as [number, string][]) {
      const name = textOfLength(n, seed);
      const res = await PUTIQ(x.iq.id, putBody(await IQ(x.iq.id), { name }));
      expectStatusIn(res, set, `${n} ký tự`);
      if (set !== '400/422') last = name;
      else expectOnlyFieldError(await expectApiError(res), 'name');
      expect((await IQ(x.iq.id)).name, set !== '400/422' ? `${n} ký tự đọc lại nguyên văn` : 'Giữ tên trước').toBe(last);
    }

  });

  test("IPS-064 Thiếu tham số bắt buộc `query`", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/{id}/history";
    const p = await testRun.prepare(API, "cc");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["query"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("IPS-065 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/internal-quotes/{id}/history";
    const p = await testRun.prepare(API, "cc");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(list.length, "perPage=1 trả đúng 1 phần tử").toBe(1);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("IPS-082 Thiếu trường bắt buộc `reason`", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes/{id}/withdraw";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_quan_ly_bao_gia_bgnb.bodies[API]();
    delete payload["reason"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "reason");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-083 `reason` dài 499, 500 và 501 ký tự", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const seed = 'Định giá thu hồi để cập nhật giá mua mới của nhà thầu vận tải ';
    for (const [n, set] of [[499, '200/204'], [500, '200/204'], [501, '400/422']] as [number, string][]) {
      const x = await issuedIQ();
      const v = textOfLength(n, seed);
      const h0 = (await HIST(x.iq.id)).length;
      const res = await WITHDRAW(x.iq.id, v);
      expectStatusIn(res, set, `${n} ký tự`);
      if (set === '200/204') expect(JSON.stringify(await HIST(x.iq.id)), `${n} ký tự lưu nguyên văn`).toContain(v);
      else {
        expectOnlyFieldError(await expectApiError(res), 'reason');
        expect(isIssued(await IQ(x.iq.id)), 'Giữ trạng thái cũ').toBe(true);
        expect((await HIST(x.iq.id)).length, 'Không ghi lịch sử').toBe(h0);
      }
    }

  });

  test("IPS-114 Thiếu trường bắt buộc `validFrom`", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/quotation-requests/{id}/internal-quote";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_quan_ly_bao_gia_bgnb.bodies[API]();
    delete payload["validFrom"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "validFrom");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-115 `lines[].unitPrice` 1 / 0 / âm", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    expectStatusIn(await PUTRQ({ ...validBody, lines: p0Lines.map((l: any, i: number) => (i === 0 ? { ...l, unitPrice: 1 } : l)) }), '200/204', 'đơn giá 1');
    const after1 = stable(await data(await byRfq(r.id)));
    for (const v of [0, -1]) {
      const res = await PUTRQ({ ...validBody, lines: p0Lines.map((l: any, i: number) => (i === 0 ? { ...l, unitPrice: v } : { ...l, unitPrice: l.unitPrice + 5_000 })) });
      expectStatusIn(res, '400/422', `đơn giá ${v}`);
      expect(stable(await data(await byRfq(r.id))), 'Không lưu dòng nào').toEqual(after1);
    }

  });

  test("IPS-123 Thiếu trường bắt buộc `reason`", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/quotation-requests/{id}/internal-quote/decline";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_quan_ly_bao_gia_bgnb.bodies[API]();
    delete payload["reason"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "reason");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-124 `reason` dài 499, 500 và 501 ký tự", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const seed = 'Yêu cầu bổ sung thông tin hàng hóa và chứng từ trước khi báo giá ';
    for (const [n, set] of [[499, '200/204'], [500, '200/204'], [501, '400/422']] as [number, string][]) {
      const r = await createRfq(testRun, { submit: true });
      const v = textOfLength(n, seed);
      const res = await DECLINE(r.id, v);
      expectStatusIn(res, set, `${n} ký tự`);
      const d = await RFQ(r.id);
      if (set === '200/204') expect(d.declineReason, `${n} ký tự đọc lại nguyên văn`).toBe(v);
      else {
        expectOnlyFieldError(await expectApiError(res), 'reason');
        expect(d.status, 'Giữ trạng thái cũ').toBe('AWAITING_PRICING');
      }
    }

  });

  test("IPS-008 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-022 Body JSON hỏng cú pháp", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("IPS-027 Thiếu tham số bắt buộc `priceConfigurationItemId`", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/benchmark-lines";
    const p = await testRun.prepare(API, "cc");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["priceConfigurationItemId"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("IPS-029 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/benchmark-lines";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-032 `limit` sai kiểu dữ liệu", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/selectable-requests";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, query: { ...p.query, "limit": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("IPS-034 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/selectable-requests";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-036 Thiếu tham số bắt buộc `quotationRequestId`", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/sheet-options";
    const p = await testRun.prepare(API, "cc");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["quotationRequestId"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("IPS-038 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/sheet-options";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-041 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/stats";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-043 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/{id}";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-045 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/{id}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-056 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/internal-quotes/{id}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{ json: F_quan_ly_bao_gia_bgnb.bodies["PUT /api/internal-quotes/{id}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-060 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/internal-quotes/{id}";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-062 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/internal-quotes/{id}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-067 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/internal-quotes/{id}/history";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-074 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes/{id}/issue";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-076 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes/{id}/issue";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-085 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes/{id}/withdraw";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{ json: F_quan_ly_bao_gia_bgnb.bodies["POST /api/internal-quotes/{id}/withdraw"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-092 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes/{id}/sync-standard-prices";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-094 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/internal-quotes/{id}/sync-standard-prices";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-098 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/quotation-requests/{id}/internal-quote";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-100 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/quotation-requests/{id}/internal-quote";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-105 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/quotation-requests/{id}/internal-quote";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
  });

  test("IPS-107 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/quotation-requests/{id}/internal-quote";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-117 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/quotation-requests/{id}/internal-quote";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{ json: F_quan_ly_bao_gia_bgnb.bodies["PUT /api/quotation-requests/{id}/internal-quote"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-126 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/quotation-requests/{id}/internal-quote/decline";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{ json: F_quan_ly_bao_gia_bgnb.bodies["POST /api/quotation-requests/{id}/internal-quote/decline"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("IPS-133 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/quotation-requests/{id}/internal-quote/issue";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("IPS-135 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/quotation-requests/{id}/internal-quote/issue";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
