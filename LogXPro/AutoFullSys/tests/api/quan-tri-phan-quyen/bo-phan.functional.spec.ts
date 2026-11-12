/* Sinh từ TestcaseFullSys.md + StructFullSys.md: mỗi test() là đúng 1 case, tiêu đề bắt đầu bằng ID case. */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256 } from '../../../src/core/fixtures/test-run.fixture';
import { badTokens } from '../../../src/core/fixtures/auth.fixture';
import { body, data, items, must, jsonPart } from '../../../src/core/base.client';
import { expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, errorFields } from '../../../src/core/assertions';
import { P0 } from '../../../src/core/data/p0-price-set';
import { freshUser, login, loginOk, changePassword } from '../../../src/quan-tri-phan-quyen/data/nguoi-dung.factory';
import { env } from '../../../src/core/env';

void [TEST_RUN_ID, MALFORMED_JSON, tagged, textOfLength, today, uuid, randInt, randMoney, samplePdf, fileOfSize, REAL, realFile, sha256, badTokens, body, data, items, must, jsonPart, expectStatusIn, expectApiError, expectNoData, expectOnlyFieldError, expectMoney, expectPercent, stable, hasNoStacktrace, codes, P0];

import * as ADM from '../../../src/quan-tri-phan-quyen/data/admin-pending.factory';

import { exclusive } from '../../../src/gia-mua-dau-vao/data/bang-gia-mua.factory';
import { readXlsx } from '../../../src/chi-phi-doanh-thu/data/pnl-phieu.factory';
import { p0Order } from '../../../src/phieu-dich-vu/data/phieu-dich-vu.factory';
import { startService } from '../../../src/thap-dieu-phoi/data/dich-vu-con.factory';
import { createRfq } from '../../../src/quan-ly-bao-gia/data/ycbg.factory';
test.describe("Quản trị bộ phận", () => {
  test("ADM-DEP-002 Danh sách bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const a = await ADM.newDepartment(testRun);
    await ADM.newDepartment(testRun, { name: ADM.uniqueName('Tài chính AT') });
    const r = await ADM.newRole(testRun, await ADM.safeViewCodes(testRun, 1));
    await ADM.bindDepartmentRole(testRun, a.id, r.id);
    await ADM.newUser(testRun, { departmentIds: [a.id] });
    const res = await ADM.adminRequest(testRun, 'GET /api/admin/departments', { query: { search: a.name, page: 1, perPage: 20 } });
    expectStatusIn(res, '200');
    const rows = items(await data(res));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: a.id, name: a.name, roleCount: 1, memberCount: 1 });
  });

  test("ADM-DEP-003 Tìm theo tên không phân biệt hoa thường", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const name = ADM.uniqueName('Điều phối AT');
    const d = await ADM.newDepartment(testRun, { name });
    await ADM.newDepartment(testRun, { name: ADM.uniqueName('Bộ phận không khớp') });
    const res = await ADM.adminRequest(testRun, 'GET /api/admin/departments', { query: { search: name.toLocaleUpperCase('vi-VN'), page: 1, perPage: 100 } });
    expectStatusIn(res, '200');
    const result = await data(res);
    expect(items(result).map((x: any) => x.id)).toEqual([d.id]);
    expect(result.meta.pagination.total).toBe(1);
  });

  test("ADM-DEP-009 Tạo bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const name = ADM.uniqueName('Điều phối AT');
    const d = await ADM.newDepartment(testRun, { name, description: 'Bộ phận test' });
    expect(d).toMatchObject({ name, description: 'Bộ phận test', active: true, roles: [], members: [] });
    await ADM.expectAuditAdded(testRun, d.id, [], [name]);
  });

  test("ADM-DEP-010 Trùng tên bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const before = await ADM.allAdmin(testRun, 'GET /api/admin/departments', { search: d.name });
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments', { json: { name: d.name.toLocaleUpperCase('vi-VN'), description: 'Không được tạo' } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.allAdmin(testRun, 'GET /api/admin/departments', { search: d.name }))).toEqual(stable(before));
  });

  test("ADM-DEP-011 Tạo bộ phận không đổi quyền ai", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const before = await ADM.effective(testRun, u.id);
    expect(ADM.permissionCodes(before)).toEqual(ps);
    await ADM.newDepartment(testRun);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-023 Sửa tên, mô tả bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const before = await ADM.audit(testRun, d.id);
    const name = ADM.uniqueName('Điều phối AT sửa');
    const res = await ADM.adminRequest(testRun, 'PUT /api/admin/departments/{id}', { params: { id: d.id }, json: { name, description: 'Mô tả sau cập nhật' } });
    expectStatusIn(res, '200/204');
    expect(await ADM.department(testRun, d.id)).toMatchObject({ name, description: 'Mô tả sau cập nhật' });
    await ADM.expectAuditAdded(testRun, d.id, ADM.idsOf(before), [d.name, name]);
  });

  test("ADM-DEP-024 Đổi sang tên đã có", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const a = await ADM.newDepartment(testRun);
    const b = await ADM.newDepartment(testRun);
    const before = stable(await ADM.department(testRun, a.id));
    const logs = await ADM.audit(testRun, a.id);
    const res = await ADM.adminRequest(testRun, 'PUT /api/admin/departments/{id}', { params: { id: a.id }, json: { name: b.name, description: a.description } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.department(testRun, a.id))).toEqual(before);
    expect(await ADM.audit(testRun, a.id)).toEqual(logs);
  });

  test("ADM-DEP-025 Sửa không làm mất vai trò, thành viên", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const { d, r, u } = await ADM.orgFixture(testRun);
    const res = await ADM.adminRequest(testRun, 'PUT /api/admin/departments/{id}', { params: { id: d.id }, json: { name: d.name, description: 'Đổi mô tả độc lập' } });
    expectStatusIn(res, '200/204');
    const actual = await ADM.department(testRun, d.id);
    expect(actual.description).toBe('Đổi mô tả độc lập');
    expect(ADM.idsOf(actual.roles)).toEqual([r.id]);
    expect(ADM.idsOf(actual.members)).toEqual([u.id]);
  });

  test("ADM-DEP-030 Xóa bộ phận không còn vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id], departmentIds: [d.id] });
    const before = await ADM.effective(testRun, u.id);
    expect((await ADM.department(testRun, d.id)).roles).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}', { params: { id: d.id } });
    expectStatusIn(res, '200/204');
    expectStatusIn(await ADM.adminRequest(testRun, 'GET /api/admin/departments/{id}', { params: { id: d.id } }), '404');
    expect((await ADM.user(testRun, u.id)).departments.some((x: any) => x.id === d.id)).toBe(false);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-031 Vòng đời tạo → đọc → sửa → xóa bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun, { name: ADM.uniqueName('AT CRUD') });
    expect((await ADM.department(testRun, d.id)).name).toBe(d.name);
    const name = ADM.uniqueName('AT CRUD sửa');
    expectStatusIn(await ADM.adminRequest(testRun, 'PUT /api/admin/departments/{id}', { params: { id: d.id }, json: { name, description: 'Sau sửa' } }), '200/204');
    expect(await ADM.department(testRun, d.id)).toMatchObject({ name, description: 'Sau sửa' });
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}', { params: { id: d.id } }), '200/204');
    expectStatusIn(await ADM.adminRequest(testRun, 'GET /api/admin/departments/{id}', { params: { id: d.id } }), '404');
  });

  test("ADM-DEP-032 Xóa bộ phận còn vai trò", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    for (let n = 0; n < 2; n++) {
      const r = await ADM.newRole(testRun);
      await ADM.bindDepartmentRole(testRun, d.id, r.id);
    }
    const before = stable(await ADM.department(testRun, d.id));
    expect(before.roles).toHaveLength(2);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}', { params: { id: d.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.department(testRun, d.id))).toEqual(before);
  });

  test("ADM-DEP-033 Thành viên giữ quyền sau khi bộ phận bị xóa", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id], departmentIds: [d.id] });
    const before = await ADM.effective(testRun, u.id);
    expect((await ADM.department(testRun, d.id)).roles).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}', { params: { id: d.id } });
    expectStatusIn(res, '200/204');
    expectStatusIn(await ADM.adminRequest(testRun, 'GET /api/admin/departments/{id}', { params: { id: d.id } }), '404');
    expect((await ADM.user(testRun, u.id)).departments.some((x: any) => x.id === d.id)).toBe(false);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-037 Kích hoạt lại bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const { d, u } = await ADM.orgFixture(testRun);
    const before = await ADM.effective(testRun, u.id);
    await ADM.adminData(testRun, 'POST /api/admin/departments/{id}/deactivate', { params: { id: d.id } });
    expect((await ADM.department(testRun, d.id)).active).toBe(false);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments/{id}/activate', { params: { id: d.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.department(testRun, d.id)).active).toBe(true);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-038 Kích hoạt bộ phận đang hoạt động", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    expect(d.active).toBe(true);
    const before = stable(d);
    const logs = await ADM.audit(testRun, d.id);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments/{id}/activate', { params: { id: d.id } });
    expectStatusIn(res, '400/409/422');
    await expectApiError(res);
    expect(stable(await ADM.department(testRun, d.id))).toEqual(before);
    expect(await ADM.audit(testRun, d.id)).toEqual(logs);
  });

  test("ADM-DEP-039 Kích hoạt không đổi quyền thành viên", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const { d, u } = await ADM.orgFixture(testRun);
    const before = await ADM.effective(testRun, u.id);
    await ADM.adminData(testRun, 'POST /api/admin/departments/{id}/deactivate', { params: { id: d.id } });
    expect((await ADM.department(testRun, d.id)).active).toBe(false);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments/{id}/activate', { params: { id: d.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.department(testRun, d.id)).active).toBe(true);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-044 Vô hiệu bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const { d, u } = await ADM.orgFixture(testRun);
    const before = await ADM.effective(testRun, u.id);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments/{id}/deactivate', { params: { id: d.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.department(testRun, d.id)).active).toBe(false);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-045 Thành viên vẫn thao tác được sau khi bộ phận bị vô hiệu", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ testRun }) => {

    const { d, u } = await ADM.orgFixture(testRun);
    const t = await ADM.loginUser(testRun, u);
    const before = await ADM.myPermissions(testRun, t.accessToken);
    expect(before.length, 'Tiền điều kiện: thành viên có quyền').toBeGreaterThan(0);
    const res = await ADM.adminRequest(testRun, "POST /api/admin/departments/{id}/deactivate", { params: { id: d.id } });
    expectStatusIn(res, '200/204');
    expect(await ADM.myPermissions(testRun, t.accessToken), 'Thành viên vẫn giữ quyền sau khi bộ phận bị vô hiệu').toEqual(before);

  });

  test("ADM-DEP-046 Vô hiệu không xóa liên kết", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const { d, r, u } = await ADM.orgFixture(testRun);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments/{id}/deactivate', { params: { id: d.id } });
    expectStatusIn(res, '200/204');
    const actual = await ADM.department(testRun, d.id);
    expect(actual.active).toBe(false);
    expect(ADM.idsOf(actual.roles)).toEqual([r.id]);
    expect(ADM.idsOf(actual.members)).toEqual([u.id]);
  });

  test("ADM-DEP-051 Đưa vai trò vào bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun, await ADM.servicePermissionCodes(testRun, 'VT'));
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/departments/{id}/roles', { params: { id: d.id }, json: { roleIds: [r.id] } });
    expectStatusIn(res, '200/201');
    testRun.track('Gỡ vai trò test khỏi bộ phận', () => ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}/roles/{roleId}', { params: { id: d.id, roleId: r.id } }));
    expect(ADM.idsOf((await ADM.department(testRun, d.id)).roles)).toEqual([r.id]);
    expect((await ADM.role(testRun, r.id)).departments.some((x: any) => x.id === d.id)).toBe(true);
  });

  test("ADM-DEP-052 Một vai trò thuộc 2 bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const a = await ADM.newDepartment(testRun);
    const b = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun);
    await ADM.bindDepartmentRole(testRun, a.id, r.id);
    await ADM.bindDepartmentRole(testRun, b.id, r.id);
    expect(ADM.idsOf((await ADM.department(testRun, a.id)).roles)).toEqual([r.id]);
    expect(ADM.idsOf((await ADM.department(testRun, b.id)).roles)).toEqual([r.id]);
    expect(ADM.idsOf((await ADM.role(testRun, r.id)).departments)).toEqual([a.id, b.id].sort());
  });

  test("ADM-DEP-053 Đưa vai trò vào bộ phận không đổi quyền", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const ps = await ADM.servicePermissionCodes(testRun, 'VT');
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const before = await ADM.effective(testRun, u.id);
    await ADM.bindDepartmentRole(testRun, d.id, r.id);
    expect((await ADM.role(testRun, r.id)).permissions.sort()).toEqual(ps);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-060 Gỡ xong mới xóa được bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const r = await ADM.newRole(testRun);
    await ADM.bindDepartmentRole(testRun, d.id, r.id);
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}', { params: { id: d.id } }), '400/409/422');
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}/roles/{roleId}', { params: { id: d.id, roleId: r.id } }), '200/204');
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}', { params: { id: d.id } }), '200/204');
    expectStatusIn(await ADM.adminRequest(testRun, 'GET /api/admin/departments/{id}', { params: { id: d.id } }), '404');
  });

  test("ADM-DEP-061 Người giữ vai trò không mất quyền", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const { d, r, u } = await ADM.orgFixture(testRun);
    const t = await ADM.loginUser(testRun, u);
    const before = await ADM.myPermissions(testRun, t.accessToken);
    expect(before).toEqual(r.permissions.sort());
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}/roles/{roleId}', { params: { id: d.id, roleId: r.id } }), '200/204');
    expect(await ADM.myPermissions(testRun, t.accessToken)).toEqual(before);
  });

  test("ADM-DEP-065 Thêm người dùng vào bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const before = await ADM.effective(testRun, u.id);
    expect((await ADM.user(testRun, u.id)).departments).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/departments', { params: { userId: u.id }, json: { departmentId: d.id } });
    expectStatusIn(res, '200/204');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).departments)).toEqual([d.id]);
    expect(ADM.idsOf((await ADM.department(testRun, d.id)).members)).toEqual([u.id]);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-066 Thêm vào bộ phận đang vô hiệu", { tag: ["@api", "@quan-tri-phan-quyen", "@p3", "@cho-xac-nhan"] }, async ({ testRun }) => {

    const { d, u } = await ADM.orgFixture(testRun);
    const other = await ADM.newDepartment(testRun);
    await ADM.adminData(testRun, 'POST /api/admin/departments/{id}/deactivate', { params: { id: other.id } });
    const t = await ADM.loginUser(testRun, u);
    const before = await ADM.myPermissions(testRun, t.accessToken);
    const res = await ADM.adminRequest(testRun, "POST /api/admin/users/{userId}/departments", { params: { userId: u.id }, json: { departmentId: other.id } });
    expectStatusIn(res, '200/204/409');
    test.info().annotations.push({ type: 'Chờ xác nhận', description: `Thêm người dùng vào bộ phận đang vô hiệu: HTTP ${res.status()}` });
    if (res.ok()) expect(await ADM.myPermissions(testRun, t.accessToken), 'Quyền vẫn không đổi').toEqual(before);
    void d;

  });

  test("ADM-DEP-067 Quyền không đổi khi vào bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p2"] }, async ({ http, testRun, tok }) => {
const d = await ADM.newDepartment(testRun);
    const ps = await ADM.safeViewCodes(testRun, 1);
    const r = await ADM.newRole(testRun, ps);
    const u = await ADM.newUser(testRun, { roleIds: [r.id] });
    const before = await ADM.effective(testRun, u.id);
    expect((await ADM.user(testRun, u.id)).departments).toEqual([]);
    const res = await ADM.adminRequest(testRun, 'POST /api/admin/users/{userId}/departments', { params: { userId: u.id }, json: { departmentId: d.id } });
    expectStatusIn(res, '200/204');
    expect(ADM.idsOf((await ADM.user(testRun, u.id)).departments)).toEqual([d.id]);
    expect(ADM.idsOf((await ADM.department(testRun, d.id)).members)).toEqual([u.id]);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-075 Gỡ người dùng không ảnh hưởng thành viên khác", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const { d, u } = await ADM.orgFixture(testRun);
    const other = await ADM.newUser(testRun, { departmentIds: [d.id] });
    const beforeOther = stable(await ADM.user(testRun, other.id));
    expect(ADM.idsOf((await ADM.department(testRun, d.id)).members)).toEqual([u.id, other.id].sort());
    expectStatusIn(await ADM.adminRequest(testRun, 'DELETE /api/admin/users/{userId}/departments/{departmentId}', { params: { userId: u.id, departmentId: d.id } }), '200/204');
    expect(ADM.idsOf((await ADM.department(testRun, d.id)).members)).toEqual([other.id]);
    expect(stable(await ADM.user(testRun, other.id))).toEqual(beforeOther);
  });

  test("ADM-DEP-076 Quyền không đổi sau khi gỡ", { tag: ["@api", "@quan-tri-phan-quyen", "@p3"] }, async ({ http, testRun, tok }) => {
const { d, u } = await ADM.orgFixture(testRun);
    const before = await ADM.effective(testRun, u.id);
    expect((await ADM.user(testRun, u.id)).departments.some((x: any) => x.id === d.id)).toBe(true);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/users/{userId}/departments/{departmentId}', { params: { userId: u.id, departmentId: d.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.user(testRun, u.id)).departments.some((x: any) => x.id === d.id)).toBe(false);
    expect((await ADM.department(testRun, d.id)).members.some((x: any) => x.id === u.id)).toBe(false);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-019 Chi tiết bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const { d, r, u } = await ADM.orgFixture(testRun);
    const res = await ADM.adminRequest(testRun, 'GET /api/admin/departments/{id}', { params: { id: d.id } });
    expectStatusIn(res, '200');
    const actual = await data(res);
    expect(actual).toMatchObject({ id: d.id, name: d.name, description: d.description, active: true });
    expect(ADM.idsOf(actual.roles)).toEqual([r.id]);
    expect(ADM.idsOf(actual.members)).toEqual([u.id]);
  });

  test("ADM-DEP-058 Gỡ vai trò khỏi bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const { d, r, u } = await ADM.orgFixture(testRun);
    const before = await ADM.effective(testRun, u.id);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/departments/{id}/roles/{roleId}', { params: { id: d.id, roleId: r.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.department(testRun, d.id)).roles).toEqual([]);
    expect((await ADM.role(testRun, r.id)).permissions.sort()).toEqual(r.permissions.sort());
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });

  test("ADM-DEP-073 Gỡ người dùng khỏi bộ phận", { tag: ["@api", "@quan-tri-phan-quyen", "@p1"] }, async ({ http, testRun, tok }) => {
const { d, u } = await ADM.orgFixture(testRun);
    const before = await ADM.effective(testRun, u.id);
    expect((await ADM.user(testRun, u.id)).departments.some((x: any) => x.id === d.id)).toBe(true);
    const res = await ADM.adminRequest(testRun, 'DELETE /api/admin/users/{userId}/departments/{departmentId}', { params: { userId: u.id, departmentId: d.id } });
    expectStatusIn(res, '200/204');
    expect((await ADM.user(testRun, u.id)).departments.some((x: any) => x.id === d.id)).toBe(false);
    expect((await ADM.department(testRun, d.id)).members.some((x: any) => x.id === u.id)).toBe(false);
    expect(await ADM.effective(testRun, u.id)).toEqual(before);
  });
});
