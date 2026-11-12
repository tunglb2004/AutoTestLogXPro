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
  test("ORD-076 Thiếu trường bắt buộc `reason`", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/cancel";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    delete payload["reason"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "reason");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-077 `reason` dài 499, 500 và 501 ký tự", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const sets = ['200/204', '200/204', '400/422'];
    const lens = [499, 500, 501];
    for (let i = 0; i < 3; i++) {
      const o = await createOrder(testRun, base, { submit: true });
      const reason = textOfLength(lens[i]);
      const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason } });
      expectStatusIn(res, sets[i], `${lens[i]} ký tự`);
      const d = await getOrder(testRun, o.id);
      if (i < 2) {
        expect(d.status).toBe('CANCELLED');
        expect(d.cancelReason, `${lens[i]} ký tự đọc lại nguyên văn`).toBe(reason);
      } else {
        expectOnlyFieldError(await expectApiError(res), 'reason');
        expect(d.status, 'Giữ trạng thái cũ').toBe('SUBMITTED');
        expect(JSON.stringify(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } }))), 'Không ghi lịch sử hủy').not.toContain(reason.slice(0, 40));
      }
    }

  });

  test("ORD-227 `reason` bỏ hẳn khỏi body", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/cancel";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    delete payload["reason"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "reason");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-228 `reason` = null", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/cancel";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    payload["reason"] = null;
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "reason");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-229 `reason` = chuỗi rỗng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/cancel";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    payload["reason"] = "";
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "reason");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-230 `reason` toàn dấu cách", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/cancel";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    payload["reason"] = "   ";
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "reason");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-231 `reason` sai kiểu", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/cancel";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    payload["reason"] = 12345;
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "reason");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-065 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/submit";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-067 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/submit";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-079 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/cancel";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_phieu_dich_vu_phieu_dich_vu.bodies["POST /api/service-orders/{id}/cancel"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-086 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/restore";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-088 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/restore";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
