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
import { schemas } from '../../../src/api/schemas/customer.schema';
test.describe("Danh sách, tìm kiếm, lọc khách hàng", () => {
  const API = "GET /api/customers";
  test("CUS-001 Xem danh sách khách hàng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CUS-002 Trạng thái HĐ lấy real-time", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    await http.call('POST /api/contracts/{id}/suspend', { token: D, params: { id: k.contract.id }, json: { reason: 'Vi phạm' } });
    const row = items(await data(await http.call(API, { token: D, query: { search: k.contract.code, perPage: 100 } }))).find((c: any) => c.id === k.customerId);
    expect(row).toBeTruthy();
    expect(row.status).toBe('SUSPENDED');
    expect(JSON.stringify(row)).toContain('SUSPENDED');
  });
  test("CUS-003 Tìm theo tên, mã KH, MST, mã HĐ, ngành hàng", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    const cus = await seed.getCustomer(k.customerId);
    for (const w of [cus.companyName.split(' ').slice(-3, -1).join(' '), cus.customerCode, cus.taxCode, k.contract.code, cus.industries?.[0]?.name].filter(Boolean)) {
      const res = await http.call(API, { token: D, query: { search: w, perPage: 100 } });
      expect(res.status(), w).toBe(200);
      expect(items(await data(res)).map((c: any) => c.id), w).toContain(k.customerId);
    }
  });
  test("CUS-004 Lọc nhiều giá trị `status`, `tier`, `contractStatus`, `industryId`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const s = await seed.customer({ tier: 'STRATEGIC' });
    const pend = await seed.customer({ pending: true });
    const two = items(await data(await http.call(API, { token: D, query: { search: TEST_RUN_ID, status: ['ACTIVE', 'SUSPENDED'], perPage: 100 } })));
    expect(two.map((c: any) => c.id)).toEqual(expect.arrayContaining([s.customerId, pend.customerId]));
    const strat = items(await data(await http.call(API, { token: D, query: { tier: 'STRATEGIC', perPage: 100 } })));
    for (const c of strat) expect(c.tier).toBe('STRATEGIC');
    const pc = items(await data(await http.call(API, { token: D, query: { contractStatus: 'PENDING', perPage: 100 } })));
    expect(pc.map((c: any) => c.id)).toContain(pend.customerId);
  });
  test("CUS-005 Phân trang không trùng, không sót", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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

test.describe("Danh sách DVKH để chuyển người phụ trách khách hàng", () => {
  const API = "GET /api/customers/assignable-managers";
  test("CUS-014 Lấy danh sách DVKH", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CUS-015 Loại tài khoản khóa và role khác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const ids = items(await data(await http.call(API, { token: D }))).map((u: any) => u.id ?? u.userId);
    expect(ids).not.toContain(roles.nvkdA.userId);
    if (process.env.LOCKED_DVKH_USER_ID) expect(ids).not.toContain(process.env.LOCKED_DVKH_USER_ID);
  });
});

test.describe("Chi tiết khách hàng", () => {
  const API = "GET /api/customers/{id}";
  test("CUS-028 Xem chi tiết KH", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.customerCode).toBeTruthy();
    expect(d.currentContract?.status).toBe('ACTIVE');
    expect(d.accountManagerId).toBe(roles.dvkhA.userId);
  });
  test("CUS-029 KH tạm ngưng có lý do", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const pending = await seed.customer({ pending: true });
    const c = await seed.customer();
    await http.call('POST /api/contracts/{id}/suspend', { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, json: { reason: 'Vi phạm' } });
    const r1 = await data(await http.call(API, { token: roles.dvkhA.accessToken, params: { id: pending.customerId } }));
    expect(r1.status).toBe('SUSPENDED');
    expect(r1.suspendReason).toBe('PENDING_CONTRACT');
    const r2 = await data(await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.customerId } }));
    expect(r2.status).toBe('SUSPENDED');
    expect(r2.suspendReason).toBe('CONTRACT_SUSPENDED');
  });
  test("CUS-035 HĐ hiện hành khi KH có nhiều HĐ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const c = await seed.customerWithPendingResign();
    const d = await data(await http.call(API, { token: D, params: { id: c.customerId } }));
    expect(d.currentContract?.id).toBe(c.contract.id);
    expect(d.currentContract?.status).toBe('ACTIVE');
    expect(d.status).toBe('ACTIVE');
  });
  test("CUS-036 HĐ hiện hành khi không còn HĐ đang hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer({ pending: true });
    const d = await data(await http.call(API, { token: D, params: { id: c.customerId } }));
    expect(d.currentContract?.status).toBe('PENDING');
    expect(d.status).toBe('SUSPENDED');
    expect(d.suspendReason).toBe('PENDING_CONTRACT');
  });
  test.fixme("CUS-037 HĐ hiện hành khi chỉ còn HĐ đã đóng", { tag: ["@api", "@p2"] }, async () => {
    // Cần dữ liệu khách hàng có HĐ EXPIRED (chỉ tác vụ 0:00 tạo ra trạng thái này, chưa có seed hoặc API tạo HĐ ngày quá khứ).
    // Kỳ vọng: HTTP 200. KH `SUSPENDED` lý do `NO_ACTIVE_CONTRACT`; HĐ hiện hành là HĐ `EXPIRED` có ngày hiệu lực lớn nhất (thứ tự ưu tiên đã xác nhận với người dùng)
  });
});

test.describe("Sửa thông tin khách hàng", () => {
  const API = "PUT /api/customers/{id}";
  test("CUS-038 Sửa tên và địa chỉ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getCustomer(String(p.params!.id));
    expect(c.headOfficeAddress).toBe((p.json as any).headOfficeAddress);
  });
  test("CUS-039 Không sửa được mã KH", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    const cur = await seed.getCustomer(k.customerId);
    const res = await http.call(API, { token: D, params: { id: k.customerId }, json: { ...K.customerUpdateBody(cur), customerCode: 'KH-SUA-TAY' } });
    expect([200, 400]).toContain(res.status());
    expect((await seed.getCustomer(k.customerId)).customerCode).toBe(cur.customerCode);
  });
  test("CUS-040 MST trùng KH hoặc Lead khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const k = await seed.customer();
    const m = await seed.customer();
    const cur = await seed.getCustomer(k.customerId);
    const res = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: k.customerId }, json: K.customerUpdateBody(cur, { taxCode: m.lead.taxCode }) });
    expect(res.status()).toBe(409);
    expect((await seed.getCustomer(k.customerId)).taxCode).toBe(cur.taxCode);
  });
  test("CUS-041 Dữ liệu dùng chung với Lead gốc", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    const cur = await seed.getCustomer(k.customerId);
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json: K.customerUpdateBody(cur, { companyName: L.companyName() }) })).status()).toBe(200);
    const hist = await seed.history('/api/customers', k.customerId, 'dvkhA');
    const leadHist = await seed.history('/api/leads', k.lead.id, 'nvkdA');
    expect(hist.length).toBeGreaterThan(leadHist.length);
  });
  test("CUS-045 Ghi lịch sử giá trị cũ, mới", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/customers", id, "dvkhA");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/customers", id, "dvkhA");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});
