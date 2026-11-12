import { DangNhapPage } from '../../../src/quan-tri-phan-quyen/pages/dang-nhap.page';
import { SidebarMenuComponent } from '../../../src/core/pages/components/sidebar-menu.component';
import { credentials } from '../../../src/core/data/accounts';
import { newLoginUser, loginThroughUi, webBaseUrl } from '../../../src/quan-tri-phan-quyen/data/login-scenario';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Đăng nhập và phiên làm việc", () => {
  test("UI-LOGIN-001 Trang đăng nhập đủ thành phần", { tag: ["@ui", "@quan-tri-phan-quyen", "@p3"] }, async ({ page, browser, http, testRun }) => {
    const form = new DangNhapPage(page); await form.goto();
    await expect(page.getByText('Welcome Back!', { exact: true })).toBeVisible();
    await expect(page.getByText('Vui lòng đăng nhập để sử dụng dịch vụ', { exact: true })).toBeVisible();
    await expect(page.getByText(/^Email hoặc tên đăng nhập\s*\*?$/)).toBeVisible();
    await expect(page.getByText(/^Mật khẩu\s*\*?$/)).toBeVisible();
    await expect(form.email).toBeVisible(); await expect(form.email).toHaveValue('');
    await expect(form.password).toBeVisible(); await expect(form.password).toHaveAttribute('type','password');
    await expect(page.getByRole('checkbox',{name:'Ghi nhớ đăng nhập'})).toBeVisible();
    await expect(form.forgotPassword).toBeVisible(); await expect(form.submit).toBeVisible();
    await expect(page.getByText('HOẶC',{exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Đăng nhập bằng mã OTP',exact:true})).toBeVisible();
    await expect(page.getByText(/© 2026 LogXPro Logistics System\s*[-–]\s*Version/)).toBeVisible();
  });

  test("UI-LOGIN-002 Đăng nhập thành công", { tag: ["@ui", "@quan-tri-phan-quyen", "@p1"] }, async ({ page, browser, http, testRun }) => {
    const u = await newLoginUser(testRun, 'k1'); await loginThroughUi(page, u);
    await expect(page).toHaveURL(/\/suppliers(?:[/?#]|$)/);
    const menu = new SidebarMenuComponent(page);
    for (const label of ['Quản lý Khách hàng','Quản lý Dịch vụ','Quản lý báo giá','Quản lý nhà thầu','Giá mua đầu vào']) await expect(menu.item(label)).toBeVisible();
  });

  test("UI-LOGIN-005 Sai mật khẩu", { tag: ["@ui", "@quan-tri-phan-quyen", "@p1"] }, async ({ page, browser, http, testRun }) => {
    const u = await newLoginUser(testRun, 'k1'); const form = new DangNhapPage(page); await form.goto();
    await form.email.fill(u.email); await form.password.fill(u.password.slice(0,-1)+(u.password.endsWith('x')?'y':'x'));
    const pending = page.waitForResponse(r => /\/auth\/login(?:\?|$)/.test(r.url()) && r.request().method()==='POST');
    await form.submit.click(); expect([400,401]).toContain((await pending).status());
    await expect(page.getByText('Tên đăng nhập hoặc mật khẩu không đúng.',{exact:true})).toBeVisible();
    await expect(page).toHaveURL(/\/login(?:[/?#]|$)/);
  });
});
