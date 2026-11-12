import { test, expect } from '../../../src/fixtures/page.fixture';

test.describe("Danh sách Lead", () => {
  test("UI-LEAD-007 Hiển thị ở 375px, 768px, 1366px", { tag: ["@ui", "@p3"] }, async ({ page, loginAs, leadListPage }) => {
    await loginAs('nvkdA');
    for (const width of [375, 768, 1366]) {
      await test.step(`Rộng ${width}px`, async () => {
        await page.setViewportSize({ width, height: 900 });
        await leadListPage.goto();
        // Không mất cột chính.
        for (const col of ['MÃ LEAD', 'TÊN DOANH NGHIỆP', 'TRẠNG THÁI']) await expect(leadListPage.table.headers.filter({ hasText: col })).toHaveCount(1);
        // Bảng rộng hơn khung thì khung chứa bảng phải cuộn ngang được.
        const scroll = await leadListPage.table.table.evaluate((t) => {
          let el: HTMLElement | null = t.parentElement;
          while (el && el !== document.body) {
            const s = getComputedStyle(el);
            if (/(auto|scroll)/.test(s.overflowX)) return { ok: true, need: t.scrollWidth > el.clientWidth };
            el = el.parentElement;
          }
          return { ok: t.scrollWidth <= document.documentElement.clientWidth, need: t.scrollWidth > document.documentElement.clientWidth };
        });
        expect(scroll.ok, 'Bảng tràn ngang phải nằm trong khung cuộn ngang').toBe(true);
        // Nút không chồng lên nhau.
        const boxes = [];
        for (const b of [leadListPage.exportButton, leadListPage.importButton, leadListPage.addButton]) {
          await expect(b).toBeVisible();
          boxes.push((await b.boundingBox())!);
        }
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i];
            const c = boxes[j];
            const overlap = a.x < c.x + c.width && c.x < a.x + a.width && a.y < c.y + c.height && c.y < a.y + a.height;
            expect(overlap, `Nút ${i} và ${j} chồng nhau ở ${width}px`).toBe(false);
          }
      });
    }
  });
});
