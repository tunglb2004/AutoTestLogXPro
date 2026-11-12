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
  test("K3X-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/k3/service-orders/{id}/scope-requests", "POST /api/k3/service-orders/{id}/scope-requests", "POST /api/k3/service-orders/{id}/vehicle-changes"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "dp");
      const before = await testRun.snapshot(api, p.params ?? {}, "dp");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.dp)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "dp"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("K3X-038 DP_VT đề xuất cho phiếu không có VT", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const refs = await testRun.p0Refs();
    const base = await p0Base(testRun);
    const q = await createOrder(testRun, base, { submit: true, services: ['KHQ', 'HQGS', 'KB'] });
    await acceptOrder(testRun, q.id);
    await confirmLegs(testRun, q.id);
    const res = await http.call('POST /api/k3/service-orders/{id}/scope-requests', { token: tok('dpVt'), params: { id: q.id }, json: { kind: 'ADD', serviceTypeCode: refs.services.ST, reason: 'Cần sang tải tại cửa khẩu' } });
    expectStatusIn(res, '403/404');
    const list = items(await data(await http.call('GET /api/k3/service-orders/{id}/scope-requests', { token: tok('dp'), params: { id: q.id } })));
    expect(list, 'Không tạo').toHaveLength(0);

  });

  test("K3X-049 DP_VT đổi xe giao (thuộc KHQ)", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const CHANGE = { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: '15C-222.22', reason: 'Xe hỏng tại cửa khẩu' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok(role), params: { id: o.id }, json });
    const handover = async () => ((await getOrder(testRun, o.id)).vehicles ?? []).find((v: any) => v.role === 'HANDOVER' && Number(v.pairIndex) === 0);
    const towerLog = async () => items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect((await handover())?.plateNo, 'Tiền điều kiện: xe giao 15C-111.11').toBe('15C-111.11');

    const res = await SEND(CHANGE, 'dpVt');
    expectStatusIn(res, '200/403');
    const plate = (await handover())?.plateNo;
    test.info().annotations.push({ type: 'Ghi nhận', description: `DP_VT đổi xe giao (thuộc KHQ): HTTP ${res.status()}, biển số sau = ${plate}` });
    expect(plate, 'Dữ liệu khớp kết quả gọi').toBe(res.ok() ? '15C-222.22' : '15C-111.11');

  });
});
