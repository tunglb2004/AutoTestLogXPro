import { runSystemDeactivationHistory } from '../../../src/quan-ly-bao-gia/data/remaining-quote-api.scenario';
import { runPendingLockApi } from '../../../src/gia-mua-dau-vao/data/pending-api-cases';
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

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình đầu mục giá", () => {
  test("CFG-006 3 chỉ số tổng quan", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const res = await http.call('GET /api/price-configurations/stats', { token: tok('k1') });
    expectStatusIn(res, '200');
    const s = await data(res);
    const all = (await Promise.all(SERVICE_KEYS.map((k) => cfgOf(k)))).flatMap((c: any) => c.items ?? []);
    expect(Number(s.configurationCount), 'Tổng phân hệ').toBe(5);
    expect(Number(s.itemCount), 'Tổng đầu mục = Σ 5 phân hệ').toBe(all.length);
    expect(Number(s.activeItemCount), 'Số đang kích hoạt').toBe(all.filter((i: any) => st(i) === 'ACTIVE').length);

  });

  test("CFG-007 Chỉ số đổi sau khi tắt 1 đầu mục", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await fresh('HQGS', 'Chỉ số');
    const STATS = async () => data(await http.call('GET /api/price-configurations/stats', { token: tok('k1') }));
    const before = await STATS();
    await must(await PUT1(it.configId, it.id, await one('HQGS', it.id, { status: 'INACTIVE' })), 'tắt đầu mục chưa dùng');
    const res = await http.call('GET /api/price-configurations/stats', { token: tok('k1') });
    expectStatusIn(res, '200');
    const after = await data(res);
    expect(Number(after.activeItemCount), 'Số đang kích hoạt giảm 1').toBe(Number(before.activeItemCount) - 1);
    expect(Number(after.itemCount), 'Tổng không đổi').toBe(Number(before.itemCount));

  });

  test("CFG-014 Lịch sử thao tác cấu hình", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await fresh('HQGS', 'Lịch sử');
    const res = await http.call('GET /api/price-configurations/{id}/history', { token: tok('k1'), params: { id: it.configId }, query: { search: 'AT', page: 1 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.length).toBeGreaterThan(0);
    const at = list.map((h: any) => Date.parse(h.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((a, b) => b - a));
    for (const k of ['at', 'actorName', 'action', 'oldValue', 'newValue']) expect(list[0], `Có ${k}`).toHaveProperty(k);
    expect(list.some((h: any) => h.targetId === it.id || String(h.summary ?? '').includes(it.name)), 'Có bản ghi thao tác vừa lưu').toBe(true);

  });

  test("CFG-015 Tắt kích hoạt do hệ thống ghi \"Hệ thống\"", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ testRun }) => {
    await expect(runSystemDeactivationHistory(testRun), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("CFG-020 Lọc lịch sử theo thời gian, người thực hiện và phân trang", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    await fresh('HQGS', 'LS K1 một');
    await fresh('HQGS', 'LS K1 hai');
    const other = await fresh('HQGS', 'LS K1B', 'FIXED', {}, 'k1b');
    const me = await data(await http.call('GET /api/auth/me', { token: tok('k1') }));
    const myId = me?.id ?? me?.userId;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const from = start.toISOString();
    const to = new Date(Date.now() + 60_000).toISOString();
    const res = await http.call('GET /api/price-configurations/{id}/history', { token: tok('k1'), params: { id: other.configId }, query: { from, to, actorUserId: myId, page: 1, perPage: 2 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.length, 'Tối đa 2 bản ghi').toBeLessThanOrEqual(2);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((h: any) => h.actorUserId === myId), 'Chỉ bản ghi của người đó').toBe(true);
    expect(list.every((h: any) => Date.parse(h.at) >= Date.parse(from) && Date.parse(h.at) <= Date.parse(to)), 'Trong khoảng thời gian').toBe(true);
    const at = list.map((h: any) => Date.parse(h.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((a, b) => b - a));

  });

  test("CFG-021 Thêm đầu mục Cố định cho Khai báo HQ", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const cfg = await cfgOf('KHQ');
    const maxBefore = Math.max(0, ...cfg.items.map((i: any) => Number(String(i.code).replace(/\D/g, '')) || 0));
    const name = nm('Phí khai báo C21');
    const res = await POST(cfg.id, { name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1 });
    expectStatusIn(res, '200/201');
    const d = await data(res);
    testRun.track(`đầu mục ${name}`, () => DEL(cfg.id, d.id));
    expect(String(d.code), 'Mã CD-NNN').toMatch(/^CD-\d{3,}$/);
    expect(st(d), 'Bật kích hoạt').toBe('ACTIVE');
    expect(Number(String(d.code).replace(/\D/g, '')), 'Không tái dùng mã cũ').toBeGreaterThan(maxBefore);
    expect((await HIST(cfg.id)).some((h: any) => h.targetId === d.id), 'Ghi lịch sử').toBe(true);

  });

  test("CFG-022 Trùng tên trong phân hệ", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await fresh('KHQ', 'Phí khai báo C22');
    const res = await POST(it.configId, { name: it.name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1 });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect((await cfgOf('KHQ')).items.filter((i: any) => i.name === it.name), 'Không tạo trùng').toHaveLength(1);

  });

  test("CFG-023 Cùng tên ở phân hệ khác được phép", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await fresh('KHQ', 'Tên dùng chung C23');
    const hqgs = await cfgOf('HQGS');
    const res = await POST(hqgs.id, { name: x.name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1 });
    expectStatusIn(res, '200/201');
    const d = await data(res);
    testRun.track(`đầu mục ${x.name} (HQGS)`, () => DEL(hqgs.id, d.id));
    expect(String(d.code), 'Mã CS-NNN').toMatch(/^CS-\d{3,}$/);

  });

  test("CFG-024 Kho bãi bắt buộc Loại kho", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const kb = await cfgOf('KB');
    const name = nm('Phí lưu kho C24');
    const res = await POST(kb.id, { name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1 });
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expect((await cfgOf('KB')).items.some((i: any) => i.name === name), 'Không tạo').toBe(false);

  });

  test("CFG-025 Thêm với `status` = `INACTIVE`", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const hqgs = await cfgOf('HQGS');
    const name = nm('Phí kiểm hóa C25');
    const res = await POST(hqgs.id, { name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1, status: 'INACTIVE' });
    expectStatusIn(res, '200/201');
    const d = await data(res);
    testRun.track(`đầu mục ${name}`, () => DEL(hqgs.id, d.id));
    expect(st(await itemOf('HQGS', d.id)), 'Tạo ở Tắt kích hoạt').toBe('INACTIVE');

  });

  test("CFG-026 Đầu mục Phát sinh không có dòng giá", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const name = nm('Phí lưu ca C26');
    const res = await POST(khq.id, { name, priceTypeId: refs.priceTypes.VARIANCE, sortOrder: 1 });
    expectStatusIn(res, '200/201/204');
    const it = (await cfgOf('KHQ')).items.find((i: any) => i.name === name);
    testRun.track(`đầu mục ${name}`, () => DEL(khq.id, it.id));
    const line = priceLine(refs, { shiftStorage: it } as any, 'shiftStorage', 200_000);
    const sheet = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: await sheetBody(testRun, env.ref('CONTRACTOR_A_ID'), 'VND', [line], `AT Bảng giá Phát sinh ${TEST_RUN_ID}`) });
    expectStatusIn(sheet, '400/422', 'tạo dòng giá cho đầu mục Phát sinh');

  });

  test("CFG-034 Lưu toàn bộ cấu hình, tắt kích hoạt đầu mục đã dùng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `C34${TEST_RUN_ID}`);
    const x = base.items.customsFee;
    const total0 = Number((await VERS(x.configId)).meta.pagination.total);
    const res = await saveStatus('KHQ', x.id, 'INACTIVE');
    expectStatusIn(res, '200/204');
    expect(st(await itemOf('KHQ', x.id)), 'X Tắt').toBe('INACTIVE');
    expect(Number((await VERS(x.configId)).meta.pagination.total), 'Lưu một lần sinh 1 phiên bản').toBe(total0 + 1);

  });

  test("CFG-035 Chặn tắt khi có phiếu Đang thực hiện dùng đầu mục", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `C35${TEST_RUN_ID}`);
    const x = base.items.customsFee;

    const p1 = await p0Order(testRun, 'IN_PROGRESS', { base });
    const res = await saveStatus('KHQ', x.id, 'INACTIVE');
    expectStatusIn(res, '400/409/422');
    const msg = JSON.stringify(await expectApiError(res));
    expect(msg, 'Thông báo nêu mã đầu mục và phiếu').toContain(x.code);
    expect(msg).toContain(p1.code);
    expect(st(await itemOf('KHQ', x.id)), 'X giữ ACTIVE').toBe('ACTIVE');

  });

  test("CFG-036 Chặn tắt khi phiếu Đã thực hiện dùng đầu mục (điểm 1 đã chốt)", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `C36${TEST_RUN_ID}`);
    const x = base.items.customsFee;

    await p0Order(testRun, 'PERFORMED', { base });
    const res = await saveStatus('KHQ', x.id, 'INACTIVE');
    expectStatusIn(res, '400/409/422');
    expect(st(await itemOf('KHQ', x.id)), 'Bị chặn').toBe('ACTIVE');

  });

  test("CFG-037 Phiếu Từ chối, Hoàn thành không chặn", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `C37${TEST_RUN_ID}`);
    const x = base.items.customsFee;

    const done = await p0Order(testRun, 'COMPLETED', { base });
    const rej = await createOrder(testRun, base, { submit: true });
    await rejectOrder(testRun, rej.id);
    const snap = async () => stable({ done: await revenueOf(testRun, done.id), rej: await revenueOf(testRun, rej.id), pnl: (await pnl(testRun, done.id)).kpi });
    const before = await snap();
    const res = await saveStatus('KHQ', x.id, 'INACTIVE');
    expectStatusIn(res, '200/204');
    expect(st(await itemOf('KHQ', x.id)), 'Tắt được').toBe('INACTIVE');
    expect(await snap(), 'Chi phí, doanh thu của 2 phiếu giữ nguyên').toEqual(before);

  });

  test("CFG-038 Đầu mục đã dùng không được đổi tên/loại giá/xóa", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await lockedItem('Đã dùng C38');
    const cfg = await cfgOf('KHQ');
    const before = stable(cfg.items.find((i: any) => i.id === x.id));
    const rename = await PUTALL(cfg.id, cfg.items.map(toBody).map((b: any) => (b.id === x.id ? { ...b, name: nm('Đổi tên C38') } : b)));
    expectStatusIn(rename, '400/409/422', 'đổi tên');
    await expectApiError(rename);
    const drop = await PUTALL(cfg.id, cfg.items.map(toBody).filter((b: any) => b.id !== x.id));
    expectStatusIn(drop, '400/409/422', 'bỏ X khỏi items');
    expect(stable(await itemOf('KHQ', x.id)), 'Dữ liệu không đổi').toEqual(before);

  });

  test("CFG-039 Khóa bi quan khi người khác đang sửa", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ testRun, browser, roles }) => {
    test.setTimeout(900_000);
    await expect(runPendingLockApi("CFG-039", testRun, browser, roles), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("CFG-040 Bật lại đầu mục", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `C40${TEST_RUN_ID}`);
    const x = base.items.customsFee;

    await must(await saveStatus('KHQ', x.id, 'INACTIVE'), 'tắt X');
    const res = await saveStatus('KHQ', x.id, 'ACTIVE');
    expectStatusIn(res, '200/204');
    expect(st(await itemOf('KHQ', x.id))).toBe('ACTIVE');
    expect((await sheetItems(testRun, base.sheetA)).some((l: any) => l.priceConfigurationItemId === x.id), 'Dòng giá mua của X hiện lại').toBe(true);
    expect((await sbpLines(testRun, x.id)).length, 'SBP của X hiện lại').toBeGreaterThan(0);
    expect((await sspLines(testRun, x.id)).length, 'SSP của X hiện lại').toBeGreaterThan(0);
    const cq = await getCustomerQuotation(testRun, base.rcId);
    expect(lineByName(cq, x.name), 'Dòng ở BGKH không khôi phục').toBeUndefined();

  });

  test("CFG-041 Lưu nguyên khối, lỗi 1 dòng thì không lưu dòng nào", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const a = await fresh('HQGS', 'Nguyên khối A');
    const b = await fresh('HQGS', 'Nguyên khối B');
    const c = await fresh('HQGS', 'Nguyên khối C');
    const cfg = await cfgOf('HQGS');
    const before = stable(cfg.items.filter((i: any) => [a.id, b.id, c.id].includes(i.id)));
    const v0 = Number((await VERS(cfg.id)).meta.pagination.total);
    const list = cfg.items.map(toBody).map((x: any) => (x.id === a.id ? { ...x, name: nm('Đổi A') } : x.id === b.id ? { ...x, name: nm('Đổi B') } : x.id === c.id ? { ...x, name: '' } : x));
    const res = await PUTALL(cfg.id, list);
    expectStatusIn(res, '400/422');
    const after = (await cfgOf('HQGS')).items.filter((i: any) => [a.id, b.id, c.id].includes(i.id));
    expect(stable(after), 'Cả 3 đầu mục giữ nguyên').toEqual(before);
    expect(Number((await VERS(cfg.id)).meta.pagination.total), 'Không sinh phiên bản').toBe(v0);

  });

  test("CFG-047 Sửa một đầu mục chưa dùng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const y = await fresh('KHQ', 'Phí khai báo C47');
    const name = nm('Phí khai báo sửa C47');
    const res = await PUT1(y.configId, y.id, { name, priceTypeId: refs.priceTypes.SURCHARGE, sortOrder: 2, status: 'ACTIVE', warehouseTypeIds: [] });
    expectStatusIn(res, '200/204');
    const now = await itemOf('KHQ', y.id);
    expect(now.name).toBe(name);
    expect(now.priceTypeId, 'Loại giá Phụ phí').toBe(refs.priceTypes.SURCHARGE);
    expect((await HIST(y.configId)).some((h: any) => h.targetId === y.id && /UPDATE|Sửa|Cập nhật/i.test(String(h.action ?? ''))), 'Ghi lịch sử').toBe(true);

  });

  test("CFG-048 Đổi tên đầu mục đã dùng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await lockedItem('Đã dùng C48');
    const before = stable(await itemOf('KHQ', x.id));
    const res = await PUT1(x.configId, x.id, await one('KHQ', x.id, { name: nm('Đổi tên C48') }));
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await itemOf('KHQ', x.id)), 'Không đổi').toEqual(before);

  });

  test("CFG-049 Tắt đầu mục đã dùng qua API đơn lẻ áp đủ BR5, BR13", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `C49${TEST_RUN_ID}`);
    const x = base.items.customsFee;

    await p0Order(testRun, 'IN_PROGRESS', { base });
    const res = await PUT1(x.configId, x.id, await one('KHQ', x.id, { status: 'INACTIVE' }));
    expectStatusIn(res, '400/409/422');
    expect(st(await itemOf('KHQ', x.id)), 'Bị chặn giống API lưu toàn bộ').toBe('ACTIVE');

  });

  test("CFG-058 Xóa đầu mục chưa dùng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const z = await fresh('KHQ', 'Xóa C58');
    const res = await DEL(z.configId, z.id);
    expectStatusIn(res, '200/204');
    expect(await itemOf('KHQ', z.id), 'Xóa vĩnh viễn').toBeUndefined();
    expect((await HIST(z.configId)).some((h: any) => h.targetId === z.id && /DELETE|Xóa/i.test(String(h.action ?? ''))), 'Lịch sử ghi Xóa').toBe(true);
    const n = await fresh('KHQ', 'Sau xóa C58');
    expect(n.code, 'Mã không cấp lại').not.toBe(z.code);

  });

  test("CFG-059 Vòng đời thêm → sửa → xóa đầu mục chưa dùng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const hqgs = await cfgOf('HQGS');
    const name = nm('CRUD');
    const c = await POST(hqgs.id, { name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1 });
    expectStatusIn(c, '200/201', 'thêm');
    const id = (await data(c)).id;
    const renamed = nm('CRUD sửa');
    expectStatusIn(await PUT1(hqgs.id, id, await one('HQGS', id, { name: renamed })), '200/204', 'sửa');
    expect((await itemOf('HQGS', id))?.name, 'Đọc lại đúng tên mới').toBe(renamed);
    expectStatusIn(await DEL(hqgs.id, id), '200/204', 'xóa');
    expect(await itemOf('HQGS', id), 'Sau xóa không còn').toBeUndefined();
    const acts = (await HIST(hqgs.id)).filter((h: any) => h.targetId === id).map((h: any) => String(h.action));
    expect(new Set(acts).size, `Lịch sử có Thêm, Sửa, Xóa (${acts.join(', ')})`).toBeGreaterThanOrEqual(3);

  });

  test("CFG-060 Xóa đầu mục đã dùng", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await lockedItem('Đã dùng C60');
    const res = await DEL(x.configId, x.id);
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(await itemOf('KHQ', x.id), 'Còn nguyên').toBeTruthy();

  });

  test("CFG-066 Kiểm tra trước khi tắt kích hoạt", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `C66${TEST_RUN_ID}`);
    const x = base.items.customsFee;

    const p1 = await p0Order(testRun, 'IN_PROGRESS', { base });
    const p2 = await p0Order(testRun, 'PERFORMED', { base });
    const p3 = await createOrder(testRun, base, { submit: true });
    const res = await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: x.configId, itemId: x.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(d.blockingOrderCodes, 'Có P1, P2').toEqual(expect.arrayContaining([p1.code, p2.code]));
    expect(d.blockingOrderCodes, 'Không có P3').not.toContain(p3.code);
    expect(d.inUse, 'Đầu mục đang được dùng').toBe(true);
    expect(d.blocked).toBe(true);

  });

  test("CFG-067 Không còn phiếu chặn", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `C67${TEST_RUN_ID}`);
    const x = base.items.customsFee;

    await p0Order(testRun, 'COMPLETED', { base });
    const res = await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: x.configId, itemId: x.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(d.blockingOrderCodes ?? [], 'Danh sách chặn rỗng').toHaveLength(0);
    expect(d.inUse, 'Vẫn báo đang được dùng').toBe(true);

  });

  test("CFG-077 Phân trang trang 2 kích thước 1", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const y = await fresh('HQGS', 'Phiên bản C77');
    for (const s of [3, 4]) {
      const cfg = await cfgOf('HQGS');
      await must(await PUTALL(cfg.id, cfg.items.map(toBody).map((x: any) => (x.id === y.id ? { ...x, sortOrder: s } : x))), `lưu cấu hình lần sortOrder ${s}`);
    }

    const p1 = await VERS(y.configId, { page: 1, perPage: 1 });
    const res = await http.call('GET /api/price-configurations/{id}/versions', { token: tok('k1'), params: { id: y.configId }, query: { page: 2, perPage: 1 } });
    expectStatusIn(res, '200');
    const p2 = await data(res);
    expect(items(p1)).toHaveLength(1);
    expect(items(p2)).toHaveLength(1);
    expect(items(p2)[0].id, 'Không trùng').not.toBe(items(p1)[0].id);
    expect(Number(p2.meta.pagination.total), 'Tổng số giống nhau').toBe(Number(p1.meta.pagination.total));
    expect(Number(items(p1)[0].versionNo), 'Mới nhất trước').toBeGreaterThan(Number(items(p2)[0].versionNo));

  });

  test("CFG-078 Danh sách đầu mục hiện tại dạng phiên bản", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const st0 = await cfgOf('ST');
    const res = await http.call('GET /api/price-configurations/{id}/versions/current', { token: tok('k1'), params: { id: st0.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    for (const k of ['id', 'versionNo', 'at', 'current', 'snapshot']) expect(d, `Cùng cấu trúc phiên bản: ${k}`).toHaveProperty(k);
    const snap = JSON.stringify(d.snapshot);
    for (const i of st0.items) expect(snap, `Snapshot có đầu mục ${i.code}`).toContain(i.id);

  });

  test("CFG-002 Danh sách 5 phân hệ cấu hình", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const res = await http.call('GET /api/price-configurations', { token: tok('k1') });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list, 'Đúng 5 phân hệ').toHaveLength(5);
    expect(list.map((c: any) => c.serviceCode), 'Thứ tự Vận tải, Kho bãi, Khai báo HQ, HQ giám sát, Sang tải').toEqual((['VT', 'KB', 'KHQ', 'HQGS', 'ST'] as ServiceKey[]).map((k) => refs.services[k]));
    for (const c of list) {
      const d = await data(await http.call('GET /api/price-configurations/{id}', { token: tok('k1'), params: { id: c.id } }));
      expect(Number(c.configurationCount), `Số đầu mục của ${c.serviceName}`).toBe((d.items ?? []).length);
    }

  });

  test("CFG-010 Chi tiết đầu mục của phân hệ Kho bãi", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const kb = await cfgOf('KB');
    const res = await http.call('GET /api/price-configurations/{id}', { token: tok('k1'), params: { id: kb.id } });
    expectStatusIn(res, '200');
    const list = (await data(res)).items ?? [];
    expect(list.length, 'Có đầu mục').toBeGreaterThan(0);
    for (const i of list) {
      expect(String(i.code), `Mã WR-NNN (${i.code})`).toMatch(/^WR-\d{3,}$/);
      expect(i.name).toBeTruthy();
      expect(i.priceTypeName, 'Loại giá').toBeTruthy();
      expect(st(i), 'Trạng thái').toBeTruthy();
      expect(typeof i.locked, 'Cờ locked').toBe('boolean');
      expect((i.warehouseTypes ?? []).length, `Loại kho của ${i.code}`).toBeGreaterThan(0);
    }

  });

  test("CFG-051 Đổi `sortOrder` không đổi mã", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const y = await fresh('KHQ', 'Thứ tự C51');
    const res = await PUT1(y.configId, y.id, await one('KHQ', y.id, { sortOrder: 9 }));
    expectStatusIn(res, '200/204');
    const now = await itemOf('KHQ', y.id);
    expect(now.code, 'Mã giữ nguyên').toBe(y.code);
    expect(Number(now.sortOrder), 'Thứ tự đổi').toBe(9);

  });

  test("CFG-062 Mã đã xóa không được cấp lại", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const z = await fresh('KHQ', 'Mã bị xóa C62');
    await must(await DEL(z.configId, z.id), 'xóa đầu mục');
    const khq = await cfgOf('KHQ');
    const name = nm('Mã mới C62');
    const res = await POST(khq.id, { name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1 });
    expectStatusIn(res, '200/201/204');
    const d = (await cfgOf('KHQ')).items.find((i: any) => i.name === name);
    testRun.track(`đầu mục ${name}`, () => DEL(khq.id, d.id));
    expect(d.code, `Mã mới ≠ ${z.code}`).not.toBe(z.code);

  });

  test("CFG-072 Nhật ký phiên bản cấu hình", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const y = await fresh('HQGS', 'Phiên bản C72');
    for (const s of [3, 4]) {
      const cfg = await cfgOf('HQGS');
      await must(await PUTALL(cfg.id, cfg.items.map(toBody).map((x: any) => (x.id === y.id ? { ...x, sortOrder: s } : x))), `lưu cấu hình lần sortOrder ${s}`);
    }

    const res = await http.call('GET /api/price-configurations/{id}/versions', { token: tok('k1'), params: { id: y.configId }, query: { page: 1, perPage: 10 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const no = list.map((v: any) => Number(v.versionNo));
    expect(no, 'Mới nhất trước').toEqual([...no].sort((a, b) => b - a));
    expect(list.filter((v: any) => v.current), 'Đúng 1 phiên bản hiện tại').toHaveLength(1);
    expect(list[0].current, 'Mục current là mới nhất').toBe(true);

  });

  test("CFG-082 So sánh trước/sau một phiên bản", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await fresh('HQGS', 'Tắt phiên bản C82');
    const cfg = await cfgOf('HQGS');
    const before = Object.fromEntries(cfg.items.map((i: any) => [i.id, st(i)]));
    await must(await saveStatus('HQGS', x.id, 'INACTIVE'), 'lưu cấu hình tắt X');
    const v = items(await VERS(cfg.id, { page: 1, perPage: 1 }))[0];
    const res = await http.call('GET /api/price-configurations/{id}/versions/{versionId}', { token: tok('k1'), params: { id: cfg.id, versionId: v.id } });
    expectStatusIn(res, '200');
    const s = (await data(res)).snapshot;
    const arr: any[] = Array.isArray(s) ? s : (s?.items ?? []);
    const stOf = (id: string) => { const e = arr.find((i: any) => i.id === id); return e?.status?.code ?? e?.status; };
    expect(stOf(x.id), 'X Tắt kích hoạt').toBe('INACTIVE');
    for (const [id, s0] of Object.entries(before)) if (id !== x.id && arr.some((i: any) => i.id === id)) expect(stOf(id), `Đầu mục ${id} giữ nguyên`).toBe(s0);

  });
});
