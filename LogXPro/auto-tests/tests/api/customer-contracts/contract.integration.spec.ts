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
test.describe("Upload hợp đồng đầu tiên (chuyển Lead thành khách hàng)", () => {
  const API = "POST /api/contracts";
  test("CTR-028 Định dạng và dung lượng file scan", { tag: ["@api", "@p2"] }, async ({ http, seed, roles, leadApi, contractApi, customerApi, contractorApi, contractorContractApi }) => {
    const N = roles.nvkdA.accessToken;
    const D = roles.dvkhA.accessToken;
    const up = async (leadId: string, extra: Record<string, unknown> = {}, files: Record<string, any> = {}) => http.call('POST /api/contracts', { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(leadId, roles.dvkhA.userId, extra)), file: F.pdf(), ...files } });
    for (const file of [F.REAL.other('exe'), F.REAL.pdf21()]) {
      const lead = await seed.lead();
      const res = await http.call(API, { token: N, multipart: { contract: jsonPart('contract', C.uploadContract(lead.id, roles.dvkhA.userId)), file } });
      expect([400, 413], file.name).toContain(res.status());
      expect((await seed.getLead(lead.id)).status).toBe('ACTIVE');
    }
    expect(typeof up).toBe('function');
  });
});
