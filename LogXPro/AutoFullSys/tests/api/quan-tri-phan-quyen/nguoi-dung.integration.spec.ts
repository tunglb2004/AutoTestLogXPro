/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';

import { exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { readXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { startService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Quản trị người dùng", () => {
  test("ADM-USR-062 File đúng định dạng và nội dung", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ testRun, roles }) => {

    const ps = await ADM.servicePermissionCodes(testRun, 'KHQ');
    const r = await ADM.newRole(testRun, ps, { name: ADM.uniqueName('Điều phối Khai báo hải quan') });
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const perms = await ADM.effective(testRun, u.id);
    const res = await ADM.adminRequest(testRun, "GET /api/admin/users/{id}/permissions/export", { params: { id: u.id } });
    expectStatusIn(res, '200');
    const x = await readXlsx(await res.body());
    const permRows = x.rows.filter((row) => perms.some((p: any) => row.some((c) => String(c ?? '').trim() === p.name)));

    expect(res.headers()['content-type'] ?? '').toMatch(/spreadsheetml/);
    expect(res.headers()['content-disposition'] ?? '', 'Có tên file').toMatch(/filename/i);
    expect(permRows.length, 'Đủ dòng quyền').toBe(perms.length);
    const text = JSON.stringify(x.rows);
    for (const p of perms) {
      expect(text, `Có nhóm ${p.groupName}`).toContain(p.groupName);
      for (const src of p.roles ?? []) expect(text, `Có vai trò nguồn ${src.name}`).toContain(src.name);
    }

  });
});
