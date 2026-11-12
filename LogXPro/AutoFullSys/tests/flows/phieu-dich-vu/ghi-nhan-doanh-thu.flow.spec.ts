/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { env } from '../../../src/core/env';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as K3 from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import * as CCF from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import * as BGK from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as PNLF from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as GM from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import * as YC from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import * as GB from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Quy tắc ghi nhận doanh thu phiếu dịch vụ theo chi phí và dòng giá", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-REV-001 R1: Có chi phí và dòng giá Đang hiệu lực → doanh thu = SL × đơn giá chốt", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-001');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'KHQ_COORDINATED', { base });
    const fee = lineNamed(await rev(o.id, 'KHQ'), 'customsFee');
    expect(fee, 'Có dòng Phí khai báo').toBeTruthy();
    expect(Number(fee.quantity), 'SL 1').toBe(1);
    expectMoney(fee.unitPrice, P0.customsFeeAgreed, 'Đơn giá chốt');
    expectMoney(fee.amount, P0.customsFeeAgreed, 'Doanh thu = SL × đơn giá chốt');
    expect(fee.quotationExpired, 'quotationExpired = false').toBe(false);

  });

  test("FLOW-REV-002 R1b: Chưa có chi phí thì đầu mục Phụ phí chưa có doanh thu", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-002');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'KHQ_COORDINATED', { base });
    expect(lineNamed(await rev(o.id, 'KHQ'), 'overtime'), 'Chưa có chi phí thì Phụ phí chưa có doanh thu').toBeUndefined();

  });

  test("FLOW-REV-003 R2: Có chi phí nhưng RC không có dòng giá cho đầu mục → null", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-003');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'ACCEPTED', { base });
    await ORD.runService(testRun, o, 'HQGS');
    await ORD.addSealCost(testRun, o);
    const seal = lineNamed(await rev(o.id, 'HQGS'), 'seal');
    expect(seal, 'Có dòng Phí kẹp chì').toBeTruthy();
    expect(seal.amount ?? null, 'Doanh thu Phí kẹp chì null').toBeNull();
    const k0 = await kpi(o.id);
    expectMoney(k0.cost ?? 0, 0, 'HQGS Đang thực hiện: P&L chưa có số HQGS');
    await finish(o, 'HQGS');
    const k1 = await kpi(o.id);
    expectMoney(k1.cost, 950_000, 'Chi phí HQGS = 800.000 + 150.000');
    expectMoney(k1.revenue, 1_000_000, 'Doanh thu HQGS 1.000.000 (không cộng Phí kẹp chì)');

  });

  test("FLOW-REV-004 R3: Dòng giá Hết hạn tại thời điểm có chi phí → null", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-004');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'ACCEPTED', { base });
    await PF.changeSelling(testRun, base, 'transload', 1_600_000);
    const cq = await PF.expired(testRun, rc, base, 'transload');
    expect((cq.sourceSheets ?? []).find((s: any) => s.serviceTypeCode === refs.services.ST)?.disabled, 'Biểu giá ST Disable').toBe(true);
    await ORD.runService(testRun, o, 'ST', false);
    const ln = lineNamed(await rev(o.id, 'ST'), 'transload');
    expect(ln.amount ?? null, 'Doanh thu ST null').toBeNull();
    expect(ln.quotationExpired, 'quotationExpired = true').toBe(true);

  });

  test("FLOW-REV-005 R3b: Doanh thu đã ghi nhận trước khi dòng giá Hết hạn thì giữ nguyên", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-005');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'ACCEPTED', { base });
    await ORD.runService(testRun, o, 'VT', false);
    expectMoney((await rev(o.id, 'VT')).total, 11_000_000, 'Tiền điều kiện: doanh thu VT 11.000.000');
    await PF.changeSelling(testRun, base, 'freight', 11_500_000);
    expectMoney((await rev(o.id, 'VT')).total, 11_000_000, 'Doanh thu VT vẫn 11.000.000');

  });

  test("FLOW-REV-006 R4: Đồng ý BGKH bổ sung cập nhật đầu mục chưa có doanh thu", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-006');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'KHQ_COORDINATED', { base });
    await PF.changeSelling(testRun, base, 'transload', 1_600_000);
    await ORD.runService(testRun, o, 'ST', false);
    expect(lineNamed(await rev(o.id, 'ST'), 'transload').amount ?? null, 'Tiền điều kiện: ST null').toBeNull();
    const v0 = Number((await rc()).version);
    await PF.quote(testRun, base, { keys: ['customsFee', 'transload'], sourceQuotationId: base.rcId, customer: 'active' });
    expect(Number((await rc()).version), 'RC_R version tăng').toBeGreaterThan(v0);
    expectMoney(lineNamed(await rev(o.id, 'ST'), 'transload').amount, 1_600_000, 'Doanh thu ST = 1.600.000');
    expectMoney(lineNamed(await rev(o.id, 'KHQ'), 'customsFee').amount, P0.customsFeeAgreed, 'KHQ giữ 1.150.000');

  });

  test("FLOW-REV-007 R4b: BGKH bổ sung không có dòng cho đầu mục thì vẫn null", { tag: ["@flow", "@phieu-dich-vu", "@p2"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-007');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'ACCEPTED', { base });
    await ORD.runService(testRun, o, 'HQGS');
    await ORD.addSealCost(testRun, o);
    await PF.quote(testRun, base, { keys: ['storage'], sourceQuotationId: base.rcId, customer: 'active' });
    expect(lineNamed(await rev(o.id, 'HQGS'), 'seal').amount ?? null, 'Phí kẹp chì vẫn null').toBeNull();
    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Bản bổ sung dùng biểu giá Kho bãi của bộ P0 riêng (không có SSP Kho đông lạnh trong dữ liệu kiểm thử)' });

  });

  test("FLOW-REV-008 R5: Doanh thu phát sinh sao theo chi phí, quy đổi về tiền báo giá; đã sửa tay thì K3 đổi chi phí không ghi đè (AC5)", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-008');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'IN_PROGRESS', { base });
    const A = env.ref('CONTRACTOR_A_ID');
    const Bc = env.ref('CONTRACTOR_B_ID');
    await K3.coordinate(testRun, o.svc.KHQ, [{ priceConfigurationItemId: base.items.customsFee.id, contractorId: A, unitCode: refs.units.customsFee }], { USD: 25_000 });
    const id = await K3.addCost(testRun, o.svc.KHQ, { contractorId: Bc, kind: 'VARIANCE', priceConfigurationItemId: base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 10, currency: 'USD' });
    const lineId = id ?? (await K3.costLines(testRun, o.svc.KHQ)).find((l: any) => l.contractorId === Bc)?.costLineId;
    const revLine = async () => ((await rev(o.id, 'KHQ')).lines ?? []).find((l: any) => l.costLineId === lineId);
    expectMoney((await revLine()).amount, 250_000, 'Bước 4: 10 USD × 25.000');
    const setUsd = (usd: number) => http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: Bc }, json: { currency: 'USD', lines: [{ costLineId: lineId, unitCode: refs.units.shiftStorage, quantity: 1, unitPrice: usd }] } });
    expectStatusIn(await setUsd(12), '200/201/204', 'K3 đổi chi phí 12 USD');
    expectMoney((await revLine()).amount, 300_000, 'Bước 6: tự theo chi phí 12 USD × 25.000');
    expectStatusIn(await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: lineId, unitCode: refs.units.shiftStorage, quantity: 1, unitPrice: 280_000 }] } }), '200/201/204', 'K1 sửa 280.000');
    expectStatusIn(await setUsd(14), '200/201/204', 'K3 đổi chi phí 14 USD');
    const last = await revLine();
    expectMoney(last.amount, 280_000, 'Bước 9: đã sửa tay thì không ghi đè');
    expect(last.manuallyEdited, 'manuallyEdited = true').toBe(true);

  });

  test("FLOW-REV-009 R6: Đơn giá bán khóa theo RC khi chi phí đổi", { tag: ["@flow", "@phieu-dich-vu", "@p2", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-009');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'IN_PROGRESS', { base });
    await GM.changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, 1_100_000, true);
    const fee = (await K3.costLines(testRun, o.svc.KHQ)).find((l: any) => l.unitCode === refs.units.customsFee);
    const cur = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: fee.costLineId } }));
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: env.ref('CONTRACTOR_A_ID') }, json: { currency: 'VND', lines: [{ costLineId: fee.costLineId, unitCode: fee.unitCode, quantity: Number(fee.quantity), unitPrice: Number(cur?.currentAmount ?? 1_100_000) }] } });
    expectStatusIn(res, '200/201/204', 'Làm mới giá 1.100.000');
    test.info().annotations.push({ type: 'Chờ xác nhận', description: 'Phụ thuộc chức năng phê duyệt dòng giá (POST /items/approve)' });
    expectMoney(lineNamed(await rev(o.id, 'KHQ'), 'customsFee').amount, P0.customsFeeAgreed, 'Doanh thu Phí khai báo vẫn 1.150.000');

  });

  test("FLOW-REV-010 R7: Chi phí bị xóa thì doanh thu tương ứng mất", { tag: ["@flow", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-010');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'KHQ_COSTS', { base });
    const r0 = Number((await rev(o.id, 'KHQ')).total);
    const c0 = Number((await K3.costs(testRun, o.svc.KHQ)).totalConverted);
    const res = await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: o.overtimeLineId! } });
    expectStatusIn(res, '200/201/204');
    const t = await rev(o.id, 'KHQ');
    expect(lineNamed(t, 'overtime'), 'Dòng doanh thu Phí ngoài giờ biến mất').toBeUndefined();
    expectMoney(r0 - Number(t.total), P0.overtimeRevenue, 'Doanh thu giảm 400.000');
    expectMoney(c0 - Number((await K3.costs(testRun, o.svc.KHQ)).totalConverted), P0.overtimeCost, 'Chi phí giảm 300.000');

  });

  test("FLOW-REV-011 Số lượng khác 1: KHQ 2 tờ khai đi hết tới báo cáo", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-011');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'FX_APPLIED', { base, editShift: true, actuals: { KHQ: { declarationCount: 2 } } });
    const fee = (await K3.costLines(testRun, o.svc.KHQ)).find((l: any) => l.unitCode === refs.units.customsFee);
    expectMoney(Number(fee.quantity) * Number(fee.unitPrice), 2_000_000, 'Chi phí Phí khai báo 2 × 1.000.000');
    expectMoney(lineNamed(await rev(o.id, 'KHQ'), 'customsFee').amount, 2_300_000, 'Doanh thu Phí khai báo 2 × 1.150.000');
    const k = await kpi(o.id);
    expectMoney(k.revenue, 17_050_000, 'Doanh thu phiếu');
    expectMoney(k.cost, 15_000_000, 'Chi phí phiếu');
    expectMoney(k.profit, 2_050_000, 'Lợi nhuận');
    expectPercent(k.marginPercent, 12.0, 1, 'Margin');
    const conf = await data(await http.call('GET /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } }));
    expectMoney(conf.vatAmount, 1_364_000, 'VAT');
    expectMoney(conf.grandTotal, 18_414_000, 'Sau VAT');
    const row = items(await data(await http.call('GET /api/cost-revenue/orders', { token: tok('cc'), query: { search: o.code } }))).find((r: any) => r.serviceOrderId === o.id);
    expectMoney(row.revenue, 17_050_000, 'Danh sách cùng số');
    expectPercent(row.marginPercent, 12.02, 2, 'Báo cáo 12,02%');
    const xl = await http.call('GET /api/service-orders/{id}/pnl/export', { token: tok('cc'), params: { id: o.id } });
    expect(PNLF.numbersIn((await PNLF.readXlsx(await xl.body())).rows), 'File Excel cùng số').toEqual(expect.arrayContaining([17_050_000, 15_000_000]));

  });

  test("FLOW-REV-012 Khôi phục doanh thu Sang tải bằng BGKH bổ sung rồi quyết toán K5", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-012');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'COMPLETED', {
      base, editShift: true,
      before: {
        CHANG1_DONE: async () => { await PF.changeSelling(testRun, base, 'transload', 1_600_000); },
        PERFORMED: async () => { await PF.quote(testRun, base, { keys: ['customsFee', 'transload'], sourceQuotationId: base.rcId, customer: 'active' }); },
      },
    });
    expectMoney(lineNamed(await rev(o.id, 'ST'), 'transload').amount, 1_600_000, 'ST = 1.600.000');
    expectMoney(lineNamed(await rev(o.id, 'KHQ'), 'customsFee').amount, P0.customsFeeAgreed, 'KHQ giữ 1.150.000');
    const k = await kpi(o.id);
    expectMoney(k.revenue, 16_000_000, 'Doanh thu');
    expectMoney(k.cost, 14_000_000, 'Chi phí');
    expectMoney(k.profit, 2_000_000, 'Lãi');
    expectPercent(k.marginPercent, 12.5, 1, 'Margin');
    const conf = await data(await http.call('GET /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } }));
    expectMoney(conf.vatAmount, 1_280_000, 'VAT');
    expectMoney(conf.grandTotal, 17_280_000, 'Tổng');
    const xl = await http.call('GET /api/service-orders/{id}/pnl/export', { token: tok('cc'), params: { id: o.id } });
    expect(PNLF.numbersIn((await PNLF.readXlsx(await xl.body())).rows), 'File xuất cùng số').toEqual(expect.arrayContaining([16_000_000, 14_000_000]));

  });

  test("FLOW-REV-013 Bổ sung lần 2 không ghi đè đầu mục đã có doanh thu", { tag: ["@flow", "@phieu-dich-vu", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-013');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    await PF.changeSelling(testRun, base, 'transload', 1_600_000);
    const o = await ORD.p0Order(testRun, 'IN_PROGRESS', { base });
    await ORD.runService(testRun, o, 'ST', false);
    await PF.quote(testRun, base, { keys: ['transload'], sourceQuotationId: base.rcId, customer: 'active' });
    expectMoney(lineNamed(await rev(o.id, 'ST'), 'transload').amount, 1_600_000, 'Tiền điều kiện: ST 1.600.000 từ bổ sung lần 1');
    const v1 = Number((await rc()).version);
    await PF.changeSelling(testRun, base, 'transload', 1_700_000);
    await PF.quote(testRun, base, { keys: ['transload'], sourceQuotationId: base.rcId, customer: 'active' });
    expect(Number((await rc()).version), 'RC gốc lên phiên bản mới').toBeGreaterThan(v1);
    expectMoney(lineNamed(await rev(o.id, 'ST'), 'transload').amount, 1_600_000, 'Doanh thu ST vẫn 1.600.000');

  });

  test("FLOW-REV-014 Chưa hoàn thành dịch vụ thì P&L chưa có số liệu dịch vụ đó", { tag: ["@flow", "@phieu-dich-vu", "@p2"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-REV-014');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const o = await ORD.p0Order(testRun, 'ACCEPTED', { base });
    await ORD.runService(testRun, o, 'HQGS');
    await ORD.addSealCost(testRun, o);
    expectMoney((await K3.costs(testRun, o.svc.HQGS)).totalConverted, 950_000, 'Tab chi phí có số');
    expect(Number((await rev(o.id, 'HQGS')).total), 'Tab doanh thu có số').toBeGreaterThan(0);
    expectMoney((await kpi(o.id)).cost ?? 0, 0, 'P&L chưa cộng HQGS');

  });
});
