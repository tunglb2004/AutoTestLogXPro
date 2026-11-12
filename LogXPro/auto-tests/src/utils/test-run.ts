import { randomUUID } from 'crypto';

/** Mã lần chạy, gắn vào tên dữ liệu để nhận diện và dọn dữ liệu test. */
export const TEST_RUN_ID = process.env.TEST_RUN_ID ?? `at${Date.now().toString(36)}`;

/** Số nguyên ngẫu nhiên trong [min, max]. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Chuỗi gồm `length` chữ số ngẫu nhiên. `noLeadingZero` để tránh số 0 đầu. */
export function randDigits(length: number, noLeadingZero = false): string {
  let s = '';
  for (let i = 0; i < length; i++) s += String(randInt(i === 0 && noLeadingZero ? 1 : 0, 9));
  return s;
}

/** Số thập phân ngẫu nhiên làm tròn `decimals` chữ số. */
export function randDecimal(min: number, max: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round((Math.random() * (max - min) + min) * f) / f;
}

export function pick<T>(items: readonly T[]): T {
  return items[randInt(0, items.length - 1)];
}

export function uuid(): string {
  return randomUUID();
}

/** Gắn testRunId vào cuối chuỗi có ý nghĩa, ví dụ "Công ty Vận tải Minh Phát at1x2y". */
export function tagged(text: string): string {
  return `${text} ${TEST_RUN_ID}`;
}

/**
 * Chuỗi có nghĩa đúng độ dài `length` (lặp câu mẫu rồi cắt), dùng cho case biên độ dài.
 * Dấu cách được tính là 1 ký tự, nhưng chuỗi không được bắt đầu hay kết thúc bằng dấu cách:
 * hệ thống cắt khoảng trắng hai đầu khi lưu, nên chuỗi kết thúc bằng dấu cách sẽ bị lưu thiếu 1 ký tự
 * và case biên đo sai. Ký tự trắng ở hai đầu được thay bằng chữ "x".
 */
export function textOfLength(length: number, seed = 'Công ty cổ phần giao nhận vận tải quốc tế Việt Trung '): string {
  let s = '';
  while (s.length < length) s += seed;
  s = s.slice(0, length).normalize('NFC');
  if (length > 0 && /\s/.test(s[0])) s = 'x' + s.slice(1);
  if (length > 1 && /\s/.test(s[s.length - 1])) s = s.slice(0, -1) + 'x';
  return s;
}
