import type { PriceTier, PriceUnit } from "./types";

/**
 * priceTier chỉ có ý nghĩa cho đơn vị triệu/m² (đúng như "Tìm theo mức giá" ở Trang chủ:
 * Dưới 35tr/m², 35–50tr/m², 50–70tr/m², Trên 70tr/m²). Dự án niêm yết theo tỷ/căn
 * không tự quy đổi (không đủ diện tích để suy ra đơn giá đáng tin cậy) → trả về null,
 * đúng hành vi "không xuất hiện khi duyệt theo mức giá, vẫn xem được qua tìm kiếm/khu vực".
 */
export function computePriceTier(
  priceMin: number | undefined,
  priceMax: number | undefined,
  priceUnit: PriceUnit | undefined
): PriceTier {
  if (priceUnit !== "trieu-m2") return null;
  const ref = priceMin ?? priceMax;
  if (ref === undefined) return null;

  if (ref < 35) return "d35";
  if (ref < 50) return "35-50";
  if (ref < 70) return "50-70";
  return "t70";
}

export const PRICE_TIER_LABEL: Record<Exclude<PriceTier, null>, string> = {
  d35: "Dưới 35tr/m²",
  "35-50": "35–50tr/m²",
  "50-70": "50–70tr/m²",
  t70: "Trên 70tr/m²",
};
