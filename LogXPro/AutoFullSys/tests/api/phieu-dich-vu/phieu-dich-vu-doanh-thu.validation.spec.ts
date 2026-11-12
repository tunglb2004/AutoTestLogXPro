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
import * as F_phieu_dich_vu_phieu_dich_vu from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as R_phieu_dich_vu_phieu_dich_vu from '../../../src/phieu-dich-vu/api/schemas/phieu-dich-vu.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Phiếu dịch vụ (Khối 1)", () => {
  test("ORD-105 Tham số đường dẫn `serviceTypeCode` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_phieu_dich_vu_phieu_dich_vu.bodies["PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}"]() }, params: { ...p.params, "serviceTypeCode": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-106 `fxRate` 0,01 / 0 / âm", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = await extraQuote(testRun, { currency: 'USD', fxRate: 25_000 });
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, { customerId: q.base.customerId, rcId: q.rcId }, { submit: true });
    const VT = refs.services.VT;

    const sets = ['200/204', '400/422', '400/422'];
    const values = [0.01, 0, -1];
    for (let i = 0; i < 3; i++) {
      const res = await http.call('PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: VT }, json: { source: 'MANUAL', fxRate: values[i] } });
      expectStatusIn(res, sets[i], `fxRate=${values[i]}`);
    }
    expect(Number(revenueTable(await revenueOf(testRun, o.id), VT).fxRate), 'Tỷ giá giữ 0,01').toBe(0.01);

  });

  test("ORD-117 Thiếu trường bắt buộc `lines`", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    delete payload["lines"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "lines");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-118 `lines[].quantity` 0,01 / 0 / âm", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;
    const shift = () => revenueOf(testRun, o.id).then((ts) => (revenueTable(ts, KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId));
    const edit = (lines: unknown[], role: 'k1' | 'k1b' = 'k1') => http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok(role), params: { id: o.id, serviceTypeCode: KHQ }, json: { lines } });

    const s = await shift();
    const sets = ['200/204', '400/422', '400/422'];
    const qty = [0.01, 0, -1];
    for (let i = 0; i < 3; i++) {
      const res = await edit([{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: qty[i], unitPrice: 200_000 }]);
      expectStatusIn(res, sets[i], `quantity=${qty[i]}`);
      if (i > 0) expectOnlyFieldError(await expectApiError(res), 'quantity');
    }
    const after = (revenueTable(await revenueOf(testRun, o.id), KHQ).lines ?? []).find((l: any) => l.costLineId === s.costLineId);
    expect(Number(after.quantity), 'Giữ giá trị 0,01 đã lưu').toBe(0.01);

  });

  test("ORD-096 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/revenue";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-098 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/revenue";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-108 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_phieu_dich_vu_phieu_dich_vu.bodies["PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-120 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_phieu_dich_vu_phieu_dich_vu.bodies["PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-125 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/cost-revenue-summary";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-127 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/cost-revenue-summary";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-132 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/revenue-confirmation";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-134 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/revenue-confirmation";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-141 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/revenue-confirmation";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
  });

  test("ORD-143 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/revenue-confirmation";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
