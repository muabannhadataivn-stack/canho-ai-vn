/** Công thức Haversine thuần — không gọi API nào, dùng được cả client lẫn server. */
export function haversineDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const EARTH_RADIUS_METERS = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Toạ độ trung tâm hành chính (UBND tỉnh/thành hoặc quận trung tâm) — độ chính xác tương đối,
 * chỉ dùng để ước tính khoảng cách hiển thị dạng "cách trung tâm khoảng X km", không dùng cho
 * mục đích cần độ chính xác cao.
 */
export const PROVINCE_CENTERS: Record<string, { lat: number; lng: number }> = {
  "tp-hcm": { lat: 10.7769, lng: 106.7009 }, // UBND TP.HCM, Quận 1
  "ha-noi": { lat: 21.0285, lng: 105.8542 }, // Hồ Gươm, Hoàn Kiếm
  "hung-yen": { lat: 20.6464, lng: 106.0511 }, // UBND tỉnh Hưng Yên, TP Hưng Yên
  "dong-nai": { lat: 10.9574, lng: 106.8426 }, // UBND tỉnh Đồng Nai, TP Biên Hoà
  "bac-ninh": { lat: 21.1861, lng: 106.0763 }, // UBND tỉnh Bắc Ninh, TP Bắc Ninh
  "can-tho": { lat: 10.0452, lng: 105.7469 }, // UBND TP Cần Thơ, Ninh Kiều
  "da-nang": { lat: 16.0544, lng: 108.2022 }, // UBND TP Đà Nẵng, Hải Châu
};

/** null nếu chưa có toạ độ trung tâm cho tỉnh đó — không tự suy đoán. */
export function distanceToProvinceCenter(lat: number, lng: number, provinceSlug: string): number | null {
  const center = PROVINCE_CENTERS[provinceSlug];
  if (!center) return null;
  return haversineDistanceMeters(lat, lng, center.lat, center.lng);
}
