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

test.describe("Quản trị người dùng", () => {
  test("ADM-USR-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/admin/users", "POST /api/admin/users", "GET /api/admin/users/{id}", "PUT /api/admin/users/{id}", "POST /api/admin/users/{id}/lock", "POST /api/admin/users/{id}/unlock", "POST /api/admin/users/{id}/password/reset", "GET /api/admin/users/{id}/permissions", "GET /api/admin/users/{id}/permissions/export"];
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

  test("ADM-USR-005 Điều phối viên xem danh sách người dùng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const res = await http.call('GET /api/admin/users', { token: tok('dp'), query: { page: 1, perPage: 20 } });
    expectStatusIn(res, '403');
    await expectApiError(res);
    await expectNoData(res);
  });

  test("ADM-USR-015 Email chứa ký tự điều khiển", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const payload = ADM.userPayload(testRun, { email: 'a\r\nb@logxpro.test' });
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users', { json: payload });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'email');
    expect(await ADM.allAdmin(testRun, 'GET /api/admin/users', { search: payload.employeeCode })).toEqual([]);
  });
});
