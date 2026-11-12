import { expect } from '@playwright/test';
import { TestRun } from '../../core/fixtures/test-run.fixture';
import { data, items, must } from '../../core/base.client';
import { env } from '../../core/env';

export function requiredFixture(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Thiếu dữ liệu môi trường ${name}; cần dữ liệu thật đúng tiền điều kiện, không thay bằng id ngẫu nhiên.`);
  return value;
}
/**
 * Quy tắc pass/fail của bộ case: thiếu tài khoản/dữ liệu nền thì case là "Blocked (thiếu môi trường)", không phải lỗi hệ thống.
 * Thiếu biến nào thì ghi annotation Blocked kèm tên biến và dừng case (báo cáo chạy đếm riêng cột Blocked). Đủ biến thì chạy bình thường.
 */
export { blockedUnless } from '../../core/fixtures/test-run.fixture';
export const TENANT_B_LOGIN = ['TENANT_B_CODE', 'TENANT_B_EMAIL', 'TENANT_B_PASSWORD'];
export async function tenantB(run: TestRun) {
  const tenantCode = requiredFixture('TENANT_B_CODE');
  expect(tenantCode, 'Tenant B phải khác tenant A; thêm người dùng cùng tenant không kiểm được cách ly tenant').not.toBe(env.tenantCode);
  const session = await must(await run.http.call('POST /api/auth/login', { json: { tenantCode, email: requiredFixture('TENANT_B_EMAIL'), password: requiredFixture('TENANT_B_PASSWORD') } }), 'đăng nhập tenant B');
  expect(session.accessToken, 'Tenant B đăng nhập trả access token').toBeTruthy();
  const me = await must(await run.http.call('GET /api/auth/me', { token: session.accessToken }), 'đọc người dùng B');
  const primary = await must(await run.http.call('GET /api/auth/me', { token: run.token('k1') }), 'đọc người dùng A');
  expect(primary.tenantId, 'Tenant thực tế của tài khoản A').toBeTruthy();
  expect(me.tenantId, 'Tenant thực tế của tài khoản B').toBeTruthy();
  expect(me.tenantId, 'Hai tài khoản thuộc hai tenant khác nhau').not.toBe(primary.tenantId);
  expect(me.userId, 'API trả ID người dùng tenant B').toBeTruthy();
  expect(me.userId, 'Người dùng B khác tài khoản A').not.toBe(run.roles.k1.userId);
  return session.accessToken as string;
}
export async function allRows(run: TestRun, api: string, token: string, query: Record<string, unknown> = {}) {
  const result: any[] = [];
  for (let page = 1; page <= 1000; page++) {
    const d = await must(await run.http.call(api, { token, query: { ...query, page, perPage: 100 } }), api);
    const rows = items(d); result.push(...rows);
    if (Array.isArray(d)) return result;
    const totalPages = Number(d?.meta?.pagination?.totalPages);
    if (Number.isFinite(totalPages) ? page >= totalPages : rows.length < 100) return result;
  }
  throw new Error(`Vượt 1000 trang khi đọc ${api}; không đối chiếu thống kê với danh sách bị cắt.`);
}
export async function successData(run: TestRun, api: string, token: string, params: Record<string, string> = {}) {
  return must(await run.http.call(api, { token, params }), api);
}
export const noIntersection = (a: any[], b: any[], id = 'id') => {
  const foreign = new Set(b.map(r => r[id]));
  expect(a.filter(r => foreign.has(r[id])), `Không có ${id} tenant B trong dữ liệu tenant A`).toEqual([]);
};
