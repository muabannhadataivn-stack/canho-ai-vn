export interface NormalizedProvince {
  name: string;
  slug: string;
}

/**
 * Chuẩn hoá cột "city" từ CSV Chợ Cư Dân — dữ liệu nguồn không thống nhất
 * (46% trống, nhiều biến thể cho cùng 1 tỉnh, một số dòng bị nhét nhầm tên
 * phường/quận/xã vào chỗ tỉnh). CHỈ ánh xạ đúng các biến thể đã biết và xác
 * nhận — không tự đoán/suy diễn biến thể mới.
 */
const KNOWN_VARIANTS: [string[], NormalizedProvince][] = [
  [["Hà Nội"], { name: "Hà Nội", slug: "ha-noi" }],
  [
    ["Hồ Chí Minh", "TP.HCM", "Ho Chi Minh City", "Thành phố Hồ Chí Minh", "HCMC", "Ho Chi Minh"],
    { name: "TP.HCM", slug: "tp-hcm" },
  ],
  [["Bắc Ninh"], { name: "Bắc Ninh", slug: "bac-ninh" }],
  [["Cần Thơ"], { name: "Cần Thơ", slug: "can-tho" }],
  [["Đà Nẵng"], { name: "Đà Nẵng", slug: "da-nang" }],
];

const PROVINCE_LOOKUP = new Map<string, NormalizedProvince>();
for (const [variants, normalized] of KNOWN_VARIANTS) {
  for (const variant of variants) {
    PROVINCE_LOOKUP.set(variant.trim().toLowerCase(), normalized);
  }
}

// Dấu hiệu dữ liệu nguồn bị lỗi — nhét nhầm cấp phường/quận/xã vào cột tỉnh.
const MISPLACED_PREFIXES = ["phường ", "quận ", "xã "];

/**
 * null khi: trống, không khớp bất kỳ biến thể đã biết nào, hoặc bắt đầu bằng
 * "Phường "/"Quận "/"Xã ". Nơi gọi PHẢI dùng UNRESOLVED_PROVINCE làm fallback
 * khi nhận null — KHÔNG tự đoán tỉnh nào khác.
 */
export function normalizeProvince(cityRaw: string | null | undefined): NormalizedProvince | null {
  const trimmed = (cityRaw ?? "").trim();
  if (trimmed === "") return null;

  const lower = trimmed.toLowerCase();
  if (MISPLACED_PREFIXES.some((prefix) => lower.startsWith(prefix))) return null;

  return PROVINCE_LOOKUP.get(lower) ?? null;
}

export const UNRESOLVED_PROVINCE: NormalizedProvince = { name: "Chưa xác định", slug: "chua-xac-dinh" };
