import { Page } from '@playwright/test';

/**
 * Giả lập nguồn tỷ giá Vietcombank không truy cập được cho case UI cảnh báo tỷ giá.
 * Chặn ở trình duyệt các lời gọi tỷ giá của web; không đụng tới backend.
 */
export async function mockVcbUnavailable(page: Page): Promise<void> {
  await page.route(/\/api\/exchange-rates(\/|\?|$)/, (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, errorCode: 'internal-error', message: 'Không lấy được tỷ giá Vietcombank', data: null }),
    }),
  );
}
