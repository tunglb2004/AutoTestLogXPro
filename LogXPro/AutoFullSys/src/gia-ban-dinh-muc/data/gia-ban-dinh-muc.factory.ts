import { FilePart, jsonPart, items, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
/**
 * Dữ liệu mẫu cho mục "Giá bán định mức (SSP)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "PUT /api/standard-selling-prices/{id}/selling-price": (o: Record<string, unknown> = {}) => ({ ...{ "sellingPrice": randMoney() }, ...o }),
  "PUT /api/standard-selling-prices/selling-prices": (o: Record<string, unknown> = {}) => ({ ...{ "items": [] }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "PUT /api/standard-selling-prices/{id}/selling-price": [{"name": "sellingPrice", "required": true, "type": "number", "minimum": 0}],
  "PUT /api/standard-selling-prices/selling-prices": [{"name": "items", "required": true, "type": "array", "minItems": 0}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
/** Dòng giá bán định mức (SSP) của 1 đầu mục. */
export async function sspLines(run: TestRun, priceConfigurationItemId: string, role: RoleKey = 'cc'): Promise<any[]> {
  return items(await must(await run.http.call('GET /api/standard-selling-prices', { token: run.token(role), query: { priceConfigurationItemId, perPage: 100 } }), 'danh sách giá bán định mức'));
}

export async function sspOf(run: TestRun, priceConfigurationItemId: string, role: RoleKey = 'cc'): Promise<any> {
  const list = await sspLines(run, priceConfigurationItemId, role);
  if (!list.length) throw new Error(`Chưa có giá bán định mức cho đầu mục ${priceConfigurationItemId}`);
  return list[0];
}

export async function setSelling(run: TestRun, id: string, sellingPrice: number, role: RoleKey = 'cc'): Promise<any> {
  return must(await run.http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: run.token(role), params: { id }, json: { sellingPrice } }), 'nhập giá bán định mức');
}
