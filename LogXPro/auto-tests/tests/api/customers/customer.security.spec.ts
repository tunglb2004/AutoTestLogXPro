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
  test("CUS-009 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
  test("CUS-010 Token sai chữ ký, hết hạn hoặc là refresh token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    for (const bad of badTokens(roles.nvkdA)) {
      const res = await http.call(API, { ...p, token: bad.token });
      expect(res.status(), bad.name).toBe(401);
    }
  });
  test("CUS-011 NVKD xem danh sách khách hàng", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const res = await http.call(API, { token: roles.nvkdA.accessToken, query: { perPage: 10 } });
    expect(res.status()).toBe(403);
  });
  test("CUS-012 Chuỗi tấn công trong `search`", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const res = await http.call(API, { token: D, query: { search: P.sqlOrString, perPage: 100 } });
    expect([200, 400]).toContain(res.status());
    if (res.status() === 200) for (const c of items(await data(res))) expect(c.accountManagerId ?? roles.dvkhA.userId).toBe(roles.dvkhA.userId);
  });
});

test.describe("Danh sách DVKH để chuyển người phụ trách khách hàng", () => {
  const API = "GET /api/customers/assignable-managers";
  test("CUS-017 Gọi không có token", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Chi tiết khách hàng", () => {
  const API = "GET /api/customers/{id}";
  test("CUS-030 DVKH khác xem KH K", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: roles.dvkhB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
  });
  test("CUS-033 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Sửa thông tin khách hàng", () => {
  const API = "PUT /api/customers/{id}";
  test("CUS-044 DVKH khác sửa KH K", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: roles.dvkhB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CUS-047 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});
