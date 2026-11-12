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
  test("ORD-090 Bảng doanh thu từng dịch vụ", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const t = revenueTable((await data(res)).items ?? [], refs.services.KHQ);
    const ln = (n: string) => (t.lines ?? []).find((l: any) => String(l.itemName ?? '').includes(n));
    const variance = (t.lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    expect([Number(ln('Phí khai báo').quantity), Number(ln('Phí khai báo').unitPrice)], 'Phí khai báo 1 × 1.150.000').toEqual([1, 1_150_000]);
    expect([Number(ln('Phí ngoài giờ').quantity), Number(ln('Phí ngoài giờ').unitPrice)], 'Phí ngoài giờ 1 × 400.000').toEqual([1, 400_000]);
    expect([Number(variance.quantity), Number(variance.unitPrice)], 'Phát sinh KHQ 1 × 200.000').toEqual([1, 200_000]);
    expectMoney(t.total, 1_750_000, 'Tổng trước VAT');
    expectMoney(t.vatAmount, 140_000, 'VAT 8%');
    expectMoney(t.grandTotal, 1_890_000, 'Tổng sau VAT');

  });

  test("ORD-091 Phụ phí không có trong RC thì doanh thu null", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    await runService(testRun, o, 'HQGS');
    await addSealCost(testRun, o);
    const res = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const seal = (revenueTable((await data(res)).items ?? [], refs.services.HQGS).lines ?? []).find((l: any) => String(l.itemName ?? '').includes('Phí kẹp chì'));
    expect(seal, 'Có dòng Phí kẹp chì').toBeTruthy();
    expect(seal.amount ?? null, 'Doanh thu null (hiển thị —)').toBeNull();
    expect(seal.costLineId, 'Dòng có chi phí').toBeTruthy();

  });

  test("ORD-092 Dòng giá Hết hạn tại thời điểm có chi phí thì null", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `X${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'ACCEPTED', { base });
    const refs = await testRun.p0Refs();
    await must(await http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: tok('cc'), params: { id: base.ssp.transload! }, json: { sellingPrice: 1_600_000 } }), 'đổi SSP Phí sang tải làm dòng ST Hết hạn');
    await runService(testRun, o, 'ST', false);
    const res = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const ln = (revenueTable((await data(res)).items ?? [], refs.services.ST).lines ?? []).find((l: any) => String(l.itemName ?? '').includes('Phí sang tải'));
    expect(ln?.quotationExpired, 'ST quotationExpired').toBe(true);
    expect(ln.amount ?? null, 'Số tiền null').toBeNull();

  });

  test("ORD-093 Chưa có chi phí thì doanh thu là ước tính", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const res = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    for (const t of (await data(res)).items ?? []) for (const l of t.lines ?? []) expect(l.estimated, `${t.serviceTypeCode} ${l.itemName} là ước tính`).toBe(true);

  });

  test("ORD-094 Dòng gộp là đơn vị doanh thu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const q = await extraQuote(testRun, { mergeKhq: true });
    const refs = await testRun.p0Refs();
    const orderBase = { customerId: q.base.customerId, rcId: q.rcId };
    const declarationCount = 2;
    const payload = await orderBody(testRun, orderBase, {}, ['KHQ']);
    const [khq] = payload.services as Record<string, unknown>[];
    payload.services = [{ ...khq, declarationCount }];
    const o = await createOrder(testRun, orderBase, { submit: true, body: payload });
    const res = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const t = revenueTable((await data(res)).items ?? [], refs.services.KHQ);
    expect(t.lines, 'KHQ là 1 dòng gộp').toHaveLength(1);
    expect((t.lines[0].mergedItemNames ?? []).length, 'Có mergedItemNames').toBeGreaterThanOrEqual(2);
    expect(t.lines[0].unitCode, 'ĐVT dòng gộp là Tờ khai').toBe(refs.units.customsFee);
    expect(t.lines[0].quantity, 'SL ước tính lấy từ số tờ khai, theo ĐVT dòng gộp').toBe(declarationCount);
    expect(t.lines[0].estimated).toBe(true);

  });

  test("ORD-099 Áp tỷ giá doanh thu cho dịch vụ RC USD", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const q = await extraQuote(testRun, { currency: 'USD', fxRate: 25_000 });
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, { customerId: q.base.customerId, rcId: q.rcId }, { submit: true });
    const VT = refs.services.VT;

    const res = await http.call('PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: VT }, json: { source: 'MANUAL', fxRate: 25_000 } });
    expectStatusIn(res, '200/204');
    const t = revenueTable(await revenueOf(testRun, o.id), VT);
    expectMoney(t.total, 440, 'Thành tiền VT 440 USD');
    expectMoney(t.convertedTotal, 11_000_000, 'Quy đổi 440 × 25.000');
    expect(t.fxRateOverridden).toBe(true);
    if (res.status() === 200) expect(Array.isArray((await data(res))?.items), 'Trả bảng doanh thu tính lại').toBe(true);

  });

  test("ORD-100 Nguồn tỷ giá theo báo giá", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = await extraQuote(testRun, { currency: 'USD', fxRate: 25_450 });
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, { customerId: q.base.customerId, rcId: q.rcId }, { submit: true });
    const res = await http.call('PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.VT }, json: { source: 'QUOTE' } });
    expectStatusIn(res, '200/204');
    const t = revenueTable(await revenueOf(testRun, o.id), refs.services.VT);
    expect(Number(t.quoteFxRate)).toBe(25_450);
    expect(Number(t.fxRate), 'Quy đổi theo 25.450').toBe(25_450);
    expectMoney(t.convertedTotal, Math.round(Number(t.total) * 25_450), 'Thành tiền quy đổi');

  });

  test("ORD-101 Khóa sau khi xác nhận doanh thu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'COMPLETED');
    const refs = await testRun.p0Refs();
    const before = stable(await revenueOf(testRun, o.id));
    const res = await http.call('PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.VT }, json: { source: 'MANUAL', fxRate: 26_000 } });
    expectStatusIn(res, '400/409/422');
    expect(stable(await revenueOf(testRun, o.id)), 'Không đổi').toEqual(before);

  });

  test("ORD-102 Dịch vụ RC VND", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const refs = await testRun.p0Refs();
    const res = await http.call('PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.VT }, json: { source: 'MANUAL', fxRate: 2 } });
    expectStatusIn(res, '400/409/422');
    expect(Number(revenueTable(await revenueOf(testRun, o.id), refs.services.VT).fxRate ?? 1), 'VND luôn tỷ giá 1').toBe(1);

  });

  test("ORD-109 K1 sửa doanh thu dòng Phát sinh", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;
    const shift = () => revenueOf(testRun, o.id).then((ts) => (revenueTable(ts, KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId));
    const edit = (lines: unknown[], role: 'k1' | 'k1b' = 'k1') => http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok(role), params: { id: o.id, serviceTypeCode: KHQ }, json: { lines } });

    const s = await shift();
    const res = await edit([{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }]);
    expectStatusIn(res, '200/204');
    const t = revenueTable(await revenueOf(testRun, o.id), KHQ);
    const after = (t.lines ?? []).find((l: any) => l.costLineId === s.costLineId);
    expectMoney(after.amount, 250_000, `Dòng Phát sinh KHQ ${o.varianceItemName ?? ''}`);
    expect(after.manuallyEdited).toBe(true);
    expectMoney(t.total, 1_800_000, 'Tổng KHQ trước VAT');
    const h = JSON.stringify(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { perPage: 100 } })));
    expect(h, 'Lịch sử trước → sau').toMatch(/200[.,]?000[\s\S]*250[.,]?000|250[.,]?000[\s\S]*200[.,]?000/);

  });

  test("ORD-110 Không sửa được dòng Cố định/Phụ phí", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;
    const shift = () => revenueOf(testRun, o.id).then((ts) => (revenueTable(ts, KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId));
    const edit = (lines: unknown[], role: 'k1' | 'k1b' = 'k1') => http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok(role), params: { id: o.id, serviceTypeCode: KHQ }, json: { lines } });

    const fee = (revenueTable(await revenueOf(testRun, o.id), KHQ).lines ?? []).find((l: any) => String(l.itemName ?? '').includes('Phí khai báo'));
    const before = stable(await revenueOf(testRun, o.id));
    const res = await edit([{ costLineId: fee.costLineId, unitCode: refs.units.customsFee, quantity: 1, unitPrice: 999_000 }]);
    expectStatusIn(res, '400/409/422');
    expect(stable(await revenueOf(testRun, o.id)), 'Không đổi').toEqual(before);

  });

  test("ORD-111 SL ≤ 0, đơn giá âm, thiếu ĐVT", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;
    const shift = () => revenueOf(testRun, o.id).then((ts) => (revenueTable(ts, KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId));
    const edit = (lines: unknown[], role: 'k1' | 'k1b' = 'k1') => http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok(role), params: { id: o.id, serviceTypeCode: KHQ }, json: { lines } });

    const s = await shift();
    const before = stable(await revenueOf(testRun, o.id));
    const cases = [
      { field: 'quantity', message: 'Số lượng phải lớn hơn 0.', over: { quantity: 0 } },
      { field: 'unitPrice', message: 'Đơn giá không hợp lệ.', over: { unitPrice: -1 } },
      { field: 'unitCode', message: 'Vui lòng chọn đơn vị tính.', over: { unitCode: '' } },
    ];
    for (const { field, message, over } of cases) {
      const res = await edit([{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000, ...over }]);
      expectStatusIn(res, '400/422', field);
      const error = await expectApiError(res);
      expectOnlyFieldError(error, field);
      expect(JSON.stringify(error), field).toContain(JSON.stringify(message));
      expect(stable(await revenueOf(testRun, o.id)), `Không lưu khi ${field} sai`).toEqual(before);
    }

  });

  test("ORD-112 K3 sửa chi phí sau đó không ghi đè doanh thu đã sửa tay", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const KHQ = refs.services.KHQ;
    const shift = () => revenueOf(testRun, o.id).then((ts) => (revenueTable(ts, KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId));
    const edit = (lines: unknown[], role: 'k1' | 'k1b' = 'k1') => http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok(role), params: { id: o.id, serviceTypeCode: KHQ }, json: { lines } });

    const s = await shift();
    const r1 = await edit([{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }]);
    expectStatusIn(r1, '200/201/204', 'K1 sửa 250.000');
    const A = env.ref('CONTRACTOR_A_ID');
    const lines = (await costLines(testRun, o.svc.KHQ)).filter((l) => l.contractorId === A).map((l) => ({ costLineId: l.costLineId, unitCode: l.unitCode, quantity: Number(l.quantity), unitPrice: l.costLineId === s.costLineId ? 300_000 : Number(l.unitPrice) }));
    const r2 = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: KHQ, contractorId: A }, json: { currency: 'VND', lines } });
    expectStatusIn(r2, '200/201/204', 'DP sửa chi phí 300.000');
    const r3 = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: KHQ } });
    expectStatusIn(r3, '200/201/204');
    const cost = ((await data(r3)).contractors ?? []).flatMap((x: any) => x.lines ?? []).find((l: any) => l.costLineId === s.costLineId);
    expectMoney(cost.unitPrice, 300_000, 'Chi phí Phát sinh KHQ đọc lại');
    const r4 = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r4, '200/201/204');
    const rev = (revenueTable((await data(r4)).items ?? [], KHQ).lines ?? []).find((l: any) => l.costLineId === s.costLineId);
    expectMoney(rev.amount, 250_000, 'Doanh thu Phát sinh KHQ giữ giá sửa tay');
    expect(rev.manuallyEdited).toBe(true);

  });

  test("ORD-113 Sửa ở phiếu Hoàn thành", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'COMPLETED');
    const refs = await testRun.p0Refs();
    const s = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    const before = stable(await revenueOf(testRun, o.id));
    const res = await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 260_000 }] } });
    expectStatusIn(res, '400/409/422');
    expect(stable(await revenueOf(testRun, o.id)), 'Khóa vĩnh viễn').toEqual(before);

  });

  test("ORD-114 Sửa ở phiếu Đã tiếp nhận", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const before = stable(await revenueOf(testRun, o.id));
    const res = await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: uuid(), unitCode: refs.units.shiftStorage, quantity: 1, unitPrice: 250_000 }] } });
    expectStatusIn(res, '400/409/422');
    expect(stable(await revenueOf(testRun, o.id)), 'Doanh thu không đổi').toEqual(before);

  });

  test("ORD-121 Tổng hợp chi phí – doanh thu của phiếu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED', { editShift: true });
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/service-orders/{id}/cost-revenue-summary', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const s = await data(res);
    expectMoney(s.totalCost, P0.orderCost, 'totalCost');
    expectMoney(s.totalRevenue, P0.orderRevenueWithVat, 'totalRevenue gồm VAT 8%');
    const legs = [...(s.legs ?? [])].sort((a: any, b: any) => a.position - b.position);
    const codesOf = (l: any) => (l?.services ?? []).map((x: any) => x.code ?? x.serviceTypeCode).sort();
    expect(codesOf(legs[0])).toEqual([refs.services.KHQ, refs.services.HQGS, refs.services.ST, refs.services.KB].sort());
    expect(codesOf(legs[1])).toEqual([refs.services.VT]);
    const tables = await revenueOf(testRun, o.id);
    for (const k of SERVICE_KEYS) {
      const rev = Number(revenueTable(tables, refs.services[k]).convertedTotal ?? revenueTable(tables, refs.services[k]).total);
      const c = Number((await costs(testRun, o.svc[k])).totalConverted);
      expectMoney(rev - c, P0.serviceRevenue[k] - P0.serviceCost[k], `Lãi gộp ${k} = doanh thu − chi phí`);
    }

  });

  test("ORD-122 Đầu mục có ở doanh thu mà không có chi phí", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/service-orders/{id}/cost-revenue-summary', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const t = revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ);
    expect((t.lines ?? []).some((l: any) => String(l.itemName ?? '').includes('Phí ngoài giờ')), 'Không có dòng doanh thu Phí ngoài giờ chưa phát sinh chi phí').toBe(false);
    expectMoney((await data(res)).totalRevenue, Math.round(P0.customsFeeAgreed * 1.08), 'Tổng doanh thu chỉ gồm dòng có chi phí (Phí khai báo, gồm VAT)');

  });

  test("ORD-123 Phiếu chưa có chi phí", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const res = await http.call('GET /api/service-orders/{id}/cost-revenue-summary', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const s = await data(res);
    expectMoney(s.totalCost ?? 0, 0, 'Tổng chi phí 0');
    const est = (await revenueOf(testRun, o.id)).every((t: any) => t.estimated === true || Number(t.total ?? 0) === 0);
    expect(est, 'Doanh thu là ước tính hoặc 0').toBe(true);

  });

  test("ORD-128 Đối soát trước xác nhận doanh thu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED', { editShift: true });
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(d.services).toHaveLength(5);
    for (const k of SERVICE_KEYS) expectMoney(d.services.find((s: any) => s.serviceTypeCode === refs.services[k]).total, P0.serviceRevenue[k], `Doanh thu ${k}`);
    expectMoney(d.total, P0.orderRevenue, 'total');
    expectMoney(d.vatAmount, P0.orderRevenueVat, 'vatAmount');
    expectMoney(d.grandTotal, P0.orderRevenueWithVat, 'grandTotal');
    expect(d.confirmable).toBe(true);
    expect(d.blockers ?? []).toEqual([]);

  });

  test("ORD-129 Phiếu chưa Đã thực hiện có lý do chặn", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const res = await http.call('GET /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(d.confirmable).toBe(false);
    expect((d.blockers ?? []).length, 'Có lý do chặn nêu dịch vụ chưa hoàn thành').toBeGreaterThan(0);

  });

  test("ORD-130 Còn dòng doanh thu null", { tag: ["@api", "@phieu-dich-vu", "@p2", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    await runService(testRun, o, 'HQGS');
    await addSealCost(testRun, o);
    const res = await http.call('GET /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    test.info().annotations.push({ type: 'Chờ xác nhận', description: `Phiếu có dòng doanh thu null: confirmable=${d.confirmable}, blockers=${JSON.stringify(d.blockers)}` });
    expect(Array.isArray(d.blockers ?? []), 'Trả danh sách lý do/cảnh báo').toBe(true);

  });

  test("ORD-135 K5 xác nhận doanh thu, phiếu Hoàn thành", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED', { editShift: true });
    const res = await http.call('POST /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, o.id)).status).toBe('COMPLETED');
    const p = await pnl(testRun, o.id);
    expect(p.revenueConfirmed).toBe(true);
    expect(p.fxRate?.locked, 'Chốt tỷ giá').toBe(true);
    expect(String(p.confirmedBy ?? '').length, 'confirmedBy = CC').toBeGreaterThan(0);
    expect(p.confirmedAt, 'confirmedAt có giá trị').toBeTruthy();
    expectMoney(p.kpi.revenue, P0.orderRevenue, 'P&L chốt');

  });

  test("ORD-136 Tài khoản không có quyền Xác nhận doanh thu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED');
    const res = await http.call('POST /api/service-orders/{id}/revenue-confirmation', { token: tok('sale'), params: { id: o.id } });
    expectStatusIn(res, '403');
    expect((await getOrder(testRun, o.id)).status, 'Giữ PERFORMED').toBe('PERFORMED');
    expect((await pnl(testRun, o.id)).confirmedBy ?? null, 'Không ghi người xác nhận').toBeNull();

  });

  test("ORD-137 Xác nhận doanh thu khi phiếu Đang thực hiện", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const res = await http.call('POST /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '400/409/422');
    const after = await getOrder(testRun, o.id);
    expect(after.status, 'Phiếu tổng vẫn Đang thực hiện').toBe('IN_PROGRESS');
    expect(after.services.some((s: any) => s.status === 'IN_PROGRESS'), 'Vẫn có dịch vụ Đang thực hiện').toBe(true);

  });

  test("ORD-138 Sau xác nhận không đổi tỷ giá, chi phí, doanh thu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED');
    const refs = await testRun.p0Refs();
    expectStatusIn(await http.call('POST /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } }), '200/204', 'xác nhận');
    const before = await pnl(testRun, o.id);
    expectStatusIn(await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 26_000, cnyRate: 3_600 } }), '400/409/422', 'đổi tỷ giá');
    const s = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    expectStatusIn(await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 270_000 }] } }), '400/409/422', 'sửa doanh thu');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { contractorId: env.ref('CONTRACTOR_A_ID'), kind: 'VARIANCE', priceConfigurationItemId: o.varianceItemId, unitCode: o.varianceUnitCode, quantity: 1, amount: 100_000, currency: 'VND' } }), '400/409/422', 'thêm chi phí');
    const after = await pnl(testRun, o.id);
    expect(after.kpi, 'Số liệu giữ nguyên').toEqual(before.kpi);
    expect(after.revenueConfirmed).toBe(true);

  });

  test("ORD-104 Tỷ giá 0 với MANUAL", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = await extraQuote(testRun, { currency: 'USD', fxRate: 25_000 });
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, { customerId: q.base.customerId, rcId: q.rcId }, { submit: true });
    const VT = refs.services.VT;

    const before = stable(revenueTable(await revenueOf(testRun, o.id), VT));
    const res = await http.call('PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}', { token: tok('k1'), params: { id: o.id, serviceTypeCode: VT }, json: { source: 'MANUAL', fxRate: 0 } });
    expectStatusIn(res, '400/422');
    expect(stable(revenueTable(await revenueOf(testRun, o.id), VT)), 'Không đổi').toEqual(before);

  });

  test("ORD-116 P&L phiếu tính lại", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const s = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    const before = (await pnl(testRun, o.id)).kpi.revenue;
    const res = await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }] } });
    expectStatusIn(res, '200/204');
    const r2 = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } });
    expect(r2.status()).toBe(200);
    expectMoney(Number((await data(r2)).kpi.revenue) - Number(before), 50_000, 'kpi.revenue tăng đúng 50.000');

  });

  test("ORD-233 Sửa khi phiếu đã Đã thực hiện", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'PERFORMED');
    const refs = await testRun.p0Refs();
    const s = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    const before = stable(await revenueOf(testRun, o.id));
    const pnlBefore = stable((await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi);
    const res = await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }] } });
    expectStatusIn(res, '400/409/422');
    expect(stable(await revenueOf(testRun, o.id)), 'Doanh thu không đổi').toEqual(before);
    expect(stable((await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi), 'P&L không đổi').toEqual(pnlBefore);

  });
});
