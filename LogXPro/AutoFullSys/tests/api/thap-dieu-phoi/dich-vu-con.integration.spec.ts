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
  test("K3S-140 Chứng từ dòng chi phí nhiều file tổng ≤ 20MB, file sai bị bỏ qua", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const q = { block: 'COST_LINE', costLineId: o.shiftLineId };
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q, multipart: { files: [REAL.pdf10(), REAL.jpg10(), REAL.other('exe')] } });
    expectStatusIn(res, '200/201');
    const d = await data(res);
    expect((d.documentIds ?? []).length, '2 file lưu').toBe(2);
    expect(Number(d.invalidCount), 'exe bị bỏ qua và báo lại').toBe(1);
    expect(((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q }))).items ?? []).length).toBe(2);

  });

  test("K3S-141 Tổng vượt 20MB", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const q = { block: 'COST_LINE', costLineId: o.shiftLineId };
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q, multipart: { files: [REAL.pdf20(), REAL.pdf10()] } });
    expectStatusIn(res, '400/413/422');
    expect(((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q }))).items ?? []).length, 'Không lưu').toBe(0);

  });

  test("K3S-150 Nội dung đúng", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const file = REAL.pdf10();
    const upd = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file } }), 'đính chứng từ lô hàng');
    const docId = upd?.documentIds?.[0] ?? upd?.id;
    const GET1 = (type: string, role: 'dp' | 'dpVt' = 'dp') => http.call('GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok(role), params: { id: o.id, type, documentId: docId } });

    const res = await GET1(refs.services.KHQ);
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Hash trùng').toBe(sha256(file.buffer));

  });

  test("K3S-172 Tổng nhiều file chứng từ dòng chi phí đúng 20MB và vượt 1 byte", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const q = { block: 'COST_LINE', costLineId: o.shiftLineId };
    const half = 10_485_760;
    const r1 = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q, multipart: { files: [fileOfSize('a.pdf', half), fileOfSize('b.pdf', half)] } });
    expectStatusIn(r1, '200/201', 'tổng 20.971.520 byte');
    const before = ((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q }))).items ?? []).length;
    const r2 = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q, multipart: { files: [fileOfSize('c.pdf', half), fileOfSize('d.pdf', half + 1)] } });
    expectStatusIn(r2, '400/413/422', 'tổng 20.971.521 byte');
    expect(((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q }))).items ?? []).length, 'Lần 2 không lưu file nào').toBe(before);

  });
});
