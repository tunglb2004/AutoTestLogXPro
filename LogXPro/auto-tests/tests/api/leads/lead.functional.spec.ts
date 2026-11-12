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
  test("LEAD-001 NVKD xem danh sách Lead của mình", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const mine = [await seed.lead(), await seed.lead(), await seed.lead()];
    const other = await seed.lead('nvkdB');
    const res = await http.call(API, { token: T, query: { search: TEST_RUN_ID, page: 1, perPage: 100 } });
    expect(res.status()).toBe(200);
    const ids = items(await data(res)).map((l: any) => l.id);
    for (const l of mine) expect(ids).toContain(l.id);
    expect(ids).not.toContain(other.id);
    const pos = mine.map((l) => ids.indexOf(l.id));
    expect(pos[2]).toBeLessThan(pos[1]);
    expect(pos[1]).toBeLessThan(pos[0]);
  });
  test("LEAD-002 Không thấy Lead của NVKD khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const other = await seed.lead('nvkdB');
    const res = await http.call(API, { token: roles.nvkdA.accessToken, query: { search: other.code, perPage: 100 } });
    expect(res.status()).toBe(200);
    expect(items(await data(res)).some((l: any) => l.id === other.id)).toBe(false);
  });
  test("LEAD-003 Tìm khớp một phần theo tên, mã, MST, tên đầu mối", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead('nvkdA', { contacts: [{ ...L.contactBody({ fullName: 'Nguyễn Văn Kiểm Thử' }), primary: true }] });
    const words = [a.companyName.split(' ').slice(-3, -1).join(' '), a.code.slice(-4), a.taxCode.slice(0, 5), 'Văn Kiểm Thử'];
    for (const w of words) {
      const res = await http.call(API, { token: T, query: { search: w, perPage: 100 } });
      expect(res.status(), w).toBe(200);
      expect(items(await data(res)).map((l: any) => l.id), w).toContain(a.id);
    }
    const none = await http.call(API, { token: T, query: { search: `khong-ton-tai-${uuid()}` } });
    expect(none.status()).toBe(200);
    expect(items(await data(none))).toHaveLength(0);
  });
  test("LEAD-004 Lọc nhiều giá trị `status`, `source`, `industryId`, `route`, khoảng ngày tạo", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const active = await seed.lead('nvkdA', { source: 'REFERRAL' });
    const inactive = await seed.inactiveLead();
    const converted = (await seed.customer()).lead;
    const two = items(await data(await http.call(API, { token: T, query: { search: TEST_RUN_ID, status: ['ACTIVE', 'INACTIVE'], perPage: 100 } })));
    const ids = two.map((l: any) => l.id);
    expect(ids).toEqual(expect.arrayContaining([active.id, inactive.id]));
    expect(ids).not.toContain(converted.id);
    for (const l of two) expect(['ACTIVE', 'INACTIVE']).toContain(l.status);
    const ref = items(await data(await http.call(API, { token: T, query: { source: 'REFERRAL', createdFrom: today(), createdTo: today(), perPage: 100 } })));
    expect(ref.map((l: any) => l.id)).toContain(active.id);
    for (const l of ref) expect(l.source).toBe('REFERRAL');
  });
  test("LEAD-005 Phân trang không trùng, không sót", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const tag = `pg${randDigits(6)}`;
    for (let i = 0; i < 25; i++) await seed.lead('nvkdA', { companyName: `Công ty TNHH Phân trang ${tag} số ${i + 1}` });
    const pages = [];
    for (const page of [1, 2, 3]) {
      const res = await http.call(API, { token: T, query: { search: tag, page, perPage: 10 } });
      expect(res.status()).toBe(200);
      pages.push(await data(res));
    }
    expect(pages.map((p) => items(p).length)).toEqual([10, 10, 5]);
    const all = pages.flatMap((p) => items(p).map((l: any) => l.id));
    expect(new Set(all).size).toBe(25);
    expect(pages[0].meta?.pagination?.total).toBe(25);
  });
});

test.describe("Tạo Lead", () => {
  const API = "POST /api/leads";
  test("LEAD-014 Tạo Lead đủ trường bắt buộc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.code).toMatch(/^LED-\d{4,}$/);
    expect(d.status).toBe('ACTIVE');
    expect(d.contacts).toHaveLength(1);
    expect(d.contacts[0].primary).toBe(true);
    const again = await seed.getLead(d.id);
    expect(again.companyName).toBe((p.json as any).companyName);
    expect(again.taxCode).toBe((p.json as any).taxCode);
  });
  test("LEAD-015 Lead mới luôn ở trạng thái Đang hoạt động", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const json = { ...(await seed.leadBody()), status: 'INACTIVE' };
    const res = await http.call(API, { token: roles.nvkdA.accessToken, json });
    expect([200, 201]).toContain(res.status());
    expect((await data(res)).status).toBe('ACTIVE');
  });
  test("LEAD-022 MST đã thuộc Lead khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const existing = await seed.lead();
    const res = await http.call(API, { token: roles.nvkdA.accessToken, json: await seed.leadBody('nvkdA', { taxCode: existing.taxCode }) });
    expect(res.status()).toBe(409);
    const found = items(await data(await http.call('GET /api/leads', { token: roles.nvkdA.accessToken, query: { search: existing.taxCode } })));
    expect(found).toHaveLength(1);
  });
  test("LEAD-023 MST đã thuộc khách hàng chính thức", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.customer();
    const res = await http.call(API, { token: roles.nvkdA.accessToken, json: await seed.leadBody('nvkdA', { taxCode: c.lead.taxCode }) });
    expect(res.status()).toBe(409);
  });
  test("LEAD-024 Gửi 2 đầu mối cùng `primary`=true", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const res = await http.call(API, { token: T, json: await seed.leadBody('nvkdA', { contacts: [{ ...L.contactBody(), primary: true }, { ...L.contactBody(), primary: true }] }) });
    expect([200, 201, 400]).toContain(res.status());
    if (res.status() !== 400) expect((await seed.getLead((await data(res)).id)).contacts.filter((c: any) => c.primary)).toHaveLength(1);
  });
  test("LEAD-025 Giao người phụ trách khác người tạo", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    // Người dùng xác nhận 2026-11-05: API không bắt buộc trả lại data (có thể null), đạt khi đúng mã HTTP.
    // Phần kiểm nghiệp vụ của case đọc lại theo MST vừa gửi, không dựa vào body trả về.
    const json = await seed.leadBody('nvkdB');
    const res = await http.call(API, { token: T, json });
    expect([200, 201]).toContain(res.status());
    const ofB = await seed.leadsByTax(json.taxCode as string, 'nvkdB');
    expect(ofB).toHaveLength(1);
    expect(ofB[0].ownerUserId ?? roles.nvkdB.userId).toBe(roles.nvkdB.userId);
    expect(await seed.leadsByTax(json.taxCode as string, 'nvkdA')).toHaveLength(0);
  });
  test("LEAD-026 `ownerUserId` không phải NVKD đang hoạt động", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const invalid = [process.env.LOCKED_NVKD_USER_ID, roles.dvkhA.userId].filter(Boolean) as string[];
    for (const ownerUserId of invalid) {
      const json = await seed.leadBody('nvkdA', { ownerUserId });
      const res = await http.call(API, { token: T, json });
      expect([400, 409], ownerUserId).toContain(res.status());
      expect(await seed.leadsByTax(json.taxCode as string)).toHaveLength(0);
    }
  });
  test("LEAD-027 Request lỗi không để lại dữ liệu", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const json: any = await seed.leadBody();
    json.contacts = [json.contacts[0], { fullName: 'Trần Thị Hà', phone: '12345' }];
    const bad = await http.call(API, { token: roles.nvkdA.accessToken, json });
    expect(bad.status()).toBe(400);
    json.contacts = [json.contacts[0]];
    const good = await http.call(API, { token: roles.nvkdA.accessToken, json });
    expect([200, 201]).toContain(good.status());
    expect((await data(good)).contacts).toHaveLength(1);
  });
  test("LEAD-037 Gửi `industryOther` khi không chọn Khác", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const res = await http.call(API, { token: T, json: await seed.leadBody('nvkdA', { industryOther: 'Gốm sứ' }) });
    expect([200, 201, 400]).toContain(res.status());
    if (res.status() !== 400) {
      const d = await seed.getLead((await data(res)).id);
      expect(d.industryOther ?? null).toBeNull();
    }
  });
  test("LEAD-038 MST trùng Lead đang Ngưng hoạt động", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const y = await seed.inactiveLead('nvkdB');
    const res = await http.call(API, { token: roles.nvkdA.accessToken, json: await seed.leadBody('nvkdA', { taxCode: y.taxCode }) });
    expect(res.status()).toBe(409);
    const after = await seed.getLead(y.id, 'nvkdB');
    expect(after.status).toBe('INACTIVE');
    expect(after.ownerUserId).toBe(roles.nvkdB.userId);
  });
  test("LEAD-039 MST trùng Lead đã chuyển đổi hoặc Lead đang hoạt động của người khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const converted = (await seed.customer()).lead;
    const activeOfB = await seed.lead('nvkdB');
    for (const tax of [converted.taxCode, activeOfB.taxCode]) {
      const res = await http.call(API, { token: roles.nvkdA.accessToken, json: await seed.leadBody('nvkdA', { taxCode: tax }) });
      expect(res.status(), tax).toBe(409);
    }
    expect((await seed.getLead(activeOfB.id, 'nvkdB')).ownerUserId).toBe(roles.nvkdB.userId);
  });
  test("LEAD-035 Chọn ngành Khác bắt buộc nhập tên ngành", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const { otherIndustryId } = await seed.catalog();
    expect(otherIndustryId, 'Danh mục ngành hàng không có ngành Khác').toBeTruthy();
    const json: any = await seed.leadBody('nvkdA', { industryIds: [otherIndustryId] });
    delete json.industryOther;
    const r1 = await http.call(API, { token: roles.nvkdA.accessToken, json });
    expect(r1.status()).toBe(400);
    const r2 = await http.call(API, { token: roles.nvkdA.accessToken, json: { ...json, industryOther: 'Gốm sứ' } });
    expect([200, 201]).toContain(r2.status());
    const lead = await seed.getLead((await data(r2)).id);
    expect(lead.industryOther).toBe('Gốm sứ');
  });
});

test.describe("Danh sách người phụ trách Lead", () => {
  const API = "GET /api/leads/assignable-owners";
  test("LEAD-040 Lấy danh sách người phụ trách", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const ids = items(d).map((u: any) => u.id ?? u.userId);
    expect(ids).toEqual(expect.arrayContaining([roles.nvkdA.userId, roles.nvkdB.userId]));
  });
  test("LEAD-041 Loại tài khoản khóa và role khác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const res = await http.call(API, { token: T });
    expect(res.status()).toBe(200);
    const ids = items(await data(res)).map((u: any) => u.id ?? u.userId);
    expect(ids).not.toContain(roles.dvkhA.userId);
    if (process.env.LOCKED_NVKD_USER_ID) expect(ids).not.toContain(process.env.LOCKED_NVKD_USER_ID);
  });
});

test.describe("Số liệu tổng quan Lead", () => {
  const API = "GET /api/leads/stats";
  test("LEAD-075 Xem số liệu tổng quan", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const nums = Object.values(d).filter((v) => typeof v === 'number') as number[];
    expect(nums.length).toBeGreaterThanOrEqual(4);
    for (const n of nums) expect(n).toBeGreaterThanOrEqual(0);
  });
  test("LEAD-076 Số liệu đổi theo thao tác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const before = await data(await http.call(API, { token: T }));
    await seed.lead();
    await seed.inactiveLead();
    const after = await data(await http.call(API, { token: T }));
    const key = (o: any, ...names: string[]) => names.map((n) => o[n]).find((v) => typeof v === 'number') as number;
    expect(key(after, 'total') - key(before, 'total')).toBe(2);
    expect(key(after, 'inactive', 'inactiveCount') - key(before, 'inactive', 'inactiveCount')).toBe(1);
    expect(key(after, 'active', 'activeCount') - key(before, 'active', 'activeCount')).toBe(1);
  });
  test("LEAD-077 Chỉ tính Lead trong phạm vi user", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const stats = await data(await http.call(API, { token: T }));
    const list = await data(await http.call('GET /api/leads', { token: T, query: { perPage: 1 } }));
    expect(stats.total).toBe(list.meta?.pagination?.total);
  });
});

test.describe("Chi tiết Lead", () => {
  const API = "GET /api/leads/{id}";
  test("LEAD-081 Xem chi tiết Lead đang hoạt động", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.id).toBe(p.params!.id);
    expect(d.status).toBe('ACTIVE');
    expect(Array.isArray(d.contacts)).toBe(true);
    expect(Array.isArray(d.documents)).toBe(true);
  });
  test("LEAD-082 Lead Ngưng hoạt động có lý do", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const l = await seed.inactiveLead();
    const res = await http.call(API, { token: T, params: { id: l.id } });
    expect(res.status()).toBe(200);
    const d = await data(res);
    expect(d.status).toBe('INACTIVE');
    expect(d.deactivationReason).toBe('Khách tạm dừng nhu cầu vận chuyển');
  });
  test("LEAD-083 Lead đã chuyển đổi chỉ đọc", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const l = (await seed.customer()).lead;
    const res = await http.call(API, { token: T, params: { id: l.id } });
    expect(res.status()).toBe(200);
    const d = await data(res);
    expect(d.status).toBe('CONVERTED');
    expect(d.contacts ?? []).toHaveLength(0);
  });
});

test.describe("Sửa thông tin Lead", () => {
  const API = "PUT /api/leads/{id}";
  test("LEAD-089 Sửa tên công ty và địa chỉ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const again = await seed.getLead(String(p.params!.id));
    expect(again.headOfficeAddress).toBe((p.json as any).headOfficeAddress);
    expect(again.status).toBe('ACTIVE');
  });
  test("LEAD-090 Sửa không đổi trạng thái", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const l = await seed.lead();
    expect((await http.call(API, { token: T, params: { id: l.id }, json: L.leadUpdateBody(l, { companyName: L.companyName() }) })).status()).toBe(200);
    expect((await seed.getLead(l.id)).status).toBe('ACTIVE');
  });
  test("LEAD-093 Sửa Lead Ngưng hoạt động hoặc Đã chuyển đổi", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const inactive = await seed.inactiveLead();
    const converted = (await seed.customer()).lead;
    for (const l of [inactive, converted]) {
      const cur = await seed.getLead(l.id);
      const res = await http.call(API, { token: roles.nvkdA.accessToken, params: { id: l.id }, json: L.leadUpdateBody(cur, { companyName: 'Tên mới không được lưu' }) });
      expect([400, 409], l.status).toContain(res.status());
      expect((await seed.getLead(l.id)).companyName).toBe(cur.companyName);
    }
  });
  test("LEAD-094 Đổi MST trùng Lead hoặc KH khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const x = await seed.lead();
    const res = await http.call(API, { token: T, params: { id: a.id }, json: L.leadUpdateBody(a, { taxCode: x.taxCode }) });
    expect(res.status()).toBe(409);
    expect((await seed.getLead(a.id)).taxCode).toBe(a.taxCode);
  });
  test("LEAD-095 Không đổi người phụ trách qua API sửa", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const res = await http.call(API, { token: T, params: { id: a.id }, json: { ...L.leadUpdateBody(a), ownerUserId: roles.dvkhA.userId } });
    expect([200, 400]).toContain(res.status());
    expect((await seed.getLead(a.id)).ownerUserId).toBe(roles.nvkdA.userId);
  });
  test("LEAD-101 Giữ nguyên MST của chính Lead khi sửa", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.lead();
    const res = await http.call(API, { token: roles.nvkdA.accessToken, params: { id: a.id }, json: L.leadUpdateBody(a, { companyName: L.companyName() }) });
    expect(res.status()).toBe(200);
    expect((await seed.getLead(a.id)).taxCode).toBe(a.taxCode);
  });
  test("LEAD-102 Đổi MST trùng Lead Ngưng hoạt động", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.lead();
    const y = await seed.inactiveLead();
    const res = await http.call(API, { token: roles.nvkdA.accessToken, params: { id: a.id }, json: L.leadUpdateBody(a, { taxCode: y.taxCode }) });
    expect(res.status()).toBe(409);
    expect((await seed.getLead(a.id)).taxCode).toBe(a.taxCode);
  });
  test("LEAD-103 Đổi MST trùng khách hàng chính thức", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const a = await seed.lead();
    const c = await seed.customer();
    const res = await http.call(API, { token: roles.nvkdA.accessToken, params: { id: a.id }, json: L.leadUpdateBody(a, { taxCode: c.lead.taxCode }) });
    expect(res.status()).toBe(409);
    expect((await seed.getLead(a.id)).taxCode).toBe(a.taxCode);
  });
  test("LEAD-104 Đổi MST sang giá trị mới hợp lệ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const newTax = L.taxCode(13);
    expect((await http.call(API, { token: T, params: { id: a.id }, json: L.leadUpdateBody(a, { taxCode: newTax }) })).status()).toBe(200);
    expect((await seed.getLead(a.id)).taxCode).toBe(newTax);
    const again = await http.call('POST /api/leads', { token: T, json: await seed.leadBody('nvkdA', { taxCode: a.taxCode }) });
    expect([200, 201]).toContain(again.status());
  });
  test("LEAD-105 Sửa ngành sang Khác thiếu tên ngành", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const { otherIndustryId } = await seed.catalog();
    expect(otherIndustryId, 'Danh mục ngành hàng không có ngành Khác').toBeTruthy();
    const a = await seed.lead();
    const res = await http.call(API, { token: T, params: { id: a.id }, json: L.leadUpdateBody(a, { industryIds: [otherIndustryId], industryOther: undefined }) });
    expect(res.status()).toBe(400);
    expect((await seed.getLead(a.id)).industries.map((i: any) => i.id)).toEqual(a.industries.map((i: any) => i.id));
  });
  test("LEAD-097 Ghi lịch sử giá trị cũ và mới", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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

test.describe("Mã tự sinh của Lead", () => {
  const API = "POST /api/leads";
  test("LEAD-219 Mã Lead tự sinh tăng dần theo thứ tự tạo", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const num = (code: string) => Number(String(code).replace(/\D/g, ''));
    const r1 = await http.call(API, { token: roles.nvkdA.accessToken, json: await seed.leadBody() });
    expect([200, 201]).toContain(r1.status());
    const r2 = await http.call(API, { token: roles.nvkdA.accessToken, json: await seed.leadBody() });
    expect([200, 201]).toContain(r2.status());
    const [a, b2] = [(await data(r1)).code, (await data(r2)).code];
    expect(a).toMatch(/^LED-\d{4,}$/);
    expect(b2).toMatch(/^LED-\d{4,}$/);
    expect(num(b2), `${a} -> ${b2}`).toBeGreaterThan(num(a));
  });
});
