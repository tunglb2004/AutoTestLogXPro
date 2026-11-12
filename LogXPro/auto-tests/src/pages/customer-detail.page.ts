import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Chi tiết khách hàng (/customers/{id}) và các popup. Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class CustomerDetailPage {
  readonly table: DataTableComponent;
  readonly modal: ModalComponent;
  readonly toast: ToastComponent;
  readonly filter: FilterBarComponent;
  readonly files: FileUploadComponent;

  constructor(readonly page: Page) {
    this.table = new DataTableComponent(page);
    this.modal = new ModalComponent(page);
    this.toast = new ToastComponent(page);
    this.filter = new FilterBarComponent(page);
    this.files = new FileUploadComponent(page);
  }

  btn(name: string) {
    // Nút chọn kiểu "Theo sự kiện phát sinh", "Chuyển khoản" là role=radio trên web.
    return this.page.getByRole('button', { name, exact: true }).or(this.page.getByRole('radio', { name, exact: true })).filter({ visible: true });
  }
  ph(placeholder: string) {
    return this.page.getByPlaceholder(placeholder, { exact: true }).filter({ visible: true });
  }
  select(label: string | RegExp) {
    return selectByLabel(this.page, label);
  }
  date(label: string | RegExp) {
    return dateByLabel(this.page, label);
  }

  async goto(id: string) {
    await this.page.goto(`/customers/${id}`);
    await this.page.getByText('Quay lại danh sách').waitFor();
  }
  get main() { return this.page.locator('main'); }
  get editTier() { return this.btn('Chỉnh sửa phân hạng'); }
  get viewContract() { return this.btn('Xem hợp đồng'); }
  get transfer() { return this.btn('Chuyển người phụ trách'); }
  get edit() { return this.btn('Chỉnh sửa thông tin'); }
  get editCredit() { return this.btn('Chỉnh sửa hạn mức'); }
  get addContact() { return this.btn('Thêm đầu mối'); }
  editContact(i = 0) { return this.page.getByRole('button', { name: 'Chỉnh sửa đầu mối' }).nth(i); }
  deleteContact(i = 0) { return this.page.getByRole('button', { name: 'Xoá đầu mối' }).nth(i); }
  get setPrimary() { return this.page.getByText('Đặt làm liên hệ chính', { exact: true }).filter({ visible: true }); }
  get creditInput() { return this.modal.input('Nhập hạn mức tín dụng'); }
  get saveCredit() { return this.modal.button('Lưu hạn mức'); }
  get tierSelect() { return this.modal.dialog.locator('[class*="selectTrigger"]').first(); }
  get saveTier() { return this.modal.button('Lưu phân hạng'); }
  get newManager() { return this.modal.dialog.locator('[class*="selectTrigger"]').first(); }
  get contactName() { return this.modal.input('Nhập họ và tên'); }
  get contactTitle() { return this.modal.input('Nhập tên chức vụ'); }
  get contactPhone() { return this.modal.input('Nhập số điện thoại'); }
  get contactEmail() { return this.modal.input('Nhập địa chỉ email'); }
  get contactSubmit() { return this.modal.button(/^(Thêm đầu mối|Lưu thay đổi)$/); }
  /** Popup sửa hồ sơ: dùng chung placeholder với form Lead. */
  get companyName() { return this.modal.input('Nhập tên doanh nghiệp'); }
  get address() { return this.modal.input('Nhập địa chỉ trụ sở chính'); }
  get taxCode() { return this.modal.input('Nhập mã số thuế'); }
  get saveEdit() { return this.modal.button('Lưu thông tin'); }
}
