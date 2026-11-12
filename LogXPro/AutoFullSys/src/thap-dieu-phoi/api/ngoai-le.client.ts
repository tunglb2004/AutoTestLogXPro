import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Tháp điều phối — thao tác ngoại lệ". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class NgoaiLeClient extends ApiGroupClient {
  static readonly API = {
    scopeRequests: api("GET /api/k3/service-orders/{id}/scope-requests"),
    requestScope: api("POST /api/k3/service-orders/{id}/scope-requests"),
    changeVehicle: api("POST /api/k3/service-orders/{id}/vehicle-changes"),
  } as const;

  /** Các đề xuất điều chỉnh phạm vi của phiếu — `GET /api/k3/service-orders/{id}/scope-requests` */
  scopeRequests(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/scope-requests", opts);
  }

  /** Đề xuất thêm / bớt dịch vụ — K1 người tạo phiếu trả lời — `POST /api/k3/service-orders/{id}/scope-requests` */
  requestScope(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/k3/service-orders/{id}/scope-requests", opts);
  }

  /** Ghi nhận đổi xe giao / xe nhận của cặp xe ở Khối B — `POST /api/k3/service-orders/{id}/vehicle-changes` */
  changeVehicle(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/k3/service-orders/{id}/vehicle-changes", opts);
  }
}
