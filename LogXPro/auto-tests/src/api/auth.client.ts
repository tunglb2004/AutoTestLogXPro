import { HttpClient, data } from './http.client';

export type TokenPair = { accessToken: string; refreshToken: string };
export type Me = { userId: string; email: string; roles: { code: string; name: string }[] };

/** Đăng nhập lấy token theo role. Không phải đối tượng test của bộ case. */
export class AuthClient {
  constructor(private readonly http: HttpClient) {}

  async login(tenantCode: string, email: string, password: string): Promise<TokenPair> {
    const res = await this.http.call('POST /api/auth/login', { json: { tenantCode, email, password } });
    if (!res.ok()) throw new Error(`Đăng nhập thất bại cho ${email}: HTTP ${res.status()} ${await res.text()}`);
    return (await data(res)) as TokenPair;
  }

  async me(accessToken: string): Promise<Me> {
    const res = await this.http.call('GET /api/auth/me', { token: accessToken });
    if (!res.ok()) throw new Error(`Không đọc được /api/auth/me: HTTP ${res.status()}`);
    return (await data(res)) as Me;
  }
}
