import { Browser, expect } from '@playwright/test';
import { TestRun, TEST_RUN_ID, blockCase } from '../../core/fixtures/test-run.fixture';
import { Roles } from '../../core/fixtures/auth.fixture';
import { env } from '../../core/env';
import { stable, expectMoney, expectStatusIn } from '../../core/assertions';
import { data, items } from '../../core/base.client';
import { p0Items } from '../../cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import { createSheet, ensureContractorLines, priceLine, sheetBody, sheetItems } from './bang-gia-mua.factory';
import { sbpLines, setBenchmark } from '../../gia-mua-dinh-muc/data/gia-mua-dinh-muc.factory';
import { allTransportTemplate, histories, ok, read, rejected, rows, stateCode } from './price-flow.fixture';

const six = ['customsFee', 'overtime', 'supervision', 'freight', 'transload', 'storage'] as const;
function allCommand(template: any, itemId: string, fallbackUnit: string, fallbackVehicle: string) {
  const result: Record<string, unknown> = { priceConfigurationItemId: itemId, unitCode: template.unitCode ?? fallbackUnit, unitPrice: 9_500_000, allAttributes: template.allAttributes };
  for (const [single, plural] of [['originPointCode', 'originPointCodes'], ['destinationPointCode', 'destinationPointCodes'], ['vehicleTypeCode', 'vehicleTypeCodes']] as const) if (template[single]) result[plural] = [template[single]];
  if (!result.vehicleTypeCodes && !template.allAttributes.some((v: string) => /vehicle/i.test(v))) result.vehicleTypeCodes = [fallbackVehicle];
  return result;
}

/** Cases whose preconditions require an inactive vendor or a price sheet expired by the app. No production entity is mutated to manufacture these states. */
export async function runPendingStateApi(id: string, run: TestRun) {
  const refs = await run.p0Refs();
  if (id === 'BGM-050') {
    const C = env.ref('CONTRACTOR_C_ID');
    const contractor = await read(run, 'GET /api/contractors/{id}', { id: C }, 'k1');
    expect(`${stateCode(contractor.status)} ${contractor.status?.name ?? ''}`, 'Configured NT_C must be inactive').toMatch(/INACTIVE|Ngưng|Ngừng/i);
    const sheets = await rows(run, 'GET /api/purchase-prices', {}, 'k1', { contractorId: C });
    const draft = sheets.find(s => /NEW|DRAFT/.test(stateCode(s.status)) || /Tạo mới/i.test(s.status?.name ?? ''));
    expect(draft, 'Fixture NT_C needs a draft created before the vendor became inactive').toBeTruthy();
    const before = await read(run, 'GET /api/purchase-prices/{id}', { id: draft.id }, 'k1');
    await rejected(run, 'POST /api/purchase-prices/{id}/activate', { id: draft.id }, undefined, 'k1', '400/409/422');
    expect(stable(await read(run, 'GET /api/purchase-prices/{id}', { id: draft.id }, 'k1'))).toEqual(stable(before));
    return;
  }
  const all = await rows(run, 'GET /api/purchase-prices', {}, 'k1', { status: 'EXPIRED' });
  const expired = all.find(s => /EXPIRED/.test(stateCode(s.status)) || /Hết hiệu lực/i.test(s.status?.name ?? ''));
  expect(expired, 'Fixture needs a price sheet already expired by the application (calendar/contract lifecycle)').toBeTruthy();
  const before = await read(run, 'GET /api/purchase-prices/{id}', { id: expired.id }, 'k1');
  const linesBefore = await sheetItems(run, expired.id);
  const historyBefore = await histories(run, 'GET /api/purchase-prices/{id}/history', expired.id, 'k1');
  if (id === 'BGM-052') await rejected(run, 'POST /api/purchase-prices/{id}/activate', { id: expired.id }, undefined, 'k1', '400/409/422');
  else if (id === 'BGM-085') {
    const own = await p0Items(run, `G85${TEST_RUN_ID}`, 'k1', ['customsFee']);
    await rejected(run, 'POST /api/purchase-prices/{id}/items', { id: expired.id }, priceLine(refs, own, 'customsFee', 1_000_000), 'k1', '400/409/422');
  } else throw new Error(`Unknown state case ${id}`);
  expect(stable(await read(run, 'GET /api/purchase-prices/{id}', { id: expired.id }, 'k1'))).toEqual(stable(before));
  expect(stable(await sheetItems(run, expired.id))).toEqual(stable(linesBefore));
  expect(await histories(run, 'GET /api/purchase-prices/{id}/history', expired.id, 'k1')).toHaveLength(historyBefore.length);
}

export async function runPendingAllApi(id: string, run: TestRun) {
  const refs = await run.p0Refs();
  const template = await allTransportTemplate(run);
  const own = await p0Items(run, `${id.replace(/-/g, '')}${TEST_RUN_ID}`, 'k1', id === 'BGM-077' ? [...six] : ['freight']);
  const all = allCommand(template, own.freight.id, refs.units.freight, refs.vehicleType);
  if (id === 'BGM-077') {
    const prices: Record<string, number> = { customsFee: 1_000_000, overtime: 300_000, supervision: 800_000, transload: 1_200_000, storage: 500_000 };
    const lines = six.filter(k => k !== 'freight').map(k => priceLine(refs, own, k, prices[k]));
    const sheet = await createSheet(run, env.ref('CONTRACTOR_A_ID'), 'VND', [...lines, all], `AT ALL filter ${run.id}`);
    expect(await sheetItems(run, sheet.id)).toHaveLength(6);
    const filtered = await rows(run, 'GET /api/purchase-prices/{id}/items', { id: sheet.id }, 'k1', { serviceTypeCode: refs.services.VT, originPointCode: [refs.originPoint] });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].priceConfigurationItemId).toBe(own.freight.id);
    expect(filtered[0].originPointName).toMatch(/^Tất cả$/i);
  } else if (id === 'SBP-009') {
    await ensureContractorLines(run, env.ref('CONTRACTOR_A_ID'), 'VND', [all], `AT ALL source ${run.id}`);
    await ensureContractorLines(run, env.ref('CONTRACTOR_B_ID'), 'USD', [priceLine(refs, own, 'freight', 400)], `AT concrete source ${run.id}`);
    const list = await sbpLines(run, own.freight.id);
    expect(list, 'ALL and concrete must not be merged into a single benchmark').toHaveLength(2);
    const broad = list.find(l => /^Tất cả$/i.test(String(l.originPointName)));
    const concrete = list.find(l => !/^Tất cả$/i.test(String(l.originPointName)));
    expect(broad).toBeTruthy(); expect(concrete).toBeTruthy();
    expect(concrete.originPointName).toMatch(/Hữu Nghị/i);
    expect(broad.id).not.toBe(concrete.id);
    await setBenchmark(run, broad.id, 9_000_000);
    await setBenchmark(run, concrete.id, 9_500_000);
    const after = await sbpLines(run, own.freight.id);
    expectMoney(after.find(l => l.id === broad.id).benchmarkPrice, 9_000_000);
    expectMoney(after.find(l => l.id === concrete.id).benchmarkPrice, 9_500_000);
  } else throw new Error(`Unknown ALL case ${id}`);
}

export async function runPendingLockApi(id: string, run: TestRun, browser: Browser, roles: Roles) {
  const state = roles.k1b.storageState;
  expect(state, 'K1B needs the browser session produced by auth.setup').toBeTruthy();
  const context = await browser.newContext({ storageState: state });
  await context.addCookies([{ name: 'access_token', value: run.token('k1b'), url: env.webUrl }]);
  const page = await context.newPage();
  try {
    if (id === 'CFG-039') {
      blockCase('CFG-039 cần tạo và sửa đầu mục cấu hình giá để kiểm khóa đồng thời; môi trường hiện tại chỉ cho phép đọc cấu hình');
    } else {
      const refs = await run.p0Refs();
      const own = await p0Items(run, `${id.replace(/-/g, '')}${TEST_RUN_ID}`, 'k1', ['customsFee']);
      const sheet = await createSheet(run, env.ref('CONTRACTOR_A_ID'), 'VND', [priceLine(refs, own, 'customsFee', 1_000_000)], `AT price lock ${id} ${run.id}`);
      await page.goto(`${env.webUrl}/purchase-prices/${sheet.id}`);
      await page.getByRole('button', { name: id === 'BGM-035' ? /Chỉnh sửa thông tin chung/ : /Chỉnh sửa bảng giá|Cập nhật bảng giá/ }).first().click();
      await expect(page.getByRole('button', { name: /^Lưu(?: thông tin)?$/ }).first()).toBeVisible();
      const before = await read(run, 'GET /api/purchase-prices/{id}', { id: sheet.id }, 'k1');
      const l0 = await sheetItems(run, sheet.id);
      const h0 = await histories(run, 'GET /api/purchase-prices/{id}/history', sheet.id, 'k1');
      if (id === 'BGM-035') {
        const payload = await sheetBody(run, sheet.contractorId, 'VND', [], `${sheet.name} renamed`);
        await rejected(run, 'PUT /api/purchase-prices/{id}', { id: sheet.id }, payload, 'k1', '409/423');
      } else {
        await rejected(run, 'PUT /api/purchase-prices/{id}/items', { id: sheet.id }, { updated: [{ id: l0[0].id, unitPrice: 1_100_000 }] }, 'k1', '409/423');
      }
      expect(stable(await read(run, 'GET /api/purchase-prices/{id}', { id: sheet.id }, 'k1'))).toEqual(stable(before));
      expect(stable(await sheetItems(run, sheet.id))).toEqual(stable(l0));
      expect(await histories(run, 'GET /api/purchase-prices/{id}/history', sheet.id, 'k1')).toHaveLength(h0.length);
    }
  } finally {
    const cancel = page.getByRole('button', { name: /^Hủy(?: bỏ)?$/ }).first();
    if (await cancel.isVisible().catch(() => false)) await cancel.click();
    await context.close();
  }
}
