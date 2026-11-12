/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tỷ giá Vietcombank và thông báo", () => {
  test("COM-005 Tham số đường dẫn `currency` sai định dạng", { tag: ["@api", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/exchange-rates/{currency}";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "currency": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("COM-007 `currency` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/exchange-rates/{currency}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "currency": `AT-KHONG-CO-${TEST_RUN_ID}` } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("COM-010 `unreadOnly` sai kiểu dữ liệu", { tag: ["@api", "@lich-su-thong-bao", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/notifications";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, query: { ...p.query, "unreadOnly": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("COM-012 Gọi sai phương thức HTTP", { tag: ["@api", "@lich-su-thong-bao", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/notifications";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("COM-015 Gọi sai phương thức HTTP", { tag: ["@api", "@lich-su-thong-bao", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/notifications/unread-count";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("COM-020 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/notifications/{id}/read";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("COM-022 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/notifications/{id}/read";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
