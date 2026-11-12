import { runPendingAllApi } from '../../../src/gia-mua-dau-vao/data/pending-api-cases';
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

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua định mức (SBP)", () => {
  test("SBP-002 Đầu mục của phân hệ kèm số dòng định mức", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const on = await withLines('S2', ['freight']);
    const off = await withLines('S2X', ['freight']);
    await must(await setItemStatus(testRun, off.freight, 'INACTIVE'), 'tắt đầu mục');
    const res = await http.call('GET /api/standard-buying-prices/groups', { token: tok('cc'), query: { serviceTypeCode: refs.services.VT, perPage: 200 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const g = list.find((x: any) => x.id === on.freight.id);
    expect(g, 'Có đầu mục Vận tải đang bật').toBeTruthy();
    expect(Number(g.rowCount), 'Kèm số SBP').toBe((await sbpLines(testRun, on.freight.id)).length);
    expect(list.some((x: any) => x.id === off.freight.id), 'Đầu mục Tắt bị ẩn').toBe(false);

  });

  test("SBP-003 Đổi phân hệ", { tag: ["@api", "@gia-mua-dinh-muc", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    await withLines('S3', ['storage']);
    const res = await http.call('GET /api/standard-buying-prices/groups', { token: tok('cc'), query: { serviceTypeCode: refs.services.KB, perPage: 200 } });
    expectStatusIn(res, '200');
    const kbIds = new Set(((await configOf(testRun, 'KB')).items ?? []).map((i: any) => i.id));
    const list = items(await data(res));
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((x: any) => kbIds.has(x.id)), 'Chỉ đầu mục Kho bãi').toBe(true);

  });

  test("SBP-007 Danh sách SBP của đầu mục", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S7', ['freight']);
    const res = await http.call('GET /api/standard-buying-prices', { token: tok('cc'), query: { priceConfigurationItemId: it.freight.id, benchmarkSet: false } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.length, 'Có SBP tổ hợp Hữu Nghị → Hà Nội, 40ft').toBeGreaterThan(0);
    for (const s of list) {
      expect(s.benchmarkMissing, 'Chưa có giá').toBe(true);
      expect(String(s.code), 'Mã SBP-NNNN').toMatch(/^SBP-\d{4,}$/);
    }

  });

  test("SBP-008 Sắp xếp theo giá mua định mức", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await fourCombos('S8');
    const all = await sbpLines(testRun, it.customsFee.id);
    expect(all.length, 'Tiền điều kiện: 4 SBP').toBe(4);
    await setBenchmark(testRun, all[0].id, 900_000);
    await setBenchmark(testRun, all[1].id, 1_100_000);
    await setBenchmark(testRun, all[2].id, 1_000_000);
    const res = await http.call('GET /api/standard-buying-prices', { token: tok('cc'), query: { priceConfigurationItemId: it.customsFee.id, sortBy: 'BUYING', highestFirst: true } });
    expectStatusIn(res, '200');
    const prices = items(await data(res)).map((s: any) => (s.benchmarkPrice == null ? null : Number(s.benchmarkPrice)));
    expect(prices, 'Giảm dần, dòng null ở cuối').toEqual([1_100_000, 1_000_000, 900_000, null]);

  });

  test("SBP-009 \"Tất cả\" và giá trị cụ thể là 2 tổ hợp riêng", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingAllApi("SBP-009", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("SBP-020 Giá phải &gt; 0", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S20', ['customsFee']);
    const s = await sbpOf(it.customsFee.id);
    await setBenchmark(testRun, s.id, 1_000_000);
    const res = await BENCH(s.id, 0);
    expectStatusIn(res, '400/422');
    expectMoney((await sbpOf(it.customsFee.id)).benchmarkPrice, 1_000_000, 'Giá không đổi');

  });

  test("SBP-021 Đổi giá mua giữ nguyên giá bán, tính lại lợi nhuận", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S21', ['customsFee']);
    const s = await sbpOf(it.customsFee.id);
    await setBenchmark(testRun, s.id, 1_000_000);
    await setSelling(testRun, (await sspOf(it.customsFee.id)).id, 1_200_000);
    const res = await BENCH(s.id, 1_050_000);
    expectStatusIn(res, '200/204');
    const ssp = await sspOf(it.customsFee.id);
    expectMoney(ssp.sellingPrice, 1_200_000, 'SSP giữ giá bán');
    expectPercent(ssp.profitPercent, 14.29, 2, 'Lợi nhuận tính lại');
    expect(ssp.needsAttention, 'Cảnh báo giá mua đã thay đổi').toBe(true);

  });

  test("SBP-022 Đổi giá mua không làm Hết hạn dòng báo giá", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const base = await buildP0(testRun, `S22${TEST_RUN_ID}`);
    const res = await BENCH(base.sbp.customsFee!, 1_050_000);
    expectStatusIn(res, '200/204');
    const iq = await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: base.rfqId } }));
    expect((iq.lines ?? []).filter((l: any) => l.expired), 'BGNB không dòng nào Hết hạn').toHaveLength(0);
    expect(expiredLines(await getCustomerQuotation(testRun, base.rcId)), 'BGKH không dòng nào Hết hạn').toHaveLength(0);

  });

  test("SBP-023 SBP thuộc đầu mục tắt không sửa được", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S23', ['customsFee']);
    const s = await sbpOf(it.customsFee.id);
    await must(await setItemStatus(testRun, it.customsFee, 'INACTIVE'), 'tắt đầu mục');
    const res = await BENCH(s.id, 1);
    expectStatusIn(res, '404/409');

  });

  test("SBP-024 Chỉ giá mua định mức đổi", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S24', ['freight']);
    const s = await sbpOf(it.freight.id);
    const keep = ({ benchmarkPrice: _a, benchmarkMissing: _b, needsAttention: _c, ...rest }: any) => stable(rest);
    const res = await BENCH(s.id, 9_500_000);
    expectStatusIn(res, '200/204');
    expect(keep(await sbpOf(it.freight.id)), 'Thuộc tính, ĐVT, mã giữ nguyên').toEqual(keep(s));

  });

  test("SBP-028 Nhập hàng loạt giá mua định mức", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S28', SIX);
    const rows = await Promise.all(SIX.map(async (k) => ({ k, s: await sbpOf(it[k].id) })));

    const h0 = await Promise.all(rows.map((r) => HISTB(r.s.id)));
    const res = await BULKB(rows.map((r) => ({ id: r.s.id, sellingPrice: it0(r.k).sbp })));
    expectStatusIn(res, '200/204');
    expect(((await data(res))?.updated ?? []).length, 'Đã cập nhật 6 dòng').toBe(6);
    for (let i = 0; i < rows.length; i++) {
      expectMoney((await sbpOf(it[rows[i].k].id)).benchmarkPrice, it0(rows[i].k).sbp!, it0(rows[i].k).name);
      expect((await HISTB(rows[i].s.id)).length, `${it0(rows[i].k).name}: 1 bản ghi lịch sử riêng`).toBe(h0[i].length + 1);
    }
    test.info().annotations.push({ type: 'Ghi nhận', description: `Thông báo: ${(await body(res)).message}` });

  });

  test("SBP-029 Dòng đã có giá không được xóa trắng", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S29', ['customsFee', 'overtime']);
    const a = await sbpOf(it.customsFee.id);
    const o = await sbpOf(it.overtime.id);
    await setBenchmark(testRun, a.id, 1_000_000);
    const res = await BULKB([{ id: a.id, sellingPrice: null }, { id: o.id, sellingPrice: 300_000 }]);
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expectMoney((await sbpOf(it.customsFee.id)).benchmarkPrice, 1_000_000, 'Dòng đã có giá giữ nguyên');
    expect((await sbpOf(it.overtime.id)).benchmarkMissing, 'Không lưu dòng nào').toBe(true);

  });

  test("SBP-030 Field body tên `sellingPrice` trong `items`", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S30', ['customsFee']);
    const s = await sbpOf(it.customsFee.id);
    const res = await BULKB([{ id: s.id, sellingPrice: 1_000_000 }]);
    expectStatusIn(res, '200/204');
    expectMoney((await sbpOf(it.customsFee.id)).benchmarkPrice, 1_000_000, 'Giá lưu vào giá mua định mức');
    test.info().annotations.push({ type: 'Điểm cần xác nhận', description: 'Swagger đặt tên items[].sellingPrice cho giá mua định mức khi nhập hàng loạt' });

  });

  test("SBP-031 Id dòng định mức chưa từng tồn tại trong lô", { tag: ["@api", "@gia-mua-dinh-muc", "@p1", "@cho-xac-nhan"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S31', SIX);
    const rows = await Promise.all(SIX.map(async (k) => ({ k, s: await sbpOf(it[k].id) })));

    const before = stable(await Promise.all(rows.map(async (r) => (await sbpOf(it[r.k].id)).benchmarkPrice ?? null)));
    const res = await BULKB([...rows.map((r) => ({ id: r.s.id, sellingPrice: it0(r.k).sbp })), { id: uuid(), sellingPrice: 100_000 }]);
    expectStatusIn(res, '400/404');
    test.info().annotations.push({ type: 'Chờ xác nhận', description: 'Id dòng định mức chưa từng tồn tại trong lô' });
    expect(stable(await Promise.all(rows.map(async (r) => (await sbpOf(it[r.k].id)).benchmarkPrice ?? null))), 'Không dòng nào đổi giá').toEqual(before);

  });

  test("SBP-040 Chọn tỷ giá thủ công để quy đổi", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('S40', ['freight']);
    await ensureContractorLines(testRun, A, 'VND', [priceLine(refs, it, 'freight', 9_500_000)], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
    await ensureContractorLines(testRun, B, 'USD', [priceLine(refs, it, 'freight', 400)], `AT Bảng giá NT_B ${TEST_RUN_ID}`);
    const s = await sbpOf(it.freight.id);
    await setBenchmark(testRun, s.id, 9_500_000);
    const CONV = (json: Record<string, unknown>) => http.call('PUT /api/standard-buying-prices/{id}/conversion', { token: tok('cc'), params: { id: s.id }, json });

    const res = await CONV({ source: 'MANUAL', rates: [{ currency: 'USD', rate: 25_000 }] });
    expectStatusIn(res, '200/204');
    const b = ((await data(res)).contractors ?? []).find((c: any) => c.contractorId === B);
    expectMoney(b.converted, 10_000_000, 'NT_B quy đổi');
    expectMoney(b.againstBenchmark, 500_000, 'So với định mức +500.000');
    expectMoney((await sbpOf(it.freight.id)).benchmarkPrice, 9_500_000, 'Giá định mức không đổi');

  });

  test("SBP-041 Nguồn VCB", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('S41', ['freight']);
    await ensureContractorLines(testRun, A, 'VND', [priceLine(refs, it, 'freight', 9_500_000)], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
    await ensureContractorLines(testRun, B, 'USD', [priceLine(refs, it, 'freight', 400)], `AT Bảng giá NT_B ${TEST_RUN_ID}`);
    const s = await sbpOf(it.freight.id);
    await setBenchmark(testRun, s.id, 9_500_000);
    const CONV = (json: Record<string, unknown>) => http.call('PUT /api/standard-buying-prices/{id}/conversion', { token: tok('cc'), params: { id: s.id }, json });

    const res = await CONV({ source: 'VCB' });
    expectStatusIn(res, '200/204');
    expect(String((await data(res)).fxSource), 'Dùng tỷ giá VCB').toMatch(/VCB/i);

  });

  test("SBP-042 Không đổi giá mua định mức", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('S42', ['freight']);
    await ensureContractorLines(testRun, A, 'VND', [priceLine(refs, it, 'freight', 9_500_000)], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
    await ensureContractorLines(testRun, B, 'USD', [priceLine(refs, it, 'freight', 400)], `AT Bảng giá NT_B ${TEST_RUN_ID}`);
    const s = await sbpOf(it.freight.id);
    await setBenchmark(testRun, s.id, 9_500_000);
    const CONV = (json: Record<string, unknown>) => http.call('PUT /api/standard-buying-prices/{id}/conversion', { token: tok('cc'), params: { id: s.id }, json });

    const res = await CONV({ source: 'MANUAL', rates: [{ currency: 'USD', rate: 26_000 }] });
    expectStatusIn(res, '200/204');
    expectMoney((await sbpOf(it.freight.id)).benchmarkPrice, 9_500_000, 'benchmarkPrice giữ 9.500.000');

  });

  test("SBP-051 Lọc lịch sử theo thời gian, người thực hiện và phân trang", { tag: ["@api", "@gia-mua-dinh-muc", "@p3"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S51', ['customsFee']);
    const s = await sbpOf(it.customsFee.id);
    await must(await BENCH(s.id, 1_000_000), 'CC lần 1');
    await must(await BENCH(s.id, 1_050_000), 'CC lần 2');
    await must(await BENCH(s.id, 1_080_000, 'admin'), 'người thứ 2');
    const myId = await meId('cc');
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const from = start.toISOString();
    const to = new Date(Date.now() + 60_000).toISOString();
    const res = await http.call('GET /api/standard-buying-prices/{id}/history', { token: tok('cc'), params: { id: s.id }, query: { from, to, actorUserId: myId, page: 1, perPage: 2 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    expect(list.length).toBeGreaterThan(0);
    expect(list.length, 'Tối đa 2 bản ghi').toBeLessThanOrEqual(2);
    expect(list.every((h: any) => h.actorUserId === myId), 'Chỉ bản ghi của người đó').toBe(true);
    expect(list.every((h: any) => Date.parse(h.at) >= Date.parse(from) && Date.parse(h.at) <= Date.parse(to)), 'Trong khoảng').toBe(true);
    const at = list.map((h: any) => Date.parse(h.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((a, b) => b - a));

  });

  test("SBP-052 Dòng bị xóa do đồng bộ giữa phiên: lưu phần còn lại", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S52', ['customsFee', 'overtime', 'storage']);
    const [a, o, k] = await Promise.all([sbpOf(it.customsFee.id), sbpOf(it.overtime.id), sbpOf(it.storage.id)]);
    const sheet = await activeSheetOf(testRun, A);
    const kbLine = items(await data(await http.call('GET /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, query: { priceConfigurationItemId: it.storage.id } })))[0];
    await must(await http.call('DELETE /api/purchase-prices/{id}/items/{itemId}', { token: tok('k1'), params: { id: sheet.id, itemId: kbLine.id } }), 'dòng KB mất nguồn cuối');
    const res = await BULKB([{ id: a.id, sellingPrice: 1_000_000 }, { id: o.id, sellingPrice: 300_000 }, { id: k.id, sellingPrice: 500_000 }]);
    expectStatusIn(res, '200/204');
    expectMoney((await sbpOf(it.customsFee.id)).benchmarkPrice, 1_000_000, 'Dòng còn lại 1 được lưu');
    expectMoney((await sbpOf(it.overtime.id)).benchmarkPrice, 300_000, 'Dòng còn lại 2 được lưu');
    expect((await data(res)).missing ?? [], 'Báo 1 dòng không còn tồn tại').toContain(k.id);
    expect(await sbpLines(testRun, it.storage.id), 'Không tạo lại id đã mất').toHaveLength(0);
    test.info().annotations.push({ type: 'Ghi nhận', description: `Thông báo: ${(await body(res)).message}` });

  });

  test("SBP-053 Đầu mục bị tắt giữa phiên: dòng thuộc đầu mục không được lưu", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S53', ['customsFee', 'overtime', 'supervision']);
    const [a, o, s] = await Promise.all([sbpOf(it.customsFee.id), sbpOf(it.overtime.id), sbpOf(it.supervision.id)]);
    const rejectedHistory = async () => items(await must(await http.call('GET /api/standard-buying-prices/{id}/history', {
      token: tok('cc'), params: { id: s.id }, query: { page: 1, perPage: 100 },
    }), 'đọc lịch sử dòng giá bị loại'));
    const rejectedDetail = async () => {
      const detail = await must(await http.call('GET /api/standard-buying-prices/{id}', {
        token: tok('cc'), params: { id: s.id },
      }), 'đọc dòng giá bị loại');
      return detail.line ?? detail;
    };
    await must(await setItemStatus(testRun, it.supervision, 'INACTIVE'), 'tắt đầu mục giữa phiên');
    const previous = await rejectedDetail();
    expect(previous).toHaveProperty('benchmarkPrice');
    const historyBefore = stable(await rejectedHistory());
    const res = await BULKB([{ id: a.id, sellingPrice: 1_000_000 }, { id: o.id, sellingPrice: 300_000 }, { id: s.id, sellingPrice: 800_000 }]);
    expectStatusIn(res, '200/409');
    expectMoney((await sbpOf(it.customsFee.id)).benchmarkPrice, 1_000_000, 'Dòng hợp lệ 1 lưu');
    expectMoney((await sbpOf(it.overtime.id)).benchmarkPrice, 300_000, 'Dòng hợp lệ 2 lưu');
    if (res.status() === 200) {
      expect((await data(res)).deactivated ?? [], 'Dòng thuộc đầu mục tắt bị loại').toContain(s.id);
    } else {
      await expectApiError(res);
    }
    expect((await rejectedDetail()).benchmarkPrice).toBe(previous.benchmarkPrice);
    expect(stable(await rejectedHistory()), 'Không có lịch sử mới cho dòng bị loại').toEqual(historyBefore);

  });

  test("SBP-054 Dòng không đổi giá không ghi lịch sử", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S54', ['customsFee', 'overtime', 'supervision']);
    const [a, o, s] = await Promise.all([sbpOf(it.customsFee.id), sbpOf(it.overtime.id), sbpOf(it.supervision.id)]);
    await must(await BULKB([{ id: a.id, sellingPrice: 1_000_000 }, { id: o.id, sellingPrice: 300_000 }, { id: s.id, sellingPrice: 800_000 }]), 'đặt giá ban đầu');
    const h0 = await Promise.all([a, o, s].map((x) => HISTB(x.id)));
    const res = await BULKB([{ id: a.id, sellingPrice: 1_050_000 }, { id: o.id, sellingPrice: 300_000 }, { id: s.id, sellingPrice: 800_000 }]);
    expectStatusIn(res, '200/204');
    const h1 = await Promise.all([a, o, s].map((x) => HISTB(x.id)));
    expect(h1[0].length, 'Dòng đổi giá có 1 bản ghi mới').toBe(h0[0].length + 1);
    expect(h1[1].length, 'Dòng gửi lại giá cũ không có bản ghi mới').toBe(h0[1].length);
    expect(h1[2].length, 'Dòng gửi lại giá cũ không có bản ghi mới').toBe(h0[2].length);
    expect((await data(res)).unchanged ?? []).toEqual(expect.arrayContaining([o.id, s.id]));

  });

  test("SBP-014 Chi tiết SBP, mở là tắt cảnh báo", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S14', ['customsFee']);
    const s = await sbpOf(it.customsFee.id);
    await setBenchmark(testRun, s.id, 1_000_000);
    const sheet = await activeSheetOf(testRun, A);
    await changeLinePrice(testRun, sheet.id, it.customsFee.id, 1_050_000, true);
    expect((await sbpOf(it.customsFee.id)).needsAttention, 'Tiền điều kiện: needsAttention = true').toBe(true);
    const res = await http.call('GET /api/standard-buying-prices/{id}', { token: tok('cc'), params: { id: s.id } });
    expectStatusIn(res, '200');
    expect((await data(res)).line?.id).toBe(s.id);
    expect((await sbpOf(it.customsFee.id)).needsAttention, 'Sau khi mở: needsAttention = false').toBe(false);

  });

  test("SBP-018 Nhập giá mua định mức", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S18', ['customsFee']);
    const s = await sbpOf(it.customsFee.id);
    const h0 = (await HISTB(s.id)).length;
    const res = await BENCH(s.id, 1_000_000);
    expectStatusIn(res, '200/204');
    expectMoney((await sbpOf(it.customsFee.id)).benchmarkPrice, 1_000_000, 'Giá hiệu lực ngay');
    const hist = await HISTB(s.id);
    expect(hist.length, 'Ghi lịch sử').toBe(h0 + 1);
    expect(JSON.stringify(hist[0]), 'Nội dung cũ → mới').toMatch(/1[.,]?000[.,]?000/);
    expectMoney((await sspOf(it.customsFee.id)).benchmarkPrice, 1_000_000, 'SSP tương ứng nhận giá mua mới');

  });

  test("SBP-036 Bảng giá nhà thầu của SBP, quy đổi VCB", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await own('S36', ['freight']);
    await ensureContractorLines(testRun, A, 'VND', [priceLine(refs, it, 'freight', 9_500_000)], `AT Bảng giá NT_A ${TEST_RUN_ID}`);
    await ensureContractorLines(testRun, B, 'USD', [priceLine(refs, it, 'freight', 400)], `AT Bảng giá NT_B ${TEST_RUN_ID}`);
    const s = await sbpOf(it.freight.id);
    await setBenchmark(testRun, s.id, 9_500_000);
    const CONV = (json: Record<string, unknown>) => http.call('PUT /api/standard-buying-prices/{id}/conversion', { token: tok('cc'), params: { id: s.id }, json });

    const att0 = (await sbpOf(it.freight.id)).needsAttention;
    const res = await http.call('GET /api/standard-buying-prices/{id}/contractors', { token: tok('cc'), params: { id: s.id } });
    expectStatusIn(res, '200');
    const d = await data(res);
    const a = (d.contractors ?? []).find((c: any) => c.contractorId === A);
    const b = (d.contractors ?? []).find((c: any) => c.contractorId === B);
    expect(a && b, 'Trả 2 nhà thầu').toBeTruthy();
    expect(b).toHaveProperty('contractorTier');
    const usd = Number((d.rates ?? []).find((r: any) => r.currency === 'USD')?.rate);
    expectMoney(b.converted, 400 * usd, 'NT_B quy đổi = 400 × tỷ giá VCB');
    expectMoney(b.againstBenchmark, Number(b.converted) - 9_500_000, 'So với định mức = quy đổi − giá định mức');
    expect((await sbpOf(it.freight.id)).needsAttention, 'Không tắt cảnh báo').toBe(att0);

  });

  test("SBP-046 Lịch sử SBP", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S46', ['customsFee']);
    const s = await sbpOf(it.customsFee.id);
    await setBenchmark(testRun, s.id, 1_000_000);
    await setBenchmark(testRun, s.id, 1_050_000);
    const res = await http.call('GET /api/standard-buying-prices/{id}/history', { token: tok('cc'), params: { id: s.id }, query: { page: 1 } });
    expectStatusIn(res, '200');
    const list = items(await data(res));
    const at = list.map((h: any) => Date.parse(h.at));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((a, b) => b - a));
    expect(JSON.stringify(list[0]), 'Giá cũ → giá mới').toMatch(/1[.,]?000[.,]?000[\s\S]*1[.,]?050[.,]?000|1[.,]?050[.,]?000[\s\S]*1[.,]?000[.,]?000/);
    expect(list[0].actorName, 'Người thao tác').toBeTruthy();

  });
});
