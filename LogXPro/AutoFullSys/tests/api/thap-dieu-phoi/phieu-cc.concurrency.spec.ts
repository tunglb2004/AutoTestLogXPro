/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, orderBody, getOrder, revenueOf, revenueTable, rejectOrder, runService, uploadOrderDoc, uploadVehicleDoc, buildP0, addSealCost, scopeRequestOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, confirmLegsBody, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costs, costLines, costItem, addCost, saveActuals, startService, completeService, uploadActualDoc, coordinate } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { changeLinePrice } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { setItemStatus } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { pnl } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — phiếu dịch vụ (CC)", () => {
  test("K3O-030 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const API = 'POST /api/k3/service-orders/{id}/accept';
    const opts = { token: tok('cc'), params: { id: o.id } };
    expectStatusIn(await http.call(API, opts), '200/204', 'lần 1');
    const after1 = stable(await k3Order(testRun, o.id));
    const log1 = items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length;
    const notes1 = JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('k1'), query: { limit: 100 } }))).split(o.code).length;
    const second = await http.call(API, opts);
    expectStatusIn(second, '400/409/422', 'lần 2');
    await expectApiError(second);
    expect(stable(await k3Order(testRun, o.id)), 'Dữ liệu như sau lần 1').toEqual(after1);
    expect(items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length, 'Không ghi thêm lịch sử').toBe(log1);
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('k1'), query: { limit: 100 } }))).split(o.code).length, 'Không gửi thêm thông báo').toBe(notes1);

  });

  test("K3O-039 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const API = 'POST /api/k3/service-orders/{id}/reject';
    const opts = { token: tok('cc'), params: { id: o.id }, json: { reason: 'Thiếu chứng từ khai báo' } };
    expectStatusIn(await http.call(API, opts), '200/204', 'lần 1');
    const after1 = stable(await k3Order(testRun, o.id));
    const log1 = items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length;
    const notes1 = JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('k1'), query: { limit: 100 } }))).split(o.code).length;
    const second = await http.call(API, opts);
    expectStatusIn(second, '400/409/422', 'lần 2');
    await expectApiError(second);
    expect(stable(await k3Order(testRun, o.id)), 'Dữ liệu như sau lần 1').toEqual(after1);
    expect(items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length, 'Không ghi thêm lịch sử').toBe(log1);
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('k1'), query: { limit: 100 } }))).split(o.code).length, 'Không gửi thêm thông báo').toBe(notes1);

  });

  test("K3O-054 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const pv = await data(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } }));
    const API = 'POST /api/k3/service-orders/{id}/legs/confirm';
    const opts = { token: tok('cc'), params: { id: o.id }, json: confirmLegsBody(pv, 1) };
    expectStatusIn(await http.call(API, opts), '200/204', 'lần 1');
    const after1 = stable(await k3Order(testRun, o.id));
    const log1 = items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length;
    const notes1 = JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('k1'), query: { limit: 100 } }))).split(o.code).length;
    const second = await http.call(API, opts);
    expectStatusIn(second, '400/409/422', 'lần 2');
    await expectApiError(second);
    expect(stable(await k3Order(testRun, o.id)), 'Dữ liệu như sau lần 1').toEqual(after1);
    expect(items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } }))).length, 'Không ghi thêm lịch sử').toBe(log1);
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('k1'), query: { limit: 100 } }))).split(o.code).length, 'Không gửi thêm thông báo').toBe(notes1);

  });
});
