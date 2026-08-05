import { supabaseServer } from "./supabase-server";
import { computePriceTier } from "./price-tier";
import {
  mapRowToProject,
  type AmenityRow,
  type FitForRow,
  type LocationRow,
  type MediaRow,
  type NearbyAmenityRow,
  type NearbyRouteRow,
  type PriceEntryRow,
  type PricingRow,
  type ProjectRelatedRows,
  type ProjectRow,
  type TimelineRow,
} from "./supabase-mapping";
import type { Project, ProjectWithTier } from "./types";

/**
 * Lớp trừu tượng nguồn dữ liệu — đọc từ Supabase (14 bảng, xem supabase/migrations/).
 * Không export bất kỳ kiểu snake_case nào ra ngoài file này — component/route chỉ thấy
 * đúng shape `Project`/`ProjectWithTier` như trước, xem src/lib/supabase-mapping.ts để map.
 */

function withTier(p: Project): ProjectWithTier {
  return {
    ...p,
    priceTier: computePriceTier(p.pricing.priceMin, p.pricing.priceMax, p.pricing.priceUnit),
  };
}

function groupBy<T extends { project_id: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const list = map.get(row.project_id);
    if (list) list.push(row);
    else map.set(row.project_id, [row]);
  }
  return map;
}

function first<T>(list: T[] | undefined): T | undefined {
  return list?.[0];
}

/**
 * Lấy toàn bộ bảng con cho danh sách project_id đã biết, chạy song song (Promise.all),
 * rồi dựng ProjectWithTier[] theo đúng thứ tự `rows` đầu vào.
 */
export async function assembleProjects(rows: ProjectRow[]): Promise<ProjectWithTier[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);

  const [
    pricingRes,
    priceEntriesRes,
    amenitiesRes,
    nearbyAmenitiesRes,
    timelineRes,
    locationRes,
    nearbyRoutesRes,
    mediaRes,
    fitForRes,
  ] = await Promise.all([
    supabaseServer.from("project_pricing").select("*").in("project_id", ids),
    supabaseServer.from("project_price_entries").select("*").in("project_id", ids),
    supabaseServer.from("project_amenities").select("*").in("project_id", ids),
    supabaseServer.from("project_nearby_amenities").select("*").in("project_id", ids),
    supabaseServer.from("project_timeline").select("*").in("project_id", ids).order("sort_order"),
    supabaseServer.from("project_location").select("*").in("project_id", ids),
    supabaseServer.from("project_nearby_routes").select("*").in("project_id", ids),
    supabaseServer.from("project_media").select("*").in("project_id", ids),
    supabaseServer.from("project_fit_for").select("*").in("project_id", ids).order("sort_order"),
  ]);

  for (const res of [
    pricingRes,
    priceEntriesRes,
    amenitiesRes,
    nearbyAmenitiesRes,
    timelineRes,
    locationRes,
    nearbyRoutesRes,
    mediaRes,
    fitForRes,
  ]) {
    if (res.error) throw res.error;
  }

  const pricingByProject = groupBy((pricingRes.data ?? []) as PricingRow[]);
  const priceEntriesByProject = groupBy((priceEntriesRes.data ?? []) as PriceEntryRow[]);
  const amenitiesByProject = groupBy((amenitiesRes.data ?? []) as AmenityRow[]);
  const nearbyAmenitiesByProject = groupBy((nearbyAmenitiesRes.data ?? []) as NearbyAmenityRow[]);
  const timelineByProject = groupBy((timelineRes.data ?? []) as TimelineRow[]);
  const locationByProject = groupBy((locationRes.data ?? []) as LocationRow[]);
  const nearbyRoutesByProject = groupBy((nearbyRoutesRes.data ?? []) as NearbyRouteRow[]);
  const mediaByProject = groupBy((mediaRes.data ?? []) as MediaRow[]);
  const fitForByProject = groupBy((fitForRes.data ?? []) as FitForRow[]);

  return rows.map((row) => {
    const related: ProjectRelatedRows = {
      pricing: first(pricingByProject.get(row.id)),
      priceEntries: priceEntriesByProject.get(row.id) ?? [],
      amenities: amenitiesByProject.get(row.id) ?? [],
      nearbyAmenities: nearbyAmenitiesByProject.get(row.id) ?? [],
      timeline: timelineByProject.get(row.id) ?? [],
      location: first(locationByProject.get(row.id)),
      nearbyRoutes: nearbyRoutesByProject.get(row.id) ?? [],
      media: first(mediaByProject.get(row.id)),
      fitFor: fitForByProject.get(row.id) ?? [],
    };
    return withTier(mapRowToProject(row, related));
  });
}

/** Chỉ trả dự án publicationStatus === "published" — dùng cho listing công khai + sitemap. */
export async function getPublishedProjects(): Promise<ProjectWithTier[]> {
  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .eq("publication_status", "published");
  if (error) throw error;
  return assembleProjects((data ?? []) as ProjectRow[]);
}

/** Dùng cho generateStaticParams — CHỈ sinh trang tĩnh cho dự án đã published. */
export async function getPublishedProjectParams(): Promise<{ tinh: string; slug: string }[]> {
  const { data, error } = await supabaseServer
    .from("projects")
    .select("slug, province_slug")
    .eq("publication_status", "published");
  if (error) throw error;
  return (data ?? []).map((r) => ({ tinh: r.province_slug as string, slug: r.slug as string }));
}

export async function getProjectBySlug(provinceSlug: string, slug: string): Promise<ProjectWithTier | null> {
  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .eq("province_slug", provinceSlug)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  // Trang draft vẫn xem được qua URL trực tiếp trong môi trường dev/preview,
  // nhưng không được generateStaticParams / sitemap — chặn ở 2 nơi đó, không chặn ở đây
  // để tránh 404 giả khi CTV cần xem trước bản nháp.
  const [project] = await assembleProjects([data as ProjectRow]);
  return project ?? null;
}

export async function getProjectsByProvince(provinceSlug: string): Promise<ProjectWithTier[]> {
  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .eq("publication_status", "published")
    .eq("province_slug", provinceSlug);
  if (error) throw error;
  return assembleProjects((data ?? []) as ProjectRow[]);
}

export async function getProjectsByPriceTier(tier: string): Promise<ProjectWithTier[]> {
  const published = await getPublishedProjects();
  return published.filter((p) => p.priceTier === tier);
}

export async function getAllProvinces(): Promise<{ name: string; slug: string; count: number }[]> {
  const { data, error } = await supabaseServer
    .from("projects")
    .select("province, province_slug")
    .eq("publication_status", "published");
  if (error) throw error;

  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const row of data ?? []) {
    const provinceSlug = row.province_slug as string;
    const existing = map.get(provinceSlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(provinceSlug, { name: row.province as string, slug: provinceSlug, count: 1 });
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

export async function searchProjects(filters: SearchFilters): Promise<ProjectWithTier[]> {
  const q = (filters.q ?? "").trim().toLowerCase();
  const published = await getPublishedProjects();
  return published.filter((p) => {
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

// Khoá "{provinceSlug}:{slug}" — trùng định danh dùng ở src/lib/saved-projects.ts (localStorage).
// Chỉ chấp nhận ký tự slug hợp lệ trước khi đưa vào .or() để tránh injection cú pháp filter PostgREST.
const SLUG_PART_RE = /^[a-z0-9-]+$/;

export async function getAllPublishedForCompare(projectKeys: string[]): Promise<ProjectWithTier[]> {
  const pairs = projectKeys
    .map((key) => {
      const [provinceSlug, slug] = key.split(":");
      return provinceSlug && slug ? { provinceSlug, slug } : null;
    })
    .filter(
      (p): p is { provinceSlug: string; slug: string } =>
        p !== null && SLUG_PART_RE.test(p.provinceSlug) && SLUG_PART_RE.test(p.slug)
    );
  if (pairs.length === 0) return [];

  // Dùng unique constraint (province_slug, slug) từ migration để query đúng cặp — không fetch hết rồi lọc ở JS.
  const orFilter = pairs
    .map((p) => `and(province_slug.eq.${p.provinceSlug},slug.eq.${p.slug})`)
    .join(",");

  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .eq("publication_status", "published")
    .or(orFilter);
  if (error) throw error;
  return assembleProjects((data ?? []) as ProjectRow[]);
}

/** Toàn bộ dự án kể cả draft — không lọc publicationStatus. Hiện chưa có nơi nào dùng ngoài debug. */
export async function getAllProjectsIncludingDraft(): Promise<ProjectWithTier[]> {
  const { data, error } = await supabaseServer.from("projects").select("*");
  if (error) throw error;
  return assembleProjects((data ?? []) as ProjectRow[]);
}
