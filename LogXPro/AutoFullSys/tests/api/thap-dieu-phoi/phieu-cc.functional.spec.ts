/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, orderBody, getOrder, revenueOf, revenueTable, rejectOrder, runService, uploadOrderDoc, uploadVehicleDoc, buildP0, addSealCost, scopeRequestOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, confirmLegsBody, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costs, costLines, costItem, addCost, saveActuals, startService, completeService, uploadActualDoc, coordinate } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { changeLinePrice } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { setItemStatus } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { pnl } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — phiếu dịch vụ (CC)", () => {
  test("K3O-004 Lọc phần việc của điều phối viên", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/k3/service-orders', { token: tok('dpVt'), query: { work: 'NOT_STARTED', perPage: 100 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.some((x: any) => x.id === o.id), 'Có P0 với VT chưa bắt đầu').toBe(true);
    for (const x of list) expect((x.myWork ?? []).some((w: any) => w.serviceTypeCode === refs.services.VT && w.status === 'NOT_STARTED'), `${x.code}: có VT chưa bắt đầu`).toBe(true);

  });

  test("K3O-005 Lọc biển số và khoảng ngày thực hiện", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'PERFORMED');
    const res = await http.call('GET /api/k3/service-orders', { token: tok('cc'), query: { handoverPlate: '15C-111', performedFrom: today(), perPage: 100 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.some((x: any) => x.id === o.id), 'Có P0').toBe(true);
    for (const x of list) expect(String(x.handoverPlateNo ?? ''), `${x.code} khớp biển số`).toContain('15C-111');

  });

  test("K3O-010 Số đếm tab lọc nhanh", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    await createOrder(testRun, base, { submit: true });
    await createOrder(testRun, base, { submit: true });
    await p0Order(testRun, 'ACCEPTED');
    const cc = await http.call('GET /api/k3/service-orders/counts', { token: tok('cc') });
    expectStatusIn(cc, '200');
    const c = await data(cc);
    expect(c.controllerView, 'CC: số theo trạng thái phiếu').toBe(true);
    for (const st of ['SUBMITTED', 'ACCEPTED']) {
      const n = (await data(await http.call('GET /api/k3/service-orders', { token: tok('cc'), query: { status: [st], perPage: 1 } }))).meta.pagination.total;
      expect(Number(c.byTab?.[st] ?? 0), `Số ${st} khớp danh sách`).toBe(Number(n));
    }
    const dp = await http.call('GET /api/k3/service-orders/counts', { token: tok('dp') });
    expectStatusIn(dp, '200');
    expect((await data(dp)).controllerView, 'Điều phối viên: số theo phần việc').toBe(false);

  });

  test("K3O-011 Đếm theo bộ lọc", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    await p0Order(testRun, 'SUBMITTED');
    const A = env.ref('CUSTOMER_A_ID');
    const res = await http.call('GET /api/k3/service-orders/counts', { token: tok('cc'), query: { customerId: [A] } });
    expectStatusIn(res, '200');
    const total = (await data(await http.call('GET /api/k3/service-orders', { token: tok('cc'), query: { customerId: [A], perPage: 1 } }))).meta.pagination.total;
    expect(Number((await data(res)).total), 'Chỉ đếm phiếu KH_A').toBe(Number(total));

  });

  test("K3O-023 CC tiếp nhận phiếu", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('POST /api/k3/service-orders/{id}/accept', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200/204');
    const d = await getOrder(testRun, o.id);
    expect(d.status).toBe('ACCEPTED');
    expect(JSON.stringify(d.availableActions ?? []), 'K1 không còn sửa').not.toMatch(/EDIT|UPDATE/i);
    const put = await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: await orderBody(testRun, base, { generalNote: 'Sửa sau tiếp nhận' }) });
    expectStatusIn(put, '400/409/422', 'Khối thông tin chung khóa');

  });

  test("K3O-024 Điều phối viên không tiếp nhận được", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('POST /api/k3/service-orders/{id}/accept', { token: tok('dp'), params: { id: o.id } });
    expectStatusIn(res, '403');
    expect((await getOrder(testRun, o.id)).status).toBe('SUBMITTED');

  });

  test("K3O-025 Tiếp nhận phiếu Nháp hoặc Đã hủy", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const draft = await createOrder(testRun, base, { submit: false });
    const cancelled = await createOrder(testRun, base, { submit: true });
    await must(await http.call('POST /api/service-orders/{id}/cancel', { token: tok('k1'), params: { id: cancelled.id }, json: { reason: 'Khách hủy' } }), 'hủy phiếu');
    for (const [o, st] of [[draft, 'DRAFT'], [cancelled, 'CANCELLED']] as [any, string][]) {
      const res = await http.call('POST /api/k3/service-orders/{id}/accept', { token: tok('cc'), params: { id: o.id } });
      expectStatusIn(res, '404/409', st);
      expect((await getOrder(testRun, o.id)).status, `${st} không đổi`).toBe(st);
    }

  });

  test("K3O-026 K1 không sửa được sau tiếp nhận", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const before = await getOrder(testRun, o.id);
    const res = await http.call('PUT /api/service-orders/{id}', { token: tok('k1'), params: { id: o.id }, json: await orderBody(testRun, base, { generalNote: 'Đổi sau tiếp nhận', weight: 1 }) });
    expectStatusIn(res, '400/409/422');
    const after = await getOrder(testRun, o.id);
    expect([after.generalNote, after.weight, after.customerRef], 'Dữ liệu thương mại giữ nguyên').toEqual([before.generalNote, before.weight, before.customerRef]);

  });

  test("K3O-031 CC từ chối phiếu", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    const res = await http.call('POST /api/k3/service-orders/{id}/reject', { token: tok('cc'), params: { id: o.id }, json: { reason: 'Thiếu chứng từ khai báo' } });
    expectStatusIn(res, '200/204');
    const d = await getOrder(testRun, o.id);
    expect(d.status).toBe('REJECTED');
    expect(d.rejectReason, 'K1 thấy lý do').toBe('Thiếu chứng từ khai báo');
    expect(JSON.stringify(d.availableActions ?? []), 'K1 có nút Khôi phục').toMatch(/RESTORE/i);

  });

  test("K3O-032 Từ chối khi đã có chặng đang thực hiện", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const res = await http.call('POST /api/k3/service-orders/{id}/reject', { token: tok('cc'), params: { id: o.id }, json: { reason: 'Từ chối khi đang thực hiện' } });
    expectStatusIn(res, '400/409/422');
    const after = await getOrder(testRun, o.id);
    expect(after.status, 'Phiếu tổng vẫn Đang thực hiện').toBe('IN_PROGRESS');
    expect(after.services.some((s: any) => s.status === 'IN_PROGRESS'), 'Vẫn có dịch vụ Đang thực hiện').toBe(true);

  });

  test("K3O-033 Từ chối phiếu Đã tiếp nhận chưa bắt đầu", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const res = await http.call('POST /api/k3/service-orders/{id}/reject', { token: tok('cc'), params: { id: o.id }, json: { reason: 'Khách chưa đủ hồ sơ' } });
    expectStatusIn(res, '200/204');
    expect((await getOrder(testRun, o.id)).status).toBe('REJECTED');

  });

  test("K3O-034 Chi phí đã sinh bị khóa", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const r1 = await http.call('POST /api/k3/service-orders/{id}/reject', { token: tok('cc'), params: { id: o.id }, json: { reason: 'Khách đổi đơn vị khai báo' } });
    expectStatusIn(r1, '200/204', 'từ chối');
    const r2 = await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { contractorId: env.ref('CONTRACTOR_A_ID'), kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 100_000, currency: 'VND' } });
    expectStatusIn(r2, '400/409/422', 'thêm chi phí sau từ chối');
    expect(await costLines(testRun, o.svc.KHQ), 'Bảng chi phí khóa vĩnh viễn').toHaveLength(1);

  });

  test("K3O-044 CC xác nhận cấu trúc chặng", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const pv = await data(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } }));
    const res = await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('cc'), params: { id: o.id }, json: confirmLegsBody(pv, 1) });
    expectStatusIn(res, '200/204');
    const d = await k3Order(testRun, o.id);
    expect(d.order.status, 'Phiếu giữ ACCEPTED').toBe('ACCEPTED');
    expect((d.legs ?? []).length, 'Có cấu trúc chặng').toBeGreaterThan(0);
    const c = await costs(testRun, o.svc ?? { id: o.id, type: (await testRun.p0Refs()).services.KHQ });
    expect((c.contractors ?? []).length, 'Chưa có dữ liệu chi phí').toBe(0);

  });

  test("K3O-045 Chuyển Kho bãi sang Chặng 2", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const pv = await data(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } }));
    const res = await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('cc'), params: { id: o.id }, json: confirmLegsBody(pv, 2) });
    expectStatusIn(res, '200/204');
    const leg2 = ((await k3Order(testRun, o.id)).legs ?? []).find((l: any) => l.position === 2);
    expect((leg2?.services ?? []).map((s: any) => s.serviceTypeCode ?? s.code ?? s), 'KB nằm ở Chặng 2').toContain(refs.services.KB);

  });

  test("K3O-046 Chặng rỗng bị ẩn sau xác nhận", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true, services: ['KHQ', 'HQGS', 'ST', 'KB'] });
    await acceptOrder(testRun, o.id);
    const pv = await data(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } }));
    expect((pv.legs ?? []).some((l: any) => l.empty), 'Tiền điều kiện: quy tắc có chặng không có dịch vụ của phiếu').toBe(true);
    const res = await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('cc'), params: { id: o.id }, json: confirmLegsBody(pv, 1) });
    expectStatusIn(res, '200/204');
    const legs = (await getOrder(testRun, o.id)).legs ?? [];
    expect(legs.every((l: any) => (l.services ?? []).length > 0), 'Chặng rỗng không xuất hiện').toBe(true);

  });

  test("K3O-047 Xác nhận lần 2", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const before = stable((await k3Order(testRun, o.id)).legs);
    const pv = await data(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } }));
    const res = await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('cc'), params: { id: o.id }, json: confirmLegsBody(pv, 2) });
    expectStatusIn(res, '400/409/422');
    expect(stable((await k3Order(testRun, o.id)).legs), 'Không sửa được').toEqual(before);

  });

  test("K3O-048 Điều phối viên xác nhận chặng", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const pv = await data(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } }));
    const res = await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('dp'), params: { id: o.id }, json: confirmLegsBody(pv, 1) });
    expectStatusIn(res, '403');
    expect((await k3Order(testRun, o.id)).legs ?? [], 'Chỉ CC').toHaveLength(0);

  });

  test("K3O-049 `ruleCode` không khớp tuyến", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const pv = await data(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } }));
    const rules = items(await data(await http.call('GET /api/leg-rules', { token: tok('admin'), query: { perPage: 100 } })));
    const other = rules.find((r: any) => r.code !== pv.ruleCode && /CN|TQ|Trung/i.test(JSON.stringify(r)));
    expect(other, 'Tiền điều kiện: có quy tắc Nội địa TQ').toBeTruthy();
    const res = await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('cc'), params: { id: o.id }, json: { ...confirmLegsBody(pv, 1), ruleCode: other.code } });
    expectStatusIn(res, '400/409/422');
    expect((await k3Order(testRun, o.id)).legs ?? [], 'Không lưu cấu trúc sai').toHaveLength(0);

  });

  test("K3O-060 Phân trang trang 2 kích thước 1", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const p1 = await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { page: 1, perPage: 1 } });
    const p2 = await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { page: 2, perPage: 1 } });
    expectStatusIn(p1, '200');
    expectStatusIn(p2, '200');
    const a = await data(p1);
    const b = await data(p2);
    expect(items(a)).toHaveLength(1);
    expect(items(b)).toHaveLength(1);
    expect(items(a)[0].id).not.toBe(items(b)[0].id);
    expect(a.meta.pagination.total).toBe(b.meta.pagination.total);
    expect(new Date(items(a)[0].at).getTime()).toBeGreaterThanOrEqual(new Date(items(b)[0].at).getTime());

  });

  test("K3O-061 K3 tải chứng từ K1 của dịch vụ", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf10();
    const doc = await uploadOrderDoc(testRun, o.id, refs.services.KHQ, file);
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');

    const res = await http.call('GET /api/k3/service-orders/{id}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Trả đúng file').toBe(sha256(file.buffer));

  });

  test("K3O-002 Danh sách phiếu ở Tháp điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const sub = await createOrder(testRun, base, { submit: true });
    const draft = await createOrder(testRun, base, { submit: false });
    const res = await http.call('GET /api/k3/service-orders', { token: tok('cc'), query: { status: ['SUBMITTED'], perPage: 100 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.some((o: any) => o.id === sub.id), 'CC thấy phiếu SUBMITTED').toBe(true);
    expect(list.every((o: any) => o.status === 'SUBMITTED'), 'Mọi phiếu khớp bộ lọc').toBe(true);
    expect(list.some((o: any) => o.id === draft.id), 'Không có phiếu DRAFT').toBe(false);

  });

  test("K3O-014 Năm trạng thái bộ lọc Tháp điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, tok }) => {

    const res = await http.call('GET /api/k3/service-orders/statuses', { token: tok('cc') });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.map((s: any) => s.code).sort()).toEqual(['ACCEPTED', 'COMPLETED', 'IN_PROGRESS', 'PERFORMED', 'SUBMITTED']);
    expect(list.map((s: any) => s.name)).toEqual(expect.arrayContaining(['Tạo mới', 'Đã tiếp nhận', 'Đang thực hiện', 'Đã thực hiện', 'Hoàn thành']));

  });

  test("K3O-017 Chi tiết phiếu ở K3 kèm cấu trúc chặng", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const res = await http.call('GET /api/k3/service-orders/{id}', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(d.order.id).toBe(o.id);
    const legs = [...(d.legs ?? [])].sort((a: any, b: any) => a.position - b.position);
    const codesOf = (l: any) => (l?.services ?? []).map((s: any) => s.serviceTypeCode ?? s.code ?? s).sort();
    expect(codesOf(legs[0])).toEqual([refs.services.KHQ, refs.services.HQGS, refs.services.ST, refs.services.KB].sort());
    expect(codesOf(legs[1])).toEqual([refs.services.VT]);
    expect(Array.isArray(d.availableActions), 'Có thao tác cho phép theo vai trò').toBe(true);
    expect(JSON.stringify(d.availableActions), 'Thông tin K1 chỉ đọc').not.toMatch(/EDIT_ORDER|UPDATE_ORDER/i);

  });

  test("K3O-019 CC không có thao tác điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const res = await http.call('GET /api/k3/service-orders/{id}', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    expect(JSON.stringify((await data(res)).availableActions ?? []), 'CC không có Điều phối/Bắt đầu/Hoàn thành').not.toMatch(/COORDINAT|START|COMPLETE/i);

  });

  test("K3O-040 Xem trước cấu trúc chặng theo Leg Engine", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const refs = await testRun.p0Refs();
    const o = await createOrder(testRun, base, { submit: true });
    await acceptOrder(testRun, o.id);
    const res = await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(res, '200');
    const pv = await data(res);
    expect(String(pv.ruleCode ?? '').length, 'Có mã quy tắc khớp').toBeGreaterThan(0);
    const legs = (pv.legs ?? []).filter((l: any) => !l.empty);
    expect(legs, '2 chặng').toHaveLength(2);
    const leg1 = legs.find((l: any) => l.position === (pv.warehouseLegPosition ?? 1));
    expect((leg1?.services ?? []).map((s: any) => s.code), 'KB gán Chặng 1').toContain(refs.services.KB);
    expect(legs[0].origin?.code ?? legs[0].origin?.label, 'Điểm đi chặng tính theo phiếu').toBeTruthy();
    expect((await k3Order(testRun, o.id)).legs ?? [], 'Xem trước không lưu').toHaveLength(0);

  });

  test("K3O-055 Nhật ký Tháp điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const o = await p0Order(testRun, 'KHQ_COORDINATED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const lines = (await costLines(testRun, o.svc.KHQ)).map((l) => ({ costLineId: l.costLineId, unitCode: l.unitCode, quantity: Number(l.quantity), unitPrice: 1_050_000 }));
    await must(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, contractorId: A }, json: { currency: 'VND', lines } }), 'cập nhật đơn giá chi phí');
    const res = await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('cc'), params: { id: o.id }, query: { page: 1 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const times = list.map((x: any) => new Date(x.at).getTime());
    expect(times, 'Mới nhất trước').toEqual([...times].sort((a, b) => b - a));
    const entry = list.find((x: any) => /Cập nhật chi phí/i.test(String(x.description)));
    expect(entry, 'Có bản ghi [Cập nhật chi phí]').toBeTruthy();
    expect(String(entry.description), 'cũ → mới VND').toMatch(/1[.,]?000[.,]?000[\s\S]*1[.,]?050[.,]?000/);
    expect(String(entry.actorName ?? '').length, 'Có người thực hiện').toBeGreaterThan(0);

  });

  test("K3O-067 K3 tải số thông hành K1 đính kèm", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const base = await p0Base(testRun);
    const o = await createOrder(testRun, base, { submit: false });
    const file = REAL.pdf20();
    const doc = await uploadVehicleDoc(testRun, o.id, file);
    await must(await http.call('POST /api/service-orders/{id}/submit', { token: tok('k1'), params: { id: o.id } }), 'gửi phiếu');

    const res = await http.call('GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}', { token: tok('dp'), params: { id: o.id, documentId: doc.id } });
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Trả đúng file').toBe(sha256(file.buffer));

  });
});
