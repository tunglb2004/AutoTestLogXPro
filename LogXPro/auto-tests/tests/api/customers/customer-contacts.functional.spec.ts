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
  test("CUS-049 Thêm đầu mối", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getCustomer(String(p.params!.id));
    expect(c.contacts.some((x: any) => x.phone === (p.json as any).phone)).toBe(true);
  });
  test("CUS-050 Thêm với `primary`=true", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json: L.contactBody({ primary: true }) })).status()).toBe(201);
    const prim = (await seed.getCustomer(k.customerId)).contacts.filter((c: any) => c.primary);
    expect(prim).toHaveLength(1);
    expect(prim[0].id).not.toBe(k.lead.contacts[0].id);
  });
  test("CUS-059 Vòng đời đầu mối KH: thêm, xem, sửa, xóa", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json: L.contactBody() })).status()).toBe(201);
    const c = (await seed.getCustomer(k.customerId)).contacts.find((x: any) => !x.primary);
    const phone = L.phone();
    expect((await http.call('PUT /api/customers/{id}/contacts/{contactId}', { token: D, params: { id: k.customerId, contactId: c.id }, json: L.contactBody({ fullName: c.fullName, phone }) })).status()).toBe(200);
    expect((await seed.getCustomer(k.customerId)).contacts.find((x: any) => x.id === c.id).phone).toBe(phone);
    expect([200, 204]).toContain((await http.call('DELETE /api/customers/{id}/contacts/{contactId}', { token: D, params: { id: k.customerId, contactId: c.id } })).status());
    expect((await seed.getCustomer(k.customerId)).contacts.some((x: any) => x.id === c.id)).toBe(false);
  });
  test("CUS-054 Ghi lịch sử", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/customers", id, "dvkhA");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/customers", id, "dvkhA");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Sửa đầu mối khách hàng", () => {
  const API = "PUT /api/customers/{id}/contacts/{contactId}";
  test("CUS-060 Sửa SĐT", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CUS-061 Bỏ đánh dấu chính của đầu mối chính duy nhất", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    const c = (await seed.getCustomer(k.customerId)).contacts[0];
    expect([200, 400]).toContain((await http.call(API, { token: D, params: { id: k.customerId, contactId: c.id }, json: { ...L.contactBody({ fullName: c.fullName, phone: c.phone }), primary: false } })).status());
    expect((await seed.getCustomer(k.customerId)).contacts.filter((x: any) => x.primary)).toHaveLength(1);
  });
  test("CUS-065 Ghi lịch sử", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/customers", id, "dvkhA");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/customers", id, "dvkhA");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Xóa đầu mối khách hàng", () => {
  const API = "DELETE /api/customers/{id}/contacts/{contactId}";
  test("CUS-070 Xóa đầu mối phụ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 204]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CUS-071 Xóa đầu mối cuối cùng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const k = await seed.customer();
    const cur = await seed.getCustomer(k.customerId);
    const res = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: k.customerId, contactId: cur.contacts[0].id } });
    expect([400, 409]).toContain(res.status());
    expect((await seed.getCustomer(k.customerId)).contacts).toHaveLength(cur.contacts.length);
  });
  test("CUS-072 Xóa đầu mối chính", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customerWithContacts(2);
    const main = k.customer.contacts.find((x: any) => x.primary);
    const sub = k.customer.contacts.find((x: any) => !x.primary);
    expect([200, 204]).toContain((await http.call(API, { token: D, params: { id: k.customerId, contactId: main.id } })).status());
    expect((await seed.getCustomer(k.customerId)).contacts.filter((x: any) => x.primary).map((x: any) => x.id)).toEqual([sub.id]);
  });
  test("CUS-075 Xóa lỗi không mất dữ liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    const only = (await seed.getCustomer(k.customerId)).contacts;
    expect(only).toHaveLength(1);
    expect([400, 409]).toContain((await http.call(API, { token: D, params: { id: k.customerId, contactId: only[0].id } })).status());
    const after = (await seed.getCustomer(k.customerId)).contacts;
    expect(after).toHaveLength(1);
    expect(after[0].primary).toBe(true);
  });
});

test.describe("Đặt đầu mối chính của khách hàng", () => {
  const API = "POST /api/customers/{id}/contacts/{contactId}/primary";
  test("CUS-080 Đặt đầu mối phụ thành chính", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CUS-081 Đặt chính cho đầu mối đã là chính", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    const main = (await seed.getCustomer(k.customerId)).contacts.find((x: any) => x.primary);
    expect([200, 400]).toContain((await http.call(API, { token: D, params: { id: k.customerId, contactId: main.id } })).status());
    expect((await seed.getCustomer(k.customerId)).contacts.filter((x: any) => x.primary)).toHaveLength(1);
  });
  test("CUS-084 Ghi lịch sử đổi đầu mối chính", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/customers", id, "dvkhA");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/customers", id, "dvkhA");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});
