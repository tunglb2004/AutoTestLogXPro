import { Locator, Page } from '@playwright/test';
import { DataTableComponent } from '../../core/pages/components/data-table.component';
import { ModalComponent } from '../../core/pages/components/modal.component';
import { ToastComponent } from '../../core/pages/components/toast.component';
import { SidebarMenuComponent } from '../../core/pages/components/sidebar-menu.component';

/** Page Object màn "Chi phí – Doanh thu và tab Chi phí - Doanh thu của phiếu" (Menu "Chi phí - Doanh thu" (/cost-revenue) và tab "Chi phí - Doanh thu" ở chi tiết phiếu). Locator theo nhãn đang có trên web dev; chỉ thao tác, không assert. */
export class ChiPhiDoanhThuPage {
  static readonly ROUTE = "/cost-revenue";
  readonly table: DataTableComponent;
  readonly modal: ModalComponent;
  readonly toast: ToastComponent;
  readonly menu: SidebarMenuComponent;

  constructor(readonly page: Page) {
    this.table = new DataTableComponent(page);
    this.modal = new ModalComponent(page);
    this.toast = new ToastComponent(page);
    this.menu = new SidebarMenuComponent(page);
  }

  async goto(path: string = ChiPhiDoanhThuPage.ROUTE): Promise<void> {
    await this.page.goto(path);
  }
  button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name });
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
}
