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
import { schemas } from '../../../src/api/schemas/lead.schema';
test.describe("Thêm đầu mối liên hệ Lead", () => {
  const API = "POST /api/leads/{id}/contacts";
  test("LEAD-113 Gửi lại cùng đầu mối", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const json = L.contactBody();
    const r1 = await http.call(API, { token: T, params: { id: a.id }, json });
    const r2 = await http.call(API, { token: T, params: { id: a.id }, json });
    expect(r1.status()).toBe(201);
    expect(r2.status()).toBeLessThan(500);
  });
});

test.describe("Đặt đầu mối chính của Lead", () => {
  const API = "POST /api/leads/{id}/contacts/{contactId}/primary";
  test("LEAD-141 Đặt chính 2 lần cho cùng đầu mối", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.leadWithContacts(2);
    const sub = a.contacts.find((x: any) => !x.primary);
    expect((await http.call(API, { token: T, params: { id: a.id, contactId: sub.id } })).status()).toBe(200);
    expect([200, 400, 409]).toContain((await http.call(API, { token: T, params: { id: a.id, contactId: sub.id } })).status());
    expect((await seed.getLead(a.id)).contacts.filter((x: any) => x.primary).map((x: any) => x.id)).toEqual([sub.id]);
  });
});
