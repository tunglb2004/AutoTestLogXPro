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
import * as F_thap_dieu_phoi_dich_vu_con from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)", () => {
  test("K3S-059 Thiếu trường bắt buộc `contractorId`", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/costs";
    const p = await testRun.prepare(API, "dp");
    const payload: Record<string, unknown> = F_thap_dieu_phoi_dich_vu_con.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["note"] = marker;
    delete payload["contractorId"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "contractorId");
    expect(await testRun.listContains("GET /api/k3/service-orders/{id}/services/{type}/costs", marker, "dp", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("K3S-060 `kind` ngoài danh sách cho phép", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/costs";
    const p = await testRun.prepare(API, "dp");
    const payload: Record<string, unknown> = F_thap_dieu_phoi_dich_vu_con.bodies[API]();
    const marker = tagged("AT Không lưu"); payload["note"] = marker;
    payload["kind"] = "XYZ";
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "kind");
    expect(await testRun.listContains("GET /api/k3/service-orders/{id}/services/{type}/costs", marker, "dp", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("K3S-061 `contractorId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/costs";
    const p = await testRun.prepare(API, "dp");
    const marker = tagged("AT Không lưu");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_thap_dieu_phoi_dich_vu_con.bodies[API](), "contractorId": value };
      payload["note"] = marker;
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.listContains("GET /api/k3/service-orders/{id}/services/{type}/costs", marker, "dp", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("K3S-062 `unitCode` 32 và 33 ký tự", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const P = { id: o.id, type: refs.services.KHQ };
    const ot = await costItem(testRun, o.svc.KHQ, A, o.base.items.overtime.id);
    const sur = { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, priceConfigurationItemId: o.base.items.overtime.id, unitCode: refs.units.overtime, quantity: 1, amount: 300_000, currency: 'VND' };
    const vari = { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 200_000, currency: 'VND' };

    for (const len of [32, 33]) {
      const unit = 'U'.repeat(len);
      const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: { ...vari, unitCode: unit } });
      expectStatusIn(res, '400/422', `${len} ký tự`);
      await expectApiError(res);
    }
    expect(await costLines(testRun, o.svc.KHQ), 'Không thêm dòng chi phí').toHaveLength(1);

  });

  test("K3S-072 Thiếu trường bắt buộc `currency`", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}";
    const p = await testRun.prepare(API, "dp");
    const payload: Record<string, unknown> = F_thap_dieu_phoi_dich_vu_con.bodies[API]();
    delete payload["currency"];
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "currency");
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-073 `currency` 3 và 4 ký tự", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `R${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'IN_PROGRESS', { base });
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
    const fee = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    const PUTC = (lines: unknown[], extra: Record<string, unknown> = {}, who: string = A) => http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: who }, json: { currency: 'VND', lines, ...extra } });

    const sets = ['200/204', '400/422', '400/422'];
    const curs = ['USD', 'XYZ', 'USDX'];
    for (let i = 0; i < 3; i++) {
      const res = await PUTC([{ costLineId: fee.costLineId, unitCode: refs.units.customsFee, quantity: 1, unitPrice: 40 }], { currency: curs[i], fxRate: 25_000 });
      expectStatusIn(res, sets[i], curs[i]);
      if (i > 0) await expectApiError(res);
    }
    expect((await costs(testRun, o.svc.KHQ)).contractors[0].currency, 'Chỉ USD lưu được').toBe('USD');

  });

  test("K3S-074 `lines[].quantity` tại 0 và âm", { tag: ["@api", "@thap-dieu-phoi", "@p2", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `R${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'IN_PROGRESS', { base });
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
    const fee = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    const PUTC = (lines: unknown[], extra: Record<string, unknown> = {}, who: string = A) => http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: who }, json: { currency: 'VND', lines, ...extra } });

    const zero = await PUTC([{ costLineId: fee.costLineId, unitCode: refs.units.customsFee, quantity: 0, unitPrice: 1_000_000 }]);
    expectStatusIn(zero, '200/204', 'quantity = 0');
    const neg = await PUTC([{ costLineId: fee.costLineId, unitCode: refs.units.customsFee, quantity: -1, unitPrice: 1_000_000 }]);
    expectStatusIn(neg, '400/422', 'quantity = -1');
    expect(Number((await costLines(testRun, o.svc.KHQ)).find((l) => l.costLineId === fee.costLineId).quantity), 'Không lưu giá trị âm').toBe(0);
    test.info().annotations.push({ type: 'Chờ xác nhận', description: 'Giá trị 0 chưa có quy định rõ' });

  });

  test("K3S-097 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/k3/service-orders/{id}/services/{type}/declaration";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_dich_vu_con.bodies["PUT /api/k3/service-orders/{id}/services/{type}/declaration"]() }, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-098 `customsOfficeCode` 32 và 33 ký tự (API đã tắt)", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const other = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code ?? 'AT';
    const before = stable((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ));
    const costsBefore = stable(await costs(testRun, o.svc.KHQ));

    for (const len of [32, 33]) {
      const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/declaration', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { customsOfficeCode: "C".repeat(len) } });
      expectStatusIn(res, '400/403/409', `${len} ký tự`);
    }
    expect(stable((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ)), 'Thông tin khai báo giữ nguyên').toEqual(before);

  });

  test("K3S-114 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/k3/service-orders/{id}/services/{type}/actuals";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_dich_vu_con.bodies["PUT /api/k3/service-orders/{id}/services/{type}/actuals"]() }, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-115 `declarationNo` 20 và 21 chữ số", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const d20 = '1'.repeat(20);
    expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { ...actualsBody(refs, 'KHQ'), declarationNo: d20 } }), '200/204', '20 chữ số');
    const r21 = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { ...actualsBody(refs, 'KHQ'), declarationNo: '1'.repeat(21) } });
    expectStatusIn(r21, '400/422', '21 chữ số');
    const d = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } }));
    expect(d.declarationNo, 'Giữ giá trị 20 chữ số').toBe(d20);

  });

  test("K3S-005 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/coordination-options";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-007 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/coordination-options";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-016 Thiếu trường bắt buộc `assignments`", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/k3/service-orders/{id}/services/{type}/coordination";
    const p = await testRun.prepare(API, "dp");
    const payload: Record<string, unknown> = F_thap_dieu_phoi_dich_vu_con.bodies[API]();
    delete payload["assignments"];
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "assignments");
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-018 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/k3/service-orders/{id}/services/{type}/coordination";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_dich_vu_con.bodies["PUT /api/k3/service-orders/{id}/services/{type}/coordination"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-021 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/contractors";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-023 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/contractors";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-031 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/start";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-033 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/start";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-038 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/costs";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-040 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/costs";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-044 Thiếu tham số bắt buộc `contractorId`", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/cost-items";
    const p = await testRun.prepare(API, "dp");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["contractorId"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("K3S-046 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/cost-items";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-049 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/variance-items";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-051 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/variance-items";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-064 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/costs";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_dich_vu_con.bodies["POST /api/k3/service-orders/{id}/services/{type}/costs"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-076 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_dich_vu_con.bodies["PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-082 Tham số đường dẫn `costLineId` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "costLineId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-084 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-090 Tham số đường dẫn `costLineId` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "costLineId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-092 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-100 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/k3/service-orders/{id}/services/{type}/declaration";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_dich_vu_con.bodies["PUT /api/k3/service-orders/{id}/services/{type}/declaration"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-102 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/actuals";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-104 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/actuals";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-117 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/k3/service-orders/{id}/services/{type}/actuals";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{ json: F_thap_dieu_phoi_dich_vu_con.bodies["PUT /api/k3/service-orders/{id}/services/{type}/actuals"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-119 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/completion-check";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-121 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/completion-check";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-129 Tham số đường dẫn `type` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/complete";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "type": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-131 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/complete";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-136 Thiếu tham số bắt buộc `block`", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/documents";
    const p = await testRun.prepare(API, "dp");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["block"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("K3S-138 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/documents";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-145 Thiếu tham số bắt buộc `block`", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/documents";
    const p = await testRun.prepare(API, "dp");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["block"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("K3S-147 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/k3/service-orders/{id}/services/{type}/documents";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{ multipart: F_thap_dieu_phoi_dich_vu_con.multiparts["POST /api/k3/service-orders/{id}/services/{type}/documents"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-152 Tham số đường dẫn `documentId` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "documentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-154 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("K3S-159 Tham số đường dẫn `documentId` sai định dạng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "documentId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("K3S-161 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
