/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';
import * as F_quan_tri_phan_quyen_nguoi_dung from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';

test.describe("Quản trị người dùng", () => {
  test("ADM-USR-006 `page` sai kiểu dữ liệu", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/admin/users";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, query: { ...p.query, "page": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("ADM-USR-007 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/admin/users";
    const p = await testRun.prepare(API, "admin");
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

  test("ADM-USR-016 Thiếu trường bắt buộc `employeeCode`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_nguoi_dung.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["displayName"] = marker;
    delete payload["employeeCode"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "employeeCode");
    expect(await testRun.listContains("GET /api/admin/users", marker, "admin", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("ADM-USR-017 `employeeCode` 32 và 33 ký tự", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'KHQ'));
    const code = ('AT' + Date.now() + String(Math.floor(Math.random() * 1e15))).padEnd(32, '0').slice(0, 32);
    expect(code).toHaveLength(32);
    const u = await ADM.newUser(testRun, { employeeCode: code, roleIds: [r.id] });
    expect((await ADM.user(testRun, u.id)).employeeCode).toBe(code);
    const payload = ADM.userPayload(testRun, { employeeCode: code + '7', roleIds: [r.id] });
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users', { json: payload });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'employeeCode');
    expect(await ADM.allAdmin(testRun, 'GET /api/admin/users', { search: payload.email })).toEqual([]);
    expect((await ADM.user(testRun, u.id)).employeeCode).toBe(code);
  });

  test("ADM-USR-029 Thiếu trường bắt buộc `employeeCode`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/admin/users/{id}";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_nguoi_dung.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["displayName"] = marker;
    delete payload["employeeCode"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "employeeCode");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-USR-030 `employeeCode` 32 và 33 ký tự", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'KHQ'));
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const code = ('AT' + Date.now() + String(Math.floor(Math.random() * 1e15))).padEnd(32, '0').slice(0, 32);
    expectStatusIn(await ADM.updateUser(testRun, u, { employeeCode: code }), '200/204');
    expect((await ADM.user(testRun, u.id)).employeeCode).toBe(code);
    const before = stable(await ADM.user(testRun, u.id));
    const res = await ADM.updateUser(testRun, { ...u, employeeCode: code }, { employeeCode: code + '7' });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'employeeCode');
    expect(stable(await ADM.user(testRun, u.id))).toEqual(before);
  });

  test("ADM-USR-009 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/users";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-USR-019 Body JSON hỏng cú pháp", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("ADM-USR-022 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/users/{id}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-USR-024 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/users/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-USR-032 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/admin/users/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{ json: F_quan_tri_phan_quyen_nguoi_dung.bodies["PUT /api/admin/users/{id}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-USR-038 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users/{id}/lock";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-USR-040 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users/{id}/lock";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-USR-046 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users/{id}/unlock";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-USR-048 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users/{id}/unlock";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-USR-053 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users/{id}/password/reset";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-USR-055 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users/{id}/password/reset";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-USR-058 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/users/{id}/permissions";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-USR-060 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/users/{id}/permissions";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-USR-064 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/users/{id}/permissions/export";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-USR-066 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/users/{id}/permissions/export";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
