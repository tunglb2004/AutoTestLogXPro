import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** Biến môi trường dùng chung. Không có giá trị mặc định trỏ tới production. */
export const env = {
  get apiUrl(): string {
    return (process.env.API_URL ?? '').replace(/\/$/, '');
  },
  get webUrl(): string {
    return (process.env.WEB_URL ?? '').replace(/\/$/, '');
  },
  get tenantCode(): string {
    return process.env.TENANT_CODE ?? '';
  },
  get allowCleanup(): boolean {
    return process.env.ALLOW_CLEANUP === 'true';
  },
  get uploadDir(): string {
    return process.env.UPLOAD_FILES_DIR ?? '';
  },
  get sizeDir(): string {
    return process.env.SIZE_FILES_DIR ?? '';
  },
  /** Mật khẩu ban đầu khi ADMIN tạo tài khoản mới trong case (đủ độ mạnh theo BR_PQ_07). */
  get newUserPassword(): string {
    const v = process.env.NEW_USER_PASSWORD;
    if (!v) throw new Error('Thiếu NEW_USER_PASSWORD trong .env (mật khẩu ban đầu cho tài khoản tạo mới trong case)');
    return v;
  },
  /** Id dữ liệu nền có sẵn (KH_A…KH_E, NT_A…NT_C) theo mục "Dữ liệu cần chuẩn bị" của bộ case. */
  ref(name: 'CUSTOMER_A_ID' | 'CUSTOMER_B_ID' | 'CUSTOMER_C_ID' | 'CUSTOMER_D_ID' | 'CUSTOMER_E_ID' | 'CONTRACTOR_A_ID' | 'CONTRACTOR_B_ID' | 'CONTRACTOR_C_ID' | 'CONTRACTOR_D_ID' | 'CONTRACTOR_E_ID' | 'CONTRACTOR_STOPPED_ID'): string {
    const v = process.env[name];
    if (!v) throw new Error(`Thiếu ${name} trong .env (mục "Dữ liệu nền có sẵn" của .env.example)`);
    return v;
  },
};

/** Trả danh sách biến còn thiếu. */
export function missingEnv(names: string[]): string[] {
  return names.filter((n) => !process.env[n]);
}

/** Chỉ cho chạy trên host nằm trong ALLOWED_HOSTS (mặc định chỉ có host dev). */
export function assertAllowedEnvironment(): void {
  const allowed = (process.env.ALLOWED_HOSTS ?? 'logx-api-dev.sonthanh.net.vn,logx-dev.sonthanh.net.vn')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  for (const url of [env.apiUrl, env.webUrl]) {
    const host = new URL(url).host.toLowerCase();
    if (!allowed.includes(host)) throw new Error(`Host ${host} không nằm trong ALLOWED_HOSTS; bộ test chỉ chạy trên môi trường dev được phép.`);
  }
}
