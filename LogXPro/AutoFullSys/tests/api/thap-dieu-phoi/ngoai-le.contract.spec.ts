/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, SERVICE_KEYS, ServiceKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { p0Base, p0Order, createOrder, orderBody, getOrder, revenueOf, revenueTable, rejectOrder, runService, uploadOrderDoc, uploadVehicleDoc, buildP0, addSealCost, scopeRequestOrder } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { actualsBody, costs, costLines, costItem, addCost, saveActuals, startService, completeService, uploadActualDoc, coordinate } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { changeLinePrice } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { setItemStatus } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { pnl } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as R_thap_dieu_phoi_ngoai_le from '../../../src/thap-dieu-phoi/api/schemas/ngoai-le.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối — thao tác ngoại lệ", () => {
  test("K3X-034 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/k3/service-orders/{id}/scope-requests";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_thap_dieu_phoi_ngoai_le.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "kind", "kindLabel", "serviceTypeCode", "serviceTypeName", "reason", "status", "statusLabel", "responseNote", "requestedByName", "requestedAt", "respondedByName", "respondedAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("K3X-043 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@thap-dieu-phoi", "@p2"] }, async ({ http, testRun, tok }) => {

    const refs = await testRun.p0Refs();
    const base = await p0Base(testRun);
    const q = await createOrder(testRun, base, { submit: true, services: ['KHQ', 'HQGS', 'VT', 'ST'] });
    await acceptOrder(testRun, q.id);
    await confirmLegs(testRun, q.id);
    const ADD = { kind: 'ADD', serviceTypeCode: refs.services.KB, reason: 'Hàng cần lưu kho thêm 2 ngày' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id }, json });
    const LIST = async (role: 'dp' | 'k1' = 'dp') => items(await data(await http.call(role === 'dp' ? 'GET /api/k3/service-orders/{id}/scope-requests' : 'GET /api/service-orders/{id}/scope-requests', { token: tok(role), params: { id: q.id } })));

    const res = await SEND(ADD);
    expectStatusIn(res, '200/201');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    expect(typeof b.data?.id, 'data.id').toBe('string');

  });

  test("K3X-054 Cấu trúc phản hồi thành công", { tag: ["@api", "@thap-dieu-phoi", "@p3"] }, async ({ http, testRun, tok }) => {

    const o = await p0Order(testRun, 'ACCEPTED');
    const CHANGE = { legPosition: 1, role: 'HANDOVER', pairIndex: 0, plateNo: '15C-222.22', reason: 'Xe hỏng tại cửa khẩu' };
    const SEND = (json: Record<string, unknown>, role: 'dp' | 'dpVt' = 'dp') => http.call('POST /api/k3/service-orders/{id}/vehicle-changes', { token: tok(role), params: { id: o.id }, json });
    const handover = async () => ((await getOrder(testRun, o.id)).vehicles ?? []).find((v: any) => v.role === 'HANDOVER' && Number(v.pairIndex) === 0);
    const towerLog = async () => items(await data(await http.call('GET /api/k3/service-orders/{id}/tower-log', { token: tok('dp'), params: { id: o.id }, query: { perPage: 100 } })));
    expect((await handover())?.plateNo, 'Tiền điều kiện: xe giao 15C-111.11').toBe('15C-111.11');

    const res = await SEND(CHANGE);
    expectStatusIn(res, '200/201');
    const text = await res.text();
    expect(hasNoStacktrace(text)).toBe(true);
    const b = JSON.parse(text);
    expect(b.success).toBe(true);
    expect(b).toHaveProperty('message');
    expect(b.errorCode ?? null).toBeNull();
    expect(b).toHaveProperty('data');

  });
});
