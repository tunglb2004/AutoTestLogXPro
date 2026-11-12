import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Danh sách Lead (/leads). Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class LeadListPage {
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
    await this.page.goto('/leads');
    await this.table.headers.first().waitFor();
  }
  get addButton() { return this.btn('Thêm mới'); }
  get importButton() { return this.btn('Nhập dữ liệu'); }
  get exportButton() { return this.btn('Xuất dữ liệu'); }
  get menuLink() { return this.page.locator('a[href="/leads"]'); }
  /** Ô số liệu tổng quan ở đầu màn, dạng "Tổng số lead: 650", trả về { nhãn: số }. */
  async stats(): Promise<Record<string, number>> {
    const text = (await this.page.locator('main').innerText()).split('Xuất dữ liệu')[0];
    const out: Record<string, number> = {};
    for (const m of text.matchAll(/([A-Za-zÀ-ỹ][A-Za-zÀ-ỹ ]*?)\s*:?\s*\n?\s*(\d[\d.,]*)/g)) out[m[1].trim()] = Number(m[2].replace(/[.,]/g, ''));
    return out;
  }
  /** Popup "Nhập danh sách Lead": Tải file mẫu, input .xlsx, nút Import. */
  get importTemplateButton() { return this.modal.button('Tải file mẫu'); }
  get importSubmit() { return this.modal.button('Import'); }
}
