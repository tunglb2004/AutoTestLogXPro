import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Quản trị bộ phận". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class BoPhanClient extends ApiGroupClient {
  static readonly API = {
    list: api("GET /api/admin/departments"),
    create: api("POST /api/admin/departments"),
    get: api("GET /api/admin/departments/{id}"),
    update: api("PUT /api/admin/departments/{id}"),
    delete: api("DELETE /api/admin/departments/{id}"),
    activate: api("POST /api/admin/departments/{id}/activate"),
    deactivate: api("POST /api/admin/departments/{id}/deactivate"),
    assignRoles: api("POST /api/admin/departments/{id}/roles"),
    removeRole: api("DELETE /api/admin/departments/{id}/roles/{roleId}"),
    assign: api("POST /api/admin/users/{userId}/departments"),
    remove: api("DELETE /api/admin/users/{userId}/departments/{departmentId}"),
  } as const;

  /** Danh sách bộ phận kèm số vai trò và số thành viên — tìm theo tên — `GET /api/admin/departments` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/departments", opts);
  }

  /** Tạo bộ phận mới — `POST /api/admin/departments` */
  create(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/departments", opts);
  }

  /** Một bộ phận, các vai trò thuộc bộ phận và danh sách thành viên — `GET /api/admin/departments/{id}` */
  get(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/admin/departments/{id}", opts);
  }

  /** Sửa tên và mô tả bộ phận — `PUT /api/admin/departments/{id}` */
  update(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/admin/departments/{id}", opts);
  }

  /** Xoá bộ phận; chỉ được khi không còn vai trò nào — thành viên tự rời bộ phận — `DELETE /api/admin/departments/{id}` */
  delete(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/admin/departments/{id}", opts);
  }

  /** Kích hoạt lại bộ phận — `POST /api/admin/departments/{id}/activate` */
  activate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/departments/{id}/activate", opts);
  }

  /** Vô hiệu hoá bộ phận; thành viên vẫn giữ nguyên quyền của họ — `POST /api/admin/departments/{id}/deactivate` */
  deactivate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/departments/{id}/deactivate", opts);
  }

  /** Đưa vai trò vào bộ phận; một vai trò có thể thuộc nhiều bộ phận — `POST /api/admin/departments/{id}/roles` */
  assignRoles(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/departments/{id}/roles", opts);
  }

  /** Gỡ vai trò khỏi bộ phận; vai trò và quyền của nó giữ nguyên — `DELETE /api/admin/departments/{id}/roles/{roleId}` */
  removeRole(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/admin/departments/{id}/roles/{roleId}", opts);
  }

  /** Thêm người dùng vào một bộ phận; không đổi quyền của họ — `POST /api/admin/users/{userId}/departments` */
  assign(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/admin/users/{userId}/departments", opts);
  }

  /** Gỡ người dùng khỏi một bộ phận; không đổi quyền của họ — `DELETE /api/admin/users/{userId}/departments/{departmentId}` */
  remove(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/admin/users/{userId}/departments/{departmentId}", opts);
  }
}
