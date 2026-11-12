import { FilePart, jsonPart } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid } from '../../core/fixtures/test-run.fixture';

/**
 * Dữ liệu mẫu cho mục "Quản trị vai trò, nhật ký và thiết lập": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/admin/roles": (o: Record<string, unknown> = {}) => ({ ...{ "name": tagged("AT Tên").slice(0, 255) }, ...o }),
  "PUT /api/admin/roles/{id}": (o: Record<string, unknown> = {}) => ({ ...{ "name": tagged("AT Tên").slice(0, 255), "permissions": [] }, ...o }),
  "POST /api/admin/roles/{id}/users": (o: Record<string, unknown> = {}) => ({ ...{ "userIds": [uuid()] }, ...o }),
  "POST /api/admin/users/{userId}/roles": (o: Record<string, unknown> = {}) => ({ ...{ "roleId": uuid() }, ...o }),
  "PUT /api/admin/settings": (o: Record<string, unknown> = {}) => ({ ...{ "sodMode": "WARN" }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/admin/roles": [{"name": "code", "required": false, "type": "string", "maxLength": 64, "minLength": 0}, {"name": "name", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "description", "required": false, "type": "string", "maxLength": 1000, "minLength": 0}, {"name": "departmentIds", "required": false, "type": "array"}, {"name": "permissions", "required": false, "type": "array"}, {"name": "acknowledged", "required": false, "type": "array"}],
  "PUT /api/admin/roles/{id}": [{"name": "name", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "description", "required": false, "type": "string", "maxLength": 1000, "minLength": 0}, {"name": "permissions", "required": true, "type": "array"}, {"name": "acknowledged", "required": false, "type": "array"}],
  "POST /api/admin/roles/{id}/users": [{"name": "userIds", "required": true, "type": "array", "minItems": 1}, {"name": "acknowledged", "required": false, "type": "array"}],
  "POST /api/admin/users/{userId}/roles": [{"name": "roleId", "required": true, "type": "string", "format": "uuid"}, {"name": "acknowledged", "required": false, "type": "array"}],
  "PUT /api/admin/settings": [{"name": "sodMode", "required": true, "type": "string", "enum": ["WARN", "BLOCK"]}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;
