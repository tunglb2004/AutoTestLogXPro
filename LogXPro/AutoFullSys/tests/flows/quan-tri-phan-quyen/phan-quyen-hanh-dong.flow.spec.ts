/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
import { test, expect, tagged, today, uuid, TestRun } from '../../../src/core/fixtures/test-run.fixture';
import { markIncomplete } from '../../../src/core/fixtures/auth.fixture';
import { CallOptions, items, must } from '../../../src/core/base.client';
import { expectStatusIn, expectNoData, expectMoney, stable } from '../../../src/core/assertions';
import { env } from '../../../src/core/env';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as K3 from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import * as CCF from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import * as BGK from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as GM from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
import * as LEGS from '../../../src/cau-hinh-chang/data/leg-sandbox';

async function roleToken(run: TestRun, permissions: string[]): Promise<string> {
  expect(permissions, 'Vai trò thử nghiệm có quyền được khai báo').not.toHaveLength(0);
  const role = await ADM.newRole(run, permissions);
  const user = await ADM.newUser(run, { roleIds: [role.id] });
  return (await ADM.loginReadyUser(run, user)).accessToken;
}

test.describe("Phân quyền theo hành động (Xem / Cập nhật / Kích hoạt / Duyệt)", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-PERM-001 Vai trò chỉ Xem: mọi thao tác ghi ở module giá bị chặn", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const refs = await testRun.p0Refs();
    const base = await PF.flowBase(testRun, 'FLOW-PERM-001', false);
    const cat = await ADM.catalogue(testRun);
    const GROUPS = /giá mua đầu vào|giá mua định mức|giá bán định mức/i;
    const viewOnly = ADM.permissionCodes(cat.filter((p: any) => GROUPS.test(p.groupName ?? '') && /xem/i.test(p.name ?? '')));
    const t = await roleToken(testRun, viewOnly);
    const sbp = await PF.buying(testRun, base, 'customsFee');
    const ssp = await PF.selling(testRun, base, 'customsFee');
    const contractor = env.ref('CONTRACTOR_A_ID');
    const source = GM.priceLine(refs, base.items, 'customsFee', PF.priceItem('customsFee').buyA!);
    const draftBody = await GM.sheetBody(testRun, contractor, 'VND', [source], tagged('AT Phân quyền bảng giá'));
    const sheet = await PF.ok(testRun, 'POST /api/purchase-prices', {}, { ...draftBody, effectiveFrom: today(1) }, 'k1');
    expect(sheet.id, 'Bảng giá riêng dùng cho phép thử ghi').toBeTruthy();
    testRun.track(`Bảng giá thử quyền ${sheet.id}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: sheet.id } }));
    const sheetParams = { id: sheet.id };
    const detail = await must(await http.call('GET /api/purchase-prices/{id}', { token: t, params: sheetParams }), 'Vai trò chỉ xem đọc được bảng giá');
    expect(detail.id).toBe(sheet.id);
    const line = await GM.sheetLine(testRun, sheet.id, base.items.customsFee.id);
    const price = Number(line.unitPrice) + 10_000;
    const benchmarkPrice = Number(sbp.benchmarkPrice) + 10_000;
    const sellingPrice = Number(ssp.sellingPrice) + 10_000;
    const snap = async () => stable({
      sheet: await PF.read(testRun, 'GET /api/purchase-prices/{id}', sheetParams, 'k1'),
      lines: await GM.sheetItems(testRun, sheet.id),
      sheetHistory: await PF.histories(testRun, 'GET /api/purchase-prices/{id}/history', sheet.id, 'k1'),
      sbp: await PF.buying(testRun, base, 'customsFee'),
      sbpHistory: await PF.histories(testRun, 'GET /api/standard-buying-prices/{id}/history', sbp.id),
      ssp: await PF.selling(testRun, base, 'customsFee'),
      sspHistory: await PF.histories(testRun, 'GET /api/standard-selling-prices/{id}/history', ssp.id),
    });
    const before = await snap();
    const writes: [string, CallOptions][] = [
      ['PUT /api/purchase-prices/{id}/items', { params: sheetParams, json: { updated: [{ id: line.id, unitPrice: price }] } }],
      ['PUT /api/purchase-prices/{id}/items/{itemId}', { params: { ...sheetParams, itemId: line.id }, json: { ...GM.lineAttributes(refs, 'customsFee'), unitCode: line.unitCode, unitPrice: price } }],
      ['POST /api/purchase-prices/{id}/activate', { params: sheetParams }],
      ['PUT /api/standard-buying-prices/{id}/benchmark', { params: { id: sbp.id }, json: { benchmarkPrice } }],
      ['PUT /api/standard-buying-prices/benchmarks', { json: { items: [{ id: sbp.id, benchmarkPrice }] } }],
      ['PUT /api/standard-selling-prices/{id}/selling-price', { params: { id: ssp.id }, json: { sellingPrice } }],
      ['PUT /api/standard-selling-prices/selling-prices', { json: { items: [{ id: ssp.id, sellingPrice }] } }],
    ];
    for (const [api, opts] of writes) expectStatusIn(await http.call(api, { token: t, ...opts }), '403', `Ghi bị chặn: ${api}`);
    expect(await snap(), 'Giá, trạng thái, lịch sử không đổi').toEqual(before);
    markIncomplete('Phép kiểm quyền ghi cấu hình đầu mục giá nằm ngoài phạm vi hiện tại.');
  });

  test("FLOW-PERM-002 K4 chỉ xem giá bán định mức không sửa được SSP", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const base = await PF.flowBase(testRun, 'FLOW-PERM-002', true);
    const cat = await ADM.catalogue(testRun);
    const sspView = ADM.permissionCodes(cat.filter((p: any) => /giá bán định mức/i.test(p.groupName ?? '') && /xem/i.test(p.name ?? '')));
    const t = await roleToken(testRun, sspView);
    const ssp = await PF.selling(testRun, base, 'customsFee');
    const params = { id: ssp.id };
    const before = await must(await http.call('GET /api/standard-selling-prices/{id}', { token: t, params }), 'Vai trò chỉ xem đọc được SSP');
    expect(before.id).toBe(ssp.id);
    const history = async () => stable(items(await must(await http.call('GET /api/standard-selling-prices/{id}/history', { token: t, params, query: { page: 1, perPage: 100 } }), 'Vai trò chỉ xem đọc được lịch sử SSP')));
    const h0 = await history();
    expectStatusIn(await http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: t, params, json: { sellingPrice: 1_300_000 } }), '403');
    expectStatusIn(await http.call('POST /api/standard-selling-prices/{id}/acknowledgement', { token: t, params }), '403');
    expectMoney((await PF.selling(testRun, base, 'customsFee')).sellingPrice, Number(before.sellingPrice), 'SSP giữ giá');
    expect(await history(), 'Lịch sử không có bản ghi mới').toEqual(h0);
    const quote = await BGK.getCustomerQuotation(testRun, base.rcId);
    expect(quote.lines.length, 'Báo giá có dòng để kiểm trạng thái').toBeGreaterThan(0);
    expect(quote.lines.filter((l: any) => l.expired), 'Báo giá không có dòng Hết hạn').toHaveLength(0);

  });

  test("FLOW-PERM-003 Không có quyền Xem thì không đọc chi tiết, lịch sử, tải file", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    const base = await PF.flowBase(testRun, 'FLOW-PERM-003', true);

    const reads: [string, Record<string, string>][] = [
      ['GET /api/purchase-prices/{id}', { id: base.sheetA }],
      ['GET /api/purchase-prices/{id}/history', { id: base.sheetA }],
      ['GET /api/customer-quotations/{id}', { id: base.rcId }],
      ['GET /api/customer-quotations/{id}/versions', { id: base.rcId }],
      ['GET /api/price-configurations/{id}/history', { id: base.items.customsFee.configId }],
      ['GET /api/customer-quotations/{id}/export', { id: base.rcId }],
    ];
    for (const [api, params] of reads) {
      const res = await http.call(api, { token: tok('sale'), params, query: api.endsWith('/export') ? { format: 'PDF' } : { page: 1 } });
      expectStatusIn(res, '403', api);
      expect((await res.body()).subarray(0, 4).toString(), `${api}: không trả file`).not.toBe('%PDF');
      if (!api.endsWith('/export')) await expectNoData(res);
    }

  });

  test("FLOW-PERM-004 Thu hồi quyền khi form đang mở rồi bấm Lưu", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.setTimeout(900_000);
    const base = await PF.flowBase(testRun, 'FLOW-PERM-004', false);
    const cat = await ADM.catalogue(testRun);
    const ssp = ADM.permissionCodes(cat.filter((p: any) => /giá bán định mức/i.test(p.groupName ?? '')));
    const edit = cat.find((p: any) => /giá bán định mức/i.test(p.groupName ?? '') && /chỉnh sửa|cập nhật/i.test(p.name ?? ''))?.code;
    if (!edit) throw new Error('Rổ quyền thiếu quyền chỉnh sửa Giá bán định mức');
    const role = await ADM.newRole(testRun, ssp, { name: ADM.uniqueName('Định giá AT') });
    const u = await ADM.newUser(testRun, { roleIds: [role.id] });
    const t = (await ADM.loginReadyUser(testRun, u)).accessToken;
    const line = await PF.selling(testRun, base, 'customsFee');
    expectStatusIn(await http.call('GET /api/standard-selling-prices/{id}', { token: t, params: { id: line.id } }), '200', 'đang mở chế độ sửa');
    expect(await ADM.myPermissions(testRun, t)).toContain(edit);
    const initialPrice = Number(line.sellingPrice) + 1000;
    expectStatusIn(await http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: t, params: { id: line.id }, json: { sellingPrice: initialPrice } }), '200/204', 'Tài khoản có thể sửa trước khi bị thu hồi');
    expectMoney((await PF.selling(testRun, base, 'customsFee')).sellingPrice, initialPrice);
    const r0 = await ADM.role(testRun, role.id);
    await must(await ADM.adminRequest(testRun, 'PUT /api/admin/roles/{id}', { params: { id: role.id }, json: { name: r0.name, description: r0.description ?? '', permissions: r0.permissions.filter((p: string) => p !== edit) } }), 'ADMIN gỡ quyền Chỉnh sửa GBĐM');
    const history = async () => stable(await PF.histories(testRun, 'GET /api/standard-selling-prices/{id}/history', line.id));
    const h0 = await history();
    expectStatusIn(await http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: t, retryUnauthorized: false, params: { id: line.id }, json: { sellingPrice: 1_250_000 } }), '403', 'Lưu bị chặn ngay với phiên đang mở');
    expectMoney((await PF.selling(testRun, base, 'customsFee')).sellingPrice, initialPrice);
    expect(await history(), 'Không có bản ghi lịch sử').toEqual(h0);

  });

  test("FLOW-PERM-005 Cấu hình chặng: quyền Sửa tách khỏi Kích hoạt/Vô hiệu", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.setTimeout(900_000);
    const cat = await ADM.catalogue(testRun);
    const legGroup = cat.filter((p: any) => /cấu hình chặng|quy tắc chặng/i.test(p.groupName ?? ''));
    const view = ADM.permissionCodes(legGroup.filter((p: any) => /xem/i.test(p.name ?? '')));
    const editP = legGroup.find((p: any) => /chỉnh sửa/i.test(p.name ?? ''))?.code;
    const statusP = legGroup.find((p: any) => /kích hoạt|vô hiệu/i.test(p.name ?? ''))?.code;
    if (!editP || !statusP) throw new Error('Chuẩn bị dữ liệu thất bại: rổ quyền thiếu "Chỉnh sửa quy tắc chặng" hoặc "Kích hoạt/Vô hiệu hóa"');
    const t1 = await roleToken(testRun, [...view, editP]);
    const t2 = await roleToken(testRun, [...view, statusP]);
    await LEGS.withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available());
      const h0 = items(await s.history(rule.code)).length;
      const body1 = { ...s.fromDetail(rule), description: 'R1 sửa mô tả' };
      expectStatusIn(await http.call('PUT /api/leg-rules/{code}', { token: t1, params: { code: rule.code }, json: body1 }), '200/204', 'R1 sửa được');
      expectStatusIn(await http.call('PATCH /api/leg-rules/{code}/status', { token: t1, params: { code: rule.code }, json: { status: 'INACTIVE' } }), '403', 'R1 không đổi trạng thái');
      expectStatusIn(await http.call('PATCH /api/leg-rules/{code}/status', { token: t2, params: { code: rule.code }, json: { status: 'INACTIVE' } }), '200/204', 'R2 đổi trạng thái được');
      expectStatusIn(await http.call('PUT /api/leg-rules/{code}', { token: t2, params: { code: rule.code }, json: { ...body1, description: 'R2 sửa' } }), '403', 'R2 không sửa được');
      expectStatusIn(await http.call('DELETE /api/leg-rules/{code}', { token: t1, params: { code: rule.code } }), '403', 'R1 không xóa được');
      expect(await s.get(rule.code)).toMatchObject({ status: 'INACTIVE', description: body1.description });
      expect(items(await s.history(rule.code)).length, 'Lịch sử chỉ có 2 bản ghi thành công').toBe(h0 + 2);
    });

  });

  test("FLOW-PERM-006 Gọi thẳng URL/API thao tác điều phối bằng CC", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(600_000);
    const refs = await testRun.p0Refs();
    const o = await ORD.p0Order(testRun, 'ACCEPTED');
    const svc = o.svc.KHQ;
    const contractorId = env.ref('CONTRACTOR_A_ID');
    const params = { id: svc.id, type: svc.type };
    const snapshot = async () => stable({ order: await CCF.k3Order(testRun, o.id), costs: await K3.costs(testRun, svc) });
    const denied = async (api: string, json?: Record<string, unknown>) => {
      const before = await snapshot();
      expectStatusIn(await http.call(api, { token: tok('cc'), params, json }), '403', `CC bị chặn: ${api}`);
      expect(await snapshot(), `${api}: không thay đổi phiếu và chi phí`).toEqual(before);
    };
    const assignments = [{ priceConfigurationItemId: o.base.items.customsFee.id, contractorId, unitCode: refs.units.customsFee }];
    await denied('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { assignments });
    await K3.coordinate(testRun, svc, assignments);
    await denied('POST /api/k3/service-orders/{id}/services/{type}/start');
    await K3.startService(testRun, svc);
    const surcharge = await K3.costItem(testRun, svc, contractorId, o.base.items.overtime.id);
    expect(surcharge.purchasePriceItemId, 'Có dòng giá phụ phí cho dữ liệu ghi hợp lệ').toBeTruthy();
    await denied('POST /api/k3/service-orders/{id}/services/{type}/costs', {
      contractorId, kind: 'SURCHARGE', purchasePriceItemId: surcharge.purchasePriceItemId,
      priceConfigurationItemId: o.base.items.overtime.id, unitCode: refs.units.overtime,
      quantity: 1, amount: PF.priceItem('overtime').buyA, currency: 'VND',
    });

  });
});
