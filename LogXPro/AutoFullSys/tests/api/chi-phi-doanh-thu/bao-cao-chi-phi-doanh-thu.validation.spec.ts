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

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Màn Chi phí – Doanh thu (báo cáo quản trị)", () => {
  test("CR-008 `revenueFrom` sai kiểu dữ liệu", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/orders";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, query: { ...p.query, "revenueFrom": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("CR-009 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/cost-revenue/orders";
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

  test("CR-011 Gọi sai phương thức HTTP", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/orders";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CR-015 `revenueFrom` sai kiểu dữ liệu", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/orders/stats";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, query: { ...p.query, "revenueFrom": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("CR-017 Gọi sai phương thức HTTP", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/orders/stats";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CR-020 Gọi sai phương thức HTTP", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/customer-options";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CR-023 Gọi sai phương thức HTTP", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/creator-options";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CR-032 Body JSON hỏng cú pháp", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/cost-revenue/exports";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CR-037 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/exports/{id}";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CR-039 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/exports/{id}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CR-043 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/exports/{id}/file";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CR-045 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/exports/{id}/file";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
