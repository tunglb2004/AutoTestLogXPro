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
  test("ORD-014 `page` sai kiểu dữ liệu", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/service-orders";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, query: { ...p.query, "page": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("ORD-015 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/service-orders";
    const p = await testRun.prepare(API, "k1");
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

  test("ORD-028 Thiếu trường bắt buộc `customerId`", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["customerRef"] = marker;
    delete payload["customerId"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "customerId");
    expect(await testRun.listContains("GET /api/service-orders", marker, "k1", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("ORD-029 `customerId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders";
    const p = await testRun.prepare(API, "k1");
    const marker = tagged("AT Không lưu");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_phieu_dich_vu_phieu_dich_vu.bodies[API](), "customerId": value };
      payload["customerRef"] = marker;
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.listContains("GET /api/service-orders", marker, "k1", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("ORD-030 `customerRef` dài 49, 50 và 51 ký tự", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const sets = ['200/201', '200/201', '400/422'];
    const lens = [49, 50, 51];
    const target: any = null;
    for (let i = 0; i < 3; i++) {
      const ref = textOfLength(lens[i]);
      const payload = await orderBody(testRun, base, { customerRef: ref });
      const res = target
        ? await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: target.id }, json: payload })
        : await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: payload });
      expectStatusIn(res, sets[i], `${lens[i]} ký tự`);
      if (i < 2) {
        const id = target ? target.id : (await data(res)).id;
        expect((await getOrder(testRun, id)).customerRef, `${lens[i]} ký tự đọc lại nguyên văn`).toBe(ref);
      } else {
        expectOnlyFieldError(await expectApiError(res), 'customerRef');
        if (target) expect((await getOrder(testRun, target.id)).customerRef, 'Dữ liệu không đổi').not.toBe(ref);
        else expect(await testRun.listContains('GET /api/service-orders', ref.slice(0, 20), 'k1'), 'Không tạo phiếu').toBe(false);
      }
    }

  });

  test("ORD-031 `volume` tại cận dưới 0 và dưới cận", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const target: any = null;
    const send = async (volume: number) => {
      const payload = await orderBody(testRun, base, { volume });
      return target
        ? http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: target.id }, json: payload })
        : http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: payload });
    };
    const zero = await send(0);
    expectStatusIn(zero, '200/201', 'volume = 0');
    const id = target ? target.id : (await data(zero)).id;
    expect(Number((await getOrder(testRun, id)).volume), 'Lưu 0').toBe(0);
    const neg = await send(-1);
    expectStatusIn(neg, '400/422', 'volume = -1');
    expectOnlyFieldError(await expectApiError(neg), 'volume');
    if (target) expect(Number((await getOrder(testRun, target.id)).volume), 'Dữ liệu không đổi').toBe(0);

  });

  test("ORD-046 Thiếu trường bắt buộc `customerId`", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["customerRef"] = marker;
    delete payload["customerId"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "customerId");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-047 `customerId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}";
    const p = await testRun.prepare(API, "k1");
    const marker = tagged("AT Không lưu");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_phieu_dich_vu_phieu_dich_vu.bodies[API](), "customerId": value };
      payload["customerRef"] = marker;
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-048 `customerRef` dài 49, 50 và 51 ký tự", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const sets = ['200/204', '200/204', '400/422'];
    const lens = [49, 50, 51];
    const target: any = await createOrder(testRun, base, { submit: true });
    for (let i = 0; i < 3; i++) {
      const ref = textOfLength(lens[i]);
      const payload = await orderBody(testRun, base, { customerRef: ref });
      const res = target
        ? await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: target.id }, json: payload })
        : await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: payload });
      expectStatusIn(res, sets[i], `${lens[i]} ký tự`);
      if (i < 2) {
        const id = target ? target.id : (await data(res)).id;
        expect((await getOrder(testRun, id)).customerRef, `${lens[i]} ký tự đọc lại nguyên văn`).toBe(ref);
      } else {
        expectOnlyFieldError(await expectApiError(res), 'customerRef');
        if (target) expect((await getOrder(testRun, target.id)).customerRef, 'Dữ liệu không đổi').not.toBe(ref);
        else expect(await testRun.listContains('GET /api/service-orders', ref.slice(0, 20), 'k1'), 'Không tạo phiếu').toBe(false);
      }
    }

  });

  test("ORD-049 `volume` tại cận dưới 0 và dưới cận", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const target: any = await createOrder(testRun, base, { submit: true });
    const send = async (volume: number) => {
      const payload = await orderBody(testRun, base, { volume });
      return target
        ? http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: target.id }, json: payload })
        : http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: payload });
    };
    const zero = await send(0);
    expectStatusIn(zero, '200/204', 'volume = 0');
    const id = target ? target.id : (await data(zero)).id;
    expect(Number((await getOrder(testRun, id)).volume), 'Lưu 0').toBe(0);
    const neg = await send(-1);
    expectStatusIn(neg, '400/422', 'volume = -1');
    expectOnlyFieldError(await expectApiError(neg), 'volume');
    if (target) expect(Number((await getOrder(testRun, target.id)).volume), 'Dữ liệu không đổi').toBe(0);

  });

  test("ORD-147 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-148 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/service-orders/{id}/history";
    const p = await testRun.prepare(API, "k1");
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

  test("ORD-222 Thiếu trường bắt buộc `accept`", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/scope-requests/{requestId}/respond";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_phieu_dich_vu_phieu_dich_vu.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["note"] = marker;
    delete payload["accept"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "accept");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-223 `note` dài 499, 500 và 501 ký tự", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const sets = ['200/204', '200/204', '400/422'];
    const lens = [499, 500, 501];
    for (let i = 0; i < 3; i++) {
      const { order, requestId } = await scopeRequestOrder(testRun);
      const note = textOfLength(lens[i]);
      const res = await http.call('POST /api/service-orders/{id}/scope-requests/{requestId}/respond', { token: tok('k1'), params: { id: order.id, requestId }, json: { accept: true, note } });
      expectStatusIn(res, sets[i], `${lens[i]} ký tự`);
      const r = ((await data(await http.call('GET /api/service-orders/{id}/scope-requests', { token: tok('k1'), params: { id: order.id } }))).items ?? []).find((x: any) => x.id === requestId);
      if (i < 2) expect(r.responseNote, `${lens[i]} ký tự đọc lại nguyên văn`).toBe(note);
      else {
        expectOnlyFieldError(await expectApiError(res), 'note');
        expect(r.status, 'Giữ trạng thái chờ trả lời').toBe('PENDING');
      }
    }

  });

  test("ORD-006 Gọi sai phương thức HTTP", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/selectable-customers";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-009 Gọi sai phương thức HTTP", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/statuses";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-017 Gọi sai phương thức HTTP", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-033 Body JSON hỏng cú pháp", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("ORD-038 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-040 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-051 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/service-orders/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_phieu_dich_vu_phieu_dich_vu.bodies["PUT /api/service-orders/{id}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-057 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/service-orders/{id}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-059 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/service-orders/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-150 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-215 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/scope-requests";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-217 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/scope-requests";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-225 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/scope-requests/{requestId}/respond";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_phieu_dich_vu_phieu_dich_vu.bodies["POST /api/service-orders/{id}/scope-requests/{requestId}/respond"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
