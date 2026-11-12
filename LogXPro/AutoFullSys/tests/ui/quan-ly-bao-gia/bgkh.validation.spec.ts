import * as QU from '../../../src/quan-ly-bao-gia/data/quote-ui.scenario';
import * as CQF from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as PFUI from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import { env } from '../../../src/core/env';
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

test.describe("Báo giá khách hàng", () => {
  test("UI-RC-015 Tên đầu mục gộp 254/255/256 ký tự", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const refs=await testRun.p0Refs(); const unit=await QU.catalogueName(testRun,'GET /api/catalogues/units',refs.units.customsFee);
    for(const n of [254,255,256]) for(const method of ['dán','gõ']) {
     const x=await q.pending(); const name=textOfLength(n); expect(name.length).toBe(n);
     await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await QU.rcQuoteTab(page,x.cq.id); const d=await QU.mergePopup(page,x.base.items.customsFee.name,x.base.items.overtime.name); const input=QU.inputByLabel(d,'Tên đầu mục sau khi gộp');
      if(method==='dán') await pasteText(input,name); else await input.pressSequentially(name); await QU.choose(page,'Đơn vị tính sau khi gộp',unit,d); await input.blur();
      if(n<256) { await expect(input).toHaveValue(name); const response=QU.apiFromUi(page,'POST',/\/customer-quotations\/[^/]+\/merges$/); await d.getByRole('button',{name:'Xác nhận gộp',exact:true}).click(); QU.expectUiStatus(await response,[200,204]); await expect(QU.quoteRow(page,name)).toBeVisible(); }
      else { await d.getByRole('button',{name:'Xác nhận gộp',exact:true}).click(); await expect(d.getByText(/255|tối đa|quá dài/i).first()).toBeVisible(); await expect(d).toBeVisible(); }
     }); const groups=(await q.cq(x.cq.id)).mergedGroups; if(n<256) expect(groups.some((g:any)=>g.displayName===name)).toBe(true); else expect(groups).toHaveLength(0);
    }
  });

  test("UI-RC-016 Giá chốt 0, số lẻ và âm", { tag: ["@ui", "@quan-ly-bao-gia", "@p3"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const x=await q.pending();
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
     await QU.rcQuoteTab(page,x.cq.id);
     for(const [input,expected] of [['0',0],['1150000,5',1150001]] as const) { await QU.enterPrice(page,x.base.items.customsFee.name,input); await QU.savePrices(page); expectMoney(CQF.lineByName(await q.cq(x.cq.id),x.base.items.customsFee.name).sellPrice,expected); await expect(QU.quoteRow(page,x.base.items.customsFee.name)).toContainText(QU.vnd(expected)); }
     const before=stable(await q.cq(x.cq.id)); await QU.enterPrice(page,x.base.items.customsFee.name,'-1'); await QU.qButton(page,'Lưu').click();
     await expect(page.getByText(/không.*âm|lớn hơn hoặc bằng 0|không được nhỏ hơn 0/i).first()).toBeVisible(); expect(stable(await q.cq(x.cq.id))).toEqual(before);
    });
  });

  test("UI-RC-007 Popup gộp thiếu tên hoặc đơn vị tính", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    const q=new QuoteScenario(testRun); const x=await q.pending();
    await QU.quoteUiCase(browser,roles,'k1',async page=>{
      await QU.rcQuoteTab(page,x.cq.id); const d=await QU.mergePopup(page,x.base.items.customsFee.name,x.base.items.overtime.name);
      await expect(d.getByText(/cố định.*phụ phí|phụ phí.*cố định/i)).toBeVisible();
      await d.getByRole('button',{name:'Xác nhận gộp',exact:true}).click();
      await expect(d.getByText('Vui lòng nhập tên cho đầu mục sau khi gộp',{exact:true})).toBeVisible();
      await expect(d.getByText('Vui lòng chọn đơn vị tính cho đầu mục sau khi gộp',{exact:true})).toBeVisible();
      await expect(d).toBeVisible();
    }); expect((await q.cq(x.cq.id)).mergedGroups).toHaveLength(0);
  });

  test("UI-RC-012 Từ chối không nhập lý do", { tag: ["@ui", "@quan-ly-bao-gia", "@p2"] }, async ({ browser, roles, http, testRun }) => {

    const q = new QuoteScenario(testRun);
    const x = await q.pending();
    const before = stable(await q.cq(x.cq.id));
    await withQuotePage(browser, roles, 'k1', async page => {
      await page.goto(`/quotations/rate-cards/${x.cq.id}`);
      await page.getByRole('button', { name: 'Từ chối', exact: true }).click();
      const dialog = page.getByRole('dialog').last();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('textbox').first()).toHaveValue('');
      await dialog.getByRole('button', { name: /Xác nhận từ chối|^Xác nhận$/ }).click();
      await expect(dialog.getByText(/Vui lòng nhập lý do/)).toBeVisible();
      await expect(dialog).toBeVisible();
      expect(stable(await q.cq(x.cq.id)), 'RC không bị từ chối khi lý do rỗng').toEqual(before);
    });

  });
});
