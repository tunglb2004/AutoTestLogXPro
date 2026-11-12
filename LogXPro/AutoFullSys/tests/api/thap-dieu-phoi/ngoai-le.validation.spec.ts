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
import * as F_thap_dieu_phoi_ngoai_le from '../../../src/thap-dieu-phoi/data/ngoai-le.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — thao tác ngoại lệ", () => {
  test("K3X-040 Thiếu trường bắt buộc `kind`", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/scope-requests";
    const p = await testRun.prepare(API, "dp");
    const payload: Record<string, unknown> = F_thap_dieu_phoi_ngoai_le.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["reason"] = marker;
    delete payload["kind"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "kind");
    expect(await testRun.listContains("GET /api/k3/service-orders/{id}/scope-requests", marker, "dp", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("K3X-041 `kind` ngoài danh sách cho phép", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/scope-requests";
    const p = await testRun.prepare(API, "dp");
    const payload: Record<string, unknown> = F_thap_dieu_phoi_ngoai_le.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["reason"] = marker;
    payload["kind"] = "XYZ";
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "kind");
    expect(await testRun.listContains("GET /api/k3/service-orders/{id}/scope-requests", marker, "dp", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("K3X-042 `serviceTypeCode` 32 và 33 ký tự", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const refs = await testRun.p0Refs();
    const base = await p0Base(testRun);
    const q = await createOrder(testRun, base, { submit: true, services: ['KHQ', 'HQGS', 'VT', 'ST'] });
    await acceptOrder(testRun, q.id);
    await confirmLegs(testRun, q.id);
    const ADD = { kind: 'ADD', serviceTypeCode: refs.services.KB, reason: 'Hàng cần lưu kho thêm 2 ngày' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id }, json });
    const LIST = async (role: 'dp' | 'k1' = 'dp') => items(await data(await http.call(role === 'dp' ? 'GET /api/k3/service-orders/{id}/scope-requests' : 'GET /api/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id } })));

    const r32 = await SEND({ ...ADD, serviceTypeCode: 'X'.repeat(32) });
    expectStatusIn(r32, '400/404', '32 ký tự');
    const r33 = await SEND({ ...ADD, serviceTypeCode: 'X'.repeat(33) });
    expectStatusIn(r33, '400/422', '33 ký tự');
    expect(await LIST(), 'Không tạo đề xuất ở cả 2 lần').toHaveLength(0);

  });

  test("K3X-051 Thiếu trường bắt buộc `role`", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/vehicle-changes";
    const p = await testRun.prepare(API, "dp");
    const payload: Record<string, unknown> = F_thap_dieu_phoi_ngoai_le.bodies[API]();
    delete payload["role"];
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "role");
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3X-052 `plateNo` 20 và 21 ký tự", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const CHANGE = { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: '15C-222.22', reason: 'Xe hỏng tại cửa khẩu' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok(role), params: { id: o.id }, json });
    const handover = async () => ((await getOrder(testRun, o.id)).vehicles ?? []).find((v: any) => v.role === 'HANDOVER' && Number(v.pairIndex) === 0);
    const towerLog = async () => items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect((await handover())?.plateNo, 'Tiền điều kiện: xe giao 15C-111.11').toBe('15C-111.11');

    const p20 = '29C-12345'.padEnd(20, '6');
    expectStatusIn(await SEND({ ...CHANGE, plateNo: p20 }), '200/201', '20 ký tự');
    expect((await handover())?.plateNo, '20 ký tự lưu đúng').toBe(p20);
    const r21 = await SEND({ ...CHANGE, plateNo: '29C-12345'.padEnd(21, '6') });
    expectStatusIn(r21, '400/422', '21 ký tự');
    expect((await handover())?.plateNo, 'Giữ biển số trước').toBe(p20);

  });

  test("K3X-053 `legPosition` tại cận dưới 1 và dưới cận", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const CHANGE = { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: '15C-222.22', reason: 'Xe hỏng tại cửa khẩu' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok(role), params: { id: o.id }, json });
    const handover = async () => ((await getOrder(testRun, o.id)).vehicles ?? []).find((v: any) => v.role === 'HANDOVER' && Number(v.pairIndex) === 0);
    const towerLog = async () => items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect((await handover())?.plateNo, 'Tiền điều kiện: xe giao 15C-111.11').toBe('15C-111.11');

    expectStatusIn(await SEND({ ...CHANGE, legPosition: 1 }), '200/201', 'legPosition = 1');
    const after1 = stable(await handover());
    const r0 = await SEND({ ...CHANGE, legPosition: 0, plateNo: '15C-333.33' });
    expectStatusIn(r0, '400/422', 'legPosition = 0');
    expect(stable(await handover()), 'Dữ liệu không đổi').toEqual(after1);

  });

  test("K3X-033 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/scope-requests";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3X-035 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/scope-requests";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3X-044 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/scope-requests";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_ngoai_le.bodies["POST /api/k3/service-orders/{id}/scope-requests"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3X-055 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/vehicle-changes";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_ngoai_le.bodies["POST /api/k3/service-orders/{id}/vehicle-changes"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
