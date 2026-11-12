import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Giá mua định mức (SBP)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class GiaMuaDinhMucClient extends ApiGroupClient {
  static readonly API = {
    groups: api("GET /api/standard-buying-prices/groups"),
    list: api("GET /api/standard-buying-prices"),
    detail: api("GET /api/standard-buying-prices/{id}"),
    updateBenchmark: api("PUT /api/standard-buying-prices/{id}/benchmark"),
    updateBenchmarks: api("PUT /api/standard-buying-prices/benchmarks"),
    contractors: api("GET /api/standard-buying-prices/{id}/contractors"),
    convertAt: api("PUT /api/standard-buying-prices/{id}/conversion"),
    history: api("GET /api/standard-buying-prices/{id}/history"),
  } as const;

  /** Đầu mục giá của một phân hệ, kèm số dòng định mức — `GET /api/standard-buying-prices/groups` */
  groups(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/standard-buying-prices/groups", opts);
  }

  /** Dòng giá định mức của một đầu mục — tìm theo mã, lọc theo thuộc tính, đơn vị tính và trạng thái giá mua — `GET /api/standard-buying-prices` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/standard-buying-prices", opts);
  }

  /** Chi tiết dòng định mức — mở ra là tắt cảnh báo giá nhà thầu đã đổi — `GET /api/standard-buying-prices/{id}` */
  detail(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/standard-buying-prices/{id}", opts);
  }

  /** Cập nhật giá mua định mức — có hiệu lực ngay, ghi vào lịch sử hoạt động — `PUT /api/standard-buying-prices/{id}/benchmark` */
  updateBenchmark(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/standard-buying-prices/{id}/benchmark", opts);
  }

  /** Nhập hàng loạt giá mua định mức — có hiệu lực ngay, ghi lịch sử từng dòng — `PUT /api/standard-buying-prices/benchmarks` */
  updateBenchmarks(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/standard-buying-prices/benchmarks", opts);
  }

  /** Bảng giá nhà thầu của một dòng định mức — quy đổi theo tỷ giá VCB hiện tại, không tắt cảnh báo — `GET /api/standard-buying-prices/{id}/contractors` */
  contractors(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/standard-buying-prices/{id}/contractors", opts);
  }

  /** Chọn tỷ giá để quy đổi giá nhà thầu — không đổi giá định mức — `PUT /api/standard-buying-prices/{id}/conversion` */
  convertAt(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/standard-buying-prices/{id}/conversion", opts);
  }

  /** Lịch sử hoạt động của một dòng định mức, mới nhất trước — `GET /api/standard-buying-prices/{id}/history` */
  history(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/standard-buying-prices/{id}/history", opts);
  }
}
