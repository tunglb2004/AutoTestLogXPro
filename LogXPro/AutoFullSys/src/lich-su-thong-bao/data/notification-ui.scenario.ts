import { Browser, Page, expect } from '@playwright/test';
import { TestRun } from '../../core/fixtures/test-run.fixture';
import { env } from '../../core/env';
import { must } from '../../core/base.client';
import { newLoginUser, loginThroughUi } from '../../quan-tri-phan-quyen/data/login-scenario';
import { createRfq } from '../../quan-ly-bao-gia/data/ycbg.factory';

const bell = (page:Page) => page.getByRole('button',{name:/thông báo/i})
  .or(page.locator('button').filter({has:page.locator('svg[class*="lucide-bell"]')})).first();

/** A new CC inbox prevents a read action changing notifications owned by a shared test account. */
export async function notificationUiCase(id:string,f:{browser:Browser;testRun:TestRun}):Promise<void>{
  const run=f.testRun;const u=await newLoginUser(run,'cc');const context=await f.browser.newContext({baseURL:env.webUrl});
  try{
    const page=await context.newPage();await loginThroughUi(page,u);const token=(await context.cookies()).find(c=>c.name==='access_token')?.value;expect(token,'Phiên CC riêng của UI').toBeTruthy();
    const list=async()=>{
      const d=await must(await run.http.call('GET /api/notifications',{token:token!,query:{unreadOnly:false,limit:200}}),'đọc inbox CC riêng');
      expect(Array.isArray(d),'Notifications trả mảng theo Swagger').toBe(true);return d as any[];
    };
    const count=async()=>{
      const d=await must(await run.http.call('GET /api/notifications/unread-count',{token:token!}),'đọc số chưa đọc');
      if(typeof d!=='number')expect(Object.values(d),'Swagger count-map chỉ có một bộ đếm').toHaveLength(1);
      const n=typeof d==='number'?d:Object.values(d)[0];
      expect(typeof n==='number'&&Number.isInteger(n)&&n>=0,'Số chưa đọc là số nguyên không âm').toBe(true);return n as number;
    };
    const rfqs:any[]=[];for(let i=0;i<3;i++)rfqs.push(await createRfq(run,{submit:true}));const subjectIds=new Set(rfqs.map(r=>r.id));
    await expect.poll(async()=>new Set((await list()).filter(n=>subjectIds.has(n.subjectId)&&n.readAt==null).map(n=>n.subjectId)).size,{message:'CC riêng nhận đủ 3 thông báo YCBG của case',timeout:30000}).toBe(3);
    // Other suites may send RFQs to every CC. Clear only unrelated notifications in this newly-created account.
    for(const n of await list())if(n.readAt==null&&!subjectIds.has(n.subjectId))await must(await run.http.call('POST /api/notifications/{id}/read',{token:token!,params:{id:n.id}}),'đọc thông báo ngoài dữ liệu của case trong inbox riêng');
    expect(await count(),'Tiền điều kiện: đúng 3 thông báo chưa đọc').toBe(3);
    await page.goto('/quotations');await expect(bell(page)).toBeVisible();await expect(bell(page).getByText('3',{exact:true})).toBeVisible();
    if(id==='UI-NTF-001'){
      expect(await count(),'Số chuông khớp số thực trên API').toBe(3);
    }else if(id==='UI-NTF-002'){
      const note=(await list()).find(n=>n.subjectId===rfqs[0].id&&n.readAt==null);expect(note).toBeTruthy();expect(typeof note.body).toBe('string');expect(note.body.length).toBeGreaterThan(0);
      await bell(page).click();await page.getByText(note.body,{exact:true}).last().click();
      await expect(page).toHaveURL(new RegExp(`/quotations/requests/${rfqs[0].id}(?:[/?#]|$)`));
      await expect.poll(async()=>(await list()).find(n=>n.id===note.id)?.readAt,{message:'Bấm thông báo đánh dấu đúng thông báo đã đọc'}).toBeTruthy();
      await expect.poll(count,{message:'Số chưa đọc giảm từ 3 xuống 2'}).toBe(2);await expect(bell(page).getByText('2',{exact:true})).toBeVisible();
    }else if(id==='UI-NTF-003'){
      const header=page.locator('header').first();await expect(header).toBeVisible();await expect(header).toHaveScreenshot('notification-top-bar.png',{animations:'disabled',mask:[header.getByText(u.displayName,{exact:true})]});
    }else throw new Error(`Chưa khai báo kịch bản UI ${id}`);
  }finally{await context.close();}
}
