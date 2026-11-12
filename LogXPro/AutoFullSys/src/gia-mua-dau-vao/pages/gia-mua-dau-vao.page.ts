import { Locator, Page } from '@playwright/test';
import { DataTableComponent, cardNumber, esc, inputByLabel, selectByLabel } from '../../core/pages/components/data-table.component';
import { ModalComponent } from '../../core/pages/components/modal.component';
import { ToastComponent } from '../../core/pages/components/toast.component';
import { SidebarMenuComponent } from '../../core/pages/components/sidebar-menu.component';

/**
 * Page Object màn "Giá mua đầu vào" (/purchase-prices, /purchase-prices/add, chi tiết /purchase-prices/{id}).
 * Locator lấy từ giao diện thật trên web dev (11/2026): ô lọc tùy biến "Tất cả trạng thái"/"Tất cả nhà thầu"; ô chọn hàng aria "Chọn {mã}";
 * chọn ≥ 1 hàng thì hiện "Đã chọn N bảng giá" và nút "Xuất dữ liệu"; nút "Xoá" ở cột Thao tác; form thêm mới có ô chọn nhà thầu có
 * tìm kiếm, ô ngày dạng lịch (nút "Hôm nay", "Tháng sau"), lỗi hiện dưới ô; "Thêm 1 dòng" mở modal "Thêm dòng giá", "Thêm nhiều dòng"
 * mở modal "Thêm nhiều dòng giá" (ô chọn nhiều có "Tất cả", tổng hợp "X Điểm đi × Y Điểm đến × Z Loại xe = N dòng"). Chỉ thao tác, không assert.
 */
export class GiaMuaDauVaoPage {
  static readonly ROUTE = '/purchase-prices';
  static readonly SERVICES = ['Khai báo hải quan', 'Hải quan giám sát', 'Vận tải', 'Sang tải', 'Kho bãi'] as const;
  static readonly CARDS = ['Tổng số bảng giá giá mua', 'Đang hoạt động', 'Ngừng hoạt động', 'Hết hiệu lực'] as const;
  readonly table: DataTableComponent;
  readonly modal: ModalComponent;
  readonly toast: ToastComponent;
  readonly menu: SidebarMenuComponent;

  constructor(readonly page: Page) {
    this.table = new DataTableComponent(page, page.locator('main table').first());
    this.modal = new ModalComponent(page);
    this.toast = new ToastComponent(page);
    this.menu = new SidebarMenuComponent(page);
  }

  async goto(path: string = GiaMuaDauVaoPage.ROUTE): Promise<void> {
    await this.page.goto(path);
  }
  button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name, exact: typeof name === 'string' });
  }
  tab(name: string | RegExp): Locator {
    return this.page.locator('main').getByRole('button', { name, exact: typeof name === 'string' }).first();
  }
  field(label: string | RegExp): Locator {
    return this.page.getByLabel(label);
  }
  text(value: string | RegExp): Locator {
    return this.page.getByText(value).first();
  }

  // ---------- Danh sách
  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Quản lý giá mua', exact: true });
  }
  card(label: string): Promise<number> {
    return cardNumber(this.page, label);
  }
  get search(): Locator {
    return this.page.getByPlaceholder('Tìm kiếm theo mã hoặc tên bảng giá...', { exact: true });
  }
  /** Ô lọc tùy biến theo chữ đang hiển thị ("Tất cả trạng thái", "Tất cả nhà thầu" hoặc giá trị đã chọn). */
  filter(kind: 'status' | 'contractor'): Locator {
    return this.page.locator('main div[tabindex="0"]').nth(kind === 'status' ? 0 : 1);
  }
  get rows(): Locator {
    return this.table.rows;
  }
  row(code: string): Locator {
    return this.rows.filter({ hasText: code }).first();
  }
  rowCheckbox(code: string): Locator {
    return this.page.getByRole('checkbox', { name: `Chọn ${code}`, exact: true });
  }
  deleteButton(row: Locator): Locator {
    return row.getByRole('button', { name: 'Xoá', exact: true });
  }
  get exportButton(): Locator {
    return this.button('Xuất dữ liệu');
  }
  get selectedBar(): Locator {
    return this.page.getByText(/^Đã chọn \d+ bảng giá$/);
  }
  sortButton(header: 'NGÀY HIỆU LỰC' | 'NGÀY HẾT HIỆU LỰC'): Locator {
    return this.table.root.locator('thead th').filter({ hasText: new RegExp(`^${header}`) }).locator('button').first();
  }
  /** Cột (0-based) theo tiêu đề. */
  async columnIndex(header: string): Promise<number> {
    const heads = (await this.table.headers.allInnerTexts()).map((t) => t.trim());
    return heads.findIndex((h) => h === header || h.startsWith(header));
  }
  async columnTexts(header: string): Promise<string[]> {
    const col = await this.columnIndex(header);
    return this.table.root.locator(`tbody tr td:nth-child(${col + 1})`).allInnerTexts();
  }
  get pageSize(): Locator {
    return this.page.locator('main select').last();
  }

  // ---------- Thêm mới / nhân bản
  get addHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Thêm mới giá mua', exact: true });
  }
  formSelect(label: string): Locator {
    return selectByLabel(this.page.locator('main'), label);
  }
  formInput(label: string): Locator {
    return inputByLabel(this.page.locator('main'), label);
  }
  get nameInput(): Locator {
    return this.page.getByPlaceholder('Nhập tên bảng giá', { exact: true });
  }
  get contractNo(): Locator {
    return this.page.getByPlaceholder('Tự động điền theo nhà thầu', { exact: true });
  }
  /** Ô hiển thị Tên hợp đồng (chữ, không phải input). */
  get contractName(): Locator {
    return this.page.locator('main').locator('label').filter({ hasText: /^Tên hợp đồng$/ }).locator('xpath=ancestor::div[1]/following-sibling::*[1]');
  }
  get noteInput(): Locator {
    return this.page.getByPlaceholder('Nhập nội dung...', { exact: true });
  }
  /** Ô "Trạng thái áp dụng" (chữ cố định, không phải ô chọn). */
  get applyStatus(): Locator {
    return this.page.locator('main').locator('label').filter({ hasText: /^Trạng thái áp dụng/ }).locator('xpath=ancestor::div[1]/following-sibling::*[1]');
  }
  fieldError(text: string | RegExp): Locator {
    return this.page.locator('main').getByText(text);
  }
  /** Chọn ngày qua lịch: `monthsAhead` lần "Tháng sau" rồi bấm ngày `day` của tháng đang xem. */
  async pickDate(label: 'Ngày hiệu lực' | 'Ngày hết hiệu lực', monthsAhead: number, day?: number): Promise<void> {
    await this.formSelect(label).click();
    const cal = this.page.locator('body > div').filter({ has: this.page.getByRole('button', { name: 'Hôm nay' }) }).last();
    if (day === undefined && monthsAhead === 0) {
      await cal.getByRole('button', { name: 'Hôm nay' }).click();
      return;
    }
    for (let i = 0; i < monthsAhead; i++) await cal.getByRole('button', { name: 'Tháng sau' }).click();
    await cal.getByText(String(day ?? 15), { exact: true }).first().click();
  }
  serviceSection(): Locator {
    return this.page.getByRole('heading', { name: 'Chi tiết bảng giá theo từng dịch vụ' }).locator('xpath=ancestor::*[.//button[normalize-space()="Kho bãi"]][1]');
  }
  /** Khối 1 đầu mục (mã + tên + loại giá + nút thêm dòng) theo tên đầu mục. */
  itemBlock(name: string): Locator {
    return this.page.locator('main h4').filter({ hasText: new RegExp('^' + esc(name) + '$') }).first()
      .locator('xpath=ancestor::*[.//button[normalize-space()="Thêm 1 dòng"] or .//table][1]');
  }
  get submitButton(): Locator {
    return this.page.locator('main').getByRole('button', { name: 'Thêm', exact: true });
  }
  get cancelButton(): Locator {
    return this.page.locator('main').getByRole('button', { name: 'Hủy', exact: true });
  }
  get singleDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Thêm dòng giá' }).filter({ hasNotText: 'Thêm nhiều dòng giá' }).last();
  }
  get bulkDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Thêm nhiều dòng giá' }).last();
  }
  /** Ô chọn nhiều trong modal "Thêm nhiều dòng giá" theo nhãn (Điểm đi, Điểm đến, Loại xe, Đơn vị tính…). */
  bulkSelect(label: string): Locator {
    return selectByLabel(this.bulkDialog, label);
  }
  /** Danh sách lựa chọn đang mở của ô chọn nhiều (nút "Tất cả" + các giá trị). */
  get openOptions(): Locator {
    return this.page.getByRole('button', { name: 'Tất cả', exact: true }).last().locator('xpath=..');
  }
  option(name: string): Locator {
    return this.openOptions.getByRole('button', { name, exact: true });
  }
  /** Lựa chọn đang được chọn (có dấu tích). */
  get checkedOptions(): Locator {
    return this.openOptions.locator('button:has(svg)');
  }
  get bulkSummary(): Locator {
    return this.bulkDialog.getByText(/= *\d+ dòng|\d+ dòng$/).last();
  }

  // ---------- Chi tiết
  get detailTitle(): Locator {
    return this.page.locator('main h1').first();
  }
  get logButton(): Locator {
    return this.button('Nhật ký bảng giá');
  }
  get historyButton(): Locator {
    return this.button('Lịch sử thao tác');
  }
  get cloneButton(): Locator {
    return this.button('Nhân bản');
  }
  get stopButton(): Locator {
    return this.button('Ngừng hoạt động');
  }
  get activateButton(): Locator {
    return this.button('Kích hoạt');
  }
  get editSheetButton(): Locator {
    return this.button('Chỉnh sửa bảng giá');
  }
  get lineSearch(): Locator {
    return this.page.getByPlaceholder('Tìm kiếm theo mã dòng giá...', { exact: true });
  }
  get lineRows(): Locator {
    return this.page.locator('main tbody tr');
  }
  get lastDialog(): Locator {
    return this.page.getByRole('dialog').last();
  }
}
