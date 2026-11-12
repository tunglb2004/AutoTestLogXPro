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
  test("ORD-171 Định dạng PDF, JPG, PNG, DOCX, XLSX tối đa 10MB", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    for (const f of [REAL.pdf10(), REAL.jpg10(), REAL.png10(), REAL.xlsx10()]) {
      expectStatusIn(await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: f } }), '200/201', f.name);
    }
    const big = await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: REAL.pdf11() } });
    expectStatusIn(big, '400/413/422', '11MB');
    expect(await orderDocs(testRun, o.id, KHQ), '4 file đầu lưu được, file 11MB bị chặn').toHaveLength(4);

  });

  test("ORD-172 Định dạng không cho phép", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    for (const ext of ['zip', 'exe']) {
      const f = ext === 'zip' ? REAL.zip10() : REAL.other('exe');
      expectStatusIn(await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: f } }), '400/415/422', ext);
    }
    expect(await orderDocs(testRun, o.id, KHQ), 'Bị chặn').toHaveLength(0);

  });

  test("ORD-153 Nội dung trùng file gốc", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf10();
    const doc = await uploadOrderDoc(testRun, o.id, KHQ, file);
    const res = await http.call('GET /api/service-orders/{id}/documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Hash trùng').toBe(sha256(file.buffer));

  });

  test("ORD-181 File đúng nội dung", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'CHANG1_DONE');
    const refs = await testRun.p0Refs();
    const pod = REAL.pdf10();
    const up = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, query: { block: 'ACTUAL' }, multipart: { file: pod } }), 'K3 đính kèm POD ở VT');
    const podId = up?.documentIds?.[0] ?? up?.id;

    const res = await http.call('GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.VT, documentId: podId } });
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Hash trùng').toBe(sha256(pod.buffer));

  });

  test("ORD-187 Nội dung đúng", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf20();
    const doc = await uploadVehicleDoc(testRun, o.id, file);
    const res = await http.call('GET /api/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Hash trùng').toBe(sha256(file.buffer));

  });

  test("ORD-205 20MB qua, 21MB chặn, sai định dạng chặn", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    expectStatusIn(await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: { file: REAL.docx20() } }), '200/201', 'docx 20MB');
    expectStatusIn(await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: { file: REAL.pdf21() } }), '400/413/422', 'pdf 21MB');
    expectStatusIn(await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: { file: REAL.jpg10() } }), '400/415/422', 'jpg');
    expect(await vehicleDocs(testRun, o.id), 'Chỉ file đầu lưu được').toHaveLength(1);

  });

  test("ORD-232 Chứng từ dịch vụ đúng 10MB − 1 byte, đúng 10MB, 10MB + 1 byte", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const sizes = [10_485_759, 10_485_760, 10_485_761];
    const sets = ['200/201', '200/201', '400/413/422'];
    for (let i = 0; i < 3; i++) {
      const res = await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: fileOfSize(`chung-tu-${sizes[i]}.pdf`, sizes[i]) } });
      expectStatusIn(res, sets[i], `${sizes[i]} byte`);
    }
    const list = await orderDocs(testRun, o.id, KHQ);
    expect(list.map((d: any) => Number(d.byteSize)).sort(), '2 file đầu lưu được, dung lượng đúng; file thứ 3 không tạo bản ghi').toEqual([10_485_759, 10_485_760]);

  });
});
