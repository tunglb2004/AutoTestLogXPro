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

test.describe("Ngoại lệ phiếu dịch vụ: từ chối, khôi phục, hủy, chi phí phát sinh do K3 tạo, đề xuất phạm vi, đổi xe", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-EXC-001 CC từ chối → K1 sửa → khôi phục → CC tiếp nhận", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(600_000);
    const base = await ORD.p0Base(testRun);
    const o = await ORD.createOrder(testRun, base, { submit: true });
    const st = async () => (await ORD.getOrder(testRun, o.id)).status;
    await ORD.rejectOrder(testRun, o.id, 'Thiếu số tờ khai dự kiến');
    expect(await st()).toBe('REJECTED');
    const payload = await ORD.orderBody(testRun, base, { generalNote: 'Đã bổ sung số tờ khai dự kiến' });
    expectStatusIn(await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: payload }), '200/201/204', 'K1 sửa');
    expectStatusIn(await http.call('POST /api/service-orders/{id}/restore', { token: tok('k1'), params: { id: o.id } }), '200/201/204', 'khôi phục');
    expect(await st()).toBe('SUBMITTED');
    await CCF.acceptOrder(testRun, o.id);
    expect(await st()).toBe('ACCEPTED');

  });

  test("FLOW-EXC-002 Hủy phiếu Đã tiếp nhận chưa bắt đầu", { tag: ["@flow", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(600_000);
    const refs = await testRun.p0Refs();
    const o = await ORD.p0Order(testRun, 'KHQ_COORDINATED');
    const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Khách hủy lô hàng' } });
    expectStatusIn(res, '200/201/204');
    expect((await ORD.getOrder(testRun, o.id)).status).toBe('CANCELLED');
    const n = await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 100 } }));
    expect((Array.isArray(n) ? n : items(n)).some((x: any) => x.subjectId === o.id), 'CC có cảnh báo').toBe(true);
    const add = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { contractorId: env.ref('CONTRACTOR_A_ID'), kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 100_000, currency: 'VND' } });
    expectStatusIn(add, '400/403/409/422', 'Chi phí khóa');

  });

  test("FLOW-EXC-003 K3 tạo chi phí phát sinh: mặc định được duyệt, K1 thấy ngay ở tab Doanh thu và sửa được", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const o2 = await ORD.p0Order(testRun, 'CHANG1_DONE');
    const variance = items(await must(await http.call('GET /api/k3/service-orders/{id}/services/{type}/variance-items', {
      token: tok('dp'), params: { id: o2.id, type: refs.services.VT },
    }), 'đọc đầu mục phát sinh Vận tải đang hoạt động'))[0];
    expect(variance?.id, 'Vận tải có đầu mục Phát sinh đang hoạt động').toBeTruthy();
    expectMoney((await K3.costs(testRun, o2.svc.VT)).totalConverted, P0.serviceCost.VT, 'Tiền điều kiện: tổng chi VT 10.000.000');
    const id = await K3.addCost(testRun, o2.svc.VT, { contractorId: env.ref('CONTRACTOR_B_ID'), kind: 'VARIANCE', priceConfigurationItemId: variance.id, unitCode: refs.units.freight, quantity: 1, amount: 2_000_000, currency: 'VND' });
    const c = await K3.costs(testRun, o2.svc.VT);
    expect(String(c.costBadge ?? 'NORMAL'), 'Không có trạng thái chờ duyệt').not.toMatch(/PENDING/);
    expectMoney(c.totalConverted, 12_000_000, 'Tổng chi VT quy đổi 12.000.000');
    const lineId = id ?? (await K3.costLines(testRun, o2.svc.VT)).find((l: any) => Number(l.unitPrice) === 2_000_000)?.costLineId;
    const revLine = async () => (ORD.revenueTable(await ORD.revenueOf(testRun, o2.id), refs.services.VT).lines ?? []).find((l: any) => l.costLineId === lineId);
    expectMoney((await revLine()).amount, 2_000_000, 'K1 thấy ngay doanh thu Phát sinh 2.000.000');
    expectStatusIn(await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o2.id, serviceTypeCode: refs.services.VT }, json: { lines: [{ costLineId: lineId, unitCode: refs.units.freight, quantity: 1, unitPrice: 2_200_000 }] } }), '200/201/204', 'K1 sửa 2.200.000');
    expectMoney((await revLine()).amount, 2_200_000, 'Doanh thu sau sửa');

  });

  test("FLOW-EXC-005 Đề xuất thêm dịch vụ: K1 đồng ý nhưng phiếu không tự đổi", { tag: ["@flow", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(600_000);
    const { order, requestId } = await ORD.scopeRequestOrder(testRun);
    const before = stable((await ORD.getOrder(testRun, order.id)).services.map((s: any) => s.serviceTypeCode).sort());
    expectStatusIn(await http.call('POST /api/service-orders/{id}/scope-requests/{requestId}/respond', { token: tok('k1'), params: { id: order.id, requestId }, json: { accept: true, note: 'Đồng ý thêm Kho bãi' } }), '200/201/204', 'K1 đồng ý');
    const req = items(await data(await http.call('GET /api/service-orders/{id}/scope-requests', { token: tok('k1'), params: { id: order.id } }))).find((r: any) => r.id === requestId);
    expect(req.status, 'Đề xuất đã đồng ý').toBe('ACCEPTED');
    expect(stable((await ORD.getOrder(testRun, order.id)).services.map((s: any) => s.serviceTypeCode).sort()), 'Dịch vụ phiếu không đổi').toEqual(before);

  });

  test("FLOW-EXC-006 Đổi xe giao cập nhật danh sách và ĐVT xe", { tag: ["@flow", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(600_000);
    const o = await ORD.p0Order(testRun, 'ACCEPTED');
    const plate = '15C-222.22';
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok('dp'), params: { id: o.id }, json: { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: plate, reason: 'Xe hỏng tại cửa khẩu' } }), '200/201/204', 'đổi xe giao');
    const found = items(await data(await http.call('GET /api/service-orders', { token: tok('k1'), query: { pickupPlateNo: plate, perPage: 100 } }))).concat(items(await data(await http.call('GET /api/service-orders', { token: tok('k1'), query: { deliveryPlateNo: plate, perPage: 100 } }))));
    expect(found.some((r: any) => r.id === o.id), 'Danh sách K1 tìm được theo biển mới').toBe(true);
    const log = items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect(log.some((e: any) => String(e.description ?? '').includes('Xe hỏng tại cửa khẩu')), 'Nhật ký có lý do').toBe(true);

  });

  test("FLOW-EXC-007 RC bị ngưng khi phiếu đang chạy", { tag: ["@flow", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const base = await PF.flowBase(testRun, 'FLOW-EXC-007');
    const o = await ORD.p0Order(testRun, 'IN_PROGRESS', { base });
    const rev0 = stable(await ORD.revenueOf(testRun, o.id));
    expectStatusIn(await http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok('k1'), params: { id: base.rcId }, json: { reason: 'Khách ngừng hợp tác tuyến' } }), '200/201/204', 'ngưng RC_A');
    expect(stable(await ORD.revenueOf(testRun, o.id)), 'Doanh thu P0 giữ nguyên').toEqual(rev0);
    const sel = items(await data(await http.call('GET /api/service-orders/selectable-customers', { token: tok('k1'), query: { perPage: 200 } }))).find((c: any) => c.id === base.customerId);
    expect((sel?.quotations ?? []).some((q: any) => q.id === base.rcId), 'RC đã ngưng không còn để lập phiếu mới').toBe(false);

  });
});
