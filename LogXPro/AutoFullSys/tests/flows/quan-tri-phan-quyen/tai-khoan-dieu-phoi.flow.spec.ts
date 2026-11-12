/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';

import { env } from '../../../src/core/env';
import { credentials } from '../../../src/core/data/accounts';
import * as PF from '../../../src/gia-mua-dau-vao/data/price-flow.fixture';
import * as ORD from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import * as K3 from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import * as CCF from '../../../src/thap-dieu-phoi/data/phieu-cc.factory';
import * as BGK from '../../../src/quan-ly-bao-gia/data/bgkh.factory';
import * as PNLF from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import * as GM from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import * as YC from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
import * as GB from '../../../src/gia-ban-dinh-muc/data/gia-ban-dinh-muc.factory';
import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';
import * as LEGS from '../../../src/cau-hinh-chang/data/leg-sandbox';
import * as CFGF from '../../../src/cau-hinh-dau-muc-gia/data/dau-muc-gia.factory';
import * as NB from '../../../src/quan-ly-bao-gia/data/bgnb.factory';
void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

test.describe("Chuẩn bị tài khoản điều phối theo dịch vụ và kiểm tra phân quyền tức thì", () => {
  test.describe.configure({ mode: 'serial' });

  test("FLOW-ADM-001 Tạo 5 vai trò điều phối theo dịch vụ và 5 tài khoản tương ứng", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ testRun }) => {

    test.setTimeout(600_000);
    const cat = await ADM.catalogue(testRun);
    const view = ADM.permissionCodes(cat.filter((p: any) => /phiếu dịch vụ/i.test(p.groupName ?? '') && /xem danh sách|xem chi tiết/i.test(p.name ?? '') && !/K5/i.test(p.name ?? '')));
    const GROUP: Record<string, RegExp> = { KHQ: /dịch vụ khai báo hải quan/i, HQGS: /dịch vụ hải quan giám sát|dịch vụ giám sát/i, VT: /dịch vụ vận tải/i, ST: /dịch vụ sang tải/i, KB: /dịch vụ kho/i };
    const permsOf = (k: string) => ADM.permissionCodes(cat.filter((p: any) => GROUP[k].test(p.groupName ?? '')));
    const dpUser = async (k: string) => {
      const role = await ADM.newRole(testRun, [...permsOf(k), ...view], { name: ADM.uniqueName(`Điều phối ${k} AT`) });
      const u = await ADM.newUser(testRun, { roleIds: [role.id] });
      return { role, u, t: await ADM.loginUser(testRun, u) };
    };

    const made: any[] = [];
    for (const k of ['KHQ', 'HQGS', 'VT', 'ST', 'KB']) {
      expect(permsOf(k).length, `Rổ quyền có nhóm Dịch vụ ${k}`).toBeGreaterThan(0);
      made.push({ k, ...(await dpUser(k)) });
    }
    for (const m of made) {
      const mine = await ADM.myPermissions(testRun, m.t.accessToken);
      expect(mine, `${m.k}: chỉ quyền đúng 1 dịch vụ`).toEqual([...new Set([...permsOf(m.k), ...view])].sort());
      for (const other of ['KHQ', 'HQGS', 'VT', 'ST', 'KB'].filter((x) => x !== m.k)) expect(mine.some((p: string) => permsOf(other).includes(p) && !permsOf(m.k).includes(p)), `${m.k} không có quyền ${other}`).toBe(false);
    }
    let created = 0;
    for (const m of made) { created += (await ADM.audit(testRun, m.role.id)).length > 0 ? 1 : 0; created += (await ADM.audit(testRun, m.u.id)).length > 0 ? 1 : 0; }
    expect(created, 'Audit log có 10 bản ghi tạo').toBe(10);

  });

  test("FLOW-ADM-002 Điều phối viên chỉ thao tác dịch vụ của mình", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun }) => {

    test.setTimeout(600_000);
    const cat = await ADM.catalogue(testRun);
    const view = ADM.permissionCodes(cat.filter((p: any) => /phiếu dịch vụ/i.test(p.groupName ?? '') && /xem danh sách|xem chi tiết/i.test(p.name ?? '') && !/K5/i.test(p.name ?? '')));
    const GROUP: Record<string, RegExp> = { KHQ: /dịch vụ khai báo hải quan/i, HQGS: /dịch vụ hải quan giám sát|dịch vụ giám sát/i, VT: /dịch vụ vận tải/i, ST: /dịch vụ sang tải/i, KB: /dịch vụ kho/i };
    const permsOf = (k: string) => ADM.permissionCodes(cat.filter((p: any) => GROUP[k].test(p.groupName ?? '')));
    const dpUser = async (k: string) => {
      const role = await ADM.newRole(testRun, [...permsOf(k), ...view], { name: ADM.uniqueName(`Điều phối ${k} AT`) });
      const u = await ADM.newUser(testRun, { roleIds: [role.id] });
      return { role, u, t: await ADM.loginReadyUser(testRun, u) };
    };

    const refs = await testRun.p0Refs();
    const o = await ORD.p0Order(testRun, 'ACCEPTED');
    const { t } = await dpUser('VT');
    const listed = items(await must(await http.call('GET /api/k3/service-orders', {
      token: t.accessToken, query: { search: o.code, page: 1, perPage: 100 },
    }), 'DP_VT xem danh sách phiếu'));
    expect(listed.some((row: any) => (row.id ?? row.serviceOrderId) === o.id), 'DP_VT thấy đúng P0 trong danh sách').toBe(true);
    const coord = (type: string, item: any, contractorId: string, extra: Record<string, unknown> = {}) => http.call('PUT /api/k3/service-orders/{id}/services/{type}/coordination', { token: t.accessToken, params: { id: o.id, type }, json: { assignments: [{ priceConfigurationItemId: item.id, contractorId, unitCode: (refs.units as any)[item.key ?? 'freight'], ...extra }], fxRates: { USD: P0.fxUsd } } });
    expectStatusIn(await coord(refs.services.VT, o.base.items.freight, env.ref('CONTRACTOR_B_ID'), { unitCode: refs.units.freight, routeIndex: 0 }), '200/204', 'điều phối được VT');
    const before = stable(await K3.costs(testRun, o.svc.KHQ));
    expectStatusIn(await coord(refs.services.KHQ, o.base.items.customsFee, env.ref('CONTRACTOR_A_ID'), { unitCode: refs.units.customsFee }), '403', 'KHQ bị chặn');
    expect(stable(await K3.costs(testRun, o.svc.KHQ)), 'Dữ liệu KHQ không đổi').toEqual(before);

  });

  test("FLOW-ADM-003 Vô hiệu vai trò làm mất quyền ngay, kích hoạt lại có quyền lại", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {

    test.setTimeout(900_000);
    const cat = await ADM.catalogue(testRun);
    const view = ADM.permissionCodes(cat.filter((p: any) => /phiếu dịch vụ/i.test(p.groupName ?? '') && /xem danh sách|xem chi tiết/i.test(p.name ?? '') && !/K5/i.test(p.name ?? '')));
    const GROUP: Record<string, RegExp> = { KHQ: /dịch vụ khai báo hải quan/i, HQGS: /dịch vụ hải quan giám sát|dịch vụ giám sát/i, VT: /dịch vụ vận tải/i, ST: /dịch vụ sang tải/i, KB: /dịch vụ kho/i };
    const permsOf = (k: string) => ADM.permissionCodes(cat.filter((p: any) => GROUP[k].test(p.groupName ?? '')));
    const dpUser = async (k: string) => {
      const role = await ADM.newRole(testRun, [...permsOf(k), ...view], { name: ADM.uniqueName(`Điều phối ${k} AT`) });
      const u = await ADM.newUser(testRun, { roleIds: [role.id] });
      return { role, u, t: await ADM.loginReadyUser(testRun, u) };
    };

    const refs = await testRun.p0Refs();
    const { role, t } = await dpUser('VT');
    const o = await ORD.p0Order(testRun, 'KHQ_DONE');
    await K3.coordinate(testRun, o.svc.VT, [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: env.ref('CONTRACTOR_B_ID'), unitCode: refs.units.freight, routeIndex: 0 }], { USD: P0.fxUsd });
    const START = () => http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: t.accessToken, params: { id: o.id, type: refs.services.VT } });

    const startPermission = cat.find((p: any) => /dịch vụ vận tải/i.test(p.groupName ?? '') && /bắt đầu thực hiện/i.test(p.name ?? ''))?.code;
    expect(startPermission, 'Có quyền bắt đầu thực hiện VT trong rổ quyền').toBeTruthy();
    expect(await ADM.myPermissions(testRun, t.accessToken)).toContain(startPermission);
    await must(await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/deactivate', { params: { id: role.id } }), 'vô hiệu vai trò');
    expect(await ADM.myPermissions(testRun, t.accessToken)).not.toContain(startPermission);
    expectStatusIn(await START(), '403', 'mất quyền ngay, không cần đăng nhập lại');
    await must(await ADM.adminRequest(testRun, 'POST /api/admin/roles/{id}/activate', { params: { id: role.id } }), 'kích hoạt lại');
    expect(await ADM.myPermissions(testRun, t.accessToken)).toContain(startPermission);
    expectStatusIn(await START(), '200/204', 'lần bắt đầu thứ 2 thành công');

  });

  test("FLOW-ADM-004 Gỡ quyền Hoàn thành khỏi vai trò đang có người dùng", { tag: ["@flow", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {

    test.setTimeout(900_000);
    const cat = await ADM.catalogue(testRun);
    const view = ADM.permissionCodes(cat.filter((p: any) => /phiếu dịch vụ/i.test(p.groupName ?? '') && /xem danh sách|xem chi tiết/i.test(p.name ?? '') && !/K5/i.test(p.name ?? '')));
    const GROUP: Record<string, RegExp> = { KHQ: /dịch vụ khai báo hải quan/i, HQGS: /dịch vụ hải quan giám sát|dịch vụ giám sát/i, VT: /dịch vụ vận tải/i, ST: /dịch vụ sang tải/i, KB: /dịch vụ kho/i };
    const permsOf = (k: string) => ADM.permissionCodes(cat.filter((p: any) => GROUP[k].test(p.groupName ?? '')));
    const dpUser = async (k: string) => {
      const role = await ADM.newRole(testRun, [...permsOf(k), ...view], { name: ADM.uniqueName(`Điều phối ${k} AT`) });
      const u = await ADM.newUser(testRun, { roleIds: [role.id] });
      return { role, u, t: await ADM.loginUser(testRun, u) };
    };

    const refs = await testRun.p0Refs();
    const { role, t } = await dpUser('VT');
    const o = await ORD.p0Order(testRun, 'KHQ_DONE');
    await K3.coordinate(testRun, o.svc.VT, [{ priceConfigurationItemId: o.base.items.freight.id, contractorId: env.ref('CONTRACTOR_B_ID'), unitCode: refs.units.freight, routeIndex: 0 }], { USD: P0.fxUsd });
    const START = () => http.call('POST /api/k3/service-orders/{id}/services/{type}/start', { token: t.accessToken, params: { id: o.id, type: refs.services.VT } });

    await must(await START(), 'DP_VT bắt đầu VT');
    const done = (await ADM.catalogue(testRun)).find((p: any) => /dịch vụ vận tải/i.test(p.groupName ?? '') && /hoàn thành dịch vụ/i.test(p.name ?? ''))?.code;
    const r0 = await ADM.role(testRun, role.id);
    await must(await ADM.adminRequest(testRun, 'PUT /api/admin/roles/{id}', { params: { id: role.id }, json: { name: r0.name, description: r0.description ?? '', permissions: r0.permissions.filter((p: string) => p !== done) } }), 'bỏ quyền Hoàn thành');
    await K3.saveActuals(testRun, o.svc.VT, K3.actualsBody(refs, 'VT'));
    await K3.uploadActualDoc(testRun, o.svc.VT);
    const COMPLETE = () => http.call('POST /api/k3/service-orders/{id}/services/{type}/complete', { token: t.accessToken, params: { id: o.id, type: refs.services.VT } });
    expectStatusIn(await COMPLETE(), '403', 'Lần 1 bị chặn');
    expect((await ORD.getOrder(testRun, o.id)).services.find((s: any) => s.serviceTypeCode === refs.services.VT).status, 'Giữ Đang thực hiện').toBe('IN_PROGRESS');
    await must(await ADM.adminRequest(testRun, 'PUT /api/admin/roles/{id}', { params: { id: role.id }, json: { name: r0.name, description: r0.description ?? '', permissions: r0.permissions } }), 'thêm lại quyền');
    expectStatusIn(await COMPLETE(), '200/204', 'Sau khi thêm lại quyền thì hoàn thành được');

  });

  test("FLOW-ADM-005 Chặn khóa người còn việc dở, khóa được sau khi bàn giao", { tag: ["@flow", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {

    test.setTimeout(900_000);
    test.info().annotations.push({ type: 'Lưu ý chạy', description: 'Khóa tạm K1B và chuyển KH_B; nên chạy riêng (workers=1) để không làm rớt phiên K1B của case khác' });
    const k1b = await data(await http.call('GET /api/auth/me', { token: tok('k1b') }));
    const k1 = await data(await http.call('GET /api/auth/me', { token: tok('k1') }));
    const KHB = env.ref('CUSTOMER_B_ID');
    const draft = await YC.createRfq(testRun, { role: 'k1b', body: await YC.rfqBody(testRun, { customerId: KHB }) });
    const LOCK = () => ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/lock', { params: { id: k1b.userId } });
    const UNLOCK = () => ADM.adminRequest(testRun, 'POST /api/admin/users/{id}/unlock', { params: { id: k1b.userId } });
    let moved = false;
    try {
      const first = await LOCK();
      if (first.ok()) await UNLOCK();
      expectStatusIn(first, '400/409/422', 'Lần đầu báo việc dở');
      await must(await http.call('DELETE /api/quotation-requests/{id}', { token: tok('k1b'), params: { id: draft.id } }), 'bàn giao: xóa YCBG nháp');
      await must(await http.call('POST /api/customers/{id}/transfer-account-manager', { token: tok('admin'), params: { id: KHB }, json: { newAccountManagerId: k1.userId, reason: 'Bàn giao kiểm thử khóa tài khoản' } }), 'bàn giao KH_B');
      moved = true;
      const second = await LOCK();
      expectStatusIn(second, '200/204', 'Sau bàn giao khóa được');
      expectStatusIn(await http.call('GET /api/auth/me', { token: tok('k1b') }), '401', 'Phiên kết thúc');
      expectStatusIn(await UNLOCK(), '200/204', 'mở khóa');
      const login = await http.call('POST /api/auth/login', { json: { tenantCode: env.tenantCode, email: credentials('k1b')?.email ?? '', password: credentials('k1b')?.password ?? '' } });
      expect(login.status(), 'Mở khóa đăng nhập lại được').toBe(200);
    } finally {
      await UNLOCK();
      if (moved) await http.call('POST /api/customers/{id}/transfer-account-manager', { token: tok('admin'), params: { id: KHB }, json: { newAccountManagerId: k1b.userId, reason: 'Trả KH_B cho K1B sau kiểm thử' } });
    }

  });

  test("FLOW-ADM-006 Kiêm nhiệm cặp quyền nhạy cảm với chế độ Chặn", { tag: ["@flow", "@quan-tri-phan-quyen", "@p2"] }, async ({ testRun, roles }) => {

    test.setTimeout(600_000);
    const cat = await ADM.catalogue(testRun);
    const coordP = cat.find((p: any) => /điều phối nhà thầu/i.test(p.name ?? ''))?.code as string;
    const k5P = cat.find((p: any) => /xác nhận doanh thu/i.test(p.name ?? ''))?.code as string;
    const dpRole = await ADM.newRole(testRun, [coordP]);
    const k5Role = await ADM.newRole(testRun, [k5P]);
    const u = await ADM.newUser(testRun, { roleIds: [dpRole.id] });
    const ASSIGN = (ack?: string[]) => ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/roles', { params: { userId: u.id }, json: { roleId: k5Role.id, ...(ack ? { acknowledged: ack } : {}) } });
    await GM.exclusive('sod-mode', async () => {
      const original = (await ADM.adminData(testRun, 'GET /api/admin/settings')).sodMode;
      try {
        await ADM.adminData(testRun, 'PUT /api/admin/settings', { json: { sodMode: 'BLOCK' } });
        expectStatusIn(await ASSIGN([coordP, k5P]), '400/409/422', 'Chặn khi BLOCK');
        await ADM.adminData(testRun, 'PUT /api/admin/settings', { json: { sodMode: 'WARN' } });
        expectStatusIn(await ASSIGN(), '400/409/422', 'WARN cần xác nhận');
        expectStatusIn(await ASSIGN([coordP, k5P]), '200/204', 'WARN + xác nhận');
        expect((await ADM.audit(testRun, u.id)).filter((e: any) => JSON.stringify(e).includes(k5Role.id)).length, 'Audit ghi cả 2 lần').toBeGreaterThanOrEqual(2);
      } finally {
        await ADM.adminRequest(testRun, 'PUT /api/admin/settings', { json: { sodMode: original } });
      }
    });

  });

  test("FLOW-ADM-007 Bộ phận chỉ gom nhóm, xóa khi hết vai trò", { tag: ["@flow", "@quan-tri-phan-quyen", "@p3"] }, async ({ testRun, roles }) => {

    test.setTimeout(600_000);
    const cat = await ADM.catalogue(testRun);
    const view = ADM.permissionCodes(cat.filter((p: any) => /phiếu dịch vụ/i.test(p.groupName ?? '') && /xem danh sách|xem chi tiết/i.test(p.name ?? '') && !/K5/i.test(p.name ?? '')));
    const GROUP: Record<string, RegExp> = { KHQ: /dịch vụ khai báo hải quan/i, HQGS: /dịch vụ hải quan giám sát|dịch vụ giám sát/i, VT: /dịch vụ vận tải/i, ST: /dịch vụ sang tải/i, KB: /dịch vụ kho/i };
    const permsOf = (k: string) => ADM.permissionCodes(cat.filter((p: any) => GROUP[k].test(p.groupName ?? '')));
    const dpUser = async (k: string) => {
      const role = await ADM.newRole(testRun, [...permsOf(k), ...view], { name: ADM.uniqueName(`Điều phối ${k} AT`) });
      const u = await ADM.newUser(testRun, { roleIds: [role.id] });
      return { role, u, t: await ADM.loginUser(testRun, u) };
    };

    const d = await ADM.newDepartment(testRun, { name: ADM.uniqueName('Điều phối AT') });
    const { role: r1, u, t } = await dpUser('VT');
    const { role: r2 } = await dpUser('ST');
    for (const r of [r1, r2]) await ADM.adminData(testRun, 'POST /api/admin/departments/{id}/roles', { params: { id: d.id }, json: { roleIds: [r.id] } });
    await ADM.bindDepartment(testRun, u.id, d.id);
    const before = await ADM.myPermissions(testRun, t.accessToken);
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}', { params: { id: d.id } }), '400/409/422', 'Xóa bị chặn khi còn vai trò');
    for (const r of [r1, r2]) await ADM.adminData(testRun, 'DELETE /api/admin/departments/{id}/roles/{roleId}', { params: { id: d.id, roleId: r.id } });
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}', { params: { id: d.id } }), '200/204', 'Xóa được sau khi gỡ');
    expect(await ADM.myPermissions(testRun, t.accessToken), 'Quyền DP_VT không đổi').toEqual(before);

  });

  test("FLOW-ADM-008 Tạo tài khoản K4, K5_ONLY, VIEW_GIA, NO_ROLE và xác minh quyền qua me", { tag: ["@flow", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, roles }) => {

    test.setTimeout(600_000);
    const allRoles = await ADM.allAdmin(testRun, 'GET /api/admin/roles');
    const catalogue = await ADM.catalogue(testRun);
    const priceGroup = /cấu hình đầu mục giá|giá mua đầu vào|giá mua định mức|giá bán định mức/i;
    const canView = (p: any) => /^xem/i.test(p.name ?? '');
    const resolve = async (pattern: RegExp, label: string, matches: (p: any) => boolean) => {
      const existing = allRoles.find((role: any) => pattern.test(role.name ?? ''));
      if (existing) return existing;
      const permissions = ADM.permissionCodes(catalogue.filter(matches));
      expect(permissions.length, 'Có quyền trong rổ quyền để tạo vai trò ' + label).toBeGreaterThan(0);
      return ADM.newRole(testRun, permissions, { name: ADM.uniqueName(label) });
    };
    const roles4: [string, any][] = [
      ['K4', await resolve(/quản lý nhà thầu.*giá/i, 'Quản lý nhà thầu & giá', (p) =>
        /nhà thầu|giá mua đầu vào/i.test(p.groupName ?? '') || (priceGroup.test(p.groupName ?? '') && canView(p)))],
      ['K5_ONLY', await resolve(/xác nhận doanh thu/i, 'Xác nhận doanh thu K5', (p) =>
        /xác nhận doanh thu/i.test(p.groupName ?? '') || /xác nhận doanh thu/i.test(p.name ?? '') || (/phiếu dịch vụ/i.test(p.groupName ?? '') && /k5/i.test(p.name ?? '') && canView(p)))],
      ['VIEW_GIA', await resolve(/chỉ xem giá/i, 'Chỉ xem giá', (p) => priceGroup.test(p.groupName ?? '') && canView(p))],
      ['NO_ROLE', null],
    ];
    for (const [label, role] of roles4) {
      const user = await ADM.newUser(testRun, { roleIds: role ? [role.id] : [] });
      const session = await ADM.loginUser(testRun, user);
      expect(session.passwordChangeRequired, label + ': phải đổi mật khẩu lần đầu').toBe(true);
      const denied = await http.call('GET /api/service-orders', { token: session.accessToken, retryUnauthorized: false });
      expectStatusIn(denied, '401/403', label + ': chặn thao tác trước khi đổi mật khẩu');
      const password = 'Lx9' + uuid().replace(/-/g, '').slice(0, 16) + 'Q7';
      expectStatusIn(await http.call('POST /api/auth/password', {
        token: session.accessToken, retryUnauthorized: false,
        json: { currentPassword: user.password, newPassword: password, confirmPassword: password },
      }), '200/201/204');
      const active = await ADM.loginUser(testRun, { ...user, password });
      expect(active.passwordChangeRequired).toBe(false);
      const mine = await ADM.myPermissions(testRun, active.accessToken);
      const expected = role ? [...new Set<string>((await ADM.role(testRun, role.id)).permissions)].sort() : [];
      expect(mine, label + ': đúng quyền vai trò được gán').toEqual(expected);
    }
  });

  test("FLOW-ADM-009 Tài khoản chưa đổi mật khẩu lần đầu không thao tác được", { tag: ["@flow", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, roles }) => {

    test.setTimeout(600_000);
    const allRoles = await ADM.allAdmin(testRun, 'GET /api/admin/roles');
    const roleNamed = (rx: RegExp, label: string) => { const r = allRoles.find((x: any) => rx.test(x.name ?? '')); if (!r) throw new Error(`Chuẩn bị dữ liệu thất bại: chưa có vai trò ${label}`); return r; };

    const k5 = roleNamed(/xác nhận doanh thu/i, '"Xác nhận doanh thu K5"');
    const u = await ADM.newUser(testRun, { roleIds: [k5.id] });
    const res = await http.call('POST /api/auth/login', { json: { tenantCode: env.tenantCode, email: u.email, password: u.password } });
    expectStatusIn(res, '200/201/204', 'đăng nhập mật khẩu mặc định');
    const t = await data(res);
    expect(t.passwordChangeRequired, 'Tiền điều kiện: chưa đổi mật khẩu lần đầu').toBe(true);
    expectStatusIn(await http.call('GET /api/cost-revenue/orders', { token: t.accessToken }), '403', 'Trước khi đổi mật khẩu bị chặn');
    const np = `Lx9${Math.random().toString(36).slice(2, 10)}Q7`;
    expectStatusIn(await http.call('POST /api/auth/password', { token: t.accessToken, json: { currentPassword: u.password, newPassword: np, confirmPassword: np } }), '200/201/204', 'đổi mật khẩu');
    const t2 = await ADM.loginUser(testRun, { ...u, password: np });
    expectStatusIn(await http.call('GET /api/cost-revenue/orders', { token: t2.accessToken }), '200/201/204', 'Sau khi đổi dùng được');

  });
});
