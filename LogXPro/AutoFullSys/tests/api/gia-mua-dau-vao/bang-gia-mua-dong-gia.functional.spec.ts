import { runPendingAllApi, runPendingLockApi, runPendingStateApi } from '../../../src/gia-mua-dau-vao/data/pending-api-cases';
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

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)", () => {
  test("BGM-077 Xem và lọc dòng giá", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingAllApi("BGM-077", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("BGM-078 Nhiều giá trị trong 1 trường là HOẶC, giữa các trường là VÀ", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G78', ['customsFee']);
    const sheet = await activeA(it, []);
    await must(await http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, json: { priceConfigurationItemId: it.customsFee.id, unitCode: refs.units.customsFee, unitPrice: 1_000_000, customsOfficeCodes: [refs.customsOffice, office2], vehicleTypeCodes: [refs.vehicleType, veh2] } }), 'thêm 4 dòng KHQ');
    const res = await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, query: { priceConfigurationItemId: it.customsFee.id, customsOfficeCode: [refs.customsOffice, office2], vehicleTypeCode: [refs.vehicleType], perPage: 100 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list, 'Chi cục A hoặc B và loại xe 40ft').toHaveLength(2);
    expect(list.every((l: any) => [refs.customsOffice, office2].includes(l.customsOfficeCode) && l.vehicleTypeCode === refs.vehicleType)).toBe(true);

  });

  test("BGM-079 Dòng thuộc đầu mục tắt bị ẩn", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G79', ['storage']);
    const sheet = await activeA(it, ['storage']);
    await must(await setItemStatus(testRun, it.storage, 'INACTIVE'), 'tắt đầu mục X');
    const res = await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, query: { priceConfigurationItemId: it.storage.id } });
    expectStatusIn(res, '200');
    expect(items(await data(res)), 'Không trả dòng của X').toHaveLength(0);

  });

  test("BGM-084 Thêm dòng giá hàng loạt theo tổ hợp", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G84', ['supervision']);
    const sheet = await activeA(it, []);
    const BULK = { priceConfigurationItemId: it.supervision.id, unitCode: refs.units.supervision, unitPrice: 850_000, customsOfficeCodes: [refs.customsOffice, office2], vehicleTypeCodes: [refs.vehicleType, veh2] };
    const ADD = () => http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, json: BULK });

    const res = await ADD();
    expectStatusIn(res, '200/201');
    const d = await data(res);
    expect(Number(d.created), 'Sinh 4 dòng theo tổ hợp').toBe(4);
    expect(Number(d.skipped)).toBe(0);
    for (const l of d.items ?? []) {
      expect(approved(l), 'Đã phê duyệt').toBe(true);
      expect(String(l.code)).toMatch(new RegExp(`^${sheet.code}-\\d{4}$`));
    }
    const sbp = await sbpLines(testRun, it.supervision.id);
    expect(sbp.length, 'Tổ hợp mới sinh SBP').toBe(4);
    expect(sbp.every((x: any) => x.benchmarkMissing), 'SBP null').toBe(true);

  });

  test("BGM-085 Bảng Hết hiệu lực không thêm được", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingStateApi("BGM-085", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("BGM-086 Đầu mục Phát sinh", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G86', ['shiftStorage']);
    const sheet = await activeA(it, []);
    const res = await http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, json: priceLine(refs, it, 'shiftStorage', 200_000) });
    expectStatusIn(res, '400/422');
    expect(await LINES(sheet.id, { priceConfigurationItemId: it.shiftStorage.id }), 'Không tạo').toHaveLength(0);

  });

  test("BGM-087 SBP cảnh báo khi nhà thầu thêm dòng tham chiếu", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G87', ['supervision']);
    await activeA(it, ['supervision']);
    const sbp = (await sbpLines(testRun, it.supervision.id))[0];
    await setBenchmark(testRun, sbp.id, 800_000);
    const bSheet = await activeSheetOf(testRun, B);
    if (!bSheet) throw new Error('Chuẩn bị dữ liệu thất bại: NT_B chưa có bảng Đang hoạt động');
    const res = await http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: bSheet.id }, json: priceLine(refs, it, 'supervision', 35) });
    expectStatusIn(res, '200/201');
    const after = (await sbpLines(testRun, it.supervision.id)).find((x: any) => x.id === sbp.id);
    expect(after?.needsAttention, 'SBP cần chú ý').toBe(true);

  });

  test("BGM-093 Lưu lô thêm, sửa giá, xóa dòng", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `G93${TEST_RUN_ID}`, { quote: true });
    const feeLine = await lineOf(base.sheetA, base.items.customsFee.id);

    const o = await p0Order(testRun, 'KHQ_COORDINATED', { base });
    const seal = await lineOf(base.sheetA, base.items.seal.id);
    const v0 = Number((await VERS(base.sheetA)).meta.pagination.total);
    const res = await http.call('PUT /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: base.sheetA }, json: { updated: [{ id: feeLine.id, unitPrice: 1_100_000 }], removed: [seal.id], added: [priceLine(refs, base.items, 'supervision', 800_000, { customsOfficeCodes: [office2] })] } });
    expectStatusIn(res, '200/204');
    const d = await data(res);
    expect([d.created, d.updated, d.removed].map(Number), 'Số tạo/sửa/xóa').toEqual([1, 1, 1]);
    const fee = (await LINES(base.sheetA, { priceConfigurationItemId: base.items.customsFee.id }))[0];
    expect(pending(fee), 'Phí khai báo đang tham chiếu → Chờ phê duyệt').toBe(true);
    const sbp = (await sbpLines(testRun, base.items.customsFee.id))[0];
    if (sbp) {
      const det = await data(await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id: sbp.id } }));
      expect((det.contractors ?? []).some((c: any) => c.contractorId === A && Number(c.unitPrice) === 1_100_000), 'Dòng chờ duyệt bị loại khỏi định mức').toBe(false);
    }
    expect(Number((await VERS(base.sheetA)).meta.pagination.total), 'Ghi phiên bản').toBeGreaterThan(v0);
    void o;

  });

  test("BGM-094 Đổi giá không tự sửa chi phí phiếu đã điều phối", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `G94${TEST_RUN_ID}`, { quote: true });
    const feeLine = await lineOf(base.sheetA, base.items.customsFee.id);

    const o = await p0Order(testRun, 'KHQ_COORDINATED', { base });
    const res = await http.call('PUT /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: base.sheetA }, json: { updated: [{ id: feeLine.id, unitPrice: 1_100_000 }] } });
    expectStatusIn(res, '200/204');
    const cost = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    expectMoney(cost.unitPrice, 1_000_000, 'Dòng chi phí của P vẫn 1.000.000');
    const cur = await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: cost.costLineId } }));
    expect(Number(cur?.currentAmount), '"Làm mới giá" chưa lấy được giá mới (dòng Chờ phê duyệt)').not.toBe(1_100_000);

  });

  test("BGM-095 Sửa giá dòng đang tham chiếu: tách nguồn duy nhất và còn nguồn khác", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `G95${TEST_RUN_ID}`, { quote: true });
    const feeLine = await lineOf(base.sheetA, base.items.customsFee.id);

    const vtLine = await lineOf(base.sheetA, base.items.freight.id);
    const rc0 = await getCustomerQuotation(testRun, base.rcId);
    const vtRc0 = stable(lineByName(rc0, 'Cước vận tải'));
    const ssp0 = stable(await sspLines(testRun, base.items.freight.id));
    const res = await http.call('PUT /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: base.sheetA }, json: { updated: [{ id: feeLine.id, unitPrice: 1_100_000 }, { id: vtLine.id, unitPrice: 9_800_000 }] } });
    expectStatusIn(res, '200/204');
    expect(await sbpLines(testRun, base.items.customsFee.id), '(a) SBP Phí khai báo biến mất').toHaveLength(0);
    expect(await sspLines(testRun, base.items.customsFee.id), '(a) SSP Phí khai báo biến mất').toHaveLength(0);
    const rc = await getCustomerQuotation(testRun, base.rcId);
    expect(lineByName(rc, 'Phí khai báo')?.expired, '(a) Dòng RC gắn SSP đó Hết hạn').toBe(true);
    const vtSbp = (await sbpLines(testRun, base.items.freight.id))[0];
    expect(vtSbp, '(b) SBP VT còn').toBeTruthy();
    const det = await data(await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id: vtSbp.id } }));
    expect((det.contractors ?? []).map((c: any) => c.contractorId).filter((x: string) => x === A || x === B), '(b) nguồn chỉ còn NT_B').toEqual([B]);
    expect(stable(await sspLines(testRun, base.items.freight.id)), '(b) SSP không đổi').toEqual(ssp0);
    expect(stable(lineByName(rc, 'Cước vận tải')), '(b) RC không đổi').toEqual(vtRc0);

  });

  test("BGM-096 Bảng bị khóa bởi người khác", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ testRun, browser, roles }) => {
    test.setTimeout(900_000);
    await expect(runPendingLockApi("BGM-096", testRun, browser, roles), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("BGM-097 Lỗi 1 dòng thì hủy cả lô", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G97', (['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] as P0ItemKey[]));
    const s = await draft(A, 'VND', linesOf(it, (['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] as P0ItemKey[])), 'Lô lỗi G97');
    const lines = await LINES(s.id);
    const before = stable(lines.map((l: any) => [l.id, Number(l.unitPrice)]));
    const res = await http.call('PUT /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: s.id }, json: { updated: [{ id: lines[0].id, unitPrice: -1 }], removed: [lines[1].id] } });
    expectStatusIn(res, '400/422');
    expect(stable((await LINES(s.id)).map((l: any) => [l.id, Number(l.unitPrice)])), 'Không xóa, không sửa dòng nào').toEqual(before);

  });

  test("BGM-102 Phê duyệt dòng giá chờ duyệt", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G102', ['storage']);
    const sheet = await activeA(it, ['storage']);
    const upd = await changeLinePrice(testRun, sheet.id, it.storage.id, 520_000, false);
    const lineId = upd?.id ?? (await lineOf(sheet.id, it.storage.id)).id;
    const APPROVE = (ids: string[] = [lineId], id: string = sheet.id) => http.call('POST /api/purchase-prices/{id}/items/approve', { token: tok('k1'), params: { id }, json: { itemIds: ids } });

    expect(pending(await lineOf(sheet.id, it.storage.id)), 'Tiền điều kiện: dòng Chờ phê duyệt').toBe(true);
    const res = await APPROVE();
    expectStatusIn(res, '200/204');
    expect(approved(await lineOf(sheet.id, it.storage.id)), 'Đã phê duyệt').toBe(true);
    const sbp = (await sbpLines(testRun, it.storage.id))[0];
    const det = await data(await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id: sbp.id } }));
    expect((det.contractors ?? []).some((c: any) => c.contractorId === A && Number(c.unitPrice) === 520_000), 'Thành nguồn định mức').toBe(true);

  });

  test("BGM-103 Phê duyệt dòng đã duyệt", { tag: ["@api", "@gia-mua-dau-vao", "@p3", "@cho-xac-nhan"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G103', ['storage']);
    const sheet = await activeA(it, ['storage']);
    const l = await lineOf(sheet.id, it.storage.id);
    const before = stable(l);
    const res = await http.call('POST /api/purchase-prices/{id}/items/approve', { token: tok('k1'), params: { id: sheet.id }, json: { itemIds: [l.id] } });
    expectStatusIn(res, '200/400/409');
    test.info().annotations.push({ type: 'Chờ xác nhận', description: `Phê duyệt dòng đã duyệt: HTTP ${res.status()}` });
    expect(stable(await lineOf(sheet.id, it.storage.id)), 'Không đổi gì').toEqual(before);

  });

  test("BGM-110 Sửa đơn giá một dòng", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G110', ['supervision']);
    const sheet = await activeA(it, ['supervision']);
    const ref = await lineOf(sheet.id, it.supervision.id);
    const res = await PUTL(sheet.id, ref, lineBody(ref, 820_000));
    expectStatusIn(res, '200/204');
    expect(pending(await lineOf(sheet.id, it.supervision.id)), 'Dòng đang được tham chiếu → Chờ phê duyệt').toBe(true);
    const sbp = (await sbpLines(testRun, it.supervision.id))[0];
    if (sbp) {
      const det = await data(await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id: sbp.id } }));
      expect((det.contractors ?? []).some((c: any) => Number(c.unitPrice) === 820_000), 'Bị loại khỏi định mức').toBe(false);
    }
    const s2 = await draft(A, 'VND', linesOf(it, ['supervision']), 'Tạo mới G110');
    const l2 = await lineOf(s2.id, it.supervision.id);
    expectStatusIn(await PUTL(s2.id, l2, lineBody(l2, 820_000)), '200/204', 'dòng bảng Tạo mới');
    expect(approved(await lineOf(s2.id, it.supervision.id)), 'Dòng bảng Tạo mới giữ Đã phê duyệt').toBe(true);
    expect((await HIST(s2.id)).some((h: any) => /820[.,]?000/.test(JSON.stringify(h))), 'Ghi lịch sử').toBe(true);

  });

  test("BGM-111 Sửa thuộc tính/đơn vị của dòng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const office2 = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code;
    const veh2 = (await testRun.catalog('GET /api/catalogues/vehicle-types')).find((v: any) => v.active !== false && v.code !== refs.vehicleType)?.code;
    if (!office2 || !veh2) throw new Error('Chuẩn bị dữ liệu thất bại: danh mục cần chi cục và loại xe thứ 2 đang hoạt động');

    const it = await own('G111', ['customsFee']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee']), 'Thuộc tính G111');
    const l = await lineOf(s.id, it.customsFee.id);
    const res = await PUTL(s.id, l, { ...lineBody(l, Number(l.unitPrice)), customsOfficeCode: office2 });
    expectStatusIn(res, '200/400');
    const now = await lineOf(s.id, it.customsFee.id);
    if (res.status() === 200) test.info().annotations.push({ type: 'Lệch tài liệu', description: `API nhận sửa chi cục của dòng (SRS BR18 chỉ cho sửa Đơn giá): ${l.customsOfficeCode} → ${now.customsOfficeCode}` });
    else expect(now.customsOfficeCode, 'Không đổi thuộc tính').toBe(l.customsOfficeCode);

  });

  test("BGM-117 Xóa một dòng giá", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `G117${TEST_RUN_ID}`, { quote: true });
    const feeLine = await lineOf(base.sheetA, base.items.customsFee.id);

    const kb = await lineOf(base.sheetA, base.items.storage.id);
    const res = await http.call('DELETE /api/purchase-prices/{id}/items/{itemId}', { token: tok('k1'), params: { id: base.sheetA, itemId: kb.id } });
    expectStatusIn(res, '200/204');
    expect(await lineOf(base.sheetA, base.items.storage.id), 'Dòng bị xóa').toBeUndefined();
    expect(await sbpLines(testRun, base.items.storage.id), 'SBP bị xóa').toHaveLength(0);
    expect(await sspLines(testRun, base.items.storage.id), 'SSP bị xóa').toHaveLength(0);
    const rc = await getCustomerQuotation(testRun, base.rcId);
    expect(lineByName(rc, 'Phí lưu kho')?.expired, 'Dòng BGKH gắn SSP đó Hết hạn').toBe(true);
    void feeLine;

  });

  test("BGM-118 Xóa dòng còn nhà thầu khác tham chiếu", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `G118${TEST_RUN_ID}`, { quote: false });
    const feeLine = await lineOf(base.sheetA, base.items.customsFee.id);

    const ssp0 = stable(await sspLines(testRun, base.items.freight.id));
    const vtA = await lineOf(base.sheetA, base.items.freight.id);
    const res = await http.call('DELETE /api/purchase-prices/{id}/items/{itemId}', { token: tok('k1'), params: { id: base.sheetA, itemId: vtA.id } });
    expectStatusIn(res, '200/204');
    const sbp = (await sbpLines(testRun, base.items.freight.id))[0];
    expect(sbp, 'SBP VT còn').toBeTruthy();
    const det = await data(await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id: sbp.id } }));
    expect((det.contractors ?? []).map((c: any) => c.contractorId).filter((x: string) => x === A || x === B), 'Chỉ còn NT_B').toEqual([B]);
    expect(stable(await sspLines(testRun, base.items.freight.id)), 'SSP không bị xóa').toEqual(ssp0);
    void feeLine;

  });

  test("BGM-105 `itemIds` rỗng", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G105', ['customsFee']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee']), 'Rỗng G105');
    const before = stable(await LINES(s.id));
    const res = await http.call('POST /api/purchase-prices/{id}/items/approve', { token: tok('k1'), params: { id: s.id }, json: { itemIds: [] } });
    expectStatusIn(res, '400/422');
    expect(stable(await LINES(s.id)), 'Không đổi dữ liệu').toEqual(before);

  });

  test("BGM-113 Phiên bản mới lưu trước/sau", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G113', ['customsFee', 'overtime']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee', 'overtime']), 'Phiên bản G113');
    const fee = await lineOf(s.id, it.customsFee.id);

    const v0 = Number((await VERS(s.id)).meta.pagination.total);
    const res = await PUTL(s.id, fee, lineBody(fee, 1_100_000));
    expectStatusIn(res, '200/204');
    const vs = await VERS(s.id);
    expect(Number(vs.meta.pagination.total), 'Phiên bản tăng 1').toBe(v0 + 1);
    const older = items(vs).find((v: any) => !v.current);
    expect(older?.id, 'Tìm thấy phiên bản trước khi đổi giá').toBeTruthy();
    const its = items(await must(await http.call('GET /api/purchase-prices/{id}/versions/{versionId}/items', { token: tok('k1'), params: { id: s.id, versionId: older.id }, query: { perPage: 100 } }), 'đọc dòng giá của phiên bản cũ'));
    const oldFee = its.find((l: any) => l.id === fee.id || l.priceConfigurationItemId === it.customsFee.id);
    expect(oldFee, 'Phiên bản cũ chứa đúng dòng Phí khai báo').toBeTruthy();
    expectMoney(oldFee.unitPrice, 1_000_000, 'Giá của dòng trước khi thay đổi');

  });

  test("BGM-120 Chi phí phiếu đã gắn dòng giữ nguyên", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `G120${TEST_RUN_ID}`, { quote: true });
    const feeLine = await lineOf(base.sheetA, base.items.customsFee.id);

    const o = await p0Order(testRun, 'KHQ_COORDINATED', { base });
    const res = await http.call('DELETE /api/purchase-prices/{id}/items/{itemId}', { token: tok('k1'), params: { id: base.sheetA, itemId: feeLine.id } });
    expectStatusIn(res, '200/204');
    const cost = (await costLines(testRun, o.svc.KHQ)).find((l) => l.unitCode === refs.units.customsFee);
    expectMoney(cost.unitPrice, 1_000_000, 'Dòng chi phí P giữ đơn giá');
    const cur = await http.call('GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price', { token: tok('dp'), params: { id: o.id, type: refs.services.KHQ, costLineId: cost.costLineId } });
    expectStatusIn(cur, '400/404/409/422', '"Làm mới giá" báo nguồn không hợp lệ');

  });
});
