/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';
import * as F_quan_tri_phan_quyen_vai_tro from '../../../src/quan-tri-phan-quyen/data/vai-tro.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';

test.describe("Quản trị vai trò, nhật ký và thiết lập", () => {
  test("ADM-ROLE-008 `active` sai kiểu dữ liệu", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/roles";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, query: { ...p.query, "active": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("ADM-ROLE-009 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, roles, page }) => {
    const API = "GET /api/admin/roles";
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

  test("ADM-ROLE-017 Thiếu trường bắt buộc `name`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/roles";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_vai_tro.bodies[API]();
    delete payload["name"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("ADM-ROLE-018 `code` 64 và 65 ký tự đúng pattern", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const code = ('AT' + uuid().replace(/-/g, '').toUpperCase()).padEnd(64, 'X');
    expect(code).toHaveLength(64);
    expect(code).toMatch(/^[A-Z0-9_]+$/);
    const r = await ADM.newRole(testRun, [], { code });
    expect((await ADM.role(testRun, r.id)).code).toBe(code);
    const name = ADM.uniqueName('Mã vai trò 65');
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/roles', { json: { name, code: code + 'X', permissions: [] } });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'code');
    expect(await ADM.allAdmin(testRun, 'GET /api/admin/roles', { search: name })).toEqual([]);
    expect((await ADM.role(testRun, r.id)).code).toBe(code);
  });

  test("ADM-ROLE-029 Thiếu trường bắt buộc `name`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {
    const API = "PUT /api/admin/roles/{id}";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_vai_tro.bodies[API]();
    delete payload["name"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-030 `name` dài 254, 255 và 256 ký tự", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const beforePermissions = await ADM.effective(testRun, u.id);
    const seed = ADM.uniqueName('Tên vai trò biên') + ' Điều phối vận tải ';
    for (const n of [254, 255]) {
      const name = textOfLength(n, seed);
      expect(name.length).toBe(n);
      expectStatusIn(await ADM.adminRequest(testRun, 'PUT /api/admin/roles/{id}', { params: { id: r.id }, json: { name, permissions: ps } }), '200/204');
      expect((await ADM.role(testRun, r.id)).name).toBe(name);
    }
    const before = stable(await ADM.role(testRun, r.id));
    const logs = await ADM.audit(testRun, r.id);
    const res = await ADM.adminRequest(testRun, 'PUT /api/admin/roles/{id}', { params: { id: r.id }, json: { name: textOfLength(256, seed), permissions: ps } });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'name');
    expect(stable(await ADM.role(testRun, r.id))).toEqual(before);
    expect(await ADM.audit(testRun, r.id)).toEqual(logs);
    expect(ADM.permissionCodes(await ADM.effective(testRun, u.id))).toEqual(ADM.permissionCodes(beforePermissions));
  });

  test("ADM-ROLE-075 Thiếu trường bắt buộc `roleId`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/users/{userId}/roles";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_vai_tro.bodies[API]();
    delete payload["roleId"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "roleId");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-076 `roleId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/users/{userId}/roles";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_quan_tri_phan_quyen_vai_tro.bodies[API](), "roleId": value };
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-090 Thiếu tham số bắt buộc `query`", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/audit-log";
    const p = await testRun.prepare(API, "admin");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["query"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("ADM-ROLE-091 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/admin/audit-log";
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

  test("ADM-ROLE-102 Thiếu trường bắt buộc `sodMode`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/admin/settings";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_vai_tro.bodies[API]();
    delete payload["sodMode"];
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "sodMode");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-103 `sodMode` ngoài danh sách cho phép", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/admin/settings";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_vai_tro.bodies[API]();
    payload["sodMode"] = "XYZ";
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "sodMode");
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-005 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/permissions";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-011 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/roles";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-020 Body JSON hỏng cú pháp", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/roles";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("ADM-ROLE-023 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/roles/{id}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-025 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/roles/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-032 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "PUT /api/admin/roles/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{ json: F_quan_tri_phan_quyen_vai_tro.bodies["PUT /api/admin/roles/{id}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-037 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "DELETE /api/admin/roles/{id}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-039 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "DELETE /api/admin/roles/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-043 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/roles/{id}/activate";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-045 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/roles/{id}/activate";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-050 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/roles/{id}/deactivate";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-052 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/roles/{id}/deactivate";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-055 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/roles/{id}/users";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-057 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/roles/{id}/users";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-061 Thiếu trường bắt buộc `userIds`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/roles/{id}/users";
    const p = await testRun.prepare(API, "admin");
    const payload: Record<string, unknown> = F_quan_tri_phan_quyen_vai_tro.bodies[API]();
    delete payload["userIds"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "userIds");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("ADM-ROLE-063 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/roles/{id}/users";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{ json: F_quan_tri_phan_quyen_vai_tro.bodies["POST /api/admin/roles/{id}/users"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-069 Tham số đường dẫn `userId` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "DELETE /api/admin/roles/{id}/users/{userId}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "userId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-071 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "DELETE /api/admin/roles/{id}/users/{userId}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-078 `userId` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "POST /api/admin/users/{userId}/roles";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{ json: F_quan_tri_phan_quyen_vai_tro.bodies["POST /api/admin/users/{userId}/roles"]() }, params: { ...p.params, "userId": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-084 Tham số đường dẫn `roleId` sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "DELETE /api/admin/users/{userId}/roles/{roleId}";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "roleId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-086 `userId` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "DELETE /api/admin/users/{userId}/roles/{roleId}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "userId": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ADM-ROLE-093 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/audit-log";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-096 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/settings";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ADM-ROLE-105 Body JSON hỏng cú pháp", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/admin/settings";
    const p = await testRun.prepare(API, "admin");
    const before = await testRun.snapshot(API, p.params ?? {}, "admin");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "admin"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });
});
