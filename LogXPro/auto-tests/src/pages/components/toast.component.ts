import { Page } from '@playwright/test';

/** Thông báo nổi của web (khối `_message_`, xác nhận trên web DEV 2026-11-05) và dòng lỗi dưới trường nhập. */
export class ToastComponent {
  constructor(readonly root: Page) {}

  get message() {
    return this.root.locator('[class*="_message_"]').filter({ visible: true });
  }

  /** Dòng lỗi dưới trường: form Lead dùng `.help.err`, form HĐ dùng `text-red-500`/màu danger. */
  get fieldErrors() {
    return this.root.locator('span.help.err, span.text-red-500, span[class*="xc-danger"]').filter({ visible: true }).filter({ hasText: /\S{2,}/ }); // bỏ dấu * bắt buộc cùng màu
  }
}
