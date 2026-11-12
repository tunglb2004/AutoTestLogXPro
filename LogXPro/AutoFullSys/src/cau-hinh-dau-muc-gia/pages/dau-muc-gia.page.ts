import { Locator, Page } from '@playwright/test';
import { DataTableComponent, cardNumber } from '../../core/pages/components/data-table.component';
import { ModalComponent } from '../../core/pages/components/modal.component';
import { ToastComponent } from '../../core/pages/components/toast.component';
import { SidebarMenuComponent } from '../../core/pages/components/sidebar-menu.component';

/**
 * Page Object màn "Cấu hình đầu mục giá" (/price-configs và chi tiết /price-configs/{id}).
 * Locator lấy từ giao diện thật trên web dev (11/2026): danh sách 5 phân hệ có nút mắt ở cột Thao tác; chi tiết có nút "Nhật ký",
 * "Chỉnh sửa"; chế độ sửa đặt tên ô theo `items.{id đầu mục}.name` (dòng mới `items.NEW-…`), loại giá là `select`, công tắc trạng thái là
 * nút tròn cạnh chữ "Kích hoạt"/"Dừng hoạt động", Kho bãi có ô chọn nhiều "Chọn loại kho". Chỉ thao tác, không assert.
 */
export class DauMucGiaPage {
  static readonly ROUTE = '/price-configs';
  static readonly SERVICES = ['Khai báo hải quan', 'Hải quan giám sát', 'Vận tải', 'Sang tải', 'Kho bãi'] as const;
  static readonly CARDS = ['Tổng cấu hình giá phân hệ', 'Tổng cấu hình giá thiết lập', 'Dòng giá đang hoạt động'] as const;
  static readonly LOCKED_TITLE = 'Đầu mục đã có giá gắn vào nên không đổi được tên, loại giá hoặc xóa — hãy tắt kích hoạt nếu muốn ngừng dùng';
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

  async goto(path: string = DauMucGiaPage.ROUTE): Promise<void> {
    await this.page.goto(path);
  }
  button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name, exact: typeof name === 'string' });
  }
  tab(name: string | RegExp): Locator {
    return this.page.getByRole('tab', { name }).or(this.page.getByText(name, { exact: typeof name === 'string' })).first();
  }
  field(label: string | RegExp): Locator {
    return this.page.getByLabel(label);
  }
  text(value: string | RegExp): Locator {
    return this.page.getByText(value).first();
  }

  // ---------- Danh sách
  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Cấu hình đầu mục giá', exact: true });
  }
  card(label: string): Promise<number> {
    return cardNumber(this.page, label);
  }
  serviceRow(service: string): Locator {
    return this.table.rows.filter({ has: this.page.getByText(service, { exact: true }) }).first();
  }
  /** Nút "Xem chi tiết" (icon mắt) ở cột Thao tác. */
  viewButton(service: string): Locator {
    return this.serviceRow(service).locator('button:has(svg.lucide-eye)');
  }
  /** Số ở cột SỐ LƯỢNG ĐẦU MỤC của phân hệ. */
  async itemCount(service: string): Promise<number> {
    return Number((await this.serviceRow(service).locator('td').nth(2).innerText()).trim());
  }
  async openService(service: string): Promise<void> {
    await this.goto();
    await this.viewButton(service).click();
    await this.detailHeading.waitFor();
  }

  // ---------- Chi tiết
  get detailHeading(): Locator {
    return this.page.getByRole('heading', { name: /^Chi tiết cấu hình đầu mục giá:/ });
  }
  get backLink(): Locator {
    return this.page.getByText('Quay lại danh sách', { exact: true });
  }
  get listTitle(): Locator {
    return this.page.getByRole('heading', { name: /DANH SÁCH MỤC CẤU HÌNH GIÁ/i });
  }
  get logButton(): Locator {
    return this.button('Nhật ký');
  }
  get editButton(): Locator {
    return this.button('Chỉnh sửa');
  }
  get saveButton(): Locator {
    return this.button('Lưu');
  }
  get cancelButton(): Locator {
    return this.button('Hủy');
  }
  get addRowButton(): Locator {
    return this.button('Thêm dòng');
  }
  /** Dòng đầu mục ở chế độ xem theo mã hoặc tên. */
  itemRow(text: string | RegExp): Locator {
    return this.table.rows.filter({ hasText: text }).first();
  }

  // ---------- Chế độ chỉnh sửa
  nameInput(itemId: string): Locator {
    return this.page.locator(`input[name="items.${itemId}.name"]`);
  }
  /** Ô tên của các dòng vừa bấm "Thêm dòng" (chưa lưu). */
  get newNameInputs(): Locator {
    return this.page.locator('input[name^="items.NEW-"]');
  }
  rowOf(input: Locator): Locator {
    return input.locator('xpath=ancestor::tr[1]');
  }
  editRow(itemId: string): Locator {
    return this.rowOf(this.nameInput(itemId));
  }
  priceType(row: Locator): Locator {
    return row.locator('select');
  }
  statusSwitch(row: Locator): Locator {
    return row.locator('td').filter({ hasText: /Kích hoạt|Dừng hoạt động/ }).locator('button').first();
  }
  statusLabel(row: Locator): Locator {
    return row.getByText(/^(Kích hoạt|Dừng hoạt động)$/);
  }
  deleteButton(row: Locator): Locator {
    return row.locator('button:has(svg.lucide-trash-2)');
  }
  /** Ô chọn nhiều Loại kho (chỉ phân hệ Kho bãi). */
  warehouseSelect(row: Locator): Locator {
    return row.locator('div[tabindex="0"]').first();
  }
  /** Bấm "Thêm dòng", nhập tên và chọn loại giá; trả dòng mới. */
  async addRow(name: string, priceType: 'Cố định' | 'Phụ phí' | 'Phát sinh'): Promise<Locator> {
    await this.addRowButton.click();
    const input = this.newNameInputs.last();
    await input.fill(name);
    const row = this.rowOf(input);
    await this.priceType(row).selectOption({ label: priceType });
    return row;
  }

  // ---------- Nhật ký
  /** Popup "Nhật ký cấu hình đầu mục giá" (không có role dialog, gắn ở cuối body). */
  get logPopup(): Locator {
    return this.page.locator('body > div').filter({ hasText: 'Nhật ký cấu hình đầu mục giá' }).last();
  }
  /** Nút phiên bản trong Nhật ký ("hh:mm:ss, dd/mm/yyyy Hiện tại|Phiên bản cũ Người thao tác: …"). */
  get logVersions(): Locator {
    return this.logPopup.getByRole('button').filter({ hasText: 'Người thao tác:' });
  }
}
