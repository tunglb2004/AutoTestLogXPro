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

test.describe("Màn Chi phí – Doanh thu (báo cáo quản trị)", () => {
  test("CR-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/cost-revenue/orders", "GET /api/cost-revenue/orders/stats", "GET /api/cost-revenue/customer-options", "GET /api/cost-revenue/creator-options", "POST /api/cost-revenue/exports", "GET /api/cost-revenue/exports/{id}", "GET /api/cost-revenue/exports/{id}/file"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "k1");
      const before = await testRun.snapshot(api, p.params ?? {}, "k1");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.k1)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "k1"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("CR-007 K1 xem màn quản trị", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, tok, page }) => {

    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const res = await LIST({}, 'k1');
    expectStatusIn(res, '403');
    await expectApiError(res);

  });
});
