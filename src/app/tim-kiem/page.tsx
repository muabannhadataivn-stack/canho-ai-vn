import type { Metadata } from "next";
import { BackButton } from "@/components/layout/BackButton";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPillRow } from "@/components/search/FilterPillRow";
import { EmptyState } from "@/components/search/EmptyState";
import { ProjectCard } from "@/components/project/ProjectCard";
import { searchProjects } from "@/lib/data-source";

export const metadata: Metadata = { title: "Tìm kiếm dự án" };

interface SearchPageProps {
  searchParams: { q?: string; tinh?: string; gia?: string; trangthai?: string };
}

export default function TimKiemPage({ searchParams }: SearchPageProps) {
  const q = searchParams.q ?? "";
  const provinces = searchParams.tinh ? searchParams.tinh.split(",") : [];
  const priceTiers = searchParams.gia ? searchParams.gia.split(",") : [];
  const statuses = searchParams.trangthai ? searchParams.trangthai.split(",") : [];
  const activeCount = provinces.length + priceTiers.length + statuses.length;

  const results = searchProjects({ q, provinces, priceTiers, statuses });

  const queryString = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => !!v) as [string, string][]
  ).toString();

  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="flex shrink-0 flex-col gap-3 bg-ink px-4 pb-3 pt-4 text-paper">
        <div className="flex items-center gap-2.5">
          <BackButton />
          <h1 className="font-display text-[17px] font-bold">Tìm kiếm dự án</h1>
        </div>
        <SearchBar initialQuery={q} />
      </div>
      <FilterPillRow activeCount={activeCount} queryString={queryString} />
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="font-mono text-[12px] text-graphite/50">{results.length} dự án phù hợp</span>
        </div>
        <div className="flex flex-col gap-2.5 p-4">
          {results.length === 0 ? (
            <EmptyState
              title="Không tìm thấy dự án phù hợp"
              description="Thử từ khoá khác hoặc bỏ bớt bộ lọc đang áp dụng."
            />
          ) : (
            results.map((p) => <ProjectCard key={p.id} project={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
