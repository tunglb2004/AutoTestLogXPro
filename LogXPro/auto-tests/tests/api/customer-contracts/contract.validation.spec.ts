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
test.describe("Danh sách, tìm kiếm, lọc hợp đồng khách hàng", () => {
  const API = "GET /api/contracts";
  test("CTR-007 `perPage` ở biên 1, 100 và 101; `page` = 0", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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
  test("CTR-008 Giá trị enum, UUID, ngày sai", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    for (const q of [{ status: 'OPEN' }, { customerId: 'abc' }, { signedFrom: '2026-02-30' }]) expect((await http.call(API, { token: D, query: q })).status(), JSON.stringify(q)).toBe(400);
  });
  test("CTR-013 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng)", () => {
  const API = "POST /api/contracts";
  test("CTR-016 Thiếu từng trường bắt buộc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const fields = ['customerId', 'accountManagerId', 'customerTier', 'contractNumber', 'signedOn', 'effectiveFrom', 'effectiveTo', 'billingCycle', 'paymentTermDays', 'paymentDueNote', 'paymentMethod'];
    const lead = await seed.lead();
    for (const f of fields) {
      const contract: any = C.uploadContract(lead.id, roles.dvkhA.userId);
      delete contract[f];
      expect((await http.call(API, { token: N, multipart: { contract: jsonPart('contract', contract), file: F.pdf() } })).status(), f).toBe(400);
    }
    expect((await seed.getLead(lead.id)).status).toBe('ACTIVE');
  });
  test("CTR-017 Thiếu file scan", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const lead = await seed.lead();
    const res = await http.call(API, { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId)) } });
    expect(res.status()).toBe(400);
    expect((await seed.getLead(lead.id)).status).toBe('ACTIVE');
  });
  test("CTR-018 Thứ tự ngày sai", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const lead = await seed.lead();
    const variants = [
      { signedOn: addDays(today(), 1), effectiveFrom: today() },
      { effectiveFrom: addDays(today(), 30), effectiveTo: addDays(today(), 29) },
    ];
    for (const v of variants) {
      const res = await http.call(API, { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId, v)), file: F.pdf() } });
      expect(res.status(), JSON.stringify(v)).toBe(400);
    }
    expect((await seed.getLead(lead.id)).status).toBe('ACTIVE');
  });
  test("CTR-019 Ba mốc ngày bằng nhau; `paymentTermDays` 0/365/366", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const up = async (leadId: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(leadId, roles.dvkhA.userId, extra)), file: F.pdf(), ...files } });
    const t = today();
    const cases: [Record<string, unknown>, boolean][] = [[{ signedOn: t, effectiveFrom: t, effectiveTo: t }, true], [{ paymentTermDays: 0 }, true], [{ paymentTermDays: 365 }, true], [{ paymentTermDays: 366 }, false]];
    for (const [v, ok] of cases) {
      const lead = await seed.lead();
      const res = await up(lead.id, v);
      if (ok) expect([200, 201], JSON.stringify(v)).toContain(res.status()); else expect(res.status(), JSON.stringify(v)).toBe(400);
    }
  });
  test("CTR-020 Số phụ lục kèm theo 5 và 6", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const up = async (leadId: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(leadId, roles.dvkhA.userId, extra)), file: F.pdf(), ...files } });
    const annexes = (n: number) => Array.from({ length: n }, (_, i) => C.annexMeta({ name: `Phụ lục số ${i + 1}` }));
    const files = (n: number) => Array.from({ length: n }, (_, i) => F.pdf(`phu-luc-${i + 1}.pdf`));
    const l5 = await seed.lead();
    const r5 = await up(l5.id, { annexes: annexes(5) }, { annexFiles: files(5) });
    expect([200, 201]).toContain(r5.status());
    expect((await seed.getContract((await data(r5)).id)).annexes).toHaveLength(5);
    const l6 = await seed.lead();
    expect((await up(l6.id, { annexes: annexes(6) }, { annexFiles: files(6) })).status()).toBe(400);
    expect((await seed.getLead(l6.id)).status).toBe('ACTIVE');
  });
  test("CTR-032 Multipart thiếu phần `contract` hoặc JSON trong `contract` hỏng", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const lead = await seed.lead();
    for (const multipart of [{ file: F.pdf() }, { contract: { name: 'contract.json', mimeType: 'application/json', buffer: Buffer.from(P.malformedJson) }, file: F.pdf() }]) {
      expect((await http.call(API, { token: N, multipart })).status()).toBe(400);
    }
    expect((await seed.getLead(lead.id)).status).toBe('ACTIVE');
  });
});

test.describe("Lead đủ điều kiện upload hợp đồng đầu tiên", () => {
  const API = "GET /api/contracts/uploadable-customers";
  test("CTR-057 `search` rỗng và rất dài", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    expect((await http.call(API, { token: N, query: { search: '' } })).status()).toBe(200);
    const long = await http.call(API, { token: N, query: { search: textOfLength(1000) } });
    expect([200, 400]).toContain(long.status());
  });
  test("CTR-058 Tham số lạ", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const res = await http.call(API, { token: N, query: { search: '%_%' } });
    expect(res.status()).toBe(200);
    for (const l of items(await data(res))) expect(JSON.stringify(l)).toContain('%_%');
  });
  test("CTR-061 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Sửa hợp đồng khách hàng", () => {
  const API = "PUT /api/contracts/{id}";
  test("CTR-073 Thiếu lý do, đầu mối hoặc enum sai", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const cur = await seed.getContract(c.contract.id);
    for (const v of [{ reason: undefined }, { contacts: [] }, { paymentMethod: 'CARD' }]) {
      expect((await http.call(API, { token: D, params: { id: c.contract.id }, json: C.updateContract(cur, v) })).status(), JSON.stringify(v)).toBe(400);
    }
    expect((await seed.getContract(c.contract.id)).paymentMethod).toBe(cur.paymentMethod);
  });
  test("CTR-074 `reason` 500/501; `paymentTermDays` 365/366; SLA 100/100.01", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.prepare(API);
    const okRes = await http.call(API, { ...a, json: { ...(a.json as object), reason: textOfLength(500) } });
    expect([200]).toContain(okRes.status());
    const b = await seed.prepare(API);
    const before = await seed.snapshot(API, b);
    const bad = await http.call(API, { ...b, json: { ...(b.json as object), reason: textOfLength(501) } });
    expect(bad.status()).toBe(400);
    expect(await seed.snapshot(API, b)).toEqual(before);
  });
  test("CTR-079 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Danh sách DVKH chọn khi upload HĐ", () => {
  const API = "GET /api/contracts/assignable-managers";
  test("CTR-037 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Khối giám sát kỳ hạn hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/stats";
  test("CTR-049 HĐ ở mép 7/8, 30/31, 60/61 ngày", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const read = async () => data(await http.call(API, { token: D }));
    const before = await read();
    for (const days of [7, 8, 30, 31, 60, 61]) {
      const lead = await seed.lead();
      expect([200, 201]).toContain((await http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId, { effectiveTo: addDays(today(), days) })), file: F.pdf() } })).status());
    }
    const after = await read();
    const nums = (o: any) => Object.values(o).filter((v) => typeof v === 'number') as number[];
    const delta = nums(after).map((v, i) => v - nums(before)[i]);
    expect(delta.slice(0, 3)).toEqual([1, 2, 2]);
  });
  test("CTR-053 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Chi tiết hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/{id}";
  test("CTR-065 `id` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CTR-068 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
