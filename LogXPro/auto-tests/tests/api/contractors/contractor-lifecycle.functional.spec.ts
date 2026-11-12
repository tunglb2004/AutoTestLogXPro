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
test.describe("Kích hoạt lại nhà thầu", () => {
  const API = "POST /api/contractors/{id}/reactivate";
  test("VDR-142 Kích hoạt lại nhà thầu Dừng hợp tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("VDR-143 Chỉ kích hoạt từ Dừng hợp tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const n = await seed.contractor();
    const h = await seed.contractorWithContract();
    for (const [id, code] of [[n.id, 'NEW'], [h.contractor.id, 'ACTIVE']] as const) {
      expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id }, json: { reason: 'Hợp tác lại' } })).status());
      expect((await seed.getContractor(id)).status.code).toBe(code);
    }
  });
  test("VDR-144 Không khôi phục HĐ cũ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract();
    const pend = await data(await http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(addDays(c.contract.effectiveTo, 1))), file: F.pdf() } }));
    await http.call('POST /api/contractors/{id}/terminate', { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } });
    expect((await http.call(API, { token: Q, params: { id: c.contractor.id }, json: { reason: 'Hợp tác lại' } })).status()).toBe(200);
    expect((await seed.getContractorContract(c.contract.id)).status.code).toBe('SUSPENDED');
    expect((await seed.getContractorContract(pend.id)).status.code).toBe('CANCELLED');
    expect((await seed.getContractor(c.contractor.id)).status.code).toBe('SUSPENDED');
  });
  test("VDR-153 Đọc lại từng HĐ sau khi kích hoạt lại", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract();
    const pend = await data(await http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(addDays(c.contract.effectiveTo, 1))), file: F.pdf() } }));
    await http.call('POST /api/contractors/{id}/terminate', { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } });
    const before = [await seed.getContractorContract(c.contract.id), await seed.getContractorContract(pend.id)].map((x) => x.status.code);
    expect((await http.call(API, { token: Q, params: { id: c.contractor.id }, json: { reason: 'Hợp tác lại' } })).status()).toBe(200);
    const after = [await seed.getContractorContract(c.contract.id), await seed.getContractorContract(pend.id)].map((x) => x.status.code);
    expect(after).toEqual(before);
    expect((await seed.getContractor(c.contractor.id)).status.code).toBe('SUSPENDED');
  });
  test("VDR-154 Sau kích hoạt lại, các API ghi được mở", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const d = await seed.terminatedContractor();
    expect((await http.call(API, { token: Q, params: { id: d.contractor.id }, json: { reason: 'Hợp tác lại' } })).status()).toBe(200);
    const cur = await seed.getContractor(d.contractor.id);
    expect((await http.call('PUT /api/contractors/{id}', { token: Q, params: { id: d.contractor.id }, json: V.contractorUpdateBody(cur, { capabilityDescription: 'Đã khắc phục' }) })).status()).toBe(200);
    const opts = items(await data(await http.call('GET /api/contractor-contracts/contractor-options', { token: Q, query: { mode: 'RESIGN', search: cur.taxCode } })));
    expect(opts.map((o: any) => o.contractorId)).toContain(d.contractor.id);
    const r = await http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id: d.contract.id }, multipart: { contract: jsonPart('contract', { ...VC.resignContractorContract(today()), confirmReplacement: true }), file: F.pdf() } });
    expect([200, 201]).toContain(r.status());
    expect((await seed.getContractor(d.contractor.id)).status.code).toBe('ACTIVE');
  });
  test("VDR-149 Ghi lịch sử kèm lý do", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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

test.describe("Dừng hợp tác nhà thầu", () => {
  const API = "POST /api/contractors/{id}/terminate";
  test("VDR-155 Dừng hợp tác nhà thầu đang hoạt động", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("VDR-156 HĐ Chưa hiệu lực bị hủy", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract();
    const resign = await http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(addDays(c.contract.effectiveTo, 1))), file: F.pdf('tai-ky.pdf') } });
    expect([200, 201]).toContain(resign.status());
    const pendingId = (await data(resign)).id;
    expect((await seed.getContractorContract(pendingId)).status.code).toBe('PENDING');
    expect((await http.call(API, { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm chất lượng' } })).status()).toBe(200);
    expect((await seed.getContractorContract(pendingId)).status.code).toBe('CANCELLED');
    expect((await seed.getContractorContract(c.contract.id)).status.code).toBe('SUSPENDED');
  });
  test("VDR-157 Khóa mọi thao tác sau khi dừng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract();
    expect((await http.call(API, { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } })).status()).toBe(200);
    const cur = await seed.getContractor(c.contractor.id);
    expect([400, 409]).toContain((await http.call('PUT /api/contractors/{id}', { token: Q, params: { id: c.contractor.id }, json: V.contractorUpdateBody(cur, { name: 'Tên mới' }) })).status());
    expect([400, 409]).toContain((await http.call('POST /api/contractors/{id}/contacts', { token: Q, params: { id: c.contractor.id }, json: L.contactBody() })).status());
  });
  test("VDR-158 Dừng hợp tác từ Tạo mới hoặc Dừng hợp tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const n = await seed.contractor();
    const d = await seed.terminatedContractor();
    for (const [id, code] of [[n.id, 'NEW'], [d.contractor.id, 'TERMINATED']] as const) {
      expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id }, json: { reason: 'Vi phạm' } })).status());
      expect((await seed.getContractor(id)).status.code).toBe(code);
    }
  });
  test("VDR-159 Dừng hợp tác từ Ngưng hoạt động", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract();
    await http.call('POST /api/contractor-contracts/{id}/suspend', { token: Q, params: { id: c.contract.id }, json: { reason: 'Vi phạm SLA' } });
    expect((await seed.getContractor(c.contractor.id)).status.code).toBe('SUSPENDED');
    expect((await http.call(API, { token: Q, params: { id: c.contractor.id }, json: { reason: 'Dừng hẳn' } })).status()).toBe(200);
    expect((await seed.getContractor(c.contractor.id)).status.code).toBe('TERMINATED');
  });
  test("VDR-168 Đọc lại từng HĐ sau khi Dừng hợp tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract();
    const pend = await data(await http.call('POST /api/contractor-contracts/{id}/resign', { token: Q, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(addDays(c.contract.effectiveTo, 1))), file: F.pdf() } }));
    expect((await http.call(API, { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm chất lượng' } })).status()).toBe(200);
    expect((await seed.getContractorContract(c.contract.id)).status.code).toBe('SUSPENDED');
    expect((await seed.getContractorContract(pend.id)).status.code).toBe('CANCELLED');
    test.info().annotations.push({ type: 'Giới hạn dữ liệu', description: 'Chưa có HĐ EXPIRED để kiểm giữ nguyên trạng thái' });
  });
  test("VDR-169 Gọi trực tiếp các API ghi bị khóa", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract();
    await http.call('POST /api/contractors/{id}/documents', { token: Q, params: { id: c.contractor.id }, multipart: { file: F.pdf() } });
    expect((await http.call(API, { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } })).status()).toBe(200);
    const v = await seed.getContractor(c.contractor.id);
    const k = await seed.getContractorContract(c.contract.id);
    const calls: [string, any][] = [
      ['PUT /api/contractors/{id}/tier', { params: { id: v.id }, json: { tier: V.tierB(), reason: V.REASON } }],
      ['POST /api/contractors/{id}/documents', { params: { id: v.id }, multipart: { file: F.pdf() } }],
      ['DELETE /api/contractors/{id}/contacts/{contactId}', { params: { id: v.id, contactId: v.contacts[0].id } }],
      ['PUT /api/contractor-contracts/{id}', { params: { id: k.id }, json: VC.updateContractorContract(k, { name: 'Không được sửa' }) }],
      ['POST /api/contractor-contracts/{id}/annexes', { params: { id: k.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: F.pdf() } }],
      ['PUT /api/contractor-contracts/{id}/auto-renewal', { params: { id: k.id }, json: { enabled: true, cycleMonths: 6 } }],
      ['POST /api/contractor-contracts/{id}/extensions', { params: { id: k.id }, json: { newExpiry: addDays(k.effectiveTo, 30) } }],
      ['POST /api/contractor-contracts/{id}/resign', { params: { id: k.id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(addDays(k.effectiveTo, 1))), file: F.pdf() } }],
    ];
    for (const [api, o] of calls) expect([400, 409], api).toContain((await http.call(api, { token: Q, ...o })).status());
    expect((await seed.getContractor(v.id)).documents).toHaveLength(v.documents.length);
    expect((await http.call('GET /api/contractor-contracts/{id}/file', { token: Q, params: { id: k.id } })).status()).toBe(200);
  });
  test("VDR-164 HĐ và nhà thầu cập nhật cùng lúc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract();
    expect((await http.call(API, { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } })).status()).toBe(200);
    const v = await seed.getContractor(c.contractor.id);
    expect(v.status.code).toBe('TERMINATED');
    for (const k of v.contracts) expect((await seed.getContractorContract(k.id)).status.code).not.toBe('ACTIVE');
  });
});

test.describe("Cập nhật phân hạng nhà thầu", () => {
  const API = "PUT /api/contractors/{id}/tier";
  test("VDR-170 Đổi hạng Ưu tiên → Chiến lược", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("VDR-171 Hạng mới trùng hạng hiện tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: h.id }, json: { tier: h.tier.code, reason: V.REASON } })).status());
  });
  test("VDR-172 Đổi hạng nhà thầu Ngưng hoạt động hoặc Dừng hợp tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const d = await seed.terminatedContractor();
    const s = await seed.contractorWithContract();
    await http.call('POST /api/contractor-contracts/{id}/suspend', { token: Q, params: { id: s.contract.id }, json: { reason: 'Vi phạm' } });
    for (const id of [d.contractor.id, s.contractor.id]) expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id }, json: { tier: V.tierB(), reason: V.REASON } })).status());
  });
  test("VDR-176 Ghi lịch sử hạng cũ, mới, lý do", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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
