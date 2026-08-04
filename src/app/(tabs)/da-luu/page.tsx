"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProjectCard } from "@/components/project/ProjectCard";
import { EmptyState } from "@/components/search/EmptyState";
import { getSavedProjectIds, SAVED_PROJECTS_EVENT } from "@/lib/saved-projects";
import { getAllPublishedForCompare } from "@/lib/data-source";

export default function DaLuuPage() {
  const [savedIds, setSavedIds] = useState<string[] | null>(null);

  useEffect(() => {
    const load = () => setSavedIds(getSavedProjectIds());
    load();
    window.addEventListener(SAVED_PROJECTS_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(SAVED_PROJECTS_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const projects = savedIds ? getAllPublishedForCompare(savedIds) : [];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between bg-ink px-4 py-5 text-paper">
        <h1 className="font-display text-[19px] font-bold">Dự án đã lưu</h1>
        {projects.length >= 2 && (
          <Link href="/so-sanh" className="rounded-full bg-gold px-3.5 py-1.5 text-[12.5px] font-semibold text-ink">
            So sánh
          </Link>
        )}
      </div>

      {savedIds === null ? null : projects.length === 0 ? (
        <EmptyState
          title="Lưu thêm dự án để so sánh"
          description="Nhấn biểu tượng trái tim trên bất kỳ dự án nào để lưu vào đây."
        />
      ) : (
        <div className="flex flex-col gap-2.5 p-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
