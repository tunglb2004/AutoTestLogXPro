import { runBuyingUi } from '../../../src/gia-mua-dinh-muc/data/standard-price-ui.scenario';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua định mức", () => {
  test("UI-SBP-001 Danh sách giá mua định mức", { tag: ["@ui", "@gia-mua-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-001", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-002 Tìm, sắp xếp, lọc", { tag: ["@ui", "@gia-mua-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-002", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-003 Cảnh báo khi giá nhà thầu đổi, ẩn khi mở chi tiết", { tag: ["@ui", "@gia-mua-dinh-muc", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-003", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-004 Trang chi tiết dòng giá mua định mức", { tag: ["@ui", "@gia-mua-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-004", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-005 Quy đổi tiền tệ bằng tỷ giá nhập tay", { tag: ["@ui", "@gia-mua-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-005", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-006 Cập nhật giá mua định mức", { tag: ["@ui", "@gia-mua-dinh-muc", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-006", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-009 Nhập hàng loạt: chuyển trang/lọc/sắp xếp giữ dữ liệu", { tag: ["@ui", "@gia-mua-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-009", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-010 Nhập hàng loạt: Hủy bỏ khi còn dòng chưa lưu", { tag: ["@ui", "@gia-mua-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-010", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-011 Nhập hàng loạt: Lưu khi chưa đổi gì", { tag: ["@ui", "@gia-mua-dinh-muc", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-011", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-012 Nhập hàng loạt lưu thành công", { tag: ["@ui", "@gia-mua-dinh-muc", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-012", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-014 Đầu mục bị tắt giữa phiên nhập: hủy và xác nhận", { tag: ["@ui", "@gia-mua-dinh-muc", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-014", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-SBP-015 Dòng bị xóa do đồng bộ trước khi lưu", { tag: ["@ui", "@gia-mua-dinh-muc", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runBuyingUi("UI-SBP-015", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
