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
import { schemas } from '../../../src/api/schemas/contract.schema';
test.describe("Hủy hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/cancel";
  test("CTR-118 Hủy HĐ chưa hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getContract(String(p.params!.id));
    expect(c.status).toBe('CANCELLED');
    expect(c.cancelReason).toBe((p.json as any).reason);
  });
  test("CTR-119 Hủy HĐ không phải `PENDING`", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.customer();
    const res = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, json: { reason: 'Khách đổi ý' } });
    expect([400, 409]).toContain(res.status());
    expect((await seed.getContract(c.contract.id)).status).toBe('ACTIVE');
  });
  test("CTR-120 KH không còn HĐ hiện hành sau khi hủy", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.customer({ pending: true });
    const res = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, json: { reason: 'Khách đổi ý' } });
    expect(res.status()).toBe(200);
    const cus = await seed.getCustomer(c.customerId);
    expect(cus.status).toBe('SUSPENDED');
    expect(cus.suspendReason).toBe('NO_ACTIVE_CONTRACT');
  });
  test("CTR-121 KH còn HĐ hiện hành khác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customerWithPendingResign();
    expect((await http.call(API, { token: D, params: { id: c.pending.id }, json: { reason: 'Khách đổi ý' } })).status()).toBe(200);
    expect((await seed.getCustomer(c.customerId)).status).toBe('ACTIVE');
  });
  test("CTR-126 Ghi lịch sử hủy", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/contracts", id, "dvkhA");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/contracts", id, "dvkhA");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});

test.describe("Gia hạn hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/extensions";
  test("CTR-132 Ngày hết hạn mới không hợp lệ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.customer();
    for (const newExpiry of [c.contract.effectiveTo, addDays(c.contract.effectiveTo, -1)]) {
      const res = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, json: { newExpiry } });
      expect([400, 409], newExpiry).toContain(res.status());
    }
    expect((await seed.getContract(c.contract.id)).effectiveTo).toBe(c.contract.effectiveTo);
  });
  test("CTR-133 Có HĐ tái ký đang chờ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customerWithPendingResign();
    const d0 = c.pending.effectiveFrom;
    for (const newExpiry of [d0, addDays(d0, 1)]) expect([400, 409], newExpiry).toContain((await http.call(API, { token: D, params: { id: c.contract.id }, json: { newExpiry } })).status());
    expect((await seed.getContract(c.contract.id)).effectiveTo).toBe(c.contract.effectiveTo);
  });
  test("CTR-134 Gia hạn HĐ không phải mới nhất hoặc sai trạng thái", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const pending = await seed.customer({ pending: true });
    const cancelled = await seed.customer({ pending: true });
    await http.call('POST /api/contracts/{id}/cancel', { token: D, params: { id: cancelled.contract.id }, json: { reason: 'Khách đổi ý' } });
    for (const c of [pending, cancelled]) expect([400, 409]).toContain((await http.call(API, { token: D, params: { id: c.contract.id }, json: { newExpiry: addDays(c.contract.effectiveTo, 30) } })).status());
  });
  test("CTR-130 Gia hạn HĐ `ACTIVE`", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getContract(String(p.params!.id));
    expect(c.effectiveTo).toBe((p.json as any).newExpiry);
    expect(c.status).toBe('ACTIVE');
  });
  test("CTR-140 Gỡ cảnh báo kỳ hạn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const lead = await seed.lead();
    const up = await http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId, { effectiveTo: addDays(today(), 5) })), file: F.pdf() } });
    const contract = await data(up);
    expect((await http.call(API, { token: D, params: { id: contract.id }, json: { newExpiry: addMonths(today(), 12) } })).status()).toBe(200);
    expect((await seed.getContract(contract.id)).alertLevel).toBe('NONE');
  });
});

test.describe("Tái ký hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/resign";
  test("CTR-166 Tái ký nối tiếp sau ngày hết hạn gốc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(d.status).toBe('PENDING');
    expect(d.resignedFrom?.id).toBe(p.params!.id);
    expect((await seed.getContract(String(p.params!.id))).status).toBe('ACTIVE');
  });
  test("CTR-167 Tái ký thay thế HĐ đang hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.customer();
    const contract = C.resignContract(today());
    const r1 = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', contract), file: F.pdf('tai-ky.pdf') } });
    expect(r1.status()).toBe(409);
    const r2 = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', { ...contract, confirmReplacement: true }), file: F.pdf('tai-ky.pdf') } });
    expect([200, 201]).toContain(r2.status());
    expect((await data(r2)).status).toBe('ACTIVE');
    expect((await seed.getContract(c.contract.id)).status).toBe('SUSPENDED');
  });
  test("CTR-168 KH đã có HĐ `PENDING`", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customerWithPendingResign();
    const res = await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', C.resignContract(addDays(c.pending.effectiveTo, 1))), file: F.pdf('tai-ky-2.pdf') } });
    expect([400, 409]).toContain(res.status());
  });
  test("CTR-169 Ngày hiệu lực không hợp lệ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    for (const from of [addDays(today(), -1), c.contract.effectiveFrom]) {
      expect([400, 409], from).toContain((await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', C.resignContract(from)), file: F.pdf('tai-ky.pdf') } })).status());
    }
  });
  test("CTR-170 Tái ký từ HĐ gốc đã hủy", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer({ pending: true });
    await http.call('POST /api/contracts/{id}/cancel', { token: D, params: { id: c.contract.id }, json: { reason: 'Khách đổi ý' } });
    const res = await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', C.resignContract(today())), file: F.pdf('tai-ky.pdf') } });
    expect([200, 201]).toContain(res.status());
    expect((await seed.getContract(c.contract.id)).status).toBe('CANCELLED');
  });
  test("CTR-171 Số HĐ trùng trong cùng KH", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const res = await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', C.resignContract(addDays(c.contract.effectiveTo, 1), { contractNumber: c.contract.contractNumber })), file: F.pdf('tai-ky.pdf') } });
    expect(res.status()).toBe(409);
  });
  test("CTR-176 Lỗi không đổi HĐ gốc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const res = await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', { ...C.resignContract(today()), confirmReplacement: true }), file: F.empty() } });
    expect(res.status()).toBe(400);
    expect((await seed.getContract(c.contract.id)).status).toBe('ACTIVE');
  });
});

test.describe("Dừng khai thác hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/suspend";
  test("CTR-181 Dừng khai thác HĐ đang hiệu lực", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getContract(String(p.params!.id));
    expect(c.status).toBe('SUSPENDED');
    const cus = await seed.getCustomer(c.customerId);
    expect(cus.status).toBe('SUSPENDED');
    expect(cus.suspendReason).toBe('CONTRACT_SUSPENDED');
  });
  test("CTR-182 Dừng HĐ không phải `ACTIVE`", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const pending = await seed.customer({ pending: true });
    const res = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: pending.contract.id }, json: { reason: 'Vi phạm thanh toán' } });
    expect([400, 409]).toContain(res.status());
    expect((await seed.getContract(pending.contract.id)).status).toBe('PENDING');
  });
  test("CTR-185 HĐ dừng khai thác không còn được sửa hay gia hạn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    expect((await http.call(API, { token: D, params: { id: c.contract.id }, json: { reason: 'Vi phạm' } })).status()).toBe(200);
    const cur = await seed.getContract(c.contract.id);
    expect([400, 409]).toContain((await http.call('PUT /api/contracts/{id}', { token: D, params: { id: c.contract.id }, json: C.updateContract(cur, { paymentTermDays: 50 }) })).status());
    expect([400, 409]).toContain((await http.call('POST /api/contracts/{id}/extensions', { token: D, params: { id: c.contract.id }, json: { newExpiry: addDays(cur.effectiveTo, 30) } })).status());
  });
  test("CTR-188 Ghi lịch sử kèm lý do", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const id = String(p.params!.id);
    const before = await seed.history("/api/contracts", id, "dvkhA");
    const res = await http.call(API, p);
    expect(res.status()).toBeLessThan(300);
    const after = await seed.history("/api/contracts", id, "dvkhA");
    expect(after.length).toBeGreaterThan(before.length);
    const reason = (p.json as any)?.reason;
    if (reason) expect(JSON.stringify(after.slice(0, after.length - before.length))).toContain(reason);
  });
});
