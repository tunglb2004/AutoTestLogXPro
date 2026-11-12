/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import { QuoteScenario, auditText } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';
import { P0_ITEMS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { p0Base, createOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { internalQuoteBody, expectedQuotePrices } from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
import { rfqBody, serviceEntry } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import { lineByName } from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import { exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
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
test.describe("Báo giá: YCBG → BGNB → BGKH đồng ý (thủ công và tự động)", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-QUOTE-001 YCBG gửi Định giá và được tiếp nhận", { tag: ["@flow", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const refs = await testRun.p0Refs();
    const r = await q.newRfq();
    expect((await q.rfq(r.id)).status).toBe('DRAFT');
    const file = REAL.pdf10();
    const upload = await q.call('POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents', 'k1', { params: { id: r.id, serviceTypeCode: refs.services.KHQ }, multipart: { file } });
    expectStatusIn(upload, '200/201/204');
    expectStatusIn(await q.call('POST /api/quotation-requests/{id}/submit', 'k1', { params: { id: r.id } }), '200/201/204');
    expect((await q.rfq(r.id)).status).toBe('AWAITING_PRICING');
    await expect.poll(async () => (await q.notifications(r.id)).length, { timeout: 20_000 }).toBeGreaterThan(0);
    expectStatusIn(await q.call('POST /api/quotation-requests/{id}/accept', 'cc', { params: { id: r.id } }), '200/201/204');
    const current = await q.rfq(r.id);
    const me = await must(await q.call('GET /api/auth/me', 'cc'), 'CC hiện tại');
    expect(current.status).toBe('PRICING_IN_PROGRESS');
    expect(current.pricingOwnerId).toBe(me.id ?? me.userId);
    const svc = current.services.find((s: any) => s.serviceTypeCode === refs.services.KHQ);
    expect(svc.documents.some((d: any) => d.filename === file.name && d.byteSize === file.buffer.length)).toBe(true);

  });

  test("FLOW-QUOTE-002 Lập BGNB thủ công từ giá bán định mức và phát hành", { tag: ["@flow", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const base = await p0Base(testRun);
    const r = await q.pricing();
    const selectable = await q.call('GET /api/internal-quotes/selectable-requests', 'cc', { query: { search: r.code, limit: 200 } });
    expectStatusIn(selectable, '200/201/204');
    expect(items(await data(selectable)).some((x: any) => x.id === r.id)).toBe(true);
    const options = await q.call('GET /api/internal-quotes/sheet-options', 'cc', { query: { quotationRequestId: r.id } });
    expectStatusIn(options, '200/201/204');
    expect(items(await data(options))).toHaveLength(5);
    for (const p of P0_ITEMS.filter(p => p.inQuote)) {
      const candidates = await q.call('GET /api/internal-quotes/benchmark-lines', 'cc', { query: { priceConfigurationItemId: base.items[p.key].id, limit: 200 } });
      expectStatusIn(candidates, '200/201/204');
      const hit = items(await data(candidates)).find((l: any) => l.id === base.ssp[p.key]);
      expect(hit, `SSP ${p.name}`).toBeTruthy();
      expectMoney(hit.sellingPrice, p.ssp!);
    }
    const payload = await internalQuoteBody(testRun, r.id, q.map(base), { name: tagged('AT BGNB FLOW002') });
    const expected = await expectedQuotePrices(testRun, payload.tables.flatMap(table => table.lines));
    expectStatusIn(await q.call('POST /api/internal-quotes', 'cc', { json: payload }), '200/201/204');
    const short = await q.read('GET /api/quotation-requests/{id}/internal-quote', r.id, 'cc');
    const iq = await q.iq(short.id);
    expect(iq.tables).toHaveLength(5);
    expectMoney(iq.total, 15_700_000);
    expectPercent(iq.expectedProfitPercent, expected.profitPercent, 2);
    expectStatusIn(await q.call('POST /api/internal-quotes/{id}/issue', 'cc', { params: { id: iq.id } }), '200/201/204');
    expect((await q.rfq(r.id)).status).toBe('PRICED');

  });

  test("FLOW-QUOTE-003 Tạo BGKH, VAT 8%, điều chỉnh giá chốt, khách đồng ý", { tag: ["@flow", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    await exclusive('kh-c', async () => {
      const q = new QuoteScenario(testRun);
      const x = await q.issued({ customerId: env.ref('CUSTOMER_C_ID') });
      const response = await q.call('POST /api/quotation-requests/{id}/customer-quotation', 'k1', { params: { id: x.rfq.id } });
      expectStatusIn(response, '200/201/204');
      const cq = await data(response);
      try {
        const other = items(await must(await q.call('GET /api/customer-quotations', 'k1', { query: { customerId: cq.customerId, status: ['ACTIVE'], perPage: 100 } }), 'RC hiện tại của KH_C'));
        expect(other.filter((c: any) => c.isDefault), 'Tiền điều kiện: KH_C chưa có RC mặc định').toHaveLength(0);
        expectStatusIn(await q.call('PUT /api/customer-quotations/{id}/settings', 'k1', { params: { id: cq.id }, json: { currency: 'VND', vatBand: 'VAT_8' } }), '200/201/204');
        const line = lineByName(await q.cq(cq.id), 'Phí khai báo');
        expectStatusIn(await q.call('PUT /api/customer-quotations/{id}/prices', 'k1', { params: { id: cq.id }, json: { lines: [{ lineId: line.id, sellPrice: 1_150_000 }] } }), '200/201/204');
        const before = await q.cq(cq.id);
        expectMoney(before.subtotal, 15_650_000); expectMoney(before.vatAmount, 1_252_000); expectMoney(before.total, 16_902_000);
        expect(before.hasDeepDiscount).toBe(true);
        expectPercent(lineByName(before, 'Phí khai báo').adjustmentPercent, -4.17, 2);
        expectStatusIn(await q.call('POST /api/customer-quotations/{id}/confirm', 'k1', { params: { id: cq.id } }), '200/201/204');
        const agreed = await q.cq(cq.id);
        expect(agreed.status).toBe('ACTIVE'); expect(agreed.isDefault).toBe(true); expect(agreed.canBeEdited).toBe(false);
        expect(String((await q.iq(x.iq.id)).result)).toMatch(/WON|SUCCESS|Thành công/i);
      } finally {
        if ((await q.cq(cq.id)).status === 'ACTIVE') await must(await q.call('POST /api/customer-quotations/{id}/deactivate', 'k1', { params: { id: cq.id }, json: { reason: 'Dọn RC riêng FLOW-QUOTE-003' } }), 'dọn RC KH_C');
      }
    });

  });

  test("FLOW-QUOTE-004 KH_A xuất hiện để lập phiếu kèm RC mặc định", { tag: ["@flow", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const base = await p0Base(testRun);
    const cq = await q.cq(base.rcId);
    expect(cq.status).toBe('ACTIVE'); expect(cq.isDefault).toBe(true);
    // RC đã ACTIVE theo tiền điều kiện; không xác nhận lần hai (đó là RC-086).
    const res = await q.call('GET /api/service-orders/selectable-customers', 'k1', { query: { search: cq.customerName, limit: 200 } });
    expectStatusIn(res, '200/201/204');
    const customer = items(await data(res)).find((c: any) => c.id === base.customerId);
    expect(customer, 'KH_A chọn được khi lập phiếu').toBeTruthy();
    const created = await createOrder(testRun, { customerId: base.customerId, rcId: '' }, { submit: false });
    const order = await q.read('GET /api/service-orders/{id}', created.id);
    expect(order.customerQuotationId, 'Tự kế thừa RC mặc định vừa đồng ý').toBe(base.rcId);

  });

  test("FLOW-QUOTE-005 Định giá từ chối → K1 sửa → khôi phục → tiếp nhận", { tag: ["@flow", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const refs = await testRun.p0Refs();
    const original = await rfqBody(testRun);
    const r = await q.newRfq(true);
    expectStatusIn(await q.call('POST /api/quotation-requests/{id}/internal-quote/decline', 'cc', { params: { id: r.id }, json: { reason: 'Thiếu loại xe' } }), '200/201/204');
    const declined = await q.rfq(r.id);
    expect(declined.status).toBe('PRICING_DECLINED'); expect(declined.declineReason).toBe('Thiếu loại xe');
    const another = (await testRun.catalog('GET /api/catalogues/vehicle-types')).find((v: any) => v.code !== refs.vehicleType);
    expect(another, 'Danh mục có loại xe bổ sung khác 40ft').toBeTruthy();
    const edit = await rfqBody(testRun, { serviceInfo: { ...(original.serviceInfo as object), vehicleTypeCodes: [refs.vehicleType, another.code] } });
    expectStatusIn(await q.call('PUT /api/quotation-requests/{id}', 'k1', { params: { id: r.id }, json: edit }), '200/201/204');
    expectStatusIn(await q.call('POST /api/quotation-requests/{id}/restore', 'k1', { params: { id: r.id } }), '200/201/204');
    expect((await q.rfq(r.id)).status).toBe('AWAITING_PRICING');
    expectStatusIn(await q.call('POST /api/quotation-requests/{id}/accept', 'cc', { params: { id: r.id } }), '200/201/204');
    const after = await q.rfq(r.id);
    expect(after.status).toBe('PRICING_IN_PROGRESS');
    expect(JSON.stringify(after.serviceInfo)).toContain(another.code);
    const history = (await q.history(r.id)).map(auditText).join('\n');
    for (const event of [/tạo|create/i, /từ chối|declin/i, /sửa|cập nhật|updat/i, /khôi phục|restor/i, /tiếp nhận|accept/i]) expect(history).toMatch(event);

  });

  test("FLOW-QUOTE-006 Thu hồi BGNB khi chưa có BGKH, sửa và phát hành lại", { tag: ["@flow", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.issued();
    expectStatusIn(await q.call('POST /api/internal-quotes/{id}/withdraw', 'cc', { params: { id: x.iq.id }, json: { reason: 'Cập nhật giá mới' } }), '200/201/204');
    const withdrawn = await q.rfq(x.rfq.id);
    expect(withdrawn.status).toBe('PRICING_IN_PROGRESS');
    expect(withdrawn.internalQuote, 'BGNB thu hồi ẩn khỏi RFQ của K1').toBeFalsy();
    const payload = structuredClone(x.payload);
    for (const t of payload.tables) for (const l of t.lines) if (l.priceConfigurationItemId === x.base.items.freight.id) l.unitPrice = 11_500_000;
    expectStatusIn(await q.call('PUT /api/internal-quotes/{id}', 'cc', { params: { id: x.iq.id }, json: payload }), '200/201/204');
    expectStatusIn(await q.call('POST /api/internal-quotes/{id}/issue', 'cc', { params: { id: x.iq.id } }), '200/201/204');
    expectMoney((await q.iq(x.iq.id)).total, 16_200_000);
    expect((await q.rfq(x.rfq.id)).status).toBe('PRICED');
    expectStatusIn(await q.call('POST /api/quotation-requests/{id}/customer-quotation', 'k1', { params: { id: x.rfq.id } }), '200/201/204');
    const before = stable(await q.iq(x.iq.id));
    const blocked = await q.call('POST /api/internal-quotes/{id}/withdraw', 'cc', { params: { id: x.iq.id }, json: { reason: 'Không được thu hồi sau khi có RC' } });
    expectStatusIn(blocked, '400/409/422'); await expectApiError(blocked);
    expect(stable(await q.iq(x.iq.id))).toEqual(before);

  });

  test("FLOW-QUOTE-007 K1 lấy tự động BGNB rồi tạo BGKH", { tag: ["@flow", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(600_000);
    await ORD.p0Base(testRun);
    const r = await YC.createRfq(testRun, {});
    const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
    const iq = await data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: a.internalQuoteId } }));
    expect(String(iq.source ?? ''), 'Nguồn Tự động').toMatch(/AUTO|Tự động/i);
    expect(`${iq.createdBy ?? ''} ${iq.issuedBy ?? ''}`, 'Người tạo/phát hành "Hệ thống"').toMatch(/Hệ thống[\s\S]*Hệ thống/i);
    expectMoney(iq.total, P0.internalQuoteTotal, 'Tổng 15.700.000');
    expect((await YC.getRfq(testRun, r.id)).status, 'YCBG PRICED').toBe('PRICED');
    const cq = await BGK.getCustomerQuotation(testRun, (await BGK.createCustomerQuotation(testRun, r.id)).id);
    expectMoney(cq.subtotal, P0.internalQuoteTotal, 'RC subtotal 15.700.000');

  });

  test("FLOW-QUOTE-008 Lấy tự động thiếu giá một dịch vụ → xác nhận vẫn tạo BGKH", { tag: ["@flow", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(600_000);
    const refs = await testRun.p0Refs();
    await ORD.p0Base(testRun);
    const it = await CFGF.p0Items(testRun, `Q8${TEST_RUN_ID}`, 'k1', ['storage']);
    await GM.ensureContractorLines(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [GM.priceLine(refs, it, 'storage', 500_000)], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
    const r = await YC.createRfq(testRun, {});
    const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
    const iq = await data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: a.internalQuoteId } }));
    expect((iq.tables ?? []).filter((t: any) => t.serviceTypeCode === refs.services.KB).every((t: any) => t.disabled), 'Bảng KB disable').toBe(true);
    const created = await http.call('POST /api/quotation-requests/{id}/customer-quotation', { token: tok('k1'), params: { id: r.id }, query: { confirmed: true } });
    expectStatusIn(created, '200/201', 'xác nhận vẫn tạo BGKH');
    const cq = await BGK.getCustomerQuotation(testRun, (await data(created)).id);
    expect(new Set((cq.sourceSheets ?? []).filter((s: any) => !s.disabled).map((s: any) => s.serviceTypeCode)).size, 'BGKH chỉ có 4 biểu giá').toBe(4);
    expectMoney(cq.subtotal, P0.internalQuoteTotal - 600_000, 'subtotal 15.100.000');

  });

  test("FLOW-QUOTE-009 Hủy YCBG giữa chừng", { tag: ["@flow", "@quan-ly-bao-gia", "@p3"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const r = await q.newRfq(true);
    expectStatusIn(await q.call('POST /api/quotation-requests/{id}/cancel', 'k1', { params: { id: r.id }, json: { reason: 'Khách hoãn' } }), '200/201/204');
    const before = stable(await q.rfq(r.id));
    expect(before.status).toBe('CANCELLED'); expect(before.cancelReason).toBe('Khách hoãn');
    const h0 = await q.history(r.id);
    const accept = await q.call('POST /api/quotation-requests/{id}/accept', 'cc', { params: { id: r.id } });
    expectStatusIn(accept, '400/409/422'); await expectApiError(accept);
    expect(stable(await q.rfq(r.id))).toEqual(before);
    expect(await q.history(r.id)).toEqual(h0);
    expect(h0.some(h => /hủy|cancel/i.test(auditText(h)) && JSON.stringify(h).includes('Khách hoãn'))).toBe(true);

  });

  test("FLOW-QUOTE-010 Gửi → sửa khi Chờ báo giá → Định giá tiếp nhận → không sửa được nữa", { tag: ["@flow", "@quan-ly-bao-gia", "@p1", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    const q = new QuoteScenario(testRun);
    const refs = await testRun.p0Refs();
    const r = await q.newRfq();
    expectStatusIn(await q.call('POST /api/quotation-requests/{id}/submit', 'k1', { params: { id: r.id } }), '200/201/204');
    const bn = await testRun.pick('GET /api/catalogues/provinces', /Bắc Ninh/i, { countryCode: 'VN' });
    const vt: any = serviceEntry(refs, 'VT');
    vt.routes.push({ pickup: { ...refs.origin }, delivery: { pointType: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, placeName: 'KCN Quế Võ, Bắc Ninh' } });
    const payload = await rfqBody(testRun, { services: ['KHQ', 'HQGS', 'VT', 'ST', 'KB'].map(k => k === 'VT' ? vt : serviceEntry(refs, k as ServiceKey)) });
    expectStatusIn(await q.call('PUT /api/quotation-requests/{id}', 'k1', { params: { id: r.id }, json: payload }), '200/201/204');
    const edited = await q.rfq(r.id, 'cc');
    expect(edited.status).toBe('AWAITING_PRICING');
    expect(JSON.stringify(edited.transportLegs)).toContain(bn.code);
    const notes = await q.notifications(r.id);
    test.info().annotations.push({ type: 'Chờ xác nhận', description: `Số thông báo cho Pricing sau sửa: ${notes.length}; không dùng làm oracle khi TC đang chờ BA` });
    expectStatusIn(await q.call('POST /api/quotation-requests/{id}/accept', 'cc', { params: { id: r.id } }), '200/201/204');
    const current = stable(await q.rfq(r.id));
    expect(current.status).toBe('PRICING_IN_PROGRESS');
    expect(JSON.stringify(current.transportLegs)).toContain(bn.code);
    const forbidden = await q.call('PUT /api/quotation-requests/{id}', 'k1', { params: { id: r.id }, json: { ...payload, generalNote: 'Không được lưu sau tiếp nhận' } });
    expectStatusIn(forbidden, '400/409/422'); await expectApiError(forbidden);
    expect(stable(await q.rfq(r.id))).toEqual(current);
    const history = (await q.history(r.id)).map(auditText).join('\n');
    for (const action of [/gửi|submit/i, /sửa|cập nhật|updat/i, /tiếp nhận|accept/i]) expect(history).toMatch(action);

  });

  test("FLOW-QUOTE-011 BGNB tự động → thu hồi → sửa → phát hành lại", { tag: ["@flow", "@quan-ly-bao-gia", "@p2", "@cho-xac-nhan"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(600_000);
    const base = await ORD.p0Base(testRun);
    const r = await YC.createRfq(testRun, {});
    const a = await must(await http.call('POST /api/quotation-requests/{id}/auto-internal-quote', { token: tok('k1'), params: { id: r.id } }), 'lấy tự động BGNB');
    const IQ = async () => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: a.internalQuoteId } }));
    const iq0 = await IQ();
    await must(await http.call('POST /api/internal-quotes/{id}/withdraw', { token: tok('cc'), params: { id: a.internalQuoteId }, json: { reason: 'Sửa đơn giá Vận tải' } }), 'thu hồi');
    expect((await YC.getRfq(testRun, r.id)).status, 'YCBG về PRICING_IN_PROGRESS').toBe('PRICING_IN_PROGRESS');
    const tables = (iq0.tables ?? []).map((t: any) => ({ serviceTypeCode: t.serviceTypeCode, name: t.name, attributes: Object.fromEntries(Object.entries(t.attributes ?? {}).filter(([, v]: any) => v?.code).map(([k, v]: any) => [`${k}Code`, v.code])), lines: (t.lines ?? []).map((l: any) => ({ priceConfigurationItemId: l.itemId, standardSellingPriceId: l.standardSellingPriceId, unitPrice: l.itemId === base.items.freight.id ? 11_500_000 : l.unitPrice })) }));
    await must(await http.call('PUT /api/internal-quotes/{id}', { token: tok('cc'), params: { id: a.internalQuoteId }, json: { quotationRequestId: r.id, name: iq0.name, validFrom: iq0.validFrom, validTo: iq0.validTo, currency: iq0.currency, terms: iq0.terms ?? '', tables } }), 'sửa đơn giá VT');
    await must(await http.call('POST /api/internal-quotes/{id}/issue', { token: tok('cc'), params: { id: a.internalQuoteId } }), 'phát hành lại');
    const iq = await IQ();
    expect((await YC.getRfq(testRun, r.id)).status, 'YCBG PRICED').toBe('PRICED');
    expectMoney(iq.total, Number(iq0.total) + 500_000, 'Tổng tăng 500.000 (bộ P0: 16.200.000)');
    expect(String(iq.createdBy ?? ''), 'Người tạo vẫn "Hệ thống"').toMatch(/Hệ thống/i);
    const me = await data(await http.call('GET /api/auth/me', { token: tok('cc') }));
    expect([me.displayName, me.email].some((n: string) => String(iq.issuedBy ?? '').includes(n)), `Người phát hành = CC (${iq.issuedBy})`).toBe(true);
    test.info().annotations.push({ type: 'Chờ xác nhận', description: `Nguồn tạo sau khi sửa tay: ${iq.source}` });

  });
});
