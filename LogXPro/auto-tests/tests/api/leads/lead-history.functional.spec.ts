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
import { schemas } from '../../../src/api/schemas/lead.schema';
test.describe("Lịch sử thao tác Lead", () => {
  const API = "GET /api/leads/{id}/history";
  test("LEAD-187 Xem lịch sử thao tác Lead", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const res = await http.call(API, p);
    expect(res.status()).toBe(200);
    const list = items(await data(res));
    expect(list.length).toBeGreaterThan(0);
    const times = list.map((e: any) => Date.parse(e.occurredAt ?? e.performedAt ?? e.createdAt ?? e.at));
    expect(times).toEqual([...times].sort((a, b) => b - a));
    for (const e of list) expect(Object.keys(e).length).toBeGreaterThan(2);
  });
  test("LEAD-188 Lọc lịch sử theo hành động, người thực hiện, khoảng thời gian, từ khóa", { tag: ["@api", "@p3"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    const all = items(await data(await http.call(API, p)));
    expect(all.length).toBeGreaterThan(0);
    const first = all[0];
    const code = first.eventCode ?? first.event ?? first.action;
    const byEvent = items(await data(await http.call(API, { ...p, query: { ...p.query, eventCode: code } })));
    expect(byEvent.length).toBeGreaterThan(0);
    for (const e of byEvent) expect(e.eventCode ?? e.event ?? e.action).toBe(code);
    const actor = first.actorUserId ?? first.performedBy ?? first.actorId;
    if (actor) {
      const byActor = items(await data(await http.call(API, { ...p, query: { ...p.query, actorUserId: actor } })));
      for (const e of byActor) expect(e.actorUserId ?? e.performedBy ?? e.actorId).toBe(actor);
    }
    const future = items(await data(await http.call(API, { ...p, query: { ...p.query, from: '2999-01-01T00:00:00Z' } })));
    expect(future.length).toBe(0);
  });
});
