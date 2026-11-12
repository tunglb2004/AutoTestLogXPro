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
test.describe("Danh sách, tìm kiếm, lọc Lead", () => {
  const API = "GET /api/leads";
  test("LEAD-006 `perPage` ở biên 1, 100 và 101; `page` = 0", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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
  test("LEAD-007 Giá trị lọc sai kiểu", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    for (const q of [{ status: 'ABC' }, { industryId: 'abc' }, { createdFrom: '2026-13-01' }]) {
      const res = await http.call(API, { token: T, query: q });
      expect(res.status(), JSON.stringify(q)).toBe(400);
    }
  });
  test("LEAD-013 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Tạo Lead", () => {
  const API = "POST /api/leads";
  test("LEAD-016 Thiếu từng trường bắt buộc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const fields = ['companyName', 'taxCode', 'industryIds', 'route', 'source', 'ownerUserId', 'contacts'];
    for (const f of fields) {
      const json: any = await seed.leadBody();
      delete json[f];
      const res = await http.call(API, { token: roles.nvkdA.accessToken, json });
      expect(res.status(), f).toBe(400);
      const b = await body(res);
      if (json.taxCode) expect(items(await data(await http.call('GET /api/leads', { token: roles.nvkdA.accessToken, query: { search: json.taxCode } }))), f).toHaveLength(0);
    }
  });
  test("LEAD-017 Sai định dạng MST, SĐT, email, website, enum", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const variants: Record<string, unknown>[] = [{ taxCode: '12345abcde' }, { contacts: [{ ...L.contactBody({ phone: '12345' }), primary: true }] }, { contacts: [{ ...L.contactBody({ email: 'abc@' }), primary: true }] }, { website: 'abc' }, { route: 'SEA' }];
    for (const v of variants) {
      const json = await seed.leadBody('nvkdA', v);
      const res = await http.call(API, { token: T, json });
      expect(res.status(), JSON.stringify(v)).toBe(400);
      if (typeof json.taxCode === 'string' && /^\d+$/.test(json.taxCode)) expect(await seed.leadsByTax(json.taxCode)).toHaveLength(0);
    }
  });
  test("LEAD-018 `contacts` rỗng, `industryIds` rỗng", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    for (const v of [{ contacts: [] }, { industryIds: [] }]) {
      const json = await seed.leadBody('nvkdA', v);
      const res = await http.call(API, { token: T, json });
      expect(res.status(), JSON.stringify(v)).toBe(400);
      expect(await seed.leadsByTax(json.taxCode as string)).toHaveLength(0);
    }
  });
  test("LEAD-019 MST 10 và 13 số hợp lệ; 9, 11, 14 số bị chặn", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    for (const len of [9, 10, 11, 13, 14]) {
      const json = await seed.leadBody('nvkdA', { taxCode: randDigits(len, true) });
      const res = await http.call(API, { token: roles.nvkdA.accessToken, json });
      if (len === 10 || len === 13) expect([200, 201], `MST ${len} số`).toContain(res.status());
      else expect(res.status(), `MST ${len} số`).toBe(400);
    }
  });
  test("LEAD-020 Độ dài `companyName` 255/256, `initialNote` 500/501, `fullName` 100/101", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const cases: [string, Record<string, unknown>, boolean][] = [
      ['companyName 255', { companyName: textOfLength(255) }, true], ['companyName 256', { companyName: textOfLength(256) }, false],
      ['initialNote 500', { initialNote: textOfLength(500) }, true], ['initialNote 501', { initialNote: textOfLength(501) }, false],
      ['fullName 100', { contacts: [{ ...L.contactBody({ fullName: textOfLength(100, 'Nguyễn Văn ') }), primary: true }] }, true],
      ['fullName 101', { contacts: [{ ...L.contactBody({ fullName: textOfLength(101, 'Nguyễn Văn ') }), primary: true }] }, false],
    ];
    for (const [label, v, ok] of cases) {
      const res = await http.call(API, { token: T, json: await seed.leadBody('nvkdA', v) });
      if (ok) {
        expect([200, 201], label).toContain(res.status());
        const d = await seed.getLead((await data(res)).id);
        if ('companyName' in v) expect(d.companyName).toBe(v.companyName);
        if ('initialNote' in v) expect(d.initialNote).toBe(v.initialNote);
      } else expect(res.status(), label).toBe(400);
    }
  });
  test("LEAD-021 SĐT đầu mối ở biên pattern Swagger (0 hoặc +84 rồi 9–10 chữ số)", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const phones: [string, boolean][] = [[`0${randDigits(9)}`, true], [`0${randDigits(10)}`, true], [`+84${randDigits(9)}`, true], [`0${randDigits(8)}`, false], [`0${randDigits(11)}`, false]];
    for (const [phone, ok] of phones) {
      const res = await http.call(API, { token: T, json: await seed.leadBody('nvkdA', { contacts: [{ ...L.contactBody({ phone }), primary: true }] }) });
      if (ok) expect([200, 201], phone).toContain(res.status());
      else expect(res.status(), phone).toBe(400);
    }
  });
  test("LEAD-034 Body JSON sai cú pháp", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, json: undefined, multipart: undefined, rawBody: malformedJson });
    expect(res.status()).toBe(400);
    const b = await body(res);
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
  test("LEAD-036 `industryOther` 255/256 ký tự khi chọn Khác", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const { otherIndustryId } = await seed.catalog();
    expect(otherIndustryId, 'Danh mục ngành hàng không có ngành Khác').toBeTruthy();
    const ok = await http.call(API, { token: T, json: await seed.leadBody('nvkdA', { industryIds: [otherIndustryId], industryOther: textOfLength(255, 'Gốm sứ mỹ nghệ ') }) });
    expect([200, 201]).toContain(ok.status());
    expect((await seed.getLead((await data(ok)).id)).industryOther).toHaveLength(255);
    const bad = await http.call(API, { token: T, json: await seed.leadBody('nvkdA', { industryIds: [otherIndustryId], industryOther: textOfLength(256, 'Gốm sứ mỹ nghệ ') }) });
    expect(bad.status()).toBe(400);
  });
});

test.describe("Sửa thông tin Lead", () => {
  const API = "PUT /api/leads/{id}";
  test("LEAD-091 Thiếu trường bắt buộc, sai định dạng", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const l = await seed.lead();
    const base = L.leadUpdateBody(l);
    const variants = [{ ...base, companyName: undefined }, { ...base, industryIds: [] }, { ...base, website: 'abc' }, { ...base, taxCode: '123' }];
    for (const json of variants) expect((await http.call(API, { token: T, params: { id: l.id }, json })).status()).toBe(400);
    const after = await seed.getLead(l.id);
    expect(after.companyName).toBe(l.companyName);
    expect(after.taxCode).toBe(l.taxCode);
  });
  test("LEAD-092 `companyName` 255/256, `headOfficeAddress` 500/501", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const cases: [Record<string, unknown>, boolean][] = [[{ companyName: textOfLength(255) }, true], [{ companyName: textOfLength(256) }, false], [{ headOfficeAddress: textOfLength(500, 'Số 1 đường Lê Lợi ') }, true], [{ headOfficeAddress: textOfLength(501, 'Số 1 đường Lê Lợi ') }, false]];
    for (const [v, ok] of cases) {
      const l = await seed.lead();
      const res = await http.call(API, { token: T, params: { id: l.id }, json: L.leadUpdateBody(l, v) });
      expect(res.status(), JSON.stringify(Object.keys(v))).toBe(ok ? 200 : 400);
      if (ok) for (const [k, val] of Object.entries(v)) expect((await seed.getLead(l.id))[k]).toBe(val);
    }
  });
  test("LEAD-100 Lead không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Danh sách người phụ trách Lead", () => {
  const API = "GET /api/leads/assignable-owners";
  test("LEAD-044 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Số liệu tổng quan Lead", () => {
  const API = "GET /api/leads/stats";
  test("LEAD-080 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Chi tiết Lead", () => {
  const API = "GET /api/leads/{id}";
  test("LEAD-085 `id` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("LEAD-088 Lead không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
