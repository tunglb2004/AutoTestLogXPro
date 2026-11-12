import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures/page.fixture';
import { data, items, jsonPart } from '../../../src/api/http.client';
import * as F from '../../../src/data/file.factory';
import * as C from '../../../src/data/contract.factory';
import { DataTableComponent } from '../../../src/pages/components/data-table.component';
import { optionTexts, chooseOption, pickDate } from '../../../src/pages/components/filter-bar.component';
import { addDays, today, ALERT_EDGES } from '../../../src/utils/dates';
import { sha256 } from '../../../src/utils/file-check';
import { tagged, textOfLength } from '../../../src/utils/test-run';
/**
 * GET /api/contracts/uploadable-customers chỉ trả 100 Lead đầu theo tên, không phân trang (lệch hệ thống, xem README).
 * Lead dùng cho luồng Upload đặt tên bắt đầu "Công ty Cổ phần A" để nằm trong ô chọn; UI-CTR-001 vẫn dùng tên thường để phát hiện lệch.
 */
const uploadableLead = (seed: any) => seed.lead('nvkdA', { companyName: tagged('Công ty Cổ phần A Châu Logistics') });


const esc = (s: string) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const ALERT_LABEL: Record<string, string> = { URGENT: 'Khẩn cấp', NOTICE: 'Lưu ý', WATCH: 'Theo dõi' };

async function managerName(http: any, roles: any, key = 'dvkhA'): Promise<string> {
  const list = items(await data(await http.call('GET /api/contracts/assignable-managers', { token: roles.nvkdA.accessToken })));
  const m = list.find((x: any) => (x.id ?? x.userId) === roles[key].userId);
  if (!m) throw new Error(`${key} không có trong /api/contracts/assignable-managers`);
  return m?.displayName ?? m?.fullName ?? m?.name;
}

/** HĐ đang hiệu lực (bắt đầu 30 ngày trước) còn đúng `days` ngày đến hạn. */
async function contractEndingIn(seed: any, http: any, roles: any, days: number) {
  const lead = await seed.lead();
  const body = C.uploadContract(lead.id, roles.dvkhA.userId, { signedOn: addDays(today(), -30), effectiveFrom: addDays(today(), -30), effectiveTo: addDays(today(), days) });
  const res = await http.call('POST /api/contracts', { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', body), file: F.pdf() } });
  if (!res.ok()) throw new Error(`Không tạo được HĐ còn ${days} ngày: HTTP ${res.status()}`);
  return { lead, contract: await data(res) };
}

/** HĐ được tạo thật (POST /api/contracts trả 2xx); request bị server từ chối (4xx) không tính là tạo HĐ. */
function watchContractCreate(page: Page) {
  const calls: string[] = [];
  page.on('response', (r) => r.request().method() === 'POST' && /\/api\/contracts$/.test(new URL(r.url()).pathname) && r.ok() && calls.push(`${r.status()} ${r.url()}`));
  return calls;
}

/** Màu badge "(Còn N ngày)" chấp nhận: đỏ ≤ 7, cam 8–30, 31–60 vàng hoặc cam (user chốt 2026-11-06); ngoài 60 không có badge. */
const BADGE_OK = (n: number): (string | null)[] => (n <= 7 ? ['đỏ'] : n <= 30 ? ['cam'] : n <= 60 ? ['vàng', 'cam'] : [null]);

test.describe("Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng", () => {
  test("UI-CTR-003 Chọn file scan và phụ lục", { tag: ["@ui", "@p2"] }, async ({ loginAs, contractUploadPage: u }) => {
    await loginAs('nvkdA');
    await u.goto();
    await u.scanInput.setInputFiles(F.pdf('hop-dong-scan.pdf'));
    // Khối "Phụ lục hợp đồng #1" có sẵn; thêm tới 5 phụ lục rồi thử thêm cái thứ 6.
    for (let i = 0; i < 5; i++) {
      if (i > 0) await u.addAnnex.click();
      await (await u.newestAnnexInput()).setInputFiles(F.pdf(`phu-luc-${i + 1}.pdf`));
    }
    await expect(u.annexBlocks).toHaveCount(5);
    const canAdd = (await u.addAnnex.count()) > 0 && (await u.addAnnex.isEnabled());
    if (canAdd) {
      await u.addAnnex.click();
      await expect(u.page.getByText(/tối đa 5|5 phụ lục/i).first(), 'Báo lỗi khi thêm phụ lục thứ 6').toBeVisible();
    }
    await expect(u.annexBlocks, 'Không quá 5 phụ lục').toHaveCount(5);
  });

  test("UI-CTR-004 Upload thành công", { tag: ["@ui", "@p1"] }, async ({ page, seed, http, roles, loginAs, contractUploadPage: u, contractDetailPage: cd }) => {
    const lead = await uploadableLead(seed);
    const manager = await managerName(http, roles);
    await loginAs('nvkdA');
    await u.goto();
    await u.removeAllAnnexes();
    // Chọn khách hàng trước: đổi khách hàng làm web điền lại điều khoản thanh toán.
    await u.fill({ customer: esc(lead.companyName), manager, signedOn: today(), effectiveFrom: today(), effectiveTo: addDays(today(), 365), scan: F.pdf() });
    const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/contracts$/.test(new URL(r.url()).pathname));
    await u.save.click();
    expect([200, 201]).toContain((await res).status());
    const created = (await (await res).json()).data;
    await expect(u.toast.message.filter({ hasText: /thành công/i }).first()).toBeVisible();
    await cd.goto(created.id);
    await expect(cd.page.locator('main')).toContainText('Đang hiệu lực');
  });

  test("UI-CTR-006 Hộp xác nhận khi sửa ngày làm HĐ có hiệu lực", { tag: ["@ui", "@p2"] }, async ({ page, seed, loginAs, contractUploadPage: u }) => {
    const cancelCase = await seed.customer({ pending: true });
    const agreeCase = await seed.customer({ pending: true });
    await loginAs('dvkhA');

    for (const [c, agree] of [[cancelCase, false], [agreeCase, true]] as const) {
      await u.gotoEdit(c.contract.id);
      await u.editReason.fill('Điều chỉnh ngày hiệu lực theo phụ lục đã ký');
      await pickDate(u.effectiveFrom, today());
      await pickDate(u.signedOn, today());
      const first = page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().includes(c.contract.id));
      await u.save.click();
      expect((await first).status()).toBe(409);
      await expect(u.modal.dialog).toBeVisible();
      if (agree) {
        const second = page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().includes(c.contract.id));
        await u.modal.button(/^(Đồng ý|Xác nhận.*)$/).click();
        expect((await second).status()).toBe(200);
        await expect.poll(async () => JSON.stringify((await seed.getContract(c.contract.id)).status)).toMatch(/ACTIVE/);
      } else {
        await u.modal.cancel.click();
        expect(JSON.stringify((await seed.getContract(c.contract.id)).status)).toMatch(/PENDING/);
      }
    }
  });

  test("UI-CTR-007 Badge cảnh báo kỳ hạn", { tag: ["@ui", "@p3"] }, async ({ seed, http, roles, loginAs, contractDetailPage: cd }) => {
    const rows = [];
    for (const days of [5, 20, 45]) rows.push({ days, ...(await contractEndingIn(seed, http, roles, days)) });
    await loginAs('dvkhA');
    for (const r of rows) {
      const api = await seed.getContract(r.contract.id);
      await cd.goto();
      await cd.filter.search.fill(r.contract.code);
      const row = cd.table.row(r.contract.code);
      await expect(row).toHaveCount(1);
      expect.soft(api.alertLevel, `${r.days} ngày`).toBe(r.days <= 7 ? 'URGENT' : r.days <= 30 ? 'NOTICE' : 'WATCH');
      // SRS 3.2.2: badge là "(Còn N ngày)" nền đỏ / cam / vàng theo BR-CTR-08.
      expect.soft(BADGE_OK(r.days), `Badge ${r.days} ngày`).toContain(await DataTableComponent.expiryBadgeLevel(row, r.days));
    }
  });

  test("UI-CTR-008 Từ HĐ sang khách hàng và ngược lại", { tag: ["@ui", "@p3"] }, async ({ page, seed, loginAs, customerDetailPage: cus }) => {
    // SRS không yêu cầu tên KH trên chi tiết HĐ là link (user chốt 2026-11-05): chỉ kiểm chiều KH → HĐ qua nút "Xem hợp đồng".
    const c = await seed.customer();
    await loginAs('dvkhA');
    await cus.goto(c.customerId);
    const fileRes = page.waitForResponse((r) => r.url().includes(`/api/contracts/${c.contract.id}/file`), { timeout: 15_000 }).catch(() => null);
    await cus.viewContract.click();
    // Web mở popup "Chi tiết hợp đồng" (khung xem file scan + thông tin) thay vì chuyển trang.
    await expect(cus.modal.dialog).toContainText('Chi tiết hợp đồng');
    await expect(cus.modal.dialog).toContainText(c.contract.code);
    // File scan (PDF có trang chữ) tải về thành công và hiện trong khung xem.
    expect((await fileRes)?.status(), 'Tải file scan để xem').toBe(200);
    await expect(cus.modal.dialog.locator('iframe, embed, object, canvas').first(), 'Khung xem file scan').toBeVisible();
  });

  test("UI-CTR-001 Ô chọn Lead chỉ có Lead đủ điều kiện", { tag: ["@ui", "@p1"] }, async ({ seed, http, roles, loginAs, contractUploadPage: u }) => {
    const active = await seed.lead();
    const inactive = await seed.inactiveLead();
    const converted = await seed.customer();
    const api = items(await data(await http.call('GET /api/contracts/uploadable-customers', { token: roles.nvkdA.accessToken })));
    await loginAs('nvkdA');
    await u.goto();
    // User chốt 2026-11-06: ô chọn chỉ trả tối đa 100 Lead để giảm tải; Lead khác người dùng tìm bằng ô tìm kiếm.
    const opts = await optionTexts(u.customer);
    expect(opts.length, 'Tối đa 100 lựa chọn').toBeLessThanOrEqual(100);
    expect(opts.length, 'Khớp số Lead GET /api/contracts/uploadable-customers trả về').toBe(api.length);
    for (const l of api) expect.soft(opts.some((o) => o.includes(l.companyName ?? l.name)), `Có ${l.leadCode}`).toBe(true);
    // Lead không đủ điều kiện không được có trong danh sách hoặc kết quả tìm.
    const search = async (name: string) => {
      const res = await http.call('GET /api/contracts/uploadable-customers', { token: roles.nvkdA.accessToken, query: { search: name } });
      return items(await data(res)).map((x: any) => x.id);
    };
    expect(await search(active.companyName), 'API tìm được Lead Đang hoạt động chưa có HĐ').toContain(active.id);
    expect(await search(inactive.companyName), 'Lead Ngưng hoạt động không có').not.toContain(inactive.id);
    expect(await search(converted.lead.companyName), 'Lead đã chuyển đổi không có').not.toContain(converted.lead.id);
    expect(opts.some((o) => o.includes(inactive.companyName))).toBe(false);
    expect(opts.some((o) => o.includes(converted.lead.companyName))).toBe(false);
    // Trên web: gõ tên vào ô chọn phải tìm ra Lead mới (kể cả khi nằm ngoài 100 Lead đầu).
    await u.customer.click();
    const searchBox = u.page.locator('[class*="_dropdown_"] input').filter({ visible: true }).first();
    if (await searchBox.count()) await searchBox.fill(active.companyName);
    else await u.page.keyboard.type(active.companyName);
    await expect
      .soft(u.page.locator('[class*="_option_"]').filter({ visible: true }).filter({ hasText: active.companyName }), 'Ô chọn tìm được Lead mới theo tên')
      .toHaveCount(1);
  });

  test("UI-CTR-011 Phân vùng file scan và phụ lục HĐ khách hàng", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractUploadPage: u, contractDetailPage: cd }) => {
    test.setTimeout(300_000);
    const manager = await managerName(http, roles);
    await loginAs('nvkdA');
    const writes = watchContractCreate(page);

    await test.step('Scan bắt buộc đúng 1 file PDF hợp lệ', async () => {
      const lead = await uploadableLead(seed);
      await u.goto();
      expect(await u.scanInput.evaluate((i: HTMLInputElement) => i.multiple), 'Không cho chọn 2 file scan').toBe(false);
      await u.removeAllAnnexes();
      // Chọn khách hàng trước: đổi khách hàng làm web điền lại điều khoản thanh toán.
      await u.fill({ customer: esc(lead.companyName), manager, signedOn: today(), effectiveFrom: today(), effectiveTo: addDays(today(), 365), scan: null });
      // Form ghi "Chỉ hỗ trợ PDF tối đa 20MB" cho file HĐ đã ký: dùng file thật của bộ test.
      for (const [label, file] of [['0 file', null], ['sai loại DOCX', F.REAL.docx20()], ['sai loại TXT', F.REAL.other('txt')], ['0 byte', F.empty('rong.pdf')], ['vượt 20MB (21MB PDF)', F.REAL.pdf21()]] as const) {
        const before = writes.length;
        if (file) await u.scanInput.setInputFiles(file);
        await u.save.click();
        await page.waitForLoadState('networkidle');
        await expect.soft(page.getByText(/file hợp đồng|PDF|dung lượng|MB|không hợp lệ|rỗng/i).filter({ visible: true }).first(), `${label}: có thông báo`).toBeVisible();
        expect.soft(writes.slice(before), `${label}: không tạo HĐ`).toEqual([]);
        if (writes.length > before) return; // HĐ đã tạo, Lead đã chuyển đổi: không thử tiếp trên form này
      }
      // Đúng 20MB lưu được.
      await u.scanInput.setInputFiles(F.REAL.pdf20());
      const ok20 = page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/contracts$/.test(new URL(r.url()).pathname), { timeout: 60_000 }).catch(() => null);
      await u.save.click();
      expect.soft((await ok20)?.status(), 'File HĐ PDF đúng 20MB lưu được').toBeLessThan(300);
    });

    await test.step('Phụ lục: tên rỗng, 255, 256; 5 phụ lục lưu được', async () => {
      await u.goto();
      await expect(u.annexName(0)).toHaveAttribute('maxlength', '255');
      await u.annexName(0).fill(textOfLength(256));
      expect((await u.annexName(0).inputValue()).length).toBeLessThanOrEqual(255);

      // HĐ kèm 5 phụ lục hợp lệ (tên rỗng ở khối 1 trước khi điền phải bị chặn).
      const lead = await uploadableLead(seed);
      await u.goto();
      // Chọn khách hàng trước: đổi khách hàng làm web điền lại điều khoản thanh toán.
      await u.fill({ customer: esc(lead.companyName), manager, signedOn: today(), effectiveFrom: today(), effectiveTo: addDays(today(), 365), scan: F.pdf() });
      // Khối phụ lục #1 có file nhưng bỏ trống tên → phải bị chặn.
      await (await u.newestAnnexInput()).setInputFiles(F.pdf('phu-luc-1.pdf'));
      await u.save.click();
      await expect.soft(page.getByText(/Vui lòng nhập tên phụ lục/i).first(), 'Tên phụ lục rỗng bị chặn').toBeVisible();
      for (let i = 0; i < 5; i++) {
        if (i > 0) await u.addAnnex.click();
        await u.ph('Nhập tên').last().fill(i === 0 ? textOfLength(255) : `Phụ lục bảng giá số ${i + 1}`);
        await (await u.newestAnnexInput()).setInputFiles(F.pdf(`phu-luc-${i + 1}.pdf`));
      }
      const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/contracts$/.test(new URL(r.url()).pathname));
      await u.save.click();
      expect([200, 201]).toContain((await res).status());
      const created = (await (await res).json()).data;
      expect((await seed.getContract(created.id, 'nvkdA')).annexes).toHaveLength(5);
    });

    await test.step('Popup phụ lục trên chi tiết HĐ (DVKH): tên rỗng bị chặn, hợp lệ lưu và tải về đúng nội dung', async () => {
      const c = await seed.customer();
      await loginAs('dvkhA');
      await cd.goto(c.contract.id);
      await cd.action('MANAGE_ANNEXES').click();
      // Phụ lục chỉ nhận PDF tối đa 5MB: file 10MB của bộ test phải bị chặn, rồi dùng PDF nhỏ có nội dung.
      await cd.modal.dialog.locator('input[type=file]').setInputFiles(F.REAL.pdf10());
      await cd.modal.input('Nhập tên').fill('Phụ lục quá 5MB');
      const big = page.waitForResponse((r) => r.request().method() === 'POST' && /\/annexes$/.test(r.url()), { timeout: 8_000 }).catch(() => null);
      await cd.modal.button('Thêm').click();
      const bigRes = await big;
      expect.soft(bigRes === null || bigRes.status() >= 400, 'Phụ lục 10MB (vượt 5MB) bị chặn').toBe(true);
      expect.soft((await seed.getContract(c.contract.id)).annexes ?? [], 'Không tạo phụ lục khi file vượt 5MB').toHaveLength(0);
      if (!(await cd.modal.dialog.isVisible().catch(() => false))) await cd.action('MANAGE_ANNEXES').click();
      await cd.modal.input('Nhập tên').fill('');
      const file = F.pdf('phu-luc-bang-gia.pdf');
      await cd.modal.dialog.locator('input[type=file]').setInputFiles(file);
      await cd.modal.button('Thêm').click();
      await expect.soft(cd.modal.dialog, 'Tên rỗng bị chặn').toBeVisible();
      expect.soft((await seed.getContract(c.contract.id)).annexes ?? []).toHaveLength(0);
      const name = textOfLength(255);
      await cd.modal.input('Nhập tên').fill(name);
      const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/annexes$/.test(r.url()));
      await cd.modal.button('Thêm').click();
      expect([200, 201]).toContain((await res).status());
      const after = await seed.getContract(c.contract.id);
      const annex = after.annexes.find((a: any) => a.name === name);
      expect(annex, 'Phụ lục tên 255 ký tự lưu đúng').toBeTruthy();
      const dl = await http.call('GET /api/contracts/{id}/annexes/{annexId}/file', { token: roles.dvkhA.accessToken, params: { id: c.contract.id, annexId: annex.id } });
      expect(sha256(Buffer.from(await dl.body()))).toBe(sha256(file.buffer));
    });
  });

  test("UI-CTR-013 Biên badge cảnh báo kỳ hạn HĐ khách hàng", { tag: ["@ui", "@p2"] }, async ({ seed, http, roles, loginAs, contractDetailPage: cd }) => {
    test.setTimeout(900_000);
    const rows = [];
    for (const days of ALERT_EDGES) rows.push({ days, ...(await contractEndingIn(seed, http, roles, days)) });
    await loginAs('dvkhA');
    const expected = (d: number) => (d <= 7 ? 'URGENT' : d <= 30 ? 'NOTICE' : d <= 60 ? 'WATCH' : 'NONE');
    for (const r of rows) {
      const api = await seed.getContract(r.contract.id);
      expect.soft(api.alertLevel, `${r.days} ngày`).toBe(expected(r.days));
      await cd.goto();
      await cd.filter.search.fill(r.contract.code);
      const row = cd.table.row(r.contract.code);
      await expect(row).toHaveCount(1);
      // SRS 3.2.2: "(Còn N ngày)" nền đỏ ≤ 7, cam 8–30, vàng 31–60; ngoài 60 ngày không có badge.
      expect.soft(BADGE_OK(r.days), `Badge ${r.days} ngày`).toContain(await DataTableComponent.expiryBadgeLevel(row, r.days));
    }
    // Toàn bộ HĐ Đang hiệu lực (gồm HĐ tạo trước đó): badge trên danh sách đúng số ngày và đúng màu, số đếm 3 mức khớp dữ liệu.
    const all: any[] = [];
    for (let p = 1; p <= 50; p++) {
      const pageData = await data(await http.call('GET /api/contracts', { token: roles.dvkhA.accessToken, query: { status: 'ACTIVE', page: p, perPage: 100 } }));
      all.push(...items(pageData));
      if (p >= (pageData.meta?.pagination?.totalPages ?? 1)) break;
    }
    const bucket = (n: number) => (n <= 7 ? 'urgent' : n <= 30 ? 'notice' : n <= 60 ? 'watch' : null);
    const counted = { urgent: 0, notice: 0, watch: 0 } as Record<string, number>;
    for (const c of all) if (bucket(c.daysToExpiry)) counted[bucket(c.daysToExpiry)!]++;
    await cd.goto();
    await chooseOption(cd.filter.statusFilter, 'Đang hiệu lực');
    await cd.table.pageSize.selectOption('100');
    const byCode = new Map(all.map((c) => [c.code, c.daysToExpiry]));
    for (let p = 1; p <= 50; p++) {
      await cd.page.waitForLoadState('networkidle');
      const rows = cd.table.rows;
      const n = await rows.count();
      for (let i = 0; i < n; i++) {
        const row = rows.nth(i);
        const code = (await row.locator('a[href^="/contracts/"]').first().innerText().catch(() => '')).trim();
        const days = byCode.get(code);
        if (days === undefined) continue;
        const shown = (await row.innerText()).match(/Còn (\d+) ngày/)?.[1];
        if (days <= 60) {
          expect.soft(shown, `${code}: hiện "(Còn ${days} ngày)"`).toBe(String(days));
          expect.soft(BADGE_OK(days), `${code}: màu badge ${days} ngày`).toContain(await DataTableComponent.expiryBadgeLevel(row, days));
        } else expect.soft(shown, `${code}: ${days} ngày không có badge`).toBeUndefined();
      }
      if (!(await cd.table.nextPage.isEnabled().catch(() => false))) break;
      await cd.table.nextPage.click();
    }
    const stats = await data(await http.call('GET /api/contracts/stats', { token: roles.dvkhA.accessToken }));
    expect.soft(stats, 'Số đếm /api/contracts/stats khớp số HĐ theo ngày còn lại').toMatchObject(counted);
    await cd.goto();
    const main = cd.page.locator('main');
    for (const [k, label] of [['urgent', 'Khẩn cấp'], ['notice', 'Lưu ý'], ['watch', 'Theo dõi']] as const)
      await expect.soft(main, `Ô ${label} = ${counted[k]} (đếm trên toàn bộ HĐ Đang hiệu lực)`).toContainText(new RegExp(`${label}\\s*:?\\s*${counted[k]}`));
    expect.soft(stats.urgent).toBeGreaterThanOrEqual(2);
  });
});
