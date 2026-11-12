/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Items, setItemStatus } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { createSheet, activateSheet, priceLine, sheetBody, contractorRef, ensureContractorLines, activeSheetOf, isActiveSheet, changeLinePrice, exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { sbpLines, setBenchmark } from '../../../src/gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { sspLines, setSelling } from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { buildP0, p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { coordinate, costLines } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { getCustomerQuotation, lineByName } from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as R_gia_mua_dau_vao_bang_gia_mua from '../../../src/gia-mua-dau-vao/api/schemas/bang-gia-mua.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)", () => {
  test("BGM-007 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "name", "contractorId", "contractorName", "contractId", "contractCode", "effectiveFrom", "effectiveTo", "currency", "note", "status", "createdAt", "updatedAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("BGM-019 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    const it = await own('G19', (['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] as P0ItemKey[]));
    const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: await sheetBody(testRun, A, 'VND', linesOf(it, (['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] as P0ItemKey[])), nmS('NT_A G19')) });
    expectStatusIn(res, '200/201');
    const b = await body(res);
    testRun.track(`bảng giá ${b.data.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: b.data.id } }));
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'name', 'contractorId', 'contractorName', 'contractId', 'contractCode', 'effectiveFrom', 'effectiveTo', 'currency', 'note', 'status', 'createdAt', 'updatedAt']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("BGM-023 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/contractors";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "name", "contract"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("BGM-027 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/stats";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["total", "byStatus"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("BGM-031 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "code", "name", "contractorId", "contractorName", "contractId", "contractCode", "effectiveFrom", "effectiveTo", "currency", "note", "status", "createdAt", "updatedAt", "services"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("BGM-040 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    const s = await draft(A, 'VND', [], 'Hợp đồng G40');
    const to = new Date(`${s.effectiveTo}T00:00:00Z`); to.setUTCMonth(to.getUTCMonth() - 1);
    const res = await http.call('PUT /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id }, json: putBody(s, { name: nmS('Sửa G40'), effectiveTo: to.toISOString().slice(0, 10) }) });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'name', 'contractorId', 'contractorName', 'contractId', 'contractCode', 'effectiveFrom', 'effectiveTo', 'currency', 'note', 'status', 'createdAt', 'updatedAt']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("BGM-047 Phản hồi thành công không có body", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    const s = await createSheet(testRun, A, 'VND', [], nmS('Xóa G47'));
    const res = await http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("BGM-055 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    test.setTimeout(900_000);
    const D = env.ref('CONTRACTOR_D_ID');
    /** Bảo đảm NT_D có 1 bảng Đang hoạt động (tạo + kích hoạt nếu chưa có). */
    const activeD = async (created: any, keys: P0ItemKey[], tag: string) => {
      const act = await activeSheetOf(testRun, D);
      if (act) return act;
      const s = await createSheet(testRun, D, 'VND', linesOf(created, keys), nmS(tag));
      return activateSheet(testRun, s.id);
    };
    await exclusive('nt-d', async () => {
    const it = await own('G55', ['storage']);
    const old = await activeD(it, ['storage'], 'NT_D cũ G55');
    const s = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D mới G55'));
    const ACTIVATE = () => http.call('POST /api/purchase-prices/{id}/activate', { token: tok('k1'), params: { id: s.id } });

    const res = await ACTIVATE();
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'name', 'contractorId', 'contractorName', 'contractId', 'contractCode', 'effectiveFrom', 'effectiveTo', 'currency', 'note', 'status', 'createdAt', 'updatedAt']) expect(b.data, `data có ${k}`).toHaveProperty(k);

    });

  });

  test("BGM-060 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/activation-check";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["replacesActiveSheet", "activeSheetId", "activeSheetCode", "activeSheetName"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("BGM-068 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    test.setTimeout(900_000);
    const D = env.ref('CONTRACTOR_D_ID');
    /** Bảo đảm NT_D có 1 bảng Đang hoạt động (tạo + kích hoạt nếu chưa có). */
    const activeD = async (created: any, keys: P0ItemKey[], tag: string) => {
      const act = await activeSheetOf(testRun, D);
      if (act) return act;
      const s = await createSheet(testRun, D, 'VND', linesOf(created, keys), nmS(tag));
      return activateSheet(testRun, s.id);
    };
    await exclusive('nt-d', async () => {
    const it = await own('G68', ['storage']);
    const s = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D G68'));
    await activateSheet(testRun, s.id);
    const DEACTIVATE = () => http.call('POST /api/purchase-prices/{id}/deactivate', { token: tok('k1'), params: { id: s.id } });

    const res = await DEACTIVATE();
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['id', 'code', 'name', 'contractorId', 'contractorName', 'contractId', 'contractCode', 'effectiveFrom', 'effectiveTo', 'currency', 'note', 'status', 'createdAt', 'updatedAt']) expect(b.data, `data có ${k}`).toHaveProperty(k);

    });

  });

  test("BGM-074 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "at", "actorUserId", "actorEmail", "actorName", "actorEmployeeCode", "action", "summary", "targetEntity", "targetId", "oldValue", "newValue", "event", "eventLabel"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("BGM-082 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "purchasePriceId", "priceConfigurationItemId", "priceConfigurationItemCode", "priceConfigurationItemName", "priceTypeCode", "priceTypeName", "serviceTypeCode", "serviceTypeName", "unitCode", "unitName", "unitPrice", "status"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("BGM-090 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    const office2 = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code;
    const veh2 = (await testRun.catalog('GET /api/catalogues/vehicle-types')).find((v: any) => v.active !== false && v.code !== refs.vehicleType)?.code;
    if (!office2 || !veh2) throw new Error('Chuẩn bị dữ liệu thất bại: danh mục cần chi cục và loại xe thứ 2 đang hoạt động');

    const it = await own('G90', ['supervision']);
    const sheet = await activeA(it, []);
    const BULK = { priceConfigurationItemId: it.supervision.id, unitCode: refs.units.supervision, unitPrice: 850_000, customsOfficeCodes: [refs.customsOffice, office2], vehicleTypeCodes: [refs.vehicleType, veh2] };
    const ADD = () => http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, json: BULK });

    const res = await ADD();
    expectStatusIn(res, '200/201');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    expect(Array.isArray(b.data.items), 'data.items là mảng').toBe(true);
    for (const k of ['id', 'code', 'purchasePriceId', 'priceConfigurationItemId', 'priceConfigurationItemCode', 'priceConfigurationItemName', 'priceTypeCode', 'priceTypeName', 'serviceTypeCode', 'serviceTypeName', 'unitCode', 'unitName', 'unitPrice', 'status']) expect(b.data.items[0], `mỗi phần tử có ${k}`).toHaveProperty(k);
    expect(String(b.data.items[0].id)).toMatch(/^[0-9a-f-]{36}$/i);
    expect(typeof b.data.items[0].unitPrice, 'Số tiền là số').toBe('number');
    test.info().annotations.push({ type: 'Điểm cần xác nhận', description: 'Case nêu data.meta nhưng Swagger POST /items trả {created, skipped, items} không có meta; chỉ kiểm theo Swagger' });

  });

  test("BGM-100 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    const it = await own('G100', ['customsFee', 'overtime', 'storage']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee', 'overtime']), 'Hợp đồng G100');
    const [l1, l2] = await LINES(s.id);
    const res = await http.call('PUT /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: s.id }, json: { updated: [{ id: l1.id, unitPrice: 1_100_000 }], removed: [l2.id], added: linesOf(it, ['storage']) } });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['created', 'skipped', 'updated', 'removed']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("BGM-107 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    const it = await own('G107', ['storage']);
    const sheet = await activeA(it, ['storage']);
    const upd = await changeLinePrice(testRun, sheet.id, it.storage.id, 520_000, false);
    const lineId = upd?.id ?? (await lineOf(sheet.id, it.storage.id)).id;
    const APPROVE = (ids: string[] = [lineId], id: string = sheet.id) => http.call('POST /api/purchase-prices/{id}/items/approve', { token: tok('k1'), params: { id }, json: { itemIds: ids } });

    const res = await APPROVE();
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    expect(Array.isArray(b.data.items), 'data.items là mảng').toBe(true);
    for (const k of ['id', 'code', 'purchasePriceId', 'priceConfigurationItemId', 'priceConfigurationItemCode', 'priceConfigurationItemName', 'priceTypeCode', 'priceTypeName', 'serviceTypeCode', 'serviceTypeName', 'unitCode', 'unitName', 'unitPrice', 'status']) expect(b.data.items[0], `mỗi phần tử có ${k}`).toHaveProperty(k);
    expect(String(b.data.items[0].id)).toMatch(/^[0-9a-f-]{36}$/i);
    expect(typeof b.data.items[0].unitPrice, 'Số tiền là số').toBe('number');
    test.info().annotations.push({ type: 'Điểm cần xác nhận', description: 'Case nêu data.meta nhưng Swagger approve trả {approved, items} không có meta; chỉ kiểm theo Swagger' });

  });

  test("BGM-115 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    const lineBody = (l: any, unitPrice: number) => ({ unitCode: l.unitCode, unitPrice, customsOfficeCode: l.customsOfficeCode, tradeTypeCode: l.tradeTypeCode, cargoGroupCode: l.cargoGroupCode, vehicleTypeCode: l.vehicleTypeCode });
    const PUTL = (sheetId: string, l: any, json: Record<string, unknown>) => http.call('PUT /api/purchase-prices/{id}/items/{itemId}', { token: tok('k1'), params: { id: sheetId, itemId: l.id }, json });

    const it = await own('G115', ['supervision']);
    const s = await draft(A, 'VND', linesOf(it, ['supervision']), 'Hợp đồng G115');
    const l = await lineOf(s.id, it.supervision.id);
    const res = await PUTL(s.id, l, lineBody(l, 820_000));
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of [...['id', 'code', 'purchasePriceId', 'priceConfigurationItemId', 'priceConfigurationItemCode', 'priceConfigurationItemName', 'priceTypeCode', 'priceTypeName', 'serviceTypeCode', 'serviceTypeName', 'unitCode', 'unitName', 'unitPrice', 'status'], 'originPointCode', 'originPointName']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("BGM-122 Phản hồi thành công không có body", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const nmS = (tag: string) => `AT ${tag} ${TEST_RUN_ID}`;
    const sname = (s: any) => String(s?.status?.name ?? '');
    const isNew = (s: any) => ['NEW', 'DRAFT'].includes(s?.status?.code) || /Tạo mới/i.test(sname(s));
    const isStopped = (s: any) => s?.status?.code === 'INACTIVE' || /Ngừng/i.test(sname(s));
    const approved = (l: any) => l?.status?.code === 'APPROVED' || /Đã phê duyệt/i.test(sname(l));
    const pending = (l: any) => l?.status?.code === 'PENDING' || /Chờ phê duyệt/i.test(sname(l));
    const SHEET = async (id: string) => data(await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id } }));
    const LINES = async (id: string, query: Record<string, unknown> = {}) => { const out: any[] = []; for (let page = 1; page <= 100; page++) { const d = await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id }, query: { page, perPage: 100, ...query } })); const rows = items(d); out.push(...rows); const pages = Number(d?.meta?.pagination?.totalPages); if (Array.isArray(d) || (Number.isFinite(pages) ? page >= pages : rows.length < 100)) break; } return out; };
    const HIST = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const VERS = async (id: string, query: Record<string, unknown> = {}) => data(await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id }, query: { page: 1, perPage: 100, ...query } }));
    const buy = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!.buyA!;
    /** Đầu mục riêng của case (không đụng bộ P0 dùng chung). */
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    const linesOf = (created: any, keys: P0ItemKey[]) => keys.map((k) => priceLine(refs, created, k, buy(k)));
    /** Bảng Tạo mới (dọn khi bật ALLOW_CLEANUP). */
    const draft = async (contractorId: string, currency: 'VND' | 'USD', lines: Record<string, unknown>[], tag: string) => {
      const s = await createSheet(testRun, contractorId, currency, lines, nmS(tag));
      testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
      return s;
    };
    /** Thêm dòng của đầu mục riêng vào bảng NT_A Đang hoạt động (bảng dùng chung) và trả bảng. */
    const activeA = (created: any, keys: P0ItemKey[]) => ensureContractorLines(testRun, A, 'VND', linesOf(created, keys), nmS('Bảng NT_A'));
    const lineOf = async (sheetId: string, itemId: string) => (await LINES(sheetId, { priceConfigurationItemId: itemId }))[0];
    const putBody = (s: any, o: Record<string, unknown> = {}) => ({ name: s.name, contractorId: s.contractorId, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo, currency: s.currency, note: s.note ?? '', ...o });

    const it = await own('G122', ['customsFee', 'overtime']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee', 'overtime']), 'Xóa dòng G122');
    const l = await lineOf(s.id, it.overtime.id);
    const res = await http.call('DELETE /api/purchase-prices/{id}/items/{itemId}', { token: tok('k1'), params: { id: s.id, itemId: l.id } });
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("BGM-127 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/versions";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "versionNo", "at", "actorUserId", "actorName", "current"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("BGM-133 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/versions/{versionId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["id", "versionNo", "at", "actorUserId", "actorName", "current", "sheet", "services"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("BGM-139 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/versions/{versionId}/items";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dau_vao_bang_gia_mua.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["valueNode", "container", "missingNode", "object", "nodeType", "string", "integralNumber", "pojo", "floatingPointNumber", "short", "int", "long", "double", "bigDecimal"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });
});
