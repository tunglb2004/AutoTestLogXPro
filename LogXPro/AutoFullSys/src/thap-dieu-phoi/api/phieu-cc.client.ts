import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Tháp điều phối — phiếu dịch vụ (CC)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class PhieuCcClient extends ApiGroupClient {
  static readonly API = {
    list: api("GET /api/k3/service-orders"),
    counts: api("GET /api/k3/service-orders/counts"),
    statuses: api("GET /api/k3/service-orders/statuses"),
    detail: api("GET /api/k3/service-orders/{id}"),
    accept: api("POST /api/k3/service-orders/{id}/accept"),
    reject: api("POST /api/k3/service-orders/{id}/reject"),
    previewLegs: api("GET /api/k3/service-orders/{id}/legs/preview"),
    confirmLegs: api("POST /api/k3/service-orders/{id}/legs/confirm"),
    towerLog: api("GET /api/k3/service-orders/{id}/tower-log"),
    downloadDocument: api("GET /api/k3/service-orders/{id}/documents/{documentId}"),
    downloadVehicleDocument: api("GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}"),
  } as const;

  /** Danh sách phiếu dịch vụ ở Tháp điều phối — Trưởng điều phối thấy mọi phiếu, điều phối viên thấy phiếu có dịch vụ mình phụ trách — `GET /api/k3/service-orders` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders", opts);
  }

  /** Số đếm trên các tab lọc nhanh — theo trạng thái phiếu (Trưởng điều phối) hoặc theo phần việc của mình (điều phối viên) — `GET /api/k3/service-orders/counts` */
  counts(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/counts", opts);
  }

  /** Năm trạng thái của bộ lọc Tháp điều phối kèm nhãn tiếng Việt — `GET /api/k3/service-orders/statuses` */
  statuses(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/statuses", opts);
  }

  /** Chi tiết phiếu ở Tháp điều phối — kèm cấu trúc Chặng và thao tác cho phép — `GET /api/k3/service-orders/{id}` */
  detail(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}", opts);
  }

  /** Tiếp nhận phiếu — Tạo mới sang Đã tiếp nhận — `POST /api/k3/service-orders/{id}/accept` */
  accept(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/k3/service-orders/{id}/accept", opts);
  }

  /** Từ chối phiếu — chỉ khi Tạo mới hoặc Đã tiếp nhận, bắt buộc lý do — `POST /api/k3/service-orders/{id}/reject` */
  reject(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/k3/service-orders/{id}/reject", opts);
  }

  /** Xem trước cấu trúc Chặng theo Leg Engine — không lưu dữ liệu — `GET /api/k3/service-orders/{id}/legs/preview` */
  previewLegs(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/legs/preview", opts);
  }

  /** Xác nhận cấu trúc Chặng — phiếu giữ Đã tiếp nhận, sang Đang thực hiện khi dịch vụ đầu tiên bắt đầu — `POST /api/k3/service-orders/{id}/legs/confirm` */
  confirmLegs(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/k3/service-orders/{id}/legs/confirm", opts);
  }

  /** Nhật ký Tháp điều phối — mới nhất lên đầu — `GET /api/k3/service-orders/{id}/tower-log` */
  towerLog(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/tower-log", opts);
  }

  /** Tải một chứng từ K1 đã đính kèm ở dịch vụ — `GET /api/k3/service-orders/{id}/documents/{documentId}` */
  downloadDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/documents/{documentId}", opts);
  }

  /** Tải một số thông hành K1 đã đính kèm theo xe — `GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}` */
  downloadVehicleDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/vehicle-documents/{documentId}", opts);
  }
}
