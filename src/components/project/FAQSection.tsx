import { SpecBlock } from "./SpecBlock";
import { buildFaqEntries } from "@/lib/faq-bank";
import type { ProjectWithTier } from "@/lib/types";

export function FAQSection({ project, number }: { project: ProjectWithTier; number: number }) {
  const entries = buildFaqEntries(project);
  if (entries.length === 0) return null;

  return (
    <SpecBlock number={number} title="Câu hỏi thường gặp">
      <div className="space-y-2.5">
        {entries.map((entry) => (
          <details key={entry.question} className="group rounded-xl border border-line bg-white p-3.5">
            <summary className="cursor-pointer list-none text-[13.5px] font-semibold text-ink marker:content-none">
              {entry.question}
            </summary>
            <p className="mt-2 text-[13px] leading-relaxed text-graphite/70">{entry.answer}</p>
          </details>
        ))}
      </div>
    </SpecBlock>
  );
}
