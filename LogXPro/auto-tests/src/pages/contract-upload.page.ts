import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel, chooseOption, chooseFirstOption, pickDate } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Form Thêm mới hợp đồng khách hàng (/contracts/new) và form sửa (/contracts/{id}/edit). Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class ContractUploadPage {
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
    await this.page.goto('/contracts/new');
    await this.contractNumber.waitFor();
  }
  async gotoEdit(id: string) {
    await this.page.goto(`/contracts/${id}/edit`);
    await this.contractNumber.waitFor();
  }
  get customer() { return this.select(/^Khách hàng/); }
  get tier() { return this.select('Phân hạng khách hàng'); }
  get manager() { return this.select('Người phụ trách khách hàng'); }
  /** Form sửa HĐ bắt buộc "Lý do chỉnh sửa". */
  get editReason() { return this.page.locator('main textarea[placeholder^="Ghi rõ"]'); }
  get contractNumber() { return this.ph('Nhập số hợp đồng'); }
  get signedOn() { return this.date('Ngày ký thực tế'); }
  get effectiveFrom() { return this.date('Ngày hiệu lực'); }
  get effectiveTo() { return this.date('Ngày hết hạn'); }
  get billingCycle() { return this.select('Chu kỳ xuất HĐ'); }
  get paymentTermDays() { return this.ph('VD: 30'); }
  get paymentByEvent() { return this.btn('Theo sự kiện phát sinh'); }
  get paymentTransfer() { return this.btn('Chuyển khoản'); }
  /** File HĐ đã ký: input file cuối form; file phụ lục: input file trong từng khối phụ lục. */
  get scanInput() { return this.page.locator('main input[type=file]').last(); }
  annexInput(i = 0) { return this.page.locator('main input[type=file]').nth(i); }
  /** Khối phụ lục cũ thu gọn bị gỡ ô file khỏi DOM: ô file của khối mới nhất là ô áp chót. */
  async newestAnnexInput() {
    const all = this.page.locator('main input[type=file]');
    return all.nth((await all.count()) - 2);
  }
  annexName(i = 0) { return this.ph('Nhập tên').nth(i); }
  get annexBlocks() { return this.page.locator('main').getByRole('button', { name: /^Phụ lục hợp đồng #\d+$/ }); }
  get addAnnex() { return this.btn('Thêm phụ lục hợp đồng'); }
  get removeAnnex() { return this.page.getByRole('button', { name: 'Xoá phụ lục' }); }
  get save() { return this.page.locator('main').getByRole('button', { name: /^(Thêm|Lưu.*)$/ }).first(); }
  error(text: string | RegExp) { return this.toast.fieldErrors.filter({ hasText: text }); }

  /**
   * Điền form Upload HĐ đầu tiên; trường nào truyền `null` thì bỏ trống.
   * `annexes`: số khối phụ lục giữ lại (mặc định 0, xoá khối "Phụ lục hợp đồng #1" có sẵn).
   */
  async fill(d: {
    customer?: string | RegExp | null; tier?: string | null; manager?: string | null; contractNumber?: string | null;
    signedOn?: string | null; effectiveFrom?: string | null; effectiveTo?: string | null;
    paymentTermDays?: string | null; scan?: { name: string; mimeType: string; buffer: Buffer } | null;
  }) {
    if (d.customer) await chooseOption(this.customer, d.customer);
    if (d.tier !== null) await chooseOption(this.tier, d.tier ?? 'Khách hàng thường');
    if (d.manager) await chooseOption(this.manager, d.manager);
    if (d.contractNumber !== null) await this.contractNumber.fill(d.contractNumber ?? `HĐDV-${Date.now() % 1_000_000}/2026/LXP`);
    if (d.signedOn) await pickDate(this.signedOn, d.signedOn);
    if (d.effectiveFrom) await pickDate(this.effectiveFrom, d.effectiveFrom);
    if (d.effectiveTo) await pickDate(this.effectiveTo, d.effectiveTo);
    if (d.paymentTermDays !== null) {
      await chooseFirstOption(this.billingCycle);
      await this.paymentTermDays.fill(d.paymentTermDays ?? '30');
      await this.paymentByEvent.click();
      // Chọn "Theo sự kiện phát sinh" thì web hiện ô bắt buộc "Chọn mốc sự kiện" (Ngày phát hành hóa đơn, Ngày xác nhận POD...).
      await chooseFirstOption(this.select('Chọn mốc sự kiện'));
      await this.paymentTransfer.click();
    }
    if (d.scan) await this.scanInput.setInputFiles(d.scan);
  }

  async removeAllAnnexes() {
    while (await this.removeAnnex.count()) await this.removeAnnex.first().click();
  }
}
