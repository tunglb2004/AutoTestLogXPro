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
  test("CFG-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/price-configurations", "GET /api/price-configurations/stats", "GET /api/price-configurations/{id}", "GET /api/price-configurations/{id}/history", "POST /api/price-configurations/{id}/items", "PUT /api/price-configurations/{id}/items", "PUT /api/price-configurations/{id}/items/{itemId}", "DELETE /api/price-configurations/{id}/items/{itemId}", "GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact", "GET /api/price-configurations/{id}/versions", "GET /api/price-configurations/{id}/versions/current", "GET /api/price-configurations/{id}/versions/{versionId}"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "k1");
      const before = await testRun.snapshot(api, p.params ?? {}, "k1");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.k1)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "k1"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("CFG-003 Tài khoản không có quyền Cấu hình đầu mục giá", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, tok }) => {

    const res = await http.call('GET /api/price-configurations', { token: tok('sale') });
    expectStatusIn(res, '403');
    await expectNoData(res);

  });

  test("CFG-050 `itemId` thuộc phân hệ khác", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const vt = await fresh('VT', 'Cước chéo C50');
    const kb = await cfgOf('KB');
    const before = stable(await itemOf('VT', vt.id));
    const res = await PUT1(kb.id, vt.id, { ...(await one('VT', vt.id)), name: nm('Sửa chéo C50'), warehouseTypeIds: [refs.warehouseTypeId] });
    expectStatusIn(res, '400/403/404');
    expect(stable(await itemOf('VT', vt.id)), 'Không sửa chéo phân hệ').toEqual(before);
    expect((await cfgOf('KB')).items.some((i: any) => i.id === vt.id), 'Không chuyển sang Kho bãi').toBe(false);

  });

  test("CFG-061 Xóa đầu mục của phân hệ khác", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const z = await fresh('KHQ', 'Xóa chéo C61');
    const vt = await cfgOf('VT');
    const res = await DEL(vt.id, z.id);
    expectStatusIn(res, '400/403/404');
    expect(await itemOf('KHQ', z.id), 'Z còn nguyên').toBeTruthy();

  });

  test("CFG-068 `itemId` thuộc phân hệ khác", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await lockedItem('Kiểm tra chéo C68');
    const kb = await cfgOf('KB');
    const res = await http.call('GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact', { token: tok('k1'), params: { id: kb.id, itemId: x.id } });
    expectStatusIn(res, '400/403/404');
    await expectNoData(res);

  });

  test("CFG-083 `versionId` của phân hệ khác", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const vt = await cfgOf('VT');
    const v = items(await VERS(vt.id, { page: 1, perPage: 1 }))[0];
    if (!v) throw new Error('Chuẩn bị dữ liệu thất bại: phân hệ Vận tải chưa có phiên bản nào');
    const khq = await cfgOf('KHQ');
    const res = await http.call('GET /api/price-configurations/{id}/versions/{versionId}', { token: tok('k1'), params: { id: khq.id, versionId: v.id } });
    expectStatusIn(res, '403/404');
    await expectNoData(res);

  });
});
