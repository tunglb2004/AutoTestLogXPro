import { Page } from '@playwright/test';

/**
 * Popup của web (xác nhận, nhập lý do, form sửa).
 * Popup là khối `max-w-[...] rounded-2xl` (thẻ div hoặc form, có thể nằm trong div[role=dialog]) đang hiển thị (xác nhận trên web DEV 2026-11-05).
 */
export class ModalComponent {
  constructor(readonly root: Page) {}

  get dialog() {
    return this.root.locator('[class*="max-w-["][class*="rounded-2xl"]').filter({ visible: true }).last();
  }
  /** Ô lý do: textarea "Nhập nội dung..." (ngưng hoạt động) hoặc ô "Nhập lý do" (chuyển người phụ trách). */
  get reason() {
    return this.dialog.locator('textarea, input[placeholder="Nhập lý do"]').first();
  }
  get confirm() {
    return this.dialog.getByRole('button', { name: 'Xác nhận', exact: true });
  }
  get cancel() {
    return this.dialog.getByRole('button', { name: /^(Hủy|Huỷ)$/ });
  }
  get close() {
    return this.dialog.getByRole('button', { name: 'Đóng', exact: true });
  }

  /**
   * Ô lý do có maxlength: gõ quá ngưỡng thì web cắt bớt (chặn nhập, đúng quy tắc "chặn nhập hoặc báo lỗi" của tài liệu).
   * Trả true khi giá trị trong ô ngắn hơn chuỗi đã gõ: khi đó giá trị gửi đi hợp lệ, biến thể được coi là đã chặn tại ô.
   */
  async blockedAtInput(typed: string): Promise<boolean> {
    if (!(await this.reason.isVisible().catch(() => false))) return false;
    const value = await this.reason.inputValue();
    return value.length < typed.length && value.trim().length > 0;
  }

  button(name: string | RegExp) {
    return this.dialog.getByRole('button', { name: typeof name === 'string' ? new RegExp(`^${name}$`) : name });
  }
  input(placeholder: string) {
    return this.dialog.getByPlaceholder(placeholder, { exact: true });
  }
}
