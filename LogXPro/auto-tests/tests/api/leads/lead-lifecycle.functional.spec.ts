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
test.describe("Ngưng hoạt động Lead", () => {
  const API = "POST /api/leads/{id}/deactivate";
  test("LEAD-148 Ngưng Lead có lý do", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const again = await seed.getLead(String(p.params!.id));
    expect(again.status).toBe('INACTIVE');
    expect(again.deactivationReason).toBe((p.json as any).reason);
  });
  test("LEAD-149 Ngưng không xóa bản ghi", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    expect((await http.call(API, p)).status()).toBe(200);
    const again = await http.call('GET /api/leads/{id}', { token: roles.nvkdA.accessToken, params: p.params });
    expect(again.status()).toBe(200);
    const list = items(await data(await http.call('GET /api/leads', { token: roles.nvkdA.accessToken, query: { status: 'INACTIVE', perPage: 100 } })));
    expect(list.some((l: any) => l.id === p.params!.id)).toBe(true);
  });
  test("LEAD-152 Ngưng Lead đã chuyển đổi", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const converted = (await seed.customer()).lead;
    const res = await http.call(API, { token: roles.nvkdA.accessToken, params: { id: converted.id }, json: { reason: 'Không còn nhu cầu' } });
    expect([400, 409]).toContain(res.status());
    expect((await seed.getLead(converted.id)).status).toBe('CONVERTED');
  });
  test("LEAD-155 Ghi lịch sử kèm lý do", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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

test.describe("Kích hoạt lại Lead", () => {
  const API = "POST /api/leads/{id}/reactivate";
  test("LEAD-195 Kích hoạt lại Lead đã ngưng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect((await seed.getLead(String(p.params!.id))).status).toBe('ACTIVE');
  });
  test("LEAD-196 Chỉ kích hoạt từ Ngưng hoạt động", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const active = await seed.lead();
    const converted = (await seed.customer()).lead;
    for (const l of [active, converted]) {
      const before = (await seed.getLead(l.id)).status;
      const res = await http.call(API, { token: roles.nvkdA.accessToken, params: { id: l.id } });
      expect([400, 409], before).toContain(res.status());
      expect((await seed.getLead(l.id)).status).toBe(before);
    }
  });
  test("LEAD-197 Không bắt buộc lý do", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const l = await seed.inactiveLead();
    expect((await http.call(API, { token: T, params: { id: l.id }, json: {} })).status()).toBe(200);
    expect((await seed.getLead(l.id)).status).toBe('ACTIVE');
  });
  test("LEAD-200 Ghi lịch sử kích hoạt", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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

test.describe("Chuyển người phụ trách Lead", () => {
  const API = "POST /api/leads/{id}/transfer-owner";
  test("LEAD-205 Chuyển Lead cho NVKD B", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([204]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const again = await seed.getLead(String(p.params!.id), 'nvkdB');
    expect(again.ownerUserId).toBe(roles.nvkdB.userId);
  });
  test("LEAD-206 Chuyển không đổi trạng thái", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const p = await seed.prepare(API);
    expect((await http.call(API, p)).status()).toBe(204);
    expect((await seed.getLead(String(p.params!.id), 'nvkdB')).status).toBe('ACTIVE');
  });
  test("LEAD-209 Chuyển cho chính người đang phụ trách", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    expect([400, 409]).toContain((await http.call(API, { token: T, params: { id: a.id }, json: { newOwnerUserId: roles.nvkdA.userId, reason: 'Phân lại địa bàn' } })).status());
    expect((await seed.getLead(a.id)).ownerUserId).toBe(roles.nvkdA.userId);
  });
  test("LEAD-210 Người nhận không hợp lệ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    for (const id of [process.env.LOCKED_NVKD_USER_ID, roles.dvkhA.userId].filter(Boolean) as string[]) {
      expect([400, 409], id).toContain((await http.call(API, { token: T, params: { id: a.id }, json: { newOwnerUserId: id, reason: 'Phân lại địa bàn' } })).status());
    }
    expect((await seed.getLead(a.id)).ownerUserId).toBe(roles.nvkdA.userId);
  });
  test("LEAD-211 Chuyển Lead không hoạt động hoặc đã chuyển đổi", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const inactive = await seed.inactiveLead();
    const converted = (await seed.customer()).lead;
    for (const l of [inactive, converted]) {
      expect([400, 409]).toContain((await http.call(API, { token: T, params: { id: l.id }, json: { newOwnerUserId: roles.nvkdB.userId, reason: 'Phân lại địa bàn' } })).status());
      expect((await seed.getLead(l.id)).ownerUserId).toBe(roles.nvkdA.userId);
    }
  });
  test("LEAD-213 Lead rời danh sách người cũ, vào danh sách người mới", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    expect((await http.call(API, p)).status()).toBe(204);
    const listA = items(await data(await http.call('GET /api/leads', { token: roles.nvkdA.accessToken, query: { perPage: 100 } })));
    const listB = items(await data(await http.call('GET /api/leads', { token: roles.nvkdB.accessToken, query: { perPage: 100 } })));
    expect(listA.some((l: any) => l.id === p.params!.id)).toBe(false);
    expect(listB.some((l: any) => l.id === p.params!.id)).toBe(true);
  });
});
