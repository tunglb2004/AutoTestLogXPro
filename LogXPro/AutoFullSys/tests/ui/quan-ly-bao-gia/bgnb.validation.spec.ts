/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { internalQuoteBody } from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
import { configOf } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { P0 } from '../../../src/core/data/p0-price-set';

import { uiApi } from '../../../src/core/assertions';
import { withQuotePage } from '../../../src/quan-ly-bao-gia/data/quote-ui.fixture';
import { QuoteScenario } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';
import { pickOption, selectByLabel } from '../../../src/core/pages/components/data-table.component';
import { Page } from '@playwright/test';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

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

test.describe("Báo giá nội bộ", () => {
  test("UI-IPS-007 Thiếu dòng giá", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ http, testRun, roles, tok, browser }) => {

  const sspCode = async (id: string) => String((await data(await http.call('GET /api/standard-selling-prices/{id}', { token: tok('cc'), params: { id } }))).code);

  const q = new QuoteScenario(testRun);
  const base = await ORD.p0Base(testRun);
  const r = await q.pricing();
  const code = await sspCode(String(base.ssp.customsFee));
  await withQuotePage(browser, roles, 'cc', async web => {
    await web.goto('/quotations/internal-quotes/new');
    await web.getByPlaceholder('Nhập tên báo giá').fill(`AT BGNB thiếu dòng giá ${TEST_RUN_ID}`);
    await chooseRfq(web, String(r.code));
    await selectByLabel(web.locator('main'), 'Thời hạn hiệu lực').click();
    const cal = web.locator('body > div').filter({ has: web.getByRole('button', { name: 'Hôm nay' }) }).last();
    await cal.getByRole('button', { name: 'Tháng sau' }).click();
    await cal.getByText('15', { exact: true }).first().click();
    // Bảng Khai báo hải quan: chỉ chọn giá cho "AT Phí khai báo", "AT Phí ngoài giờ" còn trống
    const modal = await openService(web, 'Khai báo hải quan');
    await modal.locator('tbody tr').filter({ hasText: base.items.customsFee.name }).getByRole('button', { name: 'Chọn' }).click();
    await picker(web).getByPlaceholder('Lọc theo mã hoặc thuộc tính...').fill(code);
    await picker(web).locator('tbody tr').filter({ hasText: code }).getByRole('button', { name: 'Chọn' }).click();
    await expect(modal.locator('tbody tr').filter({ hasText: base.items.overtime.name }), 'Còn 1 đầu mục chưa chọn giá').not.toContainText(/SSP-\d+/);
    const save = uiApi(web, 'POST', /\/api\/internal-quotes$/, 10_000).catch(() => null);
    await modal.getByRole('button', { name: 'Tạo dịch vụ', exact: true }).click();
    const error = web.getByText('Vui lòng nhập đầy đủ dòng giá trong các đầu mục giá').first();
    await expect(modal).toBeHidden({ timeout: 5_000 }).catch(() => undefined);
    if (!(await modal.isVisible())) await web.locator('main').getByRole('button', { name: 'Tạo', exact: true }).click();
    await expect(error).toBeVisible();
    const res = await save;
    if (res) expectStatusIn(res, '400/422', 'Tạo BGNB thiếu dòng giá');
    await expect(web, 'Vẫn ở form tạo').toHaveURL(/\/internal-quotes\/new/);
  });
  expect((await q.rfq(r.id)).internalQuote ?? null, 'Không tạo BGNB').toBeNull();

  });

  test("UI-IPS-008 Tên báo giá 254/255/256 ký tự", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ roles, browser, testRun }) => {
    test.setTimeout(600_000);
    const q = new QuoteScenario(testRun);
    const base = await ORD.p0Base(testRun);
    const cfg = await configOf(testRun, 'KHQ', 'cc');

    for (const n of [254, 255, 256]) {
      const r = await q.newRfq(true, {}, ['KHQ']);
      await must(await q.call('POST /api/quotation-requests/{id}/accept', 'cc', { params: { id: r.id } }), 'tiếp nhận YCBG riêng');
      const payload = await internalQuoteBody(testRun, r.id, q.map(base), {}, ['KHQ']);
      const [table] = payload.tables;
      expect(table.lines.length).toBeGreaterThan(0);
      const priced = new Map<string, { code: string; price: number }>();
      for (const line of table.lines) {
        const ssp = await q.read('GET /api/standard-selling-prices/{id}', line.standardSellingPriceId, 'cc');
        const item = cfg.items.find((i: any) => i.id === line.priceConfigurationItemId);
        expect(item?.name, 'Có tên đầu mục để chọn trên UI').toBeTruthy();
        expect(ssp.code, 'Có mã giá bán định mức để chọn trên UI').toBeTruthy();
        priced.set(item.name, { code: ssp.code, price: line.unitPrice });
      }

      const value = textOfLength(n, 'Báo giá nội bộ dịch vụ logistics tuyến Hữu Nghị Hà Nội ');
      expect(value.length).toBe(n);
      expect(value).toContain(' ');
      await withQuotePage(browser, roles, 'cc', async (web) => {
        await web.goto('/quotations/internal-quotes/new');
        await chooseRfq(web, String(r.code));
        await selectByLabel(web.locator('main'), 'Thời hạn hiệu lực').click();
        const cal = web.locator('body > div').filter({ has: web.getByRole('button', { name: 'Hôm nay' }) }).last();
        await cal.getByRole('button', { name: 'Tháng sau' }).click();
        await cal.getByText('15', { exact: true }).first().click();
        const modal = await openService(web, 'Khai báo hải quan');
        for (const [itemName, price] of priced) {
          const row = modal.locator('tbody tr').filter({ has: web.getByText(itemName, { exact: true }) });
          await row.getByRole('button', { name: 'Chọn', exact: true }).click();
          const dialog = picker(web);
          await dialog.getByPlaceholder('Lọc theo mã hoặc thuộc tính...').fill(price.code);
          await dialog.locator('tbody tr').filter({ has: web.getByText(price.code, { exact: true }) }).getByRole('button', { name: 'Chọn', exact: true }).click();
          await row.getByPlaceholder('Nhập đơn giá').fill(String(price.price));
        }
        await modal.getByRole('button', { name: 'Tạo dịch vụ', exact: true }).click();
        await expect(modal, 'Dịch vụ đã nhập đủ giá').toBeHidden();

        const name = web.getByPlaceholder('Nhập tên báo giá');
        await name.pressSequentially(value);
        const submit = web.locator('main').getByRole('button', { name: 'Tạo', exact: true });
        if (n < 256) {
          await expect(name, 'Giữ nguyên văn kể cả dấu cách').toHaveValue(value);
          const pending = uiApi(web, 'POST', /\/api\/internal-quotes$/);
          await submit.click();
          expectStatusIn(await pending, '200/201');
          const saved = (await q.rfq(r.id)).internalQuote;
          expect(saved?.id, 'YCBG liên kết BGNB vừa lưu').toBeTruthy();
          expect((await q.iq(saved.id)).name, 'Đọc lại tên báo giá đã lưu').toBe(value);
        } else {
          const pending = uiApi(web, 'POST', /\/api\/internal-quotes$/, 5_000).catch(() => null);
          await submit.click();
          const response = await pending;
          if (response) expectStatusIn(response, '400/422');
          await expect(name.locator('xpath=..').getByText(/255|tối đa|vượt quá/i).first()).toBeVisible();
          expect((await q.rfq(r.id)).internalQuote ?? null, 'Tên vượt giới hạn không tạo BGNB').toBeNull();
        }
      });
    }
  });
});
