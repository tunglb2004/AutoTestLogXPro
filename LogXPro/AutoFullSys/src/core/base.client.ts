import { APIRequestContext, APIResponse } from '@playwright/test';
import { isPriceConfigurationWrite } from './price-configuration-guard';

export type FilePart = { name: string; mimeType: string; buffer: Buffer };
export type CallOptions = {
  /** null = không gửi header Authorization. */
  token?: string | null;
  /** Tắt lấy lại phiên cho case chủ động kiểm tra token bị từ chối. */
  retryUnauthorized?: boolean;
  params?: Record<string, string | number>;
  query?: Record<string, unknown>;
  json?: unknown;
  multipart?: Record<string, string | FilePart | FilePart[] | undefined>;
  rawBody?: string;
  /** Ghi đè phương thức (case gọi sai phương thức HTTP). */
  method?: string;
  headers?: Record<string, string>;
};

/** Hàm lấy lại token khi phiên của tài khoản test bị reset (hệ thống chỉ giữ 1 phiên/tài khoản). */
export type TokenRenewer = (rejectedToken: string) => Promise<string | null>;

/** Phần JSON trong request multipart. */
export function jsonPart(name: string, value: unknown): FilePart {
  return { name: `${name}.json`, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) };
}

/** Lớp gọi HTTP chung với bảo vệ cấu hình đầu mục giá ở chế độ chỉ đọc. */
export class HttpClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string,
    private readonly renew?: TokenRenewer,
    private readonly onPriceConfigurationWriteBlocked?: (reason: string) => void,
  ) {}

  url(api: string, opts: CallOptions = {}): string {
    const pathTpl = api.split(' ')[1];
    const p = pathTpl.replace(/\{(\w+)\}/g, (_m, key: string) => {
      const value = opts.params?.[key];
      if (value === undefined) throw new Error(`Thiếu path param "${key}" khi gọi ${api}`);
      return encodeURIComponent(String(value));
    });
    const url = new URL(this.baseUrl.replace(/\/$/, '') + p);
    for (const [key, value] of Object.entries(opts.query ?? {})) {
      if (value === undefined || value === null) continue;
      for (const v of Array.isArray(value) ? value : [value]) url.searchParams.append(key, String(v));
    }
    return url.toString();
  }

  async call(api: string, opts: CallOptions = {}): Promise<APIResponse> {
    let res = await this.send(api, opts);
    // Môi trường dev giới hạn tần suất đăng nhập và trả Retry-After (thường 900 giây).
    // Chờ đúng thời gian máy chủ yêu cầu rồi thử lại một lần, tránh biến rate-limit tạm thời
    // thành kết quả fail của case nghiệp vụ. Chia thành nhịp <= 60 giây để không giữ một
    // timer dài và vẫn cho phép tiến trình kết thúc bình thường khi bị dừng.
    if (res.status() === 429) {
      const seconds = Number(res.headers()['retry-after']);
      if (Number.isFinite(seconds) && seconds > 0) {
        let remaining = Math.min(seconds * 1_000, 15 * 60_000);
        while (remaining > 0) {
          const step = Math.min(remaining, 60_000);
          await new Promise((resolve) => setTimeout(resolve, step));
          remaining -= step;
        }
        res = await this.send(api, opts);
      }
    }
    // Phiên của tài khoản test bị reset: lấy token mới 1 lần rồi gửi lại. Token giả của case Authentication không được gửi lại.
    if (res.status() === 401 && opts.token && opts.retryUnauthorized !== false && this.renew) {
      const fresh = await this.renew(opts.token);
      if (fresh && fresh !== opts.token) return this.send(api, { ...opts, token: fresh });
    }
    return res;
  }

  private async send(api: string, opts: CallOptions): Promise<APIResponse> {
    const method = opts.method ?? api.split(' ')[0];
    const url = new URL(this.url(api, opts));
    if (isPriceConfigurationWrite(method, url)) {
      const reason = 'Cấu hình đầu mục giá chỉ đọc: đã chặn ' + method + ' ' + url.pathname + ' trước khi gửi API';
      this.onPriceConfigurationWriteBlocked?.(reason);
      throw new Error(reason);
    }
    const headers: Record<string, string> = { ...(opts.headers ?? {}) };
    if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
    const init: Parameters<APIRequestContext['fetch']>[1] = { method, headers, failOnStatusCode: false };
    if (opts.rawBody !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.data = opts.rawBody;
    } else if (opts.multipart) {
      const form = new FormData();
      for (const [k, v] of Object.entries(opts.multipart)) {
        if (v === undefined) continue;
        for (const part of Array.isArray(v) ? v : [v]) {
          if (typeof part === 'string') form.append(k, part);
          else form.append(k, new Blob([part.buffer], { type: part.mimeType }), part.name);
        }
      }
      init.multipart = form;
    } else if (opts.json !== undefined) {
      init.data = opts.json;
    }
    return this.request.fetch(url.toString(), init);
  }
}

type Recorded = { api: string; method: string; url: string; request: unknown; status: number; errorCode: string; message: string; response: string; at: string };
const SECRET_KEY = /pass(word)?|token|secret/i;

function mask(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(mask);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SECRET_KEY.test(k) ? '***' : mask(x)]));
  return v;
}

function describeRequest(opts: CallOptions): unknown {
  if (opts.rawBody !== undefined) return { rawBody: opts.rawBody };
  if (opts.multipart) {
    return Object.fromEntries(
      Object.entries(opts.multipart).map(([k, v]) => {
        if (v === undefined || typeof v === 'string') return [k, v];
        const parts = Array.isArray(v) ? v : [v];
        return [k, parts.map((p) => (p.mimeType === 'application/json' ? mask(JSON.parse(p.buffer.toString() || 'null')) : `${p.name} (${p.mimeType}, ${p.buffer.length} byte)`))];
      }),
    );
  }
  return { query: opts.query, body: opts.json === undefined ? null : mask(opts.json) };
}

/**
 * HttpClient ghi lại từng lời gọi (phương thức, URL, tóm tắt body, mã HTTP, errorCode, message, một phần body trả về)
 * để đính kèm thành evidence-api.json. Token và mật khẩu bị che trước khi ghi.
 */
export class RecordingHttpClient extends HttpClient {
  readonly records: Recorded[] = [];

  async call(api: string, opts: CallOptions = {}): Promise<APIResponse> {
    const res = await super.call(api, opts);
    let errorCode = '';
    let message = '';
    let response = '';
    const type = res.headers()['content-type'] ?? '';
    try {
      if (/json|text/.test(type) || !type) {
        const text = await res.text();
        response = text.replace(/"(accessToken|refreshToken)"\s*:\s*"[^"]*"/g, '"$1":"***"').slice(0, 3000);
        const b = text ? JSON.parse(text) : null;
        errorCode = b?.errorCode ?? '';
        message = b?.message ?? '';
      } else {
        response = `(file ${type}, ${(await res.body()).length} byte)`;
      }
    } catch {
      message = message || '(body không phải JSON)';
    }
    let url = api;
    try {
      url = this.url(api, opts);
    } catch {
      /* thiếu param: giữ mẫu đường dẫn */
    }
    this.records.push({ api, method: opts.method ?? api.split(' ')[0], url, request: describeRequest(opts), status: res.status(), errorCode, message, response, at: new Date().toISOString() });
    return res;
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

/** Lấy `data` của vỏ phản hồi. */
export async function data(res: APIResponse): Promise<any> {
  const b = await body(res);
  return b && typeof b === 'object' && 'data' in b ? b.data : b;
}

/** Danh sách item của response `{items, meta}` hoặc mảng thô. */
export function items(d: any): any[] {
  if (Array.isArray(d)) return d;
  return d?.items ?? d?.content ?? [];
}

/** Gọi API bắt buộc thành công khi chuẩn bị dữ liệu; lỗi thì báo rõ bước chuẩn bị nào hỏng (không phải lỗi của case). */
export async function must(res: APIResponse, what: string): Promise<any> {
  if (!res.ok()) throw new Error(`Chuẩn bị dữ liệu thất bại (${what}): HTTP ${res.status()} ${(await res.text()).slice(0, 400)}`);
  return data(res);
}

/** Lớp cha của client theo nhóm API: giữ HttpClient và cho gọi theo khóa "METHOD /đường/dẫn". */
export class ApiGroupClient {
  constructor(readonly http: HttpClient) {}

  call(api: string, opts: CallOptions = {}): Promise<APIResponse> {
    return this.http.call(api, opts);
  }
}
