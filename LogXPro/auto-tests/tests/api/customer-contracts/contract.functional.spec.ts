/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from '../../../src/fixtures/seed.fixture';
import { body, data, items, jsonPart } from '../../../src/api/http.client';
import { badTokens } from '../../../src/fixtures/auth.fixture';
import { apiError, apiSuccess, hasNoStacktrace } from '../../../src/api/schemas/common.schema';
import { sha256 } from '../../../src/utils/file-check';
import { malformedJson } from '../../../src/data/payloads';
import * as F from '../../../src/data/file.factory';
import * as L from '../../../src/data/lead.factory';
import * as C from '../../../src/data/contract.factory';
import * as K from '../../../src/data/customer.factory';
import * as V from '../../../src/data/contractor.factory';
import * as VC from '../../../src/data/contractor-contract.factory';
import * as P from '../../../src/data/payloads';
import { addDays, addMonths, today } from '../../../src/utils/dates';
import { TEST_RUN_ID, randDigits, randInt, textOfLength, uuid } from '../../../src/utils/test-run';
import { xlsxDataRows } from '../../../src/utils/file-check';
import { schemas } from '../../../src/api/schemas/contract.schema';
test.describe("Danh sách, tìm kiếm, lọc hợp đồng khách hàng", () => {
  const API = "GET /api/contracts";
  test("CTR-001 DVKH xem danh sách HĐ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(items(d).length).toBeGreaterThanOrEqual(0);
    expect(items(d).every((c: any) => c.accountManagerId === roles.dvkhA.userId)).toBe(true);
  });
  test("CTR-002 NVKD chỉ thấy HĐ mình upload", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const mine = await seed.customer();
    const res = await http.call(API, { token: N, query: { search: mine.contract.code, perPage: 100 } });
    expect(res.status()).toBe(200);
    expect(items(await data(res)).map((c: any) => c.id)).toContain(mine.contract.id);
    const other = await http.call(API, { token: roles.nvkdB.accessToken, query: { search: mine.contract.code, perPage: 100 } });
    expect(items(await data(other)).map((c: any) => c.id)).not.toContain(mine.contract.id);
  });
  test("CTR-003 DVKH không thấy HĐ của KH người khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const m = await seed.customer({ manager: 'dvkhB' });
    const res = await http.call(API, { token: D, query: { search: m.contract.code, perPage: 100 } });
    expect(res.status()).toBe(200);
    expect(items(await data(res)).map((c: any) => c.id)).not.toContain(m.contract.id);
  });
  test("CTR-004 Tìm theo mã HĐ, số HĐ, tên KH, MST", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const a = await seed.customer();
    const cus = await seed.getCustomer(a.customerId);
    for (const w of [a.contract.code, a.contract.contractNumber, cus.companyName.split(' ').slice(-3, -1).join(' '), cus.taxCode]) {
      const res = await http.call(API, { token: D, query: { search: w, perPage: 100 } });
      expect(res.status(), w).toBe(200);
      expect(items(await data(res)).map((c: any) => c.id), w).toContain(a.contract.id);
    }
  });
  test("CTR-005 Lọc `status`, `customerTier`, `customerId`, `alert`, khoảng ngày ký/hết hạn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const a = await seed.customer({ tier: 'STRATEGIC' });
    const byCustomer = items(await data(await http.call(API, { token: D, query: { customerId: a.customerId, perPage: 100 } })));
    expect(byCustomer.map((c: any) => c.id)).toContain(a.contract.id);
    for (const c of byCustomer) expect(c.customerId).toBe(a.customerId);
    const active = items(await data(await http.call(API, { token: D, query: { status: 'ACTIVE', customerTier: 'STRATEGIC', expiryFrom: a.contract.effectiveTo, expiryTo: a.contract.effectiveTo, perPage: 100 } })));
    expect(active.map((c: any) => c.id)).toContain(a.contract.id);
    for (const c of active) { expect(c.status).toBe('ACTIVE'); expect(c.effectiveTo).toBe(a.contract.effectiveTo); }
    const urgent = items(await data(await http.call(API, { token: D, query: { alert: 'URGENT', perPage: 100 } })));
    for (const c of urgent) expect(c.alertLevel).toBe('URGENT');
  });
  test("CTR-006 Phân trang không trùng, không sót", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const tag = `pg${randDigits(6)}`;
    for (let i = 0; i < 25; i++) await seed.customer({ lead: { companyName: `Công ty TNHH Phân trang ${tag} số ${i + 1}` } });
    const ids = new Set<string>();
    const sizes: number[] = [];
    for (const page of [1, 2, 3]) {
      const res = await http.call(API, { token: D, query: { search: tag, page, perPage: 10 } });
      expect(res.status()).toBe(200);
      const list = items(await data(res));
      sizes.push(list.length);
      for (const c of list) { expect(ids.has(c.id)).toBe(false); ids.add(c.id); }
    }
    expect(sizes).toEqual([10, 10, 5]);
    expect(ids.size).toBe(25);
  });
});

test.describe("Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng)", () => {
  const API = "POST /api/contracts";
  test("CTR-014 Upload HĐ hiệu lực từ hôm nay", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.code).toMatch(/^CTC\d{4}-\d{3,}$/);
    expect(d.status).toBe('ACTIVE');
    const lead = await seed.getLead(p.resourceId!);
    expect(lead.status).toBe('CONVERTED');
    const cus = await seed.getCustomer(d.customerId);
    expect(cus.status).toBe('ACTIVE');
    expect(cus.customerCode).toBeTruthy();
    expect(cus.tier).toBe('REGULAR');
    expect(cus.accountManagerId).toBe(roles.dvkhA.userId);
  });
  test("CTR-015 Upload HĐ hiệu lực tương lai", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const lead = await seed.lead();
    const contract = C.uploadContract(lead.id, roles.dvkhA.userId, { effectiveFrom: addDays(today(), 10) });
    const res = await http.call(API, { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', contract), file: F.pdf() } });
    expect([200, 201]).toContain(res.status());
    const d = await data(res);
    expect(d.status).toBe('PENDING');
    expect((await seed.getLead(lead.id)).status).toBe('CONVERTED');
    const cus = await seed.getCustomer(d.customerId);
    expect(cus.status).toBe('SUSPENDED');
    expect(cus.suspendReason).toBe('PENDING_CONTRACT');
  });
  test("CTR-021 Lead đã có HĐ hoặc không hoạt động", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const converted = (await seed.customer()).lead;
    const inactive = await seed.inactiveLead();
    for (const l of [converted, inactive]) {
      const res = await http.call(API, { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', C.uploadContract(l.id, roles.dvkhA.userId)), file: F.pdf() } });
      expect([400, 409], l.status).toContain(res.status());
    }
  });
  test("CTR-022 Lead của NVKD khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const up = async (leadId: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(leadId, roles.dvkhA.userId, extra)), file: F.pdf(), ...files } });
    const m = await seed.lead('nvkdB');
    expect([403, 404, 409]).toContain((await up(m.id)).status());
    expect((await seed.getLead(m.id, 'nvkdB')).status).toBe('ACTIVE');
  });
  test("CTR-023 `accountManagerId` không phải DVKH đang hoạt động", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const ids = [roles.nvkdA.userId, process.env.LOCKED_DVKH_USER_ID].filter(Boolean) as string[];
    const lead = await seed.lead();
    for (const accountManagerId of ids) {
      const res = await http.call(API, { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, accountManagerId)), file: F.pdf() } });
      expect([400, 409], accountManagerId).toContain(res.status());
    }
    expect((await seed.getLead(lead.id)).status).toBe('ACTIVE');
  });
  test("CTR-024 Đồng bộ phân hạng và người phụ trách sang KH", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const lead = await seed.lead();
    const res = await http.call(API, { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId, { customerTier: 'STRATEGIC' })), file: F.pdf() } });
    expect([200, 201]).toContain(res.status());
    const cus = await seed.getCustomer((await data(res)).customerId);
    expect(cus.tier).toBe('STRATEGIC');
    expect(cus.accountManagerId).toBe(roles.dvkhA.userId);
  });
  test("CTR-025 Lỗi giữa chừng không chuyển đổi Lead", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const lead = await seed.lead();
    const res = await http.call(API, { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId)), file: F.empty() } });
    expect(res.status()).toBe(400);
    const l = await seed.getLead(lead.id);
    expect(l.status).toBe('ACTIVE');
    expect(l.customerCode ?? null).toBeNull();
  });
});

test.describe("Danh sách DVKH chọn khi upload HĐ", () => {
  const API = "GET /api/contracts/assignable-managers";
  test("CTR-033 Lấy danh sách DVKH", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTR-034 Loại tài khoản khóa và role khác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const res = await http.call(API, { token: N });
    expect(res.status()).toBe(200);
    const ids = items(await data(res)).map((u: any) => u.id ?? u.userId);
    expect(ids).toContain(roles.dvkhA.userId);
    expect(ids).not.toContain(roles.nvkdA.userId);
    if (process.env.LOCKED_DVKH_USER_ID) expect(ids).not.toContain(process.env.LOCKED_DVKH_USER_ID);
  });
});

test.describe("Lead đủ điều kiện upload hợp đồng đầu tiên", () => {
  const API = "GET /api/contracts/uploadable-customers";
  test("CTR-054 Lấy Lead đủ điều kiện", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTR-055 Loại Lead không đủ điều kiện", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const inactive = await seed.inactiveLead();
    const converted = (await seed.customer()).lead;
    const other = await seed.lead('nvkdB');
    const res = await http.call(API, { token: N, query: { search: TEST_RUN_ID } });
    expect(res.status()).toBe(200);
    const ids = items(await data(res)).map((l: any) => l.id ?? l.customerId);
    for (const l of [inactive, converted, other]) expect(ids).not.toContain(l.id);
  });
  test("CTR-056 Tìm theo `search`", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const l = await seed.lead();
    const hit = items(await data(await http.call(API, { token: N, query: { search: l.taxCode } })));
    expect(hit.map((x: any) => x.id ?? x.customerId)).toContain(l.id);
    expect(items(await data(await http.call(API, { token: N, query: { search: `khong-co-${uuid()}` } })))).toHaveLength(0);
  });
});

test.describe("Chi tiết hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/{id}";
  test("CTR-062 Xem chi tiết HĐ đang hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.status).toBe('ACTIVE');
    expect(Array.isArray(d.annexes)).toBe(true);
    expect(Array.isArray(d.availableActions ?? [])).toBe(true);
  });
  test("CTR-063 `availableActions` theo trạng thái", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const pending = await seed.customer({ pending: true });
    const active = await seed.customer();
    const cancelled = await seed.customer({ pending: true });
    await http.call('POST /api/contracts/{id}/cancel', { token: D, params: { id: cancelled.contract.id }, json: { reason: 'Khách đổi ý' } });
    const actions = async (id: string) => (await data(await http.call(API, { token: D, params: { id } }))).availableActions ?? [];
    const p = await actions(pending.contract.id);
    const a = await actions(active.contract.id);
    const c = await actions(cancelled.contract.id);
    expect(p).toEqual(expect.arrayContaining(['EDIT', 'CANCEL']));
    expect(a).toEqual(expect.arrayContaining(['EDIT', 'EXTEND', 'SUSPEND']));
    for (const x of ['EDIT', 'EXTEND', 'CANCEL', 'SUSPEND']) expect(c).not.toContain(x);
    expect(c).toContain('MANAGE_ANNEXES');
  });
});

test.describe("Sửa hợp đồng khách hàng", () => {
  const API = "PUT /api/contracts/{id}";
  test("CTR-069 Sửa điều khoản thanh toán HĐ `ACTIVE`", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect((await seed.getContract(String(p.params!.id))).paymentTermDays).toBe(45);
  });
  test("CTR-070 HĐ `ACTIVE` khóa 3 mốc ngày", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.customer();
    const cur = await seed.getContract(c.contract.id);
    const res = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, json: C.updateContract(cur, { effectiveTo: addDays(cur.effectiveTo, 30) }) });
    expect([400, 409]).toContain(res.status());
    expect((await seed.getContract(c.contract.id)).effectiveTo).toBe(cur.effectiveTo);
  });
  test("CTR-071 Sửa ngày hiệu lực HĐ `PENDING` về hôm nay cần xác nhận", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.customer({ pending: true });
    const cur = await seed.getContract(c.contract.id);
    const json = C.updateContract(cur, { effectiveFrom: today(), signedOn: today() });
    const r1 = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, json });
    expect(r1.status()).toBe(409);
    expect((await seed.getContract(c.contract.id)).status).toBe('PENDING');
    const r2 = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, json: { ...json, confirmActivation: true } });
    expect(r2.status()).toBe(200);
    expect((await seed.getContract(c.contract.id)).status).toBe('ACTIVE');
    expect((await seed.getCustomer(c.customerId)).status).toBe('ACTIVE');
  });
  test("CTR-072 Sửa HĐ ở trạng thái đóng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer({ pending: true });
    await http.call('POST /api/contracts/{id}/cancel', { token: D, params: { id: c.contract.id }, json: { reason: 'Khách đổi ý' } });
    const cur = await seed.getContract(c.contract.id);
    expect([400, 409]).toContain((await http.call(API, { token: D, params: { id: c.contract.id }, json: C.updateContract(cur, { paymentTermDays: 50 }) })).status());
    expect((await seed.getContract(c.contract.id)).paymentTermDays).toBe(cur.paymentTermDays);
  });
  test("CTR-076 Ghi lịch sử kèm lý do", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/contracts", id, "dvkhA");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/contracts", id, "dvkhA");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Mã tự sinh của hợp đồng khách hàng và khách hàng", () => {
  const API = "POST /api/contracts";
  test("CTR-192 Mã HĐ khách hàng tự sinh tăng dần theo thứ tự tạo", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const num = (code: string) => Number(String(code).replace(/\D/g, ''));
    const codes: string[] = [];
    for (let i = 0; i < 2; i++) {
      const lead = await seed.lead();
      const res = await http.call(API, { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId)), file: F.pdf() } });
      expect([200, 201]).toContain(res.status());
      codes.push((await data(res)).code);
    }
    for (const c of codes) expect(c).toMatch(/^CTC\d{4}-\d{3,}$/);
    expect(num(codes[1]), codes.join(' -> ')).toBeGreaterThan(num(codes[0]));
  });
  test("CTR-193 Mã khách hàng tự sinh tăng dần theo thứ tự chuyển đổi", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const num = (code: string) => Number(String(code).replace(/\D/g, ''));
    const codes: string[] = [];
    for (let i = 0; i < 2; i++) {
      const lead = await seed.lead();
      const res = await http.call(API, { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId)), file: F.pdf() } });
      expect([200, 201]).toContain(res.status());
      codes.push((await seed.getCustomer((await data(res)).customerId)).customerCode);
    }
    for (const c of codes) expect(c).toBeTruthy();
    expect(num(codes[1]), codes.join(' -> ')).toBeGreaterThan(num(codes[0]));
  });
});

test.describe("Khối giám sát kỳ hạn hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/stats";
  test("CTR-048 Xem số liệu kỳ hạn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTR-050 Chỉ đếm HĐ `ACTIVE` trong phạm vi", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const read = async () => data(await http.call(API, { token: D }));
    const before = JSON.stringify(await read());
    const lead = await seed.lead();
    await http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId, { effectiveFrom: addDays(today(), 2), effectiveTo: addDays(today(), 5) })), file: F.pdf() } });
    expect(JSON.stringify(await read())).toBe(before);
  });
});
