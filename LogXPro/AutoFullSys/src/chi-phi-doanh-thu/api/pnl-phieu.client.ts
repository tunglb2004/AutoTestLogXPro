import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class PnlPhieuClient extends ApiGroupClient {
  static readonly API = {
    pnl: api("GET /api/service-orders/{id}/pnl"),
    export: api("GET /api/service-orders/{id}/pnl/export"),
    fxRate: api("GET /api/service-orders/{id}/pnl/fx-rate"),
    applyFxRate: api("PUT /api/service-orders/{id}/pnl/fx-rate"),
  } as const;

  /** Tổng hợp Chi phí – Doanh thu của phiếu: KPI và bảng Chặng → Dịch vụ → Đầu mục, VND trước VAT — `GET /api/service-orders/{id}/pnl` */
  pnl(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/pnl", opts);
  }

  /** Xuất Excel bảng Chi phí – Doanh thu của phiếu (template 2.1.5); 409 nếu phiếu chưa có dữ liệu — `GET /api/service-orders/{id}/pnl/export` */
  export(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/pnl/export", opts);
  }

  /** Tỷ giá quy đổi USD, CNY → VND đang áp dụng cho phiếu — `GET /api/service-orders/{id}/pnl/fx-rate` */
  fxRate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/service-orders/{id}/pnl/fx-rate", opts);
  }

  /** Áp dụng tỷ giá quy đổi cho phiếu — nguồn Vietcombank hoặc nhập tay — `PUT /api/service-orders/{id}/pnl/fx-rate` */
  applyFxRate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/service-orders/{id}/pnl/fx-rate", opts);
  }
}
