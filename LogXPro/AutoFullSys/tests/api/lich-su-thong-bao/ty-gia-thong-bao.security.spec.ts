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
  test("COM-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@lich-su-thong-bao", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/exchange-rates/{currency}", "GET /api/notifications", "GET /api/notifications/unread-count", "POST /api/notifications/{id}/read"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "k1");
      const before = await testRun.snapshot(api, p.params ?? {}, "k1");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.k1)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "k1"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("COM-017 Đánh dấu thông báo của người khác", { tag: ["@api", "@lich-su-thong-bao", "@p1"] }, async ({ http, testRun, tok }) => {

    const LIST = async (query: Record<string, unknown> = {}, role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications', { token: tok(role), query })); return Array.isArray(d) ? d : items(d); };
    const COUNT = async (role: 'cc' | 'dp' = 'cc') => { const d = await data(await http.call('GET /api/notifications/unread-count', { token: tok(role) })); return typeof d === 'number' ? d : Number(Object.values(d ?? {})[0] ?? 0); };
    const READ = (id: string, role: 'cc' | 'dp' = 'cc') => http.call('POST /api/notifications/{id}/read', { token: tok(role), params: { id } });
    /** K1 gửi YCBG → CC có 1 thông báo mới chưa đọc. */
    const fresh = async () => {
      const r = await createRfq(testRun, { submit: true });
      const n = await waitForNotification(testRun, 'cc', r.id, true);
      return { rfq: r, note: n };
    };

    const o = await p0Order(testRun, 'SUBMITTED');
    const dpNote = (await LIST({ unreadOnly: true, limit: 100 }, 'dp')).find((x: any) => x.subjectId === o.id) ?? (await LIST({ unreadOnly: true, limit: 100 }, 'dp'))[0];
    if (!dpNote) throw new Error('Chuẩn bị dữ liệu thất bại: DP chưa có thông báo chưa đọc');
    const res = await READ(dpNote.id, 'cc');
    expectStatusIn(res, '403/404');
    expect((await LIST({ limit: 200 }, 'dp')).find((x: any) => x.id === dpNote.id)?.readAt ?? null, 'Thông báo của DP vẫn chưa đọc').toBeNull();

  });
});
