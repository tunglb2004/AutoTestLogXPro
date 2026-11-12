import { test, expect } from '../../../src/fixtures/page.fixture';
import { data, items } from '../../../src/api/http.client';
import { purchasePrice } from '../../../src/data/purchase-price.factory';
import { chooseOption, chooseFirstOption, pickDate, optionTexts } from '../../../src/pages/components/filter-bar.component';
import { textOfLength } from '../../../src/utils/test-run';

const TIER_LABEL: Record<string, string> = { STRATEGIC: 'Chiến lược', PREFERRED: 'Ưu tiên', BACKUP: 'Dự phòng' };

test.describe("Chi tiết nhà thầu", () => {
  test("UI-VDRD-004 Chuyển giữa các tab", { tag: ["@ui", "@p3"] }, async ({ page, seed, loginAs, contractorDetailPage: d }) => {
    const h = await seed.contractorWithContract();
    await loginAs('qlnt');
    await d.goto(h.contractor.id);
    await d.infoTab.click();
    await expect(d.main).toContainText(new RegExp(`Mã số thuế:\\s*${h.contractor.taxCode}`));
    await d.contractsTab.click();
    await expect(d.main).toContainText(h.contract.code);
    await d.priceTab.click();
    await expect(d.main.getByText(/bảng giá|ĐƠN GIÁ/i).first()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(h.contractor.id));
    await d.history.click();
    await expect(d.modal.dialog).toContainText(/lịch sử/i);
    await d.modal.close.click();
    // Không kiểm F5 giữ tab: SRS không yêu cầu (user chốt 2026-11-05).
  });

  test("UI-VDRD-005 Tạo bảng giá mua cho nhà thầu vừa tạo rồi kiểm tra tab Bảng giá dịch vụ", { tag: ["@ui", "@p1"] }, async ({ page, seed, http, roles, loginAs, purchasePriceFormPage: f, contractorDetailPage: d }) => {
    test.setTimeout(180_000);
    const h = await seed.contractorWithContract();
    const pp = purchasePrice(h.contract.effectiveTo);
    await loginAs('qlnt');
    await f.goto();
    await f.name.fill(pp.name);
    const opts = await optionTexts(f.contractor);
    expect(opts, 'Ô chọn nhà thầu phải có nhà thầu vừa tạo').toContain(h.contractor.name);
    await chooseOption(f.contractor, h.contractor.name);
    await expect(f.contractCode).toHaveValue(h.contract.code);
    await pickDate(f.effectiveFrom, pp.effectiveFrom);
    await pickDate(f.effectiveTo, pp.effectiveTo);
    // 1 dòng giá cho đầu mục giá Cố định đầu tiên, đơn giá 1.000.000.
    // Đầu mục đầu tiên của tab dịch vụ mặc định (CD-010 Khai báo hải quan) là loại giá Cố định.
    await expect(page.locator('main').getByText(/Loại giá:\s*Cố định/).first()).toBeVisible();
    await f.addLine.click();
    const selects = f.lineSelects;
    const n = await selects.count();
    for (let i = 0; i < n; i++) {
      const t = (await selects.nth(i).innerText()).trim();
      if (/^Chọn/.test(t)) await chooseFirstOption(selects.nth(i));
    }
    await f.unitPrice.fill('1000000');
    await f.lineSubmit.click();
    const res = page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/purchase-prices$/.test(new URL(r.url()).pathname));
    await f.save.click();
    expect((await res).status()).toBe(201);
    const created = (await (await res).json()).data;

    const detailRes = page.waitForResponse((r) => r.url().endsWith(`/api/contractors/${h.contractor.id}`) && r.request().method() === 'GET');
    await d.goto(h.contractor.id);
    expect((await detailRes).status()).toBe(200);
    await d.priceTab.click();
    const rows = d.main.locator('table tbody tr').filter({ hasText: /\S/ });
    await expect(rows.first()).toBeVisible();
    await expect.soft(rows, 'Đúng 1 dòng').toHaveCount(1);
    const row = rows.first();
    await expect(row, 'Mã bảng giá vừa sinh').toContainText(created.code);
    // SRS (khối Bảng giá mua đầu vào, BR-CTV-20) chỉ yêu cầu bảng giá mua kèm trạng thái hiệu lực; không kiểm tên, ngày, mã HĐ.
    await expect.soft(row, 'Trạng thái Tạo mới').toContainText('Tạo mới');
    // Không lẫn bảng giá của nhà thầu khác.
    const all = items(await data(await http.call('GET /api/purchase-prices', { token: roles.qlnt.accessToken, query: { contractorId: h.contractor.id, page: 1, perPage: 100 } })));
    expect(all.map((p: any) => p.code)).toEqual([created.code]);
    for (const text of await rows.allInnerTexts()) expect(text).toContain(created.code);
    await row.click();
    await expect(page, 'Bấm vào mở đúng bảng giá').toHaveURL(new RegExp(`/purchase-prices/${created.id}`));
  });

  test("UI-VDRD-001 Thông tin chung khớp API", { tag: ["@ui", "@p1"] }, async ({ seed, loginAs, contractorDetailPage: d }) => {
    const h = await seed.contractorWithContract();
    const doc = await seed.contractorWithDocument();
    const api = await seed.getContractor(h.contractor.id);
    await loginAs('qlnt');
    await d.goto(api.id);
    await expect(d.main).toContainText(api.code);
    await expect(d.main).toContainText(api.name);
    await expect(d.main).toContainText(api.taxCode);
    await expect(d.main).toContainText(TIER_LABEL[api.tier?.code ?? api.tier] ?? String(api.tier));
    for (const s of api.serviceTypes ?? []) await expect.soft(d.main).toContainText(s.name ?? s);
    for (const c of api.contacts ?? []) await expect.soft(d.main).toContainText(c.fullName);
    for (const f of api.documents ?? []) await expect.soft(d.main).toContainText(f.filename ?? f.name);
    await d.contractsTab.click();
    await expect(d.main).toContainText(h.contract.code);

    // Tài liệu đính kèm hiển thị đúng tên trên nhà thầu có tài liệu.
    const withDoc = await seed.getContractor(doc.contractor.id);
    await d.goto(withDoc.id);
    await expect.soft(d.main).toContainText(doc.doc.filename ?? doc.file.name);
  });

  test("UI-VDRD-007 Biên popup đổi hạng, dừng hợp tác, kích hoạt lại", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, contractorDetailPage: d }) => {
    test.setTimeout(600_000);
    await loginAs('qlnt');
    const reasons: [string, string, boolean][] = [
      ['rỗng', '', false],
      ['khoảng trắng', '     ', false],
      ['499', textOfLength(499), true],
      ['500', textOfLength(500), true],
      ['501', textOfLength(501), false],
    ];

    await test.step('Đổi hạng: hạng cũ, chưa chọn bị chặn; hạng mới + lý do hợp lệ lưu; Hủy giữ nguyên', async () => {
      const h = await seed.contractorWithContract();
      const oldTier = h.contractor.tier?.code ?? h.contractor.tier;
      const newLabel = Object.entries(TIER_LABEL).find(([k]) => k !== oldTier)![1];
      for (const [label, tier] of [['chưa chọn', null], ['hạng cũ', TIER_LABEL[oldTier]]] as const) {
        await d.goto(h.contractor.id);
        await d.updateTier.click();
        if (tier) await chooseOption(d.tierSelect, tier);
        await d.modal.reason.fill('Đánh giá lại năng lực quý');
        await d.modal.button('Cập nhật').click();
        await page.waitForLoadState('networkidle');
        expect.soft((await seed.getContractor(h.contractor.id)).tier?.code ?? (await seed.getContractor(h.contractor.id)).tier, label).toBe(oldTier);
      }
      await d.goto(h.contractor.id);
      await d.updateTier.click();
      await chooseOption(d.tierSelect, newLabel);
      await d.modal.reason.fill('Đánh giá lại năng lực quý');
      await d.modal.cancel.click();
      expect.soft(JSON.stringify((await seed.getContractor(h.contractor.id)).tier)).toContain(oldTier);
      for (const [label, reason, ok] of reasons) {
        const c = await seed.contractorWithContract();
        const before = c.contractor.tier?.code ?? c.contractor.tier;
        const target = Object.entries(TIER_LABEL).find(([k]) => k !== before)!;
        await d.goto(c.contractor.id);
        await d.updateTier.click();
        await chooseOption(d.tierSelect, target[1]);
        await d.modal.reason.fill(reason);
        const chan1 = await d.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        await d.modal.button('Cập nhật').click();
        await page.waitForLoadState('networkidle');
        const after = await seed.getContractor(c.contractor.id);
        expect.soft(after.tier?.code ?? after.tier, `Đổi hạng lý do ${label}`).toBe(ok || chan1 ? target[0] : before);
        if (ok || chan1) expect.soft((await seed.history('/api/contractors', c.contractor.id, 'qlnt')).length, 'Có lịch sử').toBeGreaterThan(1);
      }
    });

    await test.step('Dừng hợp tác: lý do sai giữ nguyên; hợp lệ thì nhà thầu Dừng hợp tác, HĐ bị tác động; Không giữ nguyên', async () => {
      const keep = await seed.contractorWithContract();
      await d.goto(keep.contractor.id);
      await d.terminateButton.click();
      await d.modal.reason.fill('Vi phạm chất lượng dịch vụ');
      await d.modal.button('Không').click();
      expect.soft(JSON.stringify((await seed.getContractor(keep.contractor.id)).status)).toMatch(/ACTIVE/);
      for (const [label, reason, ok] of reasons) {
        const c = await seed.contractorWithContract();
        await d.goto(c.contractor.id);
        await d.terminateButton.click();
        await d.modal.reason.fill(reason);
        const chan2 = await d.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        await d.modal.button('Dừng hợp tác').click();
        await page.waitForLoadState('networkidle');
        const after = await seed.getContractor(c.contractor.id);
        expect.soft(JSON.stringify(after.status), `Dừng hợp tác lý do ${label}`).toMatch(ok || chan2 ? /TERMINATED/ : /ACTIVE/);
        if (ok || chan2) {
          const contract = await seed.getContractorContract(c.contract.id);
          expect.soft(JSON.stringify(contract.status), 'HĐ bị dừng khai thác/hủy').toMatch(/SUSPENDED|CANCELLED/);
          await d.goto(c.contractor.id);
          await d.contractsTab.click();
          await expect.soft(d.main).not.toContainText('Đang hiệu lực');
        }
      }
    });

    await test.step('Kích hoạt lại nhà thầu Dừng hợp tác: lý do sai giữ nguyên, hợp lệ đổi trạng thái', async () => {
      for (const [label, reason, ok] of reasons) {
        const t = await seed.terminatedContractor();
        await d.goto(t.contractor.id);
        await d.reactivate.click();
        if (await d.modal.reason.isVisible().catch(() => false)) await d.modal.reason.fill(reason);
        const chan3 = await d.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        await d.modal.button(/^(Xác nhận|Kích hoạt lại)$/).click();
        await page.waitForLoadState('networkidle');
        const after = await seed.getContractor(t.contractor.id);
        expect.soft(JSON.stringify(after.status), `Kích hoạt lại lý do ${label}`).toMatch(ok || chan3 ? /NEW|ACTIVE|SUSPENDED/ : /TERMINATED/);
        if (ok || chan3) expect.soft(JSON.stringify(after.status)).not.toMatch(/TERMINATED/);
      }
    });
  });
});
