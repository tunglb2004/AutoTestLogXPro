import { z } from 'zod';

/** Schema response của các API mục "Tỷ giá Vietcombank và thông báo", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["ExchangeRateView"] = z.lazy(() => z.object({ "currency": z.enum(["VND", "USD", "CNY"]).nullish(), "rate": z.number().nullish(), "asOf": z.string().nullish(), "source": z.string().nullish() }).passthrough());
S["NotificationView"] = z.lazy(() => z.object({ "id": z.string().nullish(), "kind": z.string().nullish(), "title": z.string().nullish(), "body": z.string().nullish(), "subjectType": z.string().nullish(), "subjectId": z.string().nullish(), "readAt": z.string().nullish(), "createdAt": z.string().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "GET /api/exchange-rates/{currency}": { status: 200, contentType: "*/*", data: S["ExchangeRateView"] },
  "GET /api/notifications": { status: 200, contentType: "*/*", data: z.array(S["NotificationView"]) },
  "GET /api/notifications/unread-count": { status: 200, contentType: "*/*", data: z.record(z.number()) },
  "POST /api/notifications/{id}/read": { status: 200, contentType: "", data: null },
};
