import { Locator, Page } from '@playwright/test';

/** Khớp đúng cả chuỗi (tránh "Tùng Lead" khớp nhầm "Tùng Lead 2"). */
function exact(text: string | RegExp): RegExp {
  return typeof text === 'string' ? new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) : text;
}

/**
 * Ô chọn tùy biến của web (không phải <select>), xác nhận trên web DEV 2026-11-05:
 * vùng bấm `[class*=selectTrigger]` hiện placeholder hoặc giá trị đang chọn, lựa chọn là `[class*=_option_]`.
 */
export function selectTrigger(scope: Page | Locator, text: string | RegExp): Locator {
  return scope.locator('[class*="selectTrigger"]').filter({ hasText: text }).first();
}

/** Ô chọn nằm cùng khối với nhãn (label không gắn `for`, nên đi từ label lên khối cha). */
export function selectByLabel(scope: Page | Locator, label: string | RegExp): Locator {
  return scope
    .locator('label')
    .filter({ hasText: label })
    .first()
    .locator('xpath=ancestor::div[.//*[contains(@class,"selectTrigger")]][1]')
    .locator('[class*="selectTrigger"]')
    .first();
}

function pageOf(scope: Page | Locator): Page {
  return 'page' in scope && typeof (scope as Locator).page === 'function' ? (scope as Locator).page() : (scope as Page);
}

export function visibleOptions(scope: Page | Locator): Locator {
  return pageOf(scope).locator('[class*="_option_"]').filter({ visible: true });
}

/** Mở ô chọn và trả về danh sách lựa chọn đang hiển thị (đóng lại sau khi đọc). */
export async function optionTexts(trigger: Locator): Promise<string[]> {
  await trigger.click();
  const opts = visibleOptions(trigger);
  await opts.first().waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
  const texts = (await opts.allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  await trigger.page().keyboard.press('Escape');
  if (await opts.first().isVisible().catch(() => false)) await trigger.click();
  return [...new Set(texts)];
}

/** Chọn 1 giá trị (web render đủ mọi lựa chọn, Playwright tự cuộn tới lựa chọn cần bấm). */
export async function chooseOption(trigger: Locator, option: string | RegExp) {
  await trigger.click();
  await visibleOptions(trigger).filter({ hasText: exact(option) }).first().click();
}

/** Chọn lựa chọn đầu tiên đang có (dùng cho danh mục mà test không quan tâm giá trị cụ thể). */
export async function chooseFirstOption(trigger: Locator): Promise<string> {
  await trigger.click();
  const opt = visibleOptions(trigger).first();
  const text = (await opt.innerText()).trim();
  await opt.click();
  return text;
}

const MONTH_TITLE = /Tháng\s+(\d{1,2})\s+(\d{4})/;

/**
 * Chọn ngày trên ô ngày của web (`_wrapper_..._trigger_`, placeholder dd/mm/yyyy hoặc Chọn ngày):
 * mở lịch, đi tới tháng của `iso` bằng nút "Tháng sau"/"Tháng trước", bấm số ngày.
 */
export async function pickDate(trigger: Locator, iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  await trigger.click();
  const page = trigger.page();
  const panel = page.locator('[class*="_calendarPanel_"]').filter({ visible: true }).last();
  for (let i = 0; i < 60; i++) {
    const title = (await panel.locator('[class*="_calTitle_"]').innerText()).trim();
    const [, mm, yy] = title.match(MONTH_TITLE) ?? [];
    const diff = (y - Number(yy)) * 12 + (m - Number(mm));
    if (diff === 0) break;
    await panel.getByRole('button', { name: diff > 0 ? 'Tháng sau' : 'Tháng trước' }).click();
  }
  const cell = panel.locator('[class*="_day_"]').filter({ hasText: new RegExp(`^${d}$`) }).first();
  if (/_dayDisabled_/.test((await cell.getAttribute('class')) ?? '')) {
    await page.keyboard.press('Escape');
    throw new Error(`Ngày ${iso.split('-').reverse().join('/')} bị khoá trên lịch (web chặn chọn ngày này)`);
  }
  await cell.click();
}

/** Ô ngày theo nhãn trường (label không gắn `for`). */
export function dateByLabel(scope: Page | Locator, label: string | RegExp): Locator {
  return scope
    .locator('label')
    .filter({ hasText: label })
    .first()
    .locator('xpath=ancestor::div[.//*[contains(@class,"_trigger_")]][1]')
    .locator('[class*="_trigger_"]')
    .first();
}

/** Ô tìm kiếm, ô lọc trạng thái và khung "Bộ lọc nâng cao" (khung trượt bên phải có Đặt lại / Áp dụng). */
export class FilterBarComponent {
  constructor(readonly root: Page) {}

  get search() {
    return this.root.locator('main input[placeholder^="Tìm kiếm"]').first();
  }
  get statusFilter() {
    return selectTrigger(this.root.locator('main'), /trạng thái|Đang|Tạo mới|Ngưng|Dừng|Hủy|Chưa|Hết/);
  }
  get advancedButton() {
    return this.root.getByRole('button', { name: 'Bộ lọc nâng cao' });
  }
  get drawer() {
    return this.root.locator('[class*="z-[9999]"]').filter({ hasText: 'Bộ lọc nâng cao' }).filter({ visible: true }).last();
  }
  get resetButton() {
    return this.drawer.getByRole('button', { name: 'Đặt lại' });
  }
  get applyButton() {
    return this.drawer.getByRole('button', { name: 'Áp dụng' });
  }

  async searchFor(text: string) {
    await this.search.fill(text);
    await this.search.press('Enter');
  }

  /** Chọn khoảng ngày bằng nút có sẵn của bộ chọn ("Hôm nay", "Hôm qua", "Tuần này", "Tháng này", "Tất cả"). */
  async datePreset(label: string) {
    await this.drawer.locator('[class*="_trigger_"]').first().click();
    await this.root.locator('[class*="_presetBtn_"]').filter({ visible: true }).filter({ hasText: new RegExp(`^${label}$`) }).first().click();
  }
}
