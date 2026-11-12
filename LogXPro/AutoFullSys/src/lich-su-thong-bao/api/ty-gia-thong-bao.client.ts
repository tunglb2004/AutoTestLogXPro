import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Tỷ giá Vietcombank và thông báo". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class TyGiaThongBaoClient extends ApiGroupClient {
  static readonly API = {
    rate: api("GET /api/exchange-rates/{currency}"),
    mine: api("GET /api/notifications"),
    unreadCount: api("GET /api/notifications/unread-count"),
    markRead: api("POST /api/notifications/{id}/read"),
  } as const;

  /** Tỷ giá chuyển khoản mới nhất của Vietcombank cho một đơn vị tiền tệ — `GET /api/exchange-rates/{currency}` */
  rate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/exchange-rates/{currency}", opts);
  }

  /** Thông báo của chính mình, mới nhất trước — `GET /api/notifications` */
  mine(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/notifications", opts);
  }

  /** Số thông báo chưa đọc — con số trên chuông — `GET /api/notifications/unread-count` */
  unreadCount(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/notifications/unread-count", opts);
  }

  /** Đánh dấu đã đọc — `POST /api/notifications/{id}/read` */
  markRead(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/notifications/{id}/read", opts);
  }
}
