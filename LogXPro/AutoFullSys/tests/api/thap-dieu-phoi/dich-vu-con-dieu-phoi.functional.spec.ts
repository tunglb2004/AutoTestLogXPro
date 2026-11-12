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
  test("K3S-002 Nhà thầu và đầu mục cho modal điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { token: tok('dp'), params: { id: o.id, type: refs.services.VT } });
    expectStatusIn(res, '200');
    const d = await data(res);
    const names = (d.contractors ?? []).map((c: any) => c.contractorName).join(' | ');
    const a = (d.contractors ?? []).find((c: any) => c.currency === 'VND' && Number(c.originalCost) === 9_500_000);
    const b = (d.contractors ?? []).find((c: any) => c.currency === 'USD' && Number(c.originalCost) === 400);
    expect(a, `NT_A 9.500.000 VND/Chuyến (${names})`).toBeTruthy();
    expect(b, `NT_B 400 USD/Chuyến (${names})`).toBeTruthy();
    expect((d.items ?? []).some((i: any) => i.id === o.base.items.freight.id), 'Có đầu mục Cước vận tải').toBe(true);

  });

  test("K3S-003 Đầu mục tắt không có trong danh sách", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `I${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'ACCEPTED', { base });
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await must(await setItemStatus(testRun, base.items.freight, 'INACTIVE'), 'tắt đầu mục Cước vận tải');
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { token: tok('dp'), params: { id: o.id, type: refs.services.VT } });
    expectStatusIn(res, '200');
    expect(((await data(res)).items ?? []).some((i: any) => i.id === base.items.freight.id), 'Không có đầu mục đã tắt').toBe(false);

  });

  test("K3S-008 Xác nhận điều phối Vận tải cho NT_B", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: { assignments: [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], fxRates: { USD: P0.fxUsd } } });
    expectStatusIn(res, '200/204');
    const svc = (await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.VT);
    expect(svc.status, 'VT → Điều phối').toBe('COORDINATING');
    const c = await costs(testRun, o.svc.VT);
    const blk = (c.contractors ?? []).find((x: any) => x.contractorId === B);
    expect(blk, 'Khối nhà thầu NT_B').toBeTruthy();
    expect(blk.lines).toHaveLength(1);
    expect([blk.lines[0].unitCode, Number(blk.lines[0].quantity), Number(blk.lines[0].unitPrice)], 'Chuyến × 1 × 400 USD').toEqual([refs.units.freight, 1, 400]);
    expect(Number(blk.fxRate), 'Tỷ giá 25.000').toBe(P0.fxUsd);
    expectMoney(blk.totalConverted, 10_000_000, 'Quy đổi 10.000.000');

  });

  test("K3S-009 Còn đầu mục chưa chọn nhà thầu", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { assignments: [] } });
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expect((await costs(testRun, o.svc.KHQ)).contractors ?? [], 'Không sinh chi phí').toHaveLength(0);

  });

  test("K3S-010 Nhà thầu không có giá cho đầu mục", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const C = env.ref('CONTRACTOR_C_ID');
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: { assignments: [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: C, unitCode: refs.units.freight, routeIndex: 0 }] } });
    expectStatusIn(res, '400/409/422');
    expect((await costs(testRun, o.svc.VT)).contractors ?? [], 'Không sinh chi phí').toHaveLength(0);

  });

  test("K3S-011 Điều phối lại đổi nhà thầu", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await coordinate(testRun, o.svc.VT, [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], { USD: P0.fxUsd });
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: { assignments: [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: A, unitCode: refs.units.freight, routeIndex: 0 }] } });
    expectStatusIn(res, '200/204');
    const c = await costs(testRun, o.svc.VT);
    expect((c.contractors ?? []).map((x: any) => x.contractorId), 'Chỉ còn NT_A').toEqual([A]);
    expectMoney(c.totalConverted, 9_500_000, 'Chi phí theo NT_A 9.500.000 VND');

  });

  test("K3S-012 Đơn giá lấy theo giá mua hiện hành tại lúc điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p1", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `G${TEST_RUN_ID}`);
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const o = await p0Order(testRun, 'ACCEPTED', { base });
    await changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { assignments: [{ priceConfigurationItemId: o.base.items.customsFee.id, contractorId: A, unitCode: refs.units.customsFee }] } });
    expectStatusIn(res, '200/204');
    const line = (await costLines(testRun, o.svc.KHQ))[0];
    test.info().annotations.push({ type: 'Chờ xác nhận', description: 'Phụ thuộc luồng phê duyệt dòng giá (chưa triển khai theo SRS)' });
    expectMoney(line.unitPrice, 1_100_000, 'Đơn giá theo giá mua hiện hành lúc điều phối');

  });

  test("K3S-013 Phiếu không ở trạng thái điều phối được", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: { assignments: [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], fxRates: { USD: P0.fxUsd } } });
    expectStatusIn(res, '400/409/422');
    expect((await costs(testRun, o.svc.VT)).contractors ?? [], 'Chi phí chỉ có sau xác nhận chặng').toHaveLength(0);

  });

  test("K3S-019 Thông tin nhà thầu đã điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await coordinate(testRun, o.svc.VT, [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], { USD: P0.fxUsd });
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/contractors', { token: tok('dp'), params: { id: o.id, type: refs.services.VT } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.filter((c: any) => c.contractorId === B), 'Mỗi nhà thầu 1 lần').toHaveLength(1);
    const pc = list.find((c: any) => c.contractorId === B).primaryContact;
    for (const k of ['fullName', 'jobTitle', 'phone', 'email']) expect(String(pc?.[k] ?? '').length, `Đầu mối chính có ${k}`).toBeGreaterThan(0);

  });

  test("K3S-020 Nhà thầu chưa có đầu mối chính", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await coordinate(testRun, o.svc.VT, [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], { USD: P0.fxUsd });
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/contractors', { token: tok('dp'), params: { id: o.id, type: refs.services.VT } });
    expectStatusIn(res, '200');
    const row = items(await data(res)).find((c: any) => c.contractorId === B);
    test.info().annotations.push({ type: 'Tiền điều kiện', description: 'NT_B không có đầu mối chính (dữ liệu chuẩn bị)' });
    expect(row.primaryContact ?? null, 'Không tự chọn đầu mối khác').toBeNull();
    expect(String(row.notice ?? '').length, 'Có thông báo MSG-K3-INFO-01').toBeGreaterThan(0);

  });

  test("K3S-024 Bắt đầu thực hiện dịch vụ", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '200/204');
    const d = await getOrder(testRun, o.id);
    expect(d.services.find((s: any) => s.serviceTypeCode === refs.services.KHQ).status, 'KHQ Đang thực hiện').toBe('IN_PROGRESS');
    expect(d.status, 'Phiếu tổng chuyển Đang thực hiện khi dịch vụ con bắt đầu').toBe('IN_PROGRESS');

  });

  test("K3S-025 Khóa chặng tuần tự", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await coordinate(testRun, o.svc.VT, [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], { USD: P0.fxUsd });
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: { id: o.id, type: refs.services.VT } });
    expectStatusIn(res, '400/409/422');
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.VT).status, 'VT chưa bắt đầu').toBe('COORDINATING');

  });

  test("K3S-026 KHQ chạy độc lập không bị khóa chặng", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ).status, 'KHQ được bắt đầu khi chưa dịch vụ nào xong').toBe('IN_PROGRESS');

  });

  test("K3S-027 Thứ tự linh hoạt trong cùng chặng", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await coordinate(testRun, o.svc.ST, [{ priceConfigurationItemId: o.base.items.transload.id, contractorId: A, unitCode: refs.units.transload }]);
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: { id: o.id, type: refs.services.ST } });
    expectStatusIn(res, '200/204');
    const svcs = (await getOrder(testRun, o.id)).services;
    expect(svcs.find((s: any) => s.serviceTypeCode === refs.services.ST).status, 'ST bắt đầu khi HQGS chưa bắt đầu').toBe('IN_PROGRESS');
    expect(svcs.find((s: any) => s.serviceTypeCode === refs.services.HQGS).status).toBe('NOT_STARTED');

  });

  test("K3S-028 Dịch vụ chưa điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: { id: o.id, type: refs.services.KB } });
    expectStatusIn(res, '400/409/422');
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KB).status, 'Phải điều phối trước').toBe('NOT_STARTED');

  });

  test("K3S-015 Chi phí sinh ra làm doanh thu dòng Cố định được ghi nhận", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: { assignments: [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], fxRates: { USD: P0.fxUsd } } });
    expectStatusIn(res, '200/204');
    const cost = (await costLines(testRun, o.svc.VT))[0];
    const ln = (revenueTable(await revenueOf(testRun, o.id), refs.services.VT).lines ?? []).find((l: any) => String(l.itemName ?? '').includes('Cước vận tải'));
    expectMoney(ln.amount, 11_000_000, 'Doanh thu VT');
    expect(ln.costLineId, 'Gắn costLineId').toBe(cost.costLineId);
    expect(ln.estimated).toBe(false);

  });

  test("K3S-030 Hủy phiếu bị chặn từ đây", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const res = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Hủy sau khi bắt đầu' } });
    expectStatusIn(res, '400/409/422');
    const after = await getOrder(testRun, o.id);
    expect(after.status, 'Phiếu tổng vẫn Đang thực hiện').toBe('IN_PROGRESS');
    expect(after.services.some((s: any) => s.status === 'IN_PROGRESS'), 'Vẫn có dịch vụ Đang thực hiện').toBe(true);

  });

  test("K3S-066 Chỉnh sửa chi phí khối nhà thầu (làm mới giá)", { tag: ["@api", "@thap-dieu-phoi", "@p1", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `R${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'IN_PROGRESS', { base });
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
    const fee = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    const PUTC = (lines: unknown[], extra: Record<string, unknown> = {}, who: string = A) => http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: who }, json: { currency: 'VND', lines, ...extra } });

    const cur = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: fee.costLineId } }));
    const res = await PUTC([{ costLineId: fee.costLineId, unitCode: refs.units.customsFee, quantity: 1, unitPrice: Number(cur.currentAmount) }]);
    expectStatusIn(res, '200/204');
    const after = (await costLines(testRun, o.svc.KHQ)).find((l) => l.costLineId === fee.costLineId);
    test.info().annotations.push({ type: 'Chờ xác nhận', description: 'Phụ thuộc luồng phê duyệt dòng giá (chưa triển khai theo SRS)' });
    expectMoney(after.unitPrice, 1_100_000, 'Đơn giá làm mới 1.100.000');

  });

  test("K3S-085 Làm mới giá: đơn giá hiện tại của dòng giá mua", { tag: ["@api", "@thap-dieu-phoi", "@p1", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `R${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'IN_PROGRESS', { base });
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
    const fee = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    const PUTC = (lines: unknown[], extra: Record<string, unknown> = {}, who: string = A) => http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: who }, json: { currency: 'VND', lines, ...extra } });

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: fee.costLineId } });
    expectStatusIn(res, '200');
    const d = await data(res);
    test.info().annotations.push({ type: 'Chờ xác nhận', description: 'Phụ thuộc luồng phê duyệt dòng giá' });
    expectMoney(d.savedAmount, 1_000_000, 'Đơn giá đã lưu');
    expectMoney(d.currentAmount, 1_100_000, 'Đơn giá hiện tại');
    expect(d.changed).toBe(true);

  });
});
