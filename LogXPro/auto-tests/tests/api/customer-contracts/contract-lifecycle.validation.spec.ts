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
test.describe("Hủy hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/cancel";
  test("CTR-122 Thiếu lý do", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    for (const json of [{}]) {
      const res = await http.call(API, { ...p, json });
      expect(res.status(), JSON.stringify(json)).toBe(400);
    }
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CTR-123 `reason` 500/501 ký tự", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.prepare(API);
    const okRes = await http.call(API, { ...a, json: { ...(a.json as object), reason: textOfLength(500) } });
    expect([200]).toContain(okRes.status());
    const b = await seed.prepare(API);
    const before = await seed.snapshot(API, b);
    const bad = await http.call(API, { ...b, json: { ...(b.json as object), reason: textOfLength(501) } });
    expect(bad.status()).toBe(400);
    expect(await seed.snapshot(API, b)).toEqual(before);
  });
  test("CTR-129 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Gia hạn hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/extensions";
  test("CTR-135 `newExpiry` = Ngày hết hạn cũ + 1 ngày", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const newExpiry = addDays(c.contract.effectiveTo, 1);
    expect((await http.call(API, { token: D, params: { id: c.contract.id }, json: { newExpiry } })).status()).toBe(200);
    expect((await seed.getContract(c.contract.id)).effectiveTo).toBe(newExpiry);
  });
  test("CTR-136 Thiếu hoặc sai `newExpiry`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    for (const json of [{}, { newExpiry: '2026-02-30' }]) expect((await http.call(API, { token: D, params: { id: c.contract.id }, json })).status()).toBe(400);
  });
  test("CTR-143 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Tái ký hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/resign";
  test("CTR-172 Thiếu file scan hoặc trường bắt buộc", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const from = addDays(c.contract.effectiveTo, 1);
    const variants = [{ contract: jsonPart('contract', C.resignContract(from)) }, { contract: jsonPart('contract', { ...C.resignContract(from), contractNumber: undefined }), file: F.pdf() }, { contract: jsonPart('contract', { ...C.resignContract(from), paymentMethod: undefined }), file: F.pdf() }];
    for (const multipart of variants) expect((await http.call(API, { token: D, params: { id: c.contract.id }, multipart })).status()).toBe(400);
    expect((await seed.getContract(c.contract.id)).resignedInto ?? null).toBeNull();
  });
  test("CTR-173 `effectiveFrom` = hôm nay và `effectiveFrom` = Ngày hiệu lực gốc + 1", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const a = await seed.customer();
    const r1 = await http.call(API, { token: D, params: { id: a.contract.id }, multipart: { contract: jsonPart('contract', { ...C.resignContract(today()), confirmReplacement: true }), file: F.pdf('tai-ky.pdf') } });
    expect([200, 201, 409]).toContain(r1.status());
    // HĐ gốc bắt đầu hôm nay để "ngày hiệu lực gốc + 1" không rơi vào quá khứ.
    const lead = await seed.lead();
    const orig = await data(await http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId)), file: F.pdf() } }));
    const r2 = await http.call(API, { token: D, params: { id: orig.id }, multipart: { contract: jsonPart('contract', { ...C.resignContract(addDays(orig.effectiveFrom, 1)), confirmReplacement: true }), file: F.pdf('tai-ky.pdf') } });
    expect([200, 201, 409]).toContain(r2.status());
  });
  test("CTR-180 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Dừng khai thác hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/suspend";
  test("CTR-183 Thiếu lý do", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    for (const json of [{}]) {
      const res = await http.call(API, { ...p, json });
      expect(res.status(), JSON.stringify(json)).toBe(400);
    }
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CTR-184 `reason` 500/501 ký tự", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.prepare(API);
    const okRes = await http.call(API, { ...a, json: { ...(a.json as object), reason: textOfLength(500) } });
    expect([200]).toContain(okRes.status());
    const b = await seed.prepare(API);
    const before = await seed.snapshot(API, b);
    const bad = await http.call(API, { ...b, json: { ...(b.json as object), reason: textOfLength(501) } });
    expect(bad.status()).toBe(400);
    expect(await seed.snapshot(API, b)).toEqual(before);
  });
  test("CTR-191 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
