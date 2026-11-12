import { Browser, Locator, Page, expect } from '@playwright/test';
import { TestRun, tagged, textOfLength } from '../../core/fixtures/test-run.fixture';
import { Roles } from '../../core/fixtures/auth.fixture';
import { data, items, must } from '../../core/base.client';
import { pasteText, stable, uiApi } from '../../core/assertions';
import { withQuotePage, quoteTab } from '../../quan-ly-bao-gia/data/quote-ui.fixture';
import { DataTableComponent, exactLabel, inputByLabel, selectByLabel, pickOption } from '../../core/pages/components/data-table.component';
import { withLegSandbox, LegSandbox, RuleBody } from './leg-sandbox';
import { p0Base, createOrder } from '../../phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, confirmLegs } from '../../thap-dieu-phoi/data/phieu-cc.factory';

type F = { browser: Browser; roles: Roles; testRun: TestRun };
const dialog = (p: Page) => p.getByRole('dialog').last();
const button = (s: Page|Locator, name: string|RegExp) => s.getByRole('button',{name,exact:typeof name==='string'});
const input = (s: Page|Locator,label:string) => s.getByLabel(exactLabel(label)).or(inputByLabel(s,label)).first();
const select = (s: Page|Locator,label:string) => s.getByRole('combobox',{name:exactLabel(label)}).or(selectByLabel(s,label)).first();
const search = (p:Page) => p.locator('main').getByPlaceholder(/Tìm kiếm/).first();
const ruleRow = (p:Page,code:string) => p.locator('main tbody tr').filter({hasText:code}).first();
const scopeLabel:Record<string,string>={DOMESTIC:'Nội địa',INTERNATIONAL:'Quốc tế',BORDER_GATE:'Cửa khẩu'};

async function choose(p:Page, trigger:Locator, name:string) {
  await expect(trigger).toBeVisible();
  if(await trigger.evaluate(e=>e.tagName)==='SELECT')await trigger.selectOption({label:name});
  else await pickOption(p,trigger,name);
}
async function openCreate(p:Page){await p.goto('/route-configs');await button(p.locator('main'),'Thêm mới').click();await expect(dialog(p)).toBeVisible();}
function legSelect(p:Page,index:number,label:'Tên chặng'|'Dịch vụ'){
  const native=dialog(p).getByRole('combobox',{name:exactLabel(label)}).nth(index);
  const custom=dialog(p).locator('label').filter({hasText:exactLabel(label)}).nth(index).locator('xpath=ancestor::div[.//select or .//div[@tabindex="0"]][1]').locator('select, div[tabindex="0"]').first();
  return native.or(custom).first();
}
function removeLeg(p:Page,index:number){return dialog(p).getByRole('button',{name:/Xóa chặng|Xoá chặng|Xóa dòng|Xoá dòng/}).nth(index).or(dialog(p).locator('button[title="Xóa chặng"],button[aria-label="Xóa chặng"]').nth(index)).first();}
async function fillRule(p:Page,s:LegSandbox,b:RuleBody){
  await input(dialog(p),'Tên quy tắc').fill(b.name);await choose(p,select(dialog(p),'Phạm vi thực hiện'),scopeLabel[b.executionScope]);
  await choose(p,select(dialog(p),'Phương thức vận tải'),s.refs.road.name);await choose(p,select(dialog(p),'Loại hình vận tải'),s.refs.full.name);
  await choose(p,select(dialog(p),'Điểm đi'),s.refs.points.find(x=>x.code===b.originPointTypeCode)!.name);
  await choose(p,select(dialog(p),'Điểm đến'),s.refs.points.find(x=>x.code===b.destinationPointTypeCode)!.name);
  await input(dialog(p),'Ghi chú').fill(b.description);
  for(let i=0;i<b.legs.length;i++){
    if(i)await button(dialog(p),'Thêm chặng').click();
    const legName=b.legs[i].legTypeCode===s.refs.atGate.code?s.refs.atGate.name:s.refs.toInland.name;
    await choose(p,legSelect(p,i,'Tên chặng'),legName);
    for(const service of b.legs[i].serviceTypeCodes){
      const names:Record<string,string>={KHQ:'Khai báo hải quan',HQGS:'Hải quan giám sát',VT:'Vận tải',ST:'Sang tải',KB:'Kho bãi'};
      const key=Object.keys(s.refs.services).find(k=>s.refs.services[k]===service)!;
      await legSelect(p,i,'Dịch vụ').click();
      const checkbox=p.getByRole('checkbox',{name:names[key],exact:true}).last();
      if(await checkbox.count())await checkbox.check();else await p.getByText(names[key],{exact:true}).last().click();
      await p.keyboard.press('Escape');
    }
  }
}
async function created(s:LegSandbox,name:string){const rows=items(await s.list({search:name})).filter(r=>r.name===name);expect(rows).toHaveLength(1);return s.get(rows[0].code);}
async function noCreated(s:LegSandbox,name:string){expect(items(await s.list({search:name})).filter(r=>r.name===name)).toHaveLength(0);}

export async function legUiCase(id:string,f:F):Promise<void>{
  await withLegSandbox(f.testRun,async s=>{
    const uiCreated=new Set<string>();
    try{
      await withQuotePage(f.browser,f.roles,'admin',async p=>{
        if(id==='UI-LEG-001'){
          await p.goto('/route-configs');for(const name of ['Quy tắc chặng hành trình','Mô phỏng'])await expect(quoteTab(p,name)).toBeVisible();
          for(const name of ['Bộ lọc','Thêm mới'])await expect(button(p.locator('main'),name)).toBeVisible();
          const table=new DataTableComponent(p);const heads=await table.headerTexts();for(const name of ['STT','Mã quy tắc','Tên quy tắc','Phạm vi','Phương thức vận tải','Loại hình vận tải','Thành phần','Điểm đi','Điểm đến','Trạng thái','Thao tác'])expect(heads).toContain(name);
          const seed=items(await s.list({status:'ACTIVE'}))[0];expect(seed).toBeTruthy();await search(p).fill(seed.code);const r=ruleRow(p,seed.code);await expect(r).toBeVisible();await expect(r.getByRole('link',{name:seed.code,exact:true})).toBeVisible();
          expect(seed.code).toMatch(/^RUL-\d{4}-\d+$/);await expect(r.getByRole('button',{name:'Xem chi tiết',exact:true}).or(r.getByRole('link',{name:'Xem chi tiết',exact:true}))).toBeVisible();
          for(const name of [/^Chỉnh sửa$/,/^Xóa$|^Xoá$/,/Dừng hoạt động/])await expect(button(r,name)).toHaveCount(0);
        }else if(id==='UI-LEG-002'){
          const {rule}=await s.create(await s.available());await p.goto('/route-configs');await search(p).fill(rule.code);const r=ruleRow(p,rule.code);const hs=await new DataTableComponent(p).headerTexts();const col=hs.indexOf('Thành phần');expect(col).toBeGreaterThanOrEqual(0);await expect(r.locator('td').nth(col)).toHaveText(/2 chặng/i);
        }else if(id==='UI-LEG-003'){
          const {rule}=await s.create(await s.available({executionScope:'DOMESTIC'}));await p.goto('/route-configs');await button(p.locator('main'),'Bộ lọc').click();
          for(const label of ['Phạm vi','Phương thức vận tải','Loại hình vận tải','Điểm đi','Điểm đến','Trạng thái'])await expect(select(dialog(p),label)).toBeVisible();
          await choose(p,select(dialog(p),'Phạm vi'),'Nội địa');await choose(p,select(dialog(p),'Trạng thái'),'Đang hoạt động');const pending=uiApi(p,'GET',/\/api\/leg-rules$/);await button(dialog(p),'Áp dụng').click();const res=await pending;expect(res.status()).toBe(200);const rows=items((await res.json()).data);expect(rows.length).toBeGreaterThan(0);for(const r of rows){expect(r.executionScope).toBe('DOMESTIC');expect(r.status).toBe('ACTIVE');}
          await search(p).fill(rule.code);await expect(ruleRow(p,rule.code)).toContainText('Nội địa');await expect(ruleRow(p,rule.code)).toContainText('Đang hoạt động');
        }else if(id==='UI-LEG-004'){
          await openCreate(p);for(const label of ['Tên quy tắc','Phạm vi thực hiện','Phương thức vận tải','Loại hình vận tải','Điểm đi','Điểm đến'])await expect(dialog(p).getByText(new RegExp(`^${label}\\s*\\*$`)).first()).toBeVisible();
          await expect(input(dialog(p),'Ghi chú')).toBeVisible();await expect(dialog(p).getByText('Cấu trúc chặng',{exact:true})).toBeVisible();await expect(legSelect(p,0,'Tên chặng')).toBeVisible();await expect(legSelect(p,0,'Dịch vụ')).toBeVisible();
          for(const name of ['Thêm chặng','Hủy','Tạo'])await expect(button(dialog(p),name)).toBeVisible();
        }else if(id==='UI-LEG-005'){
          await openCreate(p);const before=stable(await s.list());const requests:string[]=[];p.on('request',r=>{if(r.method()==='POST'&&/\/api\/leg-rules$/.test(new URL(r.url()).pathname))requests.push(r.url());});await button(dialog(p),'Tạo').click();
          for(const text of ['Vui lòng nhập tên quy tắc','Vui lòng chọn phạm vi thực hiện','Vui lòng chọn phương thức vận tải','Vui lòng chọn loại hình vận tải','Vui lòng chọn điểm đi','Vui lòng chọn điểm đến'])await expect(p.getByText(text,{exact:true})).toBeVisible();
          expect(requests).toHaveLength(0);await expect(dialog(p)).toBeVisible();expect(stable(await s.list())).toEqual(before);
        }else if(id==='UI-LEG-006'){
          await openCreate(p);await select(dialog(p),'Phương thức vận tải').click();
          for(const name of ['Đường biển','Đường hàng không','Đường sắt']){const option=p.getByRole('option',{name,exact:true}).or(p.getByText(name,{exact:true})).last();await expect(option).toBeVisible();await expect(option).toBeDisabled();}
          await expect(p.getByText('Chưa hỗ trợ trong phạm vi hiện tại',{exact:true}).first()).toBeVisible();await p.keyboard.press('Escape');await choose(p,select(dialog(p),'Phương thức vận tải'),'Đường bộ');await select(dialog(p),'Loại hình vận tải').click();await expect(p.getByRole('option',{name:'Hàng ghép',exact:true}).or(p.getByText('Hàng ghép',{exact:true})).last()).toBeDisabled();await p.keyboard.press('Escape');await choose(p,select(dialog(p),'Loại hình vận tải'),'Hàng nguyên');
        }else if(id==='UI-LEG-007'||id==='UI-LEG-008'){
          const exact=id==='UI-LEG-007';const b=await s.available(exact?{executionScope:'DOMESTIC',originPointTypeCode:s.refs.borderVn.code,destinationPointTypeCode:s.refs.inlandVn.code}:{});
          if(!exact)b.legs[1].serviceTypeCodes=[];await openCreate(p);await fillRule(p,s,b);const pending=uiApi(p,'POST',/\/api\/leg-rules$/);await button(dialog(p),'Tạo').click();
          if(!exact){await expect(dialog(p).getByText('Chặng chưa gán dịch vụ',{exact:true})).toBeVisible();await expect(dialog(p)).toContainText(s.refs.toInland.name);await button(dialog(p),/^(Tiếp tục|Vẫn tiếp tục|Đồng ý)$/).click();}
          expect([200,201]).toContain((await pending).status());const r=await created(s,b.name);uiCreated.add(r.code);await expect(p.getByRole('dialog')).toHaveCount(0);await search(p).fill(r.code);await expect(ruleRow(p,r.code)).toContainText('Đang hoạt động');await expect(ruleRow(p,r.code)).toContainText(/2 chặng/i);expect(r.code).toMatch(/^RUL-\d{4}-\d+$/);
          if(!exact)expect(r.legs[1].empty).toBe(true);
        }else if(id==='UI-LEG-009'){
          const {rule}=await s.create(await s.available());await p.goto('/route-configs');await search(p).fill(rule.code);await ruleRow(p,rule.code).getByRole('link',{name:rule.code,exact:true}).click();await expect(p).toHaveURL(new RegExp(`/route-configs/${rule.code}`));
          await expect(p.getByText('Quay lại danh sách',{exact:true})).toBeVisible();await expect(p.getByRole('heading',{name:rule.name,exact:true})).toBeVisible();for(const label of ['Ngày tạo','Người tạo','Thông tin chung','Mã quy tắc','Tên quy tắc','Phạm vi thực hiện','Phương thức vận tải','Loại hình vận tải','Điểm đi','Điểm đến','Cấu trúc chặng'])await expect(p.locator('main').getByText(label,{exact:true}).first()).toBeVisible();
          for(const label of ['Dừng hoạt động','Xóa','Chỉnh sửa'])await expect(button(p.locator('main'),label)).toBeVisible();await expect(button(p.locator('main'),'Lịch sử thao tác')).toBeVisible();await expect(p.locator('main')).toContainText(/2 chặng/i);for(let i=0;i<2;i++){await expect(p.getByText(new RegExp(`Chặng ${i+1}:.*${i===0?s.refs.atGate.name:s.refs.toInland.name}`))).toBeVisible();}
        }else if(id==='UI-LEG-010'){
          const {rule}=await s.create(await s.available());const name=tagged('AT Quy tắc đã sửa UI');await p.goto(`/route-configs/${rule.code}`);await button(p.locator('main'),'Chỉnh sửa').click();await expect(dialog(p).getByText('Chỉnh sửa quy tắc chặng',{exact:true})).toBeVisible();await expect(input(dialog(p),'Mã quy tắc')).toHaveValue(rule.code);await expect(input(dialog(p),'Mã quy tắc')).not.toBeEditable();await input(dialog(p),'Tên quy tắc').fill(name);const pending=uiApi(p,'PUT',/\/api\/leg-rules\/[^/]+$/);await button(dialog(p),'Lưu thông tin').click();expect([200,204]).toContain((await pending).status());await expect(p.getByRole('heading',{name,exact:true})).toBeVisible();expect((await s.get(rule.code)).name).toBe(name);await button(p.locator('main'),'Lịch sử thao tác').click();await expect(dialog(p).getByText(/Chỉnh sửa/).first()).toBeVisible();
        }else if(id==='UI-LEG-011'){
          const profile = await s.availableDomestic(s.refs.borderVn.code);
          const { rule } = await s.create(profile);
          const sim = await s.simulationInput(profile);
          const before = await must(await s.simulate(sim), 'mô phỏng trước khi tắt');
          expect(before.outcome).toBe('MATCHED');
          expect(before.rule?.code).toBe(rule.code);
          await p.goto(`/route-configs/${rule.code}`);await button(p.locator('main'),'Dừng hoạt động').click();const pending=uiApi(p,'PATCH',/\/api\/leg-rules\/[^/]+\/status$/);await button(dialog(p),/^(Xác nhận|Đồng ý|Dừng hoạt động)$/).last().click();expect([200,204]).toContain((await pending).status());await expect(p.locator('main').getByText('Dừng hoạt động',{exact:true}).first()).toBeVisible();expect((await s.get(rule.code)).status).toBe('INACTIVE');await p.goto('/route-configs');await button(p.locator('main'),'Bộ lọc').click();await choose(p,select(dialog(p),'Trạng thái'),'Dừng hoạt động');await button(dialog(p),'Áp dụng').click();await search(p).fill(rule.code);await expect(ruleRow(p,rule.code)).toBeVisible();
          // Feed the same concrete profile into the simulator. It must never select this disabled rule.
          const result = await s.simulate(sim); expect([200,404]).toContain(result.status()); if (result.ok()) expect((await data(result)).outcome).toBe('NO_RULE');
        }else if(id==='UI-LEG-012'){
          const base=await p0Base(f.testRun);const order=await createOrder(f.testRun,base,{submit:true});await acceptOrder(f.testRun,order.id);const structure=await confirmLegs(f.testRun,order.id);const code=structure.ruleCode??structure.rule?.code;expect(code,'Phiếu đã xác nhận chặng có mã quy tắc').toBeTruthy();const before=stable(await s.get(code));await p.goto(`/route-configs/${code}`);await button(p.locator('main'),'Xóa').click();const pending=uiApi(p,'DELETE',/\/api\/leg-rules\/[^/]+$/);await button(dialog(p),/^(Xác nhận|Đồng ý|Xóa)$/).last().click();expect([400,409,422]).toContain((await pending).status());await expect(p.getByText(/không.*xóa.*phiếu|phiếu dịch vụ.*(sử dụng|dùng)/i).first()).toBeVisible();expect(stable(await s.get(code))).toEqual(before);
        }else if(id==='UI-LEG-013'){
          for(const method of ['gõ','dán'])for(const target of ['Tên quy tắc','Ghi chú'])for(const n of target==='Tên quy tắc'?[149,150,151]:[254,255,256]){
            const b=await s.available();const value=textOfLength(n,target==='Tên quy tắc'?'Quy tắc vận chuyển hàng hóa tại cửa khẩu ':'Ghi chú vận chuyển hàng hóa tại cửa khẩu ');expect(value.length).toBe(n);expect(value).toContain(' ');await openCreate(p);await fillRule(p,s,b);const el=input(dialog(p),target);await el.fill('');if(method==='gõ')await el.pressSequentially(value);else await pasteText(el,value);await expect(el,'Không cắt ngầm chuỗi').toHaveValue(value);await dialog(p).getByText('Cấu trúc chặng',{exact:true}).click();const pending=uiApi(p,'POST',/\/api\/leg-rules$/,7000).catch(()=>null);await button(dialog(p),'Tạo').click();
            const invalid=n===(target==='Tên quy tắc'?151:256);
            if(invalid){await expect(dialog(p).getByText(target==='Tên quy tắc'?/150 ký tự|tối đa 150|không.*vượt.*150/i:/255 ký tự|tối đa 255|không.*vượt.*255/i).first()).toBeVisible();await expect(dialog(p)).toBeVisible();const res=await pending;if(res)expect([400,422]).toContain(res.status());await noCreated(s,target==='Tên quy tắc'?value:b.name);await button(dialog(p),'Hủy').click();}
            else{const res=await pending;expect(res,'Giá trị hợp lệ gọi API tạo').not.toBeNull();expect([200,201]).toContain(res!.status());const r=await created(s,target==='Tên quy tắc'?value:b.name);uiCreated.add(r.code);expect(target==='Tên quy tắc'?r.name:r.description).toBe(value);expect([200,204]).toContain((await s.remove(r.code)).status());uiCreated.delete(r.code);}
          }
        }else if(id==='UI-LEG-014'){
          await openCreate(p);await choose(p,select(dialog(p),'Phạm vi thực hiện'),'Quốc tế');await choose(p,select(dialog(p),'Điểm đi'),'Nội địa Trung Quốc');await choose(p,select(dialog(p),'Điểm đến'),'Nội địa Việt Nam');await choose(p,select(dialog(p),'Phạm vi thực hiện'),'Cửa khẩu');for(const label of ['Điểm đi','Điểm đến']){await expect(select(dialog(p),label)).not.toContainText(/Nội địa Trung Quốc|Nội địa Việt Nam/);await select(dialog(p),label).click();await expect(p.getByText('Nội địa Trung Quốc',{exact:true})).toHaveCount(0);await expect(p.getByText('Nội địa Việt Nam',{exact:true})).toHaveCount(0);for(const name of ['Cửa khẩu Việt Nam','Cửa khẩu Trung Quốc'])await expect(p.getByText(name,{exact:true}).last()).toBeVisible();await p.keyboard.press('Escape');}
        }else if(id==='UI-LEG-015'){
          await openCreate(p);await choose(p,select(dialog(p),'Phạm vi thực hiện'),'Cửa khẩu');await choose(p,select(dialog(p),'Điểm đi'),'Cửa khẩu Việt Nam');await expect(select(dialog(p),'Điểm đến')).toContainText('Cửa khẩu Việt Nam');await choose(p,select(dialog(p),'Điểm đến'),'Cửa khẩu Trung Quốc');await expect(select(dialog(p),'Điểm đi')).toContainText('Cửa khẩu Trung Quốc');
        }else if(id==='UI-LEG-016'){
          await openCreate(p);await legSelect(p,0,'Dịch vụ').click();for(const name of ['Khai báo hải quan','Hải quan giám sát','Vận tải','Sang tải'])await expect(p.getByText(name,{exact:true}).last()).toBeVisible();await expect(p.getByText('Kho bãi',{exact:true})).toHaveCount(0);await p.keyboard.press('Escape');const remove=removeLeg(p,0);await expect(remove).toBeDisabled();await expect(dialog(p).locator('label').filter({hasText:exactLabel('Tên chặng')})).toHaveCount(1);
        }else if(id==='UI-LEG-017'){
          const refs=await f.testRun.p0Refs();const before=stable(await s.list());const expected=await must(await s.simulate(await s.simulationInput()),'xác định quy tắc seed của mô phỏng');expect(expected.outcome).toBe('MATCHED');await p.goto('/route-configs');await quoteTab(p,'Mô phỏng').click();await choose(p,select(p.locator('main'),'Phương thức vận tải'),s.refs.road.name);await choose(p,select(p.locator('main'),'Loại hình vận tải'),s.refs.full.name);
          const origin=p.locator('main').getByText('Điểm đi',{exact:true}).locator('xpath=ancestor::div[.//input[@type="radio"]][1]');const destination=p.locator('main').getByText('Điểm đến',{exact:true}).locator('xpath=ancestor::div[.//input[@type="radio"]][1]');await origin.getByRole('radio',{name:'Cửa khẩu',exact:true}).check();await choose(p,select(origin,'Cửa khẩu'),'Hữu Nghị');await destination.getByRole('radio',{name:'Địa chỉ',exact:true}).check();await choose(p,select(destination,'Quốc gia'),'Việt Nam');await choose(p,select(destination,'Tỉnh/Thành phố'),'Hà Nội');
          const ward=await f.testRun.pick('GET /api/catalogues/wards',/.+/,{provinceCode:(refs.destination as any).provinceCode});await choose(p,select(destination,'Phường/Xã'),ward.name);await input(destination,'Địa chỉ chi tiết').fill('KCN Bắc Thăng Long');for(const name of ['Khai báo hải quan','Hải quan giám sát','Vận tải','Sang tải','Kho bãi'])await p.getByRole('checkbox',{name,exact:true}).check();
          await expect(p.getByText('Cấu trúc chặng được tự động sinh ra',{exact:true})).toBeVisible();await expect(p.locator('main')).toContainText(expected.rule.code);await expect(p.locator('main')).toContainText('Nội địa');await expect(p.locator('main')).toContainText(/2 chặng/i);await expect(p.getByText('Dịch vụ Kho bãi được gán mặc định vào Chặng 1',{exact:true})).toBeVisible();for(const name of ['Khai báo hải quan','Hải quan giám sát','Sang tải','Kho bãi','Vận tải'])await expect(p.locator('main').getByText(name,{exact:true}).last()).toBeVisible();expect(stable(await s.list())).toEqual(before);
        }else if(id==='UI-LEG-018'){
          const {rule}=await s.create(await s.available());const b=s.fromDetail(rule);b.description=tagged('AT Nội dung đã sửa');expect([200,204]).toContain((await s.update(rule.code,b)).status());await p.goto(`/route-configs/${rule.code}`);const pending=uiApi(p,'GET',/\/api\/leg-rules\/[^/]+\/history$/);await button(p.locator('main'),'Lịch sử thao tác').click();expect((await pending).status()).toBe(200);await expect(dialog(p).getByText('Chi tiết lịch sử thao tác',{exact:true})).toBeVisible();await expect(dialog(p)).toContainText(`Quy tắc chặng: ${rule.code}`);await expect(dialog(p).getByText(/Thêm mới/).first()).toBeVisible();await expect(dialog(p).getByText(/Chỉnh sửa/).first()).toBeVisible();const history=items(await s.history(rule.code));expect(history.length).toBeGreaterThanOrEqual(2);for(const h of history.slice(0,2)){await expect(dialog(p).getByText(h.actorName,{exact:true}).first()).toBeVisible();}await expect(dialog(p)).toContainText(b.description);
        }else throw new Error(`Chưa khai báo kịch bản UI ${id}`);
      });
    }finally{for(const code of uiCreated)expect([200,204,404]).toContain((await s.remove(code)).status());}
  });
}
