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
import { schemas } from '../../../src/api/schemas/contractor.schema';
test.describe("Danh sách, tìm kiếm, lọc nhà thầu", () => {
  const API = "GET /api/contractors";
  test("VDR-005 `perPage` ở biên 1, 100 và 101; `page` = 0", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const one = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: 1 } });
    expect(one.status()).toBe(200);
    expect(items(await data(one)).length).toBeLessThanOrEqual(1);
    const max = await http.call(API, { ...p, query: { ...p.query, page: 1, perPage: 100 } });
    expect(max.status()).toBe(200);
    expect(items(await data(max)).length).toBeLessThanOrEqual(100);
    for (const q of [{ page: 1, perPage: 101 }, { page: 0, perPage: 20 }]) {
      const res = await http.call(API, { ...p, query: { ...p.query, ...q } });
      expect(res.status(), JSON.stringify(q)).toBe(400);
    }
  });
  test("VDR-006 Ngày sai định dạng, trạng thái lạ", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    for (const q of [{ createdFrom: '2026-02-30' }, { status: 'XYZ' }]) expect((await http.call(API, { token: Q, query: q })).status(), JSON.stringify(q)).toBe(400);
  });
  test("VDR-012 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Tạo nhà thầu", () => {
  const API = "POST /api/contractors";
  test("VDR-015 Thiếu từng trường bắt buộc", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    for (const f of ['name', 'taxCode', 'serviceTypes', 'tier', 'recommendedCapacity', 'capabilityDescription', 'performanceScore', 'contacts']) {
      const json: any = await seed.contractorBody();
      delete json[f];
      expect((await http.call(API, { token: Q, json })).status(), f).toBe(400);
      if (json.taxCode) expect(await seed.contractorsByTax(json.taxCode)).toHaveLength(0);
    }
  });
  test("VDR-016 Sai định dạng MST, SĐT, email, `backupContractorId`", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    for (const v of [{ taxCode: '12ab' }, { phone: '123' }, { email: 'a@' }, { backupContractorId: 'abc' }]) expect((await http.call(API, { token: Q, json: await seed.contractorBody(v) })).status(), JSON.stringify(v)).toBe(400);
  });
  test("VDR-017 MST 9/10/11/13/14 số", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    for (const len of [9, 10, 11, 13, 14]) {
      const res = await http.call(API, { token: roles.qlnt.accessToken, json: await seed.contractorBody({ taxCode: randDigits(len, true) }) });
      if (len === 10 || len === 13) expect(res.status(), `MST ${len} số`).toBe(201);
      else expect(res.status(), `MST ${len} số`).toBe(400);
    }
  });
  test("VDR-018 `performanceScore` 0, 5, 5.01, -0.01", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    for (const [score, ok] of [[0, true], [5, true], [5.01, false], [-0.01, false]] as const) {
      const res = await http.call(API, { token: Q, json: await seed.contractorBody({ performanceScore: score }) });
      expect(res.status(), String(score)).toBe(ok ? 201 : 400);
    }
  });
  test("VDR-019 `name` 255/256, `operationalNote` 2000/2001", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    for (const [v, ok] of [[{ name: textOfLength(255) }, true], [{ name: textOfLength(256) }, false], [{ operationalNote: textOfLength(2000) }, true], [{ operationalNote: textOfLength(2001) }, false]] as const) {
      const res = await http.call(API, { token: Q, json: await seed.contractorBody(v as any) });
      expect(res.status(), Object.keys(v)[0]).toBe(ok ? 201 : 400);
    }
  });
  test("VDR-030 Body JSON sai cú pháp", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const before = await seed.snapshot(API, p);
    const res = await http.call(API, { ...p, json: undefined, multipart: undefined, rawBody: malformedJson });
    expect(res.status()).toBe(400);
    const b = await body(res);
    expect(await seed.snapshot(API, p)).toEqual(before);
  });
});

test.describe("Sửa hồ sơ nhà thầu", () => {
  const API = "PUT /api/contractors/{id}";
  test("VDR-058 Thiếu trường bắt buộc", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const h = await seed.contractor();
    for (const v of [{ name: undefined }, { serviceTypes: [] }, { taxCode: undefined }]) expect((await http.call(API, { token: Q, params: { id: h.id }, json: V.contractorUpdateBody(h, v) })).status(), JSON.stringify(v)).toBe(400);
  });
  test("VDR-059 `performanceScore` 5/5.01; `address` 500/501", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    for (const [v, ok] of [[{ performanceScore: 5 }, true], [{ performanceScore: 5.01 }, false], [{ address: textOfLength(500, 'Số 5 đường Trần Phú ') }, true], [{ address: textOfLength(501, 'Số 5 đường Trần Phú ') }, false]] as const) {
      const h = await seed.contractor();
      expect((await http.call(API, { token: Q, params: { id: h.id }, json: V.contractorUpdateBody(h, v as any) })).status(), Object.keys(v)[0]).toBe(ok ? 200 : 400);
    }
  });
  test("VDR-064 Nhà thầu không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Số liệu tổng quan nhà thầu", () => {
  const API = "GET /api/contractors/stats";
  test("VDR-046 Gửi sai phương thức HTTP", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, method: 'DELETE' });
    expect(res.status()).toBe(405);
  });
});

test.describe("Chi tiết nhà thầu", () => {
  const API = "GET /api/contractors/{id}";
  test("VDR-050 `id` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("VDR-053 Nhà thầu không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});

test.describe("Xóa nhà thầu", () => {
  const API = "DELETE /api/contractors/{id}";
  test("VDR-071 `id` sai định dạng UUID", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: 'abc' } });
    expect(res.status()).toBe(400);
  });
  test("VDR-074 Nhà thầu không tồn tại", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, { ...p, params: { ...p.params, id: seed.randomId() } });
    expect(res.status()).toBe(404);
    const b = await body(res);
  });
});
