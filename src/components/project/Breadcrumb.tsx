import Link from "next/link";

interface BreadcrumbProps {
  provinceName: string;
  provinceSlug: string;
  projectName: string;
}

// Breadcrumb HIỂN THỊ THẬT (khác buildBreadcrumbJsonLd trong lib/jsonld.ts — đó là JSON-LD
// ẩn, chỉ máy đọc được). Cùng cấu trúc Trang chủ > {Tỉnh} > {Dự án}, dùng Link thật (client-side
// navigation) — provinceUrl() trong jsonld.ts trả về URL tuyệt đối (có SITE_URL) nên KHÔNG
// dùng ở đây, chỉ hợp cho JSON-LD.
export function Breadcrumb({ provinceName, provinceSlug, projectName }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 px-4 pt-3 text-[11.5px] text-graphite/50">
      <Link href="/" className="hover:text-ink">
        Trang chủ
      </Link>
      <span aria-hidden="true">›</span>
      <Link href={`/${provinceSlug}`} className="hover:text-ink">
        {provinceName}
      </Link>
      <span aria-hidden="true">›</span>
      <span className="truncate text-graphite/70" aria-current="page">
        {projectName}
      </span>
    </nav>
  );
}
