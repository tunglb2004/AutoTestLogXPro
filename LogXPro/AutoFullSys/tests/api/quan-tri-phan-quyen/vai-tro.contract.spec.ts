/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';
import * as R_quan_tri_phan_quyen_vai_tro from '../../../src/quan-tri-phan-quyen/api/schemas/vai-tro.schema';

import { exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { readXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { startService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Quản trị vai trò, nhật ký và thiết lập", () => {
  test("ADM-ROLE-004 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/permissions";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_vai_tro.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["code", "name", "groupName", "description", "object", "action", "blockCode", "blockName", "referenceRoleCode", "referenceRoleName"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ADM-ROLE-010 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/roles";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_vai_tro.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "name", "description", "active", "systemRole", "permissionCount", "userCount", "defaultRole", "departments", "createdAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ADM-ROLE-019 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const res = await ADM.adminRequest(testRun, "POST /api/admin/roles", { json: { name: ADM.uniqueName('Điều phối Vận tải AT'), description: 'Vai trò kiểm thử độc lập', permissions: ps } });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    testRun.track(`ADM vai trò ${b.data?.id}`, () => ADM.adminRequest(testRun, "DELETE /api/admin/roles/{id}", { params: { id: b.data.id } }));
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'name', 'description', 'active', 'systemRole', 'userCount', 'defaultRole', 'departments', 'createdAt', 'updatedAt', 'updatedByName', 'permissions']) expect(b.data, `data có ${k}`).toHaveProperty(k);
    expect([...b.data.permissions].sort()).toEqual(ps);

  });

  test("ADM-ROLE-024 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/roles/{id}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_vai_tro.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "code", "name", "description", "active", "systemRole", "userCount", "defaultRole", "departments", "createdAt", "updatedAt", "updatedByName", "permissions"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("ADM-ROLE-031 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const done = (await ADM.catalogue(testRun)).find((p: any) => /dịch vụ vận tải/i.test(p.groupName ?? '') && /hoàn thành dịch vụ/i.test(p.name ?? ''))?.code;
    const r = await ADM.newRole(testRun, ps, { name: ADM.uniqueName('Điều phối Vận tải AT') });
    await ADM.newUser(testRun, { roleIds: [r.id] });
    const res = await ADM.adminRequest(testRun, "PUT /api/admin/roles/{id}", { params: { id: r.id }, json: { name: r.name, description: r.description ?? '', permissions: ps.filter((x: string) => x !== done) } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'name', 'description', 'active', 'systemRole', 'userCount', 'defaultRole', 'departments', 'createdAt', 'updatedAt', 'updatedByName', 'permissions']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-ROLE-038 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun, roles }) => {

    const r = await ADM.newRole(testRun);
    const res = await ADM.adminRequest(testRun, "DELETE /api/admin/roles/{id}", { params: { id: r.id } });
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ADM-ROLE-044 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    await ADM.newUser(testRun, { roleIds: [r.id] });
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: r.id } });
    const res = await ADM.adminRequest(testRun, "POST /api/admin/roles/{id}/activate", { params: { id: r.id } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'name', 'description', 'active', 'systemRole', 'userCount', 'defaultRole', 'departments', 'createdAt', 'updatedAt', 'updatedByName', 'permissions']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-ROLE-051 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    await ADM.newUser(testRun, { roleIds: [r.id] });
    const res = await ADM.adminRequest(testRun, "POST /api/admin/roles/{id}/deactivate", { params: { id: r.id } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'name', 'description', 'active', 'systemRole', 'userCount', 'defaultRole', 'departments', 'createdAt', 'updatedAt', 'updatedByName', 'permissions']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("ADM-ROLE-056 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/admin/roles/{id}/users";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_vai_tro.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "employeeCode", "email", "displayName", "status", "roleCount"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ADM-ROLE-062 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun, roles }) => {

    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun);
    const res = await ADM.adminRequest(testRun, "POST /api/admin/roles/{id}/users", { params: { id: r.id }, json: { userIds: [u.id] } });
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ADM-ROLE-070 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun, roles }) => {

    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const res = await ADM.adminRequest(testRun, "DELETE /api/admin/roles/{id}/users/{userId}", { params: { id: r.id, userId: u.id } });
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ADM-ROLE-077 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun, roles }) => {

    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1), { name: ADM.uniqueName('Điều phối Sang tải AT') });
    const u = await ADM.newUser(testRun);
    const res = await ADM.adminRequest(testRun, "POST /api/admin/users/{userId}/roles", { params: { userId: u.id }, json: { roleId: r.id } });
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ADM-ROLE-085 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun, roles }) => {

    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1), { name: ADM.uniqueName('Điều phối Sang tải AT') });
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const res = await ADM.adminRequest(testRun, "DELETE /api/admin/users/{userId}/roles/{roleId}", { params: { userId: u.id, roleId: r.id } });
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("ADM-ROLE-092 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/audit-log";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_vai_tro.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "at", "actorUserId", "actorEmail", "actorName", "actorEmployeeCode", "action", "summary", "targetEntity", "targetId", "oldValue", "newValue", "event", "eventLabel"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("ADM-ROLE-095 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/admin/settings";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_vai_tro.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["sodMode"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("ADM-ROLE-104 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    test.setTimeout(600_000);
    const SETTINGS = async () => (await ADM.adminData(testRun, 'GET /api/admin/settings')).sodMode;
    const PUTSOD = (sodMode: string) => ADM.adminRequest(testRun, "PUT /api/admin/settings", { json: { sodMode } });
    const cat = await ADM.catalogue(testRun);
    const pair = [
      cat.find((p: any) => /điều phối nhà thầu/i.test(p.name ?? ''))?.code,
      cat.find((p: any) => /xác nhận doanh thu/i.test(p.name ?? ''))?.code,
    ] as string[];
    if (pair.some((x) => !x)) throw new Error('Chuẩn bị dữ liệu thất bại: rổ quyền thiếu "Điều phối nhà thầu" hoặc "Xác nhận doanh thu"');
    const CREATE = (ack?: string[]) => ADM.adminRequest(testRun, "POST /api/admin/roles", { json: { name: ADM.uniqueName('Vai trò kiêm nhiệm AT'), description: 'Kiểm tra cặp quyền nhạy cảm', permissions: pair, ...(ack ? { acknowledged: ack } : {}) } });
    const track = async (res: any) => { if (res.ok()) { const id = (await data(res))?.id; testRun.track(`ADM vai trò ${id}`, () => ADM.adminRequest(testRun, "DELETE /api/admin/roles/{id}", { params: { id } })); } };

    await exclusive('sod-mode', async () => {
      const original = await SETTINGS();
      try {
        await ADM.adminData(testRun, 'PUT /api/admin/settings', { json: { sodMode: 'WARN' } });
        const res = await PUTSOD('BLOCK');
        expectStatusIn(res, '200/204');
        const b = await body(res);
        for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
        expect(b.data, 'data có sodMode').toHaveProperty('sodMode');
      } finally {
        await PUTSOD(original);
      }
    });

  });
});
