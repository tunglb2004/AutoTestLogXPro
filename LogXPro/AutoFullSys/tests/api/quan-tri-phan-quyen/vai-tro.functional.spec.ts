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
import { coordinate, startService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
test.describe("Quản trị vai trò, nhật ký và thiết lập", () => {
  test("ADM-ROLE-002 Rổ quyền gom theo Khối và Role trong khối", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const res = await ADM.adminRequest(testRun, 'GET /api/admin/permissions');
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.length).toBeGreaterThan(0);
    expect(new Set(list.map((p: any) => p.code)).size, 'Mã quyền không trùng').toBe(list.length);
    const groups = [...new Set<string>(list.map((p: any) => p.groupName))];
    expect(groups, 'Đúng 27 nhóm quyền').toHaveLength(27);
    for (const rx of [/quản lý lead/i, /dịch vụ khai báo hải quan/i, /dịch vụ.*giám sát/i, /dịch vụ vận tải/i, /dịch vụ sang tải/i, /dịch vụ kho/i, /chi phí.*doanh thu/i, /giá bán định mức/i, /người dùng/i]) expect(groups.some((g) => rx.test(g)), String(rx)).toBe(true);
    for (const p of list) for (const field of ['code', 'name', 'groupName', 'blockCode', 'referenceRoleCode']) expect(typeof p[field], field).toBe('string');
  });

  test("ADM-ROLE-003 Rổ quyền cố định, không thêm được", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const before = (await ADM.catalogue(testRun)).sort((a: any, b: any) => a.code.localeCompare(b.code));
    expect(before.length).toBeGreaterThan(0);
    const after = (await ADM.catalogue(testRun)).sort((a: any, b: any) => a.code.localeCompare(b.code));
    expect(after, 'Đọc rổ quyền cố định không thay đổi dữ liệu').toEqual(before);
    const api = require('../../../test-data/openapi.json');
    const methods = Object.keys(api.paths['/api/admin/permissions']).filter((x) => ['post', 'put', 'patch', 'delete'].includes(x));
    expect(methods, 'Không cung cấp API thêm/sửa/xóa rổ quyền').toEqual([]);
  });

  test("ADM-ROLE-006 Danh sách vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const defaults = await ADM.allAdmin(testRun, 'GET /api/admin/roles');
    expect(defaults.some((x: any) => x.defaultRole === true && /quản trị hệ thống/i.test(x.name)), 'Có vai trò mặc định').toBe(true);
    const d = await ADM.newDepartment(testRun);
    const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    await ADM.bindDepartmentRole(testRun, d.id, r.id);
    await ADM.newUser(testRun, { roleIds: [r.id] });
    const rows = await ADM.allAdmin(testRun, 'GET /api/admin/roles', { search: r.name, active: true });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: r.id, name: r.name, active: true, userCount: 1, permissionCount: 1 });
    expect(ADM.idsOf(rows[0].departments)).toEqual([d.id]);
  });

  test("ADM-ROLE-007 Lọc vai trò vô hiệu theo bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const active = await ADM.newRole(testRun);
    const inactive = await ADM.newRole(testRun);
    const outsider = await ADM.newRole(testRun);
    await ADM.bindDepartmentRole(testRun, d.id, active.id);
    await ADM.bindDepartmentRole(testRun, d.id, inactive.id);
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: inactive.id } });
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: outsider.id } });
    const rows = await ADM.allAdmin(testRun, 'GET /api/admin/roles', { departmentId: [d.id], active: false });
    expect(ADM.idsOf(rows)).toEqual([inactive.id]);
    expect(rows[0].active).toBe(false);
  });

  test("ADM-ROLE-012 Tạo vai trò \"Điều phối Vận tải AT\" có quyền dịch vụ Vận tải", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    expect(ps).toHaveLength(8);
    const r = await ADM.newRole(testRun, ps, { name: ADM.uniqueName('Điều phối Vận tải AT') });
    expect(r.active).toBe(true);
    expect([...r.permissions].sort()).toEqual(ps);
    await ADM.expectAuditAdded(testRun, r.id, [], [r.name, ...ps]);
  });

  test("ADM-ROLE-013 Trùng tên vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun);
    const before = await ADM.allAdmin(testRun, 'GET /api/admin/roles', { search: r.name });
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/roles', { json: { name: r.name, permissions: [] } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.allAdmin(testRun, 'GET /api/admin/roles', { search: r.name }))).toEqual(stable(before));
  });

  test("ADM-ROLE-014 Cặp quyền nhạy cảm khi `sodMode` = `BLOCK`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ testRun, roles }) => {

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
        await ADM.adminData(testRun, 'PUT /api/admin/settings', { json: { sodMode: 'BLOCK' } });
        const res = await CREATE(pair);
        await track(res);
        expectStatusIn(res, '400/409/422', 'BLOCK: bị chặn');
        await expectApiError(res);
        await ADM.adminData(testRun, 'PUT /api/admin/settings', { json: { sodMode: 'WARN' } });
        const warn = await CREATE();
        await track(warn);
        expectStatusIn(warn, '400/409/422', 'WARN: cần xác nhận');
        const ok = await CREATE(pair);
        await track(ok);
        expectStatusIn(ok, '200/201', 'WARN + acknowledged: tạo được');
      } finally {
        await PUTSOD(original);
      }
    });

  });

  test("ADM-ROLE-015 Mã vai trò sai pattern", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const name = ADM.uniqueName('Sai mã vai trò AT');
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/roles', { json: { name, code: 'dieu-phoi', permissions: [] } });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'code');
    expect(await ADM.allAdmin(testRun, 'GET /api/admin/roles', { search: name })).toEqual([]);
  });

  test("ADM-ROLE-016 Vai trò mới chưa ai giữ thì không cấp quyền cho ai", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 1);
    const u = await ADM.newUser(testRun);
    const before = await ADM.effective(testRun, u.id);
    const r = await ADM.newRole(testRun, ps);
    expect(await ADM.members(testRun, r.id)).toEqual([]);
    expect((await ADM.role(testRun, r.id)).userCount).toBe(0);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-ROLE-026 Sửa quyền của vai trò, hiệu lực ngay", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const cat = await ADM.catalogue(testRun);
    const complete = cat.find((p: any) => /dịch vụ vận tải/i.test(p.groupName) && /hoàn thành dịch vụ/i.test(p.name)).code;
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
    const logs = await ADM.audit(testRun, r.id);
    const after = ps.filter((p) => p !== complete);
    const res = await ADM.adminRequest(testRun, 'PUT /api/admin/roles/{id}', { params: { id: r.id }, json: { name: r.name, description: r.description, permissions: after } });
    expectStatusIn(res, '200/204');
    expect((await ADM.role(testRun, r.id)).permissions.sort()).toEqual(after);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(after);
    await ADM.expectAuditAdded(testRun, r.id, ADM.idsOf(logs), [complete]);
  });

  test("ADM-ROLE-027 Không sửa được vai trò mặc định", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ testRun, roles }) => {

    const roleList = await ADM.allAdmin(testRun, 'GET /api/admin/roles');
    const def = roleList.find((r: any) => r.defaultRole) ?? roleList.find((r: any) => r.systemRole && /quản trị hệ thống/i.test(r.name));
    if (!def) throw new Error('Chuẩn bị dữ liệu thất bại: không thấy vai trò mặc định "Quản trị hệ thống"');
    const before = stable(await ADM.role(testRun, def.id));

    const res = await ADM.adminRequest(testRun, "PUT /api/admin/roles/{id}", { params: { id: def.id }, json: { name: `${def.name} đổi tên`, description: def.description ?? '', permissions: (await ADM.role(testRun, def.id)).permissions } });
    if (res.ok()) await ADM.adminRequest(testRun, "PUT /api/admin/roles/{id}", { params: { id: def.id }, json: { name: def.name, description: def.description ?? '', permissions: (before as any).permissions } });
    expectStatusIn(res, '403/409');
    expect(stable(await ADM.role(testRun, def.id)), 'Vai trò mặc định giữ nguyên').toEqual(before);

  });

  test("ADM-ROLE-028 Người giữ vai trò bị ảnh hưởng tức thì", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles, tok }) => {

    const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const cat = await ADM.catalogue(testRun);
    const done = cat.find((p: any) => /dịch vụ vận tải/i.test(p.groupName ?? '') && /hoàn thành dịch vụ/i.test(p.name ?? ''))?.code;
    const r = await ADM.newRole(testRun, ps, { name: ADM.uniqueName('Điều phối Vận tải AT') });
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const t = await ADM.loginUser(testRun, u);
    const o = await p0Order(testRun, 'KHQ_DONE');
    const refs = await testRun.p0Refs();
    await coordinate(testRun, o.svc.VT, [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: env.ref('CONTRACTOR_B_ID'), unitCode: refs.units.freight, routeIndex: 0 }], { USD: P0.fxUsd });
    await startService(testRun, o.svc.VT);
    const res = await ADM.adminRequest(testRun, "PUT /api/admin/roles/{id}", { params: { id: r.id }, json: { name: r.name, description: r.description ?? '', permissions: ps.filter((x: string) => x !== done) } });
    expectStatusIn(res, '200/201/204', 'bỏ quyền Hoàn thành dịch vụ');
    const c = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: t.accessToken, params: { id: o.id, type: o.svc.VT.type } });
    expectStatusIn(c, '403', 'người giữ vai trò bị chặn ngay');
    const svc = (await data(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } }))).services.find((s: any) => s.serviceTypeCode === o.svc.VT.type);
    expect(svc.status, 'Dịch vụ giữ Đang thực hiện').toBe('IN_PROGRESS');

  });

  test("ADM-ROLE-033 Xóa vai trò không còn người giữ", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun);
    expect(await ADM.members(testRun, r.id)).toEqual([]);
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/roles/{id}', { params: { id: r.id } }), '200/204');
    expectStatusIn(await ADM.adminRequest(testRun, 'GET /api/admin/roles/{id}', { params: { id: r.id } }), '404');
    expect(await ADM.allAdmin(testRun, 'GET /api/admin/roles', { search: r.name })).toEqual([]);
  });

  test("ADM-ROLE-034 Xóa vai trò còn người giữ", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const a = await ADM.newUser(testRun, { roleIds: [r.id] });
    const b = await ADM.newUser(testRun, { roleIds: [r.id] });
    const before = stable(await ADM.role(testRun, r.id));
    expect(ADM.idsOf(await ADM.members(testRun, r.id))).toEqual([a.id, b.id].sort());
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/roles/{id}', { params: { id: r.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.role(testRun, r.id))).toEqual(before);
    expect(ADM.idsOf(await ADM.members(testRun, r.id))).toEqual([a.id, b.id].sort());
  });

  test("ADM-ROLE-035 Xóa vai trò mặc định", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const roleList = await ADM.allAdmin(testRun, 'GET /api/admin/roles');
    const def = roleList.find((r: any) => r.defaultRole) ?? roleList.find((r: any) => r.systemRole && /quản trị hệ thống/i.test(r.name));
    if (!def) throw new Error('Chuẩn bị dữ liệu thất bại: không thấy vai trò mặc định "Quản trị hệ thống"');
    const before = stable(await ADM.role(testRun, def.id));

    const res = await ADM.adminRequest(testRun, "DELETE /api/admin/roles/{id}", { params: { id: def.id } });
    expectStatusIn(res, '403/409');
    expect(stable(await ADM.role(testRun, def.id)), 'Không xóa').toEqual(before);

  });

  test("ADM-ROLE-036 Xóa vai trò gỡ khỏi các bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun);
    await ADM.bindDepartmentRole(testRun, d.id, r.id);
    expect((await ADM.department(testRun, d.id)).roles.some((x: any) => x.id === r.id)).toBe(true);
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/roles/{id}', { params: { id: r.id } }), '200/204');
    expect((await ADM.department(testRun, d.id)).roles.some((x: any) => x.id === r.id)).toBe(false);
    expectStatusIn(await ADM.adminRequest(testRun, 'GET /api/admin/roles/{id}', { params: { id: r.id } }), '404');
  });

  test("ADM-ROLE-040 Kích hoạt lại vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: r.id } });
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/activate', { params: { id: r.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.role(testRun, r.id)).active).toBe(true);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
  });

  test("ADM-ROLE-041 Kích hoạt làm phát sinh cặp quyền nhạy cảm", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

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
        const a = await ADM.newRole(testRun, [pair[0]]);
        const k5 = await ADM.newRole(testRun, [pair[1]]);
        const u = await ADM.newUser(testRun, { roleIds: [a.id] });
        await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: k5.id } });
        await ADM.adminData(testRun, 'POST /api/admin/users/{userId}/roles', { params: { userId: u.id }, json: { roleId: k5.id, acknowledged: pair } });
        const res = await ADM.adminRequest(testRun, "POST /api/admin/roles/{id}/activate", { params: { id: k5.id } });
        expectStatusIn(res, '400/409/422', 'không gửi acknowledged');
        expect((await ADM.role(testRun, k5.id)).active, 'Chưa kích hoạt').toBe(false);
        const ok = await ADM.adminRequest(testRun, "POST /api/admin/roles/{id}/activate", { params: { id: k5.id }, json: { acknowledged: pair } });
        expectStatusIn(ok, '200/204', 'gửi lại kèm acknowledged');
        expect((await ADM.role(testRun, k5.id)).active).toBe(true);
      } finally {
        await PUTSOD(original);
      }
    });

  });

  test("ADM-ROLE-042 Quyền quay lại cho người giữ", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: r.id } });
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/activate', { params: { id: r.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.role(testRun, r.id)).active).toBe(true);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
  });

  test("ADM-ROLE-047 Vô hiệu vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: r.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.role(testRun, r.id)).active).toBe(false);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([]);
    expect(ADM.idsOf(await ADM.members(testRun, r.id))).toEqual([u.id]);
  });

  test("ADM-ROLE-048 Không vô hiệu được vai trò mặc định", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    const roleList = await ADM.allAdmin(testRun, 'GET /api/admin/roles');
    const def = roleList.find((r: any) => r.defaultRole) ?? roleList.find((r: any) => r.systemRole && /quản trị hệ thống/i.test(r.name));
    if (!def) throw new Error('Chuẩn bị dữ liệu thất bại: không thấy vai trò mặc định "Quản trị hệ thống"');
    const before = stable(await ADM.role(testRun, def.id));

    const res = await ADM.adminRequest(testRun, "POST /api/admin/roles/{id}/deactivate", { params: { id: def.id } });
    if (res.ok()) await ADM.adminRequest(testRun, "POST /api/admin/roles/{id}/activate", { params: { id: def.id } });
    expectStatusIn(res, '403/409');
    expect(stable(await ADM.role(testRun, def.id)), 'Vai trò giữ nguyên').toEqual(before);

  });

  test("ADM-ROLE-049 Vai trò khác của người dùng không bị ảnh hưởng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 2);
    const a = await ADM.newRole(testRun, [ps[0]]);
    const b = await ADM.newRole(testRun, [ps[1]]);
    const u = await ADM.newUser(testRun, { roleIds: [a.id, b.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: a.id } }), '200/204');
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([ps[1]]);
    expect((await ADM.role(testRun, b.id)).active).toBe(true);
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([a.id, b.id].sort());
  });

  test("ADM-ROLE-058 Thêm người dùng vào vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun);
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/users', { params: { id: r.id }, json: { userIds: [u.id] } });
    expectStatusIn(res, '200/204');
    expect(ADM.idsOf(await ADM.members(testRun, r.id))).toEqual([u.id]);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
  });

  test("ADM-ROLE-059 Thêm người dùng đã khóa", { tag: ["@api", "@quan-tri-phan-quyen", "@p3", "@cho-xac-nhan"] }, async ({ http, testRun, roles }) => {

    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: u.id } });
    const res = await ADM.adminRequest(testRun, "POST /api/admin/roles/{id}/users", { params: { id: r.id }, json: { userIds: [u.id] } });
    expectStatusIn(res, '200/204/409');
    test.info().annotations.push({ type: 'Chờ xác nhận', description: `Thêm người dùng đã khóa vào vai trò: HTTP ${res.status()}` });
    const login = await http.call('POST /api/auth/login', { json: { tenantCode: env.tenantCode, email: u.email, password: u.password } });
    expectStatusIn(login, '401/403', 'Người bị khóa vẫn không đăng nhập được');

  });

  test("ADM-ROLE-060 Quyền cộng dồn, không thay vai trò cũ", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 2);
    const old = await ADM.newRole(testRun, [ps[0]]);
    const added = await ADM.newRole(testRun, [ps[1]]);
    const u = await ADM.newUser(testRun, { roleIds: [old.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([ps[0]]);
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/users', { params: { id: added.id }, json: { userIds: [u.id] } }), '200/204');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([old.id, added.id].sort());
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
  });

  test("ADM-ROLE-067 Người còn lại không bị ảnh hưởng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    const a = await ADM.newUser(testRun, { roleIds: [r.id] });
    const b = await ADM.newUser(testRun, { roleIds: [r.id] });
    const ta = await ADM.loginUser(testRun, a);
    const tb = await ADM.loginUser(testRun, b);
    expect(await ADM.myPermissions(testRun, ta.accessToken)).toEqual(ps);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/roles/{id}/users/{userId}', { params: { id: r.id, userId: a.id } });
    expectStatusIn(res, '200/204');
    expect(await ADM.myPermissions(testRun, ta.accessToken)).toEqual([]);
    expect(await ADM.myPermissions(testRun, tb.accessToken)).toEqual(ps);
    expect(ADM.idsOf(await ADM.members(testRun, r.id))).toEqual([b.id]);
  });

  test("ADM-ROLE-068 Audit log ghi gỡ", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const before = await ADM.audit(testRun, r.id);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/roles/{id}/users/{userId}', { params: { id: r.id, userId: u.id } });
    expectStatusIn(res, '200/204');
    const added = await ADM.expectAuditAdded(testRun, r.id, ADM.idsOf(before), [u.id]);
    expect(JSON.stringify(added)).toMatch(/gỡ|remove|revoke/i);
    expect(await ADM.members(testRun, r.id)).toEqual([]);
  });

  test("ADM-ROLE-072 Gán thêm vai trò cho người dùng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 2);
    const a = await ADM.newRole(testRun, [ps[0]]);
    const b = await ADM.newRole(testRun, [ps[1]]);
    const u = await ADM.newUser(testRun, { roleIds: [a.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([ps[0]]);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/roles', { params: { userId: u.id }, json: { roleId: b.id } });
    expectStatusIn(res, '200/204');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([a.id, b.id].sort());
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
  });

  test("ADM-ROLE-073 Gán vai trò đang vô hiệu", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: r.id } });
    const u = await ADM.newUser(testRun);
    const t = await ADM.loginUser(testRun, u);
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/roles', { params: { userId: u.id }, json: { roleId: r.id } }), '200/204');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([r.id]);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([]);
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/activate', { params: { id: r.id } });
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
  });

  test("ADM-ROLE-074 Không thay vai trò cũ", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 2);
    const a = await ADM.newRole(testRun, [ps[0]]);
    const b = await ADM.newRole(testRun, [ps[1]]);
    const u = await ADM.newUser(testRun, { roleIds: [a.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([ps[0]]);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/roles', { params: { userId: u.id }, json: { roleId: b.id } });
    expectStatusIn(res, '200/204');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([a.id, b.id].sort());
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
  });

  test("ADM-ROLE-082 Gỡ vai trò cuối cùng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    await ADM.adminData(testRun, 'DELETE /api/admin/users/{userId}/roles/{roleId}', { params: { userId: u.id, roleId: r.id } });
    expect((await ADM.user(testRun, u.id)).roles).toEqual([]);
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([]);
    expectStatusIn(await http.call('GET /api/service-orders', { token: t.accessToken }), '403');
  });

  test("ADM-ROLE-083 Phiếu đang điều phối không bị xóa khi người điều phối mất quyền", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles, tok }) => {

    const cat = await ADM.catalogue(testRun);
    const st = ADM.permissionCodes(cat.filter((p: any) => /dịch vụ sang tải/i.test(p.groupName ?? '') || (/phiếu dịch vụ/i.test(p.groupName ?? '') && /xem/i.test(p.name ?? ''))));
    const r = await ADM.newRole(testRun, st, { name: ADM.uniqueName('Điều phối Sang tải AT') });
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const t = await ADM.loginUser(testRun, u);
    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const coord = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: t.accessToken, params: { id: o.id, type: refs.services.ST }, json: { assignments: [{ priceConfigurationItemId: o.base.items.transload.id, contractorId: env.ref('CONTRACTOR_A_ID'), unitCode: refs.units.transload }] } });
    if (!coord.ok()) throw new Error(`Chuẩn bị dữ liệu thất bại: người giữ vai trò Sang tải chưa điều phối được (HTTP ${coord.status()})`);
    const snap = async () => stable(await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.ST } })));
    const before = await snap();
    const res = await ADM.adminRequest(testRun, "DELETE /api/admin/users/{userId}/roles/{roleId}", { params: { userId: u.id, roleId: r.id } });
    expectStatusIn(res, '200/204');
    expect(await snap(), 'Dữ liệu điều phối của phiếu giữ nguyên').toEqual(before);
    expectStatusIn(await http.call('GET /api/k3/service-orders/{id}', { token: tok('dp'), params: { id: o.id } }), '200', 'Phiếu vẫn đọc được');

  });

  test("ADM-ROLE-087 Nhật ký hoạt động quản trị", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ testRun, page }) => {

    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    const tag = `dp.khq.${Math.random().toString(36).slice(2, 8)}`;
    const u = await ADM.newUser(testRun, { email: `${tag}.${Date.now()}@logx-test.vn` });
    await ADM.bindRole(testRun, u.id, r.id);
    const res = await ADM.adminRequest(testRun, "GET /api/admin/audit-log", { query: { search: tag, page: 1, perPage: 20 } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    const at = rows.map((x: any) => Date.parse(x.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((p, q) => q - p));
    const mine = await ADM.audit(testRun, u.id);
    expect(mine.length, 'Có bản ghi tạo người dùng và gán vai trò').toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(mine), 'Có bản ghi gán vai trò').toContain(r.id);
    for (const e of mine) {
      expect(e.actorUserId && e.at, 'Kèm người thực hiện, thời gian').toBeTruthy();
      expect(e, 'Có trước/sau').toHaveProperty('newValue');
    }

  });

  test("ADM-ROLE-088 Lọc theo đối tượng và khoảng thời gian", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles, page }) => {

    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: r.id } });
    const entity = (await ADM.audit(testRun, r.id))[0]?.targetEntity;
    if (!entity) throw new Error('Chuẩn bị dữ liệu thất bại: chưa có bản ghi nhật ký cho vai trò vừa tạo');
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const res = await ADM.adminRequest(testRun, "GET /api/admin/audit-log", { query: { targetEntity: entity, targetId: r.id, from: start.toISOString(), to: new Date(Date.now() + 60_000).toISOString(), page: 1, perPage: 100 } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((x: any) => x.targetId === r.id && Date.parse(x.at) >= start.getTime()), 'Chỉ bản ghi của R trong ngày').toBe(true);
    const at = rows.map((x: any) => Date.parse(x.at));
    expect(at, 'Giảm dần theo thời gian').toEqual([...at].sort((p, q) => q - p));

  });

  test("ADM-ROLE-089 Nhật ký chỉ đọc", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun);
    const before = await ADM.audit(testRun, r.id);
    expect(before.length).toBeGreaterThan(0);
    const res = await ADM.adminRequest(testRun, 'GET /api/admin/audit-log', { method: 'DELETE', query: { targetId: r.id, query: JSON.stringify({ page: 1, perPage: 100 }) } });
    expectStatusIn(res, '404/405');
    expect(await ADM.audit(testRun, r.id)).toEqual(before);
  });

  test("ADM-ROLE-097 Đổi mức kiểm soát Cảnh báo/Chặn", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ testRun, roles }) => {

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
        expect(await SETTINGS(), 'Lưu BLOCK').toBe('BLOCK');
        const blocked = await CREATE(pair);
        await track(blocked);
        expectStatusIn(blocked, '400/409/422', 'Tạo vai trò có cặp nhạy cảm bị chặn');
      } finally {
        await PUTSOD(original);
      }
    });

  });

  test("ADM-ROLE-098 `WARN` → `BLOCK` → `WARN`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ testRun, roles }) => {

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
        for (const v of ['BLOCK', 'WARN']) {
          expectStatusIn(await PUTSOD(v), '200/204', v);
          expect(await SETTINGS(), `Đọc lại ${v}`).toBe(v);
        }
      } finally {
        await PUTSOD(original);
      }
    });

  });

  test("ADM-ROLE-099 Đổi sang `BLOCK` không thu hồi vai trò đã tồn tại", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun, roles }) => {

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
        const r = await ADM.newRole(testRun, pair, { acknowledged: pair });
        const res = await PUTSOD('BLOCK');
        expectStatusIn(res, '200/204');
        expect([...(await ADM.role(testRun, r.id)).permissions].sort(), 'Vai trò cũ giữ nguyên quyền').toEqual([...pair].sort());
      } finally {
        await PUTSOD(original);
      }
    });

  });

  test("ADM-ROLE-100 Thay đổi thiết lập ghi nhật ký", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun, roles, page }) => {

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
        const from = await SETTINGS();
        const to = from === 'BLOCK' ? 'WARN' : 'BLOCK';
        expectStatusIn(await PUTSOD(to), '200/204', 'đổi thiết lập');
        const res = await ADM.adminRequest(testRun, "GET /api/admin/audit-log", { query: { search: 'sodMode', page: 1, perPage: 50 } });
        expectStatusIn(res, '200/204');
        const rows = items(await data(res)).filter((x: any) => /sod/i.test(JSON.stringify(x)));
        expect(rows.length, 'Có bản ghi thay đổi thiết lập').toBeGreaterThan(0);
        expect(JSON.stringify(rows[0]), 'Có trước/sau').toMatch(new RegExp(`${from}[\\s\\S]*${to}|${to}[\\s\\S]*${from}`));
      } finally {
        await PUTSOD(original);
      }
    });

  });

  test("ADM-ROLE-022 Chi tiết vai trò và danh sách quyền", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const ps = await ADM.safeViewCodes(testRun, 2);
    const r = await ADM.newRole(testRun, ps, { description: 'Mô tả vai trò cần đọc lại' });
    await ADM.bindDepartmentRole(testRun, d.id, r.id);
    const res = await ADM.adminRequest(testRun, 'GET /api/admin/roles/{id}', { params: { id: r.id } });
    expectStatusIn(res, '200');
    const actual = await data(res);
    expect(actual).toMatchObject({ id: r.id, name: r.name, description: 'Mô tả vai trò cần đọc lại', active: true });
    expect(actual.permissions.sort()).toEqual(ps);
    expect(ADM.idsOf(actual.departments)).toEqual([d.id]);
  });

  test("ADM-ROLE-054 Người dùng đang giữ vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 2);
    const r = await ADM.newRole(testRun, [ps[0]]);
    const other = await ADM.newRole(testRun, [ps[1]]);
    const a = await ADM.newUser(testRun, { roleIds: [r.id] });
    const b = await ADM.newUser(testRun, { roleIds: [r.id, other.id] });
    const res = await ADM.adminRequest(testRun, 'GET /api/admin/roles/{id}/users', { params: { id: r.id } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    expect(ADM.idsOf(rows)).toEqual([a.id, b.id].sort());
    expect(rows.find((x: any) => x.id === a.id).roleCount).toBe(1);
    expect(rows.find((x: any) => x.id === b.id).roleCount).toBe(2);
  });

  test("ADM-ROLE-065 Gỡ người dùng khỏi vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    const a = await ADM.newUser(testRun, { roleIds: [r.id] });
    const b = await ADM.newUser(testRun, { roleIds: [r.id] });
    const ta = await ADM.loginUser(testRun, a);
    const tb = await ADM.loginUser(testRun, b);
    expect(await ADM.myPermissions(testRun, ta.accessToken)).toEqual(ps);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/roles/{id}/users/{userId}', { params: { id: r.id, userId: a.id } });
    expectStatusIn(res, '200/204');
    expect(await ADM.myPermissions(testRun, ta.accessToken)).toEqual([]);
    expect(await ADM.myPermissions(testRun, tb.accessToken)).toEqual(ps);
    expect(ADM.idsOf(await ADM.members(testRun, r.id))).toEqual([b.id]);
  });

  test("ADM-ROLE-080 Gỡ vai trò khỏi người dùng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/users/{userId}/roles/{roleId}', { params: { userId: u.id, roleId: r.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.user(testRun, u.id)).roles).toEqual([]);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([]);
  });

  test("ADM-ROLE-094 Đọc thiết lập kiểm soát cặp nhạy cảm", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const res = await ADM.adminRequest(testRun, 'GET /api/admin/settings');
    expectStatusIn(res, '200');
    const settings = await data(res);
    expect(['WARN', 'BLOCK']).toContain(settings.sodMode);
  });
});
