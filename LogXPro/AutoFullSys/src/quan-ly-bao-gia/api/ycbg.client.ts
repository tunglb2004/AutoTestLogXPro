import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Yêu cầu báo giá (YCBG/RFQ)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class YcbgClient extends ApiGroupClient {
  static readonly API = {
    list: api("GET /api/quotation-requests"),
    create: api("POST /api/quotation-requests"),
    statuses: api("GET /api/quotation-requests/statuses"),
    internalQuoteStats: api("GET /api/quotation-requests/internal-quote-stats"),
    detail: api("GET /api/quotation-requests/{id}"),
    update: api("PUT /api/quotation-requests/{id}"),
    deleteDraft: api("DELETE /api/quotation-requests/{id}"),
    submit: api("POST /api/quotation-requests/{id}/submit"),
    accept: api("POST /api/quotation-requests/{id}/accept"),
    autoInternalQuote: api("POST /api/quotation-requests/{id}/auto-internal-quote"),
    cancel: api("POST /api/quotation-requests/{id}/cancel"),
    document: api("GET /api/quotation-requests/{id}/documents/{documentId}"),
    removeDocument: api("DELETE /api/quotation-requests/{id}/documents/{documentId}"),
    history: api("GET /api/quotation-requests/{id}/history"),
    restore: api("POST /api/quotation-requests/{id}/restore"),
    attachDocument: api("POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents"),
  } as const;

  /** Danh sách yêu cầu báo giá — tìm theo mã RFQ hoặc tên khách hàng; lọc nhiều trạng thái và nhiều dịch vụ cùng lúc — `GET /api/quotation-requests` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/quotation-requests", opts);
  }

  /** Tạo yêu cầu báo giá — submit=false lưu nháp, submit=true gửi sang định giá — `POST /api/quotation-requests` */
  create(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests", opts);
  }

  /** Danh sách trạng thái kèm nhãn tiếng Việt — nguồn của bộ lọc Trạng thái — `GET /api/quotation-requests/statuses` */
  statuses(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/quotation-requests/statuses", opts);
  }

  /** Thẻ tổng hợp báo giá nội bộ — tổng, đã phát hành, số chốt và tỷ lệ chốt — `GET /api/quotation-requests/internal-quote-stats` */
  internalQuoteStats(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/quotation-requests/internal-quote-stats", opts);
  }

  /** Chi tiết yêu cầu báo giá — `GET /api/quotation-requests/{id}` */
  detail(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/quotation-requests/{id}", opts);
  }

  /** Sửa yêu cầu — chỉ khi đang Nháp hoặc Chờ báo giá — `PUT /api/quotation-requests/{id}` */
  update(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/quotation-requests/{id}", opts);
  }

  /** Xóa vĩnh viễn — chỉ áp dụng cho yêu cầu ở trạng thái Nháp — `DELETE /api/quotation-requests/{id}` */
  deleteDraft(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/quotation-requests/{id}", opts);
  }

  /** Gửi sang bộ phận định giá — Nháp chuyển thành Chờ báo giá — `POST /api/quotation-requests/{id}/submit` */
  submit(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/submit", opts);
  }

  /** Tiếp nhận yêu cầu báo giá — phiếu chuyển sang Đang báo giá và ghi nhận người phụ trách — `POST /api/quotation-requests/{id}/accept` */
  accept(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/accept", opts);
  }

  /** Lấy tự động báo giá nội bộ từ bảng Giá bán định mức — tới 50 tổ hợp trả ngay (201), 51–200 chạy nền (202), trên 200 bị chặn — `POST /api/quotation-requests/{id}/auto-internal-quote` */
  autoInternalQuote(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/auto-internal-quote", opts);
  }

  /** Hủy yêu cầu đã gửi — bắt buộc nêu lý do — `POST /api/quotation-requests/{id}/cancel` */
  cancel(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/cancel", opts);
  }

  /** Tải chứng từ đã đính kèm — `GET /api/quotation-requests/{id}/documents/{documentId}` */
  document(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/quotation-requests/{id}/documents/{documentId}", opts);
  }

  /** Gỡ chứng từ khỏi phiếu — `DELETE /api/quotation-requests/{id}/documents/{documentId}` */
  removeDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/quotation-requests/{id}/documents/{documentId}", opts);
  }

  /** Lịch sử hoạt động của một yêu cầu báo giá — thời gian, người thực hiện, hành động, nội dung — `GET /api/quotation-requests/{id}/history` */
  history(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/quotation-requests/{id}/history", opts);
  }

  /** Khôi phục yêu cầu bị định giá từ chối — `POST /api/quotation-requests/{id}/restore` */
  restore(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/restore", opts);
  }

  /** Đính kèm chứng từ cho một dịch vụ của phiếu — PDF hoặc DOCX, tối đa 20MB — `POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents` */
  attachDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/quotation-requests/{id}/services/{serviceTypeCode}/documents", opts);
  }
}
