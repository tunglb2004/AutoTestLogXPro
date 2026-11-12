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
import * as R_chi_phi_doanh_thu_pnl_phieu from '../../../src/chi-phi-doanh-thu/api/schemas/pnl-phieu.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu", () => {
  test("PNL-010 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/pnl";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_chi_phi_doanh_thu_pnl_phieu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["serviceOrderId", "code", "customerName", "originLabel", "destinationLabel", "legsConfirmed", "revenueConfirmed", "confirmedBy", "confirmedAt", "showsRevenue", "showsCost", "fxRate", "kpi", "legs"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("PNL-017 Đúng loại phản hồi và nội dung", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await performedP0(testRun);
    const res = await http.call('GET /api/service-orders/{id}/pnl/export', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const buf = await res.body();
    expect(isXlsx(buf, res.headers()['content-type']), 'File xlsx').toBe(true);
    const x = await readXlsx(buf);
    const nums = numbersIn(x.rows);

    expect(res.headers()['content-type'] ?? '').toMatch(/spreadsheetml|octet-stream/);
    const header = JSON.stringify(x.rows.slice(0, 10));
    for (const col of ['Chặng', 'Dịch vụ', 'Đầu mục', 'Doanh thu', 'Chi phí gốc', 'Chi phí quy đổi', 'Lợi nhuận']) expect(header, `Có cột ${col}`).toContain(col);
    const k = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expect(nums, 'Tổng khớp P&L').toEqual(expect.arrayContaining([Number(k.revenue), Number(k.cost)]));

  });

  test("PNL-021 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/pnl/fx-rate";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_chi_phi_doanh_thu_pnl_phieu.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["source", "sourceLabel", "usdRate", "cnyRate", "updatedBy", "updatedAt", "vcbUnavailable", "locked", "vcbUsdRate", "vcbCnyRate"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("PNL-033 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'PERFORMED');
    const res = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 26000, cnyRate: 3600 } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['source', 'sourceLabel', 'usdRate', 'cnyRate', 'updatedBy', 'updatedAt', 'vcbUnavailable', 'locked', 'vcbUsdRate', 'vcbCnyRate']) expect(b.data, `data có ${k}`).toHaveProperty(k);
    expect(typeof b.data.locked).toBe('boolean');
    expect(['VCB', 'MANUAL']).toContain(b.data.source);

  });
});
