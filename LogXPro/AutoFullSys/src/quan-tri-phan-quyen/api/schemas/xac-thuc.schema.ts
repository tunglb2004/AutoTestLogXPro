import { z } from 'zod';

/** Schema response của các API mục "Xác thực và phiên đăng nhập", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["TokenPair"] = z.lazy(() => z.object({ "accessToken": z.string().nullish(), "refreshToken": z.string().nullish(), "expiresInSeconds": z.number().nullish(), "passwordChangeRequired": z.boolean().nullish() }).passthrough());
S["CurrentUser"] = z.lazy(() => z.object({ "userId": z.string().nullish(), "tenantId": z.string().nullish(), "email": z.string().nullish(), "displayName": z.string().nullish(), "roles": z.array(S["AssignedRole"]).nullish(), "permissions": z.array(z.string()).nullish() }).passthrough());
S["AssignedRole"] = z.lazy(() => z.object({ "id": z.string().nullish(), "code": z.string().nullish(), "name": z.string().nullish(), "active": z.boolean().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "POST /api/auth/login": { status: 200, contentType: "*/*", data: S["TokenPair"] },
  "POST /api/auth/logout": { status: 204, contentType: "", data: null },
  "GET /api/auth/me": { status: 200, contentType: "*/*", data: S["CurrentUser"] },
  "POST /api/auth/password": { status: 204, contentType: "", data: null },
  "POST /api/auth/refresh": { status: 200, contentType: "*/*", data: S["TokenPair"] },
};
