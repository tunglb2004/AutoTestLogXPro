import { test as setup, expect, chromium, request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { HttpClient } from '../../src/api/http.client';
import { AuthClient } from '../../src/api/auth.client';
import { LoginPage } from '../../src/pages/login.page';

export const ROLES = {
  nvkdA: 'NVKD_A',
  dvkhA: 'DVKH_A',
  qlnt: 'QLNT',
} as const;
// Tài khoản thứ 2, thứ 3 cùng role: không bắt buộc; case cần tới sẽ báo rõ thiếu tài khoản.
export const OPTIONAL_ROLES = { nvkdB: 'NVKD_B', dvkhB: 'DVKH_B', nvkdC: 'NVKD_C', dvkhC: 'DVKH_C' } as const;
/** Role phải có trong /api/auth/me để tiền điều kiện của case phân quyền đúng. */
const EXPECTED_ROLE: Record<string, RegExp> = { nvkdA: /QL_LEAD/, nvkdB: /QL_LEAD/, nvkdC: /QL_LEAD/, dvkhA: /QL_KH|DVKH/, dvkhB: /QL_KH|DVKH/, dvkhC: /QL_KH|DVKH/, qlnt: /QL_NHA_THAU/ };
const AUTH_DIR = path.resolve(__dirname, '../../.auth');

/** Tài khoản Nhà thầu (QLNT) để trống thì dùng chung tài khoản Khách hàng (DVKH_A), theo cấu hình trong .env. */
function applyAccountDefaults(): void {
  if (!process.env.QLNT_EMAIL && process.env.DVKH_A_EMAIL) {
    process.env.QLNT_EMAIL = process.env.DVKH_A_EMAIL;
    process.env.QLNT_PASSWORD = process.env.QLNT_PASSWORD || process.env.DVKH_A_PASSWORD;
  }
}

setup('đăng nhập các role và lưu token', async () => {
  applyAccountDefaults();
  const required = ['API_BASE_URL', 'WEB_BASE_URL', 'TENANT_CODE', ...Object.values(ROLES).flatMap((r) => [`${r}_EMAIL`, `${r}_PASSWORD`])];
  const missing = required.filter((name) => !process.env[name]);
  expect(missing, `Thiếu biến trong .env (mục "ĐỔI TÀI KHOẢN ĐĂNG NHẬP Ở ĐÂY"): ${missing.join(', ')}`).toEqual([]);

  const ctx = await request.newContext();
  const auth = new AuthClient(new HttpClient(ctx, process.env.API_BASE_URL!));
  const browser = await chromium.launch();
  const result: Record<string, { accessToken: string; refreshToken: string; userId: string; roles: string[]; storageState: string }> = {};
  const all = { ...ROLES, ...OPTIONAL_ROLES } as Record<string, string>;
  // Hệ thống chỉ giữ 1 phiên cho mỗi tài khoản (đăng nhập lại thì phiên cũ bị "session-superseded").
  // Vì vậy mỗi email chỉ đăng nhập 1 lần, qua giao diện web, rồi dùng chung cookie access_token
  // cho cả test API lẫn test UI (storageState) để hai loại test không đá phiên nhau.
  const byEmail = new Map<string, (typeof result)[string]>();
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  for (const [key, prefix] of Object.entries(all)) {
    const email = process.env[`${prefix}_EMAIL`];
    const password = process.env[`${prefix}_PASSWORD`];
    if (!email || !password) continue;
    let session = byEmail.get(email.toLowerCase());
    if (!session) {
      const context = await browser.newContext({ baseURL: process.env.WEB_BASE_URL });
      const page = await context.newPage();
      await new LoginPage(page).login(email, password);
      await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
      const cookies = await context.cookies();
      const accessToken = cookies.find((c) => c.name === 'access_token')?.value;
      const refreshToken = cookies.find((c) => c.name === 'refresh_token')?.value ?? '';
      expect(accessToken, `Không đọc được cookie access_token sau khi đăng nhập ${email}`).toBeTruthy();
      const me = await auth.me(accessToken!);
      const storageState = path.join(AUTH_DIR, `${email.replace(/[^a-z0-9]/gi, '_')}.json`);
      await context.storageState({ path: storageState });
      await context.close();
      session = { accessToken: accessToken!, refreshToken, userId: me.userId, roles: me.roles.map((r) => r.code), storageState };
      byEmail.set(email.toLowerCase(), session);
    }
    const roleOk = session.roles.some((r) => EXPECTED_ROLE[key].test(r));
    const roleMsg = `Tài khoản ${email} (${key}) không có role khớp ${EXPECTED_ROLE[key]}: ${session.roles.join(', ')}`;
    if (key in ROLES) {
      // Tài khoản chính sai role thì mọi case đều sai tiền điều kiện: dừng ngay.
      expect(roleOk, roleMsg).toBe(true);
    } else if (!roleOk) {
      // Tài khoản phụ (B, C) sai role: vẫn dùng theo cấu hình của người dùng nhưng ghi cảnh báo vào báo cáo,
      // vì case dùng tài khoản đó có thể đạt hoặc lỗi vì quyền chứ không phải vì nghiệp vụ.
      setup.info().annotations.push({ type: 'Cảnh báo role tài khoản phụ', description: roleMsg });
      console.warn(`Cảnh báo: ${roleMsg}`);
    }
    result[key] = session;
  }
  // Vai A và B phải là hai người dùng khác nhau, nếu không case "người khác" không có ý nghĩa.
  for (const [a, b2] of [['nvkdA', 'nvkdB'], ['dvkhA', 'dvkhB']]) {
    if (result[a] && result[b2]) expect(result[b2].userId, `${a} và ${b2} đang trỏ cùng một tài khoản`).not.toBe(result[a].userId);
  }
  fs.writeFileSync(path.join(AUTH_DIR, 'tokens.json'), JSON.stringify(result, null, 2));
  await browser.close();
  await ctx.dispose();
});
