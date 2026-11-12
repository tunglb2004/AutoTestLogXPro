import { withLegSandbox, expectSuccessEnvelope } from '../../../src/cau-hinh-chang/data/leg-sandbox';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import * as F_cau_hinh_chang_quy_tac_chang from '../../../src/cau-hinh-chang/data/quy-tac-chang.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)", () => {
  test("LEG-005 `pagination` sai kiểu dữ liệu", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, query: { ...p.query, "pagination": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("LEG-006 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(Array.isArray(list), "perPage=1 vẫn trả danh sách hợp lệ").toBe(true);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("LEG-019 Thiếu trường bắt buộc `name`", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    delete payload["name"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("LEG-020 `executionScope` ngoài danh sách cho phép", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["name"] = marker;
    payload["executionScope"] = "XYZ";
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "executionScope");
    expect(await testRun.listContains("GET /api/leg-rules", marker, "admin", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("LEG-021 `name` dài 149, 150 và 151 ký tự", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      for (const n of [149, 150, 151]) {
        const name = textOfLength(n); expect(name.length).toBe(n); expect(name).toContain(' ');
        const b = await s.available({ name });
        if (n === 151) { await s.rejectedCreate(b, '400/422', 'name'); continue; }
        const { rule } = await s.create(b); expect(rule.name).toBe(name); expect(rule.name.length).toBe(n);
        expectStatusIn(await s.remove(rule.code), '200/204');
      }
    });
  });

  test("LEG-033 Thiếu trường bắt buộc `name`", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/leg-rules/{code}";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    delete payload["name"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("LEG-034 `executionScope` ngoài danh sách cho phép", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/leg-rules/{code}";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["name"] = marker;
    payload["executionScope"] = "XYZ";
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "executionScope");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("LEG-035 `name` dài 149, 150 và 151 ký tự", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available());
      for (const n of [149, 150, 151]) {
        const name = textOfLength(n); expect(name.length).toBe(n); expect(name).toContain(' ');
        const before = await s.unchanged(rule.code); const b = s.fromDetail(await s.get(rule.code)); b.name = name;
        const res = await s.update(rule.code, b);
        if (n === 151) { expectStatusIn(res, '400/422'); expectOnlyFieldError(await expectApiError(res), 'name'); expect(await s.unchanged(rule.code)).toEqual(before); }
        else { expectStatusIn(res, '200/204'); expect((await s.get(rule.code)).name).toBe(name); }
      }
    });
  });

  test("LEG-046 Thiếu tham số bắt buộc `query`", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/leg-rules/{code}/history";
    const p = await testRun.prepare(API, "admin");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["query"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("LEG-047 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/leg-rules/{code}/history";
    const p = await testRun.prepare(API, "admin");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(Array.isArray(list), "perPage=1 vẫn trả danh sách hợp lệ").toBe(true);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("LEG-055 Thiếu trường bắt buộc `status`", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun }) => {
    const API = "PATCH /api/leg-rules/{code}/status";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    delete payload["status"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "status");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("LEG-056 `status` ngoài danh sách cho phép", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "PATCH /api/leg-rules/{code}/status";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    payload["status"] = "XYZ";
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "status");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("LEG-064 Thiếu trường bắt buộc `transportModeCode`", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules/simulate";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    delete payload["transportModeCode"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "transportModeCode");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("LEG-065 `transportModeCode` 32 và 33 ký tự", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const input = await s.simulationInput(); const before = stable(await s.list());
      const code32 = 'Z'.repeat(32); const cat = await testRun.catalog('GET /api/catalogues/transport-modes'); expect(cat.some((x: any) => x.code === code32)).toBe(false);
      const a = await s.simulate({ ...input, transportModeCode: code32 }); expectStatusIn(a, '400/404'); await expectApiError(a);
      const b = await s.simulate({ ...input, transportModeCode: code32 + 'Z' }); expectStatusIn(b, '400/422'); expectOnlyFieldError(await expectApiError(b), 'transportModeCode');
      expect(stable(await s.list())).toEqual(before);
    });
  });

  test("LEG-069 `name` bỏ hẳn khỏi body", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    delete payload["name"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("LEG-070 `name` = null", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    payload["name"] = null;
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("LEG-071 `name` = chuỗi rỗng", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    payload["name"] = "";
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("LEG-072 `name` toàn dấu cách", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    payload["name"] = "   ";
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("LEG-073 `name` sai kiểu", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_cau_hinh_chang_quy_tac_chang.bodies[API]();
    payload["name"] = 12345;
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
  });

  test("LEG-008 Gọi sai phương thức HTTP", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("LEG-023 Body JSON hỏng cú pháp", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("LEG-026 Tham số đường dẫn `code` sai định dạng", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/leg-rules/{code}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "code": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("LEG-028 `code` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/leg-rules/{code}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "code": `AT-KHONG-CO-${TEST_RUN_ID}` } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("LEG-037 `code` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/leg-rules/{code}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{ json: F_cau_hinh_chang_quy_tac_chang.bodies["PUT /api/leg-rules/{code}"]() }, params: { ...p.params, "code": `AT-KHONG-CO-${TEST_RUN_ID}` } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("LEG-042 Tham số đường dẫn `code` sai định dạng", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/leg-rules/{code}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "code": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("LEG-044 `code` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/leg-rules/{code}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "code": `AT-KHONG-CO-${TEST_RUN_ID}` } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("LEG-049 `code` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/leg-rules/{code}/history";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "code": `AT-KHONG-CO-${TEST_RUN_ID}` } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("LEG-058 `code` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "PATCH /api/leg-rules/{code}/status";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{ json: F_cau_hinh_chang_quy_tac_chang.bodies["PATCH /api/leg-rules/{code}/status"]() }, params: { ...p.params, "code": `AT-KHONG-CO-${TEST_RUN_ID}` } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("LEG-067 Body JSON hỏng cú pháp", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/leg-rules/simulate";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });
});
