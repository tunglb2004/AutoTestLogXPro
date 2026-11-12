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
test.describe("Hủy hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/cancel";
  test("CTR-125 Hủy lần 2", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const first = await http.call(API, p);
    expect(first.status()).toBeLessThan(300);
    const after = await seed.snapshot(API, p);
    const second = await http.call(API, p);
    expect([400, 409]).toContain(second.status());
    expect(await seed.snapshot(API, p)).toEqual(after);
  });
});

test.describe("Gia hạn hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/extensions";
  test("CTR-139 Gửi lại cùng `newExpiry`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const newExpiry = addDays(c.contract.effectiveTo, 60);
    expect((await http.call(API, { token: D, params: { id: c.contract.id }, json: { newExpiry } })).status()).toBe(200);
    expect([400, 409]).toContain((await http.call(API, { token: D, params: { id: c.contract.id }, json: { newExpiry } })).status());
    expect((await seed.getContract(c.contract.id)).extensions).toHaveLength(1);
  });
});

test.describe("Tái ký hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/resign";
  test("CTR-175 Gửi lại cùng request tái ký", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const p = await seed.prepare(API);
    expect([200, 201]).toContain((await http.call(API, p)).status());
    expect([400, 409]).toContain((await http.call(API, p)).status());
    expect((await seed.getContract(String(p.params!.id))).resignedInto).toBeTruthy();
  });
});

test.describe("Dừng khai thác hợp đồng khách hàng", () => {
  const API = "POST /api/contracts/{id}/suspend";
  test("CTR-187 Dừng lần 2", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const first = await http.call(API, p);
    expect(first.status()).toBeLessThan(300);
    const after = await seed.snapshot(API, p);
    const second = await http.call(API, p);
    expect([400, 409]).toContain(second.status());
    expect(await seed.snapshot(API, p)).toEqual(after);
  });
});
