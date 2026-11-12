import { runPendingPurchaseFlow } from '../../../src/gia-mua-dau-vao/data/pending-price-flows';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { env } from '../../../src/core/env';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as K3 from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import * as CCF from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import * as BGK from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as PNLF from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as GM from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import * as YC from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import * as GB from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Đổi Giá mua đầu vào: ảnh hưởng định mức, báo giá và chi phí phiếu", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-CHG-BGM-001 Sửa dòng giá là nguồn duy nhất: dòng Chờ phê duyệt, SBP/SSP biến mất, báo giá Hết hạn", { tag: ["@flow", "@gia-mua-dau-vao", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingPurchaseFlow("FLOW-CHG-BGM-001", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-BGM-002 Sửa dòng giá khi còn nguồn Đã phê duyệt khác: định mức còn, báo giá không đổi", { tag: ["@flow", "@gia-mua-dau-vao", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingPurchaseFlow("FLOW-CHG-BGM-002", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-BGM-003 Phiếu đã điều phối dòng đang Chờ phê duyệt không làm mới được giá", { tag: ["@flow", "@gia-mua-dau-vao", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingPurchaseFlow("FLOW-CHG-BGM-003", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-BGM-004 Dòng Chờ phê duyệt không dùng được khi điều phối phiếu mới", { tag: ["@flow", "@gia-mua-dau-vao", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingPurchaseFlow("FLOW-CHG-BGM-004", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-BGM-005 Xóa dòng giá đang dùng ở phiếu", { tag: ["@flow", "@gia-mua-dau-vao", "@p2"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingPurchaseFlow("FLOW-CHG-BGM-005", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-BGM-006 Ngừng bảng giá nhà thầu: phiếu mới không chọn được nhà thầu", { tag: ["@flow", "@gia-mua-dau-vao", "@p2"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingPurchaseFlow("FLOW-CHG-BGM-006", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-BGM-007 Sau phê duyệt dòng giá: làm mới chi phí rồi quyết toán", { tag: ["@flow", "@gia-mua-dau-vao", "@p1", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-BGM-007');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const A = env.ref('CONTRACTOR_A_ID');
    const o = await ORD.p0Order(testRun, 'COMPLETED', {
      base, editShift: true,
      before: {
        KHQ_COSTS: async (x) => {
          await GM.changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
          const fee = (await K3.costLines(testRun, x.svc.KHQ)).find((l: any) => l.unitCode === refs.units.customsFee);
          const cur = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: x.id, type: refs.services.KHQ, costLineId: fee.costLineId } }));
          await must(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: x.id, type: refs.services.KHQ, contractorId: A }, json: { currency: 'VND', lines: [{ costLineId: fee.costLineId, unitCode: fee.unitCode, quantity: Number(fee.quantity), unitPrice: Number(cur?.currentAmount) }] } }), 'làm mới giá Phí khai báo');
        },
      },
    });
    test.info().annotations.push({ type: 'Chờ xác nhận', description: 'Phụ thuộc chức năng phê duyệt dòng giá chưa triển khai theo SRS' });
    const k = await kpi(o.id);
    expectMoney(k.revenue, 15_900_000, 'Doanh thu');
    expectMoney(k.cost, 14_100_000, 'Chi phí');
    expectMoney(k.profit, 1_800_000, 'Lãi');
    expectPercent(k.marginPercent, 11.3, 1, 'Margin chi tiết');
    const row = items(await data(await http.call('GET /api/cost-revenue/orders', { token: tok('cc'), query: { search: o.code } }))).find((r: any) => r.serviceOrderId === o.id);
    expectPercent(row.marginPercent, 11.32, 2, 'Báo cáo 11,32%');
    const conf = await data(await http.call('GET /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } }));
    expectMoney(conf.grandTotal, P0.orderRevenueWithVat, 'Doanh thu gồm VAT vẫn 17.172.000');

  });

  test("FLOW-CHG-BGM-008 Sửa giá dòng thuộc bảng Tạo mới không chuyển Chờ phê duyệt", { tag: ["@flow", "@gia-mua-dau-vao", "@p2"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingPurchaseFlow("FLOW-CHG-BGM-008", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });
});
