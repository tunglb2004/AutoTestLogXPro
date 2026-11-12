/** Ngày nghiệp vụ dạng yyyy-MM-dd theo giờ máy chạy test. */
export function isoDate(d: Date): string {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 10);
}

export function today(): string {
  return isoDate(new Date());
}

export function addDays(base: string | Date, days: number): string {
  const d = typeof base === 'string' ? new Date(`${base}T00:00:00`) : new Date(base);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function addMonths(base: string | Date, months: number): string {
  const d = typeof base === 'string' ? new Date(`${base}T00:00:00`) : new Date(base);
  d.setMonth(d.getMonth() + months);
  return isoDate(d);
}

/** Số ngày còn lại dùng cho case biên cảnh báo kỳ hạn. */
export const ALERT_EDGES = [0, 7, 8, 30, 31, 60, 61] as const;
