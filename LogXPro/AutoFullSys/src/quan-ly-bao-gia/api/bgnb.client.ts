import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Báo giá nội bộ (BGNB) và lập báo giá theo YCBG". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class BgnbClient extends ApiGroupClient {
  static readonly API = {
    list: api("GET /api/internal-quotes"),
    create: api("POST /api/internal-quotes"),
    benchmarkLines: api("GET /api/internal-quotes/benchmark-lines"),
    selectableRequests: api("GET /api/internal-quotes/selectable-requests"),
    sheetOptions: api("GET /api/internal-quotes/sheet-options"),
    stats: api("GET /api/internal-quotes/stats"),
    detail: api("GET /api/internal-quotes/{id}"),
    update: api("PUT /api/internal-quotes/{id}"),
    delete: api("DELETE /api/internal-quotes/{id}"),
    history: api("GET /api/internal-quotes/{id}/history"),
    issue: api("POST /api/internal-quotes/{id}/issue"),
    withdraw: api("POST /api/internal-quotes/{id}/withdraw"),
    syncStandardPrices: api("POST /api/internal-quotes/{id}/sync-standard-prices"),
    read: api("GET /api/quotation-requests/{id}/internal-quote"),
    start: api("POST /api/quotation-requests/{id}/internal-quote"),
    update2: api("PUT /api/quotation-requests/{id}/internal-quote"),
    decline: api("POST /api/quotation-requests/{id}/internal-quote/decline"),
    issue2: api("POST /api/quotation-requests/{id}/internal-quote/issue"),
  } as const;

  /** Danh sách báo giá nội bộ — `GET /api/internal-quotes` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/internal-quotes", opts);
  }

  /** Thêm mới báo giá nội bộ kèm toàn bộ bảng giá dịch vụ và dòng giá — `POST /api/internal-quotes` */
  create(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/internal-quotes", opts);
  }

  /** Dòng giá bán định mức hợp với đầu mục giá và tổ hợp thuộc tính đã nhập — `GET /api/internal-quotes/benchmark-lines` */
  benchmarkLines(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/internal-quotes/benchmark-lines", opts);
  }

  /** Yêu cầu báo giá chưa gắn báo giá nào — nguồn của ô chọn khi thêm mới — `GET /api/internal-quotes/selectable-requests` */
  selectableRequests(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/internal-quotes/selectable-requests", opts);
  }

  /** Thuộc tính bắt buộc và phạm vi giá trị của bảng giá, theo yêu cầu báo giá — `GET /api/internal-quotes/sheet-options` */
  sheetOptions(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/internal-quotes/sheet-options", opts);
  }

  /** Bốn thẻ chỉ số phía trên danh sách báo giá — `GET /api/internal-quotes/stats` */
  stats(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/internal-quotes/stats", opts);
  }

  /** Chi tiết báo giá nội bộ — thông tin chung, bảng giá dịch vụ và tổng hợp — `GET /api/internal-quotes/{id}` */
  detail(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/internal-quotes/{id}", opts);
  }

  /** Chỉnh sửa báo giá — chỉ khi Nháp, Từ chối hoặc Thu hồi — `PUT /api/internal-quotes/{id}` */
  update(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/internal-quotes/{id}", opts);
  }

  /** Xóa báo giá — chỉ khi còn ở trạng thái Nháp — `DELETE /api/internal-quotes/{id}` */
  delete(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/internal-quotes/{id}", opts);
  }

  /** Lịch sử hoạt động của một báo giá — thời gian, người thực hiện, hành động, nội dung — `GET /api/internal-quotes/{id}/history` */
  history(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/internal-quotes/{id}/history", opts);
  }

  /** Phát hành báo giá — Kinh doanh nhìn thấy trên màn Yêu cầu báo giá — `POST /api/internal-quotes/{id}/issue` */
  issue(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/internal-quotes/{id}/issue", opts);
  }

  /** Thu hồi báo giá đã phát hành — bắt buộc nêu lý do — `POST /api/internal-quotes/{id}/withdraw` */
  withdraw(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/internal-quotes/{id}/withdraw", opts);
  }

  /** Đồng bộ giá định mức — lấy lại giá bán định mức mới nhất cho báo giá tự động Đã phát hành / Thu hồi, khi yêu cầu báo giá chưa có báo giá khách hàng — `POST /api/internal-quotes/{id}/sync-standard-prices` */
  syncStandardPrices(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/internal-quotes/{id}/sync-standard-prices", opts);
  }

  /** Xem báo giá nội bộ, kể cả bản đang soạn — `GET /api/quotation-requests/{id}/internal-quote` */
  read(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/quotation-requests/{id}/internal-quote", opts);
  }

  /** Lập báo giá nội bộ cho phiếu đã tiếp nhận — sinh sẵn đầu mục theo dịch vụ được yêu cầu — `POST /api/quotation-requests/{id}/internal-quote` */
  start(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/internal-quote", opts);
  }

  /** Nhập đơn giá và thời hạn hiệu lực — chỉ khi chưa phát hành — `PUT /api/quotation-requests/{id}/internal-quote` */
  update2(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/quotation-requests/{id}/internal-quote", opts);
  }

  /** Từ chối báo giá — bắt buộc nêu lý do — `POST /api/quotation-requests/{id}/internal-quote/decline` */
  decline(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/internal-quote/decline", opts);
  }

  /** Phát hành — phiếu chuyển sang Đã có báo giá và Dịch vụ khách hàng thấy được — `POST /api/quotation-requests/{id}/internal-quote/issue` */
  issue2(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/internal-quote/issue", opts);
  }
}
