/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';

import { exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { readXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { startService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
test.describe("Quản trị bộ phận", () => {
  test("ADM-DEP-012 NVKD tạo bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const name = ADM.uniqueName('Bộ phận bị từ chối');
    const res = await http.call('POST /api/admin/departments', { token: tok('k1'), json: { name, description: 'Body hợp lệ' } });
    expectStatusIn(res, '403');
    await expectApiError(res);
    await expectNoData(res);
    expect(await ADM.allAdmin(testRun, 'GET /api/admin/departments', { search: name })).toEqual([]);
  });

  test("ADM-DEP-013 Tên chứa thẻ script", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun }) => {

    const name = `<script>alert(1)</script> AT ${TEST_RUN_ID} ${Math.random().toString(36).slice(2, 7)}`;
    const res = await ADM.adminRequest(testRun, "POST /api/admin/departments", { json: { name, description: 'Bộ phận kiểm thử độc lập' } });
    expectStatusIn(res, '200/400');
    if (res.ok()) {
      const d = await data(res);
      testRun.track(`ADM bộ phận ${d.id}`, () => ADM.adminRequest(testRun, "DELETE /api/admin/departments/{id}", { params: { id: d.id } }));
      expect((await ADM.department(testRun, d.id)).name, 'Trả nguyên văn dạng text').toBe(name);
    } else await expectApiError(res);

  });

  test("ADM-DEP-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/admin/departments", "POST /api/admin/departments", "GET /api/admin/departments/{id}", "PUT /api/admin/departments/{id}", "DELETE /api/admin/departments/{id}", "POST /api/admin/departments/{id}/activate", "POST /api/admin/departments/{id}/deactivate", "POST /api/admin/departments/{id}/roles", "DELETE /api/admin/departments/{id}/roles/{roleId}", "POST /api/admin/users/{userId}/departments", "DELETE /api/admin/users/{userId}/departments/{departmentId}"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "admin");
      const before = await testRun.snapshot(api, p.params ?? {}, "admin");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.admin)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "admin"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("ADM-DEP-004 Tài khoản không có quyền quản trị", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const res = await http.call('GET /api/admin/departments', { token: tok('k1'), query: { page: 1, perPage: 20 } });
    expectStatusIn(res, '403');
    await expectApiError(res);
    await expectNoData(res);
  });

  test("ADM-DEP-059 Gỡ vai trò không thuộc bộ phận đó", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const a = await ADM.newDepartment(testRun);
    const b = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun);
    await ADM.bindDepartmentRole(testRun, a.id, r.id);
    const beforeA = stable(await ADM.department(testRun, a.id));
    const beforeB = stable(await ADM.department(testRun, b.id));
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}/roles/{roleId}', { params: { id: b.id, roleId: r.id } });
    expectStatusIn(res, '400/403/404');
    await expectApiError(res);
    expect(stable(await ADM.department(testRun, a.id))).toEqual(beforeA);
    expect(stable(await ADM.department(testRun, b.id))).toEqual(beforeB);
  });

  test("ADM-DEP-074 Gỡ khỏi bộ phận người đó không thuộc", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const a = await ADM.newDepartment(testRun);
    const b = await ADM.newDepartment(testRun);
    const u = await ADM.newUser(testRun, { departmentIds: [a.id] });
    const before = stable(await ADM.user(testRun, u.id));
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/users/{userId}/departments/{departmentId}', { params: { userId: u.id, departmentId: b.id } });
    expectStatusIn(res, '400/403/404');
    await expectApiError(res);
    expect(stable(await ADM.user(testRun, u.id))).toEqual(before);
    expect(ADM.idsOf((await ADM.department(testRun, a.id)).members)).toEqual([u.id]);
    expect((await ADM.department(testRun, b.id)).members).toEqual([]);
  });
});
