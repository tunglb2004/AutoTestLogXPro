import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel, chooseOption, pickDate } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Form hợp đồng nhà thầu (/contractor-contracts/new), chế độ Thêm mới hợp đồng / Tái ký hợp đồng. Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class ContractorContractFormPage {
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
    await this.page.goto('/contractor-contracts/new');
    await this.name.waitFor();
  }
  get modeNew() { return this.btn('Thêm mới hợp đồng'); }
  get modeResign() { return this.btn('Tái ký hợp đồng'); }
  get contractor() { return this.select(/^Nhà thầu/); }
  /** Chế độ Tái ký đổi placeholder thành "Nhập tên hợp đồng mới". */
  get name() { return this.ph('Nhập tên hợp đồng').or(this.ph('Nhập tên hợp đồng mới')); }
  get legalNumber() { return this.ph('VD: 45/2026/HĐDV-LogX'); }
  get signedOn() { return this.date('Ngày ký'); }
  get effectiveFrom() { return this.date('Ngày hiệu lực'); }
  get effectiveTo() { return this.date('Ngày hết hạn'); }
  get scanInput() { return this.page.locator('main input[type=file][accept=".pdf,.docx"]').first(); }
  annexInput(i = 0) { return this.page.locator('main input[type=file][accept=".pdf,application/pdf"]').nth(i); }
  annexName(i = 0) { return this.ph('Nhập tên').nth(i); }
  annexDesc(i = 0) { return this.ph('Nhập nội dung...').nth(i); }
  get annexBlocks() { return this.page.locator('main').getByRole('button', { name: /^Phụ lục hợp đồng #\d+$/ }); }
  get addAnnex() { return this.btn('Thêm phụ lục hợp đồng'); }
  get manualRenew() { return this.btn('Thủ công'); }
  get autoRenew() { return this.btn('Tự động'); }
  get renewalCycle() { return this.page.locator('main [class*="selectTrigger"]').filter({ hasText: /chu kỳ gia hạn|tháng/ }).first(); }
  get save() { return this.page.locator('main').getByRole('button', { name: /^(Thêm|Tái ký|Lưu.*)$/ }).first(); }
  error(text: string | RegExp) { return this.toast.fieldErrors.filter({ hasText: text }); }

  /** Điền form chế độ Thêm mới; trường truyền `null` thì bỏ trống. Khối phụ lục có sẵn được xoá nếu `annexes` = 0. */
  async fill(d: { contractor?: string | null; name?: string | null; legalNumber?: string | null; signedOn?: string | null; effectiveFrom?: string | null; effectiveTo?: string | null; scan?: { name: string; mimeType: string; buffer: Buffer } | null; annexes?: number }) {
    if (d.contractor) await chooseOption(this.contractor, d.contractor);
    if (d.name !== null) await this.name.fill(d.name ?? 'Hợp đồng vận chuyển hàng hóa tuyến Việt – Trung');
    if (d.legalNumber !== null) await this.legalNumber.fill(d.legalNumber ?? `${Date.now() % 1_000_000}/2026/HĐDV-LogX`);
    if (d.signedOn) await pickDate(this.signedOn, d.signedOn);
    if (d.effectiveFrom) await pickDate(this.effectiveFrom, d.effectiveFrom);
    if (d.effectiveTo) await pickDate(this.effectiveTo, d.effectiveTo);
    if (d.scan) await this.scanInput.setInputFiles(d.scan);
    const keep = d.annexes ?? 0;
    const remove = this.page.getByRole('button', { name: 'Xoá phụ lục' });
    while ((await remove.count()) > keep) await remove.first().click();
    // Thêm khối mới thì khối trước tự thu gọn: điền từng khối ngay sau khi mở (ô đang hiển thị cuối cùng).
    for (let i = 0; i < keep; i++) {
      if ((await this.annexBlocks.count()) <= i) await this.addAnnex.click();
      await this.ph('Nhập tên').last().fill(`Phụ lục bảng giá số ${i + 1}`);
      await this.ph('Nhập nội dung...').last().fill('Bảng giá cước vận chuyển áp dụng theo tuyến');
      await this.page.locator('main input[type=file][accept=".pdf,application/pdf"]').last().setInputFiles({ name: `phu-luc-${i + 1}.pdf`, mimeType: 'application/pdf', buffer: Buffer.from(`%PDF-1.4\n% phu luc ${i + 1}\n%%EOF`) });
    }
  }

  /** Bấm Thêm và trả về response POST tạo/tái ký HĐ nhà thầu (null nếu web chặn). */
  async submit() {
    const res = this.page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/contractor-contracts(\/[^/]+\/resign)?$/.test(new URL(r.url()).pathname), { timeout: 8_000 }).catch(() => null);
    await this.save.click();
    return res;
  }
}
