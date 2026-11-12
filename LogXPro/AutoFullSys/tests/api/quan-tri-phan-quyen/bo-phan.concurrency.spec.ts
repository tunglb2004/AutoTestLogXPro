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

test.describe("Quản trị bộ phận", () => {
  test("ADM-DEP-018 Gửi trùng 2 lần cùng body", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const name = ADM.uniqueName('Điều phối AT lặp');
    const d = await ADM.newDepartment(testRun, { name, description: 'Bộ phận test' });
    const logs = await ADM.audit(testRun, d.id);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments', { json: { name, description: 'Bộ phận test' } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(ADM.idsOf(await ADM.allAdmin(testRun, 'GET /api/admin/departments', { search: name }))).toEqual([d.id]);
    expect(await ADM.audit(testRun, d.id)).toEqual(logs);
  });

  test("ADM-DEP-043 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const obj = await ADM.newDepartment(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/departments/{id}/deactivate', { params: { id: obj.id } });
    const api = 'POST /api/admin/departments/{id}/activate';
    expectStatusIn(await ADM.adminRequest(testRun, api, { params: { id: obj.id } }), '200/204');
    const before = stable(await ADM.department(testRun, obj.id));
    const logs = await ADM.audit(testRun, obj.id);
    const res = await ADM.adminRequest(testRun, api, { params: { id: obj.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.department(testRun, obj.id))).toEqual(before);
    expect(await ADM.audit(testRun, obj.id)).toEqual(logs);
  });

  test("ADM-DEP-050 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const obj = await ADM.newDepartment(testRun);
    
    const api = 'POST /api/admin/departments/{id}/deactivate';
    expectStatusIn(await ADM.adminRequest(testRun, api, { params: { id: obj.id } }), '200/204');
    const before = stable(await ADM.department(testRun, obj.id));
    const logs = await ADM.audit(testRun, obj.id);
    const res = await ADM.adminRequest(testRun, api, { params: { id: obj.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.department(testRun, obj.id))).toEqual(before);
    expect(await ADM.audit(testRun, obj.id)).toEqual(logs);
  });

  test("ADM-DEP-057 Gửi lại cùng vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun);
    await ADM.bindDepartmentRole(testRun, d.id, r.id);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments/{id}/roles', { params: { id: d.id }, json: { roleIds: [r.id] } });
    expectStatusIn(res, '200/201');
    expect(ADM.idsOf((await ADM.department(testRun, d.id)).roles)).toEqual([r.id]);
    expect(ADM.idsOf((await ADM.role(testRun, r.id)).departments)).toEqual([d.id]);
  });

  test("ADM-DEP-072 Thêm lại cùng bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const u = await ADM.newUser(testRun);
    const args = { params: { userId: u.id }, json: { departmentId: d.id } };
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/departments', args), '200/204');
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/departments', args), '200/204/409');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).departments)).toEqual([d.id]);
    expect(ADM.idsOf((await ADM.department(testRun, d.id)).members)).toEqual([u.id]);
  });
});
