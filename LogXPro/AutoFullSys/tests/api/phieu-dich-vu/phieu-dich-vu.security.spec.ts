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
  test("ORD-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/service-orders/selectable-customers", "GET /api/service-orders/statuses", "GET /api/service-orders", "POST /api/service-orders", "GET /api/service-orders/{id}", "PUT /api/service-orders/{id}", "DELETE /api/service-orders/{id}", "POST /api/service-orders/{id}/submit", "POST /api/service-orders/{id}/cancel", "POST /api/service-orders/{id}/restore", "GET /api/service-orders/{id}/revenue", "PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}", "PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines", "GET /api/service-orders/{id}/cost-revenue-summary", "GET /api/service-orders/{id}/revenue-confirmation", "POST /api/service-orders/{id}/revenue-confirmation", "GET /api/service-orders/{id}/history", "GET /api/service-orders/{id}/documents/{documentId}", "DELETE /api/service-orders/{id}/documents/{documentId}", "GET /api/service-orders/{id}/services/{serviceTypeCode}/documents", "POST /api/service-orders/{id}/services/{serviceTypeCode}/documents", "GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}", "GET /api/service-orders/{id}/vehicle-documents/{documentId}", "DELETE /api/service-orders/{id}/vehicle-documents/{documentId}", "GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents", "POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents", "GET /api/service-orders/{id}/scope-requests", "POST /api/service-orders/{id}/scope-requests/{requestId}/respond"];
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

  test("ORD-011 K1B không thấy phiếu KH_A", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const res = await http.call('GET /api/service-orders', { token: tok('k1b'), query: { search: o.code } });
    expectStatusIn(res, '200');
    expect(items(await data(res)), 'K1B không thấy phiếu KH_A').toHaveLength(0);

  });

  test("ORD-025 Tạo phiếu cho khách không phụ trách", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const payload = await orderBody(testRun, base);
    const marker = tagged('AT-K1B').slice(0, 50);
    payload.customerRef = marker;
    const res = await http.call('POST /api/service-orders', { token: tok('k1b'), query: { submit: true }, json: payload });
    expectStatusIn(res, '400/403');
    expect(await testRun.listContains('GET /api/service-orders', marker, 'k1'), 'Không tạo phiếu').toBe(false);

  });

  test("ORD-027 Ghi chú chứa SQL", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const note = "'; DROP TABLE service_orders; --";
    const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: false }, json: await orderBody(testRun, base, { generalNote: note }) });
    expectStatusIn(res, '200/201');
    expect((await getOrder(testRun, (await data(res)).id)).generalNote, 'Lưu nguyên văn').toBe(note);

  });

  test("ORD-036 Mở phiếu khách khác bằng id", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const res = await http.call('GET /api/service-orders/{id}', { token: tok('k1b'), params: { id: o.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);
    test.info().annotations.push({ type: 'Không kiểm', description: 'Ghi log an ninh: không có API đọc log an ninh trong phạm vi' });

  });

  test("ORD-044 K1B sửa phiếu KH_A", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const before = stable(await getOrder(testRun, o.id));
    const res = await http.call('PUT /api/service-orders/{id}', { token: tok('k1b'), params: { id: o.id }, json: await orderBody(testRun, base, { generalNote: 'K1B sửa' }) });
    expectStatusIn(res, '403/404');
    expect(stable(await getOrder(testRun, o.id)), 'Không đổi').toEqual(before);

  });

  test("ORD-055 K1B xóa", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('DELETE /api/service-orders/{id}', { token: tok('k1b'), params: { id: o.id } });
    expectStatusIn(res, '403/404');
    expect((await getOrder(testRun, o.id)).id, 'Phiếu còn').toBe(o.id);

  });

  test("ORD-063 K1B gửi", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1b'), params: { id: o.id } });
    expectStatusIn(res, '403/404');
    expect((await getOrder(testRun, o.id)).status, 'Giữ DRAFT').toBe('DRAFT');

  });

  test("ORD-074 K1B hủy", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1b'), params: { id: o.id }, json: { reason: 'K1B hủy' } });
    expectStatusIn(res, '403/404');
    expect((await getOrder(testRun, o.id)).status, 'Không đổi').toBe('SUBMITTED');

  });

  test("ORD-084 K1B khôi phục", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await rejectOrder(testRun, o.id);
    const res = await http.call('POST /api/service-orders/{id}/restore', { token: tok('k1b'), params: { id: o.id } });
    expectStatusIn(res, '403/404');
    expect((await getOrder(testRun, o.id)).status, 'Không đổi').toBe('REJECTED');

  });

  test("ORD-095 K1B xem doanh thu phiếu KH_A", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const res = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1b'), params: { id: o.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("ORD-103 K1B áp tỷ giá", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const refs = await testRun.p0Refs();
    const before = stable(await revenueOf(testRun, o.id));
    const res = await http.call('PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}', { token: tok('k1b'), params: { id: o.id, serviceTypeCode: refs.services.VT }, json: { source: 'MANUAL', fxRate: 26_000 } });
    expectStatusIn(res, '403/404');
    expect(stable(await revenueOf(testRun, o.id)), 'Không đổi').toEqual(before);

  });

  test("ORD-115 K1B sửa doanh thu phiếu KH_A", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;
    const shift = () => revenueOf(testRun, o.id).then((ts) => (revenueTable(ts, KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId));
    const edit = (lines: unknown[], role: 'k1' | 'k1b' = 'k1') => http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok(role), params: { id: o.id, serviceTypeCode: KHQ }, json: { lines } });

    const s = await shift();
    const before = stable(await revenueOf(testRun, o.id));
    const res = await edit([{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }], 'k1b');
    expectStatusIn(res, '403/404');
    expect(stable(await revenueOf(testRun, o.id)), 'Không đổi').toEqual(before);

  });

  test("ORD-124 K1B xem tổng hợp", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const res = await http.call('GET /api/service-orders/{id}/cost-revenue-summary', { token: tok('k1b'), params: { id: o.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("ORD-131 K1B đối soát", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const res = await http.call('GET /api/service-orders/{id}/revenue-confirmation', { token: tok('k1b'), params: { id: o.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("ORD-140 Tài khoản K5 không có phạm vi phiếu", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED');
    const res = await http.call('POST /api/service-orders/{id}/revenue-confirmation', { token: tok('k5Only'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, o.id)).status, 'K5 xác nhận mọi phiếu (quyền nhóm)').toBe('COMPLETED');

  });

  test("ORD-146 K1B đọc lịch sử phiếu KH_A", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const res = await http.call('GET /api/service-orders/{id}/history', { token: tok('k1b'), params: { id: o.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("ORD-154 Chứng từ của phiếu khác", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const p0 = await createOrder(testRun, base, { submit: false });
    const q = await createOrder(testRun, base, { submit: false });
    const doc = await uploadOrderDoc(testRun, q.id, KHQ, samplePdf('chung-tu-phieu-q.pdf'));
    const res = await http.call('GET /api/service-orders/{id}/documents/{documentId}', { token: tok('k1'), params: { id: p0.id, documentId: doc.id } });
    expectStatusIn(res, '403/404');
    expect((res.headers()['content-type'] ?? '').includes('pdf'), 'Không trả file').toBe(false);

  });

  test("ORD-160 K1B gỡ", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const doc = await uploadOrderDoc(testRun, o.id, KHQ, samplePdf('chung-tu-k1b.pdf'));
    const res = await http.call('DELETE /api/service-orders/{id}/documents/{documentId}', { token: tok('k1b'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '403/404');
    expect((await orderDocs(testRun, o.id, KHQ)).some((d: any) => d.id === doc.id), 'Còn chứng từ').toBe(true);

  });

  test("ORD-166 K1B xem chứng từ phiếu KH_A", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    await uploadOrderDoc(testRun, o.id, KHQ, samplePdf('to-khai.pdf'));
    const res = await http.call('GET /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1b'), params: { id: o.id, serviceTypeCode: KHQ } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("ORD-174 K1B đính kèm", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1b'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: samplePdf('k1b.pdf') } });
    expectStatusIn(res, '403/404');
    expect(await orderDocs(testRun, o.id, KHQ), 'Không lưu').toHaveLength(0);

  });

  test("ORD-182 Chứng từ của dịch vụ khác", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'CHANG1_DONE');
    const refs = await testRun.p0Refs();
    const pod = REAL.pdf10();
    const up = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, query: { block: 'ACTUAL' }, multipart: { file: pod } }), 'K3 đính kèm POD ở VT');
    const podId = up?.documentIds?.[0] ?? up?.id;

    const res = await http.call('GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ, documentId: podId } });
    expectStatusIn(res, '403/404');
    expect((res.headers()['content-type'] ?? '').includes('pdf'), 'Không trả file').toBe(false);

  });

  test("ORD-188 Tài liệu phiếu khác", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const p0 = await createOrder(testRun, base, { submit: false });
    const q = await createOrder(testRun, base, { submit: false });
    const doc = await uploadVehicleDoc(testRun, q.id, samplePdf('so-thong-hanh-q.pdf'));
    const res = await http.call('GET /api/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('k1'), params: { id: p0.id, documentId: doc.id } });
    expectStatusIn(res, '403/404');
    expect((res.headers()['content-type'] ?? '').includes('pdf'), 'Không trả').toBe(false);

  });

  test("ORD-194 K1B gỡ", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const doc = await uploadVehicleDoc(testRun, o.id, samplePdf('so-thong-hanh.pdf'));
    const res = await http.call('DELETE /api/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('k1b'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '403/404');
    expect((await vehicleDocs(testRun, o.id)).some((d: any) => d.id === doc.id), 'Còn').toBe(true);

  });

  test("ORD-200 K1B xem tài liệu xe phiếu KH_A", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    await uploadVehicleDoc(testRun, o.id, samplePdf('so-thong-hanh.pdf'));
    const res = await http.call('GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1b'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("ORD-207 K1B tải lên", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1b'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: { file: samplePdf('k1b.pdf') } });
    expectStatusIn(res, '403/404');
    expect(await vehicleDocs(testRun, o.id), 'Không lưu').toHaveLength(0);

  });

  test("ORD-214 K1B xem đề xuất của phiếu KH_A", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const { order } = await scopeRequestOrder(testRun);
    const res = await http.call('GET /api/service-orders/{id}/scope-requests', { token: tok('k1b'), params: { id: order.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("ORD-220 `requestId` của phiếu khác", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = await scopeRequestOrder(testRun);
    const p0 = await scopeRequestOrder(testRun);
    const res = await http.call('POST /api/service-orders/{id}/scope-requests/{requestId}/respond', { token: tok('k1'), params: { id: p0.order.id, requestId: q.requestId }, json: { accept: true } });
    expectStatusIn(res, '403/404');
    const r = ((await data(await http.call('GET /api/service-orders/{id}/scope-requests', { token: tok('k1'), params: { id: q.order.id } }))).items ?? []).find((x: any) => x.id === q.requestId);
    expect(r.status, 'Không đổi').toBe('PENDING');

  });
});
