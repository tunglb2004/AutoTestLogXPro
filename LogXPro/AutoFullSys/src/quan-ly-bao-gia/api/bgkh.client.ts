import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Báo giá khách hàng (BGKH/RC)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class BgkhClient extends ApiGroupClient {
  static readonly API = {
    create: api("POST /api/quotation-requests/{id}/customer-quotation"),
    list: api("GET /api/customer-quotations"),
    statuses: api("GET /api/customer-quotations/statuses"),
    detail: api("GET /api/customer-quotations/{id}"),
    updateSettings: api("PUT /api/customer-quotations/{id}/settings"),
    updatePrices: api("PUT /api/customer-quotations/{id}/prices"),
    mergeLines: api("POST /api/customer-quotations/{id}/merges"),
    unmergeLines: api("DELETE /api/customer-quotations/{id}/merges/{groupId}"),
    reset: api("POST /api/customer-quotations/{id}/reset"),
    confirm: api("POST /api/customer-quotations/{id}/confirm"),
    reject: api("POST /api/customer-quotations/{id}/reject"),
    deactivate: api("POST /api/customer-quotations/{id}/deactivate"),
    markAsDefault: api("POST /api/customer-quotations/{id}/default"),
    export: api("GET /api/customer-quotations/{id}/export"),
    history: api("GET /api/customer-quotations/{id}/history"),
    versions: api("GET /api/customer-quotations/{id}/versions"),
    snapshot: api("GET /api/customer-quotations/{id}/versions/{version}"),
  } as const;

  /** Tạo báo giá khách hàng — chỉ khi phiếu ở trạng thái Đã có báo giá. Báo giá nội bộ tự động còn dịch vụ chưa có giá thì trả 409 confirmation-required; gửi lại với confirmed=true để vẫn tạo — `POST /api/quotation-requests/{id}/customer-quotation` */
  create(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/customer-quotation", opts);
  }

  /** Danh sách báo giá khách hàng — tìm theo mã hoặc tên khách hàng, lọc nhiều trạng thái và nhiều dịch vụ cùng lúc, theo khách hàng, thời gian hiệu lực và khoảng tiền — `GET /api/customer-quotations` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/customer-quotations", opts);
  }

  /** Danh sách trạng thái báo giá khách hàng kèm nhãn tiếng Việt — nguồn của bộ lọc Trạng thái — `GET /api/customer-quotations/statuses` */
  statuses(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/customer-quotations/statuses", opts);
  }

  /** Chi tiết báo giá khách hàng kèm bảng dòng tiền — `GET /api/customer-quotations/{id}` */
  detail(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/customer-quotations/{id}", opts);
  }

  /** Thiết lập tỷ giá quy đổi và thuế suất VAT — `PUT /api/customer-quotations/{id}/settings` */
  updateSettings(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/customer-quotations/{id}/settings", opts);
  }

  /** Điều chỉnh giá chốt — gửi số tiền, hệ thống tự tính % so với đơn giá gốc — `PUT /api/customer-quotations/{id}/prices` */
  updatePrices(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/customer-quotations/{id}/prices", opts);
  }

  /** Gộp đầu mục — tối thiểu 2 dòng cùng một loại dịch vụ — `POST /api/customer-quotations/{id}/merges` */
  mergeLines(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/customer-quotations/{id}/merges", opts);
  }

  /** Bỏ gộp một nhóm — các dòng con trở lại, giá giữ nguyên — `DELETE /api/customer-quotations/{id}/merges/{groupId}` */
  unmergeLines(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/customer-quotations/{id}/merges/{groupId}", opts);
  }

  /** Reset về đúng đơn giá bộ phận Định giá phát hành — `POST /api/customer-quotations/{id}/reset` */
  reset(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/customer-quotations/{id}/reset", opts);
  }

  /** Khách hàng đồng ý — báo giá chuyển sang Đang hiệu lực và khoá giá — `POST /api/customer-quotations/{id}/confirm` */
  confirm(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/customer-quotations/{id}/confirm", opts);
  }

  /** Khách hàng từ chối — bắt buộc nêu lý do — `POST /api/customer-quotations/{id}/reject` */
  reject(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/customer-quotations/{id}/reject", opts);
  }

  /** Ngưng hoạt động báo giá đang hiệu lực — bắt buộc nêu lý do. Báo giá và các bản bổ sung đang chờ xác nhận chuyển sang Hết hiệu lực, gỡ cờ mặc định; không thể hoàn tác — `POST /api/customer-quotations/{id}/deactivate` */
  deactivate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/customer-quotations/{id}/deactivate", opts);
  }

  /** Đánh dấu làm báo giá mặc định của khách — chỉ khi đang hiệu lực — `POST /api/customer-quotations/{id}/default` */
  markAsDefault(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/customer-quotations/{id}/default", opts);
  }

  /** Xuất báo giá ra file PDF hoặc Excel — `GET /api/customer-quotations/{id}/export` */
  export(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/customer-quotations/{id}/export", opts);
  }

  /** Lịch sử hoạt động của một báo giá khách hàng — thời gian, người thực hiện, hành động, nội dung — `GET /api/customer-quotations/{id}/history` */
  history(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/customer-quotations/{id}/history", opts);
  }

  /** Lịch sử phiên bản báo giá — bản gốc và các bản bổ sung đã gộp vào — `GET /api/customer-quotations/{id}/versions` */
  versions(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/customer-quotations/{id}/versions", opts);
  }

  /** Xem lại một phiên bản cũ — ảnh chụp lúc nó bị thay thế — `GET /api/customer-quotations/{id}/versions/{version}` */
  snapshot(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/customer-quotations/{id}/versions/{version}", opts);
  }
}
