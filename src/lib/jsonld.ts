import type { ProjectWithTier } from "./types";
import { buildFaqEntries, type FaqEntry } from "./faq-bank";

export const SITE_URL = "https://canho.ai.vn";

export function projectUrl(project: { provinceSlug: string; slug: string }): string {
  return `${SITE_URL}/${project.provinceSlug}/${project.slug}`;
}

// heroImage có thể là path tương đối cũ (fallback tĩnh trong /public, VD "/images/...") HOẶC
// URL tuyệt đối thật từ Supabase Storage (từ khi có tính năng upload ảnh đại diện) — nối thẳng
// SITE_URL vào trước 1 URL đã tuyệt đối sẽ ra chuỗi hỏng dạng "https://canho.ai.vnhttps://...".
export function resolveImageUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

/**
 * BreadcrumbList — luôn có (không phụ thuộc field optional nào).
 */
export function buildBreadcrumbJsonLd(project: ProjectWithTier) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: project.province,
        item: `${SITE_URL}/khu-vuc/${project.provinceSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.name,
        item: projectUrl(project),
      },
    ],
  };
}

/**
 * ApartmentComplex — chỉ gắn field thực sự tồn tại. Không bịa geo/image nếu thiếu.
 */
export function buildApartmentComplexJsonLd(project: ProjectWithTier) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: project.name,
    url: projectUrl(project),
    dateModified: project.updatedAt,
  };

  const address = project.location.address ?? `${project.district ?? ""} ${project.province}`.trim();
  if (address) {
    node.address = {
      "@type": "PostalAddress",
      addressLocality: project.district ?? project.province,
      addressRegion: project.province,
      addressCountry: "VN",
      streetAddress: project.location.address ?? undefined,
    };
  }

  if (project.location.lat !== undefined && project.location.lng !== undefined) {
    node.geo = {
      "@type": "GeoCoordinates",
      latitude: project.location.lat,
      longitude: project.location.lng,
    };
  }

  if (project.units) {
    node.numberOfAccommodationUnits = project.units;
  }

  if (project.amenities.length > 0) {
    node.amenityFeature = project.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a.name,
      value: true,
    }));
  }

  if (project.media.heroImage) {
    node.image = resolveImageUrl(project.media.heroImage);
  }

  return node;
}

/**
 * Offer/AggregateOffer — CHỈ sinh khi có giá hợp lệ thật. Không tạo giá giả để "đủ schema".
 * Trả về null nếu không có dữ liệu giá — trang không nhúng khối này.
 */
export function buildOfferJsonLd(project: ProjectWithTier) {
  const table = project.pricing.priceTable;
  if (table && table.length > 0) {
    const offers = table.map((entry) => ({
      "@type": "Offer",
      name: entry.type,
      priceCurrency: "VND",
      price: entry.priceMin,
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: entry.priceMin,
        maxPrice: entry.priceMax,
        priceCurrency: "VND",
      },
    }));
    return {
      "@context": "https://schema.org",
      "@type": "AggregateOffer",
      url: projectUrl(project),
      priceCurrency: "VND",
      lowPrice: Math.min(...table.map((e) => e.priceMin)),
      highPrice: Math.max(...table.map((e) => e.priceMax)),
      offers,
    };
  }

  if (project.pricing.priceMin !== undefined) {
    return {
      "@context": "https://schema.org",
      "@type": "Offer",
      url: projectUrl(project),
      priceCurrency: "VND",
      price: project.pricing.priceMin,
    };
  }

  return null;
}

/**
 * FAQPage — chỉ sinh khi có đủ FAQ đang hiển thị, và PHẢI dùng đúng cùng danh sách
 * mà FAQSection component render. overrideEntries (FAQ do AI sinh, F1) PHẢI được truyền
 * y hệt giá trị đã truyền cho FAQSection ở trang gọi hàm này, để JSON-LD luôn khớp HTML
 * hiển thị — nếu không truyền, fallback về buildFaqEntries như trước F1.
 */
export function buildFaqJsonLd(project: ProjectWithTier, overrideEntries?: FaqEntry[]) {
  const entries = overrideEntries ?? buildFaqEntries(project);
  if (entries.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.answer,
      },
    })),
  };
}
