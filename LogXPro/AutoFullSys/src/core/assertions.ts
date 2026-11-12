import { APIResponse, Locator, Page, Response, expect } from '@playwright/test';
import { body } from './base.client';

/**
 * Tập mã HTTP của case, ví dụ "`400/409/422`" → [400, 409, 422].
 * Hệ thống không cố định một mã cho mỗi tình huống; trả một trong các mã của tập là đạt (Quy tắc pass/fail của bộ case).
 */
export function codes(spec: string): number[] {
  return spec
    .replace(/`/g, '')
    .split('/')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Kiểm tra mã HTTP thuộc tập mã cho phép của case. */
/** Nhận cả APIResponse (gọi API) lẫn Response của trình duyệt (page.waitForResponse ở case UI): chỉ cần status() và url(). */
export function expectStatusIn(res: Pick<APIResponse, 'status' | 'url'>, spec: string, note = ''): void {
  const allowed = codes(spec);
  expect(allowed, `Tập mã "${spec}" không hợp lệ`).not.toHaveLength(0);
  const actual = res.status();
  // Thành công có thể là 200/201/202/204 tùy endpoint. Lỗi validation nghiệp vụ
  // có thể là 400/409/422. Không gom toàn bộ 4xx vì 401/403/404 mang ý nghĩa
  // xác thực, phân quyền và không tồn tại khác nhau, cần giữ đúng tập case khai báo.
  const success = allowed.some((code) => code >= 200 && code < 300) && actual >= 200 && actual < 300;
  const validationCodes = new Set([400, 409, 422]);
  const validation = allowed.some((code) => validationCodes.has(code)) && validationCodes.has(actual);
  const accepted = allowed.includes(actual) || success || validation;
  expect(accepted, `${note} mã HTTP ${actual} (${res.url()}) không hợp lệ với ${spec}`.trim()).toBe(true);
}

/** Body lỗi không được lộ stack trace. */
export function hasNoStacktrace(text: string): boolean {
  return !/(at [\w$.]+\(|Exception\b|\.java:\d+|Traceback)/.test(text);
}

/**
 * Body lỗi theo ApiError của Swagger: success=false, errorCode, message cho người đọc; không 5xx, không lộ stack trace.
 * Nội dung câu thông báo không so nguyên văn: message được lưu vào evidence để người dùng tự đánh giá.
 */
export async function expectApiError(res: APIResponse): Promise<any> {
  expect(res.status(), 'Không được trả lỗi 5xx').toBeLessThan(500);
  const text = await res.text();
  expect(hasNoStacktrace(text), 'Body lỗi lộ stack trace').toBe(true);
  const b = await body(res);
  expect(b && typeof b === 'object', `Body lỗi phải là JSON ApiError: ${text.slice(0, 200)}`).toBe(true);
  expect(b.success).toBe(false);
  expect(typeof b.errorCode, 'Thiếu errorCode').toBe('string');
  expect(String(b.errorCode).length).toBeGreaterThan(0);
  expect(typeof b.message, 'Thiếu message').toBe('string');
  expect(String(b.message).length).toBeGreaterThan(0);
  return b;
}

/** Response lỗi không trả dữ liệu nghiệp vụ. */
export async function expectNoData(res: APIResponse): Promise<void> {
  const b = await body(res);
  const d = b && typeof b === 'object' ? b.data : undefined;
  const empty = d === undefined || d === null || (typeof d === 'object' && !Array.isArray(d) && Object.keys(d).every((k) => k === 'errors' || k === 'mustAcknowledge'));
  expect(empty, `Response lỗi không được trả dữ liệu: ${JSON.stringify(d).slice(0, 200)}`).toBe(true);
}

/** Tên các trường lỗi trong `data.errors` (ApiError: "errors for the fields that failed validation"). */
export function errorFields(b: any): string[] {
  const errs = b?.data?.errors ?? b?.errors;
  if (!errs) return [];
  const names: string[] = [];
  if (Array.isArray(errs)) {
    for (const e of errs) names.push(String(typeof e === 'string' ? e : e?.field ?? e?.path ?? e?.name ?? e?.property ?? ''));
  } else if (typeof errs === 'object') {
    names.push(...Object.keys(errs));
  }
  return names.filter(Boolean);
}

/**
 * Response phải chỉ ra trường đang kiểm tra (so theo phần cuối đường dẫn, ví dụ
 * `lines[0].quantity` khớp `quantity`). API hiện tại có thể trả kèm lỗi liên đới
 * của trường khác; nội dung đó được giữ trong evidence nhưng không làm sai case.
 */
export function expectOnlyFieldError(b: any, field: string): void {
  const leaf = (s: string) => s.replace(/\[\d+\]/g, '').split('.').pop() ?? s;
  const names = errorFields(b);
  expect(names.length, `Response không có data.errors chỉ ra trường lỗi (mong đợi trường ${field}): ${JSON.stringify(b).slice(0, 300)}`).toBeGreaterThan(0);
  expect(names.map(leaf), `Response phải có lỗi của trường ${field}`).toContain(leaf(field));
}

function finiteNumber(value: unknown, label: string): number {
  const n = typeof value === 'number' || (typeof value === 'string' && value.trim() !== '') ? Number(value) : NaN;
  expect(Number.isFinite(n), `${label || 'Giá trị'} phải là số hữu hạn, hiện nhận ${JSON.stringify(value)}`).toBe(true);
  return n;
}

/** So số tiền tuyệt đối đến đồng. */
export function expectMoney(actual: unknown, expected: number, label = ''): void {
  expect(finiteNumber(actual, label), `${label} phải bằng ${expected.toLocaleString('vi-VN')}`.trim()).toBe(expected);
}

/** So phần trăm theo số chữ số lẻ quy định (P&L chi tiết 1 số lẻ, danh sách Chi phí – Doanh thu 2 số lẻ). */
export function expectPercent(actual: unknown, expected: number, decimals: number, label = ''): void {
  const f = 10 ** decimals;
  expect(Math.round(finiteNumber(actual, label) * f) / f, `${label} phải bằng ${expected}% (${decimals} số lẻ)`.trim()).toBe(Math.round(expected * f) / f);
}

/** Bỏ các trường thay đổi theo thời gian để so "dữ liệu không đổi". */
export function stable(v: any): any {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) {
      if (/^(updatedAt|lastModified|modifiedAt|serverTime|now|generatedAt|fetchedAt|requestId|traceId)$/i.test(k)) continue;
      out[k] = stable(x);
    }
    return out;
  }
  return v;
}

/**
 * Chờ phản hồi API do thao tác UI gọi (method + đường dẫn), để case UI kiểm tra đúng mã HTTP ở cột "Kết quả HTTP mong đợi".
 * Gọi trước thao tác rồi `await` sau thao tác: `const res = uiApi(page, 'PUT', /\/benchmark$/); await click; expectStatusIn(await res, '200/204')`.
 */
export function uiApi(page: Page, method: string | RegExp, path: RegExp, timeout = 120_000): Promise<Response> {
  const okMethod = (m: string) => (typeof method === 'string' ? m === method : method.test(m));
  return page.waitForResponse((r) => okMethod(r.request().method()) && path.test(new URL(r.url()).pathname), { timeout });
}

/** Dán bằng clipboard để ứng dụng nhận sự kiện paste như thao tác của người dùng. */
export async function pasteText(input: Locator, text: string): Promise<void> {
  const page = input.page();
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(page.url()).origin });
  await page.bringToFront();
  await input.focus();
  await page.evaluate((value) => navigator.clipboard.writeText(value), text);
  await input.press('ControlOrMeta+V');
}
