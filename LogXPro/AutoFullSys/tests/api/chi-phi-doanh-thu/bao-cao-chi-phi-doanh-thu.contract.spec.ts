/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, revenueOf, revenueTable, runService, performedP0, completedP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costLines, coordinate, startService, saveActuals, uploadActualDoc, completeService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { pnl, readXlsx, numbersIn, isXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as R_chi_phi_doanh_thu_bao_cao_chi_phi_doanh_thu from '../../../src/chi-phi-doanh-thu/api/schemas/bao-cao-chi-phi-doanh-thu.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Màn Chi phí – Doanh thu (báo cáo quản trị)", () => {
  test("CR-010 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/orders";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_chi_phi_doanh_thu_bao_cao_chi_phi_doanh_thu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["serviceOrderId", "code", "customerId", "customerName", "customerTaxCode", "status", "statusLabel", "revenue", "cost", "profit", "marginPercent", "missingFxRate", "settled", "performedAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("CR-016 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/orders/stats";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_chi_phi_doanh_thu_bao_cao_chi_phi_doanh_thu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["orderCount", "totalRevenue", "totalCost", "totalProfit", "marginPercent", "incomplete"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("CR-019 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/customer-options";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_chi_phi_doanh_thu_bao_cao_chi_phi_doanh_thu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "companyName", "taxCode"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("CR-022 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/creator-options";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_chi_phi_doanh_thu_bao_cao_chi_phi_doanh_thu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "displayName", "email"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("CR-031 Đúng loại phản hồi và nội dung", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    const p0 = await performedP0(testRun);
    const p1 = await completedP0(testRun);
    const EXPORT = (json: Record<string, unknown>) => http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json });
    /** Dòng dữ liệu (có mã ORD) của sheet báo cáo. */
    const fileRows = async (res: any) => {
      const x = await readXlsx(await res.body(), 'BaoCao_ChiPhi_DoanhThu');
      const head = x.rows.find((r) => r.some((c) => /Doanh thu/i.test(String(c)))) ?? [];
      const col = (rx: RegExp) => head.findIndex((c) => rx.test(String(c)));
      return { x, head, col, data: x.rows.filter((r) => r.some((c) => /^ORD/i.test(String(c ?? '').trim()))) };
    };

    const res = await EXPORT({ orderIds: [p0.id, p1.id], sortBy: 'REVENUE', descending: true });
    expectStatusIn(res, '200/202');
    if (res.status() === 200) {
      const buf = await res.body();
      expect(isXlsx(buf, res.headers()['content-type']), 'File xlsx nhị phân').toBe(true);
      expect((await readXlsx(buf)).names).toContain('BaoCao_ChiPhi_DoanhThu');
    } else {
      expect(typeof (await data(res))?.id, '202 kèm id lượt xuất').toBe('string');
    }

  });

  test("CR-038 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/cost-revenue/exports/{id}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_chi_phi_doanh_thu_bao_cao_chi_phi_doanh_thu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "status", "fileName", "rowCount", "skippedCount", "createdAt", "finishedAt", "expiresAt"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("CR-044 Đúng loại phản hồi và nội dung", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, tok }) => {

    const start = await http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json: {} });
    if (start.status() !== 202) throw new Error(`Chuẩn bị dữ liệu thất bại: xuất toàn bộ trả HTTP ${start.status()} (không chạy nền); cần > 5.000 phiếu để có lượt xuất chạy nền`);
    const exportId = (await data(start))?.id as string;
    const STATUS = () => http.call('GET /api/cost-revenue/exports/{id}', { token: tok('cc'), params: { id: exportId } });

    await expect.poll(async () => (await data(await STATUS()))?.status, { timeout: 110_000, message: 'Lượt xuất chạy xong' }).toBe('READY');
    const st = await data(await STATUS());
    const res = await http.call('GET /api/cost-revenue/exports/{id}/file', { token: tok('cc'), params: { id: exportId } });

    expectStatusIn(res, '200');
    expect(res.headers()['content-type'] ?? '').toMatch(/spreadsheetml|octet-stream/);
    expect(res.headers()['content-disposition'] ?? '', 'Có tên file').toMatch(/filename/i);
    const x = await readXlsx(await res.body(), 'BaoCao_ChiPhi_DoanhThu');
    const n = x.rows.filter((r) => r.some((c) => /^ORD/i.test(String(c ?? '').trim()))).length;
    expect(n, 'Số dòng = số phiếu của lượt xuất').toBe(Number(st.rowCount));

  });
});
