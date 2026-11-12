import type { BrowserContext } from '@playwright/test';

function isPriceConfigurationPath(url: URL): boolean {
  const path = url.pathname.replace(/%([0-9a-f]{2})/gi, (_, byte: string) => String.fromCharCode(parseInt(byte, 16)));
  return /\/api\/price-configurations(?:\/|;|$)/i.test(path);
}

export function isPriceConfigurationWrite(method: string, url: URL): boolean {
  return !/^(GET|HEAD|OPTIONS)$/i.test(method) && isPriceConfigurationPath(url);
}

const guardedContexts = new WeakSet<BrowserContext>();

/** Chặn yêu cầu ghi trước khi trình duyệt gửi tới API; các yêu cầu đọc đi tiếp. */
export async function guardPriceConfigurationWrites(context: BrowserContext): Promise<void> {
  if (guardedContexts.has(context)) return;
  await context.route(isPriceConfigurationPath, async (route) => {
    const request = route.request();
    if (isPriceConfigurationWrite(request.method(), new URL(request.url()))) {
      await route.abort('blockedbyclient');
    } else {
      await route.fallback();
    }
  });
  guardedContexts.add(context);
}
