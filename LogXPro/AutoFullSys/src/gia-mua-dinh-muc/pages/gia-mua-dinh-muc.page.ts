import { Locator, Page } from '@playwright/test';
import { DataTableComponent, selectByLabel } from '../../core/pages/components/data-table.component';
import { ModalComponent } from '../../core/pages/components/modal.component';
import { ToastComponent } from '../../core/pages/components/toast.component';
import { SidebarMenuComponent } from '../../core/pages/components/sidebar-menu.component';

/**
 * Page Object màn "Giá mua định mức" (/standard-prices và chi tiết /standard-prices/{id}).
 * Locator lấy từ giao diện thật trên web dev (11/2026): 5 tab dịch vụ là nút; mỗi đầu mục 1 bảng (h4 tên đầu mục) có phân trang riêng;
 * ô "Tìm kiếm theo ID" lọc trên mọi bảng của tab; hàng có link "Xem chi tiết" và nút "Cập nhật giá định mức"; icon cảnh báo
 * `svg.lucide-triangle-alert` cạnh ID; chế độ "Nhập hàng loạt" có ô aria "Giá mua định mức dòng {mã}", bộ đếm "{n} dòng đã thay đổi",
 * nút "Hủy"/"Lưu", hộp thoại "Hủy nhập hàng loạt" (nút "Huỷ" ở lại, "Hủy thay đổi" thoát). Chỉ thao tác, không assert.
 */
export class GiaMuaDinhMucPage {
  static readonly ROUTE = '/standard-prices';
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

  async goto(path: string = GiaMuaDinhMucPage.ROUTE): Promise<void> {
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
    return this.page.getByRole('heading', { name: 'Quản lý giá mua định mức', exact: true });
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
  /** Mọi bảng của tab đang xem (mỗi đầu mục 1 bảng). */
  get tables(): Locator {
    return this.page.locator('main table');
  }
  get rows(): Locator {
    return this.page.locator('main tbody tr');
  }
  row(code: string): Locator {
    return this.rows.filter({ hasText: code }).first();
  }
  /** Tìm theo mã rồi trả hàng của mã đó. */
  async find(code: string): Promise<Locator> {
    await this.search.fill(code);
    return this.row(code);
  }
  viewLink(row: Locator): Locator {
    return row.getByRole('link', { name: 'Xem chi tiết' });
  }
  updateButton(row: Locator): Locator {
    return row.getByRole('button', { name: 'Cập nhật giá định mức' });
  }
  warningIcon(row: Locator): Locator {
    return row.locator('svg.lucide-triangle-alert');
  }
  /** Nút sắp xếp ở tiêu đề "GIÁ MUA ĐỊNH MỨC" của bảng thứ `index`. */
  sortButton(index = 0): Locator {
    return this.tables.nth(index).locator('thead button[title^="Sắp xếp"]').first();
  }
  /** Ô giá (cột "GIÁ MUA ĐỊNH MỨC") của mọi hàng trong bảng thứ `index`. */
  async priceTexts(index = 0, header = 'GIÁ MUA ĐỊNH MỨC'): Promise<string[]> {
    const table = this.tables.nth(index);
    const heads = (await table.locator('thead th').allInnerTexts()).map((t) => t.trim());
    const col = heads.findIndex((h) => h.includes(header));
    return table.locator(`tbody tr td:nth-child(${col + 1})`).allInnerTexts();
  }

  // ---------- Bộ lọc nâng cao (drawer)
  get filterPanel(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Bộ lọc nâng cao' });
  }
  filterSelect(label: string): Locator {
    return selectByLabel(this.filterPanel, label);
  }
  get applyFilter(): Locator {
    return this.filterPanel.getByRole('button', { name: 'Áp dụng' });
  }
  get resetFilter(): Locator {
    return this.filterPanel.getByRole('button', { name: 'Đặt lại' });
  }

  // ---------- Modal cập nhật ở danh sách ("Cập nhật giá định mức") và ở chi tiết ("Cập nhật giá mua định mức")
  get updateDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: /Cập nhật giá (mua )?định mức/ }).last();
  }
  get priceInput(): Locator {
    return this.updateDialog.getByPlaceholder('Nhập giá định mức');
  }
  /** Nút lưu của modal: "Lưu" ở danh sách, "Lưu thông tin" ở chi tiết. */
  get dialogSave(): Locator {
    return this.updateDialog.getByRole('button', { name: /^Lưu( thông tin)?$/ });
  }
  get dialogCancel(): Locator {
    return this.updateDialog.getByRole('button', { name: 'Hủy', exact: true });
  }

  // ---------- Nhập hàng loạt
  get bulkMode(): Locator {
    return this.page.getByText('Chế độ nhập hàng loạt', { exact: true });
  }
  get bulkCounter(): Locator {
    return this.page.getByText(/^\d+ dòng đã thay đổi$/);
  }
  bulkInput(code: string): Locator {
    return this.page.getByRole('textbox', { name: `Giá mua định mức dòng ${code}`, exact: true });
  }
  get bulkInputs(): Locator {
    return this.page.getByRole('textbox', { name: /^Giá mua định mức dòng / });
  }
  get bulkSave(): Locator {
    return this.page.locator('main').getByRole('button', { name: 'Lưu', exact: true });
  }
  get bulkCancel(): Locator {
    return this.page.locator('main').getByRole('button', { name: 'Hủy', exact: true });
  }
  /** Hộp thoại "Hủy nhập hàng loạt": "Huỷ" (ở lại) và "Hủy thay đổi" (thoát). */
  get cancelDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Hủy nhập hàng loạt' });
  }
  /** Mã dòng từ aria-label của ô nhập hàng loạt. */
  async bulkCodes(count: number): Promise<string[]> {
    const labels: string[] = [];
    for (let i = 0; i < count; i++) labels.push(((await this.bulkInputs.nth(i).getAttribute('aria-label')) ?? '').replace('Giá mua định mức dòng ', ''));
    return labels;
  }

  // ---------- Chi tiết
  get detailHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Chi tiết dòng giá mua định mức', exact: true });
  }
  get historyButton(): Locator {
    return this.button('Lịch sử thao tác');
  }
  get editBenchmark(): Locator {
    return this.button('Chỉnh sửa giá mua định mức');
  }
  get historyDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: 'Lịch sử thao tác' }).last();
  }
  /** Khối "Bảng giá mua theo nhà thầu" (gồm chức năng quy đổi tiền tệ và bảng nhà thầu). */
  get contractorBlock(): Locator {
    return this.page.getByRole('heading', { name: 'Bảng giá mua theo nhà thầu' }).locator('xpath=ancestor::*[.//table][1]');
  }
  get rateSource(): Locator {
    return selectByLabel(this.page, 'Nguồn tỉ giá');
  }
  /** Ô tỷ giá nhập tay: 0 = USD → VNĐ, 1 = CNY → VNĐ. */
  rateInput(index: 0 | 1): Locator {
    return this.page.getByPlaceholder('Nhập tỷ giá').nth(index);
  }
  contractorRow(text: string | RegExp): Locator {
    return this.contractorBlock.locator('tbody tr').filter({ hasText: text }).first();
  }
  /** Giá trị đứng sau nhãn trong khối thông tin (vd "Giá mua định mức" → "9.500.000 VNĐ"). */
  valueAfter(label: string): Locator {
    return this.page.locator('main').getByText(label, { exact: true }).first().locator('xpath=following::*[normalize-space()][not(normalize-space()=":")][1]');
  }
}
