import { FilePart, jsonPart, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
/**
 * Dữ liệu mẫu cho mục "Báo giá khách hàng (BGKH/RC)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "PUT /api/customer-quotations/{id}/settings": (o: Record<string, unknown> = {}) => ({ ...{ "currency": "VND", "vatBand": "VAT_10" }, ...o }),
  "PUT /api/customer-quotations/{id}/prices": (o: Record<string, unknown> = {}) => ({ ...{ "lines": [{ "lineId": uuid(), "sellPrice": randMoney() }] }, ...o }),
  "POST /api/customer-quotations/{id}/merges": (o: Record<string, unknown> = {}) => ({ ...{ "displayName": tagged("AT Tên").slice(0, 255), "lineIds": [uuid()], "unitCode": "AT" }, ...o }),
  "POST /api/customer-quotations/{id}/reject": (o: Record<string, unknown> = {}) => ({ ...{ "reason": tagged("Lý do kiểm thử tự động").slice(0, 500) }, ...o }),
  "POST /api/customer-quotations/{id}/deactivate": (o: Record<string, unknown> = {}) => ({ ...{ "reason": tagged("Lý do kiểm thử tự động").slice(0, 1000) }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "PUT /api/customer-quotations/{id}/settings": [{"name": "currency", "required": true, "type": "string", "enum": ["VND", "USD", "CNY"]}, {"name": "fxRate", "required": false, "type": "number", "minimum": 0}, {"name": "vatBand", "required": true, "type": "string", "enum": ["VAT_10", "VAT_8", "VAT_5", "VAT_0", "KCT", "KKKNT"]}],
  "PUT /api/customer-quotations/{id}/prices": [{"name": "lines", "required": true, "type": "array", "minItems": 1}, {"name": "groups", "required": false, "type": "array"}],
  "POST /api/customer-quotations/{id}/merges": [{"name": "displayName", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "unitCode", "required": true, "type": "string", "minLength": 1}, {"name": "lineIds", "required": true, "type": "array", "minItems": 2}],
  "POST /api/customer-quotations/{id}/reject": [{"name": "reason", "required": true, "type": "string", "maxLength": 500, "minLength": 0}],
  "POST /api/customer-quotations/{id}/deactivate": [{"name": "reason", "required": true, "type": "string", "maxLength": 1000, "minLength": 0}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
/** Tạo BGKH (Chờ xác nhận) từ YCBG đã có BGNB phát hành. */
export async function createCustomerQuotation(run: TestRun, quotationRequestId: string, role: RoleKey = 'k1'): Promise<any> {
  return must(await run.http.call('POST /api/quotation-requests/{id}/customer-quotation', { token: run.token(role), params: { id: quotationRequestId } }), 'tạo BGKH');
}

export async function getCustomerQuotation(run: TestRun, id: string, role: RoleKey = 'k1'): Promise<any> {
  return must(await run.http.call('GET /api/customer-quotations/{id}', { token: run.token(role), params: { id } }), 'đọc BGKH');
}

/** Đặt tiền tệ, tỷ giá và VAT (vd VAT_8) của BGKH. */
export async function setQuotationSettings(run: TestRun, cq: any, o: Record<string, unknown>, role: RoleKey = 'k1'): Promise<any> {
  const body = { currency: cq.currency ?? 'VND', fxRate: cq.fxRate ?? undefined, vatBand: cq.vatBand ?? 'VAT_8', ...o };
  return must(await run.http.call('PUT /api/customer-quotations/{id}/settings', { token: run.token(role), params: { id: cq.id }, json: body }), 'cập nhật thiết lập BGKH');
}

/** Đổi giá chốt các dòng theo tên đầu mục: { "Phí khai báo": 1150000 }. */
export async function setQuotationPrices(run: TestRun, cq: any, byItemName: Record<string, number>, role: RoleKey = 'k1'): Promise<any> {
  const lines = (cq.lines ?? [])
    .map((l: any) => {
      const hit = Object.entries(byItemName).find(([n]) => String(l.revenueItemName ?? '').includes(n));
      return { lineId: l.id, sellPrice: hit ? hit[1] : l.sellPrice };
    })
    .filter((l: any) => l.sellPrice !== null && l.sellPrice !== undefined);
  return must(await run.http.call('PUT /api/customer-quotations/{id}/prices', { token: run.token(role), params: { id: cq.id }, json: { lines } }), 'điều chỉnh giá chốt BGKH');
}

export async function confirmQuotation(run: TestRun, id: string, role: RoleKey = 'k1'): Promise<any> {
  return must(await run.http.call('POST /api/customer-quotations/{id}/confirm', { token: run.token(role), params: { id } }), 'khách đồng ý BGKH');
}

export async function makeDefault(run: TestRun, id: string, role: RoleKey = 'k1'): Promise<any> {
  return must(await run.http.call('POST /api/customer-quotations/{id}/default', { token: run.token(role), params: { id } }), 'đặt BGKH mặc định');
}

/** Dòng của BGKH theo tên đầu mục. */
export function lineByName(cq: any, name: string): any {
  return (cq.lines ?? []).find((l: any) => String(l.revenueItemName ?? '').includes(name));
}
