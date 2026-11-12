import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures/page.fixture';
import { data, items, jsonPart } from '../../../src/api/http.client';
import * as F from '../../../src/data/file.factory';
import * as C from '../../../src/data/contract.factory';
import { ContractDetailPage } from '../../../src/pages/contract-detail.page';
import { chooseOption, pickDate } from '../../../src/pages/components/filter-bar.component';
import { addDays, today } from '../../../src/utils/dates';
import { tagged, textOfLength } from '../../../src/utils/test-run';
/**
 * GET /api/contracts/uploadable-customers chỉ trả 100 Lead đầu theo tên, không phân trang (lệch hệ thống, xem README).
 * Lead dùng cho luồng Upload đặt tên bắt đầu "Công ty Cổ phần A" để nằm trong ô chọn; UI-CTR-001 vẫn dùng tên thường để phát hiện lệch.
 */
const uploadableLead = (seed: any) => seed.lead('nvkdA', { companyName: tagged('Công ty Cổ phần A Châu Logistics') });


const esc = (s: string) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

async function managerName(http: any, roles: any, key = 'dvkhA'): Promise<string> {
  const list = items(await data(await http.call('GET /api/contracts/assignable-managers', { token: roles.nvkdA.accessToken })));
  const m = list.find((x: any) => (x.id ?? x.userId) === roles[key].userId);
  if (!m) throw new Error(`${key} không có trong /api/contracts/assignable-managers`);
  return m?.displayName ?? m?.fullName ?? m?.name;
}

function watchCreate(page: Page) {
  const calls: string[] = [];
  page.on('request', (r) => r.method() === 'POST' && /\/api\/contracts$/.test(new URL(r.url()).pathname) && calls.push(r.url()));
  return calls;
}

test.describe("Upload hợp đồng đầu tiên và chi tiết hợp đồng khách hàng", () => {
  test("UI-CTR-009 Biên ngày khi upload HĐ đầu tiên", { tag: ["@ui", "@p1"] }, async ({ page, seed, http, roles, loginAs, contractUploadPage: u, contractDetailPage: cd }) => {
    test.setTimeout(600_000);
    const manager = await managerName(http, roles);
    await loginAs('nvkdA');
    const writes = watchCreate(page);
    const valid = () => ({ manager, signedOn: today(), effectiveFrom: today(), effectiveTo: addDays(today(), 365), scan: F.pdf() });

    await test.step('Bỏ riêng từng trường bắt buộc', async () => {
      const lead = await uploadableLead(seed);
      const fields: [string, Record<string, null>, RegExp][] = [
        ['khách hàng', {}, /Vui lòng chọn khách hàng/],
        ['phân hạng', { tier: null }, /phân hạng/],
        ['người phụ trách', { manager: null }, /người phụ trách/],
        ['số HĐ', { contractNumber: null }, /số hợp đồng/],
        ['ngày ký', { signedOn: null }, /ngày ký/],
        ['ngày hiệu lực', { effectiveFrom: null }, /ngày hiệu lực/],
        ['ngày hết hạn', { effectiveTo: null }, /ngày hết hạn/],
        ['điều khoản thanh toán', { paymentTermDays: null }, /chu kỳ|thời hạn thanh toán|mốc tính/],
        ['file scan', { scan: null }, /file hợp đồng/],
      ];
      for (const [label, omit, msg] of fields) {
        await u.goto();
        await u.removeAllAnnexes();
        // Chọn khách hàng trước: đổi khách hàng làm web điền lại điều khoản thanh toán.
        await u.fill({ customer: label !== 'khách hàng' ? esc(lead.companyName) : null, ...valid(), ...omit });
        await u.save.click();
        await expect.soft(u.error(msg).first(), `Thiếu ${label}`).toBeVisible();
      }
      expect.soft(writes, 'Không tạo HĐ khi thiếu trường').toEqual([]);
    });

    await test.step('Ngày sai thứ tự báo tại đúng ô, không tạo HĐ', async () => {
      const lead = await uploadableLead(seed);
      // Quy tắc (user chốt 2026-11-06): ngày ký ≤ ngày hiệu lực ≤ ngày kết thúc. Web chặn bằng cách khoá ngày trên lịch
      // hoặc báo lỗi tại ô; cả hai đều là "bị chặn", miễn không tạo HĐ.
      for (const [label, d] of [
        ['ngày ký sau ngày bắt đầu', { signedOn: addDays(today(), 3), effectiveFrom: addDays(today(), 1) }],
        ['ngày bắt đầu sau ngày kết thúc', { effectiveFrom: addDays(today(), 10), effectiveTo: addDays(today(), 5) }],
      ] as const) {
        await u.goto();
        await u.removeAllAnnexes();
        // Chọn khách hàng trước: đổi khách hàng làm web điền lại điều khoản thanh toán.
        const locked = await u.fill({ customer: esc(lead.companyName), ...valid(), ...d }).then(() => null, (e: Error) => e.message);
        if (locked) {
          expect.soft(locked, `${label}: bị khoá trên lịch`).toMatch(/bị khoá trên lịch/);
          continue;
        }
        await u.save.click();
        await expect.soft(u.toast.fieldErrors.first(), `${label}: báo lỗi tại ô`).toBeVisible();
      }
      expect.soft(writes, 'Ngày sai thứ tự không tạo HĐ').toEqual([]);
    });

    for (const [label, from, signed, status, customerStatus] of [
      ['ngày ký trước ngày bắt đầu, bắt đầu hôm nay', today(), addDays(today(), -1), /ACTIVE/, /ACTIVE/],
      ['ngày ký bằng ngày bắt đầu, bắt đầu ngày mai', addDays(today(), 1), addDays(today(), 1), /PENDING/, /SUSPENDED/],
      ['ngày bắt đầu bằng ngày kết thúc (hợp lệ)', addDays(today(), 365), today(), /PENDING/, /SUSPENDED/],
    ] as const) {
      await test.step(label, async () => {
        const lead = await uploadableLead(seed);
        await u.goto();
        await u.removeAllAnnexes();
        // Chọn khách hàng trước: đổi khách hàng làm web điền lại điều khoản thanh toán.
        const filled = await u
          .fill({ customer: esc(lead.companyName), ...valid(), signedOn: signed, effectiveFrom: from, effectiveTo: label.includes('bằng ngày kết thúc') ? from : addDays(today(), 365) })
          .then(() => null, (e: Error) => e.message);
        expect.soft(filled, `${label}: nhập được bộ ngày`).toBeNull();
        if (filled) return;
        const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/contracts$/.test(new URL(r.url()).pathname));
        await u.save.click();
        expect([200, 201]).toContain((await res).status());
        const created = (await (await res).json()).data;
        const contract = await seed.getContract(created.id);
        expect.soft(JSON.stringify(contract.status), label).toMatch(status);
        expect.soft(JSON.stringify((await seed.getCustomer(created.customerId)).status), label).toMatch(customerStatus);
        await cd.goto(created.id);
        await expect.soft(cd.page.locator('main')).toContainText(status.source === 'ACTIVE' ? 'Đang hiệu lực' : 'Chưa hiệu lực');
      });
    }
  });

  test("UI-CTR-010 Biên điều khoản HĐ trên form upload, sửa, tái ký", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractUploadPage: u }) => {
    test.setTimeout(600_000);
    const manager = await managerName(http, roles);

    await test.step('Form Upload (NVKD): số HĐ 101 ký tự bị chặn; hạn thanh toán -1, 366, số lẻ bị chặn', async () => {
      await loginAs('nvkdA');
      const writes = watchCreate(page);
      await u.goto();
      await expect(u.contractNumber).toHaveAttribute('maxlength', '100');
      await u.contractNumber.fill(textOfLength(101));
      expect((await u.contractNumber.inputValue()).length).toBeLessThanOrEqual(100);
      const lead = await uploadableLead(seed);
      for (const term of ['-1', '366', '1.5']) {
        await u.goto();
        await u.removeAllAnnexes();
        // Chọn khách hàng trước: đổi khách hàng làm web điền lại điều khoản thanh toán.
        await u.fill({ customer: esc(lead.companyName), manager, signedOn: today(), effectiveFrom: today(), effectiveTo: addDays(today(), 365), scan: F.pdf(), paymentTermDays: term });
        await u.save.click();
        await expect.soft(u.toast.fieldErrors.filter({ hasText: /thanh toán|0|365/ }).first(), `Hạn thanh toán ${term}`).toBeVisible();
      }
      expect.soft(writes).toEqual([]);
    });

    await test.step('Form Sửa (DVKH): số HĐ 99/100, hạn thanh toán 0/1/364/365 lưu đúng; trùng số trong cùng KH bị chặn, khác KH lưu được', async () => {
      const own = await seed.customerWithPendingResign();
      const other = await seed.customer();
      await loginAs('dvkhA');
      const save = async (patch: { number?: string; term?: string }) => {
        await u.gotoEdit(own.pending.id);
        await u.editReason.fill('Sửa lỗi nhập liệu điều khoản hợp đồng');
        if (patch.number !== undefined) await u.contractNumber.fill(patch.number);
        if (patch.term !== undefined) await u.paymentTermDays.fill(patch.term);
        const res = page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().includes(own.pending.id), { timeout: 8_000 }).catch(() => null);
        await u.save.click();
        return (await res)?.status() ?? null;
      };
      for (const n of [99, 100]) {
        const num = `HĐ${'9'.repeat(n - 2)}`;
        expect.soft(await save({ number: num }), `Số HĐ ${n}`).toBe(200);
        expect.soft((await seed.getContract(own.pending.id)).contractNumber).toBe(num);
      }
      for (const t of [0, 1, 364, 365]) {
        expect.soft(await save({ term: String(t) }), `Hạn thanh toán ${t}`).toBe(200);
        expect.soft((await seed.getContract(own.pending.id)).paymentTermDays).toBe(t);
      }
      expect.soft([400, 409], 'Trùng số HĐ trong cùng KH bị chặn').toContain(await save({ number: own.contract.contractNumber }));
      expect.soft(await save({ number: other.contract.contractNumber }), 'Cùng số với HĐ của KH khác').toBe(200);
    });

    await test.step('Form Tái ký (DVKH): hạn thanh toán 366 bị chặn tại ô', async () => {
      const c = await seed.customer();
      await u.page.goto(`/contracts/${c.contract.id}/resign`);
      // Điền đủ "Thời hạn hợp đồng mới", chỉ để hạn thanh toán 366 sai.
      await u.contractNumber.fill(`TK-${Date.now() % 1_000_000}/2026`);
      await pickDate(u.date('Ngày tái ký'), today());
      await pickDate(u.date('Ngày hiệu lực mới'), addDays(c.contract.effectiveTo, 1));
      await pickDate(u.date('Ngày hết hạn mới'), addDays(c.contract.effectiveTo, 366));
      await u.fill({ tier: null, contractNumber: null, paymentTermDays: '366', scan: F.pdf('tai-ky.pdf') });
      await u.page.getByRole('button', { name: 'Tái ký', exact: true }).last().click();
      await expect.soft(u.toast.fieldErrors.filter({ hasText: /thanh toán|365/ }).first(), 'Hạn thanh toán 366 báo tại ô').toBeVisible();
      expect.soft((await seed.getContract(c.contract.id)).resignedInto ?? null).toBeFalsy();
    });
  });

  test("UI-CTR-002 Thứ tự ngày sai và thiếu file scan", { tag: ["@ui", "@p1"] }, async ({ page, seed, http, roles, loginAs, contractUploadPage: u }) => {
    const lead = await uploadableLead(seed);
    const manager = await managerName(http, roles);
    await loginAs('nvkdA');
    const writes = watchCreate(page);
    await u.goto();
    await u.removeAllAnnexes();
    // Chọn khách hàng trước: đổi khách hàng làm web điền lại điều khoản thanh toán.
    await u.fill({ customer: esc(lead.companyName), manager, signedOn: addDays(today(), 3), effectiveTo: addDays(today(), 365), scan: null });
    // Quy tắc user chốt 2026-11-06: ngày ký ≤ ngày hiệu lực. Web chặn bằng cách khoá các ngày trước ngày ký trên lịch "Ngày hiệu lực";
    // nếu chọn được thì phải báo lỗi tại ô ngày khi lưu.
    const locked = await pickDate(u.effectiveFrom, addDays(today(), 1)).then(() => null, (e: Error) => e.message);
    await u.save.click();
    if (locked) expect.soft(locked, 'Ngày hiệu lực trước ngày ký bị khoá trên lịch').toMatch(/bị khoá trên lịch/);
    else await expect.soft(u.toast.fieldErrors.filter({ hasText: /ngày/i }).first(), 'Lỗi dưới ô ngày').toBeVisible();
    await expect.soft(u.error(/file hợp đồng/).first(), 'Lỗi dưới ô file').toBeVisible();
    expect(writes).toEqual([]);
  });

  test("UI-CTR-005 Nút theo trạng thái HĐ", { tag: ["@ui", "@p1"] }, async ({ seed, http, roles, loginAs, contractDetailPage: cd }) => {
    const pending = await seed.customer({ pending: true });
    const active = await seed.customer();
    const cancelled = await seed.customer({ pending: true });
    const r = await http.call('POST /api/contracts/{id}/cancel', { token: roles.dvkhA.accessToken, params: { id: cancelled.contract.id }, json: { reason: 'Khách hàng đổi kế hoạch hợp tác' } });
    expect(r.ok()).toBe(true);
    await loginAs('dvkhA');
    for (const c of [pending, active, cancelled]) {
      const api = await seed.getContract(c.contract.id);
      await cd.goto(c.contract.id);
      for (const code of ContractDetailPage.ALL_ACTIONS) {
        if ((api.availableActions ?? []).includes(code)) await expect.soft(cd.action(code), `${api.code} có ${code}`).toBeVisible();
        else await expect.soft(cd.action(code), `${api.code} không có ${code}`).toHaveCount(0);
      }
    }
  });

  test("UI-CTR-012 Biên popup gia hạn, tái ký, hủy, dừng khai thác HĐ khách hàng", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractDetailPage: cd, contractUploadPage: u }) => {
    test.setTimeout(600_000);
    await loginAs('dvkhA');

    const extend = async (id: string, newExpiry: string) => {
      await cd.goto(id);
      await cd.action('EXTEND').click();
      await pickDate(cd.modal.dialog.locator('[class*="_trigger_"]').first(), newExpiry);
      await cd.modal.input('Nhập tên').first().fill('Phụ lục gia hạn hợp đồng');
      await cd.modal.dialog.locator('input[type=file]').first().setInputFiles(F.pdf('phu-luc-gia-han.pdf'));
      const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/extensions$/.test(r.url()), { timeout: 8_000 }).catch(() => null);
      await cd.modal.button('Xác nhận gia hạn').click();
      return (await res)?.status() ?? null;
    };

    await test.step('Gia hạn: ngày cũ − 1, bằng bị chặn; + 1 giữ mã HĐ', async () => {
      const c = await seed.customer();
      const old = c.contract.effectiveTo;
      for (const d of [addDays(old, -1), old]) expect.soft([null, 400]).toContain(await extend(c.contract.id, d));
      expect.soft(await extend(c.contract.id, addDays(old, 1))).toBe(200);
      const after = await seed.getContract(c.contract.id);
      expect.soft(after.code, 'Gia hạn giữ mã HĐ').toBe(c.contract.code);
      expect.soft(after.effectiveTo).toBe(addDays(old, 1));
    });

    await test.step('HĐ đã hết hạn: gia hạn về hôm qua bị chặn, ngày mai được', async () => {
      const lead = await seed.lead();
      const body = C.uploadContract(lead.id, roles.dvkhA.userId, { signedOn: addDays(today(), -60), effectiveFrom: addDays(today(), -60), effectiveTo: addDays(today(), -1) });
      const res = await http.call('POST /api/contracts', { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', body), file: F.pdf() } });
      expect(res.ok(), 'Tạo HĐ đã hết hạn qua API').toBe(true);
      const expired = await data(res);
      expect.soft([null, 400]).toContain(await extend(expired.id, addDays(today(), -1)));
      expect.soft(await extend(expired.id, addDays(today(), 1))).toBe(200);
      expect.soft((await seed.getContract(expired.id)).code).toBe(expired.code);
    });

    await test.step('Gia hạn khi có HĐ tái ký chờ từ ngày D: D − 1 được, D và D + 1 bị chặn', async () => {
      for (const [delta, ok] of [[-1, true], [0, false], [1, false]] as const) {
        // BR-CTR-09: ngày hết hạn mới phải > ngày hết hạn cũ và < ngày hiệu lực HĐ chờ (D). D đặt cách hết hạn gốc 30 ngày
        // để D − 1 vẫn lớn hơn ngày hết hạn cũ (lượt 1–4 dùng D = hết hạn + 1 nên D − 1 trùng ngày cũ, test sai dữ liệu).
        const c = await seed.customer();
        const D = addDays(c.contract.effectiveTo, 30);
        const rs = await http.call('POST /api/contracts/{id}/resign', { token: roles.dvkhA.accessToken, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', C.resignContract(D)), file: F.pdf('tai-ky.pdf') } });
        expect(rs.ok(), 'Chuẩn bị HĐ tái ký chờ từ ngày D').toBe(true);
        const s = await extend(c.contract.id, addDays(D, delta));
        if (ok) expect.soft(s, `D${delta}`).toBe(200);
        else expect.soft([null, 400, 409], `D+${delta}`).toContain(s);
      }
    });

    await test.step('Tái ký: cảnh báo thay thế; Hủy giữ nguyên, Đồng ý thay đúng HĐ gốc', async () => {
      for (const agree of [false, true]) {
        const c = await seed.customer();
        await page.goto(`/contracts/${c.contract.id}/resign`);
        await u.contractNumber.fill(`TK-${Date.now() % 1_000_000}/2026`);
        await pickDate(u.date('Ngày tái ký'), today());
        await pickDate(u.date('Ngày hiệu lực mới'), today());
        await pickDate(u.date('Ngày hết hạn mới'), addDays(today(), 365));
        await u.fill({ tier: null, contractNumber: null, scan: null });
        await u.scanInput.setInputFiles(F.pdf('tai-ky.pdf'));
        await page.getByRole('button', { name: 'Tái ký', exact: true }).last().click();
        await expect(cd.modal.dialog, 'Hiện cảnh báo thay thế HĐ').toBeVisible();
        if (agree) {
          await cd.modal.button(/^(Đồng ý|Xác nhận.*)$/).click();
          await expect.poll(async () => JSON.stringify((await seed.getContract(c.contract.id)).status)).toMatch(/SUSPENDED|EXPIRED/);
        } else {
          await cd.modal.cancel.click();
          expect.soft(JSON.stringify((await seed.getContract(c.contract.id)).status)).toMatch(/ACTIVE/);
        }
      }
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
        const active = await seed.customer();
        await cd.goto(active.contract.id);
        await cd.action('SUSPEND').click();
        await cd.modal.reason.fill(reason);
        const chan1 = await cd.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        await cd.modal.button('Xác nhận dừng khai thác').click();
        await page.waitForLoadState('networkidle');
        const s1 = JSON.stringify((await seed.getContract(active.contract.id)).status);
        if (ok || chan1) expect.soft(s1, `Dừng ${label}`).toMatch(/SUSPENDED/);
        else expect.soft(s1, `Dừng ${label}`).toMatch(/ACTIVE/);

        const pending = await seed.customer({ pending: true });
        await cd.goto(pending.contract.id);
        await cd.action('CANCEL').click();
        await cd.modal.reason.fill(reason);
        const chan2 = await cd.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        await cd.modal.button(/^Xác nhận/).click();
        await page.waitForLoadState('networkidle');
        const s2 = JSON.stringify((await seed.getContract(pending.contract.id)).status);
        if (ok || chan2) expect.soft(s2, `Hủy ${label}`).toMatch(/CANCELLED/);
        else expect.soft(s2, `Hủy ${label}`).toMatch(/PENDING/);
      });
    }
  });
});
