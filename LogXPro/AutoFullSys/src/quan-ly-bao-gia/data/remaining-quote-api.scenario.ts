import { expect, test } from '@playwright/test';
import { TestRun, blockedUnless, tagged, today } from '../../core/fixtures/test-run.fixture';
import { data, items, must } from '../../core/base.client';
import { stable, expectApiError, expectStatusIn } from '../../core/assertions';
import { P0_ITEMS } from '../../core/data/p0-price-set';
import { env } from '../../core/env';
import { p0Items, configOf, setItemStatus } from '../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { ensureContractorLines, priceLine } from '../../gia-mua-dau-vao/data/bang-gia-mua.factory';
import { sbpLines, setBenchmark } from '../../gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { sspLines, setSelling } from '../../gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { allTransportTemplate, flowBase, read, ok, buying, selling } from '../../gia-mua-dau-vao/data/price-flow.fixture';
import { p0Base } from '../../phieu-dich-vu/data/phieu-dich-vu.factory';
import { createRfq, rfqBody, rfqInPricing } from './ycbg.factory';
import { createInternalQuote, internalQuoteBody, tableAttributes } from './bgnb.factory';
import { createCustomerQuotation, setQuotationSettings } from './bgkh.factory';

const linesOf = (q:any) => { expect(Array.isArray(q.tables),'Có bảng giá đầy đủ trong BGNB').toBe(true);return q.tables.flatMap((t:any)=>t.lines??[]); };
const auto = (run:TestRun,id:string) => run.http.call('POST /api/quotation-requests/{id}/auto-internal-quote',{token:run.token('k1'),params:{id}});
const rfq = (run:TestRun,id:string) => read(run,'GET /api/quotation-requests/{id}',{id},'k1');
const iq = (run:TestRun,id:string) => read(run,'GET /api/internal-quotes/{id}',{id},'cc');
const notes = async(run:TestRun,id:string,role:'k1'|'k1b'='k1')=>{
  const d=await read(run,'GET /api/notifications',{},role,{limit:200});return (Array.isArray(d)?d:items(d)).filter((n:any)=>n.subjectId===id);
};
const history = (run:TestRun,id:string) => read(run,'GET /api/quotation-requests/{id}/history',{id},'k1',{page:1,perPage:100});

/** Dedicated pre-existing AUTO quotes can be supplied for calendar/synchronization scenarios.
 * Source deletion is restricted to explicitly named AT fixtures; production/seed price sources are never removed.
 */
async function autoSeed(run:TestRun,key:'090'|'091') {
  const id=process.env[`IPS_${key}_AUTO_RFQ_ID`];expect(id,`Cần IPS_${key}_AUTO_RFQ_ID: YCBG test có BGNB AUTO chưa có BGKH`).toBeTruthy();
  const r=await rfq(run,id!);expect(r.customerQuotation??null).toBeNull();expect(r.internalQuote?.id).toBeTruthy();
  const quote=await iq(run,r.internalQuote.id);expect(`${quote.source??quote.sourceCode??quote.origin??''}`).toMatch(/AUTO|Tự động/i);expect(quote.status).toMatch(/ISSUED|PUBLISHED/);
  const prefix=process.env[`IPS_${key}_FIXTURE_PREFIX`]??`AT IPS${key}`;
  expect(quote.name,'Chỉ dùng báo giá có tiền tố fixture được chỉ định').toContain(prefix);
  return {r,quote,prefix};
}
async function deleteOwnedSspSources(run:TestRun,sspId:string,prefix:string) {
  const s=await read(run,'GET /api/standard-selling-prices/{id}',{id:sspId});
  expect(s.priceConfigurationItemName,'Đầu mục phải thuộc fixture riêng').toContain(prefix);
  const d=await read(run,'GET /api/standard-buying-prices/{id}/contractors',{id:s.standardBuyingPriceId});expect(d.contractors.length).toBeGreaterThan(0);
  const sheets=items(await read(run,'GET /api/purchase-prices',{},'k1',{perPage:100,pagination:false}));
  const sources=d.contractors.map((c:any)=>{
    const parent=sheets.find((p:any)=>String(c.code).startsWith(`${p.code}-`));expect(parent,`Có bảng cha cho dòng ${c.code}`).toBeTruthy();expect(parent.name,'Chỉ xóa nguồn của bảng AT fixture').toContain(prefix);return {sheetId:parent.id,itemId:c.id};
  });
  for(const source of sources)await ok(run,'DELETE /api/purchase-prices/{id}/items/{itemId}',{id:source.sheetId,itemId:source.itemId},undefined,'k1');
  expectStatusIn(await run.http.call('GET /api/standard-selling-prices/{id}',{token:run.token('cc'),params:{id:sspId}}),'404','SSP mất nguồn cuối bị xóa');
}

export async function runRemainingIps(id:string,run:TestRun):Promise<void> {
  test.info().setTimeout(300_000);
  if(id==='IPS-129') {
    blockedUnless(['IPS_129_RFQ_ID']);
    const seed=process.env.IPS_129_RFQ_ID;expect(seed,'Cần IPS_129_RFQ_ID: BGNB Nháp/Thu hồi có validTo trong quá khứ').toBeTruthy();
    const r=await rfq(run,seed!);expect(r.internalQuote?.id).toBeTruthy();expect(r.customerQuotation??null).toBeNull();const before=await iq(run,r.internalQuote.id);
    expect(before.status).toMatch(/DRAFT|WITHDRAWN/);expect(Date.parse(before.validTo.slice(0,10))).toBeLessThan(Date.parse(today()));const h0=stable(await history(run,seed!));
    const response=await run.http.call('POST /api/quotation-requests/{id}/internal-quote/issue',{token:run.token('cc'),params:{id:seed!}});expectStatusIn(response,'400/409/422');await expectApiError(response);
    expect(stable(await iq(run,before.id))).toEqual(stable(before));expect((await rfq(run,seed!)).status).toBe(r.status);expect(stable(await history(run,seed!))).toEqual(h0);return;
  }
  const key=id==='IPS-090'?'090':'091';
  blockedUnless(key==='090' ? ['IPS_090_AUTO_RFQ_ID', 'IPS_090_SPECIFIC_SSP_ID', 'IPS_090_ALL_SSP_ID'] : ['IPS_091_AUTO_RFQ_ID']);
  const x=await autoSeed(run,key);
  if(id==='IPS-091') {
    const ids=[...new Set<string>(linesOf(x.quote).map((l:any)=>l.standardSellingPriceId).filter(Boolean))];expect(ids.length).toBeGreaterThan(0);
    // Validate ownership of every source before performing the first deletion.
    for(const sspId of ids){const s=await read(run,'GET /api/standard-selling-prices/{id}',{id:sspId});expect(s.priceConfigurationItemName).toContain(x.prefix);}
    for(const sspId of ids)await deleteOwnedSspSources(run,sspId,x.prefix);
    const before=await iq(run,x.quote.id);const r0=await rfq(run,x.r.id);
    const response=await run.http.call('POST /api/internal-quotes/{id}/sync-standard-prices',{token:run.token('cc'),params:{id:x.quote.id}});expectStatusIn(response,'200/204/409');
    expect(stable(await iq(run,x.quote.id)),'Không áp dụng kết quả khi không còn bảng khả dụng').toEqual(stable(before));expect((await rfq(run,x.r.id)).status).toBe(r0.status);return;
  }
  const specificId=process.env.IPS_090_SPECIFIC_SSP_ID, allId=process.env.IPS_090_ALL_SSP_ID;expect(specificId&&allId,'Cần SSP cụ thể và SSP Tất cả của fixture').toBeTruthy();
  const specific=await read(run,'GET /api/standard-selling-prices/{id}',{id:specificId!});const broad=await read(run,'GET /api/standard-selling-prices/{id}',{id:allId!});
  expect(specific.priceConfigurationItemId).toBe(broad.priceConfigurationItemId);expect(broad.warehouseName==='Tất cả'||broad.warehouseTypeName==='Tất cả','Fallback là tổ hợp Tất cả').toBe(true);expect(broad.sellingPrice).not.toBeNull();
  expect(linesOf(x.quote).some((l:any)=>l.standardSellingPriceId===specificId)).toBe(true);expect(x.quote.tables.filter((t:any)=>!t.disabled).length,'Cần bảng khác khả dụng để kiểm nhánh KB disable').toBeGreaterThan(1);
  await deleteOwnedSspSources(run,specificId!,x.prefix);
  let response=await run.http.call('POST /api/internal-quotes/{id}/sync-standard-prices',{token:run.token('cc'),params:{id:x.quote.id}});expectStatusIn(response,'200/204');
  const after=await iq(run,x.quote.id);const fallback=linesOf(after).find((l:any)=>l.itemId===specific.priceConfigurationItemId);expect(fallback.standardSellingPriceId).toBe(allId);expect(fallback.unitPrice).toBe(broad.sellingPrice);expect(fallback.benchmarkBuyingPrice).toBe(broad.benchmarkPrice);expect(after.status).toBe(x.quote.status);
  await deleteOwnedSspSources(run,allId!,x.prefix);response=await run.http.call('POST /api/internal-quotes/{id}/sync-standard-prices',{token:run.token('cc'),params:{id:x.quote.id}});expectStatusIn(response,'200/204');
  const missing=await iq(run,x.quote.id);const table=missing.tables.find((t:any)=>t.lines.some((l:any)=>l.itemId===specific.priceConfigurationItemId));expect(table.disabled).toBe(true);expect(table.total).toBeNull();const line=table.lines.find((l:any)=>l.itemId===specific.priceConfigurationItemId);expect(line.standardSellingPriceId).toBeNull();expect(line.unitPrice).toBeNull();expect(missing.total).toBe(missing.tables.filter((t:any)=>!t.disabled).reduce((n:number,t:any)=>n+Number(t.total),0));
}

export async function runEqualSpecificity(run:TestRun):Promise<void> {
  test.info().setTimeout(600_000);await p0Base(run);const refs=await run.p0Refs();const own=await p0Items(run,`RFQ140${run.id}`,'k1',['freight']);const units=await run.catalog('GET /api/catalogues/units');const other=units.find((u:any)=>u.active!==false&&u.code!==refs.units.freight);expect(other).toBeTruthy();
  await ensureContractorLines(run,env.ref('CONTRACTOR_A_ID'),'VND',[priceLine(refs,own,'freight',9_500_000),priceLine(refs,own,'freight',9_000_000,{unitCode:other.code})],`AT Đồng độ đặc hiệu ${run.id}`);
  const buys=await sbpLines(run,own.freight.id);expect(buys).toHaveLength(2);for(const b of buys)await setBenchmark(run,b.id,b.unitCode===refs.units.freight?9_500_000:9_000_000);
  const sales=await sspLines(run,own.freight.id);expect(sales).toHaveLength(2);for(const s of sales)await setSelling(run,s.id,s.unitCode===refs.units.freight?11_000_000:12_000_000);
  const selected=sales.find(s=>s.unitCode===other.code);expect(selected).toBeTruthy();const r=await createRfq(run,{services:['VT']});const response=await auto(run,r.id);expectStatusIn(response,'200/201');const result=await data(response);const quote=await iq(run,result.internalQuoteId);const line=linesOf(quote).find((l:any)=>l.itemId===own.freight.id);expect(line).toBeTruthy();expect(line.standardSellingPriceId,'BR39 tầng3 lấy giá bán cao nhất').toBe(selected.id);expect(line.unitPrice).toBe(12_000_000);expect(line.unitCode).toBe(other.code);expect(line.benchmarkBuyingPrice).toBe(9_000_000);
}

export async function runEmptyMergedGroup(run:TestRun):Promise<void> {
  test.info().setTimeout(600_000);const base=await flowBase(run,'FLOW-DEACT-011',false);const refs=await run.p0Refs();const offices=await run.catalog('GET /api/catalogues/customs-offices');const second=offices.find((o:any)=>o.active!==false&&o.code!==refs.customsOffice);expect(second).toBeTruthy();
  await ensureContractorLines(run,env.ref('CONTRACTOR_A_ID'),'VND',[priceLine(refs,base.items,'seal',150_000,{customsOfficeCodes:[second.code]})],`AT Hai tổ hợp kẹp chì ${run.id}`);
  const b=await sbpLines(run,base.items.seal.id);expect(b).toHaveLength(2);for(const s of b)await setBenchmark(run,s.id,150_000);const sales=await sspLines(run,base.items.seal.id);expect(sales).toHaveLength(2);for(const s of sales)await setSelling(run,s.id,200_000);
  const r=await rfqInPricing(run);const map:any=Object.fromEntries(P0_ITEMS.filter(i=>i.inQuote).map(i=>[i.key,{itemId:base.items[i.key].id,sspId:base.ssp[i.key]!,price:i.ssp!}]));const payload:any=await internalQuoteBody(run,r.id,map);
  for(const s of sales){const source=b.find(v=>v.id===s.standardBuyingPriceId);payload.tables.push({serviceTypeCode:refs.services.HQGS,name:tagged('AT Biểu giá kẹp chì'),attributes:{...tableAttributes(refs,'HQGS'),customsOfficeCode:source.customsOfficeName===second.name?second.code:refs.customsOffice},lines:[{priceConfigurationItemId:base.items.seal.id,standardSellingPriceId:s.id,unitPrice:200_000}]});}
  const quote=await createInternalQuote(run,r.id,map,'cc',payload);await ok(run,'POST /api/internal-quotes/{id}/issue',{id:quote.id});const cq=await createCustomerQuotation(run,r.id);await setQuotationSettings(run,cq,{vatBand:'VAT_8'});const before=await read(run,'GET /api/customer-quotations/{id}',{id:cq.id},'k1');expect(before.status).toBe('PENDING_CONFIRMATION');
  const seal=before.lines.filter((l:any)=>l.revenueItemId===base.items.seal.id||l.priceConfigurationItemId===base.items.seal.id);expect(seal).toHaveLength(2);
  const regular=before.lines.filter((l:any)=>[base.items.customsFee.id,base.items.overtime.id].includes(l.revenueItemId??l.priceConfigurationItemId));expect(regular).toHaveLength(2);
  await ok(run,'POST /api/customer-quotations/{id}/merges',{id:cq.id},{displayName:'AT G1 KHQ',unitCode:refs.units.customsFee,lineIds:regular.map((l:any)=>l.id)},'k1');await ok(run,'POST /api/customer-quotations/{id}/merges',{id:cq.id},{displayName:'AT G2 Kẹp chì',unitCode:refs.units.seal,lineIds:seal.map((l:any)=>l.id)},'k1');
  const merged=await read(run,'GET /api/customer-quotations/{id}',{id:cq.id},'k1');const keep=merged.mergedGroups.find((g:any)=>g.displayName==='AT G1 KHQ');const gone=merged.mergedGroups.find((g:any)=>g.displayName==='AT G2 Kẹp chì');expect(keep&&gone).toBeTruthy();
  expectStatusIn(await setItemStatus(run,base.items.seal,'INACTIVE'),'200/204');try {const after=await read(run,'GET /api/customer-quotations/{id}',{id:cq.id},'k1');expect(after.mergedGroups.some((g:any)=>g.id===gone.id)).toBe(false);expect(stable(after.mergedGroups.find((g:any)=>g.id===keep.id))).toEqual(stable(keep));expect(after.lines.some((l:any)=>(l.revenueItemId??l.priceConfigurationItemId)===base.items.seal.id)).toBe(false);expect(after.subtotal).toBe(merged.subtotal-400_000);expect(after.vatAmount).toBe(Math.round(after.subtotal*0.08));expect(after.total).toBe(after.subtotal+after.vatAmount);}finally {expectStatusIn(await setItemStatus(run,base.items.seal,'ACTIVE'),'200/204');}
}

export async function runSystemDeactivationHistory(run:TestRun):Promise<void> {
  const candidates:string[]=[];if(process.env.CFG_SYSTEM_DEACT_CONFIG_ID)candidates.push(process.env.CFG_SYSTEM_DEACT_CONFIG_ID);else for(const service of ['KHQ','HQGS','VT','ST','KB'] as const)candidates.push((await configOf(run,service)).id);
  let sample:any,configId:string|undefined;
  for(const id of candidates){for(let page=1;page<=100;page++){const d=await read(run,'GET /api/price-configurations/{id}/history',{id},'k1',{page,perPage:100});sample=items(d).find((h:any)=>!h.actorUserId&&/tắt kích hoạt|deactivat|disable/i.test(`${h.eventLabel??''} ${h.event??''} ${h.action??''}`));if(sample){configId=id;break;}if(page>=Number(d.meta?.pagination?.totalPages??1))break;}if(sample)break;}
  expect(sample,'Cần bản ghi tắt kích hoạt do tiến trình hệ thống; có thể chỉ định CFG_SYSTEM_DEACT_CONFIG_ID').toBeTruthy();expect(sample.event,'Bản ghi có khóa hành động để lọc').toBeTruthy();const response=await run.http.call('GET /api/price-configurations/{id}/history',{token:run.token('k1'),params:{id:configId!},query:{event:[sample.event],page:1,perPage:100}});expectStatusIn(response,'200');const filtered=items(await data(response));const row=filtered.find((h:any)=>h.id===sample.id);expect(row,'Lọc hành động giữ bản ghi hệ thống').toBeTruthy();expect(row.actorUserId).toBeNull();expect(row.actorName).toBe('Hệ thống');
}

type MixPlan={trades:any[];groups:any[];vehicles:any[];natures:any[];routes:any[];q:number;st:boolean;kb:boolean;count:number};
const unique=<T>(values:T[],key:(v:T)=>string)=>[...new Map(values.map(v=>[key(v),v])).values()];
function pointCommand(p:any) {
  return {pointType:'ADDRESS',countryCode:p.country.code,provinceCode:p.province.code,...(p.prefecture?.code?{prefectureCode:p.prefecture.code}:{}),...(p.district?.code?{districtCode:p.district.code}:{}),...(p.wards?.[0]?.code?{wardCode:p.wards[0].code}:{}),placeName:p.name};
}
const pointKey=(p:any)=>JSON.stringify([p.countryCode,p.provinceCode,p.prefectureCode??'',p.districtCode??'',p.wardCode??'']);
/** Counts the source product specified by BR34–36. Never creates 201 transport pairs to bypass the 20-pair cap. */
async function mixPlan(run:TestRun,target:number,duplicate:boolean):Promise<MixPlan> {
  const [trades,groups,vehicles,natures,points]=await Promise.all(['trade-types','cargo-groups','vehicle-types','cargo-natures','transport-points'].map(p=>run.catalog(`GET /api/catalogues/${p}`)));
  const active=(v:any[])=>v.filter(x=>x.active!==false);const ts=active(trades),gs=active(groups),vs=active(vehicles),ns=active(natures);
  const addresses=unique(active(points).filter(p=>p.country?.code&&p.province?.code).map(pointCommand),pointKey);const pairs:any[]=[];
  for(const pickup of addresses)for(const delivery of addresses)if(pointKey(pickup)!==pointKey(delivery))pairs.push({pickup,delivery});
  const maxRoutes=Math.min(duplicate?19:20,pairs.length);
  for(let v=2;v<=Math.min(vs.length,20);v++)for(let routes=2;routes<=maxRoutes;routes++)for(let q=0;q<=2;q++)for(let g=1;g<=Math.min(gs.length,20);g++)for(let t=1;t<=Math.min(ts.length,30);t++)for(let n=1;n<=Math.max(1,Math.min(ns.length,20));n++)for(const st of [false,true])for(const kb of [false,true]) {
    const count=q*t*g*v+(st?g*n:0)+(kb?1:0)+routes*v;
    if(count===target&&(!st||ns.length>=n))return {trades:ts.slice(0,t),groups:gs.slice(0,g),vehicles:vs.slice(0,v),natures:ns.slice(0,n),routes:pairs.slice(0,routes),q,st,kb,count};
  }
  throw new Error(`Thiếu tổ hợp danh mục thật để dựng ${target} bảng với ≤20 cặp điểm: trades=${ts.length},groups=${gs.length},vehicles=${vs.length},natures=${ns.length},points=${addresses.length}.`);
}
function legacyLeg(route:any) {
  const area=(p:any)=>({countryCode:p.countryCode,countryName:p.countryName??p.countryCode,provinceCode:p.provinceCode,provinceName:p.provinceName??p.provinceCode,prefectureCode:p.prefectureCode,districtCode:p.districtCode,wardCode:p.wardCode});
  return {originKind:'ADDRESS',originAddress:area(route.pickup),destinationKind:'ADDRESS',destinationAddress:area(route.delivery)};
}
async function thresholdRfq(run:TestRun,count:number,duplicates=false) {
  const p=await mixPlan(run,count,duplicates);const refs=await run.p0Refs();const codes=['VT',...(p.q>=1?['KHQ']:[]),...(p.q===2?['HQGS']:[]),...(p.st?['ST']:[]),...(p.kb?['KB']:[])] as ('VT'|'KHQ'|'HQGS'|'ST'|'KB')[];
  const body:any=await rfqBody(run,{},codes);const repeat=(values:any[])=>duplicates?[...values,values[0]]:values;
  body.serviceInfo={...body.serviceInfo,tradeTypes:repeat(p.trades.map(x=>x.code)),cargoGroupCodes:repeat(p.groups.map(x=>x.code)),vehicleTypeCodes:repeat(p.vehicles.map(x=>x.code)),cargoNatureCodes:repeat(p.natures.map(x=>x.code))};
  const routes=repeat(p.routes);body.services=body.services.map((s:any)=>s.serviceTypeCode===refs.services.VT?{...s,routes}:s);body.transportLegs=routes.map(legacyLeg);body.generalNote=tagged(`AT ${count} tổ hợp sau khử trùng`);
  const distinct=(values:string[])=>new Set(values).size;const dedupRoutes=unique(routes,(r:any)=>JSON.stringify([pointKey(r.pickup),pointKey(r.delivery)])).length;
  const actual=p.q*distinct(body.serviceInfo.tradeTypes)*distinct(body.serviceInfo.cargoGroupCodes)*distinct(body.serviceInfo.vehicleTypeCodes)+(p.st?distinct(body.serviceInfo.cargoGroupCodes)*distinct(body.serviceInfo.cargoNatureCodes):0)+(p.kb?1:0)+dedupRoutes*distinct(body.serviceInfo.vehicleTypeCodes);
  expect(actual,'Oracle độc lập: tổng tích Descartes sau khử trùng').toBe(count);expect(routes.length).toBeLessThanOrEqual(20);
  const r=await createRfq(run,{body,services:codes});const before=await rfq(run,r.id);expect(before.status).toBe('DRAFT');return {r,body,plan:p,before};
}
async function completed(run:TestRun,requestId:string,count:number,syncId?:string) {
  let done:any;
  if(syncId) {
    done=await rfq(run,requestId);
    expect(done.autoQuoteRunning,'Phản hồi đồng bộ kết thúc tạo BGNB').toBe(false);
    expect(done.internalQuote?.id).toBe(syncId);
  } else {
    await expect.poll(async()=>{done=await rfq(run,requestId);return !done.autoQuoteRunning&&Boolean(done.internalQuote?.id);},{timeout:180_000,intervals:[250,500,1000,2000],message:'Job tạo BGNB hoàn tất và liên kết 1–1 được ghi nguyên tử'}).toBe(true);
  }
  const quote=await iq(run,done.internalQuote.id);expect(quote.tables,'Số bảng bằng số tổ hợp sau khử trùng').toHaveLength(count);
  const keys=quote.tables.map((t:any)=>JSON.stringify([t.serviceTypeCode,Object.entries(t.attributes??{}).sort(([a],[b])=>a.localeCompare(b))]));expect(new Set(keys).size,'Không tạo hai bảng cùng tổ hợp').toBe(count);
  for(const table of quote.tables){expect(table.disabled,'Tiền điều kiện SSP đủ giá: mọi bảng khả dụng').toBe(false);expect(table.lines.length).toBeGreaterThan(0);for(const line of table.lines){expect(line.standardSellingPriceId).toBeTruthy();expect(typeof line.unitPrice).toBe('number');expect(line.unitPrice).toBeGreaterThanOrEqual(0);}}
  expect(quote.source).toMatch(/AUTO|Tự động/i);expect(quote.status).toMatch(/ISSUED|PUBLISHED/);expect(done.status).toBe('PRICED');return quote;
}
async function resultNotification(run:TestRun,requestId:string,quoteId?:string,failed=false) {
  let found:any[]=[];await expect.poll(async()=>{found=await notes(run,requestId);if(quoteId)found.push(...await notes(run,quoteId));return found.some(n=>(failed?/thất bại|không thành công|hủy|cancel|fail/i:/báo giá nội bộ|BGNB|hoàn thành|thành công/i).test(`${n.title??''} ${n.body??''} ${n.kind??''}`));},{timeout:30_000,message:'Người bấm nhận thông báo kết quả job'}).toBe(true);
  const others=await notes(run,requestId,'k1b');if(quoteId)others.push(...await notes(run,quoteId,'k1b'));expect(others,'Không gửi kết quả tạo tự động cho K1 khác').toHaveLength(0);
}
export async function runThresholdCase(id:string,run:TestRun):Promise<void> {
  test.info().setTimeout(900_000);
  const counts=id==='RFQ-076'?[60]:id==='RFQ-077'?[201]:id==='RFQ-137'?[49,50,51]:[199,200,201];
  for(const count of counts){const x=await thresholdRfq(run,count,id==='RFQ-137');const h0=stable(await history(run,x.r.id));const response=await auto(run,x.r.id);
    if(count>200){expectStatusIn(response,'400/409/422');const error=await expectApiError(response);expect(error.message,'Yêu cầu đi theo luồng thủ công').toMatch(/thủ công|200|vượt.*(ngưỡng|giới hạn)/i);const after=await rfq(run,x.r.id);expect(after.status).toBe(x.before.status);expect(after.internalQuote??null).toBeNull();expect(after.autoQuoteRunning).toBe(false);expect(stable(await history(run,x.r.id))).toEqual(h0);const absent=await run.http.call('GET /api/quotation-requests/{id}/internal-quote',{token:run.token('cc'),params:{id:x.r.id}});expectStatusIn(absent,'404','Không có BGNB dở chiếm liên kết');}
    else if(count<=50){
      expectStatusIn(response,'200/201');
      const result=await data(response);
      expect(result.mode).toBe('SYNC');
      expect(result.internalQuoteId,'Phản hồi trả ngay ID BGNB đã tạo').toBeTruthy();
      await completed(run,x.r.id,count,result.internalQuoteId);
    } else {
      expectStatusIn(response,'202');
      const quote=await completed(run,x.r.id,count);
      await resultNotification(run,x.r.id,quote.id);
    }
  }
}
export async function runBackgroundRace(run:TestRun):Promise<void> {
  test.info().setTimeout(900_000);const x=await thresholdRfq(run,60);const response=await auto(run,x.r.id);expectStatusIn(response,'202');
  expect((await rfq(run,x.r.id)).autoQuoteRunning,'Tiền điều kiện race: đã quan sát job đang chạy trước thay đổi').toBe(true);
  const changed={...x.body,serviceInfo:{...x.body.serviceInfo,vehicleTypeCodes:[x.body.serviceInfo.vehicleTypeCodes[0]]},generalNote:tagged('AT Nội dung sửa sau lúc bấm')};
  const edit=await run.http.call('PUT /api/quotation-requests/{id}',{token:run.token('k1'),params:{id:x.r.id},json:changed});expectStatusIn(edit,'200/409');
  const cancel=await run.http.call('POST /api/quotation-requests/{id}/cancel',{token:run.token('k1'),params:{id:x.r.id},json:{reason:'Kiểm dữ liệu chốt tại lúc bấm tạo BGNB nền'}});expectStatusIn(cancel,'200/409');
  let final:any;await expect.poll(async()=>{final=await rfq(run,x.r.id);return final.autoQuoteRunning===false;},{timeout:180_000,intervals:[250,500,1000,2000]}).toBe(true);
  if(cancel.status()===200){expect(final.status).toBe('CANCELLED');expect(final.internalQuote??null).toBeNull();expectStatusIn(await run.http.call('GET /api/quotation-requests/{id}/internal-quote',{token:run.token('cc'),params:{id:x.r.id}}),'404');await resultNotification(run,x.r.id,undefined,true);}
  else {expect(final.internalQuote?.id,'Job không bị hủy phải có BGNB hoàn chỉnh').toBeTruthy();const quote=await iq(run,final.internalQuote.id);expect(quote.tables,'Dùng snapshot lúc bấm, không dùng số tổ hợp sau chỉnh sửa').toHaveLength(60);expect(quote.tables.every((t:any)=>t.disabled===false)).toBe(true);expect(final.status).toBe('PRICED');await resultNotification(run,x.r.id,quote.id);}
}
