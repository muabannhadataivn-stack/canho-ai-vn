import { SpecBlock } from "./SpecBlock";
import type { ProjectWithTier } from "@/lib/types";

export function FitForSection({ project, number }: { project: ProjectWithTier; number: number }) {
  if (project.fitFor.length === 0) return null;

  return (
    <SpecBlock number={number} title="Phù hợp với ai">
      <div className="space-y-2">
        {project.fitFor.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 rounded-xl border p-2.5 text-[13px] ${
              item.caution ? "border-gold/40 bg-gold/5 text-ink/80" : "border-line bg-white text-ink/80"
            }`}
          >
            <span className="mt-0.5 shrink-0">{item.caution ? "▲" : "✓"}</span>
            {item.text}
          </div>
        ))}
      </div>
    </SpecBlock>
  );
}
