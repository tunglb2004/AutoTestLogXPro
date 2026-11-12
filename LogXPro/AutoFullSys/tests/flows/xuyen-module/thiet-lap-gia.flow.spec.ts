/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, blockCase, TestRun, today } from '../../../src/core/fixtures/test-run.fixture';
import { items, must } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectMoney, expectPercent } from '../../../src/core/assertions';
import { P0, P0_ITEMS, P0ItemKey } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { configOf, type ConfigItem, type CreatedItems } from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { activateSheet, activeSheetOf, ensureContractorLines, exclusive, isActiveSheet, priceLine, sheetBody } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { sbpLines, setBenchmark } from '../../../src/gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { sspLines, setSelling } from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';

const SIX = ['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] satisfies P0ItemKey[];
const item = (key: P0ItemKey) => P0_ITEMS.find((value) => value.key === key)!;

async function requireDedicatedItems(run: TestRun, caseNo: string, keys: P0ItemKey[]) {
  const refs = await run.p0Refs();
  const out = {} as CreatedItems;
  const chosen = new Set<string>();
  const configs = new Map<string, Awaited<ReturnType<typeof configOf>>>();

  // Chỉ đọc cấu hình hiện có. Mỗi case tự chọn đầu mục ACTIVE, đúng dịch vụ/loại giá
  // và chưa có nguồn SBP/SSP để không tạo hay sửa bản ghi Cấu hình đầu mục giá.
  for (const key of keys) {
    const expected = item(key);
    let cfg = configs.get(expected.service);
    if (!cfg) {
      cfg = await configOf(run, expected.service, 'k1');
      configs.set(expected.service, cfg);
    }
    const candidates = (cfg.items ?? [])
      .filter((candidate: any) => (candidate.status?.code ?? candidate.status) === 'ACTIVE')
      .filter((candidate: any) => candidate.priceTypeId === refs.priceTypes[expected.priceType])
      .filter((candidate: any) => !chosen.has(candidate.id))
      .filter((candidate: any) => expected.service !== 'KB'
        || (candidate.warehouseTypes ?? []).some((type: { id: string }) => type.id === refs.warehouseTypeId))
      .sort((a: any, b: any) => String(a.code).localeCompare(String(b.code)));

    let selected: ConfigItem | undefined;
    for (const candidate of candidates) {
      if ((await sbpLines(run, candidate.id)).length || (await sspLines(run, candidate.id)).length) continue;
      selected = {
        id: candidate.id,
        code: candidate.code,
        name: candidate.name,
        configId: cfg.id,
        service: expected.service,
        priceType: expected.priceType,
      };
      break;
    }
    if (!selected) {
      blockCase(`không có đầu mục ${expected.service}/${expected.priceType} đang hoạt động và chưa có nguồn giá để tái sử dụng cho FLOW-PRICE-${caseNo}`);
    }
    chosen.add(selected.id);
    out[key] = selected;
  }
  return { it: out, suffix: `existing-${caseNo}` };
}

async function ownLines(run: TestRun, it: CreatedItems, keys: P0ItemKey[]) {
  const refs = await run.p0Refs();
  return keys.map((key) => priceLine(refs, it, key, item(key).buyA!));
}

function contractor(key: 'D' | 'E') {
  const id = env.ref(key === 'D' ? 'CONTRACTOR_D_ID' : 'CONTRACTOR_E_ID');
  expect(id, 'Nhà thầu riêng của bộ thiết lập giá phải khác P0 dùng chung').not.toBe(env.ref('CONTRACTOR_A_ID'));
  expect(id, 'Nhà thầu riêng của bộ thiết lập giá phải khác P0 dùng chung').not.toBe(env.ref('CONTRACTOR_B_ID'));
  return id;
}

async function readSheet(run: TestRun, id: string) {
  return must(await run.http.call('GET /api/purchase-prices/{id}', { token: run.token('k1'), params: { id } }), 'đọc bảng giá mua');
}

/** Các case kích hoạt/ngừng bảng riêng phải giữ lại bảng đang hoạt động của nhà thầu trước case. */
async function withTemporarySheet(
  run: TestRun,
  contractorId: string,
  payload: Awaited<ReturnType<typeof sheetBody>>,
  check: (id: string) => Promise<void>,
) {
  const previous = await activeSheetOf(run, contractorId);
  const created = await must(await run.http.call('POST /api/purchase-prices', { token: run.token('k1'), json: payload }), 'tạo bảng giá riêng');
  expect(created?.id, 'Có ID bảng giá vừa tạo').toBeTruthy();
  try {
    await check(created.id);
  } finally {
    const active = await activeSheetOf(run, contractorId);
    if (previous && (!active || active.id === created.id)) {
      await activateSheet(run, previous.id);
    } else if (active?.id === created.id) {
      await must(await run.http.call('POST /api/purchase-prices/{id}/deactivate', {
        token: run.token('k1'), params: { id: created.id },
      }), 'ngừng bảng giá riêng sau case');
    }
  }
}

async function waitForBenchmarks(run: TestRun, itemId: string) {
  await expect.poll(async () => [
    (await sbpLines(run, itemId)).length, (await sspLines(run, itemId)).length,
  ], { timeout: 30_000, message: 'Đầu mục có đúng một SBP và SSP' }).toEqual([1, 1]);
}

test.describe("Thiết lập giá: Đầu mục → Giá mua đầu vào → Giá mua định mức → Giá bán định mức", () => {
  test.skip(true, 'Bỏ qua toàn bộ luồng thiết lập giá theo yêu cầu: không tạo thêm hoặc thay đổi dữ liệu đầu mục/bảng giá.');
  // Từng case dựng dữ liệu riêng. Giữ chạy tuần tự trong file để giảm tải thao tác ghi bảng giá.
  test.describe.configure({ mode: 'default' });

  test("FLOW-PRICE-001 Tạo đầu mục test cho 5 dịch vụ", { tag: ["@flow", "@xuyen-module", "@p1"] }, () => {
    test.skip(true, 'Cấu hình đầu mục giá nằm ngoài phạm vi kiểm thử.');
  });

  test("FLOW-PRICE-002 Bảng giá NT_A Tạo mới chưa sinh định mức, kích hoạt mới sinh", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const { it, suffix } = await requireDedicatedItems(testRun, '002', SIX);
    const refs = await testRun.p0Refs();
    const A = contractor('D');
    const payload = await sheetBody(testRun, A, 'VND', await ownLines(testRun, it, SIX), `AT Bảng giá NT_D ${suffix}`);
    const { items: _lines, ...header } = payload;
    // Ngày hiệu lực tương lai giúp quan sát đúng trạng thái Tạo mới trước khi kích hoạt.
    const futureDate = today(1);
    expect(futureDate <= payload.effectiveTo, 'Hợp đồng NT_D còn hiệu lực đến ngày mai').toBe(true);
    await exclusive('nt-d', () => withTemporarySheet(testRun, A, { ...payload, effectiveFrom: futureDate }, async (id) => {
      const draft = await readSheet(testRun, id);
      expect(draft.status?.code ?? draft.status, 'Bảng đang Tạo mới').toMatch(/^(NEW|DRAFT)$/);
      expect(await sbpLines(testRun, it.customsFee.id), 'Bảng Tạo mới chưa sinh SBP').toHaveLength(0);
      expect(await sspLines(testRun, it.customsFee.id), 'Bảng Tạo mới chưa sinh SSP').toHaveLength(0);
      expectStatusIn(await http.call('PUT /api/purchase-prices/{id}', {
        token: tok('k1'), params: { id }, json: { ...header, effectiveFrom: today() },
      }), '200/204', 'Đưa ngày hiệu lực về ngày đủ điều kiện kích hoạt');
      const ready = await readSheet(testRun, id);
      expect(ready.status?.code ?? ready.status, 'Bảng còn Tạo mới trước thao tác kích hoạt').toMatch(/^(NEW|DRAFT)$/);
      expect(await sbpLines(testRun, it.customsFee.id), 'Chưa sinh SBP trước thao tác kích hoạt').toHaveLength(0);
      expectStatusIn(await http.call('GET /api/purchase-prices/{id}/activation-check', { token: tok('k1'), params: { id } }), '200');
      await activateSheet(testRun, id);
      expect(isActiveSheet(await readSheet(testRun, id)), 'Bảng đã kích hoạt').toBe(true);
      expectStatusIn(await http.call('GET /api/standard-buying-prices/groups', { token: tok('cc'), query: { serviceTypeCode: refs.services.KHQ } }), '200');
      for (const key of SIX) {
        await waitForBenchmarks(testRun, it[key].id);
        const [buying] = await sbpLines(testRun, it[key].id);
        const [selling] = await sspLines(testRun, it[key].id);
        expect(buying.benchmarkMissing, `${item(key).name}: chưa có giá mua định mức`).toBe(true);
        expect(selling.sellingPriceSet, `${item(key).name}: chưa có giá bán định mức`).toBe(false);
      }
    }));
  });

  test("FLOW-PRICE-003 Hai nhà thầu cùng tổ hợp Vận tải gom 1 SBP, so sánh quy đổi", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const { it, suffix } = await requireDedicatedItems(testRun, '003', ['freight']);
    const refs = await testRun.p0Refs();
    const A = contractor('D');
    const B = contractor('E');
    expect(A, 'Hai nguồn giá phải là hai nhà thầu khác nhau').not.toBe(B);
    await exclusive('nt-d', () => exclusive('nt-e', async () => {
      await ensureContractorLines(testRun, A, 'VND', await ownLines(testRun, it, ['freight']), `AT Bảng giá NT_D ${suffix}`);
      const payload = await sheetBody(testRun, B, 'USD', [priceLine(refs, it, 'freight', 400)], `AT Bảng giá NT_E ${suffix}`);
      await withTemporarySheet(testRun, B, payload, async (id) => {
        if (!isActiveSheet(await readSheet(testRun, id))) await activateSheet(testRun, id);
        expect(isActiveSheet(await readSheet(testRun, id)), 'Nguồn giá USD đang hoạt động').toBe(true);
        await waitForBenchmarks(testRun, it.freight.id);
        const [sbp] = await sbpLines(testRun, it.freight.id);
        await setBenchmark(testRun, sbp.id, 9_500_000);
        expectStatusIn(await http.call('PUT /api/standard-buying-prices/{id}/conversion', { token: tok('cc'), params: { id: sbp.id }, json: { source: 'MANUAL', rates: [{ currency: 'USD', rate: P0.fxUsd }] } }), '200/201/204');
        const readSources = async () => (await must(await http.call('GET /api/standard-buying-prices/{id}/contractors', {
          token: tok('cc'), params: { id: sbp.id },
        }), 'đọc nguồn giá Vận tải')).contractors ?? [];
        await expect.poll(async () => (await readSources()).map((c: any) => c.contractorId).sort(), {
          timeout: 30_000, message: 'Hai nhà thầu cùng tổ hợp được gom vào một SBP',
        }).toEqual([A, B].sort());
        const list = await readSources();
        const a = list.find((c: any) => c.contractorId === A);
        const b = list.find((c: any) => c.contractorId === B);
        expectMoney(a.converted, 9_500_000, 'NT_D quy đổi');
        expectMoney(b.converted, 10_000_000, 'NT_E 400 USD × 25.000');
        expectMoney(a.againstBenchmark, 0, 'NT_D so với định mức');
        expectMoney(b.againstBenchmark, 500_000, 'NT_E so với định mức');
      });
    }));
  });

  test("FLOW-PRICE-004 Giá bán chỉ nhập được sau giá mua", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const { it, suffix } = await requireDedicatedItems(testRun, '004', ['customsFee']);
    const A = contractor('D');
    await exclusive('nt-d', async () => {
      await ensureContractorLines(testRun, A, 'VND', await ownLines(testRun, it, ['customsFee']), `AT Bảng giá NT_D ${suffix}`);
      await waitForBenchmarks(testRun, it.customsFee.id);
      const [sbp] = await sbpLines(testRun, it.customsFee.id);
      const [ssp] = await sspLines(testRun, it.customsFee.id);
      expect(sbp.benchmarkMissing, 'Tiền điều kiện: SBP Phí khai báo chưa có giá').toBe(true);
      expect(ssp.sellingPriceSet, 'Tiền điều kiện: SSP Phí khai báo chưa có giá').toBe(false);
      const r3 = await http.call('PUT /api/standard-selling-prices/{id}/selling-price', { token: tok('cc'), params: { id: ssp.id }, json: { sellingPrice: 1_200_000 } });
      expectStatusIn(r3, '400/409/422');
      expect((await expectApiError(r3)).message).toMatch(/chưa (?:có|nhập) giá mua định mức|nhập giá mua định mức trước/i);
      expect((await sspLines(testRun, it.customsFee.id))[0].sellingPriceSet).toBe(false);
      await setBenchmark(testRun, sbp.id, 1_000_000);
      await setSelling(testRun, ssp.id, 1_200_000);
      const after = await must(await http.call('GET /api/standard-selling-prices/{id}', {
        token: tok('cc'), params: { id: ssp.id },
      }), 'đọc giá bán định mức');
      expectMoney(after.sellingPrice, 1_200_000, 'Giá bán định mức');
      expectPercent(after.profitPercent, 20, 2, 'Lợi nhuận');
    });
  });

  test("FLOW-PRICE-005 Nhập hàng loạt đủ bộ giá P0", { tag: ["@flow", "@xuyen-module", "@p1"] }, async ({ http, testRun, tok }) => {
    const { it, suffix } = await requireDedicatedItems(testRun, '005', SIX);
    const A = contractor('D');
    const history = async (kind: 'buying' | 'selling', id: string) => items(await must(await http.call(
      `GET /api/standard-${kind}-prices/{id}/history`,
      { token: tok('cc'), params: { id }, query: { page: 1, perPage: 100 } },
    ), 'đọc lịch sử định mức')).length;
    await exclusive('nt-d', async () => {
      await ensureContractorLines(testRun, A, 'VND', await ownLines(testRun, it, SIX), `AT Bảng giá NT_D ${suffix}`);
      const rows: { key: (typeof SIX)[number]; sbpId: string; sspId: string; buyHistory: number; sellHistory: number }[] = [];
      for (const key of SIX) {
        await waitForBenchmarks(testRun, it[key].id);
        const [buy] = await sbpLines(testRun, it[key].id);
        const [sell] = await sspLines(testRun, it[key].id);
        expect(buy.benchmarkMissing, `${item(key).name}: chưa có giá mua định mức`).toBe(true);
        expect(sell.sellingPriceSet, `${item(key).name}: chưa có giá bán định mức`).toBe(false);
        rows.push({ key, sbpId: buy.id, sspId: sell.id, buyHistory: await history('buying', buy.id), sellHistory: await history('selling', sell.id) });
      }
      // Swagger dùng items[].sellingPrice cho cả payload giá mua định mức hàng loạt.
      expectStatusIn(await http.call('PUT /api/standard-buying-prices/benchmarks', { token: tok('cc'), json: { items: rows.map(({ key, sbpId }) => ({ id: sbpId, sellingPrice: item(key).sbp })) } }), '200/201/204');
      expectStatusIn(await http.call('PUT /api/standard-selling-prices/selling-prices', { token: tok('cc'), json: { items: rows.map(({ key, sspId }) => ({ id: sspId, sellingPrice: item(key).ssp })) } }), '200/201/204');
      const profit = { customsFee: 20, overtime: 33.33, supervision: 25, freight: 15.79, transload: 25, storage: 20 };
      for (const { key, sbpId, sspId, buyHistory, sellHistory } of rows) {
        const [buy] = await sbpLines(testRun, it[key].id);
        const [sell] = await sspLines(testRun, it[key].id);
        const expected = item(key);
        expectMoney(buy.benchmarkPrice, expected.sbp!, `${expected.name} giá mua`);
        expectMoney(sell.sellingPrice, expected.ssp!, `${expected.name} giá bán`);
        expectPercent(sell.profitPercent, profit[key], 2, `${expected.name} lợi nhuận`);
        expect(await history('buying', sbpId), `${expected.name}: SBP thêm 1 bản ghi lịch sử`).toBe(buyHistory + 1);
        expect(await history('selling', sspId), `${expected.name}: SSP thêm 1 bản ghi lịch sử`).toBe(sellHistory + 1);
      }
    });
  });

  test("FLOW-PRICE-006 Ngừng bảng giá làm mất SBP/SSP chỉ có 1 nguồn", { tag: ["@flow", "@xuyen-module", "@p2"] }, async ({ http, testRun, tok }) => {
    const { it, suffix } = await requireDedicatedItems(testRun, '006', ['freight', 'storage']);
    const refs = await testRun.p0Refs();
    const A = contractor('D');
    const B = contractor('E');
    expect(A, 'Hai nguồn giá phải là hai nhà thầu khác nhau').not.toBe(B);
    const sources = async (itemId: string) => {
      const [sbp] = await sbpLines(testRun, itemId);
      if (!sbp) return [];
      const detail = await must(await http.call('GET /api/standard-buying-prices/{id}/contractors', {
        token: tok('cc'), params: { id: sbp.id },
      }), 'đọc nhà thầu của giá mua định mức');
      return (detail.contractors ?? []).map((row: any) => row.contractorId).sort();
    };
    await exclusive('nt-d', () => exclusive('nt-e', async () => {
      await ensureContractorLines(testRun, B, 'USD', [priceLine(refs, it, 'freight', 400)], `AT Bảng giá NT_E ${suffix}`);
      const payload = await sheetBody(testRun, A, 'VND', await ownLines(testRun, it, ['freight', 'storage']), `AT Bảng giá NT_D ${suffix}`);
      await withTemporarySheet(testRun, A, payload, async (id) => {
        if (!isActiveSheet(await readSheet(testRun, id))) await activateSheet(testRun, id);
        expect(isActiveSheet(await readSheet(testRun, id)), 'Bảng cần ngừng đã hoạt động').toBe(true);
        await waitForBenchmarks(testRun, it.storage.id);
        await waitForBenchmarks(testRun, it.freight.id);
        await expect.poll(() => sources(it.storage.id), { timeout: 30_000 }).toEqual([A]);
        await expect.poll(() => sources(it.freight.id), { timeout: 30_000 }).toEqual([A, B].sort());
        const [buy] = await sbpLines(testRun, it.storage.id);
        const [sell] = await sspLines(testRun, it.storage.id);
        await setBenchmark(testRun, buy.id, item('storage').sbp!);
        await setSelling(testRun, sell.id, item('storage').ssp!);
        expectMoney((await sbpLines(testRun, it.storage.id))[0].benchmarkPrice, item('storage').sbp!, 'Giá mua Kho bãi trước khi ngừng');
        expectMoney((await sspLines(testRun, it.storage.id))[0].sellingPrice, item('storage').ssp!, 'Giá bán Kho bãi trước khi ngừng');
        expectStatusIn(await http.call('POST /api/purchase-prices/{id}/deactivate', {
          token: tok('k1'), params: { id },
        }), '200/204');
        await expect.poll(async () => [
          (await sbpLines(testRun, it.storage.id)).length, (await sspLines(testRun, it.storage.id)).length,
        ], { timeout: 30_000, message: 'Kho bãi chỉ có một nguồn nên mất cả SBP lẫn SSP' }).toEqual([0, 0]);
        expect(await sbpLines(testRun, it.freight.id), 'Vận tải vẫn còn một SBP').toHaveLength(1);
        await expect.poll(() => sources(it.freight.id), { timeout: 30_000 }).toEqual([B]);
        await activateSheet(testRun, id);
        await waitForBenchmarks(testRun, it.storage.id);
        expect((await sbpLines(testRun, it.storage.id))[0].benchmarkMissing, 'SBP mới cần nhập lại giá').toBe(true);
        expect((await sspLines(testRun, it.storage.id))[0].sellingPriceSet, 'SSP mới cần nhập lại giá').toBe(false);
      });
    }));
  });
});
