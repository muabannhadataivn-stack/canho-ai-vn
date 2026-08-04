import { projectsSeed } from "@/data/projects.seed";
import { computePriceTier } from "./price-tier";
import type { Project, ProjectWithTier } from "./types";

/**
 * Lớp trừu tượng nguồn dữ liệu. Hiện tại đọc từ data/projects.seed.ts (mock/local).
 * Khi pipeline thật (CONTENT-PIPELINE.md) sẵn sàng, chỉ cần thay nội dung các hàm dưới
 * bằng gọi DB/API thật — không cần sửa bất kỳ component hay route nào phía trên.
 */

function withTier(p: Project): ProjectWithTier {
  return {
    ...p,
    priceTier: computePriceTier(p.pricing.priceMin, p.pricing.priceMax, p.pricing.priceUnit),
  };
}

const allProjects: ProjectWithTier[] = projectsSeed.map(withTier);

/** Chỉ trả dự án publicationStatus === "published" — dùng cho listing công khai + sitemap. */
export function getPublishedProjects(): ProjectWithTier[] {
  return allProjects.filter((p) => p.publicationStatus === "published");
}

/** Dùng cho generateStaticParams — CHỈ sinh trang tĩnh cho dự án đã published. */
export function getPublishedProjectParams(): { tinh: string; slug: string }[] {
  return getPublishedProjects().map((p) => ({ tinh: p.provinceSlug, slug: p.slug }));
}

export function getProjectBySlug(provinceSlug: string, slug: string): ProjectWithTier | null {
  const project = allProjects.find(
    (p) => p.provinceSlug === provinceSlug && p.slug === slug
  );
  if (!project) return null;
  // Trang draft vẫn xem được qua URL trực tiếp trong môi trường dev/preview,
  // nhưng không được generateStaticParams / sitemap — chặn ở 2 nơi đó, không chặn ở đây
  // để tránh 404 giả khi CTV cần xem trước bản nháp.
  return project;
}

export function getProjectsByProvince(provinceSlug: string): ProjectWithTier[] {
  return getPublishedProjects().filter((p) => p.provinceSlug === provinceSlug);
}

export function getProjectsByPriceTier(tier: string): ProjectWithTier[] {
  return getPublishedProjects().filter((p) => p.priceTier === tier);
}

export function getAllProvinces(): { name: string; slug: string; count: number }[] {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of getPublishedProjects()) {
    const existing = map.get(p.provinceSlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(p.provinceSlug, { name: p.province, slug: p.provinceSlug, count: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export interface SearchFilters {
  q?: string;
  provinces?: string[]; // provinceSlug[]
  priceTiers?: string[];
  statuses?: string[]; // SalesStatus[]
}

export function searchProjects(filters: SearchFilters): ProjectWithTier[] {
  const q = (filters.q ?? "").trim().toLowerCase();
  return getPublishedProjects().filter((p) => {
    if (q) {
      const matchesText =
        p.name.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q) ||
        (p.district ?? "").toLowerCase().includes(q);
      if (!matchesText) return false;
    }
    if (filters.provinces && filters.provinces.length > 0 && !filters.provinces.includes(p.provinceSlug)) {
      return false;
    }
    if (filters.priceTiers && filters.priceTiers.length > 0) {
      if (!p.priceTier || !filters.priceTiers.includes(p.priceTier)) return false;
    }
    if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(p.salesStatus)) {
      return false;
    }
    return true;
  });
}

export function getAllPublishedForCompare(ids: string[]): ProjectWithTier[] {
  return getPublishedProjects().filter((p) => ids.includes(p.id));
}

export { allProjects as __allProjectsIncludingDraft };
