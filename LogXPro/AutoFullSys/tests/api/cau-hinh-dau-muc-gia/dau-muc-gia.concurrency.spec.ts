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
  test("CFG-033 Gửi trùng 2 lần cùng body", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const name = nm('Phí khai báo C33');
    const payload = { name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1 };
    const r1 = await POST(khq.id, payload);
    expectStatusIn(r1, '200/201', 'lần 1');
    testRun.track(`đầu mục ${name}`, async () => DEL(khq.id, (await data(r1)).id));
    const r2 = await POST(khq.id, payload);
    expectStatusIn(r2, '400/409/422', 'lần 2');
    await expectApiError(r2);

  });

  test("CFG-042 Hai người lưu cùng lúc", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const a = await fresh('KHQ', 'Đồng thời A');
    const b = await fresh('KHQ', 'Đồng thời B');
    const c1 = await cfgOf('KHQ', 'k1');
    const c2 = await cfgOf('KHQ', 'k1b');
    const l1 = c1.items.map(toBody).map((x: any) => (x.id === a.id ? { ...x, name: nm('K1 đổi A') } : x));
    const l2 = c2.items.map(toBody).map((x: any) => (x.id === b.id ? { ...x, name: nm('K1B đổi B') } : x));
    const [r1, r2] = await Promise.all([PUTALL(c1.id, l1, 'k1'), PUTALL(c2.id, l2, 'k1b')]);
    expect([r1, r2].filter((r) => r.ok()).length, 'Chỉ 1 lần lưu thắng').toBe(1);
    expectStatusIn(r1.ok() ? r2 : r1, '409/423', 'người thua');
    const now = await cfgOf('KHQ');
    const nameA = now.items.find((i: any) => i.id === a.id)?.name;
    const nameB = now.items.find((i: any) => i.id === b.id)?.name;
    if (r1.ok()) { expect(nameA).toBe(nm('K1 đổi A')); expect(nameB, 'Không mất dữ liệu ngầm').toBe(b.name); }
    else { expect(nameB).toBe(nm('K1B đổi B')); expect(nameA, 'Không mất dữ liệu ngầm').toBe(a.name); }

  });
});
