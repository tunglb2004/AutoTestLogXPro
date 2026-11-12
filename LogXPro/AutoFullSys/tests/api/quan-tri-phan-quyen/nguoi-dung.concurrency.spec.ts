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
test.describe("Quản trị người dùng", () => {
  test("ADM-USR-020 Gửi trùng 2 lần cùng body", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'KHQ'));
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const logs = await ADM.audit(testRun, u.id);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users', { json: u.payload });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(ADM.idsOf(await ADM.allAdmin(testRun, 'GET /api/admin/users', { search: u.email }))).toEqual([u.id]);
    expect(await ADM.audit(testRun, u.id)).toEqual(logs);
  });

  test("ADM-USR-041 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const obj = await ADM.newUser(testRun);
    
    const api = 'POST /api/admin/users/{id}/lock';
    expectStatusIn(await ADM.adminRequest(testRun, api, { params: { id: obj.id } }), '200/204');
    const before = stable(await ADM.user(testRun, obj.id));
    const logs = await ADM.audit(testRun, obj.id);
    const res = await ADM.adminRequest(testRun, api, { params: { id: obj.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.user(testRun, obj.id))).toEqual(before);
    expect(await ADM.audit(testRun, obj.id)).toEqual(logs);
  });

  test("ADM-USR-049 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const obj = await ADM.newUser(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: obj.id } });
    const api = 'POST /api/admin/users/{id}/unlock';
    expectStatusIn(await ADM.adminRequest(testRun, api, { params: { id: obj.id } }), '200/204');
    const before = stable(await ADM.user(testRun, obj.id));
    const logs = await ADM.audit(testRun, obj.id);
    const res = await ADM.adminRequest(testRun, api, { params: { id: obj.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.user(testRun, obj.id))).toEqual(before);
    expect(await ADM.audit(testRun, obj.id)).toEqual(logs);
  });

  test("ADM-USR-056 Gọi lặp cho cùng kết quả, không ghi dữ liệu", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun }) => {

    const u = await ADM.newUser(testRun);
    await ADM.loginUser(testRun, u);
    const RESET = () => ADM.adminRequest(testRun, "POST /api/admin/users/{id}/password/reset", { params: { id: u.id } });
    const r1 = await RESET();
    expectStatusIn(r1, '200/204', 'lần 1');
    const after1 = await ADM.user(testRun, u.id);
    const keep = ({ updatedAt: _a, lastLoginAt: _b, ...rest }: any) => stable(rest);
    const r2 = await RESET();
    expectStatusIn(r2, '200/204', 'lần 2');
    expect(await data(r2), 'Hai lần trả kết quả giống nhau').toEqual(await data(r1));
    expect(keep(await ADM.user(testRun, u.id)), 'Không tạo/sửa bản ghi nào').toEqual(keep(after1));

  });
});
