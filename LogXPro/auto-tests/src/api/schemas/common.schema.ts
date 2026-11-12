import { z } from 'zod';

export const statusView = z.object({ value: z.number().nullish(), code: z.string(), name: z.string().nullish() }).passthrough();
export const pagination = z.object({ page: z.number().nullish(), perPage: z.number().nullish(), total: z.number().nullish() }).passthrough();
export const apiSuccess = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();
export const apiError = z.object({ success: z.literal(false), errorCode: z.string(), message: z.string().nullish() }).passthrough();
/** Response phân trang: { items, meta: { pagination } }. */
export const paged = z.object({ items: z.array(z.any()), meta: z.object({ pagination }).passthrough().nullish() }).passthrough();
/** Body lỗi không được lộ stacktrace. */
export function hasNoStacktrace(text: string): boolean {
  return !/(at [\w$.]+\(|Exception|\.java:\d+)/.test(text);
}
