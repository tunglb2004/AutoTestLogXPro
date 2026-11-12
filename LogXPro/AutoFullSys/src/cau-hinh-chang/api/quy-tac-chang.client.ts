import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class QuyTacChangClient extends ApiGroupClient {
  static readonly API = {
    list: api("GET /api/leg-rules"),
    create: api("POST /api/leg-rules"),
    one: api("GET /api/leg-rules/{code}"),
    update: api("PUT /api/leg-rules/{code}"),
    delete: api("DELETE /api/leg-rules/{code}"),
    history: api("GET /api/leg-rules/{code}/history"),
    setStatus: api("PATCH /api/leg-rules/{code}/status"),
    simulate: api("POST /api/leg-rules/simulate"),
  } as const;

  /** Danh sách quy tắc chặng hành trình — `GET /api/leg-rules` */
  list(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/leg-rules", opts);
  }

  /** Tạo quy tắc — mã RUL-YYMM-xxx do hệ thống sinh khi lưu thành công — `POST /api/leg-rules` */
  create(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/leg-rules", opts);
  }

  /** Chi tiết một quy tắc chặng hành trình — `GET /api/leg-rules/{code}` */
  one(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/leg-rules/{code}", opts);
  }

  /** Sửa quy tắc — legs là mảng {id, name, serviceTypeCodes}, gửi lại id đang giữ — `PUT /api/leg-rules/{code}` */
  update(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PUT /api/leg-rules/{code}", opts);
  }

  /** Xóa vĩnh viễn quy tắc chưa có Phiếu dịch vụ nào sử dụng — `DELETE /api/leg-rules/{code}` */
  delete(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("DELETE /api/leg-rules/{code}", opts);
  }

  /** Lịch sử hoạt động của một quy tắc chặng hành trình, mới nhất trước — `GET /api/leg-rules/{code}/history` */
  history(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/leg-rules/{code}/history", opts);
  }

  /** Kích hoạt hoặc vô hiệu hóa quy tắc — `PATCH /api/leg-rules/{code}/status` */
  setStatus(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("PATCH /api/leg-rules/{code}/status", opts);
  }

  /** Mô phỏng cấu trúc chặng — không lưu dữ liệu — `POST /api/leg-rules/simulate` */
  simulate(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/leg-rules/simulate", opts);
  }
}
