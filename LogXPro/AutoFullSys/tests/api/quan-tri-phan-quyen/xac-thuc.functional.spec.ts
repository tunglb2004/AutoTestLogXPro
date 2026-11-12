/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens, markIncomplete } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { audit } from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
import { env } from '../../../src/core/env';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Xác thực và phiên đăng nhập", () => {
  test("AUTH-002 Đăng nhập lấy cặp token", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'dang-nhap');
    const res = await login(testRun, u.email, u.password);
    expectStatusIn(res, '200');
    const d = await data(res);
    expect(d.accessToken, 'accessToken').toBeTruthy();
    expect(d.refreshToken, 'refreshToken').toBeTruthy();
    expect((await data(await ME(d.accessToken))).email, '/me trả đúng email').toBe(u.email);

  });

  test("AUTH-003 Sai mật khẩu không tiết lộ ô sai", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'sai-mk');
    const wrong = u.password.slice(0, -1) + (u.password.endsWith('x') ? 'y' : 'x');
    const r1 = await login(testRun, u.email, wrong);
    const r2 = await login(testRun, `khong.ton.tai.${TEST_RUN_ID}@logx-test.vn`.toLowerCase(), u.password);
    expectStatusIn(r1, '400/401', 'sai mật khẩu');
    expectStatusIn(r2, '400/401', 'email không tồn tại');
    for (const res of [r1, r2]) {
      const error = await expectApiError(res);
      expect(typeof error.message).toBe('string');
      expect(JSON.stringify(await body(res)), 'Không trả access token hay refresh token').not.toMatch(/"(accessToken|refreshToken)"\s*:\s*"[^"]+"/);
      await expectNoData(res);
    }

  });

  test("AUTH-004 Một tài khoản chỉ 1 phiên", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'mot-phien');
    const t1 = await loginOk(testRun, u);
    expectStatusIn(await ME(t1.accessToken), '200/201/204', 'T1 dùng được trước khi đăng nhập lần 2');
    const t2 = await loginOk(testRun, u);
    expectStatusIn(await ME(t1.accessToken), '401', 'T1 bị vô hiệu');
    expectStatusIn(await ME(t2.accessToken), '200/201/204', 'T2 dùng được');

  });

  test("AUTH-005 Tài khoản đã khóa không đăng nhập được", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'khoa');
    await must(await http.call('POST /api/admin/users/{id}/lock', { token: tok('admin'), params: { id: u.id } }), 'ADMIN khóa tài khoản');
    const res = await login(testRun, u.email, u.password);
    expectStatusIn(res, '401/403');
    expect((await body(res)).data?.accessToken ?? null, 'Không trả token').toBeNull();
    await must(await http.call('POST /api/admin/users/{id}/unlock', { token: tok('admin'), params: { id: u.id } }), 'ADMIN mở khóa');
    expectStatusIn(await login(testRun, u.email, u.password), '200', 'Mở khóa xong đăng nhập lại được');

  });

  test("AUTH-006 Tài khoản chưa có vai trò vẫn đăng nhập được nhưng không có quyền", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'khong-vai-tro');
    const res = await login(testRun, u.email, u.password);
    expectStatusIn(res, '200');
    const t = (await data(res)).accessToken;
    const me = await data(await ME(t));
    expect(me.permissions ?? [], 'Danh sách quyền rỗng').toHaveLength(0);
    for (const api of ['GET /api/service-orders', 'GET /api/quotation-requests', 'GET /api/purchase-prices', 'GET /api/admin/users']) expectStatusIn(await http.call(api, { token: t }), '403', api);

  });

  test("AUTH-014 Đăng xuất thu hồi refresh token", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'dang-xuat');
    const t = await loginOk(testRun, u);
    const res = await LOGOUT(t.accessToken, t.refreshToken);
    expectStatusIn(res, '200/204');
    expectStatusIn(await REFRESH(t.refreshToken), '401', 'Refresh token bị thu hồi');

  });

  test("AUTH-015 Đăng xuất chỉ thu hồi phiên của chính mình", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u1 = await freshUser(testRun, 'xuat-1');
    const u2 = await freshUser(testRun, 'xuat-2');
    const t1 = await loginOk(testRun, u1);
    const t2 = await loginOk(testRun, u2);
    expectStatusIn(await LOGOUT(t1.accessToken, t1.refreshToken), '200/201/204', 'tài khoản 1 đăng xuất');
    expectStatusIn(await ME(t2.accessToken), '200/201/204', 'Phiên tài khoản 2 không bị ảnh hưởng');

  });

  test("AUTH-016 Gửi refresh token của người khác", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u1 = await freshUser(testRun, 'cheo-1');
    const u2 = await freshUser(testRun, 'cheo-2');
    const t1 = await loginOk(testRun, u1);
    const t2 = await loginOk(testRun, u2);
    const res = await LOGOUT(t1.accessToken, t2.refreshToken);
    expectStatusIn(res, '400/403');
    expectStatusIn(await REFRESH(t2.refreshToken), '200', 'Refresh token của người kia vẫn dùng được');

  });

  test("AUTH-022 Lấy thông tin tài khoản và quyền hiệu lực", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, roles, tok }) => {

    const res = await http.call('GET /api/auth/me', { token: tok('dp') });
    expectStatusIn(res, '200');
    const me = await data(res);
    expect(me.email).toBeTruthy();
    expect(me.displayName, 'Họ tên').toBeTruthy();
    const activeRoles = (me.roles ?? []).filter((r: any) => r.active !== false);
    expect(activeRoles.length, 'Có vai trò').toBeGreaterThan(0);
    const union = new Set<string>();
    for (const r of activeRoles) for (const p of (await data(await http.call('GET /api/admin/roles/{id}', { token: tok('admin'), params: { id: r.id } }))).permissions ?? []) union.add(p);
    expect([...new Set<string>(me.permissions ?? [])].sort(), 'Quyền hiệu lực = hợp các vai trò đang hoạt động').toEqual([...union].sort());

  });

  test("AUTH-023 Gỡ vai trò có hiệu lực ngay không cần đăng nhập lại", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles, tok }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const dpRole = ((await data(await ME(tok('dp')))).roles ?? []).find((r: any) => r.active !== false);
    if (!dpRole) throw new Error('Chuẩn bị dữ liệu thất bại: DP_K2 không có vai trò đang hoạt động');
    const u = await freshUser(testRun, 'go-vai-tro', { roleIds: [dpRole.id] });
    const t = await loginOk(testRun, u);
    const before = await data(await ME(t.accessToken));
    expect((before.roles ?? []).some((r: any) => r.id === dpRole.id), 'Tiền điều kiện: có vai trò điều phối').toBe(true);
    await must(await http.call('DELETE /api/admin/users/{userId}/roles/{roleId}', { token: tok('admin'), params: { userId: u.id, roleId: dpRole.id } }), 'ADMIN gỡ vai trò');
    const res = await ME(t.accessToken);
    expectStatusIn(res, '200');
    const after = await data(res);
    expect((after.roles ?? []).some((r: any) => r.id === dpRole.id), 'Vai trò bị gỡ biến mất ngay').toBe(false);
    expect(after.permissions ?? [], 'Quyền của vai trò bị gỡ biến mất').toHaveLength(0);
    await must(await http.call('POST /api/admin/users/{userId}/roles', { token: tok('admin'), params: { userId: u.id }, json: { roleId: dpRole.id } }), 'gán lại vai trò');
    expect([...((await data(await ME(t.accessToken))).permissions ?? [])].sort(), 'Gán lại thì quyền quay lại').toEqual([...(before.permissions ?? [])].sort());

  });

  test("AUTH-026 Đổi mật khẩu của chính mình", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'doi-mk');
    const t = await loginOk(testRun, u);

    const np = strong(12);
    const res = await changePassword(testRun, t.accessToken, u.password, np);
    expectStatusIn(res, '200/204');
    expectStatusIn(await login(testRun, u.email, np), '200', 'Đăng nhập bằng mật khẩu mới');
    expectStatusIn(await login(testRun, u.email, u.password), '400/401', 'Mật khẩu cũ bị từ chối');

  });

  test("AUTH-027 Mật khẩu mới không đạt độ mạnh", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'doi-mk');
    const t = await loginOk(testRun, u);

    const res = await changePassword(testRun, t.accessToken, u.password, 'abcdefgh');
    expectStatusIn(res, '400/422');
    await expectApiError(res);
    expectStatusIn(await login(testRun, u.email, u.password), '200', 'Mật khẩu cũ vẫn dùng được');

  });

  test("AUTH-028 Xác nhận không khớp", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'doi-mk');
    const t = await loginOk(testRun, u);

    const np = strong(12);
    const res = await http.call('POST /api/auth/password', { token: t.accessToken, json: { currentPassword: u.password, newPassword: np, confirmPassword: strong(12) } });
    expectStatusIn(res, '400/422');
    expectStatusIn(await login(testRun, u.email, np), '400/401', 'Không đổi mật khẩu');

  });

  test("AUTH-029 Đổi mật khẩu kết thúc mọi phiên khác", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {
    const u = await freshUser(testRun, 'mk-phien');
    const password = () => 'Lx9' + uuid().replace(/-/g, '').slice(0, 16) + 'Q7';
    const initial = await loginOk(testRun, u);
    const currentPassword = password();
    expectStatusIn(await changePassword(testRun, initial.accessToken, u.password, currentPassword), '200/201/204', 'Hoàn tất đổi mật khẩu lần đầu');
    const credentials = { email: u.email, password: currentPassword };
    const s1 = await loginOk(testRun, credentials);
    const s2 = await loginOk(testRun, credentials);
    const refresh = (refreshToken: string) => http.call('POST /api/auth/refresh', { json: { refreshToken }, retryUnauthorized: false });
    const otherSession = () => http.call('GET /api/auth/me', { token: s1.accessToken, retryUnauthorized: false });
    const beforeChange = await otherSession();
    expectStatusIn(beforeChange, '200/401', 'kiểm phiên T1 trước khi đổi mật khẩu');
    if (beforeChange.status() === 401) {
      markIncomplete('Quy tắc một phiên đã thu hồi T1 khi đăng nhập T2. Không xác minh được tác động riêng của đổi mật khẩu đối với một phiên khác đang hoạt động.');
    }
    const previous = new Set((await audit(testRun, u.id)).map(e => e.id));
    const newPassword = password();
    expectStatusIn(await changePassword(testRun, s2.accessToken, currentPassword, newPassword), '200/201/204');
    if (beforeChange.ok()) expectStatusIn(await otherSession(), '401', 'phiên T1 bị thu hồi sau khi đổi mật khẩu');
    expectStatusIn(await refresh(s1.refreshToken), '401', 'Refresh token phiên cũ không dùng được');
    const added = (await audit(testRun, u.id)).filter(e => e.targetId === u.id && !previous.has(e.id));
    expect(added.some(e => /đổi mật khẩu|chang(?:e|ed)[ _-]*password|password[ _-]*chang/i.test([e.action, e.event, e.eventLabel, e.summary].join(' '))), 'Audit có sự kiện đổi mật khẩu mới').toBe(true);
    const content = JSON.stringify(added);
    expect(content.includes(newPassword) || content.includes(currentPassword), 'Không lưu nội dung mật khẩu').toBe(false);

  });

  test("AUTH-036 Làm mới token", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

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
    const d = await data(res);
    expect(d.accessToken && d.refreshToken, 'Cặp token mới').toBeTruthy();
    expect(d.refreshToken).not.toBe(t.refreshToken);
    expectStatusIn(await REFRESH(t.refreshToken), '401', 'Refresh token cũ dùng lại bị 401');

  });

  test("AUTH-037 Refresh token không dùng được làm access token", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'lam-moi');
    const t = await loginOk(testRun, u);

    expectStatusIn(await ME(t.refreshToken), '401', 'Bearer refresh token');
    expectStatusIn(await ME(t.accessToken), '200/201/204', 'Bearer access token');

  });

  test("AUTH-038 Làm mới sau khi đăng xuất", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Dùng tài khoản tạo mới trong case thay tài khoản dùng chung (1 tài khoản 1 phiên)' });
    const ME = (token: string) => http.call('GET /api/auth/me', { token });
    const REFRESH = (refreshToken: unknown) => http.call('POST /api/auth/refresh', { json: refreshToken === undefined ? {} : { refreshToken } });
    const LOGOUT = (token: string, refreshToken: unknown) => http.call('POST /api/auth/logout', { token, json: refreshToken === undefined ? {} : { refreshToken } });
    /** Mật khẩu đủ độ mạnh (chữ thường, chữ hoa, số) dài `n` ký tự, sinh lúc chạy. */
    const strong = (n: number) => { let s = 'Lx9'; while (s.length < n) s += Math.random().toString(36).slice(2); return (s.slice(0, n - 2) + 'Q7').slice(0, n); };

    const u = await freshUser(testRun, 'lam-moi');
    const t = await loginOk(testRun, u);

    await must(await LOGOUT(t.accessToken, t.refreshToken), 'đăng xuất');
    const res = await REFRESH(t.refreshToken);
    expectStatusIn(res, '401');
    expect((await body(res)).data?.accessToken ?? null, 'Không cấp token mới').toBeNull();

  });
});
