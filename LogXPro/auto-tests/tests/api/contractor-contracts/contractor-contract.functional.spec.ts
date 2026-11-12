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
import { schemas } from '../../../src/api/schemas/contractor-contract.schema';
test.describe("Danh sách, tìm kiếm, lọc hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts";
  test("CTV-001 Xem danh sách HĐ nhà thầu", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-002 Tìm theo mã HĐ, tên/mã nhà thầu, MST", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    for (const w of [c.contract.code, c.contractor.name.split(' ').slice(3, 5).join(' '), c.contractor.code, c.contractor.taxCode]) {
      expect(items(await data(await http.call(API, { token: Q, query: { search: w, perPage: 100 } }))).map((x: any) => x.id), w).toContain(c.contract.id);
    }
  });
  test("CTV-003 Lọc trạng thái nhiều giá trị, `contractorId`, khoảng ngày, `alert`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    const list = items(await data(await http.call(API, { token: Q, query: { contractorId: c.contractor.id, status: ['ACTIVE', 'PENDING'], expiresFrom: c.contract.effectiveTo, expiresTo: c.contract.effectiveTo, perPage: 100 } })));
    expect(list.map((x: any) => x.id)).toContain(c.contract.id);
    for (const x of list) expect(x.contractorId).toBe(c.contractor.id);
    const alerts = items(await data(await http.call(API, { token: Q, query: { alert: ['URGENT', 'NOTICE'], perPage: 100 } })));
    for (const x of alerts) expect(['URGENT', 'NOTICE']).toContain(x.alertLevel);
  });
  test("CTV-004 Phân trang không trùng, không sót", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const tag = `pg${randDigits(6)}`;
    for (let i = 0; i < 25; i++) {
      const v = await seed.contractor({ name: `Công ty TNHH Phân trang ${tag} số ${i + 1}` });
      await http.call('POST /api/contractor-contracts', { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id)), file: F.pdf() } });
    }
    const ids = new Set<string>(); const sizes: number[] = [];
    for (const page of [1, 2, 3]) {
      const list = items(await data(await http.call(API, { token: Q, query: { search: tag, page, perPage: 10 } })));
      sizes.push(list.length);
      for (const x of list) { expect(ids.has(x.id)).toBe(false); ids.add(x.id); }
    }
    expect(sizes).toEqual([10, 10, 5]);
  });
});

test.describe("Thêm hợp đồng nhà thầu đầu tiên", () => {
  const API = "POST /api/contractor-contracts";
  test("CTV-013 Thêm HĐ hiệu lực từ hôm nay", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.code).toMatch(/^CTV\d{4}-\d{3,}$/);
    const v = await seed.getContractor(p.resourceId!);
    expect(v.status.code).toBe('ACTIVE');
  });
  test("CTV-014 Thêm HĐ hiệu lực tương lai", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const v = await seed.contractor();
    const res = await http.call(API, { token: roles.qlnt.accessToken, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id, { effectiveFrom: addDays(today(), 10) })), file: F.pdf() } });
    expect([200, 201]).toContain(res.status());
    expect((await seed.getContractor(v.id)).status.code).toBe('NEW');
  });
  test("CTV-019 Nhà thầu đã có HĐ hoặc không ở Tạo mới", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const send = (cid: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contractor-contracts', { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(cid, extra)), file: F.pdf(), ...files } });
    const h = await seed.contractorWithContract();
    const d = await seed.terminatedContractor();
    for (const v of [h.contractor, d.contractor]) expect([400, 409]).toContain((await send(v.id)).status());
  });
  test("CTV-020 Nhiều hơn 1 file scan", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const v = await seed.contractor();
    const res = await http.call(API, { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id)), file: [F.pdf('scan-1.pdf'), F.pdf('scan-2.pdf')] } });
    expect(res.status()).toBe(400);
  });
  test("CTV-021 Lỗi không đổi trạng thái nhà thầu", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const v = await seed.contractor();
    expect((await http.call(API, { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id)), file: F.empty() } })).status()).toBe(400);
    const after = await seed.getContractor(v.id);
    expect(after.contracts ?? []).toHaveLength(0);
    expect(after.status.code).toBe('NEW');
  });
});

test.describe("Nhà thầu cho ô chọn Thêm hợp đồng", () => {
  const API = "GET /api/contractor-contracts/contractor-options";
  test("CTV-029 Chế độ `NEW`", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(items(d).length).toBeGreaterThan(0);
  });
  test("CTV-030 Chế độ `RESIGN`", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const h = await seed.contractorWithContract();
    const d = await seed.terminatedContractor();
    const n2 = await seed.contractorWithContract({ pending: true });
    const list = items(await data(await http.call(API, { token: roles.qlnt.accessToken, query: { mode: 'RESIGN', perPage: 100, search: h.contractor.taxCode } })));
    expect(list.some((x: any) => x.contractorId === h.contractor.id)).toBe(true);
    for (const c of [d.contractor, n2.contractor]) {
      const r = items(await data(await http.call(API, { token: roles.qlnt.accessToken, query: { mode: 'RESIGN', search: c.taxCode } })));
      expect(r.some((x: any) => x.contractorId === c.id), c.name).toBe(false);
    }
  });
  test("CTV-031 Nhà thầu vừa có HĐ đầu tiên rời chế độ `NEW`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const v = await seed.contractor();
    const has = async () => items(await data(await http.call(API, { token: Q, query: { mode: 'NEW', search: v.taxCode } }))).some((o: any) => o.contractorId === v.id);
    expect(await has()).toBe(true);
    await http.call('POST /api/contractor-contracts', { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id)), file: F.pdf() } });
    expect(await has()).toBe(false);
  });
  test("CTV-033 Tìm theo `search`", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const v = await seed.contractor();
    expect(items(await data(await http.call(API, { token: Q, query: { mode: 'NEW', search: v.taxCode } }))).map((o: any) => o.contractorId)).toContain(v.id);
    expect(items(await data(await http.call(API, { token: Q, query: { mode: 'NEW', search: `khong-co-${uuid()}` } })))).toHaveLength(0);
  });
});

test.describe("Chi tiết hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/{id}";
  test("CTV-044 Xem chi tiết HĐ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-045 `availableActions` theo trạng thái", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const a = await seed.contractorWithContract();
    const p = await seed.contractorWithContract({ pending: true });
    const act = async (id: string) => (await data(await http.call(API, { token: Q, params: { id } }))).availableActions ?? [];
    expect(await act(a.contract.id)).toEqual(expect.arrayContaining(['EXTEND', 'SUSPEND', 'RESIGN']));
    expect(await act(p.contract.id)).toEqual(expect.arrayContaining(['EDIT', 'CANCEL']));
  });
  test("CTV-046 Nhà thầu Dừng hợp tác không có thao tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const d = await seed.terminatedContractor();
    const res = await http.call(API, { token: roles.qlnt.accessToken, params: { id: d.contract.id } });
    expect(res.status()).toBe(200);
    expect((await data(res)).availableActions ?? []).toEqual([]);
  });
});

test.describe("Sửa hợp đồng nhà thầu", () => {
  const API = "PUT /api/contractor-contracts/{id}";
  test("CTV-052 Sửa tên và ngày HĐ Chưa hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-053 HĐ Đang hiệu lực chỉ sửa cấu hình gia hạn", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.contractorWithContract();
    const res = await http.call(API, { token: roles.qlnt.accessToken, params: { id: c.contract.id }, json: VC.updateContractorContract(c.contract, { effectiveTo: addDays(c.contract.effectiveTo, 30) }) });
    expect([400, 409]).toContain(res.status());
    expect((await seed.getContractorContract(c.contract.id)).effectiveTo).toBe(c.contract.effectiveTo);
  });
  test("CTV-054 HĐ Đang hiệu lực đổi cấu hình gia hạn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: VC.updateContractorContract(c.contract, { autoRenew: true, renewalCycleMonths: 12 }) })).status()).toBe(200);
    const k = await seed.getContractorContract(c.contract.id);
    expect(k.autoRenew).toBe(true);
    expect(k.renewalCycleMonths).toBe(12);
    expect(k.name).toBe(c.contract.name);
    expect(k.effectiveTo).toBe(c.contract.effectiveTo);
  });
  test("CTV-055 Sửa HĐ của nhà thầu Dừng hợp tác hoặc HĐ đã đóng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const d = await seed.terminatedContractor();
    const p = await seed.contractorWithContract({ pending: true });
    await http.call('POST /api/contractor-contracts/{id}/cancel', { token: Q, params: { id: p.contract.id }, json: { reason: 'Nhà thầu rút' } });
    for (const k of [d.contract, await seed.getContractorContract(p.contract.id)]) expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: k.id }, json: VC.updateContractorContract(k, { name: 'Không được sửa' }) })).status());
  });
  test("CTV-056 Sửa Ngày hiệu lực HĐ Chưa hiệu lực về hôm nay", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract({ pending: true });
    const res = await http.call(API, { token: Q, params: { id: c.contract.id }, json: VC.updateContractorContract(c.contract, { effectiveFrom: today(), signedOn: today() }) });
    expect([200, 400, 409]).toContain(res.status());
    if (res.status() === 200) {
      expect(await st(c.contract.id)).toBe('ACTIVE');
      expect((await seed.getContractor(c.contractor.id)).status.code).toBe('ACTIVE');
    }
  });
  test("CTV-060 Ghi lịch sử", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/contractor-contracts", id, "qlnt");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/contractor-contracts", id, "qlnt");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Số liệu hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/stats";
  test("CTV-038 Xem số liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-040 Số liệu đổi theo thao tác", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract({ pending: true });
    const before = await data(await http.call(API, { token: Q }));
    await http.call('POST /api/contractor-contracts/{id}/cancel', { token: Q, params: { id: c.contract.id }, json: { reason: 'Nhà thầu rút' } });
    const after = await data(await http.call(API, { token: Q }));
    expect(after.inactive - before.inactive).toBe(1);
  });
});

test.describe("Mã tự sinh của hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts";
  test("CTV-196 Mã HĐ nhà thầu tự sinh tăng dần theo thứ tự tạo", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const num = (code: string) => Number(String(code).replace(/\D/g, ''));
    const codes: string[] = [];
    for (let i = 0; i < 2; i++) {
      const v = await seed.contractor();
      const res = await http.call(API, { token: roles.qlnt.accessToken, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id)), file: F.pdf() } });
      expect([200, 201]).toContain(res.status());
      codes.push((await data(res)).code);
    }
    for (const c of codes) expect(c).toMatch(/^CTV\d{4}-\d{3,}$/);
    expect(num(codes[1]), codes.join(' -> ')).toBeGreaterThan(num(codes[0]));
  });
});
