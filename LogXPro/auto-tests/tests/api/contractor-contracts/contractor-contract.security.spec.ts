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
  test("CTV-008 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
  test("CTV-009 Token sai chữ ký, hết hạn hoặc là refresh token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    for (const bad of badTokens(roles.nvkdA)) {
      const res = await http.call(API, { ...p, token: bad.token });
      expect(res.status(), bad.name).toBe(401);
    }
  });
  test("CTV-010 Role kinh doanh xem HĐ nhà thầu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    expect((await http.call(API, { token: roles.nvkdA.accessToken })).status()).toBe(403);
  });
  test("CTV-011 Chuỗi tấn công trong `search`", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    expect([200, 400]).toContain((await http.call(API, { token: Q, query: { search: P.sqlInjection } })).status());
  });
});

test.describe("Thêm hợp đồng nhà thầu đầu tiên", () => {
  const API = "POST /api/contractor-contracts";
  test("CTV-025 Role kinh doanh thêm HĐ nhà thầu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const v = await seed.contractor();
    expect((await http.call(API, { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id)), file: F.pdf() } })).status()).toBe(403);
    expect((await seed.getContractor(v.id)).contracts ?? []).toHaveLength(0);
  });
  test("CTV-027 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});

test.describe("Nhà thầu cho ô chọn Thêm hợp đồng", () => {
  const API = "GET /api/contractor-contracts/contractor-options";
  test("CTV-036 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Số liệu hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/stats";
  test("CTV-042 Gọi không có token", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Chi tiết hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/{id}";
  test("CTV-047 Role khác xem HĐ nhà thầu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: roles.nvkdA.accessToken });
    expect([403]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
  });
  test("CTV-050 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Sửa hợp đồng nhà thầu", () => {
  const API = "PUT /api/contractor-contracts/{id}";
  test("CTV-059 Role khác sửa HĐ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: roles.nvkdA.accessToken });
    expect([403]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CTV-062 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});
