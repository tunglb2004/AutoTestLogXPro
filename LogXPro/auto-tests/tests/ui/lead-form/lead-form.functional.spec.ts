import { test, expect } from '../../../src/fixtures/page.fixture';
import { body, data, items } from '../../../src/api/http.client';
import * as L from '../../../src/data/lead.factory';
import * as F from '../../../src/data/file.factory';
import { chooseOption, optionTexts } from '../../../src/pages/components/filter-bar.component';
import { sha256 } from '../../../src/utils/file-check';
import { tagged } from '../../../src/utils/test-run';

const BASE = { industries: ['Logistics'], source: 'Giới thiệu', route: 'Nội địa' };

async function ownerName(http: any, roles: any, key: 'nvkdA' | 'nvkdB'): Promise<string | undefined> {
  const owners = items(await data(await http.call('GET /api/leads/assignable-owners', { token: roles.nvkdA.accessToken })));
  const o = owners.find((x: any) => x.id === roles[key].userId || x.userId === roles[key].userId);
  return o?.displayName ?? o?.fullName ?? o?.name;
}

test.describe("Thêm mới và chi tiết Lead", () => {
  test("UI-LEADF-003 Tạo Lead thành công", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, leadFormPage: f }) => {
    await loginAs('nvkdA');
    const tax = L.taxCode();
    await f.goto();
    await f.fillCompany({ name: tagged('Công ty Tạo Lead UI'), taxCode: tax, address: L.address(), ...BASE });
    await f.next.click();
    await f.fillContact(0, { name: L.personName(), phone: L.phone(), email: 'lienhe.mot@example.vn' });
    await f.addContact.click();
    await f.fillContact(1, { name: L.personName(), phone: L.phone() });
    // Chọn người liên hệ 2 làm đầu mối chính.
    await f.primarySwitch(1).click();
    await expect(f.primarySwitch(1)).toHaveAttribute('aria-checked', 'true');
    await expect(f.primarySwitch(0)).toHaveAttribute('aria-checked', 'false');
    const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/leads$/.test(new URL(r.url()).pathname));
    await f.save.click();
    expect([200, 201]).toContain((await res).status());
    const created = (await (await res).json()).data;
    await expect(page).toHaveURL(new RegExp(`/leads/${created.id}`));
    await expect(page.locator('main')).toContainText(/LED-\d+/);
    const lead = await seed.getLead(created.id);
    expect(lead.code).toMatch(/^LED-\d+$/);
    expect(lead.contacts).toHaveLength(2);
    expect(lead.contacts.filter((c: any) => c.primary)).toHaveLength(1);
    const [list] = await seed.leadsByTax(tax);
    expect(list.id).toBe(created.id);
  });

  test("UI-LEADF-004 Thông báo thành công và lỗi MST trùng", { tag: ["@ui", "@p1"] }, async ({ seed, loginAs, leadFormPage: f }) => {
    await loginAs('nvkdA');
    const tax = L.taxCode();
    const first = await f.create({ name: tagged('Công ty MST lần 1'), taxCode: tax, ...BASE }, { name: L.personName(), phone: L.phone() });
    expect([200, 201]).toContain(first?.status());
    await expect(f.toast.message.filter({ hasText: /thành công/i }).first()).toBeVisible();

    const name2 = tagged('Công ty MST lần 2');
    const second = await f.create({ name: name2, taxCode: tax, ...BASE }, { name: L.personName(), phone: L.phone() });
    expect(second?.status()).toBe(409);
    await expect(f.page.getByText(/đã tồn tại|đã được sử dụng/i).first()).toBeVisible();
    await expect(f.contactName(0), 'Form giữ dữ liệu đã nhập').toBeVisible();
    await f.back.click();
    await expect(f.companyName).toHaveValue(name2);
    await expect(f.taxCode).toHaveValue(tax);
    expect(await seed.leadsByTax(tax)).toHaveLength(1);
  });

  test("UI-LEADF-006 Ngưng Lead bắt buộc lý do", { tag: ["@ui", "@p2"] }, async ({ page, seed, loginAs, leadDetailPage: d }) => {
    const lead = await seed.lead();
    await loginAs('nvkdA');
    await d.goto(lead.id);
    await d.deactivate.click();
    const calls: string[] = [];
    page.on('request', (r) => r.url().includes('/deactivate') && calls.push(r.url()));
    await d.modal.confirm.click();
    await expect(d.modal.dialog, 'Thiếu lý do thì không xác nhận được').toBeVisible();
    expect(calls).toEqual([]);
    await d.modal.reason.fill('Khách tạm dừng nhu cầu vận chuyển');
    const res = page.waitForResponse((r) => r.url().includes('/deactivate'));
    await d.modal.confirm.click();
    expect((await res).status()).toBe(200);
    await expect(d.main).toContainText('Ngưng hoạt động');
    expect(JSON.stringify((await seed.getLead(lead.id)).status)).toMatch(/INACTIVE/);
  });

  test("UI-LEADF-007 Chuyển người phụ trách Lead", { tag: ["@ui", "@p1"] }, async ({ page, seed, http, roles, loginAs, leadDetailPage: d, leadListPage }) => {
    const lead = await seed.lead();
    const nameB = await ownerName(http, roles, 'nvkdB');
    const nameA = await ownerName(http, roles, 'nvkdA');
    expect(nameB, 'NVKD B phải có trong danh sách người nhận').toBeTruthy();
    await loginAs('nvkdA');
    await d.goto(lead.id);
    await d.transfer.click();
    // User chốt 2026-11-05: nút không cần vô hiệu; bấm Xác nhận khi thiếu thì phải báo yêu cầu và không gọi API.
    const calls: string[] = [];
    page.on('request', (r) => r.method() !== 'GET' && /\/api\/leads\/[^/]+\/(transfer|owner)/.test(r.url()) && calls.push(r.url()));
    await d.modal.confirm.click();
    await expect.soft(d.toast.fieldErrors.filter({ hasText: 'Vui lòng chọn người phụ trách mới' }), 'Chưa chọn người').toBeVisible();
    await expect.soft(d.toast.fieldErrors.filter({ hasText: 'Vui lòng nhập lý do' }), 'Chưa nhập lý do').toBeVisible();
    const opts = await optionTexts(d.newOwner);
    expect(opts).toContain(nameB);
    if (nameA) expect(opts, 'Không có NVKD A đang phụ trách').not.toContain(nameA);
    await chooseOption(d.newOwner, nameB!);
    await d.modal.confirm.click();
    await expect.soft(d.toast.fieldErrors.filter({ hasText: 'Vui lòng nhập lý do' }), 'Đã chọn người nhưng chưa nhập lý do').toBeVisible();
    expect(calls, 'Thiếu dữ liệu thì không gọi API chuyển').toEqual([]);
    await d.modal.reason.fill('Phân lại địa bàn');
    const res = page.waitForResponse((r) => /\/api\/leads\/[^/]+\/(transfer|owner)/.test(r.url()));
    await d.modal.confirm.click();
    expect((await res).status()).toBe(204);
    await expect(d.toast.message.filter({ hasText: /thành công/i }).first()).toBeVisible();

    await leadListPage.goto();
    await leadListPage.filter.search.fill(lead.taxCode);
    await expect(leadListPage.table.rows.filter({ hasText: lead.code })).toHaveCount(0);
    const asB = await http.call('GET /api/leads/{id}', { token: roles.nvkdB.accessToken, params: { id: lead.id } });
    expect(asB.status()).toBe(200);
    expect((await body(asB)).data.ownerUserId).toBe(roles.nvkdB.userId);
    const notif = await http.call('GET /api/notifications', { token: roles.nvkdB.accessToken, query: { page: 1, perPage: 20 } });
    expect.soft(notif.status(), 'NVKD B có thông báo').toBe(200);
    if (notif.ok()) expect.soft(JSON.stringify(await body(notif)), 'Thông báo nhắc tới Lead được chuyển').toMatch(new RegExp(`${lead.code}|${lead.companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  });

  test("UI-LEADF-009 Đính kèm tài liệu quá dung lượng", { tag: ["@ui", "@p2"] }, async ({ page, seed, loginAs, leadDetailPage: d, leadFormPage: f }) => {
    const lead = await seed.lead();
    await loginAs('nvkdA');
    await d.goto(lead.id);
    await d.edit.click();
    const res = page.waitForResponse((r) => /\/documents/.test(r.url()) && r.request().method() === 'POST', { timeout: 8_000 }).catch(() => null);
    await f.fileInput.setInputFiles(F.REAL.pdf11());
    await expect(page.getByText(/10\s?MB/i).filter({ visible: true }).first()).toBeVisible();
    const r = await res;
    if (r) expect([400, 413]).toContain(r.status());
    expect((await seed.getLead(lead.id)).documents ?? []).toHaveLength(0);
  });

  test("UI-LEADF-014 Đầu mối chính khi thêm, đổi và xóa trên UI", { tag: ["@ui", "@p2"] }, async ({ page, seed, loginAs, leadDetailPage: d }) => {
    const one = await seed.leadWithContacts(1);
    const two = await seed.leadWithContacts(2);
    await loginAs('nvkdA');
    const primaries = async (id: string) => (await seed.getLead(id)).contacts.filter((c: any) => c.primary);

    // Đổi đầu mối chính.
    await d.goto(two.id);
    const secondary = two.contacts.find((c: any) => !c.primary);
    await d.setPrimary.first().click();
    await d.modal.confirm.click();
    await expect.poll(async () => (await primaries(two.id)).map((c: any) => c.id)).toEqual([secondary.id]);

    // Xóa đầu mối chính khi còn 2: đầu mối còn lại thành chính.
    await d.goto(two.id);
    const cards = await seed.getLead(two.id);
    const primaryIndex = cards.contacts.findIndex((c: any) => c.primary);
    await d.deleteContact(primaryIndex).click();
    await d.modal.button('Xoá đầu mối').click();
    await expect.poll(async () => (await seed.getLead(two.id)).contacts.length).toBe(1);
    expect(await primaries(two.id)).toHaveLength(1);

    // Xóa đầu mối cuối bị chặn và hiển thị lý do.
    await d.goto(one.id);
    const del = d.deleteContact(0);
    if ((await del.count()) && (await del.isEnabled())) {
      const res = page.waitForResponse((r) => r.request().method() === 'DELETE', { timeout: 5_000 }).catch(() => null);
      await del.click();
      if (await d.modal.button('Xoá đầu mối').isVisible().catch(() => false)) await d.modal.button('Xoá đầu mối').click();
      const r = await res;
      if (r) expect([400, 409]).toContain(r.status());
      await expect(page.getByText(/ít nhất|cuối|không thể xóa|không thể xoá/i).first()).toBeVisible();
    }
    expect((await seed.getLead(one.id)).contacts).toHaveLength(1);
  });

  test("UI-LEADF-016 Phân vùng file import Lead và tài liệu đính kèm", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, leadListPage, leadDetailPage: d, leadFormPage: f }) => {
    test.setTimeout(300_000);
    await loginAs('nvkdA');
    // File mẫu người dùng cung cấp (Mau_Nhap_Lead.xlsx): file import đúng cấu trúc dựng từ file này.
    const template = await seed.importTemplateForUpload();
    const dupTax = (await seed.lead()).taxCode;

    const importOnce = async (file: { name: string; mimeType: string; buffer: Buffer }) => {
      await leadListPage.goto();
      await leadListPage.importButton.click();
      await leadListPage.modal.dialog.locator('input[type=file]').setInputFiles(file);
      const res = page.waitForResponse((r) => /\/api\/leads\/import/.test(r.url()), { timeout: 15_000 }).catch(() => null);
      if (await leadListPage.importSubmit.isEnabled()) await leadListPage.importSubmit.click();
      return res;
    };

    await test.step('Import: 0 dòng, 1 dòng, trộn hợp lệ–lỗi–trùng, toàn dòng lỗi', async () => {
      const zero = await importOnce(F.xlsx(await L.importFile(template, []), 'import-0-dong.xlsx'));
      if (zero) expect.soft([200, 400]).toContain(zero.status());
      const oneTax = L.taxCode();
      const one = await importOnce(await seed.importFile([{ taxCode: oneTax }]));
      expect.soft(one?.status()).toBe(200);
      expect.soft(await seed.leadsByTax(oneTax), '1 dòng hợp lệ tạo 1 Lead').toHaveLength(1);
      const okTax = L.taxCode();
      const mixed = await importOnce(await seed.importFile([{ taxCode: okTax }, { taxCode: '123' }, { taxCode: dupTax }]));
      expect.soft(mixed?.status()).toBe(200);
      await expect.soft(page.locator('body')).toContainText(/Đã tạo mới\s*\+?1(?!\d)/);
      expect.soft(await seed.leadsByTax(okTax)).toHaveLength(1);
      expect.soft(await seed.leadsByTax(dupTax), 'Dòng trùng không tạo Lead mới').toHaveLength(1);
      const allBadTax = [L.taxCode(), L.taxCode()];
      await importOnce(await seed.importFile(allBadTax.map((t) => ({ taxCode: t, companyName: '' }))));
      for (const t of allBadTax) expect.soft(await seed.leadsByTax(t), 'Toàn dòng lỗi không tạo Lead').toHaveLength(0);
    });

    await test.step('Lỗi cấp file (sai cấu trúc cột, sai loại file) không tạo Lead nào', async () => {
      const bad = await importOnce(F.REAL.other('csv'));
      if (bad) expect.soft([400, 415]).toContain(bad.status());
      const ExcelJS = (await import('exceljs')).default;
      const wb = new ExcelJS.Workbook();
      const wrongTax = L.taxCode();
      wb.addWorksheet('Danh sách').addRows([['Mặt hàng', 'Số lượng', 'Ghi chú'], ['Nông sản', '12', wrongTax]]);
      const wrongCols = await importOnce(F.xlsx(Buffer.from(await wb.xlsx.writeBuffer()), 'sai-cau-truc.xlsx'));
      if (wrongCols) expect.soft(wrongCols.status()).toBe(400);
      expect.soft(await seed.leadsByTax(wrongTax), 'File sai cấu trúc không tạo Lead').toHaveLength(0);
    });

    await test.step('Đính kèm (file thật của bộ test): hợp lệ, sai loại, 0 byte, đúng 10MB, vượt 10MB', async () => {
      const lead = await seed.lead();
      // File thật trong UPLOAD_FILES_DIR; 0 byte tự sinh (bộ file không có), 10MB − 1 byte giữ file tự sinh có nội dung.
      const variants: [string, { name: string; mimeType: string; buffer: Buffer }, boolean][] = [
        ['hợp lệ DOCX 10MB', F.REAL.docx10(), true],
        ['sai loại EXE', F.REAL.other('exe'), false],
        ['sai loại MP4', F.REAL.other('mp4'), false],
        ['0 byte', F.empty(), false],
        ['10MB − 1 byte', F.pdfMb(10, -1, 'duoi-10mb.pdf'), true],
        ['đúng 10MB PDF', F.REAL.pdf10(), true],
        ['đúng 10MB XLSX', F.REAL.xlsx10(), true],
        ['đúng 10MB PNG', F.REAL.png10(), true],
        ['đúng 10MB JPG', F.REAL.jpg10(), true],
        ['vượt 10MB (11MB PDF)', F.REAL.pdf11(), false],
        ['vượt 10MB (11MB DOCX)', F.REAL.docx11(), false],
      ];
      for (const [label, file, ok] of variants) {
        await d.goto(lead.id);
        await d.edit.click();
        await f.fileInput.setInputFiles(file);
        // Web lưu thông tin rồi tải file bằng request riêng POST /documents: chờ request đó (nếu web gửi) rồi mới đọc lại.
        const upload = page.waitForResponse((r) => r.request().method() === 'POST' && /\/documents$/.test(r.url()), { timeout: 15_000 }).catch(() => null);
        await f.saveEdit.click().catch(() => undefined);
        await upload;
        await page.waitForLoadState('networkidle');
        const docs = (await seed.getLead(lead.id)).documents ?? [];
        const found = docs.find((x: any) => (x.filename ?? x.name) === file.name);
        if (ok) expect.soft(found, `File ${label} xuất hiện trong danh sách tài liệu`).toBeTruthy();
        else expect.soft(found, `File ${label} không được xuất hiện`).toBeFalsy();
      }
      // File hợp lệ mở lại được đúng nội dung.
      const docs = (await seed.getLead(lead.id)).documents ?? [];
      const good = docs.find((x: any) => (x.filename ?? x.name) === variants[0][1].name);
      expect(good, 'Tài liệu hợp lệ đã được lưu').toBeTruthy();
      const file = await http.call('GET /api/leads/{id}/documents/{documentId}', { token: roles.nvkdA.accessToken, params: { id: lead.id, documentId: good.id } });
      expect(file.status()).toBe(200);
      expect(sha256(Buffer.from(await file.body()))).toBe(sha256(variants[0][1].buffer));
    });
  });
});
