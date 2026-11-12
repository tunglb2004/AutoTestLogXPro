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
test.describe("Đính kèm tài liệu pháp lý nhà thầu", () => {
  const API = "POST /api/contractors/{id}/documents";
  test("VDR-106 Các định dạng được phép", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook(); wb.addWorksheet('Năng lực').addRow(['Xe', 'Số lượng']);
    const h = await seed.contractor();
    const files = [F.pdf(), F.REAL.docx10(), F.REAL.jpg10(), F.REAL.png10(), F.REAL.xlsx10(), F.REAL.zip10(), F.xlsx(Buffer.from(await wb.xlsx.writeBuffer()), 'nang-luc.xlsx')];
    for (const file of files) expect((await http.call(API, { token: Q, params: { id: h.id }, multipart: { file } })).status(), file.name).toBe(201);
    expect((await seed.getContractor(h.id)).documents).toHaveLength(files.length);
  });
  test("VDR-107 Định dạng không cho phép", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    for (const file of [F.REAL.other('exe'), F.REAL.other('mp4'), F.fakePdf()]) expect((await http.call(API, { token: Q, params: { id: h.id }, multipart: { file } })).status(), file.name).toBe(400);
    expect((await seed.getContractor(h.id)).documents).toHaveLength(0);
  });
});

test.describe("Tải tài liệu nhà thầu", () => {
  const API = "GET /api/contractors/{id}/documents/{documentId}";
  test("VDR-119 Header của tài liệu nhà thầu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h['content-type'] ?? '').toContain(p.expectedFile!.mimeType);
    expect(decodeURIComponent(h['content-disposition'] ?? '')).toContain(p.expectedFile!.name);
    expect(Number(h['content-length'] ?? (await res.body()).length)).toBeGreaterThan(0);
  });
});
