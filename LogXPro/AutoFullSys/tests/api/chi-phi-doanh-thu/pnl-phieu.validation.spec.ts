/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, revenueOf, revenueTable, runService, performedP0, completedP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costLines, coordinate, startService, saveActuals, uploadActualDoc, completeService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { pnl, readXlsx, numbersIn, isXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as F_chi_phi_doanh_thu_pnl_phieu from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu", () => {
  test("PNL-030 Thiếu trường bắt buộc `source`", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}/pnl/fx-rate";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_chi_phi_doanh_thu_pnl_phieu.bodies[API]();
    delete payload["source"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "source");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("PNL-031 `source` ngoài danh sách cho phép", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}/pnl/fx-rate";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_chi_phi_doanh_thu_pnl_phieu.bodies[API]();
    payload["source"] = "XYZ";
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "source");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("PNL-032 `usdRate` 0,01 / 0 / âm và 3 số lẻ", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'PERFORMED');
    expectStatusIn(await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 0.01, cnyRate: 3_600 } }), '200/204', 'usdRate 0,01');
    const after1 = await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }));
    expectMoney(after1.kpi.cost, P0.orderCost - P0.serviceCost.VT + 4, 'Quy đổi theo 0,01 (400 USD × 0,01 = 4)');
    for (const v of [0, -1, 25000.123]) {
      const r = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: v, cnyRate: 3_600 } });
      expectStatusIn(r, '400/422', `usdRate ${v}`);
    }
    const last = await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }));
    expect(Number(last.fxRate.usdRate), 'Tỷ giá giữ 0,01').toBe(0.01);
    expect(stable(last.kpi), 'Số liệu quy đổi chỉ đổi ở lần 1').toEqual(stable(after1.kpi));

  });

  test("PNL-009 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/pnl";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("PNL-011 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/pnl";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("PNL-016 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/pnl/export";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("PNL-018 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/pnl/export";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("PNL-020 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/pnl/fx-rate";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("PNL-022 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/pnl/fx-rate";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("PNL-034 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}/pnl/fx-rate";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{ json: F_chi_phi_doanh_thu_pnl_phieu.bodies["PUT /api/service-orders/{id}/pnl/fx-rate"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
