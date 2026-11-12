import { Page } from '@playwright/test';
import { test, expect } from '../../../src/fixtures/page.fixture';
import { body, data, items } from '../../../src/api/http.client';
import * as L from '../../../src/data/lead.factory';
import { optionTexts, chooseOption } from '../../../src/pages/components/filter-bar.component';
import { randDigits, tagged, textOfLength } from '../../../src/utils/test-run';

const BASE = { industries: ['Logistics'], source: 'Giới thiệu', route: 'Nội địa' };
const validContact = () => ({ name: L.personName(), phone: L.phone() });

/** Đếm request POST/PUT tới /api/leads... để chứng minh form chặn phía web, không gọi API. */
function watchLeadWrites(page: Page) {
  const calls: string[] = [];
  page.on('request', (r) => {
    if (['POST', 'PUT', 'PATCH'].includes(r.method()) && /\/api\/leads(\/|$)/.test(new URL(r.url()).pathname)) calls.push(`${r.method()} ${r.url()}`);
  });
  return calls;
}

test.describe("Thêm mới và chi tiết Lead", () => {
  test("UI-LEADF-001 Bỏ trống trường bắt buộc", { tag: ["@ui", "@p1"] }, async ({ page, loginAs, leadFormPage: f }) => {
    await loginAs('nvkdA');
    const writes = watchLeadWrites(page);
    await f.goto();
    await f.next.click();
    for (const msg of ['Vui lòng nhập tên doanh nghiệp', /Mã số thuế/, 'Vui lòng chọn ít nhất 1 ngành hàng', 'Vui lòng chọn nguồn phát sinh', 'Vui lòng chọn cung đường vận chuyển'])
      await expect.soft(f.error(msg)).toBeVisible();
    await f.fillCompany({ name: L.companyName(), taxCode: L.taxCode(), ...BASE });
    await f.next.click();
    await f.save.click();
    await expect.soft(f.error('Vui lòng nhập họ tên')).toBeVisible();
    await expect.soft(f.error('Vui lòng nhập số điện thoại')).toBeVisible();
    expect(writes, 'Không được gọi API tạo Lead').toEqual([]);
  });

  test("UI-LEADF-002 MST, SĐT, email sai định dạng", { tag: ["@ui", "@p2"] }, async ({ page, loginAs, leadFormPage: f }) => {
    await loginAs('nvkdA');
    const writes = watchLeadWrites(page);
    await f.goto();
    await f.fillCompany({ name: L.companyName(), taxCode: randDigits(9, true), ...BASE });
    await f.taxCode.press('Tab');
    await f.next.click();
    await expect(f.error(/Mã số thuế/)).toBeVisible();
    await f.taxCode.fill(L.taxCode());
    await f.next.click();
    await f.fillContact(0, { name: L.personName(), phone: '12345', email: 'abc@' });
    await f.contactEmail(0).press('Tab');
    await f.save.click();
    await expect.soft(f.error('Số điện thoại không hợp lệ')).toBeVisible();
    await expect.soft(f.error('Email không hợp lệ')).toBeVisible();
    expect(writes).toEqual([]);
  });

  test("UI-LEADF-010 Biên và phân vùng MST khi thêm và sửa Lead", { tag: ["@ui", "@p1"] }, async ({ seed, loginAs, leadFormPage: f, leadDetailPage: d }) => {
    test.setTimeout(300_000);
    const active = await seed.lead();
    const inactive = await seed.inactiveLead();
    const customer = await seed.customer();
    await loginAs('nvkdA');

    await test.step('Giá trị sai báo tại ô MST, không sang bước 2', async () => {
      for (const tax of [randDigits(9, true), randDigits(11, true), randDigits(12, true), randDigits(14, true), `12345abc90`, '']) {
        await f.goto();
        await f.fillCompany({ name: L.companyName(), taxCode: tax, ...BASE });
        await f.next.click();
        await expect.soft(f.error(/Mã số thuế/), `MST "${tax}"`).toBeVisible();
        await expect.soft(f.contactName(0), `MST "${tax}" không được sang bước 2`).toBeHidden();
      }
    });

    await test.step('10 và 13 số duy nhất, có số 0 đầu, lưu đúng chuỗi', async () => {
      for (const tax of [`0${randDigits(9)}`, `0${randDigits(12)}`]) {
        const res = await f.create({ name: L.companyName(), taxCode: tax, ...BASE }, validContact());
        expect.soft(res?.status(), `Tạo Lead MST ${tax}`).toBeLessThan(300);
        const saved = await seed.leadsByTax(tax);
        expect.soft(saved.map((l: any) => l.taxCode)).toEqual([tax]);
      }
    });

    await test.step('MST trùng Lead Đang hoạt động, Ngưng hoạt động, KH đã chuyển đổi đều bị chặn', async () => {
      for (const [label, tax] of [['Đang hoạt động', active.taxCode], ['Ngưng hoạt động', inactive.taxCode], ['Khách hàng', customer.lead.taxCode]] as const) {
        const before = (await seed.leadsByTax(tax)).length;
        const res = await f.create({ name: L.companyName(), taxCode: tax, ...BASE }, validContact());
        expect.soft(res?.status(), `MST trùng ${label}`).toBe(409);
        await expect.soft(f.page.getByText(/đã tồn tại|đã được sử dụng/i).first(), `Thông báo MST trùng ${label}`).toBeVisible();
        await expect.soft(f.contactName(0), 'Form giữ dữ liệu đã nhập').toBeVisible();
        expect.soft((await seed.leadsByTax(tax)).length).toBe(before);
      }
    });

    await test.step('Sửa: giữ MST hiện tại được phép, đổi sang MST trùng bị chặn', async () => {
      const lead = await seed.lead();
      await d.goto(lead.id);
      await d.edit.click();
      const put = f.page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().endsWith(`/api/leads/${lead.id}`), { timeout: 8_000 }).catch(() => null);
      await f.saveEdit.click();
      expect.soft((await put)?.status(), 'Giữ MST hiện tại được phép lưu').toBe(200);
      expect.soft((await seed.getLead(lead.id)).taxCode).toBe(lead.taxCode);

      for (const tax of [active.taxCode, inactive.taxCode, customer.lead.taxCode, randDigits(9, true)]) {
        await d.goto(lead.id);
        await d.edit.click();
        await f.taxCode.fill(tax);
        await f.saveEdit.click();
        await expect.soft(f.page.getByText(/đã tồn tại|đã được sử dụng|Mã số thuế phải/i).first(), `Sửa MST thành ${tax}`).toBeVisible();
        expect.soft((await seed.getLead(lead.id)).taxCode, 'Dữ liệu cũ giữ nguyên').toBe(lead.taxCode);
      }
    });
  });

  test("UI-LEADF-011 Bỏ từng trường bắt buộc và biên độ dài form Lead", { tag: ["@ui", "@p2"] }, async ({ seed, loginAs, leadFormPage: f, leadDetailPage: d }) => {
    test.setTimeout(300_000);
    await loginAs('nvkdA');
    const full = () => ({ name: L.companyName(), taxCode: L.taxCode(), ...BASE });

    await test.step('Bỏ riêng từng trường bắt buộc', async () => {
      const cases: [string, Record<string, unknown>, string | RegExp][] = [
        ['tên', { name: '' }, 'Vui lòng nhập tên doanh nghiệp'],
        ['MST', { taxCode: '' }, /Mã số thuế/],
        ['ngành hàng', { industries: [] }, 'Vui lòng chọn ít nhất 1 ngành hàng'],
        ['nguồn', { source: undefined }, 'Vui lòng chọn nguồn phát sinh'],
        ['cung đường', { route: undefined }, 'Vui lòng chọn cung đường vận chuyển'],
      ];
      for (const [label, override, msg] of cases) {
        await f.goto();
        await f.fillCompany({ ...full(), ...override });
        await f.next.click();
        await expect.soft(f.error(msg), `Thiếu ${label}`).toBeVisible();
        await expect.soft(f.toast.fieldErrors, `Chỉ báo đúng trường thiếu (${label})`).toHaveCount(1);
      }
    });

    await test.step('Tên 254/255 lưu đủ, 256 bị chặn; địa chỉ 499/500 lưu đủ, 501 bị chặn', async () => {
      const variants: [string, Record<string, string>, boolean][] = [
        ['tên 254', { name: textOfLength(254) }, true],
        ['tên 255', { name: textOfLength(255) }, true],
        ['tên 256', { name: textOfLength(256) }, false],
        ['địa chỉ 499', { address: textOfLength(499) }, true],
        ['địa chỉ 500', { address: textOfLength(500) }, true],
        ['địa chỉ 501', { address: textOfLength(501) }, false],
        ['website hợp lệ', { website: 'https://logistics-viettrung.vn' }, true],
        ['website sai', { website: 'khong phai url' }, false],
      ];
      for (const [label, v, ok] of variants) {
        const data0 = { ...full(), ...v };
        const res = await f.create(data0, validContact());
        const saved = await seed.leadsByTax(data0.taxCode);
        if (ok) {
          expect.soft(res?.status(), label).toBeLessThan(300);
          const lead = saved[0] && (await seed.getLead(saved[0].id));
          if (v.name) expect.soft(lead?.companyName, label).toBe(v.name);
          if (v.address) expect.soft(lead?.headOfficeAddress, label).toBe(v.address);
          if (v.website) expect.soft(lead?.website, label).toBe(v.website);
          if (lead) {
            await d.goto(lead.id);
            await expect.soft(d.main, `${label} hiển thị đúng sau tải lại`).toContainText(Object.values(v)[0]);
          }
        } else {
          // Theo quy tắc của màn: chặn nhập (ô cắt bớt) hoặc báo lỗi; giá trị lưu không vượt ngưỡng.
          for (const l of saved) {
            const lead = await seed.getLead(l.id);
            if (v.name) expect.soft(lead.companyName.length, label).toBeLessThanOrEqual(255);
            if (v.address) expect.soft((lead.headOfficeAddress ?? '').length, label).toBeLessThanOrEqual(500);
            if (v.website) expect.soft(lead.website, label).not.toBe(v.website);
          }
        }
      }
    });

    await test.step('Ghi chú ở ngưỡng của màn (chờ chốt UI 255, API 500)', async () => {
      const max = await (async () => {
        await f.goto();
        return Number(await f.note.getAttribute('maxlength')) || 500;
      })();
      const tax = L.taxCode();
      await f.create({ ...full(), taxCode: tax, note: textOfLength(max) }, validContact());
      const saved = await seed.leadsByTax(tax);
      expect.soft(saved.length, `Ghi chú ${max} ký tự lưu được`).toBe(1);
      const tax2 = L.taxCode();
      await f.create({ ...full(), taxCode: tax2, note: textOfLength(max + 1) }, validContact());
      for (const l of await seed.leadsByTax(tax2)) expect.soft(((await seed.getLead(l.id)).initialNote ?? '').length).toBeLessThanOrEqual(max);
    });

    await test.step('Form Sửa: bỏ tên báo lỗi, không lưu', async () => {
      const lead = await seed.lead();
      await d.goto(lead.id);
      await d.edit.click();
      await f.companyName.fill('');
      await f.saveEdit.click();
      await expect.soft(f.error('Vui lòng nhập tên doanh nghiệp')).toBeVisible();
      expect.soft((await seed.getLead(lead.id)).companyName).toBe(lead.companyName);
    });
  });

  test("UI-LEADF-012 Ngành hàng Khác trên form", { tag: ["@ui", "@p2"] }, async ({ seed, loginAs, leadFormPage: f, leadDetailPage: d }) => {
    test.setTimeout(240_000);
    await loginAs('nvkdA');
    await f.goto();
    await expect.soft(f.industryOther, 'Ô ngành khác chỉ hiện khi chọn Khác').toBeHidden();
    await f.industry('Khác').click();
    await expect(f.industryOther).toBeVisible();

    for (const [label, other] of [['rỗng', ''], ['toàn dấu cách', '     ']] as const) {
      await f.goto();
      await f.fillCompany({ name: L.companyName(), taxCode: L.taxCode(), industries: ['Khác'], other, source: BASE.source, route: BASE.route });
      await f.next.click();
      await expect.soft(f.error('Vui lòng nhập ngành hàng khác'), label).toBeVisible();
    }

    for (const len of [254, 255]) {
      const tax = L.taxCode();
      const text = textOfLength(len);
      await f.create({ name: L.companyName(), taxCode: tax, industries: ['Khác'], other: text, source: BASE.source, route: BASE.route }, validContact());
      const [l] = await seed.leadsByTax(tax);
      const lead = l && (await seed.getLead(l.id));
      expect.soft(lead?.industryOther, `${len} ký tự lưu đủ`).toBe(text);
    }
    await f.goto();
    await f.industry('Khác').click();
    await f.industryOther.fill(textOfLength(256));
    expect.soft((await f.industryOther.inputValue()).length, '256 ký tự bị chặn').toBeLessThanOrEqual(255);

    const tax = L.taxCode();
    await f.goto();
    await f.fillCompany({ name: L.companyName(), taxCode: tax, industries: ['Logistics', 'Khác'], other: 'Kho lạnh nông sản', source: BASE.source, route: BASE.route });
    await f.industry('Khác').click();
    await f.next.click();
    await f.fillContact(0, validContact());
    await f.save.click();
    await expect.poll(async () => (await seed.leadsByTax(tax)).length).toBe(1);
    const [l] = await seed.leadsByTax(tax);
    const lead = await seed.getLead(l.id);
    expect.soft(lead.industryOther ?? null, 'Bỏ chọn Khác thì mô tả cũ không được lưu').toBeFalsy();
    await d.goto(lead.id);
    await expect.soft(d.main).not.toContainText('Kho lạnh nông sản');
  });

  test("UI-LEADF-013 Biên đầu mối liên hệ Lead", { tag: ["@ui", "@p2"] }, async ({ seed, loginAs, leadDetailPage: d }) => {
    test.setTimeout(600_000);
    const lead = await seed.leadWithContacts(2);
    await loginAs('nvkdA');
    const tryAdd = async (c: { name: string; title?: string; phone: string; email?: string }) => {
      await d.goto(lead.id);
      await d.addContact.click();
      await d.contactName.fill(c.name);
      await d.contactTitle.fill(c.title ?? '');
      await d.contactPhone.fill(c.phone);
      await d.contactEmail.fill(c.email ?? '');
      const res = d.page.waitForResponse((r) => r.request().method() === 'POST' && /\/contacts$/.test(r.url()), { timeout: 5_000 }).catch(() => null);
      await d.contactSubmit.click();
      const r = await res;
      return r?.status() ?? null;
    };
    const ok = (s: number | null) => s !== null && s < 300;
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

    for (const n of [99, 100]) expect.soft(ok(await tryAdd({ name: textOfLength(n), phone: L.phone() })), `Họ tên ${n}`).toBe(true);
    expect.soft(ok(await tryAdd({ name: textOfLength(101), phone: L.phone() })), 'Họ tên 101').toBe(false);
    for (const n of [99, 100]) expect.soft(ok(await tryAdd({ name: L.personName(), phone: L.phone(), email: email(n) })), `Email ${n}`).toBe(true);
    expect.soft(ok(await tryAdd({ name: L.personName(), phone: L.phone(), email: email(101) })), 'Email 101').toBe(false);
    for (const n of [99, 100]) expect.soft(ok(await tryAdd({ name: L.personName(), phone: L.phone(), title: textOfLength(n) })), `Chức danh ${n}`).toBe(true);
    expect.soft(ok(await tryAdd({ name: L.personName(), phone: L.phone(), title: textOfLength(101) })), 'Chức danh 101').toBe(false);
    expect.soft(ok(await tryAdd({ name: L.personName(), phone: L.phone() })), 'Trường tùy chọn bỏ trống').toBe(true);
    for (const prefix of ['0', '+84']) {
      for (const len of [9, 10]) expect.soft(ok(await tryAdd({ name: L.personName(), phone: prefix + randDigits(len) })), `SĐT ${prefix} + ${len} số`).toBe(true);
      for (const len of [8, 11]) {
        const s = await tryAdd({ name: L.personName(), phone: prefix + randDigits(len) });
        expect.soft(ok(s), `SĐT ${prefix} + ${len} số bị chặn`).toBe(false);
        await expect.soft(d.toast.fieldErrors.filter({ hasText: /Số điện thoại/ }).first(), `Lỗi tại ô SĐT (${prefix}+${len})`).toBeVisible();
      }
    }
  });

  test("UI-LEADF-005 Nút theo trạng thái Lead", { tag: ["@ui", "@p1"] }, async ({ seed, loginAs, leadDetailPage: d }) => {
    const active = await seed.lead();
    const inactive = await seed.inactiveLead();
    const converted = await seed.customer();
    await loginAs('nvkdA');

    await d.goto(active.id);
    await expect.soft(d.edit).toBeVisible();
    await expect.soft(d.deactivate).toBeVisible();
    await expect.soft(d.transfer).toBeVisible();

    await d.goto(inactive.id);
    await expect.soft(d.reactivate).toBeVisible();
    await expect.soft(d.deactivate).toHaveCount(0);
    await expect.soft(d.edit).toHaveCount(0);

    await d.goto(converted.lead.id);
    for (const b of [d.edit, d.deactivate, d.transfer, d.reactivate, d.addContact]) await expect.soft(b).toHaveCount(0);
  });

  test("UI-LEADF-008 Lỗi máy chủ khi lưu", { tag: ["@ui", "@p2"] }, async ({ page, loginAs, leadFormPage: f }) => {
    await loginAs('nvkdA');
    await page.route(/\/api\/leads$/, (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Internal Server Error', errorCode: 'INTERNAL_ERROR' }) })
        : route.continue(),
    );
    const name = tagged('Công ty Lỗi máy chủ');
    const res = await f.create({ name, taxCode: L.taxCode(), ...BASE }, validContact());
    expect(res?.status()).toBe(500);
    await expect(f.toast.message.first()).toBeVisible();
    await expect(f.toast.message.first()).not.toContainText(/Exception|at \w+\.|stack/i);
    await expect(page.locator('main')).toBeVisible();
    await expect(f.contactName(0), 'Form giữ dữ liệu').toBeVisible();
    await f.back.click();
    await expect(f.companyName).toHaveValue(name);
  });

  test("UI-LEADF-015 Biên lý do ngưng hoạt động và chuyển người phụ trách Lead", { tag: ["@ui", "@p2"] }, async ({ seed, http, roles, loginAs, leadDetailPage: d }) => {
    test.setTimeout(300_000);
    await loginAs('nvkdA');

    await test.step('Ô chọn không có người đang phụ trách và tài khoản khóa', async () => {
      const lead = await seed.lead();
      const owners = items(await data(await http.call('GET /api/leads/assignable-owners', { token: roles.nvkdA.accessToken })));
      await d.goto(lead.id);
      await d.transfer.click();
      const opts = await optionTexts(d.newOwner);
      const me = owners.find((o: any) => o.id === roles.nvkdA.userId || o.userId === roles.nvkdA.userId);
      if (me) expect.soft(opts, 'Không có người đang phụ trách').not.toContain(me?.displayName ?? me?.fullName ?? me?.name);
      const locked = owners.filter((o: any) => o.active === false || o.status === 'LOCKED' || o.locked === true);
      for (const o of locked) expect.soft(opts).not.toContain(o?.displayName ?? o?.fullName ?? o?.name);
      await d.modal.cancel.click();
    });

    const reasons: [string, string, boolean][] = [
      ['rỗng', '', false],
      ['toàn khoảng trắng', '      ', false],
      ['499', textOfLength(499), true],
      ['500', textOfLength(500), true],
      ['501', textOfLength(501), false],
    ];
    for (const [label, reason, ok] of reasons) {
      await test.step(`Ngưng hoạt động, lý do ${label}`, async () => {
        const lead = await seed.lead();
        await d.goto(lead.id);
        await d.deactivate.click();
        await d.modal.reason.fill(reason);
        const chan1 = await d.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        await d.modal.confirm.click();
        const status = async () => (await seed.getLead(lead.id)).status;
        if (ok || chan1) await expect.poll(async () => JSON.stringify(await status())).toMatch(/INACTIVE/);
        else {
          await d.page.waitForLoadState("networkidle");
          expect.soft(JSON.stringify(await status()), label).not.toMatch(/INACTIVE/);
        }
        if (ok || chan1) expect.soft((await seed.history('/api/leads', lead.id, 'nvkdA')).length, 'Có lịch sử').toBeGreaterThan(1);
      });
      await test.step(`Chuyển người phụ trách, lý do ${label}`, async () => {
        const lead = await seed.lead();
        await d.goto(lead.id);
        await d.transfer.click();
        await chooseOption(d.newOwner, await ownerName(http, roles));
        await d.modal.reason.fill(reason);
        const chan2 = await d.modal.blockedAtInput(reason); // 501 ký tự bị chặn nhập ở 500 → lưu giá trị hợp lệ
        await d.modal.confirm.click();
        await d.page.waitForLoadState("networkidle");
        const owner = async () => {
          const r = await http.call('GET /api/leads/{id}', { token: roles.nvkdB.accessToken, params: { id: lead.id } });
          return r.ok() ? (await body(r)).data?.ownerUserId : null;
        };
        if (ok || chan2) await expect.poll(owner).toBe(roles.nvkdB.userId);
        else expect.soft((await seed.getLead(lead.id)).ownerUserId, label).toBe(roles.nvkdA.userId);
      });
    }

    await test.step('Bấm Hủy ở hộp xác nhận giữ nguyên dữ liệu', async () => {
      const lead = await seed.lead();
      await d.goto(lead.id);
      await d.deactivate.click();
      await d.modal.reason.fill('Khách tạm dừng nhu cầu');
      await d.modal.cancel.click();
      expect.soft(JSON.stringify((await seed.getLead(lead.id)).status)).not.toMatch(/INACTIVE/);
      await d.transfer.click();
      await chooseOption(d.newOwner, await ownerName(http, roles));
      await d.modal.reason.fill('Phân lại địa bàn');
      await d.modal.cancel.click();
      const after = await seed.getLead(lead.id);
      expect.soft(after.ownerUserId).toBe(roles.nvkdA.userId);
    });
  });
});

/** Tên hiển thị của NVKD B trong ô chọn người phụ trách (lấy từ /api/leads/assignable-owners). */
async function ownerName(http: any, roles: any): Promise<string> {
  const owners = items(await data(await http.call('GET /api/leads/assignable-owners', { token: roles.nvkdA.accessToken })));
  const b = owners.find((o: any) => o.id === roles.nvkdB.userId || o.userId === roles.nvkdB.userId);
  if (!b) throw new Error('NVKD B không có trong danh sách người nhận Lead (/api/leads/assignable-owners)');
  return b?.displayName ?? b?.fullName ?? b?.name;
}
