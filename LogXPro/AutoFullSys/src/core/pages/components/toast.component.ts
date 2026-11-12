import { Locator, Page } from '@playwright/test';

/** Thông báo thành công/lỗi góc màn hình. */
export class ToastComponent {
  constructor(readonly page: Page) {}

  get any(): Locator {
    return this.page.locator('[role="status"], [role="alert"], .toast, [class*="toast"], [class*="notification"]').first();
  }
  withText(text: string | RegExp): Locator {
    return this.page.locator('[role="status"], [role="alert"], .toast, [class*="toast"], [class*="notification"]').filter({ hasText: text }).first();
  }
}
