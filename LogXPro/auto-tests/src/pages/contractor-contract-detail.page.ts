import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Danh sách (/contractor-contracts) và chi tiết hợp đồng nhà thầu (/contractor-contracts/{id}). Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class ContractorContractDetailPage {
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

  async goto(id?: string) {
    await this.page.goto(id ? `/contractor-contracts/${id}` : '/contractor-contracts');
    await this.page.locator('main').getByText(id ? 'Quay lại danh sách' : 'MÃ HỢP ĐỒNG').first().waitFor();
  }
  /** Nhãn nút trên web ứng với mã availableActions của GET /api/contractor-contracts/{id}. */
  static readonly ACTION_LABEL: Record<string, RegExp> = {
    EDIT: /^Chỉnh sửa$/,
    EXTEND: /^Gia hạn$/,
    RESIGN: /^Tái ký$/,
    SUSPEND: /^Dừng khai thác$/,
    CANCEL: /^Hủy hợp đồng$/,
    CONFIGURE_AUTO_RENEWAL: /^(Bật gia hạn tự động|Tắt tự động gia hạn)$/,
    MANAGE_ANNEXES: /^Thêm$/,
  };
  static readonly ALL_ACTIONS = Object.keys(ContractorContractDetailPage.ACTION_LABEL);
  action(code: string) {
    return this.page.locator('main').getByRole('button', { name: ContractorContractDetailPage.ACTION_LABEL[code] ?? code }).filter({ visible: true });
  }
  get viewFile() { return this.btn('Xem file'); }
  get download() { return this.btn('Tải xuống'); }
}
