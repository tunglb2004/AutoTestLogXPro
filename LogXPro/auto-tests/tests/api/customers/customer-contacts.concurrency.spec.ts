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
test.describe("Thêm đầu mối khách hàng", () => {
  const API = "POST /api/customers/{id}/contacts";
  test("CUS-055 Gửi lại cùng đầu mối", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customer();
    const json = L.contactBody();
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json })).status()).toBe(201);
    expect((await http.call(API, { token: D, params: { id: k.customerId }, json })).status()).toBeLessThan(500);
  });
});

test.describe("Đặt đầu mối chính của khách hàng", () => {
  const API = "POST /api/customers/{id}/contacts/{contactId}/primary";
  test("CUS-082 Gọi 2 lần cùng đầu mối", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const D = roles.dvkhA.accessToken;
    const k = await seed.customerWithContacts(2);
    const sub = k.customer.contacts.find((x: any) => !x.primary);
    for (let i = 0; i < 2; i++) expect((await http.call(API, { token: D, params: { id: k.customerId, contactId: sub.id } })).status()).toBe(200);
    expect((await seed.getCustomer(k.customerId)).contacts.filter((x: any) => x.primary).map((x: any) => x.id)).toEqual([sub.id]);
  });
});
