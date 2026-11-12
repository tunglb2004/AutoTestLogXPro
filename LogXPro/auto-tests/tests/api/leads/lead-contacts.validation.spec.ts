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
test.describe("Thêm đầu mối liên hệ Lead", () => {
  const API = "POST /api/leads/{id}/contacts";
  test("LEAD-107 Thiếu tên, SĐT sai, email sai", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    for (const json of [{ ...L.contactBody(), fullName: undefined }, L.contactBody({ phone: '123' }), L.contactBody({ email: 'abc' })]) {
      expect((await http.call(API, { token: T, params: { id: a.id }, json })).status()).toBe(400);
    }
    expect((await seed.getLead(a.id)).contacts).toHaveLength(1);
  });
  test("LEAD-108 `fullName` 100/101, `email` 100/101 ký tự", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const cases: [Record<string, unknown>, boolean][] = [[{ fullName: textOfLength(100, 'Nguyễn Văn ') }, true], [{ fullName: textOfLength(101, 'Nguyễn Văn ') }, false], [{ email: `${'a'.repeat(100 - 12)}@example.vn` }, true], [{ email: `${'a'.repeat(101 - 12)}@example.vn` }, false]];
    for (const [v, ok] of cases) {
      const a = await seed.lead();
      expect((await http.call(API, { token: T, params: { id: a.id }, json: L.contactBody(v) })).status(), JSON.stringify(v).slice(0, 40)).toBe(ok ? 201 : 400);
    }
  });
  test("LEAD-116 Lead không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Sửa đầu mối liên hệ Lead", () => {
  const API = "PUT /api/leads/{id}/contacts/{contactId}";
  test("LEAD-119 SĐT sai định dạng", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.leadWithContacts(2);
    const c = a.contacts[1];
    expect((await http.call(API, { token: T, params: { id: a.id, contactId: c.id }, json: L.contactBody({ fullName: c.fullName, phone: 'abc' }) })).status()).toBe(400);
    expect((await seed.getLead(a.id)).contacts.find((x: any) => x.id === c.id).phone).toBe(c.phone);
  });
  test("LEAD-120 `jobTitle` 100/101 ký tự", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    for (const [len, ok] of [[100, true], [101, false]] as const) {
      const a = await seed.leadWithContacts(2);
      const c = a.contacts[1];
      expect((await http.call(API, { token: T, params: { id: a.id, contactId: c.id }, json: L.contactBody({ fullName: c.fullName, phone: c.phone, jobTitle: textOfLength(len, 'Trưởng phòng ') }) })).status(), String(len)).toBe(ok ? 200 : 400);
    }
  });
  test("LEAD-125 `contactId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("LEAD-128 Đầu mối không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Xóa đầu mối liên hệ Lead", () => {
  const API = "DELETE /api/leads/{id}/contacts/{contactId}";
  test("LEAD-132 Lead còn đúng 2 đầu mối", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.leadWithContacts(2);
    const sub = a.contacts.find((x: any) => !x.primary);
    const main = a.contacts.find((x: any) => x.primary);
    expect([200, 204]).toContain((await http.call(API, { token: T, params: { id: a.id, contactId: sub.id } })).status());
    expect([400, 409]).toContain((await http.call(API, { token: T, params: { id: a.id, contactId: main.id } })).status());
    expect((await seed.getLead(a.id)).contacts.map((x: any) => x.id)).toEqual([main.id]);
  });
  test("LEAD-135 `contactId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("LEAD-138 Đầu mối không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Đặt đầu mối chính của Lead", () => {
  const API = "POST /api/leads/{id}/contacts/{contactId}/primary";
  test("LEAD-144 `contactId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("LEAD-147 Đầu mối không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
