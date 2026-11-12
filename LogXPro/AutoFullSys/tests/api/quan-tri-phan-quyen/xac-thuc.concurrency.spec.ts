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
  test("AUTH-009 Đăng nhập song song 2 nơi", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, request }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'song-song');
    const [a, b] = await Promise.all([login(testRun, u.email, u.password), login(testRun, u.email, u.password)]);
    expectStatusIn(a, '200', 'request 1');
    expectStatusIn(b, '200', 'request 2');
    const ok = await Promise.all([ME((await data(a)).accessToken), ME((await data(b)).accessToken)]);
    expect(ok.filter((r) => r.status() === 200).length, 'Chỉ token của request xử lý sau dùng được').toBe(1);
    expect(ok.every((r) => r.status() < 500), 'Không 5xx').toBe(true);

  });

  test("AUTH-013 Đăng nhập lần 2 tạo phiên mới và thu hồi phiên cũ", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'phien-moi');
    const r1 = await login(testRun, u.email, u.password);
    expectStatusIn(r1, '200/201/204', 'lần 1');
    const r2 = await login(testRun, u.email, u.password);
    expectStatusIn(r2, '200/201/204', 'lần 2');
    const [t1, t2] = [await data(r1), await data(r2)];
    expect(t2.accessToken, 'T2 khác T1').not.toBe(t1.accessToken);
    expectStatusIn(await ME(t1.accessToken), '401', 'T1 bị thu hồi');
    expectStatusIn(await ME(t2.accessToken), '200/201/204', 'T2 dùng được');

  });

  test("AUTH-021 Gọi lại thao tác chuyển trạng thái lần 2", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'xuat-2-lan');
    const t = await loginOk(testRun, u);
    expectStatusIn(await LOGOUT(t.accessToken, t.refreshToken), '200/204', 'lần 1');
    const r2 = await LOGOUT(t.accessToken, t.refreshToken);
    expectStatusIn(r2, '400/409/422', 'lần 2');

  });

  test("AUTH-035 Gửi lại cùng body sau khi đổi", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'doi-mk');
    const t = await loginOk(testRun, u);

    const np = strong(12);
    expectStatusIn(await changePassword(testRun, t.accessToken, u.password, np), '200/204', 'lần 1');
    const t2 = await loginOk(testRun, { email: u.email, password: np });
    const r2 = await changePassword(testRun, t2.accessToken, u.password, np);
    expectStatusIn(r2, '400/422', 'lần 2 sai currentPassword');

  });

  test("AUTH-043 Dùng lại refresh token cũ", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'lam-moi');
    const t = await loginOk(testRun, u);

    expectStatusIn(await REFRESH(t.refreshToken), '200', 'lần 1');
    expectStatusIn(await REFRESH(t.refreshToken), '401', 'lần 2 dùng lại token cũ');

  });
});
