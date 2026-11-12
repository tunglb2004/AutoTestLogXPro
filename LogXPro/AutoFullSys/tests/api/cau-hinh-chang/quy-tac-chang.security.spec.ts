/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { withLegSandbox, expectSuccessEnvelope } from '../../../src/cau-hinh-chang/data/leg-sandbox';
import { p0Base, createOrder, orderBody } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { serviceEntry } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)", () => {
  test("LEG-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@cau-hinh-chang", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/leg-rules", "POST /api/leg-rules", "GET /api/leg-rules/{code}", "PUT /api/leg-rules/{code}", "DELETE /api/leg-rules/{code}", "GET /api/leg-rules/{code}/history", "PATCH /api/leg-rules/{code}/status", "POST /api/leg-rules/simulate"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "admin");
      const before = await testRun.snapshot(api, p.params ?? {}, "admin");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.admin)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "admin"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });

  test("LEG-018 Tên chứa HTML", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, tok }) => {

    await withLegSandbox(testRun, async (s) => {
      const name = `<img src=x onerror=alert(1)> AT ${TEST_RUN_ID} ${Math.random().toString(36).slice(2, 6)}`;
      const b = await s.available({ name });
      const res = await http.call('POST /api/leg-rules', { token: tok('admin'), json: b });
      expectStatusIn(res, '200/400');
      if (res.ok()) {
        const found = items(await s.list({ search: 'onerror' })).find((d: any) => d.name === name);
        expect(found, 'Trả nguyên văn dạng text').toBeTruthy();
        expectStatusIn(await s.remove(found.code), '200/204', 'dọn quy tắc');
      } else await expectApiError(res);
    });

  });
});
