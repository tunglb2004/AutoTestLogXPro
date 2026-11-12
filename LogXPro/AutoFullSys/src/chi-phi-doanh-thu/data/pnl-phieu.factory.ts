import { FilePart, jsonPart, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import ExcelJS from 'exceljs';
/**
 * Dữ liệu mẫu cho mục "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "PUT /api/service-orders/{id}/pnl/fx-rate": (o: Record<string, unknown> = {}) => ({ ...{ "source": "VCB" }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "PUT /api/service-orders/{id}/pnl/fx-rate": [{"name": "source", "required": true, "type": "string", "enum": ["VCB", "MANUAL"]}, {"name": "usdRate", "required": false, "type": "number", "minimum": 0}, {"name": "cnyRate", "required": false, "type": "number", "minimum": 0}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
export async function pnl(run: TestRun, id: string, role: RoleKey = 'cc'): Promise<any> {
  return must(await run.http.call('GET /api/service-orders/{id}/pnl', { token: run.token(role), params: { id } }), 'đọc P&L phiếu');
}

/** Áp tỷ giá phiếu (MANUAL usdRate) trên tab Chi phí - Doanh thu. */
export async function setOrderFx(run: TestRun, id: string, usdRate: number, role: RoleKey = 'cc', cnyRate = 3_600): Promise<any> {
  return must(await run.http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: run.token(role), params: { id }, json: { source: 'MANUAL', usdRate, cnyRate } }), 'áp tỷ giá phiếu');
}

/** K5 xác nhận doanh thu (PERFORMED → COMPLETED). */
export async function confirmRevenue(run: TestRun, id: string, role: RoleKey = 'cc'): Promise<any> {
  return must(await run.http.call('POST /api/service-orders/{id}/revenue-confirmation', { token: run.token(role), params: { id } }), 'xác nhận doanh thu');
}

/** Đọc file xlsx trả về (tên sheet + các dòng giá trị của sheet chỉ định hoặc sheet đầu); ô công thức lấy kết quả. */
export async function readXlsx(buf: Buffer, sheet?: string): Promise<{ names: string[]; rows: unknown[][] }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as any);
  const ws = sheet ? wb.getWorksheet(sheet) : wb.worksheets[0];
  const rows: unknown[][] = [];
  ws?.eachRow((r) => rows.push(((r.values as unknown[]) ?? []).slice(1).map((c: any) => (c && typeof c === 'object' && 'result' in c ? c.result : c && typeof c === 'object' && 'richText' in c ? c.richText.map((t: any) => t.text).join('') : c))));
  return { names: wb.worksheets.map((w) => w.name), rows };
}

/** Mọi số trong file (để đối chiếu tổng doanh thu/chi phí với màn hình). */
export function numbersIn(rows: unknown[][]): number[] {
  return rows.flat().map((c) => (typeof c === 'number' ? c : Number(String(c ?? '').replace(/[.,\s](?=\d{3}\b)/g, '').replace(',', '.')))).filter((n) => Number.isFinite(n));
}

/** Kiểm phản hồi là file xlsx (nhị phân, không bọc JSON). */
export function isXlsx(buf: Buffer, contentType = ''): boolean {
  return buf.length > 4 && buf.subarray(0, 2).toString('latin1') === 'PK' && !/json/i.test(contentType);
}
