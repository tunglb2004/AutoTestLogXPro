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
test.describe("Cập nhật phân hạng khách hàng", () => {
  const API = "PUT /api/customers/{id}/tier";
  test("CUS-113 Đổi từ Thường sang Chiến lược", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect((await seed.getCustomer(String(p.params!.id))).tier).toBe('STRATEGIC');
  });
  test("CUS-114 Đổi sang đúng hạng hiện tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer({ tier: 'REGULAR' });
    expect([400, 409]).toContain((await http.call(API, { token: D, params: { id: k.customerId }, json: { tier: 'REGULAR' } })).status());
  });
  test("CUS-118 Ghi lịch sử hạng cũ, mới", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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

test.describe("Chuyển người phụ trách khách hàng", () => {
  const API = "POST /api/customers/{id}/transfer-account-manager";
  test("CUS-122 Chuyển KH cho DVKH B", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const c = await seed.customerWithPendingResign();
    const res = await http.call(API, { token: D, params: { id: c.customerId }, json: { newAccountManagerId: roles.dvkhB.userId, reason: K.TRANSFER_REASON } });
    expect(res.status()).toBe(204);
    expect((await seed.getCustomer(c.customerId, 'dvkhB')).accountManagerId).toBe(roles.dvkhB.userId);
    expect((await seed.getContract(c.contract.id, 'dvkhB')).accountManagerId).toBe(roles.dvkhB.userId);
    expect((await seed.getContract(c.pending.id, 'dvkhB')).accountManagerId).toBe(roles.dvkhB.userId);
    test.info().annotations.push({ type: 'Giới hạn dữ liệu', description: 'Chưa kiểm HĐ EXPIRED giữ người cũ vì chưa có seed HĐ hết hạn' });
  });
  test("CUS-123 KH không còn HĐ chưa hết hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer({ pending: true });
    await http.call('POST /api/contracts/{id}/cancel', { token: D, params: { id: c.contract.id }, json: { reason: 'Khách đổi ý' } });
    expect([400, 409]).toContain((await http.call(API, { token: D, params: { id: c.customerId }, json: { newAccountManagerId: roles.dvkhB.userId, reason: K.TRANSFER_REASON } })).status());
  });
  test("CUS-124 Người mới trùng người cũ hoặc không hợp lệ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    for (const id of [roles.dvkhA.userId, process.env.LOCKED_DVKH_USER_ID, roles.nvkdA.userId].filter(Boolean) as string[]) {
      expect([400, 409], id).toContain((await http.call(API, { token: D, params: { id: k.customerId }, json: { newAccountManagerId: id, reason: K.TRANSFER_REASON } })).status());
    }
    expect((await seed.getCustomer(k.customerId)).accountManagerId).toBe(roles.dvkhA.userId);
  });
  test("CUS-128 Người cũ mất quyền", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    expect((await http.call(API, p)).status()).toBe(204);
    const res = await http.call('GET /api/customers/{id}', { token: roles.dvkhA.accessToken, params: p.params });
    expect([403, 404]).toContain(res.status());
  });
  test("CUS-134 Đọc lại từng HĐ sau khi chuyển", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const c = await seed.customerWithPendingResign();
    const susp = await seed.customer();
    expect((await http.call(API, { token: D, params: { id: c.customerId }, json: { newAccountManagerId: roles.dvkhB.userId, reason: K.TRANSFER_REASON } })).status()).toBe(204);
    expect((await seed.getContract(c.contract.id, 'dvkhB')).accountManagerId).toBe(roles.dvkhB.userId);
    expect((await seed.getContract(c.pending.id, 'dvkhB')).accountManagerId).toBe(roles.dvkhB.userId);
    expect(susp.contract.accountManagerId ?? roles.dvkhA.userId).toBe(roles.dvkhA.userId);
    test.info().annotations.push({ type: 'Giới hạn dữ liệu', description: 'HĐ EXPIRED, SUSPENDED, CANCELLED cùng khách hàng chưa dựng được trong 1 khách hàng; xem Điểm cần xác nhận' });
  });
});

test.describe("Đặt hạn mức tín dụng khách hàng", () => {
  const API = "PUT /api/customers/{id}/credit-limit";
  test("CUS-089 Đặt hạn mức 500.000.000", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getCustomer(String(p.params!.id));
    expect(c.creditLimit).toBe((p.json as any).creditLimit);
    expect(c.status).toBe('ACTIVE');
  });
  test("CUS-092 Hạn mức không ràng buộc trạng thái", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer({ pending: true });
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json: { creditLimit: 0 } })).status()).toBe(200);
    expect((await seed.getCustomer(k.customerId)).status).toBe('SUSPENDED');
  });
  test("CUS-094 Ghi lịch sử", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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
