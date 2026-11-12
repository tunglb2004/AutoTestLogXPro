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
test.describe("Lịch sử thao tác Lead", () => {
  const API = "GET /api/leads/{id}/history";
  test("LEAD-189 `perPage` ở biên 1, 100 và 101; `page` = 0", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const one = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: 1 } });
    expect(one.status()).toBe(200);
    expect(items(await data(one)).length).toBeLessThanOrEqual(1);
    const max = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: 100 } });
    expect(max.status()).toBe(200);
    expect(items(await data(max)).length).toBeLessThanOrEqual(100);
    for (const q of [{ page: 1, perPage: 101 }, { page: 0, perPage: 20 }]) {
      const res = await http.call(API, { ...p, query: { ...p.query, ...q } });
      expect(res.status(), JSON.stringify(q)).toBe(400);
    }
  });
  test("LEAD-190 Tham số thời gian sai định dạng", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, query: { ...p.query, from: '2026-13-45' } });
    expect(res.status()).toBe(400);
  });
  test("LEAD-194 Lead không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
