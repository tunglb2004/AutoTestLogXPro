import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Màn Chi phí – Doanh thu (báo cáo quản trị)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class BaoCaoChiPhiDoanhThuClient extends ApiGroupClient {
  static readonly API = {
    list: api("GET /api/cost-revenue/orders"),
    stats: api("GET /api/cost-revenue/orders/stats"),
    customerOptions: api("GET /api/cost-revenue/customer-options"),
    creatorOptions: api("GET /api/cost-revenue/creator-options"),
    export: api("POST /api/cost-revenue/exports"),
    exportJob: api("GET /api/cost-revenue/exports/{id}"),
    exportFile: api("GET /api/cost-revenue/exports/{id}/file"),
  } as const;

  /** Danh sách phiếu Đã thực hiện / Hoàn thành kèm doanh thu, chi phí, lợi nhuận % — tìm theo mã, lọc nâng cao, sắp xếp một cột, phân trang — `GET /api/cost-revenue/orders` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/cost-revenue/orders", opts);
  }

  /** 4 card: Tổng doanh thu, Tổng chi phí, Tổng lợi nhuận gộp, Biên lợi nhuận — tính trên toàn bộ tập đã lọc, cùng tham số với danh sách — `GET /api/cost-revenue/orders/stats` */
  stats(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/cost-revenue/orders/stats", opts);
  }

  /** Nguồn bộ lọc Khách hàng — khách có phiếu trong danh sách, tìm theo tên hoặc MST — `GET /api/cost-revenue/customer-options` */
  customerOptions(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/cost-revenue/customer-options", opts);
  }

  /** Nguồn bộ lọc Người tạo — người đã tạo phiếu trong danh sách, tìm theo họ tên hoặc tài khoản — `GET /api/cost-revenue/creator-options` */
  creatorOptions(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/cost-revenue/creator-options", opts);
  }

  /** Xuất Excel — phiếu đã chọn hoặc toàn bộ theo bộ lọc; ≤ 5.000 phiếu trả file, > 5.000 phiếu trả 202 và chạy nền; 400 nếu không có dữ liệu — `POST /api/cost-revenue/exports` */
  export(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/cost-revenue/exports", opts);
  }

  /** Trạng thái một lượt xuất chạy nền — chỉ người yêu cầu — `GET /api/cost-revenue/exports/{id}` */
  exportJob(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/cost-revenue/exports/{id}", opts);
  }

  /** Tải file của lượt xuất chạy nền — chỉ người yêu cầu; 409 nếu chưa xong hoặc đã quá 7 ngày — `GET /api/cost-revenue/exports/{id}/file` */
  exportFile(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/cost-revenue/exports/{id}/file", opts);
  }
}
