import { test, expect } from '../../../src/fixtures/page.fixture';

test.describe("Danh sách và chi tiết khách hàng", () => {
  test("UI-CUS-004 DVKH không phụ trách không có nút sửa", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, customerDetailPage: d }) => {
    const c = await seed.customer();
    await loginAs('dvkhB');
    const res = page.waitForResponse((r) => r.url().includes(`/api/customers/${c.customerId}`) && r.request().method() === 'GET');
    await page.goto(`/customers/${c.customerId}`);
    // User chốt 2026-11-05: 404 cho người không phụ trách là đúng.
    expect([200, 403, 404]).toContain((await res).status());
    await page.waitForLoadState('networkidle');
    for (const b of [d.edit, d.editTier, d.transfer, d.editCredit, d.addContact]) await expect(b).toHaveCount(0);
  });
});
