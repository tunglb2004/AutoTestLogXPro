import { z } from 'zod';

/** Schema response của các API mục "Tháp điều phối — thao tác ngoại lệ", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["ApiListScopeRequestView"] = z.lazy(() => z.object({ "items": z.array(S["ScopeRequestView"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["RequestCreated"] = z.lazy(() => z.object({ "id": z.string().nullish() }).passthrough());
S["ScopeRequestView"] = z.lazy(() => z.object({ "id": z.string().nullish(), "kind": z.enum(["ADD", "REMOVE"]).nullish(), "kindLabel": z.string().nullish(), "serviceTypeCode": z.string().nullish(), "serviceTypeName": z.string().nullish(), "reason": z.string().nullish(), "status": z.enum(["PENDING", "ACCEPTED", "DECLINED"]).nullish(), "statusLabel": z.string().nullish(), "responseNote": z.string().nullish(), "requestedByName": z.string().nullish(), "requestedAt": z.string().nullish(), "respondedByName": z.string().nullish(), "respondedAt": z.string().nullish() }).passthrough());
S["Meta"] = z.lazy(() => z.object({ "pagination": S["Pagination"].nullish() }).passthrough());
S["Pagination"] = z.lazy(() => z.object({ "total": z.number().nullish(), "perPage": z.number().nullish(), "currentPage": z.number().nullish(), "totalPages": z.number().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "GET /api/k3/service-orders/{id}/scope-requests": { status: 200, contentType: "*/*", data: S["ApiListScopeRequestView"] },
  "POST /api/k3/service-orders/{id}/scope-requests": { status: 201, contentType: "*/*", data: S["RequestCreated"] },
  "POST /api/k3/service-orders/{id}/vehicle-changes": { status: 200, contentType: "", data: null },
};
