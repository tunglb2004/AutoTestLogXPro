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
test.describe("Thêm phụ lục hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/annexes";
  test("CTR-091 Vòng đời phụ lục: thêm, xem, sửa, xóa", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    expect([200, 201]).toContain((await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: F.pdf() } })).status());
    const annex = (await seed.getContract(c.contract.id)).annexes[0];
    expect(annex).toBeTruthy();
    expect((await http.call('PUT /api/contracts/{id}/annexes/{annexId}', { token: D, params: { id: c.contract.id, annexId: annex.id }, json: C.annexMeta({ name: 'Phụ lục đổi tên' }) })).status()).toBe(200);
    expect((await seed.getContract(c.contract.id)).annexes[0].name).toBe('Phụ lục đổi tên');
    expect([200, 204]).toContain((await http.call('DELETE /api/contracts/{id}/annexes/{annexId}', { token: D, params: { id: c.contract.id, annexId: annex.id } })).status());
    expect((await seed.getContract(c.contract.id)).annexes).toHaveLength(0);
  });
  test("CTR-080 Thêm phụ lục PDF", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getContract(String(p.params!.id));
    expect(c.annexes.at(-1).code).toMatch(/^PLC\d{4}-\d{3}$/);
    expect(c.status).toBe('ACTIVE');
  });
  test("CTR-084 Thêm phụ lục cho HĐ ở trạng thái đóng", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const c = await seed.customer({ pending: true });
    await http.call('POST /api/contracts/{id}/cancel', { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, json: { reason: 'Khách đổi ý' } });
    const res = await http.call(API, { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: F.pdf('phu-luc.pdf') } });
    expect([200, 201]).toContain(res.status());
    expect((await seed.getContract(c.contract.id)).status).toBe('CANCELLED');
  });
  test("CTR-086 Không đổi trạng thái HĐ và có lịch sử", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const before = (await seed.history('/api/contracts', c.contract.id, 'dvkhA')).length;
    expect([200, 201]).toContain((await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: F.pdf() } })).status());
    expect((await seed.getContract(c.contract.id)).status).toBe('ACTIVE');
    expect((await seed.history('/api/contracts', c.contract.id, 'dvkhA')).length).toBeGreaterThan(before);
  });
});

test.describe("Sửa phụ lục hợp đồng khách hàng", () => {
  const API = "PUT /api/contracts/{id}/annexes/{annexId}";
  test("CTR-092 Sửa tên và mô tả", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getContract(String(p.params!.id));
    expect(c.annexes.find((a: any) => a.id === p.params!.annexId).name).toBe('Phụ lục điều chỉnh đã sửa');
  });
  test("CTR-093 Thay file phụ lục", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.contractWithAnnex();
    const newFile = F.pdf('phu-luc-moi.pdf', 70 * 1024);
    expect((await http.call(API, { token: D, params: { id: c.contract.id, annexId: c.annex.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: newFile } })).status()).toBe(200);
    const dl = await http.call('GET /api/contracts/{id}/annexes/{annexId}/file', { token: D, params: { id: c.contract.id, annexId: c.annex.id } });
    expect(sha256(await dl.body())).toBe(sha256(newFile.buffer));
    expect((await seed.getContract(c.contract.id)).annexes.find((a: any) => a.id === c.annex.id).code).toBe(c.annex.code);
  });
  test("CTR-102 Sửa phụ lục của HĐ đã hủy", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer({ pending: true });
    await http.call('POST /api/contracts/{id}/annexes', { token: D, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: F.pdf() } });
    await http.call('POST /api/contracts/{id}/cancel', { token: D, params: { id: c.contract.id }, json: { reason: 'Khách đổi ý' } });
    const annex = (await seed.getContract(c.contract.id)).annexes[0];
    expect((await http.call(API, { token: D, params: { id: c.contract.id, annexId: annex.id }, json: C.annexMeta({ name: 'Phụ lục sửa' }) })).status()).toBe(200);
    expect((await seed.getContract(c.contract.id)).status).toBe('CANCELLED');
  });
  test("CTR-097 Ghi lịch sử sửa phụ lục", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
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

test.describe("Xóa phụ lục hợp đồng khách hàng", () => {
  const API = "DELETE /api/contracts/{id}/annexes/{annexId}";
  test("CTR-103 Xóa phụ lục", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 204]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const c = await seed.getContract(String(p.params!.id));
    expect(c.annexes.some((a: any) => a.id === p.params!.annexId)).toBe(false);
    expect(c.status).toBe('ACTIVE');
  });
  test("CTR-104 Xóa phụ lục của HĐ đã hủy", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer({ pending: true });
    await http.call('POST /api/contracts/{id}/annexes', { token: D, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file: F.pdf() } });
    await http.call('POST /api/contracts/{id}/cancel', { token: D, params: { id: c.contract.id }, json: { reason: 'Khách đổi ý' } });
    const annex = (await seed.getContract(c.contract.id)).annexes[0];
    const before = (await seed.history('/api/contracts', c.contract.id, 'dvkhA')).length;
    expect([200, 204]).toContain((await http.call(API, { token: D, params: { id: c.contract.id, annexId: annex.id } })).status());
    const after = await seed.getContract(c.contract.id);
    expect(after.status).toBe('CANCELLED');
    expect(after.annexes).toHaveLength(0);
    expect((await seed.history('/api/contracts', c.contract.id, 'dvkhA')).length).toBeGreaterThan(before);
  });
  test("CTR-106 Sau khi xóa không tải được file", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.contractWithAnnex();
    expect([200, 204]).toContain((await http.call(API, { token: D, params: { id: c.contract.id, annexId: c.annex.id } })).status());
    expect((await http.call('GET /api/contracts/{id}/annexes/{annexId}/file', { token: D, params: { id: c.contract.id, annexId: c.annex.id } })).status()).toBe(404);
  });
});

test.describe("Tải file phụ lục hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/{id}/annexes/{annexId}/file";
  test("CTR-111 Tải file phụ lục", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    expect(sha256(await res.body())).toBe(sha256(p.expectedFile!.buffer));
  });
});
