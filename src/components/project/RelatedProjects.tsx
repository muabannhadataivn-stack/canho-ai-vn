import { SpecBlock } from "./SpecBlock";
import { ProjectCard } from "./ProjectCard";
import type { ProjectWithTier } from "@/lib/types";

export function RelatedProjects({
  projects,
  number,
}: {
  projects: ProjectWithTier[];
  number: number;
}) {
  if (projects.length === 0) return null;

  return (
    <SpecBlock number={number} title="Dự án cùng khu vực">
      <div className="space-y-2.5">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </SpecBlock>
  );
}
