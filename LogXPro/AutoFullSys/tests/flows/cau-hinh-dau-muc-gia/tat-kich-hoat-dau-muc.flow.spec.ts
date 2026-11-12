import { runEmptyMergedGroup } from '../../../src/quan-ly-bao-gia/data/remaining-quote-api.scenario';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { env } from '../../../src/core/env';
import { credentials } from '../../../src/core/data/accounts';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as K3 from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import * as CCF from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import * as BGK from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as PNLF from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as GM from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import * as YC from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import * as GB from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
import * as LEGS from '../../../src/cau-hinh-chang/data/leg-sandbox';
import * as CFGF from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import * as NB from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tắt / bật kích hoạt đầu mục giá và tác động hạ nguồn (7 điểm đã chốt)", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-DEACT-001 Điểm 1: phiếu Đã thực hiện có chi phí đầu mục chặn tắt", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-001', true);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const o = await ORD.p0Order(testRun, 'PERFORMED', { base });
    expect((await impact('supervision')).blockingOrderCodes ?? [], 'Impact liệt kê PX').toContain(o.code);
    const res = await turn('supervision', 'INACTIVE');
    expectStatusIn(res, '400/409/422', 'lưu bị chặn');
    expect(PF.stateCode((await headOf('supervision')).status), 'Đầu mục vẫn Bật').toBe('ACTIVE');

  });

  test("FLOW-DEACT-002 Phiếu Từ chối/Hoàn thành không chặn và không bị ảnh hưởng", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-002', true);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const done = await ORD.p0Order(testRun, 'COMPLETED', { base, editShift: true });
    const rej = await ORD.createOrder(testRun, base, { submit: true });
    await ORD.rejectOrder(testRun, rej.id);
    const snap = async () => stable({ rev: await ORD.revenueOf(testRun, done.id), costs: await K3.costs(testRun, done.svc.HQGS), pnl: await kpi(done.id) });
    const before = await snap();
    expectStatusIn(await turn('supervision', 'INACTIVE'), '200/204', 'tắt được');
    expect(await snap(), 'Chi phí/doanh thu/P&L của phiếu Hoàn thành giữ nguyên').toEqual(before);

  });

  test("FLOW-DEACT-003 Phiếu Tạo mới/Đã tiếp nhận không còn chọn được đầu mục", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-003', true);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const o = await ORD.p0Order(testRun, 'ACCEPTED', { base });
    expectStatusIn(await turn('supervision', 'INACTIVE'), '200/204', 'tắt Phí giám sát');
    const opts = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { token: tok('dp'), params: { id: o.id, type: refs.services.HQGS } }));
    expect((opts.items ?? []).some((i: any) => i.id === base.items.supervision.id), 'Không có trong modal điều phối').toBe(false);
    const ci = items(await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/cost-items', { token: tok('dp'), params: { id: o.id, type: refs.services.HQGS }, query: { contractorId: env.ref('CONTRACTOR_A_ID'), perPage: 200 } })));
    expect(ci.some((x: any) => x.priceConfigurationItemId === base.items.supervision.id), 'Không có trong modal phụ phí').toBe(false);

  });

  test("FLOW-DEACT-004 Giá mua/định mức: ẩn và khóa dòng", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-004', true);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    expectStatusIn(await turn('supervision', 'INACTIVE'), '200/204', 'tắt');
    const lines = items(await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: base.sheetA }, query: { priceConfigurationItemId: base.items.supervision.id } })));
    expect(lines, 'Dòng giá mua bị ẩn').toHaveLength(0);
    const add = await http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: base.sheetA }, json: GM.priceLine(refs, base.items, 'supervision', 820_000, { customsOfficeCodes: [refs.customsOffice] }) });
    expectStatusIn(add, '400/422', 'Không thêm được dòng');
    const groups = items(await data(await http.call('GET /api/standard-buying-prices/groups', { token: tok('cc'), query: { serviceTypeCode: refs.services.HQGS, perPage: 200 } })));
    expect(groups.some((g: any) => g.id === base.items.supervision.id), 'Nhóm đầu mục không còn ở định mức').toBe(false);

  });

  test("FLOW-DEACT-005 Điểm 2: BGNB của YCBG đã có BGKH không bị xóa dòng", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-005', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const x = await PF.quote(testRun, base, { customer: 'pending' });
    const y = await PF.quote(testRun, base, { issue: false });
    expectStatusIn(await turn('supervision', 'INACTIVE'), '200/204', 'tắt Phí giám sát');
    const has = (iq: any) => (iq.lines ?? []).some((l: any) => l.revenueItemId === base.items.supervision.id);
    expect(has(await PF.iqView(testRun, x)), 'BGNB_X giữ dòng Phí giám sát').toBe(true);
    expect(has(await PF.iqView(testRun, y)), 'BGNB_Y mất dòng Phí giám sát').toBe(false);

  });

  test("FLOW-DEACT-006 Điểm 3: nhóm gộp có 1 dòng bị tắt chỉ xóa dòng đó", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-006', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const q = await PF.quote(testRun, base, { keys: [...PF.quotedKeys, 'seal'], customer: 'pending' });
    const cq0 = await PF.cqView(testRun, q);
    const sup = PF.lineFor(cq0, base, 'supervision');
    const seal = PF.lineFor(cq0, base, 'seal');
    await must(await http.call('POST /api/customer-quotations/{id}/merges', { token: tok('k1'), params: { id: q.rcId! }, json: { displayName: 'Trọn gói giám sát hải quan', unitCode: refs.units.supervision, lineIds: [sup.id, seal.id] } }), 'gộp HQGS');
    const g0 = (await PF.cqView(testRun, q)).mergedGroups[0];
    expectStatusIn(await turn('seal', 'INACTIVE'), '200/204', 'tắt Phí kẹp chì');
    const cq = await PF.cqView(testRun, q);
    const g = (cq.mergedGroups ?? []).find((m: any) => m.id === g0.id);
    expect(g, 'Nhóm gộp còn').toBeTruthy();
    expect((cq.lines ?? []).filter((l: any) => l.groupId === g0.id).map((l: any) => l.revenueItemId), 'Nhóm còn Phí giám sát').toEqual([base.items.supervision.id]);
    expectMoney(Number(g0.baseUnitPrice) - Number(g.baseUnitPrice), Number(seal.baseUnitPrice), 'Đơn giá gốc giảm đúng phần Phí kẹp chì');
    expectMoney(Number(cq0.subtotal) - Number(cq.subtotal), Number(seal.sellPrice), 'Footer tính lại');

  });

  test("FLOW-DEACT-007 Điểm 4: xóa dòng trên RC Đang hiệu lực sinh phiên bản", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-007', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const q = await PF.quote(testRun, base, { keys: [...PF.quotedKeys, 'seal'], customer: 'active' });
    expectStatusIn(await turn('seal', 'INACTIVE'), '200/204', 'tắt Phí kẹp chì');
    const vers = items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok('k1'), params: { id: q.rcId! } })));
    expect(vers.map((v: any) => String(v.version ?? v.versionNo)), 'Có Ver 2.0').toEqual(expect.arrayContaining([expect.stringMatching(/^2(\.0)?$/)]));
    const v1 = await data(await http.call('GET /api/customer-quotations/{id}/versions/{version}', { token: tok('k1'), params: { id: q.rcId!, version: 1 } }));
    expect(JSON.stringify(v1), 'Ver 1.0 còn Phí kẹp chì').toContain(base.items.seal.name);
    const hist = items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok('k1'), params: { id: q.rcId! }, query: { page: 1, perPage: 100 } })));
    expect(hist.some((h: any) => /Hệ thống/i.test(String(h.actorName ?? ''))), 'Người thực hiện "Hệ thống"').toBe(true);

  });

  test("FLOW-DEACT-008 Điểm 5: bảng giá rỗng bị xóa, báo giá rỗng vẫn giữ", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-008', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const q = await PF.quote(testRun, base, { keys: ['storage'], customer: 'pending' });
    expectStatusIn(await turn('storage', 'INACTIVE'), '200/204', 'tắt Phí lưu kho');
    const cq = await PF.cqView(testRun, q);
    expect(cq.id, 'RC_O còn').toBe(q.rcId);
    expect((cq.sourceSheets ?? []).filter((s: any) => s.serviceTypeCode === refs.services.KB), 'Biểu giá KB bị xóa').toHaveLength(0);
    const iq = await PF.iqView(testRun, q);
    expect(iq.id, 'BGNB_O còn').toBe(q.iqId);
    expect(iq.sheets ?? [], 'BGNB_O không bảng giá').toHaveLength(0);

  });

  test("FLOW-DEACT-009 Bật lại: giá mua/định mức hiện lại, báo giá không khôi phục, phiếu chọn lại được", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-009', true);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const o = await ORD.p0Order(testRun, 'ACCEPTED', { base });
    expectStatusIn(await turn('supervision', 'INACTIVE'), '200/204', 'tắt');
    expectStatusIn(await turn('supervision', 'ACTIVE'), '200/204', 'bật lại');
    expect(items(await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: base.sheetA }, query: { priceConfigurationItemId: base.items.supervision.id } }))).length, 'Dòng giá mua hiện lại').toBeGreaterThan(0);
    expect((await GB.sspLines(testRun, base.items.supervision.id)).length, 'SSP hiện lại').toBeGreaterThan(0);
    expect(BGK.lineByName(await BGK.getCustomerQuotation(testRun, base.rcId), base.items.supervision.name), 'RC không có lại dòng').toBeUndefined();
    const opts = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { token: tok('dp'), params: { id: o.id, type: refs.services.HQGS } }));
    expect((opts.items ?? []).some((i: any) => i.id === base.items.supervision.id), 'Phiếu ACCEPTED thấy lại đầu mục').toBe(true);

  });

  test("FLOW-DEACT-010 Lịch sử cấu hình và phiên bản ghi đủ trước/sau", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-010', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const cfgId = base.items.supervision.configId;
    const H = async () => items(await data(await http.call('GET /api/price-configurations/{id}/history', { token: tok('k1'), params: { id: cfgId }, query: { page: 1, perPage: 100 } }))).filter((h: any) => JSON.stringify(h).includes(base.items.supervision.id));
    const h0 = (await H()).length;
    expectStatusIn(await turn('supervision', 'INACTIVE'), '200/204', 'tắt');
    const vOff = items(await data(await http.call('GET /api/price-configurations/{id}/versions', { token: tok('k1'), params: { id: cfgId }, query: { page: 1, perPage: 1 } })))[0];
    expectStatusIn(await turn('supervision', 'ACTIVE'), '200/204', 'bật');
    const hist = await H();
    expect(hist.length, 'Mỗi lần lưu 1 bản lịch sử').toBe(h0 + 2);
    for (const h of hist.slice(0, 2)) { expect(h).toHaveProperty('oldValue'); expect(h).toHaveProperty('newValue'); }
    if (vOff) {
      const v = await data(await http.call('GET /api/price-configurations/{id}/versions/{versionId}', { token: tok('k1'), params: { id: cfgId, versionId: vOff.id } }));
      const snap: any[] = Array.isArray(v.snapshot) ? v.snapshot : (v.snapshot?.items ?? []);
      const e = snap.find((i: any) => i.id === base.items.supervision.id);
      expect(PF.stateCode(e?.status), 'Phiên bản sau lần tắt có trạng thái Tắt').toBe('INACTIVE');
    }

  });

  test("FLOW-DEACT-011 Nhóm gộp mất dòng cuối thì xóa nhóm", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ testRun }) => {
    await expect(runEmptyMergedGroup(testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("FLOW-DEACT-012 Báo giá nhiều bảng: chỉ bảng mất dòng cuối bị xóa", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-012', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const q = await PF.quote(testRun, base, { keys: ['storage', 'freight'], customer: 'pending' });
    expectStatusIn(await turn('storage', 'INACTIVE'), '200/204', 'tắt Phí lưu kho');
    const cq = await PF.cqView(testRun, q);
    expect((cq.sourceSheets ?? []).filter((s: any) => s.serviceTypeCode === refs.services.KB), 'Biểu giá KB bị xóa').toHaveLength(0);
    expect((cq.sourceSheets ?? []).filter((s: any) => s.serviceTypeCode === refs.services.VT), 'Biểu giá VT giữ nguyên').toHaveLength(1);
    expectMoney(cq.subtotal, Number(PF.lineFor(cq, base, 'freight').sellPrice), 'subtotal = tổng VT');

  });

  test("FLOW-DEACT-013 YCBG đã từng có BGKH Thất bại/Hết hiệu lực/Đã gộp vẫn được coi là \"đã có BGKH\"", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-013', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const q1 = await PF.quote(testRun, base, { customer: 'pending' });
    await must(await http.call('POST /api/customer-quotations/{id}/reject', { token: tok('k1'), params: { id: q1.rcId! }, json: { reason: 'Giá cao' } }), 'BGKH1 Thất bại');
    const q2 = await PF.quote(testRun, base, { customer: 'active' });
    await must(await http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok('k1'), params: { id: q2.rcId! }, json: { reason: 'Khách ngừng tuyến' } }), 'BGKH2 Hết hiệu lực');
    const root = await PF.quote(testRun, base, { customer: 'active' });
    const q3 = await PF.quote(testRun, base, { sourceQuotationId: root.rcId!, customer: 'active' });
    expect((await PF.cqView(testRun, q3)).status, 'Tiền điều kiện: bản bổ sung MERGED').toBe('MERGED');
    expectStatusIn(await turn('supervision', 'INACTIVE'), '200/204', 'tắt Phí giám sát');
    for (const [label, q] of [['YCBG1 (Thất bại)', q1], ['YCBG2 (Hết hiệu lực)', q2], ['YCBG3 (Đã gộp)', q3]] as [string, any][]) expect((await PF.iqView(testRun, q)).lines.some((l: any) => l.revenueItemId === base.items.supervision.id), `${label}: BGNB giữ dòng Phí giám sát`).toBe(true);

  });

  test("FLOW-DEACT-014 Nhiều bản bổ sung đồng ý không theo thứ tự, chuẩn hóa tỷ giá và VAT về RC gốc", { tag: ["@flow", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-DEACT-014', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const root = await PF.quote(testRun, base, { customer: 'active', currency: 'VND', vatBand: 'VAT_8' });
    const v1 = await PF.quote(testRun, base, { keys: ['freight'], sourceQuotationId: root.rcId!, customer: 'pending', currency: 'USD', vatBand: 'VAT_10', fxRate: 25_000 });
    const v2 = await PF.quote(testRun, base, { keys: ['storage'], sourceQuotationId: root.rcId!, customer: 'pending', currency: 'VND', vatBand: 'VAT_0' });
    const ver = async () => Number((await PF.cqView(testRun, root)).version);
    const n0 = await ver();
    await BGK.confirmQuotation(testRun, v2.rcId!);
    expect(await ver(), 'Đồng ý -v2 trước: phiên bản +1').toBe(n0 + 1);
    const snapV = async (v: number) => stable(await data(await http.call('GET /api/customer-quotations/{id}/versions/{version}', { token: tok('k1'), params: { id: root.rcId!, version: v } })));
    const old = await snapV(n0);
    await BGK.confirmQuotation(testRun, v1.rcId!);
    expect(await ver(), 'Đồng ý -v1 sau: phiên bản +1 nữa').toBe(n0 + 2);
    const cq = await PF.cqView(testRun, root);
    expect([cq.currency, cq.vatBand], 'Theo tiền tệ và VAT của RC gốc').toEqual(['VND', 'VAT_8']);
    expectMoney(PF.lineFor(cq, base, 'freight').sellPrice, Number(PF.lineFor(cq, base, 'freight').baseUnitPrice), 'Dòng gộp vào quy về VND');
    expect(await snapV(n0), 'Phiên bản cũ không đổi khi xem lại').toEqual(old);

  });
});
