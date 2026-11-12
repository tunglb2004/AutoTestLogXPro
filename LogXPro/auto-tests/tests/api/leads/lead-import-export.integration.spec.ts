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
test.describe("Tải file mẫu import Lead", () => {
  const API = "GET /api/leads/import-template";
  test("LEAD-070 File mẫu là xlsx có sheet danh mục", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const res = await http.call(API, { token: T });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type'] ?? '').toContain('spreadsheetml');
    const x = await xlsxDataRows(await res.body());
    expect(x.sheetNames.length).toBeGreaterThan(1);
  });
  test("LEAD-071 File mẫu import ngược lại được", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const tax = L.taxCode();
    const res = await http.call('POST /api/leads/import', { token: T, multipart: { file: await seed.importFile([{ taxCode: tax }]) } });
    expect(res.status()).toBe(200);
    expect((await data(res)).created).toBe(1);
  });
});

test.describe("Xuất danh sách Lead ra Excel", () => {
  const API = "GET /api/leads/export";
  test("LEAD-046 Định dạng file xuất", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    await seed.lead();
    const res = await http.call(API, { token: T });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type'] ?? '').toContain('spreadsheetml');
    expect(decodeURIComponent(res.headers()['content-disposition'] ?? '')).toContain('.xlsx');
    const x = await xlsxDataRows(await res.body());
    expect(x.header.filter(Boolean).length).toBeGreaterThan(0);
  });
});

test.describe("Import Lead từ Excel", () => {
  const API = "POST /api/leads/import";
  test("LEAD-059 File sai định dạng hoặc sai cấu trúc cột", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const tpl = await seed.importTemplate();
    const wrong = await (async () => { const ExcelJS = (await import('exceljs')).default; const wb = new ExcelJS.Workbook(); wb.addWorksheet('Lead').addRow(['Tên doanh nghiệp', 'Tuyến']); wb.getWorksheet('Lead')!.addRow(['Công ty thiếu cột MST', 'Nội địa']); return Buffer.from(await wb.xlsx.writeBuffer()); })();
    for (const file of [F.csv(), F.pdf('danh-sach.pdf'), F.xlsx(wrong, 'thieu-cot.xlsx')]) {
      const res = await http.call(API, { token: T, multipart: { file } });
      expect(res.status(), file.name).toBe(400);
    }
    expect(tpl.length).toBeGreaterThan(0);
  });
});
