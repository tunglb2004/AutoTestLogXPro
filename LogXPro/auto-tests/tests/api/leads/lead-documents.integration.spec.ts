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
test.describe("Đính kèm tài liệu Lead", () => {
  const API = "POST /api/leads/{id}/documents";
  test("LEAD-160 Các định dạng được phép", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook(); wb.addWorksheet('Bảng kê').addRow(['Mặt hàng', 'Số lượng']);
    const files = [F.pdf('hop-dong.pdf'), F.REAL.docx10(), F.REAL.xlsx10(), F.REAL.png10(), F.REAL.jpg10(), F.xlsx(Buffer.from(await wb.xlsx.writeBuffer()), 'bang-ke.xlsx')];
    const a = await seed.lead();
    for (const file of files) expect((await http.call(API, { token: T, params: { id: a.id }, multipart: { file } })).status(), file.name).toBe(201);
    expect((await seed.getLead(a.id)).documents).toHaveLength(files.length);
  });
  test("LEAD-161 Định dạng không cho phép và file đổi đuôi", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    for (const file of [F.REAL.other('exe'), F.REAL.zip10(), F.fakePdf()]) expect((await http.call(API, { token: T, params: { id: a.id }, multipart: { file } })).status(), file.name).toBe(400);
    expect((await seed.getLead(a.id)).documents).toHaveLength(0);
  });
});

test.describe("Tải tài liệu Lead", () => {
  const API = "GET /api/leads/{id}/documents/{documentId}";
  test("LEAD-173 Header của tài liệu Lead", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h['content-type'] ?? '').toContain(p.expectedFile!.mimeType);
    expect(decodeURIComponent(h['content-disposition'] ?? '')).toContain(p.expectedFile!.name);
    expect(Number(h['content-length'] ?? (await res.body()).length)).toBeGreaterThan(0);
  });
});
