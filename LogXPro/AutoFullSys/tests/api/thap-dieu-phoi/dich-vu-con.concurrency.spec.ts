/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, orderBody, getOrder, revenueOf, revenueTable, rejectOrder, runService, uploadOrderDoc, uploadVehicleDoc, buildP0, addSealCost, scopeRequestOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costs, costLines, costItem, addCost, saveActuals, startService, completeService, uploadActualDoc, coordinate } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { changeLinePrice } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { setItemStatus } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { pnl } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { action, openOrder, servicePanel, withOps } from '../../../src/phieu-dich-vu/data/operations-ui';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)", () => {
  test("K3S-034 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const API = 'POST /api/k3/service-orders/{id}/services/{type}/start';
    const opts = { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } };
    expectStatusIn(await http.call(API, opts), '200/204', 'lần 1');
    const after1 = stable(await k3Order(testRun, o.id));
    const log1 = items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length;
    const second = await http.call(API, opts);
    expectStatusIn(second, '400/409/422', 'lần 2');
    await expectApiError(second);
    expect(stable(await k3Order(testRun, o.id)), 'Dữ liệu như sau lần 1').toEqual(after1);
    expect(items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length, 'Không ghi thêm lịch sử').toBe(log1);

  });

  test("K3S-065 Thêm cùng phát sinh 2 lần", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const P = { id: o.id, type: refs.services.KHQ };
    const ot = await costItem(testRun, o.svc.KHQ, A, o.base.items.overtime.id);
    const sur = { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, priceConfigurationItemId: o.base.items.overtime.id, unitCode: refs.units.overtime, quantity: 1, amount: 300_000, currency: 'VND' };
    const vari = { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 200_000, currency: 'VND' };

    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: vari }), '200/201', 'lần 1');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: vari }), '200/201', 'lần 2');
    expectMoney((await costs(testRun, o.svc.KHQ)).totalConverted, 1_000_000 + 400_000, 'Tổng chi cộng cả 2 phát sinh');

  });

  test("K3S-132 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await saveActuals(testRun, o.svc.KHQ, actualsBody(refs, 'KHQ'));
    await uploadActualDoc(testRun, o.svc.KHQ);

    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } }), '200/204', 'lần 1');
    const after1 = stable(await k3Order(testRun, o.id));
    const log1 = items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length;
    const second = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(second, '400/409/422', 'lần 2');
    await expectApiError(second);
    expect(stable(await k3Order(testRun, o.id)), 'Dữ liệu như sau lần 1').toEqual(after1);
    expect(items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length, 'Không ghi thêm lịch sử').toBe(log1);

  });

  test("K3S-148 Tải cùng file 2 lần", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const f = REAL.pdf10();
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: f } }), '200/201', 'lần 1');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: f } }), '200/201', 'lần 2');
    expect(((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' } }))).items ?? []).length, '2 chứng từ riêng').toBe(2);

  });

  test("K3S-171 Khóa sửa chi phí khi người khác đang sửa, hết hạn sau 5 phút", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    expect(roles.dp.userId).not.toBe(roles.dpKhq.userId);
    const readCosts = () => costLines(testRun, o.svc.KHQ);
    const previous = await readCosts();
    const own = previous.filter((l) => l.contractorId === A);
    const edit = own.find((l) => l.costLineId === o.shiftLineId);
    expect(edit, 'NT_A có dòng chi phí phát sinh được sửa').toBeTruthy();
    const changedPrice = Number(edit.unitPrice) + 1;
    const lines = own.map((l) => ({ costLineId: l.costLineId, unitCode: l.unitCode, quantity: Number(l.quantity), unitPrice: l.costLineId === edit.costLineId ? changedPrice : Number(l.unitPrice) }));
    const update = () => http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dpKhq'), params: { id: o.id, type: refs.services.KHQ, contractorId: A }, json: { currency: 'VND', lines } });
    const log = async () => items(await must(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { page: 1, perPage: 100 } }), 'đọc nhật ký Tháp của phiếu'));

    // DP giữ khóa qua trình chỉnh sửa. Các lần ghi và đối chiếu được kiểm bằng API.
    await withOps(browser, roles, 'dp', async (page) => {
      await openOrder(page, o.code, o.id, true);
      await servicePanel(page, 'KHQ', 'Chi phí');
      await action(page, 'Chỉnh sửa chi phí').click();
      await expect(action(page, 'Lưu'), 'DP đã mở chỉnh sửa và giữ khóa').toBeVisible();
      const before = await log();
      const denied = await update();
      expectStatusIn(denied, '409/423', 'DP_KHQ bị chặn khi DP giữ khóa');
      expect(stable(await readCosts())).toEqual(stable(previous));
      expect(stable(await log())).toEqual(stable(before));
      await action(page, 'Hủy').click();
      await expect(action(page, 'Lưu')).toHaveCount(0);
      expectStatusIn(await update(), '200/204', 'DP_KHQ lưu được sau khi DP hủy');
      expectMoney((await readCosts()).find((l) => l.costLineId === edit.costLineId)?.unitPrice, changedPrice);
      const after = await log();
      expect(after.filter((entry) => !before.some((prev) => prev.id === entry.id)), 'Chỉ ghi một thao tác sửa chi phí thành công').toHaveLength(1);
    });

  });
});
