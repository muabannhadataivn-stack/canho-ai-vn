import Link from "next/link";
import { SpecBlock } from "./SpecBlock";
import type { ProjectWithTier } from "@/lib/types";

export function LocationSection({ project, number }: { project: ProjectWithTier; number: number }) {
  const address = project.location.address ?? [project.district, project.province].filter(Boolean).join(", ");
  const hasMap = project.location.lat !== undefined && project.location.lng !== undefined;

  return (
    <SpecBlock number={number} title="Vị trí" id="section-vi-tri">
      <div className="space-y-2 rounded-2xl border border-line bg-white p-3.5">
        <Row k="Địa chỉ" v={address || "Đang cập nhật"} />
        {project.location.newAdministrativeArea && (
          <p className="text-[11.5px] italic text-graphite/50">
            Theo địa giới hành chính mới: {project.location.newAdministrativeArea}
          </p>
        )}
        {project.location.commuteNote && <Row k="Di chuyển" v={project.location.commuteNote} />}
        {project.location.nearbyRoutes && project.location.nearbyRoutes.length > 0 && (
          <div>
            <div className="mb-1 text-[12px] text-graphite/50">Tuyến kết nối</div>
            <div className="flex flex-wrap gap-1.5">
              {project.location.nearbyRoutes.map((route) => (
                <span key={route.name} className="rounded-full border border-line px-2.5 py-1 text-[12px] text-ink/80">
                  {route.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasMap && (
        <div className="mt-2.5 overflow-hidden rounded-2xl border border-line">
          {/* Minh hoạ khái quát: chỉ icon + đường nét, không chứa tên riêng để nhân bản
              an toàn cho mọi dự án (xem lưu ý DATA-SCHEMA mục 5). */}
          <div className="relative flex h-32 items-center justify-center bg-blueprint/10">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
              <path d="M32 8a16 16 0 00-16 16c0 12 16 32 16 32s16-20 16-32A16 16 0 0032 8z" stroke="#2C5F8A" strokeWidth="2" />
              <circle cx="32" cy="24" r="6" stroke="#2C5F8A" strokeWidth="2" />
              <path d="M8 54h48" stroke="#5C89AC" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
            <Link
              href={`/ban-do?du-an=${project.slug}`}
              className="absolute bottom-2 right-2 rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-semibold text-paper"
            >
              Xem toàn màn hình
            </Link>
          </div>
        </div>
      )}
    </SpecBlock>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-[13px]">
      <span className="shrink-0 text-graphite/50">{k}</span>
      <span className="text-right font-medium text-ink">{v}</span>
    </div>
  );
}
