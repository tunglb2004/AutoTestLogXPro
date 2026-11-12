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
  test("ORD-158 Gỡ chứng từ khỏi phiếu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const doc = await uploadOrderDoc(testRun, o.id, KHQ, samplePdf('chung-tu-go.pdf'));
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');
    const res = await http.call('DELETE /api/service-orders/{id}/documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200/204');
    expect((await orderDocs(testRun, o.id, KHQ)).some((d: any) => d.id === doc.id), 'Chứng từ bị gỡ').toBe(false);

  });

  test("ORD-159 Gỡ sau khi K3 tiếp nhận", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const doc = await uploadOrderDoc(testRun, o.id, KHQ, samplePdf('chung-tu-ban-dau.pdf'));
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');
    await acceptOrder(testRun, o.id);
    const res = await http.call('DELETE /api/service-orders/{id}/documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '400/409/422');
    expect((await orderDocs(testRun, o.id, KHQ)).some((d: any) => d.id === doc.id), 'Chứng từ ban đầu chỉ đọc').toBe(true);

  });

  test("ORD-192 Gỡ số thông hành", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const doc = await uploadVehicleDoc(testRun, o.id, samplePdf('so-thong-hanh.pdf'));
    const res = await http.call('DELETE /api/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200/204');
    expect((await vehicleDocs(testRun, o.id)).some((d: any) => d.id === doc.id), 'Gỡ khỏi xe').toBe(false);

  });

  test("ORD-193 Gỡ sau khi K3 tiếp nhận", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const doc = await uploadVehicleDoc(testRun, o.id, samplePdf('so-thong-hanh.pdf'));
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');
    await acceptOrder(testRun, o.id);
    const res = await http.call('DELETE /api/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '400/409/422');
    expect((await vehicleDocs(testRun, o.id)).some((d: any) => d.id === doc.id), 'Không gỡ').toBe(true);

  });

  test("ORD-152 Tải chứng từ K1 của phiếu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf10();
    const doc = await uploadOrderDoc(testRun, o.id, KHQ, file);
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');
    const res = await http.call('GET /api/service-orders/{id}/documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Đúng file đã tải').toBe(sha256(file.buffer));

  });

  test("ORD-161 Chỉ gỡ đúng 1 chứng từ", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const d1 = await uploadOrderDoc(testRun, o.id, KHQ, samplePdf('chung-tu-1.pdf'));
    const d2 = await uploadOrderDoc(testRun, o.id, KHQ, samplePdf('chung-tu-2.pdf'));
    const res = await http.call('DELETE /api/service-orders/{id}/documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: d1.id } });
    expectStatusIn(res, '200/204');
    const left = await orderDocs(testRun, o.id, KHQ);
    expect(left.map((d: any) => d.id), 'Còn 1').toEqual([d2.id]);

  });

  test("ORD-165 Danh sách chứng từ của dịch vụ", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    await uploadOrderDoc(testRun, o.id, KHQ, samplePdf('to-khai.pdf'));
    await uploadOrderDoc(testRun, o.id, KHQ, samplePdf('hoa-don.pdf'));
    const res = await http.call('GET /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ } });
    expectStatusIn(res, '200');
    const list = (await data(res)).items ?? [];
    expect(list).toHaveLength(2);
    for (const d of list) {
      expect(String(d.filename ?? '').length, 'Có tên').toBeGreaterThan(0);
      expect(Number(d.byteSize), 'Có dung lượng').toBeGreaterThan(0);
      expect(d, 'Có người tải').toHaveProperty('uploadedBy');
    }

  });

  test("ORD-170 Đính kèm chứng từ cho dịch vụ", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: REAL.docx10() } });
    expectStatusIn(res, '200/201');
    expect((await orderDocs(testRun, o.id, KHQ)).some((d: any) => String(d.filename).endsWith('.docx')), 'Lưu chứng từ').toBe(true);

  });

  test("ORD-173 Đính kèm sau khi K3 tiếp nhận", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const res = await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { file: samplePdf('sau-tiep-nhan.pdf') } });
    expectStatusIn(res, '400/409/422');
    expect(await orderDocs(testRun, o.id, KHQ), 'Chứng từ ban đầu chỉ đọc').toHaveLength(0);

  });

  test("ORD-175 Thiếu file", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: {} });
    expectStatusIn(res, '400/422');
    expect(res.status(), 'Không 5xx').toBeLessThan(500);

  });

  test("ORD-180 K1 tải chứng từ K3 ở Thông tin thực tế", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'CHANG1_DONE');
    const refs = await testRun.p0Refs();
    const pod = REAL.pdf10();
    const up = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, query: { block: 'ACTUAL' }, multipart: { file: pod } }), 'K3 đính kèm POD ở VT');
    const podId = up?.documentIds?.[0] ?? up?.id;

    const res = await http.call('GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.VT, documentId: podId } });
    expectStatusIn(res, '200');
    expect((await res.body()).length, 'Trả file POD').toBeGreaterThan(0);

  });

  test("ORD-186 Tải số thông hành của xe", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf20();
    const doc = await uploadVehicleDoc(testRun, o.id, file);
    const res = await http.call('GET /api/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Trả đúng file').toBe(sha256(file.buffer));

  });

  test("ORD-195 Không ảnh hưởng xe khác", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    // orderBody đã có đúng 1 Xe giao (KHQ) và 1 Xe nhận (VT), cùng pairIndex = 0.
    const payload = await orderBody(testRun, base);
    const o = await createOrder(testRun, base, { submit: false, body: payload });
    const d1 = await uploadVehicleDoc(testRun, o.id, samplePdf('xe-giao.pdf'), 'HANDOVER');
    const d2 = await uploadVehicleDoc(testRun, o.id, samplePdf('xe-nhan.pdf'), 'RECEIVER');
    const res = await http.call('DELETE /api/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('k1'), params: { id: o.id, documentId: d1.id } });
    expectStatusIn(res, '200/204');
    expect((await vehicleDocs(testRun, o.id, 'RECEIVER')).some((d: any) => d.id === d2.id), 'Xe còn lại vẫn còn tài liệu').toBe(true);

  });

  test("ORD-199 Danh sách số thông hành của xe", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    await uploadVehicleDoc(testRun, o.id, samplePdf('so-thong-hanh.pdf'));
    const res = await http.call('GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 } });
    expectStatusIn(res, '200');
    expect((await data(res)).items, 'Trả 1 file').toHaveLength(1);

  });

  test("ORD-204 Đính kèm số thông hành cho xe", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: { file: REAL.pdf20() } });
    expectStatusIn(res, '200/201');
    expect(await vehicleDocs(testRun, o.id), 'Lưu file').toHaveLength(1);

  });

  test("ORD-206 Vai trò xe hoặc chỉ số cặp không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'RECEIVER', pairIndex: 5 }, multipart: { file: samplePdf('sai-cap.pdf') } });
    expectStatusIn(res, '400/404');
    expect(await vehicleDocs(testRun, o.id), 'Không lưu').toHaveLength(0);

  });

  test("ORD-208 Thiếu file", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: {} });
    expectStatusIn(res, '400/422');
    expect(res.status(), 'Không 5xx').toBeLessThan(500);

  });
});
