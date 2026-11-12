import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Quản trị vai trò, nhật ký và thiết lập". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class VaiTroClient extends ApiGroupClient {
  static readonly API = {
    catalogue: api("GET /api/admin/permissions"),
    list: api("GET /api/admin/roles"),
    create: api("POST /api/admin/roles"),
    get: api("GET /api/admin/roles/{id}"),
    update: api("PUT /api/admin/roles/{id}"),
    delete: api("DELETE /api/admin/roles/{id}"),
    activate: api("POST /api/admin/roles/{id}/activate"),
    deactivate: api("POST /api/admin/roles/{id}/deactivate"),
    members: api("GET /api/admin/roles/{id}/users"),
    assignMembers: api("POST /api/admin/roles/{id}/users"),
    removeMember: api("DELETE /api/admin/roles/{id}/users/{userId}"),
    assign: api("POST /api/admin/users/{userId}/roles"),
    revoke: api("DELETE /api/admin/users/{userId}/roles/{roleId}"),
    find: api("GET /api/admin/audit-log"),
    get2: api("GET /api/admin/settings"),
    update2: api("PUT /api/admin/settings"),
  } as const;

  /** Rổ quyền để tích chọn, gom nhóm theo Khối và Role trong khối — `GET /api/admin/permissions` */
  catalogue(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/permissions", opts);
  }

  /** Danh sách vai trò — tìm theo tên; lọc theo bộ phận (nhiều giá trị) và trạng thái — `GET /api/admin/roles` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/roles", opts);
  }

  /** Tạo vai trò mới — `POST /api/admin/roles` */
  create(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/roles", opts);
  }

  /** Một vai trò và danh sách quyền của nó — `GET /api/admin/roles/{id}` */
  get(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/roles/{id}", opts);
  }

  /** Sửa vai trò; danh sách quyền gửi lên thay thế danh sách cũ — `PUT /api/admin/roles/{id}` */
  update(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/admin/roles/{id}", opts);
  }

  /** Xoá vai trò; chỉ được khi không còn ai giữ — `DELETE /api/admin/roles/{id}` */
  delete(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/admin/roles/{id}", opts);
  }

  /** Kích hoạt lại vai trò; người đang giữ có lại quyền của nó ngay — `POST /api/admin/roles/{id}/activate` */
  activate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/roles/{id}/activate", opts);
  }

  /** Vô hiệu hoá vai trò; người đang giữ mất quyền của nó ngay — `POST /api/admin/roles/{id}/deactivate` */
  deactivate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/roles/{id}/deactivate", opts);
  }

  /** Người dùng đang giữ vai trò; roleCount = 1 nghĩa là gỡ xong họ không còn quyền nào — `GET /api/admin/roles/{id}/users` */
  members(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/roles/{id}/users", opts);
  }

  /** Thêm một hoặc nhiều người dùng vào vai trò; hiệu lực ngay — `POST /api/admin/roles/{id}/users` */
  assignMembers(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/roles/{id}/users", opts);
  }

  /** Gỡ một người dùng khỏi vai trò; mất quyền ngay, không cần đăng nhập lại — `DELETE /api/admin/roles/{id}/users/{userId}` */
  removeMember(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/admin/roles/{id}/users/{userId}", opts);
  }

  /** Gán thêm một vai trò cho người dùng — `POST /api/admin/users/{userId}/roles` */
  assign(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/users/{userId}/roles", opts);
  }

  /** Gỡ một vai trò khỏi người dùng; mất quyền ngay, không cần đăng nhập lại — `DELETE /api/admin/users/{userId}/roles/{roleId}` */
  revoke(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/admin/users/{userId}/roles/{roleId}", opts);
  }

  /** Nhật ký hoạt động, mới nhất trước — `GET /api/admin/audit-log` */
  find(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/audit-log", opts);
  }

  /** Thiết lập hiện tại — `GET /api/admin/settings` */
  get2(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/settings", opts);
  }

  /** Đổi mức kiểm soát cặp nhạy cảm giữa Cảnh báo và Chặn — `PUT /api/admin/settings` */
  update2(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/admin/settings", opts);
  }
}
