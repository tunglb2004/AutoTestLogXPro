/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import { withQuotePage, quoteTab } from '../../../src/quan-ly-bao-gia/data/quote-ui.fixture';
import { DataTableComponent } from '../../../src/core/pages/components/data-table.component';
import { QuoteScenario } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';

import { uiApi } from '../../../src/core/assertions';
import { pickOption, selectByLabel } from '../../../src/core/pages/components/data-table.component';
import { Page } from '@playwright/test';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
test.describe("Báo giá nội bộ", () => {
  test("UI-IPS-001 Danh sách BGNB", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, testRun }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.draft();
    await withQuotePage(browser, roles, 'cc', async page => {
      await page.goto('/quotations'); await quoteTab(page, 'Báo giá nội bộ').click();
      await expect(page.getByRole('button', { name: 'Tất cả trạng thái', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Tất cả khách hàng', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Thêm mới', exact: true })).toBeVisible();
      await page.getByPlaceholder('Tìm kiếm...', { exact: true }).fill(x.iq.code);
      const table = new DataTableComponent(page); await expect(table.row(x.iq.code)).toBeVisible();
      expect(await table.headerTexts()).toEqual(expect.arrayContaining([/^STT$/i, /^Mã báo giá$/i, /^Tên báo giá$/i, /^Mã yêu cầu báo giá$/i, /^Khách hàng$/i, /^Tổng đơn giá$/i, /Lợi nhuận (DK|dự kiến)/i, /^Trạng thái$/i, /^Kết quả$/i, /Thời hạn hiệu lực/i, /^Thao tác$/i]));
      await expect(table.row(x.iq.code)).toContainText(x.rfq.code); await expect(table.row(x.iq.code)).toContainText('Nháp');
      // Baseline Nov 8 deliberately describes this screen without KPI cards.
      for (const label of ['Tổng báo giá', 'Tỷ lệ chốt', 'Chờ duyệt ngoại lệ']) await expect(page.getByText(label, { exact: true })).toHaveCount(0);
    });

  });

  test("UI-IPS-002 Lọc trạng thái và khách hàng", { tag: ["@ui", "@quan-ly-bao-gia", "@p3"] }, async ({ testRun, roles, browser }) => {

  const q = new QuoteScenario(testRun);
  const x = await q.issued();
  const customer = String(x.rfq.customerName);
  await withQuotePage(browser, roles, 'cc', async web => {
    await web.goto('/quotations?tab=internal-quotes');
    const table = web.locator('main table:visible').first();
    await expect(table.locator('tbody tr').first()).toBeVisible();
    const filters = web.locator('main div[tabindex="0"]:visible');
    // (1) Chọn trạng thái
    const byStatus = uiApi(web, 'GET', /\/api\/internal-quotes/);
    await pickOption(web, filters.filter({ hasText: /^\s*Tất cả trạng thái\s*$/ }), 'Đã phát hành');
    expectStatusIn(await byStatus, '200', 'Lọc trạng thái');
    // (2) Chọn khách hàng
    const byCustomer = uiApi(web, 'GET', /\/api\/internal-quotes/);
    await filters.filter({ hasText: /^\s*Tất cả khách hàng\s*$/ }).click();
    await web.getByPlaceholder('Tìm khách hàng...').fill(customer);
    await web.getByText(customer, { exact: true }).last().click();
    expectStatusIn(await byCustomer, '200', 'Lọc khách hàng');
    await expect(table.locator('tbody tr').filter({ hasText: x.iq.code }), 'BGNB Đã phát hành của KH_A có trong kết quả').toBeVisible();
    const heads = (await table.locator('thead th').allInnerTexts()).map(h => h.trim().toUpperCase());
    const rows = table.locator('tbody tr:has(td)');
    const n = await rows.count();
    for (let i = 0; i < n; i++) {
      const cells = rows.nth(i).locator('td');
      await expect(cells.nth(heads.indexOf('TRẠNG THÁI')), `Dòng ${i + 1}: Đã phát hành`).toHaveText(/^\s*Đã phát hành\s*$/);
      await expect(cells.nth(heads.indexOf('KHÁCH HÀNG')), `Dòng ${i + 1}: đúng khách hàng`).toHaveText(customer);
      await expect(cells.nth(heads.indexOf('KẾT QUẢ')), `Dòng ${i + 1}: cột Kết quả`).toHaveText(/^\s*(Thành công|Thất bại|—)\s*$/);
    }
  });

  });

  test("UI-IPS-003 Form tạo BGNB", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun }) => {

    await withQuotePage(browser, roles, 'cc', async page => {
      await page.goto('/quotations'); await quoteTab(page, 'Báo giá nội bộ').click();
      await page.getByRole('button', { name: 'Thêm mới', exact: true }).click();
      await expect(page).toHaveURL(/\/quotations\/internal-quotes\/new/);
      await expect(page.getByRole('heading', { name: 'Tạo báo giá mới', exact: true })).toBeVisible();
      await expect(page.getByText(/Vui lòng nhập đầy đủ thông tin các trường có dấu/)).toBeVisible();
      for (const name of ['Hủy', 'Tạo']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
      for (const label of ['Tên báo giá', 'Mã yêu cầu báo giá liên quan', 'Khách hàng', 'Hạng khách hàng', 'Ghi chú yêu cầu báo giá', 'Thời hạn hiệu lực', 'Điều kiện áp dụng', 'Loại hình XNK', 'Nhóm hàng', 'Đặc tính hàng hóa', 'Loại xe', 'Quy cách đóng gói', 'Ghi chú yêu cầu dịch vụ', 'Bảng giá theo từng dịch vụ']) await expect(page.getByText(new RegExp('^' + label + '\\s*\\*?$')).first(), label).toBeVisible();
      for (const label of ['Tên báo giá', 'Mã yêu cầu báo giá liên quan', 'Thời hạn hiệu lực']) await expect(page.getByText(new RegExp('^' + label + '\\s*\\*$')).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Thêm dịch vụ mới', exact: true })).toBeVisible();
      for (const service of ['Khai báo hải quan', 'Hải quan giám sát', 'Vận tải', 'Sang tải', 'Kho bãi']) await expect(quoteTab(page, service)).toBeVisible();
      await expect(page.getByText('Chưa có bảng giá nào', { exact: true }).first()).toBeVisible();
    });

  });

  test("UI-IPS-004 Chọn YCBG tự điền thông tin", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ testRun, roles, browser }) => {

  const q = new QuoteScenario(testRun);
  const r = await q.pricing();
  const used = await q.draft();
  const draft = await q.newRfq(false);
  const d = await q.rfq(r.id);
  const draftCode = String((await q.rfq(draft.id)).code);
  await withQuotePage(browser, roles, 'cc', async web => {
    await web.goto('/quotations/internal-quotes/new');
    await selectByLabel(web.locator('main'), 'Mã yêu cầu báo giá liên quan').click();
    const search = web.getByPlaceholder('Tìm mã YCBG hoặc tên khách hàng...');
    for (const [code, why] of [[String(used.rfq.code), 'đã gắn BGNB'], [draftCode, 'còn Nháp']]) {
      await search.fill(code);
      await expect(web.locator(`div[title^="${code} — "]`), `Không có YCBG ${why}`).toHaveCount(0);
    }
    await search.fill(String(d.code));
    const loaded = uiApi(web, 'GET', /\/api\/quotation-requests\//);
    await web.locator(`div[title^="${d.code} — "]`).last().click();
    expectStatusIn(await loaded, '200', 'Tải YCBG đã chọn');
    const main = web.locator('main');
    const field = (label: string) => main.locator('label').filter({ hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().locator('xpath=..');
    await expect(field('Khách hàng')).toContainText(String(d.customerName));
    expect((await field('Hạng khách hàng').innerText()).replace('Hạng khách hàng', '').trim(), 'Hạng khách hàng tự điền').not.toBe('');
    await expect(field('Ghi chú yêu cầu báo giá')).toContainText(String(d.generalNote));
    await expect(main.getByText('Tự động fill từ yêu cầu báo giá')).toBeVisible();
    for (const label of ['Khách hàng', 'Hạng khách hàng', 'Ghi chú yêu cầu báo giá', 'Loại hình XNK', 'Nhóm hàng', 'Đặc tính hàng hóa', 'Loại xe', 'Quy cách đóng gói', 'Ghi chú yêu cầu dịch vụ']) {
      await expect(field(label).locator('input, textarea, div[tabindex="0"]'), `${label} chỉ đọc`).toHaveCount(0);
    }
    for (const label of ['Loại hình XNK', 'Nhóm hàng', 'Loại xe', 'Quy cách đóng gói']) {
      expect((await field(label).innerText()).replace(label, '').trim(), `${label} tự điền`).not.toBe('');
    }
  });

  });

  test("UI-IPS-005 Chọn dòng giá cho đầu mục", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, roles, tok, browser }) => {

  /** Chọn YCBG ở ô "Mã yêu cầu báo giá liên quan" (lựa chọn có title "MÃ — Khách hàng"). */
  const chooseRfq = async (web: Page, code: string) => {
    await selectByLabel(web.locator('main'), 'Mã yêu cầu báo giá liên quan').click();
    await web.getByPlaceholder('Tìm mã YCBG hoặc tên khách hàng...').fill(code);
    await web.locator(`div[title^="${code} — "]`).last().click();
    await expect(web.getByText('Tự động fill từ yêu cầu báo giá')).toBeVisible();
  };
  /** Mở "Thêm dịch vụ mới", chọn loại dịch vụ, đặt tên, chọn thuộc tính (ô chọn chỉ có giá trị của YCBG). */
  const openService = async (web: Page, service: string) => {
    await web.getByRole('button', { name: 'Thêm dịch vụ mới', exact: true }).click();
    const modal = web.getByRole('dialog').filter({ hasText: 'Thêm dịch vụ mới' }).last();
    await pickOption(web, selectByLabel(modal, 'Loại dịch vụ'), service);
    await modal.getByPlaceholder('Nhập tên dịch vụ').fill(`AT ${service} ${TEST_RUN_ID}`);
    const attrs = modal.locator('div[tabindex="0"]');
    const n = await attrs.count();
    for (let i = 1; i < n; i++) {
      const trigger = attrs.nth(i);
      if (!/^Chọn/.test((await trigger.innerText()).trim())) continue;
      await trigger.click();
      await web.locator('body > div').last().locator('div[title], button').filter({ hasNotText: /^\s*Tất cả\s*$/ }).first().click();
    }
    return modal;
  };
  const picker = (web: Page) => web.getByRole('dialog').filter({ hasText: 'Chọn dòng giá' }).last();
  const sspCode = async (id: string) => String((await data(await http.call('GET /api/standard-selling-prices/{id}', { token: tok('cc'), params: { id } }))).code);

  const q = new QuoteScenario(testRun);
  const base = await ORD.p0Base(testRun);
  const r = await q.pricing();
  const code = await sspCode(String(base.ssp.freight));
  await withQuotePage(browser, roles, 'cc', async web => {
    await web.goto('/quotations/internal-quotes/new');
    await chooseRfq(web, String(r.code));
    const lines = uiApi(web, 'GET', /\/api\/internal-quotes\/benchmark-lines/);
    const modal = await openService(web, 'Vận tải');
    const row = modal.locator('tbody tr').filter({ hasText: base.items.freight.name });
    await expect(row.getByPlaceholder('Nhập đơn giá'), 'Ô đơn giá khóa khi chưa chọn dòng giá').toBeDisabled();
    await row.getByRole('button', { name: 'Chọn' }).click();
    await expect(picker(web)).toContainText(`Đầu mục: ${base.items.freight.name}`);
    expectStatusIn(await lines, '200', 'Tải dòng giá phù hợp');
    await picker(web).getByPlaceholder('Lọc theo mã hoặc thuộc tính...').fill(code);
    await picker(web).locator('tbody tr').filter({ hasText: code }).getByRole('button', { name: 'Chọn' }).click();
    await expect(row, 'Mã giá bán ĐM').toContainText(code);
    await expect(row, 'Đơn vị').toContainText(/Chuyến/i);
    await expect(row, 'Giá mua ĐM').toContainText('9.500.000');
    await expect(row, 'Giá bán ĐM').toContainText('11.000.000');
    await expect(row.getByPlaceholder('Nhập đơn giá'), 'Đơn giá = giá bán ĐM').toHaveValue('11.000.000');
    await expect(row, 'Lợi nhuận 15,79%').toContainText(/15[.,](79|8)\s*%/);
  });

  });

  test("UI-IPS-006 Không có dòng giá khớp", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, roles, tok, browser }) => {

  /** Chọn YCBG ở ô "Mã yêu cầu báo giá liên quan" (lựa chọn có title "MÃ — Khách hàng"). */
  const chooseRfq = async (web: Page, code: string) => {
    await selectByLabel(web.locator('main'), 'Mã yêu cầu báo giá liên quan').click();
    await web.getByPlaceholder('Tìm mã YCBG hoặc tên khách hàng...').fill(code);
    await web.locator(`div[title^="${code} — "]`).last().click();
    await expect(web.getByText('Tự động fill từ yêu cầu báo giá')).toBeVisible();
  };
  /** Mở "Thêm dịch vụ mới", chọn loại dịch vụ, đặt tên, chọn thuộc tính (ô chọn chỉ có giá trị của YCBG). */
  const openService = async (web: Page, service: string) => {
    await web.getByRole('button', { name: 'Thêm dịch vụ mới', exact: true }).click();
    const modal = web.getByRole('dialog').filter({ hasText: 'Thêm dịch vụ mới' }).last();
    await pickOption(web, selectByLabel(modal, 'Loại dịch vụ'), service);
    await modal.getByPlaceholder('Nhập tên dịch vụ').fill(`AT ${service} ${TEST_RUN_ID}`);
    const attrs = modal.locator('div[tabindex="0"]');
    const n = await attrs.count();
    for (let i = 1; i < n; i++) {
      const trigger = attrs.nth(i);
      if (!/^Chọn/.test((await trigger.innerText()).trim())) continue;
      await trigger.click();
      await web.locator('body > div').last().locator('div[title], button').filter({ hasNotText: /^\s*Tất cả\s*$/ }).first().click();
    }
    return modal;
  };
  const picker = (web: Page) => web.getByRole('dialog').filter({ hasText: 'Chọn dòng giá' }).last();
  const sspCode = async (id: string) => String((await data(await http.call('GET /api/standard-selling-prices/{id}', { token: tok('cc'), params: { id } }))).code);

  const q = new QuoteScenario(testRun);
  const base = await ORD.p0Base(testRun);
  const refs = await testRun.p0Refs();
  const vehicles = items(await data(await http.call('GET /api/catalogues/vehicle-types', { token: tok('k1'), query: { perPage: 100 } })));
  const v20 = vehicles.find((v: any) => /\b20\b|20\s*(ft|')/i.test(String(v.name)));
  expect(v20, 'Danh mục có loại xe 20ft').toBeTruthy();
  // YCBG chỉ khác P0 ở loại xe 20ft: không SSP nào của đầu mục "AT Phí khai báo" khớp.
  const r = await q.pricing({ serviceInfo: { tradeTypes: [refs.tradeType], cargoGroupCodes: [refs.cargoGroup], cargoNatureCodes: [refs.cargoNature], packagingCodes: [refs.packaging], vehicleTypeCodes: [v20.code] } });
  await withQuotePage(browser, roles, 'cc', async web => {
    await web.goto('/quotations/internal-quotes/new');
    await chooseRfq(web, String(r.code));
    const modal = await openService(web, 'Khai báo hải quan');
    const row = modal.locator('tbody tr').filter({ hasText: base.items.customsFee.name });
    const lines = uiApi(web, 'GET', /\/api\/internal-quotes\/benchmark-lines/);
    await row.getByRole('button', { name: 'Chọn' }).click();
    expectStatusIn(await lines, '200', 'Tải dòng giá phù hợp');
    await expect(picker(web).getByText('Không có dòng giá phù hợp với thuộc tính đã chọn')).toBeVisible();
    await picker(web).getByRole('button', { name: 'Đóng' }).click();
    await expect(row.getByPlaceholder('Nhập đơn giá'), 'Ô đơn giá bị khóa').toBeDisabled();
  });

  });

  test("UI-IPS-009 Chi tiết BGNB tab Thông tin chung", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ testRun, roles, browser }) => {

  /** BGNB tự động Đã phát hành: K1 gửi YCBG rồi lấy tự động BGNB từ giá bán định mức. */
  const q = new QuoteScenario(testRun);
  const rfq = await q.newRfq(true);
  const auto = await data(await q.call('POST /api/quotation-requests/{id}/auto-internal-quote', 'k1', { params: { id: rfq.id } }));
  const iqId = String(auto?.internalQuoteId ?? (await q.rfq(rfq.id)).internalQuote?.id ?? '');
  expect(iqId, 'Có BGNB tự động của YCBG').not.toBe('');
  const iq = await q.iq(iqId);
  expect(String(iq.status), 'BGNB tự động Đã phát hành').toMatch(/ISSUED|PUBLISHED/);

  const d = await q.rfq(rfq.id);
  await withQuotePage(browser, roles, 'cc', async web => {
    await web.goto('/quotations?tab=internal-quotes');
    await web.getByPlaceholder('Tìm theo mã báo giá / tên báo giá / mã YCBG...').fill(String(iq.code));
    const opened = uiApi(web, 'GET', new RegExp(`/api/internal-quotes/${iqId}`));
    await web.locator('main table:visible').getByRole('link', { name: String(iq.code), exact: true }).click();
    expectStatusIn(await opened, '200', 'Mở chi tiết BGNB');
    const main = web.locator('main');
    await expect(main).toContainText(new RegExp(`Chi tiết báo giá nội bộ:\\s*${iq.code}`));
    await expect(main.getByText('Đã phát hành', { exact: true }).first(), 'Nhãn trạng thái').toBeVisible();
    await expect(main).toContainText('Tên báo giá:');
    await expect(main).toContainText(String(iq.name));
    await expect(main).toContainText(new RegExp(`Mã YCBG:\\s*${d.code}`));
    await expect(main).toContainText(/Người phát hành:\s*Hệ thống/);
    await expect(main.getByRole('button', { name: 'Thu hồi', exact: true })).toBeVisible();
    await expect(main).toContainText(/Đã phát hành lúc:\s*\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}/);
    await expect(main.getByRole('button', { name: 'Lịch sử thao tác' })).toBeVisible();
    for (const tab of ['Thông tin chung', 'Bảng giá dịch vụ chi tiết']) await expect(main.getByRole('button', { name: tab, exact: true }), `Tab ${tab}`).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Báo giá tài chính hợp nhất' })).toBeVisible();
    for (const label of ['Tổng giá bán', 'Lợi nhuận dự kiến', 'Đơn vị tiền tệ']) await expect(main.getByText(label, { exact: true }).first(), label).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Thông tin phát hành báo giá' })).toBeVisible();
    await expect(main).toContainText(/Nguồn tạo\s*:\s*Tự động/);
    await expect(main).toContainText(/Người tạo YCBG\s*:\s*\S+/);
    await expect(main).toContainText(/Người phát hành\s*:\s*Hệ thống/);
    await expect(main).toContainText(/Thời điểm phát hành\s*:\s*\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}/);
  });

  });

  test("UI-IPS-010 Chi tiết BGNB tab Bảng giá", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ testRun, roles, browser }) => {

  /** BGNB tự động Đã phát hành: K1 gửi YCBG rồi lấy tự động BGNB từ giá bán định mức. */
  const q = new QuoteScenario(testRun);
  const rfq = await q.newRfq(true);
  const auto = await data(await q.call('POST /api/quotation-requests/{id}/auto-internal-quote', 'k1', { params: { id: rfq.id } }));
  const iqId = String(auto?.internalQuoteId ?? (await q.rfq(rfq.id)).internalQuote?.id ?? '');
  expect(iqId, 'Có BGNB tự động của YCBG').not.toBe('');
  const iq = await q.iq(iqId);
  expect(String(iq.status), 'BGNB tự động Đã phát hành').toMatch(/ISSUED|PUBLISHED/);

  await withQuotePage(browser, roles, 'cc', async web => {
    await web.goto(`/quotations/internal-quotes/${iqId}`);
    const main = web.locator('main');
    await main.getByRole('button', { name: 'Bảng giá dịch vụ chi tiết', exact: true }).click();
    await expect(main.getByRole('heading', { name: 'Cấu trúc bảng giá dịch vụ chi tiết' })).toBeVisible();
    const serviceTabs = main.getByRole('button').filter({ hasText: /Đã báo giá\s*$/ });
    const n = await serviceTabs.count();
    expect(n, 'Có tab dịch vụ gắn nhãn "Đã báo giá"').toBeGreaterThan(0);
    let missing = 0;
    for (let i = 0; i < n; i++) {
      const tab = serviceTabs.nth(i);
      await tab.click();
      const tables = main.locator('table:visible');
      await expect(tables.first()).toBeVisible();
      const tc = await tables.count();
      await expect(main.locator('text=/IQ\\d{4}-\\d{3}/ >> visible=true').first(), 'Mỗi bảng có mã IQ').toBeVisible();
      expect(await main.locator('h4:visible').filter({ hasText: ' / ' }).count(), 'Mỗi bảng có thuộc tính').toBeGreaterThanOrEqual(tc);
      for (let j = 0; j < tc; j++) {
        const heads = (await tables.nth(j).locator('thead th').allInnerTexts()).map(h => h.trim().toUpperCase());
        expect(heads, 'Cột bảng giá').toEqual(['STT', 'ĐẦU MỤC GIÁ', 'LOẠI GIÁ', 'MÃ GIÁ BÁN ĐM', 'ĐƠN VỊ', 'GIÁ MUA ĐM', 'GIÁ BÁN ĐM', 'ĐƠN GIÁ', 'LỢI NHUẬN (%)']);
      }
      expect(await main.locator('text="TỔNG ĐƠN GIÁ" >> visible=true').count(), 'Mỗi bảng có dòng TỔNG ĐƠN GIÁ').toBeGreaterThanOrEqual(tc);
      if (await main.locator('text="Chưa có giá định mức" >> visible=true').count()) {
        missing++;
        await expect(main.locator('text="Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức" >> visible=true').first(), 'Chú thích bảng thiếu giá').toBeVisible();
      }
    }
    expect(missing, 'Có bảng thiếu giá hiển thị "Chưa có giá định mức"').toBeGreaterThan(0);
  });

  });

  test("UI-IPS-011 Dòng giá Hết hạn và bảng bị vô hiệu", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ testRun, roles, browser }) => {

  test.setTimeout(900_000);
  // Bộ giá riêng có BGNB Đã phát hành (bảng KHQ: Phí khai báo 1.200.000 + Phí ngoài giờ 400.000, tổng BGNB 15.700.000), rồi đổi SSP Phí khai báo.
  const base = await PF.flowBase(testRun, 'UI-IPS-011');
  await PF.changeSelling(testRun, base, 'customsFee', 1_300_000);
  const remaining = (P0.internalQuoteTotal - 1_200_000 - 400_000).toLocaleString('de-DE');
  await withQuotePage(browser, roles, 'cc', async web => {
    const opened = uiApi(web, 'GET', new RegExp(`/api/internal-quotes/${base.internalQuoteId}`));
    await web.goto(`/quotations/internal-quotes/${base.internalQuoteId}`);
    expectStatusIn(await opened, '200', 'Mở chi tiết BGNB');
    const main = web.locator('main');
    await expect(main, 'Bảng bị vô hiệu không cộng vào Tổng giá bán').toContainText(new RegExp(`Tổng giá bán\\s*${remaining.replace(/\./g, '\\.')} VNĐ`));
    await main.getByRole('button', { name: 'Bảng giá dịch vụ chi tiết', exact: true }).click();
    await main.getByRole('button').filter({ hasText: /^Khai báo hải quan/ }).first().click();
    const row = main.locator('tbody tr:visible').filter({ hasText: base.items.customsFee.name });
    await expect(row, 'Dòng có nhãn Hết hạn').toContainText('Hết hạn');
    await expect(row, 'Giữ giá cũ').toContainText('1.200.000');
    const table = row.locator('xpath=ancestor::table[1]');
    const block = table.locator('xpath=ancestor::*[.//h4][1]');
    await expect(block, 'Bảng bị vô hiệu kèm chú thích').toContainText(/Không thể sử dụng bảng giá này|vô hiệu|hết hạn/i);
    const total = block.locator('tr, div').filter({ hasText: /^\s*TỔNG ĐƠN GIÁ/ }).last();
    await expect(total, 'Tổng đơn giá của bảng để trống').toContainText('—');
    await expect(total).not.toContainText(/\d{1,3}(\.\d{3})+/);
    await expect(main).toContainText(new RegExp(`Tổng đơn giá dịch vụ \\(chưa bao gồm VAT\\):\\s*${remaining.replace(/\./g, '\\.')} VNĐ`));
  });

  });

  test("UI-IPS-012 Thu hồi khi đã có BGKH", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.pending();
    const before = stable(await q.iq(x.iq.id));
    await withQuotePage(browser, roles, 'cc', async page => {
      await page.goto(`/quotations/internal-quotes/${x.iq.id}`);
      await page.getByRole('button', { name: 'Thu hồi', exact: true }).click();
      const dialog = page.getByRole('dialog').last(); await expect(dialog).toBeVisible();
      await dialog.getByRole('textbox').first().fill('Cập nhật giá');
      const response = page.waitForResponse(r => r.request().method() === 'POST' && /\/internal-quotes\/[^/]+\/withdraw(?:\?|$)/.test(r.url()));
      await dialog.getByRole('button', { name: /Xác nhận|Thu hồi/ }).click();
      expectStatusIn(await response, '400/409/422');
      await expect(page.getByText('Không thể thu hồi báo giá ở trạng thái này: đã có báo giá khách hàng', { exact: true }).first()).toBeVisible();
      expect(stable(await q.iq(x.iq.id)), 'BGNB vẫn Đã phát hành, không ghi đổi giá hay trạng thái').toEqual(before);
    });

  });

  test("UI-IPS-013 Thu hồi khi chưa có BGKH", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.issued();
    await withQuotePage(browser, roles, 'cc', async page => {
      await page.goto(`/quotations/internal-quotes/${x.iq.id}`);
      await page.getByRole('button', { name: 'Thu hồi', exact: true }).click();
      const dialog = page.getByRole('dialog').last(); await expect(dialog).toBeVisible();
      await dialog.getByRole('textbox').first().fill('Cập nhật giá');
      const response = page.waitForResponse(r => r.request().method() === 'POST' && /\/internal-quotes\/[^/]+\/withdraw(?:\?|$)/.test(r.url()));
      await dialog.getByRole('button', { name: /Xác nhận|Thu hồi/ }).click();
      expectStatusIn(await response, '200/204');
      await expect(page.getByText('Thu hồi báo giá thành công', { exact: true }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Chỉnh sửa/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /Phát hành/ })).toBeVisible();
      expect((await q.iq(x.iq.id)).status).toMatch(/WITHDRAWN|RECALL|Thu hồi/i);
      expect((await q.rfq(x.rfq.id)).status).toBe('PRICING_IN_PROGRESS');
    });

  });

  test("UI-IPS-014 Phát hành báo giá", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ browser, roles, http, testRun }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.draft();
    await withQuotePage(browser, roles, 'cc', async page => {
      await page.goto(`/quotations/internal-quotes/${x.iq.id}`);
      await page.getByRole('button', { name: 'Phát hành báo giá', exact: true }).click();
      const dialog = page.getByRole('dialog').last(); await expect(dialog).toBeVisible();
      const response = page.waitForResponse(r => r.request().method() === 'POST' && /\/(?:internal-quotes\/[^/]+\/issue|quotation-requests\/[^/]+\/internal-quote\/issue)(?:\?|$)/.test(r.url()));
      await dialog.getByRole('button', { name: 'Phát hành', exact: true }).click();
      expectStatusIn(await response, '200/204');
      await expect(page.getByText('Phát hành báo giá thành công', { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/Đã phát hành lúc/).first()).toBeVisible();
      const d = await q.iq(x.iq.id);
      expect(d.status).toMatch(/ISSUED|PUBLISHED|Đã phát hành/i);
      expect(d.issuedBy).toBeTruthy(); expect(d.issuedAt).toBeTruthy();
      expect((await q.rfq(x.rfq.id)).status).toBe('PRICED');
    });

  });
});
