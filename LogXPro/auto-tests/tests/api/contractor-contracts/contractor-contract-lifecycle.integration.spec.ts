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
test.describe("Gia hạn hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/extensions";
  test("CTV-146 Gia hạn kèm file phụ lục", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, multipart: { extension: jsonPart('extension', { newExpiry: addDays(c.contract.effectiveTo, 90), annexName: 'Phụ lục gia hạn quý' }), file: F.pdf('gia-han.pdf') } })).status()).toBe(200);
    const a = (await seed.getContractorContract(c.contract.id)).annexes.find((x: any) => x.name === 'Phụ lục gia hạn quý');
    expect(a?.code).toMatch(/^PLV/);
  });
});

test.describe("Tái ký hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/resign";
  test("CTV-180 File scan sai định dạng", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', VC.resignContractorContract(addDays(c.contract.effectiveTo, 1))), file: F.exe() } })).status()).toBe(400);
  });
});
