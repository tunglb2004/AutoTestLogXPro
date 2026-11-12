import { FilePart, jsonPart, data, items, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, P0Refs, TestRun, shared } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import { P0_ITEMS, P0ItemKey } from '../../core/data/p0-price-set';
import { env } from '../../core/env';
import type { CreatedItems } from '../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import fs from 'fs';
import path from 'path';
/**
 * Dữ liệu mẫu cho mục "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/purchase-prices": (o: Record<string, unknown> = {}) => ({ ...{ "contractorId": uuid(), "currency": tagged("AT Dữ liệu").slice(0, 255), "effectiveFrom": today(), "effectiveTo": today(), "name": tagged("AT Tên").slice(0, 255) }, ...o }),
  "PUT /api/purchase-prices/{id}": (o: Record<string, unknown> = {}) => ({ ...{ "contractorId": uuid(), "currency": tagged("AT Dữ liệu").slice(0, 255), "effectiveFrom": today(), "effectiveTo": today(), "name": tagged("AT Tên").slice(0, 255) }, ...o }),
  "POST /api/purchase-prices/{id}/items": (o: Record<string, unknown> = {}) => ({ ...{ "priceConfigurationItemId": uuid(), "unitCode": "AT", "unitPrice": randMoney() }, ...o }),
  "PUT /api/purchase-prices/{id}/items": (o: Record<string, unknown> = {}) => ({ ...{  }, ...o }),
  "POST /api/purchase-prices/{id}/items/approve": (o: Record<string, unknown> = {}) => ({ ...{ "itemIds": [uuid()] }, ...o }),
  "PUT /api/purchase-prices/{id}/items/{itemId}": (o: Record<string, unknown> = {}) => ({ ...{ "unitCode": "AT", "unitPrice": randMoney() }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/purchase-prices": [{"name": "name", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "contractorId", "required": true, "type": "string", "format": "uuid"}, {"name": "effectiveFrom", "required": true, "type": "string", "format": "date"}, {"name": "effectiveTo", "required": true, "type": "string", "format": "date"}, {"name": "currency", "required": true, "type": "string", "minLength": 1}, {"name": "note", "required": false, "type": "string"}, {"name": "items", "required": false, "type": "array"}],
  "PUT /api/purchase-prices/{id}": [{"name": "name", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "contractorId", "required": true, "type": "string", "format": "uuid"}, {"name": "effectiveFrom", "required": true, "type": "string", "format": "date"}, {"name": "effectiveTo", "required": true, "type": "string", "format": "date"}, {"name": "currency", "required": true, "type": "string", "minLength": 1}, {"name": "note", "required": false, "type": "string"}],
  "POST /api/purchase-prices/{id}/items": [{"name": "priceConfigurationItemId", "required": true, "type": "string", "format": "uuid"}, {"name": "unitCode", "required": true, "type": "string", "minLength": 1}, {"name": "unitPrice", "required": true, "type": "number"}, {"name": "originPointCodes", "required": false, "type": "array"}, {"name": "destinationPointCodes", "required": false, "type": "array"}, {"name": "warehouseCodes", "required": false, "type": "array"}, {"name": "warehouseTypeIds", "required": false, "type": "array"}, {"name": "customsOfficeCodes", "required": false, "type": "array"}, {"name": "tradeTypeCodes", "required": false, "type": "array"}, {"name": "transloadPointCodes", "required": false, "type": "array"}, {"name": "transloadMethodCodes", "required": false, "type": "array"}, {"name": "cargoNatureCodes", "required": false, "type": "array"}, {"name": "vehicleTypeCodes", "required": false, "type": "array"}, {"name": "cargoGroupCodes", "required": false, "type": "array"}, {"name": "allAttributes", "required": false, "type": "array"}],
  "PUT /api/purchase-prices/{id}/items": [{"name": "added", "required": false, "type": "array"}, {"name": "updated", "required": false, "type": "array"}, {"name": "removed", "required": false, "type": "array"}],
  "POST /api/purchase-prices/{id}/items/approve": [{"name": "itemIds", "required": true, "type": "array", "minItems": 1}],
  "PUT /api/purchase-prices/{id}/items/{itemId}": [{"name": "unitCode", "required": true, "type": "string", "minLength": 1}, {"name": "unitPrice", "required": true, "type": "number"}, {"name": "originPointCode", "required": false, "type": "string"}, {"name": "destinationPointCode", "required": false, "type": "string"}, {"name": "warehouseCode", "required": false, "type": "string"}, {"name": "warehouseTypeId", "required": false, "type": "string", "format": "uuid"}, {"name": "customsOfficeCode", "required": false, "type": "string"}, {"name": "tradeTypeCode", "required": false, "type": "string"}, {"name": "transloadPointCode", "required": false, "type": "string"}, {"name": "transloadMethodCode", "required": false, "type": "string"}, {"name": "cargoNatureCode", "required": false, "type": "string"}, {"name": "vehicleTypeCode", "required": false, "type": "string"}, {"name": "cargoGroupCode", "required": false, "type": "string"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
/** Thuộc tính đặc thù của dòng giá theo phân hệ (SRS Giá mua đầu vào 3.1.2), lấy đúng mã P0 để khớp với YCBG, BGNB, phiếu. */
export function lineAttributes(refs: P0Refs, key: P0ItemKey): Record<string, unknown> {
  const svc = P0_ITEMS.find((i) => i.key === key)!.service;
  switch (svc) {
    case 'KHQ':
    case 'HQGS':
      return { customsOfficeCodes: [refs.customsOffice], tradeTypeCodes: [refs.tradeType], cargoGroupCodes: [refs.cargoGroup], vehicleTypeCodes: [refs.vehicleType] };
    case 'VT':
      return { originPointCodes: [refs.originPoint], destinationPointCodes: [refs.destinationPoint], vehicleTypeCodes: [refs.vehicleType] };
    case 'ST':
      return { transloadPointCodes: [refs.transloadPoint], transloadMethodCodes: [refs.transloadMethod], cargoGroupCodes: [refs.cargoGroup], cargoNatureCodes: [refs.cargoNature] };
    case 'KB':
      return { warehouseCodes: [refs.warehouse], warehouseTypeIds: [refs.warehouseTypeId] };
  }
}

/** 1 dòng giá cho đầu mục `key`. */
export function priceLine(refs: P0Refs, created: CreatedItems, key: P0ItemKey, unitPrice: number, o: Record<string, unknown> = {}): Record<string, unknown> {
  return { priceConfigurationItemId: created[key].id, unitCode: refs.units[key], unitPrice, ...lineAttributes(refs, key), ...o };
}

/** Hợp đồng hiệu lực của nhà thầu (để đặt hiệu lực bảng giá nằm trong hiệu lực HĐ). */
export async function contractorRef(run: TestRun, contractorId: string, role: RoleKey = 'k1'): Promise<any> {
  const list = items(await must(await run.http.call('GET /api/purchase-prices/contractors', { token: run.token(role), query: { perPage: 200 } }), 'nhà thầu chọn được'));
  const c = list.find((x: any) => x.id === contractorId);
  if (!c) throw new Error(`Nhà thầu ${contractorId} không có trong GET /api/purchase-prices/contractors (cần Đang hoạt động, HĐ Đang hiệu lực)`);
  return c;
}

export async function sheetBody(run: TestRun, contractorId: string, currency: 'VND' | 'USD' | 'CNY', lines: Record<string, unknown>[], name: string, role: RoleKey = 'k1') {
  const c = await contractorRef(run, contractorId, role);
  const to = c.contract?.effectiveTo ?? new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return { name: name.slice(0, 255), contractorId, effectiveFrom: today, effectiveTo: to, currency, note: 'Bảng giá kiểm thử tự động', items: lines };
}

/** Tạo bảng giá mua (trạng thái Tạo mới). */
export async function createSheet(run: TestRun, contractorId: string, currency: 'VND' | 'USD' | 'CNY', lines: Record<string, unknown>[], name: string, role: RoleKey = 'k1'): Promise<any> {
  return must(await run.http.call('POST /api/purchase-prices', { token: run.token(role), json: await sheetBody(run, contractorId, currency, lines, name, role) }), `tạo bảng giá ${name}`);
}

export async function activateSheet(run: TestRun, id: string, role: RoleKey = 'k1'): Promise<any> {
  return must(await run.http.call('POST /api/purchase-prices/{id}/activate', { token: run.token(role), params: { id } }), 'kích hoạt bảng giá mua');
}

/** Bảng giá ở trạng thái Đang hoạt động. */
export function isActiveSheet(s: any): boolean {
  return s?.status?.code === 'ACTIVE' || /Đang hoạt động/i.test(String(s?.status?.name ?? ''));
}

/** Bảng giá Đang hoạt động hiện tại của nhà thầu (mỗi nhà thầu tối đa 1 bảng, BR39). */
export async function activeSheetOf(run: TestRun, contractorId: string, role: RoleKey = 'k1'): Promise<any | undefined> {
  const list = items(await must(await run.http.call('GET /api/purchase-prices', { token: run.token(role), query: { contractorId, perPage: 100 } }), 'bảng giá của nhà thầu'));
  return list.find(isActiveSheet);
}

const combinationFields = [
  'originPointCode', 'destinationPointCode', 'warehouseCode', 'warehouseTypeId', 'customsOfficeCode',
  'tradeTypeCode', 'transloadPointCode', 'transloadMethodCode', 'cargoNatureCode', 'vehicleTypeCode', 'cargoGroupCode',
] as const;

/** Request chứa danh sách giá trị, còn mỗi dòng đã lưu chứa một tổ hợp cụ thể. */
export function matchesPurchaseCombination(row: Record<string, unknown>, input: Record<string, unknown>): boolean {
  const all = (value: unknown) => Array.isArray(value) ? [...value].sort() : [];
  return row.priceConfigurationItemId === input.priceConfigurationItemId && row.unitCode === input.unitCode
    && JSON.stringify(all(row.allAttributes)) === JSON.stringify(all(input.allAttributes))
    && combinationFields.every((field) => {
      const values = input[`${field}s`];
      return Array.isArray(values) && values.length ? values.includes(row[field]) : (row[field] ?? '') === (input[field] ?? '');
    });
}

/** Thêm các tổ hợp còn thiếu bằng API lưu theo lô, giữ nguyên các dòng hiện tại. */
export async function addLines(run: TestRun, sheetId: string, lines: Record<string, unknown>[], role: RoleKey = 'k1'): Promise<void> {
  let existing = await sheetItems(run, sheetId, role);
  for (const l of lines) {
    let combinations = [l];
    for (const field of combinationFields) {
      const key = `${field}s`;
      const values = l[key];
      if (Array.isArray(values) && values.length > 1) combinations = combinations.flatMap((combination) =>
        [...new Set(values)].map((value) => ({ ...combination, [key]: [value] })));
    }
    for (let attempt = 0; attempt <= 5; attempt++) {
      const missing = combinations.filter((combination) => !existing.some((row) => matchesPurchaseCombination(row, combination)));
      if (!missing.length) break;
      const added = missing.length === combinations.length ? [l] : missing;
      const res = await run.http.call('PUT /api/purchase-prices/{id}/items', { token: run.token(role), params: { id: sheetId }, json: { added } });
      if (attempt < 5 && [409, 423].includes(res.status())) {
        await new Promise((resolve) => setTimeout(resolve, 1_000 * (attempt + 1)));
        existing = await sheetItems(run, sheetId, role);
        continue;
      }
      await must(res, 'thêm dòng giá vào bảng đang hoạt động');
      existing = await sheetItems(run, sheetId, role);
      if (!missing.every((combination) => existing.some((row) => matchesPurchaseCombination(row, combination)))) {
        throw new Error('API lưu bảng giá không trả lại đủ tổ hợp vừa thêm khi đọc danh sách');
      }
      break;
    }
  }
}

/**
 * Chạy `fn` độc quyền theo khóa file (các worker chờ nhau). Dùng cho case tạo/kích hoạt/ngừng bảng giá của NT_D/NT_E:
 * kích hoạt bảng mới làm ngừng bảng cũ của cùng nhà thầu, chạy song song sẽ làm sai tiền điều kiện của nhau.
 */
export async function exclusive<T>(key: string, fn: () => Promise<T>, waitMs = 15 * 60_000): Promise<T> {
  const dir = path.resolve('.auth');
  fs.mkdirSync(dir, { recursive: true });
  const lock = path.join(dir, `lock-${key}`);
  const deadline = Date.now() + waitMs;
  for (;;) {
    try {
      fs.closeSync(fs.openSync(lock, 'wx'));
      break;
    } catch {
      try { if (Date.now() - fs.statSync(lock).mtimeMs > 20 * 60_000) fs.rmSync(lock, { force: true }); } catch { /* khóa vừa được trả */ }
      if (Date.now() > deadline) throw new Error(`Hết thời gian chờ khóa ${key}`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  try {
    return await fn();
  } finally {
    fs.rmSync(lock, { force: true });
  }
}

/**
 * Đưa `lines` vào bảng Đang hoạt động của nhà thầu: đã có bảng thì thêm dòng, chưa có thì tạo + kích hoạt (khóa file để 2 worker không cùng tạo).
 * Không tạo bảng mới khi nhà thầu đã có bảng Đang hoạt động: kích hoạt bảng mới làm ngừng bảng cũ (BR39) và xóa SBP/SSP của bộ P0 dùng chung.
 */
export async function ensureContractorLines(run: TestRun, contractorId: string, currency: 'VND' | 'USD' | 'CNY', lines: Record<string, unknown>[], name: string, role: RoleKey = 'k1'): Promise<any> {
  let created = false;
  const sheet = await shared(`active-sheet-${contractorId}`, async () => {
    const act = await activeSheetOf(run, contractorId, role);
    if (act) return { id: act.id as string, code: act.code as string, currency: act.currency as string };
    const s = await createSheet(run, contractorId, currency, lines, name, role);
    // Bảng có ngày hiệu lực = hôm nay có thể được hệ thống tự chuyển Đang hoạt động ngay khi tạo; chỉ kích hoạt khi còn Tạo mới.
    const now = await must(await run.http.call('GET /api/purchase-prices/{id}', { token: run.token(role), params: { id: s.id } }), 'đọc bảng giá vừa tạo');
    if (!isActiveSheet(now)) await activateSheet(run, s.id, role);
    created = true;
    return { id: s.id as string, code: s.code as string, currency: currency as string };
  }, async (v) => {
    const r = await run.http.call('GET /api/purchase-prices/{id}', { token: run.token(role), params: { id: v.id } });
    return r.ok() && isActiveSheet(await data(r));
  });
  if (sheet.currency !== currency) throw new Error(`Chuẩn bị dữ liệu thất bại: bảng giá Đang hoạt động ${sheet.code} của nhà thầu ${contractorId} dùng ${sheet.currency}, bộ P0 cần ${currency}`);
  if (!created) await addLines(run, sheet.id, lines, role);
  return sheet;
}

/** Dòng NT_A (VND) theo P0 đưa vào bảng Đang hoạt động của NT_A; `only` để giới hạn đầu mục. */
export async function p0SheetA(run: TestRun, created: CreatedItems, name: string, only?: P0ItemKey[], role: RoleKey = 'k1') {
  const refs = await run.p0Refs();
  const lines = P0_ITEMS.filter((i) => i.buyA !== null && (!only || only.includes(i.key))).map((i) => priceLine(refs, created, i.key, i.buyA!));
  return ensureContractorLines(run, env.ref('CONTRACTOR_A_ID'), 'VND', lines, name, role);
}

/** Dòng NT_B (USD) chỉ Vận tải 400 USD/Chuyến đưa vào bảng Đang hoạt động của NT_B. */
export async function p0SheetB(run: TestRun, created: CreatedItems, name: string, role: RoleKey = 'k1') {
  const refs = await run.p0Refs();
  return ensureContractorLines(run, env.ref('CONTRACTOR_B_ID'), 'USD', [priceLine(refs, created, 'freight', 400)], name, role);
}

/** Các dòng giá của bảng giá mua. */
export async function sheetItems(run: TestRun, id: string, role: RoleKey = 'k1'): Promise<any[]> {
  // API giới hạn perPage <= 100: đọc lần lượt từng trang tới hết.
  const out: any[] = [];
  for (let page = 1; page <= 100; page++) {
    const d = await must(await run.http.call('GET /api/purchase-prices/{id}/items', { token: run.token(role), params: { id }, query: { page, perPage: 100 } }), 'dòng giá của bảng giá mua');
    const rows = items(d);
    out.push(...rows);
    const pages = Number(d?.meta?.pagination?.totalPages);
    if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break;
  }
  return out;
}

/** Dòng giá của bảng giá mua theo đầu mục. */
export async function sheetLine(run: TestRun, sheetId: string, priceConfigurationItemId: string, role: RoleKey = 'k1'): Promise<any> {
  const line = (await sheetItems(run, sheetId, role)).find((l: any) => l.priceConfigurationItemId === priceConfigurationItemId);
  if (!line) throw new Error(`Bảng giá ${sheetId} không có dòng của đầu mục ${priceConfigurationItemId}`);
  return line;
}

/**
 * Đổi đơn giá 1 dòng giá mua (PUT từng dòng, giữ nguyên thuộc tính) rồi phê duyệt dòng giá mới (update SRS Giá mua đầu vào US10 AC3:
 * dòng đang tham chiếu chuyển "Chờ phê duyệt" cho tới khi duyệt). `approve` = false để giữ trạng thái chờ phê duyệt.
 */
export async function changeLinePrice(run: TestRun, sheetId: string, priceConfigurationItemId: string, unitPrice: number, approve = true, role: RoleKey = 'k1'): Promise<any> {
  const l = await sheetLine(run, sheetId, priceConfigurationItemId, role);
  const body: Record<string, unknown> = { unitCode: l.unitCode, unitPrice };
  for (const k of ['originPointCode', 'destinationPointCode', 'warehouseCode', 'warehouseTypeId', 'customsOfficeCode', 'tradeTypeCode', 'transloadPointCode', 'transloadMethodCode', 'cargoNatureCode', 'vehicleTypeCode', 'cargoGroupCode']) if (l[k]) body[k] = l[k];
  const updated = await must(await run.http.call('PUT /api/purchase-prices/{id}/items/{itemId}', { token: run.token(role), params: { id: sheetId, itemId: l.id }, json: body }), 'đổi đơn giá dòng giá mua');
  if (approve) await must(await run.http.call('POST /api/purchase-prices/{id}/items/approve', { token: run.token(role), params: { id: sheetId }, json: { itemIds: [updated.id ?? l.id] } }), 'phê duyệt dòng giá mới');
  return updated;
}
