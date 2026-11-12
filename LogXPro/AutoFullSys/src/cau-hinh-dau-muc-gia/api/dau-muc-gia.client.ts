import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Cấu hình đầu mục giá". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class DauMucGiaClient extends ApiGroupClient {
  static readonly API = {
    list: api("GET /api/price-configurations"),
    stats: api("GET /api/price-configurations/stats"),
    get: api("GET /api/price-configurations/{id}"),
    history: api("GET /api/price-configurations/{id}/history"),
    addItem: api("POST /api/price-configurations/{id}/items"),
    saveItems: api("PUT /api/price-configurations/{id}/items"),
    updateItem: api("PUT /api/price-configurations/{id}/items/{itemId}"),
    removeItem: api("DELETE /api/price-configurations/{id}/items/{itemId}"),
    deactivationImpact: api("GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact"),
    versions: api("GET /api/price-configurations/{id}/versions"),
    currentVersion: api("GET /api/price-configurations/{id}/versions/current"),
    version: api("GET /api/price-configurations/{id}/versions/{versionId}"),
  } as const;

  /** Danh sách cấu hình giá, theo thứ tự hiển thị của dịch vụ — `GET /api/price-configurations` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/price-configurations", opts);
  }

  /** Tổng số cấu hình, tổng số đầu mục và số đầu mục đang hoạt động — `GET /api/price-configurations/stats` */
  stats(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/price-configurations/stats", opts);
  }

  /** Chi tiết cấu hình giá kèm các đầu mục — `GET /api/price-configurations/{id}` */
  get(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/price-configurations/{id}", opts);
  }

  /** Lịch sử thao tác trên các đầu mục của một cấu hình giá, mới nhất trước — `GET /api/price-configurations/{id}/history` */
  history(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/price-configurations/{id}/history", opts);
  }

  /** Thêm đầu mục vào cấu hình giá — `POST /api/price-configurations/{id}/items` */
  addItem(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/price-configurations/{id}/items", opts);
  }

  /** Lưu toàn bộ danh sách đầu mục — có id là sửa, không id là thêm, thiếu là xóa; ghi 1 lịch sử — `PUT /api/price-configurations/{id}/items` */
  saveItems(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/price-configurations/{id}/items", opts);
  }

  /** Sửa đầu mục — `PUT /api/price-configurations/{id}/items/{itemId}` */
  updateItem(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/price-configurations/{id}/items/{itemId}", opts);
  }

  /** Xóa đầu mục vĩnh viễn — `DELETE /api/price-configurations/{id}/items/{itemId}` */
  removeItem(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/price-configurations/{id}/items/{itemId}", opts);
  }

  /** Kiểm tra trước khi tắt kích hoạt đầu mục — bị chặn bởi phiếu dịch vụ nào, có đang được dùng không — `GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact` */
  deactivationImpact(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact", opts);
  }

  /** Nhật ký cấu hình đầu mục giá — các phiên bản, mới nhất trước (current = Hiện tại). Cấu hình chưa lưu lần nào có một mục Hiện tại không id: mở bằng /versions/current — `GET /api/price-configurations/{id}/versions` */
  versions(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/price-configurations/{id}/versions", opts);
  }

  /** Danh sách đầu mục giá hiện tại, cùng dạng một phiên bản — `GET /api/price-configurations/{id}/versions/current` */
  currentVersion(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/price-configurations/{id}/versions/current", opts);
  }

  /** Xem chi tiết một phiên bản danh sách đầu mục giá (sau một lần lưu) — `GET /api/price-configurations/{id}/versions/{versionId}` */
  version(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/price-configurations/{id}/versions/{versionId}", opts);
  }
}
