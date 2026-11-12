import { Locator, Page } from '@playwright/test';

/** Hộp thoại xác nhận, nhập lý do. */
export class ModalComponent {
  constructor(readonly page: Page) {}

  get dialog(): Locator {
    return this.page.getByRole('dialog').last();
  }
  button(name: string | RegExp): Locator {
    return this.dialog.getByRole('button', { name });
  }
  field(label: string | RegExp): Locator {
    return this.dialog.getByLabel(label);
  }
  async confirm(name: string | RegExp = /Xác nhận|Đồng ý|Lưu/): Promise<void> {
    await this.button(name).click();
  }
  async cancel(): Promise<void> {
    await this.button(/Hủy|Đóng/).click();
  }
}
