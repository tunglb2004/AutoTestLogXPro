import { z } from 'zod';

/** Schema response của các API mục "Cấu hình chặng (quy tắc chặng hành trình, mô phỏng)", sinh từ Swagger (API.txt). Field không bắt buộc trong Swagger được phép null. */
const S: Record<string, z.ZodTypeAny> = {};
S["ApiListLegRuleDetail"] = z.lazy(() => z.object({ "items": z.array(S["LegRuleDetail"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["LegRuleDetail"] = z.lazy(() => z.object({ "code": z.string().nullish(), "name": z.string().nullish(), "status": z.enum(["ACTIVE", "INACTIVE"]).nullish(), "executionScope": z.enum(["INTERNATIONAL", "DOMESTIC", "BORDER_GATE"]).nullish(), "transportMode": S["Ref"].nullish(), "cargoLoadType": S["Ref"].nullish(), "originPointType": S["Ref"].nullish(), "destinationPointType": S["Ref"].nullish(), "description": z.string().nullish(), "createdBy": S["Actor"].nullish(), "createdAt": z.string().nullish(), "legs": z.array(S["Leg"]).nullish() }).passthrough());
S["ApiListAuditEntry"] = z.lazy(() => z.object({ "items": z.array(S["AuditEntry"]).nullish(), "meta": S["Meta"].nullish() }).passthrough());
S["LegStructure"] = z.lazy(() => z.object({ "outcome": z.enum(["MATCHED", "NO_RULE", "AMBIGUOUS"]).nullish(), "executionScope": z.enum(["INTERNATIONAL", "DOMESTIC", "BORDER_GATE"]).nullish(), "rule": S["Ref"].nullish(), "candidateRuleCodes": z.array(z.string()).nullish(), "legs": z.array(S["Leg"]).nullish() }).passthrough());
S["Meta"] = z.lazy(() => z.object({ "pagination": S["Pagination"].nullish() }).passthrough());
S["Ref"] = z.lazy(() => z.object({ "code": z.string().nullish(), "name": z.string().nullish() }).passthrough());
S["Actor"] = z.lazy(() => z.object({ "id": z.string().nullish(), "name": z.string().nullish() }).passthrough());
S["Leg"] = z.lazy(() => z.object({ "position": z.number().nullish(), "name": z.string().nullish(), "origin": S["Place"].nullish(), "destination": S["Place"].nullish(), "services": z.array(S["Ref"]).nullish(), "empty": z.boolean().nullish() }).passthrough());
S["AuditEntry"] = z.lazy(() => z.object({ "id": z.string().nullish(), "at": z.string().nullish(), "actorUserId": z.string().nullish(), "actorEmail": z.string().nullish(), "actorName": z.string().nullish(), "actorEmployeeCode": z.string().nullish(), "action": z.string().nullish(), "summary": z.string().nullish(), "targetEntity": z.string().nullish(), "targetId": z.string().nullish(), "oldValue": S["JsonNode"].nullish(), "newValue": S["JsonNode"].nullish(), "event": z.string().nullish(), "eventLabel": z.string().nullish(), "summaryHtml": z.string().nullish() }).passthrough());
S["Pagination"] = z.lazy(() => z.object({ "total": z.number().nullish(), "perPage": z.number().nullish(), "currentPage": z.number().nullish(), "totalPages": z.number().nullish() }).passthrough());
S["Place"] = z.lazy(() => z.object({ "kind": z.enum(["ADDRESS", "BORDER_GATE"]).nullish(), "code": z.string().nullish(), "label": z.string().nullish() }).passthrough());
S["JsonNode"] = z.lazy(() => z.object({ "valueNode": z.boolean().nullish(), "container": z.boolean().nullish(), "missingNode": z.boolean().nullish(), "object": z.boolean().nullish(), "nodeType": z.enum(["ARRAY", "BINARY", "BOOLEAN", "MISSING", "NULL", "NUMBER", "OBJECT", "POJO", "STRING"]).nullish(), "string": z.boolean().nullish(), "integralNumber": z.boolean().nullish(), "pojo": z.boolean().nullish(), "floatingPointNumber": z.boolean().nullish(), "short": z.boolean().nullish(), "int": z.boolean().nullish(), "long": z.boolean().nullish(), "double": z.boolean().nullish(), "bigDecimal": z.boolean().nullish(), "bigInteger": z.boolean().nullish(), "textual": z.boolean().nullish(), "boolean": z.boolean().nullish(), "binary": z.boolean().nullish(), "array": z.boolean().nullish(), "empty": z.boolean().nullish(), "null": z.boolean().nullish(), "float": z.boolean().nullish(), "number": z.boolean().nullish(), "embeddedValue": z.boolean().nullish() }).passthrough());

/** Vỏ phản hồi thành công theo Swagger. */
export const envelope = z.object({ success: z.literal(true), message: z.string().nullish(), errorCode: z.string().nullish(), data: z.any() }).passthrough();

/** Theo API: mã thành công, loại nội dung và schema của `data` (null nếu không có body). */
export const responses: Record<string, { status: number | null; contentType: string; data: z.ZodTypeAny | null }> = {
  "GET /api/leg-rules": { status: 200, contentType: "*/*", data: S["ApiListLegRuleDetail"] },
  "POST /api/leg-rules": { status: 200, contentType: "", data: null },
  "GET /api/leg-rules/{code}": { status: 200, contentType: "*/*", data: S["LegRuleDetail"] },
  "PUT /api/leg-rules/{code}": { status: 204, contentType: "", data: null },
  "DELETE /api/leg-rules/{code}": { status: 204, contentType: "", data: null },
  "GET /api/leg-rules/{code}/history": { status: 200, contentType: "*/*", data: S["ApiListAuditEntry"] },
  "PATCH /api/leg-rules/{code}/status": { status: 204, contentType: "", data: null },
  "POST /api/leg-rules/simulate": { status: 200, contentType: "*/*", data: S["LegStructure"] },
};
