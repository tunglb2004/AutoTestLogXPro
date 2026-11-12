import { test, expect } from '../../../src/fixtures/page.fixture';
import { jsonPart } from '../../../src/api/http.client';
import * as L from '../../../src/data/lead.factory';
import * as F from '../../../src/data/file.factory';
import { newContractorContract } from '../../../src/data/contractor-contract.factory';
import { addDays, today } from '../../../src/utils/dates';
import { textOfLength } from '../../../src/utils/test-run';

test.describe("Chi tiết nhà thầu", () => {
  test("UI-VDRD-002 Nhà thầu Dừng hợp tác bị khóa thao tác", { tag: ["@ui", "@p1"] }, async ({ seed, loginAs, contractorDetailPage: d }) => {
    const t = await seed.terminatedContractor();
    await loginAs('qlnt');
    await d.goto(t.contractor.id);
    for (const b of [d.edit, d.addContact, d.editContact, d.updateTier, d.addContract, d.terminateButton]) await expect.soft(b).toHaveCount(0);
    await expect(d.reactivate).toBeVisible();
  });

  test("UI-VDRD-003 Nút Xóa chỉ hiện khi Tạo mới chưa có HĐ", { tag: ["@ui", "@p2"] }, async ({ seed, loginAs, contractorListPage: l }) => {
    // User chốt 2026-11-05: nút Xoá nằm ở màn danh sách nhà thầu.
    const n = await seed.contractor();
    const h = await seed.contractorWithContract();
    await loginAs('qlnt');
    await l.goto();
    await l.filter.search.fill(n.taxCode);
    await expect(l.rowDelete(n.code), 'Nhà thầu Tạo mới chưa có HĐ có nút Xoá').toBeVisible();
    await l.filter.search.fill(h.contractor.taxCode);
    await expect(l.table.row(h.contractor.code)).toHaveCount(1);
    await expect(l.rowDelete(h.contractor.code), 'Nhà thầu Đang hoạt động không có nút Xoá').toHaveCount(0);
  });

  test("UI-VDRD-006 Biên đầu mối nhà thầu", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractorDetailPage: d }) => {
    test.setTimeout(480_000);
    const one = await seed.contractorWithContract();
    const two = await seed.contractorWithContract();
    const add = await http.call('POST /api/contractors/{id}/contacts', { token: roles.qlnt.accessToken, params: { id: two.contractor.id }, json: { fullName: L.personName(), jobTitle: 'Kế toán', phone: L.phone(), email: 'ketoan.nhathau@example.vn' } });
    expect(add.ok(), 'Chuẩn bị nhà thầu có 2 đầu mối').toBe(true);
    await loginAs('qlnt');

    const edit = async (id: string, v: { name?: string; phone?: string; email?: string; title?: string }, cancel = false) => {
      await d.goto(id);
      await d.editContact.first().click();
      if (v.name !== undefined) await d.modal.input('Nhập họ tên').fill(v.name);
      if (v.title !== undefined) await d.modal.input('Nhập chức danh').fill(v.title);
      if (v.phone !== undefined) await d.modal.input('Nhập số điện thoại').fill(v.phone);
      if (v.email !== undefined) await d.modal.input('Nhập địa chỉ email').fill(v.email);
      const res = page.waitForResponse((r) => r.request().method() === 'PUT' && /\/contacts\//.test(r.url()), { timeout: 5_000 }).catch(() => null);
      if (cancel) await d.modal.cancel.click();
      else await d.modal.button('Lưu thay đổi').click();
      return (await res)?.status() ?? null;
    };
    const primaryName = async (id: string) => (await seed.getContractor(id)).contacts.find((c: any) => c.primary)?.fullName;

    for (const [label, v, ok] of [
      ['tên hợp lệ', { name: 'Trần Văn Điều Phối' }, true],
      ['tên rỗng', { name: '' }, false],
      ['tên 100', { name: textOfLength(100) }, true],
      ['tên 101', { name: textOfLength(101) }, false],
      ['SĐT sai', { phone: '12345' }, false],
      ['SĐT rỗng', { phone: '' }, false],
      ['email sai', { email: 'abc@' }, false],
      ['email rỗng', { email: '' }, true],
      ['chức danh 100', { title: textOfLength(100) }, true],
    ] as const) {
      const before = await primaryName(one.contractor.id);
      const s = await edit(one.contractor.id, v);
      if (ok) expect.soft(s, label).toBe(200);
      else {
        expect.soft([null, 400], label).toContain(s);
        expect.soft(await primaryName(one.contractor.id), `${label}: dữ liệu không đổi`).toBe(before);
      }
    }
    const before = await primaryName(one.contractor.id);
    await edit(one.contractor.id, { name: 'Tên bị hủy' }, true);
    expect.soft(await primaryName(one.contractor.id), 'Hủy không đổi dữ liệu').toBe(before);

    // Đổi đầu mối chính, xóa khi còn 2, xóa đầu mối cuối bị chặn.
    await d.goto(two.contractor.id);
    const setPrimary = page.getByText('Đặt làm liên hệ chính', { exact: true }).filter({ visible: true });
    await expect.soft(setPrimary.first(), 'Có thao tác đổi đầu mối chính').toBeVisible();
    if (await setPrimary.count()) {
      await setPrimary.first().click();
      if (await d.modal.confirm.isVisible().catch(() => false)) await d.modal.confirm.click();
      await page.waitForLoadState('networkidle');
    }
    expect((await seed.getContractor(two.contractor.id)).contacts.filter((c: any) => c.primary)).toHaveLength(1);
    const del = page.getByRole('button', { name: /Xoá (đầu mối|người liên hệ)/ }).filter({ visible: true });
    await expect.soft(del.first(), 'Có thao tác xóa đầu mối').toBeVisible();
    if (await del.last().isVisible().catch(() => false)) {
      await del.last().click();
      await d.modal.button(/^(Xoá.*|Xác nhận)$/).click();
      await expect.poll(async () => (await seed.getContractor(two.contractor.id)).contacts.length).toBe(1);
      await d.goto(one.contractor.id);
      if (await del.count()) {
        await del.first().click();
        if (await d.modal.dialog.isVisible().catch(() => false)) await d.modal.button(/^(Xoá.*|Xác nhận)$/).click();
        await expect.soft(page.getByText(/ít nhất|cuối|không thể xóa|không thể xoá/i).first()).toBeVisible();
      }
    }
    expect((await seed.getContractor(one.contractor.id)).contacts).toHaveLength(1);
  });

  test("UI-VDRD-008 Nút Xóa nhà thầu theo lịch sử hợp đồng", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, contractorDetailPage: d, contractorListPage: l }) => {
    const t = roles.qlnt.accessToken;
    const none = await seed.contractor();
    const none2 = await seed.contractor();
    const withPending = await seed.contractor();
    const withCancelled = await seed.contractor();
    const pendingBody = (id: string) => newContractorContract(id, { signedOn: today(), effectiveFrom: addDays(today(), 10) });
    const p1 = await http.call('POST /api/contractor-contracts', { token: t, multipart: { contract: jsonPart('contract', pendingBody(withPending.id)), file: F.pdf('hop-dong-nha-thau.pdf') } });
    const p2 = await http.call('POST /api/contractor-contracts', { token: t, multipart: { contract: jsonPart('contract', pendingBody(withCancelled.id)), file: F.pdf('hop-dong-nha-thau.pdf') } });
    expect(p1.ok() && p2.ok(), 'Chuẩn bị HĐ Chưa hiệu lực').toBe(true);
    const c2 = (await p2.json()).data;
    expect((await http.call('POST /api/contractor-contracts/{id}/cancel', { token: t, params: { id: c2.id }, json: { reason: 'Nhà thầu rút hồ sơ' } })).ok()).toBe(true);
    await loginAs('qlnt');

    // Nút Xoá nằm ở màn danh sách nhà thầu (user chốt 2026-11-05).
    const findRow = async (c: any) => {
      await l.goto();
      await l.filter.search.fill(c.taxCode);
      await expect(l.table.row(c.code)).toHaveCount(1);
    };
    await findRow(withPending);
    await expect.soft(l.rowDelete(withPending.code), 'Có HĐ Chưa hiệu lực: không có nút Xoá').toHaveCount(0);
    await findRow(withCancelled);
    await expect.soft(l.rowDelete(withCancelled.code), 'Có HĐ Đã hủy: không có nút Xoá').toHaveCount(0);

    await findRow(none);
    await expect(l.rowDelete(none.code)).toBeVisible();
    await l.rowDelete(none.code).click();
    await d.modal.cancel.click();
    expect((await http.call('GET /api/contractors/{id}', { token: t, params: { id: none.id } })).status(), 'Hủy giữ nguyên').toBe(200);

    await findRow(none2);
    await l.rowDelete(none2.code).click();
    const res = page.waitForResponse((r) => r.request().method() === 'DELETE' && r.url().includes(none2.id));
    // Popup "Xoá nhà thầu" có nút xác nhận "Xoá nhà thầu" và nút "Huỷ".
    await d.modal.button(/^(Xác nhận( xóa| xoá)?|Xoá nhà thầu|Xóa nhà thầu)$/).click();
    expect((await res).status()).toBe(204);
    await l.goto();
    await l.filter.search.fill(none2.taxCode);
    await expect(l.table.rows.filter({ hasText: none2.code })).toHaveCount(0);
    expect((await http.call('GET /api/contractors/{id}', { token: t, params: { id: none2.id } })).status()).toBe(404);
  });
});
