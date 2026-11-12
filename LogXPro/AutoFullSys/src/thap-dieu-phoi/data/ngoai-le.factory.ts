import { FilePart, jsonPart } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid } from '../../core/fixtures/test-run.fixture';

/**
 * Dữ liệu mẫu cho mục "Tháp điều phối — thao tác ngoại lệ": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/k3/service-orders/{id}/scope-requests": (o: Record<string, unknown> = {}) => ({ ...{ "kind": "ADD", "reason": tagged("Lý do kiểm thử tự động").slice(0, 1000), "serviceTypeCode": "AT" }, ...o }),
  "POST /api/k3/service-orders/{id}/vehicle-changes": (o: Record<string, unknown> = {}) => ({ ...{ "plateNo": "AT", "reason": tagged("Lý do kiểm thử tự động").slice(0, 1000), "role": tagged("AT Dữ liệu").slice(0, 255) }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/k3/service-orders/{id}/scope-requests": [{"name": "kind", "required": true, "type": "string", "enum": ["ADD", "REMOVE"]}, {"name": "serviceTypeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "reason", "required": true, "type": "string", "maxLength": 1000, "minLength": 0}],
  "POST /api/k3/service-orders/{id}/vehicle-changes": [{"name": "legPosition", "required": false, "type": "integer", "minimum": 1, "format": "int32"}, {"name": "role", "required": true, "type": "string", "minLength": 1}, {"name": "pairIndex", "required": false, "type": "integer", "minimum": 0, "maximum": 0, "format": "int32"}, {"name": "plateNo", "required": true, "type": "string", "maxLength": 20, "minLength": 0}, {"name": "driverName", "required": false, "type": "string", "maxLength": 100, "minLength": 0}, {"name": "driverPhone", "required": false, "type": "string", "maxLength": 20, "minLength": 0}, {"name": "reason", "required": true, "type": "string", "maxLength": 1000, "minLength": 0}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;
