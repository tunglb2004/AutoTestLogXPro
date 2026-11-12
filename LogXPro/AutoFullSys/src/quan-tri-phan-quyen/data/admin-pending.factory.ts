import { expect } from '@playwright/test';
import type { TestRun } from '../../core/fixtures/test-run.fixture';
import { tagged, uuid } from '../../core/fixtures/test-run.fixture';
import { data, items, must, CallOptions } from '../../core/base.client';
import { expectStatusIn } from '../../core/assertions';
import { env } from '../../core/env';

/** Fixtures riêng cho các case ADM còn chờ: chỉ tạo và dọn đối tượng của lượt test. */
export const uniqueName = (prefix: string) => tagged(`${prefix} ${Math.random().toString(36).slice(2, 9)}`);
export const idsOf = (rows: any[]) => rows.map((r) => r.id).sort();
export const permissionCodes = (rows: any[]) => [...new Set<string>(rows.map((r) => r.code))].sort();

export function adminRequest(run: TestRun, api: string, opts: CallOptions = {}) {
  return run.http.call(api, { token: run.token('admin'), ...opts });
}
export async function adminData(run: TestRun, api: string, opts: CallOptions = {}): Promise<any> {
  const res = await adminRequest(run, api, opts);
  return must(res, `ADM: ${api}`);
}
export async function allAdmin(run: TestRun, api: string, query: Record<string, unknown> = {}): Promise<any[]> {
  const out: any[] = [];
  for (let page = 1; ; page++) {
    const d = await adminData(run, api, { query: { ...query, page, perPage: 100 } });
    const rows = items(d);
    out.push(...rows);
    const pages = Number(d?.meta?.pagination?.totalPages);
    if (Number.isFinite(pages) ? page >= pages : rows.length < 100) return out;
    if (page >= 1000) throw new Error(`Không đọc hết phân trang ${api}; không dùng tập dữ liệu bị cắt để assert`);
  }
}
export const department = (run: TestRun, id: string) => adminData(run, 'GET /api/admin/departments/{id}', { params: { id } });
export const role = (run: TestRun, id: string) => adminData(run, 'GET /api/admin/roles/{id}', { params: { id } });
export const user = (run: TestRun, id: string) => adminData(run, 'GET /api/admin/users/{id}', { params: { id } });
export const effective = async (run: TestRun, id: string) => items(await adminData(run, 'GET /api/admin/users/{id}/permissions', { params: { id } }));
export const members = async (run: TestRun, id: string) => items(await adminData(run, 'GET /api/admin/roles/{id}/users', { params: { id } }));
export const catalogue = async (run: TestRun) => items(await adminData(run, 'GET /api/admin/permissions'));

/** Chọn quyền có thật, không suy đoán mã quyền hoặc dùng quyền nhạy cảm của quản trị. */
export async function safeViewCodes(run: TestRun, count = 2): Promise<string[]> {
  const ps = (await catalogue(run)).filter((p: any) => /xem danh sách|xem chi tiết/i.test(p.name ?? '') && !/bộ phận|vai trò|người dùng|quản trị/i.test(p.groupName ?? ''));
  const codes = permissionCodes(ps);
  expect(codes.length, `Cần ${count} quyền xem khác nhau trong rổ quyền`).toBeGreaterThanOrEqual(count);
  return codes.slice(0, count);
}
export async function servicePermissionCodes(run: TestRun, service: 'VT' | 'KHQ'): Promise<string[]> {
  const group = service === 'VT' ? /dịch vụ vận tải/i : /dịch vụ khai báo hải quan/i;
  const ps = await catalogue(run);
  const selected: string[] = [];
  for (const action of [/xem danh sách/i, /xem chi tiết/i, /điều phối nhà thầu/i, /bắt đầu thực hiện/i, /hoàn thành dịch vụ/i, /chỉnh sửa chi phí/i]) {
    const found = ps.find((p: any) => group.test(p.groupName ?? '') && action.test(p.name ?? ''));
    if (!found?.code) throw new Error(`Rổ quyền thiếu ${service}/${action}; không thay bằng quyền khác`);
    selected.push(found.code);
  }
  for (const action of [/xem danh sách/i, /xem chi tiết/i]) {
    const found = ps.find((p: any) => /phiếu dịch vụ/i.test(p.groupName ?? '') && action.test(p.name ?? '') && !/K5/i.test(p.name ?? ''));
    if (!found?.code) throw new Error(`Rổ quyền thiếu Phiếu dịch vụ/${action}`);
    selected.push(found.code);
  }
  return [...new Set(selected)].sort();
}
export async function newDepartment(run: TestRun, opts: Record<string, unknown> = {}): Promise<any> {
  const d = await adminData(run, 'POST /api/admin/departments', { json: { name: uniqueName('Điều phối AT'), description: 'Bộ phận kiểm thử độc lập', ...opts } });
  expect(d.id, 'Tạo bộ phận trả id').toBeTruthy();
  run.track(`ADM bộ phận ${d.id}`, () => adminRequest(run, 'DELETE /api/admin/departments/{id}', { params: { id: d.id } }));
  return department(run, d.id);
}
export async function newRole(run: TestRun, permissions: string[] = [], opts: Record<string, unknown> = {}): Promise<any> {
  const r = await adminData(run, 'POST /api/admin/roles', { json: { name: uniqueName('Điều phối AT'), description: 'Vai trò kiểm thử độc lập', permissions, ...opts } });
  expect(r.id, 'Tạo vai trò trả id').toBeTruthy();
  run.track(`ADM vai trò ${r.id}`, () => adminRequest(run, 'DELETE /api/admin/roles/{id}', { params: { id: r.id } }));
  return role(run, r.id);
}
export function userPayload(run: TestRun, opts: Record<string, any> = {}) {
  const rand = Math.random().toString(36).slice(2, 10);
  return { employeeCode: `AT${run.id}${rand}`.replace(/[^A-Za-z0-9]/g, '').slice(0, 32), email: `at.${rand}.${Date.now()}@logx-test.vn`, displayName: uniqueName('Nhân viên ADM'), phone: '0912345678', password: env.newUserPassword, roleIds: [], departmentIds: [], ...opts };
}
export async function newUser(run: TestRun, opts: Record<string, any> = {}): Promise<any> {
  const payload = userPayload(run, opts);
  const d = await adminData(run, 'POST /api/admin/users', { json: payload });
  expect(d.userId, 'Tạo người dùng trả userId').toBeTruthy();
  run.track(`ADM người dùng ${d.userId}`, async () => {
    const res = await adminRequest(run, 'GET /api/admin/users/{id}', { params: { id: d.userId } });
    if (!res.ok()) return;
    const current = await data(res);
    for (const r of current.roles ?? []) await adminRequest(run, 'DELETE /api/admin/users/{userId}/roles/{roleId}', { params: { userId: d.userId, roleId: r.id } });
    for (const dep of current.departments ?? []) await adminRequest(run, 'DELETE /api/admin/users/{userId}/departments/{departmentId}', { params: { userId: d.userId, departmentId: dep.id } });
    await adminRequest(run, 'POST /api/admin/users/{id}/lock', { params: { id: d.userId } });
  });
  return { ...(await user(run, d.userId)), password: d.password ?? payload.password, payload };
}
export async function bindRole(run: TestRun, userId: string, roleId: string) {
  await adminData(run, 'POST /api/admin/users/{userId}/roles', { params: { userId }, json: { roleId } });
}
export async function bindDepartment(run: TestRun, userId: string, departmentId: string) {
  await adminData(run, 'POST /api/admin/users/{userId}/departments', { params: { userId }, json: { departmentId } });
}
export async function bindDepartmentRole(run: TestRun, id: string, roleId: string) {
  await adminData(run, 'POST /api/admin/departments/{id}/roles', { params: { id }, json: { roleIds: [roleId] } });
  run.track(`ADM liên kết bộ phận/vai trò ${id}/${roleId}`, () => adminRequest(run, 'DELETE /api/admin/departments/{id}/roles/{roleId}', { params: { id, roleId } }));
}
export async function orgFixture(run: TestRun) {
  const ps = await safeViewCodes(run, 1);
  const d = await newDepartment(run);
  const r = await newRole(run, ps);
  await bindDepartmentRole(run, d.id, r.id);
  const u = await newUser(run, { roleIds: [r.id], departmentIds: [d.id] });
  return { d, r, u, ps };
}
export async function updateUser(run: TestRun, u: any, over: Record<string, unknown>) {
  return adminRequest(run, 'PUT /api/admin/users/{id}', { params: { id: u.id }, json: { employeeCode: u.employeeCode, email: u.email, displayName: u.displayName, phone: u.phone, ...over } });
}
export async function audit(run: TestRun, targetId: string, query: Record<string, unknown> = {}) {
  const out: any[] = [];
  for (let page = 1; page <= 1000; page++) {
    const d = await adminData(run, 'GET /api/admin/audit-log', { query: { targetId, query: JSON.stringify({ ...query, page, perPage: 100 }) } });
    const rows = items(d);
    out.push(...rows);
    const pages = Number(d?.meta?.pagination?.totalPages);
    if (Number.isFinite(pages) ? page >= pages : rows.length < 100) return out;
  }
  throw new Error('Không đọc hết audit của đối tượng test');
}
export async function expectAuditAdded(run: TestRun, targetId: string, beforeIds: string[], values: string[] = []) {
  const added = (await audit(run, targetId)).filter((x: any) => !beforeIds.includes(x.id));
  expect(added.length, 'Có sự kiện audit mới cho đúng đối tượng').toBeGreaterThan(0);
  for (const e of added) {
    expect(e.actorUserId, 'Audit có người thực hiện').toBeTruthy();
    expect(Number.isFinite(Date.parse(e.at)), 'Audit có thời điểm hợp lệ').toBe(true);
  }
  const content = JSON.stringify(added);
  for (const value of values) expect(content, `Audit có dữ liệu ${value}`).toContain(value);
  return added;
}
export async function loginUser(run: TestRun, u: any) {
  const res = await run.http.call('POST /api/auth/login', { json: { tenantCode: env.tenantCode, email: u.email, password: u.password } });
  expectStatusIn(res, '200');
  const t = await data(res);
  expect(t.accessToken).toBeTruthy();
  expect(t.refreshToken).toBeTruthy();
  return t;
}
export async function loginReadyUser(run: TestRun, user: { email: string; password: string }) {
  const session = await loginUser(run, user);
  if (!session.passwordChangeRequired) return session;
  const password = 'Lx9' + uuid().replace(/-/g, '').slice(0, 16) + 'Q7';
  expectStatusIn(await run.http.call('POST /api/auth/password', {
    token: session.accessToken, retryUnauthorized: false,
    json: { currentPassword: user.password, newPassword: password, confirmPassword: password },
  }), '200/201/204');
  return loginUser(run, { email: user.email, password });
}
export async function myPermissions(run: TestRun, token: string): Promise<string[]> {
  const res = await run.http.call('GET /api/auth/me', { token });
  expectStatusIn(res, '200');
  const d = await data(res);
  expect(Array.isArray(d.permissions)).toBe(true);
  return [...new Set<string>(d.permissions)].sort();
}
