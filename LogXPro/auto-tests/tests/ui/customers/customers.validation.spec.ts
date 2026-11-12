import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures/page.fixture';
import * as L from '../../../src/data/lead.factory';
import { randDigits, textOfLength } from '../../../src/utils/test-run';

function watchWrites(page: Page, part: string) {
  const calls: string[] = [];
  page.on('request', (r) => ['PUT', 'POST'].includes(r.method()) && r.url().includes(part) && calls.push(r.url()));
  return calls;
}

test.describe("Danh sách và chi tiết khách hàng", () => {
  test("UI-CUS-005 Hạn mức âm", { tag: ["@ui", "@p3"] }, async ({ page, seed, loginAs, customerDetailPage: d }) => {
    const c = await seed.customer();
    await loginAs('dvkhA');
    await d.goto(c.customerId);
    const writes = watchWrites(page, '/credit-limit');
    await d.editCredit.click();
    await d.creditInput.fill('-1');
    await d.saveCredit.click();
    await expect(d.toast.fieldErrors.first()).toBeVisible();
    expect(writes).toEqual([]);
    expect((await seed.getCustomer(c.customerId)).creditLimit ?? null).toBeNull();
  });

  test("UI-CUS-006 Biên và phân vùng khi sửa hồ sơ khách hàng", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, customerDetailPage: d }) => {
    test.setTimeout(480_000);
    const k = await seed.customer();
    const otherLead = await seed.lead();
    const otherCustomer = await seed.customer();
    await loginAs('dvkhA');
    const save = async (patch: { name?: string; address?: string; tax?: string }) => {
      await d.goto(k.customerId);
      await d.edit.click();
      if (patch.name !== undefined) await d.companyName.fill(patch.name);
      if (patch.address !== undefined) await d.address.fill(patch.address);
      if (patch.tax !== undefined) await d.taxCode.fill(patch.tax);
      const res = page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().endsWith(`/api/customers/${k.customerId}`), { timeout: 8_000 }).catch(() => null);
      await d.saveEdit.click();
      return (await res)?.status() ?? null;
    };
    const code = (await seed.getCustomer(k.customerId)).customerCode;

    for (const n of [254, 255]) {
      const v = textOfLength(n);
      expect.soft(await save({ name: v }), `Tên ${n}`).toBe(200);
      expect.soft((await seed.getCustomer(k.customerId)).companyName).toBe(v);
      await d.goto(k.customerId);
      await expect.soft(d.main).toContainText(v);
    }
    expect.soft([null, 400], 'Tên 256').toContain(await save({ name: textOfLength(256) }));
    expect.soft((await seed.getCustomer(k.customerId)).companyName.length).toBeLessThanOrEqual(255);
    for (const n of [499, 500]) {
      const v = textOfLength(n);
      expect.soft(await save({ address: v }), `Địa chỉ ${n}`).toBe(200);
      expect.soft((await seed.getCustomer(k.customerId)).headOfficeAddress).toBe(v);
    }
    expect.soft([null, 400], 'Địa chỉ 501').toContain(await save({ address: textOfLength(501) }));

    const current = (await seed.getCustomer(k.customerId)).taxCode;
    expect.soft(await save({ tax: current }), 'Giữ MST hiện tại').toBe(200);
    for (const tax of [randDigits(9, true), randDigits(11, true), randDigits(12, true), randDigits(14, true), '12345abc90']) {
      expect.soft([null, 400], `MST ${tax}`).toContain(await save({ tax }));
      expect.soft((await seed.getCustomer(k.customerId)).taxCode).toBe(current);
    }
    for (const [label, tax] of [['Lead khác', otherLead.taxCode], ['KH khác', otherCustomer.lead.taxCode]] as const) {
      expect.soft(await save({ tax }), `MST trùng ${label}`).toBe(409);
      expect.soft((await seed.getCustomer(k.customerId)).taxCode).toBe(current);
    }
    for (const tax of [L.taxCode(10), L.taxCode(13)]) {
      expect.soft(await save({ tax }), `MST mới ${tax.length} số`).toBe(200);
      expect.soft((await seed.getCustomer(k.customerId)).taxCode).toBe(tax);
    }
    expect((await seed.getCustomer(k.customerId)).customerCode, 'Mã KH giữ nguyên').toBe(code);
  });

  test("UI-CUS-007 Biên đầu mối khách hàng", { tag: ["@ui", "@p2"] }, async ({ page, seed, loginAs, customerDetailPage: d }) => {
    test.setTimeout(480_000);
    const k2 = await seed.customerWithContacts(2);
    const k1 = await seed.customerWithContacts(1);
    await loginAs('dvkhA');
    const add = async (c: { name: string; phone: string; email?: string; title?: string }) => {
      await d.goto(k2.customerId);
      await d.addContact.click();
      await d.contactName.fill(c.name);
      await d.contactTitle.fill(c.title ?? '');
      await d.contactPhone.fill(c.phone);
      await d.contactEmail.fill(c.email ?? '');
      const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/contacts$/.test(r.url()), { timeout: 5_000 }).catch(() => null);
      await d.contactSubmit.click();
      const s = (await res)?.status() ?? null;
      return s !== null && s < 300;
    };
    // Email đúng độ dài n và hợp lệ: phần trước @ ngắn (≤ 64 ký tự), tên miền chia nhãn ≤ 40 ký tự.
    const email = (n: number) => {
      const local = 'lienhe.dau.moi';
      let rest = n - local.length - 1 - '.vn'.length;
      const labels: string[] = [];
      while (rest > 0) {
        const len = Math.min(40, rest - (rest > 40 ? 1 : 0));
        labels.push('vantai'.repeat(7).slice(0, len));
        rest -= len + (rest - len > 0 ? 1 : 0);
      }
      return `${local}@${labels.join('.')}.vn`;
    };
    for (const n of [99, 100]) expect.soft(await add({ name: textOfLength(n), phone: L.phone() }), `Họ tên ${n}`).toBe(true);
    expect.soft(await add({ name: textOfLength(101), phone: L.phone() }), 'Họ tên 101').toBe(false);
    for (const n of [99, 100]) expect.soft(await add({ name: L.personName(), phone: L.phone(), email: email(n) }), `Email ${n}`).toBe(true);
    expect.soft(await add({ name: L.personName(), phone: L.phone(), email: email(101) }), 'Email 101').toBe(false);
    expect.soft(await add({ name: L.personName(), phone: L.phone() }), 'Trường tùy chọn bỏ trống').toBe(true);
    expect.soft(await add({ name: L.personName(), phone: '12345' }), 'SĐT sai pattern').toBe(false);

    // Đổi đầu mối chính, luôn đúng 1 đầu mối chính.
    await d.goto(k2.customerId);
    await d.setPrimary.first().click();
    await d.modal.confirm.click();
    await page.waitForLoadState('networkidle');
    expect((await seed.getCustomer(k2.customerId)).contacts.filter((c: any) => c.primary)).toHaveLength(1);

    // Xóa từ 2 về 1 được; xóa đầu mối cuối bị chặn và hiển thị lý do.
    const k2b = await seed.customerWithContacts(2);
    await d.goto(k2b.customerId);
    await d.deleteContact(1).click();
    await d.modal.button('Xoá đầu mối').click();
    await expect.poll(async () => (await seed.getCustomer(k2b.customerId)).contacts.length).toBe(1);
    expect((await seed.getCustomer(k2b.customerId)).contacts.filter((c: any) => c.primary)).toHaveLength(1);

    await d.goto(k1.customerId);
    const del = d.deleteContact(0);
    if ((await del.count()) && (await del.isEnabled())) {
      await del.click();
      if (await d.modal.button('Xoá đầu mối').isVisible().catch(() => false)) await d.modal.button('Xoá đầu mối').click();
      await expect(page.getByText(/ít nhất|cuối|không thể xóa|không thể xoá/i).first()).toBeVisible();
    }
    expect((await seed.getCustomer(k1.customerId)).contacts).toHaveLength(1);
  });

  test("UI-CUS-008 Biên hạn mức tín dụng", { tag: ["@ui", "@p2"] }, async ({ page, seed, loginAs, customerDetailPage: d }) => {
    test.setTimeout(300_000);
    const c = await seed.customer();
    await loginAs('dvkhA');
    await d.goto(c.customerId);
    await expect(d.main).toContainText('Chưa thiết lập');
    const statusBefore = JSON.stringify((await seed.getCustomer(c.customerId)).status);
    const save = async (value: string) => {
      await d.goto(c.customerId);
      await d.editCredit.click();
      await d.creditInput.fill(value);
      const res = page.waitForResponse((r) => r.url().includes('/credit-limit'), { timeout: 5_000 }).catch(() => null);
      await d.saveCredit.click();
      return (await res)?.status() ?? null;
    };
    expect.soft([null, 400], 'Hạn mức -1').toContain(await save('-1'));
    expect.soft([null, 400], 'Chữ trong ô số').toContain(await save('một trăm'));
    expect.soft((await seed.getCustomer(c.customerId)).creditLimit ?? null).toBeNull();

    expect.soft(await save('0'), 'Hạn mức 0').toBe(200);
    expect.soft((await seed.getCustomer(c.customerId)).creditLimit).toBe(0);
    await d.goto(c.customerId);
    await expect.soft(d.main, '0 hiển thị khác Chưa thiết lập').not.toContainText('Chưa thiết lập');

    for (const v of [1, 500_000_000]) {
      expect.soft(await save(String(v)), `Hạn mức ${v}`).toBe(200);
      expect.soft((await seed.getCustomer(c.customerId)).creditLimit).toBe(v);
      await d.goto(c.customerId);
      await expect.soft(d.main).toContainText(v.toLocaleString('vi-VN'));
    }
    expect.soft((await seed.history('/api/customers', c.customerId, 'dvkhA')).length, 'Có lịch sử').toBeGreaterThan(1);
    expect.soft(JSON.stringify((await seed.getCustomer(c.customerId)).status), 'Trạng thái KH không đổi').toBe(statusBefore);
    // Bỏ trống sau khi đã có hạn mức: theo quy tắc xóa giá trị đã chốt (chờ chốt), chỉ ghi nhận kết quả.
    const blank = await save('');
    test.info().annotations.push({ type: 'Bỏ trống hạn mức', description: `HTTP ${blank ?? 'không gửi'}; giá trị sau: ${(await seed.getCustomer(c.customerId)).creditLimit}` });
  });
});
