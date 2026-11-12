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
  test("CTR-010 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
  test("CTR-011 Token sai chữ ký, hết hạn hoặc là refresh token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    for (const bad of badTokens(roles.nvkdA)) {
      const res = await http.call(API, { ...p, token: bad.token });
      expect(res.status(), bad.name).toBe(401);
    }
  });
  test("CTR-012 Chuỗi tấn công trong `search`", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const m = await seed.customer({ manager: 'dvkhB' });
    const res = await http.call(API, { token: D, query: { search: P.sqlDrop, perPage: 100 } });
    expect([200, 400]).toContain(res.status());
    if (res.status() === 200) expect(items(await data(res)).map((c: any) => c.id)).not.toContain(m.contract.id);
  });
});

test.describe("Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng)", () => {
  const API = "POST /api/contracts";
  test("CTR-029 DVKH upload HĐ đầu tiên", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const lead = await seed.lead();
    const res = await http.call(API, { token: D, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId)), file: F.pdf() } });
    expect(res.status()).toBe(403);
    expect((await seed.getLead(lead.id)).status).toBe('ACTIVE');
  });
  test("CTR-031 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});

test.describe("Danh sách DVKH chọn khi upload HĐ", () => {
  const API = "GET /api/contracts/assignable-managers";
  test("CTR-036 Gọi không có token", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Khối giám sát kỳ hạn hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/stats";
  test("CTR-052 Gọi không có token", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Lead đủ điều kiện upload hợp đồng đầu tiên", () => {
  const API = "GET /api/contracts/uploadable-customers";
  test("CTR-060 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Chi tiết hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/{id}";
  test("CTR-064 DVKH khác xem HĐ A", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: roles.dvkhB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
  });
  test("CTR-067 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Sửa hợp đồng khách hàng", () => {
  const API = "PUT /api/contracts/{id}";
  test("CTR-075 DVKH khác sửa HĐ A", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: roles.dvkhB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CTR-078 Gọi không có token", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});
