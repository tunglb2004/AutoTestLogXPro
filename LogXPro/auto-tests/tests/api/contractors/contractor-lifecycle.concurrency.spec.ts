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
import { schemas } from '../../../src/api/schemas/contractor.schema';
test.describe("Kích hoạt lại nhà thầu", () => {
  const API = "POST /api/contractors/{id}/reactivate";
  test("VDR-148 Kích hoạt lần 2", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const first = await http.call(API, p);
    expect(first.status()).toBeLessThan(300);
    const after = await seed.snapshot(API, p);
    const second = await http.call(API, p);
    expect([400, 409]).toContain(second.status());
    expect(await seed.snapshot(API, p)).toEqual(after);
  });
});

test.describe("Dừng hợp tác nhà thầu", () => {
  const API = "POST /api/contractors/{id}/terminate";
  test("VDR-163 Dừng hợp tác lần 2", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const first = await http.call(API, p);
    expect(first.status()).toBeLessThan(300);
    const after = await seed.snapshot(API, p);
    const second = await http.call(API, p);
    expect([400, 409]).toContain(second.status());
    expect(await seed.snapshot(API, p)).toEqual(after);
  });
});
