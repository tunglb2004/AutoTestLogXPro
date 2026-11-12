import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Form Thêm mới giá mua đầu vào (/purchase-prices/add) và popup Thêm dòng giá. Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class PurchasePriceFormPage {
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

  async goto() {
    await this.page.goto('/purchase-prices/add');
    await this.name.waitFor();
  }
  get name() { return this.ph('Nhập tên bảng giá'); }
  get contractor() { return this.select('Nhà thầu phụ trách'); }
  get contractCode() { return this.ph('Tự động điền theo nhà thầu'); }
  get effectiveFrom() { return this.date('Ngày hiệu lực'); }
  get effectiveTo() { return this.date('Ngày hết hiệu lực'); }
  /** "Thêm 1 dòng" của đầu mục giá Cố định đầu tiên; mở popup "Thêm dòng giá" (5 ô chọn + đơn giá). */
  get addLine() { return this.btn('Thêm 1 dòng').first(); }
  get lineSelects() { return this.modal.dialog.locator('[class*="selectTrigger"]'); }
  get unitPrice() { return this.modal.input('Nhập đơn giá'); }
  get lineSubmit() { return this.modal.button('Thêm'); }
  get save() { return this.page.locator('main').getByRole('button', { name: 'Thêm', exact: true }).first(); }
}
