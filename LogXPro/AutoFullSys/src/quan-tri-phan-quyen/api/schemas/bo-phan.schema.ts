import { z } from 'zod';

/** Schema response của các API mục "Quản trị bộ phận", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["ApiListDepartmentSummary"] = z.lazy(() => z.object({ "items": z.array(S["DepartmentSummary"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["DepartmentDetail"] = z.lazy(() => z.object({ "id": z.string().nullish(), "name": z.string().nullish(), "description": z.string().nullish(), "active": z.boolean().nullish(), "roles": z.array(S["AssignedRole"]).nullish(), "members": z.array(S["DepartmentMember"]).nullish() }).passthrough());
S["DepartmentSummary"] = z.lazy(() => z.object({ "id": z.string().nullish(), "name": z.string().nullish(), "description": z.string().nullish(), "active": z.boolean().nullish(), "roleCount": z.number().nullish(), "memberCount": z.number().nullish() }).passthrough());
S["Meta"] = z.lazy(() => z.object({ "pagination": S["Pagination"].nullish() }).passthrough());
S["AssignedRole"] = z.lazy(() => z.object({ "id": z.string().nullish(), "code": z.string().nullish(), "name": z.string().nullish(), "active": z.boolean().nullish() }).passthrough());
S["DepartmentMember"] = z.lazy(() => z.object({ "id": z.string().nullish(), "email": z.string().nullish(), "displayName": z.string().nullish() }).passthrough());
S["Pagination"] = z.lazy(() => z.object({ "total": z.number().nullish(), "perPage": z.number().nullish(), "currentPage": z.number().nullish(), "totalPages": z.number().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "GET /api/admin/departments": { status: 200, contentType: "*/*", data: S["ApiListDepartmentSummary"] },
  "POST /api/admin/departments": { status: 200, contentType: "*/*", data: S["DepartmentDetail"] },
  "GET /api/admin/departments/{id}": { status: 200, contentType: "*/*", data: S["DepartmentDetail"] },
  "PUT /api/admin/departments/{id}": { status: 200, contentType: "*/*", data: S["DepartmentDetail"] },
  "DELETE /api/admin/departments/{id}": { status: 204, contentType: "", data: null },
  "POST /api/admin/departments/{id}/activate": { status: 200, contentType: "*/*", data: S["DepartmentDetail"] },
  "POST /api/admin/departments/{id}/deactivate": { status: 200, contentType: "*/*", data: S["DepartmentDetail"] },
  "POST /api/admin/departments/{id}/roles": { status: 200, contentType: "*/*", data: S["DepartmentDetail"] },
  "DELETE /api/admin/departments/{id}/roles/{roleId}": { status: 204, contentType: "", data: null },
  "POST /api/admin/users/{userId}/departments": { status: 204, contentType: "", data: null },
  "DELETE /api/admin/users/{userId}/departments/{departmentId}": { status: 204, contentType: "", data: null },
};
