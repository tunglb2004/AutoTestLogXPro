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
import * as F_gia_mua_dinh_muc_gia_mua_dinh_muc from '../../../src/gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua định mức (SBP)", () => {
  test("SBP-010 Thiếu tham số bắt buộc `priceConfigurationItemId`", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices";
    const p = await testRun.prepare(API, "cc");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["priceConfigurationItemId"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("SBP-011 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@gia-mua-dinh-muc", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/standard-buying-prices";
    const p = await testRun.prepare(API, "cc");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(Array.isArray(list), "perPage=1 vẫn trả danh sách hợp lệ").toBe(true);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("SBP-032 Thiếu trường bắt buộc `items`", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/standard-buying-prices/benchmarks";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_gia_mua_dinh_muc_gia_mua_dinh_muc.bodies[API]();
    delete payload["items"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "items");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("SBP-033 `items[].sellingPrice` (giá mua định mức) 0,01 / 0 / âm", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S33', ['customsFee', 'overtime', 'supervision']);
    const [a, o, s] = await Promise.all([sbpOf(it.customsFee.id), sbpOf(it.overtime.id), sbpOf(it.supervision.id)]);
    expectStatusIn(await BULKB([{ id: a.id, sellingPrice: 1_000_000 }, { id: o.id, sellingPrice: 300_000 }, { id: s.id, sellingPrice: 0.01 }]), '200/204', 'lô có 0,01');
    const snap = async () => stable(await Promise.all([a, o, s].map(async (x, i) => (await sbpOf([it.customsFee.id, it.overtime.id, it.supervision.id][i])).benchmarkPrice)));
    const after1 = await snap();
    expect(after1).toEqual(stable([1_000_000, 300_000, 0.01]));
    expectStatusIn(await BULKB([{ id: a.id, sellingPrice: 1_100_000 }, { id: s.id, sellingPrice: 0 }]), '400/422', 'lô có 0');
    expect(await snap(), 'Không lưu dòng nào của lô có 0').toEqual(after1);
    expectStatusIn(await BULKB([{ id: a.id, sellingPrice: 1_100_000 }, { id: s.id, sellingPrice: -1 }]), '400/422', 'lô có âm');
    expect(await snap(), 'Không lưu dòng nào của lô có âm').toEqual(after1);

  });

  test("SBP-047 Thiếu tham số bắt buộc `query`", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/{id}/history";
    const p = await testRun.prepare(API, "cc");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["query"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("SBP-048 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@gia-mua-dinh-muc", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/standard-buying-prices/{id}/history";
    const p = await testRun.prepare(API, "cc");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(Array.isArray(list), "perPage=1 vẫn trả danh sách hợp lệ").toBe(true);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("SBP-004 Thiếu tham số bắt buộc `serviceTypeCode`", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/groups";
    const p = await testRun.prepare(API, "cc");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["serviceTypeCode"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("SBP-006 Gọi sai phương thức HTTP", { tag: ["@api", "@gia-mua-dinh-muc", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/groups";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("SBP-013 Gọi sai phương thức HTTP", { tag: ["@api", "@gia-mua-dinh-muc", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("SBP-015 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/{id}";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("SBP-017 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/{id}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("SBP-019 Giá mua định mức 0,01 / 0 / -1", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const it = await withLines('S19', ['customsFee']);
    const s = await sbpOf(it.customsFee.id);
    await setBenchmark(testRun, s.id, 1_000_000);
    for (const [v, set] of [[0.01, '200/204'], [0, '400/422'], [-1, '400/422']] as [number, string][]) expectStatusIn(await BENCH(s.id, v), set, `giá ${v}`);
    expect(Number((await sbpOf(it.customsFee.id)).benchmarkPrice), 'Giá giữ 0,01').toBe(0.01);

  });

  test("SBP-025 Thiếu trường bắt buộc `benchmarkPrice`", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/standard-buying-prices/{id}/benchmark";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_gia_mua_dinh_muc_gia_mua_dinh_muc.bodies[API]();
    delete payload["benchmarkPrice"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "benchmarkPrice");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("SBP-027 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/standard-buying-prices/{id}/benchmark";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{ json: F_gia_mua_dinh_muc_gia_mua_dinh_muc.bodies["PUT /api/standard-buying-prices/{id}/benchmark"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("SBP-035 Body JSON hỏng cú pháp", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/standard-buying-prices/benchmarks";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("SBP-037 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/{id}/contractors";
    const p = await testRun.prepare(API, "cc");
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("SBP-039 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/{id}/contractors";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("SBP-043 Thiếu trường bắt buộc `source`", { tag: ["@api", "@gia-mua-dinh-muc", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/standard-buying-prices/{id}/conversion";
    const p = await testRun.prepare(API, "cc");
    const payload: Record<string, unknown> = F_gia_mua_dinh_muc_gia_mua_dinh_muc.bodies[API]();
    delete payload["source"];
    const before = await testRun.snapshot(API, p.params ?? {}, "cc");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "source");
    expect(await testRun.snapshot(API, p.params ?? {}, "cc"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("SBP-045 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/standard-buying-prices/{id}/conversion";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{ json: F_gia_mua_dinh_muc_gia_mua_dinh_muc.bodies["PUT /api/standard-buying-prices/{id}/conversion"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("SBP-050 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dinh-muc", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/standard-buying-prices/{id}/history";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
