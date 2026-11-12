import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Không báo lỗi khi thiếu biến ở đây để `playwright test --list` vẫn chạy được;
// tests/setup/auth.setup.ts mới kiểm tra đủ biến và môi trường được phép trước khi chạy test thật.
dotenv.config({ path: path.resolve(__dirname, '.env') });

const priceConfigurationCases = '**/cau-hinh-dau-muc-gia/**';

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/../snapshots/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : undefined,
  // Môi trường dev đôi lúc chậm hoặc phải làm mới token một lần. Cho thao tác đủ thời gian
  // hoàn tất nhưng vẫn có giới hạn để locator sai không treo vô hạn cả bộ chạy.
  timeout: 600_000,
  expect: { timeout: 60_000 },
  use: {
    baseURL: process.env.WEB_URL,
    serviceWorkers: 'block',
    actionTimeout: 120_000,
    navigationTimeout: 120_000,
    // Evidence: ảnh cho mọi case UI; trace và video giữ lại khi case lỗi.
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /setup\/.*\.setup\.ts/ },
    {
      // Case API và luồng: không mở trình duyệt.
      name: 'api',
      testMatch: ['api/**/*.spec.ts', 'flows/**/*.spec.ts'],
      testIgnore: priceConfigurationCases,
      dependencies: ['setup'],
    },
    {
      name: 'ui',
      testMatch: 'ui/**/*.spec.ts',
      testIgnore: ['**/*.responsive.spec.ts', '**/*.visual.spec.ts', priceConfigurationCases],
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'responsive',
      testMatch: '**/*.responsive.spec.ts',
      testIgnore: priceConfigurationCases,
      dependencies: ['setup'],
      use: { ...devices['iPad (gen 7)'] },
    },
    {
      name: 'visual',
      testMatch: '**/*.visual.spec.ts',
      testIgnore: priceConfigurationCases,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
    },
  ],
});
