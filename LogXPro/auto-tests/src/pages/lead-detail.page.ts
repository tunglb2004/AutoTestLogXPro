import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Chi tiết Lead (/leads/{id}) và các popup trên màn. Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class LeadDetailPage {
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
    await this.page.goto(`/leads/${id}`);
    await this.page.getByText('Quay lại danh sách').waitFor();
  }
  get main() { return this.page.locator('main'); }
  get deactivate() { return this.btn('Ngưng hoạt động'); }
  get reactivate() { return this.page.getByRole('button', { name: /Kích hoạt lại/ }).filter({ visible: true }); }
  get transfer() { return this.btn('Chuyển người phụ trách Lead'); }
  get edit() { return this.btn('Chỉnh sửa thông tin'); }
  get history() { return this.btn('Lịch sử thao tác'); }
  get addContact() { return this.btn('Thêm đầu mối'); }
  /** Nút icon (aria-label) trên từng thẻ đầu mối, theo thứ tự hiển thị. */
  editContact(i = 0) { return this.page.getByRole('button', { name: 'Chỉnh sửa đầu mối' }).nth(i); }
  deleteContact(i = 0) { return this.page.getByRole('button', { name: 'Xoá đầu mối' }).nth(i); }
  get setPrimary() { return this.page.getByText('Đặt làm liên hệ chính', { exact: true }).filter({ visible: true }); }
  /** Popup đầu mối: Họ và tên / Chức vụ / Số điện thoại / Địa chỉ email. */
  get contactName() { return this.modal.input('Nhập họ và tên'); }
  get contactTitle() { return this.modal.input('Nhập tên chức vụ'); }
  get contactPhone() { return this.modal.input('Nhập số điện thoại'); }
  get contactEmail() { return this.modal.input('Nhập địa chỉ email'); }
  get contactSubmit() { return this.modal.button(/^(Thêm đầu mối|Lưu thay đổi)$/); }
  /** Popup chuyển người phụ trách: ô "Người phụ trách mới" và ô "Nhập lý do". */
  get newOwner() { return this.modal.dialog.locator('[class*="selectTrigger"]').first(); }
  /** Popup lịch sử thao tác: bảng THỜI GIAN | NGƯỜI THỰC HIỆN | HÀNH ĐỘNG | NỘI DUNG. */
  get historyRows() { return this.modal.dialog.locator('tbody tr'); }
  get historyPageSize() { return this.modal.dialog.locator('select').first(); }
}
