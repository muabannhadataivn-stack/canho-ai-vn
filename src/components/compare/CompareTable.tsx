import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/project/StatusBadge";
import { formatPriceRange } from "@/lib/format";
import type { ProjectWithTier } from "@/lib/types";

const ROWS: { label: string; render: (p: ProjectWithTier) => string }[] = [
  { label: "Trạng thái", render: (p) => "" }, // xử lý riêng vì cần StatusBadge, giữ lại để đồng bộ label
  { label: "Giá tham khảo", render: (p) => formatPriceRange(p.pricing) },
  { label: "Quy mô", render: (p) => p.scale ?? "Đang cập nhật" },
  { label: "Số toà/căn", render: (p) => p.units ?? "Đang cập nhật" },
  {
    label: "Tiện ích nổi bật",
    render: (p) => (p.amenities.length > 0 ? p.amenities.slice(0, 2).map((a) => a.name).join(", ") : "Đang cập nhật"),
  },
];

export function CompareTable({ projects }: { projects: [ProjectWithTier, ProjectWithTier] }) {
  return (
    <div className="p-4">
      <div className="mb-4 grid grid-cols-2 gap-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/can-ho/${p.provinceSlug}/${p.slug}`}
            className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-2.5"
          >
            <div className="relative h-20 w-full overflow-hidden rounded-xl bg-paper-dim">
              <Image
                src={p.media.heroImage ?? "/images/project-fallback.webp"}
                alt={p.media.heroImageAlt ?? `Ảnh minh hoạ dự án ${p.name}`}
                fill
                sizes="180px"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <span className="font-display text-[13px] font-bold leading-tight text-ink">{p.name}</span>
          </Link>
        ))}
      </div>

      <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-graphite/50">Trạng thái</div>
      <div className="mb-3 grid grid-cols-2 gap-3">
        {projects.map((p) => (
          <div key={p.id}>
            <StatusBadge status={p.salesStatus} />
          </div>
        ))}
      </div>

      {ROWS.slice(1).map((row) => (
        <div key={row.label} className="mb-3">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-graphite/50">{row.label}</div>
          <div className="grid grid-cols-2 gap-3">
            {projects.map((p) => (
              <div key={p.id} className="text-[13px] text-ink">
                {row.render(p)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
