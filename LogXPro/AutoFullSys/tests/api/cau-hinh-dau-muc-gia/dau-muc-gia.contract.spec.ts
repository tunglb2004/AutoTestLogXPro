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
import * as R_cau_hinh_dau_muc_gia_dau_muc_gia from '../../../src/cau-hinh-dau-muc-gia/api/schemas/dau-muc-gia.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình đầu mục giá", () => {
  test("CFG-004 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_dau_muc_gia_dau_muc_gia.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      expect(b.data.meta.pagination).toHaveProperty("total");
      expect(b.data.meta.pagination).toHaveProperty("currentPage");
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "serviceCode", "serviceName", "configurationCount", "status"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("CFG-008 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/stats";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_dau_muc_gia_dau_muc_gia.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["configurationCount", "itemCount", "activeItemCount"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("CFG-012 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_dau_muc_gia_dau_muc_gia.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      expect(b.data.meta.pagination).toHaveProperty("total");
      expect(b.data.meta.pagination).toHaveProperty("currentPage");
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "priceConfigurationId", "name", "priceTypeId", "priceTypeCode", "priceTypeName", "warehouseTypes", "status", "sortOrder", "locked", "createdAt", "updatedAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("CFG-018 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_dau_muc_gia_dau_muc_gia.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      expect(b.data.meta.pagination).toHaveProperty("total");
      expect(b.data.meta.pagination).toHaveProperty("currentPage");
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "at", "actorUserId", "actorEmail", "actorName", "actorEmployeeCode", "action", "summary", "targetEntity", "targetId", "oldValue", "newValue", "event", "eventLabel"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("CFG-031 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const name = nm('Phí khai báo C31');
    const res = await POST(khq.id, { name, priceTypeId: refs.priceTypes.FIXED, sortOrder: 1 });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    testRun.track(`đầu mục ${name}`, () => DEL(khq.id, b.data.id));
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'priceConfigurationId', 'name', 'priceTypeId', 'priceTypeCode', 'priceTypeName', 'warehouseTypes', 'status', 'sortOrder', 'locked', 'createdAt', 'updatedAt']) expect(b.data, `data có ${k}`).toHaveProperty(k);
    expect(Array.isArray(b.data.warehouseTypes)).toBe(true);

  });

  test("CFG-045 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const x = await lockedItem('Hợp đồng C45');
    const res = await saveStatus('KHQ', x.id, 'INACTIVE');
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    expect(Array.isArray(b.data.items), 'data.items là mảng').toBe(true);
    for (const k of ['id', 'code', 'priceConfigurationId', 'name', 'priceTypeId', 'priceTypeCode', 'priceTypeName', 'warehouseTypes', 'status', 'sortOrder', 'locked', 'createdAt', 'updatedAt']) expect(b.data.items[0], `mỗi phần tử có ${k}`).toHaveProperty(k);
    test.info().annotations.push({ type: 'Điểm cần xác nhận', description: 'Case nêu data.meta (tổng số, trang) nhưng Swagger PUT /items trả cấu hình phân hệ không có meta; chỉ kiểm theo Swagger' });

  });

  test("CFG-056 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const y = await fresh('KHQ', 'Phí khai báo C56');
    const res = await PUT1(y.configId, y.id, { name: nm('Phí khai báo sửa C56'), priceTypeId: refs.priceTypes.SURCHARGE, sortOrder: 2, status: 'ACTIVE', warehouseTypeIds: [] });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'priceConfigurationId', 'name', 'priceTypeId', 'priceTypeCode', 'priceTypeName', 'warehouseTypes', 'status', 'sortOrder', 'locked', 'createdAt', 'updatedAt']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("CFG-064 Cấu trúc phản hồi thành công", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const z = await fresh('KHQ', 'Xóa C64');
    const res = await DEL(z.configId, z.id);
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(hasNoStacktrace(text)).toBe(true);
    if (text) {
      const b = JSON.parse(text);
      expect(b.success).toBe(true);
      expect(b).toHaveProperty('message');
      expect(b.errorCode ?? null).toBeNull();
      expect(b).toHaveProperty('data');
    }

  });

  test("CFG-070 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_dau_muc_gia_dau_muc_gia.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["blocked", "blockingOrderCodes", "inUse"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("CFG-075 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/versions";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_dau_muc_gia_dau_muc_gia.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      expect(b.data.meta.pagination).toHaveProperty("total");
      expect(b.data.meta.pagination).toHaveProperty("currentPage");
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "versionNo", "at", "actorUserId", "actorName", "current"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("CFG-080 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/versions/current";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_dau_muc_gia_dau_muc_gia.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "versionNo", "at", "actorUserId", "actorName", "current", "snapshot"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("CFG-085 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/price-configurations/{id}/versions/{versionId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_dau_muc_gia_dau_muc_gia.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "versionNo", "at", "actorUserId", "actorName", "current", "snapshot"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });
});
