import { test, expect } from '../../../src/fixtures/page.fixture';

test.describe("Dùng chung cho danh sách, bộ lọc, xuất file và quyền của 5 module", () => {
  test("UI-COM-004 Nút và ô nhập theo quyền và trạng thái", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, leadDetailPage: ld, customerDetailPage: cd, contractorDetailPage: vd }) => {
    test.setTimeout(300_000);
    const lead = await seed.lead();
    const inactive = await seed.inactiveLead();
    const customer = await seed.customer();
    const active = await seed.contractorWithContract();
    const terminated = await seed.terminatedContractor();

    await test.step('Lead: người phụ trách có nút thao tác; Lead ngưng chỉ còn Kích hoạt lại; NVKD khác không thao tác được', async () => {
      await loginAs('nvkdA');
      await ld.goto(lead.id);
      for (const b of [ld.edit, ld.deactivate, ld.transfer, ld.addContact]) await expect.soft(b).toBeVisible();
      await ld.goto(inactive.id);
      await expect.soft(ld.reactivate).toBeVisible();
      for (const b of [ld.edit, ld.deactivate, ld.addContact]) await expect.soft(b).toHaveCount(0);
      await loginAs('nvkdB');
      await page.goto(`/leads/${lead.id}`);
      await page.waitForLoadState('networkidle');
      for (const b of [ld.edit, ld.deactivate, ld.transfer, ld.addContact]) await expect.soft(b, 'NVKD không phụ trách').toHaveCount(0);
    });

    await test.step('Khách hàng: DVKH phụ trách có nút sửa; DVKH khác (chỉ xem hoặc không quyền) không có', async () => {
      await loginAs('dvkhA');
      await cd.goto(customer.customerId);
      for (const b of [cd.edit, cd.editTier, cd.transfer, cd.editCredit, cd.addContact]) await expect.soft(b).toBeVisible();
      await loginAs('dvkhB');
      await page.goto(`/customers/${customer.customerId}`);
      await page.waitForLoadState('networkidle');
      for (const b of [cd.edit, cd.editTier, cd.transfer, cd.editCredit, cd.addContact]) await expect.soft(b, 'DVKH không phụ trách').toHaveCount(0);
    });

    await test.step('Nhà thầu: Đang hoạt động có Sửa, Cập nhật hạng, Dừng hợp tác; Dừng hợp tác chỉ còn Kích hoạt lại', async () => {
      await loginAs('qlnt');
      await vd.goto(active.contractor.id);
      for (const b of [vd.edit, vd.updateTier, vd.terminateButton]) await expect.soft(b).toBeVisible();
      await vd.goto(terminated.contractor.id);
      await expect.soft(vd.reactivate).toBeVisible();
      for (const b of [vd.edit, vd.updateTier, vd.terminateButton]) await expect.soft(b).toHaveCount(0);
    });

    await test.step('Người không có quyền module: NVKD vào màn nhà thầu bị chặn', async () => {
      await loginAs('nvkdA');
      await page.goto(`/suppliers/${active.contractor.id}`);
      await page.waitForLoadState('networkidle');
      for (const b of [vd.edit, vd.updateTier, vd.terminateButton]) await expect.soft(b, 'NVKD không có quyền nhà thầu').toHaveCount(0);
    });
  });
});
