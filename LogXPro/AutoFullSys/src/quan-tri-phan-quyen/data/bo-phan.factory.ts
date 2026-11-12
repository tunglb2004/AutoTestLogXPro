import { FilePart, jsonPart } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid } from '../../core/fixtures/test-run.fixture';

/**
 * Dữ liệu mẫu cho mục "Quản trị bộ phận": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/admin/departments": (o: Record<string, unknown> = {}) => ({ ...{ "name": tagged("AT Tên").slice(0, 255) }, ...o }),
  "PUT /api/admin/departments/{id}": (o: Record<string, unknown> = {}) => ({ ...{ "name": tagged("AT Tên").slice(0, 255) }, ...o }),
  "POST /api/admin/departments/{id}/roles": (o: Record<string, unknown> = {}) => ({ ...{ "roleIds": [uuid()] }, ...o }),
  "POST /api/admin/users/{userId}/departments": (o: Record<string, unknown> = {}) => ({ ...{ "departmentId": uuid() }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/admin/departments": [{"name": "name", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "description", "required": false, "type": "string", "maxLength": 1000, "minLength": 0}],
  "PUT /api/admin/departments/{id}": [{"name": "name", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "description", "required": false, "type": "string", "maxLength": 1000, "minLength": 0}],
  "POST /api/admin/departments/{id}/roles": [{"name": "roleIds", "required": true, "type": "array", "minItems": 1}],
  "POST /api/admin/users/{userId}/departments": [{"name": "departmentId", "required": true, "type": "string", "format": "uuid"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;
