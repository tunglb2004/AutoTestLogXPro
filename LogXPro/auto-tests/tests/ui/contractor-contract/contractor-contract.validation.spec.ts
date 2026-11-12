import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures/page.fixture';
import { jsonPart } from '../../../src/api/http.client';
import * as F from '../../../src/data/file.factory';
import { resignContractorContract } from '../../../src/data/contractor-contract.factory';
import { ContractorContractDetailPage } from '../../../src/pages/contractor-contract-detail.page';
import { chooseOption, optionTexts, pickDate } from '../../../src/pages/components/filter-bar.component';
import { addDays, today } from '../../../src/utils/dates';
import { textOfLength } from '../../../src/utils/test-run';

const esc = (s: string) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

function watchCreate(page: Page) {
  const calls: string[] = [];
  page.on('request', (r) => r.method() === 'POST' && /\/api\/contractor-contracts$/.test(new URL(r.url()).pathname) && calls.push(r.url()));
  return calls;
}

test.describe("Thêm và chi tiết hợp đồng nhà thầu", () => {
  test("UI-CTV-005 Nút theo trạng thái HĐ", { tag: ["@ui", "@p1"] }, async ({ seed, http, roles, loginAs, contractorContractDetailPage: d }) => {
    const pending = await seed.contractorWithContract({ pending: true });
    const active = await seed.contractorWithContract();
    const cancelled = await seed.contractorWithContract({ pending: true });
    expect((await http.call('POST /api/contractor-contracts/{id}/cancel', { token: roles.qlnt.accessToken, params: { id: cancelled.contract.id }, json: { reason: 'Nhà thầu rút hồ sơ' } })).ok()).toBe(true);
    await loginAs('qlnt');
    for (const c of [pending, active, cancelled]) {
      const api = await seed.getContractorContract(c.contract.id);
      await d.goto(c.contract.id);
      for (const code of ContractorContractDetailPage.ALL_ACTIONS) {
        if ((api.availableActions ?? []).includes(code)) await expect.soft(d.action(code).first(), `${api.code} có ${code}`).toBeVisible();
        else await expect.soft(d.action(code), `${api.code} không có ${code}`).toHaveCount(0);
      }
    }
  });

  test("UI-CTV-006 Biên và phân vùng form thêm HĐ nhà thầu", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, contractorContractFormPage: f }) => {
    test.setTimeout(600_000);
    await loginAs('qlnt');
    const writes = watchCreate(page);
    const valid = () => ({ signedOn: today(), effectiveFrom: today(), effectiveTo: addDays(today(), 365), scan: F.pdf('hop-dong-nha-thau.pdf') });
    const open = async (c: any, patch: Parameters<typeof f.fill>[0] = {}) => {
      await f.goto();
      await chooseOption(f.contractor, esc(c.name));
      await f.fill({ ...valid(), ...patch });
    };

    await test.step('Bỏ riêng từng trường bắt buộc', async () => {
      const c = await seed.contractor();
      for (const [label, omit, msg] of [
        ['tên HĐ', { name: null }, 'Vui lòng nhập tên hợp đồng'],
        ['số HĐ', { legalNumber: null }, 'Vui lòng nhập số hợp đồng'],
        ['ngày ký', { signedOn: null }, 'Vui lòng chọn ngày ký'],
        ['ngày hiệu lực', { effectiveFrom: null }, 'Vui lòng chọn ngày hiệu lực'],
        ['ngày hết hạn', { effectiveTo: null }, 'Vui lòng chọn ngày hết hạn'],
        ['file scan', { scan: null }, /file|PDF, DOCX/],
      ] as const) {
        await open(c, omit);
        await f.save.click();
        await expect.soft(f.error(msg).first(), `Thiếu ${label}`).toBeVisible();
      }
      await f.goto();
      await f.fill({ ...valid(), contractor: null });
      await f.save.click();
      await expect.soft(f.error('Vui lòng chọn nhà thầu')).toBeVisible();
      expect.soft(writes).toEqual([]);
    });

    await test.step('Độ dài: tên 255, số HĐ 100 lưu đủ; 256 và 101 bị chặn nhập', async () => {
      await f.goto();
      await f.name.fill(textOfLength(256));
      expect.soft((await f.name.inputValue()).length).toBeLessThanOrEqual(255);
      await f.legalNumber.fill(textOfLength(101));
      expect.soft((await f.legalNumber.inputValue()).length).toBeLessThanOrEqual(100);
      const c = await seed.contractor();
      const name = textOfLength(255);
      const legal = `${'9'.repeat(96)}/HĐ`;
      await open(c, { name, legalNumber: legal });
      const res = await f.submit();
      expect.soft([200, 201]).toContain(res?.status());
      const created = res ? (await res.json()).data : null;
      if (created) {
        const api = await seed.getContractorContract(created.id);
        expect.soft(api.name).toBe(name);
        expect.soft(api.legalNumber).toBe(legal);
        expect.soft(JSON.stringify(api.status), 'Bắt đầu hôm nay ra Đang hiệu lực').toMatch(/ACTIVE/);
        expect.soft(JSON.stringify((await seed.getContractor(c.id)).status), 'Nhà thầu Đang hoạt động').toMatch(/ACTIVE/);
      }
    });

    await test.step('Ngày: bắt đầu sau kết thúc bị chặn; bắt đầu ngày mai ra Chưa hiệu lực', async () => {
      const bad = await seed.contractor();
      const before = writes.length;
      // Web chặn bằng cách khoá ngày kết thúc trước ngày hiệu lực trên lịch, hoặc báo lỗi tại ô: cả hai đều là chặn đúng.
      const locked = await open(bad, { effectiveFrom: addDays(today(), 10), effectiveTo: addDays(today(), 5) }).then(() => null, (e: Error) => e.message);
      if (locked) expect.soft(locked, 'Ngày kết thúc trước ngày hiệu lực bị khoá trên lịch').toMatch(/bị khoá trên lịch/);
      else {
        await f.save.click();
        await expect.soft(f.toast.fieldErrors.first(), 'Ngày ngược báo tại đúng trường').toBeVisible();
      }
      expect.soft(writes.length).toBe(before);
      const c = await seed.contractor();
      await open(c, { signedOn: today(), effectiveFrom: addDays(today(), 1) });
      const res = await f.submit();
      const created = res ? (await res.json()).data : null;
      expect.soft(created && JSON.stringify((await seed.getContractorContract(created.id)).status), 'Ngày mai ra Chưa hiệu lực').toMatch(/PENDING/);
      // Ngày bắt đầu bằng ngày kết thúc: chờ chốt nghiệp vụ.
    });

    await test.step('File scan (file thật): loại sai, 0 byte, vượt 20MB không tạo dữ liệu; đúng 20MB PDF/DOCX lưu được', async () => {
      for (const [label, file] of [['sai loại EXE', F.REAL.other('exe')], ['sai loại DOC', F.REAL.doc20()], ['0 byte', F.empty('rong.pdf')], ['vượt 20MB (21MB PDF)', F.REAL.pdf21()], ['vượt 20MB (21MB DOCX)', F.REAL.docx21()]] as const) {
        const c = await seed.contractor();
        const before = writes.length;
        await open(c, { scan: file });
        const res = await f.submit();
        expect.soft(res === null || [400, 413, 415].includes(res.status()), label).toBe(true);
        expect.soft(writes.length === before || (res !== null && res.status() >= 400), `${label}: không tạo HĐ`).toBe(true);
      }
      for (const [label, file] of [['đúng 20MB PDF', F.REAL.pdf20()], ['đúng 20MB DOCX', F.REAL.docx20()]] as const) {
        const c = await seed.contractor();
        await open(c, { scan: file });
        const res = await f.submit();
        expect.soft(res?.status(), `${label}: lưu được`).toBeLessThan(300);
      }
    });

    await test.step('Phụ lục: 5 lưu được, thứ 6 bị chặn', async () => {
      const c = await seed.contractor();
      await open(c, { annexes: 5 });
      const canAdd = (await f.addAnnex.count()) > 0 && (await f.addAnnex.isEnabled());
      if (canAdd) {
        await f.addAnnex.click();
        await expect.soft(f.annexBlocks, 'Không quá 5 phụ lục').toHaveCount(5);
        const remove = page.getByRole('button', { name: 'Xoá phụ lục' });
        while ((await remove.count()) > 5) await remove.last().click();
      }
      const res = await f.submit();
      expect.soft([200, 201]).toContain(res?.status());
      if (res && res.ok()) expect.soft((await seed.getContractorContract((await res.json()).data.id)).annexes).toHaveLength(5);
    });
  });

  test("UI-CTV-002 Ngày ngược, thiếu file, chu kỳ gia hạn lạ", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, contractorContractFormPage: f }) => {
    const c = await seed.contractor();
    await loginAs('qlnt');
    const writes = watchCreate(page);
    await f.goto();
    await chooseOption(f.contractor, esc(c.name));
    await f.fill({ signedOn: today(), effectiveFrom: addDays(today(), 10), effectiveTo: addDays(today(), 5), scan: null });
    await f.autoRenew.click();
    expect(await optionTexts(f.renewalCycle)).toEqual(['3 tháng', '6 tháng', '12 tháng', '24 tháng']);
    await f.save.click();
    await expect.soft(f.toast.fieldErrors.filter({ hasText: /ngày/i }).first(), 'Lỗi dưới ô ngày').toBeVisible();
    // User chốt 2026-11-05: không bắt buộc lỗi riêng dưới ô file, bấm Thêm có thông báo bổ sung là đạt.
    await expect.soft(f.toast.message.or(f.toast.fieldErrors).first(), 'Có thông báo yêu cầu bổ sung').toBeVisible();
    await expect.soft(f.error('Vui lòng chọn chu kỳ gia hạn')).toBeVisible();
    expect(writes).toEqual([]);
  });

  test("UI-CTV-009 Biên popup gia hạn, tái ký, hủy, dừng khai thác HĐ nhà thầu", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractorContractDetailPage: d, contractorContractFormPage: f }) => {
    test.setTimeout(600_000);
    await loginAs('qlnt');
    const extend = async (id: string, newExpiry: string) => {
      await d.goto(id);
      await d.action('EXTEND').click();
      await pickDate(d.modal.dialog.locator('[class*="_trigger_"]').first(), newExpiry);
      const name = d.modal.dialog.getByPlaceholder('Nhập tên', { exact: true });
      if (await name.count()) {
        await name.first().fill('Phụ lục gia hạn hợp đồng');
        const desc = d.modal.dialog.locator('textarea');
        if (await desc.count()) await desc.last().fill('Gia hạn thêm thời gian hợp tác');
        await d.modal.dialog.locator('input[type=file]').first().setInputFiles(F.pdf('phu-luc-gia-han.pdf'));
      }
      const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/extensions$/.test(r.url()), { timeout: 8_000 }).catch(() => null);
      await d.modal.button(/^Xác nhận/).click();
      return (await res)?.status() ?? null;
    };

    await test.step('Gia hạn: ngày cũ bị chặn, ngày cũ + 1 giữ mã HĐ', async () => {
      const v = await seed.contractorWithContract();
      const old = v.contract.effectiveTo;
      expect.soft([null, 400], 'Ngày cũ').toContain(await extend(v.contract.id, old));
      expect.soft(await extend(v.contract.id, addDays(old, 1)), 'Ngày cũ + 1').toBe(200);
      const after = await seed.getContractorContract(v.contract.id);
      expect.soft(after.code).toBe(v.contract.code);
      expect.soft(after.effectiveTo).toBe(addDays(old, 1));
    });

    await test.step('Gia hạn khi có HĐ nối tiếp từ ngày D: D − 1 được, D và D + 1 bị chặn', async () => {
      for (const [delta, ok] of [[-1, true], [0, false], [1, false]] as const) {
        const v = await seed.contractorWithContract();
        // BR-CTV-08: D cách ngày hết hạn gốc 30 ngày để D − 1 vẫn lớn hơn ngày hết hạn cũ.
        const D = addDays(v.contract.effectiveTo, 30);
        const r = await http.call('POST /api/contractor-contracts/{id}/resign', { token: roles.qlnt.accessToken, params: { id: v.contract.id }, multipart: { contract: jsonPart('contract', resignContractorContract(D)), file: F.pdf('tai-ky.pdf') } });
        expect(r.ok(), 'Chuẩn bị HĐ nối tiếp').toBe(true);
        const s = await extend(v.contract.id, addDays(D, delta));
        if (ok) expect.soft(s, `D${delta}`).toBe(200);
        else expect.soft([null, 400, 409], `D+${delta}`).toContain(s);
      }
    });

    await test.step('Tái ký: cảnh báo thay thế; Hủy giữ nguyên HĐ và nhà thầu', async () => {
      const v = await seed.contractorWithContract();
      await f.goto();
      await f.modeResign.click();
      await chooseOption(f.contractor, esc(v.contractor.name));
      await f.fill({ signedOn: today(), effectiveFrom: today(), effectiveTo: addDays(today(), 365), scan: F.pdf('tai-ky.pdf') });
      await f.save.click();
      await expect(f.modal.dialog).toBeVisible();
      await f.modal.cancel.click();
      expect.soft(JSON.stringify((await seed.getContractorContract(v.contract.id)).status)).toMatch(/ACTIVE/);
      expect.soft(JSON.stringify((await seed.getContractor(v.contractor.id)).status)).toMatch(/ACTIVE/);
      // Tái ký đúng ngày hết hạn gốc: chờ chốt nghiệp vụ.
    });

    for (const [label, reason, ok] of [
      ['rỗng', '', false],
      ['khoảng trắng', '     ', false],
      ['499', textOfLength(499), true],
      ['500', textOfLength(500), true],
      ['501', textOfLength(501), false],
    ] as const) {
      await test.step(`Dừng khai thác và Hủy, lý do ${label}`, async () => {
        const active = await seed.contractorWithContract();
        await d.goto(active.contract.id);
        await d.action('SUSPEND').click();
        await d.modal.reason.fill(reason);
        const chan1 = await d.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        await d.modal.button(/^Xác nhận/).click();
        await page.waitForLoadState('networkidle');
        expect.soft(JSON.stringify((await seed.getContractorContract(active.contract.id)).status), `Dừng ${label}`).toMatch(ok || chan1 ? /SUSPENDED/ : /ACTIVE/);

        const pending = await seed.contractorWithContract({ pending: true });
        await d.goto(pending.contract.id);
        await d.action('CANCEL').click();
        await d.modal.reason.fill(reason);
        const chan2 = await d.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        await d.modal.button(/^Xác nhận/).click();
        await page.waitForLoadState('networkidle');
        expect.soft(JSON.stringify((await seed.getContractorContract(pending.contract.id)).status), `Hủy ${label}`).toMatch(ok || chan2 ? /CANCELLED/ : /PENDING/);
      });
    }
  });
});
