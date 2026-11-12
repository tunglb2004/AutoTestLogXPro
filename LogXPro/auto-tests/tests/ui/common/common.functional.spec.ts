import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures/page.fixture';
import * as L from '../../../src/data/lead.factory';
import { xlsxDataRows } from '../../../src/utils/file-check';
import { tagged } from '../../../src/utils/test-run';

const P = 10; // kích thước trang mặc định của web

async function leadCodes(page: Page): Promise<string[]> {
  await page.waitForLoadState('networkidle');
  return (await page.locator('main table tbody tr a[href^="/leads/"]').allInnerTexts()).map((t) => t.trim());
}

test.describe("Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module", () => {
  test("UI-COM-001 Biên phân trang danh sách và lịch sử", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, leadListPage: l, leadDetailPage: d }) => {
    test.setTimeout(480_000);
    // Tập seed P + 1 Lead cùng nhãn: biết trước mã, mới nhất ở đầu.
    const tag = tagged('Phân trang');
    const seeded: string[] = [];
    for (let i = 0; i < P + 1; i++) seeded.unshift((await seed.lead('nvkdA', { companyName: `${tag} số ${i + 1}` })).code);
    await loginAs('nvkdA');
    await l.goto();

    await test.step('P + 1 bản ghi, 10 dòng/trang: trang 1 đủ P, trang cuối 1 dòng', async () => {
      await l.filter.search.fill(tag);
      await expect.poll(() => leadCodes(page)).toEqual(seeded.slice(0, P));
      await l.table.nextPage.click();
      await expect.poll(() => leadCodes(page)).toEqual(seeded.slice(P));
      await expect(l.table.nextPage).toBeDisabled();
    });

    await test.step('Đổi số dòng 20, 50, 100: 1 trang đủ P + 1', async () => {
      for (const size of ['20', '50', '100']) {
        await l.table.pageSize.selectOption(size);
        await expect.poll(() => leadCodes(page), `${size} dòng/trang`).toEqual(seeded);
      }
      await l.table.pageSize.selectOption(String(P));
    });

    await test.step('P và P − 1 bản ghi: đúng 1 trang, không có trang sau', async () => {
      for (const n of [P, P - 1]) {
        const group = tagged(`Nhóm ${n} bản ghi`);
        const codes: string[] = [];
        for (let i = 0; i < n; i++) codes.unshift((await seed.lead('nvkdA', { companyName: `${group} số ${i + 1}` })).code);
        await l.filter.search.fill(group);
        await expect.poll(() => leadCodes(page), `${n} bản ghi`).toEqual(codes);
        await expect(l.table.nextPage).toBeDisabled();
      }
    });

    await test.step('1 bản ghi và 0 bản ghi', async () => {
      const one = seeded[0];
      await l.filter.search.fill(one);
      await expect.poll(() => leadCodes(page)).toEqual([one]);
      await l.filter.search.fill(`${tag} không tồn tại`);
      await expect.poll(() => leadCodes(page)).toEqual([]);
      await expect(page.locator('main').getByText(/Không có dữ liệu|Chưa có|Không tìm thấy/i).first(), 'Trạng thái rỗng').toBeVisible();
    });

    await test.step('Reset bộ lọc đưa về trang hợp lệ', async () => {
      await l.filter.search.fill(tag);
      await l.table.nextPage.click();
      await l.filter.search.fill('');
      await expect(l.table.rows.first()).toBeVisible();
      await expect(l.table.pageButton(1)).toBeVisible();
    });

    await test.step('Lịch sử thao tác: P + 1 bản ghi phân trang đúng', async () => {
      const lead = await seed.lead();
      for (let i = 0; i < P; i++) await http.call('POST /api/leads/{id}/contacts', { token: roles.nvkdA.accessToken, params: { id: lead.id }, json: L.contactBody() });
      const history = await seed.history('/api/leads', lead.id, 'nvkdA');
      expect(history.length).toBeGreaterThanOrEqual(P + 1);
      await d.goto(lead.id);
      await d.history.click();
      await expect(d.historyRows).toHaveCount(P);
      await expect(d.modal.dialog).toContainText(`${history.length} bản ghi`);
      await d.historyPageSize.selectOption('20');
      await expect(d.historyRows).toHaveCount(Math.min(20, history.length));
    });
  });

  test("UI-COM-002 Biên bộ lọc ngày và từ khóa", { tag: ["@ui", "@p2"] }, async ({ page, seed, loginAs, leadListPage: l }) => {
    const tag = tagged('Lọc ngày');
    const lead = await seed.lead('nvkdA', { companyName: `${tag} Vận tải` });
    await loginAs('nvkdA');
    await l.goto();

    await test.step('Từ khóa rỗng, khớp một phần, không khớp', async () => {
      await l.filter.search.fill('');
      await expect(l.table.rows.first()).toBeVisible();
      await l.filter.search.fill(tag.slice(0, Math.max(6, tag.length - 4)));
      await expect.poll(() => leadCodes(page)).toContain(lead.code);
      await l.filter.search.fill(`${tag} không khớp`);
      await expect.poll(() => leadCodes(page)).toEqual([]);
      await l.filter.search.fill(tag);
    });

    await test.step('Ngày tạo: Hôm nay (từ = đến = ngày tạo) có bản ghi, Hôm qua (ngay trước biên) không có', async () => {
      for (const [preset, has] of [['Hôm nay', true], ['Hôm qua', false]] as const) {
        await l.filter.advancedButton.click();
        await l.filter.datePreset(preset);
        await l.filter.applyButton.click();
        if (has) await expect.poll(() => leadCodes(page), preset).toContain(lead.code);
        else await expect.poll(() => leadCodes(page), preset).not.toContain(lead.code);
      }
    });

    await test.step('Đặt lại hiện lại đúng bản ghi trong phạm vi người dùng', async () => {
      await l.filter.advancedButton.click();
      await l.filter.resetButton.click();
      await l.filter.applyButton.click().catch(() => undefined);
      await expect.poll(() => leadCodes(page)).toContain(lead.code);
    });
  });

  test("UI-COM-003 Xuất Excel theo kết quả lọc", { tag: ["@ui", "@p2"] }, async ({ page, seed, loginAs, leadListPage: l }) => {
    test.setTimeout(300_000);
    const tag = tagged('Xuất file');
    for (let i = 0; i < P + 2; i++) await seed.lead('nvkdA', { companyName: `${tag} số ${i + 1}` });
    await loginAs('nvkdA');
    await l.goto();
    const exportRows = async () => {
      const dl = page.waitForEvent('download', { timeout: 10_000 }).catch(() => null);
      await l.exportButton.click();
      const file = await dl;
      if (!file) return null;
      expect(file.suggestedFilename()).toMatch(/\.xlsx$/i);
      const buf = await (await import('fs')).promises.readFile((await file.path())!);
      return xlsxDataRows(Buffer.from(buf));
    };
    await l.filter.search.fill(tag);
    await expect.poll(() => leadCodes(page)).toHaveLength(P);
    const many = await exportRows();
    expect(many?.rows, 'Gồm toàn bộ bản ghi theo bộ lọc, không chỉ trang đang xem').toBe(P + 2);
    expect(many?.header.join('|')).toMatch(/Mã|MST|Mã số thuế|Tên/i);

    await l.filter.search.fill(`${tag} số 1`);
    await page.waitForLoadState('networkidle');
    const onePage = await exportRows();
    expect(onePage?.rows).toBe((await leadCodes(page)).length);

    await l.filter.search.fill(`${tag} không có kết quả`);
    await expect.poll(() => leadCodes(page)).toEqual([]);
    const empty = await exportRows();
    if (empty) expect(empty.rows, 'Kết quả rỗng không tải nhầm dữ liệu').toBe(0);
    else await expect(page.getByText(/không có dữ liệu/i).first()).toBeVisible();
  });
});
