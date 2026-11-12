/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import type { P0Refs } from '../../../src/core/fixtures/test-run.fixture';
import { env } from '../../../src/core/env';
import { p0Base, orderBody, revenueOf, revenueTable, uploadVehicleDoc, vehicleDocs, type P0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { confirmLegsBody } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costLines, costs } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import ExcelJS from 'exceljs';
import * as fs from 'node:fs';
import * as path from 'node:path';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Xuyên suốt: RC đang hiệu lực → Phiếu dịch vụ đủ 5 dịch vụ → Điều phối → Hoàn thành → Tổng hợp chi phí, P&L và xác nhận doanh thu", () => {
  // Các case trong file chạy tuần tự trên đúng một YCBG/BGNB/BGKH P0 và một Phiếu dịch vụ.
  // Trạng thái Phiếu còn được lưu theo TEST_RUN_ID để worker mới sau một case fail vẫn dùng đúng bản ghi.
  test.describe.configure({ mode: 'default', timeout: 600_000 });

  let flowOrder: P0Order | undefined;
  let flowRefs: P0Refs | undefined;
  const flowStateFile = path.resolve(__dirname, '../../../.auth/xuyen-module-flow-state.json');
  const persistFlow = (): void => {
    if (!flowOrder || !flowRefs) throw new Error('Không thể lưu trạng thái luồng khi chưa có Phiếu và danh mục P0');
    fs.mkdirSync(path.dirname(flowStateFile), { recursive: true });
    fs.writeFileSync(flowStateFile, JSON.stringify({ runId: TEST_RUN_ID, order: flowOrder, refs: flowRefs }, null, 2), 'utf8');
  };
  const restoreFlow = (): void => {
    if (flowOrder && flowRefs) return;
    if (!fs.existsSync(flowStateFile)) throw new Error('Thiếu Phiếu dùng chung: phải chạy FLOW-E2E-001 trước các case tiếp theo');
    const saved = JSON.parse(fs.readFileSync(flowStateFile, 'utf8')) as { runId?: string; order?: P0Order; refs?: P0Refs };
    if (saved.runId !== TEST_RUN_ID) throw new Error('Phiếu dùng chung thuộc lượt chạy cũ; cần chạy FLOW-E2E-001 của lượt hiện tại');
    if (!saved.order || !saved.refs) throw new Error('Trạng thái Phiếu dùng chung không đầy đủ');
    flowOrder = saved.order;
    flowRefs = saved.refs;
  };
  const currentOrder = (): P0Order => {
    restoreFlow();
    if (!flowOrder) throw new Error('Thiếu Phiếu dùng chung: phải chạy FLOW-E2E-001 trước các case tiếp theo');
    test.info().annotations.push({ type: 'Bản ghi dùng chung', description: `${flowOrder.code} / ${flowOrder.id}` });
    return flowOrder;
  };
  const currentRefs = (): P0Refs => {
    restoreFlow();
    if (!flowRefs) throw new Error('Thiếu danh mục P0 dùng chung từ FLOW-E2E-001');
    return flowRefs;
  };

  const nameOf = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.name;
  const line = (table: any, k: P0ItemKey) => (table?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes(nameOf(k)));

  test("FLOW-E2E-001 Tạo phiếu đủ 5 dịch vụ và gửi điều phối", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    flowRefs = refs;
    const r3 = await http.call('GET /api/service-orders/selectable-customers', { token: tok('k1'), query: { perPage: 100 } });
    expectStatusIn(r3, '200/201/204');
    const customer = items(await data(r3)).find((c) => c.id === base.customerId);
    expect(customer, 'KH_A chọn được để lập phiếu').toBeTruthy();
    const customerContractId = customer.contracts?.[0]?.id;
    expect(customerContractId, 'KH_A có hợp đồng hiệu lực để lập phiếu').toBeTruthy();
    const payload = await orderBody(testRun, base, { customerContractId });
    const r4 = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: false }, json: payload });
    const error = r4.ok() ? '' : (await body(r4))?.message ?? '';
    expectStatusIn(r4, '200/201/204', error);
    const created = await data(r4);
    await uploadVehicleDoc(testRun, created.id, samplePdf('so-thong-hanh-xe-giao-1.pdf'), 'HANDOVER', 0);
    await uploadVehicleDoc(testRun, created.id, samplePdf('so-thong-hanh-xe-nhan-1.pdf'), 'RECEIVER', 0);
    expectStatusIn(await http.call('POST /api/service-orders/{id}/submit', {
      token: tok('k1'), params: { id: created.id },
    }), '200/201/204', 'gửi phiếu sau khi đã đủ chứng từ xe');
    flowOrder = {
      id: created.id,
      code: created.code,
      base,
      svc: Object.fromEntries(SERVICE_KEYS.map((key) => [key, { id: created.id, type: refs.services[key] }])) as P0Order['svc'],
    };
    persistFlow();
    test.info().annotations.push({ type: 'Bản ghi dùng chung', description: `${created.code} / ${created.id}` });
    const r5 = await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: created.id } });
    expectStatusIn(r5, '200/201/204');
    expect(await data(r5)).toMatchObject({ status: 'SUBMITTED', customerContractId });
    const r6 = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: created.id } });
    expectStatusIn(r6, '200/201/204');
    const tables = (await data(r6)).items ?? [];
    for (const s of SERVICE_KEYS) {
      const t = revenueTable(tables, refs.services[s]);
      expect(t, `Có bảng doanh thu ${s}`).toBeTruthy();
      expect(t.lines.every((l: any) => /FIXED|CO_DINH/i.test(String(l.priceTypeCode ?? 'FIXED')) || /Cố định/i.test(String(l.priceTypeName ?? ''))), `${s}: chỉ dòng Cố định`).toBe(true);
      expectMoney(t.total, P0.fixedRevenue[s], `Doanh thu ước tính ${s}`);
      expect(t.estimated, `${s}: doanh thu là ước tính`).toBe(true);
    }
    await expect.poll(async () => {
      const r7 = await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 50 } });
      expectStatusIn(r7, '200/201/204');
      return JSON.stringify(await data(r7));
    }, { timeout: 30_000, message: 'CC có thông báo phiếu mới' }).toContain(created.code);

  });

  test("FLOW-E2E-002 CC tiếp nhận và xác nhận chặng", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const r3 = await http.call('GET /api/k3/service-orders', { token: tok('cc'), query: { search: o.code, perPage: 20 } });
    expectStatusIn(r3, '200/201/204');
    expect(JSON.stringify(await data(r3)), 'Phiếu có ở Tháp điều phối').toContain(o.code);
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/accept', { token: tok('cc'), params: { id: o.id } }), '200/201/204');
    const r5 = await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r5, '200/201/204');
    const preview = await data(r5);
    const payload = confirmLegsBody(preview);
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('cc'), params: { id: o.id }, json: payload }), '200/201/204');
    const r7 = await http.call('GET /api/k3/service-orders/{id}', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r7, '200/201/204');
    const k3 = await data(r7);
    expect(k3.order.status).toBe('ACCEPTED');
    const codesOf = (leg: any) => (leg?.services ?? []).map((s: any) => typeof s === 'string' ? s : s.code ?? s.serviceTypeCode).filter(Boolean);
    const legs = [...(k3.legs ?? [])].sort((a: any, b: any) => a.position - b.position);
    const expected = new Map<number, string[]>((preview.legs ?? []).filter((leg: any) => !leg.empty).map((leg: any) => [leg.position, codesOf(leg)]));
    if (preview.hasWarehousing) {
      const position = preview.warehouseLegPosition ?? 1;
      expected.set(position, [...(expected.get(position) ?? []), refs.services.KB]);
    }
    expect(legs, 'Số chặng sau xác nhận khớp preview').toHaveLength(expected.size);
    for (const leg of legs) {
      expect(codesOf(leg).sort(), `Dịch vụ Chặng ${leg.position} khớp preview`).toEqual([...(expected.get(leg.position) ?? [])].sort());
    }
    const r8 = await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r8, '200/201/204');
    const mine = await data(r8);
    expect((mine.legs ?? []).length, 'K1 thấy dịch vụ dạng chặng').toBe(2);
    expect(JSON.stringify(mine.availableActions ?? []), 'K1 không còn nút Chỉnh sửa').not.toMatch(/EDIT|UPDATE/i);

  });

  test("FLOW-E2E-003 Điều phối KHQ cho NT_A thành công", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const A = env.ref('CONTRACTOR_A_ID');
    const r3 = await http.call('GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { token: tok('dp'), params: { id: o.id, type: o.svc.KHQ.type } });
    expectStatusIn(r3, '200/201/204');
    const assignment = { priceConfigurationItemId: o.base.items.customsFee.id, contractorId: A, unitCode: refs.units.customsFee };
    expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: { id: o.id, type: o.svc.KHQ.type }, json: { assignments: [assignment] } }), '200/201/204');
  });

  test("FLOW-E2E-004 Bắt đầu KHQ; phiếu và dịch vụ chuyển Đang thực hiện", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: { id: o.id, type: o.svc.KHQ.type } }), '200/201/204');
    const r4 = await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r4, '200/201/204');
    const started = await data(r4);
    expect(started.status, 'Phiếu tổng chuyển Đang thực hiện khi KHQ bắt đầu').toBe('IN_PROGRESS');
    expect(started.services.find((s: any) => s.serviceTypeCode === refs.services.KHQ)?.status, 'Dịch vụ KHQ Đang thực hiện').toBe('IN_PROGRESS');
    const r5 = await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: o.id }, json: { reason: 'Khách đổi kế hoạch giao hàng' } });
    expectStatusIn(r5, '400/409/422');
    await expectApiError(r5);
    const after = await data(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } }));
    expect(after.status, 'K1 không hủy được phiếu đã có dịch vụ Đang thực hiện (BR_ORD_20)').toBe('IN_PROGRESS');
    expect(after.services.find((s: any) => s.serviceTypeCode === refs.services.KHQ)?.status, 'KHQ vẫn Đang thực hiện sau yêu cầu hủy bị chặn').toBe('IN_PROGRESS');

  });

  test("FLOW-E2E-005 Thêm phụ phí và chi phí phát sinh KHQ", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const A = env.ref('CONTRACTOR_A_ID');
    const P = { id: o.id, type: o.svc.KHQ.type };
    const r3 = await http.call('GET /api/k3/service-orders/{id}/services/{type}/cost-items', { token: tok('dp'), params: P, query: { contractorId: A, perPage: 200 } });
    expectStatusIn(r3, '200/201/204');
    const ot = items(await data(r3)).find((x: any) => x.priceConfigurationItemId === o.base.items.overtime.id);
    expect(ot, 'NT_A có dòng giá Phí ngoài giờ').toBeTruthy();
    const r4 = await http.call('GET /api/k3/service-orders/{id}/services/{type}/variance-items', { token: tok('dp'), params: P });
    expectStatusIn(r4, '200/201/204');
    const variance = items(await data(r4))[0];
    expect(variance?.id, 'API trả đầu mục Phát sinh đang hoạt động của KHQ').toBeTruthy();
    o.varianceItemId = variance.id;
    o.varianceItemName = variance.name;
    o.varianceUnitCode = refs.units.customsFee;
    const r5 = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: { contractorId: A, kind: 'SURCHARGE', purchasePriceItemId: ot.purchasePriceItemId, unitCode: refs.units.overtime, quantity: 1, amount: P0.overtimeCost, currency: 'VND' } });
    expectStatusIn(r5, '200/201/204');
    o.overtimeLineId = (await data(r5))?.id;
    const r6 = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: variance.id, unitCode: o.varianceUnitCode, quantity: 1, amount: P0.storageFeeCost, currency: 'VND' } });
    expectStatusIn(r6, '200/201/204');
    const addedVariance = await data(r6);
    o.shiftLineId = addedVariance?.id ?? addedVariance?.costLineId;
    if (!o.shiftLineId) o.shiftLineId = (await costLines(testRun, o.svc.KHQ)).find((row: any) => row.priceConfigurationItemId === variance.id)?.costLineId;
    expect(o.shiftLineId, 'Có id dòng chi phí Phát sinh KHQ vừa thêm').toBeTruthy();
    persistFlow();
    const r7 = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P });
    expectStatusIn(r7, '200/201/204');
    expectMoney((await data(r7)).totalConverted, P0.khqCost, 'Tổng chi KHQ');
    const r8 = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r8, '200/201/204');
    const t = revenueTable((await data(r8)).items ?? [], refs.services.KHQ);
    expectMoney(line(t, 'overtime')?.amount, P0.overtimeRevenue, 'Doanh thu Phí ngoài giờ (có trong RC)');
    const varianceRevenue = (t?.lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    expectMoney(varianceRevenue?.amount, P0.storageFeeCost, 'Doanh thu phát sinh sao theo chi phí');
    expectMoney(t.total, P0.khqRevenueBeforeEdit, 'Doanh thu KHQ');

  });

  test("FLOW-E2E-006 KHQ thiếu dữ liệu bị chặn, bổ sung đủ thực tế và chứng từ", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const P = { id: o.id, type: o.svc.KHQ.type };
    const r3 = await http.call('GET /api/k3/service-orders/{id}/services/{type}/completion-check', { token: tok('dp'), params: P });
    expectStatusIn(r3, '200/201/204');
    const r4 = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: P });
    expectStatusIn(r4, '400/409/422');
    await expectApiError(r4);
    expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: P, json: actualsBody(refs, 'KHQ') }), '200/201/204');
    const uploaded = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: P, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('REAL.pdf10.pdf') } });
    expectStatusIn(uploaded, '200/201/204');
    expect((await data(uploaded))?.documentIds?.length, 'API đã lưu Chứng từ lô hàng KHQ').toBeGreaterThan(0);
    expect((await vehicleDocs(testRun, o.id, 'HANDOVER', 0)).length, 'Xe giao có Chứng từ kèm theo xe (Số thông hành)').toBeGreaterThan(0);
    const r7 = await http.call('GET /api/k3/service-orders/{id}/services/{type}/completion-check', { token: tok('dp'), params: P });
    expectStatusIn(r7, '200/201/204');
    expect((await data(r7)).ok, 'Đủ thông tin thực tế và chứng từ').toBe(true);
    const order = await data(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } }));
    expect(order.services.find((s: any) => s.serviceTypeCode === P.type)?.status, 'KHQ vẫn Đang thực hiện để K1 còn sửa được doanh thu').toBe('IN_PROGRESS');

  });

  test("FLOW-E2E-007 K1 sửa doanh thu phát sinh khi KHQ đang thực hiện, sau đó hoàn thành KHQ", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    expect((await vehicleDocs(testRun, o.id, 'HANDOVER', 0)).length, 'Đã có Số thông hành Xe giao trước khi sửa doanh thu').toBeGreaterThan(0);
    const ready = await http.call('GET /api/k3/service-orders/{id}/services/{type}/completion-check', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(ready, '200/201/204');
    expect((await data(ready)).ok, 'KHQ đã đủ thực tế, Chứng từ lô hàng và Số thông hành').toBe(true);
    const before = revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ);
    const shift = (before?.lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    expect(shift?.costLineId, `Có dòng doanh thu Phát sinh KHQ ${o.varianceItemName ?? ''}`).toBeTruthy();
    const r3 = await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: shift.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: P0.storageFeeRevenueEdited }] } });
    expectStatusIn(r3, '200/201/204');
    const r4 = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r4, '200/201/204');
    const t = revenueTable((await data(r4)).items ?? [], refs.services.KHQ);
    expectMoney(t.total, P0.khqRevenueAfterEdit, 'Doanh thu KHQ sau khi sửa');
    const edited = (t?.lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    expectMoney(edited?.amount, P0.storageFeeRevenueEdited, `Dòng phát sinh ${o.varianceItemName}`);
    expect(edited?.manuallyEdited).toBe(true);
    expectMoney((await costs(testRun, { id: o.id, type: refs.services.KHQ })).totalConverted, P0.khqCost, 'Chi phí KHQ giữ nguyên');
    const r5 = await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { page: 1, perPage: 50 } });
    expectStatusIn(r5, '200/201/204');
    const h = JSON.stringify(await data(r5));
    expect(h, 'Lịch sử có giá trị trước').toMatch(/200[.,]?000/);
    expect(h, 'Lịch sử có giá trị sau').toMatch(/250[.,]?000/);
    const P = { id: o.id, type: o.svc.KHQ.type };
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: P }), '200/201/204');
    const svc = (await data(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } }))).services.find((s: any) => s.serviceTypeCode === P.type);
    expect(svc.status, 'KHQ Đã thực hiện').toBe('PERFORMED');
    const locked = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: P, json: { contractorId: env.ref('CONTRACTOR_A_ID'), kind: 'VARIANCE', priceConfigurationItemId: o.varianceItemId, unitCode: o.varianceUnitCode, quantity: 1, amount: 100_000, currency: 'VND' } });
    expectStatusIn(locked, '400/409/422', 'chi phí KHQ bị khóa sau hoàn thành');
    expectMoney((await costs(testRun, P)).totalConverted, P0.khqCost, 'Chi phí KHQ bị khóa, không đổi');

  });

  test("FLOW-E2E-008 Điều phối và hoàn thành HQGS, KB trong Chặng 1", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const A = env.ref('CONTRACTOR_A_ID');
    for (const [s, k] of [['HQGS', 'supervision'], ['KB', 'storage']] as [ServiceKey, P0ItemKey][]) {
      const P = { id: o.id, type: refs.services[s] };
      expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: P, json: { assignments: [{ priceConfigurationItemId: o.base.items[k].id, contractorId: A, unitCode: refs.units[k] }] } }), '200/201/204', s);
      expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: P }), '200/201/204', s);
      expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: P, json: actualsBody(refs, s) }), '200/201/204', s);
      expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: P, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('REAL.pdf10.pdf') } }), '200/201/204', s);
      expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: P }), '200/201/204', s);
    }
    const order = await data(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } }));
    for (const s of ['HQGS', 'KB'] as ServiceKey[]) expect(order.services.find((x: any) => x.serviceTypeCode === refs.services[s]).status, `${s} Đã thực hiện`).toBe('PERFORMED');
    const tables = await revenueOf(testRun, o.id);
    expectMoney(revenueTable(tables, refs.services.HQGS).total, P0.serviceRevenue.HQGS, 'Doanh thu HQGS');
    expectMoney(revenueTable(tables, refs.services.KB).total, P0.serviceRevenue.KB, 'Doanh thu KB');

  });

  test("FLOW-E2E-009 Sang tải: điều phối, bắt đầu, cần xe nhận từ Vận tải; lưu thực tế VT ở mốc Điều phối trước", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const ST = { id: o.id, type: refs.services.ST };
    const VT = { id: o.id, type: refs.services.VT };
    const st = actualsBody(refs, 'ST') as Record<string, unknown>;
    expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: VT, json: { assignments: [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: B, unitCode: refs.units.freight, routeIndex: 0 }], fxRates: { USD: P0.fxUsd } } }), '200/201/204', 'điều phối VT');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: VT }), '200/201/204', 'bắt đầu VT để nhập Xe nhận cho Sang tải');
    const vtActuals = actualsBody(refs, 'VT') as any;
    expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: VT, json: { receiverVehicles: vtActuals.receiverVehicles } }), '200/201/204', 'lưu đầy đủ Xe nhận VT cho Sang tải');
    expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: tok('dp'), params: ST, json: { assignments: [{ priceConfigurationItemId: o.base.items.transload.id, contractorId: A, unitCode: refs.units.transload }] } }), '200/201/204', 'điều phối ST');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: tok('dp'), params: ST }), '200/201/204', 'bắt đầu ST');
    expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: ST, json: st }), '200/201/204', 'cặp xe ST');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: ST, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('REAL.pdf10.pdf') } }), '200/201/204', 'chứng từ ST');
    const chk = await http.call('GET /api/k3/service-orders/{id}/services/{type}/completion-check', { token: tok('dp'), params: ST });
    expectStatusIn(chk, '200/201/204');
    expect((await data(chk)).missing ?? [], 'completion-check rỗng').toEqual([]);
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: ST }), '200/201/204', 'hoàn thành ST');
    expectMoney((await costs(testRun, ST)).totalConverted, 1_200_000, 'Chi phí ST');
    const k3 = await data(await http.call('GET /api/k3/service-orders/{id}', { token: tok('cc'), params: { id: o.id } }));
    const leg1 = [...(k3.legs ?? [])].sort((a: any, b: any) => a.position - b.position)[0];
    expect(String(leg1?.status?.code ?? leg1?.status), 'Chặng 1 xong').toMatch(/PERFORMED|DONE|COMPLETED/);

  });

  test("FLOW-E2E-010 Hoàn thành Vận tải đã bắt đầu, phiếu Đã thực hiện", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const VT = { id: o.id, type: refs.services.VT };
    const before = await data(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } }));
    expect(before.services.find((s: any) => s.serviceTypeCode === VT.type)?.status, 'VT đã Đang thực hiện từ FLOW-E2E-009').toBe('IN_PROGRESS');
    expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: VT, json: actualsBody(refs, 'VT') }), '200/201/204');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: VT, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('POD-REAL.pdf10.pdf') } }), '200/201/204');
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: VT }), '200/201/204');
    const r7 = await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r7, '200/201/204');
    expect((await data(r7)).status, 'P0 Đã thực hiện').toBe('PERFORMED');
    const r8 = await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), query: { perPage: 100 }, params: { id: o.id } });
    expectStatusIn(r8, '200/201/204');
    const log = items(await data(r8));
    expect(log.length, 'Nhật ký Tháp có các mốc tiếp nhận, điều phối, bắt đầu, hoàn thành').toBeGreaterThanOrEqual(5);
    expectMoney((await costs(testRun, VT)).totalConverted, P0.serviceCost.VT, 'Chi phí VT 400 USD × 25.000');

  });

  test("FLOW-E2E-011 Áp tỷ giá phiếu và đọc P&L", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const r3 = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: P0.fxUsd, cnyRate: P0.fxCny } });
    expectStatusIn(r3, '200/201/204');
    const r4 = await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r4, '200/201/204');
    expectMoney((await data(r4)).usdRate, P0.fxUsd, 'Tỷ giá USD');
    const r5 = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r5, '200/201/204');
    const k = (await data(r5)).kpi;
    expectMoney(k.revenue, P0.orderRevenue, 'kpi.revenue');
    expectMoney(k.cost, P0.orderCost, 'kpi.cost');
    expectMoney(k.profit, P0.orderPnl, 'kpi.profit');
    expectPercent(k.marginPercent, P0.orderMarginDetailPct, 1, 'kpi.marginPercent');
    expect(k.margin, 'An toàn').toBe('SAFE');
    const tables = await revenueOf(testRun, o.id);
    const rev = (s: ServiceKey) => Number(revenueTable(tables, refs.services[s]).convertedTotal ?? revenueTable(tables, refs.services[s]).total);
    const cost = async (s: ServiceKey) => Number((await costs(testRun, { id: o.id, type: refs.services[s] })).totalConverted);
    expectMoney(rev('VT') - (await cost('VT')), 1_000_000, 'Lợi nhuận VT');
    const leg1 = ['KHQ', 'HQGS', 'ST', 'KB'] as ServiceKey[];
    expectMoney(leg1.reduce((a, s) => a + rev(s), 0), 4_900_000, 'Doanh thu Chặng 1');
    let c1 = 0;
    for (const s of leg1) c1 += await cost(s);
    expectMoney(c1, 4_000_000, 'Chi phí Chặng 1');

  });

  test("FLOW-E2E-012 Tổng hợp chi phí – doanh thu của phiếu khớp P&L", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const r3 = await http.call('GET /api/service-orders/{id}/cost-revenue-summary', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r3, '200/201/204');
    const sum = await data(r3);
    expectMoney(sum.totalCost, P0.orderCost, 'totalCost');
    expectMoney(sum.totalRevenue, P0.orderRevenueWithVat, 'totalRevenue gồm VAT 8%');
    const r4 = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r4, '200/201/204');
    expectMoney((await data(r4)).kpi.revenue, P0.orderRevenue, 'Trước VAT khớp kpi.revenue');
    expectMoney(P0.orderRevenueWithVat - P0.orderRevenue, P0.orderRevenueVat, 'VAT 1.272.000');
    const r5 = await http.call('GET /api/service-orders/{id}/revenue', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r5, '200/201/204');
    const tables = (await data(r5)).items ?? [];
    const margin: Record<ServiceKey, number> = { KHQ: 300_000, HQGS: 200_000, VT: 1_000_000, ST: 300_000, KB: 100_000 };
    for (const s of SERVICE_KEYS) {
      const t = revenueTable(tables, refs.services[s]);
      const c = Number((await costs(testRun, { id: o.id, type: refs.services[s] })).totalConverted);
      expectMoney(Number(t.convertedTotal ?? t.total) - c, margin[s], `Lãi gộp ${s}`);
    }

  });

  test("FLOW-E2E-013 Đối soát và K5 xác nhận doanh thu", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const r3 = await http.call('GET /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r3, '200/201/204');
    const rc = await data(r3);
    expect(rc.confirmable, 'Đối soát cho phép xác nhận').toBe(true);
    expectMoney(rc.grandTotal, P0.orderRevenueWithVat, 'grandTotal');
    const before = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expectStatusIn(await http.call('POST /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } }), '200/201/204');
    const r5 = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r5, '200/201/204');
    const p = await data(r5);
    expect(p.revenueConfirmed).toBe(true);
    const me = await data(await http.call('GET /api/auth/me', { token: tok('cc') }));
    const ccNames = [me?.fullName, me?.name, me?.displayName, me?.email, testRun.roles.cc.email].filter(Boolean).map(String);
    expect(ccNames.some((n) => String(p.confirmedBy ?? '').includes(n) || n.includes(String(p.confirmedBy ?? '-'))), `Người xác nhận là CC (${p.confirmedBy})`).toBe(true);
    expect(p.kpi, 'Số liệu P&L không đổi').toEqual(before);
    const r6 = await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r6, '200/201/204');
    expect((await data(r6)).status, 'P0 Hoàn thành').toBe('COMPLETED');

  });

  test("FLOW-E2E-014 Sau xác nhận mọi số liệu bị khóa", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const r3 = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: P0.fxUsdAlt, cnyRate: P0.fxCny } });
    expectStatusIn(r3, '400/409/422', 'đổi tỷ giá');
    await expectApiError(r3);
    const t = revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ);
    const shift = (t?.lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    const r4 = await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: shift?.costLineId ?? o.shiftLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 300_000 }] } });
    expectStatusIn(r4, '400/409/422', 'sửa doanh thu');
    await expectApiError(r4);
    const r5 = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { contractorId: env.ref('CONTRACTOR_A_ID'), kind: 'VARIANCE', priceConfigurationItemId: o.varianceItemId, unitCode: o.varianceUnitCode, quantity: 1, amount: 100_000, currency: 'VND' } });
    expectStatusIn(r5, '400/409/422', 'thêm chi phí');
    await expectApiError(r5);
    const r6 = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r6, '200/201/204');
    const k = (await data(r6)).kpi;
    expectMoney(k.revenue, P0.orderRevenue, 'Doanh thu không đổi');
    expectMoney(k.cost, P0.orderCost, 'Chi phí không đổi');

  });

  test("FLOW-E2E-015 Phiếu xuất hiện ở báo cáo Chi phí – Doanh thu với số liệu khớp", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const o = currentOrder();
    const refs = currentRefs();

    const r3 = await http.call('GET /api/cost-revenue/orders', { token: tok('cc'), query: { search: o.code, perPage: 20 } });
    expectStatusIn(r3, '200/201/204');
    const row = items(await data(r3)).find((x: any) => x.serviceOrderId === o.id || x.code === o.code);
    expect(row, 'P0 có trong danh sách Chi phí – Doanh thu').toBeTruthy();
    expectMoney(row.revenue, P0.orderRevenue, 'Doanh thu');
    expectMoney(row.cost, P0.orderCost, 'Chi phí');
    expectPercent(row.marginPercent, P0.orderMarginListPct, 2, 'Lợi nhuận %');
    const r4 = await http.call('GET /api/cost-revenue/orders/stats', { token: tok('cc'), query: { search: o.code } });
    expectStatusIn(r4, '200/201/204');
    const st = await data(r4);
    expectMoney(st.totalRevenue, P0.orderRevenue, 'stats doanh thu');
    expectMoney(st.totalCost, P0.orderCost, 'stats chi phí');
    const r5 = await http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json: { orderIds: [o.id] } });
    expectStatusIn(r5, '200/201/204');
    const readXlsx = async (buf: Buffer) => {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buf as unknown as ArrayBuffer);
      const rows: string[] = [];
      wb.worksheets[0].eachRow((r) => rows.push(JSON.stringify(r.values)));
      return rows.join('\n');
    };
    let fileText = '';
    if (/sheet|excel|octet/i.test(r5.headers()['content-type'] ?? '')) fileText = await readXlsx(await r5.body());
    else {
      const job = await data(r5);
      expect(job?.id, 'Xuất chạy nền trả mã lượt xuất').toBeTruthy();
      await expect.poll(async () => String((await data(await http.call('GET /api/cost-revenue/exports/{id}', { token: tok('cc'), params: { id: job.id } })))?.status ?? ''), { timeout: 60_000 }).toMatch(/DONE|COMPLETED|READY|SUCCE/i);
      fileText = await readXlsx(await (await http.call('GET /api/cost-revenue/exports/{id}/file', { token: tok('cc'), params: { id: job.id } })).body());
    }
    expect(fileText, 'File xuất có mã P0').toContain(o.code);
    expect(fileText.replace(/[.,\s]/g, ''), 'File xuất cùng số doanh thu').toContain('15900000');
    expect(fileText.replace(/[.,\s]/g, ''), 'File xuất cùng số chi phí').toContain('14000000');
    const r6 = await http.call('GET /api/service-orders/{id}/pnl/export', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(r6, '200/201/204');
    expect((await r6.body()).length, 'File P&L của phiếu có nội dung').toBeGreaterThan(0);

  });
});
