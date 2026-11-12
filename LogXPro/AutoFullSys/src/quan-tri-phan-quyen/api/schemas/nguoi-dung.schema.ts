import { z } from 'zod';

/** Schema response của các API mục "Quản trị người dùng", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["ApiListUserSummary"] = z.lazy(() => z.object({ "items": z.array(S["UserSummary"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["TemporaryCredentials"] = z.lazy(() => z.object({ "userId": z.string().nullish(), "email": z.string().nullish(), "password": z.string().nullish() }).passthrough());
S["UserDetail"] = z.lazy(() => z.object({ "id": z.string().nullish(), "employeeCode": z.string().nullish(), "email": z.string().nullish(), "displayName": z.string().nullish(), "phone": z.string().nullish(), "status": z.string().nullish(), "passwordChangeRequired": z.boolean().nullish(), "lastLoginAt": z.string().nullish(), "createdAt": z.string().nullish(), "updatedAt": z.string().nullish(), "updatedByName": z.string().nullish(), "roles": z.array(S["AssignedRole"]).nullish(), "departments": z.array(S["AssignedDepartment"]).nullish() }).passthrough());
S["ApiListEffectivePermission"] = z.lazy(() => z.object({ "items": z.array(S["EffectivePermission"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["UserSummary"] = z.lazy(() => z.object({ "id": z.string().nullish(), "employeeCode": z.string().nullish(), "email": z.string().nullish(), "displayName": z.string().nullish(), "phone": z.string().nullish(), "status": z.string().nullish(), "passwordChangeRequired": z.boolean().nullish(), "lastLoginAt": z.string().nullish(), "createdAt": z.string().nullish(), "roleCount": z.number().nullish(), "roles": z.array(S["AssignedRole"]).nullish(), "departments": z.array(S["AssignedDepartment"]).nullish() }).passthrough());
S["Meta"] = z.lazy(() => z.object({ "pagination": S["Pagination"].nullish() }).passthrough());
S["AssignedRole"] = z.lazy(() => z.object({ "id": z.string().nullish(), "code": z.string().nullish(), "name": z.string().nullish(), "active": z.boolean().nullish() }).passthrough());
S["AssignedDepartment"] = z.lazy(() => z.object({ "id": z.string().nullish(), "name": z.string().nullish(), "active": z.boolean().nullish() }).passthrough());
S["EffectivePermission"] = z.lazy(() => z.object({ "code": z.string().nullish(), "name": z.string().nullish(), "groupName": z.string().nullish(), "description": z.string().nullish(), "object": z.string().nullish(), "action": z.string().nullish(), "blockCode": z.string().nullish(), "blockName": z.string().nullish(), "referenceRoleCode": z.string().nullish(), "referenceRoleName": z.string().nullish(), "roles": z.array(S["Source"]).nullish() }).passthrough());
S["Pagination"] = z.lazy(() => z.object({ "total": z.number().nullish(), "perPage": z.number().nullish(), "currentPage": z.number().nullish(), "totalPages": z.number().nullish() }).passthrough());
S["Source"] = z.lazy(() => z.object({ "id": z.string().nullish(), "name": z.string().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "GET /api/admin/users": { status: 200, contentType: "*/*", data: S["ApiListUserSummary"] },
  "POST /api/admin/users": { status: 200, contentType: "*/*", data: S["TemporaryCredentials"] },
  "GET /api/admin/users/{id}": { status: 200, contentType: "*/*", data: S["UserDetail"] },
  "PUT /api/admin/users/{id}": { status: 200, contentType: "*/*", data: S["UserDetail"] },
  "POST /api/admin/users/{id}/lock": { status: 200, contentType: "*/*", data: S["UserDetail"] },
  "POST /api/admin/users/{id}/unlock": { status: 200, contentType: "*/*", data: S["UserDetail"] },
  "POST /api/admin/users/{id}/password/reset": { status: 200, contentType: "*/*", data: S["TemporaryCredentials"] },
  "GET /api/admin/users/{id}/permissions": { status: 200, contentType: "*/*", data: S["ApiListEffectivePermission"] },
  "GET /api/admin/users/{id}/permissions/export": { status: 200, contentType: "*/*", data: z.string() },
};
