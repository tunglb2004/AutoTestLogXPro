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
test.describe("Thêm phụ lục hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/annexes";
  test("CTV-072 Response đúng schema Swagger", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 201]).toContain(res.status());
    const b = await body(res);
    expect(apiSuccess.safeParse(b).success, JSON.stringify(b)?.slice(0, 300)).toBe(true);
    const parsed = schemas[API].safeParse(b.data);
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 5))).toBe(true);
  });
});

test.describe("Sửa phụ lục hợp đồng nhà thầu", () => {
  const API = "PUT /api/contractor-contracts/{id}/annexes/{annexId}";
  test("CTV-084 Response đúng schema Swagger", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    expect(apiSuccess.safeParse(b).success, JSON.stringify(b)?.slice(0, 300)).toBe(true);
    const parsed = schemas[API].safeParse(b.data);
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 5))).toBe(true);
  });
});

test.describe("Xóa phụ lục hợp đồng nhà thầu", () => {
  const API = "DELETE /api/contractor-contracts/{id}/annexes/{annexId}";
  test("CTV-092 Response đúng schema Swagger", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 204]).toContain(res.status());
    const b = await body(res);
    expect(apiSuccess.safeParse(b).success, JSON.stringify(b)?.slice(0, 300)).toBe(true);
    const parsed = schemas[API].safeParse(b.data);
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 5))).toBe(true);
  });
});

test.describe("Tải phụ lục hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/{id}/annexes/{annexId}/file";
  test("CTV-098 Response đúng schema Swagger", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    expect(res.headers()['content-type'] ?? '').not.toContain('application/json');
    expect((await res.body()).length).toBeGreaterThan(0);
  });
});

test.describe("Xem phụ lục PDF trong trình xem", () => {
  const API = "GET /api/contractor-contracts/{id}/annexes/{annexId}/view";
  test("CTV-107 Response đúng schema Swagger", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    expect(res.headers()['content-type'] ?? '').not.toContain('application/json');
    expect((await res.body()).length).toBeGreaterThan(0);
  });
});
