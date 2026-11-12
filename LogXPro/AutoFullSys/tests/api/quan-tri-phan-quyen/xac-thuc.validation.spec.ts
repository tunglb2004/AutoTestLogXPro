/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Xác thực và phiên đăng nhập", () => {
  test("AUTH-017 Thiếu trường bắt buộc `refreshToken`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'thieu-rt');
    const t = await loginOk(testRun, u);
    const res = await LOGOUT(t.accessToken, undefined);
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'refreshToken');
    expectStatusIn(await ME(t.accessToken), '200', 'Phiên không đổi');

  });

  test("AUTH-018 `refreshToken` 4096 và 4097 ký tự", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'rt-dai');
    const t = await loginOk(testRun, u);
    const rand = (n: number) => { let s = ''; while (s.length < n) s += Math.random().toString(36).slice(2); return s.slice(0, n); };
    expectStatusIn(await LOGOUT(t.accessToken, rand(4096)), '400/401', '4096 ký tự');
    expectStatusIn(await LOGOUT(t.accessToken, rand(4097)), '400/422', '4097 ký tự');
    expectStatusIn(await REFRESH(t.refreshToken), '200', 'Refresh token thật vẫn dùng được');

  });

  test("AUTH-031 Thiếu trường bắt buộc `newPassword`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'doi-mk');
    const t = await loginOk(testRun, u);

    const res = await http.call('POST /api/auth/password', { token: t.accessToken, json: { currentPassword: u.password, confirmPassword: strong(12) } });
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'newPassword');
    expectStatusIn(await login(testRun, u.email, u.password), '200', 'Mật khẩu không đổi');

  });

  test("AUTH-032 `newPassword` 8/200/201 ký tự đủ độ mạnh", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'mk-do-dai');
    let cur = u.password;
    for (const [n, set] of [[8, '200/204'], [200, '200/204'], [201, '400/422']] as [number, string][]) {
      const t = await loginOk(testRun, { email: u.email, password: cur });
      const np = strong(n);
      const res = await changePassword(testRun, t.accessToken, cur, np);
      expectStatusIn(res, set, `${n} ký tự`);
      if (set === '200/204') { cur = np; expectStatusIn(await login(testRun, u.email, np), '200', `${n} ký tự: đăng nhập lại bằng mật khẩu mới`); }
      else expectStatusIn(await login(testRun, u.email, cur), '200', 'Mật khẩu giữ như lần trước');
    }

  });

  test("AUTH-039 Thiếu trường bắt buộc `refreshToken`", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'lam-moi');
    const t = await loginOk(testRun, u);

    const res = await REFRESH(undefined);
    expectStatusIn(res, '400/422');
    expectOnlyFieldError(await expectApiError(res), 'refreshToken');
    expectStatusIn(await REFRESH(t.refreshToken), '200', 'Refresh token thật không bị ảnh hưởng');

  });

  test("AUTH-040 `refreshToken` 4096 và 4097 ký tự", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http }) => {

    const rand = (n: number) => { let s = ''; while (s.length < n) s += Math.random().toString(36).slice(2); return s.slice(0, n); };
    const r1 = await http.call('POST /api/auth/refresh', { json: { refreshToken: rand(4096) } });
    expectStatusIn(r1, '401', '4096 ký tự');
    const r2 = await http.call('POST /api/auth/refresh', { json: { refreshToken: rand(4097) } });
    expectStatusIn(r2, '400/422', '4097 ký tự');
    for (const r of [r1, r2]) expect((await body(r)).data?.accessToken ?? null, 'Không cấp token mới').toBeNull();

  });

  test("AUTH-007 Email sai định dạng", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http }) => {

    const res = await http.call('POST /api/auth/login', { json: { tenantCode: env.tenantCode, email: 'tungkh@', password: Math.random().toString(36).slice(2) + 'Aa1' } });
    expectStatusIn(res, '400/422');
    const b = await expectApiError(res);
    expect(errorFields(b), 'Lỗi trường email').toContain('email');
    expect(b?.data?.accessToken ?? null, 'Không trả token').toBeNull();

  });

  test("AUTH-010 `tenantCode` 64 và 65 ký tự", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'tenant');
    const r64 = await login(testRun, u.email, u.password, 'T'.repeat(64));
    expectStatusIn(r64, '400/401', '64 ký tự');
    expect((await body(r64)).data?.accessToken ?? null, 'Không cấp token').toBeNull();
    const r65 = await login(testRun, u.email, u.password, 'T'.repeat(65));
    expectStatusIn(r65, '400/422', '65 ký tự');
    expect((await body(r65)).data?.accessToken ?? null).toBeNull();

  });

  test("AUTH-012 Body JSON hỏng cú pháp", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http }) => {
    const API = "POST /api/auth/login";
    const p = { params: {}, query: {} };
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
  });

  test("AUTH-020 Body JSON hỏng cú pháp", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/auth/logout";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("AUTH-025 Gọi sai phương thức HTTP", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun }) => {
    const API = "GET /api/auth/me";
    const p = await testRun.prepare(API, "dp");
    const before = await testRun.snapshot(API, p.params ?? {}, "dp");
    const res = await http.call(API, { ...p, method: "PATCH" });
    expectStatusIn(res, "400/404/405");
    await expectApiError(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "dp"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("AUTH-034 Body JSON hỏng cú pháp", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/auth/password";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });

  test("AUTH-042 Body JSON hỏng cú pháp", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {
    const API = "POST /api/auth/refresh";
    const p = await testRun.prepare(API, "k1");
    const before = await testRun.snapshot(API, p.params ?? {}, "k1");
    const res = await http.call(API, { ...p, rawBody: MALFORMED_JSON });
    expectStatusIn(res, "400/422");
    await expectApiError(res);
    await expectNoData(res);
    expect(await testRun.snapshot(API, p.params ?? {}, "k1"), "Dữ liệu, trạng thái và lịch sử không đổi").toEqual(before);
  });
});
