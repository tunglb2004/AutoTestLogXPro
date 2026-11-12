import { test, expect } from '../../../src/fixtures/page.fixture';
import { data, items, jsonPart } from '../../../src/api/http.client';
import * as F from '../../../src/data/file.factory';
import * as C from '../../../src/data/contract.factory';
import { chooseOption, optionTexts } from '../../../src/pages/components/filter-bar.component';
import { addDays, today } from '../../../src/utils/dates';
import { textOfLength } from '../../../src/utils/test-run';

async function managerName(http: any, roles: any, key: string): Promise<string | undefined> {
  const list = items(await data(await http.call('GET /api/customers/assignable-managers', { token: roles.dvkhA.accessToken })));
  const m = list.find((x: any) => (x.id ?? x.userId) === roles[key].userId);
  return m?.displayName ?? m?.fullName ?? m?.name;
}

async function codesOnTable(page: import('@playwright/test').Page): Promise<string[]> {
  await page.locator('main table tbody tr').first().waitFor();
  return (await page.locator('main table tbody tr a[href^="/customers/"]').allInnerTexts()).map((t) => t.trim()).filter((t) => /^CUS-/.test(t));
}

test.describe("Danh sách và chi tiết khách hàng", () => {
  test("UI-CUS-001 Tìm và lọc khách hàng", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, customerListPage: l }) => {
    const active = await seed.customer();
    await seed.customer({ pending: true });
    await loginAs('dvkhA');
    await l.goto();
    const sameAsApi = async (trigger: () => Promise<unknown>, param: RegExp) => {
      const res = page.waitForResponse((r) => /\/api\/customers\?/.test(r.url()) && param.test(decodeURIComponent(r.url())) && r.request().method() === 'GET');
      await trigger();
      const query = Object.fromEntries(new URL((await res).url()).searchParams.entries());
      const api = await data(await http.call('GET /api/customers', { token: roles.dvkhA.accessToken, query }));
      await expect.poll(() => codesOnTable(page)).toEqual(items(api).map((c: any) => c.customerCode));
      return api;
    };
    const byCode = await sameAsApi(() => l.filter.search.fill(active.contract.code), /search=/);
    expect(items(byCode).map((c: any) => c.id)).toContain(active.customerId);
    await l.filter.search.fill('');
    const suspended = await sameAsApi(() => chooseOption(l.filter.statusFilter, /Tạm ngưng/), /status=/);
    for (const c of items(suspended)) expect(JSON.stringify(c.status)).toMatch(/SUSPENDED/);
  });

  test("UI-CUS-002 Lý do tạm ngưng hiển thị rõ", { tag: ["@ui", "@p2"] }, async ({ seed, loginAs, customerDetailPage: d }) => {
    const c = await seed.customer({ pending: true });
    const api = await seed.getCustomer(c.customerId);
    expect(JSON.stringify(api.suspendReason)).toMatch(/PENDING_CONTRACT/);
    await loginAs('dvkhA');
    await d.goto(c.customerId);
    await expect(d.main).toContainText(/Tạm ngưng/);
    // User chốt 2026-11-05: lý do tạm ngưng xem trong Lịch sử thao tác.
    await d.page.getByRole('button', { name: 'Lịch sử thao tác', exact: true }).click();
    await expect(d.modal.dialog).toContainText(/chưa (có )?hiệu lực|chờ hiệu lực|tạm ngưng/i);
  });

  test("UI-CUS-003 Chuyển người phụ trách", { tag: ["@ui", "@p1"] }, async ({ page, seed, http, roles, loginAs, customerDetailPage: d }) => {
    const c = await seed.customer();
    const nameB = await managerName(http, roles, 'dvkhB');
    expect(nameB, 'DVKH B phải có trong danh sách người nhận').toBeTruthy();
    await loginAs('dvkhA');
    await d.goto(c.customerId);
    await d.transfer.click();
    await chooseOption(d.newManager, nameB!);
    await d.modal.reason.fill('Phân lại danh mục khách hàng theo khu vực');
    const res = page.waitForResponse((r) => r.url().includes('/transfer-account-manager'));
    await d.modal.confirm.click();
    expect((await res).status()).toBe(204);
    await expect(d.toast.message.filter({ hasText: /thành công/i }).first()).toBeVisible();
    // DVKH A không còn phụ trách: không còn nút sửa (API 404 với người không phụ trách là đúng, user chốt 2026-11-05).
    await page.reload();
    await page.waitForLoadState('networkidle');
    for (const b of [d.edit, d.editTier, d.transfer]) await expect(b).toHaveCount(0);
    // Người phụ trách hiển thị DVKH B (xem bằng tài khoản DVKH B).
    await loginAs('dvkhB');
    await d.goto(c.customerId);
    await expect(d.main).toContainText(nameB!);
  });

  test("UI-CUS-009 Đổi phân hạng và chuyển người phụ trách với dữ liệu biên", { tag: ["@ui", "@p2"] }, async ({ page, seed, http, roles, loginAs, customerDetailPage: d }) => {
    test.setTimeout(480_000);
    await loginAs('dvkhA');

    await test.step('Ô hạng chỉ có 2 giá trị; Thường → Chiến lược → Thường; Hủy giữ nguyên', async () => {
      const c = await seed.customer();
      await d.goto(c.customerId);
      await d.editTier.click();
      expect(await optionTexts(d.tierSelect)).toEqual(['Khách hàng thường', 'Khách hàng chiến lược']);
      await chooseOption(d.tierSelect, 'Khách hàng chiến lược');
      await d.modal.cancel.click();
      expect((await seed.getCustomer(c.customerId)).tier).toBe('REGULAR');
      for (const [label, code] of [['Khách hàng chiến lược', 'STRATEGIC'], ['Khách hàng thường', 'REGULAR']] as const) {
        await d.editTier.click();
        await chooseOption(d.tierSelect, label);
        await d.saveTier.click();
        await expect.poll(async () => (await seed.getCustomer(c.customerId)).tier).toBe(code);
      }
      // Sửa trường khác không đổi hạng.
      await d.edit.click();
      await d.address.fill('Số 25 đường Trần Phú, Lạng Sơn');
      await d.saveEdit.click();
      await expect.poll(async () => (await seed.getCustomer(c.customerId)).headOfficeAddress).toBe('Số 25 đường Trần Phú, Lạng Sơn');
      expect((await seed.getCustomer(c.customerId)).tier).toBe('REGULAR');
    });

    await test.step('Chuyển người phụ trách: không có người hiện tại; lý do rỗng, 501 bị chặn; 500 lưu và cập nhật HĐ liên quan; Hủy giữ nguyên', async () => {
      const nameA = await managerName(http, roles, 'dvkhA');
      const nameB = (await managerName(http, roles, 'dvkhB'))!;
      const managers = items(await data(await http.call('GET /api/customers/assignable-managers', { token: roles.dvkhA.accessToken })));
      for (const [label, reason, ok] of [['rỗng', '', false], ['501', textOfLength(501), false], ['Hủy', 'Phân lại khu vực', null], ['500', textOfLength(500), true]] as const) {
        const c = await seed.customer();
        await d.goto(c.customerId);
        await d.transfer.click();
        const opts = await optionTexts(d.newManager);
        if (nameA) expect.soft(opts, 'Không có người đang phụ trách').not.toContain(nameA);
        for (const m of managers.filter((x: any) => x.active === false || x.locked === true)) expect.soft(opts).not.toContain(m?.displayName ?? m?.fullName ?? m?.name);
        await chooseOption(d.newManager, nameB);
        await d.modal.reason.fill(reason);
        const chan1 = await d.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        if (ok === null) await d.modal.cancel.click();
        else await d.modal.confirm.click();
        await page.waitForLoadState('networkidle');
        const after = await http.call('GET /api/customers/{id}', { token: roles.dvkhB.accessToken, params: { id: c.customerId } });
        const viaA = await http.call('GET /api/customers/{id}', { token: roles.dvkhA.accessToken, params: { id: c.customerId } });
        const managerId = after.ok() ? (await data(after))?.accountManagerId : viaA.ok() ? (await data(viaA))?.accountManagerId : undefined;
        expect.soft(managerId, `Lý do ${label}`).toBe(ok || chan1 ? roles.dvkhB.userId : roles.dvkhA.userId);
        if (ok || chan1) {
          const contract = await http.call('GET /api/contracts/{id}', { token: roles.dvkhB.accessToken, params: { id: c.contract.id } });
          expect.soft((await data(contract))?.accountManagerId, 'HĐ liên quan đổi người phụ trách').toBe(roles.dvkhB.userId);
        }
      }
    });
  });

  test("UI-CUS-010 HĐ hiện hành và trạng thái KH theo tổ hợp hợp đồng", { tag: ["@ui", "@p1"] }, async ({ seed, http, roles, loginAs, customerListPage: l, customerDetailPage: d }) => {
    test.setTimeout(300_000);
    const t = roles.dvkhA.accessToken;
    // 1. HĐ hiệu lực + HĐ chờ → hiện hành là HĐ hiệu lực.
    const both = await seed.customerWithPendingResign();
    // 2. Chỉ HĐ chờ → hiện hành là HĐ chờ, KH Tạm ngưng chờ hiệu lực.
    const onlyPending = await seed.customer({ pending: true });
    // 3. Chỉ HĐ dừng khai thác.
    const suspended = await seed.customer();
    expect((await http.call('POST /api/contracts/{id}/suspend', { token: t, params: { id: suspended.contract.id }, json: { reason: 'Khách dừng sử dụng dịch vụ' } })).ok()).toBe(true);
    // 4. Chỉ HĐ đóng: HĐ hết hạn + HĐ tái ký sau đó bị hủy → HĐ đóng có ngày hiệu lực lớn nhất là HĐ đã hủy.
    const lead = await seed.lead();
    const expiredBody = C.uploadContract(lead.id, roles.dvkhA.userId, { signedOn: addDays(today(), -400), effectiveFrom: addDays(today(), -400), effectiveTo: addDays(today(), -1) });
    const expiredRes = await http.call('POST /api/contracts', { token: roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', expiredBody), file: F.pdf() } });
    expect(expiredRes.ok(), 'Tạo HĐ đã hết hạn').toBe(true);
    const expired = await data(expiredRes);
    const resign = await http.call('POST /api/contracts/{id}/resign', { token: t, params: { id: expired.id }, multipart: { contract: jsonPart('contract', C.resignContract(addDays(today(), 10))), file: F.pdf('tai-ky.pdf') } });
    expect(resign.ok(), 'Tái ký HĐ hết hạn').toBe(true);
    const later = await data(resign);
    expect((await http.call('POST /api/contracts/{id}/cancel', { token: t, params: { id: later.id }, json: { reason: 'Khách đổi kế hoạch' } })).ok()).toBe(true);

    const cases = [
      { label: 'HĐ hiệu lực + HĐ chờ', id: both.customerId, current: both.contract.code, status: /Đang hoạt động/ },
      { label: 'Chỉ HĐ chờ', id: onlyPending.customerId, current: onlyPending.contract.code, status: /Tạm ngưng/, reason: /chưa (có )?hiệu lực|chờ hiệu lực|tạm ngưng/i },
      { label: 'Chỉ HĐ dừng khai thác', id: suspended.customerId, current: suspended.contract.code, status: /Tạm ngưng|Ngưng/ },
      { label: 'Chỉ HĐ đóng', id: expired.customerId, current: later.code, status: /Tạm ngưng|Ngưng/ },
    ];
    await loginAs('dvkhA');
    for (const c of cases) {
      const api = await seed.getCustomer(c.id);
      expect.soft(api.currentContract?.code, `${c.label}: HĐ hiện hành theo API`).toBe(c.current);
      await l.goto();
      await l.filter.search.fill(api.customerCode);
      const row = l.table.row(api.customerCode);
      await expect.soft(row, `${c.label}: KH vẫn hiện trong danh sách`).toHaveCount(1);
      await expect.soft(row, c.label).toContainText(c.current);
      await expect.soft(row, c.label).toContainText(c.status);
      await d.goto(c.id);
      await expect.soft(d.main, c.label).toContainText(c.status);
      if (c.reason) {
        // Lý do tạm ngưng xem trong Lịch sử thao tác (user chốt 2026-11-05).
        await d.page.getByRole('button', { name: 'Lịch sử thao tác', exact: true }).click();
        await expect.soft(d.modal.dialog, c.label).toContainText(c.reason);
        await d.modal.close.click();
      }
    }
  });
});
