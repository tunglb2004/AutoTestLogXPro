import { createHash } from 'crypto';
import ExcelJS from 'exceljs';

export function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

/** Đếm số dòng dữ liệu (bỏ dòng tiêu đề) của sheet đầu tiên trong file xlsx. */
export async function xlsxDataRows(buf: Buffer): Promise<{ header: string[]; rows: number; sheetNames: string[] }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);
  const ws = wb.worksheets[0];
  const header = ((ws.getRow(1).values as unknown[]) ?? []).slice(1).map((v) => String(v ?? ''));
  let rows = 0;
  ws.eachRow((row, n) => {
    if (n > 1 && row.cellCount > 0) rows += 1;
  });
  return { header, rows, sheetNames: wb.worksheets.map((w) => w.name) };
}

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
