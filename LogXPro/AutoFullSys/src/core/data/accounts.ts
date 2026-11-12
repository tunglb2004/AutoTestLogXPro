/**
 * Vai trò dùng trong bộ case → tiền tố biến môi trường. Email ghi chú theo bộ case, mật khẩu chỉ đọc từ .env.
 * Bắt buộc: admin, cc, dp, k1, k1b, sale. Còn lại không bắt buộc; case cần tới sẽ báo thiếu tài khoản.
 */
export const ROLE_ENV = {
  admin: 'ADMIN', // tung.luu.dvkh_master_data@logxpro.test
  cc: 'CC_K5', // tungqlcc@gmail.com
  dp: 'DP_K2', // tungqldp@gmail.com
  k1: 'K1', // tungkh@gmail.com
  k1b: 'K1B', // tungkh2@gmail.com
  sale: 'SALE', // tunglead@gmail.com
  sale2: 'SALE2', // tunglead2@gmail.com
  dpKhq: 'DP_KHQ',
  dpHqgs: 'DP_HQGS',
  dpVt: 'DP_VT',
  dpSt: 'DP_ST',
  dpKb: 'DP_KB',
  k4: 'K4',
  k5Only: 'K5_ONLY',
  viewGia: 'VIEW_GIA',
  noRole: 'NO_ROLE',
} as const;

export type RoleKey = keyof typeof ROLE_ENV;
export const REQUIRED_ROLES: RoleKey[] = ['admin', 'cc', 'dp', 'k1', 'k1b', 'sale'];

export function credentials(role: RoleKey): { email: string; password: string } | null {
  const prefix = ROLE_ENV[role];
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  return email && password ? { email, password } : null;
}

/** Nhận diện vai trò từ chữ trong bộ case (vd "K1 (`tungkh@gmail.com`)", "DP_K2", "CC_K5"). */
export function roleOf(text: string): RoleKey {
  const t = text;
  if (/K1B|tungkh2/.test(t)) return 'k1b';
  if (/ADMIN|master_data/.test(t)) return 'admin';
  if (/DP_KHQ/.test(t)) return 'dpKhq';
  if (/DP_VT/.test(t)) return 'dpVt';
  if (/DP_K2|tungqldp|\bDP\b/.test(t)) return 'dp';
  if (/CC_K5|tungqlcc|\bCC\b|\bK5\b/.test(t)) return 'cc';
  if (/SALE2|tunglead2/.test(t)) return 'sale2';
  if (/SALE|tunglead/.test(t)) return 'sale';
  return 'k1';
}
