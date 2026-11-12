/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { configOf, p0Items, setItemStatus } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { ensureContractorLines, priceLine, changeLinePrice, activeSheetOf } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { sbpLines, setBenchmark } from '../../../src/gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { sspLines, setSelling } from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { buildP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { rfqInPricing } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import { SspMap, createInternalQuote, issueInternalQuote } from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
import { createCustomerQuotation, setQuotationSettings, getCustomerQuotation, lineByName } from '../../../src/quan-ly-bao-gia/data/bgkh.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Giá bán định mức (SSP)", () => {
  test("SSP-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@gia-ban-dinh-muc", "@p1"] }, async ({ http, testRun, roles }) => {
    const apis = ["GET /api/standard-selling-prices/groups", "GET /api/standard-selling-prices", "GET /api/standard-selling-prices/{id}", "PUT /api/standard-selling-prices/{id}/selling-price", "PUT /api/standard-selling-prices/selling-prices", "POST /api/standard-selling-prices/{id}/acknowledgement", "GET /api/standard-selling-prices/{id}/history"];
    for (const api of apis) {
      const p = await testRun.prepare(api, "dp");
      const before = await testRun.snapshot(api, p.params ?? {}, "dp");
      for (const t of [{ name: "không gửi header Authorization", token: null as string | null }, ...badTokens(roles.dp)]) {
        const res = await http.call(api, { params: p.params, query: p.query, token: t.token, json: api.startsWith('GET') || api.startsWith('DELETE') ? undefined : {} });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await testRun.snapshot(api, p.params ?? {}, "dp"), `${api}: dữ liệu, trạng thái, lịch sử không được đổi`).toEqual(before);
    }
  });
});
