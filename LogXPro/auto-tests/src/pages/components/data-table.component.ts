import { Locator, Page } from '@playwright/test';

/** Bảng dữ liệu dùng chung (xác nhận trên web DEV 2026-11-05: phân trang "Trang trước/Trang sau", số dòng là <select> 10/20/50/100). */
export class DataTableComponent {
  constructor(readonly root: Page) {}

  get table() {
    return this.root.locator('main table').first();
  }
  get headers() {
    return this.table.locator('thead th');
  }
  get rows() {
    return this.table.locator('tbody tr');
  }
  get nextPage() {
    return this.root.getByRole('button', { name: 'Trang sau' });
  }
  get prevPage() {
    return this.root.getByRole('button', { name: 'Trang trước' });
  }
  get pageSize() {
    return this.root.locator('main select').first();
  }
  pageButton(n: number | string) {
    return this.root.getByRole('button', { name: String(n), exact: true });
  }

  row(text: string | RegExp) {
    return this.rows.filter({ hasText: text });
  }

  /**
   * Mức màu của badge "(Còn N ngày)" ở cột Ngày hết hạn (SRS mục 3.2.2, BR-CTR-08 / BR-CTV-07):
   * 'đỏ' | 'cam' | 'vàng' theo sắc độ nền (không có nền màu thì lấy màu chữ); null nếu dòng không có badge.
   */
  static async expiryBadgeLevel(row: Locator, days: number): Promise<string | null> {
    const badge = row.getByText(new RegExp(`\\(Còn ${days} ngày\\)`)).first();
    if (!(await badge.count())) return null;
    return badge.evaluate((el) => {
      const hueOf = (css: string): number | null => {
        const m = css.match(/[\d.]+/g)?.map(Number);
        if (!m || (m.length === 4 && m[3] === 0)) return null;
        const [r, g, b] = m.map((v, i) => (i < 3 ? v / 255 : v));
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        if (max - min < 0.08) return null; // trắng / xám: không phải màu cảnh báo
        let h = max === r ? (g - b) / (max - min) : max === g ? 2 + (b - r) / (max - min) : 4 + (r - g) / (max - min);
        h *= 60;
        return h < 0 ? h + 360 : h;
      };
      let hue: number | null = null;
      for (let e: HTMLElement | null = el as HTMLElement; e && hue === null && e.tagName !== 'TR'; e = e.parentElement) hue = hueOf(getComputedStyle(e).backgroundColor);
      if (hue === null) hue = hueOf(getComputedStyle(el as HTMLElement).color);
      if (hue === null) return 'không màu';
      return hue < 15 || hue >= 330 ? 'đỏ' : hue < 40 ? 'cam' : hue < 70 ? 'vàng' : `khác (${Math.round(hue)}°)`;
    });
  }
}
