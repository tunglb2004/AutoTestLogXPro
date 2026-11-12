/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { pasteText, uiApi } from '../../../src/core/assertions';
import { withQuotePage } from '../../../src/quan-ly-bao-gia/data/quote-ui.fixture';
import { esc } from '../../../src/core/pages/components/data-table.component';
import { DauMucGiaPage } from '../../../src/cau-hinh-dau-muc-gia/pages/dau-muc-gia.page';
import * as CFGF from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import { exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình đầu mục giá", () => {
  test("UI-CFG-009 Đầu mục đã dùng chỉ được bật/tắt", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ testRun, roles, browser }) => {

  test.info().annotations.push({ type: 'Lệch tài liệu', description: 'Web dev khóa sẵn ô tên, loại giá, nút xóa kèm tooltip nên không bấm Lưu được với thay đổi đó; kiểm tra theo giao diện (tooltip) thay cho thông báo khi lưu' });
  const base = await ORD.p0Base(testRun);
  const item = base.items.customsFee;
  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.openService('Khai báo hải quan');
    await cfg.editButton.click();
    const row = cfg.editRow(item.id);
    await expect(cfg.nameInput(item.id), 'Ô tên bị khóa').toBeDisabled();
    await expect(cfg.priceType(row), 'Ô loại giá bị khóa').toBeDisabled();
    await expect(cfg.deleteButton(row), 'Nút xóa bị khóa').toBeDisabled();
    await expect(row.locator(`[title="${DauMucGiaPage.LOCKED_TITLE}"]`).first(), 'Tooltip giải thích chỉ được bật/tắt').toBeAttached();
    await expect(cfg.statusSwitch(row), 'Chỉ công tắc trạng thái dùng được').toBeEnabled();
    await cfg.cancelButton.click();
    await expect(cfg.editButton).toBeVisible();
  });

  });

  test("UI-CFG-010 Tên đầu mục trùng trong phân hệ", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ testRun, roles, browser }) => {

  const before = await CFGF.configOf(testRun, 'HQGS');
  const dup = String(before.items[0].name);
  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.openService('Hải quan giám sát');
    await cfg.editButton.click();
    await cfg.addRow(dup, 'Cố định');
    // Kiểm tra trùng có thể ở trình duyệt (không gọi API) hoặc ở máy chủ (phải trả 4xx).
    const save = uiApi(web, /^(PUT|POST|PATCH)$/, /\/api\/price-configurations/, 10_000).catch(() => null);
    await cfg.saveButton.click();
    await expect(web.getByText('Tên đầu mục giá đã tồn tại trong phân hệ này')).toBeVisible();
    const res = await save;
    if (res) expectStatusIn(res, '400/409/422', 'Lưu tên trùng');
    await expect(cfg.saveButton, 'Vẫn ở chế độ sửa').toBeVisible();
    await cfg.cancelButton.click();
  });
  const after = await CFGF.configOf(testRun, 'HQGS');
  expect(after.items.filter((x: any) => x.name === dup).length, 'Không lưu thêm dòng trùng tên').toBe(1);

  });

  test("UI-CFG-011 Kho bãi thiếu Loại kho", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ testRun, roles, browser }) => {

  const name = `AT Thiếu loại kho ${TEST_RUN_ID}`.slice(0, 50);
  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.openService('Kho bãi');
    await cfg.editButton.click();
    const row = await cfg.addRow(name, 'Cố định');
    const save = uiApi(web, /^(PUT|POST|PATCH)$/, /\/api\/price-configurations/, 10_000).catch(() => null);
    await cfg.saveButton.click();
    const err = web.getByText(/(vui lòng|bắt buộc|chưa).*loại kho|loại kho.*(bắt buộc|không được để trống)/i);
    await expect(err.first(), 'Lỗi ở ô Loại kho').toBeVisible();
    const res = await save;
    if (res) expectStatusIn(res, '400/422', 'Lưu thiếu Loại kho');
    await expect(row.getByText(/tên.*(bắt buộc|vui lòng)|vui lòng nhập tên/i), 'Không báo lỗi ở ô tên').toHaveCount(0);
    await expect(cfg.saveButton, 'Vẫn ở chế độ sửa').toBeVisible();
    await cfg.cancelButton.click();
  });
  const after = await CFGF.configOf(testRun, 'KB');
  expect(after.items.some((x: any) => x.name === name), 'Không lưu dòng thiếu Loại kho').toBe(false);

  });

  test("UI-CFG-012 Tên đầu mục 49/50/51 ký tự", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ testRun, roles, browser }) => {

    test.setTimeout(360_000);
    await exclusive('cfg-HQGS', async () => {
      await withQuotePage(browser, roles, 'k1', async (web) => {
        const cfg = new DauMucGiaPage(web);
        await cfg.openService('Hải quan giám sát');
        for (const mode of ['gõ', 'dán']) {
          for (const n of [49, 50, 51]) {
            const value = textOfLength(n, 'AT ' + uuid().slice(0, 8) + ' Phí giám sát hàng hóa tại Hữu Nghị ');
            expect(value.length).toBe(n);
            await cfg.editButton.click();
            await cfg.addRowButton.click();
            const input = cfg.newNameInputs.last();
            if (mode === 'dán') await pasteText(input, value);
            else await input.pressSequentially(value);
            await expect(input, 'Không cắt chuỗi ngầm').toHaveValue(value);
            await cfg.priceType(cfg.rowOf(input)).selectOption({ label: 'Cố định' });
            await input.blur();
            const response = uiApi(web, /^(PUT|POST|PATCH)$/, /\/api\/price-configurations(?:\/|$)/, 10_000).catch(() => null);
            await cfg.saveButton.click();
            const result = await response;
            if (n <= 50) {
              expect(result, 'Tên hợp lệ được gửi để lưu').not.toBeNull();
              expectStatusIn(result!, '200/204');
              await expect(cfg.editButton).toBeVisible();
              const saved = (await CFGF.configOf(testRun, 'HQGS')).items;
              expect(saved.filter((item: any) => item.name === value), 'Tên được lưu nguyên văn').toHaveLength(1);
            } else {
              if (result) expectStatusIn(result, '400/422');
              await expect(web.getByText(/50 ký tự|tối đa 50|không (được )?vượt quá 50/i).first()).toBeVisible();
              const saved = (await CFGF.configOf(testRun, 'HQGS')).items;
              expect(saved.filter((item: any) => item.name === value || item.name === value.slice(0, 50))).toHaveLength(0);
              await cfg.cancelButton.click();
            }
          }
        }
      });
    });
  });
});
