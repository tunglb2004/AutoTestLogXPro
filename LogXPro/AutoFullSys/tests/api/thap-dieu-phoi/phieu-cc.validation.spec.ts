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
import * as F_thap_dieu_phoi_phieu_cc from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — phiếu dịch vụ (CC)", () => {
  test("K3O-006 `page` sai kiểu dữ liệu", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/k3/service-orders";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, query: { ...p.query, "page": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("K3O-007 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/k3/service-orders";
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

  test("K3O-035 Thiếu trường bắt buộc `reason`", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/reject";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_thap_dieu_phoi_phieu_cc.bodies[API]();
    delete payload["reason"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "reason");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-036 `reason` dài 499, 500 và 501 ký tự", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const sets = ['200/204', '200/204', '400/422'];
    const lens = [499, 500, 501];
    for (let i = 0; i < 3; i++) {
      const o = await createOrder(testRun, base, { submit: true });
      const reason = textOfLength(lens[i]);
      const res = await http.call('POST /api/k3/service-orders/{id}/reject', { token: tok('cc'), params: { id: o.id }, json: { reason } });
      expectStatusIn(res, sets[i], `${lens[i]} ký tự`);
      const d = await getOrder(testRun, o.id);
      if (i < 2) expect(d.rejectReason, `${lens[i]} ký tự đọc lại nguyên văn`).toBe(reason);
      else {
        expectOnlyFieldError(await expectApiError(res), 'reason');
        expect(d.status, 'Giữ trạng thái cũ').toBe('SUBMITTED');
      }
    }

  });

  test("K3O-050 Thiếu trường bắt buộc `ruleCode`", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/legs/confirm";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_thap_dieu_phoi_phieu_cc.bodies[API]();
    delete payload["ruleCode"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "ruleCode");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-051 `ruleCode` đúng định dạng 12 ký tự, 13 và 14 ký tự", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const sets = ['200/204', '400/409/422', '400/422'];
    for (let i = 0; i < 3; i++) {
      const o = await createOrder(testRun, base, { submit: true });
      await acceptOrder(testRun, o.id);
      const pv = await data(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } }));
      const code = [pv.ruleCode, 'RUL-9999-ZZZZ', 'RUL-9999-ZZZZZ'][i];
      const res = await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('cc'), params: { id: o.id }, json: { ...F_thap_dieu_phoi_phieu_cc.confirmLegsBody(pv, 1), ruleCode: code } });
      expectStatusIn(res, sets[i], `ruleCode ${code}`);
      if (i > 0) expect((await k3Order(testRun, o.id)).legs ?? [], 'Phiếu không lưu chặng').toHaveLength(0);
    }

  });

  test("K3O-056 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/tower-log";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-057 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/k3/service-orders/{id}/tower-log";
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

  test("K3O-009 Gọi sai phương thức HTTP", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-013 Gọi sai phương thức HTTP", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/counts";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-016 Gọi sai phương thức HTTP", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/statuses";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-020 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-022 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3O-027 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/accept";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-029 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/accept";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3O-038 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/reject";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_phieu_cc.bodies["POST /api/k3/service-orders/{id}/reject"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3O-041 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/legs/preview";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-043 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/legs/preview";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3O-053 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/legs/confirm";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_phieu_cc.bodies["POST /api/k3/service-orders/{id}/legs/confirm"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3O-059 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/tower-log";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3O-064 Tham số đường dẫn `documentId` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/documents/{documentId}";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "documentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-066 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/documents/{documentId}";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3O-070 Tham số đường dẫn `documentId` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "documentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3O-072 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
