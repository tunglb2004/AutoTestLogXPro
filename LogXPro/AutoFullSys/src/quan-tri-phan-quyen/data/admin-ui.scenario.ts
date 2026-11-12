import { Browser, Locator, Page, expect } from '@playwright/test';
import ExcelJS from 'exceljs';
import { randomUUID } from 'crypto';
import { TestRun, tagged } from '../../core/fixtures/test-run.fixture';
import { Roles } from '../../core/fixtures/auth.fixture';
import { data, items } from '../../core/base.client';
import { env } from '../../core/env';
import { withQuotePage, quoteTab } from '../../quan-ly-bao-gia/data/quote-ui.fixture';
import { createRfq } from '../../quan-ly-bao-gia/data/ycbg.factory';
import { DataTableComponent, exactLabel, inputByLabel } from '../../core/pages/components/data-table.component';
import { expectStatusIn, stable, uiApi } from '../../core/assertions';
import { SidebarMenuComponent } from '../../core/pages/components/sidebar-menu.component';
import { loginThroughUi } from './login-scenario';
import { loginOk, changePassword } from './nguoi-dung.factory';
import * as A from './admin-pending.factory';
import { p0Base } from '../../phieu-dich-vu/data/phieu-dich-vu.factory';
import { configOf } from '../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';

type F = { browser: Browser; roles: Roles; testRun: TestRun };
const dialog = (p: Page) => p.getByRole('dialog').last();
const btn = (scope: Page | Locator, name: string | RegExp) => scope.getByRole('button', { name, exact: typeof name === 'string' });
const field = (scope: Page | Locator, name: string) => scope.getByLabel(exactLabel(name)).or(inputByLabel(scope, name)).first();
const check = (scope: Page | Locator, name: string) => scope.getByRole('checkbox', { name, exact: true }).or(scope.locator('label').filter({ hasText: exactLabel(name) }).locator('input[type="checkbox"]')).first();
const save = (p: Page) => btn(dialog(p), /^(Lưu|Tạo|Cập nhật)$/).last();
const row = (p: Page, text: string) => p.locator('tbody tr').filter({ hasText: text }).first();
const search = (p: Page) => p.locator('main').getByPlaceholder(/Tìm kiếm/).first();
const tab = async (p: Page, name: string) => { await quoteTab(p, name).click(); };

async function open(p: Page, name = 'Bộ phận') { await p.goto('/roles'); await tab(p, name); }
async function add(p: Page) { await btn(p.locator('main'), /^(Thêm mới|Thêm)$/).first().click(); await expect(dialog(p)).toBeVisible(); }
async function userForm(p: Page, payload: any) {
  for (const [label, value] of [['Mã nhân viên', payload.employeeCode], ['Họ và tên', payload.displayName], ['Email', payload.email], ['Số điện thoại', payload.phone]]) await field(dialog(p), label).fill(String(value));
}
async function selectUser(p: Page, u: any) {
  await open(p, 'Người dùng'); await search(p).fill(u.email);
  await p.locator('main').getByText(u.email, { exact: true }).first().click();
  await expect(btn(p.locator('main'), /Chỉnh sửa/)).toBeVisible();
}
async function confirm(p: Page) { await btn(dialog(p), /^(Xác nhận|Đồng ý|Vô hiệu hoá|Vô hiệu hóa|Xóa|Xoá)$/).last().click(); }
async function ready(run: TestRun, u: any) {
  const t = await loginOk(run, u); const password = `Lx9${randomUUID().replace(/-/g, '').slice(0, 18)}Q7`;
  expectStatusIn(await changePassword(run, t.accessToken, u.password, password), '200/201/204');
  return { ...u, password };
}
async function noCreatedUser(run: TestRun, email: string) {
  expect((await A.allAdmin(run, 'GET /api/admin/users', { search: email })).filter(x => x.email === email)).toHaveLength(0);
}

/** Each branch is a complete UI scenario. APIs only prepare data or verify persistence. */
export async function adminUiCase(id: string, f: F): Promise<void> {
  const { browser, roles, testRun: run } = f;
  if (id === 'UI-ADM-017') {
    const ps = (await A.catalogue(run)).filter(p => /cấu hình đầu mục giá|giá mua đầu vào|giá mua định mức|giá bán định mức/i.test(p.groupName ?? '') && /^xem/i.test(p.name ?? ''));
    expect(new Set(ps.map(p => p.groupName)).size, 'Có quyền xem cả 4 module giá').toBe(4);
    const base=await p0Base(run);const cfg=await configOf(run,'KHQ');
    const r = await A.newRole(run, A.permissionCodes(ps)); const u = await ready(run, await A.newUser(run, { roleIds: [r.id] }));
    const context = await browser.newContext({ baseURL: env.webUrl });
    try {
      const p = await context.newPage(); await loginThroughUi(p, u);
      for (const [url,heading,detail] of [
        ['/purchase-prices','Quản lý giá mua',base.sheetA],['/standard-prices','Quản lý giá mua định mức',base.sbp.customsFee],
        ['/standard-selling-prices','Quản lý giá bán định mức',base.ssp.customsFee],['/price-configs','Cấu hình đầu mục giá',cfg.id],
      ]) {
        await p.goto(url!); await expect(p).not.toHaveURL(/\/login/);await expect(p.getByRole('heading',{name:heading!,exact:true})).toBeVisible();
        for (const name of [/^Thêm mới$/, /^Xo[áà]$/, /^Chỉnh sửa bảng giá$/, /^Ngừng hoạt động$/, /^Nhân bản$/, /^Nhập hàng loạt$/, /^Cập nhật giá/, /^Chỉnh sửa$/]) await expect(btn(p.locator('main'), name)).toHaveCount(0);
        expect(detail,'Có dữ liệu xem chi tiết để kiểm quyền ghi').toBeTruthy();await p.goto(`${url}/${detail}`);await expect(p).not.toHaveURL(/\/login/);await expect(p.locator('main h1').first()).toBeVisible();
        if(url!=='/purchase-prices')await expect(p.locator('main')).toContainText(base.items.customsFee.name);
        for (const name of [/^Xo[áà]$/, /^Chỉnh sửa bảng giá$/, /^Ngừng hoạt động$/, /^Nhân bản$/, /^Nhập hàng loạt$/, /^Cập nhật giá/, /^Chỉnh sửa$/]) await expect(btn(p.locator('main'), name)).toHaveCount(0);
      }
      const denied = await p.goto('/purchase-prices/add');
      expect(denied?.status(), 'URL thêm bảng giá phải trả 403 khi chỉ có quyền xem').toBe(403);
      await expect(p.getByRole('heading', { name: 'Thêm mới giá mua', exact: true })).toHaveCount(0);
      await expect(p.getByText(/không có quyền|không được phép|403/i).first()).toBeVisible();
    } finally { await context.close(); }
    return;
  }
  await withQuotePage(browser, roles, 'admin', async p => {
    if (id === 'UI-ADM-001') {
      await open(p); await expect(p.getByRole('heading', { name: 'Phân quyền', exact: true })).toBeVisible();
      await expect(p.getByText('Quản lý vai trò và quyền hạn của người dùng trong hệ thống', { exact: true })).toBeVisible();
      for (const t of ['Bộ phận','Vai trò','Người dùng']) await expect(quoteTab(p,t)).toBeVisible();
      const table = new DataTableComponent(p); const hs = await table.headerTexts();
      for (const h of ['STT','Tên bộ phận','Mô tả','Vai trò','Trạng thái','Thao tác']) expect(hs).toContain(h);
      await expect(btn(p.locator('main'),'Thêm mới')).toBeVisible();
      for (const size of ['10','20','50','100']) await expect(p.locator('main select option').filter({ hasText: new RegExp(`^${size}$`) })).toBeAttached();
    } else if (id === 'UI-ADM-002') {
      const prefix = tagged('AT Bộ phận UI'); const d1 = await A.newDepartment(run, { name: prefix + ' A', description: '' });
      const d2 = await A.newDepartment(run, { name: prefix + ' B', description: 'Bộ phận test' }); const r = await A.newRole(run);
      await A.bindDepartmentRole(run, d2.id, r.id); await open(p); await search(p).fill(prefix);
      await expect(row(p,d1.name)).toContainText('---'); await expect(row(p,d2.name)).toContainText('Bộ phận test'); await expect(row(p,d2.name)).toContainText(r.name);
      await expect(row(p,d1.name)).toContainText('Đang hoạt động'); await expect(row(p,d2.name)).toContainText('Đang hoạt động');
      await expect(p.getByText(/\/\s*2 bản ghi/)).toBeVisible(); await expect(p.locator('tbody tr')).toHaveCount(2);
    } else if (id === 'UI-ADM-003') {
      const r = await A.newRole(run); const name = tagged('Điều phối AT'); await open(p); await add(p);
      await field(dialog(p),'Tên bộ phận').fill(name); await field(dialog(p),'Mô tả').fill('Bộ phận test'); await check(dialog(p), r.name).check();
      const pending = uiApi(p,'POST',/\/api\/admin\/departments$/); await save(p).click(); expect([200,201]).toContain((await pending).status());
      await expect(dialog(p)).not.toBeVisible(); await search(p).fill(name); await expect(row(p,name)).toContainText(r.name); await expect(row(p,name)).toContainText('Đang hoạt động');
      const created = (await A.allAdmin(run,'GET /api/admin/departments',{search:name})).find(x=>x.name===name); expect(created).toBeTruthy(); expect((await A.department(run,created.id)).roles.map((x:any)=>x.id)).toContain(r.id);
    } else if (id === 'UI-ADM-004' || id === 'UI-ADM-005') {
      const name = id.endsWith('005') ? (await A.newDepartment(run)).name : ''; await open(p); await add(p); await field(dialog(p),'Tên bộ phận').fill(name);
      const sent: number[] = []; p.on('response',r=>{if(r.request().method()==='POST'&&/\/api\/admin\/departments$/.test(new URL(r.url()).pathname))sent.push(r.status());});
      await save(p).click();
      await expect(p.getByText(id.endsWith('004')?'Vui lòng nhập tên bộ phận':new RegExp(`Đã có bộ phận tên`)).first()).toBeVisible();
      await expect(dialog(p)).toBeVisible(); expect(sent.every(s=>[400,409,422].includes(s))).toBe(true);
      if (name) expect((await A.allAdmin(run,'GET /api/admin/departments',{search:name})).filter(x=>x.name===name)).toHaveLength(1);
      else expect((await A.allAdmin(run,'GET /api/admin/departments')).filter(x=>x.name==='')).toHaveLength(0);
    } else if (id === 'UI-ADM-006') {
      const d = await A.newDepartment(run); const a = await A.newRole(run); const b = await A.newRole(run); await A.bindDepartmentRole(run,d.id,a.id); await A.bindDepartmentRole(run,d.id,b.id);
      await open(p); await search(p).fill(d.name); await btn(row(p,d.name),/^Xóa$|^Xoá$/).click();
      const pending=uiApi(p,'DELETE',/\/api\/admin\/departments\/[^/]+$/); await confirm(p); expect([400,409,422]).toContain((await pending).status());
      await expect(p.getByText('Bộ phận còn 2 vai trò nên chưa xóa được',{exact:true})).toBeVisible(); await expect(row(p,d.name)).toBeVisible(); expect((await A.department(run,d.id)).roles).toHaveLength(2);
    } else if (id === 'UI-ADM-007') {
      const u=await A.newUser(run); const locked=await A.newUser(run); await A.adminData(run,'POST /api/admin/users/{id}/lock',{params:{id:locked.id}});
      await open(p,'Người dùng'); const status=p.getByRole('button',{name:'Tất cả trạng thái',exact:true}); await status.click(); await p.getByText('Tất cả trạng thái',{exact:true}).last().click();
      await search(p).fill(locked.email); await expect(p.locator('main').getByText(locked.displayName,{exact:true}).first()).toBeVisible(); await expect(p.locator('main').getByText('Đã khóa',{exact:true}).first()).toBeVisible();
      await search(p).fill(u.email); await p.locator('main').getByText(u.email,{exact:true}).first().click();
      for(const name of ['Vô hiệu hoá','Chỉnh sửa','Xuất quyền hiệu lực']) await expect(btn(p.locator('main'),name)).toBeVisible();
      await expect(p.locator('main').getByText(u.displayName,{exact:true}).last()).toBeVisible();
    } else if (id === 'UI-ADM-008') {
      const r=await A.newRole(run,await A.servicePermissionCodes(run,'KHQ')); const d=await A.newDepartment(run); await A.bindDepartmentRole(run,d.id,r.id); const payload=A.userPayload(run);
      await open(p,'Người dùng'); await add(p); await userForm(p,payload); await check(dialog(p),r.name).check();
      const dep=dialog(p).getByRole('combobox',{name:exactLabel('Bộ phận')});
      if(await dep.count()) { const tag=await dep.evaluate(e=>e.tagName); if(tag==='SELECT') await dep.selectOption({label:d.name}); else {await dep.click();await p.getByText(d.name,{exact:true}).last().click();} }
      else await check(dialog(p),d.name).check();
      const password=await field(dialog(p),'Mật khẩu').inputValue(); expect(password.length,'Mật khẩu mặc định điền sẵn').toBeGreaterThan(0);
      const pending=uiApi(p,'POST',/\/api\/admin\/users$/); await save(p).click(); expect([200,201]).toContain((await pending).status()); await expect(dialog(p)).not.toBeVisible();
      await search(p).fill(payload.email); await expect(p.locator('main').getByText(payload.email,{exact:true}).first()).toBeVisible();
      const created=(await A.allAdmin(run,'GET /api/admin/users',{search:payload.email})).find(x=>x.email===payload.email); expect(created).toBeTruthy(); expect((await A.user(run,created.id)).roles.map((x:any)=>x.id)).toContain(r.id);
      const login=await run.http.call('POST /api/auth/login',{json:{tenantCode:env.tenantCode,email:payload.email,password}}); expectStatusIn(login,'200'); expect((await data(login)).passwordChangeRequired).toBe(true);
    } else if (['UI-ADM-009','UI-ADM-010','UI-ADM-011'].includes(id)) {
      const existing=id.endsWith('009')?await A.newUser(run):null; const payload=A.userPayload(run,{email:existing?.email ?? A.userPayload(run).email,phone:id.endsWith('010')?'091234567':id.endsWith('011')?'091234567890':'0912345678'});
      await open(p,'Người dùng'); await add(p); await userForm(p,payload);
      const sent:number[]=[]; p.on('response',r=>{if(r.request().method()==='POST'&&/\/api\/admin\/users$/.test(new URL(r.url()).pathname))sent.push(r.status());});
      await save(p).click(); await expect(p.getByText(id.endsWith('009')?/Đã có tài khoản dùng email/:/10.?11.*(chữ số|số)|số điện thoại.*(hợp lệ|10|11)/i).first()).toBeVisible(); await expect(dialog(p)).toBeVisible(); expect(sent.every(s=>[400,409,422].includes(s))).toBe(true);
      if(existing) expect((await A.allAdmin(run,'GET /api/admin/users',{search:payload.email})).filter(x=>x.email===payload.email)).toHaveLength(1);
      else { await noCreatedUser(run,payload.email); for(const text of [/vui lòng.*họ|họ.*bắt buộc/i,/vui lòng.*email|email.*bắt buộc/i,/vui lòng.*mã nhân viên/i]) await expect(dialog(p).getByText(text)).toHaveCount(0); }
    } else if (id === 'UI-ADM-012') {
      const u=await ready(run,await A.newUser(run)); const context=await browser.newContext({baseURL:env.webUrl});
      try {
        const own=await context.newPage(); await loginThroughUi(own,u); await selectUser(p,u); await btn(p.locator('main'),'Vô hiệu hoá').click();
        const pending=uiApi(p,'POST',/\/api\/admin\/users\/[^/]+\/lock$/); await confirm(p); expect([200,204]).toContain((await pending).status()); await expect(p.locator('main').getByText('Đã khóa',{exact:true}).first()).toBeVisible();
        expect((await A.user(run,u.id)).status).not.toBe('ACTIVE'); await own.reload(); await expect(own).toHaveURL(/\/login/);
        const denied=await run.http.call('POST /api/auth/login',{json:{tenantCode:env.tenantCode,email:u.email,password:u.password}}); expectStatusIn(denied,'400/401');
      } finally { await context.close(); }
    } else if (id === 'UI-ADM-013') {
      const u=await A.user(run,run.roles.k1.userId); await createRfq(run,{submit:false}); const before=stable(await A.user(run,u.id));
      await selectUser(p,u); await btn(p.locator('main'),'Vô hiệu hoá').click(); const pending=uiApi(p,'POST',/\/api\/admin\/users\/[^/]+\/lock$/); await confirm(p); const response=await pending;
      if(response.ok()) await A.adminData(run,'POST /api/admin/users/{id}/unlock',{params:{id:u.id}});
      expect([400,409,422]).toContain(response.status()); await expect(p.getByText(/công việc.*chưa bàn giao|chưa bàn giao.*công việc|công việc.*dang dở/i).first()).toBeVisible(); expect(stable(await A.user(run,u.id))).toEqual(before);
    } else if (id === 'UI-ADM-014') {
      const r=await A.newRole(run,await A.servicePermissionCodes(run,'KHQ')); const u=await A.newUser(run,{roleIds:[r.id]}); const effective=await A.effective(run,u.id); expect(effective.length).toBeGreaterThan(0); await selectUser(p,u);
      for(const permission of effective) await expect(p.locator('main').getByText(permission.name,{exact:true}).first()).toBeVisible();
      const pending=p.waitForEvent('download'); await btn(p.locator('main'),'Xuất quyền hiệu lực').click(); const download=await pending; expect(download.suggestedFilename()).toMatch(/\.xlsx$/i); expect(await download.failure()).toBeNull(); const stream=await download.createReadStream(); if(!stream)throw new Error('Không đọc được file tải về');
      const chunks:Buffer[]=[]; for await(const chunk of stream)chunks.push(Buffer.from(chunk)); const book=new ExcelJS.Workbook(); await book.xlsx.load(Buffer.concat(chunks) as any);
      const codes=new Set((await A.catalogue(run)).map(x=>x.code)); const exported:string[]=[]; for(const sheet of book.worksheets)sheet.eachRow(r=>{for(const value of (r.values as any[]).slice(1)){if(typeof value==='string'&&codes.has(value.trim()))exported.push(value.trim());}});
      expect(exported.sort()).toEqual(A.permissionCodes(effective)); expect(exported).toHaveLength(effective.length);
    } else if (id === 'UI-ADM-015') {
      await open(p,'Vai trò'); await p.locator('main').getByText('Quản trị hệ thống',{exact:true}).first().click();
      for(const name of [/^Chỉnh sửa$/,/^Xóa$|^Xoá$/,/^Vô hiệu hoá$|^Vô hiệu hóa$/])await expect(btn(p.locator('main'),name)).toHaveCount(0);
    } else if (id === 'UI-ADM-016') {
      const codes=await A.servicePermissionCodes(run,'VT'); const catalogue=await A.catalogue(run); const selected=catalogue.filter(x=>codes.includes(x.code)&&/dịch vụ vận tải/i.test(x.groupName??'')); expect(selected).toHaveLength(6);
      const name=tagged('Điều phối Vận tải AT'); await open(p,'Vai trò'); await add(p); await field(dialog(p),'Tên vai trò').fill(name);
      const group=dialog(p).locator('section, fieldset, div').filter({has:dialog(p).getByText('Dịch vụ Vận tải',{exact:true})}).filter({has:dialog(p).getByRole('checkbox')}).last();
      for(const permission of selected)await check(group,permission.name).check(); const pending=uiApi(p,'POST',/\/api\/admin\/roles$/); await save(p).click(); expect([200,201]).toContain((await pending).status()); await expect(dialog(p)).not.toBeVisible();
      const created=(await A.allAdmin(run,'GET /api/admin/roles',{search:name})).find(x=>x.name===name); expect(created).toBeTruthy(); const detail=await A.role(run,created.id); expect([...detail.permissions].sort()).toEqual(selected.map(x=>x.code).sort());
      const u=await ready(run,await A.newUser(run,{roleIds:[created.id]})); const context=await browser.newContext({baseURL:env.webUrl}); try{const own=await context.newPage();await loginThroughUi(own,u);await expect(new SidebarMenuComponent(own).item('Trung tâm điều phối')).toBeVisible();}finally{await context.close();}
    } else { throw new Error(`Chưa khai báo kịch bản UI ${id}`); }
  });
}

export async function loginRoleRevoked(f:F):Promise<void>{
  const {browser,roles,testRun:run}=f; const r=await A.newRole(run,await A.servicePermissionCodes(run,'VT')); const u=await ready(run,await A.newUser(run,{roleIds:[r.id]})); const context=await browser.newContext({baseURL:env.webUrl});
  try{
    const own=await context.newPage();await loginThroughUi(own,u);await own.goto('/control-tower/service-orders');await expect(own).not.toHaveURL(/\/login/);await expect(new SidebarMenuComponent(own).item('Quản lý dịch vụ')).toBeVisible();
    await withQuotePage(browser,roles,'admin',async p=>{await selectUser(p,u);await btn(p.locator('main'),'Chỉnh sửa').click();await check(dialog(p),r.name).uncheck();const pending=uiApi(p,'PUT',/\/api\/admin\/users\/[^/]+$/);await save(p).click();expect([200,204]).toContain((await pending).status());await expect(dialog(p)).not.toBeVisible();});
    await own.reload();await expect(own).not.toHaveURL(/\/login/);await expect(new SidebarMenuComponent(own).item('Quản lý dịch vụ')).toHaveCount(0);await own.goto('/control-tower/service-orders');await expect(own.getByText(/không có quyền|không được phép|403/i).first()).toBeVisible();
    const access=(await context.cookies()).find(c=>c.name==='access_token')?.value;expect(access).toBeTruthy();expectStatusIn(await run.http.call('GET /api/k3/service-orders',{token:access!,query:{page:1,perPage:20}}),'403');
    expect((await A.user(run,u.id)).roles).toHaveLength(0);
  }finally{await context.close();}
}
