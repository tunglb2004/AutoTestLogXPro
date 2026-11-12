import { Locator, Page } from '@playwright/test';
import { DataTableComponent, selectByLabel } from '../../core/pages/components/data-table.component';
import { ModalComponent } from '../../core/pages/components/modal.component';
import { ToastComponent } from '../../core/pages/components/toast.component';
import { SidebarMenuComponent } from '../../core/pages/components/sidebar-menu.component';

/**
 * Page Object màn "Giá bán định mức" (/standard-selling-prices và chi tiết /standard-selling-prices/{id}).
 * Locator lấy từ giao diện thật trên web dev (11/2026): cùng bố cục với Giá mua định mức; cột GIÁ MUA ĐỊNH MỨC, LỢI NHUẬN, GIÁ BÁN ĐỊNH MỨC;
 * nút hàng "Xem chi tiết", "Cập nhật giá bán định mức"; modal "Cập nhật giá bán định mức" (ô "Nhập giá bán định mức", "Lợi nhuận dự kiến",
 * nút "Lưu thông tin" khóa khi ô trống); bộ lọc có "Trạng thái giá bán" (Tất cả / Đã thiết lập / Chưa thiết lập). Chỉ thao tác, không assert.
 */
export class GiaBanDinhMucPage {
  static readonly ROUTE = '/standard-selling-prices';
  static readonly SERVICES = ['Khai báo hải quan', 'Hải quan giám sát', 'Vận tải', 'Sang tải', 'Kho bãi'] as const;
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

  async goto(path: string = GiaBanDinhMucPage.ROUTE): Promise<void> {
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
    return this.page.getByRole('heading', { name: 'Quản lý giá bán định mức', exact: true });
  }
  get search(): Locator {
    return this.page.getByPlaceholder('Tìm kiếm theo ID', { exact: true });
  }
  get filterButton(): Locator {
    return this.button('Bộ lọc');
  }
  get bulkButton(): Locator {
    return this.button('Nhập hàng loạt');
  }
  get tables(): Locator {
    return this.page.locator('main table');
  }
  get rows(): Locator {
    return this.page.locator('main tbody tr');
  }
  row(code: string): Locator {
    return this.rows.filter({ hasText: code }).first();
  }
  async find(code: string): Promise<Locator> {
    await this.search.fill(code);
    return this.row(code);
  }
  viewLink(row: Locator): Locator {
    return row.getByRole('link', { name: 'Xem chi tiết' });
  }
  updateButton(row: Locator): Locator {
    return row.getByRole('button', { name: 'Cập nhật giá bán định mức' });
  }
  warningIcon(row: Locator): Locator {
    return row.locator('svg.lucide-triangle-alert');
  }
  /** Nút sắp xếp của cột (`GIÁ MUA ĐỊNH MỨC` hoặc `GIÁ BÁN ĐỊNH MỨC`) ở bảng thứ `index`. */
  sortButton(header: 'GIÁ MUA ĐỊNH MỨC' | 'GIÁ BÁN ĐỊNH MỨC', index = 0): Locator {
    return this.tables.nth(index).locator('thead button[title^="Sắp xếp"]').filter({ hasText: header }).first();
  }
  async columnTexts(header: string, index = 0): Promise<string[]> {
    const table = this.tables.nth(index);
    const heads = (await table.locator('thead th').allInnerTexts()).map((t) => t.trim());
    const col = heads.findIndex((h) => h.includes(header));
    return table.locator(`tbody tr td:nth-child(${col + 1})`).allInnerTexts();
  }
  /** Ô của hàng theo tiêu đề cột. */
  async cell(row: Locator, header: string): Promise<Locator> {
    const table = row.locator('xpath=ancestor::table[1]');
    const heads = (await table.locator('thead th').allInnerTexts()).map((t) => t.trim());
    return row.locator('td').nth(heads.findIndex((h) => h.includes(header)));
  }

  // ---------- Bộ lọc nâng cao
  get filterPanel(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Bộ lọc nâng cao' });
  }
  filterSelect(label: string): Locator {
    return selectByLabel(this.filterPanel, label);
  }
  get applyFilter(): Locator {
    return this.filterPanel.getByRole('button', { name: 'Áp dụng' });
  }

  // ---------- Modal cập nhật giá bán
  get updateDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Cập nhật giá bán định mức' }).last();
  }
  get priceInput(): Locator {
    return this.updateDialog.getByPlaceholder('Nhập giá bán định mức');
  }
  get dialogSave(): Locator {
    return this.updateDialog.getByRole('button', { name: 'Lưu thông tin', exact: true });
  }
  get dialogCancel(): Locator {
    return this.updateDialog.getByRole('button', { name: 'Hủy', exact: true });
  }
  /** "Lợi nhuận dự kiến" tính ngay trong modal khi nhập giá. */
  get expectedProfit(): Locator {
    return this.updateDialog.getByText('Lợi nhuận dự kiến', { exact: true }).locator('xpath=following::*[normalize-space()][1]');
  }

  // ---------- Nhập hàng loạt
  get bulkMode(): Locator {
    return this.page.getByText('Chế độ nhập hàng loạt', { exact: true });
  }
  get bulkCounter(): Locator {
    return this.page.getByText(/^\d+ dòng đã thay đổi$/);
  }
  bulkInput(code: string): Locator {
    return this.page.getByRole('textbox', { name: new RegExp(`dòng ${code}$`) });
  }
  get bulkSave(): Locator {
    return this.page.locator('main').getByRole('button', { name: 'Lưu', exact: true });
  }

  // ---------- Chi tiết
  get detailHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Chi tiết dòng giá bán định mức', exact: true });
  }
  get historyButton(): Locator {
    return this.button('Lịch sử thao tác');
  }
  get editSelling(): Locator {
    return this.button('Chỉnh sửa giá bán định mức');
  }
  get historyDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Lịch sử thao tác' }).last();
  }
  valueAfter(label: string): Locator {
    return this.page.locator('main').getByText(label, { exact: true }).first().locator('xpath=following::*[normalize-space()][not(normalize-space()=":")][1]');
  }
}
