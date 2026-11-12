/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { performedP0, p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import { waitForNotification } from '../../../src/lich-su-thong-bao/data/ty-gia-thong-bao.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tỷ giá Vietcombank và thông báo", () => {
  test("COM-002 Lấy tỷ giá chuyển khoản VCB mới nhất", { tag: ["@api", "@lich-su-thong-bao", "@p1"] }, async ({ http, testRun, tok }) => {

    const o = await performedP0(testRun);
    const fxResponse = await http.call('GET /api/service-orders/{id}/pnl/fx-rate', { token: tok('cc'), params: { id: o.id } });
    expectStatusIn(fxResponse, '200');
    const fx = await data(fxResponse);
    for (const cur of ['USD', 'CNY']) {
      const res = await http.call('GET /api/exchange-rates/{currency}', { token: tok('cc'), params: { currency: cur } });
      expectStatusIn(res, '200', cur);
      const d = await data(res);
      expect(Number(d.rate), `${cur} > 0`).toBeGreaterThan(0);
      expect(Number.isFinite(Date.parse(d.asOf)), 'Có thời điểm lấy').toBe(true);
      const vcb = cur === 'USD' ? fx.vcbUsdRate : fx.vcbCnyRate;
      expect(Number(vcb), `P&L có tỷ giá VCB ${cur}`).toBeGreaterThan(0);
      expect(Number(d.rate), `${cur} trùng tỷ giá VCB ở P&L phiếu`).toBe(Number(vcb));
    }

  });

  test("COM-003 Tiền tệ VND", { tag: ["@api", "@lich-su-thong-bao", "@p3"] }, async ({ http, tok }) => {

    const res = await http.call('GET /api/exchange-rates/{currency}', { token: tok('cc'), params: { currency: 'VND' } });
    expectStatusIn(res, '200/400');
    expect(res.status(), 'Không 5xx').toBeLessThan(500);
    if (res.status() === 200) expect(Number((await data(res)).rate), 'Tỷ giá = 1').toBe(1);

  });

  test("COM-008 Thông báo của chính mình", { tag: ["@api", "@lich-su-thong-bao", "@p1"] }, async ({ http, testRun, tok }) => {

    const LIST = async (query: Record<string, unknown> = {}, role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications', { token: tok(role), query })); return Array.isArray(d) ? d : items(d); };
    const COUNT = async (role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications/unread-count', { token: tok(role) })); return typeof d === 'number' ? d : Number(Object.values(d ?? {})[0] ?? 0); };
    const READ = (id: string, role: 'cc' | 'dp' = 'cc') => http.call('POST /api/notifications/{id}/read', { token: tok(role), params: { id } });
    /** K1 gửi YCBG → CC có 1 thông báo mới chưa đọc. */
    const fresh = async () => {
      const r = await createRfq(testRun, { submit: true });
      const n = await waitForNotification(testRun, 'cc', r.id, true);
      return { rfq: r, note: n };
    };

    const { rfq } = await fresh();
    const res = await http.call('GET /api/notifications', { token: tok('cc'), query: { unreadOnly: true, limit: 20 } });
    expectStatusIn(res, '200');
    const list = (await data(res)) as any[];
    expect(list.some((x: any) => x.subjectId === rfq.id), 'Có thông báo YCBG mới').toBe(true);
    const at = list.map((x: any) => Date.parse(x.createdAt));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((p, q) => q - p));
    expect(list.every((x: any) => !x.readAt), 'Chỉ chưa đọc').toBe(true);
    const dpIds = new Set((await LIST({ limit: 100 }, 'dp')).map((x: any) => x.id));
    expect(list.some((x: any) => dpIds.has(x.id)), 'Không có thông báo của người khác').toBe(false);

  });

  test("COM-009 Giới hạn số lượng", { tag: ["@api", "@lich-su-thong-bao", "@p3"] }, async ({ http, testRun, tok }) => {

    const LIST = async (query: Record<string, unknown> = {}, role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications', { token: tok(role), query })); return Array.isArray(d) ? d : items(d); };
    const COUNT = async (role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications/unread-count', { token: tok(role) })); return typeof d === 'number' ? d : Number(Object.values(d ?? {})[0] ?? 0); };
    const READ = (id: string, role: 'cc' | 'dp' = 'cc') => http.call('POST /api/notifications/{id}/read', { token: tok(role), params: { id } });
    /** K1 gửi YCBG → CC có 1 thông báo mới chưa đọc. */
    const fresh = async () => {
      const r = await createRfq(testRun, { submit: true });
      const n = await waitForNotification(testRun, 'cc', r.id, true);
      return { rfq: r, note: n };
    };

    for (let i = 0; i < 6; i++) await createRfq(testRun, { submit: true });
    const res = await http.call('GET /api/notifications', { token: tok('cc'), query: { limit: 5 } });
    expectStatusIn(res, '200');
    const list = (await data(res)) as any[];
    expect(list, 'Trả đúng 5').toHaveLength(5);
    const at = list.map((x: any) => Date.parse(x.createdAt));
    expect(at, 'Mới nhất trước').toEqual([...at].sort((p, q) => q - p));

  });

  test("COM-018 Đọc không xóa thông báo", { tag: ["@api", "@lich-su-thong-bao", "@p3"] }, async ({ http, testRun, tok }) => {

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
    const after = (await LIST({ limit: 100 })).find((x: any) => x.id === note.id);
    expect(after, 'Vẫn trong danh sách').toBeTruthy();
    expect(after.readAt, 'Cờ đã đọc').toBeTruthy();

  });

  test("COM-019 Không đổi nội dung thông báo", { tag: ["@api", "@lich-su-thong-bao", "@p3"] }, async ({ http, testRun, tok }) => {

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
    const after = (await LIST({ limit: 100 })).find((x: any) => x.id === note.id);
    expect([after.title, after.body, after.createdAt], 'Tiêu đề, nội dung, thời gian giữ nguyên').toEqual([note.title, note.body, note.createdAt]);

  });

  test("COM-013 Số thông báo chưa đọc", { tag: ["@api", "@lich-su-thong-bao", "@p1"] }, async ({ http, testRun, tok }) => {

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
    const res = await http.call('GET /api/notifications/unread-count', { token: tok('cc') });
    expectStatusIn(res, '200');
    const n0 = await COUNT();
    expect(n0, 'Có thông báo chưa đọc').toBeGreaterThan(0);
    await must(await READ(note.id), 'đánh dấu đã đọc');
    expect(await COUNT(), 'Giảm 1 sau khi đọc').toBe(n0 - 1);

  });

  test("COM-016 Đánh dấu đã đọc", { tag: ["@api", "@lich-su-thong-bao", "@p1"] }, async ({ http, testRun, tok }) => {

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
    const n0 = await COUNT();
    const res = await READ(note.id);
    expectStatusIn(res, '200/204');
    expect((await LIST({ limit: 100 })).find((x: any) => x.id === note.id)?.readAt, 'Đã đọc').toBeTruthy();
    expect(await COUNT(), 'Số chưa đọc giảm 1').toBe(n0 - 1);

  });
});
