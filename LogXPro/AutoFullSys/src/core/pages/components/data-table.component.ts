import { Locator, Page } from '@playwright/test';

/** Bảng danh sách dùng chung (thẻ table của web dev). Chỉ thao tác và cung cấp locator. */
export class DataTableComponent {
  constructor(readonly page: Page, readonly root: Locator = page.locator('table').first()) {}

  get headers(): Locator {
    return this.root.locator('thead th');
  }
  get rows(): Locator {
    return this.root.locator('tbody tr');
  }
  row(text: string | RegExp): Locator {
    return this.rows.filter({ hasText: text }).first();
  }
  cell(rowText: string | RegExp, columnIndex: number): Locator {
    return this.row(rowText).locator('td').nth(columnIndex);
  }
  async headerTexts(): Promise<string[]> {
    return (await this.headers.allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }
  async selectRow(rowText: string | RegExp): Promise<void> {
    await this.row(rowText).getByRole('checkbox').check();
  }
  get pagination(): Locator {
    return this.page.locator('[class*="pagination"], nav[aria-label*="pagination" i]').first();
  }
}

// ---------- Ô chọn, thẻ số, ô tiền tệ dùng chung của web dev (khảo sát giao diện thật) ----------

/** Escape chuỗi để dựng RegExp. */
export const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** RegExp khớp nguyên nhãn, cho phép dấu * bắt buộc ở cuối. */
export const exactLabel = (label: string) => new RegExp('^\\s*' + esc(label) + '\\s*\\*?\\s*$');

/** Ô chọn tùy biến (`div[tabindex=0]`) thuộc nhãn `label` trong `scope` (form, bộ lọc, modal). */
export function selectByLabel(scope: Page | Locator, label: string): Locator {
  return scope.locator('label').filter({ hasText: exactLabel(label) }).first()
    .locator('xpath=ancestor::div[.//div[@tabindex="0"]][1]').locator('div[tabindex="0"]').first();
}

/** Ô nhập (input/textarea) thuộc nhãn `label` trong `scope`. */
export function inputByLabel(scope: Page | Locator, label: string): Locator {
  return scope.locator('label').filter({ hasText: exactLabel(label) }).first()
    .locator('xpath=ancestor::div[.//input or .//textarea][1]').locator('input, textarea').first();
}

/**
 * Mở ô chọn tùy biến rồi bấm lựa chọn. Danh sách lựa chọn được gắn ở cuối body nên lấy phần tử khớp cuối cùng;
 * `search` gõ vào ô "Tìm..." của ô chọn có tìm kiếm (nhà thầu, điểm đi/đến).
 */
export async function pickOption(page: Page, trigger: Locator, option: string | RegExp, search?: string): Promise<void> {
  await trigger.click();
  if (search !== undefined) await page.getByPlaceholder(/^Tìm/).last().fill(search);
  const opt = typeof option === 'string' ? page.getByText(option, { exact: true }) : page.getByText(option);
  await opt.last().click();
}

/** Số trên thẻ thống kê: nhãn đứng trước số trong cùng thẻ ("Tổng số bảng giá giá mua\n68"). */
export async function cardNumber(page: Page, label: string): Promise<number> {
  const text = await page.locator('main').innerText();
  const m = text.match(new RegExp(esc(label) + '\\s*\\n\\s*([\\d.]+)'));
  if (!m) throw new Error(`Không thấy thẻ "${label}"`);
  return Number(m[1].replace(/\./g, ''));
}

/** "1.000.000 VNĐ" → 1000000; ô không có số (vd "Chưa có") → NaN. */
export function moneyOf(text: string): number {
  const digits = text.replace(/[^\d-]/g, '');
  return digits ? Number(digits) : NaN;
}

/** Định dạng tiền như web dev hiển thị: 1000000 → "1.000.000". */
export function vnd(n: number): string {
  return Math.round(n).toLocaleString('de-DE');
}
