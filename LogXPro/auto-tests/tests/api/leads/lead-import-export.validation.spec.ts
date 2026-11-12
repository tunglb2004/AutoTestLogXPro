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
  test("LEAD-050 Khoảng ngày tạo một ngày", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const res = await http.call(API, { token: T, query: { createdFrom: today(), createdTo: today() } });
    expect(res.status()).toBe(200);
    expect((await res.body()).includes(Buffer.from(a.taxCode))).toBe(true);
  });
  test("LEAD-051 Tham số lọc sai", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const res = await http.call(API, { token: T, query: { status: 'ABC' } });
    expect(res.status()).toBe(400);
  });
  test("LEAD-054 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Import Lead từ Excel", () => {
  const API = "POST /api/leads/import";
  test("LEAD-060 File chỉ có dòng tiêu đề và file 1 dòng", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const empty = await http.call(API, { token: T, multipart: { file: F.xlsx(await seed.importTemplate(), 'chi-tieu-de.xlsx') } });
    expect([200, 400]).toContain(empty.status());
    if (empty.status() === 200) expect((await data(empty)).created).toBe(0);
    const tax = L.taxCode();
    const one = await http.call(API, { token: T, multipart: { file: await seed.importFile([{ taxCode: tax }]) } });
    expect(one.status()).toBe(200);
    expect(await seed.leadsByTax(tax)).toHaveLength(1);
  });
  test("LEAD-061 Không gửi file", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const res = await http.call(API, { token: T, multipart: { note: 'không có file' } });
    expect(res.status()).toBe(400);
  });
  test("LEAD-065 File hỏng đổi đuôi `.xlsx`", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const res = await http.call(API, { token: T, multipart: { file: F.textAs('hong.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') } });
    expect(res.status()).toBe(400);
  });
});

test.describe("Tải file mẫu import Lead", () => {
  const API = "GET /api/leads/import-template";
  test("LEAD-074 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});
