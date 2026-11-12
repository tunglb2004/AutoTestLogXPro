import ExcelJS from 'exceljs';
import { pick, randDigits, tagged } from '../utils/test-run';

const PREFIX = ['Công ty TNHH', 'Công ty Cổ phần', 'Công ty TNHH MTV', 'Tập đoàn'];
const CORE = ['Vận tải Minh Phát', 'Thương mại Hoàng Long', 'Nông sản Tây Nguyên', 'Điện tử Sao Việt', 'Dệt may Thành Công', 'Gỗ nội thất Phú Gia', 'Cơ khí Đông Á', 'Hóa chất Bình Minh'];
const STREET = ['Nguyễn Trãi', 'Lê Lợi', 'Trần Hưng Đạo', 'Hoàng Quốc Việt', 'Phạm Văn Đồng'];
const CITY = ['Hà Nội', 'Hải Phòng', 'Lạng Sơn', 'Bắc Ninh', 'TP Hồ Chí Minh'];
const FIRST = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ'];
const MIDDLE = ['Văn', 'Thị', 'Minh', 'Đức', 'Thu'];
const LAST = ['An', 'Bình', 'Cường', 'Dung', 'Hà', 'Khánh', 'Long'];
const TITLE = ['Giám đốc', 'Trưởng phòng xuất nhập khẩu', 'Kế toán trưởng', 'Nhân viên mua hàng'];

export const ROUTES = ['DOMESTIC', 'VIETNAM_CHINA', 'DOMESTIC_AND_VIETNAM_CHINA'] as const;
export const SOURCES = ['INDUSTRY_EVENT', 'REFERRAL', 'COLD_OUTREACH', 'INDUSTRY_RESEARCH', 'OTHER'] as const;

/** Mã số thuế ngẫu nhiên 10 hoặc 13 chữ số (khác nhau mỗi lần). */
export function taxCode(length: 10 | 13 = 10): string {
  return randDigits(length, true);
}

/** Số điện thoại hợp lệ: 0 + 9 chữ số ngẫu nhiên. */
export function phone(): string {
  return `09${randDigits(8)}`;
}

export function companyName(): string {
  return tagged(`${pick(PREFIX)} ${pick(CORE)}`);
}

export function personName(): string {
  return `${pick(FIRST)} ${pick(MIDDLE)} ${pick(LAST)}`;
}

export function address(): string {
  return `Số ${randDigits(2, true)} đường ${pick(STREET)}, ${pick(CITY)}`;
}

export function contactBody(overrides: Record<string, unknown> = {}) {
  const name = personName();
  return { fullName: name, jobTitle: pick(TITLE), phone: phone(), email: `lienhe.${randDigits(6)}@example.vn`, ...overrides };
}

export function leadBody(ownerUserId: string, industryIds: string[], overrides: Record<string, unknown> = {}) {
  return {
    companyName: companyName(),
    taxCode: taxCode(),
    headOfficeAddress: address(),
    industryIds,
    route: pick(ROUTES),
    source: pick(SOURCES),
    initialNote: 'Khách hàng tiềm năng cần vận chuyển hàng nông sản sang Trung Quốc',
    ownerUserId,
    contacts: [{ ...contactBody(), primary: true }],
    ...overrides,
  };
}

/** Body sửa Lead (các trường bắt buộc của PUT). */
export function leadUpdateBody(current: any, overrides: Record<string, unknown> = {}) {
  return {
    companyName: current.companyName,
    taxCode: current.taxCode,
    headOfficeAddress: current.headOfficeAddress,
    industryIds: (current.industries ?? []).map((i: any) => i.id),
    route: current.route,
    source: current.source === 'IMPORT' ? 'OTHER' : current.source,
    initialNote: current.initialNote,
    ...overrides,
  };
}

export type ImportRow = {
  companyName?: string; taxCode?: string; address?: string; industry?: string; otherIndustry?: string; route?: string; source?: string;
  website?: string; note?: string; contactName?: string; contactTitle?: string; contactPhone?: string; contactEmail?: string;
};

/**
 * Sinh file import theo cấu trúc cột của file mẫu tải từ GET /api/leads/import-template.
 * Cột được ghi theo tiêu đề của file mẫu để không đoán thứ tự cột.
 */
export async function importFile(template: Buffer, rows: ImportRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(template as unknown as ArrayBuffer);
  const ws = wb.worksheets[0];
  // values của exceljs là mảng thưa (ô trống là lỗ), Array.from để mọi phần tử đều là chuỗi.
  const header = Array.from((ws.getRow(1).values as unknown[]) ?? [], (v) => String(v ?? '').toLowerCase());
  const col = (...keys: string[]) => header.findIndex((h) => keys.some((k) => h.includes(k)));
  // Cột của file mẫu (sheet Lead): Tên doanh nghiệp *, Mã số thuế *, Địa chỉ trụ sở chính, Ngành hàng *, Ngành hàng khác, Tuyến *, Nguồn,
  // Website, Ghi chú, Người liên hệ — Họ tên *, — Chức danh, — SĐT *, — Email.
  const map: [keyof ImportRow, number][] = [
    ['companyName', col('tên doanh nghiệp', 'tên công ty', 'company')],
    ['taxCode', col('mã số thuế', 'mst', 'tax')],
    ['address', col('địa chỉ')],
    ['industry', col('ngành', 'industry')],
    ['otherIndustry', col('ngành hàng khác')],
    ['route', col('tuyến', 'route')],
    ['source', col('nguồn', 'source')],
    ['website', col('website')],
    ['note', col('ghi chú')],
    ['contactName', col('đầu mối', 'họ tên', 'contact')],
    ['contactTitle', col('chức danh')],
    ['contactPhone', col('điện thoại', 'sđt', 'phone')],
    ['contactEmail', col('email')],
  ];
  rows.forEach((r, i) => {
    const row = ws.getRow(i + 2);
    for (const [key, idx] of map) if (idx > 0 && r[key] !== undefined) row.getCell(idx).value = r[key] as string;
    row.commit();
  });
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export function importRow(industry: string, overrides: Partial<ImportRow> = {}): ImportRow {
  return {
    companyName: companyName(),
    taxCode: taxCode(),
    address: address(),
    industry,
    route: 'Nội địa',
    source: 'Giới thiệu',
    website: 'https://logistics-viettrung.vn',
    note: 'Khách hàng tiềm năng nhập từ file mẫu',
    contactName: personName(),
    contactTitle: 'Trưởng phòng xuất nhập khẩu',
    contactPhone: phone(),
    contactEmail: `lienhe.${randDigits(6)}@example.vn`,
    ...overrides,
  };
}
