import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { test, expect, APIResponse } from '@playwright/test';
import { body, data, items, must } from '../../core/base.client';
import { TestRun, blockCase, tagged } from '../../core/fixtures/test-run.fixture';
import { expectApiError, expectStatusIn, stable } from '../../core/assertions';

type Ref = { code: string; name: string; active?: boolean };
export type RuleBody = {
  name: string; executionScope: string; transportModeCode: string; cargoLoadTypeCode: string;
  originPointTypeCode: string; destinationPointTypeCode: string; description: string;
  legs: { id?: string; legTypeCode: string; serviceTypeCodes: string[] }[];
};
const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
const key = (b: RuleBody) => [b.executionScope, b.transportModeCode, b.cargoLoadTypeCode, b.originPointTypeCode, b.destinationPointTypeCode].join('|');

/** Only reserves unused combinations. Existing/seed rules are never edited or deleted. */
export class LegSandbox {
  private readonly owned = new Set<string>();
  constructor(readonly run: TestRun, readonly refs: {
    road: Ref; sea: Ref; full: Ref; partial: Ref; points: Ref[]; borderVn: Ref; inlandVn: Ref;
    atGate: Ref; toInland: Ref; services: Record<string, string>;
  }) {}

  async list(query: Record<string, unknown> = {}): Promise<any> {
    return must(await this.run.http.call('GET /api/leg-rules', { token: this.run.token('admin'), query: { pagination: false, ...query } }), 'đọc danh sách quy tắc');
  }
  async get(code: string): Promise<any> {
    return must(await this.run.http.call('GET /api/leg-rules/{code}', { token: this.run.token('admin'), params: { code } }), `đọc ${code}`);
  }
  async history(code: string, query: Record<string, unknown> = {}): Promise<any> {
    return must(await this.run.http.call('GET /api/leg-rules/{code}/history', { token: this.run.token('admin'), params: { code }, query: { page: 1, perPage: 100, ...query } }), 'đọc lịch sử chặng');
  }
  fromDetail(d: any): RuleBody {
    return {
      name: d.name, executionScope: d.executionScope, transportModeCode: d.transportMode.code,
      cargoLoadTypeCode: d.cargoLoadType.code, originPointTypeCode: d.originPointType.code,
      destinationPointTypeCode: d.destinationPointType.code, description: d.description ?? '',
      legs: d.legs.map((l: any, i: number) => ({ id: l.id, legTypeCode: l.legTypeCode ?? l.legType?.code ?? (i === 0 ? this.refs.atGate.code : this.refs.toInland.code), serviceTypeCodes: l.services.map((s: any) => s.code) })),
    };
  }
  async available(overrides: Partial<RuleBody> = {}): Promise<RuleBody> {
    const used = new Set(items(await this.list()).map((d) => key(this.fromDetail(d))));
    const modes = overrides.transportModeCode ? [overrides.transportModeCode] : [this.refs.road.code, this.refs.sea.code];
    const loads = overrides.cargoLoadTypeCode ? [overrides.cargoLoadTypeCode] : [this.refs.full.code, this.refs.partial.code];
    for (const scope of ['DOMESTIC', 'INTERNATIONAL', 'BORDER_GATE']) {
      for (const mode of modes) for (const load of loads) for (const origin of this.refs.points) for (const destination of this.refs.points) {
        if (scope === 'BORDER_GATE' && (origin.code !== destination.code || !/cua khau/.test(fold(origin.name)))) continue;
        const b: RuleBody = {
          name: tagged('AT Quy tắc chặng'), executionScope: scope,
          transportModeCode: mode, cargoLoadTypeCode: load,
          originPointTypeCode: origin.code, destinationPointTypeCode: destination.code, description: 'Dữ liệu riêng của testcase',
          legs: [
            { legTypeCode: this.refs.atGate.code, serviceTypeCodes: ['KHQ', 'HQGS', 'ST'].map((k) => this.refs.services[k]) },
            { legTypeCode: this.refs.toInland.code, serviceTypeCodes: [this.refs.services.VT] },
          ], ...overrides,
        };
        if (!used.has(key(b))) return b;
      }
    }
    throw new Error('Thiếu tiền điều kiện: không còn tổ hợp 5 trường trống cho quy tắc riêng; không sửa/xóa quy tắc seed để lấy chỗ.');
  }
  async availableDomestic(originPointTypeCode: string): Promise<RuleBody> {
    const common = {
      executionScope: 'DOMESTIC',
      transportModeCode: this.refs.road.code,
      originPointTypeCode,
      destinationPointTypeCode: this.refs.inlandVn.code,
    };
    const rules = items(await this.list()).map((row) => this.fromDetail(row));
    for (const load of [this.refs.full, this.refs.partial]) {
      const profile = { ...common, cargoLoadTypeCode: load.code };
      if (rules.some((rule) => Object.entries(profile).every(([field, value]) => rule[field as keyof RuleBody] === value))) continue;
      return this.available(profile);
    }
    return blockCase('cần một tổ hợp quy tắc Nội địa đường bộ chưa sử dụng với loại điểm đi ' + originPointTypeCode);
  }
  async create(b: RuleBody): Promise<{ response: APIResponse; rule: any }> {
    const response = await this.run.http.call('POST /api/leg-rules', { token: this.run.token('admin'), json: b });
    expectStatusIn(response, '200/201', 'tạo quy tắc riêng');
    const found = items(await this.list({ search: b.name })).filter((d) => d.name === b.name);
    expect(found, 'Đọc lại đúng 1 quy tắc vừa tạo').toHaveLength(1);
    this.owned.add(found[0].code);
    return { response, rule: await this.get(found[0].code) };
  }
  update(code: string, b: RuleBody) {
    return this.run.http.call('PUT /api/leg-rules/{code}', { token: this.run.token('admin'), params: { code }, json: b });
  }
  status(code: string, status: 'ACTIVE' | 'INACTIVE') {
    return this.run.http.call('PATCH /api/leg-rules/{code}/status', { token: this.run.token('admin'), params: { code }, json: { status } });
  }
  remove(code: string) {
    return this.run.http.call('DELETE /api/leg-rules/{code}', { token: this.run.token('admin'), params: { code } });
  }
  async unchanged(code: string) { return { detail: stable(await this.get(code)), history: stable(await this.history(code)) }; }
  async rejectedCreate(b: RuleBody, statuses: string, field?: string) {
    const before = stable(await this.list());
    const response = await this.run.http.call('POST /api/leg-rules', { token: this.run.token('admin'), json: b });
    expectStatusIn(response, statuses);
    const error = await expectApiError(response);
    if (field) {
      const { expectOnlyFieldError } = await import('../../core/assertions');
      expectOnlyFieldError(error, field);
    }
    expect(stable(await this.list()), 'Không tạo/sửa quy tắc khi bị từ chối').toEqual(before);
    return error;
  }
  async simulationInput(profile?: Pick<RuleBody, 'transportModeCode' | 'cargoLoadTypeCode'>): Promise<Record<string, unknown>> {
    const p = await this.run.p0Refs();
    const gate = await this.run.pick('GET /api/catalogues/border-gates', /Hữu Nghị/i);
    return {
      transportModeCode: profile?.transportModeCode ?? p.transportMode,
      cargoLoadTypeCode: profile?.cargoLoadTypeCode ?? p.cargoLoadType,
      origin: { kind: 'BORDER_GATE', borderGateCode: gate.code },
      destination: { kind: 'ADDRESS', countryCode: p.destination.countryCode, provinceCode: p.destination.provinceCode, wardCode: p.destination.wardCode, detail: p.destination.placeName },
      serviceTypeCodes: Object.values(this.refs.services),
    };
  }
  async simulate(input: Record<string, unknown>) {
    return this.run.http.call('POST /api/leg-rules/simulate', { token: this.run.token('admin'), json: input });
  }
  async clean(): Promise<void> {
    // These unused, temporary rules consume a finite unique-key space. Always release only records created here.
    for (const code of [...this.owned].reverse()) {
      const response = await this.remove(code);
      expect([200, 204, 404], `Dọn quy tắc riêng ${code}`).toContain(response.status());
    }
  }
}

export async function withLegSandbox(run: TestRun, fn: (sandbox: LegSandbox) => Promise<void>): Promise<void> {
  test.info().setTimeout(8 * 60_000);
  const dir = path.resolve(__dirname, '../../../.auth');
  fs.mkdirSync(dir, { recursive: true });
  const lock = path.join(dir, 'leg-sandbox.lock');
  const owner = randomUUID();
  const deadline = Date.now() + 6 * 60_000;
  let acquired = false;
  while (Date.now() < deadline) {
    try { fs.writeFileSync(lock, owner, { flag: 'wx' }); acquired = true; break; }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e; }
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!acquired) throw new Error('Hết thời gian chờ fixture quy tắc chặng; kiểm tra lượt chạy khác hoặc lock cũ.');
  let sandbox: LegSandbox | undefined;
  try {
    const catalog = async (api: string): Promise<Ref[]> => items(await must(await run.http.call(api, { token: run.token('admin'), query: { pagination: false, perPage: 100 } }), api));
    const [modes, loads, points, legTypes, p0] = await Promise.all([
      catalog('GET /api/catalogues/transport-modes'), catalog('GET /api/catalogues/cargo-load-types'),
      catalog('GET /api/catalogues/location-point-types'), catalog('GET /api/catalogues/leg-types'), run.p0Refs(),
    ]);
    const pick = (list: Ref[], re: RegExp, label: string) => {
      const ref = list.find((r) => re.test(fold(r.name)) || re.test(fold(r.code)));
      if (!ref) throw new Error(`Thiếu danh mục thật: ${label}`);
      return ref;
    };
    sandbox = new LegSandbox(run, {
      road: pick(modes, /duong bo|^road$/, 'Đường bộ'), sea: pick(modes, /duong bien|^sea$/, 'Đường biển'),
      full: pick(loads, /hang nguyen|^fcl$/, 'Hàng nguyên'), partial: pick(loads, /hang ghep|hang le|^lcl$/, 'Hàng ghép'),
      points, borderVn: pick(points, /cua khau viet nam/, 'Cửa khẩu Việt Nam'), inlandVn: pick(points, /noi dia viet nam/, 'Nội địa Việt Nam'),
      atGate: pick(legTypes, /tai cua khau/, 'Tại Cửa khẩu'), toInland: pick(legTypes, /cua khau.*noi dia/, 'Cửa khẩu đến Nội địa'), services: p0.services,
    });
    await fn(sandbox);
  } finally {
    try { if (sandbox) await sandbox.clean(); }
    finally { if (fs.existsSync(lock) && fs.readFileSync(lock, 'utf8') === owner) fs.rmSync(lock); }
  }
}

export async function expectSuccessEnvelope(response: APIResponse): Promise<any> {
  const b = await body(response);
  expect(b).toMatchObject({ success: true, errorCode: null });
  expect(typeof b.message).toBe('string');
  expect(Object.prototype.hasOwnProperty.call(b, 'data')).toBe(true);
  expect(JSON.stringify(b)).not.toMatch(/java\.lang\.|Traceback|\bat \S+\([^)]*\.java:\d+/);
  return b.data;
}
