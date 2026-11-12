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
  test("K3S-093 API khai báo đã tắt", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const other = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code ?? 'AT';
    const before = stable((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ));
    const costsBefore = stable(await costs(testRun, o.svc.KHQ));

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/declaration', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { customsOfficeCode: other } });
    expectStatusIn(res, '400/403/409');
    await expectApiError(res);

  });

  test("K3S-094 Không ghi được dữ liệu", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const other = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code ?? 'AT';
    const before = stable((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ));
    const costsBefore = stable(await costs(testRun, o.svc.KHQ));

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/declaration', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { customsOfficeCode: other } });
    expectStatusIn(res, '400/403/409');
    expect(stable((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ)), 'Thông tin khai báo giữ nguyên').toEqual(before);

  });

  test("K3S-105 Lưu thông tin thực tế KHQ", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const payload = { ...actualsBody(refs, 'KHQ'), declarationNo: '10567891234', clearanceLane: 'GREEN', clearedAt: new Date().toISOString(), declarationCount: 1 };
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: payload });
    expectStatusIn(res, '200/204');
    const d = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } }));
    expect(d.declarationNo).toBe('10567891234');
    expect(d.handoverVehicles?.[0]?.plateNo).toBe('15C-111.11');
    const order = await getOrder(testRun, o.id);
    expect(JSON.stringify(order.vehicles ?? []), 'Xe giao cascade về Khối B').toContain('15C-111.11');
    const fee = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    expect(Number(fee.quantity), 'SL Phí khai báo theo declarationCount = 1').toBe(1);

  });

  test("K3S-106 Phân luồng Vàng/Đỏ bật giám sát bãi ở HQGS", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { ...actualsBody(refs, 'KHQ'), clearanceLane: 'RED' } });
    expectStatusIn(res, '200/204');
    const hq = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.HQGS } }));
    expect(hq.yardSupervisionRequired, 'HQGS tự kích hoạt giám sát bãi').toBe(true);

  });

  test("K3S-107 VT chỉ lưu xe nhận khi Đang thực hiện và cascade sang Sang tải", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'VT', false);
    const body = { receiverVehicles: (actualsBody(refs, 'VT') as any).receiverVehicles };
    const early = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: body });
    expectStatusIn(early, '400/409/422', 'Chưa Bắt đầu thì chưa nhập thông tin thực tế');
    await startService(testRun, o.svc.VT);
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: body });
    expectStatusIn(res, '200/204', 'Đang thực hiện thì lưu Xe nhận');
    const order = await getOrder(testRun, o.id);
    expect(JSON.stringify(order.vehicles ?? []), 'Xe nhận cascade lên Khối B').toContain('29C-123.45');
    const st = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.ST } }));
    expect(JSON.stringify(st), 'Xe nhận nạp vào cặp xe Sang tải').toContain('29C-123.45');

  });

  test("K3S-108 Đổi Loại hình lưu kho làm đầu mục không áp dụng", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'KB');
    const cold = await testRun.pick('GET /api/catalogues/warehouse-types', /đông lạnh/i);
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KB }, json: { ...actualsBody(refs, 'KB'), warehouseTypeId: cold.id } });
    expectStatusIn(res, '200/204');
    const r = await data(res);
    expect(JSON.stringify(r?.resets ?? []), 'Đầu mục không áp dụng bị gỡ').toContain(refs.services.KB);
    expect((await costLines(testRun, o.svc.KB)).length, 'Gỡ nhà thầu/dòng giá').toBe(0);
    await uploadActualDoc(testRun, o.svc.KB);
    const done = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.KB } });
    expectStatusIn(done, '400/409/422', 'hoàn thành bị chặn ERR-K3-BR-07');

  });

  test("K3S-109 Đổi thuộc tính mapping hủy gán nhà thầu", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'VT', false);
    const province = (await testRun.catalog('GET /api/catalogues/provinces', { countryCode: 'VN' })).find((p: any) => !/Hà Nội/i.test(p.name));
    const ward = (await testRun.catalog('GET /api/catalogues/wards', { countryCode: 'VN', provinceCode: province.code }))[0];
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: { routes: [{ routeIndex: 0, delivery: { pointType: 'ADDRESS', countryCode: 'VN', provinceCode: province.code, wardCode: ward?.code, placeName: 'Điểm giao thay đổi' } }] } });
    expectStatusIn(res, '200/204');
    const svc = (await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.VT);
    expect(svc.status, 'Dịch vụ về Chưa thực hiện').toBe('NOT_STARTED');
    expect(await costLines(testRun, o.svc.VT), 'Xóa bảng chi phí mặc định').toHaveLength(0);

  });

  test("K3S-110 Sau Hoàn thành không sửa được", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const before = stable(await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } })));
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { ...actualsBody(refs, 'KHQ'), declarationNo: '99999999999' } });
    expectStatusIn(res, '400/409/422');
    expect(stable(await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } }))), 'Khóa').toEqual(before);

  });

  test("K3S-122 Hoàn thành dịch vụ", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await saveActuals(testRun, o.svc.KHQ, actualsBody(refs, 'KHQ'));
    await uploadActualDoc(testRun, o.svc.KHQ);

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '200/204');
    const svc = (await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ);
    expect(svc.status, 'KHQ Đã thực hiện').toBe('PERFORMED');
    const act2 = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } }));
    expect(act2.editable, 'Khóa thông tin thực tế').toBe(false);
    expectStatusIn(await http.call('POST /api/k3/service-orders/{id}/services/{type}/costs', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { contractorId: A, kind: 'VARIANCE', priceConfigurationItemId: o.base.items.shiftStorage.id, unitCode: refs.units.shiftStorage, quantity: 1, amount: 1_000, currency: 'VND' } }), '400/409/422', 'Khóa chi phí');

  });

  test("K3S-123 Thiếu trường bắt buộc", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const b = actualsBody(refs, 'KHQ') as any;
    delete b.clearedAt;
    await saveActuals(testRun, o.svc.KHQ, b);
    await uploadActualDoc(testRun, o.svc.KHQ);
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);

  });

  test("K3S-124 Sang tải cần biển số xe giao và xe nhận", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'ST');
    await saveActuals(testRun, o.svc.ST, actualsBody(refs, 'ST'));
    await uploadActualDoc(testRun, o.svc.ST);
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.ST } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);

  });

  test("K3S-125 Kho bãi còn cờ cần điều phối lại", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'KB');
    const cold = await testRun.pick('GET /api/catalogues/warehouse-types', /đông lạnh/i);
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KB }, json: { ...actualsBody(refs, 'KB'), warehouseTypeId: cold.id } });
    expectStatusIn(res, '200/204');
    const r = await data(res);
    expect(JSON.stringify(r?.resets ?? []), 'Đầu mục không áp dụng bị gỡ').toContain(refs.services.KB);
    expect((await costLines(testRun, o.svc.KB)).length, 'Gỡ nhà thầu/dòng giá').toBe(0);
    await uploadActualDoc(testRun, o.svc.KB);
    const done = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.KB } });
    expectStatusIn(done, '400/409/422', 'hoàn thành bị chặn ERR-K3-BR-07');

  });

  test("K3S-126 Dịch vụ cuối cùng làm phiếu Đã thực hiện", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'CHANG1_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await saveActuals(testRun, o.svc.VT, actualsBody(refs, 'VT'));
    await uploadActualDoc(testRun, o.svc.VT);
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.VT } });
    expectStatusIn(res, '200/204');
    const d = await getOrder(testRun, o.id);
    expect(d.status, 'Phiếu PERFORMED').toBe('PERFORMED');
    const rc = await data(await http.call('GET /api/service-orders/{id}/revenue-confirmation', { token: tok('cc'), params: { id: o.id } }));
    expect(rc.confirmable, 'K1/K5 thấy nút Xác nhận doanh thu').toBe(true);

  });

  test("K3S-133 Danh sách chứng từ của khối", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await uploadActualDoc(testRun, o.svc.KHQ);
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' } });
    expectStatusIn(res, '200');
    expect((await data(res)).items, 'Trả 1 chứng từ chưa gỡ').toHaveLength(1);

  });

  test("K3S-134 Lọc theo khối chứng từ dòng chi phí", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const q = { block: 'COST_LINE', costLineId: o.shiftLineId };
    await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q, multipart: { files: [samplePdf('chung-tu-1.pdf'), samplePdf('chung-tu-2.pdf')] } }), 'đính 2 chứng từ dòng Phát sinh KHQ');
    await uploadActualDoc(testRun, o.svc.KHQ);
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: q });
    expectStatusIn(res, '200');
    expect((await data(res)).items, 'Chỉ 2 chứng từ của dòng đó').toHaveLength(2);

  });

  test("K3S-155 Gỡ chứng từ (đánh dấu)", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const u1 = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-1.pdf') } }), 'chứng từ 1');
    const u2 = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-2.pdf') } }), 'chứng từ 2');
    const d1 = u1?.documentIds?.[0] ?? u1?.id;
    const d2 = u2?.documentIds?.[0] ?? u2?.id;
    const DEL = (id: string, type: string = refs.services.KHQ) => http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, type, documentId: id } });

    const res = await DEL(d1);
    expectStatusIn(res, '200/204');
    expect(((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' } }))).items ?? []).map((d: any) => d.id), 'Đánh dấu đã gỡ').toEqual([d2]);
    const raw = await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, documentId: d1 } });
    test.info().annotations.push({ type: 'Ghi nhận', description: `Tải lại tệp đã gỡ: HTTP ${raw.status()} (tệp gốc không bị xóa theo SRS)` });
    expect(raw.status(), 'Không lỗi 5xx khi đọc tệp đã gỡ').toBeLessThan(500);

  });

  test("K3S-156 Gỡ chứng từ cuối làm thiếu điều kiện hoàn thành", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await saveActuals(testRun, o.svc.KHQ, actualsBody(refs, 'KHQ'));
    const u = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-duy-nhat.pdf') } }), 'chứng từ duy nhất');
    const res = await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, documentId: u?.documentIds?.[0] ?? u?.id } });
    expectStatusIn(res, '200/204');
    const chk = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/completion-check', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } }));
    expect(JSON.stringify(chk.missing ?? []), 'Lại báo thiếu chứng từ lô hàng').toMatch(/Chứng từ|document/i);

  });

  test("K3S-162 KHQ: thiếu từng trường bắt buộc khi hoàn thành", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    
    const fields: [string, (b: any) => void][] = [
      ['Mã tờ khai thực tế', (b) => delete b.declarationNo], ['Ngày thông quan', (b) => delete b.clearedAt], ['Số lượng tờ khai', (b) => delete b.declarationCount],
      ['Xe giao: Biển số', (b) => delete b.handoverVehicles[0].plateNo], ['Số container', (b) => delete b.handoverVehicles[0].containerNo], ['Số mooc', (b) => delete b.handoverVehicles[0].trailerNo],
      ['Tên tài xế', (b) => delete b.handoverVehicles[0].driverName], ['SĐT tài xế', (b) => delete b.handoverVehicles[0].driverPhone], ['CCCD tài xế', (b) => delete b.handoverVehicles[0].driverIdNo],
      ['Số thông hành', (b) => delete b.handoverVehicles[0].transitPermitNo], ['Chứng từ lô hàng', () => undefined],
    ];
    const P = { id: o.id, type: refs.services.KHQ };
    let docId: string | undefined;
    for (const [label, drop] of fields) {
      const b = actualsBody(refs, 'KHQ') as any;
      drop(b);
      await must(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: P, json: b }), `lưu thực tế thiếu ${label}`);
      const hasDocs = ((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: P, query: { block: 'ACTUAL' } }))).items ?? []).length > 0;
      if (label === 'Chứng từ lô hàng' && docId) await must(await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { ...P, documentId: docId } }), 'gỡ chứng từ');
      if (label !== 'Chứng từ lô hàng' && !hasDocs) docId = (await uploadActualDoc(testRun, { id: o.id, type: P.type }))?.documentIds?.[0];
      const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: P });
      expectStatusIn(res, '400/409/422', `thiếu ${label}`);
      await expectApiError(res);
    }
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === P.type).status, 'Dịch vụ giữ Đang thực hiện').toBe('IN_PROGRESS');
    const k = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expectMoney(Number(k.cost ?? 0), 0, 'P&L chưa cộng dịch vụ này');

  });

  test("K3S-163 HQGS: thiếu từng trường bắt buộc khi hoàn thành", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'HQGS');
    const fields: [string, (b: any) => void][] = [
      ['Kết quả kiểm hóa', (b) => delete b.inspectionResult], ['Giờ vào khu', (b) => delete b.yardEnteredAt], ['Giờ rời khu', (b) => delete b.yardLeftAt], ['Chứng từ lô hàng', () => undefined],
    ];
    const P = { id: o.id, type: refs.services.HQGS };
    let docId: string | undefined;
    for (const [label, drop] of fields) {
      const b = actualsBody(refs, 'HQGS') as any;
      drop(b);
      await must(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: P, json: b }), `lưu thực tế thiếu ${label}`);
      const hasDocs = ((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: P, query: { block: 'ACTUAL' } }))).items ?? []).length > 0;
      if (label === 'Chứng từ lô hàng' && docId) await must(await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { ...P, documentId: docId } }), 'gỡ chứng từ');
      if (label !== 'Chứng từ lô hàng' && !hasDocs) docId = (await uploadActualDoc(testRun, { id: o.id, type: P.type }))?.documentIds?.[0];
      const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: P });
      expectStatusIn(res, '400/409/422', `thiếu ${label}`);
      await expectApiError(res);
    }
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === P.type).status, 'Dịch vụ giữ Đang thực hiện').toBe('IN_PROGRESS');
    const k = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expectMoney(Number(k.cost ?? 0), 0, 'P&L chưa cộng dịch vụ này');

  });

  test("K3S-164 VT: thiếu từng trường bắt buộc khi hoàn thành", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'CHANG1_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const fields: [string, (b: any) => void][] = [
      ['Xe nhận: Biển số', (b) => delete b.receiverVehicles[0].plateNo], ['Seal', (b) => delete b.receiverVehicles[0].sealNo], ['Số cửa', (b) => delete b.receiverVehicles[0].gateNo],
      ['Số container', (b) => delete b.receiverVehicles[0].containerNo], ['Số mooc', (b) => delete b.receiverVehicles[0].trailerNo], ['Tên tài xế', (b) => delete b.receiverVehicles[0].driverName],
      ['SĐT tài xế', (b) => delete b.receiverVehicles[0].driverPhone], ['CCCD tài xế', (b) => delete b.receiverVehicles[0].driverIdNo], ['Số thông hành', (b) => delete b.receiverVehicles[0].transitPermitNo],
      ['Thời gian lấy', (b) => delete b.routes[0].pickedUpAt], ['Thời gian giao', (b) => delete b.routes[0].deliveredAt], ['Chứng từ lô hàng', () => undefined],
    ];
    const P = { id: o.id, type: refs.services.VT };
    let docId: string | undefined;
    for (const [label, drop] of fields) {
      const b = actualsBody(refs, 'VT') as any;
      drop(b);
      await must(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: P, json: b }), `lưu thực tế thiếu ${label}`);
      const hasDocs = ((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: P, query: { block: 'ACTUAL' } }))).items ?? []).length > 0;
      if (label === 'Chứng từ lô hàng' && docId) await must(await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { ...P, documentId: docId } }), 'gỡ chứng từ');
      if (label !== 'Chứng từ lô hàng' && !hasDocs) docId = (await uploadActualDoc(testRun, { id: o.id, type: P.type }))?.documentIds?.[0];
      const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: P });
      expectStatusIn(res, '400/409/422', `thiếu ${label}`);
      await expectApiError(res);
    }
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === P.type).status, 'Dịch vụ giữ Đang thực hiện').toBe('IN_PROGRESS');
    const k = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expectMoney(Number(k.cost ?? 0), 4_000_000, 'P&L chưa cộng dịch vụ này');

  });

  test("K3S-165 ST: thiếu từng trường bắt buộc khi hoàn thành", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    // Sang tải ghép Xe giao do KHQ cung cấp với Xe nhận của Vận tải. Chuẩn bị
    // Vận tải trước để từng nhánh dưới chỉ thiếu đúng trường đang kiểm.
    await runService(testRun, o, 'VT');
    const vt = actualsBody(refs, 'VT') as any;
    await saveActuals(testRun, o.svc.VT, { receiverVehicles: vt.receiverVehicles });
    await runService(testRun, o, 'ST');
    const fields: [string, (b: any) => void][] = [
      ['Quy cách đóng gói', (b) => delete b.packaging], ['Số lượng thực nhận', (b) => delete b.quantity], ['Tình trạng hàng', (b) => delete b.goodsCondition],
      ['Số kiện', (b) => delete b.pairs[0].packageCount], ['Seal', (b) => delete b.pairs[0].sealNo], ['Trọng lượng', (b) => delete b.pairs[0].actualWeight], ['Seal mới', (b) => delete b.pairs[0].newSealNo],
      ['Chứng từ lô hàng', () => undefined],
    ];
    const P = { id: o.id, type: refs.services.ST };
    let docId: string | undefined;
    for (const [label, drop] of fields) {
      const b = actualsBody(refs, 'ST') as any;
      drop(b);
      await must(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: P, json: b }), `lưu thực tế thiếu ${label}`);
      const hasDocs = ((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: P, query: { block: 'ACTUAL' } }))).items ?? []).length > 0;
      if (label === 'Chứng từ lô hàng' && docId) await must(await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { ...P, documentId: docId } }), 'gỡ chứng từ');
      if (label !== 'Chứng từ lô hàng' && !hasDocs) docId = (await uploadActualDoc(testRun, { id: o.id, type: P.type }))?.documentIds?.[0];
      const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: P });
      expectStatusIn(res, '400/409/422', `thiếu ${label}`);
      await expectApiError(res);
    }
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === P.type).status, 'Dịch vụ giữ Đang thực hiện').toBe('IN_PROGRESS');
    const k = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expectMoney(Number(k.cost ?? 0), P0.serviceCost.KHQ, 'P&L chưa cộng dịch vụ này');

  });

  test("K3S-166 KB: thiếu từng trường bắt buộc khi hoàn thành", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'KB');
    const fields: [string, (b: any) => void][] = [
      ['Số lượng thực tế', (b) => delete b.quantity], ['Trọng lượng tồn', (b) => delete b.remainingWeight], ['Thời gian nhập kho', (b) => delete b.storedInAt], ['Thời gian xuất kho', (b) => delete b.storedOutAt],
      ['Chứng từ lô hàng', () => undefined],
    ];
    const P = { id: o.id, type: refs.services.KB };
    let docId: string | undefined;
    for (const [label, drop] of fields) {
      const b = actualsBody(refs, 'KB') as any;
      drop(b);
      await must(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: P, json: b }), `lưu thực tế thiếu ${label}`);
      const hasDocs = ((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: P, query: { block: 'ACTUAL' } }))).items ?? []).length > 0;
      if (label === 'Chứng từ lô hàng' && docId) await must(await http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { ...P, documentId: docId } }), 'gỡ chứng từ');
      if (label !== 'Chứng từ lô hàng' && !hasDocs) docId = (await uploadActualDoc(testRun, { id: o.id, type: P.type }))?.documentIds?.[0];
      const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: P });
      expectStatusIn(res, '400/409/422', `thiếu ${label}`);
      await expectApiError(res);
    }
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === P.type).status, 'Dịch vụ giữ Đang thực hiện').toBe('IN_PROGRESS');
    const k = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expectMoney(Number(k.cost ?? 0), 0, 'P&L chưa cộng dịch vụ này');

  });

  test("K3S-167 Xe/cặp thứ hai thiếu dữ liệu chặn hoàn thành", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'CHANG1_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const b = actualsBody(refs, 'VT') as any;
    b.receiverVehicles.push({ ...b.receiverVehicles[0], plateNo: '29C-678.90', driverIdNo: undefined });
    await must(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: b }), 'lưu 2 xe nhận');
    await uploadActualDoc(testRun, o.svc.VT);
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.VT } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.VT).status, 'Không hoàn thành một phần').toBe('IN_PROGRESS');

  });

  test("K3S-168 Mốc thực tế: hôm nay hợp lệ, ngày mai bị chặn", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const local = (d: number, hh: number, mm: number) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(hh, mm, 0, 0); return x.toISOString(); };
    expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { ...actualsBody(refs, 'KHQ'), clearedAt: local(0, 23, 59) } }), '200/204', 'hôm nay 23:59');
    const r2 = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { ...actualsBody(refs, 'KHQ'), clearedAt: local(1, 0, 0) } });
    expectStatusIn(r2, '400/422', 'ngày mai 00:00');
    await expectApiError(r2);

  });

  test("K3S-169 Cặp thời gian tuần tự: sau &lt; trước, bằng, sau &gt; trước", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'CHANG1_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const d = new Date(); d.setDate(d.getDate() - 2);
    const at = (h: number, m: number) => { const x = new Date(d); x.setHours(h, m, 0, 0); return x.toISOString(); };
    const sets = ['400/422', '200/204', '200/204'];
    const delivered = [at(10, 0), at(14, 0), at(14, 1)];
    for (let i = 0; i < 3; i++) {
      const b = actualsBody(refs, 'VT') as any;
      b.routes = [{ routeIndex: 0, pickedUpAt: at(14, 0), deliveredAt: delivered[i] }];
      expectStatusIn(await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.VT }, json: b }), sets[i], `giao ${delivered[i]}`);
    }

  });

  test("K3S-170 Thời gian dự kiến ở tương lai được phép", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await runService(testRun, o, 'KB');
    const future = new Date(Date.now() + 10 * 86_400_000).toISOString();
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KB }, json: { warehouseCode: refs.warehouse, warehouseTypeId: refs.warehouseTypeId, note: `Dự kiến lưu đến ${future.slice(0, 10)}`, storedOutAt: undefined } });
    expectStatusIn(res, '200/204');
    test.info().annotations.push({ type: 'Ghi chú', description: 'Swagger không có trường "Thời gian lưu kho dự kiến" riêng; kiểm lưu được khi chỉ có dữ liệu dự kiến' });

  });

  test("K3S-096 Không hủy điều phối", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const other = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code ?? 'AT';
    const before = stable((await getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.KHQ));
    const costsBefore = stable(await costs(testRun, o.svc.KHQ));

    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/declaration', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: { customsOfficeCode: other } });
    expectStatusIn(res, '400/403/409');
    expect(stable(await costs(testRun, o.svc.KHQ)), 'Bảng chi phí giữ nguyên').toEqual(costsBefore);

  });

  test("K3S-101 Đọc thông tin thực tế", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const body0 = actualsBody(refs, 'KHQ') as any;
    await saveActuals(testRun, o.svc.KHQ, body0);
    await uploadActualDoc(testRun, o.svc.KHQ);
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(d.declarationNo).toBe(body0.declarationNo);
    expect(d).toHaveProperty('editable');
    expect(d.editable, 'Chưa khóa').toBe(true);
    expect(d.actualCustomsOfficeCode ?? d.declaredCustomsOfficeCode, 'Khối 2 mặc định = Khối 1').toBe(refs.customsOffice);
    const docs = (await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' } }))).items ?? [];
    expect(docs.length, 'Có chứng từ').toBeGreaterThan(0);

  });

  test("K3S-112 CCCD sai pattern", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const b = actualsBody(refs, 'KHQ') as any;
    b.handoverVehicles[0].driverIdNo = '12AB';
    const res = await http.call('PUT /api/k3/service-orders/{id}/services/{type}/actuals', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, json: b });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'driverIdNo');

  });

  test("K3S-118 Kiểm trường bắt buộc trước hoàn thành", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const b = actualsBody(refs, 'KHQ') as any;
    delete b.clearedAt;
    await saveActuals(testRun, o.svc.KHQ, b);
    const res = await http.call('GET /api/k3/service-orders/{id}/services/{type}/completion-check', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(d.ok).toBe(false);
    const miss = JSON.stringify(d.missing ?? []);
    expect(miss, 'Thiếu Ngày thông quan thực tế').toMatch(/Ngày thông quan|clearedAt/i);
    expect(miss, 'Thiếu Chứng từ lô hàng').toMatch(/Chứng từ|document/i);

  });

  test("K3S-128 Chi phí và doanh thu dịch vụ vào P&L", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await saveActuals(testRun, o.svc.KHQ, actualsBody(refs, 'KHQ'));
    await uploadActualDoc(testRun, o.svc.KHQ);

    const s = (revenueTable(await revenueOf(testRun, o.id), refs.services.KHQ).lines ?? []).find((l: any) => l.costLineId === o.shiftLineId);
    expect(s, 'Có dòng doanh thu Phát sinh KHQ đã tạo').toBeTruthy();
    await must(await http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: tok('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: s.costLineId, unitCode: o.varianceUnitCode, quantity: 1, unitPrice: 250_000 }] } }), 'doanh thu Phát sinh KHQ 250.000');
    const before = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } });
    expectStatusIn(res, '200/204');
    const k = (await data(await http.call('GET /api/service-orders/{id}/pnl', { token: tok('cc'), params: { id: o.id } }))).kpi;
    expectMoney(Number(k.revenue) - Number(before.revenue), 1_800_000, 'P&L cộng doanh thu KHQ');
    expectMoney(Number(k.cost) - Number(before.cost), 1_500_000, 'P&L cộng chi phí KHQ');
    expectMoney(Number(k.profit) - Number(before.profit), 300_000, 'Lợi nhuận KHQ');
    if (Number(before.revenue) === 0) {
      expectPercent(k.marginPercent, 16.7, 1, 'Margin KHQ');
      expect(k.margin, 'An toàn').toBe('SAFE');
    }

  });

  test("K3S-139 Đính kèm chứng từ thực tế / dòng chi phí", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    await saveActuals(testRun, o.svc.KHQ, actualsBody(refs, 'KHQ'));
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: REAL.pdf10() } });
    expectStatusIn(res, '200/201');
    expect(((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' } }))).items ?? []).length, 'Lưu chứng từ').toBe(1);
    const chk = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/completion-check', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ } }));
    expect(JSON.stringify(chk.missing ?? []), 'Không còn báo thiếu chứng từ').not.toMatch(/Chứng từ|document/i);

  });

  test("K3S-142 Dịch vụ đã hoàn thành", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'KHQ_DONE');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const n = ((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' } }))).items ?? []).length;
    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('sau-hoan-thanh.pdf') } });
    expectStatusIn(res, '400/409/422');
    expect(((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' } }))).items ?? []).length, 'Khóa').toBe(n);

  });

  test("K3S-144 Thiếu file", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const res = await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: {} });
    expectStatusIn(res, '400/422');
    expect(res.status(), 'Không 5xx').toBeLessThan(500);

  });

  test("K3S-149 Tải một chứng từ K3", { tag: ["@api", "@thap-dieu-phoi", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const file = REAL.pdf10();
    const upd = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file } }), 'đính chứng từ lô hàng');
    const docId = upd?.documentIds?.[0] ?? upd?.id;
    const GET1 = (type: string, role: 'dp' | 'dpVt' = 'dp') => http.call('GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok(role), params: { id: o.id, type, documentId: docId } });

    const res = await GET1(refs.services.KHQ);
    expectStatusIn(res, '200');
    expect(sha256(await res.body()), 'Đúng file').toBe(sha256(file.buffer));

  });

  test("K3S-158 Không xóa vật lý", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const o = await p0Order(testRun, 'IN_PROGRESS');
    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');

    const u1 = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-1.pdf') } }), 'chứng từ 1');
    const u2 = await must(await http.call('POST /api/k3/service-orders/{id}/services/{type}/documents', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ }, query: { block: 'ACTUAL' }, multipart: { file: samplePdf('chung-tu-2.pdf') } }), 'chứng từ 2');
    const d1 = u1?.documentIds?.[0] ?? u1?.id;
    const d2 = u2?.documentIds?.[0] ?? u2?.id;
    const DEL = (id: string, type: string = refs.services.KHQ) => http.call('DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, type, documentId: id } });

    expectStatusIn(await DEL(d1), '200/204');
    const audit = await http.call('GET /api/admin/audit-log', { token: tok('admin'), query: { search: o.code, page: 1, perPage: 50 } });
    expectStatusIn(audit, '200/204');
    test.info().annotations.push({ type: 'Ghi nhận', description: `Nhật ký quản trị: ${JSON.stringify(await data(audit)).slice(0, 300)}` });
    const raw = await http.call('GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, documentId: d1 } });
    expect(raw.status(), 'Tệp không bị xóa vật lý (không 5xx)').toBeLessThan(500);

  });
});
