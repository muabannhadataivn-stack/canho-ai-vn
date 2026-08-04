import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { SaveHeartButton } from "./SaveHeartButton";
import { formatPriceRange } from "@/lib/format";
import type { ProjectWithTier } from "@/lib/types";

export function ProjectCard({ project }: { project: ProjectWithTier }) {
  const metaLine = project.district ? `${project.district}` : project.province;

  return (
    <Link
      href={`/can-ho/${project.provinceSlug}/${project.slug}`}
      className="group relative flex gap-3 rounded-2xl border border-line bg-white p-2.5 transition-shadow hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-dim">
        <Image
          src={project.media.heroImage ?? "/images/project-fallback.webp"}
          alt={project.media.heroImageAlt ?? `Ảnh minh hoạ dự án ${project.name}`}
          fill
          sizes="80px"
          className="object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <StatusBadge status={project.salesStatus} />
        <div className="truncate font-display text-[15px] font-bold text-ink">{project.name}</div>
        <div className="truncate text-[12.5px] text-graphite/60">{metaLine}</div>
        <div className="text-[13px] font-semibold text-blueprint">{formatPriceRange(project.pricing)}</div>
      </div>
      <div className="absolute right-2 top-2">
        <SaveHeartButton projectId={project.id} />
      </div>
    </Link>
  );
}
