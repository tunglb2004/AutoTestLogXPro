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

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — thao tác ngoại lệ", () => {
  test("K3X-036 Đề xuất thêm dịch vụ cho phiếu", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const refs = await testRun.p0Refs();
    const base = await p0Base(testRun);
    const q = await createOrder(testRun, base, { submit: true, services: ['KHQ', 'HQGS', 'VT', 'ST'] });
    await acceptOrder(testRun, q.id);
    await confirmLegs(testRun, q.id);
    const ADD = { kind: 'ADD', serviceTypeCode: refs.services.KB, reason: 'Hàng cần lưu kho thêm 2 ngày' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id }, json });
    const LIST = async (role: 'dp' | 'k1' = 'dp') => items(await data(await http.call(role === 'dp' ? 'GET /api/k3/service-orders/{id}/scope-requests' : 'GET /api/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id } })));

    const before = stable((await getOrder(testRun, q.id)).services.map((s: any) => s.serviceTypeCode).sort());
    const res = await SEND(ADD);
    expectStatusIn(res, '200/201');
    const id = (await data(res))?.id;
    const hit = (await LIST()).find((r: any) => r.id === id);
    expect(hit?.status, 'Đề xuất chờ K1 trả lời').toBe('PENDING');
    expect(stable((await getOrder(testRun, q.id)).services.map((s: any) => s.serviceTypeCode).sort()), 'Dịch vụ của phiếu chưa đổi').toEqual(before);

  });

  test("K3X-037 Đề xuất bớt dịch vụ đã bắt đầu", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const res = await http.call('POST /api/k3/service-orders/{id}/scope-requests', { token: tok('dp'), params: { id: o.id }, json: { kind: 'REMOVE', serviceTypeCode: refs.services.KHQ, reason: 'Khách hàng tự khai báo hải quan' } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    const list = items(await data(await http.call('GET /api/k3/service-orders/{id}/scope-requests', { token: tok('dp'), params: { id: o.id } })));
    expect(list.some((r: any) => r.kind === 'REMOVE' && r.serviceTypeCode === refs.services.KHQ), 'Không tạo đề xuất bớt KHQ').toBe(false);

  });

  test("K3X-046 Ghi nhận đổi xe giao", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const CHANGE = { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: '15C-222.22', reason: 'Xe hỏng tại cửa khẩu' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok(role), params: { id: o.id }, json });
    const handover = async () => ((await getOrder(testRun, o.id)).vehicles ?? []).find((v: any) => v.role === 'HANDOVER' && Number(v.pairIndex) === 0);
    const towerLog = async () => items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect((await handover())?.plateNo, 'Tiền điều kiện: xe giao 15C-111.11').toBe('15C-111.11');

    const res = await SEND(CHANGE);
    expectStatusIn(res, '200/201');
    expect((await handover())?.plateNo, 'Xe giao cặp 0 đổi biển số').toBe('15C-222.22');
    const list = items(await data(await http.call('GET /api/service-orders', { token: tok('k1'), query: { search: o.code, page: 1, perPage: 20 } })));
    const row = list.find((r: any) => r.id === o.id);
    expect([row?.pickupPlateNo, row?.deliveryPlateNo].join(' '), 'Danh sách K1 cập nhật BSX').toContain('15C-222.22');
    expect((await towerLog()).some((e: any) => String(e.description ?? '').includes('Xe hỏng tại cửa khẩu')), 'Nhật ký Tháp có lý do').toBe(true);

  });

  test("K3X-047 Bỏ trống lý do", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const CHANGE = { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: '15C-222.22', reason: 'Xe hỏng tại cửa khẩu' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok(role), params: { id: o.id }, json });
    const handover = async () => ((await getOrder(testRun, o.id)).vehicles ?? []).find((v: any) => v.role === 'HANDOVER' && Number(v.pairIndex) === 0);
    const towerLog = async () => items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect((await handover())?.plateNo, 'Tiền điều kiện: xe giao 15C-111.11').toBe('15C-111.11');

    const res = await SEND({ ...CHANGE, reason: '' });
    expectStatusIn(res, '400/422');
    expect((await handover())?.plateNo, 'Không đổi').toBe('15C-111.11');

  });

  test("K3X-048 `pairIndex` ngoài phạm vi", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const CHANGE = { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: '15C-222.22', reason: 'Xe hỏng tại cửa khẩu' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok(role), params: { id: o.id }, json });
    const handover = async () => ((await getOrder(testRun, o.id)).vehicles ?? []).find((v: any) => v.role === 'HANDOVER' && Number(v.pairIndex) === 0);
    const towerLog = async () => items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect((await handover())?.plateNo, 'Tiền điều kiện: xe giao 15C-111.11').toBe('15C-111.11');

    const res = await SEND({ ...CHANGE, pairIndex: 1 });
    expectStatusIn(res, '400/422');
    expect((await handover())?.plateNo, 'Không đổi').toBe('15C-111.11');

  });

  test("K3X-032 Đề xuất phạm vi của phiếu (K3)", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const { order, requestId } = await scopeRequestOrder(testRun);
    const res = await http.call('GET /api/k3/service-orders/{id}/scope-requests', { token: tok('dp'), params: { id: order.id } });
    expectStatusIn(res, '200');
    const hit = items(await data(res)).find((r: any) => r.id === requestId);
    expect(hit, 'Trả đề xuất vừa gửi').toBeTruthy();
    expect(hit.kind).toBe('ADD');
    expect(hit.status).toBe('PENDING');
    for (const k of ['responseNote', 'respondedByName', 'respondedAt']) expect(hit, `có trường phản hồi K1 ${k}`).toHaveProperty(k);

  });

  test("K3X-039 K1 thấy đề xuất", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const refs = await testRun.p0Refs();
    const base = await p0Base(testRun);
    const q = await createOrder(testRun, base, { submit: true, services: ['KHQ', 'HQGS', 'VT', 'ST'] });
    await acceptOrder(testRun, q.id);
    await confirmLegs(testRun, q.id);
    const ADD = { kind: 'ADD', serviceTypeCode: refs.services.KB, reason: 'Hàng cần lưu kho thêm 2 ngày' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id }, json });
    const LIST = async (role: 'dp' | 'k1' = 'dp') => items(await data(await http.call(role === 'dp' ? 'GET /api/k3/service-orders/{id}/scope-requests' : 'GET /api/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id } })));

    const res = await SEND(ADD);
    expectStatusIn(res, '200/201');
    const id = (await data(res))?.id;
    const k1 = await LIST('k1');
    expect(k1.some((r: any) => r.id === id), 'K1 thấy đề xuất').toBe(true);
    const notes = (await data(await http.call('GET /api/notifications', { token: tok('k1'), query: { limit: 50 } }))) ?? [];
    const arr = Array.isArray(notes) ? notes : items(notes);
    expect(arr.some((n: any) => n.subjectId === q.id || n.subjectId === id || String(n.body ?? n.title ?? '').includes(q.code)), 'K1 có thông báo đề xuất').toBe(true);

  });

  test("K3X-050 Biển số mới quyết định ĐVT Xe VN/Xe TQ", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const CHANGE = { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: '15C-222.22', reason: 'Xe hỏng tại cửa khẩu' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok(role), params: { id: o.id }, json });
    const handover = async () => ((await getOrder(testRun, o.id)).vehicles ?? []).find((v: any) => v.role === 'HANDOVER' && Number(v.pairIndex) === 0);
    const towerLog = async () => items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect((await handover())?.plateNo, 'Tiền điều kiện: xe giao 15C-111.11').toBe('15C-111.11');

    const before = await handover();
    const res = await SEND({ ...CHANGE, plateNo: '桂A-88888' });
    expectStatusIn(res, '200/201');
    const v = await handover();
    expect(v.plateNo).toBe('桂A-88888');
    expect(String(v.plateOrigin ?? ''), 'ĐVT xe giao chuyển Xe TQ (BR-K3-VEHICLE-FORMAT)').toMatch(/TQ|CN|CHINA|Trung/i);
    expect(v.plateOrigin, 'Khác loại xe biển VN trước đó').not.toBe(before.plateOrigin);

  });
});
