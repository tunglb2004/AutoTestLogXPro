import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Quản trị người dùng". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class NguoiDungClient extends ApiGroupClient {
  static readonly API = {
    list: api("GET /api/admin/users"),
    create: api("POST /api/admin/users"),
    get: api("GET /api/admin/users/{id}"),
    update: api("PUT /api/admin/users/{id}"),
    lock: api("POST /api/admin/users/{id}/lock"),
    unlock: api("POST /api/admin/users/{id}/unlock"),
    resetPassword: api("POST /api/admin/users/{id}/password/reset"),
    permissions: api("GET /api/admin/users/{id}/permissions"),
    exportPermissions: api("GET /api/admin/users/{id}/permissions/export"),
  } as const;

  /** Danh sách người dùng — tìm theo mã NV, họ tên, email; status, departmentId, roleId nhận nhiều giá trị — `GET /api/admin/users` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/users", opts);
  }

  /** Tạo tài khoản với mật khẩu mặc định; có thể gán vai trò và bộ phận ngay — `POST /api/admin/users` */
  create(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/users", opts);
  }

  /** Một người dùng, các vai trò và bộ phận của họ — `GET /api/admin/users/{id}` */
  get(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/users/{id}", opts);
  }

  /** Sửa mã NV, họ tên, SĐT, email; roleIds/departmentIds gửi lên thì thay thế danh sách cũ — `PUT /api/admin/users/{id}` */
  update(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/admin/users/{id}", opts);
  }

  /** Khóa tài khoản; phiên kết thúc ngay — 409 nếu còn việc chưa bàn giao — `POST /api/admin/users/{id}/lock` */
  lock(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/users/{id}/lock", opts);
  }

  /** Mở khóa tài khoản; đăng nhập lại được ngay — `POST /api/admin/users/{id}/unlock` */
  unlock(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/users/{id}/unlock", opts);
  }

  /** Đặt lại mật khẩu về mặc định; phiên của người đó kết thúc ngay — `POST /api/admin/users/{id}/password/reset` */
  resetPassword(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/users/{id}/password/reset", opts);
  }

  /** Quyền hiệu lực của người dùng (hợp các vai trò đang dùng), kèm vai trò nguồn — `GET /api/admin/users/{id}/permissions` */
  permissions(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/users/{id}/permissions", opts);
  }

  /** Xuất quyền hiệu lực của người dùng ra Excel — 400 nếu không có quyền nào — `GET /api/admin/users/{id}/permissions/export` */
  exportPermissions(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/users/{id}/permissions/export", opts);
  }
}
