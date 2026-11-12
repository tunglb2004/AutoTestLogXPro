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
  test("CR-033 Xuất 2 lần", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

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

    const kpi0 = stable((await pnl(testRun, p0.id)).kpi);
    const body1 = { orderIds: [p0.id, p1.id], sortBy: 'REVENUE', descending: true };
    const r1 = await EXPORT(body1);
    const r2 = await EXPORT(body1);
    expectStatusIn(r1, '200/201', 'lần 1');
    expectStatusIn(r2, '200/201', 'lần 2');
    expect((await fileRows(r2)).data, 'Hai file giống nhau').toEqual((await fileRows(r1)).data);
    expect(stable((await pnl(testRun, p0.id)).kpi), 'Không ghi dữ liệu nghiệp vụ').toEqual(kpi0);

  });
});
