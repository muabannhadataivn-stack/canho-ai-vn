import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dim text-ink/40">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6" />
          <line x1="13" y1="13" x2="18" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="font-display text-[15px] font-bold text-ink">{title}</div>
      <p className="max-w-[240px] text-[13px] text-graphite/60">{description}</p>
      {action}
    </div>
  );
}
