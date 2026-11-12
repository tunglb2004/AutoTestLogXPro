import { z } from 'zod';

/** Schema response của các API mục "Cấu hình đầu mục giá", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["ApiListPriceConfigurationSummary"] = z.lazy(() => z.object({ "items": z.array(S["PriceConfigurationSummary"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["PriceConfigurationStats"] = z.lazy(() => z.object({ "configurationCount": z.number().nullish(), "itemCount": z.number().nullish(), "activeItemCount": z.number().nullish() }).passthrough());
S["PriceConfigurationDetail"] = z.lazy(() => z.object({ "id": z.string().nullish(), "serviceCode": z.string().nullish(), "serviceName": z.string().nullish(), "status": S["StatusView"].nullish(), "items": z.array(S["PriceConfigurationItemResponse"]).nullish() }).passthrough());
S["ApiListAuditEntry"] = z.lazy(() => z.object({ "items": z.array(S["AuditEntry"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["PriceConfigurationItemResponse"] = z.lazy(() => z.object({ "id": z.string().nullish(), "code": z.string().nullish(), "priceConfigurationId": z.string().nullish(), "name": z.string().nullish(), "priceTypeId": z.string().nullish(), "priceTypeCode": z.string().nullish(), "priceTypeName": z.string().nullish(), "warehouseTypes": z.array(S["WarehouseTypeView"]).nullish(), "status": S["StatusView"].nullish(), "sortOrder": z.number().nullish(), "locked": z.boolean().nullish(), "createdAt": z.string().nullish(), "updatedAt": z.string().nullish() }).passthrough());
S["DeactivationImpact"] = z.lazy(() => z.object({ "blocked": z.boolean().nullish(), "blockingOrderCodes": z.array(z.string()).nullish(), "message": z.string().nullish(), "inUse": z.boolean().nullish() }).passthrough());
S["ApiListSummary"] = z.lazy(() => z.object({ "items": z.array(S["Summary"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["Version"] = z.lazy(() => z.object({ "id": z.string().nullish(), "versionNo": z.number().nullish(), "at": z.string().nullish(), "actorUserId": z.string().nullish(), "actorName": z.string().nullish(), "current": z.boolean().nullish(), "snapshot": S["JsonNode"].nullish() }).passthrough());
S["PriceConfigurationSummary"] = z.lazy(() => z.object({ "id": z.string().nullish(), "serviceCode": z.string().nullish(), "serviceName": z.string().nullish(), "configurationCount": z.number().nullish(), "status": S["StatusView"].nullish() }).passthrough());
S["Meta"] = z.lazy(() => z.object({ "pagination": S["Pagination"].nullish() }).passthrough());
S["StatusView"] = z.lazy(() => z.object({ "value": z.number().nullish(), "code": z.string().nullish(), "name": z.string().nullish() }).passthrough());
S["AuditEntry"] = z.lazy(() => z.object({ "id": z.string().nullish(), "at": z.string().nullish(), "actorUserId": z.string().nullish(), "actorEmail": z.string().nullish(), "actorName": z.string().nullish(), "actorEmployeeCode": z.string().nullish(), "action": z.string().nullish(), "summary": z.string().nullish(), "targetEntity": z.string().nullish(), "targetId": z.string().nullish(), "oldValue": S["JsonNode"].nullish(), "newValue": S["JsonNode"].nullish(), "event": z.string().nullish(), "eventLabel": z.string().nullish(), "summaryHtml": z.string().nullish() }).passthrough());
S["WarehouseTypeView"] = z.lazy(() => z.object({ "id": z.string().nullish(), "code": z.string().nullish(), "name": z.string().nullish() }).passthrough());
S["Summary"] = z.lazy(() => z.object({ "id": z.string().nullish(), "versionNo": z.number().nullish(), "at": z.string().nullish(), "actorUserId": z.string().nullish(), "actorName": z.string().nullish(), "current": z.boolean().nullish() }).passthrough());
S["JsonNode"] = z.lazy(() => z.object({ "valueNode": z.boolean().nullish(), "container": z.boolean().nullish(), "missingNode": z.boolean().nullish(), "object": z.boolean().nullish(), "nodeType": z.enum(["ARRAY", "BINARY", "BOOLEAN", "MISSING", "NULL", "NUMBER", "OBJECT", "POJO", "STRING"]).nullish(), "string": z.boolean().nullish(), "integralNumber": z.boolean().nullish(), "pojo": z.boolean().nullish(), "floatingPointNumber": z.boolean().nullish(), "short": z.boolean().nullish(), "int": z.boolean().nullish(), "long": z.boolean().nullish(), "double": z.boolean().nullish(), "bigDecimal": z.boolean().nullish(), "bigInteger": z.boolean().nullish(), "textual": z.boolean().nullish(), "boolean": z.boolean().nullish(), "binary": z.boolean().nullish(), "array": z.boolean().nullish(), "empty": z.boolean().nullish(), "null": z.boolean().nullish(), "float": z.boolean().nullish(), "number": z.boolean().nullish(), "embeddedValue": z.boolean().nullish() }).passthrough());
S["Pagination"] = z.lazy(() => z.object({ "total": z.number().nullish(), "perPage": z.number().nullish(), "currentPage": z.number().nullish(), "totalPages": z.number().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "GET /api/price-configurations": { status: 200, contentType: "*/*", data: S["ApiListPriceConfigurationSummary"] },
  "GET /api/price-configurations/stats": { status: 200, contentType: "*/*", data: S["PriceConfigurationStats"] },
  "GET /api/price-configurations/{id}": { status: 200, contentType: "*/*", data: S["PriceConfigurationDetail"] },
  "GET /api/price-configurations/{id}/history": { status: 200, contentType: "*/*", data: S["ApiListAuditEntry"] },
  "POST /api/price-configurations/{id}/items": { status: 200, contentType: "*/*", data: S["PriceConfigurationItemResponse"] },
  "PUT /api/price-configurations/{id}/items": { status: 200, contentType: "*/*", data: S["PriceConfigurationDetail"] },
  "PUT /api/price-configurations/{id}/items/{itemId}": { status: 200, contentType: "*/*", data: S["PriceConfigurationItemResponse"] },
  "DELETE /api/price-configurations/{id}/items/{itemId}": { status: 200, contentType: "", data: null },
  "GET /api/price-configurations/{id}/items/{itemId}/deactivation-impact": { status: 200, contentType: "*/*", data: S["DeactivationImpact"] },
  "GET /api/price-configurations/{id}/versions": { status: 200, contentType: "*/*", data: S["ApiListSummary"] },
  "GET /api/price-configurations/{id}/versions/current": { status: 200, contentType: "*/*", data: S["Version"] },
  "GET /api/price-configurations/{id}/versions/{versionId}": { status: 200, contentType: "*/*", data: S["Version"] },
};
