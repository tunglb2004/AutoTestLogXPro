/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from '../../src/fixtures/seed.fixture';
import { body, data, items, jsonPart } from '../../src/api/http.client';
import { badTokens } from '../../src/fixtures/auth.fixture';
import { apiError, apiSuccess, hasNoStacktrace } from '../../src/api/schemas/common.schema';
import { sha256 } from '../../src/utils/file-check';
import { malformedJson } from '../../src/data/payloads';
import * as F from '../../src/data/file.factory';
import * as L from '../../src/data/lead.factory';
import * as C from '../../src/data/contract.factory';
import * as K from '../../src/data/customer.factory';
import * as V from '../../src/data/contractor.factory';
import * as VC from '../../src/data/contractor-contract.factory';
import * as P from '../../src/data/payloads';
import { addDays, addMonths, today } from '../../src/utils/dates';
import { TEST_RUN_ID, randDigits, randInt, textOfLength, uuid } from '../../src/utils/test-run';
import { xlsxDataRows } from '../../src/utils/file-check';

test.describe("Lead → Hợp đồng đầu tiên → Khách hàng chính thức", () => {
  test("FLOW-LEAD-001 Tạo Lead, khai thác rồi upload HĐ đầu tiên hiệu lực hôm nay", { tag: ["@flow", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const Q = roles.qlnt.accessToken;
    const owner = await test.step('Lấy người phụ trách', async () => {
      const r = await http.call('GET /api/leads/assignable-owners', { token: N });
      expect(r.status()).toBe(200);
      return items(await data(r)).map((u: any) => u.id ?? u.userId).find((id: string) => id === roles.nvkdA.userId);
    });
    expect(owner).toBe(roles.nvkdA.userId);
    const lead = await test.step('Tạo Lead', async () => {
      const r = await http.call('POST /api/leads', { token: N, json: await seed.leadBody() });
      expect([200, 201]).toContain(r.status());
      return data(r);
    });
    await test.step('Thêm đầu mối, tài liệu, sửa Lead', async () => {
      expect((await http.call('POST /api/leads/{id}/contacts', { token: N, params: { id: lead.id }, json: L.contactBody() })).status()).toBe(201);
      expect((await http.call('POST /api/leads/{id}/documents', { token: N, params: { id: lead.id }, multipart: { file: F.pdf('ho-so.pdf') } })).status()).toBe(201);
      const cur = await seed.getLead(lead.id);
      expect((await http.call('PUT /api/leads/{id}', { token: N, params: { id: lead.id }, json: L.leadUpdateBody(cur, { headOfficeAddress: 'Số 9 đường Lê Lợi, Lạng Sơn' }) })).status()).toBe(200);
    });
    const contract = await test.step('Upload HĐ đầu tiên', async () => {
      const up = items(await data(await http.call('GET /api/contracts/uploadable-customers', { token: N, query: { search: lead.taxCode } })));
      expect(up.map((x: any) => x.id ?? x.customerId)).toContain(lead.id);
      const mgr = items(await data(await http.call('GET /api/contracts/assignable-managers', { token: N })));
      expect(mgr.map((u: any) => u.id ?? u.userId)).toContain(roles.dvkhA.userId);
      const r = await http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId)), file: F.pdf() } });
      expect([200, 201]).toContain(r.status());
      return data(r);
    });
    await test.step('Kiểm khách hàng', async () => {
      const r = await http.call('GET /api/customers/{id}', { token: D, params: { id: contract.customerId } });
      expect(r.status()).toBe(200);
      const k = await data(r);
      expect(k.status).toBe('ACTIVE');
      expect(k.customerCode).toBeTruthy();
      expect(k.contacts).toHaveLength(2);
      expect(k.documents).toHaveLength(1);
      expect(k.headOfficeAddress).toBe('Số 9 đường Lê Lợi, Lạng Sơn');
      expect(k.accountManagerId).toBe(roles.dvkhA.userId);
      expect((await seed.getLead(lead.id)).status).toBe('CONVERTED');
      const up = items(await data(await http.call('GET /api/contracts/uploadable-customers', { token: N, query: { search: lead.taxCode } })));
      expect(up.map((x: any) => x.id ?? x.customerId)).not.toContain(lead.id);
    });
  });
  test("FLOW-LEAD-002 Upload HĐ hiệu lực tương lai, KH chờ hiệu lực", { tag: ["@flow", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const Q = roles.qlnt.accessToken;
    const lead = await data(await http.call('POST /api/leads', { token: N, json: await seed.leadBody() }));
    const r = await http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId, { effectiveFrom: addDays(today(), 10) })), file: F.pdf() } });
    expect([200, 201]).toContain(r.status());
    const c = await data(r);
    expect(c.status).toBe('PENDING');
    const k = await data(await http.call('GET /api/customers/{id}', { token: D, params: { id: c.customerId } }));
    expect(k.status).toBe('SUSPENDED');
    expect(k.suspendReason).toBe('PENDING_CONTRACT');
    test.info().annotations.push({ type: 'Giới hạn', description: 'Bước KH chuyển ACTIVE sau tác vụ 0:00 không tự động được' });
  });
  test("FLOW-LEAD-003 Lead ngưng hoạt động không upload được HĐ cho tới khi kích hoạt lại", { tag: ["@flow", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const Q = roles.qlnt.accessToken;
    const lead = await seed.lead();
    const inUpload = async () => items(await data(await http.call('GET /api/contracts/uploadable-customers', { token: N, query: { search: lead.taxCode } }))).some((x: any) => (x.id ?? x.customerId) === lead.id);
    expect((await http.call('POST /api/leads/{id}/deactivate', { token: N, params: { id: lead.id }, json: { reason: 'Tạm dừng' } })).status()).toBe(200);
    expect(await inUpload()).toBe(false);
    const send = () => http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId)), file: F.pdf() } });
    expect([400, 409]).toContain((await send()).status());
    expect((await http.call('POST /api/leads/{id}/reactivate', { token: N, params: { id: lead.id } })).status()).toBe(200);
    expect(await inUpload()).toBe(true);
    expect([200, 201]).toContain((await send()).status());
    expect((await seed.history('/api/leads', lead.id, 'nvkdA')).length).toBeGreaterThanOrEqual(3);
  });
  test("FLOW-LEAD-004 Import Lead rồi chuyển người phụ trách", { tag: ["@flow", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const Q = roles.qlnt.accessToken;
    const taxes = [L.taxCode(), L.taxCode()];
    expect((await http.call('POST /api/leads/import', { token: N, multipart: { file: await seed.importFile(taxes.map((taxCode) => ({ taxCode }))) } })).status()).toBe(200);
    const leads = await Promise.all(taxes.map(async (t) => (await seed.leadsByTax(t))[0]));
    const listA = items(await data(await http.call('GET /api/leads', { token: N, query: { search: leads[0].taxCode } })));
    expect(listA.map((l: any) => l.id)).toContain(leads[0].id);
    expect((await http.call('POST /api/leads/{id}/transfer-owner', { token: N, params: { id: leads[0].id }, json: { newOwnerUserId: roles.nvkdB.userId, reason: 'Phân lại địa bàn' } })).status()).toBe(204);
    const a2 = items(await data(await http.call('GET /api/leads', { token: N, query: { search: leads[0].taxCode } })));
    const b2 = items(await data(await http.call('GET /api/leads', { token: roles.nvkdB.accessToken, query: { search: leads[0].taxCode } })));
    expect(a2.map((l: any) => l.id)).not.toContain(leads[0].id);
    expect(b2.map((l: any) => l.id)).toContain(leads[0].id);
    expect([403, 404, 409]).toContain((await http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(leads[0].id, roles.dvkhA.userId)), file: F.pdf() } })).status());
  });
  test("FLOW-LEAD-005 DVKH quản lý KH rồi chuyển người phụ trách", { tag: ["@flow", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const Q = roles.qlnt.accessToken;
    const c = await seed.customer();
    const k = await data(await http.call('GET /api/customers/{id}', { token: D, params: { id: c.customerId } }));
    expect((await http.call('PUT /api/customers/{id}', { token: D, params: { id: c.customerId }, json: K.customerUpdateBody(k, { companyName: L.companyName() }) })).status()).toBe(200);
    expect((await http.call('PUT /api/customers/{id}/tier', { token: D, params: { id: c.customerId }, json: { tier: 'STRATEGIC' } })).status()).toBe(200);
    expect((await http.call('PUT /api/customers/{id}/credit-limit', { token: D, params: { id: c.customerId }, json: { creditLimit: 100000000 } })).status()).toBe(200);
    const mgrs = items(await data(await http.call('GET /api/customers/assignable-managers', { token: D })));
    expect(mgrs.map((u: any) => u.id ?? u.userId)).toContain(roles.dvkhB.userId);
    expect((await http.call('POST /api/customers/{id}/transfer-account-manager', { token: D, params: { id: c.customerId }, json: { newAccountManagerId: roles.dvkhB.userId, reason: K.TRANSFER_REASON } })).status()).toBe(204);
    const byB = await data(await http.call('GET /api/customers/{id}', { token: roles.dvkhB.accessToken, params: { id: c.customerId } }));
    expect(byB.tier).toBe('STRATEGIC');
    expect(byB.creditLimit).toBe(100000000);
    expect(byB.accountManagerId).toBe(roles.dvkhB.userId);
    expect([403, 404]).toContain((await http.call('PUT /api/customers/{id}', { token: D, params: { id: c.customerId }, json: K.customerUpdateBody(byB) })).status());
  });
  test("FLOW-LEAD-006 Sau chuyển người phụ trách: đọc lại từng HĐ, người cũ bị chặn, người mới thao tác được", { tag: ["@flow", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const Q = roles.qlnt.accessToken;
    const c = await seed.customer();
    expect((await http.call('POST /api/customers/{id}/transfer-account-manager', { token: D, params: { id: c.customerId }, json: { newAccountManagerId: roles.dvkhB.userId, reason: K.TRANSFER_REASON } })).status()).toBe(204);
    const k = await data(await http.call('GET /api/contracts/{id}', { token: roles.dvkhB.accessToken, params: { id: c.contract.id } }));
    expect(k.accountManagerId).toBe(roles.dvkhB.userId);
    expect([403, 404]).toContain((await http.call('PUT /api/contracts/{id}', { token: D, params: { id: c.contract.id }, json: C.updateContract(k, { paymentTermDays: 40 }) })).status());
    expect((await http.call('PUT /api/contracts/{id}', { token: roles.dvkhB.accessToken, params: { id: c.contract.id }, json: C.updateContract(k, { paymentTermDays: 40 }) })).status()).toBe(200);
    expect((await http.call('POST /api/contracts/{id}/extensions', { token: roles.dvkhB.accessToken, params: { id: c.contract.id }, json: { newExpiry: addDays(k.effectiveTo, 30) } })).status()).toBe(200);
    test.info().annotations.push({ type: 'Giới hạn dữ liệu', description: 'Chưa có HĐ EXPIRED để kiểm giữ người cũ' });
  });
  test("FLOW-LEAD-007 MST của Lead đã chuyển đổi không tạo lại được Lead", { tag: ["@flow", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const Q = roles.qlnt.accessToken;
    const c = await seed.customer();
    const r = await http.call('POST /api/leads', { token: N, json: await seed.leadBody('nvkdA', { taxCode: c.lead.taxCode }) });
    expect(r.status()).toBe(409);
  });
});
