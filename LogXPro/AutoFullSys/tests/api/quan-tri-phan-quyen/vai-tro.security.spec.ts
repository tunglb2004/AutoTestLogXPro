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

test.describe("Quản trị vai trò, nhật ký và thiết lập", () => {
  test("ADM-ROLE-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/admin/permissions", "GET /api/admin/roles", "POST /api/admin/roles", "GET /api/admin/roles/{id}", "PUT /api/admin/roles/{id}", "DELETE /api/admin/roles/{id}", "POST /api/admin/roles/{id}/activate", "POST /api/admin/roles/{id}/deactivate", "GET /api/admin/roles/{id}/users", "POST /api/admin/roles/{id}/users", "DELETE /api/admin/roles/{id}/users/{userId}", "POST /api/admin/users/{userId}/roles", "DELETE /api/admin/users/{userId}/roles/{roleId}", "GET /api/admin/audit-log", "GET /api/admin/settings", "PUT /api/admin/settings"];
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

  test("ADM-ROLE-066 Gỡ người không giữ vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun);
    const before = stable(await ADM.user(testRun, u.id));
    expect(await ADM.members(testRun, r.id)).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/roles/{id}/users/{userId}', { params: { id: r.id, userId: u.id } });
    expectStatusIn(res, '400/403/404');
    await expectApiError(res);
    expect(stable(await ADM.user(testRun, u.id))).toEqual(before);
    expect(await ADM.members(testRun, r.id)).toEqual([]);
  });

  test("ADM-ROLE-081 Gỡ vai trò người dùng không giữ", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun);
    const before = stable(await ADM.user(testRun, u.id));
    expect(await ADM.members(testRun, r.id)).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/users/{userId}/roles/{roleId}', { params: { userId: u.id, roleId: r.id } });
    expectStatusIn(res, '400/403/404');
    await expectApiError(res);
    expect(stable(await ADM.user(testRun, u.id))).toEqual(before);
    expect(await ADM.members(testRun, r.id)).toEqual([]);
  });

  test("ADM-ROLE-101 Người không phải ADMIN đổi thiết lập", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const before = await ADM.adminData(testRun, 'GET /api/admin/settings');
    const res = await http.call('PUT /api/admin/settings', { token: tok('cc'), json: { sodMode: 'WARN' } });
    expectStatusIn(res, '403');
    await expectApiError(res);
    await expectNoData(res);
    expect(await ADM.adminData(testRun, 'GET /api/admin/settings')).toEqual(before);
  });
});
