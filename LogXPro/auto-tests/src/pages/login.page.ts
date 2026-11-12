import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';

/** Màn đăng nhập (locator đã xác nhận trên web DEV 2026-11-05; tenant do web gửi cố định). Locator theo nhãn SRS, chưa xác nhận trên web; đường dẫn màn hình đọc từ biến môi trường. */
export class LoginPage {
  readonly table: DataTableComponent;
  readonly modal: ModalComponent;
  readonly toast: ToastComponent;

  constructor(readonly page: Page) {
    this.table = new DataTableComponent(page);
    this.modal = new ModalComponent(page);
    this.toast = new ToastComponent(page);
  }

  async goto() {
    await this.page.goto('/login');
  }

  get email() {
    return this.page.getByPlaceholder('Nhập tên đăng nhập');
  }
  get password() {
    return this.page.getByPlaceholder('Nhập mật khẩu');
  }
  get submit() {
    return this.page.getByRole('button', { name: 'Đăng nhập', exact: true });
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
