import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { CallOptions, FilePart, HttpClient, data, items, must } from '../base.client';
import { stable } from '../assertions';
import { RoleKey } from '../data/accounts';
import { P0ItemKey, P0_ITEMS, P0_NAMES, PRICE_TYPE_NAMES, PriceTypeKey, SERVICES, SERVICE_KEYS, ServiceKey } from '../data/p0-price-set';

/** Mã thật của bộ thuộc tính P0 (xem TestRun.p0Refs). */
export type P0Refs = {
  services: Record<ServiceKey, string>;
  /** Tên quốc gia/tỉnh/xã của nơi lấy, nơi giao (chặng YCBG bắt buộc kèm tên khi là địa chỉ). */
  addressNames: Record<'origin' | 'destination', { countryName: string; provinceName: string; wardName: string }>;
  borderGate: string;
  customsOffice: string;
  tradeType: string;
  cargoGroup: string;
  cargoNature: string;
  packaging: string;
  vehicleType: string;
  transportMode: string;
  cargoLoadType: string;
  transloadPoint: string;
  transloadType: string;
  transloadMethod: string;
  warehouse: string;
  warehouseTypeId: string;
  warehouseTypeCode: string;
  originPoint: string;
  destinationPoint: string;
  origin: Record<string, unknown>;
  destination: Record<string, unknown>;
  priceTypes: Record<PriceTypeKey, string>;
  units: Record<P0ItemKey, string>;
};
import { env } from '../env';
import { Roles, markIncomplete, test as authTest } from './auth.fixture';

export function blockCase(reason: string): never {
  const description = `Blocked (thiếu môi trường): ${reason}`;
  authTest.info().annotations.push({ type: 'Blocked', description });
  authTest.skip(true, description);
  throw new Error(description);
}

export function blockedUnless(names: string[]): void {
  const missing = names.filter((name) => !process.env[name]?.trim());
  if (missing.length) blockCase(`cần ${missing.join(', ')} trong .env`);
}

/** Chỉ ghi ảnh chuẩn khi người chạy chủ động chọn cập nhật snapshot. */
export function requireVisualBaseline(name: string): void {
  const info = authTest.info();
  const mode = info.config.updateSnapshots;
  if (mode !== 'all' && mode !== 'changed' && !fs.existsSync(info.snapshotPath(name))) {
    blockCase(`chưa có ảnh chuẩn ${name}. Tạo và duyệt ảnh bằng --update-snapshots=changed.`);
  }
}

const AUTH_DIR = path.resolve(__dirname, '../../../.auth');

/** Mã lần chạy, gắn vào tên dữ liệu để nhận diện và dọn dữ liệu test. Project setup ghi vào .auth/run.json để mọi worker dùng chung. */
export const TEST_RUN_ID: string = (() => {
  if (process.env.TEST_RUN_ID) return process.env.TEST_RUN_ID;
  try {
    return (JSON.parse(fs.readFileSync(path.join(AUTH_DIR, 'run.json'), 'utf-8')) as { runId: string }).runId;
  } catch {
    return `at${Date.now().toString(36)}`;
  }
})();

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Dữ liệu nền dùng chung giữa các worker (vd bộ giá P0 và RC của KH_A): dựng 1 lần dưới khóa file, lưu vào .auth/shared-<key>.json.
 * `valid` kiểm bản đã lưu còn dùng được không (vd RC còn ACTIVE); không còn thì dựng lại.
 */
export async function shared<T>(key: string, build: () => Promise<T>, valid: (v: T) => Promise<boolean> = async () => true): Promise<T> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const file = path.join(AUTH_DIR, `shared-${key}.json`);
  const lock = `${file}.lock`;
  const deadline = Date.now() + 10 * 60_000;
  while (Date.now() < deadline) {
    if (fs.existsSync(file)) {
      const v = JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
      if (await valid(v)) return v;
    }
    let fd: number | undefined;
    try {
      fd = fs.openSync(lock, 'wx');
    } catch {
      const age = Date.now() - (fs.existsSync(lock) ? fs.statSync(lock).mtimeMs : Date.now());
      if (age > 8 * 60_000) fs.rmSync(lock, { force: true });
      await pause(1000);
      continue;
    }
    try {
      if (fs.existsSync(file)) {
        const v = JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
        if (await valid(v)) return v;
      }
      const v = await build();
      fs.writeFileSync(file, JSON.stringify(v, null, 2));
      return v;
    } finally {
      fs.closeSync(fd);
      fs.rmSync(lock, { force: true });
    }
  }
  throw new Error(`Hết thời gian chờ dựng dữ liệu nền "${key}"`);
}

// ---------- sinh dữ liệu: số ngẫu nhiên, chuỗi có nghĩa ----------
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function randMoney(min = 100_000, max = 5_000_000, step = 10_000): number {
  return Math.round(randInt(min, max) / step) * step;
}
export function uuid(): string {
  return randomUUID();
}
/** Gắn mã lần chạy và 4 ký tự ngẫu nhiên vào chuỗi có nghĩa, ví dụ "AT Phát sinh KHQ at1x2y-k3f9". */
export function tagged(text: string): string {
  return `${text} ${TEST_RUN_ID}-${Math.random().toString(36).slice(2, 6)}`;
}
/**
 * Chuỗi tiếng Việt có nghĩa đúng `length` ký tự (dấu cách tính 1 ký tự), không bắt đầu/kết thúc bằng dấu cách
 * vì hệ thống cắt khoảng trắng hai đầu khi lưu. Gắn mã lần chạy ở đầu để không trùng tên.
 */
export function textOfLength(length: number, seed = 'Công ty cổ phần giao nhận vận tải quốc tế Việt Trung '): string {
  let s = `${TEST_RUN_ID} `;
  while (s.length < length) s += seed;
  s = s.slice(0, length).normalize('NFC');
  if (length > 0 && /\s/.test(s[0])) s = 'x' + s.slice(1);
  if (length > 1 && /\s/.test(s[s.length - 1])) s = s.slice(0, -1) + 'x';
  return s;
}
export function today(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}
/** Body JSON hỏng cú pháp cho case "Body JSON hỏng cú pháp". */
export const MALFORMED_JSON = '{"name": ';

/** File PDF hợp lệ nhỏ (mở được), thêm `padBytes` để đạt dung lượng mong muốn. */
export function samplePdf(name = 'chung-tu.pdf', padBytes = 0): FilePart {
  const head = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n';
  const pad = padBytes > 0 ? Buffer.alloc(padBytes, 0x20) : Buffer.alloc(0);
  return { name, mimeType: 'application/pdf', buffer: Buffer.concat([Buffer.from(head), pad, Buffer.from('%%EOF\n')]) };
}

const MIME: Record<string, string> = {
  pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif', bmp: 'image/bmp',
  svg: 'image/svg+xml', zip: 'application/zip', rar: 'application/vnd.rar', '7z': 'application/x-7z-compressed', exe: 'application/x-msdownload',
  mp4: 'video/mp4', txt: 'text/plain', csv: 'text/csv', html: 'text/html', json: 'application/json', xml: 'application/xml',
};

/** File thật người dùng chuẩn bị: `upload/...` trong UPLOAD_FILES_DIR, `size/...` trong SIZE_FILES_DIR (như bộ auto-tests). */
export function realFile(rel: string): FilePart {
  const [kind, ...rest] = rel.split('/');
  const baseDir = kind === 'size' ? process.env.SIZE_FILES_DIR || 'G:/test-size-files' : process.env.UPLOAD_FILES_DIR || 'G:/upload-test-files';
  const file = path.join(baseDir, ...rest);
  if (!fs.existsSync(file)) throw new Error(`Thiếu file test: ${file} (khai báo thư mục trong .env: UPLOAD_FILES_DIR / SIZE_FILES_DIR)`);
  const ext = path.extname(file).slice(1).toLowerCase();
  return { name: path.basename(file), mimeType: MIME[ext] ?? 'application/octet-stream', buffer: fs.readFileSync(file) };
}

/** Bộ file thật theo tên trong bộ case: REAL.pdf10 = PDF 10MB, REAL.pdf11 = 11MB, REAL.pdf20/21 = 20/21MB, REAL.other(ext) = 1MB. */
export const REAL = {
  pdf10: () => realFile('upload/upload_test_10mb.pdf'),
  pdf11: () => realFile('upload/upload_test_11mb.pdf'),
  docx10: () => realFile('upload/upload_test_10mb.docx'),
  jpg10: () => realFile('upload/upload_test_10mb.jpg'),
  png10: () => realFile('upload/upload_test_10mb.png'),
  xlsx10: () => realFile('upload/upload_test_10mb.xlsx'),
  zip10: () => realFile('upload/upload_test_10mb.zip'),
  pdf20: () => realFile('size/test-upload-20mb.pdf'),
  pdf21: () => realFile('size/test-upload-21mb.pdf'),
  docx20: () => realFile('size/test-upload-20mb.docx'),
  docx21: () => realFile('size/test-upload-21mb.docx'),
  other: (ext: string) => realFile(`upload/other-formats-1mb/upload_test_1mb.${ext}`),
};

/** SHA-256 của nội dung file (so file tải về với file đã tải lên). */
export function sha256(buf: Buffer): string {
  return require('crypto').createHash('sha256').update(buf).digest('hex');
}

/** File có đúng `bytes` byte (cho case giới hạn dung lượng): PDF hợp lệ được độn khoảng trắng. */
export function fileOfSize(name: string, bytes: number, mimeType = 'application/pdf'): FilePart {
  const base = samplePdf(name);
  const pad = Math.max(0, bytes - base.buffer.length);
  const f = samplePdf(name, pad);
  return { ...f, mimeType, buffer: f.buffer.subarray(0, bytes) };
}

// ---------- tìm id thật cho tham số đường dẫn ----------
type OpenApi = { paths: Record<string, Record<string, { parameters?: { name: string; in: string; required?: boolean; schema?: any }[] }>> };
let spec: OpenApi | undefined;
function openapi(): OpenApi {
  if (!spec) spec = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../test-data/openapi.json'), 'utf-8')) as OpenApi;
  return spec;
}
const norm = (p: string) => p.replace(/\{[^}]*\}/g, '{}');
function getPath(tplWithValues: string): string | undefined {
  const target = norm(tplWithValues);
  return Object.keys(openapi().paths).find((p) => norm(p) === target && openapi().paths[p].get);
}
/** Tham số query bắt buộc của một API (để case phủ định chỉ bỏ đúng tham số đang test). */
export function requiredQuery(api: string): string[] {
  const [m, p] = api.split(' ');
  const real = Object.keys(openapi().paths).find((x) => norm(x) === norm(p));
  return (openapi().paths[real ?? '']?.[m.toLowerCase()]?.parameters ?? []).filter((x) => x.in === 'query' && x.required).map((x) => x.name);
}
const FIXED_PARAMS: Record<string, string | number> = { role: 'HANDOVER', pairIndex: 0, currency: 'USD' };
const camel = (s: string) => s.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());

/** Giá trị mẫu cho tham số query bắt buộc (case phủ định chỉ bỏ hoặc làm sai đúng 1 tham số). */
function sampleQuery(name: string): unknown {
  if (/page$/i.test(name)) return 1;
  if (/perPage|size|limit/i.test(name)) return 20;
  if (/from|date/i.test(name)) return today(-30);
  if (/to$/i.test(name)) return today();
  return 'AT';
}

export type Prepared = CallOptions & { token: string };

/** Chuẩn bị dữ liệu và dọn dữ liệu cho từng test. */
export class TestRun {
  readonly id = TEST_RUN_ID;
  private readonly cleanups: { label: string; fn: () => Promise<unknown> }[] = [];
  private static serviceCache: Record<string, string> | undefined;
  private static paramCache = new Map<string, Record<string, string | number>>();

  constructor(readonly http: HttpClient, readonly roles: Roles) {}

  token(role: RoleKey): string {
    return this.roles[role].accessToken;
  }

  /** Ghi nhận việc dọn dữ liệu; chỉ chạy khi ALLOW_CLEANUP=true. */
  track(label: string, fn: () => Promise<unknown>): void {
    this.cleanups.push({ label, fn });
  }

  async cleanup(): Promise<void> {
    if (!env.allowCleanup) return;
    for (const c of this.cleanups.reverse()) {
      try {
        await c.fn();
      } catch (e) {
        console.warn(`Dọn dữ liệu "${c.label}" lỗi: ${(e as Error).message}`);
      }
    }
  }

  private static catalogCache = new Map<string, any[]>();

  /**
   * Danh mục, lưu đệm theo đường dẫn + tham số. API giới hạn perPage ≤ 100 (trả 400 nếu lớn hơn), nên đọc lần lượt từng trang 100 dòng
   * tới hết (theo meta.pagination.totalPages, hoặc khi trang trả ít hơn 100 dòng).
   */
  async catalog(api: string, query: Record<string, unknown> = {}): Promise<any[]> {
    const key = `${api} ${JSON.stringify(query)}`;
    const hit = TestRun.catalogCache.get(key);
    if (hit) return hit;
    const list: any[] = [];
    for (let page = 1; page <= 100; page++) {
      const d = await must(await this.http.call(api, { token: this.token('admin'), query: { page, perPage: 100, ...query } }), `danh mục ${api}`);
      const rows = items(d);
      list.push(...rows);
      const pages = Number(d?.meta?.pagination?.totalPages);
      if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break;
    }
    TestRun.catalogCache.set(key, list);
    return list;
  }

  /** Bản ghi danh mục đang hoạt động có tên khớp; không có thì báo rõ tên cần có. */
  async pick(api: string, name: RegExp, query: Record<string, unknown> = {}): Promise<any> {
    const list = (await this.catalog(api, query)).filter((x: any) => x.active !== false);
    const hit = list.find((x: any) => name.test(String(x.name ?? '')) || name.test(String(x.shortName ?? '')));
    if (!hit) throw new Error(`Danh mục ${api} không có mục đang hoạt động khớp ${name} (dữ liệu tuyến và thuộc tính P0 của bộ case)`);
    return hit;
  }

  /** Mã thật của tuyến và thuộc tính P0, đơn vị tính và loại giá; dùng chung cho bảng giá mua, YCBG, BGNB, phiếu để thuộc tính khớp nhau. */
  async p0Refs(): Promise<P0Refs> {
    if (TestRun.refsCache) return TestRun.refsCache;
    const services = {} as Record<ServiceKey, string>;
    for (const k of SERVICE_KEYS) services[k] = await this.serviceCode(k);
    // Điểm vận tải là vùng (tỉnh + danh sách xã/phường). Nơi lấy và nơi giao của YCBG/Phiếu phải là địa chỉ lấy trực tiếp
    // từ hai vùng này; không dùng Cửa khẩu Hữu Nghị thay cho điểm vận tải Hữu Nghị Quan vì hai danh mục có phạm vi khác nhau.
    const originZone = await this.pick('GET /api/catalogues/transport-points', P0_NAMES.originPoint);
    const destZone = await this.pick('GET /api/catalogues/transport-points', P0_NAMES.destinationPoint);
    const wardsOf = (zone: any) => (zone.wards ?? []).filter((ward: any) => ward.active !== false && ward.code);
    const [originWard] = wardsOf(originZone);
    const [destWard] = wardsOf(destZone);
    const originProvince = originZone.province;
    const destProvince = destZone.province;
    if (!originProvince?.code || !originWard?.code) throw new Error(`Điểm vận tải ${originZone.code} chưa có tỉnh và xã/phường hợp lệ để chọn nơi lấy P0`);
    if (!destProvince?.code || !destWard?.code) throw new Error(`Điểm vận tải ${destZone.code} chưa có tỉnh và xã/phường hợp lệ để chọn nơi giao P0`);
    const gates = (await this.catalog('GET /api/catalogues/border-gates')).filter((gate: any) => gate.active !== false && gate.code);
    const gate = gates.find((item: any) => P0_NAMES.borderGate.test(String(item.name ?? '')));
    if (!gate?.code) throw new Error('Thiếu Cửa khẩu Hữu Nghị dùng cho thuộc tính hải quan của bộ P0');
    const priceTypes = {} as Record<PriceTypeKey, string>;
    for (const [k, rx] of Object.entries(PRICE_TYPE_NAMES)) priceTypes[k as PriceTypeKey] = (await this.pick('GET /api/catalogues/price-types', rx)).id;
    const units = {} as Record<P0ItemKey, string>;
    for (const it of P0_ITEMS) units[it.key] = (await this.pick('GET /api/catalogues/units', it.unit, { serviceTypeCode: services[it.service] }).catch(() => this.pick('GET /api/catalogues/units', it.unit))).code;
    // `shiftStorage` là khóa legacy của fixture. Đầu mục Phát sinh KHQ thực tế được
    // chọn từ variance-items và dùng ĐVT hợp lệ của KHQ, không dùng chéo ĐVT "Ca"
    // của đầu mục Vận tải đã ngừng hoạt động.
    units.shiftStorage = units.customsFee;
    const whType = await this.pick('GET /api/catalogues/warehouse-types', P0_NAMES.warehouseType);
    const refs: P0Refs = {
      services,
      borderGate: gate.code,
      customsOffice: (await this.pick('GET /api/catalogues/customs-offices', P0_NAMES.customsOffice)).code,
      tradeType: (await this.pick('GET /api/catalogues/trade-types', P0_NAMES.tradeType)).code,
      cargoGroup: (await this.pick('GET /api/catalogues/cargo-groups', P0_NAMES.cargoGroup)).code,
      cargoNature: (await this.pick('GET /api/catalogues/cargo-natures', P0_NAMES.cargoNature)).code,
      packaging: (await this.pick('GET /api/catalogues/packaging-types', P0_NAMES.packaging)).code,
      vehicleType: (await this.pick('GET /api/catalogues/vehicle-types', P0_NAMES.vehicleType)).code,
      transportMode: (await this.pick('GET /api/catalogues/transport-modes', P0_NAMES.transportMode)).code,
      cargoLoadType: (await this.pick('GET /api/catalogues/cargo-load-types', P0_NAMES.cargoLoadType)).code,
      transloadPoint: (await this.pick('GET /api/catalogues/transload-points', P0_NAMES.transloadPoint)).code,
      transloadType: (await this.pick('GET /api/catalogues/transload-types', P0_NAMES.transloadType)).code,
      transloadMethod: (await this.pick('GET /api/catalogues/transload-methods', P0_NAMES.transloadMethod)).code,
      warehouse: (await this.pick('GET /api/catalogues/warehouses', P0_NAMES.warehouse)).code,
      warehouseTypeId: whType.id,
      warehouseTypeCode: whType.code,
      originPoint: originZone.code,
      destinationPoint: destZone.code,
      origin: { pointType: 'ADDRESS', countryCode: originZone.country?.code ?? 'VN', provinceCode: originProvince.code, wardCode: originWard.code, placeName: originZone.name || originWard.name },
      destination: { pointType: 'ADDRESS', countryCode: destZone.country?.code ?? 'VN', provinceCode: destProvince.code, wardCode: destWard.code, placeName: destZone.name || destWard.name },
      addressNames: {
        origin: { countryName: originZone.country?.name ?? 'Việt Nam', provinceName: originProvince?.name ?? '', wardName: originWard?.name ?? '' },
        destination: { countryName: destZone.country?.name ?? 'Việt Nam', provinceName: destProvince.name ?? '', wardName: destWard.name ?? '' },
      },
      priceTypes,
      units,
    };
    TestRun.refsCache = refs;
    return refs;
  }
  private static refsCache: P0Refs | undefined;

  /** Mã loại hình dịch vụ thật theo tên trong danh mục (KHQ → "Khai báo hải quan"...). */
  async serviceCode(key: ServiceKey): Promise<string> {
    if (!TestRun.serviceCache) {
      const list = await this.catalog('GET /api/catalogues/service-types');
      TestRun.serviceCache = {};
      for (const [k, name] of Object.entries(SERVICES)) {
        const hit = list.find((s: any) => String(s.name ?? '').toLowerCase() === name.toLowerCase()) ?? list.find((s: any) => String(s.name ?? '').toLowerCase().includes(name.toLowerCase()));
        if (hit) TestRun.serviceCache[k] = hit.code;
      }
    }
    const code = TestRun.serviceCache[key];
    if (!code) throw new Error(`Danh mục loại hình dịch vụ không có "${SERVICES[key]}"`);
    return code;
  }

  /**
   * Tham số đường dẫn bằng dữ liệu thật đang có: id cha lấy từ API danh sách cùng nhánh, id con lấy từ danh sách con
   * hoặc mảng cùng tên trong bản ghi cha. Dùng cho case chỉ cần "id dữ liệu thật" (Authentication, sai định dạng, không tồn tại, sai phương thức, cấu trúc phản hồi của API đọc).
   */
  async prepare(api: string, role: RoleKey): Promise<Prepared> {
    const token = this.token(role);
    const [, tpl] = api.split(' ');
    const names = [...tpl.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    const query = Object.fromEntries(requiredQuery(api).map((n) => [n, sampleQuery(n)]));
    if (!names.length) return { token, params: {}, query };
    const key = `${role} ${norm(tpl)}`;
    const cached = TestRun.paramCache.get(key);
    if (cached) return { token, params: { ...cached }, query };
    const params: Record<string, string | number> = {};
    for (const name of names) params[name] = await this.resolveParam(tpl, name, params, token);
    TestRun.paramCache.set(key, params);
    return { token, params: { ...params }, query };
  }

  private async resolveParam(tpl: string, name: string, known: Record<string, string | number>, token: string): Promise<string | number> {
    if (name in FIXED_PARAMS) return FIXED_PARAMS[name];
    const idx = tpl.indexOf(`{${name}}`);
    const prefix = tpl.slice(0, idx).replace(/\/$/, '');
    const fill = (p: string) => p.replace(/\{(\w+)\}/g, (_m, k: string) => String(known[k]));
    const pick = (row: any) => (row ? row[name] ?? row.id ?? row.code ?? row.version ?? row.serviceTypeCode : undefined);

    // Một số API chi tiết không có API danh sách dùng được nếu thiếu bộ lọc bắt buộc
    // (đặc biệt SBP/SSP). Tái sử dụng đúng bản ghi nền đã được flow P0 tạo thay vì
    // đoán UUID hoặc tạo thêm dữ liệu danh mục/cấu hình giá.
    if (name === 'id') {
      const readJson = (file: string): any | undefined => {
        try { return JSON.parse(fs.readFileSync(path.join(AUTH_DIR, file), 'utf8')); } catch { return undefined; }
      };
      const p0 = readJson('shared-p0-base.json');
      const flow = readJson('xuyen-module-flow-state.json');
      const firstValue = (value: unknown): string | undefined => {
        if (!value || typeof value !== 'object') return undefined;
        return Object.values(value as Record<string, unknown>).find((x): x is string => typeof x === 'string' && x.length > 0);
      };
      const persisted =
        (tpl.startsWith('/api/standard-selling-prices/{id}') ? firstValue(p0?.ssp) : undefined) ??
        (tpl.startsWith('/api/standard-buying-prices/{id}') ? firstValue(p0?.sbp) : undefined) ??
        (tpl.startsWith('/api/purchase-prices/{id}') ? p0?.sheetA : undefined) ??
        (tpl.startsWith('/api/quotation-requests/{id}') ? p0?.rfqId : undefined) ??
        (tpl.startsWith('/api/internal-quotes/{id}') ? p0?.internalQuoteId : undefined) ??
        (tpl.startsWith('/api/customer-quotations/{id}') ? p0?.rcId : undefined) ??
        (tpl.startsWith('/api/service-orders/{id}') || tpl.startsWith('/api/k3/service-orders/{id}') ? flow?.order?.id : undefined);
      if (typeof persisted === 'string' && persisted) return persisted;
    }
    // Mã dịch vụ trong phiếu: lấy dịch vụ đầu tiên của bản ghi cha.
    if (name === 'type' || name === 'serviceTypeCode') {
      const parent = getPath(prefix.replace(/\/services$/, '').replace(/\/revenue$/, ''));
      if (parent) {
        const d = await data(await this.http.call(`GET ${parent}`, { token, params: known }));
        const svc = items(d?.services ?? d?.serviceTypes ?? d?.items ?? [])[0];
        const code = svc?.serviceTypeCode ?? svc?.code ?? svc?.typeCode;
        if (code) return code;
      }
      return this.serviceCode('KHQ');
    }
    const list = getPath(prefix);
    if (list) {
      const res = await this.http.call(`GET ${list}`, { token, params: known, query: { perPage: 20 } });
      if (res.ok()) {
        const v = pick(items(await data(res))[0]);
        if (v !== undefined) return v;
      }
    }
    // Không có danh sách riêng: tìm mảng cùng tên trong bản ghi cha (vd documents trong chi tiết phiếu).
    const segment = prefix.split('/').pop() ?? '';
    const parent = getPath(prefix.slice(0, prefix.lastIndexOf('/')));
    if (parent) {
      const d = await data(await this.http.call(`GET ${parent}`, { token, params: known }));
      const arr = d?.[camel(segment)] ?? d?.[segment];
      const v = pick(items(arr)[0]);
      if (v !== undefined) return v;
    }
    throw new Error(`Không tìm được dữ liệu thật cho {${name}} của ${tpl} (${fill(prefix)}): hãy chạy luồng tests/flows/xuyen-module trước để có dữ liệu nền.`);
  }

  /**
   * Ảnh chụp dữ liệu đọc lại được để kiểm "dữ liệu, trạng thái và lịch sử không đổi": GET của bản ghi (cùng đường dẫn hoặc bản ghi cha gần nhất
   * có đủ tham số) và GET .../history của bản ghi đó nếu Swagger có. Không dùng cho danh sách dùng chung (đổi khi chạy song song).
   */
  async snapshot(api: string, params: Record<string, string | number>, role: RoleKey): Promise<unknown> {
    let tpl = api.split(' ')[1];
    // Một số thao tác ảnh hưởng cấu hình hoặc phiên hiện tại, không có ID trên đường dẫn ghi.
    if (tpl.startsWith('/api/auth/')) tpl = '/api/auth/me';
    const isSingleton = tpl === '/api/auth/me' || tpl === '/api/admin/settings';
    while (tpl.includes('/')) {
      const real = getPath(tpl);
      const keys = [...(real ?? '').matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      if (real && (keys.length || isSingleton) && keys.every((key) => key in params) && !requiredQuery(`GET ${real}`).length) {
        const readApi = `GET ${real}`;
        const read = await must(await this.http.call(readApi, { token: this.token(role), params, retryUnauthorized: real !== '/api/auth/me' }), `ảnh chụp ${readApi}`);
        if (read == null) throw new Error(`Ảnh chụp ${readApi} không có dữ liệu để đối chiếu`);
        const shot: Record<string, unknown> = { api: readApi, data: stable(read) };
        const hist = getPath(`${real}/history`);
        if (hist) {
          const historyApi = `GET ${hist}`;
          const history = await must(await this.http.call(historyApi, { token: this.token(role), params, query: { page: 1, perPage: 100 } }), `ảnh chụp ${historyApi}`);
          if (history == null) throw new Error(`Ảnh chụp ${historyApi} không có dữ liệu để đối chiếu`);
          shot.history = stable(history);
        }
        return shot;
      }
      tpl = tpl.slice(0, tpl.lastIndexOf('/'));
    }
    markIncomplete(`Chưa đối chiếu được dữ liệu trước/sau ${api}: không có GET phù hợp cho bản ghi.`);
    return null;
  }

  /** Đọc hết danh sách để kiểm marker riêng của case; lỗi GET không được xem là không tìm thấy. */
  async listContains(listApi: string, marker: string, role: RoleKey, params: Record<string, string | number> = {}): Promise<boolean> {
    if (!marker.trim()) throw new Error(`Thiếu marker để kiểm ${listApi}`);
    const pageSize = 100;
    for (let page = 1; page <= 1000; page++) {
      const d = await must(await this.http.call(listApi, { token: this.token(role), params, query: { page, perPage: pageSize } }), `đọc danh sách ${listApi}`);
      if (!d || typeof d !== 'object') throw new Error(`Không có dữ liệu danh sách hợp lệ từ ${listApi}`);
      if (JSON.stringify(d).includes(marker)) return true;
      const pagination = d.meta?.pagination ?? d.pagination;
      const pages = pagination?.totalPages;
      if (typeof pages === 'number' && Number.isFinite(pages)) {
        if (page >= pages) return false;
      } else if (Array.isArray(d) || items(d).length < pageSize) {
        return false;
      }
    }
    throw new Error(`Vượt 1000 trang khi tìm marker trong ${listApi}`);
  }

  /** Tạo bản ghi qua API, bắt buộc thành công (lỗi là lỗi chuẩn bị dữ liệu, không phải kết quả của case). */
  async create(api: string, role: RoleKey, opts: CallOptions, what: string): Promise<any> {
    return must(await this.http.call(api, { ...opts, token: this.token(role) }), what);
  }
}

export const test = authTest.extend<{ testRun: TestRun }>({
  testRun: async ({ http, roles }, use) => {
    const run = new TestRun(http, roles);
    await use(run);
    await run.cleanup();
  },
});

export { expect } from '@playwright/test';
