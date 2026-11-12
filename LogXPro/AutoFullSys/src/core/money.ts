/** Phép tính tiền dùng để dựng số kỳ vọng trong case (không gọi API). */

/** Làm tròn đến đồng. */
export function roundVnd(v: number): number {
  return Math.round(v);
}

/** Làm tròn theo số chữ số lẻ. */
export function round(v: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}

/** Tiền thuế VAT theo % (vd 8). */
export function vat(amount: number, ratePct: number): number {
  return roundVnd((amount * ratePct) / 100);
}

/** Tổng sau VAT. */
export function withVat(amount: number, ratePct: number): number {
  return amount + vat(amount, ratePct);
}

/** Quy đổi ngoại tệ sang VND theo tỷ giá. */
export function toVnd(amount: number, fxRate: number): number {
  return roundVnd(amount * fxRate);
}

/** Lợi nhuận % = Giá bán / Giá mua − 1. */
export function profitPct(sell: number, buy: number, decimals = 2): number {
  return round((sell / buy - 1) * 100, decimals);
}

/** Margin % = P&L ÷ Doanh thu. */
export function marginPct(revenue: number, cost: number, decimals = 1): number {
  return round(((revenue - cost) / revenue) * 100, decimals);
}

/** Tổng một dãy số. */
export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
