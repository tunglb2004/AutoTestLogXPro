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
test.describe("Chuyển người phụ trách khách hàng", () => {
  const API = "POST /api/customers/{id}/transfer-account-manager";
  test("CUS-129 Người cũ gửi lại yêu cầu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const p = await seed.prepare(API);
    expect((await http.call(API, p)).status()).toBe(204);
    expect([403, 404]).toContain((await http.call(API, p)).status());
  });
  test("CUS-130 Chuyển song song cho 2 người", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    const rs = await Promise.all(['dvkhB', 'dvkhC'].map((r) => http.call(API, { token: D, params: { id: k.customerId }, json: { newAccountManagerId: roles[r as 'dvkhB' | 'dvkhC'].userId, reason: K.TRANSFER_REASON } })));
    const codes = rs.map((r) => r.status());
    expect(codes.filter((c) => c === 204)).toHaveLength(1);
    const winner = codes[0] === 204 ? 'dvkhB' : 'dvkhC';
    const cus = await seed.getCustomer(k.customerId, winner);
    expect(cus.accountManagerId).toBe(roles[winner].userId);
    expect((await seed.getContract(k.contract.id, winner)).accountManagerId).toBe(roles[winner].userId);
  });
});
