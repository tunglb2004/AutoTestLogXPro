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
  test("CR-025 Nội dung và định dạng file", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const res = await EXPORT({ orderIds: [p0.id, p1.id], sortBy: 'REVENUE', descending: true });
    expectStatusIn(res, '200/201');
    const f = await fileRows(res);
    expect(f.x.names, 'Sheet BaoCao_ChiPhi_DoanhThu').toContain('BaoCao_ChiPhi_DoanhThu');
    for (const o of [p0, p1]) {
      const line = f.data.filter((r) => r.some((c) => String(c).includes(o.code)));
      expect(line, `Mỗi dòng 1 ORD (${o.code})`).toHaveLength(1);
      const scr = (await rows({ search: o.code })).find((r: any) => r.serviceOrderId === o.id);
      expect(Number(line[0][f.col(/Doanh thu/i)]), 'Doanh thu trùng màn hình').toBe(Number(scr.revenue));
      expect(Number(line[0][f.col(/Chi phí/i)]), 'Chi phí trùng màn hình').toBe(Number(scr.cost));
    }

  });
});
