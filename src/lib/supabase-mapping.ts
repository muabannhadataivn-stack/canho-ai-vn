import type {
  Amenity,
  AmenityIcon,
  FitItem,
  NearbyAmenity,
  NearbyCategory,
  NearbyRoute,
  PriceEntry,
  Project,
  ProjectLocation,
  ProjectMedia,
  ProjectPricing,
  PriceUnit,
  PublicationStatus,
  SalesStatus,
  TimelineItem,
} from "./types";

/**
 * Kiểu dữ liệu thô (snake_case) trả về từ Supabase — khớp cột trong
 * supabase/migrations/20260804000000_init.sql. Nếu đổi schema DB, sửa ở đây trước.
 */

export interface ProjectRow {
  id: string;
  slug: string;
  province_slug: string;
  name: string;
  province: string;
  district: string | null;
  developer: string | null;
  sales_status: string;
  scale: string | null;
  units: string | null;
  building_density: string | null;
  start_date: string | null;
  handover_expected: string | null;
  updated_at: string;
  publication_status: string;
}

export interface PricingRow {
  project_id: string;
  price_min: number | null;
  price_max: number | null;
  price_unit: string | null;
  price_as_of: string | null;
  price_note: string | null;
}

export interface PriceEntryRow {
  project_id: string;
  type: string;
  area_min: number | null;
  area_max: number | null;
  price_min: number | null;
  price_max: number | null;
}

export interface AmenityRow {
  project_id: string;
  icon: string;
  name: string;
  description: string | null;
}

export interface NearbyAmenityRow {
  project_id: string;
  category: string;
  name: string;
  distance_meters: number | null;
  within_project: boolean;
}

export interface TimelineRow {
  project_id: string;
  label: string;
  date: string;
  done: boolean;
  sort_order: number;
}

export interface LocationRow {
  project_id: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  commute_note: string | null;
}

export interface NearbyRouteRow {
  project_id: string;
  name: string;
  type: string;
}

export interface FitForRow {
  project_id: string;
  text: string;
  caution: boolean;
  sort_order: number;
}

export interface GalleryImageRow {
  project_id: string;
  image_url: string;
  image_alt: string | null;
  sort_order: number;
  is_cover: boolean;
}

/** Các hàng bảng con đã lọc sẵn theo đúng 1 project_id, dùng để dựng 1 Project. */
export interface ProjectRelatedRows {
  pricing: PricingRow | undefined;
  priceEntries: PriceEntryRow[];
  amenities: AmenityRow[];
  nearbyAmenities: NearbyAmenityRow[];
  timeline: TimelineRow[];
  location: LocationRow | undefined;
  nearbyRoutes: NearbyRouteRow[];
  fitFor: FitForRow[];
  gallery: GalleryImageRow[];
}

/**
 * Chuyển 1 hàng `projects` + các bảng con liên quan sang đúng shape `Project` (src/lib/types.ts).
 * Không sửa type Project ở đây — mọi lệch pha schema DB phải được dung hoà trong hàm này.
 */
export function mapRowToProject(row: ProjectRow, related: ProjectRelatedRows): Project {
  const pricing: ProjectPricing = {
    priceMin: related.pricing?.price_min ?? undefined,
    priceMax: related.pricing?.price_max ?? undefined,
    priceUnit: (related.pricing?.price_unit as PriceUnit | null) ?? undefined,
    priceAsOf: related.pricing?.price_as_of ?? undefined,
    priceNote: related.pricing?.price_note ?? undefined,
    priceTable: related.priceEntries.length > 0 ? related.priceEntries.map(mapPriceEntry) : undefined,
  };

  const location: ProjectLocation = {
    address: related.location?.address ?? undefined,
    lat: related.location?.lat ?? undefined,
    lng: related.location?.lng ?? undefined,
    commuteNote: related.location?.commute_note ?? undefined,
    nearbyRoutes: related.nearbyRoutes.length > 0 ? related.nearbyRoutes.map(mapNearbyRoute) : undefined,
  };

  // Ảnh đại diện (hero) KHÔNG còn là bảng riêng (project_media, đã ngừng dùng) — giờ LÀ ảnh
  // trong project_images được đánh dấu is_cover=true; nếu chưa admin nào bấm "Đặt làm ảnh bìa",
  // fallback về ảnh đầu tiên theo sort_order (related.gallery đã sort sẵn từ data-source.ts).
  // Mọi nơi đọc project.media.heroImage/heroImageAlt (page.tsx, generateMetadata, jsonld.ts)
  // không cần sửa gì — tự động nhận đúng giá trị mới qua chính field cũ này.
  const coverImage = related.gallery.find((g) => g.is_cover) ?? related.gallery[0];
  const media: ProjectMedia = {
    heroImage: coverImage?.image_url ?? null,
    heroImageAlt: coverImage?.image_alt ?? undefined,
    gallery: related.gallery.length > 0 ? related.gallery.map(mapGalleryImage) : undefined,
  };

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    province: row.province,
    provinceSlug: row.province_slug,
    district: row.district ?? undefined,
    developer: row.developer ?? undefined,
    propertyType: "can-ho",
    salesStatus: row.sales_status as SalesStatus,
    scale: row.scale ?? undefined,
    units: row.units ?? undefined,
    buildingDensity: row.building_density ?? undefined,
    startDate: row.start_date ?? undefined,
    handoverExpected: row.handover_expected ?? undefined,
    updatedAt: row.updated_at,
    pricing,
    amenities: related.amenities.map(mapAmenity),
    nearbyAmenities: related.nearbyAmenities.map(mapNearbyAmenity),
    timeline: related.timeline.map(mapTimelineItem),
    location,
    media,
    fitFor: related.fitFor.map(mapFitItem),
    // URL Chợ Cư Dân theo đúng 1 công thức cố định (xác nhận qua ví dụ thật:
    // chocudan.vn/du-an/akari-city khớp slug "akari-city" có sẵn) — không cần lưu DB, dựng
    // trực tiếp từ slug lúc render. Luôn dựng được cho MỌI dự án (100% có slug) nên không
    // còn case undefined nữa.
    community: {
      url: `https://www.chocudan.vn/du-an/${row.slug}`,
      communityName: `Chợ Cư Dân ${row.name}`,
    },
    publicationStatus: row.publication_status as PublicationStatus,
  };
}

function mapPriceEntry(r: PriceEntryRow): PriceEntry {
  return {
    type: r.type,
    areaMin: r.area_min ?? 0,
    areaMax: r.area_max ?? 0,
    priceMin: r.price_min ?? 0,
    priceMax: r.price_max ?? 0,
  };
}

function mapAmenity(r: AmenityRow): Amenity {
  return {
    icon: r.icon as AmenityIcon,
    name: r.name,
    // Cột DB "description" (project_amenities) ánh xạ sang field "desc" của type Amenity.
    desc: r.description ?? undefined,
  };
}

function mapNearbyAmenity(r: NearbyAmenityRow): NearbyAmenity {
  return {
    category: r.category as NearbyCategory,
    name: r.name,
    distanceMeters: r.distance_meters ?? 0,
    withinProject: r.within_project || undefined,
  };
}

function mapTimelineItem(r: TimelineRow): TimelineItem {
  return { label: r.label, date: r.date, done: r.done };
}

function mapNearbyRoute(r: NearbyRouteRow): NearbyRoute {
  return { name: r.name, type: r.type };
}

function mapFitItem(r: FitForRow): FitItem {
  return { text: r.text, caution: r.caution || undefined };
}

function mapGalleryImage(r: GalleryImageRow): { url: string; alt: string } {
  return { url: r.image_url, alt: r.image_alt ?? "" };
}
