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
  test("CTV-065 PDF và DOCX được phép, định dạng khác bị chặn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook(); wb.addWorksheet('Giá').addRow(['Tuyến', 'Giá']);
    const send = (file: any) => http.call(API, { token: Q, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file } });
    expect([200, 201]).toContain((await send(F.REAL.docx20())).status());
    expect((await send(F.xlsx(Buffer.from(await wb.xlsx.writeBuffer()), 'gia.xlsx'))).status()).toBe(400);
    expect((await send(F.fakePdf())).status()).toBe(400);
  });
});

test.describe("Tải phụ lục hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/{id}/annexes/{annexId}/file";
  test("CTV-096 Header của file phụ lục HĐ nhà thầu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h['content-type'] ?? '').toContain(p.expectedFile!.mimeType);
    expect(decodeURIComponent(h['content-disposition'] ?? '')).toContain(p.expectedFile!.name);
    expect(Number(h['content-length'] ?? (await res.body()).length)).toBeGreaterThan(0);
  });
});

test.describe("Xem phụ lục PDF trong trình xem", () => {
  const API = "GET /api/contractor-contracts/{id}/annexes/{annexId}/view";
  test("CTV-104 Header hiển thị inline", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorContractWithAnnex();
    const res = await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id } });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type'] ?? '').toContain('application/pdf');
    expect(res.headers()['content-disposition'] ?? 'inline').toMatch(/^inline/);
  });
});
