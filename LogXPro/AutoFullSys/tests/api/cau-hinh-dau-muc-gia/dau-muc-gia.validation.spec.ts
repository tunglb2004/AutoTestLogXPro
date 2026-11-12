/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, ServiceKey, SERVICE_KEYS } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { configOf, createItem } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { buildP0, p0Order, createOrder, rejectOrder, revenueOf } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { createSheet, priceLine, sheetBody, sheetItems } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { sbpLines } from '../../../src/gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { sspLines } from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { getCustomerQuotation, lineByName } from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import { pnl } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as F_cau_hinh_dau_muc_gia_dau_muc_gia from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình đầu mục giá", () => {
  test("CFG-016 Thiếu tham số bắt buộc `query`", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["query"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("CFG-017 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/price-configurations/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(list.length, "perPage=1 trả đúng 1 phần tử").toBe(1);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("CFG-027 Thiếu trường bắt buộc `name`", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API]();
    delete payload["name"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-028 `priceTypeId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const marker = tagged("AT Không lưu");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API](), "priceTypeId": value };
      payload["name"] = marker;
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-029 `name` dài 49, 50 và 51 ký tự", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b';
    const cfgOf = (k: ServiceKey, role: Who = 'k1') => configOf(testRun, k, role);
    const st = (i: any) => i?.status?.code ?? i?.status;
    const toBody = (i: any) => ({ id: i.id, name: i.name, priceTypeId: i.priceTypeId, sortOrder: i.sortOrder ?? 0, status: st(i) ?? 'ACTIVE', warehouseTypeIds: (i.warehouseTypes ?? []).map((w: any) => w.id) });
    const PUTALL = (id: string, list: unknown[], role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json: { items: list } });
    const POST = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json });
    const PUT1 = (id: string, itemId: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId }, json });
    const DEL = (id: string, itemId: string, role: Who = 'k1') => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/price-configurations/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/price-configurations/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const nm = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`.slice(0, 50);
    const itemOf = async (k: ServiceKey, itemId: string) => (await cfgOf(k)).items.find((i: any) => i.id === itemId);
    /** Đầu mục mới chưa dùng (dọn khi bật ALLOW_CLEANUP). */
    const fresh = async (k: ServiceKey, tag: string, type: 'FIXED' | 'SURCHARGE' | 'VARIANCE' = 'FIXED', o: Record<string, unknown> = {}, role: Who = 'k1') => {
      const it = await createItem(testRun, k, nm(tag), type, role, o);
      testRun.track(`đầu mục ${it.name}`, () => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok('k1'), params: { id: it.configId, itemId: it.id } }));
      return it;
    };
    /** Body PUT 1 đầu mục giữ nguyên các trường, ghi đè theo `o`. */
    const one = async (k: ServiceKey, itemId: string, o: Record<string, unknown> = {}) => { const { id: _id, ...b } = toBody(await itemOf(k, itemId)); return { ...b, ...o }; };
    /** Đầu mục KHQ đã có dòng giá mua (locked = true). */
    const lockedItem = async (tag: string) => {
      const it = await fresh('KHQ', tag);
      await createSheet(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [priceLine(refs, { customsFee: it } as any, 'customsFee', 1_000_000)], `AT Bảng giá khóa ${tag} ${TEST_RUN_ID}`);
      if (!(await itemOf('KHQ', it.id))?.locked) throw new Error('Chuẩn bị dữ liệu thất bại: đầu mục đã có dòng giá mua nhưng chưa ở trạng thái locked');
      return it;
    };
    /** Lưu toàn bộ phân hệ của đầu mục `x` với trạng thái mới cho `x`. */
    const saveStatus = async (k: ServiceKey, xId: string, status: 'ACTIVE' | 'INACTIVE', role: Who = 'k1') => {
      const cfg = await cfgOf(k, role);
      return PUTALL(cfg.id, cfg.items.map(toBody).map((b: any) => (b.id === xId ? { ...b, status } : b)), role);
    };

    const khq = await cfgOf('KHQ');
    const seed = 'Phí lưu kho hàng hóa tại cửa khẩu Hữu Nghị ';
    for (const [n, set] of [[49, '200/201'], [50, '200/201'], [51, '400/422']] as [number, string][]) {
      const name = textOfLength(n, seed);
      const res = await POST(khq.id, { name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1 });
      expectStatusIn(res, set, `${n} ký tự`);
      if (n <= 50) {
        const id = (await data(res)).id;
        testRun.track(`đầu mục ${n} ký tự`, () => DEL(khq.id, id));
        expect((await itemOf('KHQ', id))?.name, `${n} ký tự đọc lại nguyên văn`).toBe(name);
      } else {
        expectOnlyFieldError(await expectApiError(res), 'name');
        expect((await cfgOf('KHQ')).items.some((i: any) => i.name === name), 'Không lưu 51 ký tự').toBe(false);
      }
    }

  });

  test("CFG-030 `sortOrder` tại cận dưới 0 và dưới cận", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b';
    const cfgOf = (k: ServiceKey, role: Who = 'k1') => configOf(testRun, k, role);
    const st = (i: any) => i?.status?.code ?? i?.status;
    const toBody = (i: any) => ({ id: i.id, name: i.name, priceTypeId: i.priceTypeId, sortOrder: i.sortOrder ?? 0, status: st(i) ?? 'ACTIVE', warehouseTypeIds: (i.warehouseTypes ?? []).map((w: any) => w.id) });
    const PUTALL = (id: string, list: unknown[], role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json: { items: list } });
    const POST = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json });
    const PUT1 = (id: string, itemId: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId }, json });
    const DEL = (id: string, itemId: string, role: Who = 'k1') => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/price-configurations/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/price-configurations/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const nm = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`.slice(0, 50);
    const itemOf = async (k: ServiceKey, itemId: string) => (await cfgOf(k)).items.find((i: any) => i.id === itemId);
    /** Đầu mục mới chưa dùng (dọn khi bật ALLOW_CLEANUP). */
    const fresh = async (k: ServiceKey, tag: string, type: 'FIXED' | 'SURCHARGE' | 'VARIANCE' = 'FIXED', o: Record<string, unknown> = {}, role: Who = 'k1') => {
      const it = await createItem(testRun, k, nm(tag), type, role, o);
      testRun.track(`đầu mục ${it.name}`, () => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok('k1'), params: { id: it.configId, itemId: it.id } }));
      return it;
    };
    /** Body PUT 1 đầu mục giữ nguyên các trường, ghi đè theo `o`. */
    const one = async (k: ServiceKey, itemId: string, o: Record<string, unknown> = {}) => { const { id: _id, ...b } = toBody(await itemOf(k, itemId)); return { ...b, ...o }; };
    /** Đầu mục KHQ đã có dòng giá mua (locked = true). */
    const lockedItem = async (tag: string) => {
      const it = await fresh('KHQ', tag);
      await createSheet(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [priceLine(refs, { customsFee: it } as any, 'customsFee', 1_000_000)], `AT Bảng giá khóa ${tag} ${TEST_RUN_ID}`);
      if (!(await itemOf('KHQ', it.id))?.locked) throw new Error('Chuẩn bị dữ liệu thất bại: đầu mục đã có dòng giá mua nhưng chưa ở trạng thái locked');
      return it;
    };
    /** Lưu toàn bộ phân hệ của đầu mục `x` với trạng thái mới cho `x`. */
    const saveStatus = async (k: ServiceKey, xId: string, status: 'ACTIVE' | 'INACTIVE', role: Who = 'k1') => {
      const cfg = await cfgOf(k, role);
      return PUTALL(cfg.id, cfg.items.map(toBody).map((b: any) => (b.id === xId ? { ...b, status } : b)), role);
    };

    const khq = await cfgOf('KHQ');
    const n0 = nm('Phí thứ tự 0 C30');
    const r0 = await POST(khq.id, { name: n0, priceTypeId: refs.priceTypes.FIXED, sortOrder: 0 });
    expectStatusIn(r0, '200/201', 'sortOrder = 0');
    const id0 = (await data(r0)).id;
    testRun.track(`đầu mục ${n0}`, () => DEL(khq.id, id0));
    const n1 = nm('Phí thứ tự âm C30');
    const r1 = await POST(khq.id, { name: n1, priceTypeId: refs.priceTypes.FIXED, sortOrder: -1 });
    expectStatusIn(r1, '400/422', 'sortOrder = -1');
    expect((await cfgOf('KHQ')).items.some((i: any) => i.name === n1), 'Không tạo').toBe(false);

  });

  test("CFG-043 Thiếu trường bắt buộc `items`", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API]();
    delete payload["items"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "items");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-044 `items[].sortOrder` tại 0 và âm", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b';
    const cfgOf = (k: ServiceKey, role: Who = 'k1') => configOf(testRun, k, role);
    const st = (i: any) => i?.status?.code ?? i?.status;
    const toBody = (i: any) => ({ id: i.id, name: i.name, priceTypeId: i.priceTypeId, sortOrder: i.sortOrder ?? 0, status: st(i) ?? 'ACTIVE', warehouseTypeIds: (i.warehouseTypes ?? []).map((w: any) => w.id) });
    const PUTALL = (id: string, list: unknown[], role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json: { items: list } });
    const POST = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json });
    const PUT1 = (id: string, itemId: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId }, json });
    const DEL = (id: string, itemId: string, role: Who = 'k1') => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/price-configurations/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/price-configurations/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const nm = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`.slice(0, 50);
    const itemOf = async (k: ServiceKey, itemId: string) => (await cfgOf(k)).items.find((i: any) => i.id === itemId);
    /** Đầu mục mới chưa dùng (dọn khi bật ALLOW_CLEANUP). */
    const fresh = async (k: ServiceKey, tag: string, type: 'FIXED' | 'SURCHARGE' | 'VARIANCE' = 'FIXED', o: Record<string, unknown> = {}, role: Who = 'k1') => {
      const it = await createItem(testRun, k, nm(tag), type, role, o);
      testRun.track(`đầu mục ${it.name}`, () => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok('k1'), params: { id: it.configId, itemId: it.id } }));
      return it;
    };
    /** Body PUT 1 đầu mục giữ nguyên các trường, ghi đè theo `o`. */
    const one = async (k: ServiceKey, itemId: string, o: Record<string, unknown> = {}) => { const { id: _id, ...b } = toBody(await itemOf(k, itemId)); return { ...b, ...o }; };
    /** Đầu mục KHQ đã có dòng giá mua (locked = true). */
    const lockedItem = async (tag: string) => {
      const it = await fresh('KHQ', tag);
      await createSheet(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [priceLine(refs, { customsFee: it } as any, 'customsFee', 1_000_000)], `AT Bảng giá khóa ${tag} ${TEST_RUN_ID}`);
      if (!(await itemOf('KHQ', it.id))?.locked) throw new Error('Chuẩn bị dữ liệu thất bại: đầu mục đã có dòng giá mua nhưng chưa ở trạng thái locked');
      return it;
    };
    /** Lưu toàn bộ phân hệ của đầu mục `x` với trạng thái mới cho `x`. */
    const saveStatus = async (k: ServiceKey, xId: string, status: 'ACTIVE' | 'INACTIVE', role: Who = 'k1') => {
      const cfg = await cfgOf(k, role);
      return PUTALL(cfg.id, cfg.items.map(toBody).map((b: any) => (b.id === xId ? { ...b, status } : b)), role);
    };

    const y = await fresh('HQGS', 'Thứ tự lô');
    const cfg = await cfgOf('HQGS');
    expectStatusIn(await PUTALL(cfg.id, cfg.items.map(toBody).map((x: any) => (x.id === y.id ? { ...x, sortOrder: 0 } : x))), '200/204', 'sortOrder = 0');
    const mid = await cfgOf('HQGS');
    const before = stable(mid.items);
    const neg = mid.items.map(toBody).map((x: any) => (x.id === y.id ? { ...x, sortOrder: -1, name: nm('Thứ tự lô đổi') } : x));
    expectStatusIn(await PUTALL(mid.id, neg), '400/422', 'sortOrder = -1');
    expect(stable((await cfgOf('HQGS')).items), 'Không lưu phần tử nào của lô').toEqual(before);

  });

  test("CFG-052 Thiếu trường bắt buộc `name`", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/price-configurations/{id}/items/{itemId}";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API]();
    delete payload["name"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-053 `priceTypeId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/price-configurations/{id}/items/{itemId}";
    const p = await testRun.prepare(API, "k1");
    const marker = tagged("AT Không lưu");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API](), "priceTypeId": value };
      payload["name"] = marker;
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-054 `name` dài 49, 50 và 51 ký tự", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b';
    const cfgOf = (k: ServiceKey, role: Who = 'k1') => configOf(testRun, k, role);
    const st = (i: any) => i?.status?.code ?? i?.status;
    const toBody = (i: any) => ({ id: i.id, name: i.name, priceTypeId: i.priceTypeId, sortOrder: i.sortOrder ?? 0, status: st(i) ?? 'ACTIVE', warehouseTypeIds: (i.warehouseTypes ?? []).map((w: any) => w.id) });
    const PUTALL = (id: string, list: unknown[], role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json: { items: list } });
    const POST = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json });
    const PUT1 = (id: string, itemId: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId }, json });
    const DEL = (id: string, itemId: string, role: Who = 'k1') => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/price-configurations/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/price-configurations/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const nm = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`.slice(0, 50);
    const itemOf = async (k: ServiceKey, itemId: string) => (await cfgOf(k)).items.find((i: any) => i.id === itemId);
    /** Đầu mục mới chưa dùng (dọn khi bật ALLOW_CLEANUP). */
    const fresh = async (k: ServiceKey, tag: string, type: 'FIXED' | 'SURCHARGE' | 'VARIANCE' = 'FIXED', o: Record<string, unknown> = {}, role: Who = 'k1') => {
      const it = await createItem(testRun, k, nm(tag), type, role, o);
      testRun.track(`đầu mục ${it.name}`, () => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok('k1'), params: { id: it.configId, itemId: it.id } }));
      return it;
    };
    /** Body PUT 1 đầu mục giữ nguyên các trường, ghi đè theo `o`. */
    const one = async (k: ServiceKey, itemId: string, o: Record<string, unknown> = {}) => { const { id: _id, ...b } = toBody(await itemOf(k, itemId)); return { ...b, ...o }; };
    /** Đầu mục KHQ đã có dòng giá mua (locked = true). */
    const lockedItem = async (tag: string) => {
      const it = await fresh('KHQ', tag);
      await createSheet(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [priceLine(refs, { customsFee: it } as any, 'customsFee', 1_000_000)], `AT Bảng giá khóa ${tag} ${TEST_RUN_ID}`);
      if (!(await itemOf('KHQ', it.id))?.locked) throw new Error('Chuẩn bị dữ liệu thất bại: đầu mục đã có dòng giá mua nhưng chưa ở trạng thái locked');
      return it;
    };
    /** Lưu toàn bộ phân hệ của đầu mục `x` với trạng thái mới cho `x`. */
    const saveStatus = async (k: ServiceKey, xId: string, status: 'ACTIVE' | 'INACTIVE', role: Who = 'k1') => {
      const cfg = await cfgOf(k, role);
      return PUTALL(cfg.id, cfg.items.map(toBody).map((b: any) => (b.id === xId ? { ...b, status } : b)), role);
    };

    const y = await fresh('HQGS', 'Độ dài C54');
    const seed = 'Phí nâng hạ container tại bãi Đồng Đăng ';
    let last = y.name;
    for (const [n, set] of [[49, '200/204'], [50, '200/204'], [51, '400/422']] as [number, string][]) {
      const name = textOfLength(n, seed);
      const res = await PUT1(y.configId, y.id, await one('HQGS', y.id, { name }));
      expectStatusIn(res, set, `${n} ký tự`);
      if (n <= 50) last = name;
      else expectOnlyFieldError(await expectApiError(res), 'name');
      expect((await itemOf('HQGS', y.id))?.name, n <= 50 ? `${n} ký tự đọc lại nguyên văn` : 'Giữ tên trước').toBe(last);
    }

  });

  test("CFG-055 `sortOrder` tại cận dưới 0 và dưới cận", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b';
    const cfgOf = (k: ServiceKey, role: Who = 'k1') => configOf(testRun, k, role);
    const st = (i: any) => i?.status?.code ?? i?.status;
    const toBody = (i: any) => ({ id: i.id, name: i.name, priceTypeId: i.priceTypeId, sortOrder: i.sortOrder ?? 0, status: st(i) ?? 'ACTIVE', warehouseTypeIds: (i.warehouseTypes ?? []).map((w: any) => w.id) });
    const PUTALL = (id: string, list: unknown[], role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json: { items: list } });
    const POST = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/price-configurations/{id}/items', { token: tok(role), params: { id }, json });
    const PUT1 = (id: string, itemId: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId }, json });
    const DEL = (id: string, itemId: string, role: Who = 'k1') => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok(role), params: { id, itemId } });
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/price-configurations/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/price-configurations/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const nm = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`.slice(0, 50);
    const itemOf = async (k: ServiceKey, itemId: string) => (await cfgOf(k)).items.find((i: any) => i.id === itemId);
    /** Đầu mục mới chưa dùng (dọn khi bật ALLOW_CLEANUP). */
    const fresh = async (k: ServiceKey, tag: string, type: 'FIXED' | 'SURCHARGE' | 'VARIANCE' = 'FIXED', o: Record<string, unknown> = {}, role: Who = 'k1') => {
      const it = await createItem(testRun, k, nm(tag), type, role, o);
      testRun.track(`đầu mục ${it.name}`, () => http.call('DELETE /api/price-configurations/{id}/items/{itemId}', { token: tok('k1'), params: { id: it.configId, itemId: it.id } }));
      return it;
    };
    /** Body PUT 1 đầu mục giữ nguyên các trường, ghi đè theo `o`. */
    const one = async (k: ServiceKey, itemId: string, o: Record<string, unknown> = {}) => { const { id: _id, ...b } = toBody(await itemOf(k, itemId)); return { ...b, ...o }; };
    /** Đầu mục KHQ đã có dòng giá mua (locked = true). */
    const lockedItem = async (tag: string) => {
      const it = await fresh('KHQ', tag);
      await createSheet(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [priceLine(refs, { customsFee: it } as any, 'customsFee', 1_000_000)], `AT Bảng giá khóa ${tag} ${TEST_RUN_ID}`);
      if (!(await itemOf('KHQ', it.id))?.locked) throw new Error('Chuẩn bị dữ liệu thất bại: đầu mục đã có dòng giá mua nhưng chưa ở trạng thái locked');
      return it;
    };
    /** Lưu toàn bộ phân hệ của đầu mục `x` với trạng thái mới cho `x`. */
    const saveStatus = async (k: ServiceKey, xId: string, status: 'ACTIVE' | 'INACTIVE', role: Who = 'k1') => {
      const cfg = await cfgOf(k, role);
      return PUTALL(cfg.id, cfg.items.map(toBody).map((b: any) => (b.id === xId ? { ...b, status } : b)), role);
    };

    const y = await fresh('KHQ', 'Thứ tự C55');
    expectStatusIn(await PUT1(y.configId, y.id, await one('KHQ', y.id, { sortOrder: 0 })), '200/204', 'sortOrder = 0');
    const before = stable(await itemOf('KHQ', y.id));
    expectStatusIn(await PUT1(y.configId, y.id, await one('KHQ', y.id, { sortOrder: -1 })), '400/422', 'sortOrder = -1');
    expect(stable(await itemOf('KHQ', y.id)), 'Dữ liệu không đổi').toEqual(before);

  });

  test("CFG-073 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/versions";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-074 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/price-configurations/{id}/versions";
    const p = await testRun.prepare(API, "k1");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(list.length, "perPage=1 trả đúng 1 phần tử").toBe(1);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("CFG-086 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/versions/{versionId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-087 `name` bỏ hẳn khỏi body", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API]();
    delete payload["name"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-088 `name` = null", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API]();
    payload["name"] = null;
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-089 `name` = chuỗi rỗng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API]();
    payload["name"] = "";
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-090 `name` toàn dấu cách", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API]();
    payload["name"] = "   ";
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-091 `name` sai kiểu", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun }) => {
    const API = "POST /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies[API]();
    payload["name"] = 12345;
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-005 Gọi sai phương thức HTTP", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-009 Gọi sai phương thức HTTP", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/stats";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-011 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-013 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-019 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-032 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies["POST /api/price-configurations/{id}/items"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-046 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/price-configurations/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies["PUT /api/price-configurations/{id}/items"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-057 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/price-configurations/{id}/items/{itemId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_cau_hinh_dau_muc_gia_dau_muc_gia.bodies["PUT /api/price-configurations/{id}/items/{itemId}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-063 Tham số đường dẫn `itemId` sai định dạng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/price-configurations/{id}/items/{itemId}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "itemId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-065 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/price-configurations/{id}/items/{itemId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-069 Tham số đường dẫn `itemId` sai định dạng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "itemId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-071 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-076 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/versions";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-079 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/versions/current";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("CFG-081 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/versions/current";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("CFG-084 Tham số đường dẫn `versionId` sai định dạng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/versions/{versionId}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "versionId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });
});
