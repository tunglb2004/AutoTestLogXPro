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
  test("ORD-060 Gửi phiếu nháp", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    const after = await getOrder(testRun, o.id);
    expect(after.status).toBe('SUBMITTED');
    expect(after.code, 'Giữ mã đã cấp').toBe(o.code);
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 50 } }))), 'CC nhận thông báo').toContain(o.code);

  });

  test("ORD-061 Thiếu trường bắt buộc", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const payload = await orderBody(testRun, base);
    payload.services = (payload.services as any[]).map((s) => (s.serviceTypeCode === refs.services.VT ? { ...s, routes: [{ pickup: { ...refs.origin } }] } : s));
    const o = await createOrder(testRun, base, { submit: false, body: payload });
    const res = await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expect((await getOrder(testRun, o.id)).status, 'Giữ DRAFT').toBe('DRAFT');

  });

  test("ORD-062 Nháp → Tạo mới giữ mã", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    const after = await getOrder(testRun, o.id);
    expect(after.status).toBe('SUBMITTED');
    expect(after.code, 'Mã vẫn M').toBe(o.code);

  });

  test("ORD-069 Hủy phiếu Tạo mới", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Khách hủy lô hàng' } });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, o.id)).status).toBe('CANCELLED');
    const h = JSON.stringify(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } })));
    expect(h, 'Lý do lưu lịch sử').toContain('Khách hủy lô hàng');

  });

  test("ORD-070 Hủy khi đã có dịch vụ Đang thực hiện", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Khách đổi kế hoạch' } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    const d = await getOrder(testRun, o.id);
    expect(d.status, 'Phiếu tổng vẫn Đang thực hiện').toBe('IN_PROGRESS');
    expect(d.services.some((s: any) => s.status === 'IN_PROGRESS'), 'Có dịch vụ Đang thực hiện').toBe(true);
    expect(JSON.stringify(d.availableActions ?? []), 'Nút Hủy vô hiệu').not.toMatch(/CANCEL/i);

  });

  test("ORD-071 Hủy ở Đã tiếp nhận báo K3", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Khách hủy trước khi điều phối' } });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, o.id)).status).toBe('CANCELLED');
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 50 } }))), 'CC nhận cảnh báo thu hồi điều phối').toContain(o.code);

  });

  test("ORD-072 Bỏ trống lý do", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: '' } });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'reason');
    expect((await getOrder(testRun, o.id)).status).toBe('SUBMITTED');

  });

  test("ORD-073 Hủy phiếu Từ chối", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await rejectOrder(testRun, o.id);
    const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Không tiếp tục' } });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, o.id)).status).toBe('CANCELLED');

  });

  test("ORD-081 Khôi phục phiếu bị từ chối", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await rejectOrder(testRun, o.id);
    const res = await http.call('POST /api/service-orders/{id}/restore', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, o.id)).status, 'Gửi lại cho điều phối').toBe('SUBMITTED');
    expect(JSON.stringify(await data(await http.call('GET /api/k3/service-orders', { token: tok('cc'), query: { search: o.code } }))), 'Có lại ở Tháp').toContain(o.code);

  });

  test("ORD-082 Khôi phục phiếu không ở Từ chối", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await must(await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Khách hủy' } }), 'hủy phiếu');
    const res = await http.call('POST /api/service-orders/{id}/restore', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '400/409/422');
    expect((await getOrder(testRun, o.id)).status, 'Không đổi').toBe('CANCELLED');

  });

  test("ORD-083 Sửa rồi gửi lại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await rejectOrder(testRun, o.id);
    const note = `Đã bổ sung số tờ khai ${TEST_RUN_ID}`;
    await must(await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: await orderBody(testRun, base, { generalNote: note }) }), 'sửa phiếu bị từ chối');
    const res = await http.call('POST /api/service-orders/{id}/restore', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    const d = await getOrder(testRun, o.id);
    expect(d.status).toBe('SUBMITTED');
    expect(d.generalNote, 'Giữ dữ liệu đã sửa').toBe(note);

  });

  test("ORD-064 Thông báo K3", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    expectStatusIn(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), '200/204');
    const res = await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 50 } });
    expectStatusIn(res, '200/204');
    expect(JSON.stringify(await data(res)), 'CC có thông báo phiếu mới').toContain(o.code);

  });

  test("ORD-075 Chi phí bị khóa vĩnh viễn", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const r1 = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Khách hủy lô hàng' } });
    expectStatusIn(r1, '200/201/204');
    const r2 = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { contractorId: env.ref('CONTRACTOR_A_ID'), kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 100_000, currency: 'VND' } });
    expectStatusIn(r2, '400/409/422');
    expect((await costLines(testRun, o.svc.KHQ)).length, 'Không thêm chi phí được').toBe(1);

  });

  test("ORD-085 CC nhận thông báo", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await rejectOrder(testRun, o.id);
    const before = JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 100 } }))).split(o.code).length;
    expectStatusIn(await http.call('POST /api/service-orders/{id}/restore', { token: tok('k1'), params: { id: o.id } }), '200/204');
    const res = await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 100 } });
    expectStatusIn(res, '200/204');
    expect(JSON.stringify(await data(res)).split(o.code).length, 'Có thông báo mới cho CC').toBeGreaterThan(before);

  });
});
