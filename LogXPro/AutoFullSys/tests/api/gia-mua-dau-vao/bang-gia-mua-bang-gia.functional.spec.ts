import { runPendingLockApi } from '../../../src/gia-mua-dau-vao/data/pending-api-cases';
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
  test("BGM-002 Danh sách bảng giá; lọc bảng giá của 1 nhà thầu", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G2', ['storage']);
    const s1 = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D cũ G2'));
    await activateSheet(testRun, s1.id);
    const s2 = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D mới G2'));
    await activateSheet(testRun, s2.id);
    const s3 = await createSheet(testRun, D, 'VND', [], nmS('NT_D xóa G2'));
    await must(await http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s3.id } }), 'xóa mềm bảng');
    const res = await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { contractorId: D, sort: '-effectiveFrom', perPage: 100 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.every((s: any) => s.contractorId === D), 'Chỉ bảng giá của nhà thầu').toBe(true);
    expect(isStopped(list.find((s: any) => s.id === s1.id)), 'Bảng cũ Ngừng hoạt động').toBe(true);
    expect(isActiveSheet(list.find((s: any) => s.id === s2.id)), 'Bảng mới Đang hoạt động').toBe(true);
    expect(list.some((s: any) => s.id === s3.id), 'Bảng xóa mềm không xuất hiện').toBe(false);

    });

  });

  test("BGM-003 Lọc trạng thái và tìm theo mã", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G3', ['storage']);
    const sheet = await activeA(it, ['storage']);
    const full = await SHEET(sheet.id);
    const res = await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { status: full.status.code, search: full.code } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list, 'Đúng 1 bảng').toHaveLength(1);
    expect(list[0].id).toBe(sheet.id);

  });

  test("BGM-009 Tạo bảng giá NT_A kèm 6 dòng giá", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G9', (['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] as P0ItemKey[]));
    const c = await contractorRef(testRun, A);
    const payload = await sheetBody(testRun, A, 'VND', linesOf(it, (['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] as P0ItemKey[])), nmS('NT_A G9'));
    const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: payload });
    expectStatusIn(res, '200/201');
    const s = await data(res);
    testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
    expect(String(s.code), 'Mã RSYYMM-NNN').toMatch(/^RS\d{4}-\d{3,}$/);
    expect(isNew(s), 'Trạng thái Tạo mới').toBe(true);
    expect(s.contractId, 'Gắn HĐ Đang hiệu lực của NT_A').toBe(c.contract?.id);
    const lines = await LINES(s.id);
    expect(lines, '6 dòng').toHaveLength(6);
    for (const l of lines) {
      expect(approved(l), `${l.code} Đã phê duyệt`).toBe(true);
      expect(String(l.code), 'Mã [mã bảng]-NNNN').toMatch(new RegExp(`^${s.code}-\\d{4}$`));
    }
    expect((await HIST(s.id)).some((h: any) => /Khởi tạo/i.test(htext(h))), 'Lịch sử "Khởi tạo bảng giá"').toBe(true);

  });

  test("BGM-010 Nhà thầu không có HĐ hiệu lực", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const C = env.ref('CONTRACTOR_C_ID');
    const name = nmS('NT_C G10');
    const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: { name, contractorId: C, effectiveFrom: today(), effectiveTo: today(180), currency: 'VND', items: [] } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(items(await data(await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { search: name } }))), 'Không sinh bảng').toHaveLength(0);

  });

  test("BGM-011 Kỳ hiệu lực vượt kỳ hạn HĐ", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const c = await contractorRef(testRun, A);
    const end = c.contract?.effectiveTo;
    if (!end) throw new Error('Chuẩn bị dữ liệu thất bại: HĐ của NT_A không có ngày hết hạn');
    const d = new Date(`${end}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1);
    const name = nmS('Vượt HĐ G11');
    const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: { ...(await sheetBody(testRun, A, 'VND', [], name)), effectiveTo: d.toISOString().slice(0, 10) } });
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expect(items(await data(await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { search: name } }))), 'Không tạo').toHaveLength(0);

  });

  test("BGM-012 Dòng trùng tổ hợp bị bỏ, Vận tải điểm đi = điểm đến bị bỏ", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G12', ['customsFee', 'freight']);
    const dup = priceLine(refs, it, 'customsFee', 1_000_000);
    const same = priceLine(refs, it, 'freight', 9_500_000, { originPointCodes: [refs.destinationPoint], destinationPointCodes: [refs.destinationPoint] });
    const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: await sheetBody(testRun, A, 'VND', [dup, { ...dup }, same], nmS('Trùng G12')) });
    expectStatusIn(res, '200/201');
    const s = await data(res);
    testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
    expect(await LINES(s.id, { priceConfigurationItemId: it.customsFee.id }), 'Chỉ lưu 1 dòng của cặp trùng').toHaveLength(1);
    expect(await LINES(s.id, { priceConfigurationItemId: it.freight.id }), 'Dòng điểm đi = điểm đến bị bỏ').toHaveLength(0);
    test.info().annotations.push({ type: 'Ghi nhận', description: `Thông báo số dòng bỏ qua: ${(await body(res)).message}` });

  });

  test("BGM-013 Không cho dòng giá thuộc đầu mục Phát sinh hoặc đầu mục đang tắt", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G13', ['shiftStorage', 'customsFee']);
    await must(await setItemStatus(testRun, it.customsFee, 'INACTIVE'), 'tắt đầu mục');
    const name = nmS('Phát sinh G13');
    const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: await sheetBody(testRun, A, 'VND', [priceLine(refs, it, 'shiftStorage', 200_000), priceLine(refs, it, 'customsFee', 1_000_000)], name) });
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expect(items(await data(await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { search: name } }))), 'Không tạo').toHaveLength(0);

  });

  test("BGM-014 Lưu nguyên khối thông tin chung + dòng giá", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G14', ['customsFee', 'overtime']);
    const name = nmS('Nguyên khối G14');
    const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: await sheetBody(testRun, A, 'VND', [priceLine(refs, it, 'customsFee', 1_000_000), priceLine(refs, it, 'overtime', -1)], name) });
    expectStatusIn(res, '400/422');
    expect(items(await data(await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { search: name } }))), 'Không tạo bảng, không tạo dòng').toHaveLength(0);

  });

  test("BGM-015 Bảng giá Tạo mới chưa sinh định mức", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G15', ['customsFee']);
    const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: await sheetBody(testRun, A, 'VND', linesOf(it, ['customsFee']), nmS('Chưa kích hoạt G15')) });
    expectStatusIn(res, '200/201');
    const s = await data(res);
    testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
    expect(await sbpLines(testRun, it.customsFee.id), 'Chưa có SBP vì bảng chưa Đang hoạt động').toHaveLength(0);

  });

  test("BGM-025 Số bảng giá theo trạng thái", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G25', ['storage']);
    await activeD(it, ['storage'], 'NT_D G25');
    await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D mới G25'));
    const res = await http.call('GET /api/purchase-prices/stats', { token: tok('k1'), query: { contractorId: D } });
    expectStatusIn(res, '200');
    const s = await data(res);
    const all: any[] = [];
    for (let page = 1; page <= 20; page++) {
      const d = await data(await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { contractorId: D, page, perPage: 100 } }));
      all.push(...items(d));
      if (page >= Number(d.meta.pagination.totalPages ?? 1)) break;
    }
    expect(Number(s.total), 'Tổng = số dòng danh sách cùng bộ lọc').toBe(all.length);
    for (const g of s.byStatus ?? []) expect(Number(g.count), `Số bảng ${g.status?.name}`).toBe(all.filter((x: any) => x.status?.code === g.status?.code).length);

    });

  });

  test("BGM-026 Lọc theo tìm kiếm", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const s = await draft(A, 'VND', [], 'Thống kê G26');
    const res = await http.call('GET /api/purchase-prices/stats', { token: tok('k1'), query: { search: s.code } });
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(Number(d.total)).toBe(1);
    const nonZero = (d.byStatus ?? []).filter((g: any) => Number(g.count) > 0);
    expect(nonZero, 'Chỉ trạng thái của bảng đó').toHaveLength(1);
    expect(Number(nonZero[0].count)).toBe(1);

  });

  test("BGM-033 Sửa thông tin chung bảng Tạo mới", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G33', ['customsFee']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee']), 'Sửa G33');
    const lines0 = stable(await LINES(s.id));
    const h0 = (await HIST(s.id)).length;
    const to = new Date(`${s.effectiveTo}T00:00:00Z`); to.setUTCMonth(to.getUTCMonth() - 1);
    const name = nmS('Sửa xong G33');
    const res = await http.call('PUT /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id }, json: putBody(s, { name, effectiveTo: to.toISOString().slice(0, 10) }) });
    expectStatusIn(res, '200/204');
    const now = await SHEET(s.id);
    expect(now.name).toBe(name);
    expect(now.effectiveTo).toBe(to.toISOString().slice(0, 10));
    expect(stable(await LINES(s.id)), 'Dòng giá giữ nguyên').toEqual(lines0);
    expect((await HIST(s.id)).length, 'Ghi lịch sử').toBeGreaterThan(h0);

  });

  test("BGM-034 Sửa bảng không ở Tạo mới", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G34', ['storage']);
    const sheet = await SHEET((await activeA(it, ['storage'])).id);
    const res = await http.call('PUT /api/purchase-prices/{id}', { token: tok('k1'), params: { id: sheet.id }, json: putBody(sheet, { name: nmS('Đổi tên G34') }) });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect((await SHEET(sheet.id)).name, 'Không đổi').toBe(sheet.name);

  });

  test("BGM-035 Bảng đang bị người khác khóa sửa", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ testRun, browser, roles }) => {
    test.setTimeout(900_000);
    await expect(runPendingLockApi("BGM-035", testRun, browser, roles), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("BGM-036 Không đổi dòng giá", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G36', (['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] as P0ItemKey[]));
    const s = await draft(A, 'VND', linesOf(it, (['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] as P0ItemKey[])), 'Sáu dòng G36');
    const before = stable((await LINES(s.id)).map((l: any) => [l.id, Number(l.unitPrice)]));
    const res = await http.call('PUT /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id }, json: putBody(s, { name: nmS('Đổi tên G36') }) });
    expectStatusIn(res, '200/204');
    const after = (await LINES(s.id)).map((l: any) => [l.id, Number(l.unitPrice)]);
    expect(after, 'Vẫn 6 dòng').toHaveLength(6);
    expect(stable(after), 'Đơn giá giữ nguyên').toEqual(before);

  });

  test("BGM-042 Xóa mềm bảng Tạo mới", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const s = await createSheet(testRun, A, 'VND', [], nmS('Xóa mềm G42'));
    const res = await http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } });
    expectStatusIn(res, '200/204');
    expect(items(await data(await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { search: s.code } }))).some((x: any) => x.id === s.id), 'Ẩn khỏi danh sách').toBe(false);
    const detail = await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } });
    expect(detail.status(), 'Không lỗi 5xx khi đọc bảng đã xóa mềm').toBeLessThan(500);
    const hist = await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id: s.id }, query: { page: 1, perPage: 50 } });
    test.info().annotations.push({ type: 'Ghi nhận', description: `Đọc lại bảng đã xóa mềm: HTTP ${detail.status()}; lịch sử HTTP ${hist.status()} ${JSON.stringify(items(await data(hist)).map(htext)).slice(0, 300)}` });
    if (hist.ok()) expect(items(await data(hist)).some((h: any) => /Xóa|DELETE/i.test(htext(h))), 'Ghi lịch sử xóa').toBe(true);

  });

  test("BGM-043 Vòng đời tạo → sửa → xóa mềm bảng giá", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const name = nmS('CRUD');
    const c = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: await sheetBody(testRun, A, 'VND', [], name) });
    expectStatusIn(c, '200/201/204', 'tạo');
    const s = await data(c);
    const renamed = nmS('CRUD sửa');
    expectStatusIn(await http.call('PUT /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id }, json: putBody(s, { name: renamed }) }), '200/201/204', 'sửa');
    const read = await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } });
    expectStatusIn(read, '200/201/204', 'đọc');
    expect((await data(read)).name, 'Đọc lại đúng tên mới').toBe(renamed);
    expectStatusIn(await http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }), '200/201/204', 'xóa mềm');
    const list = await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { search: s.code } });
    expectStatusIn(list, '200/201/204', 'danh sách');
    expect(items(await data(list)).some((x: any) => x.id === s.id), 'Sau xóa mềm không còn trong danh sách').toBe(false);

  });

  test("BGM-044 Xóa bảng Đang hoạt động", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G44', ['storage']);
    const act = await activeD(it, ['storage'], 'NT_D G44');
    const res = await http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: act.id } });
    expectStatusIn(res, '400/409/422');
    expect(isActiveSheet(await SHEET(act.id)), 'Vẫn Đang hoạt động').toBe(true);

    });

  });

  test("BGM-045 Bảng xóa mềm không còn đếm ở thống kê", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, tok, page }) => {

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
    const STATS = async () => data(await http.call('GET /api/purchase-prices/stats', { token: tok('k1'), query: { contractorId: D } }));
    const newCount = (s: any) => Number((s.byStatus ?? []).find((g: any) => isNew(g))?.count ?? 0);
    const s = await createSheet(testRun, D, 'VND', [], nmS('NT_D xóa G45'));
    const before = newCount(await STATS());
    const res = await http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } });
    expectStatusIn(res, '200/204');
    expect(newCount(await STATS()), 'Số Tạo mới giảm 1').toBe(before - 1);

    });

  });

  test("BGM-129 Phân trang trang 2 kích thước 1", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G129', ['customsFee', 'overtime']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee', 'overtime']), 'Phiên bản G129');
    const fee = await lineOf(s.id, it.customsFee.id);

    await must(await PUTL(s.id, fee, lineBody(fee, 1_100_000)), 'sửa giá lần 1');
    await must(await PUTL(s.id, await lineOf(s.id, it.customsFee.id), lineBody(fee, 1_150_000)), 'sửa giá lần 2');

    const p1 = await VERS(s.id, { page: 1, perPage: 1 });
    const res = await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id: s.id }, query: { page: 2, perPage: 1 } });
    expectStatusIn(res, '200');
    const p2 = await data(res);
    expect(items(p1)).toHaveLength(1);
    expect(items(p2)).toHaveLength(1);
    expect(items(p2)[0].id, 'Không trùng').not.toBe(items(p1)[0].id);
    expect(Number(p2.meta.pagination.total)).toBe(Number(p1.meta.pagination.total));
    expect(Number(items(p1)[0].versionNo), 'Mới nhất trước').toBeGreaterThan(Number(items(p2)[0].versionNo));

  });

  test("BGM-130 Chi tiết một phiên bản", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G130', ['customsFee', 'overtime']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee', 'overtime']), 'Phiên bản G130');
    const fee = await lineOf(s.id, it.customsFee.id);

    await must(await PUTL(s.id, fee, lineBody(fee, 1_100_000)), 'sửa giá');
    const older = items(await VERS(s.id)).find((v: any) => !v.current);
    if (!older) throw new Error('Chuẩn bị dữ liệu thất bại: chưa có phiên bản trước khi sửa giá');

    const r2 = await http.call('GET /api/purchase-prices/{id}/versions/{versionId}', { token: tok('k1'), params: { id: s.id, versionId: older.id } });
    expectStatusIn(r2, '200');
    const d = await data(r2);
    expect(JSON.stringify(d.sheet ?? {}), 'Thông tin chung tại thời điểm phiên bản').toContain(s.code);
    expect(Number(d.versionNo)).toBe(Number(older.versionNo));

  });

  test("BGM-022 Nguồn ô chọn Nhà thầu phụ trách", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const res = await http.call('GET /api/purchase-prices/contractors', { token: tok('k1'), query: { perPage: 200 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const a = list.find((c: any) => c.id === A);
    expect(a, 'Có NT_A').toBeTruthy();
    expect(a.contract?.id, 'Kèm HĐ hiệu lực').toBeTruthy();
    expect(list.some((c: any) => c.id === env.ref('CONTRACTOR_C_ID')), 'Không có NT_C').toBe(false);

  });

  test("BGM-029 Chi tiết bảng giá", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G29', ['storage', 'customsFee']);
    const sheet = await activeA(it, ['storage', 'customsFee']);
    await must(await setItemStatus(testRun, it.customsFee, 'INACTIVE'), 'tắt đầu mục');
    const res = await http.call('GET /api/purchase-prices/{id}', { token: tok('k1'), params: { id: sheet.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    for (const k of ['code', 'name', 'contractorId', 'effectiveFrom', 'effectiveTo', 'currency', 'status']) expect(d, `Thông tin chung: ${k}`).toHaveProperty(k);
    const lines = await LINES(sheet.id);
    expect(lines.some((l: any) => l.priceConfigurationItemId === it.storage.id), 'Có dòng giá').toBe(true);
    expect(lines.some((l: any) => l.priceConfigurationItemId === it.customsFee.id), 'Đầu mục bị tắt bị ẩn').toBe(false);

  });

  test("BGM-071 Lịch sử bảng giá", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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
    const it = await own('G71', ['storage']);
    const s = await createSheet(testRun, D, 'VND', linesOf(it, ['storage']), nmS('NT_D lịch sử G71'));
    await activateSheet(testRun, s.id);
    await changeLinePrice(testRun, s.id, it.storage.id, 520_000, true);
    const res = await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id: s.id }, query: { page: 1 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const at = list.map((h: any) => Date.parse(h.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((a, b) => b - a));
    const txt = list.map(htext);
    const iUpd = txt.findIndex((t: string) => /Cập nhật|dòng giá/i.test(t));
    const iAct = txt.findIndex((t: string) => /Kích hoạt/i.test(t));
    const iNew = txt.findIndex((t: string) => /Khởi tạo/i.test(t));
    expect(iUpd, `Có Cập nhật dòng giá (${txt.join(' | ')})`).toBeGreaterThanOrEqual(0);
    expect(iAct, 'Có Kích hoạt').toBeGreaterThan(iUpd);
    expect(iNew, 'Có Khởi tạo bảng giá').toBeGreaterThan(iAct);
    expect(JSON.stringify(list[iUpd]), 'Kèm giá cũ → mới').toMatch(/500[.,]?000[\s\S]*520[.,]?000|520[.,]?000[\s\S]*500[.,]?000/);

    });

  });

  test("BGM-076 Lọc lịch sử theo thời gian, người thực hiện và phân trang", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G76', ['customsFee']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee']), 'Lịch sử G76');
    await must(await http.call('PUT /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id }, json: putBody(s, { name: nmS('Lịch sử sửa G76') }) }), 'K1 sửa tên');
    const l = await lineOf(s.id, it.customsFee.id);
    await must(await http.call('PUT /api/purchase-prices/{id}/items/{itemId}', { token: tok('k1b'), params: { id: s.id, itemId: l.id }, json: { unitCode: l.unitCode, unitPrice: 1_050_000, customsOfficeCode: l.customsOfficeCode, tradeTypeCode: l.tradeTypeCode, cargoGroupCode: l.cargoGroupCode, vehicleTypeCode: l.vehicleTypeCode } }), 'K1B sửa giá');
    const me = await data(await http.call('GET /api/auth/me', { token: tok('k1') }));
    const myId = me?.id ?? me?.userId;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const from = start.toISOString();
    const to = new Date(Date.now() + 60_000).toISOString();
    const res = await http.call('GET /api/purchase-prices/{id}/history', { token: tok('k1'), params: { id: s.id }, query: { from, to, actorUserId: myId, page: 1, perPage: 2 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.length, 'Tối đa 2 bản ghi').toBeLessThanOrEqual(2);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((h: any) => h.actorUserId === myId), 'Chỉ bản ghi của người đó').toBe(true);
    expect(list.every((h: any) => Date.parse(h.at) >= Date.parse(from) && Date.parse(h.at) <= Date.parse(to)), 'Trong khoảng').toBe(true);
    const at = list.map((h: any) => Date.parse(h.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((a, b) => b - a));

  });

  test("BGM-124 Nhật ký phiên bản bảng giá", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G124', ['customsFee', 'overtime']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee', 'overtime']), 'Phiên bản G124');
    const fee = await lineOf(s.id, it.customsFee.id);

    await must(await PUTL(s.id, fee, lineBody(fee, 1_100_000)), 'sửa giá lần 1');
    await must(await PUTL(s.id, await lineOf(s.id, it.customsFee.id), lineBody(fee, 1_150_000)), 'sửa giá lần 2');

    const res = await http.call('GET /api/purchase-prices/{id}/versions', { token: tok('k1'), params: { id: s.id }, query: { page: 1 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const no = list.map((v: any) => Number(v.versionNo));
    expect(no, 'Mới nhất trước').toEqual([...no].sort((a, b) => b - a));
    expect(list[0].current, 'current = hiện tại').toBe(true);
    expect(list.filter((v: any) => v.current)).toHaveLength(1);

  });

  test("BGM-135 Dòng giá của một phiên bản", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G135', ['customsFee', 'overtime']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee', 'overtime']), 'Phiên bản G135');
    const fee = await lineOf(s.id, it.customsFee.id);

    await must(await PUTL(s.id, fee, lineBody(fee, 1_100_000)), 'Phí khai báo 1.000.000 → 1.100.000');
    const older = items(await VERS(s.id)).find((v: any) => !v.current);
    if (!older) throw new Error('Chuẩn bị dữ liệu thất bại: chưa có phiên bản trước khi sửa giá');

    const res = await http.call('GET /api/purchase-prices/{id}/versions/{versionId}/items', { token: tok('k1'), params: { id: s.id, versionId: older.id }, query: { serviceTypeCode: refs.services.KHQ, perPage: 100 } });
    expectStatusIn(res, '200');
    const its = items(await data(res));
    const f = its.find((x: any) => x.priceConfigurationItemId === it.customsFee.id || String(x.priceConfigurationItemName ?? '').includes('Phí khai báo'));
    expect(f, 'Có dòng Phí khai báo').toBeTruthy();
    expectMoney(f.unitPrice, 1_000_000, 'Giá tại phiên bản');

  });

  test("BGM-141 Phân trang trang 2 kích thước 1", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('G141', ['customsFee', 'overtime']);
    const s = await draft(A, 'VND', linesOf(it, ['customsFee', 'overtime']), 'Phiên bản G141');
    const fee = await lineOf(s.id, it.customsFee.id);

    await must(await PUTL(s.id, fee, lineBody(fee, 1_100_000)), 'Phí khai báo 1.000.000 → 1.100.000');
    const older = items(await VERS(s.id)).find((v: any) => !v.current);
    if (!older) throw new Error('Chuẩn bị dữ liệu thất bại: chưa có phiên bản trước khi sửa giá');

    const PAGE = (page: number) => http.call('GET /api/purchase-prices/{id}/versions/{versionId}/items', { token: tok('k1'), params: { id: s.id, versionId: older.id }, query: { page, perPage: 1 } });
    const p1 = await data(await PAGE(1));
    const res = await PAGE(2);
    expectStatusIn(res, '200');
    const p2 = await data(res);
    expect(items(p1)).toHaveLength(1);
    expect(items(p2)).toHaveLength(1);
    expect(JSON.stringify(items(p2)[0]), 'Không trùng').not.toBe(JSON.stringify(items(p1)[0]));
    expect(Number(p2.meta.pagination.total)).toBe(Number(p1.meta.pagination.total));

  });
});
