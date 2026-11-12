/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import * as R_lich_su_thong_bao_ty_gia_thong_bao from '../../../src/lich-su-thong-bao/api/schemas/ty-gia-thong-bao.schema';

import { performedP0, p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import { waitForNotification } from '../../../src/lich-su-thong-bao/data/ty-gia-thong-bao.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tỷ giá Vietcombank và thông báo", () => {
  test("COM-006 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/exchange-rates/{currency}";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_lich_su_thong_bao_ty_gia_thong_bao.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["currency", "rate", "asOf", "source"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("COM-011 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/notifications";
    const p = await testRun.prepare(API, "cc");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_lich_su_thong_bao_ty_gia_thong_bao.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "kind", "title", "body", "subjectType", "subjectId", "readAt", "createdAt"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
  });

  test("COM-014 Đúng loại phản hồi và nội dung", { tag: ["@api", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun, tok }) => {

    const LIST = async (query: Record<string, unknown> = {}, role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications', { token: tok(role), query })); return Array.isArray(d) ? d : items(d); };
    const COUNT = async (role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications/unread-count', { token: tok(role) })); return typeof d === 'number' ? d : Number(Object.values(d ?? {})[0] ?? 0); };
    const READ = (id: string, role: 'cc' | 'dp' = 'cc') => http.call('POST /api/notifications/{id}/read', { token: tok(role), params: { id } });
    /** K1 gửi YCBG → CC có 1 thông báo mới chưa đọc. */
    const fresh = async () => {
      const r = await createRfq(testRun, { submit: true });
      const n = await waitForNotification(testRun, 'cc', r.id, true);
      return { rfq: r, note: n };
    };

    await fresh();
    const res = await http.call('GET /api/notifications/unread-count', { token: tok('cc') });
    expectStatusIn(res, '200');
    const n = await COUNT();
    expect(Number.isInteger(n) && n >= 0, 'Số nguyên ≥ 0').toBe(true);
    expect((await LIST({ unreadOnly: true, limit: 1000 })).length, 'Bằng số thông báo chưa đọc ở danh sách').toBe(n);

  });

  test("COM-021 Cấu trúc phản hồi thành công", { tag: ["@api", "@lich-su-thong-bao", "@p3"] }, async ({ http, testRun, tok }) => {

    const LIST = async (query: Record<string, unknown> = {}, role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications', { token: tok(role), query })); return Array.isArray(d) ? d : items(d); };
    const COUNT = async (role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications/unread-count', { token: tok(role) })); return typeof d === 'number' ? d : Number(Object.values(d ?? {})[0] ?? 0); };
    const READ = (id: string, role: 'cc' | 'dp' = 'cc') => http.call('POST /api/notifications/{id}/read', { token: tok(role), params: { id } });
    /** K1 gửi YCBG → CC có 1 thông báo mới chưa đọc. */
    const fresh = async () => {
      const r = await createRfq(testRun, { submit: true });
      const n = await waitForNotification(testRun, 'cc', r.id, true);
      return { rfq: r, note: n };
    };

    const { note } = await fresh();
    const res = await READ(note.id);
    expectStatusIn(res, '200/204');
    const text = await res.text();
    expect(hasNoStacktrace(text)).toBe(true);
    if (text) {
      const b = JSON.parse(text);
      expect(b.success).toBe(true);
      expect(b).toHaveProperty('message');
      expect(b.errorCode ?? null).toBeNull();
      expect(b).toHaveProperty('data');
    }

  });
});
