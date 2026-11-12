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
  test("UI-LEG-001 Danh sách quy tắc", { tag: ["@ui", "@cau-hinh-chang", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-001', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-002 Cột Thành phần là số chặng", { tag: ["@ui", "@cau-hinh-chang", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-002', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-003 Bộ lọc nâng cao", { tag: ["@ui", "@cau-hinh-chang", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-003', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-004 Popup Tạo mới quy tắc", { tag: ["@ui", "@cau-hinh-chang", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-004', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-007 Tạo quy tắc 2 chặng", { tag: ["@ui", "@cau-hinh-chang", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-007', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-008 Chặng chưa gán dịch vụ", { tag: ["@ui", "@cau-hinh-chang", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-008', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-009 Mở trang chi tiết quy tắc", { tag: ["@ui", "@cau-hinh-chang", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-009', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-010 Chỉnh sửa quy tắc", { tag: ["@ui", "@cau-hinh-chang", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-010', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-011 Dừng hoạt động quy tắc", { tag: ["@ui", "@cau-hinh-chang", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-011', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-012 Xóa quy tắc đã có phiếu dùng", { tag: ["@ui", "@cau-hinh-chang", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-012', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-014 Đổi phạm vi xóa điểm đi/đến đã chọn", { tag: ["@ui", "@cau-hinh-chang", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-014', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-015 Phạm vi Cửa khẩu đồng bộ hai điểm", { tag: ["@ui", "@cau-hinh-chang", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-015', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-017 Mô phỏng tuyến Hữu Nghị → Hà Nội", { tag: ["@ui", "@cau-hinh-chang", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-017', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LEG-018 Popup lịch sử thao tác quy tắc", { tag: ["@ui", "@cau-hinh-chang", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(legUiCase('UI-LEG-018', { browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
