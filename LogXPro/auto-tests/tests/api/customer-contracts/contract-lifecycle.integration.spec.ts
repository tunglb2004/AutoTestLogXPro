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
test.describe("Gia hạn hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/extensions";
  test("CTR-137 Gia hạn kèm file phụ lục", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const file = F.pdf('phu-luc-gia-han.pdf');
    expect((await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { extension: jsonPart('extension', { newExpiry: addDays(c.contract.effectiveTo, 90) }), file } })).status()).toBe(200);
    const after = await seed.getContract(c.contract.id);
    const ext = after.extensions.at(-1);
    expect(ext.hasFile).toBe(true);
    expect(String(ext.annexCode ?? '')).toMatch(/^PLC/);
    const dl = await http.call('GET /api/contracts/{id}/extensions/{sequence}/file', { token: D, params: { id: c.contract.id, sequence: ext.sequence } });
    expect(dl.status()).toBe(200);
  });
});

test.describe("Tái ký hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/resign";
  test("CTR-177 File phụ lục kèm tái ký", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const res = await http.call(API, { token: D, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', C.resignContract(addDays(c.contract.effectiveTo, 1))), file: F.pdf('tai-ky.pdf'), annexFile: F.pdf('phu-luc-tai-ky.pdf') } });
    expect([200, 201]).toContain(res.status());
    expect((await seed.getContract((await data(res)).id)).annexes.length).toBeGreaterThan(0);
  });
});
