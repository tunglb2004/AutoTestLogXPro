import { runPurchaseUi } from '../../../src/gia-mua-dau-vao/data/purchase-price-ui.scenario';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá mua đầu vào", () => {
  test("UI-BGM-001 Danh sách bảng giá", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-001", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-002 Số trên thẻ khớp dữ liệu", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-002", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-003 Lọc, tìm, sắp xếp", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-003", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-004 Chọn dòng rồi Xuất dữ liệu", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-004", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-005 Xoá bảng giá Tạo mới", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-005", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-006 Xoá bảng không ở Tạo mới", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-006", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-007 Trang Thêm mới giá mua", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-007", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-009 Chọn nhà thầu tự điền hợp đồng", { tag: ["@ui", "@gia-mua-dau-vao", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-009", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-010 Ô chọn nhà thầu chỉ có nhà thầu đủ điều kiện", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-010", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-011 Tạo bảng giá kèm dòng giá", { tag: ["@ui", "@gia-mua-dau-vao", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-011", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-013 Trang chi tiết bảng giá", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-013", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-014 Tìm dòng giá, phân trang, ID đầy đủ", { tag: ["@ui", "@gia-mua-dau-vao", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-014", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-015 Ngừng hoạt động bảng giá", { tag: ["@ui", "@gia-mua-dau-vao", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-015", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-016 Nhân bản bảng giá", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-016", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-017 Nhật ký bảng giá và Lịch sử thao tác", { tag: ["@ui", "@gia-mua-dau-vao", "@p3"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-017", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-018 Chỉnh sửa bảng giá đang hoạt động", { tag: ["@ui", "@gia-mua-dau-vao", "@p1"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-018", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-019 Kích hoạt bảng mới khi nhà thầu đang có bảng chạy", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-019", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-020 Chọn \"Tất cả\" khóa giá trị khác", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-020", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-BGM-021 Xem trước tổ hợp bỏ điểm đi = điểm đến", { tag: ["@ui", "@gia-mua-dau-vao", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(runPurchaseUi("UI-BGM-021", testRun, browser, roles), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });
});
