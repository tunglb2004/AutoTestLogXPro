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
test.describe("Đính kèm tài liệu Lead", () => {
  const API = "POST /api/leads/{id}/documents";
  test("LEAD-167 Upload cùng file 2 lần", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const T = roles.nvkdA.accessToken;
    const a = await seed.lead();
    const file = F.pdf('hd.pdf');
    expect((await http.call(API, { token: T, params: { id: a.id }, multipart: { file } })).status()).toBe(201);
    const r2 = await http.call(API, { token: T, params: { id: a.id }, multipart: { file } });
    expect(r2.status()).toBeLessThan(500);
    const docs = (await seed.getLead(a.id)).documents;
    expect(new Set(docs.map((d: any) => d.id)).size).toBe(docs.length);
  });
});
