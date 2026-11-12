import { Locator, Page } from '@playwright/test';

/** Menu trái theo quyền. */
export class SidebarMenuComponent {
  constructor(readonly page: Page) {}

  get root(): Locator {
    return this.page.locator('aside, nav').first();
  }
  item(name: string | RegExp): Locator {
    return this.root.getByRole('link', { name }).or(this.root.getByText(name, { exact: typeof name === 'string' })).first();
  }
  async open(name: string | RegExp): Promise<void> {
    await this.item(name).click();
  }
}
