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

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu", () => {
  test("PNL-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/service-orders/{id}/pnl", "GET /api/service-orders/{id}/pnl/export", "GET /api/service-orders/{id}/pnl/fx-rate", "PUT /api/service-orders/{id}/pnl/fx-rate"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "cc");
      const before = await testRun.snapshot(api, p.params ?? {}, "cc");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.cc)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "cc"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("PNL-008 Điều phối viên chỉ thấy dịch vụ phụ trách", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const o = await performedP0(testRun);
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('dpVt'), params: { id: o.id } });
    expectStatusIn(res, '200/403');
    if (res.status() === 200) {
      const d = await data(res);
      const codes = d.legs.flatMap((l: any) => l.services.map((s: any) => s.serviceTypeCode ?? s.code));
      expect(codes, 'Báo cáo có đúng một dịch vụ VT').toEqual([refs.services.VT]);
      expectMoney(d.kpi.revenue, P0.serviceRevenue.VT, 'Chỉ doanh thu VT');
      expectMoney(d.kpi.cost, P0.serviceCost.VT, 'Chỉ chi phí VT');
      expectMoney(d.kpi.profit, P0.serviceRevenue.VT - P0.serviceCost.VT, 'Chỉ lợi nhuận VT');
    } else {
      await expectNoData(res);
    }

  });

  test("PNL-015 K1B xuất", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await performedP0(testRun);
    const res = await http.call('GET /api/service-orders/{id}/pnl/export', { token: tok('k1b'), params: { id: o.id } });
    expectStatusIn(res, '403/404');
    expect(isXlsx(await res.body(), res.headers()['content-type']), 'Không trả file').toBe(false);

  });

  test("PNL-028 Tỷ giá phiếu này không ảnh hưởng phiếu khác", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'PERFORMED');
    const q = await p0Order(testRun, 'ACCEPTED');
    const fxQ = () => http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: q.id } });
    const qBefore = await data(await fxQ());
    expect(qBefore.source, 'Tiền điều kiện: Q đang VCB').toBe('VCB');
    const res = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 26000, cnyRate: 3_600 } });
    expectStatusIn(res, '200/204');
    const qAfter = await data(await fxQ());
    expect(qAfter.source, 'Q vẫn VCB').toBe('VCB');
    expect(Number(qAfter.usdRate), 'Tỷ giá Q không đổi').toBe(Number(qBefore.usdRate));

  });
});
