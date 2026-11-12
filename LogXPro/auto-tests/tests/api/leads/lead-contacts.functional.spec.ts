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
  test("LEAD-109 Thêm đầu mối rồi đặt làm đầu mối chính (theo luồng web)", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    // Theo luồng web (người dùng chốt 2026-11-05): form thêm đầu mối không có ô "chính";
    // thêm đầu mối trước, rồi "Đặt làm liên hệ chính" bằng API riêng.
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const oldPrimary = a.contacts.find((c: any) => c.primary);
    const added = L.contactBody();
    const res = await http.call(API, { token: T, params: { id: a.id }, json: { fullName: added.fullName, phone: added.phone } });
    expect(res.status()).toBe(201);
    const created = (await seed.getLead(a.id)).contacts.find((c: any) => c.phone === added.phone);
    expect(created).toBeTruthy();
    const setPrimary = await http.call('POST /api/leads/{id}/contacts/{contactId}/primary', { token: T, params: { id: a.id, contactId: created.id } });
    expect(setPrimary.status()).toBe(200);
    const after = await seed.getLead(a.id);
    const primaries = after.contacts.filter((c: any) => c.primary);
    expect(primaries).toHaveLength(1);
    expect(primaries[0].id).toBe(created.id);
    expect(after.contacts.find((c: any) => c.id === oldPrimary.id).primary).toBe(false);
  });
  test("LEAD-110 Thêm đầu mối cho Lead không hoạt động", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const l = await seed.inactiveLead();
    expect([400, 409]).toContain((await http.call(API, { token: T, params: { id: l.id }, json: L.contactBody() })).status());
    expect((await seed.getLead(l.id)).contacts).toHaveLength(1);
  });
  test("LEAD-117 Vòng đời đầu mối: thêm, xem, sửa, xóa", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const created = await http.call(API, { token: T, params: { id: a.id }, json: L.contactBody() });
    expect(created.status()).toBe(201);
    const c = (await seed.getLead(a.id)).contacts.find((x: any) => x.id !== a.contacts[0].id);
    expect(c).toBeTruthy();
    const newPhone = L.phone();
    expect((await http.call('PUT /api/leads/{id}/contacts/{contactId}', { token: T, params: { id: a.id, contactId: c.id }, json: L.contactBody({ fullName: c.fullName, phone: newPhone }) })).status()).toBe(200);
    expect((await seed.getLead(a.id)).contacts.find((x: any) => x.id === c.id).phone).toBe(newPhone);
    expect([200, 204]).toContain((await http.call('DELETE /api/leads/{id}/contacts/{contactId}', { token: T, params: { id: a.id, contactId: c.id } })).status());
    const after = await seed.getLead(a.id);
    expect(after.contacts.map((x: any) => x.id)).toEqual([a.contacts[0].id]);
  });
  test("LEAD-106 Thêm đầu mối mới", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const again = await seed.getLead(String(p.params!.id));
    expect(again.contacts).toHaveLength(2);
    expect(again.contacts.filter((c: any) => c.primary)).toHaveLength(1);
  });
  test("LEAD-112 Ghi lịch sử thêm đầu mối", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/leads", id, "nvkdA");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/leads", id, "nvkdA");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Sửa đầu mối liên hệ Lead", () => {
  const API = "PUT /api/leads/{id}/contacts/{contactId}";
  test("LEAD-118 Sửa SĐT và chức vụ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const again = await seed.getLead(String(p.params!.id));
    expect(again.contacts.find((c: any) => c.id === p.params!.contactId).phone).toBe((p.json as any).phone);
  });
  test("LEAD-121 Bỏ đánh dấu chính của đầu mối chính duy nhất", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const c = a.contacts[0];
    const res = await http.call(API, { token: T, params: { id: a.id, contactId: c.id }, json: { ...L.contactBody({ fullName: c.fullName, phone: c.phone }), primary: false } });
    expect([200, 400]).toContain(res.status());
    expect((await seed.getLead(a.id)).contacts.filter((x: any) => x.primary)).toHaveLength(1);
  });
  test("LEAD-122 Sửa đầu mối của Lead đã chuyển đổi", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const c = await seed.customer();
    const lead = await seed.getLead(c.lead.id);
    const contactId = c.lead.contacts[0].id;
    expect([400, 409]).toContain((await http.call(API, { token: T, params: { id: c.lead.id, contactId }, json: L.contactBody() })).status());
    expect((await seed.getLead(c.lead.id)).updatedAt).toBe(lead.updatedAt);
  });
  test("LEAD-124 Ghi lịch sử sửa đầu mối", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/leads", id, "nvkdA");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/leads", id, "nvkdA");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Xóa đầu mối liên hệ Lead", () => {
  const API = "DELETE /api/leads/{id}/contacts/{contactId}";
  test("LEAD-129 Xóa đầu mối phụ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 204]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const again = await seed.getLead(String(p.params!.id));
    expect(again.contacts.some((c: any) => c.id === p.params!.contactId)).toBe(false);
    expect(again.contacts.filter((c: any) => c.primary)).toHaveLength(1);
  });
  test("LEAD-130 Xóa đầu mối cuối cùng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.lead();
    const res = await http.call(API, { token: roles.nvkdA.accessToken, params: { id: a.id, contactId: a.contacts[0].id } });
    expect([400, 409]).toContain(res.status());
    expect((await seed.getLead(a.id)).contacts).toHaveLength(1);
  });
  test("LEAD-131 Xóa đầu mối chính", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.leadWithContacts(3);
    const primary = a.contacts.find((c: any) => c.primary);
    const res = await http.call(API, { token: roles.nvkdA.accessToken, params: { id: a.id, contactId: primary.id } });
    expect([200, 204]).toContain(res.status());
    const after = await seed.getLead(a.id);
    const remaining = a.contacts.filter((c: any) => c.id !== primary.id);
    expect(after.contacts.filter((c: any) => c.primary).map((c: any) => c.id)).toEqual([remaining[0].id]);
  });
  test("LEAD-134 Xóa lỗi không mất dữ liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const hist = (await seed.history('/api/leads', a.id, 'nvkdA')).length;
    expect([400, 409]).toContain((await http.call(API, { token: T, params: { id: a.id, contactId: a.contacts[0].id } })).status());
    const after = await seed.getLead(a.id);
    expect(after.contacts).toHaveLength(1);
    expect(after.contacts[0].primary).toBe(true);
    expect((await seed.history('/api/leads', a.id, 'nvkdA')).length).toBe(hist);
  });
});

test.describe("Đặt đầu mối chính của Lead", () => {
  const API = "POST /api/leads/{id}/contacts/{contactId}/primary";
  test("LEAD-139 Đặt đầu mối phụ thành chính", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const again = await seed.getLead(String(p.params!.id));
    expect(again.contacts.filter((c: any) => c.primary).map((c: any) => c.id)).toEqual([p.params!.contactId]);
  });
  test("LEAD-140 Đặt chính khi Lead không hoạt động", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.leadWithContacts(2);
    await http.call('POST /api/leads/{id}/deactivate', { token: T, params: { id: a.id }, json: { reason: 'Tạm dừng' } });
    const sub = a.contacts.find((x: any) => !x.primary);
    expect([400, 409]).toContain((await http.call(API, { token: T, params: { id: a.id, contactId: sub.id } })).status());
    expect((await seed.getLead(a.id)).contacts.find((x: any) => x.primary).id).toBe(a.contacts.find((x: any) => x.primary).id);
  });
  test("LEAD-143 Không có trạng thái 2 đầu mối chính", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.leadWithContacts(3);
    for (const c of a.contacts.filter((x: any) => !x.primary)) {
      expect((await http.call(API, { token: T, params: { id: a.id, contactId: c.id } })).status()).toBe(200);
      expect((await seed.getLead(a.id)).contacts.filter((x: any) => x.primary).map((x: any) => x.id)).toEqual([c.id]);
    }
  });
});
