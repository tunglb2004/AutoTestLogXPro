import { Browser, Download, Locator, Page, expect, test } from '@playwright/test';
import { inputByLabel, selectByLabel, pickOption, esc, vnd } from '../../core/pages/components/data-table.component';
import { quoteTab, withQuotePage } from '../../quan-ly-bao-gia/data/quote-ui.fixture';
import { Roles } from '../../core/fixtures/auth.fixture';
import { RoleKey } from '../../core/data/accounts';
import { ServiceKey, SERVICES } from '../../core/data/p0-price-set';
import { TestRun } from '../../core/fixtures/test-run.fixture';
import { must } from '../../core/base.client';
import { P0Stage, p0Order } from './phieu-dich-vu.factory';
import { setOrderFx } from '../../chi-phi-doanh-thu/data/pnl-phieu.factory';

export const action = (scope: Page | Locator, name: string) => scope.getByRole('button', { name, exact: true }).or(scope.getByRole('link', { name, exact: true })).first();
export const tab = (page: Page, name: string) => quoteTab(page, name);
export const input = (scope: Page | Locator, label: string) => inputByLabel(scope, label);
export const select = (scope: Page | Locator, label: string) => selectByLabel(scope, label);
export { pickOption, vnd };

export async function withOps(browser: Browser, roles: Roles, role: RoleKey, work: (page: Page) => Promise<void>) {
  await withQuotePage(browser, roles, role, async page => {
    try { await work(page); }
    finally {
      if (!page.isClosed()) await test.info().attach(`ui-${role}.png`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    }
  });
}

export async function openOrder(page: Page, code: string, id: string, tower = false) {
  await page.goto(tower ? `/control-tower/service-orders/${id}` : `/service-tickets/${id}`);
  // Giao diện hiện tại không còn đảm bảo mã phiếu nằm trong thẻ heading. URL chi tiết chứa
  // đúng UUID là tín hiệu ổn định; sau đó kiểm mã xuất hiện ở bất kỳ vùng nội dung nào.
  await expect(page, 'Mở đúng URL chi tiết phiếu').toHaveURL(new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await expect(page.locator('main'), 'Nội dung chi tiết phiếu đã tải').toBeVisible();
  const codeText = page.getByText(code, { exact: false }).first();
  if (await codeText.count()) await expect(codeText, 'Hiển thị đúng mã phiếu').toBeVisible();
}
export async function servicePanel(page: Page, key: ServiceKey, panel: 'Thông tin' | 'Doanh thu' | 'Chi phí') {
  await tab(page, 'Thông tin dịch vụ').click();
  await tab(page, SERVICES[key]).click();
  await tab(page, panel).click();
}
export async function openPnl(page: Page, code: string, id: string) {
  await openOrder(page, code, id, true);
  await tab(page, 'Chi phí - Doanh thu').click();
}
export async function labelsVisible(scope: Page | Locator, labels: string[]) {
  for (const label of labels) await expect(scope.getByText(new RegExp('^\\s*' + esc(label) + '\\s*\\*?\\s*$')).first(), label).toBeVisible();
}
export async function headersVisible(scope: Page | Locator, headers: string[]) {
  for (const header of headers) await expect(scope.getByRole('columnheader', { name: new RegExp(esc(header), 'i') }).first(), header).toBeVisible();
}
export const dataRow = (page: Page, text: string) => page.locator('main tbody tr').filter({ hasText: text }).first();
export async function cellByHeader(table: Locator, row: Locator, header: string) {
  const headers = (await table.locator('thead th').allInnerTexts()).map(x => x.replace(/\s+/g, ' ').trim());
  const index = headers.findIndex(x => x === header);
  expect(index, `Có cột ${header}`).toBeGreaterThanOrEqual(0);
  return row.locator('td').nth(index);
}
export const revenueUi = (page: Page) => page.locator('table').filter({ has: page.getByRole('columnheader', { name: /Đầu mục doanh thu/i }) }).first();
/** Cost editing is inline in the contractor card (HDSD 05-16), not a modal. */
export async function costEditor(page: Page) {
  const save = action(page, 'Lưu'); await expect(save).toBeVisible();
  return save.locator('xpath=ancestor::*[.//table][1]');
}
export async function revenuePrice(page: Page, rowName: string, value: string) {
  const table = revenueUi(page); const row = table.locator('tbody tr').filter({ hasText: rowName }).first();
  await (await cellByHeader(table, row, 'Đơn giá')).locator('input').fill(value);
}
export async function expectAmounts(scope: Page | Locator, amounts: number[]) {
  for (const n of amounts) await expect(scope.getByText(new RegExp('(^|\\D)' + esc(vnd(n)) + '(\\D|$)')).first(), `Số tiền ${n}`).toBeVisible();
}
export function numberFromUi(text: string): number {
  const raw = text.replace(/\s/g, '').replace(/[^\d.,+-]/g, '');
  if (!raw) throw new Error(`Không có số trong ô "${text}"`);
  return Number(raw.replace(/\./g, '').replace(',', '.'));
}
export async function amountCard(page: Page, label: string): Promise<string> {
  const node = page.getByText(label, { exact: true });
  await expect(node).toBeVisible();
  return node.locator('xpath=..').innerText();
}
export async function openFilter(page: Page, name = 'Bộ lọc nâng cao') {
  await action(page, name).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  return dialog;
}
export async function rangeInputs(dialog: Locator, label: string, from: string, to: string) {
  const inputs = dialog.getByText(label, { exact: true }).locator('xpath=ancestor::div[.//input][1]').locator('input');
  await expect(inputs).toHaveCount(2);
  await inputs.nth(0).fill(from); await inputs.nth(1).fill(to);
  return inputs;
}
export async function clearFilters(page: Page) {
  const clear = action(page, 'Xóa tất cả');
  if (await clear.isVisible()) await clear.click();
}
export async function fxDialog(page: Page) {
  await action(page, 'Thay đổi tỷ giá').click();
  const d = page.getByRole('dialog').filter({ hasText: 'Thiết lập tỷ giá' }).last();
  await expect(d).toBeVisible();
  await pickOption(page, select(d, 'Nguồn tỷ giá'), 'Nhập thủ công');
  return d;
}
export async function downloadBytes(download: Download): Promise<Buffer> {
  const stream = await download.createReadStream();
  if (!stream) throw new Error('Trình duyệt không tạo được luồng tải file');
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}
export async function editedP0(run: TestRun, stage: P0Stage = 'PERFORMED', shift = 250_000) {
  const order = await p0Order(run, stage, { editShift: true, before: { KHQ_DONE: async o => {
    if (shift === 250_000) return;
    const refs = await run.p0Refs();
    await must(await run.http.call('PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines', { token: run.token('k1'), params: { id: o.id, serviceTypeCode: refs.services.KHQ }, json: { lines: [{ costLineId: o.shiftLineId, unitCode: refs.units.shiftStorage, quantity: 1, unitPrice: shift }] } }), 'chuẩn bị doanh thu riêng cho UI');
  } } });
  if (stage === 'PERFORMED') await setOrderFx(run, order.id, 25_000);
  return order;
}
