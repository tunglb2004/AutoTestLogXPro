import { runPendingStateApi } from '../../../src/gia-mua-dau-vao/data/pending-api-cases';
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
  test("BGM-049 Kích hoạt bảng giá NT_A", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G49', ['storage']);
    const old = await activeD(it, ['storage'], 'NT_D cũ G49');
    const s = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D mới G49'));
    const ACTIVATE = () => http.call('POST /api/purchase-prices/{id}/activate', { token: tok('k1'), params: { id: s.id } });

    const res = await ACTIVATE();
    expectStatusIn(res, '200/204');
    const now = await SHEET(s.id);
    expect(isActiveSheet(now), 'Bảng Đang hoạt động').toBe(true);
    expect(now.effectiveFrom, 'Ngày hiệu lực = ngày kích hoạt').toBe(today());
    expect(isStopped(await SHEET(old.id)), 'Bảng Đang hoạt động cũ → Ngừng hoạt động').toBe(true);
    const sbp = await sbpLines(testRun, it.storage.id);
    expect(sbp.length, 'Sinh SBP cho tổ hợp mới').toBeGreaterThan(0);
    expect(sbp[0].benchmarkMissing, 'SBP giá null').toBe(true);
    const ssp = await sspLines(testRun, it.storage.id);
    expect(ssp.length, 'Sinh SSP').toBeGreaterThan(0);
    expect(ssp[0].sellingPriceSet, 'SSP giá null').toBe(false);

    });

  });

  test("BGM-050 Nhà thầu không còn hoạt động", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingStateApi("BGM-050", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("BGM-051 Kích hoạt lại bảng Ngừng hoạt động", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G51', ['storage']);
    const old = await activeD(it, ['storage'], 'NT_D cũ G51');
    const s = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D mới G51'));
    const ACTIVATE = () => http.call('POST /api/purchase-prices/{id}/activate', { token: tok('k1'), params: { id: s.id } });

    await must(await ACTIVATE(), 'kích hoạt bảng mới');
    const oldBefore = await SHEET(old.id);
    const res = await http.call('POST /api/purchase-prices/{id}/activate', { token: tok('k1'), params: { id: old.id } });
    expectStatusIn(res, '200/204');
    const o2 = await SHEET(old.id);
    expect(isActiveSheet(o2), 'Bảng cũ Đang hoạt động').toBe(true);
    expect(isStopped(await SHEET(s.id)), 'Bảng mới chuyển Ngừng hoạt động').toBe(true);
    expect([o2.effectiveFrom, o2.effectiveTo], 'Kỳ hiệu lực bảng cũ giữ nguyên').toEqual([oldBefore.effectiveFrom, oldBefore.effectiveTo]);

    });

  });

  test("BGM-052 Hết hiệu lực không kích hoạt được", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingStateApi("BGM-052", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("BGM-053 SBP gom dòng 2 nhà thầu cùng tổ hợp", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G53', ['freight']);
    await ensureContractorLines(testRun, B, 'USD', [priceLine(refs, it, 'freight', 400)], nmS('Bảng NT_B'));
    const s = await createSheet(testRun, D, 'VND', linesOf(it, ['freight']), nmS('NT_D G53'));
    const res = await http.call('POST /api/purchase-prices/{id}/activate', { token: tok('k1'), params: { id: s.id } });
    expectStatusIn(res, '200/204');
    const sbp = await sbpLines(testRun, it.freight.id);
    expect(sbp, 'Chỉ 1 dòng SBP cho tổ hợp VT').toHaveLength(1);
    const det = await data(await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id: sbp[0].id } }));
    const ids = (det.contractors ?? []).map((c: any) => c.contractorId);
    expect(ids, 'Chi tiết có cả 2 nhà thầu').toEqual(expect.arrayContaining([D, B]));

    });

  });

  test("BGM-062 Ngừng hoạt động bảng giá thủ công", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G62', ['storage']);
    const s = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D G62'));
    await activateSheet(testRun, s.id);
    const DEACTIVATE = () => http.call('POST /api/purchase-prices/{id}/deactivate', { token: tok('k1'), params: { id: s.id } });

    const before = await SHEET(s.id);
    const res = await DEACTIVATE();
    expectStatusIn(res, '200/204');
    const now = await SHEET(s.id);
    expect(isStopped(now), 'Ngừng hoạt động').toBe(true);
    expect([now.effectiveFrom, now.effectiveTo], 'Giữ kỳ hiệu lực').toEqual([before.effectiveFrom, before.effectiveTo]);
    expect(await sbpLines(testRun, it.storage.id), 'Dòng giá không còn là nguồn định mức').toHaveLength(0);

    });

  });

  test("BGM-063 SBP chỉ còn tham chiếu từ bảng vừa ngừng thì bị xóa", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G63', ['storage']);
    const s = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D G63'));
    await activateSheet(testRun, s.id);
    const DEACTIVATE = () => http.call('POST /api/purchase-prices/{id}/deactivate', { token: tok('k1'), params: { id: s.id } });

    const sbp = (await sbpLines(testRun, it.storage.id))[0];
    await setBenchmark(testRun, sbp.id, 500_000);
    const ssp = (await sspLines(testRun, it.storage.id))[0];
    await setSelling(testRun, ssp.id, 600_000);
    const res = await DEACTIVATE();
    expectStatusIn(res, '200/204');
    expect(await sbpLines(testRun, it.storage.id), 'SBP tổ hợp KB bị xóa kèm giá').toHaveLength(0);
    expect(await sspLines(testRun, it.storage.id), 'SSP tổ hợp KB bị xóa kèm giá').toHaveLength(0);

    });

  });

  test("BGM-064 Nhà thầu không còn trong ô chọn điều phối", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const o = await p0Order(testRun, 'ACCEPTED');
    const dName = (await contractorRef(testRun, D)).name;
    const s = await createSheet(testRun, D, 'VND', [priceLine(refs, o.base.items, 'storage', 500_000)], nmS('NT_D KB G64'));
    await activateSheet(testRun, s.id);
    const OPTS = async () => ((await data(await http.call('GET /api/k3/service-orders/{id}/services/{type}/coordination-options', { token: tok('dp'), params: { id: o.id, type: refs.services.KB } }))).contractors ?? []).map((c: any) => c.contractorName);
    expect(await OPTS(), 'Tiền điều kiện: NT_D có trong ô chọn Kho bãi').toContain(dName);
    const res = await http.call('POST /api/purchase-prices/{id}/deactivate', { token: tok('k1'), params: { id: s.id } });
    expectStatusIn(res, '200/204');
    expect(await OPTS(), 'NT_D không còn trong danh sách nhà thầu Kho bãi').not.toContain(dName);

    });

  });

  test("BGM-065 Ngừng bảng không ở Đang hoạt động", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const s = await draft(A, 'VND', [], 'Tạo mới G65');
    const res = await http.call('POST /api/purchase-prices/{id}/deactivate', { token: tok('k1'), params: { id: s.id } });
    expectStatusIn(res, '400/409/422');
    expect(isNew(await SHEET(s.id)), 'Giữ Tạo mới').toBe(true);

  });

  test("BGM-066 Chi phí đã điều phối không đổi", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const o = await p0Order(testRun, 'ACCEPTED');
    const s = await createSheet(testRun, D, 'VND', [priceLine(refs, o.base.items, 'customsFee', 1_000_000)], nmS('NT_D KHQ G66'));
    await activateSheet(testRun, s.id);
    await coordinate(testRun, o.svc.KHQ, [{ priceConfigurationItemId: o.base.items.customsFee.id, contractorId: D, unitCode: refs.units.customsFee }]);
    const before = (await costLines(testRun, o.svc.KHQ)).filter((l) => l.contractorId === D).map((l) => Number(l.unitPrice));
    expect(before, 'Tiền điều kiện: có chi phí từ bảng NT_D').toContain(1_000_000);
    const res = await http.call('POST /api/purchase-prices/{id}/deactivate', { token: tok('k1'), params: { id: s.id } });
    expectStatusIn(res, '200/204');
    expect((await costLines(testRun, o.svc.KHQ)).filter((l) => l.contractorId === D).map((l) => Number(l.unitPrice)), 'Đơn giá dòng chi phí giữ nguyên').toEqual(before);

    });

  });

  test("BGM-058 Kiểm tra trước khi kích hoạt", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G58', ['storage']);
    const old = await activeD(it, ['storage'], 'NT_D cũ G58');
    const s = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D mới G58'));
    const ACTIVATE = () => http.call('POST /api/purchase-prices/{id}/activate', { token: tok('k1'), params: { id: s.id } });

    const res = await http.call('GET /api/purchase-prices/{id}/activation-check', { token: tok('k1'), params: { id: s.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(d.replacesActiveSheet, 'Có bảng sẽ bị ngừng').toBe(true);
    expect(d.activeSheetCode, 'Mã bảng cũ').toBe(old.code);

    });

  });
});
