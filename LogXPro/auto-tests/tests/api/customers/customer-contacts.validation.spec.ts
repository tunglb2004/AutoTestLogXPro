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
import { schemas } from '../../../src/api/schemas/customer.schema';
test.describe("Thêm đầu mối khách hàng", () => {
  const API = "POST /api/customers/{id}/contacts";
  test("CUS-051 Thiếu tên, SĐT sai", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    for (const json of [{ ...L.contactBody(), fullName: undefined }, L.contactBody({ phone: '84123' })]) expect((await http.call(API, { token: D, params: { id: k.customerId }, json })).status()).toBe(400);
  });
  test("CUS-052 `fullName` 100/101 ký tự", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json: L.contactBody({ fullName: textOfLength(100, 'Trần Thị ') }) })).status()).toBe(201);
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json: L.contactBody({ fullName: textOfLength(101, 'Trần Thị ') }) })).status()).toBe(400);
  });
  test("CUS-058 Khách hàng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Sửa đầu mối khách hàng", () => {
  const API = "PUT /api/customers/{id}/contacts/{contactId}";
  test("CUS-062 Email sai", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customerWithContacts(2);
    const c = k.customer.contacts[1];
    expect((await http.call(API, { token: D, params: { id: k.customerId, contactId: c.id }, json: L.contactBody({ fullName: c.fullName, phone: c.phone, email: 'x@' }) })).status()).toBe(400);
  });
  test("CUS-063 `email` 100/101 ký tự", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customerWithContacts(2);
    const c = k.customer.contacts[1];
    const mail = (n: number) => `${'b'.repeat(n - 12)}@example.vn`;
    expect((await http.call(API, { token: D, params: { id: k.customerId, contactId: c.id }, json: L.contactBody({ fullName: c.fullName, phone: c.phone, email: mail(100) }) })).status()).toBe(200);
    expect((await http.call(API, { token: D, params: { id: k.customerId, contactId: c.id }, json: L.contactBody({ fullName: c.fullName, phone: c.phone, email: mail(101) }) })).status()).toBe(400);
  });
  test("CUS-066 `contactId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CUS-069 Đầu mối không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Xóa đầu mối khách hàng", () => {
  const API = "DELETE /api/customers/{id}/contacts/{contactId}";
  test("CUS-073 KH còn đúng 2 đầu mối", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customerWithContacts(2);
    const main = k.customer.contacts.find((x: any) => x.primary);
    const sub = k.customer.contacts.find((x: any) => !x.primary);
    expect([200, 204]).toContain((await http.call(API, { token: D, params: { id: k.customerId, contactId: sub.id } })).status());
    expect([400, 409]).toContain((await http.call(API, { token: D, params: { id: k.customerId, contactId: main.id } })).status());
  });
  test("CUS-076 `contactId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CUS-079 Đầu mối không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Đặt đầu mối chính của khách hàng", () => {
  const API = "POST /api/customers/{id}/contacts/{contactId}/primary";
  test("CUS-085 `contactId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CUS-088 Đầu mối không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, contactId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
