"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "./MapPin";
import { StatusBadge } from "@/components/project/StatusBadge";
import { formatPriceRange } from "@/lib/format";
import type { ProjectWithTier } from "@/lib/types";

// Vị trí ghim trên canvas placeholder được rải đều mang tính minh hoạ (KHÔNG phải toạ độ
// bản đồ thật — chưa nối dịch vụ bản đồ trả phí trong phase này).
const LAYOUT_POSITIONS = [
  { left: "58%", top: "52%" },
  { left: "66%", top: "40%" },
  { left: "38%", top: "62%" },
  { left: "50%", top: "26%" },
  { left: "28%", top: "38%" },
  { left: "74%", top: "60%" },
];

export function MapCanvas({
  projects,
  initialSlug,
}: {
  projects: ProjectWithTier[];
  initialSlug?: string;
}) {
  const withPosition = useMemo(
    () =>
      projects
        .filter((p) => p.location.lat !== undefined && p.location.lng !== undefined)
        .map((p, i) => ({ project: p, pos: LAYOUT_POSITIONS[i % LAYOUT_POSITIONS.length]! })),
    [projects]
  );

  const initialIndex = initialSlug ? withPosition.findIndex((x) => x.project.slug === initialSlug) : -1;
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : withPosition.length > 0 ? 0 : -1);

  const active = activeIndex >= 0 ? withPosition[activeIndex] : undefined;

  if (withPosition.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-[13.5px] text-graphite/50">
        Chưa có dự án nào có toạ độ để hiển thị trên bản đồ.
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-paper-dim">
      <p className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-[11px] text-paper">
        Chạm vào ghim để xem nhanh
      </p>
      {withPosition.map(({ project, pos }, i) => (
        <MapPin
          key={project.id}
          label={initials(project.name)}
          status={project.salesStatus}
          style={pos}
          active={i === activeIndex}
          onClick={() => setActiveIndex(i)}
        />
      ))}

      {active && (
        <div className="absolute inset-x-3 bottom-3 flex gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-lg">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper-dim">
            <Image
              src={active.project.media.heroImage ?? "/images/project-fallback.webp"}
              alt={active.project.media.heroImageAlt ?? `Ảnh minh hoạ dự án ${active.project.name}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <StatusBadge status={active.project.salesStatus} />
            <div className="truncate font-display text-[13.5px] font-bold text-ink">{active.project.name}</div>
            <div className="text-[12px] text-graphite/60">{formatPriceRange(active.project.pricing)}</div>
          </div>
          <Link
            href={`/${active.project.provinceSlug}/${active.project.slug}`}
            className="flex shrink-0 items-center self-center text-[12.5px] font-semibold text-blueprint"
          >
            Xem chi tiết →
          </Link>
        </div>
      )}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w[0] === w[0]?.toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || name.slice(0, 2).toUpperCase();
}
