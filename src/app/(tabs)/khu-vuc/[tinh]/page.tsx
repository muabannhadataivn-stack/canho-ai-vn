import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { ProjectCard } from "@/components/project/ProjectCard";
import { EmptyState } from "@/components/search/EmptyState";
import { getAllProvinces, getProjectsByProvince } from "@/lib/data-source";

export function generateStaticParams() {
  return getAllProvinces().map((p) => ({ tinh: p.slug }));
}

export function generateMetadata({ params }: { params: { tinh: string } }): Metadata {
  const province = getAllProvinces().find((p) => p.slug === params.tinh);
  if (!province) return {};
  return { title: `Dự án tại ${province.name}` };
}

export default function KhuVucTinhPage({ params }: { params: { tinh: string } }) {
  const province = getAllProvinces().find((p) => p.slug === params.tinh);
  if (!province) notFound();

  const projects = getProjectsByProvince(params.tinh);

  return (
    <div className="flex flex-col">
      <BackHeader title={province.name} />
      <div className="p-4">
        <p className="mb-3 font-mono text-[12px] text-graphite/50">{projects.length} dự án tại {province.name}</p>
        {projects.length === 0 ? (
          <EmptyState
            title="Chưa có dự án nào tại khu vực này"
            description="Hệ thống sẽ cập nhật khi có dữ liệu mới."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
