import { FilePart, jsonPart, items, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
/**
 * Dữ liệu mẫu cho mục "Giá mua định mức (SBP)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "PUT /api/standard-buying-prices/{id}/benchmark": (o: Record<string, unknown> = {}) => ({ ...{ "benchmarkPrice": randMoney() }, ...o }),
  "PUT /api/standard-buying-prices/benchmarks": (o: Record<string, unknown> = {}) => ({ ...{ "items": [] }, ...o }),
  "PUT /api/standard-buying-prices/{id}/conversion": (o: Record<string, unknown> = {}) => ({ ...{ "source": tagged("AT Dữ liệu").slice(0, 255) }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "PUT /api/standard-buying-prices/{id}/benchmark": [{"name": "benchmarkPrice", "required": true, "type": "number", "minimum": 0}],
  "PUT /api/standard-buying-prices/benchmarks": [{"name": "items", "required": true, "type": "array", "minItems": 0}],
  "PUT /api/standard-buying-prices/{id}/conversion": [{"name": "source", "required": true, "type": "string", "minLength": 1}, {"name": "rates", "required": false, "type": "array"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
/** Dòng giá mua định mức (SBP) của 1 đầu mục; mỗi đầu mục "AT" có đúng 1 tổ hợp thuộc tính P0 nên lấy dòng đầu. */
export async function sbpLines(run: TestRun, priceConfigurationItemId: string, role: RoleKey = 'cc'): Promise<any[]> {
  return items(await must(await run.http.call('GET /api/standard-buying-prices', { token: run.token(role), query: { priceConfigurationItemId, perPage: 100 } }), 'danh sách giá mua định mức'));
}

export async function sbpOf(run: TestRun, priceConfigurationItemId: string, role: RoleKey = 'cc'): Promise<any> {
  const list = await sbpLines(run, priceConfigurationItemId, role);
  if (!list.length) throw new Error(`Chưa có giá mua định mức cho đầu mục ${priceConfigurationItemId} (bảng giá mua đã kích hoạt chưa?)`);
  return list[0];
}

export async function setBenchmark(run: TestRun, id: string, benchmarkPrice: number, role: RoleKey = 'cc'): Promise<any> {
  return must(await run.http.call('PUT /api/standard-buying-prices/{id}/benchmark', { token: run.token(role), params: { id }, json: { benchmarkPrice } }), 'nhập giá mua định mức');
}
