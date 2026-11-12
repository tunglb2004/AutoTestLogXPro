import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel, chooseOption } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Popup Thêm mới Lead 2 bước và popup Chỉnh sửa thông tin Lead. Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class LeadFormPage {
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
    await this.btn('Thêm mới').click();
    await this.companyName.waitFor();
  }
  get companyName() { return this.ph('Nhập tên doanh nghiệp'); }
  get address() { return this.ph('Nhập địa chỉ trụ sở chính'); }
  get taxCode() { return this.ph('Nhập mã số thuế'); }
  industry(name: string) { return this.modal.dialog.getByRole('button', { name, exact: true }); }
  get industryOther() { return this.ph('Nhập ngành hàng'); }
  get source() { return this.select('Nguồn phát sinh'); }
  get route() { return this.select('Cung đường vận chuyển'); }
  get owner() { return this.select('Người phụ trách Lead'); }
  get website() { return this.ph('Nhập website doanh nghiệp'); }
  get note() { return this.ph('Nhập ghi chú nhu cầu 4PL...'); }
  get fileInput() { return this.modal.dialog.locator('input[type=file]'); }
  get next() { return this.btn('Tiếp tục'); }
  get back() { return this.btn('Quay lại'); }
  /** Nút lưu ở bước 2 popup Thêm mới. */
  get save() { return this.modal.button('Thêm mới'); }
  /** Nút lưu ở popup Chỉnh sửa thông tin. */
  get saveEdit() { return this.btn('Lưu thông tin'); }
  get addContact() { return this.btn('Thêm người liên hệ'); }
  contactName(i = 0) { return this.ph('VD: Nguyễn Văn A').nth(i); }
  contactTitle(i = 0) { return this.ph('VD: Trưởng Phòng Vận Tải').nth(i); }
  contactPhone(i = 0) { return this.ph('VD: 0977888XXX').nth(i); }
  contactEmail(i = 0) { return this.ph('VD: nguyenvana@gmail.com').nth(i); }
  /** Công tắc "Liên hệ chính" của từng người liên hệ. */
  primarySwitch(i = 0) { return this.modal.dialog.getByRole('switch').nth(i); }
  removeContact(i = 0) { return this.modal.dialog.getByRole('button', { name: 'Xoá người liên hệ' }).nth(i); }
  error(text: string | RegExp) { return this.toast.fieldErrors.filter({ hasText: text }); }

  /** Bước 1 (hoặc popup Sửa): chỉ điền trường được truyền; ngành/nguồn/tuyến là tên hiển thị trên web. */
  async fillCompany(d: { name?: string; taxCode?: string; address?: string; industries?: string[]; other?: string; source?: string; route?: string; website?: string; note?: string }) {
    if (d.name !== undefined) await this.companyName.fill(d.name);
    if (d.address !== undefined) await this.address.fill(d.address);
    if (d.taxCode !== undefined) await this.taxCode.fill(d.taxCode);
    for (const i of d.industries ?? []) await this.industry(i).click();
    if (d.other !== undefined) await this.industryOther.fill(d.other);
    if (d.source) await chooseOption(this.source, d.source);
    if (d.route) await chooseOption(this.route, d.route);
    if (d.website !== undefined) await this.website.fill(d.website);
    if (d.note !== undefined) await this.note.fill(d.note);
  }

  /**
   * Mở popup, điền bước 1 + người liên hệ 1, bấm Thêm mới và trả về response POST /api/leads
   * (null nếu form chặn ở phía web và không gửi request trong 5 giây).
   */
  async create(d: Parameters<LeadFormPage['fillCompany']>[0], contact: { name?: string; title?: string; phone?: string; email?: string }) {
    await this.goto();
    await this.fillCompany(d);
    await this.next.click();
    await this.contactName(0).waitFor({ timeout: 5_000 }).catch(() => undefined);
    if (!(await this.contactName(0).isVisible())) return null;
    await this.fillContact(0, contact);
    const res = this.page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/leads$/.test(new URL(r.url()).pathname), { timeout: 5_000 }).catch(() => null);
    await this.save.click();
    return res;
  }

  async fillContact(i: number, c: { name?: string; title?: string; phone?: string; email?: string }) {
    if (c.name !== undefined) await this.contactName(i).fill(c.name);
    if (c.title !== undefined) await this.contactTitle(i).fill(c.title);
    if (c.phone !== undefined) await this.contactPhone(i).fill(c.phone);
    if (c.email !== undefined) await this.contactEmail(i).fill(c.email);
  }
}
