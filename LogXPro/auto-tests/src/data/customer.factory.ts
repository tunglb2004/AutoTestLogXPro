import { randInt } from '../utils/test-run';

/** Body sửa khách hàng từ dữ liệu hiện tại. */
export function customerUpdateBody(current: any, overrides: Record<string, unknown> = {}) {
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

/** Hạn mức tín dụng ngẫu nhiên, bội số 1 triệu. */
export function creditLimit(): number {
  return randInt(1, 900) * 1_000_000;
}

export const TRANSFER_REASON = 'Phân lại danh mục khách hàng theo khu vực';
