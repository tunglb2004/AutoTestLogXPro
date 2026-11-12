/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';
import * as F_quan_tri_phan_quyen_bo_phan from '../../../src/quan-tri-phan-quyen/data/bo-phan.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';

test.describe("Quản trị bộ phận", () => {
  test("ADM-DEP-005 `page` sai kiểu dữ liệu", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/admin/departments";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, query: { ...p.query, "page": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("ADM-DEP-006 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/admin/departments";
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

  test("ADM-DEP-014 Thiếu trường bắt buộc `name`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/departments";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_bo_phan.bodies[API]();
    delete payload["name"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("ADM-DEP-015 `name` dài 254, 255 và 256 ký tự", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const seed = ADM.uniqueName('Bộ phận biên') + ' Công ty giao nhận ';
    const created: any[] = [];
    for (const n of [254, 255]) {
      const name = textOfLength(n, seed);
      expect(name.length).toBe(n);
      const d = await ADM.newDepartment(testRun, { name });
      expect((await ADM.department(testRun, d.id)).name).toBe(name);
      created.push(d);
    }
    const name = textOfLength(256, seed);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments', { json: { name } });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'name');
    expect((await ADM.allAdmin(testRun, 'GET /api/admin/departments', { search: name })).some((x: any) => x.name === name)).toBe(false);
    for (const d of created) expect((await ADM.department(testRun, d.id)).name).toBe(d.name);
  });

  test("ADM-DEP-026 Thiếu trường bắt buộc `name`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/admin/departments/{id}";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_bo_phan.bodies[API]();
    delete payload["name"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-027 `name` dài 254, 255 và 256 ký tự", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const seed = ADM.uniqueName('Cập nhật bộ phận biên') + ' Vận tải quốc tế ';
    for (const n of [254, 255]) {
      const name = textOfLength(n, seed);
      expect(name.length).toBe(n);
      expectStatusIn(await ADM.adminRequest(testRun, 'PUT /api/admin/departments/{id}', { params: { id: d.id }, json: { name } }), '200/204');
      expect((await ADM.department(testRun, d.id)).name).toBe(name);
    }
    const before = stable(await ADM.department(testRun, d.id));
    const logs = await ADM.audit(testRun, d.id);
    const res = await ADM.adminRequest(testRun, 'PUT /api/admin/departments/{id}', { params: { id: d.id }, json: { name: textOfLength(256, seed) } });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'name');
    expect(stable(await ADM.department(testRun, d.id))).toEqual(before);
    expect(await ADM.audit(testRun, d.id)).toEqual(logs);
  });

  test("ADM-DEP-068 Thiếu trường bắt buộc `departmentId`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users/{userId}/departments";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_bo_phan.bodies[API]();
    delete payload["departmentId"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "departmentId");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-069 `departmentId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users/{userId}/departments";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_quan_tri_phan_quyen_bo_phan.bodies[API](), "departmentId": value };
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-008 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/departments";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-017 Body JSON hỏng cú pháp", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/departments";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("ADM-DEP-020 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/departments/{id}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-022 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/departments/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-DEP-029 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/admin/departments/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{ json: F_quan_tri_phan_quyen_bo_phan.bodies["PUT /api/admin/departments/{id}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-DEP-034 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/admin/departments/{id}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-036 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/admin/departments/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-DEP-040 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/departments/{id}/activate";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-042 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/departments/{id}/activate";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-DEP-047 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/departments/{id}/deactivate";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-049 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/departments/{id}/deactivate";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-DEP-054 Thiếu trường bắt buộc `roleIds`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/departments/{id}/roles";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_bo_phan.bodies[API]();
    delete payload["roleIds"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "roleIds");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-056 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/departments/{id}/roles";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{ json: F_quan_tri_phan_quyen_bo_phan.bodies["POST /api/admin/departments/{id}/roles"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-DEP-062 Tham số đường dẫn `roleId` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "DELETE /api/admin/departments/{id}/roles/{roleId}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "roleId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-064 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "DELETE /api/admin/departments/{id}/roles/{roleId}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-DEP-071 `userId` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/admin/users/{userId}/departments";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{ json: F_quan_tri_phan_quyen_bo_phan.bodies["POST /api/admin/users/{userId}/departments"]() }, params: { ...p.params, "userId": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-DEP-077 Tham số đường dẫn `departmentId` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/admin/users/{userId}/departments/{departmentId}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "departmentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-DEP-079 `userId` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/admin/users/{userId}/departments/{departmentId}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "userId": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
