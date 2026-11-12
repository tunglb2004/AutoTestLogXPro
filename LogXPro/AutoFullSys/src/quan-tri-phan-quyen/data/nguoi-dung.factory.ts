import { FilePart, jsonPart, data, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, TestRun } from '../../core/fixtures/test-run.fixture';
import { env } from '../../core/env';
/**
 * Dữ liệu mẫu cho mục "Quản trị người dùng": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/admin/users": (o: Record<string, unknown> = {}) => ({ ...{ "displayName": tagged("AT Tên").slice(0, 255), "email": `at.${TEST_RUN_ID}.${randInt(1000, 9999)}@logxpro.test`, "employeeCode": "AT" }, ...o }),
  "PUT /api/admin/users/{id}": (o: Record<string, unknown> = {}) => ({ ...{ "displayName": tagged("AT Tên").slice(0, 255), "email": `at.${TEST_RUN_ID}.${randInt(1000, 9999)}@logxpro.test`, "employeeCode": "AT" }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/admin/users": [{"name": "employeeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "email", "required": true, "type": "string", "maxLength": 320, "minLength": 0, "format": "email"}, {"name": "displayName", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "phone", "required": false, "type": "string"}, {"name": "password", "required": false, "type": "string", "maxLength": 72, "minLength": 0}, {"name": "roleIds", "required": false, "type": "array"}, {"name": "departmentIds", "required": false, "type": "array"}, {"name": "acknowledged", "required": false, "type": "array"}],
  "PUT /api/admin/users/{id}": [{"name": "employeeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "email", "required": true, "type": "string", "maxLength": 320, "minLength": 0, "format": "email"}, {"name": "displayName", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "phone", "required": false, "type": "string"}, {"name": "resetPassword", "required": false, "type": "boolean"}, {"name": "roleIds", "required": false, "type": "array"}, {"name": "departmentIds", "required": false, "type": "array"}, {"name": "acknowledged", "required": false, "type": "array"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
export type FreshUser = { id: string; email: string; password: string; employeeCode: string; displayName: string };

/**
 * ADMIN tạo tài khoản mới (chưa vai trò, trừ khi truyền `roleIds`) với mật khẩu NEW_USER_PASSWORD.
 * Dùng cho case đăng nhập/phiên/mật khẩu: hệ thống 1 tài khoản 1 phiên, đăng nhập lại tài khoản dùng chung sẽ làm rớt phiên của worker khác.
 */
export async function freshUser(run: TestRun, tag: string, o: Record<string, unknown> = {}): Promise<FreshUser> {
  const rand = Math.random().toString(36).slice(2, 8);
  const employeeCode = `AT${TEST_RUN_ID}${rand}`.replace(/[^A-Za-z0-9]/g, '').slice(0, 32);
  const email = `at.${tag}.${rand}.${TEST_RUN_ID}`.toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 60) + '@logx-test.vn';
  const displayName = `Nhân viên kiểm thử ${tag} ${rand}`;
  const d = await must(await run.http.call('POST /api/admin/users', { token: run.token('admin'), json: { employeeCode, email, displayName, password: env.newUserPassword, roleIds: [], departmentIds: [], ...o } }), `ADMIN tạo tài khoản ${tag}`);
  run.track(`tài khoản ${email}`, () => run.http.call('POST /api/admin/users/{id}/lock', { token: run.token('admin'), params: { id: d.userId } }));
  return { id: d.userId, email, password: d.password ?? env.newUserPassword, employeeCode, displayName };
}

/** Gọi đăng nhập (không token). */
export function login(run: TestRun, email: string, password: string, tenantCode: string = env.tenantCode) {
  return run.http.call('POST /api/auth/login', { json: { tenantCode, email, password } });
}

/** Đăng nhập và trả cặp token; lỗi thì nêu rõ bước chuẩn bị thất bại. */
export async function loginOk(run: TestRun, u: { email: string; password: string }): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await login(run, u.email, u.password);
  if (!res.ok()) throw new Error(`Chuẩn bị dữ liệu thất bại (đăng nhập ${u.email}): HTTP ${res.status()} ${(await res.text()).slice(0, 200)}`);
  return data(res);
}

/** Đổi mật khẩu tài khoản đang đăng nhập (đổi lần đầu nếu tài khoản mới bị yêu cầu). */
export async function changePassword(run: TestRun, accessToken: string, currentPassword: string, newPassword: string) {
  return run.http.call('POST /api/auth/password', { token: accessToken, json: { currentPassword, newPassword, confirmPassword: newPassword } });
}
