import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures/page.fixture';
import * as L from '../../../src/data/lead.factory';
import { randDigits, textOfLength } from '../../../src/utils/test-run';

function watchCreate(page: Page) {
  const calls: string[] = [];
  page.on('request', (r) => r.method() === 'POST' && /\/api\/contractors$/.test(new URL(r.url()).pathname) && calls.push(r.url()));
  return calls;
}

test.describe("Danh sách và thêm mới nhà thầu", () => {
  test("UI-VDR-003 Bỏ trống trường bắt buộc, điểm năng lực ngoài 0–5", { tag: ["@ui", "@p1"] }, async ({ page, loginAs, contractorFormPage: f }) => {
    await loginAs('qlnt');
    const writes = watchCreate(page);
    await f.goto();
    await f.score.fill('6');
    await f.save.click();
    for (const msg of ['Vui lòng nhập tên nhà thầu', 'Vui lòng chọn phân hạng', /Mã số thuế/, 'Vui lòng chọn ít nhất 1 loại dịch vụ', /Điểm từ 0 đến 5/])
      await expect.soft(f.error(msg)).toBeVisible();
    expect(writes).toEqual([]);
  });

  test("UI-VDR-007 Biên và phân vùng form thêm, sửa nhà thầu", { tag: ["@ui", "@p1"] }, async ({ page, seed, loginAs, contractorFormPage: f }) => {
    test.setTimeout(1_200_000);
    await loginAs('qlnt');
    const dup = await seed.contractor();

    await test.step('Bỏ riêng từng trường bắt buộc', async () => {
      const writes = watchCreate(page);
      for (const [label, omit, msg] of [
        ['tên', { name: null }, 'Vui lòng nhập tên nhà thầu'],
        ['phân hạng', { tier: null }, 'Vui lòng chọn phân hạng'],
        ['MST', { taxCode: null }, /Mã số thuế/],
        ['loại dịch vụ', { service: null }, 'Vui lòng chọn ít nhất 1 loại dịch vụ'],
        ['hạn mức sản lượng', { capacity: null }, 'Vui lòng nhập hạn mức sản lượng khuyến nghị'],
        ['mô tả năng lực', { capability: null }, 'Vui lòng nhập mô tả năng lực'],
        ['điểm', { score: null }, /Điểm|điểm/],
        ['họ tên liên hệ', { contactName: null }, 'Vui lòng nhập họ tên'],
        ['SĐT liên hệ', { contactPhone: null }, 'Vui lòng nhập số điện thoại'],
      ] as const) {
        await f.goto();
        await f.fill({ taxCode: L.taxCode(), ...omit });
        await f.save.click();
        await expect.soft(f.error(msg).first(), `Thiếu ${label}`).toBeVisible();
        await expect.soft(f.toast.fieldErrors, `Chỉ 1 thông báo cho ${label}`).toHaveCount(1);
      }
      expect.soft(writes).toEqual([]);
    });

    const create = async (patch: Parameters<typeof f.fill>[0]) => {
      await f.goto();
      const tax = patch.taxCode ?? L.taxCode();
      await f.fill({ ...patch, taxCode: tax });
      const res = await f.submit();
      return { status: res?.status() ?? null, tax };
    };

    await test.step('MST: 10 và 13 số có số 0 đầu lưu đúng; 9, 11, 12, 14, chữ xen số, trùng bị chặn', async () => {
      for (const tax of [`0${randDigits(9)}`, `0${randDigits(12)}`]) {
        const r = await create({ taxCode: tax });
        expect.soft(r.status, `MST ${tax}`).toBe(201);
        expect.soft((await seed.contractorsByTax(tax)).map((c: any) => c.taxCode)).toEqual([tax]);
      }
      for (const tax of [randDigits(9, true), randDigits(11, true), randDigits(12, true), randDigits(14, true), '12345abc90']) {
        const r = await create({ taxCode: tax });
        expect.soft(r.status, `MST ${tax}`).toBeNull();
        await expect.soft(f.error(/Mã số thuế/).first()).toBeVisible();
      }
      const r = await create({ taxCode: dup.taxCode });
      expect.soft([400, 409], 'MST trùng (400 hoặc 409 đều đạt)').toContain(r.status);
    });

    await test.step('Điểm năng lực: 0, 1, 4, 5 lưu được; rỗng, -1, 6, -0.01, 5.01 bị chặn', async () => {
      for (const s of ['0', '1', '4', '5']) {
        const r = await create({ score: s });
        expect.soft(r.status, `Điểm ${s}`).toBe(201);
        const [c] = await seed.contractorsByTax(r.tax);
        if (c) expect.soft(Number((await seed.getContractor(c.id)).performanceScore)).toBe(Number(s));
      }
      for (const s of ['-1', '6', '-0.01', '5.01']) {
        const r = await create({ score: s });
        expect.soft(r.status, `Điểm ${s}`).toBeNull();
        await expect.soft(f.error(/Điểm từ 0 đến 5/).first()).toBeVisible();
      }
    });

    await test.step('Tên 254/255/256, địa chỉ 499/500/501', async () => {
      for (const [label, patch, ok] of [
        ['tên 254', { name: textOfLength(254) }, true],
        ['tên 255', { name: textOfLength(255) }, true],
        ['tên 256', { name: textOfLength(256) }, false],
        ['địa chỉ 499', { address: textOfLength(499) }, true],
        ['địa chỉ 500', { address: textOfLength(500) }, true],
        ['địa chỉ 501', { address: textOfLength(501) }, false],
      ] as const) {
        const r = await create(patch);
        const [c] = await seed.contractorsByTax(r.tax);
        const saved = c ? await seed.getContractor(c.id) : null;
        if (ok) {
          expect.soft(r.status, label).toBe(201);
          if ('name' in patch) expect.soft(saved?.name, label).toBe(patch.name);
          if ('address' in patch) expect.soft(saved?.address, label).toBe(patch.address);
        } else if (saved) {
          if ('name' in patch) expect.soft(saved.name.length, label).toBeLessThanOrEqual(255);
          if ('address' in patch) expect.soft((saved.address ?? '').length, label).toBeLessThanOrEqual(500);
        }
      }
    });

    await test.step('Form Sửa: sửa MST ở Tạo mới và Đang hoạt động được; MST trùng bị chặn; nhà thầu Dừng hợp tác không sửa được (VDR-055, 056)', async () => {
      for (const c of [await seed.contractor(), (await seed.contractorWithContract()).contractor]) {
        await f.gotoEdit(c.id);
        const newTax = L.taxCode();
        await f.taxCode.fill(newTax);
        const res = await f.submit();
        expect.soft(res?.status(), `Sửa MST nhà thầu ${JSON.stringify(c.status)}`).toBe(200);
        expect.soft((await seed.getContractor(c.id)).taxCode).toBe(newTax);
        await f.gotoEdit(c.id);
        await f.taxCode.fill(dup.taxCode);
        expect.soft([400, 409], 'Sửa sang MST trùng').toContain((await f.submit())?.status());
        expect.soft((await seed.getContractor(c.id)).taxCode).toBe(newTax);
      }
      const terminated = (await seed.terminatedContractor()).contractor;
      await page.goto(`/suppliers/${terminated.id}/edit`);
      const editable = await f.taxCode.isEditable().catch(() => false);
      if (editable) {
        await f.taxCode.fill(L.taxCode());
        expect.soft([null, 400, 409], 'Sửa nhà thầu Dừng hợp tác bị chặn').toContain((await f.submit())?.status() ?? null);
      }
      expect.soft((await seed.getContractor(terminated.id)).taxCode).toBe(terminated.taxCode);
    });
  });
});
