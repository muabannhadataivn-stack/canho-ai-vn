import { haversineDistanceMeters } from "./distance";
import type { ProjectWithTier } from "./types";

/**
 * Ưu tiên cùng tỉnh/thành (provinceSlug) trước, sắp theo khoảng cách Haversine gần nhất
 * (dự án thiếu toạ độ xếp sau cùng trong nhóm cùng tỉnh, vẫn ưu tiên hơn khác tỉnh).
 * Chỉ bổ sung dự án khác tỉnh khi số lượng cùng tỉnh không đủ `limit`.
 * Nếu không có ứng viên nào → trả mảng rỗng, phía UI phải ẩn cả section (không fallback ngẫu nhiên).
 */
export function getRelatedProjects(
  current: ProjectWithTier,
  all: ProjectWithTier[],
  limit = 1
): ProjectWithTier[] {
  const published = all.filter((p) => p.id !== current.id && p.publicationStatus === "published");

  const distanceFrom = (p: ProjectWithTier): number | null => {
    if (current.location.lat === undefined || current.location.lng === undefined) return null;
    if (p.location.lat === undefined || p.location.lng === undefined) return null;
    return haversineDistanceMeters(current.location.lat, current.location.lng, p.location.lat, p.location.lng);
  };

  // null (thiếu toạ độ) luôn xếp sau các giá trị số.
  const byDistance = (a: ProjectWithTier, b: ProjectWithTier) => {
    const da = distanceFrom(a);
    const db = distanceFrom(b);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  };

  const sameProvince = published.filter((p) => p.provinceSlug === current.provinceSlug).sort(byDistance);

  if (sameProvince.length >= limit) {
    return sameProvince.slice(0, limit);
  }

  const otherProvince = published.filter((p) => p.provinceSlug !== current.provinceSlug).sort(byDistance);

  return [...sameProvince, ...otherProvince].slice(0, limit);
}
