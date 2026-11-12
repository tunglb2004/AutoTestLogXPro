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
test.describe("Gỡ tài liệu nhà thầu", () => {
  const API = "DELETE /api/contractors/{id}/documents/{documentId}";
  test("VDR-125 Gỡ tài liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 204]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("VDR-126 Gỡ tài liệu nhà thầu Dừng hợp tác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const c = await seed.contractorWithContract();
    await http.call('POST /api/contractors/{id}/documents', { token: Q, params: { id: c.contractor.id }, multipart: { file: F.pdf() } });
    await http.call('POST /api/contractors/{id}/terminate', { token: Q, params: { id: c.contractor.id }, json: { reason: 'Vi phạm' } });
    const doc = (await seed.getContractor(c.contractor.id)).documents[0];
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: c.contractor.id, documentId: doc.id } })).status());
    expect((await seed.getContractor(c.contractor.id)).documents).toHaveLength(1);
  });
  test("VDR-128 Sau khi gỡ không tải được", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const d = await seed.contractorWithDocument();
    expect([200, 204]).toContain((await http.call(API, { token: Q, params: { id: d.contractor.id, documentId: d.doc.id } })).status());
    expect((await http.call('GET /api/contractors/{id}/documents/{documentId}', { token: Q, params: { id: d.contractor.id, documentId: d.doc.id } })).status()).toBe(404);
  });
});

test.describe("Đính kèm tài liệu pháp lý nhà thầu", () => {
  const API = "POST /api/contractors/{id}/documents";
  test("VDR-105 Upload PDF 1MB", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
  test("VDR-110 Nhà thầu Dừng hợp tác", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const d = await seed.terminatedContractor();
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: d.contractor.id }, multipart: { file: F.pdf() } })).status());
  });
  test("VDR-112 Upload lỗi không tạo bản ghi", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    expect([400, 413]).toContain((await http.call(API, { token: Q, params: { id: h.id }, multipart: { file: F.REAL.pdf11() } })).status());
    expect((await seed.getContractor(h.id)).documents).toHaveLength(0);
  });
});

test.describe("Tải tài liệu nhà thầu", () => {
  const API = "GET /api/contractors/{id}/documents/{documentId}";
  test("VDR-118 Tải tài liệu nhà thầu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    expect(sha256(await res.body())).toBe(sha256(p.expectedFile!.buffer));
  });
});
