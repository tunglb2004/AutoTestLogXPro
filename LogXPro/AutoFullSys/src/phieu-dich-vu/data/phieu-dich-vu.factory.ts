import { FilePart, jsonPart, data, items, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, TestRun, shared } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../core/data/p0-price-set';
import { env } from '../../core/env';
import { CreatedItems, p0Items } from '../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { isActiveSheet, p0SheetA, p0SheetB } from '../../gia-mua-dau-vao/data/bang-gia-mua.factory';
import { sbpOf, setBenchmark } from '../../gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { setSelling, sspOf } from '../../gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { rfqInPricing, serviceEntry } from '../../quan-ly-bao-gia/data/ycbg.factory';
import { SspMap, createInternalQuote, issueInternalQuote } from '../../quan-ly-bao-gia/data/bgnb.factory';
import { confirmQuotation, createCustomerQuotation, makeDefault, setQuotationPrices, setQuotationSettings, getCustomerQuotation } from '../../quan-ly-bao-gia/data/bgkh.factory';
import { acceptOrder, confirmLegs } from '../../thap-dieu-phoi/data/phieu-cc.factory';
import { Svc, actualsBody, addCost, coordinate, completeService, costItem, costLines, saveActuals, startService, uploadActualDoc } from '../../thap-dieu-phoi/data/dich-vu-con.factory';
import { confirmRevenue, setOrderFx } from '../../chi-phi-doanh-thu/data/pnl-phieu.factory';
/**
 * Dữ liệu mẫu cho mục "Phiếu dịch vụ (Khối 1)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/service-orders": (o: Record<string, unknown> = {}) => ({ ...{ "customerId": uuid() }, ...o }),
  "PUT /api/service-orders/{id}": (o: Record<string, unknown> = {}) => ({ ...{ "customerId": uuid() }, ...o }),
  "POST /api/service-orders/{id}/cancel": (o: Record<string, unknown> = {}) => ({ ...{ "reason": tagged("Lý do kiểm thử tự động").slice(0, 500) }, ...o }),
  "PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}": (o: Record<string, unknown> = {}) => ({ ...{  }, ...o }),
  "PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines": (o: Record<string, unknown> = {}) => ({ ...{ "lines": [{ "costLineId": uuid(), "quantity": randInt(1, 10), "unitCode": "AT", "unitPrice": randMoney() }] }, ...o }),
  "POST /api/service-orders/{id}/scope-requests/{requestId}/respond": (o: Record<string, unknown> = {}) => ({ ...{ "accept": false }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {
  "POST /api/service-orders/{id}/services/{serviceTypeCode}/documents": (o: Record<string, string | FilePart | FilePart[] | undefined> = {}) => ({ "file": samplePdf("chung-tu-phieu-dich-vu.pdf"), ...o }),
  "POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents": (o: Record<string, string | FilePart | FilePart[] | undefined> = {}) => ({ "file": samplePdf("chung-tu-phieu-dich-vu.pdf"), ...o }),
};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/service-orders": [{"name": "customerId", "required": true, "type": "string", "format": "uuid"}, {"name": "customerContractId", "required": false, "type": "string", "format": "uuid"}, {"name": "customerQuotationId", "required": false, "type": "string", "format": "uuid"}, {"name": "customerRef", "required": false, "type": "string", "maxLength": 50, "minLength": 0}, {"name": "tradeTypeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "borderGateCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "transportModeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "cargoLoadTypeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "serviceDate", "required": false, "type": "string", "format": "date"}, {"name": "generalNote", "required": false, "type": "string", "maxLength": 500, "minLength": 0}, {"name": "cargoName", "required": false, "type": "string", "maxLength": 150, "minLength": 0}, {"name": "cargoGroupCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "cargoNatureCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "volume", "required": false, "type": "number", "minimum": 0}, {"name": "weight", "required": false, "type": "number", "minimum": 0}, {"name": "packagingCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "places", "required": false, "type": "object"}, {"name": "services", "required": false, "type": "array"}, {"name": "vehicles", "required": false, "type": "array"}],
  "PUT /api/service-orders/{id}": [{"name": "customerId", "required": true, "type": "string", "format": "uuid"}, {"name": "customerContractId", "required": false, "type": "string", "format": "uuid"}, {"name": "customerQuotationId", "required": false, "type": "string", "format": "uuid"}, {"name": "customerRef", "required": false, "type": "string", "maxLength": 50, "minLength": 0}, {"name": "tradeTypeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "borderGateCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "transportModeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "cargoLoadTypeCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "serviceDate", "required": false, "type": "string", "format": "date"}, {"name": "generalNote", "required": false, "type": "string", "maxLength": 500, "minLength": 0}, {"name": "cargoName", "required": false, "type": "string", "maxLength": 150, "minLength": 0}, {"name": "cargoGroupCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "cargoNatureCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "volume", "required": false, "type": "number", "minimum": 0}, {"name": "weight", "required": false, "type": "number", "minimum": 0}, {"name": "packagingCode", "required": false, "type": "string", "maxLength": 32, "minLength": 0}, {"name": "places", "required": false, "type": "object"}, {"name": "services", "required": false, "type": "array"}, {"name": "vehicles", "required": false, "type": "array"}],
  "POST /api/service-orders/{id}/cancel": [{"name": "reason", "required": true, "type": "string", "maxLength": 500, "minLength": 0}],
  "PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}": [{"name": "source", "required": false, "type": "string", "enum": ["VCB", "MANUAL", "QUOTE"]}, {"name": "fxRate", "required": false, "type": "number", "minimum": 0}],
  "PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines": [{"name": "lines", "required": true, "type": "array", "minItems": 1}],
  "POST /api/service-orders/{id}/services/{serviceTypeCode}/documents": [{"name": "file", "required": true, "type": "string", "format": "binary"}],
  "POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents": [{"name": "file", "required": true, "type": "string", "format": "binary"}],
  "POST /api/service-orders/{id}/scope-requests/{requestId}/respond": [{"name": "accept", "required": true, "type": "boolean"}, {"name": "note", "required": false, "type": "string", "maxLength": 500, "minLength": 0}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
/** Dữ liệu nền P0: đầu mục, 2 bảng giá mua đã kích hoạt, SBP/SSP có giá, YCBG → BGNB phát hành → BGKH ACTIVE mặc định của KH_A. */
export type P0Base = {
  items: CreatedItems;
  sheetA: string;
  sheetB: string;
  sbp: Partial<Record<P0ItemKey, string>>;
  ssp: Partial<Record<P0ItemKey, string>>;
  rfqId: string;
  internalQuoteId: string;
  rcId: string;
  customerId: string;
};

/**
 * Dựng bộ dữ liệu P0 với hậu tố đầu mục `suffix`. `p0Base()` dùng hậu tố "P0" và lưu dùng chung; luồng đổi giá/tắt đầu mục
 * gọi trực tiếp với hậu tố riêng (`{runId}-{case}`) để không làm sai tiền điều kiện của case khác.
 */
export async function buildP0(run: TestRun, suffix: string, opts: { quote?: boolean; setDefault?: boolean } = {}): Promise<P0Base> {
  const items = await p0Items(run, suffix);
  // Dòng giá vào bảng Đang hoạt động của NT_A/NT_B (không thay bảng, giữ bộ P0 dùng chung).
  const a = await p0SheetA(run, items, `AT Bảng giá NT_A ${run.id}`);
  const b = await p0SheetB(run, items, `AT Bảng giá NT_B ${run.id}`);
  const sbp: P0Base['sbp'] = {};
  const ssp: P0Base['ssp'] = {};
  const sspMap: SspMap = {};
  for (const it of P0_ITEMS.filter((i) => i.sbp !== null)) {
    const line = await sbpOf(run, items[it.key].id);
    await setBenchmark(run, line.id, it.sbp!);
    sbp[it.key] = line.id;
    const sell = await sspOf(run, items[it.key].id);
    await setSelling(run, sell.id, it.ssp!);
    ssp[it.key] = sell.id;
    sspMap[it.key] = { itemId: items[it.key].id, sspId: sell.id, price: it.ssp! };
  }
  const base: P0Base = { items, sheetA: a.id, sheetB: b.id, sbp, ssp, rfqId: '', internalQuoteId: '', rcId: '', customerId: env.ref('CUSTOMER_A_ID') };
  if (opts.quote === false) return base;
  const rfq = await rfqInPricing(run, 'cc');
  const iq = await createInternalQuote(run, rfq.id, sspMap, 'cc');
  await issueInternalQuote(run, iq.id, 'cc');
  let cq = await createCustomerQuotation(run, rfq.id, 'k1');
  cq = await setQuotationSettings(run, cq, { vatBand: P0.vatBand });
  cq = await setQuotationPrices(run, cq, { [items.customsFee.name]: P0.customsFeeAgreed });
  await confirmQuotation(run, cq.id);
  cq = await getCustomerQuotation(run, cq.id);
  // Chỉ bộ dùng chung đặt RC mặc định; bộ riêng của case không giành mặc định để bộ P0 dùng chung không bị dựng lại.
  if (opts.setDefault && !cq.isDefault) await makeDefault(run, cq.id);
  return { ...base, rfqId: rfq.id, internalQuoteId: iq.id, rcId: cq.id };
}

/** Bộ P0 dùng chung (dựng 1 lần cho môi trường, tự dựng lại khi RC không còn ACTIVE mặc định). */
export async function p0Base(run: TestRun): Promise<P0Base> {
  return shared('p0-base', () => buildP0(run, 'P0', { setDefault: true }), async (v) => {
    const res = await run.http.call('GET /api/customer-quotations/{id}', { token: run.token('k1'), params: { id: v.rcId } });
    if (!res.ok()) return false;
    const cq = await data(res);
    if (cq?.status !== 'ACTIVE' || cq?.isDefault !== true) return false;
    // Bảng giá NT_A/NT_B của bộ phải còn Đang hoạt động (bị ngừng thì SBP/SSP và dòng RC đã mất hiệu lực).
    for (const id of [v.sheetA, v.sheetB]) {
      const s = await run.http.call('GET /api/purchase-prices/{id}', { token: run.token('k1'), params: { id } });
      if (!s.ok() || !isActiveSheet(await data(s))) return false;
    }
    return true;
  });
}

/** Body phiếu đủ 5 dịch vụ khớp RC (ORD-018): điểm vận tải Hữu Nghị Quan → Hai Bà Trưng, Nhập kinh doanh, Linh kiện điện tử, Hàng thường, Container 40'. */
export async function orderBody(run: TestRun, base: Pick<P0Base, 'rcId' | 'customerId'>, o: Record<string, unknown> = {}, services: ServiceKey[] = SERVICE_KEYS): Promise<Record<string, unknown>> {
  const refs = await run.p0Refs();
  const serviceDate = today();
  const plannedDay = typeof o.serviceDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.serviceDate) ? o.serviceDate : serviceDate;
  const pickup = { ...refs.origin, plannedAt: plannedDay + 'T10:00:00+07:00' };
  const delivery = { ...refs.destination, plannedAt: plannedDay + 'T14:00:00+07:00' };
  let customerContractId: string | undefined;
  // Các case phủ định có thể ghi đè hoặc chủ động bỏ hợp đồng trong payload.
  if (!Object.hasOwn(o, 'customerContractId') && (!Object.hasOwn(o, 'customerId') || o.customerId === base.customerId)) {
    const customer = await must(await run.http.call('GET /api/customers/{id}', {
      token: run.token('k1'), params: { id: base.customerId },
    }), 'đọc hợp đồng hiệu lực để tạo phiếu');
    customerContractId = customer.currentContract?.id;
  }
  return {
    customerId: base.customerId,
    customerContractId,
    customerQuotationId: base.rcId || undefined,
    customerRef: `AT-${run.id}`.slice(0, 50),
    tradeTypeCode: refs.tradeType,
    borderGateCode: refs.borderGate,
    transportModeCode: refs.transportMode,
    cargoLoadTypeCode: refs.cargoLoadType,
    serviceDate,
    generalNote: `Phiếu kiểm thử tự động ${run.id}`,
    cargoName: 'Linh kiện điện tử',
    cargoGroupCode: refs.cargoGroup,
    cargoNatureCode: refs.cargoNature,
    packagingCode: refs.packaging,
    volume: 20,
    weight: 12000,
    places: { ORIGIN: pickup, DESTINATION: delivery },
    services: services.map((key) => {
      const service = serviceEntry(refs, key, serviceDate);
      return key === 'VT' ? { ...service, routes: [{ pickup, delivery }] } : service;
    }),
    // SSOT theo BR-K3-21/BR-KHQ-03/BR-VT-01: Xe giao do KHQ cập nhật, Xe nhận do VT cập nhật;
    // Sang tải chỉ ghép hai nguồn này. K1 khai đủ dữ liệu chung ban đầu để các kịch bản chạy riêng
    // vẫn có dữ liệu xe, tài xế và số thông hành trước khi điều phối viên chốt lại thực tế.
    vehicles: [
      { role: 'HANDOVER', pairIndex: 0, vehicleTypeCode: refs.vehicleType, plateNo: '15C-111.11', trailerNo: '15R-01234', containerNo: 'TCLU1234567', sealNo: 'SEAL-GIAO-01', gateNo: 'C01', driverName: 'Nguyễn Văn Hùng', driverPhone: '0912345678', driverIdNo: '001203004567', transitPermitNo: 'TH-GIAO-123456' },
      { role: 'RECEIVER', pairIndex: 0, vehicleTypeCode: refs.vehicleType, plateNo: '29C-123.45', trailerNo: '29R-01234', containerNo: 'TCLU7654321', sealNo: 'SEAL-NHAN-01', gateNo: 'C02', driverName: 'Trần Văn Nam', driverPhone: '0987654321', driverIdNo: '001203004568', transitPermitNo: 'TH-NHAN-123456' },
    ],
    ...o,
  };
}

export async function createOrder(run: TestRun, base: Pick<P0Base, 'rcId' | 'customerId'>, opts: { submit?: boolean; body?: Record<string, unknown>; role?: RoleKey; services?: ServiceKey[] } = {}): Promise<any> {
  const body = opts.body ?? (await orderBody(run, base, {}, opts.services));
  const created = await must(await run.http.call('POST /api/service-orders', { token: run.token(opts.role ?? 'k1'), query: { submit: opts.submit ?? true }, json: body }), 'tạo phiếu dịch vụ');
  run.track(`phiếu ${created.code}`, () => run.http.call('POST /api/service-orders/{id}/cancel', { token: run.token('k1'), params: { id: created.id }, json: { reason: 'Dọn dữ liệu kiểm thử tự động' } }));
  return created;
}

export async function getOrder(run: TestRun, id: string, role: RoleKey = 'k1'): Promise<any> {
  return must(await run.http.call('GET /api/service-orders/{id}', { token: run.token(role), params: { id } }), 'đọc phiếu dịch vụ');
}

export async function revenueOf(run: TestRun, id: string, role: RoleKey = 'k1'): Promise<any[]> {
  const d = await must(await run.http.call('GET /api/service-orders/{id}/revenue', { token: run.token(role), params: { id } }), 'đọc doanh thu phiếu');
  return d?.items ?? [];
}

/** Bảng doanh thu của 1 dịch vụ (theo mã dịch vụ thật). */
export function revenueTable(tables: any[], serviceCode: string): any {
  return tables.find((t) => t.serviceTypeCode === serviceCode);
}

/** Các mốc dựng phiếu P0 theo FLOW-E2E. */
export type P0Stage =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'KHQ_COORDINATED'
  /** Dịch vụ KHQ đã IN_PROGRESS; phiếu tổng cũng chuyển IN_PROGRESS. */
  | 'IN_PROGRESS'
  | 'KHQ_COSTS'
  | 'KHQ_DONE'
  | 'CHANG1_DONE'
  | 'PERFORMED'
  | 'FX_APPLIED'
  | 'COMPLETED';
const ORDER: P0Stage[] = ['DRAFT', 'SUBMITTED', 'ACCEPTED', 'KHQ_COORDINATED', 'IN_PROGRESS', 'KHQ_COSTS', 'KHQ_DONE', 'CHANG1_DONE', 'PERFORMED', 'FX_APPLIED', 'COMPLETED'];

export type P0Order = {
  id: string;
  code: string;
  base: P0Base;
  svc: Record<ServiceKey, Svc>;
  /** Id dòng chi phí đã thêm (phụ phí ngoài giờ, phát sinh KHQ đang hoạt động). */
  overtimeLineId?: string;
  shiftLineId?: string;
  varianceItemId?: string;
  varianceItemName?: string;
  varianceUnitCode?: string;
};

/**
 * Phiếu P0 mới dựng tới mốc `stage` (FLOW-E2E): tạo + gửi → CC tiếp nhận, xác nhận chặng → điều phối KHQ (NT_A) → bắt đầu dịch vụ KHQ
 * (phiếu tổng chuyển IN_PROGRESS) → phụ phí 300.000 → phát sinh KHQ đang hoạt động 200.000 → hoàn thành KHQ → HQGS, KB, ST → VT (NT_B 400 USD, tỷ giá 25.000).
 * Chỉ sau khi toàn bộ dịch vụ con PERFORMED, phiếu tổng mới PERFORMED; sau đó áp tỷ giá → K5 xác nhận doanh thu → COMPLETED.
 */
export type P0OrderOpts = {
  base?: P0Base;
  /** K1 sửa doanh thu Phát sinh KHQ 200.000 → 250.000 ở mốc KHQ_COSTS. */
  editShift?: boolean;
  /** Chỉ dựng phụ phí/phát sinh KHQ khi case thật sự kiểm tra các dòng này. */
  khqExtraCosts?: boolean;
  /** Chạy trước khi thực hiện các bước của mốc (vd đổi SSP trước khi điều phối ST). */
  before?: Partial<Record<P0Stage, (o: P0Order) => Promise<void>>>;
  /** Ghi đè thông tin thực tế từng dịch vụ (vd KHQ declarationCount = 2). */
  actuals?: Partial<Record<ServiceKey, Record<string, unknown>>>;
};

export async function p0Order(run: TestRun, stage: P0Stage, opts: P0OrderOpts = {}): Promise<P0Order> {
  const base = opts.base ?? (await p0Base(run));
  const refs = await run.p0Refs();
  const reach = (s: P0Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(s);
  // Luôn tạo Nháp trước để K1 đính kèm chứng từ xe. API tài liệu xe không cho sửa
  // sau khi phiếu đã gửi/đang thực hiện.
  const created = await createOrder(run, base, { submit: false });
  const svc = Object.fromEntries(SERVICE_KEYS.map((k) => [k, { id: created.id, type: refs.services[k] }])) as Record<ServiceKey, Svc>;
  const order: P0Order = { id: created.id, code: created.code, base, svc };
  const hook = async (s: P0Stage) => { const f = opts.before?.[s]; if (f) await f(order); };
  const act = (k: ServiceKey) => ({ ...actualsBody(refs, k), ...(opts.actuals?.[k] ?? {}) });
  if (reach('SUBMITTED')) {
    await uploadVehicleDoc(run, created.id, samplePdf('so-thong-hanh-xe-giao-1.pdf'), 'HANDOVER', 0);
    await uploadVehicleDoc(run, created.id, samplePdf('so-thong-hanh-xe-nhan-1.pdf'), 'RECEIVER', 0);
    await must(await run.http.call('POST /api/service-orders/{id}/submit', {
      token: run.token('k1'), params: { id: created.id },
    }), 'gửi phiếu dịch vụ sau khi đủ chứng từ xe');
  }
  if (!reach('ACCEPTED')) return order;
  await hook('ACCEPTED');
  await acceptOrder(run, created.id);
  await confirmLegs(run, created.id);
  if (!reach('KHQ_COORDINATED')) return order;
  await hook('KHQ_COORDINATED');
  const A = env.ref('CONTRACTOR_A_ID');
  const B = env.ref('CONTRACTOR_B_ID');
  const assign = (key: P0ItemKey, contractorId: string, routeIndex?: number) => ({ priceConfigurationItemId: base.items[key].id, contractorId, unitCode: refs.units[key], routeIndex });
  await coordinate(run, svc.KHQ, [assign('customsFee', A)]);
  if (!reach('IN_PROGRESS')) return order;
  await hook('IN_PROGRESS');
  await startService(run, svc.KHQ);
  if (!reach('KHQ_COSTS')) return order;
  await hook('KHQ_COSTS');
  // Mặc định giữ bộ dữ liệu đầy đủ cho các suite cũ; case không kiểm tra phụ phí/phát sinh
  // truyền khqExtraCosts=false để không bị phụ thuộc vào bước chuẩn bị không liên quan.
  const withKhqExtras = opts.khqExtraCosts ?? true;
  if (withKhqExtras) {
    const ot = await costItem(run, svc.KHQ, A, base.items.overtime.id);
    // Phụ phí lấy từ bảng giá mua: chỉ gửi purchasePriceItemId, không gửi đồng thời đầu mục phát sinh.
    order.overtimeLineId = await addCost(run, svc.KHQ, { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, unitCode: refs.units.overtime, quantity: 1, amount: P0.overtimeCost, currency: 'VND' });
    const varianceResponse = await must(await run.http.call('GET /api/k3/service-orders/{id}/services/{type}/variance-items', {
      token: run.token('dp'), params: { id: svc.KHQ.id, type: svc.KHQ.type },
    }), 'đọc đầu mục phát sinh KHQ đang hoạt động');
    const variance = items(varianceResponse)[0];
    if (!variance?.id) throw new Error('KHQ không có đầu mục Phát sinh đang hoạt động để thêm chi phí');
    order.varianceItemId = variance.id;
    order.varianceItemName = variance.name;
    // Danh sách do endpoint của KHQ trả về; dùng đơn vị Tờ khai của chính dịch vụ KHQ.
    order.varianceUnitCode = refs.units.customsFee;
    order.shiftLineId = await addCost(run, svc.KHQ, { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: variance.id, unitCode: order.varianceUnitCode, quantity: 1, amount: P0.storageFeeCost, currency: 'VND' });
    if (!order.shiftLineId) order.shiftLineId = (await costLines(run, svc.KHQ)).find((l) => l.priceConfigurationItemId === variance.id)?.costLineId;
  }
  if (opts.editShift) {
    if (!order.shiftLineId || !order.varianceUnitCode) throw new Error('Thiếu dòng doanh thu phát sinh KHQ để chỉnh sửa');
    await must(await run.http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: run.token('k1'), params: { id: created.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: order.shiftLineId, unitCode: order.varianceUnitCode, quantity: 1, unitPrice: P0.storageFeeRevenueEdited }] } }), 'K1 sửa doanh thu phát sinh KHQ 250.000');
  }
  if (!reach('KHQ_DONE')) return order;
  await hook('KHQ_DONE');
  const khqActuals = act('KHQ') as any;
  await saveActuals(run, svc.KHQ, khqActuals);
  await uploadActualDoc(run, svc.KHQ);
  await completeService(run, svc.KHQ);
  if (!reach('CHANG1_DONE')) return order;
  await hook('CHANG1_DONE');
  for (const [key, item] of [['HQGS', 'supervision'], ['KB', 'storage']] as [ServiceKey, P0ItemKey][]) {
    await coordinate(run, svc[key], [assign(item, A)]);
    await startService(run, svc[key]);
    await saveActuals(run, svc[key], act(key));
    await uploadActualDoc(run, svc[key]);
    await completeService(run, svc[key]);
  }
  // Sang tải cần Xe nhận của Vận tải: điều phối và bắt đầu VT trước, sau đó lưu Xe nhận
  // để Sang tải ghép với Xe giao do KHQ cung cấp (FLOW-E2E-009).
  await coordinate(run, svc.VT, [assign('freight', B, 0)], { USD: P0.fxUsd });
  await startService(run, svc.VT);
  const vtActuals = act('VT') as any;
  await saveActuals(run, svc.VT, { receiverVehicles: vtActuals.receiverVehicles });
  await coordinate(run, svc.ST, [assign('transload', A)]);
  await startService(run, svc.ST);
  await saveActuals(run, svc.ST, act('ST'));
  await uploadActualDoc(run, svc.ST);
  await completeService(run, svc.ST);
  if (!reach('PERFORMED')) return order;
  await hook('PERFORMED');
  await saveActuals(run, svc.VT, vtActuals);
  await uploadActualDoc(run, svc.VT);
  await completeService(run, svc.VT);
  if (!reach('FX_APPLIED')) return order;
  await hook('FX_APPLIED');
  await setOrderFx(run, created.id, P0.fxUsd);
  if (!reach('COMPLETED')) return order;
  await hook('COMPLETED');
  await confirmRevenue(run, created.id);
  return order;
}

/** Thêm phụ phí Kẹp chì cho HQGS (FLOW-REV); trả id dòng. */
export async function addSealCost(run: TestRun, order: P0Order): Promise<string> {
  const refs = await run.p0Refs();
  const A = env.ref('CONTRACTOR_A_ID');
  const it = await costItem(run, order.svc.HQGS, A, order.base.items.seal.id);
  return addCost(run, order.svc.HQGS, { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: it.purchasePriceItemId, unitCode: refs.units.seal, quantity: 1, amount: 150_000, currency: 'VND' });
}

/** CC từ chối phiếu (SUBMITTED → REJECTED) kèm lý do. */
export async function rejectOrder(run: TestRun, id: string, reason = 'Thiếu số tờ khai dự kiến'): Promise<void> {
  await must(await run.http.call('POST /api/k3/service-orders/{id}/reject', { token: run.token('cc'), params: { id }, json: { reason } }), 'CC từ chối phiếu');
}

/** Điều phối dịch vụ `key` theo P0 (VT: NT_B USD 25.000, còn lại NT_A) và tùy chọn bắt đầu. */
export async function runService(run: TestRun, order: P0Order, key: ServiceKey, start = true): Promise<void> {
  const refs = await run.p0Refs();
  const item: Record<ServiceKey, P0ItemKey> = { KHQ: 'customsFee', HQGS: 'supervision', VT: 'freight', ST: 'transload', KB: 'storage' };
  const contractor = key === 'VT' ? env.ref('CONTRACTOR_B_ID') : env.ref('CONTRACTOR_A_ID');
  const k = item[key];
  await coordinate(run, order.svc[key], [{ priceConfigurationItemId: order.base.items[k].id, contractorId: contractor, unitCode: refs.units[k], routeIndex: key === 'VT' ? 0 : undefined }], key === 'VT' ? { USD: P0.fxUsd } : undefined);
  if (start) await startService(run, order.svc[key]);
}

/**
 * BGKH bổ sung cho KH_A từ bộ P0 (không đổi RC mặc định): tiền tệ/tỷ giá tùy chọn (P_USD), gộp 2 dòng KHQ thành 1 nhóm (BR_BG_45).
 * Trả RC đã ACTIVE để tạo phiếu với customerQuotationId = rcId.
 */
export async function extraQuote(run: TestRun, opts: { currency?: 'VND' | 'USD'; fxRate?: number; mergeKhq?: boolean; base?: P0Base; prices?: Record<string, number> } = {}): Promise<{ rcId: string; cq: any; base: P0Base }> {
  const base = opts.base ?? (await p0Base(run));
  const { createRfq, rfqBody } = await import('../../quan-ly-bao-gia/data/ycbg.factory');
  const r = await createRfq(run, { submit: true, body: await rfqBody(run, { currency: opts.currency ?? 'VND' }) });
  await must(await run.http.call('POST /api/quotation-requests/{id}/accept', { token: run.token('cc'), params: { id: r.id } }), 'Định giá tiếp nhận YCBG');
  const sspMap: SspMap = {};
  for (const it of P0_ITEMS.filter((i) => i.inQuote)) sspMap[it.key] = { itemId: base.items[it.key].id, sspId: base.ssp[it.key]!, price: it.ssp! };
  const iq = await createInternalQuote(run, r.id, sspMap, 'cc');
  await issueInternalQuote(run, iq.id, 'cc');
  let cq = await createCustomerQuotation(run, r.id, 'k1');
  cq = await setQuotationSettings(run, cq, { vatBand: P0.vatBand, currency: opts.currency ?? 'VND', fxRate: opts.fxRate });
  if (opts.prices) cq = await setQuotationPrices(run, cq, opts.prices);
  if (opts.mergeKhq) {
    const refs = await run.p0Refs();
    const khq = (cq.lines ?? []).filter((l: any) => l.serviceTypeCode === refs.services.KHQ);
    cq = await must(await run.http.call('POST /api/customer-quotations/{id}/merges', { token: run.token('k1'), params: { id: cq.id }, json: { displayName: 'AT Phí hải quan trọn gói', unitCode: refs.units.customsFee, lineIds: khq.map((l: any) => l.id) } }), 'gộp dòng KHQ');
  }
  await confirmQuotation(run, cq.id);
  return { rcId: cq.id, cq: await getCustomerQuotation(run, cq.id), base };
}

/** Danh sách chứng từ K1 của 1 dịch vụ trong phiếu. */
export async function orderDocs(run: TestRun, id: string, serviceTypeCode: string, role: RoleKey = 'k1'): Promise<any[]> {
  const d = await must(await run.http.call('GET /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: run.token(role), params: { id, serviceTypeCode } }), 'danh sách chứng từ dịch vụ');
  return d?.items ?? [];
}

/** K1 đính kèm chứng từ cho dịch vụ và trả bản ghi chứng từ mới (POST không trả body nên so danh sách trước/sau). */
export async function uploadOrderDoc(run: TestRun, id: string, serviceTypeCode: string, file: { name: string; mimeType: string; buffer: Buffer }): Promise<any> {
  const before = new Set((await orderDocs(run, id, serviceTypeCode)).map((d: any) => d.id));
  await must(await run.http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: run.token('k1'), params: { id, serviceTypeCode }, multipart: { file } }), 'đính kèm chứng từ dịch vụ');
  return (await orderDocs(run, id, serviceTypeCode)).find((d: any) => !before.has(d.id));
}

export async function vehicleDocs(run: TestRun, id: string, role = 'HANDOVER', pairIndex = 0, as: RoleKey = 'k1'): Promise<any[]> {
  const d = await must(await run.http.call('GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: run.token(as), params: { id, role, pairIndex } }), 'tài liệu xe');
  return d?.items ?? [];
}

export async function uploadVehicleDoc(run: TestRun, id: string, file: { name: string; mimeType: string; buffer: Buffer }, role = 'HANDOVER', pairIndex = 0): Promise<any> {
  const before = new Set((await vehicleDocs(run, id, role, pairIndex)).map((d: any) => d.id));
  await must(await run.http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: run.token('k1'), params: { id, role, pairIndex }, multipart: { file } }), 'đính kèm số thông hành');
  return (await vehicleDocs(run, id, role, pairIndex)).find((d: any) => !before.has(d.id));
}

/** Phiếu 4 dịch vụ (chưa có KB) đã tiếp nhận, K3 đề xuất thêm Kho bãi; trả phiếu và id đề xuất. */
export async function scopeRequestOrder(run: TestRun): Promise<{ order: any; requestId: string; base: P0Base }> {
  const base = await p0Base(run);
  const refs = await run.p0Refs();
  const order = await createOrder(run, base, { submit: true, services: ['KHQ', 'HQGS', 'VT', 'ST'] });
  await acceptOrder(run, order.id);
  await confirmLegs(run, order.id);
  const payload = { kind: 'ADD', serviceTypeCode: refs.services.KB, reason: 'Hàng cần lưu kho chờ thông quan' };
  // DP_K2 quản lý điều phối nhưng không có quyền đề xuất phạm vi. Trên giao diện,
  // thao tác này thuộc tài khoản điều phối dịch vụ; thử các vai trò dịch vụ đã cấu
  // hình và chỉ tiếp tục khi một vai trò được hệ thống cho phép. Các lần 403 không
  // tạo bản ghi nên không làm bẩn dữ liệu.
  const candidates: RoleKey[] = ['dpKhq', 'dpHqgs', 'dpVt', 'dpSt', 'dpKb'];
  let response: Awaited<ReturnType<TestRun['http']['call']>> | undefined;
  for (const role of candidates) {
    if (!run.roles[role]?.accessToken) continue;
    response = await run.http.call('POST /api/k3/service-orders/{id}/scope-requests', {
      token: run.token(role), params: { id: order.id }, json: payload,
    });
    if (response.ok() || response.status() !== 403) break;
  }
  if (!response) throw new Error('Thiếu tài khoản điều phối dịch vụ để K3 đề xuất thêm Kho bãi');
  const d = await must(response, 'K3 đề xuất thêm Kho bãi');
  return { order, requestId: d.id, base };
}

/**
 * Phiếu P0 dùng chung cho case chỉ đọc: `PERFORMED` theo luồng xuyên suốt (K1 sửa doanh thu Phát sinh KHQ thành 250.000), tỷ giá thủ công USD 25.000 (doanh thu 15.900.000, chi phí 14.000.000).
 * Hợp lệ khi phiếu còn PERFORMED và tỷ giá còn MANUAL 25.000; case đổi tỷ giá phải tự dựng phiếu riêng.
 */
export async function performedP0(run: TestRun): Promise<P0Order> {
  return shared('p0-performed-v2', () => p0Order(run, 'FX_APPLIED', { editShift: true }), async (v) => {
    const o = await run.http.call('GET /api/service-orders/{id}', { token: run.token('k1'), params: { id: v.id } });
    if (!o.ok() || (await data(o))?.status !== 'PERFORMED') return false;
    const fx = await data(await run.http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: run.token('cc'), params: { id: v.id } }));
    return fx?.source === 'MANUAL' && Number(fx?.usdRate) === P0.fxUsd;
  });
}

/** Phiếu P0 đã K5 xác nhận doanh thu (`COMPLETED`), dùng chung cho case chỉ đọc. */
export async function completedP0(run: TestRun): Promise<P0Order> {
  return shared('p0-completed-v2', () => p0Order(run, 'COMPLETED', { editShift: true }), async (v) => {
    const o = await run.http.call('GET /api/service-orders/{id}', { token: run.token('k1'), params: { id: v.id } });
    return o.ok() && (await data(o))?.status === 'COMPLETED';
  });
}
