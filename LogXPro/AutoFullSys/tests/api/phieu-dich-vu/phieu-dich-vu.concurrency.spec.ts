/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { buildP0, p0Base, p0Order, createOrder, orderBody, getOrder, revenueOf, revenueTable, extraQuote, rejectOrder, runService, addSealCost, orderDocs, uploadOrderDoc, vehicleDocs, uploadVehicleDoc, scopeRequestOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { costs, costLines, uploadActualDoc } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { pnl, setOrderFx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as R_phieu_dich_vu_phieu_dich_vu from '../../../src/phieu-dich-vu/api/schemas/phieu-dich-vu.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Phiếu dịch vụ (Khối 1)", () => {
  test("ORD-034 Gửi trùng body", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const payload = await orderBody(testRun, base);
    const r1 = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: payload });
    const r2 = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: payload });
    expectStatusIn(r1, '200/201', 'lần 1');
    expectStatusIn(r2, '200/201', 'lần 2');
    const a = await data(r1);
    const b = await data(r2);
    expect(a.code, 'Tạo 2 phiếu khác mã').not.toBe(b.code);
    test.info().annotations.push({ type: 'Rủi ro', description: 'Gửi trùng tạo 2 phiếu (bấm đúp) — ghi nhận theo Điểm cần xác nhận' });

  });

  test("ORD-068 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const API = 'POST /api/service-orders/{id}/submit';
    const opts = { token: tok('k1'), params: { id: o.id } };
    const first = await http.call(API, opts);
    expectStatusIn(first, '200/204', 'lần 1');
    const after1 = stable(await getOrder(testRun, o.id));
    const hist1 = items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } }))).length;
    const notes1 = JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 100 } }))).split(o.code).length;
    const second = await http.call(API, opts);
    expectStatusIn(second, '400/409/422', 'lần 2');
    await expectApiError(second);
    expect(stable(await getOrder(testRun, o.id)), 'Dữ liệu như sau lần 1').toEqual(after1);
    expect(items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } }))).length, 'Không ghi thêm lịch sử').toBe(hist1);
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 100 } }))).split(o.code).length, 'Không gửi thêm thông báo').toBe(notes1);

  });

  test("ORD-080 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const API = 'POST /api/service-orders/{id}/cancel';
    const opts = { token: tok('k1'), params: { id: o.id }, json: { reason: 'Khách hủy lô hàng' } };
    const first = await http.call(API, opts);
    expectStatusIn(first, '200/204', 'lần 1');
    const after1 = stable(await getOrder(testRun, o.id));
    const hist1 = items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } }))).length;
    const notes1 = JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 100 } }))).split(o.code).length;
    const second = await http.call(API, opts);
    expectStatusIn(second, '400/409/422', 'lần 2');
    await expectApiError(second);
    expect(stable(await getOrder(testRun, o.id)), 'Dữ liệu như sau lần 1').toEqual(after1);
    expect(items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } }))).length, 'Không ghi thêm lịch sử').toBe(hist1);
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 100 } }))).split(o.code).length, 'Không gửi thêm thông báo').toBe(notes1);

  });

  test("ORD-089 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await rejectOrder(testRun, o.id);
    const API = 'POST /api/service-orders/{id}/restore';
    const opts = { token: tok('k1'), params: { id: o.id } };
    const first = await http.call(API, opts);
    expectStatusIn(first, '200/204', 'lần 1');
    const after1 = stable(await getOrder(testRun, o.id));
    const hist1 = items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } }))).length;
    const notes1 = JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 100 } }))).split(o.code).length;
    const second = await http.call(API, opts);
    expectStatusIn(second, '400/409/422', 'lần 2');
    await expectApiError(second);
    expect(stable(await getOrder(testRun, o.id)), 'Dữ liệu như sau lần 1').toEqual(after1);
    expect(items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } }))).length, 'Không ghi thêm lịch sử').toBe(hist1);
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 100 } }))).split(o.code).length, 'Không gửi thêm thông báo').toBe(notes1);

  });

  test("ORD-139 Đổi tỷ giá đúng lúc người khác xác nhận", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED');
    const [conf, fx] = await Promise.all([
      http.call('POST /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } }),
      http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('dp'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 26_000, cnyRate: 3_600 } }),
    ]);
    const ok = [conf, fx].filter((r) => r.ok());
    expect(ok.length, 'Một thao tác thắng, thao tác còn lại bị chặn').toBe(1);
    expectStatusIn(conf.ok() ? conf : fx, '200/204', 'thao tác thắng');
    expectStatusIn(conf.ok() ? fx : conf, '409/423', 'thao tác thua');
    const p = await pnl(testRun, o.id);
    if (conf.ok()) {
      expect(p.revenueConfirmed).toBe(true);
      expect(Number(p.fxRate.usdRate), 'Xác nhận thắng thì tỷ giá không đổi').toBe(P0.fxUsd);
    } else {
      expect((await getOrder(testRun, o.id)).status, 'Áp tỷ giá thắng thì phiếu chưa xác nhận').toBe('PERFORMED');
      expect(Number(p.fxRate.usdRate)).toBe(26_000);
    }

  });

  test("ORD-144 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED');
    const API = 'POST /api/service-orders/{id}/revenue-confirmation';
    const first = await http.call(API, { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(first, '200/204', 'lần 1');
    const after1 = stable(await getOrder(testRun, o.id));
    const hist1 = items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } }))).length;
    const second = await http.call(API, { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(second, '400/409/422', 'lần 2');
    await expectApiError(second);
    expect(stable(await getOrder(testRun, o.id)), 'Dữ liệu như sau lần 1').toEqual(after1);
    expect(items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } }))).length, 'Không ghi thêm lịch sử').toBe(hist1);

  });

  test("ORD-179 Tải cùng file 2 lần", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const f = REAL.docx10();
    expectStatusIn(await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: f } }), '200/201', 'lần 1');
    expectStatusIn(await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: f } }), '200/201', 'lần 2');
    const list = await orderDocs(testRun, o.id, KHQ);
    expect(list, '2 chứng từ riêng').toHaveLength(2);
    expect(list[0].id).not.toBe(list[1].id);

  });

  test("ORD-212 Tải cùng file 2 lần", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const f = REAL.pdf20();
    expectStatusIn(await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: { file: f } }), '200/201', 'lần 1');
    expectStatusIn(await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: { file: f } }), '200/201', 'lần 2');
    const list = await vehicleDocs(testRun, o.id);
    expect(list, '2 file riêng').toHaveLength(2);

  });

  test("ORD-226 Trả lời lại đề xuất đã trả lời", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const { order, requestId } = await scopeRequestOrder(testRun);
    expectStatusIn(await http.call('POST /api/service-orders/{id}/scope-requests/{requestId}/respond', { token: tok('k1'), params: { id: order.id, requestId }, json: { accept: true, note: 'Đồng ý thêm kho' } }), '200/204', 'lần 1');
    const second = await http.call('POST /api/service-orders/{id}/scope-requests/{requestId}/respond', { token: tok('k1'), params: { id: order.id, requestId }, json: { accept: false, note: 'Đổi ý' } });
    expectStatusIn(second, '400/409/422', 'lần 2');
    const r = ((await data(await http.call('GET /api/service-orders/{id}/scope-requests', { token: tok('k1'), params: { id: order.id } }))).items ?? []).find((x: any) => x.id === requestId);
    expect([r.status, r.responseNote], 'Không đổi kết quả lần 1').toEqual(['ACCEPTED', 'Đồng ý thêm kho']);

  });
});
