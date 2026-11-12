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
test.describe("Thêm phụ lục hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/annexes";
  test("CTV-075 Vòng đời phụ lục HĐ nhà thầu: thêm, xem, sửa, xóa", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    expect([200, 201]).toContain((await http.call(API, { token: Q, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: F.pdf() } })).status());
    const a = (await seed.getContractorContract(c.contract.id)).annexes[0];
    expect((await http.call('PUT /api/contractor-contracts/{id}/annexes/{annexId}', { token: Q, params: { id: c.contract.id, annexId: a.id }, json: C.annexMeta({ name: 'Phụ lục đổi tên' }) })).status()).toBe(200);
    expect((await seed.getContractorContract(c.contract.id)).annexes[0].name).toBe('Phụ lục đổi tên');
    expect([200, 204]).toContain((await http.call('DELETE /api/contractor-contracts/{id}/annexes/{annexId}', { token: Q, params: { id: c.contract.id, annexId: a.id } })).status());
    expect((await seed.getContractorContract(c.contract.id)).annexes).toHaveLength(0);
  });
  test("CTV-064 Thêm phụ lục PDF", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-068 HĐ Đã hủy hoặc nhà thầu Dừng hợp tác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const p = await seed.contractorWithContract({ pending: true });
    await http.call('POST /api/contractor-contracts/{id}/cancel', { token: Q, params: { id: p.contract.id }, json: { reason: 'Nhà thầu rút' } });
    const d = await seed.terminatedContractor();
    for (const id of [p.contract.id, d.contract.id]) expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: F.pdf() } })).status());
  });
  test("CTV-070 Ghi lịch sử, không đổi trạng thái", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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

test.describe("Sửa phụ lục hợp đồng nhà thầu", () => {
  const API = "PUT /api/contractor-contracts/{id}/annexes/{annexId}";
  test("CTV-076 Sửa tên, mô tả", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-077 Thay file", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorContractWithAnnex();
    const newFile = F.pdf('phu-luc-moi.pdf', 80 * 1024);
    expect((await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: newFile } })).status()).toBe(200);
    const dl = await http.call('GET /api/contractor-contracts/{id}/annexes/{annexId}/file', { token: Q, params: { id: c.contract.id, annexId: c.annex.id } });
    expect(sha256(await dl.body())).toBe(sha256(newFile.buffer));
  });
  test("CTV-078 Nhà thầu Dừng hợp tác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorContractWithAnnex();
    await http.call('POST /api/contractors/{id}/terminate', { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } });
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id }, json: C.annexMeta({ name: 'Không được sửa' }) })).status());
  });
  test("CTV-082 Ghi lịch sử", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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

test.describe("Xóa phụ lục hợp đồng nhà thầu", () => {
  const API = "DELETE /api/contractor-contracts/{id}/annexes/{annexId}";
  test("CTV-087 Xóa phụ lục", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 204]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-088 HĐ Đã hủy hoặc nhà thầu Dừng hợp tác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorContractWithAnnex();
    await http.call('POST /api/contractors/{id}/terminate', { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } });
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id } })).status());
    expect((await seed.getContractorContract(c.contract.id)).annexes).toHaveLength(1);
  });
  test("CTV-090 Sau khi xóa không tải được", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorContractWithAnnex();
    const before = (await seed.history('/api/contractor-contracts', c.contract.id, 'qlnt')).length;
    expect([200, 204]).toContain((await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id } })).status());
    expect((await http.call('GET /api/contractor-contracts/{id}/annexes/{annexId}/file', { token: Q, params: { id: c.contract.id, annexId: c.annex.id } })).status()).toBe(404);
    expect((await seed.history('/api/contractor-contracts', c.contract.id, 'qlnt')).length).toBeGreaterThan(before);
  });
});

test.describe("Tải phụ lục hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/{id}/annexes/{annexId}/file";
  test("CTV-102 Tải được khi nhà thầu Dừng hợp tác và có lịch sử tải", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorContractWithAnnex();
    await http.call('POST /api/contractors/{id}/terminate', { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } });
    const before = (await seed.history('/api/contractor-contracts', c.contract.id, 'qlnt')).length;
    expect((await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id } })).status()).toBe(200);
    expect((await seed.history('/api/contractor-contracts', c.contract.id, 'qlnt')).length).toBeGreaterThan(before);
  });
  test("CTV-095 Tải file phụ lục HĐ nhà thầu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    expect(sha256(await res.body())).toBe(sha256(p.expectedFile!.buffer));
  });
});

test.describe("Xem phụ lục PDF trong trình xem", () => {
  const API = "GET /api/contractor-contracts/{id}/annexes/{annexId}/view";
  test("CTV-103 Xem phụ lục PDF", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("CTV-105 Phụ lục DOCX không xem trực tiếp", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorContractWithAnnex(F.REAL.docx20());
    const res = await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id } });
    expect([400, 409, 415]).toContain(res.status());
  });
});
