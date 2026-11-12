import { z } from 'zod';

/** Schema response của các API mục "Màn Chi phí – Doanh thu (báo cáo quản trị)", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["ApiListPnlReportRow"] = z.lazy(() => z.object({ "items": z.array(S["PnlReportRow"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["PnlReportStats"] = z.lazy(() => z.object({ "orderCount": z.number().nullish(), "totalRevenue": z.number().nullish(), "totalCost": z.number().nullish(), "totalProfit": z.number().nullish(), "marginPercent": z.number().nullish(), "incomplete": z.boolean().nullish() }).passthrough());
S["ApiListPnlReportCustomerOption"] = z.lazy(() => z.object({ "items": z.array(S["PnlReportCustomerOption"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["ApiListPnlReportCreatorOption"] = z.lazy(() => z.object({ "items": z.array(S["PnlReportCreatorOption"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["PnlExportJobView"] = z.lazy(() => z.object({ "id": z.string().nullish(), "status": z.enum(["PENDING", "READY", "FAILED"]).nullish(), "fileName": z.string().nullish(), "rowCount": z.number().nullish(), "skippedCount": z.number().nullish(), "createdAt": z.string().nullish(), "finishedAt": z.string().nullish(), "expiresAt": z.string().nullish(), "message": z.string().nullish() }).passthrough());
S["PnlReportRow"] = z.lazy(() => z.object({ "serviceOrderId": z.string().nullish(), "code": z.string().nullish(), "customerId": z.string().nullish(), "customerName": z.string().nullish(), "customerTaxCode": z.string().nullish(), "status": z.enum(["DRAFT", "SUBMITTED", "ACCEPTED", "REJECTED", "IN_PROGRESS", "PERFORMED", "COMPLETED", "CANCELLED"]).nullish(), "statusLabel": z.string().nullish(), "revenue": z.number().nullish(), "cost": z.number().nullish(), "profit": z.number().nullish(), "marginPercent": z.number().nullish(), "missingFxRate": z.boolean().nullish(), "settled": z.boolean().nullish(), "performedAt": z.string().nullish(), "completedAt": z.string().nullish(), "createdAt": z.string().nullish(), "createdById": z.string().nullish(), "createdByName": z.string().nullish() }).passthrough());
S["Meta"] = z.lazy(() => z.object({ "pagination": S["Pagination"].nullish() }).passthrough());
S["PnlReportCustomerOption"] = z.lazy(() => z.object({ "id": z.string().nullish(), "companyName": z.string().nullish(), "taxCode": z.string().nullish() }).passthrough());
S["PnlReportCreatorOption"] = z.lazy(() => z.object({ "id": z.string().nullish(), "displayName": z.string().nullish(), "email": z.string().nullish() }).passthrough());
S["Pagination"] = z.lazy(() => z.object({ "total": z.number().nullish(), "perPage": z.number().nullish(), "currentPage": z.number().nullish(), "totalPages": z.number().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "GET /api/cost-revenue/orders": { status: 200, contentType: "*/*", data: S["ApiListPnlReportRow"] },
  "GET /api/cost-revenue/orders/stats": { status: 200, contentType: "*/*", data: S["PnlReportStats"] },
  "GET /api/cost-revenue/customer-options": { status: 200, contentType: "*/*", data: S["ApiListPnlReportCustomerOption"] },
  "GET /api/cost-revenue/creator-options": { status: 200, contentType: "*/*", data: S["ApiListPnlReportCreatorOption"] },
  "POST /api/cost-revenue/exports": { status: 200, contentType: "*/*", data: z.record(z.any()) },
  "GET /api/cost-revenue/exports/{id}": { status: 200, contentType: "*/*", data: S["PnlExportJobView"] },
  "GET /api/cost-revenue/exports/{id}/file": { status: 200, contentType: "*/*", data: z.string() },
};
