import { costs } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { getOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { editedP0 } from '../../../src/phieu-dich-vu/data/operations-ui';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, blockedUnless, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens, markIncomplete } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, extraQuote, revenueOf, revenueTable, runService, performedP0, completedP0, uploadVehicleDoc } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costLines, coordinate, startService, saveActuals, uploadActualDoc, completeService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { pnl, readXlsx, numbersIn, isXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu", () => {
  test("PNL-002 KPI và bảng Chặng → Dịch vụ → Đầu mục", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const o = await performedP0(testRun);
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expectMoney(d.kpi.revenue, P0.orderRevenue, 'kpi.revenue');
    expectMoney(d.kpi.cost, P0.orderCost, 'kpi.cost');
    expectMoney(d.kpi.profit, P0.orderPnl, 'kpi.profit');
    expectPercent(d.kpi.marginPercent, P0.orderMarginDetailPct, 1, 'kpi.marginPercent');
    expect(d.kpi.margin, 'An toàn (≥ 10%)').toBe('SAFE');
    expect(d.kpi.marginLabel).toBe('An toàn');
    const usd = (await costLines(testRun, o.svc.VT)).find((l) => l.currency === 'USD');
    expect(usd, 'VT có dòng chi phí USD của NT_B').toBeTruthy();
    expectMoney(usd.unitPrice * usd.quantity, 400, 'Chi phí gốc VT (USD)');
    expectMoney(d.fxRate.usdRate, P0.fxUsd, 'Tỷ giá USD của báo cáo');
    const codeOf = (service: any) => service.serviceTypeCode ?? service.code;
    const serviceCodes = d.legs.flatMap((leg: any) => leg.services.map(codeOf));
    expect(serviceCodes.sort(), 'Mỗi dịch vụ thuộc đúng một chặng').toEqual(SERVICE_KEYS.map((k) => refs.services[k]).sort());
    const amountFields = ['revenue', 'cost', 'profit'] as const;
    const checkFigures = (figures: any, expected: Record<(typeof amountFields)[number], number>, label: string) => {
      if (!amountFields.some((field) => Object.hasOwn(figures, field))) {
        markIncomplete('Contract /pnl hiện mô tả chặng/dịch vụ chỉ có thông tin tham chiếu. Cần số liệu thực trả về để kiểm tổng từng cấp.');
        return;
      }
      for (const field of amountFields) expectMoney(figures[field], expected[field], label + ': ' + field);
    };
    for (const leg of d.legs) {
      const keys: ServiceKey[] = leg.services.map((service: any) => SERVICE_KEYS.find((key) => refs.services[key] === codeOf(service))!);
      const totals = { revenue: 0, cost: 0, profit: 0 };
      for (const [index, key] of keys.entries()) {
        const service = leg.services[index];
        const figures = service.figures ?? service.kpi ?? service;
        const revenue = P0.serviceRevenue[key];
        const cost = P0.serviceCost[key];
        checkFigures(figures, { revenue, cost, profit: revenue - cost }, key);
        totals.revenue += revenue;
        totals.cost += cost;
        totals.profit += revenue - cost;
      }
      const figures = leg.figures ?? leg.kpi ?? leg;
      checkFigures(figures, totals, 'Chặng ' + leg.position);
    }

  });

  test("PNL-003 Margin dịch vụ VT theo công thức đã chốt", { tag: ["@api", "@chi-phi-doanh-thu", "@p1", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {
    const o = await editedP0(testRun, 'PERFORMED');
    const refs = await testRun.p0Refs();
    const response = await http.call('GET /api/service-orders/{id}/pnl', {token: tok('cc'), params: {id: o.id}});
    expectStatusIn(response, '200'); const d = await data(response);
    expectMoney(d.kpi.revenue, 15_900_000); expectMoney(d.kpi.cost, 14_000_000);
    const vt = (d.legs ?? []).flatMap((l: any) => l.services ?? []).find((x: any) => (x.serviceTypeCode ?? x.code) === refs.services.VT);
    expect(vt, 'P&L phải trả dòng dịch vụ Vận tải').toBeTruthy();
    // Contract/SRS discrepancy is asserted explicitly; never calculate and assert a synthetic margin in place of the API value.
    const figures = vt.figures ?? vt.kpi ?? vt;
    if (!Object.hasOwn(figures, 'marginPercent')) {
      markIncomplete('Contract /pnl chưa trả marginPercent cho dịch vụ VT theo PNL-003.');
      return;
    }
    expectPercent(figures.marginPercent, 9.1, 1, 'VT: 1.000.000 / 11.000.000');
    expect(figures.margin, 'VT 9,1% thuộc Dưới chuẩn').toBe('BELOW_STANDARD');
    expect(figures.marginLabel).toBe('Dưới chuẩn');
  });

  test("PNL-004 Thiếu tỷ giá cho tiền tệ khác", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {
    // This read-only seed represents a legacy/imported foreign-currency cost lacking a conversion rate.
    // Normal create commands only accept VND/USD/CNY, so silently changing a shared VCB configuration would not be an isolated fixture.
    blockedUnless(['PNL_MISSING_FX_ORDER_ID']);
    const id = process.env.PNL_MISSING_FX_ORDER_ID;
    expect(id, 'Cần PNL_MISSING_FX_ORDER_ID: phiếu có dịch vụ Đã thực hiện với dòng chi phí thiếu tỷ giá').toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    const order = await getOrder(testRun, id!, 'cc');
    expect(['PERFORMED','COMPLETED']).toContain(order.status);
    const fx = await must(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', {token:tok('cc'),params:{id:id!}}), 'Xác minh tỷ giá của seed');
    const missing: {service: string; line: any}[] = [];
    for (const svc of (order.services ?? []).filter((s: any) => s.status === 'PERFORMED')) {
     const c = await costs(testRun, {id:id!,type:svc.serviceTypeCode}, 'cc');
     for (const block of c.contractors ?? []) {
      const cur = String(block.currency); const rate = cur === 'USD' ? fx.usdRate : cur === 'CNY' ? fx.cnyRate : cur === 'VND' ? 1 : undefined;
      if (rate == null || !Number.isFinite(Number(rate)) || Number(rate) <= 0) {
       for (const line of block.lines ?? []) if(Number(line.quantity)>0 && Number(line.unitPrice)>0) missing.push({service:svc.serviceTypeCode,line});
      }
     }
    }
    expect(missing.length, 'Seed có ít nhất một dòng chi phí thực dương của dịch vụ Đã thực hiện và tiền tệ chưa có tỷ giá').toBeGreaterThan(0);
    const response = await http.call('GET /api/service-orders/{id}/pnl', {token:tok('cc'),params:{id:id!}});
    expectStatusIn(response,'200'); const d = await data(response);
    expect(d.kpi.missingFxRate).toBe(true); expect(d.kpi.cost,'Tổng chi phí không được tính thành 0 khi thiếu tỷ giá').toBeNull(); expect(d.kpi.profit).toBeNull();
    for (const {service,line} of missing) {
     const leg = (d.legs ?? []).find((l: any) => (l.services ?? []).some((s: any) => (s.serviceTypeCode ?? s.code) === service));
     expect(leg,`Có chặng của dịch vụ ${service}`).toBeTruthy();
     const svc = leg.services.find((s: any) => (s.serviceTypeCode ?? s.code) === service);
     const row = (svc.lines ?? svc.items ?? []).find((x: any) => x.costLineId === line.costLineId);
     expect(row, 'API trả dòng chi phí cần hiển thị dấu —').toBeTruthy();
     expect(row, 'Có field quy đổi, giá trị null biểu diễn dấu —').toHaveProperty('convertedTotal',null);
     const svcFigures = svc.figures ?? svc.kpi ?? svc; const legFigures = leg.figures ?? leg.kpi ?? leg;
     expect(svcFigures).toHaveProperty('cost',null); expect(legFigures).toHaveProperty('cost',null);
    }
  });

  test("PNL-005 Doanh thu bằng 0", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const quote = await extraQuote(testRun, { base, prices: { [base.items.customsFee.name]: 0 } });
    const q = await createOrder(testRun, { rcId: quote.rcId, customerId: base.customerId }, { submit: false, services: ['KHQ'] });
    await uploadVehicleDoc(testRun, q.id, samplePdf('so-thong-hanh-xe-giao-1.pdf'), 'HANDOVER', 0);
    await uploadVehicleDoc(testRun, q.id, samplePdf('so-thong-hanh-xe-nhan-1.pdf'), 'RECEIVER', 0);
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: q.id } }), 'gửi phiếu sau khi đủ chứng từ xe');
    await acceptOrder(testRun, q.id);
    await confirmLegs(testRun, q.id);
    const svc = { id: q.id, type: refs.services.KHQ };
    await coordinate(testRun, svc, [{ priceConfigurationItemId: base.items.customsFee.id, contractorId: env.ref('CONTRACTOR_A_ID'), unitCode: refs.units.customsFee }]);
    await startService(testRun, svc);
    await saveActuals(testRun, svc, actualsBody(refs, 'KHQ'));
    await uploadActualDoc(testRun, svc);
    await completeService(testRun, svc);
    const table = revenueTable(await revenueOf(testRun, q.id), refs.services.KHQ);
    expect(table, 'Có bảng doanh thu KHQ từ báo giá riêng').toBeTruthy();
    const fee = table.lines?.find((line: any) => line.itemName === base.items.customsFee.name);
    expect(fee, 'Có dòng phí khai báo đã thực hiện').toBeTruthy();
    expect(fee.quantity).toBeGreaterThan(0);
    expect(fee.unitPrice, 'Đơn giá bán của fixture').toBe(0);
    expect(fee.amount, 'Doanh thu dòng đã ghi nhận').toBe(0);
    const res = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: q.id } });
    expectStatusIn(res, '200');
    const k = (await data(res)).kpi;
    expect(k.revenue, 'Doanh thu được trả về và bằng 0').toBe(0);
    expect(k.cost, 'Chỉ có chi phí').toBeGreaterThan(0);
    expect(k.profit).toBe(-k.cost);
    expect(k.marginPercent, 'Margin "—", không chia 0').toBeNull();

  });

  test("PNL-006 Chỉ tính dịch vụ Đã thực hiện", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, base, { submit: false, services: ['KHQ', 'VT'] });
    await uploadVehicleDoc(testRun, o.id, samplePdf('so-thong-hanh-xe-giao-1.pdf'), 'HANDOVER', 0);
    await uploadVehicleDoc(testRun, o.id, samplePdf('so-thong-hanh-xe-nhan-1.pdf'), 'RECEIVER', 0);
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu sau khi đủ chứng từ xe');
    await acceptOrder(testRun, o.id);
    await confirmLegs(testRun, o.id);
    const khq = { id: o.id, type: refs.services.KHQ };
    const vt = { id: o.id, type: refs.services.VT };
    await coordinate(testRun, khq, [{
      priceConfigurationItemId: base.items.customsFee.id,
      contractorId: env.ref('CONTRACTOR_A_ID'),
      unitCode: refs.units.customsFee,
    }]);
    await startService(testRun, khq);
    await saveActuals(testRun, khq, actualsBody(refs, 'KHQ'));
    await uploadActualDoc(testRun, khq);
    await completeService(testRun, khq);
    await coordinate(testRun, vt, [{
      priceConfigurationItemId: base.items.freight.id,
      contractorId: env.ref('CONTRACTOR_B_ID'),
      unitCode: refs.units.freight,
      routeIndex: 0,
    }], { USD: P0.fxUsd });
    await startService(testRun, vt);
    const tower = await k3Order(testRun, o.id);
    expect(tower.status, 'Phiếu tổng chuyển Đang thực hiện').toBe('IN_PROGRESS');
    const services = tower.legs.flatMap((leg: any) => leg.services);
    expect(services).toHaveLength(2);
    expect(services).toEqual(expect.arrayContaining([
      expect.objectContaining({ serviceTypeCode: khq.type, status: 'PERFORMED' }),
      expect.objectContaining({ serviceTypeCode: vt.type, status: 'IN_PROGRESS' }),
    ]));
    expect((await costLines(testRun, vt)).some((line) => Number(line.unitPrice) * Number(line.quantity) > 0), 'VT đang làm đã có chi phí để kiểm loại trừ').toBe(true);
    const res = await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const k = (await data(res)).kpi;
    expectMoney(k.revenue, P0.fixedRevenue.KHQ, 'Doanh thu chỉ của KHQ');
    expectMoney(k.cost, P0_ITEMS.find((item) => item.key === 'customsFee')!.buyA!, 'Chi phí chỉ của KHQ (VT đang làm chưa tính)');

  });

  test("PNL-007 Dịch vụ chưa gán nhà thầu", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun, tok }) => {
    const o = await p0Order(testRun, 'KHQ_DONE'); const refs = await testRun.p0Refs();
    const c = await costs(testRun,o.svc.KB); expect(c.contractors ?? [], 'Tiền điều kiện KB chưa được gán nhà thầu').toHaveLength(0);
    const response = await http.call('GET /api/service-orders/{id}/pnl', {token:tok('cc'),params:{id:o.id}});
    expectStatusIn(response,'200'); const d=await data(response);
    const kb=(d.legs ?? []).flatMap((l:any)=>l.services ?? []).find((s:any)=>(s.serviceTypeCode ?? s.code)===refs.services.KB);
    expect(kb, 'P&L có dòng Kho bãi để hiển thị ghi chú').toBeTruthy();
    test.info().annotations.push({type:'Chờ xác nhận hợp đồng API',description:'Swagger Ref chưa mô tả note của dịch vụ; phải trả ghi chú thực tế theo PNL-007, không thay bằng ghi chú tạo trong test.'});
    expect(kb, 'Ghi chú trả từ API cho KB chưa điều phối').toHaveProperty('note','Chưa gán nhà thầu');
  });

  test("PNL-023 Áp tỷ giá thủ công cho phiếu", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'PERFORMED', { editShift: true });
    const hist0 = items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } })));
    const res = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 26000, cnyRate: 3600 } });
    expectStatusIn(res, '200/204');
    const k = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expectMoney(k.cost, P0.orderCostAtAlt, 'kpi.cost (VT 10.400.000)');
    expectMoney(k.profit, P0.orderPnlAtAlt, 'kpi.profit');
    expectPercent(k.marginPercent, P0.orderMarginDetailPctAtAlt, 1, 'margin');
    expect(k.margin, 'Dưới chuẩn').toBe('BELOW_STANDARD');
    const hist = items(await data(await http.call('GET /api/service-orders/{id}/history', { token: tok('cc'), params: { id: o.id }, query: { perPage: 100 } })));
    const added = hist.filter((h: any) => !hist0.some((x: any) => x.id === h.id));
    test.info().annotations.push({ type: 'Ghi nhận', description: `Log đổi tỷ giá: ${JSON.stringify(added.map((h: any) => h.description))}` });
    expect(added.some((h: any) => /tỷ giá/i.test(String(h.description ?? '')) && /26[.,]?000/.test(String(h.description ?? ''))), 'Log có giá trị mới').toBe(true);

  });

  test("PNL-024 Tỷ giá ≤ 0 hoặc trống", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await performedP0(testRun);
    const before = stable(await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } })));

    const res = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 0, cnyRate: 3_600 } });
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expect(stable(await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } }))), 'Tỷ giá không đổi').toEqual(before);

  });

  test("PNL-025 Quá 2 chữ số thập phân", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await performedP0(testRun);
    const before = stable(await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } })));

    const res = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 25000.123, cnyRate: 3_600 } });
    expectStatusIn(res, '400/422');
    expect(stable(await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } }))), 'Tỷ giá không đổi').toEqual(before);

  });

  test("PNL-026 Khóa sau khi xác nhận doanh thu", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await completedP0(testRun);
    const before = stable(await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } })));
    const res = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'VCB' } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    const after = await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } }));
    expect(after.locked, 'Tỷ giá đã chốt').toBe(true);
    expect(stable(after), 'Không đổi').toEqual(before);

  });

  test("PNL-027 Không có quyền Tỷ giá quy đổi", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await performedP0(testRun);
    const before = stable(await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } })));

    const res = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('k1'), params: { id: o.id }, json: { source: 'MANUAL', usdRate: 26000, cnyRate: 3_600 } });
    expectStatusIn(res, '403');
    expect(stable(await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } }))), 'Không đổi').toEqual(before);

  });

  test("PNL-012 Xuất Excel P&L của phiếu", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await performedP0(testRun);
    const res = await http.call('GET /api/service-orders/{id}/pnl/export', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const buf = await res.body();
    expect(isXlsx(buf, res.headers()['content-type']), 'File xlsx').toBe(true);
    const x = await readXlsx(buf);
    const nums = numbersIn(x.rows);

    const k = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expect(nums, 'Doanh thu trùng màn hình').toContain(Number(k.revenue));
    expect(nums, 'Chi phí trùng màn hình').toContain(Number(k.cost));
    const refs = await testRun.p0Refs();
    const order = await data(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } }));
    const notDone = (order.services ?? []).filter((s: any) => !['PERFORMED', 'COMPLETED'].includes(s.status)).map((s: any) => s.serviceTypeName);
    const text = JSON.stringify(x.rows);
    for (const n of notDone) expect(text, `Không có dịch vụ chưa thực hiện ${n}`).not.toContain(n);
    void refs;

  });

  test("PNL-014 Phiếu chưa có dữ liệu", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const res = await http.call('GET /api/service-orders/{id}/pnl/export', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);

  });

  test("PNL-019 Tỷ giá đang áp cho phiếu", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, roles, tok }) => {

    const o = await performedP0(testRun);
    const me = await data(await http.call('GET /api/auth/me', { token: tok('cc') }));
    const ccNames = [me?.fullName, me?.name, me?.displayName, me?.email, testRun.roles.cc.email].filter(Boolean).map(String);

    const res = await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const f = await data(res);
    expect(f.source).toBe('MANUAL');
    expect(Number(f.usdRate)).toBe(25000);
    expect(ccNames.some((n) => String(f.updatedBy ?? '').includes(n) || n.includes(String(f.updatedBy ?? '-'))), `Người cập nhật là CC (${f.updatedBy})`).toBe(true);

  });

  test("PNL-029 Chuyển về VCB", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'FX_APPLIED');
    const res = await http.call('PUT /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id }, json: { source: 'VCB' } });
    expectStatusIn(res, '200/204');
    const f = await data(await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } }));
    expect(f.source).toBe('VCB');
    expect(Number(f.usdRate), 'Dùng tỷ giá VCB hiện tại').toBe(Number(f.vcbUsdRate));
    expect(String(f.updatedBy ?? ''), 'Người cập nhật "Hệ thống"').toMatch(/Hệ thống/i);

  });
});
