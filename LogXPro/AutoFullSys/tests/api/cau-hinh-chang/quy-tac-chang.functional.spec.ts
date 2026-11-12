import { withLegSandbox, expectSuccessEnvelope } from '../../../src/cau-hinh-chang/data/leg-sandbox';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { p0Base, createOrder, orderBody } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { serviceEntry } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)", () => {
  test("LEG-002 Danh sách quy tắc chặng", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const d = await s.list({ search: 'RUL-', status: 'ACTIVE', page: 1 });
      expect(items(d).length, 'Có quy tắc seed đang hoạt động').toBeGreaterThan(0);
      for (const r of items(d)) { expect(r.code).toMatch(/^RUL-\d{4}-\d+$/); expect(r.status).toBe('ACTIVE'); expect(Array.isArray(r.legs)).toBe(true); expect(r.legs.length).toBeGreaterThan(0); }
    });
  });

  test("LEG-003 Lọc theo phạm vi, điểm đi, điểm đến, trạng thái", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const a = await s.create(await s.available({ executionScope: 'DOMESTIC', originPointTypeCode: s.refs.borderVn.code }));
      const b = await s.create(await s.available({ executionScope: 'INTERNATIONAL' }));
      expectStatusIn(await s.status(a.rule.code, 'INACTIVE'), '200/204');
      const rows = items(await s.list({ executionScope: 'DOMESTIC', originPointTypeCode: s.refs.borderVn.code, destinationPointTypeCode: a.rule.destinationPointType.code, status: 'INACTIVE' }));
      expect(rows.some(r => r.code === a.rule.code)).toBe(true);
      expect(rows.some(r => r.code === b.rule.code)).toBe(false);
      for (const r of rows) { expect(r.executionScope).toBe('DOMESTIC'); expect(r.status).toBe('INACTIVE'); expect(r.originPointType.code).toBe(s.refs.borderVn.code); expect(r.destinationPointType.code).toBe(a.rule.destinationPointType.code); }
    });
  });

  test("LEG-004 Tắt phân trang", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      while (items(await s.list()).length <= 20) await s.create(await s.available());
      const d = await s.list({ pagination: false });
      expect(d.items.length).toBeGreaterThan(20);
      if (d.meta?.pagination) expect(d.meta.pagination.total).toBe(d.items.length);
      expect(new Set(d.items.map((r: any) => r.code)).size).toBe(d.items.length);
    });
  });

  test("LEG-009 Tạo quy tắc chặng cho tuyến Cửa khẩu VN → Nội địa VN", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ testRun }) => {

    await withLegSandbox(testRun, async (s) => {
      const b = await s.available({ name: `AT Cửa khẩu VN → Nội địa VN ${TEST_RUN_ID} ${Math.random().toString(36).slice(2, 6)}` });
      const { response, rule } = await s.create(b);
      expectStatusIn(response, '200/201');
      expect(String(rule.code), 'Mã RUL-YYMM-xxx').toMatch(/^RUL-\d{4}-\w{3,}$/);
      expect(rule.status).toBe('ACTIVE');
      expect(rule.legs.map((l: any) => l.position), '2 chặng đúng thứ tự').toEqual([1, 2]);
      expect(rule.legs.map((l: any) => l.name)).toEqual([s.refs.atGate.name, s.refs.toInland.name]);
      expect(rule.legs[0].services.map((x: any) => x.code).sort()).toEqual([...b.legs[0].serviceTypeCodes].sort());
      expect(rule.legs[1].services.map((x: any) => x.code)).toEqual(b.legs[1].serviceTypeCodes);
    });

  });

  test("LEG-010 Trùng đủ 5 trường với quy tắc khác", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const existing = items(await s.list())[0];
      expect(existing, 'Có quy tắc để kiểm trùng 5 trường').toBeTruthy();
      const duplicate = s.fromDetail(await s.get(existing.code)); duplicate.name = tagged('AT Tên khác kiểm trùng tổ hợp');
      await s.rejectedCreate(duplicate, '400/409/422');
    });
  });

  test("LEG-011 Phương thức Đường biển và loại hình Hàng ghép đang được hỗ trợ", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      for (const changes of [{ transportModeCode: s.refs.sea.code }, { cargoLoadTypeCode: s.refs.partial.code }]) {
        const { response } = await s.create(await s.available(changes));
        expectStatusIn(response, '200/201');
      }
    });
  });

  test("LEG-012 Phạm vi Cửa khẩu thì điểm đi = điểm đến trong nhóm cửa khẩu", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await expect(withLegSandbox(testRun, async (s) => {
      await s.rejectedCreate(await s.available({ executionScope: 'BORDER_GATE', originPointTypeCode: s.refs.borderVn.code, destinationPointTypeCode: s.refs.inlandVn.code }), '400/422');
    }), 'Sandbox chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("LEG-013 Dịch vụ Kho bãi không được gán vào chặng", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {
    await expect(withLegSandbox(testRun, async (s) => {
      const b = await s.available(); b.legs[0].serviceTypeCodes.push(s.refs.services.KB);
      await s.rejectedCreate(b, '400/422');
    }), 'Sandbox chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("LEG-014 Chặng không có dịch vụ vẫn lưu được", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ testRun }) => {

    await withLegSandbox(testRun, async (s) => {
      const b = await s.available();
      b.legs = [b.legs[0], { ...b.legs[1], serviceTypeCodes: [] }];
      const { response, rule } = await s.create(b);
      expectStatusIn(response, '200/201');
      expect(rule.legs[1].services, 'Chặng không dịch vụ vẫn lưu').toEqual([]);
      expect(rule.legs[1].empty, 'Chặng rỗng được đánh dấu để ẩn trên phiếu').toBe(true);
    });

  });

  test("LEG-015 Tên chặng trùng trong cùng quy tắc", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {
    await expect(withLegSandbox(testRun, async (s) => {
      const b = await s.available(); b.legs = [b.legs[0], { ...b.legs[0], serviceTypeCodes: [s.refs.services.VT] }];
      await s.rejectedCreate(b, '400/422');
    }), 'Sandbox chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("LEG-016 Quy tắc mới ở `ACTIVE`", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available());
      expect((await s.get(rule.code)).status).toBe('ACTIVE');
    });
  });

  test("LEG-017 `legs` rỗng", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const b = await s.available({ legs: [] });
      await s.rejectedCreate(b, '400/422');
      expect(items(await s.list({ search: b.name })).filter(r => r.name === b.name)).toHaveLength(0);
    });
  });

  test("LEG-029 Sửa quy tắc chặng", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ testRun }) => {

    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available());
      const h0 = items(await s.history(rule.code)).length;
      const u = s.fromDetail(rule);
      u.legs[1] = { ...u.legs[1], legTypeCode: s.refs.toInland.code, serviceTypeCodes: [...u.legs[1].serviceTypeCodes, s.refs.services.HQGS] };
      const res = await s.update(rule.code, u);
      expectStatusIn(res, '200/204');
      const now = await s.get(rule.code);
      expect(now.code, 'Mã không đổi').toBe(rule.code);
      expect(now.legs[1].name).toBe(s.refs.toInland.name);
      expect(now.legs[1].services.map((x: any) => x.code), 'Thêm HQGS').toContain(s.refs.services.HQGS);
      const hist = items(await s.history(rule.code));
      expect(hist.length, 'Lịch sử ghi Chỉnh sửa').toBeGreaterThan(h0);
      expect(JSON.stringify(hist[0]), 'Bản ghi Chỉnh sửa').toMatch(/Chỉnh sửa|UPDATE|Sửa/i);
    });

  });

  test("LEG-030 Sửa thành trùng 5 trường với quy tắc khác", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const a = await s.create(await s.available()); const b = await s.create(await s.available());
      const before = await s.unchanged(a.rule.code); const otherBefore = await s.unchanged(b.rule.code);
      const payload = { ...s.fromDetail(b.rule), name: a.rule.name };
      const res = await s.update(a.rule.code, payload); expectStatusIn(res, '400/409/422'); await expectApiError(res);
      expect(await s.unchanged(a.rule.code)).toEqual(before); expect(await s.unchanged(b.rule.code)).toEqual(otherBefore);
    });
  });

  test("LEG-031 Sửa quy tắc không đổi chặng đã đóng băng trên phiếu", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {

    await withLegSandbox(testRun, async (s) => {
      const p = await testRun.p0Refs();
      const bn = await testRun.pick('GET /api/catalogues/provinces', /Bắc Ninh/i, { countryCode: 'VN' });
      const simIn = { transportModeCode: s.refs.road.code, cargoLoadTypeCode: s.refs.full.code, origin: { kind: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, detail: 'KCN Quế Võ' }, destination: { kind: 'ADDRESS', countryCode: 'VN', provinceCode: (p.destination as any).provinceCode, detail: 'KCN Bắc Thăng Long' }, serviceTypeCodes: [s.refs.services.VT] };

      const NAME = 'AT Quy tắc chặng Nội địa VN có phiếu dùng';
      let used = items(await s.list({ search: NAME })).find((d: any) => d.name === NAME);
      if (!used) {
        const b = await s.available({ name: NAME, executionScope: 'DOMESTIC', originPointTypeCode: s.refs.inlandVn.code, destinationPointTypeCode: s.refs.inlandVn.code, legs: [{ legTypeCode: s.refs.toInland.code, serviceTypeCodes: [s.refs.services.VT] }] });
        await must(await http.call('POST /api/leg-rules', { token: tok('admin'), json: b }), 'tạo quy tắc riêng cho tuyến nội địa');
        used = items(await s.list({ search: NAME })).find((d: any) => d.name === NAME);
      }
      const rule = await s.get(used.code);
      if (rule.status !== 'ACTIVE') await must(await s.status(rule.code, 'ACTIVE'), 'kích hoạt lại quy tắc riêng');
      const base = await p0Base(testRun);
      const places = { ORIGIN: { pointType: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, placeName: 'KCN Quế Võ, Bắc Ninh' }, DESTINATION: { ...p.destination } };
      const vt = { ...serviceEntry(p, 'VT'), routes: [{ pickup: places.ORIGIN, delivery: places.DESTINATION }] };
      const order = await createOrder(testRun, base, { submit: true, body: await orderBody(testRun, base, { places, services: [vt] }, ['VT']) });
      await acceptOrder(testRun, order.id);
      const preview = await confirmLegs(testRun, order.id);
      if (preview.ruleCode !== rule.code) throw new Error(`Chuẩn bị dữ liệu thất bại: phiếu nội địa khớp ${preview.ruleCode}, không phải quy tắc riêng ${rule.code}`);
      const legs0 = stable((await k3Order(testRun, order.id)).legs);

      const original = s.fromDetail(rule);
      try {
        const u = s.fromDetail(rule);
        u.legs = [...u.legs, { legTypeCode: s.refs.atGate.code, serviceTypeCodes: [] }];
        const res = await s.update(rule.code, u);
        expectStatusIn(res, '200/204');
        expect(stable((await k3Order(testRun, order.id)).legs), 'Cấu trúc chặng của phiếu giữ nguyên').toEqual(legs0);
      } finally {
        await s.update(rule.code, original);
      }
    });

  });

  test("LEG-032 Không gửi `id` chặng cũ thì chặng được tạo lại", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ testRun }) => {

    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available());
      const u = s.fromDetail(rule);
      const oldIds = u.legs.map((l) => l.id);
      u.legs = [...u.legs].reverse().map(({ id: _id, ...l }) => l);
      const res = await s.update(rule.code, u);
      expectStatusIn(res, '200/204');
      const now = await s.get(rule.code);
      const ids = (now.legs ?? []).map((l: any) => l.id).filter(Boolean);
      if (ids.length) expect(ids.some((id: string) => oldIds.includes(id)), 'Chặng được tạo lại (id mới)').toBe(false);
      expect(now.legs.map((l: any) => l.name), 'Thứ tự đúng theo mảng gửi lên').toEqual([s.refs.toInland.name, s.refs.atGate.name]);
    });

  });

  test("LEG-038 Xóa quy tắc chưa có phiếu dùng", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available());
      expectStatusIn(await s.remove(rule.code), '200/204');
      const after = await http.call('GET /api/leg-rules/{code}', { token: tok('admin'), params: { code: rule.code } }); expectStatusIn(after, '404'); await expectApiError(after);
      expect(items(await s.list({ search: rule.code })).some(r => r.code === rule.code)).toBe(false);
    });
  });

  test("LEG-039 Vòng đời tạo → đọc → sửa → xóa quy tắc", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const b = await s.available(); const { rule } = await s.create(b); expect((await s.get(rule.code)).name).toBe(b.name);
      const update = s.fromDetail(rule); update.name = tagged('AT Tên đã sửa');
      expectStatusIn(await s.update(rule.code, update), '200/201/204');
      expect((await s.get(rule.code)).name).toBe(update.name);
      expectStatusIn(await s.remove(rule.code), '200/201/204');
      const after = await http.call('GET /api/leg-rules/{code}', { token: tok('admin'), params: { code: rule.code } }); expectStatusIn(after, '404');
      expect(items(await s.list({ search: update.name })).some(r => r.code === rule.code)).toBe(false);
    });
  });

  test("LEG-040 Xóa quy tắc đã có phiếu dùng", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {

    await withLegSandbox(testRun, async (s) => {
      const p = await testRun.p0Refs();
      const bn = await testRun.pick('GET /api/catalogues/provinces', /Bắc Ninh/i, { countryCode: 'VN' });
      const simIn = { transportModeCode: s.refs.road.code, cargoLoadTypeCode: s.refs.full.code, origin: { kind: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, detail: 'KCN Quế Võ' }, destination: { kind: 'ADDRESS', countryCode: 'VN', provinceCode: (p.destination as any).provinceCode, detail: 'KCN Bắc Thăng Long' }, serviceTypeCodes: [s.refs.services.VT] };

      const NAME = 'AT Quy tắc chặng Nội địa VN có phiếu dùng';
      let used = items(await s.list({ search: NAME })).find((d: any) => d.name === NAME);
      if (!used) {
        const b = await s.available({ name: NAME, executionScope: 'DOMESTIC', originPointTypeCode: s.refs.inlandVn.code, destinationPointTypeCode: s.refs.inlandVn.code, legs: [{ legTypeCode: s.refs.toInland.code, serviceTypeCodes: [s.refs.services.VT] }] });
        await must(await http.call('POST /api/leg-rules', { token: tok('admin'), json: b }), 'tạo quy tắc riêng cho tuyến nội địa');
        used = items(await s.list({ search: NAME })).find((d: any) => d.name === NAME);
      }
      const rule = await s.get(used.code);
      if (rule.status !== 'ACTIVE') await must(await s.status(rule.code, 'ACTIVE'), 'kích hoạt lại quy tắc riêng');
      const base = await p0Base(testRun);
      const places = { ORIGIN: { pointType: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, placeName: 'KCN Quế Võ, Bắc Ninh' }, DESTINATION: { ...p.destination } };
      const vt = { ...serviceEntry(p, 'VT'), routes: [{ pickup: places.ORIGIN, delivery: places.DESTINATION }] };
      const order = await createOrder(testRun, base, { submit: true, body: await orderBody(testRun, base, { places, services: [vt] }, ['VT']) });
      await acceptOrder(testRun, order.id);
      const preview = await confirmLegs(testRun, order.id);
      if (preview.ruleCode !== rule.code) throw new Error(`Chuẩn bị dữ liệu thất bại: phiếu nội địa khớp ${preview.ruleCode}, không phải quy tắc riêng ${rule.code}`);
      const legs0 = stable((await k3Order(testRun, order.id)).legs);

      const before = stable(await s.get(rule.code));
      const res = await s.remove(rule.code);
      expectStatusIn(res, '400/409/422');
      await expectApiError(res);
      expect(stable(await s.get(rule.code)), 'Quy tắc còn nguyên, chỉ được vô hiệu').toEqual(before);
    });

  });

  test("LEG-041 Mã không được cấp lại", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const b = await s.available(); const first = await s.create(b);
      expectStatusIn(await s.remove(first.rule.code), '200/201/204');
      b.name = tagged('AT Quy tắc sau xóa'); const second = await s.create(b);
      expect(second.rule.code).not.toBe(first.rule.code);
      const a = /^RUL-(\d{4})-(\d+)$/.exec(first.rule.code); const c = /^RUL-(\d{4})-(\d+)$/.exec(second.rule.code);
      expect(a).not.toBeNull(); expect(c).not.toBeNull();
      if (a![1] === c![1]) expect(Number(c![2])).toBeGreaterThan(Number(a![2]));
    });
  });

  test("LEG-050 Lọc lịch sử theo thời gian, người thực hiện và phân trang", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, tok, page }) => {

    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available());
      const u = s.fromDetail(rule); u.description = 'Sửa mô tả bởi ADMIN';
      await must(await s.update(rule.code, u), 'ADMIN sửa');
      await must(await s.status(rule.code, 'INACTIVE'), 'ADMIN vô hiệu');
      const me = await data(await http.call('GET /api/auth/me', { token: tok('admin') }));
      const myId = me?.userId ?? me?.id;
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const from = start.toISOString();
      const to = new Date(Date.now() + 60_000).toISOString();
      const res = await http.call('GET /api/leg-rules/{code}/history', { token: tok('admin'), params: { code: rule.code }, query: { from, to, actorUserId: myId, page: 1, perPage: 2 } });
      expectStatusIn(res, '200');
      const list = items(await data(res));
      expect(list.length).toBeGreaterThan(0);
      expect(list.length, 'Tối đa 2 bản ghi').toBeLessThanOrEqual(2);
      expect(list.every((h: any) => (h.actorUserId ?? myId) === myId), 'Chỉ bản ghi của người đó').toBe(true);
      expect(list.every((h: any) => Date.parse(h.at) >= Date.parse(from) && Date.parse(h.at) <= Date.parse(to)), 'Trong khoảng').toBe(true);
      const at = list.map((h: any) => Date.parse(h.at));
      expect(at, 'Mới nhất trước').toEqual([...at].sort((p, q) => q - p));
      test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Chỉ ADMIN có quyền cấu hình chặng nên các bản ghi của "người thứ 2" không dựng được; kiểm bộ lọc theo ADMIN' });
    });

  });

  test("LEG-051 Vô hiệu hoặc kích hoạt quy tắc", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ testRun }) => {

    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available());
      const res = await s.status(rule.code, 'INACTIVE');
      expectStatusIn(res, '200/204');
      expect((await s.get(rule.code)).status, 'Quy tắc INACTIVE').toBe('INACTIVE');
    });

  });

  test("LEG-052 `ACTIVE` → `INACTIVE` → `ACTIVE`", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available()); const h0 = items(await s.history(rule.code)).length;
      for (const status of ['INACTIVE','ACTIVE'] as const) { expectStatusIn(await s.status(rule.code, status), '200/204'); expect((await s.get(rule.code)).status).toBe(status); }
      expect(items(await s.history(rule.code))).toHaveLength(h0 + 2);
    });
  });

  test("LEG-053 Quy tắc vô hiệu không được khớp khi mô phỏng/xác nhận chặng", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ testRun }) => {

    await withLegSandbox(testRun, async (s) => {
      const p = await testRun.p0Refs();
      const bn = await testRun.pick('GET /api/catalogues/provinces', /Bắc Ninh/i, { countryCode: 'VN' });
      const simIn = { transportModeCode: s.refs.road.code, cargoLoadTypeCode: s.refs.full.code, origin: { kind: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, detail: 'KCN Quế Võ' }, destination: { kind: 'ADDRESS', countryCode: 'VN', provinceCode: (p.destination as any).provinceCode, detail: 'KCN Bắc Thăng Long' }, serviceTypeCodes: [s.refs.services.VT] };

      const b = await s.available({ executionScope: 'DOMESTIC', originPointTypeCode: s.refs.inlandVn.code, destinationPointTypeCode: s.refs.inlandVn.code });
      const { rule } = await s.create(b);
      const r1 = await s.simulate(simIn);
      expectStatusIn(r1, '200/201/204', 'trước khi vô hiệu');
      const d1 = await data(r1);
      expect(d1.outcome, 'Tiền điều kiện: chỉ quy tắc riêng khớp tuyến').toBe('MATCHED');
      expect(d1.rule.code).toBe(rule.code);
      await must(await s.status(rule.code, 'INACTIVE'), 'vô hiệu quy tắc');
      const r2 = await s.simulate(simIn);
      expectStatusIn(r2, '200/404', 'sau khi vô hiệu');
      if (r2.status() === 200) expect((await data(r2)).outcome, 'Mô phỏng báo không có quy tắc phù hợp').not.toBe('MATCHED');
    });

  });

  test("LEG-054 Vô hiệu là soft-disable", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, tok }) => {

    await withLegSandbox(testRun, async (s) => {
      const p = await testRun.p0Refs();
      const bn = await testRun.pick('GET /api/catalogues/provinces', /Bắc Ninh/i, { countryCode: 'VN' });
      const simIn = { transportModeCode: s.refs.road.code, cargoLoadTypeCode: s.refs.full.code, origin: { kind: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, detail: 'KCN Quế Võ' }, destination: { kind: 'ADDRESS', countryCode: 'VN', provinceCode: (p.destination as any).provinceCode, detail: 'KCN Bắc Thăng Long' }, serviceTypeCodes: [s.refs.services.VT] };

      const NAME = 'AT Quy tắc chặng Nội địa VN có phiếu dùng';
      let used = items(await s.list({ search: NAME })).find((d: any) => d.name === NAME);
      if (!used) {
        const b = await s.available({ name: NAME, executionScope: 'DOMESTIC', originPointTypeCode: s.refs.inlandVn.code, destinationPointTypeCode: s.refs.inlandVn.code, legs: [{ legTypeCode: s.refs.toInland.code, serviceTypeCodes: [s.refs.services.VT] }] });
        await must(await http.call('POST /api/leg-rules', { token: tok('admin'), json: b }), 'tạo quy tắc riêng cho tuyến nội địa');
        used = items(await s.list({ search: NAME })).find((d: any) => d.name === NAME);
      }
      const rule = await s.get(used.code);
      if (rule.status !== 'ACTIVE') await must(await s.status(rule.code, 'ACTIVE'), 'kích hoạt lại quy tắc riêng');
      const base = await p0Base(testRun);
      const places = { ORIGIN: { pointType: 'ADDRESS', countryCode: 'VN', provinceCode: bn.code, placeName: 'KCN Quế Võ, Bắc Ninh' }, DESTINATION: { ...p.destination } };
      const vt = { ...serviceEntry(p, 'VT'), routes: [{ pickup: places.ORIGIN, delivery: places.DESTINATION }] };
      const order = await createOrder(testRun, base, { submit: true, body: await orderBody(testRun, base, { places, services: [vt] }, ['VT']) });
      await acceptOrder(testRun, order.id);
      const preview = await confirmLegs(testRun, order.id);
      if (preview.ruleCode !== rule.code) throw new Error(`Chuẩn bị dữ liệu thất bại: phiếu nội địa khớp ${preview.ruleCode}, không phải quy tắc riêng ${rule.code}`);
      const legs0 = stable((await k3Order(testRun, order.id)).legs);

      const keep = ({ status: _s, ...rest }: any) => stable(rest);
      const before = keep(await s.get(rule.code));
      try {
        const res = await s.status(rule.code, 'INACTIVE');
        expectStatusIn(res, '200/204');
        const now = await s.get(rule.code);
        expect(now.status).toBe('INACTIVE');
        expect(keep(now), 'Dữ liệu quy tắc còn nguyên').toEqual(before);
        expect(stable((await k3Order(testRun, order.id)).legs), 'Chặng của phiếu đã xác nhận không đổi').toEqual(legs0);
      } finally {
        await s.status(rule.code, 'ACTIVE');
      }
    });

  });

  test("LEG-060 Mô phỏng cấu trúc chặng cho tuyến Hữu Nghị → Hà Nội", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const input = await s.simulationInput(); const before = stable(await s.list());
      const res = await s.simulate(input); expectStatusIn(res, '200/204'); const d = await data(res);
      expect(d.outcome).toBe('MATCHED'); expect(d.executionScope).toBe('DOMESTIC'); expect(d.rule.code).toMatch(/^RUL-/);
      const rule = await s.get(d.rule.code); expect(rule.status).toBe('ACTIVE'); expect(rule.executionScope).toBe('DOMESTIC');
      expect(d.legs).toHaveLength(2); expect(d.legs.map((l: any) => l.position)).toEqual([1,2]);
      expect(d.legs[0].services.map((x: any) => x.code).sort()).toEqual(['KHQ','HQGS','ST','KB'].map(k => s.refs.services[k]).sort());
      expect(d.legs[1].services.map((x: any) => x.code)).toEqual([s.refs.services.VT]);
      expect(stable(await s.list())).toEqual(before);
    });
  });

  test("LEG-061 Bỏ tick dịch vụ chỉ lọc hiển thị", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const input = await s.simulationInput();
      const full = await must(await s.simulate(input), 'mô phỏng đủ dịch vụ'); expect(full.outcome).toBe('MATCHED');
      const res = await s.simulate({ ...input, serviceTypeCodes: [s.refs.services.VT] }); expectStatusIn(res, '200/204'); const d = await data(res);
      expect(d.outcome).toBe('MATCHED'); expect(d.rule.code).toBe(full.rule.code); expect(d.legs).toHaveLength(2);
      expect(d.legs[0].services).toEqual([]); expect(d.legs[0].empty).toBe(true); expect(d.legs[1].services.map((x: any) => x.code)).toEqual([s.refs.services.VT]);
    });
  });

  test("LEG-062 Không có quy tắc khớp", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ testRun }) => {

    await withLegSandbox(testRun, async (s) => {
      const cn = (await testRun.catalog('GET /api/catalogues/provinces', { countryCode: 'CN' }))[0];
      if (!cn) throw new Error('Chuẩn bị dữ liệu thất bại: danh mục chưa có tỉnh Trung Quốc');
      const res = await s.simulate({ transportModeCode: s.refs.road.code, cargoLoadTypeCode: s.refs.full.code, origin: { kind: 'ADDRESS', countryCode: 'CN', provinceCode: cn.code }, destination: { kind: 'ADDRESS', countryCode: 'CN', provinceCode: cn.code }, serviceTypeCodes: [s.refs.services.VT] });
      expectStatusIn(res, '200/404');
      expect(res.status(), 'Không 5xx').toBeLessThan(500);
      if (res.status() === 200) expect((await data(res)).outcome, 'Báo không có cấu trúc chặng phù hợp').toBe('NO_RULE');
    });

  });

  test("LEG-063 Mô phỏng không tạo bản ghi", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const input = await s.simulationInput(); const before = stable(await s.list());
      const first = await must(await s.simulate(input), 'mô phỏng lần 1'); expect(first.outcome).toBe('MATCHED');
      const h0 = stable(await s.history(first.rule.code));
      for (let i=0;i<2;i++) { const res = await s.simulate(input); expectStatusIn(res, '200/204'); expect(stable(await data(res))).toEqual(stable(first)); }
      expect(stable(await s.list())).toEqual(before); expect(stable(await s.history(first.rule.code))).toEqual(h0);
    });
  });

  test("LEG-025 Chi tiết quy tắc chặng", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const b = await s.available(); b.legs[1].serviceTypeCodes = [];
      const { rule } = await s.create(b);
      expect(rule.legs).toHaveLength(2);
      expect(rule.legs.map((l: any) => l.position)).toEqual([1, 2]);
      expect(rule.legs.map((l: any) => l.name)).toEqual([s.refs.atGate.name, s.refs.toInland.name]);
      expect(rule.legs[0].services.map((r: any) => r.code).sort()).toEqual(b.legs[0].serviceTypeCodes.slice().sort());
      expect(rule.legs[1].services).toEqual([]); expect(rule.legs[1].empty).toBe(true);
      expect(rule).toMatchObject({ name: b.name, executionScope: b.executionScope, status: 'ACTIVE', description: b.description });
    });
  });

  test("LEG-045 Lịch sử hoạt động của quy tắc", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available()); const b = s.fromDetail(rule); b.description = tagged('AT Nội dung lịch sử');
      expectStatusIn(await s.update(rule.code, b), '200/204'); expectStatusIn(await s.status(rule.code, 'INACTIVE'), '200/204');
      const h = items(await s.history(rule.code)); expect(h.length).toBeGreaterThanOrEqual(3);
      const text = (x: any) => `${x.action ?? ''} ${x.event ?? ''} ${x.eventLabel ?? ''}`;
      expect(h.some(x => /create|thêm mới|tạo mới/i.test(text(x)))).toBe(true);
      expect(h.some(x => /update|edit|chỉnh sửa/i.test(text(x)))).toBe(true);
      expect(h.some(x => /deactiv|disable|vô hiệu/i.test(text(x)))).toBe(true);
      for (let i=0;i<h.length;i++) { expect(h[i].actorUserId).toBeTruthy(); expect(h[i].actorName).toBeTruthy(); expect(Number.isFinite(Date.parse(h[i].at))).toBe(true); if(i) expect(Date.parse(h[i-1].at)).toBeGreaterThanOrEqual(Date.parse(h[i].at)); }
      const edit = h.find(x => /update|edit|chỉnh sửa/i.test(text(x))); expect(edit.oldValue).not.toBeNull(); expect(edit.newValue).not.toBeNull(); expect(JSON.stringify(edit.newValue)).toContain(b.description);
    });
  });
});
