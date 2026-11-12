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
import { schemas } from '../../../src/api/schemas/contractor.schema';
test.describe("Kích hoạt lại nhà thầu", () => {
  const API = "POST /api/contractors/{id}/reactivate";
  test("VDR-145 Không gửi lý do", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    for (const json of [{}]) {
      const res = await http.call(API, { ...p, json });
      expect(res.status(), JSON.stringify(json)).toBe(400);
    }
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("VDR-146 `reason` 500/501", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.prepare(API);
    const okRes = await http.call(API, { ...a, json: { ...(a.json as object), reason: textOfLength(500) } });
    expect([200]).toContain(okRes.status());
    const b = await seed.prepare(API);
    const before = await seed.snapshot(API, b);
    const bad = await http.call(API, { ...b, json: { ...(b.json as object), reason: textOfLength(501) } });
    expect(bad.status()).toBe(400);
    expect(await seed.snapshot(API, b)).toEqual(before);
  });
  test("VDR-152 Nhà thầu không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Dừng hợp tác nhà thầu", () => {
  const API = "POST /api/contractors/{id}/terminate";
  test("VDR-160 Không gửi lý do", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    for (const json of [{}]) {
      const res = await http.call(API, { ...p, json });
      expect(res.status(), JSON.stringify(json)).toBe(400);
    }
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("VDR-161 `reason` 500/501", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.prepare(API);
    const okRes = await http.call(API, { ...a, json: { ...(a.json as object), reason: textOfLength(500) } });
    expect([200]).toContain(okRes.status());
    const b = await seed.prepare(API);
    const before = await seed.snapshot(API, b);
    const bad = await http.call(API, { ...b, json: { ...(b.json as object), reason: textOfLength(501) } });
    expect(bad.status()).toBe(400);
    expect(await seed.snapshot(API, b)).toEqual(before);
  });
  test("VDR-167 Nhà thầu không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Cập nhật phân hạng nhà thầu", () => {
  const API = "PUT /api/contractors/{id}/tier";
  test("VDR-173 Thiếu lý do, hạng lạ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    for (const json of [{ tier: V.tierB() }, { tier: 'VIP', reason: V.REASON }]) expect((await http.call(API, { token: Q, params: { id: h.id }, json })).status()).toBe(400);
  });
  test("VDR-174 `reason` 500/501", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.prepare(API);
    const okRes = await http.call(API, { ...a, json: { ...(a.json as object), reason: textOfLength(500) } });
    expect([200]).toContain(okRes.status());
    const b = await seed.prepare(API);
    const before = await seed.snapshot(API, b);
    const bad = await http.call(API, { ...b, json: { ...(b.json as object), reason: textOfLength(501) } });
    expect(bad.status()).toBe(400);
    expect(await seed.snapshot(API, b)).toEqual(before);
  });
  test("VDR-179 Nhà thầu không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
