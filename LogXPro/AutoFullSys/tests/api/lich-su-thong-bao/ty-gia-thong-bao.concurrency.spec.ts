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
  test("COM-023 Đánh dấu lại thông báo đã đọc", { tag: ["@api", "@lich-su-thong-bao", "@p2"] }, async ({ http, testRun, tok }) => {

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
    expectStatusIn(await READ(note.id), '200/204', 'lần 1');
    const n1 = await COUNT();
    const res = await READ(note.id);
    expectStatusIn(res, '200/204', 'lần 2');
    expect(await COUNT(), 'Số chưa đọc không giảm thêm').toBe(n1);

  });
});
