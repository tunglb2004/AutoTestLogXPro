import { withOps, action, tab, input, select, pickOption, vnd, openOrder, servicePanel, labelsVisible, headersVisible, dataRow, expectAmounts, numberFromUi, openFilter, editedP0, costEditor } from '../../../src/phieu-dich-vu/data/operations-ui';
import { p0Base, p0Order, createOrder, buildP0 } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { acceptOrder, k3Order } from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import { startService, saveActuals, actualsBody, uploadActualDoc, completeService, costLines, costs } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { changeLinePrice } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { SERVICE_KEYS, SERVICES } from '../../../src/core/data/p0-price-set';
import { env } from '../../../src/core/env';
import { uiApi } from '../../../src/core/assertions';
import { esc } from '../../../src/core/pages/components/data-table.component';
/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Tháp điều phối", () => {
  test("UI-K3-003 Nút của Trưởng điều phối và điều phối viên", { tag: ["@ui", "@thap-dieu-phoi", "@p1"] }, async ({ browser, roles, http, testRun, tok }) => {
    test.info().annotations.push({type:'Tiền điều kiện theo trạng thái',description:'Kiểm nút CC ở Tạo mới và Đã tiếp nhận; kiểm nút DP ở Đã điều phối và Đang thực hiện để không đòi thao tác sai trạng thái.'});
    const submitted=await createOrder(testRun,await p0Base(testRun));const accepted=await createOrder(testRun,await p0Base(testRun));await acceptOrder(testRun,accepted.id);const coordinated=await p0Order(testRun,'KHQ_COORDINATED');const working=await p0Order(testRun,'KHQ_COSTS');
    await withOps(browser,roles,'cc',async page=>{await openOrder(page,submitted.code,submitted.id,true);for(const name of ['Tiếp nhận phiếu','Từ chối phiếu'])await expect(action(page,name)).toBeVisible();await openOrder(page,accepted.code,accepted.id,true);await expect(action(page,'Xác nhận cấu trúc chặng')).toBeVisible();await servicePanel(page,'KHQ','Chi phí');for(const name of ['Điều phối nhà thầu','Bắt đầu thực hiện','Chỉnh sửa chi phí','Hoàn thành dịch vụ'])await expect(action(page,name)).toHaveCount(0);});
    await withOps(browser,roles,'dp',async page=>{await openOrder(page,coordinated.code,coordinated.id,true);await servicePanel(page,'KHQ','Chi phí');await expect(action(page,'Điều phối nhà thầu')).toBeVisible();await expect(action(page,'Bắt đầu thực hiện')).toBeVisible();for(const name of ['Tiếp nhận phiếu','Từ chối phiếu','Xác nhận cấu trúc chặng'])await expect(action(page,name)).toHaveCount(0);await openOrder(page,working.code,working.id,true);await servicePanel(page,'KHQ','Chi phí');await expect(action(page,'Chỉnh sửa chi phí')).toBeVisible();await expect(action(page,'Hoàn thành dịch vụ')).toBeVisible();});
  });

  test("UI-K3-015 Hai điều phối viên cùng sửa chi phí", { tag: ["@ui", "@thap-dieu-phoi", "@p2"] }, async ({ browser, roles, http, testRun, tok }) => {
    test.setTimeout(600_000);
    expect(roles.dp.userId, 'Hai điều phối viên khác tài khoản').not.toBe(roles.dpKhq.userId);
    const order = await p0Order(testRun, 'KHQ_COSTS');
    const refs = await testRun.p0Refs();
    const servicePath = '/api/k3/service-orders/' + order.id + '/services/' + refs.services.KHQ;
    const waitUntil = (at: number) => new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, at - Date.now())));

    await withOps(browser, roles, 'dp', async (holder) => {
      await openOrder(holder, order.code, order.id, true);
      await servicePanel(holder, 'KHQ', 'Chi phí');
      await action(holder, 'Chỉnh sửa chi phí').click();
      await expect(action(holder, 'Lưu')).toBeVisible();
      const acquiredAt = Date.now();

      await withOps(browser, roles, 'dpKhq', async (other) => {
        await openOrder(other, order.code, order.id, true);
        await servicePanel(other, 'KHQ', 'Chi phí');

        const expectLocked = async () => {
          const response = other.waitForResponse((r) => {
            const pathname = decodeURIComponent(new URL(r.url()).pathname);
            return pathname.startsWith(servicePath + '/') && [409, 423].includes(r.status());
          });
          await action(other, 'Chỉnh sửa chi phí').click();
          expectStatusIn(await response, '409/423');
          await expect(other.getByText(/đang có.*sửa|người.*(chỉnh sửa|đang sửa)/i).first()).toBeVisible();
          await expect(action(other, 'Lưu')).toHaveCount(0);
        };

        await expectLocked();
        await waitUntil(acquiredAt + 285_000);
        await expectLocked();
        await waitUntil(acquiredAt + 300_000);
        await expect(async () => {
          if (!(await action(other, 'Lưu').isVisible())) await action(other, 'Chỉnh sửa chi phí').click();
          await expect(action(other, 'Lưu')).toBeVisible({ timeout: 3_000 });
        }).toPass({ intervals: [2_000], timeout: 30_000 });
        const editor = await costEditor(other);
        await expect(editor.locator('input').first()).toBeEditable();
        await action(editor, 'Hủy').click();
      });
    });
  });
});
