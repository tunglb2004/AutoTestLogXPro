import { Page } from '@playwright/test';
import { DataTableComponent } from './components/data-table.component';
import { ModalComponent } from './components/modal.component';
import { ToastComponent } from './components/toast.component';
import { FilterBarComponent, selectByLabel, dateByLabel, chooseOption } from './components/filter-bar.component';
import { FileUploadComponent } from './components/file-upload.component';

/** Form Thêm mới nhà thầu (/suppliers/add) và Chỉnh sửa (/suppliers/{id}/edit). Locator xác nhận trên web DEV 2026-11-05 (đăng nhập tunglead2 / tungkh2). */
export class ContractorFormPage {
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
    await this.page.goto('/suppliers/add');
    await this.name.waitFor();
  }
  async gotoEdit(id: string) {
    await this.page.goto(`/suppliers/${id}/edit`);
    await this.name.waitFor();
  }
  get name() { return this.ph('Nhập tên doanh nghiệp'); }
  get tier() { return this.select('Phân hạng'); }
  get taxCode() { return this.ph('Nhập mã số thuế'); }
  get phone() { return this.ph('Nhập số điện thoại').first(); }
  get email() { return this.ph('Nhập email doanh nghiệp'); }
  get address() { return this.ph('Nhập địa chỉ trụ sở chính'); }
  get website() { return this.ph('Nhập địa chỉ website'); }
  serviceType(name: string) { return this.page.locator('main').getByRole('button', { name, exact: true }); }
  /** 4 ô "Nhập nội dung..." theo thứ tự: Khu vực hoạt động, Hạn mức sản lượng, Mô tả năng lực, Ghi chú. */
  get area() { return this.ph('Nhập nội dung...').nth(0); }
  get capacity() { return this.ph('Nhập nội dung...').nth(1); }
  get capability() { return this.ph('Nhập nội dung...').nth(2); }
  get note() { return this.ph('Nhập nội dung...').nth(3); }
  get score() { return this.ph('Nhập điểm từ 0 đến 5'); }
  get fileInput() { return this.page.locator('main input[type=file]').first(); }
  get contactName() { return this.ph('Nhập họ tên').first(); }
  get contactTitle() { return this.ph('Nhập chức danh').first(); }
  get contactPhone() { return this.ph('Nhập số điện thoại').last(); }
  get contactEmail() { return this.ph('Nhập địa chỉ email').first(); }
  get save() { return this.page.locator('main').getByRole('button', { name: /^(Thêm|Lưu thông tin)$/ }).first(); }
  error(text: string | RegExp) { return this.toast.fieldErrors.filter({ hasText: text }); }

  /** Điền form Thêm mới với dữ liệu hợp lệ; trường truyền `null` thì bỏ trống. */
  async fill(d: { name?: string | null; tier?: string | null; taxCode?: string | null; service?: string | null; capacity?: string | null; capability?: string | null; score?: string | null; address?: string; contactName?: string | null; contactPhone?: string | null }) {
    if (d.name !== null) await this.name.fill(d.name ?? `Công ty TNHH Vận tải Đồng Đăng ${Date.now() % 100000}`);
    if (d.tier !== null) await chooseOption(this.tier, d.tier ?? 'Ưu tiên');
    if (d.taxCode !== null) await this.taxCode.fill(d.taxCode ?? '');
    if (d.service !== null) await this.serviceType(d.service ?? 'Vận tải').click();
    if (d.capacity !== null) await this.capacity.fill(d.capacity ?? 'Đội xe 20 đầu kéo container tại Lạng Sơn');
    if (d.capability !== null) await this.capability.fill(d.capability ?? 'Vận chuyển hàng nông sản qua cửa khẩu Hữu Nghị');
    if (d.score !== null) await this.score.fill(d.score ?? '4');
    if (d.address !== undefined) await this.address.fill(d.address);
    if (d.contactName !== null) await this.contactName.fill(d.contactName ?? 'Nguyễn Văn Điều Phối');
    if (d.contactPhone !== null) await this.contactPhone.fill(d.contactPhone ?? `09${Date.now().toString().slice(-8)}`);
  }

  /** Bấm Thêm/Lưu và trả về response POST/PUT /api/contractors (null nếu web chặn, không gửi request). */
  async submit() {
    const res = this.page.waitForResponse((r) => ['POST', 'PUT'].includes(r.request().method()) && /\/api\/contractors(\/[^/]+)?$/.test(new URL(r.url()).pathname), { timeout: 8_000 }).catch(() => null);
    await this.save.click();
    return res;
  }
}
