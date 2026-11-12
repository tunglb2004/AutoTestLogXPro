import * as fs from 'fs';
import * as path from 'path';
import { FilePart } from '../api/http.client';

const MB = 1024 * 1024;

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  exe: 'application/x-msdownload',
  mp4: 'video/mp4',
  txt: 'text/plain',
  csv: 'text/csv',
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
};

/**
 * File thật do người dùng chuẩn bị để upload (thay cho file tự sinh):
 * `upload/...` đọc từ UPLOAD_FILES_DIR (mặc định G:/upload-test-files: file 10MB / 11MB và thư mục other-formats-1mb),
 * `size/...` đọc từ SIZE_FILES_DIR (mặc định G:/test-size-files: file 20MB / 21MB có nội dung xem được).
 */
export function realFile(rel: string): FilePart {
  const [kind, ...rest] = rel.split('/');
  const base = kind === 'size' ? process.env.SIZE_FILES_DIR || 'G:/test-size-files' : process.env.UPLOAD_FILES_DIR || 'G:/upload-test-files';
  const file = path.join(base, ...rest);
  if (!fs.existsSync(file)) throw new Error(`Thiếu file test: ${file} (khai báo thư mục trong .env: UPLOAD_FILES_DIR / SIZE_FILES_DIR)`);
  const ext = path.extname(file).slice(1).toLowerCase();
  return { name: path.basename(file), mimeType: MIME[ext] ?? 'application/octet-stream', buffer: fs.readFileSync(file) };
}

/**
 * Bộ file thật theo mốc dung lượng. Lưu ý: upload_test_10mb/11mb.pdf là PDF 0 trang (chỉ để thử giới hạn dung lượng);
 * file 20MB/21MB có trang chữ, dùng cho các case xem file.
 */
export const REAL = {
  pdf10: () => realFile('upload/upload_test_10mb.pdf'),
  pdf11: () => realFile('upload/upload_test_11mb.pdf'),
  docx10: () => realFile('upload/upload_test_10mb.docx'),
  docx11: () => realFile('upload/upload_test_11mb.docx'),
  jpg10: () => realFile('upload/upload_test_10mb.jpg'),
  jpg11: () => realFile('upload/upload_test_11mb.jpg'),
  png10: () => realFile('upload/upload_test_10mb.png'),
  png11: () => realFile('upload/upload_test_11mb.png'),
  xlsx10: () => realFile('upload/upload_test_10mb.xlsx'),
  xlsx11: () => realFile('upload/upload_test_11mb.xlsx'),
  zip10: () => realFile('upload/upload_test_10mb.zip'),
  zip11: () => realFile('upload/upload_test_11mb.zip'),
  pdf20: () => realFile('size/test-upload-20mb.pdf'),
  pdf21: () => realFile('size/test-upload-21mb.pdf'),
  docx20: () => realFile('size/test-upload-20mb.docx'),
  docx21: () => realFile('size/test-upload-21mb.docx'),
  doc20: () => realFile('size/test-upload-20mb.doc'),
  doc21: () => realFile('size/test-upload-21mb.doc'),
  /** File 1MB các định dạng khác (exe, mp4, txt, csv, rar, 7z, gif, bmp, svg, html, json, xml). */
  other: (ext: string) => realFile(`upload/other-formats-1mb/upload_test_1mb.${ext}`),
};

/**
 * PDF hợp lệ mở được, có 1 trang ghi tên file (để người xem thấy nội dung khi mở trên web),
 * đệm bằng comment để đạt đúng số byte. Cùng tên và kích thước thì nội dung giống hệt (so sha256 khi tải lại).
 */
export function pdf(name = 'hop-dong-scan.pdf', size = 50 * 1024): FilePart {
  const ascii = name.replace(/[^\x20-\x7e]/g, '?').replace(/[()\\]/g, '');
  const text = `BT /F1 16 Tf 40 760 Td (LogXPro - file kiem thu tu dong) Tj 0 -28 Td /F1 12 Tf (Ten file: ${ascii}) Tj 0 -20 Td (Du lieu mau, khong phai hop dong that.) Tj ET`;
  const NL = '\n';
  const head =
    `%PDF-1.4${NL}1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj${NL}2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj${NL}` +
    `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>endobj${NL}` +
    `4 0 obj<</Length ${text.length}>>stream${NL}${text}${NL}endstream endobj${NL}` +
    `5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj${NL}`;
  const tail = `xref${NL}0 6${NL}0000000000 65535 f ${NL}trailer<</Size 6/Root 1 0 R>>${NL}startxref${NL}0${NL}%%EOF${NL}`;
  const pad = Math.max(0, size - head.length - tail.length - 2);
  const buffer = Buffer.concat([Buffer.from(head), Buffer.from('%'), Buffer.alloc(pad, 0x20), Buffer.from(NL), Buffer.from(tail)]);
  return { name, mimeType: 'application/pdf', buffer: buffer.subarray(0, Math.max(size, head.length + tail.length)) };
}

export function pdfMb(mb: number, deltaBytes = 0, name = 'tai-lieu.pdf'): FilePart {
  return pdf(name, mb * MB + deltaBytes);
}

export function png(name = 'giay-phep.png'): FilePart {
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return { name, mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') };
}

export function jpg(name = 'anh-kho.jpg'): FilePart {
  const b64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';
  return { name, mimeType: 'image/jpeg', buffer: Buffer.from(b64, 'base64') };
}

/** File ZIP rỗng hợp lệ (DOCX, XLSX cũng là ZIP). */
function emptyZip(): Buffer {
  return Buffer.from([0x50, 0x4b, 0x05, 0x06, ...new Array(18).fill(0)]);
}

export function zip(name = 'ho-so.zip'): FilePart {
  return { name, mimeType: 'application/zip', buffer: emptyZip() };
}

/** CRC32 cho file ZIP. */
function crc32(buf: Buffer): number {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

/** ZIP không nén (stored), đủ để Word / LibreOffice mở được file DOCX. */
function storedZip(files: [string, string][]): Buffer {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const [path, content] of files) {
    const name = Buffer.from(path);
    const data = Buffer.from(content, 'utf-8');
    const crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(name.length, 26);
    local.push(lh, name, data);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE(offset, 42);
    central.push(ch, name);
    offset += lh.length + name.length + data.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}

/** DOCX thật (mở được bằng Word), 1 đoạn văn ghi tên file. */
export function docx(name = 'phu-luc.docx'): FilePart {
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const body = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>LogXPro - file kiểm thử tự động</w:t></w:r></w:p><w:p><w:r><w:t>Tên file: ${esc(name)}. Dữ liệu mẫu, không phải phụ lục thật.</w:t></w:r></w:p></w:body></w:document>`;
  const buffer = storedZip([
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ['word/document.xml', body],
  ]);
  return { name, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer };
}

export function xlsx(buffer: Buffer, name = 'danh-sach.xlsx'): FilePart {
  return { name, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer };
}

export function exe(name = 'cai-dat.exe'): FilePart {
  return { name, mimeType: 'application/x-msdownload', buffer: Buffer.from('MZ\x90\x00\x03\x00\x00\x00 chương trình thử nghiệm') };
}

/** File thực thi đổi đuôi thành .pdf. */
export function fakePdf(): FilePart {
  return { ...exe('hop-dong.pdf'), mimeType: 'application/pdf' };
}

export function empty(name = 'rong.pdf'): FilePart {
  return { name, mimeType: 'application/pdf', buffer: Buffer.alloc(0) };
}

export function csv(name = 'danh-sach.csv'): FilePart {
  return { name, mimeType: 'text/csv', buffer: Buffer.from('ten cong ty,ma so thue\nCong ty A,0101234567\n') };
}

export function textAs(name: string, mimeType: string): FilePart {
  return { name, mimeType, buffer: Buffer.from('nội dung văn bản không phải file Excel') };
}

export { MB };
