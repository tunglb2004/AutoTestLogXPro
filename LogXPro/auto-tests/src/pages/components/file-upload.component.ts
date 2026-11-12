import { Locator, Page } from '@playwright/test';

type FileArg = { name: string; mimeType: string; buffer: Buffer };

/** Ô chọn file (input[type=file] ẩn sau vùng "Kéo thả file vào đây hoặc Chọn từ thiết bị"). */
export class FileUploadComponent {
  constructor(readonly root: Page | Locator) {}

  get input() {
    return this.root.locator('input[type=file]');
  }

  async choose(files: FileArg | FileArg[], index = 0) {
    await this.input.nth(index).setInputFiles(files);
  }
}
