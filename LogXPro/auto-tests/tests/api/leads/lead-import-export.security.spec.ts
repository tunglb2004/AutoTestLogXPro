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
test.describe("Xuất danh sách Lead ra Excel", () => {
  const API = "GET /api/leads/export";
  test("LEAD-053 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});

test.describe("Import Lead từ Excel", () => {
  const API = "POST /api/leads/import";
  test("LEAD-064 Ô Excel chứa công thức hoặc script", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const [t1, t2] = [L.taxCode(), L.taxCode()];
    const res = await http.call(API, { token: T, multipart: { file: await seed.importFile([{ taxCode: t1, companyName: P.excelFormula }, { taxCode: t2, companyName: P.xssPayload }]) } });
    expect(res.status()).toBe(200);
    const [a] = await seed.leadsByTax(t1);
    const [b2] = await seed.leadsByTax(t2);
    if (a) expect(String(a.companyName)).toContain('HYPERLINK');
    if (b2) expect(b2.companyName).toBe(P.xssPayload);
  });
  test("LEAD-067 Gọi không có token", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});

test.describe("Tải file mẫu import Lead", () => {
  const API = "GET /api/leads/import-template";
  test("LEAD-073 Gọi không có token", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, token: null });
    expect(res.status()).toBe(401);
    expect((await body(res))?.data ?? null).toBeNull();
  });
});
