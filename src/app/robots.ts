import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/jsonld";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Middleware chỉ redirect người chưa đăng nhập sang /admin/login (HTTP 200), không trả
      // 404/403 — không có rule này, bot vẫn crawl/index được /admin/login dù không vào được
      // dữ liệu thật bên trong (không phải lỗ hổng bảo mật, chỉ tránh lộ ra kết quả tìm kiếm).
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
