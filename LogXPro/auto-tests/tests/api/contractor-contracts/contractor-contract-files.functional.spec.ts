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
import { schemas } from '../../../src/api/schemas/contractor-contract.schema';
test.describe("Tải file scan hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/{id}/file";
  test("CTV-153 Tải file scan HĐ nhà thầu", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    expect(sha256(await res.body())).toBe(sha256(p.expectedFile!.buffer));
  });
  test("CTV-160 Tải ở mọi trạng thái và có lịch sử", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const d = await seed.terminatedContractor();
    const before = (await seed.history('/api/contractor-contracts', d.contract.id, 'qlnt')).length;
    expect((await http.call(API, { token: Q, params: { id: d.contract.id } })).status()).toBe(200);
    expect((await seed.history('/api/contractor-contracts', d.contract.id, 'qlnt')).length).toBeGreaterThan(before);
  });
});
