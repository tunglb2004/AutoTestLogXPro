import { Locator, Page } from '@playwright/test';
import { ToastComponent } from '../../core/pages/components/toast.component';

/** Màn Đăng nhập (/login). Locator đã dùng được trên web dev ở project cũ (placeholder và nút "Đăng nhập"); tenant do web gửi cố định. */
export class DangNhapPage {
  readonly toast: ToastComponent;

  constructor(readonly page: Page) {
    this.toast = new ToastComponent(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }
  get email(): Locator {
    return this.page.getByPlaceholder('Nhập tên đăng nhập');
  }
  get password(): Locator {
    return this.page.getByPlaceholder('Nhập mật khẩu');
  }
  get submit(): Locator {
    return this.page.getByRole('button', { name: 'Đăng nhập', exact: true });
  }
  get forgotPassword(): Locator {
    return this.page.getByText(/Quên mật khẩu/i);
  }
  get showPassword(): Locator {
    return this.page.locator('input[type="password"] ~ *, [aria-label*="mật khẩu" i] button').first();
  }

  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: /tài khoản|avatar|người dùng/i }).first().click();
    await this.page.getByText(/Đăng xuất/).click();
  }
}
