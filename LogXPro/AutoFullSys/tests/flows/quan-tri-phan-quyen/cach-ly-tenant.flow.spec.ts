import * as TEN from '../../../src/quan-tri-phan-quyen/data/tenant-scenario';
import { QuoteScenario } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';
import * as CQF from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import { p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { costLines } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens, markIncomplete } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Cách ly tenant và tài nguyên con", () => {
  test.describe.configure({ mode: 'default' });

  test("FLOW-TEN-001 Token tenant A dùng id tài nguyên của tenant B", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http,testRun,tok }) => {
    TEN.blockedUnless([...TEN.TENANT_B_LOGIN,'TENANT_B_PURCHASE_PRICE_ID','TENANT_B_RC_ID','TENANT_B_ORDER_ID','TENANT_B_DOCUMENT_ID','TENANT_B_SSP_ID']);
    const b=await TEN.tenantB(testRun); const ids={price:TEN.requiredFixture('TENANT_B_PURCHASE_PRICE_ID'),rc:TEN.requiredFixture('TENANT_B_RC_ID'),order:TEN.requiredFixture('TENANT_B_ORDER_ID'),doc:TEN.requiredFixture('TENANT_B_DOCUMENT_ID'),ssp:TEN.requiredFixture('TENANT_B_SSP_ID')};
    const reads:[string,Record<string,string>][]=[['GET /api/purchase-prices/{id}',{id:ids.price}],['GET /api/customer-quotations/{id}',{id:ids.rc}],['GET /api/service-orders/{id}',{id:ids.order}]];
    const before=[]; for(const [api,params] of reads) before.push(stable(await TEN.successData(testRun,api,b,params)));
    const docApi='GET /api/service-orders/{id}/documents/{documentId}'; const docParams={id:ids.order,documentId:ids.doc}; const ownerDoc=await http.call(docApi,{token:b,params:docParams}); expectStatusIn(ownerDoc,'200'); const docHash=sha256(await ownerDoc.body());
    const sspBefore=stable(await TEN.successData(testRun,'GET /api/standard-selling-prices/{id}',b,{id:ids.ssp}));
    for(const [api,params] of reads) { const res=await http.call(api,{token:tok('k1'),params}); expectStatusIn(res,'404'); await expectApiError(res); }
    const deniedDoc=await http.call(docApi,{token:tok('k1'),params:docParams}); expectStatusIn(deniedDoc,'404'); await expectApiError(deniedDoc);
    const deniedWrite=await http.call('PUT /api/standard-selling-prices/{id}/selling-price',{token:tok('cc'),params:{id:ids.ssp},json:{sellingPrice:Number((sspBefore as any).sellingPrice??0)+1}}); expectStatusIn(deniedWrite,'404'); await expectApiError(deniedWrite);
    for(let i=0;i<reads.length;i++) expect(stable(await TEN.successData(testRun,reads[i][0],b,reads[i][1]))).toEqual(before[i]);
    const afterDoc=await http.call(docApi,{token:b,params:docParams}); expectStatusIn(afterDoc,'200'); expect(sha256(await afterDoc.body())).toBe(docHash);
    expect(stable(await TEN.successData(testRun,'GET /api/standard-selling-prices/{id}',b,{id:ids.ssp}))).toEqual(sspBefore);
  });

  test("FLOW-TEN-002 Danh sách và thống kê không lộ dữ liệu tenant khác", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http,testRun,tok }) => {
    TEN.blockedUnless([...TEN.TENANT_B_LOGIN,'TENANT_B_COMPLETED_ORDER_IDS']);
    const b=await TEN.tenantB(testRun); const completed=JSON.parse(TEN.requiredFixture('TENANT_B_COMPLETED_ORDER_IDS'));
    expect(Array.isArray(completed)).toBe(true); expect(completed).toHaveLength(3); expect(new Set(completed).size).toBe(3);
    for(const id of completed) { const d=await TEN.successData(testRun,'GET /api/service-orders/{id}',b,{id}); expect(d.status).toBe('COMPLETED'); }
    const foreignOrders=await TEN.allRows(testRun,'GET /api/cost-revenue/orders',b); expect(completed.every((id:string)=>foreignOrders.some(r=>r.serviceOrderId===id))).toBe(true);
    const a=await TEN.allRows(testRun,'GET /api/cost-revenue/orders',tok('cc')); TEN.noIntersection(a,foreignOrders,'serviceOrderId');
    const stats=await TEN.successData(testRun,'GET /api/cost-revenue/orders/stats',tok('cc')); expect(stats.orderCount).toBe(a.length);
    for(const [field,source] of [['totalRevenue','revenue'],['totalCost','cost'],['totalProfit','profit']] as const) {
     if(a.some(r=>r[source]===null)) {
       expect(stats.incomplete).toBe(true);
       expect(stats[field], 'Không đưa số tổng vào trường có dữ liệu thiếu').toBeNull();
     }
     else { for(const r of a) expect(typeof r[source],source).toBe('number'); expectMoney(stats[field],a.reduce((sum,r)=>sum+r[source],0),field); }
    }
    const pricesA=await TEN.allRows(testRun,'GET /api/purchase-prices',tok('k1')); const pricesB=await TEN.allRows(testRun,'GET /api/purchase-prices',b); TEN.noIntersection(pricesA,pricesB);
    const priceStats=await TEN.successData(testRun,'GET /api/purchase-prices/stats',tok('k1')); expect(priceStats.total).toBe(pricesA.length);
    const grouped = new Map<string, number>();
    for (const row of pricesA) {
      const status = row.status?.code ?? row.status;
      expect(status, 'Dòng bảng giá có trạng thái').toBeTruthy();
      grouped.set(status, (grouped.get(status) ?? 0) + 1);
    }
    expect(priceStats.byStatus.filter((x: any) => x.count > 0)).toHaveLength(grouped.size);
    for (const counter of priceStats.byStatus) {
      expect(counter.count).toBe(grouped.get(counter.status) ?? 0);
      grouped.delete(counter.status);
    }
    expect(grouped.size, 'Tất cả trạng thái có dữ liệu đều được thống kê').toBe(0);
    TEN.noIntersection(await TEN.allRows(testRun,'GET /api/customer-quotations',tok('k1')),await TEN.allRows(testRun,'GET /api/customer-quotations',b));
  });

  test("FLOW-TEN-003 Hoán đổi id tài nguyên con giữa các bản ghi cùng tenant", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http,testRun,tok }) => {
    test.setTimeout(600000);
    const q=new QuoteScenario(testRun); const a=await q.pending(); const b=await q.pending(); const refs=await testRun.p0Refs();
    for(const x of [a,b]) await must(await q.call('POST /api/customer-quotations/{id}/merges','k1',{params:{id:x.cq.id},json:{displayName:tagged('AT Nhóm cách ly'),unitCode:refs.units.customsFee,lineIds:[CQF.lineByName(x.cq,x.base.items.customsFee.name).id,CQF.lineByName(x.cq,x.base.items.overtime.name).id]}}),'gộp riêng từng RC');
    const a0=stable(await q.cq(a.cq.id)), b0=stable(await q.cq(b.cq.id)); const group=(b0 as any).mergedGroups[0]; expect(group.id).toBeTruthy();
    const p=await p0Order(testRun,'KHQ_COSTS'), other=await p0Order(testRun,'KHQ_COSTS');
    const upload=await must(await http.call('POST /api/service-orders/{id}/services/{serviceTypeCode}/documents',{token:tok('k1'),params:{id:other.id,serviceTypeCode:refs.services.KHQ},multipart:{file:REAL.pdf10()}}),'chứng từ Q'); expect(upload.id).toBeTruthy();
    const qDocs=await http.call('GET /api/service-orders/{id}/documents/{documentId}',{token:tok('k1'),params:{id:other.id,documentId:upload.id}}); expectStatusIn(qDocs,'200'); const docHash=sha256(await qDocs.body());
    const costs0=stable(await costLines(testRun,other.svc.KHQ)); const costId=(costs0 as any[])[0].costLineId; expect(costId).toBeTruthy();
    const requests:[string,any][]=[['DELETE /api/customer-quotations/{id}/merges/{groupId}',{token:tok('k1'),params:{id:a.cq.id,groupId:group.id}}],['DELETE /api/service-orders/{id}/documents/{documentId}',{token:tok('k1'),params:{id:p.id,documentId:upload.id}}],['DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}',{token:tok('dp'),params:{id:p.id,type:refs.services.KHQ,costLineId:costId}}]];
    for(const [api,options] of requests) {const res=await http.call(api,options); expectStatusIn(res,'403/404'); await expectApiError(res);}
    expect(stable(await q.cq(a.cq.id))).toEqual(a0); expect(stable(await q.cq(b.cq.id))).toEqual(b0); expect(stable(await costLines(testRun,other.svc.KHQ))).toEqual(costs0);
    const docAfter=await http.call('GET /api/service-orders/{id}/documents/{documentId}',{token:tok('k1'),params:{id:other.id,documentId:upload.id}}); expectStatusIn(docAfter,'200'); expect(sha256(await docAfter.body())).toBe(docHash);
    const exportId = process.env.CC_ASYNC_EXPORT_ID?.trim();
    if (!exportId) {
      markIncomplete('Cần CC_ASYNC_EXPORT_ID của lượt xuất READY còn hạn để kiểm tải file bằng tài khoản khác.');
      return;
    }
    const job=await TEN.successData(testRun,'GET /api/cost-revenue/exports/{id}',tok('cc'),{id:exportId}); expect(job.status).toBe('READY'); expect(Date.parse(job.expiresAt)).toBeGreaterThan(Date.now());
    const exportApi='GET /api/cost-revenue/exports/{id}/file'; const ownerFile=await http.call(exportApi,{token:tok('cc'),params:{id:exportId}}); expectStatusIn(ownerFile,'200'); const fileHash=sha256(await ownerFile.body());
    const deniedFile=await http.call(exportApi,{token:tok('admin'),params:{id:exportId}}); expectStatusIn(deniedFile,'403/404'); await expectApiError(deniedFile);
    const fileAfter=await http.call(exportApi,{token:tok('cc'),params:{id:exportId}}); expectStatusIn(fileAfter,'200'); expect(sha256(await fileAfter.body())).toBe(fileHash);
  });
});
