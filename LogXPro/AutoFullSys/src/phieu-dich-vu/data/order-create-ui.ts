import { Page, Locator, expect } from '@playwright/test';
import { TestRun, today, tagged } from '../../core/fixtures/test-run.fixture';
import { items, must } from '../../core/base.client';
import { P0Base } from './phieu-dich-vu.factory';
import { SERVICE_KEYS, SERVICES, ServiceKey } from '../../core/data/p0-price-set';
import { input, select, pickOption } from './operations-ui';

export async function serviceForm(page: Page, service: ServiceKey) {
  await page.getByRole('checkbox', { name: SERVICES[service], exact: true }).check();
  // The checkbox and the service tab have the same caption; the tab follows the checkbox list (HDSD 02-47).
  await page.getByText(SERVICES[service], { exact: true }).last().click();
}
export async function selectCustomer(page: Page, run: TestRun, base: P0Base) {
  const list = items(await must(await run.http.call('GET /api/service-orders/selectable-customers', { token: run.token('k1'), query: { pagination: false, perPage: 100 } }), 'khách hàng có thể tạo phiếu'));
  const customer = list.find(x => x.id === base.customerId);
  expect(customer, 'KH_A có hợp đồng và báo giá đang hiệu lực').toBeTruthy();
  await pickOption(page, select(page, 'Khách hàng'), customer.companyName, customer.companyName);
  expect(customer.contracts.length).toBeGreaterThan(0);
  const quote = customer.quotations.find((q: any) => q.id === base.rcId);
  expect(quote, 'Báo giá P0 có trong lựa chọn của khách hàng').toBeTruthy();
  await expect(select(page, 'Hợp đồng áp dụng')).not.toContainText(/chọn hợp đồng/i);
  await expect(select(page, 'Báo giá áp dụng')).toContainText(quote.code);
  return customer;
}

async function chooseCode(page: Page, run: TestRun, scope: Page | Locator, label: string, api: string, code: string, query: Record<string, unknown> = {}) {
  const ref = (await run.catalog(api, query)).find(r => r.code === code || r.id === code);
  expect(ref, `Danh mục thật cho ${label}/${code}`).toBeTruthy();
  await pickOption(page, select(scope, label), ref.name);
}
function pointSection(page: Page, heading: string | RegExp) {
  return page.getByText(heading, { exact: typeof heading === 'string' }).first().locator('xpath=ancestor::div[.//input[@type="radio"] or .//*[@role="radio"]][1]/..');
}
async function vnTransportPointAddress(page: Page, run: TestRun, scope: Locator, side: 'origin' | 'destination') {
  const refs = await run.p0Refs();
  const point = refs[side];
  const countryCode = String(point.countryCode ?? 'VN');
  const provinceCode = String(point.provinceCode);
  const wardCode = String(point.wardCode);
  await scope.getByRole('radio', { name: 'Địa chỉ chi tiết', exact: true }).check();
  await chooseCode(page, run, scope, 'Quốc gia', 'GET /api/catalogues/countries', countryCode);
  await chooseCode(page, run, scope, 'Tỉnh/thành', 'GET /api/catalogues/provinces', provinceCode, { countryCode });
  await chooseCode(page, run, scope, 'Phường/xã', 'GET /api/catalogues/wards', wardCode, { countryCode, provinceCode });
  await input(scope, 'Địa chỉ chi tiết').fill(String(point.placeName));
}

/** Fill the visible create form through UI controls. No API request substitutes for UI submission. */
export async function fillNewOrder(page: Page, run: TestRun, base: P0Base, omitArrival = false) {
  const refs = await run.p0Refs();
  await selectCustomer(page, run, base);
  for (const [label, api, code] of [
    ['Loại hình XNK', 'GET /api/catalogues/trade-types', refs.tradeType],
    ['Cửa khẩu', 'GET /api/catalogues/border-gates', refs.borderGate],
    ['Phương thức vận tải', 'GET /api/catalogues/transport-modes', refs.transportMode],
    ['Loại hình vận tải', 'GET /api/catalogues/cargo-load-types', refs.cargoLoadType],
  ]) await chooseCode(page, run, page, label, api, code);
  await input(page, 'Mã tham chiếu').fill(tagged('AT UI').slice(0, 50));
  await input(page, 'Ngày yêu cầu SDDV').fill(today());
  await input(page, 'Ghi chú chung').fill(tagged('Tạo đủ 5 dịch vụ qua UI'));
  // Scope each repeated location label to its own card (HDSD 02-44).
  const origin = pointSection(page, 'Điểm đi'); const destination = pointSection(page, 'Điểm đến');
  await vnTransportPointAddress(page, run, origin, 'origin');
  await vnTransportPointAddress(page, run, destination, 'destination');
  await input(page, 'Tên hàng hóa').fill('Linh kiện điện tử');
  for (const [label, api, code] of [
    ['Nhóm hàng', 'GET /api/catalogues/cargo-groups', refs.cargoGroup],
    ['Đặc tính hàng hóa', 'GET /api/catalogues/cargo-natures', refs.cargoNature],
    ['Quy cách đóng gói', 'GET /api/catalogues/packaging-types', refs.packaging],
  ]) await chooseCode(page, run, page, label, api, code);
  await input(page, 'Thể tích').fill('20'); await input(page, 'Tổng trọng lượng').fill('12');
  for (const key of SERVICE_KEYS) await page.getByRole('checkbox', { name: SERVICES[key], exact: true }).check();
  await serviceForm(page, 'KHQ');
  await chooseCode(page, run, page, 'Địa điểm làm thủ tục HQ', 'GET /api/catalogues/customs-offices', refs.customsOffice);
  await input(page, 'Số lượng tờ khai').fill('1');
  await serviceForm(page, 'HQGS');
  await chooseCode(page, run, page, 'Đơn vị giám sát hải quan', 'GET /api/catalogues/customs-offices', refs.customsOffice);
  await serviceForm(page, 'VT');
  await vnTransportPointAddress(page, run, pointSection(page, /^(Nơi|Điểm) lấy hàng$/), 'origin');
  await vnTransportPointAddress(page, run, pointSection(page, /^(Nơi|Điểm) giao hàng$/), 'destination');
  await input(page, 'Liên hệ lấy hàng').fill('Nguyễn Văn Hùng 0912345678');
  await input(page, 'Liên hệ giao hàng').fill('Nguyễn Văn Nam 0987654321');
  const plannedLabels = page.locator('label').filter({ hasText: /Thời gian.*dự kiến|Thời gian.*dự kiến đến/ });
  const count = await plannedLabels.count(); expect(count, 'Có ô thời gian dự kiến của Vận tải').toBeGreaterThan(0);
  let arrival: Locator | undefined;
  for (let i = 0; i < count; i++) {
    const field = plannedLabels.nth(i).locator('xpath=ancestor::div[.//input][1]').locator('input').first();
    if (i === count - 1) arrival = field;
    if (omitArrival && i === count - 1) { await field.fill(''); continue; }
    const type = await field.getAttribute('type');
    await field.fill(type === 'date' ? today() : `${today()}T${i === 0 ? '10:00' : '14:00'}`);
  }
  await serviceForm(page, 'ST');
  await chooseCode(page, run, page, 'Địa điểm sang tải', 'GET /api/catalogues/transload-points', refs.transloadPoint);
  await chooseCode(page, run, page, 'Loại hình sang tải', 'GET /api/catalogues/transload-types', refs.transloadType);
  await chooseCode(page, run, page, 'Phương thức sang tải', 'GET /api/catalogues/transload-methods', refs.transloadMethod);
  await serviceForm(page, 'KB');
  await chooseCode(page, run, page, 'Tên kho', 'GET /api/catalogues/warehouses', refs.warehouse);
  await chooseCode(page, run, page, 'Loại hình lưu kho', 'GET /api/catalogues/warehouse-types', refs.warehouseTypeId);
  await chooseCode(page, run, page, 'Đơn vị tính sản lượng', 'GET /api/catalogues/units', refs.units.storage, { serviceTypeCode: refs.services.KB });
  await input(page, 'Số lượng lưu kho dự kiến').fill('1'); await input(page, 'Số ngày lưu kho dự kiến').fill('1');
  return arrival!;
}
