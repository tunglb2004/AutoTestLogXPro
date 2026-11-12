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
import * as R_quan_ly_bao_gia_bgkh from '../../../src/quan-ly-bao-gia/api/schemas/bgkh.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Báo giá khách hàng (BGKH/RC)", () => {
  test("RC-009 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await pricedRfq();
    const res = await http.call('POST /api/quotation-requests/{id}/customer-quotation', { token: tok('k1'), params: { id: x.rfq.id } });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RC-017 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/customer-quotations";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_bgkh.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "supplementary", "hasPendingSupplement", "customerId", "customerName", "status", "validFrom", "validTo", "currency", "total", "serviceTypeCodes", "isDefault", "createdAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("RC-020 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/customer-quotations/statuses";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_bgkh.responses[API].data!.safeParse(b.data);
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

  test("RC-025 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/customer-quotations/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_bgkh.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "code", "supplementary", "hasPendingSupplement", "customerId", "customerName", "customerTaxCode", "quotationRequestId", "quotationRequestCode", "status", "validFrom", "validTo", "currency", "fxRate", "vatBand", "vatRate"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("RC-035 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await SETTINGS(x.cq.id, { currency: 'VND', vatBand: 'VAT_8' });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RC-046 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await PRICES(x.cq.id, { lines: [{ lineId: line(x.cq, 'Phí khai báo').id, sellPrice: 1_150_000 }] });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RC-058 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await MERGE(x.cq.id, khqMerge(x.cq));
    expectStatusIn(res, '200/201');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RC-066 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
    const c0 = await CQ(x.cq.id);
    await must(await MERGE(x.cq.id, khqMerge(c0)), 'gộp nhóm KHQ');
    await must(await MERGE(x.cq.id, { displayName: 'Trọn gói Hải quan giám sát và Kho bãi', unitCode: refs.units.supervision, lineIds: [line(c0, 'Phí giám sát').id, line(c0, 'Phí lưu kho').id] }), 'gộp nhóm thứ 2');
    const cur = await CQ(x.cq.id);
    const gKhq = cur.mergedGroups.find((g: any) => g.displayName === 'Trọn gói khai báo hải quan');

    const res = await UNMERGE(x.cq.id, gKhq.id);
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RC-073 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
    const c0 = await CQ(x.cq.id);
    await must(await MERGE(x.cq.id, khqMerge(c0)), 'gộp nhóm KHQ');
    await must(await MERGE(x.cq.id, { displayName: 'Trọn gói Hải quan giám sát và Kho bãi', unitCode: refs.units.supervision, lineIds: [line(c0, 'Phí giám sát').id, line(c0, 'Phí lưu kho').id] }), 'gộp nhóm thứ 2');
    const cur = await CQ(x.cq.id);
    const gKhq = cur.mergedGroups.find((g: any) => g.displayName === 'Trọn gói khai báo hải quan');

    const res = await RESET(x.cq.id);
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RC-084 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await CONFIRM(x.cq.id);
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RC-094 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RC-105 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const res = await DEACT(x.cq.id, 'Khách ngừng hợp tác tuyến');
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("RC-114 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
        const b = await body(res);
        for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
        for (const k of ['id', 'code', 'supplementary', 'hasPendingSupplement', 'customerId', 'customerName', 'customerTaxCode', 'quotationRequestId', 'status', 'currency', 'fxRate', 'vatBand', 'vatRate', 'subtotal', 'vatAmount', 'total', 'isDefault', 'lines']) expect(b.data, `data có ${k}`).toHaveProperty(k);

      } finally {
        for (const id of made) { const d = await CQ(id); if (d?.status === 'ACTIVE') await DEACT(id, 'Trả KH_E về trạng thái chưa có báo giá mặc định'); }
      }
    });

  });

  test("RC-121 Đúng loại phản hồi và nội dung", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const own = await buildP0(testRun, `C121${TEST_RUN_ID}`, { quote: false });

    const x = await pending({ base: own });
    await must(await MERGE(x.cq.id, khqMerge(x.cq)), 'gộp nhóm KHQ');
    await confirmQuotation(testRun, x.cq.id);
    await setSelling(testRun, own.ssp.storage!, 700_000);
    const cq = await CQ(x.cq.id);
    const EXP = (format: 'PDF' | 'EXCEL', role: Who = 'k1') => http.call('GET /api/customer-quotations/{id}/export', { token: tok(role), params: { id: x.cq.id }, query: { format } });

    const pdf = await EXP('PDF');
    expectStatusIn(pdf, '200', 'PDF');
    expect(pdf.headers()['content-type'] ?? '').toMatch(/application\/pdf/);
    const pbuf = await pdf.body();
    expect((pbuf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length, 'Số trang > 0').toBeGreaterThan(0);
    const xl = await EXP('EXCEL');
    expectStatusIn(xl, '200', 'EXCEL');
    const x2 = await readXlsx(await xl.body());
    expect(JSON.stringify(x2.rows), 'Chứa mã RC').toContain(cq.code);
    expect(numbersIn(x2.rows), 'Tổng khớp chi tiết').toContain(Number(cq.total));

  });

  test("RC-127 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/customer-quotations/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_bgkh.responses[API].data!.safeParse(b.data);
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

  test("RC-133 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/customer-quotations/{id}/versions";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_ly_bao_gia_bgkh.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "version", "code", "quotationRequestId", "quotationRequestCode", "status", "decidedBy", "decidedAt", "current", "viewable"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
  });

  test("RC-138 Đúng loại phản hồi và nội dung", { tag: ["@api", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    await must(await CONFIRM(s.cq.id), 'đồng ý bản bổ sung');

    const res = await http.call('GET /api/customer-quotations/{id}/versions/{version}', { token: tok('k1'), params: { id: root.cq.id, version: 1 } });
    expectStatusIn(res, '200');
    const d = await data(res);
    const snap = JSON.stringify(d);
    expect(snap, 'Mã RC').toContain(root.cq.code);
    expect(snap, 'Số phiên bản').toMatch(/"version(No)?":\s*"?1/);
    for (const n of ['Phí khai báo', 'Cước vận tải']) expect(snap, `Danh sách dòng có ${n}`).toContain(n);
    expect(snap, 'Tổng trước VAT tại thời điểm đó').toMatch(/15650000|15\.650\.000/);

  });
});
