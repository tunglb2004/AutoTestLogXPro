import { test, expect } from '../../../src/fixtures/page.fixture';
import { data, items, jsonPart } from '../../../src/api/http.client';
import * as F from '../../../src/data/file.factory';
import { annexMeta } from '../../../src/data/contract.factory';
import { newContractorContract, RENEWAL_CYCLES } from '../../../src/data/contractor-contract.factory';
import { chooseOption, optionTexts } from '../../../src/pages/components/filter-bar.component';
import { DataTableComponent } from '../../../src/pages/components/data-table.component';
import { addDays, today, ALERT_EDGES } from '../../../src/utils/dates';
import { sha256 } from '../../../src/utils/file-check';
import { textOfLength } from '../../../src/utils/test-run';

const esc = (s: string) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const ALERT_LABEL: Record<string, string> = { URGENT: 'Khẩn cấp', NOTICE: 'Lưu ý', WATCH: 'Theo dõi' };

/** Nhà thầu có HĐ đang hiệu lực (từ 30 ngày trước) còn đúng `days` ngày. */
async function contractEndingIn(seed: any, http: any, roles: any, days: number) {
  const contractor = await seed.contractor();
  const body = newContractorContract(contractor.id, { signedOn: addDays(today(), -30), effectiveFrom: addDays(today(), -30), effectiveTo: addDays(today(), days) });
  const res = await http.call('POST /api/contractor-contracts', { token: roles.qlnt.accessToken, multipart: { contract: jsonPart('contract', body), file: F.pdf('hop-dong-nha-thau.pdf') } });
  if (!res.ok()) throw new Error(`Không tạo được HĐ nhà thầu còn ${days} ngày: HTTP ${res.status()}`);
  return { contractor, contract: await data(res) };
}

/** Màu badge "(Còn N ngày)" chấp nhận: đỏ ≤ 7, cam 8–30, 31–60 vàng hoặc cam (user chốt 2026-11-06); ngoài 60 không có badge. */
const BADGE_OK = (n: number): (string | null)[] => (n <= 7 ? ['đỏ'] : n <= 30 ? ['cam'] : n <= 60 ? ['vàng', 'cam'] : [null]);

test.describe("Thêm và chi tiết hợp đồng nhà thầu", () => {
  test("UI-CTV-003 Tải và xem phụ lục", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractorContractDetailPage: d }) => {
    test.setTimeout(300_000); // phụ lục PDF và DOCX 20MB
    // File thật có trang chữ (bộ test-size-files) để xem được nội dung trên trình xem.
    const pdf = F.REAL.pdf20();
    const c = await seed.contractorContractWithAnnex(pdf);
    const docx = F.REAL.docx20();
    const r = await http.call('POST /api/contractor-contracts/{id}/annexes', { token: roles.qlnt.accessToken, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', annexMeta({ name: 'Phụ lục điều khoản' })), file: docx } });
    expect(r.ok(), 'Chuẩn bị phụ lục DOCX').toBe(true);
    await loginAs('qlnt');
    await d.goto(c.contract.id);
    const pdfRow = d.page.locator('main div').filter({ hasText: c.annex.name }).filter({ has: d.page.getByRole('button', { name: 'Tải xuống file phụ lục' }) }).last();
    const popup = page.waitForEvent('popup', { timeout: 8_000 }).catch(() => null);
    await pdfRow.getByRole('button', { name: 'Xem file phụ lục' }).click();
    const opened = await popup;
    const viewer = page.locator('iframe, embed, object, canvas').filter({ visible: true }).first();
    await viewer.waitFor({ timeout: 10_000 }).catch(() => undefined);
    expect(opened !== null || (await viewer.isVisible().catch(() => false)) || (await d.modal.dialog.isVisible().catch(() => false)), 'PDF mở trong trình xem').toBe(true);
    // Đóng trình xem để không che danh sách phụ lục.
    if (opened) await opened.close();
    if (await d.modal.dialog.isVisible().catch(() => false)) await d.modal.close.or(d.modal.button(/^Đóng$/)).first().click();

    const docxRow = d.page.locator('main div').filter({ hasText: 'Phụ lục điều khoản' }).filter({ has: d.page.getByRole('button', { name: 'Tải xuống file phụ lục' }) }).last();
    await docxRow.hover();
    const docxView = docxRow.getByRole('button', { name: 'Xem file phụ lục' });
    await expect.soft(docxView, 'DOCX có nút Xem để báo cần tải xuống').toBeVisible();
    if (await docxView.isVisible().catch(() => false)) {
      await docxView.click();
      await expect(page.getByText(/tải xuống|tải về/i).filter({ visible: true }).first(), 'DOCX báo cần tải xuống').toBeVisible();
      // Popup "File phụ lục" còn mở sẽ che nút Tải xuống: đóng lại trước khi tải.
      await d.modal.button('Đóng').last().click();
      await expect(d.modal.dialog).toBeHidden();
    }

    const dl = page.waitForEvent('download', { timeout: 120_000 });
    await pdfRow.getByRole('button', { name: 'Tải xuống file phụ lục' }).click();
    const file = await dl;
    const buf = await (await import('fs')).promises.readFile((await file.path())!);
    expect(sha256(Buffer.from(buf))).toBe(sha256(pdf.buffer));
  });

  test("UI-CTV-004 Xác nhận thay thế HĐ khi tái ký", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, contractorContractFormPage: f }) => {
    const v = await seed.contractorWithContract();
    await loginAs('qlnt');
    await f.goto();
    await f.modeResign.click();
    await chooseOption(f.contractor, esc(v.contractor.name));
    await f.fill({ signedOn: today(), effectiveFrom: today(), effectiveTo: addDays(today(), 365), scan: F.pdf('tai-ky.pdf') });
    const first = await f.submit();
    expect(first?.status()).toBe(409);
    await expect(f.modal.dialog).toContainText(v.contract.code);
    await expect(f.modal.dialog).toContainText(/Dừng khai thác/i);
    const second = page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/contractor-contracts/.test(r.url()));
    await f.modal.button(/^(Đồng ý|Xác nhận.*)$/).click();
    expect([200, 201]).toContain((await second).status());
    await expect(f.toast.message.filter({ hasText: /thành công/i }).first()).toBeVisible();
    expect(JSON.stringify((await seed.getContractorContract(v.contract.id)).status)).toMatch(/SUSPENDED/);
  });

  test("UI-CTV-007 Biên popup thêm, sửa, xóa phụ lục HĐ nhà thầu", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractorContractDetailPage: d }) => {
    test.setTimeout(480_000);
    const v = await seed.contractorWithContract();
    await loginAs('qlnt');
    const addAnnex = async (name: string, file: { name: string; mimeType: string; buffer: Buffer }) => {
      await d.goto(v.contract.id);
      await d.action('MANAGE_ANNEXES').click();
      await d.modal.input('Nhập tên').fill(name);
      await d.modal.dialog.locator('textarea').first().fill('Bảng giá cước vận chuyển áp dụng theo tuyến');
      await d.modal.dialog.locator('input[type=file]').setInputFiles(file);
      const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/annexes$/.test(r.url()), { timeout: 8_000 }).catch(() => null);
      await d.modal.button('Thêm').click();
      return (await res)?.status() ?? null;
    };
    const annexes = async () => (await seed.getContractorContract(v.contract.id)).annexes ?? [];

    expect.soft([null, 400], 'Tên rỗng').toContain(await addAnnex('', F.pdf()));
    for (const n of [254, 255]) expect.soft(await addAnnex(textOfLength(n), F.pdf(`phu-luc-${n}.pdf`)), `Tên ${n}`).toBeLessThan(300);
    await d.goto(v.contract.id);
    await d.action('MANAGE_ANNEXES').click();
    await d.modal.input('Nhập tên').fill(textOfLength(256));
    expect.soft((await d.modal.input('Nhập tên').inputValue()).length, 'Tên 256 bị chặn nhập').toBeLessThanOrEqual(255);
    await d.modal.cancel.click();
    expect.soft([null, 400, 415], 'Loại file không hỗ trợ (EXE)').toContain(await addAnnex('Phụ lục sai loại', F.REAL.other('exe')));
    expect.soft([null, 400, 415], 'Loại file không hỗ trợ (DOC)').toContain(await addAnnex('Phụ lục sai loại DOC', F.REAL.doc20()));
    expect.soft([null, 400, 413], 'Vượt 20MB (21MB PDF)').toContain(await addAnnex('Phụ lục quá lớn', F.REAL.pdf21()));
    const list = await annexes();
    expect(list.map((a: any) => a.name)).toEqual([textOfLength(254), textOfLength(255)]);

    // Tải về đúng nội dung.
    const target = list[1];
    const dl = await http.call('GET /api/contractor-contracts/{id}/annexes/{annexId}/file', { token: roles.qlnt.accessToken, params: { id: v.contract.id, annexId: target.id } });
    expect(sha256(Buffer.from(await dl.body()))).toBe(sha256(F.pdf('phu-luc-255.pdf').buffer));

    // Sửa (giữ file) và xóa với Hủy rồi Xác nhận.
    await d.goto(v.contract.id);
    const row = d.page.locator('main div').filter({ hasText: target.name }).filter({ has: d.page.getByRole('button', { name: 'Tải xuống file phụ lục' }) }).last();
    await row.getByRole('button', { name: 'Sửa phụ lục' }).click();
    await d.modal.input('Nhập tên').fill('Phụ lục đã chỉnh sửa');
    await d.modal.button(/^(Lưu.*|Cập nhật)$/).click();
    await expect.poll(async () => (await annexes()).map((a: any) => a.name)).toContain('Phụ lục đã chỉnh sửa');
    await d.goto(v.contract.id);
    const row2 = d.page.locator('main div').filter({ hasText: 'Phụ lục đã chỉnh sửa' }).filter({ has: d.page.getByRole('button', { name: 'Tải xuống file phụ lục' }) }).last();
    await row2.getByRole('button', { name: 'Xoá phụ lục' }).click();
    await d.modal.cancel.click();
    expect((await annexes()).length, 'Hủy xóa giữ nguyên').toBe(2);
    await row2.getByRole('button', { name: 'Xoá phụ lục' }).click();
    await d.modal.button(/^(Xác nhận|Xoá|Xóa).*$/).click();
    await expect.poll(async () => (await annexes()).map((a: any) => a.name)).toEqual([textOfLength(254)]);
  });

  test("UI-CTV-008 Cấu hình tự động gia hạn theo từng chu kỳ và trạng thái", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractorContractDetailPage: d }) => {
    test.setTimeout(480_000);
    await loginAs('qlnt');
    // Web: "Bật gia hạn tự động" (chưa bật) hoặc "Chỉnh sửa" ở khối Tự động gia hạn (đã bật) mở popup "Chỉnh sửa hợp đồng"
    // có nút Thủ công / Tự động, ô "Chọn chu kỳ gia hạn" và nút "Lưu thay đổi" (xác nhận trên web DEV 2026-11-06).
    const openConfig = async (id: string) => {
      await d.goto(id);
      const enable = d.page.getByRole('button', { name: 'Bật gia hạn tự động', exact: true }).filter({ visible: true });
      if (await enable.count()) await enable.click();
      else await d.page.locator('main').getByRole('button', { name: 'Chỉnh sửa', exact: true }).filter({ visible: true }).last().click();
      await expect(d.modal.dialog).toBeVisible();
    };
    const save = async (id: string) => {
      const res = page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().includes(`/api/contractor-contracts/${id}`), { timeout: 8_000 }).catch(() => null);
      await d.modal.button('Lưu thay đổi').click();
      return (await res)?.status() ?? null;
    };
    const configure = async (id: string, cycle: number | null) => {
      await openConfig(id);
      await d.modal.button('Tự động').click();
      const trigger = d.modal.dialog.locator('[class*="selectTrigger"]').filter({ hasText: /chu kỳ gia hạn|tháng/ }).first();
      expect.soft(await optionTexts(trigger), 'Chu kỳ chỉ có 4 giá trị').toEqual(RENEWAL_CYCLES.map((m) => `${m} tháng`));
      if (cycle) await chooseOption(trigger, `${cycle} tháng`);
      const status = await save(id);
      if (!cycle) await expect.soft(d.toast.fieldErrors.filter({ hasText: 'Vui lòng chọn chu kỳ gia hạn' }), 'Bật mà thiếu chu kỳ báo lỗi').toBeVisible();
      return status;
    };

    const pending = await seed.contractorWithContract({ pending: true });
    expect.soft([null, 400], 'Bật mà thiếu chu kỳ').toContain(await configure(pending.contract.id, null));
    for (const m of RENEWAL_CYCLES) {
      expect.soft(await configure(pending.contract.id, m), `Chu kỳ ${m}`).toBe(200);
      const after = await seed.getContractorContract(pending.contract.id);
      expect.soft(after.autoRenew).toBe(true);
      expect.soft(after.renewalCycleMonths, `Đọc lại chu kỳ ${m}`).toBe(m);
      await d.goto(pending.contract.id);
      await expect.soft(d.page.locator('main')).toContainText(`${m} tháng`);
    }
    // Tắt: chọn Thủ công trong popup rồi lưu.
    await openConfig(pending.contract.id);
    await d.modal.button('Thủ công').click();
    expect.soft(await save(pending.contract.id), 'Tắt tự động gia hạn').toBe(200);
    await expect.poll(async () => (await seed.getContractorContract(pending.contract.id)).autoRenew).toBe(false);

    const active = await seed.contractorWithContract();
    expect.soft(await configure(active.contract.id, 12), 'HĐ Đang hiệu lực').toBe(200);

    // HĐ Đã hủy và HĐ của nhà thầu Dừng hợp tác: ẩn hoặc khóa thao tác.
    const cancelled = await seed.contractorWithContract({ pending: true });
    expect((await http.call('POST /api/contractor-contracts/{id}/cancel', { token: roles.qlnt.accessToken, params: { id: cancelled.contract.id }, json: { reason: 'Nhà thầu rút hồ sơ' } })).ok()).toBe(true);
    const terminated = await seed.terminatedContractor();
    for (const id of [cancelled.contract.id, terminated.contract.id]) {
      await d.goto(id);
      const btn = d.action('CONFIGURE_AUTO_RENEWAL');
      if (await btn.count()) await expect.soft(btn.first(), 'Thao tác bị khóa').toBeDisabled();
      else await expect.soft(btn).toHaveCount(0);
    }
  });

  test("UI-CTV-001 Ô chọn nhà thầu theo chế độ", { tag: ["@ui", "@p1"] }, async ({ seed, http, roles, loginAs, contractorContractFormPage: f }) => {
    const fresh = await seed.contractor();
    const active = await seed.contractorWithContract();
    const api = async (mode: string) => items(await data(await http.call('GET /api/contractor-contracts/contractor-options', { token: roles.qlnt.accessToken, query: { mode } })));
    await loginAs('qlnt');
    await f.goto();
    for (const [mode, btn, mustHave, mustNot] of [
      ['NEW', f.modeNew, fresh, active.contractor],
      ['RESIGN', f.modeResign, active.contractor, fresh],
    ] as const) {
      await btn.click();
      await expect(f.contractor).not.toContainText('Đang tải');
      const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
      const opts = (await optionTexts(f.contractor)).map(norm);
      const expected = await api(mode);
      expect.soft(opts.length, `Số lựa chọn chế độ ${mode}`).toBe(expected.length);
      // Web hiển thị "Tên (VDR-xxxx) — MST ..." và bỏ thẻ HTML khỏi tên (tên thử XSS): so theo mã nhà thầu.
      for (const o of expected) expect.soft(opts.some((t) => t.includes(`(${o.contractorCode})`)), `${mode} có ${o.contractorCode}`).toBe(true);
      expect(opts.some((t) => t.includes(`(${mustHave.code})`)), `${mode} có ${mustHave.code}`).toBe(true);
      expect(opts.some((t) => t.includes(`(${mustNot.code})`)), `${mode} không có ${mustNot.code}`).toBe(false);
    }
  });

  test("UI-CTV-010 Biên badge cảnh báo kỳ hạn HĐ nhà thầu", { tag: ["@ui", "@p2"] }, async ({ seed, http, roles, loginAs, contractorContractDetailPage: d }) => {
    test.setTimeout(300_000);
    const rows = [];
    for (const days of ALERT_EDGES) rows.push({ days, ...(await contractEndingIn(seed, http, roles, days)) });
    const expected = (n: number) => (n <= 7 ? 'URGENT' : n <= 30 ? 'NOTICE' : n <= 60 ? 'WATCH' : 'NONE');
    await loginAs('qlnt');
    for (const r of rows) {
      const api = await seed.getContractorContract(r.contract.id);
      expect.soft(api.alertLevel, `${r.days} ngày`).toBe(expected(r.days));
      await d.goto();
      await d.filter.search.fill(r.contract.code);
      const row = d.table.row(r.contract.code);
      await expect(row).toHaveCount(1);
      // BR-CTV-06/07: "(Còn N ngày)" nền đỏ ≤ 7, cam 8–30, vàng 31–60; 61 ngày không có badge.
      expect.soft(BADGE_OK(r.days), `Badge ${r.days} ngày`).toContain(await DataTableComponent.expiryBadgeLevel(row, r.days));
      await d.goto(r.contract.id);
      await expect.soft(d.page.locator('main'), `Chi tiết còn ${r.days} ngày`).toContainText(`Còn ${r.days} ngày`);
    }
    const stats = await data(await http.call('GET /api/contractor-contracts/stats', { token: roles.qlnt.accessToken }));
    await d.goto();
    const shown = await d.page.locator('main').innerText();
    const sapHet = Number(shown.match(/Sắp hết hạn\s*\n?\s*(\d+)/)?.[1]);
    const apiNumbers = Object.values(stats).filter((x) => typeof x === 'number');
    expect.soft(apiNumbers, `Ô "Sắp hết hạn" = ${sapHet} khớp /api/contractor-contracts/stats ${JSON.stringify(stats)}`).toContain(sapHet);
  });
});
