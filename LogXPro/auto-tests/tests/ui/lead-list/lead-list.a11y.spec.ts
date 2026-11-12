import { test, expect } from '../../../src/fixtures/page.fixture';

test.describe("Danh sách Lead", () => {
  test("UI-LEAD-008 Điều khiển bằng bàn phím", { tag: ["@ui", "@p3"] }, async ({ page, loginAs, leadListPage }) => {
    await loginAs('nvkdA');
    await leadListPage.goto();
    const targets = [leadListPage.filter.search, leadListPage.filter.advancedButton, leadListPage.addButton];
    const reached = new Set<number>();
    await page.locator('main').click({ position: { x: 5, y: 5 } });
    for (let i = 0; i < 80 && reached.size < targets.length; i++) {
      await page.keyboard.press('Tab');
      for (const [idx, t] of targets.entries()) {
        if (await t.evaluate((el) => el === document.activeElement).catch(() => false)) {
          reached.add(idx);
          const outline = await t.evaluate((el) => {
            const s = getComputedStyle(el);
            return `${s.outlineStyle}|${s.outlineWidth}|${s.boxShadow}`;
          });
          expect.soft(outline, 'Phần tử đang focus phải có viền focus').not.toMatch(/^none\|0px\|none$/);
        }
      }
    }
    expect(reached.size, 'Ô tìm kiếm, Bộ lọc nâng cao và nút Thêm mới đều phải tới được bằng Tab').toBe(targets.length);

    // Nút icon không bắt buộc có nhãn đọc được, chỉ cần đúng chức năng (user chốt 2026-11-05).

    // Enter mở popup Thêm mới, Esc đóng popup.
    await leadListPage.addButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Thêm mới Lead')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Thêm mới Lead')).toBeHidden();
  });
});
