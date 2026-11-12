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
import { schemas } from '../../../src/api/schemas/customer.schema';
test.describe("Xuất danh sách khách hàng", () => {
  const API = "GET /api/customers/export";
  test("CUS-023 Khoảng ngày tạo 1 ngày", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    const res = await http.call(API, { token: D, query: { createdFrom: today(), createdTo: today() } });
    expect(res.status()).toBe(200);
    expect((await res.body()).includes(Buffer.from((await seed.getCustomer(k.customerId)).taxCode))).toBe(true);
  });
  test("CUS-024 Ngày sai định dạng", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    expect((await http.call(API, { token: D, query: { createdFrom: '04/11/2026' } })).status()).toBe(400);
  });
  test("CUS-027 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});
