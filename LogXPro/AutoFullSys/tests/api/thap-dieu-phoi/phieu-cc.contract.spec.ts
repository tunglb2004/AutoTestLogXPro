/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, orderBody, getOrder, revenueOf, revenueTable, rejectOrder, runService, uploadOrderDoc, uploadVehicleDoc, buildP0, addSealCost, scopeRequestOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, confirmLegsBody, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costs, costLines, costItem, addCost, saveActuals, startService, completeService, uploadActualDoc, coordinate } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { changeLinePrice } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { setItemStatus } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { pnl } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as R_thap_dieu_phoi_phieu_cc from '../../../src/thap-dieu-phoi/api/schemas/phieu-cc.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — phiếu dịch vụ (CC)", () => {
  test("K3O-008 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_phieu_cc.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "customerId", "customerName", "ownerName", "serviceTypeCodes", "handoverPlateNo", "receiverPlateNo", "status", "statusLabel", "awaitingLegs", "myWork", "createdAt", "performedAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("K3O-012 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/counts";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_phieu_cc.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["controllerView", "total", "byTab"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("K3O-015 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/statuses";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_phieu_cc.responses[API].data!.safeParse(b.data);
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

  test("K3O-021 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_phieu_cc.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["order", "legRuleCode", "legRuleName", "legs", "acceptedAt", "activatedAt", "performedAt", "rejectedAt", "availableActions"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("K3O-028 Cấu trúc phản hồi thành công", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('POST /api/k3/service-orders/{id}/accept', { token: tok('cc'), params: { id: o.id } });
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

  test("K3O-037 Cấu trúc phản hồi thành công", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('POST /api/k3/service-orders/{id}/reject', { token: tok('cc'), params: { id: o.id }, json: { reason: 'Thiếu chứng từ khai báo' } });
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

  test("K3O-042 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/legs/preview";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_phieu_cc.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["ruleCode", "ruleName", "executionScope", "legs", "hasWarehousing", "warehouseLegPosition"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("K3O-052 Cấu trúc phản hồi thành công", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const pv = await data(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } }));
    const res = await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('cc'), params: { id: o.id }, json: confirmLegsBody(pv, 1) });
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

  test("K3O-058 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/tower-log";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_phieu_cc.responses[API].data!.safeParse(b.data);
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

  test("K3O-065 Đúng loại phản hồi và nội dung", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf10();
    const doc = await uploadOrderDoc(testRun, o.id, refs.services.KHQ, file);
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');

    const res = await http.call('GET /api/k3/service-orders/{id}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(res.headers()['content-type']).toMatch(/pdf|octet-stream/);
    expect(res.headers()['content-disposition'] ?? '').toMatch(/filename/i);
    const buf = await res.body();
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 1).toString(), 'Không bọc JSON').not.toBe('{');
    expect(sha256(buf)).toBe(sha256(file.buffer));

  });

  test("K3O-071 Đúng loại phản hồi và nội dung", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf20();
    const doc = await uploadVehicleDoc(testRun, o.id, file);
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');

    const res = await http.call('GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('dp'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(res.headers()['content-type']).toMatch(/pdf|octet-stream/);
    expect(res.headers()['content-disposition'] ?? '').toMatch(/filename/i);
    const buf = await res.body();
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 1).toString(), 'Không bọc JSON').not.toBe('{');
    expect(sha256(buf)).toBe(sha256(file.buffer));

  });
});
