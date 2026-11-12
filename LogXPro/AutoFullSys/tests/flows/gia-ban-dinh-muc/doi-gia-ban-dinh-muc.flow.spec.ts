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

test.describe("Đổi Giá bán định mức: dòng báo giá Hết hạn, phiếu dịch vụ và các bước đưa về hiệu lực", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-CHG-SSP-001 BGNB thủ công Đã phát hành chưa có BGKH: Hết hạn, chặn tạo BGKH tổng đủ", { tag: ["@flow", "@gia-ban-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-001', false);
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const iqId = async (q: any) => (await PF.iqView(testRun, q)).id;
    const IQD = async (q: any) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: await iqId(q) } }));
    const tableOf = (iq: any, k: string) => (iq.sheets ?? iq.tables ?? []).find((s: any) => s.serviceTypeCode === refs.services[k as 'KHQ']);

    const q = await PF.quote(testRun, base, { issue: true });
    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    const iq = await PF.expired(testRun, () => PF.iqView(testRun, q), base, 'customsFee');
    expectMoney(PF.lineFor(iq, base, 'customsFee').unitPrice, 1_200_000, 'Giữ 1.200.000');
    expect(tableOf(iq, 'KHQ')?.disabled, 'Bảng KHQ disable').toBe(true);
    expectMoney(iq.total, 14_100_000, 'Tổng bỏ bảng KHQ 1.600.000');
    const hist = items(await data(await http.call('GET /api/internal-quotes/{id}/history', { token: tok('cc'), params: { id: iq.id }, query: { page: 1, perPage: 100 } })));
    expect(JSON.stringify(hist), 'Lịch sử "Hệ thống – Dòng giá hết hạn"').toMatch(/Hệ thống[\s\S]*hết hạn/i);
    const cq = await BGK.getCustomerQuotation(testRun, (await BGK.createCustomerQuotation(testRun, q.rfqId)).id);
    expect((cq.sourceSheets ?? []).some((s: any) => s.serviceTypeCode === refs.services.KHQ && !s.disabled), 'BGKH tạo ra không có biểu giá KHQ').toBe(false);

  });

  test("FLOW-CHG-SSP-002 Đưa BGNB thủ công về hiệu lực: thu hồi → thêm bảng mới → phát hành lại", { tag: ["@flow", "@gia-ban-dinh-muc", "@p1", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-002', false);
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const iqId = async (q: any) => (await PF.iqView(testRun, q)).id;
    const IQD = async (q: any) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: await iqId(q) } }));
    const tableOf = (iq: any, k: string) => (iq.sheets ?? iq.tables ?? []).find((s: any) => s.serviceTypeCode === refs.services[k as 'KHQ']);

    const q = await PF.quote(testRun, base, { issue: true });
    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    await PF.expired(testRun, () => PF.iqView(testRun, q), base, 'customsFee');
    const id = await iqId(q);
    await must(await http.call('POST /api/internal-quotes/{id}/withdraw', { token: tok('cc'), params: { id }, json: { reason: 'Cập nhật giá mới' } }), 'thu hồi');
    const khq = (q.payload.tables as any[]).find((t: any) => t.serviceTypeCode === refs.services.KHQ);
    const fresh = { ...khq, name: `${khq.name} mới`, lines: await Promise.all(khq.lines.map(async (l: any) => { const k = (Object.keys(base.items) as any[]).find((x) => (base.items as any)[x].id === l.priceConfigurationItemId); const s = await PF.selling(testRun, base, k); return { ...l, standardSellingPriceId: s.id, unitPrice: Number(s.sellingPrice) }; })) };
    const payload = { ...q.payload, tables: [...(q.payload.tables as any[]), fresh] };
    expectStatusIn(await http.call('PUT /api/internal-quotes/{id}', { token: tok('cc'), params: { id }, json: payload }), '200/204', 'thêm bảng KHQ mới');
    expectStatusIn(await http.call('POST /api/internal-quotes/{id}/issue', { token: tok('cc'), params: { id } }), '200/204', 'phát hành lại');
    const iq = await PF.iqView(testRun, q);
    test.info().annotations.push({ type: 'Chờ xác nhận', description: 'Bảng mới ghi đè bảng disable (BR-59b)' });
    const fee = PF.lineFor(iq, base, 'customsFee');
    expect(fee.expired, 'Dòng Đang hiệu lực').toBe(false);
    expectMoney(fee.unitPrice, 1_300_000, 'Dòng 1.300.000');
    expectMoney(iq.total, 15_800_000, 'Tổng 15.800.000');

  });

  test("FLOW-CHG-SSP-003 Phát hành bị chặn khi còn dòng Hết hạn", { tag: ["@flow", "@gia-ban-dinh-muc", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-003', false);
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const iqId = async (q: any) => (await PF.iqView(testRun, q)).id;
    const IQD = async (q: any) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: await iqId(q) } }));
    const tableOf = (iq: any, k: string) => (iq.sheets ?? iq.tables ?? []).find((s: any) => s.serviceTypeCode === refs.services[k as 'KHQ']);

    const q = await PF.quote(testRun, base, { issue: false });
    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    await PF.expired(testRun, () => PF.iqView(testRun, q), base, 'customsFee');
    const res = await http.call('POST /api/internal-quotes/{id}/issue', { token: tok('cc'), params: { id: await iqId(q) } });
    expectStatusIn(res, '400/409/422', 'Chặn phát hành');

  });

  test("FLOW-CHG-SSP-004 BGNB tự động: đồng bộ giá định mức", { tag: ["@flow", "@gia-ban-dinh-muc", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-004', false);
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const iqId = async (q: any) => (await PF.iqView(testRun, q)).id;
    const IQD = async (q: any) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: await iqId(q) } }));
    const tableOf = (iq: any, k: string) => (iq.sheets ?? iq.tables ?? []).find((s: any) => s.serviceTypeCode === refs.services[k as 'KHQ']);

    const r = await YC.createRfq(testRun, {});
    const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
    const IQA = async () => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: a.internalQuoteId } }));
    const total0 = Number((await IQA()).total);
    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    expectStatusIn(await http.call('POST /api/internal-quotes/{id}/sync-standard-prices', { token: tok('k1'), params: { id: a.internalQuoteId } }), '200/201/204', 'đồng bộ giá định mức');
    const iq = await IQA();
    const fee = (iq.tables ?? []).flatMap((t: any) => t.lines ?? []).find((l: any) => l.itemId === base.items.customsFee.id);
    expectMoney(fee.unitPrice, 1_300_000, 'Dòng KHQ 1.300.000');
    expect(/EXPIRED|Hết hạn/i.test(String(fee.lineStatus ?? '')), 'Đang hiệu lực').toBe(false);
    expectMoney(iq.total, total0 + 100_000, 'Tổng tăng 100.000 (bộ P0: 15.800.000)');
    const cq = await BGK.getCustomerQuotation(testRun, (await BGK.createCustomerQuotation(testRun, r.id)).id);
    expect(new Set((cq.sourceSheets ?? []).filter((s: any) => !s.disabled).map((s: any) => s.serviceTypeCode)).size, 'BGKH tạo đủ 5 biểu giá').toBe(5);

  });

  test("FLOW-CHG-SSP-005 BGNB đã có BGKH thì không đổi", { tag: ["@flow", "@gia-ban-dinh-muc", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-005', false);
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const q = await PF.quote(testRun, base, { customer: 'pending' });
    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    expect(PF.lineFor(await PF.iqView(testRun, q), base, 'customsFee').expired, 'Dòng BGNB vẫn Đang hiệu lực').toBe(false);

  });

  test("FLOW-CHG-SSP-006 BGKH Chờ xác nhận: biểu giá Disable, đồng ý được khi còn biểu giá Hoạt động", { tag: ["@flow", "@gia-ban-dinh-muc", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-006', false);
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const q = await PF.quote(testRun, base, { customer: 'pending' });
    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    const cq = await PF.expired(testRun, () => PF.cqView(testRun, q), base, 'customsFee');
    expect((cq.sourceSheets ?? []).find((s: any) => s.serviceTypeCode === refs.services.KHQ)?.disabled, 'Biểu giá KHQ Disable').toBe(true);
    expectMoney(cq.subtotal, P0.internalQuoteTotal - 1_600_000, 'subtotal bỏ KHQ');
    const fee = PF.lineFor(cq, base, 'customsFee');
    expectStatusIn(await http.call('PUT /api/customer-quotations/{id}/prices', { token: tok('k1'), params: { id: q.rcId! }, json: { lines: [{ lineId: fee.id, sellPrice: 1_250_000 }] } }), '400/409/422', 'không điều chỉnh được dòng KHQ');
    expectStatusIn(await http.call('POST /api/customer-quotations/{id}/confirm', { token: tok('k1'), params: { id: q.rcId! } }), '200/204', 'đồng ý được');
    expect(Number((await PF.cqView(testRun, q)).disabledSheetCount), 'disabledSheetCount = 1').toBe(1);

  });

  test("FLOW-CHG-SSP-007 BGKH toàn bộ biểu giá Disable thì không đồng ý được", { tag: ["@flow", "@gia-ban-dinh-muc", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-007', false);
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    const q = await PF.quote(testRun, base, { keys: ['customsFee', 'overtime'], customer: 'pending' });
    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    await PF.expired(testRun, () => PF.cqView(testRun, q), base, 'customsFee');
    const res = await http.call('POST /api/customer-quotations/{id}/confirm', { token: tok('k1'), params: { id: q.rcId! } });
    expectStatusIn(res, '400/409/422', 'Nút Đồng ý bị vô hiệu');

  });

  test("FLOW-CHG-SSP-008 Phiếu dịch vụ dùng RC có biểu giá Disable vẫn tạo và chạy được, doanh thu đầu mục Hết hạn = null", { tag: ["@flow", "@gia-ban-dinh-muc", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-008');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    await PF.expired(testRun, rc, base, 'customsFee');
    const o = await ORD.p0Order(testRun, 'IN_PROGRESS', { base });

    const fee = lineNamed(await rev(o.id, 'KHQ'), 'customsFee');
    expect(fee.quotationExpired, 'Doanh thu KHQ "Hết hạn báo giá"').toBe(true);
    expect(fee.amount ?? null, 'null').toBeNull();
    await ORD.runService(testRun, o, 'VT', false);
    expect(Number((await rev(o.id, 'VT')).total), 'Dịch vụ khác có doanh thu').toBeGreaterThan(0);
    expectMoney((await kpi(o.id)).cost ?? 0, 0, 'Trước khi KHQ hoàn thành P&L chưa có KHQ');
    await finish(o, 'KHQ');
    const k = await kpi(o.id);
    expectMoney(k.cost, 1_000_000, 'P&L KHQ chi phí 1.000.000');
    expectMoney(k.revenue ?? 0, 0, 'Doanh thu 0/null');
    expect(k.margin, 'Ghi chú lỗ').toBe('LOSS');

  });

  test("FLOW-CHG-SSP-009 Hoàn tất doanh thu bằng YCBG bổ sung → BGKH bổ sung", { tag: ["@flow", "@gia-ban-dinh-muc", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-009');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    await PF.expired(testRun, rc, base, 'customsFee');
    const o = await ORD.p0Order(testRun, 'IN_PROGRESS', { base });

    const v0 = Number((await rc()).version);
    await PF.quote(testRun, base, { keys: ['customsFee', 'overtime'], sourceQuotationId: base.rcId, customer: 'active' });
    const cq = await rc();
    expect(Number(cq.version), 'RC_A version +1').toBeGreaterThan(v0);
    expect((cq.sourceSheets ?? []).filter((s: any) => s.serviceTypeCode === refs.services.KHQ && s.disabled), 'Biểu giá Disable cũ bị ghi đè').toHaveLength(0);
    expectMoney(lineNamed(await rev(o.id, 'KHQ'), 'customsFee').amount, 1_300_000, 'Doanh thu KHQ của PS1 = 1.300.000');

  });

  test("FLOW-CHG-SSP-010 Đưa giá bán về giá cũ không khôi phục", { tag: ["@flow", "@gia-ban-dinh-muc", "@p2"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-010');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
    await PF.expired(testRun, rc, base, 'customsFee');
    await PF.changeSelling(testRun, base, 'customsFee', 1_200_000);
    const cq = await rc();
    expect(PF.lineFor(cq, base, 'customsFee').expired, 'Dòng vẫn Hết hạn').toBe(true);
    expect((cq.sourceSheets ?? []).find((s: any) => s.serviceTypeCode === refs.services.KHQ)?.disabled, 'Biểu giá vẫn Disable').toBe(true);

  });

  test("FLOW-CHG-SSP-011 Xóa nguồn định mức cũng làm Hết hạn", { tag: ["@flow", "@gia-ban-dinh-muc", "@p2"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-CHG-SSP-011');
    const rev = async (id: string, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => ORD.revenueTable(await ORD.revenueOf(testRun, id), refs.services[k]);
    const lineNamed = (t: any, key: string) => (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes((base.items as any)[key].name));
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const rc = () => BGK.getCustomerQuotation(testRun, base.rcId);

    await PF.sourceDelete(testRun, base, 'storage');
    expect(await GB.sspLines(testRun, base.items.storage.id), 'SSP KB bị xóa').toHaveLength(0);
    await PF.expired(testRun, rc, base, 'storage');

  });
});
