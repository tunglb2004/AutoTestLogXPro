import { withLegSandbox, expectSuccessEnvelope } from '../../../src/cau-hinh-chang/data/leg-sandbox';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { p0Base, createOrder, orderBody } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { serviceEntry } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)", () => {
  test("LEG-024 Gửi trùng 2 lần cùng body", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {

    await withLegSandbox(testRun, async (s) => {
      const b = await s.available();
      const { response } = await s.create(b);
      expectStatusIn(response, '200/201', 'lần 1');
      const r2 = await http.call('POST /api/leg-rules', { token: tok('admin'), json: b });
      expectStatusIn(r2, '400/409/422', 'lần 2');
      expect(items(await s.list({ search: b.name })).filter((d: any) => d.name === b.name), 'Chỉ 1 quy tắc').toHaveLength(1);
    });

  });

  test("LEG-059 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available()); expectStatusIn(await s.status(rule.code, 'INACTIVE'), '200/204');
      const before = await s.unchanged(rule.code); const res = await s.status(rule.code, 'INACTIVE');
      expectStatusIn(res, '400/409/422'); await expectApiError(res); expect(await s.unchanged(rule.code)).toEqual(before);
    });
  });

  test("LEG-068 Gọi lặp cho cùng kết quả, không ghi dữ liệu", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const input = await s.simulationInput(); const before = stable(await s.list());
      const a = await s.simulate(input); expectStatusIn(a, '200/204'); const d = await data(a); expect(d.outcome).toBe('MATCHED'); const h = stable(await s.history(d.rule.code));
      const b = await s.simulate(input); expectStatusIn(b, '200/204'); expect(stable(await data(b))).toEqual(stable(d));
      expect(stable(await s.list())).toEqual(before); expect(stable(await s.history(d.rule.code))).toEqual(h);
    });
  });
});
