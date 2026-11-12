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
  test("CTR-081 Thiếu tên hoặc file", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    for (const multipart of [{ annex: jsonPart('annex', { description: 'Thiếu tên' }), file: F.pdf() }, { annex: jsonPart('annex', C.annexMeta()) }]) {
      expect((await http.call(API, { token: D, params: { id: c.contract.id }, multipart })).status()).toBe(400);
    }
    expect((await seed.getContract(c.contract.id)).annexes).toHaveLength(0);
  });
  test("CTR-082 File 5MB và 5MB + 1 byte; tên 255/256", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.customer();
    const send = (meta: any, file: any) => http.call(API, { token: D, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', meta), file } });
    expect([200, 201]).toContain((await send(C.annexMeta(), F.pdfMb(5))).status());
    expect([400, 413]).toContain((await send(C.annexMeta(), F.pdfMb(5, 1))).status());
    expect([200, 201]).toContain((await send(C.annexMeta({ name: textOfLength(255) }), F.pdf())).status());
    expect((await send(C.annexMeta({ name: textOfLength(256) }), F.pdf())).status()).toBe(400);
    expect((await seed.getContract(c.contract.id)).annexes).toHaveLength(2);
  });
  test("CTR-090 Hợp đồng không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Sửa phụ lục hợp đồng khách hàng", () => {
  const API = "PUT /api/contracts/{id}/annexes/{annexId}";
  test("CTR-094 Tên rỗng", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.contractWithAnnex();
    expect((await http.call(API, { token: D, params: { id: c.contract.id, annexId: c.annex.id }, json: { name: '' } })).status()).toBe(400);
  });
  test("CTR-095 `description` 1000/1001 ký tự", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const c = await seed.contractWithAnnex();
    expect((await http.call(API, { token: D, params: { id: c.contract.id, annexId: c.annex.id }, json: C.annexMeta({ description: textOfLength(1000) }) })).status()).toBe(200);
    expect((await http.call(API, { token: D, params: { id: c.contract.id, annexId: c.annex.id }, json: C.annexMeta({ description: textOfLength(1001) }) })).status()).toBe(400);
  });
  test("CTR-098 `annexId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CTR-101 Phụ lục không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Xóa phụ lục hợp đồng khách hàng", () => {
  const API = "DELETE /api/contracts/{id}/annexes/{annexId}";
  test("CTR-107 `annexId` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CTR-110 Phụ lục không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, annexId: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Tải file phụ lục hợp đồng khách hàng", () => {
  const API = "GET /api/contracts/{id}/annexes/{annexId}/file";
  test("CTR-115 `id` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("CTR-117 File phụ lục không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
