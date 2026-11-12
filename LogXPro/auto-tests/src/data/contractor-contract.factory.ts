import { addMonths, today } from '../utils/dates';
import { randDigits } from '../utils/test-run';
import { personName, phone } from './lead.factory';

export function legalNumber(): string {
  return `HĐNT-${randDigits(5, true)}/${new Date().getFullYear()}`;
}

/** Phần `contract` của POST /api/contractor-contracts. */
export function newContractorContract(contractorId: string, overrides: Record<string, unknown> = {}) {
  const from = today();
  return {
    contractorId,
    name: 'Hợp đồng vận chuyển hàng hóa tuyến Việt – Trung',
    legalNumber: legalNumber(),
    signedOn: from,
    effectiveFrom: from,
    effectiveTo: addMonths(from, 12),
    contact: { fullName: personName(), jobTitle: 'Trưởng điều phối', phone: phone(), email: `dieuphoi.${randDigits(5)}@example.vn` },
    ...overrides,
  };
}

/** Phần `contract` của tái ký HĐ nhà thầu. */
export function resignContractorContract(effectiveFrom: string, overrides: Record<string, unknown> = {}) {
  return {
    name: 'Hợp đồng tái ký vận chuyển tuyến Việt – Trung',
    legalNumber: legalNumber(),
    signedOn: today(),
    effectiveFrom,
    effectiveTo: addMonths(effectiveFrom, 12),
    // API bắt buộc gửi trường này (true/false); true khi chấp nhận thay thế HĐ đang hiệu lực.
    confirmReplacement: false,
    ...overrides,
  };
}

export function updateContractorContract(current: any, overrides: Record<string, unknown> = {}) {
  return {
    name: current.name,
    legalNumber: current.legalNumber,
    signedOn: current.signedOn,
    effectiveFrom: current.effectiveFrom,
    effectiveTo: current.effectiveTo,
    autoRenew: current.autoRenew,
    renewalCycleMonths: current.renewalCycleMonths,
    ...overrides,
  };
}

export const RENEWAL_CYCLES = [3, 6, 12, 24] as const;
