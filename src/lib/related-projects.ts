import type { ProjectWithTier } from "./types";

/**
 * DATA-SCHEMA mục 8: cùng province HOẶC cùng priceTier, tối đa 4, loại trừ chính nó.
 * Không dùng propertyType làm tiêu chí (luôn cố định "can-ho" — so khớp vô nghĩa).
 * Nếu không có ứng viên nào → trả mảng rỗng, phía UI phải ẩn cả section (không fallback ngẫu nhiên).
 */
export function getRelatedProjects(
  current: ProjectWithTier,
  all: ProjectWithTier[],
  limit = 4
): ProjectWithTier[] {
  const candidates = all.filter((p) => {
    if (p.id === current.id) return false;
    if (p.publicationStatus !== "published") return false;
    const sameProvince = p.province === current.province;
    const samePriceTier =
      current.priceTier !== null && p.priceTier === current.priceTier;
    return sameProvince || samePriceTier;
  });

  // Ưu tiên cùng tỉnh trước, rồi tới cùng mức giá.
  candidates.sort((a, b) => {
    const aSameProvince = a.province === current.province ? 1 : 0;
    const bSameProvince = b.province === current.province ? 1 : 0;
    return bSameProvince - aSameProvince;
  });

  return candidates.slice(0, limit);
}
