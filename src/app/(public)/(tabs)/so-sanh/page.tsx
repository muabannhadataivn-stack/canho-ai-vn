"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompareTable } from "@/components/compare/CompareTable";
import { EmptyState } from "@/components/search/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { getSavedProjectIds, SAVED_PROJECTS_EVENT } from "@/lib/saved-projects";
import { fetchComparedProjects } from "@/lib/actions";
import type { ProjectWithTier } from "@/lib/types";

export default function SoSanhPage() {
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

  return (
    <div className="flex flex-col">
      <div className="bg-ink px-4 py-5 text-paper">
        <h1 className="font-display text-[19px] font-bold">So sánh dự án</h1>
        <p className="mt-1 text-[13px] text-paper/60">Lấy 2 dự án đầu tiên trong danh sách Đã lưu</p>
      </div>

      {savedIds === null ? null : <CompareBody savedIds={savedIds} />}
    </div>
  );
}

function CompareBody({ savedIds }: { savedIds: string[] }) {
  const [projects, setProjects] = useState<ProjectWithTier[] | null>(null);

  useEffect(() => {
    if (savedIds.length < 2) {
      setProjects([]);
      return;
    }
    let cancelled = false;
    fetchComparedProjects(savedIds.slice(0, 2)).then((result) => {
      if (!cancelled) setProjects(result);
    });
    return () => {
      cancelled = true;
    };
  }, [savedIds]);

  if (savedIds.length < 2) {
    return (
      <EmptyState
        title="Cần ít nhất 2 dự án đã lưu để so sánh"
        description="Lưu thêm dự án bằng biểu tượng trái tim, sau đó quay lại đây."
        action={
          <LinkButton href="/" variant="primary" className="mt-1">
            Quay lại Khám phá
          </LinkButton>
        }
      />
    );
  }

  if (projects === null) return null;
  if (projects.length < 2) {
    return (
      <EmptyState
        title="Không tìm thấy đủ dữ liệu để so sánh"
        description="Một số dự án đã lưu có thể không còn ở trạng thái công khai."
        action={
          <Link href="/da-luu" className="text-[13.5px] font-semibold text-blueprint">
            Xem danh sách đã lưu
          </Link>
        }
      />
    );
  }

  return <CompareTable projects={[projects[0]!, projects[1]!]} />;
}
