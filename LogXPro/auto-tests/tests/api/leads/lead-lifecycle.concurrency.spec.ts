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
test.describe("Chuyển người phụ trách Lead", () => {
  const API = "POST /api/leads/{id}/transfer-owner";
  test("LEAD-214 Người cũ gửi lại yêu cầu chuyển", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const p = await seed.prepare(API);
    expect((await http.call(API, p)).status()).toBe(204);
    expect([403, 404]).toContain((await http.call(API, p)).status());
  });
  test("LEAD-215 2 yêu cầu chuyển cho 2 người cùng lúc", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const results = await Promise.all([
      http.call(API, { token: T, params: { id: a.id }, json: { newOwnerUserId: roles.nvkdB.userId, reason: 'Phân lại địa bàn' } }),
      http.call(API, { token: T, params: { id: a.id }, json: { newOwnerUserId: roles.nvkdC.userId, reason: 'Phân lại địa bàn' } }),
    ]);
    const codes = results.map((r) => r.status());
    expect(codes.filter((c) => c === 204)).toHaveLength(1);
    const winner = codes[0] === 204 ? 'nvkdB' : 'nvkdC';
    expect((await seed.getLead(a.id, winner)).ownerUserId).toBe(roles[winner].userId);
  });
});

test.describe("Ngưng hoạt động Lead", () => {
  const API = "POST /api/leads/{id}/deactivate";
  test("LEAD-153 Ngưng lần thứ 2", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const first = await http.call(API, p);
    expect(first.status()).toBeLessThan(300);
    const after = await seed.snapshot(API, p);
    const second = await http.call(API, p);
    expect([400, 409]).toContain(second.status());
    expect(await seed.snapshot(API, p)).toEqual(after);
  });
});

test.describe("Kích hoạt lại Lead", () => {
  const API = "POST /api/leads/{id}/reactivate";
  test("LEAD-198 Kích hoạt lần thứ 2", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const first = await http.call(API, p);
    expect(first.status()).toBeLessThan(300);
    const after = await seed.snapshot(API, p);
    const second = await http.call(API, p);
    expect([400, 409]).toContain(second.status());
    expect(await seed.snapshot(API, p)).toEqual(after);
  });
});
