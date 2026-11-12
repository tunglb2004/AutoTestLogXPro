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
test.describe("Thêm phụ lục hợp đồng nhà thầu", () => {
  const API = "POST /api/contractor-contracts/{id}/annexes";
  test("CTV-066 File 20MB và 20MB + 1 byte", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    const send = (file: any) => http.call(API, { token: Q, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', C.annexMeta()), file } });
    expect([200, 201]).toContain((await send(F.REAL.pdf20())).status());
    expect([400, 413]).toContain((await send(F.pdfMb(20, 1))).status());
  });
  test("CTV-067 Thiếu tên hoặc file", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorWithContract();
    for (const multipart of [{ annex: jsonPart('annex', { description: 'Thiếu tên' }), file: F.pdf() }, { annex: jsonPart('annex', C.annexMeta()) }]) expect((await http.call(API, { token: Q, params: { id: c.contract.id }, multipart })).status()).toBe(400);
  });
  test("CTV-074 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Sửa phụ lục hợp đồng nhà thầu", () => {
  const API = "PUT /api/contractor-contracts/{id}/annexes/{annexId}";
  test("CTV-079 Tên rỗng", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorContractWithAnnex();
    expect((await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id }, json: { name: '' } })).status()).toBe(400);
  });
  test("CTV-080 `description` 1000/1001", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const c = await seed.contractorContractWithAnnex();
    expect((await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id }, json: C.annexMeta({ description: textOfLength(1000) }) })).status()).toBe(200);
    expect((await http.call(API, { token: Q, params: { id: c.contract.id, annexId: c.annex.id }, json: C.annexMeta({ description: textOfLength(1001) }) })).status()).toBe(400);
  });
  test("CTV-083 `annexId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CTV-086 Phụ lục không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Xóa phụ lục hợp đồng nhà thầu", () => {
  const API = "DELETE /api/contractor-contracts/{id}/annexes/{annexId}";
  test("CTV-091 `annexId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CTV-094 Phụ lục không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Tải phụ lục hợp đồng nhà thầu", () => {
  const API = "GET /api/contractor-contracts/{id}/annexes/{annexId}/file";
  test("CTV-099 `id` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CTV-101 File phụ lục hđ nhà thầu không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Xem phụ lục PDF trong trình xem", () => {
  const API = "GET /api/contractor-contracts/{id}/annexes/{annexId}/view";
  test("CTV-108 `annexId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CTV-110 Phụ lục không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
