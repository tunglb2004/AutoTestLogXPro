import { withLegSandbox, expectSuccessEnvelope } from '../../../src/cau-hinh-chang/data/leg-sandbox';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import * as R_cau_hinh_chang_quy_tac_chang from '../../../src/cau-hinh-chang/api/schemas/quy-tac-chang.schema';

import { p0Base, createOrder, orderBody } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { serviceEntry } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)", () => {
  test("LEG-007 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/leg-rules";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_chang_quy_tac_chang.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["code", "name", "status", "executionScope", "transportMode", "cargoLoadType", "originPointType", "destinationPointType", "description", "createdBy", "createdAt", "legs"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("LEG-022 Cấu trúc phản hồi thành công", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ testRun }) => {

    await withLegSandbox(testRun, async (s) => {
      const { response } = await s.create(await s.available());
      expectStatusIn(response, '200/201');
      await expectSuccessEnvelope(response);
    });

  });

  test("LEG-027 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/leg-rules/{code}";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_chang_quy_tac_chang.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["code", "name", "status", "executionScope", "transportMode", "cargoLoadType", "originPointType", "destinationPointType", "description", "createdBy", "createdAt", "legs"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("LEG-036 Phản hồi thành công không có body", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available()); const b = s.fromDetail(rule); b.description = tagged('AT Sửa mô tả');
      const res = await s.update(rule.code, b); expectStatusIn(res, '200/204'); expect(await res.text(), 'Response cập nhật rỗng').toBe('');
    });
  });

  test("LEG-043 Phản hồi thành công không có body", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available());
      const res = await s.remove(rule.code); expectStatusIn(res, '200/204'); expect(await res.text()).toBe('');
    });
  });

  test("LEG-048 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun }) => {
    const API = "GET /api/leg-rules/{code}/history";
    const p = await testRun.prepare(API, "admin");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_cau_hinh_chang_quy_tac_chang.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    expect(Array.isArray(b.data.items), "data.items là mảng").toBe(true);
    if (b.data.meta?.pagination) {
      if (b.data.meta?.pagination) { expect(b.data.meta.pagination).toHaveProperty("total"); expect(b.data.meta.pagination).toHaveProperty("currentPage"); }
    }
    expect(b.data.items.length, "Cần ít nhất 1 phần tử để kiểm field").toBeGreaterThan(0);
    const row = b.data.items[0];
    for (const k of ["id", "at", "actorUserId", "actorEmail", "actorName", "actorEmployeeCode", "action", "summary", "targetEntity", "targetId", "oldValue", "newValue", "event", "eventLabel"]) expect(row, `mỗi phần tử có ${k}`).toHaveProperty(k);
    if (row?.id) expect(String(row.id), "id dạng UUID").toMatch(/^[0-9a-f-]{36}$/i);
    for (const [k, v] of Object.entries(row ?? {})) if (/amount|price|total|revenue|cost|fee/i.test(k) && v !== null && typeof v !== "object") expect(typeof v, `${k} là số`).toBe("number");
  });

  test("LEG-057 Phản hồi thành công không có body", { tag: ["@api", "@cau-hinh-chang", "@p3"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const { rule } = await s.create(await s.available()); const res = await s.status(rule.code, 'INACTIVE'); expectStatusIn(res, '200/204'); expect(await res.text()).toBe('');
    });
  });

  test("LEG-066 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@cau-hinh-chang", "@p2"] }, async ({ http, testRun, tok }) => {
    await withLegSandbox(testRun, async (s) => {
      const res = await s.simulate(await s.simulationInput()); expectStatusIn(res, '200/204'); const d = await expectSuccessEnvelope(res);
      for (const f of ['outcome','executionScope','rule','candidateRuleCodes','legs']) expect(Object.prototype.hasOwnProperty.call(d,f), f).toBe(true);
      expect(d.outcome).toBe('MATCHED'); expect(d.executionScope).toBe('DOMESTIC'); expect(d.rule).toEqual(expect.objectContaining({ code: expect.any(String), name: expect.any(String) }));
      expect(Array.isArray(d.candidateRuleCodes)).toBe(true); expect(Array.isArray(d.legs)).toBe(true); expect(d.legs.length).toBeGreaterThan(0);
      for (const l of d.legs) { expect(Number.isInteger(l.position)).toBe(true); expect(typeof l.name).toBe('string'); expect(Array.isArray(l.services)).toBe(true); expect(typeof l.empty).toBe('boolean'); }
    });
  });
});
