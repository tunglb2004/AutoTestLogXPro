import { expect, Page } from '@playwright/test';
import { randomUUID } from 'crypto';
import { TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import { env } from '../../core/env';
import { newUser, user } from './admin-pending.factory';
import { loginOk, changePassword } from './nguoi-dung.factory';
import { expectStatusIn } from '../../core/assertions';
import { DangNhapPage } from '../pages/dang-nhap.page';

/** Independent account with the same direct roles/departments as the requested role.
 * UI login never invalidates a shared API worker's session or increments its failed-login counter.
 */
export async function newLoginUser(run: TestRun, source: RoleKey = 'k1') {
  const template = await user(run, run.roles[source].userId);
  const roleIds = (template.roles ?? []).map((r: any) => r.id);
  const departmentIds = (template.departments ?? []).map((d: any) => d.id);
  expect(roleIds.length + departmentIds.length, `Tài khoản mẫu ${source} có vai trò/bộ phận`).toBeGreaterThan(0);
  const u = await newUser(run, { roleIds, departmentIds });
  const initial = await loginOk(run, u);
  const password = `Lx9${randomUUID().replace(/-/g, '').slice(0, 18)}Q7`;
  expectStatusIn(await changePassword(run, initial.accessToken, u.password, password), '200/201/204', 'chuẩn bị mật khẩu UI riêng');
  return { ...u, password };
}

export async function loginThroughUi(page: Page, u: { email: string; password: string }) {
  const form = new DangNhapPage(page);
  await form.goto();
  await form.email.fill(u.email);
  await form.password.fill(u.password);
  const response = page.waitForResponse((r) => /\/auth\/login(?:\?|$)/.test(r.url()) && r.request().method() === 'POST');
  await form.submit.click();
  expect((await response).status(), 'Đăng nhập qua UI').toBe(200);
  await expect(page).not.toHaveURL(/\/login(?:[/?#]|$)/);
  return form;
}

export const webBaseUrl = () => env.webUrl;
