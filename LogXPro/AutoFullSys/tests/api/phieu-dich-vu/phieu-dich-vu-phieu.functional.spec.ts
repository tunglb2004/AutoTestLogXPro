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
import { exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { QuoteScenario } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Phiếu dịch vụ (Khối 1)", () => {
  test("ORD-002 Khách hàng lập được phiếu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    await p0Base(testRun);
    const res = await http.call('GET /api/service-orders/selectable-customers', { token: tok('k1'), query: { perPage: 200 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const a = list.find((c: any) => c.id === env.ref('CUSTOMER_A_ID'));
    expect(a, 'Có KH_A').toBeTruthy();
    expect((a.contracts ?? []).length, 'KH_A kèm HĐ hiệu lực').toBeGreaterThan(0);
    expect((a.quotations ?? []).some((q: any) => q.isDefault === true), 'KH_A kèm RC mặc định').toBe(true);
    expect(list.some((c: any) => c.id === env.ref('CUSTOMER_C_ID')), 'Không có KH_C (chưa có RC hiệu lực)').toBe(false);
    expect(list.some((c: any) => c.id === env.ref('CUSTOMER_B_ID')), 'Không có khách K1 không phụ trách').toBe(false);

  });

  test("ORD-003 Khách có RC hiệu lực nhưng HĐ hết hiệu lực", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, tok }) => {

    const res = await http.call('GET /api/service-orders/selectable-customers', { token: tok('k1'), query: { perPage: 200 } });
    expectStatusIn(res, '200');
    expect(items(await data(res)).some((c: any) => c.id === env.ref('CUSTOMER_D_ID')), 'Không có KH_D (HĐ hết hiệu lực)').toBe(false);

  });

  test("ORD-004 Khách chưa có RC mặc định", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, tok }) => {
    test.setTimeout(900_000);
    await exclusive('kh-e', async () => {
      const res = await http.call('GET /api/service-orders/selectable-customers', { token: tok('k1'), query: { perPage: 200 } });
      expectStatusIn(res, '200');
      const e = items(await data(res)).find((c: any) => c.id === env.ref('CUSTOMER_E_ID'));
      expect(e, 'Có KH_E').toBeTruthy();
      expect(e.quotations?.length, 'KH_E có ≥ 2 RC hiệu lực').toBeGreaterThanOrEqual(2);
      for (const q of e.quotations) expect(q.isDefault, 'KH_E chưa có báo giá mặc định').toBe(false);
    });
  });

  test("ORD-012 Tìm theo biển số xe nhận", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'CHANG1_DONE');
    const res = await http.call('GET /api/service-orders', { token: tok('k1'), query: { deliveryPlateNo: '29C-123', perPage: 100 } });
    expectStatusIn(res, '200');
    expect(items(await data(res)).some((x: any) => x.id === o.id), 'Tìm được P0 theo biển số xe nhận').toBe(true);

  });

  test("ORD-013 Khoảng ngày tạo", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    await p0Order(testRun, 'SUBMITTED');
    const d = today();
    const res = await http.call('GET /api/service-orders', { token: tok('k1'), query: { createdFrom: d, createdTo: d, perPage: 100 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.length, 'Có phiếu hôm nay').toBeGreaterThan(0);
    const local = (iso: string) => new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    for (const o of list) expect(local(o.createdAt), `${o.code} tạo hôm nay`).toBe(d);

  });

  test("ORD-018 Tạo phiếu đủ 5 dịch vụ và gửi điều phối", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: await orderBody(testRun, base) });
    expectStatusIn(res, '200/201');
    const created = await data(res);
    expect(created.code).toMatch(/^ORD\d{6}-\d{3,}$/);
    expect(created.status).toBe('SUBMITTED');
    const list = items(await data(await http.call('GET /api/service-orders', { token: tok('k1'), query: { search: created.code } })));
    expect(list.some((x: any) => x.id === created.id), 'Đọc lại thấy phiếu').toBe(true);
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 50 } }))), 'CC nhận thông báo').toContain(created.code);
    const tables = await revenueOf(testRun, created.id);
    for (const s of SERVICE_KEYS) {
      const t = revenueTable(tables, refs.services[s]);
      expect(t?.matched, `${s} khớp RC`).toBe(true);
      expect((t.lines ?? []).every((l: any) => /Cố định/i.test(String(l.priceTypeName ?? '')) || /FIXED/i.test(String(l.priceTypeCode ?? ''))), `${s}: chỉ dòng Cố định`).toBe(true);
    }

  });

  test("ORD-019 Lưu nháp không báo K3", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const payload = await orderBody(testRun, base);
    const refs = await testRun.p0Refs();
    payload.services = (payload.services as any[]).map((s) => (s.serviceTypeCode === refs.services.VT ? { serviceTypeCode: s.serviceTypeCode } : s));
    const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: false }, json: payload });
    expectStatusIn(res, '200/201');
    const created = await data(res);
    expect(created.status).toBe('DRAFT');
    expect(String(created.code ?? '').length, 'Có mã').toBeGreaterThan(0);
    expect(JSON.stringify(await data(await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 50 } }))), 'CC không có thông báo phiếu nháp').not.toContain(created.code);

  });

  test("ORD-020 Khách không đủ điều kiện", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const payload = await orderBody(testRun, { rcId: '', customerId: env.ref('CUSTOMER_C_ID') });
    void base;
    const marker = tagged('AT-KHC');
    payload.customerRef = marker.slice(0, 50);
    const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: payload });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(await testRun.listContains('GET /api/service-orders', marker.slice(0, 50), 'k1'), 'Không tạo phiếu').toBe(false);

  });

  test("ORD-021 Gửi thiếu trường bắt buộc theo dịch vụ", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const payload = await orderBody(testRun, base);
    payload.services = (payload.services as any[]).map((s) => (s.serviceTypeCode === refs.services.KHQ ? { ...s, customsOfficeCode: undefined } : s));
    const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: payload });
    expectStatusIn(res, '400/422');
    const err = await expectApiError(res);
    expect(JSON.stringify(err.data ?? err), 'Liệt kê trường thiếu Chi cục HQ của KHQ').toMatch(/customsOffice/i);

  });

  test("ORD-022 Dịch vụ không có trong RC vẫn tạo được", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const cold = await testRun.pick('GET /api/catalogues/warehouse-types', /đông lạnh/i);
    const payload = await orderBody(testRun, base);
    payload.services = (payload.services as any[]).map((s) => (s.serviceTypeCode === refs.services.KB ? { ...s, warehouseTypeId: cold.id } : s));
    const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: payload });
    expectStatusIn(res, '200/201');
    const t = revenueTable(await revenueOf(testRun, (await data(res)).id), refs.services.KB);
    expect(t.matched, 'KB không khớp biểu giá').toBe(false);
    expect(t.lines ?? [], 'Bảng doanh thu KB trống').toHaveLength(0);
    expect(String(t.unmatchedReason ?? '').length, 'Kèm lý do').toBeGreaterThan(0);

  });

  test("ORD-023 Chọn RC không mặc định thì RC đó thành mặc định", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {
    test.setTimeout(900_000);
    const customerId = env.ref('CUSTOMER_E_ID');
    const quotes = new QuoteScenario(testRun);
    const base = await p0Base(testRun);
    await exclusive('kh-e', async () => {
      const readCustomer = async () => {
        const customers = await must(await http.call('GET /api/service-orders/selectable-customers', { token: tok('k1'), query: { perPage: 200 } }), 'khách chọn được');
        const customer = items(customers).find((c: any) => c.id === customerId);
        expect(customer, 'Có KH_E').toBeTruthy();
        return customer;
      };
      const before = await readCustomer();
      expect(before.quotations?.length, 'KH_E có ≥ 2 RC hiệu lực').toBeGreaterThanOrEqual(2);
      for (const q of before.quotations) expect(q.isDefault, 'KH_E chưa có báo giá mặc định').toBe(false);
      const owned = await quotes.active({ base, customerId });
      try {
        expect(owned.cq).toMatchObject({ status: 'ACTIVE', isDefault: false });
        const payload = await orderBody(testRun, { customerId, rcId: owned.cq.id }, { customerContractId: before.contracts?.[0]?.id });
        const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: false }, json: payload });
        expectStatusIn(res, '200/201');
        expect((await quotes.cq(owned.cq.id)).isDefault, 'RC được chọn thành mặc định').toBe(true);
      } finally {
        const res = await quotes.call('POST /api/customer-quotations/{id}/deactivate', 'k1', {
          params: { id: owned.cq.id }, json: { reason: 'Dọn báo giá riêng ORD-023' },
        });
        expectStatusIn(res, '200/204', 'Trả KH_E về trạng thái chưa có báo giá mặc định');
        const after = await readCustomer();
        const originals = (customer: any) => customer.quotations.map((q: any) => [q.id, q.isDefault]).sort();
        expect(originals(after), 'Giữ nguyên các báo giá ban đầu của KH_E').toEqual(originals(before));
      }
    });
  });

  test("ORD-024 RC có biểu giá Disable", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    // RC riêng có biểu giá KHQ bị Disable do giá bán định mức đổi (BR_BG_53): dựng bộ P0 riêng rồi đổi SSP Phí khai báo.
    const base = await buildP0(testRun, `D${TEST_RUN_ID}`);
    const refs = await testRun.p0Refs();
    await must(await http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: tok('cc'), params: { id: base.ssp.customsFee! }, json: { sellingPrice: 1_250_000 } }), 'đổi giá bán định mức Phí khai báo');
    const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: await orderBody(testRun, base) });
    expectStatusIn(res, '200/201');
    const t = revenueTable(await revenueOf(testRun, (await data(res)).id), refs.services.KHQ);
    const fee = (t?.lines ?? []).find((l: any) => String(l.itemName ?? '').includes('Phí khai báo'));
    expect(fee?.quotationExpired, 'Dòng KHQ nhãn Hết hạn báo giá').toBe(true);
    expect(fee.unitPrice ?? null, 'Đơn giá "—"').toBeNull();
    expect(fee.amount ?? null, 'Thành tiền "—"').toBeNull();

  });

  test("ORD-041 Chỉnh sửa phiếu Tạo mới", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const before = await getOrder(testRun, o.id);
    const note = `Cập nhật ghi chú ${TEST_RUN_ID}`;
    const res = await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: await orderBody(testRun, base, { generalNote: note, weight: 15000 }) });
    expectStatusIn(res, '200/204');
    const after = await getOrder(testRun, o.id);
    expect(after.generalNote).toBe(note);
    expect(Number(after.weight)).toBe(15000);
    for (const k of ['customerId', 'customerContractId', 'customerQuotationId']) expect(after[k], `${k} không đổi`).toBe(before[k]);

  });

  test("ORD-042 Sửa sau khi K3 tiếp nhận", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const before = stable(await getOrder(testRun, o.id));
    const res = await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: await orderBody(testRun, o.base, { generalNote: 'Sửa sau tiếp nhận' }) });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await getOrder(testRun, o.id)).generalNote, 'Thông tin thương mại chỉ đọc').toBe(before.generalNote);

  });

  test("ORD-043 Đổi báo giá áp dụng khi sửa", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const sel = items(await must(await http.call('GET /api/service-orders/selectable-customers', { token: tok('k1'), query: { perPage: 200 } }), 'khách chọn được'));
    const other = (sel.find((c: any) => c.id === base.customerId)?.quotations ?? []).find((q: any) => q.id !== base.rcId);
    expect(other, 'Tiền điều kiện: KH_A có RC khác RC đang áp dụng').toBeTruthy();
    const res = await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: await orderBody(testRun, { ...base, rcId: other.id }) });
    expectStatusIn(res, '200/400');
    const after = await getOrder(testRun, o.id);
    if (res.status() === 200) expect(after.customerQuotationId, 'Nếu cho đổi thì phiếu dùng RC mới').toBe(other.id);
    else expect(after.customerQuotationId, 'Báo giá cố định khi chỉnh sửa').toBe(base.rcId);

  });

  test("ORD-052 Xóa phiếu Nháp", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('DELETE /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    expectStatusIn(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } }), '404', 'Xóa vĩnh viễn');
    const next = await createOrder(testRun, base, { submit: false });
    expect(next.code, 'Mã không tái sử dụng').not.toBe(o.code);

  });

  test("ORD-053 Vòng đời phiếu nháp tạo → sửa → xóa", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const r1 = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: false }, json: await orderBody(testRun, base) });
    expectStatusIn(r1, '200/201/204', 'tạo');
    const o = await data(r1);
    const r2 = await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r2, '200/201/204', 'đọc');
    expect((await data(r2)).status).toBe('DRAFT');
    const r3 = await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: await orderBody(testRun, base, { generalNote: 'Vòng đời nháp' }) });
    expectStatusIn(r3, '200/201/204', 'sửa');
    expect((await getOrder(testRun, o.id)).generalNote, 'Đọc lại đúng').toBe('Vòng đời nháp');
    const r4 = await http.call('DELETE /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(r4, '200/201/204', 'xóa');
    expectStatusIn(await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } }), '404', 'sau xóa');

  });

  test("ORD-054 Xóa phiếu đã gửi", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('DELETE /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect((await getOrder(testRun, o.id)).status, 'Phiếu còn').toBe('SUBMITTED');

  });

  test("ORD-218 K1 trả lời đề xuất phạm vi", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const { order, requestId } = await scopeRequestOrder(testRun);
    const res = await http.call('POST /api/service-orders/{id}/scope-requests/{requestId}/respond', { token: tok('k1'), params: { id: order.id, requestId }, json: { accept: true, note: 'Đồng ý thêm kho' } });
    expectStatusIn(res, '200/204');
    const r = ((await data(await http.call('GET /api/service-orders/{id}/scope-requests', { token: tok('k1'), params: { id: order.id } }))).items ?? []).find((x: any) => x.id === requestId);
    expect(r.status, 'Ghi đồng ý').toBe('ACCEPTED');
    expect((await getOrder(testRun, order.id)).services, 'Dịch vụ của phiếu không tự thay đổi').toHaveLength(4);

  });

  test("ORD-219 Đồng ý không tự thêm dịch vụ", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const { order, requestId } = await scopeRequestOrder(testRun);
    const refs = await testRun.p0Refs();
    const res = await http.call('POST /api/service-orders/{id}/scope-requests/{requestId}/respond', { token: tok('k1'), params: { id: order.id, requestId }, json: { accept: true, note: 'Đồng ý thêm kho' } });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, order.id)).services.some((s: any) => s.serviceTypeCode === refs.services.KB), 'Phiếu vẫn chưa có KB').toBe(false);

  });

  test("ORD-007 Trạng thái phiếu kèm nhãn", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, tok }) => {

    const res = await http.call('GET /api/service-orders/statuses', { token: tok('k1') });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.map((s: any) => s.code).sort()).toEqual(['ACCEPTED', 'CANCELLED', 'COMPLETED', 'DRAFT', 'IN_PROGRESS', 'PERFORMED', 'REJECTED', 'SUBMITTED']);
    for (const s of list) expect(String(s.name ?? '').length, `Nhãn của ${s.code}`).toBeGreaterThan(0);

  });

  test("ORD-010 Danh sách phiếu của khách mình phụ trách", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    await p0Order(testRun, 'SUBMITTED');
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/service-orders', { token: tok('k1'), query: { status: ['SUBMITTED', 'ACCEPTED'], serviceTypeCode: [refs.services.VT, refs.services.KB], perPage: 100 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.length, 'Có phiếu khớp bộ lọc').toBeGreaterThan(0);
    for (const o of list) {
      expect(['SUBMITTED', 'ACCEPTED'], `${o.code}: trạng thái thuộc 1 trong 2`).toContain(o.status);
      expect(o.serviceTypeCodes, `${o.code}: chứa VT`).toContain(refs.services.VT);
      expect(o.serviceTypeCodes, `${o.code}: chứa KB`).toContain(refs.services.KB);
      expect(o).toHaveProperty('deliveryPlateNo');
    }
    const first = list[0];
    const sum = await data(await http.call('GET /api/service-orders/{id}/cost-revenue-summary', { token: tok('k1'), params: { id: first.id } }));
    expectMoney(first.totalCost ?? 0, Number(sum?.totalCost ?? 0), 'totalCost khớp tổng hợp phiếu');
    expectMoney(first.totalRevenue ?? 0, Number(sum?.totalRevenue ?? 0), 'totalRevenue khớp tổng hợp phiếu');

  });

  test("ORD-026 Doanh thu ban đầu chỉ dòng Cố định", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const res = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: true }, json: await orderBody(testRun, base) });
    expectStatusIn(res, '200/201');
    const tables = await revenueOf(testRun, (await data(res)).id);
    for (const s of SERVICE_KEYS) {
      const t = revenueTable(tables, refs.services[s]);
      expectMoney(t.total, P0.fixedRevenue[s], `Doanh thu ban đầu ${s}`);
      expect(t.estimated, `${s} estimated`).toBe(true);
    }
    const khq = revenueTable(tables, refs.services.KHQ);
    expect((khq.lines ?? []).some((l: any) => String(l.itemName ?? '').includes('Phí ngoài giờ')), 'Không có Phí ngoài giờ').toBe(false);

  });

  test("ORD-035 Chi tiết phiếu kèm thao tác cho phép", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'SUBMITTED');
    const res = await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    for (const k of ['customerId', 'tradeTypeCode', 'places', 'services', 'vehicles']) expect(d, `Có khối ${k}`).toHaveProperty(k);
    expect(Array.isArray(d.services) && d.services.length === 5, 'Dịch vụ dạng danh sách phẳng 5 dịch vụ').toBe(true);
    const acts = JSON.stringify(d.availableActions ?? []);
    expect(acts, 'Có thao tác Hủy').toMatch(/CANCEL/i);
    expect(acts, 'Có thao tác Chỉnh sửa').toMatch(/EDIT|UPDATE/i);

  });

  test("ORD-037 Sau xác nhận chặng hiển thị theo chặng", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const legs = [...((await data(res)).legs ?? [])].sort((a: any, b: any) => a.position - b.position);
    const codes = (leg: any) => (leg?.services ?? []).map((s: any) => s.serviceTypeCode ?? s.code ?? s).sort();
    expect(codes(legs[0]), 'Chặng 1: KHQ, HQGS, ST, KB').toEqual([refs.services.KHQ, refs.services.HQGS, refs.services.ST, refs.services.KB].sort());
    expect(codes(legs[1]), 'Chặng 2: VT').toEqual([refs.services.VT]);

  });

  test("ORD-045 Sửa không đổi mã phiếu", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const res = await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: await orderBody(testRun, base, { generalNote: 'Sửa phiếu nháp' }) });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, o.id)).code, 'Mã giữ nguyên').toBe(o.code);

  });

  test("ORD-056 Mã không cấp lại", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const del = await http.call('DELETE /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id } });
    expectStatusIn(del, '200/201/204', 'xóa');
    const r = await http.call('POST /api/service-orders', { token: tok('k1'), query: { submit: false }, json: await orderBody(testRun, base) });
    expectStatusIn(r, '200/201/204', 'tạo mới');
    expect((await data(r)).code, 'Mã mới khác mã đã xóa').not.toBe(o.code);

  });

  test("ORD-145 Lịch sử hoạt động phiếu", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const s = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    await must(await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }] } }), 'K1 sửa doanh thu Phát sinh KHQ');

    const res = await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { page: 1 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const times = list.map((x: any) => new Date(x.at).getTime());
    expect(times, 'Mới nhất trước').toEqual([...times].sort((a, b) => b - a));
    const edit = list.find((x: any) => /doanh thu|REVENUE/i.test(String(`${x.eventCode} ${x.description}`)));
    expect(edit, 'Có bản ghi Sửa doanh thu').toBeTruthy();
    expect(String(edit.description), 'Kèm giá trị trước → sau').toMatch(/200[.,]?000[\s\S]*250[.,]?000|250[.,]?000[\s\S]*200[.,]?000/);

  });

  test("ORD-151 Phân trang trang 2 kích thước 1", { tag: ["@api", "@phieu-dich-vu", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const s = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    await must(await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }] } }), 'K1 sửa doanh thu Phát sinh KHQ');

    const p1 = await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { page: 1, perPage: 1 } });
    const p2 = await http.call('GET /api/service-orders/{id}/history', { token: tok('k1'), params: { id: o.id }, query: { page: 2, perPage: 1 } });
    expectStatusIn(p1, '200');
    expectStatusIn(p2, '200');
    const a = await data(p1);
    const b = await data(p2);
    expect(items(a)).toHaveLength(1);
    expect(items(b)).toHaveLength(1);
    expect(items(a)[0].id, 'Không trùng nhau').not.toBe(items(b)[0].id);
    expect(a.meta.pagination.total, 'Tổng số giống nhau giữa 2 trang').toBe(b.meta.pagination.total);
    expect(new Date(items(a)[0].at).getTime(), 'Mới nhất trước').toBeGreaterThanOrEqual(new Date(items(b)[0].at).getTime());

  });

  test("ORD-213 K1 xem đề xuất điều chỉnh phạm vi", { tag: ["@api", "@phieu-dich-vu", "@p1"] }, async ({ http, testRun, tok }) => {

    const { order, requestId } = await scopeRequestOrder(testRun);
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/service-orders/{id}/scope-requests', { token: tok('k1'), params: { id: order.id } });
    expectStatusIn(res, '200');
    const r = ((await data(res)).items ?? []).find((x: any) => x.id === requestId);
    expect(r.kind).toBe('ADD');
    expect(r.serviceTypeCode).toBe(refs.services.KB);
    expect(String(r.reason).length, 'Có lý do').toBeGreaterThan(0);
    expect(r.status, 'Chờ trả lời').toBe('PENDING');

  });

  test("ORD-221 K3 thấy kết quả", { tag: ["@api", "@phieu-dich-vu", "@p2"] }, async ({ http, testRun, tok }) => {

    const { order, requestId } = await scopeRequestOrder(testRun);
    expectStatusIn(await http.call('POST /api/service-orders/{id}/scope-requests/{requestId}/respond', { token: tok('k1'), params: { id: order.id, requestId }, json: { accept: true, note: 'Đồng ý thêm kho' } }), '200/204', 'K1 trả lời');
    const res = await http.call('GET /api/k3/service-orders/{id}/scope-requests', { token: tok('dp'), params: { id: order.id } });
    expectStatusIn(res, '200/204');
    const r = ((await data(res)).items ?? []).find((x: any) => x.id === requestId);
    expect(r.status).toBe('ACCEPTED');
    expect(r.responseNote, 'Ghi chú K1').toBe('Đồng ý thêm kho');

  });
});
