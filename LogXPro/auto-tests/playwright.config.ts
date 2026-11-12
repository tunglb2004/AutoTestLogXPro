import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Không báo lỗi khi thiếu biến ở đây để `playwright test --list` vẫn chạy được;
// tests/setup/auth.setup.ts mới kiểm tra đủ biến trước khi chạy test thật.
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  // Ảnh chuẩn so sánh giao diện để ngoài tests/ (thư mục tests chỉ chứa spec theo bản cấu trúc).
  snapshotPathTemplate: '{testDir}/../snapshots/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.WEB_BASE_URL,
    // Evidence: ảnh cho mọi case UI; trace và video giữ lại khi case lỗi.
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /setup\/.*\.setup\.ts/ },
    {
      name: 'api',
      testMatch: ['api/**/*.spec.ts', 'flows/**/*.spec.ts'],
      dependencies: ['setup'],
    },
    {
      name: 'ui',
      testMatch: 'ui/**/*.spec.ts',
      testIgnore: ['**/*.responsive.spec.ts', '**/*.visual.spec.ts'],
      // UI-LEAD-006 làm hết hạn phiên NVKD A (mỗi tài khoản chỉ 1 phiên) nên chạy riêng sau cùng, không đá phiên test khác.
      grepInvert: /UI-LEAD-006/,
      dependencies: ['setup'],
      // teardown chạy sau khi ui và các project phụ thuộc xong, kể cả khi có case Fail (dependencies thì bị bỏ qua).
      teardown: 'ui-session',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-session',
      testMatch: 'ui/**/*.access.spec.ts',
      grep: /UI-LEAD-006/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'responsive',
      testMatch: '**/*.responsive.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'visual',
      testMatch: '**/*.visual.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
    },
  ],
});
