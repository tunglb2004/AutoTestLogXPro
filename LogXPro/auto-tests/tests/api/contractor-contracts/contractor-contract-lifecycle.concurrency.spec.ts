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
test.describe("Hủy hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/cancel";
  test("CTV-134 Hủy lần 2", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const first = await http.call(API, p);
    expect(first.status()).toBeLessThan(300);
    const after = await seed.snapshot(API, p);
    const second = await http.call(API, p);
    expect([400, 409]).toContain(second.status());
    expect(await seed.snapshot(API, p)).toEqual(after);
  });
});

test.describe("Gia hạn hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/extensions";
  test("CTV-148 Gửi lại cùng `newExpiry`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    const newExpiry = addDays(c.contract.effectiveTo, 60);
    expect((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { newExpiry } })).status()).toBe(200);
    expect([400, 409]).toContain((await http.call(API, { token: Q, params: { id: c.contract.id }, json: { newExpiry } })).status());
    expect((await seed.getContractorContract(c.contract.id)).extensions).toHaveLength(1);
  });
});

test.describe("Tái ký hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/resign";
  test("CTV-178 Gửi lại cùng request", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const p = await seed.prepare(API);
    expect([200, 201]).toContain((await http.call(API, p)).status());
    expect([400, 409]).toContain((await http.call(API, p)).status());
    expect((await seed.getContractorContract(String(p.params!.id))).resignedInto).toBeTruthy();
  });
});

test.describe("Dừng khai thác hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/suspend";
  test("CTV-191 Dừng lần 2", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const first = await http.call(API, p);
    expect(first.status()).toBeLessThan(300);
    const after = await seed.snapshot(API, p);
    const second = await http.call(API, p);
    expect([400, 409]).toContain(second.status());
    expect(await seed.snapshot(API, p)).toEqual(after);
  });
});
