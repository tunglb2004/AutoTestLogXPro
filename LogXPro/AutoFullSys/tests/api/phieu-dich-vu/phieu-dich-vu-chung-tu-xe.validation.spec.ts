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
import * as F_phieu_dich_vu_phieu_dich_vu from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as R_phieu_dich_vu_phieu_dich_vu from '../../../src/phieu-dich-vu/api/schemas/phieu-dich-vu.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Phiếu dịch vụ (Khối 1)", () => {
  test("ORD-155 Tham số đường dẫn `documentId` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "documentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-157 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-162 Tham số đường dẫn `documentId` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/service-orders/{id}/documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "documentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-164 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/service-orders/{id}/documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-167 Tham số đường dẫn `serviceTypeCode` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/services/{serviceTypeCode}/documents";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "serviceTypeCode": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-169 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/services/{serviceTypeCode}/documents";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-176 Thiếu trường bắt buộc `file`", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents', { token: tok('k1'), params: { id: o.id, serviceTypeCode: KHQ }, multipart: { note: 'không có file' } });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'file');
    expect(await orderDocs(testRun, o.id, KHQ), 'Không tạo bản ghi').toHaveLength(0);

  });

  test("ORD-178 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/services/{serviceTypeCode}/documents";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ multipart: F_phieu_dich_vu_phieu_dich_vu.multiparts["POST /api/service-orders/{id}/services/{serviceTypeCode}/documents"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-183 Tham số đường dẫn `documentId` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "documentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-185 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-189 Tham số đường dẫn `documentId` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/vehicle-documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "documentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-191 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/vehicle-documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-196 Tham số đường dẫn `documentId` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/service-orders/{id}/vehicle-documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "documentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-198 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/service-orders/{id}/vehicle-documents/{documentId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-201 Tham số đường dẫn `pairIndex` sai định dạng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "pairIndex": "abc" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("ORD-203 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("ORD-209 Thiếu trường bắt buộc `file`", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);

    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents', { token: tok('k1'), params: { id: o.id, role: 'HANDOVER', pairIndex: 0 }, multipart: { note: 'không có file' } });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'file');
    expect(await vehicleDocs(testRun, o.id), 'Không tạo bản ghi').toHaveLength(0);

  });

  test("ORD-211 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ multipart: F_phieu_dich_vu_phieu_dich_vu.multiparts["POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
