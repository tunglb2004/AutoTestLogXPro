import { HttpClient, data } from './base.client';

export type TokenPair = { accessToken: string; refreshToken: string; expiresInSeconds?: number; passwordChangeRequired?: boolean };
export type Me = { userId: string; email: string; roles: { code: string; name: string }[]; permissions?: string[] } & Record<string, unknown>;

/** Đăng nhập, làm mới token, đọc thông tin người dùng hiện tại. Dùng cho bước chuẩn bị; case AUTH gọi qua xac-thuc.client. */
export class AuthClient {
  constructor(private readonly http: HttpClient) {}

  async login(tenantCode: string, email: string, password: string): Promise<TokenPair> {
    const res = await this.http.call('POST /api/auth/login', { json: { tenantCode, email, password } });
    if (!res.ok()) throw new Error(`Đăng nhập thất bại cho ${email}: HTTP ${res.status()} ${(await res.text()).slice(0, 300)}`);
    return (await data(res)) as TokenPair;
  }

  async me(accessToken: string): Promise<Me> {
    const res = await this.http.call('GET /api/auth/me', { token: accessToken });
    if (!res.ok()) throw new Error(`Không đọc được /api/auth/me: HTTP ${res.status()}`);
    return (await data(res)) as Me;
  }
}
