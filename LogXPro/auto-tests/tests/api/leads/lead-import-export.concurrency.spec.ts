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
test.describe("Import Lead từ Excel", () => {
  const API = "POST /api/leads/import";
  test("LEAD-063 Import lại cùng file", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const taxes = [L.taxCode(), L.taxCode()];
    const file = await seed.importFile(taxes.map((taxCode) => ({ taxCode })));
    expect((await http.call(API, { token: T, multipart: { file } })).status()).toBe(200);
    const again = await http.call(API, { token: T, multipart: { file } });
    expect(again.status()).toBe(200);
    const d = await data(again);
    expect(d.created).toBe(0);
    expect(d.skippedDuplicate).toBe(2);
    for (const t of taxes) expect(await seed.leadsByTax(t)).toHaveLength(1);
  });
});
