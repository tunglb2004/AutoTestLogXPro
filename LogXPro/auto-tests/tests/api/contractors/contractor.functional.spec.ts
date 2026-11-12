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
test.describe("Danh sách, tìm kiếm, lọc nhà thầu", () => {
  const API = "GET /api/contractors";
  test("VDR-001 Xem danh sách nhà thầu", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("VDR-002 Tìm theo mã, tên, MST", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const n = await seed.contractor();
    for (const w of [n.code, n.name.split(' ').slice(3, 5).join(' '), n.taxCode]) expect(items(await data(await http.call(API, { token: Q, query: { search: w, perPage: 100 } }))).map((c: any) => c.id), w).toContain(n.id);
  });
  test("VDR-003 Lọc trạng thái, hạng, nhiều loại hình dịch vụ, khoảng ngày tạo", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const { serviceTypes } = await seed.catalog();
    const n = await seed.contractor({ serviceTypes: [serviceTypes[0]] });
    const n2 = await seed.contractor({ serviceTypes: [serviceTypes[1] ?? serviceTypes[0]] });
    const list = items(await data(await http.call(API, { token: Q, query: { status: 'NEW', tier: V.tierA(), serviceType: serviceTypes.slice(0, 2), createdFrom: today(), createdTo: today(), perPage: 100 } })));
    const ids = list.map((c: any) => c.id);
    expect(ids).toEqual(expect.arrayContaining([n.id, n2.id]));
    for (const c of list) { expect(c.status.code).toBe('NEW'); expect(c.tier.code).toBe(V.tierA()); }
  });
  test("VDR-004 Phân trang không trùng, không sót", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const tag = `pg${randDigits(6)}`;
    for (let i = 0; i < 25; i++) await seed.contractor({ name: `Công ty TNHH Phân trang ${tag} số ${i + 1}` });
    const ids = new Set<string>(); const sizes: number[] = [];
    for (const page of [1, 2, 3]) {
      const list = items(await data(await http.call(API, { token: Q, query: { search: tag, page, perPage: 10 } })));
      sizes.push(list.length);
      for (const c of list) { expect(ids.has(c.id)).toBe(false); ids.add(c.id); }
    }
    expect(sizes).toEqual([10, 10, 5]);
  });
});

test.describe("Tạo nhà thầu", () => {
  const API = "POST /api/contractors";
  test("VDR-013 Tạo nhà thầu đủ trường bắt buộc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.code).toMatch(/^VDR-\d{4,}$/);
    expect(d.status?.code).toBe('NEW');
    const again = await seed.getContractor(d.id);
    expect(again.taxCode).toBe((p.json as any).taxCode);
  });
  test("VDR-014 Nhà thầu mới luôn ở Tạo mới", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const json = { ...(await seed.contractorBody()), status: 'ACTIVE' };
    const res = await http.call(API, { token: roles.qlnt.accessToken, json });
    expect(res.status()).toBe(201);
    expect((await data(res)).status.code).toBe('NEW');
  });
  test("VDR-020 MST đã tồn tại", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const x = await seed.contractor();
    const res = await http.call(API, { token: roles.qlnt.accessToken, json: await seed.contractorBody({ taxCode: x.taxCode }) });
    expect(res.status()).toBe(409);
  });
  test("VDR-021 Nhà thầu dự phòng không hợp lệ", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const d = await seed.terminatedContractor();
    for (const backupContractorId of [d.contractor.id, uuid()]) expect([400, 404, 409]).toContain((await http.call(API, { token: Q, json: await seed.contractorBody({ backupContractorId }) })).status());
  });
  test("VDR-022 2 đầu mối cùng là chính", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const res = await http.call(API, { token: Q, json: await seed.contractorBody({ contacts: [{ ...L.contactBody(), primary: true }, { ...L.contactBody(), primary: true }] }) });
    expect([201, 400]).toContain(res.status());
    if (res.status() === 201) expect((await seed.getContractor((await data(res)).id)).contacts.filter((c: any) => c.primary)).toHaveLength(1);
  });
  test("VDR-023 Request lỗi không để lại dữ liệu", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const json: any = await seed.contractorBody();
    json.contacts = [json.contacts[0], { fullName: 'Lê Văn Bình', phone: '99' }];
    expect((await http.call(API, { token: Q, json })).status()).toBe(400);
    expect(await seed.contractorsByTax(json.taxCode)).toHaveLength(0);
    json.contacts = [json.contacts[0]];
    expect((await http.call(API, { token: Q, json })).status()).toBe(201);
  });
  test("VDR-031 Vòng đời nhà thầu: tạo, xem, sửa, xóa", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const r = await http.call(API, { token: Q, json: await seed.contractorBody() });
    expect(r.status()).toBe(201);
    const id = (await data(r)).id;
    const got = await seed.getContractor(id);
    expect((await http.call('PUT /api/contractors/{id}', { token: Q, params: { id }, json: V.contractorUpdateBody(got, { capabilityDescription: 'Năng lực mới sau đánh giá' }) })).status()).toBe(200);
    expect((await seed.getContractor(id)).capabilityDescription).toBe('Năng lực mới sau đánh giá');
    expect((await http.call('DELETE /api/contractors/{id}', { token: Q, params: { id } })).status()).toBe(204);
    expect((await http.call('GET /api/contractors/{id}', { token: Q, params: { id } })).status()).toBe(404);
  });
});

test.describe("Số liệu tổng quan nhà thầu", () => {
  const API = "GET /api/contractors/stats";
  test("VDR-041 Xem số liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("VDR-042 Số liệu đổi theo thao tác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const before = await data(await http.call(API, { token: Q }));
    await seed.contractor();
    const after = await data(await http.call(API, { token: Q }));
    expect(after.total - before.total).toBe(1);
    expect(JSON.stringify(after)).not.toBe(JSON.stringify(before));
  });
  test("VDR-043 Không phụ thuộc bộ lọc danh sách", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const a = await data(await http.call(API, { token: Q }));
    const b2 = await data(await http.call(API, { token: Q, query: { status: 'NEW' } }));
    expect(b2).toEqual(a);
  });
});

test.describe("Chi tiết nhà thầu", () => {
  const API = "GET /api/contractors/{id}";
  test("VDR-047 Xem chi tiết nhà thầu có hợp đồng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.contracts.length).toBeGreaterThan(0);
    expect(d.serviceTypes.length).toBeGreaterThan(0);
  });
  test("VDR-048 Nhà thầu Dừng hợp tác vẫn xem được", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const d = await seed.terminatedContractor();
    const res = await http.call(API, { token: Q, params: { id: d.contractor.id } });
    expect(res.status()).toBe(200);
    expect((await data(res)).status.code).toBe('TERMINATED');
  });
});

test.describe("Sửa hồ sơ nhà thầu", () => {
  const API = "PUT /api/contractors/{id}";
  test("VDR-054 Sửa tên và năng lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getContractor(String(p.params!.id));
    expect(c.capabilityDescription).toBe('Bổ sung năng lực lưu kho lạnh');
  });
  test("VDR-055 Sửa nhà thầu Dừng hợp tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const d = await seed.terminatedContractor();
    const res = await http.call(API, { token: roles.qlnt.accessToken, params: { id: d.contractor.id }, json: V.contractorUpdateBody(d.contractor, { name: 'Tên mới không được lưu' }) });
    expect([400, 409]).toContain(res.status());
  });
  test("VDR-056 MST mới trùng nhà thầu khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    const x = await seed.contractor();
    expect((await http.call(API, { token: Q, params: { id: h.id }, json: V.contractorUpdateBody(h, { taxCode: x.taxCode }) })).status()).toBe(409);
    expect((await seed.getContractor(h.id)).taxCode).toBe(h.taxCode);
  });
  test("VDR-057 Không đổi hạng qua API sửa", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    expect([200, 400]).toContain((await http.call(API, { token: Q, params: { id: h.id }, json: { ...V.contractorUpdateBody(h), tier: V.tierB() } })).status());
    expect((await seed.getContractor(h.id)).tier.code).toBe(h.tier.code);
  });
  test("VDR-061 Ghi lịch sử chi tiết", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/contractors", id, "qlnt");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/contractors", id, "qlnt");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Xóa nhà thầu", () => {
  const API = "DELETE /api/contractors/{id}";
  test("VDR-065 Xóa nhà thầu tạo nhầm", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([204]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("VDR-066 Nhà thầu đã có HĐ, kể cả HĐ đã hủy", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.contractorWithContract({ pending: true });
    await http.call('POST /api/contractor-contracts/{id}/cancel', { token: roles.qlnt.accessToken, params: { id: c.contract.id }, json: { reason: 'Nhà thầu rút' } });
    const res = await http.call(API, { token: roles.qlnt.accessToken, params: { id: c.contractor.id } });
    expect([400, 409]).toContain(res.status());
    expect((await http.call('GET /api/contractors/{id}', { token: roles.qlnt.accessToken, params: { id: c.contractor.id } })).status()).toBe(200);
  });
  test("VDR-067 Nhà thầu không ở Tạo mới", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractorWithContract();
    const d = await seed.terminatedContractor();
    for (const id of [h.contractor.id, d.contractor.id]) expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id } })).status());
  });
  test("VDR-069 Xóa lỗi không mất dữ liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract({ pending: true });
    await http.call('POST /api/contractor-contracts/{id}/cancel', { token: Q, params: { id: c.contract.id }, json: { reason: 'Nhà thầu rút' } });
    const before = await seed.getContractor(c.contractor.id);
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: c.contractor.id } })).status());
    const after = await seed.getContractor(c.contractor.id);
    expect(after.contracts.length).toBe(before.contracts.length);
    expect(after.contacts.length).toBe(before.contacts.length);
  });
  test("VDR-070 Xóa xong không còn trong danh sách", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const n = await seed.contractor();
    expect((await http.call(API, { token: Q, params: { id: n.id } })).status()).toBe(204);
    expect(await seed.contractorsByTax(n.taxCode)).toHaveLength(0);
    expect((await http.call('POST /api/contractors', { token: Q, json: await seed.contractorBody({ taxCode: n.taxCode }) })).status()).toBe(201);
  });
});

test.describe("Mã tự sinh của nhà thầu", () => {
  const API = "POST /api/contractors";
  test("VDR-180 Mã nhà thầu tự sinh tăng dần theo thứ tự tạo", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const num = (code: string) => Number(String(code).replace(/\D/g, ''));
    const r1 = await http.call(API, { token: roles.qlnt.accessToken, json: await seed.contractorBody() });
    expect(r1.status()).toBe(201);
    const r2 = await http.call(API, { token: roles.qlnt.accessToken, json: await seed.contractorBody() });
    expect(r2.status()).toBe(201);
    const [a, b2] = [(await data(r1)).code, (await data(r2)).code];
    expect(a).toMatch(/^VDR-\d{4,}$/);
    expect(b2).toMatch(/^VDR-\d{4,}$/);
    expect(num(b2), `${a} -> ${b2}`).toBeGreaterThan(num(a));
  });
});
