import { readFileSync } from 'node:fs';
import { Browser, BrowserContextOptions, Page } from '@playwright/test';
import { Roles, syncRoleSession } from '../../core/fixtures/auth.fixture';
import { RoleKey } from '../../core/data/accounts';
import { env } from '../../core/env';

/** Reuse the authenticated browser state without a second login invalidating API workers. */
export async function withQuotePage(browser: Browser, roles: Roles, role: RoleKey, work: (page: Page) => Promise<void>) {
  const session = syncRoleSession(roles, role);
  if (!session.storageState) throw new Error(`Thiếu storageState cho vai trò ${role}; chạy setup trước`);
  const state: Exclude<BrowserContextOptions['storageState'], string | undefined> = JSON.parse(readFileSync(session.storageState, 'utf8'));
  // Dùng cả cookie mẫu đã hết hạn, vì token trong phiên dùng chung có thể đã được cấp lại.
  const cookies = state.cookies.map((cookie) => {
    if (cookie.name === 'access_token') return { ...cookie, value: session.accessToken, expires: -1 };
    if (cookie.name === 'refresh_token') return { ...cookie, value: session.refreshToken, expires: -1 };
    return cookie;
  });
  const context = await browser.newContext({ baseURL: env.webUrl, storageState: { ...state, cookies } });
  try {
    await work(await context.newPage());
  } finally {
    await context.close();
  }
}

/** Tab labels and the shared table component are documented in the live UI baseline. */
export function quoteTab(page: Page, name: string) {
  return page.getByRole('tab', { name, exact: true }).or(page.getByRole('button', { name, exact: true })).or(page.getByText(name, { exact: true })).first();
}
