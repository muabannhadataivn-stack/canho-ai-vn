import type { MetadataRoute } from "next";
import { getPublishedProjects, getAllProvinces } from "@/lib/data-source";
import { SITE_URL } from "@/lib/jsonld";
import { PRICE_TIER_LABEL } from "@/lib/price-tier";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/khu-vuc`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/ve-chung-toi`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/nguon-du-lieu`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/dieu-khoan-bao-mat`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/lien-he`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [provinces, publishedProjects] = await Promise.all([getAllProvinces(), getPublishedProjects()]);

  const provinceRoutes: MetadataRoute.Sitemap = provinces.map((p) => ({
    url: `${SITE_URL}/khu-vuc/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const priceTierRoutes: MetadataRoute.Sitemap = Object.keys(PRICE_TIER_LABEL).map((tier) => ({
    url: `${SITE_URL}/muc-gia/${tier}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  // CHỈ dự án publicationStatus === "published" — draft/mock không xuất hiện ở đây,
  // đồng bộ với generateStaticParams của trang chi tiết (lib/data-source.ts).
  const projectRoutes: MetadataRoute.Sitemap = publishedProjects.map((p) => ({
    url: `${SITE_URL}/${p.provinceSlug}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...provinceRoutes, ...priceTierRoutes, ...projectRoutes];
}
