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

test.describe("Tháp điều phối — phiếu dịch vụ (CC)", () => {
  test("K3O-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/k3/service-orders", "GET /api/k3/service-orders/counts", "GET /api/k3/service-orders/statuses", "GET /api/k3/service-orders/{id}", "POST /api/k3/service-orders/{id}/accept", "POST /api/k3/service-orders/{id}/reject", "GET /api/k3/service-orders/{id}/legs/preview", "POST /api/k3/service-orders/{id}/legs/confirm", "GET /api/k3/service-orders/{id}/tower-log", "GET /api/k3/service-orders/{id}/documents/{documentId}", "GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "cc");
      const before = await testRun.snapshot(api, p.params ?? {}, "cc");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.cc)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "cc"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("K3O-003 Điều phối viên chỉ thấy phiếu có dịch vụ mình phụ trách", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const q = await createOrder(testRun, base, { submit: true, services: ['KHQ'] });
    const p = await createOrder(testRun, base, { submit: true });
    const res = await http.call('GET /api/k3/service-orders', { token: tok('dpVt'), query: { perPage: 100, search: TEST_RUN_ID } });
    expectStatusIn(res, '200');
    const ids = items(await data(res)).map((o: any) => o.id);
    expect(ids, 'Có P0 (có VT)').toContain(p.id);
    expect(ids, 'Không có Q (chỉ KHQ)').not.toContain(q.id);

  });

  test("K3O-018 Điều phối viên mở phiếu không có dịch vụ của mình", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const q = await createOrder(testRun, base, { submit: true, services: ['KHQ'] });
    const res = await http.call('GET /api/k3/service-orders/{id}', { token: tok('dpVt'), params: { id: q.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("K3O-063 Chứng từ phiếu khác", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const p0 = await createOrder(testRun, base, { submit: true });
    const q = await createOrder(testRun, base, { submit: false });
    const doc = await uploadOrderDoc(testRun, q.id, refs.services.KHQ, samplePdf('phieu-q.pdf'));
    const res = await http.call('GET /api/k3/service-orders/{id}/documents/{documentId}', { token: tok('dp'), params: { id: p0.id, documentId: doc.id } });
    expectStatusIn(res, '403/404');
    expect((res.headers()['content-type'] ?? '').includes('pdf'), 'Không trả').toBe(false);

  });

  test("K3O-069 Tài liệu phiếu khác", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const p0 = await createOrder(testRun, base, { submit: true });
    const q = await createOrder(testRun, base, { submit: false });
    const doc = await uploadVehicleDoc(testRun, q.id, samplePdf('so-thong-hanh-q.pdf'));
    const res = await http.call('GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('dp'), params: { id: p0.id, documentId: doc.id } });
    expectStatusIn(res, '403/404');
    expect((res.headers()['content-type'] ?? '').includes('pdf'), 'Không trả').toBe(false);

  });
});
