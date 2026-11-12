import { APIResponse } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { CallOptions, HttpClient } from '../api/http.client';
import { LeadClient } from '../api/lead.client';
import { ContractClient } from '../api/contract.client';
import { CustomerClient } from '../api/customer.client';
import { ContractorClient } from '../api/contractor.client';
import { ContractorContractClient } from '../api/contractor-contract.client';
import { createRenewer, test as authTest } from './auth.fixture';

type Recorded = {
  api: string;
  method: string;
  url: string;
  request: unknown;
  status: number;
  errorCode: string;
  message: string;
  response: string;
  at: string;
};

const SECRET_KEY = /pass(word)?|token|secret/i;

/** Tóm tắt body gửi đi để làm evidence: che trường nhạy cảm, file chỉ ghi tên và dung lượng. */
function describeRequest(opts: CallOptions): unknown {
  const mask = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(mask);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SECRET_KEY.test(k) ? '***' : mask(x)]));
    return v;
  };
  if (opts.rawBody !== undefined) return { rawBody: opts.rawBody };
  if (opts.multipart) {
    return Object.fromEntries(
      Object.entries(opts.multipart).map(([k, v]) => {
        if (v === undefined || typeof v === 'string') return [k, v];
        const parts = Array.isArray(v) ? v : [v];
        const json = (buf: Buffer) => {
          try {
            return mask(JSON.parse(buf.toString() || 'null'));
          } catch {
            return buf.toString().slice(0, 500); // JSON hỏng (case malformed) thì ghi nguyên văn
          }
        };
        return [k, parts.map((p) => (p.mimeType === 'application/json' ? json(p.buffer) : `${p.name} (${p.mimeType}, ${p.buffer.length} byte)`))];
      }),
    );
  }
  return opts.json === undefined ? null : mask(opts.json);
}

/**
 * HttpClient ghi lại mã HTTP, errorCode và message của từng request trong test.
 * Theo yêu cầu người dùng: test chỉ assert mã HTTP, message được lưu ra file để người dùng tự đánh giá.
 */
export class RecordingHttpClient extends HttpClient {
  readonly records: Recorded[] = [];

  async call(api: string, opts: CallOptions = {}): Promise<APIResponse> {
    const res = await super.call(api, opts);
    let errorCode = '';
    let message = '';
    let response = '';
    const type = res.headers()['content-type'] ?? '';
    try {
      if (/json|text/.test(type) || !type) {
        const text = await res.text();
        response = text.replace(/"(accessToken|refreshToken)"\s*:\s*"[^"]*"/g, '"$1":"***"').slice(0, 3000);
        const b = text ? JSON.parse(text) : null;
        errorCode = b?.errorCode ?? '';
        message = b?.message ?? '';
      } else {
        response = `(file ${type}, ${(await res.body()).length} byte)`;
      }
    } catch {
      message = message || '(body không phải JSON)';
    }
    let url = '';
    try {
      url = this.url(api, opts);
    } catch {
      url = api;
    }
    this.records.push({
      api, method: opts.method ?? api.split(' ')[0], url, request: describeRequest(opts),
      status: res.status(), errorCode, message, response, at: new Date().toISOString(),
    });
    return res;
  }
}

/** File message cạnh kết quả của lần chạy (run-test.mjs truyền PLAYWRIGHT_JSON_OUTPUT_NAME). */
function messageFile(): string {
  const json = process.env.PLAYWRIGHT_JSON_OUTPUT_NAME;
  return json ? json.replace(/\.json$/, ' - message API.md') : path.resolve(__dirname, '../../results/message API.md');
}

function appendMessages(title: string, outcome: string, records: Recorded[]): void {
  if (!records.length) return;
  const file = messageFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try {
    fs.writeFileSync(file, '# Message API theo case\n\nTest chỉ kiểm mã HTTP; cột errorCode và message để người dùng tự đánh giá.\n\n| Case | Kết quả test | API | HTTP | errorCode | Message |\n|---|---|---|---:|---|---|\n', { flag: 'wx' });
  } catch {
    // File đã có (worker khác tạo trước).
  }
  const clean = (s: string) => String(s).replace(/\|/g, '/').replace(/\r?\n/g, ' ').slice(0, 300);
  const id = title.split(' ')[0];
  const lines = records.map((r) => `| ${id} | ${outcome} | \`${r.method} ${r.api.split(' ')[1]}\` | ${r.status} | ${clean(r.errorCode)} | ${clean(r.message)} |`);
  fs.appendFileSync(file, lines.join('\n') + '\n');
}

type ApiFixtures = {
  http: RecordingHttpClient;
  leadApi: LeadClient;
  contractApi: ContractClient;
  customerApi: CustomerClient;
  contractorApi: ContractorClient;
  contractorContractApi: ContractorContractClient;
};

export const test = authTest.extend<ApiFixtures>({
  http: async ({ request, roles }, use, testInfo) => {
    const base = process.env.API_BASE_URL;
    if (!base) throw new Error('Thiếu API_BASE_URL trong .env');
    const http = new RecordingHttpClient(request, base, createRenewer(roles));
    await use(http);
    const outcome = testInfo.status === testInfo.expectedStatus ? 'Đạt' : 'Lỗi';
    appendMessages(testInfo.title, outcome, http.records);
    // Evidence của test API: run-test.mjs chép file này vào evidence/<ID case>/.
    if (http.records.length) await testInfo.attach('evidence-api.json', { body: JSON.stringify(http.records, null, 2), contentType: 'application/json' });
  },
  leadApi: async ({ http }, use) => use(new LeadClient(http)),
  contractApi: async ({ http }, use) => use(new ContractClient(http)),
  customerApi: async ({ http }, use) => use(new CustomerClient(http)),
  contractorApi: async ({ http }, use) => use(new ContractorClient(http)),
  contractorContractApi: async ({ http }, use) => use(new ContractorContractClient(http)),
});

export { expect } from '@playwright/test';
