import { expect, Locator, Page, Response, Browser, test } from '@playwright/test';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import ExcelJS from 'exceljs';
import { TestRun } from '../../core/fixtures/test-run.fixture';
import { data, items, must } from '../../core/base.client';
import { exactLabel, esc, inputByLabel, vnd } from '../../core/pages/components/data-table.component';
import { QuoteScenario } from './quote-scenario.factory';
import { env } from '../../core/env';
import { ServiceKey, SERVICES } from '../../core/data/p0-price-set';
import { Roles } from '../../core/fixtures/auth.fixture';
import { RoleKey } from '../../core/data/accounts';
import { withQuotePage } from './quote-ui.fixture';

export async function quoteUiCase(browser: Browser, roles: Roles, role: RoleKey, work: (page: Page) => Promise<void>) {
  await withQuotePage(browser, roles, role, async page => {
    try { await work(page); }
    finally { if (!page.isClosed()) await test.info().attach('quote-ui.png', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' }); }
  });
}

export function fieldRoot(scope: Page | Locator, name: string, index = 0): Locator {
  return scope.locator('label').filter({ hasText: exactLabel(name) }).nth(index).locator('..');
}
export function quoteControl(scope: Page | Locator, name: string, index = 0): Locator {
  return fieldRoot(scope, name, index).locator('button, div[tabindex="0"], select').first();
}
export async function choose(page: Page, name: string, value: string | RegExp, scope: Page | Locator = page, index = 0) {
  const control = quoteControl(scope, name, index);
  await control.click();
  const option = typeof value === 'string' ? page.getByText(value, { exact: true }).last() : page.getByText(value).last();
  await option.click();
  await page.keyboard.press('Escape');
}
export function expectUiStatus(response: Response, allowed: number[]) { expect(allowed, response.url()).toContain(response.status()); }
export const apiFromUi = (page: Page, method: string, suffix: RegExp) => page.waitForResponse(r => r.request().method() === method && suffix.test(new URL(r.url()).pathname));
export const quoteRow = (page: Page, name: string) => page.locator('main tbody tr').filter({ hasText: name }).first();
export const dialog = (page: Page) => page.getByRole('dialog').last();
export const qButton = (page: Page, name: string | RegExp) => page.getByRole('button', { name, exact: typeof name === 'string' });
export async function rcQuoteTab(page: Page, id: string) {
  await page.goto(`/quotations/rate-cards/${id}`);
  await qButton(page, 'Báo giá').click();
  await expect(qButton(page, 'Thiết lập tỷ giá & VAT')).toBeVisible();
}
export async function beginMerge(page: Page, first: string, second?: string) {
  await qButton(page, 'Gộp đầu mục').click();
  await quoteRow(page, first).getByRole('checkbox').check();
  if (second) await quoteRow(page, second).getByRole('checkbox').check();
}
export async function mergePopup(page: Page, first: string, second: string) {
  await beginMerge(page, first, second);
  await qButton(page, 'Gộp 2 đầu mục').click();
  await expect(dialog(page)).toBeVisible();
  return dialog(page);
}
export async function finishMerge(page: Page, name: string, unit: string) {
  const d = dialog(page);
  await inputByLabel(d, 'Tên đầu mục sau khi gộp').fill(name);
  await choose(page, 'Đơn vị tính sau khi gộp', unit, d);
  const response = apiFromUi(page, 'POST', /\/customer-quotations\/[^/]+\/merges$/);
  await d.getByRole('button', { name: 'Xác nhận gộp', exact: true }).click();
  expectUiStatus(await response, [200, 201]);
  await expect(d).toBeHidden();
}
export async function enterPrice(page: Page, head: string, amount: string) {
  await qButton(page, 'Điều chỉnh giá chốt').click();
  const input = quoteRow(page, head).locator('input:not([type="checkbox"])').first();
  await input.fill(amount); await input.blur();
  return input;
}
export async function savePrices(page: Page) {
  const response = apiFromUi(page, 'PUT', /\/customer-quotations\/[^/]+\/prices$/);
  await qButton(page, 'Lưu').click();
  expectUiStatus(await response, [200, 204]);
}
export async function catalogueName(run: TestRun, api: string, code: string, query: Record<string, unknown> = {}) {
  const ref = (await run.catalog(api, query)).find((r: any) => r.code === code || r.id === code);
  expect(ref, `Danh mục ${api} có ${code}`).toBeTruthy();
  return String(ref.name);
}
export async function enableRfqService(page: Page, name: string) {
  const matches = qButton(page, name);
  if (await matches.count() === 1) await matches.first().click();
  await matches.last().click();
}
export const routePair = (page: Page, n = 1) => page.getByText(`Cặp điểm vận tải #${n}`, { exact: true }).locator('../..');
export const routeEnd = (page: Page, side: 'Điểm đi' | 'Điểm đến', n = 1) => page.getByText(`${side} #${n}`, { exact: true }).locator('xpath=ancestor::div[contains(@class,"flex-1")][1]');
export async function fillRfqBasics(page: Page, run: TestRun) {
  const q = new QuoteScenario(run); const seed = await q.newRfq(); const r = await q.rfq(seed.id); const p = await run.p0Refs();
  await page.goto('/quotations/requests/new');
  await choose(page, 'Khách hàng', r.customerName);
  const contracts = items(await must(await run.http.call('GET /api/contracts', { token: run.token('k1'), query: { customerId: env.ref('CUSTOMER_A_ID'), status: 'ACTIVE', pagination: false, perPage: 100 } }), 'Hợp đồng khách hàng đang hiệu lực'));
  expect(contracts.length, 'KH_A có hợp đồng đang hiệu lực').toBeGreaterThan(0);
  await choose(page, 'Hợp đồng áp dụng', new RegExp(esc(contracts[0].code)));
  const refs: [string, string, string][] = [
    ['Cửa khẩu','border-gates',p.borderGate], ['Loại hình XNK','trade-types',p.tradeType], ['Nhóm hàng','cargo-groups',p.cargoGroup],
    ['Phương thức vận tải','transport-modes',p.transportMode], ['Đặc tính hàng hóa','cargo-natures',p.cargoNature],
    ['Quy cách đóng gói sơ bộ','packaging-types',p.packaging], ['Loại xe yêu cầu','vehicle-types',p.vehicleType],
  ];
  for (const [label, cat, code] of refs) await choose(page, label, await catalogueName(run, `GET /api/catalogues/${cat}`, code));
  await inputByLabel(page, 'Số lượng dự kiến/tháng').fill('10');
  return { p, r };
}
export async function fillRoute(page: Page, run: TestRun) {
  const p = await run.p0Refs();
  for (const [label, side] of [['Điểm đi', 'origin'], ['Điểm đến', 'destination']] as const) {
    const scope = routeEnd(page, label);
    const point = p[side];
    const countryCode = String(point.countryCode ?? 'VN');
    const provinceCode = String(point.provinceCode);
    await scope.getByRole('radio', { name: 'Địa chỉ', exact: true }).check();
    await choose(page, 'Tỉnh thành', await catalogueName(run, 'GET /api/catalogues/provinces', provinceCode, { countryCode }), scope);
    await choose(page, 'Phường/Xã', await catalogueName(run, 'GET /api/catalogues/wards', String(point.wardCode), { countryCode, provinceCode }), scope);
    await inputByLabel(scope, 'Địa chỉ cụ thể').fill(String(point.placeName));
  }
}
export async function fillRfqServices(page: Page, run: TestRun, services: ServiceKey[]) {
  const p = await run.p0Refs();
  for (const key of services) {
    await enableRfqService(page, SERVICES[key]);
    if (key === 'KHQ' || key === 'HQGS') await choose(page, key === 'KHQ' ? 'Địa điểm làm TTHQ' : 'Chi cục hải quan', await catalogueName(run, 'GET /api/catalogues/customs-offices', p.customsOffice));
    if (key === 'VT') await fillRoute(page, run);
    if (key === 'ST') {
      await choose(page, 'Địa điểm sang tải', await catalogueName(run, 'GET /api/catalogues/transload-points', p.transloadPoint));
      await choose(page, 'Loại hình sang tải', await catalogueName(run, 'GET /api/catalogues/transload-methods', p.transloadMethod));
    }
    if (key === 'KB') {
      await choose(page, 'Địa điểm kho', await catalogueName(run, 'GET /api/catalogues/warehouses', p.warehouse));
      await choose(page, 'Loại hình kho', await catalogueName(run, 'GET /api/catalogues/warehouse-types', p.warehouseTypeId));
      await inputByLabel(page, 'Số lượng lưu kho').fill('1'); await inputByLabel(page, 'Ngày lưu kho').fill('1');
    }
  }
}
export async function downloadedText(path: string, kind: 'xlsx' | 'pdf') {
  const bytes = fs.readFileSync(path);
  if (kind === 'xlsx') {
    expect(bytes.subarray(0,2).toString()).toBe('PK'); const book = new ExcelJS.Workbook(); await book.xlsx.load(bytes as any);
    const lines: string[] = []; book.eachSheet(sheet => sheet.eachRow(row => lines.push(JSON.stringify(row.values)))); return lines.join('\n');
  }
  expect(bytes.subarray(0,5).toString()).toBe('%PDF-');
  // Use the available PDF reader to verify content, rather than only checking the file header.
  return execFileSync('python', ['-c', 'import sys,pdfplumber; sys.stdout.reconfigure(encoding="utf-8"); pdf=pdfplumber.open(sys.argv[1]); print("\\n".join(p.extract_text() or "" for p in pdf.pages)); pdf.close()', path], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
}
export { inputByLabel, vnd, esc as escape };
