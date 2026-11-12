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
test.describe("Tải file của lần gia hạn", () => {
  const API = "GET /api/contracts/{id}/extensions/{sequence}/file";
  test("CTR-145 Header của file lần gia hạn", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h['content-type'] ?? '').toContain(p.expectedFile!.mimeType);
    expect(decodeURIComponent(h['content-disposition'] ?? '')).toContain(p.expectedFile!.name);
    expect(Number(h['content-length'] ?? (await res.body()).length)).toBeGreaterThan(0);
  });
});

test.describe("Tải file scan hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/{id}/file";
  test("CTR-152 Header của file scan HĐ", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h['content-type'] ?? '').toContain(p.expectedFile!.mimeType);
    expect(decodeURIComponent(h['content-disposition'] ?? '')).toContain(p.expectedFile!.name);
    expect(Number(h['content-length'] ?? (await res.body()).length)).toBeGreaterThan(0);
  });
});
