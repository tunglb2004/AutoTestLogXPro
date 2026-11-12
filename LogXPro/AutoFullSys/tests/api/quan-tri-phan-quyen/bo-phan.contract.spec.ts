/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';
import * as R_quan_tri_phan_quyen_bo_phan from '../../../src/quan-tri-phan-quyen/api/schemas/bo-phan.schema';

import { exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { readXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { startService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Quản trị bộ phận", () => {
  test("ADM-DEP-007 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/departments";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_bo_phan.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "name", "description", "active", "roleCount", "memberCount"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ADM-DEP-016 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const name = ADM.uniqueName('Điều phối AT');
    const res = await ADM.adminRequest(testRun, "POST /api/admin/departments", { json: { name, description: 'Bộ phận test' } });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    testRun.track(`ADM bộ phận ${b.data?.id}`, () => ADM.adminRequest(testRun, "DELETE /api/admin/departments/{id}", { params: { id: b.data.id } }));
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'name', 'description', 'active', 'roles', 'members']) expect(b.data, `data có ${k}`).toHaveProperty(k);
    expect(Array.isArray(b.data.roles) && Array.isArray(b.data.members)).toBe(true);

  });

  test("ADM-DEP-021 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/departments/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_bo_phan.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "name", "description", "active", "roles", "members"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("ADM-DEP-028 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const d = await ADM.newDepartment(testRun);
    const res = await ADM.adminRequest(testRun, "PUT /api/admin/departments/{id}", { params: { id: d.id }, json: { name: `${d.name} sửa`, description: d.description ?? '' } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'name', 'description', 'active', 'roles', 'members']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-DEP-035 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun }) => {

    const d = await ADM.newDepartment(testRun);
    const u = await ADM.newUser(testRun);
    await ADM.bindDepartment(testRun, u.id, d.id);
    const res = await ADM.adminRequest(testRun, "DELETE /api/admin/departments/{id}", { params: { id: d.id } });
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ADM-DEP-041 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const d = await ADM.newDepartment(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/departments/{id}/deactivate', { params: { id: d.id } });
    const res = await ADM.adminRequest(testRun, "POST /api/admin/departments/{id}/activate", { params: { id: d.id } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'name', 'description', 'active', 'roles', 'members']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-DEP-048 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const d = await ADM.newDepartment(testRun);
    const u = await ADM.newUser(testRun);
    await ADM.bindDepartment(testRun, u.id, d.id);
    const res = await ADM.adminRequest(testRun, "POST /api/admin/departments/{id}/deactivate", { params: { id: d.id } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'name', 'description', 'active', 'roles', 'members']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-DEP-055 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const d = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'VT'), { name: ADM.uniqueName('Điều phối Vận tải AT') });
    testRun.track(`ADM liên kết ${d.id}/${r.id}`, () => ADM.adminRequest(testRun, "DELETE /api/admin/departments/{id}/roles/{roleId}", { params: { id: d.id, roleId: r.id } }));
    const res = await ADM.adminRequest(testRun, "POST /api/admin/departments/{id}/roles", { params: { id: d.id }, json: { roleIds: [r.id] } });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'name', 'description', 'active', 'roles', 'members']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-DEP-063 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun, roles }) => {

    const d = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/departments/{id}/roles', { params: { id: d.id }, json: { roleIds: [r.id] } });
    const res = await ADM.adminRequest(testRun, "DELETE /api/admin/departments/{id}/roles/{roleId}", { params: { id: d.id, roleId: r.id } });
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ADM-DEP-070 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun }) => {

    const d = await ADM.newDepartment(testRun);
    const u = await ADM.newUser(testRun);
    const res = await ADM.adminRequest(testRun, "POST /api/admin/users/{userId}/departments", { params: { userId: u.id }, json: { departmentId: d.id } });
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ADM-DEP-078 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun }) => {

    const d = await ADM.newDepartment(testRun);
    const u = await ADM.newUser(testRun);
    await ADM.bindDepartment(testRun, u.id, d.id);
    const res = await ADM.adminRequest(testRun, "DELETE /api/admin/users/{userId}/departments/{departmentId}", { params: { userId: u.id, departmentId: d.id } });
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });
});
