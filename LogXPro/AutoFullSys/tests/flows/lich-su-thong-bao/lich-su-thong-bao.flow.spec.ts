/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens, markIncomplete } from '../../../src/core/fixtures/auth.fixture';
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

test.describe("Lịch sử hoạt động và thông báo xuyên module", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-HIST-001 Lịch sử giá đi theo chuỗi thay đổi", { tag: ["@flow", "@lich-su-thong-bao", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-HIST-001', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const sbp = await PF.buying(testRun, base, 'customsFee');
    const ssp = await PF.selling(testRun, base, 'customsFee');
    const purchase = await GM.sheetLine(testRun, base.sheetA, base.items.customsFee.id);
    const updatePurchase = await http.call('PUT /api/purchase-prices/{id}/items', {
      token: tok('k1'), params: { id: base.sheetA },
      json: { updated: [{ id: purchase.id, unitPrice: Number(purchase.unitPrice) + 10_000 }] },
    });
    expectStatusIn(updatePurchase, '200/201/204', 'cập nhật dòng giá mua nguồn');

    const priceValue = (raw: any, field: string) => {
      const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return typeof value === 'object' && value !== null ? value[field] : value;
    };
    const verify = async (api: string, id: string, field: string, previous: number, next: number, change: () => Promise<unknown>) => {
      const before = await PF.histories(testRun, api, id);
      const startedAt = Date.now();
      await change();
      const after = await PF.histories(testRun, api, id);
      const entries = after.filter((entry) => !before.some((old) => old.id === entry.id));
      expect(entries, 'Mỗi lần thay đổi tạo đúng một bản ghi').toHaveLength(1);
      const [entry] = entries;
      expect(entry.actorUserId).toBe(testRun.roles.cc.userId);
      expect(entry.actorName).toBeTruthy();
      expect(Date.parse(entry.at)).toBeGreaterThanOrEqual(startedAt - 60_000);
      expect(Date.parse(entry.at)).toBeLessThanOrEqual(Date.now() + 60_000);
      expectMoney(priceValue(entry.oldValue, field), previous);
      expectMoney(priceValue(entry.newValue, field), next);
    };
    const buyApi = 'GET /api/standard-buying-prices/{id}/history';
    const sellApi = 'GET /api/standard-selling-prices/{id}/history';
    const currentBuy = await PF.buying(testRun, base, 'customsFee');
    const currentSell = await PF.selling(testRun, base, 'customsFee');
    await verify(buyApi, sbp.id, 'benchmarkPrice', Number(currentBuy.benchmarkPrice), 1_050_000, () => PF.changeBenchmark(testRun, base, 'customsFee', 1_050_000));
    await verify(buyApi, sbp.id, 'benchmarkPrice', 1_050_000, 1_080_000, () => PF.changeBenchmark(testRun, base, 'customsFee', 1_080_000));
    await verify(sellApi, ssp.id, 'sellingPrice', Number(currentSell.sellingPrice), 1_300_000, () => PF.changeSelling(testRun, base, 'customsFee', 1_300_000));

  });

  test("FLOW-HIST-002 Lịch sử báo giá đủ bước", { tag: ["@flow", "@lich-su-thong-bao", "@p1"] }, async ({ http, testRun, tok, page }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-HIST-002', false);
    const kpi = async (id: string) => (await PNLF.pnl(testRun, id)).kpi;
    const finish = async (o: any, k: 'KHQ' | 'HQGS' | 'VT' | 'ST' | 'KB') => { await K3.saveActuals(testRun, o.svc[k], K3.actualsBody(refs, k)); await K3.uploadActualDoc(testRun, o.svc[k]); await K3.completeService(testRun, o.svc[k]); };
    const headOf = async (key: string) => (await CFGF.configOf(testRun, PF.priceItem(key as any).service)).items.find((i: any) => i.id === (base.items as any)[key].id);
    const impact = async (key: string) => data(await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: (base.items as any)[key].configId, itemId: (base.items as any)[key].id } }));
    const turn = (key: string, status: 'ACTIVE' | 'INACTIVE') => CFGF.setItemStatus(testRun, (base.items as any)[key], status);

    const q = await PF.quote(testRun, base, { customer: 'pending' });
    const cq = await PF.cqView(testRun, q);
    await BGK.setQuotationPrices(testRun, cq, { [base.items.customsFee.name]: P0.customsFeeAgreed });
    await BGK.confirmQuotation(testRun, q.rcId!);
    const txt = async (api: string, id: string, role: 'k1' | 'cc') => items(await data(await http.call(api, { token: tok(role), params: { id }, query: { page: 1, perPage: 100 } }))).map((h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`).join(' | ');
    const r = await txt('GET /api/quotation-requests/{id}/history', q.rfqId, 'k1');
    for (const rx of [/Tạo|CREATE/i, /Gửi|SUBMIT/i, /Tiếp nhận|ACCEPT/i]) expect(r, `YCBG: ${rx}`).toMatch(rx);
    const iq = await txt('GET /api/internal-quotes/{id}/history', q.iqId, 'cc');
    for (const rx of [/Tạo|CREATE/i, /Phát hành|ISSUE|PUBLISH/i]) expect(iq, `BGNB: ${rx}`).toMatch(rx);
    const rc = await txt('GET /api/customer-quotations/{id}/history', q.rcId!, 'k1');
    for (const rx of [/Điều chỉnh|PRICE/i, /Đồng ý|CONFIRM/i]) expect(rc, `RC: ${rx}`).toMatch(rx);

  });

  test("FLOW-HIST-003 Thông báo đến đúng người và đếm chưa đọc", { tag: ["@flow", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun, tok }) => {

    const list = async (role: 'cc' | 'k1') => { const d = await data(await http.call('GET /api/notifications', { token: tok(role), query: { limit: 100 } })); return Array.isArray(d) ? d : items(d); };
    const count = async () => { const d = await data(await http.call('GET /api/notifications/unread-count', { token: tok('cc') })); return typeof d === 'number' ? d : Number(Object.values(d ?? {})[0] ?? 0); };
    const n0 = await count();
    const r = await YC.createRfq(testRun, { submit: true });
    const note = (await list('cc')).find((x: any) => x.subjectId === r.id);
    expect(note, 'CC nhận thông báo').toBeTruthy();
    expect(await count(), 'CC +1 chưa đọc').toBe(n0 + 1);
    await must(await http.call('POST /api/notifications/{id}/read', { token: tok('cc'), params: { id: note.id } }), 'đọc');
    expect(await count(), 'Đọc xong giảm 1').toBe(n0);
    expect((await list('k1')).some((x: any) => x.subjectId === r.id && /gửi|yêu cầu báo giá/i.test(String(`${x.title} ${x.body}`))), 'K1 không nhận thông báo này').toBe(false);

  });

  test("FLOW-HIST-004 Lịch sử phiếu và nhật ký Tháp", { tag: ["@flow", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-HIST-004');
    const contractorId = env.ref('CONTRACTOR_A_ID');
    let refreshed = false;
    const o = await ORD.p0Order(testRun, 'COMPLETED', {
      base,
      editShift: true,
      before: { KHQ_DONE: async (order) => {
        const own = (await K3.costLines(testRun, order.svc.KHQ)).filter((line: any) => line.contractorId === contractorId);
        const fee = own.find((line: any) => line.priceConfigurationItemId === base.items.customsFee.id);
        expect(fee, 'Có dòng chi phí Cố định để làm mới').toBeTruthy();
        const source = await GM.sheetLine(testRun, base.sheetA, base.items.customsFee.id);
        const next = Number(fee.unitPrice) + 100_000;
        const update = await GM.changeLinePrice(testRun, base.sheetA, base.items.customsFee.id, next, false);
        const approval = await http.call('POST /api/purchase-prices/{id}/items/approve', {
          token: tok('k1'), params: { id: base.sheetA }, json: { itemIds: [update?.id ?? source.id] },
        });
        if ([404, 405, 501].includes(approval.status())) {
          markIncomplete('API phê duyệt dòng giá chưa khả dụng để tạo tiền điều kiện kiểm lịch sử Làm mới giá.');
          return;
        }
        expectStatusIn(approval, '200/204', 'phê duyệt đơn giá mới');
        const params = { id: order.id, type: refs.services.KHQ, costLineId: fee.costLineId };
        const price = await must(await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params }), 'đọc đơn giá mới đã phê duyệt');
        expect(price.changed).toBe(true);
        expectMoney(price.savedAmount, Number(fee.unitPrice));
        expectMoney(price.currentAmount, next);
        const lines = own.map((line: any) => ({
          costLineId: line.costLineId, unitCode: line.unitCode, quantity: Number(line.quantity),
          unitPrice: line.costLineId === fee.costLineId ? next : Number(line.unitPrice),
        }));
        expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', {
          token: tok('dp'), params: { id: order.id, type: refs.services.KHQ, contractorId }, json: { currency: 'VND', lines },
        }), '200/204', 'lưu giá mới');
        const persisted = (await K3.costLines(testRun, order.svc.KHQ)).find((line) => line.costLineId === fee.costLineId);
        expectMoney(persisted?.unitPrice, next);
        refreshed = true;
      } },
    });
    const readHistory = async (api: string, role: 'k1' | 'dp') => items(await must(await http.call(api, {
      token: tok(role), params: { id: o.id }, query: { page: 1, perPage: 100 },
    }), 'đọc lịch sử của phiếu'));
    const text = (entry: any) => [entry.eventCode, entry.eventLabel, entry.action, entry.summary, entry.description].filter(Boolean).join(' ');
    const orderHistory = await readHistory('GET /api/service-orders/{id}/history', 'k1');
    const edit = orderHistory.find((entry) => /(?:chỉnh sửa|sửa|cập nhật) doanh thu|REVENUE_(?:EDIT|UPDATE)|(?:EDIT|UPDATE)_REVENUE/i.test(text(entry)));
    const confirm = orderHistory.find((entry) => /xác nhận doanh thu|REVENUE_CONFIRM|CONFIRM_REVENUE/i.test(text(entry)));
    expect(edit?.id, 'Có sự kiện riêng Sửa doanh thu').toBeTruthy();
    expect(confirm?.id, 'Có sự kiện riêng Xác nhận doanh thu').toBeTruthy();
    expect(edit.id).not.toBe(confirm.id);
    const tower = await readHistory('GET /api/k3/service-orders/{id}/tower-log', 'dp');
    const coordinate = tower.find((entry) => /điều phối nhà thầu|COORDINAT/i.test(text(entry)));
    expect(coordinate?.id, 'Nhật ký có điều phối nhà thầu').toBeTruthy();
    if (refreshed) {
      const refresh = tower.find((entry) => /làm mới (?:đơn )?giá|(?:PRICE|COST)_REFRESH|REFRESH_(?:PRICE|COST)/i.test(text(entry)));
      expect(refresh?.id, 'Nhật ký có sự kiện Làm mới giá').toBeTruthy();
      expect(refresh.id).not.toBe(coordinate.id);
    }
    const permissions = await ADM.safeViewCodes(testRun, 1);
    const role = await ADM.newRole(testRun, permissions);
    expect(role.permissions).toEqual(permissions);
    const audit = await ADM.audit(testRun, role.id);
    const created = audit.find((entry) => entry.targetId === role.id && /(?:tạo|thêm mới) vai trò|(?:ROLE_)?CREATE/i.test(text(entry)));
    expect(created?.actorUserId, 'Audit ghi người tạo đúng vai trò vừa gán quyền').toBe(testRun.roles.admin.userId);
  });
});
