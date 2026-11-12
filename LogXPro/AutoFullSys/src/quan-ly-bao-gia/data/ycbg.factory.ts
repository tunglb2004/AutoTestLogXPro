import { FilePart, jsonPart, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, P0Refs, TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import { SERVICE_KEYS, ServiceKey } from '../../core/data/p0-price-set';
import { env } from '../../core/env';
/**
 * Dữ liệu mẫu cho mục "Yêu cầu báo giá (YCBG/RFQ)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/quotation-requests": (o: Record<string, unknown> = {}) => ({ ...{ "customerId": uuid() }, ...o }),
  "PUT /api/quotation-requests/{id}": (o: Record<string, unknown> = {}) => ({ ...{ "customerId": uuid() }, ...o }),
  "POST /api/quotation-requests/{id}/cancel": (o: Record<string, unknown> = {}) => ({ ...{ "reason": tagged("Lý do kiểm thử tự động").slice(0, 500) }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {
  "POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents": (o: Record<string, string | FilePart | FilePart[] | undefined> = {}) => ({ "file": samplePdf("chung-tu-ycbg.pdf"), ...o }),
};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/quotation-requests": [{"name": "customerId", "required": true, "type": "string", "format": "uuid"}, {"name": "sourceQuotationId", "required": false, "type": "string", "format": "uuid"}, {"name": "contractRef", "required": false, "type": "string", "maxLength": 100, "minLength": 0}, {"name": "quoteDueAt", "required": false, "type": "string", "format": "date-time"}, {"name": "currency", "required": false, "type": "string", "enum": ["VND", "USD", "CNY"]}, {"name": "generalNote", "required": false, "type": "string", "maxLength": 1000, "minLength": 0}, {"name": "borderGateCodes", "required": false, "type": "array"}, {"name": "transportMode", "required": false, "type": "string", "enum": ["ROAD", "SEA", "AIR", "RAIL"]}, {"name": "monthlyVolume", "required": false, "type": "number", "minimum": 0.001}, {"name": "volumeUnitCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "serviceInfo", "required": false, "type": "object"}, {"name": "services", "required": false, "type": "array"}, {"name": "transportLegs", "required": false, "type": "array"}],
  "PUT /api/quotation-requests/{id}": [{"name": "customerId", "required": true, "type": "string", "format": "uuid"}, {"name": "sourceQuotationId", "required": false, "type": "string", "format": "uuid"}, {"name": "contractRef", "required": false, "type": "string", "maxLength": 100, "minLength": 0}, {"name": "quoteDueAt", "required": false, "type": "string", "format": "date-time"}, {"name": "currency", "required": false, "type": "string", "enum": ["VND", "USD", "CNY"]}, {"name": "generalNote", "required": false, "type": "string", "maxLength": 1000, "minLength": 0}, {"name": "borderGateCodes", "required": false, "type": "array"}, {"name": "transportMode", "required": false, "type": "string", "enum": ["ROAD", "SEA", "AIR", "RAIL"]}, {"name": "monthlyVolume", "required": false, "type": "number", "minimum": 0.001}, {"name": "volumeUnitCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "serviceInfo", "required": false, "type": "object"}, {"name": "services", "required": false, "type": "array"}, {"name": "transportLegs", "required": false, "type": "array"}],
  "POST /api/quotation-requests/{id}/cancel": [{"name": "reason", "required": true, "type": "string", "maxLength": 500, "minLength": 0}],
  "POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents": [{"name": "file", "required": true, "type": "string", "format": "binary"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
/** Thuộc tính dịch vụ theo tuyến P0 (KHQ/HQGS: Chi cục HQ CK Hữu Nghị; VT: Hữu Nghị → Hà Nội; ST: Bãi Hữu Nghị, Cẩu; KB: Kho Hữu Nghị, Kho thường). */
export function serviceEntry(refs: P0Refs, key: ServiceKey, plannedDate?: string): Record<string, unknown> {
  const base: Record<string, unknown> = { serviceTypeCode: refs.services[key], plannedDate };
  // Hệ thống thật (YCBG tạo từ web) dùng mảng `customsOfficeCodes`, `transloadPointCodes` và `cargoLoadTypeCode`, `storageUnitCode`;
  // Swagger còn khai dạng đơn (`customsOfficeCode`…) nên gửi cả hai (thiếu mảng thì 409 "Địa điểm làm TTHQ là thông tin bắt buộc").
  switch (key) {
    case 'KHQ':
      return { ...base, customsOfficeCode: refs.customsOffice, customsOfficeCodes: [refs.customsOffice], declarationCount: 1 };
    case 'HQGS':
      return { ...base, supervisionOfficeCode: refs.customsOffice, customsOfficeCodes: [refs.customsOffice] };
    case 'VT':
      return { ...base, routes: [{ pickup: { ...refs.origin }, delivery: { ...refs.destination } }] };
    case 'ST':
      return { ...base, transloadPointCode: refs.transloadPoint, transloadPointCodes: [refs.transloadPoint], transloadTypeCode: refs.transloadType, transloadMethodCode: refs.transloadMethod, cargoLoadTypeCode: refs.cargoLoadType };
    case 'KB':
      return { ...base, warehouseCode: refs.warehouse, warehouseTypeId: refs.warehouseTypeId, warehouseTypeIds: [refs.warehouseTypeId], storageUnitCode: refs.units.storage, storageQuantity: 1, storageDays: 1 };
  }
}

/** 1 chặng vận chuyển của YCBG theo hai địa chỉ thuộc đúng vùng trong danh mục Địa điểm vận tải. */
export function legOf(refs: P0Refs): Record<string, unknown> {
  const side = (p: Record<string, unknown>, prefix: 'origin' | 'destination') =>
    p.pointType === 'BORDER_GATE'
      ? { [`${prefix}Kind`]: 'BORDER_GATE', [`${prefix}GateCode`]: p.borderGateCode }
      : { [`${prefix}Kind`]: 'ADDRESS', [`${prefix}Address`]: { countryCode: p.countryCode, provinceCode: p.provinceCode, wardCode: p.wardCode, ...refs.addressNames[prefix] } };
  return { ...side(refs.origin, 'origin'), ...side(refs.destination, 'destination') };
}

/** Body YCBG đủ 5 dịch vụ (RFQ-010): KH_A, VND, ROAD, cửa khẩu Hữu Nghị, sản lượng 10/tháng. */
export async function rfqBody(run: TestRun, o: Record<string, unknown> = {}, services: ServiceKey[] = SERVICE_KEYS): Promise<Record<string, unknown>> {
  const refs = await run.p0Refs();
  const body: Record<string, unknown> = {
    customerId: env.ref('CUSTOMER_A_ID'),
    currency: 'VND',
    transportMode: 'ROAD',
    borderGateCodes: [refs.borderGate],
    monthlyVolume: 10,
    // Hệ thống bắt buộc sản lượng dự kiến đi cùng đơn vị tính (409 nếu thiếu): 10 Chuyến/tháng của tuyến P0.
    volumeUnitCode: refs.units.freight,
    generalNote: `YCBG kiểm thử tự động ${run.id}`,
    serviceInfo: { tradeTypes: [refs.tradeType], cargoGroupCodes: [refs.cargoGroup], cargoNatureCodes: [refs.cargoNature], packagingCodes: [refs.packaging], vehicleTypeCodes: [refs.vehicleType] },
    // The quotation request stores warehouse type codes in warehouseTypes.
    services: services.map((key) => {
      const service = serviceEntry(refs, key);
      return key === 'KB' ? { ...service, warehouseTypes: [refs.warehouseTypeCode] } : service;
    }),
    // Phạm vi tuyến Vận tải của YCBG nằm ở `transportLegs` (YCBG tạo từ web lưu ở đây); thiếu thì bảng giá Vận tải của BGNB bị 409
    // "Điểm đi … không nằm trong phạm vi Yêu cầu báo giá đã chọn".
    ...(services.includes('VT') ? { transportLegs: [legOf(refs)] } : {}),
    ...o,
  };
  // "Hợp đồng áp dụng" bắt buộc (409 nếu thiếu): web gửi mã hợp đồng hiện hành của khách (vd CTC2611-003) ở `contractRef`.
  // Case tự truyền `contractRef` (kể cả rỗng để kiểm lỗi) thì giữ nguyên.
  if (!('contractRef' in o)) {
    const defaultCustomerId = env.ref('CUSTOMER_A_ID');
    let response = await run.http.call('GET /api/customers/{id}', { token: run.token('k1'), params: { id: String(body.customerId) } });
    // Với case validation customerId không tồn tại, helper không được dừng trước
    // API đang được kiểm tra. Dùng hợp đồng của khách nền để body còn lại hợp lệ;
    // endpoint tạo YCBG sẽ tự trả lỗi đúng cho customerId của case.
    if (!response.ok() && String(body.customerId) !== defaultCustomerId) {
      response = await run.http.call('GET /api/customers/{id}', { token: run.token('k1'), params: { id: defaultCustomerId } });
    }
    const c = await must(response, 'đọc hợp đồng hiện hành của khách');
    if (c?.currentContract?.code) body.contractRef = c.currentContract.code;
  }
  return body;
}

export async function createRfq(run: TestRun, opts: { submit?: boolean; body?: Record<string, unknown>; role?: RoleKey; services?: ServiceKey[] } = {}): Promise<any> {
  const body = opts.body ?? (await rfqBody(run, {}, opts.services));
  return must(await run.http.call('POST /api/quotation-requests', { token: run.token(opts.role ?? 'k1'), query: { submit: opts.submit ?? false }, json: body }), 'tạo YCBG');
}

export async function getRfq(run: TestRun, id: string, role: RoleKey = 'k1'): Promise<any> {
  return must(await run.http.call('GET /api/quotation-requests/{id}', { token: run.token(role), params: { id } }), 'đọc YCBG');
}

/** YCBG đã gửi và Định giá (CC) tiếp nhận: PRICING_IN_PROGRESS. */
export async function rfqInPricing(run: TestRun, pricer: RoleKey = 'cc', services?: ServiceKey[]): Promise<any> {
  const r = await createRfq(run, { submit: true, services });
  await must(await run.http.call('POST /api/quotation-requests/{id}/accept', { token: run.token(pricer), params: { id: r.id } }), 'Định giá tiếp nhận YCBG');
  return getRfq(run, r.id);
}
