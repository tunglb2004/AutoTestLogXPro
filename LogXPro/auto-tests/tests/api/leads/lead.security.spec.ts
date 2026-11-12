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
import { schemas } from '../../../src/api/schemas/lead.schema';
test.describe("Danh sách, tìm kiếm, lọc Lead", () => {
  const API = "GET /api/leads";
  test("LEAD-009 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
  test("LEAD-010 Token sai chữ ký, hết hạn hoặc là refresh token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    for (const bad of badTokens(roles.nvkdA)) {
      const res = await http.call(API, { ...p, token: bad.token });
      expect(res.status(), bad.name).toBe(401);
    }
  });
  test("LEAD-011 Chuỗi tấn công trong `search`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const other = await seed.lead('nvkdB');
    for (const search of [P.sqlInjection, '%']) {
      const res = await http.call(API, { token: T, query: { search, perPage: 100 } });
      expect([200, 400], search).toContain(res.status());
      if (res.status() === 200) expect(items(await data(res)).map((l: any) => l.id)).not.toContain(other.id);
    }
  });
  test("LEAD-012 Role không thuộc kinh doanh xem danh sách Lead", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const res = await http.call(API, { token: roles.qlnt.accessToken, query: { perPage: 10 } });
    expect(res.status()).toBe(403);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Tạo Lead", () => {
  const API = "POST /api/leads";
  test("LEAD-032 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("LEAD-033 Role không phải NVKD tạo Lead", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const json = await seed.leadBody();
    const res = await http.call(API, { token: roles.qlnt.accessToken, json });
    expect(res.status()).toBe(403);
    expect(await seed.leadsByTax(json.taxCode as string)).toHaveLength(0);
  });
  test("LEAD-030 Payload XSS trong tên công ty", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const res = await http.call(API, { token: T, json: await seed.leadBody('nvkdA', { companyName: P.xssPayload }) });
    expect([200, 201, 400]).toContain(res.status());
    if (res.status() !== 400) expect((await seed.getLead((await data(res)).id)).companyName).toBe(P.xssPayload);
  });
});

test.describe("Danh sách người phụ trách Lead", () => {
  const API = "GET /api/leads/assignable-owners";
  test("LEAD-043 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Số liệu tổng quan Lead", () => {
  const API = "GET /api/leads/stats";
  test("LEAD-079 Gọi không có token", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Chi tiết Lead", () => {
  const API = "GET /api/leads/{id}";
  test("LEAD-084 NVKD khác xem Lead A", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.lead('nvkdA');
    const res = await http.call(API, { token: roles.nvkdB.accessToken, params: { id: a.id } });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
  });
  test("LEAD-087 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Sửa thông tin Lead", () => {
  const API = "PUT /api/leads/{id}";
  test("LEAD-096 NVKD khác sửa Lead A", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: roles.nvkdB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("LEAD-099 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});
