import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Tháp điều phối — dịch vụ con (điều phối, chi phí, thông tin thực tế)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class DichVuConClient extends ApiGroupClient {
  static readonly API = {
    coordinationOptions: api("GET /api/k3/service-orders/{id}/services/{type}/coordination-options"),
    coordinate: api("PUT /api/k3/service-orders/{id}/services/{type}/coordination"),
    contractors: api("GET /api/k3/service-orders/{id}/services/{type}/contractors"),
    start: api("POST /api/k3/service-orders/{id}/services/{type}/start"),
    costs: api("GET /api/k3/service-orders/{id}/services/{type}/costs"),
    costItems: api("GET /api/k3/service-orders/{id}/services/{type}/cost-items"),
    varianceItems: api("GET /api/k3/service-orders/{id}/services/{type}/variance-items"),
    addCost: api("POST /api/k3/service-orders/{id}/services/{type}/costs"),
    editCosts: api("PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}"),
    removeCost: api("DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}"),
    currentPrice: api("GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price"),
    updateDeclaration: api("PUT /api/k3/service-orders/{id}/services/{type}/declaration"),
    actuals: api("GET /api/k3/service-orders/{id}/services/{type}/actuals"),
    saveActuals: api("PUT /api/k3/service-orders/{id}/services/{type}/actuals"),
    completionCheck: api("GET /api/k3/service-orders/{id}/services/{type}/completion-check"),
    complete: api("POST /api/k3/service-orders/{id}/services/{type}/complete"),
    documents: api("GET /api/k3/service-orders/{id}/services/{type}/documents"),
    attach: api("POST /api/k3/service-orders/{id}/services/{type}/documents"),
    download: api("GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}"),
    removeDocument: api("DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}"),
  } as const;

  /** Nhà thầu và đầu mục cho modal Điều phối nhà thầu — theo bảng giá của phiếu — `GET /api/k3/service-orders/{id}/services/{type}/coordination-options` */
  coordinationOptions(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/coordination-options", opts);
  }

  /** Xác nhận điều phối / sửa gán nhà thầu cho dịch vụ — `PUT /api/k3/service-orders/{id}/services/{type}/coordination` */
  coordinate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/k3/service-orders/{id}/services/{type}/coordination", opts);
  }

  /** Thông tin nhà thầu đã điều phối — đầu mối liên hệ chính của từng nhà thầu, chỉ đọc — `GET /api/k3/service-orders/{id}/services/{type}/contractors` */
  contractors(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/contractors", opts);
  }

  /** Bắt đầu thực hiện dịch vụ — chỉ cần đã điều phối nhà thầu, không kiểm thông tin thực tế; không chờ Chặng hay dịch vụ nào trước nó — `POST /api/k3/service-orders/{id}/services/{type}/start` */
  start(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/k3/service-orders/{id}/services/{type}/start", opts);
  }

  /** Tab Chi phí của dịch vụ — khối theo nhà thầu, VAT, quy đổi VNĐ — `GET /api/k3/service-orders/{id}/services/{type}/costs` */
  costs(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/costs", opts);
  }

  /** Phụ phí từ Giá mua đầu vào của nhà thầu — đầu mục Phụ phí, dòng giá đã duyệt, khớp bộ thông tin dịch vụ của phiếu như modal Điều phối nhà thầu — `GET /api/k3/service-orders/{id}/services/{type}/cost-items` */
  costItems(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/cost-items", opts);
  }

  /** Đầu mục chi phí phát sinh của dịch vụ — nguồn dropdown Thêm chi phí phát sinh — `GET /api/k3/service-orders/{id}/services/{type}/variance-items` */
  varianceItems(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/variance-items", opts);
  }

  /** Thêm phụ phí / chi phí phát sinh vào khối nhà thầu — không qua duyệt — `POST /api/k3/service-orders/{id}/services/{type}/costs` */
  addCost(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/k3/service-orders/{id}/services/{type}/costs", opts);
  }

  /** Chỉnh sửa chi phí của một khối nhà thầu — ĐVT, số lượng, chi phí, VAT, tiền tệ — `PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}` */
  editCosts(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/k3/service-orders/{id}/services/{type}/costs/contractors/{contractorId}", opts);
  }

  /** Xóa dòng Phụ phí / Chi phí phát sinh — chi phí gốc và phát sinh đã K4 duyệt không xóa được — `DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}` */
  removeCost(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}", opts);
  }

  /** Làm mới giá — đơn giá hiện tại của đúng dòng giá mua đã gắn với dòng chi phí cố định, không ghi gì; bấm Lưu của modal Chỉnh sửa chi phí mới ghi nhận — `GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price` */
  currentPrice(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/costs/{costLineId}/current-price", opts);
  }

  /** Đã tắt — Thông tin khai báo chỉ đọc, sửa ở Thông tin thực tế — `PUT /api/k3/service-orders/{id}/services/{type}/declaration` */
  updateDeclaration(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/k3/service-orders/{id}/services/{type}/declaration", opts);
  }

  /** Thông tin thực tế của dịch vụ, kèm chứng từ và trạng thái khóa — `GET /api/k3/service-orders/{id}/services/{type}/actuals` */
  actuals(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/actuals", opts);
  }

  /** Lưu thông tin thực tế — lưu được khi chưa đủ, chỉ kiểm định dạng — `PUT /api/k3/service-orders/{id}/services/{type}/actuals` */
  saveActuals(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/k3/service-orders/{id}/services/{type}/actuals", opts);
  }

  /** Kiểm trường thông tin thực tế bắt buộc trước khi Hoàn thành dịch vụ — `GET /api/k3/service-orders/{id}/services/{type}/completion-check` */
  completionCheck(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/completion-check", opts);
  }

  /** Hoàn thành dịch vụ — đòi đủ trường thông tin thực tế bắt buộc (409 nếu thiếu); khóa thông tin thực tế và chi phí; phiếu tự chốt khi mọi dịch vụ xong — `POST /api/k3/service-orders/{id}/services/{type}/complete` */
  complete(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/k3/service-orders/{id}/services/{type}/complete", opts);
  }

  /** Danh sách chứng từ của một khối — `GET /api/k3/service-orders/{id}/services/{type}/documents` */
  documents(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/documents", opts);
  }

  /** Đính kèm chứng từ thực tế, ảnh hư hỏng, chứng từ dòng chi phí hoặc chứng từ kèm theo xe; chứng từ dòng chi phí nhận nhiều file (tổng tối đa 20MB một lần), file không hợp lệ bị bỏ qua — `POST /api/k3/service-orders/{id}/services/{type}/documents` */
  attach(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/k3/service-orders/{id}/services/{type}/documents", opts);
  }

  /** Tải một chứng từ về — `GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}` */
  download(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/k3/service-orders/{id}/services/{type}/documents/{documentId}", opts);
  }

  /** Gỡ chứng từ — đánh dấu đã gỡ, tệp gốc không bị xóa — `DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}` */
  removeDocument(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/k3/service-orders/{id}/services/{type}/documents/{documentId}", opts);
  }
}
