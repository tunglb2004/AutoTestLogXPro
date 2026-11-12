import { test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export type RoleKey = 'nvkdA' | 'nvkdB' | 'nvkdC' | 'dvkhA' | 'dvkhB' | 'dvkhC' | 'qlnt';
export type RoleSession = { accessToken: string; refreshToken: string; userId: string; roles: string[]; storageState?: string };
export type Roles = Record<RoleKey, RoleSession>;

const TOKENS_FILE = path.resolve(__dirname, '../../.auth/tokens.json');

function loadRoles(): Roles {
  if (!fs.existsSync(TOKENS_FILE)) throw new Error('Chưa có .auth/tokens.json, hãy chạy project setup trước (tests/setup/auth.setup.ts).');
  const raw = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8')) as Partial<Roles>;
  return new Proxy(raw as Roles, {
    get(target, key: string) {
      const v = (target as Record<string, RoleSession | undefined>)[key];
      if (!v) throw new Error(`Thiếu tài khoản role "${key}" trong .env (xem bảng biến trong README).`);
      return v;
    },
  });
}

/**
 * Token không hợp lệ: sửa 1 ký tự chữ ký và refresh token. Token hết hạn có chữ ký hợp lệ không tự tạo được,
 * nên chỉ được thêm khi người chạy cung cấp EXPIRED_ACCESS_TOKEN (token thật đã hết hạn); nếu không có,
 * test ghi annotation "Chưa kiểm token hết hạn" để báo cáo không hiểu nhầm là đã kiểm.
 */
export function badTokens(valid: RoleSession): { name: string; token: string }[] {
  const t = valid.accessToken;
  const last = t.slice(-1);
  const tampered = t.slice(0, -1) + (last === 'a' ? 'b' : 'a');
  const list = [
    { name: 'token sửa 1 ký tự (sai chữ ký)', token: tampered },
    { name: 'refresh token', token: valid.refreshToken },
  ];
  if (process.env.EXPIRED_ACCESS_TOKEN) list.push({ name: 'token hết hạn có chữ ký hợp lệ', token: process.env.EXPIRED_ACCESS_TOKEN });
  else base.info().annotations.push({ type: 'Chưa kiểm token hết hạn', description: 'Đặt EXPIRED_ACCESS_TOKEN trong .env để kiểm' });
  return list.filter((x) => x.token);
}

// ---------- Lấy lại token khi phiên bị reset ----------
// Mỗi tài khoản chỉ giữ 1 phiên: đăng nhập nơi khác hoặc hệ thống reset phiên làm token đang dùng bị 401.
// Khi đó đăng nhập lại 1 lần (qua API), ghi token mới vào .auth/tokens.json cho mọi worker dùng chung.
// Khóa file đảm bảo chỉ 1 worker đăng nhập lại, các worker khác chờ rồi đọc token mới,
// tránh việc các worker đăng nhập chồng nhau và đá phiên của nhau.
const LOCK_FILE = path.resolve(__dirname, '../../.auth/refresh.lock');
const ENV_PREFIX: Record<RoleKey, string> = { nvkdA: 'NVKD_A', nvkdB: 'NVKD_B', nvkdC: 'NVKD_C', dvkhA: 'DVKH_A', dvkhB: 'DVKH_B', dvkhC: 'DVKH_C', qlnt: 'QLNT' };
/** Token đã bị thay thế → userId, để request còn cầm token cũ cũng được gửi lại bằng token mới. */
const retired = new Map<string, string>();

function credentials(key: RoleKey): { email: string; password: string } | null {
  let email = process.env[`${ENV_PREFIX[key]}_EMAIL`];
  let password = process.env[`${ENV_PREFIX[key]}_PASSWORD`];
  if (key === 'qlnt' && !email) {
    email = process.env.DVKH_A_EMAIL;
    password = process.env.QLNT_PASSWORD || process.env.DVKH_A_PASSWORD;
  }
  return email && password ? { email, password } : null;
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readTokens(): Partial<Roles> {
  return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8')) as Partial<Roles>;
}

async function loginByApi(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch(`${process.env.API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantCode: process.env.TENANT_CODE, email, password }),
  });
  const body = (await res.json()) as { data?: { accessToken: string; refreshToken: string } };
  if (!res.ok || !body.data?.accessToken) throw new Error(`Đăng nhập lại thất bại cho ${email}: HTTP ${res.status}`);
  return body.data;
}

/** Cập nhật token mới cho mọi role trỏ cùng tài khoản (ví dụ DVKH A và Nhà thầu dùng chung). */
function applyToken(target: Partial<Roles>, userId: string, fresh: { accessToken: string; refreshToken: string }): void {
  for (const s of Object.values(target)) {
    if (s && s.userId === userId) {
      if (s.accessToken !== fresh.accessToken) retired.set(s.accessToken, userId);
      s.accessToken = fresh.accessToken;
      s.refreshToken = fresh.refreshToken;
    }
  }
}

/**
 * Ghi phiên mới (do test đăng nhập lại qua giao diện) vào bộ nhớ và tokens.json,
 * để worker khác gặp 401 "session-superseded" đọc được token mới thay vì đăng nhập chồng thêm lần nữa.
 */
export function publishSession(roles: Roles, userId: string, fresh: { accessToken: string; refreshToken: string }): void {
  const all = readTokens();
  applyToken(all, userId, fresh);
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(all, null, 2));
  applyToken(roles, userId, fresh);
}

export function createRenewer(roles: Roles): (rejected: string) => Promise<string | null> {
  return async (rejected) => {
    const mine = Object.entries(roles) as [RoleKey, RoleSession][];
    const hit = mine.find(([, s]) => s.accessToken === rejected) ?? mine.find(([, s]) => s.userId === retired.get(rejected));
    if (!hit) return null; // không phải token của tài khoản test (token giả của case Authentication)
    const [key, session] = hit;
    // Token trong bộ nhớ đã mới hơn token bị từ chối: chỉ cần gửi lại bằng token hiện tại.
    if (session.accessToken !== rejected) return session.accessToken;
    const cred = credentials(key);
    if (!cred) return null;
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      const onDisk = readTokens()[key];
      if (onDisk && onDisk.accessToken !== rejected) {
        // Worker khác đã đăng nhập lại: dùng token mới trong file.
        applyToken(roles, session.userId, onDisk);
        return onDisk.accessToken;
      }
      let fd: number | undefined;
      try {
        fd = fs.openSync(LOCK_FILE, 'wx');
      } catch {
        const age = Date.now() - (fs.existsSync(LOCK_FILE) ? fs.statSync(LOCK_FILE).mtimeMs : Date.now());
        if (age > 20_000) fs.rmSync(LOCK_FILE, { force: true }); // khóa bị bỏ lại do worker chết
        await pause(300);
        continue;
      }
      try {
        const fresh = await loginByApi(cred.email, cred.password);
        const all = readTokens();
        applyToken(all, session.userId, fresh);
        fs.writeFileSync(TOKENS_FILE, JSON.stringify(all, null, 2));
        applyToken(roles, session.userId, fresh);
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

export const test = base.extend<{}, { roles: Roles }>({
  roles: [async ({}, use) => use(loadRoles()), { scope: 'worker' }],
});

export { expect } from '@playwright/test';
