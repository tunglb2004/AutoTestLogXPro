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
  test("ADM-USR-002 Danh sách người dùng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'KHQ'));
    const u = await ADM.newUser(testRun, { roleIds: [r.id], departmentIds: [d.id] });
    for (const search of [u.employeeCode, u.displayName, u.email]) {
      const res = await ADM.adminRequest(testRun, 'GET /api/admin/users', { query: { search, status: ['ACTIVE'], page: 1, perPage: 100 } });
      expectStatusIn(res, '200');
      const rows = items(await data(res));
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ id: u.id, employeeCode: u.employeeCode, displayName: u.displayName, email: u.email, status: 'ACTIVE' });
      expect(ADM.idsOf(rows[0].roles)).toEqual([r.id]);
      expect(ADM.idsOf(rows[0].departments)).toEqual([d.id]);
    }
  });

  test("ADM-USR-003 Lọc nhiều vai trò là HOẶC", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 2);
    const a = await ADM.newRole(testRun, [ps[0]]);
    const b = await ADM.newRole(testRun, [ps[1]]);
    const ua = await ADM.newUser(testRun, { roleIds: [a.id] });
    const ub = await ADM.newUser(testRun, { roleIds: [b.id] });
    const both = await ADM.newUser(testRun, { roleIds: [a.id, b.id] });
    await ADM.newUser(testRun);
    const rows = await ADM.allAdmin(testRun, 'GET /api/admin/users', { roleId: [a.id, b.id] });
    expect(ADM.idsOf(rows)).toEqual([ua.id, ub.id, both.id].sort());
  });

  test("ADM-USR-004 Lọc theo bộ phận và trạng thái", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const active = await ADM.newUser(testRun, { departmentIds: [d.id] });
    const locked = await ADM.newUser(testRun, { departmentIds: [d.id] });
    const outside = await ADM.newUser(testRun);
    for (const u of [locked, outside]) await ADM.adminData(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: u.id } });
    const rows = await ADM.allAdmin(testRun, 'GET /api/admin/users', { departmentId: [d.id], status: ['DISABLED', 'SUSPENDED'] });
    expect(ADM.idsOf(rows)).toEqual([locked.id]);
    expect(['DISABLED', 'SUSPENDED']).toContain(rows[0].status);
    expect(rows[0].departments.some((x: any) => x.id === d.id)).toBe(true);
    expect(rows.some((x: any) => x.id === active.id)).toBe(false);
  });

  test("ADM-USR-010 Tạo tài khoản điều phối theo dịch vụ", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'KHQ');
    const r = await ADM.newRole(testRun, ps, { name: ADM.uniqueName('Điều phối Khai báo hải quan AT') });
    const u = await ADM.newUser(testRun, { roleIds: [r.id], password: undefined, displayName: ADM.uniqueName('Điều phối KHQ AT') });
    expect(u.status).toBe('ACTIVE');
    expect(u.passwordChangeRequired, 'Mật khẩu mặc định phải đổi ở lần đầu').toBe(true);
    expect(typeof u.password, 'API cấp mật khẩu mặc định').toBe('string');
    expect(u.password.length).toBeGreaterThan(0);
    const t = await ADM.loginUser(testRun, u);
    const myself = await must(await http.call('GET /api/auth/me', { token: t.accessToken }), 'Thông tin sau đăng nhập lần đầu');
    expect(myself.passwordChangeRequired).toBe(true);
    expect(ADM.idsOf(u.roles)).toEqual([r.id]);
    await ADM.expectAuditAdded(testRun, u.id, [], [u.email]);
  });

  test("ADM-USR-011 Trùng email hoặc mã nhân viên", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    for (const over of [{ email: u.email }, { employeeCode: u.employeeCode }]) {
      const payload = ADM.userPayload(testRun, over);
      const res = await ADM.adminRequest(testRun, 'POST /api/admin/users', { json: payload });
      expectStatusIn(res, '400/409/422');
      await expectApiError(res);
      expect((await ADM.allAdmin(testRun, 'GET /api/admin/users', { search: u.email })).map((x: any) => x.id)).toEqual([u.id]);
      const uniqueValue = 'email' in over ? payload.employeeCode : payload.email;
      expect(await ADM.allAdmin(testRun, 'GET /api/admin/users', { search: uniqueValue })).toEqual([]);
    }
  });

  test("ADM-USR-012 Số điện thoại phải 10–11 chữ số", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
for (const phone of ['091234567', '091234567890']) {
      const payload = ADM.userPayload(testRun, { phone });
      const res = await ADM.adminRequest(testRun, 'POST /api/admin/users', { json: payload });
      expectStatusIn(res, '400/422');
      expectOnlyFieldError(await expectApiError(res), 'phone');
      expect(await ADM.allAdmin(testRun, 'GET /api/admin/users', { search: payload.email })).toEqual([]);
    }
    const u = await ADM.newUser(testRun, { phone: '' });
    expect(u.phone ?? '').toBe('');
    expect(u.status).toBe('ACTIVE');
  });

  test("ADM-USR-013 Tài khoản mới ở trạng thái hoạt động", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    const res = await ADM.adminRequest(testRun, 'GET /api/admin/users/{id}', { params: { id: u.id } });
    expectStatusIn(res, '200');
    expect(await data(res)).toMatchObject({ id: u.id, email: u.email, status: 'ACTIVE' });
  });

  test("ADM-USR-014 Quyền hiệu lực = quyền vai trò được gán", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'KHQ');
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    expect(ADM.permissionCodes(await ADM.effective(testRun, u.id))).toEqual(ps);
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([r.id]);
  });

  test("ADM-USR-025 Sửa người dùng và thay danh sách vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 3);
    const old = await ADM.newRole(testRun, [ps[0]]);
    const a = await ADM.newRole(testRun, [ps[1]]);
    const b = await ADM.newRole(testRun, [ps[2]]);
    const u = await ADM.newUser(testRun, { roleIds: [old.id] });
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([ps[0]]);
    const before = await ADM.audit(testRun, u.id);
    const res = await ADM.updateUser(testRun, u, { roleIds: [a.id, b.id] });
    expectStatusIn(res, '200/204');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([a.id, b.id].sort());
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([ps[1], ps[2]].sort());
    await ADM.expectAuditAdded(testRun, u.id, ADM.idsOf(before), [old.id, a.id, b.id]);
  });

  test("ADM-USR-026 Đổi email sang email đã dùng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const a = await ADM.newUser(testRun);
    const b = await ADM.newUser(testRun);
    const before = stable(await ADM.user(testRun, a.id));
    const res = await ADM.updateUser(testRun, a, { email: b.email });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.user(testRun, a.id))).toEqual(before);
    expect((await ADM.user(testRun, b.id)).email).toBe(b.email);
  });

  test("ADM-USR-027 `roleIds` rỗng gỡ hết vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const r = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'KHQ'));
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const t = await ADM.loginUser(testRun, u);
    expect((await ADM.myPermissions(testRun, t.accessToken)).length).toBeGreaterThan(0);
    expectStatusIn(await ADM.updateUser(testRun, u, { roleIds: [] }), '200/201/204');
    expect((await ADM.user(testRun, u.id)).roles).toEqual([]);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual([]);
    const again = await ADM.loginUser(testRun, u);
    expectStatusIn(await http.call('GET /api/service-orders', { token: again.accessToken }), '403');
  });

  test("ADM-USR-028 Không gửi `roleIds` thì giữ vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 2);
    const a = await ADM.newRole(testRun, [ps[0]]);
    const b = await ADM.newRole(testRun, [ps[1]]);
    const u = await ADM.newUser(testRun, { roleIds: [a.id, b.id] });
    const before = await ADM.effective(testRun, u.id);
    const name = ADM.uniqueName('Tên cập nhật');
    expectStatusIn(await ADM.updateUser(testRun, u, { displayName: name }), '200/204');
    const after = await ADM.user(testRun, u.id);
    expect(after.displayName).toBe(name);
    expect(ADM.idsOf(after.roles)).toEqual([a.id, b.id].sort());
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-USR-033 Khóa tài khoản không còn việc dở", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    expect(u.status).toBe('ACTIVE');
    const t = await ADM.loginUser(testRun, u);
    expectStatusIn(await http.call('GET /api/auth/me', { token: t.accessToken }), '200');
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: u.id } });
    expectStatusIn(res, '200/204');
    const actual = await ADM.user(testRun, u.id);
    expect(['DISABLED', 'SUSPENDED']).toContain(actual.status);
    expectStatusIn(await http.call('GET /api/auth/me', { token: t.accessToken }), '401');
    expectStatusIn(await http.call('POST /api/auth/refresh', { json: { refreshToken: t.refreshToken } }), '401');
  });

  test("ADM-USR-034 Chặn khóa khi còn công việc dang dở", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {

    const me = await data(await http.call('GET /api/auth/me', { token: tok('k1') }));
    await createRfq(testRun, {});
    const status0 = (await ADM.user(testRun, me.userId)).status;
    const res = await ADM.adminRequest(testRun, "POST /api/admin/users/{id}/lock", { params: { id: me.userId } });
    if (res.ok()) await ADM.adminRequest(testRun, "POST /api/admin/users/{id}/unlock", { params: { id: me.userId } });
    expectStatusIn(res, '400/409/422');
    const err = await expectApiError(res);
    expect((await ADM.user(testRun, me.userId)).status, 'Vẫn ACTIVE').toBe(status0);

    test.info().annotations.push({ type: 'Ghi nhận', description: `Danh sách việc chưa bàn giao: ${JSON.stringify(err).slice(0, 400)}` });
    expect(JSON.stringify(err).length, 'Trả danh sách việc chưa bàn giao').toBeGreaterThan(20);

  });

  test("ADM-USR-035 Chặn khóa người phụ trách duy nhất của khách hàng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {

    const me = await data(await http.call('GET /api/auth/me', { token: tok('k1b') }));
    const status0 = (await ADM.user(testRun, me.userId)).status;
    const res = await ADM.adminRequest(testRun, "POST /api/admin/users/{id}/lock", { params: { id: me.userId } });
    if (res.ok()) await ADM.adminRequest(testRun, "POST /api/admin/users/{id}/unlock", { params: { id: me.userId } });
    expectStatusIn(res, '400/409/422');
    const err = await expectApiError(res);
    expect((await ADM.user(testRun, me.userId)).status, 'Vẫn ACTIVE').toBe(status0);

    test.info().annotations.push({ type: 'Ghi nhận', description: `Yêu cầu phân công lại: ${JSON.stringify(err).slice(0, 300)}` });

  });

  test("ADM-USR-036 Khóa làm token đang dùng hết hiệu lực", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    expect(u.status).toBe('ACTIVE');
    const t = await ADM.loginUser(testRun, u);
    expectStatusIn(await http.call('GET /api/auth/me', { token: t.accessToken }), '200');
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: u.id } });
    expectStatusIn(res, '200/204');
    const actual = await ADM.user(testRun, u.id);
    expect(['DISABLED', 'SUSPENDED']).toContain(actual.status);
    expectStatusIn(await http.call('GET /api/auth/me', { token: t.accessToken }), '401');
    expectStatusIn(await http.call('POST /api/auth/refresh', { json: { refreshToken: t.refreshToken } }), '401');
  });

  test("ADM-USR-037 Không xóa vật lý khi khóa", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    const logs = await ADM.audit(testRun, u.id);
    expect(logs.length).toBeGreaterThan(0);
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: u.id } }), '200/204');
    const actual = await ADM.user(testRun, u.id);
    expect(actual).toMatchObject({ id: u.id, email: u.email, employeeCode: u.employeeCode });
    expect(actual.status).not.toBe('ACTIVE');
    const after = await ADM.audit(testRun, u.id);
    for (const e of logs) expect(after.some((x: any) => x.id === e.id), 'Lịch sử cũ còn nguyên').toBe(true);
  });

  test("ADM-USR-042 Mở khóa tài khoản", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: u.id } });
    expect((await ADM.user(testRun, u.id)).status).not.toBe('ACTIVE');
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/unlock', { params: { id: u.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.user(testRun, u.id)).status).toBe('ACTIVE');
    const t = await ADM.loginUser(testRun, u);
    expectStatusIn(await http.call('GET /api/auth/me', { token: t.accessToken }), '200');
  });

  test("ADM-USR-043 Mở khóa tài khoản đang hoạt động", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    const before = stable(await ADM.user(testRun, u.id));
    const logs = await ADM.audit(testRun, u.id);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/unlock', { params: { id: u.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.user(testRun, u.id))).toEqual(before);
    expect(await ADM.audit(testRun, u.id)).toEqual(logs);
  });

  test("ADM-USR-044 Bị khóa → hoạt động", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: u.id } });
    expect((await ADM.user(testRun, u.id)).status).not.toBe('ACTIVE');
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/unlock', { params: { id: u.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.user(testRun, u.id)).status).toBe('ACTIVE');
    const t = await ADM.loginUser(testRun, u);
    expectStatusIn(await http.call('GET /api/auth/me', { token: t.accessToken }), '200');
  });

  test("ADM-USR-045 Mở khóa giữ vai trò cũ", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.servicePermissionCodes(testRun, 'KHQ');
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const before = await ADM.effective(testRun, u.id);
    await ADM.adminData(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: u.id } });
    expectStatusIn(await ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/unlock', { params: { id: u.id } }), '200/204');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).roles)).toEqual([r.id]);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
    const t = await ADM.loginUser(testRun, u);
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(ps);
  });

  test("ADM-USR-050 Đặt lại mật khẩu mặc định", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const defaults = await ADM.newUser(testRun, { password: undefined });
    expect(typeof defaults.password).toBe('string');
    expect(defaults.password.length).toBeGreaterThan(0);
    const differentPassword = 'Lx' + Math.random().toString(36).slice(2) + 'Q7';
    const u = await ADM.newUser(testRun, { password: differentPassword });
    const t = await ADM.loginUser(testRun, u);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/password/reset', { params: { id: u.id } });
    expectStatusIn(res, '200/204');
    expectStatusIn(await http.call('GET /api/auth/me', { token: t.accessToken }), '401');
    expectStatusIn(await http.call('POST /api/auth/login', { json: { tenantCode: env.tenantCode, email: u.email, password: differentPassword } }), '400/401');
    const resetPassword = res.status() === 204 ? defaults.password : (await data(res)).password;
    expect(typeof resetPassword).toBe('string');
    const next = await ADM.loginUser(testRun, { email: u.email, password: resetPassword });
    const actual = await must(await http.call('GET /api/auth/me', { token: next.accessToken }), 'Đăng nhập bằng mật khẩu mặc định');
    expect(actual.passwordChangeRequired).toBe(true);
    expect((await ADM.user(testRun, u.id)).passwordChangeRequired).toBe(true);
  });

  test("ADM-USR-051 Không hỏi xác nhận nhưng chỉ ADMIN gọi được", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    const before = stable(await ADM.user(testRun, u.id));
    const res = await http.call('POST /api/admin/users/{id}/password/reset', { token: tok('k1'), params: { id: u.id } });
    expectStatusIn(res, '403');
    await expectApiError(res);
    await expectNoData(res);
    expect(stable(await ADM.user(testRun, u.id))).toEqual(before);
    const t = await ADM.loginUser(testRun, u);
    expectStatusIn(await http.call('GET /api/auth/me', { token: t.accessToken }), '200');
  });

  test("ADM-USR-052 Phiên cũ bị hủy, audit có bản ghi", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    const t = await ADM.loginUser(testRun, u);
    const before = await ADM.audit(testRun, u.id);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/password/reset', { params: { id: u.id } });
    expectStatusIn(res, '200/201/204');
    const reset = res.status() === 204 ? undefined : await data(res);
    expectStatusIn(await http.call('GET /api/auth/me', { token: t.accessToken }), '401');
    const added = await ADM.expectAuditAdded(testRun, u.id, ADM.idsOf(before));
    const text = JSON.stringify(added);
    expect(text).toMatch(/reset|đặt lại|mật khẩu/i);
    expect(text).not.toContain(u.password);
    if (reset?.password) expect(text).not.toContain(reset.password);
  });

  test("ADM-USR-021 Chi tiết người dùng", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'KHQ'));
    const u = await ADM.newUser(testRun, { departmentIds: [d.id], roleIds: [r.id] });
    const res = await ADM.adminRequest(testRun, 'GET /api/admin/users/{id}', { params: { id: u.id } });
    expectStatusIn(res, '200');
    const actual = await data(res);
    expect(actual).toMatchObject({ id: u.id, email: u.email, employeeCode: u.employeeCode, displayName: u.displayName, phone: '0912345678', status: 'ACTIVE' });
    expect(ADM.idsOf(actual.roles)).toEqual([r.id]);
    expect(ADM.idsOf(actual.departments)).toEqual([d.id]);
  });

  test("ADM-USR-057 Quyền hiệu lực kèm vai trò nguồn", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 3);
    const a = await ADM.newRole(testRun, [ps[0], ps[1]]);
    const b = await ADM.newRole(testRun, [ps[1], ps[2]]);
    const u = await ADM.newUser(testRun, { roleIds: [a.id, b.id] });
    const rows = await ADM.effective(testRun, u.id);
    expect(rows).toHaveLength(3);
    expect(ADM.permissionCodes(rows)).toEqual(ps);
    expect(ADM.idsOf(rows.find((x: any) => x.code === ps[1]).roles)).toEqual([a.id, b.id].sort());
    expect(ADM.idsOf(rows.find((x: any) => x.code === ps[0]).roles)).toEqual([a.id]);
    expect(ADM.idsOf(rows.find((x: any) => x.code === ps[2]).roles)).toEqual([b.id]);
    await ADM.adminData(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: b.id } });
    const after = await ADM.effective(testRun, u.id);
    expect(ADM.permissionCodes(after)).toEqual([ps[0], ps[1]].sort());
    expect(ADM.idsOf(after.find((x: any) => x.code === ps[1]).roles)).toEqual([a.id]);
  });

  test("ADM-USR-061 Xuất quyền hiệu lực ra Excel", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ testRun }) => {

    const ps = await ADM.servicePermissionCodes(testRun, 'KHQ');
    const r = await ADM.newRole(testRun, ps, { name: ADM.uniqueName('Điều phối Khai báo hải quan') });
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const perms = await ADM.effective(testRun, u.id);
    const res = await ADM.adminRequest(testRun, "GET /api/admin/users/{id}/permissions/export", { params: { id: u.id } });
    expectStatusIn(res, '200');
    const x = await readXlsx(await res.body());
    const permRows = x.rows.filter((row) => perms.some((p: any) => row.some((c) => String(c ?? '').trim() === p.name)));

    expect((await res.body()).subarray(0, 2).toString('latin1'), 'Trả file xlsx').toBe('PK');
    expect(permRows.length, 'Số dòng quyền trong file = số quyền').toBe(perms.length);

  });

  test("ADM-USR-063 Người không có quyền nào", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const u = await ADM.newUser(testRun);
    expect(await ADM.effective(testRun, u.id)).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'GET /api/admin/users/{id}/permissions/export', { params: { id: u.id } });
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expect(res.headers()['content-type']).toMatch(/json/i);
    await expectNoData(res);
  });
});
