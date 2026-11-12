/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, revenueOf, revenueTable, runService, performedP0, completedP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costLines, coordinate, startService, saveActuals, uploadActualDoc, completeService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { pnl, readXlsx, numbersIn, isXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Màn Chi phí – Doanh thu (báo cáo quản trị)", () => {
  test("CR-002 Danh sách phiếu kèm doanh thu, chi phí, lợi nhuận %", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const p0 = await performedP0(testRun);
    const p1 = await completedP0(testRun);
    const p2 = await p0Order(testRun, 'IN_PROGRESS');
    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const q = { status: ['PERFORMED', 'COMPLETED'], sortBy: 'MARGIN', descending: true };
    const res = await LIST(q);
    expectStatusIn(res, '200');
    const first = items(await data(res));
    expect(first.every((r: any) => ['PERFORMED', 'COMPLETED'].includes(r.status)), 'Chỉ trạng thái lọc').toBe(true);
    const m = first.map((r: any) => r.marginPercent).filter((x: any) => x != null).map(Number);
    expect(m, 'Sắp xếp lợi nhuận % giảm dần').toEqual([...m].sort((a, b) => b - a));
    const r0 = (await rows({ ...q, search: p0.code })).find((r: any) => r.serviceOrderId === p0.id);
    expect(r0, 'Có P0').toBeTruthy();
    expectMoney(r0.revenue, P0.orderRevenue, 'P0 doanh thu');
    expectMoney(r0.cost, P0.orderCost, 'P0 chi phí');
    expectPercent(r0.marginPercent, P0.orderMarginListPct, 2, 'P0 lợi nhuận %');
    expect((await rows({ ...q, search: p1.code })).some((r: any) => r.serviceOrderId === p1.id), 'Có P1').toBe(true);
    expect((await rows({ ...q, search: p2.code })).some((r: any) => r.serviceOrderId === p2.id), 'Không có P2').toBe(false);

  });

  test("CR-003 Khoảng doanh thu bao gồm biên", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok, page }) => {

    const p0 = await performedP0(testRun);
    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const at = P0.orderRevenue;
    const filtered = async (revenueFrom: number, revenueTo: number) => items(await must(await LIST({ revenueFrom, revenueTo, search: p0.code }), 'đọc báo cáo theo khoảng doanh thu'));
    const onBoundary = (await filtered(at, at)).find((row: any) => row.serviceOrderId === p0.id);
    expect(onBoundary, 'Có P0 khi cả hai cận bằng doanh thu của phiếu').toBeTruthy();
    expectMoney(onBoundary.revenue, at);
    for (const [from, to] of [[at - 2, at - 1], [at + 1, at + 2]]) {
      expect((await filtered(from, to)).some((row: any) => row.serviceOrderId === p0.id), 'P0 bị loại khi nằm ngoài khoảng').toBe(false);
    }

  });

  test("CR-004 Từ &gt; Đến", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, tok, page }) => {

    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const res = await LIST({ costFrom: 10, costTo: 1 });
    expectStatusIn(res, '400/422');
    await expectApiError(res);

  });

  test("CR-005 Lọc ngày hoàn thành loại phiếu chưa có ngày", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const p0 = await performedP0(testRun);
    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const res = await LIST({ completedFrom: today(), search: p0.code });
    expectStatusIn(res, '200');
    expect(items(await data(res)).some((r: any) => r.serviceOrderId === p0.id), 'Không có P0 (chưa có ngày hoàn thành)').toBe(false);

  });

  test("CR-006 Giá trị null ở cuối khi sắp xếp", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun, tok, page }) => {

    const p0 = await performedP0(testRun);
    const completed = await completedP0(testRun);
    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await must(await LIST({ ...query, page, perPage: 100 }), 'đọc trang báo cáo theo ngày hoàn thành');
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) return out;
      }
      throw new Error('Chưa đọc hết danh sách để đối chiếu thứ tự');
    };

    const res = await LIST({ sortBy: 'COMPLETED_AT', status: ['PERFORMED', 'COMPLETED'] });
    expectStatusIn(res, '200');
    const list = await all({ sortBy: 'COMPLETED_AT', status: ['PERFORMED', 'COMPLETED'] });
    const firstNull = list.findIndex((r: any) => r.completedAt === null);
    expect(firstNull, 'Có cả nhóm có ngày và nhóm null').toBeGreaterThan(0);
    const doneIndex = list.findIndex((r: any) => r.serviceOrderId === completed.id);
    expect(doneIndex, 'Phiếu đã hoàn thành có ngày và nằm trước nhóm null').toBeGreaterThanOrEqual(0);
    expect(doneIndex).toBeLessThan(firstNull);
    expect(Number.isFinite(Date.parse(list[doneIndex].completedAt))).toBe(true);
    expect(list.slice(firstNull).every((r: any) => r.completedAt === null), 'Giá trị null ở cuối').toBe(true);
    expect(list.findIndex((r: any) => r.serviceOrderId === p0.id), 'P0 nằm trong nhóm cuối').toBeGreaterThanOrEqual(firstNull);

  });

  test("CR-012 4 card tổng doanh thu, chi phí, lợi nhuận, biên", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const p0 = await performedP0(testRun);
    await completedP0(testRun);
    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const one = await http.call('GET /api/cost-revenue/orders/stats', { token: tok('cc'), query: { search: p0.code } });
    expectStatusIn(one, '200');
    const s0 = await data(one);
    expectMoney(s0.totalRevenue, P0.orderRevenue, 'Card doanh thu (chỉ P0)');
    expectMoney(s0.totalCost, P0.orderCost, 'Card chi phí (chỉ P0)');
    expectMoney(s0.totalProfit, P0.orderPnl, 'Card lợi nhuận (chỉ P0)');
    const q = { status: ['PERFORMED', 'COMPLETED'] };
    const s = await data(await http.call('GET /api/cost-revenue/orders/stats', { token: tok('cc'), query: q }));
    const list = await all(q);
    const sum = (f: string) => list.reduce((a: number, r: any) => a + Number(r[f] ?? 0), 0);
    expectMoney(s.totalRevenue, sum('revenue'), 'Tổng doanh thu = tổng các phiếu');
    expectMoney(s.totalCost, sum('cost'), 'Tổng chi phí = tổng các phiếu');
    expectMoney(s.totalProfit, sum('revenue') - sum('cost'), 'Tổng lợi nhuận');
    expectPercent(s.marginPercent, ((sum('revenue') - sum('cost')) / sum('revenue')) * 100, 2, 'Biên tính từ tổng (không lấy trung bình)');
    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'P1 (10.000.000 / 9.500.000) không dựng được từ bộ giá P0; kiểm quy tắc BR-05/BR-09 trên tập P0 và toàn bộ phiếu PERFORMED/COMPLETED' });

  });

  test("CR-013 Card không phụ thuộc phân trang", { tag: ["@api", "@chi-phi-doanh-thu", "@p2"] }, async ({ http, testRun, tok, page }) => {

    await performedP0(testRun);
    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const q = { status: ['PERFORMED', 'COMPLETED'] };
    const page1 = await data(await LIST({ ...q, perPage: 10 }));
    const res = await http.call('GET /api/cost-revenue/orders/stats', { token: tok('cc'), query: q });
    expectStatusIn(res, '200');
    const s = await data(res);
    expect(Number(s.orderCount), 'Số phiếu = tổng của bộ lọc, không theo trang').toBe(Number(page1.meta.pagination.total));
    const list = await all(q);
    expectMoney(s.totalRevenue, list.reduce((a: number, r: any) => a + Number(r.revenue ?? 0), 0), 'Tổng doanh thu tính trên mọi trang');

  });

  test("CR-014 Lọc không có kết quả", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, tok }) => {

    const res = await http.call('GET /api/cost-revenue/orders/stats', { token: tok('cc'), query: { customerId: [uuid()] } });
    expectStatusIn(res, '200');
    const s = await data(res);
    for (const k of ['totalRevenue', 'totalCost', 'totalProfit']) expectMoney(s[k] ?? 0, 0, k);
    expect(Number(s.orderCount ?? 0)).toBe(0);
    expect(s.marginPercent ?? null, 'Biên "—"').toBeNull();

  });

  test("CR-026 Không chọn phiếu thì xuất theo bộ lọc", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const p0 = await performedP0(testRun);
    const EXPORT = (json: Record<string, unknown>) => http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json });
    /** Dòng dữ liệu (có mã ORD) của sheet báo cáo. */
    const fileRows = async (res: any) => {
      const x = await readXlsx(await res.body(), 'BaoCao_ChiPhi_DoanhThu');
      const head = x.rows.find((r) => r.some((c) => /Doanh thu/i.test(String(c)))) ?? [];
      const col = (rx: RegExp) => head.findIndex((c) => rx.test(String(c)));
      return { x, head, col, data: x.rows.filter((r) => r.some((c) => /^ORD/i.test(String(c ?? '').trim()))) };
    };

    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const res = await EXPORT({ statuses: ['PERFORMED'] });
    expectStatusIn(res, '200/201');
    const f = await fileRows(res);
    const total = Number((await data(await LIST({ status: ['PERFORMED'], perPage: 1 }))).meta.pagination.total);
    expect(f.data.length, 'File gồm mọi phiếu PERFORMED').toBe(total);
    expect(f.data.some((r) => r.some((c) => String(c).includes(p0.code))), 'Có P0').toBe(true);

  });

  test("CR-027 Không có dữ liệu", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, tok }) => {

    const EXPORT = (json: Record<string, unknown>) => http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json });
    /** Dòng dữ liệu (có mã ORD) của sheet báo cáo. */
    const fileRows = async (res: any) => {
      const x = await readXlsx(await res.body(), 'BaoCao_ChiPhi_DoanhThu');
      const head = x.rows.find((r) => r.some((c) => /Doanh thu/i.test(String(c)))) ?? [];
      const col = (rx: RegExp) => head.findIndex((c) => rx.test(String(c)));
      return { x, head, col, data: x.rows.filter((r) => r.some((c) => /^ORD/i.test(String(c ?? '').trim()))) };
    };

    const res = await EXPORT({ customerIds: [uuid()] });
    expectStatusIn(res, '400/422');
    await expectApiError(res);

  });

  test("CR-029 Phiếu đã chọn bị xóa", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun, tok }) => {

    const p0 = await performedP0(testRun);
    const EXPORT = (json: Record<string, unknown>) => http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json });
    /** Dòng dữ liệu (có mã ORD) của sheet báo cáo. */
    const fileRows = async (res: any) => {
      const x = await readXlsx(await res.body(), 'BaoCao_ChiPhi_DoanhThu');
      const head = x.rows.find((r) => r.some((c) => /Doanh thu/i.test(String(c)))) ?? [];
      const col = (rx: RegExp) => head.findIndex((c) => rx.test(String(c)));
      return { x, head, col, data: x.rows.filter((r) => r.some((c) => /^ORD/i.test(String(c ?? '').trim()))) };
    };

    const res = await EXPORT({ orderIds: [p0.id, uuid()] });
    expectStatusIn(res, '200/201');
    const f = await fileRows(res);
    expect(f.data, 'Chỉ xuất P0').toHaveLength(1);
    expect(f.data[0].some((c) => String(c).includes(p0.code))).toBe(true);
    test.info().annotations.push({ type: 'Ghi nhận', description: `Thông báo bỏ qua 1 phiếu (header phản hồi): ${JSON.stringify(res.headers())}` });

  });

  test("CR-030 Thứ tự theo sắp xếp màn hình", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, testRun, tok, page }) => {

    await performedP0(testRun);
    const EXPORT = (json: Record<string, unknown>) => http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json });
    /** Dòng dữ liệu (có mã ORD) của sheet báo cáo. */
    const fileRows = async (res: any) => {
      const x = await readXlsx(await res.body(), 'BaoCao_ChiPhi_DoanhThu');
      const head = x.rows.find((r) => r.some((c) => /Doanh thu/i.test(String(c)))) ?? [];
      const col = (rx: RegExp) => head.findIndex((c) => rx.test(String(c)));
      return { x, head, col, data: x.rows.filter((r) => r.some((c) => /^ORD/i.test(String(c ?? '').trim()))) };
    };

    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const ids = (await rows({ status: ['PERFORMED', 'COMPLETED'], sortBy: 'REVENUE', descending: true, perPage: 5 })).map((r: any) => r.serviceOrderId);
    const res = await EXPORT({ orderIds: ids, sortBy: 'COST', descending: false });
    expectStatusIn(res, '200/201');
    const f = await fileRows(res);
    const cost = f.data.map((r) => Number(r[f.col(/Chi phí/i)]));
    expect(cost.length).toBe(ids.length);
    expect(cost, 'Chi phí tăng dần').toEqual([...cost].sort((a, b) => a - b));

  });

  test("CR-018 Nguồn lọc Khách hàng", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const p0 = await performedP0(testRun);
    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const row = (await rows({ search: p0.code })).find((r: any) => r.serviceOrderId === p0.id);
    const res = await http.call('GET /api/cost-revenue/customer-options', { token: tok('cc'), query: { search: row.customerTaxCode } });
    expectStatusIn(res, '200');
    const opts = items(await data(res));
    expect(opts.some((c: any) => c.id === row.customerId), 'Trả KH_A').toBe(true);
    for (const c of opts.slice(0, 3)) expect(Number((await data(await LIST({ customerId: [c.id], perPage: 1 }))).meta.pagination.total), `${c.companyName} có phiếu trong danh sách`).toBeGreaterThan(0);

  });

  test("CR-021 Nguồn lọc Người tạo", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, roles, tok, page }) => {

    await performedP0(testRun);
    const LIST = (query: Record<string, unknown>, role: 'cc' | 'k1' = 'cc') => http.call('GET /api/cost-revenue/orders', { token: tok(role), query: { page: 1, perPage: 20, ...query } });
    const rows = async (query: Record<string, unknown>) => items(await data(await LIST(query)));
    /** Mọi dòng của bộ lọc (duyệt hết trang, tối đa 50 trang × 100). */
    const all = async (query: Record<string, unknown>) => {
      const out: any[] = [];
      for (let page = 1; page <= 50; page++) {
        const d = await data(await LIST({ ...query, page, perPage: 100 }));
        out.push(...items(d));
        if (page >= Number(d?.meta?.pagination?.totalPages ?? 1)) break;
      }
      return out;
    };

    const k1Email = testRun.roles.k1.email;
    const res = await http.call('GET /api/cost-revenue/creator-options', { token: tok('cc'), query: { search: k1Email.split('@')[0] } });
    expectStatusIn(res, '200');
    const opts = items(await data(res));
    expect(opts.some((u: any) => String(u.email).toLowerCase() === k1Email.toLowerCase()), 'Trả K1').toBe(true);
    for (const u of opts.slice(0, 3)) expect(Number((await data(await LIST({ creatorId: u.id, perPage: 1 }))).meta.pagination.total), `${u.email} đã tạo phiếu trong danh sách`).toBeGreaterThan(0);

  });

  test("CR-024 Xuất Excel phiếu đã chọn", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, testRun, tok }) => {

    const p0 = await performedP0(testRun);
    const p1 = await completedP0(testRun);
    const EXPORT = (json: Record<string, unknown>) => http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json });
    /** Dòng dữ liệu (có mã ORD) của sheet báo cáo. */
    const fileRows = async (res: any) => {
      const x = await readXlsx(await res.body(), 'BaoCao_ChiPhi_DoanhThu');
      const head = x.rows.find((r) => r.some((c) => /Doanh thu/i.test(String(c)))) ?? [];
      const col = (rx: RegExp) => head.findIndex((c) => rx.test(String(c)));
      return { x, head, col, data: x.rows.filter((r) => r.some((c) => /^ORD/i.test(String(c ?? '').trim()))) };
    };

    const res = await EXPORT({ orderIds: [p0.id, p1.id], sortBy: 'REVENUE', descending: true });
    expectStatusIn(res, '200/201');
    const f = await fileRows(res);
    expect(f.data, '2 dòng').toHaveLength(2);
    const rev = f.data.map((r) => Number(r[f.col(/Doanh thu/i)]));
    expect(rev, 'Doanh thu giảm dần').toEqual([...rev].sort((a, b) => b - a));
    const r0 = f.data.find((r) => r.some((c) => String(c).includes(p0.code)))!;
    expect(Number(r0[f.col(/Doanh thu/i)]), 'P0 doanh thu chỉ tính dịch vụ đã thực hiện').toBe(P0.orderRevenue);
    expect(Number(r0[f.col(/Chi phí/i)]), 'P0 chi phí').toBe(P0.orderCost);

  });

  test("CR-034 Trạng thái lượt xuất chạy nền", { tag: ["@api", "@chi-phi-doanh-thu", "@p1"] }, async ({ http, tok }) => {

    const start = await http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json: {} });
    if (start.status() !== 202) throw new Error(`Chuẩn bị dữ liệu thất bại: xuất toàn bộ trả HTTP ${start.status()} (không chạy nền); cần > 5.000 phiếu để có lượt xuất chạy nền`);
    const exportId = (await data(start))?.id as string;
    const STATUS = () => http.call('GET /api/cost-revenue/exports/{id}', { token: tok('cc'), params: { id: exportId } });

    const res = await STATUS();
    expectStatusIn(res, '200');
    expect(['PENDING', 'READY', 'FAILED'], 'Trạng thái đang chạy/xong').toContain((await data(res))?.status);

  });

  test("CR-040 Tải file lượt xuất chạy nền", { tag: ["@api", "@chi-phi-doanh-thu", "@p3"] }, async ({ http, tok }) => {

    const start = await http.call('POST /api/cost-revenue/exports', { token: tok('cc'), json: {} });
    if (start.status() !== 202) throw new Error(`Chuẩn bị dữ liệu thất bại: xuất toàn bộ trả HTTP ${start.status()} (không chạy nền); cần > 5.000 phiếu để có lượt xuất chạy nền`);
    const exportId = (await data(start))?.id as string;
    const STATUS = () => http.call('GET /api/cost-revenue/exports/{id}', { token: tok('cc'), params: { id: exportId } });

    await expect.poll(async () => (await data(await STATUS()))?.status, { timeout: 110_000, message: 'Lượt xuất chạy xong' }).toBe('READY');
    const st = await data(await STATUS());
    const res = await http.call('GET /api/cost-revenue/exports/{id}/file', { token: tok('cc'), params: { id: exportId } });

    expectStatusIn(res, '200');
    expect(isXlsx(await res.body(), res.headers()['content-type']), 'Trả file xlsx').toBe(true);
    void st;

  });
});
