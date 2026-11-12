/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';
import * as R_quan_tri_phan_quyen_xac_thuc from '../../../src/quan-tri-phan-quyen/api/schemas/xac-thuc.schema';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Xác thực và phiên đăng nhập", () => {
  test("AUTH-011 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'hop-dong');
    const res = await login(testRun, u.email, u.password);
    expectStatusIn(res, '200');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['accessToken', 'refreshToken', 'expiresInSeconds', 'passwordChangeRequired']) expect(b.data, `data có ${k}`).toHaveProperty(k);
    expect(typeof b.data.expiresInSeconds).toBe('number');
    expect(typeof b.data.passwordChangeRequired).toBe('boolean');

  });

  test("AUTH-019 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'xuat-rong');
    const t = await loginOk(testRun, u);
    const res = await LOGOUT(t.accessToken, t.refreshToken);
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("AUTH-024 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {
    const API = "GET /api/auth/me";
    const p = await testRun.prepare(API, "dp");
    const res = await http.call(API, p);
    expectStatusIn(res, "200");
    const b = await body(res);
    for (const k of ["success", "message", "errorCode"]) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    const parsed = R_quan_tri_phan_quyen_xac_thuc.responses[API].data!.safeParse(b.data);
    expect(parsed.success, `Sai schema Swagger: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 5))}`).toBe(true);
    for (const k of ["userId", "tenantId", "email", "displayName", "roles", "permissions"]) expect(b.data, `data có ${k}`).toHaveProperty(k);
  });

  test("AUTH-033 Phản hồi thành công không có body", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'doi-mk');
    const t = await loginOk(testRun, u);

    const res = await changePassword(testRun, t.accessToken, u.password, strong(12));
    expectStatusIn(res, '200/204');

    const text = await res.text();
    expect(text === '' || JSON.parse(text).data == null, 'Body rỗng').toBe(true);

  });

  test("AUTH-041 Đủ field và đúng kiểu theo Swagger", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'lam-moi');
    const t = await loginOk(testRun, u);

    const res = await REFRESH(t.refreshToken);
    expectStatusIn(res, '200');
    const b = await body(res);
    for (const k of ['success', 'message', 'errorCode']) expect(b, `vỏ phản hồi có ${k}`).toHaveProperty(k);
    for (const k of ['accessToken', 'refreshToken', 'expiresInSeconds', 'passwordChangeRequired']) expect(b.data, `data có ${k}`).toHaveProperty(k);

  });
});
