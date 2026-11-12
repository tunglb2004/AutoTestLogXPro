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
test.describe("Danh sách, tìm kiếm, lọc hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts";
  test("CTV-005 `perPage` ở biên 1, 100 và 101; `page` = 0", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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
  test("CTV-006 Enum, UUID, ngày sai", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    for (const q of [{ alert: 'HIGH' }, { contractorId: 'abc' }, { signedFrom: '2026-02-30' }]) expect((await http.call(API, { token: Q, query: q })).status(), JSON.stringify(q)).toBe(400);
  });
  test("CTV-012 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Thêm hợp đồng nhà thầu đầu tiên", () => {
  const API = "POST /api/contractor-contracts";
  test("CTV-015 Thiếu từng trường bắt buộc hoặc file", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const v = await seed.contractor();
    for (const f of ['contractorId', 'name', 'legalNumber', 'signedOn', 'effectiveFrom', 'effectiveTo']) {
      const contract: any = VC.newContractorContract(v.id); delete contract[f];
      expect((await http.call(API, { token: Q, multipart: { contract: jsonPart('contract', contract), file: F.pdf() } })).status(), f).toBe(400);
    }
    expect((await http.call(API, { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id)) } })).status()).toBe(400);
    expect((await seed.getContractor(v.id)).contracts ?? []).toHaveLength(0);
  });
  test("CTV-016 Ngày hiệu lực sau ngày hết hạn", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const v = await seed.contractor();
    const res = await http.call(API, { token: roles.qlnt.accessToken, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id, { effectiveFrom: addDays(today(), 31), effectiveTo: addDays(today(), 30) })), file: F.pdf() } });
    expect(res.status()).toBe(400);
    expect((await seed.getContractor(v.id)).contracts ?? []).toHaveLength(0);
  });
  test("CTV-017 Ngày hiệu lực = ngày hết hạn; 5 và 6 phụ lục", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const send = (cid: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contractor-contracts', { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(cid, extra)), file: F.pdf(), ...files } });
    const v1 = await seed.contractor();
    expect([200, 201]).toContain((await send(v1.id, { effectiveTo: today() })).status());
    const v2 = await seed.contractor();
    const annexes = (n: number) => Array.from({ length: n }, (_, i) => C.annexMeta({ name: `Phụ lục ${i + 1}` }));
    const files = (n: number) => Array.from({ length: n }, (_, i) => F.pdf(`pl-${i + 1}.pdf`));
    const r5 = await send(v2.id, { annexes: annexes(5) }, { annexFiles: files(5) });
    expect([200, 201]).toContain(r5.status());
    const k = await seed.getContractorContract((await data(r5)).id);
    expect(k.annexes).toHaveLength(5);
    for (const a of k.annexes) expect(a.code).toMatch(/^PLV/);
    const v3 = await seed.contractor();
    expect((await send(v3.id, { annexes: annexes(6) }, { annexFiles: files(6) })).status()).toBe(400);
  });
  test("CTV-018 `renewalCycleMonths` 3/6/12/24 và 1/36", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const send = (cid: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contractor-contracts', { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(cid, extra)), file: F.pdf(), ...files } });
    for (const [m, ok] of [[3, true], [6, true], [12, true], [24, true], [1, false], [36, false]] as const) {
      const v = await seed.contractor();
      const res = await send(v.id, { autoRenew: true, renewalCycleMonths: m });
      if (ok) expect([200, 201], String(m)).toContain(res.status()); else expect(res.status(), String(m)).toBe(400);
    }
  });
  test("CTV-028 Multipart thiếu phần `contract` hoặc JSON trong `contract` hỏng", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const v = await seed.contractor();
    for (const multipart of [{ file: F.pdf() }, { contract: { name: 'contract.json', mimeType: 'application/json', buffer: Buffer.from(P.malformedJson) }, file: F.pdf() }]) expect((await http.call(API, { token: Q, multipart })).status()).toBe(400);
    expect((await seed.getContractor(v.id)).contracts ?? []).toHaveLength(0);
  });
});

test.describe("Sửa hợp đồng nhà thầu", () => {
  const API = "PUT /api/contractor-contracts/{id}";
  test("CTV-057 Thiếu trường, ngày ngược", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract({ pending: true });
    for (const v of [{ name: undefined }, { effectiveFrom: addDays(c.contract.effectiveTo, 1) }]) expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: VC.updateContractorContract(c.contract, v) })).status()).toBe(400);
  });
  test("CTV-058 `name` 255/256; `legalNumber` 100/101", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    for (const [v, ok] of [[{ name: textOfLength(255) }, true], [{ name: textOfLength(256) }, false], [{ legalNumber: textOfLength(100, 'HĐNT-') }, true], [{ legalNumber: textOfLength(101, 'HĐNT-') }, false]] as const) {
      const c = await seed.contractorWithContract({ pending: true });
      expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: VC.updateContractorContract(c.contract, v as any) })).status(), Object.keys(v)[0]).toBe(ok ? 200 : 400);
    }
  });
  test("CTV-063 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Nhà thầu cho ô chọn Thêm hợp đồng", () => {
  const API = "GET /api/contractor-contracts/contractor-options";
  test("CTV-032 Thiếu hoặc sai `mode`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    for (const query of [{}, { mode: 'EDIT' }]) expect((await http.call(API, { token: Q, query })).status()).toBe(400);
  });
  test("CTV-034 `search` rỗng và 1000 ký tự", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    expect((await http.call(API, { token: Q, query: { mode: 'NEW', search: '' } })).status()).toBe(200);
    expect([200, 400]).toContain((await http.call(API, { token: Q, query: { mode: 'NEW', search: textOfLength(1000) } })).status());
  });
  test("CTV-037 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Số liệu hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/stats";
  test("CTV-039 HĐ hết hạn sau 60 và 61 ngày", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const read = async () => data(await http.call(API, { token: Q }));
    const before = await read();
    for (const days of [60, 61]) {
      const v = await seed.contractor();
      await http.call('POST /api/contractor-contracts', { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id, { effectiveTo: addDays(today(), days) })), file: F.pdf() } });
    }
    const after = await read();
    const key = Object.keys(after).find((k) => /expir|sap/i.test(k) && !/expired/i.test(k)) ?? 'expiringSoon';
    expect(after[key] - before[key]).toBe(1);
  });
  test("CTV-043 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Chi tiết hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/{id}";
  test("CTV-048 `id` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CTV-051 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
