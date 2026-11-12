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
  test("K3S-035 Tab Chi phí của dịch vụ", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '200');
    const c = await data(res);
    expect(c.contractors, '1 khối NT_A').toHaveLength(1);
    expect(c.contractors[0].contractorId).toBe(A);
    expect(c.contractors[0].lines, '3 dòng').toHaveLength(3);
    expectMoney(c.totalConverted, P0.khqCost, 'totalConverted');
    expect(['NORMAL', 'APPROVED', 'PENDING'], 'badge chi phí').toContain(c.costBadge);

  });

  test("K3S-036 Chưa điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KB } });
    expectStatusIn(res, '200');
    expect((await data(res)).contractors ?? [], 'Chưa có dữ liệu chi phí').toHaveLength(0);

  });

  test("K3S-041 Phụ phí từ giá mua của nhà thầu", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/cost-items', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { contractorId: A, perPage: 200 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const ot = list.find((x: any) => x.priceConfigurationItemId === o.base.items.overtime.id);
    expect(ot, 'Có Phí ngoài giờ').toBeTruthy();
    expectMoney(ot.unitPrice, 300_000, 'Phí ngoài giờ 300.000');
    expect(ot.unitCode).toBe(refs.units.overtime);
    expect(list.some((x: any) => x.priceConfigurationItemId === o.base.items.customsFee.id), 'Chỉ đầu mục Phụ phí').toBe(false);

  });

  test("K3S-042 Phụ phí không khớp thuộc tính bị loại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `O${TEST_RUN_ID}`);
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const otherOffice = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice);
    await must(await http.call('PUT /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: base.sheetA }, json: { added: [{ priceConfigurationItemId: base.items.overtime.id, unitCode: refs.units.overtime, unitPrice: 333_000, customsOfficeCodes: [otherOffice.code], tradeTypeCodes: [refs.tradeType], cargoGroupCodes: [refs.cargoGroup], vehicleTypeCodes: [refs.vehicleType] }] } }), 'thêm phụ phí cho chi cục khác');
    const o = await p0Order(testRun, 'IN_PROGRESS', { base });
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/cost-items', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { contractorId: A, perPage: 200 } });
    expectStatusIn(res, '200');
    expect(items(await data(res)).some((x: any) => Number(x.unitPrice) === 333_000), 'Không có dòng chi cục khác').toBe(false);

  });

  test("K3S-052 Thêm phụ phí và chi phí phát sinh", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const P = { id: o.id, type: refs.services.KHQ };
    const ot = await costItem(testRun, o.svc.KHQ, A, o.base.items.overtime.id);
    const sur = { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, priceConfigurationItemId: o.base.items.overtime.id, unitCode: refs.units.overtime, quantity: 1, amount: 300_000, currency: 'VND' };
    const vari = { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 200_000, currency: 'VND' };

    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: sur }), '200/201', 'phụ phí');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: vari }), '200/201', 'phát sinh');
    const c = await costs(testRun, o.svc.KHQ);
    expect((c.contractors ?? []).flatMap((x: any) => x.lines ?? []), '3 dòng chi phí').toHaveLength(3);
    expectMoney(c.totalConverted, 1_500_000, 'Tổng chi KHQ');
    const t = revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ);
    expectMoney(t.total, 1_750_000, 'Doanh thu KHQ (phụ phí có trong RC + phát sinh sao theo chi phí)');

  });

  test("K3S-053 Không đổi được đơn giá phụ phí", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const P = { id: o.id, type: refs.services.KHQ };
    const ot = await costItem(testRun, o.svc.KHQ, A, o.base.items.overtime.id);
    const sur = { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, priceConfigurationItemId: o.base.items.overtime.id, unitCode: refs.units.overtime, quantity: 1, amount: 300_000, currency: 'VND' };
    const vari = { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 200_000, currency: 'VND' };

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: { ...sur, amount: 350_000 } });
    expectStatusIn(res, '200/400');
    const line = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.overtime);
    if (res.status() === 200) expectMoney(line.unitPrice, 300_000, 'Đơn giá phụ phí giữ theo giá mua');
    else expect(line, 'Không thêm dòng sai đơn giá').toBeUndefined();

  });

  test("K3S-054 Phụ phí không có trong RC thì doanh thu null", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await runService(testRun, o, 'HQGS');
    const before = Number((await costs(testRun, o.svc.HQGS)).totalConverted);
    const it = await costItem(testRun, o.svc.HQGS, A, o.base.items.seal.id);
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.HQGS }, json: { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: it.purchasePriceItemId, priceConfigurationItemId: o.base.items.seal.id, unitCode: refs.units.seal, quantity: 1, amount: 150_000, currency: 'VND' } });
    expectStatusIn(res, '200/201');
    expectMoney(Number((await costs(testRun, o.svc.HQGS)).totalConverted) - before, 150_000, 'Chi phí HQGS tăng');
    const ln = (revenueTable(await revenueOf(testRun, o.id), refs.services.HQGS).lines ?? []).find((l: any) => String(l.itemName ?? '').includes('Phí kẹp chì'));
    expect(ln?.amount ?? null, 'Doanh thu dòng đó null').toBeNull();

  });

  test("K3S-055 Dịch vụ Đã thực hiện bị khóa", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 100_000, currency: 'VND' } });
    expectStatusIn(res, '400/409/422');
    expectMoney((await costs(testRun, o.svc.KHQ)).totalConverted, P0.khqCost, 'Bảng chi phí read-only');

  });

  test("K3S-056 Phát sinh tiền tệ khác báo giá quy đổi sang tiền báo giá", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 10, currency: 'USD', fxRate: 25_000 } });
    expectStatusIn(res, '200/201');
    const id = (await data(res))?.id;
    const ln = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => l.costLineId === id);
    expectMoney(ln.amount, 250_000, 'Doanh thu phát sinh 10 USD × 25.000');

  });

  test("K3S-067 Không gửi đơn giá làm mới thì giữ giá cũ", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `R${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'IN_PROGRESS', { base });
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
    const fee = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    const PUTC = (lines: unknown[], extra: Record<string, unknown> = {}, who: string = A) => http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: who }, json: { currency: 'VND', lines, ...extra } });

    const res = await PUTC([{ costLineId: fee.costLineId, unitCode: refs.units.customsFee, quantity: 1, unitPrice: 1_000_000 }]);
    expectStatusIn(res, '200/204');
    expectMoney((await costLines(testRun, o.svc.KHQ)).find((l) => l.costLineId === fee.costLineId).unitPrice, 1_000_000, 'Đơn giá giữ 1.000.000 (chỉ ghi nhận khi lưu)');

  });

  test("K3S-068 Doanh thu Cố định không đổi khi chi phí đổi", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `R${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'IN_PROGRESS', { base });
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    await changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
    const fee = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    const PUTC = (lines: unknown[], extra: Record<string, unknown> = {}, who: string = A) => http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: who }, json: { currency: 'VND', lines, ...extra } });

    const res = await PUTC([{ costLineId: fee.costLineId, unitCode: refs.units.customsFee, quantity: 1, unitPrice: 1_100_000 }]);
    expectStatusIn(res, '200/204');
    const ln = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => String(l.itemName ?? '').includes('Phí khai báo'));
    expectMoney(ln.amount, 1_150_000, 'Doanh thu vẫn 1.150.000');

  });

  test("K3S-069 Xóa dòng phụ phí trong lô", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const all = await costLines(testRun, o.svc.KHQ);
    const ot = all.find((l) => l.unitCode === refs.units.overtime);
    const keep = all.filter((l) => l.costLineId !== ot.costLineId).map((l) => ({ costLineId: l.costLineId, unitCode: l.unitCode, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) }));
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: A }, json: { currency: 'VND', lines: keep, removedLineIds: [ot.costLineId] } });
    expectStatusIn(res, '200/204');
    expect((await costLines(testRun, o.svc.KHQ)).some((l) => l.costLineId === ot.costLineId), 'Chi phí phụ phí biến mất').toBe(false);
    expect((revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).some((l: any) => l.costLineId === ot.costLineId), 'Doanh thu phụ phí biến mất').toBe(false);

  });

  test("K3S-077 Xóa dòng phụ phí/phát sinh", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const shift = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.shiftStorage);

    const res = await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: shift.costLineId } });
    expectStatusIn(res, '200/204');
    expectMoney((await costs(testRun, o.svc.KHQ)).totalConverted, P0.khqCost - 200_000, 'Tổng chi giảm 200.000');
    expect((revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).some((l: any) => l.costLineId === shift.costLineId), 'Doanh thu dòng phát sinh mất').toBe(false);

  });

  test("K3S-078 Không xóa chi phí gốc (Cố định)", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const shift = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.shiftStorage);

    const fee = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    const res = await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: fee.costLineId } });
    expectStatusIn(res, '400/409/422');
    expect((await costLines(testRun, o.svc.KHQ)).some((l) => l.costLineId === fee.costLineId), 'Chi phí gốc không xóa được').toBe(true);

  });

  test("K3S-086 Dòng giá không còn hợp lệ", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await buildP0(testRun, `V${TEST_RUN_ID}`);
    const o = await p0Order(testRun, 'KHQ_COORDINATED', { base });
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const fee = (await costLines(testRun, o.svc.KHQ))[0];
    await must(await http.call('POST /api/purchase-prices/{id}/deactivate', { token: tok('k1'), params: { id: base.sheetA } }), 'ngừng bảng giá NT_A');
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: fee.costLineId } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expectMoney((await costLines(testRun, o.svc.KHQ))[0].unitPrice, 1_000_000, 'Giữ đơn giá cũ');

  });

  test("K3S-087 Giá không đổi", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const fee = (await costLines(testRun, o.svc.KHQ))[0];
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: fee.costLineId } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expectMoney(d.currentAmount, 1_000_000, 'Giá như cũ');
    expect(d.changed).toBe(false);

  });

  test("K3S-088 Dòng Phụ phí/Phát sinh không có làm mới giá", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const shift = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.shiftStorage);

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: shift.costLineId } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);

  });

  test("K3S-047 Đầu mục Phát sinh của dịch vụ", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/variance-items', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.some((x: any) => x.id === o.base.items.shiftStorage.id), 'Có đầu mục Phát sinh KHQ đang hoạt động').toBe(true);
    expect(list.some((x: any) => [o.base.items.customsFee.id, o.base.items.overtime.id].includes(x.id)), 'Chỉ đầu mục Phát sinh').toBe(false);

  });

  test("K3S-058 P&L chỉ cộng chi phí khi dịch vụ Đã thực hiện", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    for (const k of ['HQGS', 'KB'] as ServiceKey[]) {
      await runService(testRun, o, k);
      await saveActuals(testRun, o.svc[k], actualsBody(refs, k));
      await uploadActualDoc(testRun, o.svc[k]);
      await completeService(testRun, o.svc[k]);
    }
    const before = Number((await pnl(testRun, o.id)).kpi.cost);
    const ot = await costItem(testRun, o.svc.KHQ, A, o.base.items.overtime.id);
    const P = { id: o.id, type: refs.services.KHQ };
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, priceConfigurationItemId: o.base.items.overtime.id, unitCode: refs.units.overtime, quantity: 1, amount: 300_000, currency: 'VND' } }), '200/201/204', 'phụ phí');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 200_000, currency: 'VND' } }), '200/201/204', 'phát sinh');
    const mid = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(mid, '200/201/204');
    expectMoney((await data(mid)).kpi.cost, before, 'Trước hoàn thành KHQ: kpi.cost chưa có KHQ');
    await saveActuals(testRun, o.svc.KHQ, actualsBody(refs, 'KHQ'));
    await uploadActualDoc(testRun, o.svc.KHQ);
    await completeService(testRun, o.svc.KHQ);
    const after = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(after, '200/201/204');
    expectMoney(Number((await data(after)).kpi.cost) - before, P0.khqCost, 'Sau hoàn thành: cộng KHQ 1.500.000');

  });

  test("K3S-071 Dịch vụ Đã thực hiện", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const before = stable(await costs(testRun, o.svc.KHQ));
    const lines = (await costLines(testRun, o.svc.KHQ)).map((l) => ({ costLineId: l.costLineId, unitCode: l.unitCode, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) + 1 }));
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: A }, json: { currency: 'VND', lines } });
    expectStatusIn(res, '400/409/422');
    expect(stable(await costs(testRun, o.svc.KHQ)), 'Khóa').toEqual(before);

  });

  test("K3S-081 Doanh thu đã sửa tay của dòng bị xóa", { tag: ["@api", "@thap-dieu-phoi", "@p2", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');

    const shift = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.shiftStorage);

    await must(await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: shift.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }] } }), 'K1 sửa doanh thu Phát sinh KHQ 250.000');
    const res = await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: shift.costLineId } });
    expectStatusIn(res, '200/204');
    expectMoney((await costs(testRun, o.svc.KHQ)).totalConverted, P0.khqCost - 200_000, 'Tổng chi KHQ giảm 200.000');
    const still = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).some((l: any) => l.costLineId === shift.costLineId);
    test.info().annotations.push({ type: 'Chờ xác nhận', description: `Dòng doanh thu đã sửa tay ${still ? 'còn lại' : 'mất theo chi phí'}` });
    expect(still, 'Giả định 1:1: dòng doanh thu sửa tay mất theo chi phí').toBe(false);

  });

  test("K3S-173 Xóa dòng chi phí khi dịch vụ đã Đã thực hiện", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const shift = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.shiftStorage);
    const res = await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: shift.costLineId } });
    expectStatusIn(res, '400/409/422');
    expect((await costLines(testRun, o.svc.KHQ)).some((l) => l.costLineId === shift.costLineId), 'Dòng chi phí còn nguyên').toBe(true);
    const ln = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => l.costLineId === shift.costLineId);
    expectMoney(ln.amount, 200_000, 'Doanh thu dòng tương ứng không đổi');

  });
});
