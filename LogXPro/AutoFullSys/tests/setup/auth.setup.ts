import { test as setup, expect, chromium, request, type Browser, type BrowserContextOptions } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { HttpClient, data } from '../../src/core/base.client';
import { AuthClient, type Me } from '../../src/core/auth.client';
import type { RoleSession } from '../../src/core/fixtures/auth.fixture';
import { REQUIRED_ROLES, ROLE_ENV, RoleKey, credentials } from '../../src/core/data/accounts';
import { assertAllowedEnvironment, env, missingEnv } from '../../src/core/env';
import { guardPriceConfigurationWrites } from '../../src/core/price-configuration-guard';
import { DangNhapPage } from '../../src/quan-tri-phan-quyen/pages/dang-nhap.page';

const AUTH_DIR = path.resolve(__dirname, '../../.auth');
const CROSS_MODULE_ROLES: readonly RoleKey[] = ['admin', 'cc', 'dp', 'k1'];

type SetupSession = RoleSession & { tenantId: string };
type StorageState = Exclude<BrowserContextOptions['storageState'], string | undefined>;

/** API dev đôi lúc reset socket ngay sau đăng nhập; chỉ retry lỗi mạng, không che lỗi HTTP/xác thực. */
async function meWithNetworkRetry(auth: AuthClient, accessToken: string): Promise<Me> {
  let last: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await auth.me(accessToken);
    } catch (error) {
      last = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!/socket hang up|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(message) || attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }
  }
  throw last;
}

/**
 * Phiên đã lưu từ đăng nhập web của tenant dev mặc định. Ưu tiên /me; nếu access token
 * đã hết hạn thì xoay refresh token đúng một lần và cập nhật lại storageState, không
 * đăng nhập hàng loạt ở đầu mỗi lần chạy.
 */
async function reuseDevSession(http: HttpClient, file: string, email: string): Promise<SetupSession | undefined> {
  const web = new URL(env.webUrl);
  if (env.tenantCode !== 'CONGTYA' || web.origin !== 'https://logx-dev.sonthanh.net.vn' || env.apiUrl !== 'https://logx-api-dev.sonthanh.net.vn') return;
  let state: StorageState;
  try {
    state = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error instanceof SyntaxError || (error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  if (!Array.isArray(state?.cookies) || !Array.isArray(state.origins) || !state.origins.some((origin) => origin.origin === web.origin)) return;
  const cookie = (name: string) => state.cookies.find((c) => c.name === name && c.domain === web.hostname && c.path === '/');
  const accessCookie = cookie('access_token');
  const refreshCookie = cookie('refresh_token');
  let accessToken = accessCookie?.value;
  let refreshToken = refreshCookie?.value ?? '';
  if (!accessToken) return;
  let claims: { sub?: string; tenant?: string; token_use?: string; exp?: number };
  try {
    claims = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return;
  }
  if (claims?.token_use !== 'access' || !claims.sub || !claims.tenant || !Number.isFinite(claims.exp)) return;
  let response = await http.call('GET /api/auth/me', { token: accessToken });
  if ([401, 403].includes(response.status()) && refreshToken) {
    const refreshed = await http.call('POST /api/auth/refresh', { json: { refreshToken } });
    if (refreshed.ok()) {
      const pair = await data(refreshed) as { accessToken?: string; refreshToken?: string };
      if (!pair.accessToken || !pair.refreshToken || !accessCookie || !refreshCookie) return;
      accessToken = pair.accessToken;
      refreshToken = pair.refreshToken;
      accessCookie.value = accessToken;
      refreshCookie.value = refreshToken;
      fs.writeFileSync(file, JSON.stringify(state, null, 2));
      response = await http.call('GET /api/auth/me', { token: accessToken });
      if (response.ok()) console.log(`Đã làm mới phiên một lần cho ${email}`);
    }
  }
  if ([401, 403].includes(response.status())) return;
  expect(response.status(), 'Kiểm phiên đã lưu qua /api/auth/me').toBe(200);
  const me: Me = await data(response);
  if (me?.email?.toLowerCase() !== email.toLowerCase() || me.userId !== claims.sub || me.tenantId !== claims.tenant || !me.roles?.length) return;
  return {
    email, accessToken, refreshToken, userId: me.userId,
    roles: me.roles.map((role) => role.code), storageState: file, tenantId: claims.tenant,
  };
}

/**
 * Hệ thống chỉ giữ 1 phiên cho mỗi tài khoản (đăng nhập lại thì phiên cũ bị thu hồi).
 * Vì vậy mỗi email chỉ đăng nhập 1 lần, qua giao diện web, rồi dùng chung cookie access_token cho cả test API lẫn test UI (storageState).
 */
setup('đăng nhập các vai trò và lưu phiên', async () => {
  const crossModule = process.env.AUTOFULLSYS_SETUP_SCOPE === 'xuyen-module';
  const requiredRoles = crossModule ? CROSS_MODULE_ROLES : REQUIRED_ROLES;
  const setupRoles = crossModule ? CROSS_MODULE_ROLES : Object.keys(ROLE_ENV) as RoleKey[];
  const required = ['API_URL', 'WEB_URL', 'TENANT_CODE', ...requiredRoles.flatMap((r) => [`${ROLE_ENV[r]}_EMAIL`, `${ROLE_ENV[r]}_PASSWORD`])];
  const missing = missingEnv(required);
  expect(missing, `Thiếu biến trong .env: ${missing.join(', ')}`).toEqual([]);
  assertAllowedEnvironment();

  const ctx = await request.newContext();
  const http = new HttpClient(ctx, env.apiUrl);
  const auth = new AuthClient(http);
  let browser: Browser | undefined;
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const byEmail = new Map<string, SetupSession>();
  const result: Partial<Record<RoleKey, SetupSession>> = {};
  const tenantIds = new Set<string>();
  if (crossModule) console.log(`Setup xuyên module dùng ${setupRoles.map((key) => ROLE_ENV[key]).join(', ')}`);
  try {
    for (const key of setupRoles) {
      // NO_ROLE đăng nhập được nhưng bị giữ ở màn thông báo thiếu quyền. FLOW-ADM-008 tự tạo tài khoản này để kiểm qua API.
      if (key === 'noRole') continue;
      const cred = credentials(key);
      if (!cred) continue;
      const emailKey = cred.email.toLowerCase();
      const storageState = path.join(AUTH_DIR, `${cred.email.replace(/[^a-z0-9]/gi, '_')}.json`);
      let session = byEmail.get(emailKey);
      if (!session) {
        session = await reuseDevSession(http, storageState, cred.email);
        if (session) console.log(`Dùng lại phiên đã xác minh cho ${ROLE_ENV[key]}`);
      }
      if (!session) {
        browser ??= await chromium.launch();
        const context = await browser.newContext({ baseURL: env.webUrl, serviceWorkers: 'block' });
        try {
          await guardPriceConfigurationWrites(context);
          const page = await context.newPage();
          const [response] = await Promise.all([
            page.waitForResponse((res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/auth/login'),
            new DangNhapPage(page).login(cred.email, cred.password),
          ]);
          if (!response.ok()) {
            const retryAfter = response.headers()['retry-after'];
            const wait = retryAfter ? `, Retry-After ${retryAfter}` : '';
            throw new Error(`Đăng nhập ${ROLE_ENV[key]} thất bại với HTTP ${response.status()}${wait}`);
          }
          await expect(page, `Đăng nhập ${cred.email} không rời trang /login`).not.toHaveURL(/\/login/, { timeout: 30_000 });
          const cookies = await context.cookies();
          const accessToken = cookies.find((c) => c.name === 'access_token')?.value;
          const refreshToken = cookies.find((c) => c.name === 'refresh_token')?.value ?? '';
          expect(accessToken, `Không đọc được cookie access_token sau khi đăng nhập ${cred.email}`).toBeTruthy();
          const me = await meWithNetworkRetry(auth, accessToken!);
          expect(typeof me.tenantId, 'Có tenant của phiên đăng nhập').toBe('string');
          await context.storageState({ path: storageState });
          session = { email: cred.email, accessToken: accessToken!, refreshToken, userId: me.userId, roles: (me.roles ?? []).map((r) => r.code), storageState, tenantId: me.tenantId as string };
        } finally {
          await context.close();
        }
      }
      byEmail.set(emailKey, session);
      result[key] = session;
      tenantIds.add(session.tenantId);
    }
    if (crossModule) expect(tenantIds.size, 'Các vai trò xuyên module phải thuộc cùng tenant').toBe(1);
  } finally {
    await browser?.close();
    await ctx.dispose();
  }
  // Tài khoản "người khác" phải khác người dùng chính, nếu không case truy cập chéo không có ý nghĩa.
  const r = result as Record<string, { userId: string } | undefined>;
  if (r.k1 && r.k1b) expect(r.k1b.userId, 'K1 và K1B đang trỏ cùng một tài khoản').not.toBe(r.k1.userId);
  if (r.sale && r.sale2) expect(r.sale2.userId, 'SALE và SALE2 đang trỏ cùng một tài khoản').not.toBe(r.sale.userId);
  fs.writeFileSync(path.join(AUTH_DIR, 'tokens.json'), JSON.stringify(result, null, 2));
  // Một mã lần chạy cho mọi worker (gắn vào tên dữ liệu tạo trong case để nhận diện và dọn).
  fs.writeFileSync(path.join(AUTH_DIR, 'run.json'), JSON.stringify({ runId: process.env.TEST_RUN_ID ?? `at${Date.now().toString(36)}` }));
});
