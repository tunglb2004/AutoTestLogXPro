import { APIRequestContext, APIResponse } from '@playwright/test';

export type FilePart = { name: string; mimeType: string; buffer: Buffer };
export type CallOptions = {
  /** null = không gửi header Authorization. */
  token?: string | null;
  params?: Record<string, string | number>;
  query?: Record<string, unknown>;
  json?: unknown;
  multipart?: Record<string, string | FilePart | FilePart[] | undefined>;
  rawBody?: string;
  method?: string;
};

/** Phần JSON trong request multipart (Spring @RequestPart). */
export function jsonPart(name: string, value: unknown): FilePart {
  return { name: `${name}.json`, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) };
}

/**
 * Hàm lấy lại token khi phiên của tài khoản test bị reset: nhận token đã bị từ chối,
 * trả token mới nếu đó là token của một tài khoản test, hoặc null nếu không xử lý (token giả, token hỏng của case Authentication).
 */
export type TokenRenewer = (rejectedToken: string) => Promise<string | null>;

/** Lớp gọi HTTP chung. Chỉ gọi và trả response, không tự kiểm tra. */
export class HttpClient {
  constructor(private readonly request: APIRequestContext, private readonly baseUrl: string, private readonly renew?: TokenRenewer) {}

  url(api: string, opts: CallOptions = {}): string {
    const pathTpl = api.split(' ')[1];
    const path = pathTpl.replace(/\{(\w+)\}/g, (_m, key: string) => {
      const value = opts.params?.[key];
      if (value === undefined) throw new Error(`Thiếu path param "${key}" khi gọi ${api}`);
      return encodeURIComponent(String(value));
    });
    const url = new URL(this.baseUrl.replace(/\/$/, '') + path);
    for (const [key, value] of Object.entries(opts.query ?? {})) {
      if (value === undefined || value === null) continue;
      for (const v of Array.isArray(value) ? value : [value]) url.searchParams.append(key, String(v));
    }
    return url.toString();
  }

  async call(api: string, opts: CallOptions = {}): Promise<APIResponse> {
    const res = await this.send(api, opts);
    // Phiên của tài khoản test bị reset (đăng nhập nơi khác, hết hạn): lấy token mới 1 lần rồi gửi lại.
    // Chỉ áp dụng cho token của tài khoản test; token giả, token hỏng của case Authentication không được gửi lại.
    if (res.status() === 401 && opts.token && this.renew) {
      const fresh = await this.renew(opts.token);
      if (fresh && fresh !== opts.token) return this.send(api, { ...opts, token: fresh });
    }
    return res;
  }

  private async send(api: string, opts: CallOptions): Promise<APIResponse> {
    const method = opts.method ?? api.split(' ')[0];
    const headers: Record<string, string> = {};
    if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
    const init: Parameters<APIRequestContext['fetch']>[1] = { method, headers, failOnStatusCode: false };
    if (opts.rawBody !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.data = opts.rawBody;
    } else if (opts.multipart) {
      const mp: Record<string, string | { name: string; mimeType: string; buffer: Buffer }> = {};
      const extra: [string, FilePart][] = [];
      for (const [k, v] of Object.entries(opts.multipart)) {
        if (v === undefined) continue;
        if (Array.isArray(v)) v.forEach((f) => extra.push([k, f]));
        else mp[k] = v;
      }
      if (extra.length) {
        // Nhiều file cùng tên trường: dùng FormData để giữ đủ phần.
        const form = new FormData();
        for (const [k, v] of Object.entries(mp)) {
          if (typeof v === 'string') form.append(k, v);
          else form.append(k, new Blob([v.buffer], { type: v.mimeType }), v.name);
        }
        for (const [k, f] of extra) form.append(k, new Blob([f.buffer], { type: f.mimeType }), f.name);
        init.multipart = form;
      } else {
        init.multipart = mp;
      }
    } else if (opts.json !== undefined) {
      init.data = opts.json;
    }
    return this.request.fetch(this.url(api, opts), init);
  }
}

/** Đọc body JSON; trả chuỗi thô nếu không phải JSON. */
export async function body(res: APIResponse): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Lấy `data` của wrapper thành công. */
export async function data(res: APIResponse): Promise<any> {
  const b = await body(res);
  return b && typeof b === 'object' && 'data' in b ? b.data : b;
}

/** Danh sách item của response phân trang `{items, meta}` hoặc mảng thô. */
export function items(d: any): any[] {
  if (Array.isArray(d)) return d;
  return d?.items ?? d?.content ?? [];
}
