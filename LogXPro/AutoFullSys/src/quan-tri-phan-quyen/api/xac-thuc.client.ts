import { APIResponse } from '@playwright/test';
import { ApiGroupClient, CallOptions } from '../../core/base.client';

/** Khóa API dạng "METHOD /đường/dẫn" (hàm bọc để giữ kiểu chuỗi cố định). */
const api = <T extends string>(key: T): T => key;

/** Gọi các API của mục "Xác thực và phiên đăng nhập". Chỉ thao tác, không kiểm tra; assertion nằm trong file spec. */
export class XacThucClient extends ApiGroupClient {
  static readonly API = {
    login: api("POST /api/auth/login"),
    logout: api("POST /api/auth/logout"),
    me: api("GET /api/auth/me"),
    changePassword: api("POST /api/auth/password"),
    refresh: api("POST /api/auth/refresh"),
  } as const;

  /** Đăng nhập — đổi thông tin đăng nhập lấy access token và refresh token — `POST /api/auth/login` */
  login(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/auth/login", opts);
  }

  /** Đăng xuất — thu hồi refresh token — `POST /api/auth/logout` */
  logout(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/auth/logout", opts);
  }

  /** Thông tin tài khoản đang đăng nhập — `GET /api/auth/me` */
  me(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("GET /api/auth/me", opts);
  }

  /** Đổi mật khẩu của chính mình; mọi phiên đăng nhập khác kết thúc — `POST /api/auth/password` */
  changePassword(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/auth/password", opts);
  }

  /** Làm mới token — đổi refresh token lấy cặp mới, cặp cũ bị thu hồi — `POST /api/auth/refresh` */
  refresh(opts: CallOptions = {}): Promise<APIResponse> {
    return this.call("POST /api/auth/refresh", opts);
  }
}
