import { addDays, addMonths, today } from '../utils/dates';
import { pick, randDigits, randInt } from '../utils/test-run';
import { contactBody } from './lead.factory';

export const BILLING = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'PER_SHIPMENT'] as const;

/** Số hợp đồng có nghĩa, phần số sinh ngẫu nhiên. */
export function contractNumber(): string {
  return `HĐDV-${randDigits(4, true)}/${new Date().getFullYear()}/LXP`;
}

/** Phần `contract` của POST /api/contracts (upload HĐ đầu tiên). */
export function uploadContract(customerId: string, accountManagerId: string, overrides: Record<string, unknown> = {}) {
  const from = today();
  return {
    customerId,
    accountManagerId,
    customerTier: 'REGULAR',
    contractNumber: contractNumber(),
    signedOn: from,
    effectiveFrom: from,
    effectiveTo: addMonths(from, 12),
    billingCycle: pick(BILLING),
    paymentTermDays: randInt(15, 60),
    paymentDueNote: 'Thanh toán trong vòng số ngày quy định kể từ ngày nhận hóa đơn',
    paymentMethod: 'TRANSFER',
    ...overrides,
  };
}

/** Body sửa HĐ khách hàng từ dữ liệu hiện tại. */
export function updateContract(current: any, overrides: Record<string, unknown> = {}) {
  return {
    contractNumber: current.contractNumber,
    signedOn: current.signedOn,
    effectiveFrom: current.effectiveFrom,
    effectiveTo: current.effectiveTo,
    billingCycle: current.billingCycle,
    paymentTermDays: current.paymentTermDays,
    paymentDueNote: current.paymentDueNote,
    paymentMethod: current.paymentMethod,
    contacts: current.contacts?.length ? current.contacts.map((c: any) => ({ fullName: c.fullName, phone: c.phone, email: c.email, jobTitle: c.jobTitle })) : [contactBody()],
    reason: 'Cập nhật điều khoản thanh toán theo đề nghị của khách hàng',
    ...overrides,
  };
}

/** Phần `contract` của tái ký HĐ khách hàng. */
export function resignContract(effectiveFrom: string, overrides: Record<string, unknown> = {}) {
  return {
    contractNumber: contractNumber(),
    signedOn: today(),
    effectiveFrom,
    effectiveTo: addMonths(effectiveFrom, 12),
    billingCycle: 'MONTHLY',
    paymentTermDays: randInt(15, 60),
    paymentDueNote: 'Thanh toán theo tháng',
    paymentMethod: 'TRANSFER',
    ...overrides,
  };
}

export function annexMeta(overrides: Record<string, unknown> = {}) {
  return { name: `Phụ lục điều chỉnh giá cước tháng ${new Date().getMonth() + 1}`, description: 'Bổ sung bảng giá vận chuyển tuyến Lạng Sơn', ...overrides };
}

export { addDays, addMonths, today };
