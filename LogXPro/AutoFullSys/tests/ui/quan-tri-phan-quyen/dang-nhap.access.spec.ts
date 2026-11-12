import { adminUiCase, loginRoleRevoked } from '../../../src/quan-tri-phan-quyen/data/admin-ui.scenario';
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
  test("UI-LOGIN-006 Đăng nhập nơi khác đẩy phiên cũ ra", { tag: ["@ui", "@quan-tri-phan-quyen", "@p1"] }, async ({ page, browser, http, testRun }) => {
    const u = await newLoginUser(testRun, 'k1');
    const other = await browser.newContext({baseURL:webBaseUrl()});
    try {
      await loginThroughUi(page,u); const old = (await page.context().cookies()).find(c=>c.name==='access_token')?.value; expect(old).toBeTruthy();
      const b = await other.newPage(); await loginThroughUi(b,u);
      expectStatusIn(await http.call('GET /api/auth/me',{token:old!}),'401','Phiên A bị thu hồi sau login B');
      await new SidebarMenuComponent(page).open('Quản lý Khách hàng');
      await expect(page).toHaveURL(/\/login(?:[/?#]|$)/);
      await b.reload(); await expect(b).not.toHaveURL(/\/login(?:[/?#]|$)/);
      const current = (await other.cookies()).find(c=>c.name==='access_token')?.value; expect(current).toBeTruthy();
      expectStatusIn(await http.call('GET /api/auth/me',{token:current!}),'200','Phiên B vẫn dùng được');
    } finally { await other.close(); }
  });

  test("UI-LOGIN-007 Đăng xuất", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ page, browser, http, testRun }) => {
    const u = await newLoginUser(testRun,'k1'); const form = await loginThroughUi(page,u);
    const pending = page.waitForResponse(r=>/\/auth\/logout(?:\?|$)/.test(r.url()));
    await form.logout(); expect([200,204]).toContain((await pending).status()); await expect(page).toHaveURL(/\/login(?:[/?#]|$)/);
    await page.goBack(); await expect(page).toHaveURL(/\/login(?:[/?#]|$)/);
    await page.goto('/suppliers'); await expect(page).toHaveURL(/\/login(?:[/?#]|$)/);
  });

  test("UI-LOGIN-008 Bị gỡ vai trò thì mất menu ngay", { tag: ["@ui", "@quan-tri-phan-quyen", "@p2"] }, async ({ browser, roles, testRun }) => {
    await expect(loginRoleRevoked({ browser, roles, testRun }), 'Kịch bản chạy hết các bước kiểm tra (assertion nằm trong helper)').resolves.toBeUndefined();
  });

  test("UI-LOGIN-009 Menu trái theo từng tài khoản", { tag: ["@ui", "@quan-tri-phan-quyen", "@p1"] }, async ({ page, browser, http, testRun }) => {
    for (const source of ['k1','cc','admin'] as const) {
      const context = await browser.newContext({baseURL:webBaseUrl()});
      try {
        const p = await context.newPage(); const u = await newLoginUser(testRun,source); await loginThroughUi(p,u); const menu = new SidebarMenuComponent(p);
        const labels = source==='k1' ? ['Quản lý hợp đồng','Quản lý Khách hàng','Quản lý Dịch vụ','Quản lý báo giá','Quản lý nhà thầu','Cấu hình đầu mục giá','Giá mua đầu vào']
          : source==='cc' ? ['Quản lý Dịch vụ','Quản lý báo giá','Cấu hình đầu mục giá','Giá mua đầu vào','Giá mua định mức','Giá bán định mức','Chi phí - Doanh thu','Cấu hình chặng'] : ['Phân quyền'];
        for (const label of labels) await expect(menu.item(label), `${source}: ${label}`).toBeVisible();
        if(source!=='admin') await expect(menu.item('Phân quyền')).toHaveCount(0);
        if(source==='k1') { await expect(menu.item('Giá mua định mức')).toHaveCount(0); await expect(menu.item('Giá bán định mức')).toHaveCount(0); }
        await test.info().attach(`menu-${source}`,{body:await menu.root.innerText(),contentType:'text/plain'});
      } finally { await context.close(); }
    }
  });
});
