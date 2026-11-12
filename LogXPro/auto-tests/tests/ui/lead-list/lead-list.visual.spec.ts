import { test, expect } from '../../../src/fixtures/page.fixture';

test.describe("Danh sách Lead", () => {
  test("UI-LEAD-009 So ảnh màn danh sách", { tag: ["@ui", "@p3"] }, async ({ page, loginAs, leadListPage }) => {
    await loginAs('nvkdA');
    await page.setViewportSize({ width: 1366, height: 900 });
    await leadListPage.goto();
    // Dữ liệu môi trường DEV thay đổi liên tục: che vùng số liệu và nội dung bảng, chỉ so khung màn hình.
    // Lần chạy đầu Playwright tạo ảnh chuẩn (cần người duyệt), các lần sau so với ảnh đó.
    await expect(page).toHaveScreenshot('lead-list.png', {
      fullPage: false,
      maxDiffPixelRatio: Number(process.env.VISUAL_MAX_DIFF ?? 0.02),
      mask: [page.locator('main table tbody'), page.locator('main').getByText(/Tổng số lead|Đang hoạt động/), page.locator('header'), page.locator('main').getByText(/bản ghi/), page.getByRole('button', { name: /^\d+$|^\.\.\.$/ })],
      animations: 'disabled',
    });
  });
});
