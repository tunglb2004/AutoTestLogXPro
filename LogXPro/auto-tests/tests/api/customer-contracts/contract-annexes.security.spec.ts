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
test.describe("Thêm phụ lục hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/annexes";
  test("CTR-085 DVKH khác thêm phụ lục", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: roles.dvkhB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CTR-089 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});

test.describe("Sửa phụ lục hợp đồng khách hàng", () => {
  const API = "PUT /api/contracts/{id}/annexes/{annexId}";
  test("CTR-096 `annexId` thuộc HĐ khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const q = await seed.prepare(API);
    const before = await seed.snapshot(API, q);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: q.params!.annexId } });
    expect([404]).toContain(res.status());
    expect(await seed.snapshot(API, q)).toEqual(before);
  });
  test("CTR-100 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});

test.describe("Xóa phụ lục hợp đồng khách hàng", () => {
  const API = "DELETE /api/contracts/{id}/annexes/{annexId}";
  test("CTR-105 Xóa phụ lục của HĐ khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const q = await seed.prepare(API);
    const before = await seed.snapshot(API, q);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: q.params!.annexId } });
    expect([404]).toContain(res.status());
    expect(await seed.snapshot(API, q)).toEqual(before);
  });
  test("CTR-109 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});

test.describe("Tải file phụ lục hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/{id}/annexes/{annexId}/file";
  test("CTR-113 Tải file phụ lục ngoài phạm vi", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: roles.dvkhB.accessToken });
    expect([403, 404]).toContain(res.status());
    expect((await body(res))?.data ?? null).toBeNull();
  });
  test("CTR-116 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});
