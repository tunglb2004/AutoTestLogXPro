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
test.describe("Đặt hạn mức tín dụng khách hàng", () => {
  const API = "PUT /api/customers/{id}/credit-limit";
  test("CUS-093 DVKH khác đặt hạn mức", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: roles.dvkhB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CUS-096 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});

test.describe("Cập nhật phân hạng khách hàng", () => {
  const API = "PUT /api/customers/{id}/tier";
  test("CUS-117 DVKH khác đổi hạng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: roles.dvkhB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CUS-120 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});

test.describe("Chuyển người phụ trách khách hàng", () => {
  const API = "POST /api/customers/{id}/transfer-account-manager";
  test("CUS-127 DVKH không phụ trách chuyển KH K", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: roles.dvkhB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CUS-132 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CUS-135 Người cũ thử thao tác ghi sau khi chuyển", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    expect((await http.call(API, { token: D, params: { id: c.customerId }, json: { newAccountManagerId: roles.dvkhB.userId, reason: K.TRANSFER_REASON } })).status()).toBe(204);
    const cus = await seed.getCustomer(c.customerId, 'dvkhB');
    const cur = await seed.getContract(c.contract.id, 'dvkhB');
    const histBefore = (await seed.history('/api/customers', c.customerId, 'dvkhB')).length;
    const calls = [
      http.call('PUT /api/customers/{id}', { token: D, params: { id: c.customerId }, json: K.customerUpdateBody(cus, { companyName: 'Tên không được lưu' }) }),
      http.call('PUT /api/customers/{id}/tier', { token: D, params: { id: c.customerId }, json: { tier: 'STRATEGIC' } }),
      http.call('PUT /api/contracts/{id}', { token: D, params: { id: c.contract.id }, json: C.updateContract(cur, { paymentTermDays: 55 }) }),
      http.call('POST /api/contracts/{id}/extensions', { token: D, params: { id: c.contract.id }, json: { newExpiry: addDays(cur.effectiveTo, 30) } }),
      http.call('POST /api/contracts/{id}/suspend', { token: D, params: { id: c.contract.id }, json: { reason: 'Không được phép' } }),
    ];
    for (const r of await Promise.all(calls)) expect([403, 404]).toContain(r.status());
    const after = await seed.getCustomer(c.customerId, 'dvkhB');
    expect(after.companyName).toBe(cus.companyName);
    expect((await seed.getContract(c.contract.id, 'dvkhB')).status).toBe('ACTIVE');
    expect((await seed.history('/api/customers', c.customerId, 'dvkhB')).length).toBe(histBefore);
  });
});
