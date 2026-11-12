/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, blockCase, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
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

test.describe("Cấu hình chặng → mô phỏng → xác nhận chặng trên phiếu", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-LEG-001 Tạo quy tắc → mô phỏng khớp 2 chặng", { tag: ["@flow", "@cau-hinh-chang", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    await LEGS.withLegSandbox(testRun, async (s) => {
      const profile = await s.availableDomestic(s.refs.borderVn.code);
      const { rule } = await s.create(profile);
      const simIn = await s.simulationInput(profile);
      const d = await must(await s.simulate(simIn), 'mô phỏng');
      expect(d.outcome).toBe('MATCHED');
      expect(d.executionScope, 'Phạm vi Nội địa').toBe('DOMESTIC');
      expect(d.rule.code, 'Mã quy tắc vừa tạo').toBe(rule.code);
      expect(d.legs, 'Tuyến Hữu Nghị → Hà Nội có hai chặng').toHaveLength(2);
      expect(d.legs[0].services.map((x: any) => x.code).sort(), 'Chặng 1 KHQ/HQGS/ST + KB (mặc định)').toEqual(['KHQ', 'HQGS', 'ST', 'KB'].map((k) => s.refs.services[k]).sort());
      expect(d.legs[1].services.map((x: any) => x.code), 'Chặng 2 VT').toEqual([s.refs.services.VT]);
    });

  });

  test("FLOW-LEG-002 Vô hiệu quy tắc thì mô phỏng không khớp, kích hoạt lại thì khớp", { tag: ["@flow", "@cau-hinh-chang", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(900_000);
    await LEGS.withLegSandbox(testRun, async (s) => {
      const profile = await s.availableDomestic(s.refs.borderVn.code);
      const { rule } = await s.create(profile);
      const simIn = await s.simulationInput(profile);
      expect((await must(await s.simulate(simIn), 'mô phỏng trước khi vô hiệu')).rule?.code).toBe(rule.code);
      const h0 = items(await s.history(rule.code)).length;
      await must(await s.status(rule.code, 'INACTIVE'), 'vô hiệu');
      const r1 = await s.simulate(simIn);
      if (r1.ok()) expect((await data(r1)).outcome, 'Lần 1 không có quy tắc phù hợp').toBe('NO_RULE');
      else expectStatusIn(r1, '404');
      await must(await s.status(rule.code, 'ACTIVE'), 'kích hoạt lại');
      expect((await must(await s.simulate(simIn), 'mô phỏng lần 2')).rule.code, 'Lần 2 khớp lại').toBe(rule.code);
      expect(items(await s.history(rule.code)).length, 'Lịch sử 2 lần đổi trạng thái').toBe(h0 + 2);
    });

  });

  test("FLOW-LEG-003 Phiếu dùng quy tắc: preview → xác nhận → khóa", { tag: ["@flow", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    await LEGS.withLegSandbox(testRun, async (s) => {
      const p = await testRun.p0Refs();
      const name = 'AT FLOW-LEG-003 Nội địa VN hai chặng có phiếu dùng';
      let used = items(await s.list({ search: name })).find((d: any) => d.name === name);
      if (!used) {
        const profile = await s.availableDomestic(s.refs.inlandVn.code);
        const legs = [
          { legTypeCode: s.refs.atGate.code, serviceTypeCodes: [s.refs.services.KHQ] },
          { legTypeCode: s.refs.toInland.code, serviceTypeCodes: [s.refs.services.VT] },
        ];
        await must(await http.call('POST /api/leg-rules', { token: tok('admin'), json: { ...profile, name, legs } }), 'tạo quy tắc riêng hai chặng');
        used = items(await s.list({ search: name })).find((d: any) => d.name === name);
      }
      expect(used?.code, 'Tìm thấy quy tắc test riêng').toBeTruthy();
      const rule = await s.get(used.code);
      const original = s.fromDetail(rule);
      expect(original.legs, 'Quy tắc có đúng 2 chặng ban đầu').toHaveLength(2);
      const third = (await testRun.catalog('GET /api/catalogues/leg-types')).find((type: any) => type.active !== false && !original.legs.some((leg) => leg.legTypeCode === type.code));
      if (!third) blockCase('cần một loại chặng thứ ba đang hoạt động');
      if (rule.status !== 'ACTIVE') await must(await s.status(rule.code, 'ACTIVE'), 'kích hoạt lại quy tắc riêng');
      const base = await ORD.p0Base(testRun);
      const zone = (await testRun.catalog('GET /api/catalogues/transport-points')).find((item: any) => item.code === p.originPoint);
      const ward = zone?.wards?.[0];
      if (!zone?.province?.code || !ward?.code) blockCase('cần địa chỉ lấy hàng nằm trong vùng vận tải P0');
      const places = { ORIGIN: { pointType: 'ADDRESS', countryCode: 'VN', provinceCode: zone.province.code, wardCode: ward.code, placeName: 'Địa chỉ lấy hàng của fixture P0' }, DESTINATION: { ...p.destination } };
      const vt = { ...YC.serviceEntry(p, 'VT'), routes: [{ pickup: places.ORIGIN, delivery: places.DESTINATION }] };
      const order = await ORD.createOrder(testRun, base, { submit: true, body: await ORD.orderBody(testRun, base, {
        places, cargoLoadTypeCode: original.cargoLoadTypeCode, services: [YC.serviceEntry(p, 'KHQ'), vt],
      }, ['KHQ', 'VT']) });
      await CCF.acceptOrder(testRun, order.id);
      const preview = await CCF.confirmLegs(testRun, order.id);
      expect(preview.ruleCode, 'ruleCode theo preview').toBe(rule.code);
      const legs0 = stable((await CCF.k3Order(testRun, order.id)).legs);
      expect(legs0, 'Phiếu xác nhận đúng hai chặng').toHaveLength(2);
      try {
        expectStatusIn(await s.update(rule.code, { ...original, legs: [...original.legs, { legTypeCode: third.code, serviceTypeCodes: [] }] }), '200/204', 'sửa quy tắc');
        expect((await s.get(rule.code)).legs, 'Quy tắc đã có chặng thứ ba').toHaveLength(3);
        expect(stable((await CCF.k3Order(testRun, order.id)).legs), 'Phiếu giữ cấu trúc chặng sau khi sửa quy tắc').toEqual(legs0);
        expectStatusIn(await s.remove(rule.code), '400/409/422', 'Xóa quy tắc đã dùng bị chặn');
      } finally {
        expectStatusIn(await s.update(rule.code, original), '200/204', 'khôi phục quy tắc test');
      }
    });

  });

  test("FLOW-LEG-004 Không có quy tắc khớp thì không xác nhận được chặng", { tag: ["@flow", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(600_000);
    const p = await testRun.p0Refs();
    const cn = (await testRun.catalog('GET /api/catalogues/provinces', { countryCode: 'CN' }))[0];
    if (!cn) throw new Error('Chuẩn bị dữ liệu thất bại: danh mục chưa có tỉnh Trung Quốc');
    const base = await ORD.p0Base(testRun);
    const reference = await ORD.createOrder(testRun, base, { submit: true, body: await ORD.orderBody(testRun, base, {}, ['VT']) });
    await CCF.acceptOrder(testRun, reference.id);
    const valid = await must(await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: reference.id } }), 'đọc payload xác nhận hợp lệ của phiếu VT đối chứng');
    expect(valid.ruleCode).toBeTruthy();
    expect(valid.legs.length).toBeGreaterThan(0);
    const places = { ORIGIN: { pointType: 'ADDRESS', countryCode: 'CN', provinceCode: cn.code, placeName: 'Kho Bằng Tường' }, DESTINATION: { pointType: 'ADDRESS', countryCode: 'CN', provinceCode: cn.code, placeName: 'Kho Nam Ninh' } };
    const vt = { ...YC.serviceEntry(p, 'VT'), routes: [{ pickup: places.ORIGIN, delivery: places.DESTINATION }] };
    const order = await ORD.createOrder(testRun, base, { submit: true, body: await ORD.orderBody(testRun, base, { places, services: [vt] }, ['VT']) });
    await CCF.acceptOrder(testRun, order.id);
    const pv = await http.call('GET /api/k3/service-orders/{id}/legs/preview', { token: tok('cc'), params: { id: order.id } });
    if (pv.ok()) expect((await data(pv)).ruleCode ?? null, 'Preview báo không có cấu trúc phù hợp').toBeNull();
    else {
      expectStatusIn(pv, '400/404/409/422', 'preview');
      await expectApiError(pv);
    }
    const cf = await http.call('POST /api/k3/service-orders/{id}/legs/confirm', { token: tok('cc'), params: { id: order.id }, json: CCF.confirmLegsBody(valid) });
    expectStatusIn(cf, '400/404/409/422', 'không xác nhận được chặng');
    await expectApiError(cf);
    expect((await CCF.k3Order(testRun, order.id)).legs ?? []).toHaveLength(0);
    const opts = await http.call('GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { token: tok('dp'), params: { id: order.id, type: p.services.VT } });
    if (opts.ok()) expect((await data(opts)).unavailableReason, 'Phiếu không sang được bước điều phối').toBeTruthy();
    else expectStatusIn(opts, '400/403/404/409/422', 'điều phối');

  });
});
