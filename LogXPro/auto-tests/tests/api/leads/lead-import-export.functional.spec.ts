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
test.describe("Xuất danh sách Lead ra Excel", () => {
  const API = "GET /api/leads/export";
  test("LEAD-047 Không xuất Lead của NVKD khác", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const other = await seed.lead('nvkdB');
    const res = await http.call(API, { token: T });
    expect(res.status()).toBe(200);
    expect((await res.body()).includes(Buffer.from(other.taxCode))).toBe(false);
  });
  test("LEAD-048 Bộ lọc không có dữ liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const res = await http.call(API, { token: T, query: { search: `khong-ton-tai-${uuid()}` } });
    expect(res.status()).toBe(400);
    expect(res.headers()['content-type'] ?? '').not.toContain('spreadsheetml');
  });
  test("LEAD-049 Xuất kết hợp nhiều bộ lọc", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead('nvkdA', { source: 'REFERRAL' });
    const b2 = await seed.lead('nvkdA', { source: 'COLD_OUTREACH' });
    const res = await http.call(API, { token: T, query: { status: 'ACTIVE', source: 'REFERRAL', createdFrom: today(), createdTo: today() } });
    expect(res.status()).toBe(200);
    const buf = await res.body();
    expect(buf.includes(Buffer.from(a.taxCode))).toBe(true);
    expect(buf.includes(Buffer.from(b2.taxCode))).toBe(false);
  });
  test("LEAD-045 Xuất Excel theo bộ lọc", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
    expect(res.headers()['content-type'] ?? '').toContain('spreadsheetml');
  });
});

test.describe("Import Lead từ Excel", () => {
  const API = "POST /api/leads/import";
  test("LEAD-055 Import file 3 dòng hợp lệ", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const taxes = [L.taxCode(), L.taxCode(), L.taxCode()];
    const file = await seed.importFile(taxes.map((taxCode) => ({ taxCode })));
    const res = await http.call(API, { token: T, multipart: { file } });
    expect(res.status()).toBe(200);
    expect((await data(res)).created).toBe(3);
    for (const tax of taxes) {
      const [lead] = await seed.leadsByTax(tax);
      expect(lead, tax).toBeTruthy();
      expect(lead.ownerUserId ?? roles.nvkdA.userId).toBe(roles.nvkdA.userId);
      expect(lead.source).toBe('IMPORT');
    }
  });
  test("LEAD-056 Lead import ở trạng thái Đang hoạt động", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const tax = L.taxCode();
    const res = await http.call(API, { token: T, multipart: { file: await seed.importFile([{ taxCode: tax }]) } });
    expect(res.status()).toBe(200);
    const [lead] = await seed.leadsByTax(tax);
    expect(lead.status).toBe('ACTIVE');
    expect(lead.source).toBe('IMPORT');
  });
  test("LEAD-057 Bỏ qua dòng lỗi và dòng trùng MST", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const dup = await seed.lead();
    const [ok1, ok2] = [L.taxCode(), L.taxCode()];
    const res = await http.call(API, { token: T, multipart: { file: await seed.importFile([{ taxCode: ok1 }, { taxCode: ok2 }, { taxCode: dup.taxCode }, { companyName: '', taxCode: L.taxCode() }]) } });
    expect(res.status()).toBe(200);
    const d = await data(res);
    expect(d.created).toBe(2);
    expect((d.failures ?? []).map((f: any) => f.row).length).toBe(2);
    for (const f of d.failures) expect(f.row).toBeGreaterThan(0);
    expect(await seed.leadsByTax(ok1)).toHaveLength(1);
    expect(await seed.leadsByTax(ok2)).toHaveLength(1);
  });
  test("LEAD-058 Hai dòng trùng MST trong cùng file", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const tax = L.taxCode();
    const res = await http.call(API, { token: T, multipart: { file: await seed.importFile([{ taxCode: tax }, { taxCode: tax }]) } });
    expect(res.status()).toBe(200);
    expect((await data(res)).created).toBe(1);
    expect(await seed.leadsByTax(tax)).toHaveLength(1);
  });
  test("LEAD-068 Toàn bộ dòng trong file đều lỗi", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const dup = await seed.lead();
    const t9 = randDigits(9, true);
    const res = await http.call(API, { token: T, multipart: { file: await seed.importFile([{ companyName: '', taxCode: L.taxCode() }, { taxCode: t9 }, { taxCode: dup.taxCode }]) } });
    expect([200, 400]).toContain(res.status());
    if (res.status() === 200) {
      const d = await data(res);
      expect(d.created).toBe(0);
      expect(d.failures).toHaveLength(3);
    }
    expect(await seed.leadsByTax(dup.taxCode)).toHaveLength(1);
  });
  test("LEAD-062 Lỗi cấp file không nhập dòng nào", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Sai mẫu');
    ws.addRow(['Cột A', 'Cột B']);
    const [t1, t2] = [L.taxCode(), L.taxCode()];
    ws.addRow([L.companyName(), t1]);
    ws.addRow([L.companyName(), t2]);
    const res = await http.call(API, { token: T, multipart: { file: F.xlsx(Buffer.from(await wb.xlsx.writeBuffer()), 'sai-mau.xlsx') } });
    expect(res.status()).toBe(400);
    expect(await seed.leadsByTax(t1)).toHaveLength(0);
    expect(await seed.leadsByTax(t2)).toHaveLength(0);
  });
});

test.describe("Tải file mẫu import Lead", () => {
  const API = "GET /api/leads/import-template";
  test("LEAD-069 Tải file mẫu", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
});
