import { pick, randDecimal, randDigits, tagged } from '../utils/test-run';
import { address, contactBody, phone, taxCode } from './lead.factory';

const NAMES = ['Vận tải Bắc Giang', 'Logistics Đồng Đăng', 'Kho vận Hữu Nghị', 'Container Tân Thanh', 'Giao nhận Hải An'];
const CAPACITY = ['30 xe đầu kéo, 50 rơ moóc', '15 xe tải 8 tấn', 'Kho 5.000 m2 tại Lạng Sơn'];
const CAPABILITY = ['Vận chuyển container tuyến Hà Nội – Lạng Sơn – Bằng Tường', 'Lưu kho và bốc xếp hàng nông sản', 'Thông quan cửa khẩu Hữu Nghị'];

/** Hạng nhà thầu: Swagger để chuỗi tự do nên đọc từ biến môi trường. */
export function tierA(): string {
  return process.env.CONTRACTOR_TIER_A ?? '';
}
export function tierB(): string {
  return process.env.CONTRACTOR_TIER_B ?? '';
}

export function contractorBody(serviceTypes: string[], overrides: Record<string, unknown> = {}) {
  return {
    name: tagged(`Công ty TNHH ${pick(NAMES)}`),
    taxCode: taxCode(),
    phone: phone(),
    email: `nhathau.${randDigits(6)}@example.vn`,
    address: address(),
    serviceTypes,
    tier: tierA(),
    recommendedCapacity: pick(CAPACITY),
    capabilityDescription: pick(CAPABILITY),
    performanceScore: randDecimal(1, 5, 1),
    contacts: [{ ...contactBody(), primary: true }],
    ...overrides,
  };
}

export function contractorUpdateBody(current: any, overrides: Record<string, unknown> = {}) {
  return {
    name: current.name,
    taxCode: current.taxCode,
    phone: current.phone,
    email: current.email,
    address: current.address,
    serviceTypes: (current.serviceTypes ?? []).map((s: any) => s.code ?? s),
    recommendedCapacity: current.recommendedCapacity,
    capabilityDescription: current.capabilityDescription,
    performanceScore: current.performanceScore,
    ...overrides,
  };
}

export const REASON = 'Đánh giá lại năng lực sau kỳ kiểm tra chất lượng quý';
