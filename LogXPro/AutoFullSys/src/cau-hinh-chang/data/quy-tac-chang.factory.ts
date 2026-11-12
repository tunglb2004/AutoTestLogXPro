import { FilePart, jsonPart } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid } from '../../core/fixtures/test-run.fixture';

/**
 * Dữ liệu mẫu cho mục "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/leg-rules": (o: Record<string, unknown> = {}) => ({ ...{ "cargoLoadTypeCode": "AT", "destinationPointTypeCode": "AT", "executionScope": "INTERNATIONAL", "legs": [{ "legTypeCode": "AT" }], "name": tagged("AT Tên").slice(0, 150), "originPointTypeCode": "AT", "transportModeCode": "AT" }, ...o }),
  "PUT /api/leg-rules/{code}": (o: Record<string, unknown> = {}) => ({ ...{ "cargoLoadTypeCode": "AT", "destinationPointTypeCode": "AT", "executionScope": "INTERNATIONAL", "legs": [{ "legTypeCode": "AT" }], "name": tagged("AT Tên").slice(0, 150), "originPointTypeCode": "AT", "transportModeCode": "AT" }, ...o }),
  "PATCH /api/leg-rules/{code}/status": (o: Record<string, unknown> = {}) => ({ ...{ "status": "ACTIVE" }, ...o }),
  "POST /api/leg-rules/simulate": (o: Record<string, unknown> = {}) => ({ ...{ "cargoLoadTypeCode": "AT", "destination": { "kind": "ADDRESS" }, "origin": { "kind": "ADDRESS" }, "transportModeCode": "AT" }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/leg-rules": [{"name": "name", "required": true, "type": "string", "maxLength": 150, "minLength": 0}, {"name": "executionScope", "required": true, "type": "string", "enum": ["INTERNATIONAL", "DOMESTIC", "BORDER_GATE"]}, {"name": "transportModeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "cargoLoadTypeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "originPointTypeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "destinationPointTypeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "description", "required": false, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "legs", "required": true, "type": "array", "minItems": 1}],
  "PUT /api/leg-rules/{code}": [{"name": "name", "required": true, "type": "string", "maxLength": 150, "minLength": 0}, {"name": "executionScope", "required": true, "type": "string", "enum": ["INTERNATIONAL", "DOMESTIC", "BORDER_GATE"]}, {"name": "transportModeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "cargoLoadTypeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "originPointTypeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "destinationPointTypeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "description", "required": false, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "legs", "required": true, "type": "array", "minItems": 1}],
  "PATCH /api/leg-rules/{code}/status": [{"name": "status", "required": true, "type": "string", "enum": ["ACTIVE", "INACTIVE"]}],
  "POST /api/leg-rules/simulate": [{"name": "transportModeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "cargoLoadTypeCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "origin", "required": true, "type": "object"}, {"name": "destination", "required": true, "type": "object"}, {"name": "serviceTypeCodes", "required": false, "type": "array"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;
