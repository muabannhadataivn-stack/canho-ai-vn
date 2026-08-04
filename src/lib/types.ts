// Kiểu dữ liệu bám sát DATA-SCHEMA-du-an.md.
// Mọi field optional PHẢI có hành vi UI rõ ràng khi thiếu — xử lý ở tầng component,
// không xử lý ngầm ở đây.

export type PublicationStatus = "draft" | "published";

export type SalesStatus =
  | "sap-mo-ban"
  | "dang-mo-ban"
  | "da-ban-giao"
  | "dang-cap-nhat";

export type PriceUnit = "trieu-m2" | "ty-can";

export type PriceTier = "d35" | "35-50" | "50-70" | "t70" | null;

export type AmenityIcon =
  | "park"
  | "pool"
  | "school"
  | "mall"
  | "sport"
  | "bus"
  | "security"
  | "elevator"
  | "parking"
  | "default";

export type NearbyCategory =
  | "truong-hoc"
  | "benh-vien"
  | "sieu-thi-ttTM"
  | "cong-vien"
  | "cho"
  | "ngan-hang";

export interface Amenity {
  icon: AmenityIcon;
  name: string;
  desc?: string;
}

export interface NearbyAmenity {
  category: NearbyCategory;
  name: string;
  distanceMeters: number;
  withinProject?: boolean;
}

export interface TimelineItem {
  label: string;
  date: string;
  done: boolean;
}

export interface NearbyRoute {
  name: string;
  type: string;
}

export interface ProjectLocation {
  address?: string;
  lat?: number;
  lng?: number;
  nearbyRoutes?: NearbyRoute[];
  commuteNote?: string;
}

export interface ProjectMedia {
  heroImage: string | null;
  heroImageAlt?: string;
  gallery?: { url: string; alt: string }[];
}

export interface PriceEntry {
  /** VD: "2PN" */
  type: string;
  areaMin: number;
  areaMax: number;
  priceMin: number;
  priceMax: number;
}

export interface ProjectPricing {
  priceMin?: number;
  priceMax?: number;
  priceUnit?: PriceUnit;
  priceAsOf?: string; // ISO date
  priceNote?: string;
  /** Bảng giá theo loại căn — nguồn cho section "Sản phẩm & giá" + Offer JSON-LD */
  priceTable?: PriceEntry[];
}

export interface FitItem {
  text: string;
  caution?: boolean;
}

export interface CommunityLink {
  /** Chợ Cư Dân — chỉ render khi có url hợp lệ thật sự */
  url: string;
  communityName: string;
}

export interface Project {
  // 1. core
  id: string;
  slug: string;
  name: string;
  province: string;
  provinceSlug: string;
  district?: string;
  developer?: string;
  propertyType: "can-ho";
  salesStatus: SalesStatus;
  scale?: string;
  units?: string;
  buildingDensity?: string;
  startDate?: string;
  handoverExpected?: string;
  updatedAt: string; // ISO date — phải khớp dateModified JSON-LD

  // 2. pricing
  pricing: ProjectPricing;

  // 3. tiện ích
  amenities: Amenity[];
  nearbyAmenities: NearbyAmenity[];

  // 4. tiến độ
  timeline: TimelineItem[];

  // 5. vị trí
  location: ProjectLocation;

  // 6. ảnh
  media: ProjectMedia;

  // đối tượng phù hợp
  fitFor: FitItem[];

  // Chợ Cư Dân cross-promo — optional, chỉ có khi cộng đồng dự án đó tồn tại thật
  community?: CommunityLink;

  // vận hành nội bộ — không hiển thị trực tiếp
  publicationStatus: PublicationStatus;
  leadImageAlt?: string;
}

/** priceTier tự tính, không nhập tay — xem lib/price-tier.ts */
export interface ProjectWithTier extends Project {
  priceTier: PriceTier;
}
