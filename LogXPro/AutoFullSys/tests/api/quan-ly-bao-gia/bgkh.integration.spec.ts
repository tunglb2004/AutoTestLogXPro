/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey, ServiceKey } from '../../../src/core/data/p0-price-set';
import { internalQuoteBody, SspMap, createInternalQuote, issueInternalQuote } from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
import { createCustomerQuotation, setQuotationSettings, setQuotationPrices, confirmQuotation, getCustomerQuotation, lineByName } from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import { setBenchmark, sbpLines } from '../../../src/gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { setSelling, sspLines } from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import { exclusive, ensureContractorLines, priceLine } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { createOrder, revenueOf, p0Base, buildP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { readXlsx, numbersIn } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { env } from '../../../src/core/env';
import { createRfq, rfqBody, serviceEntry, getRfq, rfqInPricing } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import { p0Items } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Báo giá khách hàng (BGKH/RC)", () => {
  test("RC-118 Định dạng và tên file", { tag: ["@api", "@quan-ly-bao-gia", "@p1"] }, async ({ http, testRun, tok, page }) => {

    const refs = await testRun.p0Refs();
    type Who = 'k1' | 'k1b' | 'cc';
    const CQ = async (id: string, role: Who = 'k1') => data(await http.call('GET /api/customer-quotations/{id}', { token: tok(role), params: { id } }));
    const mapOf = (b: any): SspMap => { const m: SspMap = {}; for (const it of P0_ITEMS.filter((i) => i.inQuote)) m[it.key] = { itemId: b.items[it.key].id, sspId: b.ssp[it.key]!, price: it.ssp! }; return m; };
    /** YCBG đã có BGNB phát hành (PRICED) của khách `customerId` (mặc định KH_A), từ bộ giá `b`. */
    const pricedRfq = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const b = o.base ?? (await p0Base(testRun));
      const rfq = await createRfq(testRun, { submit: true, body: await rfqBody(testRun, { ...(o.customerId ? { customerId: o.customerId } : {}), ...(o.sourceQuotationId ? { sourceQuotationId: o.sourceQuotationId } : {}) }) });
      await must(await http.call('POST /api/quotation-requests/{id}/accept', { token: tok('cc'), params: { id: rfq.id } }), 'Định giá tiếp nhận YCBG');
      const iq = await createInternalQuote(testRun, rfq.id, mapOf(b), 'cc');
      await issueInternalQuote(testRun, iq.id, 'cc');
      return { rfq, iq, base: b };
    };
    /** BGKH Chờ xác nhận (VAT 8%, chưa điều chỉnh giá). */
    const pending = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pricedRfq(o);
      let cq = await createCustomerQuotation(testRun, x.rfq.id, 'k1');
      cq = await setQuotationSettings(testRun, cq, { vatBand: P0.vatBand });
      return { ...x, cq: await CQ(cq.id) };
    };
    /** BGKH Đang hiệu lực theo P0 (Phí khai báo chốt 1.150.000). */
    const active = async (o: { customerId?: string; base?: any; sourceQuotationId?: string } = {}) => {
      const x = await pending(o);
      await setQuotationPrices(testRun, x.cq, { 'Phí khai báo': P0.customsFeeAgreed });
      await confirmQuotation(testRun, x.cq.id);
      return { ...x, cq: await CQ(x.cq.id) };
    };
    const SETTINGS = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/settings', { token: tok(role), params: { id }, json });
    const PRICES = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('PUT /api/customer-quotations/{id}/prices', { token: tok(role), params: { id }, json });
    const MERGE = (id: string, json: Record<string, unknown>, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/merges', { token: tok(role), params: { id }, json });
    const UNMERGE = (id: string, groupId: string, role: Who = 'k1') => http.call('DELETE /api/customer-quotations/{id}/merges/{groupId}', { token: tok(role), params: { id, groupId } });
    const RESET = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reset', { token: tok(role), params: { id } });
    const CONFIRM = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/confirm', { token: tok(role), params: { id } });
    const REJECT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/reject', { token: tok(role), params: { id }, json: { reason } });
    const DEACT = (id: string, reason: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/deactivate', { token: tok(role), params: { id }, json: { reason } });
    const DEFAULT = (id: string, role: Who = 'k1') => http.call('POST /api/customer-quotations/{id}/default', { token: tok(role), params: { id } });
    const HIST = async (id: string, query: Record<string, unknown> = {}, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/history', { token: tok(role), params: { id }, query: { page: 1, perPage: 100, ...query } })));
    const VERS = async (id: string, role: Who = 'k1') => items(await data(await http.call('GET /api/customer-quotations/{id}/versions', { token: tok(role), params: { id } })));
    const htext = (h: any) => `${h.eventLabel ?? ''} ${h.action ?? ''} ${h.summary ?? ''} ${h.event ?? ''}`;
    const line = (cq: any, name: string) => lineByName(cq, name);
    const khqMerge = (cq: any) => ({ displayName: 'Trọn gói khai báo hải quan', unitCode: refs.units.supervision, lineIds: [line(cq, 'Phí khai báo').id, line(cq, 'Phí ngoài giờ').id] });
    const iqOf = async (rfqId: string) => data(await http.call('GET /api/internal-quotes/{id}', { token: tok('cc'), params: { id: (await data(await http.call('GET /api/quotation-requests/{id}/internal-quote', { token: tok('cc'), params: { id: rfqId } }))).id } }));
    const meId = async (role: Who) => { const me = await data(await http.call('GET /api/auth/me', { token: tok(role) })); return me?.id ?? me?.userId; };

    const x = await active();
    const res = await http.call('GET /api/customer-quotations/{id}/export', { token: tok('k1'), params: { id: x.cq.id }, query: { format: 'EXCEL' } });
    expectStatusIn(res, '200');
    expect(res.headers()['content-type'] ?? '').toMatch(/spreadsheetml/);
    expect(res.headers()['content-disposition'] ?? '', 'Có mã RC trong tên').toContain(x.cq.code);
    const rows = (await readXlsx(await res.body())).rows;
    const shown = (x.cq.lines ?? []).filter((l: any) => !l.groupId).length + (x.cq.mergedGroups ?? []).length;
    expect(rows.filter((r) => (x.cq.lines ?? []).some((l: any) => r.some((c) => String(c ?? '') === l.revenueItemName))).length, 'Số dòng = số dòng hiển thị').toBe(shown);

  });
});
