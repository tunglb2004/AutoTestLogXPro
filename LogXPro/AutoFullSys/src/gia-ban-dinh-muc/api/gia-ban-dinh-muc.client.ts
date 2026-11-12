import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Giá bán định mức (SSP)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class GiaBanDinhMucClient extends ApiGroupClient {
  static readonly API = {
    groups: api("GET /api/standard-selling-prices/groups"),
    list: api("GET /api/standard-selling-prices"),
    detail: api("GET /api/standard-selling-prices/{id}"),
    updateSellingPrice: api("PUT /api/standard-selling-prices/{id}/selling-price"),
    updateSellingPrices: api("PUT /api/standard-selling-prices/selling-prices"),
    acknowledge: api("POST /api/standard-selling-prices/{id}/acknowledgement"),
    history: api("GET /api/standard-selling-prices/{id}/history"),
  } as const;

  /** Đầu mục giá của một phân hệ, kèm số dòng giá bán định mức — `GET /api/standard-selling-prices/groups` */
  groups(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/standard-selling-prices/groups", opts);
  }

  /** Dòng giá bán định mức của một đầu mục — tìm, lọc, sắp xếp — `GET /api/standard-selling-prices` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/standard-selling-prices", opts);
  }

  /** Chi tiết dòng giá bán định mức — `GET /api/standard-selling-prices/{id}` */
  detail(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/standard-selling-prices/{id}", opts);
  }

  /** Cập nhật giá bán định mức — có hiệu lực ngay, ghi vào lịch sử hoạt động — `PUT /api/standard-selling-prices/{id}/selling-price` */
  updateSellingPrice(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/standard-selling-prices/{id}/selling-price", opts);
  }

  /** Nhập hàng loạt giá bán định mức — có hiệu lực ngay, ghi lịch sử từng dòng — `PUT /api/standard-selling-prices/selling-prices` */
  updateSellingPrices(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/standard-selling-prices/selling-prices", opts);
  }

  /** Đã giải quyết — tắt cảnh báo giá mua đã đổi, không đổi giá — `POST /api/standard-selling-prices/{id}/acknowledgement` */
  acknowledge(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/standard-selling-prices/{id}/acknowledgement", opts);
  }

  /** Lịch sử hoạt động của một dòng giá bán, mới nhất trước — `GET /api/standard-selling-prices/{id}/history` */
  history(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/standard-selling-prices/{id}/history", opts);
  }
}
