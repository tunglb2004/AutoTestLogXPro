import { z } from 'zod';

/** Schema response của các API mục "Quản trị vai trò, nhật ký và thiết lập", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["ApiListPermissionCatalogueEntry"] = z.lazy(() => z.object({ "items": z.array(S["PermissionCatalogueEntry"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["ApiListRoleSummary"] = z.lazy(() => z.object({ "items": z.array(S["RoleSummary"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["RoleDetail"] = z.lazy(() => z.object({ "id": z.string().nullish(), "code": z.string().nullish(), "name": z.string().nullish(), "description": z.string().nullish(), "active": z.boolean().nullish(), "systemRole": z.boolean().nullish(), "userCount": z.number().nullish(), "defaultRole": z.boolean().nullish(), "departments": z.array(S["AssignedDepartment"]).nullish(), "createdAt": z.string().nullish(), "updatedAt": z.string().nullish(), "updatedByName": z.string().nullish(), "permissions": z.array(z.string()).nullish() }).passthrough());
S["ApiListRoleMember"] = z.lazy(() => z.object({ "items": z.array(S["RoleMember"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["ApiListAuditEntry"] = z.lazy(() => z.object({ "items": z.array(S["AuditEntry"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["SystemSettings"] = z.lazy(() => z.object({ "sodMode": z.enum(["WARN", "BLOCK"]).nullish() }).passthrough());
S["PermissionCatalogueEntry"] = z.lazy(() => z.object({ "code": z.string().nullish(), "name": z.string().nullish(), "groupName": z.string().nullish(), "description": z.string().nullish(), "object": z.string().nullish(), "action": z.string().nullish(), "blockCode": z.string().nullish(), "blockName": z.string().nullish(), "referenceRoleCode": z.string().nullish(), "referenceRoleName": z.string().nullish() }).passthrough());
S["Meta"] = z.lazy(() => z.object({ "pagination": S["Pagination"].nullish() }).passthrough());
S["RoleSummary"] = z.lazy(() => z.object({ "id": z.string().nullish(), "code": z.string().nullish(), "name": z.string().nullish(), "description": z.string().nullish(), "active": z.boolean().nullish(), "systemRole": z.boolean().nullish(), "permissionCount": z.number().nullish(), "userCount": z.number().nullish(), "defaultRole": z.boolean().nullish(), "departments": z.array(S["AssignedDepartment"]).nullish(), "createdAt": z.string().nullish() }).passthrough());
S["AssignedDepartment"] = z.lazy(() => z.object({ "id": z.string().nullish(), "name": z.string().nullish(), "active": z.boolean().nullish() }).passthrough());
S["RoleMember"] = z.lazy(() => z.object({ "id": z.string().nullish(), "employeeCode": z.string().nullish(), "email": z.string().nullish(), "displayName": z.string().nullish(), "status": z.string().nullish(), "roleCount": z.number().nullish() }).passthrough());
S["AuditEntry"] = z.lazy(() => z.object({ "id": z.string().nullish(), "at": z.string().nullish(), "actorUserId": z.string().nullish(), "actorEmail": z.string().nullish(), "actorName": z.string().nullish(), "actorEmployeeCode": z.string().nullish(), "action": z.string().nullish(), "summary": z.string().nullish(), "targetEntity": z.string().nullish(), "targetId": z.string().nullish(), "oldValue": S["JsonNode"].nullish(), "newValue": S["JsonNode"].nullish(), "event": z.string().nullish(), "eventLabel": z.string().nullish(), "summaryHtml": z.string().nullish() }).passthrough());
S["Pagination"] = z.lazy(() => z.object({ "total": z.number().nullish(), "perPage": z.number().nullish(), "currentPage": z.number().nullish(), "totalPages": z.number().nullish() }).passthrough());
S["JsonNode"] = z.lazy(() => z.object({ "valueNode": z.boolean().nullish(), "container": z.boolean().nullish(), "missingNode": z.boolean().nullish(), "object": z.boolean().nullish(), "nodeType": z.enum(["ARRAY", "BINARY", "BOOLEAN", "MISSING", "NULL", "NUMBER", "OBJECT", "POJO", "STRING"]).nullish(), "string": z.boolean().nullish(), "integralNumber": z.boolean().nullish(), "pojo": z.boolean().nullish(), "floatingPointNumber": z.boolean().nullish(), "short": z.boolean().nullish(), "int": z.boolean().nullish(), "long": z.boolean().nullish(), "double": z.boolean().nullish(), "bigDecimal": z.boolean().nullish(), "bigInteger": z.boolean().nullish(), "textual": z.boolean().nullish(), "boolean": z.boolean().nullish(), "binary": z.boolean().nullish(), "array": z.boolean().nullish(), "empty": z.boolean().nullish(), "null": z.boolean().nullish(), "float": z.boolean().nullish(), "number": z.boolean().nullish(), "embeddedValue": z.boolean().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "GET /api/admin/permissions": { status: 200, contentType: "*/*", data: S["ApiListPermissionCatalogueEntry"] },
  "GET /api/admin/roles": { status: 200, contentType: "*/*", data: S["ApiListRoleSummary"] },
  "POST /api/admin/roles": { status: 200, contentType: "*/*", data: S["RoleDetail"] },
  "GET /api/admin/roles/{id}": { status: 200, contentType: "*/*", data: S["RoleDetail"] },
  "PUT /api/admin/roles/{id}": { status: 200, contentType: "*/*", data: S["RoleDetail"] },
  "DELETE /api/admin/roles/{id}": { status: 204, contentType: "", data: null },
  "POST /api/admin/roles/{id}/activate": { status: 200, contentType: "*/*", data: S["RoleDetail"] },
  "POST /api/admin/roles/{id}/deactivate": { status: 200, contentType: "*/*", data: S["RoleDetail"] },
  "GET /api/admin/roles/{id}/users": { status: 200, contentType: "*/*", data: S["ApiListRoleMember"] },
  "POST /api/admin/roles/{id}/users": { status: 204, contentType: "", data: null },
  "DELETE /api/admin/roles/{id}/users/{userId}": { status: 204, contentType: "", data: null },
  "POST /api/admin/users/{userId}/roles": { status: 204, contentType: "", data: null },
  "DELETE /api/admin/users/{userId}/roles/{roleId}": { status: 204, contentType: "", data: null },
  "GET /api/admin/audit-log": { status: 200, contentType: "*/*", data: S["ApiListAuditEntry"] },
  "GET /api/admin/settings": { status: 200, contentType: "*/*", data: S["SystemSettings"] },
  "PUT /api/admin/settings": { status: 200, contentType: "*/*", data: S["SystemSettings"] },
};
