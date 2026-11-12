/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { configOf, p0Items, setItemStatus } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { ensureContractorLines, priceLine, changeLinePrice, activeSheetOf } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { sbpLines, setBenchmark } from '../../../src/gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { sspLines, setSelling } from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { buildP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { rfqInPricing } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import { SspMap, createInternalQuote, issueInternalQuote } from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
import { createCustomerQuotation, setQuotationSettings, getCustomerQuotation, lineByName } from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as R_gia_mua_dinh_muc_gia_mua_dinh_muc from '../../../src/gia-mua-dinh-muc/api/schemas/gia-mua-dinh-muc.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua định mức (SBP)", () => {
  test("SBP-005 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/groups";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dinh_muc_gia_mua_dinh_muc.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "name", "priceTypeName", "rowCount"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("SBP-012 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dinh_muc_gia_mua_dinh_muc.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "code", "priceConfigurationItemId", "priceConfigurationItemCode", "priceConfigurationItemName", "serviceTypeCode", "serviceTypeName", "priceTypeName", "originPointName", "destinationPointName", "warehouseName", "warehouseTypeName", "customsOfficeName", "tradeTypeName"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("SBP-016 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/{id}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dinh_muc_gia_mua_dinh_muc.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["line", "fxSource", "fxCurrency", "fxUpdatedAt", "fxRates", "contractors"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("SBP-026 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const it0 = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!;
    const SIX: P0ItemKey[] = ['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'];
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    /** Đầu mục riêng + dòng NT_A (VND, giá P0) trong bảng NT_A Đang hoạt động → SBP/SSP null của riêng case. */
    const withLines = async (tag: string, keys: P0ItemKey[]) => {
      const it = await own(tag, keys);
      await ensureContractorLines(testRun, A, 'VND', keys.map((k) => priceLine(refs, it, k, it0(k).buyA!)), `AT Bảng giá NT_A ${TEST_RUN_ID}`);
      return it;
    };
    const sbpOf = async (itemId: string) => (await sbpLines(testRun, itemId))[0];
    const sspOf = async (itemId: string) => (await sspLines(testRun, itemId))[0];
    const SBPD = async (id: string) => data(await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id } }));
    const SSPD = async (id: string) => data(await http.call('GET /api/standard-selling-prices/{id}', { token: tok('cc'), params: { id } }));
    const HISTB = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/standard-buying-prices/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const HISTS = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/standard-selling-prices/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const BENCH = (id: string, benchmarkPrice: unknown, role: 'cc' | 'admin' = 'cc') => http.call('PUT /api/standard-buying-prices/{id}/benchmark', { token: tok(role), params: { id }, json: { benchmarkPrice } });
    const SELL = (id: string, sellingPrice: unknown, role: 'cc' | 'admin' = 'cc') => http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: tok(role), params: { id }, json: { sellingPrice } });
    const BULKB = (list: { id: string; sellingPrice: unknown }[]) => http.call('PUT /api/standard-buying-prices/benchmarks', { token: tok('cc'), json: { items: list } });
    const BULKS = (list: { id: string; sellingPrice: unknown }[]) => http.call('PUT /api/standard-selling-prices/selling-prices', { token: tok('cc'), json: { items: list } });
    const COMBO = async () => {
      const office2 = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code;
      const veh2 = (await testRun.catalog('GET /api/catalogues/vehicle-types')).find((v: any) => v.active !== false && v.code !== refs.vehicleType)?.code;
      if (!office2 || !veh2) throw new Error('Chuẩn bị dữ liệu thất bại: danh mục cần chi cục và loại xe thứ 2 đang hoạt động');
      return { office2, veh2 };
    };
    /** Đầu mục KHQ riêng có 4 tổ hợp (2 chi cục × 2 loại xe) → 4 SBP/SSP. */
    const fourCombos = async (tag: string) => {
      const { office2, veh2 } = await COMBO();
      const it = await own(tag, ['customsFee']);
      const sheet = await ensureContractorLines(testRun, A, 'VND', [], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
      await must(await http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, json: { priceConfigurationItemId: it.customsFee.id, unitCode: refs.units.customsFee, unitPrice: 1_000_000, customsOfficeCodes: [refs.customsOffice, office2], vehicleTypeCodes: [refs.vehicleType, veh2] } }), 'thêm 4 tổ hợp');
      return it;
    };
    const expiredLines = (cq: any) => (cq?.lines ?? []).filter((l: any) => l.expired);
    const meId = async (role: 'cc' | 'admin') => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const it = await withLines('S26', ['customsFee']);
    const res = await BENCH((await sbpOf(it.customsFee.id)).id, 1_000_000);
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['line', 'fxSource', 'fxCurrency', 'fxUpdatedAt', 'fxRates', 'contractors']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("SBP-034 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const it0 = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!;
    const SIX: P0ItemKey[] = ['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'];
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    /** Đầu mục riêng + dòng NT_A (VND, giá P0) trong bảng NT_A Đang hoạt động → SBP/SSP null của riêng case. */
    const withLines = async (tag: string, keys: P0ItemKey[]) => {
      const it = await own(tag, keys);
      await ensureContractorLines(testRun, A, 'VND', keys.map((k) => priceLine(refs, it, k, it0(k).buyA!)), `AT Bảng giá NT_A ${TEST_RUN_ID}`);
      return it;
    };
    const sbpOf = async (itemId: string) => (await sbpLines(testRun, itemId))[0];
    const sspOf = async (itemId: string) => (await sspLines(testRun, itemId))[0];
    const SBPD = async (id: string) => data(await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id } }));
    const SSPD = async (id: string) => data(await http.call('GET /api/standard-selling-prices/{id}', { token: tok('cc'), params: { id } }));
    const HISTB = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/standard-buying-prices/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const HISTS = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/standard-selling-prices/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const BENCH = (id: string, benchmarkPrice: unknown, role: 'cc' | 'admin' = 'cc') => http.call('PUT /api/standard-buying-prices/{id}/benchmark', { token: tok(role), params: { id }, json: { benchmarkPrice } });
    const SELL = (id: string, sellingPrice: unknown, role: 'cc' | 'admin' = 'cc') => http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: tok(role), params: { id }, json: { sellingPrice } });
    const BULKB = (list: { id: string; sellingPrice: unknown }[]) => http.call('PUT /api/standard-buying-prices/benchmarks', { token: tok('cc'), json: { items: list } });
    const BULKS = (list: { id: string; sellingPrice: unknown }[]) => http.call('PUT /api/standard-selling-prices/selling-prices', { token: tok('cc'), json: { items: list } });
    const COMBO = async () => {
      const office2 = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code;
      const veh2 = (await testRun.catalog('GET /api/catalogues/vehicle-types')).find((v: any) => v.active !== false && v.code !== refs.vehicleType)?.code;
      if (!office2 || !veh2) throw new Error('Chuẩn bị dữ liệu thất bại: danh mục cần chi cục và loại xe thứ 2 đang hoạt động');
      return { office2, veh2 };
    };
    /** Đầu mục KHQ riêng có 4 tổ hợp (2 chi cục × 2 loại xe) → 4 SBP/SSP. */
    const fourCombos = async (tag: string) => {
      const { office2, veh2 } = await COMBO();
      const it = await own(tag, ['customsFee']);
      const sheet = await ensureContractorLines(testRun, A, 'VND', [], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
      await must(await http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, json: { priceConfigurationItemId: it.customsFee.id, unitCode: refs.units.customsFee, unitPrice: 1_000_000, customsOfficeCodes: [refs.customsOffice, office2], vehicleTypeCodes: [refs.vehicleType, veh2] } }), 'thêm 4 tổ hợp');
      return it;
    };
    const expiredLines = (cq: any) => (cq?.lines ?? []).filter((l: any) => l.expired);
    const meId = async (role: 'cc' | 'admin') => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const it = await withLines('S34', SIX);
    const rows = await Promise.all(SIX.map(async (k) => ({ k, s: await sbpOf(it[k].id) })));

    const res = await BULKB(rows.map((r) => ({ id: r.s.id, sellingPrice: it0(r.k).sbp })));
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['updated', 'unchanged', 'missing', 'deactivated']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("SBP-038 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/{id}/contractors";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dinh_muc_gia_mua_dinh_muc.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["contractorCount", "ratesUnavailable", "rates", "contractors"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("SBP-044 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    const A = env.ref('CONTRACTOR_A_ID');
    const B = env.ref('CONTRACTOR_B_ID');
    const it0 = (k: P0ItemKey) => P0_ITEMS.find((i) => i.key === k)!;
    const SIX: P0ItemKey[] = ['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'];
    const own = (tag: string, only: P0ItemKey[]) => p0Items(testRun, `${tag}${TEST_RUN_ID}`, 'k1', only);
    /** Đầu mục riêng + dòng NT_A (VND, giá P0) trong bảng NT_A Đang hoạt động → SBP/SSP null của riêng case. */
    const withLines = async (tag: string, keys: P0ItemKey[]) => {
      const it = await own(tag, keys);
      await ensureContractorLines(testRun, A, 'VND', keys.map((k) => priceLine(refs, it, k, it0(k).buyA!)), `AT Bảng giá NT_A ${TEST_RUN_ID}`);
      return it;
    };
    const sbpOf = async (itemId: string) => (await sbpLines(testRun, itemId))[0];
    const sspOf = async (itemId: string) => (await sspLines(testRun, itemId))[0];
    const SBPD = async (id: string) => data(await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id } }));
    const SSPD = async (id: string) => data(await http.call('GET /api/standard-selling-prices/{id}', { token: tok('cc'), params: { id } }));
    const HISTB = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/standard-buying-prices/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const HISTS = async (id: string, query: Record<string, unknown> = {}) => items(await data(await http.call('GET /api/standard-selling-prices/{id}/history', { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const BENCH = (id: string, benchmarkPrice: unknown, role: 'cc' | 'admin' = 'cc') => http.call('PUT /api/standard-buying-prices/{id}/benchmark', { token: tok(role), params: { id }, json: { benchmarkPrice } });
    const SELL = (id: string, sellingPrice: unknown, role: 'cc' | 'admin' = 'cc') => http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: tok(role), params: { id }, json: { sellingPrice } });
    const BULKB = (list: { id: string; sellingPrice: unknown }[]) => http.call('PUT /api/standard-buying-prices/benchmarks', { token: tok('cc'), json: { items: list } });
    const BULKS = (list: { id: string; sellingPrice: unknown }[]) => http.call('PUT /api/standard-selling-prices/selling-prices', { token: tok('cc'), json: { items: list } });
    const COMBO = async () => {
      const office2 = (await testRun.catalog('GET /api/catalogues/customs-offices')).find((c: any) => c.active !== false && c.code !== refs.customsOffice)?.code;
      const veh2 = (await testRun.catalog('GET /api/catalogues/vehicle-types')).find((v: any) => v.active !== false && v.code !== refs.vehicleType)?.code;
      if (!office2 || !veh2) throw new Error('Chuẩn bị dữ liệu thất bại: danh mục cần chi cục và loại xe thứ 2 đang hoạt động');
      return { office2, veh2 };
    };
    /** Đầu mục KHQ riêng có 4 tổ hợp (2 chi cục × 2 loại xe) → 4 SBP/SSP. */
    const fourCombos = async (tag: string) => {
      const { office2, veh2 } = await COMBO();
      const it = await own(tag, ['customsFee']);
      const sheet = await ensureContractorLines(testRun, A, 'VND', [], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
      await must(await http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, json: { priceConfigurationItemId: it.customsFee.id, unitCode: refs.units.customsFee, unitPrice: 1_000_000, customsOfficeCodes: [refs.customsOffice, office2], vehicleTypeCodes: [refs.vehicleType, veh2] } }), 'thêm 4 tổ hợp');
      return it;
    };
    const expiredLines = (cq: any) => (cq?.lines ?? []).filter((l: any) => l.expired);
    const meId = async (role: 'cc' | 'admin') => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const it = await own('S44', ['freight']);
    await ensureContractorLines(testRun, A, 'VND', [priceLine(refs, it, 'freight', 9_500_000)], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
    await ensureContractorLines(testRun, B, 'USD', [priceLine(refs, it, 'freight', 400)], `AT Bảng giá NT_B ${TEST_RUN_ID}`);
    const s = await sbpOf(it.freight.id);
    await setBenchmark(testRun, s.id, 9_500_000);
    const CONV = (json: Record<string, unknown>) => http.call('PUT /api/standard-buying-prices/{id}/conversion', { token: tok('cc'), params: { id: s.id }, json });

    const res = await CONV({ source: 'MANUAL', rates: [{ currency: 'USD', rate: 25_000 }] });
    expectStatusIn(res, '200/204');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['line', 'fxSource', 'fxCurrency', 'fxUpdatedAt', 'fxRates', 'contractors']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });

  test("SBP-049 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/{id}/history";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_gia_mua_dinh_muc_gia_mua_dinh_muc.responses[API].data!.safeParse(b.data);
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
});
