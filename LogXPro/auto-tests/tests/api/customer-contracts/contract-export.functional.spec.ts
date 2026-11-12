/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from '../../../src/fixtures/seed.fixture';
import { body, data, items, jsonPart } from '../../../src/api/http.client';
import { badTokens } from '../../../src/fixtures/auth.fixture';
import { apiError, apiSuccess, hasNoStacktrace } from '../../../src/api/schemas/common.schema';
import { sha256 } from '../../../src/utils/file-check';
import { malformedJson } from '../../../src/data/payloads';
import * as F from '../../../src/data/file.factory';
import * as L from '../../../src/data/lead.factory';
import * as C from '../../../src/data/contract.factory';
import * as K from '../../../src/data/customer.factory';
import * as V from '../../../src/data/contractor.factory';
import * as VC from '../../../src/data/contractor-contract.factory';
import * as P from '../../../src/data/payloads';
import { addDays, addMonths, today } from '../../../src/utils/dates';
import { TEST_RUN_ID, randDigits, randInt, textOfLength, uuid } from '../../../src/utils/test-run';
import { xlsxDataRows } from '../../../src/utils/file-check';
import { schemas } from '../../../src/api/schemas/contract.schema';
test.describe("Xuất danh sách hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/export";
  test("CTR-040 Không có dữ liệu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    expect((await http.call(API, { token: D, query: { search: `khong-ton-tai-${uuid()}` } })).status()).toBe(400);
  });
  test("CTR-041 Không xuất HĐ ngoài phạm vi", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const m = await seed.customer({ manager: 'dvkhB' });
    const res = await http.call(API, { token: D });
    expect(res.status()).toBe(200);
    expect((await res.body()).includes(Buffer.from(m.contract.code))).toBe(false);
  });
  test("CTR-042 Kết hợp bộ lọc", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const a = await seed.customer({ tier: 'STRATEGIC' });
    const res = await http.call(API, { token: D, query: { customerTier: 'STRATEGIC', expiryFrom: a.contract.effectiveTo, expiryTo: a.contract.effectiveTo } });
    expect([200, 400]).toContain(res.status());
    if (res.status() === 200) expect((await res.body()).includes(Buffer.from(a.contract.code))).toBe(true);
  });
  test("CTR-038 Xuất theo trạng thái", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect([200]).toContain(res.status());
    const b = await body(res);
    if (res.status() !== 204 && typeof b === 'object') expect(b?.success).toBe(true);
    const d = b?.data;
  });
});
