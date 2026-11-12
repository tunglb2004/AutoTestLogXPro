/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { audit } from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
import { env } from '../../../src/core/env';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Xác thực và phiên đăng nhập", () => {
  test("AUTH-001 Không token, token hết hạn hoặc dùng refresh token", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {
    const user = await freshUser(testRun, 'tu-choi-token');
    const session = await loginOk(testRun, user);
    const me = () => http.call('GET /api/auth/me', { token: session.accessToken, retryUnauthorized: false });
    const readMe = async () => stable(await must(await me(), 'đọc phiên hợp lệ'));
    const before = await readMe();
    const history = stable(await audit(testRun, user.id));
    const newPassword = 'Lx9' + uuid().replace(/-/g, '') + 'Q7';
    const apis: [string, Record<string, unknown>?][] = [
      ['POST /api/auth/logout', { refreshToken: session.refreshToken }],
      ['GET /api/auth/me'],
      ['POST /api/auth/password', { currentPassword: user.password, newPassword, confirmPassword: newPassword }],
    ];
    for (const [api, json] of apis) {
      for (const t of [{ name: 'không gửi Authorization', token: null }, ...badTokens(session)]) {
        const res = await http.call(api, { token: t.token, json, retryUnauthorized: false });
        expect(res.status(), `${api} – ${t.name}`).toBe(401);
        await expectNoData(res);
      }
      expect(await readMe(), `${api}: phiên và người dùng không đổi`).toEqual(before);
      expect(stable(await audit(testRun, user.id)), `${api}: lịch sử người dùng không đổi`).toEqual(history);
    }
    expectStatusIn(await http.call('POST /api/auth/refresh', { json: { refreshToken: session.refreshToken } }), '200', 'Refresh token hợp lệ chưa bị thu hồi');
    await loginOk(testRun, user);
  });

  test("AUTH-008 Chèn ký tự SQL vào email/mật khẩu", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http }) => {

    const res = await http.call('POST /api/auth/login', { json: { tenantCode: env.tenantCode, email: "' OR 1=1 --", password: "' OR '1'='1" } });
    expectStatusIn(res, '400/401');
    expect(res.status(), 'Không 5xx').toBeLessThan(500);
    const text = await res.text();
    expect(text, 'Không lộ câu lệnh SQL').not.toMatch(/SQL|syntax error|select\s.+\sfrom|jdbc|hibernate/i);
    expect(hasNoStacktrace(text)).toBe(true);

  });

  test("AUTH-030 Không trả mật khẩu trong phản hồi hoặc log", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok, page }) => {

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
    const text = await res.text();
    expect(text.includes(np) || text.includes(u.password), 'Phản hồi không chứa mật khẩu').toBe(false);
    const audit = JSON.stringify(await data(await http.call('GET /api/admin/audit-log', { token: tok('admin'), query: { targetId: u.id, search: u.email, page: 1, perPage: 100 } })));
    expect(audit.includes(np) || audit.includes(u.password), 'Log không có chuỗi mật khẩu cũ/mới').toBe(false);

  });
});
