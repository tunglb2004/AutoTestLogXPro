import { test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { RecordingHttpClient, TokenRenewer } from '../base.client';
import { RoleKey, credentials } from '../data/accounts';
import { env } from '../env';
import { guardPriceConfigurationWrites } from '../price-configuration-guard';

export type RoleSession = { email: string; accessToken: string; refreshToken: string; userId: string; roles: string[]; storageState?: string };
export type Roles = Record<RoleKey, RoleSession>;

const AUTH_DIR = path.resolve(__dirname, '../../../.auth');
export const TOKENS_FILE = path.join(AUTH_DIR, 'tokens.json');
const LOCK_FILE = path.join(AUTH_DIR, 'refresh.lock');

function readTokens(): Partial<Roles> {
  return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8')) as Partial<Roles>;
}

/** Phiên của các vai trò do project setup lưu; vai trò thiếu trong .env sẽ báo rõ khi case dùng tới. */
function loadRoles(): Roles {
  if (!fs.existsSync(TOKENS_FILE)) throw new Error('Chưa có .auth/tokens.json, hãy chạy project setup trước (tests/setup/auth.setup.ts).');
  const raw = readTokens();
  return new Proxy(raw as Roles, {
    get(target, key: string) {
      const v = (target as Record<string, RoleSession | undefined>)[key];
      if (!v) throw new Error(`Thiếu tài khoản vai trò "${key}" trong .env (xem bảng biến trong README).`);
      return v;
    },
  });
}

/** Có tài khoản cho vai trò này hay không (không ném lỗi). */
export function hasRole(key: RoleKey): boolean {
  return fs.existsSync(TOKENS_FILE) && Boolean(readTokens()[key]);
}

export function markIncomplete(reason: string): void {
  const annotations = base.info().annotations;
  if (!annotations.some((a) => a.type === 'Incomplete' && a.description === reason)) {
    annotations.push({ type: 'Incomplete', description: reason });
  }
}

/**
 * Các token không hợp lệ cho case Authentication. Token hết hạn thật phải do môi trường test cấp.
 */
export function badTokens(valid: Pick<RoleSession, 'accessToken' | 'refreshToken'>): { name: string; token: string }[] {
  const token = valid.accessToken;
  // Đổi ký tự đầu chữ ký để chắc chắn đổi byte đã giải mã (ký tự cuối có thể chỉ đổi bit đệm).
  const signatureStart = token.lastIndexOf('.') + 1;
  const corrupt = token.slice(0, signatureStart) + (token[signatureStart] === 'A' ? 'B' : 'A') + token.slice(signatureStart + 1);
  const list = [
    { name: 'token sai chữ ký', token: corrupt },
    { name: 'refresh token', token: valid.refreshToken },
  ];
  if (!valid.refreshToken) markIncomplete('Phiên kiểm thử không có refresh token để kiểm nhánh dùng nhầm loại token.');
  const expired = process.env.EXPIRED_ACCESS_TOKEN?.trim();
  if (expired && hasExpiredJwtClaims(expired)) list.push({ name: 'token hết hạn có chữ ký hợp lệ', token: expired });
  else markIncomplete('Cần EXPIRED_ACCESS_TOKEN là access token thật đã hết hạn.');
  return list.filter((x) => x.token);
}

function hasExpiredJwtClaims(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !/^[\w-]+$/.test(part))) return false;
  try {
    const exp: unknown = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))?.exp;
    return typeof exp === 'number' && Number.isFinite(exp) && exp <= Date.now() / 1000;
  } catch {
    return false;
  }
}

// ---------- Lấy lại token khi phiên bị reset ----------
// Hệ thống chỉ giữ 1 phiên/tài khoản: đăng nhập nơi khác làm token đang dùng bị 401. Khi đó đăng nhập lại 1 lần,
// ghi token mới vào tokens.json cho mọi worker dùng chung; khóa file để chỉ 1 worker đăng nhập lại.
const retired = new Map<string, string>();
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function loginByApi(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const res = await fetch(`${env.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantCode: env.tenantCode, email, password }),
      signal: AbortSignal.timeout(120_000),
    });
    if (res.status === 429 && attempt === 0) {
      let remaining = Math.min(Number(res.headers.get('retry-after') ?? 0) * 1_000, 15 * 60_000);
      while (remaining > 0) {
        const step = Math.min(remaining, 60_000);
        await pause(step);
        remaining -= step;
      }
      continue;
    }
    const b = (await res.json()) as { data?: { accessToken: string; refreshToken: string } };
    if (!res.ok || !b.data?.accessToken) throw new Error(`Đăng nhập lại thất bại cho ${email}: HTTP ${res.status}`);
    return b.data;
  }
  throw new Error(`Đăng nhập lại thất bại cho ${email} sau khi chờ giới hạn tần suất`);
}

function applyToken(target: Partial<Roles>, userId: string, fresh: { accessToken: string; refreshToken: string }): void {
  for (const s of Object.values(target)) {
    if (s && s.userId === userId) {
      if (s.accessToken !== fresh.accessToken) retired.set(s.accessToken, userId);
      s.accessToken = fresh.accessToken;
      s.refreshToken = fresh.refreshToken;
    }
  }
}

/** Đồng bộ phiên worker trước khi mở context UI từ trạng thái đăng nhập ban đầu. */
export function syncRoleSession(roles: Roles, key: RoleKey): RoleSession {
  const session = roles[key];
  const shared = readTokens()[key];
  if (shared?.userId === session.userId) applyToken(roles, session.userId, shared);
  return session;
}

/** Chỉ gọi khi đang giữ khóa làm mới phiên. Worker khác đọc được nguyên vẹn file cũ hoặc file mới. */
function publishSession(roles: Roles, userId: string, fresh: { accessToken: string; refreshToken: string }): void {
  const all = readTokens();
  applyToken(all, userId, fresh);
  const temp = `${TOKENS_FILE}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temp, JSON.stringify(all, null, 2));
    fs.renameSync(temp, TOKENS_FILE);
  } finally {
    fs.rmSync(temp, { force: true });
  }
  applyToken(roles, userId, fresh);
}

export function createRenewer(roles: Roles): TokenRenewer {
  return async (rejected) => {
    const mine = Object.entries(roles) as [RoleKey, RoleSession][];
    const hit = mine.find(([, s]) => s.accessToken === rejected) ?? mine.find(([, s]) => s.userId === retired.get(rejected));
    if (!hit) return null; // không phải token của tài khoản test (token giả của case Authentication)
    const [key, session] = hit;
    const useSharedSession = () => {
      const onDisk = readTokens()[key];
      if (onDisk?.userId !== session.userId || onDisk.accessToken === rejected) return null;
      applyToken(roles, session.userId, onDisk);
      return onDisk.accessToken;
    };
    const cred = credentials(key);
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      const shared = useSharedSession();
      if (shared || !cred) return shared;
      let fd: number;
      try {
        fd = fs.openSync(LOCK_FILE, 'wx');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
        const age = Date.now() - (fs.statSync(LOCK_FILE, { throwIfNoEntry: false })?.mtimeMs ?? Date.now());
        if (age > 20_000) fs.rmSync(LOCK_FILE, { force: true });
        await pause(300);
        continue;
      }
      try {
        const rotated = useSharedSession();
        if (rotated) return rotated;
        const fresh = await loginByApi(cred.email, cred.password);
        publishSession(roles, session.userId, fresh);
        console.warn(`Phiên của ${cred.email} bị reset, đã đăng nhập lại và tiếp tục.`);
        return fresh.accessToken;
      } finally {
        fs.closeSync(fd);
        fs.rmSync(LOCK_FILE, { force: true });
      }
    }
    return null;
  };
}

type AuthFixtures = { http: RecordingHttpClient; tok: (role: RoleKey) => string };

/** roles: phiên theo vai trò (worker). http: client ghi evidence-api.json cho từng case. tok(role): access token hiện tại của vai trò. */
export const test = base.extend<AuthFixtures, { roles: Roles }>({
  roles: [async ({}, use) => use(loadRoles()), { scope: 'worker' }],
  browser: [async ({ browser }, use) => {
    // Các helper UI cũng mở context trực tiếp trên browser, ngoài context mặc định của Playwright.
    const newContext = browser.newContext;
    browser.newContext = async (options) => {
      const context = await newContext.call(browser, { ...options, serviceWorkers: 'block' });
      try {
        await guardPriceConfigurationWrites(context);
        return context;
      } catch (error) {
        await context.close();
        throw error;
      }
    };
    try {
      await use(browser);
    } finally {
      browser.newContext = newContext;
    }
  }, { scope: 'worker' }],
  context: async ({ context }, use) => {
    await guardPriceConfigurationWrites(context);
    await use(context);
  },
  http: async ({ request, roles }, use, testInfo) => {
    if (!env.apiUrl) throw new Error('Thiếu API_URL trong .env');
    const http = new RecordingHttpClient(request, env.apiUrl, createRenewer(roles), (reason) => {
      testInfo.annotations.push({ type: 'Blocked', description: reason });
      testInfo.skip(true, reason);
    });
    await use(http);
    if (http.records.length) await testInfo.attach('evidence-api.json', { body: JSON.stringify(http.records, null, 2), contentType: 'application/json' });
  },
  tok: async ({ roles }, use) => use((role: RoleKey) => roles[role].accessToken),
});

export { expect } from '@playwright/test';
