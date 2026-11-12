import { z } from 'zod';

/** Schema response của các API mục "Chi phí – Doanh thu của phiếu (P&L) và tỷ giá phiếu", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["PnlView"] = z.lazy(() => z.object({ "serviceOrderId": z.string().nullish(), "code": z.string().nullish(), "customerName": z.string().nullish(), "originLabel": z.string().nullish(), "destinationLabel": z.string().nullish(), "legsConfirmed": z.boolean().nullish(), "revenueConfirmed": z.boolean().nullish(), "confirmedBy": z.string().nullish(), "confirmedAt": z.string().nullish(), "showsRevenue": z.boolean().nullish(), "showsCost": z.boolean().nullish(), "fxRate": S["OrderFxRateView"].nullish(), "kpi": S["Figures"].nullish(), "legs": z.array(S["Leg"]).nullish() }).passthrough());
S["OrderFxRateView"] = z.lazy(() => z.object({ "source": z.enum(["VCB", "MANUAL"]).nullish(), "sourceLabel": z.string().nullish(), "usdRate": z.number().nullish(), "cnyRate": z.number().nullish(), "updatedBy": z.string().nullish(), "updatedAt": z.string().nullish(), "vcbUnavailable": z.boolean().nullish(), "locked": z.boolean().nullish(), "vcbUsdRate": z.number().nullish(), "vcbCnyRate": z.number().nullish() }).passthrough());
S["Figures"] = z.lazy(() => z.object({ "revenue": z.number().nullish(), "cost": z.number().nullish(), "profit": z.number().nullish(), "marginPercent": z.number().nullish(), "margin": z.enum(["SAFE", "BELOW_STANDARD", "LOSS"]).nullish(), "marginLabel": z.string().nullish(), "missingFxRate": z.boolean().nullish() }).passthrough());
S["Leg"] = z.lazy(() => z.object({ "position": z.number().nullish(), "name": z.string().nullish(), "origin": S["Place"].nullish(), "destination": S["Place"].nullish(), "services": z.array(S["Ref"]).nullish(), "empty": z.boolean().nullish() }).passthrough());
S["Place"] = z.lazy(() => z.object({ "kind": z.enum(["ADDRESS", "BORDER_GATE"]).nullish(), "code": z.string().nullish(), "label": z.string().nullish() }).passthrough());
S["Ref"] = z.lazy(() => z.object({ "code": z.string().nullish(), "name": z.string().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "GET /api/service-orders/{id}/pnl": { status: 200, contentType: "*/*", data: S["PnlView"] },
  "GET /api/service-orders/{id}/pnl/export": { status: 200, contentType: "*/*", data: z.string() },
  "GET /api/service-orders/{id}/pnl/fx-rate": { status: 200, contentType: "*/*", data: S["OrderFxRateView"] },
  "PUT /api/service-orders/{id}/pnl/fx-rate": { status: 200, contentType: "*/*", data: S["OrderFxRateView"] },
};
