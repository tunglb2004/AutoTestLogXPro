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
test.describe("Thêm phụ lục hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/annexes";
  test("CTR-087 Gửi lại cùng phụ lục", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const meta = C.annexMeta();
    for (let i = 0; i < 2; i++) expect([200, 201]).toContain((await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', meta), file: F.pdf() } })).status());
    const codes = (await seed.getContract(c.contract.id)).annexes.map((a: any) => a.code);
    expect(new Set(codes).size).toBe(2);
    const num = (s: string) => Number(s.replace(/\D/g, ''));
    expect(num(codes[1])).not.toBe(num(codes[0]));
  });
});
