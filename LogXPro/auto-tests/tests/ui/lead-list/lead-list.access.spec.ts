import { test, expect } from '../../../src/fixtures/page.fixture';
import { publishSession } from '../../../src/fixtures/auth.fixture';
import { data } from '../../../src/api/http.client';
import { chooseOption } from '../../../src/pages/components/filter-bar.component';

test.describe("Danh sách Lead", () => {
  test("UI-LEAD-005 Role khác không thấy menu Lead", { tag: ["@ui", "@p2"] }, async ({ page, loginAs, contractorListPage, leadListPage }) => {
    await loginAs('qlnt');
    await contractorListPage.goto();
    await expect(leadListPage.menuLink).toHaveCount(0);
    const res = await page.goto('/leads');
    // Vào thẳng URL: bị chặn (403/trang không có quyền) hoặc bị chuyển khỏi màn Lead; không được thấy bảng Lead.
    await expect
      .poll(async () => !/\/leads\/?$/.test(new URL(page.url()).pathname) || /không có quyền|403|forbidden/i.test(await page.locator('body').innerText()) || (res?.status() ?? 200) === 403)
      .toBe(true);
    await expect(page.locator('main table').getByText('MÃ LEAD')).toHaveCount(0);
  });

  test("UI-LEAD-006 Token hết hạn khi đang ở màn", { tag: ["@ui", "@p1"] }, async ({ page, context, http, roles, loginAs, loginPage, leadListPage }) => {
    await loginAs('nvkdA');
    await leadListPage.goto();
    // Web giữ token trong bộ nhớ nên sửa cookie không có tác dụng (lượt chạy 1). Làm token của trình duyệt mất hiệu lực thật:
    // đăng nhập cùng tài khoản qua API → server thay phiên (session-superseded), access + refresh token cũ đều bị từ chối.
    const login = await http.call('POST /api/auth/login', { json: { tenantCode: process.env.TENANT_CODE, email: process.env.NVKD_A_EMAIL, password: process.env.NVKD_A_PASSWORD } });
    expect(login.ok(), 'Đăng nhập API để làm hết hạn phiên trình duyệt').toBe(true);
    const apiSession = await data(login);
    publishSession(roles, roles.nvkdA.userId, { accessToken: apiSession.accessToken, refreshToken: apiSession.refreshToken });
    await chooseOption(leadListPage.filter.statusFilter, 'Đang hoạt động').catch(() => undefined);
    await expect(page).toHaveURL(/\/login/);

    await loginPage.email.fill(process.env.NVKD_A_EMAIL ?? '');
    await loginPage.password.fill(process.env.NVKD_A_PASSWORD ?? '');
    await loginPage.submit.click();
    // User chốt 2026-11-06: phiên hết hạn đưa về màn đăng nhập là đạt; đăng nhập lại vào được hệ thống (trang đích theo role) và mở lại được màn Lead.
    await expect(page).not.toHaveURL(/\/login/);
    await leadListPage.goto();
    await expect(leadListPage.table.headers.first()).toBeVisible();

    // Đăng nhập lại tạo phiên mới (phiên cũ bị thay thế): chia sẻ token mới cho các test khác đang chạy.
    const fresh = await context.cookies();
    const accessToken = fresh.find((c) => c.name === 'access_token')?.value;
    const refreshToken = fresh.find((c) => c.name === 'refresh_token')?.value ?? '';
    if (accessToken) publishSession(roles, roles.nvkdA.userId, { accessToken, refreshToken });
  });
});
