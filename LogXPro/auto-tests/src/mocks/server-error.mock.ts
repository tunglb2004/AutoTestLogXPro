import { Page } from '@playwright/test';

/** Giả lập backend trả 500 cho mọi request khớp `urlPattern` (dùng cho case UI lỗi máy chủ). */
export async function mockServerError(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.route(urlPattern, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, errorCode: 'internal-error', message: 'Lỗi giả lập', data: null }),
    }),
  );
}
