import { FilePart, jsonPart, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
/**
 * Dữ liệu mẫu cho mục "Tháp điều phối — phiếu dịch vụ (CC)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/k3/service-orders/{id}/reject": (o: Record<string, unknown> = {}) => ({ ...{ "reason": tagged("Lý do kiểm thử tự động").slice(0, 500) }, ...o }),
  "POST /api/k3/service-orders/{id}/legs/confirm": (o: Record<string, unknown> = {}) => ({
    ...{
      "legs": [{
        "position": 1,
        "name": "Nội địa đến Nội địa",
        "serviceTypeCodes": ["CUSTOMS_DECLARATION"],
      }],
      "ruleCode": "AT",
    },
    ...o,
  }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/k3/service-orders/{id}/reject": [{"name": "reason", "required": true, "type": "string", "maxLength": 500, "minLength": 0}],
  "POST /api/k3/service-orders/{id}/legs/confirm": [{"name": "ruleCode", "required": true, "type": "string", "maxLength": 13, "minLength": 0}, {"name": "legs", "required": true, "type": "array", "minItems": 1}, {"name": "warehouseLegPosition", "required": false, "type": "integer", "minimum": 1, "format": "int32"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
export async function k3Order(run: TestRun, id: string, role: RoleKey = 'cc'): Promise<any> {
  return must(await run.http.call('GET /api/k3/service-orders/{id}', { token: run.token(role), params: { id } }), 'đọc phiếu ở Tháp điều phối');
}

/** CC tiếp nhận phiếu (SUBMITTED → ACCEPTED). */
export async function acceptOrder(run: TestRun, id: string, role: RoleKey = 'cc'): Promise<void> {
  await must(await run.http.call('POST /api/k3/service-orders/{id}/accept', { token: run.token(role), params: { id } }), 'CC tiếp nhận phiếu');
}

/**
 * Dựng đúng payload mà màn Tháp điều phối gửi khi bấm "Xác nhận & kích hoạt".
 * Preview trả `services: Ref[]`, còn API confirm bắt buộc mỗi chặng có đủ
 * `position`, `name` và `serviceTypeCodes`; Kho bãi được gửi riêng bằng
 * `warehouseLegPosition`, không nằm trong `serviceTypeCodes`.
 */
export function confirmLegsBody(preview: any, warehouseLegPosition?: number): Record<string, unknown> {
  const legs = (preview?.legs ?? []).map((leg: any) => ({
    position: leg.position,
    name: leg.name,
    serviceTypeCodes: (leg.serviceTypeCodes ?? leg.services ?? [])
      .map((service: any) => (typeof service === 'string' ? service : service?.code ?? service?.serviceTypeCode))
      .filter((code: unknown): code is string => typeof code === 'string' && code.length > 0),
  }));
  const body: Record<string, unknown> = { ruleCode: preview?.ruleCode, legs };
  if (warehouseLegPosition !== undefined || preview?.hasWarehousing) {
    body.warehouseLegPosition = warehouseLegPosition ?? preview?.warehouseLegPosition ?? 1;
  }
  return body;
}

/** Xem trước cấu trúc chặng rồi xác nhận đúng như bản xem trước (ruleCode theo preview). */
export async function confirmLegs(run: TestRun, id: string, role: RoleKey = 'cc'): Promise<any> {
  const preview = await must(await run.http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: run.token(role), params: { id } }), 'xem trước cấu trúc chặng');
  const body = confirmLegsBody(preview);
  await must(await run.http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: run.token(role), params: { id }, json: body }), 'xác nhận cấu trúc chặng');
  return preview;
}
