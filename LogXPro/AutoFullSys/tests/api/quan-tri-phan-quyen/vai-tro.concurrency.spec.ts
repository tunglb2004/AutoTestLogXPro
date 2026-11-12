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
  test("ADM-ROLE-021 Gửi trùng 2 lần cùng body", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const r = await ADM.newRole(testRun, ps);
    const logs = await ADM.audit(testRun, r.id);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/roles', { json: { name: r.name, description: r.description, permissions: ps } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(ADM.idsOf(await ADM.allAdmin(testRun, 'GET /api/admin/roles', { search: r.name }))).toEqual([r.id]);
    expect(await ADM.audit(testRun, r.id)).toEqual(logs);
  });

  test("ADM-ROLE-046 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const obj = await ADM.newRole(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: obj.id } });
    const api = 'POST /api/admin/roles/{id}/activate';
    expectStatusIn(await ADM.adminRequest(testRun, api, { params: { id: obj.id } }), '200/204');
    const before = stable(await ADM.role(testRun, obj.id));
    const logs = await ADM.audit(testRun, obj.id);
    const res = await ADM.adminRequest(testRun, api, { params: { id: obj.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.role(testRun, obj.id))).toEqual(before);
    expect(await ADM.audit(testRun, obj.id)).toEqual(logs);
  });

  test("ADM-ROLE-053 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const obj = await ADM.newRole(testRun);
    
    const api = 'POST /api/admin/roles/{id}/deactivate';
    expectStatusIn(await ADM.adminRequest(testRun, api, { params: { id: obj.id } }), '200/204');
    const before = stable(await ADM.role(testRun, obj.id));
    const logs = await ADM.audit(testRun, obj.id);
    const res = await ADM.adminRequest(testRun, api, { params: { id: obj.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.role(testRun, obj.id))).toEqual(before);
    expect(await ADM.audit(testRun, obj.id)).toEqual(logs);
  });

  test("ADM-ROLE-064 Thêm lại người đã có", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun);
    const args = { params: { id: r.id }, json: { userIds: [u.id] } };
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/users', args), '200/204');
    const before = stable(await ADM.members(testRun, r.id));
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/users', args), '200/204');
    expect(stable(await ADM.members(testRun, r.id))).toEqual(before);
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([r.id]);
  });

  test("ADM-ROLE-079 Gán lại vai trò đã có", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun);
    const args = { params: { userId: u.id }, json: { roleId: r.id } };
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/roles', args), '200/204');
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/roles', args), '200/204/409');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([r.id]);
    expect(ADM.idsOf(await ADM.members(testRun, r.id))).toEqual([u.id]);
  });
});
