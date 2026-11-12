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
test.describe("Gỡ tài liệu Lead", () => {
  const API = "DELETE /api/leads/{id}/documents/{documentId}";
  test("LEAD-179 Gỡ tài liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200, 204]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const again = await seed.getLead(String(p.params!.id));
    expect(again.documents.some((x: any) => x.id === p.params!.documentId)).toBe(false);
  });
  test("LEAD-180 Gỡ tài liệu của Lead đã chuyển đổi", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const d = await seed.leadWithDocument();
    await http.call('POST /api/contracts', { token: T, multipart: { contract: jsonPart('contract', C.uploadContract(d.lead.id, roles.dvkhA.userId)), file: F.pdf() } });
    expect([400, 409]).toContain((await http.call(API, { token: T, params: { id: d.lead.id, documentId: d.doc.id } })).status());
  });
  test("LEAD-182 Sau khi gỡ không tải được", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const d = await seed.leadWithDocument();
    expect([200, 204]).toContain((await http.call(API, { token: T, params: { id: d.lead.id, documentId: d.doc.id } })).status());
    expect((await http.call('GET /api/leads/{id}/documents/{documentId}', { token: T, params: { id: d.lead.id, documentId: d.doc.id } })).status()).toBe(404);
  });
});

test.describe("Đính kèm tài liệu Lead", () => {
  const API = "POST /api/leads/{id}/documents";
  test("LEAD-159 Upload file PDF 1MB", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([201]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    const again = await seed.getLead(String(p.params!.id));
    expect(again.documents.map((x: any) => x.filename)).toContain('ho-so.pdf');
  });
  test("LEAD-164 Upload cho Lead đã chuyển đổi", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const l = (await seed.customer()).lead;
    expect([400, 409]).toContain((await http.call(API, { token: T, params: { id: l.id }, multipart: { file: F.pdf() } })).status());
  });
  test("LEAD-166 Upload lỗi không tạo bản ghi tài liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    expect([400, 413]).toContain((await http.call(API, { token: T, params: { id: a.id }, multipart: { file: F.REAL.pdf11() } })).status());
    expect((await seed.getLead(a.id)).documents).toHaveLength(0);
  });
});

test.describe("Tải tài liệu Lead", () => {
  const API = "GET /api/leads/{id}/documents/{documentId}";
  test("LEAD-172 Tải tài liệu Lead", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    expect(sha256(await res.body())).toBe(sha256(p.expectedFile!.buffer));
  });
});
