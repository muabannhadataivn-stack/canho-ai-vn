import type { ProjectPricing } from "./types";

/** DATA-SCHEMA mục 2: cả priceMin/priceMax trống → "Đang cập nhật giá". */
export function formatPriceRange(pricing: ProjectPricing): string {
  if (pricing.priceMin === undefined && pricing.priceMax === undefined) {
    return "Đang cập nhật giá";
  }
  const unit = pricing.priceUnit === "ty-can" ? "tỷ/căn" : "triệu/m²";
  if (pricing.priceMin !== undefined && pricing.priceMax !== undefined) {
    return `≈ ${formatNumber(pricing.priceMin)}–${formatNumber(pricing.priceMax)} ${unit}`;
  }
  const single = pricing.priceMin ?? pricing.priceMax;
  return `≈ ${formatNumber(single as number)} ${unit}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("vi-VN");
}

export function formatUpdatedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
