#!/usr/bin/env node
// Chạy Playwright và lưu kết quả thành '<tên> (lần N)'.
// Cách dùng: node tools/run-test.mjs [--name <tên>] [tham số của playwright test]
import { spawn, spawnSync } from 'node:child_process';
import { appendFileSync, closeSync, copyFileSync, createWriteStream, existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RESULTS_DIR = resolve(process.env.RESULTS_DIR ?? join(ROOT, 'results'));
const EVIDENCE_DIR = resolve(process.env.EVIDENCE_DIR ?? join(ROOT, 'evidence'));
const PLAYWRIGHT_CLI = join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');
const SECRET_ARG = /((?:PASSWORD|PASS|TOKEN|SECRET|KEY)[A-Z0-9_]*=)\S+/gi;
const CASE_ID = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3,}/;
const ANSI = /\u001b\[[0-9;]*m/g;
const STATUS_TEXT = { expected: 'Đạt', unexpected: 'Lỗi', flaky: 'Không ổn định', skipped: 'Bỏ qua' };

// Giờ theo máy đang chạy, để so được với log backend.
function localTime(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace('T', ' ');
}

function parseArgs(argv) {
  const args = [...argv];
  const index = args.indexOf('--name');
  const name = index >= 0 ? args.splice(index, 2)[1] : undefined;
  return { name, playwrightArgs: args };
}

// Lấy tên từ đường dẫn test đầu tiên: tests/api/a.functional.spec.ts thành a.functional.
function defaultName(playwrightArgs) {
  const target = playwrightArgs.find((arg, i) => !arg.startsWith('-') && !playwrightArgs[i - 1]?.startsWith('-'));
  return target ? basename(target).replace(/\.(spec|setup)\.ts$/, '') : 'toan-bo';
}

// Giành số lần chạy kế tiếp; cờ 'wx' đảm bảo hai lần chạy song song không trùng số.
function reserveRun(name) {
  mkdirSync(RESULTS_DIR, { recursive: true });
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escaped} \\(lần (\\d+)\\)`);
  const used = readdirSync(RESULTS_DIR).map((file) => Number(pattern.exec(file)?.[1] ?? 0));
  let number = Math.max(0, ...used) + 1;
  for (;;) {
    try {
      closeSync(openSync(join(RESULTS_DIR, `${name} (lần ${number}).txt`), 'wx'));
      return number;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      number += 1;
    }
  }
}

function runPlaywright(args, env, logPath) {
  const log = createWriteStream(logPath);
  const child = spawn(process.execPath, [PLAYWRIGHT_CLI, 'test', ...args], { cwd: ROOT, env });
  for (const [stream, target] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
    stream.on('data', (chunk) => {
      target.write(chunk);
      log.write(String(chunk).replace(ANSI, ''));
    });
  }
  return new Promise((done, fail) => {
    child.on('error', fail);
    child.on('close', (code) => log.end(() => done(code ?? 1)));
  });
}

function collectSpecs(suite, found = []) {
  for (const spec of suite.specs ?? []) found.push(spec);
  for (const child of suite.suites ?? []) collectSpecs(child, found);
  return found;
}

function readCases(jsonPath) {
  if (!existsSync(jsonPath)) return [];
  const report = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const rows = [];
  for (const suite of report.suites ?? []) {
    for (const spec of collectSpecs(suite)) {
      for (const test of spec.tests) {
        const results = test.results ?? [];
        const error = results.at(-1)?.error?.message ?? '';
        rows.push({
          id: CASE_ID.exec(spec.title)?.[0] ?? '-',
          title: spec.title,
          file: spec.file,
          project: test.projectName,
          status: test.status,
          seconds: results.reduce((sum, result) => sum + (result.duration ?? 0), 0) / 1000,
          error: error.replace(ANSI, '').split('\n')[0].replaceAll('|', '/').slice(0, 160),
        });
      }
    }
  }
  return rows;
}

function caseRow(row) {
  const cells = [row.id, row.title, row.file, row.project, STATUS_TEXT[row.status] ?? row.status, row.seconds.toFixed(2), row.error];
  return `| ${cells.join(' | ')} |`;
}

/** Kết luận dựa trên case nghiệp vụ (bỏ bước setup), không dựa vào mã thoát. */
function verdict(rows) {
  const business = rows.filter((row) => row.project !== 'setup');
  const executed = business.filter((row) => row.status !== 'skipped');
  const failed = business.filter((row) => row.status === 'unexpected' || row.status === 'flaky').length;
  const setupFailed = rows.some((row) => row.project === 'setup' && row.status === 'unexpected');
  if (setupFailed) return 'Setup lỗi, chưa có ca nghiệp vụ nào chạy được';
  if (!executed.length) return 'Chưa có ca được thực thi';
  return failed ? `Có ${failed} case lỗi` : 'Đạt';
}

function writeSummary(path, info, rows) {
  const business = rows.filter((row) => row.project !== 'setup');
  const count = (status) => business.filter((row) => row.status === status).length;
  const header = ['| Case | Test | File | Project | Kết quả | Giây | Lỗi |', '|---|---|---|---|---|---:|---|'];
  const failed = rows.filter((row) => row.status === 'unexpected' || row.status === 'flaky');
  writeFileSync(path, [
    `# Tổng kết ${info.label}`, '',
    ...Object.entries(info.fields).map(([key, value]) => `- ${key}: ${value}`), '',
    'Số liệu dưới đây chỉ tính case nghiệp vụ (không tính bước setup đăng nhập). "Bỏ qua" gồm case `test.fixme` chưa code.', '',
    '| Case nghiệp vụ | Đã chạy | Đạt | Lỗi | Không ổn định | Bỏ qua |', '|---:|---:|---:|---:|---:|---:|',
    `| ${business.length} | ${business.length - count('skipped')} | ${count('expected')} | ${count('unexpected')} | ${count('flaky')} | ${count('skipped')} |`, '',
    '## Case lỗi', '',
    ...(failed.length ? [...header, ...failed.map(caseRow)] : ['Không có.']), '',
    '## Tất cả case', '',
    ...(rows.length ? [...header, ...rows.map(caseRow)] : ['Không có dữ liệu: Playwright không tạo được file JSON, xem file log.']), '',
  ].join('\n'), 'utf8');
}

function appendHistory(name, number, info) {
  const history = join(RESULTS_DIR, 'LICH_SU_CHAY.md');
  if (!existsSync(history)) {
    writeFileSync(history, '# Lịch sử chạy\n\n| Tên | Lần | Bắt đầu | Kết thúc | Kết quả |\n|---|---:|---|---|---|\n', 'utf8');
  }
  appendFileSync(history, `| ${name} | ${number} | ${info['Bắt đầu']} | ${info['Kết thúc']} | ${info['Kết quả']} |\n`, 'utf8');
}

// ---------- Evidence theo từng case: evidence/<ID>/<ID> (lần N) - <tên>.<đuôi>
const SAFE_NAME = /[<>:"/\\|?*\u0000-\u001f]/g;

function safeName(text) {
  return String(text).replace(SAFE_NAME, '_').replace(/\s+/g, ' ').trim().slice(0, 80) || 'file';
}

/** Số lần kế tiếp của riêng case này; evidence cũ giữ nguyên, lần sau là N+1. */
function nextCaseRun(dir, id) {
  mkdirSync(dir, { recursive: true });
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escaped} \\(lần (\\d+)\\)`);
  const used = readdirSync(dir).map((file) => Number(pattern.exec(file)?.[1] ?? 0));
  return Math.max(0, ...used) + 1;
}

/** Đọc file JSON của Playwright, lưu kết quả và attachment của từng case vào thư mục mang ID case. */
export function saveEvidence(jsonPath, runLabel, evidenceDir = EVIDENCE_DIR) {
  if (!existsSync(jsonPath)) return 0;
  const report = JSON.parse(readFileSync(jsonPath, 'utf8'));
  let saved = 0;
  for (const suite of report.suites ?? []) {
    for (const spec of collectSpecs(suite)) {
      const id = CASE_ID.exec(spec.title)?.[0];
      if (!id) continue;
      for (const t of spec.tests) {
        const result = (t.results ?? []).at(-1);
        if (!result || t.projectName === 'setup' || t.status === 'skipped') continue;
        const dir = join(evidenceDir, id);
        const prefix = `${id} (lần ${nextCaseRun(dir, id)})`;
        const files = [];
        (result.attachments ?? []).forEach((att, index) => {
          const ext = extname(att.path ?? '') || (att.contentType?.includes('json') ? '.json' : att.contentType?.includes('png') ? '.png' : '.txt');
          const base = safeName(att.name.replace(/\.[a-z0-9]+$/i, '')) + (index ? `-${index}` : '');
          const target = join(dir, `${prefix} - ${base}${ext}`);
          if (att.path && existsSync(att.path)) copyFileSync(att.path, target);
          else if (att.body) writeFileSync(target, Buffer.from(att.body, 'base64'));
          else return;
          files.push(basename(target));
        });
        const error = (result.errors ?? []).map((e) => (e.message ?? '').replace(ANSI, '')).join('\n\n') || (result.error?.message ?? '').replace(ANSI, '');
        writeFileSync(join(dir, `${prefix} - ket-qua.md`), [
          `# ${spec.title}`, '',
          `- Kết quả: ${STATUS_TEXT[t.status] ?? t.status}`,
          `- Lần chạy: ${runLabel}`,
          `- Project: ${t.projectName}`,
          `- File: ${spec.file}:${spec.line}`,
          `- Bắt đầu: ${result.startTime ?? ''}`,
          `- Thời gian: ${((result.duration ?? 0) / 1000).toFixed(2)} giây`, '',
          '## Evidence kèm theo', '',
          ...(files.length ? files.map((f) => `- ${f}`) : ['Không có file đính kèm.']), '',
          ...(error ? ['## Lỗi', '', '```text', error, '```', ''] : []),
        ].join('\n'), 'utf8');
        saved += 1;
      }
    }
  }
  return saved;
}

async function main() {
  if (!existsSync(PLAYWRIGHT_CLI)) {
    console.error('Chưa cài Playwright, hãy chạy: npm install');
    return 1;
  }
  const { name: givenName, playwrightArgs } = parseArgs(process.argv.slice(2));
  const name = givenName ?? defaultName(playwrightArgs);
  const number = reserveRun(name);
  const label = `${name} (lần ${number})`;
  const jsonPath = join(RESULTS_DIR, `${label}.json`);

  const env = {
    ...process.env,
    PLAYWRIGHT_JSON_OUTPUT_NAME: jsonPath,
    PLAYWRIGHT_HTML_OUTPUT_DIR: join(RESULTS_DIR, `${label} - html`),
    PLAYWRIGHT_HTML_OPEN: 'never',
    FORCE_COLOR: '0',
  };
  const started = new Date();
  console.log(`Bắt đầu ${label}`);
  const code = await runPlaywright([...playwrightArgs, '--reporter=list,json,html'], env, join(RESULTS_DIR, `${label}.txt`));
  const ended = new Date();

  const version = spawnSync(process.execPath, [PLAYWRIGHT_CLI, '--version'], { encoding: 'utf8' }).stdout.trim();
  const fields = {
    'Lệnh chạy': ['node tools/run-test.mjs', ...process.argv.slice(2)].join(' ').replace(SECRET_ARG, '$1***'),
    'Phiên bản': version,
    'Bắt đầu': localTime(started),
    'Kết thúc': localTime(ended),
    'Kết quả': '',
  };
  const rows = readCases(jsonPath);
  fields['Kết quả'] = rows.length ? verdict(rows) : 'Không chạy được (không có file JSON, xem log)';
  writeSummary(join(RESULTS_DIR, `${label} - tổng kết.md`), { label, fields }, rows);
  appendHistory(name, number, fields);
  const evidenceCount = saveEvidence(jsonPath, label);
  console.log(`Đã lưu evidence của ${evidenceCount} case vào ${EVIDENCE_DIR}`);
  // Báo cáo HTML nằm trong results/ (không phải playwright-report/), nên phải chỉ đường dẫn khi mở.
  console.log(`Mở báo cáo HTML: npx playwright show-report "results/${label} - html"`);
  console.log(`Đã lưu kết quả ${label} vào ${RESULTS_DIR}`);
  return code;
}

// Chỉ chạy khi gọi trực tiếp, để có thể import saveEvidence khi kiểm tra đơn vị.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
