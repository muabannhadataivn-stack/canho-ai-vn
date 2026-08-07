"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "@/components/project/StatusBadge";
import { formatPriceRange } from "@/lib/format";
import type { ProjectWithTier } from "@/lib/types";

// Leaflet đọc window/document ngay lúc import module — BẮT BUỘC ssr:false, nếu không lỗi
// "window is not defined" khi Next.js render lần đầu ở server (Client Component "use client"
// vẫn được server render trước khi hydrate, không phải chỉ chạy ở trình duyệt).
const LeafletMapView = dynamic(() => import("./LeafletMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-[13px] text-graphite/50">Đang tải bản đồ...</div>
  ),
});

export function MapCanvas({
  projects,
  initialSlug,
}: {
  projects: ProjectWithTier[];
  initialSlug?: string;
}) {
  // Chỉ hiển thị dự án có toạ độ thật đã lưu (project_location.lat/lng). LƯU Ý: cột
  // "coords_confidence"/"coords_source" từng có trong CSV nguồn KHÔNG được import vào DB (xem
  // csv-import-actions.ts) — không có dữ liệu nào để phân biệt toạ độ "đã xác thực" hay
  // "placeholder", nên không tự bịa thêm 1 cờ phân loại không tồn tại; mọi toạ độ có trong DB
  // đều coi là thật và hiển thị bình thường.
  const withCoords = useMemo(
    () => projects.filter((p) => p.location.lat !== undefined && p.location.lng !== undefined),
    [projects]
  );

  const initialIndex = initialSlug ? withCoords.findIndex((p) => p.slug === initialSlug) : -1;
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : withCoords.length > 0 ? 0 : -1);

  const active = activeIndex >= 0 ? withCoords[activeIndex] : undefined;

  if (withCoords.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-[13.5px] text-graphite/50">
        Chưa có dự án nào có toạ độ để hiển thị trên bản đồ.
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-paper-dim">
      <LeafletMapView
        projects={withCoords}
        activeId={active?.id ?? null}
        onSelectProject={(id) => {
          const idx = withCoords.findIndex((p) => p.id === id);
          if (idx >= 0) setActiveIndex(idx);
        }}
      />

      <p className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-[11px] text-paper">
        Chạm vào ghim để xem nhanh
      </p>

      {active && (
        <div className="absolute inset-x-3 bottom-3 z-[1000] flex gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-lg">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper-dim">
            <Image
              src={active.media.heroImage ?? "/images/project-fallback.webp"}
              alt={active.media.heroImageAlt ?? `Ảnh minh hoạ dự án ${active.name}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <StatusBadge status={active.salesStatus} />
            <div className="truncate font-display text-[13.5px] font-bold text-ink">{active.name}</div>
            <div className="text-[12px] text-graphite/60">{formatPriceRange(active.pricing)}</div>
          </div>
          <Link
            href={`/${active.provinceSlug}/${active.slug}`}
            className="flex shrink-0 items-center self-center text-[12.5px] font-semibold text-blueprint"
          >
            Xem chi tiết →
          </Link>
        </div>
      )}
    </div>
  );
}
