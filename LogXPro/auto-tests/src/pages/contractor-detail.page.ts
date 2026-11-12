import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Chi tiết nhà thầu (/suppliers/{id}) với 3 tab Thông tin nhà thầu, Hồ sơ pháp lí, Bảng giá dịch vụ. Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class ContractorDetailPage {
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
    await this.page.goto(`/suppliers/${id}`);
    await this.page.getByText('Quay lại danh sách').waitFor();
  }
  get main() { return this.page.locator('main'); }
  get infoTab() { return this.btn('Thông tin nhà thầu'); }
  /** Tab "Hồ sơ pháp lí" chứa bảng Hợp đồng nhà thầu. */
  get contractsTab() { return this.btn('Hồ sơ pháp lí'); }
  get priceTab() { return this.btn('Bảng giá dịch vụ'); }
  get history() { return this.btn('Lịch sử thao tác'); }
  get edit() { return this.btn('Chỉnh sửa'); }
  get updateTier() { return this.btn('Cập nhật hạng'); }
  get terminateButton() { return this.btn('Dừng hợp tác'); }
  get reactivate() { return this.page.getByRole('button', { name: /Kích hoạt lại/ }).filter({ visible: true }); }
  get deleteButton() { return this.main.getByRole('button', { name: /^(Xoá|Xóa)( nhà thầu)?$/ }).filter({ visible: true }); }
  get addContact() { return this.page.getByRole('button', { name: /Thêm (đầu mối|người liên hệ)/ }).filter({ visible: true }); }
  get editContact() { return this.btn('Chỉnh sửa người liên hệ'); }
  get addContract() { return this.page.getByRole('button', { name: /Thêm hợp đồng/ }).filter({ visible: true }); }
  get tierSelect() { return this.modal.dialog.locator('[class*="selectTrigger"]').first(); }
}
