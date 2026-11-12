import { FilePart, data, items, jsonPart } from '../../core/base.client';
import { RoleKey } from '../../core/data/accounts';
import { TEST_RUN_ID, TestRun, randInt, randMoney, samplePdf, tagged, today, uuid } from '../../core/fixtures/test-run.fixture';

/** Thông báo được tạo bất đồng bộ; đợi theo subjectId thay vì đọc ngay sau thao tác phát sinh. */
export async function waitForNotification(run: TestRun, role: RoleKey, subjectId: string, unreadOnly = false): Promise<any> {
  const deadline = Date.now() + 120_000;
  do {
    const response = await run.http.call('GET /api/notifications', {
      token: run.token(role), query: { unreadOnly, limit: 200 },
    });
    if (response.ok()) {
      const payload = await data(response);
      const found = (Array.isArray(payload) ? payload : items(payload)).find((row: any) => row.subjectId === subjectId);
      if (found) return found;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  } while (Date.now() < deadline);
  throw new Error(`Không nhận được thông báo cho bản ghi ${subjectId} sau 120 giây`);
}

/**
 * Dữ liệu mẫu cho mục "Tỷ giá Vietcombank và thông báo": body hợp lệ theo ràng buộc Swagger (bắt buộc, độ dài, kiểu), số ngẫu nhiên, chuỗi tiếng Việt có nghĩa gắn testRunId.
 * Tham chiếu nghiệp vụ (id nhà thầu, đầu mục, khách hàng...) truyền qua tham số `o` khi case cần bản ghi hợp lệ về nghiệp vụ.
 */
export const bodies: Record<string, (o?: Record<string, unknown>) => Record<string, unknown>> = {

};

export const multiparts: Record<string, (o?: Record<string, string | FilePart | FilePart[] | undefined>) => Record<string, string | FilePart | FilePart[] | undefined>> = {

};

export type FieldMeta = { name: string; required: boolean; type: string; maxLength?: number; minLength?: number; minimum?: number; maximum?: number; format?: string; enum?: unknown[]; minItems?: number };
/** Ràng buộc từng trường của body theo Swagger, dùng cho case thiếu trường, độ dài biên, enum. */
export const fields: Record<string, FieldMeta[]> = {

};

// Giữ import dùng được khi mục không có body JSON hoặc multipart.
void TEST_RUN_ID; void randInt; void randMoney; void samplePdf; void tagged; void today; void uuid; void jsonPart;
