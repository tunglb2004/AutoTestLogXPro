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
  test("K3X-045 Gửi trùng đề xuất", { tag: ["@api", "@thap-dieu-phoi", "@p2", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    const refs = await testRun.p0Refs();
    const base = await p0Base(testRun);
    const q = await createOrder(testRun, base, { submit: true, services: ['KHQ', 'HQGS', 'VT', 'ST'] });
    await acceptOrder(testRun, q.id);
    await confirmLegs(testRun, q.id);
    const ADD = { kind: 'ADD', serviceTypeCode: refs.services.KB, reason: 'Hàng cần lưu kho thêm 2 ngày' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id }, json });
    const LIST = async (role: 'dp' | 'k1' = 'dp') => items(await data(await http.call(role === 'dp' ? 'GET /api/k3/service-orders/{id}/scope-requests' : 'GET /api/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id } })));

    expectStatusIn(await SEND(ADD), '200/201', 'lần 1');
    const second = await SEND(ADD);
    expectStatusIn(second, '200/201/409', 'lần 2');
    const n = (await LIST()).filter((r: any) => r.serviceTypeCode === refs.services.KB && r.status === 'PENDING').length;
    test.info().annotations.push({ type: 'Chờ xác nhận', description: `Gửi trùng đề xuất thêm KB: lần 2 HTTP ${second.status()}, số đề xuất PENDING cùng dịch vụ = ${n}` });
    expect(n, 'Có ít nhất 1 đề xuất').toBeGreaterThanOrEqual(1);

  });

  test("K3X-056 Gửi lại cùng biển số", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const CHANGE = { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: '15C-222.22', reason: 'Xe hỏng tại cửa khẩu' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok(role), params: { id: o.id }, json });
    const handover = async () => ((await getOrder(testRun, o.id)).vehicles ?? []).find((v: any) => v.role === 'HANDOVER' && Number(v.pairIndex) === 0);
    const towerLog = async () => items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect((await handover())?.plateNo, 'Tiền điều kiện: xe giao 15C-111.11').toBe('15C-111.11');

    expectStatusIn(await SEND(CHANGE), '200/201', 'lần 1');
    expectStatusIn(await SEND(CHANGE), '200/409', 'lần 2');
    expect((await handover())?.plateNo).toBe('15C-222.22');
    const logs = (await towerLog()).filter((e: any) => String(e.description ?? '').includes('15C-222.22'));
    expect(logs.length, 'Không tạo bản ghi đổi xe trùng').toBe(1);

  });
});
