/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { uiApi } from '../../../src/core/assertions';
import { withQuotePage } from '../../../src/quan-ly-bao-gia/data/quote-ui.fixture';
import { esc } from '../../../src/core/pages/components/data-table.component';
import { DauMucGiaPage } from '../../../src/cau-hinh-dau-muc-gia/pages/dau-muc-gia.page';
import * as CFGF from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cấu hình đầu mục giá", () => {
  test("UI-CFG-001 Danh sách 5 phân hệ", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ roles, browser }) => {

  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    const list = uiApi(web, 'GET', /\/api\/price-configurations/);
    await cfg.goto();
    expectStatusIn(await list, '200', 'Tải danh sách cấu hình đầu mục giá');
    await expect(cfg.heading).toBeVisible();
    for (const c of DauMucGiaPage.CARDS) await expect(web.locator('main').getByText(c, { exact: true }), `Thẻ ${c}`).toBeVisible();
    await expect(cfg.serviceRow('Kho bãi')).toBeVisible();
    expect(await cfg.card('Tổng cấu hình giá phân hệ'), 'Thẻ "Tổng cấu hình giá phân hệ" = 5').toBe(5);
    expect((await cfg.table.headerTexts()).map(h => h.toUpperCase()), 'Cột bảng').toEqual(['STT', 'LOẠI DỊCH VỤ', 'SỐ LƯỢNG ĐẦU MỤC', 'THAO TÁC']);
    await expect(cfg.table.rows, 'Đủ 5 phân hệ').toHaveCount(5);
    for (const s of DauMucGiaPage.SERVICES) {
      await expect(cfg.serviceRow(s), `Dòng ${s}`).toBeVisible();
      await expect(cfg.viewButton(s), `Nút "Xem chi tiết" (icon mắt) dòng ${s}`).toBeVisible();
    }
  });

  });

  test("UI-CFG-002 Số trên thẻ khớp dữ liệu", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ roles, browser }) => {

  test.info().annotations.push({ type: 'Ghi chú dữ liệu', description: 'Case khác chạy song song có thể thêm đầu mục giữa lúc đếm; số liệu lệch do chạy song song thì chạy riêng case này' });
  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.goto();
    await expect(cfg.serviceRow('Kho bãi')).toBeVisible();
    const total = await cfg.card('Tổng cấu hình giá thiết lập');
    const active = await cfg.card('Dòng giá đang hoạt động');
    let sum = 0;
    let activeCount = 0;
    for (const s of DauMucGiaPage.SERVICES) {
      const n = await cfg.itemCount(s);
      sum += n;
      const detail = uiApi(web, 'GET', /\/api\/price-configurations\/[^/]+$/);
      await cfg.viewButton(s).click();
      expectStatusIn(await detail, '200', `Tải chi tiết ${s}`);
      await expect(cfg.detailHeading).toContainText(s);
      await expect(cfg.table.rows, `Số đầu mục ${s} khớp cột Số lượng đầu mục`).toHaveCount(n);
      activeCount += await cfg.table.rows.filter({ hasText: 'Đang hoạt động' }).count();
      await cfg.backLink.click();
      await expect(cfg.serviceRow(s)).toBeVisible();
    }
    expect(total, 'Thẻ "Tổng cấu hình giá thiết lập" = tổng cột Số lượng đầu mục của 5 phân hệ').toBe(sum);
    expect(active, 'Thẻ "Dòng giá đang hoạt động" = số đầu mục Đang hoạt động của 5 phân hệ').toBe(activeCount);
  });

  });

  test("UI-CFG-003 Mở chi tiết phân hệ Khai báo hải quan", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ roles, browser }) => {

  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.goto();
    const detail = uiApi(web, 'GET', /\/api\/price-configurations\/[^/]+$/);
    await cfg.viewButton('Khai báo hải quan').click();
    expectStatusIn(await detail, '200', 'Tải chi tiết Khai báo hải quan');
    await expect(cfg.detailHeading).toHaveText('Chi tiết cấu hình đầu mục giá: Khai báo hải quan');
    await expect(cfg.backLink).toBeVisible();
    await expect(web.locator('main')).toContainText(/ID:\s*CUSTOMS_DECLARATION/);
    await expect(cfg.logButton).toBeVisible();
    await expect(cfg.editButton).toBeVisible();
    await expect(cfg.listTitle).toBeVisible();
    await expect(cfg.table.rows.first()).toBeVisible();
    const rows = await cfg.table.rows.count();
    const title = (await web.locator('main').innerText()).match(/DANH SÁCH MỤC CẤU HÌNH GIÁ\D*(\d+)/);
    expect(Number(title?.[1]), 'Số đầu mục cạnh tiêu đề = số dòng bảng').toBe(rows);
    expect((await cfg.table.headerTexts()).map(h => h.toUpperCase()), 'Cột bảng').toEqual(['STT', 'ID CẤU HÌNH', 'TÊN CẤU HÌNH GIÁ', 'LOẠI GIÁ', 'TRẠNG THÁI']);
    for (let i = 0; i < rows; i++) {
      const r = cfg.table.rows.nth(i);
      await expect(r.locator('td').nth(1), `ID dòng ${i + 1}`).toHaveText(/^\s*CD-\d{3}\s*$/);
      await expect(r.locator('td').nth(3), `Loại giá dòng ${i + 1}`).toHaveText(/^\s*(Cố định|Phụ phí|Phát sinh)\s*$/);
      await expect(r.locator('td').nth(4), `Trạng thái dòng ${i + 1}`).toHaveText(/^\s*(Đang hoạt động|Ngừng hoạt động)\s*$/);
    }
  });

  });

  test("UI-CFG-004 Kho bãi có cột Loại kho", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ roles, browser }) => {

  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.goto();
    const detail = uiApi(web, 'GET', /\/api\/price-configurations\/[^/]+$/);
    await cfg.viewButton('Kho bãi').click();
    expectStatusIn(await detail, '200', 'Tải chi tiết Kho bãi');
    await expect(cfg.detailHeading).toHaveText('Chi tiết cấu hình đầu mục giá: Kho bãi');
    await expect(web.locator('main')).toContainText(/ID:\s*WAREHOUSING/);
    await expect(cfg.table.rows.first()).toBeVisible();
    const heads = (await cfg.table.headerTexts()).map(h => h.toUpperCase());
    expect(heads, 'Có cột LOẠI KHO').toContain('LOẠI KHO');
    const col = heads.indexOf('LOẠI KHO');
    const allowed = ['Kho thường', 'Kho đông lạnh', 'Kho ngoại quan', 'Kho CFS'];
    const seen = new Set<string>();
    const rows = await cfg.table.rows.count();
    for (let i = 0; i < rows; i++) {
      const r = cfg.table.rows.nth(i);
      await expect(r.locator('td').nth(1), `ID dòng ${i + 1}`).toHaveText(/^\s*WR-\d{3}\s*$/);
      const types = (await r.locator('td').nth(col).innerText()).split(',').map(t => t.trim()).filter(Boolean);
      for (const t of types) { expect(allowed, `Loại kho "${t}" dòng ${i + 1}`).toContain(t); seen.add(t); }
    }
    expect(seen.size, 'Cột LOẠI KHO hiển thị giá trị loại kho').toBeGreaterThan(0);
  });

  });

  test("UI-CFG-005 Vào và thoát chế độ chỉnh sửa", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p2"] }, async ({ roles, browser }) => {

  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.openService('Kho bãi');
    await expect(cfg.table.rows.first()).toBeVisible();
    const before = await cfg.table.rows.allInnerTexts();
    await cfg.editButton.click();
    for (const b of [cfg.cancelButton, cfg.saveButton, cfg.addRowButton]) await expect(b).toBeVisible();
    expect((await cfg.table.headerTexts()).map(h => h.toUpperCase()), 'Có cột THAO TÁC').toContain('THAO TÁC');
    const first = cfg.table.rows.first();
    await expect(first.locator('input[placeholder="Nhập tên cấu hình"]')).toBeVisible();
    expect(await first.locator('select option').allInnerTexts(), 'Ô loại giá').toEqual(expect.arrayContaining(['Chọn loại giá', 'Cố định', 'Phụ phí', 'Phát sinh']));
    await expect(cfg.statusSwitch(first), 'Công tắc trạng thái').toBeVisible();
    await expect(cfg.statusLabel(first)).toHaveText(/^(Kích hoạt|Dừng hoạt động)$/);
    await expect(cfg.warehouseSelect(first), 'Ô chọn Loại kho').toBeVisible();
    // Dòng mới: ô Loại kho chọn nhiều, đủ 4 loại kho
    await cfg.addRowButton.click();
    const fresh = cfg.rowOf(cfg.newNameInputs.last());
    await expect(cfg.warehouseSelect(fresh)).toHaveText(/Chọn loại kho/);
    await cfg.warehouseSelect(fresh).click();
    for (const w of ['Kho CFS', 'Kho ngoại quan', 'Kho đông lạnh', 'Kho thường']) await expect(web.getByRole('button', { name: w, exact: true }).last(), `Lựa chọn ${w}`).toBeVisible();
    for (const w of ['Kho CFS', 'Kho thường']) {
      const opt = web.getByRole('button', { name: w, exact: true }).last();
      if (!(await opt.isVisible())) await cfg.warehouseSelect(fresh).click();
      await opt.click();
    }
    await expect(cfg.warehouseSelect(fresh), 'Chọn được nhiều loại kho').toContainText(/Kho CFS[\s\S]*Kho thường|Kho thường[\s\S]*Kho CFS|2/);
    await cfg.warehouseSelect(fresh).click();
    await cfg.cancelButton.click();
    await expect(cfg.editButton, 'Về chế độ xem').toBeVisible();
    await expect(cfg.saveButton).toHaveCount(0);
    expect(await cfg.table.rows.allInnerTexts(), 'Dữ liệu không đổi sau Hủy').toEqual(before);
  });

  });

  test("UI-CFG-006 Thêm đầu mục mới", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ roles, browser }) => {

  const name = `AT Phí test ${TEST_RUN_ID}`.slice(0, 50);
  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.goto();
    await expect(cfg.serviceRow('Hải quan giám sát')).toBeVisible();
    const count0 = await cfg.itemCount('Hải quan giám sát');
    const card0 = await cfg.card('Tổng cấu hình giá thiết lập');
    await cfg.viewButton('Hải quan giám sát').click();
    await expect(cfg.table.rows.first()).toBeVisible();
    const codes0 = (await cfg.table.rows.allInnerTexts()).map(t => Number(t.match(/CS-(\d{3})/)?.[1] ?? 0));
    await cfg.editButton.click();
    await cfg.addRow(name, 'Phụ phí');
    const save = uiApi(web, /^(PUT|POST|PATCH|DELETE)$/, /\/api\/price-configurations/);
    await cfg.saveButton.click();
    expectStatusIn(await save, '200/204', 'Lưu cấu hình');
    await expect(web.getByText('Lưu cấu hình thành công')).toBeVisible();
    const row = cfg.itemRow(name);
    await expect(row).toBeVisible();
    const code = (await row.locator('td').nth(1).innerText()).trim();
    expect(code, 'ID dạng CS-NNN').toMatch(/^CS-\d{3}$/);
    expect(Number(code.slice(3)), 'ID tiếp theo sau các ID đã có').toBeGreaterThan(Math.max(...codes0));
    await expect(row).toContainText('Phụ phí');
    await expect(row).toContainText('Đang hoạt động');
    await cfg.goto();
    await expect(cfg.serviceRow('Hải quan giám sát')).toBeVisible();
    expect(await cfg.itemCount('Hải quan giám sát'), 'Số lượng đầu mục tăng 1').toBe(count0 + 1);
    expect(await cfg.card('Tổng cấu hình giá thiết lập'), 'Thẻ "Tổng cấu hình giá thiết lập" tăng 1').toBe(card0 + 1);
  });

  });

  test("UI-CFG-007 Gạt tắt đầu mục đang dùng hiện cảnh báo", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ testRun, roles, browser }) => {

  test.setTimeout(900_000);
  // Bộ giá riêng của case: đầu mục có dòng giá mua và nằm trong BGNB/BGKH, không đụng bộ P0 dùng chung.
  const base = await PF.flowBase(testRun, 'UI-CFG-007');
  const item = base.items.customsFee;
  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.openService('Khai báo hải quan');
    await cfg.editButton.click();
    const row = cfg.editRow(item.id);
    await expect(cfg.statusLabel(row)).toHaveText('Kích hoạt');
    await cfg.statusSwitch(row).click();
    await expect(web.getByText(/Đầu mục giá sẽ bị ẩn khỏi giá mua đầu vào, giá mua bán định mức và bị xóa hoàn toàn khỏi các báo giá\. Các dịch vụ bắt đầu thực hiện cũng không thể sử dụng đầu mục này\. Bạn chắc chắn muốn tiếp tục\?/)).toBeVisible();
    // Chỉ kiểm tra cảnh báo: không xác nhận, thoát chế độ sửa không lưu.
    await web.getByRole('dialog').last().getByRole('button', { name: /^(Hủy|Huỷ|Không)$/ }).click();
    await cfg.cancelButton.click();
    await expect(cfg.editButton).toBeVisible();
  });
  const after = (await CFGF.configOf(testRun, 'KHQ')).items.find((x: any) => x.id === item.id);
  expect(PF.stateCode(after?.status), 'Không lưu nên đầu mục vẫn ACTIVE').toBe('ACTIVE');

  });

  test("UI-CFG-008 Lưu bị chặn khi phiếu Đang/Đã thực hiện dùng đầu mục", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p1"] }, async ({ testRun, roles, browser }) => {

  test.setTimeout(900_000);
  // Bộ giá riêng + phiếu riêng: KHQ đang thực hiện có chi phí Phí ngoài giờ (thuộc đầu mục `overtime`).
  const base = await PF.flowBase(testRun, 'UI-CFG-008');
  const order = await ORD.p0Order(testRun, 'KHQ_COSTS', { base });
  const item = base.items.overtime;
  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.openService('Khai báo hải quan');
    await cfg.editButton.click();
    const row = cfg.editRow(item.id);
    await cfg.statusSwitch(row).click();
    await expect(web.getByText(/Đầu mục giá sẽ bị ẩn khỏi giá mua đầu vào, giá mua bán định mức và bị xóa hoàn toàn khỏi các báo giá\. Các dịch vụ bắt đầu thực hiện cũng không thể sử dụng đầu mục này\. Bạn chắc chắn muốn tiếp tục\?/)).toBeVisible();
    await web.getByRole('dialog').last().getByRole('button', { name: /^(Tiếp tục|Đồng ý|Xác nhận|Có)$/ }).click();
    await expect(cfg.statusLabel(row)).toHaveText('Dừng hoạt động');
    const save = uiApi(web, /^(PUT|POST|PATCH|DELETE)$/, /\/api\/price-configurations/);
    await cfg.saveButton.click();
    expectStatusIn(await save, '400/409/422', 'Lưu bị chặn');
    await expect(web.getByText(new RegExp(`Không thể tắt kích hoạt đầu mục giá ${esc(item.code)} - ${esc(item.name)}: đầu mục đang được sử dụng trong Chi phí của \\d+ Phiếu dịch vụ \\(.*${esc(order.code)}.*\\)`))).toBeVisible();
  });
  const after = (await CFGF.configOf(testRun, 'KHQ')).items.find((x: any) => x.id === item.id);
  expect(PF.stateCode(after?.status), 'Đầu mục giữ Đang hoạt động').toBe('ACTIVE');

  });

  test("UI-CFG-013 Nhật ký so sánh trước/sau", { tag: ["@ui", "@cau-hinh-dau-muc-gia", "@p3"] }, async ({ testRun, roles, browser }) => {

  // Phân hệ Kho bãi lưu 2 lần liên tiếp (thêm 2 đầu mục) để Nhật ký có phiên bản trước/sau.
  const a = await CFGF.createItem(testRun, 'KB', `AT Nhật ký trước ${TEST_RUN_ID}`, 'FIXED');
  const b = await CFGF.createItem(testRun, 'KB', `AT Nhật ký sau ${TEST_RUN_ID}`, 'SURCHARGE');
  await withQuotePage(browser, roles, 'k1', async web => {
    const cfg = new DauMucGiaPage(web);
    await cfg.openService('Kho bãi');
    const log = uiApi(web, 'GET', /\/api\/price-configurations\/[^/]+\/.+/);
    await cfg.logButton.click();
    expectStatusIn(await log, '200', 'Tải nhật ký');
    await expect(cfg.logPopup).toContainText(/Loại dịch vụ:\s*Kho bãi/);
    expect(await cfg.logVersions.count(), 'Có ít nhất 2 phiên bản').toBeGreaterThanOrEqual(2);
    const v0 = cfg.logVersions.nth(0);
    const v1 = cfg.logVersions.nth(1);
    await expect(v0).toContainText('Hiện tại');
    await expect(v1).toContainText('Phiên bản cũ');
    for (const v of [v0, v1]) {
      await expect(v, 'Thời gian').toContainText(/\d{2}:\d{2}:\d{2}, \d{2}\/\d{2}\/\d{4}/);
      await expect(v, 'Người thực hiện (thao tác tự động ghi "Hệ thống")').toContainText(/Người thao tác:\s*\S+/);
    }
    const heads = (await cfg.logPopup.locator('thead th').allInnerTexts()).map(h => h.trim().toUpperCase());
    expect(heads, 'Cột so sánh').toEqual(['STT', 'ID CẤU HÌNH', 'TÊN ĐẦU MỤC GIÁ CẤU HÌNH', 'LOẠI GIÁ', 'LOẠI KHO', 'TRẠNG THÁI']);
    // Sau: có cả 2 đầu mục; trước: chưa có đầu mục thứ 2
    await v0.click();
    await expect(cfg.logPopup.locator('tbody')).toContainText(b.name);
    await expect(cfg.logPopup.locator('tbody tr').filter({ hasText: b.name })).toContainText(/Phụ phí/);
    await expect(cfg.logPopup.locator('tbody tr').filter({ hasText: b.name })).toContainText(/Kho (thường|đông lạnh|ngoại quan|CFS)/);
    await expect(cfg.logPopup.locator('tbody tr').filter({ hasText: b.name })).toContainText(/Kích hoạt|Đang hoạt động/);
    await v1.click();
    await expect(cfg.logPopup.locator('tbody')).toContainText(a.name);
    await expect(cfg.logPopup.locator('tbody'), 'Phiên bản trước chưa có đầu mục thêm sau').not.toContainText(b.name);
  });

  });
});
