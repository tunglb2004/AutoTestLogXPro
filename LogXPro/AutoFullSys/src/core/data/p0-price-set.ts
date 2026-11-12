/**
 * Bộ giá P0 và số kỳ vọng dùng chung (mục "Dữ liệu cần chuẩn bị" của TestcaseFullSys.md). Đơn vị VND, VAT báo giá 8%.
 * Mã thật (dịch vụ, chi cục, điểm, kho, đơn vị tính, loại giá) tra theo tên trong danh mục khi chạy (TestRun.p0Refs).
 */
export const SERVICES = {
  KHQ: 'Khai báo hải quan',
  HQGS: 'Hải quan giám sát',
  VT: 'Vận tải',
  ST: 'Sang tải',
  KB: 'Kho bãi',
} as const;
export type ServiceKey = keyof typeof SERVICES;
export const SERVICE_KEYS: ServiceKey[] = ['KHQ', 'HQGS', 'VT', 'ST', 'KB'];

export type PriceTypeKey = 'FIXED' | 'SURCHARGE' | 'VARIANCE';
/** Tên loại giá trong danh mục. */
export const PRICE_TYPE_NAMES: Record<PriceTypeKey, RegExp> = { FIXED: /Cố định/i, SURCHARGE: /Phụ phí/i, VARIANCE: /Phát sinh/i };

export type P0ItemKey = 'customsFee' | 'overtime' | 'shiftStorage' | 'supervision' | 'seal' | 'freight' | 'transload' | 'storage';
export type P0Item = {
  key: P0ItemKey;
  service: ServiceKey;
  name: string;
  priceType: PriceTypeKey;
  unit: RegExp;
  /** Giá NT_A (VND); null = không có trong bảng giá NT_A. */
  buyA: number | null;
  /** Giá NT_B (USD); chỉ Cước vận tải. */
  buyBUsd?: number;
  sbp: number | null;
  ssp: number | null;
  /** Có trong BGNB/BGKH P0 không. */
  inQuote: boolean;
  /** Giá chốt trên BGKH. */
  agreed?: number;
};

/** 8 đầu mục test (tiền tố "AT") và giá theo bảng P0. */
export const P0_ITEMS: P0Item[] = [
  { key: 'customsFee', service: 'KHQ', name: 'Phí khai báo', priceType: 'FIXED', unit: /Tờ khai/i, buyA: 1_000_000, sbp: 1_000_000, ssp: 1_200_000, inQuote: true, agreed: 1_150_000 },
  { key: 'overtime', service: 'KHQ', name: 'Phí ngoài giờ', priceType: 'SURCHARGE', unit: /^Khoản$/i, buyA: 300_000, sbp: 300_000, ssp: 400_000, inQuote: true, agreed: 400_000 },
  // Tên cũ chỉ giữ làm khóa tương thích. Khi chạy, fixture chọn một đầu mục Phát sinh KHQ đang hoạt động từ API.
  { key: 'shiftStorage', service: 'KHQ', name: 'Phát sinh KHQ', priceType: 'VARIANCE', unit: /./, buyA: null, sbp: null, ssp: null, inQuote: false },
  { key: 'supervision', service: 'HQGS', name: 'Phí giám sát', priceType: 'FIXED', unit: /^Lô hàng$/i, buyA: 800_000, sbp: 800_000, ssp: 1_000_000, inQuote: true, agreed: 1_000_000 },
  { key: 'seal', service: 'HQGS', name: 'Phí kẹp chì', priceType: 'SURCHARGE', unit: /^Khoản$/i, buyA: 150_000, sbp: 150_000, ssp: 200_000, inQuote: false },
  { key: 'freight', service: 'VT', name: 'Cước vận tải', priceType: 'FIXED', unit: /Chuyến/i, buyA: 9_500_000, buyBUsd: 400, sbp: 9_500_000, ssp: 11_000_000, inQuote: true, agreed: 11_000_000 },
  { key: 'transload', service: 'ST', name: 'Phí sang tải', priceType: 'FIXED', unit: /Cặp xe/i, buyA: 1_200_000, sbp: 1_200_000, ssp: 1_500_000, inQuote: true, agreed: 1_500_000 },
  { key: 'storage', service: 'KB', name: 'Phí lưu kho', priceType: 'FIXED', unit: /^Lô hàng$/i, buyA: 500_000, sbp: 500_000, ssp: 600_000, inQuote: true, agreed: 600_000 },
];

/**
 * Tên trong danh mục của tuyến và thuộc tính P0 (mục "Tuyến và thuộc tính").
 * Người dùng chốt 08/11/2026: không thêm giá trị danh mục, dùng giá trị đang có trên web dev thay cho tên bộ case:
 * đơn vị "Lần" → "Khoản", "Lô" → "Lô hàng"; nhóm hàng "Hàng tổng hợp" → "Linh kiện điện tử"; đặc tính "Hàng khô" → "Hàng thường";
 * điểm vận tải "Hà Nội" → "Hai Bà Trưng" (tỉnh vẫn là Thành phố Hà Nội).
 */
export const P0_NAMES = {
  borderGate: /Hữu Nghị/i,
  customsOffice: /Hữu Nghị/i,
  tradeType: /Nhập kinh doanh/i,
  cargoGroup: /^Linh kiện điện tử$/i,
  cargoNature: /^Hàng thường$/i,
  packaging: /Pallet/i,
  vehicleType: /40/i,
  transportMode: /Đường bộ/i,
  cargoLoadType: /nguyên/i,
  transloadPoint: /Hữu Nghị/i,
  transloadType: /^Xe sang Xe$/i,
  transloadMethod: /Cẩu/i,
  warehouse: /Hữu Nghị/i,
  warehouseType: /thường/i,
  originPoint: /^Hữu Nghị Quan$/i,
  destinationPoint: /^Hai Bà Trưng$/i,
  destinationProvince: /Hà Nội/i,
};

/** Giữ tương thích: dòng giá mua/bán định mức của 6 đầu mục đưa vào báo giá. */
export const P0_LINES = P0_ITEMS.filter((i) => i.inQuote);

export const P0 = {
  vatPct: 8,
  vatBand: 'VAT_8',
  fxUsd: 25_000,
  fxCny: 3_600,
  /** BGNB: tổng đơn giá của sáu dòng P0. Lợi nhuận còn phụ thuộc các dòng bắt buộc ngoài P0. */
  internalQuoteTotal: 15_700_000,
  /** BGKH: Phí khai báo chốt 1.150.000 (−4,17%, GIẢM SÂU). */
  customsFeeAgreed: 1_150_000,
  customsFeeDeltaPct: -4.17,
  customerQuoteBeforeVat: 15_650_000,
  customerQuoteVat: 1_252_000,
  customerQuoteAfterVat: 16_902_000,
  /** Đầu mục Phát sinh KHQ đang hoạt động: chi phí 200.000, K1 sửa doanh thu 250.000. */
  storageFeeCost: 200_000,
  storageFeeRevenueEdited: 250_000,
  overtimeCost: 300_000,
  overtimeRevenue: 400_000,
  /** Doanh thu ban đầu (chỉ dòng Cố định) của từng dịch vụ trên phiếu P0. */
  fixedRevenue: { KHQ: 1_150_000, HQGS: 1_000_000, VT: 11_000_000, ST: 1_500_000, KB: 600_000 } as Record<ServiceKey, number>,
  /** Chi phí từng dịch vụ trên phiếu P0 (VT 400 USD × 25.000, điều phối NT_B). */
  serviceCost: { KHQ: 1_500_000, HQGS: 800_000, VT: 10_000_000, ST: 1_200_000, KB: 500_000 } as Record<ServiceKey, number>,
  serviceRevenue: { KHQ: 1_800_000, HQGS: 1_000_000, VT: 11_000_000, ST: 1_500_000, KB: 600_000 } as Record<ServiceKey, number>,
  /** Phiếu P0 sau khi đủ 5 dịch vụ (tỷ giá 25.000). */
  orderRevenue: 15_900_000,
  orderRevenueVat: 1_272_000,
  orderRevenueWithVat: 17_172_000,
  orderCost: 14_000_000,
  orderPnl: 1_900_000,
  orderMarginDetailPct: 11.9,
  orderMarginListPct: 11.95,
  /** Áp tỷ giá 26.000: VT 400 USD = 10.400.000. */
  fxUsdAlt: 26_000,
  orderCostAtAlt: 14_400_000,
  orderPnlAtAlt: 1_500_000,
  orderMarginDetailPctAtAlt: 9.4,
  orderMarginListPctAtAlt: 9.43,
  /** Doanh thu KHQ trước/sau khi K1 sửa dòng Phát sinh KHQ. */
  khqRevenueBeforeEdit: 1_750_000,
  khqRevenueAfterEdit: 1_800_000,
  khqCost: 1_500_000,
} as const;
