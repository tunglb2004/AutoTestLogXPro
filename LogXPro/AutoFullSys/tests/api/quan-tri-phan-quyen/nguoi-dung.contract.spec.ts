/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';
import * as R_quan_tri_phan_quyen_nguoi_dung from '../../../src/quan-tri-phan-quyen/api/schemas/nguoi-dung.schema';

import { exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { readXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { startService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Quản trị người dùng", () => {
  test("ADM-USR-008 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/users";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_nguoi_dung.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "employeeCode", "email", "displayName", "phone", "status", "passwordChangeRequired", "lastLoginAt", "createdAt", "roleCount", "roles", "departments"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ADM-USR-018 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun }) => {

    const r = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'KHQ'), { name: ADM.uniqueName('Điều phối Khai báo hải quan') });
    const payload = ADM.userPayload(testRun, { roleIds: [r.id] });
    const res = await ADM.adminRequest(testRun, "POST /api/admin/users", { json: payload });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    testRun.track(`ADM người dùng ${b.data?.userId}`, () => ADM.adminRequest(testRun, "POST /api/admin/users/{id}/lock", { params: { id: b.data.userId } }));
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['userId', 'email', 'password']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-USR-023 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/users/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_nguoi_dung.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "employeeCode", "email", "displayName", "phone", "status", "passwordChangeRequired", "lastLoginAt", "createdAt", "updatedAt", "updatedByName", "roles", "departments"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("ADM-USR-031 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const khq = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'KHQ'));
    const hq = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun, { roleIds: [khq.id] });
    const res = await ADM.updateUser(testRun, u, { roleIds: [khq.id, hq.id] });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'employeeCode', 'email', 'displayName', 'phone', 'status', 'passwordChangeRequired', 'lastLoginAt', 'createdAt', 'updatedAt', 'updatedByName', 'roles', 'departments']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-USR-039 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const u = await ADM.newUser(testRun);
    const res = await ADM.adminRequest(testRun, "POST /api/admin/users/{id}/lock", { params: { id: u.id } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'employeeCode', 'email', 'displayName', 'phone', 'status', 'passwordChangeRequired', 'lastLoginAt', 'createdAt', 'updatedAt', 'updatedByName', 'roles', 'departments']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-USR-047 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const u = await ADM.newUser(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: u.id } });
    const res = await ADM.adminRequest(testRun, "POST /api/admin/users/{id}/unlock", { params: { id: u.id } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'employeeCode', 'email', 'displayName', 'phone', 'status', 'passwordChangeRequired', 'lastLoginAt', 'createdAt', 'updatedAt', 'updatedByName', 'roles', 'departments']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-USR-054 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun }) => {

    const u = await ADM.newUser(testRun);
    await ADM.loginUser(testRun, u);
    const res = await ADM.adminRequest(testRun, "POST /api/admin/users/{id}/password/reset", { params: { id: u.id } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['userId', 'email', 'password']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-USR-059 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/users/{id}/permissions";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_nguoi_dung.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["code", "name", "groupName", "description", "object", "action", "blockCode", "blockName", "referenceRoleCode", "referenceRoleName", "roles"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ADM-USR-065 Đúng loại phản hồi và nội dung", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun }) => {

    const ps = await ADM.servicePermissionCodes(testRun, 'KHQ');
    const r = await ADM.newRole(testRun, ps, { name: ADM.uniqueName('Điều phối Khai báo hải quan') });
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const perms = await ADM.effective(testRun, u.id);
    const res = await ADM.adminRequest(testRun, "GET /api/admin/users/{id}/permissions/export", { params: { id: u.id } });
    expectStatusIn(res, '200');
    const x = await readXlsx(await res.body());
    const permRows = x.rows.filter((row) => perms.some((p: any) => row.some((c) => String(c ?? '').trim() === p.name)));

    expect(res.headers()['content-type'] ?? '').toMatch(/spreadsheetml/);
    expect(res.headers()['content-disposition'] ?? '').toMatch(/filename/i);
    const header = JSON.stringify(x.rows.slice(0, 5));
    for (const col of ['Nhóm quyền', 'Quyền', 'Vai trò nguồn']) expect(header, `Có cột ${col}`).toContain(col);
    expect(permRows.length, 'Số dòng = số quyền').toBe(perms.length);

  });
});
