import { FilePart, jsonPart, items, must } from '../../core/base.client';
import { TEST_RUN_ID, randInt, randMoney, samplePdf, tagged, today, uuid, P0Refs, TestRun } from '../../core/fixtures/test-run.fixture';
import { RoleKey } from '../../core/data/accounts';
import { P0_ITEMS, P0ItemKey, SERVICES, SERVICE_KEYS, ServiceKey } from '../../core/data/p0-price-set';
/**
 * Dữ liệu mẫu cho mục "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {
  "POST /api/internal-quotes": (o: Record<string, unknown> = {}) => ({ ...{ "name": tagged("AT Tên").slice(0, 255), "quotationRequestId": uuid(), "tables": [{ "lines": [{  }], "name": tagged("AT Tên").slice(0, 255), "serviceTypeCode": "AT" }], "validTo": today() }, ...o }),
  "PUT /api/internal-quotes/{id}": (o: Record<string, unknown> = {}) => ({ ...{ "name": tagged("AT Tên").slice(0, 255), "quotationRequestId": uuid(), "tables": [{ "lines": [{  }], "name": tagged("AT Tên").slice(0, 255), "serviceTypeCode": "AT" }], "validTo": today() }, ...o }),
  "POST /api/internal-quotes/{id}/withdraw": (o: Record<string, unknown> = {}) => ({ ...{ "reason": tagged("Lý do kiểm thử tự động").slice(0, 500) }, ...o }),
  "PUT /api/quotation-requests/{id}/internal-quote": (o: Record<string, unknown> = {}) => ({ ...{ "lines": [], "validFrom": today(), "validTo": today() }, ...o }),
  "POST /api/quotation-requests/{id}/internal-quote/decline": (o: Record<string, unknown> = {}) => ({ ...{ "reason": tagged("Lý do kiểm thử tự động").slice(0, 500) }, ...o }),
};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {
  "POST /api/internal-quotes": [{"name": "quotationRequestId", "required": true, "type": "string", "format": "uuid"}, {"name": "name", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "validFrom", "required": false, "type": "string", "format": "date"}, {"name": "validTo", "required": true, "type": "string", "format": "date"}, {"name": "currency", "required": false, "type": "string", "enum": ["VND", "USD", "CNY"]}, {"name": "terms", "required": false, "type": "string"}, {"name": "tables", "required": true, "type": "array", "minItems": 1}],
  "PUT /api/internal-quotes/{id}": [{"name": "quotationRequestId", "required": true, "type": "string", "format": "uuid"}, {"name": "name", "required": true, "type": "string", "maxLength": 255, "minLength": 0}, {"name": "validFrom", "required": false, "type": "string", "format": "date"}, {"name": "validTo", "required": true, "type": "string", "format": "date"}, {"name": "currency", "required": false, "type": "string", "enum": ["VND", "USD", "CNY"]}, {"name": "terms", "required": false, "type": "string"}, {"name": "tables", "required": true, "type": "array", "minItems": 1}],
  "POST /api/internal-quotes/{id}/withdraw": [{"name": "reason", "required": true, "type": "string", "maxLength": 500, "minLength": 0}],
  "PUT /api/quotation-requests/{id}/internal-quote": [{"name": "validFrom", "required": true, "type": "string", "format": "date"}, {"name": "validTo", "required": true, "type": "string", "format": "date"}, {"name": "lines", "required": true, "type": "array"}],
  "POST /api/quotation-requests/{id}/internal-quote/decline": [{"name": "reason", "required": true, "type": "string", "maxLength": 500, "minLength": 0}],
};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;

// ---------- Dựng dữ liệu nghiệp vụ (viết tay) ----------
/** Thuộc tính bảng giá trong BGNB theo dịch vụ (cùng mã với dòng giá mua và YCBG). */
export function tableAttributes(refs: P0Refs, key: ServiceKey): Record<string, unknown> {
  switch (key) {
    case 'KHQ':
    case 'HQGS':
      return { customsOfficeCode: refs.customsOffice, tradeTypeCode: refs.tradeType, cargoGroupCode: refs.cargoGroup, vehicleTypeCode: refs.vehicleType };
    case 'VT':
      return { originPointCode: refs.originPoint, destinationPointCode: refs.destinationPoint, vehicleTypeCode: refs.vehicleType };
    case 'ST':
      return { transloadPointCode: refs.transloadPoint, transloadMethodCode: refs.transloadMethod, cargoGroupCode: refs.cargoGroup, cargoNatureCode: refs.cargoNature };
    case 'KB':
      return { warehouseCode: refs.warehouse, warehouseTypeCode: refs.warehouseTypeCode, warehouseTypeId: refs.warehouseTypeId };
  }
}

export type SspMap = Partial<Record<P0ItemKey, { itemId: string; sspId: string; price: number }>>;

/**
 * Tên BGNB là duy nhất toàn tenant. `run.id` dùng chung cho toàn bộ case của một lượt chạy,
 * nên chỉ dùng `AT BGNB ${run.id}` sẽ làm các worker va nhau và API chặn đúng bằng HTTP 409.
 * Hậu tố ngẫu nhiên chỉ nhận diện bản ghi test, không thay đổi dữ liệu danh mục hay cấu hình giá.
 */
function uniqueInternalQuoteName(run: TestRun): string {
  return `AT BGNB ${run.id} ${Date.now().toString(36)} ${uuid().slice(0, 8)}`.slice(0, 255);
}

/** Đọc giá nguồn riêng để tính kỳ vọng BGNB, gồm cả dòng bắt buộc ngoài bộ P0. */
export async function expectedQuotePrices(run: TestRun, lines: { standardSellingPriceId: string; unitPrice?: number }[]) {
  if (!lines.length || lines.some((line) => !line.standardSellingPriceId)) throw new Error('Thiếu dòng giá nguồn của BGNB');
  const ids = [...new Set(lines.map((line) => line.standardSellingPriceId))];
  const prices = new Map<string, { sellingPrice: number; benchmarkPrice: number }>();
  for (const id of ids) {
    const row = await must(await run.http.call('GET /api/standard-selling-prices/{id}', {
      token: run.token('cc'), params: { id },
    }), 'đọc giá định mức để tính lợi nhuận');
    if (!Number.isFinite(row.sellingPrice) || !Number.isFinite(row.benchmarkPrice) || row.benchmarkPrice <= 0) {
      throw new Error(`Giá mua/bán định mức không hợp lệ cho dòng ${id}`);
    }
    prices.set(id, { sellingPrice: row.sellingPrice, benchmarkPrice: row.benchmarkPrice });
  }
  let buy = 0;
  let sell = 0;
  for (const line of lines) {
    const source = prices.get(line.standardSellingPriceId)!;
    buy += source.benchmarkPrice;
    sell += line.unitPrice ?? source.sellingPrice;
  }
  return { prices, sell, profitPercent: (sell - buy) / buy * 100 };
}

// ---------- Đầu mục bắt buộc trong bảng BGNB (người dùng chốt 09/11/2026) ----------
// Hệ thống bắt buộc mỗi bảng dịch vụ chọn dòng giá cho MỌI đầu mục đang hoạt động đã có giá bán định mức (SRS BGNB US_QUO_04 AC8).
// Web dev có đầu mục cũ không có giá bán khớp tuyến P0 → tự bổ sung 1 dòng giá mua NT_A đơn vị "Lô hàng" (SL luôn 1), giá mua/bán
// định mức tối thiểu; trong BGNB các dòng ngoài bộ case đặt đơn giá 0 để tổng giá bán BGNB/BGKH và doanh thu P0 giữ đúng bộ case.
const LEGACY_PRICE = { buy: 1, sell: 1 };
const TABLE_KEY: Record<ServiceKey, P0ItemKey> = { KHQ: 'customsFee', HQGS: 'supervision', VT: 'freight', ST: 'transload', KB: 'storage' };

async function priceLegacyItem(run: TestRun, item: any, unitCode: string, combination: Record<string, unknown>): Promise<string> {
  const { exclusive, ensureContractorLines, matchesPurchaseCombination, sheetItems } = await import('../../gia-mua-dau-vao/data/bang-gia-mua.factory');
  const { setBenchmark } = await import('../../gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory');
  const { setSelling } = await import('../../gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory');
  const { env } = await import('../../core/env');
  return exclusive(`legacy-${item.id}`, async () => {
    const query = { priceConfigurationItemId: item.id, unitCode, ...combination, perPage: 100 };
    const readSsp = async () => items(await must(await run.http.call('GET /api/standard-selling-prices', {
      token: run.token('cc'), query,
    }), 'giá bán định mức của tổ hợp'));
    const existing = (await readSsp()).find((row) => row.benchmarkPrice != null && row.sellingPrice != null);
    if (existing) return existing.id as string;

    const attributes = Object.fromEntries(Object.entries(combination).map(([key, value]) => [`${key}s`, [value]]));
    const input = { priceConfigurationItemId: item.id, unitCode, unitPrice: LEGACY_PRICE.buy, ...attributes };
    const sheet = await ensureContractorLines(run, env.ref('CONTRACTOR_A_ID'), 'VND', [input], `AT Bảng giá NT_A ${run.id}`);
    const sourceRows = (await sheetItems(run, sheet.id)).filter((row) => matchesPurchaseCombination(row, input));
    const [source] = sourceRows;
    if (sourceRows.length !== 1 || Number(source.unitPrice) !== LEGACY_PRICE.buy) {
      throw new Error(`Không xác định được dòng giá mua 1 VND của fixture cho ${item.code}`);
    }

    // Tổ hợp định mức phải liên kết với đúng dòng giá mua vừa chuẩn bị. Không đổi giá của nguồn dùng chung khác.
    for (let attempt = 0; attempt < 20; attempt++) {
      const candidates = items(await must(await run.http.call('GET /api/standard-buying-prices', {
        token: run.token('cc'), query,
      }), 'giá mua định mức của tổ hợp'));
      for (const sbp of candidates) {
        const detail = await must(await run.http.call('GET /api/standard-buying-prices/{id}/contractors', {
          token: run.token('cc'), params: { id: sbp.id },
        }), 'nguồn của giá mua định mức');
        if (!detail.contractors.some((row: any) => row.id === source.id)) continue;
        const ssp = (await readSsp()).find((row) => row.standardBuyingPriceId === sbp.id);
        if (!ssp) break;
        const missingBuy = sbp.benchmarkPrice == null || sbp.benchmarkMissing;
        const missingSell = ssp.sellingPrice == null || ssp.sellingPriceSet === false;
        if ((missingBuy || missingSell) && detail.contractors.length !== 1) {
          throw new Error(`Tổ hợp định mức ${item.code} còn dùng chung với nguồn khác, cần chuẩn bị giá riêng`);
        }
        if (missingBuy) await setBenchmark(run, sbp.id, LEGACY_PRICE.buy);
        if (missingSell) await setSelling(run, ssp.id, LEGACY_PRICE.sell);
        return ssp.id as string;
      }
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
    throw new Error(`Chưa sinh định mức đúng tổ hợp từ dòng giá mua ${source.code} của ${item.code}`);
  });
}

/**
 * Dòng bắt buộc cho các đầu mục Cố định hoặc Phụ phí đang hoạt động và thuộc phạm vi bảng (đơn giá 0).
 * Đầu mục "AT" của bộ test: dùng dòng có giá sẵn. Đầu mục cũ (không phải "AT"): dùng dòng "Lô hàng" bộ test bổ sung theo tuyến P0, chưa có thì bổ sung.
 */
export async function requiredExtraLines(run: TestRun, key: ServiceKey, attrs: Record<string, unknown>, present: Set<string>): Promise<{ priceConfigurationItemId: string; standardSellingPriceId: string; unitPrice: number }[]> {
  const { configOf } = await import('../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory');
  const { lineAttributes } = await import('../../gia-mua-dau-vao/data/bang-gia-mua.factory');
  const cfg = await configOf(run, key, 'cc');
  const refs = await run.p0Refs();
  const fields = Object.keys(lineAttributes(refs, TABLE_KEY[key])).map((field) => field.slice(0, -1));
  const combination = Object.fromEntries(fields.filter((field) => attrs[field] != null).map((field) => [field, attrs[field]]));
  const out: { priceConfigurationItemId: string; standardSellingPriceId: string; unitPrice: number }[] = [];
  for (const it of cfg.items ?? []) {
    if ((it.status?.code ?? it.status) !== 'ACTIVE' || present.has(it.id)) continue;
    if (it.priceTypeId !== refs.priceTypes.FIXED && it.priceTypeId !== refs.priceTypes.SURCHARGE) continue;
    if (key === 'KB' && !(it.warehouseTypes ?? []).some((type: { id: string; code: string }) =>
      (attrs.warehouseTypeId && type.id === attrs.warehouseTypeId) || (attrs.warehouseTypeCode && type.code === attrs.warehouseTypeCode))) continue;
    let sspId: string;
    if (/^AT /.test(String(it.name))) {
      const existing = items(await must(await run.http.call('GET /api/standard-selling-prices', { token: run.token('cc'), query: { priceConfigurationItemId: it.id, perPage: 1 } }), 'giá bán định mức của đầu mục kiểm thử'));
      if (!existing.length) continue;
      const matching = items(await must(await run.http.call('GET /api/standard-selling-prices', {
        token: run.token('cc'), query: { priceConfigurationItemId: it.id, ...combination, perPage: 100 },
      }), 'giá bán định mức khớp tổ hợp của bảng')).find((row) => row.sellingPrice != null);
      if (!matching) throw new Error(`BGNB chưa có giá bán định mức khớp tổ hợp cho đầu mục ${it.code} ${it.name}`);
      sspId = matching.id;
    } else {
      if (Object.keys(combination).length !== fields.length) throw new Error(`Bảng ${key} thiếu thuộc tính để tạo giá cho ${it.code}`);
      sspId = await priceLegacyItem(run, it, refs.units.storage, combination);
    }
    out.push({ priceConfigurationItemId: it.id, standardSellingPriceId: sspId, unitPrice: 0 });
  }
  return out;
}

/** Body BGNB thủ công: mỗi dịch vụ 1 bảng giá, đơn giá = giá bán định mức (FLOW-QUOTE-002). */
export async function internalQuoteBody(run: TestRun, quotationRequestId: string, ssp: SspMap, o: Record<string, unknown> = {}, services: ServiceKey[] = SERVICE_KEYS) {
  const refs = await run.p0Refs();
  const today = new Date().toISOString().slice(0, 10);
  const validTo = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
  const tables = services
    .map((s) => ({
      serviceTypeCode: refs.services[s],
      name: `AT Bảng giá ${SERVICES[s]} ${run.id}`,
      attributes: tableAttributes(refs, s),
      lines: P0_ITEMS.filter((i) => i.service === s && i.inQuote && ssp[i.key]).map((i) => ({ priceConfigurationItemId: ssp[i.key]!.itemId, standardSellingPriceId: ssp[i.key]!.sspId, unitPrice: ssp[i.key]!.price })),
    }))
    .filter((t) => t.lines.length);
  // Thêm dòng bắt buộc (đầu mục khác đã có giá bán định mức) với đơn giá 0: tổng giá bán giữ đúng bộ P0.
  for (const t of tables) {
    const key = services.find((s) => refs.services[s] === t.serviceTypeCode)!;
    t.lines.push(...(await requiredExtraLines(run, key, t.attributes as Record<string, unknown>, new Set(t.lines.map((l) => l.priceConfigurationItemId)))));
  }
  return { quotationRequestId, name: uniqueInternalQuoteName(run), validFrom: today, validTo, currency: 'VND', terms: 'Điều khoản kiểm thử tự động', tables, ...o };
}

/** Tạo BGNB (Nháp) rồi trả bản ghi mới nhất của YCBG (POST /api/internal-quotes không trả body). */
export async function createInternalQuote(run: TestRun, quotationRequestId: string, ssp: SspMap, role: RoleKey = 'cc', o: Record<string, unknown> = {}): Promise<any> {
  await must(await run.http.call('POST /api/internal-quotes', { token: run.token(role), json: await internalQuoteBody(run, quotationRequestId, ssp, o) }), 'tạo BGNB');
  return must(await run.http.call('GET /api/quotation-requests/{id}/internal-quote', { token: run.token(role), params: { id: quotationRequestId } }), 'đọc BGNB của YCBG');
}

export async function issueInternalQuote(run: TestRun, id: string, role: RoleKey = 'cc'): Promise<void> {
  await must(await run.http.call('POST /api/internal-quotes/{id}/issue', { token: run.token(role), params: { id } }), 'phát hành BGNB');
}
