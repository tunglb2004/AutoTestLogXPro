import type { APIResponse } from '@playwright/test';
import { FilePart, jsonPart, items, must } from '../../core/base.client';
import { TEST_RUN_ID, blockCase, randInt, randMoney, samplePdf, tagged, today, uuid, TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import { P0_ITEMS, P0ItemKey, PriceTypeKey, ServiceKey } from '../../core/data/p0-price-set';
/**
 * Dữ liệu mẫu cho mục "Cấu hình đầu mục giá": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/price-configurations/{id}/items": (o: Record<string, unknown> = {}) => ({ ...{ "name": tagged("AT Tên").slice(0, 50), "priceTypeId": uuid(), "sortOrder": randInt(1, 10) }, ...o }),
  "PUT /api/price-configurations/{id}/items": (o: Record<string, unknown> = {}) => ({ ...{ "items": [] }, ...o }),
  "PUT /api/price-configurations/{id}/items/{itemId}": (o: Record<string, unknown> = {}) => ({ ...{ "name": tagged("AT Tên").slice(0, 50), "priceTypeId": uuid(), "sortOrder": randInt(1, 10), "status": tagged("AT Dữ liệu").slice(0, 255) }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/price-configurations/{id}/items": [{"name": "name", "required": true, "type": "string", "maxLength": 50, "minLength": 0}, {"name": "priceTypeId", "required": true, "type": "string", "format": "uuid"}, {"name": "sortOrder", "required": true, "type": "integer", "minimum": 0, "format": "int32"}, {"name": "status", "required": false, "type": "string"}, {"name": "warehouseTypeIds", "required": false, "type": "array"}],
  "PUT /api/price-configurations/{id}/items": [{"name": "items", "required": true, "type": "array"}],
  "PUT /api/price-configurations/{id}/items/{itemId}": [{"name": "name", "required": true, "type": "string", "maxLength": 50, "minLength": 0}, {"name": "priceTypeId", "required": true, "type": "string", "format": "uuid"}, {"name": "sortOrder", "required": true, "type": "integer", "minimum": 0, "format": "int32"}, {"name": "status", "required": true, "type": "string", "minLength": 1}, {"name": "warehouseTypeIds", "required": false, "type": "array"}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
export type ConfigItem = { id: string; code: string; name: string; configId: string; service: ServiceKey; priceType: PriceTypeKey };
export type CreatedItems = Record<P0ItemKey, ConfigItem>;

/** Cấu hình đầu mục giá của 1 dịch vụ (mỗi dịch vụ 1 cấu hình), kèm danh sách đầu mục. */
export async function configOf(run: TestRun, service: ServiceKey, role: RoleKey = 'k1'): Promise<any> {
  const code = await run.serviceCode(service);
  const list = items(await must(await run.http.call('GET /api/price-configurations', { token: run.token(role), query: { perPage: 100 } }), 'danh sách cấu hình đầu mục giá'));
  const cfg = list.find((x: any) => x.serviceCode === code);
  if (!cfg) throw new Error(`Không có cấu hình đầu mục giá của dịch vụ ${service} (${code})`);
  return must(await run.http.call('GET /api/price-configurations/{id}', { token: run.token(role), params: { id: cfg.id } }), `chi tiết cấu hình ${service}`);
}

/** Body thêm đầu mục: tên tiếng Việt có nghĩa, loại giá theo danh mục, Kho bãi kèm Loại kho. */
export async function itemBody(run: TestRun, service: ServiceKey, name: string, priceType: PriceTypeKey, o: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  const refs = await run.p0Refs();
  return { name, priceTypeId: refs.priceTypes[priceType], sortOrder: 1, status: 'ACTIVE', warehouseTypeIds: service === 'KB' ? [refs.warehouseTypeId] : [], ...o };
}

/** Dừng case cần tạo đầu mục vì cấu hình chỉ được đọc. */
export async function createItem(_run: TestRun, service: ServiceKey, name: string, _priceType: PriceTypeKey = 'FIXED', _role: RoleKey = 'k1', _o: Record<string, unknown> = {}): Promise<ConfigItem> {
  blockCase(`case cần tạo đầu mục ${service} "${name}", cấu hình đầu mục giá chỉ được đọc`);
}

/**
 * Dùng đúng đầu mục đã có theo hậu tố. Bộ riêng của case phải có tên khớp để
 * tránh dùng nhầm đầu mục P0 và làm thay đổi giá của fixture dùng chung.
 */
export async function p0Items(run: TestRun, suffix: string, role: RoleKey = 'k1', only?: P0ItemKey[]): Promise<CreatedItems> {
  const out = {} as CreatedItems;
  const refs = await run.p0Refs();
  const configs = new Map<ServiceKey, Awaited<ReturnType<typeof configOf>>>();
  for (const it of P0_ITEMS.filter((i) => !only || only.includes(i.key))) {
    let cfg = configs.get(it.service);
    if (!cfg) {
      cfg = await configOf(run, it.service, role);
      configs.set(it.service, cfg);
    }
    const expectedName = `AT ${it.name} ${suffix}`.slice(0, 50);
    const configured = cfg.items ?? [];
    // Phát sinh P0 phải dùng đúng danh sách đang hoạt động của dịch vụ. Tên legacy
    // "Phí lưu ca" không còn được giả định là đầu mục KHQ hợp lệ.
    const activeVariance = it.key === 'shiftStorage' && suffix.toLowerCase() === 'p0'
      ? configured.filter((candidate: any) => (candidate.status?.code ?? candidate.status) === 'ACTIVE'
        && candidate.priceTypeId === refs.priceTypes.VARIANCE)
      : [];
    const matches = configured.filter((candidate: any) => candidate.name === expectedName);
    const found = activeVariance.find((candidate: any) => candidate.name === expectedName) ?? activeVariance[0] ?? (matches.length === 1 ? matches[0] : undefined);
    if (!found) blockCase(`cần đầu mục ${it.service} đang hoạt động, đúng loại giá ${it.priceType}; tên ưu tiên "${expectedName}"`);
    const name = found.name;
    const status = found.status?.code ?? found.status;
    if (!found.id || !found.code || status !== 'ACTIVE' || found.priceTypeId !== refs.priceTypes[it.priceType]) {
      blockCase(`cần đầu mục ${it.service} "${name}" đang hoạt động, có mã và đúng loại giá ${it.priceType}`);
    }
    if (it.service === 'KB' && !(found.warehouseTypes ?? []).some((type: { id: string }) => type.id === refs.warehouseTypeId)) {
      blockCase(`cần đầu mục Kho bãi "${name}" có loại kho ${refs.warehouseTypeCode} của P0`);
    }
    out[it.key] = { id: found.id, code: found.code, name, configId: cfg.id, service: it.service, priceType: it.priceType };
  }
  return out;
}

/** Dừng case cần đổi trạng thái vì cấu hình chỉ được đọc. */
export async function setItemStatus(_run: TestRun, item: ConfigItem, status: 'ACTIVE' | 'INACTIVE', _role: RoleKey = 'k1'): Promise<APIResponse> {
  blockCase(`case cần đổi đầu mục ${item.service} "${item.name}" sang ${status}, cấu hình đầu mục giá chỉ được đọc`);
}
