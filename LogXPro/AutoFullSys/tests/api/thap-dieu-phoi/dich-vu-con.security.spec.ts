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

test.describe("Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)", () => {
  test("K3S-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/k3/service-orders/{id}/services/{type}/coordination-options", "PUT /api/k3/service-orders/{id}/services/{type}/coordination", "GET /api/k3/service-orders/{id}/services/{type}/contractors", "POST /api/k3/service-orders/{id}/services/{type}/start", "GET /api/k3/service-orders/{id}/services/{type}/costs", "GET /api/k3/service-orders/{id}/services/{type}/cost-items", "GET /api/k3/service-orders/{id}/services/{type}/variance-items", "POST /api/k3/service-orders/{id}/services/{type}/costs", "PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}", "DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}", "GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price", "PUT /api/k3/service-orders/{id}/services/{type}/declaration", "GET /api/k3/service-orders/{id}/services/{type}/actuals", "PUT /api/k3/service-orders/{id}/services/{type}/actuals", "GET /api/k3/service-orders/{id}/services/{type}/completion-check", "POST /api/k3/service-orders/{id}/services/{type}/complete", "GET /api/k3/service-orders/{id}/services/{type}/documents", "POST /api/k3/service-orders/{id}/services/{type}/documents", "GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}", "DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}"];
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

  test("K3S-004 Điều phối viên dịch vụ khác", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("K3S-014 DP_VT điều phối KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ }, json: { assignments: [{ priceConfigurationItemId: o.base.items.customsFee.id, contractorId: A, unitCode: refs.units.customsFee }] } });
    expectStatusIn(res, '403/404');
    expect((await costs(testRun, o.svc.KHQ)).contractors ?? [], 'Không đổi').toHaveLength(0);

  });

  test("K3S-029 DP_VT bắt đầu KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '403/404');
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ).status, 'Không đổi').toBe('COORDINATING');

  });

  test("K3S-037 DP_VT xem chi phí KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("K3S-043 DP_VT xem phụ phí KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/cost-items', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ }, query: { contractorId: A } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("K3S-048 DP_VT xem đầu mục phát sinh KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/variance-items', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("K3S-057 DP_VT thêm chi phí KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const P = { id: o.id, type: refs.services.KHQ };
    const ot = await costItem(testRun, o.svc.KHQ, A, o.base.items.overtime.id);
    const sur = { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, priceConfigurationItemId: o.base.items.overtime.id, unitCode: refs.units.overtime, quantity: 1, amount: 300_000, currency: 'VND' };
    const vari = { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 200_000, currency: 'VND' };

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dpVt'), params: P, json: vari });
    expectStatusIn(res, '403/404');
    expect(await costLines(testRun, o.svc.KHQ), 'Không đổi').toHaveLength(1);

  });

  test("K3S-070 `contractorId` không được điều phối cho dịch vụ", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const before = stable(await costs(testRun, o.svc.KHQ));
    const fee = (await costLines(testRun, o.svc.KHQ))[0];
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: B }, json: { currency: 'VND', lines: [{ costLineId: fee.costLineId, unitCode: fee.unitCode, quantity: 1, unitPrice: 1 }] } });
    expectStatusIn(res, '400/403/404');
    expect(stable(await costs(testRun, o.svc.KHQ)), 'Không đổi').toEqual(before);

  });

  test("K3S-080 Dòng thuộc dịch vụ khác", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await coordinate(testRun, o.svc.VT, [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], { USD: P0.fxUsd });
    const vt = (await costLines(testRun, o.svc.VT))[0];
    const res = await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: vt.costLineId } });
    expectStatusIn(res, '403/404');
    expect((await costLines(testRun, o.svc.VT)).some((l) => l.costLineId === vt.costLineId), 'Không xóa').toBe(true);

  });

  test("K3S-089 Dòng của dịch vụ khác", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await coordinate(testRun, o.svc.VT, [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], { USD: P0.fxUsd });
    const vt = (await costLines(testRun, o.svc.VT))[0];
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: vt.costLineId } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("K3S-095 DP_VT gọi cho KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const other = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code ?? 'AT';
    const before = stable((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ));
    const costsBefore = stable(await costs(testRun, o.svc.KHQ));

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/declaration', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ }, json: { customsOfficeCode: other } });
    expectStatusIn(res, '403/404');
    expect(stable((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ)), 'Không đổi').toEqual(before);

  });

  test("K3S-111 DP_VT lưu thực tế KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const before = stable(await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } })));
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ }, json: actualsBody(refs, 'KHQ') });
    expectStatusIn(res, '403/404');
    expect(stable(await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } }))), 'Không đổi').toEqual(before);

  });

  test("K3S-113 Biển số chứa script", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const b = actualsBody(refs, 'KHQ') as any;
    b.handoverVehicles[0].plateNo = '<b>15C</b>';
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: b });
    expectStatusIn(res, '200/400');
    if (res.status() === 200) {
      const d = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } }));
      expect(d.handoverVehicles?.[0]?.plateNo, 'Lưu dạng text, không thực thi').toBe('<b>15C</b>');
    }

  });

  test("K3S-127 DP_VT hoàn thành KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await saveActuals(testRun, o.svc.KHQ, actualsBody(refs, 'KHQ'));
    await uploadActualDoc(testRun, o.svc.KHQ);

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '403/404');
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ).status, 'Không đổi').toBe('IN_PROGRESS');

  });

  test("K3S-135 DP_VT xem chứng từ KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await uploadActualDoc(testRun, o.svc.KHQ);
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });

  test("K3S-143 DP_VT đính kèm KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dpVt'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('dpvt.pdf') } });
    expectStatusIn(res, '403/404');
    expect(((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' } }))).items ?? []).length, 'Không lưu').toBe(0);

  });

  test("K3S-151 Chứng từ dịch vụ khác", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'VT', false);
    const upd = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-vt.pdf') } }), 'đính chứng từ VT');
    const docId = upd?.documentIds?.[0] ?? upd?.id;
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, documentId: docId } });
    expectStatusIn(res, '403/404');
    expect((res.headers()['content-type'] ?? '').includes('pdf'), 'Không trả').toBe(false);

  });

  test("K3S-157 Gỡ chứng từ dịch vụ khác", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'VT', false);
    const u = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-vt.pdf') } }), 'đính chứng từ VT');
    const docId = u?.documentIds?.[0] ?? u?.id;
    const res = await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, documentId: docId } });
    expectStatusIn(res, '403/404');
    expect(((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, query: { block: 'ACTUAL' } }))).items ?? []).some((d: any) => d.id === docId), 'Còn').toBe(true);

  });
});
