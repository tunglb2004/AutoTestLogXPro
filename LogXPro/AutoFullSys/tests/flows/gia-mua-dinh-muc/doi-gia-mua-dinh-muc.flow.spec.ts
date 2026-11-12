import { runPendingBuyingFlow } from '../../../src/gia-mua-dinh-muc/data/pending-price-flows';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Đổi Giá mua định mức: giữ giá bán, tính lại lợi nhuận, không ảnh hưởng báo giá và phiếu", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-CHG-SBP-001 Giá bán giữ nguyên, lợi nhuận tính lại, bật cảnh báo", { tag: ["@flow", "@gia-mua-dinh-muc", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingBuyingFlow("FLOW-CHG-SBP-001", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-SBP-002 Báo giá và phiếu không bị ảnh hưởng", { tag: ["@flow", "@gia-mua-dinh-muc", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingBuyingFlow("FLOW-CHG-SBP-002", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-SBP-003 Định giá xử lý: Đã giải quyết", { tag: ["@flow", "@gia-mua-dinh-muc", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingBuyingFlow("FLOW-CHG-SBP-003", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-SBP-004 Định giá xử lý: cập nhật giá bán theo giá mua mới", { tag: ["@flow", "@gia-mua-dinh-muc", "@p1"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingBuyingFlow("FLOW-CHG-SBP-004", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-SBP-005 Nhập hàng loạt giá mua chỉ cảnh báo dòng có thay đổi", { tag: ["@flow", "@gia-mua-dinh-muc", "@p2"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingBuyingFlow("FLOW-CHG-SBP-005", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-SBP-006 Đầu mục đang Tắt: sửa giá mua đầu vào, SBP, SSP đều bị chặn", { tag: ["@flow", "@gia-mua-dinh-muc", "@p2"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingBuyingFlow("FLOW-CHG-SBP-006", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });

  test("FLOW-CHG-SBP-007 Cảnh báo đã có giữ nguyên sau Tắt rồi Bật đầu mục", { tag: ["@flow", "@gia-mua-dinh-muc", "@p2"] }, async ({ testRun }) => {
    test.setTimeout(900_000);
    await expect(runPendingBuyingFlow("FLOW-CHG-SBP-007", testRun), 'Helper chạy hết các bước kiểm tra').resolves.toBeUndefined();
  });
});
