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
import { schemas } from '../../../src/api/schemas/contractor-contract.schema';
test.describe("Cấu hình tự động gia hạn", () => {
  const API = "PUT /api/contractor-contracts/{id}/auto-renewal";
  test("CTV-111 Bật tự động gia hạn 12 tháng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getContractorContract(String(p.params!.id));
    expect(c.autoRenew).toBe(true);
    expect(c.renewalCycleMonths).toBe(12);
  });
  test("CTV-112 Tắt tự động gia hạn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract({ extra: { autoRenew: true, renewalCycleMonths: 6 } });
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { enabled: false } })).status()).toBe(200);
    expect((await seed.getContractorContract(c.contract.id)).autoRenew).toBe(false);
  });
  test("CTV-115 HĐ đã đóng hoặc nhà thầu Dừng hợp tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const p = await seed.contractorWithContract({ pending: true });
    await http.call('POST /api/contractor-contracts/{id}/cancel', { token: Q, params: { id: p.contract.id }, json: { reason: 'Nhà thầu rút' } });
    const d = await seed.terminatedContractor();
    for (const id of [p.contract.id, d.contract.id]) expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id }, json: { enabled: true, cycleMonths: 6 } })).status());
    test.info().annotations.push({ type: 'Giới hạn dữ liệu', description: 'Chưa có HĐ Hết hiệu lực để kiểm' });
  });
  test("CTV-116 Cấu hình không đổi trạng thái HĐ", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract({ pending: true });
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { enabled: true, cycleMonths: 3 } })).status()).toBe(200);
    expect(await st(c.contract.id)).toBe('PENDING');
  });
  test("CTV-126 Gia hạn thủ công khi đang bật tự động gia hạn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract({ extra: { autoRenew: true, renewalCycleMonths: 3 } });
    const newExpiry = addMonths(c.contract.effectiveTo, 1);
    expect((await http.call('POST /api/contractor-contracts/{id}/extensions', { token: Q, params: { id: c.contract.id }, json: { newExpiry } })).status()).toBe(200);
    const k = await seed.getContractorContract(c.contract.id);
    expect(k.effectiveTo).toBe(newExpiry);
    expect(k.autoRenew).toBe(true);
  });
  test("CTV-127 Hủy HĐ tái ký nối tiếp rồi bật lại tự động gia hạn trên HĐ gốc", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const res = (id: string, from: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(from, extra)), file: F.pdf('tai-ky.pdf'), ...files } });
    const c = await seed.contractorWithContract({ extra: { autoRenew: true, renewalCycleMonths: 6 } });
    const p2 = await data(await res(c.contract.id, addDays(c.contract.effectiveTo, 1)));
    expect((await seed.getContractorContract(c.contract.id)).autoRenew).toBe(false);
    expect((await http.call('POST /api/contractor-contracts/{id}/cancel', { token: Q, params: { id: p2.id }, json: { reason: 'Nhà thầu rút' } })).status()).toBe(200);
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { enabled: true, cycleMonths: 12 } })).status()).toBe(200);
    const k = await seed.getContractorContract(c.contract.id);
    expect(k.autoRenew).toBe(true);
    expect(k.renewalCycleMonths).toBe(12);
  });
  test("CTV-118 Ghi lịch sử", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/contractor-contracts", id, "qlnt");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/contractor-contracts", id, "qlnt");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Hủy hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/cancel";
  test("CTV-128 Hủy HĐ Chưa hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-129 Hủy HĐ không phải Chưa hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const a = await seed.contractorWithContract();
    const p = await seed.contractorWithContract({ pending: true });
    await http.call(API, { token: Q, params: { id: p.contract.id }, json: { reason: 'Nhà thầu rút' } });
    for (const [id, code] of [[a.contract.id, 'ACTIVE'], [p.contract.id, 'CANCELLED']] as const) {
      expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id }, json: { reason: 'Nhà thầu rút' } })).status());
      expect(await st(id)).toBe(code);
    }
  });
  test("CTV-130 Nhà thầu Dừng hợp tác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    const pend = await data(await http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(addDays(c.contract.effectiveTo, 1))), file: F.pdf() } }));
    await http.call('POST /api/contractors/{id}/terminate', { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } });
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: pend.id }, json: { reason: 'Nhà thầu rút' } })).status());
  });
  test("CTV-135 Ghi lịch sử kèm lý do", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/contractor-contracts", id, "qlnt");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/contractor-contracts", id, "qlnt");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Gia hạn hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/extensions";
  test("CTV-141 Ngày hết hạn mới không hợp lệ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    for (const newExpiry of [c.contract.effectiveTo, addDays(c.contract.effectiveTo, -1)]) expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { newExpiry } })).status());
    expect((await seed.getContractorContract(c.contract.id)).effectiveTo).toBe(c.contract.effectiveTo);
  });
  test("CTV-142 Có HĐ tái ký đang chờ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const res = (id: string, from: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(from, extra)), file: F.pdf('tai-ky.pdf'), ...files } });
    const c = await seed.contractorWithContract();
    const pend = await data(await res(c.contract.id, addDays(c.contract.effectiveTo, 30)));
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { newExpiry: pend.effectiveFrom } })).status());
  });
  test("CTV-143 HĐ không phải mới nhất, sai trạng thái, nhà thầu Dừng hợp tác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const p = await seed.contractorWithContract({ pending: true });
    const d = await seed.terminatedContractor();
    for (const k of [p.contract, d.contract]) expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: k.id }, json: { newExpiry: addDays(k.effectiveTo, 30) } })).status());
  });
  test("CTV-139 Gia hạn HĐ Đang hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getContractorContract(String(p.params!.id));
    expect(c.effectiveTo).toBe((p.json as any).newExpiry);
  });
  test("CTV-149 Gỡ cảnh báo kỳ hạn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract({ extra: { effectiveTo: addDays(today(), 5) } });
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { newExpiry: addMonths(today(), 12) } })).status()).toBe(200);
    expect((await seed.getContractorContract(c.contract.id)).alertLevel).toBe('NONE');
  });
});

test.describe("Tái ký hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/resign";
  test("CTV-169 Tái ký nối tiếp sau ngày hết hạn gốc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.resignedFrom?.id).toBe(p.params!.id);
  });
  test("CTV-170 Tự tắt tự động gia hạn của HĐ gốc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.contractorWithContract({ extra: { autoRenew: true, renewalCycleMonths: 6 } });
    const res = await http.call(API, { token: roles.qlnt.accessToken, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(addDays(c.contract.effectiveTo, 1))), file: F.pdf('tai-ky.pdf') } });
    expect([200, 201]).toContain(res.status());
    expect((await data(res)).previousAutoRenewalTurnedOff).toBe(true);
    expect((await seed.getContractorContract(c.contract.id)).autoRenew).toBe(false);
  });
  test("CTV-171 Tái ký thay thế HĐ đang hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    const contract = VC.resignContractorContract(today());
    const r1 = await http.call(API, { token: Q, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', contract), file: F.pdf() } });
    expect(r1.status()).toBe(409);
    expect(await st(c.contract.id)).toBe('ACTIVE');
    const r2 = await http.call(API, { token: Q, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', { ...contract, confirmReplacement: true }), file: F.pdf() } });
    expect([200, 201]).toContain(r2.status());
    expect(await st((await data(r2)).id)).toBe('ACTIVE');
    expect(await st(c.contract.id)).toBe('SUSPENDED');
  });
  test("CTV-172 Nhà thầu đã có HĐ Chưa hiệu lực hoặc Dừng hợp tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const res = (id: string, from: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(from, extra)), file: F.pdf('tai-ky.pdf'), ...files } });
    const c = await seed.contractorWithContract();
    await res(c.contract.id, addDays(c.contract.effectiveTo, 1));
    const d = await seed.terminatedContractor();
    expect([400, 409]).toContain((await res(c.contract.id, addDays(c.contract.effectiveTo, 40))).status());
    expect([400, 409]).toContain((await res(d.contract.id, today(), { confirmReplacement: true })).status());
  });
  test("CTV-173 Ngày hiệu lực không hợp lệ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const res = (id: string, from: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(from, extra)), file: F.pdf('tai-ky.pdf'), ...files } });
    const c = await seed.contractorWithContract();
    for (const from of [addDays(today(), -1), c.contract.effectiveFrom]) expect([400, 409], from).toContain((await res(c.contract.id, from)).status());
  });
  test("CTV-174 Tái ký từ HĐ gốc Đã hủy", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const res = (id: string, from: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(from, extra)), file: F.pdf('tai-ky.pdf'), ...files } });
    const p = await seed.contractorWithContract({ pending: true });
    await http.call('POST /api/contractor-contracts/{id}/cancel', { token: Q, params: { id: p.contract.id }, json: { reason: 'Nhà thầu rút' } });
    expect([200, 201]).toContain((await res(p.contract.id, today())).status());
    expect(await st(p.contract.id)).toBe('CANCELLED');
  });
  test("CTV-179 Lỗi không đổi HĐ gốc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract({ extra: { autoRenew: true, renewalCycleMonths: 6 } });
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', { ...VC.resignContractorContract(today()), confirmReplacement: true }), file: F.empty() } })).status()).toBe(400);
    const k = await seed.getContractorContract(c.contract.id);
    expect(k.status.code).toBe('ACTIVE');
    expect(k.autoRenew).toBe(true);
  });
});

test.describe("Dừng khai thác hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/suspend";
  test("CTV-184 Dừng khai thác HĐ Đang hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-185 Nhà thầu không còn HĐ hiệu lực thì Ngưng hoạt động", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.contractorWithContract();
    const res = await http.call(API, { token: roles.qlnt.accessToken, params: { id: c.contract.id }, json: { reason: 'Vi phạm SLA' } });
    expect(res.status()).toBe(200);
    const after = await seed.getContractor(c.contractor.id);
    expect(after.status.code).toBe('SUSPENDED');
  });
  test("CTV-186 Dừng HĐ không phải Đang hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const p = await seed.contractorWithContract({ pending: true });
    const s = await seed.contractorWithContract();
    await http.call(API, { token: Q, params: { id: s.contract.id }, json: { reason: 'Vi phạm' } });
    for (const [id, code] of [[p.contract.id, 'PENDING'], [s.contract.id, 'SUSPENDED']] as const) {
      expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id }, json: { reason: 'Vi phạm' } })).status());
      expect(await st(id)).toBe(code);
    }
  });
  test("CTV-187 Nhà thầu Dừng hợp tác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const d = await seed.terminatedContractor();
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: d.contract.id }, json: { reason: 'Vi phạm' } })).status());
  });
  test("CTV-192 Ghi lịch sử kèm lý do", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/contractor-contracts", id, "qlnt");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/contractor-contracts", id, "qlnt");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});
