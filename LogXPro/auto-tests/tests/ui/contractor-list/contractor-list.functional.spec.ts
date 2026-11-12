import { test, expect } from '../../../src/fixtures/page.fixture';
import { data, items } from '../../../src/api/http.client';
import * as L from '../../../src/data/lead.factory';
import * as F from '../../../src/data/file.factory';
import { chooseOption, selectByLabel } from '../../../src/pages/components/filter-bar.component';
import { sha256, xlsxDataRows } from '../../../src/utils/file-check';
import { tagged } from '../../../src/utils/test-run';

async function codesOnTable(page: import('@playwright/test').Page): Promise<string[]> {
  await page.locator('main table tbody tr').first().waitFor();
  return (await page.locator('main table tbody tr a[href^="/suppliers/"]').allInnerTexts()).map((t) => t.trim());
}

test.describe("Danh sách và thêm mới nhà thầu", () => {
  test("UI-VDR-001 Mở màn danh sách nhà thầu", { tag: ["@ui", "@p1"] }, async ({ page, loginAs, contractorListPage: l }) => {
    await loginAs('qlnt');
    const res = page.waitForResponse((r) => /\/api\/contractors(\?|$)/.test(r.url()) && r.request().method() === 'GET');
    await l.goto();
    expect((await res).status()).toBe(200);
    for (const s of ['Tổng nhà thầu', 'Đang hoạt động', 'Tạo mới', 'Ngưng hoạt động', 'Dừng hợp tác']) await expect(page.locator('main').getByText(s, { exact: true }).first()).toBeVisible();
    await expect(l.filter.search).toBeVisible();
    await expect(l.filter.advancedButton).toBeVisible();
    await expect(l.addButton).toBeVisible();
    await expect(l.exportButton).toBeVisible();
    await expect(l.table.headers).toHaveText(['STT', 'MÃ NHÀ THẦU', 'TÊN NHÀ THẦU', 'MÃ SỐ THUẾ', 'PHÂN HẠNG', 'TRẠNG THÁI', 'KHU VỰC HOẠT ĐỘNG', 'NGÀY TẠO', 'THAO TÁC']);
  });

  test("UI-VDR-002 Lọc trạng thái, hạng, loại hình dịch vụ", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractorListPage: l }) => {
    test.setTimeout(180_000);
    await seed.contractor();
    await seed.contractorWithContract();
    await seed.terminatedContractor();
    await loginAs('qlnt');
    await l.goto();
    const sameAsApi = async (trigger: () => Promise<unknown>, param: RegExp) => {
      const res = page.waitForResponse((r) => /\/api\/contractors\?/.test(r.url()) && param.test(decodeURIComponent(r.url())) && r.request().method() === 'GET');
      await trigger();
      const query = Object.fromEntries(new URL((await res).url()).searchParams.entries());
      const api = await data(await http.call('GET /api/contractors', { token: roles.qlnt.accessToken, query }));
      await expect.poll(() => codesOnTable(page)).toEqual(items(api).map((c: any) => c.code));
      return { api, query };
    };
    const byStatus = await sameAsApi(() => chooseOption(l.filter.statusFilter, 'Tạo mới'), /status=/);
    for (const c of items(byStatus.api)) expect(JSON.stringify(c.status)).toMatch(/NEW/);
    // Loại hình dịch vụ trong Bộ lọc nâng cao.
    await l.filter.advancedButton.click();
    // Bộ lọc nâng cao có 2 ô chọn "Phân hạng" và "Loại dịch vụ" (cùng hiện "Tất cả"): chọn theo nhãn.
    await chooseOption(selectByLabel(l.filter.drawer, 'Loại dịch vụ'), 'Vận tải');
    const both = await sameAsApi(() => l.filter.applyButton.click(), /serviceType=/);
    expect(both.query.serviceType, 'Lọc loại dịch vụ Vận tải').toBe('TRANSPORT');
    expect.soft(both.query.status, 'Giữ bộ lọc trạng thái Tạo mới khi áp dụng thêm loại dịch vụ').toBeTruthy();
    for (const c of items(both.api)) expect.soft(JSON.stringify(c.serviceTypes ?? c.serviceType), `${c.code} có loại dịch vụ Vận tải`).toMatch(/TRANSPORT|Vận tải/);
  });

  test("UI-VDR-004 Tạo nhà thầu thành công", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, contractorFormPage: f }) => {
    await loginAs('qlnt');
    await f.goto();
    const tax = L.taxCode();
    await f.fill({ name: tagged('Công ty TNHH Vận tải Hữu Nghị'), taxCode: tax });
    const res = await f.submit();
    expect(res?.status()).toBe(201);
    const created = (await res!.json()).data;
    await expect(page).toHaveURL(new RegExp(`/suppliers/${created.id}`));
    await expect(page.locator('main')).toContainText(/VDR-\d+/);
    await expect(page.locator('main')).toContainText('Tạo mới');
    const [saved] = await seed.contractorsByTax(tax);
    expect(saved.code).toMatch(/^VDR-\d+$/);
  });

  test("UI-VDR-005 MST trùng", { tag: ["@ui", "@p2"] }, async ({ seed, loginAs, contractorFormPage: f }) => {
    const old = await seed.contractor();
    await loginAs('qlnt');
    await f.goto();
    await f.fill({ taxCode: old.taxCode });
    const res = await f.submit();
    // User chốt 2026-11-05: 400 (dữ liệu không hợp lệ) hoặc 409 đều đạt.
    expect([400, 409]).toContain(res?.status());
    await expect(f.page.getByText(/đã tồn tại|đã được sử dụng/i).first()).toBeVisible();
    await expect(f.page.getByText(old.code).first(), 'Thông báo kèm mã nhà thầu cũ').toBeVisible();
    expect(await seed.contractorsByTax(old.taxCode)).toHaveLength(1);
  });

  test("UI-VDR-006 Xuất Excel danh sách", { tag: ["@ui", "@p3"] }, async ({ page, seed, http, roles, loginAs, contractorListPage: l }) => {
    const c = await seed.contractor();
    await loginAs('qlnt');
    await l.goto();
    const listRes = page.waitForResponse((r) => /\/api\/contractors\?/.test(r.url()) && r.request().method() === 'GET');
    await l.filter.search.fill(c.taxCode);
    const query = Object.fromEntries(new URL((await listRes).url()).searchParams.entries());
    const total = (await data(await http.call('GET /api/contractors', { token: roles.qlnt.accessToken, query }))).meta?.pagination?.total;
    const dl = page.waitForEvent('download');
    await l.exportButton.click();
    const file = await dl;
    expect(file.suggestedFilename()).toMatch(/\.xlsx$/i);
    const buf = Buffer.from(await (await import('fs')).promises.readFile((await file.path())!));
    expect((await xlsxDataRows(buf)).rows, 'Số dòng bằng số bản ghi đang lọc').toBe(total);
  });

  test("UI-VDR-008 Phân vùng tài liệu nhà thầu ở form tạo và màn chi tiết", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractorFormPage: f }) => {
    test.setTimeout(900_000);
    await loginAs('qlnt');
    const variants: [string, { name: string; mimeType: string; buffer: Buffer }, boolean][] = [
      // File thật trong UPLOAD_FILES_DIR (10MB đúng giới hạn, 11MB vượt, 1MB định dạng không hỗ trợ).
      ['đúng 10MB PDF', F.REAL.pdf10(), true],
      ['đúng 10MB DOCX', F.REAL.docx10(), true],
      ['đúng 10MB JPG', F.REAL.jpg10(), true],
      ['đúng 10MB PNG', F.REAL.png10(), true],
      ['đúng 10MB XLSX', F.REAL.xlsx10(), true],
      ['đúng 10MB ZIP', F.REAL.zip10(), true],
      ['sai loại EXE', F.REAL.other('exe'), false],
      ['sai loại MP4', F.REAL.other('mp4'), false],
      ['đổi đuôi (exe thành .pdf)', F.fakePdf(), false],
      ['0 byte', F.empty('rong.pdf'), false],
      ['ngay dưới 10MB', F.pdfMb(10, -1, 'duoi-10mb.pdf'), true],
      ['vượt 10MB (11MB PDF)', F.REAL.pdf11(), false],
      ['vượt 10MB (11MB ZIP)', F.REAL.zip11(), false],
    ];
    for (const [label, file, ok] of variants) {
      await f.goto();
      const tax = L.taxCode();
      await f.fill({ taxCode: tax });
      await f.fileInput.setInputFiles(file);
      // Web tạo nhà thầu (POST /api/contractors) rồi mới tải file bằng request riêng POST .../documents: chờ request đó.
      const upload = page.waitForResponse((r) => r.request().method() === 'POST' && /\/documents$/.test(r.url()), { timeout: 15_000 }).catch(() => null);
      const res = await f.submit();
      await upload;
      const [saved] = await seed.contractorsByTax(tax);
      const docs = saved ? (await seed.getContractor(saved.id)).documents ?? [] : [];
      const found = docs.find((d: any) => (d.filename ?? d.name) === file.name);
      if (ok) {
        expect.soft(found, `${label}: tài liệu được lưu`).toBeTruthy();
        if (found) {
          const r = await http.call('GET /api/contractors/{id}/documents/{documentId}', { token: roles.qlnt.accessToken, params: { id: saved.id, documentId: found.id } });
          expect.soft(sha256(Buffer.from(await r.body())), `${label}: tải lại đúng nội dung`).toBe(sha256(file.buffer));
        }
      } else {
        expect.soft(found, `${label}: không tạo tài liệu`).toBeFalsy();
        if (!found && !res) await expect.soft(page.getByText(/định dạng|dung lượng|10MB|không hợp lệ|không hỗ trợ/i).filter({ visible: true }).first(), `${label}: chỉ rõ lý do`).toBeVisible();
      }
    }
  });
});
