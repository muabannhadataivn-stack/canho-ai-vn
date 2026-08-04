import { SpecBlock } from "./SpecBlock";
import type { ProjectWithTier } from "@/lib/types";

export function TimelineSection({ project, number }: { project: ProjectWithTier; number: number }) {
  if (project.timeline.length === 0) return null;

  return (
    <SpecBlock number={number} title="Tiến độ triển khai" id="section-tien-do">
      <div className="space-y-3 rounded-2xl border border-line bg-white p-3.5">
        {project.timeline.map((item, i) => (
          <div key={`${item.label}-${i}`} className="flex items-start gap-2.5">
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.done ? "bg-green" : "border-2 border-line bg-white"}`}
            />
            <div>
              <div className="text-[13.5px] font-semibold text-ink">{item.label}</div>
              <div className="font-mono text-[12px] text-graphite/50">{item.date}</div>
            </div>
          </div>
        ))}
      </div>
    </SpecBlock>
  );
}
