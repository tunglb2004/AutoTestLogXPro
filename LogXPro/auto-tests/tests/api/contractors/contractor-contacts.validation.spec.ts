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
test.describe("Thêm đầu mối nhà thầu", () => {
  const API = "POST /api/contractors/{id}/contacts";
  test("VDR-078 Thiếu tên, SĐT sai", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    for (const json of [{ ...L.contactBody(), fullName: undefined }, L.contactBody({ phone: '99' })]) expect((await http.call(API, { token: Q, params: { id: h.id }, json })).status()).toBe(400);
  });
  test("VDR-079 `email` 255/256, `note` 500/501", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    const mail = (n: number) => `${'c'.repeat(n - 12)}@example.vn`;
    for (const [v, ok] of [[{ email: mail(255) }, true], [{ email: mail(256) }, false], [{ note: textOfLength(500) }, true], [{ note: textOfLength(501) }, false]] as const) {
      expect((await http.call(API, { token: Q, params: { id: h.id }, json: L.contactBody(v as any) })).status(), Object.keys(v)[0]).toBe(ok ? 201 : 400);
    }
  });
  test("VDR-085 Nhà thầu không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Sửa đầu mối nhà thầu", () => {
  const API = "PUT /api/contractors/{id}/contacts/{contactId}";
  test("VDR-088 SĐT sai", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    const c = h.contacts[0];
    expect((await http.call(API, { token: Q, params: { id: h.id, contactId: c.id }, json: L.contactBody({ fullName: c.fullName, phone: 'abc' }) })).status()).toBe(400);
  });
  test("VDR-089 `fullName` 100/101", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    const c = h.contacts[0];
    expect((await http.call(API, { token: Q, params: { id: h.id, contactId: c.id }, json: L.contactBody({ fullName: textOfLength(100, 'Phạm Minh ') }) })).status()).toBe(200);
    expect((await http.call(API, { token: Q, params: { id: h.id, contactId: c.id }, json: L.contactBody({ fullName: textOfLength(101, 'Phạm Minh ') }) })).status()).toBe(400);
  });
  test("VDR-092 `contactId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("VDR-095 Đầu mối không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Xóa đầu mối nhà thầu", () => {
  const API = "DELETE /api/contractors/{id}/contacts/{contactId}";
  test("VDR-098 Nhà thầu còn đúng 2 đầu mối", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    await http.call('POST /api/contractors/{id}/contacts', { token: Q, params: { id: h.id }, json: L.contactBody() });
    const cs = (await seed.getContractor(h.id)).contacts;
    const sub = cs.find((x: any) => !x.primary);
    const main = cs.find((x: any) => x.primary);
    expect([200, 204]).toContain((await http.call(API, { token: Q, params: { id: h.id, contactId: sub.id } })).status());
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: h.id, contactId: main.id } })).status());
  });
  test("VDR-101 `contactId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("VDR-104 Đầu mối không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
