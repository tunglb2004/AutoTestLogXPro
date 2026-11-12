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
  test("UI-LOGIN-003 Bỏ trống cả hai ô", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ page, browser, http, testRun }) => {
    const form = new DangNhapPage(page); await form.goto(); const attempts: string[] = [];
    page.on('request', r => { if (/\/auth\/login(?:\?|$)/.test(r.url())) attempts.push(r.url()); });
    await form.submit.click();
    await expect(page.getByText('Vui lòng nhập Email', {exact:true})).toBeVisible();
    await expect(page.getByText('Vui lòng nhập mật khẩu', {exact:true})).toBeVisible();
    expect(attempts, 'Validation tại UI không gửi request đăng nhập').toEqual([]);
    await expect(page).toHaveURL(/\/login(?:[/?#]|$)/);
  });

  test("UI-LOGIN-004 Chỉ bỏ trống mật khẩu", { tag: ["@ui", "@quan-tri-phan-quyen", "@p3"] }, async ({ page, browser, http, testRun }) => {
    const cred = credentials('k1'); expect(cred, 'Có email K1 trong môi trường').not.toBeNull();
    const form = new DangNhapPage(page); await form.goto(); await form.email.fill(cred!.email);
    const attempts: string[] = []; page.on('request', r => { if (/\/auth\/login(?:\?|$)/.test(r.url())) attempts.push(r.url()); });
    await form.submit.click(); await expect(page.getByText('Vui lòng nhập mật khẩu',{exact:true})).toBeVisible();
    await expect(page.getByText('Vui lòng nhập Email',{exact:true})).toHaveCount(0);
    await expect(form.email).toHaveValue(cred!.email); expect(attempts).toEqual([]); await expect(page).toHaveURL(/\/login(?:[/?#]|$)/);
  });

  test("UI-LOGIN-011 Máy chủ lỗi khi đăng nhập", { tag: ["@ui", "@quan-tri-phan-quyen", "@p3"] }, async ({ page, browser, http, testRun }) => {
    const cred=credentials('k1'); expect(cred).not.toBeNull(); let intercepted=0;
    await page.route('**/auth/login', async route=>{intercepted++; await route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({success:false,errorCode:'INTERNAL_SERVER_ERROR',message:'Lỗi hệ thống. Vui lòng thử lại sau.',data:null,stackTrace:'java.lang.NullPointerException at com.logx.AuthService.java:42'})});});
    const form = new DangNhapPage(page); await form.goto(); await form.email.fill(cred!.email); await form.password.fill(cred!.password);
    const pending=page.waitForResponse(r=>/\/auth\/login(?:\?|$)/.test(r.url())); await form.submit.click(); expect((await pending).status()).toBe(500); expect(intercepted).toBe(1);
    await expect(form.toast.withText(/lỗi|thử lại|không thể|không thành công/i)).toBeVisible();
    await expect(form.submit).toBeEnabled(); await expect(page).toHaveURL(/\/login(?:[/?#]|$)/);
    expect(await page.locator('body').innerText()).not.toMatch(/NullPointerException|AuthService|stackTrace|\.java:\d+|Traceback/);
  });
});
