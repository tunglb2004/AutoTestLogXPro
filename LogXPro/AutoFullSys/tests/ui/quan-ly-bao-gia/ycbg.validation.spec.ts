import * as QU from '../../../src/quan-ly-bao-gia/data/quote-ui.scenario';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, pasteText } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import { withQuotePage, quoteTab } from '../../../src/quan-ly-bao-gia/data/quote-ui.fixture';
import { QuoteScenario } from '../../../src/quan-ly-bao-gia/data/quote-scenario.factory';

test.describe("Yêu cầu báo giá", () => {
  test("UI-RFQ-009 Nút theo trạng thái YCBG", { tag: ["@ui", "@quan-ly-bao-gia", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    test.setTimeout(600000); const q=new QuoteScenario(testRun);
    const draft=await q.newRfq(); const waiting=await q.newRfq(true); const pricing=await q.pricing(); const declined=await q.pricing();
    await must(await q.call('POST /api/quotation-requests/{id}/internal-quote/decline','cc',{params:{id:declined.id},json:{reason:'Thiếu dữ liệu chuẩn bị trạng thái UI'}}),'từ chối');
    const priced=await q.issued(); const cancelled=await q.newRfq(true); await must(await q.call('POST /api/quotation-requests/{id}/cancel','k1',{params:{id:cancelled.id},json:{reason:'Tạo tiền điều kiện UI đã hủy'}}),'hủy');
    const scenarios:[string,string[]][]=[[draft.id,['Lịch sử thao tác','Xóa','Sửa','Lấy tự động BGNB','Nhân bản','Gửi sang Pricing']],[waiting.id,['Hủy yêu cầu','Sửa','Lấy tự động BGNB','Nhân bản']],[declined.id,['Hủy yêu cầu','Sửa','Nhân bản','Khôi phục yêu cầu báo giá']],[pricing.id,['Lịch sử thao tác','Nhân bản']],[priced.rfq.id,['Tạo báo giá khách hàng','Nhân bản']],[cancelled.id,['Lịch sử thao tác','Nhân bản']]];
    const all=[...new Set(scenarios.flatMap(x=>x[1]))];
    await QU.quoteUiCase(browser,roles,'k1',async page=>{ for(const [id,allowed] of scenarios) { await page.goto(`/quotations/requests/${id}`); for(const name of all) { const action=page.getByRole('button',{name,exact:true}).or(page.getByRole('link',{name,exact:true})); if(allowed.includes(name)) await expect(action,name).toBeVisible(); else await expect(action,name).toHaveCount(0); } } });
  });

  test("UI-RFQ-010 Hủy YCBG không nhập lý do", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun }) => {

    const q = new QuoteScenario(testRun);
    const r = await q.newRfq(true);
    const before = stable(await q.rfq(r.id));
    const history = await q.history(r.id);
    await withQuotePage(browser, roles, 'k1', async page => {
      await page.goto(`/quotations/requests/${r.id}`);
      await page.getByRole('button', { name: 'Hủy yêu cầu', exact: true }).click();
      const dialog = page.getByRole('dialog').last(); await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('textbox').first()).toHaveValue('');
      await dialog.getByRole('button', { name: /Xác nhận hủy|^Xác nhận$/ }).click();
      await expect(dialog.getByText(/Vui lòng nhập lý do/)).toBeVisible();
      expect(stable(await q.rfq(r.id))).toEqual(before);
      expect(await q.history(r.id), 'Không ghi lịch sử hủy').toEqual(history);
    });

  });

  test("UI-RFQ-014 Ghi chú chung 999/1000/1001 ký tự", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    test.setTimeout(600000); const q=new QuoteScenario(testRun);
    for(const n of [999,1000,1001]) for(const method of ['dán','gõ']) {
     const note=textOfLength(n); expect(note.length).toBe(n); expect(note).toContain(' ');
     await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await QU.fillRfqBasics(page,testRun); await QU.fillRfqServices(page,testRun,['KHQ']); const input=QU.inputByLabel(page,'Ghi chú chung'); if(method==='dán') await pasteText(input,note); else await input.pressSequentially(note); await input.blur(); await expect(input,'Không cắt ngầm').toHaveValue(note);
      if(n<1001) { const response=QU.apiFromUi(page,'POST',/\/quotation-requests$/); await QU.qButton(page,'Lưu nháp').click(); QU.expectUiStatus(await response,[200,201]); await expect(page).toHaveURL(/\/quotations\/requests\/[0-9a-f-]{36}$/i); expect((await q.rfq(page.url().split('/').pop()!)).generalNote).toBe(note); }
      else { await QU.qButton(page,'Lưu nháp').click(); await expect(QU.fieldRoot(page,'Ghi chú chung').getByText(/1000|tối đa|quá dài/i).first()).toBeVisible(); await expect(page).toHaveURL(/\/quotations\/requests\/new$/); }
     });
    }
  });

  test("UI-RFQ-015 Lý do hủy 499/500/501 ký tự", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    test.setTimeout(600000); const q=new QuoteScenario(testRun);
    for(const n of [499,500,501]) for(const method of ['dán','gõ']) { const r=await q.newRfq(true); const reason=textOfLength(n);
     await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await page.goto(`/quotations/requests/${r.id}`); await QU.qButton(page,'Hủy yêu cầu').click(); const d=QU.dialog(page); const input=QU.inputByLabel(d,'Lý do hủy'); if(method==='dán') await pasteText(input,reason); else await input.pressSequentially(reason); await input.blur(); await expect(input).toHaveValue(reason);
      if(n<501) { const response=QU.apiFromUi(page,'POST',/\/quotation-requests\/[^/]+\/cancel$/); await d.getByRole('button',{name:/^(Xác nhận hủy|Xác nhận|Hủy yêu cầu)$/}).click(); QU.expectUiStatus(await response,[200,204]); await expect(page.getByText(reason,{exact:true})).toBeVisible(); const after=await q.rfq(r.id); expect(after.status).toBe('CANCELLED'); expect(after.cancelReason).toBe(reason); }
      else { const before=stable(await q.rfq(r.id)); await d.getByRole('button',{name:/^(Xác nhận hủy|Xác nhận|Hủy yêu cầu)$/}).click(); await expect(d.getByText(/500|tối đa|quá dài/i).first()).toBeVisible(); expect(stable(await q.rfq(r.id))).toEqual(before); }
     });
    }
  });

  test("UI-RFQ-006 Hải quan giám sát thiếu Chi cục hải quan", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun);
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await QU.fillRfqBasics(page,testRun); await QU.enableRfqService(page,'Hải quan giám sát');
     await QU.qButton(page,'Gửi sang Pricing').click(); await expect(page.getByText(/(vui lòng|bắt buộc|chưa).*chi cục hải quan|chi cục hải quan.*(bắt buộc|không được để trống)/i).first()).toBeVisible();
     const response=QU.apiFromUi(page,'POST',/\/quotation-requests$/); await QU.qButton(page,'Lưu nháp').click(); QU.expectUiStatus(await response,[200,201]);
     await expect(page).toHaveURL(/\/quotations\/requests\/[0-9a-f-]{36}$/i); const id=page.url().split('/').pop()!; expect((await q.rfq(id)).status).toBe('DRAFT');
    });
  });
});
