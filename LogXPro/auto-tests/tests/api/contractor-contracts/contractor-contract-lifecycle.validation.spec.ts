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
test.describe("Cấu hình tự động gia hạn", () => {
  const API = "PUT /api/contractor-contracts/{id}/auto-renewal";
  test("CTV-113 Chu kỳ 3, 6, 12, 24 hợp lệ; 0, 1, 36 bị chặn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    for (const [m, ok] of [[3, true], [6, true], [12, true], [24, true], [0, false], [1, false], [36, false]] as const) {
      expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { enabled: true, cycleMonths: m } })).status(), String(m)).toBe(ok ? 200 : 400);
      if (ok) expect((await seed.getContractorContract(c.contract.id)).renewalCycleMonths).toBe(m);
    }
  });
  test("CTV-114 Thiếu `enabled`; bật mà không có chu kỳ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    for (const json of [{}, { enabled: true }]) expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json })).status()).toBe(400);
  });
  test("CTV-121 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Hủy hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/cancel";
  test("CTV-131 Không gửi lý do", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    for (const json of [{}]) {
      const res = await http.call(API, { ...p, json });
      expect(res.status(), JSON.stringify(json)).toBe(400);
    }
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CTV-132 `reason` 500/501", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.prepare(API);
    const okRes = await http.call(API, { ...a, json: { ...(a.json as object), reason: textOfLength(500) } });
    expect([200]).toContain(okRes.status());
    const b = await seed.prepare(API);
    const before = await seed.snapshot(API, b);
    const bad = await http.call(API, { ...b, json: { ...(b.json as object), reason: textOfLength(501) } });
    expect(bad.status()).toBe(400);
    expect(await seed.snapshot(API, b)).toEqual(before);
  });
  test("CTV-138 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Gia hạn hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/extensions";
  test("CTV-144 `newExpiry` = ngày cũ + 1", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    const newExpiry = addDays(c.contract.effectiveTo, 1);
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { newExpiry } })).status()).toBe(200);
    expect((await seed.getContractorContract(c.contract.id)).effectiveTo).toBe(newExpiry);
  });
  test("CTV-145 Thiếu hoặc sai `newExpiry`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    for (const json of [{}, { newExpiry: 'abc' }]) expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json })).status()).toBe(400);
  });
  test("CTV-152 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Tái ký hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/resign";
  test("CTV-175 Thiếu file scan hoặc trường bắt buộc", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    const from = addDays(c.contract.effectiveTo, 1);
    for (const multipart of [{ contract: jsonPart('contract', VC.resignContractorContract(from)) }, { contract: jsonPart('contract', { ...VC.resignContractorContract(from), legalNumber: undefined }), file: F.pdf() }]) expect((await http.call(API, { token: Q, params: { id: c.contract.id }, multipart })).status()).toBe(400);
  });
  test("CTV-176 5 và 6 phụ lục kèm theo", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const res = (id: string, from: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(from, extra)), file: F.pdf('tai-ky.pdf'), ...files } });
    const annexes = (n: number) => Array.from({ length: n }, (_, i) => C.annexMeta({ name: `Phụ lục ${i + 1}` }));
    const files = (n: number) => Array.from({ length: n }, (_, i) => F.pdf(`pl-${i + 1}.pdf`));
    const a = await seed.contractorWithContract();
    expect([200, 201]).toContain((await res(a.contract.id, addDays(a.contract.effectiveTo, 1), { annexes: annexes(5) }, { annexFiles: files(5) })).status());
    const b2 = await seed.contractorWithContract();
    expect((await res(b2.contract.id, addDays(b2.contract.effectiveTo, 1), { annexes: annexes(6) }, { annexFiles: files(6) })).status()).toBe(400);
  });
  test("CTV-183 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Dừng khai thác hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/suspend";
  test("CTV-188 Không gửi lý do", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    for (const json of [{}]) {
      const res = await http.call(API, { ...p, json });
      expect(res.status(), JSON.stringify(json)).toBe(400);
    }
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("CTV-189 `reason` 500/501", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.prepare(API);
    const okRes = await http.call(API, { ...a, json: { ...(a.json as object), reason: textOfLength(500) } });
    expect([200]).toContain(okRes.status());
    const b = await seed.prepare(API);
    const before = await seed.snapshot(API, b);
    const bad = await http.call(API, { ...b, json: { ...(b.json as object), reason: textOfLength(501) } });
    expect(bad.status()).toBe(400);
    expect(await seed.snapshot(API, b)).toEqual(before);
  });
  test("CTV-195 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
