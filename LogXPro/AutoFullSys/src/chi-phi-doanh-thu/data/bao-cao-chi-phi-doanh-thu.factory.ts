import { FilePart, jsonPart } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid } from '../../core/fixtures/test-run.fixture';

/**
 * Dữ liệu mẫu cho mục "Màn Chi phí – Doanh thu (báo cáo quản trị)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/cost-revenue/exports": (o: Record<string, unknown> = {}) => ({ ...{  }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/cost-revenue/exports": [{"name": "orderIds", "required": false, "type": "array", "minItems": 0}, {"name": "search", "required": false, "type": "string"}, {"name": "customerIds", "required": false, "type": "array"}, {"name": "statuses", "required": false, "type": "array"}, {"name": "revenueFrom", "required": false, "type": "number"}, {"name": "revenueTo", "required": false, "type": "number"}, {"name": "costFrom", "required": false, "type": "number"}, {"name": "costTo", "required": false, "type": "number"}, {"name": "marginFrom", "required": false, "type": "number"}, {"name": "marginTo", "required": false, "type": "number"}, {"name": "performedFrom", "required": false, "type": "string", "format": "date"}, {"name": "performedTo", "required": false, "type": "string", "format": "date"}, {"name": "completedFrom", "required": false, "type": "string", "format": "date"}, {"name": "completedTo", "required": false, "type": "string", "format": "date"}, {"name": "creatorIds", "required": false, "type": "array"}, {"name": "sortBy", "required": false, "type": "string", "enum": ["REVENUE", "COST", "MARGIN", "PERFORMED_AT", "COMPLETED_AT"]}, {"name": "descending", "required": false, "type": "boolean"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;
