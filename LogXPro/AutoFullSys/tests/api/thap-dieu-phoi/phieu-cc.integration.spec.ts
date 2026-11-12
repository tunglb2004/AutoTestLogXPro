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
  test("K3O-062 Nội dung đúng", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf10();
    const doc = await uploadOrderDoc(testRun, o.id, refs.services.KHQ, file);
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');

    const res = await http.call('GET /api/k3/service-orders/{id}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Hash trùng').toBe(sha256(file.buffer));

  });

  test("K3O-068 Nội dung đúng", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf20();
    const doc = await uploadVehicleDoc(testRun, o.id, file);
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');

    const res = await http.call('GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('dp'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Hash trùng').toBe(sha256(file.buffer));

  });
});
