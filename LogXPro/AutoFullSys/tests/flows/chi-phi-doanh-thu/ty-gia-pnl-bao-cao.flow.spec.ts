/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { env } from '../../../src/core/env';
import { credentials } from '../../../src/core/data/accounts';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as K3 from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import * as CCF from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import * as BGK from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as PNLF from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as GM from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import * as YC from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import * as GB from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
import * as LEGS from '../../../src/cau-hinh-chang/data/leg-sandbox';
import * as CFGF from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import * as NB from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tỷ giá, P&L và báo cáo Chi phí – Doanh thu nhất quán", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-PNL-001 Đổi tỷ giá USD làm margin xuống Dưới chuẩn", { tag: ["@flow", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const o = await ORD.p0Order(testRun, 'FX_APPLIED', { editShift: true });
    expectStatusIn(await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 26_000, cnyRate: 3_600 } }), '200/201/204');
    const usd = (await K3.costLines(testRun, o.svc.VT)).find((l: any) => l.currency === 'USD');
    expectMoney(Number(usd.unitPrice) * Number(usd.quantity) * 26_000, 10_400_000, 'VT chi phí 10.400.000');
    const k = (await PNLF.pnl(testRun, o.id)).kpi;
    expectMoney(k.cost, P0.orderCostAtAlt, 'Tổng chi phí');
    expectMoney(k.profit, P0.orderPnlAtAlt, 'P&L');
    expectPercent(k.marginPercent, P0.orderMarginDetailPctAtAlt, 1, 'Margin');
    expect(k.margin, 'Dưới chuẩn').toBe('BELOW_STANDARD');
    const row = items(await data(await http.call('GET /api/cost-revenue/orders', { token: tok('cc'), query: { search: o.code } }))).find((r: any) => r.serviceOrderId === o.id);
    expectPercent(row.marginPercent, P0.orderMarginListPctAtAlt, 2, 'Danh sách 9,43%');

  });

  test("FLOW-PNL-002 Nguồn VCB lấy theo tỷ giá hệ thống", { tag: ["@flow", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const o = await ORD.p0Order(testRun, 'FX_APPLIED', { editShift: true });
    expectStatusIn(await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'VCB' } }), '200/201/204');
    const f = await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } }));
    expect(Number(f.usdRate), 'usdRate = tỷ giá VCB').toBe(Number(f.vcbUsdRate));
    expect(String(f.updatedBy ?? ''), 'Người cập nhật "Hệ thống"').toMatch(/Hệ thống/i);
    const k = (await PNLF.pnl(testRun, o.id)).kpi;
    expectMoney(k.cost, P0.orderCost - P0.serviceCost.VT + 400 * Number(f.vcbUsdRate), 'Chi phí VT = 400 × tỷ giá VCB');

  });

  test("FLOW-PNL-003 Card tính trên toàn tập lọc", { tag: ["@flow", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok, page }) => {

    test.setTimeout(900_000);
    await ORD.completedP0(testRun);
    const all: any[] = [];
    for (let page = 1; page <= 50; page++) { const d = await data(await http.call('GET /api/cost-revenue/orders', { token: tok('cc'), query: { status: ['COMPLETED'], page, perPage: 100 } })); all.push(...items(d)); if (page >= Number(d.meta.pagination.totalPages ?? 1)) break; }
    const s = await data(await http.call('GET /api/cost-revenue/orders/stats', { token: tok('cc'), query: { status: ['COMPLETED'] } }));
    const sum = (f: string) => all.reduce((a: number, r: any) => a + Number(r[f] ?? 0), 0);
    expectMoney(s.totalRevenue, sum('revenue'), 'Tổng doanh thu trên toàn tập lọc');
    expectMoney(s.totalCost, sum('cost'), 'Tổng chi phí');
    expectMoney(s.totalProfit, sum('revenue') - sum('cost'), 'Lợi nhuận');
    expectPercent(s.marginPercent, ((sum('revenue') - sum('cost')) / sum('revenue')) * 100, 2, 'Biên tính từ tổng');
    const xl = await http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json: { statuses: ['COMPLETED'] } });
    if (xl.status() === 200) expect(PNLF.numbersIn((await PNLF.readXlsx(await xl.body())).rows).length, 'File cùng tập').toBeGreaterThan(0);
    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'P1 (10.000.000 / 9.500.000) không dựng được từ bộ giá P0; kiểm card = tổng của toàn tập COMPLETED' });

  });

  test("FLOW-PNL-004 Lọc khách hàng và người tạo dùng nguồn lọc", { tag: ["@flow", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    await ORD.performedP0(testRun);
    const k1 = await data(await http.call('GET /api/auth/me', { token: tok('k1') }));
    const KHA = env.ref('CUSTOMER_A_ID');
    const cust = items(await data(await http.call('GET /api/cost-revenue/customer-options', { token: tok('cc'), query: {} })));
    const creators = items(await data(await http.call('GET /api/cost-revenue/creator-options', { token: tok('cc'), query: {} })));
    expect(cust.some((c: any) => c.id === KHA), 'Nguồn lọc có KH_A').toBe(true);
    expect(creators.some((u: any) => u.id === k1.userId), 'Nguồn lọc có K1').toBe(true);
    const rows = items(await data(await http.call('GET /api/cost-revenue/orders', { token: tok('cc'), query: { customerId: [KHA], creatorId: k1.userId, perPage: 100 } })));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r: any) => r.customerId === KHA && r.createdById === k1.userId), 'Chỉ phiếu KH_A do K1 tạo').toBe(true);

  });

  test("FLOW-PNL-005 Phiếu Đã tiếp nhận có dịch vụ Đang thực hiện không vào báo cáo", { tag: ["@flow", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const p2 = await ORD.p0Order(testRun, 'IN_PROGRESS');
    const rows = items(await data(await http.call('GET /api/cost-revenue/orders', { token: tok('cc'), query: { search: p2.code } })));
    expect(rows.some((r: any) => r.serviceOrderId === p2.id), 'Không có P2').toBe(false);
    const s = await data(await http.call('GET /api/cost-revenue/orders/stats', { token: tok('cc'), query: { search: p2.code } }));
    expect(Number(s.orderCount ?? 0), 'Card không cộng P2').toBe(0);

  });
});
