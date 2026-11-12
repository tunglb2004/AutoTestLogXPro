/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { buildP0, p0Base, p0Order, createOrder, orderBody, getOrder, revenueOf, revenueTable, extraQuote, rejectOrder, runService, addSealCost, orderDocs, uploadOrderDoc, vehicleDocs, uploadVehicleDoc, scopeRequestOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { costs, costLines, uploadActualDoc } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { pnl, setOrderFx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as R_phieu_dich_vu_phieu_dich_vu from '../../../src/phieu-dich-vu/api/schemas/phieu-dich-vu.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Phiếu dịch vụ (Khối 1)", () => {
  test("ORD-005 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/selectable-customers";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "customerCode", "companyName", "contracts", "quotations"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ORD-008 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/statuses";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
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

  test("ORD-016 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "customerId", "customerName", "serviceTypeCodes", "pickupPlateNo", "deliveryPlateNo", "status", "createdAt", "totalCost", "totalRevenue"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ORD-032 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: await orderBody(testRun, base) });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'status']) expect(b.data, `data có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses['POST /api/service-orders'].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);

  });

  test("ORD-039 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "code", "status", "statusLabel", "progress", "customerId", "customerName", "customerContractId", "customerContractCode", "customerQuotationId", "customerQuotationCode", "customerRef", "tradeTypeCode", "tradeTypeName", "borderGateCode", "borderGateName"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("ORD-050 Cấu trúc phản hồi thành công", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: await orderBody(testRun, base, { generalNote: 'Đổi ghi chú', weight: 15000 }) });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(hasNoStacktrace(text), 'Không lộ stack trace').toBe(true);
    if (text) {
      const b = JSON.parse(text);
      expect(b.success).toBe(true);
      expect(b).toHaveProperty('message');
      expect(b.errorCode ?? null).toBeNull();
      expect(b).toHaveProperty('data');
    }

  });

  test("ORD-058 Phản hồi thành công không có body", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('DELETE /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    if (res.status() === 204) expect(text, 'Body rỗng').toBe('');
    else expect(text === '' || JSON.parse(text).data == null, 'Body rỗng hoặc data null').toBe(true);

  });

  test("ORD-066 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'status']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ORD-078 Cấu trúc phản hồi thành công", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Khách hủy lô hàng' } });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(hasNoStacktrace(text), 'Không lộ stack trace').toBe(true);
    if (res.status() !== 204) {
      const b = JSON.parse(text);
      expect(b.success).toBe(true);
      expect(b).toHaveProperty('message');
      expect(b.errorCode ?? null).toBeNull();
      expect(b).toHaveProperty('data');
    }

  });

  test("ORD-087 Cấu trúc phản hồi thành công", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await rejectOrder(testRun, o.id);
    const res = await http.call('POST /api/service-orders/{id}/restore', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(hasNoStacktrace(text), 'Không lộ stack trace').toBe(true);
    if (res.status() !== 204) {
      const b = JSON.parse(text);
      expect(b.success).toBe(true);
      expect(b).toHaveProperty('message');
      expect(b.errorCode ?? null).toBeNull();
      expect(b).toHaveProperty('data');
    }

  });

  test("ORD-097 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/revenue";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["serviceTypeCode", "serviceTypeName", "routeIndex", "matched", "sheetName", "sheetCode", "unmatchedReason", "matchedAttributes", "currency", "fxRate", "fxRateOverridden", "fxSource", "fxSourceLabel", "vcbUnavailable"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ORD-107 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = await extraQuote(testRun, { currency: 'USD', fxRate: 25_000 });
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, { customerId: q.base.customerId, rcId: q.rcId }, { submit: true });
    const VT = refs.services.VT;

    const res = await http.call('PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: VT }, json: { source: 'MANUAL', fxRate: 25_000 } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    expect(Array.isArray(b.data.items), 'data.items là mảng').toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    const row = b.data.items[0];
    for (const k of ['serviceTypeCode', 'serviceTypeName', 'routeIndex', 'matched', 'sheetName', 'sheetCode', 'unmatchedReason', 'matchedAttributes', 'currency', 'fxRate', 'fxRateOverridden', 'fxSource', 'fxSourceLabel', 'vcbUnavailable']) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses['PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}'].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const [k, v] of Object.entries(row)) if (/total|amount|price/i.test(k) && v !== null && typeof v !== 'object') expect(typeof v, `${k} là số`).toBe('number');

  });

  test("ORD-119 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;
    const shift = () => revenueOf(testRun, o.id).then((ts) => (revenueTable(ts, KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId));
    const edit = (lines: unknown[], role: 'k1' | 'k1b' = 'k1') => http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok(role), params: { id: o.id, serviceTypeCode: KHQ }, json: { lines } });

    const s = await shift();
    const res = await edit([{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }]);
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    expect(Array.isArray(b.data.items), 'data.items là mảng').toBe(true);
    if (b.data.meta?.pagination) expect(b.data.meta.pagination).toHaveProperty("total");
    const row = b.data.items[0];
    for (const k of ['serviceTypeCode', 'serviceTypeName', 'routeIndex', 'matched', 'sheetName', 'sheetCode', 'unmatchedReason', 'matchedAttributes', 'currency', 'fxRate', 'fxRateOverridden', 'fxSource', 'fxSourceLabel', 'vcbUnavailable']) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses['PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines'].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);

  });

  test("ORD-126 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/cost-revenue-summary";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["serviceOrderId", "code", "totalCost", "totalRevenue", "legs"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("ORD-133 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/revenue-confirmation";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["serviceOrderId", "code", "customerName", "status", "statusLabel", "services", "total", "vatAmount", "grandTotal", "blockers", "confirmable", "confirmedAt"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("ORD-142 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED');
    const res = await http.call('POST /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['serviceOrderId', 'code', 'customerName', 'status', 'statusLabel', 'services', 'total', 'vatAmount', 'grandTotal', 'blockers', 'confirmable', 'confirmedAt']) expect(b.data, `data có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses['POST /api/service-orders/{id}/revenue-confirmation'].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);

  });

  test("ORD-149 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "at", "eventCode", "actorUserId", "actorName", "actorEmployeeCode", "description"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ORD-156 Đúng loại phản hồi và nội dung", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf10();
    const doc = await uploadOrderDoc(testRun, o.id, KHQ, file);
    const res = await http.call('GET /api/service-orders/{id}/documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(res.headers()['content-type'], 'Content-Type đúng loại file').toMatch(/pdf|octet-stream/);
    expect(res.headers()['content-disposition'] ?? '', 'Content-Disposition có tên file').toMatch(/filename/i);
    const buf = await res.body();
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 1).toString(), 'Không bọc JSON').not.toBe('{');
    expect(sha256(buf)).toBe(sha256(file.buffer));

  });

  test("ORD-163 Phản hồi thành công không có body", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const doc = await uploadOrderDoc(testRun, o.id, KHQ, samplePdf('chung-tu-rong.pdf'));
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');
    const res = await http.call('DELETE /api/service-orders/{id}/documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ORD-168 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/services/{serviceTypeCode}/documents";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "filename", "contentType", "byteSize", "uploadedAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ORD-177 Cấu trúc phản hồi thành công", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: REAL.docx10() } });
    expectStatusIn(res, '200/201');
    const text = await res.text();
    expect(hasNoStacktrace(text)).toBe(true);
    if (text) {
      const b = JSON.parse(text);
      expect(b.success).toBe(true);
      expect(b).toHaveProperty('message');
      expect(b.errorCode ?? null).toBeNull();
      expect(b).toHaveProperty('data');
    }

  });

  test("ORD-184 Đúng loại phản hồi và nội dung", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'CHANG1_DONE');
    const refs = await testRun.p0Refs();
    const pod = REAL.pdf10();
    const up = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, query: { block: 'ACTUAL' }, multipart: { file: pod } }), 'K3 đính kèm POD ở VT');
    const podId = up?.documentIds?.[0] ?? up?.id;

    const res = await http.call('GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.VT, documentId: podId } });
    expectStatusIn(res, '200');
    expect(res.headers()['content-type']).toMatch(/pdf|octet-stream/);
    expect(res.headers()['content-disposition'] ?? '').toMatch(/filename/i);
    const buf = await res.body();
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 1).toString(), 'Không bọc JSON').not.toBe('{');
    expect(sha256(buf)).toBe(sha256(pod.buffer));

  });

  test("ORD-190 Đúng loại phản hồi và nội dung", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf20();
    const doc = await uploadVehicleDoc(testRun, o.id, file);
    const res = await http.call('GET /api/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(res.headers()['content-type']).toMatch(/pdf|octet-stream/);
    expect(res.headers()['content-disposition'] ?? '').toMatch(/filename/i);
    const buf = await res.body();
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 1).toString(), 'Không bọc JSON').not.toBe('{');
    expect(sha256(buf)).toBe(sha256(file.buffer));

  });

  test("ORD-197 Phản hồi thành công không có body", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const doc = await uploadVehicleDoc(testRun, o.id, samplePdf('so-thong-hanh.pdf'));
    const res = await http.call('DELETE /api/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ORD-202 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "filename", "contentType", "byteSize", "uploadedAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ORD-210 Cấu trúc phản hồi thành công", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: { file: REAL.pdf20() } });
    expectStatusIn(res, '200/201');
    const text = await res.text();
    expect(hasNoStacktrace(text)).toBe(true);
    if (text) {
      const b = JSON.parse(text);
      expect(b.success).toBe(true);
      expect(b).toHaveProperty('message');
      expect(b.errorCode ?? null).toBeNull();
      expect(b).toHaveProperty('data');
    }

  });

  test("ORD-216 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/scope-requests";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_phieu_dich_vu_phieu_dich_vu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "kind", "kindLabel", "serviceTypeCode", "serviceTypeName", "reason", "status", "statusLabel", "responseNote", "requestedByName", "requestedAt", "respondedByName", "respondedAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ORD-224 Cấu trúc phản hồi thành công", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const { order, requestId } = await scopeRequestOrder(testRun);
    const res = await http.call('POST /api/service-orders/{id}/scope-requests/{requestId}/respond', { token: tok('k1'), params: { id: order.id, requestId }, json: { accept: true, note: 'Đồng ý thêm kho' } });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(hasNoStacktrace(text)).toBe(true);
    if (text) {
      const b = JSON.parse(text);
      expect(b.success).toBe(true);
      expect(b).toHaveProperty('message');
      expect(b.errorCode ?? null).toBeNull();
      expect(b).toHaveProperty('data');
    }

  });
});
