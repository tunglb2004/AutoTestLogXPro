import { addDays, today } from '../utils/dates';
import { randInt, tagged } from '../utils/test-run';

/** Dữ liệu bảng giá mua cho case UI-VDRD-005 (tên có testRunId, 1 dòng giá). */
export function purchasePrice(contractEffectiveTo: string) {
  return {
    name: tagged('BG-autotest bảng giá vận chuyển tuyến Lạng Sơn'),
    effectiveFrom: today(),
    effectiveTo: addDays(contractEffectiveTo, -1),
    currency: 'VND',
    unitPrice: randInt(5, 50) * 100_000,
  };
}
