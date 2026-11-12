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
  test("UI-LOGIN-010 Thao tác bằng bàn phím", { tag: ["@ui", "@quan-tri-phan-quyen", "@p3"] }, async ({ page, browser, http, testRun }) => {
    const u = await newLoginUser(testRun,'k1'); const form = new DangNhapPage(page); await form.goto();
    await expect(form.email).toHaveAccessibleName(/Email hoặc tên đăng nhập/i); await expect(form.password).toHaveAccessibleName(/Mật khẩu/i);
    await form.email.focus(); await expect(form.email).toBeFocused(); await page.keyboard.type(u.email); await page.keyboard.press('Tab');
    await expect(form.password).toBeFocused(); await page.keyboard.type(u.password); await page.keyboard.press('Tab');
    const remember = page.getByRole('checkbox',{name:'Ghi nhớ đăng nhập'}); await expect(remember).toBeFocused(); await page.keyboard.press('Tab');
    await expect(form.submit).toBeFocused(); const pending=page.waitForResponse(r=>/\/auth\/login(?:\?|$)/.test(r.url())&&r.request().method()==='POST');
    await page.keyboard.press('Enter'); expect((await pending).status()).toBe(200); await expect(page).not.toHaveURL(/\/login(?:[/?#]|$)/);
  });
});
