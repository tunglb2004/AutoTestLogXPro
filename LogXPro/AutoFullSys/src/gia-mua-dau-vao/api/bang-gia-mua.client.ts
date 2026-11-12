import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Giá mua đầu vào (bảng giá dịch vụ của nhà thầu)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class BangGiaMuaClient extends ApiGroupClient {
  static readonly API = {
    list: api("GET /api/purchase-prices"),
    create: api("POST /api/purchase-prices"),
    contractors: api("GET /api/purchase-prices/contractors"),
    stats: api("GET /api/purchase-prices/stats"),
    get: api("GET /api/purchase-prices/{id}"),
    update: api("PUT /api/purchase-prices/{id}"),
    delete: api("DELETE /api/purchase-prices/{id}"),
    activate: api("POST /api/purchase-prices/{id}/activate"),
    checkActivation: api("GET /api/purchase-prices/{id}/activation-check"),
    deactivate: api("POST /api/purchase-prices/{id}/deactivate"),
    history: api("GET /api/purchase-prices/{id}/history"),
    items: api("GET /api/purchase-prices/{id}/items"),
    addItem: api("POST /api/purchase-prices/{id}/items"),
    saveItems: api("PUT /api/purchase-prices/{id}/items"),
    approveItems: api("POST /api/purchase-prices/{id}/items/approve"),
    updateItem: api("PUT /api/purchase-prices/{id}/items/{itemId}"),
    removeItem: api("DELETE /api/purchase-prices/{id}/items/{itemId}"),
    versions: api("GET /api/purchase-prices/{id}/versions"),
    version: api("GET /api/purchase-prices/{id}/versions/{versionId}"),
    versionItems: api("GET /api/purchase-prices/{id}/versions/{versionId}/items"),
  } as const;

  /** Danh sách bảng giá mua, tạo mới nhất trước — sort nhận effectiveFrom/-effectiveFrom/effectiveTo/-effectiveTo — `GET /api/purchase-prices` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices", opts);
  }

  /** Thêm bảng giá mua — thông tin chung và dòng giá trong cùng một request — `POST /api/purchase-prices` */
  create(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/purchase-prices", opts);
  }

  /** Nhà thầu đang hoạt động và có hợp đồng đang hiệu lực, kèm hợp đồng đó — `GET /api/purchase-prices/contractors` */
  contractors(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices/contractors", opts);
  }

  /** Số lượng bảng giá mua theo trạng thái — `GET /api/purchase-prices/stats` */
  stats(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices/stats", opts);
  }

  /** Chi tiết một bảng giá mua, kèm tab và đầu mục giá đang có dòng giá — `GET /api/purchase-prices/{id}` */
  get(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices/{id}", opts);
  }

  /** Sửa thông tin chung của bảng giá mua — `PUT /api/purchase-prices/{id}` */
  update(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/purchase-prices/{id}", opts);
  }

  /** Xoá bảng giá mua — chỉ khi còn ở trạng thái Tạo mới — `DELETE /api/purchase-prices/{id}` */
  delete(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/purchase-prices/{id}", opts);
  }

  /** Kích hoạt bảng giá mua — bảng giá đang chạy của nhà thầu sẽ tự ngừng — `POST /api/purchase-prices/{id}/activate` */
  activate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/purchase-prices/{id}/activate", opts);
  }

  /** Kích hoạt bảng giá này có làm ngừng bảng giá nào đang chạy không — `GET /api/purchase-prices/{id}/activation-check` */
  checkActivation(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices/{id}/activation-check", opts);
  }

  /** Ngừng hoạt động bảng giá mua, giữ nguyên kỳ hiệu lực — `POST /api/purchase-prices/{id}/deactivate` */
  deactivate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/purchase-prices/{id}/deactivate", opts);
  }

  /** Lịch sử thao tác trên một bảng giá mua, mới nhất trước — `GET /api/purchase-prices/{id}/history` */
  history(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices/{id}/history", opts);
  }

  /** Danh sách dòng giá của một bảng giá mua — lọc theo thuộc tính đặc thù của từng phân hệ, mỗi thuộc tính nhận nhiều giá trị — `GET /api/purchase-prices/{id}/items` */
  items(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices/{id}/items", opts);
  }

  /** Thêm dòng giá vào bảng giá đã có — nhân tổ hợp các lựa chọn — `POST /api/purchase-prices/{id}/items` */
  addItem(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/purchase-prices/{id}/items", opts);
  }

  /** Lưu cả lô thay đổi dòng giá — thêm, sửa đơn giá và xoá trong một lần — `PUT /api/purchase-prices/{id}/items` */
  saveItems(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/purchase-prices/{id}/items", opts);
  }

  /** Phê duyệt các dòng giá đang chờ duyệt — `POST /api/purchase-prices/{id}/items/approve` */
  approveItems(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/purchase-prices/{id}/items/approve", opts);
  }

  /** Sửa một dòng giá — `PUT /api/purchase-prices/{id}/items/{itemId}` */
  updateItem(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/purchase-prices/{id}/items/{itemId}", opts);
  }

  /** Xóa một dòng giá — `DELETE /api/purchase-prices/{id}/items/{itemId}` */
  removeItem(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/purchase-prices/{id}/items/{itemId}", opts);
  }

  /** Nhật ký bảng giá mua — các phiên bản, mới nhất trước (current = phiên bản hiện tại) — `GET /api/purchase-prices/{id}/versions` */
  versions(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices/{id}/versions", opts);
  }

  /** Chi tiết một phiên bản bảng giá mua — thông tin chung, tab dịch vụ và đầu mục giá — `GET /api/purchase-prices/{id}/versions/{versionId}` */
  version(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices/{id}/versions/{versionId}", opts);
  }

  /** Dòng giá của một phiên bản bảng giá mua — cùng tham số lọc với /{id}/items — `GET /api/purchase-prices/{id}/versions/{versionId}/items` */
  versionItems(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/purchase-prices/{id}/versions/{versionId}/items", opts);
  }
}
