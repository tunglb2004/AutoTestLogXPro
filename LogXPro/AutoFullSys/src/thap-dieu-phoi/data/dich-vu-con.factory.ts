import { FilePart, jsonPart, items, must, data } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, P0Refs, TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import { ServiceKey } from '../../core/data/p0-price-set';
/**
 * Dữ liệu mẫu cho mục "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "PUT /api/k3/service-orders/{id}/services/{type}/coordination": (o: Record<string, unknown> = {}) => ({ ...{ "assignments": [{ "contractorId": uuid(), "priceConfigurationItemId": uuid() }] }, ...o }),
  "POST /api/k3/service-orders/{id}/services/{type}/costs": (o: Record<string, unknown> = {}) => ({ ...{ "amount": randMoney(), "contractorId": uuid(), "currency": "AT", "kind": "BASE", "unitCode": "AT" }, ...o }),
  "PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}": (o: Record<string, unknown> = {}) => ({ ...{ "currency": "AT", "lines": [] }, ...o }),
  "PUT /api/k3/service-orders/{id}/services/{type}/declaration": (o: Record<string, unknown> = {}) => ({ ...{  }, ...o }),
  "PUT /api/k3/service-orders/{id}/services/{type}/actuals": (o: Record<string, unknown> = {}) => ({ ...{  }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {
  "POST /api/k3/service-orders/{id}/services/{type}/documents": (o: Record<string, string | FilePart | FilePart[] | undefined> = {}) => ({ "file": samplePdf("chung-tu-dich-vu-con.pdf"), "files": samplePdf("chung-tu-dich-vu-con.pdf"), ...o }),
};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "PUT /api/k3/service-orders/{id}/services/{type}/coordination": [{"name": "assignments", "required": true, "type": "array", "minItems": 1}, {"name": "fxRates", "required": false, "type": "object"}],
  "POST /api/k3/service-orders/{id}/services/{type}/costs": [{"name": "contractorId", "required": true, "type": "string", "format": "uuid"}, {"name": "kind", "required": true, "type": "string", "enum": ["BASE", "SURCHARGE", "VARIANCE", "EXTRA_APPROVED"]}, {"name": "purchasePriceItemId", "required": false, "type": "string", "format": "uuid"}, {"name": "priceConfigurationItemId", "required": false, "type": "string", "format": "uuid"}, {"name": "unitCode", "required": true, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "quantity", "required": false, "type": "number"}, {"name": "amount", "required": true, "type": "number"}, {"name": "currency", "required": true, "type": "string", "maxLength": 3, "minLength": 3}, {"name": "fxRate", "required": false, "type": "number"}, {"name": "vatBand", "required": false, "type": "string", "enum": ["VAT_10", "VAT_8", "VAT_5", "VAT_0", "KCT", "KKKNT"]}, {"name": "note", "required": false, "type": "string", "maxLength": 500, "minLength": 0}],
  "PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}": [{"name": "currency", "required": true, "type": "string", "maxLength": 3, "minLength": 3}, {"name": "fxRate", "required": false, "type": "number"}, {"name": "lines", "required": true, "type": "array"}, {"name": "removedLineIds", "required": false, "type": "array"}],
  "PUT /api/k3/service-orders/{id}/services/{type}/declaration": [{"name": "customsOfficeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "supervisionOfficeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "warehouseCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "warehouseTypeId", "required": false, "type": "string", "format": "uuid"}],
  "PUT /api/k3/service-orders/{id}/services/{type}/actuals": [{"name": "declarationNo", "required": false, "type": "string", "maxLength": 20, "minLength": 0}, {"name": "clearanceLane", "required": false, "type": "string", "enum": ["GREEN", "YELLOW", "RED"]}, {"name": "clearedAt", "required": false, "type": "string", "format": "date-time"}, {"name": "declarationCount", "required": false, "type": "integer", "format": "int32"}, {"name": "actualCustomsOfficeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "handoverVehicles", "required": false, "type": "array", "minItems": 0}, {"name": "supervisionOfficeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "inspectionResult", "required": false, "type": "string", "maxLength": 100, "minLength": 0}, {"name": "yardEnteredAt", "required": false, "type": "string", "format": "date-time"}, {"name": "yardLeftAt", "required": false, "type": "string", "format": "date-time"}, {"name": "yardSupervisionRequired", "required": false, "type": "boolean"}, {"name": "receiverVehicles", "required": false, "type": "array", "minItems": 0}, {"name": "routes", "required": false, "type": "array", "minItems": 0}, {"name": "transloadPointCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "transloadTypeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "transloadMethodCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "packaging", "required": false, "type": "string", "maxLength": 50, "minLength": 0}, {"name": "quantity", "required": false, "type": "number"}, {"name": "goodsCondition", "required": false, "type": "string", "enum": ["INTACT", "DAMAGED"]}, {"name": "pairs", "required": false, "type": "array", "minItems": 0}, {"name": "warehouseCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "warehouseTypeId", "required": false, "type": "string", "format": "uuid"}, {"name": "remainingWeight", "required": false, "type": "number"}, {"name": "storedInAt", "required": false, "type": "string", "format": "date-time"}, {"name": "storedOutAt", "required": false, "type": "string", "format": "date-time"}, {"name": "vasRepacking", "required": false, "type": "boolean"}, {"name": "vasShrinkWrap", "required": false, "type": "boolean"}, {"name": "vasLabeling", "required": false, "type": "boolean"}, {"name": "vasDetailedCount", "required": false, "type": "boolean"}, {"name": "note", "required": false, "type": "string", "maxLength": 1000, "minLength": 0}],
  "POST /api/k3/service-orders/{id}/services/{type}/documents": [{"name": "file", "required": false, "type": "string", "format": "binary"}, {"name": "files", "required": false, "type": "array"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
export type Svc = { id: string; type: string };

/** Điều phối dịch vụ: gán đầu mục → nhà thầu (đơn vị tính theo dòng giá), kèm tỷ giá nếu nhà thầu báo ngoại tệ. */
export async function coordinate(run: TestRun, s: Svc, assignments: { priceConfigurationItemId: string; contractorId: string; unitCode?: string; routeIndex?: number }[], fxRates?: Record<string, number>, role: RoleKey = 'dp') {
  return must(
    await run.http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: run.token(role), params: { id: s.id, type: s.type }, json: { assignments, fxRates } }),
    `điều phối dịch vụ ${s.type}`,
  );
}

export async function startService(run: TestRun, s: Svc, role: RoleKey = 'dp') {
  return must(await run.http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: run.token(role), params: { id: s.id, type: s.type } }), `bắt đầu dịch vụ ${s.type}`);
}

export async function costs(run: TestRun, s: Svc, role: RoleKey = 'dp'): Promise<any> {
  return must(await run.http.call('GET /api/k3/service-orders/{id}/services/{type}/costs', { token: run.token(role), params: { id: s.id, type: s.type } }), `chi phí dịch vụ ${s.type}`);
}

/** Tất cả dòng chi phí (gộp theo nhà thầu) của dịch vụ. */
export async function costLines(run: TestRun, s: Svc, role: RoleKey = 'dp'): Promise<any[]> {
  const c = await costs(run, s, role);
  return (c.contractors ?? []).flatMap((x: any) => (x.lines ?? []).map((l: any) => ({ ...l, contractorId: x.contractorId, currency: x.currency })));
}

/** Dòng giá của nhà thầu dùng để thêm phụ phí (cost-items). */
export async function costItem(run: TestRun, s: Svc, contractorId: string, priceConfigurationItemId: string, role: RoleKey = 'dp'): Promise<any> {
  const list = items(await must(await run.http.call('GET /api/k3/service-orders/{id}/services/{type}/cost-items', { token: run.token(role), params: { id: s.id, type: s.type }, query: { contractorId, perPage: 200 } }), 'dòng giá phụ phí của nhà thầu'));
  const hit = list.find((x: any) => x.priceConfigurationItemId === priceConfigurationItemId);
  if (!hit) throw new Error(`Nhà thầu ${contractorId} không có dòng giá cho đầu mục ${priceConfigurationItemId}`);
  return hit;
}

/** Thêm dòng chi phí; trả id dòng mới. */
export async function addCost(run: TestRun, s: Svc, body: Record<string, unknown>, role: RoleKey = 'dp'): Promise<string> {
  const d = await must(await run.http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: run.token(role), params: { id: s.id, type: s.type }, json: body }), `thêm chi phí ${body.kind} cho ${s.type}`);
  return d?.id;
}

/** Thông tin thực tế đủ trường bắt buộc theo dịch vụ (thời điểm trong quá khứ, biển số xe giao/nhận cố định của P0). */
export function actualsBody(refs: P0Refs, key: ServiceKey): Record<string, unknown> {
  const now = Date.now();
  const iso = (h: number) => new Date(now - h * 3_600_000).toISOString();
  // Đủ trường xe theo danh sách bắt buộc khi hoàn thành (K3S-162, K3S-164): biển số, seal, số cửa, container, mooc, tài xế, SĐT, CCCD 12 số, số thông hành.
  const vehicle = (plateNo: string, seal: string) => ({
    plateNo, vehicleTypeCode: refs.vehicleType, trailerNo: '15R-01234', containerNo: 'TCLU1234567', sealNo: seal, gateNo: 'C01',
    driverName: 'Nguyễn Văn Hùng', driverPhone: '0912345678', driverIdNo: '001203004567', transitPermitNo: 'TH-123456',
  });
  switch (key) {
    case 'KHQ':
      return { declarationNo: `10${Math.floor(Math.random() * 1e9)}`.slice(0, 12), clearanceLane: 'GREEN', clearedAt: iso(5), declarationCount: 1, actualCustomsOfficeCode: refs.customsOffice, handoverVehicles: [vehicle('15C-111.11', 'SEAL-GIAO-01')] };
    case 'HQGS':
      return { supervisionOfficeCode: refs.customsOffice, inspectionResult: 'Đạt', yardEnteredAt: iso(6), yardLeftAt: iso(4), yardSupervisionRequired: false };
    case 'VT':
      return { receiverVehicles: [vehicle('29C-123.45', 'SEAL-NHAN-01')], routes: [{ routeIndex: 0, pickedUpAt: iso(3), deliveredAt: iso(1) }] };
    case 'ST':
      return { transloadPointCode: refs.transloadPoint, transloadTypeCode: refs.transloadType, transloadMethodCode: refs.transloadMethod, packaging: 'Pallet', quantity: 10, goodsCondition: 'INTACT', pairs: [{ pairIndex: 0, packageCount: '10', sealNo: 'SEAL-001', actualWeight: 12000, newSealNo: 'SEAL-002' }] };
    case 'KB':
      return { warehouseCode: refs.warehouse, warehouseTypeId: refs.warehouseTypeId, quantity: 10, remainingWeight: 0, storedInAt: iso(8), storedOutAt: iso(2) };
  }
}

export async function saveActuals(run: TestRun, s: Svc, body: Record<string, unknown>, role: RoleKey = 'dp') {
  return must(await run.http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: run.token(role), params: { id: s.id, type: s.type }, json: body }), `lưu thông tin thực tế ${s.type}`);
}

export async function uploadActualDoc(run: TestRun, s: Svc, role: RoleKey = 'dp') {
  return must(
    await run.http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: run.token(role), params: { id: s.id, type: s.type }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-thuc-te.pdf') } }),
    `tải chứng từ thực tế ${s.type}`,
  );
}

/** Hoàn thành dịch vụ; lỗi thì kèm danh sách thiếu của completion-check để biết thiếu gì. */
export async function completeService(run: TestRun, s: Svc, role: RoleKey = 'dp') {
  const res = await run.http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: run.token(role), params: { id: s.id, type: s.type } });
  if (!res.ok()) {
    const chk = await data(await run.http.call('GET /api/k3/service-orders/{id}/services/{type}/completion-check', { token: run.token(role), params: { id: s.id, type: s.type } }));
    throw new Error(`Chuẩn bị dữ liệu thất bại (hoàn thành ${s.type}): HTTP ${res.status()} ${(await res.text()).slice(0, 300)}; completion-check: ${JSON.stringify(chk)}`);
  }
}
