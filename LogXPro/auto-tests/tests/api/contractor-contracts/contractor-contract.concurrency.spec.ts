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
test.describe("Thêm hợp đồng nhà thầu đầu tiên", () => {
  const API = "POST /api/contractor-contracts";
  test("CTV-022 Gửi lại cùng request", { tag: ["@api", "@p1"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const p = await seed.prepare(API);
    expect([200, 201]).toContain((await http.call(API, p)).status());
    expect([400, 409]).toContain((await http.call(API, p)).status());
    expect((await seed.getContractor(p.resourceId!)).contracts).toHaveLength(1);
  });
  test("CTV-023 2 request cho cùng nhà thầu đồng thời", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const Q = roles.qlnt.accessToken;
    const st = async (id: string) => (await seed.getContractorContract(id)).status.code;
    const v = await seed.contractor();
    const rs = await Promise.all([1, 2].map(() => http.call(API, { token: Q, multipart: { contract: jsonPart('contract', VC.newContractorContract(v.id)), file: F.pdf() } })));
    expect(rs.filter((r) => r.status() === 200 || r.status() === 201)).toHaveLength(1);
    expect((await seed.getContractor(v.id)).contracts).toHaveLength(1);
  });
});
