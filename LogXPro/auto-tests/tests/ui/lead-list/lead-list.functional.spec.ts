import { test, expect } from '../../../src/fixtures/page.fixture';
import { data, items } from '../../../src/api/http.client';
import { chooseOption } from '../../../src/pages/components/filter-bar.component';
import { tagged } from '../../../src/utils/test-run';

/** Mã Lead đang hiện trên bảng (cột MÃ LEAD là link /leads/{id}). */
async function codesOnTable(page: import('@playwright/test').Page): Promise<string[]> {
  await page.locator('main table tbody tr').first().waitFor();
  return (await page.locator('main table tbody tr a[href^="/leads/"]').allInnerTexts()).map((t) => t.trim());
}

test.describe("Danh sách Lead", () => {
  test("UI-LEAD-001 Mở màn danh sách Lead", { tag: ["@ui", "@p1"] }, async ({ page, loginAs, leadListPage }) => {
    await loginAs('nvkdA');
    const listRes = page.waitForResponse((r) => /\/api\/leads(\?|$)/.test(r.url()) && r.request().method() === 'GET');
    await leadListPage.goto();
    expect((await listRes).status()).toBe(200);
    await expect(page.locator('main').getByText(/Tổng số lead/)).toBeVisible();
    await expect(leadListPage.filter.search).toBeVisible();
    await expect(leadListPage.filter.advancedButton).toBeVisible();
    await expect(leadListPage.addButton).toBeVisible();
    await expect(leadListPage.importButton).toBeVisible();
    await expect(leadListPage.exportButton).toBeVisible();
    await expect(leadListPage.table.headers).toHaveText(['STT', 'MÃ LEAD', 'TÊN DOANH NGHIỆP', 'NGÀY TẠO', 'TRẠNG THÁI', 'THAO TÁC']);
  });

  test("UI-LEAD-002 Tìm kiếm, lọc, phân trang", { tag: ["@ui", "@p1"] }, async ({ page, seed, http, roles, loginAs, leadListPage }) => {
    const name = tagged('Công ty Tìm kiếm Lead');
    const lead = await seed.lead('nvkdA', { companyName: name });
    const token = roles.nvkdA.accessToken;
    await loginAs('nvkdA');
    await leadListPage.goto();


    // Bảng khớp GET /api/leads với đúng tham số web vừa gửi.
    // Chỉ nhận response có đúng tham số vừa đổi (tránh bắt nhầm response tìm kiếm cũ đến trễ do debounce).
    const sameAsApi = async (trigger: () => Promise<unknown>, param: RegExp) => {
      const res = page.waitForResponse((r) => /\/api\/leads\?/.test(r.url()) && param.test(decodeURIComponent(r.url())) && r.request().method() === 'GET');
      await trigger();
      const url = new URL((await res).url());
      const query = Object.fromEntries(url.searchParams.entries());
      const api = await data(await http.call('GET /api/leads', { token, query }));
      await expect.poll(() => codesOnTable(page)).toEqual(items(api).map((l: any) => l.code));
      return { api, query };
    };

    const s = await sameAsApi(() => leadListPage.filter.search.fill(name), /search=/);
    expect(items(s.api).map((l: any) => l.code)).toContain(lead.code);
    // Lead mới nhất ở đầu: thứ tự ngày tạo giảm dần (test song song cũng tạo Lead nên không so với 1 mã cố định).
    const all = await sameAsApi(() => leadListPage.filter.search.fill(''), /[?&]page=1/);
    const created = items(all.api).map((l: any) => Date.parse(l.createdAt));
    expect(created).toEqual([...created].sort((a, b) => b - a));
    await leadListPage.filter.search.fill('');

    for (const status of ['Đang hoạt động', 'Ngưng hoạt động']) {
      const f = await sameAsApi(() => chooseOption(leadListPage.filter.statusFilter, status), /status=/);
      for (const l of items(f.api)) expect(l.status?.name ?? l.status).toMatch(new RegExp(status === 'Đang hoạt động' ? 'ACTIVE|Đang hoạt động' : 'INACTIVE|Ngưng hoạt động'));
    }
    await chooseOption(leadListPage.filter.statusFilter, 'Tất cả trạng thái');

    const p2 = await sameAsApi(() => leadListPage.table.nextPage.click(), /[?&]page=2/);
    expect(Number(p2.query.page)).toBe(2);
    const totalPages = p2.api.meta?.pagination?.totalPages;
    await expect(leadListPage.table.pageButton(totalPages)).toBeVisible();
  });

  test("UI-LEAD-003 Ô số liệu khớp API", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, leadListPage }) => {
    await seed.lead();
    await seed.inactiveLead();
    await seed.customer();
    await loginAs('nvkdA');
    await leadListPage.goto();
    await expect(page.locator('main').getByText(/Tổng số lead:?\s*\d/i)).toBeVisible();
    const shown = await leadListPage.stats();
    const api = await data(await http.call('GET /api/leads/stats', { token: roles.nvkdA.accessToken }));
    const apiNumbers = Object.values(api).filter((v) => typeof v === 'number');
    // SRS UC Xem danh sách Lead: 3 ô Tổng số Lead, Lead Đang hoạt động, Lead Ngưng hoạt động.
    for (const label of [/Tổng số lead/i, /Đang hoạt động/i, /Ngưng hoạt động/i]) expect.soft(Object.keys(shown).some((k) => label.test(k)), `Ô ${label.source}; web đang hiện: ${JSON.stringify(shown)}`).toBe(true);
    for (const [label, value] of Object.entries(shown)) expect.soft(apiNumbers, `Ô "${label}" = ${value} phải bằng 1 giá trị của /api/leads/stats ${JSON.stringify(api)}`).toContain(value);
  });

  test("UI-LEAD-004 Import và xuất Excel", { tag: ["@ui", "@p2"] }, async ({ page, seed, loginAs, leadListPage }) => {
    const file = await seed.importFile([{}, {}, { taxCode: '12345' }]);
    await loginAs('nvkdA');
    await leadListPage.goto();
    await leadListPage.importButton.click();
    const template = page.waitForEvent('download');
    await leadListPage.importTemplateButton.click();
    expect((await template).suggestedFilename()).toMatch(/\.xlsx$/i);
    await leadListPage.modal.dialog.locator('input[type=file]').setInputFiles(file);
    const importRes = page.waitForResponse((r) => /\/api\/leads\/import/.test(r.url()));
    await leadListPage.importSubmit.click();
    expect((await importRes).status()).toBe(200);
    const result = page.locator('body');
    // Màn kết quả trên web: ô "Đã tạo mới" (thành công), "Lỗi cấu trúc" (lỗi) và danh sách "Dòng N: ...".
    await expect(result).toContainText(/Đã tạo mới\s*\+?2(?!\d)/);
    await expect(result).toContainText(/Lỗi cấu trúc\s*1(?!\d)/);
    await expect(result).toContainText(/Dòng\s*\d+/);

    await leadListPage.modal.button('Hoàn tất & Đóng').click();
    const exported = page.waitForEvent('download');
    await leadListPage.exportButton.click();
    expect((await exported).suggestedFilename()).toMatch(/\.xlsx$/i);
  });
});
