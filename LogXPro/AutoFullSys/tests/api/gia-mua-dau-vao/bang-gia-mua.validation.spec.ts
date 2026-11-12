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
import * as F_gia_mua_dau_vao_bang_gia_mua from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)", () => {
  test("BGM-005 `page` sai kiểu dữ liệu", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/purchase-prices";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, query: { ...p.query, "page": "abc" } });
    expectStatusIn(res, "400/422");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    await expectApiError(res);
  });

  test("BGM-006 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/purchase-prices";
    const p = await testRun.prepare(API, "k1");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(list.length, "perPage=1 trả đúng 1 phần tử").toBe(1);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("BGM-016 Thiếu trường bắt buộc `name`", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_gia_mua_dau_vao_bang_gia_mua.bodies[API]();
    delete payload["name"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("BGM-017 `contractorId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices";
    const p = await testRun.prepare(API, "k1");
    const marker = tagged("AT Không lưu");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_gia_mua_dau_vao_bang_gia_mua.bodies[API](), "contractorId": value };
      payload["name"] = marker;
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.listContains("GET /api/purchase-prices", marker, "k1", p.params), "Không được tạo bản ghi mới").toBe(false);
  });

  test("BGM-018 `name` dài 254, 255 và 256 ký tự", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const seed = 'Bảng giá mua dịch vụ khai báo hải quan cửa khẩu Hữu Nghị ';
    for (const [n, set] of [[254, '200/201'], [255, '200/201'], [256, '400/422']] as [number, string][]) {
      const name = textOfLength(n, seed);
      const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: await sheetBody(testRun, A, 'VND', [], name) });
      expectStatusIn(res, set, `${n} ký tự`);
      if (n <= 255) {
        const s = await data(res);
        testRun.track(`bảng giá ${s.code}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id } }));
        expect((await SHEET(s.id)).name, `${n} ký tự đọc lại nguyên văn`).toBe(name);
      } else {
        expectOnlyFieldError(await expectApiError(res), 'name');
        expect(items(await data(await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { search: name.slice(0, 100) } }))).some((s: any) => s.name === name), 'Không lưu').toBe(false);
      }
    }

  });

  test("BGM-037 Thiếu trường bắt buộc `name`", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/purchase-prices/{id}";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_gia_mua_dau_vao_bang_gia_mua.bodies[API]();
    delete payload["name"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "name");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-038 `contractorId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/purchase-prices/{id}";
    const p = await testRun.prepare(API, "k1");
    const marker = tagged("AT Không lưu");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_gia_mua_dau_vao_bang_gia_mua.bodies[API](), "contractorId": value };
      payload["name"] = marker;
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-039 `name` dài 254, 255 và 256 ký tự", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun, tok, page }) => {

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

    const s = await draft(A, 'VND', [], 'Độ dài G39');
    const seed = 'Bảng giá mua vận tải đường bộ tuyến Lạng Sơn Hà Nội ';
    let last = s.name;
    for (const [n, set] of [[254, '200/204'], [255, '200/204'], [256, '400/422']] as [number, string][]) {
      const name = textOfLength(n, seed);
      const res = await http.call('PUT /api/purchase-prices/{id}', { token: tok('k1'), params: { id: s.id }, json: putBody(s, { name }) });
      expectStatusIn(res, set, `${n} ký tự`);
      if (n <= 255) last = name;
      else expectOnlyFieldError(await expectApiError(res), 'name');
      expect((await SHEET(s.id)).name, n <= 255 ? `${n} ký tự đọc lại nguyên văn` : 'Giữ tên trước').toBe(last);
    }

  });

  test("BGM-072 Thiếu tham số bắt buộc `query`", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const query = { ...p.query };
    delete (query as Record<string, unknown>)["query"];
    const res = await http.call(API, { ...p, query });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("BGM-073 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/purchase-prices/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(list.length, "perPage=1 trả đúng 1 phần tử").toBe(1);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("BGM-080 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-081 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/purchase-prices/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(list.length, "perPage=1 trả đúng 1 phần tử").toBe(1);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("BGM-088 Thiếu trường bắt buộc `priceConfigurationItemId`", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_gia_mua_dau_vao_bang_gia_mua.bodies[API]();
    delete payload["priceConfigurationItemId"];
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "priceConfigurationItemId");
    test.info().annotations.push({ type: "Không đọc lại", description: "Body không có trường chuỗi để đánh dấu bản ghi; chỉ kiểm mã lỗi và trường lỗi" });
  });

  test("BGM-089 `priceConfigurationItemId` không phải UUID hoặc không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices/{id}/items";
    const p = await testRun.prepare(API, "k1");
    for (const value of ["abc", uuid()]) {
      const payload: Record<string, unknown> = { ...F_gia_mua_dau_vao_bang_gia_mua.bodies[API](), "priceConfigurationItemId": value };
      const res = await http.call(API, { ...p, json: payload });
      expectStatusIn(res, "400/404", JSON.stringify(value));
      await expectApiError(res);
    }
  });

  test("BGM-125 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/versions";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-126 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/purchase-prices/{id}/versions";
    const p = await testRun.prepare(API, "k1");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(list.length, "perPage=1 trả đúng 1 phần tử").toBe(1);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("BGM-137 Tham số đường dẫn `versionId` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/versions/{versionId}/items";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "versionId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-138 Kích thước trang tại cận 1, 100 và 101", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun, page }) => {
    const API = "GET /api/purchase-prices/{id}/versions/{versionId}/items";
    const p = await testRun.prepare(API, "k1");
    const sets = ["200", "200", "400/422"];
    const sizes = [1, 100, 101];
    for (let i = 0; i < sizes.length; i++) {
      const res = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: sizes[i] } });
      expectStatusIn(res, sets[i], `perPage=${sizes[i]}`);
      if (res.ok()) {
        const list = items(await data(res));
        if (sizes[i] === 1) expect(list.length, "perPage=1 trả đúng 1 phần tử").toBe(1);
        else expect(list.length, `perPage=${sizes[i]} trả tối đa 100`).toBeLessThanOrEqual(100);
      }
    }
  });

  test("BGM-142 Tham chiếu đầu mục ở các trạng thái", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {
    test.skip(true, 'Bỏ qua vì case cần tạo, tắt và xóa đầu mục cấu hình giá; bộ test hiện tại chỉ được phép đọc cấu hình đầu mục giá.');

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

    const it = await own('G142', ['customsFee', 'overtime', 'storage']);
    const sheet = await activeA(it, []);
    await must(await setItemStatus(testRun, it.overtime, 'INACTIVE'), 'tắt đầu mục');
    // Không tạo/xóa đầu mục để dựng trạng thái “đã xóa”. Case đã được skip ở đầu
    // vì trạng thái này không thể kiểm an toàn khi cấu hình đầu mục giá chỉ đọc.
    const gone = { supervision: { id: uuid(), configId: uuid() } };
    const khqAttr = { customsOfficeCodes: [refs.customsOffice], tradeTypeCodes: [refs.tradeType], cargoGroupCodes: [refs.cargoGroup], vehicleTypeCodes: [refs.vehicleType] };
    const ADD = (itemId: string, unitCode: string) => http.call('POST /api/purchase-prices/{id}/items', { token: tok('k1'), params: { id: sheet.id }, json: { priceConfigurationItemId: itemId, unitCode, unitPrice: 1_000_000, ...khqAttr } });
    const fake = uuid();
    const cases: [string, string, string, string][] = [
      ['đang bật (Cố định)', it.customsFee.id, refs.units.customsFee, '200/201'],
      ['đang tắt', it.overtime.id, refs.units.overtime, '400/422'],
      ['đã xóa', gone.supervision.id, refs.units.supervision, '400/404'],
      ['phân hệ khác loại dịch vụ của dòng', it.storage.id, refs.units.storage, '400/422'],
      ['UUID không tồn tại', fake, refs.units.customsFee, '400/404'],
    ];
    for (const [label, id, unit, set] of cases) {
      const res = await ADD(id, unit);
      expectStatusIn(res, set, label);
      if (set !== '200/201') {
        expect(errorFields(await body(res)).length === 0 || errorFields(await body(res)).includes('priceConfigurationItemId'), `${label}: lỗi đúng trường`).toBe(true);
        expect(await LINES(sheet.id, { priceConfigurationItemId: id }), `${label}: không tạo dòng`).toHaveLength(0);
      }
    }

  });

  test("BGM-143 Tham chiếu nhà thầu ở các trạng thái", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun, tok, page }) => {

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

    const cases: [string, string, string][] = [
      ['NT_A hoạt động', A, '200/201'],
      ['NT_C ngưng', env.ref('CONTRACTOR_C_ID'), '400/409/422'],
      ['Dừng hợp tác', env.ref('CONTRACTOR_STOPPED_ID'), '400/409/422'],
      ['UUID không tồn tại', uuid(), '400/404'],
    ];
    for (const [label, contractorId, set] of cases) {
      const name = nmS(`Nhà thầu ${label} G143`);
      const res = await http.call('POST /api/purchase-prices', { token: tok('k1'), json: { name, contractorId, effectiveFrom: today(), effectiveTo: today(90), currency: 'VND', items: [] } });
      expectStatusIn(res, set, label);
      const found = items(await data(await http.call('GET /api/purchase-prices', { token: tok('k1'), query: { search: name } }))).filter((s: any) => s.name === name);
      if (set === '200/201') testRun.track(`bảng giá ${name}`, () => http.call('DELETE /api/purchase-prices/{id}', { token: tok('k1'), params: { id: found[0]?.id } }));
      expect(found.length, `${label}: ${set === '200/201' ? 'tạo được' : 'không tạo'}`).toBe(set === '200/201' ? 1 : 0);
    }

  });

  test("BGM-008 Gọi sai phương thức HTTP", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-020 Body JSON hỏng cú pháp", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("BGM-024 Gọi sai phương thức HTTP", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/contractors";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-028 Gọi sai phương thức HTTP", { tag: ["@api", "@gia-mua-dau-vao", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/stats";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-030 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-032 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-041 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/purchase-prices/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_gia_mua_dau_vao_bang_gia_mua.bodies["PUT /api/purchase-prices/{id}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-046 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/purchase-prices/{id}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-048 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/purchase-prices/{id}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-054 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices/{id}/activate";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-056 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices/{id}/activate";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-059 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/activation-check";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-061 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/activation-check";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-067 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices/{id}/deactivate";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-069 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices/{id}/deactivate";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-075 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/history";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-083 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-091 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_gia_mua_dau_vao_bang_gia_mua.bodies["POST /api/purchase-prices/{id}/items"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-099 Tham số đường dẫn `id` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/purchase-prices/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_gia_mua_dau_vao_bang_gia_mua.bodies["PUT /api/purchase-prices/{id}/items"]() }, params: { ...p.params, "id": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-101 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/purchase-prices/{id}/items";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_gia_mua_dau_vao_bang_gia_mua.bodies["PUT /api/purchase-prices/{id}/items"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-106 Thiếu trường bắt buộc `itemIds`", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices/{id}/items/approve";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_gia_mua_dau_vao_bang_gia_mua.bodies[API]();
    delete payload["itemIds"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "itemIds");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-108 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/purchase-prices/{id}/items/approve";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_gia_mua_dau_vao_bang_gia_mua.bodies["POST /api/purchase-prices/{id}/items/approve"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-114 Thiếu trường bắt buộc `unitCode`", { tag: ["@api", "@gia-mua-dau-vao", "@p1"] }, async ({ http, testRun }) => {
    const API = "PUT /api/purchase-prices/{id}/items/{itemId}";
    const p = await testRun.prepare(API, "k1");
    const payload: Record<string, unknown> = F_gia_mua_dau_vao_bang_gia_mua.bodies[API]();
    delete payload["unitCode"];
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, json: payload });
    expectStatusIn(res, "400/422");
    const err = await expectApiError(res);
    expectOnlyFieldError(err, "unitCode");
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-116 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "PUT /api/purchase-prices/{id}/items/{itemId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{ json: F_gia_mua_dau_vao_bang_gia_mua.bodies["PUT /api/purchase-prices/{id}/items/{itemId}"]() }, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-121 Tham số đường dẫn `itemId` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/purchase-prices/{id}/items/{itemId}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "itemId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-123 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "DELETE /api/purchase-prices/{id}/items/{itemId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-128 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/versions";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-132 Tham số đường dẫn `versionId` sai định dạng", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/versions/{versionId}";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "versionId": "abc-khong-phai-uuid" } });
    expectStatusIn(res, "400/404");
    expect(res.status(), "Không 5xx").toBeLessThan(500);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("BGM-134 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/versions/{versionId}";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });

  test("BGM-140 `id` hợp lệ về định dạng nhưng không tồn tại", { tag: ["@api", "@gia-mua-dau-vao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/purchase-prices/{id}/versions/{versionId}/items";
    const p = await testRun.prepare(API, "k1");
    const res = await http.call(API, { ...p, ...{}, params: { ...p.params, "id": uuid() } });
    expectStatusIn(res, "404");
    await expectApiError(res);
  });
});
