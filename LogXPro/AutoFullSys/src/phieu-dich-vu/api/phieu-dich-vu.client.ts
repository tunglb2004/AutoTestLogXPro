import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Phiếu dịch vụ (Khối 1)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class PhieuDichVuClient extends ApiGroupClient {
  static readonly API = {
    selectableCustomers: api("GET /api/service-orders/selectable-customers"),
    statuses: api("GET /api/service-orders/statuses"),
    list: api("GET /api/service-orders"),
    create: api("POST /api/service-orders"),
    detail: api("GET /api/service-orders/{id}"),
    update: api("PUT /api/service-orders/{id}"),
    delete: api("DELETE /api/service-orders/{id}"),
    submit: api("POST /api/service-orders/{id}/submit"),
    cancel: api("POST /api/service-orders/{id}/cancel"),
    restore: api("POST /api/service-orders/{id}/restore"),
    revenue: api("GET /api/service-orders/{id}/revenue"),
    applyFxRate: api("PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}"),
    editRevenueLines: api("PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines"),
    costRevenueSummary: api("GET /api/service-orders/{id}/cost-revenue-summary"),
    revenueConfirmation: api("GET /api/service-orders/{id}/revenue-confirmation"),
    confirmRevenue: api("POST /api/service-orders/{id}/revenue-confirmation"),
    history: api("GET /api/service-orders/{id}/history"),
    downloadDocument: api("GET /api/service-orders/{id}/documents/{documentId}"),
    removeDocument: api("DELETE /api/service-orders/{id}/documents/{documentId}"),
    documents: api("GET /api/service-orders/{id}/services/{serviceTypeCode}/documents"),
    attachDocument: api("POST /api/service-orders/{id}/services/{serviceTypeCode}/documents"),
    downloadTowerDocument: api("GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}"),
    downloadVehicleDocument: api("GET /api/service-orders/{id}/vehicle-documents/{documentId}"),
    removeVehicleDocument: api("DELETE /api/service-orders/{id}/vehicle-documents/{documentId}"),
    listVehicleDocuments: api("GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents"),
    attachVehicleDocument: api("POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents"),
    list2: api("GET /api/service-orders/{id}/scope-requests"),
    respond: api("POST /api/service-orders/{id}/scope-requests/{requestId}/respond"),
  } as const;

  /** Khách hàng có thể lập phiếu — kèm hợp đồng và báo giá đang hiệu lực — `GET /api/service-orders/selectable-customers` */
  selectableCustomers(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/selectable-customers", opts);
  }

  /** Danh sách trạng thái kèm nhãn tiếng Việt — nguồn của bộ lọc Trạng thái — `GET /api/service-orders/statuses` */
  statuses(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/statuses", opts);
  }

  /** Danh sách phiếu dịch vụ — tìm theo mã ORD hoặc biển số xe; lọc nhiều khách hàng và trạng thái (HOẶC), nhiều dịch vụ (VÀ), BSX nhận hàng, BSX giao hàng, khoảng ngày tạo — `GET /api/service-orders` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders", opts);
  }

  /** Tạo phiếu dịch vụ — cả hai đều sinh mã ORDYYMMDD-XXX; submit=false lưu nháp không báo K3, submit=true gửi sang điều phối — `POST /api/service-orders` */
  create(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/service-orders", opts);
  }

  /** Chi tiết phiếu dịch vụ kèm danh sách thao tác trạng thái cho phép — `GET /api/service-orders/{id}` */
  detail(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}", opts);
  }

  /** Sửa phiếu dịch vụ — khả dụng khi Nháp, Tạo mới, Từ chối hoặc Đã hủy — `PUT /api/service-orders/{id}` */
  update(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/service-orders/{id}", opts);
  }

  /** Xóa vĩnh viễn phiếu dịch vụ — chỉ khi đang ở trạng thái Nháp — `DELETE /api/service-orders/{id}` */
  delete(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/service-orders/{id}", opts);
  }

  /** Gửi phiếu — giữ mã ORDYYMMDD-XXX cấp lúc lưu nháp và chuyển sang Tạo mới — `POST /api/service-orders/{id}/submit` */
  submit(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/service-orders/{id}/submit", opts);
  }

  /** Hủy phiếu dịch vụ — bắt buộc nhập lý do — `POST /api/service-orders/{id}/cancel` */
  cancel(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/service-orders/{id}/cancel", opts);
  }

  /** Khôi phục yêu cầu — chuyển phiếu về Tạo mới và gửi lại cho điều phối — `POST /api/service-orders/{id}/restore` */
  restore(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/service-orders/{id}/restore", opts);
  }

  /** Bảng giá doanh thu theo từng dịch vụ, trích từ Báo giá đang áp dụng — `GET /api/service-orders/{id}/revenue` */
  revenue(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/revenue", opts);
  }

  /** Áp dụng tỷ giá quy đổi doanh thu cho một dịch vụ — trả lại bảng doanh thu đã tính lại — `PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}` */
  applyFxRate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/service-orders/{id}/revenue/fx-rates/{serviceTypeCode}", opts);
  }

  /** Chỉnh sửa ĐVT, SL, Đơn giá các dòng Phát sinh của bảng doanh thu một dịch vụ — trả lại bảng doanh thu đã tính lại — `PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines` */
  editRevenueLines(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/service-orders/{id}/revenue/{serviceTypeCode}/lines", opts);
  }

  /** Tổng hợp chi phí doanh thu của phiếu — theo chặng và dịch vụ, doanh thu gồm VAT — `GET /api/service-orders/{id}/cost-revenue-summary` */
  costRevenueSummary(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/cost-revenue-summary", opts);
  }

  /** Đối soát doanh thu trước khi xác nhận — doanh thu từng dịch vụ (VND, trước/sau VAT) và các lý do chưa xác nhận được — `GET /api/service-orders/{id}/revenue-confirmation` */
  revenueConfirmation(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/revenue-confirmation", opts);
  }

  /** Xác nhận doanh thu — phiếu chuyển sang Hoàn thành, chốt bảng doanh thu và khóa sổ — `POST /api/service-orders/{id}/revenue-confirmation` */
  confirmRevenue(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/service-orders/{id}/revenue-confirmation", opts);
  }

  /** Lịch sử hoạt động của phiếu — mới nhất lên đầu — `GET /api/service-orders/{id}/history` */
  history(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/history", opts);
  }

  /** Tải một chứng từ đã đính kèm — `GET /api/service-orders/{id}/documents/{documentId}` */
  downloadDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/documents/{documentId}", opts);
  }

  /** Gỡ một chứng từ khỏi phiếu — `DELETE /api/service-orders/{id}/documents/{documentId}` */
  removeDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/service-orders/{id}/documents/{documentId}", opts);
  }

  /** Danh sách chứng từ đã đính kèm của một dịch vụ — `GET /api/service-orders/{id}/services/{serviceTypeCode}/documents` */
  documents(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/services/{serviceTypeCode}/documents", opts);
  }

  /** Đính kèm chứng từ cho một dịch vụ — PDF, JPG, PNG, DOCX hoặc XLSX, tối đa 10MB — `POST /api/service-orders/{id}/services/{serviceTypeCode}/documents` */
  attachDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/service-orders/{id}/services/{serviceTypeCode}/documents", opts);
  }

  /** Tải một chứng từ Tháp điều phối đã đính kèm ở Thông tin thực tế — `GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}` */
  downloadTowerDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/services/{serviceTypeCode}/tower-documents/{documentId}", opts);
  }

  /** Tải một số thông hành đã đính kèm — `GET /api/service-orders/{id}/vehicle-documents/{documentId}` */
  downloadVehicleDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/vehicle-documents/{documentId}", opts);
  }

  /** Gỡ một số thông hành khỏi xe — `DELETE /api/service-orders/{id}/vehicle-documents/{documentId}` */
  removeVehicleDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/service-orders/{id}/vehicle-documents/{documentId}", opts);
  }

  /** Danh sách số thông hành đã đính kèm của một xe — `GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents` */
  listVehicleDocuments(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents", opts);
  }

  /** Đính kèm số thông hành cho một xe — PDF hoặc DOCX, tối đa 20MB — `POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents` */
  attachVehicleDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/service-orders/{id}/vehicles/{role}/{pairIndex}/documents", opts);
  }

  /** Các đề xuất điều chỉnh phạm vi của phiếu — `GET /api/service-orders/{id}/scope-requests` */
  list2(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/scope-requests", opts);
  }

  /** Đồng ý / từ chối đề xuất điều chỉnh phạm vi — không tự thay đổi dịch vụ của phiếu — `POST /api/service-orders/{id}/scope-requests/{requestId}/respond` */
  respond(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/service-orders/{id}/scope-requests/{requestId}/respond", opts);
  }
}
