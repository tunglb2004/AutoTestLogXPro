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
  test("CUS-090 Hạn mức 0, -0.01, số rất lớn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json: { creditLimit: 0 } })).status()).toBe(200);
    expect((await seed.getCustomer(k.customerId)).creditLimit).toBe(0);
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json: { creditLimit: -0.01 } })).status()).toBe(400);
    const big = await http.call(API, { token: D, params: { id: k.customerId }, json: { creditLimit: 999999999999999 } });
    expect(big.status()).toBeLessThan(500);
    if (big.status() === 200) expect((await seed.getCustomer(k.customerId)).creditLimit).toBe(999999999999999);
  });
  test("CUS-091 Thiếu hoặc sai kiểu", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    for (const json of [{}, { creditLimit: 'abc' }]) expect((await http.call(API, { token: D, params: { id: k.customerId }, json })).status()).toBe(400);
  });
  test("CUS-097 Khách hàng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Cập nhật phân hạng khách hàng", () => {
  const API = "PUT /api/customers/{id}/tier";
  test("CUS-115 Hạng không hợp lệ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    for (const json of [{ tier: 'GOLD' }, {}]) expect((await http.call(API, { token: D, params: { id: k.customerId }, json })).status()).toBe(400);
  });
  test("CUS-116 Hai giá trị enum duy nhất", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer({ tier: 'REGULAR' });
    for (const tier of ['STRATEGIC', 'REGULAR']) {
      expect((await http.call(API, { token: D, params: { id: k.customerId }, json: { tier } })).status(), tier).toBe(200);
      expect((await seed.getCustomer(k.customerId)).tier).toBe(tier);
    }
  });
  test("CUS-121 Khách hàng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Chuyển người phụ trách khách hàng", () => {
  const API = "POST /api/customers/{id}/transfer-account-manager";
  test("CUS-125 Thiếu lý do hoặc người mới", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    for (const json of [{ newAccountManagerId: roles.dvkhB.userId }, { reason: K.TRANSFER_REASON }]) expect((await http.call(API, { token: D, params: { id: k.customerId }, json })).status()).toBe(400);
    expect((await seed.getCustomer(k.customerId)).accountManagerId).toBe(roles.dvkhA.userId);
  });
  test("CUS-126 `reason` 500/501 ký tự", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.prepare(API);
    const okRes = await http.call(API, { ...a, json: { ...(a.json as object), reason: textOfLength(500) } });
    expect([204]).toContain(okRes.status());
    const b = await seed.prepare(API);
    const before = await seed.snapshot(API, b);
    const bad = await http.call(API, { ...b, json: { ...(b.json as object), reason: textOfLength(501) } });
    expect(bad.status()).toBe(400);
    expect(await seed.snapshot(API, b)).toEqual(before);
  });
  test("CUS-133 Khách hàng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
