/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, orderBody, getOrder, revenueOf, revenueTable, rejectOrder, runService, uploadOrderDoc, uploadVehicleDoc, buildP0, addSealCost, scopeRequestOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costs, costLines, costItem, addCost, saveActuals, startService, completeService, uploadActualDoc, coordinate } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { changeLinePrice } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { setItemStatus } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { pnl } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as R_thap_dieu_phoi_dich_vu_con from '../../../src/thap-dieu-phoi/api/schemas/dich-vu-con.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)", () => {
  test("K3S-006 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/coordination-options";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_dich_vu_con.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "name", "priceTypeId", "sortOrder", "status", "warehouseTypeIds"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("K3S-017 Cấu trúc phản hồi thành công", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: { assignments: [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], fxRates: { USD: P0.fxUsd } } });
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

  test("K3S-022 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/contractors";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_dich_vu_con.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["contractorId", "contractorCode", "contractorName", "primaryContact", "notice"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("K3S-032 Cấu trúc phản hồi thành công", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
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

  test("K3S-039 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/costs";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_dich_vu_con.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["serviceTypeCode", "costBadge", "costBadgeLabel", "totalConverted", "contractors"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("K3S-045 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/cost-items";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_dich_vu_con.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["purchasePriceItemId", "code", "purchasePriceCode", "purchasePriceName", "priceConfigurationItemId", "itemName", "unitCode", "unitName", "unitPrice", "currency"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("K3S-050 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/variance-items";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_dich_vu_con.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "name"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("K3S-063 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const P = { id: o.id, type: refs.services.KHQ };
    const ot = await costItem(testRun, o.svc.KHQ, A, o.base.items.overtime.id);
    const sur = { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, priceConfigurationItemId: o.base.items.overtime.id, unitCode: refs.units.overtime, quantity: 1, amount: 300_000, currency: 'VND' };
    const vari = { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 200_000, currency: 'VND' };

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: sur });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    expect(b.data).toHaveProperty('id');
    expect(String(b.data.id)).toMatch(/^[0-9a-f-]{36}$/i);
    const r2 = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: vari });
    expectStatusIn(r2, '200/201');
    expect((await body(r2)).data).toHaveProperty('id');

  });

  test("K3S-075 Cấu trúc phản hồi thành công", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `R${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'IN_PROGRESS', { base });
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
    const fee = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    const PUTC = (lines: unknown[], extra: Record<string, unknown> = {}, who: string = A) => http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: who }, json: { currency: 'VND', lines, ...extra } });

    const res = await PUTC([{ costLineId: fee.costLineId, unitCode: refs.units.customsFee, quantity: 1, unitPrice: 1_100_000 }]);
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

  test("K3S-083 Phản hồi thành công không có body", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const shift = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.shiftStorage);

    const res = await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: shift.costLineId } });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("K3S-091 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_dich_vu_con.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["costLineId", "purchasePriceItemId", "purchaseLineCode", "itemName", "savedAmount", "currentAmount", "currency", "changed"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("K3S-099 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const other = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code ?? 'AT';
    const before = stable((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ));
    const costsBefore = stable(await costs(testRun, o.svc.KHQ));

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/declaration', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { customsOfficeCode: other } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['resets', 'warnings']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("K3S-103 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/actuals";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_dich_vu_con.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["serviceTypeCode", "status", "statusLabel", "editable", "startBlockedReason", "declarationNo", "clearanceLane", "clearedAt", "declarationCount", "declaredCustomsOfficeCode", "declaredCustomsOfficeName", "actualCustomsOfficeCode", "actualCustomsOfficeName", "handoverVehicles", "supervisionOfficeCode", "supervisionOfficeName"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("K3S-116 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { ...actualsBody(refs, 'KHQ'), declarationNo: '10567891234' } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['resets', 'warnings']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("K3S-120 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/completion-check";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_dich_vu_con.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["ok", "missing"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("K3S-130 Cấu trúc phản hồi thành công", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await saveActuals(testRun, o.svc.KHQ, actualsBody(refs, 'KHQ'));
    await uploadActualDoc(testRun, o.svc.KHQ);

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
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

  test("K3S-137 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/documents";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_dich_vu_con.responses[API].data!.safeParse(b.data);
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

  test("K3S-146 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: REAL.pdf10() } });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'documentIds', 'oversizeCount', 'invalidCount', 'overLimitCount', 'overTotalCount', 'message']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("K3S-153 Đúng loại phản hồi và nội dung", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const file = REAL.pdf10();
    const upd = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file } }), 'đính chứng từ lô hàng');
    const docId = upd?.documentIds?.[0] ?? upd?.id;
    const GET1 = (type: string, role: 'dp' | 'dpVt' = 'dp') => http.call('GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok(role), params: { id: o.id, type, documentId: docId } });

    const res = await GET1(refs.services.KHQ);
    expectStatusIn(res, '200');
    expect(res.headers()['content-type']).toMatch(/pdf|octet-stream/);
    expect(res.headers()['content-disposition'] ?? '').toMatch(/filename/i);
    const buf = await res.body();
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 1).toString(), 'Không bọc JSON').not.toBe('{');
    expect(sha256(buf)).toBe(sha256(file.buffer));

  });

  test("K3S-160 Phản hồi thành công không có body", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const u1 = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-1.pdf') } }), 'chứng từ 1');
    const u2 = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-2.pdf') } }), 'chứng từ 2');
    const d1 = u1?.documentIds?.[0] ?? u1?.id;
    const d2 = u2?.documentIds?.[0] ?? u2?.id;
    const DEL = (id: string, type: string = refs.services.KHQ) => http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, type, documentId: id } });

    const res = await DEL(d1);
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });
});
