import { SpecBlock } from "./SpecBlock";
import { buildFaqEntries, type FaqEntry } from "@/lib/faq-bank";
import type { ProjectWithTier } from "@/lib/types";

/**
 * overrideEntries: dùng khi đã có FAQ do AI sinh (Giai đoạn F1, project_ai_content) —
 * nếu không truyền (dự án cũ trước F1), tự fallback về buildFaqEntries như trước.
 */
export function FAQSection({
  project,
  number,
  overrideEntries,
}: {
  project: ProjectWithTier;
  number: number;
  overrideEntries?: FaqEntry[];
}) {
  const entries = overrideEntries ?? buildFaqEntries(project);
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
