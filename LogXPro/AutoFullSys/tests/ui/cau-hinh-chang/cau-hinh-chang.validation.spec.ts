import { legUiCase } from '../../../src/cau-hinh-chang/data/leg-ui.scenario';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình chặng", () => {
  test("UI-LEG-005 Bỏ trống trường bắt buộc", { tag: ["@ui", "@cau-hinh-chang", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-005', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-006 Giá trị chưa hỗ trợ bị khóa", { tag: ["@ui", "@cau-hinh-chang", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-006', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-013 Tên quy tắc 149/150/151, ghi chú 254/255/256 ký tự", { tag: ["@ui", "@cau-hinh-chang", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-013', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-016 Không chọn được Kho bãi, không xóa chặng cuối", { tag: ["@ui", "@cau-hinh-chang", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-016', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
